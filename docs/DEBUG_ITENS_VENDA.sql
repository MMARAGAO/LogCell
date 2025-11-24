-- DEBUG: Verificar estrutura da tabela itens_venda

-- 1. Verificar colunas da tabela
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'itens_venda'
ORDER BY ordinal_position;

-- 2. Verificar políticas RLS
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'itens_venda';

-- 3. Verificar se RLS está habilitado
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables
WHERE tablename = 'itens_venda';

-- 4. Verificar triggers na tabela
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement,
    action_timing
FROM information_schema.triggers
WHERE event_object_table = 'itens_venda';

-- 5. Tentar inserir manualmente para testar
-- DESCOMENTAR E EXECUTAR APÓS CRIAR UMA VENDA
/*
INSERT INTO itens_venda (
    venda_id,
    produto_id,
    produto_nome,
    produto_codigo,
    quantidade,
    preco_unitario,
    subtotal,
    devolvido
) VALUES (
    'COLE_AQUI_O_ID_DA_VENDA',
    'e138eed1-e316-4d2a-990e-7f1ebdee06c7',
    'Teste',
    'TEST',
    1,
    100,
    100,
    0
);
*/
