-- ============================================================================
-- CORREÇÃO AUTOMÁTICA DE BAIXA DUPLICADA DE ESTOQUE
-- ============================================================================
-- Baseado na análise dos dados, identificamos produtos com baixa duplicada
-- Este script corrige automaticamente todos os casos identificados
-- ============================================================================

-- IMPORTANTE: Execute este script em uma transação para poder reverter se necessário
-- BEGIN;

-- ============================================================================
-- PRODUTOS IDENTIFICADOS COM BAIXA DUPLICADA (apenas com quantidade numérica)
-- ============================================================================

-- 1. FERRAMENTA PACOTE DE LIGA - Loja ATACADO (id: 3)
--    Quantidade duplicada: 1 unidade
UPDATE estoque_lojas
SET 
    quantidade = quantidade + 1,
    atualizado_em = NOW(),
    atualizado_por = (SELECT id FROM usuarios LIMIT 1)
WHERE id_produto = 'e8f626aa-67b7-4a94-b5c2-e16e17b4081d'
  AND id_loja = 3;

INSERT INTO historico_estoque (
    id_produto, id_loja, usuario_id, quantidade, 
    quantidade_anterior, quantidade_nova, tipo_movimentacao, motivo, observacao
)
SELECT 
    'e8f626aa-67b7-4a94-b5c2-e16e17b4081d', 3,
    (SELECT id FROM usuarios LIMIT 1), 1,
    el.quantidade - 1, el.quantidade, 'ajuste',
    'Correção de baixa duplicada',
    'Devolução: FERRAMENTA PACOTE DE LIGA - Venda #5 (baixa duplicada em 2025-12-04 17:47:29)'
FROM estoque_lojas el
WHERE el.id_produto = 'e8f626aa-67b7-4a94-b5c2-e16e17b4081d' AND el.id_loja = 3;

-- 2. TAG JC FACE ID IPHONE 11 PRO/11 PRO MAX - Loja ATACADO (id: 3)
--    Quantidade duplicada: 1 unidade
UPDATE estoque_lojas
SET 
    quantidade = quantidade + 1,
    atualizado_em = NOW(),
    atualizado_por = (SELECT id FROM usuarios LIMIT 1)
WHERE id_produto = 'bd99757a-104b-4db9-bdc2-abc56b09ecf6'
  AND id_loja = 3;

INSERT INTO historico_estoque (
    id_produto, id_loja, usuario_id, quantidade,
    quantidade_anterior, quantidade_nova, tipo_movimentacao, motivo, observacao
)
SELECT 
    'bd99757a-104b-4db9-bdc2-abc56b09ecf6', 3,
    (SELECT id FROM usuarios LIMIT 1), 1,
    el.quantidade - 1, el.quantidade, 'ajuste',
    'Correção de baixa duplicada',
    'Devolução: TAG JC FACE ID IPHONE 11 PRO/11 PRO MAX - Venda #5 (baixa duplicada em 2025-12-04 17:45:23)'
FROM estoque_lojas el
WHERE el.id_produto = 'bd99757a-104b-4db9-bdc2-abc56b09ecf6' AND el.id_loja = 3;

-- 3. FERRAMENTA PINCEL DE LIMPEZA 2 EM 1 WL-431 - Loja ATACADO (id: 3)
--    Quantidade duplicada: 2 unidades
UPDATE estoque_lojas
SET 
    quantidade = quantidade + 2,
    atualizado_em = NOW(),
    atualizado_por = (SELECT id FROM usuarios LIMIT 1)
WHERE id_produto = 'bcee2fdc-6ab0-4ea0-90ce-0247a4010195'
  AND id_loja = 3;

INSERT INTO historico_estoque (
    id_produto, id_loja, usuario_id, quantidade,
    quantidade_anterior, quantidade_nova, tipo_movimentacao, motivo, observacao
)
SELECT 
    'bcee2fdc-6ab0-4ea0-90ce-0247a4010195', 3,
    (SELECT id FROM usuarios LIMIT 1), 2,
    el.quantidade - 2, el.quantidade, 'ajuste',
    'Correção de baixa duplicada',
    'Devolução: FERRAMENTA PINCEL DE LIMPEZA 2 EM 1 WL-431 - Venda #5 e #12 (baixa duplicada em 2025-12-04 17:45:22)'
