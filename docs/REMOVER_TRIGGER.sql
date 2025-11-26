-- =====================================================
-- DESABILITAR TRIGGER (controle agora é no backend)
-- =====================================================

-- Dropar o trigger problemático
DROP TRIGGER IF EXISTS trigger_baixa_estoque_os ON ordem_servico_pecas;

-- Manter a função mas sem trigger (pode ser útil no futuro)
-- Ou podemos dropar também se quiser limpar
-- DROP FUNCTION IF EXISTS processar_baixa_estoque_os();

SELECT '✅ Trigger removido! Controle de estoque agora é feito diretamente no backend (como vendas).' as resultado;
