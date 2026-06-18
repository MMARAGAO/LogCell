# Plano: Múltiplas Lojas por Usuário

**Objetivo:** permitir que o administrador atribua **N lojas** a um mesmo usuário (hoje é 1 loja por usuário, exceto admins com "todas"). O usuário passa a ver/operar os dados de **todas** as suas lojas, em **toda a aplicação**.

**Restrição inegociável:** sistema **em produção**. Toda mudança deve ser **aditiva e retrocompatível**, sem janela de parada, com a propriedade de que **para quem tem 1 loja o comportamento permanece idêntico**. A capacidade nova só "liga" quando o admin atribui a 2ª loja a alguém.

> Documento de planejamento. **Nada foi alterado** na geração deste MD (apenas leituras de código e consultas read-only no banco).

---

## 1. Princípio central de segurança (o que torna isto seguro em produção)

1. **Aditivo no banco:** adicionar `loja_ids int[]` em `permissoes` **sem remover** `loja_id`. Os dois coexistem.
2. **No-op para 1 loja:** trocar `.eq("loja_id", X)` por `.in("loja_id", [X])` é funcionalmente idêntico quando a lista tem 1 item. Na RLS, `loja_id = minha_loja` vira `loja_id = ANY(minhas_lojas)` — idêntico quando o array tem 1 elemento.
3. **Flip por usuário:** enquanto ninguém tiver 2 lojas, tudo continua como hoje. A multi-loja só se manifesta ao atribuir a 2ª loja (último passo).
4. **Cada fase é estável:** dá para pausar em qualquer fase sem deixar o sistema num estado quebrado.

### 1.1 Realidade da infraestrutura: BANCO ÚNICO (local + produção)

> **Esclarecimento crítico para "não parar a produção".**

- O app **local (Mac)** e o app de **produção (VPS)** apontam para o **MESMO** Supabase: `NEXT_PUBLIC_SUPABASE_URL = supabase.mmaragao.cloud` → container `supabase_db_LogCell` na VPS.
- **RLS, tabelas, triggers e funções vivem no banco**, que é compartilhado. Portanto:
  - ❌ **Não existe** "RLS novo no local / RLS antigo na VPS". Qualquer `CREATE/ALTER POLICY` vale para os dois **imediatamente**.
  - ❌ RLS **não viaja** com o deploy do Next. O deploy controla **só o código** (front-end).
  - ✅ O que **diverge** entre local e produção é apenas o **código** — esse sim você desenvolve local e libera no deploy.

**Como mudar o banco compartilhado sem parar a produção:**

1. **RLS no-op por design.** As policies do Mecanismo A passam de `loja_id = X` para `loja_id = ANY(loja_ids)`. Como hoje todo array tem 1 elemento, `= ANY([X])` é **idêntico** a `= X` → produção segue igual. Para blindar nos dois estados (com/sem a coluna nova preenchida), escrever tolerante:
   ```sql
   ... OR <tabela>.loja_id = ANY(COALESCE(loja_ids, ARRAY[loja_id]))
   ```
2. **Validação sem persistir (testar "em produção" sem afetar):** rodar a lógica da policy nova dentro de `BEGIN; ... ROLLBACK;`, simulando o usuário, conferir o resultado e desfazer. Só fazer o `CREATE POLICY` definitivo após comprovar que é no-op. (Mesma técnica já usada no trigger da bancada.)
3. **Aplicar uma vez** no banco compartilhado → vale para local e produção, sem janela de parada.

**O que diverge pelo deploy (código):** hooks (`usePermissoes`/`useLojaFilter`) e telas (`.eq`→`.in`). Tudo no-op para 1 loja → seguro liberar a qualquer momento.

**Única mudança que altera comportamento atual:** endurecer o RLS quebrado das **vendas** (Mecanismo B). Para o app normal nada muda (ele já filtra no front); fecha apenas o acesso direto à API a outras lojas. Tratado **por último**, com transação + cobaia.

**Opcional (isolamento real):** se quiser testar a migração totalmente fora de produção, seria preciso um **2º Supabase de staging** (outro banco). Sem isso, o caminho no-op acima é o mais seguro com o banco atual.

**Resumo de uma linha:** banco é único → não dá para separar RLS local/VPS; mas como o RLS novo é **no-op para 1 loja**, aplicá-lo no banco compartilhado **não para nada**. O deploy controla só o código.

