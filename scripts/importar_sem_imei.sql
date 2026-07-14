-- Importacao vendas_aparelhos3.csv (gerado, NAO executado)
-- numero_venda: usa o default nextval do banco (NAO setado aqui)
BEGIN;
DO $$
DECLARE v_cliente_id UUID;
BEGIN
    SELECT id INTO v_cliente_id FROM clientes WHERE nome = 'Cliente Balcao' LIMIT 1;
    IF v_cliente_id IS NULL THEN
        INSERT INTO clientes (id, nome, id_loja, criado_em, atualizado_em)
        VALUES (gen_random_uuid(), 'Cliente Balcao', 1, now(), now()) RETURNING id INTO v_cliente_id;
    END IF;
    PERFORM set_config('importacao.cliente_id', v_cliente_id::text, true);
END $$;

-- PULADO (SEM IMEI, provavel duplicata por modelo+valor) linha 15: MACBOOK M1 SPACE 8/256 SEMINOVO R$ 4100.0
-- PULADO (SEM IMEI, provavel duplicata por modelo+valor) linha 17: APPLE WATCH SERIE 11 46MM SPACE GRAY NOVO R$ 2450.0
-- PULADO (SEM IMEI, provavel duplicata por modelo+valor) linha 27: BOMBOX 4 PRETA NOVO R$ 2350.0
-- PULADO (SEM IMEI, provavel duplicata por modelo+valor) linha 30: IPAD 11 128GB AMARELO NOVO R$ 2715.0
-- PULADO (SEM IMEI, provavel duplicata por modelo+valor) linha 36: SAMSUNG TAB S10 FE 128GB CINZA NOVO R$ 2582.0
-- PULADO (SEM IMEI, provavel duplicata por modelo+valor) linha 51: IPHONE 17 PRO 256GB BRANCO SEMINOVO R$ 6880.0
-- PULADO (SEM IMEI, provavel duplicata por modelo+valor) linha 52: IPAD 11 128GB 128GB SILVER NOVO R$ 2320.0
-- PULADO (SEM IMEI, provavel duplicata por modelo+valor) linha 54: IPHONE 14 PRO MAX 256GB PRETO SEMINOVO R$ 3590.0
-- PULADO (valor zero) linha 63: IPHONE 15 128GB ROSA SEMINOVO
-- PULADO (SEM IMEI, provavel duplicata por modelo+valor) linha 75: AIRPODS PRO 3 NOVO R$ 1700.0
-- PULADO (SEM IMEI, provavel duplicata por modelo+valor) linha 77: POCO PAD M1 CINZA NOVO R$ 1750.0
-- PULADO (SEM IMEI, provavel duplicata por modelo+valor) linha 81: GALAXY TAB S10 FE NOVO R$ 2680.0
-- PULADO (SEM IMEI, provavel duplicata por modelo+valor) linha 91: IPAD 11 (A16) 128GB BRANCO NOVO R$ 2650.0
-- PULADO (SEM IMEI, provavel duplicata por modelo+valor) linha 122: APPLE WATCH SE 3 STARLIGHT NOVO R$ 1950.0
-- PULADO (SEM IMEI, provavel duplicata por modelo+valor) linha 130: BOOMBOX 4 LARANJA NOVO R$ 2500.0
-- PULADO (SEM IMEI, provavel duplicata por modelo+valor) linha 138: IPHONE 13 128GB ROSA SEMINOVO R$ 1911.0
-- PULADO (SEM IMEI, provavel duplicata por modelo+valor) linha 143: MACBOOK AIR M4 256GB SILVER NOVO R$ 6750.0
-- PULADO (SEM IMEI, provavel duplicata por modelo+valor) linha 144: MACBOOK AIR M4 SILVER 256GB NOVO R$ 6750.0
-- PULADO (SEM IMEI, provavel duplicata por modelo+valor) linha 146: IPAD 11° A16 128GB AZUL NOVO R$ 2500.0
-- PULADO (SEM IMEI, provavel duplicata por modelo+valor) linha 147: IPAD 11° A16 128GB AZUL NOVO R$ 2200.0
-- PULADO (SEM IMEI, provavel duplicata por modelo+valor) linha 149: IPHONE 13 PRO 128GB GRAFITE SEMINOVO R$ 2500.0
-- PULADO (SEM IMEI, provavel duplicata por modelo+valor) linha 163: APPLE WATCH SE GEN 2 44MM MIDNIGHT NOVO R$ 2050.0
-- PULADO (SEM IMEI, provavel duplicata por modelo+valor) linha 169: IPAD 11° A16 128GB SILVER NOVO R$ 2300.0
-- PULADO (SEM IMEI, provavel duplicata por modelo+valor) linha 180: APPLE WATCH SERIE 11 ROSE GOLD NOVO R$ 2500.0
-- PULADO (SEM IMEI, provavel duplicata por modelo+valor) linha 181: IPAD 11 128GB AZUL NOVO R$ 2210.0
-- PULADO (SEM IMEI, provavel duplicata por modelo+valor) linha 182: IPAD 11 128GB AMARELO NOVO R$ 2650.0
-- PULADO (SEM IMEI, provavel duplicata por modelo+valor) linha 190: BOOMBOX 4 LARANJA NOVO R$ 2500.0
-- PULADO (SEM IMEI, provavel duplicata por modelo+valor) linha 191: IPAD AIR M3 11 256GB AZUL NOVO R$ 5200.0
-- PULADO (SEM IMEI, provavel duplicata por modelo+valor) linha 192: IPHONE 17 PRO MAX AZUL NOVO R$ 8300.0
-- PULADO (SEM IMEI, provavel duplicata por modelo+valor) linha 193: IPAD 11° (A16) 128GB AMARELO NOVO R$ 2297.0
-- PULADO (SEM IMEI, provavel duplicata por modelo+valor) linha 196: IPHONE 16 128GB PRETO NOVO R$ 4395.0
-- PULADO (SEM IMEI, provavel duplicata por modelo+valor) linha 197: IPAD 11 (A16) 128GB ROSA NOVO R$ 2375.0
-- PULADO (SEM IMEI, provavel duplicata por modelo+valor) linha 202: IPAD 11 128GB SILVER SEMINOVO R$ 2490.0
-- PULADO (SEM IMEI, provavel duplicata por modelo+valor) linha 203: APPLE PENCIL USB-C BRANCO SEMINOVO R$ 780.0
-- PULADO (SEM IMEI, provavel duplicata por modelo+valor) linha 207: BOOMBOX 4 PRETA SEMINOVO R$ 2350.0
-- PULADO (SEM IMEI, provavel duplicata por modelo+valor) linha 209: BOOMBOX 4 LARANJA NOVO R$ 2450.0
-- PULADO (SEM IMEI, provavel duplicata por modelo+valor) linha 210: REDMI PAD 2 256GB PRETO NOVO R$ 1500.0
-- PULADO (SEM IMEI, provavel duplicata por modelo+valor) linha 212: IPAD 11 128GB SILVER NOVO R$ 2850.0
-- PULADO (SEM IMEI, provavel duplicata por modelo+valor) linha 215: MAC AIR M5 16 512GB SILVER NOVO R$ 7550.0
-- PULADO (SEM IMEI, provavel duplicata por modelo+valor) linha 216: REDMI PAD 2 256GB SPACE GRAY NOVO R$ 1655.0
-- PULADO (SEM IMEI, provavel duplicata por modelo+valor) linha 232: IPHONE 11 BRANCO 128GB SEMINOVO R$ 1030.0
-- PULADO (SEM IMEI, provavel duplicata por modelo+valor) linha 248: IPAD 11 128GB AZUL LACRADO R$ 2950.0
-- PULADO (SEM IMEI, provavel duplicata por modelo+valor) linha 267: ULTRA 3 NOVO PRETO R$ 4650.0
-- PULADO (SEM IMEI, provavel duplicata por modelo+valor) linha 268: TV Q LED TCL P7K R$ 4600.0
-- PULADO (SEM IMEI, provavel duplicata por modelo+valor) linha 278: IPAD AIR M4 11° SPACE GRAY NOVO R$ 3900.0
-- PULADO (SEM IMEI, provavel duplicata por modelo+valor) linha 279: AIPORDS PRO 3 BRANCO NOVO R$ 1520.0
-- PULADO (SEM IMEI, provavel duplicata por modelo+valor) linha 287: APPLE PENCIL USB C NOVO R$ 770.0
-- PULADO (SEM IMEI, provavel duplicata por modelo+valor) linha 288: IPAD 11 128GB ROSA NOVO R$ 2190.0
-- PULADO (SEM IMEI, provavel duplicata por modelo+valor) linha 289: AIRPORDS PRO 3 NOVO R$ 1590.0
-- PULADO (SEM IMEI, provavel duplicata por modelo+valor) linha 292: IPAD 11° (A16) 128GB SILVER R$ 2500.0
-- PULADO (SEM IMEI, provavel duplicata por modelo+valor) linha 293: BOOMBOX 4 LARANJA NOVO R$ 2640.0
-- PULADO (SEM IMEI, provavel duplicata por modelo+valor) linha 298: IPHONE 17 PRO MAX SILVER 256GB NOVO R$ 7999.99
-- PULADO (SEM IMEI, provavel duplicata por modelo+valor) linha 326: IPAD 11 128GB SILVER NOVO R$ 2350.0
-- PULADO (SEM IMEI, provavel duplicata por modelo+valor) linha 329: IPHONE 17 PRO 256GB BRANCO SEMINOVO R$ 6637.0
-- PULADO (SEM IMEI, provavel duplicata por modelo+valor) linha 332: REDMI PAD 2 256GB PRETO NOVO R$ 1350.0
-- PULADO (SEM IMEI, provavel duplicata por modelo+valor) linha 340: PARTY BOX 120 PRETA R$ 1800.0
-- PULADO (SEM IMEI, provavel duplicata por modelo+valor) linha 342: MACBOOK AIR M5 13  512GB NOVO R$ 7350.0
-- PULADO (SEM IMEI, provavel duplicata por modelo+valor) linha 344: MACBOOK NEO SILVER 256GB NOVO R$ 4422.0
-- PULADO (SEM IMEI, provavel duplicata por modelo+valor) linha 349: IPHONE 11 128GB PRETO USADO R$ 1062.0
-- PULADO (SEM IMEI, provavel duplicata por modelo+valor) linha 353: IPAD 11° A16 128GB SILVER NOVO R$ 2500.0
-- PULADO (SEM IMEI, provavel duplicata por modelo+valor) linha 354: POCO C85 PRETO 256GB NOVO R$ 1000.0
-- PULADO (SEM IMEI, provavel duplicata por modelo+valor) linha 357: POCO C85 PRETO 256GB NOVO R$ 990.0
-- PULADO (SEM IMEI, provavel duplicata por modelo+valor) linha 360: JBL BOOMBOX 4 PRETO NOVO R$ 2434.0
-- PULADO (SEM IMEI, provavel duplicata por modelo+valor) linha 361: JBL BOOMBOX 4 BRANCA NOVO R$ 2276.0
-- PULADO (SEM IMEI, provavel duplicata por modelo+valor) linha 362: PENCIL PRO NOVO R$ 870.0
-- PULADO (SEM IMEI, provavel duplicata por modelo+valor) linha 373: MAGIC MOUSE 3 BRANCO NOVO R$ 760.0
-- PULADO (SEM IMEI, provavel duplicata por modelo+valor) linha 377: BOOMBOX 4 BRANCA NOVA R$ 2405.0
-- PULADO (SEM IMEI, provavel duplicata por modelo+valor) linha 384: POCO PAD M1 256GB PRETO NOVO R$ 1560.0
-- === Linha 388: IPAD 11 128GB SILVER NOVO (03/06/2026) | Higor Guedes | CELL ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes) VALUES ('ac6d464d-459e-46ce-8994-98d486bc9394', 'Apple', 'IPAD 11 128GB SILVER NOVO', NULL, 2480.0, 2250.0, 1, 'novo', 'perfeito', 'vendido', '2026-06-03T14:00:00+00', '2026-06-03T14:00:00+00', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-06-03T14:00:00+00', '2026-06-03T14:00:00+00', NULL);
INSERT INTO vendas (cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por) VALUES (current_setting('importacao.cliente_id')::uuid, 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 2480.0, 2480.0, 0, '2026-06-03T14:00:00+00', '2026-06-03T14:00:00+00', '85e3aa42-b9af-49b8-a72a-64e9c337aa53');
WITH v AS (SELECT id FROM vendas WHERE vendedor_id = '85e3aa42-b9af-49b8-a72a-64e9c337aa53' AND loja_id = 1 AND criado_em = '2026-06-03T14:00:00+00' AND valor_total = 2480.0 ORDER BY numero_venda DESC LIMIT 1) UPDATE aparelhos SET venda_id = (SELECT id FROM v) WHERE id = 'ac6d464d-459e-46ce-8994-98d486bc9394';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em) SELECT gen_random_uuid(), venda_id, 'pix', 2480.0, '2026-06-03', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 1, '2026-06-03T14:00:00+00' FROM aparelhos WHERE id = 'ac6d464d-459e-46ce-8994-98d486bc9394';

