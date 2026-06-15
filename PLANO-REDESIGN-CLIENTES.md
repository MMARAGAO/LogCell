# Plano de Redesign — Tela de Clientes (`/sistema/clientes`)

> Objetivo: alinhar a tela de Clientes ao **design system corporativo neutro** já aplicado em Estoque, Caixa, OS, Transferências e RMAs — sem alterar nenhuma lógica (busca, paginação, filtros, créditos, analytics, exportações).

---

## 1. Diagnóstico do estado atual

**Escopo:** `app/sistema/clientes/page.tsx` (1213 linhas) + 6 componentes em `components/clientes/`.

Resultado do scan de violações do design system:

| Arquivo | lucide | gradiente | classes gray hardcoded |
|---|---|---|---|
| `page.tsx` | sim | 0 | 0 |
| `ClienteCard.tsx` | sim | 0 | 0 |
| `ClienteFormModal.tsx` | sim | 0 | 0 |
| `GerenciarCreditosModal.tsx` | sim | 0 | 0 |
| `HistoricoCreditosModal.tsx` | sim | 0 | **11** |
| `ClienteAnalyticsModal.tsx` | sim | 0 | 0 |
| `ExportarAnalyticsModal.tsx` | sim | 0 | 0 |

**Boa notícia:** zero gradientes; gray hardcoded concentrado em 1 arquivo. **O grosso do trabalho é migrar lucide → heroicons** (todos os 7 arquivos) + padronizar header, stats e filtro na página.

### Pontos fora do padrão na `page.tsx`
- **Header:** `<h1 class="text-3xl">`, wrapper `space-y-6 p-6` sem `max-w` (as demais telas usam `mx-auto max-w-[1600px]`).
- **Stats:** 3 cards artesanais (Total / Ativos / Inativos) com tiles de ícone coloridos (`bg-success-100`, `bg-danger-100`) e valores coloridos. **Atenção:** esses cards são **interativos** — `isPressable` + `ring-2` na ativa = funcionam como **filtro por status**. Isso precisa ser preservado.
- **Filtro:** padrão antigo de **expand inline** ("Filtros" com toggle `showFilters`), com Ordenar por / Ordem / Exportar Lista. Deve virar o **padrão Drawer** das outras telas.
- **Busca:** input `size="lg"` com `bg-default-400/20` (fundo destoante do padrão `variant="bordered"`).
- **`DateRangePicker`** (linha ~1150): ainda importado/usado aqui. Foi **removido de outras telas por conflito de versão do HeroUI** (commit recente). ⚠️ Verificar se este uso quebra/precisa virar inputs `type="date"` nativos.

---

## 2. Mudanças propostas

### 2.1. `page.tsx` — Cabeçalho e layout
- Wrapper → `mx-auto max-w-[1600px] space-y-6 p-6`.
- `<h1>` → `text-2xl font-bold tracking-tight text-foreground`; subtítulo `text-sm text-default-500`.
- Botão "Exportar Analytics": `color="secondary"` (roxo decorativo) → **neutro** (`variant="flat"` default). "Novo Cliente" permanece `primary`.

### 2.2. Stats (Total / Ativos / Inativos) — mantendo o clique-filtro
Como o `MetricCard` executivo não é interativo, mantenho **cards pressáveis**, porém neutralizados:
- Superfície neutra `border border-default-200/70 bg-content1 shadow-sm`.
- Tiles de ícone neutros (`bg-default-100 text-default-500`) — sem `bg-success-100`/`bg-danger-100`.
- Valores em `text-foreground tabular-nums` (remover `text-success`/`text-danger` decorativos).
- **Estado ativo (selecionado):** `ring-2 ring-primary` consistente nos três (em vez de ring verde/vermelho), deixando claro qual filtro está aplicado.
- Ícones: `Users`/`UserCheck`/`UserX` (lucide) → `UsersIcon`/`UserPlusIcon`/`UserMinusIcon` (heroicons).

### 2.3. Filtro → padrão Drawer (igual às demais telas)
- Toolbar: container `rounded-xl border border-default-200/70 bg-content1 p-3` com:
  - **Busca** `variant="bordered"` (flex-1, prefixo `MagnifyingGlassIcon`).
  - **Toggle de visualização** (cards/tabela) em pílula `bg-default-100` (botões `h-7 w-7`), ícones `Squares2X2Icon`/`Bars3Icon`.
  - **Botão "Filtros"** envolto em `<Badge>` com a contagem de filtros ativos.
- **Chips removíveis** dos filtros ativos (Ordenação, etc.) + "Limpar tudo".
- **`<Drawer size="sm">`** com: Ordenar por, Ordem (crescente/decrescente). O "Exportar Lista" (hoje stub "em desenvolvimento") vai para o rodapé do Drawer ou ao lado do "Exportar Analytics" no header — a definir (ver §4).
- Remover o `showFilters`/expand inline e o `ButtonGroup`.

### 2.4. Tabela + `ClienteCard`
- Migrar ícones lucide → heroicons (Phone, Mail, MapPin, Edit, Trash2, DollarSign, Clock, MoreVertical, BarChart3 → equivalentes heroicons).
- Trocar `size={N}` por `className="h-4 w-4"` onde houver.
- Tokens: manter; chips de status (ativo/inativo) com cor **semântica** (success/danger) — preservados.

### 2.5. Modais (migração de ícones + tokens)
- **Todos os 6 modais:** lucide → heroicons (via alias, preservando nomes usados).
- **`HistoricoCreditosModal.tsx`:** além dos ícones, limpar as **11 classes gray hardcoded** (`text-gray-*`, etc.) → tokens (`text-default-*`, `bg-default-*`, `border-default-200/70`).
- **`ClienteAnalyticsModal` / `ExportarAnalyticsModal`:** maiores (587/727 linhas), provavelmente com gráficos/KPIs — migrar ícones e neutralizar tiles/realces decorativos, **mantendo cores semânticas** de indicadores (positivo/negativo) e as cores de séries de gráfico (essas são dados, não decoração).

---

## 3. O que **NÃO** muda
- Lógica de busca/debounce, paginação, filtro por status (clique nos stats), ordenação.
- Gestão de créditos (`GerenciarCreditosModal`, `HistoricoCreditosModal`) e analytics/exportações.
- Tipos, services, queries Supabase.
- Cores **semânticas** de status (ativo/inativo) e de indicadores de analytics são mantidas de propósito.

---

## 4. Decisões a confirmar
1. **Stats como filtro:** manter os 3 cards pressáveis (neutros, com `ring-primary` na ativa) **[recomendado]** — ou prefere transformá-los em um segmented control compacto acima da lista?
2. **"Exportar Lista"** (hoje stub): manter no fluxo de filtros (rodapé do Drawer) **[recomendado]** ou remover já que está "em desenvolvimento"?
3. **`DateRangePicker`:** se estiver dando conflito de versão como nas outras telas, troco por dois inputs `type="date"` nativos (mesmo padrão já adotado) **[recomendado]**. Confirmar se quer essa troca aqui também.

---

## 5. Validação
A cada arquivo: `npx tsc --noEmit` (0 erros) + `eslint --fix` + sweep final garantindo **zero lucide / gradiente / gray hardcoded** no escopo de clientes — mesmo critério usado nas telas anteriores.
