# 📋 ESTRUTURA DO PROJETO LOGCELL

## 🎯 Objetivo
Manter repositório GitHub limpo (~15-20 MB) e organizar arquivos de forma profissional.

---

## 📂 PASTAS & ARQUIVOS

### ✅ FAZER COMMIT NO GITHUB

```
app/                    → Código da aplicação Next.js
components/             → Componentes React reutilizáveis
lib/                    → Funções utilitárias e helpers
hooks/                  → Custom React hooks
contexts/               → React Context API
config/                 → Configurações da aplicação
types/                  → Tipos TypeScript
public/                 → Arquivos estáticos (imagens, etc)
package.json            → Dependências (SEMPRE fazer commit)
tsconfig.json          → TypeScript config
next.config.js         → Next.js config
.gitignore             → Arquivos a ignorar (atualizado)
README.md              → Documentação do projeto
```

### ❌ NÃO FAZER COMMIT NO GITHUB

```
node_modules/                 → 1.3GB (reinstalado com npm install)
.next/                        → Build artifacts (gerado localmente)
.env.local                    → Credenciais (SUPER CRÍTICO)
ConfigBdSupabase.json         → Credenciais do banco (SUPER CRÍTICO)
*.pem, *.key                  → Certificados (NUNCA fazer commit)
MeuBanco.sql                  → Dump do banco (muito grande)
EXECUTAR_COR_SUPABASE.sql    → Scripts temporários
resultado_funcao.sql          → Scripts temporários
migrations/                   → Pode ficar local ou em script separado
```

---

## 📊 TAMANHO & PERFORMANCE

| Item | Tamanho | Ação |
|------|---------|------|
| **Projeto Completo** | 1.3 GB | Local |
| **Sem node_modules** | 84 MB | Inclui credenciais |
| **GitHub (limpo)** | 15-20 MB | ✅ Otimizado |
| **Redução** | 98% | 🚀 Excelente |

---

## 🔐 CREDENCIAIS - COMO GERENCIAR

### Opção 1: Arquivo .env (RECOMENDADO)
```bash
# .env.local (NUNCA fazer commit - está no .gitignore)
NEXT_PUBLIC_SUPABASE_URL=https://logcell.com.br
NEXT_PUBLIC_SUPABASE_KEY=seu-key-aqui
DATABASE_URL=postgresql://...
```

### Opção 2: Variáveis de Ambiente (CI/CD)
```bash
# No servidor/GitHub Actions, defina como variáveis
export NEXT_PUBLIC_SUPABASE_URL="..."
export DATABASE_URL="..."
```

### Opção 3: .env.example (FAZER COMMIT)
```bash
# .env.example - Template sem valores reais
NEXT_PUBLIC_SUPABASE_URL=https://your-url.supabase.co
NEXT_PUBLIC_SUPABASE_KEY=your-key-here
DATABASE_URL=postgresql://user:pass@localhost:5432/db
```

---

## 🚀 WORKFLOW RECOMENDADO

### 1. Ao começar desenvolvimento
```bash
git clone https://github.com/seu-user/LogCell.git
cd LogCell
npm install  # Instala node_modules automaticamente
cp .env.example .env.local
# Editar .env.local com credenciais LOCAIS
npm run dev
```

### 2. Ao fazer commit
```bash
# Verificar o que vai ser commitado
git status

# Verificar que credenciais não estão sendo commitadas
git diff --cached | grep -i "password\|token\|secret" || echo "✅ Seguro"

# Fazer commit normalmente
git add .
git commit -m "feat: descrição da mudança"
git push
```

### 3. Deploy no servidor
```bash
# No servidor
git clone https://github.com/seu-user/LogCell.git
cd LogCell
npm install
cp /home/matheus/.env.local .env.local  # Restaurar do backup seguro
npm run build
pm2 restart LogCell
```

---

## 📋 .gitignore - O Que Está Sendo Ignorado

### Crítico (Segurança)
- `.env*` - Variáveis de ambiente
- `*.pem`, `*.key` - Certificados e chaves
- `ConfigBdSupabase.json` - Credenciais do banco

### Build & Dependencies (Tamanho)
- `node_modules/` - 1.3 GB, reinstalado com npm install
- `.next/` - Build artifacts
- `/out/`, `/build/` - Saídas de compilação

### Temporários & Logs
- `*.log` - Logs da aplicação
- `logs/`, `tmp/`, `debug/` - Pastas temporárias
- `*.bak`, `*.tmp` - Backups temporários

---

## 📝 EXEMPLO: PRIMEIRO COMMIT

```bash
# 1. Limpar node_modules (opcional, será ignorado anyway)
rm -rf node_modules

# 2. Verificar .gitignore
cat .gitignore | head -50

# 3. Status antes
git status

# 4. Adicionar tudo (menos ignorados)
git add .

# 5. Verificar o que vai ser commitado
git status

# ✅ Deve mostrar APENAS:
# - app/, components/, lib/, hooks/, etc
# - package.json, tsconfig.json, next.config.js
# - public/ (sem node_modules)

# 6. Commit
git commit -m "Initial commit: LogCell migration complete"
git push origin main
```

---

## 🔄 SINCRONIZAR ENTRE SERVIDOR E GITHUB

### Cenário 1: Desenvolveu localmente, quer mandar para servidor
```bash
# Local
git add .
git commit -m "feature: nova funcionalidade"
git push

# No servidor
cd /home/matheus/apps/LogCell
git pull
npm install  # Se package.json mudou
pm2 restart LogCell
```

### Cenário 2: Atualizou servidor, quer manter no GitHub
```bash
# No servidor, commitar aprimoramentos
git add lib/ components/ app/
git commit -m "fix: bug na validação"
git push

# Localmente
git pull
npm install
npm run dev
```

---

## ⚠️ SEGURANÇA - CHECKLIST

- [ ] `.env.local` está em `.gitignore` (NUNCA fazer commit)
- [ ] `ConfigBdSupabase.json` está ignorado
- [ ] Certificados (`.pem`, `.key`) estão ignorados
- [ ] Executar `git status` antes de cada push
- [ ] Credenciais salvas em lugar seguro (backup)
- [ ] README.md tem instruções de setup

---

## 📚 COMANDOS ÚTEIS

```bash
# Ver tamanho do repositório
du -sh .git/

# Ver arquivos que serão commitados
git ls-files

# Ver arquivos ignorados
git status --ignored

# Remover arquivo do git (sem deletar localmente)
git rm --cached arquivo.pem
git commit -m "Remove secret file"

# Ver histórico de commits
git log --oneline | head -20

# Reverter último commit (não feito push)
git reset --soft HEAD~1
```

---

## ✅ RESULTADO FINAL

- **GitHub Repo:** ~15-20 MB ✅
- **Clone Speed:** ~1 segundo ✅
- **Segurança:** 100% (sem credenciais) ✅
- **Desenvolvimento:** Fácil setup com `npm install` ✅
- **Deploy:** Simples com `git pull` ✅
