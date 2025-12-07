CREATE OR REPLACE FUNCTION public.confirmar_transferencia(
  p_transferencia_id uuid,
  p_usuario_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_transferencia RECORD;
  v_item RECORD;
  v_estoque_origem RECORD;
  v_estoque_destino RECORD;
BEGIN
  SELECT * INTO v_transferencia
  FROM public.transferencias
  WHERE id = p_transferencia_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Transferencia nao encontrada');
  END IF;

  IF v_transferencia.status != 'pendente' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Esta transferencia ja foi ' || v_transferencia.status);
  END IF;

  FOR v_item IN 
    SELECT ti.*, p.descricao as produto_nome
    FROM public.transferencias_itens ti
    JOIN public.produtos p ON p.id = ti.produto_id
    WHERE ti.transferencia_id = p_transferencia_id
  LOOP
    SELECT * INTO v_estoque_origem
    FROM public.estoque_lojas
    WHERE id_produto = v_item.produto_id AND id_loja = v_transferencia.loja_origem_id;

    IF NOT FOUND THEN
      RETURN jsonb_build_object('success', false, 'error', 'Produto "' || v_item.produto_nome || '" nao encontrado no estoque da loja de origem');
    END IF;

    IF v_estoque_origem.quantidade < v_item.quantidade THEN
      RETURN jsonb_build_object('success', false, 'error', 'Estoque insuficiente para "' || v_item.produto_nome || '". Disponivel: ' || v_estoque_origem.quantidade || ', Necessario: ' || v_item.quantidade);
    END IF;

    UPDATE public.estoque_lojas
    SET quantidade = quantidade - v_item.quantidade, atualizado_por = p_usuario_id, atualizado_em = now()
    WHERE id = v_estoque_origem.id;

    INSERT INTO public.historico_estoque (
      id_produto, id_loja, usuario_id,
      quantidade, quantidade_anterior, quantidade_nova,
      tipo_movimentacao, observacao
    ) VALUES (
      v_item.produto_id, v_transferencia.loja_origem_id, p_usuario_id,
      v_item.quantidade, v_estoque_origem.quantidade, v_estoque_origem.quantidade - v_item.quantidade,
      'transferencia_saida', 'Transferencia #' || p_transferencia_id::text || ' para Loja ID: ' || v_transferencia.loja_destino_id
    );

    SELECT * INTO v_estoque_destino
    FROM public.estoque_lojas
    WHERE id_produto = v_item.produto_id AND id_loja = v_transferencia.loja_destino_id;

    IF FOUND THEN
      UPDATE public.estoque_lojas
      SET quantidade = quantidade + v_item.quantidade, atualizado_por = p_usuario_id, atualizado_em = now()
      WHERE id = v_estoque_destino.id;

      INSERT INTO public.historico_estoque (
        id_produto, id_loja, usuario_id,
        quantidade, quantidade_anterior, quantidade_nova,
        tipo_movimentacao, observacao
      ) VALUES (
        v_item.produto_id, v_transferencia.loja_destino_id, p_usuario_id,
        v_item.quantidade, v_estoque_destino.quantidade, v_estoque_destino.quantidade + v_item.quantidade,
        'transferencia_entrada', 'Transferencia #' || p_transferencia_id::text || ' da Loja ID: ' || v_transferencia.loja_origem_id
      );
    ELSE
      INSERT INTO public.estoque_lojas (id_produto, id_loja, quantidade, atualizado_por)
      VALUES (v_item.produto_id, v_transferencia.loja_destino_id, v_item.quantidade, p_usuario_id);

      INSERT INTO public.historico_estoque (
        id_produto, id_loja, usuario_id,
        quantidade, quantidade_anterior, quantidade_nova,
        tipo_movimentacao, observacao
      ) VALUES (
        v_item.produto_id, v_transferencia.loja_destino_id, p_usuario_id,
        v_item.quantidade, 0, v_item.quantidade,
        'transferencia_entrada', 'Transferencia #' || p_transferencia_id::text || ' da Loja ID: ' || v_transferencia.loja_origem_id
      );
    END IF;
  END LOOP;

  UPDATE public.transferencias
  SET 
    status = 'confirmada',
    confirmado_em = now(),
    confirmado_por = p_usuario_id
  WHERE id = p_transferencia_id;

  RETURN jsonb_build_object('success', true);
END;
$$;