-- PULADO (SEM IMEI, provavel duplicata por modelo+valor) linha 402: APPLE WATCH SERIES 8 STARLHIG SEMINOVO R$ 1100.0
-- PULADO (SEM IMEI, provavel duplicata por modelo+valor) linha 404: IPHONE 16 PRO 128GB PRETO SEMINOVO R$ 5000.0
-- PULADO (SEM IMEI, provavel duplicata por modelo+valor) linha 407: MacBook Air m5 midnight 16/512 NOVO R$ 6930.0
-- PULADO (SEM IMEI, provavel duplicata por modelo+valor) linha 411: MACBOOK NEO ROSA 256GB NOVO R$ 4551.0
-- === Linha 414: JBL BOOMBOX 3 PRETA  NOVO (05/06/2026) | Renan | BLOCO B ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes) VALUES ('65ca1690-12d9-4580-ba6f-61f3f180e6b9', 'Outros', 'JBL BOOMBOX 3 PRETA  NOVO', NULL, 1860.0, 1780.0, 20, 'novo', 'perfeito', 'vendido', '2026-06-05T14:00:00+00', '2026-06-05T14:00:00+00', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', '2026-06-05T14:00:00+00', '2026-06-05T14:00:00+00', 'pgto forcado pix (extracao nao confiavel)');
INSERT INTO vendas (cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por) VALUES (current_setting('importacao.cliente_id')::uuid, 20, 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 'concluida', 'normal', 1860.0, 1860.0, 0, '2026-06-05T14:00:00+00', '2026-06-05T14:00:00+00', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4');
WITH v AS (SELECT id FROM vendas WHERE vendedor_id = 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4' AND loja_id = 20 AND criado_em = '2026-06-05T14:00:00+00' AND valor_total = 1860.0 ORDER BY numero_venda DESC LIMIT 1) UPDATE aparelhos SET venda_id = (SELECT id FROM v) WHERE id = '65ca1690-12d9-4580-ba6f-61f3f180e6b9';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em) SELECT gen_random_uuid(), venda_id, 'pix', 1860.0, '2026-06-05', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 1, '2026-06-05T14:00:00+00' FROM aparelhos WHERE id = '65ca1690-12d9-4580-ba6f-61f3f180e6b9';

-- PULADO (SEM IMEI, provavel duplicata por modelo+valor) linha 418: REDMI PAD 2 256GB CINZA NOVO R$ 1500.0
-- PULADO (SEM IMEI, provavel duplicata por modelo+valor) linha 420: IPHONE 17 256GB BRANCO NOVO R$ 4980.0
-- PULADO (SEM IMEI, provavel duplicata por modelo+valor) linha 422: IPAD 11° (A16) 128GB SILVER NOVO R$ 2599.0
-- PULADO (SEM IMEI, provavel duplicata por modelo+valor) linha 424: IPAD 11° (A16) 128GB SILVER NOVO R$ 2542.0
-- PULADO (SEM IMEI, provavel duplicata por modelo+valor) linha 425: IPAD 11° (A16) 128GB AZUL NOVO R$ 2450.0
-- PULADO (SEM IMEI, provavel duplicata por modelo+valor) linha 428: IPAD 11° (A16) 128GB AZUL NOVO R$ 2471.0
-- PULADO (SEM IMEI, provavel duplicata por modelo+valor) linha 434: IPHONE 17 PRO 256GB BRANCO SEMINOVO R$ 7065.0
-- PULADO (SEM IMEI, provavel duplicata por modelo+valor) linha 441: BOOMBOX 4 LARANJA NOVA/SEMINOVA R$ 2500.0
-- PULADO (SEM IMEI, provavel duplicata por modelo+valor) linha 444: POCO X8 PRO MAX 512GB AZUL NOVO R$ 3100.0
-- PULADO (SEM IMEI, provavel duplicata por modelo+valor) linha 448: IPHONE 14 PRO 128GB ROXO SEMINOVO R$ 1650.0
-- PULADO (SEM IMEI, provavel duplicata por modelo+valor) linha 449: IPAD 11° (A16) 128GB SILVER NOVO R$ 2453.35
-- PULADO (SEM IMEI, provavel duplicata por modelo+valor) linha 464: IPAD 11° (A16) 128GB SILVER NOVO R$ 2441.0
-- PULADO (SEM IMEI, provavel duplicata por modelo+valor) linha 482: APPLE WATCH SÉRIE 11 42MM ROSE GOLD NOVO R$ 2480.0
-- PULADO (SEM IMEI, provavel duplicata por modelo+valor) linha 487: SAMSUNG S10 FE 256GB GREY NOVO R$ 2603.0
-- PULADO (SEM IMEI, provavel duplicata por modelo+valor) linha 496: IPHONE 17 PRO MAX 256GB AZUL NOVO R$ 8192.0
-- === Linha 500: IPHONE 17 PRO MAX 512GB AZUL  NOVO (14/06/2026) | Higor Guedes | CELL ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes) VALUES ('808842e8-7c52-495f-909c-038a86a4c585', 'Apple', 'IPHONE 17 PRO MAX 512GB AZUL  NOVO', NULL, 9592.0, 8800.0, 1, 'novo', 'perfeito', 'vendido', '2026-06-14T14:00:00+00', '2026-06-14T14:00:00+00', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-06-14T14:00:00+00', '2026-06-14T14:00:00+00', NULL);
INSERT INTO vendas (cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por) VALUES (current_setting('importacao.cliente_id')::uuid, 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 9592.0, 7598.0, 0, '2026-06-14T14:00:00+00', '2026-06-14T14:00:00+00', '85e3aa42-b9af-49b8-a72a-64e9c337aa53');
WITH v AS (SELECT id FROM vendas WHERE vendedor_id = '85e3aa42-b9af-49b8-a72a-64e9c337aa53' AND loja_id = 1 AND criado_em = '2026-06-14T14:00:00+00' AND valor_total = 9592.0 ORDER BY numero_venda DESC LIMIT 1) UPDATE aparelhos SET venda_id = (SELECT id FROM v) WHERE id = '808842e8-7c52-495f-909c-038a86a4c585';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em) SELECT gen_random_uuid(), venda_id, 'pix', 7592.0, '2026-06-14', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 1, '2026-06-14T14:00:00+00' FROM aparelhos WHERE id = '808842e8-7c52-495f-909c-038a86a4c585';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, observacao, parcelas, criado_em) SELECT gen_random_uuid(), venda_id, 'troca_aparelho', 6.0, '2026-06-14', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'Troca: 1', 1, '2026-06-14T14:00:00+00' FROM aparelhos WHERE id = '808842e8-7c52-495f-909c-038a86a4c585';
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em) SELECT gen_random_uuid(), 1, venda_id, 'Brinde', 25.0, '2026-06-14', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-06-14T14:00:00+00' FROM aparelhos WHERE id = '808842e8-7c52-495f-909c-038a86a4c585';

