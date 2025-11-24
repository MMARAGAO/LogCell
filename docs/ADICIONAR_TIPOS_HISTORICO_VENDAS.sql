-- =====================================================
-- ADICIONAR TIPOS DE AÇÃO FALTANTES NO HISTÓRICO DE VENDAS
-- =====================================================

-- Remover constraint antiga
ALTER TABLE historico_vendas 
DROP CONSTRAINT IF EXISTS historico_vendas_tipo_acao_check;

-- Adicionar constraint com todos os tipos necessários
ALTER TABLE historico_vendas
ADD CONSTRAINT historico_vendas_tipo_acao_check
CHECK (tipo_acao IN (
  'criacao', 
  'adicao_item', 
  'remocao_item', 
  'pagamento', 
  'edicao_pagamento', 
  'desconto', 
  'devolucao', 
  'finalizacao',
  'cancelamento',
  'edicao',
  'exclusao'
));
