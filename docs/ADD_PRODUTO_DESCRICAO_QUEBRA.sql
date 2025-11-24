-- =====================================================
-- ADICIONAR CAMPO PRODUTO_DESCRICAO NA TABELA QUEBRA_PECAS
-- =====================================================
-- Este campo armazenará o nome/descrição do produto no momento
-- do registro da quebra, resolvendo o problema de peças externas
-- que não têm vínculo direto com a tabela produtos

-- Adicionar coluna
ALTER TABLE quebra_pecas 
ADD COLUMN IF NOT EXISTS produto_descricao TEXT;

-- Preencher dados existentes (produtos internos)
UPDATE quebra_pecas
SET produto_descricao = p.descricao
FROM produtos p
WHERE quebra_pecas.id_produto = p.id
  AND quebra_pecas.produto_descricao IS NULL;

-- Preencher dados existentes (peças externas) 
-- Busca a primeira peça externa da OS
UPDATE quebra_pecas
SET produto_descricao = (
  SELECT descricao_peca
  FROM ordem_servico_pecas
  WHERE ordem_servico_pecas.id_ordem_servico = quebra_pecas.id_ordem_servico
    AND ordem_servico_pecas.tipo_produto = 'externa'
  LIMIT 1
)
WHERE quebra_pecas.id_produto IS NULL
  AND quebra_pecas.produto_descricao IS NULL;

-- Verificar resultado
SELECT 
  id,
  id_produto,
  produto_descricao,
  quantidade,
  tipo_ocorrencia,
  criado_em
FROM quebra_pecas
ORDER BY criado_em DESC
LIMIT 10;
