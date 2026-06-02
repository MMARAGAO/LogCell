-- Adicionar coluna fornecedor_id na tabela aparelhos
ALTER TABLE aparelhos
ADD COLUMN IF NOT EXISTS fornecedor_id UUID REFERENCES fornecedores(id) ON DELETE SET NULL;

-- Índice para busca por fornecedor
CREATE INDEX IF NOT EXISTS idx_aparelhos_fornecedor_id ON aparelhos(fornecedor_id);
