    -- =====================================================
    -- SCRIPT PARA ADICIONAR COLUNA TIPO EM creditos_cliente
    -- =====================================================

    -- Adiciona coluna tipo para diferenciar adições de retiradas
    ALTER TABLE creditos_cliente 
    ADD COLUMN IF NOT EXISTS tipo VARCHAR(20) DEFAULT 'adicao' CHECK (tipo IN ('adicao', 'retirada'));

    -- Remove a constraint que não permite valores negativos
    ALTER TABLE creditos_cliente 
    DROP CONSTRAINT IF EXISTS creditos_cliente_valor_total_check;

    -- Adiciona nova constraint que permite qualquer valor (positivo ou negativo)
    ALTER TABLE creditos_cliente 
    ADD CONSTRAINT creditos_cliente_valor_total_check CHECK (valor_total <> 0);

    -- Comentário
    COMMENT ON COLUMN creditos_cliente.tipo IS 'Tipo de movimentação: adicao (crédito gerado) ou retirada (crédito removido)';
    COMMENT ON TABLE creditos_cliente IS 'Créditos e retiradas do cliente - Atualizado em 13/11/2025';
