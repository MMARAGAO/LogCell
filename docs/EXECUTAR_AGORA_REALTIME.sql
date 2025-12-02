-- =====================================================
-- HABILITAR REALTIME - VERSÃO SIMPLIFICADA
-- =====================================================
-- Execute este script no Supabase Dashboard > SQL Editor
-- =====================================================

-- 1. PERMISSÕES (PRIORITÁRIO)
ALTER TABLE public.permissoes REPLICA IDENTITY FULL;

DO $$
BEGIN
  -- Tentar remover (ignora se não existir)
  BEGIN
    ALTER PUBLICATION supabase_realtime DROP TABLE public.permissoes;
  EXCEPTION
    WHEN OTHERS THEN NULL;
  END;
  
  -- Adicionar
  ALTER PUBLICATION supabase_realtime ADD TABLE public.permissoes;
END $$;

-- 2. NOTIFICAÇÕES
ALTER TABLE public.notificacoes REPLICA IDENTITY FULL;
ALTER TABLE public.notificacoes_usuarios REPLICA IDENTITY FULL;

DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime DROP TABLE public.notificacoes;
  EXCEPTION WHEN OTHERS THEN NULL; END;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.notificacoes;
  
  BEGIN
    ALTER PUBLICATION supabase_realtime DROP TABLE public.notificacoes_usuarios;
  EXCEPTION WHEN OTHERS THEN NULL; END;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.notificacoes_usuarios;
END $$;

-- 3. VENDAS
ALTER TABLE public.vendas REPLICA IDENTITY FULL;
ALTER TABLE public.itens_venda REPLICA IDENTITY FULL;
ALTER TABLE public.pagamentos_venda REPLICA IDENTITY FULL;

DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime DROP TABLE public.vendas;
  EXCEPTION WHEN OTHERS THEN NULL; END;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.vendas;
  
  BEGIN
    ALTER PUBLICATION supabase_realtime DROP TABLE public.itens_venda;
  EXCEPTION WHEN OTHERS THEN NULL; END;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.itens_venda;
  
  BEGIN
    ALTER PUBLICATION supabase_realtime DROP TABLE public.pagamentos_venda;
  EXCEPTION WHEN OTHERS THEN NULL; END;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.pagamentos_venda;
END $$;

-- 4. ESTOQUE E TRANSFERÊNCIAS
ALTER TABLE public.estoque_lojas REPLICA IDENTITY FULL;
ALTER TABLE public.transferencias REPLICA IDENTITY FULL;

DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime DROP TABLE public.estoque_lojas;
  EXCEPTION WHEN OTHERS THEN NULL; END;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.estoque_lojas;
  
  BEGIN
    ALTER PUBLICATION supabase_realtime DROP TABLE public.transferencias;
  EXCEPTION WHEN OTHERS THEN NULL; END;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.transferencias;
END $$;

-- =====================================================
-- VERIFICAÇÃO
-- =====================================================
SELECT 
  tablename,
  '✅ REALTIME HABILITADO' as status
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime'
  AND tablename IN ('permissoes', 'notificacoes', 'vendas', 'estoque_lojas', 'transferencias')
ORDER BY tablename;

-- Se retornar 5 linhas = SUCESSO! ✅
