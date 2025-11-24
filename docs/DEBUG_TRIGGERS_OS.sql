-- ========================================
-- INVESTIGAR TRIGGERS QUE PODEM BLOQUEAR STATUS ENTREGUE
-- ========================================

-- 1. Ver função do trigger que atualiza timestamp
SELECT 
  'atualizar_timestamp_os' as funcao,
  pg_get_functiondef(oid) as codigo
FROM pg_proc 
WHERE proname = 'atualizar_timestamp_os';

-- 2. Ver função do trigger de histórico
SELECT 
  'registrar_historico_os' as funcao,
  pg_get_functiondef(oid) as codigo
FROM pg_proc 
WHERE proname = 'registrar_historico_os';

-- 3. Ver função do trigger de lançamento caixa
SELECT 
  'criar_lancamento_caixa_os' as funcao,
  pg_get_functiondef(oid) as codigo
FROM pg_proc 
WHERE proname = 'criar_lancamento_caixa_os';

-- 4. TESTE COM A OS REAL (número 13)
-- Vamos atualizar diretamente
UPDATE ordem_servico
SET 
  status = 'entregue',
  data_entrega_cliente = NOW(),
  atualizado_em = NOW(),
  atualizado_por = (SELECT id FROM auth.users LIMIT 1)
WHERE id = 'b353ba83-6909-41d2-b224-ba2771b97712'::uuid
RETURNING id, numero_os, status, atualizado_em;

-- 5. Verificar o resultado
SELECT 
  id,
  numero_os,
  status,
  data_entrega_cliente,
  TO_CHAR(atualizado_em, 'DD/MM/YYYY HH24:MI:SS') as atualizado_quando,
  atualizado_por
FROM ordem_servico
WHERE id = 'b353ba83-6909-41d2-b224-ba2771b97712'::uuid;

-- 6. Ver histórico dessa OS
SELECT 
  tipo_evento,
  status_anterior,
  status_novo,
  descricao,
  TO_CHAR(criado_em, 'DD/MM/YYYY HH24:MI:SS') as quando,
  criado_por_nome
FROM historico_ordem_servico
WHERE id_ordem_servico = 'b353ba83-6909-41d2-b224-ba2771b97712'::uuid
ORDER BY criado_em DESC
LIMIT 5;
