-- =====================================================
-- CORREÇÃO DA TRIGGER DE DEVOLUÇÃO
-- =====================================================
-- Problema: A trigger estava tentando fazer UPDATE no historico_estoque
-- mas a lógica estava incorreta. O correto é fazer INSERT no historico_estoque
-- para registrar a movimentação de devolução, e UPDATE no estoque_lojas.

-- Remove trigger antiga
DROP TRIGGER IF EXISTS trigger_retornar_estoque_devolucao ON itens_devolucao;
DROP TRIGGER IF EXISTS trigger_registrar_devolucao_estoque ON itens_devolucao;
DROP FUNCTION IF EXISTS retornar_estoque_devolucao();
DROP FUNCTION IF EXISTS registrar_devolucao_estoque();

-- Nova função para registrar devolução no estoque
CREATE OR REPLACE FUNCTION registrar_devolucao_estoque()
RETURNS TRIGGER AS $$
DECLARE
  v_produto_id UUID;
  v_loja_id INTEGER;
  v_usuario_id UUID;
  v_numero_venda VARCHAR;
  v_quantidade_anterior INTEGER;
BEGIN
  -- Buscar informações do item de venda
  SELECT iv.produto_id
  INTO v_produto_id
  FROM itens_venda iv
  WHERE iv.id = NEW.item_venda_id;
  
  IF v_produto_id IS NULL THEN
    RAISE EXCEPTION 'Produto não encontrado para item_venda_id: %', NEW.item_venda_id;
  END IF;
  
  -- Buscar informações da venda
  SELECT v.loja_id, v.numero_venda
  INTO v_loja_id, v_numero_venda
  FROM vendas v
  JOIN itens_venda iv ON iv.venda_id = v.id
  WHERE iv.id = NEW.item_venda_id;
  
  IF v_loja_id IS NULL THEN
    RAISE EXCEPTION 'Venda não encontrada para item_venda_id: %', NEW.item_venda_id;
  END IF;
  
  -- Buscar usuário que realizou a devolução
  SELECT dv.realizado_por
  INTO v_usuario_id
  FROM devolucoes_venda dv
  WHERE dv.id = NEW.devolucao_id;
  
  -- Buscar quantidade anterior do estoque
  SELECT COALESCE(el.quantidade, 0)
  INTO v_quantidade_anterior
  FROM estoque_lojas el
  WHERE el.id_produto = v_produto_id
  AND el.id_loja = v_loja_id;
  
  -- Se não encontrou, quantidade anterior é 0
  IF v_quantidade_anterior IS NULL THEN
    v_quantidade_anterior := 0;
  END IF;
  
  -- Atualizar estoque da loja
  INSERT INTO estoque_lojas (id_produto, id_loja, quantidade)
  VALUES (v_produto_id, v_loja_id, NEW.quantidade)
  ON CONFLICT (id_produto, id_loja)
  DO UPDATE SET 
    quantidade = estoque_lojas.quantidade + NEW.quantidade,
    atualizado_em = NOW();
  
  -- Registrar no histórico
  INSERT INTO historico_estoque (
    id_produto,
    id_loja,
    tipo_movimentacao,
    quantidade,
    quantidade_anterior,
    quantidade_nova,
    motivo,
    usuario_id,
    criado_em
  ) VALUES (
    v_produto_id,
    v_loja_id,
    'devolucao_venda',
    NEW.quantidade,
    v_quantidade_anterior,
    v_quantidade_anterior + NEW.quantidade,
    'Devolução da venda #' || COALESCE(v_numero_venda, 'N/A') || ' - ' || COALESCE(NEW.motivo, 'Sem motivo'),
    v_usuario_id,
    NOW()
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger
CREATE TRIGGER trigger_registrar_devolucao_estoque
AFTER INSERT ON itens_devolucao
FOR EACH ROW
EXECUTE FUNCTION registrar_devolucao_estoque();

-- Comentários
COMMENT ON FUNCTION registrar_devolucao_estoque() IS 
'Registra automaticamente a devolução no estoque e no histórico quando um item é devolvido';
COMMENT ON TRIGGER trigger_registrar_devolucao_estoque ON itens_devolucao IS 
'Trigger que executa após inserção em itens_devolucao para atualizar estoque automaticamente';
