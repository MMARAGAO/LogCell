-- Solução: Adicionar a coluna atualizado_em como alias de updated_at
-- Isso resolve o problema sem quebrar nada

-- 1. Verificar se a coluna atualizado_em já existe
DO $$ 
BEGIN
    -- Se não existir, adicionar como coluna gerada (alias)
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'configuracoes_usuario' 
        AND column_name = 'atualizado_em'
    ) THEN
        -- Adicionar coluna atualizado_em como alias de updated_at
        ALTER TABLE public.configuracoes_usuario 
        ADD COLUMN atualizado_em TIMESTAMP WITH TIME ZONE 
        GENERATED ALWAYS AS (updated_at) STORED;
        
        RAISE NOTICE 'Coluna atualizado_em criada como alias de updated_at';
    ELSE
        RAISE NOTICE 'Coluna atualizado_em já existe';
    END IF;
END $$;

-- 2. Verificar o resultado
SELECT 
    column_name, 
    data_type, 
    is_generated,
    generation_expression
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'configuracoes_usuario'
  AND column_name IN ('updated_at', 'atualizado_em')
ORDER BY column_name;
