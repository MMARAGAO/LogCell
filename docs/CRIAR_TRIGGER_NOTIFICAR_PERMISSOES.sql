-- CRIAR TRIGGER PARA NOTIFICAR MUDANÇAS NAS PERMISSÕES VIA REALTIME

-- 1. Criar função que envia broadcast quando permissões mudam
CREATE OR REPLACE FUNCTION notify_permissoes_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Notificar via pg_notify (Supabase Realtime escuta isso)
  PERFORM pg_notify(
    'permissoes_channel',
    json_build_object(
      'event', TG_OP,
      'usuario_id', COALESCE(NEW.usuario_id, OLD.usuario_id),
      'loja_id', NEW.loja_id,
      'todas_lojas', NEW.todas_lojas,
      'timestamp', NOW()
    )::text
  );
  
  RETURN NEW;
END;
$$;

-- 2. Criar trigger que executa após INSERT, UPDATE ou DELETE
DROP TRIGGER IF EXISTS permissoes_change_trigger ON permissoes;

CREATE TRIGGER permissoes_change_trigger
AFTER INSERT OR UPDATE OR DELETE ON permissoes
FOR EACH ROW
EXECUTE FUNCTION notify_permissoes_change();

-- 3. Testar o trigger
-- Execute um UPDATE em qualquer permissão e veja se aparece no console do front

-- 4. Verificar se trigger foi criado
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'permissoes_change_trigger';
