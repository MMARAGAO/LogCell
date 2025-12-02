-- ========================================
-- LISTAR TODAS AS TRIGGERS DO BANCO
-- ========================================

-- Versão 1: Lista completa de triggers com detalhes
SELECT 
    n.nspname AS schema_name,
    t.tgname AS trigger_name,
    c.relname AS table_name,
    p.proname AS function_name,
    CASE t.tgtype & 1
        WHEN 1 THEN 'ROW'
        ELSE 'STATEMENT'
    END AS trigger_level,
    CASE 
        WHEN t.tgtype & 2 = 2 THEN 'BEFORE'
        WHEN t.tgtype & 64 = 64 THEN 'INSTEAD OF'
        ELSE 'AFTER'
    END AS trigger_timing,
    ARRAY(
        SELECT CASE 
            WHEN t.tgtype & 4 = 4 THEN 'INSERT'
            WHEN t.tgtype & 8 = 8 THEN 'DELETE'
            WHEN t.tgtype & 16 = 16 THEN 'UPDATE'
            WHEN t.tgtype & 32 = 32 THEN 'TRUNCATE'
        END
    ) AS trigger_events,
    CASE t.tgenabled
        WHEN 'O' THEN 'ENABLED'
        WHEN 'D' THEN 'DISABLED'
        WHEN 'R' THEN 'REPLICA'
        WHEN 'A' THEN 'ALWAYS'
    END AS trigger_status,
    obj_description(t.oid, 'pg_trigger') AS description
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
LEFT JOIN pg_proc p ON t.tgfoid = p.oid
WHERE NOT t.tgisinternal
  AND n.nspname NOT IN ('pg_catalog', 'information_schema')
ORDER BY n.nspname, c.relname, t.tgname;


-- ========================================
-- Versão 2: Lista resumida e mais legível
-- ========================================
SELECT 
    schemaname AS schema,
    tablename AS tabela,
    triggername AS trigger_nome,
    CASE 
        WHEN position('BEFORE' in actiontiming) > 0 THEN 'BEFORE'
        WHEN position('AFTER' in actiontiming) > 0 THEN 'AFTER'
        ELSE actiontiming
    END AS quando,
    CASE 
        WHEN position('INSERT' in actionstatement) > 0 THEN 'INSERT'
        WHEN position('UPDATE' in actionstatement) > 0 THEN 'UPDATE'
        WHEN position('DELETE' in actionstatement) > 0 THEN 'DELETE'
    END AS evento
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
JOIN information_schema.triggers it ON it.trigger_name = t.tgname
WHERE n.nspname = 'public'
  AND NOT t.tgisinternal
ORDER BY tablename, triggername;


-- ========================================
-- Versão 3: Agrupar por tabela
-- ========================================
SELECT 
    c.relname AS tabela,
    COUNT(*) AS total_triggers,
    STRING_AGG(t.tgname, ', ' ORDER BY t.tgname) AS triggers
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE NOT t.tgisinternal
  AND n.nspname = 'public'
GROUP BY c.relname
ORDER BY c.relname;


-- ========================================
-- Versão 4: Detalhes completos com código da função
-- ========================================
SELECT 
    n.nspname AS schema,
    c.relname AS tabela,
    t.tgname AS trigger_nome,
    p.proname AS funcao,
    pg_get_triggerdef(t.oid) AS definicao_completa,
    pg_get_functiondef(p.oid) AS codigo_funcao
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
LEFT JOIN pg_proc p ON t.tgfoid = p.oid
WHERE NOT t.tgisinternal
  AND n.nspname = 'public'
ORDER BY c.relname, t.tgname;


-- ========================================
-- Versão 5: Buscar trigger específica por nome
-- ========================================
-- Descomente e substitua 'NOME_DA_TRIGGER' pelo nome que você procura
/*
SELECT 
    n.nspname AS schema,
    c.relname AS tabela,
    t.tgname AS trigger_nome,
    p.proname AS funcao,
    CASE 
        WHEN t.tgtype & 2 = 2 THEN 'BEFORE'
        WHEN t.tgtype & 64 = 64 THEN 'INSTEAD OF'
        ELSE 'AFTER'
    END AS timing,
    pg_get_triggerdef(t.oid) AS definicao,
    pg_get_functiondef(p.oid) AS codigo_funcao
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
LEFT JOIN pg_proc p ON t.tgfoid = p.oid
WHERE t.tgname ILIKE '%NOME_DA_TRIGGER%'
  AND NOT t.tgisinternal;
*/


-- ========================================
-- Versão 6: Triggers desabilitadas
-- ========================================
SELECT 
    n.nspname AS schema,
    c.relname AS tabela,
    t.tgname AS trigger_nome,
    CASE t.tgenabled
        WHEN 'O' THEN 'ENABLED'
        WHEN 'D' THEN 'DISABLED'
        WHEN 'R' THEN 'REPLICA'
        WHEN 'A' THEN 'ALWAYS'
    END AS status
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE NOT t.tgisinternal
  AND n.nspname = 'public'
  AND t.tgenabled = 'D'  -- Apenas desabilitadas
ORDER BY c.relname, t.tgname;


-- ========================================
-- Versão 7: Estatísticas de triggers
-- ========================================
SELECT 
    'Total de Triggers' AS metrica,
    COUNT(*) AS valor
FROM pg_trigger t
JOIN pg_namespace n ON t.tgrelid IN (
    SELECT c.oid FROM pg_class c WHERE c.relnamespace = n.oid
)
WHERE NOT t.tgisinternal
  AND n.nspname = 'public'

UNION ALL

SELECT 
    'Triggers BEFORE',
    COUNT(*)
FROM pg_trigger t
JOIN pg_namespace n ON t.tgrelid IN (
    SELECT c.oid FROM pg_class c WHERE c.relnamespace = n.oid
)
WHERE NOT t.tgisinternal
  AND n.nspname = 'public'
  AND t.tgtype & 2 = 2

UNION ALL

SELECT 
    'Triggers AFTER',
    COUNT(*)
FROM pg_trigger t
JOIN pg_namespace n ON t.tgrelid IN (
    SELECT c.oid FROM pg_class c WHERE c.relnamespace = n.oid
)
WHERE NOT t.tgisinternal
  AND n.nspname = 'public'
  AND t.tgtype & 2 != 2
  AND t.tgtype & 64 != 64;
