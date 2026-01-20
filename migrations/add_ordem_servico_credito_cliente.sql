-- Migração: Adicionar campo ordem_servico_id na tabela creditos_cliente
-- Data: 2026-01-19
-- Descrição: Permite rastrear créditos gerados de devoluções de Ordem de Serviço

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
    END IF;
END $$;

-- Criar índice para melhorar performance de consultas
CREATE INDEX IF NOT EXISTS idx_creditos_cliente_ordem_servico 
ON creditos_cliente(ordem_servico_id) 
WHERE ordem_servico_id IS NOT NULL;
