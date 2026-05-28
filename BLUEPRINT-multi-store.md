# BLUEPRINT: Multi-store por usuário

## Objetivo
Permitir que um usuário tenha acesso a **N lojas** específicas (hoje só 1 ou todas).

---

## Estratégia geral
1. Criar tabela `usuario_lojas` (join N:N)
2. Manter `permissoes.loja_id` como compatibilidade (deprecated)
3. Hooks expõem `lojaIds: number[]` + `lojaId` (primeiro elemento, compat)
4. `useLojaFilter` muda `.eq` → `.in` (mesmo resultado para 1 loja)
5. Migrar páginas uma a uma

---

## FASE 0 — Script SQL

**Arquivo:** `scripts/criar_tabela_usuario_lojas.sql` (NOVO)

```sql
-- Tabela de relação N:N entre usuários e lojas
CREATE TABLE IF NOT EXISTS usuario_lojas (
  usuario_id UUID NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
  loja_id    INTEGER NOT NULL REFERENCES lojas(id) ON DELETE CASCADE,
  criado_em  TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (usuario_id, loja_id)
);

-- Migrar dados existentes da tabela permissoes
INSERT INTO usuario_lojas (usuario_id, loja_id)
SELECT usuario_id, loja_id FROM permissoes
WHERE loja_id IS NOT NULL
ON CONFLICT DO NOTHING;

-- Índice para busca por usuário
CREATE INDEX IF NOT EXISTS idx_usuario_lojas_usuario ON usuario_lojas(usuario_id);
```

**Rollback:** `DROP TABLE IF EXISTS usuario_lojas;`

---

## FASE 1 — Types

**Arquivo:** `types/index.ts`

### Mudanças:
- `Permissoes.loja_id?: number | null` → **manter** (deprecated, compat)
- Adicionar `loja_ids?: number[]` à interface `Permissoes`

```typescript
export interface Permissoes {
  id: number;
  usuario_id: string;
  permissoes: PermissoesModulos;
  loja_id?: number | null;       // DEPRECATED: manter para compat
  loja_ids?: number[];           // NOVO: múltiplas lojas
  todas_lojas?: boolean;
  criado_em: string;
  atualizado_em: string;
}
```

---

## FASE 2 — Core hooks

### 2a. `hooks/usePermissoes.tsx`

| State atual | State novo |
|---|---|
| `lojaId: number \| null` | `lojaIds: number[]` |
| `setLojaId(val)` | `setLojaIds(arr)` |

#### Mudanças detalhadas:

**Linha 19:** `const [lojaId, setLojaId] = useState<number | null>(null);`
→ `const [lojaIds, setLojaIds] = useState<number[]>([]);`

**Linha 74-75:** `setLojaId(null);`
→ `setLojaIds([]);`

**Linha 97-101:** Query em `permissoes` + query em `usuario_lojas`:
```typescript
// Buscar lojas do usuario_lojas
const { data: lojasUsuario } = await supabase
  .from("usuario_lojas")
  .select("loja_id")
  .eq("usuario_id", usuario.id);

const lojaIdsFromJoin = (lojasUsuario || []).map(r => r.loja_id);

// Fallback: se veio da tabela permissoes (migração)
const lojaIdsFinal = lojaIdsFromJoin.length > 0
  ? lojaIdsFromJoin
  : (data.loja_id ? [data.loja_id] : []);
```

**Linha 119:** `const novaLojaId = data.loja_id !== null ? data.loja_id : null;`
→ Manter mas como fallback (ver acima)

**Linha 136:** `setLojaId(novaLojaId);`
→ `setLojaIds(lojaIdsFinal);`

**Linha 145-146:** `setLojaId(null);`
→ `setLojaIds([]);`

**Linha 159-160:** `setLojaId(null);`
→ `setLojaIds([]);`

**Linha 260-269:** `temAcessoLoja`:
```typescript
const temAcessoLoja = (lojaIdVerificar: number): boolean => {
  if (!usuario) return false;
  if (perfil === "admin") return true;
  if (todasLojas) return true;
  return lojaIds.includes(lojaIdVerificar);
};
```

**Retorno (linha 283):** Adicionar `lojaIds`:
```typescript
return {
  ...,
  lojaId: lojaIds.length > 0 ? lojaIds[0] : null, // compat
  lojaIds,
  ...
};
```

### 2b. `hooks/useLojaFilter.ts`

#### Mudanças detalhadas:

