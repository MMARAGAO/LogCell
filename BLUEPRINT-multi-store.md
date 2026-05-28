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

### Tipos de filtro adicionais que precisam de `number | number[]`:

**`types/aparelhos.ts`** — `FiltrosAparelhos.loja_id?: number`:
```typescript
loja_id?: number | number[];  // aceitar ambos
```

**`types/taxasCartao.ts`** — `FiltrosTaxaCartao.loja_id?: number`:
```typescript
loja_id?: number | number[];  // aceitar ambos
```

**`types/dashboardAparelhos.ts`** — `DashboardAparelhosFiltro.loja_id?: number`:
```typescript
loja_id?: number | number[];  // aceitar ambos
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
- `removerPermissoes(usuarioId)` — também limpar registros em `usuario_lojas`

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

### 3d. 🔴 `app/api/aparelhos/pagamento/route.ts` — Validar loja contra permissões

**Problema de segurança:** Este endpoint cria venda com `loja_id` vindo do body da requisição **sem validar se o usuário tem acesso àquela loja**. Usa `supabaseAdmin` (service role, bypass RLS).

**Solução:** Após obter o `usuarioId` (do token), verificar se o usuário tem acesso à `lojaId`:
```typescript
// Validar acesso do usuário à loja
const { data: temAcesso } = await supabaseAdmin
  .from("usuario_lojas")
  .select("loja_id")
  .eq("usuario_id", usuarioId)
  .eq("loja_id", lojaId)
  .maybeSingle();

// Fallback: verificar na tabela permissoes (migração)
if (!temAcesso) {
  const { data: perm } = await supabaseAdmin
    .from("permissoes")
    .select("loja_id, todas_lojas")
    .eq("usuario_id", usuarioId)
    .single();

  if (!perm?.todas_lojas && perm?.loja_id !== lojaId) {
    return NextResponse.json({ error: "Acesso negado a esta loja" }, { status: 403 });
  }
}
```

### 3e. 🔴 `services/pagamentoAparelhosService.ts` — Hardcoded `loja_id: 1`

**Linha 41:** `loja_id: 1` hardcoded. Possível bug já existente onde pagamentos são sempre associados à loja 1.

**Solução:** Verificar se este `loja_id: 1` deveria vir de um parâmetro ou do contexto do usuário. Se for intencional (loja padrão), documentar. Caso contrário, corrigir para receber o `lojaId` do caller.

**Problema de segurança:** Este endpoint cria venda com `loja_id` vindo do body da requisição **sem validar se o usuário tem acesso àquela loja**. Usa `supabaseAdmin` (service role, bypass RLS).

**Solução:** Após obter o `usuarioId` (do token), verificar se o usuário tem acesso à `lojaId`:
```typescript
// Validar acesso do usuário à loja
const { data: temAcesso } = await supabaseAdmin
  .from("usuario_lojas")
  .select("loja_id")
  .eq("usuario_id", usuarioId)
  .eq("loja_id", lojaId)
  .maybeSingle();

