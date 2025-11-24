-- ============================================
-- DESABILITAR TRIGGERS ANTIGAS DE NOTIFICAÇÃO
-- ============================================

-- Ver todas as triggers de notificação que existem
SELECT 
  tgname as trigger_name,
  tgenabled as enabled,
  tgrelid::regclass as table_name
FROM pg_trigger
WHERE tgname ILIKE '%notificacao%' 
   OR tgname ILIKE '%alerta%'
ORDER BY tgname;

-- Desabilitar trigger antiga do sistema (se existir)
DROP TRIGGER IF EXISTS trigger_alerta_estoque ON estoque_lojas;
DROP TRIGGER IF EXISTS trigger_verificar_estoque ON estoque_lojas;

-- A função antiga pode ficar (não atrapalha), mas se quiser remover:
-- DROP FUNCTION IF EXISTS verificar_estoque();
-- DROP FUNCTION IF EXISTS criar_notificacao_estoque();

-- Confirmar que apenas a nova trigger está ativa
SELECT 
  'Triggers ativas' as status,
  tgname as trigger_name,
  tgenabled as enabled
FROM pg_trigger
WHERE tgrelid = 'estoque_lojas'::regclass
  AND tgname ILIKE '%notificacao%';
