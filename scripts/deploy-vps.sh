#!/usr/bin/env bash

set -Eeuo pipefail

APP_NAME="${APP_NAME:-logcell}"
BRANCH="${BRANCH:-main}"
PROJECT_DIR="${PROJECT_DIR:-$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)}"
LOG_DIR="${LOG_DIR:-$PROJECT_DIR/logs}"
LOG_FILE="${LOG_DIR}/deploy.log"

mkdir -p "$LOG_DIR"

timestamp() {
  date '+%Y-%m-%d %H:%M:%S'
}

log() {
  printf '[%s] %s\n' "$(timestamp)" "$*" | tee -a "$LOG_FILE"
}

run_step() {
  local title="$1"
  shift

  local started_at ended_at duration status
  started_at=$(date +%s)

  log ""
  log "==== ${title} ===="
  log "Comando: $*"

  if "$@" 2>&1 | tee -a "$LOG_FILE"; then
    ended_at=$(date +%s)
    duration=$((ended_at - started_at))
    log "OK: ${title} (${duration}s)"
  else
    status=$?
    ended_at=$(date +%s)
    duration=$((ended_at - started_at))
    log "ERRO: ${title} falhou com codigo ${status} (${duration}s)"
    exit "$status"
  fi
}

log ""
log "================ DEPLOY LOGCELL ================"
log "Projeto: ${PROJECT_DIR}"
log "Branch: ${BRANCH}"
log "App PM2: ${APP_NAME}"

cd "$PROJECT_DIR"

run_step "Git fetch" git fetch --all --prune
run_step "Git status antes do deploy" git status --short --branch
run_step "Checkout da branch" git checkout "$BRANCH"
run_step "Atualizacao do codigo" git pull origin "$BRANCH"
run_step "Instalacao de dependencias" npm ci
run_step "Build de producao" npm run build
run_step "Restart no PM2" pm2 restart "$APP_NAME"
run_step "Status final do PM2" pm2 status "$APP_NAME"

log ""
log "Deploy concluido com sucesso."
log "Log completo salvo em: ${LOG_FILE}"
