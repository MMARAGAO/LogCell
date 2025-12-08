# Sistema de Verificação Automática de Sessão

## 📋 Visão Geral

Sistema implementado para verificar automaticamente a sessão do usuário em todas as páginas do sistema e redirecionar para login quando a sessão expirar.

## 🔒 Componentes de Segurança

### 1. **SessionGuard** (`components/SessionGuard.tsx`)

Componente que envolve toda a aplicação e verifica a sessão continuamente.

**Funcionalidades:**

- ✅ Verifica sessão ao carregar cada página
- ✅ Listener para eventos de autenticação (TOKEN_REFRESHED, SIGNED_OUT)
- ✅ Redireciona automaticamente para `/auth/login` se sessão expirada
- ✅ Ignora páginas de autenticação (`/auth/*`)
- ✅ Log de eventos para debugging

**Eventos Monitorados:**

- `SIGNED_OUT`: Usuário fez logout ou sessão expirou
- `TOKEN_REFRESHED`: Token foi renovado automaticamente
- `USER_UPDATED`: Dados do usuário foram atualizados

### 2. **ProtectedRoute** (`components/auth/ProtectedRoute.tsx`)

Componente que protege rotas do sistema (já existia).

**Funcionalidades:**

- ✅ Verifica autenticação via AuthContext
- ✅ Mostra spinner durante carregamento
- ✅ Redireciona para `/auth` se não autenticado

### 3. **Hook useAuth** (`hooks/useAuth.ts`)

Hook personalizado para gerenciar autenticação.

**Nova Função:**

```typescript
verificarSessao(): Promise<boolean>
```

- Verifica se a sessão está válida
- Faz logout automático se expirada
- Redireciona para login
- Retorna `true/false`

**Uso:**

```typescript
const { verificarSessao } = useAuth();

// Antes de operação crítica
const sessaoValida = await verificarSessao();
if (!sessaoValida) {
  return; // Já redirecionou para login
}
```

## 🏗️ Arquitetura

```
Layout Sistema (app/sistema/layout.tsx)
├── ProtectedRoute (verifica autenticação inicial)
│   └── SessionGuard (monitora sessão continuamente)
│       └── SistemaLayoutClient
│           └── [Páginas do Sistema]
```

## 🔄 Fluxo de Verificação

1. **Carregamento Inicial:**

   - `ProtectedRoute` verifica se usuário está autenticado
   - Se não, redireciona para `/auth`
   - Se sim, renderiza conteúdo

2. **Durante Navegação:**

   - `SessionGuard` verifica sessão a cada mudança de página
   - Listener monitora eventos de autenticação do Supabase
   - Se sessão expirar, redireciona imediatamente

3. **Em Operações Críticas:**
   - Componentes podem chamar `verificarSessao()` manualmente
   - Exemplo: antes de criar transferência, salvar venda, etc.

## 🎯 Quando a Sessão Expira

**Automaticamente:**

- Token JWT expira (padrão Supabase: 1 hora)
- Usuário faz logout em outra aba
- Sessão é invalidada no servidor

**O que acontece:**

1. Listener detecta evento `SIGNED_OUT`
2. Console mostra: `⚠️ Sessão expirada (evento: SIGNED_OUT)`
3. Redireciona para `/auth/login`
4. Usuário faz login novamente
5. Redirecionado para página original

## 🛠️ Debugging

**Console Logs:**

```javascript
✅ Token renovado automaticamente          // Token refresh bem-sucedido
⚠️ Sessão inválida ou expirada            // Sessão não encontrada
⚠️ Sessão expirada (evento: SIGNED_OUT)   // Logout detectado
```

**Para forçar expiração de sessão (teste):**

```javascript
// No console do navegador
await supabase.auth.signOut();
```

## 📝 Exemplos de Uso

### Em um Componente Modal

```typescript
import { useAuth } from "@/hooks/useAuth";

export function MeuModal() {
  const { verificarSessao, usuario } = useAuth();

  const handleSalvar = async () => {
    // Verificar sessão antes de operação crítica
    const sessaoValida = await verificarSessao();
    if (!sessaoValida) {
      return; // Já redirecionou para login
    }

    // Continuar com operação
    await salvarDados();
  };

  return (
    // ...
  );
}
```

### Em uma Página

```typescript
"use client";

import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";

export default function MinhaPage() {
  const { verificarSessao } = useAuth();

  useEffect(() => {
    // Verificar ao carregar página
    verificarSessao();
  }, []);

  // ...
}
```

## ⚙️ Configuração Supabase

**Tempo de expiração do token:**

- Padrão: 1 hora
- Configurável no dashboard Supabase
- Caminho: Authentication → Settings → JWT Expiry

**Auto-refresh:**

- Supabase renova token automaticamente antes de expirar
- Se renovação falhar, evento `SIGNED_OUT` é disparado

## 🚨 Pontos Importantes

1. **Não fazer logout manual:** Sistema detecta automaticamente
2. **Verificar antes de operações críticas:** Use `verificarSessao()`
3. **Não bloquear navegação:** Verificação é assíncrona e rápida
4. **Logs ajudam debugging:** Abra console para ver eventos

## 📦 Dependências

- `@supabase/ssr`: Cliente Supabase
- `next/navigation`: Router do Next.js
- Hook customizado `useAuth`

## ✅ Benefícios

- ✅ Segurança automática em todas as páginas
- ✅ Experiência de usuário suave
- ✅ Sem necessidade de logout manual
- ✅ Detecção imediata de sessão expirada
- ✅ Logs para debugging
- ✅ Compatível com múltiplas abas
