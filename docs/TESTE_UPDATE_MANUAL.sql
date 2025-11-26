-- Testar UPDATE manual como o trigger faria
-- Isso vai revelar se o problema é permissão ou lógica

-- Ver estoque ANTES
SELECT 'ANTES DO UPDATE:' as momento, quantidade 
FROM estoque_lojas 
WHERE id_produto = 'e138eed1-e316-4d2a-990e-7f1ebdee06c7' AND id_loja = 16;

-- Tentar UPDATE exatamente como o trigger faz
UPDATE estoque_lojas
SET quantidade = quantidade - 13,
    atualizado_em = NOW(),
    atualizado_por = '1c0d76a8-563c-47f4-8583-4a8fcb2a063f'
WHERE id_produto = 'e138eed1-e316-4d2a-990e-7f1ebdee06c7'
  AND id_loja = 16
  AND quantidade >= 13
RETURNING quantidade + 13 as estoque_anterior, quantidade as estoque_novo;

-- Ver estoque DEPOIS
SELECT 'DEPOIS DO UPDATE:' as momento, quantidade 
FROM estoque_lojas 
WHERE id_produto = 'e138eed1-e316-4d2a-990e-7f1ebdee06c7' AND id_loja = 16;

-- ROLLBACK para não salvar (só teste)
ROLLBACK;
