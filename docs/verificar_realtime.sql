-- =====================================================
-- VERIFICAR CONFIGURAÇÃO DO REALTIME
-- =====================================================

-- 1. Verificar se as tabelas estão na publicação supabase_realtime
SELECT 
    schemaname,
    tablename,
    pubname
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime'
ORDER BY tablename;

-- 2. Verificar todas as publicações disponíveis
SELECT 
    pubname,
    puballtables
FROM pg_publication;

-- 3. Se as tabelas NÃO aparecerem acima, execute:
-- (Descomente as linhas abaixo se necessário)

-- ALTER PUBLICATION supabase_realtime ADD TABLE public.notificacoes;
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.notificacoes_usuarios;
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.alertas_estoque_controle;

-- 4. Após adicionar, verifique novamente:
SELECT 
    schemaname,
    tablename
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime'
AND tablename IN ('notificacoes', 'notificacoes_usuarios', 'alertas_estoque_controle');
