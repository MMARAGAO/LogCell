-- =========================================================================
-- TESTE: Testar a função log_deletion manualmente
-- =========================================================================

-- Vamos criar uma venda de teste e um pagamento, depois deletar e verificar

-- 1. Criar uma venda de teste
WITH venda_teste AS (
  INSERT INTO public.vendas (
    numero_venda,
    cliente_id,
    loja_id,
    vendedor_id,
    status,
    tipo,
    valor_total
  ) VALUES (
    9999,
    '906bdea6-e6b0-46c2-ace0-e59e15bd13ab',
    1,
    '1c0d76a8-563c-47f4-8583-4a8fcb2a063f',
    'em_andamento',
    'normal',
    0
  ) RETURNING id
)
-- 2. Criar um pagamento
INSERT INTO public.pagamentos_venda (
  venda_id,
  tipo_pagamento,
  valor,
  data_pagamento,
  criado_por
) 
SELECT 
  id,
  'pix',
  100.00,
  NOW()::date,
  '1c0d76a8-563c-47f4-8583-4a8fcb2a063f'
FROM venda_teste
RETURNING venda_id;

-- 3. Agora deletar este pagamento (vamos fazer manualmente depois)
-- Primeiro get o ID da venda

-- 4. Verificar o log depois
SELECT 
  numero_venda,
  usuario_nome,
  apagado_por,
  tabela_nome,
  (dados_apagados->>'valor') as valor_json,
  (dados_apagados->>'venda_id') as venda_id_json
FROM audit_logs_deletions
WHERE numero_venda = 9999
ORDER BY criado_em DESC;

-- 5. Se numero_venda for NULL aqui, o problema é que a função não está sendo executada
--    ou não está conseguindo encontrar a venda relacionada
