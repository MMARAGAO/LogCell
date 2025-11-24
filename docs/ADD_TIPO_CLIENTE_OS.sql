-- Adicionar campo tipo_cliente na tabela ordem_servico
-- Este campo indica se o cliente é lojista ou consumidor final

-- 1. Adicionar coluna tipo_cliente
ALTER TABLE ordem_servico
ADD COLUMN IF NOT EXISTS tipo_cliente VARCHAR(20) DEFAULT 'consumidor_final';

-- 2. Adicionar comentário na coluna
COMMENT ON COLUMN ordem_servico.tipo_cliente IS 'Tipo de cliente: lojista ou consumidor_final';

-- 3. Atualizar registros existentes (opcional - todos serão consumidor_final por padrão)
-- Se você quiser atualizar alguns registros específicos:
-- UPDATE ordem_servico SET tipo_cliente = 'lojista' WHERE ...;

-- 4. Verificar a alteração
SELECT 
  column_name, 
  data_type, 
  column_default,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'ordem_servico' AND column_name = 'tipo_cliente';
