#!/usr/bin/env bash
# Starts or stops the local services the app needs (Postgres, Redis, Temporal).
# They run on demand from .local/ in this repo. No Docker, no login services.
#
# Usage: scripts/services.sh start | stop | status
set -euo pipefail

# Postgres on macOS refuses to start ("postmaster became multithreaded") without a valid locale.
export LC_ALL=en_US.UTF-8

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DATA="$ROOT/.local"
PG_BIN="/opt/homebrew/opt/postgresql@17/bin"
PGDATA="$DATA/postgres"
DB_USER="tl_smp"
DB_NAME="tl_smp"

mkdir -p "$DATA/redis" "$DATA/temporal" "$DATA/logs"

start() {
  if [ ! -d "$PGDATA" ]; then
    "$PG_BIN/initdb" -D "$PGDATA" -U "$DB_USER" --auth=trust -E UTF8 >/dev/null
  fi
  if ! "$PG_BIN/pg_ctl" -D "$PGDATA" status >/dev/null 2>&1; then
    "$PG_BIN/pg_ctl" -D "$PGDATA" -l "$DATA/logs/postgres.log" -o "-p 5432 -c listen_addresses=127.0.0.1" -w start >/dev/null
  fi
  "$PG_BIN/psql" -h 127.0.0.1 -U "$DB_USER" -d postgres -tc "SELECT 1 FROM pg_database WHERE datname='$DB_NAME'" | grep -q 1 \
    || "$PG_BIN/createdb" -h 127.0.0.1 -U "$DB_USER" "$DB_NAME"

  if ! redis-cli -p 6379 ping >/dev/null 2>&1; then
    redis-server --port 6379 --bind 127.0.0.1 --dir "$DATA/redis" --daemonize yes \
      --logfile "$DATA/logs/redis.log" --pidfile "$DATA/redis/redis.pid" >/dev/null
  fi

  if ! temporal operator cluster health --address 127.0.0.1:7233 >/dev/null 2>&1; then
    nohup temporal server start-dev --ip 127.0.0.1 --port 7233 --ui-port 8233 \
      --db-filename "$DATA/temporal/temporal.db" --log-level error \
      >"$DATA/logs/temporal.log" 2>&1 &
    echo $! >"$DATA/temporal/temporal.pid"
    for _ in $(seq 1 30); do
      temporal operator cluster health --address 127.0.0.1:7233 >/dev/null 2>&1 && break
      sleep 1
    done
  fi
  status
}

stop() {
  if [ -f "$DATA/temporal/temporal.pid" ]; then
    kill "$(cat "$DATA/temporal/temporal.pid")" 2>/dev/null || true
    rm -f "$DATA/temporal/temporal.pid"
  fi
  redis-cli -p 6379 shutdown nosave >/dev/null 2>&1 || true
  "$PG_BIN/pg_ctl" -D "$PGDATA" -m fast stop >/dev/null 2>&1 || true
  echo "stopped"
}

status() {
  "$PG_BIN/pg_isready" -h 127.0.0.1 -p 5432 || true
  echo "redis: $(redis-cli -p 6379 ping 2>/dev/null || echo down)"
  echo "temporal: $(temporal operator cluster health --address 127.0.0.1:7233 2>/dev/null | tail -1 || echo down) (UI: http://localhost:8233)"
}

case "${1:-}" in
  start) start ;;
  stop) stop ;;
  status) status ;;
  *) echo "usage: $0 start|stop|status"; exit 1 ;;
esac
