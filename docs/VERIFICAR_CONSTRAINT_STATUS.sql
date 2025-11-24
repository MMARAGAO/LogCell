-- ========================================
-- VERIFICAR CONSTRAINT DO STATUS
-- ========================================

-- 1. Ver constraints da coluna status
SELECT 
  conname as nome_constraint,
  pg_get_constraintdef(oid) as definicao
FROM pg_constraint
WHERE conrelid = 'ordem_servico'::regclass
AND contype = 'c' -- check constraint
AND pg_get_constraintdef(oid) ILIKE '%status%';

-- 2. Ver todos os status permitidos tentando inserir inválido
-- (Vai dar erro e mostrar os valores permitidos)
DO $$
BEGIN
  -- Tentar inserir com status inválido para ver a mensagem de erro
  INSERT INTO ordem_servico (
    cliente_nome,
    equipamento_tipo,
    defeito_reclamado,
    id_loja,
    status
  ) VALUES (
    'TESTE',
    'TESTE',
    'TESTE',
    1,
    'VALOR_INVALIDO'
  );
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'ERRO (esperado): %', SQLERRM;
END $$;

-- 3. Ver definição completa da coluna status
SELECT 
  column_name,
  data_type,
  column_default,
  is_nullable,
  character_maximum_length
FROM information_schema.columns
WHERE table_name = 'ordem_servico'
AND column_name = 'status';

-- 4. TESTE: Tentar forçar status = 'entregue' na OS #13
BEGIN;

UPDATE ordem_servico
SET status = 'entregue'
WHERE id = 'b353ba83-6909-41d2-b224-ba2771b97712'::uuid;

-- Ver se deu erro
SELECT 
  id,
  numero_os,
  status,
  CASE 
    WHEN status = 'entregue' THEN '✅ SUCESSO!'
    ELSE '❌ NÃO MUDOU (ainda está: ' || status || ')'
  END as resultado
FROM ordem_servico
WHERE id = 'b353ba83-6909-41d2-b224-ba2771b97712'::uuid;

ROLLBACK; -- Não commitar, só testar
