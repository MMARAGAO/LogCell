-- =====================================================
-- APENAS REABILITAR RLS
-- =====================================================
-- As políticas já estão criadas, só falta reabilitar
-- =====================================================

ALTER TABLE public.permissoes ENABLE ROW LEVEL SECURITY;

-- Verificar
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename = 'permissoes';
