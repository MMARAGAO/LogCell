-- Teste: Simular uma deleção do frontend usando deletar_venda_com_contexto

-- 1. Criar uma venda de teste
INSERT INTO public.vendas (
  numero_venda,
  cliente_id,
  loja_id,
  vendedor_id,
  status,
  tipo,
  valor_total
) VALUES (
  8888,
  '4b9eef69-866c-4818-947f-390ab50d071d',
  1,
  '1c0d76a8-563c-47f4-8583-4a8fcb2a063f',
  'em_andamento',
  'normal',
  150.00
) RETURNING id;

-- Use o ID retornado acima

-- 2. Criar alguns itens
INSERT INTO public.itens_venda (
  venda_id,
  produto_id,
  quantidade,
  preco_unitario,
  subtotal,
  criado_por
) VALUES (
  'UUID_AQUI',
  (SELECT id FROM public.produtos LIMIT 1),
  2,
  75.00,
  150.00,
  '1c0d76a8-563c-47f4-8583-4a8fcb2a063f'
);

-- 3. Agora deletar a venda usando a nova RPC
-- SELECT public.deletar_venda_com_contexto('UUID_AQUI', '1c0d76a8-563c-47f4-8583-4a8fcb2a063f');

-- 4. Verificar os logs criados
-- SELECT 
--   criado_em,
--   tabela_nome,
--   numero_venda,
--   cliente_nome,
--   usuario_nome
-- FROM audit_logs_deletions 
-- WHERE numero_venda = 8888
-- ORDER BY criado_em DESC;
