# Guia de Uso - Sistema de Logs de Deleção de Vendas

## Acessando os Logs

Na página de **Vendas** (`/sistema/vendas`), você encontrará um novo botão chamado **"Logs de Deleção"** ao lado do botão "Nova Venda".

Clique neste botão para acessar a página de auditoria.

## Funcionalidades da Página de Logs

### 1. **Pesquisa**
- Campo de busca para procurar por número de venda, cliente ou ID do registro
- A busca é feita em tempo real conforme você digita

### 2. **Filtros**
- **Por Tabela**: Filtre logs de uma tabela específica ou veja de todas
  - Vendas
  - Itens de Venda
  - Pagamentos de Venda
  - Devoluções
  - Trocas de Produtos
  - Descontos
  - Itens Devolvidos

- **Por Data**: 
  - Data Inicial: Selecione a data de início
  - Data Final: Selecione a data de término
  - Intervalo aberto: Se deixar apenas uma data, mostra desde aquela data

- **Limpar Filtros**: Botão para resetar todos os filtros

### 3. **Paginação**
- Exibe 10 registros por página por padrão
- Navegue entre páginas usando os controles de paginação
- Mostra total de registros encontrados

### 4. **Tabela de Logs**
Colunas:
- **TABELA**: Qual tabela foi deletada
- **ID DO REGISTRO**: Identificador único do registro deletado
- **DATA DA DELEÇÃO**: Quando foi deletado
- **DELETADO POR**: Qual usuário realizou a deleção
- **AÇÕES**: Botão para ver detalhes

### 5. **Detalhes do Log**
Clique no ícone de olho (👁) em qualquer registro para ver:
- ID completo do registro
- Data e hora exata da deleção
- Usuário que deletou
- **Dados completos** do registro antes da deleção em formato JSON

### 6. **Exportar para CSV**
- Clique em "Exportar CSV" para baixar os logs exibidos
- Útil para auditorias e análises em Excel/Sheets
- O arquivo é nomeado com a data atual

## Dados Capturados

Cada log registra:
```json
{
  "id": "UUID único do log",
  "tabela_nome": "Nome da tabela",
  "registro_id": "ID do registro deletado",
  "dados_apagados": {
    // Todos os campos do registro antes de ser deletado
  },
  "apagado_por": "ID do usuário que deletou",
  "criado_em": "Data e hora da deleção",
  "motivo": "Razão da deleção (se informada)"
}
```

## Exemplos de Uso

### Recuperar informações de uma venda deletada
1. Acesse "Logs de Deleção"
2. Selecione "Vendas" no filtro de tabela
3. Busque pelo número da venda
4. Clique em detalhes para ver todos os dados

### Auditar deletions em um período específico
1. Defina a "Data Inicial" e "Data Final"
2. Escolha a tabela se necessário
3. Exporte em CSV para análise

### Rastrear quem deletou algo
1. Use o campo de busca para encontrar o ID
2. Veja na coluna "DELETADO POR" qual usuário realizou a ação
3. Verifique a data e hora exata

## Índices e Performance

A tabela de logs possui índices para melhor performance:
- Índice em `tabela_nome` para filtros rápidos
- Índice em `criado_em` para filtros por data

## Armazenamento

Os logs ocupam espaço em disco. Recomenda-se implementar uma política de limpeza para dados muito antigos (ex: deletar registros com mais de 1 ano).

## Perguntas Frequentes

**P: Os logs são em tempo real?**
R: Sim, qualquer deleção é registrada imediatamente no banco de dados.

**P: Posso recuperar um registro deletado?**
R: Os logs mostram os dados para referência, mas o registro em si foi deletado. Você pode tentar restaurar através de backup se disponível.

**P: Quem pode ver os logs?**
R: Todos os usuários autenticados podem acessar (recomenda-se configurar permissões específicas conforme necessário).

**P: Posso filtrar por usuário?**
R: Sim, vendo os detalhes de cada log, você vê quem deletou. Pode-se expandir o filtro se necessário.
