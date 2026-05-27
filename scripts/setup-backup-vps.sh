#!/usr/bin/env bash
# ============================================================
# setup-backup-vps.sh - Configura backup automático do banco
# Execute na VPS como usuário matheus
# ============================================================

set -Eeuo pipefail

log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*"
}

log "=== Instalação do rclone ==="

# 1. Instala rclone
if ! command -v rclone &> /dev/null; then
  log "Instalando rclone..."
  curl -fsSL https://rclone.org/install.sh | sudo bash
else
  log "rclone já instalado: $(rclone --version | head -1)"
fi

# 2. Verifica se o Google Drive já está configurado
if rclone listremotes 2>/dev/null | grep -q "gdrive:"; then
  log "Remote gdrive já configurado"
else
  log ""
  log "============================================================"
  log "CONFIGURE O GOOGLE DRIVE NO RCLONE"
  log "============================================================"
  log "Execute manualmente:"
  log "  rclone config"
  log ""
  log "Passos:"
  log "  n) New remote"
  log "  name: gdrive"
  log "  tipo: drive"
  log "  client_id: (deixe em branco para usar padrão)"
  log "  client_secret: (deixe em branco)"
  log "  scope: drive.file"
  log "  root_folder_id: (deixe em branco)"
  log "  service_account_file: (deixe em branco)"
  log "  Escolha: N) No advanced config"
  log "  Escolha: Y) Yes, use auto config"
  log "  (isso vai abrir o navegador para autenticar)"
  log "  Escolha: q) Quit config"
  log ""
  log "Após configurar, execute este script novamente."
  log "============================================================"
  exit 0
fi

# 3. Copia o script de backup para o local correto
log "Instalando script de backup..."
cp "$(dirname "$0")/backup-db.sh" /home/matheus/supabase/LogCell/backup-db.sh
chmod +x /home/matheus/supabase/LogCell/backup-db.sh

# 4. Cria pasta no Google Drive
log "Criando pasta LogCell-Backups no Google Drive..."
rclone mkdir "gdrive:LogCell-Backups" 2>/dev/null || true

# 5. Testa o backup
log ""
log "=== Testando backup ==="
if /home/matheus/supabase/LogCell/backup-db.sh; then
  log "Backup de teste concluído!"
else
  log "ERRO no backup de teste. Verifique os logs."
  exit 1
fi

# 6. Configura cron diário (03:00)
log ""
log "=== Configurando cron diário às 03:00 ==="
CRON_JOB="0 3 * * * /home/matheus/supabase/LogCell/backup-db.sh >> /home/matheus/supabase/LogCell/backups/backup.log 2>&1"

# Verifica se já existe
if crontab -l 2>/dev/null | grep -q "backup-db.sh"; then
  log "Cron job já configurado, pulando"
else
  (crontab -l 2>/dev/null; echo "$CRON_JOB") | crontab -
  log "Cron adicionado: 0 3 * * * backup-db.sh"
fi

log ""
log "========================================"
log "✅ Configuração concluída!"
log "========================================"
log "Próximo backup automático: 03:00 (horário do servidor)"
log "Logs: /home/matheus/supabase/LogCell/backups/backup.log"
log ""
log "Para testar novamente: /home/matheus/supabase/LogCell/backup-db.sh"
log "Para ver cron: crontab -l"
log "Para ver logs do rclone: rclone -v --log-file=/tmp/rclone.log ..."
