-- ========================================
-- DEBUG: TRANSFERENCIAS E USUARIOS
-- ========================================
-- Este script verifica se os usuários têm IDs válidos
-- e se conseguem inserir em transferencias

-- 1. VERIFICAR USUARIOS ATIVOS
SELECT 
    u.id,
    u.nome,
    u.email,
    u.ativo,
    p.loja_id,
    p.todas_lojas,
    l.nome as loja_nome
FROM usuarios u
LEFT JOIN permissoes p ON p.usuario_id = u.id
LEFT JOIN lojas l ON l.id = p.loja_id
WHERE u.ativo = true
ORDER BY u.nome;

-- 2. VERIFICAR SE USUARIO TEM PERMISSOES
SELECT 
    u.id as usuario_id,
    u.nome,
    u.email,
    COUNT(p.id) as total_permissoes,
    BOOL_OR(p.todas_lojas) as tem_todas_lojas,
    ARRAY_AGG(DISTINCT p.loja_id) FILTER (WHERE p.loja_id IS NOT NULL) as lojas_com_permissao
FROM usuarios u
LEFT JOIN permissoes p ON p.usuario_id = u.id
WHERE u.ativo = true
GROUP BY u.id, u.nome, u.email
ORDER BY u.nome;

-- 3. VERIFICAR POLITICAS RLS DE TRANSFERENCIAS (detalhado)
SELECT 
    schemaname,
    tablename,
    policyname,
    cmd,
    roles,
    CASE 
        WHEN qual IS NULL THEN 'SEM RESTRICAO (NULL)'
        WHEN qual = 'true' THEN 'PERMISSIVO (true)'
        ELSE qual
    END as qual_readable,
    CASE 
        WHEN with_check IS NULL THEN 'SEM RESTRICAO (NULL)'
        WHEN with_check = 'true' THEN 'PERMISSIVO (true)'
        ELSE with_check
    END as with_check_readable
FROM pg_policies 
WHERE tablename IN ('transferencias', 'transferencias_itens')
ORDER BY tablename, cmd, policyname;

-- 4. VERIFICAR SE USUARIOS TEM auth.uid() VALIDO
-- Nota: Esta query só funciona se executada por um usuário autenticado
-- SELECT auth.uid() as meu_auth_uid;

-- 5. TESTAR INSERT MANUAL (para executar como teste)
-- Descomente e execute uma linha de cada vez como teste:
-- Substitua os valores pelos IDs reais do seu sistema

/*
-- Teste 1: Inserir transferencia como super admin (troque o usuario_id)
INSERT INTO transferencias (loja_origem_id, loja_destino_id, status, observacao, usuario_id)
VALUES (1, 2, 'pendente', 'TESTE MANUAL - DELETE DEPOIS', 'ID_DO_USUARIO_ADMIN')
RETURNING *;

-- Se funcionou, deletar:
DELETE FROM transferencias WHERE observacao = 'TESTE MANUAL - DELETE DEPOIS';
*/

-- 6. VERIFICAR GRANTS (permissoes da tabela)
SELECT 
    grantee,
    table_schema,
    table_name,
    privilege_type
FROM information_schema.role_table_grants
WHERE table_name IN ('transferencias', 'transferencias_itens')
    AND grantee IN ('authenticated', 'anon', 'service_role')
ORDER BY table_name, grantee, privilege_type;

-- 7. VERIFICAR SE RLS ESTA HABILITADO
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_habilitado
FROM pg_tables
WHERE tablename IN ('transferencias', 'transferencias_itens');

-- 8. VERIFICAR ULTIMAS TRANSFERENCIAS CRIADAS
SELECT 
    t.id,
    t.loja_origem_id,
    t.loja_destino_id,
    t.status,
    t.usuario_id,
    u.nome as criado_por_nome,
    u.email as criado_por_email,
    t.criado_em,
    COUNT(ti.id) as total_itens
FROM transferencias t
LEFT JOIN usuarios u ON u.id = t.usuario_id
LEFT JOIN transferencias_itens ti ON ti.transferencia_id = t.id
GROUP BY t.id, t.loja_origem_id, t.loja_destino_id, t.status, t.usuario_id, u.nome, u.email, t.criado_em
ORDER BY t.criado_em DESC
LIMIT 10;
