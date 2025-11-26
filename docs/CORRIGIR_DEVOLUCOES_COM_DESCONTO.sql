-- =====================================================
-- CORRIGIR DEVOLUÇÕES QUE NÃO CONSIDERARAM DESCONTO
-- =====================================================
-- Este script recalcula o valor das devoluções que foram processadas
-- sem considerar o desconto proporcional da venda original.

-- Verificar antes de corrigir
SELECT 
  dv.id as devolucao_id,
  v.numero_venda,
  dv.valor_total as valor_devolucao_atual,
  v.valor_total as valor_venda,
  v.valor_desconto,
  dv.tipo,
  cc.valor_total as credito_atual
FROM devolucoes_venda dv
JOIN vendas v ON v.id = dv.venda_id
LEFT JOIN creditos_cliente cc ON cc.devolucao_id = dv.id
WHERE v.valor_desconto > 0
ORDER BY dv.criado_em DESC;

-- Executar correção
DO $$
DECLARE
  r RECORD;
  v_subtotal_itens DECIMAL;
  v_percentual_desconto DECIMAL;
  v_desconto_proporcional DECIMAL;
  v_valor_correto DECIMAL;
BEGIN
  RAISE NOTICE '🔧 Iniciando correção de devoluções...';
  RAISE NOTICE '';
  
  -- Percorrer todas as devoluções onde a venda teve desconto
  FOR r IN 
    SELECT 
      dv.id as devolucao_id,
      dv.valor_total as valor_atual,
      v.id as venda_id,
      v.numero_venda,
      v.valor_desconto,
      v.valor_total as valor_total_venda,
      dv.tipo as tipo_devolucao
    FROM devolucoes_venda dv
    JOIN vendas v ON v.id = dv.venda_id
    WHERE v.valor_desconto > 0
      AND v.valor_total > 0
  LOOP
    -- Calcular subtotal dos itens devolvidos
    SELECT SUM(id.quantidade * iv.preco_unitario)
    INTO v_subtotal_itens
    FROM itens_devolucao id
    JOIN itens_venda iv ON iv.id = id.item_venda_id
    WHERE id.devolucao_id = r.devolucao_id;
    
    -- Calcular percentual de desconto da venda original
    v_percentual_desconto := r.valor_desconto / r.valor_total_venda;
    
    -- Calcular desconto proporcional
    v_desconto_proporcional := v_subtotal_itens * v_percentual_desconto;
    
    -- Calcular valor correto
    v_valor_correto := v_subtotal_itens - v_desconto_proporcional;
    
    RAISE NOTICE '📦 Venda #% | Devolução ID: %', r.numero_venda, r.devolucao_id;
    RAISE NOTICE '   Subtotal itens: R$ %', v_subtotal_itens;
    RAISE NOTICE '   Desconto (%%): %', (v_percentual_desconto * 100);
    RAISE NOTICE '   Valor Atual: R$ %', r.valor_atual;
    RAISE NOTICE '   Valor Correto: R$ %', v_valor_correto;
    RAISE NOTICE '   Diferença: R$ %', (r.valor_atual - v_valor_correto);
    
    -- Atualizar valor da devolução
    UPDATE devolucoes_venda
    SET valor_total = v_valor_correto
    WHERE id = r.devolucao_id;
    
    -- Se gerou crédito, atualizar o crédito também
    IF r.tipo_devolucao = 'com_credito' THEN
      UPDATE creditos_cliente
      SET 
        valor_total = v_valor_correto,
        saldo = v_valor_correto - COALESCE(valor_utilizado, 0)
      WHERE devolucao_id = r.devolucao_id;
      
      RAISE NOTICE '   ✅ Crédito atualizado';
    END IF;
    
    RAISE NOTICE '';
  END LOOP;
  
  RAISE NOTICE '✅ Correção concluída!';
END $$;

-- Verificar os resultados
SELECT 
  dv.id,
  v.numero_venda,
  v.valor_total as total_venda,
  v.valor_desconto as desconto_venda,
  dv.valor_total as valor_devolucao,
  dv.tipo,
  cc.valor_total as valor_credito,
  cc.saldo as saldo_credito
FROM devolucoes_venda dv
JOIN vendas v ON v.id = dv.venda_id
LEFT JOIN creditos_cliente cc ON cc.devolucao_id = dv.id
WHERE v.valor_desconto > 0
ORDER BY dv.criado_em DESC;
