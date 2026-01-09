-- =========================================================================
-- SOLUÇÃO MELHORADA: Usar dados do creator quando disponível
-- =========================================================================

CREATE OR REPLACE FUNCTION public.log_deletion()
RETURNS TRIGGER AS $$
DECLARE
  v_old jsonb := to_jsonb(OLD);
  v_registro_id uuid;
  v_numero_venda integer;
  v_valor_total numeric;
  v_venda_id uuid;
  v_usuario_id uuid;
  v_usuario_nome varchar;
  v_criado_por uuid;
BEGIN
  -- Extrai ID de forma tolerante (usa id ou venda_id se existirem)
  v_registro_id := COALESCE(
    NULLIF(v_old ->> 'id', '')::uuid,
    NULLIF(v_old ->> 'venda_id', '')::uuid
  );

  -- Se temos venda_id, usamos para buscar numero_venda na tabela vendas
  v_venda_id := NULLIF(v_old ->> 'venda_id', '')::uuid;
  
  -- Tenta extrair numero_venda do próprio registro
  v_numero_venda := NULLIF(v_old ->> 'numero_venda', '')::integer;
  
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

  -- Facilita busca por número e valor da venda
  v_valor_total := NULLIF(v_old ->> 'valor_total', '')::numeric;

  -- IMPORTANTE: Tentar capturar o usuário de múltiplas fontes na ordem correta
  -- 1. Primeiro verifica criado_por (geralmente disponível em registro de criação)
  v_criado_por := NULLIF(v_old ->> 'criado_por', '')::uuid;
  IF v_criado_por IS NOT NULL THEN
    v_usuario_id := v_criado_por;
  END IF;
  
  -- 2. Se não encontrou, tenta app.user_id (setado pela RPC)
  IF v_usuario_id IS NULL THEN
    v_usuario_id := NULLIF(current_setting('app.user_id', true), '')::uuid;
  END IF;
  
  -- 3. Se não encontrar, tenta auth.uid() (usuário logado no Supabase)
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
      -- Se der erro, tenta da tabela auth.users
      BEGIN
        SELECT (raw_user_meta_data->>'nome')::varchar INTO v_usuario_nome
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
    dados_apagados,
    apagado_por,
    usuario_nome,
    criado_em
  ) VALUES (
    TG_TABLE_NAME,
    v_registro_id,
    v_numero_venda,
    v_valor_total,
    v_old,
    v_usuario_id,
    v_usuario_nome,
    now()
  );

  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth;

-- Recrear todos os triggers
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
-- TESTES: Verificar se funciona agora
-- =========================================================================

-- Teste 1: Deletar o pagamento de teste anterior
SELECT numero_venda, usuario_nome, apagado_por, tabela_nome 
FROM audit_logs_deletions 
WHERE numero_venda = 9999
ORDER BY criado_em DESC;

-- Teste 2: Ver logs recentes de pagamentos
SELECT numero_venda, usuario_nome, apagado_por, tabela_nome, criado_em
FROM audit_logs_deletions
WHERE tabela_nome = 'pagamentos_venda'
ORDER BY criado_em DESC
LIMIT 10;
