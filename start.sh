#!/usr/bin/env bash
# Starts Postgres, Redis and Temporal, then the backend, orchestrator and frontend.
# Safe to run twice: if the app is already up it says so and exits.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"

LOG="$ROOT/.local/logs/app.log"
PID_FILE="$ROOT/.local/app.pid"
FRONTEND_URL="http://localhost:4200"
BACKEND_URL="http://localhost:3000"
TIMEOUT_SECONDS=180

is_up() {
  [ "$(curl -s -o /dev/null -m 5 -w '%{http_code}' "$1" || true)" != "000" ]
}

app_running() {
  [ -f "$PID_FILE" ] && kill -0 "$(cat "$PID_FILE")" 2>/dev/null
}

if [ ! -f .env ]; then
  echo "Missing .env. Copy .env.example to .env and fill it in (see README.md)." >&2
  exit 1
fi
if [ ! -d node_modules ]; then
  echo "Installing dependencies..."
  pnpm install
fi

mkdir -p "$ROOT/.local/logs"

echo "Starting services..."
scripts/services.sh start

# Creates the tables on a new database and adds any new ones to an existing one.
echo "Updating database tables..."
pnpm run prisma-db-push

if is_up "$BACKEND_URL" && is_up "$FRONTEND_URL"; then
  echo "SM-IT is already running at $FRONTEND_URL"
  exit 0
fi

if app_running; then
  echo "SM-IT is still starting, or partly stopped. Run ./stop.sh first if it stays that way." >&2
  exit 1
fi

for port in 3000 4200; do
  if lsof -nP -iTCP:"$port" -sTCP:LISTEN >/dev/null 2>&1; then
    echo "Port $port is in use by another program:" >&2
    lsof -nP -iTCP:"$port" -sTCP:LISTEN >&2
    exit 1
  fi
done

echo "Starting backend, orchestrator and frontend..."
# Job control gives the app its own process group, so stop.sh can stop all of it at once.
set -m
nohup pnpm run --filter ./apps/orchestrator --filter ./apps/backend --filter ./apps/frontend --parallel dev \
  >"$LOG" 2>&1 </dev/null &
APP_PID=$!
set +m
echo "$APP_PID" >"$PID_FILE"

elapsed=0
until is_up "$BACKEND_URL" && is_up "$FRONTEND_URL"; do
  if ! kill -0 "$APP_PID" 2>/dev/null; then
    echo "The app stopped while starting. Last log lines:" >&2
    tail -20 "$LOG" >&2
    exit 1
  fi
  if [ "$elapsed" -ge "$TIMEOUT_SECONDS" ]; then
    echo "The app did not respond within ${TIMEOUT_SECONDS}s. Check $LOG or run ./stop.sh." >&2
    exit 1
  fi
  sleep 2
  elapsed=$((elapsed + 2))
done

echo
echo "SM-IT is running at $FRONTEND_URL"
echo "API: $BACKEND_URL | Temporal UI: http://localhost:8233"
echo "Log: $LOG"
echo "Stop everything with ./stop.sh"
