-- =====================================================
-- SOLUÇÃO COMPLETA: Recriar tudo do zero
-- =====================================================

-- 1. Remover tudo
DROP TRIGGER IF EXISTS trigger_historico_usuario ON usuarios;
DROP FUNCTION IF EXISTS registrar_historico_usuario() CASCADE;
DROP TABLE IF EXISTS historico_usuarios CASCADE;

-- 2. Recriar tabela
CREATE TABLE historico_usuarios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  usuario_alterou_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  campo_alterado VARCHAR(100) NOT NULL,
  valor_anterior TEXT,
  valor_novo TEXT,
  tipo_operacao VARCHAR(20) NOT NULL CHECK (tipo_operacao IN ('INSERT', 'UPDATE', 'DELETE')),
  data_alteracao TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Criar índices
CREATE INDEX idx_historico_usuarios_usuario_id ON historico_usuarios(usuario_id);
CREATE INDEX idx_historico_usuarios_data ON historico_usuarios(data_alteracao DESC);
CREATE INDEX idx_historico_usuarios_alterou ON historico_usuarios(usuario_alterou_id);

-- 4. Criar função do trigger (SEM campos que não existem)
CREATE OR REPLACE FUNCTION registrar_historico_usuario()
RETURNS TRIGGER AS $$
DECLARE
  usuario_atual_id UUID;
BEGIN
  -- Pega o ID do usuário autenticado
  usuario_atual_id := auth.uid();

  -- INSERT - registra criação
  IF (TG_OP = 'INSERT') THEN
    INSERT INTO historico_usuarios (
      usuario_id, 
      usuario_alterou_id, 
      campo_alterado, 
      valor_anterior, 
      valor_novo, 
      tipo_operacao
    )
    VALUES (
      NEW.id, 
      usuario_atual_id, 
      'criacao', 
      NULL, 
      'Usuário criado', 
      'INSERT'
    );
    
    RETURN NEW;
  END IF;

  -- UPDATE - registra cada campo alterado
  IF (TG_OP = 'UPDATE') THEN
    -- Nome
    IF OLD.nome IS DISTINCT FROM NEW.nome THEN
      INSERT INTO historico_usuarios (
        usuario_id, 
        usuario_alterou_id, 
        campo_alterado, 
        valor_anterior, 
        valor_novo, 
        tipo_operacao
      )
      VALUES (
        NEW.id, 
        usuario_atual_id, 
        'nome', 
        OLD.nome, 
        NEW.nome, 
        'UPDATE'
      );
    END IF;

    -- Email
    IF OLD.email IS DISTINCT FROM NEW.email THEN
      INSERT INTO historico_usuarios (
        usuario_id, 
        usuario_alterou_id, 
        campo_alterado, 
        valor_anterior, 
        valor_novo, 
        tipo_operacao
      )
      VALUES (
        NEW.id, 
        usuario_atual_id, 
        'email', 
        OLD.email, 
        NEW.email, 
        'UPDATE'
      );
    END IF;

    -- CPF
    IF OLD.cpf IS DISTINCT FROM NEW.cpf THEN
      INSERT INTO historico_usuarios (
        usuario_id, 
        usuario_alterou_id, 
        campo_alterado, 
        valor_anterior, 
        valor_novo, 
        tipo_operacao
      )
      VALUES (
        NEW.id, 
        usuario_atual_id, 
        'cpf', 
        OLD.cpf, 
        NEW.cpf, 
        'UPDATE'
      );
    END IF;

    -- Telefone
    IF OLD.telefone IS DISTINCT FROM NEW.telefone THEN
      INSERT INTO historico_usuarios (
        usuario_id, 
        usuario_alterou_id, 
        campo_alterado, 
        valor_anterior, 
        valor_novo, 
        tipo_operacao
      )
      VALUES (
        NEW.id, 
        usuario_atual_id, 
        'telefone', 
        OLD.telefone, 
        NEW.telefone, 
        'UPDATE'
      );
    END IF;

    -- Status Ativo
    IF OLD.ativo IS DISTINCT FROM NEW.ativo THEN
      INSERT INTO historico_usuarios (
        usuario_id, 
        usuario_alterou_id, 
        campo_alterado, 
        valor_anterior, 
        valor_novo, 
        tipo_operacao
      )
      VALUES (
        NEW.id, 
        usuario_atual_id, 
        'status', 
        CASE WHEN OLD.ativo THEN 'Ativo' ELSE 'Inativo' END,
        CASE WHEN NEW.ativo THEN 'Ativo' ELSE 'Inativo' END,
        'UPDATE'
      );
    END IF;

    RETURN NEW;
  END IF;

  -- DELETE - registra exclusão
  IF (TG_OP = 'DELETE') THEN
    INSERT INTO historico_usuarios (
      usuario_id, 
      usuario_alterou_id, 
      campo_alterado, 
      valor_anterior, 
      valor_novo, 
      tipo_operacao
    )
    VALUES (
      OLD.id, 
      usuario_atual_id, 
      'exclusao', 
      'Usuário existente', 
      NULL, 
      'DELETE'
    );
    
    RETURN OLD;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Criar trigger
CREATE TRIGGER trigger_historico_usuario
  AFTER INSERT OR UPDATE OR DELETE ON usuarios
  FOR EACH ROW
  EXECUTE FUNCTION registrar_historico_usuario();

-- 6. Desabilitar RLS (para testes)
ALTER TABLE historico_usuarios DISABLE ROW LEVEL SECURITY;

-- =====================================================
-- PRONTO! Agora teste atualizar um usuário
-- =====================================================
