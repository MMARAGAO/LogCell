-- =====================================================
-- TABELA: historico_estoque
-- =====================================================
-- Registra todas as movimentações de estoque

CREATE TABLE IF NOT EXISTS historico_estoque (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Relacionamentos
  id_produto UUID NOT NULL REFERENCES produtos(id) ON DELETE CASCADE,
  id_loja UUID NOT NULL REFERENCES lojas(id) ON DELETE CASCADE,
  id_ordem_servico UUID REFERENCES ordem_servico(id) ON DELETE SET NULL,
  
  -- Dados da movimentação
  tipo_movimentacao VARCHAR(50) NOT NULL, -- 'entrada', 'saida', 'ajuste', 'devolucao', 'transferencia'
  quantidade INTEGER NOT NULL,
  quantidade_anterior INTEGER NOT NULL,
  quantidade_nova INTEGER NOT NULL,
  
  -- Detalhes
  motivo TEXT,
  observacoes TEXT,
  
  -- Auditoria
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  criado_por UUID REFERENCES auth.users(id)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_historico_estoque_produto ON historico_estoque(id_produto);
CREATE INDEX IF NOT EXISTS idx_historico_estoque_loja ON historico_estoque(id_loja);
CREATE INDEX IF NOT EXISTS idx_historico_estoque_os ON historico_estoque(id_ordem_servico);
CREATE INDEX IF NOT EXISTS idx_historico_estoque_tipo ON historico_estoque(tipo_movimentacao);
CREATE INDEX IF NOT EXISTS idx_historico_estoque_criado_em ON historico_estoque(criado_em DESC);

-- Comentários
COMMENT ON TABLE historico_estoque IS 'Histórico de todas as movimentações de estoque';
COMMENT ON COLUMN historico_estoque.tipo_movimentacao IS 'Tipo: entrada, saida, ajuste, devolucao, transferencia';
COMMENT ON COLUMN historico_estoque.quantidade IS 'Quantidade movimentada (positivo ou negativo)';

-- =====================================================
-- RLS (Row Level Security)
-- =====================================================

ALTER TABLE historico_estoque ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso
DROP POLICY IF EXISTS "Usuários autenticados podem ver histórico" ON historico_estoque;
DROP POLICY IF EXISTS "Usuários autenticados podem criar registros de histórico" ON historico_estoque;

CREATE POLICY "Usuários autenticados podem ver histórico"
  ON historico_estoque FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuários autenticados podem criar registros de histórico"
  ON historico_estoque FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- =====================================================
-- HABILITAR REALTIME
-- =====================================================

ALTER PUBLICATION supabase_realtime ADD TABLE historico_estoque;

-- =====================================================
-- FUNÇÃO: Registrar movimentação de estoque
-- =====================================================

CREATE OR REPLACE FUNCTION registrar_movimentacao_estoque(
  p_id_produto UUID,
  p_id_loja UUID,
  p_tipo_movimentacao VARCHAR,
  p_quantidade INTEGER,
  p_quantidade_anterior INTEGER,
  p_quantidade_nova INTEGER,
  p_motivo TEXT DEFAULT NULL,
  p_observacoes TEXT DEFAULT NULL,
  p_id_ordem_servico UUID DEFAULT NULL,
  p_criado_por UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_historico_id UUID;
BEGIN
  INSERT INTO historico_estoque (
    id_produto,
    id_loja,
    tipo_movimentacao,
    quantidade,
    quantidade_anterior,
    quantidade_nova,
    motivo,
    observacoes,
    id_ordem_servico,
    criado_por
  ) VALUES (
    p_id_produto,
    p_id_loja,
    p_tipo_movimentacao,
    p_quantidade,
    p_quantidade_anterior,
    p_quantidade_nova,
    p_motivo,
    p_observacoes,
    p_id_ordem_servico,
    p_criado_por
  )
  RETURNING id INTO v_historico_id;
  
  RETURN v_historico_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- VERIFICAR TABELA CRIADA
-- =====================================================

SELECT 
  table_name,
  (SELECT COUNT(*) FROM historico_estoque) as total_registros
FROM information_schema.tables 
WHERE table_name = 'historico_estoque';
