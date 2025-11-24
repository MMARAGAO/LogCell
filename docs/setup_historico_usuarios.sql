-- =====================================================
-- HISTÓRICO DE ALTERAÇÕES DE USUÁRIOS
-- =====================================================
-- Este script cria a tabela de histórico e trigger automático
-- para registrar todas as alterações feitas em usuários

-- 1. Remover objetos existentes (se houver)
DROP TRIGGER IF EXISTS trigger_historico_usuario ON usuarios;
DROP FUNCTION IF EXISTS registrar_historico_usuario();
DROP TABLE IF EXISTS historico_usuarios CASCADE;

-- 2. Criar tabela de histórico
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

-- 4. Função para registrar alterações automaticamente
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

-- 5. Criar trigger que executa a função em todas as operações
CREATE TRIGGER trigger_historico_usuario
  AFTER INSERT OR UPDATE OR DELETE ON usuarios
  FOR EACH ROW
  EXECUTE FUNCTION registrar_historico_usuario();

-- 6. Habilitar RLS
ALTER TABLE historico_usuarios ENABLE ROW LEVEL SECURITY;

-- 7. Políticas RLS (Row Level Security)

-- Política para SELECT - Todos autenticados podem ver
DROP POLICY IF EXISTS "Usuários autenticados podem ver histórico" ON historico_usuarios;
CREATE POLICY "Usuários autenticados podem ver histórico"
  ON historico_usuarios
  FOR SELECT
  TO authenticated
  USING (true);

-- Política para INSERT - Permitir inserção via trigger (service_role e authenticated)
DROP POLICY IF EXISTS "Sistema pode inserir histórico" ON historico_usuarios;
CREATE POLICY "Sistema pode inserir histórico"
  ON historico_usuarios
  FOR INSERT
  WITH CHECK (true);

-- Política para UPDATE - Bloqueado (histórico imutável)
DROP POLICY IF EXISTS "Histórico é imutável" ON historico_usuarios;
CREATE POLICY "Histórico é imutável"
  ON historico_usuarios
  FOR UPDATE
  TO authenticated
  USING (false);

-- Política para DELETE - Bloqueado (auditoria permanente)
DROP POLICY IF EXISTS "Histórico não pode ser deletado" ON historico_usuarios;
CREATE POLICY "Histórico não pode ser deletado"
  ON historico_usuarios
  FOR DELETE
  TO authenticated
  USING (false);

-- =====================================================
-- COMENTÁRIOS E DOCUMENTAÇÃO
-- =====================================================

COMMENT ON TABLE historico_usuarios IS 'Registra todas as alterações feitas em usuários';
COMMENT ON COLUMN historico_usuarios.usuario_id IS 'ID do usuário que foi alterado';
COMMENT ON COLUMN historico_usuarios.usuario_alterou_id IS 'ID do usuário que fez a alteração';
COMMENT ON COLUMN historico_usuarios.campo_alterado IS 'Nome do campo que foi modificado';
COMMENT ON COLUMN historico_usuarios.valor_anterior IS 'Valor antes da alteração';
COMMENT ON COLUMN historico_usuarios.valor_novo IS 'Valor depois da alteração';
COMMENT ON COLUMN historico_usuarios.tipo_operacao IS 'Tipo de operação: INSERT, UPDATE ou DELETE';
COMMENT ON COLUMN historico_usuarios.data_alteracao IS 'Data e hora da alteração';

-- =====================================================
-- FIM DO SCRIPT
-- =====================================================
