-- =====================================================
-- SOLUÇÃO DEFINITIVA: Limpar cache e recriar
-- =====================================================

-- 1. Remover trigger específico (se existir)
DROP TRIGGER IF EXISTS trigger_historico_usuario ON usuarios CASCADE;
DROP TRIGGER IF EXISTS trg_log_usuario_mudancas ON usuarios CASCADE;

-- 2. Remover função (todas as variações possíveis)
DROP FUNCTION IF EXISTS registrar_historico_usuario() CASCADE;
DROP FUNCTION IF EXISTS registrar_historico_usuario(text, text, text) CASCADE;
DROP FUNCTION IF EXISTS public.registrar_historico_usuario() CASCADE;
DROP FUNCTION IF EXISTS fn_log_mudancas_usuario() CASCADE;

-- 3. Criar função com NOME NOVO (para evitar cache)
CREATE OR REPLACE FUNCTION fn_log_mudancas_usuario()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Pega usuário autenticado
  v_user_id := auth.uid();

  -- INSERT
  IF (TG_OP = 'INSERT') THEN
    INSERT INTO historico_usuarios 
      (usuario_id, usuario_alterou_id, campo_alterado, valor_anterior, valor_novo, tipo_operacao)
    VALUES 
      (NEW.id, v_user_id, 'criacao', NULL, 'Usuário criado', 'INSERT');
    RETURN NEW;
  END IF;

  -- UPDATE
  IF (TG_OP = 'UPDATE') THEN
    -- Nome
    IF (OLD.nome IS DISTINCT FROM NEW.nome) THEN
      INSERT INTO historico_usuarios 
        (usuario_id, usuario_alterou_id, campo_alterado, valor_anterior, valor_novo, tipo_operacao)
      VALUES 
        (NEW.id, v_user_id, 'nome', OLD.nome, NEW.nome, 'UPDATE');
    END IF;

    -- Email
    IF (OLD.email IS DISTINCT FROM NEW.email) THEN
      INSERT INTO historico_usuarios 
        (usuario_id, usuario_alterou_id, campo_alterado, valor_anterior, valor_novo, tipo_operacao)
      VALUES 
        (NEW.id, v_user_id, 'email', OLD.email, NEW.email, 'UPDATE');
    END IF;

    -- CPF
    IF (OLD.cpf IS DISTINCT FROM NEW.cpf) THEN
      INSERT INTO historico_usuarios 
        (usuario_id, usuario_alterou_id, campo_alterado, valor_anterior, valor_novo, tipo_operacao)
      VALUES 
        (NEW.id, v_user_id, 'cpf', OLD.cpf, NEW.cpf, 'UPDATE');
    END IF;

    -- Telefone
    IF (OLD.telefone IS DISTINCT FROM NEW.telefone) THEN
      INSERT INTO historico_usuarios 
        (usuario_id, usuario_alterou_id, campo_alterado, valor_anterior, valor_novo, tipo_operacao)
      VALUES 
        (NEW.id, v_user_id, 'telefone', OLD.telefone, NEW.telefone, 'UPDATE');
    END IF;

    -- Status
    IF (OLD.ativo IS DISTINCT FROM NEW.ativo) THEN
      INSERT INTO historico_usuarios 
        (usuario_id, usuario_alterou_id, campo_alterado, valor_anterior, valor_novo, tipo_operacao)
      VALUES 
        (NEW.id, v_user_id, 'status', 
         CASE WHEN OLD.ativo THEN 'Ativo' ELSE 'Inativo' END,
         CASE WHEN NEW.ativo THEN 'Ativo' ELSE 'Inativo' END,
         'UPDATE');
    END IF;

    RETURN NEW;
  END IF;

  -- DELETE
  IF (TG_OP = 'DELETE') THEN
    INSERT INTO historico_usuarios 
      (usuario_id, usuario_alterou_id, campo_alterado, valor_anterior, valor_novo, tipo_operacao)
    VALUES 
      (OLD.id, v_user_id, 'exclusao', 'Usuário existente', NULL, 'DELETE');
    RETURN OLD;
  END IF;

  RETURN NULL;
END;
$$;

-- 4. Criar trigger com NOME NOVO
CREATE TRIGGER trg_log_usuario_mudancas
  AFTER INSERT OR UPDATE OR DELETE ON usuarios
  FOR EACH ROW
  EXECUTE FUNCTION fn_log_mudancas_usuario();

-- 5. Testar se funcionou
SELECT 'Setup completo! Teste atualizar um usuário agora.' as status;

-- =====================================================
-- CONCLUÍDO
-- =====================================================