FROM estoque_lojas el
WHERE el.id_produto = 'bcee2fdc-6ab0-4ea0-90ce-0247a4010195' AND el.id_loja = 3;

-- 4. FLEX CONECTOR CARGA XIAOMI MI 11 LITE 4G/MI 11 LITE 5G PRETA - Loja ATACADO (id: 3)
--    Quantidade duplicada: 3 unidades
UPDATE estoque_lojas
SET 
    quantidade = quantidade + 3,
    atualizado_em = NOW(),
    atualizado_por = (SELECT id FROM usuarios LIMIT 1)
WHERE id_produto = '4fa925fa-da87-493e-93aa-804088c47ae2'
  AND id_loja = 3;

INSERT INTO historico_estoque (
    id_produto, id_loja, usuario_id, quantidade,
    quantidade_anterior, quantidade_nova, tipo_movimentacao, motivo, observacao
)
SELECT 
    '4fa925fa-da87-493e-93aa-804088c47ae2', 3,
    (SELECT id FROM usuarios LIMIT 1), 3,
    el.quantidade - 3, el.quantidade, 'ajuste',
    'Correção de baixa duplicada',
    'Devolução: FLEX CONECTOR CARGA XIAOMI MI 11 LITE 4G/MI 11 LITE 5G PRETA (baixa duplicada em 2025-12-04 17:36:22)'
FROM estoque_lojas el
WHERE el.id_produto = '4fa925fa-da87-493e-93aa-804088c47ae2' AND el.id_loja = 3;

-- 5. FLEX CONECTOR CARGA USB SAMSUNG S20/S20 PLUS/S20 ULTRA - Loja ATACADO (id: 3)
--    Quantidade duplicada: 10 unidades
UPDATE estoque_lojas
SET 
    quantidade = quantidade + 10,
    atualizado_em = NOW(),
    atualizado_por = (SELECT id FROM usuarios LIMIT 1)
WHERE id_produto = '01902601-2700-4edb-9737-3f770d5bc567'
  AND id_loja = 3;

INSERT INTO historico_estoque (
    id_produto, id_loja, usuario_id, quantidade,
    quantidade_anterior, quantidade_nova, tipo_movimentacao, motivo, observacao
)
SELECT 
    '01902601-2700-4edb-9737-3f770d5bc567', 3,
    (SELECT id FROM usuarios LIMIT 1), 10,
    el.quantidade - 10, el.quantidade, 'ajuste',
    'Correção de baixa duplicada',
    'Devolução: FLEX CONECTOR CARGA USB SAMSUNG S20/S20 PLUS/S20 ULTRA (baixa duplicada em 2025-12-04 17:34:14)'
FROM estoque_lojas el
WHERE el.id_produto = '01902601-2700-4edb-9737-3f770d5bc567' AND el.id_loja = 3;

-- 6. FLEX CONECTOR CARGA SAMSUNG A34 5G - Loja ATACADO (id: 3)
--    Quantidade duplicada: 9 unidades
UPDATE estoque_lojas
SET 
    quantidade = quantidade + 9,
    atualizado_em = NOW(),
    atualizado_por = (SELECT id FROM usuarios LIMIT 1)
WHERE id_produto = '3252ae85-318c-4e78-b357-c4426ed15653'
  AND id_loja = 3;

INSERT INTO historico_estoque (
    id_produto, id_loja, usuario_id, quantidade,
    quantidade_anterior, quantidade_nova, tipo_movimentacao, motivo, observacao
)
SELECT 
    '3252ae85-318c-4e78-b357-c4426ed15653', 3,
    (SELECT id FROM usuarios LIMIT 1), 9,
    el.quantidade - 9, el.quantidade, 'ajuste',
    'Correção de baixa duplicada',
    'Devolução: FLEX CONECTOR CARGA SAMSUNG A34 5G (baixa duplicada em 2025-12-04 17:31:34)'
FROM estoque_lojas el
WHERE el.id_produto = '3252ae85-318c-4e78-b357-c4426ed15653' AND el.id_loja = 3;

-- 7. FLEX CONECTOR CARGA SAMSUNG A02S/A03S - Loja ATACADO (id: 3)
--    Quantidade duplicada: 10 unidades
UPDATE estoque_lojas
SET 
    quantidade = quantidade + 10,
    atualizado_em = NOW(),
    atualizado_por = (SELECT id FROM usuarios LIMIT 1)
