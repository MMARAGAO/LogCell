# Plano de Redesign — Tela de Ordem de Serviço (Técnico)

**Rota:** `/sistema/ordem-servico/tecnico/[id]`
**Documento de origem:** `ANALISE-UX-UI-OS-TECNICO.md`
**Stack:** Next.js (App Router) · HeroUI 2.8 · Tailwind · Heroicons · Supabase
**Autor:** Product Design (plano arquitetural — sem código)
**Data:** 17/06/2026

> **Referências de produto:** Linear (densidade e ações fixas), Jira (layout issue + sidebar de propriedades), Zendesk (timeline de atividade), HubSpot (sidebar de metadados editável inline). Mantendo a identidade corporativa neutra já existente (tokens `bg-content1`, `border-default-200/70`, cor apenas semântica).

---

# Objetivo do Redesign

## Visão final
Transformar a tela de detalhe de OS de um **empilhamento vertical de blocos** em uma **interface de "ticket" de duas colunas**, no estilo Linear/Jira, onde:

- O **conteúdo de trabalho** (defeito, observações, fotos, laudo, peças, quebras) ocupa a coluna principal.
- Os **metadados e o estado da OS** (status, prazo, garantia, bancada, valores, técnico) vivem em uma **sidebar de propriedades** persistente e editável inline.
- As **ações primárias** (Salvar / Concluir) ficam em uma **barra fixa (sticky)** sempre visível, com indicador de "alterações não salvas".
- O técnico de bancada/campo completa uma OS com **mínimo de scroll, toque confortável e zero ambiguidade** sobre o que falta para concluir.

## Problemas que serão resolvidos
| # | Problema atual (do relatório) | Como o redesign resolve |
|---|---|---|
| 1 | Dois padrões de Card convivendo | **Card único** (`SectionCard`) em todas as abas |
| 2 | "Observações Técnicas" duplicado | Editor único na timeline de atividade; bloco de leitura eliminado |
| 3 | Conclusão dispersa (botão longe do campo) | **Barra de ação fixa** + checklist de conclusão no contexto |
| 4 | 3 loadings + 2 sistemas de badge | **Loading único** (Spinner/Skeleton padronizados) + **Chip único** |
| 5 | Acessibilidade (contraste, toque, hover) | Tokens de rótulo com contraste AA, alvos ≥44px, ações sempre visíveis |
| 6 | Select de status incompleto/travado | Status como propriedade da sidebar com todos os estados válidos |
| 7 | Lightbox de foto manual e inacessível | Migrado para `<Modal>` com navegação e Esc |
| 8 | Componente monolítico (~2.000 linhas) | Cada aba extraída em componente próprio |
| 9 | Regras implícitas (câmera/bancada, obs ↔ laudo) | Pré-requisitos explicitados via estados e checklist |

## Princípios norteadores
1. **Produtividade do técnico primeiro** — menos cliques, menos scroll, ações sempre ao alcance.
2. **Uma só forma de fazer cada coisa** — um Card, um Modal, um Badge, um Loading, um Empty State.
3. **Estado visível** — o técnico sempre sabe o que falta para concluir e se há algo não salvo.
4. **Corporativo e sóbrio** — sem gradientes, sem emojis, cor só semântica.
5. **Acessível por padrão** — contraste AA, toque ≥44px, teclado e leitor de tela.

---

# Arquitetura da Tela

## Desktop (≥1280px) — layout "issue" de duas colunas

```
┌──────────────────────────────────────────────────────────────────────────┐
│ Breadcrumb: Ordens › Técnico › #1042                          [voltar ←]   │
├──────────────────────────────────────────────────────────────────────────┤
│ HEADER COMPACTO                                                            │
│ #1042 · João da Silva                          [Em Andamento] [🔥 Urgente] │
│ iPhone 13 · criada 12 jun por Maria                                        │
│ ●────────●────────◍────────○   Aguardando › Aprovado › Andamento › Concluído│
├──────────────────────────────────────────┬───────────────────────────────┤
│ COLUNA PRINCIPAL (conteúdo)              │ SIDEBAR DE PROPRIEDADES        │
│                                          │ (sticky)                       │
│ ┌─ Tabs ─────────────────────────────┐   │ ┌───────────────────────────┐  │
│ │ Informações·Fotos·Laudo·Peças·Quebr│   │ │ STATUS        [Em Andam.▾]│  │
│ └────────────────────────────────────┘   │ │ Prazo         18 jun ⚠     │  │
│                                          │ │ Garantia      90 dias     │  │
│ ┌─ SectionCard ────────────────────┐     │ │ Valor         R$ 350,00   │  │
│ │  (conteúdo da aba ativa)         │     │ │ Cliente       Consumidor  │  │
│ │                                  │     │ ├───────────────────────────┤  │
│ │                                  │     │ │ BANCADA / CÂMERA          │  │
│ │                                  │     │ │ [ Bancada 2 ▾ ]  ● ao vivo│  │
│ │                                  │     │ │ [Ver] [Compartilhar]      │  │
│ └──────────────────────────────────┘     │ └───────────────────────────┘  │
│                                          │                                │
├──────────────────────────────────────────┴───────────────────────────────┤
│ BARRA DE AÇÃO FIXA (sticky bottom)                                         │
│ ● Alterações não salvas      [ Salvar rascunho ]   [ ✓ Concluir OS ]       │
└──────────────────────────────────────────────────────────────────────────┘
```

