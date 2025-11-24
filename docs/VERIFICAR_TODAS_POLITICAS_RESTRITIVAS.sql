-- Script para verificar todas as políticas RLS que restringem UPDATE/DELETE baseado em auth.uid()
-- Identifica políticas que podem causar problemas similares ao da tabela vendas

-- 1. Listar TODAS as políticas de UPDATE e DELETE que usam auth.uid()
SELECT 
    schemaname,
    tablename,
    policyname,
    cmd as operacao,
    roles,
    qual as condicao,
    CASE 
        WHEN qual LIKE '%auth.uid()%' THEN '⚠️ USA auth.uid()'
        WHEN qual LIKE '%criado_por%' THEN '⚠️ Restringe por criado_por'
        WHEN qual LIKE '%vendedor_id%' THEN '⚠️ Restringe por vendedor_id'
        WHEN qual = 'true' THEN '✅ Permissivo'
        ELSE '❓ Verificar manualmente'
    END as tipo_restricao
FROM pg_policies 
WHERE cmd IN ('UPDATE', 'DELETE')
  AND schemaname = 'public'
ORDER BY tablename, cmd;

-- 2. Listar tabelas COM RLS ativado mas SEM políticas de UPDATE/DELETE
SELECT 
    t.tablename,
    t.rowsecurity as rls_ativo,
    COUNT(CASE WHEN p.cmd = 'UPDATE' THEN 1 END) as politicas_update,
    COUNT(CASE WHEN p.cmd = 'DELETE' THEN 1 END) as politicas_delete,
    CASE 
        WHEN COUNT(CASE WHEN p.cmd = 'UPDATE' THEN 1 END) = 0 THEN '❌ SEM UPDATE'
        ELSE '✅ TEM UPDATE'
    END as status_update,
    CASE 
        WHEN COUNT(CASE WHEN p.cmd = 'DELETE' THEN 1 END) = 0 THEN '❌ SEM DELETE'
        ELSE '✅ TEM DELETE'
    END as status_delete
FROM pg_tables t
LEFT JOIN pg_policies p ON t.tablename = p.tablename AND t.schemaname = p.schemaname
WHERE t.schemaname = 'public'
  AND t.rowsecurity = true
GROUP BY t.tablename, t.rowsecurity
HAVING COUNT(CASE WHEN p.cmd = 'UPDATE' THEN 1 END) = 0 
    OR COUNT(CASE WHEN p.cmd = 'DELETE' THEN 1 END) = 0
ORDER BY t.tablename;

-- 3. Listar políticas problemáticas que restringem por criador mas auth.uid() retorna null
SELECT 
    tablename,
    policyname,
    cmd,
    qual,
    '⚠️ PROBLEMA: auth.uid() retorna NULL no seu sistema!' as alerta
FROM pg_policies
WHERE schemaname = 'public'
  AND qual LIKE '%auth.uid()%'
  AND cmd IN ('UPDATE', 'DELETE')
ORDER BY tablename, cmd;

-- 4. Sugestão: Verificar se auth.uid() funciona no seu sistema
SELECT 
    auth.uid() as auth_uid_resultado,
    CASE 
        WHEN auth.uid() IS NULL THEN '❌ auth.uid() retorna NULL - Sistema usa tabela usuarios separada'
        ELSE '✅ auth.uid() funciona normalmente'
    END as status_autenticacao;
