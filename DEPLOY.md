# Runbook de Deploy — LogCell

Passo a passo para subir o código para a VPS de produção. **Sempre seguir esta ordem.**
Quando o usuário pedir "fazer o deploy", analisar este arquivo e executar os passos.

---

## Infraestrutura (fatos fixos)

| Item | Valor |
|---|---|
| Acesso à VPS | `ssh vps` |
| Diretório do projeto na VPS | `/home/matheus/apps/LogCell` |
| Processo PM2 | `LogCell` |
| Branch de produção | `main` |
| Remote git | `github.com:MMARAGAO/LogCell.git` |
| Build script | `npm run build` (= `next build && node scripts/generate-build-version.js`) |
| Banco | Supabase self-hosted na VPS — container `supabase_db_LogCell` (host: `supabase.mmaragao.cloud`) |

> ⚠️ **Banco é ÚNICO e compartilhado** (o app local e o de produção apontam para o mesmo Supabase). O deploy sobe **apenas código**. Mudanças de banco (tabelas/RLS/funções) **não estão versionadas no repo** — são aplicadas direto via `docker exec ... psql` (ver seção "Mudanças de banco").

---

## 1. Pré-deploy (LOCAL) — validar antes de commitar

```bash
cd /Users/mmaragao/Documents/Projetos/LogCell
npx tsc --noEmit            # 0 erros
npx eslint <arquivos>       # 0 erros (warnings pré-existentes ok)
npm run build               # ✓ Compiled successfully
```

Só prosseguir se os três passarem.

## 2. Commit + push (LOCAL)

```bash
git status --short          # revisar o que vai subir
git add -A
git commit -m "<mensagem clara do que mudou>
...
Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
git push origin main
```

- Commitar na branch `main` (a VPS faz pull de `main`).
- Mensagem deve resumir as mudanças; terminar com a linha `Co-Authored-By`.

## 3. Deploy na VPS — pull + build

```bash
# Descartar o build-version.json auto-gerado (senão o pull dá conflito)
ssh vps "cd /home/matheus/apps/LogCell && \
  git checkout -- public/build-version.json && \
  git pull origin main && \
  git log --oneline -1"
```

Confirmar que o `git log` mostra o commit que acabou de subir.

```bash
# Build na VPS (passo mais demorado — ~2 a 3 min)
ssh vps "cd /home/matheus/apps/LogCell && npm run build 2>&1 | \
  grep -iE 'error|failed|Compiled|Generating|Cannot find module' | tail -12; \
  echo BUILD_EXIT=\${PIPESTATUS[0]}"
```

**Só reiniciar o PM2 se `BUILD_EXIT=0` e aparecer `✓ Compiled successfully`.** Se o build falhar, NÃO reiniciar (o app antigo continua no ar).

## 4. Reiniciar o PM2

```bash
ssh vps "pm2 restart LogCell --update-env && pm2 list | grep -i LogCell"
```

## 5. Health check

```bash
ssh vps "sleep 4; \
  pm2 list | grep -i LogCell;                                   # status online, uptime crescendo, ↺ estável \
  curl -s -o /dev/null -w 'HTTP %{http_code}\n' http://localhost:3000;  # 200/307 = ok \
  pm2 logs LogCell --lines 8 --nostream --err | tail"
```

Sinais de sucesso:
- PM2 `online`, **uptime crescendo** e contador de restart `↺` **estável** (não subindo em loop).
- HTTP **200** ou **307** (307 = redirect normal da raiz).
- Sem erros novos no log (timestamps antigos + warning de TLS são pré-existentes).

---

## Rollback (se algo quebrar)

```bash
# Voltar para o commit anterior na VPS e rebuildar
ssh vps "cd /home/matheus/apps/LogCell && \
  git reset --hard HEAD~1 && \
  npm run build && \
  pm2 restart LogCell --update-env"
```
(Se o problema for de banco, reverter a alteração SQL correspondente — ver abaixo.)

---

## Mudanças de banco (quando a feature precisar)

O deploy de código **não** aplica mudanças de banco. Quando houver:

```bash
# Aplicar SQL direto no Postgres da VPS (exemplo)
ssh vps "cat /tmp/minha_migracao.sql | docker exec -i supabase_db_LogCell psql -U postgres -d postgres"

# Se criar/alterar função RPC, recarregar o schema do PostgREST:
ssh vps "docker exec -i supabase_db_LogCell psql -U postgres -d postgres -c \"NOTIFY pgrst, 'reload schema';\""
```

Boas práticas:
- Validar lógica nova de RLS/policy dentro de `BEGIN; ... ROLLBACK;` antes do `CREATE` definitivo.
- Guardar o SQL original (para rollback) antes de trocar policies.
- Idealmente, versionar o SQL num arquivo `.sql` no repo (débito atual: as mudanças de banco já feitas não estão versionadas).

---

## Checklist rápido (resumo)

- [ ] `tsc` + `eslint` + `npm run build` locais OK
- [ ] `git add -A && commit && push origin main`
- [ ] VPS: `checkout build-version.json` → `git pull` → confere `git log`
- [ ] VPS: `npm run build` → `BUILD_EXIT=0`
- [ ] VPS: `pm2 restart LogCell`
- [ ] Health check (pm2 online + HTTP 200/307 + sem erro novo)
- [ ] (Se aplicável) mudanças de banco aplicadas via `psql` + reload do schema
