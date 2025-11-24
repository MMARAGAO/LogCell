-- ============================================
-- SISTEMA DE HISTÓRICO AUTOMÁTICO PARA LOJAS
-- ============================================

-- 1. Criar tabela de histórico
CREATE TABLE IF NOT EXISTS public.historico_lojas (
  id SERIAL PRIMARY KEY,
  loja_id INTEGER NOT NULL,
  usuario_id UUID NOT NULL,
  operacao VARCHAR(10) NOT NULL, -- 'INSERT', 'UPDATE', 'DELETE'
  
  -- Dados ANTES da alteração (null para INSERT)
  dados_antigos JSONB,
  
  -- Dados DEPOIS da alteração (null para DELETE)
  dados_novos JSONB,
  
  -- Campos que foram modificados (apenas para UPDATE)
  campos_modificados TEXT[],
  
  -- Timestamp da operação
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraint de foreign key
  CONSTRAINT fk_loja FOREIGN KEY (loja_id) REFERENCES lojas(id) ON DELETE CASCADE,
  CONSTRAINT fk_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL
);

-- 2. Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_historico_lojas_loja_id ON historico_lojas(loja_id);
CREATE INDEX IF NOT EXISTS idx_historico_lojas_usuario_id ON historico_lojas(usuario_id);
CREATE INDEX IF NOT EXISTS idx_historico_lojas_operacao ON historico_lojas(operacao);
CREATE INDEX IF NOT EXISTS idx_historico_lojas_criado_em ON historico_lojas(criado_em DESC);

-- 3. Habilitar RLS
ALTER TABLE historico_lojas ENABLE ROW LEVEL SECURITY;

-- 4. Remover políticas antigas se existirem
DROP POLICY IF EXISTS "Usuários autenticados podem visualizar histórico" ON historico_lojas;

-- 5. Criar política RLS (apenas leitura para usuários autenticados)
CREATE POLICY "Usuários autenticados podem visualizar histórico"
ON historico_lojas
FOR SELECT
TO authenticated
USING (true);

-- ============================================
-- FUNÇÃO DO TRIGGER
-- ============================================

-- 6. Criar ou substituir a função que será executada pelo trigger
CREATE OR REPLACE FUNCTION registrar_historico_lojas()
RETURNS TRIGGER AS $$
DECLARE
  v_usuario_id UUID;
  v_campos_modificados TEXT[] := ARRAY[]::TEXT[];
  v_campo TEXT;
BEGIN
  -- Obter o ID do usuário autenticado
  v_usuario_id := auth.uid();
  
  -- Se não houver usuário autenticado, usar um UUID padrão (para operações do sistema)
  IF v_usuario_id IS NULL THEN
    v_usuario_id := '00000000-0000-0000-0000-000000000000'::UUID;
  END IF;

  -- INSERT: registrar criação
  IF (TG_OP = 'INSERT') THEN
    INSERT INTO historico_lojas (
      loja_id,
      usuario_id,
      operacao,
      dados_antigos,
      dados_novos,
      campos_modificados
    ) VALUES (
      NEW.id,
      v_usuario_id,
      'INSERT',
      NULL,
      to_jsonb(NEW),
      NULL
    );
    RETURN NEW;
  END IF;

  -- UPDATE: registrar alterações
  IF (TG_OP = 'UPDATE') THEN
    -- Identificar quais campos foram modificados
    IF OLD.nome IS DISTINCT FROM NEW.nome THEN
      v_campos_modificados := array_append(v_campos_modificados, 'nome');
    END IF;
    IF OLD.cnpj IS DISTINCT FROM NEW.cnpj THEN
      v_campos_modificados := array_append(v_campos_modificados, 'cnpj');
    END IF;
    IF OLD.telefone IS DISTINCT FROM NEW.telefone THEN
      v_campos_modificados := array_append(v_campos_modificados, 'telefone');
    END IF;
    IF OLD.email IS DISTINCT FROM NEW.email THEN
      v_campos_modificados := array_append(v_campos_modificados, 'email');
    END IF;
    IF OLD.endereco IS DISTINCT FROM NEW.endereco THEN
      v_campos_modificados := array_append(v_campos_modificados, 'endereco');
    END IF;
    IF OLD.cidade IS DISTINCT FROM NEW.cidade THEN
      v_campos_modificados := array_append(v_campos_modificados, 'cidade');
    END IF;
    IF OLD.estado IS DISTINCT FROM NEW.estado THEN
      v_campos_modificados := array_append(v_campos_modificados, 'estado');
    END IF;
    IF OLD.cep IS DISTINCT FROM NEW.cep THEN
      v_campos_modificados := array_append(v_campos_modificados, 'cep');
    END IF;
    IF OLD.ativo IS DISTINCT FROM NEW.ativo THEN
      v_campos_modificados := array_append(v_campos_modificados, 'ativo');
    END IF;

    -- Registrar apenas se houve mudanças (ignorar atualização de atualizado_em)
    IF array_length(v_campos_modificados, 1) > 0 THEN
      INSERT INTO historico_lojas (
        loja_id,
        usuario_id,
        operacao,
        dados_antigos,
        dados_novos,
        campos_modificados
      ) VALUES (
        NEW.id,
        v_usuario_id,
        'UPDATE',
        to_jsonb(OLD),
        to_jsonb(NEW),
        v_campos_modificados
      );
    END IF;
    
    RETURN NEW;
  END IF;

  -- DELETE: registrar exclusão
  IF (TG_OP = 'DELETE') THEN
    INSERT INTO historico_lojas (
      loja_id,
      usuario_id,
      operacao,
      dados_antigos,
      dados_novos,
      campos_modificados
    ) VALUES (
      OLD.id,
      v_usuario_id,
      'DELETE',
      to_jsonb(OLD),
      NULL,
      NULL
    );
    RETURN OLD;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- CRIAR O TRIGGER