-- PULADO (SEM IMEI, provavel duplicata por modelo+valor) linha 507: IPHONE 15 PRO MAX 256GB AZUL SEMINOVO R$ 4075.0
-- PULADO (SEM IMEI, provavel duplicata por modelo+valor) linha 509: POCO PAD M1 256GB GRAY NOVO R$ 2050.0
-- PULADO (SEM IMEI, provavel duplicata por modelo+valor) linha 511: LARK HOLLYLAND M2 NOVO R$ 893.0
-- PULADO (SEM IMEI, provavel duplicata por modelo+valor) linha 514: IPHONE 15 128GB PRETO SEMINOVO R$ 2900.0
-- PULADO (SEM IMEI, provavel duplicata por modelo+valor) linha 519: IPAD 11 A16 WIFI 128GB SILVER NOVO R$ 2503.0
-- PULADO (SEM IMEI, provavel duplicata por modelo+valor) linha 535: IPAD 11 A16 128GB AZUL NOVO R$ 2373.0
-- === Linha 537: IPAD 11 128GB AZUL NOVO (20/06/2026) | Marcela | ONLINE ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes) VALUES ('d59fdb77-0882-44a6-8d8d-176cedf92b53', 'Apple', 'IPAD 11 128GB AZUL NOVO', NULL, 2596.0, 2230.0, 21, 'novo', 'perfeito', 'vendido', '2026-06-20T14:00:00+00', '2026-06-20T14:00:00+00', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-06-20T14:00:00+00', '2026-06-20T14:00:00+00', NULL);
INSERT INTO vendas (cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por) VALUES (current_setting('importacao.cliente_id')::uuid, 21, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 2596.0, 2596.0, 0, '2026-06-20T14:00:00+00', '2026-06-20T14:00:00+00', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
WITH v AS (SELECT id FROM vendas WHERE vendedor_id = 'a3626643-4749-4e56-83bc-b4a8ffd53659' AND loja_id = 21 AND criado_em = '2026-06-20T14:00:00+00' AND valor_total = 2596.0 ORDER BY numero_venda DESC LIMIT 1) UPDATE aparelhos SET venda_id = (SELECT id FROM v) WHERE id = 'd59fdb77-0882-44a6-8d8d-176cedf92b53';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em) SELECT gen_random_uuid(), venda_id, 'pix', 1100.0, '2026-06-20', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1, '2026-06-20T14:00:00+00' FROM aparelhos WHERE id = 'd59fdb77-0882-44a6-8d8d-176cedf92b53';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em) SELECT gen_random_uuid(), venda_id, 'cartao_credito', 1496.0, '2026-06-20', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1, '2026-06-20T14:00:00+00' FROM aparelhos WHERE id = 'd59fdb77-0882-44a6-8d8d-176cedf92b53';
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em) SELECT gen_random_uuid(), 21, venda_id, 'Brinde', 130.0, '2026-06-20', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-06-20T14:00:00+00' FROM aparelhos WHERE id = 'd59fdb77-0882-44a6-8d8d-176cedf92b53';

