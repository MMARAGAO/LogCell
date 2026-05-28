# Plano: Desconto na Venda de Aparelhos

## Arquivos que serão modificados

1. `components/aparelhos/NovaVendaModal.tsx` — venda rápida
2. `components/aparelhos/VendaAparelhoModal.tsx` — venda completa

`components/vendas/DescontoModal.tsx` já existe e será **reutilizado sem alterações**.

---

## 1. NovaVendaModal.tsx (venda rápida)

### 1.1 Imports a adicionar

```typescript
import { usePermissoes } from "@/hooks/usePermissoes";
import { DescontoModal } from "@/components/vendas/DescontoModal";
```

> Não importa `VendasService` — o insert do desconto será via supabase direto.

### 1.2 Novos estados (após linha 78, junto dos outros states)

```typescript
const [descontoInfo, setDescontoInfo] = useState<{
  tipo: "valor" | "percentual";
  valor: number;
  motivo: string;
} | null>(null);
const [descontoModalOpen, setDescontoModalOpen] = useState(false);
```

### 1.3 Extrair temPermissao

```typescript
const { temPermissao } = usePermissoes();
```

### 1.4 Função calcularDescontoEmReais

Inserir antes do `handleFinalizar`:

```typescript
const valorDescontoCalculado = (): number => {
  if (!descontoInfo) return 0;
  if (descontoInfo.tipo === "percentual") {
    return (valorAparelho * descontoInfo.valor) / 100;
  }
  return descontoInfo.valor;
};
```

### 1.5 No useEffect de reset (linha 81-89)

Adicionar no bloco que reseta estados quando `isOpen` muda:
```typescript
setDescontoInfo(null);
setDescontoModalOpen(false);
```

### 1.6 UI: Botão + display do desconto no Resumo

Inserir **APÓS** a linha "Valor do Aparelho" (após linha 590), dentro do `<div className="space-y-1.5 text-xs">`:

```tsx
{temPermissao("vendas.aplicar_desconto") && (
  <>
    <div className="pt-2">
      <Button
        className="w-full"
        color={descontoInfo ? "success" : "default"}
        size="sm"
        variant="flat"
        onPress={() => setDescontoModalOpen(true)}
      >
        {descontoInfo ? "Alterar Desconto" : "Aplicar Desconto"}
      </Button>
    </div>

    {descontoInfo && (
      <div className="bg-success-50 dark:bg-success-900/20 rounded-lg p-2 space-y-1">
        <div className="flex justify-between text-xs text-success">
          <span>Desconto ({descontoInfo.tipo === "percentual" ? `${descontoInfo.valor}%` : "R$"})</span>
          <span className="font-semibold">
            - {formatarMoeda(valorDescontoCalculado())}
          </span>
        </div>
        <div className="flex justify-between text-xs font-bold">
          <span>Valor Final</span>
          <span className="text-primary">
            {formatarMoeda(valorAparelho - valorDescontoCalculado())}
          </span>
        </div>
        <Button
          className="mt-1"
          color="danger"
          size="sm"
          variant="light"
          onPress={() => setDescontoInfo(null)}
        >
          Remover desconto
        </Button>
      </div>
    )}
  </>
)}
```

### 1.7 handleFinalizar (criação) — else, linha 260

Substituir o objeto `vendaData`:

```typescript
const valorDescCalculado = valorDescontoCalculado();
const valorComDesconto = valorAparelho - valorDescCalculado;

const vendaData = {
  cliente_id: clienteSelecionado?.id || null,
  loja_id: lojaId,
  vendedor_id: usuario?.id,
  status: "concluida",
  tipo: "normal",
  valor_total: valorComDesconto,
  valor_pago: valorComDesconto,
  valor_desconto: valorDescCalculado,
  saldo_devedor: 0,
};
```

Após o `vendaCriada` ser obtido (linha ~285), se houver desconto:

```typescript
if (descontoInfo) {
  const { error: errDesc } = await supabase
    .from("descontos_venda")
    .insert({
      venda_id: vendaCriada.id,
      tipo: descontoInfo.tipo,
      valor: descontoInfo.valor,
      motivo: descontoInfo.motivo,
      aplicado_por: usuario?.id,
    });

  if (errDesc) {
    console.error("[NovaVenda] Erro ao inserir desconto:", errDesc);
  } else {
    await supabase.from("historico_vendas").insert({
      venda_id: vendaCriada.id,
      tipo_acao: "desconto",
      descricao: `Desconto aplicado: ${descontoInfo.tipo === "valor" ? `R$ ${descontoInfo.valor.toFixed(2)}` : `${descontoInfo.valor}%`} - ${descontoInfo.motivo}`,
      usuario_id: usuario?.id,
    });
  }
}
```

### 1.8 handleFinalizar (edição) — if, linha 230

Atualizar o objeto `.update()`:

