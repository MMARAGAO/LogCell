-- =====================================================
-- REMOVER TRIGGER PROBLEMÁTICO DO HISTÓRICO
-- =====================================================

-- O histórico de estoque é apenas um REGISTRO do que aconteceu,
-- NÃO deve validar ou modificar o estoque novamente!

DROP TRIGGER IF EXISTS trigger_validar_estoque_saida ON historico_estoque;

-- Podemos manter a função caso seja usada em outro lugar
-- DROP FUNCTION IF EXISTS validar_estoque_antes_saida();

SELECT '✅ Trigger problemático removido! Histórico agora é apenas registro, não valida estoque.' as resultado;
