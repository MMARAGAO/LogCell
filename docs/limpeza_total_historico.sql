-- =====================================================
-- LIMPEZA TOTAL E COMPLETA
-- =====================================================

-- 1. Remover TODOS os triggers da tabela usuarios (relacionados a historico)
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (
        SELECT trigger_name 
        FROM information_schema.triggers 
        WHERE event_object_table = 'usuarios' 
        AND trigger_name LIKE '%historico%'
    ) LOOP
        EXECUTE 'DROP TRIGGER IF EXISTS ' || r.trigger_name || ' ON usuarios CASCADE';
    END LOOP;
END $$;

-- 2. Remover TODAS as funções relacionadas a historico_usuario
DROP FUNCTION IF EXISTS registrar_historico_usuario() CASCADE;
DROP FUNCTION IF EXISTS public.registrar_historico_usuario() CASCADE;

-- 3. Remover tabela
DROP TABLE IF EXISTS historico_usuarios CASCADE;
DROP TABLE IF EXISTS public.historico_usuarios CASCADE;

-- 4. Aguardar 2 segundos
SELECT pg_sleep(2);

-- 5. Recriar TUDO do zero
CREATE TABLE historico_usuarios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario_id UUID NOT NULL,
  usuario_alterou_id UUID,
  campo_alterado VARCHAR(100) NOT NULL,
  valor_anterior TEXT,
  valor_novo TEXT,
  tipo_operacao VARCHAR(20) NOT NULL,
  data_alteracao TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Adicionar foreign keys DEPOIS
ALTER TABLE historico_usuarios 
  ADD CONSTRAINT fk_usuario_id 
  FOREIGN KEY (usuario_id) 
  REFERENCES usuarios(id) 
  ON DELETE CASCADE;

ALTER TABLE historico_usuarios 
  ADD CONSTRAINT fk_usuario_alterou_id 
  FOREIGN KEY (usuario_alterou_id) 
  REFERENCES usuarios(id) 
  ON DELETE SET NULL;

-- 7. Adicionar check constraint
ALTER TABLE historico_usuarios 
  ADD CONSTRAINT check_tipo_operacao 
  CHECK (tipo_operacao IN ('INSERT', 'UPDATE', 'DELETE'));

-- 8. Criar índices
CREATE INDEX idx_historico_usuarios_usuario_id ON historico_usuarios(usuario_id);
CREATE INDEX idx_historico_usuarios_data ON historico_usuarios(data_alteracao DESC);
CREATE INDEX idx_historico_usuarios_alterou ON historico_usuarios(usuario_alterou_id);

-- 9. Criar função NOVA
CREATE FUNCTION registrar_historico_usuario()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_usuario_atual_id UUID;
BEGIN
  v_usuario_atual_id := auth.uid();

  IF (TG_OP = 'INSERT') THEN
    INSERT INTO historico_usuarios (usuario_id, usuario_alterou_id, campo_alterado, valor_anterior, valor_novo, tipo_operacao)
    VALUES (NEW.id, v_usuario_atual_id, 'criacao', NULL, 'Usuário criado', 'INSERT');
    RETURN NEW;
  END IF;

  IF (TG_OP = 'UPDATE') THEN
    IF OLD.nome IS DISTINCT FROM NEW.nome THEN
      INSERT INTO historico_usuarios (usuario_id, usuario_alterou_id, campo_alterado, valor_anterior, valor_novo, tipo_operacao)
      VALUES (NEW.id, v_usuario_atual_id, 'nome', OLD.nome, NEW.nome, 'UPDATE');
    END IF;

    IF OLD.email IS DISTINCT FROM NEW.email THEN
      INSERT INTO historico_usuarios (usuario_id, usuario_alterou_id, campo_alterado, valor_anterior, valor_novo, tipo_operacao)
      VALUES (NEW.id, v_usuario_atual_id, 'email', OLD.email, NEW.email, 'UPDATE');
    END IF;

    IF OLD.cpf IS DISTINCT FROM NEW.cpf THEN
      INSERT INTO historico_usuarios (usuario_id, usuario_alterou_id, campo_alterado, valor_anterior, valor_novo, tipo_operacao)
      VALUES (NEW.id, v_usuario_atual_id, 'cpf', OLD.cpf, NEW.cpf, 'UPDATE');
    END IF;

    IF OLD.telefone IS DISTINCT FROM NEW.telefone THEN
      INSERT INTO historico_usuarios (usuario_id, usuario_alterou_id, campo_alterado, valor_anterior, valor_novo, tipo_operacao)
      VALUES (NEW.id, v_usuario_atual_id, 'telefone', OLD.telefone, NEW.telefone, 'UPDATE');
    END IF;

    IF OLD.ativo IS DISTINCT FROM NEW.ativo THEN
      INSERT INTO historico_usuarios (usuario_id, usuario_alterou_id, campo_alterado, valor_anterior, valor_novo, tipo_operacao)
      VALUES (NEW.id, v_usuario_atual_id, 'status', 
              CASE WHEN OLD.ativo THEN 'Ativo' ELSE 'Inativo' END,
              CASE WHEN NEW.ativo THEN 'Ativo' ELSE 'Inativo' END,
              'UPDATE');
    END IF;

    RETURN NEW;
  END IF;

  IF (TG_OP = 'DELETE') THEN
    INSERT INTO historico_usuarios (usuario_id, usuario_alterou_id, campo_alterado, valor_anterior, valor_novo, tipo_operacao)
    VALUES (OLD.id, v_usuario_atual_id, 'exclusao', 'Usuário existente', NULL, 'DELETE');
    RETURN OLD;
  END IF;

  RETURN NULL;
END;
$$;

-- 10. Criar trigger NOVO
CREATE TRIGGER trigger_historico_usuario
  AFTER INSERT OR UPDATE OR DELETE ON usuarios
  FOR EACH ROW
  EXECUTE FUNCTION registrar_historico_usuario();

-- 11. Desabilitar RLS
ALTER TABLE historico_usuarios DISABLE ROW LEVEL SECURITY;

-- =====================================================
-- CONCLUÍDO - Teste atualizar um usuário agora
-- =====================================================
