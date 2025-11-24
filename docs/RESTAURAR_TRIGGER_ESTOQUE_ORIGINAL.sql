-- ==========================================
-- RESTAURAR TRIGGER DE NOTIFICAÇÕES ESTOQUE
-- ==========================================
-- Este script corrige o trigger_verificar_estoque para usar
-- a função criar_notificacao_estoque() que tem toda a lógica
-- inteligente de controle de estado e evita notificações duplicadas

-- Recriar função trigger_verificar_estoque (versão corrigida)
CREATE OR REPLACE FUNCTION public.trigger_verificar_estoque()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_quantidade_minima INTEGER;
BEGIN
  -- Buscar quantidade mínima do produto
  SELECT quantidade_minima INTO v_quantidade_minima
  FROM public.produtos
  WHERE id = NEW.id_produto;
  
  -- Se não tem quantidade_minima definida, usar 5 como padrão
  IF v_quantidade_minima IS NULL THEN
    v_quantidade_minima := 5;
  END IF;
  
  -- Chamar a função inteligente de criar_notificacao_estoque
  -- Ela só cria notificação se houver MUDANÇA DE ESTADO (normal/baixo/zerado)
  PERFORM criar_notificacao_estoque(
    NEW.id_produto,
    NEW.id_loja,
    NEW.quantidade,
    v_quantidade_minima
  );
  
  RETURN NEW;
  
EXCEPTION
  WHEN OTHERS THEN
    -- Ignorar erros no trigger de notificação para não bloquear a operação principal
    RAISE WARNING 'Erro ao verificar estoque: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- Comentário explicativo
COMMENT ON FUNCTION public.trigger_verificar_estoque() IS 
'Trigger que chama criar_notificacao_estoque() após UPDATE em estoque_lojas. 
A função criar_notificacao_estoque() gerencia inteligentemente os alertas usando 
alertas_estoque_controle para evitar notificações duplicadas e detectar mudanças de estado.';

-- Verificar se trigger está ativo
SELECT 
  t.tgname AS trigger_name,
  p.proname AS function_name,
  CASE 
    WHEN t.tgenabled = 'O' THEN 'ENABLED ✅'
    WHEN t.tgenabled = 'D' THEN 'DISABLED ❌'
    ELSE 'OTHER'
  END AS status
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE c.relname = 'estoque_lojas'
  AND t.tgname = 'trigger_alerta_estoque';
