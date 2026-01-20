-- ============================================================
-- EXECUTAR NO SQL EDITOR DO SUPABASE
-- ============================================================
-- Cole este script no SQL Editor do painel do Supabase e execute
-- URL: https://app.supabase.com/project/qyzjvkthuuclsyjeweek/sql

-- Adicionar coluna ordem_servico_id se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'creditos_cliente' 
        AND column_name = 'ordem_servico_id'
    ) THEN
        ALTER TABLE creditos_cliente 
        ADD COLUMN ordem_servico_id UUID REFERENCES ordem_servico(id) ON DELETE SET NULL;
        
        COMMENT ON COLUMN creditos_cliente.ordem_servico_id IS 
        'Referência à ordem de serviço que gerou o crédito (para devoluções de OS)';
        
        RAISE NOTICE '✅ Coluna ordem_servico_id adicionada com sucesso!';
    ELSE
        RAISE NOTICE 'ℹ️ Coluna ordem_servico_id já existe, nenhuma alteração necessária.';
    END IF;
END $$;

-- Criar índice para melhorar performance de consultas
CREATE INDEX IF NOT EXISTS idx_creditos_cliente_ordem_servico 
ON creditos_cliente(ordem_servico_id) 
WHERE ordem_servico_id IS NOT NULL;

-- Verificar se a alteração foi aplicada
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'creditos_cliente' 
AND column_name = 'ordem_servico_id';

-- Mensagem final
DO $$
BEGIN
    RAISE NOTICE '✅ Migração concluída com sucesso!';
    RAISE NOTICE '📊 A tabela creditos_cliente agora suporta rastreamento de devoluções de OS.';
END $$;
