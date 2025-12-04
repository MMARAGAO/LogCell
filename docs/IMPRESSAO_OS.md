# Sistema de Impressão de Ordens de Serviço

## Funcionalidades Implementadas

### 1. Impressão em PDF (A4)

- **Formato**: PDF tamanho A4 padrão
- **Uso**: Arquivo para envio por e-mail ou armazenamento
- **Botão**: "Gerar PDF" (verde) no modal de detalhes da OS
- **Arquivo**: Salvo como `OS_[numero].pdf`

**Conteúdo do PDF:**

- Cabeçalho da empresa (nome, endereço, telefone, CNPJ)
- Número da OS e data de abertura
- Status e prioridade
- Dados completos do cliente
- Dados completos do equipamento
- Defeito reclamado
- Laudo técnico (se houver)
- Tabela de peças utilizadas (se houver)
- Valores detalhados (mão de obra, peças, desconto, total)
- Observações técnicas
- Campos para assinatura do cliente e técnico

### 2. Impressão em Cupom Térmico (80mm)

- **Formato**: Texto formatado para impressora térmica de 80mm
- **Uso**: Impressão direta em impressora térmica/cupom
- **Botão**: "Cupom Térmico" (roxo) no modal de detalhes da OS
- **Fonte**: Courier New (monoespaçada) para alinhamento perfeito

**Conteúdo do Cupom:**

- Cabeçalho centralizado da empresa
- Número da OS, data e hora
- Status e prioridade
- Dados do cliente
- Dados do equipamento
- Defeito reclamado
- Laudo técnico (se houver)
- Lista de peças com valores
- Resumo financeiro
- Observações
- Campo para assinatura do cliente

## Como Usar

### Gerar PDF

1. Abra os detalhes de uma Ordem de Serviço
2. Clique no botão **"Gerar PDF"** (ícone de download)
3. O PDF será baixado automaticamente
4. Arquivo pronto para impressão em impressora comum (A4)

### Imprimir Cupom Térmico

1. Abra os detalhes de uma Ordem de Serviço
2. Clique no botão **"Cupom Térmico"** (ícone de impressora)
3. Uma janela de impressão será aberta
4. Selecione sua impressora térmica
5. Configure o tamanho do papel como 80mm
6. Clique em "Imprimir"

**Dica**: Configure sua impressora térmica para corte automático após impressão.

## Configuração da Impressora Térmica

### Windows

1. Painel de Controle → Dispositivos e Impressoras
2. Clique com botão direito na impressora térmica → Preferências de Impressão
3. Configure:
   - Tamanho do papel: 80mm (largura personalizada)
   - Orientação: Retrato
   - Margens: 0mm ou mínimas

### Impressoras Suportadas

- Impressoras térmicas de 80mm (padrão)
- Exemplos: Elgin, Bematech, Epson TM-T20, Daruma, etc.
- Qualquer impressora que aceite papel de 80mm de largura

## Dados da Loja

Os dados impressos (nome, endereço, telefone, CNPJ) são buscados automaticamente da tabela `lojas` com base na `loja_id` da Ordem de Serviço.

**Campos utilizados:**

- `nome` (obrigatório)
- `endereco` (opcional)
- `telefone` (opcional)
- `cnpj` (opcional)

## Estrutura Técnica

### Arquivos Criados

- `lib/impressaoOS.ts`: Funções de geração de PDF e cupom térmico

### Dependências

- `jspdf`: Geração de PDF
- `jspdf-autotable`: Tabelas no PDF (já instaladas)

### Funções Principais

```typescript
// Gerar PDF
gerarPDFOrdemServico(os: OrdemServico, pecas: PecaOS[], dadosLoja: DadosLoja)

// Gerar conteúdo do cupom térmico
gerarCupomTermicoOS(os: OrdemServico, pecas: PecaOS[], dadosLoja: DadosLoja)

// Abrir janela de impressão do cupom
imprimirCupomTermico(cupom: string)
```

## Exemplos de Saída

### PDF

```
┌─────────────────────────────────────┐
│         NOME DA LOJA                │
│    Rua Example, 123 - São Paulo     │
│        Tel: (11) 1234-5678          │
│      CNPJ: 12.345.678/0001-90       │
├─────────────────────────────────────┤
│      ORDEM DE SERVIÇO               │
├─────────────────────────────────────┤
│ OS: 12345        Data: 04/12/2025   │
│ Status: ABERTA   Prioridade: ALTA   │
│                                      │
│ DADOS DO CLIENTE                    │
│ Nome: João Silva                    │
│ Telefone: (11) 98765-4321          │
│ ...                                 │
└─────────────────────────────────────┘
```

### Cupom Térmico (80mm)

```
        NOME DA LOJA
   Rua Example, 123 - SP
    Tel: (11) 1234-5678
  CNPJ: 12.345.678/0001-90
================================================
        ORDEM DE SERVICO
================================================

OS: 12345
Data: 04/12/2025 14:30
Status: ABERTA
Prioridade: ALTA

------------------------------------------------
CLIENTE
------------------------------------------------
Nome: João Silva
Tel: (11) 98765-4321
...
```

## Observações

- As impressões incluem apenas dados já salvos no banco
- Peças são carregadas automaticamente da tabela `ordem_servico_pecas`
- Valores são calculados em tempo real
- Cupom térmico usa formatação ASCII para compatibilidade universal
- PDF inclui espaços para assinatura física
