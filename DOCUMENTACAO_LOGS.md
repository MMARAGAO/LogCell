# Sistema de Logs de Deleção - Documentação

## Descrição
Sistema automático de auditoria que registra todas as exclusões (DELETE) nas tabelas relacionadas a vendas.

## Tabela de Logs
**Nome:** `public.audit_logs_deletions`

### Campos:
- `id` (uuid): Identificador único do registro de log
- `tabela_nome` (varchar): Nome da tabela de origem onde ocorreu a deleção
- `registro_id` (uuid): ID do registro que foi deletado
- `dados_apagados` (jsonb): Dados completos do registro antes da deleção
- `apagado_por` (uuid): ID do usuário que realizou a deleção
- `criado_em` (timestamp): Data e hora em que a deleção foi registrada
- `motivo` (text): Campo opcional para motivo da deleção

## Tabelas Monitoradas
Os triggers estão configurados para as seguintes tabelas:
1. **vendas** - Registros de vendas
2. **itens_venda** - Itens das vendas
3. **pagamentos_venda** - Pagamentos das vendas
4. **devolucoes_venda** - Devoluções de vendas
5. **trocas_produtos** - Trocas de produtos
6. **descontos_venda** - Descontos aplicados
7. **itens_devolucao** - Itens devolvidos

## Como Funciona
1. Quando um registro é deletado de qualquer uma das tabelas acima, o trigger é acionado automaticamente
2. A função `log_deletion()` extrai os dados do registro deletado usando `row_to_json(OLD)`
3. Todas as informações são armazenadas na tabela `audit_logs_deletions`
4. O usuário que realizou a deleção é registrado (se disponível via `app.user_id`)

## Consultando Logs

### Ver todos os logs de uma tabela específica:
```sql
SELECT * FROM public.audit_logs_deletions 
WHERE tabela_nome = 'vendas' 
ORDER BY criado_em DESC;
```

### Ver logs dos últimos 7 dias:
```sql
SELECT * FROM public.audit_logs_deletions 
WHERE criado_em >= NOW() - INTERVAL '7 days' 
ORDER BY criado_em DESC;
```

### Ver dados específicos que foram deletados:
```sql
SELECT tabela_nome, registro_id, (dados_apagados->>'valor_total') as valor,
       (dados_apagados->>'cliente_id') as cliente, criado_em
FROM public.audit_logs_deletions 
WHERE tabela_nome = 'vendas' 
ORDER BY criado_em DESC;
```

### Contar deleções por tabela:
```sql
SELECT tabela_nome, COUNT(*) as total_deletions
FROM public.audit_logs_deletions
GROUP BY tabela_nome
ORDER BY total_deletions DESC;
```

## Índices
Foram criados índices para melhorar performance:
- `idx_audit_logs_tabela` - Para filtrar por tabela_nome
- `idx_audit_logs_data` - Para filtrar por data de criação

## Função de Log
**Nome:** `public.log_deletion()`

A função trata especialmente IDs do tipo UUID e também registra `numero_os` se disponível.

## Notas Importantes
1. Os dados são registrados **ANTES** da deleção ser confirmada
2. Se nenhum usuário estiver logado, o campo `apagado_por` será NULL
3. Para manter a auditoria consistente, recomenda-se não desabilitar estes triggers
4. Os logs ocupam espaço em disco, considere implementar uma política de limpeza para dados antigos se necessário

## Manutenção Futura
Para remover logs antigos (ex: mais de 1 ano):
```sql
DELETE FROM public.audit_logs_deletions 
WHERE criado_em < NOW() - INTERVAL '1 year';
```

## Triggers Criados
- `tr_log_vendas_delete` - Monitora tabela vendas
- `tr_log_itens_venda_delete` - Monitora tabela itens_venda
- `tr_log_pagamentos_venda_delete` - Monitora tabela pagamentos_venda
- `tr_log_devolucoes_venda_delete` - Monitora tabela devolucoes_venda
- `tr_log_trocas_produtos_delete` - Monitora tabela trocas_produtos
- `tr_log_descontos_venda_delete` - Monitora tabela descontos_venda
- `tr_log_itens_devolucao_delete` - Monitora tabela itens_devolucao
