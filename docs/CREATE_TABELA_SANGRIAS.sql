-- Tabela de sangrias do caixa
CREATE TABLE IF NOT EXISTS sangrias_caixa (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  caixa_id UUID NOT NULL REFERENCES caixas(id) ON DELETE CASCADE,
  valor DECIMAL(10,2) NOT NULL CHECK (valor > 0),
  motivo TEXT NOT NULL,
  realizado_por UUID NOT NULL REFERENCES usuarios(id),
  criado_em TIMESTAMP DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_sangrias_caixa_id ON sangrias_caixa(caixa_id);
CREATE INDEX IF NOT EXISTS idx_sangrias_criado_em ON sangrias_caixa(criado_em);

-- RLS Policies
ALTER TABLE sangrias_caixa ENABLE ROW LEVEL SECURITY;

-- Policy para leitura (usuários autenticados)
CREATE POLICY "Usuários autenticados podem ler sangrias"
  ON sangrias_caixa
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy para inserção (usuários autenticados)
CREATE POLICY "Usuários autenticados podem criar sangrias"
  ON sangrias_caixa
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy para atualização (usuários autenticados)
CREATE POLICY "Usuários autenticados podem atualizar sangrias"
  ON sangrias_caixa
  FOR UPDATE
  TO authenticated
  USING (true);

-- Comentários
COMMENT ON TABLE sangrias_caixa IS 'Registra todas as sangrias (retiradas de dinheiro) do caixa';
COMMENT ON COLUMN sangrias_caixa.valor IS 'Valor retirado do caixa';
COMMENT ON COLUMN sangrias_caixa.motivo IS 'Motivo da sangria (ex: pagamento fornecedor, despesa)';
