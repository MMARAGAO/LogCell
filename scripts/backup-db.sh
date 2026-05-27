#!/usr/bin/env bash
set -Eeuo pipefail

# ============================================================
# backup-db.sh - Backup do banco LogCell + envio ao Google Drive
# Local: /home/matheus/supabase/LogCell/
# ============================================================

BACKUP_DIR="/home/matheus/supabase/LogCell/backups"
RETENTION_DAYS=7
DATE=$(date +%Y-%m-%d_%H-%M-%S)
FILENAME="logcell-db-$DATE.sql.gz"
LOG_FILE="$BACKUP_DIR/backup.log"

mkdir -p "$BACKUP_DIR"

log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" | tee -a "$LOG_FILE"
}

log "=== Iniciando backup ==="

# 1. Backup via Docker (pg_dump dentro do container supabase-db)
DB_CONTAINER=$(docker ps --format '{{.Names}}' | grep -E 'supabase-db|db' | head -1)

if [ -n "$DB_CONTAINER" ]; then
  log "Container encontrado: $DB_CONTAINER"
  docker exec "$DB_CONTAINER" pg_dump -U postgres -d postgres --clean --if-exists \
    2>> "$LOG_FILE" | gzip > "$BACKUP_DIR/$FILENAME"
else
  # Fallback: conexão direta (caso não encontre o container)
  log "Container não encontrado, tentando conexão direta localhost:54322"
  PGPASSWORD=postgres pg_dump -h localhost -p 54322 -U postgres -d postgres --clean --if-exists \
    2>> "$LOG_FILE" | gzip > "$BACKUP_DIR/$FILENAME"
fi

# Verifica se o backup foi criado
if [ ! -f "$BACKUP_DIR/$FILENAME" ]; then
  log "ERRO: Arquivo de backup não foi criado"
  exit 1
fi

SIZE_MB=$(du -m "$BACKUP_DIR/$FILENAME" | cut -f1)
log "Backup gerado: $FILENAME (${SIZE_MB}MB)"

# 2. Envia para o Google Drive via rclone
if command -v rclone &> /dev/null; then
  log "Enviando para Google Drive..."
  if rclone copy "$BACKUP_DIR/$FILENAME" "gdrive:LogCell-Backups/" 2>> "$LOG_FILE"; then
    log "Upload concluído: $FILENAME"
  else
    log "ERRO no upload para Google Drive"
  fi
else
  log "rclone não encontrado. Backup salvo apenas localmente em $BACKUP_DIR/$FILENAME"
fi

# 3. Remove backups locais antigos
log "Limpando backups locais com mais de $RETENTION_DAYS dias..."
find "$BACKUP_DIR" -name "*.sql.gz" -mtime +$RETENTION_DAYS -delete

log "=== Backup concluído com sucesso ==="
log ""
