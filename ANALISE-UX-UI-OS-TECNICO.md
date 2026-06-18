# Análise UX/UI — Tela de Detalhe da OS (Técnico)

**Rota:** `/sistema/ordem-servico/tecnico/[id]`
**Arquivo principal:** `app/sistema/ordem-servico/tecnico/[id]/page.tsx` (1.976 linhas)
**Componentes auxiliares:** `LaudoTecnico.tsx`, `RegistrarQuebraModal.tsx`, `useConfirm.tsx`, visualizador de foto inline
**Stack de UI:** Next.js (App Router) + HeroUI 2.8 + Tailwind + Heroicons + Supabase
**Data da análise:** 17/06/2026
**Escopo:** documental — nenhuma alteração de código foi realizada.

> Nota de contexto: esta tela já passou por um *rollout* de design system corporativo (tokens `bg-content1`, `border-default-200/70`, cor apenas semântica, Heroicons). A análise abaixo parte desse patamar já elevado e foca no **próximo salto de maturidade** — consistência interna, hierarquia e padronização de componentes.

---

## 1. Avaliação Geral da Interface

### Primeira impressão visual
A tela transmite **organização e profissionalismo**. O cabeçalho de OS é bem resolvido: número da OS, nome do cliente, data, badges de status/prioridade/senha e uma **barra de progresso de status** (`StatusProgressBar`). A leitura "de relance" funciona — em 2 segundos o técnico entende qual OS é, em que etapa está e se é urgente.

### Nível de maturidade do sistema
**Alto para um ERP de assistência técnica.** Há atenção a detalhes raros nesse segmento: timeline de observações, barra de progresso por etapa, estados vazios ilustrados, dark mode consistente, agrupamento de peças, badge de prazo com cor dinâmica (vermelho/laranja/azul conforme proximidade do vencimento). Está acima da média de sistemas internos.

### Aparência corporativa
**Boa.** Superfícies neutras, sombras discretas (`shadow-sm`), cantos `rounded-xl`, tipografia sóbria. A cor é usada de forma majoritariamente semântica. Foge bem do visual "colorido demais" comum em sistemas de oficina.

### Consistência visual — **principal ponto fraco**
Há **duas linguagens de card convivendo na mesma página**:
- **Aba "Informações"**: cards manuais (`<div className="bg-content1 rounded-xl shadow-sm border border-default-200/70 p-5">`) com header customizado (ícone em tile `bg-primary/10` + título `text-sm font-semibold`).
- **Abas "Fotos", "Laudo", "Peças", "Quebras"**: componente `<Card>`/`<CardHeader>`/`<CardBody>` do HeroUI com `shadow-medium` e títulos `text-lg font-semibold`.

Resultado: ao trocar de aba, o usuário percebe uma sutil "troca de personalidade" da interface (sombra diferente, raio diferente, tamanho de título diferente). É o item de maior impacto de consistência.

### Clareza das informações
Muito boa na maioria dos blocos. Exceção importante: **a seção "Observações Técnicas" aparece duplicada** na aba Informações — uma vez como bloco de leitura (linhas 804-823) e novamente como editor com timeline (linhas 994-1054), ambas com o mesmo título "Observações Técnicas". Isso confunde: o usuário vê o mesmo rótulo duas vezes e precisa descobrir qual é o de edição.

### Hierarquia visual
Funciona no header, mas **enfraquece no corpo**. Há muitos rótulos em `text-[10px] uppercase tracking-wider text-default-400` competindo entre si, e blocos de igual peso visual empilhados sem âncoras claras de "o que é mais importante agora". A ação principal do técnico (mudar status / concluir) está na coluna lateral direita, com peso visual semelhante ao da câmera — poderia ser mais dominante.

---

## 2. Análise de UX (Experiência do Usuário)

### Fluxo de navegação
O fluxo central é: **abrir OS → ler defeito → mudar status → escrever observação → (fotos/laudo/peças) → concluir.** A estrutura de 5 abas (Informações, Fotos, Laudo, Peças, Quebras) é adequada e escalável.

