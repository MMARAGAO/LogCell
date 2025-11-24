-- =====================================================
-- HABILITAR REALTIME PARA TABELA PERMISSOES
-- =====================================================
-- Este script habilita o Supabase Realtime para a tabela
-- de permissões, permitindo que as mudanças sejam 
-- propagadas em tempo real para os clientes conectados
-- =====================================================

-- 1. Habilitar Realtime para a tabela permissoes
ALTER PUBLICATION supabase_realtime ADD TABLE permissoes;

-- 2. Verificar se foi habilitado
SELECT 
  schemaname,
  tablename,
  'Realtime habilitado' as status
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime'
  AND tablename = 'permissoes';

-- =====================================================
-- COMO APLICAR NO SUPABASE
-- =====================================================
-- 1. Acesse o Supabase Dashboard
-- 2. Vá em SQL Editor
-- 3. Cole e execute este script
-- 4. Verifique se a consulta de verificação retorna 1 linha
-- =====================================================

-- =====================================================
-- TESTE DE REALTIME
-- =====================================================
-- Para testar se o Realtime está funcionando:
-- 
-- 1. Abra o sistema em duas abas do navegador
-- 2. Faça login com o mesmo usuário em ambas
-- 3. Em uma aba, mude as permissões do usuário
-- 4. Na outra aba, o sistema deve atualizar automaticamente
--    sem precisar recarregar a página
-- =====================================================

-- =====================================================
-- DESABILITAR REALTIME (se necessário)
-- =====================================================
-- ALTER PUBLICATION supabase_realtime DROP TABLE permissoes;
-- =====================================================
