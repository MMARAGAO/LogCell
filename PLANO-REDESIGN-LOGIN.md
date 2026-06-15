# Plano de Redesign — Tela de Login (`/auth`)

> Objetivo: deixar a tela de entrada **corporativa, porém atual** — alinhada ao design system neutro do sistema, mas com a sofisticação esperada de uma tela de marca/entrada. Sem alterar nenhuma lógica (auth, PWA, validações).

---

## 1. Diagnóstico do estado atual

`app/auth/page.tsx` + `components/auth/LoginForm.tsx` + `components/auth/CadastroForm.tsx`

- **Layout:** card único centralizado (`max-w-xl`) com abas Login/Cadastro.
- **Logo:** "flutuando" no canto superior esquerdo, dentro de um círculo `bg-primary/10` com `shadow-lg` e `hover:scale-110`.
- **Botão PWA:** ícone flutuante no canto superior direito (`lucide` `Smartphone`).
- **Título:** "LogCell" + "Sistema de Gestão de Estoque", centralizado.
- **Pontos fracos:**
  - Visual genérico (card no meio do nada), pouco "marca".
  - Logo flutuante descolada do conteúdo; `hover:scale-110` é um toque pouco corporativo.
  - 1 ícone `lucide` (`Smartphone`) — fora do padrão heroicons.
  - `shadow-lg` (sombra pesada) em vez do `shadow-sm` do design system.
  - Não aproveita o espaço em desktop (telona com um cardzinho no centro).

---

## 2. Direção visual proposta (recomendada): **Split-screen**

Layout de duas colunas no desktop, colapsando para coluna única no mobile — padrão moderno de SaaS/ERP.

```
┌───────────────────────────────┬──────────────────────────┐
│                               │                          │
│   [PAINEL DE MARCA]           │     [PAINEL DE FORM]      │
│                               │                          │
│   ◆ Logo + "LogCell"          │   LogCell                │
│   Sistema de Gestão           │   Acesse sua conta       │
│                               │                          │
│   "Controle de estoque,       │   ┌────────────────────┐ │
│    vendas e OS em um só       │   │ Email              │ │
│    lugar."                    │   └────────────────────┘ │
│                               │   ┌────────────────────┐ │
│   • Multi-loja                │   │ Senha           👁 │ │
│   • Caixa & financeiro        │   └────────────────────┘ │
│   • Ordens de serviço         │   [      Entrar       ]  │
│                               │                          │
│   (fundo neutro escuro com    │   Não tem conta? Cadastre-se
│    logo em marca d'água)      │                          │
└───────────────────────────────┴──────────────────────────┘
        50% (oculto no mobile)            50%
```

### 2.1. Painel de marca (esquerda — `lg:flex`, oculto < lg)
- Fundo **neutro escuro premium**: `bg-foreground` (preto/quase-preto que inverte no dark) **ou** `bg-default-900`, com o texto em tom claro. Sem gradiente colorido (respeita "cor só semântica").
- **Logo** em destaque (tamanho ~64–80px) + wordmark "LogCell".
- **Tagline** curta e tagline de apoio.
- **Lista de destaques** (3 itens) com ícones heroicons outline discretos (ex.: `BuildingStorefrontIcon`, `BanknotesIcon`, `WrenchScrewdriverIcon`).
- **Marca d'água:** uma cópia grande do `Logo` com baixa opacidade (`opacity-5`) posicionada no canto, dando profundidade sem poluir.
- Rodapé do painel: `© LogCell • {ano}` em `text-xs` discreto.

### 2.2. Painel de formulário (direita — sempre visível)
- Centralizado verticalmente, largura confortável (`max-w-sm` ~ `max-w-md`).
- **Cabeçalho do form:** logo pequena (só no mobile, já que no desktop a marca está à esquerda) + "Acesse sua conta" / "Crie sua conta".
- **Abas Login/Cadastro** mantidas (HeroUI Tabs), porém com largura total e estilo discreto.
- **Inputs** já estão bons (`variant="bordered"`) — manter; apenas adicionar ícones de prefixo opcionais (`EnvelopeIcon`, `LockClosedIcon`) para um toque mais atual.
- **Botão "Entrar":** `size="lg"`, largura total — sem mudanças de cor (primary).
- Card do form com `border border-default-200/70 shadow-sm rounded-xl` (padrão do design system) — **ou** sem card no desktop (form direto sobre o fundo `bg-background`), decisão estética abaixo.

### 2.3. Mobile (< lg)
- Painel de marca **some**; fica só o painel de form, centralizado, ocupando a tela (como hoje, porém limpo).
- Logo pequena no topo do form + título.
- Botão PWA permanece (reposicionado de forma consistente).

---

## 3. Detalhes finos / alinhamento ao design system

- **Ícones:** trocar o único `lucide` (`Smartphone`) por heroicons (`DevicePhoneMobileIcon`). Restante já é heroicons.
- **Sombras:** `shadow-lg` → `shadow-sm` (cards) / sombra suave só onde necessário.
- **Logo flutuante:** remover o círculo `bg-primary/10 hover:scale-110`; a logo passa a viver no painel de marca (desktop) e no topo do form (mobile).
- **Tokens:** usar `bg-background`, `bg-content1`, `text-foreground`, `text-default-500`, `border-default-200/70`.
- **Tipografia:** títulos `tracking-tight`, hierarquia clara (h1 `text-2xl`/`text-3xl`, subtítulo `text-default-500`).
- **Dark mode:** o painel de marca usa `bg-foreground` que naturalmente inverte; validar contraste do texto claro.
- **Acessibilidade:** `autoComplete` já presente; manter `aria-label` no toggle de senha; foco visível; `min-h-screen` sem travar scroll no mobile.

---

## 4. Escopo de arquivos

| Arquivo | Mudança |
|---|---|
| `app/auth/page.tsx` | Reescrever o layout (split-screen + responsivo); remover logo flutuante e `lucide`; manter 100% da lógica PWA/modal de instalação. |
| `components/auth/LoginForm.tsx` | Ajustes leves: ícones de prefixo opcionais, botão `size="lg"`, espaçamentos. Lógica intacta. |
| `components/auth/CadastroForm.tsx` | Mesmos ajustes leves de estilo para casar com o Login. Lógica/validações intactas. |
| `components/Logo.tsx` | Sem alteração (reutilizado). |

---

## 5. O que **NÃO** muda
- Fluxo de autenticação (`useAuthContext`, `login`, validações).
- Lógica de PWA / `beforeinstallprompt` / modal de instruções (iOS/Android).
- Rotas, contexts, tipos.

---

## 6. Decisões que preciso confirmar com você

1. **Painel de marca — cor de fundo:**
   - (A) **Neutro escuro** (`bg-foreground`/quase-preto) com logo em marca d'água — mais corporativo/sóbrio. **[recomendado]**
   - (B) **Primária da marca** (`bg-primary`) — mais "branded" e colorido (foge um pouco da disciplina neutra).

2. **Form no desktop:** dentro de um **card** (`border + shadow-sm`) ou **sem card** (form direto sobre o fundo, mais clean)?

3. **Abas Login/Cadastro:** manter as duas abas **[recomendado]** ou priorizar só Login com link discreto para Cadastro?

4. **Ícones de prefixo nos inputs** (Email/Senha): adicionar **[recomendado, toque atual]** ou manter inputs sem ícone?

---

### Resultado esperado
Uma entrada que comunica "ERP sério e moderno": painel de marca sóbrio à esquerda, formulário limpo e focado à direita, totalmente responsivo, em heroicons e tokens do design system — sem gradientes nem sombras pesadas.
