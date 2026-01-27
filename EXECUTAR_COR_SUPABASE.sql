-- ============================================================
-- EXECUTAR NO SQL EDITOR DO SUPABASE
-- ============================================================
-- Cole este script no SQL Editor do painel do Supabase e execute
-- URL: https://app.supabase.com/project/qyzjvkthuuclsyjeweek/sql
-- Migração: Adicionar campo equipamento_cor como obrigatório

-- Adicionar coluna equipamento_cor na tabela ordem_servico
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'ordem_servico' 
        AND column_name = 'equipamento_cor'
    ) THEN
        ALTER TABLE public.ordem_servico 
        ADD COLUMN equipamento_cor character varying(100);
        
        COMMENT ON COLUMN public.ordem_servico.equipamento_cor IS 
        'Cor do equipamento (obrigatório)';
        
        RAISE NOTICE '✅ Coluna equipamento_cor adicionada em ordem_servico!';
    ELSE
        RAISE NOTICE 'ℹ️ Coluna equipamento_cor já existe em ordem_servico.';
    END IF;
END $$;

-- Adicionar coluna equipamento_cor na tabela ordem_servico_aparelhos
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'ordem_servico_aparelhos' 
        AND column_name = 'equipamento_cor'
    ) THEN
        ALTER TABLE public.ordem_servico_aparelhos 
        ADD COLUMN equipamento_cor character varying(100);
        
        COMMENT ON COLUMN public.ordem_servico_aparelhos.equipamento_cor IS 
        'Cor do equipamento (obrigatório)';
        
        RAISE NOTICE '✅ Coluna equipamento_cor adicionada em ordem_servico_aparelhos!';
    ELSE
        RAISE NOTICE 'ℹ️ Coluna equipamento_cor já existe em ordem_servico_aparelhos.';
    END IF;
END $$;

-- Criar índice para melhorar performance
CREATE INDEX IF NOT EXISTS idx_ordem_servico_equipamento_cor 
ON public.ordem_servico(equipamento_cor) 
WHERE equipamento_cor IS NOT NULL;

-- Mensagem final
DO $$
BEGIN
    RAISE NOTICE '✅ Migração de equipamento_cor concluída com sucesso!';
    RAISE NOTICE '📝 O campo de cor do aparelho agora é obrigatório ao criar uma OS.';
END $$;