WHERE id_produto = 'd08c8eec-95ff-42c2-b6b0-47423c46b1c8'
  AND id_loja = 3;

INSERT INTO historico_estoque (
    id_produto, id_loja, usuario_id, quantidade,
    quantidade_anterior, quantidade_nova, tipo_movimentacao, motivo, observacao
)
SELECT 
    'd08c8eec-95ff-42c2-b6b0-47423c46b1c8', 3,
    (SELECT id FROM usuarios LIMIT 1), 10,
    el.quantidade - 10, el.quantidade, 'ajuste',
    'Correção de baixa duplicada',
    'Devolução: FLEX CONECTOR CARGA SAMSUNG A02S/A03S (baixa duplicada em 2025-12-04 17:29:11)'
FROM estoque_lojas el
WHERE el.id_produto = 'd08c8eec-95ff-42c2-b6b0-47423c46b1c8' AND el.id_loja = 3;

-- 8. TAMPA IPHONE 14 C/ ARO AZUL - Loja Feira (id: 1)
--    Quantidade duplicada: 1 unidade
UPDATE estoque_lojas
SET 
    quantidade = quantidade + 1,
    atualizado_em = NOW(),
    atualizado_por = (SELECT id FROM usuarios LIMIT 1)
WHERE id_produto = '55ce3f98-e6b7-4a7d-84b5-4220e786d65e'
  AND id_loja = 1;

INSERT INTO historico_estoque (
    id_produto, id_loja, usuario_id, quantidade,
    quantidade_anterior, quantidade_nova, tipo_movimentacao, motivo, observacao
)
SELECT 
    '55ce3f98-e6b7-4a7d-84b5-4220e786d65e', 1,
    (SELECT id FROM usuarios LIMIT 1), 1,
    el.quantidade - 1, el.quantidade, 'ajuste',
    'Correção de baixa duplicada',
    'Devolução: TAMPA IPHONE 14 C/ ARO AZUL (baixa duplicada em 2025-12-04 17:12:36)'
FROM estoque_lojas el
WHERE el.id_produto = '55ce3f98-e6b7-4a7d-84b5-4220e786d65e' AND el.id_loja = 1;

-- 9. TAMPA IPHONE 13 PRO MAX AZUL - Loja Feira (id: 1)
--    Quantidade duplicada: 2 unidades
UPDATE estoque_lojas
SET 
    quantidade = quantidade + 2,
    atualizado_em = NOW(),
    atualizado_por = (SELECT id FROM usuarios LIMIT 1)
WHERE id_produto = '1e03986c-dff5-4882-9a24-8334c415baae'
  AND id_loja = 1;

INSERT INTO historico_estoque (
    id_produto, id_loja, usuario_id, quantidade,
    quantidade_anterior, quantidade_nova, tipo_movimentacao, motivo, observacao
)
SELECT 
    '1e03986c-dff5-4882-9a24-8334c415baae', 1,
    (SELECT id FROM usuarios LIMIT 1), 2,
    el.quantidade - 2, el.quantidade, 'ajuste',
    'Correção de baixa duplicada',
    'Devolução: TAMPA IPHONE 13 PRO MAX AZUL (baixa duplicada em 2025-12-04 16:56:25)'
FROM estoque_lojas el
WHERE el.id_produto = '1e03986c-dff5-4882-9a24-8334c415baae' AND el.id_loja = 1;

-- 10. VIDRO IPHONE 14 PLUS+ OCA PRETA - Loja ATACADO (id: 3)
--     Quantidade duplicada: 10 unidades
UPDATE estoque_lojas
SET 
    quantidade = quantidade + 10,
    atualizado_em = NOW(),
    atualizado_por = (SELECT id FROM usuarios LIMIT 1)
WHERE id_produto = '476a804a-2068-4345-a4db-7fda99fa6c6b'
  AND id_loja = 3;

INSERT INTO historico_estoque (
    id_produto, id_loja, usuario_id, quantidade,
    quantidade_anterior, quantidade_nova, tipo_movimentacao, motivo, observacao
)
SELECT 
    '476a804a-2068-4345-a4db-7fda99fa6c6b', 3,
    (SELECT id FROM usuarios LIMIT 1), 10,
    el.quantidade - 10, el.quantidade, 'ajuste',
    'Correção de baixa duplicada',
    'Devolução: VIDRO IPHONE 14 PLUS+ OCA PRETA - Venda #19 (baixa duplicada em 2025-12-04 16:47:52)'
