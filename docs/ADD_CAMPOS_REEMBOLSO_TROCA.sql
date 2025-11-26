-- Adicionar campos para registrar tipo de reembolso e forma de pagamento nas trocas de produtos

-- Adicionar campo tipo_reembolso
ALTER TABLE public.trocas_produtos
ADD COLUMN IF NOT EXISTS tipo_reembolso character varying 
CHECK (tipo_reembolso IS NULL OR tipo_reembolso IN ('credito', 'manual'));

-- Adicionar campo forma_pagamento_reembolso
ALTER TABLE public.trocas_produtos
ADD COLUMN IF NOT EXISTS forma_pagamento_reembolso character varying
CHECK (forma_pagamento_reembolso IS NULL OR forma_pagamento_reembolso IN (
  'dinheiro',
  'pix',
  'transferencia',
  'cartao_debito',
  'cartao_credito'
));

-- Adicionar comentários
COMMENT ON COLUMN public.trocas_produtos.tipo_reembolso IS 'Tipo de reembolso: credito (gera crédito para cliente) ou manual (reembolso direto)';
COMMENT ON COLUMN public.trocas_produtos.forma_pagamento_reembolso IS 'Forma de pagamento do reembolso manual (dinheiro, pix, etc)';
