-- =====================================================
-- CORREÇÃO RÁPIDA - DELETAR QUEBRAS DUPLICADAS
-- =====================================================
-- Este script deleta as quebras mais antigas, mantendo apenas a mais recente
-- para cada produto em cada OS

-- 1. PRIMEIRO: Veja quais OS têm problema
SELECT 
  os.numero_os,
  qp.id_ordem_servico,
  p.descricao AS produto,
  osp.quantidade AS qtd_na_os,
  COUNT(qp.id) AS quebras_registradas,
  SUM(qp.quantidade) AS total_quebrado,
  (SUM(qp.quantidade) - osp.quantidade) AS excesso
FROM quebra_pecas qp
JOIN produtos p ON p.id = qp.id_produto
JOIN ordem_servico os ON os.id = qp.id_ordem_servico
JOIN ordem_servico_pecas osp ON osp.id_ordem_servico = qp.id_ordem_servico 
  AND osp.id_produto = qp.id_produto
WHERE qp.aprovado = FALSE  -- apenas pendentes
GROUP BY os.numero_os, qp.id_ordem_servico, qp.id_produto, p.descricao, osp.quantidade
HAVING SUM(qp.quantidade) > osp.quantidade
ORDER BY excesso DESC;

-- 2. CORREÇÃO AUTOMÁTICA: Remove duplicatas mantendo a mais recente
-- Execute isso para corrigir TODAS as OS com problema de uma vez
WITH quebras_numeradas AS (
  SELECT 
    qp.id,
    qp.id_ordem_servico,
    qp.id_produto,
    qp.criado_em,
    qp.aprovado,
    osp.quantidade AS qtd_na_os,
    ROW_NUMBER() OVER (
      PARTITION BY qp.id_ordem_servico, qp.id_produto 
      ORDER BY qp.criado_em DESC
    ) AS posicao,
    COUNT(*) OVER (
      PARTITION BY qp.id_ordem_servico, qp.id_produto
    ) AS total_quebras
  FROM quebra_pecas qp
  JOIN ordem_servico_pecas osp ON osp.id_ordem_servico = qp.id_ordem_servico 
    AND osp.id_produto = qp.id_produto
  WHERE qp.aprovado = FALSE  -- apenas pendentes
)
DELETE FROM quebra_pecas
WHERE id IN (
  SELECT id 
  FROM quebras_numeradas 
  WHERE posicao > 1  -- Remove todas exceto a mais recente (posição 1)
    AND total_quebras > qtd_na_os  -- Só remove se houver excesso
);

-- 3. VERIFICAÇÃO: Veja se ainda há problemas
SELECT 
  os.numero_os,
  p.descricao AS produto,
  osp.quantidade AS qtd_na_os,
  COUNT(qp.id) AS quebras_registradas,
  SUM(qp.quantidade) AS total_quebrado
FROM quebra_pecas qp
JOIN produtos p ON p.id = qp.id_produto
JOIN ordem_servico os ON os.id = qp.id_ordem_servico
JOIN ordem_servico_pecas osp ON osp.id_ordem_servico = qp.id_ordem_servico 
  AND osp.id_produto = qp.id_produto
WHERE qp.aprovado = FALSE
GROUP BY os.numero_os, qp.id_produto, p.descricao, osp.quantidade
HAVING SUM(qp.quantidade) > osp.quantidade;

-- Se retornar vazio, está tudo corrigido! ✅