-- PULADO (SEM IMEI, provavel duplicata por modelo+valor) linha 546: MACBOOK NEO 256GB AZUL NOVO R$ 4527.0
-- PULADO (SEM IMEI, provavel duplicata por modelo+valor) linha 547: IPHONE 17 PRO 256GB BRANCO NOVO R$ 7176.0
-- === Linha 560: FONTE ORIGINAL APPLE BRANCO NOVO (21/06/2026) | Marcela | ONLINE ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes) VALUES ('d0488e19-81f4-449e-968c-343fbef116d2', 'Outros', 'FONTE ORIGINAL APPLE BRANCO NOVO', NULL, 190.0, 125.0, 21, 'novo', 'perfeito', 'vendido', '2026-06-21T14:00:00+00', '2026-06-21T14:00:00+00', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-06-21T14:00:00+00', '2026-06-21T14:00:00+00', 'pgto forcado pix (extracao nao confiavel)');
INSERT INTO vendas (cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por) VALUES (current_setting('importacao.cliente_id')::uuid, 21, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 190.0, 190.0, 0, '2026-06-21T14:00:00+00', '2026-06-21T14:00:00+00', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
WITH v AS (SELECT id FROM vendas WHERE vendedor_id = 'a3626643-4749-4e56-83bc-b4a8ffd53659' AND loja_id = 21 AND criado_em = '2026-06-21T14:00:00+00' AND valor_total = 190.0 ORDER BY numero_venda DESC LIMIT 1) UPDATE aparelhos SET venda_id = (SELECT id FROM v) WHERE id = 'd0488e19-81f4-449e-968c-343fbef116d2';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em) SELECT gen_random_uuid(), venda_id, 'pix', 190.0, '2026-06-21', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1, '2026-06-21T14:00:00+00' FROM aparelhos WHERE id = 'd0488e19-81f4-449e-968c-343fbef116d2';

-- PULADO (SEM IMEI, provavel duplicata por modelo+valor) linha 570: IPHONE 11 128GB LILAS SEMINOVO R$ 800.0
-- PULADO (SEM IMEI, provavel duplicata por modelo+valor) linha 572: IPHONE 17 256GB BRANCO NOVO R$ 5412.0
-- PULADO (SEM IMEI, provavel duplicata por modelo+valor) linha 573: REDMI NOTE 15 PRO 5G PRETO 512GB NOVO R$ 1910.0
-- PULADO (SEM IMEI, provavel duplicata por modelo+valor) linha 575: IPHONE 17 PRO MAX 1TB BRANCO NOVO R$ 10400.0
-- PULADO (SEM IMEI, provavel duplicata por modelo+valor) linha 576: IPHONE 15 PRO MAX 256GB BRANCO SEMINOVO R$ 4100.0
-- PULADO (SEM IMEI, provavel duplicata por modelo+valor) linha 577: IPHONE 14 PRO MAX PRETO SEMINOVO R$ 3166.0
-- PULADO (SEM IMEI, provavel duplicata por modelo+valor) linha 579: IPHONE 17 PRO MAX 256GB AZUL NOVO R$ 7300.0
-- === Linha 581: FONTE APPLE ORIGINAL BRANCO (23/06/2026) | Marcela | ONLINE ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes) VALUES ('a4baf6c6-a572-465b-83af-df6f91ee1aa1', 'Outros', 'FONTE APPLE ORIGINAL BRANCO', NULL, 330.0, 125.0, 21, 'seminovo', 'bom', 'vendido', '2026-06-23T14:00:00+00', '2026-06-23T14:00:00+00', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-06-23T14:00:00+00', '2026-06-23T14:00:00+00', 'pgto forcado pix (extracao nao confiavel)');
INSERT INTO vendas (cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por) VALUES (current_setting('importacao.cliente_id')::uuid, 21, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 330.0, 330.0, 0, '2026-06-23T14:00:00+00', '2026-06-23T14:00:00+00', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
WITH v AS (SELECT id FROM vendas WHERE vendedor_id = 'a3626643-4749-4e56-83bc-b4a8ffd53659' AND loja_id = 21 AND criado_em = '2026-06-23T14:00:00+00' AND valor_total = 330.0 ORDER BY numero_venda DESC LIMIT 1) UPDATE aparelhos SET venda_id = (SELECT id FROM v) WHERE id = 'a4baf6c6-a572-465b-83af-df6f91ee1aa1';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em) SELECT gen_random_uuid(), venda_id, 'pix', 330.0, '2026-06-23', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1, '2026-06-23T14:00:00+00' FROM aparelhos WHERE id = 'a4baf6c6-a572-465b-83af-df6f91ee1aa1';
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em) SELECT gen_random_uuid(), 21, venda_id, 'Brinde', 35.0, '2026-06-23', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-06-23T14:00:00+00' FROM aparelhos WHERE id = 'a4baf6c6-a572-465b-83af-df6f91ee1aa1';

