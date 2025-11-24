-- =====================================================
-- SCRIPT PARA CORRIGIR QUEBRAS DUPLICADAS
-- =====================================================
-- Este script remove quebras duplicadas quando a quantidade
-- de quebras registradas excede a quantidade disponível na OS

-- PASSO 1: VERIFICAR O PROBLEMA
-- Listar OS com quebras que excedem a quantidade na OS
SELECT 
  qp.id_ordem_servico,
  qp.id_produto,
  p.descricao AS produto,
  osp.quantidade AS qtd_na_os,
  COUNT(qp.id) AS num_quebras_registradas,
  SUM(qp.quantidade) AS total_quebrado,
  (SUM(qp.quantidade) - osp.quantidade) AS excesso
FROM quebra_pecas qp
JOIN produtos p ON p.id = qp.id_produto
JOIN ordem_servico_pecas osp ON osp.id_ordem_servico = qp.id_ordem_servico 
  AND osp.id_produto = qp.id_produto
GROUP BY qp.id_ordem_servico, qp.id_produto, p.descricao, osp.quantidade
HAVING SUM(qp.quantidade) > osp.quantidade
ORDER BY excesso DESC;

-- PASSO 2: VER DETALHES DAS QUEBRAS DUPLICADAS
-- (substitua o id_ordem_servico pelo ID da OS com problema)
SELECT 
  qp.id,
  qp.criado_em,
  qp.quantidade,
  qp.tipo_ocorrencia,
  qp.motivo,
  qp.valor_total,
  qp.aprovado,
  u.nome AS criado_por
FROM quebra_pecas qp
LEFT JOIN usuarios u ON u.id = qp.criado_por
WHERE qp.id_ordem_servico = 'COLE_O_ID_DA_OS_AQUI'
ORDER BY qp.criado_em DESC;

-- PASSO 3: DELETAR QUEBRAS MAIS ANTIGAS (MANTER APENAS A MAIS RECENTE)
-- ATENÇÃO: Execute isso APENAS DEPOIS de verificar os dados acima!
-- 
-- Opção A: Deletar TODAS as quebras duplicadas e deixar apenas 1
-- (a mais recente para cada produto)
WITH quebras_numeradas AS (
  SELECT 
    qp.id,
    qp.id_ordem_servico,
    qp.id_produto,
    qp.criado_em,
    ROW_NUMBER() OVER (
      PARTITION BY qp.id_ordem_servico, qp.id_produto 
      ORDER BY qp.criado_em DESC
    ) AS rn
  FROM quebra_pecas qp
  WHERE qp.id_ordem_servico = 'COLE_O_ID_DA_OS_AQUI'
    AND qp.id_produto = 'COLE_O_ID_DO_PRODUTO_AQUI'
)
DELETE FROM quebra_pecas
WHERE id IN (
  SELECT id 
  FROM quebras_numeradas 
  WHERE rn > 1  -- Mantém apenas a primeira (mais recente)
);

-- Opção B: Deletar apenas as quebras NÃO aprovadas e antigas
-- (mantém a mais recente não aprovada)
WITH quebras_nao_aprovadas AS (
  SELECT 
    qp.id,
    qp.criado_em,
    ROW_NUMBER() OVER (ORDER BY qp.criado_em DESC) AS rn
  FROM quebra_pecas qp
  WHERE qp.id_ordem_servico = 'COLE_O_ID_DA_OS_AQUI'
    AND qp.id_produto = 'COLE_O_ID_DO_PRODUTO_AQUI'
    AND qp.aprovado = FALSE
)
DELETE FROM quebra_pecas
WHERE id IN (
  SELECT id 
  FROM quebras_nao_aprovadas 
  WHERE rn > 1  -- Mantém apenas a mais recente não aprovada
);

-- Opção C: Deletar TODAS as quebras pendentes de um produto em uma OS
-- (use isso se quiser resetar completamente)
DELETE FROM quebra_pecas
WHERE id_ordem_servico = 'COLE_O_ID_DA_OS_AQUI'
  AND id_produto = 'COLE_O_ID_DO_PRODUTO_AQUI'
  AND aprovado = FALSE;

-- PASSO 4: VERIFICAR APÓS CORREÇÃO
-- Execute novamente a query do PASSO 1 para confirmar que está corrigido
SELECT 
  qp.id_ordem_servico,
  qp.id_produto,
  p.descricao AS produto,
  osp.quantidade AS qtd_na_os,
  COUNT(qp.id) AS num_quebras_registradas,
  SUM(qp.quantidade) AS total_quebrado
FROM quebra_pecas qp
JOIN produtos p ON p.id = qp.id_produto
JOIN ordem_servico_pecas osp ON osp.id_ordem_servico = qp.id_ordem_servico 
  AND osp.id_produto = qp.id_produto
WHERE qp.id_ordem_servico = 'COLE_O_ID_DA_OS_AQUI'
GROUP BY qp.id_ordem_servico, qp.id_produto, p.descricao, osp.quantidade;

-- =====================================================
-- INSTRUÇÕES DE USO:
-- =====================================================
-- 1. Execute o PASSO 1 para identificar OS com problema
-- 2. Copie o id_ordem_servico e id_produto
-- 3. Execute o PASSO 2 para ver detalhes
-- 4. Escolha uma das opções do PASSO 3:
--    - Opção A: Mantém apenas 1 quebra (a mais recente)
--    - Opção B: Remove duplicadas não aprovadas
--    - Opção C: Remove todas as pendentes (reset)
-- 5. Execute o PASSO 4 para confirmar a correção
-- =====================================================
