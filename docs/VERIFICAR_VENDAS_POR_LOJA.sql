-- VERIFICAR QUANTAS VENDAS EXISTEM POR LOJA

SELECT 
  l.id as loja_id,
  l.nome as loja_nome,
  COUNT(v.id) as total_vendas,
  COUNT(CASE WHEN v.status = 'concluida' THEN 1 END) as vendas_concluidas,
  COUNT(CASE WHEN v.status = 'em_andamento' THEN 1 END) as vendas_em_andamento
FROM lojas l
LEFT JOIN vendas v ON v.loja_id = l.id
GROUP BY l.id, l.nome
ORDER BY l.id;

-- Ver vendas específicas da loja ESTOQUE (ID 4)
SELECT 
  v.numero_venda,
  v.status,
  c.nome as cliente,
  v.total,
  v.criado_em
FROM vendas v
LEFT JOIN clientes c ON c.id = v.cliente_id
WHERE v.loja_id = 4
ORDER BY v.criado_em DESC
LIMIT 10;
