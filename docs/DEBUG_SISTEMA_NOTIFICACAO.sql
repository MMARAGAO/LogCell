-- Verificar se a tabela alertas_estoque_controle tem unique constraint
SELECT 
  con.conname AS constraint_name,
  con.contype AS constraint_type,
  pg_get_constraintdef(con.oid) AS constraint_definition
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
WHERE rel.relname = 'alertas_estoque_controle';

-- Verificar dados atuais na tabela de controle
SELECT 
  ac.*,
  p.descricao as produto,
  l.nome as loja
FROM alertas_estoque_controle ac
LEFT JOIN produtos p ON ac.produto_id = p.id
LEFT JOIN lojas l ON ac.loja_id = l.id
ORDER BY ac.atualizado_em DESC
LIMIT 20;

-- Ver últimas notificações criadas (últimos 30 minutos)
SELECT 
  n.id,
  n.tipo,
  n.titulo,
  LEFT(n.mensagem, 100) as mensagem_preview,
  p.descricao as produto,
  l.nome as loja,
  n.criado_em,
  COUNT(nu.id) as usuarios_notificados
FROM notificacoes n
LEFT JOIN produtos p ON n.produto_id = p.id
LEFT JOIN lojas l ON n.loja_id = l.id
LEFT JOIN notificacoes_usuarios nu ON nu.notificacao_id = n.id
WHERE n.criado_em > NOW() - INTERVAL '30 minutes'
GROUP BY n.id, n.tipo, n.titulo, n.mensagem, p.descricao, l.nome, n.criado_em
ORDER BY n.criado_em DESC;
