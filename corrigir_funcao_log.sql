-- Corrigir a função log_deletion para ser genérica e não acessar campos específicos
CREATE OR REPLACE FUNCTION public.log_deletion()
RETURNS TRIGGER AS $$
DECLARE
  v_id UUID;
BEGIN
  -- Tenta pegar o ID de forma segura
  BEGIN
    v_id := OLD.id;
  EXCEPTION WHEN undefined_column THEN
    v_id := NULL;
  END;

  INSERT INTO public.audit_logs_deletions (
    tabela_nome,
    registro_id,
    dados_apagados,
    apagado_por,
    criado_em
  ) VALUES (
    TG_TABLE_NAME,
    v_id,
    row_to_json(OLD),
    NULLIF(current_setting('app.user_id', true), '')::uuid,
    now()
  );
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
