-- Verificar estoque atual
SELECT quantidade 
FROM estoque_lojas 
WHERE id_produto = 'e138eed1-e316-4d2a-990e-7f1ebdee06c7' AND id_loja = 16;

-- Se estiver 0, restaurar para 13
UPDATE estoque_lojas
SET quantidade = 13,
    atualizado_em = NOW()
WHERE id_produto = 'e138eed1-e316-4d2a-990e-7f1ebdee06c7' 
  AND id_loja = 16
  AND quantidade = 0;

-- Confirmar
SELECT quantidade 
FROM estoque_lojas 
WHERE id_produto = 'e138eed1-e316-4d2a-990e-7f1ebdee06c7' AND id_loja = 16;
