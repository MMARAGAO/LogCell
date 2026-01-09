-- Garante colunas úteis para busca
ALTER TABLE public.audit_logs_deletions
  ADD COLUMN IF NOT EXISTS numero_venda integer,
  ADD COLUMN IF NOT EXISTS valor_total numeric;

CREATE OR REPLACE FUNCTION public.log_deletion()
RETURNS TRIGGER AS $$
DECLARE
  v_old jsonb := to_jsonb(OLD);
  v_registro_id uuid;
  v_numero_venda integer;
  v_valor_total numeric;
BEGIN
  -- Extrai ID de forma tolerante (usa id ou venda_id se existirem)
  v_registro_id := COALESCE(
    NULLIF(v_old ->> 'id', '')::uuid,
    NULLIF(v_old ->> 'venda_id', '')::uuid
  );

  -- Facilita busca por número e valor da venda
  v_numero_venda := NULLIF(v_old ->> 'numero_venda', '')::integer;
  v_valor_total := NULLIF(v_old ->> 'valor_total', '')::numeric;

  INSERT INTO public.audit_logs_deletions (
    tabela_nome,
    registro_id,
    numero_venda,
    valor_total,
    dados_apagados,
    apagado_por,
    criado_em
  ) VALUES (
    TG_TABLE_NAME,
    v_registro_id,
    v_numero_venda,
    v_valor_total,
    v_old,
    NULLIF(current_setting('app.user_id', true), '')::uuid,
    now()
  );

  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Índices para novas colunas de busca
CREATE INDEX IF NOT EXISTS idx_audit_logs_numero_venda ON public.audit_logs_deletions (numero_venda);
CREATE INDEX IF NOT EXISTS idx_audit_logs_registro_id ON public.audit_logs_deletions (registro_id);
