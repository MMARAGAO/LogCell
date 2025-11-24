-- =====================================================
-- CRIAR TABELA DE PAGAMENTOS PARA ORDEM DE SERVIÇO
-- =====================================================

-- Tabela para registrar pagamentos recebidos de cada OS
CREATE TABLE IF NOT EXISTS ordem_servico_pagamentos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_ordem_servico UUID NOT NULL REFERENCES ordem_servico(id) ON DELETE CASCADE,
  
  -- Dados do Pagamento
  data_pagamento DATE NOT NULL,
  valor DECIMAL(10, 2) NOT NULL CHECK (valor > 0),
  forma_pagamento VARCHAR(50) NOT NULL, -- dinheiro, cartao_credito, cartao_debito, pix, transferencia, cheque
  observacao TEXT,
  
  -- Auditoria
  criado_em TIMESTAMP DEFAULT NOW(),
  criado_por UUID REFERENCES auth.users(id),
  
  -- Constraints
  CONSTRAINT valid_forma_pagamento CHECK (
    forma_pagamento IN ('dinheiro', 'cartao_credito', 'cartao_debito', 'pix', 'transferencia', 'cheque')
  )
);

-- Índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_pagamentos_os ON ordem_servico_pagamentos(id_ordem_servico);
CREATE INDEX IF NOT EXISTS idx_pagamentos_data ON ordem_servico_pagamentos(data_pagamento);

-- RLS (Row Level Security)
ALTER TABLE ordem_servico_pagamentos ENABLE ROW LEVEL SECURITY;

-- Policy: Usuários autenticados podem visualizar pagamentos
CREATE POLICY "Usuários podem visualizar pagamentos"
  ON ordem_servico_pagamentos
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Usuários autenticados podem inserir pagamentos
CREATE POLICY "Usuários podem inserir pagamentos"
  ON ordem_servico_pagamentos
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy: Usuários autenticados podem deletar pagamentos
CREATE POLICY "Usuários podem deletar pagamentos"
  ON ordem_servico_pagamentos
  FOR DELETE
  TO authenticated
  USING (true);

-- Comentários
COMMENT ON TABLE ordem_servico_pagamentos IS 'Registro de pagamentos recebidos para cada ordem de serviço';
COMMENT ON COLUMN ordem_servico_pagamentos.forma_pagamento IS 'Forma de pagamento: dinheiro, cartao_credito, cartao_debito, pix, transferencia, cheque';
COMMENT ON COLUMN ordem_servico_pagamentos.observacao IS 'Observações sobre o pagamento, como número de parcelas';
