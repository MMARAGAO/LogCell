-- ============================================
-- Script completo de importacao - 2026-06-11 08:44:12.065905
-- Fonte: vendas_final.csv (397 linhas)
-- ============================================

BEGIN;

-- ============================================
-- 1. LIMPAR DADOS EXISTENTES (Cliente Balcao)
-- ============================================
DO $$
DECLARE
    v_cliente_id UUID;
    v_count INT;
BEGIN
    SELECT id INTO v_cliente_id FROM clientes WHERE nome = 'Cliente Balcao' LIMIT 1;

    IF v_cliente_id IS NOT NULL THEN
        -- Aparelhos vinculados a vendas do Cliente Balcao
        DELETE FROM aparelhos WHERE venda_id IN (SELECT id FROM vendas WHERE cliente_id = v_cliente_id);
        GET DIAGNOSTICS v_count = ROW_COUNT;
        RAISE NOTICE 'Aparelhos removidos: %', v_count;

        -- Vendas (CASCADE: pagamentos_venda, brindes_aparelhos, creditos_cliente,
        --   descontos_venda, devolucoes_venda, historico_vendas, itens_venda,
        --   sangrias_caixa, trocas_produtos, itens_devolucao)
        DELETE FROM vendas WHERE cliente_id = v_cliente_id;
        GET DIAGNOSTICS v_count = ROW_COUNT;
        RAISE NOTICE 'Vendas removidas: %', v_count;

        -- Remove o cliente
        DELETE FROM clientes WHERE id = v_cliente_id;
        RAISE NOTICE 'Cliente Balcao removido';
    ELSE
        RAISE NOTICE 'Nenhum cliente Balcao encontrado para limpeza';
    END IF;
END;
$$;

-- ============================================
-- 2. CRIAR CLIENTE PADRAO
-- ============================================
INSERT INTO clientes (id, nome, id_loja, criado_em, atualizado_em)
SELECT gen_random_uuid(), 'Cliente Balcao', 1, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE nome = 'Cliente Balcao');

DO $$
DECLARE
    v_cliente_id UUID;
BEGIN
    SELECT id INTO v_cliente_id FROM clientes WHERE nome = 'Cliente Balcao' LIMIT 1;
    PERFORM set_config('importacao.cliente_id', v_cliente_id::text, true);
END;
$$;

-- ============================================
-- 3. IMPORTAR VENDAS
-- ============================================

DO $$
DECLARE
    v_max INT;
BEGIN
    SELECT COALESCE(max(numero_venda), 0) INTO v_max FROM vendas;
    PERFORM set_config('importacao.proximo_numero', (v_max + 1)::text, true);
END;
$$;

-- LINHA 2 [NAO]: REDMI PAD 2 128GB GRAFIT NOVO (30/06/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('78d6fa6a-72c5-4060-a185-a3ea26d3f6b3', 'Xiaomi', 'REDMI PAD 2 128GB GRAFIT NOVO', '65520/W5Z501219', 1200.0, 900.0, 1, 'novo', 'perfeito', 'vendido', '2026-06-30', '2026-06-30', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-06-30', '2026-06-30', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('2e4d5674-30cd-4be2-ba57-1dd466919378', current_setting('importacao.proximo_numero')::int + 0, current_setting('importacao.cliente_id')::uuid, 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 1200.0, 1200.0, 0.0, '2026-06-30', '2026-06-30', '85e3aa42-b9af-49b8-a72a-64e9c337aa53');
UPDATE aparelhos SET venda_id = '2e4d5674-30cd-4be2-ba57-1dd466919378' WHERE id = '78d6fa6a-72c5-4060-a185-a3ea26d3f6b3';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('8ffd08d9-6c03-4bc0-abc0-a422282f55f5', '2e4d5674-30cd-4be2-ba57-1dd466919378', 'pix', 1200.0, '2026-06-30', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 1, '2026-06-30T14:00:00');

-- LINHA 3 [NAO]: MI 15T PRO 512GB PRETO NOVO (01/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('390972d8-63ab-4833-9701-c66b89abd113', 'Xiaomi', 'MI 15T PRO 512GB PRETO NOVO', '860786082136022', 5250.0, 5000.0, 4, 'novo', 'perfeito', 'vendido', '2026-05-01', '2026-05-01', 'e07d4d35-1381-4d4d-914d-8382a7456fdd', '2026-05-01', '2026-05-01', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('3d4ff871-a2e8-4a82-9736-1b2b568acb02', current_setting('importacao.proximo_numero')::int + 1, current_setting('importacao.cliente_id')::uuid, 4, 'e07d4d35-1381-4d4d-914d-8382a7456fdd', 'concluida', 'normal', 5250.0, 5250.0, 0.0, '2026-05-01', '2026-05-01', 'e07d4d35-1381-4d4d-914d-8382a7456fdd');
UPDATE aparelhos SET venda_id = '3d4ff871-a2e8-4a82-9736-1b2b568acb02' WHERE id = '390972d8-63ab-4833-9701-c66b89abd113';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('d996591b-bbbd-4836-ab4a-dfbfb473003a', '3d4ff871-a2e8-4a82-9736-1b2b568acb02', 'pix', 800.0, '2026-05-01', 'e07d4d35-1381-4d4d-914d-8382a7456fdd', 1, '2026-05-01T14:00:00');
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, observacao, parcelas, criado_em)
VALUES ('e10b9571-c673-4437-9e09-b37f16bd2e8d', '3d4ff871-a2e8-4a82-9736-1b2b568acb02', 'troca_aparelho', 4450.0, '2026-05-01', 'e07d4d35-1381-4d4d-914d-8382a7456fdd', 'Troca: IPHONE 16 PRO 256GB PRETO', 1, '2026-05-01T14:00:00');

-- LINHA 4 [NAO]: IPHONE 17 PRO MAX 256GB LARANJA NOVO (01/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('a90f156a-a683-443d-856a-3cd6402f3a39', 'Apple', 'IPHONE 17 PRO MAX 256GB LARANJA NOVO', '352116262845892', 8424.0, 8200.0, 4, 'novo', 'perfeito', 'vendido', '2026-05-01', '2026-05-01', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-01', '2026-05-01', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('e1f07515-5e78-4927-92b8-5ee579d7c6e5', current_setting('importacao.proximo_numero')::int + 2, current_setting('importacao.cliente_id')::uuid, 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 8424.0, 8424.0, 0.0, '2026-05-01', '2026-05-01', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
UPDATE aparelhos SET venda_id = 'e1f07515-5e78-4927-92b8-5ee579d7c6e5' WHERE id = 'a90f156a-a683-443d-856a-3cd6402f3a39';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('57cd719d-e726-43a2-9e57-1fe7c7b936dc', 'e1f07515-5e78-4927-92b8-5ee579d7c6e5', 'cartao_credito', 6624.0, '2026-05-01', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1, '2026-05-01T14:00:00');
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, observacao, parcelas, criado_em)
VALUES ('8e8f9269-b8c3-40d2-85b4-2bf3348934dd', 'e1f07515-5e78-4927-92b8-5ee579d7c6e5', 'troca_aparelho', 1800.0, '2026-05-01', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'Troca: 14 128 LILAS SEMINOVO', 1, '2026-05-01T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('fab2984a-149e-452b-bd35-322175655072', 4, 'e1f07515-5e78-4927-92b8-5ee579d7c6e5', 'Brinde', 5.0, '2026-05-01', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-01');

-- LINHA 5 [NAO]: IPHONE 16 PRO MAX 512GB BRANCO SEMINOVO (01/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('ee7061d6-a9f1-4309-a5ae-46254c2c6863', 'Apple', 'IPHONE 16 PRO MAX 512GB BRANCO SEMINOVO', '355300182456355', 5700.0, 5150.0, 1, 'seminovo', 'bom', 'vendido', '2026-05-01', '2026-05-01', '9451cd9f-6770-4e32-aae8-c75fa675e818', '2026-05-01', '2026-05-01', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('3fbd11f0-797e-491e-991a-282e15866e88', current_setting('importacao.proximo_numero')::int + 3, current_setting('importacao.cliente_id')::uuid, 1, '9451cd9f-6770-4e32-aae8-c75fa675e818', 'concluida', 'normal', 5700.0, 5700.0, 0.0, '2026-05-01', '2026-05-01', '9451cd9f-6770-4e32-aae8-c75fa675e818');
UPDATE aparelhos SET venda_id = '3fbd11f0-797e-491e-991a-282e15866e88' WHERE id = 'ee7061d6-a9f1-4309-a5ae-46254c2c6863';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('11d9b0b8-9e01-442f-9f8b-eb2f53fb40b7', '3fbd11f0-797e-491e-991a-282e15866e88', 'pix', 3700.0, '2026-05-01', '9451cd9f-6770-4e32-aae8-c75fa675e818', 1, '2026-05-01T14:00:00');
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, observacao, parcelas, criado_em)
VALUES ('de05bdd3-21ef-4774-8862-f87976cdadde', '3fbd11f0-797e-491e-991a-282e15866e88', 'troca_aparelho', 2000.0, '2026-05-01', '9451cd9f-6770-4e32-aae8-c75fa675e818', 'Troca: IPHONE 12 PRO MAX 128GB', 1, '2026-05-01T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('717da8cc-070d-44d1-956d-c71c6e5e2bbe', 1, '3fbd11f0-797e-491e-991a-282e15866e88', 'Brinde', 115.0, '2026-05-01', '9451cd9f-6770-4e32-aae8-c75fa675e818', '2026-05-01');

-- LINHA 6 [NAO]: IPHONE 16 PRO MAX  1TB PRETO SEMINOVO (01/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('97c77982-344e-4f3d-ba36-845892f80166', 'Apple', 'IPHONE 16 PRO MAX  1TB PRETO SEMINOVO', '355138329181332', 5800.0, 5350.0, 1, 'seminovo', 'bom', 'vendido', '2026-05-01', '2026-05-01', '9451cd9f-6770-4e32-aae8-c75fa675e818', '2026-05-01', '2026-05-01', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('ecba1199-e7d0-47ab-a3be-297cfef600f2', current_setting('importacao.proximo_numero')::int + 4, current_setting('importacao.cliente_id')::uuid, 1, '9451cd9f-6770-4e32-aae8-c75fa675e818', 'concluida', 'normal', 5800.0, 5800.0, 0.0, '2026-05-01', '2026-05-01', '9451cd9f-6770-4e32-aae8-c75fa675e818');
UPDATE aparelhos SET venda_id = 'ecba1199-e7d0-47ab-a3be-297cfef600f2' WHERE id = '97c77982-344e-4f3d-ba36-845892f80166';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('dc21dbcc-6656-4b47-a261-7a1678a57b60', 'ecba1199-e7d0-47ab-a3be-297cfef600f2', 'pix', 5800.0, '2026-05-01', '9451cd9f-6770-4e32-aae8-c75fa675e818', 1, '2026-05-01T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('df3ef736-90ab-47e6-a657-c2ee2682abd8', 1, 'ecba1199-e7d0-47ab-a3be-297cfef600f2', 'Brinde', 25.0, '2026-05-01', '9451cd9f-6770-4e32-aae8-c75fa675e818', '2026-05-01');

-- LINHA 7 [NAO]: IPHONE 15 PRO MAX 256GB PRETO SEMINOVO (01/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('99525fb7-f1e4-453d-bd97-878a38c78983', 'Apple', 'IPHONE 15 PRO MAX 256GB PRETO SEMINOVO', '356964467452295', 4340.0, 3950.0, 1, 'seminovo', 'bom', 'vendido', '2026-05-01', '2026-05-01', '9451cd9f-6770-4e32-aae8-c75fa675e818', '2026-05-01', '2026-05-01', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('430564f4-213f-460b-b8d5-d5bc2c564c8f', current_setting('importacao.proximo_numero')::int + 5, current_setting('importacao.cliente_id')::uuid, 1, '9451cd9f-6770-4e32-aae8-c75fa675e818', 'concluida', 'normal', 4340.0, 4340.0, 0.0, '2026-05-01', '2026-05-01', '9451cd9f-6770-4e32-aae8-c75fa675e818');
UPDATE aparelhos SET venda_id = '430564f4-213f-460b-b8d5-d5bc2c564c8f' WHERE id = '99525fb7-f1e4-453d-bd97-878a38c78983';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('c94d728d-7d60-4f15-916d-933271a17655', '430564f4-213f-460b-b8d5-d5bc2c564c8f', 'pix', 4340.0, '2026-05-01', '9451cd9f-6770-4e32-aae8-c75fa675e818', 1, '2026-05-01T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('3bb4134a-7ac5-490a-8ebf-51eb97dd7fbe', 1, '430564f4-213f-460b-b8d5-d5bc2c564c8f', 'Brinde', 25.0, '2026-05-01', '9451cd9f-6770-4e32-aae8-c75fa675e818', '2026-05-01');

-- LINHA 8 [NAO]: IPHONE 16 PRO MAX 256GB PRETO SEMINOVO (01/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('378630f4-e4a2-4bd0-8f3c-a3d1f76501a7', 'Apple', 'IPHONE 16 PRO MAX 256GB PRETO SEMINOVO', '356541623888990', 5550.0, 5000.0, 1, 'seminovo', 'bom', 'vendido', '2026-05-01', '2026-05-01', '9451cd9f-6770-4e32-aae8-c75fa675e818', '2026-05-01', '2026-05-01', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('1c4bb4e1-b6a8-484f-91de-fa3360512a5a', current_setting('importacao.proximo_numero')::int + 6, current_setting('importacao.cliente_id')::uuid, 1, '9451cd9f-6770-4e32-aae8-c75fa675e818', 'concluida', 'normal', 5550.0, 5550.0, 0.0, '2026-05-01', '2026-05-01', '9451cd9f-6770-4e32-aae8-c75fa675e818');
UPDATE aparelhos SET venda_id = '1c4bb4e1-b6a8-484f-91de-fa3360512a5a' WHERE id = '378630f4-e4a2-4bd0-8f3c-a3d1f76501a7';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('4825251c-d7dc-4eef-88a9-ca3c3d9a9d6e', '1c4bb4e1-b6a8-484f-91de-fa3360512a5a', 'pix', 2550.0, '2026-05-01', '9451cd9f-6770-4e32-aae8-c75fa675e818', 1, '2026-05-01T14:00:00');
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, observacao, parcelas, criado_em)
VALUES ('d0c68b2a-cb77-42ad-bb94-72d19c4d9ee3', '1c4bb4e1-b6a8-484f-91de-fa3360512a5a', 'troca_aparelho', 3000.0, '2026-05-01', '9451cd9f-6770-4e32-aae8-c75fa675e818', 'Troca: IPHONE 14 PRO MAX 128GB', 1, '2026-05-01T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('78963436-461c-4613-bcc8-ff9cf3ef7c06', 1, '1c4bb4e1-b6a8-484f-91de-fa3360512a5a', 'Brinde', 25.0, '2026-05-01', '9451cd9f-6770-4e32-aae8-c75fa675e818', '2026-05-01');

-- LINHA 9 [NAO]: IPHONE 17 PRO SILVER 256GB NOVO (01/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('5b4dc26a-0747-401e-bf12-0b51c10dfea1', 'Apple', 'IPHONE 17 PRO SILVER 256GB NOVO', '352001997459930', 7900.0, 7600.0, 19, 'novo', 'perfeito', 'vendido', '2026-05-01', '2026-05-01', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-01', '2026-05-01', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('d3a20607-eed3-47ac-85eb-26ea793af3d9', current_setting('importacao.proximo_numero')::int + 7, current_setting('importacao.cliente_id')::uuid, 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 7900.0, 7900.0, 0.0, '2026-05-01', '2026-05-01', '97f12885-87ad-426a-8bbb-656889d82e10');
UPDATE aparelhos SET venda_id = 'd3a20607-eed3-47ac-85eb-26ea793af3d9' WHERE id = '5b4dc26a-0747-401e-bf12-0b51c10dfea1';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('2c0ad0d0-0fd7-4bbc-af19-32c7af1f15dc', 'd3a20607-eed3-47ac-85eb-26ea793af3d9', 'pix', 3500.0, '2026-05-01', '97f12885-87ad-426a-8bbb-656889d82e10', 1, '2026-05-01T14:00:00');
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, observacao, parcelas, criado_em)
VALUES ('804efc69-2600-40d9-bc39-c8b572a7ccde', 'd3a20607-eed3-47ac-85eb-26ea793af3d9', 'troca_aparelho', 4400.0, '2026-05-01', '97f12885-87ad-426a-8bbb-656889d82e10', 'Troca: IPHONE 16 PRO', 1, '2026-05-01T14:00:00');

-- LINHA 10 [NAO]: IPHONE 14 PRO MAX 128GB ROXO SEMINOVO (01/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('af157162-b54d-4d0f-be3f-ccfc2dae35e4', 'Apple', 'IPHONE 14 PRO MAX 128GB ROXO SEMINOVO', '357650618525795', 3500.0, 3250.0, 20, 'seminovo', 'bom', 'vendido', '2026-05-01', '2026-05-01', '25e2da5b-9e76-4388-9890-7e22efd6940d', '2026-05-01', '2026-05-01', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('0e517ad6-4b69-4f2f-8587-afc5c7e1ce0b', current_setting('importacao.proximo_numero')::int + 8, current_setting('importacao.cliente_id')::uuid, 20, '25e2da5b-9e76-4388-9890-7e22efd6940d', 'concluida', 'normal', 3500.0, 3500.0, 0.0, '2026-05-01', '2026-05-01', '25e2da5b-9e76-4388-9890-7e22efd6940d');
UPDATE aparelhos SET venda_id = '0e517ad6-4b69-4f2f-8587-afc5c7e1ce0b' WHERE id = 'af157162-b54d-4d0f-be3f-ccfc2dae35e4';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('560dc0e2-4330-4e92-834f-45c834c3257b', '0e517ad6-4b69-4f2f-8587-afc5c7e1ce0b', 'pix', 3500.0, '2026-05-01', '25e2da5b-9e76-4388-9890-7e22efd6940d', 1, '2026-05-01T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('8321b764-9297-4d19-8ba4-77ea71a245a7', 20, '0e517ad6-4b69-4f2f-8587-afc5c7e1ce0b', 'Brinde', 15.0, '2026-05-01', '25e2da5b-9e76-4388-9890-7e22efd6940d', '2026-05-01');

-- LINHA 11 [NAO]: IPHONE 12 PRO MAX 256GB GOLD SEMINOVO (01/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('ec6b2251-7b50-47e4-8a4c-860997d12a33', 'Apple', 'IPHONE 12 PRO MAX 256GB GOLD SEMINOVO', '350408484865846', 2600.0, 2350.0, 1, 'seminovo', 'bom', 'vendido', '2026-05-01', '2026-05-01', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-01', '2026-05-01', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('73e41bff-433f-4464-aed6-cea84b18f72e', current_setting('importacao.proximo_numero')::int + 9, current_setting('importacao.cliente_id')::uuid, 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 2600.0, 2600.0, 0.0, '2026-05-01', '2026-05-01', '85e3aa42-b9af-49b8-a72a-64e9c337aa53');
UPDATE aparelhos SET venda_id = '73e41bff-433f-4464-aed6-cea84b18f72e' WHERE id = 'ec6b2251-7b50-47e4-8a4c-860997d12a33';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('14cbe09a-94cd-485b-9e17-bc3420e1e78d', '73e41bff-433f-4464-aed6-cea84b18f72e', 'pix', 2600.0, '2026-05-01', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 1, '2026-05-01T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('9d2974d7-9c4f-4c60-bbbf-c2131902b7a4', 1, '73e41bff-433f-4464-aed6-cea84b18f72e', 'Brinde', 25.0, '2026-05-01', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-01');

-- LINHA 12 [NAO]: IPHONE 14 PRO MAX 256GB ROXO SEMINOVO (01/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('aa2e7a25-16dc-4795-bb38-ba6b4743691e', 'Apple', 'IPHONE 14 PRO MAX 256GB ROXO SEMINOVO', '353665909220967', 3460.0, 3300.0, 1, 'seminovo', 'bom', 'vendido', '2026-05-01', '2026-05-01', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-01', '2026-05-01', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('28cb47f1-66f6-43c4-8040-9af152a33bcd', current_setting('importacao.proximo_numero')::int + 10, current_setting('importacao.cliente_id')::uuid, 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 3460.0, 3460.0, 0.0, '2026-05-01', '2026-05-01', '85e3aa42-b9af-49b8-a72a-64e9c337aa53');
UPDATE aparelhos SET venda_id = '28cb47f1-66f6-43c4-8040-9af152a33bcd' WHERE id = 'aa2e7a25-16dc-4795-bb38-ba6b4743691e';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('3bc1bc0f-0058-4a27-a721-4ec5cdd1cd30', '28cb47f1-66f6-43c4-8040-9af152a33bcd', 'pix', 3460.0, '2026-05-01', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 1, '2026-05-01T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('2561eb50-2d29-4349-b3db-991941603033', 1, '28cb47f1-66f6-43c4-8040-9af152a33bcd', 'Brinde', 25.0, '2026-05-01', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-01');

-- LINHA 13 [NAO]: IPHONE 16 PRO 256GB BRANCO SEMINOVO (01/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('c6521eac-68c9-4cb4-8a6d-25357436af9f', 'Apple', 'IPHONE 16 PRO 256GB BRANCO SEMINOVO', '355515605909702', 5915.0, 4500.0, 1, 'seminovo', 'bom', 'vendido', '2026-05-01', '2026-05-01', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-01', '2026-05-01', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('575cdbb9-676a-4422-96a8-1cf3517f39a4', current_setting('importacao.proximo_numero')::int + 11, current_setting('importacao.cliente_id')::uuid, 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 5915.0, 5915.0, 0.0, '2026-05-01', '2026-05-01', '85e3aa42-b9af-49b8-a72a-64e9c337aa53');
UPDATE aparelhos SET venda_id = '575cdbb9-676a-4422-96a8-1cf3517f39a4' WHERE id = 'c6521eac-68c9-4cb4-8a6d-25357436af9f';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('f75becc7-e23c-4e46-99ef-12c5217ba697', '575cdbb9-676a-4422-96a8-1cf3517f39a4', 'pix', 2715.0, '2026-05-01', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 1, '2026-05-01T14:00:00');
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, observacao, parcelas, criado_em)
VALUES ('95b4ab99-1e07-4a3e-a843-270b0d911609', '575cdbb9-676a-4422-96a8-1cf3517f39a4', 'troca_aparelho', 3200.0, '2026-05-01', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'Troca: IPH 15 PRO MAX 256GB NATURAL', 1, '2026-05-01T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('69da05df-3617-4da9-96df-e32fd8dcd5f6', 1, '575cdbb9-676a-4422-96a8-1cf3517f39a4', 'Brinde', 25.0, '2026-05-01', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-01');

-- LINHA 14 [NAO]: IPHONE 16 PRO MAX 512GB NATURAL SEMINOVO (01/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('a193467b-4f24-4002-b78c-8f2af681e60f', 'Apple', 'IPHONE 16 PRO MAX 512GB NATURAL SEMINOVO', '355138329035488', 5525.0, 5150.0, 1, 'seminovo', 'bom', 'vendido', '2026-05-01', '2026-05-01', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-01', '2026-05-01', 'Pagto junto (Aparelho 1/2, total grupo R$ 11,050)');
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('8eb614cb-bf0c-4361-8464-62360da5a520', current_setting('importacao.proximo_numero')::int + 12, current_setting('importacao.cliente_id')::uuid, 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 5525.0, 5525.0, 0.0, '2026-05-01', '2026-05-01', '85e3aa42-b9af-49b8-a72a-64e9c337aa53');
UPDATE aparelhos SET venda_id = '8eb614cb-bf0c-4361-8464-62360da5a520' WHERE id = 'a193467b-4f24-4002-b78c-8f2af681e60f';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('120d3166-3b65-4ba4-ac95-2d9b9a4152f3', '8eb614cb-bf0c-4361-8464-62360da5a520', 'pix', 5525.0, '2026-05-01', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 1, '2026-05-01T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('a448fffd-bba3-4716-82de-7fc46d8d7934', 1, '8eb614cb-bf0c-4361-8464-62360da5a520', 'Brinde', 25.0, '2026-05-01', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-01');

-- LINHA 15 [NAO]: IPHONE 16 PRO MAX 256GB NATURAL SEMINOVO (01/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('3bced2bf-9f6b-479f-9670-aa36df6b94f6', 'Apple', 'IPHONE 16 PRO MAX 256GB NATURAL SEMINOVO', '353484624594932', 5525.0, 5000.0, 1, 'seminovo', 'bom', 'vendido', '2026-05-01', '2026-05-01', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-01', '2026-05-01', 'Pagto junto (Aparelho 2/2, total grupo R$ 11,050)');
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('56f80fbd-b3be-4020-93e3-6aa0b8597652', current_setting('importacao.proximo_numero')::int + 13, current_setting('importacao.cliente_id')::uuid, 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 5525.0, 5525.0, 0.0, '2026-05-01', '2026-05-01', '85e3aa42-b9af-49b8-a72a-64e9c337aa53');
UPDATE aparelhos SET venda_id = '56f80fbd-b3be-4020-93e3-6aa0b8597652' WHERE id = '3bced2bf-9f6b-479f-9670-aa36df6b94f6';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('6a549884-aaa1-442b-82fc-f6c6400cbd86', '56f80fbd-b3be-4020-93e3-6aa0b8597652', 'pix', 2775.0, '2026-05-01', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 1, '2026-05-01T14:00:00');
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, observacao, parcelas, criado_em)
VALUES ('9970c3c7-f9ad-48d8-b4a6-0fb052e70a49', '56f80fbd-b3be-4020-93e3-6aa0b8597652', 'troca_aparelho', 2750.0, '2026-05-01', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'Troca: IPH 15 128GB', 1, '2026-05-01T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('62165b64-db9b-43a0-8b12-b87535cda165', 1, '56f80fbd-b3be-4020-93e3-6aa0b8597652', 'Brinde', 25.0, '2026-05-01', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-01');

-- LINHA 16 [NAO]: MACBOOK M1 SPACE 8/256 SEMINOVO (01/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('408c2ea1-8717-4ee9-bbba-3290c78c9fb1', 'Apple', 'MACBOOK M1 SPACE 8/256 SEMINOVO', 'C02G79MTQ6L7', 4100.0, 3900.0, 1, 'seminovo', 'bom', 'vendido', '2026-05-01', '2026-05-01', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-01', '2026-05-01', 'Pagto junto (Aparelho 1/2, total grupo R$ 10,360)');
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('1a9f7abd-f32f-470b-a72a-d81d4ff13eef', current_setting('importacao.proximo_numero')::int + 14, current_setting('importacao.cliente_id')::uuid, 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 4100.0, 4100.0, 0.0, '2026-05-01', '2026-05-01', '85e3aa42-b9af-49b8-a72a-64e9c337aa53');
UPDATE aparelhos SET venda_id = '1a9f7abd-f32f-470b-a72a-d81d4ff13eef' WHERE id = '408c2ea1-8717-4ee9-bbba-3290c78c9fb1';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('3b6af594-59b5-4c4b-9a67-d5edd5456dfa', '1a9f7abd-f32f-470b-a72a-d81d4ff13eef', 'pix', 4100.0, '2026-05-01', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 1, '2026-05-01T14:00:00');

-- LINHA 17 [NAO]: IPHONE 16 PRO MAX BRANCO 1TB SEMINOVO (01/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('64d7fc08-56ab-4b2b-972f-04b74ff4fcb4', 'Apple', 'IPHONE 16 PRO MAX BRANCO 1TB SEMINOVO', '357177506679088', 6260.0, 5350.0, 1, 'seminovo', 'bom', 'vendido', '2026-05-01', '2026-05-01', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-01', '2026-05-01', 'Pagto junto (Aparelho 2/2, total grupo R$ 10,360)');
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('84720b04-f28a-453b-9a32-955ec2b4b76c', current_setting('importacao.proximo_numero')::int + 15, current_setting('importacao.cliente_id')::uuid, 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 6260.0, 6260.0, 0.0, '2026-05-01', '2026-05-01', '85e3aa42-b9af-49b8-a72a-64e9c337aa53');
UPDATE aparelhos SET venda_id = '84720b04-f28a-453b-9a32-955ec2b4b76c' WHERE id = '64d7fc08-56ab-4b2b-972f-04b74ff4fcb4';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('5c860641-a68f-43af-909f-ce89b05eb720', '84720b04-f28a-453b-9a32-955ec2b4b76c', 'pix', 2310.0, '2026-05-01', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 1, '2026-05-01T14:00:00');
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, observacao, parcelas, criado_em)
VALUES ('e316122d-7c86-4d19-b8da-f560f083bf34', '84720b04-f28a-453b-9a32-955ec2b4b76c', 'troca_aparelho', 3950.0, '2026-05-01', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'Troca: IPH 15 PRO MAX 256GB AZUL', 1, '2026-05-01T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('29081fd1-8d63-4e7c-bf7f-5397a7855b96', 1, '84720b04-f28a-453b-9a32-955ec2b4b76c', 'Brinde', 25.0, '2026-05-01', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-01');

-- LINHA 18 [NAO]: APPLE WATCH SERIE 11 46MM SPACE GRAY NOVO (02/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('e3909178-92dd-42a2-8f8a-baba1b3406c8', 'Apple', 'APPLE WATCH SERIE 11 46MM SPACE GRAY NOVO', 'KXJL4WFK4P', 2450.0, 2350.0, 4, 'novo', 'perfeito', 'vendido', '2026-05-02', '2026-05-02', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-02', '2026-05-02', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('7b45842a-cb41-4b43-9076-27f9123289eb', current_setting('importacao.proximo_numero')::int + 16, current_setting('importacao.cliente_id')::uuid, 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 2450.0, 2450.0, 0.0, '2026-05-02', '2026-05-02', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
UPDATE aparelhos SET venda_id = '7b45842a-cb41-4b43-9076-27f9123289eb' WHERE id = 'e3909178-92dd-42a2-8f8a-baba1b3406c8';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('3014a131-04b2-4fa1-a041-1ce45fea9a78', '7b45842a-cb41-4b43-9076-27f9123289eb', 'cartao_credito', 2450.0, '2026-05-02', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1, '2026-05-02T14:00:00');

-- LINHA 19 [NAO]: IPHONE 14 128GB BRANCO SEMINOVO (02/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('f91df28a-2b52-4e72-b5e7-35482ee9f24e', 'Apple', 'IPHONE 14 128GB BRANCO SEMINOVO', '350671525377135', 2199.0, 2050.0, 19, 'seminovo', 'bom', 'vendido', '2026-05-02', '2026-05-02', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-02', '2026-05-02', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('98cddfdd-e7da-4fd7-bb1e-77b26181dbaf', current_setting('importacao.proximo_numero')::int + 17, current_setting('importacao.cliente_id')::uuid, 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 2199.0, 2199.0, 0.0, '2026-05-02', '2026-05-02', '97f12885-87ad-426a-8bbb-656889d82e10');
UPDATE aparelhos SET venda_id = '98cddfdd-e7da-4fd7-bb1e-77b26181dbaf' WHERE id = 'f91df28a-2b52-4e72-b5e7-35482ee9f24e';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('217bd3ba-64da-4506-b1d6-d77dab16bd3b', '98cddfdd-e7da-4fd7-bb1e-77b26181dbaf', 'pix', 2149.0, '2026-05-02', '97f12885-87ad-426a-8bbb-656889d82e10', 1, '2026-05-02T14:00:00');
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('d66e9ba6-1690-4c1b-98ee-18779a057019', '98cddfdd-e7da-4fd7-bb1e-77b26181dbaf', 'cartao_debito', 50.0, '2026-05-02', '97f12885-87ad-426a-8bbb-656889d82e10', 1, '2026-05-02T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('5dc440de-d3f2-4a7a-a066-4a9a58e8022e', 19, '98cddfdd-e7da-4fd7-bb1e-77b26181dbaf', 'Brinde', 35.0, '2026-05-02', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-02');

-- LINHA 20 [NAO]: IPHONE 17 256GB LAVANDA NOVO (02/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('ece3ffe2-cba5-4452-8cee-3ca58a57f0b3', 'Apple', 'IPHONE 17 256GB LAVANDA NOVO', '359973613029086', 5300.0, 5050.0, 19, 'novo', 'perfeito', 'vendido', '2026-05-02', '2026-05-02', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-02', '2026-05-02', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('6ff2c927-7343-4091-a57a-c2f2ee03d6bd', current_setting('importacao.proximo_numero')::int + 18, current_setting('importacao.cliente_id')::uuid, 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 5300.0, 5300.0, 0.0, '2026-05-02', '2026-05-02', '97f12885-87ad-426a-8bbb-656889d82e10');
UPDATE aparelhos SET venda_id = '6ff2c927-7343-4091-a57a-c2f2ee03d6bd' WHERE id = 'ece3ffe2-cba5-4452-8cee-3ca58a57f0b3';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('6ab20daa-40ab-4f72-8f64-26835ec6e6a8', '6ff2c927-7343-4091-a57a-c2f2ee03d6bd', 'cartao_credito', 4600.0, '2026-05-02', '97f12885-87ad-426a-8bbb-656889d82e10', 1, '2026-05-02T14:00:00');
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, observacao, parcelas, criado_em)
VALUES ('656d653c-43ce-4f7f-ae79-db378b47f54b', '6ff2c927-7343-4091-a57a-c2f2ee03d6bd', 'troca_aparelho', 700.0, '2026-05-02', '97f12885-87ad-426a-8bbb-656889d82e10', 'Troca: IPH 11 128GB BRANCO', 1, '2026-05-02T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('b439572b-2001-4235-903d-a54d3bd91568', 19, '6ff2c927-7343-4091-a57a-c2f2ee03d6bd', 'Brinde', 20.0, '2026-05-02', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-02');

-- LINHA 21 [NAO]: APPLE WATCH ULTRA 3 PRETO NOVO (02/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('ce3e1c38-5f84-4892-adeb-01f355caa92f', 'Apple', 'APPLE WATCH ULTRA 3 PRETO NOVO', '368135794662306', 4750.0, 4400.0, 19, 'novo', 'perfeito', 'vendido', '2026-05-02', '2026-05-02', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-02', '2026-05-02', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('fef11b22-d10d-4a8b-a7ff-f0ec4dfd71e3', current_setting('importacao.proximo_numero')::int + 19, current_setting('importacao.cliente_id')::uuid, 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 4750.0, 4750.0, 0.0, '2026-05-02', '2026-05-02', '97f12885-87ad-426a-8bbb-656889d82e10');
UPDATE aparelhos SET venda_id = 'fef11b22-d10d-4a8b-a7ff-f0ec4dfd71e3' WHERE id = 'ce3e1c38-5f84-4892-adeb-01f355caa92f';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('31aeb70f-46ba-4067-b00f-41e2ae9d76e9', 'fef11b22-d10d-4a8b-a7ff-f0ec4dfd71e3', 'pix', 4750.0, '2026-05-02', '97f12885-87ad-426a-8bbb-656889d82e10', 1, '2026-05-02T14:00:00');

-- LINHA 22 [SIM]: IPHONE 16 PRO MAX 512GB PRETO SEMINOVO (02/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('28e4b924-7190-43ee-9f06-4e642211fdad', 'Apple', 'IPHONE 16 PRO MAX 512GB PRETO SEMINOVO', '356744605708190', 5600.0, 5150.0, 20, 'seminovo', 'bom', 'vendido', '2026-05-02', '2026-05-02', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', '2026-05-02', '2026-05-02', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('4f1101b8-b482-4e63-ae5c-87cda065702f', current_setting('importacao.proximo_numero')::int + 20, current_setting('importacao.cliente_id')::uuid, 20, 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 'concluida', 'normal', 5600.0, 5600.0, 0.0, '2026-05-02', '2026-05-02', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4');
UPDATE aparelhos SET venda_id = '4f1101b8-b482-4e63-ae5c-87cda065702f' WHERE id = '28e4b924-7190-43ee-9f06-4e642211fdad';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('2af2f973-3302-4f4e-8e4f-5299e71d66ca', '4f1101b8-b482-4e63-ae5c-87cda065702f', 'pix', 5600.0, '2026-05-02', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 1, '2026-05-02T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('d883f4b9-1223-4950-88da-010afe1b173e', 20, '4f1101b8-b482-4e63-ae5c-87cda065702f', 'Brinde', 25.0, '2026-05-02', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', '2026-05-02');

-- LINHA 23 [NAO]: IPHONE 15 PRO MAX 256GB NATURAL SEMINOVO (02/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('e81c5171-049b-4e2f-8a2d-9e6852ec8757', 'Apple', 'IPHONE 15 PRO MAX 256GB NATURAL SEMINOVO', '351465642570501', 4200.0, 3950.0, 1, 'seminovo', 'bom', 'vendido', '2026-05-02', '2026-05-02', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-02', '2026-05-02', 'Pagto junto (Aparelho 1/2, total grupo R$ 13,099)');
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('c7660a85-d9f4-4155-bb30-2893365267bb', current_setting('importacao.proximo_numero')::int + 21, current_setting('importacao.cliente_id')::uuid, 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 4200.0, 4200.0, 0.0, '2026-05-02', '2026-05-02', '85e3aa42-b9af-49b8-a72a-64e9c337aa53');
UPDATE aparelhos SET venda_id = 'c7660a85-d9f4-4155-bb30-2893365267bb' WHERE id = 'e81c5171-049b-4e2f-8a2d-9e6852ec8757';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('54e14204-3245-4412-aeb1-952f1e34d14f', 'c7660a85-d9f4-4155-bb30-2893365267bb', 'pix', 3700.0, '2026-05-02', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 1, '2026-05-02T14:00:00');
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, observacao, parcelas, criado_em)
VALUES ('fc360a5a-0f5c-4995-911a-8bb48b0e44f5', 'c7660a85-d9f4-4155-bb30-2893365267bb', 'troca_aparelho', 500.0, '2026-05-02', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'Troca: IPH XR 64GB PRETO', 1, '2026-05-02T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('93b877a6-36d6-436d-9150-ee1f224d872d', 1, 'c7660a85-d9f4-4155-bb30-2893365267bb', 'Brinde', 10.0, '2026-05-02', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-02');

-- LINHA 24 [NAO]: IPHONE 17 PRO MAX 256GB BRANCO NOVO (02/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('6fb29dd0-17b8-4304-8408-7d519d0473a6', 'Apple', 'IPHONE 17 PRO MAX 256GB BRANCO NOVO', '350552896576341', 8899.0, 8300.0, 1, 'novo', 'perfeito', 'vendido', '2026-05-02', '2026-05-02', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-02', '2026-05-02', 'Pagto junto (Aparelho 2/2, total grupo R$ 13,099)');
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('2f7d83a7-ad7b-49a1-a49f-f047cac84e09', current_setting('importacao.proximo_numero')::int + 22, current_setting('importacao.cliente_id')::uuid, 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 8899.0, 8899.0, 0.0, '2026-05-02', '2026-05-02', '85e3aa42-b9af-49b8-a72a-64e9c337aa53');
UPDATE aparelhos SET venda_id = '2f7d83a7-ad7b-49a1-a49f-f047cac84e09' WHERE id = '6fb29dd0-17b8-4304-8408-7d519d0473a6';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('b524c552-11b9-4334-be05-d6b782734f18', '2f7d83a7-ad7b-49a1-a49f-f047cac84e09', 'pix', 6649.0, '2026-05-02', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 1, '2026-05-02T14:00:00');
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, observacao, parcelas, criado_em)
VALUES ('e59b2251-f7d5-4410-b75c-5654b418a86c', '2f7d83a7-ad7b-49a1-a49f-f047cac84e09', 'troca_aparelho', 2250.0, '2026-05-02', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'Troca: IPH 13 PRO MAX 128GB PRETO', 1, '2026-05-02T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('9e063162-10fa-4d94-9119-7f1ef253a48f', 1, '2f7d83a7-ad7b-49a1-a49f-f047cac84e09', 'Brinde', 10.0, '2026-05-02', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-02');

-- LINHA 25 [NAO]: IPHONE 11 64GB PRETO SEMINOVO (03/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('5ad87d80-24e6-4e20-ab90-13c783c76286', 'Apple', 'IPHONE 11 64GB PRETO SEMINOVO', '352923110862460', 800.0, 650.0, 19, 'seminovo', 'bom', 'vendido', '2026-05-03', '2026-05-03', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-03', '2026-05-03', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('85e907e0-ac18-4a01-bee0-c08bb707f144', current_setting('importacao.proximo_numero')::int + 23, current_setting('importacao.cliente_id')::uuid, 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 800.0, 800.0, 0.0, '2026-05-03', '2026-05-03', '97f12885-87ad-426a-8bbb-656889d82e10');
UPDATE aparelhos SET venda_id = '85e907e0-ac18-4a01-bee0-c08bb707f144' WHERE id = '5ad87d80-24e6-4e20-ab90-13c783c76286';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('ad5d54bf-605c-4d3b-aa0b-fd88ff38a5ee', '85e907e0-ac18-4a01-bee0-c08bb707f144', 'pix', 800.0, '2026-05-03', '97f12885-87ad-426a-8bbb-656889d82e10', 1, '2026-05-03T14:00:00');

-- LINHA 26 [NAO]: IPHONE 16 PRO 256GB PRETO SEMINOVO (03/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('8ce952b0-4a01-4447-a819-b353f1c8e6f0', 'Apple', 'IPHONE 16 PRO 256GB PRETO SEMINOVO', '355515607895768', 4700.0, 4450.0, 4, 'seminovo', 'bom', 'vendido', '2026-05-03', '2026-05-03', 'e07d4d35-1381-4d4d-914d-8382a7456fdd', '2026-05-03', '2026-05-03', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('c647a95a-4752-40e2-a247-d0db60f4fe66', current_setting('importacao.proximo_numero')::int + 24, current_setting('importacao.cliente_id')::uuid, 4, 'e07d4d35-1381-4d4d-914d-8382a7456fdd', 'concluida', 'normal', 4700.0, 4700.0, 0.0, '2026-05-03', '2026-05-03', 'e07d4d35-1381-4d4d-914d-8382a7456fdd');
UPDATE aparelhos SET venda_id = 'c647a95a-4752-40e2-a247-d0db60f4fe66' WHERE id = '8ce952b0-4a01-4447-a819-b353f1c8e6f0';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('4be2f064-f1f6-4be7-8310-e084ad28d71b', 'c647a95a-4752-40e2-a247-d0db60f4fe66', 'pix', 4700.0, '2026-05-03', 'e07d4d35-1381-4d4d-914d-8382a7456fdd', 1, '2026-05-03T14:00:00');

-- LINHA 27 [NAO]: IPHONE 11 PRO 256GB BRANCO SEMINOVO (03/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('8b46f947-e00a-4901-bec4-40a7c834bbb8', 'Apple', 'IPHONE 11 PRO 256GB BRANCO SEMINOVO', '352834111876179', 1200.0, 700.0, 4, 'seminovo', 'bom', 'vendido', '2026-05-03', '2026-05-03', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-03', '2026-05-03', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('e9d7ba20-9876-49d9-b51f-69d4f7d9e949', current_setting('importacao.proximo_numero')::int + 25, current_setting('importacao.cliente_id')::uuid, 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 1200.0, 1200.0, 0.0, '2026-05-03', '2026-05-03', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
UPDATE aparelhos SET venda_id = 'e9d7ba20-9876-49d9-b51f-69d4f7d9e949' WHERE id = '8b46f947-e00a-4901-bec4-40a7c834bbb8';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('52d79e14-920a-4ab9-b609-52e6622c2296', 'e9d7ba20-9876-49d9-b51f-69d4f7d9e949', 'pix', 950.0, '2026-05-03', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1, '2026-05-03T14:00:00');
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, observacao, parcelas, criado_em)
VALUES ('8d0efbf4-f6f5-427f-9173-6d1153b4fa5b', 'e9d7ba20-9876-49d9-b51f-69d4f7d9e949', 'troca_aparelho', 250.0, '2026-05-03', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'Troca: IPH XR 64GB', 1, '2026-05-03T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('4966d864-4b18-44a2-a5c1-6e2fd75d567b', 4, 'e9d7ba20-9876-49d9-b51f-69d4f7d9e949', 'Brinde', 25.0, '2026-05-03', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-03');

-- LINHA 28 [NAO]: BOMBOX 4 PRETA NOVO (03/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('d08e499a-0546-4e29-8fcf-256be3c8449c', 'Bombox', 'BOMBOX 4 PRETA NOVO', 'TL1876-JP0086246', 2350.0, 2350.0, 4, 'novo', 'perfeito', 'vendido', '2026-05-03', '2026-05-03', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-03', '2026-05-03', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('bbdb5fde-57db-4556-8781-db03c8318ec4', current_setting('importacao.proximo_numero')::int + 26, current_setting('importacao.cliente_id')::uuid, 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 2350.0, 2350.0, 0.0, '2026-05-03', '2026-05-03', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
UPDATE aparelhos SET venda_id = 'bbdb5fde-57db-4556-8781-db03c8318ec4' WHERE id = 'd08e499a-0546-4e29-8fcf-256be3c8449c';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('92427bd7-9807-40be-a5c9-dba1b24cd726', 'bbdb5fde-57db-4556-8781-db03c8318ec4', 'pix', 2350.0, '2026-05-03', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1, '2026-05-03T14:00:00');

-- LINHA 29 [NAO]: IPHONE 14 PRO 256GB SEMINOVO (03/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('b766e088-7fde-4f56-b931-1d1a7d4f40d8', 'Apple', 'IPHONE 14 PRO 256GB SEMINOVO', '354542503453857', 3200.0, 2950.0, 4, 'seminovo', 'bom', 'vendido', '2026-05-03', '2026-05-03', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-03', '2026-05-03', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('1c82dedd-fc29-40c6-bab6-50f7daccf362', current_setting('importacao.proximo_numero')::int + 27, current_setting('importacao.cliente_id')::uuid, 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 3200.0, 3200.0, 0.0, '2026-05-03', '2026-05-03', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
UPDATE aparelhos SET venda_id = '1c82dedd-fc29-40c6-bab6-50f7daccf362' WHERE id = 'b766e088-7fde-4f56-b931-1d1a7d4f40d8';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('8cc54740-01d7-464d-95e9-b60ce3c594c0', '1c82dedd-fc29-40c6-bab6-50f7daccf362', 'pix', 1000.0, '2026-05-03', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1, '2026-05-03T14:00:00');
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('9abe7c8d-427e-407a-9893-c0ba6b3f0e32', '1c82dedd-fc29-40c6-bab6-50f7daccf362', 'cartao_credito', 2200.0, '2026-05-03', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1, '2026-05-03T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('be7f51ba-abbe-491b-a1cb-dc2ae86077cf', 4, '1c82dedd-fc29-40c6-bab6-50f7daccf362', 'Brinde', 25.0, '2026-05-03', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-03');

-- LINHA 30 [NAO]: IPHONE 15 PRO MAX 256Gb SEMINOVO (03/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('61cb0663-bd96-4a57-a419-85449d8527e5', 'Apple', 'IPHONE 15 PRO MAX 256Gb SEMINOVO', '351306992348280', 4300.0, 3950.0, 4, 'seminovo', 'bom', 'vendido', '2026-05-03', '2026-05-03', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-03', '2026-05-03', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('6b92c2c9-71b7-4d84-aacd-2e7c06e2bfc7', current_setting('importacao.proximo_numero')::int + 28, current_setting('importacao.cliente_id')::uuid, 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 4300.0, 4300.0, 0.0, '2026-05-03', '2026-05-03', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
UPDATE aparelhos SET venda_id = '6b92c2c9-71b7-4d84-aacd-2e7c06e2bfc7' WHERE id = '61cb0663-bd96-4a57-a419-85449d8527e5';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('bc612ee6-61d5-43df-89ae-faac243577d6', '6b92c2c9-71b7-4d84-aacd-2e7c06e2bfc7', 'pix', 4300.0, '2026-05-03', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1, '2026-05-03T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('d036d80c-a4e8-4701-b070-3c199be7df5d', 4, '6b92c2c9-71b7-4d84-aacd-2e7c06e2bfc7', 'Brinde', 25.0, '2026-05-03', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-03');

-- LINHA 31 [NAO]: IPAD 11 128GB AMARELO NOVO (03/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('3e072519-97c8-4911-b9f1-5c842fc0e600', 'Apple', 'IPAD 11 128GB AMARELO NOVO', 'D26WC4VMQP', 2715.0, 2140.0, 4, 'novo', 'perfeito', 'vendido', '2026-05-03', '2026-05-03', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-03', '2026-05-03', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('350214a3-038a-4160-bb97-164b09280e18', current_setting('importacao.proximo_numero')::int + 29, current_setting('importacao.cliente_id')::uuid, 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 2715.0, 2715.0, 0.0, '2026-05-03', '2026-05-03', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
UPDATE aparelhos SET venda_id = '350214a3-038a-4160-bb97-164b09280e18' WHERE id = '3e072519-97c8-4911-b9f1-5c842fc0e600';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('e06d0366-efe6-4a52-8059-e0cfcdc0deb2', '350214a3-038a-4160-bb97-164b09280e18', 'pix', 1315.0, '2026-05-03', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1, '2026-05-03T14:00:00');
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('c09aa416-bda2-4f04-ba0b-80651efcc6fa', '350214a3-038a-4160-bb97-164b09280e18', 'dinheiro', 1400.0, '2026-05-03', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1, '2026-05-03T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('af8404c2-a6ef-4bff-b894-820b519a91fb', 4, '350214a3-038a-4160-bb97-164b09280e18', 'Brinde', 150.0, '2026-05-03', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-03');

-- LINHA 32 [NAO]: IPHONE 14 PRO 128GB ROXO SEMINOVO (03/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('78bac059-0c3e-423e-8253-d76380c3d505', 'Apple', 'IPHONE 14 PRO 128GB ROXO SEMINOVO', '357712761232320', 3000.0, 2700.0, 19, 'seminovo', 'bom', 'vendido', '2026-05-03', '2026-05-03', 'b4269e60-eea2-4eba-a34d-db9591e0ec83', '2026-05-03', '2026-05-03', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('adad8850-834f-4db2-9db8-b595c03424df', current_setting('importacao.proximo_numero')::int + 30, current_setting('importacao.cliente_id')::uuid, 19, 'b4269e60-eea2-4eba-a34d-db9591e0ec83', 'concluida', 'normal', 3000.0, 3000.0, 0.0, '2026-05-03', '2026-05-03', 'b4269e60-eea2-4eba-a34d-db9591e0ec83');
UPDATE aparelhos SET venda_id = 'adad8850-834f-4db2-9db8-b595c03424df' WHERE id = '78bac059-0c3e-423e-8253-d76380c3d505';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('7abd5d74-ae3a-4d61-964a-5d8e52e484c5', 'adad8850-834f-4db2-9db8-b595c03424df', 'cartao_credito', 3000.0, '2026-05-03', 'b4269e60-eea2-4eba-a34d-db9591e0ec83', 1, '2026-05-03T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('98e83789-2ebc-4cae-9fd3-87e9c516bc02', 19, 'adad8850-834f-4db2-9db8-b595c03424df', 'Brinde', 25.0, '2026-05-03', 'b4269e60-eea2-4eba-a34d-db9591e0ec83', '2026-05-03');

-- LINHA 33 [NAO]: IPHONE 17 PRO MAX 512GB AZUL LACRADO (03/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('22ad6543-6237-4807-921b-b2c60ed2606f', 'Apple', 'IPHONE 17 PRO MAX 512GB AZUL LACRADO', '350552898007873', 9280.0, 9050.0, 1, 'novo', 'perfeito', 'vendido', '2026-05-03', '2026-05-03', '9451cd9f-6770-4e32-aae8-c75fa675e818', '2026-05-03', '2026-05-03', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('4ee165a9-3ffb-4764-81f0-f9f7e1ddc74f', current_setting('importacao.proximo_numero')::int + 31, current_setting('importacao.cliente_id')::uuid, 1, '9451cd9f-6770-4e32-aae8-c75fa675e818', 'concluida', 'normal', 9280.0, 9280.0, 0.0, '2026-05-03', '2026-05-03', '9451cd9f-6770-4e32-aae8-c75fa675e818');
UPDATE aparelhos SET venda_id = '4ee165a9-3ffb-4764-81f0-f9f7e1ddc74f' WHERE id = '22ad6543-6237-4807-921b-b2c60ed2606f';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('bd68633a-5d44-46cf-aa00-7819d50cbb09', '4ee165a9-3ffb-4764-81f0-f9f7e1ddc74f', 'pix', 9280.0, '2026-05-03', '9451cd9f-6770-4e32-aae8-c75fa675e818', 1, '2026-05-03T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('e5223082-ea91-4cf5-9080-5fb7499fbbf3', 1, '4ee165a9-3ffb-4764-81f0-f9f7e1ddc74f', 'Brinde', 30.0, '2026-05-03', '9451cd9f-6770-4e32-aae8-c75fa675e818', '2026-05-03');

-- LINHA 34 [SIM]: IPHONE 14 PRO MAX 256GB ROXO SEMINOVO (03/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('be1d71e2-1175-419e-a15a-ef409c3ff339', 'Apple', 'IPHONE 14 PRO MAX 256GB ROXO SEMINOVO', '356684163986301', 3521.0, 3200.0, 20, 'seminovo', 'bom', 'vendido', '2026-05-03', '2026-05-03', '25e2da5b-9e76-4388-9890-7e22efd6940d', '2026-05-03', '2026-05-03', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('7ec1a692-091a-4674-b2b1-51a52d02dc1f', current_setting('importacao.proximo_numero')::int + 32, current_setting('importacao.cliente_id')::uuid, 20, '25e2da5b-9e76-4388-9890-7e22efd6940d', 'concluida', 'normal', 3521.0, 3521.0, 0.0, '2026-05-03', '2026-05-03', '25e2da5b-9e76-4388-9890-7e22efd6940d');
UPDATE aparelhos SET venda_id = '7ec1a692-091a-4674-b2b1-51a52d02dc1f' WHERE id = 'be1d71e2-1175-419e-a15a-ef409c3ff339';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('2d2bdee2-15fc-453d-996f-ab534bea051e', '7ec1a692-091a-4674-b2b1-51a52d02dc1f', 'pix', 3521.0, '2026-05-03', '25e2da5b-9e76-4388-9890-7e22efd6940d', 1, '2026-05-03T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('fe941ea3-44f8-49dd-85fc-8c8837dabd0b', 20, '7ec1a692-091a-4674-b2b1-51a52d02dc1f', 'Brinde', 25.0, '2026-05-03', '25e2da5b-9e76-4388-9890-7e22efd6940d', '2026-05-03');

-- LINHA 35 [NAO]: IPHONE 14 128GB AZUL SEMINOVO (03/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('500ad23f-2124-4f53-9aa2-48b24903c451', 'Apple', 'IPHONE 14 128GB AZUL SEMINOVO', '358264144532215', 2200.0, 2050.0, 20, 'seminovo', 'bom', 'vendido', '2026-05-03', '2026-05-03', '25e2da5b-9e76-4388-9890-7e22efd6940d', '2026-05-03', '2026-05-03', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('902a07ea-d046-41c4-8fde-5a69edcbb574', current_setting('importacao.proximo_numero')::int + 33, current_setting('importacao.cliente_id')::uuid, 20, '25e2da5b-9e76-4388-9890-7e22efd6940d', 'concluida', 'normal', 2200.0, 2200.0, 0.0, '2026-05-03', '2026-05-03', '25e2da5b-9e76-4388-9890-7e22efd6940d');
UPDATE aparelhos SET venda_id = '902a07ea-d046-41c4-8fde-5a69edcbb574' WHERE id = '500ad23f-2124-4f53-9aa2-48b24903c451';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('d5ea3f24-2fd6-42a2-846e-db8cf21c4711', '902a07ea-d046-41c4-8fde-5a69edcbb574', 'cartao_credito', 2200.0, '2026-05-03', '25e2da5b-9e76-4388-9890-7e22efd6940d', 1, '2026-05-03T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('07996a9b-f72a-4778-9688-fda227df8c23', 20, '902a07ea-d046-41c4-8fde-5a69edcbb574', 'Brinde', 25.0, '2026-05-03', '25e2da5b-9e76-4388-9890-7e22efd6940d', '2026-05-03');

-- LINHA 36 [NAO]: IPHONE 14 PRO MAX 256GB ROXO SEMINOVO (03/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('b12db1ab-4d68-4b99-aa04-51d7583bf995', 'Apple', 'IPHONE 14 PRO MAX 256GB ROXO SEMINOVO', '353742532615895', 3550.0, 3200.0, 19, 'seminovo', 'bom', 'vendido', '2026-05-03', '2026-05-03', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-03', '2026-05-03', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('faab3fed-d177-4317-a015-df9db21c69bd', current_setting('importacao.proximo_numero')::int + 34, current_setting('importacao.cliente_id')::uuid, 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 3550.0, 3550.0, 0.0, '2026-05-03', '2026-05-03', '97f12885-87ad-426a-8bbb-656889d82e10');
UPDATE aparelhos SET venda_id = 'faab3fed-d177-4317-a015-df9db21c69bd' WHERE id = 'b12db1ab-4d68-4b99-aa04-51d7583bf995';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('2fbb2529-e7d8-460f-8538-48038a4fd7d6', 'faab3fed-d177-4317-a015-df9db21c69bd', 'pix', 3550.0, '2026-05-03', '97f12885-87ad-426a-8bbb-656889d82e10', 1, '2026-05-03T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('aa660d00-c93e-4647-940f-fe2ac0f65574', 19, 'faab3fed-d177-4317-a015-df9db21c69bd', 'Brinde', 25.0, '2026-05-03', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-03');

-- LINHA 37 [NAO]: SAMSUNG TAB S10 FE 128GB CINZA NOVO (03/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('33e907f7-d73e-4a04-b499-21d9a1ff4a63', 'Samsung', 'SAMSUNG TAB S10 FE 128GB CINZA NOVO', 'R5GL343H0BP', 2582.0, 2350.0, 19, 'novo', 'perfeito', 'vendido', '2026-05-03', '2026-05-03', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-03', '2026-05-03', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('71196f38-8dec-4bc6-a8e4-c3472084c843', current_setting('importacao.proximo_numero')::int + 35, current_setting('importacao.cliente_id')::uuid, 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 2582.0, 2582.0, 0.0, '2026-05-03', '2026-05-03', '97f12885-87ad-426a-8bbb-656889d82e10');
UPDATE aparelhos SET venda_id = '71196f38-8dec-4bc6-a8e4-c3472084c843' WHERE id = '33e907f7-d73e-4a04-b499-21d9a1ff4a63';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('9baaa94d-d3c6-4973-9516-b3b5304254cd', '71196f38-8dec-4bc6-a8e4-c3472084c843', 'pix', 2400.0, '2026-05-03', '97f12885-87ad-426a-8bbb-656889d82e10', 1, '2026-05-03T14:00:00');
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('8d4370d0-2df7-4e7b-b176-9c2fc3469700', '71196f38-8dec-4bc6-a8e4-c3472084c843', 'cartao_credito', 182.0, '2026-05-03', '97f12885-87ad-426a-8bbb-656889d82e10', 1, '2026-05-03T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('ad11be01-0941-471a-88c3-39257f07d5b4', 19, '71196f38-8dec-4bc6-a8e4-c3472084c843', 'Brinde', 95.0, '2026-05-03', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-03');

-- LINHA 38 [NAO]: IPHONE 14 128GB LILAS SEMINOVO (03/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('a78e40d2-0842-4f36-9a4c-f0f9f0408a80', 'Apple', 'IPHONE 14 128GB LILAS SEMINOVO', '354807376249710', 2190.0, 2050.0, 1, 'seminovo', 'bom', 'vendido', '2026-05-03', '2026-05-03', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-03', '2026-05-03', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('ecf427d4-1e0a-49ff-8a04-7999ebf62fe1', current_setting('importacao.proximo_numero')::int + 36, current_setting('importacao.cliente_id')::uuid, 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 2190.0, 2190.0, 0.0, '2026-05-03', '2026-05-03', '85e3aa42-b9af-49b8-a72a-64e9c337aa53');
UPDATE aparelhos SET venda_id = 'ecf427d4-1e0a-49ff-8a04-7999ebf62fe1' WHERE id = 'a78e40d2-0842-4f36-9a4c-f0f9f0408a80';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('b87e41ba-648a-45e5-8810-cbdb643ccc50', 'ecf427d4-1e0a-49ff-8a04-7999ebf62fe1', 'dinheiro', 2190.0, '2026-05-03', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 1, '2026-05-03T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('c31c25c0-5a30-47ca-ae9b-7f3b23402ad8', 1, 'ecf427d4-1e0a-49ff-8a04-7999ebf62fe1', 'Brinde', 25.0, '2026-05-03', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-03');

-- LINHA 39 [NAO]: IPHONE 13 PRO MAX 256G BRANCO SEMINOVO (03/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('df8b988a-9562-427e-ad43-57e89eafece1', 'Apple', 'IPHONE 13 PRO MAX 256G BRANCO SEMINOVO', '351596247157557', 3287.0, 2950.0, 1, 'seminovo', 'bom', 'vendido', '2026-05-03', '2026-05-03', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-03', '2026-05-03', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('386ca5cd-f021-4a4c-8984-5a0815f23754', current_setting('importacao.proximo_numero')::int + 37, current_setting('importacao.cliente_id')::uuid, 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 3287.0, 3287.0, 0.0, '2026-05-03', '2026-05-03', '85e3aa42-b9af-49b8-a72a-64e9c337aa53');
UPDATE aparelhos SET venda_id = '386ca5cd-f021-4a4c-8984-5a0815f23754' WHERE id = 'df8b988a-9562-427e-ad43-57e89eafece1';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('0481b47f-7a46-4b85-851b-2343b33228e9', '386ca5cd-f021-4a4c-8984-5a0815f23754', 'pix', 2687.0, '2026-05-03', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 1, '2026-05-03T14:00:00');
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, observacao, parcelas, criado_em)
VALUES ('205839c2-93a0-4a5f-ac52-d4b554f355ee', '386ca5cd-f021-4a4c-8984-5a0815f23754', 'troca_aparelho', 600.0, '2026-05-03', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'Troca: IPHONE 11 64GB VERDE', 1, '2026-05-03T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('eec44cce-1bfa-4190-a133-7539f81dd4f3', 1, '386ca5cd-f021-4a4c-8984-5a0815f23754', 'Brinde', 25.0, '2026-05-03', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-03');

-- LINHA 40 [NAO]: IPHONE 17 256GB PRETO LACRADO (05/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('97538ba1-78aa-464f-bdb8-22511f469461', 'Apple', 'IPHONE 17 256GB PRETO LACRADO', '351807178569383', 5530.0, 4950.0, 1, 'novo', 'perfeito', 'vendido', '2026-05-05', '2026-05-05', '9451cd9f-6770-4e32-aae8-c75fa675e818', '2026-05-05', '2026-05-05', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('7850758c-a082-44ae-8dd4-3ed186cfcd0d', current_setting('importacao.proximo_numero')::int + 38, current_setting('importacao.cliente_id')::uuid, 1, '9451cd9f-6770-4e32-aae8-c75fa675e818', 'concluida', 'normal', 5530.0, 5530.0, 0.0, '2026-05-05', '2026-05-05', '9451cd9f-6770-4e32-aae8-c75fa675e818');
UPDATE aparelhos SET venda_id = '7850758c-a082-44ae-8dd4-3ed186cfcd0d' WHERE id = '97538ba1-78aa-464f-bdb8-22511f469461';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('f8f03f1a-876b-415e-93b4-af9cef55f8c5', '7850758c-a082-44ae-8dd4-3ed186cfcd0d', 'pix', 5530.0, '2026-05-05', '9451cd9f-6770-4e32-aae8-c75fa675e818', 1, '2026-05-05T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('74c987d4-fb1a-4d95-a32b-0c4d16c946b2', 1, '7850758c-a082-44ae-8dd4-3ed186cfcd0d', 'Brinde', 25.0, '2026-05-05', '9451cd9f-6770-4e32-aae8-c75fa675e818', '2026-05-05');

-- LINHA 41 [NAO]: IPHONE 14 256GB PRETO SEMINOVO (05/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('61b271a9-3887-4625-a9f4-3944da1a1296', 'Apple', 'IPHONE 14 256GB PRETO SEMINOVO', '353267568818502', 2450.0, 2150.0, 1, 'seminovo', 'bom', 'vendido', '2026-05-05', '2026-05-05', '9451cd9f-6770-4e32-aae8-c75fa675e818', '2026-05-05', '2026-05-05', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('dff19f68-ba3c-471f-9430-390051de89ea', current_setting('importacao.proximo_numero')::int + 39, current_setting('importacao.cliente_id')::uuid, 1, '9451cd9f-6770-4e32-aae8-c75fa675e818', 'concluida', 'normal', 2450.0, 2450.0, 0.0, '2026-05-05', '2026-05-05', '9451cd9f-6770-4e32-aae8-c75fa675e818');
UPDATE aparelhos SET venda_id = 'dff19f68-ba3c-471f-9430-390051de89ea' WHERE id = '61b271a9-3887-4625-a9f4-3944da1a1296';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('c94899dc-0f7d-4c65-a5d0-990d6f1b564b', 'dff19f68-ba3c-471f-9430-390051de89ea', 'pix', 2450.0, '2026-05-05', '9451cd9f-6770-4e32-aae8-c75fa675e818', 1, '2026-05-05T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('259d955c-1b5d-420d-b5d8-07d5b4d97f8c', 1, 'dff19f68-ba3c-471f-9430-390051de89ea', 'Brinde', 18.0, '2026-05-05', '9451cd9f-6770-4e32-aae8-c75fa675e818', '2026-05-05');

-- LINHA 42 [NAO]: IPHONE 17 PRO MAX 256GB SILVER NOVO (05/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('860abe36-3cce-42a4-a936-ff5f4eba0c12', 'Apple', 'IPHONE 17 PRO MAX 256GB SILVER NOVO', '357247252989922', 8500.0, 8300.0, 19, 'novo', 'perfeito', 'vendido', '2026-05-05', '2026-05-05', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-05', '2026-05-05', 'Pagto junto (Aparelho 1/2, total grupo R$ 16,800)');
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('2ef41d99-d223-42f0-b9bf-9f5f2698787a', current_setting('importacao.proximo_numero')::int + 40, current_setting('importacao.cliente_id')::uuid, 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 8500.0, 8500.0, 0.0, '2026-05-05', '2026-05-05', '97f12885-87ad-426a-8bbb-656889d82e10');
UPDATE aparelhos SET venda_id = '2ef41d99-d223-42f0-b9bf-9f5f2698787a' WHERE id = '860abe36-3cce-42a4-a936-ff5f4eba0c12';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('6a33d62e-5358-4fd6-8f33-704ee4c0f8d2', '2ef41d99-d223-42f0-b9bf-9f5f2698787a', 'pix', 4500.0, '2026-05-05', '97f12885-87ad-426a-8bbb-656889d82e10', 1, '2026-05-05T14:00:00');
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, observacao, parcelas, criado_em)
VALUES ('8bd3b863-1570-4b4d-a11b-6797ad568577', '2ef41d99-d223-42f0-b9bf-9f5f2698787a', 'troca_aparelho', 4000.0, '2026-05-05', '97f12885-87ad-426a-8bbb-656889d82e10', 'Troca: IPHONE 15 PRO MAX 256GB PRETO', 1, '2026-05-05T14:00:00');

-- LINHA 43 [NAO]: IPHONE 17 PRO MAX 256GB AZUL NOVO (05/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('cfaf8a54-da77-48a5-a37c-2762d362d253', 'Apple', 'IPHONE 17 PRO MAX 256GB AZUL NOVO', '357205981616604', 8300.0, 8100.0, 19, 'novo', 'perfeito', 'vendido', '2026-05-05', '2026-05-05', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-05', '2026-05-05', 'Pagto junto (Aparelho 2/2, total grupo R$ 16,800)');
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('ef4dd359-3a1c-48eb-8996-38071778428b', current_setting('importacao.proximo_numero')::int + 41, current_setting('importacao.cliente_id')::uuid, 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 8300.0, 8300.0, 0.0, '2026-05-05', '2026-05-05', '97f12885-87ad-426a-8bbb-656889d82e10');
UPDATE aparelhos SET venda_id = 'ef4dd359-3a1c-48eb-8996-38071778428b' WHERE id = 'cfaf8a54-da77-48a5-a37c-2762d362d253';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('0b237123-cfd2-408e-bacb-445104d82340', 'ef4dd359-3a1c-48eb-8996-38071778428b', 'pix', 8300.0, '2026-05-05', '97f12885-87ad-426a-8bbb-656889d82e10', 1, '2026-05-05T14:00:00');

-- LINHA 44 [NAO]: NOTE 15 PRO 5G 256GB AZUL NOVO (05/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('c7b13eee-8ed2-404d-831e-e26550e1edb3', 'Redmi', 'NOTE 15 PRO 5G 256GB AZUL NOVO', '860548074484947', 1950.0, 1690.0, 19, 'novo', 'perfeito', 'vendido', '2026-05-05', '2026-05-05', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-05', '2026-05-05', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('f2d8bec2-483f-4171-9b42-201955e6739a', current_setting('importacao.proximo_numero')::int + 42, current_setting('importacao.cliente_id')::uuid, 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 1950.0, 1950.0, 0.0, '2026-05-05', '2026-05-05', '97f12885-87ad-426a-8bbb-656889d82e10');
UPDATE aparelhos SET venda_id = 'f2d8bec2-483f-4171-9b42-201955e6739a' WHERE id = 'c7b13eee-8ed2-404d-831e-e26550e1edb3';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('7d70460f-e736-4345-8d09-bc9a539cb977', 'f2d8bec2-483f-4171-9b42-201955e6739a', 'pix', 1950.0, '2026-05-05', '97f12885-87ad-426a-8bbb-656889d82e10', 1, '2026-05-05T14:00:00');

-- LINHA 45 [NAO]: REALME C75 5G PRETO 256GB NOVO (05/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('baa500b3-896c-426e-bc0b-ba4b21a8d72d', 'Realme', 'REALME C75 5G PRETO 256GB NOVO', '862813070179174', 1340.0, 1240.0, 19, 'novo', 'perfeito', 'vendido', '2026-05-05', '2026-05-05', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-05', '2026-05-05', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('c9051e01-f589-4322-abac-955dcfc928a7', current_setting('importacao.proximo_numero')::int + 43, current_setting('importacao.cliente_id')::uuid, 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 1340.0, 1340.0, 0.0, '2026-05-05', '2026-05-05', '97f12885-87ad-426a-8bbb-656889d82e10');
UPDATE aparelhos SET venda_id = 'c9051e01-f589-4322-abac-955dcfc928a7' WHERE id = 'baa500b3-896c-426e-bc0b-ba4b21a8d72d';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('aaed1457-b748-4bd9-ae1a-b5c66f744588', 'c9051e01-f589-4322-abac-955dcfc928a7', 'cartao_credito', 1340.0, '2026-05-05', '97f12885-87ad-426a-8bbb-656889d82e10', 1, '2026-05-05T14:00:00');

-- LINHA 46 [NAO]: IPHONE 13 128GB PRETO SEMINOVO (05/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('d0414c3d-f282-4812-9f38-db99377d273f', 'Apple', 'IPHONE 13 128GB PRETO SEMINOVO', '351264787086047', 2025.0, 1800.0, 19, 'seminovo', 'bom', 'vendido', '2026-05-05', '2026-05-05', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-05', '2026-05-05', 'Pagto junto (Aparelho 1/2, total grupo R$ 4,050)');
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('e81d9da7-0f2f-49c3-a99a-a8332db8a430', current_setting('importacao.proximo_numero')::int + 44, current_setting('importacao.cliente_id')::uuid, 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 2025.0, 2025.0, 0.0, '2026-05-05', '2026-05-05', '97f12885-87ad-426a-8bbb-656889d82e10');
UPDATE aparelhos SET venda_id = 'e81d9da7-0f2f-49c3-a99a-a8332db8a430' WHERE id = 'd0414c3d-f282-4812-9f38-db99377d273f';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('dc39b678-ce70-41d5-b834-17624a425a51', 'e81d9da7-0f2f-49c3-a99a-a8332db8a430', 'cartao_credito', 2025.0, '2026-05-05', '97f12885-87ad-426a-8bbb-656889d82e10', 1, '2026-05-05T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('94d77702-3aa1-4e75-a410-b76627ed2c66', 19, 'e81d9da7-0f2f-49c3-a99a-a8332db8a430', 'Brinde', 25.0, '2026-05-05', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-05');

-- LINHA 47 [NAO]: IPHONE 13 128GB BRANCO SEMINOVO (05/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('89e9680b-32bf-41db-92b5-8cd8b967619a', 'Apple', 'IPHONE 13 128GB BRANCO SEMINOVO', '351520705483289', 2025.0, 1800.0, 19, 'seminovo', 'bom', 'vendido', '2026-05-05', '2026-05-05', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-05', '2026-05-05', 'Pagto junto (Aparelho 2/2, total grupo R$ 4,050)');
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('a50b9070-e341-4194-8109-215cf9aac454', current_setting('importacao.proximo_numero')::int + 45, current_setting('importacao.cliente_id')::uuid, 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 2025.0, 2025.0, 0.0, '2026-05-05', '2026-05-05', '97f12885-87ad-426a-8bbb-656889d82e10');
UPDATE aparelhos SET venda_id = 'a50b9070-e341-4194-8109-215cf9aac454' WHERE id = '89e9680b-32bf-41db-92b5-8cd8b967619a';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('03af148b-019a-4fc6-bc02-571b4e591bad', 'a50b9070-e341-4194-8109-215cf9aac454', 'cartao_credito', 2025.0, '2026-05-05', '97f12885-87ad-426a-8bbb-656889d82e10', 1, '2026-05-05T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('53488c6f-b7aa-439b-845c-f5371de92426', 19, 'a50b9070-e341-4194-8109-215cf9aac454', 'Brinde', 25.0, '2026-05-05', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-05');

-- LINHA 48 [NAO]: IPHONE 14 PLUS 128GB PRETO SEMINOVO (05/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('9c695b9a-6ac8-4208-a6f4-2c374bd71874', 'Apple', 'IPHONE 14 PLUS 128GB PRETO SEMINOVO', '359069332647611', 2593.0, 2300.0, 1, 'seminovo', 'bom', 'vendido', '2026-05-05', '2026-05-05', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-05', '2026-05-05', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('6781d6f6-30a6-48bf-bff5-8c0b7b176efd', current_setting('importacao.proximo_numero')::int + 46, current_setting('importacao.cliente_id')::uuid, 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 2593.0, 2593.0, 0.0, '2026-05-05', '2026-05-05', '85e3aa42-b9af-49b8-a72a-64e9c337aa53');
UPDATE aparelhos SET venda_id = '6781d6f6-30a6-48bf-bff5-8c0b7b176efd' WHERE id = '9c695b9a-6ac8-4208-a6f4-2c374bd71874';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('b66f1638-90bc-4f12-93ea-2050e4dcae39', '6781d6f6-30a6-48bf-bff5-8c0b7b176efd', 'pix', 2593.0, '2026-05-05', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 1, '2026-05-05T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('593c73d1-a2a5-41b3-8839-578a55751110', 1, '6781d6f6-30a6-48bf-bff5-8c0b7b176efd', 'Brinde', 25.0, '2026-05-05', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-05');

-- LINHA 49 [NAO]: IPHONE 13 PRO 256GB GRAFIT SEMINOVO (05/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('327dbdb5-aeb3-4216-9656-4e77291fb2ec', 'Apple', 'IPHONE 13 PRO 256GB GRAFIT SEMINOVO', '350367272380303', 2750.0, 2500.0, 1, 'seminovo', 'bom', 'vendido', '2026-05-05', '2026-05-05', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-05', '2026-05-05', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('acadb071-7ef7-4b32-99b8-8932cc67580e', current_setting('importacao.proximo_numero')::int + 47, current_setting('importacao.cliente_id')::uuid, 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 2750.0, 2750.0, 0.0, '2026-05-05', '2026-05-05', '85e3aa42-b9af-49b8-a72a-64e9c337aa53');
UPDATE aparelhos SET venda_id = 'acadb071-7ef7-4b32-99b8-8932cc67580e' WHERE id = '327dbdb5-aeb3-4216-9656-4e77291fb2ec';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('58a3f757-3aea-4563-ab68-1065cdfdd3ec', 'acadb071-7ef7-4b32-99b8-8932cc67580e', 'pix', 2750.0, '2026-05-05', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 1, '2026-05-05T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('36af8046-c995-46fb-948c-29d6a4dcadba', 1, 'acadb071-7ef7-4b32-99b8-8932cc67580e', 'Brinde', 25.0, '2026-05-05', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-05');

-- LINHA 50 [NAO]: IPHONE 15 128GB ROSA SEMINOVO (05/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('ae942eeb-ed27-4aec-ad91-e59e64157021', 'Apple', 'IPHONE 15 128GB ROSA SEMINOVO', '357395865324357', 2900.0, 2750.0, 4, 'seminovo', 'bom', 'vendido', '2026-05-05', '2026-05-05', 'e07d4d35-1381-4d4d-914d-8382a7456fdd', '2026-05-05', '2026-05-05', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('3eaf6a6c-9bd5-43a9-96f6-d7b9e9991f37', current_setting('importacao.proximo_numero')::int + 48, current_setting('importacao.cliente_id')::uuid, 4, 'e07d4d35-1381-4d4d-914d-8382a7456fdd', 'concluida', 'normal', 2900.0, 2900.0, 0.0, '2026-05-05', '2026-05-05', 'e07d4d35-1381-4d4d-914d-8382a7456fdd');
UPDATE aparelhos SET venda_id = '3eaf6a6c-9bd5-43a9-96f6-d7b9e9991f37' WHERE id = 'ae942eeb-ed27-4aec-ad91-e59e64157021';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('0c50a17c-f128-4e8b-a9a8-2203e9c4cb5e', '3eaf6a6c-9bd5-43a9-96f6-d7b9e9991f37', 'cartao_debito', 1200.0, '2026-05-05', 'e07d4d35-1381-4d4d-914d-8382a7456fdd', 1, '2026-05-05T14:00:00');
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, observacao, parcelas, criado_em)
VALUES ('458db024-38f6-4e83-84f6-c4191623dd53', '3eaf6a6c-9bd5-43a9-96f6-d7b9e9991f37', 'troca_aparelho', 1700.0, '2026-05-05', 'e07d4d35-1381-4d4d-914d-8382a7456fdd', 'Troca: IPHONE 13 128GB ROSA', 1, '2026-05-05T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('6681493c-535e-43ac-929a-826c518fb0e6', 4, '3eaf6a6c-9bd5-43a9-96f6-d7b9e9991f37', 'Brinde', 25.0, '2026-05-05', 'e07d4d35-1381-4d4d-914d-8382a7456fdd', '2026-05-05');

-- LINHA 51 [NAO]: REDMI NOTE 15 5G 256GB PRETO NOVO (05/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('87e1e45a-823b-43e8-bd63-8d932e34218e', 'Xiaomi', 'REDMI NOTE 15 5G 256GB PRETO NOVO', '865292088798209', 1500.0, 1370.0, 4, 'novo', 'perfeito', 'vendido', '2026-05-05', '2026-05-05', 'e07d4d35-1381-4d4d-914d-8382a7456fdd', '2026-05-05', '2026-05-05', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('7d3b4c18-b5f8-42d4-8e85-9540c38b7899', current_setting('importacao.proximo_numero')::int + 49, current_setting('importacao.cliente_id')::uuid, 4, 'e07d4d35-1381-4d4d-914d-8382a7456fdd', 'concluida', 'normal', 1500.0, 1500.0, 0.0, '2026-05-05', '2026-05-05', 'e07d4d35-1381-4d4d-914d-8382a7456fdd');
UPDATE aparelhos SET venda_id = '7d3b4c18-b5f8-42d4-8e85-9540c38b7899' WHERE id = '87e1e45a-823b-43e8-bd63-8d932e34218e';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('8754411a-084a-4335-9de1-a4108be77f40', '7d3b4c18-b5f8-42d4-8e85-9540c38b7899', 'dinheiro', 400.0, '2026-05-05', 'e07d4d35-1381-4d4d-914d-8382a7456fdd', 1, '2026-05-05T14:00:00');
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('ec4bc465-40e1-41d3-bf34-acb104d138e5', '7d3b4c18-b5f8-42d4-8e85-9540c38b7899', 'cartao_credito', 1100.0, '2026-05-05', 'e07d4d35-1381-4d4d-914d-8382a7456fdd', 1, '2026-05-05T14:00:00');

-- LINHA 52 [SIM]: IPHONE 17 PRO 256GB BRANCO SEMINOVO (05/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('9088b2e7-2a04-462d-acc1-1dd2620bd20f', 'Apple', 'IPHONE 17 PRO 256GB BRANCO SEMINOVO', NULL, 6880.0, 6350.0, 1, 'seminovo', 'bom', 'vendido', '2026-05-05', '2026-05-05', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-05', '2026-05-05', 'Sem IMEI');
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('2f20aee2-3769-4573-a870-4bd2e3a92142', current_setting('importacao.proximo_numero')::int + 50, current_setting('importacao.cliente_id')::uuid, 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 6880.0, 6880.0, 0.0, '2026-05-05', '2026-05-05', '85e3aa42-b9af-49b8-a72a-64e9c337aa53');
UPDATE aparelhos SET venda_id = '2f20aee2-3769-4573-a870-4bd2e3a92142' WHERE id = '9088b2e7-2a04-462d-acc1-1dd2620bd20f';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('cea50202-4bfa-45e9-b0b3-c6509ffc7339', '2f20aee2-3769-4573-a870-4bd2e3a92142', 'pix', 6880.0, '2026-05-05', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 1, '2026-05-05T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('0148fd5d-9c3d-4827-83fa-7baf3b5320ff', 1, '2f20aee2-3769-4573-a870-4bd2e3a92142', 'Brinde', 25.0, '2026-05-05', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-05');

-- LINHA 53 [NAO]: IPAD 11 128GB 128GB SILVER NOVO (06/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('1a8aa959-8ea3-4fa4-80f9-af9182e5f456', 'Apple', 'IPAD 11 128GB 128GB SILVER NOVO', 'G79XRVF52R', 2320.0, 2180.0, 4, 'novo', 'perfeito', 'vendido', '2026-05-06', '2026-05-06', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-06', '2026-05-06', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('d8d4e3c2-026c-4bb8-8b3c-d80ebd317bcf', current_setting('importacao.proximo_numero')::int + 51, current_setting('importacao.cliente_id')::uuid, 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 2320.0, 2320.0, 0.0, '2026-05-06', '2026-05-06', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
UPDATE aparelhos SET venda_id = 'd8d4e3c2-026c-4bb8-8b3c-d80ebd317bcf' WHERE id = '1a8aa959-8ea3-4fa4-80f9-af9182e5f456';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('c94bfcdd-7eb7-48be-be97-580701ca5115', 'd8d4e3c2-026c-4bb8-8b3c-d80ebd317bcf', 'cartao_credito', 2320.0, '2026-05-06', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1, '2026-05-06T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('2d51f63b-5eba-45de-80e1-1506fcfe34f7', 4, 'd8d4e3c2-026c-4bb8-8b3c-d80ebd317bcf', 'Brinde', 10.0, '2026-05-06', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-06');

-- LINHA 54 [NAO]: IPHONE 15 128GB ROSA SEMINOVO (06/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('5914da1a-824a-4aee-b004-3a2a0f8ccbc7', 'Apple', 'IPHONE 15 128GB ROSA SEMINOVO', '356054491176662', 2960.0, 2750.0, 4, 'seminovo', 'bom', 'vendido', '2026-05-06', '2026-05-06', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-06', '2026-05-06', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('e3755997-6a31-4caf-96f0-b56c662efdba', current_setting('importacao.proximo_numero')::int + 52, current_setting('importacao.cliente_id')::uuid, 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 2960.0, 2960.0, 0.0, '2026-05-06', '2026-05-06', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
UPDATE aparelhos SET venda_id = 'e3755997-6a31-4caf-96f0-b56c662efdba' WHERE id = '5914da1a-824a-4aee-b004-3a2a0f8ccbc7';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('4d57af8a-91fd-488b-8512-98b95bb92581', 'e3755997-6a31-4caf-96f0-b56c662efdba', 'pix', 2960.0, '2026-05-06', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1, '2026-05-06T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('dac73f1b-4c85-4bc4-afe3-7375d84d54e6', 4, 'e3755997-6a31-4caf-96f0-b56c662efdba', 'Brinde', 60.0, '2026-05-06', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-06');

-- LINHA 55 [SIM]: IPHONE 14 PRO MAX 256GB PRETO SEMINOVO (06/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('e9b06515-f1a5-400e-a31a-a8e1b7e3ad39', 'Apple', 'IPHONE 14 PRO MAX 256GB PRETO SEMINOVO', NULL, 3590.0, 3200.0, 19, 'seminovo', 'bom', 'vendido', '2026-05-06', '2026-05-06', 'b4269e60-eea2-4eba-a34d-db9591e0ec83', '2026-05-06', '2026-05-06', 'Sem IMEI');
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('401f78b8-2cad-4e3e-9666-bbef0bd47be9', current_setting('importacao.proximo_numero')::int + 53, current_setting('importacao.cliente_id')::uuid, 19, 'b4269e60-eea2-4eba-a34d-db9591e0ec83', 'concluida', 'normal', 3590.0, 3590.0, 0.0, '2026-05-06', '2026-05-06', 'b4269e60-eea2-4eba-a34d-db9591e0ec83');
UPDATE aparelhos SET venda_id = '401f78b8-2cad-4e3e-9666-bbef0bd47be9' WHERE id = 'e9b06515-f1a5-400e-a31a-a8e1b7e3ad39';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('251acf02-9ecf-464f-be6f-745219be4554', '401f78b8-2cad-4e3e-9666-bbef0bd47be9', 'pix', 3590.0, '2026-05-06', 'b4269e60-eea2-4eba-a34d-db9591e0ec83', 1, '2026-05-06T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('f0ffe0f5-5081-410c-8e8d-bcddca6972b6', 19, '401f78b8-2cad-4e3e-9666-bbef0bd47be9', 'Brinde', 15.0, '2026-05-06', 'b4269e60-eea2-4eba-a34d-db9591e0ec83', '2026-05-06');

-- LINHA 56 [NAO]: IPHONE 15 PRO MAX 256GB PRETO SEMINOVO (06/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('1a821fab-f27c-4384-ac78-9719ea678905', 'Apple', 'IPHONE 15 PRO MAX 256GB PRETO SEMINOVO', '355364280424731', 4150.0, 3950.0, 19, 'seminovo', 'bom', 'vendido', '2026-05-06', '2026-05-06', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-06', '2026-05-06', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('5e92dc4d-8a06-485a-8f67-0a5310ab74fd', current_setting('importacao.proximo_numero')::int + 54, current_setting('importacao.cliente_id')::uuid, 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 4150.0, 4150.0, 0.0, '2026-05-06', '2026-05-06', '97f12885-87ad-426a-8bbb-656889d82e10');
UPDATE aparelhos SET venda_id = '5e92dc4d-8a06-485a-8f67-0a5310ab74fd' WHERE id = '1a821fab-f27c-4384-ac78-9719ea678905';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('51867458-5726-4574-ba13-358e261946eb', '5e92dc4d-8a06-485a-8f67-0a5310ab74fd', 'pix', 4150.0, '2026-05-06', '97f12885-87ad-426a-8bbb-656889d82e10', 1, '2026-05-06T14:00:00');

-- LINHA 57 [NAO]: IPHONE 16 PRO MAX 256GB PRETO SEMINOVO (06/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('0b430782-633c-4ad3-9b34-664d72274cf4', 'Apple', 'IPHONE 16 PRO MAX 256GB PRETO SEMINOVO', '358637628310721', 5600.0, 5250.0, 20, 'seminovo', 'bom', 'vendido', '2026-05-06', '2026-05-06', '0dd2c938-c6dd-4f5d-aac5-ed045ee5d2fb', '2026-05-06', '2026-05-06', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('c1bf11c9-c2ce-468a-9577-baf26f9dd32d', current_setting('importacao.proximo_numero')::int + 55, current_setting('importacao.cliente_id')::uuid, 20, '0dd2c938-c6dd-4f5d-aac5-ed045ee5d2fb', 'concluida', 'normal', 5600.0, 5600.0, 0.0, '2026-05-06', '2026-05-06', '0dd2c938-c6dd-4f5d-aac5-ed045ee5d2fb');
UPDATE aparelhos SET venda_id = 'c1bf11c9-c2ce-468a-9577-baf26f9dd32d' WHERE id = '0b430782-633c-4ad3-9b34-664d72274cf4';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('1fc43a51-4fc4-44c2-ab0f-6c27a6322b4d', 'c1bf11c9-c2ce-468a-9577-baf26f9dd32d', 'pix', 2600.0, '2026-05-06', '0dd2c938-c6dd-4f5d-aac5-ed045ee5d2fb', 1, '2026-05-06T14:00:00');
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, observacao, parcelas, criado_em)
VALUES ('be7799d1-642b-48e7-bb26-f0c110af8b1e', 'c1bf11c9-c2ce-468a-9577-baf26f9dd32d', 'troca_aparelho', 3000.0, '2026-05-06', '0dd2c938-c6dd-4f5d-aac5-ed045ee5d2fb', 'Troca: IPH 15 PRO 128GB NATURAL', 1, '2026-05-06T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('eca5c0ee-3b24-4a0d-8a7c-1a2349622703', 20, 'c1bf11c9-c2ce-468a-9577-baf26f9dd32d', 'Brinde', 25.0, '2026-05-06', '0dd2c938-c6dd-4f5d-aac5-ed045ee5d2fb', '2026-05-06');

-- LINHA 58 [NAO]: IPHONE 16 PRO MAX 256GB PRETO SEMINOVO (06/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('d4a3d979-51bd-4140-a8c9-dd066ca9aeb2', 'Apple', 'IPHONE 16 PRO MAX 256GB PRETO SEMINOVO', '354276355652528', 5400.0, 5000.0, 20, 'seminovo', 'bom', 'vendido', '2026-05-06', '2026-05-06', '0dd2c938-c6dd-4f5d-aac5-ed045ee5d2fb', '2026-05-06', '2026-05-06', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('9bc917c7-2564-4614-b9c5-cd4865c7ec37', current_setting('importacao.proximo_numero')::int + 56, current_setting('importacao.cliente_id')::uuid, 20, '0dd2c938-c6dd-4f5d-aac5-ed045ee5d2fb', 'concluida', 'normal', 5400.0, 5400.0, 0.0, '2026-05-06', '2026-05-06', '0dd2c938-c6dd-4f5d-aac5-ed045ee5d2fb');
UPDATE aparelhos SET venda_id = '9bc917c7-2564-4614-b9c5-cd4865c7ec37' WHERE id = 'd4a3d979-51bd-4140-a8c9-dd066ca9aeb2';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('5e3e58a8-2a54-4425-9a38-1781198e6c71', '9bc917c7-2564-4614-b9c5-cd4865c7ec37', 'pix', 5400.0, '2026-05-06', '0dd2c938-c6dd-4f5d-aac5-ed045ee5d2fb', 1, '2026-05-06T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('764ec2a0-f957-4d58-be40-9627c324dc5c', 20, '9bc917c7-2564-4614-b9c5-cd4865c7ec37', 'Brinde', 25.0, '2026-05-06', '0dd2c938-c6dd-4f5d-aac5-ed045ee5d2fb', '2026-05-06');

-- LINHA 59 [NAO]: IPHONR 17E 256GB PRETO NOVO (06/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('899e59ab-3144-4166-8021-fcc0fda50b9f', 'Outros', 'IPHONR 17E 256GB PRETO NOVO', '351961171443417', 3800.0, 3550.0, 20, 'novo', 'perfeito', 'vendido', '2026-05-06', '2026-05-06', '25e2da5b-9e76-4388-9890-7e22efd6940d', '2026-05-06', '2026-05-06', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('a154b1d3-7a6d-4d6c-adca-8187c36b2a9b', current_setting('importacao.proximo_numero')::int + 57, current_setting('importacao.cliente_id')::uuid, 20, '25e2da5b-9e76-4388-9890-7e22efd6940d', 'concluida', 'normal', 3800.0, 3800.0, 0.0, '2026-05-06', '2026-05-06', '25e2da5b-9e76-4388-9890-7e22efd6940d');
UPDATE aparelhos SET venda_id = 'a154b1d3-7a6d-4d6c-adca-8187c36b2a9b' WHERE id = '899e59ab-3144-4166-8021-fcc0fda50b9f';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('f60d4f1c-d0b8-4045-ad8c-4259f871f51e', 'a154b1d3-7a6d-4d6c-adca-8187c36b2a9b', 'cartao_credito', 3800.0, '2026-05-06', '25e2da5b-9e76-4388-9890-7e22efd6940d', 1, '2026-05-06T14:00:00');

-- LINHA 60 [NAO]: IPHONE 17 PRO MAX 256GB AZUL NOVO (06/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('cda543fe-0c5f-4097-9a70-be8bc15f0a97', 'Apple', 'IPHONE 17 PRO MAX 256GB AZUL NOVO', '358434702268268', 8400.0, 8150.0, 20, 'novo', 'perfeito', 'vendido', '2026-05-06', '2026-05-06', '25e2da5b-9e76-4388-9890-7e22efd6940d', '2026-05-06', '2026-05-06', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('2f43f671-39b2-4415-8460-58766bf28b59', current_setting('importacao.proximo_numero')::int + 58, current_setting('importacao.cliente_id')::uuid, 20, '25e2da5b-9e76-4388-9890-7e22efd6940d', 'concluida', 'normal', 8400.0, 8400.0, 0.0, '2026-05-06', '2026-05-06', '25e2da5b-9e76-4388-9890-7e22efd6940d');
UPDATE aparelhos SET venda_id = '2f43f671-39b2-4415-8460-58766bf28b59' WHERE id = 'cda543fe-0c5f-4097-9a70-be8bc15f0a97';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('b379f47b-339c-4e3c-9375-f102f30b1e7f', '2f43f671-39b2-4415-8460-58766bf28b59', 'pix', 8400.0, '2026-05-06', '25e2da5b-9e76-4388-9890-7e22efd6940d', 1, '2026-05-06T14:00:00');

-- LINHA 61 [NAO]: IPHONE 17 PRO MAX 256GB AZUL NOVO (06/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('268e988a-3708-4de4-819f-90c1508dd00c', 'Apple', 'IPHONE 17 PRO MAX 256GB AZUL NOVO', '358434708144554', 8400.0, 8100.0, 20, 'novo', 'perfeito', 'vendido', '2026-05-06', '2026-05-06', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', '2026-05-06', '2026-05-06', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('21263453-4a30-413a-a002-15af90def9d3', current_setting('importacao.proximo_numero')::int + 59, current_setting('importacao.cliente_id')::uuid, 20, 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 'concluida', 'normal', 8400.0, 8400.0, 0.0, '2026-05-06', '2026-05-06', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4');
UPDATE aparelhos SET venda_id = '21263453-4a30-413a-a002-15af90def9d3' WHERE id = '268e988a-3708-4de4-819f-90c1508dd00c';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('ead8aa21-8610-4b62-ab96-cc4e790185ec', '21263453-4a30-413a-a002-15af90def9d3', 'dinheiro', 4450.0, '2026-05-06', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 1, '2026-05-06T14:00:00');
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, observacao, parcelas, criado_em)
VALUES ('31177b48-2bae-4770-985e-db82cada6e03', '21263453-4a30-413a-a002-15af90def9d3', 'troca_aparelho', 3950.0, '2026-05-06', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 'Troca: IPH 15 PRO MAX 256GB AZUL', 1, '2026-05-06T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('184d7680-5848-4008-b291-5e12f27374fb', 20, '21263453-4a30-413a-a002-15af90def9d3', 'Brinde', 15.0, '2026-05-06', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', '2026-05-06');

-- LINHA 62 [NAO]: IPHONE 15 128GB PRETO SEMINOVO (06/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('38367839-f9f1-4bd6-9dc5-b0a4cefb221f', 'Apple', 'IPHONE 15 128GB PRETO SEMINOVO', '359757420449029', 3000.0, 2750.0, 20, 'seminovo', 'bom', 'vendido', '2026-05-06', '2026-05-06', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', '2026-05-06', '2026-05-06', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('60c87287-7f01-4d63-a148-7fd4759691a8', current_setting('importacao.proximo_numero')::int + 60, current_setting('importacao.cliente_id')::uuid, 20, 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 'concluida', 'normal', 3000.0, 3000.0, 0.0, '2026-05-06', '2026-05-06', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4');
UPDATE aparelhos SET venda_id = '60c87287-7f01-4d63-a148-7fd4759691a8' WHERE id = '38367839-f9f1-4bd6-9dc5-b0a4cefb221f';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('32ee7b80-3525-4d7f-b05e-1b4779903cd2', '60c87287-7f01-4d63-a148-7fd4759691a8', 'pix', 2000.0, '2026-05-06', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 1, '2026-05-06T14:00:00');
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, observacao, parcelas, criado_em)
VALUES ('626c77db-bac5-421c-859e-46451c8d2f2a', '60c87287-7f01-4d63-a148-7fd4759691a8', 'troca_aparelho', 1000.0, '2026-05-06', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 'Troca: IPH 12 128GB PRETO', 1, '2026-05-06T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('a3aaf62a-4cd1-4610-b8c5-9e227eb13e22', 20, '60c87287-7f01-4d63-a148-7fd4759691a8', 'Brinde', 25.0, '2026-05-06', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', '2026-05-06');

-- LINHA 63 [NAO]: IPHONE 17 PRO MAX 256GB AZUL NOVO (07/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('f767a8a8-0ddc-488a-af00-53bd205446f5', 'Apple', 'IPHONE 17 PRO MAX 256GB AZUL NOVO', '351771405550451', 8390.0, 8150.0, 19, 'novo', 'perfeito', 'vendido', '2026-05-07', '2026-05-07', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-07', '2026-05-07', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('1c7a9980-0fb0-41de-8b99-6dff7250f528', current_setting('importacao.proximo_numero')::int + 61, current_setting('importacao.cliente_id')::uuid, 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 8390.0, 8390.0, 0.0, '2026-05-07', '2026-05-07', '97f12885-87ad-426a-8bbb-656889d82e10');
UPDATE aparelhos SET venda_id = '1c7a9980-0fb0-41de-8b99-6dff7250f528' WHERE id = 'f767a8a8-0ddc-488a-af00-53bd205446f5';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('725747b0-5d6d-41cf-9ccc-d0b297c97179', '1c7a9980-0fb0-41de-8b99-6dff7250f528', 'pix', 8390.0, '2026-05-07', '97f12885-87ad-426a-8bbb-656889d82e10', 1, '2026-05-07T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('cf6e351a-46a5-48d8-ac29-fe94b073199d', 19, '1c7a9980-0fb0-41de-8b99-6dff7250f528', 'Brinde', 40.0, '2026-05-07', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-07');

-- LINHA 65 [NAO]: IPHONE 13 PRO MAX 128GB DOURADO SEMINOVO (07/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('c226040a-3875-42d8-b6c6-f23ee126c4ba', 'Apple', 'IPHONE 13 PRO MAX 128GB DOURADO SEMINOVO', '354347187764201', 2890.0, 2650.0, 4, 'seminovo', 'bom', 'vendido', '2026-05-07', '2026-05-07', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-07', '2026-05-07', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('d04bc040-b1b0-4eaa-a4a8-a219d44425e9', current_setting('importacao.proximo_numero')::int + 62, current_setting('importacao.cliente_id')::uuid, 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 2890.0, 2890.0, 0.0, '2026-05-07', '2026-05-07', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
UPDATE aparelhos SET venda_id = 'd04bc040-b1b0-4eaa-a4a8-a219d44425e9' WHERE id = 'c226040a-3875-42d8-b6c6-f23ee126c4ba';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('5d9f6117-e7a0-4a80-b636-7aa6c55d5210', 'd04bc040-b1b0-4eaa-a4a8-a219d44425e9', 'pix', 2890.0, '2026-05-07', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1, '2026-05-07T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('4dc1f863-98e3-49ee-b183-1da9ab7be020', 4, 'd04bc040-b1b0-4eaa-a4a8-a219d44425e9', 'Brinde', 65.0, '2026-05-07', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-07');

-- LINHA 66 [NAO]: REDMI NOTE 15 5G 256GB ROXO NOVO (07/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('352fd635-0211-44f2-990a-696868820d69', 'Xiaomi', 'REDMI NOTE 15 5G 256GB ROXO NOVO', '86195070529825', 1420.0, 1360.0, 19, 'novo', 'perfeito', 'vendido', '2026-05-07', '2026-05-07', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-07', '2026-05-07', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('10a1f97e-6008-43bd-8022-be2a680c3110', current_setting('importacao.proximo_numero')::int + 63, current_setting('importacao.cliente_id')::uuid, 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 1420.0, 1420.0, 0.0, '2026-05-07', '2026-05-07', '97f12885-87ad-426a-8bbb-656889d82e10');
UPDATE aparelhos SET venda_id = '10a1f97e-6008-43bd-8022-be2a680c3110' WHERE id = '352fd635-0211-44f2-990a-696868820d69';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('319749c5-c470-420a-b1ce-4f68ff4c23cb', '10a1f97e-6008-43bd-8022-be2a680c3110', 'pix', 1420.0, '2026-05-07', '97f12885-87ad-426a-8bbb-656889d82e10', 1, '2026-05-07T14:00:00');

-- LINHA 67 [SIM]: POCO F7 512GB PRATA NOVO (07/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('865c5d69-8a10-4382-bfdb-00b10a807e00', 'Outros', 'POCO F7 512GB PRATA NOVO', '862136074435040', 341.0, 2800.0, 4, 'novo', 'perfeito', 'vendido', '2026-05-07', '2026-05-07', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-07', '2026-05-07', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('13b06904-ddf4-4417-b7db-011f12199c26', current_setting('importacao.proximo_numero')::int + 64, current_setting('importacao.cliente_id')::uuid, 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 341.0, 341.0, 0.0, '2026-05-07', '2026-05-07', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
UPDATE aparelhos SET venda_id = '13b06904-ddf4-4417-b7db-011f12199c26' WHERE id = '865c5d69-8a10-4382-bfdb-00b10a807e00';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('253aee50-fd67-4c55-aaef-b8bf6425d4a9', '13b06904-ddf4-4417-b7db-011f12199c26', 'pix', 341.0, '2026-05-07', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1, '2026-05-07T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('6bcfec7b-5c8b-4df5-b5f5-fa4b1e91fe32', 4, '13b06904-ddf4-4417-b7db-011f12199c26', 'Brinde', 120.0, '2026-05-07', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-07');

-- LINHA 68 [NAO]: IPHONE 17 PRO MAX 256GB BRANCO NOVO (07/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('0aaed330-046f-4ae5-8565-6ef3a602f0b8', 'Apple', 'IPHONE 17 PRO MAX 256GB BRANCO NOVO', '357247253990986', 8780.0, 8300.0, 1, 'novo', 'perfeito', 'vendido', '2026-05-07', '2026-05-07', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-07', '2026-05-07', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('be2d1854-eb63-44b1-85cf-0ddeff42939b', current_setting('importacao.proximo_numero')::int + 65, current_setting('importacao.cliente_id')::uuid, 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 8780.0, 8780.0, 0.0, '2026-05-07', '2026-05-07', '85e3aa42-b9af-49b8-a72a-64e9c337aa53');
UPDATE aparelhos SET venda_id = 'be2d1854-eb63-44b1-85cf-0ddeff42939b' WHERE id = '0aaed330-046f-4ae5-8565-6ef3a602f0b8';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('3bf1f090-9a59-4a18-999f-ad72356e5d4d', 'be2d1854-eb63-44b1-85cf-0ddeff42939b', 'pix', 2600.0, '2026-05-07', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 1, '2026-05-07T14:00:00');
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, observacao, parcelas, criado_em)
VALUES ('973b5748-033a-432a-93ab-8fb1a5c178de', 'be2d1854-eb63-44b1-85cf-0ddeff42939b', 'troca_aparelho', 6180.0, '2026-05-07', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'Troca: IPH 14 PRO MAX ROXO 256GB; IPH 15 PRO 256GB NATURAL', 1, '2026-05-07T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('c9e6ba07-1f2e-4300-a47d-44c07b398201', 1, 'be2d1854-eb63-44b1-85cf-0ddeff42939b', 'Brinde', 10.0, '2026-05-07', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-07');

-- LINHA 69 [NAO]: IPHONE 13 PRO MAX 128GB AZUL SEMINOVO (07/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('aced7d73-b26c-4aef-b382-5cf6123a3ec2', 'Apple', 'IPHONE 13 PRO MAX 128GB AZUL SEMINOVO', '35717750667908', 3230.0, 2650.0, 1, 'seminovo', 'bom', 'vendido', '2026-05-07', '2026-05-07', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-07', '2026-05-07', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('6f84355f-76cd-4dff-b511-84f6d2031d57', current_setting('importacao.proximo_numero')::int + 66, current_setting('importacao.cliente_id')::uuid, 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 3230.0, 3230.0, 0.0, '2026-05-07', '2026-05-07', '85e3aa42-b9af-49b8-a72a-64e9c337aa53');
UPDATE aparelhos SET venda_id = '6f84355f-76cd-4dff-b511-84f6d2031d57' WHERE id = 'aced7d73-b26c-4aef-b382-5cf6123a3ec2';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('0abf45be-c11b-4da6-8089-cff85156ffb4', '6f84355f-76cd-4dff-b511-84f6d2031d57', 'pix', 1330.0, '2026-05-07', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 1, '2026-05-07T14:00:00');
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, observacao, parcelas, criado_em)
VALUES ('bf140289-45b2-4af8-aee8-33aa57174910', '6f84355f-76cd-4dff-b511-84f6d2031d57', 'troca_aparelho', 1900.0, '2026-05-07', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'Troca: IPH 12 PRO MAX AZUL', 1, '2026-05-07T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('575931cb-8042-4337-b631-a1ad815dd174', 1, '6f84355f-76cd-4dff-b511-84f6d2031d57', 'Brinde', 205.0, '2026-05-07', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-07');

-- LINHA 70 [NAO]: IPHONE 17 PRO MAX 512GB AZUL NOVO (07/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('45a93dfd-74e9-427b-aa6b-ab665fcbe8f0', 'Apple', 'IPHONE 17 PRO MAX 512GB AZUL NOVO', '351668144729893', 9950.0, 8850.0, 1, 'novo', 'perfeito', 'vendido', '2026-05-07', '2026-05-07', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-07', '2026-05-07', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('467752b0-dd8f-4100-a51d-990371422724', current_setting('importacao.proximo_numero')::int + 67, current_setting('importacao.cliente_id')::uuid, 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 9950.0, 9950.0, 0.0, '2026-05-07', '2026-05-07', '85e3aa42-b9af-49b8-a72a-64e9c337aa53');
UPDATE aparelhos SET venda_id = '467752b0-dd8f-4100-a51d-990371422724' WHERE id = '45a93dfd-74e9-427b-aa6b-ab665fcbe8f0';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('44f4a85d-033b-4532-bb47-66c7bac74771', '467752b0-dd8f-4100-a51d-990371422724', 'pix', 5250.0, '2026-05-07', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 1, '2026-05-07T14:00:00');
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, observacao, parcelas, criado_em)
VALUES ('92eeccc9-d90a-4011-bd52-99522f1d79dc', '467752b0-dd8f-4100-a51d-990371422724', 'troca_aparelho', 4700.0, '2026-05-07', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'Troca: IPH 16 PRO MAX 256GB DESERT', 1, '2026-05-07T14:00:00');

-- LINHA 71 [NAO]: IPHONE 17 PRO 256GB SILVER NOVO (07/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('6f6a7f0b-c6fd-4a3f-b6fb-8e458efa5218', 'Apple', 'IPHONE 17 PRO 256GB SILVER NOVO', '354289639953000', 7850.0, 7580.0, 1, 'novo', 'perfeito', 'vendido', '2026-05-07', '2026-05-07', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-07', '2026-05-07', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('69cd29d0-296d-4354-b718-a954561e437a', current_setting('importacao.proximo_numero')::int + 68, current_setting('importacao.cliente_id')::uuid, 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 7850.0, 7850.0, 0.0, '2026-05-07', '2026-05-07', '85e3aa42-b9af-49b8-a72a-64e9c337aa53');
UPDATE aparelhos SET venda_id = '69cd29d0-296d-4354-b718-a954561e437a' WHERE id = '6f6a7f0b-c6fd-4a3f-b6fb-8e458efa5218';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('bca70395-38e1-4429-85f7-d8aa88982066', '69cd29d0-296d-4354-b718-a954561e437a', 'pix', 5250.0, '2026-05-07', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 1, '2026-05-07T14:00:00');
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, observacao, parcelas, criado_em)
VALUES ('11e1a58b-5bae-464a-93a3-cae9496936a8', '69cd29d0-296d-4354-b718-a954561e437a', 'troca_aparelho', 2600.0, '2026-05-07', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'Troca: IPH 15 PRO', 1, '2026-05-07T14:00:00');

-- LINHA 72 [NAO]: IPHONE 14 128GB LILAS SEMINOVO (08/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('cc1a5b7c-a65a-47e0-b2fa-e57d43680678', 'Apple', 'IPHONE 14 128GB LILAS SEMINOVO', '350577192598574', 2400.0, 2050.0, 19, 'seminovo', 'bom', 'vendido', '2026-05-08', '2026-05-08', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-08', '2026-05-08', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('be92cc0d-0c9c-4f24-a84d-3fdac78a57d0', current_setting('importacao.proximo_numero')::int + 69, current_setting('importacao.cliente_id')::uuid, 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 2400.0, 2400.0, 0.0, '2026-05-08', '2026-05-08', '97f12885-87ad-426a-8bbb-656889d82e10');
UPDATE aparelhos SET venda_id = 'be92cc0d-0c9c-4f24-a84d-3fdac78a57d0' WHERE id = 'cc1a5b7c-a65a-47e0-b2fa-e57d43680678';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('1e484dfd-0606-4061-9d44-7e7bce001def', 'be92cc0d-0c9c-4f24-a84d-3fdac78a57d0', 'pix', 1100.0, '2026-05-08', '97f12885-87ad-426a-8bbb-656889d82e10', 1, '2026-05-08T14:00:00');
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, observacao, parcelas, criado_em)
VALUES ('b2bc5834-f04f-4267-bf66-4b7c1abb1208', 'be92cc0d-0c9c-4f24-a84d-3fdac78a57d0', 'troca_aparelho', 1300.0, '2026-05-08', '97f12885-87ad-426a-8bbb-656889d82e10', 'Troca: IPHONE 12 128GB AZUL', 1, '2026-05-08T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('b2088640-e925-474a-a32e-2412cb73d03a', 19, 'be92cc0d-0c9c-4f24-a84d-3fdac78a57d0', 'Brinde', 25.0, '2026-05-08', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-08');

-- LINHA 73 [NAO]: IPHONE 17 PRO MAX 256GB PRATA NOVO (08/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('b64e7094-f670-41b0-b33e-c44c6e268e17', 'Apple', 'IPHONE 17 PRO MAX 256GB PRATA NOVO', '351771409088771', 8480.0, 8300.0, 4, 'novo', 'perfeito', 'vendido', '2026-05-08', '2026-05-08', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-08', '2026-05-08', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('b26bc81e-69a1-44f4-b793-110cd044b861', current_setting('importacao.proximo_numero')::int + 70, current_setting('importacao.cliente_id')::uuid, 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 8480.0, 8480.0, 0.0, '2026-05-08', '2026-05-08', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
UPDATE aparelhos SET venda_id = 'b26bc81e-69a1-44f4-b793-110cd044b861' WHERE id = 'b64e7094-f670-41b0-b33e-c44c6e268e17';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('3418df67-ddaa-4ba8-a61c-d6ad8b0b26bb', 'b26bc81e-69a1-44f4-b793-110cd044b861', 'pix', 2830.0, '2026-05-08', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1, '2026-05-08T14:00:00');
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('106dbac4-4b7f-48a9-a833-e629462c947b', 'b26bc81e-69a1-44f4-b793-110cd044b861', 'dinheiro', 2500.0, '2026-05-08', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1, '2026-05-08T14:00:00');
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, observacao, parcelas, criado_em)
VALUES ('c7f7aa58-14e6-458c-95d4-8680b4e2feab', 'b26bc81e-69a1-44f4-b793-110cd044b861', 'troca_aparelho', 3150.0, '2026-05-08', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'Troca: 14 PRO MAX 128GB', 1, '2026-05-08T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('ea8aa753-0640-4d90-ac22-089df7c13369', 4, 'b26bc81e-69a1-44f4-b793-110cd044b861', 'Brinde', 15.0, '2026-05-08', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-08');

-- LINHA 74 [NAO]: IPHONE 13 128GB PRETO SEMINOVO (08/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('f29b03e9-57e5-4a3c-94e3-a3b0355aa663', 'Apple', 'IPHONE 13 128GB PRETO SEMINOVO', '350038441784457', 1924.0, 1800.0, 4, 'seminovo', 'bom', 'vendido', '2026-05-08', '2026-05-08', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-08', '2026-05-08', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('c0931471-56ac-40cf-aced-21df1349222c', current_setting('importacao.proximo_numero')::int + 71, current_setting('importacao.cliente_id')::uuid, 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 1924.0, 1924.0, 0.0, '2026-05-08', '2026-05-08', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
UPDATE aparelhos SET venda_id = 'c0931471-56ac-40cf-aced-21df1349222c' WHERE id = 'f29b03e9-57e5-4a3c-94e3-a3b0355aa663';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('38e1618b-6295-465d-ac14-922a270cba68', 'c0931471-56ac-40cf-aced-21df1349222c', 'cartao_credito', 1924.0, '2026-05-08', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1, '2026-05-08T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('509ad963-2f73-4611-a89b-3537938e0274', 4, 'c0931471-56ac-40cf-aced-21df1349222c', 'Brinde', 15.0, '2026-05-08', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-08');

-- LINHA 75 [NAO]: IPHONE 13 PRO MAX 128GB PRETO SEMINOVO (08/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('b5bb4aaa-081d-478c-b311-abe6fdf99db6', 'Apple', 'IPHONE 13 PRO MAX 128GB PRETO SEMINOVO', '352114954343441', 2850.0, 2650.0, 4, 'seminovo', 'bom', 'vendido', '2026-05-08', '2026-05-08', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-08', '2026-05-08', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('dc1704a4-004c-4041-b1cb-a43411dc3670', current_setting('importacao.proximo_numero')::int + 72, current_setting('importacao.cliente_id')::uuid, 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 2850.0, 2850.0, 0.0, '2026-05-08', '2026-05-08', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
UPDATE aparelhos SET venda_id = 'dc1704a4-004c-4041-b1cb-a43411dc3670' WHERE id = 'b5bb4aaa-081d-478c-b311-abe6fdf99db6';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('7b6583c2-89eb-4952-bcd8-563a2df1edf0', 'dc1704a4-004c-4041-b1cb-a43411dc3670', 'pix', 2850.0, '2026-05-08', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1, '2026-05-08T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('711abef5-39d5-420f-9fc8-7472577948cb', 4, 'dc1704a4-004c-4041-b1cb-a43411dc3670', 'Brinde', 25.0, '2026-05-08', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-08');

-- LINHA 76 [NAO]: AIRPODS PRO 3 NOVO (08/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('a8463cb5-2e83-4863-ac03-8d076b61fde9', 'Outros', 'AIRPODS PRO 3 NOVO', 'H2P49XQY13', 1700.0, 1500.0, 19, 'novo', 'perfeito', 'vendido', '2026-05-08', '2026-05-08', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-08', '2026-05-08', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('0042f450-b2be-4229-b36c-3522883f2fd5', current_setting('importacao.proximo_numero')::int + 73, current_setting('importacao.cliente_id')::uuid, 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 1700.0, 1700.0, 0.0, '2026-05-08', '2026-05-08', '97f12885-87ad-426a-8bbb-656889d82e10');
UPDATE aparelhos SET venda_id = '0042f450-b2be-4229-b36c-3522883f2fd5' WHERE id = 'a8463cb5-2e83-4863-ac03-8d076b61fde9';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('7b1273f6-b39d-4dab-81f1-2df6507db8cc', '0042f450-b2be-4229-b36c-3522883f2fd5', 'cartao_credito', 1700.0, '2026-05-08', '97f12885-87ad-426a-8bbb-656889d82e10', 1, '2026-05-08T14:00:00');

-- LINHA 77 [NAO]: IPHONE 14 PRO MAX BRANCO SEMINOVO (08/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('0d89c7ed-97dd-4f4b-ac7a-557dde4d4531', 'Apple', 'IPHONE 14 PRO MAX BRANCO SEMINOVO', '350636590567381', 3250.0, 3150.0, 19, 'seminovo', 'bom', 'vendido', '2026-05-08', '2026-05-08', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-08', '2026-05-08', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('6b505500-d32b-47aa-b902-96e459f899b4', current_setting('importacao.proximo_numero')::int + 74, current_setting('importacao.cliente_id')::uuid, 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 3250.0, 3250.0, 0.0, '2026-05-08', '2026-05-08', '97f12885-87ad-426a-8bbb-656889d82e10');
UPDATE aparelhos SET venda_id = '6b505500-d32b-47aa-b902-96e459f899b4' WHERE id = '0d89c7ed-97dd-4f4b-ac7a-557dde4d4531';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('b335e7bc-bf7f-4322-bf38-f7203d4932e0', '6b505500-d32b-47aa-b902-96e459f899b4', 'pix', 3250.0, '2026-05-08', '97f12885-87ad-426a-8bbb-656889d82e10', 1, '2026-05-08T14:00:00');

-- LINHA 78 [NAO]: POCO PAD M1 CINZA NOVO (08/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('f339a596-c23c-49a2-8cc7-e102c2cac795', 'Outros', 'POCO PAD M1 CINZA NOVO', '7111Y5YJ02338', 1750.0, 1600.0, 20, 'novo', 'perfeito', 'vendido', '2026-05-08', '2026-05-08', '25e2da5b-9e76-4388-9890-7e22efd6940d', '2026-05-08', '2026-05-08', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('d9e30719-b1c7-4b8c-bfbf-bae24fc285a1', current_setting('importacao.proximo_numero')::int + 75, current_setting('importacao.cliente_id')::uuid, 20, '25e2da5b-9e76-4388-9890-7e22efd6940d', 'concluida', 'normal', 1750.0, 1750.0, 0.0, '2026-05-08', '2026-05-08', '25e2da5b-9e76-4388-9890-7e22efd6940d');
UPDATE aparelhos SET venda_id = 'd9e30719-b1c7-4b8c-bfbf-bae24fc285a1' WHERE id = 'f339a596-c23c-49a2-8cc7-e102c2cac795';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('5d070e69-257a-4114-aa80-d7fa1b53f0ce', 'd9e30719-b1c7-4b8c-bfbf-bae24fc285a1', 'pix', 1750.0, '2026-05-08', '25e2da5b-9e76-4388-9890-7e22efd6940d', 1, '2026-05-08T14:00:00');

-- LINHA 79 [NAO]: IPHONE 14 PRO MAX ROXO SEMINOVO (08/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('b003654b-b841-4a76-931e-309dc0dca94b', 'Apple', 'IPHONE 14 PRO MAX ROXO SEMINOVO', '357650612874918', 3425.0, 3150.0, 20, 'seminovo', 'bom', 'vendido', '2026-05-08', '2026-05-08', '25e2da5b-9e76-4388-9890-7e22efd6940d', '2026-05-08', '2026-05-08', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('2122e634-6ce2-4507-a02b-ff3c4355829e', current_setting('importacao.proximo_numero')::int + 76, current_setting('importacao.cliente_id')::uuid, 20, '25e2da5b-9e76-4388-9890-7e22efd6940d', 'concluida', 'normal', 3425.0, 3425.0, 0.0, '2026-05-08', '2026-05-08', '25e2da5b-9e76-4388-9890-7e22efd6940d');
UPDATE aparelhos SET venda_id = '2122e634-6ce2-4507-a02b-ff3c4355829e' WHERE id = 'b003654b-b841-4a76-931e-309dc0dca94b';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('44406d4c-71d1-499a-bfbd-4ce724834069', '2122e634-6ce2-4507-a02b-ff3c4355829e', 'pix', 3425.0, '2026-05-08', '25e2da5b-9e76-4388-9890-7e22efd6940d', 1, '2026-05-08T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('1b051918-bf88-4187-878c-bb9b15451625', 20, '2122e634-6ce2-4507-a02b-ff3c4355829e', 'Brinde', 15.0, '2026-05-08', '25e2da5b-9e76-4388-9890-7e22efd6940d', '2026-05-08');

-- LINHA 80 [NAO]: IPHONE 17 PRO MAX 512GB SILVER NOVO (08/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('ea377053-7520-4259-8a56-58e6e9a633ce', 'Apple', 'IPHONE 17 PRO MAX 512GB SILVER NOVO', '357329447631468', 9900.0, 9500.0, 20, 'novo', 'perfeito', 'vendido', '2026-05-08', '2026-05-08', '0dd2c938-c6dd-4f5d-aac5-ed045ee5d2fb', '2026-05-08', '2026-05-08', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('5f483306-4c4f-4c8c-9314-eb42f093c8e7', current_setting('importacao.proximo_numero')::int + 77, current_setting('importacao.cliente_id')::uuid, 20, '0dd2c938-c6dd-4f5d-aac5-ed045ee5d2fb', 'concluida', 'normal', 9900.0, 9900.0, 0.0, '2026-05-08', '2026-05-08', '0dd2c938-c6dd-4f5d-aac5-ed045ee5d2fb');
UPDATE aparelhos SET venda_id = '5f483306-4c4f-4c8c-9314-eb42f093c8e7' WHERE id = 'ea377053-7520-4259-8a56-58e6e9a633ce';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('7e99d942-d1d8-417e-aa8f-c969e15fc076', '5f483306-4c4f-4c8c-9314-eb42f093c8e7', 'pix', 5400.0, '2026-05-08', '0dd2c938-c6dd-4f5d-aac5-ed045ee5d2fb', 1, '2026-05-08T14:00:00');
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, observacao, parcelas, criado_em)
VALUES ('ead48aa7-c6ad-4748-978c-6778bbfbe937', '5f483306-4c4f-4c8c-9314-eb42f093c8e7', 'troca_aparelho', 4500.0, '2026-05-08', '0dd2c938-c6dd-4f5d-aac5-ed045ee5d2fb', 'Troca: 16 PRO DE 256 GB NA COR DESERT', 1, '2026-05-08T14:00:00');

-- LINHA 81 [NAO]: IPHONE XR 64GB PRETO SEMINOVO (08/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('2ce2844f-b442-4e06-8e4e-fcc485ab049b', 'Apple', 'IPHONE XR 64GB PRETO SEMINOVO', '35308210166173', 750.0, 500.0, 20, 'seminovo', 'bom', 'vendido', '2026-05-08', '2026-05-08', '0dd2c938-c6dd-4f5d-aac5-ed045ee5d2fb', '2026-05-08', '2026-05-08', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('5b18730d-436f-4608-9ff4-870b5fcc6015', current_setting('importacao.proximo_numero')::int + 78, current_setting('importacao.cliente_id')::uuid, 20, '0dd2c938-c6dd-4f5d-aac5-ed045ee5d2fb', 'concluida', 'normal', 750.0, 750.0, 0.0, '2026-05-08', '2026-05-08', '0dd2c938-c6dd-4f5d-aac5-ed045ee5d2fb');
UPDATE aparelhos SET venda_id = '5b18730d-436f-4608-9ff4-870b5fcc6015' WHERE id = '2ce2844f-b442-4e06-8e4e-fcc485ab049b';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('02e63e8b-f4e4-41b1-b374-26b4a9a8409d', '5b18730d-436f-4608-9ff4-870b5fcc6015', 'pix', 750.0, '2026-05-08', '0dd2c938-c6dd-4f5d-aac5-ed045ee5d2fb', 1, '2026-05-08T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('60835b08-1a99-4dc2-97c9-cd2140842d1b', 20, '5b18730d-436f-4608-9ff4-870b5fcc6015', 'Brinde', 25.0, '2026-05-08', '0dd2c938-c6dd-4f5d-aac5-ed045ee5d2fb', '2026-05-08');

-- LINHA 82 [NAO]: GALAXY TAB S10 FE NOVO (09/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('c00e2d14-0284-44ce-b490-edf3cda50fb2', 'Outros', 'GALAXY TAB S10 FE NOVO', 'R5GL34HOBP', 2680.0, 2350.0, 4, 'novo', 'perfeito', 'vendido', '2026-05-09', '2026-05-09', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-09', '2026-05-09', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('423bbe66-e6f4-4eeb-9103-096189ca97de', current_setting('importacao.proximo_numero')::int + 79, current_setting('importacao.cliente_id')::uuid, 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 2680.0, 2680.0, 0.0, '2026-05-09', '2026-05-09', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
UPDATE aparelhos SET venda_id = '423bbe66-e6f4-4eeb-9103-096189ca97de' WHERE id = 'c00e2d14-0284-44ce-b490-edf3cda50fb2';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('96e63f1f-0dc4-4437-b99a-5023c1fba028', '423bbe66-e6f4-4eeb-9103-096189ca97de', 'pix', 520.0, '2026-05-09', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1, '2026-05-09T14:00:00');
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('73cba31f-2312-4632-ac2d-dca6d1e8966a', '423bbe66-e6f4-4eeb-9103-096189ca97de', 'dinheiro', 160.0, '2026-05-09', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1, '2026-05-09T14:00:00');
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('8280d02e-1eef-4fa3-a058-a6689444aac8', '423bbe66-e6f4-4eeb-9103-096189ca97de', 'cartao_credito', 2000.0, '2026-05-09', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1, '2026-05-09T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('8b480939-b154-4437-b01c-aa407ee3c635', 4, '423bbe66-e6f4-4eeb-9103-096189ca97de', 'Brinde', 70.0, '2026-05-09', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-09');

-- LINHA 83 [NAO]: IPHONE 12 128GB AZUL SEMINOVO (09/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('2fc19203-d2b5-47fb-96cc-e1861d0d2b09', 'Apple', 'IPHONE 12 128GB AZUL SEMINOVO', '353361731078373', 1600.0, 1300.0, 4, 'seminovo', 'bom', 'vendido', '2026-05-09', '2026-05-09', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-09', '2026-05-09', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('fa569c37-d4ec-423d-afdf-d4e8ed20b0f3', current_setting('importacao.proximo_numero')::int + 80, current_setting('importacao.cliente_id')::uuid, 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 1600.0, 1600.0, 0.0, '2026-05-09', '2026-05-09', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
UPDATE aparelhos SET venda_id = 'fa569c37-d4ec-423d-afdf-d4e8ed20b0f3' WHERE id = '2fc19203-d2b5-47fb-96cc-e1861d0d2b09';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('b6d65732-bae7-487d-8417-6ffdbd8ed5cd', 'fa569c37-d4ec-423d-afdf-d4e8ed20b0f3', 'pix', 375.0, '2026-05-09', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1, '2026-05-09T14:00:00');
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('f7e63c97-9200-4777-8a80-6efe5cf5a6f1', 'fa569c37-d4ec-423d-afdf-d4e8ed20b0f3', 'cartao_credito', 1225.0, '2026-05-09', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1, '2026-05-09T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('2ee4dc5e-f2e7-4832-9276-763804689bef', 4, 'fa569c37-d4ec-423d-afdf-d4e8ed20b0f3', 'Brinde', 25.0, '2026-05-09', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-09');

-- LINHA 84 [NAO]: IPHONE 13 PRO MAX 128GB DOURADO SEMINOVO (09/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('cee2e3d7-33a2-4e82-b6cb-106ac846f197', 'Apple', 'IPHONE 13 PRO MAX 128GB DOURADO SEMINOVO', '353869220959541', 2940.0, 2650.0, 4, 'seminovo', 'bom', 'vendido', '2026-05-09', '2026-05-09', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-09', '2026-05-09', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('9eddc8d6-cfac-417b-82c2-f8966c5f601a', current_setting('importacao.proximo_numero')::int + 81, current_setting('importacao.cliente_id')::uuid, 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 2940.0, 2940.0, 0.0, '2026-05-09', '2026-05-09', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
UPDATE aparelhos SET venda_id = '9eddc8d6-cfac-417b-82c2-f8966c5f601a' WHERE id = 'cee2e3d7-33a2-4e82-b6cb-106ac846f197';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('3093254c-5537-4d01-bcb1-1697c9e138b8', '9eddc8d6-cfac-417b-82c2-f8966c5f601a', 'cartao_credito', 2940.0, '2026-05-09', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1, '2026-05-09T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('debe3eeb-749a-4d3d-85b3-9afdb18e8076', 4, '9eddc8d6-cfac-417b-82c2-f8966c5f601a', 'Brinde', 25.0, '2026-05-09', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-09');

-- LINHA 85 [NAO]: IPHONE 13 PRO MAX 128GB DOURADO SEMINOVO (09/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('e79c3219-a0a2-405e-8093-86cdfe2c5eeb', 'Apple', 'IPHONE 13 PRO MAX 128GB DOURADO SEMINOVO', '353967811367765', 2900.0, 2650.0, 20, 'seminovo', 'bom', 'vendido', '2026-05-09', '2026-05-09', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', '2026-05-09', '2026-05-09', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('41b98348-672b-4424-91d9-c5cd5fc22a2a', current_setting('importacao.proximo_numero')::int + 82, current_setting('importacao.cliente_id')::uuid, 20, 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 'concluida', 'normal', 2900.0, 2900.0, 0.0, '2026-05-09', '2026-05-09', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4');
UPDATE aparelhos SET venda_id = '41b98348-672b-4424-91d9-c5cd5fc22a2a' WHERE id = 'e79c3219-a0a2-405e-8093-86cdfe2c5eeb';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('264bdacb-1d19-4ecc-bd67-875ce327f82f', '41b98348-672b-4424-91d9-c5cd5fc22a2a', 'pix', 1800.0, '2026-05-09', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 1, '2026-05-09T14:00:00');
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, observacao, parcelas, criado_em)
VALUES ('ab1859ef-d383-4d8a-ba97-80038960b54b', '41b98348-672b-4424-91d9-c5cd5fc22a2a', 'troca_aparelho', 1100.0, '2026-05-09', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 'Troca: IPH 12 64GB', 1, '2026-05-09T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('f4286e7e-11fb-47e0-a3e1-f1bc0b803d3e', 20, '41b98348-672b-4424-91d9-c5cd5fc22a2a', 'Brinde', 5.0, '2026-05-09', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', '2026-05-09');

-- LINHA 86 [NAO]: IPHONE 17 PRO BRANCO NOVO (09/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('ce1d5266-b10c-4703-9830-60b8e97afa51', 'Apple', 'IPHONE 17 PRO BRANCO NOVO', '354289633906715', 7600.0, 7500.0, 19, 'novo', 'perfeito', 'vendido', '2026-05-09', '2026-05-09', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-09', '2026-05-09', 'Pagto junto (Aparelho 1/2, total grupo R$ 11,750)');
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('dfbc9ce3-7094-4a8a-8d32-7422afee1d36', current_setting('importacao.proximo_numero')::int + 83, current_setting('importacao.cliente_id')::uuid, 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 7600.0, 7600.0, 0.0, '2026-05-09', '2026-05-09', '97f12885-87ad-426a-8bbb-656889d82e10');
UPDATE aparelhos SET venda_id = 'dfbc9ce3-7094-4a8a-8d32-7422afee1d36' WHERE id = 'ce1d5266-b10c-4703-9830-60b8e97afa51';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('d5135748-4b9f-4cf8-86a4-6e2c3f70a594', 'dfbc9ce3-7094-4a8a-8d32-7422afee1d36', 'pix', 7600.0, '2026-05-09', '97f12885-87ad-426a-8bbb-656889d82e10', 1, '2026-05-09T14:00:00');

-- LINHA 87 [NAO]: IPHONE 17E PRETO NOVO (09/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('09b67c02-fc38-4dd6-9264-a0766a66f82b', 'Apple', 'IPHONE 17E PRETO NOVO', '351101750253834', 4150.0, 3700.0, 19, 'novo', 'perfeito', 'vendido', '2026-05-09', '2026-05-09', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-09', '2026-05-09', 'Pagto junto (Aparelho 2/2, total grupo R$ 11,750)');
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('1c7e756a-3dbf-48a5-8747-36f5f9006763', current_setting('importacao.proximo_numero')::int + 84, current_setting('importacao.cliente_id')::uuid, 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 4150.0, 4150.0, 0.0, '2026-05-09', '2026-05-09', '97f12885-87ad-426a-8bbb-656889d82e10');
UPDATE aparelhos SET venda_id = '1c7e756a-3dbf-48a5-8747-36f5f9006763' WHERE id = '09b67c02-fc38-4dd6-9264-a0766a66f82b';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('073ef2f2-d490-46b5-8d33-1f96e2f01664', '1c7e756a-3dbf-48a5-8747-36f5f9006763', 'pix', 4150.0, '2026-05-09', '97f12885-87ad-426a-8bbb-656889d82e10', 1, '2026-05-09T14:00:00');

-- LINHA 88 [NAO]: IPHONE 16 PRO 256GB DOURADO SEMINOVO (09/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('4d09bbe7-33ad-4901-ab2e-c4c0a1842e81', 'Apple', 'IPHONE 16 PRO 256GB DOURADO SEMINOVO', '358876629642191', 5000.0, 4500.0, 1, 'seminovo', 'bom', 'vendido', '2026-05-09', '2026-05-09', '9451cd9f-6770-4e32-aae8-c75fa675e818', '2026-05-09', '2026-05-09', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('0f8034b5-85b7-499d-b0eb-f7b65321ba9a', current_setting('importacao.proximo_numero')::int + 85, current_setting('importacao.cliente_id')::uuid, 1, '9451cd9f-6770-4e32-aae8-c75fa675e818', 'concluida', 'normal', 5000.0, 5000.0, 0.0, '2026-05-09', '2026-05-09', '9451cd9f-6770-4e32-aae8-c75fa675e818');
UPDATE aparelhos SET venda_id = '0f8034b5-85b7-499d-b0eb-f7b65321ba9a' WHERE id = '4d09bbe7-33ad-4901-ab2e-c4c0a1842e81';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('a1a2b5bc-0d03-4e09-8db2-582b2fba8a89', '0f8034b5-85b7-499d-b0eb-f7b65321ba9a', 'pix', 5000.0, '2026-05-09', '9451cd9f-6770-4e32-aae8-c75fa675e818', 1, '2026-05-09T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('3f17b890-af6f-4b08-895b-4353cd2bccbe', 1, '0f8034b5-85b7-499d-b0eb-f7b65321ba9a', 'Brinde', 15.0, '2026-05-09', '9451cd9f-6770-4e32-aae8-c75fa675e818', '2026-05-09');

-- LINHA 89 [NAO]: IPHONE 14 PRO MAX 128GB PRETO SEMINOVO (09/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('d495d6a6-3c60-4ba6-b721-538fe908c010', 'Apple', 'IPHONE 14 PRO MAX 128GB PRETO SEMINOVO', '356703857557028', 3650.0, 3150.0, 1, 'seminovo', 'bom', 'vendido', '2026-05-09', '2026-05-09', '9451cd9f-6770-4e32-aae8-c75fa675e818', '2026-05-09', '2026-05-09', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('298608ab-feb0-42e5-bf67-59fb7643654f', current_setting('importacao.proximo_numero')::int + 86, current_setting('importacao.cliente_id')::uuid, 1, '9451cd9f-6770-4e32-aae8-c75fa675e818', 'concluida', 'normal', 3650.0, 3650.0, 0.0, '2026-05-09', '2026-05-09', '9451cd9f-6770-4e32-aae8-c75fa675e818');
UPDATE aparelhos SET venda_id = '298608ab-feb0-42e5-bf67-59fb7643654f' WHERE id = 'd495d6a6-3c60-4ba6-b721-538fe908c010';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('b7d9fbe6-e1a0-4208-9cb4-1b0c443301a7', '298608ab-feb0-42e5-bf67-59fb7643654f', 'pix', 3650.0, '2026-05-09', '9451cd9f-6770-4e32-aae8-c75fa675e818', 1, '2026-05-09T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('2db568cb-1e9b-41da-84c2-2d2b57bfa44c', 1, '298608ab-feb0-42e5-bf67-59fb7643654f', 'Brinde', 25.0, '2026-05-09', '9451cd9f-6770-4e32-aae8-c75fa675e818', '2026-05-09');

-- LINHA 90 [SIM]: IPHONE 14 PRO ROXO SEMINOVO (09/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('ea652431-9e34-43da-a34a-9b0ff7f494ea', 'Apple', 'IPHONE 14 PRO ROXO SEMINOVO', '350923388804337', 2953.0, 2700.0, 1, 'seminovo', 'bom', 'vendido', '2026-05-09', '2026-05-09', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-09', '2026-05-09', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('7e7f79d1-5182-439a-a19b-f7ef030cd8aa', current_setting('importacao.proximo_numero')::int + 87, current_setting('importacao.cliente_id')::uuid, 1, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 2953.0, 2953.0, 0.0, '2026-05-09', '2026-05-09', '97f12885-87ad-426a-8bbb-656889d82e10');
UPDATE aparelhos SET venda_id = '7e7f79d1-5182-439a-a19b-f7ef030cd8aa' WHERE id = 'ea652431-9e34-43da-a34a-9b0ff7f494ea';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('194a6527-4481-4b08-a4ea-d548cd7dc2db', '7e7f79d1-5182-439a-a19b-f7ef030cd8aa', 'pix', 2953.0, '2026-05-09', '97f12885-87ad-426a-8bbb-656889d82e10', 1, '2026-05-09T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('7cd4969c-b01e-41fd-8384-0197ffaecf0b', 1, '7e7f79d1-5182-439a-a19b-f7ef030cd8aa', 'Brinde', 25.0, '2026-05-09', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-09');

-- LINHA 91 [SIM]: IPHONE 14 LILAS 128GB  SEMINOVO (09/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('f05f1ec6-312a-42bf-a5ad-37da84f287ad', 'Apple', 'IPHONE 14 LILAS 128GB  SEMINOVO', '35142179914814', 2350.0, 2050.0, 20, 'seminovo', 'bom', 'vendido', '2026-05-09', '2026-05-09', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', '2026-05-09', '2026-05-09', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('f4cbae50-e76c-4126-aafc-fa0d6018ef08', current_setting('importacao.proximo_numero')::int + 88, current_setting('importacao.cliente_id')::uuid, 20, 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 'concluida', 'normal', 2350.0, 2350.0, 0.0, '2026-05-09', '2026-05-09', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4');
UPDATE aparelhos SET venda_id = 'f4cbae50-e76c-4126-aafc-fa0d6018ef08' WHERE id = 'f05f1ec6-312a-42bf-a5ad-37da84f287ad';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('41bf11fb-17f5-49ae-9ca3-1bec01b3a414', 'f4cbae50-e76c-4126-aafc-fa0d6018ef08', 'pix', 2350.0, '2026-05-09', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 1, '2026-05-09T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('09a39350-bcd8-4027-b42a-719a99944134', 20, 'f4cbae50-e76c-4126-aafc-fa0d6018ef08', 'Brinde', 15.0, '2026-05-09', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', '2026-05-09');

-- LINHA 92 [NAO]: IPAD 11 (A16) 128GB BRANCO NOVO (09/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('ff7d1779-1951-49d8-bc64-d6ef27b200ad', 'Apple', 'IPAD 11 (A16) 128GB BRANCO NOVO', 'MTGXKDV9QX', 2650.0, 2199.99, 1, 'novo', 'perfeito', 'vendido', '2026-05-09', '2026-05-09', '9451cd9f-6770-4e32-aae8-c75fa675e818', '2026-05-09', '2026-05-09', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('9879916b-09b9-4f6d-bffc-78bf00215bc8', current_setting('importacao.proximo_numero')::int + 89, current_setting('importacao.cliente_id')::uuid, 1, '9451cd9f-6770-4e32-aae8-c75fa675e818', 'concluida', 'normal', 2650.0, 2650.0, 0.0, '2026-05-09', '2026-05-09', '9451cd9f-6770-4e32-aae8-c75fa675e818');
UPDATE aparelhos SET venda_id = '9879916b-09b9-4f6d-bffc-78bf00215bc8' WHERE id = 'ff7d1779-1951-49d8-bc64-d6ef27b200ad';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('150735a9-0c0a-45d5-a75d-70f9c65b95e2', '9879916b-09b9-4f6d-bffc-78bf00215bc8', 'pix', 2650.0, '2026-05-09', '9451cd9f-6770-4e32-aae8-c75fa675e818', 1, '2026-05-09T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('e9e57d7a-3f16-4224-a7fd-0cc64de5ae2e', 1, '9879916b-09b9-4f6d-bffc-78bf00215bc8', 'Brinde', 75.0, '2026-05-09', '9451cd9f-6770-4e32-aae8-c75fa675e818', '2026-05-09');

-- LINHA 93 [NAO]: IPHONE 15 AZUL NOVO (09/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('73c22207-c35e-4313-a77b-6bd5f2598799', 'Apple', 'IPHONE 15 AZUL NOVO', '355225774481521', 4000.0, 3600.0, 19, 'novo', 'perfeito', 'vendido', '2026-05-09', '2026-05-09', '85743f3e-1b32-49c0-9d9e-c16afd690f7d', '2026-05-09', '2026-05-09', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('10173a19-24e8-4608-a088-540788a4b629', current_setting('importacao.proximo_numero')::int + 90, current_setting('importacao.cliente_id')::uuid, 19, '85743f3e-1b32-49c0-9d9e-c16afd690f7d', 'concluida', 'normal', 4000.0, 4000.0, 0.0, '2026-05-09', '2026-05-09', '85743f3e-1b32-49c0-9d9e-c16afd690f7d');
UPDATE aparelhos SET venda_id = '10173a19-24e8-4608-a088-540788a4b629' WHERE id = '73c22207-c35e-4313-a77b-6bd5f2598799';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('c24c816c-95a1-4e2b-91c5-35f0abb40ab7', '10173a19-24e8-4608-a088-540788a4b629', 'pix', 2400.0, '2026-05-09', '85743f3e-1b32-49c0-9d9e-c16afd690f7d', 1, '2026-05-09T14:00:00');
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, observacao, parcelas, criado_em)
VALUES ('698cf80f-9fa6-4735-b71e-2512e9583752', '10173a19-24e8-4608-a088-540788a4b629', 'troca_aparelho', 1600.0, '2026-05-09', '85743f3e-1b32-49c0-9d9e-c16afd690f7d', 'Troca: IPHONE 13', 1, '2026-05-09T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('b0afedf6-dd7d-4b9b-85a4-1c84a3a39992', 19, '10173a19-24e8-4608-a088-540788a4b629', 'Brinde', 15.0, '2026-05-09', '85743f3e-1b32-49c0-9d9e-c16afd690f7d', '2026-05-09');

-- LINHA 94 [SIM]: IPHONE 17E ROSA 256GB NOVO (09/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('2ff5b8b6-14ce-4c83-9f06-b697ee079b8b', 'Apple', 'IPHONE 17E ROSA 256GB NOVO', '357457921078326', 3950.0, 3650.0, 20, 'novo', 'perfeito', 'vendido', '2026-05-09', '2026-05-09', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', '2026-05-09', '2026-05-09', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('d7295c2a-8ad7-4282-b748-51664ce324dc', current_setting('importacao.proximo_numero')::int + 91, current_setting('importacao.cliente_id')::uuid, 20, 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 'concluida', 'normal', 3950.0, 3950.0, 0.0, '2026-05-09', '2026-05-09', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4');
UPDATE aparelhos SET venda_id = 'd7295c2a-8ad7-4282-b748-51664ce324dc' WHERE id = '2ff5b8b6-14ce-4c83-9f06-b697ee079b8b';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('9aa1fd61-8c16-4f88-87e6-9f61f522af50', 'd7295c2a-8ad7-4282-b748-51664ce324dc', 'pix', 3950.0, '2026-05-09', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 1, '2026-05-09T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('ac30afec-5a07-4f52-be44-caaa3b6bbef3', 20, 'd7295c2a-8ad7-4282-b748-51664ce324dc', 'Brinde', 15.0, '2026-05-09', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', '2026-05-09');

-- LINHA 95 [NAO]: X8 PRO 256GB PRETO NOVO (09/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('d7a89f98-9284-40ab-898c-99701545244f', 'Outros', 'X8 PRO 256GB PRETO NOVO', '866132085655102', 2100.0, 1900.0, 20, 'novo', 'perfeito', 'vendido', '2026-05-09', '2026-05-09', '0dd2c938-c6dd-4f5d-aac5-ed045ee5d2fb', '2026-05-09', '2026-05-09', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('554eaf60-134f-47ec-b14a-d090244f360f', current_setting('importacao.proximo_numero')::int + 92, current_setting('importacao.cliente_id')::uuid, 20, '0dd2c938-c6dd-4f5d-aac5-ed045ee5d2fb', 'concluida', 'normal', 2100.0, 2100.0, 0.0, '2026-05-09', '2026-05-09', '0dd2c938-c6dd-4f5d-aac5-ed045ee5d2fb');
UPDATE aparelhos SET venda_id = '554eaf60-134f-47ec-b14a-d090244f360f' WHERE id = 'd7a89f98-9284-40ab-898c-99701545244f';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('939dcb4f-db1b-40f4-a6b9-42da281eb5e3', '554eaf60-134f-47ec-b14a-d090244f360f', 'pix', 2100.0, '2026-05-09', '0dd2c938-c6dd-4f5d-aac5-ed045ee5d2fb', 1, '2026-05-09T14:00:00');

-- LINHA 96 [NAO]: IPHONE 15 PRO MAX 256GB NATURAL SEMINOVO (09/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('b5b1d6c7-3745-4ce9-90e0-db0f6f53dba2', 'Apple', 'IPHONE 15 PRO MAX 256GB NATURAL SEMINOVO', '356511211655440', 4150.0, 3950.0, 1, 'seminovo', 'bom', 'vendido', '2026-05-09', '2026-05-09', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-09', '2026-05-09', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('49eeae37-6728-42db-b6e7-a3d79a1647b4', current_setting('importacao.proximo_numero')::int + 93, current_setting('importacao.cliente_id')::uuid, 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 4150.0, 4150.0, 0.0, '2026-05-09', '2026-05-09', '85e3aa42-b9af-49b8-a72a-64e9c337aa53');
UPDATE aparelhos SET venda_id = '49eeae37-6728-42db-b6e7-a3d79a1647b4' WHERE id = 'b5b1d6c7-3745-4ce9-90e0-db0f6f53dba2';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('ff99a340-8e36-41ba-926a-ff353670841d', '49eeae37-6728-42db-b6e7-a3d79a1647b4', 'pix', 4150.0, '2026-05-09', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 1, '2026-05-09T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('35ea3576-71f7-4627-bddf-c5b23a18917a', 1, '49eeae37-6728-42db-b6e7-a3d79a1647b4', 'Brinde', 25.0, '2026-05-09', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-09');

-- LINHA 97 [NAO]: IPHONE 17 PRO MAX 256GB SILVER NOVO (09/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('3b136b57-ccb9-467c-879f-611dc9a92408', 'Apple', 'IPHONE 17 PRO MAX 256GB SILVER NOVO', '351668140692723', 8618.0, 8350.0, 1, 'novo', 'perfeito', 'vendido', '2026-05-09', '2026-05-09', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-09', '2026-05-09', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('49c5ee61-d0b0-44d0-9f84-8dcf60ea7479', current_setting('importacao.proximo_numero')::int + 94, current_setting('importacao.cliente_id')::uuid, 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 8618.0, 8618.0, 0.0, '2026-05-09', '2026-05-09', '85e3aa42-b9af-49b8-a72a-64e9c337aa53');
UPDATE aparelhos SET venda_id = '49c5ee61-d0b0-44d0-9f84-8dcf60ea7479' WHERE id = '3b136b57-ccb9-467c-879f-611dc9a92408';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('0ea32550-0df9-44f1-bd04-a5ab3aface02', '49c5ee61-d0b0-44d0-9f84-8dcf60ea7479', 'pix', 6618.0, '2026-05-09', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 1, '2026-05-09T14:00:00');
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, observacao, parcelas, criado_em)
VALUES ('5ec33730-77bb-4f75-a89d-addab3a3bc85', '49c5ee61-d0b0-44d0-9f84-8dcf60ea7479', 'troca_aparelho', 2000.0, '2026-05-09', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'Troca: IPH 13 PRO 256GB VERDE', 1, '2026-05-09T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('91eac962-be8d-4747-bffb-03e73a6e2948', 1, '49c5ee61-d0b0-44d0-9f84-8dcf60ea7479', 'Brinde', 10.0, '2026-05-09', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-09');

-- LINHA 98 [NAO]: IPHONE 15 PRO MAX 256GB AZUL SEMINOVO (09/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('ef738e04-8829-4f1e-b2f2-4b58476b4ed4', 'Apple', 'IPHONE 15 PRO MAX 256GB AZUL SEMINOVO', '350278026556389', 4300.0, 3950.0, 20, 'seminovo', 'bom', 'vendido', '2026-05-09', '2026-05-09', '0dd2c938-c6dd-4f5d-aac5-ed045ee5d2fb', '2026-05-09', '2026-05-09', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('9303d0c4-0900-4822-a541-14757cb68b9a', current_setting('importacao.proximo_numero')::int + 95, current_setting('importacao.cliente_id')::uuid, 20, '0dd2c938-c6dd-4f5d-aac5-ed045ee5d2fb', 'concluida', 'normal', 4300.0, 4300.0, 0.0, '2026-05-09', '2026-05-09', '0dd2c938-c6dd-4f5d-aac5-ed045ee5d2fb');
UPDATE aparelhos SET venda_id = '9303d0c4-0900-4822-a541-14757cb68b9a' WHERE id = 'ef738e04-8829-4f1e-b2f2-4b58476b4ed4';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('7fd763c7-820c-4aed-bdf9-cc6894448fcb', '9303d0c4-0900-4822-a541-14757cb68b9a', 'pix', 3350.0, '2026-05-09', '0dd2c938-c6dd-4f5d-aac5-ed045ee5d2fb', 1, '2026-05-09T14:00:00');
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, observacao, parcelas, criado_em)
VALUES ('d43a425e-808a-44ce-9e34-83e9ef7ca597', '9303d0c4-0900-4822-a541-14757cb68b9a', 'troca_aparelho', 950.0, '2026-05-09', '0dd2c938-c6dd-4f5d-aac5-ed045ee5d2fb', 'Troca: IPHONE 12 NA COR LILAS DE 64 GB', 1, '2026-05-09T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('57d82b0f-e181-41fe-9884-c0fb77e7d507', 20, '9303d0c4-0900-4822-a541-14757cb68b9a', 'Brinde', 25.0, '2026-05-09', '0dd2c938-c6dd-4f5d-aac5-ed045ee5d2fb', '2026-05-09');

-- LINHA 99 [NAO]: IPHONE 15 PRO MAX 512GB AZUL SEMINOVO (09/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('1a7a1b29-e9c9-4ab2-91ad-84a9cddb1898', 'Apple', 'IPHONE 15 PRO MAX 512GB AZUL SEMINOVO', '356371481303415', 4550.0, 4300.0, 20, 'seminovo', 'bom', 'vendido', '2026-05-09', '2026-05-09', '25e2da5b-9e76-4388-9890-7e22efd6940d', '2026-05-09', '2026-05-09', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('9ef7c979-5da4-46b7-940f-2baa38bc7439', current_setting('importacao.proximo_numero')::int + 96, current_setting('importacao.cliente_id')::uuid, 20, '25e2da5b-9e76-4388-9890-7e22efd6940d', 'concluida', 'normal', 4550.0, 4550.0, 0.0, '2026-05-09', '2026-05-09', '25e2da5b-9e76-4388-9890-7e22efd6940d');
UPDATE aparelhos SET venda_id = '9ef7c979-5da4-46b7-940f-2baa38bc7439' WHERE id = '1a7a1b29-e9c9-4ab2-91ad-84a9cddb1898';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('e32ddec6-cb41-4ae3-94ab-36fb2e0c4e37', '9ef7c979-5da4-46b7-940f-2baa38bc7439', 'pix', 3050.0, '2026-05-09', '25e2da5b-9e76-4388-9890-7e22efd6940d', 1, '2026-05-09T14:00:00');
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, observacao, parcelas, criado_em)
VALUES ('7310bcdb-4252-477a-9671-e336d2680fd7', '9ef7c979-5da4-46b7-940f-2baa38bc7439', 'troca_aparelho', 1500.0, '2026-05-09', '25e2da5b-9e76-4388-9890-7e22efd6940d', 'Troca: IPH 13 128GB AZUL', 1, '2026-05-09T14:00:00');

-- LINHA 100 [SIM]: IPHONE 17 PRO MAX 256GB AZUL NOVO (09/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('18f4227a-f452-4705-8181-5c0e5d117255', 'Apple', 'IPHONE 17 PRO MAX 256GB AZUL NOVO', '351205742681323', 8650.0, 8250.0, 1, 'novo', 'perfeito', 'vendido', '2026-05-09', '2026-05-09', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-09', '2026-05-09', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('6eada2e1-6fce-42ad-8b00-890d963a4b2b', current_setting('importacao.proximo_numero')::int + 97, current_setting('importacao.cliente_id')::uuid, 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 8650.0, 8650.0, 0.0, '2026-05-09', '2026-05-09', '85e3aa42-b9af-49b8-a72a-64e9c337aa53');
UPDATE aparelhos SET venda_id = '6eada2e1-6fce-42ad-8b00-890d963a4b2b' WHERE id = '18f4227a-f452-4705-8181-5c0e5d117255';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('71109078-ee42-4cdc-bba5-63e65fab647b', '6eada2e1-6fce-42ad-8b00-890d963a4b2b', 'pix', 8650.0, '2026-05-09', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 1, '2026-05-09T14:00:00');

-- LINHA 101 [NAO]: IPHONE 17 PRO MAX 256GB BRANCO NOVO (09/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('059bb4fc-8a02-455e-8377-4d29f72f165d', 'Apple', 'IPHONE 17 PRO MAX 256GB BRANCO NOVO', '351205740164702', 8650.0, 8350.0, 1, 'novo', 'perfeito', 'vendido', '2026-05-09', '2026-05-09', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-09', '2026-05-09', 'Pagto junto (Aparelho 2/2, total grupo R$ 17,300)');
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('79270f1e-7b9c-4c88-907a-76c05979b4b7', current_setting('importacao.proximo_numero')::int + 98, current_setting('importacao.cliente_id')::uuid, 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 8650.0, 8650.0, 0.0, '2026-05-09', '2026-05-09', '85e3aa42-b9af-49b8-a72a-64e9c337aa53');
UPDATE aparelhos SET venda_id = '79270f1e-7b9c-4c88-907a-76c05979b4b7' WHERE id = '059bb4fc-8a02-455e-8377-4d29f72f165d';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('d183a117-254a-4e05-b4cd-9c66d1185c3f', '79270f1e-7b9c-4c88-907a-76c05979b4b7', 'pix', 3650.0, '2026-05-09', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 1, '2026-05-09T14:00:00');
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, observacao, parcelas, criado_em)
VALUES ('0f1dee61-16e8-406d-995d-5c5685391758', '79270f1e-7b9c-4c88-907a-76c05979b4b7', 'troca_aparelho', 5000.0, '2026-05-09', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'Troca: IPH 16 PRO MAX 256GB PRETO', 1, '2026-05-09T14:00:00');

-- LINHA 102 [NAO]: REDMI NOTE 15 256GB PRETO NOVO (09/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('d9b303f7-1df3-4d68-a080-8b791e7aa775', 'Xiaomi', 'REDMI NOTE 15 256GB PRETO NOVO', '862315087076260', 1302.0, 1070.0, 4, 'novo', 'perfeito', 'vendido', '2026-05-09', '2026-05-09', 'e07d4d35-1381-4d4d-914d-8382a7456fdd', '2026-05-09', '2026-05-09', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('155a4891-3552-412d-bf7a-a2f97b93865f', current_setting('importacao.proximo_numero')::int + 99, current_setting('importacao.cliente_id')::uuid, 4, 'e07d4d35-1381-4d4d-914d-8382a7456fdd', 'concluida', 'normal', 1302.0, 1302.0, 0.0, '2026-05-09', '2026-05-09', 'e07d4d35-1381-4d4d-914d-8382a7456fdd');
UPDATE aparelhos SET venda_id = '155a4891-3552-412d-bf7a-a2f97b93865f' WHERE id = 'd9b303f7-1df3-4d68-a080-8b791e7aa775';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('47b9532e-1e6b-4756-b548-b8a44ad1847b', '155a4891-3552-412d-bf7a-a2f97b93865f', 'cartao_credito', 1302.0, '2026-05-09', 'e07d4d35-1381-4d4d-914d-8382a7456fdd', 1, '2026-05-09T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('306dfc62-c02f-4b19-a8c9-6fe9aabcdc1b', 4, '155a4891-3552-412d-bf7a-a2f97b93865f', 'Brinde', 10.0, '2026-05-09', 'e07d4d35-1381-4d4d-914d-8382a7456fdd', '2026-05-09');

-- LINHA 103 [SIM]: IPHONE 16 PRO 256GB PRETO SEMINOVO (09/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('fdf4d120-7b48-4822-b54f-6742ca70c543', 'Apple', 'IPHONE 16 PRO 256GB PRETO SEMINOVO', '357234294533959', 4990.0, 4500.0, 20, 'seminovo', 'bom', 'vendido', '2026-05-09', '2026-05-09', '25e2da5b-9e76-4388-9890-7e22efd6940d', '2026-05-09', '2026-05-09', 'Troca R$ 0');
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('3ac35482-daae-46d4-9f5a-c289bb6c966e', current_setting('importacao.proximo_numero')::int + 100, current_setting('importacao.cliente_id')::uuid, 20, '25e2da5b-9e76-4388-9890-7e22efd6940d', 'concluida', 'normal', 4990.0, 4990.0, 0.0, '2026-05-09', '2026-05-09', '25e2da5b-9e76-4388-9890-7e22efd6940d');
UPDATE aparelhos SET venda_id = '3ac35482-daae-46d4-9f5a-c289bb6c966e' WHERE id = 'fdf4d120-7b48-4822-b54f-6742ca70c543';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('63f6f4e8-ef67-4c1c-87f5-ad4350de96cc', '3ac35482-daae-46d4-9f5a-c289bb6c966e', 'pix', 4990.0, '2026-05-09', '25e2da5b-9e76-4388-9890-7e22efd6940d', 1, '2026-05-09T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('8b3aaff7-464f-4f24-b2d1-5089e0482684', 20, '3ac35482-daae-46d4-9f5a-c289bb6c966e', 'Brinde', 35.0, '2026-05-09', '25e2da5b-9e76-4388-9890-7e22efd6940d', '2026-05-09');

-- LINHA 104 [NAO]: IPHONE 17 256GB AZUL LACRADO (10/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('6c8abcb3-21ab-43ea-b563-889bc150a0df', 'Apple', 'IPHONE 17 256GB AZUL LACRADO', '356484794319885', 4900.0, 4800.0, 1, 'novo', 'perfeito', 'vendido', '2026-05-10', '2026-05-10', '9451cd9f-6770-4e32-aae8-c75fa675e818', '2026-05-10', '2026-05-10', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('2e7c5cd6-515a-4529-a192-691ee72fdfdf', current_setting('importacao.proximo_numero')::int + 101, current_setting('importacao.cliente_id')::uuid, 1, '9451cd9f-6770-4e32-aae8-c75fa675e818', 'concluida', 'normal', 4900.0, 4900.0, 0.0, '2026-05-10', '2026-05-10', '9451cd9f-6770-4e32-aae8-c75fa675e818');
UPDATE aparelhos SET venda_id = '2e7c5cd6-515a-4529-a192-691ee72fdfdf' WHERE id = '6c8abcb3-21ab-43ea-b563-889bc150a0df';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('cd52a667-32ee-4a3c-9916-9cda0ac2428f', '2e7c5cd6-515a-4529-a192-691ee72fdfdf', 'pix', 4900.0, '2026-05-10', '9451cd9f-6770-4e32-aae8-c75fa675e818', 1, '2026-05-10T14:00:00');

-- LINHA 105 [NAO]: IPHONE 16 PRO MAX DESERT 256GB SEMINOVO (10/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('ee4e03b1-4921-4595-bb30-5559bf55afb6', 'Apple', 'IPHONE 16 PRO MAX DESERT 256GB SEMINOVO', '358245525252036', 5248.0, 5000.0, 4, 'seminovo', 'bom', 'vendido', '2026-05-10', '2026-05-10', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-10', '2026-05-10', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('2f0f0259-64b2-42ad-916a-286235f06eed', current_setting('importacao.proximo_numero')::int + 102, current_setting('importacao.cliente_id')::uuid, 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 5248.0, 5248.0, 0.0, '2026-05-10', '2026-05-10', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
UPDATE aparelhos SET venda_id = '2f0f0259-64b2-42ad-916a-286235f06eed' WHERE id = 'ee4e03b1-4921-4595-bb30-5559bf55afb6';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('feffa8ba-d635-4c8a-befd-76871fe93000', '2f0f0259-64b2-42ad-916a-286235f06eed', 'pix', 2460.0, '2026-05-10', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1, '2026-05-10T14:00:00');
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('8e40980e-82e5-4d99-8e02-4634d3f211f9', '2f0f0259-64b2-42ad-916a-286235f06eed', 'cartao_credito', 2788.0, '2026-05-10', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1, '2026-05-10T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('d6e09cb6-3dc7-4cdf-b1bb-f8fe486b2e8c', 4, '2f0f0259-64b2-42ad-916a-286235f06eed', 'Brinde', 25.0, '2026-05-10', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-10');

-- LINHA 106 [NAO]: IPHONE 17 PRO MAX 256GB LARANJA LACRADO (10/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('7d36d914-2103-445d-9b80-a4ac96459920', 'Apple', 'IPHONE 17 PRO MAX 256GB LARANJA LACRADO', '353497859462096', 8700.0, 8250.0, 1, 'novo', 'perfeito', 'vendido', '2026-05-10', '2026-05-10', '9451cd9f-6770-4e32-aae8-c75fa675e818', '2026-05-10', '2026-05-10', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('e081300a-a5bf-4b29-ad4a-e65e95fe99ad', current_setting('importacao.proximo_numero')::int + 103, current_setting('importacao.cliente_id')::uuid, 1, '9451cd9f-6770-4e32-aae8-c75fa675e818', 'concluida', 'normal', 8700.0, 8700.0, 0.0, '2026-05-10', '2026-05-10', '9451cd9f-6770-4e32-aae8-c75fa675e818');
UPDATE aparelhos SET venda_id = 'e081300a-a5bf-4b29-ad4a-e65e95fe99ad' WHERE id = '7d36d914-2103-445d-9b80-a4ac96459920';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('7cb5f82c-c8c3-4728-9b7b-e2b5e963d62a', 'e081300a-a5bf-4b29-ad4a-e65e95fe99ad', 'pix', 8700.0, '2026-05-10', '9451cd9f-6770-4e32-aae8-c75fa675e818', 1, '2026-05-10T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('4c795d4a-fddd-4934-b681-cf89963e4e1e', 1, 'e081300a-a5bf-4b29-ad4a-e65e95fe99ad', 'Brinde', 135.0, '2026-05-10', '9451cd9f-6770-4e32-aae8-c75fa675e818', '2026-05-10');

-- LINHA 107 [SIM]: IPHONE 15 256GB PRETO SEMINOVO - GARANTIA (10/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('8661cd0e-0016-49d2-a23a-0318e0944068', 'Apple', 'IPHONE 15 256GB PRETO SEMINOVO - GARANTIA', '358388750991421', 3400.0, 2900.0, 4, 'seminovo', 'bom', 'vendido', '2026-05-10', '2026-05-10', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-10', '2026-05-10', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('038d146d-bec3-4406-8451-259d875bdd71', current_setting('importacao.proximo_numero')::int + 104, current_setting('importacao.cliente_id')::uuid, 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 3400.0, 3400.0, 0.0, '2026-05-10', '2026-05-10', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
UPDATE aparelhos SET venda_id = '038d146d-bec3-4406-8451-259d875bdd71' WHERE id = '8661cd0e-0016-49d2-a23a-0318e0944068';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('8b0ae4bc-a82b-44aa-b75e-73117e9c1665', '038d146d-bec3-4406-8451-259d875bdd71', 'pix', 3400.0, '2026-05-10', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1, '2026-05-10T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('1f1caffc-e531-4c66-894d-de00643babb5', 4, '038d146d-bec3-4406-8451-259d875bdd71', 'Brinde', 30.0, '2026-05-10', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-10');

-- LINHA 108 [NAO]: IPHONE 16 PRO MAX 256GB PRETO SEMINOVO (10/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('75fde870-31cf-47b6-ae74-03bfe3176b22', 'Apple', 'IPHONE 16 PRO MAX 256GB PRETO SEMINOVO', '358594363316795', 5500.0, 5000.0, 20, 'seminovo', 'bom', 'vendido', '2026-05-10', '2026-05-10', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', '2026-05-10', '2026-05-10', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('f48b4af8-b70d-458f-9ee2-aa72d8d8c7ba', current_setting('importacao.proximo_numero')::int + 105, current_setting('importacao.cliente_id')::uuid, 20, 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 'concluida', 'normal', 5500.0, 5500.0, 0.0, '2026-05-10', '2026-05-10', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4');
UPDATE aparelhos SET venda_id = 'f48b4af8-b70d-458f-9ee2-aa72d8d8c7ba' WHERE id = '75fde870-31cf-47b6-ae74-03bfe3176b22';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('ede89aa7-bf01-4527-ad70-bea875a09c4f', 'f48b4af8-b70d-458f-9ee2-aa72d8d8c7ba', 'pix', 3500.0, '2026-05-10', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 1, '2026-05-10T14:00:00');
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, observacao, parcelas, criado_em)
VALUES ('257f5e6b-012f-4ee1-9b40-f351d4fa06d7', 'f48b4af8-b70d-458f-9ee2-aa72d8d8c7ba', 'troca_aparelho', 2000.0, '2026-05-10', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 'Troca: IPH 14 128GB AZUL', 1, '2026-05-10T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('5fc066be-9fde-4024-af4c-11d7e5363bcb', 20, 'f48b4af8-b70d-458f-9ee2-aa72d8d8c7ba', 'Brinde', 25.0, '2026-05-10', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', '2026-05-10');

-- LINHA 109 [NAO]: IPHONE 17 PRO MAX 256GB BRANCO NOVO (10/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('0e9ed296-0f23-44d8-8386-75139c212016', 'Apple', 'IPHONE 17 PRO MAX 256GB BRANCO NOVO', '355988219563654', 8600.0, 8350.0, 20, 'novo', 'perfeito', 'vendido', '2026-05-10', '2026-05-10', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', '2026-05-10', '2026-05-10', 'Pagto junto (Aparelho 1/2, total grupo R$ 17,100)');
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('8b40b370-ddc0-4cca-b2bd-d5919e09ffc4', current_setting('importacao.proximo_numero')::int + 106, current_setting('importacao.cliente_id')::uuid, 20, 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 'concluida', 'normal', 8600.0, 8600.0, 0.0, '2026-05-10', '2026-05-10', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4');
UPDATE aparelhos SET venda_id = '8b40b370-ddc0-4cca-b2bd-d5919e09ffc4' WHERE id = '0e9ed296-0f23-44d8-8386-75139c212016';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('d9d2c012-b968-45f4-947b-553322b328d2', '8b40b370-ddc0-4cca-b2bd-d5919e09ffc4', 'cartao_credito', 4650.0, '2026-05-10', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 1, '2026-05-10T14:00:00');
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, observacao, parcelas, criado_em)
VALUES ('4473fc07-16df-4e0d-b5da-f16ec86a8023', '8b40b370-ddc0-4cca-b2bd-d5919e09ffc4', 'troca_aparelho', 3950.0, '2026-05-10', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 'Troca: IPH 15 PRO MAX 256GB BRANCO', 1, '2026-05-10T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('12113605-2740-4acb-a72e-e81c8de3b33c', 20, '8b40b370-ddc0-4cca-b2bd-d5919e09ffc4', 'Brinde', 15.0, '2026-05-10', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', '2026-05-10');

-- LINHA 110 [NAO]: IPHONE 17 PRO MAX 256GB AZUL NOVO (10/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('eaf2def1-f363-4f10-990c-99664dd22f3e', 'Apple', 'IPHONE 17 PRO MAX 256GB AZUL NOVO', '358434704613065', 8500.0, 8250.0, 20, 'novo', 'perfeito', 'vendido', '2026-05-10', '2026-05-10', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', '2026-05-10', '2026-05-10', 'Pagto junto (Aparelho 2/2, total grupo R$ 17,100)');
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('ae4ded11-0057-4276-b5e1-5be208f64d45', current_setting('importacao.proximo_numero')::int + 107, current_setting('importacao.cliente_id')::uuid, 20, 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 'concluida', 'normal', 8500.0, 8500.0, 0.0, '2026-05-10', '2026-05-10', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4');
UPDATE aparelhos SET venda_id = 'ae4ded11-0057-4276-b5e1-5be208f64d45' WHERE id = 'eaf2def1-f363-4f10-990c-99664dd22f3e';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('3528118d-ac0b-4685-b59f-9d663d3214dc', 'ae4ded11-0057-4276-b5e1-5be208f64d45', 'cartao_credito', 6850.0, '2026-05-10', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 1, '2026-05-10T14:00:00');
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, observacao, parcelas, criado_em)
VALUES ('3646b5d4-3d91-4750-ac09-06240f4b42d4', 'ae4ded11-0057-4276-b5e1-5be208f64d45', 'troca_aparelho', 1650.0, '2026-05-10', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 'Troca: IPH 13 PRO MAX 128GB', 1, '2026-05-10T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('46e964d7-278a-4e4e-b0f4-f6a23239afa4', 20, 'ae4ded11-0057-4276-b5e1-5be208f64d45', 'Brinde', 15.0, '2026-05-10', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', '2026-05-10');

-- LINHA 111 [NAO]: IPHONE 15 PRO MAX 256GB AZUL SEMINOVO (10/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('1d9115ff-a1fe-4554-b68d-bde603599de2', 'Apple', 'IPHONE 15 PRO MAX 256GB AZUL SEMINOVO', '356371484863977', 4150.0, 4050.0, 20, 'seminovo', 'bom', 'vendido', '2026-05-10', '2026-05-10', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', '2026-05-10', '2026-05-10', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('7dbe1410-81d0-4301-b891-6316bf0fe804', current_setting('importacao.proximo_numero')::int + 108, current_setting('importacao.cliente_id')::uuid, 20, 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 'concluida', 'normal', 4150.0, 4150.0, 0.0, '2026-05-10', '2026-05-10', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4');
UPDATE aparelhos SET venda_id = '7dbe1410-81d0-4301-b891-6316bf0fe804' WHERE id = '1d9115ff-a1fe-4554-b68d-bde603599de2';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('0768c987-61d1-4773-9ba3-ee467b0a5b7b', '7dbe1410-81d0-4301-b891-6316bf0fe804', 'pix', 4150.0, '2026-05-10', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 1, '2026-05-10T14:00:00');

-- LINHA 112 [NAO]: IPHONE 16 PRO 256GB DESERT SEMINOVO (10/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('d10bb2f2-6d18-408a-9b72-a16f8601369a', 'Apple', 'IPHONE 16 PRO 256GB DESERT SEMINOVO', '356295601102623', 4750.0, 4500.0, 1, 'seminovo', 'bom', 'vendido', '2026-05-10', '2026-05-10', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-10', '2026-05-10', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('792f3dd4-08b2-4777-be76-3776e7ffe3e8', current_setting('importacao.proximo_numero')::int + 109, current_setting('importacao.cliente_id')::uuid, 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 4750.0, 4750.0, 0.0, '2026-05-10', '2026-05-10', '85e3aa42-b9af-49b8-a72a-64e9c337aa53');
UPDATE aparelhos SET venda_id = '792f3dd4-08b2-4777-be76-3776e7ffe3e8' WHERE id = 'd10bb2f2-6d18-408a-9b72-a16f8601369a';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('edb5310d-472d-4377-9ded-6d6561cd54d3', '792f3dd4-08b2-4777-be76-3776e7ffe3e8', 'pix', 4750.0, '2026-05-10', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 1, '2026-05-10T14:00:00');

-- LINHA 113 [NAO]: IPHONE 17 256GB PRETO NOVO (10/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('8bcaf3a7-f3bd-452e-8622-ed167ba6ac0c', 'Apple', 'IPHONE 17 256GB PRETO NOVO', '355559516499759', 5000.0, 4850.0, 1, 'novo', 'perfeito', 'vendido', '2026-05-10', '2026-05-10', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-10', '2026-05-10', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('664559d1-7950-457d-ac48-65627fbc213a', current_setting('importacao.proximo_numero')::int + 110, current_setting('importacao.cliente_id')::uuid, 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 5000.0, 5000.0, 0.0, '2026-05-10', '2026-05-10', '85e3aa42-b9af-49b8-a72a-64e9c337aa53');
UPDATE aparelhos SET venda_id = '664559d1-7950-457d-ac48-65627fbc213a' WHERE id = '8bcaf3a7-f3bd-452e-8622-ed167ba6ac0c';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('39a8dab2-7d2d-43d1-a2eb-f63418e6b961', '664559d1-7950-457d-ac48-65627fbc213a', 'dinheiro', 5000.0, '2026-05-10', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 1, '2026-05-10T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('1a9a1685-3c7b-44da-9669-3c275b9575ef', 1, '664559d1-7950-457d-ac48-65627fbc213a', 'Brinde', 25.0, '2026-05-10', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-10');

-- LINHA 114 [NAO]: NOTE 15 PRO 5G 256GB PRETO NOVO (10/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('c8bbd7e2-3e19-47eb-a805-1ecc30cc2218', 'Redmi', 'NOTE 15 PRO 5G 256GB PRETO NOVO', '863573082363500', 2077.0, 1750.0, 1, 'novo', 'perfeito', 'vendido', '2026-05-10', '2026-05-10', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-10', '2026-05-10', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('7e8a7d96-fce6-450d-a62b-593430b4fc8d', current_setting('importacao.proximo_numero')::int + 111, current_setting('importacao.cliente_id')::uuid, 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 2077.0, 2077.0, 0.0, '2026-05-10', '2026-05-10', '85e3aa42-b9af-49b8-a72a-64e9c337aa53');
UPDATE aparelhos SET venda_id = '7e8a7d96-fce6-450d-a62b-593430b4fc8d' WHERE id = 'c8bbd7e2-3e19-47eb-a805-1ecc30cc2218';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('555ae1f1-2971-4b88-a7ce-9a287b979d1b', '7e8a7d96-fce6-450d-a62b-593430b4fc8d', 'pix', 2077.0, '2026-05-10', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 1, '2026-05-10T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('e76b7d13-a1cc-4fe6-a57e-026c4f674c44', 1, '7e8a7d96-fce6-450d-a62b-593430b4fc8d', 'Brinde', 5.0, '2026-05-10', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-10');

-- LINHA 115 [NAO]: IPHONE 14 PRO MAX 128GB ROXO SEMINOVO (10/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('7960e6f8-8818-4dce-9994-a0bf980ac738', 'Apple', 'IPHONE 14 PRO MAX 128GB ROXO SEMINOVO', '357773240801309', 3350.0, 3150.0, 1, 'seminovo', 'bom', 'vendido', '2026-05-10', '2026-05-10', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-10', '2026-05-10', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('a29ffd2e-e73d-4bc6-91ba-f64187a966d7', current_setting('importacao.proximo_numero')::int + 112, current_setting('importacao.cliente_id')::uuid, 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 3350.0, 3350.0, 0.0, '2026-05-10', '2026-05-10', '85e3aa42-b9af-49b8-a72a-64e9c337aa53');
UPDATE aparelhos SET venda_id = 'a29ffd2e-e73d-4bc6-91ba-f64187a966d7' WHERE id = '7960e6f8-8818-4dce-9994-a0bf980ac738';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('15aaa08c-fff7-4f56-adcc-863c2a364a4d', 'a29ffd2e-e73d-4bc6-91ba-f64187a966d7', 'pix', 3350.0, '2026-05-10', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 1, '2026-05-10T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('89e1be86-a711-49a9-9495-cb669dd999cd', 1, 'a29ffd2e-e73d-4bc6-91ba-f64187a966d7', 'Brinde', 5.0, '2026-05-10', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-10');

-- LINHA 116 [NAO]: IPHONE 15 128GB AZUL NOVO (10/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('d78a399a-0451-4e73-a148-dea6262383c8', 'Apple', 'IPHONE 15 128GB AZUL NOVO', '355225773551647', 4612.0, 3700.0, 1, 'novo', 'perfeito', 'vendido', '2026-05-10', '2026-05-10', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-10', '2026-05-10', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('4b6d4e21-4244-4f29-9854-d6b60935299f', current_setting('importacao.proximo_numero')::int + 113, current_setting('importacao.cliente_id')::uuid, 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 4612.0, 4612.0, 0.0, '2026-05-10', '2026-05-10', '85e3aa42-b9af-49b8-a72a-64e9c337aa53');
UPDATE aparelhos SET venda_id = '4b6d4e21-4244-4f29-9854-d6b60935299f' WHERE id = 'd78a399a-0451-4e73-a148-dea6262383c8';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('dc18a139-6e57-42fe-8cf7-8c2c31116e62', '4b6d4e21-4244-4f29-9854-d6b60935299f', 'pix', 4612.0, '2026-05-10', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 1, '2026-05-10T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('ec0df699-146b-49db-89db-b06d88dfdb11', 1, '4b6d4e21-4244-4f29-9854-d6b60935299f', 'Brinde', 10.0, '2026-05-10', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-10');

-- LINHA 117 [NAO]: IPHONE 17 PRO MAX 256GB AZUL NOVO (10/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('5f072d30-bdd3-459f-928d-f843d9289c9d', 'Apple', 'IPHONE 17 PRO MAX 256GB AZUL NOVO', '358434708446124', 8550.0, 8250.0, 1, 'novo', 'perfeito', 'vendido', '2026-05-10', '2026-05-10', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-10', '2026-05-10', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('ea36aafd-cf31-4c30-ac2d-cd166251af59', current_setting('importacao.proximo_numero')::int + 114, current_setting('importacao.cliente_id')::uuid, 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 8550.0, 8550.0, 0.0, '2026-05-10', '2026-05-10', '85e3aa42-b9af-49b8-a72a-64e9c337aa53');
UPDATE aparelhos SET venda_id = 'ea36aafd-cf31-4c30-ac2d-cd166251af59' WHERE id = '5f072d30-bdd3-459f-928d-f843d9289c9d';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('8bd1b271-5b18-4dae-b4a7-7c631b919ef1', 'ea36aafd-cf31-4c30-ac2d-cd166251af59', 'pix', 6700.0, '2026-05-10', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 1, '2026-05-10T14:00:00');
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, observacao, parcelas, criado_em)
VALUES ('93d7faa4-7185-4142-9e97-de286fce6115', 'ea36aafd-cf31-4c30-ac2d-cd166251af59', 'troca_aparelho', 1850.0, '2026-05-10', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'Troca: IPH 12 PRO MAX 128GB AZUL', 1, '2026-05-10T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('17240a27-3bd3-49b4-95b5-2ab8b4db2dc9', 1, 'ea36aafd-cf31-4c30-ac2d-cd166251af59', 'Brinde', 10.0, '2026-05-10', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-10');

-- LINHA 118 [NAO]: IPHONE 15 PRO 256GB NATURAL SEMINOVO (10/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('2ab57bd2-fd09-4928-afb5-bd1d0e1cd134', 'Apple', 'IPHONE 15 PRO 256GB NATURAL SEMINOVO', '354078643177411', 3697.0, 3180.0, 20, 'seminovo', 'bom', 'vendido', '2026-05-10', '2026-05-10', '25e2da5b-9e76-4388-9890-7e22efd6940d', '2026-05-10', '2026-05-10', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('0390e38d-5f50-4805-b150-bcb62ecf8a9e', current_setting('importacao.proximo_numero')::int + 115, current_setting('importacao.cliente_id')::uuid, 20, '25e2da5b-9e76-4388-9890-7e22efd6940d', 'concluida', 'normal', 3697.0, 3697.0, 0.0, '2026-05-10', '2026-05-10', '25e2da5b-9e76-4388-9890-7e22efd6940d');
UPDATE aparelhos SET venda_id = '0390e38d-5f50-4805-b150-bcb62ecf8a9e' WHERE id = '2ab57bd2-fd09-4928-afb5-bd1d0e1cd134';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('b16ab024-f92c-4d91-91f3-a5e555846169', '0390e38d-5f50-4805-b150-bcb62ecf8a9e', 'cartao_credito', 3697.0, '2026-05-10', '25e2da5b-9e76-4388-9890-7e22efd6940d', 1, '2026-05-10T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('4d481ddf-a5ec-43aa-96fd-16d09c2ff96f', 20, '0390e38d-5f50-4805-b150-bcb62ecf8a9e', 'Brinde', 25.0, '2026-05-10', '25e2da5b-9e76-4388-9890-7e22efd6940d', '2026-05-10');

-- LINHA 119 [NAO]: IPHONE 17 256GB BRANCO NOVO (10/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('028f044a-34d8-4bb7-8bcf-3bfeda10e325', 'Apple', 'IPHONE 17 256GB BRANCO NOVO', '350418055419998', 5430.0, 4900.0, 19, 'novo', 'perfeito', 'vendido', '2026-05-10', '2026-05-10', 'b4269e60-eea2-4eba-a34d-db9591e0ec83', '2026-05-10', '2026-05-10', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('a66a72d0-0f78-4090-a2c5-ddced49ff3ae', current_setting('importacao.proximo_numero')::int + 116, current_setting('importacao.cliente_id')::uuid, 19, 'b4269e60-eea2-4eba-a34d-db9591e0ec83', 'concluida', 'normal', 5430.0, 5430.0, 0.0, '2026-05-10', '2026-05-10', 'b4269e60-eea2-4eba-a34d-db9591e0ec83');
UPDATE aparelhos SET venda_id = 'a66a72d0-0f78-4090-a2c5-ddced49ff3ae' WHERE id = '028f044a-34d8-4bb7-8bcf-3bfeda10e325';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('55233ad7-6338-4e92-bb1f-7cdad6db6d51', 'a66a72d0-0f78-4090-a2c5-ddced49ff3ae', 'pix', 5430.0, '2026-05-10', 'b4269e60-eea2-4eba-a34d-db9591e0ec83', 1, '2026-05-10T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('9878b3b9-f30e-467e-b541-cded5ef0556d', 19, 'a66a72d0-0f78-4090-a2c5-ddced49ff3ae', 'Brinde', 68.0, '2026-05-10', 'b4269e60-eea2-4eba-a34d-db9591e0ec83', '2026-05-10');

-- LINHA 120 [NAO]: POCO C85 256GB LILAS NOVO (12/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('af3b2be2-fa12-4b40-9908-83e96e71b72e', 'Outros', 'POCO C85 256GB LILAS NOVO', '864280087011840', 1200.0, 850.0, 1, 'novo', 'perfeito', 'vendido', '2026-05-12', '2026-05-12', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-12', '2026-05-12', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('c71d87fc-72ad-4fa6-a8ba-4ec067aa0a31', current_setting('importacao.proximo_numero')::int + 117, current_setting('importacao.cliente_id')::uuid, 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 1200.0, 1200.0, 0.0, '2026-05-12', '2026-05-12', '85e3aa42-b9af-49b8-a72a-64e9c337aa53');
UPDATE aparelhos SET venda_id = 'c71d87fc-72ad-4fa6-a8ba-4ec067aa0a31' WHERE id = 'af3b2be2-fa12-4b40-9908-83e96e71b72e';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('fc84d071-5ba3-48d9-8e7e-87abef02ab73', 'c71d87fc-72ad-4fa6-a8ba-4ec067aa0a31', 'pix', 1200.0, '2026-05-12', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 1, '2026-05-12T14:00:00');

-- LINHA 121 [NAO]: REALME NOTE 60X 128GB PRETO NOVO (12/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('7fe81e52-e899-4f71-845b-2aa650a5abbe', 'Realme', 'REALME NOTE 60X 128GB PRETO NOVO', '862505072816619', 720.0, 615.0, 19, 'novo', 'perfeito', 'vendido', '2026-05-12', '2026-05-12', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-12', '2026-05-12', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('062d1234-6bda-4acc-819c-2f1ddf585732', current_setting('importacao.proximo_numero')::int + 118, current_setting('importacao.cliente_id')::uuid, 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 720.0, 720.0, 0.0, '2026-05-12', '2026-05-12', '97f12885-87ad-426a-8bbb-656889d82e10');
UPDATE aparelhos SET venda_id = '062d1234-6bda-4acc-819c-2f1ddf585732' WHERE id = '7fe81e52-e899-4f71-845b-2aa650a5abbe';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('3b54e4dc-e6d5-43e8-a93a-0a05b483c337', '062d1234-6bda-4acc-819c-2f1ddf585732', 'cartao_credito', 720.0, '2026-05-12', '97f12885-87ad-426a-8bbb-656889d82e10', 1, '2026-05-12T14:00:00');

-- LINHA 122 [NAO]: IPHONE 17 PRO SILVER SEMINOVO (13/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('59495690-9c45-4a6a-b272-2666ede2d249', 'Apple', 'IPHONE 17 PRO SILVER SEMINOVO', '355500351194584', 6900.0, 6350.0, 19, 'seminovo', 'bom', 'vendido', '2026-05-13', '2026-05-13', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-13', '2026-05-13', 'Pagto junto (Aparelho 1/2, total grupo R$ 8,850)');
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('dc9ccc88-56a3-493a-8a72-507a333eb831', current_setting('importacao.proximo_numero')::int + 119, current_setting('importacao.cliente_id')::uuid, 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 6900.0, 6900.0, 0.0, '2026-05-13', '2026-05-13', '97f12885-87ad-426a-8bbb-656889d82e10');
UPDATE aparelhos SET venda_id = 'dc9ccc88-56a3-493a-8a72-507a333eb831' WHERE id = '59495690-9c45-4a6a-b272-2666ede2d249';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('3f7d1e56-4dee-45d4-a976-150cbcbcd607', 'dc9ccc88-56a3-493a-8a72-507a333eb831', 'pix', 6900.0, '2026-05-13', '97f12885-87ad-426a-8bbb-656889d82e10', 1, '2026-05-13T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('cb8fdf98-5260-470d-8bd4-e6640515399b', 19, 'dc9ccc88-56a3-493a-8a72-507a333eb831', 'Brinde', 50.0, '2026-05-13', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-13');

-- LINHA 123 [NAO]: APPLE WATCH SE 3 STARLIGHT NOVO (13/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('c7376a45-fe72-4a7a-88aa-f51b9e6fbfab', 'Apple', 'APPLE WATCH SE 3 STARLIGHT NOVO', 'D23PC63DYY', 1950.0, 1750.0, 19, 'novo', 'perfeito', 'vendido', '2026-05-13', '2026-05-13', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-13', '2026-05-13', 'Pagto junto (Aparelho 2/2, total grupo R$ 8,850)');
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('55085b21-a604-4ead-904c-141abbbd6f83', current_setting('importacao.proximo_numero')::int + 120, current_setting('importacao.cliente_id')::uuid, 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 1950.0, 1950.0, 0.0, '2026-05-13', '2026-05-13', '97f12885-87ad-426a-8bbb-656889d82e10');
UPDATE aparelhos SET venda_id = '55085b21-a604-4ead-904c-141abbbd6f83' WHERE id = 'c7376a45-fe72-4a7a-88aa-f51b9e6fbfab';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('603b5d28-1ef9-44d8-929c-8af3671432e5', '55085b21-a604-4ead-904c-141abbbd6f83', 'pix', 1950.0, '2026-05-13', '97f12885-87ad-426a-8bbb-656889d82e10', 1, '2026-05-13T14:00:00');

-- LINHA 124 [NAO]: POCO C85 256GB PRETO LACRADO (13/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('e1b3eddb-92d0-4abd-bc17-fde1fc80dbe0', 'Outros', 'POCO C85 256GB PRETO LACRADO', '861260081088468', 1000.0, 870.0, 1, 'novo', 'perfeito', 'vendido', '2026-05-13', '2026-05-13', '9451cd9f-6770-4e32-aae8-c75fa675e818', '2026-05-13', '2026-05-13', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('67ce6ec5-c7f2-4d45-8c2e-236ec597d169', current_setting('importacao.proximo_numero')::int + 121, current_setting('importacao.cliente_id')::uuid, 1, '9451cd9f-6770-4e32-aae8-c75fa675e818', 'concluida', 'normal', 1000.0, 1000.0, 0.0, '2026-05-13', '2026-05-13', '9451cd9f-6770-4e32-aae8-c75fa675e818');
UPDATE aparelhos SET venda_id = '67ce6ec5-c7f2-4d45-8c2e-236ec597d169' WHERE id = 'e1b3eddb-92d0-4abd-bc17-fde1fc80dbe0';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('aaeb24d8-73cc-4a4d-9e77-f90d8f40fcbb', '67ce6ec5-c7f2-4d45-8c2e-236ec597d169', 'pix', 1000.0, '2026-05-13', '9451cd9f-6770-4e32-aae8-c75fa675e818', 1, '2026-05-13T14:00:00');

-- LINHA 125 [NAO]: IPHONE 16 PRO MAX 256GB PRETO SEMINOVO (13/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('f99056eb-567e-44d8-a58c-45391d04b1be', 'Apple', 'IPHONE 16 PRO MAX 256GB PRETO SEMINOVO', '357205984783526', 5270.0, 5000.0, 4, 'seminovo', 'bom', 'vendido', '2026-05-13', '2026-05-13', 'e07d4d35-1381-4d4d-914d-8382a7456fdd', '2026-05-13', '2026-05-13', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('1b9e0ec2-7cbc-4a0d-ae04-b3fe923145f5', current_setting('importacao.proximo_numero')::int + 122, current_setting('importacao.cliente_id')::uuid, 4, 'e07d4d35-1381-4d4d-914d-8382a7456fdd', 'concluida', 'normal', 5270.0, 5270.0, 0.0, '2026-05-13', '2026-05-13', 'e07d4d35-1381-4d4d-914d-8382a7456fdd');
UPDATE aparelhos SET venda_id = '1b9e0ec2-7cbc-4a0d-ae04-b3fe923145f5' WHERE id = 'f99056eb-567e-44d8-a58c-45391d04b1be';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('6eed9c56-f051-42e7-8ca2-2ddf53703205', '1b9e0ec2-7cbc-4a0d-ae04-b3fe923145f5', 'pix', 5270.0, '2026-05-13', 'e07d4d35-1381-4d4d-914d-8382a7456fdd', 1, '2026-05-13T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('0b5cea1a-eda3-4ec7-add7-562fcbe8022c', 4, '1b9e0ec2-7cbc-4a0d-ae04-b3fe923145f5', 'Brinde', 25.0, '2026-05-13', 'e07d4d35-1381-4d4d-914d-8382a7456fdd', '2026-05-13');

-- LINHA 126 [NAO]: IPHONE 15 PRO SEMINOVO NATURAL 128GB (13/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('737860d5-d93c-4f67-bead-73a7c4aa6c0c', 'Apple', 'IPHONE 15 PRO SEMINOVO NATURAL 128GB', '355262962390305', 3706.0, 3100.0, 4, 'seminovo', 'bom', 'vendido', '2026-05-13', '2026-05-13', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-13', '2026-05-13', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('62e78384-a6a9-4c71-8fed-0762b55c23f7', current_setting('importacao.proximo_numero')::int + 123, current_setting('importacao.cliente_id')::uuid, 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 3706.0, 3706.0, 0.0, '2026-05-13', '2026-05-13', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
UPDATE aparelhos SET venda_id = '62e78384-a6a9-4c71-8fed-0762b55c23f7' WHERE id = '737860d5-d93c-4f67-bead-73a7c4aa6c0c';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('f9b0b2b6-fb57-4006-9d6a-f52f593e26be', '62e78384-a6a9-4c71-8fed-0762b55c23f7', 'cartao_credito', 3706.0, '2026-05-13', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1, '2026-05-13T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('ae3137bd-250d-4a62-8a80-8563374e74c7', 4, '62e78384-a6a9-4c71-8fed-0762b55c23f7', 'Brinde', 25.0, '2026-05-13', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-13');

-- LINHA 127 [NAO]: IPHONE 14 128GB BRANCO SEMINOVO (13/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('bbd86083-4119-4053-987e-675ed12e280d', 'Apple', 'IPHONE 14 128GB BRANCO SEMINOVO', '357950903092463', 2250.0, 2050.0, 20, 'seminovo', 'bom', 'vendido', '2026-05-13', '2026-05-13', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', '2026-05-13', '2026-05-13', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('1ea90444-8cc1-40c5-a973-9860b88292d5', current_setting('importacao.proximo_numero')::int + 124, current_setting('importacao.cliente_id')::uuid, 20, 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 'concluida', 'normal', 2250.0, 2250.0, 0.0, '2026-05-13', '2026-05-13', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4');
UPDATE aparelhos SET venda_id = '1ea90444-8cc1-40c5-a973-9860b88292d5' WHERE id = 'bbd86083-4119-4053-987e-675ed12e280d';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('1206c6ae-1d77-4e39-8304-d25810c21f48', '1ea90444-8cc1-40c5-a973-9860b88292d5', 'dinheiro', 2250.0, '2026-05-13', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 1, '2026-05-13T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('603df77f-f882-4c19-9601-744e38cfa78b', 20, '1ea90444-8cc1-40c5-a973-9860b88292d5', 'Brinde', 5.0, '2026-05-13', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', '2026-05-13');

-- LINHA 128 [NAO]: IPHONE 14 128GB BRANCO SEMINOVO (13/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('3d8afdb4-6867-4745-90ec-1d24db2fdd45', 'Apple', 'IPHONE 14 128GB BRANCO SEMINOVO', '354807372557538', 2409.0, 2050.0, 20, 'seminovo', 'bom', 'vendido', '2026-05-13', '2026-05-13', '25e2da5b-9e76-4388-9890-7e22efd6940d', '2026-05-13', '2026-05-13', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('da4292e6-f080-4e0a-8cd4-6aaee3d99b34', current_setting('importacao.proximo_numero')::int + 125, current_setting('importacao.cliente_id')::uuid, 20, '25e2da5b-9e76-4388-9890-7e22efd6940d', 'concluida', 'normal', 2409.0, 2409.0, 0.0, '2026-05-13', '2026-05-13', '25e2da5b-9e76-4388-9890-7e22efd6940d');
UPDATE aparelhos SET venda_id = 'da4292e6-f080-4e0a-8cd4-6aaee3d99b34' WHERE id = '3d8afdb4-6867-4745-90ec-1d24db2fdd45';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('6ca518da-5d48-4c58-a250-550a82eb6107', 'da4292e6-f080-4e0a-8cd4-6aaee3d99b34', 'cartao_credito', 2409.0, '2026-05-13', '25e2da5b-9e76-4388-9890-7e22efd6940d', 1, '2026-05-13T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('b9cce420-894d-44b1-bc9f-307d83d5069e', 20, 'da4292e6-f080-4e0a-8cd4-6aaee3d99b34', 'Brinde', 45.0, '2026-05-13', '25e2da5b-9e76-4388-9890-7e22efd6940d', '2026-05-13');

-- LINHA 129 [SIM]: REDMI 15C 256GB PRETO  NOVO (13/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('7b67a14a-ff4d-4a70-93db-e27efd5f4a5f', 'Xiaomi', 'REDMI 15C 256GB PRETO  NOVO', '867754088428267', 1000.0, 840.0, 19, 'novo', 'perfeito', 'vendido', '2026-05-13', '2026-05-13', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-13', '2026-05-13', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('f5fbf661-972b-49ce-bc91-d3782f04a3e0', current_setting('importacao.proximo_numero')::int + 126, current_setting('importacao.cliente_id')::uuid, 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 1000.0, 1000.0, 0.0, '2026-05-13', '2026-05-13', '97f12885-87ad-426a-8bbb-656889d82e10');
UPDATE aparelhos SET venda_id = 'f5fbf661-972b-49ce-bc91-d3782f04a3e0' WHERE id = '7b67a14a-ff4d-4a70-93db-e27efd5f4a5f';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('b9ccc4dd-15fe-42b1-8e4a-b3e414fed093', 'f5fbf661-972b-49ce-bc91-d3782f04a3e0', 'pix', 1000.0, '2026-05-13', '97f12885-87ad-426a-8bbb-656889d82e10', 1, '2026-05-13T14:00:00');

-- LINHA 130 [NAO]: IPHONE 17 PRO MAX 512GB AZUL NOVO (13/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('0ebe61bf-4517-48b0-8ad6-e9019dc9d94a', 'Apple', 'IPHONE 17 PRO MAX 512GB AZUL NOVO', '357247250248784', 10242.0, 9050.0, 1, 'novo', 'perfeito', 'vendido', '2026-05-13', '2026-05-13', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-13', '2026-05-13', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('28a74a8b-ee63-4ef6-a0d1-02d46a6a44a7', current_setting('importacao.proximo_numero')::int + 127, current_setting('importacao.cliente_id')::uuid, 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 10242.0, 10242.0, 0.0, '2026-05-13', '2026-05-13', '85e3aa42-b9af-49b8-a72a-64e9c337aa53');
UPDATE aparelhos SET venda_id = '28a74a8b-ee63-4ef6-a0d1-02d46a6a44a7' WHERE id = '0ebe61bf-4517-48b0-8ad6-e9019dc9d94a';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('c7a69a41-e1b8-4adf-8eb8-541077b2e157', '28a74a8b-ee63-4ef6-a0d1-02d46a6a44a7', 'pix', 5242.0, '2026-05-13', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 1, '2026-05-13T14:00:00');
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, observacao, parcelas, criado_em)
VALUES ('8d662051-974e-4dbd-a472-f3a87306cdeb', '28a74a8b-ee63-4ef6-a0d1-02d46a6a44a7', 'troca_aparelho', 5000.0, '2026-05-13', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'Troca: IPH 16 PRO MAX 512GB PRETO', 1, '2026-05-13T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('a0e04b01-0d31-4295-90a4-1d37c50b0eb8', 1, '28a74a8b-ee63-4ef6-a0d1-02d46a6a44a7', 'Brinde', 60.0, '2026-05-13', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-13');

-- LINHA 131 [NAO]: BOOMBOX 4 LARANJA NOVO (14/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('37306092-0cd6-4f0d-8e92-261b9934a9a9', 'Outros', 'BOOMBOX 4 LARANJA NOVO', 'TL1937-BQ0009616', 2500.0, 2390.0, 4, 'novo', 'perfeito', 'vendido', '2026-05-14', '2026-05-14', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-14', '2026-05-14', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('d78491da-1470-4be0-8118-ed41ff3987c8', current_setting('importacao.proximo_numero')::int + 128, current_setting('importacao.cliente_id')::uuid, 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 2500.0, 2500.0, 0.0, '2026-05-14', '2026-05-14', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
UPDATE aparelhos SET venda_id = 'd78491da-1470-4be0-8118-ed41ff3987c8' WHERE id = '37306092-0cd6-4f0d-8e92-261b9934a9a9';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('d224ddc6-a306-4c87-a070-b6dffc47495d', 'd78491da-1470-4be0-8118-ed41ff3987c8', 'pix', 2500.0, '2026-05-14', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1, '2026-05-14T14:00:00');

-- LINHA 132 [NAO]: IPHONE 14 PRO MAX 256GB ROXO SEMINOVO (14/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('abbcc6d7-21e9-467a-9298-bbf180809e3a', 'Apple', 'IPHONE 14 PRO MAX 256GB ROXO SEMINOVO', '357173348275037', 3600.0, 3200.0, 4, 'seminovo', 'bom', 'vendido', '2026-05-14', '2026-05-14', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-14', '2026-05-14', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('8c9845c0-49aa-44d3-b504-6ba284831163', current_setting('importacao.proximo_numero')::int + 129, current_setting('importacao.cliente_id')::uuid, 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 3600.0, 3600.0, 0.0, '2026-05-14', '2026-05-14', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
UPDATE aparelhos SET venda_id = '8c9845c0-49aa-44d3-b504-6ba284831163' WHERE id = 'abbcc6d7-21e9-467a-9298-bbf180809e3a';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('fcaa11ea-f29f-4055-86a2-08e1df666e26', '8c9845c0-49aa-44d3-b504-6ba284831163', 'pix', 800.0, '2026-05-14', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1, '2026-05-14T14:00:00');
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('21520c4d-96b4-4300-9ab2-13cb46e3f27f', '8c9845c0-49aa-44d3-b504-6ba284831163', 'cartao_credito', 2800.0, '2026-05-14', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1, '2026-05-14T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('85d9c8e4-4993-4edc-9fc5-3102b0f750d6', 4, '8c9845c0-49aa-44d3-b504-6ba284831163', 'Brinde', 25.0, '2026-05-14', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-14');

-- LINHA 133 [NAO]: NOTE 13 5G 256GB PRETO NOVO (14/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('09ba4ab2-1249-495a-b312-1323075344b4', 'Redmi', 'NOTE 13 5G 256GB PRETO NOVO', '860698079480943', 1050.0, 950.0, 19, 'novo', 'perfeito', 'vendido', '2026-05-14', '2026-05-14', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-14', '2026-05-14', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('dd85426f-4d58-40d8-b4b6-7e6ea78b6007', current_setting('importacao.proximo_numero')::int + 130, current_setting('importacao.cliente_id')::uuid, 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 1050.0, 1050.0, 0.0, '2026-05-14', '2026-05-14', '97f12885-87ad-426a-8bbb-656889d82e10');
UPDATE aparelhos SET venda_id = 'dd85426f-4d58-40d8-b4b6-7e6ea78b6007' WHERE id = '09ba4ab2-1249-495a-b312-1323075344b4';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('01a113fd-df36-4fc8-aa7b-457527f031dd', 'dd85426f-4d58-40d8-b4b6-7e6ea78b6007', 'pix', 1050.0, '2026-05-14', '97f12885-87ad-426a-8bbb-656889d82e10', 1, '2026-05-14T14:00:00');

-- LINHA 134 [NAO]: TAB S6 LITE 128GB SEMINOVO PRETO (14/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('e1facd45-9496-4d0a-a157-68bd6170ba16', 'Outros', 'TAB S6 LITE 128GB SEMINOVO PRETO', '355835400444618', 1350.0, 900.0, 19, 'seminovo', 'bom', 'vendido', '2026-05-14', '2026-05-14', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-14', '2026-05-14', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('77d210ec-2087-40cc-b2f5-69e04781cf12', current_setting('importacao.proximo_numero')::int + 131, current_setting('importacao.cliente_id')::uuid, 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 1350.0, 1350.0, 0.0, '2026-05-14', '2026-05-14', '97f12885-87ad-426a-8bbb-656889d82e10');
UPDATE aparelhos SET venda_id = '77d210ec-2087-40cc-b2f5-69e04781cf12' WHERE id = 'e1facd45-9496-4d0a-a157-68bd6170ba16';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('266811b2-f163-41fb-9237-b485a65ddc97', '77d210ec-2087-40cc-b2f5-69e04781cf12', 'pix', 200.0, '2026-05-14', '97f12885-87ad-426a-8bbb-656889d82e10', 1, '2026-05-14T14:00:00');
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('3810294f-2bc1-4b24-85e0-914b7efd198d', '77d210ec-2087-40cc-b2f5-69e04781cf12', 'cartao_credito', 1150.0, '2026-05-14', '97f12885-87ad-426a-8bbb-656889d82e10', 1, '2026-05-14T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('665ed9ab-5157-432a-b9c2-588a8f8cc1c6', 19, '77d210ec-2087-40cc-b2f5-69e04781cf12', 'Brinde', 20.0, '2026-05-14', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-14');

-- LINHA 135 [NAO]: IPHONE 16 PRO MAX 256GB PRETO SEMINOVO (14/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('3f9301ff-10d1-4d93-a449-fa0846e57fc8', 'Apple', 'IPHONE 16 PRO MAX 256GB PRETO SEMINOVO', '355706423711715', 5300.0, 5000.0, 20, 'seminovo', 'bom', 'vendido', '2026-05-14', '2026-05-14', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', '2026-05-14', '2026-05-14', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('601fbbb3-adb4-4e79-b738-1082c1464c92', current_setting('importacao.proximo_numero')::int + 132, current_setting('importacao.cliente_id')::uuid, 20, 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 'concluida', 'normal', 5300.0, 5300.0, 0.0, '2026-05-14', '2026-05-14', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4');
UPDATE aparelhos SET venda_id = '601fbbb3-adb4-4e79-b738-1082c1464c92' WHERE id = '3f9301ff-10d1-4d93-a449-fa0846e57fc8';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('a7c8c20d-e3dc-42e1-a6b7-0766bf2cbed0', '601fbbb3-adb4-4e79-b738-1082c1464c92', 'pix', 3800.0, '2026-05-14', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 1, '2026-05-14T14:00:00');
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, observacao, parcelas, criado_em)
VALUES ('19ac343b-38f1-4b9a-aab5-6afce6a966b3', '601fbbb3-adb4-4e79-b738-1082c1464c92', 'troca_aparelho', 1500.0, '2026-05-14', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 'Troca: IPH 13 128GB BRANCO', 1, '2026-05-14T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('b64f5168-0674-4481-bf22-4a7cd7acf2dd', 20, '601fbbb3-adb4-4e79-b738-1082c1464c92', 'Brinde', 8.0, '2026-05-14', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', '2026-05-14');

-- LINHA 136 [NAO]: IPHONE 14 PRO 128GB PRETO SEMINOVO (14/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('13e190f3-7964-4e87-80b2-fcc8ed97dd00', 'Apple', 'IPHONE 14 PRO 128GB PRETO SEMINOVO', '357442883839907', 2910.0, 2700.0, 20, 'seminovo', 'bom', 'vendido', '2026-05-14', '2026-05-14', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', '2026-05-14', '2026-05-14', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('1b8a3346-66da-4289-a354-5c30b2d3b566', current_setting('importacao.proximo_numero')::int + 133, current_setting('importacao.cliente_id')::uuid, 20, 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 'concluida', 'normal', 2910.0, 2910.0, 0.0, '2026-05-14', '2026-05-14', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4');
UPDATE aparelhos SET venda_id = '1b8a3346-66da-4289-a354-5c30b2d3b566' WHERE id = '13e190f3-7964-4e87-80b2-fcc8ed97dd00';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('bcfbebb6-f8ba-4199-8d50-7669509001bf', '1b8a3346-66da-4289-a354-5c30b2d3b566', 'pix', 2710.0, '2026-05-14', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 1, '2026-05-14T14:00:00');
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('4f788e79-85c8-4adb-96e2-535218d09693', '1b8a3346-66da-4289-a354-5c30b2d3b566', 'dinheiro', 200.0, '2026-05-14', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 1, '2026-05-14T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('6f89a35a-6cc6-4703-be0b-c884b0c0f5dc', 20, '1b8a3346-66da-4289-a354-5c30b2d3b566', 'Brinde', 15.0, '2026-05-14', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', '2026-05-14');

-- LINHA 137 [NAO]: IPHONE 14 PRO MAX 128GB ROXO SEMINOVO (14/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('356b1fc0-8cfa-4590-87c6-f87b4fc3996e', 'Apple', 'IPHONE 14 PRO MAX 128GB ROXO SEMINOVO', '357397703170232', 3250.0, 3150.0, 1, 'seminovo', 'bom', 'vendido', '2026-05-14', '2026-05-14', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-14', '2026-05-14', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('f4831df0-38c3-4bc6-adb9-5689eb2f58cc', current_setting('importacao.proximo_numero')::int + 134, current_setting('importacao.cliente_id')::uuid, 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 3250.0, 3250.0, 0.0, '2026-05-14', '2026-05-14', '85e3aa42-b9af-49b8-a72a-64e9c337aa53');
UPDATE aparelhos SET venda_id = 'f4831df0-38c3-4bc6-adb9-5689eb2f58cc' WHERE id = '356b1fc0-8cfa-4590-87c6-f87b4fc3996e';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('6c996ece-7204-4634-8a50-13c55ce5f46a', 'f4831df0-38c3-4bc6-adb9-5689eb2f58cc', 'pix', 3250.0, '2026-05-14', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 1, '2026-05-14T14:00:00');

-- LINHA 138 [NAO]: IPHONE 16 PLUS 128GB PRETO SEMINOVO (14/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('9176f902-c3e2-4af5-91d6-c6a828156c86', 'Apple', 'IPHONE 16 PLUS 128GB PRETO SEMINOVO', '352726622496929', 4225.0, 3750.0, 1, 'seminovo', 'bom', 'vendido', '2026-05-14', '2026-05-14', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-14', '2026-05-14', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('a7b769ee-d356-4e40-9ca0-54fd583125cc', current_setting('importacao.proximo_numero')::int + 135, current_setting('importacao.cliente_id')::uuid, 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 4225.0, 4225.0, 0.0, '2026-05-14', '2026-05-14', '85e3aa42-b9af-49b8-a72a-64e9c337aa53');
UPDATE aparelhos SET venda_id = 'a7b769ee-d356-4e40-9ca0-54fd583125cc' WHERE id = '9176f902-c3e2-4af5-91d6-c6a828156c86';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('9cece56b-e60c-419b-b087-b6370e53a386', 'a7b769ee-d356-4e40-9ca0-54fd583125cc', 'pix', 4225.0, '2026-05-14', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 1, '2026-05-14T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('f4376e33-7322-4404-91d8-8e25451cf628', 1, 'a7b769ee-d356-4e40-9ca0-54fd583125cc', 'Brinde', 25.0, '2026-05-14', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-14');

-- LINHA 139 [SIM]: IPHONE 13 128GB ROSA SEMINOVO (14/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('d19cccd0-caf9-4808-8ffd-ee9adb09a975', 'Apple', 'IPHONE 13 128GB ROSA SEMINOVO', NULL, 1911.0, 1800.0, 1, 'seminovo', 'bom', 'vendido', '2026-05-14', '2026-05-14', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-14', '2026-05-14', 'Sem IMEI');
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('2d2a08bf-172c-4079-a51b-3b766ed3453e', current_setting('importacao.proximo_numero')::int + 136, current_setting('importacao.cliente_id')::uuid, 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 1911.0, 1911.0, 0.0, '2026-05-14', '2026-05-14', '85e3aa42-b9af-49b8-a72a-64e9c337aa53');
UPDATE aparelhos SET venda_id = '2d2a08bf-172c-4079-a51b-3b766ed3453e' WHERE id = 'd19cccd0-caf9-4808-8ffd-ee9adb09a975';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('f637d2f7-5088-438d-b3ad-4f3e0f11409f', '2d2a08bf-172c-4079-a51b-3b766ed3453e', 'pix', 1911.0, '2026-05-14', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 1, '2026-05-14T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('263ef2dd-5c31-4ad3-816a-b864e87ae7fe', 1, '2d2a08bf-172c-4079-a51b-3b766ed3453e', 'Brinde', 25.0, '2026-05-14', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-14');

-- LINHA 140 [NAO]: IPHONE 17 PRO MAX 256GB AZUL NOVO (15/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('a6d344c2-41a2-42b5-b3fa-cf0790064be3', 'Apple', 'IPHONE 17 PRO MAX 256GB AZUL NOVO', '351205741900807', 8650.0, 8050.0, 4, 'novo', 'perfeito', 'vendido', '2026-05-15', '2026-05-15', 'e07d4d35-1381-4d4d-914d-8382a7456fdd', '2026-05-15', '2026-05-15', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('6c47b3e2-5b39-44f3-9463-9b94686b8730', current_setting('importacao.proximo_numero')::int + 137, current_setting('importacao.cliente_id')::uuid, 4, 'e07d4d35-1381-4d4d-914d-8382a7456fdd', 'concluida', 'normal', 8650.0, 8650.0, 0.0, '2026-05-15', '2026-05-15', 'e07d4d35-1381-4d4d-914d-8382a7456fdd');
UPDATE aparelhos SET venda_id = '6c47b3e2-5b39-44f3-9463-9b94686b8730' WHERE id = 'a6d344c2-41a2-42b5-b3fa-cf0790064be3';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('9ebeec5d-efa1-4dfb-b962-f050da96dcb7', '6c47b3e2-5b39-44f3-9463-9b94686b8730', 'pix', 8650.0, '2026-05-15', 'e07d4d35-1381-4d4d-914d-8382a7456fdd', 1, '2026-05-15T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('d9d6ed71-1f02-4f54-8869-0a655c2f5a15', 4, '6c47b3e2-5b39-44f3-9463-9b94686b8730', 'Brinde', 155.0, '2026-05-15', 'e07d4d35-1381-4d4d-914d-8382a7456fdd', '2026-05-15');

-- LINHA 141 [NAO]: IPHONE 11 128GB PRETO SEMINOVO (15/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('cfa7db7a-95ce-49da-9c13-afdb84c3d84b', 'Apple', 'IPHONE 11 128GB PRETO SEMINOVO', '356460904622673', 899.99, 800.0, 4, 'seminovo', 'bom', 'vendido', '2026-05-15', '2026-05-15', 'e07d4d35-1381-4d4d-914d-8382a7456fdd', '2026-05-15', '2026-05-15', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('6c37eb35-a269-4c66-b5a7-9d822432fb8f', current_setting('importacao.proximo_numero')::int + 138, current_setting('importacao.cliente_id')::uuid, 4, 'e07d4d35-1381-4d4d-914d-8382a7456fdd', 'concluida', 'normal', 899.99, 899.99, 0.0, '2026-05-15', '2026-05-15', 'e07d4d35-1381-4d4d-914d-8382a7456fdd');
UPDATE aparelhos SET venda_id = '6c37eb35-a269-4c66-b5a7-9d822432fb8f' WHERE id = 'cfa7db7a-95ce-49da-9c13-afdb84c3d84b';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('ab967584-1a95-479e-9899-14620111bb40', '6c37eb35-a269-4c66-b5a7-9d822432fb8f', 'pix', 899.99, '2026-05-15', 'e07d4d35-1381-4d4d-914d-8382a7456fdd', 1, '2026-05-15T14:00:00');

-- LINHA 142 [NAO]: IPHONE 17 PRO LARANJA 256GB NOVO (15/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('e0606f1c-324b-4273-807e-7647c02ec3fd', 'Apple', 'IPHONE 17 PRO LARANJA 256GB NOVO', '354289632484698', 8500.0, 8250.0, 20, 'novo', 'perfeito', 'vendido', '2026-05-15', '2026-05-15', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', '2026-05-15', '2026-05-15', 'Pagto junto (Aparelho 1/4, total grupo R$ 30,500)');
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('ffb53e09-4456-4770-b618-5d9054c07405', current_setting('importacao.proximo_numero')::int + 139, current_setting('importacao.cliente_id')::uuid, 20, 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 'concluida', 'normal', 8500.0, 8500.0, 0.0, '2026-05-15', '2026-05-15', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4');
UPDATE aparelhos SET venda_id = 'ffb53e09-4456-4770-b618-5d9054c07405' WHERE id = 'e0606f1c-324b-4273-807e-7647c02ec3fd';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('c117c1ea-99a3-4898-843d-95aed6ed72f4', 'ffb53e09-4456-4770-b618-5d9054c07405', 'pix', 8500.0, '2026-05-15', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 1, '2026-05-15T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('9466788d-e97e-48bf-b4a0-c1bec3609f61', 20, 'ffb53e09-4456-4770-b618-5d9054c07405', 'Brinde', 8.0, '2026-05-15', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', '2026-05-15');

-- LINHA 143 [NAO]: IPHONE 17 PRO 256GB LARANJA NOVO (15/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('20e859a1-07a1-456a-adfa-373da6554f6e', 'Apple', 'IPHONE 17 PRO 256GB LARANJA NOVO', '352001998377479', 8500.0, 8250.0, 20, 'novo', 'perfeito', 'vendido', '2026-05-15', '2026-05-15', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', '2026-05-15', '2026-05-15', 'Pagto junto (Aparelho 2/4, total grupo R$ 30,500)');
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('76dbe828-d7e5-4925-a25d-f184d48d4b19', current_setting('importacao.proximo_numero')::int + 140, current_setting('importacao.cliente_id')::uuid, 20, 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 'concluida', 'normal', 8500.0, 8500.0, 0.0, '2026-05-15', '2026-05-15', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4');
UPDATE aparelhos SET venda_id = '76dbe828-d7e5-4925-a25d-f184d48d4b19' WHERE id = '20e859a1-07a1-456a-adfa-373da6554f6e';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('6d43f3cd-3ad0-4c32-9e89-faab1407086d', '76dbe828-d7e5-4925-a25d-f184d48d4b19', 'pix', 8500.0, '2026-05-15', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 1, '2026-05-15T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('38088038-9c33-4877-a81e-a4e2847a36e6', 20, '76dbe828-d7e5-4925-a25d-f184d48d4b19', 'Brinde', 8.0, '2026-05-15', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', '2026-05-15');

-- LINHA 144 [NAO]: MACBOOK AIR M4 256GB SILVER NOVO (15/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('04cb5e14-5a8b-4578-bb4d-0777fb14e14d', 'Apple', 'MACBOOK AIR M4 256GB SILVER NOVO', 'L1FL9LNFH1', 6750.0, 6500.0, 20, 'novo', 'perfeito', 'vendido', '2026-05-15', '2026-05-15', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', '2026-05-15', '2026-05-15', 'Pagto junto (Aparelho 3/4, total grupo R$ 30,500)');
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('6347a097-305c-4efc-b606-31b0dfa21b01', current_setting('importacao.proximo_numero')::int + 141, current_setting('importacao.cliente_id')::uuid, 20, 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 'concluida', 'normal', 6750.0, 6750.0, 0.0, '2026-05-15', '2026-05-15', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4');
UPDATE aparelhos SET venda_id = '6347a097-305c-4efc-b606-31b0dfa21b01' WHERE id = '04cb5e14-5a8b-4578-bb4d-0777fb14e14d';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('a1d3b439-630b-45bb-bf3a-f1ec6458dc5e', '6347a097-305c-4efc-b606-31b0dfa21b01', 'pix', 6750.0, '2026-05-15', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 1, '2026-05-15T14:00:00');

-- LINHA 145 [NAO]: MACBOOK AIR M4 SILVER 256GB NOVO (15/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('32f22b6b-af48-438e-bfcc-5854c45148be', 'Apple', 'MACBOOK AIR M4 SILVER 256GB NOVO', 'D9XGF2JP9X', 6750.0, 6500.0, 20, 'novo', 'perfeito', 'vendido', '2026-05-15', '2026-05-15', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', '2026-05-15', '2026-05-15', 'Pagto junto (Aparelho 4/4, total grupo R$ 30,500)');
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('3e4e1540-4d18-4b76-8367-df8748236fb6', current_setting('importacao.proximo_numero')::int + 142, current_setting('importacao.cliente_id')::uuid, 20, 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 'concluida', 'normal', 6750.0, 6750.0, 0.0, '2026-05-15', '2026-05-15', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4');
UPDATE aparelhos SET venda_id = '3e4e1540-4d18-4b76-8367-df8748236fb6' WHERE id = '32f22b6b-af48-438e-bfcc-5854c45148be';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('608d2538-fa7f-4bc7-9e78-6442643f9bf8', '3e4e1540-4d18-4b76-8367-df8748236fb6', 'pix', 6750.0, '2026-05-15', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 1, '2026-05-15T14:00:00');

-- LINHA 146 [NAO]: IPHONE 17 PRO MAX 256GB LARANJA SEMINOVO (15/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('e6cafba0-ec11-4a52-b756-2f6acf30a417', 'Apple', 'IPHONE 17 PRO MAX 256GB LARANJA SEMINOVO', '359912580728338', 7700.0, 6900.0, 4, 'seminovo', 'bom', 'vendido', '2026-05-15', '2026-05-15', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-15', '2026-05-15', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('8dd4d68a-909f-4082-b4ec-3f3e08f9e69c', current_setting('importacao.proximo_numero')::int + 143, current_setting('importacao.cliente_id')::uuid, 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 7700.0, 7700.0, 0.0, '2026-05-15', '2026-05-15', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
UPDATE aparelhos SET venda_id = '8dd4d68a-909f-4082-b4ec-3f3e08f9e69c' WHERE id = 'e6cafba0-ec11-4a52-b756-2f6acf30a417';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('9b048a19-a00a-4872-94f7-f0b19d8946b4', '8dd4d68a-909f-4082-b4ec-3f3e08f9e69c', 'pix', 1000.0, '2026-05-15', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1, '2026-05-15T14:00:00');
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('8792f84e-45fc-4b3a-b3ad-5157ab04deb1', '8dd4d68a-909f-4082-b4ec-3f3e08f9e69c', 'cartao_credito', 1700.0, '2026-05-15', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1, '2026-05-15T14:00:00');
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, observacao, parcelas, criado_em)
VALUES ('ca3a9ffd-5241-4f7c-a9ca-0e665e55410c', '8dd4d68a-909f-4082-b4ec-3f3e08f9e69c', 'troca_aparelho', 5000.0, '2026-05-15', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'Troca: 16 PRO MAX SEMINOVO', 1, '2026-05-15T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('4ddfc67b-6d72-42cd-97c0-fe279e2bce42', 4, '8dd4d68a-909f-4082-b4ec-3f3e08f9e69c', 'Brinde', 5.0, '2026-05-15', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-15');

-- LINHA 147 [NAO]: IPAD 11° A16 128GB AZUL NOVO (15/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('cf82e165-83a3-4489-810b-e37750f67bc2', 'Apple', 'IPAD 11° A16 128GB AZUL NOVO', 'H64RQG50Y0', 2500.0, 2090.0, 4, 'novo', 'perfeito', 'vendido', '2026-05-15', '2026-05-15', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-15', '2026-05-15', 'Pagto junto (Aparelho 1/2, total grupo R$ 4,700)');
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('d66ff1c1-dfd4-4dc4-93f8-7dabad6ef3a2', current_setting('importacao.proximo_numero')::int + 144, current_setting('importacao.cliente_id')::uuid, 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 2500.0, 2500.0, 0.0, '2026-05-15', '2026-05-15', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
UPDATE aparelhos SET venda_id = 'd66ff1c1-dfd4-4dc4-93f8-7dabad6ef3a2' WHERE id = 'cf82e165-83a3-4489-810b-e37750f67bc2';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('2cf9cbb6-2c50-41dc-b237-44161fabb0d4', 'd66ff1c1-dfd4-4dc4-93f8-7dabad6ef3a2', 'pix', 2500.0, '2026-05-15', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1, '2026-05-15T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('30392b41-2560-41c8-8d60-bcd4bd7a3c66', 4, 'd66ff1c1-dfd4-4dc4-93f8-7dabad6ef3a2', 'Brinde', 120.0, '2026-05-15', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-15');

-- LINHA 148 [NAO]: IPAD 11° A16 128GB AZUL NOVO (15/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('01d6c53d-07d7-4e5c-ab2f-09d949c52379', 'Apple', 'IPAD 11° A16 128GB AZUL NOVO', 'G23024PVDT', 2200.0, 2090.0, 4, 'novo', 'perfeito', 'vendido', '2026-05-15', '2026-05-15', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-15', '2026-05-15', 'Pagto junto (Aparelho 2/2, total grupo R$ 4,700)');
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('0f1e610a-92b4-4aef-b134-c2865d08f464', current_setting('importacao.proximo_numero')::int + 145, current_setting('importacao.cliente_id')::uuid, 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 2200.0, 2200.0, 0.0, '2026-05-15', '2026-05-15', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
UPDATE aparelhos SET venda_id = '0f1e610a-92b4-4aef-b134-c2865d08f464' WHERE id = '01d6c53d-07d7-4e5c-ab2f-09d949c52379';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('6bab243b-8932-4229-bfcd-e9c4dd0cf7e2', '0f1e610a-92b4-4aef-b134-c2865d08f464', 'pix', 2200.0, '2026-05-15', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1, '2026-05-15T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('42aeba56-5576-4dd8-a453-d96a62f57803', 4, '0f1e610a-92b4-4aef-b134-c2865d08f464', 'Brinde', 10.0, '2026-05-15', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-15');

-- LINHA 149 [NAO]: IPHONE 15 128GB PRETO SEMINOVO (15/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('c066e127-cf72-4a86-8581-b6883e1a0078', 'Apple', 'IPHONE 15 128GB PRETO SEMINOVO', '356054492870941', 2930.0, 2750.0, 4, 'seminovo', 'bom', 'vendido', '2026-05-15', '2026-05-15', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-15', '2026-05-15', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('67ab2800-3760-4502-bcb4-bec2dc3f8f89', current_setting('importacao.proximo_numero')::int + 146, current_setting('importacao.cliente_id')::uuid, 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 2930.0, 2930.0, 0.0, '2026-05-15', '2026-05-15', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
UPDATE aparelhos SET venda_id = '67ab2800-3760-4502-bcb4-bec2dc3f8f89' WHERE id = 'c066e127-cf72-4a86-8581-b6883e1a0078';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('8aeb87a6-c13c-4396-88d5-0b3869589bc8', '67ab2800-3760-4502-bcb4-bec2dc3f8f89', 'pix', 2930.0, '2026-05-15', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1, '2026-05-15T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('4d51d975-8d43-4934-a86f-25168a4319b1', 4, '67ab2800-3760-4502-bcb4-bec2dc3f8f89', 'Brinde', 5.0, '2026-05-15', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-15');

-- LINHA 150 [SIM]: IPHONE 13 PRO 128GB GRAFITE SEMINOVO (15/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('19cbd14a-8a0a-4b8b-a6ad-f64e2f062f08', 'Apple', 'IPHONE 13 PRO 128GB GRAFITE SEMINOVO', NULL, 2500.0, 2350.0, 4, 'seminovo', 'bom', 'vendido', '2026-05-15', '2026-05-15', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-15', '2026-05-15', 'Sem IMEI');
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('e2d35555-683e-4257-9201-8375ad36902a', current_setting('importacao.proximo_numero')::int + 147, current_setting('importacao.cliente_id')::uuid, 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 2500.0, 2500.0, 0.0, '2026-05-15', '2026-05-15', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
UPDATE aparelhos SET venda_id = 'e2d35555-683e-4257-9201-8375ad36902a' WHERE id = '19cbd14a-8a0a-4b8b-a6ad-f64e2f062f08';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('87fae524-41d8-4aca-88c3-e5b82d155761', 'e2d35555-683e-4257-9201-8375ad36902a', 'pix', 2500.0, '2026-05-15', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1, '2026-05-15T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('c87bddf7-e4b1-4f47-a22f-00a8c4f9a3d5', 4, 'e2d35555-683e-4257-9201-8375ad36902a', 'Brinde', 15.0, '2026-05-15', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-15');

-- LINHA 151 [SIM]: IPHONE 17 256GB VERDE NOVO (15/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('3633b48e-367c-4067-8011-a299b09d196f', 'Apple', 'IPHONE 17 256GB VERDE NOVO', '355989441325235', 5085.0, 4850.0, 19, 'novo', 'perfeito', 'vendido', '2026-05-15', '2026-05-15', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-15', '2026-05-15', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('e56ca351-2c43-45da-afdf-4f846f7463fe', current_setting('importacao.proximo_numero')::int + 148, current_setting('importacao.cliente_id')::uuid, 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 5085.0, 5085.0, 0.0, '2026-05-15', '2026-05-15', '97f12885-87ad-426a-8bbb-656889d82e10');
UPDATE aparelhos SET venda_id = 'e56ca351-2c43-45da-afdf-4f846f7463fe' WHERE id = '3633b48e-367c-4067-8011-a299b09d196f';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('4d06c6f6-09f7-4e9b-9e43-3ee81b2761bc', 'e56ca351-2c43-45da-afdf-4f846f7463fe', 'pix', 5085.0, '2026-05-15', '97f12885-87ad-426a-8bbb-656889d82e10', 1, '2026-05-15T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('264a9bff-232e-4a7c-a652-9aa6747036aa', 19, 'e56ca351-2c43-45da-afdf-4f846f7463fe', 'Brinde', 25.0, '2026-05-15', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-15');

-- LINHA 152 [NAO]: IPHONE 15 PRO MAX 256GB NATURAL SEMINOVO (15/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('632b3be0-50ed-4a6c-b4b8-d124e501870e', 'Apple', 'IPHONE 15 PRO MAX 256GB NATURAL SEMINOVO', '350278024027409', 4100.0, 4000.0, 19, 'seminovo', 'bom', 'vendido', '2026-05-15', '2026-05-15', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-15', '2026-05-15', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('5bc1f77d-4869-4bcb-a8b3-10939b2123f7', current_setting('importacao.proximo_numero')::int + 149, current_setting('importacao.cliente_id')::uuid, 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 4100.0, 4100.0, 0.0, '2026-05-15', '2026-05-15', '97f12885-87ad-426a-8bbb-656889d82e10');
UPDATE aparelhos SET venda_id = '5bc1f77d-4869-4bcb-a8b3-10939b2123f7' WHERE id = '632b3be0-50ed-4a6c-b4b8-d124e501870e';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('910198bd-3b3e-402f-9a96-294f85ccccc1', '5bc1f77d-4869-4bcb-a8b3-10939b2123f7', 'pix', 4100.0, '2026-05-15', '97f12885-87ad-426a-8bbb-656889d82e10', 1, '2026-05-15T14:00:00');

-- LINHA 153 [NAO]: POCO X7 PRO 256GB PRETO NOVO (15/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('e332b146-1996-4793-9864-d82711cb4f83', 'Outros', 'POCO X7 PRO 256GB PRETO NOVO', '869471081130380', 2075.0, 1750.0, 1, 'novo', 'perfeito', 'vendido', '2026-05-15', '2026-05-15', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-15', '2026-05-15', 'Pagto junto (Aparelho 1/2, total grupo R$ 4,150)');
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('9d9c6275-3307-4484-964a-a3ec762171f4', current_setting('importacao.proximo_numero')::int + 150, current_setting('importacao.cliente_id')::uuid, 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 2075.0, 2075.0, 0.0, '2026-05-15', '2026-05-15', '85e3aa42-b9af-49b8-a72a-64e9c337aa53');
UPDATE aparelhos SET venda_id = '9d9c6275-3307-4484-964a-a3ec762171f4' WHERE id = 'e332b146-1996-4793-9864-d82711cb4f83';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('35a24be7-a906-47c3-82a8-455ceb289e4b', '9d9c6275-3307-4484-964a-a3ec762171f4', 'pix', 2075.0, '2026-05-15', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 1, '2026-05-15T14:00:00');

-- LINHA 154 [NAO]: POCO X7 PRO 256GB PRETO NOVO (15/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('ca4498cb-3fc3-463b-b94a-ed33ef025ff9', 'Outros', 'POCO X7 PRO 256GB PRETO NOVO', '869471081096821', 2075.0, 1750.0, 1, 'novo', 'perfeito', 'vendido', '2026-05-15', '2026-05-15', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-15', '2026-05-15', 'Pagto junto (Aparelho 2/2, total grupo R$ 4,150)');
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('338575b1-51e9-47e0-9221-172261644e2f', current_setting('importacao.proximo_numero')::int + 151, current_setting('importacao.cliente_id')::uuid, 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 2075.0, 2075.0, 0.0, '2026-05-15', '2026-05-15', '85e3aa42-b9af-49b8-a72a-64e9c337aa53');
UPDATE aparelhos SET venda_id = '338575b1-51e9-47e0-9221-172261644e2f' WHERE id = 'ca4498cb-3fc3-463b-b94a-ed33ef025ff9';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('5ee2b69b-b52e-4a08-a260-0debbaac2a8b', '338575b1-51e9-47e0-9221-172261644e2f', 'pix', 2075.0, '2026-05-15', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 1, '2026-05-15T14:00:00');

-- LINHA 155 [NAO]: IPHONE 13 PRO MAX 128GB AZUL SEMINOVO (15/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('766d44f1-5ea7-4e5e-abc0-52647e50f181', 'Apple', 'IPHONE 13 PRO MAX 128GB AZUL SEMINOVO', '359481988717053', 3070.0, 2600.0, 4, 'seminovo', 'bom', 'vendido', '2026-05-15', '2026-05-15', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-15', '2026-05-15', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('cd253327-70ba-4477-9a42-76ff9395e140', current_setting('importacao.proximo_numero')::int + 152, current_setting('importacao.cliente_id')::uuid, 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 3070.0, 3070.0, 0.0, '2026-05-15', '2026-05-15', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
UPDATE aparelhos SET venda_id = 'cd253327-70ba-4477-9a42-76ff9395e140' WHERE id = '766d44f1-5ea7-4e5e-abc0-52647e50f181';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('7c88eb25-e381-44c5-88ee-bed871f14f30', 'cd253327-70ba-4477-9a42-76ff9395e140', 'pix', 790.0, '2026-05-15', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1, '2026-05-15T14:00:00');
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('f25e664f-8426-40d3-b4c4-0a98dc7db549', 'cd253327-70ba-4477-9a42-76ff9395e140', 'cartao_credito', 2280.0, '2026-05-15', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1, '2026-05-15T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('1c83d239-9ac4-4af6-96aa-a09db0912beb', 4, 'cd253327-70ba-4477-9a42-76ff9395e140', 'Brinde', 115.0, '2026-05-15', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-15');

-- LINHA 156 [NAO]: IPHONE 13 128GB PRETO SEMINOVO (16/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('9054064e-70b5-4563-ab39-d9a966ce533c', 'Apple', 'IPHONE 13 128GB PRETO SEMINOVO', '352094671123856', 2000.0, 1800.0, 4, 'seminovo', 'bom', 'vendido', '2026-05-16', '2026-05-16', 'e07d4d35-1381-4d4d-914d-8382a7456fdd', '2026-05-16', '2026-05-16', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('88e07d48-9c91-48f7-af8b-4a7e33e86a3f', current_setting('importacao.proximo_numero')::int + 153, current_setting('importacao.cliente_id')::uuid, 4, 'e07d4d35-1381-4d4d-914d-8382a7456fdd', 'concluida', 'normal', 2000.0, 2000.0, 0.0, '2026-05-16', '2026-05-16', 'e07d4d35-1381-4d4d-914d-8382a7456fdd');
UPDATE aparelhos SET venda_id = '88e07d48-9c91-48f7-af8b-4a7e33e86a3f' WHERE id = '9054064e-70b5-4563-ab39-d9a966ce533c';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('cc57ee96-64c4-4c77-bcc0-1e95c702e65b', '88e07d48-9c91-48f7-af8b-4a7e33e86a3f', 'pix', 800.0, '2026-05-16', 'e07d4d35-1381-4d4d-914d-8382a7456fdd', 1, '2026-05-16T14:00:00');
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('cef771cf-fa3c-4c2c-8a2e-69159ff4bedf', '88e07d48-9c91-48f7-af8b-4a7e33e86a3f', 'cartao_credito', 1200.0, '2026-05-16', 'e07d4d35-1381-4d4d-914d-8382a7456fdd', 1, '2026-05-16T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('233ee693-e27b-4ed5-bb16-1ea28714c4b2', 4, '88e07d48-9c91-48f7-af8b-4a7e33e86a3f', 'Brinde', 25.0, '2026-05-16', 'e07d4d35-1381-4d4d-914d-8382a7456fdd', '2026-05-16');

-- LINHA 157 [NAO]: IPHONE 17 PRO MAX 256GB LARANJA NOVO (16/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('75aa0f20-f26e-4cab-8ec0-7f3c98895932', 'Apple', 'IPHONE 17 PRO MAX 256GB LARANJA NOVO', '355224258492153', 8300.0, 8170.0, 4, 'novo', 'perfeito', 'vendido', '2026-05-16', '2026-05-16', 'e07d4d35-1381-4d4d-914d-8382a7456fdd', '2026-05-16', '2026-05-16', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('7b4f55e7-6f6b-4495-9553-7c878558d8f8', current_setting('importacao.proximo_numero')::int + 154, current_setting('importacao.cliente_id')::uuid, 4, 'e07d4d35-1381-4d4d-914d-8382a7456fdd', 'concluida', 'normal', 8300.0, 8300.0, 0.0, '2026-05-16', '2026-05-16', 'e07d4d35-1381-4d4d-914d-8382a7456fdd');
UPDATE aparelhos SET venda_id = '7b4f55e7-6f6b-4495-9553-7c878558d8f8' WHERE id = '75aa0f20-f26e-4cab-8ec0-7f3c98895932';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('2df3174a-09ee-4127-b097-ce8b30657017', '7b4f55e7-6f6b-4495-9553-7c878558d8f8', 'pix', 50.0, '2026-05-16', 'e07d4d35-1381-4d4d-914d-8382a7456fdd', 1, '2026-05-16T14:00:00');
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('49a5dc6f-0693-4fb1-99bd-9e7e87b2b965', '7b4f55e7-6f6b-4495-9553-7c878558d8f8', 'cartao_credito', 8250.0, '2026-05-16', 'e07d4d35-1381-4d4d-914d-8382a7456fdd', 1, '2026-05-16T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('0c69ad45-cc59-4607-addf-c8f2a1729673', 4, '7b4f55e7-6f6b-4495-9553-7c878558d8f8', 'Brinde', 15.0, '2026-05-16', 'e07d4d35-1381-4d4d-914d-8382a7456fdd', '2026-05-16');

-- LINHA 158 [SIM]: IPHONE 16 PRO MAX 256GB  PRETO SEMINOVO (16/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('a414c9f8-b15e-430e-a522-e89908648a7e', 'Apple', 'IPHONE 16 PRO MAX 256GB  PRETO SEMINOVO', '357590872352405', 5300.0, 5000.0, 19, 'seminovo', 'bom', 'vendido', '2026-05-16', '2026-05-16', 'b4269e60-eea2-4eba-a34d-db9591e0ec83', '2026-05-16', '2026-05-16', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('a8a414cb-b148-4aed-8b8e-f9ca2879c5e4', current_setting('importacao.proximo_numero')::int + 155, current_setting('importacao.cliente_id')::uuid, 19, 'b4269e60-eea2-4eba-a34d-db9591e0ec83', 'concluida', 'normal', 5300.0, 5300.0, 0.0, '2026-05-16', '2026-05-16', 'b4269e60-eea2-4eba-a34d-db9591e0ec83');
UPDATE aparelhos SET venda_id = 'a8a414cb-b148-4aed-8b8e-f9ca2879c5e4' WHERE id = 'a414c9f8-b15e-430e-a522-e89908648a7e';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('31a7d882-06aa-417f-b4f1-058a93c05a2e', 'a8a414cb-b148-4aed-8b8e-f9ca2879c5e4', 'pix', 5300.0, '2026-05-16', 'b4269e60-eea2-4eba-a34d-db9591e0ec83', 1, '2026-05-16T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('fc76f1d8-515f-46f2-acdc-f1b9378e74fc', 19, 'a8a414cb-b148-4aed-8b8e-f9ca2879c5e4', 'Brinde', 15.0, '2026-05-16', 'b4269e60-eea2-4eba-a34d-db9591e0ec83', '2026-05-16');

-- LINHA 159 [NAO]: IPHONE 17 PRO 256GB SILVER NOVO (16/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('f58f8b6c-2d2b-4e07-b084-137cdfd1df60', 'Apple', 'IPHONE 17 PRO 256GB SILVER NOVO', '352001996607349', 7650.0, 7450.0, 19, 'novo', 'perfeito', 'vendido', '2026-05-16', '2026-05-16', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-16', '2026-05-16', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('5610ee96-f3fa-408a-89b6-be3b68f552ec', current_setting('importacao.proximo_numero')::int + 156, current_setting('importacao.cliente_id')::uuid, 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 7650.0, 7650.0, 0.0, '2026-05-16', '2026-05-16', '97f12885-87ad-426a-8bbb-656889d82e10');
UPDATE aparelhos SET venda_id = '5610ee96-f3fa-408a-89b6-be3b68f552ec' WHERE id = 'f58f8b6c-2d2b-4e07-b084-137cdfd1df60';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('eb90ecd4-54b5-4543-ae11-7d8ebc80536c', '5610ee96-f3fa-408a-89b6-be3b68f552ec', 'pix', 7650.0, '2026-05-16', '97f12885-87ad-426a-8bbb-656889d82e10', 1, '2026-05-16T14:00:00');

-- LINHA 160 [NAO]: IPHONE 15 PRO 256GB PRETO SEMINOVO (16/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('8eb09763-a61e-47d7-9586-2320356441ba', 'Apple', 'IPHONE 15 PRO 256GB PRETO SEMINOVO', '359370793687157', 3721.0, 3400.0, 19, 'seminovo', 'bom', 'vendido', '2026-05-16', '2026-05-16', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-16', '2026-05-16', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('5342c586-33bf-4031-a02e-a54ad397c6aa', current_setting('importacao.proximo_numero')::int + 157, current_setting('importacao.cliente_id')::uuid, 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 3721.0, 3721.0, 0.0, '2026-05-16', '2026-05-16', '97f12885-87ad-426a-8bbb-656889d82e10');
UPDATE aparelhos SET venda_id = '5342c586-33bf-4031-a02e-a54ad397c6aa' WHERE id = '8eb09763-a61e-47d7-9586-2320356441ba';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('5b4ac59e-a461-4b9a-b8b3-2baae0294d45', '5342c586-33bf-4031-a02e-a54ad397c6aa', 'pix', 3721.0, '2026-05-16', '97f12885-87ad-426a-8bbb-656889d82e10', 1, '2026-05-16T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('91ddeb20-b871-4832-97b4-223aad3e3a23', 19, '5342c586-33bf-4031-a02e-a54ad397c6aa', 'Brinde', 20.0, '2026-05-16', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-16');

-- LINHA 161 [NAO]: IPHONE 14 PRO MAX 128GB GOLD SEMINOVO (16/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('c61e2864-bec8-4efe-abd9-ce3186a2086f', 'Apple', 'IPHONE 14 PRO MAX 128GB GOLD SEMINOVO', '360236730466835', 3350.0, 3150.0, 19, 'seminovo', 'bom', 'vendido', '2026-05-16', '2026-05-16', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-16', '2026-05-16', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('a03dbb85-f20c-4852-b7bb-8f9670cc5e93', current_setting('importacao.proximo_numero')::int + 158, current_setting('importacao.cliente_id')::uuid, 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 3350.0, 3350.0, 0.0, '2026-05-16', '2026-05-16', '97f12885-87ad-426a-8bbb-656889d82e10');
UPDATE aparelhos SET venda_id = 'a03dbb85-f20c-4852-b7bb-8f9670cc5e93' WHERE id = 'c61e2864-bec8-4efe-abd9-ce3186a2086f';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('79cc5d38-5e63-48f5-8a6f-a95b21bba01e', 'a03dbb85-f20c-4852-b7bb-8f9670cc5e93', 'pix', 1250.0, '2026-05-16', '97f12885-87ad-426a-8bbb-656889d82e10', 1, '2026-05-16T14:00:00');
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, observacao, parcelas, criado_em)
VALUES ('afadb253-8d6e-4645-9949-7baeb9d8ad11', 'a03dbb85-f20c-4852-b7bb-8f9670cc5e93', 'troca_aparelho', 2100.0, '2026-05-16', '97f12885-87ad-426a-8bbb-656889d82e10', 'Troca: IPH 13 PRO', 1, '2026-05-16T14:00:00');

-- LINHA 162 [NAO]: IPHONE 16 PRO MAX 512GB DESERT SEMINOVO (16/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('fb20ab4c-cca5-409a-b24f-1b403e927c40', 'Apple', 'IPHONE 16 PRO MAX 512GB DESERT SEMINOVO', '357626319666955', 5700.0, 5700.0, 20, 'seminovo', 'bom', 'vendido', '2026-05-16', '2026-05-16', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', '2026-05-16', '2026-05-16', 'Pagto junto (Aparelho 1/2, total grupo R$ 7,600)');
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('bda53ede-8e86-431b-8b9a-2b396fc3932d', current_setting('importacao.proximo_numero')::int + 159, current_setting('importacao.cliente_id')::uuid, 20, 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 'concluida', 'normal', 5700.0, 5700.0, 0.0, '2026-05-16', '2026-05-16', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4');
UPDATE aparelhos SET venda_id = 'bda53ede-8e86-431b-8b9a-2b396fc3932d' WHERE id = 'fb20ab4c-cca5-409a-b24f-1b403e927c40';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('60aef9ea-5391-489f-917a-bd1e83942039', 'bda53ede-8e86-431b-8b9a-2b396fc3932d', 'pix', 5700.0, '2026-05-16', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 1, '2026-05-16T14:00:00');

-- LINHA 163 [NAO]: IPHONE 12 PRO 256GB PRETO SEMINOVO (16/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('d411bd6d-189a-4bd8-9ed2-b740fd5fd838', 'Apple', 'IPHONE 12 PRO 256GB PRETO SEMINOVO', '356682116877353', 1900.0, 1900.0, 20, 'seminovo', 'bom', 'vendido', '2026-05-16', '2026-05-16', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', '2026-05-16', '2026-05-16', 'Pagto junto (Aparelho 2/2, total grupo R$ 7,600)');
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('cfd3fd7f-5fd1-40c3-9793-14f4d0eff1fe', current_setting('importacao.proximo_numero')::int + 160, current_setting('importacao.cliente_id')::uuid, 20, 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 'concluida', 'normal', 1900.0, 1900.0, 0.0, '2026-05-16', '2026-05-16', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4');
UPDATE aparelhos SET venda_id = 'cfd3fd7f-5fd1-40c3-9793-14f4d0eff1fe' WHERE id = 'd411bd6d-189a-4bd8-9ed2-b740fd5fd838';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('9554e092-de85-4586-87d6-358226096a65', 'cfd3fd7f-5fd1-40c3-9793-14f4d0eff1fe', 'pix', 1900.0, '2026-05-16', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 1, '2026-05-16T14:00:00');

-- LINHA 164 [NAO]: APPLE WATCH SE GEN 2 44MM MIDNIGHT NOVO (16/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('eb429b5f-280d-42a9-8c6f-c3c1df264c29', 'Apple', 'APPLE WATCH SE GEN 2 44MM MIDNIGHT NOVO', 'J4JVW5XVJV', 2050.0, 1800.0, 20, 'novo', 'perfeito', 'vendido', '2026-05-16', '2026-05-16', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', '2026-05-16', '2026-05-16', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('4108fb92-42dd-4678-abff-3e8918ec0275', current_setting('importacao.proximo_numero')::int + 161, current_setting('importacao.cliente_id')::uuid, 20, 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 'concluida', 'normal', 2050.0, 2050.0, 0.0, '2026-05-16', '2026-05-16', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4');
UPDATE aparelhos SET venda_id = '4108fb92-42dd-4678-abff-3e8918ec0275' WHERE id = 'eb429b5f-280d-42a9-8c6f-c3c1df264c29';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('62763e97-5ea2-4e10-b7c1-80cea558d1f8', '4108fb92-42dd-4678-abff-3e8918ec0275', 'pix', 2050.0, '2026-05-16', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 1, '2026-05-16T14:00:00');

-- LINHA 165 [NAO]: IPHONE 11 PRO MAX 256GB VERDE SEMINOVO (16/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('868b14a0-ee65-47eb-8298-1d68295c0a4a', 'Apple', 'IPHONE 11 PRO MAX 256GB VERDE SEMINOVO', '353906102560167', 1250.0, 900.0, 20, 'seminovo', 'bom', 'vendido', '2026-05-16', '2026-05-16', '25e2da5b-9e76-4388-9890-7e22efd6940d', '2026-05-16', '2026-05-16', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('e1d76dc3-9593-43d1-8c43-322acf103a73', current_setting('importacao.proximo_numero')::int + 162, current_setting('importacao.cliente_id')::uuid, 20, '25e2da5b-9e76-4388-9890-7e22efd6940d', 'concluida', 'normal', 1250.0, 1250.0, 0.0, '2026-05-16', '2026-05-16', '25e2da5b-9e76-4388-9890-7e22efd6940d');
UPDATE aparelhos SET venda_id = 'e1d76dc3-9593-43d1-8c43-322acf103a73' WHERE id = '868b14a0-ee65-47eb-8298-1d68295c0a4a';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('1c7d0ee2-e8ab-480b-9cfd-2c531c2c5a25', 'e1d76dc3-9593-43d1-8c43-322acf103a73', 'pix', 1250.0, '2026-05-16', '25e2da5b-9e76-4388-9890-7e22efd6940d', 1, '2026-05-16T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('3cdb6180-57c5-4fbf-a95c-3a15ba2064be', 20, 'e1d76dc3-9593-43d1-8c43-322acf103a73', 'Brinde', 25.0, '2026-05-16', '25e2da5b-9e76-4388-9890-7e22efd6940d', '2026-05-16');

-- LINHA 166 [NAO]: IPHONE 16 128GB VERDE SEMINOVO (16/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('b8b52fc1-0ce8-48f4-8925-114be22a0d84', 'Apple', 'IPHONE 16 128GB VERDE SEMINOVO', '357884596142865', 3750.0, 3450.0, 20, 'seminovo', 'bom', 'vendido', '2026-05-16', '2026-05-16', '25e2da5b-9e76-4388-9890-7e22efd6940d', '2026-05-16', '2026-05-16', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('8db0b591-f489-4901-849e-32670595f5f9', current_setting('importacao.proximo_numero')::int + 163, current_setting('importacao.cliente_id')::uuid, 20, '25e2da5b-9e76-4388-9890-7e22efd6940d', 'concluida', 'normal', 3750.0, 3750.0, 0.0, '2026-05-16', '2026-05-16', '25e2da5b-9e76-4388-9890-7e22efd6940d');
UPDATE aparelhos SET venda_id = '8db0b591-f489-4901-849e-32670595f5f9' WHERE id = 'b8b52fc1-0ce8-48f4-8925-114be22a0d84';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('8ddf0fc7-5d10-46b7-a60f-ee284e25ca4c', '8db0b591-f489-4901-849e-32670595f5f9', 'pix', 2000.0, '2026-05-16', '25e2da5b-9e76-4388-9890-7e22efd6940d', 1, '2026-05-16T14:00:00');
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('b6093af0-79b0-4406-a476-d4f84aceb70e', '8db0b591-f489-4901-849e-32670595f5f9', 'cartao_credito', 1750.0, '2026-05-16', '25e2da5b-9e76-4388-9890-7e22efd6940d', 1, '2026-05-16T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('5269483c-2d9d-40b0-9d4d-0b5e0b10d96f', 20, '8db0b591-f489-4901-849e-32670595f5f9', 'Brinde', 25.0, '2026-05-16', '25e2da5b-9e76-4388-9890-7e22efd6940d', '2026-05-16');

-- LINHA 167 [NAO]: IPHONE 15 128GB AZUL SEMINOVO (16/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('8fb86487-9db4-474c-ae9c-0077becd201f', 'Apple', 'IPHONE 15 128GB AZUL SEMINOVO', '350169642018823', 3000.0, 2750.0, 1, 'seminovo', 'bom', 'vendido', '2026-05-16', '2026-05-16', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-16', '2026-05-16', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('a0460352-6b9f-4b7d-842d-9fc6e01deb6f', current_setting('importacao.proximo_numero')::int + 164, current_setting('importacao.cliente_id')::uuid, 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 3000.0, 3000.0, 0.0, '2026-05-16', '2026-05-16', '85e3aa42-b9af-49b8-a72a-64e9c337aa53');
UPDATE aparelhos SET venda_id = 'a0460352-6b9f-4b7d-842d-9fc6e01deb6f' WHERE id = '8fb86487-9db4-474c-ae9c-0077becd201f';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('775a071b-a9b1-4b05-ace8-21db6583fced', 'a0460352-6b9f-4b7d-842d-9fc6e01deb6f', 'pix', 3000.0, '2026-05-16', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 1, '2026-05-16T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('61ee574d-3172-4018-a308-8b4598201212', 1, 'a0460352-6b9f-4b7d-842d-9fc6e01deb6f', 'Brinde', 25.0, '2026-05-16', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-16');

-- LINHA 168 [NAO]: IPHONE 17 256GB PRETO LACRADO (16/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('7ed2fa1a-6bea-4e33-9f7b-f03e1ee13ddc', 'Apple', 'IPHONE 17 256GB PRETO LACRADO', '358748638760753', 5180.0, 4800.0, 1, 'novo', 'perfeito', 'vendido', '2026-05-16', '2026-05-16', '9451cd9f-6770-4e32-aae8-c75fa675e818', '2026-05-16', '2026-05-16', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('a7486d22-b821-4ab0-8adf-0e1f0aad809f', current_setting('importacao.proximo_numero')::int + 165, current_setting('importacao.cliente_id')::uuid, 1, '9451cd9f-6770-4e32-aae8-c75fa675e818', 'concluida', 'normal', 5180.0, 5180.0, 0.0, '2026-05-16', '2026-05-16', '9451cd9f-6770-4e32-aae8-c75fa675e818');
UPDATE aparelhos SET venda_id = 'a7486d22-b821-4ab0-8adf-0e1f0aad809f' WHERE id = '7ed2fa1a-6bea-4e33-9f7b-f03e1ee13ddc';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('73f99571-c15c-438f-8fad-4e01bd00fc5d', 'a7486d22-b821-4ab0-8adf-0e1f0aad809f', 'pix', 3580.0, '2026-05-16', '9451cd9f-6770-4e32-aae8-c75fa675e818', 1, '2026-05-16T14:00:00');
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, observacao, parcelas, criado_em)
VALUES ('709b91db-30e7-4748-be5a-689225af627c', 'a7486d22-b821-4ab0-8adf-0e1f0aad809f', 'troca_aparelho', 1600.0, '2026-05-16', '9451cd9f-6770-4e32-aae8-c75fa675e818', 'Troca: IPHONE 13 128GB PRETO', 1, '2026-05-16T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('815ae1c1-e9db-4e18-a955-738f550ce051', 1, 'a7486d22-b821-4ab0-8adf-0e1f0aad809f', 'Brinde', 30.0, '2026-05-16', '9451cd9f-6770-4e32-aae8-c75fa675e818', '2026-05-16');

-- LINHA 169 [NAO]: IPHONE 17 256GB VERDE NOVO (17/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('94a41f26-6e0a-4f54-95d9-e09350aca59b', 'Apple', 'IPHONE 17 256GB VERDE NOVO', '358619228350786', 4950.0, 4800.0, 19, 'novo', 'perfeito', 'vendido', '2026-05-17', '2026-05-17', 'b4269e60-eea2-4eba-a34d-db9591e0ec83', '2026-05-17', '2026-05-17', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('37801c81-3b1a-48e0-aba0-53641f824ece', current_setting('importacao.proximo_numero')::int + 166, current_setting('importacao.cliente_id')::uuid, 19, 'b4269e60-eea2-4eba-a34d-db9591e0ec83', 'concluida', 'normal', 4950.0, 4950.0, 0.0, '2026-05-17', '2026-05-17', 'b4269e60-eea2-4eba-a34d-db9591e0ec83');
UPDATE aparelhos SET venda_id = '37801c81-3b1a-48e0-aba0-53641f824ece' WHERE id = '94a41f26-6e0a-4f54-95d9-e09350aca59b';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('14883764-e1c6-445b-9778-fab99eb94826', '37801c81-3b1a-48e0-aba0-53641f824ece', 'pix', 4950.0, '2026-05-17', 'b4269e60-eea2-4eba-a34d-db9591e0ec83', 1, '2026-05-17T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('fd56e58c-0b09-480f-84a0-8fc812052deb', 19, '37801c81-3b1a-48e0-aba0-53641f824ece', 'Brinde', 30.0, '2026-05-17', 'b4269e60-eea2-4eba-a34d-db9591e0ec83', '2026-05-17');

-- LINHA 170 [NAO]: IPAD 11° A16 128GB SILVER NOVO (17/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('a603095e-1b59-47e5-8f18-0aea6634b049', 'Apple', 'IPAD 11° A16 128GB SILVER NOVO', 'LC7KGJGWKT', 2300.0, 2160.0, 4, 'novo', 'perfeito', 'vendido', '2026-05-17', '2026-05-17', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-17', '2026-05-17', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('f5bcbb27-cda9-490f-ab84-fd70c0e7e476', current_setting('importacao.proximo_numero')::int + 167, current_setting('importacao.cliente_id')::uuid, 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 2300.0, 2300.0, 0.0, '2026-05-17', '2026-05-17', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
UPDATE aparelhos SET venda_id = 'f5bcbb27-cda9-490f-ab84-fd70c0e7e476' WHERE id = 'a603095e-1b59-47e5-8f18-0aea6634b049';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('f0af8c69-78d2-478e-b78e-b7c4bb719e7c', 'f5bcbb27-cda9-490f-ab84-fd70c0e7e476', 'pix', 2300.0, '2026-05-17', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1, '2026-05-17T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('597eac2f-5c43-47ed-a8c6-3146dc12d0e2', 4, 'f5bcbb27-cda9-490f-ab84-fd70c0e7e476', 'Brinde', 5.0, '2026-05-17', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-17');

-- LINHA 171 [NAO]: IPHONE 17 256GB BRANCO NOVO (17/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('61491b3e-be46-4bcf-9c3d-604f06f6983f', 'Apple', 'IPHONE 17 256GB BRANCO NOVO', '358736463822764', 5240.0, 302.0, 4, 'novo', 'perfeito', 'vendido', '2026-05-17', '2026-05-17', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-17', '2026-05-17', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('649c64f6-b4be-4faf-8011-f7e52b40ef87', current_setting('importacao.proximo_numero')::int + 168, current_setting('importacao.cliente_id')::uuid, 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 5240.0, 5240.0, 0.0, '2026-05-17', '2026-05-17', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
UPDATE aparelhos SET venda_id = '649c64f6-b4be-4faf-8011-f7e52b40ef87' WHERE id = '61491b3e-be46-4bcf-9c3d-604f06f6983f';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('1305750b-0ba3-4552-b08a-ad833c786478', '649c64f6-b4be-4faf-8011-f7e52b40ef87', 'pix', 5240.0, '2026-05-17', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1, '2026-05-17T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('ac1163ec-5bf5-47dc-a887-4f062259d9b5', 4, '649c64f6-b4be-4faf-8011-f7e52b40ef87', 'Brinde', 188.0, '2026-05-17', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-17');

-- LINHA 172 [NAO]: IPHONE 13 PRO MAX VERDE 256GB SEMINOVO (17/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('6a98deb6-1e75-499f-83fe-a65f64441ba8', 'Apple', 'IPHONE 13 PRO MAX VERDE 256GB SEMINOVO', '350249441757480', 3250.0, 2900.0, 19, 'seminovo', 'bom', 'vendido', '2026-05-17', '2026-05-17', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-17', '2026-05-17', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('aa6cc02b-f6bd-4665-a634-f8e746fb9111', current_setting('importacao.proximo_numero')::int + 169, current_setting('importacao.cliente_id')::uuid, 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 3250.0, 3250.0, 0.0, '2026-05-17', '2026-05-17', '97f12885-87ad-426a-8bbb-656889d82e10');
UPDATE aparelhos SET venda_id = 'aa6cc02b-f6bd-4665-a634-f8e746fb9111' WHERE id = '6a98deb6-1e75-499f-83fe-a65f64441ba8';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('1e18cf01-f40c-4c45-88a4-abc4d90c41b6', 'aa6cc02b-f6bd-4665-a634-f8e746fb9111', 'pix', 3250.0, '2026-05-17', '97f12885-87ad-426a-8bbb-656889d82e10', 1, '2026-05-17T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('fe8c58e3-91e7-4a3c-a17d-f650febdccd8', 19, 'aa6cc02b-f6bd-4665-a634-f8e746fb9111', 'Brinde', 50.0, '2026-05-17', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-17');

-- LINHA 173 [SIM]: IPHONE 17 256GB BRANCO NOVO (17/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('8af61ea5-0c5a-4a3c-90ed-8e08afdf96d0', 'Apple', 'IPHONE 17 256GB BRANCO NOVO', '352824562111135', 4950.0, 4750.0, 19, 'novo', 'perfeito', 'vendido', '2026-05-17', '2026-05-17', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-17', '2026-05-17', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('f3e5ea07-8d7d-40bc-b894-e60b2a1516a2', current_setting('importacao.proximo_numero')::int + 170, current_setting('importacao.cliente_id')::uuid, 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 4950.0, 4950.0, 0.0, '2026-05-17', '2026-05-17', '97f12885-87ad-426a-8bbb-656889d82e10');
UPDATE aparelhos SET venda_id = 'f3e5ea07-8d7d-40bc-b894-e60b2a1516a2' WHERE id = '8af61ea5-0c5a-4a3c-90ed-8e08afdf96d0';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('744b126f-304a-40e4-b81e-d8f469fffbac', 'f3e5ea07-8d7d-40bc-b894-e60b2a1516a2', 'pix', 4950.0, '2026-05-17', '97f12885-87ad-426a-8bbb-656889d82e10', 1, '2026-05-17T14:00:00');

-- LINHA 174 [SIM]: IPHONE 15 PRO MAX 256GB AZUL SEMINOVO (17/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('17c4c59d-94eb-47f2-9421-1b209592b7bc', 'Apple', 'IPHONE 15 PRO MAX 256GB AZUL SEMINOVO', '355319547611678', 4200.0, 4000.0, 19, 'seminovo', 'bom', 'vendido', '2026-05-17', '2026-05-17', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-17', '2026-05-17', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('e3e72336-62a4-4341-8fd6-b75a36fb5a77', current_setting('importacao.proximo_numero')::int + 171, current_setting('importacao.cliente_id')::uuid, 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 4200.0, 4200.0, 0.0, '2026-05-17', '2026-05-17', '97f12885-87ad-426a-8bbb-656889d82e10');
UPDATE aparelhos SET venda_id = 'e3e72336-62a4-4341-8fd6-b75a36fb5a77' WHERE id = '17c4c59d-94eb-47f2-9421-1b209592b7bc';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('9ea09a88-cdb5-4b18-b3eb-d7a66f386851', 'e3e72336-62a4-4341-8fd6-b75a36fb5a77', 'pix', 4200.0, '2026-05-17', '97f12885-87ad-426a-8bbb-656889d82e10', 1, '2026-05-17T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('52b7ae62-e811-4484-a301-00b32f455ea4', 19, 'e3e72336-62a4-4341-8fd6-b75a36fb5a77', 'Brinde', 20.0, '2026-05-17', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-17');

-- LINHA 175 [NAO]: IPHONE 17 PRO 256GB SILVER NOVO (17/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('ea86108f-42c1-4689-8d70-9a8d001c1a90', 'Apple', 'IPHONE 17 PRO 256GB SILVER NOVO', '354289638327115', 8000.0, 7450.0, 20, 'novo', 'perfeito', 'vendido', '2026-05-17', '2026-05-17', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', '2026-05-17', '2026-05-17', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('dc626cd1-8a61-424b-8eed-4700fb6b01a2', current_setting('importacao.proximo_numero')::int + 172, current_setting('importacao.cliente_id')::uuid, 20, 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 'concluida', 'normal', 8000.0, 8000.0, 0.0, '2026-05-17', '2026-05-17', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4');
UPDATE aparelhos SET venda_id = 'dc626cd1-8a61-424b-8eed-4700fb6b01a2' WHERE id = 'ea86108f-42c1-4689-8d70-9a8d001c1a90';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('7ea95e98-8e45-4bd3-9695-aaa9d2047921', 'dc626cd1-8a61-424b-8eed-4700fb6b01a2', 'cartao_credito', 8000.0, '2026-05-17', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 1, '2026-05-17T14:00:00');

-- LINHA 176 [NAO]: POCO X7 PRO 512GB VERDE NOVO (17/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('7fd6019e-1121-403e-8ef2-b721127b942f', 'Outros', 'POCO X7 PRO 512GB VERDE NOVO', '868311089900940', 2150.0, 1990.0, 19, 'novo', 'perfeito', 'vendido', '2026-05-17', '2026-05-17', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-17', '2026-05-17', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('654dcb32-7ad0-4768-922f-6557ba0e9304', current_setting('importacao.proximo_numero')::int + 173, current_setting('importacao.cliente_id')::uuid, 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 2150.0, 2150.0, 0.0, '2026-05-17', '2026-05-17', '97f12885-87ad-426a-8bbb-656889d82e10');
UPDATE aparelhos SET venda_id = '654dcb32-7ad0-4768-922f-6557ba0e9304' WHERE id = '7fd6019e-1121-403e-8ef2-b721127b942f';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('e49e1b3d-6d2c-451e-9bc4-d73a074054fb', '654dcb32-7ad0-4768-922f-6557ba0e9304', 'pix', 500.0, '2026-05-17', '97f12885-87ad-426a-8bbb-656889d82e10', 1, '2026-05-17T14:00:00');
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('4f715654-69e8-492d-a05e-50626d6a0e48', '654dcb32-7ad0-4768-922f-6557ba0e9304', 'cartao_credito', 1650.0, '2026-05-17', '97f12885-87ad-426a-8bbb-656889d82e10', 1, '2026-05-17T14:00:00');

-- LINHA 177 [NAO]: IPHONE 17 PRO 256GB BRANCO NOVO (17/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('116d96fa-b636-461d-988d-6e8ba044a9a6', 'Apple', 'IPHONE 17 PRO 256GB BRANCO NOVO', '353739723292955', 7600.0, 7450.0, 19, 'novo', 'perfeito', 'vendido', '2026-05-17', '2026-05-17', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-17', '2026-05-17', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('0bc3f0ca-ce4b-4edd-ba77-32629c10475a', current_setting('importacao.proximo_numero')::int + 174, current_setting('importacao.cliente_id')::uuid, 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 7600.0, 7600.0, 0.0, '2026-05-17', '2026-05-17', '97f12885-87ad-426a-8bbb-656889d82e10');
UPDATE aparelhos SET venda_id = '0bc3f0ca-ce4b-4edd-ba77-32629c10475a' WHERE id = '116d96fa-b636-461d-988d-6e8ba044a9a6';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('e19d4109-d254-4091-b140-48ad897cb666', '0bc3f0ca-ce4b-4edd-ba77-32629c10475a', 'pix', 7600.0, '2026-05-17', '97f12885-87ad-426a-8bbb-656889d82e10', 1, '2026-05-17T14:00:00');

-- LINHA 178 [NAO]: IPHONE 17 256GB NOVO BRANCO (17/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('30afc001-c59b-4cd7-9b14-9acbb0d04a0b', 'Apple', 'IPHONE 17 256GB NOVO BRANCO', '352824563558946', 5130.0, 4750.0, 19, 'novo', 'perfeito', 'vendido', '2026-05-17', '2026-05-17', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-17', '2026-05-17', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('1ef36d32-1d04-4fad-b55b-b2fc08d153bd', current_setting('importacao.proximo_numero')::int + 175, current_setting('importacao.cliente_id')::uuid, 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 5130.0, 5130.0, 0.0, '2026-05-17', '2026-05-17', '97f12885-87ad-426a-8bbb-656889d82e10');
UPDATE aparelhos SET venda_id = '1ef36d32-1d04-4fad-b55b-b2fc08d153bd' WHERE id = '30afc001-c59b-4cd7-9b14-9acbb0d04a0b';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('6e687a8a-b5c6-4d10-a25a-730e3bb4f700', '1ef36d32-1d04-4fad-b55b-b2fc08d153bd', 'pix', 180.0, '2026-05-17', '97f12885-87ad-426a-8bbb-656889d82e10', 1, '2026-05-17T14:00:00');
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('68eb7d24-1323-4276-940b-f3baaa17fca7', '1ef36d32-1d04-4fad-b55b-b2fc08d153bd', 'cartao_credito', 4950.0, '2026-05-17', '97f12885-87ad-426a-8bbb-656889d82e10', 1, '2026-05-17T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('bab34bca-025b-46bb-9cb2-37d4de0247aa', 19, '1ef36d32-1d04-4fad-b55b-b2fc08d153bd', 'Brinde', 140.0, '2026-05-17', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-17');

-- LINHA 179 [NAO]: IPHONE 17 PRO 256GB AZUL SEMINOVO (17/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('0f8bf74c-e72f-4423-b874-37a7d978a173', 'Apple', 'IPHONE 17 PRO 256GB AZUL SEMINOVO', '356839674078168', 6800.0, 6400.0, 19, 'seminovo', 'bom', 'vendido', '2026-05-17', '2026-05-17', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-17', '2026-05-17', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('21ccde9e-2b45-4944-89c8-9ddcead9481d', current_setting('importacao.proximo_numero')::int + 176, current_setting('importacao.cliente_id')::uuid, 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 6800.0, 6800.0, 0.0, '2026-05-17', '2026-05-17', '97f12885-87ad-426a-8bbb-656889d82e10');
UPDATE aparelhos SET venda_id = '21ccde9e-2b45-4944-89c8-9ddcead9481d' WHERE id = '0f8bf74c-e72f-4423-b874-37a7d978a173';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('52d4308e-603f-481f-93ec-4dcd18f21963', '21ccde9e-2b45-4944-89c8-9ddcead9481d', 'pix', 3680.0, '2026-05-17', '97f12885-87ad-426a-8bbb-656889d82e10', 1, '2026-05-17T14:00:00');
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('41d0ee38-1511-42d0-ba48-7f5f6d5e70eb', '21ccde9e-2b45-4944-89c8-9ddcead9481d', 'dinheiro', 220.0, '2026-05-17', '97f12885-87ad-426a-8bbb-656889d82e10', 1, '2026-05-17T14:00:00');
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, observacao, parcelas, criado_em)
VALUES ('723110a2-c8ee-496a-9d21-dcba82afdf00', '21ccde9e-2b45-4944-89c8-9ddcead9481d', 'troca_aparelho', 2900.0, '2026-05-17', '97f12885-87ad-426a-8bbb-656889d82e10', 'Troca: IPH 15', 1, '2026-05-17T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('8c31ebe9-d388-4bcc-95fd-5c83c35aeab9', 19, '21ccde9e-2b45-4944-89c8-9ddcead9481d', 'Brinde', 20.0, '2026-05-17', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-17');

-- LINHA 180 [NAO]: IPHONE 13 PRO 256GB VERDE SEMINOVO (17/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('c5c2f921-917e-4c61-b99d-ed3e37083b78', 'Apple', 'IPHONE 13 PRO 256GB VERDE SEMINOVO', '356649150793663', 2800.0, 2450.0, 20, 'seminovo', 'bom', 'vendido', '2026-05-17', '2026-05-17', '25e2da5b-9e76-4388-9890-7e22efd6940d', '2026-05-17', '2026-05-17', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('2c4829a0-6502-4451-b539-9961b2407224', current_setting('importacao.proximo_numero')::int + 177, current_setting('importacao.cliente_id')::uuid, 20, '25e2da5b-9e76-4388-9890-7e22efd6940d', 'concluida', 'normal', 2800.0, 2800.0, 0.0, '2026-05-17', '2026-05-17', '25e2da5b-9e76-4388-9890-7e22efd6940d');
UPDATE aparelhos SET venda_id = '2c4829a0-6502-4451-b539-9961b2407224' WHERE id = 'c5c2f921-917e-4c61-b99d-ed3e37083b78';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('55dc185c-a1c3-4729-b2de-d33042b66020', '2c4829a0-6502-4451-b539-9961b2407224', 'pix', 2800.0, '2026-05-17', '25e2da5b-9e76-4388-9890-7e22efd6940d', 1, '2026-05-17T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('c6ef9de3-bd76-4c02-8acc-bf7a97d92dd0', 20, '2c4829a0-6502-4451-b539-9961b2407224', 'Brinde', 50.0, '2026-05-17', '25e2da5b-9e76-4388-9890-7e22efd6940d', '2026-05-17');

-- LINHA 181 [NAO]: APPLE WATCH SERIE 11 ROSE GOLD NOVO (17/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('3fc7d89a-d04d-41aa-bdd2-f819e32a0533', 'Apple', 'APPLE WATCH SERIE 11 ROSE GOLD NOVO', 'KF97P7XLWD', 2500.0, 2250.0, 1, 'novo', 'perfeito', 'vendido', '2026-05-17', '2026-05-17', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-17', '2026-05-17', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('a0310ce5-060b-4937-ac78-051604e7e3bb', current_setting('importacao.proximo_numero')::int + 178, current_setting('importacao.cliente_id')::uuid, 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 2500.0, 2500.0, 0.0, '2026-05-17', '2026-05-17', '85e3aa42-b9af-49b8-a72a-64e9c337aa53');
UPDATE aparelhos SET venda_id = 'a0310ce5-060b-4937-ac78-051604e7e3bb' WHERE id = '3fc7d89a-d04d-41aa-bdd2-f819e32a0533';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('e22a9be8-31a8-4faa-b41d-680d80954a41', 'a0310ce5-060b-4937-ac78-051604e7e3bb', 'pix', 2500.0, '2026-05-17', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 1, '2026-05-17T14:00:00');

-- LINHA 182 [NAO]: IPAD 11 128GB AZUL NOVO (17/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('736f3565-d21e-42cb-bd84-4f90a4433704', 'Apple', 'IPAD 11 128GB AZUL NOVO', 'H7DR2GQ4ND', 2210.0, 2090.0, 1, 'novo', 'perfeito', 'vendido', '2026-05-17', '2026-05-17', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-17', '2026-05-17', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('b65ff278-d0eb-4a43-a2e7-3204b6db9c3f', current_setting('importacao.proximo_numero')::int + 179, current_setting('importacao.cliente_id')::uuid, 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 2210.0, 2210.0, 0.0, '2026-05-17', '2026-05-17', '85e3aa42-b9af-49b8-a72a-64e9c337aa53');
UPDATE aparelhos SET venda_id = 'b65ff278-d0eb-4a43-a2e7-3204b6db9c3f' WHERE id = '736f3565-d21e-42cb-bd84-4f90a4433704';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('50067547-d7c0-471a-ac96-e79ee970be69', 'b65ff278-d0eb-4a43-a2e7-3204b6db9c3f', 'pix', 2210.0, '2026-05-17', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 1, '2026-05-17T14:00:00');

-- LINHA 183 [NAO]: IPAD 11 128GB AMARELO NOVO (17/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('95a914fe-6656-4321-a476-a80117204275', 'Apple', 'IPAD 11 128GB AMARELO NOVO', 'H9K6QY9X17', 2650.0, 2090.0, 1, 'novo', 'perfeito', 'vendido', '2026-05-17', '2026-05-17', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-17', '2026-05-17', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('27998c19-9dd8-40a7-aa4b-42e9aeceb519', current_setting('importacao.proximo_numero')::int + 180, current_setting('importacao.cliente_id')::uuid, 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 2650.0, 2650.0, 0.0, '2026-05-17', '2026-05-17', '85e3aa42-b9af-49b8-a72a-64e9c337aa53');
UPDATE aparelhos SET venda_id = '27998c19-9dd8-40a7-aa4b-42e9aeceb519' WHERE id = '95a914fe-6656-4321-a476-a80117204275';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('4c1e747e-86fd-47ad-a5a3-111c5f89cfe2', '27998c19-9dd8-40a7-aa4b-42e9aeceb519', 'pix', 2650.0, '2026-05-17', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 1, '2026-05-17T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('04f9ddc4-d2c4-4f69-b92f-4c2b747ded67', 1, '27998c19-9dd8-40a7-aa4b-42e9aeceb519', 'Brinde', 100.0, '2026-05-17', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-17');

-- LINHA 184 [NAO]: IPHONE 12 128GB PRETO SEMINOVO (17/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('87f60f20-b723-4773-968e-17f675281bfb', 'Apple', 'IPHONE 12 128GB PRETO SEMINOVO', '356427673422437', 1702.0, 1250.0, 1, 'seminovo', 'bom', 'vendido', '2026-05-17', '2026-05-17', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-17', '2026-05-17', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('7161ec18-120b-402a-b34c-55b28126f532', current_setting('importacao.proximo_numero')::int + 181, current_setting('importacao.cliente_id')::uuid, 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 1702.0, 1702.0, 0.0, '2026-05-17', '2026-05-17', '85e3aa42-b9af-49b8-a72a-64e9c337aa53');
UPDATE aparelhos SET venda_id = '7161ec18-120b-402a-b34c-55b28126f532' WHERE id = '87f60f20-b723-4773-968e-17f675281bfb';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('4d80867c-cfbe-4c7e-8a94-d47f513a423b', '7161ec18-120b-402a-b34c-55b28126f532', 'pix', 1702.0, '2026-05-17', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 1, '2026-05-17T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('64d18388-67e4-4d30-b1ef-c8963dd603a8', 1, '7161ec18-120b-402a-b34c-55b28126f532', 'Brinde', 25.0, '2026-05-17', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-17');

-- LINHA 185 [NAO]: IPHONE 15 128GB ROSA SEMINOVO (17/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('70b35b16-92c2-4d36-ae11-e155b7a4c3ce', 'Apple', 'IPHONE 15 128GB ROSA SEMINOVO', NULL, 2896.0, 2750.0, 1, 'seminovo', 'bom', 'vendido', '2026-05-17', '2026-05-17', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-17', '2026-05-17', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('09bcbe3d-8f1d-4a72-a03f-c03741035028', current_setting('importacao.proximo_numero')::int + 182, current_setting('importacao.cliente_id')::uuid, 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 2896.0, 2896.0, 0.0, '2026-05-17', '2026-05-17', '85e3aa42-b9af-49b8-a72a-64e9c337aa53');
UPDATE aparelhos SET venda_id = '09bcbe3d-8f1d-4a72-a03f-c03741035028' WHERE id = '70b35b16-92c2-4d36-ae11-e155b7a4c3ce';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('33a66410-355b-4c85-bf4e-a647e541bc00', '09bcbe3d-8f1d-4a72-a03f-c03741035028', 'pix', 2896.0, '2026-05-17', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 1, '2026-05-17T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('fe7cec24-a8ef-4f34-bcdc-e75c0f21775b', 1, '09bcbe3d-8f1d-4a72-a03f-c03741035028', 'Brinde', 25.0, '2026-05-17', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-17');

-- LINHA 186 [SIM]: IPHONE 12 128GB AZUL SEMINOVO (17/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('27df0841-54d6-4569-bdd7-ce0169f15d60', 'Apple', 'IPHONE 12 128GB AZUL SEMINOVO', '357158819908414', 1450.0, 1250.0, 19, 'seminovo', 'bom', 'vendido', '2026-05-17', '2026-05-17', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-17', '2026-05-17', 'Vendedor Angel - pendente ID real');
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('143ede41-1717-4a71-8a63-a640ca12bc4b', current_setting('importacao.proximo_numero')::int + 183, current_setting('importacao.cliente_id')::uuid, 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 1450.0, 1450.0, 0.0, '2026-05-17', '2026-05-17', '97f12885-87ad-426a-8bbb-656889d82e10');
UPDATE aparelhos SET venda_id = '143ede41-1717-4a71-8a63-a640ca12bc4b' WHERE id = '27df0841-54d6-4569-bdd7-ce0169f15d60';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('23568f4f-de83-4bde-9b3d-b33c8da38797', '143ede41-1717-4a71-8a63-a640ca12bc4b', 'pix', 1450.0, '2026-05-17', '97f12885-87ad-426a-8bbb-656889d82e10', 1, '2026-05-17T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('5bcf92f1-3fc8-4545-95bb-2dd096a537ff', 19, '143ede41-1717-4a71-8a63-a640ca12bc4b', 'Brinde', 25.0, '2026-05-17', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-17');

-- LINHA 187 [NAO]: IPHONE 16 PRO 256GB NATURAL SEMINOVO (17/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('dc0e8f58-e254-4026-a883-ba13d30e7cbd', 'Apple', 'IPHONE 16 PRO 256GB NATURAL SEMINOVO', '358282722955921', 4800.0, 4500.0, 1, 'seminovo', 'bom', 'vendido', '2026-05-17', '2026-05-17', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-17', '2026-05-17', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('01212e3a-ebcd-4f49-bca0-dde0a419c6d8', current_setting('importacao.proximo_numero')::int + 184, current_setting('importacao.cliente_id')::uuid, 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 4800.0, 4800.0, 0.0, '2026-05-17', '2026-05-17', '85e3aa42-b9af-49b8-a72a-64e9c337aa53');
UPDATE aparelhos SET venda_id = '01212e3a-ebcd-4f49-bca0-dde0a419c6d8' WHERE id = 'dc0e8f58-e254-4026-a883-ba13d30e7cbd';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('0a6b1479-2ff0-4635-8fd6-582e09ed08bd', '01212e3a-ebcd-4f49-bca0-dde0a419c6d8', 'pix', 4800.0, '2026-05-17', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 1, '2026-05-17T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('8f0f3380-e1bf-4478-9432-556e01b35ef0', 1, '01212e3a-ebcd-4f49-bca0-dde0a419c6d8', 'Brinde', 10.0, '2026-05-17', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-17');

-- LINHA 188 [NAO]: REDMI NOTE 15 5G 256GB PRETO NOVO (19/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('d9c08946-4b53-4e6f-9d56-c25948b9517f', 'Xiaomi', 'REDMI NOTE 15 5G 256GB PRETO NOVO', '865292085370085', 1565.0, 1320.0, 1, 'novo', 'perfeito', 'vendido', '2026-05-19', '2026-05-19', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-19', '2026-05-19', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('089b02f4-7ca6-4422-9bf8-191744d31029', current_setting('importacao.proximo_numero')::int + 185, current_setting('importacao.cliente_id')::uuid, 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 1565.0, 1565.0, 0.0, '2026-05-19', '2026-05-19', '85e3aa42-b9af-49b8-a72a-64e9c337aa53');
UPDATE aparelhos SET venda_id = '089b02f4-7ca6-4422-9bf8-191744d31029' WHERE id = 'd9c08946-4b53-4e6f-9d56-c25948b9517f';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('2c81b3b9-f1cc-4004-af3b-7e4822be0c4d', '089b02f4-7ca6-4422-9bf8-191744d31029', 'pix', 1565.0, '2026-05-19', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 1, '2026-05-19T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('da4fb672-c86b-490f-a6c1-18516b31ba93', 1, '089b02f4-7ca6-4422-9bf8-191744d31029', 'Brinde', 10.0, '2026-05-19', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-19');

-- LINHA 189 [NAO]: NOTE 14 256GB PRETO LACRADO (19/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('d9fe683e-259b-4c97-a4b6-acc8a0676354', 'Redmi', 'NOTE 14 256GB PRETO LACRADO', '864093078872249', 1200.0, 1050.0, 1, 'novo', 'perfeito', 'vendido', '2026-05-19', '2026-05-19', '9451cd9f-6770-4e32-aae8-c75fa675e818', '2026-05-19', '2026-05-19', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('b1dbb88f-e129-4719-a3bc-bc9ac0304b59', current_setting('importacao.proximo_numero')::int + 186, current_setting('importacao.cliente_id')::uuid, 1, '9451cd9f-6770-4e32-aae8-c75fa675e818', 'concluida', 'normal', 1200.0, 1200.0, 0.0, '2026-05-19', '2026-05-19', '9451cd9f-6770-4e32-aae8-c75fa675e818');
UPDATE aparelhos SET venda_id = 'b1dbb88f-e129-4719-a3bc-bc9ac0304b59' WHERE id = 'd9fe683e-259b-4c97-a4b6-acc8a0676354';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('f0ce3cb9-a19e-4f86-94aa-17931bd4bce8', 'b1dbb88f-e129-4719-a3bc-bc9ac0304b59', 'pix', 1200.0, '2026-05-19', '9451cd9f-6770-4e32-aae8-c75fa675e818', 1, '2026-05-19T14:00:00');

-- LINHA 190 [NAO]: IPHONE 13 PRO MAX 128GB VERDE SEMINOVO (19/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('df694bea-454a-4f0e-ba25-ab31f9cd12f8', 'Apple', 'IPHONE 13 PRO MAX 128GB VERDE SEMINOVO', '350019049630201', 2939.0, 2600.0, 4, 'seminovo', 'bom', 'vendido', '2026-05-19', '2026-05-19', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-19', '2026-05-19', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('8e698aa8-a0e7-4588-ad0a-f6fdb6c7a18d', current_setting('importacao.proximo_numero')::int + 187, current_setting('importacao.cliente_id')::uuid, 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 2939.0, 2939.0, 0.0, '2026-05-19', '2026-05-19', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
UPDATE aparelhos SET venda_id = '8e698aa8-a0e7-4588-ad0a-f6fdb6c7a18d' WHERE id = 'df694bea-454a-4f0e-ba25-ab31f9cd12f8';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('9ba4b688-4983-4475-95e9-d49d870966ac', '8e698aa8-a0e7-4588-ad0a-f6fdb6c7a18d', 'pix', 2939.0, '2026-05-19', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1, '2026-05-19T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('1dc1b06f-60e1-4716-a089-e63041b0dcc8', 4, '8e698aa8-a0e7-4588-ad0a-f6fdb6c7a18d', 'Brinde', 65.0, '2026-05-19', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-19');

-- LINHA 191 [NAO]: BOOMBOX 4 LARANJA NOVO (19/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('9238a24f-5951-418b-855b-3abc0d8ab525', 'Outros', 'BOOMBOX 4 LARANJA NOVO', 'TL1973-BQ0009594', 2500.0, 2390.0, 4, 'novo', 'perfeito', 'vendido', '2026-05-19', '2026-05-19', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-19', '2026-05-19', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('7b7c4c93-2030-459c-9f14-7613fc8785fb', current_setting('importacao.proximo_numero')::int + 188, current_setting('importacao.cliente_id')::uuid, 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 2500.0, 2500.0, 0.0, '2026-05-19', '2026-05-19', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
UPDATE aparelhos SET venda_id = '7b7c4c93-2030-459c-9f14-7613fc8785fb' WHERE id = '9238a24f-5951-418b-855b-3abc0d8ab525';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('07a00a09-4b83-44c8-9331-5a50324c3f9e', '7b7c4c93-2030-459c-9f14-7613fc8785fb', 'pix', 2500.0, '2026-05-19', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1, '2026-05-19T14:00:00');

-- LINHA 192 [NAO]: IPAD AIR M3 11 256GB AZUL NOVO (19/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('f310e319-6bb3-41e2-8f34-26929dadd4fa', 'Apple', 'IPAD AIR M3 11 256GB AZUL NOVO', 'M4C404M6R6', 5200.0, 5050.0, 4, 'novo', 'perfeito', 'vendido', '2026-05-19', '2026-05-19', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-19', '2026-05-19', 'Pagto junto (Aparelho 1/2, total grupo R$ 13,500)');
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('26dada8e-ee88-40ed-86a9-6d1143ecbbbb', current_setting('importacao.proximo_numero')::int + 189, current_setting('importacao.cliente_id')::uuid, 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 5200.0, 5200.0, 0.0, '2026-05-19', '2026-05-19', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
UPDATE aparelhos SET venda_id = '26dada8e-ee88-40ed-86a9-6d1143ecbbbb' WHERE id = 'f310e319-6bb3-41e2-8f34-26929dadd4fa';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('493cab80-a2cc-4a6c-bd4c-36c0664f3d06', '26dada8e-ee88-40ed-86a9-6d1143ecbbbb', 'cartao_credito', 5200.0, '2026-05-19', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1, '2026-05-19T14:00:00');

-- LINHA 193 [NAO]: IPHONE 17 PRO MAX AZUL NOVO (19/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('425e1622-6c29-4645-9cd3-4beaedab5da2', 'Apple', 'IPHONE 17 PRO MAX AZUL NOVO', 'CQHPQG449Y', 8300.0, 8140.0, 4, 'novo', 'perfeito', 'vendido', '2026-05-19', '2026-05-19', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-19', '2026-05-19', 'Pagto junto (Aparelho 2/2, total grupo R$ 13,500)');
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('b0cae6e8-e454-4f65-ad29-24d78d9e8690', current_setting('importacao.proximo_numero')::int + 190, current_setting('importacao.cliente_id')::uuid, 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 8300.0, 8300.0, 0.0, '2026-05-19', '2026-05-19', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
UPDATE aparelhos SET venda_id = 'b0cae6e8-e454-4f65-ad29-24d78d9e8690' WHERE id = '425e1622-6c29-4645-9cd3-4beaedab5da2';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('9d015243-f8bb-4c73-9192-fcd1e524c70c', 'b0cae6e8-e454-4f65-ad29-24d78d9e8690', 'cartao_credito', 8300.0, '2026-05-19', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1, '2026-05-19T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('c98ebaa9-7c5a-4cef-983e-6cb792c80292', 4, 'b0cae6e8-e454-4f65-ad29-24d78d9e8690', 'Brinde', 15.0, '2026-05-19', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-19');

-- LINHA 194 [SIM]: IPAD 11° (A16) 128GB AMARELO NOVO (19/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('cb63de90-c4cd-4ba5-8955-97a71412a697', 'Apple', 'IPAD 11° (A16) 128GB AMARELO NOVO', NULL, 2297.0, 2090.0, 4, 'novo', 'perfeito', 'vendido', '2026-05-19', '2026-05-19', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-19', '2026-05-19', 'Sem IMEI');
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('a864c2a0-4c3c-4917-b2b6-8ec03cb874a0', current_setting('importacao.proximo_numero')::int + 191, current_setting('importacao.cliente_id')::uuid, 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 2297.0, 2297.0, 0.0, '2026-05-19', '2026-05-19', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
UPDATE aparelhos SET venda_id = 'a864c2a0-4c3c-4917-b2b6-8ec03cb874a0' WHERE id = 'cb63de90-c4cd-4ba5-8955-97a71412a697';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('d71b6a97-68e6-4841-9e42-e31920acc685', 'a864c2a0-4c3c-4917-b2b6-8ec03cb874a0', 'pix', 2297.0, '2026-05-19', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1, '2026-05-19T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('1070393a-89f1-4302-bb2e-ebde342031d8', 4, 'a864c2a0-4c3c-4917-b2b6-8ec03cb874a0', 'Brinde', 30.0, '2026-05-19', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-19');

-- LINHA 195 [NAO]: IPHONE 17 PRO MAX 512GB AZUL NOVO (19/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('87602fc3-1744-4698-8f19-3dc625697093', 'Apple', 'IPHONE 17 PRO MAX 512GB AZUL NOVO', '357329447819436', 9801.0, 9050.0, 1, 'novo', 'perfeito', 'vendido', '2026-05-19', '2026-05-19', '0dd2c938-c6dd-4f5d-aac5-ed045ee5d2fb', '2026-05-19', '2026-05-19', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('f3d1f715-982a-4be9-8cc0-c66ff09fb810', current_setting('importacao.proximo_numero')::int + 192, current_setting('importacao.cliente_id')::uuid, 1, '0dd2c938-c6dd-4f5d-aac5-ed045ee5d2fb', 'concluida', 'normal', 9801.0, 9801.0, 0.0, '2026-05-19', '2026-05-19', '0dd2c938-c6dd-4f5d-aac5-ed045ee5d2fb');
UPDATE aparelhos SET venda_id = 'f3d1f715-982a-4be9-8cc0-c66ff09fb810' WHERE id = '87602fc3-1744-4698-8f19-3dc625697093';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('a2fba276-0abf-460b-ad15-a95b850c9036', 'f3d1f715-982a-4be9-8cc0-c66ff09fb810', 'cartao_credito', 9801.0, '2026-05-19', '0dd2c938-c6dd-4f5d-aac5-ed045ee5d2fb', 1, '2026-05-19T14:00:00');

-- LINHA 196 [NAO]: IPHONE 16 PRO MAX 256GB PRETO SEMINOVO (19/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('3bb26966-f521-42d0-b3dc-842623ea5b4b', 'Apple', 'IPHONE 16 PRO MAX 256GB PRETO SEMINOVO', '355138326274957', 5400.0, 5150.0, 1, 'seminovo', 'bom', 'vendido', '2026-05-19', '2026-05-19', '0dd2c938-c6dd-4f5d-aac5-ed045ee5d2fb', '2026-05-19', '2026-05-19', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('fa17c453-071c-41c6-a6f5-686e3f997794', current_setting('importacao.proximo_numero')::int + 193, current_setting('importacao.cliente_id')::uuid, 1, '0dd2c938-c6dd-4f5d-aac5-ed045ee5d2fb', 'concluida', 'normal', 5400.0, 5400.0, 0.0, '2026-05-19', '2026-05-19', '0dd2c938-c6dd-4f5d-aac5-ed045ee5d2fb');
UPDATE aparelhos SET venda_id = 'fa17c453-071c-41c6-a6f5-686e3f997794' WHERE id = '3bb26966-f521-42d0-b3dc-842623ea5b4b';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('d8937228-ecff-4de8-9f34-a33b8002fd26', 'fa17c453-071c-41c6-a6f5-686e3f997794', 'pix', 5000.0, '2026-05-19', '0dd2c938-c6dd-4f5d-aac5-ed045ee5d2fb', 1, '2026-05-19T14:00:00');
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('05c3f41e-e265-41cb-ac8a-148de6c812f8', 'fa17c453-071c-41c6-a6f5-686e3f997794', 'dinheiro', 400.0, '2026-05-19', '0dd2c938-c6dd-4f5d-aac5-ed045ee5d2fb', 1, '2026-05-19T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('0279623f-1440-47cc-a670-a81082da3fb3', 1, 'fa17c453-071c-41c6-a6f5-686e3f997794', 'Brinde', 15.0, '2026-05-19', '0dd2c938-c6dd-4f5d-aac5-ed045ee5d2fb', '2026-05-19');

-- LINHA 197 [NAO]: IPHONE 16 128GB PRETO NOVO (19/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('00e242a1-e0f0-4e7b-9f71-856db78cc386', 'Apple', 'IPHONE 16 128GB PRETO NOVO', '3594', 4395.0, 4050.0, 4, 'novo', 'perfeito', 'vendido', '2026-05-19', '2026-05-19', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-19', '2026-05-19', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('4142ffef-ee95-44cb-b3f1-0678a1a4e20e', current_setting('importacao.proximo_numero')::int + 194, current_setting('importacao.cliente_id')::uuid, 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 4395.0, 4395.0, 0.0, '2026-05-19', '2026-05-19', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
UPDATE aparelhos SET venda_id = '4142ffef-ee95-44cb-b3f1-0678a1a4e20e' WHERE id = '00e242a1-e0f0-4e7b-9f71-856db78cc386';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('00f96016-f21a-441f-9399-845db59ae8fd', '4142ffef-ee95-44cb-b3f1-0678a1a4e20e', 'pix', 645.0, '2026-05-19', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1, '2026-05-19T14:00:00');
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('a69e7e5c-ea55-4ddd-af84-b48933824d01', '4142ffef-ee95-44cb-b3f1-0678a1a4e20e', 'cartao_credito', 2150.0, '2026-05-19', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1, '2026-05-19T14:00:00');
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, observacao, parcelas, criado_em)
VALUES ('8de504e6-3b55-430d-8e0f-a6dd6bf64fcd', '4142ffef-ee95-44cb-b3f1-0678a1a4e20e', 'troca_aparelho', 1600.0, '2026-05-19', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'Troca: 13 SEMINOVO', 1, '2026-05-19T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('36efeaf3-0fc1-4593-9367-fa4922e5efce', 4, '4142ffef-ee95-44cb-b3f1-0678a1a4e20e', 'Brinde', 115.0, '2026-05-19', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-19');

-- LINHA 198 [NAO]: IPAD 11 (A16) 128GB ROSA NOVO (19/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('5fcadd1a-70b6-41ab-958b-2d1585526822', 'Apple', 'IPAD 11 (A16) 128GB ROSA NOVO', 'JOK9N9RQM5', 2375.0, 2090.0, 4, 'novo', 'perfeito', 'vendido', '2026-05-19', '2026-05-19', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-19', '2026-05-19', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('e09d9790-fcbe-4538-825e-02303f4e965f', current_setting('importacao.proximo_numero')::int + 195, current_setting('importacao.cliente_id')::uuid, 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 2375.0, 2375.0, 0.0, '2026-05-19', '2026-05-19', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
UPDATE aparelhos SET venda_id = 'e09d9790-fcbe-4538-825e-02303f4e965f' WHERE id = '5fcadd1a-70b6-41ab-958b-2d1585526822';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('8bf06973-8249-4c31-81d1-83e6dbae4653', 'e09d9790-fcbe-4538-825e-02303f4e965f', 'pix', 75.0, '2026-05-19', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1, '2026-05-19T14:00:00');
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('b36b9d73-fedf-489e-b057-14752baf4d3d', 'e09d9790-fcbe-4538-825e-02303f4e965f', 'cartao_credito', 2300.0, '2026-05-19', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1, '2026-05-19T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('43fe44a1-0e5f-482f-8863-ed8cad5bd840', 4, 'e09d9790-fcbe-4538-825e-02303f4e965f', 'Brinde', 60.0, '2026-05-19', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-19');

-- LINHA 199 [NAO]: IPHONE 13 128GB PRETO NOVO (19/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('9e7e4c6f-1b8f-4295-83be-643678eb6476', 'Apple', 'IPHONE 13 128GB PRETO NOVO', '353306207461637', 2850.0, 2700.0, 19, 'novo', 'perfeito', 'vendido', '2026-05-19', '2026-05-19', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-19', '2026-05-19', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('a2f0d444-6bd5-4797-8b21-aabd74122226', current_setting('importacao.proximo_numero')::int + 196, current_setting('importacao.cliente_id')::uuid, 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 2850.0, 2850.0, 0.0, '2026-05-19', '2026-05-19', '97f12885-87ad-426a-8bbb-656889d82e10');
UPDATE aparelhos SET venda_id = 'a2f0d444-6bd5-4797-8b21-aabd74122226' WHERE id = '9e7e4c6f-1b8f-4295-83be-643678eb6476';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('3457f7c3-8227-41a8-bcde-fb912ad7a5cb', 'a2f0d444-6bd5-4797-8b21-aabd74122226', 'pix', 2850.0, '2026-05-19', '97f12885-87ad-426a-8bbb-656889d82e10', 1, '2026-05-19T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('00e711d0-4cc6-4e8d-b9cc-28b4bba8a6e3', 19, 'a2f0d444-6bd5-4797-8b21-aabd74122226', 'Brinde', 20.0, '2026-05-19', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-19');

-- LINHA 200 [NAO]: IPHONE 15 256GB PRETO SEMINOVO (19/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('11e58900-074e-403f-87fc-f0ddb5f3ddef', 'Apple', 'IPHONE 15 256GB PRETO SEMINOVO', '356942572731144', 3200.0, 2900.0, 19, 'seminovo', 'bom', 'vendido', '2026-05-19', '2026-05-19', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-19', '2026-05-19', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('438982c7-fb58-4d0b-8dff-f1055817bd04', current_setting('importacao.proximo_numero')::int + 197, current_setting('importacao.cliente_id')::uuid, 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 3200.0, 3200.0, 0.0, '2026-05-19', '2026-05-19', '97f12885-87ad-426a-8bbb-656889d82e10');
UPDATE aparelhos SET venda_id = '438982c7-fb58-4d0b-8dff-f1055817bd04' WHERE id = '11e58900-074e-403f-87fc-f0ddb5f3ddef';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('10cb564e-da1a-4ce8-b00c-87114545d72c', '438982c7-fb58-4d0b-8dff-f1055817bd04', 'pix', 1500.0, '2026-05-19', '97f12885-87ad-426a-8bbb-656889d82e10', 1, '2026-05-19T14:00:00');
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, observacao, parcelas, criado_em)
VALUES ('0c0ed5dd-5165-4039-b4f2-3980055c2937', '438982c7-fb58-4d0b-8dff-f1055817bd04', 'troca_aparelho', 1700.0, '2026-05-19', '97f12885-87ad-426a-8bbb-656889d82e10', 'Troca: IPH 13 128GB PRETO', 1, '2026-05-19T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('1260aca4-8fa6-4ee4-b959-b24d1e23cf4c', 19, '438982c7-fb58-4d0b-8dff-f1055817bd04', 'Brinde', 25.0, '2026-05-19', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-19');

-- LINHA 201 [NAO]: IPHONE 17 PRO SILVER 256GB SEMINOVO (19/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('da05aabd-263e-403f-bd8c-2800f187b11b', 'Apple', 'IPHONE 17 PRO SILVER 256GB SEMINOVO', '356697786132668', 6800.0, 6100.0, 19, 'seminovo', 'bom', 'vendido', '2026-05-19', '2026-05-19', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-19', '2026-05-19', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('66555bb2-13f0-4977-9ec7-ac8233c9c921', current_setting('importacao.proximo_numero')::int + 198, current_setting('importacao.cliente_id')::uuid, 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 6800.0, 6800.0, 0.0, '2026-05-19', '2026-05-19', '97f12885-87ad-426a-8bbb-656889d82e10');
UPDATE aparelhos SET venda_id = '66555bb2-13f0-4977-9ec7-ac8233c9c921' WHERE id = 'da05aabd-263e-403f-bd8c-2800f187b11b';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('f919967c-39d5-4987-8289-3eb826c17dbe', '66555bb2-13f0-4977-9ec7-ac8233c9c921', 'dinheiro', 3400.0, '2026-05-19', '97f12885-87ad-426a-8bbb-656889d82e10', 1, '2026-05-19T14:00:00');
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, observacao, parcelas, criado_em)
VALUES ('4a8899e0-a11b-4b6b-9b9d-9db65ca0e30b', '66555bb2-13f0-4977-9ec7-ac8233c9c921', 'troca_aparelho', 3400.0, '2026-05-19', '97f12885-87ad-426a-8bbb-656889d82e10', 'Troca: IPH 15 PRO 256GB', 1, '2026-05-19T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('13d58f92-a105-4937-8a8f-45345a9abf3f', 19, '66555bb2-13f0-4977-9ec7-ac8233c9c921', 'Brinde', 25.0, '2026-05-19', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-19');

-- LINHA 202 [NAO]: IPHONE 13 PRO MAX 256GB DOURADO SEMINOVO (19/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('3c108ae2-a7ce-4b4b-812b-537af579af71', 'Apple', 'IPHONE 13 PRO MAX 256GB DOURADO SEMINOVO', '351596240328544', 3250.0, 2900.0, 20, 'seminovo', 'bom', 'vendido', '2026-05-19', '2026-05-19', '25e2da5b-9e76-4388-9890-7e22efd6940d', '2026-05-19', '2026-05-19', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('a6356bdf-d3ff-44f1-87c3-299e925051f0', current_setting('importacao.proximo_numero')::int + 199, current_setting('importacao.cliente_id')::uuid, 20, '25e2da5b-9e76-4388-9890-7e22efd6940d', 'concluida', 'normal', 3250.0, 3250.0, 0.0, '2026-05-19', '2026-05-19', '25e2da5b-9e76-4388-9890-7e22efd6940d');
UPDATE aparelhos SET venda_id = 'a6356bdf-d3ff-44f1-87c3-299e925051f0' WHERE id = '3c108ae2-a7ce-4b4b-812b-537af579af71';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('1cab02f8-0586-4c67-971a-12750a72f83d', 'a6356bdf-d3ff-44f1-87c3-299e925051f0', 'dinheiro', 3250.0, '2026-05-19', '25e2da5b-9e76-4388-9890-7e22efd6940d', 1, '2026-05-19T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('6caf2d40-c3db-46cf-92c4-829705fa877b', 20, 'a6356bdf-d3ff-44f1-87c3-299e925051f0', 'Brinde', 50.0, '2026-05-19', '25e2da5b-9e76-4388-9890-7e22efd6940d', '2026-05-19');

-- LINHA 203 [NAO]: IPAD 11 128GB SILVER SEMINOVO (19/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('9096b90f-e95f-484d-b02c-b092c413d4d0', 'Apple', 'IPAD 11 128GB SILVER SEMINOVO', 'DY02NX9J6V', 2490.0, 2160.0, 20, 'seminovo', 'bom', 'vendido', '2026-05-19', '2026-05-19', '25e2da5b-9e76-4388-9890-7e22efd6940d', '2026-05-19', '2026-05-19', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('11a711a5-5d16-4a42-b150-811297f0756f', current_setting('importacao.proximo_numero')::int + 200, current_setting('importacao.cliente_id')::uuid, 20, '25e2da5b-9e76-4388-9890-7e22efd6940d', 'concluida', 'normal', 2490.0, 2490.0, 0.0, '2026-05-19', '2026-05-19', '25e2da5b-9e76-4388-9890-7e22efd6940d');
UPDATE aparelhos SET venda_id = '11a711a5-5d16-4a42-b150-811297f0756f' WHERE id = '9096b90f-e95f-484d-b02c-b092c413d4d0';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('ed473be0-b857-4326-b96a-cdf4d8efe489', '11a711a5-5d16-4a42-b150-811297f0756f', 'dinheiro', 2490.0, '2026-05-19', '25e2da5b-9e76-4388-9890-7e22efd6940d', 1, '2026-05-19T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('5573f259-1853-4ee1-9f1d-c82e3cec705a', 20, '11a711a5-5d16-4a42-b150-811297f0756f', 'Brinde', 75.0, '2026-05-19', '25e2da5b-9e76-4388-9890-7e22efd6940d', '2026-05-19');

-- LINHA 204 [NAO]: APPLE PENCIL USB-C BRANCO SEMINOVO (19/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('9dd63b8a-d2f0-43b3-b485-99c195247f3f', 'Apple', 'APPLE PENCIL USB-C BRANCO SEMINOVO', 'DV2GQYL2VR', 780.0, 630.0, 20, 'seminovo', 'bom', 'vendido', '2026-05-19', '2026-05-19', '25e2da5b-9e76-4388-9890-7e22efd6940d', '2026-05-19', '2026-05-19', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('539b5603-4568-4b55-a63f-755efbe2d772', current_setting('importacao.proximo_numero')::int + 201, current_setting('importacao.cliente_id')::uuid, 20, '25e2da5b-9e76-4388-9890-7e22efd6940d', 'concluida', 'normal', 780.0, 780.0, 0.0, '2026-05-19', '2026-05-19', '25e2da5b-9e76-4388-9890-7e22efd6940d');
UPDATE aparelhos SET venda_id = '539b5603-4568-4b55-a63f-755efbe2d772' WHERE id = '9dd63b8a-d2f0-43b3-b485-99c195247f3f';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('ed8a8912-402c-439d-9c8f-7b33d8ad1626', '539b5603-4568-4b55-a63f-755efbe2d772', 'dinheiro', 780.0, '2026-05-19', '25e2da5b-9e76-4388-9890-7e22efd6940d', 1, '2026-05-19T14:00:00');

-- LINHA 205 [NAO]: IPHONE XS 256GB PRETO SEMINOVO (19/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('e0e406f6-cfc4-4a60-b189-6922a1e06feb', 'Apple', 'IPHONE XS 256GB PRETO SEMINOVO', '353048093488114', 775.0, 350.0, 20, 'seminovo', 'bom', 'vendido', '2026-05-19', '2026-05-19', '25e2da5b-9e76-4388-9890-7e22efd6940d', '2026-05-19', '2026-05-19', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('8fde6684-bf55-427f-b5f7-a717beba5df7', current_setting('importacao.proximo_numero')::int + 202, current_setting('importacao.cliente_id')::uuid, 20, '25e2da5b-9e76-4388-9890-7e22efd6940d', 'concluida', 'normal', 775.0, 775.0, 0.0, '2026-05-19', '2026-05-19', '25e2da5b-9e76-4388-9890-7e22efd6940d');
UPDATE aparelhos SET venda_id = '8fde6684-bf55-427f-b5f7-a717beba5df7' WHERE id = 'e0e406f6-cfc4-4a60-b189-6922a1e06feb';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('41603612-4cf8-41f8-861d-2e957fae08ad', '8fde6684-bf55-427f-b5f7-a717beba5df7', 'pix', 775.0, '2026-05-19', '25e2da5b-9e76-4388-9890-7e22efd6940d', 1, '2026-05-19T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('32f1e5b8-848c-4e1e-9707-254370d41cf6', 20, '8fde6684-bf55-427f-b5f7-a717beba5df7', 'Brinde', 40.0, '2026-05-19', '25e2da5b-9e76-4388-9890-7e22efd6940d', '2026-05-19');

-- LINHA 206 [SIM]: IPHONE 12 PRO 256GB BRANCO SEMINOVO (19/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('7afec35e-f66d-4f24-9706-23bee9506aca', 'Apple', 'IPHONE 12 PRO 256GB BRANCO SEMINOVO', '353074114042706', 2200.0, 1900.0, 19, 'seminovo', 'bom', 'vendido', '2026-05-19', '2026-05-19', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-19', '2026-05-19', 'Vendedor Angel - pendente ID real');
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('4894be55-114c-4861-969c-9143fa3cccf8', current_setting('importacao.proximo_numero')::int + 203, current_setting('importacao.cliente_id')::uuid, 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 2200.0, 2200.0, 0.0, '2026-05-19', '2026-05-19', '97f12885-87ad-426a-8bbb-656889d82e10');
UPDATE aparelhos SET venda_id = '4894be55-114c-4861-969c-9143fa3cccf8' WHERE id = '7afec35e-f66d-4f24-9706-23bee9506aca';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('cfe283c1-ae49-4e87-8a3c-ec0f0caeb5c2', '4894be55-114c-4861-969c-9143fa3cccf8', 'pix', 2200.0, '2026-05-19', '97f12885-87ad-426a-8bbb-656889d82e10', 1, '2026-05-19T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('bbd704ba-3048-41c6-b95d-f23038bea5e6', 19, '4894be55-114c-4861-969c-9143fa3cccf8', 'Brinde', 8.0, '2026-05-19', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-19');

-- LINHA 207 [NAO]: IPHONE 17 PRO MAX LARANJA 2 TB NOVO (19/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('64a942f1-5c79-47b1-b175-ba5afd93ff4a', 'Apple', 'IPHONE 17 PRO MAX LARANJA 2 TB NOVO', '350025974181243', 12719.0, 11800.0, 1, 'novo', 'perfeito', 'vendido', '2026-05-19', '2026-05-19', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-19', '2026-05-19', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('9c982a76-a353-446a-8a01-63adf8c279e5', current_setting('importacao.proximo_numero')::int + 204, current_setting('importacao.cliente_id')::uuid, 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 12719.0, 12719.0, 0.0, '2026-05-19', '2026-05-19', '85e3aa42-b9af-49b8-a72a-64e9c337aa53');
UPDATE aparelhos SET venda_id = '9c982a76-a353-446a-8a01-63adf8c279e5' WHERE id = '64a942f1-5c79-47b1-b175-ba5afd93ff4a';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('ea20d4c0-8141-4c1e-90cd-f971625fa84b', '9c982a76-a353-446a-8a01-63adf8c279e5', 'pix', 12719.0, '2026-05-19', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 1, '2026-05-19T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('57c8b098-7e7b-4c20-9445-b2914b7f3640', 1, '9c982a76-a353-446a-8a01-63adf8c279e5', 'Brinde', 25.0, '2026-05-19', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-19');

-- LINHA 208 [NAO]: BOOMBOX 4 PRETA SEMINOVO (20/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('b89cffb2-f9fb-4095-8da1-1fb8ee820e8f', 'Outros', 'BOOMBOX 4 PRETA SEMINOVO', 'TL1876-JP0086240', 2350.0, 2350.0, 4, 'seminovo', 'bom', 'vendido', '2026-05-20', '2026-05-20', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-20', '2026-05-20', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('838f7c5e-395e-411a-a4bd-da0cfb03c1ba', current_setting('importacao.proximo_numero')::int + 205, current_setting('importacao.cliente_id')::uuid, 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 2350.0, 2350.0, 0.0, '2026-05-20', '2026-05-20', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
UPDATE aparelhos SET venda_id = '838f7c5e-395e-411a-a4bd-da0cfb03c1ba' WHERE id = 'b89cffb2-f9fb-4095-8da1-1fb8ee820e8f';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('13018d9c-9013-403b-898c-8cf5d2f1a8a4', '838f7c5e-395e-411a-a4bd-da0cfb03c1ba', 'dinheiro', 2350.0, '2026-05-20', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1, '2026-05-20T14:00:00');

-- LINHA 209 [NAO]: IPHONE 14 128GB PRETA SEMINOVO (20/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('006a428b-7834-477f-8bbf-4345d51ae82c', 'Apple', 'IPHONE 14 128GB PRETA SEMINOVO', '359014536509969', 2350.0, 2000.0, 1, 'seminovo', 'bom', 'vendido', '2026-05-20', '2026-05-20', '9451cd9f-6770-4e32-aae8-c75fa675e818', '2026-05-20', '2026-05-20', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('85c966d4-c70a-4ec4-82ad-0b50cd5e80c5', current_setting('importacao.proximo_numero')::int + 206, current_setting('importacao.cliente_id')::uuid, 1, '9451cd9f-6770-4e32-aae8-c75fa675e818', 'concluida', 'normal', 2350.0, 2350.0, 0.0, '2026-05-20', '2026-05-20', '9451cd9f-6770-4e32-aae8-c75fa675e818');
UPDATE aparelhos SET venda_id = '85c966d4-c70a-4ec4-82ad-0b50cd5e80c5' WHERE id = '006a428b-7834-477f-8bbf-4345d51ae82c';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('91147fbd-ab52-4fb3-b215-537764884aa5', '85c966d4-c70a-4ec4-82ad-0b50cd5e80c5', 'pix', 2350.0, '2026-05-20', '9451cd9f-6770-4e32-aae8-c75fa675e818', 1, '2026-05-20T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('be978afd-c57b-42ca-a858-b632140479c6', 1, '85c966d4-c70a-4ec4-82ad-0b50cd5e80c5', 'Brinde', 25.0, '2026-05-20', '9451cd9f-6770-4e32-aae8-c75fa675e818', '2026-05-20');

-- LINHA 210 [NAO]: BOOMBOX 4 LARANJA NOVO (20/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('032e0e18-ebae-461e-9cdd-65b421486b2c', 'Outros', 'BOOMBOX 4 LARANJA NOVO', 'TL1973-BQ0009916', 2450.0, 2390.0, 19, 'novo', 'perfeito', 'vendido', '2026-05-20', '2026-05-20', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-20', '2026-05-20', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('723f7dab-e7f4-4751-a8df-f84370b0237d', current_setting('importacao.proximo_numero')::int + 207, current_setting('importacao.cliente_id')::uuid, 19, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 2450.0, 2450.0, 0.0, '2026-05-20', '2026-05-20', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
UPDATE aparelhos SET venda_id = '723f7dab-e7f4-4751-a8df-f84370b0237d' WHERE id = '032e0e18-ebae-461e-9cdd-65b421486b2c';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('03515f02-dc67-40da-aa5a-af14c00a8c07', '723f7dab-e7f4-4751-a8df-f84370b0237d', 'pix', 2450.0, '2026-05-20', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1, '2026-05-20T14:00:00');

-- LINHA 211 [NAO]: REDMI PAD 2 256GB PRETO NOVO (20/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('6b9fe154-e4e4-401b-921d-ecfcd7bd4553', 'Xiaomi', 'REDMI PAD 2 256GB PRETO NOVO', '65577/W6N400397', 1500.0, 1200.0, 20, 'novo', 'perfeito', 'vendido', '2026-05-20', '2026-05-20', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', '2026-05-20', '2026-05-20', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('fcb04050-615a-4490-b255-fb7c103a154b', current_setting('importacao.proximo_numero')::int + 208, current_setting('importacao.cliente_id')::uuid, 20, 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 'concluida', 'normal', 1500.0, 1500.0, 0.0, '2026-05-20', '2026-05-20', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4');
UPDATE aparelhos SET venda_id = 'fcb04050-615a-4490-b255-fb7c103a154b' WHERE id = '6b9fe154-e4e4-401b-921d-ecfcd7bd4553';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('76687965-0080-49ba-aca2-033b77b64715', 'fcb04050-615a-4490-b255-fb7c103a154b', 'cartao_credito', 1500.0, '2026-05-20', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 1, '2026-05-20T14:00:00');

-- LINHA 212 [NAO]: IPHONE 17 PRO MAX 256GB AZUL NOVO (20/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('2d7c67e0-1efc-4da4-a8e4-74e7a3e4e541', 'Apple', 'IPHONE 17 PRO MAX 256GB AZUL NOVO', '357247257122859', 8400.0, 8000.0, 1, 'novo', 'perfeito', 'vendido', '2026-05-20', '2026-05-20', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-20', '2026-05-20', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('79a60e8e-ae38-4483-8b5b-39ac08263785', current_setting('importacao.proximo_numero')::int + 209, current_setting('importacao.cliente_id')::uuid, 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 8400.0, 8400.0, 0.0, '2026-05-20', '2026-05-20', '85e3aa42-b9af-49b8-a72a-64e9c337aa53');
UPDATE aparelhos SET venda_id = '79a60e8e-ae38-4483-8b5b-39ac08263785' WHERE id = '2d7c67e0-1efc-4da4-a8e4-74e7a3e4e541';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('e0edab97-94f3-494f-9c7b-f5e4800521fe', '79a60e8e-ae38-4483-8b5b-39ac08263785', 'pix', 7900.0, '2026-05-20', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 1, '2026-05-20T14:00:00');
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, observacao, parcelas, criado_em)
VALUES ('5075fa9a-f13d-43e0-ba15-55ed97dba873', '79a60e8e-ae38-4483-8b5b-39ac08263785', 'troca_aparelho', 500.0, '2026-05-20', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'Troca: IPH 11 PRO MAX 512GB', 1, '2026-05-20T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('17b7c6ab-b6de-451d-8e6a-43e6aae1138c', 1, '79a60e8e-ae38-4483-8b5b-39ac08263785', 'Brinde', 25.0, '2026-05-20', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-20');

-- LINHA 213 [NAO]: IPAD 11 128GB SILVER NOVO (20/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('11c10635-28ad-49b5-b612-2ebbd07a31b7', 'Apple', 'IPAD 11 128GB SILVER NOVO', 'MPNH609W5X', 2850.0, 2160.0, 1, 'novo', 'perfeito', 'vendido', '2026-05-20', '2026-05-20', '1d12d555-68e9-45f8-bfc0-a35a1d8d7920', '2026-05-20', '2026-05-20', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('231f3c5e-79da-4081-a2ef-a93f1f12764c', current_setting('importacao.proximo_numero')::int + 210, current_setting('importacao.cliente_id')::uuid, 1, '1d12d555-68e9-45f8-bfc0-a35a1d8d7920', 'concluida', 'normal', 2850.0, 2850.0, 0.0, '2026-05-20', '2026-05-20', '1d12d555-68e9-45f8-bfc0-a35a1d8d7920');
UPDATE aparelhos SET venda_id = '231f3c5e-79da-4081-a2ef-a93f1f12764c' WHERE id = '11c10635-28ad-49b5-b612-2ebbd07a31b7';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('95a2c00e-164c-4745-af8a-23d35240fbef', '231f3c5e-79da-4081-a2ef-a93f1f12764c', 'dinheiro', 2850.0, '2026-05-20', '1d12d555-68e9-45f8-bfc0-a35a1d8d7920', 1, '2026-05-20T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('953f256a-f55f-4eb9-980a-edb0b58f8453', 1, '231f3c5e-79da-4081-a2ef-a93f1f12764c', 'Brinde', 150.0, '2026-05-20', '1d12d555-68e9-45f8-bfc0-a35a1d8d7920', '2026-05-20');

-- LINHA 214 [NAO]: IPHONE 11 128GB VERMELHO SEMINOVO (20/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('827c00c7-d28f-40ac-bc71-fb325118d4d2', 'Apple', 'IPHONE 11 128GB VERMELHO SEMINOVO', '352991115545133', 1050.0, 800.0, 20, 'seminovo', 'bom', 'vendido', '2026-05-20', '2026-05-20', '25e2da5b-9e76-4388-9890-7e22efd6940d', '2026-05-20', '2026-05-20', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('6c652d7b-bc6c-42de-bc06-df0c83e77d79', current_setting('importacao.proximo_numero')::int + 211, current_setting('importacao.cliente_id')::uuid, 20, '25e2da5b-9e76-4388-9890-7e22efd6940d', 'concluida', 'normal', 1050.0, 1050.0, 0.0, '2026-05-20', '2026-05-20', '25e2da5b-9e76-4388-9890-7e22efd6940d');
UPDATE aparelhos SET venda_id = '6c652d7b-bc6c-42de-bc06-df0c83e77d79' WHERE id = '827c00c7-d28f-40ac-bc71-fb325118d4d2';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('e93e79d8-6f9a-447d-b880-93eb869de7cb', '6c652d7b-bc6c-42de-bc06-df0c83e77d79', 'pix', 1050.0, '2026-05-20', '25e2da5b-9e76-4388-9890-7e22efd6940d', 1, '2026-05-20T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('83a03ccb-2279-4a0a-84a7-68149c3c9406', 20, '6c652d7b-bc6c-42de-bc06-df0c83e77d79', 'Brinde', 25.0, '2026-05-20', '25e2da5b-9e76-4388-9890-7e22efd6940d', '2026-05-20');

-- LINHA 215 [NAO]: POCO X8 PRO MAX 512GB PRETO SEMINOVO (20/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('9b69880d-3cd0-42aa-8d38-4f7d4adfb56e', 'Outros', 'POCO X8 PRO MAX 512GB PRETO SEMINOVO', '860534087542582', 3300.0, 3200.0, 19, 'seminovo', 'bom', 'vendido', '2026-05-20', '2026-05-20', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-20', '2026-05-20', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('b361a92a-5e41-4df4-aeac-975d9bc666c0', current_setting('importacao.proximo_numero')::int + 212, current_setting('importacao.cliente_id')::uuid, 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 3300.0, 3300.0, 0.0, '2026-05-20', '2026-05-20', '97f12885-87ad-426a-8bbb-656889d82e10');
UPDATE aparelhos SET venda_id = 'b361a92a-5e41-4df4-aeac-975d9bc666c0' WHERE id = '9b69880d-3cd0-42aa-8d38-4f7d4adfb56e';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('fff60459-e3b5-4a23-93e1-3c9a5a1885b0', 'b361a92a-5e41-4df4-aeac-975d9bc666c0', 'pix', 3300.0, '2026-05-20', '97f12885-87ad-426a-8bbb-656889d82e10', 1, '2026-05-20T14:00:00');

-- LINHA 216 [NAO]: MAC AIR M5 16 512GB SILVER NOVO (20/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('6475d809-bec7-45fe-87a2-5b881f166de3', 'Apple', 'MAC AIR M5 16 512GB SILVER NOVO', 'JYW40659KX', 7550.0, 6800.0, 19, 'novo', 'perfeito', 'vendido', '2026-05-20', '2026-05-20', '85743f3e-1b32-49c0-9d9e-c16afd690f7d', '2026-05-20', '2026-05-20', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('943d6cae-b6d8-40b7-9edf-a4ec87d644b5', current_setting('importacao.proximo_numero')::int + 213, current_setting('importacao.cliente_id')::uuid, 19, '85743f3e-1b32-49c0-9d9e-c16afd690f7d', 'concluida', 'normal', 7550.0, 7550.0, 0.0, '2026-05-20', '2026-05-20', '85743f3e-1b32-49c0-9d9e-c16afd690f7d');
UPDATE aparelhos SET venda_id = '943d6cae-b6d8-40b7-9edf-a4ec87d644b5' WHERE id = '6475d809-bec7-45fe-87a2-5b881f166de3';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('2b6abf9a-9070-49d8-bbf0-d0ee65fdfa5d', '943d6cae-b6d8-40b7-9edf-a4ec87d644b5', 'pix', 7550.0, '2026-05-20', '85743f3e-1b32-49c0-9d9e-c16afd690f7d', 1, '2026-05-20T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('6dc73b44-9686-4227-9fee-b885cf8d61af', 19, '943d6cae-b6d8-40b7-9edf-a4ec87d644b5', 'Brinde', 50.0, '2026-05-20', '85743f3e-1b32-49c0-9d9e-c16afd690f7d', '2026-05-20');

-- LINHA 217 [NAO]: REDMI PAD 2 256GB SPACE GRAY NOVO (21/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('2617012c-f065-4119-bb4a-05edea9ebd69', 'Xiaomi', 'REDMI PAD 2 256GB SPACE GRAY NOVO', '65577/W6PT05147', 1655.0, 1200.0, 19, 'novo', 'perfeito', 'vendido', '2026-05-21', '2026-05-21', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-21', '2026-05-21', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('63bd120b-03a5-4317-808e-92a085d43120', current_setting('importacao.proximo_numero')::int + 214, current_setting('importacao.cliente_id')::uuid, 19, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 1655.0, 1655.0, 0.0, '2026-05-21', '2026-05-21', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
UPDATE aparelhos SET venda_id = '63bd120b-03a5-4317-808e-92a085d43120' WHERE id = '2617012c-f065-4119-bb4a-05edea9ebd69';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('e693ca37-1533-4efd-96bf-9cac52211127', '63bd120b-03a5-4317-808e-92a085d43120', 'pix', 1655.0, '2026-05-21', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1, '2026-05-21T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('3da7b8d6-b3ad-4787-8aff-b60ea117150f', 19, '63bd120b-03a5-4317-808e-92a085d43120', 'Brinde', 90.0, '2026-05-21', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-21');

-- LINHA 218 [NAO]: IPHONE 17 PRO 256GB AZUL NOVO (21/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('097aff15-20a7-4705-8312-98abe2543f88', 'Apple', 'IPHONE 17 PRO 256GB AZUL NOVO', '359477633542185', 7940.0, 7300.0, 1, 'novo', 'perfeito', 'vendido', '2026-05-21', '2026-05-21', '0dd2c938-c6dd-4f5d-aac5-ed045ee5d2fb', '2026-05-21', '2026-05-21', 'Pagto junto (Aparelho 1/2, total grupo R$ 15,880)');
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('7c7a6a54-2a85-40b4-b37b-206888d93a9a', current_setting('importacao.proximo_numero')::int + 215, current_setting('importacao.cliente_id')::uuid, 1, '0dd2c938-c6dd-4f5d-aac5-ed045ee5d2fb', 'concluida', 'normal', 7940.0, 7940.0, 0.0, '2026-05-21', '2026-05-21', '0dd2c938-c6dd-4f5d-aac5-ed045ee5d2fb');
UPDATE aparelhos SET venda_id = '7c7a6a54-2a85-40b4-b37b-206888d93a9a' WHERE id = '097aff15-20a7-4705-8312-98abe2543f88';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('ea6ab01e-d015-4a8d-bc65-fb818dc7e2e2', '7c7a6a54-2a85-40b4-b37b-206888d93a9a', 'cartao_credito', 6040.0, '2026-05-21', '0dd2c938-c6dd-4f5d-aac5-ed045ee5d2fb', 1, '2026-05-21T14:00:00');
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, observacao, parcelas, criado_em)
VALUES ('f04be810-2d9e-4620-8fd0-bc2f9c785c4b', '7c7a6a54-2a85-40b4-b37b-206888d93a9a', 'troca_aparelho', 1900.0, '2026-05-21', '0dd2c938-c6dd-4f5d-aac5-ed045ee5d2fb', 'Troca: IPH 12 PRO MAX 128GB', 1, '2026-05-21T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('be7c6876-7f0c-4dcf-8f1b-6396af9c2e1e', 1, '7c7a6a54-2a85-40b4-b37b-206888d93a9a', 'Brinde', 10.0, '2026-05-21', '0dd2c938-c6dd-4f5d-aac5-ed045ee5d2fb', '2026-05-21');

-- LINHA 219 [NAO]: IPHONE 17 PRO 256GB SILVER NOVO (21/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('f135667b-749b-46be-9bb9-0dd0b0401afb', 'Apple', 'IPHONE 17 PRO 256GB SILVER NOVO', '352574671892816', 7940.0, 7400.0, 1, 'novo', 'perfeito', 'vendido', '2026-05-21', '2026-05-21', '0dd2c938-c6dd-4f5d-aac5-ed045ee5d2fb', '2026-05-21', '2026-05-21', 'Pagto junto (Aparelho 2/2, total grupo R$ 15,880)');
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('d00d3eab-8afc-40af-8778-2644dbc348f3', current_setting('importacao.proximo_numero')::int + 216, current_setting('importacao.cliente_id')::uuid, 1, '0dd2c938-c6dd-4f5d-aac5-ed045ee5d2fb', 'concluida', 'normal', 7940.0, 7940.0, 0.0, '2026-05-21', '2026-05-21', '0dd2c938-c6dd-4f5d-aac5-ed045ee5d2fb');
UPDATE aparelhos SET venda_id = 'd00d3eab-8afc-40af-8778-2644dbc348f3' WHERE id = 'f135667b-749b-46be-9bb9-0dd0b0401afb';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('9dc3c843-9828-4306-8062-9df44f2c77a6', 'd00d3eab-8afc-40af-8778-2644dbc348f3', 'cartao_credito', 7940.0, '2026-05-21', '0dd2c938-c6dd-4f5d-aac5-ed045ee5d2fb', 1, '2026-05-21T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('35fea23f-2172-48e7-b181-792487489f7c', 1, 'd00d3eab-8afc-40af-8778-2644dbc348f3', 'Brinde', 10.0, '2026-05-21', '0dd2c938-c6dd-4f5d-aac5-ed045ee5d2fb', '2026-05-21');

-- LINHA 220 [NAO]: IPHONE 17 PRO 256GB SILVER SEMINOVO (21/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('13639e94-574c-4a9b-babc-44d2f7ecdb6e', 'Apple', 'IPHONE 17 PRO 256GB SILVER SEMINOVO', '356661406078476', 6690.0, 6100.0, 19, 'seminovo', 'bom', 'vendido', '2026-05-21', '2026-05-21', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-21', '2026-05-21', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('6a347776-509b-4625-b430-060f1442b20e', current_setting('importacao.proximo_numero')::int + 217, current_setting('importacao.cliente_id')::uuid, 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 6690.0, 6690.0, 0.0, '2026-05-21', '2026-05-21', '97f12885-87ad-426a-8bbb-656889d82e10');
UPDATE aparelhos SET venda_id = '6a347776-509b-4625-b430-060f1442b20e' WHERE id = '13639e94-574c-4a9b-babc-44d2f7ecdb6e';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('deccd6e4-e4c4-409b-a02a-51f390a727c3', '6a347776-509b-4625-b430-060f1442b20e', 'cartao_credito', 6690.0, '2026-05-21', '97f12885-87ad-426a-8bbb-656889d82e10', 1, '2026-05-21T14:00:00');

-- LINHA 221 [NAO]: POCO X8 PRO 512GB PRETO NOVO (21/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('890f052d-855b-4895-95d4-7bc73dc110e9', 'Outros', 'POCO X8 PRO 512GB PRETO NOVO', '866132083268783', 2476.0, 2300.0, 4, 'novo', 'perfeito', 'vendido', '2026-05-21', '2026-05-21', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-21', '2026-05-21', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('7da0dfca-cd88-4b11-99fa-da5e214d933d', current_setting('importacao.proximo_numero')::int + 218, current_setting('importacao.cliente_id')::uuid, 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 2476.0, 2476.0, 0.0, '2026-05-21', '2026-05-21', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
UPDATE aparelhos SET venda_id = '7da0dfca-cd88-4b11-99fa-da5e214d933d' WHERE id = '890f052d-855b-4895-95d4-7bc73dc110e9';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('0a304f4b-2a51-4cc2-8437-fa13022fac32', '7da0dfca-cd88-4b11-99fa-da5e214d933d', 'pix', 1225.0, '2026-05-21', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1, '2026-05-21T14:00:00');
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('762a78c7-2458-412c-bfb9-54c5da4e3306', '7da0dfca-cd88-4b11-99fa-da5e214d933d', 'cartao_credito', 1251.0, '2026-05-21', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1, '2026-05-21T14:00:00');

-- LINHA 222 [NAO]: IPHONE 15 PRO MAX 256GB PRETO SEMINOVO (21/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('a27d26dd-70fe-4387-943f-3108578514f2', 'Apple', 'IPHONE 15 PRO MAX 256GB PRETO SEMINOVO', '357275796919659', 4250.0, 4000.0, 19, 'seminovo', 'bom', 'vendido', '2026-05-21', '2026-05-21', 'b4269e60-eea2-4eba-a34d-db9591e0ec83', '2026-05-21', '2026-05-21', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('f98670b7-3f58-4ee8-933a-9be2f374cf05', current_setting('importacao.proximo_numero')::int + 219, current_setting('importacao.cliente_id')::uuid, 19, 'b4269e60-eea2-4eba-a34d-db9591e0ec83', 'concluida', 'normal', 4250.0, 4250.0, 0.0, '2026-05-21', '2026-05-21', 'b4269e60-eea2-4eba-a34d-db9591e0ec83');
UPDATE aparelhos SET venda_id = 'f98670b7-3f58-4ee8-933a-9be2f374cf05' WHERE id = 'a27d26dd-70fe-4387-943f-3108578514f2';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('493c4537-4a93-4a5d-968f-63b786902981', 'f98670b7-3f58-4ee8-933a-9be2f374cf05', 'pix', 4250.0, '2026-05-21', 'b4269e60-eea2-4eba-a34d-db9591e0ec83', 1, '2026-05-21T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('fdec70b1-893f-40f3-b8f2-a88c96290191', 19, 'f98670b7-3f58-4ee8-933a-9be2f374cf05', 'Brinde', 25.0, '2026-05-21', 'b4269e60-eea2-4eba-a34d-db9591e0ec83', '2026-05-21');

-- LINHA 223 [NAO]: NOTE 15 5G 256GB PRETO NOVO (21/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('09b5a771-b358-42ab-a38f-b1ad14251c31', 'Redmi', 'NOTE 15 5G 256GB PRETO NOVO', '867520084645802', 1420.0, 1360.0, 19, 'novo', 'perfeito', 'vendido', '2026-05-21', '2026-05-21', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-21', '2026-05-21', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('a806128e-2903-4471-8c98-f18db19689bd', current_setting('importacao.proximo_numero')::int + 220, current_setting('importacao.cliente_id')::uuid, 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 1420.0, 1420.0, 0.0, '2026-05-21', '2026-05-21', '97f12885-87ad-426a-8bbb-656889d82e10');
UPDATE aparelhos SET venda_id = 'a806128e-2903-4471-8c98-f18db19689bd' WHERE id = '09b5a771-b358-42ab-a38f-b1ad14251c31';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('c21f973d-364e-4864-a1b3-68d572ccbfd0', 'a806128e-2903-4471-8c98-f18db19689bd', 'pix', 1420.0, '2026-05-21', '97f12885-87ad-426a-8bbb-656889d82e10', 1, '2026-05-21T14:00:00');

-- LINHA 224 [SIM]: NOTE 15 4F 256GB PRETO NOVO (21/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('02e9e5e3-20c9-4d66-9c34-651225427629', 'Redmi', 'NOTE 15 4F 256GB PRETO NOVO', '869009086978906', 1300.0, 1130.0, 19, 'novo', 'perfeito', 'vendido', '2026-05-21', '2026-05-21', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-21', '2026-05-21', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('f9169051-818f-4e8e-950a-5c3bfc5dffc9', current_setting('importacao.proximo_numero')::int + 221, current_setting('importacao.cliente_id')::uuid, 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 1300.0, 1300.0, 0.0, '2026-05-21', '2026-05-21', '97f12885-87ad-426a-8bbb-656889d82e10');
UPDATE aparelhos SET venda_id = 'f9169051-818f-4e8e-950a-5c3bfc5dffc9' WHERE id = '02e9e5e3-20c9-4d66-9c34-651225427629';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('161156da-5341-4681-9364-59ef88b6f262', 'f9169051-818f-4e8e-950a-5c3bfc5dffc9', 'pix', 1300.0, '2026-05-21', '97f12885-87ad-426a-8bbb-656889d82e10', 1, '2026-05-21T14:00:00');

-- LINHA 225 [NAO]: GALAXY S26 ULTRA 512GB BRANCO LACRADO (21/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('5180bd61-bc86-4035-b261-586c6bebc840', 'Outros', 'GALAXY S26 ULTRA 512GB BRANCO LACRADO', '355381840336221', 7285.0, 6899.0, 1, 'novo', 'perfeito', 'vendido', '2026-05-21', '2026-05-21', '9451cd9f-6770-4e32-aae8-c75fa675e818', '2026-05-21', '2026-05-21', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('935eaae6-1a5a-4ddf-b0dd-0b178fd01249', current_setting('importacao.proximo_numero')::int + 222, current_setting('importacao.cliente_id')::uuid, 1, '9451cd9f-6770-4e32-aae8-c75fa675e818', 'concluida', 'normal', 7285.0, 7285.0, 0.0, '2026-05-21', '2026-05-21', '9451cd9f-6770-4e32-aae8-c75fa675e818');
UPDATE aparelhos SET venda_id = '935eaae6-1a5a-4ddf-b0dd-0b178fd01249' WHERE id = '5180bd61-bc86-4035-b261-586c6bebc840';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('fb9c0cc5-956a-4d99-b2ae-9cddb3fde2b5', '935eaae6-1a5a-4ddf-b0dd-0b178fd01249', 'pix', 7285.0, '2026-05-21', '9451cd9f-6770-4e32-aae8-c75fa675e818', 1, '2026-05-21T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('4edc11a3-8e00-4dbf-a362-e5b5a8e6668a', 1, '935eaae6-1a5a-4ddf-b0dd-0b178fd01249', 'Brinde', 5.0, '2026-05-21', '9451cd9f-6770-4e32-aae8-c75fa675e818', '2026-05-21');

-- LINHA 226 [NAO]: IPHONE 15 128GB AZUL NOVO (21/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('cd191abd-7529-4c21-ae56-f24111928fc0', 'Apple', 'IPHONE 15 128GB AZUL NOVO', '354196713272654', 3850.0, 3700.0, 20, 'novo', 'perfeito', 'vendido', '2026-05-21', '2026-05-21', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', '2026-05-21', '2026-05-21', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('ff988949-f582-4c99-81b9-da7324ff5c20', current_setting('importacao.proximo_numero')::int + 223, current_setting('importacao.cliente_id')::uuid, 20, 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 'concluida', 'normal', 3850.0, 3850.0, 0.0, '2026-05-21', '2026-05-21', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4');
UPDATE aparelhos SET venda_id = 'ff988949-f582-4c99-81b9-da7324ff5c20' WHERE id = 'cd191abd-7529-4c21-ae56-f24111928fc0';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('f532abc5-6780-41ed-aedb-554fd135a163', 'ff988949-f582-4c99-81b9-da7324ff5c20', 'cartao_credito', 3850.0, '2026-05-21', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 1, '2026-05-21T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('acd45931-8a9b-41ec-aca3-8cfba58af8c0', 20, 'ff988949-f582-4c99-81b9-da7324ff5c20', 'Brinde', 10.0, '2026-05-21', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', '2026-05-21');

-- LINHA 227 [SIM]: IPHONE 17 PRO MAX 256GB LARANJA LACRADO (21/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('c066d6b7-225c-48da-b804-d32be3141e07', 'Apple', 'IPHONE 17 PRO MAX 256GB LARANJA LACRADO', '350230973236911', 8200.0, 8000.0, 1, 'novo', 'perfeito', 'vendido', '2026-05-21', '2026-05-21', 'e07d4d35-1381-4d4d-914d-8382a7456fdd', '2026-05-21', '2026-05-21', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('ab575079-9651-4c63-ab34-2ed0d6dea460', current_setting('importacao.proximo_numero')::int + 224, current_setting('importacao.cliente_id')::uuid, 1, 'e07d4d35-1381-4d4d-914d-8382a7456fdd', 'concluida', 'normal', 8200.0, 8200.0, 0.0, '2026-05-21', '2026-05-21', 'e07d4d35-1381-4d4d-914d-8382a7456fdd');
UPDATE aparelhos SET venda_id = 'ab575079-9651-4c63-ab34-2ed0d6dea460' WHERE id = 'c066d6b7-225c-48da-b804-d32be3141e07';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('d3ba6eb9-0ce2-45b9-84c3-26dff98160a4', 'ab575079-9651-4c63-ab34-2ed0d6dea460', 'pix', 8200.0, '2026-05-21', 'e07d4d35-1381-4d4d-914d-8382a7456fdd', 1, '2026-05-21T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('f947d813-fdc3-4aad-8a18-e960ec3393fe', 1, 'ab575079-9651-4c63-ab34-2ed0d6dea460', 'Brinde', 15.0, '2026-05-21', 'e07d4d35-1381-4d4d-914d-8382a7456fdd', '2026-05-21');

-- LINHA 228 [NAO]: IPHONE 11 64GB VERDE SEMINOVO (21/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('e0763a7c-f6c0-46eb-b588-e579d7a17f13', 'Apple', 'IPHONE 11 64GB VERDE SEMINOVO', '354005106730246', 850.0, 650.0, 1, 'seminovo', 'bom', 'vendido', '2026-05-21', '2026-05-21', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-21', '2026-05-21', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('10177807-05bf-405e-8bca-becab2056aaa', current_setting('importacao.proximo_numero')::int + 225, current_setting('importacao.cliente_id')::uuid, 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 850.0, 850.0, 0.0, '2026-05-21', '2026-05-21', '85e3aa42-b9af-49b8-a72a-64e9c337aa53');
UPDATE aparelhos SET venda_id = '10177807-05bf-405e-8bca-becab2056aaa' WHERE id = 'e0763a7c-f6c0-46eb-b588-e579d7a17f13';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('77ba298c-fec9-4823-a02c-6c084cc54f06', '10177807-05bf-405e-8bca-becab2056aaa', 'pix', 850.0, '2026-05-21', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 1, '2026-05-21T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('daecafe8-20f0-4d85-8fae-bfe6c1cc8303', 1, '10177807-05bf-405e-8bca-becab2056aaa', 'Brinde', 10.0, '2026-05-21', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-21');

-- LINHA 229 [NAO]: IPHONE 16 PRO MAX 256GB NATURAL SEMINOVO (21/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('68fa71b8-7e32-4252-b3b6-d7f467b676f0', 'Apple', 'IPHONE 16 PRO MAX 256GB NATURAL SEMINOVO', '355300185671927', 5250.0, 4850.0, 1, 'seminovo', 'bom', 'vendido', '2026-05-21', '2026-05-21', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-21', '2026-05-21', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('746579cc-b0ec-4bbe-ba77-da33b07b51f7', current_setting('importacao.proximo_numero')::int + 226, current_setting('importacao.cliente_id')::uuid, 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 5250.0, 5250.0, 0.0, '2026-05-21', '2026-05-21', '85e3aa42-b9af-49b8-a72a-64e9c337aa53');
UPDATE aparelhos SET venda_id = '746579cc-b0ec-4bbe-ba77-da33b07b51f7' WHERE id = '68fa71b8-7e32-4252-b3b6-d7f467b676f0';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('a6bbe19f-cfe9-43d2-ab45-f8ee4467f812', '746579cc-b0ec-4bbe-ba77-da33b07b51f7', 'pix', 5250.0, '2026-05-21', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 1, '2026-05-21T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('4cbcc2f7-b041-4584-9af3-e0410763cef4', 1, '746579cc-b0ec-4bbe-ba77-da33b07b51f7', 'Brinde', 25.0, '2026-05-21', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-21');

-- LINHA 230 [NAO]: IPHONE 13 256GB SEMINOVO AZUL (21/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('c53b0c2a-a7ad-4b74-ba5d-103047841ec8', 'Apple', 'IPHONE 13 256GB SEMINOVO AZUL', '356177152787459', 2300.0, 2000.0, 1, 'seminovo', 'bom', 'vendido', '2026-05-21', '2026-05-21', '1d12d555-68e9-45f8-bfc0-a35a1d8d7920', '2026-05-21', '2026-05-21', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('90bbecf1-054b-4af2-95ed-aac4f03bb1da', current_setting('importacao.proximo_numero')::int + 227, current_setting('importacao.cliente_id')::uuid, 1, '1d12d555-68e9-45f8-bfc0-a35a1d8d7920', 'concluida', 'normal', 2300.0, 2300.0, 0.0, '2026-05-21', '2026-05-21', '1d12d555-68e9-45f8-bfc0-a35a1d8d7920');
UPDATE aparelhos SET venda_id = '90bbecf1-054b-4af2-95ed-aac4f03bb1da' WHERE id = 'c53b0c2a-a7ad-4b74-ba5d-103047841ec8';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('686ce788-dc1d-4fba-b5cb-2e717fbdf169', '90bbecf1-054b-4af2-95ed-aac4f03bb1da', 'pix', 2300.0, '2026-05-21', '1d12d555-68e9-45f8-bfc0-a35a1d8d7920', 1, '2026-05-21T14:00:00');

-- LINHA 231 [SIM]: IPHONE 17 256GB BRANCO NOVO (21/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('60880292-e3ca-4c21-b0be-1176adb43f12', 'Apple', 'IPHONE 17 256GB BRANCO NOVO', '352824562544798', 4900.0, 4600.0, 20, 'novo', 'perfeito', 'vendido', '2026-05-21', '2026-05-21', '25e2da5b-9e76-4388-9890-7e22efd6940d', '2026-05-21', '2026-05-21', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('5301fa4c-6bb1-42eb-b294-d4d6cd65c97d', current_setting('importacao.proximo_numero')::int + 228, current_setting('importacao.cliente_id')::uuid, 20, '25e2da5b-9e76-4388-9890-7e22efd6940d', 'concluida', 'normal', 4900.0, 4900.0, 0.0, '2026-05-21', '2026-05-21', '25e2da5b-9e76-4388-9890-7e22efd6940d');
UPDATE aparelhos SET venda_id = '5301fa4c-6bb1-42eb-b294-d4d6cd65c97d' WHERE id = '60880292-e3ca-4c21-b0be-1176adb43f12';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('e2dcf031-207f-40ff-88b4-490601cbd11a', '5301fa4c-6bb1-42eb-b294-d4d6cd65c97d', 'pix', 4900.0, '2026-05-21', '25e2da5b-9e76-4388-9890-7e22efd6940d', 1, '2026-05-21T14:00:00');

-- LINHA 232 [NAO]: IPHONE 13 128GB AZUL SEMINOVO (22/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('2bbb45bf-c44f-4c75-9b77-a48e034dd32b', 'Apple', 'IPHONE 13 128GB AZUL SEMINOVO', '355939491184461', 1980.0, 1800.0, 4, 'seminovo', 'bom', 'vendido', '2026-05-22', '2026-05-22', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-22', '2026-05-22', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('657b05cc-eca9-48c0-8471-b8c45b4fb044', current_setting('importacao.proximo_numero')::int + 229, current_setting('importacao.cliente_id')::uuid, 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 1980.0, 1980.0, 0.0, '2026-05-22', '2026-05-22', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
UPDATE aparelhos SET venda_id = '657b05cc-eca9-48c0-8471-b8c45b4fb044' WHERE id = '2bbb45bf-c44f-4c75-9b77-a48e034dd32b';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('30cbab14-8bd3-4272-accc-30795b0ef138', '657b05cc-eca9-48c0-8471-b8c45b4fb044', 'cartao_credito', 1980.0, '2026-05-22', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1, '2026-05-22T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('d6142e9d-7bc7-4010-ba22-000679134089', 4, '657b05cc-eca9-48c0-8471-b8c45b4fb044', 'Brinde', 25.0, '2026-05-22', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-22');

-- LINHA 233 [SIM]: IPHONE 11 BRANCO 128GB SEMINOVO (22/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('0043db69-056f-4641-99d1-ca7b61f0bd2e', 'Apple', 'IPHONE 11 BRANCO 128GB SEMINOVO', NULL, 1030.0, 800.0, 1, 'seminovo', 'bom', 'vendido', '2026-05-22', '2026-05-22', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-22', '2026-05-22', 'Sem IMEI');
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('109b08fb-e0ec-4eab-9e54-ba92679b1c11', current_setting('importacao.proximo_numero')::int + 230, current_setting('importacao.cliente_id')::uuid, 1, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 1030.0, 1030.0, 0.0, '2026-05-22', '2026-05-22', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
UPDATE aparelhos SET venda_id = '109b08fb-e0ec-4eab-9e54-ba92679b1c11' WHERE id = '0043db69-056f-4641-99d1-ca7b61f0bd2e';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('48cd34ca-3367-4beb-b60c-3cd2a9503b12', '109b08fb-e0ec-4eab-9e54-ba92679b1c11', 'pix', 1030.0, '2026-05-22', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1, '2026-05-22T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('b0e993c6-9817-4161-9461-c9ee3f287a98', 1, '109b08fb-e0ec-4eab-9e54-ba92679b1c11', 'Brinde', 25.0, '2026-05-22', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-22');

-- LINHA 234 [NAO]: IPHONE 12 PRO MAX 128GB GRAFITE SEMINOVO (22/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('a19f2ca4-a716-4763-81d7-cc4256e40043', 'Apple', 'IPHONE 12 PRO MAX 128GB GRAFITE SEMINOVO', '354440895786747', 2210.0, 2000.0, 4, 'seminovo', 'bom', 'vendido', '2026-05-22', '2026-05-22', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-22', '2026-05-22', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('a296481e-cfd7-4795-a22d-8458033f50b9', current_setting('importacao.proximo_numero')::int + 231, current_setting('importacao.cliente_id')::uuid, 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 2210.0, 2210.0, 0.0, '2026-05-22', '2026-05-22', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
UPDATE aparelhos SET venda_id = 'a296481e-cfd7-4795-a22d-8458033f50b9' WHERE id = 'a19f2ca4-a716-4763-81d7-cc4256e40043';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('69bb138e-e1dd-48de-aac3-0a7716bc0e2b', 'a296481e-cfd7-4795-a22d-8458033f50b9', 'pix', 2210.0, '2026-05-22', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1, '2026-05-22T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('8119ed3f-21d7-4461-8f91-1f3271a955b9', 4, 'a296481e-cfd7-4795-a22d-8458033f50b9', 'Brinde', 25.0, '2026-05-22', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-22');

-- LINHA 235 [NAO]: IPHONE 17 PRO MAX 256GB BRANCO NOVO (22/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('7b41b546-15c5-4836-bf8a-9c72c44eec61', 'Apple', 'IPHONE 17 PRO MAX 256GB BRANCO NOVO', '355101476809873', 8886.0, 7950.0, 1, 'novo', 'perfeito', 'vendido', '2026-05-22', '2026-05-22', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-22', '2026-05-22', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('832dc754-a74d-4e92-8ac4-bd4de44b4df5', current_setting('importacao.proximo_numero')::int + 232, current_setting('importacao.cliente_id')::uuid, 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 8886.0, 8886.0, 0.0, '2026-05-22', '2026-05-22', '85e3aa42-b9af-49b8-a72a-64e9c337aa53');
UPDATE aparelhos SET venda_id = '832dc754-a74d-4e92-8ac4-bd4de44b4df5' WHERE id = '7b41b546-15c5-4836-bf8a-9c72c44eec61';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('78639978-f133-402e-9737-07245b4e951c', '832dc754-a74d-4e92-8ac4-bd4de44b4df5', 'pix', 5936.0, '2026-05-22', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 1, '2026-05-22T14:00:00');
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, observacao, parcelas, criado_em)
VALUES ('ac218c99-6f29-4046-bf83-3aab5f0bfa2c', '832dc754-a74d-4e92-8ac4-bd4de44b4df5', 'troca_aparelho', 2950.0, '2026-05-22', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'Troca: IPH 16 128GB PRETO', 1, '2026-05-22T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('f961b187-9f8d-4a6f-82b7-5c4e73621861', 1, '832dc754-a74d-4e92-8ac4-bd4de44b4df5', 'Brinde', 255.0, '2026-05-22', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-22');

-- LINHA 236 [SIM]: IPHONE 16 PRO DESERT 128GB NOVO (22/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('86f5fddd-baee-47bd-8998-ef5095f13bc6', 'Apple', 'IPHONE 16 PRO DESERT 128GB NOVO', '351895497858892', 6000.0, 5400.0, 20, 'novo', 'perfeito', 'vendido', '2026-05-22', '2026-05-22', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', '2026-05-22', '2026-05-22', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('c112c3db-c61f-43ed-9e2c-2e3e8ef8da89', current_setting('importacao.proximo_numero')::int + 233, current_setting('importacao.cliente_id')::uuid, 20, 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 'concluida', 'normal', 6000.0, 6000.0, 0.0, '2026-05-22', '2026-05-22', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4');
UPDATE aparelhos SET venda_id = 'c112c3db-c61f-43ed-9e2c-2e3e8ef8da89' WHERE id = '86f5fddd-baee-47bd-8998-ef5095f13bc6';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('bbd7c013-c101-4723-b1ef-33dd479b8a65', 'c112c3db-c61f-43ed-9e2c-2e3e8ef8da89', 'pix', 6000.0, '2026-05-22', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 1, '2026-05-22T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('a55dc101-0f7d-4fc7-9d02-ec5264b891f8', 20, 'c112c3db-c61f-43ed-9e2c-2e3e8ef8da89', 'Brinde', 5.0, '2026-05-22', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', '2026-05-22');

-- LINHA 237 [NAO]: REDMI NOTE 15 5G 256GB PRETO NOVO (22/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('0abd62d7-aa61-422a-ae70-03d6c7d55c2c', 'Xiaomi', 'REDMI NOTE 15 5G 256GB PRETO NOVO', '861950072519774', 1600.0, 1380.0, 4, 'novo', 'perfeito', 'vendido', '2026-05-22', '2026-05-22', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-22', '2026-05-22', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('21b9cc15-e514-4ba1-af14-5f4be017b4a8', current_setting('importacao.proximo_numero')::int + 234, current_setting('importacao.cliente_id')::uuid, 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 1600.0, 1600.0, 0.0, '2026-05-22', '2026-05-22', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
UPDATE aparelhos SET venda_id = '21b9cc15-e514-4ba1-af14-5f4be017b4a8' WHERE id = '0abd62d7-aa61-422a-ae70-03d6c7d55c2c';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('15bd9caf-ecc4-4a29-91e5-9c2f80f90123', '21b9cc15-e514-4ba1-af14-5f4be017b4a8', 'cartao_credito', 1600.0, '2026-05-22', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1, '2026-05-22T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('4027917c-2ae1-4887-bd2a-12526acb2d69', 4, '21b9cc15-e514-4ba1-af14-5f4be017b4a8', 'Brinde', 50.0, '2026-05-22', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-22');

-- LINHA 238 [NAO]: REDMI NOTE 15 5G 256GB PRETO NOVO (22/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('b258ef66-37b5-4260-beca-7ac79541bb8c', 'Xiaomi', 'REDMI NOTE 15 5G 256GB PRETO NOVO', '861950072535226', 1500.0, 1380.0, 4, 'novo', 'perfeito', 'vendido', '2026-05-22', '2026-05-22', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-22', '2026-05-22', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('134229ec-2d53-41e1-a510-c6483ffce9d4', current_setting('importacao.proximo_numero')::int + 235, current_setting('importacao.cliente_id')::uuid, 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 1500.0, 1500.0, 0.0, '2026-05-22', '2026-05-22', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
UPDATE aparelhos SET venda_id = '134229ec-2d53-41e1-a510-c6483ffce9d4' WHERE id = 'b258ef66-37b5-4260-beca-7ac79541bb8c';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('3789565f-1d96-465d-a0ed-ae728a6404b9', '134229ec-2d53-41e1-a510-c6483ffce9d4', 'pix', 1500.0, '2026-05-22', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1, '2026-05-22T14:00:00');

-- LINHA 239 [NAO]: REDMI NOTE 15 5G 256GB PRETO NOVO (22/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('9723f725-6924-4188-b279-afec9b3b7c08', 'Xiaomi', 'REDMI NOTE 15 5G 256GB PRETO NOVO', '865292085328620', 1600.0, 1380.0, 4, 'novo', 'perfeito', 'vendido', '2026-05-22', '2026-05-22', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-22', '2026-05-22', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('75df0d39-424f-4232-9f6b-a497c53e5778', current_setting('importacao.proximo_numero')::int + 236, current_setting('importacao.cliente_id')::uuid, 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 1600.0, 1600.0, 0.0, '2026-05-22', '2026-05-22', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
UPDATE aparelhos SET venda_id = '75df0d39-424f-4232-9f6b-a497c53e5778' WHERE id = '9723f725-6924-4188-b279-afec9b3b7c08';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('f6ccde0f-d771-4edd-b21a-092d140ee456', '75df0d39-424f-4232-9f6b-a497c53e5778', 'cartao_credito', 1600.0, '2026-05-22', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1, '2026-05-22T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('b75383ff-7120-476b-88d7-b62d89eee086', 4, '75df0d39-424f-4232-9f6b-a497c53e5778', 'Brinde', 70.0, '2026-05-22', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-22');

-- LINHA 240 [SIM]: IPHONE 17 PRO 256GB BRANCO SEMINOVO (22/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('b5d23bc2-e497-4eb4-a2ad-44cefe9a0e26', 'Apple', 'IPHONE 17 PRO 256GB BRANCO SEMINOVO', '355500351356910', 6900.0, 6100.0, 20, 'seminovo', 'bom', 'vendido', '2026-05-22', '2026-05-22', '25e2da5b-9e76-4388-9890-7e22efd6940d', '2026-05-22', '2026-05-22', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('6b97d398-4bd5-4aa7-a431-7d3d4ba857fc', current_setting('importacao.proximo_numero')::int + 237, current_setting('importacao.cliente_id')::uuid, 20, '25e2da5b-9e76-4388-9890-7e22efd6940d', 'concluida', 'normal', 6900.0, 6900.0, 0.0, '2026-05-22', '2026-05-22', '25e2da5b-9e76-4388-9890-7e22efd6940d');
UPDATE aparelhos SET venda_id = '6b97d398-4bd5-4aa7-a431-7d3d4ba857fc' WHERE id = 'b5d23bc2-e497-4eb4-a2ad-44cefe9a0e26';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('ae552367-2a9e-4aff-beef-31a5c1800024', '6b97d398-4bd5-4aa7-a431-7d3d4ba857fc', 'pix', 6900.0, '2026-05-22', '25e2da5b-9e76-4388-9890-7e22efd6940d', 1, '2026-05-22T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('25b61400-fa5a-4c83-9466-d161b1c57994', 20, '6b97d398-4bd5-4aa7-a431-7d3d4ba857fc', 'Brinde', 50.0, '2026-05-22', '25e2da5b-9e76-4388-9890-7e22efd6940d', '2026-05-22');

-- LINHA 241 [SIM]: IPHONE 16 PRO 256GB PRETO SEMINOVO (22/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('7e3657ca-17cb-462b-b284-ddfaa6b99cb8', 'Apple', 'IPHONE 16 PRO 256GB PRETO SEMINOVO', '355983889574156', 4800.0, 4500.0, 20, 'seminovo', 'bom', 'vendido', '2026-05-22', '2026-05-22', '25e2da5b-9e76-4388-9890-7e22efd6940d', '2026-05-22', '2026-05-22', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('a38f090b-42a9-430e-96fc-2f7955a403af', current_setting('importacao.proximo_numero')::int + 238, current_setting('importacao.cliente_id')::uuid, 20, '25e2da5b-9e76-4388-9890-7e22efd6940d', 'concluida', 'normal', 4800.0, 4800.0, 0.0, '2026-05-22', '2026-05-22', '25e2da5b-9e76-4388-9890-7e22efd6940d');
UPDATE aparelhos SET venda_id = 'a38f090b-42a9-430e-96fc-2f7955a403af' WHERE id = '7e3657ca-17cb-462b-b284-ddfaa6b99cb8';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('e888bf32-006c-46be-9f96-6232c6dff2ba', 'a38f090b-42a9-430e-96fc-2f7955a403af', 'pix', 4800.0, '2026-05-22', '25e2da5b-9e76-4388-9890-7e22efd6940d', 1, '2026-05-22T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('931a8a0a-e30c-4849-aa54-50281b66867f', 20, 'a38f090b-42a9-430e-96fc-2f7955a403af', 'Brinde', 25.0, '2026-05-22', '25e2da5b-9e76-4388-9890-7e22efd6940d', '2026-05-22');

-- LINHA 242 [NAO]: IPHONE 16 128GB BRANCO NOVO (22/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('b3c0922b-22cb-401e-8504-8bb1ad78e236', 'Apple', 'IPHONE 16 128GB BRANCO NOVO', '356004167522577', 4360.0, 4050.0, 4, 'novo', 'perfeito', 'vendido', '2026-05-22', '2026-05-22', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-22', '2026-05-22', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('0e54f43a-92b8-424d-b72b-1226ca2c8c90', current_setting('importacao.proximo_numero')::int + 239, current_setting('importacao.cliente_id')::uuid, 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 4360.0, 4360.0, 0.0, '2026-05-22', '2026-05-22', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
UPDATE aparelhos SET venda_id = '0e54f43a-92b8-424d-b72b-1226ca2c8c90' WHERE id = 'b3c0922b-22cb-401e-8504-8bb1ad78e236';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('dac269c1-f946-4e78-9a0f-d90b740b9264', '0e54f43a-92b8-424d-b72b-1226ca2c8c90', 'cartao_credito', 4360.0, '2026-05-22', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1, '2026-05-22T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('ad571c9a-57f0-42aa-8106-d3c8da97047c', 4, '0e54f43a-92b8-424d-b72b-1226ca2c8c90', 'Brinde', 75.0, '2026-05-22', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-22');

-- LINHA 243 [NAO]: IPHONE 11 PRO MAX 512GB BRANCO SEMINOVO (23/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('96f1ab1f-83d7-470a-8bf0-0eeb6047c705', 'Apple', 'IPHONE 11 PRO MAX 512GB BRANCO SEMINOVO', '353915106419593', 550.0, 500.0, 4, 'seminovo', 'bom', 'vendido', '2026-05-23', '2026-05-23', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-23', '2026-05-23', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('703996d6-f62a-4461-83cc-88209b1b0ea5', current_setting('importacao.proximo_numero')::int + 240, current_setting('importacao.cliente_id')::uuid, 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 550.0, 550.0, 0.0, '2026-05-23', '2026-05-23', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
UPDATE aparelhos SET venda_id = '703996d6-f62a-4461-83cc-88209b1b0ea5' WHERE id = '96f1ab1f-83d7-470a-8bf0-0eeb6047c705';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('cecd9010-aedd-42d3-9b01-beba98e94ed2', '703996d6-f62a-4461-83cc-88209b1b0ea5', 'pix', 550.0, '2026-05-23', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1, '2026-05-23T14:00:00');

-- LINHA 244 [NAO]: IPHONE 16 PRO MAX 512GB DESERT SEMINOVO (23/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('8f6a3c2d-ab17-45a9-9e96-d97f33292ee2', 'Apple', 'IPHONE 16 PRO MAX 512GB DESERT SEMINOVO', '356760684778276', 5561.0, 5150.0, 4, 'seminovo', 'bom', 'vendido', '2026-05-23', '2026-05-23', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-23', '2026-05-23', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('26d94b10-28cc-4049-a513-bbb735b69781', current_setting('importacao.proximo_numero')::int + 241, current_setting('importacao.cliente_id')::uuid, 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 5561.0, 5561.0, 0.0, '2026-05-23', '2026-05-23', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
UPDATE aparelhos SET venda_id = '26d94b10-28cc-4049-a513-bbb735b69781' WHERE id = '8f6a3c2d-ab17-45a9-9e96-d97f33292ee2';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('fc2c4f9b-54f8-4008-bbd0-bf77b14dcdba', '26d94b10-28cc-4049-a513-bbb735b69781', 'pix', 5561.0, '2026-05-23', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1, '2026-05-23T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('c3ea5c32-ddf9-4ecc-892c-2cf0cc63679c', 4, '26d94b10-28cc-4049-a513-bbb735b69781', 'Brinde', 25.0, '2026-05-23', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-23');

-- LINHA 245 [NAO]: IPHONE 17 PRO MAX 256GB SILVER NOVO (23/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('131e685f-d387-4846-8891-666d32db4e0b', 'Apple', 'IPHONE 17 PRO MAX 256GB SILVER NOVO', '358206135981398', 8400.0, 7900.0, 1, 'novo', 'perfeito', 'vendido', '2026-05-23', '2026-05-23', '0dd2c938-c6dd-4f5d-aac5-ed045ee5d2fb', '2026-05-23', '2026-05-23', 'Pagto junto (Aparelho 1/2, total grupo R$ 16,100)');
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('918107a1-81a1-479a-8dab-32fe5b694010', current_setting('importacao.proximo_numero')::int + 242, current_setting('importacao.cliente_id')::uuid, 1, '0dd2c938-c6dd-4f5d-aac5-ed045ee5d2fb', 'concluida', 'normal', 8400.0, 8400.0, 0.0, '2026-05-23', '2026-05-23', '0dd2c938-c6dd-4f5d-aac5-ed045ee5d2fb');
UPDATE aparelhos SET venda_id = '918107a1-81a1-479a-8dab-32fe5b694010' WHERE id = '131e685f-d387-4846-8891-666d32db4e0b';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('c823c374-8848-4dbb-95dc-97142731e4df', '918107a1-81a1-479a-8dab-32fe5b694010', 'pix', 3600.0, '2026-05-23', '0dd2c938-c6dd-4f5d-aac5-ed045ee5d2fb', 1, '2026-05-23T14:00:00');
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, observacao, parcelas, criado_em)
VALUES ('29f61a52-db15-410c-a6dd-2a5f2fc7d8bf', '918107a1-81a1-479a-8dab-32fe5b694010', 'troca_aparelho', 4800.0, '2026-05-23', '0dd2c938-c6dd-4f5d-aac5-ed045ee5d2fb', 'Troca: IPH 16 PRO MAX', 1, '2026-05-23T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('48cf80a9-feab-457a-b4b1-b7dcc74c7426', 1, '918107a1-81a1-479a-8dab-32fe5b694010', 'Brinde', 20.0, '2026-05-23', '0dd2c938-c6dd-4f5d-aac5-ed045ee5d2fb', '2026-05-23');

-- LINHA 246 [NAO]: IPHONE 17 PRO 256GB SILVER NOVO (23/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('2b1a0b96-2741-4adf-b4a5-22ef40bbc3fb', 'Apple', 'IPHONE 17 PRO 256GB SILVER NOVO', '352574671693388', 7700.0, 7300.0, 1, 'novo', 'perfeito', 'vendido', '2026-05-23', '2026-05-23', '0dd2c938-c6dd-4f5d-aac5-ed045ee5d2fb', '2026-05-23', '2026-05-23', 'Pagto junto (Aparelho 2/2, total grupo R$ 16,100)');
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('316f681e-2da0-4bf6-b12a-9bf1d74b6b94', current_setting('importacao.proximo_numero')::int + 243, current_setting('importacao.cliente_id')::uuid, 1, '0dd2c938-c6dd-4f5d-aac5-ed045ee5d2fb', 'concluida', 'normal', 7700.0, 7700.0, 0.0, '2026-05-23', '2026-05-23', '0dd2c938-c6dd-4f5d-aac5-ed045ee5d2fb');
UPDATE aparelhos SET venda_id = '316f681e-2da0-4bf6-b12a-9bf1d74b6b94' WHERE id = '2b1a0b96-2741-4adf-b4a5-22ef40bbc3fb';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('7d6a9b9b-a3d0-4639-a558-d5d570460b61', '316f681e-2da0-4bf6-b12a-9bf1d74b6b94', 'pix', 3700.0, '2026-05-23', '0dd2c938-c6dd-4f5d-aac5-ed045ee5d2fb', 1, '2026-05-23T14:00:00');
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, observacao, parcelas, criado_em)
VALUES ('d39e9090-02b5-4aad-8ca9-75fde43f7a69', '316f681e-2da0-4bf6-b12a-9bf1d74b6b94', 'troca_aparelho', 4000.0, '2026-05-23', '0dd2c938-c6dd-4f5d-aac5-ed045ee5d2fb', 'Troca: IPH 16 PRO 128GB DESERT', 1, '2026-05-23T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('bf382434-2c3e-431b-a9ec-da40ef5418bf', 1, '316f681e-2da0-4bf6-b12a-9bf1d74b6b94', 'Brinde', 20.0, '2026-05-23', '0dd2c938-c6dd-4f5d-aac5-ed045ee5d2fb', '2026-05-23');

-- LINHA 247 [NAO]: IPHONE 17 PRO MAX 256GB SILVER NOVO (23/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('7ef3618f-1502-4e3c-80eb-04859453af41', 'Apple', 'IPHONE 17 PRO MAX 256GB SILVER NOVO', '351205740141759', 8200.0, 7850.0, 1, 'novo', 'perfeito', 'vendido', '2026-05-23', '2026-05-23', '0dd2c938-c6dd-4f5d-aac5-ed045ee5d2fb', '2026-05-23', '2026-05-23', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('a56c1918-f1b6-4629-8147-19e2c0796d4d', current_setting('importacao.proximo_numero')::int + 244, current_setting('importacao.cliente_id')::uuid, 1, '0dd2c938-c6dd-4f5d-aac5-ed045ee5d2fb', 'concluida', 'normal', 8200.0, 8200.0, 0.0, '2026-05-23', '2026-05-23', '0dd2c938-c6dd-4f5d-aac5-ed045ee5d2fb');
UPDATE aparelhos SET venda_id = 'a56c1918-f1b6-4629-8147-19e2c0796d4d' WHERE id = '7ef3618f-1502-4e3c-80eb-04859453af41';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('3203ef08-8a4c-41c5-8515-a299f7207c98', 'a56c1918-f1b6-4629-8147-19e2c0796d4d', 'pix', 8200.0, '2026-05-23', '0dd2c938-c6dd-4f5d-aac5-ed045ee5d2fb', 1, '2026-05-23T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('e5f688b7-2bf9-4beb-a349-cc83dfc3c5ed', 1, 'a56c1918-f1b6-4629-8147-19e2c0796d4d', 'Brinde', 15.0, '2026-05-23', '0dd2c938-c6dd-4f5d-aac5-ed045ee5d2fb', '2026-05-23');

-- LINHA 248 [NAO]: IPHONE 15 PRO 256GB BRANCO SEMINOVO (23/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('2c852f89-58c5-4a80-889c-717dfff12c01', 'Apple', 'IPHONE 15 PRO 256GB BRANCO SEMINOVO', '350839531594007', 3600.0, 3400.0, 20, 'seminovo', 'bom', 'vendido', '2026-05-23', '2026-05-23', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', '2026-05-23', '2026-05-23', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('9f9d089e-876f-4cde-b28f-627e6fbb72d3', current_setting('importacao.proximo_numero')::int + 245, current_setting('importacao.cliente_id')::uuid, 20, 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 'concluida', 'normal', 3600.0, 3600.0, 0.0, '2026-05-23', '2026-05-23', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4');
UPDATE aparelhos SET venda_id = '9f9d089e-876f-4cde-b28f-627e6fbb72d3' WHERE id = '2c852f89-58c5-4a80-889c-717dfff12c01';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('9670251c-d283-4c3b-8b71-a8a624476e47', '9f9d089e-876f-4cde-b28f-627e6fbb72d3', 'pix', 3600.0, '2026-05-23', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 1, '2026-05-23T14:00:00');

-- LINHA 249 [NAO]: IPAD 11 128GB AZUL LACRADO (23/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('2b6d3312-6bc8-4ff8-9680-8dc7063e578a', 'Apple', 'IPAD 11 128GB AZUL LACRADO', 'MD7P7G9W9D', 2950.0, 2090.0, 1, 'novo', 'perfeito', 'vendido', '2026-05-23', '2026-05-23', '1d12d555-68e9-45f8-bfc0-a35a1d8d7920', '2026-05-23', '2026-05-23', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('c3655935-d329-466c-84ba-a545691f8b0a', current_setting('importacao.proximo_numero')::int + 246, current_setting('importacao.cliente_id')::uuid, 1, '1d12d555-68e9-45f8-bfc0-a35a1d8d7920', 'concluida', 'normal', 2950.0, 2950.0, 0.0, '2026-05-23', '2026-05-23', '1d12d555-68e9-45f8-bfc0-a35a1d8d7920');
UPDATE aparelhos SET venda_id = 'c3655935-d329-466c-84ba-a545691f8b0a' WHERE id = '2b6d3312-6bc8-4ff8-9680-8dc7063e578a';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('ed92ff88-9be9-4867-879b-16a69441c0d6', 'c3655935-d329-466c-84ba-a545691f8b0a', 'pix', 2950.0, '2026-05-23', '1d12d555-68e9-45f8-bfc0-a35a1d8d7920', 1, '2026-05-23T14:00:00');

-- LINHA 250 [NAO]: GALAXY A56 5G 256GB PRETO LACRADO (23/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('45d4a343-d8e4-405d-936b-19001ac325b0', 'Outros', 'GALAXY A56 5G 256GB PRETO LACRADO', '351814335898119', 2100.0, 1900.0, 1, 'novo', 'perfeito', 'vendido', '2026-05-23', '2026-05-23', '9451cd9f-6770-4e32-aae8-c75fa675e818', '2026-05-23', '2026-05-23', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('aa5a03d9-0217-4edd-9127-742d23e6a877', current_setting('importacao.proximo_numero')::int + 247, current_setting('importacao.cliente_id')::uuid, 1, '9451cd9f-6770-4e32-aae8-c75fa675e818', 'concluida', 'normal', 2100.0, 2100.0, 0.0, '2026-05-23', '2026-05-23', '9451cd9f-6770-4e32-aae8-c75fa675e818');
UPDATE aparelhos SET venda_id = 'aa5a03d9-0217-4edd-9127-742d23e6a877' WHERE id = '45d4a343-d8e4-405d-936b-19001ac325b0';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('1ffefd48-d890-436f-ace5-78b6f01ba559', 'aa5a03d9-0217-4edd-9127-742d23e6a877', 'pix', 2100.0, '2026-05-23', '9451cd9f-6770-4e32-aae8-c75fa675e818', 1, '2026-05-23T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('0a8b0e5b-a6b3-4a7a-a0fb-311017be3079', 1, 'aa5a03d9-0217-4edd-9127-742d23e6a877', 'Brinde', 15.0, '2026-05-23', '9451cd9f-6770-4e32-aae8-c75fa675e818', '2026-05-23');

-- LINHA 251 [SIM]: IPHONE 15 PRO MAX 256GB PRETO SEMINOVO (23/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('738bc8c2-4456-432e-a32e-89acab8d1278', 'Apple', 'IPHONE 15 PRO MAX 256GB PRETO SEMINOVO', '354570357307499', 3950.0, 3700.0, 1, 'seminovo', 'bom', 'vendido', '2026-05-23', '2026-05-23', 'e07d4d35-1381-4d4d-914d-8382a7456fdd', '2026-05-23', '2026-05-23', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('e73487f3-f60d-413a-865a-ed0b1d5aa3bb', current_setting('importacao.proximo_numero')::int + 248, current_setting('importacao.cliente_id')::uuid, 1, 'e07d4d35-1381-4d4d-914d-8382a7456fdd', 'concluida', 'normal', 3950.0, 3950.0, 0.0, '2026-05-23', '2026-05-23', 'e07d4d35-1381-4d4d-914d-8382a7456fdd');
UPDATE aparelhos SET venda_id = 'e73487f3-f60d-413a-865a-ed0b1d5aa3bb' WHERE id = '738bc8c2-4456-432e-a32e-89acab8d1278';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('155b4d8f-8de8-49b1-a87b-11064b8907fe', 'e73487f3-f60d-413a-865a-ed0b1d5aa3bb', 'pix', 3950.0, '2026-05-23', 'e07d4d35-1381-4d4d-914d-8382a7456fdd', 1, '2026-05-23T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('dd8a5328-667e-4f6c-99a4-4f05d216461f', 1, 'e73487f3-f60d-413a-865a-ed0b1d5aa3bb', 'Brinde', 25.0, '2026-05-23', 'e07d4d35-1381-4d4d-914d-8382a7456fdd', '2026-05-23');

-- LINHA 252 [NAO]: IPHONE 13 128GB BRANCO SEMINOVO (23/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('9ac780c1-6be9-4ba0-8a25-6f0019c36d4a', 'Apple', 'IPHONE 13 128GB BRANCO SEMINOVO', '359551273163864', 1900.0, 1780.0, 19, 'seminovo', 'bom', 'vendido', '2026-05-23', '2026-05-23', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-23', '2026-05-23', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('8830d303-e43a-4382-a750-3149bc8f91a0', current_setting('importacao.proximo_numero')::int + 249, current_setting('importacao.cliente_id')::uuid, 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 1900.0, 1900.0, 0.0, '2026-05-23', '2026-05-23', '97f12885-87ad-426a-8bbb-656889d82e10');
UPDATE aparelhos SET venda_id = '8830d303-e43a-4382-a750-3149bc8f91a0' WHERE id = '9ac780c1-6be9-4ba0-8a25-6f0019c36d4a';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('fa38b02f-e8c7-4bc7-8885-44a3d34988d0', '8830d303-e43a-4382-a750-3149bc8f91a0', 'pix', 1900.0, '2026-05-23', '97f12885-87ad-426a-8bbb-656889d82e10', 1, '2026-05-23T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('68248806-a097-4ab6-acd6-88298f71e9a7', 19, '8830d303-e43a-4382-a750-3149bc8f91a0', 'Brinde', 25.0, '2026-05-23', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-23');

-- LINHA 253 [NAO]: IPHONE 17 PRO 256GB AZUL NOVO (23/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('187b1904-e912-4f40-9ef5-b0435b55b81e', 'Apple', 'IPHONE 17 PRO 256GB AZUL NOVO', '352574671224184', 7530.0, 7300.0, 19, 'novo', 'perfeito', 'vendido', '2026-05-23', '2026-05-23', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-23', '2026-05-23', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('9d13b942-4d20-4a7c-8ae1-d3f4e8775ebe', current_setting('importacao.proximo_numero')::int + 250, current_setting('importacao.cliente_id')::uuid, 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 7530.0, 7530.0, 0.0, '2026-05-23', '2026-05-23', '97f12885-87ad-426a-8bbb-656889d82e10');
UPDATE aparelhos SET venda_id = '9d13b942-4d20-4a7c-8ae1-d3f4e8775ebe' WHERE id = '187b1904-e912-4f40-9ef5-b0435b55b81e';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('459f42b4-8e1c-4a0d-a7f1-5bdb91e4ce3e', '9d13b942-4d20-4a7c-8ae1-d3f4e8775ebe', 'pix', 7530.0, '2026-05-23', '97f12885-87ad-426a-8bbb-656889d82e10', 1, '2026-05-23T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('1668252d-08dc-45f4-ba29-782629069662', 19, '9d13b942-4d20-4a7c-8ae1-d3f4e8775ebe', 'Brinde', 20.0, '2026-05-23', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-23');

-- LINHA 254 [NAO]: IPHONE 17 PRO MAX 256GB SILVER NOVO (23/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('1507dbd1-7336-497a-ada2-60bdc7add1d4', 'Apple', 'IPHONE 17 PRO MAX 256GB SILVER NOVO', '351668145588454', 8150.0, 8000.0, 19, 'novo', 'perfeito', 'vendido', '2026-05-23', '2026-05-23', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-23', '2026-05-23', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('f1a22ef6-5b87-488c-8a60-96eebd50ded2', current_setting('importacao.proximo_numero')::int + 251, current_setting('importacao.cliente_id')::uuid, 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 8150.0, 8150.0, 0.0, '2026-05-23', '2026-05-23', '97f12885-87ad-426a-8bbb-656889d82e10');
UPDATE aparelhos SET venda_id = 'f1a22ef6-5b87-488c-8a60-96eebd50ded2' WHERE id = '1507dbd1-7336-497a-ada2-60bdc7add1d4';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('3895a10b-08c1-4aa9-b1eb-11e29237812e', 'f1a22ef6-5b87-488c-8a60-96eebd50ded2', 'pix', 4600.0, '2026-05-23', '97f12885-87ad-426a-8bbb-656889d82e10', 1, '2026-05-23T14:00:00');
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('66253f91-20a8-4060-a2cb-207f76dba558', 'f1a22ef6-5b87-488c-8a60-96eebd50ded2', 'cartao_credito', 3550.0, '2026-05-23', '97f12885-87ad-426a-8bbb-656889d82e10', 1, '2026-05-23T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('43d31e7c-0f55-4485-9a1a-6e1ed51c4249', 19, 'f1a22ef6-5b87-488c-8a60-96eebd50ded2', 'Brinde', 20.0, '2026-05-23', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-23');

-- LINHA 255 [NAO]: IPHONE 14 PRO MAX 512GB SEMINOVO (23/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('0eb0ce01-79d0-4719-82cc-2e7763d5a9eb', 'Apple', 'IPHONE 14 PRO MAX 512GB SEMINOVO', '357938436579106', 3730.0, 2500.0, 19, 'seminovo', 'bom', 'vendido', '2026-05-23', '2026-05-23', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-23', '2026-05-23', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('a87fa94e-273b-4f4d-a03a-e760cc303212', current_setting('importacao.proximo_numero')::int + 252, current_setting('importacao.cliente_id')::uuid, 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 3730.0, 3730.0, 0.0, '2026-05-23', '2026-05-23', '97f12885-87ad-426a-8bbb-656889d82e10');
UPDATE aparelhos SET venda_id = 'a87fa94e-273b-4f4d-a03a-e760cc303212' WHERE id = '0eb0ce01-79d0-4719-82cc-2e7763d5a9eb';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('3783546b-1ee0-40df-91ee-537322ca6344', 'a87fa94e-273b-4f4d-a03a-e760cc303212', 'pix', 2000.0, '2026-05-23', '97f12885-87ad-426a-8bbb-656889d82e10', 1, '2026-05-23T14:00:00');
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('22000bcd-ed27-4047-a546-23997e77b46e', 'a87fa94e-273b-4f4d-a03a-e760cc303212', 'cartao_credito', 1730.0, '2026-05-23', '97f12885-87ad-426a-8bbb-656889d82e10', 1, '2026-05-23T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('ac3d6ee6-baa5-4c96-9f81-82f9e9ee0020', 19, 'a87fa94e-273b-4f4d-a03a-e760cc303212', 'Brinde', 25.0, '2026-05-23', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-23');

-- LINHA 256 [NAO]: IPHONE XR 64GB PRETO SEMINOVO (23/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('edabfb57-74de-4f80-bbfb-c0f47a082d13', 'Apple', 'IPHONE XR 64GB PRETO SEMINOVO', '356827112692377', 600.0, 500.0, 19, 'seminovo', 'bom', 'vendido', '2026-05-23', '2026-05-23', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-23', '2026-05-23', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('b6ec4a71-b6d6-4f2b-8011-d0076d4af197', current_setting('importacao.proximo_numero')::int + 253, current_setting('importacao.cliente_id')::uuid, 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 600.0, 600.0, 0.0, '2026-05-23', '2026-05-23', '97f12885-87ad-426a-8bbb-656889d82e10');
UPDATE aparelhos SET venda_id = 'b6ec4a71-b6d6-4f2b-8011-d0076d4af197' WHERE id = 'edabfb57-74de-4f80-bbfb-c0f47a082d13';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('21afa105-c859-4877-bbab-42832095de00', 'b6ec4a71-b6d6-4f2b-8011-d0076d4af197', 'pix', 600.0, '2026-05-23', '97f12885-87ad-426a-8bbb-656889d82e10', 1, '2026-05-23T14:00:00');

-- LINHA 257 [NAO]: IPHONE 16 PRO MAX 1T DESERT SEMINOVO (23/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('66b580af-626c-4bb7-a874-0b2327e18bce', 'Apple', 'IPHONE 16 PRO MAX 1T DESERT SEMINOVO', '355067542298807', 5850.0, 5300.0, 19, 'seminovo', 'bom', 'vendido', '2026-05-23', '2026-05-23', '85743f3e-1b32-49c0-9d9e-c16afd690f7d', '2026-05-23', '2026-05-23', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('bacb6399-12ae-494e-9684-610fc18df510', current_setting('importacao.proximo_numero')::int + 254, current_setting('importacao.cliente_id')::uuid, 19, '85743f3e-1b32-49c0-9d9e-c16afd690f7d', 'concluida', 'normal', 5850.0, 5850.0, 0.0, '2026-05-23', '2026-05-23', '85743f3e-1b32-49c0-9d9e-c16afd690f7d');
UPDATE aparelhos SET venda_id = 'bacb6399-12ae-494e-9684-610fc18df510' WHERE id = '66b580af-626c-4bb7-a874-0b2327e18bce';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('37e6a25f-40ec-41c8-b2dc-8cd0f87f13d6', 'bacb6399-12ae-494e-9684-610fc18df510', 'pix', 5850.0, '2026-05-23', '85743f3e-1b32-49c0-9d9e-c16afd690f7d', 1, '2026-05-23T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('348d858c-4d27-4586-941d-d8748467e9db', 19, 'bacb6399-12ae-494e-9684-610fc18df510', 'Brinde', 40.0, '2026-05-23', '85743f3e-1b32-49c0-9d9e-c16afd690f7d', '2026-05-23');

-- LINHA 258 [SIM]: IPHONE 15 128GB PRETO SEMINOVO (23/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('95ce3da3-008f-4125-bd61-4ceec9182712', 'Apple', 'IPHONE 15 128GB PRETO SEMINOVO', '351750724879288', 3076.0, 2730.0, 19, 'seminovo', 'bom', 'vendido', '2026-05-23', '2026-05-23', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-23', '2026-05-23', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('59a096de-f3c6-4439-b40c-d82c69023ac6', current_setting('importacao.proximo_numero')::int + 255, current_setting('importacao.cliente_id')::uuid, 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 3076.0, 3076.0, 0.0, '2026-05-23', '2026-05-23', '97f12885-87ad-426a-8bbb-656889d82e10');
UPDATE aparelhos SET venda_id = '59a096de-f3c6-4439-b40c-d82c69023ac6' WHERE id = '95ce3da3-008f-4125-bd61-4ceec9182712';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('ecccc987-2d15-4027-8ee3-cf3c844aefc8', '59a096de-f3c6-4439-b40c-d82c69023ac6', 'pix', 3076.0, '2026-05-23', '97f12885-87ad-426a-8bbb-656889d82e10', 1, '2026-05-23T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('6bf19387-f8d4-4850-bc8b-b84a854faabc', 19, '59a096de-f3c6-4439-b40c-d82c69023ac6', 'Brinde', 25.0, '2026-05-23', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-23');

-- LINHA 259 [NAO]: IPHONE 16 PRO MAX 512GB PRETO SEMINOVO (23/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('d6ebddfe-ab78-4451-af80-272734c938ea', 'Apple', 'IPHONE 16 PRO MAX 512GB PRETO SEMINOVO', '354276357875838', 5389.0, 5150.0, 1, 'seminovo', 'bom', 'vendido', '2026-05-23', '2026-05-23', 'e07d4d35-1381-4d4d-914d-8382a7456fdd', '2026-05-23', '2026-05-23', 'Pagto junto (Aparelho 1/2, total grupo R$ 10,889)');
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('cc4531ba-933d-4073-98dc-a3c88fed12c9', current_setting('importacao.proximo_numero')::int + 256, current_setting('importacao.cliente_id')::uuid, 1, 'e07d4d35-1381-4d4d-914d-8382a7456fdd', 'concluida', 'normal', 5389.0, 5389.0, 0.0, '2026-05-23', '2026-05-23', 'e07d4d35-1381-4d4d-914d-8382a7456fdd');
UPDATE aparelhos SET venda_id = 'cc4531ba-933d-4073-98dc-a3c88fed12c9' WHERE id = 'd6ebddfe-ab78-4451-af80-272734c938ea';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('82c5c418-23b5-47ae-81d7-310301c8ae3d', 'cc4531ba-933d-4073-98dc-a3c88fed12c9', 'cartao_credito', 5389.0, '2026-05-23', 'e07d4d35-1381-4d4d-914d-8382a7456fdd', 1, '2026-05-23T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('277ecd99-e5bd-4206-8707-7b8cb3003cfc', 1, 'cc4531ba-933d-4073-98dc-a3c88fed12c9', 'Brinde', 25.0, '2026-05-23', 'e07d4d35-1381-4d4d-914d-8382a7456fdd', '2026-05-23');

-- LINHA 260 [NAO]: IPHONE 16 PRO MAX 1TB DESERT SEMINOVO (23/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('d6b6f0ac-f286-471c-b3f5-ad64cf88c802', 'Apple', 'IPHONE 16 PRO MAX 1TB DESERT SEMINOVO', '355067542462973', 5500.0, 5300.0, 1, 'seminovo', 'bom', 'vendido', '2026-05-23', '2026-05-23', 'e07d4d35-1381-4d4d-914d-8382a7456fdd', '2026-05-23', '2026-05-23', 'Pagto junto (Aparelho 2/2, total grupo R$ 10,889)');
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('4217aa37-e813-46e9-94ed-505db9f8a362', current_setting('importacao.proximo_numero')::int + 257, current_setting('importacao.cliente_id')::uuid, 1, 'e07d4d35-1381-4d4d-914d-8382a7456fdd', 'concluida', 'normal', 5500.0, 5500.0, 0.0, '2026-05-23', '2026-05-23', 'e07d4d35-1381-4d4d-914d-8382a7456fdd');
UPDATE aparelhos SET venda_id = '4217aa37-e813-46e9-94ed-505db9f8a362' WHERE id = 'd6b6f0ac-f286-471c-b3f5-ad64cf88c802';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('46e5486f-45f5-42c2-b9ea-935d6a44f945', '4217aa37-e813-46e9-94ed-505db9f8a362', 'cartao_credito', 5500.0, '2026-05-23', 'e07d4d35-1381-4d4d-914d-8382a7456fdd', 1, '2026-05-23T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('aa01965f-a63e-4695-869e-7ddd04a8141c', 1, '4217aa37-e813-46e9-94ed-505db9f8a362', 'Brinde', 25.0, '2026-05-23', 'e07d4d35-1381-4d4d-914d-8382a7456fdd', '2026-05-23');

-- LINHA 261 [SIM]: IPHONE 17 PRO 256GB BRANCO SEMINOVO (23/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('904fe920-1011-42c3-bac2-c3810b163ef4', 'Apple', 'IPHONE 17 PRO 256GB BRANCO SEMINOVO', '356839676778476', 6700.0, 6100.0, 20, 'seminovo', 'bom', 'vendido', '2026-05-23', '2026-05-23', '25e2da5b-9e76-4388-9890-7e22efd6940d', '2026-05-23', '2026-05-23', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('7d376bb4-5485-4438-b540-8106adae6731', current_setting('importacao.proximo_numero')::int + 258, current_setting('importacao.cliente_id')::uuid, 20, '25e2da5b-9e76-4388-9890-7e22efd6940d', 'concluida', 'normal', 6700.0, 6700.0, 0.0, '2026-05-23', '2026-05-23', '25e2da5b-9e76-4388-9890-7e22efd6940d');
UPDATE aparelhos SET venda_id = '7d376bb4-5485-4438-b540-8106adae6731' WHERE id = '904fe920-1011-42c3-bac2-c3810b163ef4';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('acb884ae-f146-4992-813b-3575f7ee912a', '7d376bb4-5485-4438-b540-8106adae6731', 'pix', 6700.0, '2026-05-23', '25e2da5b-9e76-4388-9890-7e22efd6940d', 1, '2026-05-23T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('6c5a5331-5553-4a42-8587-607105abba47', 20, '7d376bb4-5485-4438-b540-8106adae6731', 'Brinde', 50.0, '2026-05-23', '25e2da5b-9e76-4388-9890-7e22efd6940d', '2026-05-23');

-- LINHA 262 [NAO]: IPHONE 16 PRO 128GB DESERT SEMINOVO (23/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('c038ebdc-f958-4fbb-ba2b-955859b2078c', 'Apple', 'IPHONE 16 PRO 128GB DESERT SEMINOVO', '350059638923591', 4450.0, 4200.0, 20, 'seminovo', 'bom', 'vendido', '2026-05-23', '2026-05-23', '25e2da5b-9e76-4388-9890-7e22efd6940d', '2026-05-23', '2026-05-23', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('889d6946-9d3a-45c0-9a89-170156b828b3', current_setting('importacao.proximo_numero')::int + 259, current_setting('importacao.cliente_id')::uuid, 20, '25e2da5b-9e76-4388-9890-7e22efd6940d', 'concluida', 'normal', 4450.0, 4450.0, 0.0, '2026-05-23', '2026-05-23', '25e2da5b-9e76-4388-9890-7e22efd6940d');
UPDATE aparelhos SET venda_id = '889d6946-9d3a-45c0-9a89-170156b828b3' WHERE id = 'c038ebdc-f958-4fbb-ba2b-955859b2078c';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('f697e8b2-f1b9-4b83-b35a-97bc518f1946', '889d6946-9d3a-45c0-9a89-170156b828b3', 'cartao_credito', 4450.0, '2026-05-23', '25e2da5b-9e76-4388-9890-7e22efd6940d', 1, '2026-05-23T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('7488abba-0696-4367-bf78-813b2894214b', 20, '889d6946-9d3a-45c0-9a89-170156b828b3', 'Brinde', 20.0, '2026-05-23', '25e2da5b-9e76-4388-9890-7e22efd6940d', '2026-05-23');

-- LINHA 263 [NAO]: IPHONE 12 64GB LILAS SEMINOVO (23/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('613c5108-7616-4591-b250-68869bd0eb75', 'Apple', 'IPHONE 12 64GB LILAS SEMINOVO', '353342880337604', 1350.0, 1150.0, 20, 'seminovo', 'bom', 'vendido', '2026-05-23', '2026-05-23', '25e2da5b-9e76-4388-9890-7e22efd6940d', '2026-05-23', '2026-05-23', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('2c321214-467e-42fc-80a9-50fc83dd9f68', current_setting('importacao.proximo_numero')::int + 260, current_setting('importacao.cliente_id')::uuid, 20, '25e2da5b-9e76-4388-9890-7e22efd6940d', 'concluida', 'normal', 1350.0, 1350.0, 0.0, '2026-05-23', '2026-05-23', '25e2da5b-9e76-4388-9890-7e22efd6940d');
UPDATE aparelhos SET venda_id = '2c321214-467e-42fc-80a9-50fc83dd9f68' WHERE id = '613c5108-7616-4591-b250-68869bd0eb75';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('dd844240-c119-4155-8046-6e672ee3cf45', '2c321214-467e-42fc-80a9-50fc83dd9f68', 'cartao_credito', 1350.0, '2026-05-23', '25e2da5b-9e76-4388-9890-7e22efd6940d', 1, '2026-05-23T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('224b65a8-5183-4d8a-90fa-e91602fefe71', 20, '2c321214-467e-42fc-80a9-50fc83dd9f68', 'Brinde', 25.0, '2026-05-23', '25e2da5b-9e76-4388-9890-7e22efd6940d', '2026-05-23');

-- LINHA 264 [NAO]: POCO C85 PRETO 256GB NOVO (23/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('e2518e91-f876-4a12-a4b9-2adacd1e2518', 'Outros', 'POCO C85 PRETO 256GB NOVO', '864280086544668', 997.0, 880.0, 1, 'novo', 'perfeito', 'vendido', '2026-05-23', '2026-05-23', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-23', '2026-05-23', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('e96f0ee6-3337-4ab0-9fd2-154a562a866c', current_setting('importacao.proximo_numero')::int + 261, current_setting('importacao.cliente_id')::uuid, 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 997.0, 997.0, 0.0, '2026-05-23', '2026-05-23', '85e3aa42-b9af-49b8-a72a-64e9c337aa53');
UPDATE aparelhos SET venda_id = 'e96f0ee6-3337-4ab0-9fd2-154a562a866c' WHERE id = 'e2518e91-f876-4a12-a4b9-2adacd1e2518';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('258525e5-885c-4f67-ba18-a54043ad2ee3', 'e96f0ee6-3337-4ab0-9fd2-154a562a866c', 'pix', 997.0, '2026-05-23', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 1, '2026-05-23T14:00:00');

-- LINHA 265 [SIM]: IPHONE 17 PRO MAX 1TB BRANCO NOVO (23/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('3c44312f-2f46-4f7b-a44d-f31795fdf4ed', 'Apple', 'IPHONE 17 PRO MAX 1TB BRANCO NOVO', '350230970121553', 10678.0, 10300.0, 1, 'novo', 'perfeito', 'vendido', '2026-05-23', '2026-05-23', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-23', '2026-05-23', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('acbf30a0-62b8-4f91-9de5-6dc5c4f90641', current_setting('importacao.proximo_numero')::int + 262, current_setting('importacao.cliente_id')::uuid, 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 10678.0, 10678.0, 0.0, '2026-05-23', '2026-05-23', '85e3aa42-b9af-49b8-a72a-64e9c337aa53');
UPDATE aparelhos SET venda_id = 'acbf30a0-62b8-4f91-9de5-6dc5c4f90641' WHERE id = '3c44312f-2f46-4f7b-a44d-f31795fdf4ed';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('d190ac73-8be3-4035-982e-4df2a8341b5d', 'acbf30a0-62b8-4f91-9de5-6dc5c4f90641', 'pix', 10678.0, '2026-05-23', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 1, '2026-05-23T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('be8b86ae-55e2-49a6-b6f8-983aaa83b22f', 1, 'acbf30a0-62b8-4f91-9de5-6dc5c4f90641', 'Brinde', 10.0, '2026-05-23', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-23');

-- LINHA 266 [SIM]: IPHONE 16 PRO MAX 256GB NATURAL SEMINOVO (23/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('d0f39436-ee86-4905-9a31-e32e34454a8f', 'Apple', 'IPHONE 16 PRO MAX 256GB NATURAL SEMINOVO', '358245524573077', 5200.0, 4850.0, 1, 'seminovo', 'bom', 'vendido', '2026-05-23', '2026-05-23', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-23', '2026-05-23', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('407262d2-5a28-4869-b4c3-b9117864d07c', current_setting('importacao.proximo_numero')::int + 263, current_setting('importacao.cliente_id')::uuid, 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 5200.0, 5200.0, 0.0, '2026-05-23', '2026-05-23', '85e3aa42-b9af-49b8-a72a-64e9c337aa53');
UPDATE aparelhos SET venda_id = '407262d2-5a28-4869-b4c3-b9117864d07c' WHERE id = 'd0f39436-ee86-4905-9a31-e32e34454a8f';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('fcbbb495-6505-44f9-a215-c104d1623389', '407262d2-5a28-4869-b4c3-b9117864d07c', 'pix', 5200.0, '2026-05-23', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 1, '2026-05-23T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('d576a8d6-1955-417f-ae25-0ce519609801', 1, '407262d2-5a28-4869-b4c3-b9117864d07c', 'Brinde', 25.0, '2026-05-23', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-23');

-- LINHA 267 [SIM]: IPHONE 17 PRO LARANJA 256GB NOVO (23/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('f7903348-bc1f-4ddf-9647-2ce075dd52ea', 'Apple', 'IPHONE 17 PRO LARANJA 256GB NOVO', '352001995775691', 7450.0, 7300.0, 1, 'novo', 'perfeito', 'vendido', '2026-05-23', '2026-05-23', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-23', '2026-05-23', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('66a18567-a2de-42f9-adab-9f002ae69198', current_setting('importacao.proximo_numero')::int + 264, current_setting('importacao.cliente_id')::uuid, 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 7450.0, 7450.0, 0.0, '2026-05-23', '2026-05-23', '85e3aa42-b9af-49b8-a72a-64e9c337aa53');
UPDATE aparelhos SET venda_id = '66a18567-a2de-42f9-adab-9f002ae69198' WHERE id = 'f7903348-bc1f-4ddf-9647-2ce075dd52ea';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('c13e7ff5-f5b8-4e64-aef8-d11bb9cd1c8a', '66a18567-a2de-42f9-adab-9f002ae69198', 'pix', 7450.0, '2026-05-23', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 1, '2026-05-23T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('f34726ac-eeea-404d-9464-7640915ed600', 1, '66a18567-a2de-42f9-adab-9f002ae69198', 'Brinde', 10.0, '2026-05-23', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-23');

-- LINHA 268 [SIM]: ULTRA 3 NOVO PRETO (23/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('f6d6b451-4e69-4de9-bb15-868e2888fd16', 'Outros', 'ULTRA 3 NOVO PRETO', 'HV4QK4YL20', 4650.0, 4580.0, 1, 'novo', 'perfeito', 'vendido', '2026-05-23', '2026-05-23', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-23', '2026-05-23', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('d5d966e5-2fe1-4b29-a64b-0f80c5576c61', current_setting('importacao.proximo_numero')::int + 265, current_setting('importacao.cliente_id')::uuid, 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 4650.0, 4650.0, 0.0, '2026-05-23', '2026-05-23', '85e3aa42-b9af-49b8-a72a-64e9c337aa53');
UPDATE aparelhos SET venda_id = 'd5d966e5-2fe1-4b29-a64b-0f80c5576c61' WHERE id = 'f6d6b451-4e69-4de9-bb15-868e2888fd16';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('fb8e4416-fcd4-47f7-bbef-1bd11a657668', 'd5d966e5-2fe1-4b29-a64b-0f80c5576c61', 'pix', 4650.0, '2026-05-23', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 1, '2026-05-23T14:00:00');

-- LINHA 269 [NAO]: TV Q LED TCL P7K (23/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('fc8347d0-b221-4222-9ed4-6fbbda2f4e89', 'Outros', 'TV Q LED TCL P7K', 'TVQLEDP7KTCL', 4600.0, 3850.0, 1, 'seminovo', 'bom', 'vendido', '2026-05-23', '2026-05-23', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-23', '2026-05-23', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('be0374ed-bf32-45f9-8b34-2d3d4a8bf54a', current_setting('importacao.proximo_numero')::int + 266, current_setting('importacao.cliente_id')::uuid, 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 4600.0, 4600.0, 0.0, '2026-05-23', '2026-05-23', '85e3aa42-b9af-49b8-a72a-64e9c337aa53');
UPDATE aparelhos SET venda_id = 'be0374ed-bf32-45f9-8b34-2d3d4a8bf54a' WHERE id = 'fc8347d0-b221-4222-9ed4-6fbbda2f4e89';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('a4e50b20-e219-4b7e-a471-303dc0e1a1e4', 'be0374ed-bf32-45f9-8b34-2d3d4a8bf54a', 'pix', 2800.0, '2026-05-23', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 1, '2026-05-23T14:00:00');
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, observacao, parcelas, criado_em)
VALUES ('77effc99-b5aa-4e4d-821d-7be96076a0e4', 'be0374ed-bf32-45f9-8b34-2d3d4a8bf54a', 'troca_aparelho', 1800.0, '2026-05-23', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'Troca: IPH 13 128GB ROSA', 1, '2026-05-23T14:00:00');

-- LINHA 270 [SIM]: IPHONE 15 PRO MAX 256GB PRETO SEMINOVO (23/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('de4cee9a-cfc6-41c6-91f3-0ea3ae153495', 'Apple', 'IPHONE 15 PRO MAX 256GB PRETO SEMINOVO', '352310725732009', 4000.0, 3700.0, 20, 'seminovo', 'bom', 'vendido', '2026-05-23', '2026-05-23', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-23', '2026-05-23', 'Vendedor Angel - pendente ID real');
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('1fe7f6df-f305-4a80-be96-073d2e64475f', current_setting('importacao.proximo_numero')::int + 267, current_setting('importacao.cliente_id')::uuid, 20, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 4000.0, 4000.0, 0.0, '2026-05-23', '2026-05-23', '97f12885-87ad-426a-8bbb-656889d82e10');
UPDATE aparelhos SET venda_id = '1fe7f6df-f305-4a80-be96-073d2e64475f' WHERE id = 'de4cee9a-cfc6-41c6-91f3-0ea3ae153495';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('13bd7e6f-ea8c-42f4-8fc7-7037d7a06a5f', '1fe7f6df-f305-4a80-be96-073d2e64475f', 'pix', 4000.0, '2026-05-23', '97f12885-87ad-426a-8bbb-656889d82e10', 1, '2026-05-23T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('d256dcca-cb23-4b64-a168-5565f1f0b42c', 20, '1fe7f6df-f305-4a80-be96-073d2e64475f', 'Brinde', 28.0, '2026-05-23', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-23');

-- LINHA 271 [SIM]: IPHONE 17 PRO MAX 256GB  BRANCO NOVO (24/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('da562a6d-bbe9-4f7e-bb33-2e769b1e03eb', 'Apple', 'IPHONE 17 PRO MAX 256GB  BRANCO NOVO', '350230976530443', 8296.0, 7850.0, 1, 'novo', 'perfeito', 'vendido', '2026-05-24', '2026-05-24', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-24', '2026-05-24', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('279619e0-6554-488a-8ff5-1db365486505', current_setting('importacao.proximo_numero')::int + 268, current_setting('importacao.cliente_id')::uuid, 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 8296.0, 8296.0, 0.0, '2026-05-24', '2026-05-24', '85e3aa42-b9af-49b8-a72a-64e9c337aa53');
UPDATE aparelhos SET venda_id = '279619e0-6554-488a-8ff5-1db365486505' WHERE id = 'da562a6d-bbe9-4f7e-bb33-2e769b1e03eb';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('fd68cfd9-f091-4cc1-b236-07cb2ad9afd3', '279619e0-6554-488a-8ff5-1db365486505', 'pix', 8296.0, '2026-05-24', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 1, '2026-05-24T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('4a1b632c-f43f-42c0-bbab-537c6bb7ff9d', 1, '279619e0-6554-488a-8ff5-1db365486505', 'Brinde', 25.0, '2026-05-24', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-24');

-- LINHA 272 [NAO]: IPHONE 14 PLUS 128GB LILAS SEMINOVO (24/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('76bb61ef-07b3-4aba-be9c-10d71125f596', 'Apple', 'IPHONE 14 PLUS 128GB LILAS SEMINOVO', '358257930308303', 2400.0, 2150.0, 1, 'seminovo', 'bom', 'vendido', '2026-05-24', '2026-05-24', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-24', '2026-05-24', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('9d2a8dea-d91a-4357-a6fb-8cf363476f21', current_setting('importacao.proximo_numero')::int + 269, current_setting('importacao.cliente_id')::uuid, 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 2400.0, 2400.0, 0.0, '2026-05-24', '2026-05-24', '85e3aa42-b9af-49b8-a72a-64e9c337aa53');
UPDATE aparelhos SET venda_id = '9d2a8dea-d91a-4357-a6fb-8cf363476f21' WHERE id = '76bb61ef-07b3-4aba-be9c-10d71125f596';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('7650230a-81dc-47c5-bbf6-b98feb7dffcb', '9d2a8dea-d91a-4357-a6fb-8cf363476f21', 'pix', 2400.0, '2026-05-24', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 1, '2026-05-24T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('76d8704f-4ea1-4a63-b5d2-6b3332b5f48b', 1, '9d2a8dea-d91a-4357-a6fb-8cf363476f21', 'Brinde', 25.0, '2026-05-24', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-24');

-- LINHA 273 [SIM]: IPHONE 17 PRO MAX 256GB SILVER NOVO (24/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('2858647b-236d-4d8c-ac25-15ea54bb9261', 'Apple', 'IPHONE 17 PRO MAX 256GB SILVER NOVO', '351771409636900', 8250.0, 7900.0, 20, 'novo', 'perfeito', 'vendido', '2026-05-24', '2026-05-24', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-24', '2026-05-24', 'Vendedor Angel - pendente ID real');
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('82826a89-707d-42c6-b53e-9c53dd50f961', current_setting('importacao.proximo_numero')::int + 270, current_setting('importacao.cliente_id')::uuid, 20, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 8250.0, 8250.0, 0.0, '2026-05-24', '2026-05-24', '97f12885-87ad-426a-8bbb-656889d82e10');
UPDATE aparelhos SET venda_id = '82826a89-707d-42c6-b53e-9c53dd50f961' WHERE id = '2858647b-236d-4d8c-ac25-15ea54bb9261';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('7b3cd209-d171-4b5d-9a93-6e61b5629985', '82826a89-707d-42c6-b53e-9c53dd50f961', 'pix', 8250.0, '2026-05-24', '97f12885-87ad-426a-8bbb-656889d82e10', 1, '2026-05-24T14:00:00');

-- LINHA 274 [NAO]: REDMI NOTE 15 PRO 5G 256GB PRETO NOVO (24/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('694365fe-cf75-4423-be64-7f77cb86e392', 'Xiaomi', 'REDMI NOTE 15 PRO 5G 256GB PRETO NOVO', '863573084082744', 1850.0, 1660.0, 4, 'novo', 'perfeito', 'vendido', '2026-05-24', '2026-05-24', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-24', '2026-05-24', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('6b54eafc-695f-4a53-b91e-88bfd9faed11', current_setting('importacao.proximo_numero')::int + 271, current_setting('importacao.cliente_id')::uuid, 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 1850.0, 1850.0, 0.0, '2026-05-24', '2026-05-24', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
UPDATE aparelhos SET venda_id = '6b54eafc-695f-4a53-b91e-88bfd9faed11' WHERE id = '694365fe-cf75-4423-be64-7f77cb86e392';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('dbf6fb4f-f411-4fda-9445-93421050c738', '6b54eafc-695f-4a53-b91e-88bfd9faed11', 'pix', 1850.0, '2026-05-24', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1, '2026-05-24T14:00:00');

-- LINHA 275 [NAO]: IPHONE 15 PRO MAX 256GB AZUL SEMINOVO (24/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('c91c1278-457b-4962-bdd4-7219af9a3050', 'Apple', 'IPHONE 15 PRO MAX 256GB AZUL SEMINOVO', '354773167256449', 4093.0, 3700.0, 4, 'seminovo', 'bom', 'vendido', '2026-05-24', '2026-05-24', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-24', '2026-05-24', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('6ba7ae35-2dd4-4925-8ee8-3afeea85c9c2', current_setting('importacao.proximo_numero')::int + 272, current_setting('importacao.cliente_id')::uuid, 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 4093.0, 4093.0, 0.0, '2026-05-24', '2026-05-24', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
UPDATE aparelhos SET venda_id = '6ba7ae35-2dd4-4925-8ee8-3afeea85c9c2' WHERE id = 'c91c1278-457b-4962-bdd4-7219af9a3050';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('66295aec-c096-46e8-94e3-cbef45b25018', '6ba7ae35-2dd4-4925-8ee8-3afeea85c9c2', 'pix', 2500.0, '2026-05-24', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1, '2026-05-24T14:00:00');
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('e526f878-f670-40e2-a27d-216bdaebf854', '6ba7ae35-2dd4-4925-8ee8-3afeea85c9c2', 'cartao_credito', 1593.0, '2026-05-24', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1, '2026-05-24T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('d49d399a-d0df-40ce-bb69-1acb22ab3b61', 4, '6ba7ae35-2dd4-4925-8ee8-3afeea85c9c2', 'Brinde', 50.0, '2026-05-24', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-24');

-- LINHA 276 [NAO]: IPHONE 17 PRO MAX 256GB AZUL LACRADO (24/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('dae90e25-4af5-447f-8e13-f4c83b72ae8f', 'Apple', 'IPHONE 17 PRO MAX 256GB AZUL LACRADO', '359652122041986', 7800.0, 7650.0, 1, 'novo', 'perfeito', 'vendido', '2026-05-24', '2026-05-24', '9451cd9f-6770-4e32-aae8-c75fa675e818', '2026-05-24', '2026-05-24', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('3c048edd-124f-4e86-bf26-b30c3d095bea', current_setting('importacao.proximo_numero')::int + 273, current_setting('importacao.cliente_id')::uuid, 1, '9451cd9f-6770-4e32-aae8-c75fa675e818', 'concluida', 'normal', 7800.0, 7800.0, 0.0, '2026-05-24', '2026-05-24', '9451cd9f-6770-4e32-aae8-c75fa675e818');
UPDATE aparelhos SET venda_id = '3c048edd-124f-4e86-bf26-b30c3d095bea' WHERE id = 'dae90e25-4af5-447f-8e13-f4c83b72ae8f';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('a4bbc578-20bb-4b37-b7c8-b6c9bcaa6dfe', '3c048edd-124f-4e86-bf26-b30c3d095bea', 'pix', 7800.0, '2026-05-24', '9451cd9f-6770-4e32-aae8-c75fa675e818', 1, '2026-05-24T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('78ca4fb7-f599-40f7-9ad7-64afb2b098a9', 1, '3c048edd-124f-4e86-bf26-b30c3d095bea', 'Brinde', 5.0, '2026-05-24', '9451cd9f-6770-4e32-aae8-c75fa675e818', '2026-05-24');

-- LINHA 277 [NAO]: IPHONE 16 PRO MAX 512GB PRETO SEMINOVO (24/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('192b46ff-39c9-4c7a-bfbd-77487f2a607f', 'Apple', 'IPHONE 16 PRO MAX 512GB PRETO SEMINOVO', '352641353019966', 5500.0, 5150.0, 4, 'seminovo', 'bom', 'vendido', '2026-05-24', '2026-05-24', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-24', '2026-05-24', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('25bda798-8822-4d40-a22a-1d6cff1e45f4', current_setting('importacao.proximo_numero')::int + 274, current_setting('importacao.cliente_id')::uuid, 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 5500.0, 5500.0, 0.0, '2026-05-24', '2026-05-24', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
UPDATE aparelhos SET venda_id = '25bda798-8822-4d40-a22a-1d6cff1e45f4' WHERE id = '192b46ff-39c9-4c7a-bfbd-77487f2a607f';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('43f5df07-ea12-4187-8017-df5775b83ccd', '25bda798-8822-4d40-a22a-1d6cff1e45f4', 'cartao_credito', 2400.0, '2026-05-24', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1, '2026-05-24T14:00:00');
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, observacao, parcelas, criado_em)
VALUES ('4a590e19-c967-4a20-af56-1cdde0238e84', '25bda798-8822-4d40-a22a-1d6cff1e45f4', 'troca_aparelho', 3100.0, '2026-05-24', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'Troca: UM 16 128 SEMINOVO', 1, '2026-05-24T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('39296f71-559f-4386-854d-98e5cd3deeb5', 4, '25bda798-8822-4d40-a22a-1d6cff1e45f4', 'Brinde', 25.0, '2026-05-24', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-24');

-- LINHA 278 [NAO]: IPHONE 17 PRO MAX 256GB AZUL NOVO (24/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('75bc77c8-e633-4c9c-921c-1b401c968bf8', 'Apple', 'IPHONE 17 PRO MAX 256GB AZUL NOVO', '353314497716249', 7860.0, 7650.0, 4, 'novo', 'perfeito', 'vendido', '2026-05-24', '2026-05-24', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-24', '2026-05-24', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('99e91664-4c7c-42dd-ac38-98110de228b6', current_setting('importacao.proximo_numero')::int + 275, current_setting('importacao.cliente_id')::uuid, 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 7860.0, 7860.0, 0.0, '2026-05-24', '2026-05-24', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
UPDATE aparelhos SET venda_id = '99e91664-4c7c-42dd-ac38-98110de228b6' WHERE id = '75bc77c8-e633-4c9c-921c-1b401c968bf8';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('3a5c3432-fdfa-4a19-ac8c-986725ebc798', '99e91664-4c7c-42dd-ac38-98110de228b6', 'pix', 7860.0, '2026-05-24', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1, '2026-05-24T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('83e2e248-5d71-4d73-b469-0ef9996d5ef4', 4, '99e91664-4c7c-42dd-ac38-98110de228b6', 'Brinde', 45.0, '2026-05-24', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-24');

-- LINHA 279 [NAO]: IPAD AIR M4 11° SPACE GRAY NOVO (24/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('105f056a-70f5-4b47-a102-634ed9a3183e', 'Apple', 'IPAD AIR M4 11° SPACE GRAY NOVO', 'DGM6TN696L', 3900.0, 3650.0, 4, 'novo', 'perfeito', 'vendido', '2026-05-24', '2026-05-24', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-24', '2026-05-24', 'Pagto junto (Aparelho 1/1, total grupo R$ 3,900)');
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('fbba7426-68a7-42e4-8ad8-6bf74e9092a0', current_setting('importacao.proximo_numero')::int + 276, current_setting('importacao.cliente_id')::uuid, 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 3900.0, 3900.0, 0.0, '2026-05-24', '2026-05-24', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
UPDATE aparelhos SET venda_id = 'fbba7426-68a7-42e4-8ad8-6bf74e9092a0' WHERE id = '105f056a-70f5-4b47-a102-634ed9a3183e';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('88a2c15e-64b2-4a02-b981-318fd31c8867', 'fbba7426-68a7-42e4-8ad8-6bf74e9092a0', 'pix', 3900.0, '2026-05-24', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1, '2026-05-24T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('2bbfcdce-714e-4df8-afe9-26292ba44d23', 4, 'fbba7426-68a7-42e4-8ad8-6bf74e9092a0', 'Brinde', 30.0, '2026-05-24', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-24');

-- LINHA 280 [NAO]: AIPORDS PRO 3 BRANCO NOVO (24/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('b6920600-edaf-4232-b407-60f03c03012e', 'Outros', 'AIPORDS PRO 3 BRANCO NOVO', 'DKQV09VNQJ', 1520.0, 1435.0, 4, 'novo', 'perfeito', 'vendido', '2026-05-24', '2026-05-24', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-24', '2026-05-24', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('452145a9-993b-427b-ad10-40ba3f15197c', current_setting('importacao.proximo_numero')::int + 277, current_setting('importacao.cliente_id')::uuid, 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 1520.0, 1520.0, 0.0, '2026-05-24', '2026-05-24', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
UPDATE aparelhos SET venda_id = '452145a9-993b-427b-ad10-40ba3f15197c' WHERE id = 'b6920600-edaf-4232-b407-60f03c03012e';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('3407cae1-6fc6-41ad-b573-400a229af1bb', '452145a9-993b-427b-ad10-40ba3f15197c', 'pix', 1520.0, '2026-05-24', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1, '2026-05-24T14:00:00');

-- LINHA 281 [NAO]: REDMI NOTE 15 PRO 4G 512GB TITANIO NOVO (24/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('4f60f12c-b297-4f05-acb6-2657488f4346', 'Xiaomi', 'REDMI NOTE 15 PRO 4G 512GB TITANIO NOVO', '863911087323881', 1900.0, 1800.0, 4, 'novo', 'perfeito', 'vendido', '2026-05-24', '2026-05-24', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-24', '2026-05-24', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('19f55c2b-4166-43b7-98db-518219581a93', current_setting('importacao.proximo_numero')::int + 278, current_setting('importacao.cliente_id')::uuid, 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 1900.0, 1900.0, 0.0, '2026-05-24', '2026-05-24', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
UPDATE aparelhos SET venda_id = '19f55c2b-4166-43b7-98db-518219581a93' WHERE id = '4f60f12c-b297-4f05-acb6-2657488f4346';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('c2e4a460-c945-44ea-967e-41e0990830b4', '19f55c2b-4166-43b7-98db-518219581a93', 'pix', 900.0, '2026-05-24', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1, '2026-05-24T14:00:00');
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('3fc09af1-6f0a-4020-a95d-6f53c4c43e16', '19f55c2b-4166-43b7-98db-518219581a93', 'dinheiro', 1000.0, '2026-05-24', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1, '2026-05-24T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('0fe4b467-3d08-4ddc-b661-b04a1e1991db', 4, '19f55c2b-4166-43b7-98db-518219581a93', 'Brinde', 5.0, '2026-05-24', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-24');

-- LINHA 282 [NAO]: IPHONE 17 PRO 256GB SILVER SEMINOVO (24/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('ce799aa2-3ff9-4110-ba19-2fba880b04da', 'Apple', 'IPHONE 17 PRO 256GB SILVER SEMINOVO', '350455778567174', 6750.0, 6100.0, 20, 'seminovo', 'bom', 'vendido', '2026-05-24', '2026-05-24', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', '2026-05-24', '2026-05-24', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('cbcd6dd7-255c-4458-ad82-8c5eebd8384e', current_setting('importacao.proximo_numero')::int + 279, current_setting('importacao.cliente_id')::uuid, 20, 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 'concluida', 'normal', 6750.0, 6750.0, 0.0, '2026-05-24', '2026-05-24', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4');
UPDATE aparelhos SET venda_id = 'cbcd6dd7-255c-4458-ad82-8c5eebd8384e' WHERE id = 'ce799aa2-3ff9-4110-ba19-2fba880b04da';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('ff74f27f-33b5-4241-9387-f7d90fbd76d5', 'cbcd6dd7-255c-4458-ad82-8c5eebd8384e', 'cartao_credito', 3650.0, '2026-05-24', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 1, '2026-05-24T14:00:00');
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, observacao, parcelas, criado_em)
VALUES ('6a254900-f2ee-4647-927c-4d51b879433b', 'cbcd6dd7-255c-4458-ad82-8c5eebd8384e', 'troca_aparelho', 3100.0, '2026-05-24', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 'Troca: 15 PRO 256 AZUL', 1, '2026-05-24T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('59032540-089b-4ce3-8c0d-e82e66500b11', 20, 'cbcd6dd7-255c-4458-ad82-8c5eebd8384e', 'Brinde', 10.0, '2026-05-24', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', '2026-05-24');

-- LINHA 283 [NAO]: IPHONE 13 PRO 128GB SEMINOVO (24/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('2e6e9f95-20da-4c2e-b9aa-92eb491b2227', 'Apple', 'IPHONE 13 PRO 128GB SEMINOVO', '354903621734992', 2400.0, 2300.0, 19, 'seminovo', 'bom', 'vendido', '2026-05-24', '2026-05-24', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-24', '2026-05-24', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('fec61b08-520b-4ec5-9252-b169ca556945', current_setting('importacao.proximo_numero')::int + 280, current_setting('importacao.cliente_id')::uuid, 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 2400.0, 2400.0, 0.0, '2026-05-24', '2026-05-24', '97f12885-87ad-426a-8bbb-656889d82e10');
UPDATE aparelhos SET venda_id = 'fec61b08-520b-4ec5-9252-b169ca556945' WHERE id = '2e6e9f95-20da-4c2e-b9aa-92eb491b2227';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('7058e9d0-0e71-4965-bd15-e4f0b18ffdb2', 'fec61b08-520b-4ec5-9252-b169ca556945', 'dinheiro', 2400.0, '2026-05-24', '97f12885-87ad-426a-8bbb-656889d82e10', 1, '2026-05-24T14:00:00');

-- LINHA 284 [SIM]: IPHONE 16 PRO MAX 1TB BRANCO SEMINOVO (24/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('38c55ec3-4312-4cf0-a685-f7de43cd7494', 'Apple', 'IPHONE 16 PRO MAX 1TB BRANCO SEMINOVO', '356864569095853', 5800.0, 5300.0, 19, 'seminovo', 'bom', 'vendido', '2026-05-24', '2026-05-24', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-24', '2026-05-24', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('14bd0914-fb6a-4f7e-ae3d-7799aaaf27f4', current_setting('importacao.proximo_numero')::int + 281, current_setting('importacao.cliente_id')::uuid, 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 5800.0, 5800.0, 0.0, '2026-05-24', '2026-05-24', '97f12885-87ad-426a-8bbb-656889d82e10');
UPDATE aparelhos SET venda_id = '14bd0914-fb6a-4f7e-ae3d-7799aaaf27f4' WHERE id = '38c55ec3-4312-4cf0-a685-f7de43cd7494';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('63704545-43a0-4070-8b4e-2005f5cdab90', '14bd0914-fb6a-4f7e-ae3d-7799aaaf27f4', 'pix', 5800.0, '2026-05-24', '97f12885-87ad-426a-8bbb-656889d82e10', 1, '2026-05-24T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('e625b568-f5c2-4fbe-82cd-7bb21fa16d56', 19, '14bd0914-fb6a-4f7e-ae3d-7799aaaf27f4', 'Brinde', 25.0, '2026-05-24', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-24');

-- LINHA 285 [NAO]: IPHONE 13 128GB AZUL SEMINOVO (24/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('e2f07434-4774-40d5-90bb-a33d9db9d0cb', 'Apple', 'IPHONE 13 128GB AZUL SEMINOVO', '350196694023757', 2075.0, 1780.0, 19, 'seminovo', 'bom', 'vendido', '2026-05-24', '2026-05-24', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-24', '2026-05-24', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('36163188-6419-49c0-bafb-f9316f2290b1', current_setting('importacao.proximo_numero')::int + 282, current_setting('importacao.cliente_id')::uuid, 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 2075.0, 2075.0, 0.0, '2026-05-24', '2026-05-24', '97f12885-87ad-426a-8bbb-656889d82e10');
UPDATE aparelhos SET venda_id = '36163188-6419-49c0-bafb-f9316f2290b1' WHERE id = 'e2f07434-4774-40d5-90bb-a33d9db9d0cb';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('1c909020-e253-45f7-bba3-ffd31273f6da', '36163188-6419-49c0-bafb-f9316f2290b1', 'cartao_credito', 2075.0, '2026-05-24', '97f12885-87ad-426a-8bbb-656889d82e10', 1, '2026-05-24T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('ee1eed45-cb4b-4300-8b1d-14a9a9ca9ab5', 19, '36163188-6419-49c0-bafb-f9316f2290b1', 'Brinde', 25.0, '2026-05-24', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-24');

-- LINHA 286 [NAO]: IPHONE 17 PRO MAX 256GB NOVO (24/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('cf06f7ec-fc2b-4ccb-8e36-41f2f459f367', 'Apple', 'IPHONE 17 PRO MAX 256GB NOVO', '353763614060768', 7875.0, 7650.0, 19, 'novo', 'perfeito', 'vendido', '2026-05-24', '2026-05-24', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-24', '2026-05-24', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('af81cd7c-641d-44fa-9990-ce2ddd58d753', current_setting('importacao.proximo_numero')::int + 283, current_setting('importacao.cliente_id')::uuid, 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 7875.0, 7875.0, 0.0, '2026-05-24', '2026-05-24', '97f12885-87ad-426a-8bbb-656889d82e10');
UPDATE aparelhos SET venda_id = 'af81cd7c-641d-44fa-9990-ce2ddd58d753' WHERE id = 'cf06f7ec-fc2b-4ccb-8e36-41f2f459f367';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('652645dd-844a-4b26-b111-3675be27b3f2', 'af81cd7c-641d-44fa-9990-ce2ddd58d753', 'cartao_credito', 7875.0, '2026-05-24', '97f12885-87ad-426a-8bbb-656889d82e10', 1, '2026-05-24T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('350daf43-bcf9-4d1b-a5ea-beec13ea8cd0', 19, 'af81cd7c-641d-44fa-9990-ce2ddd58d753', 'Brinde', 25.0, '2026-05-24', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-24');

-- LINHA 287 [NAO]: IPHONE 17 PRO MAX 256GB SILVER NOVO (24/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('058c791d-c4d7-42a0-bb83-bee995a5c8df', 'Apple', 'IPHONE 17 PRO MAX 256GB SILVER NOVO', '357247256152923', 7950.0, 7850.0, 19, 'novo', 'perfeito', 'vendido', '2026-05-24', '2026-05-24', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-24', '2026-05-24', 'Pagto junto (Aparelho 1/4, total grupo R$ 12,500)');
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('fcd5ee24-4293-45df-a124-599b1a98b3cc', current_setting('importacao.proximo_numero')::int + 284, current_setting('importacao.cliente_id')::uuid, 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 7950.0, 7950.0, 0.0, '2026-05-24', '2026-05-24', '97f12885-87ad-426a-8bbb-656889d82e10');
UPDATE aparelhos SET venda_id = 'fcd5ee24-4293-45df-a124-599b1a98b3cc' WHERE id = '058c791d-c4d7-42a0-bb83-bee995a5c8df';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('67db4313-3e1d-4e63-86b1-63ebcbf5c931', 'fcd5ee24-4293-45df-a124-599b1a98b3cc', 'pix', 7950.0, '2026-05-24', '97f12885-87ad-426a-8bbb-656889d82e10', 1, '2026-05-24T14:00:00');

-- LINHA 288 [NAO]: APPLE PENCIL USB C NOVO (24/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('f67240d6-ecf4-4ae1-a75b-81449690df16', 'Apple', 'APPLE PENCIL USB C NOVO', 'H4719R9MG2', 770.0, 630.0, 19, 'novo', 'perfeito', 'vendido', '2026-05-24', '2026-05-24', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-24', '2026-05-24', 'Pagto junto (Aparelho 2/4, total grupo R$ 12,500)');
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('5daf17ae-0c43-4f85-8b00-d85e3b3acb61', current_setting('importacao.proximo_numero')::int + 285, current_setting('importacao.cliente_id')::uuid, 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 770.0, 770.0, 0.0, '2026-05-24', '2026-05-24', '97f12885-87ad-426a-8bbb-656889d82e10');
UPDATE aparelhos SET venda_id = '5daf17ae-0c43-4f85-8b00-d85e3b3acb61' WHERE id = 'f67240d6-ecf4-4ae1-a75b-81449690df16';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('2f4820f1-b811-4914-b738-cc73a4e42123', '5daf17ae-0c43-4f85-8b00-d85e3b3acb61', 'pix', 770.0, '2026-05-24', '97f12885-87ad-426a-8bbb-656889d82e10', 1, '2026-05-24T14:00:00');

-- LINHA 289 [NAO]: IPAD 11 128GB ROSA NOVO (24/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('7853445d-f289-4a12-80d4-b658ea37bce6', 'Apple', 'IPAD 11 128GB ROSA NOVO', 'FCYK60J9ML', 2190.0, 2090.0, 19, 'novo', 'perfeito', 'vendido', '2026-05-24', '2026-05-24', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-24', '2026-05-24', 'Pagto junto (Aparelho 3/4, total grupo R$ 12,500)');
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('a6cf5ae4-513e-4ce1-a077-74ebcfeb345b', current_setting('importacao.proximo_numero')::int + 286, current_setting('importacao.cliente_id')::uuid, 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 2190.0, 2190.0, 0.0, '2026-05-24', '2026-05-24', '97f12885-87ad-426a-8bbb-656889d82e10');
UPDATE aparelhos SET venda_id = 'a6cf5ae4-513e-4ce1-a077-74ebcfeb345b' WHERE id = '7853445d-f289-4a12-80d4-b658ea37bce6';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('a1ec53b2-5183-447d-8749-e6e3be0d6018', 'a6cf5ae4-513e-4ce1-a077-74ebcfeb345b', 'pix', 2190.0, '2026-05-24', '97f12885-87ad-426a-8bbb-656889d82e10', 1, '2026-05-24T14:00:00');

-- LINHA 290 [NAO]: AIRPORDS PRO 3 NOVO (24/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('88a8e9fd-cdf4-4a05-916a-2dab6cfba84a', 'Outros', 'AIRPORDS PRO 3 NOVO', 'LLG9MVVVJ9', 1590.0, 1490.0, 19, 'novo', 'perfeito', 'vendido', '2026-05-24', '2026-05-24', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-24', '2026-05-24', 'Pagto junto (Aparelho 4/4, total grupo R$ 12,500)');
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('ceeaef5f-932b-48b6-85fb-2214a21c2a40', current_setting('importacao.proximo_numero')::int + 287, current_setting('importacao.cliente_id')::uuid, 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 1590.0, 1590.0, 0.0, '2026-05-24', '2026-05-24', '97f12885-87ad-426a-8bbb-656889d82e10');
UPDATE aparelhos SET venda_id = 'ceeaef5f-932b-48b6-85fb-2214a21c2a40' WHERE id = '88a8e9fd-cdf4-4a05-916a-2dab6cfba84a';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('02a575e6-271d-4c42-a5e2-ed6f427538eb', 'ceeaef5f-932b-48b6-85fb-2214a21c2a40', 'pix', 1590.0, '2026-05-24', '97f12885-87ad-426a-8bbb-656889d82e10', 1, '2026-05-24T14:00:00');

-- LINHA 291 [NAO]: IPHONE 14 128GB BRANCO SEMINOVO (26/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('3c56b8a1-9fa7-4eb5-80ae-10a62739a70b', 'Apple', 'IPHONE 14 128GB BRANCO SEMINOVO', '355794428661143', 2150.0, 1900.0, 20, 'seminovo', 'bom', 'vendido', '2026-05-26', '2026-05-26', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', '2026-05-26', '2026-05-26', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('42815d24-6cad-4712-8888-ea2fda8d63a0', current_setting('importacao.proximo_numero')::int + 288, current_setting('importacao.cliente_id')::uuid, 20, 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 'concluida', 'normal', 2150.0, 2150.0, 0.0, '2026-05-26', '2026-05-26', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4');
UPDATE aparelhos SET venda_id = '42815d24-6cad-4712-8888-ea2fda8d63a0' WHERE id = '3c56b8a1-9fa7-4eb5-80ae-10a62739a70b';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('ebebe04d-4070-4f61-b8ac-680388724ec3', '42815d24-6cad-4712-8888-ea2fda8d63a0', 'cartao_credito', 2150.0, '2026-05-26', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 1, '2026-05-26T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('ea714456-814e-4327-82bf-df2bcac6b0ff', 20, '42815d24-6cad-4712-8888-ea2fda8d63a0', 'Brinde', 25.0, '2026-05-26', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', '2026-05-26');

-- LINHA 292 [NAO]: IPHONE 15 PRO MAX 256GB PRETO SEMINOVO (26/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('9e46a599-cb50-4fd4-a9fb-6076c0e498e3', 'Apple', 'IPHONE 15 PRO MAX 256GB PRETO SEMINOVO', '359897655192066', 4150.0, 3700.0, 4, 'seminovo', 'bom', 'vendido', '2026-05-26', '2026-05-26', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-26', '2026-05-26', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('dc5b2fe6-0a73-451c-bb53-571af8fe87e8', current_setting('importacao.proximo_numero')::int + 289, current_setting('importacao.cliente_id')::uuid, 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 4150.0, 4150.0, 0.0, '2026-05-26', '2026-05-26', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
UPDATE aparelhos SET venda_id = 'dc5b2fe6-0a73-451c-bb53-571af8fe87e8' WHERE id = '9e46a599-cb50-4fd4-a9fb-6076c0e498e3';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('e59850cd-48ea-4d4a-8284-a4ed4dbf0f56', 'dc5b2fe6-0a73-451c-bb53-571af8fe87e8', 'dinheiro', 1100.0, '2026-05-26', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1, '2026-05-26T14:00:00');
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('9bea51fc-18c6-40ab-a279-6c024e4cc82c', 'dc5b2fe6-0a73-451c-bb53-571af8fe87e8', 'cartao_credito', 3050.0, '2026-05-26', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1, '2026-05-26T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('de204040-e721-44d2-97c9-9de5c3eddf55', 4, 'dc5b2fe6-0a73-451c-bb53-571af8fe87e8', 'Brinde', 25.0, '2026-05-26', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-26');

-- LINHA 293 [NAO]: IPAD 11° (A16) 128GB SILVER (26/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('a212e20a-f47d-4afa-a016-53ca1f9b28ec', 'Apple', 'IPAD 11° (A16) 128GB SILVER', 'CKGH9XQDXG', 2500.0, 2180.0, 4, 'seminovo', 'bom', 'vendido', '2026-05-26', '2026-05-26', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-26', '2026-05-26', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('ba237f7e-29ac-400f-b72f-d3b992fd1570', current_setting('importacao.proximo_numero')::int + 290, current_setting('importacao.cliente_id')::uuid, 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 2500.0, 2500.0, 0.0, '2026-05-26', '2026-05-26', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
UPDATE aparelhos SET venda_id = 'ba237f7e-29ac-400f-b72f-d3b992fd1570' WHERE id = 'a212e20a-f47d-4afa-a016-53ca1f9b28ec';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('a10407ba-fc00-4428-9472-1d1d864c4c27', 'ba237f7e-29ac-400f-b72f-d3b992fd1570', 'pix', 2500.0, '2026-05-26', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1, '2026-05-26T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('5e12fcdb-e3b4-47da-8874-74ce2cad7303', 4, 'ba237f7e-29ac-400f-b72f-d3b992fd1570', 'Brinde', 170.0, '2026-05-26', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-26');

-- LINHA 294 [SIM]: BOOMBOX 4 LARANJA NOVO (26/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('8c837413-6209-4878-b3c7-e96576e3dbbd', 'Outros', 'BOOMBOX 4 LARANJA NOVO', 'TL1973-BQ0009136', 2640.0, 2390.0, 4, 'novo', 'perfeito', 'vendido', '2026-05-26', '2026-05-26', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-26', '2026-05-26', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('6e3b459c-3d18-443f-9566-e1da83ad96cd', current_setting('importacao.proximo_numero')::int + 291, current_setting('importacao.cliente_id')::uuid, 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 2640.0, 2640.0, 0.0, '2026-05-26', '2026-05-26', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
UPDATE aparelhos SET venda_id = '6e3b459c-3d18-443f-9566-e1da83ad96cd' WHERE id = '8c837413-6209-4878-b3c7-e96576e3dbbd';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('9c99cfd7-857e-4c10-aad2-78291360174b', '6e3b459c-3d18-443f-9566-e1da83ad96cd', 'pix', 2640.0, '2026-05-26', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1, '2026-05-26T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('34758661-7d02-4748-ad2e-ca104b268ed4', 4, '6e3b459c-3d18-443f-9566-e1da83ad96cd', 'Brinde', 85.0, '2026-05-26', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-26');

-- LINHA 295 [NAO]: IPHONE 16 PRO MAX 256GB PRETO SEMINOVO (26/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('858e4821-f890-4fed-8a94-49079b4b7477', 'Apple', 'IPHONE 16 PRO MAX 256GB PRETO SEMINOVO', '357003196809944', 5100.0, 4850.0, 4, 'seminovo', 'bom', 'vendido', '2026-05-26', '2026-05-26', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-26', '2026-05-26', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('62b8b248-364e-47ca-9344-3670b428e7bc', current_setting('importacao.proximo_numero')::int + 292, current_setting('importacao.cliente_id')::uuid, 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 5100.0, 5100.0, 0.0, '2026-05-26', '2026-05-26', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
UPDATE aparelhos SET venda_id = '62b8b248-364e-47ca-9344-3670b428e7bc' WHERE id = '858e4821-f890-4fed-8a94-49079b4b7477';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('7ae0a831-d6c0-4253-8a5e-fddd26c4b14e', '62b8b248-364e-47ca-9344-3670b428e7bc', 'pix', 4100.0, '2026-05-26', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1, '2026-05-26T14:00:00');
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, observacao, parcelas, criado_em)
VALUES ('90d83e02-c369-4a45-97bf-75e7e6b2f6fc', '62b8b248-364e-47ca-9344-3670b428e7bc', 'troca_aparelho', 1000.0, '2026-05-26', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'Troca: ENTROU UM 12 128GB SEMINOVO POR', 1, '2026-05-26T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('9f290afc-7d56-43f8-b3e8-de5b2e2169c2', 4, '62b8b248-364e-47ca-9344-3670b428e7bc', 'Brinde', 25.0, '2026-05-26', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-26');

-- LINHA 296 [SIM]: IPHONE 17 256GB  BRANCO NOVO (26/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('726b2059-3865-415f-8e07-bf438271d0e6', 'Apple', 'IPHONE 17 256GB  BRANCO NOVO', '352824562423886', 4850.0, 4600.0, 20, 'novo', 'perfeito', 'vendido', '2026-05-26', '2026-05-26', '25e2da5b-9e76-4388-9890-7e22efd6940d', '2026-05-26', '2026-05-26', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('ad4bb3d8-d005-4abf-9461-cfdb7c222bdf', current_setting('importacao.proximo_numero')::int + 293, current_setting('importacao.cliente_id')::uuid, 20, '25e2da5b-9e76-4388-9890-7e22efd6940d', 'concluida', 'normal', 4850.0, 4850.0, 0.0, '2026-05-26', '2026-05-26', '25e2da5b-9e76-4388-9890-7e22efd6940d');
UPDATE aparelhos SET venda_id = 'ad4bb3d8-d005-4abf-9461-cfdb7c222bdf' WHERE id = '726b2059-3865-415f-8e07-bf438271d0e6';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('976c4341-ec2e-4792-8c3a-7cc3c04226f2', 'ad4bb3d8-d005-4abf-9461-cfdb7c222bdf', 'pix', 4850.0, '2026-05-26', '25e2da5b-9e76-4388-9890-7e22efd6940d', 1, '2026-05-26T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('e88ed959-1895-4b77-a6e5-ffbd1c788021', 20, 'ad4bb3d8-d005-4abf-9461-cfdb7c222bdf', 'Brinde', 15.0, '2026-05-26', '25e2da5b-9e76-4388-9890-7e22efd6940d', '2026-05-26');

-- LINHA 297 [NAO]: IPHONE 16 PRO MAX 1TB PRETO NOVO (26/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('fa5051da-b55e-4546-9636-f60e093c30f4', 'Apple', 'IPHONE 16 PRO MAX 1TB PRETO NOVO', '359222380985702', 5800.0, 5300.0, 20, 'novo', 'perfeito', 'vendido', '2026-05-26', '2026-05-26', '25e2da5b-9e76-4388-9890-7e22efd6940d', '2026-05-26', '2026-05-26', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('ecf4f26c-2ff6-490f-9bd1-947e14d9bf90', current_setting('importacao.proximo_numero')::int + 294, current_setting('importacao.cliente_id')::uuid, 20, '25e2da5b-9e76-4388-9890-7e22efd6940d', 'concluida', 'normal', 5800.0, 5800.0, 0.0, '2026-05-26', '2026-05-26', '25e2da5b-9e76-4388-9890-7e22efd6940d');
UPDATE aparelhos SET venda_id = 'ecf4f26c-2ff6-490f-9bd1-947e14d9bf90' WHERE id = 'fa5051da-b55e-4546-9636-f60e093c30f4';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('fda8126e-f6e5-45f6-b9c5-6b5f98f471b4', 'ecf4f26c-2ff6-490f-9bd1-947e14d9bf90', 'pix', 2000.0, '2026-05-26', '25e2da5b-9e76-4388-9890-7e22efd6940d', 1, '2026-05-26T14:00:00');
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('58835e5a-973d-4094-9e96-28e2829b172a', 'ecf4f26c-2ff6-490f-9bd1-947e14d9bf90', 'cartao_credito', 3800.0, '2026-05-26', '25e2da5b-9e76-4388-9890-7e22efd6940d', 1, '2026-05-26T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('f5424c8d-917a-4375-8419-ea0233ac9899', 20, 'ecf4f26c-2ff6-490f-9bd1-947e14d9bf90', 'Brinde', 15.0, '2026-05-26', '25e2da5b-9e76-4388-9890-7e22efd6940d', '2026-05-26');

-- LINHA 298 [SIM]: IPHONE 16 PRO MAX 256GB PRETO SEMINOVO (26/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('12990f60-c0bd-4061-b0c5-98bc58e2d008', 'Apple', 'IPHONE 16 PRO MAX 256GB PRETO SEMINOVO', '359222385905622', 5150.0, 4850.0, 19, 'seminovo', 'bom', 'vendido', '2026-05-26', '2026-05-26', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-26', '2026-05-26', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('9831ba4e-6f49-45f3-a6de-84a09dde64af', current_setting('importacao.proximo_numero')::int + 295, current_setting('importacao.cliente_id')::uuid, 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 5150.0, 5150.0, 0.0, '2026-05-26', '2026-05-26', '97f12885-87ad-426a-8bbb-656889d82e10');
UPDATE aparelhos SET venda_id = '9831ba4e-6f49-45f3-a6de-84a09dde64af' WHERE id = '12990f60-c0bd-4061-b0c5-98bc58e2d008';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('050bbccd-bdf8-46fe-918d-c64f9af53549', '9831ba4e-6f49-45f3-a6de-84a09dde64af', 'pix', 5150.0, '2026-05-26', '97f12885-87ad-426a-8bbb-656889d82e10', 1, '2026-05-26T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('a665e343-da9b-4c82-906a-d6f3a988629c', 19, '9831ba4e-6f49-45f3-a6de-84a09dde64af', 'Brinde', 25.0, '2026-05-26', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-26');

-- LINHA 299 [NAO]: IPHONE 17 PRO MAX SILVER 256GB NOVO (27/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('3010c3e3-7489-4dc3-9046-4f02f6d42f3a', 'Apple', 'IPHONE 17 PRO MAX SILVER 256GB NOVO', 'CYFWFHQWXC', 7999.99, 1800.0, 4, 'novo', 'perfeito', 'vendido', '2026-05-27', '2026-05-27', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-27', '2026-05-27', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('3f6008a8-f966-4342-8770-e6b5d55a3ec6', current_setting('importacao.proximo_numero')::int + 296, current_setting('importacao.cliente_id')::uuid, 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 7999.99, 7999.99, 0.0, '2026-05-27', '2026-05-27', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
UPDATE aparelhos SET venda_id = '3f6008a8-f966-4342-8770-e6b5d55a3ec6' WHERE id = '3010c3e3-7489-4dc3-9046-4f02f6d42f3a';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('fdf29eb8-833c-4ca7-aebe-4817968b3dba', '3f6008a8-f966-4342-8770-e6b5d55a3ec6', 'pix', 7999.99, '2026-05-27', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1, '2026-05-27T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('89e5cc80-f454-462e-805b-60b35bcd1c0f', 4, '3f6008a8-f966-4342-8770-e6b5d55a3ec6', 'Brinde', 15.0, '2026-05-27', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-27');

-- LINHA 300 [NAO]: REDMI NOTE 15 PRO PLUS 5G PRETO NOVO (27/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('6b7fd110-506d-4f9f-99da-ac54134116bd', 'Xiaomi', 'REDMI NOTE 15 PRO PLUS 5G PRETO NOVO', '8638440867199603', 1990.0, 1880.0, 4, 'novo', 'perfeito', 'vendido', '2026-05-27', '2026-05-27', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-27', '2026-05-27', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('9a6809c5-7049-4d63-9d67-a80e4642c4b9', current_setting('importacao.proximo_numero')::int + 297, current_setting('importacao.cliente_id')::uuid, 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 1990.0, 1990.0, 0.0, '2026-05-27', '2026-05-27', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
UPDATE aparelhos SET venda_id = '9a6809c5-7049-4d63-9d67-a80e4642c4b9' WHERE id = '6b7fd110-506d-4f9f-99da-ac54134116bd';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('9b97de7d-c130-4379-a772-a1bad553258f', '9a6809c5-7049-4d63-9d67-a80e4642c4b9', 'pix', 1990.0, '2026-05-27', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1, '2026-05-27T14:00:00');

-- LINHA 301 [NAO]: IPHONE 13 128GB AZUL SEMINOVO (27/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('e4cd5884-3fce-4298-9d70-24fc1be8b929', 'Apple', 'IPHONE 13 128GB AZUL SEMINOVO', '352586507807406', 2093.0, 1780.0, 4, 'seminovo', 'bom', 'vendido', '2026-05-27', '2026-05-27', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-27', '2026-05-27', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('20de6f1e-1c6e-4167-ad58-33fad72e1c6b', current_setting('importacao.proximo_numero')::int + 298, current_setting('importacao.cliente_id')::uuid, 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 2093.0, 2093.0, 0.0, '2026-05-27', '2026-05-27', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
UPDATE aparelhos SET venda_id = '20de6f1e-1c6e-4167-ad58-33fad72e1c6b' WHERE id = 'e4cd5884-3fce-4298-9d70-24fc1be8b929';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('4e93a4b1-727f-4505-8474-f0997b9e4997', '20de6f1e-1c6e-4167-ad58-33fad72e1c6b', 'cartao_credito', 2093.0, '2026-05-27', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1, '2026-05-27T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('3cb1a566-c75f-48ab-89c9-65d90209ece5', 4, '20de6f1e-1c6e-4167-ad58-33fad72e1c6b', 'Brinde', 25.0, '2026-05-27', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-27');

-- LINHA 302 [NAO]: IPHONE 15 PRO MAX 256GB AZUL SEMINOVO (27/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('cd2583d7-9316-431d-87f2-eb2a7c03671b', 'Apple', 'IPHONE 15 PRO MAX 256GB AZUL SEMINOVO', '354679846995259', 3950.0, 3700.0, 20, 'seminovo', 'bom', 'vendido', '2026-05-27', '2026-05-27', '25e2da5b-9e76-4388-9890-7e22efd6940d', '2026-05-27', '2026-05-27', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('72d7a61e-e4fa-4cb5-9280-e4fca6621803', current_setting('importacao.proximo_numero')::int + 299, current_setting('importacao.cliente_id')::uuid, 20, '25e2da5b-9e76-4388-9890-7e22efd6940d', 'concluida', 'normal', 3950.0, 3950.0, 0.0, '2026-05-27', '2026-05-27', '25e2da5b-9e76-4388-9890-7e22efd6940d');
UPDATE aparelhos SET venda_id = '72d7a61e-e4fa-4cb5-9280-e4fca6621803' WHERE id = 'cd2583d7-9316-431d-87f2-eb2a7c03671b';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('622d2108-fe35-4f1a-93b6-c5a47b685609', '72d7a61e-e4fa-4cb5-9280-e4fca6621803', 'pix', 3950.0, '2026-05-27', '25e2da5b-9e76-4388-9890-7e22efd6940d', 1, '2026-05-27T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('13a5d72b-ce5f-4250-a27d-7f41c06c46dd', 20, '72d7a61e-e4fa-4cb5-9280-e4fca6621803', 'Brinde', 25.0, '2026-05-27', '25e2da5b-9e76-4388-9890-7e22efd6940d', '2026-05-27');

-- LINHA 303 [NAO]: IPHONE 12 64GB BRANCO SEMINOVO (27/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('d6a53348-9f7f-47e8-b69b-e09a153e6f15', 'Apple', 'IPHONE 12 64GB BRANCO SEMINOVO', '359827481625484', 1395.0, 1150.0, 1, 'seminovo', 'bom', 'vendido', '2026-05-27', '2026-05-27', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-27', '2026-05-27', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('e8d9ce5c-74dc-44c1-8a5d-bdd7a03a5ef0', current_setting('importacao.proximo_numero')::int + 300, current_setting('importacao.cliente_id')::uuid, 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 1395.0, 1395.0, 0.0, '2026-05-27', '2026-05-27', '85e3aa42-b9af-49b8-a72a-64e9c337aa53');
UPDATE aparelhos SET venda_id = 'e8d9ce5c-74dc-44c1-8a5d-bdd7a03a5ef0' WHERE id = 'd6a53348-9f7f-47e8-b69b-e09a153e6f15';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('e47b9daf-c79f-46d8-a933-6314700983d3', 'e8d9ce5c-74dc-44c1-8a5d-bdd7a03a5ef0', 'pix', 1395.0, '2026-05-27', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 1, '2026-05-27T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('dc2deaf2-9167-479f-831e-dc39c535ad9c', 1, 'e8d9ce5c-74dc-44c1-8a5d-bdd7a03a5ef0', 'Brinde', 25.0, '2026-05-27', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-27');

-- LINHA 304 [NAO]: POCO C85 PRETO 256GB NOVO (27/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('45274623-f08a-4529-9181-2b8837052bfb', 'Outros', 'POCO C85 PRETO 256GB NOVO', '864280089992609', 1445.0, 860.0, 1, 'novo', 'perfeito', 'vendido', '2026-05-27', '2026-05-27', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-27', '2026-05-27', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('c65ac5ab-e4cd-47c2-9941-e1b2064e7fa3', current_setting('importacao.proximo_numero')::int + 301, current_setting('importacao.cliente_id')::uuid, 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 1445.0, 1445.0, 0.0, '2026-05-27', '2026-05-27', '85e3aa42-b9af-49b8-a72a-64e9c337aa53');
UPDATE aparelhos SET venda_id = 'c65ac5ab-e4cd-47c2-9941-e1b2064e7fa3' WHERE id = '45274623-f08a-4529-9181-2b8837052bfb';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('fe2bffc6-32ea-4dd5-9097-32596fe3bee7', 'c65ac5ab-e4cd-47c2-9941-e1b2064e7fa3', 'pix', 1445.0, '2026-05-27', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 1, '2026-05-27T14:00:00');

-- LINHA 305 [NAO]: IPHONE 17 PRO 256GB AZUL SEMINOVO (27/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('fc9d0430-9633-4100-af7d-7e3090fda7a3', 'Apple', 'IPHONE 17 PRO 256GB AZUL SEMINOVO', '354956977489959', 6500.0, 6230.0, 19, 'seminovo', 'bom', 'vendido', '2026-05-27', '2026-05-27', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-27', '2026-05-27', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('72e70bfa-d8ea-48c0-b57c-82870371f2cc', current_setting('importacao.proximo_numero')::int + 302, current_setting('importacao.cliente_id')::uuid, 19, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 6500.0, 6500.0, 0.0, '2026-05-27', '2026-05-27', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
UPDATE aparelhos SET venda_id = '72e70bfa-d8ea-48c0-b57c-82870371f2cc' WHERE id = 'fc9d0430-9633-4100-af7d-7e3090fda7a3';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('1521e5cc-9b9a-4cba-82b6-b14e1bf1f4ef', '72e70bfa-d8ea-48c0-b57c-82870371f2cc', 'pix', 4500.0, '2026-05-27', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1, '2026-05-27T14:00:00');
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, observacao, parcelas, criado_em)
VALUES ('3a570339-f6d9-4b71-a196-b5f0452e5ef2', '72e70bfa-d8ea-48c0-b57c-82870371f2cc', 'troca_aparelho', 2000.0, '2026-05-27', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'Troca: IPH 14 256GB', 1, '2026-05-27T14:00:00');

-- LINHA 306 [SIM]: IPHONE 16 PRO MAX 256GB DOURADO SEMINOVO (27/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('bd3fa5e8-582c-46ee-b7a3-abbf101267db', 'Apple', 'IPHONE 16 PRO MAX 256GB DOURADO SEMINOVO', '357205989970540', 5250.0, 4850.0, 1, 'seminovo', 'bom', 'vendido', '2026-05-27', '2026-05-27', '9451cd9f-6770-4e32-aae8-c75fa675e818', '2026-05-27', '2026-05-27', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('3de95b1d-c4bb-4114-ba9c-69e96b6f1d95', current_setting('importacao.proximo_numero')::int + 303, current_setting('importacao.cliente_id')::uuid, 1, '9451cd9f-6770-4e32-aae8-c75fa675e818', 'concluida', 'normal', 5250.0, 5250.0, 0.0, '2026-05-27', '2026-05-27', '9451cd9f-6770-4e32-aae8-c75fa675e818');
UPDATE aparelhos SET venda_id = '3de95b1d-c4bb-4114-ba9c-69e96b6f1d95' WHERE id = 'bd3fa5e8-582c-46ee-b7a3-abbf101267db';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('85bc284d-6e85-4466-9d73-ddd3fb76093b', '3de95b1d-c4bb-4114-ba9c-69e96b6f1d95', 'pix', 5250.0, '2026-05-27', '9451cd9f-6770-4e32-aae8-c75fa675e818', 1, '2026-05-27T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('ec690181-fbb6-4a1f-b8a4-20e1084436b6', 1, '3de95b1d-c4bb-4114-ba9c-69e96b6f1d95', 'Brinde', 25.0, '2026-05-27', '9451cd9f-6770-4e32-aae8-c75fa675e818', '2026-05-27');

-- LINHA 307 [NAO]: IPHONE 16 PRETO 128GB SEMINOVO (27/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('f2133757-214a-4633-b71b-a43f6bb53a76', 'Apple', 'IPHONE 16 PRETO 128GB SEMINOVO', '358964582664046', 3400.0, 3050.0, 19, 'seminovo', 'bom', 'vendido', '2026-05-27', '2026-05-27', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-27', '2026-05-27', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('61e841d8-6797-4321-8049-958a1b34ac6e', current_setting('importacao.proximo_numero')::int + 304, current_setting('importacao.cliente_id')::uuid, 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 3400.0, 3400.0, 0.0, '2026-05-27', '2026-05-27', '97f12885-87ad-426a-8bbb-656889d82e10');
UPDATE aparelhos SET venda_id = '61e841d8-6797-4321-8049-958a1b34ac6e' WHERE id = 'f2133757-214a-4633-b71b-a43f6bb53a76';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('6d62a309-856d-4a78-bc18-b0b1b2d9ca66', '61e841d8-6797-4321-8049-958a1b34ac6e', 'pix', 3400.0, '2026-05-27', '97f12885-87ad-426a-8bbb-656889d82e10', 1, '2026-05-27T14:00:00');

-- LINHA 308 [NAO]: IPHONE 17 PRO 256GB BRANCO SEMINOVO (27/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('76688491-0593-43d1-ba70-f738210b0874', 'Apple', 'IPHONE 17 PRO 256GB BRANCO SEMINOVO', '350455774133336', 6300.0, 6100.0, 1, 'seminovo', 'bom', 'vendido', '2026-05-27', '2026-05-27', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-27', '2026-05-27', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('39a17e1c-8380-41b4-a56a-631cfd239f57', current_setting('importacao.proximo_numero')::int + 305, current_setting('importacao.cliente_id')::uuid, 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 6300.0, 6300.0, 0.0, '2026-05-27', '2026-05-27', '85e3aa42-b9af-49b8-a72a-64e9c337aa53');
UPDATE aparelhos SET venda_id = '39a17e1c-8380-41b4-a56a-631cfd239f57' WHERE id = '76688491-0593-43d1-ba70-f738210b0874';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('c260ecaa-c49a-4148-8d5b-52fb682ded9e', '39a17e1c-8380-41b4-a56a-631cfd239f57', 'pix', 6300.0, '2026-05-27', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 1, '2026-05-27T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('726f91f9-6874-4e68-9ecb-dbf5a780e0b3', 1, '39a17e1c-8380-41b4-a56a-631cfd239f57', 'Brinde', 10.0, '2026-05-27', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-27');

-- LINHA 309 [SIM]: IPHONE 14 128GB PRETO SEMINOVO (28/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('f1a6d818-6594-4c50-bd44-63b7701ba904', 'Apple', 'IPHONE 14 128GB PRETO SEMINOVO', '352051682197220', 2200.0, 1900.0, 4, 'seminovo', 'bom', 'vendido', '2026-05-28', '2026-05-28', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-28', '2026-05-28', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('70eddfc9-100a-4d20-abb2-121a642783d5', current_setting('importacao.proximo_numero')::int + 306, current_setting('importacao.cliente_id')::uuid, 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 2200.0, 2200.0, 0.0, '2026-05-28', '2026-05-28', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
UPDATE aparelhos SET venda_id = '70eddfc9-100a-4d20-abb2-121a642783d5' WHERE id = 'f1a6d818-6594-4c50-bd44-63b7701ba904';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('58ebafcc-a188-4a1d-8904-f0eb562c032d', '70eddfc9-100a-4d20-abb2-121a642783d5', 'pix', 2200.0, '2026-05-28', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1, '2026-05-28T14:00:00');

-- LINHA 310 [NAO]: IPHONE 17 PRO 256GB BRANCO SEMINOVO (28/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('14c63280-03dd-466e-b512-90fff31d8d7e', 'Apple', 'IPHONE 17 PRO 256GB BRANCO SEMINOVO', '354996269680378', 6600.0, 6100.0, 4, 'seminovo', 'bom', 'vendido', '2026-05-28', '2026-05-28', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-28', '2026-05-28', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('8ca32ac1-fec1-4edc-a6b3-8c1d0a5ed188', current_setting('importacao.proximo_numero')::int + 307, current_setting('importacao.cliente_id')::uuid, 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 6600.0, 6600.0, 0.0, '2026-05-28', '2026-05-28', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
UPDATE aparelhos SET venda_id = '8ca32ac1-fec1-4edc-a6b3-8c1d0a5ed188' WHERE id = '14c63280-03dd-466e-b512-90fff31d8d7e';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('7498a7f4-3fb1-4a7e-a368-18dc45487e32', '8ca32ac1-fec1-4edc-a6b3-8c1d0a5ed188', 'pix', 6600.0, '2026-05-28', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1, '2026-05-28T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('32f5befd-a879-4520-9a6e-20075399c674', 4, '8ca32ac1-fec1-4edc-a6b3-8c1d0a5ed188', 'Brinde', 95.0, '2026-05-28', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-28');

-- LINHA 311 [NAO]: IPHONE 17 PRO 256GB BRANCO SEMINOVO (28/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('0820bcd6-37e8-4a96-848e-b9b7e08ea773', 'Apple', 'IPHONE 17 PRO 256GB BRANCO SEMINOVO', '352294449113888', 6650.0, 6100.0, 4, 'seminovo', 'bom', 'vendido', '2026-05-28', '2026-05-28', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-28', '2026-05-28', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('47c043bc-b0d0-472c-9bdd-61ef0891d9e8', current_setting('importacao.proximo_numero')::int + 308, current_setting('importacao.cliente_id')::uuid, 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 6650.0, 6650.0, 0.0, '2026-05-28', '2026-05-28', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
UPDATE aparelhos SET venda_id = '47c043bc-b0d0-472c-9bdd-61ef0891d9e8' WHERE id = '0820bcd6-37e8-4a96-848e-b9b7e08ea773';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('bcec91b7-093e-4e31-b38b-721411486613', '47c043bc-b0d0-472c-9bdd-61ef0891d9e8', 'pix', 2000.0, '2026-05-28', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1, '2026-05-28T14:00:00');
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('94d28d33-33cf-4d5f-91b3-379dd7809db7', '47c043bc-b0d0-472c-9bdd-61ef0891d9e8', 'cartao_credito', 4650.0, '2026-05-28', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1, '2026-05-28T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('c06802f3-b6ce-4587-9260-1cab40654fa3', 4, '47c043bc-b0d0-472c-9bdd-61ef0891d9e8', 'Brinde', 40.0, '2026-05-28', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-28');

-- LINHA 312 [NAO]: IPHONE 12 PRO MAX 256GB GRAFITE SEMINOVO (28/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('7ed072bb-494c-4e1e-bc50-a6481071de9d', 'Apple', 'IPHONE 12 PRO MAX 256GB GRAFITE SEMINOVO', '353167663221083', 2576.0, 2300.0, 4, 'seminovo', 'bom', 'vendido', '2026-05-28', '2026-05-28', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-28', '2026-05-28', 'Pagto junto (Aparelho 1/2, total grupo R$ 5,152)');
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('b2d59ad1-e4e9-4b2f-bc84-81b0cc9c70ee', current_setting('importacao.proximo_numero')::int + 309, current_setting('importacao.cliente_id')::uuid, 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 2576.0, 2576.0, 0.0, '2026-05-28', '2026-05-28', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
UPDATE aparelhos SET venda_id = 'b2d59ad1-e4e9-4b2f-bc84-81b0cc9c70ee' WHERE id = '7ed072bb-494c-4e1e-bc50-a6481071de9d';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('c72e6f87-520a-4de0-bfa7-794ca051a556', 'b2d59ad1-e4e9-4b2f-bc84-81b0cc9c70ee', 'pix', 2576.0, '2026-05-28', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1, '2026-05-28T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('6aa10625-61d2-417f-8ee2-1dccf075d928', 4, 'b2d59ad1-e4e9-4b2f-bc84-81b0cc9c70ee', 'Brinde', 25.0, '2026-05-28', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-28');

-- LINHA 313 [NAO]: IPHONE 12 PRO MAX 256GB GRAFITE SEMINOVO (28/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('7f3a93b3-2c53-4810-9028-38efd8f2aeb3', 'Apple', 'IPHONE 12 PRO MAX 256GB GRAFITE SEMINOVO', '357061220988803', 2576.0, 2300.0, 4, 'seminovo', 'bom', 'vendido', '2026-05-28', '2026-05-28', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-28', '2026-05-28', 'Pagto junto (Aparelho 2/2, total grupo R$ 5,152)');
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('ddd24bed-2440-439f-a707-3d400d1cc56c', current_setting('importacao.proximo_numero')::int + 310, current_setting('importacao.cliente_id')::uuid, 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 2576.0, 2576.0, 0.0, '2026-05-28', '2026-05-28', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
UPDATE aparelhos SET venda_id = 'ddd24bed-2440-439f-a707-3d400d1cc56c' WHERE id = '7f3a93b3-2c53-4810-9028-38efd8f2aeb3';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('897f64d1-57af-4a74-97ed-55f5730fb3f2', 'ddd24bed-2440-439f-a707-3d400d1cc56c', 'pix', 2576.0, '2026-05-28', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1, '2026-05-28T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('f490a768-cf2d-4184-9b5e-ace5529a50f6', 4, 'ddd24bed-2440-439f-a707-3d400d1cc56c', 'Brinde', 65.0, '2026-05-28', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-28');

-- LINHA 314 [NAO]: IPHONE 16 PRO MAX 256GB DESERT SEMINOVO (28/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('2f096322-1c39-4dbd-ad13-85a4c03ccf94', 'Apple', 'IPHONE 16 PRO MAX 256GB DESERT SEMINOVO', '353484626443138', 5446.0, 5000.0, 1, 'seminovo', 'bom', 'vendido', '2026-05-28', '2026-05-28', '1d12d555-68e9-45f8-bfc0-a35a1d8d7920', '2026-05-28', '2026-05-28', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('f0afdb35-4b80-474f-9641-6b1565e86304', current_setting('importacao.proximo_numero')::int + 311, current_setting('importacao.cliente_id')::uuid, 1, '1d12d555-68e9-45f8-bfc0-a35a1d8d7920', 'concluida', 'normal', 5446.0, 5446.0, 0.0, '2026-05-28', '2026-05-28', '1d12d555-68e9-45f8-bfc0-a35a1d8d7920');
UPDATE aparelhos SET venda_id = 'f0afdb35-4b80-474f-9641-6b1565e86304' WHERE id = '2f096322-1c39-4dbd-ad13-85a4c03ccf94';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('a7f2ac42-58b2-42f2-81b7-219dfb2ddaca', 'f0afdb35-4b80-474f-9641-6b1565e86304', 'pix', 5446.0, '2026-05-28', '1d12d555-68e9-45f8-bfc0-a35a1d8d7920', 1, '2026-05-28T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('68c4096c-c208-46e5-93bd-b420a9255a0b', 1, 'f0afdb35-4b80-474f-9641-6b1565e86304', 'Brinde', 25.0, '2026-05-28', '1d12d555-68e9-45f8-bfc0-a35a1d8d7920', '2026-05-28');

-- LINHA 315 [NAO]: IPHONE 11 128GB BRANCO SEMINOVO (28/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('cf45d0e7-0613-401d-9e76-3a8f40101425', 'Apple', 'IPHONE 11 128GB BRANCO SEMINOVO', '356581108114007', 1161.0, 700.0, 4, 'seminovo', 'bom', 'vendido', '2026-05-28', '2026-05-28', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-28', '2026-05-28', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('fc8b7b03-8941-4ed6-8bdb-18a09bf32397', current_setting('importacao.proximo_numero')::int + 312, current_setting('importacao.cliente_id')::uuid, 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 1161.0, 1161.0, 0.0, '2026-05-28', '2026-05-28', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
UPDATE aparelhos SET venda_id = 'fc8b7b03-8941-4ed6-8bdb-18a09bf32397' WHERE id = 'cf45d0e7-0613-401d-9e76-3a8f40101425';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('d7763ea5-24d7-498c-b178-b37b88751783', 'fc8b7b03-8941-4ed6-8bdb-18a09bf32397', 'cartao_credito', 1161.0, '2026-05-28', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1, '2026-05-28T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('73d59a0a-2eda-402b-8174-c4b6bff9e2ca', 4, 'fc8b7b03-8941-4ed6-8bdb-18a09bf32397', 'Brinde', 115.0, '2026-05-28', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-28');

-- LINHA 316 [SIM]: IPHONE 16 PRO MAX 1TB PRETO SEMINOVO (28/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('124c5342-0df3-4259-bf50-6ac724d07c10', 'Apple', 'IPHONE 16 PRO MAX 1TB PRETO SEMINOVO', '355067542337324', 5930.0, 5300.0, 19, 'seminovo', 'bom', 'vendido', '2026-05-28', '2026-05-28', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-28', '2026-05-28', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('4436f666-e82b-46a9-b8ff-c9f4c382382f', current_setting('importacao.proximo_numero')::int + 313, current_setting('importacao.cliente_id')::uuid, 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 5930.0, 5930.0, 0.0, '2026-05-28', '2026-05-28', '97f12885-87ad-426a-8bbb-656889d82e10');
UPDATE aparelhos SET venda_id = '4436f666-e82b-46a9-b8ff-c9f4c382382f' WHERE id = '124c5342-0df3-4259-bf50-6ac724d07c10';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('89753957-3d8b-493f-a3d2-40a0df41c3df', '4436f666-e82b-46a9-b8ff-c9f4c382382f', 'pix', 5930.0, '2026-05-28', '97f12885-87ad-426a-8bbb-656889d82e10', 1, '2026-05-28T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('4b18ee86-ebed-4e8b-978a-fee8b74bc75b', 19, '4436f666-e82b-46a9-b8ff-c9f4c382382f', 'Brinde', 25.0, '2026-05-28', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-28');

-- LINHA 317 [NAO]: IPHONE 16 PRO MAX 256GB PRETO SEMINOVO (28/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('e240d4f3-c131-41dc-851f-cfe053300bb1', 'Apple', 'IPHONE 16 PRO MAX 256GB PRETO SEMINOVO', '354276355714955', 5300.0, 4850.0, 20, 'seminovo', 'bom', 'vendido', '2026-05-28', '2026-05-28', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', '2026-05-28', '2026-05-28', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('e82576a8-c94b-46e7-82ad-9eb3396c2e77', current_setting('importacao.proximo_numero')::int + 314, current_setting('importacao.cliente_id')::uuid, 20, 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 'concluida', 'normal', 5300.0, 5300.0, 0.0, '2026-05-28', '2026-05-28', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4');
UPDATE aparelhos SET venda_id = 'e82576a8-c94b-46e7-82ad-9eb3396c2e77' WHERE id = 'e240d4f3-c131-41dc-851f-cfe053300bb1';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('e2b8bbd8-3db6-4638-a639-ac3417b4b8f1', 'e82576a8-c94b-46e7-82ad-9eb3396c2e77', 'cartao_credito', 5300.0, '2026-05-28', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 1, '2026-05-28T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('9947fdf0-7985-4552-9c56-b694e95a689c', 20, 'e82576a8-c94b-46e7-82ad-9eb3396c2e77', 'Brinde', 10.0, '2026-05-28', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', '2026-05-28');

-- LINHA 318 [NAO]: IPHONE 17 PRO 256GB BRANCO SEMINOVO (28/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('a658ae87-1dcd-4cdd-812f-2a4487c15bf8', 'Apple', 'IPHONE 17 PRO 256GB BRANCO SEMINOVO', '355500350320222', 6821.0, 6100.0, 20, 'seminovo', 'bom', 'vendido', '2026-05-28', '2026-05-28', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', '2026-05-28', '2026-05-28', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('051dea92-923c-4ded-8f1f-6ec68ba6caf6', current_setting('importacao.proximo_numero')::int + 315, current_setting('importacao.cliente_id')::uuid, 20, 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 'concluida', 'normal', 6821.0, 6821.0, 0.0, '2026-05-28', '2026-05-28', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4');
UPDATE aparelhos SET venda_id = '051dea92-923c-4ded-8f1f-6ec68ba6caf6' WHERE id = 'a658ae87-1dcd-4cdd-812f-2a4487c15bf8';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('8d0b11ea-430c-4991-8ecb-962a04e5b6b8', '051dea92-923c-4ded-8f1f-6ec68ba6caf6', 'cartao_credito', 6821.0, '2026-05-28', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 1, '2026-05-28T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('4cea8a7a-73d9-4a2d-8bfb-ee8b435216ba', 20, '051dea92-923c-4ded-8f1f-6ec68ba6caf6', 'Brinde', 5.0, '2026-05-28', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', '2026-05-28');

-- LINHA 319 [NAO]: IPHONE 17 PRO MAX BRANCO NOVO 256GB (28/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('4c624359-f67c-4c7b-a1ee-7edeb00636b3', 'Apple', 'IPHONE 17 PRO MAX BRANCO NOVO 256GB', '359652121886894', 8300.0, 7750.0, 1, 'novo', 'perfeito', 'vendido', '2026-05-28', '2026-05-28', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-28', '2026-05-28', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('673e6c06-2fa6-4cff-9eec-89c6836400ee', current_setting('importacao.proximo_numero')::int + 316, current_setting('importacao.cliente_id')::uuid, 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 8300.0, 8300.0, 0.0, '2026-05-28', '2026-05-28', '85e3aa42-b9af-49b8-a72a-64e9c337aa53');
UPDATE aparelhos SET venda_id = '673e6c06-2fa6-4cff-9eec-89c6836400ee' WHERE id = '4c624359-f67c-4c7b-a1ee-7edeb00636b3';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('9676e720-a0bc-42a9-8487-8c194bbacaa4', '673e6c06-2fa6-4cff-9eec-89c6836400ee', 'pix', 3450.0, '2026-05-28', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 1, '2026-05-28T14:00:00');
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, observacao, parcelas, criado_em)
VALUES ('60b27e4a-d4a5-4826-959f-0c14263640e4', '673e6c06-2fa6-4cff-9eec-89c6836400ee', 'troca_aparelho', 4850.0, '2026-05-28', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'Troca: IPH 16 PRO MAX', 1, '2026-05-28T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('b96529f3-9d71-4e52-9673-52ba7417f3af', 1, '673e6c06-2fa6-4cff-9eec-89c6836400ee', 'Brinde', 10.0, '2026-05-28', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-28');

-- LINHA 320 [NAO]: IPHONE 16 PRO MAX 512GB PRETO SEMINOVO (28/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('5715d030-276c-4f23-af35-788df3779ed9', 'Apple', 'IPHONE 16 PRO MAX 512GB PRETO SEMINOVO', '354331121466651', 5650.0, 5150.0, 20, 'seminovo', 'bom', 'vendido', '2026-05-28', '2026-05-28', '25e2da5b-9e76-4388-9890-7e22efd6940d', '2026-05-28', '2026-05-28', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('207eedb4-c74c-4c65-b156-ad40bd5f2372', current_setting('importacao.proximo_numero')::int + 317, current_setting('importacao.cliente_id')::uuid, 20, '25e2da5b-9e76-4388-9890-7e22efd6940d', 'concluida', 'normal', 5650.0, 5650.0, 0.0, '2026-05-28', '2026-05-28', '25e2da5b-9e76-4388-9890-7e22efd6940d');
UPDATE aparelhos SET venda_id = '207eedb4-c74c-4c65-b156-ad40bd5f2372' WHERE id = '5715d030-276c-4f23-af35-788df3779ed9';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('60b6bd32-48b0-4bb0-8b5d-e83ec05b7ad9', '207eedb4-c74c-4c65-b156-ad40bd5f2372', 'cartao_credito', 3550.0, '2026-05-28', '25e2da5b-9e76-4388-9890-7e22efd6940d', 1, '2026-05-28T14:00:00');
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, observacao, parcelas, criado_em)
VALUES ('e642383d-7719-4760-815c-1011c5cdf0c1', '207eedb4-c74c-4c65-b156-ad40bd5f2372', 'troca_aparelho', 2100.0, '2026-05-28', '25e2da5b-9e76-4388-9890-7e22efd6940d', 'Troca: IPHONE 16E 128 GB BRANCO A', 1, '2026-05-28T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('fa4f7593-4308-4d91-bb0a-1a826056f83c', 20, '207eedb4-c74c-4c65-b156-ad40bd5f2372', 'Brinde', 50.0, '2026-05-28', '25e2da5b-9e76-4388-9890-7e22efd6940d', '2026-05-28');

-- LINHA 321 [NAO]: IPHONE 14 128GB AZUL SEMINOVO (29/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('f510e56c-9518-4e5e-93ba-62e43a0f0e00', 'Apple', 'IPHONE 14 128GB AZUL SEMINOVO', '359388532621543', 2150.0, 1900.0, 4, 'seminovo', 'bom', 'vendido', '2026-05-29', '2026-05-29', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-29', '2026-05-29', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('1591d4a6-9955-41c7-b93a-edb5611e0e4d', current_setting('importacao.proximo_numero')::int + 318, current_setting('importacao.cliente_id')::uuid, 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 2150.0, 2150.0, 0.0, '2026-05-29', '2026-05-29', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
UPDATE aparelhos SET venda_id = '1591d4a6-9955-41c7-b93a-edb5611e0e4d' WHERE id = 'f510e56c-9518-4e5e-93ba-62e43a0f0e00';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('18a5ef67-fc8f-49f1-88f6-8d1ca86a8c00', '1591d4a6-9955-41c7-b93a-edb5611e0e4d', 'cartao_credito', 2150.0, '2026-05-29', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1, '2026-05-29T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('11e6a494-d004-4477-bba1-30b7f0b1fe0c', 4, '1591d4a6-9955-41c7-b93a-edb5611e0e4d', 'Brinde', 25.0, '2026-05-29', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-29');

-- LINHA 322 [NAO]: REDMI NOTE 15 PRO 4G 256GB PRETO NOVO (29/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('defd5507-db0c-43f3-98a5-33d5b1151e6a', 'Xiaomi', 'REDMI NOTE 15 PRO 4G 256GB PRETO NOVO', '863911086287848', 1627.0, 1430.0, 4, 'novo', 'perfeito', 'vendido', '2026-05-29', '2026-05-29', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-29', '2026-05-29', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('d2c7171c-884c-4a11-a569-fbec05ba9611', current_setting('importacao.proximo_numero')::int + 319, current_setting('importacao.cliente_id')::uuid, 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 1627.0, 1627.0, 0.0, '2026-05-29', '2026-05-29', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
UPDATE aparelhos SET venda_id = 'd2c7171c-884c-4a11-a569-fbec05ba9611' WHERE id = 'defd5507-db0c-43f3-98a5-33d5b1151e6a';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('a20d1a76-96e8-4862-ab2b-8aa19b6ca78c', 'd2c7171c-884c-4a11-a569-fbec05ba9611', 'pix', 530.0, '2026-05-29', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1, '2026-05-29T14:00:00');
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('af8f906e-f5d2-42b5-92a2-2834e7c96279', 'd2c7171c-884c-4a11-a569-fbec05ba9611', 'cartao_credito', 1097.0, '2026-05-29', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1, '2026-05-29T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('9c961ceb-7545-4e68-9a81-db134478a1ec', 4, 'd2c7171c-884c-4a11-a569-fbec05ba9611', 'Brinde', 50.0, '2026-05-29', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-29');

-- LINHA 323 [NAO]: REDMI NOTE 15 PRO 5G 256GB PRETO NOVO (29/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('099da641-1694-416f-b716-cf200f655ac9', 'Xiaomi', 'REDMI NOTE 15 PRO 5G 256GB PRETO NOVO', '865293081783289', 1852.0, 1680.0, 4, 'novo', 'perfeito', 'vendido', '2026-05-29', '2026-05-29', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-29', '2026-05-29', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('e9f5aefc-0e52-451f-b135-6330d05f7d1f', current_setting('importacao.proximo_numero')::int + 320, current_setting('importacao.cliente_id')::uuid, 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 1852.0, 1852.0, 0.0, '2026-05-29', '2026-05-29', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
UPDATE aparelhos SET venda_id = 'e9f5aefc-0e52-451f-b135-6330d05f7d1f' WHERE id = '099da641-1694-416f-b716-cf200f655ac9';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('71e1246f-4dfb-412c-b60c-0994d66221b6', 'e9f5aefc-0e52-451f-b135-6330d05f7d1f', 'pix', 900.0, '2026-05-29', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1, '2026-05-29T14:00:00');
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('eafabbf0-ac38-419e-a613-694e931f800f', 'e9f5aefc-0e52-451f-b135-6330d05f7d1f', 'cartao_credito', 952.0, '2026-05-29', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1, '2026-05-29T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('8fa3f70d-dc40-4d83-acb6-75a6f00a8758', 4, 'e9f5aefc-0e52-451f-b135-6330d05f7d1f', 'Brinde', 50.0, '2026-05-29', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-29');

-- LINHA 324 [NAO]: IPHONE 13 128GB BRANCO SEMINOVO (29/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('e01582e7-b052-441b-a7e5-1cf71c015ddd', 'Apple', 'IPHONE 13 128GB BRANCO SEMINOVO', '350689751889144', 1850.0, 1750.0, 19, 'seminovo', 'bom', 'vendido', '2026-05-29', '2026-05-29', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-29', '2026-05-29', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('3dce11eb-5cc5-47ce-83bd-c5a36b60747c', current_setting('importacao.proximo_numero')::int + 321, current_setting('importacao.cliente_id')::uuid, 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 1850.0, 1850.0, 0.0, '2026-05-29', '2026-05-29', '97f12885-87ad-426a-8bbb-656889d82e10');
UPDATE aparelhos SET venda_id = '3dce11eb-5cc5-47ce-83bd-c5a36b60747c' WHERE id = 'e01582e7-b052-441b-a7e5-1cf71c015ddd';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('98aef29a-799a-40d3-b9e5-3b9da91d4bf1', '3dce11eb-5cc5-47ce-83bd-c5a36b60747c', 'pix', 1850.0, '2026-05-29', '97f12885-87ad-426a-8bbb-656889d82e10', 1, '2026-05-29T14:00:00');

-- LINHA 325 [NAO]: IPHONE 14 PRO MAX 512GB ROXO SEMINOVO (29/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('ec120fbd-4287-45ea-806e-e173073515cb', 'Apple', 'IPHONE 14 PRO MAX 512GB ROXO SEMINOVO', '353360948256186', 3800.0, 2500.0, 19, 'seminovo', 'bom', 'vendido', '2026-05-29', '2026-05-29', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-29', '2026-05-29', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('2c06c043-23e3-497f-ae1d-a47058f4ea33', current_setting('importacao.proximo_numero')::int + 322, current_setting('importacao.cliente_id')::uuid, 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 3800.0, 3800.0, 0.0, '2026-05-29', '2026-05-29', '97f12885-87ad-426a-8bbb-656889d82e10');
UPDATE aparelhos SET venda_id = '2c06c043-23e3-497f-ae1d-a47058f4ea33' WHERE id = 'ec120fbd-4287-45ea-806e-e173073515cb';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('ac9bf8cf-17b9-4d51-ac5f-322eab59eb94', '2c06c043-23e3-497f-ae1d-a47058f4ea33', 'pix', 1700.0, '2026-05-29', '97f12885-87ad-426a-8bbb-656889d82e10', 1, '2026-05-29T14:00:00');
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, observacao, parcelas, criado_em)
VALUES ('7b43adc6-27a2-445b-b293-33c77ad970d6', '2c06c043-23e3-497f-ae1d-a47058f4ea33', 'troca_aparelho', 2100.0, '2026-05-29', '97f12885-87ad-426a-8bbb-656889d82e10', 'Troca: IPH 12 PRO 256GB BRANCO', 1, '2026-05-29T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('f2050ee8-d3aa-4f60-9f73-203b36f55b24', 19, '2c06c043-23e3-497f-ae1d-a47058f4ea33', 'Brinde', 25.0, '2026-05-29', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-29');

-- LINHA 326 [NAO]: IPHONE 17 PRO 512GB SILVER NOVO (29/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('993e6f93-7bc6-4b25-946c-2db7be04a170', 'Apple', 'IPHONE 17 PRO 512GB SILVER NOVO', '352001999333984', 8974.0, 8400.0, 19, 'novo', 'perfeito', 'vendido', '2026-05-29', '2026-05-29', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-29', '2026-05-29', 'Pagto junto (Aparelho 1/2, total grupo R$ 11,324)');
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('2ad676e4-b67d-48b3-8922-6fe9eaba402f', current_setting('importacao.proximo_numero')::int + 323, current_setting('importacao.cliente_id')::uuid, 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 8974.0, 8974.0, 0.0, '2026-05-29', '2026-05-29', '97f12885-87ad-426a-8bbb-656889d82e10');
UPDATE aparelhos SET venda_id = '2ad676e4-b67d-48b3-8922-6fe9eaba402f' WHERE id = '993e6f93-7bc6-4b25-946c-2db7be04a170';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('2dff885f-5072-44ab-8d7f-d538ae7bd2fa', '2ad676e4-b67d-48b3-8922-6fe9eaba402f', 'pix', 6174.0, '2026-05-29', '97f12885-87ad-426a-8bbb-656889d82e10', 1, '2026-05-29T14:00:00');
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, observacao, parcelas, criado_em)
VALUES ('55041210-2afb-430a-b6a8-fc3aac76d3fb', '2ad676e4-b67d-48b3-8922-6fe9eaba402f', 'troca_aparelho', 2800.0, '2026-05-29', '97f12885-87ad-426a-8bbb-656889d82e10', 'Troca: IPH 15 PRO 256GB', 1, '2026-05-29T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('6f6331e6-53fe-45ed-9dc8-c0c5b3520e08', 19, '2ad676e4-b67d-48b3-8922-6fe9eaba402f', 'Brinde', 90.0, '2026-05-29', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-29');

-- LINHA 327 [NAO]: IPAD 11 128GB SILVER NOVO (29/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('bac10b28-4399-46c0-9cd6-fa2bed7b731d', 'Apple', 'IPAD 11 128GB SILVER NOVO', 'J97T5Q77HRQ', 2350.0, 2150.0, 19, 'novo', 'perfeito', 'vendido', '2026-05-29', '2026-05-29', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-29', '2026-05-29', 'Pagto junto (Aparelho 2/2, total grupo R$ 11,324)');
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('b61e2dcc-fb36-45ed-b463-851bf01f7193', current_setting('importacao.proximo_numero')::int + 324, current_setting('importacao.cliente_id')::uuid, 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 2350.0, 2350.0, 0.0, '2026-05-29', '2026-05-29', '97f12885-87ad-426a-8bbb-656889d82e10');
UPDATE aparelhos SET venda_id = 'b61e2dcc-fb36-45ed-b463-851bf01f7193' WHERE id = 'bac10b28-4399-46c0-9cd6-fa2bed7b731d';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('d3239cb8-a37f-4f8e-9155-0c92d2be9a34', 'b61e2dcc-fb36-45ed-b463-851bf01f7193', 'pix', 2350.0, '2026-05-29', '97f12885-87ad-426a-8bbb-656889d82e10', 1, '2026-05-29T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('7b813c61-f344-4194-98f8-650dd2ba05ff', 19, 'b61e2dcc-fb36-45ed-b463-851bf01f7193', 'Brinde', 10.0, '2026-05-29', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-29');

-- LINHA 328 [NAO]: IPHONE 17 PRO 512GB SILVER NOVO (29/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('e83a196f-806f-4b13-abb6-2f1c94df8d7c', 'Apple', 'IPHONE 17 PRO 512GB SILVER NOVO', '354289632214376', 8900.0, 8400.0, 19, 'novo', 'perfeito', 'vendido', '2026-05-29', '2026-05-29', 'b4269e60-eea2-4eba-a34d-db9591e0ec83', '2026-05-29', '2026-05-29', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('4a854bc6-d762-42a1-9edc-7633076619c3', current_setting('importacao.proximo_numero')::int + 325, current_setting('importacao.cliente_id')::uuid, 19, 'b4269e60-eea2-4eba-a34d-db9591e0ec83', 'concluida', 'normal', 8900.0, 8900.0, 0.0, '2026-05-29', '2026-05-29', 'b4269e60-eea2-4eba-a34d-db9591e0ec83');
UPDATE aparelhos SET venda_id = '4a854bc6-d762-42a1-9edc-7633076619c3' WHERE id = 'e83a196f-806f-4b13-abb6-2f1c94df8d7c';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, observacao, parcelas, criado_em)
VALUES ('461285d6-c550-4cd4-b159-207b6b5113f9', '4a854bc6-d762-42a1-9edc-7633076619c3', 'troca_aparelho', 8900.0, '2026-05-29', 'b4269e60-eea2-4eba-a34d-db9591e0ec83', 'Troca: 14 PRO 512GB PRETO; 17 PRO SILVER 256GB', 1, '2026-05-29T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('ccf45d59-3955-4528-82ab-1ff03f709a99', 19, '4a854bc6-d762-42a1-9edc-7633076619c3', 'Brinde', 25.0, '2026-05-29', 'b4269e60-eea2-4eba-a34d-db9591e0ec83', '2026-05-29');

-- LINHA 329 [SIM]: IPHONE 16 128GB AZUL SEMINOVO (29/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('0eaa7f39-0104-4042-b8d5-37188772574d', 'Apple', 'IPHONE 16 128GB AZUL SEMINOVO', '351006199740582', 3830.0, 3100.0, 1, 'seminovo', 'bom', 'vendido', '2026-05-29', '2026-05-29', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-29', '2026-05-29', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('d7e18ebf-5dd6-4aa5-9999-de0751cc51de', current_setting('importacao.proximo_numero')::int + 326, current_setting('importacao.cliente_id')::uuid, 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 3830.0, 3830.0, 0.0, '2026-05-29', '2026-05-29', '85e3aa42-b9af-49b8-a72a-64e9c337aa53');
UPDATE aparelhos SET venda_id = 'd7e18ebf-5dd6-4aa5-9999-de0751cc51de' WHERE id = '0eaa7f39-0104-4042-b8d5-37188772574d';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('084fe77e-c87c-4f47-ba7d-086832a590f6', 'd7e18ebf-5dd6-4aa5-9999-de0751cc51de', 'pix', 3830.0, '2026-05-29', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 1, '2026-05-29T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('b2d86756-b598-40bb-95f2-5601cbe6d26d', 1, 'd7e18ebf-5dd6-4aa5-9999-de0751cc51de', 'Brinde', 10.0, '2026-05-29', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-29');

-- LINHA 330 [NAO]: IPHONE 17 PRO 256GB BRANCO SEMINOVO (30/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('3f24800f-4829-48d7-ba00-80598f6c3f15', 'Apple', 'IPHONE 17 PRO 256GB BRANCO SEMINOVO', '7679993104397', 6637.0, 6100.0, 1, 'seminovo', 'bom', 'vendido', '2026-05-30', '2026-05-30', 'e07d4d35-1381-4d4d-914d-8382a7456fdd', '2026-05-30', '2026-05-30', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('7505c8bf-48e8-42aa-8c50-d2e6c95943df', current_setting('importacao.proximo_numero')::int + 327, current_setting('importacao.cliente_id')::uuid, 1, 'e07d4d35-1381-4d4d-914d-8382a7456fdd', 'concluida', 'normal', 6637.0, 6637.0, 0.0, '2026-05-30', '2026-05-30', 'e07d4d35-1381-4d4d-914d-8382a7456fdd');
UPDATE aparelhos SET venda_id = '7505c8bf-48e8-42aa-8c50-d2e6c95943df' WHERE id = '3f24800f-4829-48d7-ba00-80598f6c3f15';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('5673ba81-5f37-4238-8690-8fb9e0a9e2fb', '7505c8bf-48e8-42aa-8c50-d2e6c95943df', 'pix', 1500.0, '2026-05-30', 'e07d4d35-1381-4d4d-914d-8382a7456fdd', 1, '2026-05-30T14:00:00');
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('7a12206a-5cef-4e74-bf3a-f917a3e09b54', '7505c8bf-48e8-42aa-8c50-d2e6c95943df', 'cartao_credito', 2237.0, '2026-05-30', 'e07d4d35-1381-4d4d-914d-8382a7456fdd', 1, '2026-05-30T14:00:00');
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, observacao, parcelas, criado_em)
VALUES ('b2d628a3-27b2-4bb2-9c19-b3191807f5c2', '7505c8bf-48e8-42aa-8c50-d2e6c95943df', 'troca_aparelho', 2900.0, '2026-05-30', 'e07d4d35-1381-4d4d-914d-8382a7456fdd', 'Troca: 15 PRO', 1, '2026-05-30T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('c82e6d83-af51-4c91-bb6d-a61d005a4c97', 1, '7505c8bf-48e8-42aa-8c50-d2e6c95943df', 'Brinde', 210.0, '2026-05-30', 'e07d4d35-1381-4d4d-914d-8382a7456fdd', '2026-05-30');

-- LINHA 331 [NAO]: IPHONE 15 PRO MAX 256GB SEMINOVO (30/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('65a3d25d-3837-4134-8014-6a9c4dee9a30', 'Apple', 'IPHONE 15 PRO MAX 256GB SEMINOVO', '356964465740436', 4000.0, 3700.0, 4, 'seminovo', 'bom', 'vendido', '2026-05-30', '2026-05-30', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-30', '2026-05-30', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('70512c73-338c-44f6-abf3-50abd3a57761', current_setting('importacao.proximo_numero')::int + 328, current_setting('importacao.cliente_id')::uuid, 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 4000.0, 4000.0, 0.0, '2026-05-30', '2026-05-30', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
UPDATE aparelhos SET venda_id = '70512c73-338c-44f6-abf3-50abd3a57761' WHERE id = '65a3d25d-3837-4134-8014-6a9c4dee9a30';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('604c5389-50fb-46c7-9c82-e9a3a10eb3ed', '70512c73-338c-44f6-abf3-50abd3a57761', 'pix', 1300.0, '2026-05-30', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1, '2026-05-30T14:00:00');
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, observacao, parcelas, criado_em)
VALUES ('bb9e2ca4-2229-4ad6-aa13-2ce94a491e1f', '70512c73-338c-44f6-abf3-50abd3a57761', 'troca_aparelho', 2700.0, '2026-05-30', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'Troca: ENTROU UM 14 PRO MAX 128 POR', 1, '2026-05-30T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('3bb6163c-000a-4ab1-85de-5a22aba39236', 4, '70512c73-338c-44f6-abf3-50abd3a57761', 'Brinde', 25.0, '2026-05-30', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-30');

-- LINHA 332 [SIM]: IPHONE 16 PRO MAX 256GB DESERT SEMINOVO (30/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('257fa4f5-1b7e-403d-a7ad-ddc985292de7', 'Apple', 'IPHONE 16 PRO MAX 256GB DESERT SEMINOVO', '354661674485405', 5200.0, 4850.0, 20, 'seminovo', 'bom', 'vendido', '2026-05-30', '2026-05-30', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', '2026-05-30', '2026-05-30', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('85a7a3aa-0941-4277-8310-49678da4edb4', current_setting('importacao.proximo_numero')::int + 329, current_setting('importacao.cliente_id')::uuid, 20, 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 'concluida', 'normal', 5200.0, 5200.0, 0.0, '2026-05-30', '2026-05-30', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4');
UPDATE aparelhos SET venda_id = '85a7a3aa-0941-4277-8310-49678da4edb4' WHERE id = '257fa4f5-1b7e-403d-a7ad-ddc985292de7';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('90faae5a-026b-4e5e-8087-593cfa72d8d6', '85a7a3aa-0941-4277-8310-49678da4edb4', 'pix', 5200.0, '2026-05-30', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 1, '2026-05-30T14:00:00');

-- LINHA 333 [NAO]: REDMI PAD 2 256GB PRETO NOVO (30/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('0940430f-3b91-450c-900f-34b1b6f309da', 'Xiaomi', 'REDMI PAD 2 256GB PRETO NOVO', '65577/W6PU00619', 1350.0, 1250.0, 20, 'novo', 'perfeito', 'vendido', '2026-05-30', '2026-05-30', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', '2026-05-30', '2026-05-30', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('ce730efa-9839-4937-8517-fd1b2ae87e8a', current_setting('importacao.proximo_numero')::int + 330, current_setting('importacao.cliente_id')::uuid, 20, 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 'concluida', 'normal', 1350.0, 1350.0, 0.0, '2026-05-30', '2026-05-30', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4');
UPDATE aparelhos SET venda_id = 'ce730efa-9839-4937-8517-fd1b2ae87e8a' WHERE id = '0940430f-3b91-450c-900f-34b1b6f309da';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('fda96424-f2cd-4968-ae4a-4cccf26c5ead', 'ce730efa-9839-4937-8517-fd1b2ae87e8a', 'pix', 1350.0, '2026-05-30', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 1, '2026-05-30T14:00:00');

-- LINHA 334 [NAO]: IPHONE 15 128GB AZUL NOVO (30/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('d19f6651-bee8-44ad-afcf-2ca9a09030a0', 'Apple', 'IPHONE 15 128GB AZUL NOVO', '355225779897630', 3900.0, 3750.0, 20, 'novo', 'perfeito', 'vendido', '2026-05-30', '2026-05-30', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', '2026-05-30', '2026-05-30', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('9cdab58e-0d40-4891-b79e-4f9c0a130603', current_setting('importacao.proximo_numero')::int + 331, current_setting('importacao.cliente_id')::uuid, 20, 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 'concluida', 'normal', 3900.0, 3900.0, 0.0, '2026-05-30', '2026-05-30', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4');
UPDATE aparelhos SET venda_id = '9cdab58e-0d40-4891-b79e-4f9c0a130603' WHERE id = 'd19f6651-bee8-44ad-afcf-2ca9a09030a0';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('1897d3cb-e567-4496-89cf-f51e760271bf', '9cdab58e-0d40-4891-b79e-4f9c0a130603', 'pix', 1000.0, '2026-05-30', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 1, '2026-05-30T14:00:00');
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('eaed75ae-80bc-4776-9665-48b3abb8b25a', '9cdab58e-0d40-4891-b79e-4f9c0a130603', 'cartao_credito', 2900.0, '2026-05-30', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 1, '2026-05-30T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('3a66fda6-6b5e-4607-83b6-681a68aecfa8', 20, '9cdab58e-0d40-4891-b79e-4f9c0a130603', 'Brinde', 10.0, '2026-05-30', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', '2026-05-30');

-- LINHA 335 [NAO]: IPHONE 16 PRO 256GB PRETO SEMINOVO (30/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('c6025df0-73d8-4cf4-9998-6ab5501124a6', 'Apple', 'IPHONE 16 PRO 256GB PRETO SEMINOVO', '357463442372645', 4700.0, 4500.0, 4, 'seminovo', 'bom', 'vendido', '2026-05-30', '2026-05-30', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-30', '2026-05-30', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('934dff87-9196-4b35-84c8-2c24b19f0af2', current_setting('importacao.proximo_numero')::int + 332, current_setting('importacao.cliente_id')::uuid, 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 4700.0, 4700.0, 0.0, '2026-05-30', '2026-05-30', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
UPDATE aparelhos SET venda_id = '934dff87-9196-4b35-84c8-2c24b19f0af2' WHERE id = 'c6025df0-73d8-4cf4-9998-6ab5501124a6';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('80431b01-43f6-4a3b-8d3e-97e1c591b030', '934dff87-9196-4b35-84c8-2c24b19f0af2', 'pix', 4400.0, '2026-05-30', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1, '2026-05-30T14:00:00');
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, observacao, parcelas, criado_em)
VALUES ('2d58c6c6-4bd9-4be6-b521-9802c4c4bab4', '934dff87-9196-4b35-84c8-2c24b19f0af2', 'troca_aparelho', 300.0, '2026-05-30', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'Troca: XS MAX SEMINOVO', 1, '2026-05-30T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('288be00c-9345-4c4c-a0f6-bdad0b372acb', 4, '934dff87-9196-4b35-84c8-2c24b19f0af2', 'Brinde', 25.0, '2026-05-30', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-30');

-- LINHA 336 [NAO]: IPHONE 17 PRO 256GB PRETO NOVO (30/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('c1e625b9-1bec-451f-a3f1-26a1d85f0954', 'Apple', 'IPHONE 17 PRO 256GB PRETO NOVO', '355820203650330', 7300.0, 6900.0, 4, 'novo', 'perfeito', 'vendido', '2026-05-30', '2026-05-30', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-30', '2026-05-30', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('a6d30fd9-5c3b-47bd-b211-d0b9deff97e8', current_setting('importacao.proximo_numero')::int + 333, current_setting('importacao.cliente_id')::uuid, 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 7300.0, 7300.0, 0.0, '2026-05-30', '2026-05-30', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
UPDATE aparelhos SET venda_id = 'a6d30fd9-5c3b-47bd-b211-d0b9deff97e8' WHERE id = 'c1e625b9-1bec-451f-a3f1-26a1d85f0954';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('6963986d-88c2-4cd8-98c0-d82d59d09677', 'a6d30fd9-5c3b-47bd-b211-d0b9deff97e8', 'cartao_credito', 4100.0, '2026-05-30', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1, '2026-05-30T14:00:00');
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, observacao, parcelas, criado_em)
VALUES ('7d4d96dd-619b-4a99-8f33-f06e313bafb6', 'a6d30fd9-5c3b-47bd-b211-d0b9deff97e8', 'troca_aparelho', 3200.0, '2026-05-30', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'Troca: 16 PRO 256 SEMINOVO', 1, '2026-05-30T14:00:00');

-- LINHA 337 [SIM]: IPHONE 17 PRO 512GB AZUL NOVO (30/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('81f8ccce-8c38-4224-9051-22766d7e5d9f', 'Apple', 'IPHONE 17 PRO 512GB AZUL NOVO', '354289633583902', 8250.0, 8000.0, 4, 'novo', 'perfeito', 'vendido', '2026-05-30', '2026-05-30', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-30', '2026-05-30', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('77c1622c-13b2-4688-916b-3924658202ad', current_setting('importacao.proximo_numero')::int + 334, current_setting('importacao.cliente_id')::uuid, 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 8250.0, 8250.0, 0.0, '2026-05-30', '2026-05-30', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
UPDATE aparelhos SET venda_id = '77c1622c-13b2-4688-916b-3924658202ad' WHERE id = '81f8ccce-8c38-4224-9051-22766d7e5d9f';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('6d57edce-6bae-497c-a539-fc1eaa31a53a', '77c1622c-13b2-4688-916b-3924658202ad', 'pix', 8250.0, '2026-05-30', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1, '2026-05-30T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('98da38a5-ab32-4795-a0ce-5ae5a4c1e052', 4, '77c1622c-13b2-4688-916b-3924658202ad', 'Brinde', 15.0, '2026-05-30', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-30');

-- LINHA 338 [NAO]: IPHONE 13 256GB ROSA SEMINOVO (30/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('5a6954a4-68ea-4c5b-a035-03b77aeb0973', 'Apple', 'IPHONE 13 256GB ROSA SEMINOVO', '352824489625845', 2300.0, 1900.0, 4, 'seminovo', 'bom', 'vendido', '2026-05-30', '2026-05-30', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-30', '2026-05-30', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('72642ad4-a4b4-4c89-9387-7fce5fecd3d9', current_setting('importacao.proximo_numero')::int + 335, current_setting('importacao.cliente_id')::uuid, 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 2300.0, 2300.0, 0.0, '2026-05-30', '2026-05-30', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
UPDATE aparelhos SET venda_id = '72642ad4-a4b4-4c89-9387-7fce5fecd3d9' WHERE id = '5a6954a4-68ea-4c5b-a035-03b77aeb0973';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('9f0cf944-9ea5-4a9b-b685-b237e17f9232', '72642ad4-a4b4-4c89-9387-7fce5fecd3d9', 'cartao_credito', 2300.0, '2026-05-30', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1, '2026-05-30T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('79f12732-32ef-4b10-83cd-e11b6fae94d2', 4, '72642ad4-a4b4-4c89-9387-7fce5fecd3d9', 'Brinde', 25.0, '2026-05-30', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-30');

-- LINHA 339 [NAO]: IPHONE XS MAX 256GB DOURADO SEMINOVO (30/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('f4df5b5a-5f08-4f30-a5bc-1eae63a56341', 'Apple', 'IPHONE XS MAX 256GB DOURADO SEMINOVO', '35112102108566', 350.0, 300.0, 4, 'seminovo', 'bom', 'vendido', '2026-05-30', '2026-05-30', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-30', '2026-05-30', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('90cd209d-96ce-4267-b36b-cd4fb12bea86', current_setting('importacao.proximo_numero')::int + 336, current_setting('importacao.cliente_id')::uuid, 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 350.0, 350.0, 0.0, '2026-05-30', '2026-05-30', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
UPDATE aparelhos SET venda_id = '90cd209d-96ce-4267-b36b-cd4fb12bea86' WHERE id = 'f4df5b5a-5f08-4f30-a5bc-1eae63a56341';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('0f306938-77b5-4f72-a4e7-dc564bde757a', '90cd209d-96ce-4267-b36b-cd4fb12bea86', 'pix', 350.0, '2026-05-30', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1, '2026-05-30T14:00:00');

-- LINHA 340 [NAO]: IPHONE 15 PRO  256GB AZUL SEMINOVO (30/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('57cccea4-89a7-4530-b9ff-d16ecadd976b', 'Apple', 'IPHONE 15 PRO  256GB AZUL SEMINOVO', '353864164761936', 3600.0, 3200.0, 19, 'seminovo', 'bom', 'vendido', '2026-05-30', '2026-05-30', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-30', '2026-05-30', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('8d14f9f9-d357-4196-85b3-fe0f6dc16f32', current_setting('importacao.proximo_numero')::int + 337, current_setting('importacao.cliente_id')::uuid, 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 3600.0, 3600.0, 0.0, '2026-05-30', '2026-05-30', '97f12885-87ad-426a-8bbb-656889d82e10');
UPDATE aparelhos SET venda_id = '8d14f9f9-d357-4196-85b3-fe0f6dc16f32' WHERE id = '57cccea4-89a7-4530-b9ff-d16ecadd976b';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('95020755-95dd-466d-bee1-74f14adb1fe3', '8d14f9f9-d357-4196-85b3-fe0f6dc16f32', 'pix', 2300.0, '2026-05-30', '97f12885-87ad-426a-8bbb-656889d82e10', 1, '2026-05-30T14:00:00');
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, observacao, parcelas, criado_em)
VALUES ('9e7a95b7-eb9e-41e6-9add-bb2186b34d91', '8d14f9f9-d357-4196-85b3-fe0f6dc16f32', 'troca_aparelho', 1300.0, '2026-05-30', '97f12885-87ad-426a-8bbb-656889d82e10', 'Troca: IPH 12 PRO', 1, '2026-05-30T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('410650f7-a383-4951-bac4-43eb78db0b67', 19, '8d14f9f9-d357-4196-85b3-fe0f6dc16f32', 'Brinde', 25.0, '2026-05-30', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-30');

-- LINHA 341 [NAO]: PARTY BOX 120 PRETA (30/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('f5f116ed-6b49-4f59-afda-407397e304de', 'Outros', 'PARTY BOX 120 PRETA', '58035038', 1800.0, 1700.0, 19, 'seminovo', 'bom', 'vendido', '2026-05-30', '2026-05-30', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-30', '2026-05-30', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('fcb6e1ec-6129-41ee-b06f-0c8e9a6caf12', current_setting('importacao.proximo_numero')::int + 338, current_setting('importacao.cliente_id')::uuid, 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 1800.0, 1800.0, 0.0, '2026-05-30', '2026-05-30', '97f12885-87ad-426a-8bbb-656889d82e10');
UPDATE aparelhos SET venda_id = 'fcb6e1ec-6129-41ee-b06f-0c8e9a6caf12' WHERE id = 'f5f116ed-6b49-4f59-afda-407397e304de';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('c4677af9-61eb-4f41-b620-645f4bab78dd', 'fcb6e1ec-6129-41ee-b06f-0c8e9a6caf12', 'pix', 1800.0, '2026-05-30', '97f12885-87ad-426a-8bbb-656889d82e10', 1, '2026-05-30T14:00:00');

-- LINHA 342 [SIM]: IPHONE 16 PRO 256GB  PRETO SEMINOVO (30/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('be0c1e0f-da1e-4beb-8cc5-745d657854d8', 'Apple', 'IPHONE 16 PRO 256GB  PRETO SEMINOVO', '359896928035433', 4830.0, 4500.0, 1, 'seminovo', 'bom', 'vendido', '2026-05-30', '2026-05-30', '1d12d555-68e9-45f8-bfc0-a35a1d8d7920', '2026-05-30', '2026-05-30', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('4866d181-935b-4d9e-ad75-281a724d6522', current_setting('importacao.proximo_numero')::int + 339, current_setting('importacao.cliente_id')::uuid, 1, '1d12d555-68e9-45f8-bfc0-a35a1d8d7920', 'concluida', 'normal', 4830.0, 4830.0, 0.0, '2026-05-30', '2026-05-30', '1d12d555-68e9-45f8-bfc0-a35a1d8d7920');
UPDATE aparelhos SET venda_id = '4866d181-935b-4d9e-ad75-281a724d6522' WHERE id = 'be0c1e0f-da1e-4beb-8cc5-745d657854d8';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('7188f342-55e7-47c8-9eef-87bf4a288d80', '4866d181-935b-4d9e-ad75-281a724d6522', 'pix', 4830.0, '2026-05-30', '1d12d555-68e9-45f8-bfc0-a35a1d8d7920', 1, '2026-05-30T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('bda9afbd-679b-4218-ae6c-3f2240a2639d', 1, '4866d181-935b-4d9e-ad75-281a724d6522', 'Brinde', 25.0, '2026-05-30', '1d12d555-68e9-45f8-bfc0-a35a1d8d7920', '2026-05-30');

-- LINHA 343 [SIM]: MACBOOK AIR M5 13  512GB NOVO (30/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('94c5fd5e-f565-450f-a8f3-a3e4f2885c6e', 'Apple', 'MACBOOK AIR M5 13  512GB NOVO', 'K42L7RHF4J', 7350.0, 6750.0, 19, 'novo', 'perfeito', 'vendido', '2026-05-30', '2026-05-30', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-30', '2026-05-30', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('2c576db6-4608-402b-a087-7c6490b91670', current_setting('importacao.proximo_numero')::int + 340, current_setting('importacao.cliente_id')::uuid, 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 7350.0, 7350.0, 0.0, '2026-05-30', '2026-05-30', '97f12885-87ad-426a-8bbb-656889d82e10');
UPDATE aparelhos SET venda_id = '2c576db6-4608-402b-a087-7c6490b91670' WHERE id = '94c5fd5e-f565-450f-a8f3-a3e4f2885c6e';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('d0e4709a-ccf7-4a63-b863-7ee1234cd75a', '2c576db6-4608-402b-a087-7c6490b91670', 'pix', 7350.0, '2026-05-30', '97f12885-87ad-426a-8bbb-656889d82e10', 1, '2026-05-30T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('c4c0eae1-5349-4745-b9a3-469d7f8a19ef', 19, '2c576db6-4608-402b-a087-7c6490b91670', 'Brinde', 50.0, '2026-05-30', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-30');

-- LINHA 344 [NAO]: IPHONE 17 PRO MAX 256GB AZUL NOVO (30/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('cc4bdefa-5c8a-4dd9-a3e6-9933d5e814c7', 'Apple', 'IPHONE 17 PRO MAX 256GB AZUL NOVO', '350552893601530', 7950.0, 7550.0, 1, 'novo', 'perfeito', 'vendido', '2026-05-30', '2026-05-30', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-30', '2026-05-30', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('c860503e-91cc-4f34-b9a9-afda3c7e6f28', current_setting('importacao.proximo_numero')::int + 341, current_setting('importacao.cliente_id')::uuid, 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 7950.0, 7950.0, 0.0, '2026-05-30', '2026-05-30', '85e3aa42-b9af-49b8-a72a-64e9c337aa53');
UPDATE aparelhos SET venda_id = 'c860503e-91cc-4f34-b9a9-afda3c7e6f28' WHERE id = 'cc4bdefa-5c8a-4dd9-a3e6-9933d5e814c7';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('a67f3091-5c98-443b-8451-d4fe42c549bb', 'c860503e-91cc-4f34-b9a9-afda3c7e6f28', 'dinheiro', 3100.0, '2026-05-30', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 1, '2026-05-30T14:00:00');
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, observacao, parcelas, criado_em)
VALUES ('cde575b7-6867-42c9-a610-a95ea553973b', 'c860503e-91cc-4f34-b9a9-afda3c7e6f28', 'troca_aparelho', 4850.0, '2026-05-30', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'Troca: IPH 16 PRO 256GB', 1, '2026-05-30T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('286be110-9864-44d8-8d0e-dcc97b13024f', 1, 'c860503e-91cc-4f34-b9a9-afda3c7e6f28', 'Brinde', 25.0, '2026-05-30', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-30');

-- LINHA 345 [NAO]: MACBOOK NEO SILVER 256GB NOVO (30/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('f56a05cf-f1ad-4700-8b0f-20b23cf1048b', 'Apple', 'MACBOOK NEO SILVER 256GB NOVO', 'CR2N7W25Q1', 4422.0, 4300.0, 1, 'novo', 'perfeito', 'vendido', '2026-05-30', '2026-05-30', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-30', '2026-05-30', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('a74b6bbc-d157-4101-991d-e466a8b1b954', current_setting('importacao.proximo_numero')::int + 342, current_setting('importacao.cliente_id')::uuid, 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 4422.0, 4422.0, 0.0, '2026-05-30', '2026-05-30', '85e3aa42-b9af-49b8-a72a-64e9c337aa53');
UPDATE aparelhos SET venda_id = 'a74b6bbc-d157-4101-991d-e466a8b1b954' WHERE id = 'f56a05cf-f1ad-4700-8b0f-20b23cf1048b';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('eacc07cf-bad1-40c9-943c-c6638dae947f', 'a74b6bbc-d157-4101-991d-e466a8b1b954', 'pix', 4422.0, '2026-05-30', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 1, '2026-05-30T14:00:00');

-- LINHA 346 [NAO]: REDMI NOTE 15 256GB VERDE NOVO (30/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('53c2b5bc-8866-4098-8640-1df0f8198bcf', 'Xiaomi', 'REDMI NOTE 15 256GB VERDE NOVO', '862795081570725', 1242.0, 1130.0, 1, 'novo', 'perfeito', 'vendido', '2026-05-30', '2026-05-30', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-30', '2026-05-30', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('e45a47f9-8059-460d-8d55-9e38c76c6f57', current_setting('importacao.proximo_numero')::int + 343, current_setting('importacao.cliente_id')::uuid, 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 1242.0, 1242.0, 0.0, '2026-05-30', '2026-05-30', '85e3aa42-b9af-49b8-a72a-64e9c337aa53');
UPDATE aparelhos SET venda_id = 'e45a47f9-8059-460d-8d55-9e38c76c6f57' WHERE id = '53c2b5bc-8866-4098-8640-1df0f8198bcf';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('a5ed9fae-8cf0-4bda-9534-66e2a53c96ef', 'e45a47f9-8059-460d-8d55-9e38c76c6f57', 'pix', 1242.0, '2026-05-30', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 1, '2026-05-30T14:00:00');

-- LINHA 347 [NAO]: IPHONE 14 PRO SEMINOVO 512GB PRETO (30/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('b9e17629-c675-4063-96ef-d74c5cc0a2e3', 'Apple', 'IPHONE 14 PRO SEMINOVO 512GB PRETO', '354256834755639', 3350.0, 2800.0, 1, 'seminovo', 'bom', 'vendido', '2026-05-30', '2026-05-30', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-30', '2026-05-30', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('8c50624f-259b-4596-8534-c895ef8c2a04', current_setting('importacao.proximo_numero')::int + 344, current_setting('importacao.cliente_id')::uuid, 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 3350.0, 3350.0, 0.0, '2026-05-30', '2026-05-30', '85e3aa42-b9af-49b8-a72a-64e9c337aa53');
UPDATE aparelhos SET venda_id = '8c50624f-259b-4596-8534-c895ef8c2a04' WHERE id = 'b9e17629-c675-4063-96ef-d74c5cc0a2e3';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('d390375d-7a08-4e25-a27b-67d373ead7fb', '8c50624f-259b-4596-8534-c895ef8c2a04', 'pix', 1800.0, '2026-05-30', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 1, '2026-05-30T14:00:00');
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, observacao, parcelas, criado_em)
VALUES ('9d767dec-7ad7-40d6-81f4-1763d525a313', '8c50624f-259b-4596-8534-c895ef8c2a04', 'troca_aparelho', 1550.0, '2026-05-30', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'Troca: IPH 13', 1, '2026-05-30T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('89dcd657-ca7a-46ad-903c-8d4ebf2679ac', 1, '8c50624f-259b-4596-8534-c895ef8c2a04', 'Brinde', 10.0, '2026-05-30', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-30');

-- LINHA 348 [NAO]: IPHONE 16 PRO MAX 512GB PRETO SEMINOVO (30/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('631b4a3f-b6ba-4211-90c8-2643900bbe4c', 'Apple', 'IPHONE 16 PRO MAX 512GB PRETO SEMINOVO', '357205981829942', 5714.0, 5150.0, 1, 'seminovo', 'bom', 'vendido', '2026-05-30', '2026-05-30', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-30', '2026-05-30', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('9e6c0621-4e12-436f-bc73-57b13c62d161', current_setting('importacao.proximo_numero')::int + 345, current_setting('importacao.cliente_id')::uuid, 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 5714.0, 5714.0, 0.0, '2026-05-30', '2026-05-30', '85e3aa42-b9af-49b8-a72a-64e9c337aa53');
UPDATE aparelhos SET venda_id = '9e6c0621-4e12-436f-bc73-57b13c62d161' WHERE id = '631b4a3f-b6ba-4211-90c8-2643900bbe4c';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('09e7767c-733b-4e3e-a3c6-abb1bbe46954', '9e6c0621-4e12-436f-bc73-57b13c62d161', 'pix', 4164.0, '2026-05-30', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 1, '2026-05-30T14:00:00');
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, observacao, parcelas, criado_em)
VALUES ('224bcae4-ecbb-416c-a683-2163b27d3f00', '9e6c0621-4e12-436f-bc73-57b13c62d161', 'troca_aparelho', 1550.0, '2026-05-30', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'Troca: IPH 13', 1, '2026-05-30T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('bfd70af9-f648-4963-ae77-55486149a0eb', 1, '9e6c0621-4e12-436f-bc73-57b13c62d161', 'Brinde', 25.0, '2026-05-30', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-30');

-- LINHA 349 [NAO]: IPHONE 13 PRO MAX 256GB AZUL SEMINOVO (30/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('dfd9ce10-7ac1-43e0-aa63-1d8b9291e25a', 'Apple', 'IPHONE 13 PRO MAX 256GB AZUL SEMINOVO', '351786564816337', 2900.0, 2800.0, 1, 'seminovo', 'bom', 'vendido', '2026-05-30', '2026-05-30', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-30', '2026-05-30', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('202b75b1-a940-40c3-9579-87cdf4b4e634', current_setting('importacao.proximo_numero')::int + 346, current_setting('importacao.cliente_id')::uuid, 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 2900.0, 2900.0, 0.0, '2026-05-30', '2026-05-30', '85e3aa42-b9af-49b8-a72a-64e9c337aa53');
UPDATE aparelhos SET venda_id = '202b75b1-a940-40c3-9579-87cdf4b4e634' WHERE id = 'dfd9ce10-7ac1-43e0-aa63-1d8b9291e25a';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('1cae2864-1e01-4f23-a376-50ca40c3d746', '202b75b1-a940-40c3-9579-87cdf4b4e634', 'pix', 2900.0, '2026-05-30', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 1, '2026-05-30T14:00:00');

-- LINHA 350 [SIM]: IPHONE 11 128GB PRETO USADO (30/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('bd67269b-1eac-47a0-81ac-4548ad45472f', 'Apple', 'IPHONE 11 128GB PRETO USADO', NULL, 1062.0, 700.0, 19, 'usado', 'regular', 'vendido', '2026-05-30', '2026-05-30', '85743f3e-1b32-49c0-9d9e-c16afd690f7d', '2026-05-30', '2026-05-30', 'Sem IMEI');
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('f7c961f3-1b86-42f4-8cad-4a3c4196e5af', current_setting('importacao.proximo_numero')::int + 347, current_setting('importacao.cliente_id')::uuid, 19, '85743f3e-1b32-49c0-9d9e-c16afd690f7d', 'concluida', 'normal', 1062.0, 1062.0, 0.0, '2026-05-30', '2026-05-30', '85743f3e-1b32-49c0-9d9e-c16afd690f7d');
UPDATE aparelhos SET venda_id = 'f7c961f3-1b86-42f4-8cad-4a3c4196e5af' WHERE id = 'bd67269b-1eac-47a0-81ac-4548ad45472f';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('5d1b5fde-7c06-4415-a737-d6a3a0a53f75', 'f7c961f3-1b86-42f4-8cad-4a3c4196e5af', 'pix', 1062.0, '2026-05-30', '85743f3e-1b32-49c0-9d9e-c16afd690f7d', 1, '2026-05-30T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('5241aaed-a901-4574-8d7c-be15983f0ec7', 19, 'f7c961f3-1b86-42f4-8cad-4a3c4196e5af', 'Brinde', 25.0, '2026-05-30', '85743f3e-1b32-49c0-9d9e-c16afd690f7d', '2026-05-30');

-- LINHA 351 [NAO]: POCO X7 PRO 512GB PRETO NOVO (30/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('051c9de2-0db5-4e88-93a4-481888c45041', 'Outros', 'POCO X7 PRO 512GB PRETO NOVO', '869471083013626', 2140.0, 1990.0, 20, 'novo', 'perfeito', 'vendido', '2026-05-30', '2026-05-30', '25e2da5b-9e76-4388-9890-7e22efd6940d', '2026-05-30', '2026-05-30', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('b4231457-d60c-4a38-ba4a-7f1abfcff955', current_setting('importacao.proximo_numero')::int + 348, current_setting('importacao.cliente_id')::uuid, 20, '25e2da5b-9e76-4388-9890-7e22efd6940d', 'concluida', 'normal', 2140.0, 2140.0, 0.0, '2026-05-30', '2026-05-30', '25e2da5b-9e76-4388-9890-7e22efd6940d');
UPDATE aparelhos SET venda_id = 'b4231457-d60c-4a38-ba4a-7f1abfcff955' WHERE id = '051c9de2-0db5-4e88-93a4-481888c45041';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('b70f8e9c-ea37-47d5-8893-cbabeb719a98', 'b4231457-d60c-4a38-ba4a-7f1abfcff955', 'cartao_credito', 2140.0, '2026-05-30', '25e2da5b-9e76-4388-9890-7e22efd6940d', 1, '2026-05-30T14:00:00');

-- LINHA 352 [NAO]: IPHONE 16 PRO 256GB DESERT SEMINOVO (31/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('bb7a0a0a-8db5-4f4b-8e6d-0c2fdb2031e2', 'Apple', 'IPHONE 16 PRO 256GB DESERT SEMINOVO', '357592315867213', 4700.0, 4500.0, 4, 'seminovo', 'bom', 'vendido', '2026-05-31', '2026-05-31', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-31', '2026-05-31', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('356425c1-46b8-4148-81b6-1fde252c246c', current_setting('importacao.proximo_numero')::int + 349, current_setting('importacao.cliente_id')::uuid, 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 4700.0, 4700.0, 0.0, '2026-05-31', '2026-05-31', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
UPDATE aparelhos SET venda_id = '356425c1-46b8-4148-81b6-1fde252c246c' WHERE id = 'bb7a0a0a-8db5-4f4b-8e6d-0c2fdb2031e2';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('016aca13-cf7b-49ba-828d-02e5d9ff5b75', '356425c1-46b8-4148-81b6-1fde252c246c', 'pix', 4700.0, '2026-05-31', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1, '2026-05-31T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('108f5ce4-dd6a-416d-a79a-7cb67ffcce80', 4, '356425c1-46b8-4148-81b6-1fde252c246c', 'Brinde', 25.0, '2026-05-31', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-31');

-- LINHA 353 [SIM]: IPHONE 16 PRO MAX 256GB DESERT SEMINOVO (31/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('7742d73f-f587-4164-9fef-6940325c3c65', 'Apple', 'IPHONE 16 PRO MAX 256GB DESERT SEMINOVO', '54210973599126', 5300.0, 5000.0, 4, 'seminovo', 'bom', 'vendido', '2026-05-31', '2026-05-31', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-31', '2026-05-31', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('b9b430ca-f426-4a0c-a4c6-3772fd1421a4', current_setting('importacao.proximo_numero')::int + 350, current_setting('importacao.cliente_id')::uuid, 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 5300.0, 5300.0, 0.0, '2026-05-31', '2026-05-31', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
UPDATE aparelhos SET venda_id = 'b9b430ca-f426-4a0c-a4c6-3772fd1421a4' WHERE id = '7742d73f-f587-4164-9fef-6940325c3c65';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('21f8988d-0b30-4e14-ada9-b164c6ffd8f0', 'b9b430ca-f426-4a0c-a4c6-3772fd1421a4', 'pix', 5300.0, '2026-05-31', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1, '2026-05-31T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('48326bf7-2579-4724-aef7-ed82febf253f', 4, 'b9b430ca-f426-4a0c-a4c6-3772fd1421a4', 'Brinde', 15.0, '2026-05-31', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-31');

-- LINHA 354 [NAO]: IPAD 11° A16 128GB SILVER NOVO (31/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('87198701-1022-4ad8-ada7-687b46259975', 'Apple', 'IPAD 11° A16 128GB SILVER NOVO', 'HGY4F5FC96', 2500.0, 2150.0, 4, 'novo', 'perfeito', 'vendido', '2026-05-31', '2026-05-31', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-31', '2026-05-31', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('976a1a2f-5fd3-44e6-81cf-8d4fc7c8a0c2', current_setting('importacao.proximo_numero')::int + 351, current_setting('importacao.cliente_id')::uuid, 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 2500.0, 2500.0, 0.0, '2026-05-31', '2026-05-31', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
UPDATE aparelhos SET venda_id = '976a1a2f-5fd3-44e6-81cf-8d4fc7c8a0c2' WHERE id = '87198701-1022-4ad8-ada7-687b46259975';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('2ecd332a-dd9a-4715-96ed-87ebd6faba31', '976a1a2f-5fd3-44e6-81cf-8d4fc7c8a0c2', 'pix', 700.0, '2026-05-31', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1, '2026-05-31T14:00:00');
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('ec6bf3f8-1ed0-4cba-9f6d-ef052c57b9d7', '976a1a2f-5fd3-44e6-81cf-8d4fc7c8a0c2', 'cartao_credito', 1800.0, '2026-05-31', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1, '2026-05-31T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('c99c15e3-2d49-425f-892b-de43f096d88e', 4, '976a1a2f-5fd3-44e6-81cf-8d4fc7c8a0c2', 'Brinde', 150.0, '2026-05-31', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-31');

-- LINHA 355 [NAO]: POCO C85 PRETO 256GB NOVO (31/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('a467f321-4488-442a-9a8b-6cca834e6c47', 'Outros', 'POCO C85 PRETO 256GB NOVO', '69385/65ZH01514', 1000.0, 890.0, 20, 'novo', 'perfeito', 'vendido', '2026-05-31', '2026-05-31', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', '2026-05-31', '2026-05-31', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('d349cf82-244e-4f08-88c2-d59b0543ce44', current_setting('importacao.proximo_numero')::int + 352, current_setting('importacao.cliente_id')::uuid, 20, 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 'concluida', 'normal', 1000.0, 1000.0, 0.0, '2026-05-31', '2026-05-31', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4');
UPDATE aparelhos SET venda_id = 'd349cf82-244e-4f08-88c2-d59b0543ce44' WHERE id = 'a467f321-4488-442a-9a8b-6cca834e6c47';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('08466ba0-c599-4238-8df1-38ff727d5358', 'd349cf82-244e-4f08-88c2-d59b0543ce44', 'cartao_credito', 1000.0, '2026-05-31', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 1, '2026-05-31T14:00:00');

-- LINHA 356 [NAO]: IPHONE 16 128GB AZUL NOVO (31/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('f666d4d1-a4ff-405c-bdea-16530107d196', 'Apple', 'IPHONE 16 128GB AZUL NOVO', '353317874110720', 4050.0, 3950.0, 20, 'novo', 'perfeito', 'vendido', '2026-05-31', '2026-05-31', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', '2026-05-31', '2026-05-31', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('e3e4f40c-d1fe-4647-878e-ee47e6e2893f', current_setting('importacao.proximo_numero')::int + 353, current_setting('importacao.cliente_id')::uuid, 20, 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 'concluida', 'normal', 4050.0, 4050.0, 0.0, '2026-05-31', '2026-05-31', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4');
UPDATE aparelhos SET venda_id = 'e3e4f40c-d1fe-4647-878e-ee47e6e2893f' WHERE id = 'f666d4d1-a4ff-405c-bdea-16530107d196';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('1d41fa02-a392-4b40-b99f-99a1b5bc4c88', 'e3e4f40c-d1fe-4647-878e-ee47e6e2893f', 'pix', 4050.0, '2026-05-31', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 1, '2026-05-31T14:00:00');

-- LINHA 357 [NAO]: IPHONE 13 128GB AZUL SEMINOVO (31/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('c69daa7d-0c8e-4c61-9063-615b2e801e70', 'Apple', 'IPHONE 13 128GB AZUL SEMINOVO', '352873836693105', 1900.0, 1780.0, 20, 'seminovo', 'bom', 'vendido', '2026-05-31', '2026-05-31', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', '2026-05-31', '2026-05-31', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('e9f47126-ccca-48cc-aa93-ab69b5d45cf3', current_setting('importacao.proximo_numero')::int + 354, current_setting('importacao.cliente_id')::uuid, 20, 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 'concluida', 'normal', 1900.0, 1900.0, 0.0, '2026-05-31', '2026-05-31', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4');
UPDATE aparelhos SET venda_id = 'e9f47126-ccca-48cc-aa93-ab69b5d45cf3' WHERE id = 'c69daa7d-0c8e-4c61-9063-615b2e801e70';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('f209065e-852d-40c7-b03a-1508c2b93941', 'e9f47126-ccca-48cc-aa93-ab69b5d45cf3', 'pix', 1900.0, '2026-05-31', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 1, '2026-05-31T14:00:00');

-- LINHA 358 [NAO]: POCO C85 PRETO 256GB NOVO (31/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('f341d27b-a393-4fdf-9e62-1db0473945da', 'Outros', 'POCO C85 PRETO 256GB NOVO', '69374/65YT14295', 990.0, 890.0, 20, 'novo', 'perfeito', 'vendido', '2026-05-31', '2026-05-31', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', '2026-05-31', '2026-05-31', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('332926e9-b641-43fd-ac68-959336249eca', current_setting('importacao.proximo_numero')::int + 355, current_setting('importacao.cliente_id')::uuid, 20, 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 'concluida', 'normal', 990.0, 990.0, 0.0, '2026-05-31', '2026-05-31', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4');
UPDATE aparelhos SET venda_id = '332926e9-b641-43fd-ac68-959336249eca' WHERE id = 'f341d27b-a393-4fdf-9e62-1db0473945da';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('bbcc0b6b-dda8-4b58-ab69-2b0d3e2e0624', '332926e9-b641-43fd-ac68-959336249eca', 'pix', 500.0, '2026-05-31', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 1, '2026-05-31T14:00:00');
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('db9313f1-aa57-4291-83e5-271ab42e63b7', '332926e9-b641-43fd-ac68-959336249eca', 'cartao_credito', 490.0, '2026-05-31', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 1, '2026-05-31T14:00:00');

-- LINHA 359 [SIM]: IPHONE 15 128GB PRETO SEMINOVO (31/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('2d55d090-6d49-43f2-aff1-bc9bfb74cdbc', 'Apple', 'IPHONE 15 128GB PRETO SEMINOVO', '356942573789859', 2813.0, 2660.0, 19, 'seminovo', 'bom', 'vendido', '2026-05-31', '2026-05-31', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-31', '2026-05-31', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('ba9c86c3-1d2d-45a0-a2ce-bfb42fadbfda', current_setting('importacao.proximo_numero')::int + 356, current_setting('importacao.cliente_id')::uuid, 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 2813.0, 2813.0, 0.0, '2026-05-31', '2026-05-31', '97f12885-87ad-426a-8bbb-656889d82e10');
UPDATE aparelhos SET venda_id = 'ba9c86c3-1d2d-45a0-a2ce-bfb42fadbfda' WHERE id = '2d55d090-6d49-43f2-aff1-bc9bfb74cdbc';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('43cb11bf-5202-4aa2-8b76-f6e1f90d9feb', 'ba9c86c3-1d2d-45a0-a2ce-bfb42fadbfda', 'pix', 2813.0, '2026-05-31', '97f12885-87ad-426a-8bbb-656889d82e10', 1, '2026-05-31T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('cc46152a-19bd-4ada-8811-7ce4f11e1aa5', 19, 'ba9c86c3-1d2d-45a0-a2ce-bfb42fadbfda', 'Brinde', 25.0, '2026-05-31', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-31');

-- LINHA 360 [NAO]: IPHONE 17 PRO 256GB AZUL NOVO (31/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('3e0d0f3e-75f4-4efa-8244-9e1b5f4d2230', 'Apple', 'IPHONE 17 PRO 256GB AZUL NOVO', '359477633520876', 7300.0, 7000.0, 19, 'novo', 'perfeito', 'vendido', '2026-05-31', '2026-05-31', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-31', '2026-05-31', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('65a4a380-e7b1-4f76-8b0e-8b40c61bdc52', current_setting('importacao.proximo_numero')::int + 357, current_setting('importacao.cliente_id')::uuid, 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 7300.0, 7300.0, 0.0, '2026-05-31', '2026-05-31', '97f12885-87ad-426a-8bbb-656889d82e10');
UPDATE aparelhos SET venda_id = '65a4a380-e7b1-4f76-8b0e-8b40c61bdc52' WHERE id = '3e0d0f3e-75f4-4efa-8244-9e1b5f4d2230';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('cbfe38c3-f657-4289-af9f-c1e0c031f337', '65a4a380-e7b1-4f76-8b0e-8b40c61bdc52', 'pix', 7300.0, '2026-05-31', '97f12885-87ad-426a-8bbb-656889d82e10', 1, '2026-05-31T14:00:00');

-- LINHA 361 [NAO]: JBL BOOMBOX 4 PRETO NOVO (31/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('f69d30cd-bc22-4301-82f2-188af2b5b7b8', 'Outros', 'JBL BOOMBOX 4 PRETO NOVO', 'TL1876-CQ0217088', 2434.0, 2190.0, 19, 'novo', 'perfeito', 'vendido', '2026-05-31', '2026-05-31', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-31', '2026-05-31', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('05c90a23-6bde-4b24-9f17-c6aa8ca489b5', current_setting('importacao.proximo_numero')::int + 358, current_setting('importacao.cliente_id')::uuid, 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 2434.0, 2434.0, 0.0, '2026-05-31', '2026-05-31', '97f12885-87ad-426a-8bbb-656889d82e10');
UPDATE aparelhos SET venda_id = '05c90a23-6bde-4b24-9f17-c6aa8ca489b5' WHERE id = 'f69d30cd-bc22-4301-82f2-188af2b5b7b8';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('4ec8c36f-88bd-482a-931b-9d3e513793be', '05c90a23-6bde-4b24-9f17-c6aa8ca489b5', 'pix', 2290.0, '2026-05-31', '97f12885-87ad-426a-8bbb-656889d82e10', 1, '2026-05-31T14:00:00');
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('287c038a-4447-4e45-80be-1adabf138c92', '05c90a23-6bde-4b24-9f17-c6aa8ca489b5', 'cartao_credito', 144.0, '2026-05-31', '97f12885-87ad-426a-8bbb-656889d82e10', 1, '2026-05-31T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('3cfd1a51-abc4-40a8-9a06-de0d21b1e65a', 19, '05c90a23-6bde-4b24-9f17-c6aa8ca489b5', 'Brinde', 95.0, '2026-05-31', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-31');

-- LINHA 362 [NAO]: JBL BOOMBOX 4 BRANCA NOVO (31/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('71a1a9b9-84fa-468d-b0ad-35a6deb9b304', 'Outros', 'JBL BOOMBOX 4 BRANCA NOVO', 'TL1878-LP0013380', 2276.0, 2190.0, 19, 'novo', 'perfeito', 'vendido', '2026-05-31', '2026-05-31', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-31', '2026-05-31', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('ed386b2d-39ed-4cd1-a3b7-d56154e3d9a7', current_setting('importacao.proximo_numero')::int + 359, current_setting('importacao.cliente_id')::uuid, 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 2276.0, 2276.0, 0.0, '2026-05-31', '2026-05-31', '97f12885-87ad-426a-8bbb-656889d82e10');
UPDATE aparelhos SET venda_id = 'ed386b2d-39ed-4cd1-a3b7-d56154e3d9a7' WHERE id = '71a1a9b9-84fa-468d-b0ad-35a6deb9b304';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('b6db90ae-0b11-4763-9a5a-df6bc04102f5', 'ed386b2d-39ed-4cd1-a3b7-d56154e3d9a7', 'cartao_credito', 2276.0, '2026-05-31', '97f12885-87ad-426a-8bbb-656889d82e10', 1, '2026-05-31T14:00:00');

-- LINHA 363 [NAO]: PENCIL PRO NOVO (31/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('3dbeb12c-ee13-47da-915a-f9a78eaedbcf', 'Outros', 'PENCIL PRO NOVO', 'CTV20GVQFL', 870.0, 710.0, 1, 'novo', 'perfeito', 'vendido', '2026-05-31', '2026-05-31', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-31', '2026-05-31', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('1ec6f288-cc7c-4d57-858b-60ca0a38ccde', current_setting('importacao.proximo_numero')::int + 360, current_setting('importacao.cliente_id')::uuid, 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 870.0, 870.0, 0.0, '2026-05-31', '2026-05-31', '85e3aa42-b9af-49b8-a72a-64e9c337aa53');
UPDATE aparelhos SET venda_id = '1ec6f288-cc7c-4d57-858b-60ca0a38ccde' WHERE id = '3dbeb12c-ee13-47da-915a-f9a78eaedbcf';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('691886e0-64c1-422d-b2ba-ef7cc067eeaa', '1ec6f288-cc7c-4d57-858b-60ca0a38ccde', 'pix', 870.0, '2026-05-31', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 1, '2026-05-31T14:00:00');

-- LINHA 364 [NAO]: IPHONE 13 128GB ROSA SEMINOVO (31/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('3b996a74-ada6-4222-abca-e4ef89fc4884', 'Apple', 'IPHONE 13 128GB ROSA SEMINOVO', '355958936427210', 2147.0, 1750.0, 1, 'seminovo', 'bom', 'vendido', '2026-05-31', '2026-05-31', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-31', '2026-05-31', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('cd67c3be-9a4b-40c4-a39b-5e43c729c184', current_setting('importacao.proximo_numero')::int + 361, current_setting('importacao.cliente_id')::uuid, 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 2147.0, 2147.0, 0.0, '2026-05-31', '2026-05-31', '85e3aa42-b9af-49b8-a72a-64e9c337aa53');
UPDATE aparelhos SET venda_id = 'cd67c3be-9a4b-40c4-a39b-5e43c729c184' WHERE id = '3b996a74-ada6-4222-abca-e4ef89fc4884';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('03e31eaa-6b52-4ba0-a9af-7941dce3dcbf', 'cd67c3be-9a4b-40c4-a39b-5e43c729c184', 'pix', 2147.0, '2026-05-31', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 1, '2026-05-31T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('3dbb680e-fa1e-4abb-8eb7-e769b6355623', 1, 'cd67c3be-9a4b-40c4-a39b-5e43c729c184', 'Brinde', 25.0, '2026-05-31', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-31');

-- LINHA 365 [NAO]: IPHONE 17 PRO MAX 256GB AZUL NOVO (31/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('be4e4282-e2df-4976-b7bf-44a9910f04c9', 'Apple', 'IPHONE 17 PRO MAX 256GB AZUL NOVO', '355988219255368', 7618.0, 7230.0, 1, 'novo', 'perfeito', 'vendido', '2026-05-31', '2026-05-31', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-31', '2026-05-31', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('836de4c5-5cd7-466b-8444-996c47b05115', current_setting('importacao.proximo_numero')::int + 362, current_setting('importacao.cliente_id')::uuid, 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 7618.0, 7618.0, 0.0, '2026-05-31', '2026-05-31', '85e3aa42-b9af-49b8-a72a-64e9c337aa53');
UPDATE aparelhos SET venda_id = '836de4c5-5cd7-466b-8444-996c47b05115' WHERE id = 'be4e4282-e2df-4976-b7bf-44a9910f04c9';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('f8138818-2819-4101-b5c5-277326f92b8b', '836de4c5-5cd7-466b-8444-996c47b05115', 'pix', 5168.0, '2026-05-31', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 1, '2026-05-31T14:00:00');
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, observacao, parcelas, criado_em)
VALUES ('3c1aed50-0a46-4cfa-b66c-16193f47e4ae', '836de4c5-5cd7-466b-8444-996c47b05115', 'troca_aparelho', 2450.0, '2026-05-31', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'Troca: IPH 13 PRO', 1, '2026-05-31T14:00:00');

-- LINHA 366 [SIM]: IPHONE 14 PRO 128GB BRANCO SEMINOVO (31/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('8d8989c3-377b-46b3-b7f0-1f3bc4eaf907', 'Apple', 'IPHONE 14 PRO 128GB BRANCO SEMINOVO', '352130217510063', 2900.0, 2700.0, 20, 'seminovo', 'bom', 'vendido', '2026-05-31', '2026-05-31', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', '2026-05-31', '2026-05-31', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('f62c0e5f-a991-4df9-a347-86b1f72c6e7f', current_setting('importacao.proximo_numero')::int + 363, current_setting('importacao.cliente_id')::uuid, 20, 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 'concluida', 'normal', 2900.0, 2900.0, 0.0, '2026-05-31', '2026-05-31', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4');
UPDATE aparelhos SET venda_id = 'f62c0e5f-a991-4df9-a347-86b1f72c6e7f' WHERE id = '8d8989c3-377b-46b3-b7f0-1f3bc4eaf907';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('6ef06b54-5be4-4f3d-b3c3-5aaf23f35648', 'f62c0e5f-a991-4df9-a347-86b1f72c6e7f', 'pix', 2900.0, '2026-05-31', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 1, '2026-05-31T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('49168ff1-efd6-4563-9d88-494dae928750', 20, 'f62c0e5f-a991-4df9-a347-86b1f72c6e7f', 'Brinde', 5.0, '2026-05-31', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', '2026-05-31');

-- LINHA 367 [NAO]: IPHONE 11 64GB PRETO SEMINOVO (31/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('8d19f307-4bf1-43cb-9aac-1eda47a94dcc', 'Apple', 'IPHONE 11 64GB PRETO SEMINOVO', '357879829564513', 850.0, 600.0, 1, 'seminovo', 'bom', 'vendido', '2026-05-31', '2026-05-31', 'e07d4d35-1381-4d4d-914d-8382a7456fdd', '2026-05-31', '2026-05-31', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('1e194e8c-031c-4013-915c-0d84f3915614', current_setting('importacao.proximo_numero')::int + 364, current_setting('importacao.cliente_id')::uuid, 1, 'e07d4d35-1381-4d4d-914d-8382a7456fdd', 'concluida', 'normal', 850.0, 850.0, 0.0, '2026-05-31', '2026-05-31', 'e07d4d35-1381-4d4d-914d-8382a7456fdd');
UPDATE aparelhos SET venda_id = '1e194e8c-031c-4013-915c-0d84f3915614' WHERE id = '8d19f307-4bf1-43cb-9aac-1eda47a94dcc';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('88c8a3b7-5c11-48ce-bef8-fafd78aeaf35', '1e194e8c-031c-4013-915c-0d84f3915614', 'pix', 850.0, '2026-05-31', 'e07d4d35-1381-4d4d-914d-8382a7456fdd', 1, '2026-05-31T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('7090cf14-50f4-432a-a7ed-3b1fb099424d', 1, '1e194e8c-031c-4013-915c-0d84f3915614', 'Brinde', 25.0, '2026-05-31', 'e07d4d35-1381-4d4d-914d-8382a7456fdd', '2026-05-31');

-- LINHA 368 [NAO]: IPHONE 14 PRO 128GB BRANCO SEMINOVO (31/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('6e983e62-00d7-4b86-8856-f8259e6e84b6', 'Apple', 'IPHONE 14 PRO 128GB BRANCO SEMINOVO', '351284081590783', 2950.0, 2700.0, 20, 'seminovo', 'bom', 'vendido', '2026-05-31', '2026-05-31', '25e2da5b-9e76-4388-9890-7e22efd6940d', '2026-05-31', '2026-05-31', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('edb6b631-0234-4149-9dde-2c335be380cd', current_setting('importacao.proximo_numero')::int + 365, current_setting('importacao.cliente_id')::uuid, 20, '25e2da5b-9e76-4388-9890-7e22efd6940d', 'concluida', 'normal', 2950.0, 2950.0, 0.0, '2026-05-31', '2026-05-31', '25e2da5b-9e76-4388-9890-7e22efd6940d');
UPDATE aparelhos SET venda_id = 'edb6b631-0234-4149-9dde-2c335be380cd' WHERE id = '6e983e62-00d7-4b86-8856-f8259e6e84b6';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('44ff87b0-35c7-4c02-8f10-aa7a1b23899f', 'edb6b631-0234-4149-9dde-2c335be380cd', 'pix', 2950.0, '2026-05-31', '25e2da5b-9e76-4388-9890-7e22efd6940d', 1, '2026-05-31T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('5dce4c4d-6935-4981-bc52-c522ed71a82e', 20, 'edb6b631-0234-4149-9dde-2c335be380cd', 'Brinde', 25.0, '2026-05-31', '25e2da5b-9e76-4388-9890-7e22efd6940d', '2026-05-31');

-- LINHA 369 [SIM]: POCO X7 PRO 512GB PRETO NOVO (31/05/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('3ece9861-f559-4432-a013-c17b82aaea9c', 'Outros', 'POCO X7 PRO 512GB PRETO NOVO', '869471083132525', 2190.0, 1990.0, 20, 'novo', 'perfeito', 'vendido', '2026-05-31', '2026-05-31', '25e2da5b-9e76-4388-9890-7e22efd6940d', '2026-05-31', '2026-05-31', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('f0153f3e-1444-4f69-acb4-36f603571190', current_setting('importacao.proximo_numero')::int + 366, current_setting('importacao.cliente_id')::uuid, 20, '25e2da5b-9e76-4388-9890-7e22efd6940d', 'concluida', 'normal', 2190.0, 2190.0, 0.0, '2026-05-31', '2026-05-31', '25e2da5b-9e76-4388-9890-7e22efd6940d');
UPDATE aparelhos SET venda_id = 'f0153f3e-1444-4f69-acb4-36f603571190' WHERE id = '3ece9861-f559-4432-a013-c17b82aaea9c';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('b1fc1389-2507-4a9b-8a6f-f96967e0cebb', 'f0153f3e-1444-4f69-acb4-36f603571190', 'pix', 2190.0, '2026-05-31', '25e2da5b-9e76-4388-9890-7e22efd6940d', 1, '2026-05-31T14:00:00');

-- LINHA 370 [NAO]: GALAXY A11+ 5G SPACE GRAY 128GB NOVO (02/06/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('956bad59-17b1-4758-96f1-6d7123b8c7c2', 'Outros', 'GALAXY A11+ 5G SPACE GRAY 128GB NOVO', '356911420294546', 2180.0, 1700.0, 1, 'novo', 'perfeito', 'vendido', '2026-06-02', '2026-06-02', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-06-02', '2026-06-02', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('8a13ded4-b5ec-498a-84c7-d4656845c7f2', current_setting('importacao.proximo_numero')::int + 367, current_setting('importacao.cliente_id')::uuid, 1, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 2180.0, 2180.0, 0.0, '2026-06-02', '2026-06-02', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
UPDATE aparelhos SET venda_id = '8a13ded4-b5ec-498a-84c7-d4656845c7f2' WHERE id = '956bad59-17b1-4758-96f1-6d7123b8c7c2';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('6014acff-eb5b-4d41-a452-2dd6e155aefa', '8a13ded4-b5ec-498a-84c7-d4656845c7f2', 'pix', 2180.0, '2026-06-02', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1, '2026-06-02T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('c73efced-5f36-4743-8d4e-5cb2e73bae53', 1, '8a13ded4-b5ec-498a-84c7-d4656845c7f2', 'Brinde', 170.0, '2026-06-02', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-06-02');

-- LINHA 371 [SIM]: IPHONE 17 PRO MAX 256GB AZUL NOVO (02/06/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('4b78ceef-3d78-4f38-9908-46d65e98777a', 'Apple', 'IPHONE 17 PRO MAX 256GB AZUL NOVO', '355101476201071', 7464.0, 7250.0, 4, 'novo', 'perfeito', 'vendido', '2026-06-02', '2026-06-02', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-06-02', '2026-06-02', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('e87ba30d-9e32-4112-99aa-2182f6eb45b9', current_setting('importacao.proximo_numero')::int + 368, current_setting('importacao.cliente_id')::uuid, 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 7464.0, 7464.0, 0.0, '2026-06-02', '2026-06-02', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
UPDATE aparelhos SET venda_id = 'e87ba30d-9e32-4112-99aa-2182f6eb45b9' WHERE id = '4b78ceef-3d78-4f38-9908-46d65e98777a';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('b217d0ee-a529-45be-86ef-c1ec7b8585a6', 'e87ba30d-9e32-4112-99aa-2182f6eb45b9', 'pix', 7464.0, '2026-06-02', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1, '2026-06-02T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('628489ff-bcf4-468f-8559-b31a8fa249c1', 4, 'e87ba30d-9e32-4112-99aa-2182f6eb45b9', 'Brinde', 30.0, '2026-06-02', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-06-02');

-- LINHA 372 [NAO]: IPHONE 14 PRO 256GB PRETO SEMINOVO (02/06/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('221cd843-c9fb-4474-89f0-aa9be65a6b5a', 'Apple', 'IPHONE 14 PRO 256GB PRETO SEMINOVO', NULL, 3050.0, 2900.0, 20, 'seminovo', 'bom', 'vendido', '2026-06-02', '2026-06-02', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', '2026-06-02', '2026-06-02', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('5b57e137-e3fe-4bdf-aaff-e30c5632968f', current_setting('importacao.proximo_numero')::int + 369, current_setting('importacao.cliente_id')::uuid, 20, 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 'concluida', 'normal', 3050.0, 3050.0, 0.0, '2026-06-02', '2026-06-02', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4');
UPDATE aparelhos SET venda_id = '5b57e137-e3fe-4bdf-aaff-e30c5632968f' WHERE id = '221cd843-c9fb-4474-89f0-aa9be65a6b5a';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('76198141-7189-42e7-9c02-5f6e51677592', '5b57e137-e3fe-4bdf-aaff-e30c5632968f', 'pix', 1734.0, '2026-06-02', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 1, '2026-06-02T14:00:00');
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('34aab9f4-d5ce-4169-a971-560fc4336bfe', '5b57e137-e3fe-4bdf-aaff-e30c5632968f', 'cartao_credito', 1316.0, '2026-06-02', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 1, '2026-06-02T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('027b7094-5beb-44ee-a6df-42fdba500f76', 20, '5b57e137-e3fe-4bdf-aaff-e30c5632968f', 'Brinde', 10.0, '2026-06-02', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', '2026-06-02');

-- LINHA 373 [SIM]: IPHONE 13 PRO 256GB DOURADO SEMIINOVO (02/06/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('61d3ea32-a0d2-4265-87b2-2e1882053731', 'Apple', 'IPHONE 13 PRO 256GB DOURADO SEMIINOVO', '352725357604046', 2700.0, 2400.0, 19, 'novo', 'perfeito', 'vendido', '2026-06-02', '2026-06-02', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-06-02', '2026-06-02', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('1cceeeaf-ad46-47e4-bfac-85fad139685d', current_setting('importacao.proximo_numero')::int + 370, current_setting('importacao.cliente_id')::uuid, 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 2700.0, 2700.0, 0.0, '2026-06-02', '2026-06-02', '97f12885-87ad-426a-8bbb-656889d82e10');
UPDATE aparelhos SET venda_id = '1cceeeaf-ad46-47e4-bfac-85fad139685d' WHERE id = '61d3ea32-a0d2-4265-87b2-2e1882053731';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('b42e04dd-c4f3-428b-b211-fdf4dd4c2bfb', '1cceeeaf-ad46-47e4-bfac-85fad139685d', 'pix', 2700.0, '2026-06-02', '97f12885-87ad-426a-8bbb-656889d82e10', 1, '2026-06-02T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('ea18ad67-249e-41bb-9f6d-5cce872f8387', 19, '1cceeeaf-ad46-47e4-bfac-85fad139685d', 'Brinde', 25.0, '2026-06-02', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-06-02');

-- LINHA 374 [NAO]: MAGIC MOUSE 3 BRANCO NOVO (02/06/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('0a727367-f9a6-47d0-93bb-57c10993f3d4', 'Outros', 'MAGIC MOUSE 3 BRANCO NOVO', 'J84HN004QLB0000539', 760.0, 660.0, 19, 'novo', 'perfeito', 'vendido', '2026-06-02', '2026-06-02', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-06-02', '2026-06-02', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('c3e32c9c-853a-48c0-8e0d-d0fd8e34a7f4', current_setting('importacao.proximo_numero')::int + 371, current_setting('importacao.cliente_id')::uuid, 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 760.0, 760.0, 0.0, '2026-06-02', '2026-06-02', '97f12885-87ad-426a-8bbb-656889d82e10');
UPDATE aparelhos SET venda_id = 'c3e32c9c-853a-48c0-8e0d-d0fd8e34a7f4' WHERE id = '0a727367-f9a6-47d0-93bb-57c10993f3d4';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('7637f469-d055-4d1a-abff-13633fc5f4ac', 'c3e32c9c-853a-48c0-8e0d-d0fd8e34a7f4', 'pix', 760.0, '2026-06-02', '97f12885-87ad-426a-8bbb-656889d82e10', 1, '2026-06-02T14:00:00');

-- LINHA 375 [NAO]: IPHONE 17 PRO MAX 256GB SILVER NOVO (02/06/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('6603ddfe-b265-4b7f-8e04-b7f134f3a236', 'Apple', 'IPHONE 17 PRO MAX 256GB SILVER NOVO', '357247257394938', 7750.0, 7500.0, 19, 'novo', 'perfeito', 'vendido', '2026-06-02', '2026-06-02', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-06-02', '2026-06-02', 'Pagto junto (Aparelho 1/2, total grupo R$ 15,500)');
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('ff8c98a7-03d2-4641-a430-143bc00aeaeb', current_setting('importacao.proximo_numero')::int + 372, current_setting('importacao.cliente_id')::uuid, 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 7750.0, 7750.0, 0.0, '2026-06-02', '2026-06-02', '97f12885-87ad-426a-8bbb-656889d82e10');
UPDATE aparelhos SET venda_id = 'ff8c98a7-03d2-4641-a430-143bc00aeaeb' WHERE id = '6603ddfe-b265-4b7f-8e04-b7f134f3a236';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('1d439b67-8a35-455a-92d4-ad523f0a88e0', 'ff8c98a7-03d2-4641-a430-143bc00aeaeb', 'dinheiro', 7750.0, '2026-06-02', '97f12885-87ad-426a-8bbb-656889d82e10', 1, '2026-06-02T14:00:00');

-- LINHA 376 [NAO]: IPHONE 17 PRO MAX 256GB SILVER NOVO (02/06/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('27bf276e-2699-403e-b839-41183242165d', 'Apple', 'IPHONE 17 PRO MAX 256GB SILVER NOVO', '357247256875010', 7750.0, 7500.0, 19, 'novo', 'perfeito', 'vendido', '2026-06-02', '2026-06-02', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-06-02', '2026-06-02', 'Pagto junto (Aparelho 2/2, total grupo R$ 15,500)');
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('5fbdd2d5-ce02-49ca-9fdd-c74b1afdd523', current_setting('importacao.proximo_numero')::int + 373, current_setting('importacao.cliente_id')::uuid, 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 7750.0, 7750.0, 0.0, '2026-06-02', '2026-06-02', '97f12885-87ad-426a-8bbb-656889d82e10');
UPDATE aparelhos SET venda_id = '5fbdd2d5-ce02-49ca-9fdd-c74b1afdd523' WHERE id = '27bf276e-2699-403e-b839-41183242165d';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('3ccc6cde-018b-4ffa-8f70-ad6b60031eba', '5fbdd2d5-ce02-49ca-9fdd-c74b1afdd523', 'dinheiro', 1450.0, '2026-06-02', '97f12885-87ad-426a-8bbb-656889d82e10', 1, '2026-06-02T14:00:00');
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, observacao, parcelas, criado_em)
VALUES ('60abd831-c722-4398-b266-85a120deb851', '5fbdd2d5-ce02-49ca-9fdd-c74b1afdd523', 'troca_aparelho', 6300.0, '2026-06-02', '97f12885-87ad-426a-8bbb-656889d82e10', 'Troca: IPH 17 PRO SILVER', 1, '2026-06-02T14:00:00');

-- LINHA 377 [NAO]: BOOMBOX 4 BRANCA NOVA (03/06/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('b15e2219-39b1-4c6f-a939-4ae79b2fdb6f', 'Outros', 'BOOMBOX 4 BRANCA NOVA', 'TL1878-AQ0021235', 2405.0, 2250.0, 4, 'seminovo', 'bom', 'vendido', '2026-06-03', '2026-06-03', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-06-03', '2026-06-03', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('1a744875-407a-4209-a262-a8b09e74a3cd', current_setting('importacao.proximo_numero')::int + 374, current_setting('importacao.cliente_id')::uuid, 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 2405.0, 2405.0, 0.0, '2026-06-03', '2026-06-03', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
UPDATE aparelhos SET venda_id = '1a744875-407a-4209-a262-a8b09e74a3cd' WHERE id = 'b15e2219-39b1-4c6f-a939-4ae79b2fdb6f';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('14dba8be-08ff-4e2b-bff4-b43a2c0ba50c', '1a744875-407a-4209-a262-a8b09e74a3cd', 'cartao_credito', 2405.0, '2026-06-03', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1, '2026-06-03T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('4df72ff2-2c57-490f-81a1-da13b2573896', 4, '1a744875-407a-4209-a262-a8b09e74a3cd', 'Brinde', 20.0, '2026-06-03', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-06-03');

-- LINHA 378 [NAO]: IPHONE 12 PRO MAX 128GB GRAFITE SEMINOVO (03/06/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('0f1366af-ecf4-4086-b6b6-8681b5c72c73', 'Apple', 'IPHONE 12 PRO MAX 128GB GRAFITE SEMINOVO', '351330881416677', 2250.0, 2000.0, 1, 'seminovo', 'bom', 'vendido', '2026-06-03', '2026-06-03', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-06-03', '2026-06-03', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('5bb00d7f-267c-4770-8691-f990e6b29273', current_setting('importacao.proximo_numero')::int + 375, current_setting('importacao.cliente_id')::uuid, 1, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 2250.0, 2250.0, 0.0, '2026-06-03', '2026-06-03', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
UPDATE aparelhos SET venda_id = '5bb00d7f-267c-4770-8691-f990e6b29273' WHERE id = '0f1366af-ecf4-4086-b6b6-8681b5c72c73';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('3e1aaea9-cf90-413a-b805-d6941dd044ac', '5bb00d7f-267c-4770-8691-f990e6b29273', 'pix', 2250.0, '2026-06-03', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1, '2026-06-03T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('def46ad9-7489-47d3-a643-b3d5e51f05c4', 1, '5bb00d7f-267c-4770-8691-f990e6b29273', 'Brinde', 25.0, '2026-06-03', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-06-03');

-- LINHA 379 [NAO]: IPHONE 16 PRO MAX 512GB PRETO SEMINOVO (03/06/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('700d4766-f91b-4ba0-b3f4-ffdd301548e4', 'Apple', 'IPHONE 16 PRO MAX 512GB PRETO SEMINOVO', '355300181430419', 6049.0, 5150.0, 4, 'seminovo', 'bom', 'vendido', '2026-06-03', '2026-06-03', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-06-03', '2026-06-03', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('9bc0fcad-6492-4b5d-8bc3-69c1f82cde56', current_setting('importacao.proximo_numero')::int + 376, current_setting('importacao.cliente_id')::uuid, 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 6049.0, 6049.0, 0.0, '2026-06-03', '2026-06-03', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
UPDATE aparelhos SET venda_id = '9bc0fcad-6492-4b5d-8bc3-69c1f82cde56' WHERE id = '700d4766-f91b-4ba0-b3f4-ffdd301548e4';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('249484d1-9c05-40d3-8f4c-ca2d05210839', '9bc0fcad-6492-4b5d-8bc3-69c1f82cde56', 'cartao_credito', 6049.0, '2026-06-03', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1, '2026-06-03T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('1d8413f6-f937-4d93-887a-016d71de9763', 4, '9bc0fcad-6492-4b5d-8bc3-69c1f82cde56', 'Brinde', 90.0, '2026-06-03', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-06-03');

-- LINHA 380 [SIM]: IPHONE 15 PRO MAX 256GB SEMINOVO (03/06/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('7c2db16b-6c8c-47f4-8049-1eda0a36992e', 'Apple', 'IPHONE 15 PRO MAX 256GB SEMINOVO', '356371488105219', 4010.0, 3700.0, 4, 'seminovo', 'bom', 'vendido', '2026-06-03', '2026-06-03', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-06-03', '2026-06-03', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('28aa10df-ae74-4f3b-80d7-60e7176a2182', current_setting('importacao.proximo_numero')::int + 377, current_setting('importacao.cliente_id')::uuid, 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 4010.0, 4010.0, 0.0, '2026-06-03', '2026-06-03', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
UPDATE aparelhos SET venda_id = '28aa10df-ae74-4f3b-80d7-60e7176a2182' WHERE id = '7c2db16b-6c8c-47f4-8049-1eda0a36992e';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('c88dc8b2-6bc0-4fc2-98cd-96cba01f0576', '28aa10df-ae74-4f3b-80d7-60e7176a2182', 'pix', 4010.0, '2026-06-03', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1, '2026-06-03T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('d95a301a-faa5-4de0-abd3-9ac01538d527', 4, '28aa10df-ae74-4f3b-80d7-60e7176a2182', 'Brinde', 33.0, '2026-06-03', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-06-03');

-- LINHA 381 [NAO]: NOTE 15 PRO 5G 256GB PRETO NOVO (03/06/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('4e46718d-ceac-44b3-ba1f-eafd830a2614', 'Redmi', 'NOTE 15 PRO 5G 256GB PRETO NOVO', '863573083678542', 1857.0, 1680.0, 4, 'novo', 'perfeito', 'vendido', '2026-06-03', '2026-06-03', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-06-03', '2026-06-03', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('1e901c72-a3c0-4d2f-9b81-c72b0cb56d76', current_setting('importacao.proximo_numero')::int + 378, current_setting('importacao.cliente_id')::uuid, 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 1857.0, 1857.0, 0.0, '2026-06-03', '2026-06-03', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
UPDATE aparelhos SET venda_id = '1e901c72-a3c0-4d2f-9b81-c72b0cb56d76' WHERE id = '4e46718d-ceac-44b3-ba1f-eafd830a2614';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('6faae2ac-220d-4cf6-9b1e-d552c054dd48', '1e901c72-a3c0-4d2f-9b81-c72b0cb56d76', 'cartao_credito', 1857.0, '2026-06-03', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1, '2026-06-03T14:00:00');

-- LINHA 382 [NAO]: IPHONE 15 PRO MAX 256GB PRETO SEMINOVO (03/06/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('1b18e585-d6be-45e4-81fc-faa5d2c76b33', 'Apple', 'IPHONE 15 PRO MAX 256GB PRETO SEMINOVO', '357275797266613', 4140.0, 3700.0, 19, 'seminovo', 'bom', 'vendido', '2026-06-03', '2026-06-03', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-06-03', '2026-06-03', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('fb517759-e458-472f-96ee-f261c160efbb', current_setting('importacao.proximo_numero')::int + 379, current_setting('importacao.cliente_id')::uuid, 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 4140.0, 4140.0, 0.0, '2026-06-03', '2026-06-03', '97f12885-87ad-426a-8bbb-656889d82e10');
UPDATE aparelhos SET venda_id = 'fb517759-e458-472f-96ee-f261c160efbb' WHERE id = '1b18e585-d6be-45e4-81fc-faa5d2c76b33';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('d868a964-2795-4a3c-9e54-e6317b14c6d0', 'fb517759-e458-472f-96ee-f261c160efbb', 'cartao_credito', 4140.0, '2026-06-03', '97f12885-87ad-426a-8bbb-656889d82e10', 1, '2026-06-03T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('27685a09-52a8-45a2-bf88-a5e2b572eb00', 19, 'fb517759-e458-472f-96ee-f261c160efbb', 'Brinde', 40.0, '2026-06-03', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-06-03');

-- LINHA 383 [SIM]: IPHONE 17 PRO MAX 256GB SILVER NOVO (03/06/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('ece750f4-4a1f-4949-8ead-664940d6352d', 'Apple', 'IPHONE 17 PRO MAX 256GB SILVER NOVO', '351668140730168', 7750.0, 7550.0, 19, 'novo', 'perfeito', 'vendido', '2026-06-03', '2026-06-03', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-06-03', '2026-06-03', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('ea975cdd-b322-4c16-9a28-ca66d63410ab', current_setting('importacao.proximo_numero')::int + 380, current_setting('importacao.cliente_id')::uuid, 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 7750.0, 7750.0, 0.0, '2026-06-03', '2026-06-03', '97f12885-87ad-426a-8bbb-656889d82e10');
UPDATE aparelhos SET venda_id = 'ea975cdd-b322-4c16-9a28-ca66d63410ab' WHERE id = 'ece750f4-4a1f-4949-8ead-664940d6352d';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('0f6d8fa4-7088-4214-b53a-ecba68186fcb', 'ea975cdd-b322-4c16-9a28-ca66d63410ab', 'pix', 7750.0, '2026-06-03', '97f12885-87ad-426a-8bbb-656889d82e10', 1, '2026-06-03T14:00:00');

-- LINHA 384 [NAO]: POCO PAD M1 256GB PRETO NOVO (03/06/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('58670483-b77c-4f9d-b58a-88fa23df665c', 'Outros', 'POCO PAD M1 256GB PRETO NOVO', '71114/Y5XS01610', 1560.0, 1510.0, 19, 'novo', 'perfeito', 'vendido', '2026-06-03', '2026-06-03', 'b4269e60-eea2-4eba-a34d-db9591e0ec83', '2026-06-03', '2026-06-03', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('814fba3b-fde1-443d-9c1a-aa634509dcb2', current_setting('importacao.proximo_numero')::int + 381, current_setting('importacao.cliente_id')::uuid, 19, 'b4269e60-eea2-4eba-a34d-db9591e0ec83', 'concluida', 'normal', 1560.0, 1560.0, 0.0, '2026-06-03', '2026-06-03', 'b4269e60-eea2-4eba-a34d-db9591e0ec83');
UPDATE aparelhos SET venda_id = '814fba3b-fde1-443d-9c1a-aa634509dcb2' WHERE id = '58670483-b77c-4f9d-b58a-88fa23df665c';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('1e2788ae-343e-4780-87d4-94a84954e377', '814fba3b-fde1-443d-9c1a-aa634509dcb2', 'pix', 1560.0, '2026-06-03', 'b4269e60-eea2-4eba-a34d-db9591e0ec83', 1, '2026-06-03T14:00:00');

-- LINHA 385 [NAO]: GALAXY A36 256GB PRETO NOVO (03/06/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('fb5c650e-cbd9-4289-8cb5-3d37f69c3859', 'Outros', 'GALAXY A36 256GB PRETO NOVO', '352230462132793', 1514.0, 1420.0, 20, 'novo', 'perfeito', 'vendido', '2026-06-03', '2026-06-03', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', '2026-06-03', '2026-06-03', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('c07fc129-c208-4d76-9219-955c3ecbc638', current_setting('importacao.proximo_numero')::int + 382, current_setting('importacao.cliente_id')::uuid, 20, 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 'concluida', 'normal', 1514.0, 1514.0, 0.0, '2026-06-03', '2026-06-03', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4');
UPDATE aparelhos SET venda_id = 'c07fc129-c208-4d76-9219-955c3ecbc638' WHERE id = 'fb5c650e-cbd9-4289-8cb5-3d37f69c3859';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('1722f2b3-4e43-4641-8792-b1efd1793805', 'c07fc129-c208-4d76-9219-955c3ecbc638', 'cartao_credito', 1514.0, '2026-06-03', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 1, '2026-06-03T14:00:00');

-- LINHA 386 [NAO]: T-REX 3 PRO PRETO NOVO (03/06/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('de4c1266-d798-49bd-9901-1479186a8dc3', 'Outros', 'T-REX 3 PRO PRETO NOVO', '24449537045774', 1899.0, 1800.0, 20, 'novo', 'perfeito', 'vendido', '2026-06-03', '2026-06-03', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', '2026-06-03', '2026-06-03', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('087c8a02-f30c-4119-9b16-34ed9d4bff01', current_setting('importacao.proximo_numero')::int + 383, current_setting('importacao.cliente_id')::uuid, 20, 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 'concluida', 'normal', 1899.0, 1899.0, 0.0, '2026-06-03', '2026-06-03', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4');
UPDATE aparelhos SET venda_id = '087c8a02-f30c-4119-9b16-34ed9d4bff01' WHERE id = 'de4c1266-d798-49bd-9901-1479186a8dc3';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('23671c85-ac96-4ff6-b9c2-c97232775f2e', '087c8a02-f30c-4119-9b16-34ed9d4bff01', 'pix', 1899.0, '2026-06-03', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 1, '2026-06-03T14:00:00');

-- LINHA 387 [NAO]: IPHONE 14 128GB AZUL SEMINOVO (03/06/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('0768eea9-dceb-4cca-8ef3-7d91298aac1f', 'Apple', 'IPHONE 14 128GB AZUL SEMINOVO', '355536442174276', 2240.0, 1900.0, 20, 'seminovo', 'bom', 'vendido', '2026-06-03', '2026-06-03', '25e2da5b-9e76-4388-9890-7e22efd6940d', '2026-06-03', '2026-06-03', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('d1ddc507-9301-4d55-9247-f21182f9d044', current_setting('importacao.proximo_numero')::int + 384, current_setting('importacao.cliente_id')::uuid, 20, '25e2da5b-9e76-4388-9890-7e22efd6940d', 'concluida', 'normal', 2240.0, 2240.0, 0.0, '2026-06-03', '2026-06-03', '25e2da5b-9e76-4388-9890-7e22efd6940d');
UPDATE aparelhos SET venda_id = 'd1ddc507-9301-4d55-9247-f21182f9d044' WHERE id = '0768eea9-dceb-4cca-8ef3-7d91298aac1f';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('16212bfa-55b3-4ee0-b869-5ee12cccf0e0', 'd1ddc507-9301-4d55-9247-f21182f9d044', 'cartao_credito', 2240.0, '2026-06-03', '25e2da5b-9e76-4388-9890-7e22efd6940d', 1, '2026-06-03T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('dda36094-72e9-40c0-937d-fb8d169482d3', 20, 'd1ddc507-9301-4d55-9247-f21182f9d044', 'Brinde', 25.0, '2026-06-03', '25e2da5b-9e76-4388-9890-7e22efd6940d', '2026-06-03');

-- LINHA 388 [SIM]: IPHONE 17 PRO 256GB SILVER NOVO (04/06/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('bc0f6d1d-463d-4946-ac7e-16e8b161b348', 'Apple', 'IPHONE 17 PRO 256GB SILVER NOVO', '357679992297861', 7370.0, 6950.0, 4, 'novo', 'perfeito', 'vendido', '2026-06-04', '2026-06-04', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-06-04', '2026-06-04', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('56e9e966-7a10-42af-a06c-62e330184f78', current_setting('importacao.proximo_numero')::int + 385, current_setting('importacao.cliente_id')::uuid, 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 7370.0, 7370.0, 0.0, '2026-06-04', '2026-06-04', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
UPDATE aparelhos SET venda_id = '56e9e966-7a10-42af-a06c-62e330184f78' WHERE id = 'bc0f6d1d-463d-4946-ac7e-16e8b161b348';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('df06c874-77fb-4cd2-abc0-f8c5ab98d59f', '56e9e966-7a10-42af-a06c-62e330184f78', 'pix', 7370.0, '2026-06-04', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1, '2026-06-04T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('a374f77c-126f-44c7-a47f-64a20a08bfa6', 4, '56e9e966-7a10-42af-a06c-62e330184f78', 'Brinde', 30.0, '2026-06-04', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-06-04');

-- LINHA 389 [NAO]: IPHONE 15 128GB AZUL SEMINOVO (04/06/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('b33b72d0-9f25-4d4b-a1da-75f785ba40af', 'Apple', 'IPHONE 15 128GB AZUL SEMINOVO', '351698471567244', 2900.0, 2660.0, 4, 'seminovo', 'bom', 'vendido', '2026-06-04', '2026-06-04', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-06-04', '2026-06-04', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('2b0f9821-fe53-43db-9fb7-140c6c17af61', current_setting('importacao.proximo_numero')::int + 386, current_setting('importacao.cliente_id')::uuid, 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 2900.0, 2900.0, 0.0, '2026-06-04', '2026-06-04', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
UPDATE aparelhos SET venda_id = '2b0f9821-fe53-43db-9fb7-140c6c17af61' WHERE id = 'b33b72d0-9f25-4d4b-a1da-75f785ba40af';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('b68254f8-c159-4bb2-aa39-27091847bc94', '2b0f9821-fe53-43db-9fb7-140c6c17af61', 'pix', 1450.0, '2026-06-04', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1, '2026-06-04T14:00:00');
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, observacao, parcelas, criado_em)
VALUES ('10868bdf-d0a9-4380-97b3-b0524a7b056b', '2b0f9821-fe53-43db-9fb7-140c6c17af61', 'troca_aparelho', 1450.0, '2026-06-04', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'Troca: ENTROU UM 13 SEMINOVO POR', 1, '2026-06-04T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('a3ab4245-a8da-4ae3-b620-6fbbc8b1d6f9', 4, '2b0f9821-fe53-43db-9fb7-140c6c17af61', 'Brinde', 25.0, '2026-06-04', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-06-04');

-- LINHA 390 [NAO]: IPHONE 15 PRO MAX 256GB PRETO SEMINOVO (04/06/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('8e946277-74bd-48a4-8c9f-698314c0466c', 'Apple', 'IPHONE 15 PRO MAX 256GB PRETO SEMINOVO', '351465644827966', 4400.0, 4100.0, 4, 'seminovo', 'bom', 'vendido', '2026-06-04', '2026-06-04', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-06-04', '2026-06-04', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('15a32d61-a8f0-49c2-a720-5221f8d6ae8f', current_setting('importacao.proximo_numero')::int + 387, current_setting('importacao.cliente_id')::uuid, 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 4400.0, 4400.0, 0.0, '2026-06-04', '2026-06-04', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
UPDATE aparelhos SET venda_id = '15a32d61-a8f0-49c2-a720-5221f8d6ae8f' WHERE id = '8e946277-74bd-48a4-8c9f-698314c0466c';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('9a2e853b-dc34-40d5-b589-b22086b3f1aa', '15a32d61-a8f0-49c2-a720-5221f8d6ae8f', 'pix', 2500.0, '2026-06-04', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1, '2026-06-04T14:00:00');
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, observacao, parcelas, criado_em)
VALUES ('e8d8836b-8a67-448f-a67a-9d134658fb67', '15a32d61-a8f0-49c2-a720-5221f8d6ae8f', 'troca_aparelho', 1900.0, '2026-06-04', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'Troca: ENTROU UM 14 SEMINOVO POR', 1, '2026-06-04T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('9fd26892-12c4-40ed-9bc3-370c46b6c9bc', 4, '15a32d61-a8f0-49c2-a720-5221f8d6ae8f', 'Brinde', 23.0, '2026-06-04', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-06-04');

-- LINHA 391 [NAO]: IPHONE 16 PRO MAX 256GB DESERT NOVO (04/06/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('a740333b-990d-4f96-80b2-38a0008af966', 'Apple', 'IPHONE 16 PRO MAX 256GB DESERT NOVO', '357590879692399', 5970.0, 5850.0, 20, 'novo', 'perfeito', 'vendido', '2026-06-04', '2026-06-04', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', '2026-06-04', '2026-06-04', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('c0b567f7-e184-42ae-b2f1-5fbbc239bde9', current_setting('importacao.proximo_numero')::int + 388, current_setting('importacao.cliente_id')::uuid, 20, 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 'concluida', 'normal', 5970.0, 5970.0, 0.0, '2026-06-04', '2026-06-04', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4');
UPDATE aparelhos SET venda_id = 'c0b567f7-e184-42ae-b2f1-5fbbc239bde9' WHERE id = 'a740333b-990d-4f96-80b2-38a0008af966';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('2cebd7fb-e1ef-40c0-aab3-dd69e26fadcf', 'c0b567f7-e184-42ae-b2f1-5fbbc239bde9', 'pix', 1990.0, '2026-06-04', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 1, '2026-06-04T14:00:00');
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('6d69951d-dee3-4daa-9489-870d1d55ac2f', 'c0b567f7-e184-42ae-b2f1-5fbbc239bde9', 'cartao_credito', 3980.0, '2026-06-04', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 1, '2026-06-04T14:00:00');

-- LINHA 392 [NAO]: IPHONE 14 128GB BRANCO SEMINOVO (04/06/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('df81924b-e474-411b-a858-583528e36408', 'Apple', 'IPHONE 14 128GB BRANCO SEMINOVO', '353687476380990', 2100.0, 1900.0, 20, 'seminovo', 'bom', 'vendido', '2026-06-04', '2026-06-04', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', '2026-06-04', '2026-06-04', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('265e5d09-8404-41c1-9a40-41d61a42a3cf', current_setting('importacao.proximo_numero')::int + 389, current_setting('importacao.cliente_id')::uuid, 20, 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 'concluida', 'normal', 2100.0, 2100.0, 0.0, '2026-06-04', '2026-06-04', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4');
UPDATE aparelhos SET venda_id = '265e5d09-8404-41c1-9a40-41d61a42a3cf' WHERE id = 'df81924b-e474-411b-a858-583528e36408';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('01ab92e1-b303-4e28-a8c4-40c27082da22', '265e5d09-8404-41c1-9a40-41d61a42a3cf', 'cartao_credito', 450.0, '2026-06-04', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 1, '2026-06-04T14:00:00');
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, observacao, parcelas, criado_em)
VALUES ('b58b7fa6-3aa6-4492-aadb-676376af3528', '265e5d09-8404-41c1-9a40-41d61a42a3cf', 'troca_aparelho', 1650.0, '2026-06-04', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 'Troca: IPHONE 13 AZUL 128G', 1, '2026-06-04T14:00:00');

-- LINHA 393 [NAO]: IPHONE 15 128GB ROSA SEMINOVO (04/06/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('0a5e5ae0-576d-47da-a5d2-6df2cf902bb8', 'Apple', 'IPHONE 15 128GB ROSA SEMINOVO', '353850628182660', 2950.0, 2660.0, 4, 'seminovo', 'bom', 'vendido', '2026-06-04', '2026-06-04', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-06-04', '2026-06-04', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('4749e4af-852f-4491-9681-5deb31613b12', current_setting('importacao.proximo_numero')::int + 390, current_setting('importacao.cliente_id')::uuid, 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 2950.0, 2950.0, 0.0, '2026-06-04', '2026-06-04', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
UPDATE aparelhos SET venda_id = '4749e4af-852f-4491-9681-5deb31613b12' WHERE id = '0a5e5ae0-576d-47da-a5d2-6df2cf902bb8';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('fc0263d1-1d02-4fda-b487-eb07ef6b0072', '4749e4af-852f-4491-9681-5deb31613b12', 'pix', 1000.0, '2026-06-04', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1, '2026-06-04T14:00:00');
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('a5f6ded4-46dc-4e31-b2ba-44fc0064315a', '4749e4af-852f-4491-9681-5deb31613b12', 'cartao_credito', 1950.0, '2026-06-04', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1, '2026-06-04T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('37420ee6-281e-4984-867d-ead1366a33fb', 4, '4749e4af-852f-4491-9681-5deb31613b12', 'Brinde', 35.0, '2026-06-04', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-06-04');

-- LINHA 394 [NAO]: IPHONE 17 256GB BRANCO NOVO (04/06/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('5220732f-28c4-4148-a76d-7803d80b2454', 'Apple', 'IPHONE 17 256GB BRANCO NOVO', '359973613643894', 4700.0, 4600.0, 4, 'novo', 'perfeito', 'vendido', '2026-06-04', '2026-06-04', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-06-04', '2026-06-04', 'Pagto junto (Aparelho 1/2, total grupo R$ 9,324)');
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('e42c264a-347e-44af-a5d3-dbbece9da2ac', current_setting('importacao.proximo_numero')::int + 391, current_setting('importacao.cliente_id')::uuid, 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 4700.0, 4700.0, 0.0, '2026-06-04', '2026-06-04', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
UPDATE aparelhos SET venda_id = 'e42c264a-347e-44af-a5d3-dbbece9da2ac' WHERE id = '5220732f-28c4-4148-a76d-7803d80b2454';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('33bc1e3f-42b9-46e1-92d9-9ce7284ec3ac', 'e42c264a-347e-44af-a5d3-dbbece9da2ac', 'pix', 4700.0, '2026-06-04', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1, '2026-06-04T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('ba518cdd-0d0d-45ca-89a2-c4bf261a1b77', 4, 'e42c264a-347e-44af-a5d3-dbbece9da2ac', 'Brinde', 25.0, '2026-06-04', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-06-04');

-- LINHA 395 [NAO]: IPHONE 17 256GB PRETO NOVO (04/06/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('7928a404-3a36-4161-a8e3-72353870e2b2', 'Apple', 'IPHONE 17 256GB PRETO NOVO', '351205581240124', 4624.0, 4500.0, 4, 'novo', 'perfeito', 'vendido', '2026-06-04', '2026-06-04', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-06-04', '2026-06-04', 'Pagto junto (Aparelho 2/2, total grupo R$ 9,324)');
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('33e15a78-40a7-4719-a4e9-4712b4f20d98', current_setting('importacao.proximo_numero')::int + 392, current_setting('importacao.cliente_id')::uuid, 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 4624.0, 4624.0, 0.0, '2026-06-04', '2026-06-04', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
UPDATE aparelhos SET venda_id = '33e15a78-40a7-4719-a4e9-4712b4f20d98' WHERE id = '7928a404-3a36-4161-a8e3-72353870e2b2';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('4a57af09-f1be-4991-8cd6-6b1adcbf7d14', '33e15a78-40a7-4719-a4e9-4712b4f20d98', 'pix', 4624.0, '2026-06-04', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1, '2026-06-04T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('f93ca06f-f7d3-4ad4-8e70-b7c2c3679dbb', 4, '33e15a78-40a7-4719-a4e9-4712b4f20d98', 'Brinde', 30.0, '2026-06-04', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-06-04');

-- LINHA 396 [NAO]: POCO X8 PRO MAX 512GB BRANCO NOVO (04/06/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('49dc8a63-d0ff-4f5a-97f4-263cad8a5757', 'Outros', 'POCO X8 PRO MAX 512GB BRANCO NOVO', '860534086640486', 3050.0, 2950.0, 19, 'novo', 'perfeito', 'vendido', '2026-06-04', '2026-06-04', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-06-04', '2026-06-04', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('d8624f7f-c408-485d-8d69-d987a935307d', current_setting('importacao.proximo_numero')::int + 393, current_setting('importacao.cliente_id')::uuid, 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 3050.0, 3050.0, 0.0, '2026-06-04', '2026-06-04', '97f12885-87ad-426a-8bbb-656889d82e10');
UPDATE aparelhos SET venda_id = 'd8624f7f-c408-485d-8d69-d987a935307d' WHERE id = '49dc8a63-d0ff-4f5a-97f4-263cad8a5757';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('a67213bc-c8b2-4d87-bd2e-835d16c694b6', 'd8624f7f-c408-485d-8d69-d987a935307d', 'pix', 3050.0, '2026-06-04', '97f12885-87ad-426a-8bbb-656889d82e10', 1, '2026-06-04T14:00:00');

-- LINHA 397 [NAO]: IPHONE 17 PRO MAX 256GB SILVER NOVO (04/06/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('b2d1b1ab-9ef4-44d2-ba34-4a11d53a2a19', 'Apple', 'IPHONE 17 PRO MAX 256GB SILVER NOVO', '351205745375915', 7750.0, 7500.0, 19, 'novo', 'perfeito', 'vendido', '2026-06-04', '2026-06-04', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-06-04', '2026-06-04', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('0a8fbf24-f81f-4223-9371-5bca754b933f', current_setting('importacao.proximo_numero')::int + 394, current_setting('importacao.cliente_id')::uuid, 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 7750.0, 7750.0, 0.0, '2026-06-04', '2026-06-04', '97f12885-87ad-426a-8bbb-656889d82e10');
UPDATE aparelhos SET venda_id = '0a8fbf24-f81f-4223-9371-5bca754b933f' WHERE id = 'b2d1b1ab-9ef4-44d2-ba34-4a11d53a2a19';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('aff70dd4-2050-405a-b876-9d4317602c22', '0a8fbf24-f81f-4223-9371-5bca754b933f', 'dinheiro', 4050.0, '2026-06-04', '97f12885-87ad-426a-8bbb-656889d82e10', 1, '2026-06-04T14:00:00');
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, observacao, parcelas, criado_em)
VALUES ('a8091daf-aa93-4601-bc9e-aac482afe645', '0a8fbf24-f81f-4223-9371-5bca754b933f', 'troca_aparelho', 3700.0, '2026-06-04', '97f12885-87ad-426a-8bbb-656889d82e10', 'Troca: IPH 15 PRO MAX 256GB', 1, '2026-06-04T14:00:00');

-- LINHA 398 [NAO]: POCO X8 PRO 512GB PRETO NOVO (04/06/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('9276c591-32bc-4acb-a527-751845c81611', 'Outros', 'POCO X8 PRO 512GB PRETO NOVO', 'V865532083172607', 2500.0, 2300.0, 19, 'novo', 'perfeito', 'vendido', '2026-06-04', '2026-06-04', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-06-04', '2026-06-04', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('8b30acd8-5a50-49b7-b8c6-5c225061acd0', current_setting('importacao.proximo_numero')::int + 395, current_setting('importacao.cliente_id')::uuid, 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 2500.0, 2500.0, 0.0, '2026-06-04', '2026-06-04', '97f12885-87ad-426a-8bbb-656889d82e10');
UPDATE aparelhos SET venda_id = '8b30acd8-5a50-49b7-b8c6-5c225061acd0' WHERE id = '9276c591-32bc-4acb-a527-751845c81611';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('458dafc9-f244-4b40-a236-c3d4d5fd5aca', '8b30acd8-5a50-49b7-b8c6-5c225061acd0', 'pix', 1000.0, '2026-06-04', '97f12885-87ad-426a-8bbb-656889d82e10', 1, '2026-06-04T14:00:00');
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('d1616b86-b1b9-422b-bd16-f0e5f51f6b16', '8b30acd8-5a50-49b7-b8c6-5c225061acd0', 'cartao_credito', 1500.0, '2026-06-04', '97f12885-87ad-426a-8bbb-656889d82e10', 1, '2026-06-04T14:00:00');

-- LINHA 399 [NAO]: IPHONE 17 PRO MAX 256GB AZUL NOVO (04/06/2026)
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('f0c1275b-c699-4e93-99f0-9e9121b9f38a', 'Apple', 'IPHONE 17 PRO MAX 256GB AZUL NOVO', '359652120809905', 7467.0, 7230.0, 19, 'novo', 'perfeito', 'vendido', '2026-06-04', '2026-06-04', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-06-04', '2026-06-04', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('6186d949-7f53-46bc-9ada-950f0011de7e', current_setting('importacao.proximo_numero')::int + 396, current_setting('importacao.cliente_id')::uuid, 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 7467.0, 7467.0, 0.0, '2026-06-04', '2026-06-04', '97f12885-87ad-426a-8bbb-656889d82e10');
UPDATE aparelhos SET venda_id = '6186d949-7f53-46bc-9ada-950f0011de7e' WHERE id = 'f0c1275b-c699-4e93-99f0-9e9121b9f38a';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em)
VALUES ('33916aed-7902-499f-a52d-031e0b820d9a', '6186d949-7f53-46bc-9ada-950f0011de7e', 'cartao_credito', 5367.0, '2026-06-04', '97f12885-87ad-426a-8bbb-656889d82e10', 1, '2026-06-04T14:00:00');
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, observacao, parcelas, criado_em)
VALUES ('a81cede8-9438-4788-90ed-5881964ec6ec', '6186d949-7f53-46bc-9ada-950f0011de7e', 'troca_aparelho', 2100.0, '2026-06-04', '97f12885-87ad-426a-8bbb-656889d82e10', 'Troca: IPH 13 PRO MAX', 1, '2026-06-04T14:00:00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('26871741-807d-43c3-81f7-f5f5705e307d', 19, '6186d949-7f53-46bc-9ada-950f0011de7e', 'Brinde', 30.0, '2026-06-04', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-06-04');

-- Atualizar sequence
SELECT setval('vendas_numero_venda_seq', (SELECT max(numero_venda) FROM vendas));

COMMIT;

-- ============================================
-- RESUMO
-- Aparelhos: 397
-- Vendas:    397
-- Pagamentos: 513
-- Brindes:   271
-- Trocas:    74
-- Sem IMEI:  7
-- IMEI dup:  2
-- Erros:     0
-- ============================================