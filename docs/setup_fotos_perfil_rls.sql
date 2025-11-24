-- ============================================
-- CONFIGURAÇÃO DE RLS PARA FOTOS DE PERFIL
-- ============================================

-- 1. Habilitar RLS na tabela fotos_perfil
ALTER TABLE fotos_perfil ENABLE ROW LEVEL SECURITY;

-- 2. Remover políticas antigas se existirem
DROP POLICY IF EXISTS "Usuários podem visualizar suas próprias fotos" ON fotos_perfil;
DROP POLICY IF EXISTS "Usuários podem inserir suas próprias fotos" ON fotos_perfil;
DROP POLICY IF EXISTS "Usuários podem atualizar suas próprias fotos" ON fotos_perfil;
DROP POLICY IF EXISTS "Usuários podem deletar suas próprias fotos" ON fotos_perfil;

-- 3. Criar políticas para SELECT (visualizar)
CREATE POLICY "Usuários podem visualizar suas próprias fotos"
ON fotos_perfil
FOR SELECT
TO authenticated
USING (usuario_id = auth.uid());

-- 4. Criar políticas para INSERT (inserir)
CREATE POLICY "Usuários podem inserir suas próprias fotos"
ON fotos_perfil
FOR INSERT
TO authenticated
WITH CHECK (usuario_id = auth.uid());

-- 5. Criar políticas para UPDATE (atualizar)
CREATE POLICY "Usuários podem atualizar suas próprias fotos"
ON fotos_perfil
FOR UPDATE
TO authenticated
USING (usuario_id = auth.uid())
WITH CHECK (usuario_id = auth.uid());

-- 6. Criar políticas para DELETE (deletar)
CREATE POLICY "Usuários podem deletar suas próprias fotos"
ON fotos_perfil
FOR DELETE
TO authenticated
USING (usuario_id = auth.uid());

-- ============================================
-- CONFIGURAÇÃO DO BUCKET DE STORAGE
-- ============================================

-- IMPORTANTE: Execute estes comandos no Supabase Dashboard
-- Storage > fotos_perfil > Policies

-- 7. Política para UPLOAD (INSERT) no bucket
-- Nome: "Usuários podem fazer upload de suas fotos"
-- Allowed operation: INSERT
-- Policy definition:
/*
(bucket_id = 'fotos_perfil'::text) 
AND (auth.role() = 'authenticated'::text)
AND ((storage.foldername(name))[1] = auth.uid()::text)
*/

-- 8. Política para VISUALIZAR (SELECT) no bucket
-- Nome: "Usuários podem visualizar suas fotos"
-- Allowed operation: SELECT
-- Policy definition:
/*
(bucket_id = 'fotos_perfil'::text) 
AND (auth.role() = 'authenticated'::text)
AND ((storage.foldername(name))[1] = auth.uid()::text)
*/

-- 9. Política para DELETAR (DELETE) no bucket
-- Nome: "Usuários podem deletar suas fotos"
-- Allowed operation: DELETE
-- Policy definition:
/*
(bucket_id = 'fotos_perfil'::text) 
AND (auth.role() = 'authenticated'::text)
AND ((storage.foldername(name))[1] = auth.uid()::text)
*/

-- 10. Política para ATUALIZAR (UPDATE) no bucket
-- Nome: "Usuários podem atualizar suas fotos"
-- Allowed operation: UPDATE
-- Policy definition:
/*
(bucket_id = 'fotos_perfil'::text) 
AND (auth.role() = 'authenticated'::text)
AND ((storage.foldername(name))[1] = auth.uid()::text)
*/

-- ============================================
-- VERIFICAÇÃO
-- ============================================

-- Verificar se as políticas foram criadas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'fotos_perfil';

-- Verificar estrutura da tabela
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns
WHERE table_name = 'fotos_perfil'
ORDER BY ordinal_position;