// Fallback: verificar na tabela permissoes (migração)
if (!temAcesso) {
  const { data: perm } = await supabaseAdmin
    .from("permissoes")
    .select("loja_id, todas_lojas")
    .eq("usuario_id", usuarioId)
    .single();

  if (!perm?.todas_lojas && perm?.loja_id !== lojaId) {
    return NextResponse.json({ error: "Acesso negado a esta loja" }, { status: 403 });
  }
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

### ⚠️ Atenção: useEffect com dependência `lojaId`

Páginas que têm `useEffect` com `lojaId` na lista de dependências **não recarregarão dados quando lojas forem adicionadas** (pois `lojaId` compat continua sendo o primeiro elemento, não muda de `[5]` para `[5,6]`).

**Solução:** Adicionar `lojaIds` como dependência adicional nos `useEffect` de:
- `app/sistema/vendas/page.tsx` — linha ~335
- `app/sistema/devolucoes/page.tsx` — linha ~78
- `app/sistema/configuracoes/taxas-cartao/page.tsx` — linha ~95

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

### 5i1. `app/sistema/dashboard/page.tsx` + `services/dashboardService.ts`

#### 5i1a. Mudanças no tipo `FiltroDashboard` (`types/dashboard.ts`)

`FiltroDashboard.loja_id` atualmente é `number` — precisa aceitar ambos:
```typescript
export interface FiltroDashboard {
  data_inicio: string;
  data_fim: string;
  loja_id?: number | number[];  // aceita ambos
}
```

#### 5i1b. Mudanças na página (`app/sistema/dashboard/page.tsx`)

- Adicionar `useLojaFilter()` para obter `lojaIds`
- Seletor de loja: mostrar apenas lojas que o usuário tem acesso

```typescript
const { lojaIds, podeVerTodasLojas } = useLojaFilter();

const lojasDisponiveis = podeVerTodasLojas
  ? lojas
  : lojas.filter(l => lojaIds.includes(l.id));
```

#### 5i1c. Mudanças no `services/dashboardService.ts`

**⚠️ Perigo:** Este serviço tem verificações **client-side** que usam `!==` com `loja_id`:
```typescript
// Exemplo — linha ~644
if (loja_id && p.venda?.loja_id !== loja_id) return;
```
Isso QUEBRA com array porque `array !== number` é sempre `true` — filtraria TODOS os resultados.

**Estratégia — 6 ocorrências (linhas ~644, 703, 801, 959, 1151, 1184, 1236):**
```typescript
// Antes (quebra com array):
if (loja_id && p.venda?.loja_id !== loja_id) return;

// Depois:
if (loja_id && (Array.isArray(loja_id)
  ? !loja_id.includes(p.venda?.loja_id)
  : p.venda?.loja_id !== loja_id
)) return;
```

#### 5i1d. Estratégia para RPCs

O `dashboardService.ts` chama 4 RPCs do PostgreSQL que aceitam `p_loja_id` como `bigint`:
- `calcular_metricas_vendas`
- `calcular_metricas_os`
- `calcular_os_por_tipo_cliente`
- `calcular_metricas_adicionais`

Essas **definições não estão no repositório** (estão no Supabase). Como aceitam 1 valor:
```typescript
const lojaIdRPC = Array.isArray(loja_id) ? loja_id[0] : loja_id;
```
**Limitação conhecida:** RPCs só calculam para a PRIMEIRA loja do usuário.

### 5i2. `app/sistema/relatorios/lucro/page.tsx`

**Status:** Não usa `useLojaFilter`. Tem seletor de loja próprio (`lojaFiltro`). Usuário pode selecionar qualquer loja sem validação de permissão.

**Estratégia:** Adicionar `useLojaFilter` e filtrar opções do seletor:
```typescript
const { lojaIds, podeVerTodasLojas } = useLojaFilter();

const lojasDisponiveis = podeVerTodasLojas
  ? lojas
  : lojas.filter(l => lojaIds.includes(l.id));
```

### 5i3. 🟠 `app/sistema/fornecedores/page.tsx` (NOVO)

**Status:** Não filtra por loja **nenhuma**. Carrega todos os fornecedores sem filtro.

**Estratégia:** Adicionar `useLojaFilter` e aplicar filtro no service:
```typescript
const { aplicarFiltroLoja, precisaFiltro } = useLojaFilter();
// Ao montar a query, aplicar filtro:
if (precisaFiltro) {
  query = aplicarFiltroLoja(query, "id_loja"); // se fornecedores têm id_loja
}
```

### 5i4. 🟠 `app/sistema/rmas/page.tsx` + `types/rma.ts` (NOVO)

**Status:** Página não filtra por loja. `FiltrosRMA.loja_id` é `number`.

**Estratégia:**
- `types/rma.ts`: `loja_id?: number` → `loja_id?: number | number[]`
- Página: adicionar `useLojaFilter` e aplicar filtro:
```typescript
const { lojaIds, podeVerTodasLojas } = useLojaFilter();

// Ao chamar rmaService
const filtros: FiltrosRMA = {};
if (!podeVerTodasLojas && lojaIds.length > 0) {
  filtros.loja_id = lojaIds;
}
const dados = await buscarRMAs(filtros);
```
- `services/rmaService.ts`: trocar `.eq("loja_id", filtros.loja_id)` para aceitar `number | number[]`

### 5i5. 🔴 `app/sistema/vendas/aparelhos/page.tsx` (NOVO)

**Status:** Nenhum filtro de loja. Usa `usePermissoes()` apenas para `temPermissao`. Consultas Supape diretas sem filtrar por loja. **Linha 542:** `loja_id: 1` hardcoded ao inserir brinde (bug).

**Estratégia:**
- Adicionar `useLojaFilter()` para obter `lojaIds`
- Aplicar filtro nas queries de vendas/aparelhos
- Substituir `loja_id: 1` hardcoded por valor vindo do contexto ou parâmetro:

```typescript
const { lojaIds, aplicarFiltroLoja, precisaFiltro } = useLojaFilter();

// Aplicar filtro nas queries:
if (precisaFiltro) {
  query = aplicarFiltroLoja(query, "loja_id");
}

// Corrigir hardcoded loja_id:
// Antes: loja_id: 1
// Depois: loja_id: lojaIds[0] || 1  (ou remover se não aplicável)
```

### 5i6. 🔴 `app/sistema/transferencias/nova/page.tsx` (NOVO)

**Status:** Carrega **todas as lojas** nos selects de origem/destino sem validar permissão do usuário. Usa `useAuth()` (não tem acesso a `lojaId`/`lojaIds`).

**Estratégia:**
- Adicionar `usePermissoes()` para obter `temAcessoLoja` ou `lojaIds`
- Filtrar as lojas disponíveis nos selects de origem/destino:

```typescript
const { temAcessoLoja } = usePermissoes();

// Ao carregar lojas, filtrar:
const lojasPermitidas = lojas.filter(l => temAcessoLoja(l.id));
```

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

### 6g. 🟠 `components/estoque/TransferenciaModal.tsx` (NOVO)

**Problema:** Carrega **todas** as lojas para os selects de origem/destino sem filtrar pelas lojas que o usuário tem acesso.

**Estratégia:** Usar `usePermissoes()` ou `useLojaFilter()` para filtrar as lojas disponíveis:
```typescript
const { temAcessoLoja } = usePermissoes();

const lojasDisponiveis = lojas.filter(l => temAcessoLoja(l.id));
```

**Seletor de origem:** só mostrar lojas que o usuário tem acesso.
**Seletor de destino:** mostrar lojas destino (pode ser qualquer loja?) — verificar regra de negócio.

### 6h. 🟡 `components/Sidebar.tsx` + `components/Header.tsx` — Exibir loja atual (NOVO)

**Problema:** Nenhum dos dois componentes mostra a loja atual do usuário ou permite alternar entre lojas para usuários com múltiplas lojas.

**Estratégia:**
- Adicionar `usePermissoes()` para obter `lojaIds`, `todasLojas`, `perfil`
- Exibir `mensagemAcesso` ou um seletor de loja no Header (ao lado do nome do usuário)
- Para usuários com múltiplas lojas, exibir um badge ou dropdown mostrando as lojas ativas

```typescript
// Header.tsx — adicionar seletor de loja
const { lojaIds, todasLojas, perfil } = usePermissoes();

{perfil !== "admin" && lojaIds.length > 0 && (
  <div className="flex items-center gap-1 text-xs text-default-500">
    <Store className="w-3 h-3" />
    <span>{todasLojas ? "Todas as lojas" : `${lojaIds.length} loja(s)`}</span>
  </div>
)}
```

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

**Estratégia:** Por enquanto, manter como está. A view `permissoes_usuarios` **não tem definição SQL neste repositório** — está apenas no Supabase. Será necessário:
1. Localizar a definição da view no Supabase Studio
2. Verificar se ela expõe `loja_id` (único) — se sim, decidir se atualiza ou ignora (o endpoint é de API, não usado pelo frontend principal)
3. Se a view precisar de atualização, executar `CREATE OR REPLACE VIEW` no Supabase

---

## FASE 8 — Serviços (NOVO)

Muitos serviços em `services/` fazem consultas `.eq("loja_id"` ou `.eq("id_loja"` diretas ao Supabase. Para cada serviço, verificar se o parâmetro `loja_id` recebido vem do **filtro do usuário** (via hook) ou de um **valor específico** (dropdown/formulário).

### Regra geral:
- **Se o `loja_id` vem do hook (filtro do usuário):** mudar `.eq()` → `.in()`
- **Se o `loja_id` vem de um dropdown/seletor:** manter `.eq()`

### Serviços que PRECISAM ser verificados:

| Serviço | Campos | Risco |
|---------|--------|-------|
| `services/vendasService.ts` | `loja_id` | 🟠 — `.eq()` em `listarVendas` |
| `services/transferenciasService.ts` | `loja_origem_id`, `loja_destino_id` | 🔴 — **OR query com string interpolation** (ver abaixo) |
| `services/taxasCartaoService.ts` | `loja_id` | 🔴 — **OR query com string interpolation** |
| `services/estoqueService.ts` | `id_loja` | 🟢 — página usa filtro client-side |
| `services/ordemServicoService.ts` | `id_loja` | 🟠 — `.eq()` em `buscarOrdensServico` |
| `services/caixaService.ts` | `loja_id` | 🟠 — `.eq()` em `listarCaixas`, `buscarHistorico` |
| `services/financeiroService.ts` | `loja_id`, `id_loja` | 🟠 — `.eq()` em folha, contas, custos |
| `services/dashboardService.ts` | `loja_id`, `venda.loja_id` | 🔴 — **`.eq()` + `!==` client-side + RPCs** (FASE 5i1) |
| `services/metasService.ts` | `loja_id` | 🟢 — manter 1 loja por meta |
| `services/rmaService.ts` | `loja_id` | 🟢 — página não usa hook |
| `services/aparelhosService.ts` | `loja_id` | 🟠 — `.eq()` em `buscarAparelhos` |
| `services/aparelhosDashboardService.ts` | `loja_id` | 🟠 — `.eq()` em métricas |
| `services/caixaAparelhosService.ts` | `loja_id` | 🟠 — `.eq()` |
| `services/dashboardAparelhosService.ts` | `loja_id` | 🟠 — `.eq()` |
| `services/brindesAparelhosService.ts` | `loja_id` | 🟠 — `.eq()` |
| `services/historicoEstoqueService.ts` | `id_loja` | 🟠 — `.eq()` |
| `services/ordemServicoDevolucoesService.ts` | `id_loja` | 🔴 — filtro **client-side** com `!==` (3 métodos) |
| `services/rmaService.ts` | `loja_id` | 🟠 — tipo precisa `number \| number[]` |
| `services/tecnicoService.ts` | `id_loja` | 🟢 — sem hook |
| `services/tecnicosService.ts` | `id_loja` | 🟢 — sem hook |
| `services/ordemServicoEstoqueService.ts` | `id_loja` | 🟢 — sem hook |
| `services/clienteService.ts` | `id_loja` | 🟢 — sem hook |
| `services/lojasFotosService.ts` | `loja_id` | 🟢 — sem hook |

### ⚠️ ATENÇÃO: OR queries com string interpolation

**`services/transferenciasService.ts`** (linhas 50-54, 132-138):
```typescript
query.or(`loja_origem_id.eq.${filtros.loja_id},loja_destino_id.eq.${filtros.loja_id}`);
```
Se `filtros.loja_id` virar array `[1, 2]`, o resultado seria `loja_origem_id.eq.1,2,loja_destino_id.eq.1,2` — SQL inválido. **QUEBRA**.

**`services/taxasCartaoService.ts`** (linha 112):
```typescript
query.or(`loja_id.eq.${filtros.loja_id},loja_id.is.null`);
```
Mesmo problema.

**Estratégia para OR queries:**
```typescript
// Versão segura para ambos os casos
if (Array.isArray(lojaId)) {
  // Construir OR manualmente para cada loja
  const conditions = lojaId.map(id =>
    `loja_origem_id.eq.${id},loja_destino_id.eq.${id}`
  ).join(',');
  query = query.or(conditions);
} else if (lojaId) {
  query = query.or(`loja_origem_id.eq.${lojaId},loja_destino_id.eq.${lojaId}`);
}
```

### ⚠️ `services/rmaService.ts` — tipo `loja_id` precisa suportar array

```typescript
// types/rma.ts — FiltrosRMA
loja_id?: number;  →  loja_id?: number | number[];

// services/rmaService.ts
if (filtros?.loja_id) {
  query = Array.isArray(filtros.loja_id)
    ? query.in("loja_id", filtros.loja_id)
    : query.eq("loja_id", filtros.loja_id);
}
```

### ⚠️ Filtros client-side com `!==` (quebram com array)

**`services/ordemServicoDevolucoesService.ts`** (linhas 132-140, 188-196, 244-251):
```typescript
if (loja_id) {
  result = result.filter((dev) => {
    const os = Array.isArray(dev.ordem_servico) ? (dev.ordem_servico as any[])[0] : dev.ordem_servico;
    return (os as any)?.id_loja === loja_id;
  });
}
```

**Estratégia — mesmo padrão do dashboardService.ts (FASE 5i1c):**
```typescript
if (loja_id) {
  result = result.filter((dev) => {
    const os = Array.isArray(dev.ordem_servico) ? (dev.ordem_servico as any[])[0] : dev.ordem_servico;
    const idLoja = (os as any)?.id_loja;
    return Array.isArray(loja_id) ? loja_id.includes(idLoja) : idLoja === loja_id;
  });
}
```

### RPC functions — ponto cego

Serviços como `dashboardService.ts` chamam RPCs (`calcular_metricas_vendas`, etc.) que aceitam `p_loja_id` como `bigint` único. **Definições não estão no repositório.**

Estratégia: passar `Array.isArray(loja_id) ? loja_id[0] : loja_id` — RPCs só calculam para a primeira loja.

### Estratégia de implementação segura:
Para cada serviço 🟠, usar overload que aceita `number | number[]`:
```typescript
// Antes
query = query.eq("loja_id", lojaId);

// Depois — aceita ambos
if (Array.isArray(lojaId)) {
  query = query.in("loja_id", lojaId);
} else if (lojaId !== undefined) {
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

### Páginas adicionais:
- [ ] **FASE 5i3:** `fornecedores/page.tsx` 🟠
- [ ] **FASE 5i4:** `rmas/page.tsx` + `types/rma.ts` 🟠
- [ ] **FASE 5i5:** `vendas/aparelhos/page.tsx` 🔴 (sem filtro + loja_id hardcoded)
- [ ] **FASE 5i6:** `transferencias/nova/page.tsx` 🔴 (sem validação de permissão)

### Componentes mais sensíveis:
- [ ] **FASE 6a:** `DashboardPessoal.tsx` 🔴
- [ ] **FASE 6b:** `financeiro/page.tsx` 🔴
- [ ] **FASE 6c:** `RelatoriosPanel.tsx` 🟠
- [ ] **FASE 6d:** `NovaVendaModal.tsx` 🟢 (já funciona via `temAcessoLoja`)
- [ ] **FASE 6e:** `TrocarProdutoModal.tsx` 🟠
- [ ] **FASE 6f:** `HistoricoTrocas.tsx` 🟠
- [ ] **FASE 6g:** `TransferenciaModal.tsx` 🟠
- [ ] **FASE 6h:** `Sidebar.tsx` + `Header.tsx` 🟡 (exibir loja atual)

### Segurança:
- [ ] **FASE 3d:** `api/aparelhos/pagamento/route.ts` 🔴 — validar loja contra permissões
- [ ] **FASE 3e:** `services/pagamentoAparelhosService.ts` 🔴 — hardcoded `loja_id: 1`

### Tipos de filtro adicionais:
- [ ] **FASE 1 — `types/aparelhos.ts`**: `FiltrosAparelhos.loja_id` → `number | number[]`
- [ ] **FASE 1 — `types/taxasCartao.ts`**: `FiltrosTaxaCartao.loja_id` → `number | number[]`
- [ ] **FASE 1 — `types/dashboardAparelhos.ts`**: `DashboardAparelhosFiltro.loja_id` → `number | number[]`

### Serviços (análise individual):
- [ ] **FASE 8 — vendasService.ts** 🟠
- [ ] **FASE 8 — transferenciasService.ts** 🔴 (OR query)
- [ ] **FASE 8 — taxasCartaoService.ts** 🔴 (OR query)
- [ ] **FASE 8 — ordemServicoService.ts** 🟠
- [ ] **FASE 8 — caixaService.ts** 🟠
- [ ] **FASE 8 — financeiroService.ts** 🟠
- [ ] **FASE 8 — dashboardService.ts** 🔴 (inclui RPCs + `!==`)
- [ ] **FASE 8 — aparelhosService.ts** 🟠
- [ ] **FASE 8 — aparelhosDashboardService.ts** 🟠
- [ ] **FASE 8 — caixaAparelhosService.ts** 🟠
- [ ] **FASE 8 — dashboardAparelhosService.ts** 🟠
- [ ] **FASE 8 — brindesAparelhosService.ts** 🟠
- [ ] **FASE 8 — historicoEstoqueService.ts** 🟠
- [ ] **FASE 8 — rmaService.ts** 🟠
- [ ] **FASE 8 — ordemServicoDevolucoesService.ts** 🔴 (filtro `!==`)

### useEffect com dependência `lojaId`:
- [ ] **FASE 5 — vendas/page.tsx** adicionar `lojaIds` nas deps 🟡
- [ ] **FASE 5 — devolucoes/page.tsx** adicionar `lojaIds` nas deps 🟡
- [ ] **FASE 5 — taxas-cartao/page.tsx** adicionar `lojaIds` nas deps 🟡

### Pendências no Supabase (fora do código):
- [ ] **RPC functions:** Localizar definições de `calcular_metricas_vendas` etc. no Supabase
- [ ] **View `permissoes_usuarios`:** Localizar definição e verificar se precisa de atualização
- [ ] **RPCs `inserir_loja_com_usuario` etc.:** Verificar o que fazem com `usuario_id`
