-- Script para adicionar informações do cliente aos logs de deleção
-- Melhora a rastreabilidade armazenando quem era o cliente da venda

-- =========================================================================
-- PASSO 1: Adicionar colunas de cliente se ainda não existirem
-- =========================================================================

ALTER TABLE public.audit_logs_deletions
  ADD COLUMN IF NOT EXISTS cliente_id uuid,
  ADD COLUMN IF NOT EXISTS cliente_nome varchar;

-- =========================================================================
-- PASSO 2: Melhorar a função de log para capturar dados do cliente
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
BEGIN
  -- Extrai ID de forma tolerante (usa id ou venda_id se existirem)
  v_registro_id := COALESCE(
    NULLIF(v_old ->> 'id', '')::uuid,
    NULLIF(v_old ->> 'venda_id', '')::uuid
  );

  -- Se temos venda_id, usamos para buscar dados relacionados na tabela vendas
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

  -- Captura o usuário do contexto da sessão
  v_usuario_id := NULLIF(current_setting('app.user_id', true), '')::uuid;

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
        SELECT raw_user_meta_data->>'nome' INTO v_usuario_nome
        FROM auth.users
        WHERE id = v_usuario_id;
      EXCEPTION WHEN OTHERS THEN
        v_usuario_nome := NULL;
      END;
    END;
  END IF;

  -- Se não conseguiu do contexto, tenta extrair do JSON (criado_por)
  IF v_usuario_id IS NULL THEN
    v_usuario_id := NULLIF(v_old ->> 'criado_por', '')::uuid;
    
    IF v_usuario_id IS NOT NULL THEN
      BEGIN
        SELECT nome INTO v_usuario_nome
        FROM public.usuarios
        WHERE id = v_usuario_id
        LIMIT 1;
      EXCEPTION WHEN OTHERS THEN
        NULL;
      END;
    END IF;
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =========================================================================
-- PASSO 3: Recrear os triggers com a função melhorada
-- =========================================================================

-- Trigger para tabela vendas
DROP TRIGGER IF EXISTS tr_log_vendas_delete ON public.vendas;
CREATE TRIGGER tr_log_vendas_delete
BEFORE DELETE ON public.vendas
FOR EACH ROW
EXECUTE FUNCTION public.log_deletion();

-- Trigger para tabela itens_venda
DROP TRIGGER IF EXISTS tr_log_itens_venda_delete ON public.itens_venda;
CREATE TRIGGER tr_log_itens_venda_delete
BEFORE DELETE ON public.itens_venda
FOR EACH ROW
EXECUTE FUNCTION public.log_deletion();

-- Trigger para tabela pagamentos_venda
DROP TRIGGER IF EXISTS tr_log_pagamentos_venda_delete ON public.pagamentos_venda;
CREATE TRIGGER tr_log_pagamentos_venda_delete
BEFORE DELETE ON public.pagamentos_venda
FOR EACH ROW
EXECUTE FUNCTION public.log_deletion();

-- Trigger para tabela devolucoes_venda
DROP TRIGGER IF EXISTS tr_log_devolucoes_venda_delete ON public.devolucoes_venda;
CREATE TRIGGER tr_log_devolucoes_venda_delete
BEFORE DELETE ON public.devolucoes_venda
FOR EACH ROW
EXECUTE FUNCTION public.log_deletion();

-- Trigger para tabela trocas_produtos
DROP TRIGGER IF EXISTS tr_log_trocas_produtos_delete ON public.trocas_produtos;
CREATE TRIGGER tr_log_trocas_produtos_delete
BEFORE DELETE ON public.trocas_produtos
FOR EACH ROW
EXECUTE FUNCTION public.log_deletion();

-- Trigger para tabela descontos_venda
DROP TRIGGER IF EXISTS tr_log_descontos_venda_delete ON public.descontos_venda;
CREATE TRIGGER tr_log_descontos_venda_delete
BEFORE DELETE ON public.descontos_venda
FOR EACH ROW
EXECUTE FUNCTION public.log_deletion();

-- Trigger para tabela itens_devolucao
DROP TRIGGER IF EXISTS tr_log_itens_devolucao_delete ON public.itens_devolucao;
CREATE TRIGGER tr_log_itens_devolucao_delete
BEFORE DELETE ON public.itens_devolucao
FOR EACH ROW
EXECUTE FUNCTION public.log_deletion();

-- =========================================================================
-- PASSO 4: Criar/manter índices para melhor performance
-- =========================================================================

CREATE INDEX IF NOT EXISTS idx_audit_logs_numero_venda ON public.audit_logs_deletions (numero_venda);
CREATE INDEX IF NOT EXISTS idx_audit_logs_registro_id ON public.audit_logs_deletions (registro_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_usuario ON public.audit_logs_deletions (apagado_por);
CREATE INDEX IF NOT EXISTS idx_audit_logs_cliente ON public.audit_logs_deletions (cliente_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_tabela ON public.audit_logs_deletions (tabela_nome);
CREATE INDEX IF NOT EXISTS idx_audit_logs_data ON public.audit_logs_deletions (criado_em);

-- =========================================================================
-- PASSO 5: Exemplo de query para visualizar os dados com cliente
-- =========================================================================

-- SELECT 
--   criado_em as "Data",
--   tabela_nome as "Tabela",
--   numero_venda as "Venda #",
--   cliente_nome as "Cliente",
--   usuario_nome as "Deletado Por",
--   valor_total as "Valor"
-- FROM audit_logs_deletions 
-- ORDER BY criado_em DESC 
-- LIMIT 20;