## Anatomia de blocos
- **Breadcrumb** — orientação ("Ordens › Técnico › #OS").
- **Header compacto** — número, cliente, equipamento, badges de status/prioridade, barra de progresso de etapas.
- **Coluna principal** — tabs + conteúdo da aba ativa (cards unificados).
- **Sidebar de propriedades (sticky)** — status editável, prazo, garantia, valor, tipo de cliente, bancada/câmera.
- **Barra de ação fixa** — indicador de não-salvo + Salvar + Concluir.

---

# Design System Proposto

## Padrão único de Card — `SectionCard`
Adota o card manual já elegante da aba "Informações" como **único padrão**, eliminando os `<Card>` HeroUI com `shadow-medium` das demais abas.

```
┌─ SectionCard ──────────────────────────────┐
│ [⬡ icon]  Título da Seção         [ação?]   │  ← header: tile bg-default-100/
│ ───────────────────────────────────────────│     ícone neutro + título text-sm
│                                             │     font-semibold + divisória
│   conteúdo                                  │
└─────────────────────────────────────────────┘
```
- Container: `rounded-xl border border-default-200/70 bg-content1 shadow-sm p-5`
- Header: `flex items-center gap-2 mb-4 pb-3 border-b border-default-200/70`
- Ícone em tile neutro `w-7 h-7 rounded-lg bg-default-100` (cor só quando semântico)
- Título: `text-sm font-semibold text-foreground`
- Slot opcional de ação à direita (botão/contador)

## Padrão único de Modal
Todos os modais usam `<Modal>` do HeroUI (incluindo o lightbox de foto, hoje manual).
- **Tamanhos:** `sm` (confirmações), `2xl` (formulários), `5xl` (lightbox/galeria).
- **Mobile:** `placement="bottom"`, `scrollBehavior="inside"`, footer com botões `fullWidth` empilhados.
- **Estrutura:** `ModalHeader` (ícone + título) · `ModalBody` (seções com sub-headers) · `ModalFooter` (secundária à esquerda, primária à direita).
- **Acessibilidade nativa:** focus trap, Esc para fechar, `aria-modal`.

## Padrão único de Badge/Chip
Substituir os `<span>` estilizados manualmente do header por `<Chip>` do HeroUI.
| Uso | Componente |
|---|---|
| Status | `<Chip variant="flat" color={semântico}>` |
| Prioridade | `<Chip variant="flat" color="danger/warning" startContent={ícone}>` |
| Contador de aba | `<Chip size="sm" variant="flat">` |
| Estado de peça (Reservado/Baixado) | `<Chip variant="dot" color={semântico}>` |
- Mapa central de cores semânticas (`STATUS_COLOR`, `PRIORIDADE_COLOR`) reutilizado por todos.

## Padrão único de Alertas — `InlineAlert`
```
┌─────────────────────────────────────────────┐
│ [⚠]  Mensagem de atenção em uma linha clara. │
└─────────────────────────────────────────────┘
```
- Variantes semânticas: `warning` (âmbar), `danger` (vermelho), `success` (emerald), `info` (primary).
- `border + bg-{cor}-50 + texto {cor}-700`, ícone Heroicon (sem emoji).
- Uso: aviso de aprovação, ausência de produto, pré-requisitos.

## Padrão único de Empty States — `EmptyState`
```
            ┌─────────────┐
            │     ⬡       │   ícone w-12 h-12 opacity-40
            └─────────────┘
         Nenhuma foto adicionada      ← text-base font-medium
     Clique em "Adicionar" para…      ← text-sm text-default-500
            [ + Ação primária ]       ← CTA opcional
```
- Container: `text-center py-12`, ícone neutro, título + descrição + CTA opcional.
- Padroniza os 3 empty states atuais (fotos, peças, quebras) que hoje variam em tamanho de ícone (`w-20` vs `w-16`) e opacidade.

