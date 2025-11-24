-- Verificar produtos com estoque baixo
SELECT 
  p.descricao,
  l.nome AS loja,
  el.quantidade,
  CASE 
    WHEN el.quantidade = 0 THEN '🔴 ZERADO'
    WHEN el.quantidade <= 2 THEN '🟠 CRÍTICO'
    WHEN el.quantidade <= 5 THEN '🟡 BAIXO'
    ELSE '🟢 OK'
  END AS status
FROM estoque_lojas el
JOIN produtos p ON el.id_produto = p.id
JOIN lojas l ON el.id_loja = l.id
WHERE el.quantidade <= 10
ORDER BY el.quantidade ASC, p.descricao;

-- Ver últimas notificações criadas
SELECT 
  tipo,
  titulo,
  mensagem,
  lida,
  criado_em
FROM notificacoes
ORDER BY criado_em DESC
LIMIT 10;