```typescript
const valorDescCalculado = valorDescontoCalculado();
const valorComDesconto = valorAparelho - valorDescCalculado;

const { error: vendaUpdateError } = await supabase
  .from("vendas")
  .update({
    cliente_id: clienteSelecionado?.id || null,
    loja_id: lojaId,
    status: "concluida",
    valor_total: valorComDesconto,
    valor_pago: valorComDesconto,
    valor_desconto: valorDescCalculado,
    saldo_devedor: 0,
  })
  .eq("id", vendaId);
```

Se desconto, inserir/atualizar `descontos_venda`:

```typescript
if (descontoInfo && !vendaUpdateError) {
  // Remove descontos anteriores e insere o novo
  await supabase.from("descontos_venda").delete().eq("venda_id", vendaId);
  await supabase.from("descontos_venda").insert({
    venda_id: vendaId,
    tipo: descontoInfo.tipo,
    valor: descontoInfo.valor,
    motivo: descontoInfo.motivo,
    aplicado_por: usuario?.id,
  });
}
```

### 1.9 Adicionar DescontoModal (antes do `</ModalContent>`)

```tsx
<DescontoModal
  isOpen={descontoModalOpen}
  valorTotal={valorAparelho}
  onAplicar={(tipo, valor, motivo) => {
    setDescontoInfo({ tipo, valor, motivo });
    setDescontoModalOpen(false);
  }}
  onClose={() => setDescontoModalOpen(false)}
/>
```

---

## 2. VendaAparelhoModal.tsx (venda completa)

### 2.1 Imports a adicionar

```typescript
import { usePermissoes } from "@/hooks/usePermissoes";
import { DescontoModal } from "@/components/vendas/DescontoModal";
import { Percent } from "lucide-react";
```

> `useMemo` não precisa ser adicionado — o cálculo será inline.

### 2.2 Novos estados (após linha 188)

```typescript
const [descontoInfo, setDescontoInfo] = useState<{
  tipo: "valor" | "percentual";
  valor: number;
  motivo: string;
} | null>(null);
const [descontoModalOpen, setDescontoModalOpen] = useState(false);
```

### 2.3 Extrair temPermissao

```typescript
const { temPermissao } = usePermissoes();
```

### 2.4 Cálculo do valor com desconto

Adicionar junto com os outros `const` computados (linhas 312-317), **antes de `saldoDevedor`**:

```typescript
const valorDescontoCalculado = descontoInfo
  ? descontoInfo.tipo === "percentual"
    ? (valorVendaNumerico * descontoInfo.valor) / 100
    : descontoInfo.valor
  : 0;

const valorComDesconto = valorVendaNumerico - valorDescontoCalculado;
```

### 2.5 Atualizar saldoDevedor (linha 317)

De:
```typescript
const saldoDevedor = valorVendaNumerico - valorPago;
```
Para:
```typescript
const saldoDevedor = valorComDesconto - valorPago;
```

### 2.6 Resetar desconto quando modal fecha

```typescript
useEffect(() => {
  if (!isOpen) {
    setDescontoInfo(null);
    setDescontoModalOpen(false);
  }
}, [isOpen]);
```

### 2.7 UI: Card de desconto (APÓS o card "Valor da Venda", entre linhas 977 e 979)

```tsx
{/* Desconto */}
{temPermissao("vendas.aplicar_desconto") && (
  <Card className="border border-default-200 shadow-sm">
    <CardBody className="gap-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2">
          <Percent className="w-4 h-4 text-success" />
          Desconto
        </h3>
      </div>

      {!descontoInfo ? (
        <Button
          color="success"
          size="sm"
          startContent={<Percent className="w-4 h-4" />}
          variant="flat"
          onPress={() => setDescontoModalOpen(true)}
        >
          Aplicar Desconto
        </Button>
      ) : (
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-default-600">Valor Original</span>
            <span className="font-medium">{formatarMoeda(valorVendaNumerico)}</span>
          </div>
          <div className="flex justify-between text-success">
            <span>Desconto ({descontoInfo.tipo === "percentual" ? `${descontoInfo.valor}%` : "R$"})</span>
            <span className="font-semibold">- {formatarMoeda(valorDescontoCalculado)}</span>
          </div>
          <Divider className="my-1" />
          <div className="flex justify-between font-bold">
            <span>Valor Final</span>
            <span className="text-primary">{formatarMoeda(valorComDesconto)}</span>
          </div>
          <p className="text-xs text-default-400 italic mt-1">
            Motivo: {descontoInfo.motivo}
          </p>
          <Button
            className="mt-1"
            color="danger"
            size="sm"
            variant="light"
            onPress={() => setDescontoInfo(null)}
          >
            Remover desconto
          </Button>
        </div>
      )}
    </CardBody>
  </Card>
)}
```

### 2.8 handleFinalizarVenda — insert da venda (linhas 579-601)

Substituir o insert:

