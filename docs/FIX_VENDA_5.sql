-- =====================================================
-- CORREÇÃO RÁPIDA: Atualizar valor_total da venda #5
-- =====================================================

-- 1. Ver o estado atual
SELECT 
  numero_venda,
  valor_total,
  valor_desconto,
  valor_pago,
  saldo_devedor
FROM vendas
WHERE numero_venda = 5;

-- 2. Atualizar diretamente a venda #5
-- Subtotal: R$ 154,00
-- Desconto: R$ 15,40
-- Total correto: R$ 138,60

UPDATE vendas
SET valor_total = 138.60
WHERE numero_venda = 5;

-- 3. Verificar resultado
SELECT 
  numero_venda,
  valor_total,
  valor_desconto,
  valor_pago,
  saldo_devedor
FROM vendas
WHERE numero_venda = 5;
