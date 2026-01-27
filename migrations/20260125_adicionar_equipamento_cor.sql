-- =====================================================
-- MIGRATION: Adicionar campo equipamento_cor
-- Data: 25/01/2026
-- Descrição: Adiciona o campo de cor do equipamento como obrigatório
-- =====================================================

-- Adicionar coluna equipamento_cor na tabela ordem_servico (para dados legados)
ALTER TABLE public.ordem_servico
ADD COLUMN IF NOT EXISTS equipamento_cor character varying(100);

-- Adicionar coluna equipamento_cor na tabela ordem_servico_aparelhos (para novos dados)
ALTER TABLE public.ordem_servico_aparelhos
ADD COLUMN IF NOT EXISTS equipamento_cor character varying(100);

-- Comentário explicativo
COMMENT ON COLUMN public.ordem_servico.equipamento_cor IS 'Cor do equipamento (obrigatório)';
COMMENT ON COLUMN public.ordem_servico_aparelhos.equipamento_cor IS 'Cor do equipamento (obrigatório)';
