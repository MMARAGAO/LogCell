-- =========================================================================
-- SOLUÇÃO MELHORADA: Usar uma coluna temporal para rastrear usuário na deleção
-- =========================================================================

-- Vamos usar uma abordagem melhor: adicionar um trigger que valida se o
-- usuario_id está em app.user_id ANTES de fazer o DELETE

-- Primeira, vamos remodelar a função para não limpar o contexto tão cedo
-- Na verdade, vamos usar uma sessão compartilhada

CREATE OR REPLACE FUNCTION public.deletar_venda_com_usuario(
  p_venda_id uuid,
  p_usuario_id uuid
)
RETURNS TABLE(sucesso boolean, mensagem text) AS $$
DECLARE
  v_numero_venda integer;
  v_exception_text text;
BEGIN
  -- Busca o numero_venda ANTES de deletar para retorno
  SELECT numero_venda INTO v_numero_venda
  FROM public.vendas
  WHERE id = p_venda_id;
  
  -- Configurar o usuário no contexto da sessão
  -- IMPORTANTE: use false para persistir na sessão/transação
  PERFORM set_config('app.user_id', p_usuario_id::text, false);
  
  -- Deletar a venda (CASCADE vai deletar os relacionados)
  -- O trigger vai ler app.user_id durante este DELETE
  DELETE FROM public.vendas WHERE id = p_venda_id;
  
  -- Retornar sucesso
  RETURN QUERY SELECT true, 'Venda deletada com sucesso: ' || COALESCE(v_numero_venda::text, p_venda_id::text);
  
  EXCEPTION WHEN OTHERS THEN
    GET STACKED DIAGNOSTICS v_exception_text = MESSAGE_TEXT;
    RETURN QUERY SELECT false, 'Erro ao deletar: ' || v_exception_text;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