## Padrão único de Loading States
Eliminar os spinners CSS manuais (`animate-spin border-b-2`).
| Contexto | Padrão |
|---|---|
| Carregamento inicial da página | **Skeleton** com o esqueleto do layout (header + sidebar + card) |
| Carregamento de lista (peças/quebras) | `<Spinner>` HeroUI centralizado |
| Ação em botão | `isLoading` do `<Button>` |
| Salvamento em background | indicador na barra de ação fixa |

## Padrão único de Formulários
- Todos os campos `variant="bordered"` + `labelPlacement="outside"`.
- Rótulo: `text-tiny text-default-500` (substitui `text-[10px] text-default-400` de baixo contraste).
- Validação **inline** via `isInvalid` + `errorMessage` (não apenas toast).
- Agrupamento por seções com sub-header discreto quando o formulário tem >4 campos.
- Campos obrigatórios marcados com `isRequired` (asterisco visível).

---

# Redesign de Cada Aba

## Aba 1 — Informações

### Estado Atual
- Grid 2/3 com card de info + coluna de controles (Status + Câmera).
- **"Observações Técnicas" duplicado** (bloco de leitura + editor com timeline).
- Card de Status e Câmera na coluna direita competindo em peso visual.
- Rótulos `text-[10px]` de baixo contraste.

### Estado Futuro
- A **coluna direita (Status/Câmera) migra para a Sidebar de Propriedades** global → a aba Informações foca só em conteúdo.
- **Uma única seção "Atividade & Observações"** (timeline) substitui os dois blocos duplicados.
- Dados da OS em `SectionCard` único; senha do dispositivo mantém o destaque âmbar (é uma boa decisão atual).

### Mockup ASCII
```
┌─ Dados da OS ──────────────────────────────────────────┐
│ [ℹ] Informações da OS                                  │
│ ───────────────────────────────────────────────────── │
│ Cliente            Equipamento                          │
│ João da Silva      iPhone 13 — Apple                    │
│                                                         │
│ Nº de Série        ┌─ Senha do Dispositivo ─┐           │
│ F2LXK9...          │ 1234  (mono, destaque) │           │
│                    └────────────────────────┘           │
│ Defeito Reclamado                                       │
│ ┌─────────────────────────────────────────────────┐    │
│ │ Não liga, tela apresenta linhas verticais…       │    │
│ └─────────────────────────────────────────────────┘    │
│ Telefone  (11) 98888-7777                               │
└─────────────────────────────────────────────────────────┘

┌─ Atividade & Observações ──────────────────────────────┐
│ [📄] Atividade                                         │
│ ───────────────────────────────────────────────────── │
│ │ ● 12 jun 14:32 — Status → Em Andamento               │
│ │ ● 12 jun 14:35 — Obs: "Iniciado diagnóstico…"        │
│ │ ◍ Nova observação                                    │
│ │   [ Descreva o diagnóstico, procedimentos… ]         │
└─────────────────────────────────────────────────────────┘
```

### Benefícios
- Fim da duplicação e da confusão de rótulo.
- Foco da aba em informação; controles ficam globais e sempre acessíveis.
- Timeline cronológica única (estilo Zendesk) dá história da OS de relance.

---

## Aba 2 — Fotos

### Estado Atual
- `<Card>` HeroUI (padrão divergente).
- Botão "remover" só aparece no hover (falha em touch).
- Lightbox manual sem Esc/navegação.
- Empty state com ícone `w-20`.

### Estado Futuro
- `SectionCard` unificado.
- Botão remover **sempre semi-visível** (canto, `opacity-70`), alvo ≥44px.
- Lightbox migrado para `<Modal size="5xl">` com setas ‹ › e contador "3/8".
- Empty state padronizado (`EmptyState`).

### Mockup ASCII
```
┌─ Galeria de Fotos ─────────────────────────────────────┐
│ [📷] Fotos                              [ + Adicionar ] │
│ ───────────────────────────────────────────────────── │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐                    │
│  │ ⭐   │ │      │ │      │ │      │   ← grid 2/3/4 cols │
│  │   🗑 │ │   🗑 │ │   🗑 │ │   🗑 │     remover visível │
│  └──────┘ └──────┘ └──────┘ └──────┘                    │
│  Máx 5MB · JPG, PNG, GIF                                │
└─────────────────────────────────────────────────────────┘

Lightbox (Modal 5xl):
┌─────────────────────────────────────── [3/8]  [x] ┐
│  ‹              [   imagem   ]               ›     │
└────────────────────────────────────────────────────┘
```

