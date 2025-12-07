-- Script para reverter e deletar transferencias de teste
-- IDs: a9969810-15b6-4122-9371-68e560db129b e 5a53f969-a9bc-41ff-ab3c-7341b7697c75

BEGIN;

-- 1. Reverter estoque da transferencia a9969810-15b6-4122-9371-68e560db129b
-- BATERIA IPHONE FOXCONN BLACK X: Devolver 2un de Loja Feira para ATACADO

UPDATE estoque_lojas
SET quantidade = quantidade - 2
WHERE id_produto = 'e809aed9-dc7b-49f7-9ede-06851319acb5'
  AND id_loja = 1; -- Loja Feira

UPDATE estoque_lojas
SET quantidade = quantidade + 2
WHERE id_produto = 'e809aed9-dc7b-49f7-9ede-06851319acb5'
  AND id_loja = 3; -- ATACADO

-- 2. Reverter estoque da transferencia 5a53f969-a9bc-41ff-ab3c-7341b7697c75
-- BATERIA IPHONE FOXCONN BLACK X: Devolver 2un de Loja Feira para ATACADO

UPDATE estoque_lojas
SET quantidade = quantidade - 2
WHERE id_produto = 'e809aed9-dc7b-49f7-9ede-06851319acb5'
  AND id_loja = 1; -- Loja Feira

UPDATE estoque_lojas
SET quantidade = quantidade + 2
WHERE id_produto = 'e809aed9-dc7b-49f7-9ede-06851319acb5'
  AND id_loja = 3; -- ATACADO

-- 3. Deletar historico de estoque das transferencias
DELETE FROM historico_estoque
WHERE observacao LIKE '%a9969810-15b6-4122-9371-68e560db129b%'
   OR observacao LIKE '%5a53f969-a9bc-41ff-ab3c-7341b7697c75%';

-- 4. Deletar itens das transferencias
DELETE FROM transferencias_itens
WHERE transferencia_id IN ('a9969810-15b6-4122-9371-68e560db129b', '5a53f969-a9bc-41ff-ab3c-7341b7697c75');

-- 5. Deletar as transferencias
DELETE FROM transferencias
WHERE id IN ('a9969810-15b6-4122-9371-68e560db129b', '5a53f969-a9bc-41ff-ab3c-7341b7697c75');

-- 6. Verificar resultado
SELECT 
    'Transferencias deletadas' as status,
    COUNT(*) as quantidade
FROM transferencias
WHERE id IN ('a9969810-15b6-4122-9371-68e560db129b', '5a53f969-a9bc-41ff-ab3c-7341b7697c75');

SELECT 
    'Estoque atual ATACADO' as loja,
    quantidade
FROM estoque_lojas
WHERE id_produto = 'e809aed9-dc7b-49f7-9ede-06851319acb5'
  AND id_loja = 3;

SELECT 
    'Estoque atual Loja Feira' as loja,
    quantidade
FROM estoque_lojas
WHERE id_produto = 'e809aed9-dc7b-49f7-9ede-06851319acb5'
  AND id_loja = 1;

COMMIT;
