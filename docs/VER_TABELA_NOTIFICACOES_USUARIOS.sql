-- ========================================
-- VERIFICAR SE EXISTE TABELA notificacoes_usuarios
-- ========================================

-- 1. Ver estrutura da tabela notificacoes_usuarios
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'notificacoes_usuarios'
ORDER BY ordinal_position;

-- 2. Contar registros
SELECT 
  'Total de registros' as info,
  COUNT(*) as quantidade
FROM notificacoes_usuarios;

-- 3. Ver últimos 5 registros
SELECT 
  nu.id,
  nu.notificacao_id,
  nu.usuario_id,
  nu.lida,
  nu.lida_em,
  nu.criado_em,
  n.tipo,
  n.titulo
FROM notificacoes_usuarios nu
LEFT JOIN notificacoes n ON n.id = nu.notificacao_id
ORDER BY nu.criado_em DESC
LIMIT 5;
