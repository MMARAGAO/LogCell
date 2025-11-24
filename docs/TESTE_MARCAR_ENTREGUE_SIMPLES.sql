-- ========================================
-- TESTE SIMPLES: Marcar OS como Entregue
-- ========================================

-- 1. Ver OSs concluídas (prontas para entrega)
SELECT 
  id,
  numero_os,
  status,
  cliente_nome,
  TO_CHAR(atualizado_em, 'DD/MM/YYYY HH24:MI:SS') as ultima_atualizacao
FROM ordem_servico
WHERE status = 'concluido'
ORDER BY numero_os DESC
LIMIT 5;

-- 2. COPIE O UUID de uma OS acima e execute esta query
-- Substitua 'SEU-UUID-AQUI' pelo UUID real
UPDATE ordem_servico
SET 
  status = 'entregue',
  data_entrega_cliente = NOW(),
  atualizado_em = NOW(),
  atualizado_por = (SELECT id FROM auth.users LIMIT 1)
WHERE id = 'SEU-UUID-AQUI'::uuid;

-- 3. Verificar se mudou
SELECT 
  id,
  numero_os,
  status,
  data_entrega_cliente,
  TO_CHAR(atualizado_em, 'DD/MM/YYYY HH24:MI:SS') as quando_atualizou
FROM ordem_servico
WHERE id = 'SEU-UUID-AQUI'::uuid;