-- PULADO (SEM IMEI, provavel duplicata por modelo+valor) linha 590: APPLE WATCH S11 46 MM SPACE GRAY NOVO R$ 2450.0
-- PULADO (SEM IMEI, provavel duplicata por modelo+valor) linha 592: FONTE APPLE ORIGINAL R$ 150.0
-- PULADO (SEM IMEI, provavel duplicata por modelo+valor) linha 595: IPAD 11 128GB SILVER NOVO R$ 2410.0
-- PULADO (SEM IMEI, provavel duplicata por modelo+valor) linha 596: IPHONE 16 PRO MAX 256GB BRANCO SEMINOVO R$ 5122.0
-- PULADO (SEM IMEI, provavel duplicata por modelo+valor) linha 611: IPHONE 17 PRO MAX 256GB LARANJA NOVO R$ 7200.0
-- === Linha 617: FONTE APPLE ORIGINAL BRANCO - NOVO (26/06/2026) | Marcela | ONLINE ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes) VALUES ('340fbc5f-d298-45a9-bdf2-238c17c7ae31', 'Outros', 'FONTE APPLE ORIGINAL BRANCO - NOVO', NULL, 200.0, 125.0, 21, 'novo', 'perfeito', 'vendido', '2026-06-26T14:00:00+00', '2026-06-26T14:00:00+00', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-06-26T14:00:00+00', '2026-06-26T14:00:00+00', 'pgto forcado pix (extracao nao confiavel)');
INSERT INTO vendas (cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por) VALUES (current_setting('importacao.cliente_id')::uuid, 21, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 200.0, 200.0, 0, '2026-06-26T14:00:00+00', '2026-06-26T14:00:00+00', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
WITH v AS (SELECT id FROM vendas WHERE vendedor_id = 'a3626643-4749-4e56-83bc-b4a8ffd53659' AND loja_id = 21 AND criado_em = '2026-06-26T14:00:00+00' AND valor_total = 200.0 ORDER BY numero_venda DESC LIMIT 1) UPDATE aparelhos SET venda_id = (SELECT id FROM v) WHERE id = '340fbc5f-d298-45a9-bdf2-238c17c7ae31';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em) SELECT gen_random_uuid(), venda_id, 'pix', 200.0, '2026-06-26', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1, '2026-06-26T14:00:00+00' FROM aparelhos WHERE id = '340fbc5f-d298-45a9-bdf2-238c17c7ae31';

-- PULADO (SEM IMEI, provavel duplicata por modelo+valor) linha 631: FONTE APPLE ORIGINAL R$ 180.0
-- === Linha 633: FONTE APPLE ORIGINAL NOVO (27/06/2026) | Marcela | ONLINE ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes) VALUES ('777d688f-37bb-47b4-b6dc-26fa20caf3ca', 'Outros', 'FONTE APPLE ORIGINAL NOVO', NULL, 180.0, 125.0, 21, 'novo', 'perfeito', 'vendido', '2026-06-27T14:00:00+00', '2026-06-27T14:00:00+00', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-06-27T14:00:00+00', '2026-06-27T14:00:00+00', 'pgto forcado pix (extracao nao confiavel)');
INSERT INTO vendas (cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por) VALUES (current_setting('importacao.cliente_id')::uuid, 21, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 180.0, 180.0, 0, '2026-06-27T14:00:00+00', '2026-06-27T14:00:00+00', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
WITH v AS (SELECT id FROM vendas WHERE vendedor_id = 'a3626643-4749-4e56-83bc-b4a8ffd53659' AND loja_id = 21 AND criado_em = '2026-06-27T14:00:00+00' AND valor_total = 180.0 ORDER BY numero_venda DESC LIMIT 1) UPDATE aparelhos SET venda_id = (SELECT id FROM v) WHERE id = '777d688f-37bb-47b4-b6dc-26fa20caf3ca';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em) SELECT gen_random_uuid(), venda_id, 'pix', 180.0, '2026-06-27', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1, '2026-06-27T14:00:00+00' FROM aparelhos WHERE id = '777d688f-37bb-47b4-b6dc-26fa20caf3ca';

-- === Linha 634: IPAD 11° (A16) 128GB AZUL NOVO (27/06/2026) | Marcela | ONLINE ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes) VALUES ('1489edb0-2b35-4c29-8f0d-18fe6486dc14', 'Apple', 'IPAD 11° (A16) 128GB AZUL NOVO', NULL, 2800.0, 2600.0, 21, 'novo', 'perfeito', 'vendido', '2026-06-27T14:00:00+00', '2026-06-27T14:00:00+00', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-06-27T14:00:00+00', '2026-06-27T14:00:00+00', NULL);
INSERT INTO vendas (cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por) VALUES (current_setting('importacao.cliente_id')::uuid, 21, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 2800.0, 2800.0, 0, '2026-06-27T14:00:00+00', '2026-06-27T14:00:00+00', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
WITH v AS (SELECT id FROM vendas WHERE vendedor_id = 'a3626643-4749-4e56-83bc-b4a8ffd53659' AND loja_id = 21 AND criado_em = '2026-06-27T14:00:00+00' AND valor_total = 2800.0 ORDER BY numero_venda DESC LIMIT 1) UPDATE aparelhos SET venda_id = (SELECT id FROM v) WHERE id = '1489edb0-2b35-4c29-8f0d-18fe6486dc14';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em) SELECT gen_random_uuid(), venda_id, 'cartao_credito', 2800.0, '2026-06-27', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1, '2026-06-27T14:00:00+00' FROM aparelhos WHERE id = '1489edb0-2b35-4c29-8f0d-18fe6486dc14';
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em) SELECT gen_random_uuid(), 21, venda_id, 'Brinde', 10.0, '2026-06-27', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-06-27T14:00:00+00' FROM aparelhos WHERE id = '1489edb0-2b35-4c29-8f0d-18fe6486dc14';

