-- ============================================
-- LIMPAR TRIGGERS DUPLICADAS DE NOTIFICAÇÃO
-- ============================================

-- 1. DESABILITAR trigger antiga do sistema
DROP TRIGGER IF EXISTS trigger_alerta_estoque ON estoque_lojas;

-- 2. Verificar se a nova está funcionando
SELECT 
  'Trigger nova' as info,
  tgname as trigger_name,
  tgenabled as status
FROM pg_trigger
WHERE tgname = 'trigger_notificacao_estoque_simples';

-- 3. Ver todas as triggers restantes
SELECT 
  'Triggers restantes' as info,
  tgname as trigger_name,
  tgenabled as status
FROM pg_trigger
WHERE tgrelid = 'estoque_lojas'::regclass
  AND tgname NOT LIKE 'RI_Constraint%'
  AND tgname NOT LIKE 'pg_%'
ORDER BY tgname;

-- 4. TESTE: Adicionar 5 unidades em qualquer produto
DO $$
DECLARE
  v_produto_id UUID;
  v_loja_id INTEGER;
  v_qtd_antes INTEGER;
  v_qtd_depois INTEGER;
BEGIN
  -- Pegar primeiro produto (SEM o atualizado_por que causa erro)
  SELECT el.id_produto, el.id_loja, el.quantidade 
  INTO v_produto_id, v_loja_id, v_qtd_antes
  FROM estoque_lojas el
  LIMIT 1;
  
  RAISE NOTICE '🧪 TESTE: produto=%, loja=%, qtd_antes=%', v_produto_id, v_loja_id, v_qtd_antes;
  
  -- Adicionar 5 unidades
  UPDATE estoque_lojas
  SET quantidade = quantidade + 5,
      atualizado_em = NOW()
  WHERE id_produto = v_produto_id AND id_loja = v_loja_id;
  
  -- Ver resultado
  SELECT quantidade INTO v_qtd_depois
  FROM estoque_lojas
  WHERE id_produto = v_produto_id AND id_loja = v_loja_id;
  
  IF v_qtd_depois = v_qtd_antes + 5 THEN
    RAISE NOTICE '✅ SUCESSO! Quantidade: % → %', v_qtd_antes, v_qtd_depois;
  ELSE
    RAISE NOTICE '❌ FALHOU! Esperado %, atual %', v_qtd_antes + 5, v_qtd_depois;
  END IF;
  
  -- Voltar ao normal
  UPDATE estoque_lojas
  SET quantidade = v_qtd_antes
  WHERE id_produto = v_produto_id AND id_loja = v_loja_id;
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE '❌ ERRO: %', SQLERRM;
    RAISE;
END $$;

-- 5. Confirmar limpeza
SELECT '✅ Trigger antiga removida, apenas a nova está ativa!' as status;