---

## 2. Como funciona hoje (estado atual)

### 2.1 Vínculo usuário ↔ loja
- Tabela **`permissoes`**: `usuario_id (uuid)`, `permissoes (jsonb)`, **`loja_id (int, ÚNICO)`**, `todas_lojas (bool)`.
- `loja_id = X` → usuário opera só na loja X. `todas_lojas = true` → admin, vê tudo.

### 2.2 Hooks (camada de aplicação)
- **`hooks/usePermissoes.tsx`** → lê `loja_id`/`todas_lojas` e expõe `lojaId: number|null`, `todasLojas: boolean`, `temAcessoLoja(id)`.
- **`hooks/useLojaFilter.ts`** (peça central):
  - `getLojaFilter()` → retorna **1** loja (ou `null` p/ admin).
  - `aplicarFiltroLoja(query)` → `query.eq("loja_id", lojaId)`.
  - `temAcessoLoja(id)` → `lojaId === id`.

### 2.3 Modal de permissões
- **`components/usuarios/PermissoesModal.tsx`** → `Select` de **uma** loja (`lojaSelecionada: number|null`) + toggle `todasLojas`. Grava `loja_id` + `todas_lojas`.

### 2.4 Alcance
- **~64 arquivos** consomem `lojaId`/`todasLojas`/`useLojaFilter`.

---

## 3. Inventário do BANCO (VPS — Supabase self-hosted, container `supabase_db_LogCell`)

### 3.1 Tabelas com coluna de loja (alvo do filtro)
**Coluna `loja_id`:** `alertas_estoque_controle`, `aparelhos`, `brindes_aparelhos`, `caixas`, `centro_custos`, `contas_lojas`, `contas_lojas_recorrentes`, `devolucoes_aparelhos`, `historico_lojas`, `impostos_contas`, `lojas_fotos`, `metas_usuarios`, `notificacoes`, `permissoes`, `rmas`, `taxas_cartao`, `trocas_produtos`, `vendas`.

**Coluna `id_loja`:** `clientes`, `estoque_lojas`, `folhas_salariais`, `historico_estoque`, `ordem_servico`, `ordem_servico_aparelhos`, `ordem_servico_caixa`, `ordem_servico_pecas`, `quebra_pecas`, `tecnicos`.

**`transferencias`:** `loja_origem_id` + `loja_destino_id`.

> ⚠️ Inconsistência de nomenclatura: parte usa `loja_id`, parte `id_loja`. As tabelas `_recovery_*` são backups — ignorar. `vw_historico_lojas` é view.

### 3.2 RLS — há DOIS mecanismos (atenção!)

**Mecanismo A — via `permissoes` (correto, escopa por loja):**
Usado em: `aparelhos` (insert/update/delete), `fotos_aparelhos` (select/insert/delete), `taxas_cartao` (select/insert/update/delete), `transferencias` (select), `transferencias_itens` (select), `trocas_produtos` (select/insert).
Padrão:
```sql
EXISTS (SELECT 1 FROM permissoes
        WHERE usuario_id = auth.uid()
          AND (todas_lojas = true OR loja_id = <tabela>.loja_id)
          AND <permissao jsonb>)
```
→ **Mudança:** `loja_id = <tabela>.loja_id` vira `<tabela>.loja_id = ANY(loja_ids)`.

**Mecanismo B — via subquery em `usuarios` (QUEBRADO / no-op):**
Usado em: `vendas` (select/insert), `itens_venda`, `pagamentos_venda`, `descontos_venda`, `devolucoes_venda`, `historico_vendas`, `itens_devolucao`.
Padrão:
```sql
loja_id IN (SELECT vendas.loja_id FROM usuarios WHERE usuarios.id = auth.uid())
```
🔴 **A tabela `usuarios` não tem coluna de loja.** O `vendas.loja_id` dentro do subquery é uma referência **correlacionada** à linha externa → a condição vira `loja_id IN (loja_id)` = **sempre verdadeira** para qualquer usuário autenticado. **Ou seja: essas policies NÃO filtram por loja hoje.** O escopo de loja das vendas é feito **só no front-end** (`.eq("loja_id", lojaId)`).
→ **Mudança:** reescrever para o Mecanismo A (`= ANY(loja_ids)`). Isso **corrige uma falha de segurança existente** E habilita multi-loja de uma vez.

