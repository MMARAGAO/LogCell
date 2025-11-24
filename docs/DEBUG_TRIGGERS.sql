-- =====================================================
-- DEBUG: VERIFICAR E LIMPAR TRIGGERS
-- =====================================================

-- 1. Ver TODOS os triggers na tabela ordem_servico
SELECT 
  tgname as trigger_name,
  tgenabled as enabled,
  pg_get_triggerdef(oid) as definition
FROM pg_trigger 
WHERE tgrelid = 'ordem_servico'::regclass
ORDER BY tgname;

-- 2. Ver a função específica
SELECT pg_get_functiondef('devolver_pecas_ao_cancelar_os'::regproc);

-- 3. Dropar TODOS os triggers relacionados a devolução/cancelamento
DROP TRIGGER IF EXISTS trigger_devolver_pecas_ao_cancelar ON ordem_servico;
DROP TRIGGER IF EXISTS devolver_pecas_estoque_os ON ordem_servico;
DROP TRIGGER IF EXISTS trigger_ordem_servico_status ON ordem_servico;

-- 4. Ver estrutura da tabela historico_estoque
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'historico_estoque'
ORDER BY ordinal_position;
