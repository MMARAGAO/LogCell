-- =====================================================
-- FIX: Estrutura da tabela ordem_servico_fotos
-- =====================================================
-- Remove referências a colunas que não existem
-- =====================================================

-- 1. Verificar estrutura atual
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'ordem_servico_fotos'
ORDER BY ordinal_position;

-- 2. Estrutura esperada (mínima funcional)
-- =====================================================
-- id UUID (PK)
-- id_ordem_servico UUID (FK)
-- url TEXT
-- ordem INTEGER
-- is_principal BOOLEAN
-- criado_em TIMESTAMP
-- atualizado_em TIMESTAMP
-- =====================================================

-- 3. Se necessário, adicionar colunas faltantes
-- =====================================================

-- Adicionar coluna 'ordem' se não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'ordem_servico_fotos' 
    AND column_name = 'ordem'
  ) THEN
    ALTER TABLE ordem_servico_fotos 
    ADD COLUMN ordem INTEGER DEFAULT 0;
    
    RAISE NOTICE 'Coluna "ordem" adicionada';
  END IF;
END $$;

-- Adicionar coluna 'is_principal' se não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'ordem_servico_fotos' 
    AND column_name = 'is_principal'
  ) THEN
    ALTER TABLE ordem_servico_fotos 
    ADD COLUMN is_principal BOOLEAN DEFAULT FALSE;
    
    RAISE NOTICE 'Coluna "is_principal" adicionada';
  END IF;
END $$;

-- Adicionar coluna 'criado_em' se não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'ordem_servico_fotos' 
    AND column_name = 'criado_em'
  ) THEN
    ALTER TABLE ordem_servico_fotos 
    ADD COLUMN criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
    
    RAISE NOTICE 'Coluna "criado_em" adicionada';
  END IF;
END $$;

-- Adicionar coluna 'atualizado_em' se não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'ordem_servico_fotos' 
    AND column_name = 'atualizado_em'
  ) THEN
    ALTER TABLE ordem_servico_fotos 
    ADD COLUMN atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
    
    RAISE NOTICE 'Coluna "atualizado_em" adicionada';
  END IF;
END $$;

-- 4. Verificar estrutura final
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'ordem_servico_fotos'
ORDER BY ordinal_position;

-- =====================================================
-- RESULTADO ESPERADO:
-- =====================================================
-- ✅ Tabela com todas as colunas necessárias
-- ✅ Sem colunas 'criado_por' ou 'atualizado_por'
-- ✅ Sistema pode inserir fotos sem erros
