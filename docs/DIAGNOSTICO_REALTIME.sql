-- =====================================================
-- DIAGNÓSTICO COMPLETO DO REALTIME
-- =====================================================
-- Execute este script para verificar a configuração
-- =====================================================

-- 1. Verificar se a publicação existe
SELECT 
  pubname,
  puballtables,
  pubinsert,
  pubupdate,
  pubdelete
FROM pg_publication
WHERE pubname = 'supabase_realtime';

-- 2. Listar TODAS as tabelas na publicação
SELECT 
  schemaname,
  tablename
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime'
ORDER BY tablename;

-- 3. Verificar REPLICA IDENTITY da tabela permissoes
SELECT 
  c.relname AS table_name,
  CASE c.relreplident
    WHEN 'd' THEN 'DEFAULT'
    WHEN 'n' THEN 'NOTHING'
    WHEN 'f' THEN 'FULL'
    WHEN 'i' THEN 'INDEX'
  END AS replica_identity
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relname IN ('permissoes', 'vendas', 'notificacoes', 'estoque_lojas', 'transferencias')
ORDER BY c.relname;

-- 4. Verificar RLS policies da tabela permissoes
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'permissoes'
ORDER BY policyname;

-- 5. Verificar se RLS está habilitado
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename IN ('permissoes', 'vendas', 'notificacoes', 'estoque_lojas', 'transferencias')
ORDER BY tablename;

-- =====================================================
-- DIAGNÓSTICO ESPERADO
-- =====================================================
/*
1. pg_publication deve retornar 1 linha com supabase_realtime

2. pg_publication_tables deve incluir:
   - permissoes
   - vendas
   - notificacoes
   - estoque_lojas
   - transferencias

3. REPLICA IDENTITY deve ser 'FULL' para todas as tabelas

4. RLS policies devem permitir SELECT para authenticated

5. rowsecurity deve ser true

SE ALGUM TESTE FALHAR:
- Execute novamente EXECUTAR_AGORA_REALTIME.sql
- Verifique no Dashboard: Database > Replication
- Adicione manualmente se necessário
*/
