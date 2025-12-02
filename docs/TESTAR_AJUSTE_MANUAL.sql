-- 1. Ver o campo atualizado_por dos registros mais recentes
SELECT 
    id,
    id_produto,
    id_loja,
    quantidade,
    atualizado_por,
    atualizado_em
FROM estoque_lojas
ORDER BY atualizado_em DESC
LIMIT 10;

-- 2. Fazer um teste: alterar quantidade E preencher atualizado_por
-- Substitua 'SEU_USER_ID' pelo seu ID de usuário
-- Você pode pegar seu ID com: SELECT auth.uid();
/*
UPDATE estoque_lojas 
SET quantidade = quantidade + 1,
    atualizado_por = auth.uid()  -- <-- ISSO É CRÍTICO
WHERE id = '07396225-f400-4224-ab0f-03c61683ac4e';

-- Depois verifique se criou registro no histórico:
SELECT * FROM historico_estoque 
WHERE id_produto = 'cebb1ad4-765c-4882-857d-c7a225785e72' 
  AND id_loja = 3
ORDER BY criado_em DESC 
LIMIT 5;
*/

-- 3. Ver seu user ID atual
SELECT auth.uid() as meu_user_id;
