-- ============================================
-- TESTAR ADICIONAR QUANTIDADE NO ESTOQUE
-- ============================================

-- 1. Ver estado atual de um produto
SELECT 
  'Estado atual ATACADO' as info,
  el.id_produto,
  el.id_loja,
  el.quantidade,
  p.quantidade_minima,
  el.atualizado_por,
  el.atualizado_em
FROM estoque_lojas el
JOIN produtos p ON p.id = el.id_produto
WHERE p.descricao ILIKE '%atacado%'
LIMIT 1;

-- 2. Tentar adicionar quantidade SEM preencher atualizado_por
DO $$
DECLARE
  v_produto_id UUID;
  v_loja_id INTEGER;
  v_qtd_antes INTEGER;
  v_qtd_depois INTEGER;
BEGIN
  -- Pegar produto ATACADO
  SELECT el.id_produto, el.id_loja, el.quantidade 
  INTO v_produto_id, v_loja_id, v_qtd_antes
  FROM estoque_lojas el
  JOIN produtos p ON p.id = el.id_produto
  WHERE p.descricao ILIKE '%atacado%'
  LIMIT 1;
  
  RAISE NOTICE '📊 ANTES: produto=%, loja=%, qtd=%', v_produto_id, v_loja_id, v_qtd_antes;
  
  -- Tentar adicionar 5 unidades (SEM atualizado_por para trigger notificar)
  UPDATE estoque_lojas
  SET quantidade = quantidade + 5,
      atualizado_em = NOW()
      -- atualizado_por deixamos NULL propositalmente
  WHERE id_produto = v_produto_id AND id_loja = v_loja_id;
  
  RAISE NOTICE '✅ UPDATE executado';
  
  -- Ver resultado
  SELECT quantidade INTO v_qtd_depois
  FROM estoque_lojas
  WHERE id_produto = v_produto_id AND id_loja = v_loja_id;
  
  RAISE NOTICE '📊 DEPOIS: qtd=%', v_qtd_depois;
  
  IF v_qtd_depois = v_qtd_antes + 5 THEN
    RAISE NOTICE '✅ Funcionou! Quantidade aumentou de % para %', v_qtd_antes, v_qtd_depois;
  ELSE
    RAISE NOTICE '❌ Não funcionou! Era %, continua %', v_qtd_antes, v_qtd_depois;
  END IF;
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE '❌ ERRO: %', SQLERRM;
END $$;

-- 3. Ver o resultado final
SELECT 
  'Estado depois do teste' as info,
  el.id_produto,
  el.id_loja,
  p.descricao as produto,
  el.quantidade,
  p.quantidade_minima,
  el.atualizado_por,
  TO_CHAR(el.atualizado_em, 'DD/MM/YYYY HH24:MI:SS') as ultima_atualizacao
FROM estoque_lojas el
JOIN produtos p ON p.id = el.id_produto
WHERE p.descricao ILIKE '%atacado%';

-- 4. Ver se alguma notificação foi criada
SELECT 
  'Notificações últimos 2 minutos' as info,
  tipo,
  titulo,
  mensagem,
  TO_CHAR(criado_em, 'DD/MM/YYYY HH24:MI:SS') as quando
FROM notificacoes
WHERE criado_em > NOW() - INTERVAL '2 minutes'
ORDER BY criado_em DESC;

-- 5. Ver todas as triggers ativas
SELECT 
  'Triggers ativas em estoque_lojas' as info,
  tgname as trigger_name,
  tgenabled as status
FROM pg_trigger
WHERE tgrelid = 'estoque_lojas'::regclass
  AND tgname NOT LIKE 'pg_%'
ORDER BY tgname;