-- ============================================

-- 7. Remover trigger antigo se existir
DROP TRIGGER IF EXISTS trigger_historico_lojas ON lojas;

-- 8. Criar o trigger que executará APÓS cada INSERT, UPDATE ou DELETE
CREATE TRIGGER trigger_historico_lojas
  AFTER INSERT OR UPDATE OR DELETE ON lojas
  FOR EACH ROW
  EXECUTE FUNCTION registrar_historico_lojas();

-- ============================================
-- VIEWS ÚTEIS PARA CONSULTA
-- ============================================

-- 9. View para consultar histórico com informações do usuário
CREATE OR REPLACE VIEW vw_historico_lojas AS
SELECT 
  hl.id,
  hl.loja_id,
  l.nome as loja_nome,
  hl.usuario_id,
  u.nome as usuario_nome,
  u.email as usuario_email,
  hl.operacao,
  hl.dados_antigos,
  hl.dados_novos,
  hl.campos_modificados,
  hl.criado_em
FROM historico_lojas hl
LEFT JOIN lojas l ON l.id = hl.loja_id
LEFT JOIN usuarios u ON u.id = hl.usuario_id
ORDER BY hl.criado_em DESC;

-- 10. Função auxiliar para obter histórico de uma loja específica
CREATE OR REPLACE FUNCTION obter_historico_loja(p_loja_id INTEGER)
RETURNS TABLE (
  id INTEGER,
  operacao VARCHAR(10),
  usuario_nome TEXT,
  usuario_email TEXT,
  campos_modificados TEXT[],
  dados_antigos JSONB,
  dados_novos JSONB,
  criado_em TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    hl.id,
    hl.operacao,
    u.nome as usuario_nome,
    u.email as usuario_email,
    hl.campos_modificados,
    hl.dados_antigos,
    hl.dados_novos,
    hl.criado_em
  FROM historico_lojas hl
  LEFT JOIN usuarios u ON u.id = hl.usuario_id
  WHERE hl.loja_id = p_loja_id
  ORDER BY hl.criado_em DESC;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- VERIFICAÇÃO
-- ============================================

-- Verificar estrutura da tabela
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns
WHERE table_name = 'historico_lojas'
ORDER BY ordinal_position;

-- Verificar se o trigger foi criado
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE event_object_table = 'lojas';

-- Verificar políticas RLS
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE tablename = 'historico_lojas'
ORDER BY policyname;

-- ============================================
-- EXEMPLOS DE USO
-- ============================================

/*
-- 1. Consultar todo o histórico usando a view
SELECT * FROM vw_historico_lojas;

-- 2. Consultar histórico de uma loja específica
SELECT * FROM obter_historico_loja(1);

-- 3. Consultar apenas alterações (UPDATE)
SELECT * FROM vw_historico_lojas WHERE operacao = 'UPDATE';

-- 4. Consultar alterações nos últimos 7 dias
SELECT * FROM vw_historico_lojas 
WHERE criado_em >= NOW() - INTERVAL '7 days';

-- 5. Ver quais campos foram alterados em cada UPDATE
SELECT 
  id,
  loja_nome,
  usuario_nome,
  campos_modificados,
  criado_em
FROM vw_historico_lojas
WHERE operacao = 'UPDATE'
AND array_length(campos_modificados, 1) > 0;

-- 6. Comparar valor antigo vs novo de um campo específico
SELECT 
  id,
  loja_nome,
  usuario_nome,
  dados_antigos->>'nome' as nome_antigo,
  dados_novos->>'nome' as nome_novo,
  criado_em
FROM vw_historico_lojas
WHERE operacao = 'UPDATE'
AND 'nome' = ANY(campos_modificados);

-- 7. Verificar quem desativou lojas
SELECT 
  loja_nome,
  usuario_nome,
  dados_antigos->>'ativo' as estava_ativo,
  dados_novos->>'ativo' as ficou_ativo,
  criado_em
FROM vw_historico_lojas
WHERE operacao = 'UPDATE'
AND 'ativo' = ANY(campos_modificados)
AND (dados_novos->>'ativo')::boolean = false;

-- 8. Auditoria: listar todas as ações de um usuário específico
SELECT * FROM vw_historico_lojas
WHERE usuario_email = 'usuario@exemplo.com'
ORDER BY criado_em DESC;
*/