-- === Linha 641: IPAD 11 128GB 128GB AZUL NOVO (27/06/2026) | Ronald | CASES ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes) VALUES ('750e8dbf-5c0b-4008-a11d-efabb34331e3', 'Apple', 'IPAD 11 128GB 128GB AZUL NOVO', NULL, 2717.0, 2600.0, 19, 'novo', 'perfeito', 'vendido', '2026-06-27T14:00:00+00', '2026-06-27T14:00:00+00', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-06-27T14:00:00+00', '2026-06-27T14:00:00+00', NULL);
INSERT INTO vendas (cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por) VALUES (current_setting('importacao.cliente_id')::uuid, 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 2717.0, 3050.0, 0, '2026-06-27T14:00:00+00', '2026-06-27T14:00:00+00', '97f12885-87ad-426a-8bbb-656889d82e10');
WITH v AS (SELECT id FROM vendas WHERE vendedor_id = '97f12885-87ad-426a-8bbb-656889d82e10' AND loja_id = 19 AND criado_em = '2026-06-27T14:00:00+00' AND valor_total = 2717.0 ORDER BY numero_venda DESC LIMIT 1) UPDATE aparelhos SET venda_id = (SELECT id FROM v) WHERE id = '750e8dbf-5c0b-4008-a11d-efabb34331e3';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em) SELECT gen_random_uuid(), venda_id, 'cartao_credito', 3050.0, '2026-06-27', '97f12885-87ad-426a-8bbb-656889d82e10', 1, '2026-06-27T14:00:00+00' FROM aparelhos WHERE id = '750e8dbf-5c0b-4008-a11d-efabb34331e3';

-- === Linha 644: IPAD 11 128GB SILVER LACRADO (27/06/2026) | Rayssa | CELL ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes) VALUES ('c404788c-cb90-4824-befd-3bb5c08b5614', 'Apple', 'IPAD 11 128GB SILVER LACRADO', NULL, 2800.0, 2600.0, 1, 'seminovo', 'bom', 'vendido', '2026-06-27T14:00:00+00', '2026-06-27T14:00:00+00', '5eb6b371-bb58-48c5-8334-4de118c1741f', '2026-06-27T14:00:00+00', '2026-06-27T14:00:00+00', NULL);
INSERT INTO vendas (cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por) VALUES (current_setting('importacao.cliente_id')::uuid, 1, '5eb6b371-bb58-48c5-8334-4de118c1741f', 'concluida', 'normal', 2800.0, 2800.0, 0, '2026-06-27T14:00:00+00', '2026-06-27T14:00:00+00', '5eb6b371-bb58-48c5-8334-4de118c1741f');
WITH v AS (SELECT id FROM vendas WHERE vendedor_id = '5eb6b371-bb58-48c5-8334-4de118c1741f' AND loja_id = 1 AND criado_em = '2026-06-27T14:00:00+00' AND valor_total = 2800.0 ORDER BY numero_venda DESC LIMIT 1) UPDATE aparelhos SET venda_id = (SELECT id FROM v) WHERE id = 'c404788c-cb90-4824-befd-3bb5c08b5614';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em) SELECT gen_random_uuid(), venda_id, 'pix', 2800.0, '2026-06-27', '5eb6b371-bb58-48c5-8334-4de118c1741f', 1, '2026-06-27T14:00:00+00' FROM aparelhos WHERE id = 'c404788c-cb90-4824-befd-3bb5c08b5614';
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em) SELECT gen_random_uuid(), 1, venda_id, 'Brinde', 70.0, '2026-06-27', '5eb6b371-bb58-48c5-8334-4de118c1741f', '2026-06-27T14:00:00+00' FROM aparelhos WHERE id = 'c404788c-cb90-4824-befd-3bb5c08b5614';

-- === Linha 652: IPHONE 17 PRO MAX 256GB LARANJA NOVO (27/06/2026) | Higor Guedes | CELL ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes) VALUES ('c3f5e4d4-e4ba-4550-84f1-475b05824cfd', 'Apple', 'IPHONE 17 PRO MAX 256GB LARANJA NOVO', NULL, 7601.0, 6900.0, 1, 'novo', 'perfeito', 'vendido', '2026-06-27T14:00:00+00', '2026-06-27T14:00:00+00', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-06-27T14:00:00+00', '2026-06-27T14:00:00+00', NULL);
INSERT INTO vendas (cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por) VALUES (current_setting('importacao.cliente_id')::uuid, 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 7601.0, 7302.0, 0, '2026-06-27T14:00:00+00', '2026-06-27T14:00:00+00', '85e3aa42-b9af-49b8-a72a-64e9c337aa53');
WITH v AS (SELECT id FROM vendas WHERE vendedor_id = '85e3aa42-b9af-49b8-a72a-64e9c337aa53' AND loja_id = 1 AND criado_em = '2026-06-27T14:00:00+00' AND valor_total = 7601.0 ORDER BY numero_venda DESC LIMIT 1) UPDATE aparelhos SET venda_id = (SELECT id FROM v) WHERE id = 'c3f5e4d4-e4ba-4550-84f1-475b05824cfd';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em) SELECT gen_random_uuid(), venda_id, 'pix', 7301.0, '2026-06-27', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 1, '2026-06-27T14:00:00+00' FROM aparelhos WHERE id = 'c3f5e4d4-e4ba-4550-84f1-475b05824cfd';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, observacao, parcelas, criado_em) SELECT gen_random_uuid(), venda_id, 'troca_aparelho', 1.0, '2026-06-27', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'Troca: 1', 1, '2026-06-27T14:00:00+00' FROM aparelhos WHERE id = 'c3f5e4d4-e4ba-4550-84f1-475b05824cfd';
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em) SELECT gen_random_uuid(), 1, venda_id, 'Brinde', 185.0, '2026-06-27', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-06-27T14:00:00+00' FROM aparelhos WHERE id = 'c3f5e4d4-e4ba-4550-84f1-475b05824cfd';

-- === Linha 659: FONTE APPLE ORIGINAL NOVO (28/06/2026) | Marcela | ONLINE ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes) VALUES ('10c2b34e-ab1e-4c77-8b30-df19eb53555d', 'Outros', 'FONTE APPLE ORIGINAL NOVO', NULL, 216.0, 125.0, 21, 'novo', 'perfeito', 'vendido', '2026-06-28T14:00:00+00', '2026-06-28T14:00:00+00', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-06-28T14:00:00+00', '2026-06-28T14:00:00+00', 'pgto forcado pix (extracao nao confiavel)');
INSERT INTO vendas (cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por) VALUES (current_setting('importacao.cliente_id')::uuid, 21, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 216.0, 216.0, 0, '2026-06-28T14:00:00+00', '2026-06-28T14:00:00+00', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
WITH v AS (SELECT id FROM vendas WHERE vendedor_id = 'a3626643-4749-4e56-83bc-b4a8ffd53659' AND loja_id = 21 AND criado_em = '2026-06-28T14:00:00+00' AND valor_total = 216.0 ORDER BY numero_venda DESC LIMIT 1) UPDATE aparelhos SET venda_id = (SELECT id FROM v) WHERE id = '10c2b34e-ab1e-4c77-8b30-df19eb53555d';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em) SELECT gen_random_uuid(), venda_id, 'pix', 216.0, '2026-06-28', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1, '2026-06-28T14:00:00+00' FROM aparelhos WHERE id = '10c2b34e-ab1e-4c77-8b30-df19eb53555d';

-- === Linha 664: REDMI PAD 2 256GB CINZA NOVO (28/06/2026) | Ronald | CASES ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes) VALUES ('4345f4be-74ce-411b-926f-187606e9b600', 'Xiaomi', 'REDMI PAD 2 256GB CINZA NOVO', NULL, 1450.0, 1210.0, 19, 'novo', 'perfeito', 'vendido', '2026-06-28T14:00:00+00', '2026-06-28T14:00:00+00', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-06-28T14:00:00+00', '2026-06-28T14:00:00+00', 'pgto forcado pix (extracao nao confiavel)');
INSERT INTO vendas (cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por) VALUES (current_setting('importacao.cliente_id')::uuid, 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 1450.0, 1450.0, 0, '2026-06-28T14:00:00+00', '2026-06-28T14:00:00+00', '97f12885-87ad-426a-8bbb-656889d82e10');
WITH v AS (SELECT id FROM vendas WHERE vendedor_id = '97f12885-87ad-426a-8bbb-656889d82e10' AND loja_id = 19 AND criado_em = '2026-06-28T14:00:00+00' AND valor_total = 1450.0 ORDER BY numero_venda DESC LIMIT 1) UPDATE aparelhos SET venda_id = (SELECT id FROM v) WHERE id = '4345f4be-74ce-411b-926f-187606e9b600';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em) SELECT gen_random_uuid(), venda_id, 'pix', 1450.0, '2026-06-28', '97f12885-87ad-426a-8bbb-656889d82e10', 1, '2026-06-28T14:00:00+00' FROM aparelhos WHERE id = '4345f4be-74ce-411b-926f-187606e9b600';

