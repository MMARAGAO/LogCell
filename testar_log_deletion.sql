-- Teste da função com log
DO $$
DECLARE
  test_venda_id uuid;
  test_cliente_id uuid;
  test_usuario_id uuid := '1c0d76a8-563c-47f4-8583-4a8fcb2a063f'::uuid;
BEGIN
  -- Pegar um cliente existente
  SELECT id INTO test_cliente_id FROM public.clientes LIMIT 1;
  
  -- Criar uma venda de teste
  INSERT INTO public.vendas (
    cliente_id,
    loja_id,
    vendedor_id,
    status,
    tipo,
    valor_total,
    valor_pago,
    valor_desconto,
    saldo_devedor
  ) VALUES (
    test_cliente_id,
    1,
    test_usuario_id,
    'em_andamento',
    'normal',
    100.00,
    0,
    0,
    100.00
  ) RETURNING id INTO test_venda_id;
  
  RAISE NOTICE 'Venda criada: %', test_venda_id;
  
  -- Deletar usando a função
  PERFORM public.deletar_venda_com_usuario(test_venda_id, test_usuario_id);
  
  RAISE NOTICE 'Venda deletada com usuário: %', test_usuario_id;
END $$;

-- Verificar o log
SELECT 
  tabela_nome,
  LEFT(registro_id::text, 12) as reg_id,
  LEFT(COALESCE(apagado_por::text, 'NULL'), 36) as usuario_deletou,
  criado_em
FROM public.audit_logs_deletions 
WHERE criado_em > NOW() - INTERVAL '1 minute'
ORDER BY criado_em DESC;