> Total: **~24 policies** em ~14 tabelas mencionam loja. Várias tabelas com `loja_id`/`id_loja` (ex.: `ordem_servico`, `estoque_lojas`, `clientes`, `caixas`, `metas_usuarios`) **não têm policy por loja** — o escopo delas é só client-side. Decidir, por tabela, se queremos endurecer a RLS junto (recomendado para vendas/itens_venda/pagamentos por causa do furo acima).

### 3.3 Itens de banco a confirmar na implementação
- Conferir se há **triggers/functions** que leem `permissoes.loja_id` (além das policies).
- Conferir **publicação de realtime** (quais tabelas) para alinhar filtros.
- Backups `_recovery_*`: fora de escopo.

---

## 4. Inventário do FRONT-END (checklist por padrão)

### 4.1 Hooks (núcleo — mudar primeiro)
- [ ] `hooks/usePermissoes.tsx` → expor `lojaIds: number[]` (= `loja_ids ?? [loja_id]`); `temAcessoLoja` por `includes`.
- [ ] `hooks/useLojaFilter.ts` → `aplicarFiltroLoja` usa `.in`; `getLojaFilter()` retorna `number[]|null`; `temAcessoLoja` por `includes`.

### 4.2 Telas que usam `aplicarFiltroLoja` (corrigidas centralmente)
- `app/sistema/caixa/page.tsx`
- `app/sistema/vendas/page.tsx`

### 4.3 Arquivos com `.eq(...loja..., lojaId)` direto (trocar p/ `.in`)
- `app/sistema/devolucoes/page.tsx`
- `app/sistema/ordem-servico/page.tsx`
- `app/sistema/usuarios/actions/metas.ts` (server action)
- `app/sistema/vendas/page.tsx`
- `components/ordem-servico/OrdemServicoFormModal.tsx`
- `components/ordem-servico/AdicionarPecaModal.tsx`
- `components/vendas/HistoricoTrocas.tsx`
- `components/vendas/TrocarProdutoModal.tsx`
- `components/rma/FormularioRMA.tsx`
- `services/historicoEstoqueService.ts`
- `services/estoqueService.ts`
- `services/metasService.ts`
- `services/dashboardAparelhosService.ts`
- `services/caixaService.ts`
- `services/caixaAparelhosService.ts`
- `services/financeiroService.ts`
- `services/aparelhosService.ts`
- `services/lojasFotosService.ts`

> Obs.: a maioria dos services recebe `lojaId`/`id_loja` por parâmetro. A assinatura passa a aceitar `number[]` (ou um util que normaliza). Auditar caso a caso na Fase 3.

### 4.4 Realtime (filtro `loja_id=eq` → `loja_id=in.(...)`)
- `app/sistema/vendas/page.tsx`
- (auditar outras telas com `.channel(...).on('postgres_changes', { filter: 'loja_id=eq...' })`)

### 4.5 `temAcessoLoja` (validação de acesso a uma loja)
- `components/vendas/NovaVendaModal.tsx`

### 4.6 Dropdowns/filtros de loja por tela
- Telas com seletor de loja (admin) precisam listar **as lojas do usuário** e default "todas as minhas". Auditar telas que têm `filtroLoja`/Select de loja (ex.: vendas linha ~305, OS, estoque, caixa, dashboard).

### 4.7 Criação ("em qual loja lança") — ponto de maior atenção de UX
- Hoje a criação usa a loja única automaticamente. Com N lojas, é preciso **escolher**.
- **Recomendado:** seletor de loja nos modais de criação que **só aparece quando `lojaIds.length > 1`** (quem tem 1 loja não vê → zero mudança).
- Auditar onde `loja_id`/`id_loja` é setado no insert: venda, OS, aparelho, estoque, caixa, transferência, RMA, conta de loja, etc.

---

## 5. Decisões de design (confirmar antes de começar)

| # | Decisão | Recomendação | Status |
|---|---------|--------------|--------|
| 1 | Leitura: merge de todas as lojas vs. switch "loja atual" | **Merge** (mostra todas juntas) | ✅ confirmado pelo cliente ("aparecer as duas") |
| 2 | Criação: seletor por modal vs. "loja ativa" global | **Seletor por modal, visível só com 2+ lojas** | ⬜ a confirmar |
| 3 | Modelo no DB: `loja_ids int[]` vs. tabela de junção | **Array `loja_ids int[]`** (aditivo, casa com `.in()`/`= ANY()`) | ⬜ a confirmar |
| 4 | Endurecer RLS das vendas (corrigir o no-op) junto | **Sim** (corrige furo + habilita multi-loja) | ⬜ a confirmar |

