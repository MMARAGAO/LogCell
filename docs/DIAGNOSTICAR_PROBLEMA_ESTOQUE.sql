-- ============================================
-- DIAGNOSTICAR PROBLEMA AO ADICIONAR ESTOQUE
-- ============================================

-- 1. Ver todas as triggers ativas em estoque_lojas
SELECT 
  'Triggers em estoque_lojas' as info,
  tgname as trigger_name,
  tgenabled as enabled,
  CASE tgenabled
    WHEN 'O' THEN 'Enabled'
    WHEN 'D' THEN 'Disabled'
    ELSE 'Other'
  END as status_desc
FROM pg_trigger
WHERE tgrelid = 'estoque_lojas'::regclass
ORDER BY tgname;

-- 2. Testar INSERT simples
DO $$
DECLARE
  v_produto_id INTEGER;
  v_loja_id INTEGER;
  v_resultado INTEGER;
BEGIN
  -- Pegar IDs
  SELECT id INTO v_produto_id FROM produtos LIMIT 1;
  SELECT id INTO v_loja_id FROM lojas LIMIT 1;
  
  RAISE NOTICE '🔍 Testando INSERT: produto_id=%, loja_id=%', v_produto_id, v_loja_id;
  
  -- Tentar inserir/atualizar
  INSERT INTO estoque_lojas (
    id_produto,
    id_loja,
    quantidade,
    quantidade_minima
  ) VALUES (
    v_produto_id,
    v_loja_id,
    999,
    5
  )
  ON CONFLICT (id_produto, id_loja) 
  DO UPDATE SET
    quantidade = EXCLUDED.quantidade,
    atualizado_em = NOW();
  
  -- Verificar se inseriu
  SELECT quantidade INTO v_resultado
  FROM estoque_lojas
  WHERE id_produto = v_produto_id AND id_loja = v_loja_id;
  
  RAISE NOTICE '✅ Resultado: quantidade=%', v_resultado;
  
  -- Voltar ao normal
  UPDATE estoque_lojas 
  SET quantidade = 0 
  WHERE id_produto = v_produto_id AND id_loja = v_loja_id;
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE '❌ ERRO: %', SQLERRM;
    RAISE;
END $$;

-- 3. Ver logs de erro recentes do PostgreSQL
-- (Supabase pode não mostrar isso, mas tentamos)
SELECT * FROM pg_stat_activity 
WHERE state = 'idle in transaction (aborted)' 
   OR wait_event_type = 'Lock';

-- 4. Verificar se a função notificar_estoque_simples tem algum erro
SELECT 
  'Função notificar_estoque_simples' as info,
  proname as function_name,
  prokind as kind,
  provolatile as volatility
FROM pg_proc
WHERE proname = 'notificar_estoque_simples';

-- 5. Teste manual UPDATE (simular o que acontece ao adicionar estoque)
DO $$
DECLARE
  v_produto_id INTEGER;
  v_loja_id INTEGER;
  v_qtd_antes INTEGER;
  v_qtd_depois INTEGER;
BEGIN
  -- Pegar produto ATACADO
  SELECT p.id, l.id INTO v_produto_id, v_loja_id
  FROM produtos p, lojas l
  WHERE p.nome ILIKE '%atacado%' AND l.nome ILIKE '%matriz%'
  LIMIT 1;
  
  -- Ver quantidade antes
  SELECT quantidade INTO v_qtd_antes
  FROM estoque_lojas
  WHERE id_produto = v_produto_id AND id_loja = v_loja_id;
  
  RAISE NOTICE '📊 Antes: produto=%, loja=%, quantidade=%', v_produto_id, v_loja_id, v_qtd_antes;
  
  -- Tentar adicionar 1
  BEGIN
    UPDATE estoque_lojas
    SET quantidade = quantidade + 1,
        atualizado_em = NOW(),
        atualizado_por = (SELECT id FROM usuarios WHERE tipo_usuario = 'admin' LIMIT 1)
    WHERE id_produto = v_produto_id AND id_loja = v_loja_id;
    
    RAISE NOTICE '✅ UPDATE executado';
  EXCEPTION
    WHEN OTHERS THEN
      RAISE NOTICE '❌ ERRO no UPDATE: %', SQLERRM;
      RAISE;
  END;
  
  -- Ver quantidade depois
  SELECT quantidade INTO v_qtd_depois
  FROM estoque_lojas
  WHERE id_produto = v_produto_id AND id_loja = v_loja_id;
  
  RAISE NOTICE '📊 Depois: quantidade=%', v_qtd_depois;
  
  IF v_qtd_depois = v_qtd_antes + 1 THEN
    RAISE NOTICE '✅ UPDATE funcionou corretamente!';
  ELSE
    RAISE NOTICE '❌ UPDATE não funcionou! Antes=%, Depois=%', v_qtd_antes, v_qtd_depois;
  END IF;
  
END $$;
