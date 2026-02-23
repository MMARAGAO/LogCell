-- Verifica se existem vales de funcionarios cadastrados

-- Total de registros
SELECT COUNT(*) AS total_vales
FROM public.vales_funcionarios;

-- Ultimos 20 registros (se existirem)
SELECT
  id,
  funcionario_id,
  descricao,
  valor,
  data_solicitacao,
  data_pagamento,
  status,
  criado_em
FROM public.vales_funcionarios
ORDER BY criado_em DESC
LIMIT 20;