**Linha 14:** `const { lojaId, todasLojas, isAdmin } = usePermissoes();`
→ `const { lojaIds, lojaId, todasLojas, isAdmin } = usePermissoes();`

**Linha 25-38:** `temAcessoLoja`:
```typescript
const temAcessoLoja = useMemo(() => {
  return (lojaIdVerificar: number | null | undefined): boolean => {
    if (isAdmin) return true;
    if (!lojaIdVerificar) return false;
    if (todasLojas) return true;
    return lojaIds.includes(lojaIdVerificar);
  };
}, [isAdmin, todasLojas, lojaIds]);
```

**Linha 55-63:** `getLojaFilter`:
```typescript
const getLojaFilter = useMemo(() => {
  return (): number[] | null => {
    if (isAdmin || todasLojas) return null;
    return lojaIds; // pode ser [] — .in() com vazio = 0 resultados
  };
}, [isAdmin, todasLojas, lojaIds]);
```

⚠️ **EDGE CASE DE SEGURANÇA:** Se `lojaIds` está vazio E usuário não é admin E `todasLojas=false`, o filtro retorna `[]`. O `.in()` com array vazio retorna 0 resultados no PostgreSQL. Isso **corrige** um bug pré-existente onde usuário sem loja via todos os dados.

**Linha 75-87:** `aplicarFiltroLoja`:
```typescript
const aplicarFiltroLoja = <T extends any>(
  query: T,
  campo: string = "loja_id",
): T => {
  const filtro = getLojaFilter();
  if (filtro !== null) {
    if (filtro.length === 0) {
      // @ts-ignore — filtra por ID impossível para 0 resultados
      return query.eq(campo, -1);
    }
    // @ts-ignore
    return query.in(campo, filtro);
  }
  return query;
};
```

**Linha 98-111:** `filtrarPorLoja`:
```typescript
const filtrarPorLoja = <T extends Record<string, any>>(
  items: T[],
  campo: string = "loja_id",
): T[] => {
  const filtro = getLojaFilter();
  if (filtro === null) return items;
  return items.filter((item) => filtro.includes(item[campo]));
};
```

**Linha 116-130:** `mensagemAcesso`:
```typescript
const mensagemAcesso = useMemo(() => {
  if (isAdmin) return "Você tem acesso a todas as lojas (Admin)";
  if (todasLojas) return "Você tem acesso a todas as lojas";
  if (lojaIds.length > 0) {
    if (lojaIds.length === 1) return `Você tem acesso apenas à loja ID: ${lojaIds[0]}`;
    return `Você tem acesso a ${lojaIds.length} lojas (IDs: ${lojaIds.join(', ')})`;
  }
  return "Nenhuma loja configurada. Entre em contato com o administrador.";
}, [isAdmin, todasLojas, lojaIds]);
```

**Linha 149-151:** `precisaFiltro`:
```typescript
const precisaFiltro = useMemo(() => {
  return !isAdmin && !todasLojas && lojaIds.length > 0;
}, [isAdmin, todasLojas, lojaIds]);
```

**Retorno (linha 153-166):** Adicionar `lojaIds`:
```typescript
return {
  lojaId,     // compat
  lojaIds,    // NOVO
  todasLojas,
  podeVerTodasLojas,
  precisaFiltro,
  mensagemAcesso,
  temAcessoLoja,
  getLojaFilter,
  aplicarFiltroLoja,
  filtrarPorLoja,
};
```

---

## FASE 3 — Server Actions

### 3a. `app/sistema/usuarios/actions/permissoes.ts`

#### `getPermissoes(usuarioId)`:
Após buscar na tabela `permissoes`, buscar também em `usuario_lojas`:
```typescript
const { data: lojasUsuario } = await supabase
  .from("usuario_lojas")
  .select("loja_id")
  .eq("usuario_id", usuarioId);

const lojaIds = (lojasUsuario || []).map(r => r.loja_id);

return {
  success: true,
  data: {
    ...data,
    loja_ids: lojaIds.length > 0 ? lojaIds : (data?.loja_id ? [data.loja_id] : []),
  }
};
```

#### `salvarPermissoes(usuarioId, dados)`:
Payload agora aceita `loja_ids?: number[]`:
```typescript
export async function salvarPermissoes(
  usuarioId: string,
  dados: {
    permissoes: PermissoesModulos;
    loja_id?: number | null;
    loja_ids?: number[];       // NOVO
    todas_lojas?: boolean;
  },
)
```

