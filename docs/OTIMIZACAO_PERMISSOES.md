## Sugestão de Otimização: usePermissoes

O hook `usePermissoes` atualmente faz uma chamada ao Supabase toda vez que é usado em um componente.
Se você tem múltiplos componentes usando este hook, isso pode causar muitas requisições.

### Opção 1: Mover para Context (RECOMENDADO)

Criar um `PermissoesContext` que carrega as permissões uma única vez e compartilha com todos os componentes:

```tsx
// contexts/PermissoesContext.tsx
"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useAuthContext } from "./AuthContext";
import { supabase } from "@/lib/supabaseClient";
import type { Permissao } from "@/types/permissoes";

interface PermissoesContextType {
  permissoes: Permissao[];
  loading: boolean;
  lojaId: number | null;
  todasLojas: boolean;
  temPermissao: (permissao: Permissao) => boolean;
  recarregar: () => Promise<void>;
}

const PermissoesContext = createContext<PermissoesContextType | undefined>(
  undefined
);

export function PermissoesProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { usuario } = useAuthContext();
  const [permissoes, setPermissoes] = useState<Permissao[]>([]);
  const [loading, setLoading] = useState(true);
  const [lojaId, setLojaId] = useState<number | null>(null);
  const [todasLojas, setTodasLojas] = useState(false);

  const carregarPermissoes = async () => {
    if (!usuario?.id) {
      setLoading(false);
      return;
    }

    try {
      const { data } = await supabase
        .from("permissoes")
        .select("permissoes, loja_id, todas_lojas")
        .eq("usuario_id", usuario.id)
        .maybeSingle();

      if (data) {
        // Processar permissões...
        setPermissoes(/* ... */);
        setLojaId(data.loja_id);
        setTodasLojas(data.todas_lojas || false);
      }
    } catch (error) {
      console.error("Erro ao carregar permissões:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarPermissoes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usuario?.id]);

  const temPermissao = (permissao: Permissao) => {
    return permissoes.includes(permissao);
  };

  return (
    <PermissoesContext.Provider
      value={{
        permissoes,
        loading,
        lojaId,
        todasLojas,
        temPermissao,
        recarregar: carregarPermissoes,
      }}
    >
      {children}
    </PermissoesContext.Provider>
  );
}

export function usePermissoesContext() {
  const context = useContext(PermissoesContext);
  if (!context) {
    throw new Error(
      "usePermissoesContext deve ser usado dentro de PermissoesProvider"
    );
  }
  return context;
}
```

Depois adicione no `app/providers.tsx`:

```tsx
import { PermissoesProvider } from "@/contexts/PermissoesContext";

export function Providers({ children, themeProps }: ProvidersProps) {
  return (
    <HeroUIProvider navigate={router.push}>
      <NextThemesProvider {...themeProps}>
        <AuthProvider>
          <PermissoesProvider>
            <ConfiguracoesProvider>{children}</ConfiguracoesProvider>
          </PermissoesProvider>
        </AuthProvider>
      </NextThemesProvider>
    </HeroUIProvider>
  );
}
```

### Opção 2: Adicionar Cache Simples

Manter o hook mas adicionar um cache em memória:

```tsx
// Cache global
const permissoesCache = new Map<
  string,
  {
    data: any;
    timestamp: number;
  }
>();

const CACHE_DURATION = 60000; // 1 minuto

export function usePermissoes() {
  // ... código existente ...

  useEffect(() => {
    if (!usuario?.id) {
      setLoading(false);
      return;
    }

    // Verificar cache
    const cached = permissoesCache.get(usuario.id);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      setPermissoesCustomizadas(cached.data);
      setLoading(false);
      return;
    }

    // Se não tem cache, buscar do banco
    const buscarPermissoes = async () => {
      // ... código de busca ...

      // Salvar no cache
      permissoesCache.set(usuario.id, {
        data: permissoesData,
        timestamp: Date.now(),
      });
    };

    buscarPermissoes();
  }, [usuario?.id]);
}
```

## Vantagens de cada abordagem:

**Context (Opção 1):**

- ✅ Uma única chamada ao banco
- ✅ Compartilhado entre todos os componentes
- ✅ Mais fácil de gerenciar
- ❌ Mais código para setup inicial

**Cache (Opção 2):**

- ✅ Mudança mínima no código existente
- ✅ Reduz chamadas duplicadas
- ❌ Cache pode ficar desatualizado
- ❌ Ainda faz múltiplas chamadas se vários componentes montarem ao mesmo tempo
