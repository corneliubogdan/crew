#!/usr/bin/env bash
# Nightly-ish local dump onto this box. Not offsite. Not HA.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
mkdir -p backups
STAMP="$(date +%Y%m%d-%H%M%S)"
OUT="backups/crew-${STAMP}.sql.gz"

if docker compose ps postgres --status running >/dev/null 2>&1; then
  docker compose exec -T postgres pg_dump -U crew crew | gzip > "$OUT"
else
  echo "postgres container is not running" >&2
  exit 1
fi

# keep last 14 dumps
ls -1t backups/crew-*.sql.gz 2>/dev/null | tail -n +15 | xargs -r rm --

echo "wrote $OUT"