Após salvar na tabela `permissoes`:
```typescript
// Salvar na tabela usuario_lojas
if (dados.loja_ids) {
  // Deletar registros antigos
  await supabase.from("usuario_lojas").delete().eq("usuario_id", usuarioId);

  // Inserir novos
  if (dados.loja_ids.length > 0) {
    const inserts = dados.loja_ids.map(loja_id => ({
      usuario_id: usuarioId,
      loja_id,
    }));
    await supabase.from("usuario_lojas").insert(inserts);
  }
}
```

**Compat:** Manter `loja_id` na tabela `permissoes` (primeiro elemento):
```typescript
loja_id: dados.loja_ids?.[0] || dados.loja_id || null,
```

### 3b. `services/permissoesService.ts`

**Mudanças nos métodos que consultam `permissoes`:**
- `getPermissoes(usuarioId)` — além de buscar em `permissoes`, buscar também em `usuario_lojas`
- `salvarPermissoes()` — além de salvar em `permissoes`, upsert em `usuario_lojas`

### 3c. `app/sistema/usuarios/actions/index.ts` (cadastro de usuário)

**Linhas 171-179:** Após criar permissões padrão, também criar entrada em `usuario_lojas`:
```typescript
if (dados.loja_ids?.length > 0) {
  await supabase.from("usuario_lojas").insert(
    dados.loja_ids.map(loja_id => ({
      usuario_id: novoUsuarioId,
      loja_id,
    }))
  );
}
```

---

## FASE 4 — UI do modal

### `components/usuarios/PermissoesModal.tsx`

| Estado atual | Estado novo |
|---|---|
| `lojaSelecionada: number \| null` | `lojasSelecionadas: number[]` |
| `setLojaSelecionada(val)` | `setLojasSelecionadas(arr)` |

#### Carregamento (linha 126-127):
```typescript
setLojasSelecionadas(
  result.data.loja_ids?.length > 0
    ? result.data.loja_ids
    : (result.data.loja_id ? [result.data.loja_id] : [])
);
setTodasLojas(result.data.todas_lojas || false);
```

#### UI (substituir linhas 386-472):
Trocar `Autocomplete` (select único) por checkboxes múltiplos:
```tsx
{!todasLojas && (
  <div className="space-y-2">
    <p className="text-sm text-default-500">Selecione as lojas:</p>
    <div className="grid grid-cols-2 gap-2">
      {lojas.map((loja) => (
        <Checkbox
          key={loja.id}
          isSelected={lojasSelecionadas.includes(loja.id)}
          onValueChange={(checked) => {
            setLojasSelecionadas(prev =>
              checked
                ? [...prev, loja.id]
                : prev.filter(id => id !== loja.id)
            );
          }}
        >
          {loja.nome}
        </Checkbox>
      ))}
    </div>
  </div>
)}
```

#### Salvamento (linha 271-275):
```typescript
const dadosSalvar = {
  permissoes,
  loja_ids: todasLojas ? [] : lojasSelecionadas,
  loja_id: todasLojas ? null : (lojasSelecionadas[0] || null),
  todas_lojas: todasLojas,
};
```

---

## FASE 5 — Páginas ( `.eq` → `.in` )

Cada uma segue o padrão:
- Destructurar `lojaIds` do hook (além de `lojaId`)
- Trocar `.eq("campo", lojaId)` → `.in("campo", lojaIds)`

### 5a. `app/sistema/vendas/page.tsx`

**Linha 215:** Adicionar `lojaIds` na destruct:
```typescript
const { aplicarFiltroLoja, podeVerTodasLojas, lojaId, lojaIds } = useLojaFilter();
```

**Linha 340:** Filtro Realtime:
```typescript
filter: lojaIds.length > 0 && !podeVerTodasLojas
  ? `loja_id=in.(${lojaIds.join(',')})`
  : undefined,
```

**Linha 409-410:** Filtro de segurança:
```typescript
if (!podeVerTodasLojas && lojaIds.length > 0) {
  filtros.loja_id = lojaIds;
}
```

### 5b. `app/sistema/estoque/page.tsx`

**Linha 96:** Adicionar `lojaIds`:
```typescript
const { filtrarPorLoja, podeVerTodasLojas, lojaId, lojaIds } = useLojaFilter();
```

**Linha 217:**
```typescript
(e: any) => lojaIds.includes(e.id_loja),
```

### 5c. `app/sistema/devolucoes/page.tsx`

