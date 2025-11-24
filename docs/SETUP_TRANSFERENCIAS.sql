-- ============================================
-- ADICIONAR TIPOS DE MOVIMENTAÇÃO DE TRANSFERÊNCIA
-- NO HISTÓRICO DE ESTOQUE
-- ============================================

-- Este script adiciona suporte para transferências entre lojas
-- no sistema de histórico de estoque.

-- ============================================
-- 1. VERIFICAR ESTRUTURA ATUAL
-- ============================================

-- Verificar se a coluna tipo_movimentacao existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'historico_estoque' 
        AND column_name = 'tipo_movimentacao'
    ) THEN
        -- Se não existir, adicionar a coluna
        ALTER TABLE historico_estoque 
        ADD COLUMN tipo_movimentacao VARCHAR(50);
        
        RAISE NOTICE '✅ Coluna tipo_movimentacao adicionada com sucesso!';
    ELSE
        RAISE NOTICE '✅ Coluna tipo_movimentacao já existe!';
    END IF;
END $$;

-- ============================================
-- 2. CRIAR CONSTRAINT PARA VALIDAÇÃO (OPCIONAL)
-- ============================================

-- Adicionar constraint para validar valores permitidos
-- Comentar esta seção se preferir não ter validação estrita

DO $$
BEGIN
    -- Remover constraint antiga se existir
    ALTER TABLE historico_estoque 
    DROP CONSTRAINT IF EXISTS check_tipo_movimentacao;
    
    -- Adicionar constraint com novos tipos
    ALTER TABLE historico_estoque
    ADD CONSTRAINT check_tipo_movimentacao 
    CHECK (tipo_movimentacao IN (
        'entrada',
        'saida',
        'ajuste',
        'devolucao',
        'transferencia',
        'transferencia_saida',
        'transferencia_entrada',
        'quebra'
    ));
    
    RAISE NOTICE '✅ Constraint check_tipo_movimentacao criada com sucesso!';
EXCEPTION
    WHEN duplicate_object THEN
        RAISE NOTICE '⚠️ Constraint já existe!';
    WHEN OTHERS THEN
        RAISE NOTICE '⚠️ Erro ao criar constraint: %', SQLERRM;
END $$;

-- ============================================
-- 3. CRIAR ÍNDICE PARA PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_historico_estoque_tipo_movimentacao 
ON historico_estoque(tipo_movimentacao);

-- ============================================
-- 4. ADICIONAR COMENTÁRIOS
-- ============================================

COMMENT ON COLUMN historico_estoque.tipo_movimentacao IS 
'Tipo de movimentação: entrada, saida, ajuste, devolucao, transferencia, transferencia_saida, transferencia_entrada, quebra';

-- ============================================
-- 5. VERIFICAÇÃO FINAL
-- ============================================

-- Verificar estrutura da tabela
SELECT 
    column_name,
    data_type,
    character_maximum_length,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'historico_estoque'
AND column_name = 'tipo_movimentacao';

-- Verificar índices
SELECT 
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'historico_estoque'
AND indexname LIKE '%tipo_movimentacao%';

-- Mensagem de sucesso
DO $$ 
BEGIN 
    RAISE NOTICE '==============================================';
    RAISE NOTICE '✅ Sistema de Transferências Configurado!';
    RAISE NOTICE '==============================================';
    RAISE NOTICE '';
    RAISE NOTICE '📊 Tipos de movimentação suportados:';
    RAISE NOTICE '  - entrada: Entrada de produtos no estoque';
    RAISE NOTICE '  - saida: Saída de produtos do estoque';
    RAISE NOTICE '  - ajuste: Ajuste manual de estoque';
    RAISE NOTICE '  - devolucao: Devolução de produtos';
    RAISE NOTICE '  - quebra: Quebra/perda de produtos';
    RAISE NOTICE '  - transferencia_saida: Saída por transferência';
    RAISE NOTICE '  - transferencia_entrada: Entrada por transferência';
    RAISE NOTICE '';
    RAISE NOTICE '🔧 Próximos passos:';
    RAISE NOTICE '  1. Acesse /sistema/transferencias no frontend';
    RAISE NOTICE '  2. Selecione loja origem e destino';
    RAISE NOTICE '  3. Adicione produtos para transferir';
    RAISE NOTICE '  4. Confirme a transferência';
    RAISE NOTICE '';
    RAISE NOTICE '✅ Setup concluído com sucesso!';
    RAISE NOTICE '==============================================';
END $$;