GRANT EXECUTE ON FUNCTION public.deletar_venda_com_usuario(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.deletar_venda_com_usuario(uuid, uuid) TO service_role;

-- =========================================================================
-- SOLUÇÃO ALTERNATIVA: Adicionar uma coluna para rastrear usuário na RPC
-- =========================================================================

-- Criar uma tabela temporal para rastrear o usuário que está deletando
CREATE TABLE IF NOT EXISTS public.delete_context (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  usuario_id uuid,
  criado_em timestamp with time zone DEFAULT now(),
  CONSTRAINT delete_context_pkey PRIMARY KEY (id)
);

-- Adicionar função que registra o usuário que está deletando
CREATE OR REPLACE FUNCTION public.deletar_venda_com_contexto(
  p_venda_id uuid,
  p_usuario_id uuid
)
RETURNS TABLE(sucesso boolean, mensagem text) AS $$
DECLARE
  v_numero_venda integer;
  v_context_id uuid;
  v_exception_text text;
BEGIN
  -- Criar um registro de contexto
  INSERT INTO public.delete_context (usuario_id) 
  VALUES (p_usuario_id)
  RETURNING id INTO v_context_id;
  
  -- Busca o numero_venda ANTES de deletar
  SELECT numero_venda INTO v_numero_venda
  FROM public.vendas
  WHERE id = p_venda_id;
  
  -- Configurar AMBAS as formas de passar usuário
  PERFORM set_config('app.user_id', p_usuario_id::text, false);
  PERFORM set_config('delete_context_id', v_context_id::text, false);
  
  -- Deletar a venda
  DELETE FROM public.vendas WHERE id = p_venda_id;
  
  -- Limpar contexto
  DELETE FROM public.delete_context WHERE id = v_context_id;
  
  RETURN QUERY SELECT true, 'Venda ' || COALESCE(v_numero_venda::text, '') || ' deletada com sucesso';
  
  EXCEPTION WHEN OTHERS THEN
    GET STACKED DIAGNOSTICS v_exception_text = MESSAGE_TEXT;
    -- Limpar contexto mesmo em erro
    DELETE FROM public.delete_context WHERE id = v_context_id;
    RETURN QUERY SELECT false, 'Erro ao deletar: ' || v_exception_text;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

GRANT EXECUTE ON FUNCTION public.deletar_venda_com_contexto(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.deletar_venda_com_contexto(uuid, uuid) TO service_role;

-- =========================================================================
-- MELHORAR a função log_deletion para buscar do delete_context também
-- =========================================================================

CREATE OR REPLACE FUNCTION public.log_deletion()
RETURNS TRIGGER AS $$
DECLARE
  v_old jsonb := to_jsonb(OLD);
  v_registro_id uuid;
  v_numero_venda integer;
  v_valor_total numeric;
  v_venda_id uuid;
  v_cliente_id uuid;
  v_cliente_nome varchar;
  v_usuario_id uuid;
  v_usuario_nome varchar;
  v_context_id uuid;
BEGIN
  -- Extrai ID de forma tolerante
  v_registro_id := COALESCE(
    NULLIF(v_old ->> 'id', '')::uuid,
    NULLIF(v_old ->> 'venda_id', '')::uuid
  );

  -- Se temos venda_id, usamos para buscar dados relacionados
  v_venda_id := NULLIF(v_old ->> 'venda_id', '')::uuid;
  
  -- Tenta extrair numero_venda do próprio registro
  v_numero_venda := NULLIF(v_old ->> 'numero_venda', '')::integer;
  
  -- Tenta extrair cliente_id do próprio registro
  v_cliente_id := NULLIF(v_old ->> 'cliente_id', '')::uuid;
  
  -- Se não encontrou cliente_id e temos venda_id, busca na tabela vendas
  IF v_cliente_id IS NULL AND v_venda_id IS NOT NULL THEN
    BEGIN
      SELECT cliente_id INTO v_cliente_id
      FROM public.vendas
      WHERE id = v_venda_id;
    EXCEPTION WHEN OTHERS THEN
      NULL;
    END;
  END IF;

  -- Se não encontrou numero_venda e temos venda_id, busca na tabela vendas
  IF v_numero_venda IS NULL AND v_venda_id IS NOT NULL THEN
    BEGIN
      SELECT numero_venda INTO v_numero_venda
      FROM public.vendas
      WHERE id = v_venda_id;
    EXCEPTION WHEN OTHERS THEN
      NULL;
    END;
  END IF;

  -- Agora que temos cliente_id, busca o nome do cliente
  IF v_cliente_id IS NOT NULL THEN
    BEGIN
      SELECT nome INTO v_cliente_nome
      FROM public.clientes
      WHERE id = v_cliente_id
      LIMIT 1;
    EXCEPTION WHEN OTHERS THEN
      NULL;
    END;
  END IF;

  -- Facilita busca por número e valor da venda
  v_valor_total := NULLIF(v_old ->> 'valor_total', '')::numeric;

  -- IMPORTANTE: Tentar capturar o usuário de múltiplas fontes
  -- 1. Primeiro tenta do delete_context (mais recente/confiável)
  v_context_id := NULLIF(current_setting('delete_context_id', true), '')::uuid;
  IF v_context_id IS NOT NULL THEN
    BEGIN
      SELECT usuario_id INTO v_usuario_id
      FROM public.delete_context
      WHERE id = v_context_id;
    EXCEPTION WHEN OTHERS THEN
      NULL;
    END;
  END IF;

  -- 2. Se não encontrou, tenta app.user_id
  IF v_usuario_id IS NULL THEN
    v_usuario_id := NULLIF(current_setting('app.user_id', true), '')::uuid;
  END IF;

  -- 3. Se não encontrou, tenta campo criado_por do registro
  IF v_usuario_id IS NULL THEN
    v_usuario_id := NULLIF(v_old ->> 'criado_por', '')::uuid;
  END IF;

  -- 4. Se não encontrou, tenta auth.uid()
  IF v_usuario_id IS NULL THEN
    BEGIN
      v_usuario_id := auth.uid();
    EXCEPTION WHEN OTHERS THEN
      NULL;
    END;
  END IF;

  -- Se conseguiu o UUID do usuário, busca o nome
  IF v_usuario_id IS NOT NULL THEN
    BEGIN
      SELECT nome INTO v_usuario_nome
      FROM public.usuarios
      WHERE id = v_usuario_id
      LIMIT 1;
    EXCEPTION WHEN OTHERS THEN
      BEGIN
        SELECT raw_user_meta_data->>'nome' INTO v_usuario_nome
        FROM auth.users
        WHERE id = v_usuario_id;
      EXCEPTION WHEN OTHERS THEN
        v_usuario_nome := NULL;
      END;
    END;
  END IF;

  INSERT INTO public.audit_logs_deletions (
    tabela_nome,
    registro_id,
    numero_venda,
    valor_total,
    cliente_id,
    cliente_nome,
    dados_apagados,
    apagado_por,
    usuario_nome,
    criado_em
  ) VALUES (
    TG_TABLE_NAME,
    v_registro_id,
    v_numero_venda,
    v_valor_total,
    v_cliente_id,
    v_cliente_nome,
    v_old,
    v_usuario_id,
    v_usuario_nome,
    now()
  );

  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth;

-- Recrear triggers
DROP TRIGGER IF EXISTS tr_log_vendas_delete ON public.vendas;
CREATE TRIGGER tr_log_vendas_delete
BEFORE DELETE ON public.vendas
FOR EACH ROW
EXECUTE FUNCTION public.log_deletion();

DROP TRIGGER IF EXISTS tr_log_itens_venda_delete ON public.itens_venda;
CREATE TRIGGER tr_log_itens_venda_delete
BEFORE DELETE ON public.itens_venda
FOR EACH ROW
EXECUTE FUNCTION public.log_deletion();

DROP TRIGGER IF EXISTS tr_log_pagamentos_venda_delete ON public.pagamentos_venda;
CREATE TRIGGER tr_log_pagamentos_venda_delete
BEFORE DELETE ON public.pagamentos_venda
FOR EACH ROW
EXECUTE FUNCTION public.log_deletion();

DROP TRIGGER IF EXISTS tr_log_devolucoes_venda_delete ON public.devolucoes_venda;
CREATE TRIGGER tr_log_devolucoes_venda_delete
BEFORE DELETE ON public.devolucoes_venda
FOR EACH ROW
EXECUTE FUNCTION public.log_deletion();

DROP TRIGGER IF EXISTS tr_log_trocas_produtos_delete ON public.trocas_produtos;
CREATE TRIGGER tr_log_trocas_produtos_delete
BEFORE DELETE ON public.trocas_produtos
FOR EACH ROW
EXECUTE FUNCTION public.log_deletion();

DROP TRIGGER IF EXISTS tr_log_descontos_venda_delete ON public.descontos_venda;
CREATE TRIGGER tr_log_descontos_venda_delete
BEFORE DELETE ON public.descontos_venda
FOR EACH ROW
EXECUTE FUNCTION public.log_deletion();

DROP TRIGGER IF EXISTS tr_log_itens_devolucao_delete ON public.itens_devolucao;
CREATE TRIGGER tr_log_itens_devolucao_delete
BEFORE DELETE ON public.itens_devolucao
FOR EACH ROW
EXECUTE FUNCTION public.log_deletion();

-- =========================================================================
-- ÍNDICE para delete_context (limpeza rápida)
-- =========================================================================

CREATE INDEX IF NOT EXISTS idx_delete_context_data ON public.delete_context (criado_em);

-- Função para limpar delete_context antigos
CREATE OR REPLACE FUNCTION public.limpar_delete_context_antigos()
RETURNS void AS $$
BEGIN
  DELETE FROM public.delete_context
  WHERE criado_em < NOW() - INTERVAL '1 day';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =========================================================================
-- AGORA ATUALIZE O CÓDIGO TYPESCRIPT PARA USAR A NOVA RPC
-- =========================================================================
-- Use 'deletar_venda_com_contexto' em vez de 'deletar_venda_com_usuario'
-- Exemplo no TypeScript:
--
-- const { data, error } = await supabase.rpc('deletar_venda_com_contexto', {
--   p_venda_id: vendaId,
--   p_usuario_id: usuarioId
-- });
