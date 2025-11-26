-- =====================================================
-- CORRIGIR VALOR_TOTAL DAS VENDAS COM DESCONTO
-- =====================================================
-- Algumas vendas têm valor_desconto registrado mas o valor_total
-- não foi atualizado corretamente (ainda está com o valor antes do desconto)

-- Verificar vendas com problema
SELECT 
  id,
  numero_venda,
  valor_total,
  valor_desconto,
  (valor_total - valor_desconto) as valor_correto,
  CASE 
    WHEN valor_total = valor_desconto THEN '⚠️ VALOR TOTAL IGUAL AO DESCONTO'
    WHEN valor_desconto > 0 AND valor_total > valor_desconto THEN '❌ VALOR TOTAL NÃO DESCONTADO'
    ELSE '✅ OK'
  END as status
FROM vendas
WHERE valor_desconto > 0
ORDER BY criado_em DESC;

-- Corrigir vendas onde valor_total não considera o desconto
-- ATENÇÃO: Este script assume que valor_total está ANTES do desconto
-- Se o valor_total já estiver correto, NÃO execute este UPDATE

DO $$
DECLARE
  r RECORD;
  v_subtotal DECIMAL;
  v_valor_correto DECIMAL;
BEGIN
  RAISE NOTICE '🔧 Verificando vendas com desconto...';
  RAISE NOTICE '';
  
  FOR r IN 
    SELECT 
      id,
      numero_venda,
      valor_total,
      valor_desconto
    FROM vendas
    WHERE valor_desconto > 0
      AND status = 'concluida'
  LOOP
    -- Calcular subtotal dos itens
    SELECT SUM(subtotal)
    INTO v_subtotal
    FROM itens_venda
    WHERE venda_id = r.id;
    
    -- Valor correto = subtotal - desconto
    v_valor_correto := v_subtotal - r.valor_desconto;
    
    RAISE NOTICE '📦 Venda #%', r.numero_venda;
    RAISE NOTICE '   Subtotal itens: R$ %', v_subtotal;
    RAISE NOTICE '   Desconto: R$ %', r.valor_desconto;
    RAISE NOTICE '   Valor Total Atual: R$ %', r.valor_total;
    RAISE NOTICE '   Valor Correto: R$ %', v_valor_correto;
    
    -- Só atualizar se o valor atual estiver diferente do correto
    IF r.valor_total != v_valor_correto THEN
      UPDATE vendas
      SET valor_total = v_valor_correto
      WHERE id = r.id;
      
      RAISE NOTICE '   ✅ CORRIGIDO de R$ % para R$ %', r.valor_total, v_valor_correto;
    ELSE
      RAISE NOTICE '   ✅ Já está correto';
    END IF;
    
    RAISE NOTICE '';
  END LOOP;
  
  RAISE NOTICE '✅ Verificação concluída!';
END $$;

-- Verificar resultado
SELECT 
  id,
  numero_venda,
  valor_total,
  valor_desconto,
  valor_pago,
  saldo_devedor
FROM vendas
WHERE valor_desconto > 0
ORDER BY criado_em DESC;