### Benefícios
- Remoção utilizável em touch.
- Navegação entre fotos sem fechar/reabrir.
- Acessibilidade (focus trap, Esc) herdada do Modal.

---

## Aba 3 — Laudo Técnico

### Estado Atual
- `<Card>` HeroUI separado, 5 textareas soltas.
- Relação com "Observações Técnicas" não esclarecida.
- Botão "Salvar Laudo" independente — mais um "salvar" disperso.

### Estado Futuro
- `SectionCard` unificado, 5 campos agrupados em uma "ficha" com sub-headers.
- **Indicador de progresso do laudo** (ex.: "3/5 campos preenchidos") para sinalizar prontidão.
- Salvamento integra-se à barra de ação fixa (não mais botão isolado), ou mantém Salvar local **rotulado claramente**.

### Mockup ASCII
```
┌─ Laudo Técnico Estruturado ────────── 3/5 preenchidos ─┐
│ [📄] Laudo                                             │
│ ───────────────────────────────────────────────────── │
│ Diagnóstico Técnico                                     │
│ [ …………………………………………………………………… ]                          │
│ Causa do Problema                                       │
│ [ …………………………………………………………………… ]                          │
│ Procedimentos Realizados                                │
│ [ …………………………………………………………………… ]                          │
│ Condição Final                                          │
│ [ …………………………………………………………………… ]                          │
│ Recomendações ao Cliente                                │
│ [ …………………………………………………………………… ]                          │
└─────────────────────────────────────────────────────────┘
```

### Benefícios
- Progresso visível reduz dúvida sobre "o que falta".
- Consistência visual com as demais abas.
- Menos botões "salvar" concorrentes.

---

## Aba 4 — Peças

### Estado Atual
- IIFE de agrupamento com ~300 linhas e JSX até 8 níveis (insustentável).
- `flex justify-between` quebra mal em telas estreitas (valores comprimem descrição).
- Cards de peça misturam muita informação (chips, datas, quebras associadas, totais).

### Estado Futuro
- Extrair `<PecaItem>` e `<TotaisGerais>` em componentes.
- **Card de peça com hierarquia clara:** linha 1 (descrição + chips de estado), linha 2 (qtd/custo/venda), bloco colapsável de quebras associadas, totais à direita em coluna fixa que **empilha no mobile**.
- Opção futura de **tabela densa** quando há muitos itens.

### Mockup ASCII
```
┌─ Peças Associadas à OS ─────────────────────── [ 3 ] ──┐
│ ┌─ PecaItem ─────────────────────────────────────────┐ │
│ │ [Estoque] [● Baixado]                              │ │
│ │ Tela iPhone 13 OLED          Custo R$120  Venda 280│ │
│ │ Cód: 789012 · Qtd: 1                               │ │
│ │ ▸ ⚠ 1 quebra registrada (Pendente) — R$ 280  [ver] │ │
│ └────────────────────────────────────────────────────┘ │
│ ── Totais ──────────────────────────────────────────── │
│ Itens: 3    Custo: R$ 410,00    Venda: R$ 760,00        │
└─────────────────────────────────────────────────────────┘
```

### Benefícios
- Manutenibilidade (fim da IIFE gigante).
- Leitura mais limpa; quebras associadas colapsadas reduzem ruído.
- Responsividade real no mobile.

---

## Aba 5 — Quebras

### Estado Atual
- `<Card>` HeroUI; botão "Registrar Quebra" em card próprio + lista.
- Empty state positivo ("Isso é ótimo!") — boa decisão, manter tom.

### Estado Futuro
- `SectionCard` unificado; ação "Registrar Quebra" como botão no header do card (slot de ação do `SectionCard`).
- Lista de quebras com `<QuebraItem>` extraído; status (Aprovada/Pendente) e "Será Descontado" via Chip padrão.
- Total consolidado mantido.

### Mockup ASCII
```
┌─ Quebras Registradas ──────────── [+ Registrar Quebra] ┐
│ ┌────────────────────────────────────────────────────┐ │
│ │ Tela iPhone 13        [● Pendente]      R$ 280,00   │ │
│ │ Qtd: 1 · quebra · Resp.: técnico   [Será Descontado]│ │
│ │ "Caiu durante a remoção do conector"               │ │
│ │ Registrado 12 jun 15:10                            │ │
│ └────────────────────────────────────────────────────┘ │
│ ── Total: 1 pendente · 0 aprovada ───────── R$ 280,00 ─ │
└─────────────────────────────────────────────────────────┘

Empty (manter tom positivo):
        ✓  Nenhuma quebra registrada
        Isso é ótimo! Mantenha o cuidado com as peças.
```

