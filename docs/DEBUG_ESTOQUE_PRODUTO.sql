-- =====================================================
-- DEBUG: Verificar histórico completo de estoque
-- =====================================================

-- 1. Ver produtos com estoque 0 ou negativo
SELECT 
  p.id,
  p.descricao,
  p.marca,
  el.id_loja,
  l.nome as loja,
  el.quantidade as estoque_atual
FROM produtos p
LEFT JOIN estoque_lojas el ON el.id_produto = p.id
LEFT JOIN lojas l ON l.id = el.id_loja
WHERE el.quantidade <= 0
ORDER BY p.descricao;

-- 2. Ver histórico completo de movimentações (últimas 50)
SELECT 
  he.id,
  p.descricao as produto,
  l.nome as loja,
  he.tipo_movimentacao,
  he.quantidade_anterior,
  he.quantidade_alterada,
  he.quantidade_nova,
  he.motivo,
  he.observacao,
  he.criado_em,
  u.nome as usuario
FROM historico_estoque he
JOIN produtos p ON p.id = he.id_produto
JOIN lojas l ON l.id = he.id_loja
LEFT JOIN usuarios u ON u.id = he.usuario_id
ORDER BY he.criado_em DESC
LIMIT 50;

-- 3. Ver devoluções recentes com seus itens
SELECT 
  dv.id,
  dv.venda_id,
  v.numero_venda,
  dv.valor_total,
  dv.tipo,
  dv.criado_em,
  json_agg(
    json_build_object(
      'produto_id', iv.produto_id,
      'descricao', p.descricao,
      'quantidade_devolvida', id.quantidade
    )
  ) as itens
FROM devolucoes_venda dv
JOIN vendas v ON v.id = dv.venda_id
LEFT JOIN itens_devolucao id ON id.devolucao_id = dv.id
LEFT JOIN itens_venda iv ON iv.id = id.item_venda_id
LEFT JOIN produtos p ON p.id = iv.produto_id
WHERE dv.criado_em > NOW() - INTERVAL '7 days'
GROUP BY dv.id, v.numero_venda, dv.valor_total, dv.tipo, dv.criado_em
ORDER BY dv.criado_em DESC;

-- 4. Ver OS com peças (últimas 20)
SELECT 
  os.numero_os,
  os.status,
  osp.descricao_peca,
  osp.quantidade,
  osp.tipo_produto,
  osp.estoque_baixado,
  osp.criado_em,
  l.nome as loja
FROM ordem_servico_pecas osp
JOIN ordem_servico os ON os.id = osp.id_ordem_servico
LEFT JOIN lojas l ON l.id = osp.id_loja
ORDER BY osp.criado_em DESC
LIMIT 20;
