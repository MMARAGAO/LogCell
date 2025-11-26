-- Script para verificar movimentações de estoque e identificar inconsistências
-- Data: 25/11/2025

-- 1. Buscar IDs dos produtos
SELECT id, descricao 
FROM produtos 
WHERE descricao IN ('teste', 'Bateria iphone 17');

-- Substitua os IDs abaixo pelos IDs retornados acima
-- ID do teste: ________
-- ID da Bateria: ________

-- 2. Ver histórico completo de movimentações
SELECT 
  h.criado_em,
  p.descricao as produto,
  h.tipo_movimentacao,
  h.quantidade,
  h.motivo,
  u.nome as usuario
FROM historico_estoque h
JOIN produtos p ON p.id = h.id_produto
LEFT JOIN usuarios u ON u.id = h.usuario_id
WHERE h.id_produto IN (
  SELECT id FROM produtos 
  WHERE descricao IN ('teste', 'Bateria iphone 17')
)
AND h.id_loja = (SELECT id FROM lojas WHERE nome = 'ATACADO')
ORDER BY h.criado_em ASC;

-- 3. Ver estoque atual
SELECT 
  p.descricao,
  e.quantidade as estoque_atual,
  l.nome as loja
FROM estoque_lojas e
JOIN produtos p ON p.id = e.id_produto
JOIN lojas l ON l.id = e.id_loja
WHERE p.descricao IN ('teste', 'Bateria iphone 17')
AND l.nome = 'ATACADO';

-- 4. Calcular o que DEVERIA ser baseado no histórico
SELECT 
  p.descricao,
  SUM(CASE WHEN h.tipo_movimentacao = 'entrada' THEN h.quantidade ELSE -h.quantidade END) as estoque_calculado
FROM historico_estoque h
JOIN produtos p ON p.id = h.id_produto
WHERE h.id_produto IN (
  SELECT id FROM produtos 
  WHERE descricao IN ('teste', 'Bateria iphone 17')
)
AND h.id_loja = (SELECT id FROM lojas WHERE nome = 'ATACADO')
GROUP BY p.descricao;
