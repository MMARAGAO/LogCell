-- =====================================================
-- CORREÇÃO: Remover Foreign Keys que causam problemas
-- =====================================================
-- Execute este SQL no Supabase SQL Editor para corrigir
-- as foreign keys da tabela ordem_servico

-- 1. Remover foreign keys existentes (se houver)
ALTER TABLE ordem_servico 
  DROP CONSTRAINT IF EXISTS ordem_servico_tecnico_responsavel_fkey,
  DROP CONSTRAINT IF EXISTS ordem_servico_criado_por_fkey,
  DROP CONSTRAINT IF EXISTS ordem_servico_atualizado_por_fkey;

-- 2. Alterar colunas para UUID simples (sem FK)
ALTER TABLE ordem_servico 
  ALTER COLUMN tecnico_responsavel DROP NOT NULL,
  ALTER COLUMN criado_por DROP NOT NULL,
  ALTER COLUMN atualizado_por DROP NOT NULL;

-- 3. Verificar a estrutura
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'ordem_servico'
  AND column_name IN ('tecnico_responsavel', 'criado_por', 'atualizado_por');

-- =====================================================
-- RESULTADO ESPERADO:
-- =====================================================
-- Todas as 3 colunas devem ser:
-- - data_type: uuid
-- - is_nullable: YES
-- - Sem foreign keys para auth.users