-- === Linha 668: APPLE PENCIL PRO BRANCA NOVA (28/06/2026) | Marcela | ONLINE ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes) VALUES ('1a173e9d-2cee-4ca9-96e8-bde442d5f76e', 'Apple', 'APPLE PENCIL PRO BRANCA NOVA', NULL, 850.0, 720.0, 21, 'seminovo', 'bom', 'vendido', '2026-06-28T14:00:00+00', '2026-06-28T14:00:00+00', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-06-28T14:00:00+00', '2026-06-28T14:00:00+00', 'pgto forcado pix (extracao nao confiavel)');
INSERT INTO vendas (cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por) VALUES (current_setting('importacao.cliente_id')::uuid, 21, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 850.0, 850.0, 0, '2026-06-28T14:00:00+00', '2026-06-28T14:00:00+00', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
WITH v AS (SELECT id FROM vendas WHERE vendedor_id = 'a3626643-4749-4e56-83bc-b4a8ffd53659' AND loja_id = 21 AND criado_em = '2026-06-28T14:00:00+00' AND valor_total = 850.0 ORDER BY numero_venda DESC LIMIT 1) UPDATE aparelhos SET venda_id = (SELECT id FROM v) WHERE id = '1a173e9d-2cee-4ca9-96e8-bde442d5f76e';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em) SELECT gen_random_uuid(), venda_id, 'pix', 850.0, '2026-06-28', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1, '2026-06-28T14:00:00+00' FROM aparelhos WHERE id = '1a173e9d-2cee-4ca9-96e8-bde442d5f76e';

-- === Linha 680: FONTE APPLE ORIGINAL NOVO (30/06/2026) | Marcela | ONLINE ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes) VALUES ('7af2ae73-d2ed-41f5-9388-0133e91de135', 'Outros', 'FONTE APPLE ORIGINAL NOVO', NULL, 200.0, 125.0, 21, 'novo', 'perfeito', 'vendido', '2026-06-30T14:00:00+00', '2026-06-30T14:00:00+00', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-06-30T14:00:00+00', '2026-06-30T14:00:00+00', 'pgto forcado pix (extracao nao confiavel)');
INSERT INTO vendas (cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por) VALUES (current_setting('importacao.cliente_id')::uuid, 21, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 200.0, 200.0, 0, '2026-06-30T14:00:00+00', '2026-06-30T14:00:00+00', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
WITH v AS (SELECT id FROM vendas WHERE vendedor_id = 'a3626643-4749-4e56-83bc-b4a8ffd53659' AND loja_id = 21 AND criado_em = '2026-06-30T14:00:00+00' AND valor_total = 200.0 ORDER BY numero_venda DESC LIMIT 1) UPDATE aparelhos SET venda_id = (SELECT id FROM v) WHERE id = '7af2ae73-d2ed-41f5-9388-0133e91de135';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em) SELECT gen_random_uuid(), venda_id, 'pix', 200.0, '2026-06-30', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1, '2026-06-30T14:00:00+00' FROM aparelhos WHERE id = '7af2ae73-d2ed-41f5-9388-0133e91de135';

-- === Linha 683: IPAD 11 128GB SILVER NOVO (30/06/2026) | Marcela | ONLINE ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes) VALUES ('510d8504-7f5b-4ef7-a029-623fa1312c53', 'Apple', 'IPAD 11 128GB SILVER NOVO', NULL, 2952.0, 2650.0, 21, 'novo', 'perfeito', 'vendido', '2026-06-30T14:00:00+00', '2026-06-30T14:00:00+00', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-06-30T14:00:00+00', '2026-06-30T14:00:00+00', NULL);
INSERT INTO vendas (cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por) VALUES (current_setting('importacao.cliente_id')::uuid, 21, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 2952.0, 2952.0, 0, '2026-06-30T14:00:00+00', '2026-06-30T14:00:00+00', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
WITH v AS (SELECT id FROM vendas WHERE vendedor_id = 'a3626643-4749-4e56-83bc-b4a8ffd53659' AND loja_id = 21 AND criado_em = '2026-06-30T14:00:00+00' AND valor_total = 2952.0 ORDER BY numero_venda DESC LIMIT 1) UPDATE aparelhos SET venda_id = (SELECT id FROM v) WHERE id = '510d8504-7f5b-4ef7-a029-623fa1312c53';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em) SELECT gen_random_uuid(), venda_id, 'pix', 2600.0, '2026-06-30', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1, '2026-06-30T14:00:00+00' FROM aparelhos WHERE id = '510d8504-7f5b-4ef7-a029-623fa1312c53';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em) SELECT gen_random_uuid(), venda_id, 'cartao_credito', 352.0, '2026-06-30', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1, '2026-06-30T14:00:00+00' FROM aparelhos WHERE id = '510d8504-7f5b-4ef7-a029-623fa1312c53';
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em) SELECT gen_random_uuid(), 21, venda_id, 'Brinde', 170.0, '2026-06-30', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-06-30T14:00:00+00' FROM aparelhos WHERE id = '510d8504-7f5b-4ef7-a029-623fa1312c53';

