# Melhorias na Funcionalidade de Transferências

## Resumo das Alterações

Este documento descreve as melhorias implementadas no sistema de transferências de estoque entre lojas.

## Funcionalidades Implementadas

### 1. Seleção Individual de Origem e Destino por Produto

**Antes:** Todas as transferências tinham que ser da mesma loja de origem para a mesma loja de destino.

**Agora:** Cada produto na lista de transferência pode ter sua própria loja de origem e destino.

#### Como Funciona:
- Ao adicionar um produto à lista, ele herda as lojas padrão configuradas no topo
- Cada produto pode ter sua origem e destino alterados individualmente através de seletores dedicados
- O sistema valida automaticamente que origem ≠ destino para cada produto
- Ao confirmar a transferência, o sistema agrupa automaticamente produtos por pares de lojas e cria múltiplas transferências se necessário

### 2. Visualização de Estoque em Múltiplas Lojas

**Nova Funcionalidade:** Seletor de múltiplas lojas para visualização de estoque.

#### Como Usar:
1. Na Seção 1, use o seletor "Visualizar Estoque nas Lojas (Opcional)"
2. Selecione uma ou mais lojas para monitorar
3. Para cada produto adicionado à transferência, você verá:
   - **Estoque Atual:** Quantidade disponível em cada loja selecionada
   - **Estoque Após Transferência:** Previsão do estoque após confirmar a transferência

#### Indicadores Visuais:
- **Verde:** Loja que receberá produtos (destino)
- **Amarelo:** Loja que enviará produtos (origem)
- **Padrão:** Lojas não afetadas pela transferência
- **Seta (→):** Indica a mudança de estoque prevista

### 3. Interface Aprimorada

#### Seção 1: Configure as Lojas Padrão e Visualização
- **Loja de Origem Padrão:** Define a origem para novos produtos adicionados
- **Loja de Destino Padrão:** Define o destino para novos produtos adicionados
- **Visualizar Estoque nas Lojas:** Selecione múltiplas lojas para monitorar estoque

#### Seção 2: Adicione os Produtos (inalterada)
- Busca e seleção de produtos
- Definição de quantidade
- Visualização de estoque disponível

#### Seção 3: Produtos a Transferir (melhorada)
Cada card de produto agora exibe:
- **Nome e Marca do Produto**
- **Seletores de Origem e Destino Individuais**
  - Dropdown para selecionar loja de origem
  - Dropdown para selecionar loja de destino
- **Indicador Visual:** Origem → Destino
- **Quantidade e Valor**
- **Estoque nas Lojas Selecionadas:**
  - Estoque atual em cada loja
  - Estoque previsto após a transferência
  - Destaque visual para lojas afetadas

### 4. Validações Aprimoradas

O sistema agora valida:
- ✓ Todos os produtos têm loja de origem definida
- ✓ Todos os produtos têm loja de destino definida
- ✓ Nenhum produto tem origem = destino
- ✓ Estoque suficiente na loja de origem de cada produto
- ✓ Progresso da transferência baseado na configuração dos produtos

### 5. Criação Automática de Múltiplas Transferências

**Comportamento Inteligente:**
- Se você adicionar:
  - 3 produtos de Loja A → Loja B
  - 2 produtos de Loja B → Loja C
  - 1 produto de Loja A → Loja C

- O sistema criará automaticamente **3 transferências separadas**:
  1. Transferência de Loja A → Loja B (3 produtos)
  2. Transferência de Loja B → Loja C (2 produtos)
  3. Transferência de Loja A → Loja C (1 produto)

### 6. Relatórios Agrupados

Os botões de impressão (Detalhado e Resumido) agora:
- Detectam automaticamente os diferentes pares de lojas
- Geram um relatório separado para cada par origem → destino
- Facilitam a conferência e documentação das transferências

## Benefícios

### Para o Usuário
- ✓ **Flexibilidade:** Configure transferências complexas em uma única operação
- ✓ **Visibilidade:** Veja o impacto da transferência em todas as lojas
- ✓ **Controle:** Ajuste origem/destino de cada produto individualmente
- ✓ **Eficiência:** Não precisa criar múltiplas transferências manualmente

### Para o Sistema
- ✓ **Validação Robusta:** Garante integridade dos dados
- ✓ **Organização:** Transferências agrupadas automaticamente por lojas
- ✓ **Rastreabilidade:** Cada transferência mantém seu histórico independente
- ✓ **Escalabilidade:** Suporta operações complexas com múltiplas lojas

## Exemplo de Uso

### Cenário: Redistribuição de Estoque

**Situação:** Você precisa rebalancear o estoque de 5 produtos entre 3 lojas.

**Processo:**
1. Selecione todas as 3 lojas para visualização
2. Configure Loja A como origem padrão
3. Configure Loja B como destino padrão
4. Adicione os produtos à lista
5. Para cada produto, visualize o estoque nas 3 lojas
6. Ajuste individualmente origem/destino conforme necessário:
   - Produto 1: Loja A → Loja B
   - Produto 2: Loja A → Loja C
   - Produto 3: Loja B → Loja A
   - Produto 4: Loja B → Loja C
   - Produto 5: Loja C → Loja A

7. Visualize o estoque previsto em cada loja
8. Confirme a transferência
9. Sistema cria automaticamente 6 transferências (uma para cada par de lojas)

## Notas Técnicas

### Estrutura de Dados Atualizada

```typescript
interface ItemTransferencia {
  id_produto: string;
  produto_descricao: string;
  produto_marca?: string;
  quantidade: number;
  quantidade_disponivel: number;
  preco_venda?: number;
  loja_origem: string; // NOVO
  loja_destino: string; // NOVO
  estoques_lojas?: Array<{ // NOVO
    id_loja: number;
    loja_nome: string;
    quantidade: number;
  }>;
}
```

### Algoritmo de Agrupamento

O sistema usa um Map para agrupar produtos por par de lojas:
- Chave: `"lojaOrigemId->lojaDestinoId"`
- Valor: Array de produtos para esse par

Isso garante eficiência e organização ao criar as transferências no banco.

### Cálculo de Estoque Previsto

Para cada loja selecionada:
- Se for **origem** do item: `estoque_atual - quantidade`
- Se for **destino** do item: `estoque_atual + quantidade`
- Caso contrário: `estoque_atual` (sem alteração)

## Compatibilidade

✓ Totalmente compatível com o sistema existente de transferências  
✓ Não quebra funcionalidades anteriores  
✓ Banco de dados não requer alterações  
✓ APIs e triggers mantêm funcionamento normal  

## Data da Implementação

**Data:** 3 de dezembro de 2025  
**Arquivo Modificado:** `components/estoque/TransferenciaModal.tsx`
