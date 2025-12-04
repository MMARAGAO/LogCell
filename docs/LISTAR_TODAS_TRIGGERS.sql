-- ============================================================================
-- LISTAR TODAS AS TRIGGERS E FUNÇÕES DO BANCO DE DADOS
-- ============================================================================
-- Este script lista todas as triggers ativas e suas funções associadas
-- para identificar possíveis duplicações ou conflitos
-- ============================================================================

-- ============================================================================
-- 1. LISTAR TODAS AS TRIGGERS ATIVAS
-- ============================================================================
SELECT 
    t.tgname AS trigger_name,
    tbl.relname AS table_name,
    ns.nspname AS schema_name,
    p.proname AS function_name,
    CASE t.tgtype & 1
        WHEN 1 THEN 'ROW'
        ELSE 'STATEMENT'
    END AS trigger_level,
    CASE t.tgtype & 66
        WHEN 2 THEN 'BEFORE'
        WHEN 64 THEN 'INSTEAD OF'
        ELSE 'AFTER'
    END AS trigger_timing,
    CASE 
        WHEN t.tgtype & 4 = 4 THEN 'INSERT'
        WHEN t.tgtype & 8 = 8 THEN 'DELETE'
        WHEN t.tgtype & 16 = 16 THEN 'UPDATE'
        ELSE 'TRUNCATE'
    END AS trigger_event,
    CASE 
        WHEN t.tgenabled = 'O' THEN 'ENABLED'
        WHEN t.tgenabled = 'D' THEN 'DISABLED'
        WHEN t.tgenabled = 'R' THEN 'REPLICA'
        WHEN t.tgenabled = 'A' THEN 'ALWAYS'
        ELSE 'UNKNOWN'
    END AS trigger_status,
    obj_description(t.oid, 'pg_trigger') AS trigger_description
FROM pg_trigger t
JOIN pg_class tbl ON tbl.oid = t.tgrelid
JOIN pg_namespace ns ON ns.oid = tbl.relnamespace
JOIN pg_proc p ON p.oid = t.tgfoid
WHERE NOT t.tgisinternal  -- Excluir triggers internas do sistema
  AND ns.nspname NOT IN ('pg_catalog', 'information_schema')  -- Excluir schemas do sistema
ORDER BY 
    ns.nspname,
    tbl.relname,
    t.tgname;

-- ============================================================================
-- 2. LISTAR TRIGGERS POR TABELA (AGRUPADO)
-- ============================================================================
SELECT 
    tbl.relname AS table_name,
    COUNT(*) AS total_triggers,
    string_agg(t.tgname, ', ' ORDER BY t.tgname) AS trigger_names
FROM pg_trigger t
JOIN pg_class tbl ON tbl.oid = t.tgrelid
JOIN pg_namespace ns ON ns.oid = tbl.relnamespace
WHERE NOT t.tgisinternal
  AND ns.nspname NOT IN ('pg_catalog', 'information_schema')
GROUP BY tbl.relname
ORDER BY total_triggers DESC, tbl.relname;

-- ============================================================================
-- 3. LISTAR FUNÇÕES ASSOCIADAS ÀS TRIGGERS
-- ============================================================================
SELECT DISTINCT
    p.proname AS function_name,
    pg_get_functiondef(p.oid) AS function_definition
FROM pg_trigger t
JOIN pg_proc p ON p.oid = t.tgfoid
JOIN pg_namespace ns ON ns.oid = p.pronamespace
WHERE NOT t.tgisinternal
  AND ns.nspname NOT IN ('pg_catalog', 'information_schema')
ORDER BY p.proname;

-- ============================================================================
-- 4. TRIGGERS ESPECÍFICAS DE ESTOQUE E VENDAS (FOCO)
-- ============================================================================
SELECT 
    t.tgname AS trigger_name,
    tbl.relname AS table_name,
    p.proname AS function_name,
    CASE t.tgtype & 66
        WHEN 2 THEN 'BEFORE'
        WHEN 64 THEN 'INSTEAD OF'
        ELSE 'AFTER'
    END AS timing,
    CASE 
        WHEN t.tgtype & 4 = 4 THEN 'INSERT'
        WHEN t.tgtype & 8 = 8 THEN 'DELETE'
        WHEN t.tgtype & 16 = 16 THEN 'UPDATE'
        ELSE 'TRUNCATE'
    END AS event,
    CASE 
        WHEN t.tgenabled = 'O' THEN 'ENABLED'
        ELSE 'DISABLED'
    END AS status
