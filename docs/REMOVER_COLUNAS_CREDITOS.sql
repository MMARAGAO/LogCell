-- =====================================================
-- SCRIPT PARA CORRIGIR ESTRUTURA DA TABELA creditos_cliente
-- =====================================================

-- Remove a tabela existente e recria com a estrutura correta
DROP TABLE IF EXISTS creditos_cliente CASCADE;

-- Cria a tabela com a estrutura correta
CREATE TABLE creditos_cliente (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID NOT NULL REFERENCES clientes(id),
  venda_origem_id UUID REFERENCES vendas(id),
  devolucao_id UUID REFERENCES devolucoes_venda(id),
  valor_total DECIMAL(10,2) NOT NULL CHECK (valor_total > 0),
  valor_utilizado DECIMAL(10,2) DEFAULT 0 CHECK (valor_utilizado >= 0),
  saldo DECIMAL(10,2) NOT NULL CHECK (saldo >= 0),
  motivo TEXT,
  gerado_por UUID NOT NULL REFERENCES usuarios(id),
  criado_em TIMESTAMP DEFAULT NOW()
);

-- Cria índices
CREATE INDEX IF NOT EXISTS idx_creditos_cliente ON creditos_cliente(cliente_id);
CREATE INDEX IF NOT EXISTS idx_creditos_saldo ON creditos_cliente(saldo) WHERE saldo > 0;

-- Habilita RLS
ALTER TABLE creditos_cliente ENABLE ROW LEVEL SECURITY;

-- Remove políticas antigas
DROP POLICY IF EXISTS "Usuários podem ver créditos" ON creditos_cliente;
DROP POLICY IF EXISTS "Usuários podem criar créditos" ON creditos_cliente;
DROP POLICY IF EXISTS "Sistema pode atualizar créditos" ON creditos_cliente;

-- Cria políticas
CREATE POLICY "Usuários podem ver créditos"
  ON creditos_cliente FOR SELECT
  USING (true);

CREATE POLICY "Usuários podem criar créditos"
  ON creditos_cliente FOR INSERT
  WITH CHECK (gerado_por = auth.uid());

CREATE POLICY "Sistema pode atualizar créditos"
  ON creditos_cliente FOR UPDATE
  USING (true);

-- Comentário
COMMENT ON TABLE creditos_cliente IS 'Créditos gerados por devoluções para uso futuro - Atualizado em 13/11/2025';

