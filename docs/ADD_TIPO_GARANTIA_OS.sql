-- Adicionar coluna para tipo de garantia na ordem de serviço
ALTER TABLE ordem_servico 
ADD COLUMN IF NOT EXISTS tipo_garantia VARCHAR(50) DEFAULT 'servico_geral';

-- Adicionar comentário
COMMENT ON COLUMN ordem_servico.tipo_garantia IS 'Tipo de garantia aplicada à OS: servico_geral, troca_vidro, troca_tampa, venda_aparelho';

-- Criar índice para facilitar buscas
CREATE INDEX IF NOT EXISTS idx_os_tipo_garantia ON ordem_servico(tipo_garantia);

-- Atualizar OSs existentes baseado nos dias de garantia
UPDATE ordem_servico
SET tipo_garantia = CASE
  WHEN laudo_garantia_dias = 0 THEN 'troca_vidro'
  WHEN laudo_garantia_dias = 180 THEN 'venda_aparelho'
  ELSE 'servico_geral'
END
WHERE tipo_garantia IS NULL;
