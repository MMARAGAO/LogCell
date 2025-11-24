-- Corrigir trigger da tabela produtos
-- O erro ocorre porque o trigger está tentando usar "updated_at" 
-- mas a coluna correta é "atualizado_em"

-- 1. Remover trigger antigo
DROP TRIGGER IF EXISTS update_produtos_updated_at ON public.produtos;

-- 2. Verificar qual coluna existe na tabela produtos
DO $$
BEGIN
    -- Verificar se existe updated_at
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'produtos' 
        AND column_name = 'updated_at'
    ) THEN
        -- Tabela usa updated_at, criar função apropriada
        CREATE OR REPLACE FUNCTION update_produtos_timestamp()
        RETURNS TRIGGER AS $func$
        BEGIN
            NEW.updated_at = NOW();
            RETURN NEW;
        END;
        $func$ LANGUAGE plpgsql;

        -- Criar trigger para updated_at
        CREATE TRIGGER update_produtos_timestamp_trigger
            BEFORE UPDATE ON produtos
            FOR EACH ROW
            EXECUTE FUNCTION update_produtos_timestamp();
            
        RAISE NOTICE 'Trigger criado para coluna updated_at';

    ELSIF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'produtos' 
        AND column_name = 'atualizado_em'
    ) THEN
        -- Tabela usa atualizado_em, criar função apropriada
        CREATE OR REPLACE FUNCTION update_produtos_timestamp()
        RETURNS TRIGGER AS $func$
        BEGIN
            NEW.atualizado_em = NOW();
            RETURN NEW;
        END;
        $func$ LANGUAGE plpgsql;

        -- Criar trigger para atualizado_em
        CREATE TRIGGER update_produtos_timestamp_trigger
            BEFORE UPDATE ON produtos
            FOR EACH ROW
            EXECUTE FUNCTION update_produtos_timestamp();
            
        RAISE NOTICE 'Trigger criado para coluna atualizado_em';
    ELSE
        RAISE NOTICE 'Nenhuma coluna de timestamp encontrada em produtos';
    END IF;
END $$;

-- 3. Verificar configuração
SELECT 
    column_name,
    data_type,
    column_default
FROM information_schema.columns
WHERE table_name = 'produtos'
AND column_name IN ('updated_at', 'atualizado_em')
ORDER BY column_name;
