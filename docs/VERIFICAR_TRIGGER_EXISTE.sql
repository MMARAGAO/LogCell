-- =====================================================
-- VERIFICAR SE O TRIGGER EXISTE E ESTÁ ATIVO
-- =====================================================

-- 1. Verificar triggers na tabela ordem_servico_pecas
SELECT 
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement,
  action_orientation
FROM information_schema.triggers
WHERE event_object_schema = 'public'
  AND event_object_table = 'ordem_servico_pecas'
ORDER BY trigger_name;

-- 2. Verificar se a função existe
SELECT 
  p.proname as nome_funcao,
  pg_get_function_identity_arguments(p.oid) as argumentos
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND p.proname = 'processar_baixa_estoque_os';

-- 3. Tentar inserir um log manual para testar se a tabela funciona
INSERT INTO debug_logs (contexto, mensagem, dados)
VALUES ('TESTE_MANUAL', 'Teste se a tabela debug_logs funciona', '{"teste": true}');

-- 4. Verificar se o log foi inserido
SELECT * FROM debug_logs ORDER BY criado_em DESC LIMIT 5;
