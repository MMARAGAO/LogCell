-- Opção 1: Ver quantos registros têm usuario_id NULL
SELECT 
    COUNT(*) as total_registros_null,
    MIN(criado_em) as mais_antigo,
    MAX(criado_em) as mais_recente
FROM historico_estoque
WHERE usuario_id IS NULL;

-- Opção 2: Ver detalhes dos registros NULL
SELECT 
    id,
    id_produto,
    id_loja,
    quantidade_anterior,
    quantidade_nova,
    tipo_movimentacao,
    criado_em,
    observacao
FROM historico_estoque
WHERE usuario_id IS NULL
ORDER BY criado_em DESC
LIMIT 20;

-- Opção 3: Atualizar para um usuário específico (SEU USUÁRIO)
-- Descomente e execute após escolher a estratégia:

/*
-- Estratégia A: Atualizar para o seu usuário (admin/sistema)
UPDATE historico_estoque
SET usuario_id = '9014faed-5881-4f80-bafe-ceb90456fb4c'  -- SEU USER ID
WHERE usuario_id IS NULL;

-- OU

-- Estratégia B: Criar um usuário "Sistema" e usar ele
-- Primeiro crie um registro especial na tabela usuarios representando "Sistema"
-- Depois:
UPDATE historico_estoque
SET usuario_id = 'ID_DO_USUARIO_SISTEMA'
WHERE usuario_id IS NULL;

-- OU

-- Estratégia C: Deixar NULL e aceitar que são registros antigos sem rastreamento
-- (não fazer nada)
*/

-- Verificar o resultado após atualizar:
/*
SELECT 
    COUNT(*) as total_ainda_null
FROM historico_estoque
WHERE usuario_id IS NULL;
*/
