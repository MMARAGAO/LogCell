-- =====================================================
-- SCRIPT SQL: ZERAR ESTOQUE
-- =====================================================
-- Este script ZERA todas as quantidades na tabela estoque_lojas
-- ATENÇÃO: Execute com cuidado! Isso irá apagar todos os dados de estoque!
-- =====================================================

-- Opção 1: DELETAR todos os registros de estoque
-- (Remove completamente os registros da tabela)
DELETE FROM estoque_lojas;

-- Opção 2: Apenas ZERAR as quantidades (mantém os registros)
-- (Descomente as linhas abaixo se preferir esta opção)
-- UPDATE estoque_lojas 
-- SET quantidade = 0, 
--     atualizado_em = NOW();

-- =====================================================
-- VERIFICAÇÃO
-- =====================================================
-- Após executar, rode este SELECT para confirmar:
-- SELECT COUNT(*) as total_registros, 
--        SUM(quantidade) as total_unidades 
-- FROM estoque_lojas;