**Atrito identificado:** a ação de "Concluir OS" exige observação técnica preenchida (`concluirOS` valida `observacoes.trim()`), mas:
1. O botão "Concluir OS" fica na coluna direita (topo), enquanto o campo de observação fica **lá embaixo**, em outro bloco. O técnico clica em Concluir, recebe o toast de erro "Adicione observações", e precisa rolar para achar o campo. **Causa-efeito separados espacialmente.**
2. Há um campo de observação (na aba Informações) e um **Laudo Técnico estruturado** (aba separada, 5 campos). Não está claro para o técnico qual é obrigatório para fechar a OS, nem como os dois se relacionam.

### Facilidade de uso
Alta para tarefas simples (mudar status, anexar foto). Média para o fluxo completo de conclusão, por causa da dispersão descrita acima.

### Quantidade de cliques
- **Mudar status:** abrir select → escolher → Salvar = 3 cliques. Aceitável.
- **Concluir com laudo completo:** trocar de aba → preencher 5 textareas → Salvar Laudo → voltar à aba Informações → escrever observação → Concluir. Fluxo longo e com troca de contexto.
- **Salvar é fragmentado:** há "Salvar" (status+observação), "Salvar Laudo Técnico" (aba Laudo) e "Concluir OS". Três botões de salvar diferentes, em locais diferentes, sem um indicador global de "há alterações não salvas".

### Possíveis pontos de confusão
- **Bancada vs. Câmera:** o card "Câmera ao Vivo" só aparece se `novoStatus === "em_andamento"` ou se já há bancada. A relação "preciso estar Em Andamento para ter câmera/bancada" é implícita. O estado vazio ("Câmera disponível ao iniciar manutenção") ajuda, mas a regra de negócio fica escondida.
- **Status do select ≠ status real:** o `<Select>` de status oferece apenas `em_andamento`, `em_diagnostico`, `aguardando_pecas`, mas o status real da OS pode ser `aguardando`, `aprovado`, `concluido`, `entregue`. Se a OS está "Aguardando", o select pode exibir um valor que não bate com as opções, e o técnico não tem como sair de certos estados.
- **Duplicação de "Observações Técnicas"** (ver item 1).
- **Salvar status não persiste a observação de forma óbvia:** `salvarAtualizacao` salva status **e** observação juntos, mas o botão se chama só "Salvar" sob o título "Status".

### Experiência para técnicos em campo / bancada
Esse é o usuário-alvo e merece atenção especial:
- ✅ Senha do dispositivo em destaque (tile âmbar, fonte mono grande) — excelente para quem está com o aparelho na mão.
- ✅ Botão de foto grande (`size="lg"`, `w-full`) — bom para dedos.
- ⚠️ **Áreas de toque pequenas:** botão de voltar e ações de remover foto (`size="sm"`, ícone 16px) ficam abaixo dos 44×44px recomendados para uso com luva/dedo.
- ⚠️ **Remover foto só aparece no hover** (`opacity-0 group-hover:opacity-100`) — em touch não há hover; o técnico precisa tocar para revelar, comportamento não óbvio.
- ⚠️ Muito scroll vertical para completar uma OS — em uma bancada com tablet, o ideal seria menos rolagem e ações fixas.

### Experiência desktop vs. mobile
- **Desktop:** bom aproveitamento; grid de 3 colunas (`lg:grid-cols-3`) com info à esquerda e controles à direita.
- **Mobile:** colapsa para 1 coluna corretamente, mas a coluna de **controles (status/concluir) vai para o final**, depois de toda a informação — o técnico precisa rolar muito para agir. As **barras de ação não são fixas (sticky)**, então a ação principal pode ficar fora da viewport.

---

## 3. Análise de UI (Interface)

