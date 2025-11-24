-- =====================================================
-- CORREÇÃO: Política RLS para Histórico de Fornecedores
-- =====================================================

-- Adicionar política de INSERT para permitir que triggers funcionem
DROP POLICY IF EXISTS "Sistema pode inserir no histórico de fornecedores" ON public.historico_fornecedores;
CREATE POLICY "Sistema pode inserir no histórico de fornecedores"
    ON public.historico_fornecedores
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- =====================================================
-- FIM DA CORREÇÃO
-- =====================================================
