#!/usr/bin/env bash
# ==============================================================================
# FINCORE - Automated Database Backup Script (Linux / Docker)
# ==============================================================================
set -euo pipefail

PG_HOST="${POSTGRES_HOST:-localhost}"
PG_PORT="${POSTGRES_PORT:-5432}"
PG_USER="${POSTGRES_USER:-postgres}"
PG_DB="${POSTGRES_DB:-fincore}"
BACKUP_DIR="${BACKUP_DIR:-./backups}"

mkdir -p "${BACKUP_DIR}"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/fincore_backup_${TIMESTAMP}.dump"

echo "[FINCORE] Exporting PostgreSQL schema and data for '${PG_DB}'..."
pg_dump -h "${PG_HOST}" -p "${PG_PORT}" -U "${PG_USER}" -F c -b -v -f "${BACKUP_FILE}" "${PG_DB}"

echo "[FINCORE] Backup successfully created at: ${BACKUP_FILE}"
ls -lh "${BACKUP_FILE}"
