-- =====================================================
-- DEBUG: Verificar OS específica e detalhes
-- =====================================================

-- 1. Ver últimas OS criadas
SELECT 
  '=== ÚLTIMAS ORDENS DE SERVIÇO ===' as secao;

SELECT 
  os.id,
  os.numero_os,
  os.cliente_nome,
  os.status,
  os.id_loja,
  l.nome as loja_nome,
  os.criado_em,
  os.criado_por,
  u.nome as criado_por_nome
FROM ordem_servico os
JOIN lojas l ON l.id = os.id_loja
LEFT JOIN usuarios u ON u.id = os.criado_por
ORDER BY os.criado_em DESC
LIMIT 10;

-- 2. Ver peças já adicionadas nas últimas OS
SELECT 
  '=== PEÇAS DAS ÚLTIMAS OS ===' as secao;

SELECT 
  os.numero_os,
  os.id_loja as os_loja_id,
  l1.nome as os_loja_nome,
  osp.id_loja as peca_loja_id,
  l2.nome as peca_loja_nome,
  osp.descricao_peca,
  osp.quantidade,
  osp.tipo_produto,
  osp.estoque_baixado,
  p.descricao as produto_descricao,
  osp.criado_em
FROM ordem_servico os
JOIN lojas l1 ON l1.id = os.id_loja
LEFT JOIN ordem_servico_pecas osp ON osp.id_ordem_servico = os.id
LEFT JOIN lojas l2 ON l2.id = osp.id_loja
LEFT JOIN produtos p ON p.id = osp.id_produto
WHERE os.criado_em > NOW() - INTERVAL '2 days'
ORDER BY os.criado_em DESC, osp.criado_em DESC
LIMIT 20;

-- 3. Verificar se há algum problema com o produto específico
SELECT 
  '=== VERIFICAR PRODUTO E3138EED1 ===' as secao;

SELECT 
  p.id,
  p.descricao,
  p.marca,
  p.ativo,
  el.id_loja,
  l.nome as loja,
  el.quantidade,
  el.id as estoque_id
FROM produtos p
LEFT JOIN estoque_lojas el ON el.id_produto = p.id
LEFT JOIN lojas l ON l.id = el.id_loja
WHERE p.id = 'e138eed1-e316-4d2a-990e-7f1ebdee06c7'
ORDER BY l.nome;

-- 4. Ver logs do PostgreSQL (se disponível)
SELECT 
  '=== TENTAR VER RAISES DO TRIGGER ===' as secao;

-- Infelizmente não dá para ver os RAISE NOTICE anteriores,
-- mas podemos simular o que o trigger faria:

-- Simular verificação de estoque para o produto
WITH teste AS (
  SELECT 
    'e138eed1-e316-4d2a-990e-7f1ebdee06c7'::uuid as id_produto,
    16 as id_loja,  -- ATACADO
    13 as quantidade_solicitada
)
SELECT 
  t.id_produto,
  t.id_loja,
  l.nome as loja_nome,
  t.quantidade_solicitada,
  COALESCE(el.quantidade, 0) as estoque_disponivel,
  CASE 
    WHEN COALESCE(el.quantidade, 0) >= t.quantidade_solicitada 
    THEN '✅ SUFICIENTE'
    ELSE '❌ INSUFICIENTE'
  END as status_estoque,
  el.id as estoque_registro_id
FROM teste t
LEFT JOIN lojas l ON l.id = t.id_loja
LEFT JOIN estoque_lojas el ON el.id_produto = t.id_produto AND el.id_loja = t.id_loja;

-- 5. Verificar se existe registro na estoque_lojas
SELECT 
  '=== VERIFICAR REGISTRO ESTOQUE_LOJAS ===' as secao;

SELECT 
  el.*,
  l.nome as loja_nome,
  p.descricao as produto_descricao
FROM estoque_lojas el
JOIN lojas l ON l.id = el.id_loja
JOIN produtos p ON p.id = el.id_produto
WHERE el.id_produto = 'e138eed1-e316-4d2a-990e-7f1ebdee06c7'
  AND el.id_loja = 16
ORDER BY el.atualizado_em DESC;

-- 6. Fazer teste manual de INSERT (NÃO VAI EXECUTAR, só mostra o que seria)
SELECT 
  '=== TESTE DE INSERT (APENAS VISUALIZAÇÃO) ===' as secao;

SELECT 
  'INSERT INTO ordem_servico_pecas (' ||
  '  id_ordem_servico, id_produto, id_loja, tipo_produto, ' ||
  '  descricao_peca, quantidade, valor_custo, valor_venda, valor_total, criado_por' ||
  ') VALUES (' ||
  '  ''<ID_DA_OS>'', ' ||
  '  ''e138eed1-e316-4d2a-990e-7f1ebdee06c7'', ' ||
  '  16, ' ||
  '  ''estoque'', ' ||
  '  ''Bateria iphone 17'', ' ||
  '  13, ' ||
  '  450.00, ' ||
  '  600.00, ' ||
  '  7800.00, ' ||
  '  ''<ID_USUARIO>''' ||
  ');' as comando_insert;
