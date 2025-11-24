-- =====================================================
-- DIAGNÓSTICO FINAL - VERIFICAR DADOS
-- =====================================================

-- 1. Verificar se há registros duplicados
SELECT 
  usuario_id, 
  COUNT(*) as total,
  array_agg(id) as ids
FROM public.permissoes
GROUP BY usuario_id
HAVING COUNT(*) > 1;

-- 2. Ver TODOS os dados da tabela
SELECT 
  id,
  usuario_id,
  jsonb_array_length(permissoes) as total_permissoes,
  criado_em,
  atualizado_em
FROM public.permissoes
ORDER BY criado_em DESC;

-- 3. Verificar constraints
SELECT 
  constraint_name, 
  constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'permissoes' 
  AND table_schema = 'public';

-- 4. Verificar índices
SELECT 
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'permissoes';

-- 5. Tentar o SELECT que está falhando manualmente
-- Substitua o UUID pelo seu usuario_id
SELECT permissoes 
FROM public.permissoes 
WHERE usuario_id = '1c0d76a8-563c-47f4-8583-4a8fcb2a063f';

-- =====================================================
-- SE HOUVER DUPLICADOS NO PASSO 1:
-- Execute o comando abaixo para remover (DESCOMENTE)
-- =====================================================
/*
DELETE FROM public.permissoes p1
WHERE id NOT IN (
  SELECT MIN(id)
  FROM public.permissoes p2
  WHERE p2.usuario_id = p1.usuario_id
);
*/
