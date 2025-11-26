-- =====================================================
-- DEBUG COMPLETO: Investigar estoque e duplicatas
-- =====================================================

-- 1. VERIFICAR DUPLICATAS EM estoque_lojas
-- =====================================================
SELECT 
  '=== DUPLICATAS EM ESTOQUE_LOJAS ===' as secao;

SELECT 
  el.id_produto,
  p.descricao,
  p.marca,
  el.id_loja,
  l.nome as loja,
  COUNT(*) as qtd_registros,
  array_agg(el.id ORDER BY el.atualizado_em DESC NULLS LAST) as ids,
  array_agg(el.quantidade ORDER BY el.atualizado_em DESC NULLS LAST) as quantidades,
  array_agg(el.atualizado_em ORDER BY el.atualizado_em DESC NULLS LAST) as datas_atualizacao
FROM estoque_lojas el
JOIN produtos p ON p.id = el.id_produto
JOIN lojas l ON l.id = el.id_loja
GROUP BY el.id_produto, p.descricao, p.marca, el.id_loja, l.nome
HAVING COUNT(*) > 1
ORDER BY COUNT(*) DESC, p.descricao;

-- 2. VERIFICAR ESTRUTURA DA TABELA estoque_lojas
-- =====================================================
SELECT 
  '=== ESTRUTURA DA TABELA estoque_lojas ===' as secao;

SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public'
  AND table_name = 'estoque_lojas'
ORDER BY ordinal_position;

-- 3. VERIFICAR CONSTRAINTS E ÍNDICES
-- =====================================================
SELECT 
  '=== CONSTRAINTS EM estoque_lojas ===' as secao;

SELECT
  tc.constraint_name,
  tc.constraint_type,
  string_agg(kcu.column_name, ', ' ORDER BY kcu.ordinal_position) as colunas
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.key_column_usage kcu 
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
WHERE tc.table_schema = 'public'
  AND tc.table_name = 'estoque_lojas'
GROUP BY tc.constraint_name, tc.constraint_type
ORDER BY tc.constraint_type, tc.constraint_name;

SELECT 
  '=== ÍNDICES EM estoque_lojas ===' as secao;

SELECT
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename = 'estoque_lojas'
ORDER BY indexname;

-- 4. VERIFICAR PRODUTO ESPECÍFICO (Bateria iphone 17)
-- =====================================================
SELECT 
  '=== PRODUTO: Bateria iphone 17 ===' as secao;

SELECT 
  p.id as produto_id,
  p.descricao,
  p.marca,
  p.categoria,
  p.codigo_fabricante,
  p.ativo
FROM produtos p
WHERE p.descricao ILIKE '%bateria%iphone%17%'
   OR p.descricao ILIKE '%iphone 17%'
ORDER BY p.criado_em DESC;

-- 5. ESTOQUE DO PRODUTO EM TODAS AS LOJAS
-- =====================================================
SELECT 
  '=== ESTOQUE POR LOJA ===' as secao;

WITH produto AS (
  SELECT id FROM produtos 
  WHERE descricao ILIKE '%bateria%iphone%17%'
     OR descricao ILIKE '%iphone 17%'
  LIMIT 1
)
SELECT 
  l.id as loja_id,
  l.nome as loja,
  COALESCE(el.quantidade, 0) as quantidade,
  el.atualizado_em,
  el.atualizado_por,
  u.nome as atualizado_por_nome,
  el.id as estoque_id
FROM lojas l
LEFT JOIN estoque_lojas el ON el.id_loja = l.id 
  AND el.id_produto = (SELECT id FROM produto)
LEFT JOIN usuarios u ON u.id = el.atualizado_por
WHERE l.ativo = true
ORDER BY l.nome;

-- 6. HISTÓRICO DE MOVIMENTAÇÕES DO PRODUTO (últimas 20)
-- =====================================================
SELECT 
  '=== HISTÓRICO DE MOVIMENTAÇÕES ===' as secao;

WITH produto AS (
  SELECT id FROM produtos 
  WHERE descricao ILIKE '%bateria%iphone%17%'
     OR descricao ILIKE '%iphone 17%'
  LIMIT 1
)
SELECT 
  he.criado_em,
  l.nome as loja,
  he.tipo_movimentacao,
  he.quantidade_anterior,
  he.quantidade_alterada,
  he.quantidade_nova,
  he.motivo,
  he.observacao,
  u.nome as usuario,
  he.id_ordem_servico
FROM historico_estoque he
JOIN lojas l ON l.id = he.id_loja
LEFT JOIN usuarios u ON u.id = he.usuario_id
WHERE he.id_produto = (SELECT id FROM produto)
ORDER BY he.criado_em DESC
LIMIT 20;

-- 7. VERIFICAR TRIGGERS NA TABELA ordem_servico_pecas
-- =====================================================
SELECT 
  '=== TRIGGERS EM ordem_servico_pecas ===' as secao;

SELECT
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement
FROM information_schema.triggers
WHERE event_object_schema = 'public'
  AND event_object_table = 'ordem_servico_pecas'
ORDER BY trigger_name;

-- 8. VERIFICAR FUNÇÃO DO TRIGGER (se existir)
-- =====================================================
SELECT 
  '=== FUNÇÃO processar_baixa_estoque_os ===' as secao;

SELECT
  p.proname as nome_funcao,
  pg_get_functiondef(p.oid) as definicao
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND p.proname LIKE '%baixa%estoque%os%'
ORDER BY p.proname;

-- 9. PEÇAS JÁ ADICIONADAS NESTE PRODUTO
-- =====================================================
SELECT 
  '=== PEÇAS DE OS COM ESTE PRODUTO ===' as secao;

WITH produto AS (
  SELECT id FROM produtos 
  WHERE descricao ILIKE '%bateria%iphone%17%'
     OR descricao ILIKE '%iphone 17%'
  LIMIT 1
)
SELECT 
  os.numero_os,
  os.status,
  osp.descricao_peca,
  osp.quantidade,
  osp.tipo_produto,
  osp.estoque_baixado,
  osp.data_baixa_estoque,
  l.nome as loja,
  osp.criado_em
FROM ordem_servico_pecas osp
JOIN ordem_servico os ON os.id = osp.id_ordem_servico
JOIN lojas l ON l.id = osp.id_loja
WHERE osp.id_produto = (SELECT id FROM produto)
ORDER BY osp.criado_em DESC
LIMIT 10;

-- 10. RESUMO TOTAL DE ESTOQUE
-- =====================================================
SELECT 
  '=== RESUMO GERAL ===' as secao;

WITH produto AS (
  SELECT id, descricao, marca FROM produtos 
  WHERE descricao ILIKE '%bateria%iphone%17%'
     OR descricao ILIKE '%iphone 17%'
  LIMIT 1
)
SELECT 
  p.descricao,
  p.marca,
  SUM(COALESCE(el.quantidade, 0)) as estoque_total,
  COUNT(DISTINCT el.id_loja) as lojas_com_estoque,
  COUNT(el.id) as registros_estoque
FROM produto p
LEFT JOIN estoque_lojas el ON el.id_produto = p.id
GROUP BY p.descricao, p.marca;
