-- Função para deletar venda com contexto de usuário
CREATE OR REPLACE FUNCTION public.deletar_venda_com_usuario(
  p_venda_id uuid,
  p_usuario_id uuid
)
RETURNS void AS $$
BEGIN
  -- Configurar o usuário no contexto da sessão (não local, para persistir)
  PERFORM set_config('app.user_id', p_usuario_id::text, false);
  
  -- Deletar a venda (CASCADE vai deletar os relacionados)
  DELETE FROM public.vendas WHERE id = p_venda_id;
  
  -- Limpar o contexto após deletar
  PERFORM set_config('app.user_id', '', false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Garantir que a função seja executável
GRANT EXECUTE ON FUNCTION public.deletar_venda_com_usuario(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.deletar_venda_com_usuario(uuid, uuid) TO service_role;
