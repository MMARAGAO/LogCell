-- ============================================
-- SETUP STORAGE - FOTOS DE PRODUTOS
-- ============================================
-- Este script configura o storage para fotos de produtos
-- ============================================

-- ============================================
-- 1. CRIAR BUCKET (Execute no Supabase Dashboard - Storage)
-- ============================================
-- IMPORTANTE: Este comando deve ser executado no Dashboard do Supabase
-- Storage > Create a new bucket
-- 
-- Nome do bucket: fotos-produtos
-- Public bucket: SIM (marque a opção "Public bucket")
-- 
-- OU execute este INSERT diretamente (se tiver permissão):

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'fotos-produtos',
  'fotos-produtos',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 2. POLÍTICAS DE SEGURANÇA (RLS)
-- ============================================

-- Remover políticas existentes (se houver)
DROP POLICY IF EXISTS "Qualquer um pode ver fotos de produtos" ON storage.objects;
DROP POLICY IF EXISTS "Usuários autenticados podem fazer upload de fotos" ON storage.objects;
DROP POLICY IF EXISTS "Usuários autenticados podem atualizar fotos" ON storage.objects;
DROP POLICY IF EXISTS "Usuários autenticados podem deletar fotos" ON storage.objects;

-- Política 1: Permitir visualização pública
CREATE POLICY "Qualquer um pode ver fotos de produtos"
ON storage.objects FOR SELECT
USING (bucket_id = 'fotos-produtos');

-- Política 2: Permitir upload para usuários autenticados
CREATE POLICY "Usuários autenticados podem fazer upload de fotos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'fotos-produtos' 
  AND (storage.foldername(name))[1] IS NOT NULL
);

-- Política 3: Permitir atualização para usuários autenticados
CREATE POLICY "Usuários autenticados podem atualizar fotos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'fotos-produtos')
WITH CHECK (bucket_id = 'fotos-produtos');

-- Política 4: Permitir exclusão para usuários autenticados
CREATE POLICY "Usuários autenticados podem deletar fotos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'fotos-produtos');

-- ============================================
-- 3. VERIFICAÇÃO
-- ============================================

-- Verificar se o bucket foi criado
SELECT * FROM storage.buckets WHERE id = 'fotos-produtos';

-- Verificar políticas
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE tablename = 'objects' 
  AND schemaname = 'storage'
  AND policyname LIKE '%fotos de produtos%';

-- ============================================
-- FIM DO SCRIPT
-- ============================================
-- Após executar este script:
-- 1. Verifique no Dashboard: Storage > fotos-produtos
-- 2. O bucket deve estar marcado como "Public"
-- 3. Teste fazer upload de uma foto de produto
-- ============================================

-- ============================================
-- OBSERVAÇÕES IMPORTANTES
-- ============================================
-- 
-- ESTRUTURA DE PASTAS:
-- fotos-produtos/
--   └── {produto_id}/
--       ├── foto1.jpg
--       ├── foto2.png
--       └── foto3.webp
--
-- TAMANHO MÁXIMO: 5MB por arquivo
-- TIPOS PERMITIDOS: JPEG, JPG, PNG, WEBP, GIF
--
-- Se o bucket já existe mas dá erro 406:
-- 1. Vá em Storage > fotos-produtos > Configuration
-- 2. Marque "Public bucket"
-- 3. Salve
-- ============================================
