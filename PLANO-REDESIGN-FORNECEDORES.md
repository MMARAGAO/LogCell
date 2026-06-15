# Plano de Redesign — Tela de Fornecedores (`/sistema/fornecedores`)

> Objetivo: alinhar a tela de Fornecedores ao **design system corporativo neutro** (mesmo padrão de Estoque, Caixa, OS, Transferências, RMAs, Clientes e Lojas), sem alterar lógica (busca, filtro de status, associação de produtos, ativar/desativar, CRUD).

---

## 1. Diagnóstico do estado atual

**Escopo principal:** `app/sistema/fornecedores/page.tsx` (654 linhas) + `components/fornecedores/FornecedorModal.tsx` + `components/fornecedores/AssociarProdutoModal.tsx`.

| Arquivo | lucide | gradiente | gray/tiles | size props |
|---|---|---|---|---|
| `page.tsx` | **sim** | 0 | 0 | 0 |
| `FornecedorModal.tsx` | 0 | 0 | 0 | 0 |
| `AssociarProdutoModal.tsx` | **sim** | 0 | 0 | 0 |

**Boa notícia:** zero gradiente e zero gray hardcoded. O trabalho é **migração de ícones (lucide → heroicons)** + padronização de header/toolbar/cards.

### Pontos fora do padrão na `page.tsx`
- **Header:** `<h1 class="text-3xl">` com ícone `Building2` embutido ao lado do título; wrapper `max-w-7xl` (as demais telas usam `max-w-[1600px]` e h1 `text-2xl tracking-tight`, sem ícone embutido).
- **Sem cards de estatística** — diferente de Lojas/Clientes/RMAs que têm uma faixa de stats.
- **Toolbar solta:** busca + botão "Apenas Ativos / Todos" + 2 botões de visualização + "Novo Fornecedor", tudo numa linha sem o container padrão (`rounded-xl border bg-content1 p-3`). O toggle de visualização não usa a "pílula" padrão.
- **Filtro de status** é um botão que alterna "Apenas Ativos ↔ Todos" (filtro binário; não há filtros avançados).

---

## 2. Mudanças propostas

### 2.1. Header
- Wrapper `p-6 max-w-7xl` → `mx-auto max-w-[1600px]` (+ `space-y-6` ou manter `mb-6`).
- `<h1>` → `text-2xl font-bold tracking-tight text-foreground`, **sem o ícone embutido** (padrão das outras telas); subtítulo `text-sm text-default-500`.
- "Novo Fornecedor" continua `primary`.

### 2.2. Faixa de estatísticas (NOVO — opcional, ver §4)
Adicionar 3 `MetricCard` executivos calculados a partir da lista:
- **Total**, **Ativos**, **Inativos** (ênfase em Inativos quando > 0).
Deixa a tela consistente com Lojas/Clientes/RMAs.

### 2.3. Toolbar (padrão das demais telas)
- Container `rounded-xl border border-default-200/70 bg-content1 p-3`.
- **Busca** `variant="bordered"` (flex-1, prefixo `MagnifyingGlassIcon`).
- **Toggle de visualização** em pílula `bg-default-100` (cards/tabela) com `Squares2X2Icon`/`TableCellsIcon`.
- **Filtro de status:** como é binário (Ativos/Todos), proponho um **segmented control compacto** "Todos | Ativos" (ou manter o botão atual estilizado). Sem Drawer, já que não há outros filtros — coerente com Lojas, que também não tem Drawer.
- Contagem discreta (`text-xs tabular-nums`) opcional.

### 2.4. Cards e Tabela de fornecedores
- Migrar ícones lucide → heroicons (Building2, Phone, Mail, MapPin, Edit, Trash2, CheckCircle, XCircle, Package, MoreVertical, etc.).
- Neutralizar superfícies/realces decorativos; manter **cor semântica** do status (ativo = success / inativo = danger) nos chips.
- Card: `border border-default-200/70 shadow-sm hover:shadow-md`.

### 2.5. Modais
- **`AssociarProdutoModal.tsx`:** lucide → heroicons (`Search`, `Trash2`, `Package`, `TruckIcon`).
- **`FornecedorModal.tsx`:** já está limpo (sem lucide/gray) — só revisar espaçamentos/labels se necessário.

---

## 3. O que **NÃO** muda
- Lógica de busca, filtro Ativos/Todos, paginação (se houver), associação de produtos, ativar/desativar e CRUD.
- Tipos, services (`fornecedorService`), queries.
- Cores **semânticas** de status (ativo/inativo) preservadas.
- Componentes de **financeiro** (`ContasFornecedorPanel`, `FornecedorSelect`) e de **estoque** (`GerenciarFornecedoresProdutoModal`) que mencionam fornecedor **não entram** neste escopo — serão tratados quando migrarmos Financeiro/Estoque.

---

## 4. Decisões a confirmar
1. **Faixa de estatísticas (Total/Ativos/Inativos):** adicionar **[recomendado, deixa consistente]** ou manter a tela sem stats?
2. **Filtro de status:** transformar em **segmented "Todos | Ativos"** dentro da toolbar **[recomendado]** ou manter o botão "Apenas Ativos/Todos" atual (só restilizado)?
3. **Ícone no título:** remover o `Building2` ao lado de "Fornecedores" para seguir o padrão das outras telas **[recomendado]** ou manter?

---

## 5. Validação
A cada arquivo: `npx tsc --noEmit` (0 erros) + `eslint --fix` + sweep final garantindo **zero lucide / gradiente / gray hardcoded** no escopo de fornecedores — mesmo critério das telas anteriores.
