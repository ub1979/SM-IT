#!/usr/bin/env bash
# Stops the backend, orchestrator and frontend, then Postgres, Redis and Temporal.
# Only touches processes that belong to this folder.
set -uo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"

PID_FILE="$ROOT/.local/app.pid"

# PIDs of app processes from this folder. Patterns name the app's own paths, so they
# never match Postgres or Temporal, whose arguments only mention .local/.
app_pids() {
  pgrep -f "$ROOT/(node_modules/\.bin/(nest|dotenv|next)|apps/(backend|orchestrator|frontend)/)" || true
  # pnpm's parent process and the Next.js server don't show the folder in their arguments.
  local pid
  for pid in $(pgrep -f 'pnpm.*--filter \./apps/orchestrator' || true) \
    $(lsof -tiTCP:3000 -sTCP:LISTEN 2>/dev/null || true) \
    $(lsof -tiTCP:4200 -sTCP:LISTEN 2>/dev/null || true); do
    if lsof -a -p "$pid" -d cwd -Fn 2>/dev/null | grep -q "^n$ROOT"; then
      echo "$pid"
    fi
  done
}

echo "Stopping backend, orchestrator and frontend..."

if [ -f "$PID_FILE" ]; then
  # Signal the whole process group that start.sh created.
  kill -TERM -- "-$(cat "$PID_FILE")" 2>/dev/null || true
fi

for pid in $(app_pids | sort -u); do
  kill -TERM "$pid" 2>/dev/null || true
done

for _ in 1 2 3 4 5 6 7 8 9 10; do
  [ -z "$(app_pids)" ] && break
  sleep 1
done

for pid in $(app_pids | sort -u); do
  kill -KILL "$pid" 2>/dev/null || true
done
rm -f "$PID_FILE"

echo "Stopping services..."
scripts/services.sh stop

left="$(app_pids | sort -u | tr '\n' ' ')"
if [ -n "$left" ]; then
  echo "These app processes are still running: $left" >&2
  exit 1
fi
echo "SM-IT is stopped."