-- === Linha 687: REDMI PAD 2 256GB CINZA NOVO (30/06/2026) | Ronald | CASES ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes) VALUES ('83b3c8d5-f615-4396-abd9-d9100903dfdd', 'Xiaomi', 'REDMI PAD 2 256GB CINZA NOVO', NULL, 1410.0, 1230.0, 19, 'novo', 'perfeito', 'vendido', '2026-06-30T14:00:00+00', '2026-06-30T14:00:00+00', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-06-30T14:00:00+00', '2026-06-30T14:00:00+00', NULL);
INSERT INTO vendas (cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por) VALUES (current_setting('importacao.cliente_id')::uuid, 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 1410.0, 1466.46, 0, '2026-06-30T14:00:00+00', '2026-06-30T14:00:00+00', '97f12885-87ad-426a-8bbb-656889d82e10');
WITH v AS (SELECT id FROM vendas WHERE vendedor_id = '97f12885-87ad-426a-8bbb-656889d82e10' AND loja_id = 19 AND criado_em = '2026-06-30T14:00:00+00' AND valor_total = 1410.0 ORDER BY numero_venda DESC LIMIT 1) UPDATE aparelhos SET venda_id = (SELECT id FROM v) WHERE id = '83b3c8d5-f615-4396-abd9-d9100903dfdd';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em) SELECT gen_random_uuid(), venda_id, 'cartao_credito', 1466.46, '2026-06-30', '97f12885-87ad-426a-8bbb-656889d82e10', 1, '2026-06-30T14:00:00+00' FROM aparelhos WHERE id = '83b3c8d5-f615-4396-abd9-d9100903dfdd';
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em) SELECT gen_random_uuid(), 19, venda_id, 'Brinde', 60.0, '2026-06-30', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-06-30T14:00:00+00' FROM aparelhos WHERE id = '83b3c8d5-f615-4396-abd9-d9100903dfdd';

-- === Linha 711: SAMSUNG TAB A11+ 256GB SILVER NOVO (02/07/2026) | Ronald | CASES ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes) VALUES ('2e203ec0-b028-47ed-a849-5dfd9b0da971', 'Samsung', 'SAMSUNG TAB A11+ 256GB SILVER NOVO', NULL, 2000.0, 1690.0, 19, 'novo', 'perfeito', 'vendido', '2026-07-02T14:00:00+00', '2026-07-02T14:00:00+00', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-07-02T14:00:00+00', '2026-07-02T14:00:00+00', 'pgto forcado pix (extracao nao confiavel)');
INSERT INTO vendas (cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por) VALUES (current_setting('importacao.cliente_id')::uuid, 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 2000.0, 2000.0, 0, '2026-07-02T14:00:00+00', '2026-07-02T14:00:00+00', '97f12885-87ad-426a-8bbb-656889d82e10');
WITH v AS (SELECT id FROM vendas WHERE vendedor_id = '97f12885-87ad-426a-8bbb-656889d82e10' AND loja_id = 19 AND criado_em = '2026-07-02T14:00:00+00' AND valor_total = 2000.0 ORDER BY numero_venda DESC LIMIT 1) UPDATE aparelhos SET venda_id = (SELECT id FROM v) WHERE id = '2e203ec0-b028-47ed-a849-5dfd9b0da971';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em) SELECT gen_random_uuid(), venda_id, 'pix', 2000.0, '2026-07-02', '97f12885-87ad-426a-8bbb-656889d82e10', 1, '2026-07-02T14:00:00+00' FROM aparelhos WHERE id = '2e203ec0-b028-47ed-a849-5dfd9b0da971';
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em) SELECT gen_random_uuid(), 19, venda_id, 'Brinde', 60.0, '2026-07-02', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-07-02T14:00:00+00' FROM aparelhos WHERE id = '2e203ec0-b028-47ed-a849-5dfd9b0da971';

-- PULADO (valor zero) linha 713: IPHONE 15 128GB LILAS SEMINOVO - GARANTIA
-- PULADO (SEM IMEI, provavel duplicata por modelo+valor) linha 721: IPHONE 14 128GB PRETO SEMINOVO R$ 2200.0
-- === Linha 724: FONTE APPLE NOVA (02/07/2026) | Rayssa | CELL ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes) VALUES ('128478fa-6782-48db-92bd-c525c2fcbb9f', 'Outros', 'FONTE APPLE NOVA', NULL, 180.0, 125.0, 1, 'seminovo', 'bom', 'vendido', '2026-07-02T14:00:00+00', '2026-07-02T14:00:00+00', '5eb6b371-bb58-48c5-8334-4de118c1741f', '2026-07-02T14:00:00+00', '2026-07-02T14:00:00+00', NULL);
INSERT INTO vendas (cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por) VALUES (current_setting('importacao.cliente_id')::uuid, 1, '5eb6b371-bb58-48c5-8334-4de118c1741f', 'concluida', 'normal', 180.0, 2.0, 0, '2026-07-02T14:00:00+00', '2026-07-02T14:00:00+00', '5eb6b371-bb58-48c5-8334-4de118c1741f');
WITH v AS (SELECT id FROM vendas WHERE vendedor_id = '5eb6b371-bb58-48c5-8334-4de118c1741f' AND loja_id = 1 AND criado_em = '2026-07-02T14:00:00+00' AND valor_total = 180.0 ORDER BY numero_venda DESC LIMIT 1) UPDATE aparelhos SET venda_id = (SELECT id FROM v) WHERE id = '128478fa-6782-48db-92bd-c525c2fcbb9f';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em) SELECT gen_random_uuid(), venda_id, 'pix', 2.0, '2026-07-02', '5eb6b371-bb58-48c5-8334-4de118c1741f', 1, '2026-07-02T14:00:00+00' FROM aparelhos WHERE id = '128478fa-6782-48db-92bd-c525c2fcbb9f';

-- PULADO (data invalida) linha 727: 
-- PULADO (data invalida) linha 728: 
-- PULADO (data invalida) linha 729: 
-- PULADO (data invalida) linha 730: 
-- PULADO (data invalida) linha 731: 
-- PULADO (data invalida) linha 732: 
-- PULADO (data invalida) linha 733: 
-- PULADO (data invalida) linha 734: 
-- PULADO (data invalida) linha 735: 
-- PULADO (data invalida) linha 736: 
-- PULADO (data invalida) linha 737: 
-- PULADO (data invalida) linha 738: 
-- PULADO (data invalida) linha 739: 
-- PULADO (data invalida) linha 740: 
-- PULADO (data invalida) linha 741: 
-- PULADO (data invalida) linha 742: 
-- PULADO (data invalida) linha 743: 
-- PULADO (data invalida) linha 744: 
-- PULADO (data invalida) linha 745: 
-- PULADO (data invalida) linha 746: 
-- PULADO (data invalida) linha 747: 
COMMIT;

-- ================= RESUMO =================
-- Total linhas CSV:        746
-- IMPORTADOS:              20  (com IMEI + sem-IMEI provavel-novo)
--   dos quais sem IMEI:    20  (imei NULL - REVISAR)
-- Pulados IMEI ja vendido: 0
-- Pulados IMEI dup no CSV: 0
-- Pulados sem-IMEI dup:    108  (heuristica modelo+valor)
-- Pulados vendedor s/cad:  0  []
-- Pulados loja s/mapa:     0
-- Pulados valor zero:      2
-- Pulados data invalida:   21
-- Pgto forcado pix:        10
-- Brindes / Trocas:        9 / 2
-- =========================================