---

## 6. Plano faseado (cada fase preserva o comportamento atual)

### Fase 0 — Banco aditivo (sem lock, sem risco)
- [ ] `ALTER TABLE permissoes ADD COLUMN loja_ids int[];` (nullable).
- [ ] Backfill: `UPDATE permissoes SET loja_ids = ARRAY[loja_id] WHERE loja_id IS NOT NULL AND loja_ids IS NULL;`
- [ ] (Opcional) Trigger de espelhamento `loja_id → loja_ids` enquanto o app antigo grava só `loja_id`:
```sql
CREATE OR REPLACE FUNCTION sync_loja_ids() RETURNS trigger AS $$
BEGIN
  IF NEW.loja_ids IS NULL AND NEW.loja_id IS NOT NULL THEN
    NEW.loja_ids := ARRAY[NEW.loja_id];
  END IF;
  RETURN NEW;
END; $$ LANGUAGE plpgsql;
CREATE TRIGGER trg_sync_loja_ids BEFORE INSERT OR UPDATE ON permissoes
  FOR EACH ROW EXECUTE FUNCTION sync_loja_ids();
```
- **Tamanho:** `permissoes` tem 1 linha por usuário → instantâneo, sem lock relevante.
- **Rollback:** `DROP COLUMN loja_ids` (nada depende dele ainda).

### Fase 1 — Hooks (encanamento multi-loja, ainda 1 loja na prática)
- [ ] `usePermissoes`: ler `loja_ids`; expor `lojaIds = loja_ids ?? (loja_id != null ? [loja_id] : [])`. Manter `lojaId` (= primeiro) por compatibilidade.
- [ ] `useLojaFilter`: `aplicarFiltroLoja` → `.in("loja_id", lojaIds)`; `getLojaFilter()` → `lojaIds.length ? lojaIds : null`; `temAcessoLoja` → `lojaIds.includes(id)`.
- **Efeito:** nada muda visualmente (todos têm 1 loja). `.in([X])` ≡ `.eq(X)`.
- **Rollback:** reverter os 2 arquivos.