### Benefícios
- Ação no contexto do card (menos cards soltos).
- Consistência visual e de componentes.

---

# Fluxo de Conclusão da OS

## Fluxo atual (problemático)
```
Técnico clica "Concluir OS" (coluna direita, topo)
      │
      ▼
Validação exige observação → toast de ERRO
      │
      ▼
Técnico precisa ROLAR até o fim para achar o campo de observação
      │
      ▼
Escreve → rola de volta → clica Concluir de novo
      │
      ▼  (laudo? peças? — não está claro se são obrigatórios)
Conclui sem certeza do que faltava
```
**Dores:** causa-efeito separados no espaço; pré-requisitos implícitos; 3 botões de "salvar" diferentes; sem visão do que falta.

## Fluxo proposto
```
Barra de ação fixa sempre visível com [ ✓ Concluir OS ]
      │
      ▼
Ao clicar, abre CHECKLIST DE CONCLUSÃO (popover/modal leve)
      │
      ├─ ✓ Observação técnica preenchida
      ├─ ✓ Laudo (3/5)  — opcional, sinalizado
      ├─ ⚠ Status atual: Em Andamento → vai para Concluído
      └─ ⓘ Quebras pendentes: 1 (informativo)
      │
      ▼
Itens faltantes são CLICÁVEIS → levam direto ao campo
      │
      ▼
Tudo ok → [ Confirmar conclusão ] → sucesso → volta à lista
```

## Wireframe textual do checklist de conclusão
```
┌─ Concluir Ordem de Serviço #1042 ──────── [x] ┐
│ Revise antes de concluir:                      │
│                                                │
│  ✓  Observação técnica preenchida              │
│  ✓  Status definido (Em Andamento → Concluído) │
│  ⚠  Laudo técnico incompleto (3/5)   [revisar] │
│  ⓘ  1 quebra pendente de aprovação             │
│                                                │
│  Garantia que será aplicada: 90 dias           │
│                                                │
├────────────────────────────────────────────────┤
│              [ Cancelar ]   [ ✓ Confirmar ]    │
└────────────────────────────────────────────────┘
```

**Melhorias de UX:**
- A ação principal nunca sai da tela (barra fixa).
- Pré-requisitos explícitos e clicáveis (atalho até o campo).
- Distinção clara entre **bloqueante** (✓/✗) e **informativo/opcional** (⚠/ⓘ).
- Um só ponto de "salvar para concluir" — fim da dispersão.

---

# Redesign dos Modais

## Modal 1 — Registrar Quebra/Perda de Peça

### Estrutura atual
`Modal 2xl` · 6 campos empilhados (Produto → Qtd → Tipo → Responsável → Motivo → [Descontar]) → Valor → Adicionar à lista → lista acumulada → total.

### Problemas
- Sem agrupamento (formulário longo monótono).
- Emojis nas opções (🔨 ⚠️ 📦 ⏰ 👤 🏭) — informal.
- Validação só via toast no clique.
- Inconsistência de `variant` entre campos.
- Scroll dentro de scroll (lista `max-h-48` dentro do modal) no mobile.

### Novo layout
3 seções (**Peça** · **Classificação** · **Detalhes**), Heroicons no lugar de emojis, todos os campos `bordered`, validação inline, resumo de valor fixo, lista acumulada em painel visualmente separado.

### Mockup ASCII
```
┌─ Registrar Quebra ────────────────────────── [x] ┐
│ [⚠ InlineAlert] Vai para aprovação do admin.      │
├───────────────────────────────────────────────────┤
│ PEÇA                                              │
│ [ Produto ▾ ............. 2 disp. · R$280 ]        │
│ [ Quantidade: 1 ]                → Total: R$ 280,00│
│ ─────────────────────────────────────────────────│
│ CLASSIFICAÇÃO                                     │
│ [🔧 Tipo ▾ ]        [👤 Responsável ▾ ]            │
│ ☐ Descontar do salário do técnico                 │
│ ─────────────────────────────────────────────────│
│ DETALHES                                          │
│ [ Motivo detalhado * .......................... ] │
│                                                   │
│ [ + Adicionar à lista ]                           │
├─ Lista (2) ───────────────────────── Total R$ 360 ┤
│ • Tela iPhone 13 — R$280  [🗑]                     │
│ • Flex carga     — R$ 80  [🗑]                     │
├───────────────────────────────────────────────────┤
│             [ Cancelar ]   [ Registrar (2) ]      │
└───────────────────────────────────────────────────┘
```

