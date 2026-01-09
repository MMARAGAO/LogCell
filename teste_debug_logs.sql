-- Teste de debug da função log_deletion
DO $$
DECLARE
  v_venda_id uuid := '8f8fe78b-280c-4d67-9721-768b9e235272';
  v_cliente_id uuid;
  v_cliente_nome varchar;
BEGIN
  -- Tenta buscar cliente_id da venda
  SELECT cliente_id INTO v_cliente_id
  FROM public.vendas
  WHERE id = v_venda_id;
  
  RAISE NOTICE 'Venda encontrada, cliente_id: %', v_cliente_id;
  
  -- Se encontrou, busca o nome
  IF v_cliente_id IS NOT NULL THEN
    SELECT nome INTO v_cliente_nome
    FROM public.clientes
    WHERE id = v_cliente_id
    LIMIT 1;
    
    RAISE NOTICE 'Cliente encontrado: %', v_cliente_nome;
  END IF;
END;
$$;