### Fase 2 — RLS multi-loja (crítico, mas seguro)
- [ ] Reescrever as policies do **Mecanismo A** trocando `loja_id = X.loja_id` por `X.loja_id = ANY(loja_ids)`. Exemplo:
```sql
-- ANTES: (todas_lojas = true OR loja_id = aparelhos.loja_id)
-- DEPOIS:
EXISTS (SELECT 1 FROM permissoes
        WHERE usuario_id = auth.uid()
          AND (todas_lojas = true OR aparelhos.loja_id = ANY(loja_ids))
          AND <permissao jsonb>)
```
- [ ] Reescrever as policies do **Mecanismo B** (vendas e correlatas) para usar `permissoes` + `= ANY(loja_ids)` (corrige o no-op). Exemplo p/ `vendas` SELECT:
```sql
EXISTS (SELECT 1 FROM permissoes
        WHERE usuario_id = auth.uid()
          AND (todas_lojas = true OR vendas.loja_id = ANY(loja_ids)))
```
- **Validação obrigatória** (sem expor ninguém): testar cada policy nova numa **transação com ROLLBACK** simulando `auth.uid()` de um usuário, conferir resultados, e só então `DROP POLICY ... ; CREATE POLICY ...`.
- **Como hoje todo array tem 1 elemento**, `= ANY([X])` ≡ `= X` → comportamento idêntico para os usuários atuais.
- ⚠️ Atenção especial: endurecer as policies de vendas **muda** o comportamento atual (que era "tudo liberado" por causa do no-op). Validar que o front já filtra corretamente para não "sumir" dados legítimos. (Por isso é item de decisão #4.)
- **Rollback:** recriar a policy antiga (guardar o `CREATE POLICY` original de cada uma antes de trocar).

### Fase 3 — Telas e services (o grosso, mecânico)
- [ ] Trocar `.eq(...loja..., lojaId)` → `.in(...loja..., lojaIds)` nos arquivos do item 4.3.
- [ ] Ajustar services para aceitar `number[]`.
- [ ] Ajustar defaults de `filtroLoja`/dropdowns (item 4.6) para lista.
- [ ] Realtime: `loja_id=eq.X` → `loja_id=in.(...)` (item 4.4).
- **Por módulo**, testando um a um. No-op para 1 loja.
- **Rollback:** por arquivo/módulo.

### Fase 4 — Criação (em qual loja lança)
- [ ] Adicionar seletor de loja nos modais de criação, **visível só se `lojaIds.length > 1`**; default = primeira loja.
- [ ] Garantir que o insert use a loja escolhida (auditar item 4.7).
- **Quem tem 1 loja:** nenhuma mudança.

### Fase 5 — Modal de permissões (a "chave" que ativa tudo)
- [ ] Trocar o `Select` único por **multi-seleção** de lojas em `PermissoesModal.tsx`.
- [ ] Gravar `loja_ids` (array). Manter `loja_id` em sincronia (= primeiro, ou null) enquanto houver código legado lendo `loja_id`.
- **Só aqui** o admin consegue dar 2 lojas a alguém.

---

## 7. Plano de validação (sem risco para usuários reais)
1. Implantar Fases 0–4 com **todos ainda em 1 loja** → comportamento intacto.
2. Criar **1 usuário cobaia**; via banco, setar `loja_ids = {A,B}` para ele.
3. Logar com a cobaia e validar **módulo a módulo**: vendas, OS, estoque, caixa, dashboard, financeiro, transferências, aparelhos, RMAs, devoluções — confirmando que aparecem as 2 lojas (leitura) e que a criação pede/usa a loja certa.
4. Conferir RLS: a cobaia vê dados das 2 lojas e **não** vê de uma terceira.
5. Só então liberar a Fase 5 (multi-select) para uso geral.

---

## 8. Riscos e mitigação
| Risco | Impacto | Mitigação |
|---|---|---|
| RLS das vendas é no-op hoje (furo) | Médio/Alto (segurança) | Endurecer na Fase 2 com validação por transação; conferir que o front filtra certo |
| Telas com `.eq` direto esquecidas | Médio (loja some/aparece errada) | Checklist do item 4.3 + busca por `lojaId`/`id_loja` em toda a base |
| Criação sem loja definida (N lojas) | Alto (lança na loja errada) | Seletor obrigatório quando >1; default explícito |
| Realtime não filtra múltiplas | Baixo | Trocar `eq`→`in` (Supabase suporta) |
| Código legado lendo `loja_id` | Baixo | Manter `loja_id` sincronizado (não remover na 1ª etapa) |
| Nomenclatura mista `loja_id`/`id_loja` | Baixo | Util central que recebe o nome do campo (já existe em `aplicarFiltroLoja`) |

---

## 9. Checklist final consolidado
**Banco**
- [ ] `loja_ids int[]` + backfill + trigger de sync (Fase 0)
- [ ] RLS Mecanismo A → `= ANY(loja_ids)` (Fase 2)
- [ ] RLS Mecanismo B (vendas) → reescrever via `permissoes` (Fase 2)
- [ ] Guardar SQL original de cada policy (rollback)

**Hooks**
- [ ] `usePermissoes` expõe `lojaIds`
- [ ] `useLojaFilter` usa `.in` / `includes`

**Front (telas/services)**
- [ ] Itens 4.2, 4.3, 4.4, 4.5, 4.6 migrados
- [ ] Realtime `eq`→`in`

**Criação**
- [ ] Seletor de loja (visível só com 2+); insert usa a loja escolhida

**Permissões**
- [ ] `PermissoesModal` multi-seleção; grava `loja_ids`

**Validação**
- [ ] Usuário cobaia com 2 lojas testado módulo a módulo
- [ ] RLS confere (vê as 2, não vê a 3ª)

---

## 10. Notas finais
- A ordem 0→5 garante que **o sistema nunca para** e que qualquer fase intermediária é estável.
- O **único passo que muda comportamento existente** é o endurecimento da RLS das vendas (Fase 2) — por isso tem validação dedicada e é decisão #4.
- Decisões pendentes: #2 (criação), #3 (array vs. junção), #4 (endurecer RLS vendas). Definir antes da Fase 0.

*Gerado por análise de código e consultas read-only no banco. Nenhuma alteração aplicada.*