### Melhorias de UX
- Hierarquia por seções reduz carga cognitiva.
- Ícones consistentes com o sistema.
- Validação inline (`isInvalid`/`errorMessage`) evita o ciclo toast→procurar campo.
- No mobile: `placement="bottom"`, footer `fullWidth`, lista sem scroll aninhado (cresce o modal).

---

## Modal 2 — Visualização de Foto (Lightbox)

### Estrutura atual
`<div fixed inset-0 bg-black/90>` manual, `role="button"`, fecha no clique/Enter/Espaço.

### Problemas
- Sem focus trap, sem `Esc`, semântica incorreta (`role="button"` em dialog).
- Sem navegação entre fotos.
- Inconsistente com os demais modais.

### Novo layout
`<Modal size="5xl">` com `role="dialog"`, Esc nativo, setas ‹ ›, contador, botão fechar.

### Mockup ASCII
```
┌──────────────────────────────────── [4/8]  [x] ┐
│                                                 │
│   ‹            [    imagem    ]            ›     │
│                                                 │
│        [ ⭐ Definir como principal ]  [ 🗑 ]     │
└─────────────────────────────────────────────────┘
```

### Melhorias de UX
- Navegação fluida na galeria.
- Acessibilidade nativa (teclado, leitor de tela).
- Consistência total com o sistema de modais.

---

## Modal 3 — Confirmação (`useConfirm`)

### Estrutura atual
Bom padrão (título, mensagem, variante danger, botões claros).

### Ajuste proposto
Manter. Garantir **foco inicial no botão menos destrutivo** (Cancelar) e botões `fullWidth` empilhados no mobile. Reutilizar este componente como base do **checklist de conclusão** (variante informativa).

---

# Responsividade

## Desktop (≥1280px)
- Duas colunas: principal + sidebar de propriedades sticky.
- Barra de ação fixa no rodapé.
- `max-w-[1600px]` (alinhado ao padrão do sistema; corrige o atual `max-w-6xl`).

```
[ Header ............................................ ]
[ Conteúdo (tabs + cards) .......... ][ Sidebar ▓▓▓ ]
[ ●não salvo      Salvar    ✓ Concluir (fixo) ...... ]
```

## Notebook (1024–1280px)
- Mesma estrutura de 2 colunas; sidebar levemente mais estreita.
- Sem quebras.

```
[ Header ......................................... ]
[ Conteúdo ................. ][ Sidebar ▓▓ ]
[ barra de ação fixa ............................. ]
```

## Tablet (768–1024px) — foco bancada
- **Sidebar colapsa em uma faixa superior** de propriedades (chips/resumo) logo abaixo do header, OU vira um botão "Detalhes" que abre um Drawer lateral.
- Conteúdo ocupa largura total.
- Barra de ação fixa permanece (essencial para bancada).

```
[ Header + faixa de propriedades (chips) ]
[ Tabs ]
[ Conteúdo full-width ]
[ ●não salvo   Salvar   ✓ Concluir (fixo) ]
```

## Mobile (<768px)
- Coluna única.
- Propriedades em **acordeão "Detalhes da OS"** (recolhido por padrão) — status editável no topo.
- Tabs com **scroll horizontal** (evita corte/estouro).
- Barra de ação fixa com botões `fullWidth` (Concluir em destaque).
- Modais `placement="bottom"`, alvos ≥44px.

```
[ Header compacto ]
[ Status ▾  (editável)                ]
[ ▸ Detalhes da OS (acordeão)         ]
[ ‹ Info · Fotos · Laudo · Peças · ›  ]  ← scroll horizontal
[ Conteúdo ........................... ]
[ ●  Salvar | ✓ Concluir  (fixo)      ]
```

---

# Quick Wins (< 2 horas cada)

| # | Quick Win | Esforço |
|---|---|---|
| 1 | Remover a duplicação de "Observações Técnicas" (manter só a timeline) | ~30 min |
| 2 | Trocar emojis por Heroicons no modal de quebra (tipo/responsável) | ~30 min |
| 3 | Padronizar loading: usar `<Spinner>` HeroUI em todos os pontos | ~30 min |
| 4 | Unificar badges do header em `<Chip>` HeroUI | ~45 min |
| 5 | Rótulos `text-[10px] text-default-400` → `text-tiny text-default-500` (contraste AA) | ~45 min |
| 6 | Botão "remover foto" sempre semi-visível + alvo ≥44px | ~30 min |
| 7 | `max-w-6xl` → `max-w-[1600px]` (alinhar ao sistema) | ~5 min |
| 8 | Adicionar `Esc` para fechar o lightbox atual (antes da migração completa) | ~15 min |
| 9 | Corrigir opções do select de Status para cobrir todos os estados válidos | ~45 min |
| 10 | Empty states: padronizar tamanho de ícone e tipografia | ~30 min |

