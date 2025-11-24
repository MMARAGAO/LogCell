-- =====================================================
-- FIX DEFINITIVO: CANCELAMENTO COM DEVOLUÇÃO DE ESTOQUE
-- =====================================================
-- Esta versão limpa TUDO e recria corretamente
-- =====================================================

-- PASSO 1: LIMPAR TUDO
-- =====================================================

-- Dropar todos os triggers relacionados
DROP TRIGGER IF EXISTS trigger_devolver_pecas_ao_cancelar ON ordem_servico CASCADE;
DROP TRIGGER IF EXISTS devolver_pecas_estoque_os ON ordem_servico CASCADE;
DROP TRIGGER IF EXISTS trigger_ordem_servico_status ON ordem_servico CASCADE;
DROP TRIGGER IF EXISTS trigger_devolver_pecas_estoque ON ordem_servico CASCADE;

-- Dropar funções antigas
DROP FUNCTION IF EXISTS devolver_pecas_ao_cancelar_os() CASCADE;
DROP FUNCTION IF EXISTS devolver_pecas_estoque_os() CASCADE;

SELECT 'Triggers e funções antigas removidas' as status;

-- PASSO 2: VERIFICAR ESTRUTURA
-- =====================================================

-- Ver colunas da tabela historico_estoque
DO $$
DECLARE
  v_colunas TEXT;
BEGIN
  SELECT string_agg(column_name, ', ' ORDER BY ordinal_position)
  INTO v_colunas
  FROM information_schema.columns
  WHERE table_name = 'historico_estoque';
  
  RAISE NOTICE 'Colunas em historico_estoque: %', v_colunas;
END $$;

-- PASSO 3: ADICIONAR COLUNA DE CONTROLE
-- =====================================================

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
    RAISE NOTICE 'Coluna estoque_baixado CRIADA';
  ELSE
    RAISE NOTICE 'Coluna estoque_baixado já existe';
  END IF;
END $$;

-- Atualizar registros existentes
UPDATE ordem_servico_pecas 
SET estoque_baixado = TRUE
WHERE tipo_produto = 'estoque' 
  AND id_produto IS NOT NULL
  AND (estoque_baixado IS NULL OR estoque_baixado = FALSE);

-- Criar índice
CREATE INDEX IF NOT EXISTS idx_os_pecas_estoque_baixado 
ON ordem_servico_pecas(estoque_baixado);

SELECT 'Coluna estoque_baixado configurada' as status;

-- PASSO 4: CRIAR FUNÇÃO NOVA (SEM ERROS)
-- =====================================================

CREATE OR REPLACE FUNCTION devolver_pecas_ao_cancelar_os()
RETURNS TRIGGER AS $$
DECLARE
  v_peca RECORD;
  v_quantidade_anterior INTEGER;
  v_quantidade_nova INTEGER;
  v_contador INTEGER := 0;
BEGIN
  -- Verificar se mudou para cancelado
  IF NEW.status = 'cancelado' AND (OLD.status IS NULL OR OLD.status != 'cancelado') THEN
    
    RAISE NOTICE '=== INICIANDO DEVOLUÇÃO PARA OS % ===', NEW.numero_os;
    
    -- Processar cada peça do estoque desta OS
    FOR v_peca IN 
      SELECT 
        osp.id,
        osp.id_produto,
        osp.id_loja,
        osp.tipo_produto,
        osp.descricao_peca,
        osp.quantidade,
        osp.estoque_baixado,
        p.descricao as produto_descricao
      FROM ordem_servico_pecas osp
      LEFT JOIN produtos p ON p.id = osp.id_produto
      WHERE osp.id_ordem_servico = NEW.id 
        AND osp.tipo_produto = 'estoque'
        AND osp.id_produto IS NOT NULL
        AND osp.id_loja IS NOT NULL
    LOOP
      
      RAISE NOTICE 'Peça: % (qtd: %) - Baixado: %', 
        v_peca.descricao_peca, 
        v_peca.quantidade, 
        COALESCE(v_peca.estoque_baixado, TRUE);
      
      -- Verificar se estoque foi baixado
      IF COALESCE(v_peca.estoque_baixado, TRUE) = TRUE THEN
        
        -- Buscar quantidade atual do estoque
        SELECT quantidade INTO v_quantidade_anterior
        FROM estoque_lojas
        WHERE id_produto = v_peca.id_produto
          AND id_loja = v_peca.id_loja;
        
        IF v_quantidade_anterior IS NULL THEN
          RAISE NOTICE '  ⚠️ Produto não encontrado no estoque da loja %', v_peca.id_loja;
          CONTINUE;
        END IF;
        
        -- Calcular nova quantidade
        v_quantidade_nova := v_quantidade_anterior + v_peca.quantidade;
        
        RAISE NOTICE '  ↗️ Devolvendo: % -> % unidades', v_quantidade_anterior, v_quantidade_nova;
        
        -- Devolver ao estoque
        UPDATE estoque_lojas
        SET quantidade = v_quantidade_nova,
            atualizado_por = NEW.atualizado_por,
            atualizado_em = NOW()
        WHERE id_produto = v_peca.id_produto
          AND id_loja = v_peca.id_loja;
        
        -- Registrar no histórico (USANDO AS COLUNAS CORRETAS)
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
          usuario_id  -- COLUNA CORRETA!
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
          NEW.atualizado_por  -- usuario_id
        );
        
        -- Atualizar flag da peça
        UPDATE ordem_servico_pecas
        SET estoque_baixado = FALSE
        WHERE id = v_peca.id;
        
        v_contador := v_contador + 1;
        RAISE NOTICE '  ✅ Peça devolvida!';
        
      ELSE
        RAISE NOTICE '  ℹ️ Peça já foi devolvida anteriormente';
      END IF;
      
    END LOOP;
    
    RAISE NOTICE '=== DEVOLUÇÃO CONCLUÍDA: % peças processadas ===', v_contador;
    
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

SELECT 'Função devolver_pecas_ao_cancelar_os() criada' as status;

-- PASSO 5: CRIAR TRIGGER
-- =====================================================

CREATE TRIGGER trigger_devolver_pecas_ao_cancelar
  AFTER UPDATE OF status ON ordem_servico
  FOR EACH ROW
  EXECUTE FUNCTION devolver_pecas_ao_cancelar_os();

SELECT 'Trigger trigger_devolver_pecas_ao_cancelar criado' as status;

-- PASSO 6: VERIFICAR RESULTADO
-- =====================================================

SELECT 
  '✅ CONFIGURAÇÃO COMPLETA!' as status,
  tgname as trigger_name,
  tgenabled as enabled
FROM pg_trigger 
WHERE tgname = 'trigger_devolver_pecas_ao_cancelar';

-- =====================================================
-- INSTRUÇÕES
-- =====================================================
-- 1. Execute este script completo no Supabase SQL Editor
-- 2. Verifique se a última query retorna o trigger como 'O' (enabled)
-- 3. Teste cancelar uma OS
-- 4. Verifique os logs no terminal do Supabase (aba "Logs")
-- =====================================================
