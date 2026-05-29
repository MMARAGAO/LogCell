-- Índices para acelerar as queries do caixa (especialmente histórico)
-- Criados em: 2026-05-29

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_caixas_status_data_abertura
  ON caixas(status, data_abertura DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_pagamentos_venda_criado_em
  ON pagamentos_venda(criado_em);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_devolucoes_venda_criado_em
  ON devolucoes_venda(criado_em);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ordem_servico_pagamentos_criado_em
  ON ordem_servico_pagamentos(criado_em);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sangrias_caixa_caixa_id_criado_em
  ON sangrias_caixa(caixa_id, criado_em);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_quebra_pecas_id_loja_criado_em
  ON quebra_pecas(id_loja, criado_em);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_devolu_ordem_servico_criado_em
  ON devolu_ordem_servico(criado_em);
