-- =====================================================
-- TESTE: Trigger mais simples possível
-- =====================================================

-- Limpar logs
TRUNCATE TABLE debug_logs;

-- Criar versão ULTRA SIMPLES do trigger só para testar logging
CREATE OR REPLACE FUNCTION public.processar_baixa_estoque_os()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  -- Tentar inserir log PRIMEIRO, antes de qualquer lógica
  BEGIN
    INSERT INTO debug_logs (contexto, mensagem, dados)
    VALUES ('TRIGGER_EXECUTADO', 'Trigger foi chamado!', 
      jsonb_build_object(
        'id_loja', NEW.id_loja,
        'id_produto', NEW.id_produto,
        'tipo_produto', NEW.tipo_produto
      )
    );
  EXCEPTION
    WHEN OTHERS THEN
      -- Se der erro, criar uma exceção visível
      RAISE EXCEPTION 'ERRO AO INSERIR LOG: %', SQLERRM;
  END;
  
  -- Retornar NEW sem fazer NADA mais (para testar se chega aqui)
  RETURN NEW;
END;
$function$;

-- Verificar se atualizou
SELECT 'Trigger simplificado criado. Agora tente adicionar a peça novamente!' as status;
