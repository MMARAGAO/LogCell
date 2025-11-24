-- =====================================================
-- VERIFICAR SE HISTÓRICO DO LAUDO ESTÁ SENDO REGISTRADO
-- =====================================================

-- 1. Verificar últimos registros do histórico (todos os tipos)
SELECT 
    h.id,
    h.tipo_evento,
    h.descricao,
    h.criado_em,
    h.criado_por_nome,
    os.numero_os,
    h.dados_novos,
    h.dados_anteriores
FROM historico_ordem_servico h
LEFT JOIN ordem_servico os ON os.id = h.id_ordem_servico
ORDER BY h.criado_em DESC
LIMIT 20;

-- 2. Verificar especificamente eventos de laudo
SELECT 
    h.id,
    h.tipo_evento,
    h.descricao,
    h.criado_em,
    h.criado_por_nome,
    os.numero_os
FROM historico_ordem_servico h
LEFT JOIN ordem_servico os ON os.id = h.id_ordem_servico
WHERE h.tipo_evento IN ('laudo_preenchido', 'laudo_atualizado')
ORDER BY h.criado_em DESC
LIMIT 10;

-- 3. Verificar se o trigger existe e está ativo
SELECT 
    t.tgname AS trigger_name,
    t.tgenabled AS is_enabled,
    p.proname AS function_name
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE c.relname = 'ordem_servico'
    AND p.proname = 'registrar_laudo_atualizado';

-- 4. Testar manualmente a função (substitua o UUID)
-- SELECT registrar_laudo_atualizado();

-- 5. Verificar OSs com laudo preenchido
SELECT 
    id,
    numero_os,
    laudo_diagnostico IS NOT NULL as tem_diagnostico,
    laudo_causa IS NOT NULL as tem_causa,
    laudo_procedimentos IS NOT NULL as tem_procedimentos,
    atualizado_em
FROM ordem_servico
WHERE laudo_diagnostico IS NOT NULL
ORDER BY atualizado_em DESC
LIMIT 10;

-- 6. Contar tipos de eventos no histórico
SELECT 
    tipo_evento,
    COUNT(*) as quantidade,
    MAX(criado_em) as ultimo_registro
FROM historico_ordem_servico
GROUP BY tipo_evento
ORDER BY quantidade DESC;
