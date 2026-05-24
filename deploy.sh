#!/bin/bash

echo "🚀 Iniciando deploy automático..."
echo "⏰ $(date)"

# Vai para o diretório da aplicação
cd /home/matheus/apps/LogCell || exit 1

# Guarda o hash atual do package.json
PACKAGE_HASH_BEFORE=$(md5sum package.json 2>/dev/null | awk '{print $1}')

# Atualiza o código do GitHub
echo "📥 Fazendo git pull..."
git pull origin main || git pull origin master

# Verifica se package.json mudou
PACKAGE_HASH_AFTER=$(md5sum package.json 2>/dev/null | awk '{print $1}')

if [ "$PACKAGE_HASH_BEFORE" != "$PACKAGE_HASH_AFTER" ]; then
    echo "📦 package.json mudou, instalando dependências..."
    npm install
else
    echo "✅ package.json não mudou, pulando npm install"
fi

# Faz o build da aplicação
echo "🔨 Fazendo build..."
npm run build

# Reinicia o pm2
echo "♻️  Reiniciando PM2..."
pm2 restart LogCell

echo "✅ Deploy concluído com sucesso!"
echo "⏰ $(date)"
