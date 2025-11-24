-- ============================================
-- CONFIGURAÇÃO COMPLETA DO BUCKET DE FOTOS OS
-- EXECUTAR NO SUPABASE SQL EDITOR
-- ============================================

-- PASSO 1: Criar o bucket (se ainda não existe)
INSERT INTO storage.buckets (id, name, public)
VALUES ('ordem-servico-fotos', 'ordem-servico-fotos', true)
ON CONFLICT (id) DO NOTHING;

-- PASSO 2: Remover políticas antigas usando RLS policies
DROP POLICY IF EXISTS "Permitir leitura pública" ON storage.objects;
DROP POLICY IF EXISTS "Permitir upload para usuários autenticados" ON storage.objects;
DROP POLICY IF EXISTS "Permitir atualização para usuários autenticados" ON storage.objects;
DROP POLICY IF EXISTS "Permitir exclusão para usuários autenticados" ON storage.objects;

-- PASSO 3: Criar políticas RLS no storage.objects

-- Política 1: Permitir SELECT/READ (download de fotos) - PÚBLICO
CREATE POLICY "Permitir leitura pública"
ON storage.objects FOR SELECT
USING (bucket_id = 'ordem-servico-fotos');

-- Política 2: Permitir INSERT/UPLOAD (fazer upload)
CREATE POLICY "Permitir upload para usuários autenticados"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'ordem-servico-fotos');

-- Política 3: Permitir UPDATE (atualizar fotos)
CREATE POLICY "Permitir atualização para usuários autenticados"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'ordem-servico-fotos')
WITH CHECK (bucket_id = 'ordem-servico-fotos');

-- Política 4: Permitir DELETE (deletar fotos)
CREATE POLICY "Permitir exclusão para usuários autenticados"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'ordem-servico-fotos');

-- PASSO 4: Verificar se foi criado corretamente
SELECT 
  'Bucket criado:' as status,
  name,
  public,
  created_at
FROM storage.buckets 
WHERE name = 'ordem-servico-fotos';

-- PASSO 5: Verificar políticas
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE tablename = 'objects' 
  AND policyname LIKE '%ordem-servico-fotos%' 
  OR policyname LIKE '%leitura pública%'
  OR policyname LIKE '%upload%'
  OR policyname LIKE '%exclusão%';

-- ============================================
-- MENSAGEM DE SUCESSO
-- ============================================
-- Se você viu os resultados acima, o bucket está configurado! ✅
-- Agora você pode fazer upload de fotos no sistema.
