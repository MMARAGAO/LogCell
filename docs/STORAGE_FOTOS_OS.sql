-- =====================================================
-- STORAGE: POLÍTICAS PARA FOTOS DE ORDEM DE SERVIÇO
-- =====================================================
-- Execute este script no Supabase SQL Editor para
-- garantir que o bucket e as políticas estão corretas
-- =====================================================

-- 1. Verificar se bucket existe
SELECT 
  name,
  public,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets
WHERE name = 'ordem-servico-fotos';

-- =====================================================
-- INSTRUÇÕES PARA CRIAR O BUCKET (se não existir):
-- =====================================================
-- 1. Vá em "Storage" no Supabase Dashboard
-- 2. Clique em "New bucket"
-- 3. Nome: ordem-servico-fotos
-- 4. Public bucket: ✅ SIM (marcar)
-- 5. File size limit: 5MB
-- 6. Allowed MIME types: image/jpeg, image/png, image/gif, image/webp
-- 7. Clique em "Create bucket"
-- =====================================================

-- =====================================================
-- 2. STORAGE POLICIES (EXECUTE APÓS CRIAR O BUCKET)
-- =====================================================

-- Policy: Usuários autenticados podem fazer UPLOAD
CREATE POLICY IF NOT EXISTS "Autenticados podem fazer upload em ordem-servico-fotos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'ordem-servico-fotos');

-- Policy: Todos podem VER (public bucket)
CREATE POLICY IF NOT EXISTS "Público pode ver fotos de OS"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'ordem-servico-fotos');

-- Policy: Usuários autenticados podem DELETAR suas fotos
CREATE POLICY IF NOT EXISTS "Autenticados podem deletar fotos de OS"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'ordem-servico-fotos');

-- Policy: Usuários autenticados podem ATUALIZAR
CREATE POLICY IF NOT EXISTS "Autenticados podem atualizar fotos de OS"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'ordem-servico-fotos');

-- =====================================================
-- 3. VERIFICAR POLÍTICAS
-- =====================================================
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'objects' 
  AND schemaname = 'storage'
  AND policyname LIKE '%ordem-servico-fotos%';

-- =====================================================
-- 4. RLS NA TABELA ordem_servico_fotos
-- =====================================================
-- Garantir que RLS está ativo
ALTER TABLE ordem_servico_fotos ENABLE ROW LEVEL SECURITY;

-- Limpar políticas antigas (se houver)
DROP POLICY IF EXISTS "Fotos OS visíveis para usuários autenticados" ON ordem_servico_fotos;
DROP POLICY IF EXISTS "Usuários autenticados podem adicionar fotos" ON ordem_servico_fotos;
DROP POLICY IF EXISTS "Usuários autenticados podem atualizar fotos" ON ordem_servico_fotos;
DROP POLICY IF EXISTS "Usuários autenticados podem deletar fotos" ON ordem_servico_fotos;

-- Criar políticas
CREATE POLICY "Autenticados podem ver fotos OS"
  ON ordem_servico_fotos FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Autenticados podem inserir fotos OS"
  ON ordem_servico_fotos FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Autenticados podem atualizar fotos OS"
  ON ordem_servico_fotos FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Autenticados podem deletar fotos OS"
  ON ordem_servico_fotos FOR DELETE
  TO authenticated
  USING (true);

-- =====================================================
-- 5. VERIFICAR ESTRUTURA DA TABELA
-- =====================================================
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'ordem_servico_fotos'
ORDER BY ordinal_position;

-- Estrutura esperada:
-- ✅ id (uuid)
-- ✅ id_ordem_servico (uuid)
-- ✅ url (text)
-- ✅ ordem (integer)
-- ✅ is_principal (boolean)
-- ✅ criado_em (timestamp with time zone)
-- ✅ atualizado_em (timestamp with time zone)

-- =====================================================
-- 6. ADICIONAR COLUNAS SE NECESSÁRIO
-- =====================================================
-- Execute o script: FIX_ESTRUTURA_FOTOS_OS.sql
-- se alguma coluna estiver faltando

-- =====================================================
-- RESULTADO ESPERADO:
-- =====================================================
-- ✅ Bucket 'ordem-servico-fotos' existe e é público
-- ✅ 4 políticas de storage criadas
-- ✅ RLS ativo na tabela ordem_servico_fotos
-- ✅ 4 políticas RLS criadas
-- ✅ Técnicos podem fazer upload, ver e deletar fotos
-- ✅ Tabela com estrutura correta (7 colunas)
