-- =====================================================
-- CORRIGIR STATUS "concluida" → "concluido"
-- =====================================================

-- PROBLEMA: OS concluídas pelo técnico com status "concluida" (incorreto)
-- SOLUÇÃO: Atualizar para "concluido" (correto)

-- 1. Verificar quantas OS têm status incorreto
SELECT 
  COUNT(*) as total_incorretas,
  status
FROM ordem_servico
WHERE status = 'concluida'
GROUP BY status;

-- 2. Ver detalhes das OS incorretas
SELECT 
  id,
  numero_os,
  status,
  tecnico_responsavel,
  data_conclusao
FROM ordem_servico
WHERE status = 'concluida';

-- 3. CORRIGIR: Atualizar status para "concluido"
UPDATE ordem_servico
SET status = 'concluido'
WHERE status = 'concluida';

-- 4. Verificar correção (deve retornar 0)
SELECT COUNT(*) as ainda_incorretas
FROM ordem_servico
WHERE status = 'concluida';

-- 5. Verificar todas concluídas (deve mostrar todas como "concluido")
SELECT 
  id,
  numero_os,
  status,
  tecnico_responsavel,
  data_conclusao
FROM ordem_servico
WHERE status = 'concluido'
ORDER BY data_conclusao DESC;

-- =====================================================
-- RESULTADO ESPERADO:
-- =====================================================
-- ✅ Todas OS com status "concluida" → "concluido"
-- ✅ Chip mostrará "Concluído" verde na tela de admin
-- ✅ Técnicos verão na aba "Concluídas"
