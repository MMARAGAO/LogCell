-- =====================================================
-- FUNÇÃO RPC PARA ATUALIZAR QUANTIDADE DEVOLVIDA
-- =====================================================

CREATE OR REPLACE FUNCTION atualizar_devolvido_item_venda(
  p_item_id UUID,
  p_quantidade INTEGER
)
RETURNS VOID AS $$
BEGIN
  -- Atualizar quantidade devolvida no item da venda
  UPDATE itens_venda
  SET devolvido = COALESCE(devolvido, 0) + p_quantidade
  WHERE id = p_item_id;
  
  -- Validar que a quantidade devolvida não excede a quantidade vendida
  IF (SELECT devolvido > quantidade FROM itens_venda WHERE id = p_item_id) THEN
    RAISE EXCEPTION 'Quantidade devolvida não pode ser maior que a quantidade vendida';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentário
COMMENT ON FUNCTION atualizar_devolvido_item_venda IS 
'Atualiza a quantidade devolvida de um item de venda, com validação';
