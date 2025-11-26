-- Ver logs E verificar se a peça foi marcada como estoque_baixado
SELECT 
  'LOGS DO TRIGGER:' as secao,
  criado_em,
  mensagem,
  dados
FROM debug_logs
ORDER BY criado_em DESC
LIMIT 20;

-- Verificar a peça adicionada
SELECT 
  'PEÇA ADICIONADA:' as secao,
  osp.id,
  osp.descricao_peca,
  osp.quantidade,
  osp.tipo_produto,
  osp.estoque_baixado,
  osp.data_baixa_estoque,
  osp.id_loja,
  l.nome as loja
FROM ordem_servico_pecas osp
JOIN lojas l ON l.id = osp.id_loja
WHERE osp.id_produto = 'e138eed1-e316-4d2a-990e-7f1ebdee06c7'
ORDER BY osp.criado_em DESC
LIMIT 5;
