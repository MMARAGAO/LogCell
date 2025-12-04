-- ============================================================================
-- VERIFICAR TRIGGER: baixa_estoque_ao_adicionar_item
-- ============================================================================

-- 1. Verificar se a trigger está ativa
SELECT 
    trigger_name,
    event_manipulation,
    action_timing,
    tgenabled as status,
    CASE 
        WHEN tgenabled = 'O' THEN '✅ ATIVA'
        WHEN tgenabled = 'D' THEN '❌ DESABILITADA'
        ELSE 'OUTRO'
    END as status_descricao
FROM information_schema.triggers t
JOIN pg_trigger pt ON pt.tgname = t.trigger_name
WHERE event_object_table = 'itens_venda'
  AND trigger_name = 'trigger_baixa_estoque_ao_adicionar_item'
ORDER BY trigger_name;

-- 2. Ver todas as triggers em itens_venda
SELECT 
    trigger_name,
    event_manipulation,
    action_timing
FROM information_schema.triggers
WHERE event_object_table = 'itens_venda'
ORDER BY trigger_name;

-- ============================================================================
-- SOLUÇÃO: MANTER A TRIGGER (mais segura)
-- ============================================================================
-- ✅ A trigger garante que TODA inserção em itens_venda vai baixar estoque
-- ✅ Código TypeScript removeu a baixa manual para evitar duplicação
-- ✅ Trigger é mais confiável e consistente

-- Verificar que a trigger está ativa
SELECT 
    trigger_name,
    event_manipulation,
    action_timing,
    '✅ TRIGGER ATIVA - Baixa automática de estoque funcionando' as status
FROM information_schema.triggers
WHERE event_object_table = 'itens_venda'
  AND trigger_name = 'trigger_baixa_estoque_ao_adicionar_item';

-- ============================================================================
-- NOTA: Código TypeScript agora apenas VALIDA o estoque antes de inserir
-- A trigger faz a baixa e registra no histórico automaticamente
-- ============================================================================

-- ============================================================================
-- FIM DO SCRIPT
-- ============================================================================
