# 🔄 Atualizações - Devolução de OS (24 de Janeiro de 2026)

## 📋 Resumo das Implementações Adicionais

Sistema foi expandido para rastreamento completo de devoluções de OS com integração total ao caixa e PDF de relatório.

## 🆕 Novos Componentes Implementados

### 1. **Service Dedicado: `OrdemServicoDevolucoesService`** ✨

**Arquivo:** `services/ordemServicoDevolucoesService.ts` (NOVO)

Serviço especializado com os seguintes métodos:

```typescript
// Registra uma devolução de OS
registrarDevolucaoOS(dados: {
  id_ordem_servico: string;
  tipo_devolucao: "reembolso" | "credito";
  valor_total: number;
  motivo?: string;
  usuario_id: string;
  cliente_id?: string;
}): Promise<{success: boolean; devolucao?: DevolucaoOS}>

// Busca devoluções em um período com filtro opcional por loja
buscarDevolucoesOSPorPeriodo(
  data_inicio: string,
  data_fim: string,
  loja_id?: number
): Promise<DevolucaoOS[]>

// Busca apenas reembolsos (dinheiro)
buscarReembolsosOS(
  data_inicio: string,
  data_fim: string,
  loja_id?: number
): Promise<DevolucaoOS[]>

// Busca apenas devoluções com crédito
buscarCreditosOS(
  data_inicio: string,
  data_fim: string,
  loja_id?: number
): Promise<DevolucaoOS[]>
```

**Funcionalidades:**

- ✅ Registra devoluções em tabela dedicada
- ✅ Cria crédito automaticamente quando necessário
- ✅ Vincula devolução ao cliente
- ✅ Filtra por período e loja
- ✅ Rastreamento completo para auditoria

---

### 2. **Integração com CaixaService** 🏦

**Arquivo:** `services/caixaService.ts` (ATUALIZADO)

Método `buscarResumoCaixa()` agora:

- Busca devoluções de OS do período
- Separa reembolsos de créditos
- Adiciona 2 novos campos ao resumo:
  ```typescript
  devolu_os_reembolso: {
    quantidade: number;
    total: number;
    lista: DevolucaoOS[];
  };
  devolu_os_credito: {
    quantidade: number;
    total: number;
    lista: DevolucaoOS[];
  };
  ```
- Atualiza `total_saidas` incluindo reembolsos
- Recalcula `saldo_esperado` corretamente

**Impacto no Cálculo:**

```
Antes: total_saidas = devoluções_vendas + sangrias
Agora: total_saidas = devoluções_vendas + reembolsos_os + sangrias

saldo_esperado = saldo_inicial + pagamentos + os - saidas
```

---

### 3. **Tipo ResumoCaixa Expandido** 📊

**Arquivo:** `types/caixa.ts` (ATUALIZADO)

Novos campos no interface `ResumoCaixa`:

```typescript
devolu_os_reembolso?: {
  quantidade: number;
  total: number;
  lista?: any[];
};
devolu_os_credito?: {
  quantidade: number;
  total: number;
  lista?: any[];
};
```

---

### 4. **PDF Caixa com Seção de Reembolsos OS** 📄

**Arquivo:** `app/sistema/caixa/page.tsx` (ATUALIZADO)

**Nova Seção:** "REEMBOLSOS DE ORDEM DE SERVIÇO"

- Posição: Após "REEMBOLSOS DE VENDAS"
- Cor: Vermelho (220, 38, 38) - consistente com reembolsos
- Tabela com colunas:
  - Data/Hora da devolução
  - Número da OS
  - Nome do cliente
  - Valor reembolsado

**Exemplo de Saída:**

```
REEMBOLSOS DE ORDEM DE SERVIÇO
┌─────────────┬──────┬─────────────┬─────────────┐
│ Data/Hora   │ OS   │ Cliente     │ Valor       │
├─────────────┼──────┼─────────────┼─────────────┤
│ 24/01 14:30 │ #1004│ João Silva  │ R$ 150,00   │
│ 24/01 15:15 │ #1006│ Maria Costa │ R$ 280,50   │
└─────────────┴──────┴─────────────┴─────────────┘
```