**Linha 20:** Adicionar `lojaIds`:
```typescript
const { lojaId, lojaIds, podeVerTodasLojas } = useLojaFilter();
```

**Linhas 100-102:**
```typescript
if (lojaIds.length > 0 && !podeVerTodasLojas) {
  countQuery = countQuery.in("loja_id", lojaIds);
  dataQuery = dataQuery.in("loja_id", lojaIds);
}
```

### 5d. `app/sistema/caixa/page.tsx`

**Linha 72:** Adicionar `lojaIds`:
```typescript
const { aplicarFiltroLoja, lojaId, lojaIds, podeVerTodasLojas } = useLojaFilter();
```

**Linhas 160-162:**
```typescript
if (lojaIds.length > 0 && !podeVerTodasLojas) {
  query = query.in("id", lojaIds);
}
```

**Linhas 199-202:**
```typescript
else if (lojaIds.length > 0 && !podeVerTodasLojas) {
  filtros.loja_id = lojaIds;
}
```

### 5e. `app/sistema/ordem-servico/page.tsx`

**Linha 91:** Adicionar `lojaIds`:
```typescript
const { lojaId, lojaIds, podeVerTodasLojas } = useLojaFilter();
```

**Linhas 179-181:**
```typescript
if (lojaIds.length > 0 && !podeVerTodasLojas) {
  filtros.idLoja = lojaIds;
}
```

### 5f. `app/sistema/transferencias/page.tsx`

**Linha 75:** Adicionar `lojaIds`:
```typescript
const { lojaId, lojaIds, podeVerTodasLojas } = useLojaFilter();
```

**Linhas 166-167, 206-207:**
```typescript
else if (lojaIds.length > 0 && !podeVerTodasLojas) {
  filtros.loja_id = lojaIds;
}
```

### 5g. `app/sistema/aparelhos/page.tsx`

**Linha 104-109:** Adicionar `lojaIds`:
```typescript
const {
  temPermissao, lojaId, lojaIds, todasLojas,
  loading: loadingPermissoes,
} = usePermissoes();
```

**Linha 186:**
```typescript
const lojaIdsFinal = todasLojas ? [] : lojaIds;
```

**Linha 225, 241:** Passar `loja_id: lojaIdsFinal` para serviços.

### 5h. `app/sistema/configuracoes/taxas-cartao/page.tsx`

**Linha 63:** Adicionar `lojaIds`:
```typescript
const { lojaId, lojaIds } = useLojaFilter();
```

**Linhas 101, 129:** Passar `loja_ids: lojaIds`.

---

## FASE 5i — Páginas faltantes (NOVO)

### 5i1. `app/sistema/dashboard/page.tsx`

**Status:** Esta página NÃO usa `useLojaFilter`. Tem seu próprio `lojaId` local (seletor) e faz consultas `.eq("loja_id"` diretas.

**Estratégia:**
- Adicionar `useLojaFilter()` para obter `lojaIds` e `podeVerTodasLojas`
- Seletor de loja: mostrar apenas lojas que o usuário tem acesso
- Consultas `.eq()` que usam o seletor já funcionam (recebem valor específico do dropdown)

**Linha ~161:** Adicionar:
```typescript
const { lojaIds, podeVerTodasLojas } = useLojaFilter();
```

**Seletor de loja:** Filtrar opções:
```typescript
const lojasDisponiveis = podeVerTodasLojas
  ? lojas
  : lojas.filter(l => lojaIds.includes(l.id));
```

### 5i2. `app/sistema/relatorios/lucro/page.tsx`

**Status:** Não usa `useLojaFilter`. Tem seletor de loja próprio.

**Estratégia:** Mesma do dashboard — adicionar `useLojaFilter` e filtrar opções do seletor.

---

## FASE 6 — Componentes complexos

### 6a. `components/dashboard/DashboardPessoal.tsx`

**Linha 241:** Adicionar `lojaIds`:
```typescript
const { lojaId, lojaIds, perfil } = usePermissoes();
```

**Estratégia:**
- `lojaId` usado para compat com MetasService (1 loja)
- Seletor de loja: mostrar apenas as lojas do usuário
- Se só tem 1 loja, seletor desabilitado (igual hoje)

**Linha 531:** `lojaId || undefined` → manter (MetasService aceita 1 loja)

**Linha 1397-1401:** Seletor de loja: filtrar opções por `lojaIds`.

### 6b. `app/sistema/financeiro/page.tsx`

**Linha 47:**
```typescript
const { lojaId: defaultLojaId, lojaIds: defaultLojaIds } = useLojaFilter();
```