FROM estoque_lojas el
WHERE el.id_produto = '476a804a-2068-4345-a4db-7fda99fa6c6b' AND el.id_loja = 3;

-- 11. TAMPA IPHONE 15 PRO MAX C/ARO NATURAL - Loja ATACADO (id: 3)
--     Quantidade duplicada: 1 unidade
UPDATE estoque_lojas
SET 
    quantidade = quantidade + 1,
    atualizado_em = NOW(),
    atualizado_por = (SELECT id FROM usuarios LIMIT 1)
WHERE id_produto = 'eb1fcaf4-ccca-4c1f-a76e-5a8c868f42f1'
  AND id_loja = 3;

INSERT INTO historico_estoque (
    id_produto, id_loja, usuario_id, quantidade,
    quantidade_anterior, quantidade_nova, tipo_movimentacao, motivo, observacao
)
SELECT 
    'eb1fcaf4-ccca-4c1f-a76e-5a8c868f42f1', 3,
    (SELECT id FROM usuarios LIMIT 1), 1,
    el.quantidade - 1, el.quantidade, 'ajuste',
    'Correção de baixa duplicada',
    'Devolução: TAMPA IPHONE 15 PRO MAX C/ARO NATURAL (baixa duplicada em 2025-12-04 16:00:21)'
FROM estoque_lojas el
WHERE el.id_produto = 'eb1fcaf4-ccca-4c1f-a76e-5a8c868f42f1' AND el.id_loja = 3;

-- 12. TOUCH APPLE WATCH S6 44MM PRETA - Loja Feira (id: 1)
--     Quantidade duplicada: 1 unidade
UPDATE estoque_lojas
SET 
    quantidade = quantidade + 1,
    atualizado_em = NOW(),
    atualizado_por = (SELECT id FROM usuarios LIMIT 1)
WHERE id_produto = '68ffe097-25e6-4151-a7f3-b67354623766'
  AND id_loja = 1;

INSERT INTO historico_estoque (
    id_produto, id_loja, usuario_id, quantidade,
    quantidade_anterior, quantidade_nova, tipo_movimentacao, motivo, observacao
)
SELECT 
    '68ffe097-25e6-4151-a7f3-b67354623766', 1,
    (SELECT id FROM usuarios LIMIT 1), 1,
    el.quantidade - 1, el.quantidade, 'ajuste',
    'Correção de baixa duplicada',
    'Devolução: TOUCH APPLE WATCH S6 44MM PRETA (baixa duplicada em 2025-12-04 15:54:41)'
FROM estoque_lojas el
WHERE el.id_produto = '68ffe097-25e6-4151-a7f3-b67354623766' AND el.id_loja = 1;

-- 13. BATERIA IPHONE FOXCONN BLACK XR - Loja Feira (id: 1)
--     Quantidade duplicada: 1 unidade
UPDATE estoque_lojas
SET 
    quantidade = quantidade + 1,
    atualizado_em = NOW(),
    atualizado_por = (SELECT id FROM usuarios LIMIT 1)
WHERE id_produto = 'f9c8851d-615e-4d56-a506-618e9f337978'
  AND id_loja = 1;

INSERT INTO historico_estoque (
    id_produto, id_loja, usuario_id, quantidade,
    quantidade_anterior, quantidade_nova, tipo_movimentacao, motivo, observacao
)
SELECT 
    'f9c8851d-615e-4d56-a506-618e9f337978', 1,
    (SELECT id FROM usuarios LIMIT 1), 1,
    el.quantidade - 1, el.quantidade, 'ajuste',
    'Correção de baixa duplicada',
    'Devolução: BATERIA IPHONE FOXCONN BLACK XR - Venda #11 (baixa duplicada em 2025-12-04 15:35:03)'
FROM estoque_lojas el
WHERE el.id_produto = 'f9c8851d-615e-4d56-a506-618e9f337978' AND el.id_loja = 1;

-- 14. BATERIA IPHONE FOXCONN BLACK 8G - Loja Feira (id: 1)
--     Quantidade duplicada: 1 unidade
UPDATE estoque_lojas
SET 
    quantidade = quantidade + 1,
    atualizado_em = NOW(),
    atualizado_por = (SELECT id FROM usuarios LIMIT 1)
