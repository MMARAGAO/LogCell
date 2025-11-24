-- =====================================================
-- HABILITAR REALTIME PARA NOTIFICAÇÕES
-- =====================================================
-- Permite que as notificações apareçam em tempo real

-- 1. Habilitar publicação de mudanças (Realtime)
ALTER PUBLICATION supabase_realtime ADD TABLE public.notificacoes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notificacoes_usuarios;
ALTER PUBLICATION supabase_realtime ADD TABLE public.alertas_estoque_controle;

-- 2. Verificar se as tabelas foram adicionadas
SELECT 
    schemaname,
    tablename
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime'
AND tablename IN ('notificacoes', 'notificacoes_usuarios', 'alertas_estoque_controle');

-- Mensagem de sucesso
DO $$ 
BEGIN 
    RAISE NOTICE '✅ Realtime habilitado para notificações!'; 
    RAISE NOTICE '🔔 As notificações agora aparecem instantaneamente';
    RAISE NOTICE '♻️ Recarregue a página para aplicar as mudanças';
END $$;
