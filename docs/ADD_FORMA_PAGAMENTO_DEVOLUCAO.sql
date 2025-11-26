-- =====================================================
-- ADICIONAR FORMA DE PAGAMENTO EM DEVOLUÇÕES
-- =====================================================
-- Adiciona o campo forma_pagamento na tabela devolucoes_venda

-- Adicionar coluna forma_pagamento
ALTER TABLE devolucoes_venda
ADD COLUMN IF NOT EXISTS forma_pagamento VARCHAR;

-- Adicionar constraint para validar formas de pagamento permitidas
ALTER TABLE devolucoes_venda
ADD CONSTRAINT devolucoes_venda_forma_pagamento_check 
CHECK (forma_pagamento IN ('dinheiro', 'pix', 'debito', 'credito', 'credito_loja'));

-- Comentário
COMMENT ON COLUMN devolucoes_venda.forma_pagamento IS 
'Forma de pagamento da devolução ao cliente: dinheiro, pix, debito, credito ou credito_loja';

-- Verificar estrutura
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'devolucoes_venda'
  AND table_schema = 'public'
ORDER BY ordinal_position;
