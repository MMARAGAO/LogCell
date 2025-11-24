-- ==========================================
-- CRIAR FUNÇÃO RPC PARA ATUALIZAR ESTOQUE
-- ==========================================
-- Esta função tem SECURITY DEFINER, ou seja, executa com permissões
-- do dono (postgres/admin), garantindo que os triggers sejam disparados

CREATE OR REPLACE FUNCTION public.atualizar_estoque_com_trigger(
  p_produto_id uuid,
  p_loja_id integer,
  p_quantidade integer,
  p_usuario_id uuid
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result json;
BEGIN
  -- Fazer UPDATE que vai disparar o trigger
  UPDATE public.estoque_lojas
  SET 
    quantidade = p_quantidade,
    atualizado_por = p_usuario_id,
    atualizado_em = NOW()
  WHERE id_produto = p_produto_id
    AND id_loja = p_loja_id;
  
  -- Se não existe, criar
  IF NOT FOUND THEN
    INSERT INTO public.estoque_lojas (
      id_produto,
      id_loja,
      quantidade,
      atualizado_por
    )
    VALUES (
      p_produto_id,
      p_loja_id,
      p_quantidade,
      p_usuario_id
    );
  END IF;
  
  -- Retornar sucesso
  SELECT json_build_object(
    'success', true,
    'quantidade', p_quantidade
  ) INTO v_result;
  
  RETURN v_result;
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;

-- Dar permissão para usuários autenticados
GRANT EXECUTE ON FUNCTION public.atualizar_estoque_com_trigger TO authenticated;

COMMENT ON FUNCTION public.atualizar_estoque_com_trigger IS 
'Atualiza estoque disparando triggers de notificação. Usa SECURITY DEFINER para garantir execução dos triggers.';

-- Testar a função
SELECT atualizar_estoque_com_trigger(
  'e138eed1-e316-4d2a-990e-7f1ebdee06c7'::uuid,
  16,
  20,
  '1c0d76a8-563c-47f4-8583-4a8fcb2a063f'::uuid
);

-- Ver se notificação foi criada
SELECT 
  id,
  tipo,
  titulo,
  mensagem,
  criado_em
FROM notificacoes
WHERE criado_em > NOW() - INTERVAL '30 seconds'
ORDER BY criado_em DESC;
