-- Teste: Criar e deletar um pagamento para verificar se captura cliente_nome

-- 1. Criar um novo pagamento
INSERT INTO public.pagamentos_venda (
  venda_id, 
  tipo_pagamento, 
  valor, 
  data_pagamento, 
  criado_por
) VALUES (
  '8188332b-8096-4950-b718-76f6f92b6a43',
  'pix',
  77.77,
  NOW()::date,
  '1c0d76a8-563c-47f4-8583-4a8fcb2a063f'
);

-- 2. Deletar o pagamento
DELETE FROM public.pagamentos_venda 
WHERE venda_id = '8188332b-8096-4950-b718-76f6f92b6a43'
  AND valor = 77.77;

-- 3. Verificar se o log foi criado com cliente_nome
SELECT 
  criado_em,
  tabela_nome,
  numero_venda,
  cliente_nome,
  usuario_nome,
  valor_total
FROM public.audit_logs_deletions 
WHERE tabela_nome = 'pagamentos_venda'
ORDER BY criado_em DESC 
LIMIT 1;

