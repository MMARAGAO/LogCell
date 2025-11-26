-- Verificar estoque ATUAL do produto
SELECT 
  el.id,
  p.descricao,
  l.nome as loja,
  el.quantidade,
  el.atualizado_em,
  el.atualizado_por
FROM estoque_lojas el
JOIN produtos p ON p.id = el.id_produto
JOIN lojas l ON l.id = el.id_loja
WHERE el.id_produto = 'e138eed1-e316-4d2a-990e-7f1ebdee06c7'
ORDER BY l.nome;

-- Ver peças adicionadas nesta OS
SELECT 
  osp.id,
  osp.descricao_peca,
  osp.quantidade,
  osp.estoque_baixado,
  osp.criado_em
FROM ordem_servico_pecas osp
WHERE osp.id_ordem_servico = '18b36b7f-14c3-40ac-8799-81be3bd9c34d'
  AND osp.id_produto = 'e138eed1-e316-4d2a-990e-7f1ebdee06c7'
ORDER BY osp.criado_em DESC;