| Elemento | Avaliação | Observações |
|---|---|---|
| **Espaçamentos** | Bom | `p-5` em cards, `gap-6` em grids, `space-y-6` — coerente. Pequena inconsistência: cards manuais usam `p-5`, os `<Card>` HeroUI usam o padding default (`p-3`/`p-4`). |
| **Grid/Layout** | Bom | `max-w-6xl mx-auto`, grid 2/3 responsivo. Header poderia usar `max-w-[1600px]` como o resto do sistema (memória do design system) — aqui está `max-w-6xl`, divergente. |
| **Tipografia** | Médio | Escala saudável (`text-xl` h1, `text-sm` corpo), mas **excesso de `text-[10px]`/`text-[9px]`/`text-[11px]`** hardcoded em vez de tokens (`text-tiny`). Títulos de seção variam entre `text-sm` (cards manuais) e `text-lg` (Cards HeroUI). |
| **Contraste** | Médio | `text-default-400` em rótulos `10px` é o ponto mais fraco — texto pequeno + baixo contraste reprova WCAG AA. `text-default-300` (linha 571) é ainda mais crítico. |
| **Paleta** | Bom | Disciplina semântica: emerald=positivo, vermelho=negativo, âmbar=atenção, primary=ação. Boa adesão ao design system. |
| **Botões** | Médio | Mistura de `variant` (solid/flat/light/bordered) bem aplicada, mas há **inconsistência de tamanho** (`size="md"`, `"sm"`, `"lg"`) sem regra clara. O CTA principal "Concluir" usa `variant="flat"` (peso visual fraco para a ação mais importante). |
| **Inputs** | Bom | Textareas e selects com `variant="bordered"` e `bg-default-100` consistente. |
| **Selects** | Médio | O select de Status oferece opções incompletas (ver item 2). Selects de Bancada bem feitos. |
| **Checkboxes** | OK | Único checkbox na tela (no modal de quebra), com label + descrição. Adequado. |
| **Tabelas** | N/A | A tela não usa tabela — peças/quebras são renderizadas como **listas de cards**. Funciona, mas com muitos itens uma tabela densa seria mais escaneável. |
| **Cards** | Médio | **Dois padrões coexistindo** (manual vs. HeroUI) — maior débito de consistência. |
| **Badges/Chips** | Médio | Header usa `<span>` estilizados manualmente com classes de cor; abas usam `<Chip>` do HeroUI. Dois sistemas de badge para a mesma função (contadores/status). Recomenda-se unificar em `<Chip>`. |
| **Alertas** | Bom | Caixas semânticas (warning/danger/success) bem construídas no modal e nas quebras. Uso de emoji (⚠️ ❌) é informal para um produto corporativo. |
| **Tooltips** | Ausente | Não há tooltips. Ícones-ação (voltar, remover) dependem só de `aria-label`. Faltam dicas em ações destrutivas e em campos com regra de negócio. |
| **Ícones** | Bom | Heroicons outline consistentes, tamanhos coerentes (`w-4/w-5`). |
| **Breadcrumbs** | Ausente | Não há breadcrumb. O usuário se localiza só pelo header + botão "voltar". Um breadcrumb (Ordens › Técnico › #OS) ajudaria a orientação. |
| **Barras de ação** | Médio | Ações dispersas (3 botões de salvar em locais diferentes), sem barra de ação fixa/consolidada. |

---

## 4. Análise dos Modais

### 4.1 Modal "Registrar Quebra/Perda de Peça" (`RegistrarQuebraModal.tsx`)

- **Tamanho:** `size="2xl"`, `scrollBehavior="inside"`. Adequado para o volume de campos.
- **Organização:** formulário vertical (Produto → Quantidade → Tipo → Responsável → Motivo → [Descontar] → Valor → Adicionar à lista) + lista de quebras acumuladas + total. Lógica de "adicionar vários antes de salvar" é boa.

**Pontos positivos**
- Padrão "construir lista antes de confirmar" evita múltiplas idas ao banco.
- Validação de disponibilidade por produto (mostra "X disponível"/"ESGOTADO") direto no select.
- Aviso claro de que o registro vai para aprovação do admin.
- Total consolidado em destaque (vermelho) no rodapé da lista.

**Problemas encontrados**
- **Sem agrupamento visual:** 6 campos empilhados sem seções/divisores — parece um formulário longo e monótono. Falta hierarquia ("Dados da peça" vs. "Classificação" vs. "Financeiro").
- **Emojis como ícones de opção** (🔨 ⚠️ 📦 ⏰ 👤 🏭) — informal e inconsistente com os Heroicons do resto do sistema.
- **Campo "Motivo" é `isRequired`** mas a validação real acontece só no clique de "Adicionar"; não há indicação inline de erro.
- **Inputs sem `variant` definido** em alguns casos (Quantidade, alguns Selects) — herdam o default `flat` enquanto outros usam `bordered`, gerando inconsistência dentro do próprio modal.
- **`size="2xl"` em mobile** pode ficar apertado com o teclado aberto somado à lista rolável interna.
- Em telas pequenas, a lista interna (`max-h-48 overflow-y-auto`) cria **scroll dentro de scroll** (modal + lista), experiência confusa no touch.

**Sugestão de redesign**
1. Agrupar em 3 seções com sub-headers discretos: **Peça** (produto + quantidade + valor calculado), **Classificação** (tipo + responsável + descontar), **Detalhes** (motivo).
2. Substituir emojis por Heroicons (`WrenchIcon`, `ExclamationTriangleIcon`, `ArchiveBoxIcon`, `ClockIcon`).
3. Padronizar todos os campos para `variant="bordered"`.
4. Mostrar o "Valor Total" como uma linha-resumo fixa acima do botão, e a lista acumulada num painel lateral/inferior visualmente separado (ex.: fundo `bg-default-50`).
5. Validação inline com `isInvalid`/`errorMessage` do HeroUI em vez de só toast.

**Exemplo de melhoria (estrutura conceitual)**
```
┌─ Registrar Quebra ──────────────── [x] ┐
│ ⚠ Vai para aprovação do administrador  │
├────────────────────────────────────────┤
│ PEÇA                                    │
│ [ Produto ▾ ]   [ Qtd ]  → R$ 120,00    │
│ CLASSIFICAÇÃO                           │
│ [ Tipo ▾ ]      [ Responsável ▾ ]       │
│ ☐ Descontar do técnico                  │
│ DETALHES                                │
│ [ Motivo ............................. ]│
│ [ + Adicionar à lista ]                 │
├─ Lista (2) ──────────────── Total R$ … ┤
│ • Tela X  — R$120  [🗑]                  │
│ • Flex Y  — R$ 80  [🗑]                  │
├────────────────────────────────────────┤
│           [ Cancelar ]  [ Registrar (2) ]│
└────────────────────────────────────────┘
```

### 4.2 Modal de Confirmação (`useConfirm` / `ConfirmDialog`)
Usado para remover foto. Bom padrão (título, mensagem, variante `danger`, botões claros). Mantém consistência. Sem ressalvas relevantes além de garantir foco inicial no botão menos destrutivo (Cancelar).

### 4.3 "Modal" de visualização de foto (lightbox inline — linhas 1757-1792)
- **Não usa o componente Modal do HeroUI** — é um `<div fixed inset-0>` manual com `bg-black/90`.

**Pontos positivos:** fecha no clique fora, suporta Enter/Espaço, botão X visível, imagem `object-contain`.

**Problemas:**
- **Sem foco preso (focus trap)** nem `role="dialog"`/`aria-modal` — o `role="button"` no overlay é semanticamente incorreto para um lightbox.
- **Sem navegação entre fotos** (anterior/próxima) — com uma galeria de N fotos, o técnico precisa fechar e reabrir cada uma.
- **Sem `Esc` para fechar** (só Enter/Espaço no overlay).
- Inconsistente com o sistema de modais do resto do app.

**Sugestão:** migrar para `<Modal size="5xl">` do HeroUI (ganha focus trap, Esc, acessibilidade) e adicionar setas de navegação + contador "3/8".

### 4.4 Observação geral de modais
Em telas menores, todos os modais ganhariam com `placement="bottom"` / `scrollBehavior="inside"` consistente e botões de ação com largura total no mobile (footer empilhado).

---

## 5. Design System

### Consistência dos componentes
**Parcial.** O sistema tem uma base sólida de tokens, mas a tela **mistura componentes HeroUI prontos com reimplementações manuais** dos mesmos conceitos:
- Card manual vs. `<Card>` HeroUI.
- Badge manual (`<span>` com classes) vs. `<Chip>`.
- Lightbox manual vs. `<Modal>`.
- Spinner manual (`animate-spin border-b-2`, linhas 536/106) vs. `<Spinner>` HeroUI (linha 1202/1630). **Três jeitos de mostrar "carregando" na mesma feature.**

### Reutilização de padrões
- `DetailField` e `StatusProgressBar` são bons exemplos de componentização local.
- O "card de seção" (ícone em tile + título + borda inferior) é repetido inline ~6 vezes em vez de virar um `<SectionCard>` reutilizável.

### Escalabilidade
O arquivo tem **1.976 linhas em um único componente** — a aba "Peças" sozinha tem uma IIFE de agrupamento com ~300 linhas de JSX aninhado (até 8 níveis). Isso é difícil de manter e estende-se mal. Extrair cada aba (`<TabInformacoes>`, `<TabPecas>`, etc.) é necessário para escalar.

### Padronização de estados

| Estado | Situação |
|---|---|
| **Hover** | Bom — `hover:bg-content3`, `hover:shadow-lg`, `hover:border-primary`. Mas ações que **só existem no hover** (remover foto) falham no touch. |
| **Focus** | Fraco — sem estilos de foco visível customizados; dependente do default do HeroUI/browser. O lightbox manual não gerencia foco. |
| **Active** | Não tratado explicitamente. |
| **Disabled** | Bom — `isDisabled` aplicado coerentemente (status concluído desabilita edição; "Concluir" desabilita sem observação). |
| **Loading** | **Inconsistente** — 3 implementações diferentes (spinner CSS manual ×2, `<Spinner>` HeroUI, `isLoading` nos botões). Falta skeleton no carregamento inicial da página (hoje é spinner central genérico). |
| **Success** | Via toast + cor emerald. Bom. |
| **Error** | Só via toast — **sem validação inline** nos formulários. |
| **Warning** | Bem tratado (caixas âmbar, badge de prazo). |

---

## 6. Acessibilidade

| Item | Impacto | Constatação |
|---|---|---|
| Contraste de texto pequeno | **Alto** | `text-[10px]/[9px]` em `text-default-400`/`text-default-300` reprova WCAG AA (4.5:1). Afeta quase todos os rótulos de campo. |
| Tamanho de fonte | **Médio** | Rótulos de 9-10px são pequenos demais para uso em bancada/tablet à distância. |
| Área clicável | **Alto** | Botão voltar, remover foto e ações `size="sm"` ficam < 44px. Crítico para técnico em campo. |
| Ação só-hover | **Alto** | Remover foto invisível em touch; sem alternativa por toque. |
| Navegação por teclado | **Médio** | Tabs/inputs HeroUI são acessíveis, mas o lightbox manual não tem focus trap nem Esc. |
| Semântica do lightbox | **Médio** | `role="button"` em overlay de imagem é incorreto; deveria ser `dialog`. |
| Leitura visual / contraste de status | **Baixo** | Cores de status têm bom contraste; chips legíveis. |
| Foco visível | **Médio** | Sem reforço de `focus-visible` em elementos custom. |
| Alt text | **Baixo** | Imagens têm `alt`, porém genérico ("Foto da OS") — poderia incluir ordem/contexto. |

**Resumo de impacto:** Alto → contraste de rótulos, área de toque, ações só-hover. Médio → fonte, teclado no lightbox. Baixo → semântica de alt, contraste de status.

---

## 7. Responsividade

| Breakpoint | Avaliação | Observações |
|---|---|---|
| **Desktop (≥1280px)** | Bom | Grid 3 colunas equilibrado; `max-w-6xl` centraliza (mas diverge do `max-w-[1600px]` padrão do sistema). |
| **Notebook (~1024-1280px)** | Bom | `lg:grid-cols-3` ainda ativo; sem quebras. |
| **Tablet (~768-1024px)** | Médio | Cai para coluna única; controles de ação vão para o fim da página. Uso de bancada (tablet) sofre com o scroll. |
| **Mobile (<768px)** | Médio | Funciona, mas: ações não-fixas, muito scroll, áreas de toque pequenas, modais `2xl` apertados com teclado, lista interna com scroll aninhado. |

**Quebras/otimizações:**
- Tabs `underlined` com 5 abas + chips de contagem podem **estourar/cortar** em telas estreitas (sem scroll horizontal explícito nos tabs).
- A faixa de badges do header (`flex-wrap`) empilha bem, mas pode ocupar muita altura no mobile, empurrando o conteúdo.
- A grade de fotos (`grid-cols-2 md:3 lg:4`) é adequada.
- A IIFE de Peças com layout `flex justify-between` quebra mal em telas estreitas (valores totais à direita podem comprimir a descrição).

---

## 8. Modernização Visual (referências SaaS)

Para aproximar de **Linear / Notion / Jira / ClickUp / Zendesk / HubSpot** sem perder o tom corporativo:

1. **Barra de ação fixa (sticky)** — como o Linear/Jira: rodapé ou topo fixo com "Salvar" / "Concluir OS" sempre visível, com indicador de "alterações não salvas". Elimina o problema de causa-efeito separados.
2. **Layout de duas colunas estilo "issue"** — coluna principal (conteúdo) + sidebar de metadados fixa (status, prazo, garantia, técnico, bancada), como issue do Linear/Jira. Os badges do header viriam para essa sidebar como propriedades editáveis inline.
3. **Header mais enxuto + propriedades inline editáveis** — clicar no status no header abre o seletor (estilo Notion/Linear), em vez de um card de status separado.
4. **Densidade tipográfica do Linear** — substituir os múltiplos `10px uppercase` por um par consistente: rótulo `text-tiny text-default-500` + valor `text-sm text-foreground`. Menos "ruído de maiúsculas".
5. **Skeletons em vez de spinner** (Notion/Zendesk) no carregamento inicial.
6. **Timeline/atividade real** (estilo Zendesk/HubSpot ticket) — unificar observações, mudanças de status e quebras numa única timeline cronológica, em vez de blocos separados.
7. **Comando/atalhos** — `Cmd+S` para salvar, `Esc` para fechar modais (padrão Linear).
8. **Micro-interações sóbrias** — transições de 150-200ms em troca de aba e hover (já há algumas), evitando o `scale-110` agressivo na foto (trocar por `scale-105`).

---

## 9. Quick Wins (alto impacto, baixo esforço)

1. **Unificar os dois padrões de card** — escolher um (recomendo o card manual com tokens, que é mais elegante) e aplicar nas abas Fotos/Laudo/Peças/Quebras. *(consistência imediata)*
2. **Remover a duplicação de "Observações Técnicas"** na aba Informações — manter só o editor com timeline; renomear o bloco de leitura ou fundi-los.
3. **Mover o botão "Concluir OS" para perto do campo de observação** (ou tornar a barra de ação sticky) — resolve o atrito de causa-efeito.
4. **Trocar emojis por Heroicons** no modal de quebra e nos selects de tipo/responsável.
5. **Padronizar loading** — usar `<Spinner>` do HeroUI em todos os lugares; trocar o spinner inicial por skeleton.
6. **Subir contraste/tamanho dos rótulos** — `text-[10px] text-default-400` → `text-tiny text-default-500` (token + contraste).
7. **Tornar o botão "remover foto" visível em touch** (ou sempre semi-visível) e aumentar área de toque para 44px.
8. **Unificar badges do header** em `<Chip>` HeroUI no lugar dos `<span>` manuais.
9. **Corrigir o select de status** para refletir/permitir todos os estados válidos.
10. **`max-w-6xl` → `max-w-[1600px]`** para alinhar ao padrão do sistema.

---

## 10. Roadmap de Melhorias

### Prioridade Alta
| Melhoria | Benefício | Complexidade | Impacto UX |
|---|---|---|---|
| Barra de ação sticky (Salvar/Concluir) + indicador de não-salvo | Elimina scroll e erro de fluxo na conclusão | Média | Alto |
| Unificar padrão de cards (1 só linguagem visual) | Consistência percebida em toda a tela | Baixa | Alto |
| Remover duplicação de "Observações Técnicas" | Remove confusão de rótulo repetido | Baixa | Alto |
| Contraste + tamanho de rótulos (WCAG AA) | Acessibilidade e legibilidade em bancada | Baixa | Alto |
| Áreas de toque ≥44px + ações sem depender de hover | Usabilidade real do técnico em campo | Baixa | Alto |
| Corrigir opções incompletas do select de Status | Evita estados travados / inconsistência de dados | Baixa | Alto |

### Prioridade Média
| Melhoria | Benefício | Complexidade | Impacto UX |
|---|---|---|---|
| Migrar lightbox de foto para `<Modal>` + navegação + Esc | Acessibilidade e fluência na galeria | Média | Médio |
| Redesign do modal de quebra (seções + validação inline + Heroicons) | Formulário mais legível e seguro | Média | Médio |
| Extrair cada aba em componente próprio | Manutenibilidade/escalabilidade | Média | Baixo (interno) |
| Skeletons no carregamento inicial | Percepção de velocidade | Baixa | Médio |
| Sidebar de metadados estilo "issue" (status/prazo/garantia inline) | Modernização + menos scroll | Alta | Médio |
| Esclarecer relação Observação ↔ Laudo (o que é obrigatório para concluir) | Reduz incerteza no fechamento | Baixa | Médio |

### Prioridade Baixa
| Melhoria | Benefício | Complexidade | Impacto UX |
|---|---|---|---|
| Breadcrumb de localização | Orientação | Baixa | Baixo |
| Timeline unificada (obs + status + quebras) | Visão cronológica rica | Alta | Médio |
| Atalhos de teclado (Cmd+S, Esc) | Produtividade power-user | Média | Baixo |
| Tooltips em ações destrutivas/regras de negócio | Clareza | Baixa | Baixo |
| Tabela densa opcional para Peças/Quebras com muitos itens | Escaneabilidade | Média | Baixo |
| Reduzir `scale-110` → `scale-105` nas fotos | Refinamento | Trivial | Baixo |

---

## 11. Nota Final

| Critério | Nota | Justificativa resumida |
|---|---|---|
| **Design Visual** | **8.0** | Visual limpo, corporativo, dark mode sólido; perde por inconsistência entre padrões de card. |
| **UX** | **6.5** | Fluxo central funciona, mas conclusão é dispersa, há duplicações e regras implícitas. |
| **UI** | **7.0** | Tokens bem aplicados; ruído tipográfico (10px uppercase), badges/loading não unificados. |
| **Consistência** | **6.0** | Duas linguagens de card, três loadings, dois sistemas de badge na mesma tela. |
| **Acessibilidade** | **5.0** | Contraste de rótulos, área de toque e ações só-hover reprovam pontos de WCAG AA. |
| **Responsividade** | **6.5** | Funciona em todos os tamanhos, mas ações não-fixas e scroll aninhado pesam no mobile/tablet. |
| **Aparência Corporativa** | **8.5** | Forte — sóbrio, neutro, semântico; acima da média do segmento. |
| **Escalabilidade** | **5.5** | Componente monolítico de ~2.000 linhas; abas e cards de seção não componentizados. |

### Média geral: **6.6 / 10**

**Veredito:** uma tela **madura e visualmente acima da média** para o segmento, já beneficiada por um design system em adoção. O salto de qualidade virá de **consolidação e padronização** (um só padrão de card, um só loading, um só sistema de badge), de **resolver o fluxo de conclusão** (ações fixas perto do contexto) e de **acessibilidade prática para o técnico de bancada** (contraste, toque, sem depender de hover). Nenhuma reconstrução é necessária — são refinamentos de alto retorno sobre uma base já boa.

---

*Documento gerado para fins de planejamento de melhorias. Nenhuma alteração de código foi aplicada.*
