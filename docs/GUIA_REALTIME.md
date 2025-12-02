# 🔔 Guia de Implementação Realtime - LogCell

## 📋 Índice

1. [Configuração Inicial](#configuração-inicial)
2. [Hook useRealtime](#hook-userealtime)
3. [Exemplos por Módulo](#exemplos-por-módulo)
4. [Testes](#testes)
5. [Troubleshooting](#troubleshooting)

---

## ⚙️ Configuração Inicial

### 1. Executar Script SQL no Supabase

```bash
# Acesse: Supabase Dashboard > SQL Editor
# Execute o arquivo: docs/HABILITAR_REALTIME_MASTER.sql
```

Este script habilita Realtime para todas as tabelas críticas:

- ✅ permissoes
- ✅ notificacoes, notificacoes_usuarios
- ✅ vendas, vendas_itens, vendas_pagamentos
- ✅ estoque_lojas, historico_estoque
- ✅ transferencias, transferencias_itens
- ✅ ordem_servico, ordem_servico_pecas
- ✅ caixa
- ✅ devolucoes, devolucoes_itens
- ✅ rma, rma_produtos
- ✅ configuracoes_usuario
- ✅ clientes, tecnicos
- ✅ fornecedores, produtos_fornecedores

### 2. Verificar no Dashboard

```
Supabase Dashboard > Database > Replication
```

Todas as tabelas listadas acima devem aparecer com eventos marcados: INSERT, UPDATE, DELETE

---

## 🎣 Hook useRealtime

### Importação

```tsx
import { useRealtime } from "@/hooks/useRealtime";
```

### Uso Básico

```tsx
useRealtime({
  table: "vendas",
  onEvent: (payload) => {
    console.log("Evento:", payload.eventType); // INSERT, UPDATE, DELETE
    console.log("Dados:", payload.new); // Registro novo/atualizado
    console.log("Antigo:", payload.old); // Registro antes da mudança

    // Recarregar dados
    carregarVendas();
  },
});
```

### Com Filtro

```tsx
const { lojaId } = useLojaFilter();

useRealtime({
  table: "vendas",
  filter: `loja_id=eq.${lojaId}`, // Apenas vendas da loja específica
  onEvent: () => carregarVendas(),
});
```

### Monitorar Apenas um Tipo de Evento

```tsx
useRealtime({
  table: "notificacoes_usuarios",
  event: "INSERT", // Apenas novos registros
  filter: `usuario_id=eq.${usuarioId}`,
  onEvent: (payload) => {
    toast.info("Nova notificação!");
    carregarNotificacoes();
  },
});
```

### Controlar Quando Conectar

```tsx
const { lojaId, loadingPermissoes } = usePermissoes();

useRealtime({
  table: "vendas",
  enabled: !loadingPermissoes && lojaId !== null, // Só conectar quando tiver permissões
  filter: `loja_id=eq.${lojaId}`,
  onEvent: () => carregarVendas(),
});
```

---

## 📦 Exemplos por Módulo

### 1. Módulo VENDAS

```tsx
// app/sistema/vendas/page.tsx
"use client";

import { useRealtime } from "@/hooks/useRealtime";
import { usePermissoes } from "@/hooks/usePermissoes";
import { useLojaFilter } from "@/hooks/useLojaFilter";

export default function VendasPage() {
  const { lojaId, loadingPermissoes } = usePermissoes();
  const { getLojaFilter } = useLojaFilter();

  const [vendas, setVendas] = useState([]);

  const carregarVendas = async () => {
    const filtroLoja = getLojaFilter();
    // ... buscar vendas com filtro
  };

  useEffect(() => {
    if (!loadingPermissoes) {
      carregarVendas();
    }
  }, [loadingPermissoes]);

  // 🔔 REALTIME: Recarregar quando houver mudanças
  useRealtime({
    table: 'vendas',
    enabled: !loadingPermissoes,
    filter: lojaId ? `loja_id=eq.${lojaId}` : undefined,
    onEvent: (payload) => {
      console.log('🔔 Venda alterada:', payload.eventType);
      carregarVendas(); // Recarregar lista
    }
  });

  // 🔔 REALTIME: Monitorar itens de vendas (para atualizações de estoque)
  useRealtime({
    table: 'vendas_itens',
    enabled: !loadingPermissoes,
    onEvent: () => {
      carregarVendas(); // Recarregar quando itens mudarem
    }
  });

  return (
    // ... componente
  );
}
```

### 2. Módulo TRANSFERÊNCIAS

```tsx
// app/sistema/transferencias/page.tsx
"use client";

import { useRealtime } from "@/hooks/useRealtime";
import { useLojaFilter } from "@/hooks/useLojaFilter";

export default function TransferenciasPage() {
  const { lojaId } = useLojaFilter();
  const [transferencias, setTransferencias] = useState([]);

  // 🔔 REALTIME: Transferências enviadas ou recebidas pela loja
  useRealtime({
    table: 'transferencias',
    enabled: lojaId !== null,
    // Monitorar transferências onde a loja é origem OU destino
    // Nota: filtro OR não é suportado nativamente, então monitoramos tudo e filtramos no client
    onEvent: (payload) => {
      const transferencia = payload.new || payload.old;

      // Filtrar apenas se envolver a loja do usuário
      if (
        transferencia.loja_origem === lojaId ||
        transferencia.loja_destino === lojaId
      ) {
        console.log('🔔 Transferência atualizada');
        carregarTransferencias();
      }
    }
  });

  return (
    // ... componente
  );
}
```

### 3. Módulo ESTOQUE

```tsx
// app/sistema/estoque/page.tsx
"use client";

import { useRealtime } from "@/hooks/useRealtime";

export default function EstoquePage() {
  const { lojaId } = useLojaFilter();
  const [estoque, setEstoque] = useState([]);

  // 🔔 REALTIME: Monitorar mudanças no estoque da loja
  useRealtime({
    table: 'estoque_lojas',
    filter: lojaId ? `id_loja=eq.${lojaId}` : undefined,
    onEvent: (payload) => {
      if (payload.eventType === 'UPDATE') {
        const old = payload.old;
        const novo = payload.new;

        console.log(`📦 Estoque alterado: ${old.quantidade} → ${novo.quantidade}`);
      }

      carregarEstoque();
    }
  });

  // 🔔 REALTIME: Monitorar histórico de movimentações
  useRealtime({
    table: 'historico_estoque',
    filter: lojaId ? `id_loja=eq.${lojaId}` : undefined,
    event: 'INSERT', // Apenas novos registros de histórico
    onEvent: () => {
      carregarHistorico();
    }
  });

  return (
    // ... componente
  );
}
```

### 4. Módulo NOTIFICAÇÕES

```tsx
// components/NotificacoesDropdown.tsx
"use client";

import { useRealtime } from "@/hooks/useRealtime";
import { useAuth } from "@/hooks/useAuth";

export function NotificacoesDropdown() {
  const { usuario } = useAuth();
  const [notificacoes, setNotificacoes] = useState([]);

  // 🔔 REALTIME: Novas notificações do usuário
  useRealtime({
    table: 'notificacoes_usuarios',
    event: 'INSERT', // Apenas novas notificações
    filter: `usuario_id=eq.${usuario?.id}`,
    onEvent: (payload) => {
      const novaNotificacao = payload.new;

      // Tocar som
      playNotificationSound();

      // Mostrar toast
      toast.info(novaNotificacao.titulo, {
        description: novaNotificacao.mensagem
      });

      // Adicionar à lista
      setNotificacoes(prev => [novaNotificacao, ...prev]);
    }
  });

  // 🔔 REALTIME: Notificações marcadas como lidas
  useRealtime({
    table: 'notificacoes_usuarios',
    event: 'UPDATE',
    filter: `usuario_id=eq.${usuario?.id}`,
    onEvent: (payload) => {
      if (payload.new.lida !== payload.old.lida) {
        console.log('✅ Notificação marcada como lida');
        carregarNotificacoes();
      }
    }
  });

  return (
    // ... componente
  );
}
```

### 5. Módulo PERMISSÕES (já implementado)

```tsx
// hooks/usePermissoes.tsx
// ✅ JÁ IMPLEMENTADO!

// O hook usePermissoes já usa Realtime:
useRealtime({
  table: "permissoes",
  filter: `usuario_id=eq.${usuario.id}`,
  onEvent: (payload) => {
    if (payload.eventType === "UPDATE") {
      toast.success("Permissões atualizadas!");
      // Atualizar estado local
    }
  },
});
```

### 6. Módulo CAIXA

```tsx
// app/sistema/caixa/page.tsx
"use client";

import { useRealtime } from "@/hooks/useRealtime";

export default function CaixaPage() {
  const { lojaId } = useLojaFilter();
  const [movimentacoes, setMovimentacoes] = useState([]);

  // 🔔 REALTIME: Novas movimentações no caixa
  useRealtime({
    table: 'caixa',
    filter: lojaId ? `loja_id=eq.${lojaId}` : undefined,
    onEvent: (payload) => {
      if (payload.eventType === 'INSERT') {
        const movimento = payload.new;

        // Som diferente para entrada vs saída
        if (movimento.tipo === 'entrada') {
          playSound('cash-in');
        } else {
          playSound('cash-out');
        }

        toast.success(
          `${movimento.tipo === 'entrada' ? '💰 Entrada' : '💸 Saída'}: R$ ${movimento.valor}`
        );
      }

      carregarMovimentacoes();
    }
  });

  return (
    // ... componente
  );
}
```

### 7. Módulo ORDEM DE SERVIÇO

```tsx
// app/sistema/ordem-servico/page.tsx
"use client";

import { useRealtimeMultiple } from "@/hooks/useRealtime";

export default function OrdemServicoPage() {
  // 🔔 REALTIME: Monitorar múltiplas tabelas
  useRealtimeMultiple([
    {
      table: 'ordem_servico',
      onEvent: (payload) => {
        if (payload.eventType === 'UPDATE') {
          const statusAnterior = payload.old.status;
          const statusNovo = payload.new.status;

          if (statusAnterior !== statusNovo) {
            toast.info(`Status atualizado: ${statusNovo}`);
          }
        }
        carregarOrdens();
      }
    },
    {
      table: 'ordem_servico_pecas',
      event: 'INSERT',
      onEvent: () => {
        console.log('Nova peça adicionada');
        carregarOrdens();
      }
    }
  ]);

  return (
    // ... componente
  );
}
```

---

## 🧪 Testes

### Teste 1: Permissões em Realtime

1. Abra o sistema em **duas abas** do navegador
2. Faça login com um usuário em ambas
3. Em uma aba, vá em **Admin > Usuários**
4. Altere as permissões do usuário (ex: mudar loja)
5. **Na outra aba**, deve aparecer toast: "Permissões atualizadas!"
6. Os dados devem recarregar automaticamente

### Teste 2: Vendas em Realtime

1. Abra **Vendas** em duas abas
2. Na primeira aba, crie uma nova venda
3. **Na segunda aba**, a venda deve aparecer automaticamente
4. No console (F12), procure: `🔔 [REALTIME:vendas] Evento recebido: INSERT`

### Teste 3: Notificações em Realtime

1. Simule uma mudança de estoque que gere notificação:
   ```sql
   -- Execute no SQL Editor do Supabase
   UPDATE estoque_lojas
   SET quantidade = 0
   WHERE id_produto = 'algum-produto-id';
   ```
2. **Instantaneamente**, deve aparecer notificação no sistema
3. Toast deve aparecer: "Estoque Zerado"

### Teste 4: Transferências em Realtime

1. Loja A cria transferência para Loja B
2. **Usuário da Loja B** deve ver nova transferência pendente automaticamente
3. Quando Loja B confirma recebimento, Loja A vê status atualizar

---

## 🔧 Troubleshooting

### ❌ Realtime não funciona

**Verificar:**

1. Script `HABILITAR_REALTIME_MASTER.sql` foi executado?

   ```sql
   SELECT tablename FROM pg_publication_tables
   WHERE pubname = 'supabase_realtime';
   ```

2. Tabela está na lista do Replication?

   - Dashboard > Database > Replication
   - Se não: adicionar manualmente

3. Console mostra erro?
   ```
   ❌ [REALTIME:vendas] Erro ao conectar
   ```
   - Verifique RLS policies da tabela
   - Verifique permissões de SELECT

### ⏱️ Timeout ao conectar

**Causa:** Supabase está limitando conexões Realtime

**Solução:**

- Plano gratuito: máximo 2 conexões simultâneas
- Upgrade para plano pago
- OU: reduzir número de `useRealtime` por página

### 🔁 Dados duplicados

**Causa:** Múltiplas subscrições para mesma tabela

**Solução:**

```tsx
// ❌ ERRADO (duplica eventos)
useRealtime({ table: "vendas", onEvent: recarregar });
useRealtime({ table: "vendas", onEvent: recarregar }); // Duplicado!

// ✅ CORRETO
useRealtime({
  table: "vendas",
  channelName: "vendas-unique", // Nome único
  onEvent: recarregar,
});
```

### 🐌 Muitos recarregamentos

**Causa:** Evento dispara recarregamento completo muito pesado

**Solução:**

```tsx
// ❌ Recarrega tudo a cada evento
useRealtime({
  table: "vendas_itens",
  onEvent: () => carregarTodasVendas(), // PESADO!
});

// ✅ Atualiza apenas item específico
useRealtime({
  table: "vendas_itens",
  onEvent: (payload) => {
    const item = payload.new;

    // Atualizar apenas venda específica
    setVendas((prev) =>
      prev.map((v) =>
        v.id === item.venda_id ? { ...v, itens: [...v.itens, item] } : v
      )
    );
  },
});
```

---

## 📚 Recursos

- [Supabase Realtime Docs](https://supabase.com/docs/guides/realtime)
- [PostgreSQL Changes Filters](https://supabase.com/docs/guides/realtime/postgres-changes)
- Hook: `hooks/useRealtime.ts`
- SQL: `docs/HABILITAR_REALTIME_MASTER.sql`

---

## ✅ Checklist de Implementação

Para cada módulo:

- [ ] Executar `HABILITAR_REALTIME_MASTER.sql`
- [ ] Verificar tabelas no Dashboard > Replication
- [ ] Importar `useRealtime` na página
- [ ] Adicionar `useRealtime` com filtro apropriado
- [ ] Testar em duas abas simultaneamente
- [ ] Verificar logs no console (F12)
- [ ] Confirmar que dados atualizam automaticamente
- [ ] Adicionar toast/feedback visual quando apropriado

---

**🎯 Resultado Esperado:**

Sistema 100% em tempo real, onde mudanças feitas por qualquer usuário em qualquer loja são refletidas instantaneamente em todas as abas abertas, sem necessidade de refresh manual! 🚀