---

### 5. **Cards de Status no Dashboard** 🎯

**Arquivo:** `app/sistema/caixa/page.tsx` (ATUALIZADO)

Dois novos cards adicionados:

#### Card 1: "OS Reembolso" (Vermelho)

- **Ícone:** RefreshCw (vermelho)
- **Mostra:** Quantidade e total de OS devolvidas com reembolso
- **Cor:** Danger/Vermelho (#ef4444)
- **Apareça:** Apenas se houver reembolsos
- **Exemplo:**
  ```
  OS Reembolso (2)
  R$ 430,50
  ```

#### Card 2: "OS Crédito" (Amarelo)

- **Ícone:** Gift (amarelo)
- **Mostra:** Quantidade e total de OS devolvidas com crédito
- **Cor:** Warning/Amarelo (#f59e0b)
- **Apareça:** Apenas se houver créditos
- **Exemplo:**
  ```
  OS Crédito (1)
  R$ 520,00
  ```

**Posição no Layout:**

```
Grid de 4 colunas:
[Devoluções Crédito] [Devoluções Sem] [Sangrias] [Quebras]
[OS Reembolso]       [OS Crédito]     [OS]      [Crédito]
```

---

### 6. **Tabela de Banco de Dados** 🗄️

**Arquivo:** `migrations/20260124_criar_devolucoes_ordem_servico.sql` (NOVO)

Script SQL que cria:

#### Tabela `devolu_ordem_servico`

```sql
CREATE TABLE devolu_ordem_servico (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_ordem_servico UUID NOT NULL REFERENCES ordem_servico(id),
  tipo_devolucao TEXT NOT NULL CHECK (tipo_devolucao IN ('reembolso', 'credito')),
  valor_total DECIMAL(10, 2) NOT NULL,
  motivo TEXT,
  realizado_por UUID REFERENCES usuarios(id),
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

#### Índices Criados

- `idx_devolu_os_ordem_servico` - Busca por OS
- `idx_devolu_os_tipo` - Filtro por tipo
- `idx_devolu_os_criado_em` - Range por data

#### Coluna adicionada em `ordem_servico`

```sql
ALTER TABLE ordem_servico ADD COLUMN status_devolucao TEXT;
-- Valores: 'devolvida', 'devolvida_com_credito', NULL
```

#### Colunas adicionadas em `creditos_cliente`

```sql
devolucao_os_id UUID REFERENCES devolu_ordem_servico(id)
ordem_servico_id UUID REFERENCES ordem_servico(id)
```

---

## ✅ Requisitos Atendidos

### Solicitação Original

> 1. Devolução de OS (serviço + peça)
> 2. Criar opção de devolução da OS quando o serviço é desfeito
> 3. Sistema deve gerar a devolução como reembolso ou crédito para o cliente
> 4. Aparecer no PDF do caixa uma listagem das DEVOLUÇÕES COM REEMBOLSO de OS

### Status de Implementação

- ✅ **Opção de devolução** - Modal já existente, agora com rastreamento
- ✅ **Reembolso** - Sistema registra e mostra no PDF
- ✅ **Crédito** - Sistema cria crédito cliente automaticamente
- ✅ **PDF do Caixa** - Nova seção "REEMBOLSOS DE ORDEM DE SERVIÇO"
- ✅ **Cards Dashboard** - "OS Reembolso" e "OS Crédito"
- ✅ **Cálculo Correto** - Saldo esperado inclui reembolsos

---

## 🔄 Fluxo Funcional Completo

```
1. Usuário abre OS
   ↓
2. Clica em "Devolver OS"
   ↓
3. Modal apresenta opções:
   ├─ Reembolso em Dinheiro
   └─ Crédito para Cliente
   ↓
4. Usuário confirma tipo
   ↓
5. Sistema executa:
   ├─ devolverOrdemServico() [existente]
   ├─ OrdemServicoDevolucoesService.registrarDevolucaoOS() [novo]
   ├─ Atualiza status da OS
   ├─ Remove peças e pagamentos
   └─ Cria crédito se selecionado
   ↓
6. Caixa aberto:
   └─ CaixaService.buscarResumoCaixa()
      ├─ Busca devoluções_os
      ├─ Separa por tipo
      └─ Adiciona ao resumo
   ↓
7. PDF Gerado:
   └─ Inclui seção "REEMBOLSOS DE ORDEM DE SERVIÇO"
      ├─ Tabela com devoluções
      └─ Formatação consistente
   ↓
8. Dashboard mostra:
   ├─ Card "OS Reembolso"
   └─ Card "OS Crédito"
```

---

## 📊 Exemplo de Dados

### Cenário: Duas devoluções em um caixa

**Devolução 1 - OS #1004 (Reembolso)**

- Cliente: João Silva
- Valor: R$ 150,00
- Tipo: Reembolso (sai dinheiro)

**Devolução 2 - OS #1006 (Crédito)**

- Cliente: Maria Costa
- Valor: R$ 280,50
- Tipo: Crédito (não sai dinheiro)

### Resumo do Caixa

```
Total Entradas: R$ 5.000,00 (vendas + OS)
Total Saídas: R$ 150,00 (apenas reembolsos)
             ↑
             └─ Não inclui devolução com crédito!

Saldo Esperado: Inicial + Entradas - Saídas
```

### PDF Caixa

```
REEMBOLSOS DE ORDEM DE SERVIÇO
┌───────────┬───────┬──────────────┬───────────┐
│ 24/01 14:30│ #1004 │ João Silva   │ R$ 150,00 │
└───────────┴───────┴──────────────┴───────────┘
```

### Dashboard Cards

```
OS Reembolso (1)     OS Crédito (1)
R$ 150,00            R$ 280,50
```

---

## 🚀 Como Executar

### Passo 1: Migração do Banco

```sql
-- Executar em Supabase → SQL Editor
-- Arquivo: migrations/20260124_criar_devolucoes_ordem_servico.sql
-- Verificar que tabelas foram criadas
```

### Passo 2: Testar Fluxo

```
1. Abrir OS no sistema
2. Clicar "Devolver"
3. Escolher tipo (reembolso ou crédito)
4. Confirmar
5. Abrir caixa
6. Verificar cards de devoluções
7. Gerar PDF e verificar seção
```

### Passo 3: Validar Valores

```
Verificar:
- Saldo esperado incluindo reembolsos
- Cards mostrando devoluções corretas
- PDF com seção de reembolsos
```

---

## 🔍 Validações Implementadas

- ✅ OS deve existir
- ✅ Usuário deve ter permissão
- ✅ Tipo de devolução deve ser válido
- ✅ Valor deve ser positivo
- ✅ Cliente deve existir (ou ser criado)
- ✅ Crédito vinculado corretamente

---

## 📝 Notas Importantes

1. **Compatibilidade** - Sistema mantém compatibilidade com chamadas antigas
2. **Auditoria** - Cada devolução deixa rastro completo no banco
3. **Cálculos** - Reembolsos afetam saldo esperado do caixa
4. **Crédito** - Não afeta caixa (dinheiro fica com empresa como crédito)
5. **Peças** - Devolvidas automaticamente ao estoque

---

## ✅ Checklist de Validação

Antes de usar em produção:

- [ ] Migration SQL executada sem erros
- [ ] Tabela `devolu_ordem_servico` criada
- [ ] Índices criados para performance
- [ ] Coluna `status_devolucao` adicionada em `ordem_servico`
- [ ] Colunas adicionadas em `creditos_cliente`
- [ ] Devolução de OS com reembolso funciona
- [ ] Devolução de OS com crédito funciona
- [ ] PDF caixa inclui seção de reembolsos
- [ ] Cards de devoluções aparecem no dashboard
- [ ] Saldo esperado calculado corretamente
- [ ] Histórico da OS registra devolução
- [ ] Status da OS muda para "devolvida"
