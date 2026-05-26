-- Adiciona coluna bancada à tabela ordem_servico
ALTER TABLE ordem_servico ADD COLUMN IF NOT EXISTS bancada VARCHAR(20) DEFAULT NULL;
