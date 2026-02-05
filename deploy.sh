#!/bin/bash

cd /home/matheus/apps/LogCell || exit

# Carregar variáveis do SSH agent
if [ -f ~/.ssh/agent.env ]; then
  source ~/.ssh/agent.env
fi

echo "🚀 Atualizando código..."
git pull origin main

echo "📦 Instalando dependências..."
npm install

echo "🏗️ Build..."
npm run build

echo "♻️ Reiniciando app..."
pm2 restart LogCell

echo "✅ Deploy concluído!"
