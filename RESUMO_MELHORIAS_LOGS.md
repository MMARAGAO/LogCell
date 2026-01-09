# Resumo das Alterações - Sistema de Logs de Deleção

## ✅ Problemas Resolvidos

### 1. **Número da Venda não estava sendo armazenado em pagamentos_venda**
   - **Problema**: Quando uma venda era deletada e seus pagamentos relacionados eram deletados em cascata, o `numero_venda` não aparecia no log porque a tabela `pagamentos_venda` não possui esse campo diretamente.
   - **Solução**: A função `log_deletion()` agora faz um JOIN com a tabela `vendas` usando o `venda_id` para extrair o `numero_venda` da venda relacionada.

### 2. **Usuário deletando aparecia como "Desconhecido"**
   - **Problema**: O campo `usuario_nome` estava NULL porque não estava conseguindo capturar o usuário que realizou a deleção.
   - **Solução**: A função agora tenta capturar o usuário de múltiplas fontes, na ordem:
     1. Campo `criado_por` do registro deletado (quando disponível)
     2. Variável de contexto `app.user_id` (setada pela RPC)
     3. `auth.uid()` do Supabase (usuário autenticado)
   
   Depois busca o nome do usuário na tabela `usuarios`.

### 3. **Informações do cliente não estavam sendo armazenadas**
   - **Problema**: Os logs não tinham informações sobre qual cliente era da venda.
   - **Solução**: Adicionadas colunas `cliente_id` e `cliente_nome` à tabela `audit_logs_deletions`. A função agora:
     - Extrai `cliente_id` diretamente do registro deletado (se existir)
     - Se não existir, busca na tabela `vendas` usando o `venda_id`
     - Depois busca o nome do cliente na tabela `clientes`

## 📊 Alterações no Banco de Dados

### Tabela `audit_logs_deletions`
Adicionadas as seguintes colunas:
- `numero_venda` (integer) - Número da venda para fácil identificação
- `valor_total` (numeric) - Valor total da venda
- `cliente_id` (uuid) - ID do cliente
- `cliente_nome` (varchar) - Nome do cliente
- `usuario_nome` (varchar) - Nome do usuário que realizou a deleção

### Índices Criados
- `idx_audit_logs_numero_venda` - Para buscas rápidas por número de venda
- `idx_audit_logs_cliente` - Para buscas rápidas por cliente
- `idx_audit_logs_usuario` - Para buscas rápidas por usuário

## 🔧 Função Melhorada: `log_deletion()`

A função agora:

1. **Extrai informações da venda**:
   - `numero_venda` do próprio registro ou da tabela `vendas`
   - `cliente_id` do próprio registro ou da tabela `vendas`
   - `valor_total` do próprio registro

2. **Busca o nome do cliente**:
   - Usa `cliente_id` para buscar na tabela `clientes`

3. **Captura o usuário** (em ordem de prioridade):
   - Campo `criado_por` do registro
   - Variável `app.user_id` (contexto da RPC)
   - `auth.uid()` do Supabase

4. **Busca o nome do usuário**:
   - Tenta na tabela `usuarios`
   - Se não encontrar, tenta em `auth.users`

## 📝 Exemplo de Log Completo

Agora ao deletar um pagamento, o log fica assim:

```
Data da Deleção:  08/01/2026, 13:13:38
Tabela:           pagamentos_venda
Venda #:          25
Cliente:          SALVA VIDROS
Deletado Por:     Matheus Mendes Neves
Valor:            R$ 77,77
```

Comparado com antes, que era:

```
Data da Deleção:  07/01/2026, 15:07:45
Tabela:           pagamentos_venda
Venda #:          [VAZIO]
Cliente:          [VAZIO]
Deletado Por:     Desconhecido
Valor:            R$ 175,00
```

## 🚀 Scripts Utilizados

1. **melhorar_logs_deletions.sql** - Primeira versão melhorando número_venda
2. **melhorar_contexto_usuario.sql** - Melhorias na função deletar_venda
3. **solucao_completa_logs.sql** - Solução completa com captura de usuário
4. **solucao_final_logs.sql** - Versão final com ordem correta de busca
5. **adicionar_cliente_logs.sql** - Adição de informações do cliente

## ✨ Próximos Passos (Opcional)

- Você pode limpar logs antigos que têm dados NULL usando:
  ```sql
  UPDATE audit_logs_deletions 
  SET cliente_nome = (
    SELECT nome FROM clientes 
    WHERE id = (dados_apagados->>'cliente_id')::uuid
  )
  WHERE cliente_nome IS NULL 
    AND dados_apagados->>'cliente_id' IS NOT NULL;
  ```

- Criar uma view para visualizar logs com melhor formatação:
  ```sql
  CREATE VIEW audit_logs_formatado AS
  SELECT 
    TO_CHAR(criado_em, 'DD/MM/YYYY, HH24:MI:SS') as data_delecao,
    tabela_nome,
    numero_venda,
    cliente_nome,
    usuario_nome,
    CASE WHEN valor_total IS NOT NULL 
      THEN 'R$ ' || TO_CHAR(valor_total, '999,999.99')
      ELSE '-'
    END as valor
  FROM audit_logs_deletions;
  ```
