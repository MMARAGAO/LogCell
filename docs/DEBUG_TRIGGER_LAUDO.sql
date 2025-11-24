-- =====================================================
-- DEBUG: VERIFICAR E CORRIGIR TRIGGER DO LAUDO
-- =====================================================

-- 1. Verificar se o trigger existe e está habilitado
SELECT 
    t.tgname AS trigger_name,
    t.tgenabled AS is_enabled,
    p.proname AS function_name,
    pg_get_triggerdef(t.oid) AS trigger_definition
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE c.relname = 'ordem_servico'
    AND p.proname = 'registrar_laudo_atualizado';

-- 2. Verificar se a função existe
SELECT 
    p.proname,
    pg_get_functiondef(p.oid) AS function_definition
FROM pg_proc p
WHERE p.proname = 'registrar_laudo_atualizado';

-- 3. Verificar outros triggers na tabela ordem_servico
SELECT 
    t.tgname AS trigger_name,
    t.tgenabled AS is_enabled,
    p.proname AS function_name,
    CASE 
        WHEN t.tgtype & 2 = 2 THEN 'BEFORE'
        WHEN t.tgtype & 64 = 64 THEN 'INSTEAD OF'
        ELSE 'AFTER'
    END AS trigger_timing,
    CASE 
        WHEN t.tgtype & 4 = 4 THEN 'INSERT'
        WHEN t.tgtype & 8 = 8 THEN 'DELETE'
        WHEN t.tgtype & 16 = 16 THEN 'UPDATE'
        ELSE 'UNKNOWN'
    END AS trigger_event
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE c.relname = 'ordem_servico'
    AND NOT t.tgisinternal
ORDER BY t.tgname;

-- 4. Testar UPDATE manualmente para ver se dispara o trigger
-- ATENÇÃO: Substitua o ID por uma OS real que você está testando
DO $$
DECLARE
    v_os_id uuid;
    v_count_before integer;
    v_count_after integer;
BEGIN
    -- Pegar uma OS qualquer com laudo
    SELECT id INTO v_os_id 
    FROM ordem_servico 
    WHERE laudo_diagnostico IS NOT NULL 
    LIMIT 1;
    
    IF v_os_id IS NULL THEN
        RAISE NOTICE 'Nenhuma OS com laudo encontrada para teste';
        RETURN;
    END IF;
    
    -- Contar registros antes
    SELECT COUNT(*) INTO v_count_before
    FROM historico_ordem_servico
    WHERE id_ordem_servico = v_os_id;
    
    RAISE NOTICE 'OS ID: %, Histórico antes: %', v_os_id, v_count_before;
    
    -- Fazer um UPDATE no laudo
    UPDATE ordem_servico
    SET laudo_diagnostico = laudo_diagnostico || ' [TESTE]'
    WHERE id = v_os_id;
    
    -- Contar registros depois
    SELECT COUNT(*) INTO v_count_after
    FROM historico_ordem_servico
    WHERE id_ordem_servico = v_os_id;
    
    RAISE NOTICE 'Histórico depois: %', v_count_after;
    
    IF v_count_after > v_count_before THEN
        RAISE NOTICE '✅ TRIGGER FUNCIONOU! Novo registro criado.';
    ELSE
        RAISE NOTICE '❌ TRIGGER NÃO DISPAROU! Nenhum registro novo.';
    END IF;
    
    -- Reverter o teste
    UPDATE ordem_servico
    SET laudo_diagnostico = REPLACE(laudo_diagnostico, ' [TESTE]', '')
    WHERE id = v_os_id;
    
END $$;

-- 5. Verificar se há erros de permissão RLS
SELECT tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'historico_ordem_servico';
