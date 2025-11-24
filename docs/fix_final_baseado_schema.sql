-- =====================================================
-- LIMPEZA COMPLETA E RECRIAÇÃO BASEADA NO SCHEMA REAL
-- =====================================================

-- PASSO 1: Remover triggers e funções manualmente
DROP TRIGGER IF EXISTS trigger_historico_usuario ON usuarios CASCADE;
DROP TRIGGER IF EXISTS trg_log_usuario_mudancas ON usuarios CASCADE;
DROP TRIGGER IF EXISTS trg_auditoria_usuarios ON usuarios CASCADE;

DROP FUNCTION IF EXISTS registrar_historico_usuario() CASCADE;
DROP FUNCTION IF EXISTS fn_log_mudancas_usuario() CASCADE;
DROP FUNCTION IF EXISTS fn_registrar_mudancas_usuario() CASCADE;

-- PASSO 2: Limpar a tabela (manter estrutura)
TRUNCATE TABLE historico_usuarios;

-- PASSO 3: Criar a função CORRETA baseada no schema
CREATE OR REPLACE FUNCTION public.fn_registrar_mudancas_usuario()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_usuario_atual UUID;
BEGIN
  -- Obtém o ID do usuário autenticado
  v_usuario_atual := auth.uid();

  -- Operação INSERT
  IF (TG_OP = 'INSERT') THEN
    INSERT INTO public.historico_usuarios (
      usuario_id,
      usuario_alterou_id,
      campo_alterado,
      valor_anterior,
      valor_novo,
      tipo_operacao
    ) VALUES (
      NEW.id,
      v_usuario_atual,
      'criacao',
      NULL,
      'Usuário criado',
      'INSERT'
    );
    RETURN NEW;
  END IF;

  -- Operação UPDATE
  IF (TG_OP = 'UPDATE') THEN
    -- Verificar campo: nome
    IF (OLD.nome IS DISTINCT FROM NEW.nome) THEN
      INSERT INTO public.historico_usuarios (
        usuario_id,
        usuario_alterou_id,
        campo_alterado,
        valor_anterior,
        valor_novo,
        tipo_operacao
      ) VALUES (
        NEW.id,
        v_usuario_atual,
        'nome',
        OLD.nome,
        NEW.nome,
        'UPDATE'
      );
    END IF;

    -- Verificar campo: email
    IF (OLD.email IS DISTINCT FROM NEW.email) THEN
      INSERT INTO public.historico_usuarios (
        usuario_id,
        usuario_alterou_id,
        campo_alterado,
        valor_anterior,
        valor_novo,
        tipo_operacao
      ) VALUES (
        NEW.id,
        v_usuario_atual,
        'email',
        OLD.email,
        NEW.email,
        'UPDATE'
      );
    END IF;

    -- Verificar campo: telefone
    IF (OLD.telefone IS DISTINCT FROM NEW.telefone) THEN
      INSERT INTO public.historico_usuarios (
        usuario_id,
        usuario_alterou_id,
        campo_alterado,
        valor_anterior,
        valor_novo,
        tipo_operacao
      ) VALUES (
        NEW.id,
        v_usuario_atual,
        'telefone',
        OLD.telefone,
        NEW.telefone,
        'UPDATE'
      );
    END IF;

    -- Verificar campo: cpf
    IF (OLD.cpf IS DISTINCT FROM NEW.cpf) THEN
      INSERT INTO public.historico_usuarios (
        usuario_id,
        usuario_alterou_id,
        campo_alterado,
        valor_anterior,
        valor_novo,
        tipo_operacao
      ) VALUES (
        NEW.id,
        v_usuario_atual,
        'cpf',
        OLD.cpf,
        NEW.cpf,
        'UPDATE'
      );
    END IF;

    -- Verificar campo: ativo
    IF (OLD.ativo IS DISTINCT FROM NEW.ativo) THEN
      INSERT INTO public.historico_usuarios (
        usuario_id,
        usuario_alterou_id,
        campo_alterado,
        valor_anterior,
        valor_novo,
        tipo_operacao
      ) VALUES (
        NEW.id,
        v_usuario_atual,
        'status',
        CASE WHEN OLD.ativo THEN 'Ativo' ELSE 'Inativo' END,
        CASE WHEN NEW.ativo THEN 'Ativo' ELSE 'Inativo' END,
        'UPDATE'
      );
    END IF;

    RETURN NEW;
  END IF;

  -- Operação DELETE
  IF (TG_OP = 'DELETE') THEN
    INSERT INTO public.historico_usuarios (
      usuario_id,
      usuario_alterou_id,
      campo_alterado,
      valor_anterior,
      valor_novo,
      tipo_operacao
    ) VALUES (
      OLD.id,
      v_usuario_atual,
      'exclusao',
      'Usuário existente',
      NULL,
      'DELETE'
    );
    RETURN OLD;
  END IF;

  RETURN NULL;
END;
$$;

-- PASSO 4: Criar o trigger
CREATE TRIGGER trg_auditoria_usuarios
  AFTER INSERT OR UPDATE OR DELETE ON public.usuarios
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_registrar_mudancas_usuario();

-- PASSO 5: Verificar se foi criado
SELECT 
    'Trigger criado com sucesso!' as status,
    trigger_name,
    event_manipulation
FROM information_schema.triggers 
WHERE event_object_table = 'usuarios'
AND trigger_name = 'trg_auditoria_usuarios';

-- =====================================================
-- CONCLUÍDO - Teste atualizar um usuário agora
-- =====================================================
