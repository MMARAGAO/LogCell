# Plano de Redesign — Tela de Usuários (`/sistema/usuarios`)

> Objetivo: alinhar a tela de Usuários ao **design system corporativo neutro** (mesmo padrão de Estoque, Caixa, OS, Transferências, RMAs, Clientes, Lojas e Fornecedores), sem alterar lógica (busca, CRUD, permissões, histórico, ativar/desativar).

---

## 1. Diagnóstico do estado atual

**Escopo:** `app/sistema/usuarios/page.tsx` (600) + 5 componentes em `components/usuarios/`.

| Arquivo | lucide | gradiente | cor não-semântica |
|---|---|---|---|
| `page.tsx` | 0 | 0 | — (só banner de erro `danger`, semântico) |
| `UsuarioFormModal.tsx` | 0 | 0 | 0 |
| `UsuarioCard.tsx` | 0 | 0 | 0 |
| `PermissoesModal.tsx` (1842) | 0 | 0 | — (2 banners success/danger, semânticos) |
| `UsuariosStats.tsx` | 0 | 0 | **tiles coloridos** (decorativo) |
| `HistoricoUsuarioModal.tsx` | 0 | 0 | — (diff old/new success/danger, semântico) |

**Resumo:** a tela **já está praticamente no padrão** (heroicons, tokens, sem gradiente). As únicas cores presentes são **semânticas** (erro, diff de histórico, banners de permissão) e devem ser **mantidas**. O ajuste é essencialmente cosmético: header, faixa de stats e toolbar.

---

## 2. Mudanças propostas

### 2.1. Header
- Wrapper raiz `<div>` → `<div className="mx-auto max-w-[1600px]">` (largura/centralização como nas demais telas).
- `<h1 class="text-3xl">` → `text-2xl font-bold tracking-tight text-foreground`; subtítulo `text-sm text-default-500`.
- "Novo Usuário" permanece `primary` no canto do header.

### 2.2. Stats (`UsuariosStats.tsx`)
- Hoje: 4 cards artesanais com tiles coloridos (`bg-primary/10 text-primary`, `bg-success/10`, `bg-danger/10`, `bg-secondary/10`).
- Trocar pelo **`MetricCard` executivo neutro** (igual a Lojas/Fornecedores): Total, Ativos, Inativos, Novos este Mês — ícone neutro por padrão; **ênfase** só em "Inativos" quando > 0.

### 2.3. Toolbar
- Hoje: busca (`max-w-md`) + 2 botões de visualização soltos numa linha.
- Padronizar: container `rounded-xl border border-default-200/70 bg-content1 p-3` com:
  - **Busca** `variant="bordered"` (flex-1, prefixo `MagnifyingGlassIcon`).
  - **Toggle de visualização** em pílula `bg-default-100` (cards/tabela) — `Squares2X2Icon`/`TableCellsIcon`.
- Não há filtros avançados → **sem Drawer** (coerente com Lojas).

### 2.4. Componentes
- `UsuarioCard`, `UsuarioFormModal`, `HistoricoUsuarioModal`, `PermissoesModal`: já limpos. **Nenhuma mudança** além de eventual ajuste fino de espaçamento, se necessário. Cores semânticas mantidas.

---

## 3. O que **NÃO** muda
- Lógica de busca, CRUD, ativar/desativar, **permissões** (`PermissoesModal`) e histórico.
- Tipos, services, server actions.
- Cores **semânticas** (banner de erro, diff de histórico old/new, banners de permissão) — preservadas de propósito.

---

## 4. Decisão a confirmar (opcional)
- **Filtro de status:** a tela tem stats de Ativos/Inativos mas **não** tem um filtro para listar só ativos/inativos (diferente de Fornecedores/Clientes). Quer que eu **adicione um segmented "Todos | Ativos | Inativos"** na toolbar **[opcional]**, ou mantenho só a busca como hoje? (Recomendo manter como está para não introduzir comportamento novo, a menos que você queira o filtro.)

---

## 5. Validação
A cada arquivo: `npx tsc --noEmit` (0 erros) + `eslint --fix` + sweep final confirmando **zero lucide / gradiente / gray hardcoded** (cores semânticas permanecem) — mesmo critério das telas anteriores.

> Observação: este é o escopo **mais leve** do rollout até agora — basicamente header + stats + toolbar.
