-- ============================================
-- EXECUTAR NO SUPABASE SQL EDITOR
-- Sistema de Fotos para Ordem de Serviço
-- ============================================

-- 1. Criar tabela ordem_servico_fotos
CREATE TABLE IF NOT EXISTS ordem_servico_fotos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  id_ordem_servico UUID NOT NULL REFERENCES ordem_servico(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  ordem INTEGER DEFAULT 0,
  is_principal BOOLEAN DEFAULT false,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Índices
CREATE INDEX IF NOT EXISTS idx_ordem_servico_fotos_id_os ON ordem_servico_fotos(id_ordem_servico);
CREATE INDEX IF NOT EXISTS idx_ordem_servico_fotos_principal ON ordem_servico_fotos(id_ordem_servico, is_principal);

-- 3. Trigger para atualizado_em
CREATE OR REPLACE FUNCTION update_ordem_servico_fotos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_ordem_servico_fotos_timestamp
  BEFORE UPDATE ON ordem_servico_fotos
  FOR EACH ROW
  EXECUTE FUNCTION update_ordem_servico_fotos_updated_at();

-- 4. Trigger para garantir apenas uma foto principal por OS
CREATE OR REPLACE FUNCTION verificar_foto_principal_os()
RETURNS TRIGGER AS $$
BEGIN
  -- Se está marcando como principal
  IF NEW.is_principal = true THEN
    -- Remove o flag principal de todas as outras fotos desta OS
    UPDATE ordem_servico_fotos
    SET is_principal = false
    WHERE id_ordem_servico = NEW.id_ordem_servico
      AND id != NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_verificar_foto_principal_os
  BEFORE INSERT OR UPDATE ON ordem_servico_fotos
  FOR EACH ROW
  EXECUTE FUNCTION verificar_foto_principal_os();

-- 5. RLS Policies
ALTER TABLE ordem_servico_fotos ENABLE ROW LEVEL SECURITY;

-- Policy para SELECT
DROP POLICY IF EXISTS "Fotos OS visíveis para usuários autenticados" ON ordem_servico_fotos;
CREATE POLICY "Fotos OS visíveis para usuários autenticados"
  ON ordem_servico_fotos FOR SELECT
  TO authenticated
  USING (true);

-- Policy para INSERT
DROP POLICY IF EXISTS "Usuários autenticados podem adicionar fotos" ON ordem_servico_fotos;
CREATE POLICY "Usuários autenticados podem adicionar fotos"
  ON ordem_servico_fotos FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy para UPDATE
DROP POLICY IF EXISTS "Usuários autenticados podem atualizar fotos" ON ordem_servico_fotos;
CREATE POLICY "Usuários autenticados podem atualizar fotos"
  ON ordem_servico_fotos FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policy para DELETE
DROP POLICY IF EXISTS "Usuários autenticados podem deletar fotos" ON ordem_servico_fotos;
CREATE POLICY "Usuários autenticados podem deletar fotos"
  ON ordem_servico_fotos FOR DELETE
  TO authenticated
  USING (true);

-- ============================================
-- CONFIGURAR NO SUPABASE STORAGE:
-- ============================================
-- 1. Criar bucket "ordem-servico-fotos" (público ou privado conforme preferência)
-- 2. Configurar políticas de storage:
--    - SELECT: Usuários autenticados podem ler
--    - INSERT: Usuários autenticados podem fazer upload
--    - DELETE: Usuários autenticados podem deletar
-- ============================================