WHERE id_produto = 'c66fddca-ff31-42f1-b837-c73312f6e2fa'
  AND id_loja = 1;

INSERT INTO historico_estoque (
    id_produto, id_loja, usuario_id, quantidade,
    quantidade_anterior, quantidade_nova, tipo_movimentacao, motivo, observacao
)
SELECT 
    'c66fddca-ff31-42f1-b837-c73312f6e2fa', 1,
    (SELECT id FROM usuarios LIMIT 1), 1,
    el.quantidade - 1, el.quantidade, 'ajuste',
    'Correção de baixa duplicada',
    'Devolução: BATERIA IPHONE FOXCONN BLACK 8G - Venda #11 (baixa duplicada em 2025-12-04 15:35:02)'
FROM estoque_lojas el
WHERE el.id_produto = 'c66fddca-ff31-42f1-b837-c73312f6e2fa' AND el.id_loja = 1;

-- 15. BATERIA IPHONE FOXCONN 14 C/FLEX - Loja Feira (id: 1)
--     Quantidade duplicada: 1 unidade
UPDATE estoque_lojas
SET 
    quantidade = quantidade + 1,
    atualizado_em = NOW(),
    atualizado_por = (SELECT id FROM usuarios LIMIT 1)
WHERE id_produto = 'b9585951-c8e0-47cc-b9fe-6713f9ad7f81'
  AND id_loja = 1;

INSERT INTO historico_estoque (
    id_produto, id_loja, usuario_id, quantidade,
    quantidade_anterior, quantidade_nova, tipo_movimentacao, motivo, observacao
)
SELECT 
    'b9585951-c8e0-47cc-b9fe-6713f9ad7f81', 1,
    (SELECT id FROM usuarios LIMIT 1), 1,
    el.quantidade - 1, el.quantidade, 'ajuste',
    'Correção de baixa duplicada',
    'Devolução: BATERIA IPHONE FOXCONN 14 C/FLEX - Venda #11 (baixa duplicada em 2025-12-04 15:27:48)'
FROM estoque_lojas el
WHERE el.id_produto = 'b9585951-c8e0-47cc-b9fe-6713f9ad7f81' AND el.id_loja = 1;

-- 16. BATERIA IPHONE FOXCONN BLACK 14 PRO MAX - Loja ATACADO (id: 3)
--     Quantidade duplicada: 1 unidade
UPDATE estoque_lojas
SET 
    quantidade = quantidade + 1,
    atualizado_em = NOW(),
    atualizado_por = (SELECT id FROM usuarios LIMIT 1)
WHERE id_produto = 'af608ccb-7eb8-4b10-866d-5698d81a1283'
  AND id_loja = 3;

INSERT INTO historico_estoque (
    id_produto, id_loja, usuario_id, quantidade,
    quantidade_anterior, quantidade_nova, tipo_movimentacao, motivo, observacao
)
SELECT 
    'af608ccb-7eb8-4b10-866d-5698d81a1283', 3,
    (SELECT id FROM usuarios LIMIT 1), 1,
    el.quantidade - 1, el.quantidade, 'ajuste',
    'Correção de baixa duplicada',
    'Devolução: BATERIA IPHONE FOXCONN BLACK 14 PRO MAX (baixa duplicada em 2025-12-04 15:22:59)'
FROM estoque_lojas el
WHERE el.id_produto = 'af608ccb-7eb8-4b10-866d-5698d81a1283' AND el.id_loja = 3;

-- 17. VIDRO IPHONE 14 PRO+ OCA PRETA - Loja ATACADO (id: 3)
--     Quantidade duplicada: 2 unidades
UPDATE estoque_lojas
SET 
    quantidade = quantidade + 2,
    atualizado_em = NOW(),
    atualizado_por = (SELECT id FROM usuarios LIMIT 1)
WHERE id_produto = 'cc10aae8-a2c9-4a4c-949d-b77c5cdd7a57'
  AND id_loja = 3;

