-- =====================================================
-- FIX: CANCELAMENTO E DEVOLUÇÃO DE ESTOQUE
-- =====================================================
-- Este script corrige a lógica de cancelamento de OS
-- para devolver produtos ao estoque corretamente
-- =====================================================

-- 1. Verificar se as colunas existem
DO $$ 
BEGIN
  -- Adicionar coluna estoque_reservado se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'ordem_servico_pecas' 
    AND column_name = 'estoque_reservado'
  ) THEN
    ALTER TABLE ordem_servico_pecas 
    ADD COLUMN estoque_reservado BOOLEAN DEFAULT FALSE;
  END IF;

  -- Adicionar coluna estoque_baixado se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'ordem_servico_pecas' 
    AND column_name = 'estoque_baixado'
  ) THEN
    ALTER TABLE ordem_servico_pecas 
    ADD COLUMN estoque_baixado BOOLEAN DEFAULT TRUE; -- TRUE porque já baixamos no código atual
  END IF;
END $$;

-- 2. Atualizar registros existentes
-- Marcar todas as peças existentes como já baixadas (comportamento atual)
UPDATE ordem_servico_pecas 
SET estoque_baixado = TRUE, 
    estoque_reservado = TRUE
WHERE tipo_produto = 'estoque' 
  AND id_produto IS NOT NULL;

-- 3. Criar índices se não existirem
CREATE INDEX IF NOT EXISTS idx_os_pecas_estoque_reservado ON ordem_servico_pecas(estoque_reservado);
CREATE INDEX IF NOT EXISTS idx_os_pecas_estoque_baixado ON ordem_servico_pecas(estoque_baixado);

-- 4. Função para devolver peças ao estoque quando OS é cancelada
CREATE OR REPLACE FUNCTION devolver_pecas_ao_cancelar_os()
RETURNS TRIGGER AS $$
DECLARE
  v_peca RECORD;
  v_quantidade_anterior INTEGER;
  v_quantidade_nova INTEGER;
BEGIN
  -- Verificar se mudou para cancelado
  IF NEW.status = 'cancelado' AND (OLD.status IS NULL OR OLD.status != 'cancelado') THEN
    
    -- Processar cada peça do estoque desta OS
    FOR v_peca IN 
      SELECT 
        osp.*,
        p.descricao as produto_descricao
      FROM ordem_servico_pecas osp
      LEFT JOIN produtos p ON p.id = osp.id_produto
      WHERE osp.id_ordem_servico = NEW.id 
        AND osp.tipo_produto = 'estoque'
        AND osp.id_produto IS NOT NULL
        AND osp.id_loja IS NOT NULL
    LOOP
      
      -- Verificar se estoque foi baixado
      IF v_peca.estoque_baixado = TRUE THEN
        
        -- Buscar quantidade atual do estoque
        SELECT quantidade INTO v_quantidade_anterior
        FROM estoque_lojas
        WHERE id_produto = v_peca.id_produto
          AND id_loja = v_peca.id_loja;
        
        -- Calcular nova quantidade
        v_quantidade_nova := COALESCE(v_quantidade_anterior, 0) + v_peca.quantidade;
        
        -- Devolver ao estoque
        UPDATE estoque_lojas
        SET quantidade = v_quantidade_nova,
            atualizado_por = NEW.atualizado_por
        WHERE id_produto = v_peca.id_produto
          AND id_loja = v_peca.id_loja;
        
        -- Registrar no histórico
        INSERT INTO historico_estoque (
          id_produto,
          id_loja,
          id_ordem_servico,
          tipo_movimentacao,
          quantidade_alterada,
          quantidade_anterior,
          quantidade_nova,
          motivo,
          observacao,
          usuario_id
        ) VALUES (
          v_peca.id_produto,
          v_peca.id_loja,
          NEW.id,
          'entrada',
          v_peca.quantidade,
          v_quantidade_anterior,
          v_quantidade_nova,
          'Devolução por cancelamento de OS #' || NEW.numero_os,
          COALESCE(v_peca.produto_descricao, v_peca.descricao_peca),
          NEW.atualizado_por
        );
        
        -- Atualizar flags da peça
        UPDATE ordem_servico_pecas
        SET estoque_baixado = FALSE,
            estoque_reservado = FALSE
        WHERE id = v_peca.id;
        
      ELSIF v_peca.estoque_reservado = TRUE THEN
        -- Se apenas estava reservado, só liberar a reserva
        UPDATE ordem_servico_pecas
        SET estoque_reservado = FALSE
        WHERE id = v_peca.id;
        
        -- Registrar liberação no histórico
        INSERT INTO historico_estoque (
          id_produto,
          id_loja,
          id_ordem_servico,
          tipo_movimentacao,
          quantidade_alterada,
          quantidade_anterior,
          quantidade_nova,
          motivo,
          observacao,
          usuario_id
        ) VALUES (
          v_peca.id_produto,
          v_peca.id_loja,
          NEW.id,
          'liberacao_reserva',
          0,
          0,
          0,
          'Liberação de reserva por cancelamento de OS #' || NEW.numero_os,
          COALESCE(v_peca.produto_descricao, v_peca.descricao_peca),
          NEW.atualizado_por
        );
      END IF;
      
    END LOOP;
    
    -- Registrar evento no histórico da OS (se a tabela existir)
    BEGIN
      INSERT INTO historico_ordem_servico (
        id_ordem_servico,
        tipo_evento,
        status_anterior,
        status_novo,
        descricao,
        criado_por
      ) VALUES (
        NEW.id,
        'cancelamento',
        OLD.status,
        'cancelado',
        'OS cancelada - Peças devolvidas ao estoque',
        NEW.atualizado_por
      );
    EXCEPTION
      WHEN undefined_table THEN
        -- Tabela historico_ordem_servico não existe, ignorar
        NULL;
      WHEN undefined_column THEN
        -- Coluna criado_por não existe, ignorar
        NULL;
    END;
    
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Criar trigger para cancelamento
DROP TRIGGER IF EXISTS trigger_devolver_pecas_ao_cancelar ON ordem_servico;

CREATE TRIGGER trigger_devolver_pecas_ao_cancelar
  AFTER UPDATE OF status ON ordem_servico
  FOR EACH ROW
  EXECUTE FUNCTION devolver_pecas_ao_cancelar_os();

-- 6. Verificar se trigger foi criado
SELECT 
  'Trigger criado com sucesso!' as status,
  tgname as trigger_name,
  tgenabled as enabled
FROM pg_trigger 
WHERE tgname = 'trigger_devolver_pecas_ao_cancelar';

-- 7. Teste: Mostrar estrutura da tabela ordem_servico_pecas
SELECT 
  column_name,
  data_type,
  column_default,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'ordem_servico_pecas'
  AND column_name IN ('estoque_reservado', 'estoque_baixado')
ORDER BY ordinal_position;

-- =====================================================
-- INSTRUÇÕES DE USO
-- =====================================================
-- 1. Execute este script no Supabase SQL Editor
-- 2. O trigger irá devolver automaticamente os produtos
--    ao estoque quando uma OS for cancelada
-- 3. Apenas peças do tipo 'estoque' são processadas
-- 4. Peças 'avulso' não afetam o estoque
-- =====================================================
