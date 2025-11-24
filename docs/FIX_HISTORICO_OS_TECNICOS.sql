-- =====================================================
-- FIX: HISTÓRICO OS - SUPORTE A TÉCNICOS
-- =====================================================
-- PROBLEMA: Trigger registrar_historico_os() busca nome apenas em usuarios
-- SOLUÇÃO: Modificar para buscar em usuarios OU tecnicos
-- =====================================================

-- 1. Recriar função com suporte a técnicos
CREATE OR REPLACE FUNCTION registrar_historico_os()
RETURNS TRIGGER AS $$
DECLARE
  v_tipo_evento VARCHAR(50);
  v_descricao TEXT;
  v_usuario_nome VARCHAR(255);
BEGIN
  -- Buscar nome do usuário (admin OU técnico)
  -- Primeiro tenta em usuarios, depois em tecnicos
  SELECT nome INTO v_usuario_nome
  FROM usuarios
  WHERE id = COALESCE(NEW.atualizado_por, NEW.criado_por)
  LIMIT 1;
  
  -- Se não encontrou em usuarios, busca em tecnicos
  IF v_usuario_nome IS NULL THEN
    SELECT nome INTO v_usuario_nome
    FROM tecnicos
    WHERE usuario_id = COALESCE(NEW.atualizado_por, NEW.criado_por)
    LIMIT 1;
  END IF;
  
  -- Se ainda não encontrou, usa identificador genérico
  IF v_usuario_nome IS NULL THEN
    v_usuario_nome := 'Usuário não identificado';
  END IF;

  IF TG_OP = 'INSERT' THEN
    v_tipo_evento := 'criacao';
    v_descricao := 'Ordem de Serviço criada - OS #' || NEW.numero_os;
    
    INSERT INTO historico_ordem_servico (
      id_ordem_servico,
      tipo_evento,
      status_novo,
      descricao,
      dados_novos,
      criado_por,
      criado_por_nome
    ) VALUES (
      NEW.id,
      v_tipo_evento,
      NEW.status,
      v_descricao,
      to_jsonb(NEW),
      NEW.criado_por,
      v_usuario_nome
    );
    
  ELSIF TG_OP = 'UPDATE' THEN
    -- Detectar tipo de mudança
    IF OLD.status != NEW.status THEN
      v_tipo_evento := 'mudanca_status';
      v_descricao := 'Status alterado de "' || OLD.status || '" para "' || NEW.status || '"';
      
      INSERT INTO historico_ordem_servico (
        id_ordem_servico,
        tipo_evento,
        status_anterior,
        status_novo,
        descricao,
        dados_anteriores,
        dados_novos,
        criado_por,
        criado_por_nome
      ) VALUES (
        NEW.id,
        v_tipo_evento,
        OLD.status,
        NEW.status,
        v_descricao,
        to_jsonb(OLD),
        to_jsonb(NEW),
        NEW.atualizado_por,
        v_usuario_nome
      );
    END IF;
    
    -- Registrar mudança de técnico responsável
    IF COALESCE(OLD.tecnico_responsavel::TEXT, '') != COALESCE(NEW.tecnico_responsavel::TEXT, '') THEN
      DECLARE
        v_tecnico_nome VARCHAR(255);
      BEGIN
        IF NEW.tecnico_responsavel IS NOT NULL THEN
          SELECT nome INTO v_tecnico_nome
          FROM tecnicos
          WHERE usuario_id = NEW.tecnico_responsavel
          LIMIT 1;
          
          v_descricao := 'OS atribuída ao técnico: ' || COALESCE(v_tecnico_nome, 'Técnico não identificado');
        ELSE
          v_descricao := 'Técnico responsável removido';
        END IF;
        
        INSERT INTO historico_ordem_servico (
          id_ordem_servico,
          tipo_evento,
          descricao,
          dados_anteriores,
          dados_novos,
          criado_por,
          criado_por_nome
        ) VALUES (
          NEW.id,
          'atribuicao_tecnico',
          v_descricao,
          jsonb_build_object('tecnico_responsavel', OLD.tecnico_responsavel),
          jsonb_build_object('tecnico_responsavel', NEW.tecnico_responsavel),
          NEW.atualizado_por,
          v_usuario_nome
        );
      END;
    END IF;
    
    -- Registrar mudança nas observações técnicas
    IF COALESCE(OLD.observacoes_tecnicas, '') != COALESCE(NEW.observacoes_tecnicas, '') THEN
      INSERT INTO historico_ordem_servico (
        id_ordem_servico,
        tipo_evento,
        descricao,
        dados_anteriores,
        dados_novos,
        criado_por,
        criado_por_nome
      ) VALUES (
        NEW.id,
        'observacao',
        'Observações técnicas atualizadas',
        jsonb_build_object('observacoes_tecnicas', OLD.observacoes_tecnicas),
        jsonb_build_object('observacoes_tecnicas', NEW.observacoes_tecnicas),
        NEW.atualizado_por,
        v_usuario_nome
      );
    END IF;
    
    -- Registrar conclusão da OS
    IF NEW.data_conclusao IS NOT NULL AND OLD.data_conclusao IS NULL THEN
      INSERT INTO historico_ordem_servico (
        id_ordem_servico,
        tipo_evento,
        descricao,
        dados_novos,
        criado_por,
        criado_por_nome
      ) VALUES (
        NEW.id,
        'conclusao',
        'OS concluída pelo técnico',
        jsonb_build_object(
          'data_conclusao', NEW.data_conclusao,
          'observacoes_tecnicas', NEW.observacoes_tecnicas
        ),
        NEW.atualizado_por,
        v_usuario_nome
      );
    END IF;
    
    -- Registrar outras mudanças importantes de valores
    IF OLD.valor_total != NEW.valor_total OR 
       OLD.valor_orcamento != NEW.valor_orcamento OR
       OLD.valor_pago != NEW.valor_pago THEN
      INSERT INTO historico_ordem_servico (
        id_ordem_servico,
        tipo_evento,
        descricao,
        dados_anteriores,
        dados_novos,
        criado_por,
        criado_por_nome
      ) VALUES (
        NEW.id,
        'atualizacao_valores',
        'Valores atualizados',
        jsonb_build_object(
          'valor_orcamento', OLD.valor_orcamento,
          'valor_total', OLD.valor_total,
          'valor_pago', OLD.valor_pago,
          'valor_desconto', OLD.valor_desconto
        ),
        jsonb_build_object(
          'valor_orcamento', NEW.valor_orcamento,
          'valor_total', NEW.valor_total,
          'valor_pago', NEW.valor_pago,
          'valor_desconto', NEW.valor_desconto
        ),
        NEW.atualizado_por,
        v_usuario_nome
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Verificar se trigger está ativo
SELECT 
  tgname as trigger_name,
  tgenabled as enabled,
  tgrelid::regclass as table_name
FROM pg_trigger
WHERE tgname = 'trigger_historico_os';

-- 3. Se não existir, criar o trigger
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'trigger_historico_os'
  ) THEN
    CREATE TRIGGER trigger_historico_os
      AFTER INSERT OR UPDATE ON ordem_servico
      FOR EACH ROW
      EXECUTE FUNCTION registrar_historico_os();
    
    RAISE NOTICE 'Trigger criado com sucesso!';
  ELSE
    RAISE NOTICE 'Trigger já existe!';
  END IF;
END $$;

-- =====================================================
-- TESTE: Verificar histórico
-- =====================================================
-- Execute depois de fazer alterações com técnico
SELECT 
  h.tipo_evento,
  h.status_anterior,
  h.status_novo,
  h.descricao,
  h.criado_por_nome,
  h.criado_em,
  h.dados_anteriores->>'observacoes_tecnicas' as obs_antigas,
  h.dados_novos->>'observacoes_tecnicas' as obs_novas
FROM historico_ordem_servico h
WHERE h.id_ordem_servico = (
  SELECT id FROM ordem_servico ORDER BY criado_em DESC LIMIT 1
)
ORDER BY h.criado_em DESC
LIMIT 10;

-- =====================================================
-- RESULTADO ESPERADO:
-- =====================================================
-- ✅ Função atualizada para buscar nome em usuarios OU tecnicos
-- ✅ Registro de mudança de status com nome do técnico
-- ✅ Registro de atribuição de técnico
-- ✅ Registro de observações técnicas
-- ✅ Registro de conclusão da OS
-- ✅ Todos os eventos com criado_por_nome preenchido corretamente
