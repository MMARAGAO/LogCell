-- =====================================================
-- DIAGNÓSTICO E CORREÇÃO COMPLETA - ERRO 500
-- =====================================================
-- Execute PASSO A PASSO no SQL Editor do Supabase
-- =====================================================

-- PASSO 1: Verificar se a tabela existe
SELECT 
  table_name, 
  table_schema
FROM information_schema.tables 
WHERE table_name = 'permissoes';

-- PASSO 2: Ver estrutura da tabela
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'permissoes'
ORDER BY ordinal_position;

-- PASSO 3: Verificar dados duplicados (IMPORTANTE!)
SELECT 
  usuario_id, 
  COUNT(*) as total
FROM public.permissoes
GROUP BY usuario_id
HAVING COUNT(*) > 1;

-- PASSO 4: Se houver duplicados, remover mantendo apenas o mais recente
-- DESCOMENTE E EXECUTE SE PASSO 3 RETORNOU REGISTROS:
/*
DELETE FROM public.permissoes p1
WHERE id NOT IN (
  SELECT MAX(id)
  FROM public.permissoes p2
  WHERE p2.usuario_id = p1.usuario_id
);
*/

-- PASSO 5: Verificar constraints existentes
SELECT 
  constraint_name, 
  constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'permissoes' 
  AND table_schema = 'public';

-- PASSO 6: Remover constraint UNIQUE antiga se existir
-- DESCOMENTE E EXECUTE SE NECESSÁRIO:
/*
ALTER TABLE public.permissoes 
DROP CONSTRAINT IF EXISTS permissoes_usuario_id_unique;

ALTER TABLE public.permissoes 
DROP CONSTRAINT IF EXISTS permissoes_usuario_id_key;
*/

-- PASSO 7: Adicionar constraint UNIQUE
ALTER TABLE public.permissoes 
ADD CONSTRAINT permissoes_usuario_id_unique UNIQUE (usuario_id);

-- PASSO 8: Verificar status do RLS
SELECT 
  schemaname, 
  tablename, 
  rowsecurity
FROM pg_tables
WHERE tablename = 'permissoes';

-- PASSO 9: Habilitar RLS
ALTER TABLE public.permissoes ENABLE ROW LEVEL SECURITY;

-- PASSO 10: Remover TODAS as políticas antigas
DO $$ 
DECLARE 
  policy_record RECORD;
BEGIN
  FOR policy_record IN 
    SELECT policyname 
    FROM pg_policies 
    WHERE tablename = 'permissoes'
  LOOP
    EXECUTE 'DROP POLICY IF EXISTS "' || policy_record.policyname || '" ON public.permissoes';
  END LOOP;
END $$;

-- PASSO 11: Criar política PERMISSIVA para SELECT
CREATE POLICY "allow_select_permissoes"
ON public.permissoes
FOR SELECT
TO authenticated
USING (true);

-- PASSO 12: Criar política para INSERT (admins)
CREATE POLICY "allow_insert_permissoes"
ON public.permissoes
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.usuarios
    WHERE id = auth.uid()
    AND email IN ('admin@logcell.com', 'matheusmoxil@gmail.com')
  )
);

-- PASSO 13: Criar política para UPDATE (admins)
CREATE POLICY "allow_update_permissoes"
ON public.permissoes
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.usuarios
    WHERE id = auth.uid()
    AND email IN ('admin@logcell.com', 'matheusmoxil@gmail.com')
  )
);

-- PASSO 14: Criar política para DELETE (admins)
CREATE POLICY "allow_delete_permissoes"
ON public.permissoes
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.usuarios
    WHERE id = auth.uid()
    AND email IN ('admin@logcell.com', 'matheusmoxil@gmail.com')
  )
);

-- PASSO 15: Verificar todas as políticas criadas
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'permissoes'
ORDER BY policyname;

-- PASSO 16: Testar SELECT (não deve dar erro)
SELECT COUNT(*) as total FROM public.permissoes;

-- PASSO 17: Ver todos os dados
SELECT 
  p.id,
  p.usuario_id,
  u.nome,
  u.email,
  jsonb_array_length(p.permissoes) as total_permissoes,
  p.criado_em,
  p.atualizado_em
FROM public.permissoes p
LEFT JOIN public.usuarios u ON u.id = p.usuario_id
ORDER BY p.criado_em DESC;

-- =====================================================
-- SE AINDA DER ERRO 500 APÓS EXECUTAR TUDO:
-- Execute esta opção DRÁSTICA (desabilita RLS temporariamente)
-- =====================================================
-- DESCOMENTE APENAS SE NECESSÁRIO:
/*
ALTER TABLE public.permissoes DISABLE ROW LEVEL SECURITY;
*/

-- =====================================================
-- PARA REABILITAR RLS DEPOIS (quando corrigir):
-- =====================================================
/*
ALTER TABLE public.permissoes ENABLE ROW LEVEL SECURITY;
*/
