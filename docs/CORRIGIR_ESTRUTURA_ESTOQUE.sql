-- =====================================================
-- CORREÇÃO: Estrutura das tabelas de estoque
-- =====================================================

-- 1. CORRIGIR historico_estoque - Remover campos duplicados
-- =====================================================

-- Verificar se os campos existem
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'historico_estoque' 
  AND column_name IN ('observacao', 'observacoes', 'quantidade')
ORDER BY ordinal_position;

-- Analisar se há dados em 'observacoes' que não estão em 'observacao'
SELECT 
  COUNT(*) as total,
  COUNT(observacao) as com_observacao,
  COUNT(observacoes) as com_observacoes,
  COUNT(quantidade) as com_quantidade,
  COUNT(quantidade_alterada) as com_quantidade_alterada
FROM historico_estoque;

-- Se 'observacoes' tiver dados únicos, mesclar antes de remover
UPDATE historico_estoque
SET observacao = COALESCE(observacao, '') || 
                CASE 
                  WHEN observacoes IS NOT NULL AND observacoes != '' 
                  THEN ' | ' || observacoes 
                  ELSE '' 
                END
WHERE observacoes IS NOT NULL AND observacoes != '';

-- Se 'quantidade' tiver dados, mover para 'quantidade_alterada'
UPDATE historico_estoque
SET quantidade_alterada = COALESCE(quantidade_alterada, quantidade)
WHERE quantidade IS NOT NULL AND quantidade_alterada IS NULL;

-- Remover coluna duplicada 'observacoes'
ALTER TABLE historico_estoque 
DROP COLUMN IF EXISTS observacoes;

-- Remover coluna redundante 'quantidade'
ALTER TABLE historico_estoque 
DROP COLUMN IF EXISTS quantidade;

-- Comentário na tabela
COMMENT ON TABLE historico_estoque IS 
'Histórico de movimentações de estoque. Usa quantidade_anterior, quantidade_nova e quantidade_alterada para rastreamento completo.';


-- 2. CORRIGIR estoque_lojas - Adicionar UNIQUE constraint
-- =====================================================

-- Verificar se há duplicatas antes de adicionar constraint
SELECT 
  id_produto, 
  id_loja, 
  COUNT(*) as qtd_registros,
  array_agg(id) as ids,
  array_agg(quantidade) as quantidades
FROM estoque_lojas
GROUP BY id_produto, id_loja
HAVING COUNT(*) > 1;

-- Se houver duplicatas, consolidá-las primeiro
-- (Execute apenas se a query acima retornar resultados)
WITH duplicatas AS (
  SELECT 
    id_produto, 
    id_loja,
    SUM(quantidade) as total_quantidade,
    MAX(atualizado_em) as ultima_atualizacao,
    MAX(atualizado_por) as ultimo_usuario,
    MIN(id) as id_manter
  FROM estoque_lojas
  GROUP BY id_produto, id_loja
  HAVING COUNT(*) > 1
)
UPDATE estoque_lojas e
SET 
  quantidade = d.total_quantidade,
  atualizado_em = d.ultima_atualizacao,
  atualizado_por = d.ultimo_usuario
FROM duplicatas d
WHERE e.id = d.id_manter
  AND e.id_produto = d.id_produto
  AND e.id_loja = d.id_loja;

-- Remover duplicatas (mantém apenas o primeiro registro)
DELETE FROM estoque_lojas
WHERE id IN (
  SELECT id
  FROM (
    SELECT 
      id,
      ROW_NUMBER() OVER (
        PARTITION BY id_produto, id_loja 
        ORDER BY atualizado_em DESC NULLS LAST, id
      ) as rn
    FROM estoque_lojas
  ) sub
  WHERE rn > 1
);

-- Adicionar constraint UNIQUE
ALTER TABLE estoque_lojas 
DROP CONSTRAINT IF EXISTS estoque_lojas_produto_loja_unique;

ALTER TABLE estoque_lojas
ADD CONSTRAINT estoque_lojas_produto_loja_unique 
UNIQUE (id_produto, id_loja);

-- Comentário na constraint
COMMENT ON CONSTRAINT estoque_lojas_produto_loja_unique ON estoque_lojas IS 
'Garante que cada produto tenha apenas um registro de estoque por loja';


-- 3. VERIFICAÇÃO FINAL
-- =====================================================

-- Estrutura final de historico_estoque
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'historico_estoque'
ORDER BY ordinal_position;

-- Estrutura final de estoque_lojas
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'estoque_lojas'
ORDER BY ordinal_position;

-- Constraints de estoque_lojas
SELECT
  tc.constraint_name,
  tc.constraint_type,
  kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'estoque_lojas'
ORDER BY tc.constraint_type, tc.constraint_name;

-- Verificar se ainda há duplicatas
SELECT 
  id_produto, 
  id_loja, 
  COUNT(*) as registros
FROM estoque_lojas
GROUP BY id_produto, id_loja
HAVING COUNT(*) > 1;
