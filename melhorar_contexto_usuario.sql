-- =========================================================================
-- SOLUÇÃO: Melhorar a função deletar_venda_com_usuario para manter contexto
-- =========================================================================

-- A função atual não mantém o contexto do usuário durante os deletes em cascata
-- Precisamos usar uma abordagem diferente

DROP FUNCTION IF EXISTS public.deletar_venda_com_usuario(uuid, uuid) CASCADE;

CREATE OR REPLACE FUNCTION public.deletar_venda_com_usuario(
  p_venda_id uuid,
  p_usuario_id uuid
)
RETURNS void AS $$
DECLARE
  v_exception_text text;
BEGIN
  -- Configurar o usuário no contexto da sessão (level 'false' = session scope)
  -- Importante: use false para garantir que persista durante toda a transação
  PERFORM set_config('app.user_id', p_usuario_id::text, false);
  
  -- IMPORTANTE: Não usar 'true' pois isso faz com que seja apenas para o próximo comando
  -- Com 'false', persiste por toda a sessão/transação
  
  -- Deletar a venda (CASCADE vai deletar os relacionados, mantendo o contexto)
  DELETE FROM public.vendas WHERE id = p_venda_id;
  
  -- NÃO limpar o contexto imediatamente após deletar
  -- Deixar para a aplicação limpar quando a sessão terminar
  
  EXCEPTION WHEN OTHERS THEN
    GET STACKED DIAGNOSTICS v_exception_text = MESSAGE_TEXT;
    -- Registra erro mas mantém o contexto para investigação
    RAISE NOTICE 'Erro ao deletar venda %: %', p_venda_id, v_exception_text;
    RAISE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Garantir que a função seja executável
GRANT EXECUTE ON FUNCTION public.deletar_venda_com_usuario(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.deletar_venda_com_usuario(uuid, uuid) TO service_role;

-- =========================================================================
-- ALTERNATIVA: Função que deleta e depois limpa o contexto
-- =========================================================================

CREATE OR REPLACE FUNCTION public.deletar_venda_com_usuario_v2(
  p_venda_id uuid,
  p_usuario_id uuid
)
RETURNS TABLE(sucesso boolean, mensagem text) AS $$
DECLARE
  v_numero_venda integer;
  v_exception_text text;
BEGIN
  -- Busca o numero_venda ANTES de deletar
  SELECT numero_venda INTO v_numero_venda
  FROM public.vendas
  WHERE id = p_venda_id;
  
  -- Configurar o usuário no contexto da sessão
  PERFORM set_config('app.user_id', p_usuario_id::text, false);
  
  -- Deletar a venda
  DELETE FROM public.vendas WHERE id = p_venda_id;
  
  RETURN QUERY SELECT true, 'Venda ' || COALESCE(v_numero_venda::text, p_venda_id::text) || ' deletada com sucesso';
  
  EXCEPTION WHEN OTHERS THEN
    GET STACKED DIAGNOSTICS v_exception_text = MESSAGE_TEXT;
    RETURN QUERY SELECT false, 'Erro ao deletar venda: ' || v_exception_text;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =========================================================================
-- IMPORTANTE: Também precisamos melhorar como a RPC é chamada no TypeScript
-- =========================================================================

-- Veja o arquivo: services/vendasService.ts
-- A função deletar_venda_com_usuario precisa ser chamada de forma que o
-- contexto persista. Verifique se está usando await corretamente.

-- =========================================================================
-- TESTE: Criar um registro de teste para verificar se o usuario_id funciona
-- =========================================================================

-- 1. Primeiro obtenha um usuario_id de teste
-- SELECT id, nome FROM public.usuarios LIMIT 1;

-- 2. Depois crie uma venda de teste
-- INSERT INTO public.vendas (numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total)
-- VALUES (999, 'xxx', 1, 'yyy', 'em_andamento', 'normal', 0)
-- RETURNING id;

-- 3. Depois teste o delete
-- SELECT public.deletar_venda_com_usuario('venda-id', 'usuario-id');

-- 4. Verifique o log
-- SELECT numero_venda, usuario_nome, apagado_por, tabela_nome, criado_em 
-- FROM audit_logs_deletions 
-- WHERE numero_venda = 999
-- ORDER BY criado_em DESC;