---

# Ordem Recomendada de Implementação

## Fase 1 — Fundação e Quick Wins  ✅ CONCLUÍDA (jun/2026)
**Objetivo:** padronizar a base e colher ganhos de consistência sem rearquitetar.
- Extrair `SectionCard`, `EmptyState`, `InlineAlert` (componentes-base).
- Unificar Cards de todas as abas no `SectionCard`.
- Unificar Badges em `<Chip>`; padronizar Loading; padronizar Empty States.
- Quick Wins 1, 2, 3, 5, 6, 7, 9, 10.
- Rótulos com contraste AA + alvos de toque ≥44px.

| Métrica | Valor |
|---|---|
| Complexidade | Baixa–Média |
| Impacto | **Alto** (consistência + acessibilidade imediatas) |
| Tempo estimado | **2–3 dias** |

## Fase 2 — Arquitetura "Issue" e Fluxo de Conclusão  ✅ CONCLUÍDA (jun/2026)
**Objetivo:** reestruturar o layout e resolver a dor central do técnico.
- Sidebar de propriedades sticky (mover Status/Câmera/Bancada + metadados).
- Barra de ação fixa com indicador de "não salvo".
- Checklist de conclusão (reusando `useConfirm` como base).
- Timeline unificada de atividade/observações.
- Extrair cada aba em componente (`TabInformacoes`, `TabFotos`, `TabLaudo`, `TabPecas`, `TabQuebras`) — quebrar o monólito.

| Métrica | Valor |
|---|---|
| Complexidade | **Alta** |
| Impacto | **Alto** (produtividade + manutenibilidade) |
| Tempo estimado | **4–6 dias** |

## Fase 3 — Modais, Responsividade e Refinamento  ✅ CONCLUÍDA (jun/2026)
**Objetivo:** polir a experiência e fechar acessibilidade.
- Migrar lightbox de foto para `<Modal>` com navegação + Esc.
- Redesign do modal de quebra (seções + validação inline).
- Responsividade tablet/mobile (faixa/acordeão de propriedades, tabs com scroll horizontal, modais bottom).
- Skeletons no carregamento inicial.
- Tooltips em ações destrutivas; breadcrumb; micro-interações (scale-105).

| Métrica | Valor |
|---|---|
| Complexidade | Média |
| Impacto | Médio–Alto (acabamento SaaS + mobile) |
| Tempo estimado | **3–4 dias** |

**Total estimado:** ~9–13 dias de implementação.

---

# Checklist Final de Implementação

> Legenda: `[x]` concluído · `[~]` parcial · `[ ]` pendente. Notas explicam decisões de escopo.

## Componentes-base
- [x] `SectionCard` criado e documentado (header com ícone/título/slot de ação) — `components/ordem-servico/SectionCard.tsx`
- [ ] `EmptyState` criado — *não componentizado; empty states permanecem inline (padronizados visualmente nas abas)*
- [ ] `InlineAlert` criado — *não componentizado; alertas do modal de quebra refeitos inline com Heroicon*
- [~] Mapa central de cores semânticas — `getStatusColor` tipado e reativado; mapa de prioridade ainda inline

## Design System aplicado
- [x] Todos os Cards usam `SectionCard` (zero `<Card> shadow-medium` remanescente na tela)
- [x] Todos os Badges usam `<Chip>` (zero `<span>` de status manual)
- [x] Todos os Loadings usam `<Spinner>`/`<Skeleton>`/`isLoading` (zero `animate-spin` manual na tela)
- [~] Empty States padronizados — consistentes, mas inline (sem componente `EmptyState`)
- [~] Campos de formulário `variant="bordered"` — aplicado; `labelPlacement="outside"` não em 100%
- [x] Rótulos neutros com contraste AA — `text-[9px]/[10px] text-default-400` → `text-[11px] text-default-500` (DetailField, header, StatusProgressBar, OSControlSidebar). *Resta revisar hints `text-xs text-default-400` (12px) secundários.*
- [~] Emojis → Heroicons — feito no modal de quebra; resta o `⭐ Principal` na aba Fotos

