-- ========================================
-- DEBUG: Status "entregue" não está atualizando
-- ========================================

-- 1. Ver políticas RLS da tabela ordem_servico
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual as "USING (condição)",
  with_check as "WITH CHECK (validação)"
FROM pg_policies
WHERE tablename = 'ordem_servico'
ORDER BY cmd, policyname;

-- 2. Ver triggers na tabela ordem_servico
SELECT 
  trigger_name,
  event_manipulation as evento,
  event_object_table as tabela,
  action_statement as acao,
  action_timing as timing
FROM information_schema.triggers
WHERE event_object_table = 'ordem_servico'
ORDER BY trigger_name;

-- 3. Primeiro, veja as OSs disponíveis e seus IDs
SELECT 
  id,
  numero_os,
  status,
  cliente_nome,
  atualizado_em
FROM ordem_servico
WHERE status IN ('concluido', 'em_andamento')
ORDER BY numero_os DESC
LIMIT 10;

-- 4. Tentar atualizar uma OS manualmente para "entregue"
-- COPIE UM ID (UUID) DA QUERY ACIMA E COLE ABAIXO
DO $$
DECLARE
  v_os_id UUID := 'COLE-O-UUID-AQUI'; -- SUBSTITUA PELO ID DA OS (formato: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx')
  v_user_id UUID := '43f30675-efdb-4c66-8e9b-0ff04a738098'; -- SUBSTITUA PELO SEU USER ID
BEGIN
  -- Verificar se OS existe
  IF NOT EXISTS (SELECT 1 FROM ordem_servico WHERE id = v_os_id) THEN
    RAISE NOTICE 'ERRO: OS não encontrada com ID %', v_os_id;
    RETURN;
  END IF;
  
  -- Tentar atualizar
  UPDATE ordem_servico
  SET 
    status = 'entregue',
    atualizado_por = v_user_id,
    atualizado_em = NOW(),
    data_entrega_cliente = NOW()
  WHERE id = v_os_id;
  
  -- Verificar se atualizou
  IF FOUND THEN
    RAISE NOTICE '✅ OS atualizada com sucesso para ENTREGUE!';
  ELSE
    RAISE NOTICE '❌ OS não foi atualizada (pode ser RLS bloqueando)';
  END IF;
  
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE '🔴 ERRO: %', SQLERRM;
END $$;

-- 5. Ver se a atualização funcionou
-- SUBSTITUA O UUID ABAIXO PELO MESMO DA QUERY ANTERIOR
SELECT 
  id,
  numero_os,
  status,
  data_entrega_cliente,
  atualizado_em,
  atualizado_por
FROM ordem_servico
WHERE id = 'COLE-O-UUID-AQUI' -- SUBSTITUA
ORDER BY atualizado_em DESC;

-- 5. Ver últimas atualizações de status
SELECT 
  id,
  numero_os,
  status,
  atualizado_em,
  TO_CHAR(atualizado_em, 'DD/MM/YYYY HH24:MI:SS') as quando_formatado
FROM ordem_servico
ORDER BY atualizado_em DESC
LIMIT 10;
