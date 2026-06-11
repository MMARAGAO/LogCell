# Plano de Redesign — Tela de Aparelhos

> Relatório de UI/UX da tela de Aparelhos (`app/sistema/aparelhos/page.tsx`) e seus
> modais. Documento de **diagnóstico e plano** — nenhuma alteração de código foi feita.
> Data: 2026-06-10.

## Sumário

- [Parte 1 — Tela de Listagem](#parte-1--tela-de-listagem)
  - [Problemas críticos](#-problemas-críticos-corrigir-primeiro)
  - [Hierarquia e card](#-melhorias-de-hierarquia-e-card)
  - [Tabela e estados](#-tabela-e-estados)
  - [Design system](#-refinamentos-de-design-system)
  - [Plano de execução](#plano-de-execução--tela)
- [Parte 2 — Modais](#parte-2--modais)
  - [Problemas críticos](#-problemas-críticos)
  - [Estrutura do formulário](#-estrutura-e-hierarquia-do-form)
  - [Visual e acessibilidade](#-refinamentos-visuais-e-de-acessibilidade)
  - [Plano de execução](#plano-de-execução--modais)
- [Roadmap consolidado](#roadmap-consolidado)

---

# Parte 1 — Tela de Listagem

## Visão geral

A tela é funcional e já adota o padrão visual do projeto (cards `rounded-2xl`,
sombras suaves, dark mode). Mas sofre de **sobrecarga visual no topo**,
**hierarquia plana** e alguns **problemas de UX reais** — incluindo um bug
funcional na busca. Nota atual ~6/10; potencial com os ajustes ~9/10.

## 🔴 Problemas críticos (corrigir primeiro)

### 1. A busca não funciona ao digitar (bug funcional)

O `useEffect` que recarrega dados depende de
`[lojaIdFinal, podeVisualizar, filtros, paginaAtual]` (linha ~250) — **`busca`
não está na lista**. Resultado: digitar no campo não dispara nada; só recarrega
quando outro filtro muda. O scanner de IMEI (que faz `setBusca`) tem o mesmo
problema.

- **Correção:** adicionar `busca` com **debounce (~400ms)** ao efeito, ou um
  submit no Enter + botão. Hoje o usuário digita e "não acontece nada".

### 2. Faixa de KPIs ocupa demais e compete com o conteúdo

São **8 KPIs** dentro do header, cada um com cor de fundo própria (primary,
emerald, orange, indigo, gray, amber, purple, emerald). É um "arco-íris" que
cansa e achata a hierarquia — tudo grita igual.

- **Correção:** reduzir a saturação. Manter o card neutro (fundo branco/zinc) e
  usar cor **só no ícone e no valor**. Agrupar visualmente: financeiros
  (Recebido / A receber / Vendido), operacionais (Vendas hoje/mês, Disponíveis)
  e métricas (Ticket, Lucro). Considerar colapsar KPIs secundários atrás de um
  "ver mais".

### 3. Painel de filtros excessivamente alto

São **3 linhas** de controles sempre visíveis (busca, 5 selects, 2 datas +
ordenação + toggle). Empurra os cards para muito abaixo da dobra.

- **Correção:** colapsar filtros avançados num popover/`Drawer` "Filtros" com
  badge de contagem de filtros ativos. Deixar visível só: busca + 1-2 filtros
  rápidos (Status, Marca) + toggle de visualização. Mostrar filtros aplicados
  como **chips removíveis** ("Apple ✕", "Disponível ✕").

## 🟡 Melhorias de hierarquia e card

### 4. Card de aparelho — densidade e ritmo

O card empilha 8+ blocos de texto/chips com pesos parecidos (modelo, marca,
chips de armazenamento, "Cor: X", estado+status, IMEI, bateria, valores, 3
botões). Falta hierarquia.

- **Preço** deveria ser o segundo elemento mais forte depois do modelo — hoje
  aparece lá embaixo. Subir e dar destaque (`text-xl font-bold`).
- "Cor: Azul" como frase é fraco — virar **chip** ou par label/valor alinhado.
- Estado + Status + armazenamento + bateria são todos chips `flat` de tom
  parecido → viram ruído. Definir **uma linha de metadados**
  (estado · armazenamento · bateria) e reservar cor só para o **Status** (o dado
  acionável).
- O Status no card é só leitura, mas na **tabela** é um dropdown clicável.
  Inconsistência — padronizar.

### 5. Imagem / placeholder

O placeholder usa gradiente `primary` com ícone gigante — bonito, mas todos os
cards sem foto ficam idênticos e "barulhentos".

- **Correção:** placeholder **neutro** (cinza suave) com ícone menor, reservando
  cor para dados reais.

### 6. Ações duplicadas no card

Cada card tem dropdown "⋮" (Editar, Pagamentos, Detalhes, Deletar) **+** botões
grandes Vender/Editar/Deletar. "Editar" e "Deletar" aparecem **duas vezes**.

- **Correção:** ação primária = 1 botão claro (Vender se disponível, ou
  Detalhes); mover Editar/Deletar para o dropdown apenas.

## 🟢 Tabela e estados

### 7. Tabela — 10 colunas, sem priorização responsiva

Em telas médias vira scroll horizontal. IMEI em `code` ocupa muito.

- Tornar IMEI/Cor colunas secundárias (ocultar em `<lg`), truncar IMEI com
  tooltip, fixar a coluna de Ações.

### 8. Estados vazio / loading / erro

- O **empty state** é genérico. Diferenciar "nenhum cadastro ainda" (CTA "Novo
  Aparelho") de "nenhum resultado para o filtro" (CTA "Limpar filtros").
- **Erro** hoje só vira toast — adicionar estado inline com "Tentar novamente".
- Criar skeleton equivalente para a tabela (hoje usa só `isLoading` padrão).

### 9. Paginação

Em cards fica solta no fim; na tabela está no `bottomContent`. Padronizar
posição e adicionar texto "Mostrando X–Y de Z".

## 🎨 Refinamentos de design system

### 10. Performance percebida — fotos

`carregarDados` faz `getFotosAparelho` por aparelho em `Promise.all` a cada
página. Em conexões lentas os cards "pulam" quando as fotos chegam. Considerar
lazy-load por viewport ou trazer a foto de capa no próprio `getAparelhos`.

### 11. Consistência com o resto do app

A tela de Estoque usa `MiniCarrossel` e o hook `useFotosProduto`. Aqui o
carrossel foi **reimplementado inline** (estado `fotoAtualIndex`, `proximaFoto`,
etc.). Extrair para o `MiniCarrossel` compartilhado reduz código e unifica o
comportamento.

### 12. Acessibilidade

- Botões de navegação do carrossel sem `aria-label`.
- Contraste de `text-default-400` / `[11px]` em valores financeiros abaixo do
  ideal (WCAG AA) — subir tom/tamanho.
- Inputs `type="date"` sem `label` (só placeholder, que some ao focar).

## Plano de execução — tela

| Fase | Escopo | Esforço | Impacto |
|------|--------|---------|---------|
| **1 — Quick wins** | Corrigir busca (debounce), de-duplicar ações do card, neutralizar placeholder | Baixo | Alto |
| **2 — Topo da tela** | Reduzir/agrupar KPIs, colapsar filtros em drawer + chips de filtros ativos | Médio | Alto |
| **3 — Card & tabela** | Re-hierarquizar card (preço em destaque, 1 linha de metadados), tabela responsiva, status consistente | Médio | Médio-alto |
| **4 — Estados & a11y** | Empty/erro diferenciados, aria-labels, contraste, skeleton de tabela | Baixo-médio | Médio |
| **5 — Refator** | Extrair carrossel para `MiniCarrossel`, otimizar carga de fotos | Médio | Médio (DX/perf) |

---

# Parte 2 — Modais

## Visão geral

Os modais cobrem fluxos complexos, mas o **modal de cadastro**
(`AparelhoFormModal`, ~774 linhas) sofre de **falta de agrupamento** (15+ campos
numa grade plana), **feedback de validação fraco** (tudo via toast) e um **fluxo
de fotos em duas etapas confuso**. Os modais maiores (Venda ~1.865, Recebimento
~1.002 linhas) são monolíticos demais. Nota atual ~5,5/10.

## 🔴 Problemas críticos

### 1. Validação só por toast — sem feedback no campo

Toda validação dispara `showToast(...)` e dá `return` (linhas ~244-270). O campo
problemático **não fica destacado**. Com 15 campos e scroll interno, o usuário
caça onde está o erro.

- **Correção:** usar `isInvalid` + `errorMessage` do HeroUI por campo, validar no
  blur e no submit, e **rolar até o primeiro campo inválido**. Toast vira
  reforço, não o único sinal.

### 2. Fluxo de fotos em 2 etapas é confuso

Ao criar: preenche tudo → "Cadastrar" → o botão de salvar **desaparece** → surge
a seção de fotos → "Cancelar" vira "Concluir" (linhas ~743-751). A mudança de
estado é silenciosa; o usuário acha que salvou e fechou.

- **Correção:** (a) deixar o upload disponível desde o início, ou (b) tornar a
  transição explícita com um **stepper** ("1. Dados → 2. Fotos") e header que
  mude para "Adicionar fotos".

### 3. Sem confirmação ao fechar com dados não salvos

`isDismissable={!loading}` permite fechar clicando fora. Preencher 15 campos e
clicar fora por acidente **perde tudo sem aviso**.

- **Correção:** detectar form "sujo" (dirty) e pedir confirmação antes de
  descartar.

## 🟡 Estrutura e hierarquia do form

### 4. 15+ campos numa grade plana sem seções

Loja, Fornecedor, Marca, Modelo, Armazenamento, RAM, IMEI, Série, Cor, Estado,
Condição, Valor Compra, Valor Venda, Bateria, Ordem Catálogo, Acessórios,
Observações — tudo num único `grid` de 2 colunas. Só o bloco de Catálogo tem
divisória.

- **Correção:** agrupar em **seções com títulos** (ou `Tabs`/`Accordion`):
  - **Identificação** (Marca, Modelo, IMEI, Série, Cor)
  - **Especificações** (Armazenamento, RAM, Estado, Condição, Bateria)
  - **Comercial** (Loja, Fornecedor, Valor Compra, Valor Venda)
  - **Catálogo** (checkboxes + ordem) — já isolado
  - **Mídia** (Fotos)

### 5. Ordem dos campos não segue o fluxo mental

Começa por **Loja** e **Fornecedor** (administrativo) antes de **Marca/Modelo**
(identidade do aparelho). O natural é: identifico → especifico → precifico →
administro.

- **Correção:** reordenar para começar por Marca/Modelo/IMEI. O IMEI já
  autopreenche marca/modelo via TAC (linhas ~201-228) — colocá-lo no topo
  potencializa o recurso.

### 6. "Saúde da bateria" obrigatória para todo aparelho

A validação exige bateria 0-100% sempre (linhas ~262-270), o que não faz sentido
para aparelho **novo lacrado**.

- **Correção (UX + regra):** tornar condicional ao estado (obrigatório só para
  usado/seminovo/recondicionado). Decisão de produto — confirmar.

### 7. Campos numéricos `type="number"` para dinheiro

Valor de Compra/Venda usam `type="number"` com `step="0.01"`: setinhas de
incremento, aceita notação científica, sem formatação de milhar.

- **Correção:** máscara monetária pt-BR, como já existe em outras telas
  (Caixa/Venda).

## 🟢 Refinamentos visuais e de acessibilidade

### 8. Header e footer genéricos

`ModalHeader` é só texto ("Editar Aparelho"). Sem ícone, sem subtítulo, sem
contexto do aparelho editado.

- **Correção:** header com ícone `DevicePhoneMobileIcon` + nome do aparelho no
  modo edição, alinhando com o header rico da tela.

### 9. Modais gigantes (Venda ~1.865, Recebimento ~1.002 linhas)

São telas inteiras dentro de um modal. Um fluxo de venda tão longo em
`scrollBehavior="inside"` é claustrofóbico.

- **Correção (UX):** para a **venda**, avaliar um **stepper** (Cliente →
  Pagamento → Revisão) ou uma rota dedicada `/sistema/aparelhos/[id]/vender` em
  vez de modal.

### 10. Consistência entre modais

- Detalhes usa **Tabs** + emojis como ícones de ação (`💰`, `💳`, `🗑`). Emojis
  renderizam diferente por OS e não combinam com os `@heroicons`. Padronizar
  para ícones SVG.
- Tamanhos de modal variam; padronizar escala (form = `3xl`, detalhes = `4xl`,
  confirmações = `md`).

### 11. Acessibilidade

- Botões `isIconOnly` (scanner, + fornecedor) dependem só de `title`; adicionar
  `aria-label`.
- Foco inicial não é gerenciado: ao abrir, o foco deveria ir ao primeiro campo
  (Marca).

## Plano de execução — modais

| Prioridade | Item | Esforço | Impacto |
|-----------|------|---------|---------|
| **Alta** | Validação inline (`isInvalid`/`errorMessage`) + scroll ao erro | Médio | Alto |
| **Alta** | Confirmação ao descartar form sujo | Baixo | Alto |
| **Alta** | Repensar fluxo de fotos (stepper ou upload desde o início) | Médio | Alto |
| **Média** | Agrupar campos em seções + reordenar (IMEI/Marca no topo) | Médio | Alto |
| **Média** | Máscara monetária nos valores; bateria condicional | Baixo | Médio |
| **Baixa** | Header rico, ícones no lugar de emojis, foco inicial, aria-labels | Baixo | Médio |
| **Futuro** | Quebrar VendaAparelhoModal em stepper/rota dedicada | Alto | Médio-alto |

---

# Roadmap consolidado

Sequência recomendada combinando tela + modais, do maior ROI ao refinamento:

1. **Correções de bug/perda de trabalho** (esforço baixo, impacto alto)
   - Busca com debounce na listagem.
   - Validação inline + confirmação ao descartar form sujo.
2. **Redução de ruído visual** (esforço médio, impacto alto)
   - Agrupar/neutralizar KPIs e colapsar filtros em drawer com chips ativos.
   - Agrupar campos do form em seções + reordenar.
3. **Hierarquia e consistência** (esforço médio)
   - Re-hierarquizar card (preço em destaque, 1 linha de metadados, ações
     desduplicadas), tabela responsiva, status consistente.
   - Máscara monetária, bateria condicional, header de modal rico.
4. **Estados, a11y e refator** (esforço baixo-médio)
   - Empty/erro diferenciados, aria-labels, contraste, skeletons.
   - Extrair carrossel para `MiniCarrossel`, otimizar carga de fotos.
5. **Futuro / maior escopo**
   - Quebrar VendaAparelhoModal em stepper ou rota dedicada.
