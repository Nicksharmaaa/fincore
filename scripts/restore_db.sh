#!/usr/bin/env bash
# ==============================================================================
# FINCORE - Automated Database Restore Script (Linux / Docker)
# Usage: ./restore_db.sh <path_to_backup_file>
# ==============================================================================
set -euo pipefail

if [ -z "${1:-}" ]; then
    echo "Usage: $0 <path_to_backup_file>"
    exit 1
fi

BACKUP_FILE="$1"
PG_HOST="${POSTGRES_HOST:-localhost}"
PG_PORT="${POSTGRES_PORT:-5432}"
PG_USER="${POSTGRES_USER:-postgres}"
PG_DB="${POSTGRES_DB:-fincore}"

echo "[FINCORE] WARNING: Restoring from ${BACKUP_FILE} into ${PG_DB} on ${PG_HOST}:${PG_PORT}..."
read -p "Continue with database restore? (y/N) " confirm
if [[ "${confirm}" != [yY] && "${confirm}" != [yY][eE][sS] ]]; then
    echo "Restore aborted."
    exit 0
fi

pg_restore -h "${PG_HOST}" -p "${PG_PORT}" -U "${PG_USER}" -d "${PG_DB}" -v -c "${BACKUP_FILE}"

echo "[FINCORE] Database restore completed successfully."