**Estratégia:** Seletor de loja continua funcionando; popular com lojas do usuário.

### 6c. `components/financeiro/RelatoriosPanel.tsx`

**Linha 34:** Adicionar `lojaIds` se precisar.
**Estratégia:** Usar `lojaIds[0]` como fallback.

### 6d. `components/vendas/NovaVendaModal.tsx`

**Linha 105:** Já usa `temAcessoLoja` — funcionará automaticamente.

### 6e. `components/vendas/TrocarProdutoModal.tsx` (NOVO)

**Linha 520:** `.eq("loja_id", lojaId)` — verificar se `lojaId` é do hook ou local.
- Se for local (formulário): não precisa mudar
- Se for do hook: trocar para `.in()`

### 6f. `components/vendas/HistoricoTrocas.tsx` (NOVO)

**Linha 74:** `.eq("loja_id", lojaId)` — mesma verificação de 6e.

---

## FASE 7 — Context Realtime

### `contexts/PermissoesRealtimeContext.tsx`

**Alterações:**
1. Além de escutar `permissoes`, TAMBÉM escutar `usuario_lojas`
2. Atualizar toast messages

```typescript
// Canal para mudanças em permissoes
const channelPermissoes = supabase
  .channel("permissoes-realtime")
  .on("postgres_changes", {
    event: "*", schema: "public", table: "permissoes",
    filter: `usuario_id=eq.${usuario.id}`,
  }, (payload) => {
    setVersaoPermissoes((v) => v + 1);
    // notificar usuário
    if (payload.eventType === "UPDATE") {
      const newData = payload.new as any;
      toast.success("Permissões atualizadas!", {
        description: newData.todas_lojas
          ? "Agora você tem acesso a todas as lojas"
          : newData.loja_ids?.length > 1
            ? `Acesso alterado para ${newData.loja_ids.length} lojas`
            : newData.loja_ids?.length === 1
              ? `Acesso alterado para loja ${newData.loja_ids[0]}`
              : "Suas permissões foram modificadas",
      });
    }
  })
  .subscribe();

// Canal para mudanças em usuario_lojas
const channelLojas = supabase
  .channel("usuario-lojas-realtime")
  .on("postgres_changes", {
    event: "*", schema: "public", table: "usuario_lojas",
    filter: `usuario_id=eq.${usuario.id}`,
  }, (payload) => {
    setVersaoPermissoes((v) => v + 1);
  })
  .subscribe();
```

---

## FASE 7b — API Route (NOVO)

### `app/api/permissoes/[usuarioId]/route.ts`

**Status:** Consulta `permissoes_usuarios` (possivelmente uma view no banco). Pode ser que essa view precise incluir `usuario_lojas`.

**Estratégia:** Por enquanto, manter como está. Verificar se `permissoes_usuarios` é uma view ou tabela. Se for view, atualizar definição posteriormente.

---

## FASE 8 — Serviços (NOVO)

Muitos serviços em `services/` fazem consultas `.eq("loja_id"` ou `.eq("id_loja"` diretas ao Supabase. Para cada serviço, verificar se o parâmetro `loja_id` recebido vem do **filtro do usuário** (via hook) ou de um **valor específico** (dropdown/formulário).

### Regra geral:
- **Se o `loja_id` vem do hook (filtro do usuário):** mudar `.eq()` → `.in()`
- **Se o `loja_id` vem de um dropdown/seletor:** manter `.eq()`

### Serviços que PRECISAM ser verificados:

| Serviço | Campos | Risco |
|---------|--------|-------|
| `services/vendasService.ts` | `loja_id` | 🟠 — usado em `filtros` |
| `services/estoqueService.ts` | `id_loja` | 🟢 — página usa filtro client-side |
| `services/ordemServicoService.ts` | `id_loja` | 🟠 — usado em `filtros` |
| `services/caixaService.ts` | `loja_id` | 🟠 — usado em `filtros` |
| `services/financeiroService.ts` | `loja_id`, `id_loja` | 🟠 — usado em `filtros` |
| `services/dashboardService.ts` | `loja_id`, `venda.loja_id` | 🟠 — dashboard page |
| `services/taxasCartaoService.ts` | `loja_id` | 🟠 — taxas-cartao page |
| `services/metasService.ts` | `loja_id` | 🟢 — manter 1 loja por meta |
| `services/rmaService.ts` | `loja_id` | 🟢 — página não usa hook |
| `services/aparelhosService.ts` | `loja_id` | 🟠 — aparelhos page |
| `services/aparelhosDashboardService.ts` | `loja_id` | 🟠 — aparelhos page |
| `services/caixaAparelhosService.ts` | `loja_id` | 🟠 — aparelhos page |
| `services/dashboardAparelhosService.ts` | `loja_id` | 🟠 — aparelhos page |
| `services/brindesAparelhosService.ts` | `loja_id` | 🟠 — aparelhos page |
| `services/transferenciasService.ts` | `loja_origem_id`, `loja_destino_id` | 🟠 — transferencias page |
| `services/tecnicoService.ts` | `id_loja` | 🟢 — não usa hook |
| `services/tecnicosService.ts` | `id_loja` | 🟢 — não usa hook |
| `services/ordemServicoEstoqueService.ts` | `id_loja` | 🟢 — não usa hook |
| `services/clienteService.ts` | `id_loja` | 🟢 — não usa hook |
| `services/historicoEstoqueService.ts` | `id_loja` | 🟢 — não usa hook |
| `services/lojasFotosService.ts` | `loja_id` | 🟢 — não usa hook |

### Estratégia de implementação segura:
Para cada serviço 🟠, criar overload que aceita `number | number[]`:
```typescript
// Antes
query = query.eq("loja_id", lojaId);

// Depois — aceita ambos
if (Array.isArray(lojaId)) {
  query = query.in("loja_id", lojaId);
} else {
  query = query.eq("loja_id", lojaId);
}
```

---

## FASE 9 — Cleanup (futuro)

Após tudo estável em produção:
1. Remover coluna `loja_id` da tabela `permissoes`
2. Remover `lojaId` dos hooks (manter só `lojaIds`)
3. Remover `loja_id` do tipo `Permissoes`
4. Remover `loja_id` dos server actions

---

## Checklist de implementação (ordem recomendada)

### Núcleo (não quebra nada):
- [ ] **FASE 0:** Script SQL (`scripts/criar_tabela_usuario_lojas.sql`) 🟢
- [ ] **FASE 1:** Types (`types/index.ts`) 🟢
- [ ] **FASE 2a:** Hook `usePermissoes.tsx` 🟡
- [ ] **FASE 2b:** Hook `useLojaFilter.ts` 🟡
- [ ] **FASE 3a:** Server action `permissoes.ts` 🟡
- [ ] **FASE 3b:** `services/permissoesService.ts` 🟡
- [ ] **FASE 3c:** `app/sistema/usuarios/actions/index.ts` (cadastro) 🟡
- [ ] **FASE 7:** `PermissoesRealtimeContext.tsx` 🟢
- [ ] **FASE 7b:** `app/api/permissoes/[usuarioId]/route.ts` (verificar) 🟢

### UI de gerenciamento:
- [ ] **FASE 4:** Modal `PermissoesModal.tsx` 🟡

### Páginas principais (1 por vez — cada uma testável):
- [ ] **FASE 5a:** `vendas/page.tsx` 🟠
- [ ] **FASE 5b:** `estoque/page.tsx` 🟠
- [ ] **FASE 5c:** `devolucoes/page.tsx` 🟠
- [ ] **FASE 5d:** `caixa/page.tsx` 🟠
- [ ] **FASE 5e:** `ordem-servico/page.tsx` 🟠
- [ ] **FASE 5f:** `transferencias/page.tsx` 🟠
- [ ] **FASE 5g:** `aparelhos/page.tsx` 🟠
- [ ] **FASE 5h:** `taxas-cartao/page.tsx` 🟠
- [ ] **FASE 5i1:** `dashboard/page.tsx` 🟠
- [ ] **FASE 5i2:** `relatorios/lucro/page.tsx` 🟠

### Componentes mais sensíveis:
- [ ] **FASE 6a:** `DashboardPessoal.tsx` 🔴
- [ ] **FASE 6b:** `financeiro/page.tsx` 🔴
- [ ] **FASE 6c:** `RelatoriosPanel.tsx` 🟠
- [ ] **FASE 6d:** `NovaVendaModal.tsx` 🟢 (já funciona via `temAcessoLoja`)
- [ ] **FASE 6e:** `TrocarProdutoModal.tsx` 🟠
- [ ] **FASE 6f:** `HistoricoTrocas.tsx` 🟠

### Serviços (análise individual):
- [ ] **FASE 8:** Verificar serviços 🟠 (lista detalhada acima)
