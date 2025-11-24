-- =====================================================
-- FIX: Adicionar colunas faltantes na historico_estoque
-- =====================================================

-- Adicionar coluna id_ordem_servico se não existir
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'historico_estoque' 
    AND column_name = 'id_ordem_servico'
  ) THEN
    ALTER TABLE historico_estoque 
    ADD COLUMN id_ordem_servico UUID REFERENCES ordem_servico(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Adicionar coluna tipo_movimentacao se não existir
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'historico_estoque' 
    AND column_name = 'tipo_movimentacao'
  ) THEN
    ALTER TABLE historico_estoque 
    ADD COLUMN tipo_movimentacao VARCHAR(50) NOT NULL DEFAULT 'ajuste';
  END IF;
END $$;

-- Adicionar coluna quantidade_anterior se não existir
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'historico_estoque' 
    AND column_name = 'quantidade_anterior'
  ) THEN
    ALTER TABLE historico_estoque 
    ADD COLUMN quantidade_anterior INTEGER NOT NULL DEFAULT 0;
  END IF;
END $$;

-- Adicionar coluna quantidade_nova se não existir
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'historico_estoque' 
    AND column_name = 'quantidade_nova'
  ) THEN
    ALTER TABLE historico_estoque 
    ADD COLUMN quantidade_nova INTEGER NOT NULL DEFAULT 0;
  END IF;
END $$;

-- Adicionar coluna motivo se não existir
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'historico_estoque' 
    AND column_name = 'motivo'
  ) THEN
    ALTER TABLE historico_estoque 
    ADD COLUMN motivo TEXT;
  END IF;
END $$;

-- Adicionar coluna observacoes se não existir
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'historico_estoque' 
    AND column_name = 'observacoes'
  ) THEN
    ALTER TABLE historico_estoque 
    ADD COLUMN observacoes TEXT;
  END IF;
END $$;

-- Criar índices se não existirem
CREATE INDEX IF NOT EXISTS idx_historico_estoque_os ON historico_estoque(id_ordem_servico);
CREATE INDEX IF NOT EXISTS idx_historico_estoque_tipo ON historico_estoque(tipo_movimentacao);

-- Adicionar comentários
COMMENT ON COLUMN historico_estoque.tipo_movimentacao IS 'Tipo: entrada, saida, ajuste, devolucao, transferencia';
COMMENT ON COLUMN historico_estoque.id_ordem_servico IS 'OS relacionada à movimentação (opcional)';

-- =====================================================
-- VERIFICAR ESTRUTURA DA TABELA
-- =====================================================

SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'historico_estoque'
ORDER BY ordinal_position;