FROM pg_trigger t
JOIN pg_class tbl ON tbl.oid = t.tgrelid
JOIN pg_namespace ns ON ns.oid = tbl.relnamespace
JOIN pg_proc p ON p.oid = t.tgfoid
WHERE NOT t.tgisinternal
  AND ns.nspname NOT IN ('pg_catalog', 'information_schema')
  AND (
      tbl.relname IN ('itens_venda', 'vendas', 'estoque_lojas', 'historico_estoque')
      OR p.proname LIKE '%estoque%'
      OR p.proname LIKE '%venda%'
      OR p.proname LIKE '%baixa%'
  )
ORDER BY 
    tbl.relname,
    CASE t.tgtype & 66
        WHEN 2 THEN 1  -- BEFORE primeiro
        ELSE 2         -- AFTER depois
    END,
    t.tgname;

-- ============================================================================
-- 5. IDENTIFICAR TRIGGERS DUPLICADAS (MESMO EVENTO NA MESMA TABELA)
-- ============================================================================
WITH trigger_events AS (
    SELECT 
        tbl.relname AS table_name,
        CASE 
            WHEN t.tgtype & 4 = 4 THEN 'INSERT'
            WHEN t.tgtype & 8 = 8 THEN 'DELETE'
            WHEN t.tgtype & 16 = 16 THEN 'UPDATE'
            ELSE 'TRUNCATE'
        END AS event,
        CASE t.tgtype & 66
            WHEN 2 THEN 'BEFORE'
            ELSE 'AFTER'
        END AS timing,
        COUNT(*) AS trigger_count,
        string_agg(t.tgname || ' → ' || p.proname, ' | ') AS triggers_functions
    FROM pg_trigger t
    JOIN pg_class tbl ON tbl.oid = t.tgrelid
    JOIN pg_namespace ns ON ns.oid = tbl.relnamespace
    JOIN pg_proc p ON p.oid = t.tgfoid
    WHERE NOT t.tgisinternal
      AND ns.nspname NOT IN ('pg_catalog', 'information_schema')
    GROUP BY tbl.relname, event, timing
)
SELECT 
    table_name,
    event,
    timing,
    trigger_count,
    triggers_functions,
    CASE 
        WHEN trigger_count > 1 THEN '⚠️ POSSÍVEL DUPLICAÇÃO'
        ELSE '✓ OK'
    END AS status
FROM trigger_events
WHERE trigger_count > 1
ORDER BY trigger_count DESC, table_name;

-- ============================================================================
-- 6. TRIGGERS QUE PODEM CAUSAR BAIXA DE ESTOQUE
-- ============================================================================
SELECT 
    t.tgname AS trigger_name,
    tbl.relname AS table_name,
    p.proname AS function_name,
    CASE t.tgtype & 66
        WHEN 2 THEN 'BEFORE'
        ELSE 'AFTER'
    END AS timing,
    CASE 
        WHEN t.tgtype & 4 = 4 THEN 'INSERT'
        WHEN t.tgtype & 8 = 8 THEN 'DELETE'
        WHEN t.tgtype & 16 = 16 THEN 'UPDATE'
    END AS event,
    '⚠️ VERIFICAR CÓDIGO DA FUNÇÃO' AS alerta
FROM pg_trigger t
JOIN pg_class tbl ON tbl.oid = t.tgrelid
JOIN pg_namespace ns ON ns.oid = tbl.relnamespace
JOIN pg_proc p ON p.oid = t.tgfoid
WHERE NOT t.tgisinternal
  AND ns.nspname NOT IN ('pg_catalog', 'information_schema')
  AND (
      p.proname LIKE '%baixa%estoque%'
      OR p.proname LIKE '%atualiza%estoque%'
      OR p.proname LIKE '%estoque%item%'
      OR tbl.relname = 'itens_venda'
  )
ORDER BY tbl.relname, t.tgname;

-- ============================================================================
-- INSTRUÇÕES:
-- ============================================================================
-- 1. Execute este script completo no Supabase SQL Editor
-- 2. Copie TODOS os resultados (todas as 6 queries)
-- 3. Cole aqui para análise de possíveis duplicações
-- 4. Focaremos especialmente nas queries #4, #5 e #6
-- ============================================================================

-- ============================================================================
-- FIM DO SCRIPT
-- ============================================================================