## Arquitetura
- [~] Página dividida em componentes de aba — `TabPecas`, `TabQuebras` extraídos; `Laudo` já era componente; `Informações`/`Fotos` permanecem inline
- [~] Decomposição de itens — IIFE de Peças movida para `TabPecas`; `PecaItem`/`QuebraItem`/`TotaisGerais` não extraídos individualmente
- [x] Sidebar de propriedades sticky implementada — `OSControlSidebar` (Status + Câmera); prazo/garantia/valor seguem como chips no header
- [ ] `max-w-6xl` → `max-w-[1600px]` — *mantido `max-w-6xl` (decisão de escopo)*

## Fluxo de conclusão
- [x] Barra de ação fixa (sticky) com indicador de "alterações não salvas"
- [x] Checklist de conclusão com itens bloqueantes vs. informativos
- [x] Itens faltantes clicáveis (botão "Preencher" → aba Informações)
- [x] Um único ponto de "salvar para concluir" (dispersão eliminada)
- [x] Observações duplicadas removidas (timeline única)

## Modais
- [x] Lightbox migrado para `<Modal size="5xl">` (focus trap, Esc, ‹ ›, contador)
- [~] Modal de quebra reorganizado em 3 seções — seções + Heroicons + `bordered` feitos; **validação inline NÃO** (mantida a validação por toast para não alterar regras)
- [ ] `useConfirm` com foco inicial em Cancelar; botões `fullWidth` no mobile — *fora do escopo desta tela*
- [~] Modais com `scrollBehavior="inside"` (pré-existente); `placement` mobile-bottom usa o default `auto` do HeroUI

## Responsividade
- [x] Desktop/Notebook: 2 colunas + sidebar sticky + barra fixa
- [ ] Tablet: faixa/Drawer de propriedades — *sidebar empilha; sem faixa dedicada*
- [~] Mobile: tabs com scroll horizontal ✅ + barra fixa `fullWidth` ✅; acordeão de propriedades não implementado
- [ ] Sem scroll aninhado em listas dentro de modais no mobile — *não tratado*

## Acessibilidade
- [x] Contraste dos rótulos pequenos ≥ 4.5:1 (WCAG AA) — labels neutros migrados para `text-default-500` (11px). *Hints secundários `text-xs` ainda em revisão.*
- [~] Áreas de toque ≥ 44×44px — remover foto melhorado; revisão sistemática pendente
- [x] Nenhuma ação dependente exclusivamente de hover (remover foto agora sempre visível)
- [x] Lightbox e modais com `role`/`aria-modal`/focus trap corretos
- [x] Navegação por teclado (Esc nos modais; setas via botões no lightbox)
- [x] `alt` de imagens descritivo (inclui ordem da foto)

## Refinamento
- [x] Skeletons no carregamento inicial
- [x] Breadcrumb de localização (Minhas Ordens › OS #N)
- [~] Tooltips em ações destrutivas — adicionado em "remover foto"; demais ações pendentes
- [x] Micro-interações suaves (`scale-105` nas fotos)
- [ ] Indicador de progresso do Laudo (x/5 campos) — *não implementado*

## Validação final
- [x] `tsc` sem erros · ESLint limpo · `next build` ✓ Compiled successfully (38/38)
- [~] Dark mode — classes dark preservadas em todos os componentes; revisão visual pendente
- [ ] Testado em desktop, tablet e mobile reais — *pendente (sem smoke test visual)*
- [ ] Fluxo de conclusão validado com um técnico (teste de usabilidade)
- [x] Identidade corporativa preservada (neutro, sem gradiente, cor só semântica)

---

## Status de implementação (jun/2026)

As três fases foram implementadas e validadas por `tsc` + ESLint + `next build`. Componentes criados:
`SectionCard`, `OSControlSidebar`, `TabPecas`, `TabQuebras` (+ `LaudoTecnico` migrado).
Página reduzida de ~1.976 → ~1.250 linhas.

**Itens deliberadamente deixados para depois** (registrados acima como `[ ]`/`[~]`):
- Timeline rica de atividade (obs + status + quebras) — exige histórico de status que o banco não fornece sem nova query.
- Revisão sistemática de área de toque (≥44px) e contraste dos hints secundários `text-xs` (12px). *Contraste dos rótulos pequenos (9–11px) já corrigido.*
- Componentização de `EmptyState`/`InlineAlert`; `max-w-[1600px]`; indicador de progresso do Laudo.
- Validação inline no modal de quebra (mantida por toast para não alterar regras de negócio).
- Smoke test visual real (desktop/tablet/mobile) e teste de usabilidade com técnico.

*Restrição respeitada em todas as fases: apenas UI/UX/componentização — nenhuma regra de negócio, query, mutation, permissão ou validação foi alterada.*
