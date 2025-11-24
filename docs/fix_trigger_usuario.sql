-- =====================================================
-- FIX RÁPIDO: Atualizar função do trigger
-- =====================================================
-- Execute APENAS este script para corrigir o erro

-- Recriar a função com os campos corretos
CREATE OR REPLACE FUNCTION registrar_historico_usuario()
RETURNS TRIGGER AS $$
DECLARE
  usuario_atual_id UUID;
BEGIN
  -- Pega o ID do usuário que está fazendo a alteração
  usuario_atual_id := auth.uid();

  -- INSERT - registra criação
  IF (TG_OP = 'INSERT') THEN
    INSERT INTO historico_usuarios (usuario_id, usuario_alterou_id, campo_alterado, valor_anterior, valor_novo, tipo_operacao)
    VALUES (NEW.id, usuario_atual_id, 'criacao', NULL, 'Usuário criado', 'INSERT');
    
    RETURN NEW;
  END IF;

  -- UPDATE - registra cada campo alterado
  IF (TG_OP = 'UPDATE') THEN
    -- Nome
    IF OLD.nome IS DISTINCT FROM NEW.nome THEN
      INSERT INTO historico_usuarios (usuario_id, usuario_alterou_id, campo_alterado, valor_anterior, valor_novo, tipo_operacao)
      VALUES (NEW.id, usuario_atual_id, 'nome', OLD.nome, NEW.nome, 'UPDATE');
    END IF;

    -- Email
    IF OLD.email IS DISTINCT FROM NEW.email THEN
      INSERT INTO historico_usuarios (usuario_id, usuario_alterou_id, campo_alterado, valor_anterior, valor_novo, tipo_operacao)
      VALUES (NEW.id, usuario_atual_id, 'email', OLD.email, NEW.email, 'UPDATE');
    END IF;

    -- CPF
    IF OLD.cpf IS DISTINCT FROM NEW.cpf THEN
      INSERT INTO historico_usuarios (usuario_id, usuario_alterou_id, campo_alterado, valor_anterior, valor_novo, tipo_operacao)
      VALUES (NEW.id, usuario_atual_id, 'cpf', OLD.cpf, NEW.cpf, 'UPDATE');
    END IF;

    -- Telefone
    IF OLD.telefone IS DISTINCT FROM NEW.telefone THEN
      INSERT INTO historico_usuarios (usuario_id, usuario_alterou_id, campo_alterado, valor_anterior, valor_novo, tipo_operacao)
      VALUES (NEW.id, usuario_atual_id, 'telefone', OLD.telefone, NEW.telefone, 'UPDATE');
    END IF;

    -- Status Ativo
    IF OLD.ativo IS DISTINCT FROM NEW.ativo THEN
      INSERT INTO historico_usuarios (usuario_id, usuario_alterou_id, campo_alterado, valor_anterior, valor_novo, tipo_operacao)
      VALUES (NEW.id, usuario_atual_id, 'status', 
              CASE WHEN OLD.ativo THEN 'Ativo' ELSE 'Inativo' END,
              CASE WHEN NEW.ativo THEN 'Ativo' ELSE 'Inativo' END,
              'UPDATE');
    END IF;

    RETURN NEW;
  END IF;

  -- DELETE - registra exclusão
  IF (TG_OP = 'DELETE') THEN
    INSERT INTO historico_usuarios (usuario_id, usuario_alterou_id, campo_alterado, valor_anterior, valor_novo, tipo_operacao)
    VALUES (OLD.id, usuario_atual_id, 'exclusao', 'Usuário existente', NULL, 'DELETE');
    
    RETURN OLD;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Pronto! Agora tente atualizar um usuário novamente.
