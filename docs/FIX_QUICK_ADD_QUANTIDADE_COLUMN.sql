-- =====================================================
-- CORREÇÃO RÁPIDA: Adicionar coluna quantidade temporária
-- =====================================================
-- Esta é uma correção temporária para fazer o sistema funcionar
-- enquanto migramos todas as funções para usar quantidade_alterada

ALTER TABLE public.historico_estoque
ADD COLUMN IF NOT EXISTS quantidade INTEGER;

-- Verificar se foi criada
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'historico_estoque'
  AND column_name = 'quantidade';
