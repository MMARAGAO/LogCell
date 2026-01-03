-- Função para registrar deleções
CREATE OR REPLACE FUNCTION public.log_deletion()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.audit_logs_deletions (
    tabela_nome,
    registro_id,
    dados_apagados,
    apagado_por,
    criado_em
  ) VALUES (
    TG_TABLE_NAME,
    CASE 
      WHEN OLD.id::text ~ '^[0-9a-f\-]{36}$' THEN OLD.id
      WHEN OLD.numero_os IS NOT NULL THEN OLD.numero_os::uuid
      ELSE NULL 
    END,
    row_to_json(OLD),
    NULLIF(current_setting('app.user_id', true), '')::uuid,
    now()
  );
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

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
