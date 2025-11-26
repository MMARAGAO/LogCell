-- =====================================================
-- DEBUG: Verificar Devoluções e Créditos
-- =====================================================

-- 1. Ver todas as devoluções recentes
SELECT 
  dv.id as devolucao_id,
  dv.criado_em,
  dv.valor_total as valor_devolucao,
  dv.tipo,
  v.numero_venda,
  v.valor_total as valor_venda,
  v.valor_desconto
FROM devolucoes_venda dv
JOIN vendas v ON v.id = dv.venda_id
ORDER BY dv.criado_em DESC
LIMIT 5;

-- 2. Ver os créditos relacionados
SELECT 
  cc.id as credito_id,
  cc.devolucao_id,
  cc.valor_total as valor_credito,
  cc.valor_utilizado,
  cc.saldo,
  cc.criado_em,
  cc.motivo
FROM creditos_cliente cc
WHERE cc.devolucao_id IS NOT NULL
ORDER BY cc.criado_em DESC
LIMIT 5;

-- 3. Ver devoluções COM e SEM crédito (JOIN)
SELECT 
  dv.id as devolucao_id,
  dv.valor_total as valor_devolucao,
  dv.tipo,
  cc.id as credito_id,
  cc.valor_total as valor_credito,
  cc.saldo as saldo_credito,
  v.numero_venda
FROM devolucoes_venda dv
LEFT JOIN creditos_cliente cc ON cc.devolucao_id = dv.id
JOIN vendas v ON v.id = dv.venda_id
ORDER BY dv.criado_em DESC
LIMIT 5;

-- 4. Verificar se há devoluções "com_credito" sem crédito criado
SELECT 
  dv.id,
  dv.valor_total,
  dv.tipo,
  dv.criado_em,
  v.numero_venda,
  CASE 
    WHEN cc.id IS NULL THEN '❌ CREDITO NÃO CRIADO'
    WHEN cc.valor_total = 0 THEN '⚠️ CREDITO COM VALOR ZERO'
    ELSE '✅ CREDITO OK'
  END as status_credito
FROM devolucoes_venda dv
JOIN vendas v ON v.id = dv.venda_id
LEFT JOIN creditos_cliente cc ON cc.devolucao_id = dv.id
WHERE dv.tipo = 'com_credito'
ORDER BY dv.criado_em DESC
LIMIT 10;
