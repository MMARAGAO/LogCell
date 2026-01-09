-- =========================================================================
-- TESTE: Verificar se app.user_id está sendo preservado
-- =========================================================================

-- 1. Primeiro, vamos ver as configurações atuais de app.user_id
SELECT current_setting('app.user_id', true) as user_id_context;

-- 2. Vamos definir um user_id e testar
SELECT set_config('app.user_id', 'a1234567-890b-cdef-1234-567890abcdef', false) as config_set;

-- 3. Verificar se foi setado
SELECT current_setting('app.user_id', true) as user_id_after_set;

-- 4. Agora vamos olhar para os logs mais recentes para ver se apagado_por está NULL
SELECT 
  id,
  tabela_nome,
  numero_venda,
  apagado_por,
  usuario_nome,
  criado_em,
  (dados_apagados->>'venda_id') as venda_id_json
FROM audit_logs_deletions
WHERE tabela_nome = 'pagamentos_venda'
ORDER BY criado_em DESC
LIMIT 20;

-- 5. Se apagado_por estiver NULL, o problema é que app.user_id não está sendo passado
-- Vamos verificar se há venda_id nos logs de pagamentos_venda
SELECT 
  id,
  numero_venda,
  dados_apagados
FROM audit_logs_deletions
WHERE tabela_nome = 'pagamentos_venda'
ORDER BY criado_em DESC
LIMIT 3;

-- 6. Vamos procurar por uma venda e ver seus pagamentos antigos que foram deletados
SELECT 
  numero_venda,
  COUNT(*) as total_logs
FROM audit_logs_deletions
WHERE tabela_nome = 'pagamentos_venda'
  AND numero_venda IS NOT NULL
GROUP BY numero_venda
ORDER BY numero_venda DESC
LIMIT 10;
