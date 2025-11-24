-- ==========================================
-- TRIGGER COM LOGS DETALHADOS PARA DEBUG
-- ==========================================

-- Recriar função trigger_verificar_estoque com RAISE NOTICE
CREATE OR REPLACE FUNCTION public.trigger_verificar_estoque()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_quantidade_minima INTEGER;
BEGIN
  RAISE NOTICE '🔵 trigger_verificar_estoque: INICIADO';
  RAISE NOTICE '   OLD.quantidade = %, NEW.quantidade = %', OLD.quantidade, NEW.quantidade;
  RAISE NOTICE '   id_produto = %, id_loja = %', NEW.id_produto, NEW.id_loja;
  
  -- Buscar quantidade mínima do produto
  SELECT quantidade_minima INTO v_quantidade_minima
  FROM public.produtos
  WHERE id = NEW.id_produto;
  
  RAISE NOTICE '   quantidade_minima = %', v_quantidade_minima;
  
  -- Se não tem quantidade_minima definida, usar 5 como padrão
  IF v_quantidade_minima IS NULL THEN
    v_quantidade_minima := 5;
    RAISE NOTICE '   quantidade_minima era NULL, usando padrão = 5';
  END IF;
  
  RAISE NOTICE '🟡 Chamando criar_notificacao_estoque(%, %, %, %)', 
    NEW.id_produto, NEW.id_loja, NEW.quantidade, v_quantidade_minima;
  
  -- Chamar a função inteligente de criar_notificacao_estoque
  PERFORM criar_notificacao_estoque(
    NEW.id_produto,
    NEW.id_loja,
    NEW.quantidade,
    v_quantidade_minima
  );
  
  RAISE NOTICE '🟢 trigger_verificar_estoque: CONCLUÍDO';
  
  RETURN NEW;
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING '🔴 Erro ao verificar estoque: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- Teste manual
UPDATE estoque_lojas
SET quantidade = 3
WHERE id_produto = 'e138eed1-e316-4d2a-990e-7f1ebdee06c7'
  AND id_loja = 16;

-- Ver notificações criadas
SELECT 
  id,
  tipo,
  titulo,
  mensagem,
  criado_em
FROM notificacoes
WHERE criado_em > NOW() - INTERVAL '5 minutes'
ORDER BY criado_em DESC;
