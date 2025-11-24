-- =====================================================
-- VERIFICAR TRIGGER DE HISTÓRICO
-- =====================================================

-- 1. Ver se trigger está ativo
SELECT 
  tgname as trigger_name,
  tgenabled as enabled,
  tgrelid::regclass as table_name
FROM pg_trigger
WHERE tgname = 'trigger_historico_os';

-- 2. Ver código completo da função atual
SELECT pg_get_functiondef('registrar_historico_os'::regproc);

-- 3. Testar histórico da última OS
SELECT 
  h.tipo_evento,
  h.status_anterior,
  h.status_novo,
  h.descricao,
  h.criado_por_nome,
  h.criado_em,
  h.dados_anteriores->>'tecnico_responsavel' as tecnico_anterior,
  h.dados_novos->>'tecnico_responsavel' as tecnico_novo,
  h.dados_anteriores->>'observacoes_tecnicas' as obs_antigas,
  h.dados_novos->>'observacoes_tecnicas' as obs_novas
FROM historico_ordem_servico h
WHERE h.id_ordem_servico = (
  SELECT id FROM ordem_servico WHERE numero_os = 11
)
ORDER BY h.criado_em DESC;

-- =====================================================
-- RESULTADO ESPERADO:
-- =====================================================
-- ✅ trigger_historico_os deve estar 'enabled' (valor: 'O' ou TRUE)
-- ✅ Função deve ter código que busca em tecnicos
-- ✅ Deve mostrar todos os eventos da OS #11
