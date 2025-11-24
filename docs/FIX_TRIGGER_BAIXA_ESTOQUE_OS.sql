-- =====================================================
-- FIX: TRIGGER PARA BAIXAR ESTOQUE AO ADICIONAR PEÇA NA OS
-- =====================================================
-- Este script atualiza o trigger para BAIXAR o estoque
-- imediatamente ao adicionar uma peça na OS (não apenas reservar)
-- =====================================================

-- 1. Remover trigger antigo
DROP TRIGGER IF EXISTS trigger_reserva_estoque_os ON ordem_servico_pecas;

-- 2. Criar função atualizada que BAIXA o estoque
CREATE OR REPLACE FUNCTION processar_baixa_estoque_os()
RETURNS TRIGGER AS $$
DECLARE
  v_estoque_atual INTEGER;
  v_estoque_novo INTEGER;
  v_numero_os INTEGER;
BEGIN
  -- Apenas processar se for produto do estoque (não avulso)
  IF NEW.tipo_produto = 'estoque' AND NEW.id_produto IS NOT NULL AND NEW.id_loja IS NOT NULL THEN
    
    IF TG_OP = 'INSERT' THEN
      -- Buscar número da OS para o histórico
      SELECT numero_os INTO v_numero_os
      FROM ordem_servico
      WHERE id = NEW.id_ordem_servico;

      -- Verificar estoque disponível
      SELECT quantidade INTO v_estoque_atual
      FROM estoque_lojas
      WHERE id_produto = NEW.id_produto
        AND id_loja = NEW.id_loja;
      
      IF v_estoque_atual IS NULL THEN
        RAISE EXCEPTION 'Produto não encontrado no estoque da loja';
      END IF;

      IF v_estoque_atual < NEW.quantidade THEN
        RAISE EXCEPTION 'Estoque insuficiente para o produto';
      END IF;
      
      -- Calcular novo estoque
      v_estoque_novo := v_estoque_atual - NEW.quantidade;

      -- BAIXAR DO ESTOQUE
      UPDATE estoque_lojas
      SET quantidade = v_estoque_novo,
          atualizado_em = NOW(),
          atualizado_por = NEW.criado_por
      WHERE id_produto = NEW.id_produto
        AND id_loja = NEW.id_loja;
      
      -- Marcar como estoque baixado
      NEW.estoque_baixado := TRUE;
      NEW.data_baixa_estoque := NOW();
      
      -- Registrar no histórico de estoque
      INSERT INTO historico_estoque (
        id_produto,
        id_loja,
        tipo_movimentacao,
        quantidade,
        quantidade_anterior,
        quantidade_nova,
        motivo,
        observacao,
        criado_por
      ) VALUES (
        NEW.id_produto,
        NEW.id_loja,
        'saida',
        NEW.quantidade,
        v_estoque_atual,
        v_estoque_novo,
        'ordem_servico',
        'Saída para OS #' || COALESCE(v_numero_os::TEXT, 'N/A'),
        NEW.criado_por
      );

      RAISE NOTICE 'Estoque baixado: Produto %, Quantidade %, Estoque anterior: %, Estoque novo: %', 
        NEW.id_produto, NEW.quantidade, v_estoque_atual, v_estoque_novo;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Criar novo trigger
CREATE TRIGGER trigger_baixa_estoque_os
  BEFORE INSERT ON ordem_servico_pecas
  FOR EACH ROW
  EXECUTE FUNCTION processar_baixa_estoque_os();

-- 4. Verificar se foi criado corretamente
SELECT 
  t.tgname AS trigger_name,
  p.proname AS function_name,
  pg_get_triggerdef(t.oid) AS trigger_definition
FROM pg_trigger t
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE t.tgname = 'trigger_baixa_estoque_os';

-- 5. Verificar colunas da tabela ordem_servico_pecas
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'ordem_servico_pecas'
  AND column_name IN ('estoque_baixado', 'data_baixa_estoque', 'estoque_reservado', 'data_reserva_estoque')
ORDER BY column_name;
