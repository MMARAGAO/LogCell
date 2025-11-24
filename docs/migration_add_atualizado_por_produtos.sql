-- ============================================
-- MIGRAÇÃO: Adicionar campo atualizado_por na tabela produtos
-- ============================================
-- Este script adiciona o campo atualizado_por que estava faltando
-- ============================================

-- Adicionar coluna atualizado_por se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'produtos' 
        AND column_name = 'atualizado_por'
    ) THEN
        ALTER TABLE public.produtos 
        ADD COLUMN atualizado_por UUID REFERENCES auth.users(id);
        
        RAISE NOTICE 'Coluna atualizado_por adicionada com sucesso!';
    ELSE
        RAISE NOTICE 'Coluna atualizado_por já existe!';
    END IF;
END $$;

-- Criar índice para o novo campo
CREATE INDEX IF NOT EXISTS idx_produtos_atualizado_por ON public.produtos(atualizado_por);

-- Verificar estrutura da tabela
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'produtos'
ORDER BY ordinal_position;
