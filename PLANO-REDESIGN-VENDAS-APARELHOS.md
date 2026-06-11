# Plano de Redesign — Tela de Vendas de Aparelhos

> Relatório de UI/UX da tela `/sistema/vendas/aparelhos`
> (`app/sistema/vendas/aparelhos/page.tsx`, ~2.530 linhas). Documento de
> **diagnóstico e plano** — nenhuma alteração de código foi feita.
> Direção visual: **corporativa/sóbria** (mesma estabelecida no redesign de
> Aparelhos, ver `PLANO-REDESIGN-APARELHOS.md`). Data: 2026-06-10.

## Sumário

- [Visão geral](#visão-geral)
- [Problemas críticos](#-problemas-críticos)
- [Hierarquia e card](#-hierarquia-e-card)
- [Estados, consistência e tokens](#-estados-consistência-e-tokens)
- [Plano de execução](#plano-de-execução-por-fase)
- [Decisões pendentes](#pontos-que-valem-decisão-antes-de-implementar)

---

## Visão geral

A tela é rica em funcionalidade, mas é a **mais "barulhenta" de cor** entre as
analisadas: KPIs em arco-íris, pills de status/pagamento em 5+ cores, lucro
verde/vermelho em cada card. Também tem **redundância estrutural** (tabs ×
filtros), uma **tabela em HTML cru** (fora do padrão do app) e **menus de ação
gigantes** (10 itens). Nota atual ~5,5/10; potencial alto com o redesign
corporativo.

Reaproveita-se muito do que já foi construído no redesign de Aparelhos
(`KpiCard` sóbrio, filtros com chips, HeroUI Table responsiva, skeletons, empty
diferenciado).

## 🔴 Problemas críticos

### 1. Redundância: Tabs × Filtros (confunde o modelo mental)

Há **abas** "Todas / Hoje / Pendentes" **e**, dentro dos filtros, **Status**
(Concluída/Pendente) **e Período** (Hoje/Semana/Mês). "Hoje" existe como aba **e**
como período; "Pendente" como aba **e** como status. Permite combinações
contraditórias (aba "Hoje" + período "Mês").

- **Correção:** escolher **um** eixo. Sugestão: manter as abas como atalhos
  rápidos (Todas/Hoje/Pendentes) e **remover Status/Período redundantes** dos
  filtros — ou o contrário. Não ter os dois.

### 2. Tabela em HTML cru (`<table>`) fora do padrão

Diferente da tela de Aparelhos (que usa `@heroui/table`), aqui é `<table>`
manual: sem hidden responsivo (8 colunas sempre visíveis → só scroll horizontal
no mobile), sem skeleton, sem empty integrado.

- **Correção:** migrar para `@heroui/Table` com colunas responsivas (ocultar
  Vendedor/Pago/Data em telas menores), reaproveitando o padrão já implementado
  em Aparelhos.

### 3. Excesso de cor (contra a direção corporativa)

- **5 KPIs** com fundo colorido (primary, orange, emerald, blue, emerald) —
  mesmo "arco-íris" já neutralizado em Aparelhos.
- **Pills de forma de pagamento** em 5 cores (emerald/blue/purple/amber/gray).
- **Status, desconto, lucro, contadores** todos coloridos.
- **Correção:** aplicar o mesmo `KpiCard` sóbrio (monocromático), reduzir as
  pills de pagamento a um estilo neutro único, e reservar cor só para o **saldo
  pendente** (o dado acionável).

### 4. Menu de ações gigante e plano (10 itens)

Cada venda tem um dropdown com Detalhes, Imprimir Recibo, Imprimir Garantia,
Editar, Brinde, Troca, Pagamentos, Desconto, Vendedor, Cancelar — **10 itens sem
agrupamento**, idêntico em card e tabela.

- **Correção:** uma ação primária visível (Detalhes ou Pagamentos) + menu
  **agrupado por seção** via `DropdownSection` (Documentos: Recibo/Garantia ·
  Edição: Editar/Desconto/Vendedor · Itens: Brinde/Troca · Pagamentos · Cancelar
  em vermelho separado).

## 🟡 Hierarquia e card

### 5. Card sobrecarregado

O card empilha: linha de badges (venda#, status, desconto), título, IMEI+data,
bloco de valores (4 linhas), bloco do cliente, vendedor, pills de pagamento,
**lucro**, divisor, specs + menu. Muita informação com pesos parecidos.

- **Correção:** hierarquia clara — valor + status no topo-direita, cliente como
  linha secundária, e **mover pagamentos/lucro para o detalhe** (modal). O card
  de listagem não precisa mostrar cada forma de pagamento.

### 6. Lucro exposto em todo card (sensível)

O **lucro** aparece em cada card/linha. Em muitos ERPs isso é informação
restrita.

- **Correção (produto + UX):** gatear por permissão (ex.: `ver_preco_custo` /
  `ver_relatorios`), como provavelmente já existe em Estoque. Confirmar.

### 7. Filtros sem feedback quando recolhidos

Com o painel fechado, **não há indicação de filtros ativos** nem chips para
removê-los. O "Limpar Filtros" só existe dentro do painel aberto.

- **Correção:** badge de contagem no botão "Filtros" + **chips removíveis** dos
  filtros ativos na barra (mesmo padrão do drawer de Aparelhos; aqui pode ser
  painel inline, só adicionando os chips).

## 🟢 Estados, consistência e tokens

### 8. Empty state genérico e sem skeleton

"Nenhuma venda encontrada" não distingue "sem filtros" de "filtro sem
resultado". E a lista não tem skeleton durante o carregamento.

- **Correção:** empty diferenciado (CTA "Nova Venda" vs "Limpar filtros") +
  skeleton de linhas/cards — reaproveitando o já feito.

### 9. Tokens visuais desalinhados do novo padrão

Header/filtros/tabela ainda usam `rounded-2xl` + `shadow-[0_4px_20px...]` +
ícone `bg-primary/10`. Aparelhos já migrou para `rounded-xl` + `shadow-sm` +
borda `gray-200`.

- **Correção:** sweep de tokens igual ao de Aparelhos, para coesão entre as
  telas.

### 10. Header (Nova Venda / Exportar CSV)

Padrão já adequado: "Nova Venda" primária (sólida), "Exportar CSV" secundária
(flat). Manter, só alinhar tokens.

### 11. Acessibilidade

- O `✎` (emoji) como marca de "editado" nas pills — trocar por ícone SVG.
- `<table>` manual sem `scope`/aria nos headers (resolvido ao migrar para HeroUI
  Table).
- Botões de toggle de view sem `aria-label`.

## Plano de execução (por fase)

| Fase | Escopo | Esforço | Impacto |
|------|--------|---------|---------|
| **1 — Sobriedade** | `KpiCard` sóbrio (reusar), neutralizar pills de pagamento/status, sweep de tokens (rounded-xl/shadow-sm) | Baixo | Alto |
| **2 — Estrutura** | Resolver redundância Tabs×Filtros; chips de filtros ativos + badge de contagem | Médio | Alto |
| **3 — Tabela & card** | Migrar `<table>` → HeroUI Table responsiva; re-hierarquizar card; agrupar menu de ações (`DropdownSection`) | Médio-alto | Alto |
| **4 — Estados & a11y** | Empty diferenciado, skeleton, gatear lucro por permissão, aria-labels, trocar emoji | Baixo-médio | Médio |

## Pontos que valem decisão antes de implementar

1. **Tabs vs Filtros** — qual eixo manter? (recomendo abas como atalho + remover
   Status/Período duplicados dos filtros).
2. **Lucro no card** — esconder/gatear por permissão, ou manter visível?
3. **Pagamentos no card** — manter as pills de cada forma, ou mover para o
   detalhe?

---

**Recomendação:** começar pela **Fase 1** (sobriedade), quase toda
reaproveitamento do que já foi construído em Aparelhos — entrega coesão visual
imediata com baixo risco.
