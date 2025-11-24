-- =====================================================
-- FIX: CANCELAMENTO E DEVOLUÇÃO DE ESTOQUE (SIMPLIFICADO)
-- =====================================================
-- Versão simplificada que funciona com o schema atual
-- =====================================================

-- 1. Verificar e adicionar colunas de controle
DO $$ 
BEGIN
  -- Adicionar coluna estoque_baixado se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'ordem_servico_pecas' 
    AND column_name = 'estoque_baixado'
  ) THEN
    ALTER TABLE ordem_servico_pecas 
    ADD COLUMN estoque_baixado BOOLEAN DEFAULT TRUE;
    
    RAISE NOTICE 'Coluna estoque_baixado criada';
  ELSE
    RAISE NOTICE 'Coluna estoque_baixado já existe';
  END IF;
END $$;

-- 2. Atualizar registros existentes
DO $$
BEGIN
  UPDATE ordem_servico_pecas 
  SET estoque_baixado = TRUE
  WHERE tipo_produto = 'estoque' 
    AND id_produto IS NOT NULL
    AND estoque_baixado IS NULL;
  
  RAISE NOTICE 'Registros existentes atualizados';
END $$;

-- 3. Criar índice
CREATE INDEX IF NOT EXISTS idx_os_pecas_estoque_baixado 
ON ordem_servico_pecas(estoque_baixado);

-- 4. Função para devolver peças ao estoque
CREATE OR REPLACE FUNCTION devolver_pecas_ao_cancelar_os()
RETURNS TRIGGER AS $$
DECLARE
  v_peca RECORD;
  v_quantidade_anterior INTEGER;
  v_quantidade_nova INTEGER;
BEGIN
  -- Verificar se mudou para cancelado
  IF NEW.status = 'cancelado' AND (OLD.status IS NULL OR OLD.status != 'cancelado') THEN
    
    RAISE NOTICE 'OS % foi cancelada, devolvendo peças...', NEW.numero_os;
    
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
      
      RAISE NOTICE 'Processando peça: % (quantidade: %)', v_peca.descricao_peca, v_peca.quantidade;
      
      -- Verificar se estoque foi baixado
      IF COALESCE(v_peca.estoque_baixado, TRUE) = TRUE THEN
        
        -- Buscar quantidade atual do estoque
        SELECT quantidade INTO v_quantidade_anterior
        FROM estoque_lojas
        WHERE id_produto = v_peca.id_produto
          AND id_loja = v_peca.id_loja;
        
        IF v_quantidade_anterior IS NULL THEN
          RAISE NOTICE 'Produto não encontrado no estoque da loja %', v_peca.id_loja;
          CONTINUE;
        END IF;
        
        -- Calcular nova quantidade
        v_quantidade_nova := v_quantidade_anterior + v_peca.quantidade;
        
        RAISE NOTICE 'Devolvendo: % -> % unidades', v_quantidade_anterior, v_quantidade_nova;
        
        -- Devolver ao estoque
        UPDATE estoque_lojas
        SET quantidade = v_quantidade_nova,
            atualizado_por = NEW.atualizado_por,
            atualizado_em = NOW()
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
        
        -- Atualizar flag da peça
        UPDATE ordem_servico_pecas
        SET estoque_baixado = FALSE
        WHERE id = v_peca.id;
        
        RAISE NOTICE 'Peça devolvida com sucesso!';
        
      ELSE
        RAISE NOTICE 'Peça já foi devolvida anteriormente';
      END IF;
      
    END LOOP;
    
    RAISE NOTICE 'Devolução concluída para OS %', NEW.numero_os;
    
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Remover trigger antigo se existir
DROP TRIGGER IF EXISTS trigger_devolver_pecas_ao_cancelar ON ordem_servico;

-- 6. Criar novo trigger
CREATE TRIGGER trigger_devolver_pecas_ao_cancelar
  AFTER UPDATE OF status ON ordem_servico
  FOR EACH ROW
  EXECUTE FUNCTION devolver_pecas_ao_cancelar_os();

-- 7. Verificar se foi criado
SELECT 
  'Trigger criado com sucesso!' as status,
  tgname as trigger_name,
  tgenabled as enabled,
  pg_get_triggerdef(oid) as definition
FROM pg_trigger 
WHERE tgname = 'trigger_devolver_pecas_ao_cancelar';

-- =====================================================
-- TESTE RÁPIDO (OPCIONAL)
-- =====================================================
-- Descomente as linhas abaixo para testar

/*
-- 1. Ver todas as OS que podem ser testadas
SELECT id, numero_os, status, cliente_nome 
FROM ordem_servico 
WHERE status != 'cancelado' 
LIMIT 5;

-- 2. Ver peças de uma OS específica (substitua o ID)
SELECT 
  osp.*,
  p.descricao,
  el.quantidade as estoque_atual
FROM ordem_servico_pecas osp
LEFT JOIN produtos p ON p.id = osp.id_produto
LEFT JOIN estoque_lojas el ON el.id_produto = osp.id_produto AND el.id_loja = osp.id_loja
WHERE osp.id_ordem_servico = 'SEU_ID_AQUI';

-- 3. Cancelar uma OS para testar (substitua o ID e user_id)
UPDATE ordem_servico 
SET status = 'cancelado', 
    atualizado_por = 'SEU_USER_ID_AQUI'
WHERE id = 'SEU_ID_AQUI';

-- 4. Verificar se o estoque foi devolvido
SELECT * FROM historico_estoque 
WHERE tipo_movimentacao = 'entrada' 
AND motivo LIKE '%cancelamento%'
ORDER BY criado_em DESC 
LIMIT 5;
*/

-- =====================================================
-- FIM DO SCRIPT
-- =====================================================
