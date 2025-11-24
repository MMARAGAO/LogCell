-- ============================================
-- TESTAR NOTIFICAÇÃO DE ESTOQUE REPOSTO
-- Vamos adicionar estoque em um produto que está ZERADO
-- ============================================

-- 1. Ver produtos zerados
SELECT 
  'Produtos ZERADOS (bons para teste)' as info,
  p.descricao as produto,
  l.nome as loja,
  el.quantidade as qtd_atual,
  p.quantidade_minima,
  aec.estado
FROM estoque_lojas el
JOIN produtos p ON p.id = el.id_produto
JOIN lojas l ON l.id = el.id_loja
JOIN alertas_estoque_controle aec ON aec.produto_id = el.id_produto AND aec.loja_id = el.id_loja
WHERE aec.estado = 'zerado'
ORDER BY p.descricao, l.nome;

-- 2. TESTE: Adicionar 10 unidades no ESTOQUE (que está zerado)
DO $$
DECLARE
  v_produto_id UUID := 'e138eed1-e316-4d2a-990e-7f1ebdee06c7';
  v_loja_id INTEGER := 18; -- ESTOQUE
  v_estado_antes TEXT;
BEGIN
  -- Ver estado antes
  SELECT estado INTO v_estado_antes
  FROM alertas_estoque_controle
  WHERE produto_id = v_produto_id AND loja_id = v_loja_id;
  
  RAISE NOTICE '📊 ANTES: estado=%, quantidade=0', v_estado_antes;
  
  -- Adicionar 10 unidades (ACIMA DO MÍNIMO de 5)
  UPDATE estoque_lojas
  SET quantidade = 10,
      atualizado_em = NOW(),
      atualizado_por = NULL -- NULL para trigger notificar
  WHERE id_produto = v_produto_id AND id_loja = v_loja_id;
  
  RAISE NOTICE '✅ Adicionado 10 unidades! Deve notificar "Estoque Reposto"';
END $$;

-- 3. Verificar se notificou
SELECT 
  'Notificação criada?' as info,
  tipo,
  titulo,
  mensagem,
  TO_CHAR(criado_em, 'DD/MM/YYYY HH24:MI:SS') as quando
FROM notificacoes
WHERE tipo = 'estoque_reposto'
  AND criado_em > NOW() - INTERVAL '1 minute'
ORDER BY criado_em DESC;

-- 4. Ver novo estado
SELECT 
  'Estado depois do teste' as info,
  p.descricao as produto,
  l.nome as loja,
  el.quantidade as qtd_nova,
  aec.estado as estado_novo,
  TO_CHAR(aec.atualizado_em, 'DD/MM/YYYY HH24:MI:SS') as atualizado
FROM estoque_lojas el
JOIN produtos p ON p.id = el.id_produto
JOIN lojas l ON l.id = el.id_loja
JOIN alertas_estoque_controle aec ON aec.produto_id = el.id_produto AND aec.loja_id = el.id_loja
WHERE el.id_produto = 'e138eed1-e316-4d2a-990e-7f1ebdee06c7'
  AND el.id_loja = 18;
