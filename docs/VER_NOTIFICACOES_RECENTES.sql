-- Ver notificações recentes criadas nas últimas 2 horas
SELECT 
  n.id,
  n.tipo,
  n.titulo,
  n.mensagem,
  p.descricao as produto,
  l.nome as loja,
  n.criado_em,
  COUNT(nu.id) as total_usuarios_notificados
FROM notificacoes n
LEFT JOIN produtos p ON n.produto_id = p.id
LEFT JOIN lojas l ON n.loja_id = l.id
LEFT JOIN notificacoes_usuarios nu ON nu.notificacao_id = n.id
WHERE n.criado_em > NOW() - INTERVAL '2 hours'
GROUP BY n.id, n.tipo, n.titulo, n.mensagem, p.descricao, l.nome, n.criado_em
ORDER BY n.criado_em DESC;

-- Ver se há notificações criadas mas sem usuários vinculados
SELECT 
  n.id,
  n.tipo,
  n.titulo,
  n.mensagem,
  n.criado_em,
  COUNT(nu.id) as usuarios_vinculados
FROM notificacoes n
LEFT JOIN notificacoes_usuarios nu ON nu.notificacao_id = n.id
WHERE n.criado_em > NOW() - INTERVAL '1 hour'
GROUP BY n.id, n.tipo, n.titulo, n.mensagem, n.criado_em
HAVING COUNT(nu.id) = 0
ORDER BY n.criado_em DESC;
