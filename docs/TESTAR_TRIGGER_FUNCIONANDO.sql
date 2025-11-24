-- ============================================
-- DEBUG: Ver se a trigger está sendo executada
-- ============================================

-- 1. Ver última atualização de estoque
SELECT 
  'Última atualização' as info,
  p.descricao as produto,
  l.nome as loja,
  el.quantidade,
  el.atualizado_por,
  TO_CHAR(el.atualizado_em, 'DD/MM/YYYY HH24:MI:SS') as quando
FROM estoque_lojas el
JOIN produtos p ON p.id = el.id_produto
JOIN lojas l ON l.id = el.id_loja
ORDER BY el.atualizado_em DESC
LIMIT 5;

-- 2. Ver último estado na tabela de controle
SELECT 
  'Estado no controle' as info,
  p.descricao as produto,
  l.nome as loja,
  aec.estado,
  aec.quantidade_atual,
  aec.quantidade_minima,
  TO_CHAR(aec.atualizado_em, 'DD/MM/YYYY HH24:MI:SS') as quando
FROM alertas_estoque_controle aec
JOIN produtos p ON p.id = aec.produto_id
JOIN lojas l ON l.id = aec.loja_id
ORDER BY aec.atualizado_em DESC
LIMIT 5;

-- 3. Ver últimas notificações
SELECT 
  'Últimas notificações' as info,
  tipo,
  titulo,
  SUBSTRING(mensagem, 1, 60) as mensagem,
  TO_CHAR(criado_em, 'DD/MM/YYYY HH24:MI:SS') as quando
FROM notificacoes
ORDER BY criado_em DESC
LIMIT 5;

-- 4. TESTE DIRETO: Forçar uma mudança de estado
-- Vamos pegar um produto e forçar ele ir de normal → baixo
DO $$
DECLARE
  v_produto_id UUID;
  v_loja_id INTEGER;
  v_qtd_minima INTEGER;
BEGIN
  -- Pegar um produto que tenha quantidade > mínimo
  SELECT el.id_produto, el.id_loja, p.quantidade_minima
  INTO v_produto_id, v_loja_id, v_qtd_minima
  FROM estoque_lojas el
  JOIN produtos p ON p.id = el.id_produto
  WHERE el.quantidade > p.quantidade_minima
  LIMIT 1;
  
  RAISE NOTICE '🧪 TESTE: Vou reduzir produto=% loja=% para quantidade=%', 
    v_produto_id, v_loja_id, v_qtd_minima;
  
  -- Reduzir para o mínimo (deve notificar "Estoque Baixo")
  UPDATE estoque_lojas
  SET quantidade = v_qtd_minima,
      atualizado_em = NOW()
  WHERE id_produto = v_produto_id 
    AND id_loja = v_loja_id;
    
  RAISE NOTICE '✅ UPDATE executado! Aguarde 1 segundo...';
  PERFORM pg_sleep(1);
  
  -- Verificar se notificou
  IF EXISTS (
    SELECT 1 FROM notificacoes 
    WHERE produto_id = v_produto_id 
      AND loja_id = v_loja_id
      AND criado_em > NOW() - INTERVAL '5 seconds'
  ) THEN
    RAISE NOTICE '✅ SUCESSO! Notificação foi criada!';
  ELSE
    RAISE NOTICE '❌ FALHOU! Nenhuma notificação criada.';
  END IF;
  
END $$;

-- 5. Ver se a notificação do teste foi criada
SELECT 
  'Notificação do teste?' as info,
  tipo,
  titulo,
  mensagem,
  TO_CHAR(criado_em, 'DD/MM/YYYY HH24:MI:SS') as quando
FROM notificacoes
WHERE criado_em > NOW() - INTERVAL '30 seconds'
ORDER BY criado_em DESC;
