-- =====================================================
-- VERIFICAR SE NOTIFICAÇÃO FOI CRIADA PARA O USUÁRIO
-- =====================================================

-- 1. Ver notificação mais recente criada
SELECT 
    n.id,
    n.tipo,
    n.titulo,
    n.mensagem,
    n.produto_id,
    n.loja_id,
    n.criado_em
FROM notificacoes n
ORDER BY n.criado_em DESC
LIMIT 1;

-- 2. Ver se essa notificação foi associada a algum usuário
SELECT 
    nu.id,
    nu.notificacao_id,
    nu.usuario_id,
    u.nome as usuario_nome,
    u.email as usuario_email,
    nu.lida,
    nu.criado_em
FROM notificacoes_usuarios nu
JOIN usuarios u ON nu.usuario_id = u.id
WHERE nu.notificacao_id = (
    SELECT id FROM notificacoes ORDER BY criado_em DESC LIMIT 1
);

-- 3. Ver se o usuário com ID '1c0d76a8-563c-47f4-8583-4a8fcb2a063f' recebeu alguma notificação
SELECT 
    nu.id,
    nu.notificacao_id,
    n.tipo,
    n.titulo,
    n.mensagem,
    nu.lida,
    nu.criado_em
FROM notificacoes_usuarios nu
JOIN notificacoes n ON nu.notificacao_id = n.id
WHERE nu.usuario_id = '1c0d76a8-563c-47f4-8583-4a8fcb2a063f'
ORDER BY nu.criado_em DESC;

-- 4. Contar todos os usuários ativos no sistema
SELECT COUNT(*) as total_usuarios_ativos
FROM usuarios
WHERE ativo = true;

-- 5. Ver todos os usuários ativos
SELECT 
    id,
    nome,
    email,
    ativo
FROM usuarios
WHERE ativo = true
ORDER BY nome;