```typescript
const { data: venda, error: erroVenda } = await supabase
  .from("vendas")
  .insert({
    numero_venda: numeroVenda,
    cliente_id: clienteId,
    loja_id: lojaId,
    vendedor_id: usuario.id,
    status: "concluida",
    tipo: "normal",
    valor_total: valorComDesconto,
    valor_pago: valorComDesconto,
    valor_desconto: valorDescontoCalculado,
    saldo_devedor: 0,
    observacoes:
      observacoes ||
      `Venda de aparelho: ${aparelho.marca} ${aparelho.modelo}`,
    finalizado_em: new Date().toISOString(),
    finalizado_por: usuario.id,
  })
  .select("id")
  .single();

if (erroVenda) throw erroVenda;

// Inserir desconto na tabela descontos_venda (para relatórios)
if (descontoInfo) {
  const { error: errDesc } = await supabase
    .from("descontos_venda")
    .insert({
      venda_id: venda.id,
      tipo: descontoInfo.tipo,
      valor: descontoInfo.valor,
      motivo: descontoInfo.motivo,
      aplicado_por: usuario.id,
    });

  if (errDesc) {
    console.error("[VendaAparelho] Erro ao inserir desconto:", errDesc);
  } else {
    await supabase.from("historico_vendas").insert({
      venda_id: venda.id,
      tipo_acao: "desconto",
      descricao: `Desconto aplicado: ${descontoInfo.tipo === "valor" ? `R$ ${descontoInfo.valor.toFixed(2)}` : `${descontoInfo.valor}%`} - ${descontoInfo.motivo}`,
      usuario_id: usuario.id,
    });
  }
}
```

### 2.9 Adicionar DescontoModal (antes do `<ModalFooter>`)

```tsx
<DescontoModal
  isOpen={descontoModalOpen}
  valorTotal={valorVendaNumerico}
  onAplicar={(tipo, valor, motivo) => {
    setDescontoInfo({ tipo, valor, motivo });
    setDescontoModalOpen(false);
  }}
  onClose={() => setDescontoModalOpen(false)}
/>
```

---

## 3. O que NÃO será alterado

| Arquivo | Motivo |
|---------|--------|
| `services/vendasService.ts` | `recalcularTotais()` quebra para vendas sem `itens_venda` |
| `app/sistema/vendas/aparelhos/page.tsx` | KPIs usam `pagamentos_venda`, não `vendas.valor_desconto` |
| `components/vendas/DescontoModal.tsx` | Já funciona, reutilizar sem alterações |
| `app/sistema/vendas/page.tsx` | Fora do escopo, já tem desconto |
| `components/vendas/NovaVendaModal.tsx` | Fora do escopo, já tem desconto |

---

## 4. Correções aplicadas ao plano original

| # | Problema encontrado | Correção |
|---|--------------------|----------|
| 1 | `PercentBadgeIcon` não existe no heroicons | **NovaVendaModal:** sem ícone no botão, apenas texto |
| 2 | Posição do botão: "entre Divider e Valor" é errado | Deve ser **APÓS** "Valor do Aparelho" |
| 3 | `Chip.onClose` não usado no código, risco de não funcionar | Substituído por `Button` "Remover desconto" |
| 4 | `useMemo` não importado no VendaAparelhoModal | Cálculo inline (sem useMemo), mais simples e consistente |
| 5 | `valor_pago: Math.min(valorPago, valorComDesconto)` | Simplificado para `valor_pago: valorComDesconto` (mesmo padrão atual) |
| 6 | `saldo_devedor: Math.max(0, valorComDesconto - valorPago)` | Simplificado para `saldo_devedor: 0` (mesmo padrão atual) |
| 7 | Se `descontos_venda` falhar, não quebrar a venda | Erro logado mas não bloqueia (`if(errDesc)` apenas log) |

---

## 5. Verificações pós-implantação

- [ ] `npm run build` — sem erros
- [ ] `npm run lint` — sem erros novos
- [ ] **Venda rápida:** aplicar desconto %, ver valor final no resumo
- [ ] **Venda rápida:** aplicar desconto R$, ver valor final
- [ ] **Venda rápida:** desconto > valor total é bloqueado pelo DescontoModal
- [ ] **Venda rápida:** desconto > desconto_maximo é bloqueado
- [ ] **Venda rápida:** sem desconto continua funcionando (valor_desconto=0)
- [ ] **Venda completa:** aplicar desconto %, ver saldo_devedor recalculado
- [ ] **Venda completa:** pagamentos + troca + desconto combinados
- [ ] **Venda completa:** remover desconto volta ao normal
- [ ] `descontos_venda` recebe registro após venda com desconto
- [ ] `descontos_venda` NÃO recebe registro se venda sem desconto
- [ ] `historico_vendas` recebe registro após venda com desconto
- [ ] KPIs da página de aparelhos continuam corretos
- [ ] Fechar modal e reabrir: descontoInfo resetado
