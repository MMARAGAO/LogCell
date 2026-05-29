-- Adicionar coluna observacao na tabela pagamentos_venda
-- Necessário para armazenar detalhes dos aparelhos de troca
ALTER TABLE pagamentos_venda ADD COLUMN IF NOT EXISTS observacao TEXT;
