-- =====================================================
-- VERIFICAR STATUS DO TRIGGER DE BAIXA DE ESTOQUE
-- =====================================================

-- 1. Ver todos os triggers na tabela ordem_servico_pecas
SELECT 
  t.tgname AS trigger_name,
  p.proname AS function_name,
  CASE 
    WHEN t.tgenabled = 'O' THEN 'ENABLED'
    WHEN t.tgenabled = 'D' THEN 'DISABLED'
    ELSE 'UNKNOWN'
  END AS status,
  pg_get_triggerdef(t.oid) AS trigger_definition
FROM pg_trigger t
JOIN pg_proc p ON t.tgfoid = p.oid
JOIN pg_class c ON t.tgrelid = c.oid
WHERE c.relname = 'ordem_servico_pecas'
  AND t.tgname NOT LIKE 'RI_%'
ORDER BY t.tgname;

-- 2. Ver o código da função processar_baixa_estoque_os
SELECT 
  p.proname AS function_name,
  pg_get_functiondef(p.oid) AS function_code
FROM pg_proc p
WHERE p.proname IN ('processar_baixa_estoque_os', 'processar_reserva_estoque_os');

-- 3. Verificar se as colunas necessárias existem
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'ordem_servico_pecas'
  AND column_name IN ('estoque_baixado', 'data_baixa_estoque', 'estoque_reservado', 'data_reserva_estoque')
ORDER BY column_name;

-- 4. Testar inserção simulada (sem commit)
BEGIN;

-- Simular uma inserção para ver o que acontece
DO $$
DECLARE
  v_id_os UUID;
  v_id_produto UUID;
  v_id_loja INTEGER;
  v_estoque_antes INTEGER;
  v_estoque_depois INTEGER;
BEGIN
  -- Pegar uma OS existente
  SELECT id INTO v_id_os FROM ordem_servico LIMIT 1;
  
  -- Pegar um produto com estoque
  SELECT 
    el.id_produto,
    el.id_loja,
    el.quantidade
  INTO v_id_produto, v_id_loja, v_estoque_antes
  FROM estoque_lojas el
  WHERE el.quantidade > 0
  LIMIT 1;

  RAISE NOTICE 'OS: %, Produto: %, Loja: %, Estoque antes: %', 
    v_id_os, v_id_produto, v_id_loja, v_estoque_antes;

  IF v_id_os IS NOT NULL AND v_id_produto IS NOT NULL THEN
    -- Não vamos realmente inserir, apenas mostrar os dados
    RAISE NOTICE 'Dados prontos para teste de inserção';
  ELSE
    RAISE NOTICE 'Não há dados suficientes para teste';
  END IF;
END $$;

ROLLBACK;
