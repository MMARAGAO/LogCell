-- ============================================
-- DEBUG: Verificar usuário no histórico
-- ============================================

-- 1. Ver últimos registros de estoque com atualizado_por
SELECT 
    id_produto,
    id_loja,
    quantidade,
    atualizado_por,
    atualizado_em
FROM estoque_lojas
ORDER BY atualizado_em DESC
LIMIT 5;

-- 2. Ver últimos registros de histórico com usuario_id
SELECT 
    id,
    id_produto,
    id_loja,
    quantidade_alterada,
    usuario_id,
    observacao,
    criado_em
FROM historico_estoque
ORDER BY criado_em DESC
LIMIT 5;

-- 3. Verificar se usuario_id está NULL
SELECT 
    COUNT(*) as total_registros,
    COUNT(usuario_id) as com_usuario,
    COUNT(*) - COUNT(usuario_id) as sem_usuario
FROM historico_estoque;

-- 4. Ver se há usuários na tabela usuarios
SELECT id, nome, email
FROM usuarios
LIMIT 5;

-- ============================================
-- TESTE: Inserir estoque manualmente com usuario
-- ============================================
-- Pegue um usuario_id válido da query acima e teste:
-- 
-- INSERT INTO estoque_lojas (id_produto, id_loja, quantidade, atualizado_por)
-- VALUES (
--     'SEU_PRODUTO_ID',
--     1,
--     999,
--     'SEU_USUARIO_ID'  -- ← Substitua por um UUID válido
-- );
--
-- Depois verifique se o histórico capturou o usuário:
-- SELECT * FROM historico_estoque ORDER BY criado_em DESC LIMIT 1;
