-- =====================================================
-- SOLUÇÃO TEMPORÁRIA - DESABILITAR RLS
-- =====================================================
-- Use isso APENAS para testar e confirmar que o RLS é o problema
-- IMPORTANTE: Isso deixa a tabela TOTALMENTE ACESSÍVEL
-- =====================================================

-- PASSO 1: Desabilitar RLS na tabela permissoes
ALTER TABLE public.permissoes DISABLE ROW LEVEL SECURITY;

-- PASSO 2: Verificar se RLS está desabilitado
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename = 'permissoes';
-- Deve retornar rowsecurity = false

-- PASSO 3: Testar acesso (não deve dar erro 500)
SELECT COUNT(*) FROM public.permissoes;

-- =====================================================
-- DEPOIS DE CONFIRMAR QUE FUNCIONA:
-- Execute o script FIX_POLITICAS_RLS_PERMISSOES.sql
-- E depois REABILITE o RLS com o comando abaixo:
-- =====================================================

-- ALTER TABLE public.permissoes ENABLE ROW LEVEL SECURITY;
