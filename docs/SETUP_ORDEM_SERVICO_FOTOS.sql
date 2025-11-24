-- =====================================================
-- SETUP: SISTEMA DE FOTOS PARA ORDENS DE SERVIÇO
-- =====================================================

-- 1. Criar tabela de fotos de ordem de serviço
CREATE TABLE IF NOT EXISTS ordem_servico_fotos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_ordem_servico UUID NOT NULL REFERENCES ordem_servico(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  is_principal BOOLEAN DEFAULT FALSE,
  ordem INTEGER DEFAULT 0,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  criado_por UUID REFERENCES auth.users(id),
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  atualizado_por UUID REFERENCES auth.users(id)
);

-- 2. Criar índices
CREATE INDEX IF NOT EXISTS idx_os_fotos_ordem_servico ON ordem_servico_fotos(id_ordem_servico);
CREATE INDEX IF NOT EXISTS idx_os_fotos_principal ON ordem_servico_fotos(is_principal);
CREATE INDEX IF NOT EXISTS idx_os_fotos_ordem ON ordem_servico_fotos(ordem);

-- 3. Habilitar RLS (Row Level Security)
ALTER TABLE ordem_servico_fotos ENABLE ROW LEVEL SECURITY;

-- 4. Criar políticas de segurança
-- Permitir leitura para todos autenticados
CREATE POLICY "Permitir leitura de fotos de OS para usuários autenticados"
  ON ordem_servico_fotos
  FOR SELECT
  TO authenticated
  USING (true);

-- Permitir inserção para usuários autenticados
CREATE POLICY "Permitir inserção de fotos de OS para usuários autenticados"
  ON ordem_servico_fotos
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Permitir atualização para usuários autenticados
CREATE POLICY "Permitir atualização de fotos de OS para usuários autenticados"
  ON ordem_servico_fotos
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Permitir exclusão para usuários autenticados
CREATE POLICY "Permitir exclusão de fotos de OS para usuários autenticados"
  ON ordem_servico_fotos
  FOR DELETE
  TO authenticated
  USING (true);

-- 5. Trigger para atualizar timestamp
CREATE OR REPLACE FUNCTION atualizar_timestamp_os_fotos()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_atualizar_timestamp_os_fotos
  BEFORE UPDATE ON ordem_servico_fotos
  FOR EACH ROW
  EXECUTE FUNCTION atualizar_timestamp_os_fotos();

-- 6. Trigger para garantir apenas uma foto principal por OS
CREATE OR REPLACE FUNCTION garantir_uma_foto_principal_os()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_principal = TRUE THEN
    -- Remover is_principal das outras fotos da mesma OS
    UPDATE ordem_servico_fotos
    SET is_principal = FALSE
    WHERE id_ordem_servico = NEW.id_ordem_servico
      AND id != NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_garantir_uma_foto_principal_os
  BEFORE INSERT OR UPDATE ON ordem_servico_fotos
  FOR EACH ROW
  EXECUTE FUNCTION garantir_uma_foto_principal_os();

-- 7. Verificar se foi criado
SELECT 
  'Tabela ordem_servico_fotos criada com sucesso!' as status,
  count(*) as total_colunas
FROM information_schema.columns
WHERE table_name = 'ordem_servico_fotos';

-- =====================================================
-- INSTRUÇÕES
-- =====================================================
-- 1. Execute este script no Supabase SQL Editor
-- 2. Configure o Storage Bucket 'ordem-servico-fotos' no Supabase Storage
-- 3. Configure as políticas de storage para permitir upload/leitura
-- =====================================================