INSERT INTO historico_estoque (
    id_produto, id_loja, usuario_id, quantidade,
    quantidade_anterior, quantidade_nova, tipo_movimentacao, motivo, observacao
)
SELECT 
    'cc10aae8-a2c9-4a4c-949d-b77c5cdd7a57', 3,
    (SELECT id FROM usuarios LIMIT 1), 2,
    el.quantidade - 2, el.quantidade, 'ajuste',
    'Correção de baixa duplicada',
    'Devolução: VIDRO IPHONE 14 PRO+ OCA PRETA - Venda #19 (baixa duplicada em 2025-12-04 15:21:07)'
FROM estoque_lojas el
WHERE el.id_produto = 'cc10aae8-a2c9-4a4c-949d-b77c5cdd7a57' AND el.id_loja = 3;

-- 18. TAMPA IPHONE 12 PRETA - Loja ATACADO (id: 3)
--     Quantidade duplicada: 1 unidade
UPDATE estoque_lojas
SET 
    quantidade = quantidade + 1,
    atualizado_em = NOW(),
    atualizado_por = (SELECT id FROM usuarios LIMIT 1)
WHERE id_produto = 'a21fe1a6-1022-442d-86a2-6cbecaaefe39'
  AND id_loja = 3;

INSERT INTO historico_estoque (
    id_produto, id_loja, usuario_id, quantidade,
    quantidade_anterior, quantidade_nova, tipo_movimentacao, motivo, observacao
)
SELECT 
    'a21fe1a6-1022-442d-86a2-6cbecaaefe39', 3,
    (SELECT id FROM usuarios LIMIT 1), 1,
    el.quantidade - 1, el.quantidade, 'ajuste',
    'Correção de baixa duplicada',
    'Devolução: TAMPA IPHONE 12 PRETA - Venda #18 (baixa duplicada em 2025-12-04 15:19:08)'
FROM estoque_lojas el
WHERE el.id_produto = 'a21fe1a6-1022-442d-86a2-6cbecaaefe39' AND el.id_loja = 3;

-- ============================================================================
-- RESUMO DA CORREÇÃO
-- ============================================================================
SELECT 
    'CORREÇÃO CONCLUÍDA' as status,
    COUNT(*) as total_produtos_corrigidos,
    SUM(
        CASE 
            WHEN id_loja = 1 THEN 1 
            ELSE 0 
        END
    ) as produtos_loja_feira,
    SUM(
        CASE 
            WHEN id_loja = 3 THEN 1 
            ELSE 0 
        END
    ) as produtos_loja_atacado
FROM (
    VALUES 
        ('e8f626aa-67b7-4a94-b5c2-e16e17b4081d', 3),
        ('bd99757a-104b-4db9-bdc2-abc56b09ecf6', 3),
        ('bcee2fdc-6ab0-4ea0-90ce-0247a4010195', 3),
        ('4fa925fa-da87-493e-93aa-804088c47ae2', 3),
        ('01902601-2700-4edb-9737-3f770d5bc567', 3),
        ('3252ae85-318c-4e78-b357-c4426ed15653', 3),
        ('d08c8eec-95ff-42c2-b6b0-47423c46b1c8', 3),
        ('55ce3f98-e6b7-4a7d-84b5-4220e786d65e', 1),
        ('1e03986c-dff5-4882-9a24-8334c415baae', 1),
        ('476a804a-2068-4345-a4db-7fda99fa6c6b', 3),
        ('eb1fcaf4-ccca-4c1f-a76e-5a8c868f42f1', 3),
        ('68ffe097-25e6-4151-a7f3-b67354623766', 1),
        ('f9c8851d-615e-4d56-a506-618e9f337978', 1),
        ('c66fddca-ff31-42f1-b837-c73312f6e2fa', 1),
        ('b9585951-c8e0-47cc-b9fe-6713f9ad7f81', 1),
        ('af608ccb-7eb8-4b10-866d-5698d81a1283', 3),
        ('cc10aae8-a2c9-4a4c-949d-b77c5cdd7a57', 3),
        ('a21fe1a6-1022-442d-86a2-6cbecaaefe39', 3)
) as produtos(id_produto, id_loja);

-- ============================================================================
-- INSTRUÇÕES:
-- ============================================================================
-- 1. TESTE: Descomente a linha "BEGIN;" no início do script
-- 2. Execute o script completo
-- 3. Verifique o resumo e os registros no historico_estoque
-- 4. Se estiver correto: COMMIT;
-- 5. Se houver problema: ROLLBACK;
-- ============================================================================

-- COMMIT;
-- ou
-- ROLLBACK;
