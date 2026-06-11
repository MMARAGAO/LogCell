-- ============================================
-- Script de importacao gerado em 2026-06-10 18:05:07.906422
-- Fonte: vendas_final.csv (337 linhas NAO)
-- ============================================

BEGIN;

-- ============================================
-- 1. CRIAR CLIENTE PADRAO (se nao existir)
-- ============================================
DO $$
DECLARE
    v_cliente_id UUID;
BEGIN
    SELECT id INTO v_cliente_id FROM clientes WHERE nome = 'Cliente Balcao' LIMIT 1;
    IF v_cliente_id IS NULL THEN
        INSERT INTO clientes (id, nome, id_loja, criado_em, atualizado_em)
        VALUES (gen_random_uuid(), 'Cliente Balcao', 1, NOW(), NOW())
        RETURNING id INTO v_cliente_id;
    END IF;
    PERFORM set_config('importacao.cliente_id', v_cliente_id::text, true);
END;
$$;

-- === VENDA 11065: REDMI PAD 2 128GB GRAFIT NOVO (30/06/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('2963f9ac-1b67-4878-add9-2f58da813893', 'Xiaomi', 'REDMI PAD 2 128GB GRAFIT NOVO', '65520/W5Z501219', 1200.0, 900.0, 1, 'novo', 'perfeito', 'vendido', '2026-06-30', '2026-06-30', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-06-30', '2026-06-30', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('592dd6a3-be52-4b45-bb17-307756e001ab', 11065, current_setting('importacao.cliente_id')::uuid, 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 1200.0, 1200.0, 0.0, '2026-06-30', '2026-06-30', '85e3aa42-b9af-49b8-a72a-64e9c337aa53');
UPDATE aparelhos SET venda_id = '592dd6a3-be52-4b45-bb17-307756e001ab' WHERE id = '2963f9ac-1b67-4878-add9-2f58da813893';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('c8d44964-0c8c-49d5-a4c8-1382594d9eeb', '592dd6a3-be52-4b45-bb17-307756e001ab', 'pix', 1200.0, '2026-06-30', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 1);

-- === VENDA 11066: MI 15T PRO 512GB PRETO NOVO (01/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('55939de5-3f9d-45b5-aaf2-91fc4f2b48a9', 'Xiaomi', 'MI 15T PRO 512GB PRETO NOVO', '860786082136022', 5250.0, 5000.0, 4, 'novo', 'perfeito', 'vendido', '2026-05-01', '2026-05-01', 'e07d4d35-1381-4d4d-914d-8382a7456fdd', '2026-05-01', '2026-05-01', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('d97ddfdb-abcf-48f5-9419-f52bd7899c9f', 11066, current_setting('importacao.cliente_id')::uuid, 4, 'e07d4d35-1381-4d4d-914d-8382a7456fdd', 'concluida', 'normal', 5250.0, 5250.0, 0.0, '2026-05-01', '2026-05-01', 'e07d4d35-1381-4d4d-914d-8382a7456fdd');
UPDATE aparelhos SET venda_id = 'd97ddfdb-abcf-48f5-9419-f52bd7899c9f' WHERE id = '55939de5-3f9d-45b5-aaf2-91fc4f2b48a9';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('f65d80f8-64bb-40cb-b5be-08e62096bf2b', 'd97ddfdb-abcf-48f5-9419-f52bd7899c9f', 'pix', 800.0, '2026-05-01', 'e07d4d35-1381-4d4d-914d-8382a7456fdd', 1);
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, observacao, parcelas)
VALUES ('12bda081-f852-42c7-8820-8de0a126a073', 'd97ddfdb-abcf-48f5-9419-f52bd7899c9f', 'troca_aparelho', 4450.0, '2026-05-01', 'e07d4d35-1381-4d4d-914d-8382a7456fdd', 'Troca: IPHONE 16 PRO 256GB PRETO', 1);

-- === VENDA 11067: IPHONE 17 PRO MAX 256GB LARANJA NOVO (01/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('30e05bd3-0cb8-4d92-8882-7017d2a8b259', 'Apple', 'IPHONE 17 PRO MAX 256GB LARANJA NOVO', '352116262845892', 8424.0, 8200.0, 4, 'novo', 'perfeito', 'vendido', '2026-05-01', '2026-05-01', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-01', '2026-05-01', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('ff987a64-57e3-4db1-9672-6bbabea0c3dd', 11067, current_setting('importacao.cliente_id')::uuid, 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 8424.0, 8424.0, 0.0, '2026-05-01', '2026-05-01', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
UPDATE aparelhos SET venda_id = 'ff987a64-57e3-4db1-9672-6bbabea0c3dd' WHERE id = '30e05bd3-0cb8-4d92-8882-7017d2a8b259';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('2cc722c4-dd0e-4f82-97ae-f2ad639fc07f', 'ff987a64-57e3-4db1-9672-6bbabea0c3dd', 'cartao_credito', 6624.0, '2026-05-01', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1);
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, observacao, parcelas)
VALUES ('e3b19254-3b97-4de4-a507-2a875fbf741f', 'ff987a64-57e3-4db1-9672-6bbabea0c3dd', 'troca_aparelho', 1800.0, '2026-05-01', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'Troca: 14 128 LILAS SEMINOVO', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('12d89475-a53d-4fe7-8aff-48c7bbabc175', 4, 'ff987a64-57e3-4db1-9672-6bbabea0c3dd', 'Brinde', 5.0, '2026-05-01', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-01');

-- === VENDA 11068: IPHONE 16 PRO MAX 512GB BRANCO SEMINOVO (01/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('ba503c99-0530-4880-b871-50687dfaa321', 'Apple', 'IPHONE 16 PRO MAX 512GB BRANCO SEMINOVO', '355300182456355', 5700.0, 5150.0, 1, 'seminovo', 'bom', 'vendido', '2026-05-01', '2026-05-01', '9451cd9f-6770-4e32-aae8-c75fa675e818', '2026-05-01', '2026-05-01', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('b7a6d819-962c-4a47-9a35-338ee087daff', 11068, current_setting('importacao.cliente_id')::uuid, 1, '9451cd9f-6770-4e32-aae8-c75fa675e818', 'concluida', 'normal', 5700.0, 5700.0, 0.0, '2026-05-01', '2026-05-01', '9451cd9f-6770-4e32-aae8-c75fa675e818');
UPDATE aparelhos SET venda_id = 'b7a6d819-962c-4a47-9a35-338ee087daff' WHERE id = 'ba503c99-0530-4880-b871-50687dfaa321';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('0fd1f6d3-86cd-4935-a4c6-02c57c8703fb', 'b7a6d819-962c-4a47-9a35-338ee087daff', 'pix', 3700.0, '2026-05-01', '9451cd9f-6770-4e32-aae8-c75fa675e818', 1);
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, observacao, parcelas)
VALUES ('3edd9a84-2cd3-49d8-bd7e-5b79886e681f', 'b7a6d819-962c-4a47-9a35-338ee087daff', 'troca_aparelho', 2000.0, '2026-05-01', '9451cd9f-6770-4e32-aae8-c75fa675e818', 'Troca: IPHONE 12 PRO MAX 128GB', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('c544edc2-046e-4843-9122-16e62622bc88', 1, 'b7a6d819-962c-4a47-9a35-338ee087daff', 'Brinde', 115.0, '2026-05-01', '9451cd9f-6770-4e32-aae8-c75fa675e818', '2026-05-01');

-- === VENDA 11069: IPHONE 16 PRO MAX  1TB PRETO SEMINOVO (01/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('25e85660-c5ff-49d6-9b04-bf437b75923b', 'Apple', 'IPHONE 16 PRO MAX  1TB PRETO SEMINOVO', '355138329181332', 5800.0, 5350.0, 1, 'seminovo', 'bom', 'vendido', '2026-05-01', '2026-05-01', '9451cd9f-6770-4e32-aae8-c75fa675e818', '2026-05-01', '2026-05-01', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('4489cd45-f1a5-4f5a-892e-2ebbb0b8eefc', 11069, current_setting('importacao.cliente_id')::uuid, 1, '9451cd9f-6770-4e32-aae8-c75fa675e818', 'concluida', 'normal', 5800.0, 5800.0, 0.0, '2026-05-01', '2026-05-01', '9451cd9f-6770-4e32-aae8-c75fa675e818');
UPDATE aparelhos SET venda_id = '4489cd45-f1a5-4f5a-892e-2ebbb0b8eefc' WHERE id = '25e85660-c5ff-49d6-9b04-bf437b75923b';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('9d705a96-ee47-473c-9bac-1f1c1607f30f', '4489cd45-f1a5-4f5a-892e-2ebbb0b8eefc', 'pix', 5800.0, '2026-05-01', '9451cd9f-6770-4e32-aae8-c75fa675e818', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('3e6f2bb2-d8f4-4c5c-b13b-ad1818bfa4bb', 1, '4489cd45-f1a5-4f5a-892e-2ebbb0b8eefc', 'Brinde', 25.0, '2026-05-01', '9451cd9f-6770-4e32-aae8-c75fa675e818', '2026-05-01');

-- === VENDA 11070: IPHONE 15 PRO MAX 256GB PRETO SEMINOVO (01/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('4161ddcb-7270-45b6-91c8-94588dc077a9', 'Apple', 'IPHONE 15 PRO MAX 256GB PRETO SEMINOVO', '356964467452295', 4340.0, 3950.0, 1, 'seminovo', 'bom', 'vendido', '2026-05-01', '2026-05-01', '9451cd9f-6770-4e32-aae8-c75fa675e818', '2026-05-01', '2026-05-01', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('25403fa5-dfad-4b2e-b94d-0aa563589ce8', 11070, current_setting('importacao.cliente_id')::uuid, 1, '9451cd9f-6770-4e32-aae8-c75fa675e818', 'concluida', 'normal', 4340.0, 4340.0, 0.0, '2026-05-01', '2026-05-01', '9451cd9f-6770-4e32-aae8-c75fa675e818');
UPDATE aparelhos SET venda_id = '25403fa5-dfad-4b2e-b94d-0aa563589ce8' WHERE id = '4161ddcb-7270-45b6-91c8-94588dc077a9';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('a44150b9-d59f-4e0c-a0b3-9cfc3878e182', '25403fa5-dfad-4b2e-b94d-0aa563589ce8', 'pix', 4340.0, '2026-05-01', '9451cd9f-6770-4e32-aae8-c75fa675e818', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('0f062259-876b-4d61-b848-ecb35f1ec922', 1, '25403fa5-dfad-4b2e-b94d-0aa563589ce8', 'Brinde', 25.0, '2026-05-01', '9451cd9f-6770-4e32-aae8-c75fa675e818', '2026-05-01');

-- === VENDA 11071: IPHONE 16 PRO MAX 256GB PRETO SEMINOVO (01/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('74381d4d-e51f-4fbe-8c1a-f305c85bad9e', 'Apple', 'IPHONE 16 PRO MAX 256GB PRETO SEMINOVO', '356541623888990', 5550.0, 5000.0, 1, 'seminovo', 'bom', 'vendido', '2026-05-01', '2026-05-01', '9451cd9f-6770-4e32-aae8-c75fa675e818', '2026-05-01', '2026-05-01', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('1bfecbfb-0c0c-4b2a-9971-efab51650444', 11071, current_setting('importacao.cliente_id')::uuid, 1, '9451cd9f-6770-4e32-aae8-c75fa675e818', 'concluida', 'normal', 5550.0, 5550.0, 0.0, '2026-05-01', '2026-05-01', '9451cd9f-6770-4e32-aae8-c75fa675e818');
UPDATE aparelhos SET venda_id = '1bfecbfb-0c0c-4b2a-9971-efab51650444' WHERE id = '74381d4d-e51f-4fbe-8c1a-f305c85bad9e';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('30f238af-30c8-495e-b401-6311a0a0bd2e', '1bfecbfb-0c0c-4b2a-9971-efab51650444', 'pix', 2550.0, '2026-05-01', '9451cd9f-6770-4e32-aae8-c75fa675e818', 1);
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, observacao, parcelas)
VALUES ('6571081d-23e7-4e08-9986-8226fcb7e42d', '1bfecbfb-0c0c-4b2a-9971-efab51650444', 'troca_aparelho', 3000.0, '2026-05-01', '9451cd9f-6770-4e32-aae8-c75fa675e818', 'Troca: IPHONE 14 PRO MAX 128GB', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('5bf0e9e7-9022-4c82-b563-f1f198de616c', 1, '1bfecbfb-0c0c-4b2a-9971-efab51650444', 'Brinde', 25.0, '2026-05-01', '9451cd9f-6770-4e32-aae8-c75fa675e818', '2026-05-01');

-- === VENDA 11072: IPHONE 17 PRO SILVER 256GB NOVO (01/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('e1a03c83-a9b4-4c16-84c6-2f695c36c6c9', 'Apple', 'IPHONE 17 PRO SILVER 256GB NOVO', '352001997459930', 7900.0, 7600.0, 19, 'novo', 'perfeito', 'vendido', '2026-05-01', '2026-05-01', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-01', '2026-05-01', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('88b448ab-26af-4744-8ebe-8013a8380a40', 11072, current_setting('importacao.cliente_id')::uuid, 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 7900.0, 7900.0, 0.0, '2026-05-01', '2026-05-01', '97f12885-87ad-426a-8bbb-656889d82e10');
UPDATE aparelhos SET venda_id = '88b448ab-26af-4744-8ebe-8013a8380a40' WHERE id = 'e1a03c83-a9b4-4c16-84c6-2f695c36c6c9';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('59d48876-3ab5-4b65-8007-dc6270350484', '88b448ab-26af-4744-8ebe-8013a8380a40', 'pix', 3500.0, '2026-05-01', '97f12885-87ad-426a-8bbb-656889d82e10', 1);
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, observacao, parcelas)
VALUES ('0c981555-4716-4afd-9b98-3937820b7fde', '88b448ab-26af-4744-8ebe-8013a8380a40', 'troca_aparelho', 4400.0, '2026-05-01', '97f12885-87ad-426a-8bbb-656889d82e10', 'Troca: IPHONE 16 PRO', 1);

-- === VENDA 11073: IPHONE 14 PRO MAX 128GB ROXO SEMINOVO (01/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('396fcf1b-0dcf-4b8a-a9f1-77072c00d684', 'Apple', 'IPHONE 14 PRO MAX 128GB ROXO SEMINOVO', '357650618525795', 3500.0, 3250.0, 20, 'seminovo', 'bom', 'vendido', '2026-05-01', '2026-05-01', '25e2da5b-9e76-4388-9890-7e22efd6940d', '2026-05-01', '2026-05-01', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('0e7a95c2-804f-49d6-9a50-b7d0360336ba', 11073, current_setting('importacao.cliente_id')::uuid, 20, '25e2da5b-9e76-4388-9890-7e22efd6940d', 'concluida', 'normal', 3500.0, 3500.0, 0.0, '2026-05-01', '2026-05-01', '25e2da5b-9e76-4388-9890-7e22efd6940d');
UPDATE aparelhos SET venda_id = '0e7a95c2-804f-49d6-9a50-b7d0360336ba' WHERE id = '396fcf1b-0dcf-4b8a-a9f1-77072c00d684';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('eb59114f-9d07-4c26-ae13-1127406e91ba', '0e7a95c2-804f-49d6-9a50-b7d0360336ba', 'pix', 3500.0, '2026-05-01', '25e2da5b-9e76-4388-9890-7e22efd6940d', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('57eca1f7-1e4b-4285-9c2f-9abf0e2034e5', 20, '0e7a95c2-804f-49d6-9a50-b7d0360336ba', 'Brinde', 15.0, '2026-05-01', '25e2da5b-9e76-4388-9890-7e22efd6940d', '2026-05-01');

-- === VENDA 11074: IPHONE 12 PRO MAX 256GB GOLD SEMINOVO (01/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('77ff8bcf-196f-413d-b6b2-e3bf41ecbf89', 'Apple', 'IPHONE 12 PRO MAX 256GB GOLD SEMINOVO', '350408484865846', 2600.0, 2350.0, 1, 'seminovo', 'bom', 'vendido', '2026-05-01', '2026-05-01', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-01', '2026-05-01', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('0fd5157a-538a-409f-811c-f30a60930af7', 11074, current_setting('importacao.cliente_id')::uuid, 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 2600.0, 2600.0, 0.0, '2026-05-01', '2026-05-01', '85e3aa42-b9af-49b8-a72a-64e9c337aa53');
UPDATE aparelhos SET venda_id = '0fd5157a-538a-409f-811c-f30a60930af7' WHERE id = '77ff8bcf-196f-413d-b6b2-e3bf41ecbf89';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('ec1aa61e-fb44-46a3-8d0c-a302313ca0c0', '0fd5157a-538a-409f-811c-f30a60930af7', 'pix', 2600.0, '2026-05-01', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('71740ca8-fe25-4476-96ed-738dfda370b5', 1, '0fd5157a-538a-409f-811c-f30a60930af7', 'Brinde', 25.0, '2026-05-01', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-01');

-- === VENDA 11075: IPHONE 14 PRO MAX 256GB ROXO SEMINOVO (01/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('ef0681fd-187d-45a3-a25c-8211fc906f1b', 'Apple', 'IPHONE 14 PRO MAX 256GB ROXO SEMINOVO', '353665909220967', 3460.0, 3300.0, 1, 'seminovo', 'bom', 'vendido', '2026-05-01', '2026-05-01', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-01', '2026-05-01', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('cbeef1c4-d611-4729-b465-9a1b869570c5', 11075, current_setting('importacao.cliente_id')::uuid, 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 3460.0, 3460.0, 0.0, '2026-05-01', '2026-05-01', '85e3aa42-b9af-49b8-a72a-64e9c337aa53');
UPDATE aparelhos SET venda_id = 'cbeef1c4-d611-4729-b465-9a1b869570c5' WHERE id = 'ef0681fd-187d-45a3-a25c-8211fc906f1b';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('9aa26e3b-7313-45dd-b70b-b7f00faedc2f', 'cbeef1c4-d611-4729-b465-9a1b869570c5', 'pix', 3460.0, '2026-05-01', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('70e517e7-dbd1-4843-bd5d-4233f593004e', 1, 'cbeef1c4-d611-4729-b465-9a1b869570c5', 'Brinde', 25.0, '2026-05-01', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-01');

-- === VENDA 11076: IPHONE 16 PRO 256GB BRANCO SEMINOVO (01/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('27d5ab4a-b83f-4a80-84e6-ded675910ac9', 'Apple', 'IPHONE 16 PRO 256GB BRANCO SEMINOVO', '355515605909702', 5915.0, 4500.0, 1, 'seminovo', 'bom', 'vendido', '2026-05-01', '2026-05-01', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-01', '2026-05-01', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('a9f3bf84-016b-46cc-a56b-e90521af6001', 11076, current_setting('importacao.cliente_id')::uuid, 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 5915.0, 5915.0, 0.0, '2026-05-01', '2026-05-01', '85e3aa42-b9af-49b8-a72a-64e9c337aa53');
UPDATE aparelhos SET venda_id = 'a9f3bf84-016b-46cc-a56b-e90521af6001' WHERE id = '27d5ab4a-b83f-4a80-84e6-ded675910ac9';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('e1a3fa71-204d-4efc-a071-c859cde6b403', 'a9f3bf84-016b-46cc-a56b-e90521af6001', 'pix', 2715.0, '2026-05-01', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 1);
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, observacao, parcelas)
VALUES ('d6c52f56-8121-4ce4-8245-c22b63ac6425', 'a9f3bf84-016b-46cc-a56b-e90521af6001', 'troca_aparelho', 3200.0, '2026-05-01', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'Troca: IPH 15 PRO MAX 256GB NATURAL', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('d8f214e9-1f34-4c41-9bfc-792528beebb1', 1, 'a9f3bf84-016b-46cc-a56b-e90521af6001', 'Brinde', 25.0, '2026-05-01', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-01');

-- === VENDA 11077: IPHONE 16 PRO MAX 512GB NATURAL SEMINOVO (01/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('dc8ac92c-fdfc-4500-9836-ef873cf01429', 'Apple', 'IPHONE 16 PRO MAX 512GB NATURAL SEMINOVO', '355138329035488', 5525.0, 5150.0, 1, 'seminovo', 'bom', 'vendido', '2026-05-01', '2026-05-01', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-01', '2026-05-01', 'Pagto junto (Aparelho 1/2, total grupo R$ 11,050)');
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('108366b0-6eb6-4a46-965b-df4ee8d6c20d', 11077, current_setting('importacao.cliente_id')::uuid, 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 5525.0, 5525.0, 0.0, '2026-05-01', '2026-05-01', '85e3aa42-b9af-49b8-a72a-64e9c337aa53');
UPDATE aparelhos SET venda_id = '108366b0-6eb6-4a46-965b-df4ee8d6c20d' WHERE id = 'dc8ac92c-fdfc-4500-9836-ef873cf01429';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('3fbaa907-8b0a-4e0a-910a-1ee30adfeee8', '108366b0-6eb6-4a46-965b-df4ee8d6c20d', 'pix', 5525.0, '2026-05-01', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('d19aa681-1ce7-4adb-b19e-03e88ea60ebe', 1, '108366b0-6eb6-4a46-965b-df4ee8d6c20d', 'Brinde', 25.0, '2026-05-01', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-01');

-- === VENDA 11078: IPHONE 16 PRO MAX 256GB NATURAL SEMINOVO (01/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('4d5b9ade-1738-4f1b-ba98-d8350ffa189c', 'Apple', 'IPHONE 16 PRO MAX 256GB NATURAL SEMINOVO', '353484624594932', 5525.0, 5000.0, 1, 'seminovo', 'bom', 'vendido', '2026-05-01', '2026-05-01', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-01', '2026-05-01', 'Pagto junto (Aparelho 2/2, total grupo R$ 11,050)');
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('1d9473b4-8b4f-471d-a15f-5bd91bbc79ab', 11078, current_setting('importacao.cliente_id')::uuid, 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 5525.0, 5525.0, 0.0, '2026-05-01', '2026-05-01', '85e3aa42-b9af-49b8-a72a-64e9c337aa53');
UPDATE aparelhos SET venda_id = '1d9473b4-8b4f-471d-a15f-5bd91bbc79ab' WHERE id = '4d5b9ade-1738-4f1b-ba98-d8350ffa189c';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('70bf441f-46b5-4213-99a9-0b6dac9b2736', '1d9473b4-8b4f-471d-a15f-5bd91bbc79ab', 'pix', 2775.0, '2026-05-01', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 1);
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, observacao, parcelas)
VALUES ('d63467f3-6a47-4f59-a645-15e6983a8433', '1d9473b4-8b4f-471d-a15f-5bd91bbc79ab', 'troca_aparelho', 2750.0, '2026-05-01', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'Troca: IPH 15 128GB', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('6e385cac-866d-46ea-8b36-27066879f237', 1, '1d9473b4-8b4f-471d-a15f-5bd91bbc79ab', 'Brinde', 25.0, '2026-05-01', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-01');

-- === VENDA 11079: MACBOOK M1 SPACE 8/256 SEMINOVO (01/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('85835bb0-8a5a-47ed-90a9-8770af0f98d6', 'Apple', 'MACBOOK M1 SPACE 8/256 SEMINOVO', 'C02G79MTQ6L7', 4100.0, 3900.0, 1, 'seminovo', 'bom', 'vendido', '2026-05-01', '2026-05-01', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-01', '2026-05-01', 'Pagto junto (Aparelho 1/2, total grupo R$ 10,360)');
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('81af8e8f-0601-4715-ae0f-c3e97f0b10fb', 11079, current_setting('importacao.cliente_id')::uuid, 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 4100.0, 4100.0, 0.0, '2026-05-01', '2026-05-01', '85e3aa42-b9af-49b8-a72a-64e9c337aa53');
UPDATE aparelhos SET venda_id = '81af8e8f-0601-4715-ae0f-c3e97f0b10fb' WHERE id = '85835bb0-8a5a-47ed-90a9-8770af0f98d6';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('e8eb2567-1e58-4bd5-b229-430109e141d8', '81af8e8f-0601-4715-ae0f-c3e97f0b10fb', 'pix', 4100.0, '2026-05-01', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 1);

-- === VENDA 11080: IPHONE 16 PRO MAX BRANCO 1TB SEMINOVO (01/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('8bc6d9e4-cfb9-462a-bc62-343405dac645', 'Apple', 'IPHONE 16 PRO MAX BRANCO 1TB SEMINOVO', '357177506679088', 6260.0, 5350.0, 1, 'seminovo', 'bom', 'vendido', '2026-05-01', '2026-05-01', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-01', '2026-05-01', 'Pagto junto (Aparelho 2/2, total grupo R$ 10,360)');
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('8ffca8f3-057d-4b69-bda9-efd23b46d79b', 11080, current_setting('importacao.cliente_id')::uuid, 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 6260.0, 6260.0, 0.0, '2026-05-01', '2026-05-01', '85e3aa42-b9af-49b8-a72a-64e9c337aa53');
UPDATE aparelhos SET venda_id = '8ffca8f3-057d-4b69-bda9-efd23b46d79b' WHERE id = '8bc6d9e4-cfb9-462a-bc62-343405dac645';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('df51fdb6-9520-4e9c-9005-4da78944013c', '8ffca8f3-057d-4b69-bda9-efd23b46d79b', 'pix', 2310.0, '2026-05-01', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 1);
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, observacao, parcelas)
VALUES ('9cd3fd5c-a00a-4652-bcde-3d216d7810da', '8ffca8f3-057d-4b69-bda9-efd23b46d79b', 'troca_aparelho', 3950.0, '2026-05-01', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'Troca: IPH 15 PRO MAX 256GB AZUL', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('49a73d7c-cf04-402a-b4ba-2f0487a5abb4', 1, '8ffca8f3-057d-4b69-bda9-efd23b46d79b', 'Brinde', 25.0, '2026-05-01', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-01');

-- === VENDA 11081: APPLE WATCH SERIE 11 46MM SPACE GRAY NOVO (02/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('b361012c-2688-4398-9bfe-1aa40179817a', 'Apple', 'APPLE WATCH SERIE 11 46MM SPACE GRAY NOVO', 'KXJL4WFK4P', 2450.0, 2350.0, 4, 'novo', 'perfeito', 'vendido', '2026-05-02', '2026-05-02', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-02', '2026-05-02', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('3274d564-5914-44db-8aaa-783422355d90', 11081, current_setting('importacao.cliente_id')::uuid, 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 2450.0, 2450.0, 0.0, '2026-05-02', '2026-05-02', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
UPDATE aparelhos SET venda_id = '3274d564-5914-44db-8aaa-783422355d90' WHERE id = 'b361012c-2688-4398-9bfe-1aa40179817a';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('503dfc81-1bd1-48ad-9577-b36be9f4dd48', '3274d564-5914-44db-8aaa-783422355d90', 'cartao_credito', 2450.0, '2026-05-02', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1);

-- === VENDA 11082: IPHONE 14 128GB BRANCO SEMINOVO (02/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('a2fbd50d-e430-42ed-8e8c-cba1e1b11c54', 'Apple', 'IPHONE 14 128GB BRANCO SEMINOVO', '350671525377135', 2199.0, 2050.0, 19, 'seminovo', 'bom', 'vendido', '2026-05-02', '2026-05-02', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-02', '2026-05-02', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('f59550c0-5c87-404e-91bc-bc134b782150', 11082, current_setting('importacao.cliente_id')::uuid, 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 2199.0, 2199.0, 0.0, '2026-05-02', '2026-05-02', '97f12885-87ad-426a-8bbb-656889d82e10');
UPDATE aparelhos SET venda_id = 'f59550c0-5c87-404e-91bc-bc134b782150' WHERE id = 'a2fbd50d-e430-42ed-8e8c-cba1e1b11c54';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('24c8c830-08a3-4a17-a836-250283403ed8', 'f59550c0-5c87-404e-91bc-bc134b782150', 'pix', 2149.0, '2026-05-02', '97f12885-87ad-426a-8bbb-656889d82e10', 1);
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('2a23f88e-09dd-4681-9678-01191f7e421c', 'f59550c0-5c87-404e-91bc-bc134b782150', 'cartao_debito', 50.0, '2026-05-02', '97f12885-87ad-426a-8bbb-656889d82e10', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('4419943e-4818-4382-a1f0-bc229d11918e', 19, 'f59550c0-5c87-404e-91bc-bc134b782150', 'Brinde', 35.0, '2026-05-02', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-02');

-- === VENDA 11083: IPHONE 17 256GB LAVANDA NOVO (02/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('b40de2ca-60bb-46ba-b920-d2181fb0afb8', 'Apple', 'IPHONE 17 256GB LAVANDA NOVO', '359973613029086', 5300.0, 5050.0, 19, 'novo', 'perfeito', 'vendido', '2026-05-02', '2026-05-02', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-02', '2026-05-02', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('e9981cab-01a1-41d9-8db7-a09c0ce9dd78', 11083, current_setting('importacao.cliente_id')::uuid, 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 5300.0, 5300.0, 0.0, '2026-05-02', '2026-05-02', '97f12885-87ad-426a-8bbb-656889d82e10');
UPDATE aparelhos SET venda_id = 'e9981cab-01a1-41d9-8db7-a09c0ce9dd78' WHERE id = 'b40de2ca-60bb-46ba-b920-d2181fb0afb8';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('65b43800-020f-478e-b727-b9e9503fbd5b', 'e9981cab-01a1-41d9-8db7-a09c0ce9dd78', 'cartao_credito', 4600.0, '2026-05-02', '97f12885-87ad-426a-8bbb-656889d82e10', 1);
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, observacao, parcelas)
VALUES ('d5ecea5f-8de1-4cf8-b7e1-fb9ec8c168f6', 'e9981cab-01a1-41d9-8db7-a09c0ce9dd78', 'troca_aparelho', 700.0, '2026-05-02', '97f12885-87ad-426a-8bbb-656889d82e10', 'Troca: IPH 11 128GB BRANCO', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('71d55d48-b4ef-42a8-bd6a-70185298662a', 19, 'e9981cab-01a1-41d9-8db7-a09c0ce9dd78', 'Brinde', 20.0, '2026-05-02', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-02');

-- === VENDA 11084: APPLE WATCH ULTRA 3 PRETO NOVO (02/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('075d511b-ed3d-432b-b2e4-c51bb07b81ca', 'Apple', 'APPLE WATCH ULTRA 3 PRETO NOVO', '368135794662306', 4750.0, 4400.0, 19, 'novo', 'perfeito', 'vendido', '2026-05-02', '2026-05-02', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-02', '2026-05-02', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('49f6c882-9df5-4248-8310-c7934d781c15', 11084, current_setting('importacao.cliente_id')::uuid, 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 4750.0, 4750.0, 0.0, '2026-05-02', '2026-05-02', '97f12885-87ad-426a-8bbb-656889d82e10');
UPDATE aparelhos SET venda_id = '49f6c882-9df5-4248-8310-c7934d781c15' WHERE id = '075d511b-ed3d-432b-b2e4-c51bb07b81ca';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('123c5278-a7be-4eca-b57f-eb848f28b19c', '49f6c882-9df5-4248-8310-c7934d781c15', 'pix', 4750.0, '2026-05-02', '97f12885-87ad-426a-8bbb-656889d82e10', 1);

-- === VENDA 11085: IPHONE 15 PRO MAX 256GB NATURAL SEMINOVO (02/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('f5d98348-dfa3-4b4e-9ec6-351d387602a4', 'Apple', 'IPHONE 15 PRO MAX 256GB NATURAL SEMINOVO', '351465642570501', 4200.0, 3950.0, 1, 'seminovo', 'bom', 'vendido', '2026-05-02', '2026-05-02', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-02', '2026-05-02', 'Pagto junto (Aparelho 1/2, total grupo R$ 13,099)');
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('68ce3acd-612a-4f85-9b53-a9efedf179d9', 11085, current_setting('importacao.cliente_id')::uuid, 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 4200.0, 4200.0, 0.0, '2026-05-02', '2026-05-02', '85e3aa42-b9af-49b8-a72a-64e9c337aa53');
UPDATE aparelhos SET venda_id = '68ce3acd-612a-4f85-9b53-a9efedf179d9' WHERE id = 'f5d98348-dfa3-4b4e-9ec6-351d387602a4';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('bf4fdee4-a8e7-4f9b-ac07-660e32b11feb', '68ce3acd-612a-4f85-9b53-a9efedf179d9', 'pix', 3700.0, '2026-05-02', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 1);
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, observacao, parcelas)
VALUES ('6d5eba55-18f8-4837-9e00-fece6601ad90', '68ce3acd-612a-4f85-9b53-a9efedf179d9', 'troca_aparelho', 500.0, '2026-05-02', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'Troca: IPH XR 64GB PRETO', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('0dff106b-db07-4e47-9ff9-4f47b1fcea1d', 1, '68ce3acd-612a-4f85-9b53-a9efedf179d9', 'Brinde', 10.0, '2026-05-02', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-02');

-- === VENDA 11086: IPHONE 17 PRO MAX 256GB BRANCO NOVO (02/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('90e3dde2-88a6-48a5-b0ab-95f252b99d41', 'Apple', 'IPHONE 17 PRO MAX 256GB BRANCO NOVO', '350552896576341', 8899.0, 8300.0, 1, 'novo', 'perfeito', 'vendido', '2026-05-02', '2026-05-02', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-02', '2026-05-02', 'Pagto junto (Aparelho 2/2, total grupo R$ 13,099)');
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('e995838b-e63e-40ba-bf49-1b3fb3fc8fb5', 11086, current_setting('importacao.cliente_id')::uuid, 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 8899.0, 8899.0, 0.0, '2026-05-02', '2026-05-02', '85e3aa42-b9af-49b8-a72a-64e9c337aa53');
UPDATE aparelhos SET venda_id = 'e995838b-e63e-40ba-bf49-1b3fb3fc8fb5' WHERE id = '90e3dde2-88a6-48a5-b0ab-95f252b99d41';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('aab01bb0-35e8-4a51-b9d8-6a02fb5766b0', 'e995838b-e63e-40ba-bf49-1b3fb3fc8fb5', 'pix', 6649.0, '2026-05-02', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 1);
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, observacao, parcelas)
VALUES ('d303019a-522a-4751-99a5-ead08f478d28', 'e995838b-e63e-40ba-bf49-1b3fb3fc8fb5', 'troca_aparelho', 2250.0, '2026-05-02', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'Troca: IPH 13 PRO MAX 128GB PRETO', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('a29645d1-14d3-487c-8efc-f84178f21cca', 1, 'e995838b-e63e-40ba-bf49-1b3fb3fc8fb5', 'Brinde', 10.0, '2026-05-02', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-02');

-- === VENDA 11087: IPHONE 11 64GB PRETO SEMINOVO (03/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('3b8111ac-9ba1-40a3-a52f-54dcb5c58a93', 'Apple', 'IPHONE 11 64GB PRETO SEMINOVO', '352923110862460', 800.0, 650.0, 19, 'seminovo', 'bom', 'vendido', '2026-05-03', '2026-05-03', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-03', '2026-05-03', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('ddac7d61-521d-4160-b575-b8a5cf29cdb4', 11087, current_setting('importacao.cliente_id')::uuid, 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 800.0, 800.0, 0.0, '2026-05-03', '2026-05-03', '97f12885-87ad-426a-8bbb-656889d82e10');
UPDATE aparelhos SET venda_id = 'ddac7d61-521d-4160-b575-b8a5cf29cdb4' WHERE id = '3b8111ac-9ba1-40a3-a52f-54dcb5c58a93';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('a6d64657-cbc4-4d79-8493-46536d7ed5af', 'ddac7d61-521d-4160-b575-b8a5cf29cdb4', 'pix', 800.0, '2026-05-03', '97f12885-87ad-426a-8bbb-656889d82e10', 1);

-- === VENDA 11088: IPHONE 16 PRO 256GB PRETO SEMINOVO (03/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('c8712095-06d3-4f53-b7fb-6b361adfba02', 'Apple', 'IPHONE 16 PRO 256GB PRETO SEMINOVO', '355515607895768', 4700.0, 4450.0, 4, 'seminovo', 'bom', 'vendido', '2026-05-03', '2026-05-03', 'e07d4d35-1381-4d4d-914d-8382a7456fdd', '2026-05-03', '2026-05-03', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('99c021dc-8374-44ee-8e19-009d3117ec92', 11088, current_setting('importacao.cliente_id')::uuid, 4, 'e07d4d35-1381-4d4d-914d-8382a7456fdd', 'concluida', 'normal', 4700.0, 4700.0, 0.0, '2026-05-03', '2026-05-03', 'e07d4d35-1381-4d4d-914d-8382a7456fdd');
UPDATE aparelhos SET venda_id = '99c021dc-8374-44ee-8e19-009d3117ec92' WHERE id = 'c8712095-06d3-4f53-b7fb-6b361adfba02';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('e02c235a-96e3-4071-939e-9a07d8b5bff0', '99c021dc-8374-44ee-8e19-009d3117ec92', 'pix', 4700.0, '2026-05-03', 'e07d4d35-1381-4d4d-914d-8382a7456fdd', 1);

-- === VENDA 11089: IPHONE 11 PRO 256GB BRANCO SEMINOVO (03/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('a3b07ad8-e08b-45b0-8d8c-3e635b760ac9', 'Apple', 'IPHONE 11 PRO 256GB BRANCO SEMINOVO', '352834111876179', 1200.0, 700.0, 4, 'seminovo', 'bom', 'vendido', '2026-05-03', '2026-05-03', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-03', '2026-05-03', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('512abae4-93bc-4f60-a3b4-51779f410f6b', 11089, current_setting('importacao.cliente_id')::uuid, 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 1200.0, 1200.0, 0.0, '2026-05-03', '2026-05-03', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
UPDATE aparelhos SET venda_id = '512abae4-93bc-4f60-a3b4-51779f410f6b' WHERE id = 'a3b07ad8-e08b-45b0-8d8c-3e635b760ac9';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('66afa1ff-ba7e-41ed-a14e-885012013ea4', '512abae4-93bc-4f60-a3b4-51779f410f6b', 'pix', 950.0, '2026-05-03', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1);
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, observacao, parcelas)
VALUES ('fee9ea54-9a78-460e-bed3-88fb1a200232', '512abae4-93bc-4f60-a3b4-51779f410f6b', 'troca_aparelho', 250.0, '2026-05-03', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'Troca: IPH XR 64GB', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('77d66338-821f-4867-a84b-2c51f716fdc6', 4, '512abae4-93bc-4f60-a3b4-51779f410f6b', 'Brinde', 25.0, '2026-05-03', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-03');

-- === VENDA 11090: BOMBOX 4 PRETA NOVO (03/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('57cd3fae-5ed0-435e-a71c-d39b85b39879', 'Bombox', 'BOMBOX 4 PRETA NOVO', 'TL1876-JP0086246', 2350.0, 2350.0, 4, 'novo', 'perfeito', 'vendido', '2026-05-03', '2026-05-03', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-03', '2026-05-03', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('4e935ded-c776-45d7-b21a-0d176460a15d', 11090, current_setting('importacao.cliente_id')::uuid, 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 2350.0, 2350.0, 0.0, '2026-05-03', '2026-05-03', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
UPDATE aparelhos SET venda_id = '4e935ded-c776-45d7-b21a-0d176460a15d' WHERE id = '57cd3fae-5ed0-435e-a71c-d39b85b39879';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('dc046b19-1539-41ad-907a-e8570497230d', '4e935ded-c776-45d7-b21a-0d176460a15d', 'pix', 2350.0, '2026-05-03', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1);

-- === VENDA 11091: IPHONE 14 PRO 256GB SEMINOVO (03/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('d2f227c1-729e-4f2a-a4f0-074c5bf9aeaa', 'Apple', 'IPHONE 14 PRO 256GB SEMINOVO', '354542503453857', 3200.0, 2950.0, 4, 'seminovo', 'bom', 'vendido', '2026-05-03', '2026-05-03', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-03', '2026-05-03', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('ab52be93-723e-4b4a-8cce-6fbf9975e4aa', 11091, current_setting('importacao.cliente_id')::uuid, 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 3200.0, 3200.0, 0.0, '2026-05-03', '2026-05-03', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
UPDATE aparelhos SET venda_id = 'ab52be93-723e-4b4a-8cce-6fbf9975e4aa' WHERE id = 'd2f227c1-729e-4f2a-a4f0-074c5bf9aeaa';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('fe001d6f-2b01-4a9c-8148-84968fc1d6d7', 'ab52be93-723e-4b4a-8cce-6fbf9975e4aa', 'pix', 1000.0, '2026-05-03', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1);
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('133fc04e-6759-4dbd-a1fa-5ffa025f85c5', 'ab52be93-723e-4b4a-8cce-6fbf9975e4aa', 'cartao_credito', 2200.0, '2026-05-03', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('628708c3-5911-498e-9460-692c97c09d97', 4, 'ab52be93-723e-4b4a-8cce-6fbf9975e4aa', 'Brinde', 25.0, '2026-05-03', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-03');

-- === VENDA 11092: IPHONE 15 PRO MAX 256Gb SEMINOVO (03/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('4adccfd4-380e-4765-9c89-99d1380aa724', 'Apple', 'IPHONE 15 PRO MAX 256Gb SEMINOVO', '351306992348280', 4300.0, 3950.0, 4, 'seminovo', 'bom', 'vendido', '2026-05-03', '2026-05-03', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-03', '2026-05-03', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('ec7d9b99-4b5e-4695-91d4-33302a591c26', 11092, current_setting('importacao.cliente_id')::uuid, 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 4300.0, 4300.0, 0.0, '2026-05-03', '2026-05-03', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
UPDATE aparelhos SET venda_id = 'ec7d9b99-4b5e-4695-91d4-33302a591c26' WHERE id = '4adccfd4-380e-4765-9c89-99d1380aa724';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('812ada01-c99a-48f8-80b5-679c4371d65f', 'ec7d9b99-4b5e-4695-91d4-33302a591c26', 'pix', 4300.0, '2026-05-03', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('253032ae-b1ff-4fe7-8ea3-2b49429fc649', 4, 'ec7d9b99-4b5e-4695-91d4-33302a591c26', 'Brinde', 25.0, '2026-05-03', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-03');

-- === VENDA 11093: IPAD 11 128GB AMARELO NOVO (03/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('703e5f18-2361-4b78-8f0a-9e128ce768ef', 'Apple', 'IPAD 11 128GB AMARELO NOVO', 'D26WC4VMQP', 2715.0, 2140.0, 4, 'novo', 'perfeito', 'vendido', '2026-05-03', '2026-05-03', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-03', '2026-05-03', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('456ec90a-cee8-4175-bc1e-d5ffff034666', 11093, current_setting('importacao.cliente_id')::uuid, 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 2715.0, 2715.0, 0.0, '2026-05-03', '2026-05-03', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
UPDATE aparelhos SET venda_id = '456ec90a-cee8-4175-bc1e-d5ffff034666' WHERE id = '703e5f18-2361-4b78-8f0a-9e128ce768ef';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('721de2cd-cc19-4fb6-924c-af6b348901b0', '456ec90a-cee8-4175-bc1e-d5ffff034666', 'pix', 1315.0, '2026-05-03', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1);
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('60b75ca2-6f6b-4e19-86b8-029fc794bc44', '456ec90a-cee8-4175-bc1e-d5ffff034666', 'dinheiro', 1400.0, '2026-05-03', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('42d5f961-06a3-48f6-a629-08aa87685ab5', 4, '456ec90a-cee8-4175-bc1e-d5ffff034666', 'Brinde', 150.0, '2026-05-03', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-03');

-- === VENDA 11094: IPHONE 14 PRO 128GB ROXO SEMINOVO (03/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('9671d32d-3852-480f-aac7-651514a45de6', 'Apple', 'IPHONE 14 PRO 128GB ROXO SEMINOVO', '357712761232320', 3000.0, 2700.0, 19, 'seminovo', 'bom', 'vendido', '2026-05-03', '2026-05-03', 'b4269e60-eea2-4eba-a34d-db9591e0ec83', '2026-05-03', '2026-05-03', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('b48a6e73-f93c-4889-a242-d6b5b5a42e34', 11094, current_setting('importacao.cliente_id')::uuid, 19, 'b4269e60-eea2-4eba-a34d-db9591e0ec83', 'concluida', 'normal', 3000.0, 3000.0, 0.0, '2026-05-03', '2026-05-03', 'b4269e60-eea2-4eba-a34d-db9591e0ec83');
UPDATE aparelhos SET venda_id = 'b48a6e73-f93c-4889-a242-d6b5b5a42e34' WHERE id = '9671d32d-3852-480f-aac7-651514a45de6';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('8f6c4c81-7db3-487e-845d-a76fba462560', 'b48a6e73-f93c-4889-a242-d6b5b5a42e34', 'cartao_credito', 3000.0, '2026-05-03', 'b4269e60-eea2-4eba-a34d-db9591e0ec83', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('f2e2c6e2-b9f9-41cf-8646-eb10690cc2f0', 19, 'b48a6e73-f93c-4889-a242-d6b5b5a42e34', 'Brinde', 25.0, '2026-05-03', 'b4269e60-eea2-4eba-a34d-db9591e0ec83', '2026-05-03');

-- === VENDA 11095: IPHONE 17 PRO MAX 512GB AZUL LACRADO (03/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('5df6de92-d2b1-4ff5-923d-bde59aa06128', 'Apple', 'IPHONE 17 PRO MAX 512GB AZUL LACRADO', '350552898007873', 9280.0, 9050.0, 1, 'novo', 'perfeito', 'vendido', '2026-05-03', '2026-05-03', '9451cd9f-6770-4e32-aae8-c75fa675e818', '2026-05-03', '2026-05-03', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('8cee168b-bb90-4b00-a25d-040d60bf448c', 11095, current_setting('importacao.cliente_id')::uuid, 1, '9451cd9f-6770-4e32-aae8-c75fa675e818', 'concluida', 'normal', 9280.0, 9280.0, 0.0, '2026-05-03', '2026-05-03', '9451cd9f-6770-4e32-aae8-c75fa675e818');
UPDATE aparelhos SET venda_id = '8cee168b-bb90-4b00-a25d-040d60bf448c' WHERE id = '5df6de92-d2b1-4ff5-923d-bde59aa06128';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('e20e49c3-cef4-498f-a075-ac805dc2471a', '8cee168b-bb90-4b00-a25d-040d60bf448c', 'pix', 9280.0, '2026-05-03', '9451cd9f-6770-4e32-aae8-c75fa675e818', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('a334f22e-0dff-48b6-b292-203b1d17b04e', 1, '8cee168b-bb90-4b00-a25d-040d60bf448c', 'Brinde', 30.0, '2026-05-03', '9451cd9f-6770-4e32-aae8-c75fa675e818', '2026-05-03');

-- === VENDA 11096: IPHONE 14 128GB AZUL SEMINOVO (03/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('e84f023d-3e9a-427c-9877-a87622d9a83b', 'Apple', 'IPHONE 14 128GB AZUL SEMINOVO', '358264144532215', 2200.0, 2050.0, 20, 'seminovo', 'bom', 'vendido', '2026-05-03', '2026-05-03', '25e2da5b-9e76-4388-9890-7e22efd6940d', '2026-05-03', '2026-05-03', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('01b1833d-b850-40d2-8ee8-ded788c5de39', 11096, current_setting('importacao.cliente_id')::uuid, 20, '25e2da5b-9e76-4388-9890-7e22efd6940d', 'concluida', 'normal', 2200.0, 2200.0, 0.0, '2026-05-03', '2026-05-03', '25e2da5b-9e76-4388-9890-7e22efd6940d');
UPDATE aparelhos SET venda_id = '01b1833d-b850-40d2-8ee8-ded788c5de39' WHERE id = 'e84f023d-3e9a-427c-9877-a87622d9a83b';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('87098694-195d-4f8a-808b-7e9175240659', '01b1833d-b850-40d2-8ee8-ded788c5de39', 'cartao_credito', 2200.0, '2026-05-03', '25e2da5b-9e76-4388-9890-7e22efd6940d', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('99123f5c-cddb-45dd-9b81-7d203d9f7a9e', 20, '01b1833d-b850-40d2-8ee8-ded788c5de39', 'Brinde', 25.0, '2026-05-03', '25e2da5b-9e76-4388-9890-7e22efd6940d', '2026-05-03');

-- === VENDA 11097: IPHONE 14 PRO MAX 256GB ROXO SEMINOVO (03/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('c9c89f4f-3383-4aec-926a-c8735c0e1f80', 'Apple', 'IPHONE 14 PRO MAX 256GB ROXO SEMINOVO', '353742532615895', 3550.0, 3200.0, 19, 'seminovo', 'bom', 'vendido', '2026-05-03', '2026-05-03', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-03', '2026-05-03', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('6cbf69ca-d246-475c-923f-0e7d16c855ad', 11097, current_setting('importacao.cliente_id')::uuid, 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 3550.0, 3550.0, 0.0, '2026-05-03', '2026-05-03', '97f12885-87ad-426a-8bbb-656889d82e10');
UPDATE aparelhos SET venda_id = '6cbf69ca-d246-475c-923f-0e7d16c855ad' WHERE id = 'c9c89f4f-3383-4aec-926a-c8735c0e1f80';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('84c33d6d-41c0-49bb-8349-b77fe1044a17', '6cbf69ca-d246-475c-923f-0e7d16c855ad', 'pix', 3550.0, '2026-05-03', '97f12885-87ad-426a-8bbb-656889d82e10', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('6143c0e7-3085-47f5-8429-ddef98f3e893', 19, '6cbf69ca-d246-475c-923f-0e7d16c855ad', 'Brinde', 25.0, '2026-05-03', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-03');

-- === VENDA 11098: SAMSUNG TAB S10 FE 128GB CINZA NOVO (03/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('03a88e16-d4f7-4b6a-87e2-c098dbb682e7', 'Samsung', 'SAMSUNG TAB S10 FE 128GB CINZA NOVO', 'R5GL343H0BP', 2582.0, 2350.0, 19, 'novo', 'perfeito', 'vendido', '2026-05-03', '2026-05-03', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-03', '2026-05-03', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('238f5c7f-d9c9-4533-a3e5-f525968a5e26', 11098, current_setting('importacao.cliente_id')::uuid, 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 2582.0, 2582.0, 0.0, '2026-05-03', '2026-05-03', '97f12885-87ad-426a-8bbb-656889d82e10');
UPDATE aparelhos SET venda_id = '238f5c7f-d9c9-4533-a3e5-f525968a5e26' WHERE id = '03a88e16-d4f7-4b6a-87e2-c098dbb682e7';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('b48c873a-5e92-4a48-a6f0-20ea837ca3f0', '238f5c7f-d9c9-4533-a3e5-f525968a5e26', 'pix', 2400.0, '2026-05-03', '97f12885-87ad-426a-8bbb-656889d82e10', 1);
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('b9f0b715-4258-452a-af9a-f83b9d1631dd', '238f5c7f-d9c9-4533-a3e5-f525968a5e26', 'cartao_credito', 182.0, '2026-05-03', '97f12885-87ad-426a-8bbb-656889d82e10', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('1f0df550-abe6-46fa-932d-60b74fff6459', 19, '238f5c7f-d9c9-4533-a3e5-f525968a5e26', 'Brinde', 95.0, '2026-05-03', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-03');

-- === VENDA 11099: IPHONE 14 128GB LILAS SEMINOVO (03/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('0b5658e3-1210-482e-9cd8-c7b09b051a4f', 'Apple', 'IPHONE 14 128GB LILAS SEMINOVO', '354807376249710', 2190.0, 2050.0, 1, 'seminovo', 'bom', 'vendido', '2026-05-03', '2026-05-03', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-03', '2026-05-03', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('ca1977e1-ee86-47e0-a7e5-f158bbbb1848', 11099, current_setting('importacao.cliente_id')::uuid, 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 2190.0, 2190.0, 0.0, '2026-05-03', '2026-05-03', '85e3aa42-b9af-49b8-a72a-64e9c337aa53');
UPDATE aparelhos SET venda_id = 'ca1977e1-ee86-47e0-a7e5-f158bbbb1848' WHERE id = '0b5658e3-1210-482e-9cd8-c7b09b051a4f';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('8e423590-a41b-4d96-a012-ef0983f07733', 'ca1977e1-ee86-47e0-a7e5-f158bbbb1848', 'dinheiro', 2190.0, '2026-05-03', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('7dae11d4-a7b9-4623-abe3-8acd40fd64e4', 1, 'ca1977e1-ee86-47e0-a7e5-f158bbbb1848', 'Brinde', 25.0, '2026-05-03', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-03');

-- === VENDA 11100: IPHONE 13 PRO MAX 256G BRANCO SEMINOVO (03/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('57153dd1-3310-43d1-bb06-b84268709f34', 'Apple', 'IPHONE 13 PRO MAX 256G BRANCO SEMINOVO', '351596247157557', 3287.0, 2950.0, 1, 'seminovo', 'bom', 'vendido', '2026-05-03', '2026-05-03', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-03', '2026-05-03', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('dbb02f56-163f-4da3-bbab-6e4835644016', 11100, current_setting('importacao.cliente_id')::uuid, 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 3287.0, 3287.0, 0.0, '2026-05-03', '2026-05-03', '85e3aa42-b9af-49b8-a72a-64e9c337aa53');
UPDATE aparelhos SET venda_id = 'dbb02f56-163f-4da3-bbab-6e4835644016' WHERE id = '57153dd1-3310-43d1-bb06-b84268709f34';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('bbcb2d86-16ae-41fe-9508-88d5be31bab0', 'dbb02f56-163f-4da3-bbab-6e4835644016', 'pix', 2687.0, '2026-05-03', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 1);
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, observacao, parcelas)
VALUES ('80bff082-3b0d-4317-bb81-47f2e039122b', 'dbb02f56-163f-4da3-bbab-6e4835644016', 'troca_aparelho', 600.0, '2026-05-03', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'Troca: IPHONE 11 64GB VERDE', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('71b5f13b-7eb6-4509-9777-1f69e2f0fc1f', 1, 'dbb02f56-163f-4da3-bbab-6e4835644016', 'Brinde', 25.0, '2026-05-03', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-03');

-- === VENDA 11101: IPHONE 17 256GB PRETO LACRADO (05/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('90c0f028-845c-45a3-8d6b-fb8285a95ec6', 'Apple', 'IPHONE 17 256GB PRETO LACRADO', '351807178569383', 5530.0, 4950.0, 1, 'novo', 'perfeito', 'vendido', '2026-05-05', '2026-05-05', '9451cd9f-6770-4e32-aae8-c75fa675e818', '2026-05-05', '2026-05-05', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('4a9554f0-a6b2-4432-8143-3ca624750da0', 11101, current_setting('importacao.cliente_id')::uuid, 1, '9451cd9f-6770-4e32-aae8-c75fa675e818', 'concluida', 'normal', 5530.0, 5530.0, 0.0, '2026-05-05', '2026-05-05', '9451cd9f-6770-4e32-aae8-c75fa675e818');
UPDATE aparelhos SET venda_id = '4a9554f0-a6b2-4432-8143-3ca624750da0' WHERE id = '90c0f028-845c-45a3-8d6b-fb8285a95ec6';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('4097847f-766b-4fdb-a2c2-2f7f8c16ed8e', '4a9554f0-a6b2-4432-8143-3ca624750da0', 'pix', 5530.0, '2026-05-05', '9451cd9f-6770-4e32-aae8-c75fa675e818', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('10bbaf16-0e4e-4737-b7ee-ad8e7b10a6b7', 1, '4a9554f0-a6b2-4432-8143-3ca624750da0', 'Brinde', 25.0, '2026-05-05', '9451cd9f-6770-4e32-aae8-c75fa675e818', '2026-05-05');

-- === VENDA 11102: IPHONE 14 256GB PRETO SEMINOVO (05/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('37b66d84-d3bf-43da-91f5-1bc845648490', 'Apple', 'IPHONE 14 256GB PRETO SEMINOVO', '353267568818502', 2450.0, 2150.0, 1, 'seminovo', 'bom', 'vendido', '2026-05-05', '2026-05-05', '9451cd9f-6770-4e32-aae8-c75fa675e818', '2026-05-05', '2026-05-05', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('db720e16-00e3-4136-8e4c-907bee5310e4', 11102, current_setting('importacao.cliente_id')::uuid, 1, '9451cd9f-6770-4e32-aae8-c75fa675e818', 'concluida', 'normal', 2450.0, 2450.0, 0.0, '2026-05-05', '2026-05-05', '9451cd9f-6770-4e32-aae8-c75fa675e818');
UPDATE aparelhos SET venda_id = 'db720e16-00e3-4136-8e4c-907bee5310e4' WHERE id = '37b66d84-d3bf-43da-91f5-1bc845648490';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('503380bd-4e6f-4b8d-b9b5-59de77c255ca', 'db720e16-00e3-4136-8e4c-907bee5310e4', 'pix', 2450.0, '2026-05-05', '9451cd9f-6770-4e32-aae8-c75fa675e818', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('95445086-da38-43b4-884b-a852248f12f5', 1, 'db720e16-00e3-4136-8e4c-907bee5310e4', 'Brinde', 18.0, '2026-05-05', '9451cd9f-6770-4e32-aae8-c75fa675e818', '2026-05-05');

-- === VENDA 11103: IPHONE 17 PRO MAX 256GB SILVER NOVO (05/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('e8709c98-9532-4cbf-ab57-d45040a2eb9c', 'Apple', 'IPHONE 17 PRO MAX 256GB SILVER NOVO', '357247252989922', 8500.0, 8300.0, 19, 'novo', 'perfeito', 'vendido', '2026-05-05', '2026-05-05', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-05', '2026-05-05', 'Pagto junto (Aparelho 1/2, total grupo R$ 16,800)');
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('71031593-5b2b-4fb4-8911-447d77a10d00', 11103, current_setting('importacao.cliente_id')::uuid, 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 8500.0, 8500.0, 0.0, '2026-05-05', '2026-05-05', '97f12885-87ad-426a-8bbb-656889d82e10');
UPDATE aparelhos SET venda_id = '71031593-5b2b-4fb4-8911-447d77a10d00' WHERE id = 'e8709c98-9532-4cbf-ab57-d45040a2eb9c';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('3e207a1d-a148-4cad-ae6c-911da281a00f', '71031593-5b2b-4fb4-8911-447d77a10d00', 'pix', 4500.0, '2026-05-05', '97f12885-87ad-426a-8bbb-656889d82e10', 1);
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, observacao, parcelas)
VALUES ('7018ae9d-a257-4207-90a4-17073f54ad49', '71031593-5b2b-4fb4-8911-447d77a10d00', 'troca_aparelho', 4000.0, '2026-05-05', '97f12885-87ad-426a-8bbb-656889d82e10', 'Troca: IPHONE 15 PRO MAX 256GB PRETO', 1);

-- === VENDA 11104: IPHONE 17 PRO MAX 256GB AZUL NOVO (05/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('cf8cc3ea-0a98-4eb0-925f-7727a597810f', 'Apple', 'IPHONE 17 PRO MAX 256GB AZUL NOVO', '357205981616604', 8300.0, 8100.0, 19, 'novo', 'perfeito', 'vendido', '2026-05-05', '2026-05-05', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-05', '2026-05-05', 'Pagto junto (Aparelho 2/2, total grupo R$ 16,800)');
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('89fa60e8-ed31-410d-a6f2-20af212c0386', 11104, current_setting('importacao.cliente_id')::uuid, 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 8300.0, 8300.0, 0.0, '2026-05-05', '2026-05-05', '97f12885-87ad-426a-8bbb-656889d82e10');
UPDATE aparelhos SET venda_id = '89fa60e8-ed31-410d-a6f2-20af212c0386' WHERE id = 'cf8cc3ea-0a98-4eb0-925f-7727a597810f';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('3627c560-b80f-4f9e-b5bf-f1e748c1fd34', '89fa60e8-ed31-410d-a6f2-20af212c0386', 'pix', 8300.0, '2026-05-05', '97f12885-87ad-426a-8bbb-656889d82e10', 1);

-- === VENDA 11105: NOTE 15 PRO 5G 256GB AZUL NOVO (05/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('023982cb-3dce-4cec-adea-ec943e88c981', 'Redmi', 'NOTE 15 PRO 5G 256GB AZUL NOVO', '860548074484947', 1950.0, 1690.0, 19, 'novo', 'perfeito', 'vendido', '2026-05-05', '2026-05-05', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-05', '2026-05-05', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('b36f456f-ce1d-48dd-94ac-cf09024a0f29', 11105, current_setting('importacao.cliente_id')::uuid, 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 1950.0, 1950.0, 0.0, '2026-05-05', '2026-05-05', '97f12885-87ad-426a-8bbb-656889d82e10');
UPDATE aparelhos SET venda_id = 'b36f456f-ce1d-48dd-94ac-cf09024a0f29' WHERE id = '023982cb-3dce-4cec-adea-ec943e88c981';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('5bda5118-64f0-4161-baf5-db4d23fae30d', 'b36f456f-ce1d-48dd-94ac-cf09024a0f29', 'pix', 1950.0, '2026-05-05', '97f12885-87ad-426a-8bbb-656889d82e10', 1);

-- === VENDA 11106: REALME C75 5G PRETO 256GB NOVO (05/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('d73c8baa-fd63-4176-8b4b-41887a805a69', 'Realme', 'REALME C75 5G PRETO 256GB NOVO', '862813070179174', 1340.0, 1240.0, 19, 'novo', 'perfeito', 'vendido', '2026-05-05', '2026-05-05', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-05', '2026-05-05', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('b3ee2920-bb25-4c7c-b028-c5b014f82aa8', 11106, current_setting('importacao.cliente_id')::uuid, 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 1340.0, 1340.0, 0.0, '2026-05-05', '2026-05-05', '97f12885-87ad-426a-8bbb-656889d82e10');
UPDATE aparelhos SET venda_id = 'b3ee2920-bb25-4c7c-b028-c5b014f82aa8' WHERE id = 'd73c8baa-fd63-4176-8b4b-41887a805a69';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('ed2ae987-b83b-411a-8b67-b2710e2d0379', 'b3ee2920-bb25-4c7c-b028-c5b014f82aa8', 'cartao_credito', 1340.0, '2026-05-05', '97f12885-87ad-426a-8bbb-656889d82e10', 1);

-- === VENDA 11107: IPHONE 13 128GB PRETO SEMINOVO (05/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('4a316296-f6af-46e3-af59-7dd28a3a83b7', 'Apple', 'IPHONE 13 128GB PRETO SEMINOVO', '351264787086047', 2025.0, 1800.0, 19, 'seminovo', 'bom', 'vendido', '2026-05-05', '2026-05-05', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-05', '2026-05-05', 'Pagto junto (Aparelho 1/2, total grupo R$ 4,050)');
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('94ad4902-829b-445a-9f4e-bebb260368d8', 11107, current_setting('importacao.cliente_id')::uuid, 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 2025.0, 2025.0, 0.0, '2026-05-05', '2026-05-05', '97f12885-87ad-426a-8bbb-656889d82e10');
UPDATE aparelhos SET venda_id = '94ad4902-829b-445a-9f4e-bebb260368d8' WHERE id = '4a316296-f6af-46e3-af59-7dd28a3a83b7';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('c70e5c58-bcaf-45ea-b04b-5e7a1e2d6f71', '94ad4902-829b-445a-9f4e-bebb260368d8', 'cartao_credito', 2025.0, '2026-05-05', '97f12885-87ad-426a-8bbb-656889d82e10', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('5a5d3500-07d2-4f34-93fc-fb22dcbc71ae', 19, '94ad4902-829b-445a-9f4e-bebb260368d8', 'Brinde', 25.0, '2026-05-05', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-05');

-- === VENDA 11108: IPHONE 13 128GB BRANCO SEMINOVO (05/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('4ffbb404-63ff-4346-8d73-4278f0ca634c', 'Apple', 'IPHONE 13 128GB BRANCO SEMINOVO', '351520705483289', 2025.0, 1800.0, 19, 'seminovo', 'bom', 'vendido', '2026-05-05', '2026-05-05', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-05', '2026-05-05', 'Pagto junto (Aparelho 2/2, total grupo R$ 4,050)');
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('34d34338-b529-41ba-aeb6-deb97586f9c5', 11108, current_setting('importacao.cliente_id')::uuid, 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 2025.0, 2025.0, 0.0, '2026-05-05', '2026-05-05', '97f12885-87ad-426a-8bbb-656889d82e10');
UPDATE aparelhos SET venda_id = '34d34338-b529-41ba-aeb6-deb97586f9c5' WHERE id = '4ffbb404-63ff-4346-8d73-4278f0ca634c';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('62d96acc-abeb-4e04-bcab-4887aae55b7d', '34d34338-b529-41ba-aeb6-deb97586f9c5', 'cartao_credito', 2025.0, '2026-05-05', '97f12885-87ad-426a-8bbb-656889d82e10', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('ea6e4f8f-9ba0-4def-9b74-baa3e166731c', 19, '34d34338-b529-41ba-aeb6-deb97586f9c5', 'Brinde', 25.0, '2026-05-05', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-05');

-- === VENDA 11109: IPHONE 14 PLUS 128GB PRETO SEMINOVO (05/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('96a8d1dd-12a7-4d4e-ac91-80e8a90053fc', 'Apple', 'IPHONE 14 PLUS 128GB PRETO SEMINOVO', '359069332647611', 2593.0, 2300.0, 1, 'seminovo', 'bom', 'vendido', '2026-05-05', '2026-05-05', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-05', '2026-05-05', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('88e4eb0f-7090-4119-a6a8-b1abf2d3e9fb', 11109, current_setting('importacao.cliente_id')::uuid, 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 2593.0, 2593.0, 0.0, '2026-05-05', '2026-05-05', '85e3aa42-b9af-49b8-a72a-64e9c337aa53');
UPDATE aparelhos SET venda_id = '88e4eb0f-7090-4119-a6a8-b1abf2d3e9fb' WHERE id = '96a8d1dd-12a7-4d4e-ac91-80e8a90053fc';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('e7feb076-b2cc-4417-a25e-ba6e41ccef0a', '88e4eb0f-7090-4119-a6a8-b1abf2d3e9fb', 'pix', 2593.0, '2026-05-05', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('b1724ed1-0ead-4c8c-bb33-41a468b6e90e', 1, '88e4eb0f-7090-4119-a6a8-b1abf2d3e9fb', 'Brinde', 25.0, '2026-05-05', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-05');

-- === VENDA 11110: IPHONE 13 PRO 256GB GRAFIT SEMINOVO (05/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('6aa55e61-013d-4536-a8d2-05690e6c813a', 'Apple', 'IPHONE 13 PRO 256GB GRAFIT SEMINOVO', '350367272380303', 2750.0, 2500.0, 1, 'seminovo', 'bom', 'vendido', '2026-05-05', '2026-05-05', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-05', '2026-05-05', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('42c506f0-fb3f-46c0-ab79-62f15aad72a0', 11110, current_setting('importacao.cliente_id')::uuid, 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 2750.0, 2750.0, 0.0, '2026-05-05', '2026-05-05', '85e3aa42-b9af-49b8-a72a-64e9c337aa53');
UPDATE aparelhos SET venda_id = '42c506f0-fb3f-46c0-ab79-62f15aad72a0' WHERE id = '6aa55e61-013d-4536-a8d2-05690e6c813a';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('e2e36577-9d86-48ea-b348-a06d13160bb8', '42c506f0-fb3f-46c0-ab79-62f15aad72a0', 'pix', 2750.0, '2026-05-05', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('3b1ef1b5-36a9-4701-98f7-3b3072059d0e', 1, '42c506f0-fb3f-46c0-ab79-62f15aad72a0', 'Brinde', 25.0, '2026-05-05', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-05');

-- === VENDA 11111: IPHONE 15 128GB ROSA SEMINOVO (05/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('bc594f5e-6b38-4b0c-9362-e161f9dfeff5', 'Apple', 'IPHONE 15 128GB ROSA SEMINOVO', '357395865324357', 2900.0, 2750.0, 4, 'seminovo', 'bom', 'vendido', '2026-05-05', '2026-05-05', 'e07d4d35-1381-4d4d-914d-8382a7456fdd', '2026-05-05', '2026-05-05', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('b8f0c6e0-93c5-4ee6-b871-18bbd353d324', 11111, current_setting('importacao.cliente_id')::uuid, 4, 'e07d4d35-1381-4d4d-914d-8382a7456fdd', 'concluida', 'normal', 2900.0, 2900.0, 0.0, '2026-05-05', '2026-05-05', 'e07d4d35-1381-4d4d-914d-8382a7456fdd');
UPDATE aparelhos SET venda_id = 'b8f0c6e0-93c5-4ee6-b871-18bbd353d324' WHERE id = 'bc594f5e-6b38-4b0c-9362-e161f9dfeff5';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('092edab2-5872-425f-9f31-38ad5989c915', 'b8f0c6e0-93c5-4ee6-b871-18bbd353d324', 'cartao_debito', 1200.0, '2026-05-05', 'e07d4d35-1381-4d4d-914d-8382a7456fdd', 1);
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, observacao, parcelas)
VALUES ('9c264d50-1ed2-4ae0-a036-6861dd35dcdf', 'b8f0c6e0-93c5-4ee6-b871-18bbd353d324', 'troca_aparelho', 1700.0, '2026-05-05', 'e07d4d35-1381-4d4d-914d-8382a7456fdd', 'Troca: IPHONE 13 128GB ROSA', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('cda93e16-cb0b-4275-b35e-4b3b42538318', 4, 'b8f0c6e0-93c5-4ee6-b871-18bbd353d324', 'Brinde', 25.0, '2026-05-05', 'e07d4d35-1381-4d4d-914d-8382a7456fdd', '2026-05-05');

-- === VENDA 11112: REDMI NOTE 15 5G 256GB PRETO NOVO (05/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('360175a7-4c11-455d-ae40-e0f24c728599', 'Xiaomi', 'REDMI NOTE 15 5G 256GB PRETO NOVO', '865292088798209', 1500.0, 1370.0, 4, 'novo', 'perfeito', 'vendido', '2026-05-05', '2026-05-05', 'e07d4d35-1381-4d4d-914d-8382a7456fdd', '2026-05-05', '2026-05-05', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('5eb1e0f8-4296-4338-a100-ebc6c60b4e9a', 11112, current_setting('importacao.cliente_id')::uuid, 4, 'e07d4d35-1381-4d4d-914d-8382a7456fdd', 'concluida', 'normal', 1500.0, 1500.0, 0.0, '2026-05-05', '2026-05-05', 'e07d4d35-1381-4d4d-914d-8382a7456fdd');
UPDATE aparelhos SET venda_id = '5eb1e0f8-4296-4338-a100-ebc6c60b4e9a' WHERE id = '360175a7-4c11-455d-ae40-e0f24c728599';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('29e5b59f-0a73-45b8-aa5e-f0b5e86a0028', '5eb1e0f8-4296-4338-a100-ebc6c60b4e9a', 'dinheiro', 400.0, '2026-05-05', 'e07d4d35-1381-4d4d-914d-8382a7456fdd', 1);
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('0d20070b-1a83-42cf-994f-f7d6cb032744', '5eb1e0f8-4296-4338-a100-ebc6c60b4e9a', 'cartao_credito', 1100.0, '2026-05-05', 'e07d4d35-1381-4d4d-914d-8382a7456fdd', 1);

-- === VENDA 11113: IPAD 11 128GB 128GB SILVER NOVO (06/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('24f59e31-a854-41c2-8011-1b9b719d37d8', 'Apple', 'IPAD 11 128GB 128GB SILVER NOVO', 'G79XRVF52R', 2320.0, 2180.0, 4, 'novo', 'perfeito', 'vendido', '2026-05-06', '2026-05-06', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-06', '2026-05-06', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('3a1486f0-bd4a-45ec-a763-a1c86765e54c', 11113, current_setting('importacao.cliente_id')::uuid, 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 2320.0, 2320.0, 0.0, '2026-05-06', '2026-05-06', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
UPDATE aparelhos SET venda_id = '3a1486f0-bd4a-45ec-a763-a1c86765e54c' WHERE id = '24f59e31-a854-41c2-8011-1b9b719d37d8';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('fc53d011-e8ed-454f-bcbc-0060e93a0c57', '3a1486f0-bd4a-45ec-a763-a1c86765e54c', 'cartao_credito', 2320.0, '2026-05-06', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('c83c2d54-1b8e-4682-8fe2-0dc91f3def87', 4, '3a1486f0-bd4a-45ec-a763-a1c86765e54c', 'Brinde', 10.0, '2026-05-06', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-06');

-- === VENDA 11114: IPHONE 15 128GB ROSA SEMINOVO (06/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('b4895241-d5b2-482f-b3f9-1539d561aff0', 'Apple', 'IPHONE 15 128GB ROSA SEMINOVO', '356054491176662', 2960.0, 2750.0, 4, 'seminovo', 'bom', 'vendido', '2026-05-06', '2026-05-06', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-06', '2026-05-06', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('8ed2af0b-bb4d-4b0d-b090-77ac8c347382', 11114, current_setting('importacao.cliente_id')::uuid, 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 2960.0, 2960.0, 0.0, '2026-05-06', '2026-05-06', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
UPDATE aparelhos SET venda_id = '8ed2af0b-bb4d-4b0d-b090-77ac8c347382' WHERE id = 'b4895241-d5b2-482f-b3f9-1539d561aff0';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('52f3ab81-828a-42a5-88f2-a58d57bfe6ce', '8ed2af0b-bb4d-4b0d-b090-77ac8c347382', 'pix', 2960.0, '2026-05-06', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('f73a5962-9965-4d05-bb23-2f1cccb22581', 4, '8ed2af0b-bb4d-4b0d-b090-77ac8c347382', 'Brinde', 60.0, '2026-05-06', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-06');

-- === VENDA 11115: IPHONE 15 PRO MAX 256GB PRETO SEMINOVO (06/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('79c043ac-d23e-4190-a8e4-cd7cc90cfce2', 'Apple', 'IPHONE 15 PRO MAX 256GB PRETO SEMINOVO', '355364280424731', 4150.0, 3950.0, 19, 'seminovo', 'bom', 'vendido', '2026-05-06', '2026-05-06', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-06', '2026-05-06', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('6337caaf-17a6-4068-9c48-5bb85e6031af', 11115, current_setting('importacao.cliente_id')::uuid, 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 4150.0, 4150.0, 0.0, '2026-05-06', '2026-05-06', '97f12885-87ad-426a-8bbb-656889d82e10');
UPDATE aparelhos SET venda_id = '6337caaf-17a6-4068-9c48-5bb85e6031af' WHERE id = '79c043ac-d23e-4190-a8e4-cd7cc90cfce2';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('6c98e7c8-d968-4e46-b3f1-850be0a08120', '6337caaf-17a6-4068-9c48-5bb85e6031af', 'pix', 4150.0, '2026-05-06', '97f12885-87ad-426a-8bbb-656889d82e10', 1);

-- === VENDA 11116: IPHONE 16 PRO MAX 256GB PRETO SEMINOVO (06/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('100a86be-5e6d-4f71-93ee-bcff2b52eb56', 'Apple', 'IPHONE 16 PRO MAX 256GB PRETO SEMINOVO', '358637628310721', 5600.0, 5250.0, 20, 'seminovo', 'bom', 'vendido', '2026-05-06', '2026-05-06', '0dd2c938-c6dd-4f5d-aac5-ed045ee5d2fb', '2026-05-06', '2026-05-06', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('4bd779f9-da2f-4466-b811-c8bc5982d929', 11116, current_setting('importacao.cliente_id')::uuid, 20, '0dd2c938-c6dd-4f5d-aac5-ed045ee5d2fb', 'concluida', 'normal', 5600.0, 5600.0, 0.0, '2026-05-06', '2026-05-06', '0dd2c938-c6dd-4f5d-aac5-ed045ee5d2fb');
UPDATE aparelhos SET venda_id = '4bd779f9-da2f-4466-b811-c8bc5982d929' WHERE id = '100a86be-5e6d-4f71-93ee-bcff2b52eb56';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('1773a4a5-332f-42aa-b3f1-3865edf8c492', '4bd779f9-da2f-4466-b811-c8bc5982d929', 'pix', 2600.0, '2026-05-06', '0dd2c938-c6dd-4f5d-aac5-ed045ee5d2fb', 1);
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, observacao, parcelas)
VALUES ('c32c0e8c-a8a0-42a1-89c2-858c471b206b', '4bd779f9-da2f-4466-b811-c8bc5982d929', 'troca_aparelho', 3000.0, '2026-05-06', '0dd2c938-c6dd-4f5d-aac5-ed045ee5d2fb', 'Troca: IPH 15 PRO 128GB NATURAL', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('59bca793-4bb6-4c79-9dfd-2aaeb9efc4f5', 20, '4bd779f9-da2f-4466-b811-c8bc5982d929', 'Brinde', 25.0, '2026-05-06', '0dd2c938-c6dd-4f5d-aac5-ed045ee5d2fb', '2026-05-06');

-- === VENDA 11117: IPHONE 16 PRO MAX 256GB PRETO SEMINOVO (06/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('e8b54a4a-8b38-48a9-83a0-c616aff0f70b', 'Apple', 'IPHONE 16 PRO MAX 256GB PRETO SEMINOVO', '354276355652528', 5400.0, 5000.0, 20, 'seminovo', 'bom', 'vendido', '2026-05-06', '2026-05-06', '0dd2c938-c6dd-4f5d-aac5-ed045ee5d2fb', '2026-05-06', '2026-05-06', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('61c45e91-cda7-4af7-957f-6aa9139db90d', 11117, current_setting('importacao.cliente_id')::uuid, 20, '0dd2c938-c6dd-4f5d-aac5-ed045ee5d2fb', 'concluida', 'normal', 5400.0, 5400.0, 0.0, '2026-05-06', '2026-05-06', '0dd2c938-c6dd-4f5d-aac5-ed045ee5d2fb');
UPDATE aparelhos SET venda_id = '61c45e91-cda7-4af7-957f-6aa9139db90d' WHERE id = 'e8b54a4a-8b38-48a9-83a0-c616aff0f70b';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('2415fa6f-867f-4099-8e81-d60be859e000', '61c45e91-cda7-4af7-957f-6aa9139db90d', 'pix', 5400.0, '2026-05-06', '0dd2c938-c6dd-4f5d-aac5-ed045ee5d2fb', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('70f2ed32-8ae8-42aa-8db5-9b93cccaf846', 20, '61c45e91-cda7-4af7-957f-6aa9139db90d', 'Brinde', 25.0, '2026-05-06', '0dd2c938-c6dd-4f5d-aac5-ed045ee5d2fb', '2026-05-06');

-- === VENDA 11118: IPHONR 17E 256GB PRETO NOVO (06/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('7e3dff01-884e-4891-a567-1688bb28fa76', 'Outros', 'IPHONR 17E 256GB PRETO NOVO', '351961171443417', 3800.0, 3550.0, 20, 'novo', 'perfeito', 'vendido', '2026-05-06', '2026-05-06', '25e2da5b-9e76-4388-9890-7e22efd6940d', '2026-05-06', '2026-05-06', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('bee1a045-2e91-4b0c-93f2-ffeeea38bd10', 11118, current_setting('importacao.cliente_id')::uuid, 20, '25e2da5b-9e76-4388-9890-7e22efd6940d', 'concluida', 'normal', 3800.0, 3800.0, 0.0, '2026-05-06', '2026-05-06', '25e2da5b-9e76-4388-9890-7e22efd6940d');
UPDATE aparelhos SET venda_id = 'bee1a045-2e91-4b0c-93f2-ffeeea38bd10' WHERE id = '7e3dff01-884e-4891-a567-1688bb28fa76';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('92af21ab-f073-4aa1-9fdc-782961cf76c7', 'bee1a045-2e91-4b0c-93f2-ffeeea38bd10', 'cartao_credito', 3800.0, '2026-05-06', '25e2da5b-9e76-4388-9890-7e22efd6940d', 1);

-- === VENDA 11119: IPHONE 17 PRO MAX 256GB AZUL NOVO (06/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('306ee184-3e11-4c92-9878-3e63b65bfd0d', 'Apple', 'IPHONE 17 PRO MAX 256GB AZUL NOVO', '358434702268268', 8400.0, 8150.0, 20, 'novo', 'perfeito', 'vendido', '2026-05-06', '2026-05-06', '25e2da5b-9e76-4388-9890-7e22efd6940d', '2026-05-06', '2026-05-06', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('9ec77ff1-b54b-48e3-a897-8f1b55b408d1', 11119, current_setting('importacao.cliente_id')::uuid, 20, '25e2da5b-9e76-4388-9890-7e22efd6940d', 'concluida', 'normal', 8400.0, 8400.0, 0.0, '2026-05-06', '2026-05-06', '25e2da5b-9e76-4388-9890-7e22efd6940d');
UPDATE aparelhos SET venda_id = '9ec77ff1-b54b-48e3-a897-8f1b55b408d1' WHERE id = '306ee184-3e11-4c92-9878-3e63b65bfd0d';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('94fac62b-2cf5-45e3-b3a7-b7efdb1ae942', '9ec77ff1-b54b-48e3-a897-8f1b55b408d1', 'pix', 8400.0, '2026-05-06', '25e2da5b-9e76-4388-9890-7e22efd6940d', 1);

-- === VENDA 11120: IPHONE 17 PRO MAX 256GB AZUL NOVO (06/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('ad2064f1-ed0a-4e0f-928c-a74e059017f5', 'Apple', 'IPHONE 17 PRO MAX 256GB AZUL NOVO', '358434708144554', 8400.0, 8100.0, 20, 'novo', 'perfeito', 'vendido', '2026-05-06', '2026-05-06', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', '2026-05-06', '2026-05-06', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('1e400ddd-5ccc-41ea-9df0-d4647a5df8a6', 11120, current_setting('importacao.cliente_id')::uuid, 20, 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 'concluida', 'normal', 8400.0, 8400.0, 0.0, '2026-05-06', '2026-05-06', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4');
UPDATE aparelhos SET venda_id = '1e400ddd-5ccc-41ea-9df0-d4647a5df8a6' WHERE id = 'ad2064f1-ed0a-4e0f-928c-a74e059017f5';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('03abce27-3bc3-4da1-b960-1a246f6b6cb6', '1e400ddd-5ccc-41ea-9df0-d4647a5df8a6', 'dinheiro', 4450.0, '2026-05-06', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 1);
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, observacao, parcelas)
VALUES ('e477e825-386d-4f06-85a5-699a3abf89e9', '1e400ddd-5ccc-41ea-9df0-d4647a5df8a6', 'troca_aparelho', 3950.0, '2026-05-06', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 'Troca: IPH 15 PRO MAX 256GB AZUL', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('c1f36a3f-8cda-412d-8147-169d23549208', 20, '1e400ddd-5ccc-41ea-9df0-d4647a5df8a6', 'Brinde', 15.0, '2026-05-06', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', '2026-05-06');

-- === VENDA 11121: IPHONE 15 128GB PRETO SEMINOVO (06/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('051eec91-a8d9-4e11-a35c-5116efc5cdcd', 'Apple', 'IPHONE 15 128GB PRETO SEMINOVO', '359757420449029', 3000.0, 2750.0, 20, 'seminovo', 'bom', 'vendido', '2026-05-06', '2026-05-06', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', '2026-05-06', '2026-05-06', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('849fbb77-734d-43c2-b93e-6e97a519f25f', 11121, current_setting('importacao.cliente_id')::uuid, 20, 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 'concluida', 'normal', 3000.0, 3000.0, 0.0, '2026-05-06', '2026-05-06', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4');
UPDATE aparelhos SET venda_id = '849fbb77-734d-43c2-b93e-6e97a519f25f' WHERE id = '051eec91-a8d9-4e11-a35c-5116efc5cdcd';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('8b82e731-0396-4e7c-9081-2a51f5521434', '849fbb77-734d-43c2-b93e-6e97a519f25f', 'pix', 2000.0, '2026-05-06', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 1);
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, observacao, parcelas)
VALUES ('7f3b93d1-dd1f-47a7-b55d-db9e2f0fed42', '849fbb77-734d-43c2-b93e-6e97a519f25f', 'troca_aparelho', 1000.0, '2026-05-06', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 'Troca: IPH 12 128GB PRETO', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('817c2fea-33d9-41ea-86ee-4c32f38ba043', 20, '849fbb77-734d-43c2-b93e-6e97a519f25f', 'Brinde', 25.0, '2026-05-06', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', '2026-05-06');

-- === VENDA 11122: IPHONE 17 PRO MAX 256GB AZUL NOVO (07/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('016cb53f-646f-44c3-a775-7789c975a4fa', 'Apple', 'IPHONE 17 PRO MAX 256GB AZUL NOVO', '351771405550451', 8390.0, 8150.0, 19, 'novo', 'perfeito', 'vendido', '2026-05-07', '2026-05-07', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-07', '2026-05-07', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('c8784f49-b28f-4845-a268-0aa5be6e1ea3', 11122, current_setting('importacao.cliente_id')::uuid, 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 8390.0, 8390.0, 0.0, '2026-05-07', '2026-05-07', '97f12885-87ad-426a-8bbb-656889d82e10');
UPDATE aparelhos SET venda_id = 'c8784f49-b28f-4845-a268-0aa5be6e1ea3' WHERE id = '016cb53f-646f-44c3-a775-7789c975a4fa';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('c4258c58-c705-49f1-94c3-bdc20c84a514', 'c8784f49-b28f-4845-a268-0aa5be6e1ea3', 'pix', 8390.0, '2026-05-07', '97f12885-87ad-426a-8bbb-656889d82e10', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('0076ef44-2b3d-4929-83b1-5db46bb5dce6', 19, 'c8784f49-b28f-4845-a268-0aa5be6e1ea3', 'Brinde', 40.0, '2026-05-07', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-07');

-- === VENDA 11123: IPHONE 13 PRO MAX 128GB DOURADO SEMINOVO (07/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('8194631c-1817-4a85-9a6d-5d8fd611ece0', 'Apple', 'IPHONE 13 PRO MAX 128GB DOURADO SEMINOVO', '354347187764201', 2890.0, 2650.0, 4, 'seminovo', 'bom', 'vendido', '2026-05-07', '2026-05-07', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-07', '2026-05-07', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('5373f5f6-c966-472a-b687-20b390097d73', 11123, current_setting('importacao.cliente_id')::uuid, 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 2890.0, 2890.0, 0.0, '2026-05-07', '2026-05-07', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
UPDATE aparelhos SET venda_id = '5373f5f6-c966-472a-b687-20b390097d73' WHERE id = '8194631c-1817-4a85-9a6d-5d8fd611ece0';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('df10051b-f2d7-45ca-a12f-1b27d8942fcb', '5373f5f6-c966-472a-b687-20b390097d73', 'pix', 2890.0, '2026-05-07', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('76654e6c-1c55-41a1-b6a0-c8c831591b91', 4, '5373f5f6-c966-472a-b687-20b390097d73', 'Brinde', 65.0, '2026-05-07', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-07');

-- === VENDA 11124: REDMI NOTE 15 5G 256GB ROXO NOVO (07/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('9f0ca4d6-0e0d-40b7-90da-a3739d73811a', 'Xiaomi', 'REDMI NOTE 15 5G 256GB ROXO NOVO', '86195070529825', 1420.0, 1360.0, 19, 'novo', 'perfeito', 'vendido', '2026-05-07', '2026-05-07', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-07', '2026-05-07', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('28eac0fa-450d-40ed-89f7-91076c187771', 11124, current_setting('importacao.cliente_id')::uuid, 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 1420.0, 1420.0, 0.0, '2026-05-07', '2026-05-07', '97f12885-87ad-426a-8bbb-656889d82e10');
UPDATE aparelhos SET venda_id = '28eac0fa-450d-40ed-89f7-91076c187771' WHERE id = '9f0ca4d6-0e0d-40b7-90da-a3739d73811a';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('e5656c8e-8aca-4f20-abda-a785a8ed9b72', '28eac0fa-450d-40ed-89f7-91076c187771', 'pix', 1420.0, '2026-05-07', '97f12885-87ad-426a-8bbb-656889d82e10', 1);

-- === VENDA 11125: IPHONE 17 PRO MAX 256GB BRANCO NOVO (07/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('db146cc3-5932-4adf-aed7-711a6b8ddc6a', 'Apple', 'IPHONE 17 PRO MAX 256GB BRANCO NOVO', '357247253990986', 8780.0, 8300.0, 1, 'novo', 'perfeito', 'vendido', '2026-05-07', '2026-05-07', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-07', '2026-05-07', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('0099ae70-902f-4001-8b79-01a7094a01ca', 11125, current_setting('importacao.cliente_id')::uuid, 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 8780.0, 8780.0, 0.0, '2026-05-07', '2026-05-07', '85e3aa42-b9af-49b8-a72a-64e9c337aa53');
UPDATE aparelhos SET venda_id = '0099ae70-902f-4001-8b79-01a7094a01ca' WHERE id = 'db146cc3-5932-4adf-aed7-711a6b8ddc6a';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('9565cf04-349c-42e6-a1d4-a405831725c0', '0099ae70-902f-4001-8b79-01a7094a01ca', 'pix', 2600.0, '2026-05-07', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 1);
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, observacao, parcelas)
VALUES ('3f52b1d8-bbd8-409c-95c9-f513b236ffd6', '0099ae70-902f-4001-8b79-01a7094a01ca', 'troca_aparelho', 6180.0, '2026-05-07', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'Troca: IPH 14 PRO MAX ROXO 256GB; IPH 15 PRO 256GB NATURAL', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('c48107b0-8636-414d-aaee-c6ab06f94f07', 1, '0099ae70-902f-4001-8b79-01a7094a01ca', 'Brinde', 10.0, '2026-05-07', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-07');

-- === VENDA 11126: IPHONE 13 PRO MAX 128GB AZUL SEMINOVO (07/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('1c8f8430-2d32-4aa2-a050-81b5c9c11f95', 'Apple', 'IPHONE 13 PRO MAX 128GB AZUL SEMINOVO', '35717750667908', 3230.0, 2650.0, 1, 'seminovo', 'bom', 'vendido', '2026-05-07', '2026-05-07', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-07', '2026-05-07', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('4a7160cf-bd7d-4ccf-9329-e721bdced638', 11126, current_setting('importacao.cliente_id')::uuid, 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 3230.0, 3230.0, 0.0, '2026-05-07', '2026-05-07', '85e3aa42-b9af-49b8-a72a-64e9c337aa53');
UPDATE aparelhos SET venda_id = '4a7160cf-bd7d-4ccf-9329-e721bdced638' WHERE id = '1c8f8430-2d32-4aa2-a050-81b5c9c11f95';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('e66342f9-4c9a-4528-9a7c-04ed0aa01719', '4a7160cf-bd7d-4ccf-9329-e721bdced638', 'pix', 1330.0, '2026-05-07', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 1);
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, observacao, parcelas)
VALUES ('87f865aa-3784-41da-9998-bcf1286f7b85', '4a7160cf-bd7d-4ccf-9329-e721bdced638', 'troca_aparelho', 1900.0, '2026-05-07', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'Troca: IPH 12 PRO MAX AZUL', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('97e21c4e-2d08-433a-94dd-b9ac5520806b', 1, '4a7160cf-bd7d-4ccf-9329-e721bdced638', 'Brinde', 205.0, '2026-05-07', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-07');

-- === VENDA 11127: IPHONE 17 PRO MAX 512GB AZUL NOVO (07/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('587a2451-f7c4-4c11-a730-80956f6bf949', 'Apple', 'IPHONE 17 PRO MAX 512GB AZUL NOVO', '351668144729893', 9950.0, 8850.0, 1, 'novo', 'perfeito', 'vendido', '2026-05-07', '2026-05-07', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-07', '2026-05-07', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('1a18d770-315f-4356-b387-e2e988e4a14f', 11127, current_setting('importacao.cliente_id')::uuid, 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 9950.0, 9950.0, 0.0, '2026-05-07', '2026-05-07', '85e3aa42-b9af-49b8-a72a-64e9c337aa53');
UPDATE aparelhos SET venda_id = '1a18d770-315f-4356-b387-e2e988e4a14f' WHERE id = '587a2451-f7c4-4c11-a730-80956f6bf949';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('18f02ff9-c841-4d03-8538-73314f8bf7a1', '1a18d770-315f-4356-b387-e2e988e4a14f', 'pix', 5250.0, '2026-05-07', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 1);
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, observacao, parcelas)
VALUES ('f4768950-d3eb-41e0-823d-dd2778797d07', '1a18d770-315f-4356-b387-e2e988e4a14f', 'troca_aparelho', 4700.0, '2026-05-07', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'Troca: IPH 16 PRO MAX 256GB DESERT', 1);

-- === VENDA 11128: IPHONE 17 PRO 256GB SILVER NOVO (07/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('32684027-0fa3-4388-90a7-ff5634e2d6ff', 'Apple', 'IPHONE 17 PRO 256GB SILVER NOVO', '354289639953000', 7850.0, 7580.0, 1, 'novo', 'perfeito', 'vendido', '2026-05-07', '2026-05-07', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-07', '2026-05-07', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('188de0db-ea6a-4b62-ad07-94f3f2a10213', 11128, current_setting('importacao.cliente_id')::uuid, 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 7850.0, 7850.0, 0.0, '2026-05-07', '2026-05-07', '85e3aa42-b9af-49b8-a72a-64e9c337aa53');
UPDATE aparelhos SET venda_id = '188de0db-ea6a-4b62-ad07-94f3f2a10213' WHERE id = '32684027-0fa3-4388-90a7-ff5634e2d6ff';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('98071047-d52a-4a22-9105-3eff1349c71c', '188de0db-ea6a-4b62-ad07-94f3f2a10213', 'pix', 5250.0, '2026-05-07', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 1);
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, observacao, parcelas)
VALUES ('9734e391-bbfe-4f38-a074-26084365c4ed', '188de0db-ea6a-4b62-ad07-94f3f2a10213', 'troca_aparelho', 2600.0, '2026-05-07', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'Troca: IPH 15 PRO', 1);

-- === VENDA 11129: IPHONE 14 128GB LILAS SEMINOVO (08/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('518e9e74-98d4-4f30-8b20-bfebc655fee7', 'Apple', 'IPHONE 14 128GB LILAS SEMINOVO', '350577192598574', 2400.0, 2050.0, 19, 'seminovo', 'bom', 'vendido', '2026-05-08', '2026-05-08', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-08', '2026-05-08', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('45c88d98-8c37-438f-b25e-9db86b38bfab', 11129, current_setting('importacao.cliente_id')::uuid, 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 2400.0, 2400.0, 0.0, '2026-05-08', '2026-05-08', '97f12885-87ad-426a-8bbb-656889d82e10');
UPDATE aparelhos SET venda_id = '45c88d98-8c37-438f-b25e-9db86b38bfab' WHERE id = '518e9e74-98d4-4f30-8b20-bfebc655fee7';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('48f2e893-de9c-4cdf-9a7d-18d493ea2081', '45c88d98-8c37-438f-b25e-9db86b38bfab', 'pix', 1100.0, '2026-05-08', '97f12885-87ad-426a-8bbb-656889d82e10', 1);
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, observacao, parcelas)
VALUES ('dcb801b3-bd38-4f8b-bd0d-ae26f7237053', '45c88d98-8c37-438f-b25e-9db86b38bfab', 'troca_aparelho', 1300.0, '2026-05-08', '97f12885-87ad-426a-8bbb-656889d82e10', 'Troca: IPHONE 12 128GB AZUL', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('b793d404-19ac-47b9-b9d2-398def43fc99', 19, '45c88d98-8c37-438f-b25e-9db86b38bfab', 'Brinde', 25.0, '2026-05-08', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-08');

-- === VENDA 11130: IPHONE 17 PRO MAX 256GB PRATA NOVO (08/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('745a3a63-038f-4966-be43-cb73a43f849b', 'Apple', 'IPHONE 17 PRO MAX 256GB PRATA NOVO', '351771409088771', 8480.0, 8300.0, 4, 'novo', 'perfeito', 'vendido', '2026-05-08', '2026-05-08', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-08', '2026-05-08', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('a52f7d15-c4da-472e-918a-7c8a97b698aa', 11130, current_setting('importacao.cliente_id')::uuid, 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 8480.0, 8480.0, 0.0, '2026-05-08', '2026-05-08', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
UPDATE aparelhos SET venda_id = 'a52f7d15-c4da-472e-918a-7c8a97b698aa' WHERE id = '745a3a63-038f-4966-be43-cb73a43f849b';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('f9c7a2dd-a189-41c4-9234-395c4506997e', 'a52f7d15-c4da-472e-918a-7c8a97b698aa', 'pix', 2830.0, '2026-05-08', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1);
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('15c673e0-9159-44d4-bd99-22519cf920d7', 'a52f7d15-c4da-472e-918a-7c8a97b698aa', 'dinheiro', 2500.0, '2026-05-08', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1);
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, observacao, parcelas)
VALUES ('f1d57156-4cd2-4fa2-8a28-1c0af975c7d8', 'a52f7d15-c4da-472e-918a-7c8a97b698aa', 'troca_aparelho', 3150.0, '2026-05-08', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'Troca: 14 PRO MAX 128GB', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('888c2da5-86d0-4c9c-a303-6bec5fabfbbe', 4, 'a52f7d15-c4da-472e-918a-7c8a97b698aa', 'Brinde', 15.0, '2026-05-08', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-08');

-- === VENDA 11131: IPHONE 13 128GB PRETO SEMINOVO (08/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('4ec7dcde-9392-4eff-bd1c-7a0cd720a67c', 'Apple', 'IPHONE 13 128GB PRETO SEMINOVO', '350038441784457', 1924.0, 1800.0, 4, 'seminovo', 'bom', 'vendido', '2026-05-08', '2026-05-08', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-08', '2026-05-08', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('1f0480e9-e8ea-43e6-a9cf-25de8a2fc78e', 11131, current_setting('importacao.cliente_id')::uuid, 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 1924.0, 1924.0, 0.0, '2026-05-08', '2026-05-08', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
UPDATE aparelhos SET venda_id = '1f0480e9-e8ea-43e6-a9cf-25de8a2fc78e' WHERE id = '4ec7dcde-9392-4eff-bd1c-7a0cd720a67c';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('0636aa0f-cc98-4dd3-83aa-d4eb4fc479b8', '1f0480e9-e8ea-43e6-a9cf-25de8a2fc78e', 'cartao_credito', 1924.0, '2026-05-08', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('d04e7330-560b-4093-a9de-69e4e05ae137', 4, '1f0480e9-e8ea-43e6-a9cf-25de8a2fc78e', 'Brinde', 15.0, '2026-05-08', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-08');

-- === VENDA 11132: IPHONE 13 PRO MAX 128GB PRETO SEMINOVO (08/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('76de5e8e-be82-48e9-a044-1e43fdcb75d0', 'Apple', 'IPHONE 13 PRO MAX 128GB PRETO SEMINOVO', '352114954343441', 2850.0, 2650.0, 4, 'seminovo', 'bom', 'vendido', '2026-05-08', '2026-05-08', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-08', '2026-05-08', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('d9999d21-24e9-4d1a-8850-29976b8b1e98', 11132, current_setting('importacao.cliente_id')::uuid, 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 2850.0, 2850.0, 0.0, '2026-05-08', '2026-05-08', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
UPDATE aparelhos SET venda_id = 'd9999d21-24e9-4d1a-8850-29976b8b1e98' WHERE id = '76de5e8e-be82-48e9-a044-1e43fdcb75d0';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('bfc0232f-1c55-4373-9b08-dc7e49ee620c', 'd9999d21-24e9-4d1a-8850-29976b8b1e98', 'pix', 2850.0, '2026-05-08', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('102ea2e5-829e-4faa-aca9-091f7498f914', 4, 'd9999d21-24e9-4d1a-8850-29976b8b1e98', 'Brinde', 25.0, '2026-05-08', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-08');

-- === VENDA 11133: AIRPODS PRO 3 NOVO (08/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('d18b897f-f85e-4433-ae53-96c2eda7603a', 'Outros', 'AIRPODS PRO 3 NOVO', 'H2P49XQY13', 1700.0, 1500.0, 19, 'novo', 'perfeito', 'vendido', '2026-05-08', '2026-05-08', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-08', '2026-05-08', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('7b75713a-0a79-40f0-8987-f2a2453bd678', 11133, current_setting('importacao.cliente_id')::uuid, 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 1700.0, 1700.0, 0.0, '2026-05-08', '2026-05-08', '97f12885-87ad-426a-8bbb-656889d82e10');
UPDATE aparelhos SET venda_id = '7b75713a-0a79-40f0-8987-f2a2453bd678' WHERE id = 'd18b897f-f85e-4433-ae53-96c2eda7603a';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('eea164f4-155d-47d2-b739-3db5f0b7d427', '7b75713a-0a79-40f0-8987-f2a2453bd678', 'cartao_credito', 1700.0, '2026-05-08', '97f12885-87ad-426a-8bbb-656889d82e10', 1);

-- === VENDA 11134: IPHONE 14 PRO MAX BRANCO SEMINOVO (08/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('67841142-d211-4a4b-8e18-151136a5c764', 'Apple', 'IPHONE 14 PRO MAX BRANCO SEMINOVO', '350636590567381', 3250.0, 3150.0, 19, 'seminovo', 'bom', 'vendido', '2026-05-08', '2026-05-08', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-08', '2026-05-08', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('5b1fd157-65d7-4e1e-b922-794767bf5710', 11134, current_setting('importacao.cliente_id')::uuid, 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 3250.0, 3250.0, 0.0, '2026-05-08', '2026-05-08', '97f12885-87ad-426a-8bbb-656889d82e10');
UPDATE aparelhos SET venda_id = '5b1fd157-65d7-4e1e-b922-794767bf5710' WHERE id = '67841142-d211-4a4b-8e18-151136a5c764';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('399ec02a-f99a-42cd-8263-00890a877870', '5b1fd157-65d7-4e1e-b922-794767bf5710', 'pix', 3250.0, '2026-05-08', '97f12885-87ad-426a-8bbb-656889d82e10', 1);

-- === VENDA 11135: POCO PAD M1 CINZA NOVO (08/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('95b26e98-e149-4f95-97ae-348c4222a09b', 'Outros', 'POCO PAD M1 CINZA NOVO', '7111Y5YJ02338', 1750.0, 1600.0, 20, 'novo', 'perfeito', 'vendido', '2026-05-08', '2026-05-08', '25e2da5b-9e76-4388-9890-7e22efd6940d', '2026-05-08', '2026-05-08', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('9bd3b144-2c1b-4d79-9cde-89722b05e7cd', 11135, current_setting('importacao.cliente_id')::uuid, 20, '25e2da5b-9e76-4388-9890-7e22efd6940d', 'concluida', 'normal', 1750.0, 1750.0, 0.0, '2026-05-08', '2026-05-08', '25e2da5b-9e76-4388-9890-7e22efd6940d');
UPDATE aparelhos SET venda_id = '9bd3b144-2c1b-4d79-9cde-89722b05e7cd' WHERE id = '95b26e98-e149-4f95-97ae-348c4222a09b';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('1c9c80df-7037-4370-8c88-b60899d6f8dd', '9bd3b144-2c1b-4d79-9cde-89722b05e7cd', 'pix', 1750.0, '2026-05-08', '25e2da5b-9e76-4388-9890-7e22efd6940d', 1);

-- === VENDA 11136: IPHONE 14 PRO MAX ROXO SEMINOVO (08/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('fe58e563-85a5-4b6c-9f89-54c36ec4c86d', 'Apple', 'IPHONE 14 PRO MAX ROXO SEMINOVO', '357650612874918', 3425.0, 3150.0, 20, 'seminovo', 'bom', 'vendido', '2026-05-08', '2026-05-08', '25e2da5b-9e76-4388-9890-7e22efd6940d', '2026-05-08', '2026-05-08', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('55d0eb4f-f065-4241-b224-40f749b11ba4', 11136, current_setting('importacao.cliente_id')::uuid, 20, '25e2da5b-9e76-4388-9890-7e22efd6940d', 'concluida', 'normal', 3425.0, 3425.0, 0.0, '2026-05-08', '2026-05-08', '25e2da5b-9e76-4388-9890-7e22efd6940d');
UPDATE aparelhos SET venda_id = '55d0eb4f-f065-4241-b224-40f749b11ba4' WHERE id = 'fe58e563-85a5-4b6c-9f89-54c36ec4c86d';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('c5743fe3-0119-4e1b-aefa-bc61d598b55e', '55d0eb4f-f065-4241-b224-40f749b11ba4', 'pix', 3425.0, '2026-05-08', '25e2da5b-9e76-4388-9890-7e22efd6940d', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('aeca8222-f32d-402f-bb5f-7cdba44b9134', 20, '55d0eb4f-f065-4241-b224-40f749b11ba4', 'Brinde', 15.0, '2026-05-08', '25e2da5b-9e76-4388-9890-7e22efd6940d', '2026-05-08');

-- === VENDA 11137: IPHONE 17 PRO MAX 512GB SILVER NOVO (08/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('bb9a1b25-ca03-447e-8209-60e2889020b0', 'Apple', 'IPHONE 17 PRO MAX 512GB SILVER NOVO', '357329447631468', 9900.0, 9500.0, 20, 'novo', 'perfeito', 'vendido', '2026-05-08', '2026-05-08', '0dd2c938-c6dd-4f5d-aac5-ed045ee5d2fb', '2026-05-08', '2026-05-08', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('69738234-7c46-4e84-96bd-72323dbc8bee', 11137, current_setting('importacao.cliente_id')::uuid, 20, '0dd2c938-c6dd-4f5d-aac5-ed045ee5d2fb', 'concluida', 'normal', 9900.0, 9900.0, 0.0, '2026-05-08', '2026-05-08', '0dd2c938-c6dd-4f5d-aac5-ed045ee5d2fb');
UPDATE aparelhos SET venda_id = '69738234-7c46-4e84-96bd-72323dbc8bee' WHERE id = 'bb9a1b25-ca03-447e-8209-60e2889020b0';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('03b0fc7c-a40f-4de8-adf2-94116f4229f9', '69738234-7c46-4e84-96bd-72323dbc8bee', 'pix', 5400.0, '2026-05-08', '0dd2c938-c6dd-4f5d-aac5-ed045ee5d2fb', 1);
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, observacao, parcelas)
VALUES ('0070f1bb-db49-41e8-b369-5680b6c921fa', '69738234-7c46-4e84-96bd-72323dbc8bee', 'troca_aparelho', 4500.0, '2026-05-08', '0dd2c938-c6dd-4f5d-aac5-ed045ee5d2fb', 'Troca: 16 PRO DE 256 GB NA COR DESERT', 1);

-- === VENDA 11138: IPHONE XR 64GB PRETO SEMINOVO (08/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('35ed1ab1-75de-4ed9-aa04-c5b9120a6b3f', 'Apple', 'IPHONE XR 64GB PRETO SEMINOVO', '35308210166173', 750.0, 500.0, 20, 'seminovo', 'bom', 'vendido', '2026-05-08', '2026-05-08', '0dd2c938-c6dd-4f5d-aac5-ed045ee5d2fb', '2026-05-08', '2026-05-08', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('a30556e4-f8f7-4f53-ad5a-a5c94969b08a', 11138, current_setting('importacao.cliente_id')::uuid, 20, '0dd2c938-c6dd-4f5d-aac5-ed045ee5d2fb', 'concluida', 'normal', 750.0, 750.0, 0.0, '2026-05-08', '2026-05-08', '0dd2c938-c6dd-4f5d-aac5-ed045ee5d2fb');
UPDATE aparelhos SET venda_id = 'a30556e4-f8f7-4f53-ad5a-a5c94969b08a' WHERE id = '35ed1ab1-75de-4ed9-aa04-c5b9120a6b3f';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('2edb12ae-8f97-43b3-9633-2309a7eb4c06', 'a30556e4-f8f7-4f53-ad5a-a5c94969b08a', 'pix', 750.0, '2026-05-08', '0dd2c938-c6dd-4f5d-aac5-ed045ee5d2fb', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('d40ba260-8cea-444e-8b8d-74a0f16a6cd1', 20, 'a30556e4-f8f7-4f53-ad5a-a5c94969b08a', 'Brinde', 25.0, '2026-05-08', '0dd2c938-c6dd-4f5d-aac5-ed045ee5d2fb', '2026-05-08');

-- === VENDA 11139: GALAXY TAB S10 FE NOVO (09/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('fc006e90-7ed3-456a-a5a5-0fb82671c259', 'Outros', 'GALAXY TAB S10 FE NOVO', 'R5GL34HOBP', 2680.0, 2350.0, 4, 'novo', 'perfeito', 'vendido', '2026-05-09', '2026-05-09', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-09', '2026-05-09', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('d09a2db9-b4d2-4d98-b48a-d256b9634ab9', 11139, current_setting('importacao.cliente_id')::uuid, 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 2680.0, 2680.0, 0.0, '2026-05-09', '2026-05-09', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
UPDATE aparelhos SET venda_id = 'd09a2db9-b4d2-4d98-b48a-d256b9634ab9' WHERE id = 'fc006e90-7ed3-456a-a5a5-0fb82671c259';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('4d421f86-73ea-4fe5-87b0-b8e576e9bd1d', 'd09a2db9-b4d2-4d98-b48a-d256b9634ab9', 'pix', 520.0, '2026-05-09', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1);
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('aaf3bccb-4a38-4d1a-9b4c-7d3e42dc7ea8', 'd09a2db9-b4d2-4d98-b48a-d256b9634ab9', 'dinheiro', 160.0, '2026-05-09', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1);
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('76493e3e-3ad6-4f5d-b931-e4afb091855c', 'd09a2db9-b4d2-4d98-b48a-d256b9634ab9', 'cartao_credito', 2000.0, '2026-05-09', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('00e78f20-e1ed-439f-b6c4-c0637c907469', 4, 'd09a2db9-b4d2-4d98-b48a-d256b9634ab9', 'Brinde', 70.0, '2026-05-09', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-09');

-- === VENDA 11140: IPHONE 12 128GB AZUL SEMINOVO (09/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('a9e6a05c-8a4b-41ed-99ce-99debb4b29cd', 'Apple', 'IPHONE 12 128GB AZUL SEMINOVO', '353361731078373', 1600.0, 1300.0, 4, 'seminovo', 'bom', 'vendido', '2026-05-09', '2026-05-09', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-09', '2026-05-09', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('3d681e6b-597b-4248-a10d-2dd502ec7f45', 11140, current_setting('importacao.cliente_id')::uuid, 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 1600.0, 1600.0, 0.0, '2026-05-09', '2026-05-09', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
UPDATE aparelhos SET venda_id = '3d681e6b-597b-4248-a10d-2dd502ec7f45' WHERE id = 'a9e6a05c-8a4b-41ed-99ce-99debb4b29cd';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('3e6a8e8e-25bd-4d62-a673-58360906a036', '3d681e6b-597b-4248-a10d-2dd502ec7f45', 'pix', 375.0, '2026-05-09', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1);
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('eaf94e14-2fea-44b2-afa1-94ec77360310', '3d681e6b-597b-4248-a10d-2dd502ec7f45', 'cartao_credito', 1225.0, '2026-05-09', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('19a282ec-cc3b-4cff-8f11-b754437b761b', 4, '3d681e6b-597b-4248-a10d-2dd502ec7f45', 'Brinde', 25.0, '2026-05-09', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-09');

-- === VENDA 11141: IPHONE 13 PRO MAX 128GB DOURADO SEMINOVO (09/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('814d422e-2cea-4bd9-99d2-92f63f2b218b', 'Apple', 'IPHONE 13 PRO MAX 128GB DOURADO SEMINOVO', '353869220959541', 2940.0, 2650.0, 4, 'seminovo', 'bom', 'vendido', '2026-05-09', '2026-05-09', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-09', '2026-05-09', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('e11e57ec-a6c0-44c3-8d2c-83781ffb83f3', 11141, current_setting('importacao.cliente_id')::uuid, 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 2940.0, 2940.0, 0.0, '2026-05-09', '2026-05-09', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
UPDATE aparelhos SET venda_id = 'e11e57ec-a6c0-44c3-8d2c-83781ffb83f3' WHERE id = '814d422e-2cea-4bd9-99d2-92f63f2b218b';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('9437c886-4193-410c-ab66-ed23c3160ed7', 'e11e57ec-a6c0-44c3-8d2c-83781ffb83f3', 'cartao_credito', 2940.0, '2026-05-09', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('37d59edb-0a85-4bac-9fd8-0e9aec5b7cc0', 4, 'e11e57ec-a6c0-44c3-8d2c-83781ffb83f3', 'Brinde', 25.0, '2026-05-09', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-09');

-- === VENDA 11142: IPHONE 13 PRO MAX 128GB DOURADO SEMINOVO (09/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('ade29f47-06a0-4716-8730-c9c4154c05de', 'Apple', 'IPHONE 13 PRO MAX 128GB DOURADO SEMINOVO', '353967811367765', 2900.0, 2650.0, 20, 'seminovo', 'bom', 'vendido', '2026-05-09', '2026-05-09', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', '2026-05-09', '2026-05-09', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('03a36c6d-2e8d-4334-a9bd-37eeac2ddc97', 11142, current_setting('importacao.cliente_id')::uuid, 20, 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 'concluida', 'normal', 2900.0, 2900.0, 0.0, '2026-05-09', '2026-05-09', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4');
UPDATE aparelhos SET venda_id = '03a36c6d-2e8d-4334-a9bd-37eeac2ddc97' WHERE id = 'ade29f47-06a0-4716-8730-c9c4154c05de';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('c4cd0c3e-41bc-4c80-b2d9-bf4d02e0036b', '03a36c6d-2e8d-4334-a9bd-37eeac2ddc97', 'pix', 1800.0, '2026-05-09', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 1);
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, observacao, parcelas)
VALUES ('753b19cd-78af-4bd4-9e34-f3c8d23cb527', '03a36c6d-2e8d-4334-a9bd-37eeac2ddc97', 'troca_aparelho', 1100.0, '2026-05-09', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 'Troca: IPH 12 64GB', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('8661bb38-f137-4ad6-afa8-7621f4246f5e', 20, '03a36c6d-2e8d-4334-a9bd-37eeac2ddc97', 'Brinde', 5.0, '2026-05-09', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', '2026-05-09');

-- === VENDA 11143: IPHONE 17 PRO BRANCO NOVO (09/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('e72c1e67-0221-4184-ac24-2ff4bafb0fa8', 'Apple', 'IPHONE 17 PRO BRANCO NOVO', '354289633906715', 7600.0, 7500.0, 19, 'novo', 'perfeito', 'vendido', '2026-05-09', '2026-05-09', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-09', '2026-05-09', 'Pagto junto (Aparelho 1/2, total grupo R$ 11,750)');
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('4900d995-408d-4ca0-9d95-f0c4202443d5', 11143, current_setting('importacao.cliente_id')::uuid, 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 7600.0, 7600.0, 0.0, '2026-05-09', '2026-05-09', '97f12885-87ad-426a-8bbb-656889d82e10');
UPDATE aparelhos SET venda_id = '4900d995-408d-4ca0-9d95-f0c4202443d5' WHERE id = 'e72c1e67-0221-4184-ac24-2ff4bafb0fa8';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('9adbf332-305f-4eea-a914-10982b2de0c0', '4900d995-408d-4ca0-9d95-f0c4202443d5', 'pix', 7600.0, '2026-05-09', '97f12885-87ad-426a-8bbb-656889d82e10', 1);

-- === VENDA 11144: IPHONE 17E PRETO NOVO (09/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('60160796-bf82-422c-ba22-13d5b1327149', 'Apple', 'IPHONE 17E PRETO NOVO', '351101750253834', 4150.0, 3700.0, 19, 'novo', 'perfeito', 'vendido', '2026-05-09', '2026-05-09', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-09', '2026-05-09', 'Pagto junto (Aparelho 2/2, total grupo R$ 11,750)');
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('e9af3918-e1ff-4cd0-a46e-22e20f149c25', 11144, current_setting('importacao.cliente_id')::uuid, 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 4150.0, 4150.0, 0.0, '2026-05-09', '2026-05-09', '97f12885-87ad-426a-8bbb-656889d82e10');
UPDATE aparelhos SET venda_id = 'e9af3918-e1ff-4cd0-a46e-22e20f149c25' WHERE id = '60160796-bf82-422c-ba22-13d5b1327149';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('ad80cd20-f05b-40bc-87af-5e8492fbadbd', 'e9af3918-e1ff-4cd0-a46e-22e20f149c25', 'pix', 4150.0, '2026-05-09', '97f12885-87ad-426a-8bbb-656889d82e10', 1);

-- === VENDA 11145: IPHONE 16 PRO 256GB DOURADO SEMINOVO (09/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('16d5f781-c712-44cb-999c-48c4af0a2280', 'Apple', 'IPHONE 16 PRO 256GB DOURADO SEMINOVO', '358876629642191', 5000.0, 4500.0, 1, 'seminovo', 'bom', 'vendido', '2026-05-09', '2026-05-09', '9451cd9f-6770-4e32-aae8-c75fa675e818', '2026-05-09', '2026-05-09', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('0c4ce62f-9f97-4a29-8a64-9cf3a2289d1b', 11145, current_setting('importacao.cliente_id')::uuid, 1, '9451cd9f-6770-4e32-aae8-c75fa675e818', 'concluida', 'normal', 5000.0, 5000.0, 0.0, '2026-05-09', '2026-05-09', '9451cd9f-6770-4e32-aae8-c75fa675e818');
UPDATE aparelhos SET venda_id = '0c4ce62f-9f97-4a29-8a64-9cf3a2289d1b' WHERE id = '16d5f781-c712-44cb-999c-48c4af0a2280';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('118cda4f-9156-44ef-ae1c-9699400c9acc', '0c4ce62f-9f97-4a29-8a64-9cf3a2289d1b', 'pix', 5000.0, '2026-05-09', '9451cd9f-6770-4e32-aae8-c75fa675e818', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('a5dfb401-e91a-4baa-bfb5-61a327a913e1', 1, '0c4ce62f-9f97-4a29-8a64-9cf3a2289d1b', 'Brinde', 15.0, '2026-05-09', '9451cd9f-6770-4e32-aae8-c75fa675e818', '2026-05-09');

-- === VENDA 11146: IPHONE 14 PRO MAX 128GB PRETO SEMINOVO (09/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('eac227c8-a796-498d-a028-d6cd6b5af4e7', 'Apple', 'IPHONE 14 PRO MAX 128GB PRETO SEMINOVO', '356703857557028', 3650.0, 3150.0, 1, 'seminovo', 'bom', 'vendido', '2026-05-09', '2026-05-09', '9451cd9f-6770-4e32-aae8-c75fa675e818', '2026-05-09', '2026-05-09', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('1fa533c8-9aeb-4ca0-8f0c-418504045567', 11146, current_setting('importacao.cliente_id')::uuid, 1, '9451cd9f-6770-4e32-aae8-c75fa675e818', 'concluida', 'normal', 3650.0, 3650.0, 0.0, '2026-05-09', '2026-05-09', '9451cd9f-6770-4e32-aae8-c75fa675e818');
UPDATE aparelhos SET venda_id = '1fa533c8-9aeb-4ca0-8f0c-418504045567' WHERE id = 'eac227c8-a796-498d-a028-d6cd6b5af4e7';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('cb023c9c-6814-4c36-9bfe-91e2819e1392', '1fa533c8-9aeb-4ca0-8f0c-418504045567', 'pix', 3650.0, '2026-05-09', '9451cd9f-6770-4e32-aae8-c75fa675e818', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('191bba17-d751-42e6-a4a4-525c522f8340', 1, '1fa533c8-9aeb-4ca0-8f0c-418504045567', 'Brinde', 25.0, '2026-05-09', '9451cd9f-6770-4e32-aae8-c75fa675e818', '2026-05-09');

-- === VENDA 11147: IPAD 11 (A16) 128GB BRANCO NOVO (09/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('6c665813-4e09-45cc-941c-6f6f21993e98', 'Apple', 'IPAD 11 (A16) 128GB BRANCO NOVO', 'MTGXKDV9QX', 2650.0, 2199.99, 1, 'novo', 'perfeito', 'vendido', '2026-05-09', '2026-05-09', '9451cd9f-6770-4e32-aae8-c75fa675e818', '2026-05-09', '2026-05-09', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('28d47fa5-fca1-4769-97fe-e642194189fb', 11147, current_setting('importacao.cliente_id')::uuid, 1, '9451cd9f-6770-4e32-aae8-c75fa675e818', 'concluida', 'normal', 2650.0, 2650.0, 0.0, '2026-05-09', '2026-05-09', '9451cd9f-6770-4e32-aae8-c75fa675e818');
UPDATE aparelhos SET venda_id = '28d47fa5-fca1-4769-97fe-e642194189fb' WHERE id = '6c665813-4e09-45cc-941c-6f6f21993e98';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('77f7ed20-0199-49ec-9c13-2e57bc57c4c9', '28d47fa5-fca1-4769-97fe-e642194189fb', 'pix', 2650.0, '2026-05-09', '9451cd9f-6770-4e32-aae8-c75fa675e818', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('5b394dd0-9731-47ea-a142-ba99a9c913f5', 1, '28d47fa5-fca1-4769-97fe-e642194189fb', 'Brinde', 75.0, '2026-05-09', '9451cd9f-6770-4e32-aae8-c75fa675e818', '2026-05-09');

-- === VENDA 11148: IPHONE 15 AZUL NOVO (09/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('d05249aa-617c-4cec-a513-5e38f007e295', 'Apple', 'IPHONE 15 AZUL NOVO', '355225774481521', 4000.0, 3600.0, 19, 'novo', 'perfeito', 'vendido', '2026-05-09', '2026-05-09', '85743f3e-1b32-49c0-9d9e-c16afd690f7d', '2026-05-09', '2026-05-09', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('5bc9fd53-ed4b-4e22-aed2-a2f9df3ef6db', 11148, current_setting('importacao.cliente_id')::uuid, 19, '85743f3e-1b32-49c0-9d9e-c16afd690f7d', 'concluida', 'normal', 4000.0, 4000.0, 0.0, '2026-05-09', '2026-05-09', '85743f3e-1b32-49c0-9d9e-c16afd690f7d');
UPDATE aparelhos SET venda_id = '5bc9fd53-ed4b-4e22-aed2-a2f9df3ef6db' WHERE id = 'd05249aa-617c-4cec-a513-5e38f007e295';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('7cb66c55-94b0-430f-80fc-caa130b6f2f3', '5bc9fd53-ed4b-4e22-aed2-a2f9df3ef6db', 'pix', 2400.0, '2026-05-09', '85743f3e-1b32-49c0-9d9e-c16afd690f7d', 1);
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, observacao, parcelas)
VALUES ('e8aa6fba-25d6-487a-a9c5-bda5181de397', '5bc9fd53-ed4b-4e22-aed2-a2f9df3ef6db', 'troca_aparelho', 1600.0, '2026-05-09', '85743f3e-1b32-49c0-9d9e-c16afd690f7d', 'Troca: IPHONE 13', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('2aaa5f64-d08d-4d72-a983-bb7d3d99786e', 19, '5bc9fd53-ed4b-4e22-aed2-a2f9df3ef6db', 'Brinde', 15.0, '2026-05-09', '85743f3e-1b32-49c0-9d9e-c16afd690f7d', '2026-05-09');

-- === VENDA 11149: X8 PRO 256GB PRETO NOVO (09/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('5fbe0237-408e-4ab9-9ff8-2e1ba8caf79b', 'Outros', 'X8 PRO 256GB PRETO NOVO', '866132085655102', 2100.0, 1900.0, 20, 'novo', 'perfeito', 'vendido', '2026-05-09', '2026-05-09', '0dd2c938-c6dd-4f5d-aac5-ed045ee5d2fb', '2026-05-09', '2026-05-09', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('de5c80f4-cdb9-4c3f-bce2-993befb7a5cc', 11149, current_setting('importacao.cliente_id')::uuid, 20, '0dd2c938-c6dd-4f5d-aac5-ed045ee5d2fb', 'concluida', 'normal', 2100.0, 2100.0, 0.0, '2026-05-09', '2026-05-09', '0dd2c938-c6dd-4f5d-aac5-ed045ee5d2fb');
UPDATE aparelhos SET venda_id = 'de5c80f4-cdb9-4c3f-bce2-993befb7a5cc' WHERE id = '5fbe0237-408e-4ab9-9ff8-2e1ba8caf79b';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('af19e1c2-0f3b-419b-9005-9adcc402a577', 'de5c80f4-cdb9-4c3f-bce2-993befb7a5cc', 'pix', 2100.0, '2026-05-09', '0dd2c938-c6dd-4f5d-aac5-ed045ee5d2fb', 1);

-- === VENDA 11150: IPHONE 15 PRO MAX 256GB NATURAL SEMINOVO (09/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('8bd35533-ddb6-4b2b-8cd1-f340987ff4ad', 'Apple', 'IPHONE 15 PRO MAX 256GB NATURAL SEMINOVO', '356511211655440', 4150.0, 3950.0, 1, 'seminovo', 'bom', 'vendido', '2026-05-09', '2026-05-09', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-09', '2026-05-09', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('77b150f9-0d6c-423a-a497-649c4ecae8ca', 11150, current_setting('importacao.cliente_id')::uuid, 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 4150.0, 4150.0, 0.0, '2026-05-09', '2026-05-09', '85e3aa42-b9af-49b8-a72a-64e9c337aa53');
UPDATE aparelhos SET venda_id = '77b150f9-0d6c-423a-a497-649c4ecae8ca' WHERE id = '8bd35533-ddb6-4b2b-8cd1-f340987ff4ad';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('aea53aa5-046b-4c58-ae33-2c91ce290e03', '77b150f9-0d6c-423a-a497-649c4ecae8ca', 'pix', 4150.0, '2026-05-09', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('92b380a6-2cc1-40bc-93d4-a413845c67ef', 1, '77b150f9-0d6c-423a-a497-649c4ecae8ca', 'Brinde', 25.0, '2026-05-09', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-09');

-- === VENDA 11151: IPHONE 17 PRO MAX 256GB SILVER NOVO (09/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('b02ef1ad-0481-494c-bdb5-028d4ac4ad98', 'Apple', 'IPHONE 17 PRO MAX 256GB SILVER NOVO', '351668140692723', 8618.0, 8350.0, 1, 'novo', 'perfeito', 'vendido', '2026-05-09', '2026-05-09', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-09', '2026-05-09', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('811ea7c6-544b-4b37-81b4-7e253af1bbba', 11151, current_setting('importacao.cliente_id')::uuid, 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 8618.0, 8618.0, 0.0, '2026-05-09', '2026-05-09', '85e3aa42-b9af-49b8-a72a-64e9c337aa53');
UPDATE aparelhos SET venda_id = '811ea7c6-544b-4b37-81b4-7e253af1bbba' WHERE id = 'b02ef1ad-0481-494c-bdb5-028d4ac4ad98';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('77babde8-7a6a-4259-9a3d-f6686d46c0d5', '811ea7c6-544b-4b37-81b4-7e253af1bbba', 'pix', 6618.0, '2026-05-09', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 1);
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, observacao, parcelas)
VALUES ('d6e0ff28-b004-4a37-bbf3-d0e7f3fc6356', '811ea7c6-544b-4b37-81b4-7e253af1bbba', 'troca_aparelho', 2000.0, '2026-05-09', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'Troca: IPH 13 PRO 256GB VERDE', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('722f42ce-d3b4-4eec-b4cb-3beaac8da76f', 1, '811ea7c6-544b-4b37-81b4-7e253af1bbba', 'Brinde', 10.0, '2026-05-09', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-09');

-- === VENDA 11152: IPHONE 15 PRO MAX 256GB AZUL SEMINOVO (09/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('2c4f0026-ef05-4e0f-8c0a-e925ee7ab8f7', 'Apple', 'IPHONE 15 PRO MAX 256GB AZUL SEMINOVO', '350278026556389', 4300.0, 3950.0, 20, 'seminovo', 'bom', 'vendido', '2026-05-09', '2026-05-09', '0dd2c938-c6dd-4f5d-aac5-ed045ee5d2fb', '2026-05-09', '2026-05-09', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('da8d7acc-873a-4139-9015-acaf5a4b26b9', 11152, current_setting('importacao.cliente_id')::uuid, 20, '0dd2c938-c6dd-4f5d-aac5-ed045ee5d2fb', 'concluida', 'normal', 4300.0, 4300.0, 0.0, '2026-05-09', '2026-05-09', '0dd2c938-c6dd-4f5d-aac5-ed045ee5d2fb');
UPDATE aparelhos SET venda_id = 'da8d7acc-873a-4139-9015-acaf5a4b26b9' WHERE id = '2c4f0026-ef05-4e0f-8c0a-e925ee7ab8f7';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('e2df4369-2785-4ed3-8432-f29b15b6b8f2', 'da8d7acc-873a-4139-9015-acaf5a4b26b9', 'pix', 3350.0, '2026-05-09', '0dd2c938-c6dd-4f5d-aac5-ed045ee5d2fb', 1);
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, observacao, parcelas)
VALUES ('c0b48764-771a-423b-acc3-4bbfd49710fc', 'da8d7acc-873a-4139-9015-acaf5a4b26b9', 'troca_aparelho', 950.0, '2026-05-09', '0dd2c938-c6dd-4f5d-aac5-ed045ee5d2fb', 'Troca: IPHONE 12 NA COR LILAS DE 64 GB', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('96eab4f3-bf46-41b3-a3f2-2f0768a706b0', 20, 'da8d7acc-873a-4139-9015-acaf5a4b26b9', 'Brinde', 25.0, '2026-05-09', '0dd2c938-c6dd-4f5d-aac5-ed045ee5d2fb', '2026-05-09');

-- === VENDA 11153: IPHONE 15 PRO MAX 512GB AZUL SEMINOVO (09/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('cff362ec-ba3b-40f4-9961-c49b5dfedc26', 'Apple', 'IPHONE 15 PRO MAX 512GB AZUL SEMINOVO', '356371481303415', 4550.0, 4300.0, 20, 'seminovo', 'bom', 'vendido', '2026-05-09', '2026-05-09', '25e2da5b-9e76-4388-9890-7e22efd6940d', '2026-05-09', '2026-05-09', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('eee2a1be-8376-427b-abf3-25b69c0b205d', 11153, current_setting('importacao.cliente_id')::uuid, 20, '25e2da5b-9e76-4388-9890-7e22efd6940d', 'concluida', 'normal', 4550.0, 4550.0, 0.0, '2026-05-09', '2026-05-09', '25e2da5b-9e76-4388-9890-7e22efd6940d');
UPDATE aparelhos SET venda_id = 'eee2a1be-8376-427b-abf3-25b69c0b205d' WHERE id = 'cff362ec-ba3b-40f4-9961-c49b5dfedc26';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('003201c5-9c3a-45cb-8e1f-8e7bf16c9ca8', 'eee2a1be-8376-427b-abf3-25b69c0b205d', 'pix', 3050.0, '2026-05-09', '25e2da5b-9e76-4388-9890-7e22efd6940d', 1);
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, observacao, parcelas)
VALUES ('d1673c94-47a1-4a81-9e38-1ba80be234c9', 'eee2a1be-8376-427b-abf3-25b69c0b205d', 'troca_aparelho', 1500.0, '2026-05-09', '25e2da5b-9e76-4388-9890-7e22efd6940d', 'Troca: IPH 13 128GB AZUL', 1);

-- === VENDA 11154: IPHONE 17 PRO MAX 256GB BRANCO NOVO (09/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('05762462-118a-49ad-afb2-0c39a97812f3', 'Apple', 'IPHONE 17 PRO MAX 256GB BRANCO NOVO', '351205740164702', 8650.0, 8350.0, 1, 'novo', 'perfeito', 'vendido', '2026-05-09', '2026-05-09', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-09', '2026-05-09', 'Pagto junto (Aparelho 2/2, total grupo R$ 17,300)');
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('da80973d-f5c9-449a-9c12-31a73b4cbaa9', 11154, current_setting('importacao.cliente_id')::uuid, 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 8650.0, 8650.0, 0.0, '2026-05-09', '2026-05-09', '85e3aa42-b9af-49b8-a72a-64e9c337aa53');
UPDATE aparelhos SET venda_id = 'da80973d-f5c9-449a-9c12-31a73b4cbaa9' WHERE id = '05762462-118a-49ad-afb2-0c39a97812f3';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('fe6fd01d-2a74-48d0-80be-0345e4d885c6', 'da80973d-f5c9-449a-9c12-31a73b4cbaa9', 'pix', 3650.0, '2026-05-09', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 1);
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, observacao, parcelas)
VALUES ('157fdc03-49fb-4208-ab34-3b55f1796582', 'da80973d-f5c9-449a-9c12-31a73b4cbaa9', 'troca_aparelho', 5000.0, '2026-05-09', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'Troca: IPH 16 PRO MAX 256GB PRETO', 1);

-- === VENDA 11155: REDMI NOTE 15 256GB PRETO NOVO (09/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('db0b655d-d6bb-47a3-852a-45c626f22db2', 'Xiaomi', 'REDMI NOTE 15 256GB PRETO NOVO', '862315087076260', 1302.0, 1070.0, 4, 'novo', 'perfeito', 'vendido', '2026-05-09', '2026-05-09', 'e07d4d35-1381-4d4d-914d-8382a7456fdd', '2026-05-09', '2026-05-09', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('1873014b-e903-4188-bdea-45997f05b42b', 11155, current_setting('importacao.cliente_id')::uuid, 4, 'e07d4d35-1381-4d4d-914d-8382a7456fdd', 'concluida', 'normal', 1302.0, 1302.0, 0.0, '2026-05-09', '2026-05-09', 'e07d4d35-1381-4d4d-914d-8382a7456fdd');
UPDATE aparelhos SET venda_id = '1873014b-e903-4188-bdea-45997f05b42b' WHERE id = 'db0b655d-d6bb-47a3-852a-45c626f22db2';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('8dae468e-a0aa-468c-b3ee-7b1cbe8f3b21', '1873014b-e903-4188-bdea-45997f05b42b', 'cartao_credito', 1302.0, '2026-05-09', 'e07d4d35-1381-4d4d-914d-8382a7456fdd', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('07a9e884-e458-4d7c-8c2f-34b99cf17c47', 4, '1873014b-e903-4188-bdea-45997f05b42b', 'Brinde', 10.0, '2026-05-09', 'e07d4d35-1381-4d4d-914d-8382a7456fdd', '2026-05-09');

-- === VENDA 11156: IPHONE 17 256GB AZUL LACRADO (10/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('e8f552e5-fbf8-4678-83a0-cb4b2bbe7aed', 'Apple', 'IPHONE 17 256GB AZUL LACRADO', '356484794319885', 4900.0, 4800.0, 1, 'novo', 'perfeito', 'vendido', '2026-05-10', '2026-05-10', '9451cd9f-6770-4e32-aae8-c75fa675e818', '2026-05-10', '2026-05-10', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('ca5d609f-8219-46d1-ae80-41b3db09c18d', 11156, current_setting('importacao.cliente_id')::uuid, 1, '9451cd9f-6770-4e32-aae8-c75fa675e818', 'concluida', 'normal', 4900.0, 4900.0, 0.0, '2026-05-10', '2026-05-10', '9451cd9f-6770-4e32-aae8-c75fa675e818');
UPDATE aparelhos SET venda_id = 'ca5d609f-8219-46d1-ae80-41b3db09c18d' WHERE id = 'e8f552e5-fbf8-4678-83a0-cb4b2bbe7aed';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('40443973-e702-46ae-83dd-724cf5e96c13', 'ca5d609f-8219-46d1-ae80-41b3db09c18d', 'pix', 4900.0, '2026-05-10', '9451cd9f-6770-4e32-aae8-c75fa675e818', 1);

-- === VENDA 11157: IPHONE 16 PRO MAX DESERT 256GB SEMINOVO (10/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('2f8f2cdf-a272-4d72-b172-9f2f7d788670', 'Apple', 'IPHONE 16 PRO MAX DESERT 256GB SEMINOVO', '358245525252036', 5248.0, 5000.0, 4, 'seminovo', 'bom', 'vendido', '2026-05-10', '2026-05-10', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-10', '2026-05-10', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('8e6d2465-c66a-42d1-8734-8143a11c4802', 11157, current_setting('importacao.cliente_id')::uuid, 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 5248.0, 5248.0, 0.0, '2026-05-10', '2026-05-10', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
UPDATE aparelhos SET venda_id = '8e6d2465-c66a-42d1-8734-8143a11c4802' WHERE id = '2f8f2cdf-a272-4d72-b172-9f2f7d788670';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('f40f3465-7f20-4326-a7c9-aef926f46c63', '8e6d2465-c66a-42d1-8734-8143a11c4802', 'pix', 2460.0, '2026-05-10', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1);
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('8e5c053e-715d-46cc-bd72-f1702a672041', '8e6d2465-c66a-42d1-8734-8143a11c4802', 'cartao_credito', 2788.0, '2026-05-10', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('a2327687-f38d-4dd8-bd52-62d30f312a77', 4, '8e6d2465-c66a-42d1-8734-8143a11c4802', 'Brinde', 25.0, '2026-05-10', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-10');

-- === VENDA 11158: IPHONE 17 PRO MAX 256GB LARANJA LACRADO (10/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('6c5b85eb-60d2-4e74-8574-783dfb339025', 'Apple', 'IPHONE 17 PRO MAX 256GB LARANJA LACRADO', '353497859462096', 8700.0, 8250.0, 1, 'novo', 'perfeito', 'vendido', '2026-05-10', '2026-05-10', '9451cd9f-6770-4e32-aae8-c75fa675e818', '2026-05-10', '2026-05-10', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('fd068e0e-f7fc-4647-8dc5-0e86547d13e4', 11158, current_setting('importacao.cliente_id')::uuid, 1, '9451cd9f-6770-4e32-aae8-c75fa675e818', 'concluida', 'normal', 8700.0, 8700.0, 0.0, '2026-05-10', '2026-05-10', '9451cd9f-6770-4e32-aae8-c75fa675e818');
UPDATE aparelhos SET venda_id = 'fd068e0e-f7fc-4647-8dc5-0e86547d13e4' WHERE id = '6c5b85eb-60d2-4e74-8574-783dfb339025';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('c82e2e45-c348-4fe4-ba12-3731bb51be92', 'fd068e0e-f7fc-4647-8dc5-0e86547d13e4', 'pix', 8700.0, '2026-05-10', '9451cd9f-6770-4e32-aae8-c75fa675e818', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('4b03c146-3df4-49ce-97c6-b7d6215969cd', 1, 'fd068e0e-f7fc-4647-8dc5-0e86547d13e4', 'Brinde', 135.0, '2026-05-10', '9451cd9f-6770-4e32-aae8-c75fa675e818', '2026-05-10');

-- === VENDA 11159: IPHONE 16 PRO MAX 256GB PRETO SEMINOVO (10/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('425c6c95-306c-4576-9209-e253bc9e1eba', 'Apple', 'IPHONE 16 PRO MAX 256GB PRETO SEMINOVO', '358594363316795', 5500.0, 5000.0, 20, 'seminovo', 'bom', 'vendido', '2026-05-10', '2026-05-10', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', '2026-05-10', '2026-05-10', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('1e6bf54c-f28c-45e2-9943-37f4a1af1fd3', 11159, current_setting('importacao.cliente_id')::uuid, 20, 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 'concluida', 'normal', 5500.0, 5500.0, 0.0, '2026-05-10', '2026-05-10', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4');
UPDATE aparelhos SET venda_id = '1e6bf54c-f28c-45e2-9943-37f4a1af1fd3' WHERE id = '425c6c95-306c-4576-9209-e253bc9e1eba';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('45686c46-b0bf-44be-89b1-78e37d97c3bb', '1e6bf54c-f28c-45e2-9943-37f4a1af1fd3', 'pix', 3500.0, '2026-05-10', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 1);
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, observacao, parcelas)
VALUES ('436ccf56-4e28-4e4a-9b94-431323b20f94', '1e6bf54c-f28c-45e2-9943-37f4a1af1fd3', 'troca_aparelho', 2000.0, '2026-05-10', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 'Troca: IPH 14 128GB AZUL', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('ae9952f3-a72c-454e-971e-763f36ac9f83', 20, '1e6bf54c-f28c-45e2-9943-37f4a1af1fd3', 'Brinde', 25.0, '2026-05-10', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', '2026-05-10');

-- === VENDA 11160: IPHONE 17 PRO MAX 256GB BRANCO NOVO (10/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('91b35e85-8783-49b0-9583-7b9e630e3c17', 'Apple', 'IPHONE 17 PRO MAX 256GB BRANCO NOVO', '355988219563654', 8600.0, 8350.0, 20, 'novo', 'perfeito', 'vendido', '2026-05-10', '2026-05-10', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', '2026-05-10', '2026-05-10', 'Pagto junto (Aparelho 1/2, total grupo R$ 17,100)');
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('4dd91667-9324-48c3-8bc3-00016b7be652', 11160, current_setting('importacao.cliente_id')::uuid, 20, 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 'concluida', 'normal', 8600.0, 8600.0, 0.0, '2026-05-10', '2026-05-10', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4');
UPDATE aparelhos SET venda_id = '4dd91667-9324-48c3-8bc3-00016b7be652' WHERE id = '91b35e85-8783-49b0-9583-7b9e630e3c17';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('31ce28b9-af29-4adc-87c7-de1f38e84f7b', '4dd91667-9324-48c3-8bc3-00016b7be652', 'cartao_credito', 4650.0, '2026-05-10', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 1);
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, observacao, parcelas)
VALUES ('abba3380-f7bd-43ba-8dd2-64e819b97554', '4dd91667-9324-48c3-8bc3-00016b7be652', 'troca_aparelho', 3950.0, '2026-05-10', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 'Troca: IPH 15 PRO MAX 256GB BRANCO', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('40e42a8c-bd38-4ff1-9574-7e9db9f220b3', 20, '4dd91667-9324-48c3-8bc3-00016b7be652', 'Brinde', 15.0, '2026-05-10', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', '2026-05-10');

-- === VENDA 11161: IPHONE 17 PRO MAX 256GB AZUL NOVO (10/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('8ebfe846-38ec-42f3-bacb-8430f8725c93', 'Apple', 'IPHONE 17 PRO MAX 256GB AZUL NOVO', '358434704613065', 8500.0, 8250.0, 20, 'novo', 'perfeito', 'vendido', '2026-05-10', '2026-05-10', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', '2026-05-10', '2026-05-10', 'Pagto junto (Aparelho 2/2, total grupo R$ 17,100)');
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('d252e97b-0a9d-47d9-8fce-9c18638256e3', 11161, current_setting('importacao.cliente_id')::uuid, 20, 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 'concluida', 'normal', 8500.0, 8500.0, 0.0, '2026-05-10', '2026-05-10', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4');
UPDATE aparelhos SET venda_id = 'd252e97b-0a9d-47d9-8fce-9c18638256e3' WHERE id = '8ebfe846-38ec-42f3-bacb-8430f8725c93';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('cd541c71-4286-48a4-a8b7-3bd910387f1b', 'd252e97b-0a9d-47d9-8fce-9c18638256e3', 'cartao_credito', 6850.0, '2026-05-10', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 1);
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, observacao, parcelas)
VALUES ('e56437d1-1d30-4755-82b4-ad2db4fd2c7b', 'd252e97b-0a9d-47d9-8fce-9c18638256e3', 'troca_aparelho', 1650.0, '2026-05-10', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 'Troca: IPH 13 PRO MAX 128GB', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('d8dae302-399a-423e-b496-83f6cc3943bb', 20, 'd252e97b-0a9d-47d9-8fce-9c18638256e3', 'Brinde', 15.0, '2026-05-10', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', '2026-05-10');

-- === VENDA 11162: IPHONE 15 PRO MAX 256GB AZUL SEMINOVO (10/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('8384c2b5-628a-45de-86b0-9e30e3af7f6d', 'Apple', 'IPHONE 15 PRO MAX 256GB AZUL SEMINOVO', '356371484863977', 4150.0, 4050.0, 20, 'seminovo', 'bom', 'vendido', '2026-05-10', '2026-05-10', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', '2026-05-10', '2026-05-10', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('b4134fc2-492e-4c43-9d38-3315d8f30765', 11162, current_setting('importacao.cliente_id')::uuid, 20, 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 'concluida', 'normal', 4150.0, 4150.0, 0.0, '2026-05-10', '2026-05-10', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4');
UPDATE aparelhos SET venda_id = 'b4134fc2-492e-4c43-9d38-3315d8f30765' WHERE id = '8384c2b5-628a-45de-86b0-9e30e3af7f6d';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('6416dbdb-fe1e-44d2-9b54-2628610cdf2f', 'b4134fc2-492e-4c43-9d38-3315d8f30765', 'pix', 4150.0, '2026-05-10', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 1);

-- === VENDA 11163: IPHONE 16 PRO 256GB DESERT SEMINOVO (10/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('f03cfe1e-abc1-4358-a224-f9ad4c4f4222', 'Apple', 'IPHONE 16 PRO 256GB DESERT SEMINOVO', '356295601102623', 4750.0, 4500.0, 1, 'seminovo', 'bom', 'vendido', '2026-05-10', '2026-05-10', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-10', '2026-05-10', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('cb82f197-5936-42dd-b9cd-45ef59487ac8', 11163, current_setting('importacao.cliente_id')::uuid, 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 4750.0, 4750.0, 0.0, '2026-05-10', '2026-05-10', '85e3aa42-b9af-49b8-a72a-64e9c337aa53');
UPDATE aparelhos SET venda_id = 'cb82f197-5936-42dd-b9cd-45ef59487ac8' WHERE id = 'f03cfe1e-abc1-4358-a224-f9ad4c4f4222';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('4ba500df-ef5a-44a3-9095-cf44814915de', 'cb82f197-5936-42dd-b9cd-45ef59487ac8', 'pix', 4750.0, '2026-05-10', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 1);

-- === VENDA 11164: IPHONE 17 256GB PRETO NOVO (10/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('34c208a0-01d8-4108-a57c-f792391a2ec4', 'Apple', 'IPHONE 17 256GB PRETO NOVO', '355559516499759', 5000.0, 4850.0, 1, 'novo', 'perfeito', 'vendido', '2026-05-10', '2026-05-10', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-10', '2026-05-10', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('e2b9941a-1127-4efd-aff2-caff8bf585dd', 11164, current_setting('importacao.cliente_id')::uuid, 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 5000.0, 5000.0, 0.0, '2026-05-10', '2026-05-10', '85e3aa42-b9af-49b8-a72a-64e9c337aa53');
UPDATE aparelhos SET venda_id = 'e2b9941a-1127-4efd-aff2-caff8bf585dd' WHERE id = '34c208a0-01d8-4108-a57c-f792391a2ec4';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('c9093fe5-2808-4fcd-85f3-26024c30af53', 'e2b9941a-1127-4efd-aff2-caff8bf585dd', 'dinheiro', 5000.0, '2026-05-10', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('13ec5453-3041-449f-83f7-c301f66e6411', 1, 'e2b9941a-1127-4efd-aff2-caff8bf585dd', 'Brinde', 25.0, '2026-05-10', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-10');

-- === VENDA 11165: NOTE 15 PRO 5G 256GB PRETO NOVO (10/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('29ad2c34-3305-47b3-8f88-0a6f00d39871', 'Redmi', 'NOTE 15 PRO 5G 256GB PRETO NOVO', '863573082363500', 2077.0, 1750.0, 1, 'novo', 'perfeito', 'vendido', '2026-05-10', '2026-05-10', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-10', '2026-05-10', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('4ab7261f-8947-4d5e-b861-e0ad77f026b2', 11165, current_setting('importacao.cliente_id')::uuid, 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 2077.0, 2077.0, 0.0, '2026-05-10', '2026-05-10', '85e3aa42-b9af-49b8-a72a-64e9c337aa53');
UPDATE aparelhos SET venda_id = '4ab7261f-8947-4d5e-b861-e0ad77f026b2' WHERE id = '29ad2c34-3305-47b3-8f88-0a6f00d39871';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('6f239e35-d762-4c30-8631-570db1766805', '4ab7261f-8947-4d5e-b861-e0ad77f026b2', 'pix', 2077.0, '2026-05-10', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('f16499ff-a950-4e20-8d79-ab86dd6ca40a', 1, '4ab7261f-8947-4d5e-b861-e0ad77f026b2', 'Brinde', 5.0, '2026-05-10', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-10');

-- === VENDA 11166: IPHONE 14 PRO MAX 128GB ROXO SEMINOVO (10/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('ee584860-fc0a-441b-953b-9ccfb493e8fb', 'Apple', 'IPHONE 14 PRO MAX 128GB ROXO SEMINOVO', '357773240801309', 3350.0, 3150.0, 1, 'seminovo', 'bom', 'vendido', '2026-05-10', '2026-05-10', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-10', '2026-05-10', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('e9542916-32c4-4ec1-90fe-f7532b66f6fc', 11166, current_setting('importacao.cliente_id')::uuid, 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 3350.0, 3350.0, 0.0, '2026-05-10', '2026-05-10', '85e3aa42-b9af-49b8-a72a-64e9c337aa53');
UPDATE aparelhos SET venda_id = 'e9542916-32c4-4ec1-90fe-f7532b66f6fc' WHERE id = 'ee584860-fc0a-441b-953b-9ccfb493e8fb';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('8c42ce5b-32d6-4c69-99f5-ff7e427e29d2', 'e9542916-32c4-4ec1-90fe-f7532b66f6fc', 'pix', 3350.0, '2026-05-10', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('38157b78-4b12-4a28-96bc-56b797c18604', 1, 'e9542916-32c4-4ec1-90fe-f7532b66f6fc', 'Brinde', 5.0, '2026-05-10', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-10');

-- === VENDA 11167: IPHONE 15 128GB AZUL NOVO (10/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('2130421b-787a-407e-b6bc-84993ae2aa19', 'Apple', 'IPHONE 15 128GB AZUL NOVO', '355225773551647', 4612.0, 3700.0, 1, 'novo', 'perfeito', 'vendido', '2026-05-10', '2026-05-10', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-10', '2026-05-10', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('cb17d5c9-2246-450e-b146-0fce508dfe59', 11167, current_setting('importacao.cliente_id')::uuid, 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 4612.0, 4612.0, 0.0, '2026-05-10', '2026-05-10', '85e3aa42-b9af-49b8-a72a-64e9c337aa53');
UPDATE aparelhos SET venda_id = 'cb17d5c9-2246-450e-b146-0fce508dfe59' WHERE id = '2130421b-787a-407e-b6bc-84993ae2aa19';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('c856bb6c-c06e-4986-98e5-04f7d2bc1375', 'cb17d5c9-2246-450e-b146-0fce508dfe59', 'pix', 4612.0, '2026-05-10', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('fd9b0147-2e7d-4ff9-befa-a0f207a666d6', 1, 'cb17d5c9-2246-450e-b146-0fce508dfe59', 'Brinde', 10.0, '2026-05-10', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-10');

-- === VENDA 11168: IPHONE 17 PRO MAX 256GB AZUL NOVO (10/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('174e4782-64fd-4b43-99fd-b14dc63a7acb', 'Apple', 'IPHONE 17 PRO MAX 256GB AZUL NOVO', '358434708446124', 8550.0, 8250.0, 1, 'novo', 'perfeito', 'vendido', '2026-05-10', '2026-05-10', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-10', '2026-05-10', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('b2a8dddd-a59d-4a75-9dfd-4e8bbd59edd8', 11168, current_setting('importacao.cliente_id')::uuid, 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 8550.0, 8550.0, 0.0, '2026-05-10', '2026-05-10', '85e3aa42-b9af-49b8-a72a-64e9c337aa53');
UPDATE aparelhos SET venda_id = 'b2a8dddd-a59d-4a75-9dfd-4e8bbd59edd8' WHERE id = '174e4782-64fd-4b43-99fd-b14dc63a7acb';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('fe866673-19ca-47f7-a9a5-2e3123a474e6', 'b2a8dddd-a59d-4a75-9dfd-4e8bbd59edd8', 'pix', 6700.0, '2026-05-10', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 1);
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, observacao, parcelas)
VALUES ('0f5e4fb0-7d08-423e-86a3-27bede33a7f8', 'b2a8dddd-a59d-4a75-9dfd-4e8bbd59edd8', 'troca_aparelho', 1850.0, '2026-05-10', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'Troca: IPH 12 PRO MAX 128GB AZUL', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('9df0bf9f-a46c-4c7e-8b60-f967c4ffa405', 1, 'b2a8dddd-a59d-4a75-9dfd-4e8bbd59edd8', 'Brinde', 10.0, '2026-05-10', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-10');

-- === VENDA 11169: IPHONE 15 PRO 256GB NATURAL SEMINOVO (10/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('d9c199f2-0827-4e1c-b196-dc444619a7e4', 'Apple', 'IPHONE 15 PRO 256GB NATURAL SEMINOVO', '354078643177411', 3697.0, 3180.0, 20, 'seminovo', 'bom', 'vendido', '2026-05-10', '2026-05-10', '25e2da5b-9e76-4388-9890-7e22efd6940d', '2026-05-10', '2026-05-10', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('26ddef91-bad1-47c4-bc68-84fd66f3b91b', 11169, current_setting('importacao.cliente_id')::uuid, 20, '25e2da5b-9e76-4388-9890-7e22efd6940d', 'concluida', 'normal', 3697.0, 3697.0, 0.0, '2026-05-10', '2026-05-10', '25e2da5b-9e76-4388-9890-7e22efd6940d');
UPDATE aparelhos SET venda_id = '26ddef91-bad1-47c4-bc68-84fd66f3b91b' WHERE id = 'd9c199f2-0827-4e1c-b196-dc444619a7e4';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('43654816-b0c5-43a7-9081-1ce8c2270d84', '26ddef91-bad1-47c4-bc68-84fd66f3b91b', 'cartao_credito', 3697.0, '2026-05-10', '25e2da5b-9e76-4388-9890-7e22efd6940d', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('b9c024bf-7d40-4c3a-885a-fc1a45ed5ec8', 20, '26ddef91-bad1-47c4-bc68-84fd66f3b91b', 'Brinde', 25.0, '2026-05-10', '25e2da5b-9e76-4388-9890-7e22efd6940d', '2026-05-10');

-- === VENDA 11170: IPHONE 17 256GB BRANCO NOVO (10/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('23298c9f-f923-4388-9195-47f2ff2e4721', 'Apple', 'IPHONE 17 256GB BRANCO NOVO', '350418055419998', 5430.0, 4900.0, 19, 'novo', 'perfeito', 'vendido', '2026-05-10', '2026-05-10', 'b4269e60-eea2-4eba-a34d-db9591e0ec83', '2026-05-10', '2026-05-10', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('263c180a-7cfb-4eab-9a31-cfe6f8fa3141', 11170, current_setting('importacao.cliente_id')::uuid, 19, 'b4269e60-eea2-4eba-a34d-db9591e0ec83', 'concluida', 'normal', 5430.0, 5430.0, 0.0, '2026-05-10', '2026-05-10', 'b4269e60-eea2-4eba-a34d-db9591e0ec83');
UPDATE aparelhos SET venda_id = '263c180a-7cfb-4eab-9a31-cfe6f8fa3141' WHERE id = '23298c9f-f923-4388-9195-47f2ff2e4721';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('d3c96518-0743-441c-9626-fa592b2a405b', '263c180a-7cfb-4eab-9a31-cfe6f8fa3141', 'pix', 5430.0, '2026-05-10', 'b4269e60-eea2-4eba-a34d-db9591e0ec83', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('a8a5dd0f-9158-409b-ac6a-1234c08ae560', 19, '263c180a-7cfb-4eab-9a31-cfe6f8fa3141', 'Brinde', 68.0, '2026-05-10', 'b4269e60-eea2-4eba-a34d-db9591e0ec83', '2026-05-10');

-- === VENDA 11171: POCO C85 256GB LILAS NOVO (12/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('2fb0e8dd-ec9d-4f5c-9e4a-6b5f697abbfb', 'Outros', 'POCO C85 256GB LILAS NOVO', '864280087011840', 1200.0, 850.0, 1, 'novo', 'perfeito', 'vendido', '2026-05-12', '2026-05-12', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-12', '2026-05-12', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('3f8c960e-e139-438c-bc4c-3475877699ce', 11171, current_setting('importacao.cliente_id')::uuid, 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 1200.0, 1200.0, 0.0, '2026-05-12', '2026-05-12', '85e3aa42-b9af-49b8-a72a-64e9c337aa53');
UPDATE aparelhos SET venda_id = '3f8c960e-e139-438c-bc4c-3475877699ce' WHERE id = '2fb0e8dd-ec9d-4f5c-9e4a-6b5f697abbfb';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('6446a012-43f0-4b32-bade-5de9908212c2', '3f8c960e-e139-438c-bc4c-3475877699ce', 'pix', 1200.0, '2026-05-12', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 1);

-- === VENDA 11172: REALME NOTE 60X 128GB PRETO NOVO (12/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('3bd19756-2830-4009-b5c3-efcbfab2829e', 'Realme', 'REALME NOTE 60X 128GB PRETO NOVO', '862505072816619', 720.0, 615.0, 19, 'novo', 'perfeito', 'vendido', '2026-05-12', '2026-05-12', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-12', '2026-05-12', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('4b5ae71a-8265-4787-bf33-c51bbefbbe2b', 11172, current_setting('importacao.cliente_id')::uuid, 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 720.0, 720.0, 0.0, '2026-05-12', '2026-05-12', '97f12885-87ad-426a-8bbb-656889d82e10');
UPDATE aparelhos SET venda_id = '4b5ae71a-8265-4787-bf33-c51bbefbbe2b' WHERE id = '3bd19756-2830-4009-b5c3-efcbfab2829e';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('aeddaa7c-437d-47f8-ba3c-78b167b102b9', '4b5ae71a-8265-4787-bf33-c51bbefbbe2b', 'cartao_credito', 720.0, '2026-05-12', '97f12885-87ad-426a-8bbb-656889d82e10', 1);

-- === VENDA 11173: IPHONE 17 PRO SILVER SEMINOVO (13/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('210d4eae-b038-4167-92a7-3efdc7465c83', 'Apple', 'IPHONE 17 PRO SILVER SEMINOVO', '355500351194584', 6900.0, 6350.0, 19, 'seminovo', 'bom', 'vendido', '2026-05-13', '2026-05-13', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-13', '2026-05-13', 'Pagto junto (Aparelho 1/2, total grupo R$ 8,850)');
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('f6d98d8b-ec6c-4122-82c0-527f933eef08', 11173, current_setting('importacao.cliente_id')::uuid, 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 6900.0, 6900.0, 0.0, '2026-05-13', '2026-05-13', '97f12885-87ad-426a-8bbb-656889d82e10');
UPDATE aparelhos SET venda_id = 'f6d98d8b-ec6c-4122-82c0-527f933eef08' WHERE id = '210d4eae-b038-4167-92a7-3efdc7465c83';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('a3000883-5c2b-4aac-ba7f-3094e04e52c8', 'f6d98d8b-ec6c-4122-82c0-527f933eef08', 'pix', 6900.0, '2026-05-13', '97f12885-87ad-426a-8bbb-656889d82e10', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('01dc763a-d996-4f49-b0db-52463c4fedbd', 19, 'f6d98d8b-ec6c-4122-82c0-527f933eef08', 'Brinde', 50.0, '2026-05-13', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-13');

-- === VENDA 11174: APPLE WATCH SE 3 STARLIGHT NOVO (13/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('d85ea683-d069-4731-b918-4c6e0f31976e', 'Apple', 'APPLE WATCH SE 3 STARLIGHT NOVO', 'D23PC63DYY', 1950.0, 1750.0, 19, 'novo', 'perfeito', 'vendido', '2026-05-13', '2026-05-13', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-13', '2026-05-13', 'Pagto junto (Aparelho 2/2, total grupo R$ 8,850)');
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('b694e22f-9b06-4af0-98fb-e46974b04b8c', 11174, current_setting('importacao.cliente_id')::uuid, 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 1950.0, 1950.0, 0.0, '2026-05-13', '2026-05-13', '97f12885-87ad-426a-8bbb-656889d82e10');
UPDATE aparelhos SET venda_id = 'b694e22f-9b06-4af0-98fb-e46974b04b8c' WHERE id = 'd85ea683-d069-4731-b918-4c6e0f31976e';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('c447642f-64e8-47fb-a80b-0cfa2441e2b4', 'b694e22f-9b06-4af0-98fb-e46974b04b8c', 'pix', 1950.0, '2026-05-13', '97f12885-87ad-426a-8bbb-656889d82e10', 1);

-- === VENDA 11175: POCO C85 256GB PRETO LACRADO (13/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('a5c8313a-7ae2-469f-b216-e1dce1c1040a', 'Outros', 'POCO C85 256GB PRETO LACRADO', '861260081088468', 1000.0, 870.0, 1, 'novo', 'perfeito', 'vendido', '2026-05-13', '2026-05-13', '9451cd9f-6770-4e32-aae8-c75fa675e818', '2026-05-13', '2026-05-13', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('a1f173b5-1ebc-4daa-b492-d4d12a61e3a6', 11175, current_setting('importacao.cliente_id')::uuid, 1, '9451cd9f-6770-4e32-aae8-c75fa675e818', 'concluida', 'normal', 1000.0, 1000.0, 0.0, '2026-05-13', '2026-05-13', '9451cd9f-6770-4e32-aae8-c75fa675e818');
UPDATE aparelhos SET venda_id = 'a1f173b5-1ebc-4daa-b492-d4d12a61e3a6' WHERE id = 'a5c8313a-7ae2-469f-b216-e1dce1c1040a';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('c678d4c2-4293-4ed6-971b-f672a822b667', 'a1f173b5-1ebc-4daa-b492-d4d12a61e3a6', 'pix', 1000.0, '2026-05-13', '9451cd9f-6770-4e32-aae8-c75fa675e818', 1);

-- === VENDA 11176: IPHONE 16 PRO MAX 256GB PRETO SEMINOVO (13/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('e58b617e-f4fc-4fa1-881c-5a713af8bedc', 'Apple', 'IPHONE 16 PRO MAX 256GB PRETO SEMINOVO', '357205984783526', 5270.0, 5000.0, 4, 'seminovo', 'bom', 'vendido', '2026-05-13', '2026-05-13', 'e07d4d35-1381-4d4d-914d-8382a7456fdd', '2026-05-13', '2026-05-13', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('3c5a1f1e-ebc1-4e8e-9a11-a8f902b9daf2', 11176, current_setting('importacao.cliente_id')::uuid, 4, 'e07d4d35-1381-4d4d-914d-8382a7456fdd', 'concluida', 'normal', 5270.0, 5270.0, 0.0, '2026-05-13', '2026-05-13', 'e07d4d35-1381-4d4d-914d-8382a7456fdd');
UPDATE aparelhos SET venda_id = '3c5a1f1e-ebc1-4e8e-9a11-a8f902b9daf2' WHERE id = 'e58b617e-f4fc-4fa1-881c-5a713af8bedc';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('480ff8cd-a664-4eb5-a385-a8eea41a86cc', '3c5a1f1e-ebc1-4e8e-9a11-a8f902b9daf2', 'pix', 5270.0, '2026-05-13', 'e07d4d35-1381-4d4d-914d-8382a7456fdd', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('89f2f7d3-dcb0-4d62-b3d7-83961b105be2', 4, '3c5a1f1e-ebc1-4e8e-9a11-a8f902b9daf2', 'Brinde', 25.0, '2026-05-13', 'e07d4d35-1381-4d4d-914d-8382a7456fdd', '2026-05-13');

-- === VENDA 11177: IPHONE 15 PRO SEMINOVO NATURAL 128GB (13/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('64e20d97-8b5c-4abe-a7f0-a4f4fe9ddb8a', 'Apple', 'IPHONE 15 PRO SEMINOVO NATURAL 128GB', '355262962390305', 3706.0, 3100.0, 4, 'seminovo', 'bom', 'vendido', '2026-05-13', '2026-05-13', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-13', '2026-05-13', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('33df6e0c-5b28-4b0a-95c8-a245914fb50d', 11177, current_setting('importacao.cliente_id')::uuid, 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 3706.0, 3706.0, 0.0, '2026-05-13', '2026-05-13', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
UPDATE aparelhos SET venda_id = '33df6e0c-5b28-4b0a-95c8-a245914fb50d' WHERE id = '64e20d97-8b5c-4abe-a7f0-a4f4fe9ddb8a';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('c71d5552-2455-42d5-b89c-799dcd94a010', '33df6e0c-5b28-4b0a-95c8-a245914fb50d', 'cartao_credito', 3706.0, '2026-05-13', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('69da3d14-54f9-4684-b699-40f11fe84742', 4, '33df6e0c-5b28-4b0a-95c8-a245914fb50d', 'Brinde', 25.0, '2026-05-13', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-13');

-- === VENDA 11178: IPHONE 14 128GB BRANCO SEMINOVO (13/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('44151dc1-070a-4307-ab40-e4ea9c83209d', 'Apple', 'IPHONE 14 128GB BRANCO SEMINOVO', '357950903092463', 2250.0, 2050.0, 20, 'seminovo', 'bom', 'vendido', '2026-05-13', '2026-05-13', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', '2026-05-13', '2026-05-13', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('7d54f57e-52b8-4c50-99ac-ba2bec41f915', 11178, current_setting('importacao.cliente_id')::uuid, 20, 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 'concluida', 'normal', 2250.0, 2250.0, 0.0, '2026-05-13', '2026-05-13', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4');
UPDATE aparelhos SET venda_id = '7d54f57e-52b8-4c50-99ac-ba2bec41f915' WHERE id = '44151dc1-070a-4307-ab40-e4ea9c83209d';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('ad10b8e7-0bed-48c5-a98a-515601f62642', '7d54f57e-52b8-4c50-99ac-ba2bec41f915', 'dinheiro', 2250.0, '2026-05-13', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('8db067a8-ded9-4f49-862d-928f59c5828c', 20, '7d54f57e-52b8-4c50-99ac-ba2bec41f915', 'Brinde', 5.0, '2026-05-13', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', '2026-05-13');

-- === VENDA 11179: IPHONE 14 128GB BRANCO SEMINOVO (13/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('c3a82e85-401d-490b-938a-d344768f2858', 'Apple', 'IPHONE 14 128GB BRANCO SEMINOVO', '354807372557538', 2409.0, 2050.0, 20, 'seminovo', 'bom', 'vendido', '2026-05-13', '2026-05-13', '25e2da5b-9e76-4388-9890-7e22efd6940d', '2026-05-13', '2026-05-13', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('e0b6622e-05d1-4336-85f6-7615c960b92c', 11179, current_setting('importacao.cliente_id')::uuid, 20, '25e2da5b-9e76-4388-9890-7e22efd6940d', 'concluida', 'normal', 2409.0, 2409.0, 0.0, '2026-05-13', '2026-05-13', '25e2da5b-9e76-4388-9890-7e22efd6940d');
UPDATE aparelhos SET venda_id = 'e0b6622e-05d1-4336-85f6-7615c960b92c' WHERE id = 'c3a82e85-401d-490b-938a-d344768f2858';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('6615cb11-1bba-4abc-afd9-2c503430b447', 'e0b6622e-05d1-4336-85f6-7615c960b92c', 'cartao_credito', 2409.0, '2026-05-13', '25e2da5b-9e76-4388-9890-7e22efd6940d', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('59cfb659-2fe2-4c54-a2d2-f6c50e187a9e', 20, 'e0b6622e-05d1-4336-85f6-7615c960b92c', 'Brinde', 45.0, '2026-05-13', '25e2da5b-9e76-4388-9890-7e22efd6940d', '2026-05-13');

-- === VENDA 11180: IPHONE 17 PRO MAX 512GB AZUL NOVO (13/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('dd4dfb96-2093-4ed9-b6f9-2adf8f880f40', 'Apple', 'IPHONE 17 PRO MAX 512GB AZUL NOVO', '357247250248784', 10242.0, 9050.0, 1, 'novo', 'perfeito', 'vendido', '2026-05-13', '2026-05-13', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-13', '2026-05-13', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('4a58f761-f76d-49b0-a2fb-3315a4ff8fdf', 11180, current_setting('importacao.cliente_id')::uuid, 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 10242.0, 10242.0, 0.0, '2026-05-13', '2026-05-13', '85e3aa42-b9af-49b8-a72a-64e9c337aa53');
UPDATE aparelhos SET venda_id = '4a58f761-f76d-49b0-a2fb-3315a4ff8fdf' WHERE id = 'dd4dfb96-2093-4ed9-b6f9-2adf8f880f40';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('1bf48a5a-faa4-473a-b045-e549ac03b7ce', '4a58f761-f76d-49b0-a2fb-3315a4ff8fdf', 'pix', 5242.0, '2026-05-13', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 1);
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, observacao, parcelas)
VALUES ('e0342946-e7cb-4171-a24e-15a81fef7d18', '4a58f761-f76d-49b0-a2fb-3315a4ff8fdf', 'troca_aparelho', 5000.0, '2026-05-13', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'Troca: IPH 16 PRO MAX 512GB PRETO', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('926df346-62cb-45da-9dbc-10dba18890d7', 1, '4a58f761-f76d-49b0-a2fb-3315a4ff8fdf', 'Brinde', 60.0, '2026-05-13', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-13');

-- === VENDA 11181: BOOMBOX 4 LARANJA NOVO (14/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('2319be16-b4da-4bde-9556-bd652ab1209e', 'Outros', 'BOOMBOX 4 LARANJA NOVO', 'TL1937-BQ0009616', 2500.0, 2390.0, 4, 'novo', 'perfeito', 'vendido', '2026-05-14', '2026-05-14', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-14', '2026-05-14', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('6e7e964a-ea9b-4620-9b19-19ba369e90be', 11181, current_setting('importacao.cliente_id')::uuid, 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 2500.0, 2500.0, 0.0, '2026-05-14', '2026-05-14', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
UPDATE aparelhos SET venda_id = '6e7e964a-ea9b-4620-9b19-19ba369e90be' WHERE id = '2319be16-b4da-4bde-9556-bd652ab1209e';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('87aff258-a759-4395-8c3a-bb1a7205fc2e', '6e7e964a-ea9b-4620-9b19-19ba369e90be', 'pix', 2500.0, '2026-05-14', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1);

-- === VENDA 11182: IPHONE 14 PRO MAX 256GB ROXO SEMINOVO (14/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('6f72b787-3fb1-405a-9d29-cc496fd99a13', 'Apple', 'IPHONE 14 PRO MAX 256GB ROXO SEMINOVO', '357173348275037', 3600.0, 3200.0, 4, 'seminovo', 'bom', 'vendido', '2026-05-14', '2026-05-14', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-14', '2026-05-14', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('7216cf72-afe1-451b-910a-996c2e5164fb', 11182, current_setting('importacao.cliente_id')::uuid, 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 3600.0, 3600.0, 0.0, '2026-05-14', '2026-05-14', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
UPDATE aparelhos SET venda_id = '7216cf72-afe1-451b-910a-996c2e5164fb' WHERE id = '6f72b787-3fb1-405a-9d29-cc496fd99a13';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('3f05185c-c0ef-44d5-9106-6cdffc189e4e', '7216cf72-afe1-451b-910a-996c2e5164fb', 'pix', 800.0, '2026-05-14', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1);
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('69f7d38f-c4df-407e-b489-294008ef3ed8', '7216cf72-afe1-451b-910a-996c2e5164fb', 'cartao_credito', 2800.0, '2026-05-14', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('af747c01-5bda-499b-8138-bf3a09ad701c', 4, '7216cf72-afe1-451b-910a-996c2e5164fb', 'Brinde', 25.0, '2026-05-14', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-14');

-- === VENDA 11183: NOTE 13 5G 256GB PRETO NOVO (14/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('ff0dab9e-eadc-49f2-95b0-52eb98084ed1', 'Redmi', 'NOTE 13 5G 256GB PRETO NOVO', '860698079480943', 1050.0, 950.0, 19, 'novo', 'perfeito', 'vendido', '2026-05-14', '2026-05-14', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-14', '2026-05-14', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('713c4e9c-bd74-4c2b-bc9e-7d452f8c8910', 11183, current_setting('importacao.cliente_id')::uuid, 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 1050.0, 1050.0, 0.0, '2026-05-14', '2026-05-14', '97f12885-87ad-426a-8bbb-656889d82e10');
UPDATE aparelhos SET venda_id = '713c4e9c-bd74-4c2b-bc9e-7d452f8c8910' WHERE id = 'ff0dab9e-eadc-49f2-95b0-52eb98084ed1';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('13ae3022-cb92-48ce-b42a-3e722445d6c9', '713c4e9c-bd74-4c2b-bc9e-7d452f8c8910', 'pix', 1050.0, '2026-05-14', '97f12885-87ad-426a-8bbb-656889d82e10', 1);

-- === VENDA 11184: TAB S6 LITE 128GB SEMINOVO PRETO (14/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('9ace616f-cb07-4ae9-a369-470ef9f32e4c', 'Outros', 'TAB S6 LITE 128GB SEMINOVO PRETO', '355835400444618', 1350.0, 900.0, 19, 'seminovo', 'bom', 'vendido', '2026-05-14', '2026-05-14', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-14', '2026-05-14', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('99f284e3-5957-4105-a144-27165c065835', 11184, current_setting('importacao.cliente_id')::uuid, 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 1350.0, 1350.0, 0.0, '2026-05-14', '2026-05-14', '97f12885-87ad-426a-8bbb-656889d82e10');
UPDATE aparelhos SET venda_id = '99f284e3-5957-4105-a144-27165c065835' WHERE id = '9ace616f-cb07-4ae9-a369-470ef9f32e4c';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('3d93b26f-2e5a-4f40-8606-a2a5da6480ea', '99f284e3-5957-4105-a144-27165c065835', 'pix', 200.0, '2026-05-14', '97f12885-87ad-426a-8bbb-656889d82e10', 1);
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('fbdd1854-fd6c-4236-aba4-d5cd34fe813e', '99f284e3-5957-4105-a144-27165c065835', 'cartao_credito', 1150.0, '2026-05-14', '97f12885-87ad-426a-8bbb-656889d82e10', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('995f579a-7b65-43dd-82c9-f45f7eda099c', 19, '99f284e3-5957-4105-a144-27165c065835', 'Brinde', 20.0, '2026-05-14', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-14');

-- === VENDA 11185: IPHONE 16 PRO MAX 256GB PRETO SEMINOVO (14/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('fdb9d3bd-aa21-4ef9-a174-631a92eaa853', 'Apple', 'IPHONE 16 PRO MAX 256GB PRETO SEMINOVO', '355706423711715', 5300.0, 5000.0, 20, 'seminovo', 'bom', 'vendido', '2026-05-14', '2026-05-14', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', '2026-05-14', '2026-05-14', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('3afc8672-015b-458b-ac20-0097df22d46f', 11185, current_setting('importacao.cliente_id')::uuid, 20, 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 'concluida', 'normal', 5300.0, 5300.0, 0.0, '2026-05-14', '2026-05-14', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4');
UPDATE aparelhos SET venda_id = '3afc8672-015b-458b-ac20-0097df22d46f' WHERE id = 'fdb9d3bd-aa21-4ef9-a174-631a92eaa853';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('42712336-a3aa-4eed-8e27-9cdeb65a7b58', '3afc8672-015b-458b-ac20-0097df22d46f', 'pix', 3800.0, '2026-05-14', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 1);
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, observacao, parcelas)
VALUES ('6afc0b0f-6b4b-4603-b8f2-5a35d626f24b', '3afc8672-015b-458b-ac20-0097df22d46f', 'troca_aparelho', 1500.0, '2026-05-14', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 'Troca: IPH 13 128GB BRANCO', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('9775eada-fef7-490b-aadd-ac18ae8f86a8', 20, '3afc8672-015b-458b-ac20-0097df22d46f', 'Brinde', 8.0, '2026-05-14', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', '2026-05-14');

-- === VENDA 11186: IPHONE 14 PRO 128GB PRETO SEMINOVO (14/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('97bfda36-7ef0-4335-974d-587b0a3cf03d', 'Apple', 'IPHONE 14 PRO 128GB PRETO SEMINOVO', '357442883839907', 2910.0, 2700.0, 20, 'seminovo', 'bom', 'vendido', '2026-05-14', '2026-05-14', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', '2026-05-14', '2026-05-14', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('f0115bc7-9c37-409f-9724-095cb02e753e', 11186, current_setting('importacao.cliente_id')::uuid, 20, 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 'concluida', 'normal', 2910.0, 2910.0, 0.0, '2026-05-14', '2026-05-14', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4');
UPDATE aparelhos SET venda_id = 'f0115bc7-9c37-409f-9724-095cb02e753e' WHERE id = '97bfda36-7ef0-4335-974d-587b0a3cf03d';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('4e14e5a2-51b6-4606-8092-179710ff8149', 'f0115bc7-9c37-409f-9724-095cb02e753e', 'pix', 2710.0, '2026-05-14', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 1);
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('2c9586ff-7bbc-4111-b2e3-2cb99ccab049', 'f0115bc7-9c37-409f-9724-095cb02e753e', 'dinheiro', 200.0, '2026-05-14', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('4637ac42-5f35-42f8-87e6-606e28f6a6b0', 20, 'f0115bc7-9c37-409f-9724-095cb02e753e', 'Brinde', 15.0, '2026-05-14', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', '2026-05-14');

-- === VENDA 11187: IPHONE 14 PRO MAX 128GB ROXO SEMINOVO (14/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('1c21d7d3-4c1a-4d42-87ae-99cad9efe7ac', 'Apple', 'IPHONE 14 PRO MAX 128GB ROXO SEMINOVO', '357397703170232', 3250.0, 3150.0, 1, 'seminovo', 'bom', 'vendido', '2026-05-14', '2026-05-14', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-14', '2026-05-14', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('07a94f62-87bc-4e26-bbf6-a85c51f9bca6', 11187, current_setting('importacao.cliente_id')::uuid, 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 3250.0, 3250.0, 0.0, '2026-05-14', '2026-05-14', '85e3aa42-b9af-49b8-a72a-64e9c337aa53');
UPDATE aparelhos SET venda_id = '07a94f62-87bc-4e26-bbf6-a85c51f9bca6' WHERE id = '1c21d7d3-4c1a-4d42-87ae-99cad9efe7ac';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('31c27703-8528-47c2-a075-85f01c00bf3f', '07a94f62-87bc-4e26-bbf6-a85c51f9bca6', 'pix', 3250.0, '2026-05-14', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 1);

-- === VENDA 11188: IPHONE 16 PLUS 128GB PRETO SEMINOVO (14/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('bdcf859b-769c-49d8-8d55-20895ffafde8', 'Apple', 'IPHONE 16 PLUS 128GB PRETO SEMINOVO', '352726622496929', 4225.0, 3750.0, 1, 'seminovo', 'bom', 'vendido', '2026-05-14', '2026-05-14', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-14', '2026-05-14', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('55700934-18f7-4647-980b-fdcf10fc4091', 11188, current_setting('importacao.cliente_id')::uuid, 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 4225.0, 4225.0, 0.0, '2026-05-14', '2026-05-14', '85e3aa42-b9af-49b8-a72a-64e9c337aa53');
UPDATE aparelhos SET venda_id = '55700934-18f7-4647-980b-fdcf10fc4091' WHERE id = 'bdcf859b-769c-49d8-8d55-20895ffafde8';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('6adacb6d-5eed-4d20-a8f9-b497ae5b94f5', '55700934-18f7-4647-980b-fdcf10fc4091', 'pix', 4225.0, '2026-05-14', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('4b3d25f3-fc7c-4eff-80ce-4ad10c47b9fc', 1, '55700934-18f7-4647-980b-fdcf10fc4091', 'Brinde', 25.0, '2026-05-14', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-14');

-- === VENDA 11189: IPHONE 17 PRO MAX 256GB AZUL NOVO (15/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('c1111759-2e74-472f-8403-4dd4d1906e76', 'Apple', 'IPHONE 17 PRO MAX 256GB AZUL NOVO', '351205741900807', 8650.0, 8050.0, 4, 'novo', 'perfeito', 'vendido', '2026-05-15', '2026-05-15', 'e07d4d35-1381-4d4d-914d-8382a7456fdd', '2026-05-15', '2026-05-15', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('4e46ff60-d6ea-4040-aaf5-0b7bbf203474', 11189, current_setting('importacao.cliente_id')::uuid, 4, 'e07d4d35-1381-4d4d-914d-8382a7456fdd', 'concluida', 'normal', 8650.0, 8650.0, 0.0, '2026-05-15', '2026-05-15', 'e07d4d35-1381-4d4d-914d-8382a7456fdd');
UPDATE aparelhos SET venda_id = '4e46ff60-d6ea-4040-aaf5-0b7bbf203474' WHERE id = 'c1111759-2e74-472f-8403-4dd4d1906e76';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('c0ce3029-1c21-4158-ac1c-997d4d99e290', '4e46ff60-d6ea-4040-aaf5-0b7bbf203474', 'pix', 8650.0, '2026-05-15', 'e07d4d35-1381-4d4d-914d-8382a7456fdd', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('94d13d94-369a-478a-a1f5-a77cade7a3d4', 4, '4e46ff60-d6ea-4040-aaf5-0b7bbf203474', 'Brinde', 155.0, '2026-05-15', 'e07d4d35-1381-4d4d-914d-8382a7456fdd', '2026-05-15');

-- === VENDA 11190: IPHONE 11 128GB PRETO SEMINOVO (15/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('6240e1ef-262e-4bb6-90a4-6c290a2cbea2', 'Apple', 'IPHONE 11 128GB PRETO SEMINOVO', '356460904622673', 899.99, 800.0, 4, 'seminovo', 'bom', 'vendido', '2026-05-15', '2026-05-15', 'e07d4d35-1381-4d4d-914d-8382a7456fdd', '2026-05-15', '2026-05-15', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('df34d86a-1d76-49ad-b71b-d47bdb1be738', 11190, current_setting('importacao.cliente_id')::uuid, 4, 'e07d4d35-1381-4d4d-914d-8382a7456fdd', 'concluida', 'normal', 899.99, 899.99, 0.0, '2026-05-15', '2026-05-15', 'e07d4d35-1381-4d4d-914d-8382a7456fdd');
UPDATE aparelhos SET venda_id = 'df34d86a-1d76-49ad-b71b-d47bdb1be738' WHERE id = '6240e1ef-262e-4bb6-90a4-6c290a2cbea2';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('a5bbf194-7989-4172-a7fd-f0acd3014197', 'df34d86a-1d76-49ad-b71b-d47bdb1be738', 'pix', 899.99, '2026-05-15', 'e07d4d35-1381-4d4d-914d-8382a7456fdd', 1);

-- === VENDA 11191: IPHONE 17 PRO LARANJA 256GB NOVO (15/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('fecbd57c-4622-40fe-929b-c0bc8b482ebe', 'Apple', 'IPHONE 17 PRO LARANJA 256GB NOVO', '354289632484698', 8500.0, 8250.0, 20, 'novo', 'perfeito', 'vendido', '2026-05-15', '2026-05-15', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', '2026-05-15', '2026-05-15', 'Pagto junto (Aparelho 1/4, total grupo R$ 30,500)');
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('86f65966-31ad-4b8d-9aed-83061519b4d4', 11191, current_setting('importacao.cliente_id')::uuid, 20, 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 'concluida', 'normal', 8500.0, 8500.0, 0.0, '2026-05-15', '2026-05-15', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4');
UPDATE aparelhos SET venda_id = '86f65966-31ad-4b8d-9aed-83061519b4d4' WHERE id = 'fecbd57c-4622-40fe-929b-c0bc8b482ebe';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('21a3c16c-89fb-4190-a23b-30b3fd764dda', '86f65966-31ad-4b8d-9aed-83061519b4d4', 'pix', 8500.0, '2026-05-15', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('4dc689ba-1b80-4130-8a90-34c6e49f9183', 20, '86f65966-31ad-4b8d-9aed-83061519b4d4', 'Brinde', 8.0, '2026-05-15', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', '2026-05-15');

-- === VENDA 11192: IPHONE 17 PRO 256GB LARANJA NOVO (15/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('2bb0e1f5-8c4f-47dc-b41c-7e7955a7dcca', 'Apple', 'IPHONE 17 PRO 256GB LARANJA NOVO', '352001998377479', 8500.0, 8250.0, 20, 'novo', 'perfeito', 'vendido', '2026-05-15', '2026-05-15', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', '2026-05-15', '2026-05-15', 'Pagto junto (Aparelho 2/4, total grupo R$ 30,500)');
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('85c240f5-1f3c-454d-a487-826926dca1d9', 11192, current_setting('importacao.cliente_id')::uuid, 20, 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 'concluida', 'normal', 8500.0, 8500.0, 0.0, '2026-05-15', '2026-05-15', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4');
UPDATE aparelhos SET venda_id = '85c240f5-1f3c-454d-a487-826926dca1d9' WHERE id = '2bb0e1f5-8c4f-47dc-b41c-7e7955a7dcca';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('0cd3652e-b563-4ed0-9dca-6f25fe1182f5', '85c240f5-1f3c-454d-a487-826926dca1d9', 'pix', 8500.0, '2026-05-15', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('91aa5000-5b92-4cda-bc3f-448921120266', 20, '85c240f5-1f3c-454d-a487-826926dca1d9', 'Brinde', 8.0, '2026-05-15', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', '2026-05-15');

-- === VENDA 11193: MACBOOK AIR M4 256GB SILVER NOVO (15/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('6e9924e7-f30f-4050-90c4-cc23c7ed0a38', 'Apple', 'MACBOOK AIR M4 256GB SILVER NOVO', 'L1FL9LNFH1', 6750.0, 6500.0, 20, 'novo', 'perfeito', 'vendido', '2026-05-15', '2026-05-15', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', '2026-05-15', '2026-05-15', 'Pagto junto (Aparelho 3/4, total grupo R$ 30,500)');
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('165d1ce1-3cb3-438c-a1a6-86b589303fa0', 11193, current_setting('importacao.cliente_id')::uuid, 20, 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 'concluida', 'normal', 6750.0, 6750.0, 0.0, '2026-05-15', '2026-05-15', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4');
UPDATE aparelhos SET venda_id = '165d1ce1-3cb3-438c-a1a6-86b589303fa0' WHERE id = '6e9924e7-f30f-4050-90c4-cc23c7ed0a38';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('53650864-069c-4d2c-9081-c5a07da69728', '165d1ce1-3cb3-438c-a1a6-86b589303fa0', 'pix', 6750.0, '2026-05-15', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 1);

-- === VENDA 11194: MACBOOK AIR M4 SILVER 256GB NOVO (15/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('c6d77353-b6a9-4536-825c-79cde944c270', 'Apple', 'MACBOOK AIR M4 SILVER 256GB NOVO', 'D9XGF2JP9X', 6750.0, 6500.0, 20, 'novo', 'perfeito', 'vendido', '2026-05-15', '2026-05-15', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', '2026-05-15', '2026-05-15', 'Pagto junto (Aparelho 4/4, total grupo R$ 30,500)');
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('4c209335-6a0a-4084-9651-96cb8b087259', 11194, current_setting('importacao.cliente_id')::uuid, 20, 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 'concluida', 'normal', 6750.0, 6750.0, 0.0, '2026-05-15', '2026-05-15', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4');
UPDATE aparelhos SET venda_id = '4c209335-6a0a-4084-9651-96cb8b087259' WHERE id = 'c6d77353-b6a9-4536-825c-79cde944c270';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('8e759c7a-dc00-40b3-a3fb-c5fd4afe8e88', '4c209335-6a0a-4084-9651-96cb8b087259', 'pix', 6750.0, '2026-05-15', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 1);

-- === VENDA 11195: IPHONE 17 PRO MAX 256GB LARANJA SEMINOVO (15/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('8c3d4cfe-4446-4fc9-b7bd-183c0675bd4c', 'Apple', 'IPHONE 17 PRO MAX 256GB LARANJA SEMINOVO', '359912580728338', 7700.0, 6900.0, 4, 'seminovo', 'bom', 'vendido', '2026-05-15', '2026-05-15', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-15', '2026-05-15', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('664266a2-ae09-4889-9eae-c8a8301022cc', 11195, current_setting('importacao.cliente_id')::uuid, 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 7700.0, 7700.0, 0.0, '2026-05-15', '2026-05-15', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
UPDATE aparelhos SET venda_id = '664266a2-ae09-4889-9eae-c8a8301022cc' WHERE id = '8c3d4cfe-4446-4fc9-b7bd-183c0675bd4c';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('605f42a4-e932-417b-b8fd-5e1373ba9db8', '664266a2-ae09-4889-9eae-c8a8301022cc', 'pix', 1000.0, '2026-05-15', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1);
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('05fd389c-3983-4bd9-b690-25c51223e586', '664266a2-ae09-4889-9eae-c8a8301022cc', 'cartao_credito', 1700.0, '2026-05-15', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1);
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, observacao, parcelas)
VALUES ('4904ee52-f9ba-4fc9-98f3-5d0fd8c6b57a', '664266a2-ae09-4889-9eae-c8a8301022cc', 'troca_aparelho', 5000.0, '2026-05-15', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'Troca: 16 PRO MAX SEMINOVO', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('1d26f3a4-f5cc-4e5c-856a-4f5bc58023c3', 4, '664266a2-ae09-4889-9eae-c8a8301022cc', 'Brinde', 5.0, '2026-05-15', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-15');

-- === VENDA 11196: IPAD 11° A16 128GB AZUL NOVO (15/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('ee12ca8d-2be7-4f24-943b-79fdcd6c5029', 'Apple', 'IPAD 11° A16 128GB AZUL NOVO', 'H64RQG50Y0', 2500.0, 2090.0, 4, 'novo', 'perfeito', 'vendido', '2026-05-15', '2026-05-15', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-15', '2026-05-15', 'Pagto junto (Aparelho 1/2, total grupo R$ 4,700)');
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('3cf1cfab-370e-4b76-b7fa-5c4bee1f593c', 11196, current_setting('importacao.cliente_id')::uuid, 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 2500.0, 2500.0, 0.0, '2026-05-15', '2026-05-15', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
UPDATE aparelhos SET venda_id = '3cf1cfab-370e-4b76-b7fa-5c4bee1f593c' WHERE id = 'ee12ca8d-2be7-4f24-943b-79fdcd6c5029';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('e2cf2959-a779-4485-ab53-7929c086073c', '3cf1cfab-370e-4b76-b7fa-5c4bee1f593c', 'pix', 2500.0, '2026-05-15', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('63146d65-a2b3-4fdf-b78d-1112d8610411', 4, '3cf1cfab-370e-4b76-b7fa-5c4bee1f593c', 'Brinde', 120.0, '2026-05-15', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-15');

-- === VENDA 11197: IPAD 11° A16 128GB AZUL NOVO (15/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('aa21a433-5ee3-496c-b4fd-1e8f277bc57f', 'Apple', 'IPAD 11° A16 128GB AZUL NOVO', 'G23024PVDT', 2200.0, 2090.0, 4, 'novo', 'perfeito', 'vendido', '2026-05-15', '2026-05-15', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-15', '2026-05-15', 'Pagto junto (Aparelho 2/2, total grupo R$ 4,700)');
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('65a43861-a046-4aa5-aee6-6af7237d8c75', 11197, current_setting('importacao.cliente_id')::uuid, 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 2200.0, 2200.0, 0.0, '2026-05-15', '2026-05-15', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
UPDATE aparelhos SET venda_id = '65a43861-a046-4aa5-aee6-6af7237d8c75' WHERE id = 'aa21a433-5ee3-496c-b4fd-1e8f277bc57f';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('117dcaed-19b1-4f29-8bea-d548f26f8256', '65a43861-a046-4aa5-aee6-6af7237d8c75', 'pix', 2200.0, '2026-05-15', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('72c6c6cc-1bc4-4186-8399-620b60387f03', 4, '65a43861-a046-4aa5-aee6-6af7237d8c75', 'Brinde', 10.0, '2026-05-15', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-15');

-- === VENDA 11198: IPHONE 15 128GB PRETO SEMINOVO (15/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('9131df58-50fa-47f3-abb0-5da8bdc91e7f', 'Apple', 'IPHONE 15 128GB PRETO SEMINOVO', '356054492870941', 2930.0, 2750.0, 4, 'seminovo', 'bom', 'vendido', '2026-05-15', '2026-05-15', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-15', '2026-05-15', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('d7ea7028-2e96-4212-8a8c-f880a123ab05', 11198, current_setting('importacao.cliente_id')::uuid, 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 2930.0, 2930.0, 0.0, '2026-05-15', '2026-05-15', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
UPDATE aparelhos SET venda_id = 'd7ea7028-2e96-4212-8a8c-f880a123ab05' WHERE id = '9131df58-50fa-47f3-abb0-5da8bdc91e7f';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('7d33e0ec-e051-4398-b3dc-90a91728a95a', 'd7ea7028-2e96-4212-8a8c-f880a123ab05', 'pix', 2930.0, '2026-05-15', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('259cb1b6-5946-4e72-ac38-adbf353ff92a', 4, 'd7ea7028-2e96-4212-8a8c-f880a123ab05', 'Brinde', 5.0, '2026-05-15', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-15');

-- === VENDA 11199: IPHONE 15 PRO MAX 256GB NATURAL SEMINOVO (15/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('02be1f9d-0c7d-42b3-a372-df3dc2d7f8ea', 'Apple', 'IPHONE 15 PRO MAX 256GB NATURAL SEMINOVO', '350278024027409', 4100.0, 4000.0, 19, 'seminovo', 'bom', 'vendido', '2026-05-15', '2026-05-15', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-15', '2026-05-15', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('c7eb9b6f-8b23-4359-b932-4c6518658dec', 11199, current_setting('importacao.cliente_id')::uuid, 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 4100.0, 4100.0, 0.0, '2026-05-15', '2026-05-15', '97f12885-87ad-426a-8bbb-656889d82e10');
UPDATE aparelhos SET venda_id = 'c7eb9b6f-8b23-4359-b932-4c6518658dec' WHERE id = '02be1f9d-0c7d-42b3-a372-df3dc2d7f8ea';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('c277aa0f-9d9f-47f4-bdfc-cbb47438a189', 'c7eb9b6f-8b23-4359-b932-4c6518658dec', 'pix', 4100.0, '2026-05-15', '97f12885-87ad-426a-8bbb-656889d82e10', 1);

-- === VENDA 11200: POCO X7 PRO 256GB PRETO NOVO (15/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('7c845c53-d67d-4d33-887e-7f4e536879c3', 'Outros', 'POCO X7 PRO 256GB PRETO NOVO', '869471081130380', 2075.0, 1750.0, 1, 'novo', 'perfeito', 'vendido', '2026-05-15', '2026-05-15', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-15', '2026-05-15', 'Pagto junto (Aparelho 1/2, total grupo R$ 4,150)');
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('39d6d80e-fd7f-4ae9-9196-e912e8da6d0e', 11200, current_setting('importacao.cliente_id')::uuid, 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 2075.0, 2075.0, 0.0, '2026-05-15', '2026-05-15', '85e3aa42-b9af-49b8-a72a-64e9c337aa53');
UPDATE aparelhos SET venda_id = '39d6d80e-fd7f-4ae9-9196-e912e8da6d0e' WHERE id = '7c845c53-d67d-4d33-887e-7f4e536879c3';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('d440828d-470a-4468-8b5f-762d9ee778cf', '39d6d80e-fd7f-4ae9-9196-e912e8da6d0e', 'pix', 2075.0, '2026-05-15', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 1);

-- === VENDA 11201: POCO X7 PRO 256GB PRETO NOVO (15/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('2bc536ae-1b6f-43ae-b832-bdc1421a9a31', 'Outros', 'POCO X7 PRO 256GB PRETO NOVO', '869471081096821', 2075.0, 1750.0, 1, 'novo', 'perfeito', 'vendido', '2026-05-15', '2026-05-15', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-15', '2026-05-15', 'Pagto junto (Aparelho 2/2, total grupo R$ 4,150)');
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('17be5388-76ad-47f9-a725-e50390c562f5', 11201, current_setting('importacao.cliente_id')::uuid, 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 2075.0, 2075.0, 0.0, '2026-05-15', '2026-05-15', '85e3aa42-b9af-49b8-a72a-64e9c337aa53');
UPDATE aparelhos SET venda_id = '17be5388-76ad-47f9-a725-e50390c562f5' WHERE id = '2bc536ae-1b6f-43ae-b832-bdc1421a9a31';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('98d3be31-65b9-4e10-a370-007bf499a8e3', '17be5388-76ad-47f9-a725-e50390c562f5', 'pix', 2075.0, '2026-05-15', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 1);

-- === VENDA 11202: IPHONE 13 PRO MAX 128GB AZUL SEMINOVO (15/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('ed0d1fc1-c1b8-4504-a012-1c3cdc0066d2', 'Apple', 'IPHONE 13 PRO MAX 128GB AZUL SEMINOVO', '359481988717053', 3070.0, 2600.0, 4, 'seminovo', 'bom', 'vendido', '2026-05-15', '2026-05-15', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-15', '2026-05-15', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('f1dee0a4-3075-4afb-8a2d-fdbb4c156549', 11202, current_setting('importacao.cliente_id')::uuid, 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 3070.0, 3070.0, 0.0, '2026-05-15', '2026-05-15', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
UPDATE aparelhos SET venda_id = 'f1dee0a4-3075-4afb-8a2d-fdbb4c156549' WHERE id = 'ed0d1fc1-c1b8-4504-a012-1c3cdc0066d2';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('3724458a-4f88-4546-87aa-89dd8b4aa392', 'f1dee0a4-3075-4afb-8a2d-fdbb4c156549', 'pix', 790.0, '2026-05-15', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1);
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('bcdefe42-f2d4-484a-8af2-c8dd9b9f382a', 'f1dee0a4-3075-4afb-8a2d-fdbb4c156549', 'cartao_credito', 2280.0, '2026-05-15', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('d96ff4ad-d22b-4778-86cf-b85697b92d6d', 4, 'f1dee0a4-3075-4afb-8a2d-fdbb4c156549', 'Brinde', 115.0, '2026-05-15', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-15');

-- === VENDA 11203: IPHONE 13 128GB PRETO SEMINOVO (16/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('c51a185c-c088-479e-bdf9-60e7561f3ad0', 'Apple', 'IPHONE 13 128GB PRETO SEMINOVO', '352094671123856', 2000.0, 1800.0, 4, 'seminovo', 'bom', 'vendido', '2026-05-16', '2026-05-16', 'e07d4d35-1381-4d4d-914d-8382a7456fdd', '2026-05-16', '2026-05-16', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('ddc80371-63a7-41fb-8a2f-cc642e68ca8a', 11203, current_setting('importacao.cliente_id')::uuid, 4, 'e07d4d35-1381-4d4d-914d-8382a7456fdd', 'concluida', 'normal', 2000.0, 2000.0, 0.0, '2026-05-16', '2026-05-16', 'e07d4d35-1381-4d4d-914d-8382a7456fdd');
UPDATE aparelhos SET venda_id = 'ddc80371-63a7-41fb-8a2f-cc642e68ca8a' WHERE id = 'c51a185c-c088-479e-bdf9-60e7561f3ad0';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('3f4a79fc-37d5-4ffe-9ffa-e62b99dd235d', 'ddc80371-63a7-41fb-8a2f-cc642e68ca8a', 'pix', 800.0, '2026-05-16', 'e07d4d35-1381-4d4d-914d-8382a7456fdd', 1);
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('6eb62cdc-7459-4777-a737-7cd8692ab05f', 'ddc80371-63a7-41fb-8a2f-cc642e68ca8a', 'cartao_credito', 1200.0, '2026-05-16', 'e07d4d35-1381-4d4d-914d-8382a7456fdd', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('b2d99f43-db1f-45bd-beb4-c561b3d713bd', 4, 'ddc80371-63a7-41fb-8a2f-cc642e68ca8a', 'Brinde', 25.0, '2026-05-16', 'e07d4d35-1381-4d4d-914d-8382a7456fdd', '2026-05-16');

-- === VENDA 11204: IPHONE 17 PRO MAX 256GB LARANJA NOVO (16/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('711dae1d-6236-45c6-b1f5-885c9b76fa56', 'Apple', 'IPHONE 17 PRO MAX 256GB LARANJA NOVO', '355224258492153', 8300.0, 8170.0, 4, 'novo', 'perfeito', 'vendido', '2026-05-16', '2026-05-16', 'e07d4d35-1381-4d4d-914d-8382a7456fdd', '2026-05-16', '2026-05-16', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('0da67e21-bde5-473e-b3fa-a74e56c6dd3c', 11204, current_setting('importacao.cliente_id')::uuid, 4, 'e07d4d35-1381-4d4d-914d-8382a7456fdd', 'concluida', 'normal', 8300.0, 8300.0, 0.0, '2026-05-16', '2026-05-16', 'e07d4d35-1381-4d4d-914d-8382a7456fdd');
UPDATE aparelhos SET venda_id = '0da67e21-bde5-473e-b3fa-a74e56c6dd3c' WHERE id = '711dae1d-6236-45c6-b1f5-885c9b76fa56';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('6638b0bc-2b87-4440-a461-d87c7b2f99e3', '0da67e21-bde5-473e-b3fa-a74e56c6dd3c', 'pix', 50.0, '2026-05-16', 'e07d4d35-1381-4d4d-914d-8382a7456fdd', 1);
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('bfaec3d0-2d69-4b7e-a0ad-99fe1a1120d3', '0da67e21-bde5-473e-b3fa-a74e56c6dd3c', 'cartao_credito', 8250.0, '2026-05-16', 'e07d4d35-1381-4d4d-914d-8382a7456fdd', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('4ae3bf0a-5624-476f-8baa-7a063e19fc7f', 4, '0da67e21-bde5-473e-b3fa-a74e56c6dd3c', 'Brinde', 15.0, '2026-05-16', 'e07d4d35-1381-4d4d-914d-8382a7456fdd', '2026-05-16');

-- === VENDA 11205: IPHONE 17 PRO 256GB SILVER NOVO (16/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('4f987c57-0dc0-4f43-8cf2-1528845324ec', 'Apple', 'IPHONE 17 PRO 256GB SILVER NOVO', '352001996607349', 7650.0, 7450.0, 19, 'novo', 'perfeito', 'vendido', '2026-05-16', '2026-05-16', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-16', '2026-05-16', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('f9339915-2d61-4a48-862e-93c5d1e8e098', 11205, current_setting('importacao.cliente_id')::uuid, 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 7650.0, 7650.0, 0.0, '2026-05-16', '2026-05-16', '97f12885-87ad-426a-8bbb-656889d82e10');
UPDATE aparelhos SET venda_id = 'f9339915-2d61-4a48-862e-93c5d1e8e098' WHERE id = '4f987c57-0dc0-4f43-8cf2-1528845324ec';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('641c6b52-fadd-4fe4-a4a5-05ea40032a4d', 'f9339915-2d61-4a48-862e-93c5d1e8e098', 'pix', 7650.0, '2026-05-16', '97f12885-87ad-426a-8bbb-656889d82e10', 1);

-- === VENDA 11206: IPHONE 15 PRO 256GB PRETO SEMINOVO (16/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('78fe3a75-6392-470f-ae79-0c103f614783', 'Apple', 'IPHONE 15 PRO 256GB PRETO SEMINOVO', '359370793687157', 3721.0, 3400.0, 19, 'seminovo', 'bom', 'vendido', '2026-05-16', '2026-05-16', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-16', '2026-05-16', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('97ce4dc5-080a-461c-86bd-2d49713248b3', 11206, current_setting('importacao.cliente_id')::uuid, 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 3721.0, 3721.0, 0.0, '2026-05-16', '2026-05-16', '97f12885-87ad-426a-8bbb-656889d82e10');
UPDATE aparelhos SET venda_id = '97ce4dc5-080a-461c-86bd-2d49713248b3' WHERE id = '78fe3a75-6392-470f-ae79-0c103f614783';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('2b2e005e-9e4e-4b47-896b-29696b2f0966', '97ce4dc5-080a-461c-86bd-2d49713248b3', 'pix', 3721.0, '2026-05-16', '97f12885-87ad-426a-8bbb-656889d82e10', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('44057a00-85ae-4d31-8cfe-6095d3950cf6', 19, '97ce4dc5-080a-461c-86bd-2d49713248b3', 'Brinde', 20.0, '2026-05-16', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-16');

-- === VENDA 11207: IPHONE 14 PRO MAX 128GB GOLD SEMINOVO (16/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('9de2c544-24f2-46bd-bf7f-63c66824c0a1', 'Apple', 'IPHONE 14 PRO MAX 128GB GOLD SEMINOVO', '360236730466835', 3350.0, 3150.0, 19, 'seminovo', 'bom', 'vendido', '2026-05-16', '2026-05-16', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-16', '2026-05-16', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('559119f8-def3-45b0-9de7-5d06ef55bb57', 11207, current_setting('importacao.cliente_id')::uuid, 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 3350.0, 3350.0, 0.0, '2026-05-16', '2026-05-16', '97f12885-87ad-426a-8bbb-656889d82e10');
UPDATE aparelhos SET venda_id = '559119f8-def3-45b0-9de7-5d06ef55bb57' WHERE id = '9de2c544-24f2-46bd-bf7f-63c66824c0a1';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('ce86d19d-c23f-47e3-965a-c05009472bcb', '559119f8-def3-45b0-9de7-5d06ef55bb57', 'pix', 1250.0, '2026-05-16', '97f12885-87ad-426a-8bbb-656889d82e10', 1);
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, observacao, parcelas)
VALUES ('37a1279c-2f4c-4efa-8209-c7569c52dfb1', '559119f8-def3-45b0-9de7-5d06ef55bb57', 'troca_aparelho', 2100.0, '2026-05-16', '97f12885-87ad-426a-8bbb-656889d82e10', 'Troca: IPH 13 PRO', 1);

-- === VENDA 11208: IPHONE 16 PRO MAX 512GB DESERT SEMINOVO (16/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('631d0b5a-ce99-4a3c-b584-a1e923a4db7b', 'Apple', 'IPHONE 16 PRO MAX 512GB DESERT SEMINOVO', '357626319666955', 5700.0, 5700.0, 20, 'seminovo', 'bom', 'vendido', '2026-05-16', '2026-05-16', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', '2026-05-16', '2026-05-16', 'Pagto junto (Aparelho 1/2, total grupo R$ 7,600)');
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('6192c275-cbd2-4158-94e0-2a89e66b9d01', 11208, current_setting('importacao.cliente_id')::uuid, 20, 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 'concluida', 'normal', 5700.0, 5700.0, 0.0, '2026-05-16', '2026-05-16', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4');
UPDATE aparelhos SET venda_id = '6192c275-cbd2-4158-94e0-2a89e66b9d01' WHERE id = '631d0b5a-ce99-4a3c-b584-a1e923a4db7b';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('970d658c-3b44-4ae0-9ccb-32b8c6ffd183', '6192c275-cbd2-4158-94e0-2a89e66b9d01', 'pix', 5700.0, '2026-05-16', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 1);

-- === VENDA 11209: IPHONE 12 PRO 256GB PRETO SEMINOVO (16/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('f2ce8f4c-67ca-462f-a6c8-8d791b0bde0c', 'Apple', 'IPHONE 12 PRO 256GB PRETO SEMINOVO', '356682116877353', 1900.0, 1900.0, 20, 'seminovo', 'bom', 'vendido', '2026-05-16', '2026-05-16', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', '2026-05-16', '2026-05-16', 'Pagto junto (Aparelho 2/2, total grupo R$ 7,600)');
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('4108fbaa-ba62-43c1-beff-f97ef9e890b2', 11209, current_setting('importacao.cliente_id')::uuid, 20, 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 'concluida', 'normal', 1900.0, 1900.0, 0.0, '2026-05-16', '2026-05-16', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4');
UPDATE aparelhos SET venda_id = '4108fbaa-ba62-43c1-beff-f97ef9e890b2' WHERE id = 'f2ce8f4c-67ca-462f-a6c8-8d791b0bde0c';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('8a642965-5d55-4657-9077-723a725b32a3', '4108fbaa-ba62-43c1-beff-f97ef9e890b2', 'pix', 1900.0, '2026-05-16', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 1);

-- === VENDA 11210: APPLE WATCH SE GEN 2 44MM MIDNIGHT NOVO (16/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('668587b3-bca5-4bbd-af8b-3647d2c6a07e', 'Apple', 'APPLE WATCH SE GEN 2 44MM MIDNIGHT NOVO', 'J4JVW5XVJV', 2050.0, 1800.0, 20, 'novo', 'perfeito', 'vendido', '2026-05-16', '2026-05-16', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', '2026-05-16', '2026-05-16', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('2e234546-9967-4511-8717-73aa50472d1c', 11210, current_setting('importacao.cliente_id')::uuid, 20, 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 'concluida', 'normal', 2050.0, 2050.0, 0.0, '2026-05-16', '2026-05-16', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4');
UPDATE aparelhos SET venda_id = '2e234546-9967-4511-8717-73aa50472d1c' WHERE id = '668587b3-bca5-4bbd-af8b-3647d2c6a07e';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('426b368d-44fc-4253-a30c-a66a045cdb98', '2e234546-9967-4511-8717-73aa50472d1c', 'pix', 2050.0, '2026-05-16', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 1);

-- === VENDA 11211: IPHONE 11 PRO MAX 256GB VERDE SEMINOVO (16/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('4acec959-8c30-45d9-978f-21fd8fb5adb1', 'Apple', 'IPHONE 11 PRO MAX 256GB VERDE SEMINOVO', '353906102560167', 1250.0, 900.0, 20, 'seminovo', 'bom', 'vendido', '2026-05-16', '2026-05-16', '25e2da5b-9e76-4388-9890-7e22efd6940d', '2026-05-16', '2026-05-16', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('46797093-5097-4715-afdd-4975e7c69081', 11211, current_setting('importacao.cliente_id')::uuid, 20, '25e2da5b-9e76-4388-9890-7e22efd6940d', 'concluida', 'normal', 1250.0, 1250.0, 0.0, '2026-05-16', '2026-05-16', '25e2da5b-9e76-4388-9890-7e22efd6940d');
UPDATE aparelhos SET venda_id = '46797093-5097-4715-afdd-4975e7c69081' WHERE id = '4acec959-8c30-45d9-978f-21fd8fb5adb1';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('cc4ea887-3e2b-48c2-a4ba-a9327f3f457e', '46797093-5097-4715-afdd-4975e7c69081', 'pix', 1250.0, '2026-05-16', '25e2da5b-9e76-4388-9890-7e22efd6940d', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('3089505c-00ac-4f9b-aa97-71355bd0bed7', 20, '46797093-5097-4715-afdd-4975e7c69081', 'Brinde', 25.0, '2026-05-16', '25e2da5b-9e76-4388-9890-7e22efd6940d', '2026-05-16');

-- === VENDA 11212: IPHONE 16 128GB VERDE SEMINOVO (16/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('5383a7f9-18b0-4d80-90ec-6b4c539baf2a', 'Apple', 'IPHONE 16 128GB VERDE SEMINOVO', '357884596142865', 3750.0, 3450.0, 20, 'seminovo', 'bom', 'vendido', '2026-05-16', '2026-05-16', '25e2da5b-9e76-4388-9890-7e22efd6940d', '2026-05-16', '2026-05-16', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('9f7e2c29-fccb-410a-9a5c-bb08ee8eb6c2', 11212, current_setting('importacao.cliente_id')::uuid, 20, '25e2da5b-9e76-4388-9890-7e22efd6940d', 'concluida', 'normal', 3750.0, 3750.0, 0.0, '2026-05-16', '2026-05-16', '25e2da5b-9e76-4388-9890-7e22efd6940d');
UPDATE aparelhos SET venda_id = '9f7e2c29-fccb-410a-9a5c-bb08ee8eb6c2' WHERE id = '5383a7f9-18b0-4d80-90ec-6b4c539baf2a';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('82a04d72-fc87-4a12-bd25-25f44e2c5a7f', '9f7e2c29-fccb-410a-9a5c-bb08ee8eb6c2', 'pix', 2000.0, '2026-05-16', '25e2da5b-9e76-4388-9890-7e22efd6940d', 1);
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('68693e54-b704-471d-bd8b-a97ca9207f65', '9f7e2c29-fccb-410a-9a5c-bb08ee8eb6c2', 'cartao_credito', 1750.0, '2026-05-16', '25e2da5b-9e76-4388-9890-7e22efd6940d', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('f9f6e437-6312-4d77-8dcf-d7602e060f82', 20, '9f7e2c29-fccb-410a-9a5c-bb08ee8eb6c2', 'Brinde', 25.0, '2026-05-16', '25e2da5b-9e76-4388-9890-7e22efd6940d', '2026-05-16');

-- === VENDA 11213: IPHONE 15 128GB AZUL SEMINOVO (16/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('6e4ec724-8044-4149-b905-164ddb2dd798', 'Apple', 'IPHONE 15 128GB AZUL SEMINOVO', '350169642018823', 3000.0, 2750.0, 1, 'seminovo', 'bom', 'vendido', '2026-05-16', '2026-05-16', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-16', '2026-05-16', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('b0629472-e11e-4681-985e-04f40dd02fb5', 11213, current_setting('importacao.cliente_id')::uuid, 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 3000.0, 3000.0, 0.0, '2026-05-16', '2026-05-16', '85e3aa42-b9af-49b8-a72a-64e9c337aa53');
UPDATE aparelhos SET venda_id = 'b0629472-e11e-4681-985e-04f40dd02fb5' WHERE id = '6e4ec724-8044-4149-b905-164ddb2dd798';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('6ad2827b-4b93-4c70-9168-9ee1a62001f2', 'b0629472-e11e-4681-985e-04f40dd02fb5', 'pix', 3000.0, '2026-05-16', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('45003da0-f1ca-42cb-b328-04d3d849c484', 1, 'b0629472-e11e-4681-985e-04f40dd02fb5', 'Brinde', 25.0, '2026-05-16', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-16');

-- === VENDA 11214: IPHONE 17 256GB PRETO LACRADO (16/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('412ed6db-192f-456f-9b4b-8034fee52fa8', 'Apple', 'IPHONE 17 256GB PRETO LACRADO', '358748638760753', 5180.0, 4800.0, 1, 'novo', 'perfeito', 'vendido', '2026-05-16', '2026-05-16', '9451cd9f-6770-4e32-aae8-c75fa675e818', '2026-05-16', '2026-05-16', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('e42ec046-2ed7-4489-bc5f-e15f11e67a21', 11214, current_setting('importacao.cliente_id')::uuid, 1, '9451cd9f-6770-4e32-aae8-c75fa675e818', 'concluida', 'normal', 5180.0, 5180.0, 0.0, '2026-05-16', '2026-05-16', '9451cd9f-6770-4e32-aae8-c75fa675e818');
UPDATE aparelhos SET venda_id = 'e42ec046-2ed7-4489-bc5f-e15f11e67a21' WHERE id = '412ed6db-192f-456f-9b4b-8034fee52fa8';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('4e150bbd-e8b1-43d8-9472-709f4f9fc7fa', 'e42ec046-2ed7-4489-bc5f-e15f11e67a21', 'pix', 3580.0, '2026-05-16', '9451cd9f-6770-4e32-aae8-c75fa675e818', 1);
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, observacao, parcelas)
VALUES ('36b6892e-2d42-4dfd-8ae7-4f68d8c360d9', 'e42ec046-2ed7-4489-bc5f-e15f11e67a21', 'troca_aparelho', 1600.0, '2026-05-16', '9451cd9f-6770-4e32-aae8-c75fa675e818', 'Troca: IPHONE 13 128GB PRETO', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('a0182e66-afcc-4022-aaf8-f3f23e1a5c96', 1, 'e42ec046-2ed7-4489-bc5f-e15f11e67a21', 'Brinde', 30.0, '2026-05-16', '9451cd9f-6770-4e32-aae8-c75fa675e818', '2026-05-16');

-- === VENDA 11215: IPHONE 17 256GB VERDE NOVO (17/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('411d7079-3413-4a9c-b725-32ec988b159f', 'Apple', 'IPHONE 17 256GB VERDE NOVO', '358619228350786', 4950.0, 4800.0, 19, 'novo', 'perfeito', 'vendido', '2026-05-17', '2026-05-17', 'b4269e60-eea2-4eba-a34d-db9591e0ec83', '2026-05-17', '2026-05-17', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('09a12cfb-0cce-41d1-87e3-05498835e882', 11215, current_setting('importacao.cliente_id')::uuid, 19, 'b4269e60-eea2-4eba-a34d-db9591e0ec83', 'concluida', 'normal', 4950.0, 4950.0, 0.0, '2026-05-17', '2026-05-17', 'b4269e60-eea2-4eba-a34d-db9591e0ec83');
UPDATE aparelhos SET venda_id = '09a12cfb-0cce-41d1-87e3-05498835e882' WHERE id = '411d7079-3413-4a9c-b725-32ec988b159f';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('0f882c96-0021-4570-801d-5a16af1162ce', '09a12cfb-0cce-41d1-87e3-05498835e882', 'pix', 4950.0, '2026-05-17', 'b4269e60-eea2-4eba-a34d-db9591e0ec83', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('f9b3a7a5-99de-4623-bbff-2b11eeef9a29', 19, '09a12cfb-0cce-41d1-87e3-05498835e882', 'Brinde', 30.0, '2026-05-17', 'b4269e60-eea2-4eba-a34d-db9591e0ec83', '2026-05-17');

-- === VENDA 11216: IPAD 11° A16 128GB SILVER NOVO (17/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('75612284-2600-41d3-bc02-2fc423fca1c6', 'Apple', 'IPAD 11° A16 128GB SILVER NOVO', 'LC7KGJGWKT', 2300.0, 2160.0, 4, 'novo', 'perfeito', 'vendido', '2026-05-17', '2026-05-17', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-17', '2026-05-17', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('d77417f6-b2d4-434c-9d86-bd3b0ff3086e', 11216, current_setting('importacao.cliente_id')::uuid, 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 2300.0, 2300.0, 0.0, '2026-05-17', '2026-05-17', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
UPDATE aparelhos SET venda_id = 'd77417f6-b2d4-434c-9d86-bd3b0ff3086e' WHERE id = '75612284-2600-41d3-bc02-2fc423fca1c6';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('52ca7786-df8b-4855-8e32-6948a023dff5', 'd77417f6-b2d4-434c-9d86-bd3b0ff3086e', 'pix', 2300.0, '2026-05-17', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('df96a955-d114-436c-ad66-f8440ccf5e0a', 4, 'd77417f6-b2d4-434c-9d86-bd3b0ff3086e', 'Brinde', 5.0, '2026-05-17', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-17');

-- === VENDA 11217: IPHONE 17 256GB BRANCO NOVO (17/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('757bfa53-b9de-43f4-8f20-b08116c9e884', 'Apple', 'IPHONE 17 256GB BRANCO NOVO', '358736463822764', 5240.0, 302.0, 4, 'novo', 'perfeito', 'vendido', '2026-05-17', '2026-05-17', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-17', '2026-05-17', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('24aef51f-73e7-4a98-9da8-6b58c22225b8', 11217, current_setting('importacao.cliente_id')::uuid, 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 5240.0, 5240.0, 0.0, '2026-05-17', '2026-05-17', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
UPDATE aparelhos SET venda_id = '24aef51f-73e7-4a98-9da8-6b58c22225b8' WHERE id = '757bfa53-b9de-43f4-8f20-b08116c9e884';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('ae11d7c3-e47f-4c79-afa4-16744bc00d08', '24aef51f-73e7-4a98-9da8-6b58c22225b8', 'pix', 5240.0, '2026-05-17', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('b9839f80-5472-49be-9662-cc604ea2d461', 4, '24aef51f-73e7-4a98-9da8-6b58c22225b8', 'Brinde', 188.0, '2026-05-17', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-17');

-- === VENDA 11218: IPHONE 13 PRO MAX VERDE 256GB SEMINOVO (17/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('51385d04-ac10-48e9-a0d8-ce0723089a35', 'Apple', 'IPHONE 13 PRO MAX VERDE 256GB SEMINOVO', '350249441757480', 3250.0, 2900.0, 19, 'seminovo', 'bom', 'vendido', '2026-05-17', '2026-05-17', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-17', '2026-05-17', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('6dfd667a-0568-4ea8-807a-6b258ed8af4d', 11218, current_setting('importacao.cliente_id')::uuid, 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 3250.0, 3250.0, 0.0, '2026-05-17', '2026-05-17', '97f12885-87ad-426a-8bbb-656889d82e10');
UPDATE aparelhos SET venda_id = '6dfd667a-0568-4ea8-807a-6b258ed8af4d' WHERE id = '51385d04-ac10-48e9-a0d8-ce0723089a35';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('5d6b63b9-67a9-4da8-b336-d09f1f104c1f', '6dfd667a-0568-4ea8-807a-6b258ed8af4d', 'pix', 3250.0, '2026-05-17', '97f12885-87ad-426a-8bbb-656889d82e10', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('0c4ac26a-4a35-4cb9-ae20-0905324511f2', 19, '6dfd667a-0568-4ea8-807a-6b258ed8af4d', 'Brinde', 50.0, '2026-05-17', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-17');

-- === VENDA 11219: IPHONE 17 PRO 256GB SILVER NOVO (17/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('bae7897f-3296-4880-be58-9d2b12061438', 'Apple', 'IPHONE 17 PRO 256GB SILVER NOVO', '354289638327115', 8000.0, 7450.0, 20, 'novo', 'perfeito', 'vendido', '2026-05-17', '2026-05-17', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', '2026-05-17', '2026-05-17', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('e04e691a-dd4f-4432-a89d-a45c968f8099', 11219, current_setting('importacao.cliente_id')::uuid, 20, 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 'concluida', 'normal', 8000.0, 8000.0, 0.0, '2026-05-17', '2026-05-17', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4');
UPDATE aparelhos SET venda_id = 'e04e691a-dd4f-4432-a89d-a45c968f8099' WHERE id = 'bae7897f-3296-4880-be58-9d2b12061438';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('83a7cae1-e1f9-44d7-936d-62085592c3ec', 'e04e691a-dd4f-4432-a89d-a45c968f8099', 'cartao_credito', 8000.0, '2026-05-17', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 1);

-- === VENDA 11220: POCO X7 PRO 512GB VERDE NOVO (17/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('578ef941-01b3-4892-ab72-64e1b05e1ea9', 'Outros', 'POCO X7 PRO 512GB VERDE NOVO', '868311089900940', 2150.0, 1990.0, 19, 'novo', 'perfeito', 'vendido', '2026-05-17', '2026-05-17', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-17', '2026-05-17', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('9bb48597-5221-4e63-9419-451a055c746b', 11220, current_setting('importacao.cliente_id')::uuid, 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 2150.0, 2150.0, 0.0, '2026-05-17', '2026-05-17', '97f12885-87ad-426a-8bbb-656889d82e10');
UPDATE aparelhos SET venda_id = '9bb48597-5221-4e63-9419-451a055c746b' WHERE id = '578ef941-01b3-4892-ab72-64e1b05e1ea9';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('038df07b-1526-439d-9be5-b2e5103b9ad4', '9bb48597-5221-4e63-9419-451a055c746b', 'pix', 500.0, '2026-05-17', '97f12885-87ad-426a-8bbb-656889d82e10', 1);
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('d41236dd-6b52-47d9-b853-4f801b88512e', '9bb48597-5221-4e63-9419-451a055c746b', 'cartao_credito', 1650.0, '2026-05-17', '97f12885-87ad-426a-8bbb-656889d82e10', 1);

-- === VENDA 11221: IPHONE 17 PRO 256GB BRANCO NOVO (17/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('44817452-9fcc-4774-be43-6e5c06879511', 'Apple', 'IPHONE 17 PRO 256GB BRANCO NOVO', '353739723292955', 7600.0, 7450.0, 19, 'novo', 'perfeito', 'vendido', '2026-05-17', '2026-05-17', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-17', '2026-05-17', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('1da80faf-bfa0-4c6b-bdfb-1d2e61a5bc45', 11221, current_setting('importacao.cliente_id')::uuid, 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 7600.0, 7600.0, 0.0, '2026-05-17', '2026-05-17', '97f12885-87ad-426a-8bbb-656889d82e10');
UPDATE aparelhos SET venda_id = '1da80faf-bfa0-4c6b-bdfb-1d2e61a5bc45' WHERE id = '44817452-9fcc-4774-be43-6e5c06879511';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('c0935189-cc92-41c7-8f91-67d79b6f7f98', '1da80faf-bfa0-4c6b-bdfb-1d2e61a5bc45', 'pix', 7600.0, '2026-05-17', '97f12885-87ad-426a-8bbb-656889d82e10', 1);

-- === VENDA 11222: IPHONE 17 256GB NOVO BRANCO (17/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('0638a6a6-434c-4ec4-9bbb-638c92771007', 'Apple', 'IPHONE 17 256GB NOVO BRANCO', '352824563558946', 5130.0, 4750.0, 19, 'novo', 'perfeito', 'vendido', '2026-05-17', '2026-05-17', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-17', '2026-05-17', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('0e7be347-d9bd-4c82-befa-7708452305d1', 11222, current_setting('importacao.cliente_id')::uuid, 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 5130.0, 5130.0, 0.0, '2026-05-17', '2026-05-17', '97f12885-87ad-426a-8bbb-656889d82e10');
UPDATE aparelhos SET venda_id = '0e7be347-d9bd-4c82-befa-7708452305d1' WHERE id = '0638a6a6-434c-4ec4-9bbb-638c92771007';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('11343267-fd64-4aa7-a844-7e7796f2143a', '0e7be347-d9bd-4c82-befa-7708452305d1', 'pix', 180.0, '2026-05-17', '97f12885-87ad-426a-8bbb-656889d82e10', 1);
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('a4620dbc-0482-4562-b51e-9d99328eb4b5', '0e7be347-d9bd-4c82-befa-7708452305d1', 'cartao_credito', 4950.0, '2026-05-17', '97f12885-87ad-426a-8bbb-656889d82e10', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('61162d0e-9acd-4c90-a279-2a85e9259e66', 19, '0e7be347-d9bd-4c82-befa-7708452305d1', 'Brinde', 140.0, '2026-05-17', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-17');

-- === VENDA 11223: IPHONE 17 PRO 256GB AZUL SEMINOVO (17/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('71788aaf-f56a-423a-b0f8-29a3b0a7b926', 'Apple', 'IPHONE 17 PRO 256GB AZUL SEMINOVO', '356839674078168', 6800.0, 6400.0, 19, 'seminovo', 'bom', 'vendido', '2026-05-17', '2026-05-17', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-17', '2026-05-17', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('9c3a3f86-4a85-40d3-b50f-ae58012f18ca', 11223, current_setting('importacao.cliente_id')::uuid, 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 6800.0, 6800.0, 0.0, '2026-05-17', '2026-05-17', '97f12885-87ad-426a-8bbb-656889d82e10');
UPDATE aparelhos SET venda_id = '9c3a3f86-4a85-40d3-b50f-ae58012f18ca' WHERE id = '71788aaf-f56a-423a-b0f8-29a3b0a7b926';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('1c684a46-6762-4a20-bfda-fbc67516d3c9', '9c3a3f86-4a85-40d3-b50f-ae58012f18ca', 'pix', 3680.0, '2026-05-17', '97f12885-87ad-426a-8bbb-656889d82e10', 1);
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('f1588f1f-581e-4601-9025-0d0b6728fd90', '9c3a3f86-4a85-40d3-b50f-ae58012f18ca', 'dinheiro', 220.0, '2026-05-17', '97f12885-87ad-426a-8bbb-656889d82e10', 1);
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, observacao, parcelas)
VALUES ('2a5a33c7-bf60-4b0d-83b8-03ca7a787b98', '9c3a3f86-4a85-40d3-b50f-ae58012f18ca', 'troca_aparelho', 2900.0, '2026-05-17', '97f12885-87ad-426a-8bbb-656889d82e10', 'Troca: IPH 15', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('4f8370bf-0338-432f-9734-1fb3eb9daca1', 19, '9c3a3f86-4a85-40d3-b50f-ae58012f18ca', 'Brinde', 20.0, '2026-05-17', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-17');

-- === VENDA 11224: IPHONE 13 PRO 256GB VERDE SEMINOVO (17/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('8fd92eeb-0a11-4a71-8945-74937dd1a996', 'Apple', 'IPHONE 13 PRO 256GB VERDE SEMINOVO', '356649150793663', 2800.0, 2450.0, 20, 'seminovo', 'bom', 'vendido', '2026-05-17', '2026-05-17', '25e2da5b-9e76-4388-9890-7e22efd6940d', '2026-05-17', '2026-05-17', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('1a7f54c2-a6b0-4da4-b6ec-7315fed509ab', 11224, current_setting('importacao.cliente_id')::uuid, 20, '25e2da5b-9e76-4388-9890-7e22efd6940d', 'concluida', 'normal', 2800.0, 2800.0, 0.0, '2026-05-17', '2026-05-17', '25e2da5b-9e76-4388-9890-7e22efd6940d');
UPDATE aparelhos SET venda_id = '1a7f54c2-a6b0-4da4-b6ec-7315fed509ab' WHERE id = '8fd92eeb-0a11-4a71-8945-74937dd1a996';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('f943741d-5404-4d6d-8be5-2af5412b3869', '1a7f54c2-a6b0-4da4-b6ec-7315fed509ab', 'pix', 2800.0, '2026-05-17', '25e2da5b-9e76-4388-9890-7e22efd6940d', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('5473b5c6-ecea-40ec-9bab-dd080231b9cc', 20, '1a7f54c2-a6b0-4da4-b6ec-7315fed509ab', 'Brinde', 50.0, '2026-05-17', '25e2da5b-9e76-4388-9890-7e22efd6940d', '2026-05-17');

-- === VENDA 11225: APPLE WATCH SERIE 11 ROSE GOLD NOVO (17/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('b02e5cf4-2ad5-40c2-9a93-7e153da5a6d2', 'Apple', 'APPLE WATCH SERIE 11 ROSE GOLD NOVO', 'KF97P7XLWD', 2500.0, 2250.0, 1, 'novo', 'perfeito', 'vendido', '2026-05-17', '2026-05-17', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-17', '2026-05-17', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('be1d80af-aa48-437f-ac6e-8aec4c33aa36', 11225, current_setting('importacao.cliente_id')::uuid, 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 2500.0, 2500.0, 0.0, '2026-05-17', '2026-05-17', '85e3aa42-b9af-49b8-a72a-64e9c337aa53');
UPDATE aparelhos SET venda_id = 'be1d80af-aa48-437f-ac6e-8aec4c33aa36' WHERE id = 'b02e5cf4-2ad5-40c2-9a93-7e153da5a6d2';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('9fea30ee-9ea0-42b5-bf17-4bbce848883c', 'be1d80af-aa48-437f-ac6e-8aec4c33aa36', 'pix', 2500.0, '2026-05-17', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 1);

-- === VENDA 11226: IPAD 11 128GB AZUL NOVO (17/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('2c6885d8-3133-47c7-8608-1927d8343098', 'Apple', 'IPAD 11 128GB AZUL NOVO', 'H7DR2GQ4ND', 2210.0, 2090.0, 1, 'novo', 'perfeito', 'vendido', '2026-05-17', '2026-05-17', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-17', '2026-05-17', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('3028e2a6-214f-4679-b412-75772b73adf3', 11226, current_setting('importacao.cliente_id')::uuid, 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 2210.0, 2210.0, 0.0, '2026-05-17', '2026-05-17', '85e3aa42-b9af-49b8-a72a-64e9c337aa53');
UPDATE aparelhos SET venda_id = '3028e2a6-214f-4679-b412-75772b73adf3' WHERE id = '2c6885d8-3133-47c7-8608-1927d8343098';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('8dcb4939-edcb-4072-9745-275ac4b85fb2', '3028e2a6-214f-4679-b412-75772b73adf3', 'pix', 2210.0, '2026-05-17', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 1);

-- === VENDA 11227: IPAD 11 128GB AMARELO NOVO (17/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('85657be0-56bd-43a4-988d-db2197c49c50', 'Apple', 'IPAD 11 128GB AMARELO NOVO', 'H9K6QY9X17', 2650.0, 2090.0, 1, 'novo', 'perfeito', 'vendido', '2026-05-17', '2026-05-17', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-17', '2026-05-17', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('caa2a275-7b72-4a2b-84df-54639ba7cb91', 11227, current_setting('importacao.cliente_id')::uuid, 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 2650.0, 2650.0, 0.0, '2026-05-17', '2026-05-17', '85e3aa42-b9af-49b8-a72a-64e9c337aa53');
UPDATE aparelhos SET venda_id = 'caa2a275-7b72-4a2b-84df-54639ba7cb91' WHERE id = '85657be0-56bd-43a4-988d-db2197c49c50';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('7688a570-1a23-4fa0-b288-e457ff4a45aa', 'caa2a275-7b72-4a2b-84df-54639ba7cb91', 'pix', 2650.0, '2026-05-17', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('2174fac1-6b63-478e-86cf-cae226452ff9', 1, 'caa2a275-7b72-4a2b-84df-54639ba7cb91', 'Brinde', 100.0, '2026-05-17', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-17');

-- === VENDA 11228: IPHONE 12 128GB PRETO SEMINOVO (17/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('d3c89b65-cea6-4406-bfc2-a7bd6d2bfaee', 'Apple', 'IPHONE 12 128GB PRETO SEMINOVO', '356427673422437', 1702.0, 1250.0, 1, 'seminovo', 'bom', 'vendido', '2026-05-17', '2026-05-17', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-17', '2026-05-17', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('a0841c1d-dae4-45d8-ae1f-4442506711f2', 11228, current_setting('importacao.cliente_id')::uuid, 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 1702.0, 1702.0, 0.0, '2026-05-17', '2026-05-17', '85e3aa42-b9af-49b8-a72a-64e9c337aa53');
UPDATE aparelhos SET venda_id = 'a0841c1d-dae4-45d8-ae1f-4442506711f2' WHERE id = 'd3c89b65-cea6-4406-bfc2-a7bd6d2bfaee';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('13b5c7ba-1e54-4ce2-854d-06691d07f06d', 'a0841c1d-dae4-45d8-ae1f-4442506711f2', 'pix', 1702.0, '2026-05-17', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('21dec905-a3c2-4747-a2da-8eb9d871d4b0', 1, 'a0841c1d-dae4-45d8-ae1f-4442506711f2', 'Brinde', 25.0, '2026-05-17', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-17');

-- === VENDA 11229: IPHONE 15 128GB ROSA SEMINOVO (17/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('a0b4d699-e8c4-4f22-8f39-192a560d7e3f', 'Apple', 'IPHONE 15 128GB ROSA SEMINOVO', NULL, 2896.0, 2750.0, 1, 'seminovo', 'bom', 'vendido', '2026-05-17', '2026-05-17', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-17', '2026-05-17', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('a438f1cf-50d5-44a6-b2bb-def817f5447c', 11229, current_setting('importacao.cliente_id')::uuid, 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 2896.0, 2896.0, 0.0, '2026-05-17', '2026-05-17', '85e3aa42-b9af-49b8-a72a-64e9c337aa53');
UPDATE aparelhos SET venda_id = 'a438f1cf-50d5-44a6-b2bb-def817f5447c' WHERE id = 'a0b4d699-e8c4-4f22-8f39-192a560d7e3f';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('a30276d3-bb94-4c93-b631-632135375644', 'a438f1cf-50d5-44a6-b2bb-def817f5447c', 'pix', 2896.0, '2026-05-17', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('72acd672-b5a8-48b8-a56d-d00879715a72', 1, 'a438f1cf-50d5-44a6-b2bb-def817f5447c', 'Brinde', 25.0, '2026-05-17', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-17');

-- === VENDA 11230: IPHONE 16 PRO 256GB NATURAL SEMINOVO (17/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('455786dc-3b21-45a0-86ee-f28a95ed3091', 'Apple', 'IPHONE 16 PRO 256GB NATURAL SEMINOVO', '358282722955921', 4800.0, 4500.0, 1, 'seminovo', 'bom', 'vendido', '2026-05-17', '2026-05-17', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-17', '2026-05-17', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('fdf05249-bfae-44c6-a64d-c923e2391c99', 11230, current_setting('importacao.cliente_id')::uuid, 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 4800.0, 4800.0, 0.0, '2026-05-17', '2026-05-17', '85e3aa42-b9af-49b8-a72a-64e9c337aa53');
UPDATE aparelhos SET venda_id = 'fdf05249-bfae-44c6-a64d-c923e2391c99' WHERE id = '455786dc-3b21-45a0-86ee-f28a95ed3091';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('e6b2425b-72cd-4943-ac65-87fae246eb73', 'fdf05249-bfae-44c6-a64d-c923e2391c99', 'pix', 4800.0, '2026-05-17', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('f40b159f-2255-4651-9691-c778c8cfb55e', 1, 'fdf05249-bfae-44c6-a64d-c923e2391c99', 'Brinde', 10.0, '2026-05-17', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-17');

-- === VENDA 11231: REDMI NOTE 15 5G 256GB PRETO NOVO (19/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('19bbf21d-a3b2-455b-af04-726762269b69', 'Xiaomi', 'REDMI NOTE 15 5G 256GB PRETO NOVO', '865292085370085', 1565.0, 1320.0, 1, 'novo', 'perfeito', 'vendido', '2026-05-19', '2026-05-19', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-19', '2026-05-19', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('f148108f-0426-4573-8d49-9ada99aca82c', 11231, current_setting('importacao.cliente_id')::uuid, 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 1565.0, 1565.0, 0.0, '2026-05-19', '2026-05-19', '85e3aa42-b9af-49b8-a72a-64e9c337aa53');
UPDATE aparelhos SET venda_id = 'f148108f-0426-4573-8d49-9ada99aca82c' WHERE id = '19bbf21d-a3b2-455b-af04-726762269b69';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('cb225d54-4416-42e1-85cd-a5cf5f4e0914', 'f148108f-0426-4573-8d49-9ada99aca82c', 'pix', 1565.0, '2026-05-19', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('283d8b69-a144-4a15-bc40-f845525a7aaf', 1, 'f148108f-0426-4573-8d49-9ada99aca82c', 'Brinde', 10.0, '2026-05-19', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-19');

-- === VENDA 11232: NOTE 14 256GB PRETO LACRADO (19/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('a9233585-c085-4b39-a7fa-f9c76899a73f', 'Redmi', 'NOTE 14 256GB PRETO LACRADO', '864093078872249', 1200.0, 1050.0, 1, 'novo', 'perfeito', 'vendido', '2026-05-19', '2026-05-19', '9451cd9f-6770-4e32-aae8-c75fa675e818', '2026-05-19', '2026-05-19', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('12e44ea5-7be4-4808-8845-009931df1881', 11232, current_setting('importacao.cliente_id')::uuid, 1, '9451cd9f-6770-4e32-aae8-c75fa675e818', 'concluida', 'normal', 1200.0, 1200.0, 0.0, '2026-05-19', '2026-05-19', '9451cd9f-6770-4e32-aae8-c75fa675e818');
UPDATE aparelhos SET venda_id = '12e44ea5-7be4-4808-8845-009931df1881' WHERE id = 'a9233585-c085-4b39-a7fa-f9c76899a73f';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('a067edb3-6d38-4afb-a10e-41635e8e330b', '12e44ea5-7be4-4808-8845-009931df1881', 'pix', 1200.0, '2026-05-19', '9451cd9f-6770-4e32-aae8-c75fa675e818', 1);

-- === VENDA 11233: IPHONE 13 PRO MAX 128GB VERDE SEMINOVO (19/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('1c866e22-0556-4205-9c71-a9ca120e4a2a', 'Apple', 'IPHONE 13 PRO MAX 128GB VERDE SEMINOVO', '350019049630201', 2939.0, 2600.0, 4, 'seminovo', 'bom', 'vendido', '2026-05-19', '2026-05-19', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-19', '2026-05-19', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('5b4a925a-6c1f-406e-be8b-03e83fac2e94', 11233, current_setting('importacao.cliente_id')::uuid, 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 2939.0, 2939.0, 0.0, '2026-05-19', '2026-05-19', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
UPDATE aparelhos SET venda_id = '5b4a925a-6c1f-406e-be8b-03e83fac2e94' WHERE id = '1c866e22-0556-4205-9c71-a9ca120e4a2a';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('2ce5fa02-8f60-4d7f-b9ba-23eca42b3215', '5b4a925a-6c1f-406e-be8b-03e83fac2e94', 'pix', 2939.0, '2026-05-19', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('fe4ae254-57c6-48c0-81f3-403f5ba4fd74', 4, '5b4a925a-6c1f-406e-be8b-03e83fac2e94', 'Brinde', 65.0, '2026-05-19', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-19');

-- === VENDA 11234: BOOMBOX 4 LARANJA NOVO (19/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('67e48919-1b07-484e-a432-ad039bc3cd95', 'Outros', 'BOOMBOX 4 LARANJA NOVO', 'TL1973-BQ0009594', 2500.0, 2390.0, 4, 'novo', 'perfeito', 'vendido', '2026-05-19', '2026-05-19', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-19', '2026-05-19', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('bcd66a91-2c9c-4cbb-8b72-d60011b0fc33', 11234, current_setting('importacao.cliente_id')::uuid, 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 2500.0, 2500.0, 0.0, '2026-05-19', '2026-05-19', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
UPDATE aparelhos SET venda_id = 'bcd66a91-2c9c-4cbb-8b72-d60011b0fc33' WHERE id = '67e48919-1b07-484e-a432-ad039bc3cd95';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('13290ad8-6d97-47be-b608-d04ea86cac0f', 'bcd66a91-2c9c-4cbb-8b72-d60011b0fc33', 'pix', 2500.0, '2026-05-19', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1);

-- === VENDA 11235: IPAD AIR M3 11 256GB AZUL NOVO (19/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('72f9179a-f7db-45a1-89d7-bef4c3bc496f', 'Apple', 'IPAD AIR M3 11 256GB AZUL NOVO', 'M4C404M6R6', 5200.0, 5050.0, 4, 'novo', 'perfeito', 'vendido', '2026-05-19', '2026-05-19', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-19', '2026-05-19', 'Pagto junto (Aparelho 1/2, total grupo R$ 13,500)');
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('f3b7ab60-241a-415c-994b-d52bb5d0e306', 11235, current_setting('importacao.cliente_id')::uuid, 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 5200.0, 5200.0, 0.0, '2026-05-19', '2026-05-19', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
UPDATE aparelhos SET venda_id = 'f3b7ab60-241a-415c-994b-d52bb5d0e306' WHERE id = '72f9179a-f7db-45a1-89d7-bef4c3bc496f';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('8f58de83-b40e-41fe-a181-39e1e05c62ad', 'f3b7ab60-241a-415c-994b-d52bb5d0e306', 'cartao_credito', 5200.0, '2026-05-19', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1);

-- === VENDA 11236: IPHONE 17 PRO MAX AZUL NOVO (19/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('b068beea-bd24-46f6-8357-4ef52f98fb5c', 'Apple', 'IPHONE 17 PRO MAX AZUL NOVO', 'CQHPQG449Y', 8300.0, 8140.0, 4, 'novo', 'perfeito', 'vendido', '2026-05-19', '2026-05-19', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-19', '2026-05-19', 'Pagto junto (Aparelho 2/2, total grupo R$ 13,500)');
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('834606c6-eb39-404d-91fb-1c1abe56db4f', 11236, current_setting('importacao.cliente_id')::uuid, 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 8300.0, 8300.0, 0.0, '2026-05-19', '2026-05-19', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
UPDATE aparelhos SET venda_id = '834606c6-eb39-404d-91fb-1c1abe56db4f' WHERE id = 'b068beea-bd24-46f6-8357-4ef52f98fb5c';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('7c81bbc2-ca31-49c4-bc30-1117a634437e', '834606c6-eb39-404d-91fb-1c1abe56db4f', 'cartao_credito', 8300.0, '2026-05-19', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('ae89c63d-7b62-41e5-b98f-db22ce86f4ec', 4, '834606c6-eb39-404d-91fb-1c1abe56db4f', 'Brinde', 15.0, '2026-05-19', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-19');

-- === VENDA 11237: IPHONE 17 PRO MAX 512GB AZUL NOVO (19/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('5dcf7b07-cfbc-490c-be0a-5d9570661c3e', 'Apple', 'IPHONE 17 PRO MAX 512GB AZUL NOVO', '357329447819436', 9801.0, 9050.0, 1, 'novo', 'perfeito', 'vendido', '2026-05-19', '2026-05-19', '0dd2c938-c6dd-4f5d-aac5-ed045ee5d2fb', '2026-05-19', '2026-05-19', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('980940e2-6621-4325-b6f9-c31f297ed189', 11237, current_setting('importacao.cliente_id')::uuid, 1, '0dd2c938-c6dd-4f5d-aac5-ed045ee5d2fb', 'concluida', 'normal', 9801.0, 9801.0, 0.0, '2026-05-19', '2026-05-19', '0dd2c938-c6dd-4f5d-aac5-ed045ee5d2fb');
UPDATE aparelhos SET venda_id = '980940e2-6621-4325-b6f9-c31f297ed189' WHERE id = '5dcf7b07-cfbc-490c-be0a-5d9570661c3e';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('8d8b590f-af18-4e5e-acc2-1ee4f22f33ab', '980940e2-6621-4325-b6f9-c31f297ed189', 'cartao_credito', 9801.0, '2026-05-19', '0dd2c938-c6dd-4f5d-aac5-ed045ee5d2fb', 1);

-- === VENDA 11238: IPHONE 16 PRO MAX 256GB PRETO SEMINOVO (19/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('e4d573ac-5092-42e2-a84b-4534a4292a0f', 'Apple', 'IPHONE 16 PRO MAX 256GB PRETO SEMINOVO', '355138326274957', 5400.0, 5150.0, 1, 'seminovo', 'bom', 'vendido', '2026-05-19', '2026-05-19', '0dd2c938-c6dd-4f5d-aac5-ed045ee5d2fb', '2026-05-19', '2026-05-19', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('717d3929-3d21-4807-923b-3c65a011e907', 11238, current_setting('importacao.cliente_id')::uuid, 1, '0dd2c938-c6dd-4f5d-aac5-ed045ee5d2fb', 'concluida', 'normal', 5400.0, 5400.0, 0.0, '2026-05-19', '2026-05-19', '0dd2c938-c6dd-4f5d-aac5-ed045ee5d2fb');
UPDATE aparelhos SET venda_id = '717d3929-3d21-4807-923b-3c65a011e907' WHERE id = 'e4d573ac-5092-42e2-a84b-4534a4292a0f';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('9a0e4462-5333-471a-b9b1-90b82d396df8', '717d3929-3d21-4807-923b-3c65a011e907', 'pix', 5000.0, '2026-05-19', '0dd2c938-c6dd-4f5d-aac5-ed045ee5d2fb', 1);
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('d6ad4638-1a6a-4464-91c7-0725aeda7208', '717d3929-3d21-4807-923b-3c65a011e907', 'dinheiro', 400.0, '2026-05-19', '0dd2c938-c6dd-4f5d-aac5-ed045ee5d2fb', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('7cb9c7a1-1214-4570-be89-688a902761ed', 1, '717d3929-3d21-4807-923b-3c65a011e907', 'Brinde', 15.0, '2026-05-19', '0dd2c938-c6dd-4f5d-aac5-ed045ee5d2fb', '2026-05-19');

-- === VENDA 11239: IPHONE 16 128GB PRETO NOVO (19/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('1b7638bb-4299-4e16-963f-61446663d4c4', 'Apple', 'IPHONE 16 128GB PRETO NOVO', '3594', 4395.0, 4050.0, 4, 'novo', 'perfeito', 'vendido', '2026-05-19', '2026-05-19', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-19', '2026-05-19', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('dec1c6aa-8887-4bd5-9218-c06fad550b6f', 11239, current_setting('importacao.cliente_id')::uuid, 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 4395.0, 4395.0, 0.0, '2026-05-19', '2026-05-19', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
UPDATE aparelhos SET venda_id = 'dec1c6aa-8887-4bd5-9218-c06fad550b6f' WHERE id = '1b7638bb-4299-4e16-963f-61446663d4c4';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('c99769a4-deb6-4e13-a4a6-7cb7ba31387d', 'dec1c6aa-8887-4bd5-9218-c06fad550b6f', 'pix', 645.0, '2026-05-19', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1);
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('65a316b1-3378-44d1-9fcd-294cebc567cb', 'dec1c6aa-8887-4bd5-9218-c06fad550b6f', 'cartao_credito', 2150.0, '2026-05-19', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1);
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, observacao, parcelas)
VALUES ('6d2847ad-5ae1-418b-ad1b-22ea5bc845dc', 'dec1c6aa-8887-4bd5-9218-c06fad550b6f', 'troca_aparelho', 1600.0, '2026-05-19', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'Troca: 13 SEMINOVO', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('7982bd47-e0dd-4a0f-9ff1-b72b05ccfc23', 4, 'dec1c6aa-8887-4bd5-9218-c06fad550b6f', 'Brinde', 115.0, '2026-05-19', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-19');

-- === VENDA 11240: IPAD 11 (A16) 128GB ROSA NOVO (19/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('82c54653-6568-4715-889c-5e5d761d3172', 'Apple', 'IPAD 11 (A16) 128GB ROSA NOVO', 'JOK9N9RQM5', 2375.0, 2090.0, 4, 'novo', 'perfeito', 'vendido', '2026-05-19', '2026-05-19', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-19', '2026-05-19', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('5556aa26-c310-4be5-ab1c-f866ab9375a4', 11240, current_setting('importacao.cliente_id')::uuid, 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 2375.0, 2375.0, 0.0, '2026-05-19', '2026-05-19', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
UPDATE aparelhos SET venda_id = '5556aa26-c310-4be5-ab1c-f866ab9375a4' WHERE id = '82c54653-6568-4715-889c-5e5d761d3172';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('ca5a1d93-bc1e-41c6-af41-7638697aeaa1', '5556aa26-c310-4be5-ab1c-f866ab9375a4', 'pix', 75.0, '2026-05-19', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1);
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('a807b4ac-2f69-4c7c-a7bc-f842f2b4567a', '5556aa26-c310-4be5-ab1c-f866ab9375a4', 'cartao_credito', 2300.0, '2026-05-19', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('c312b69f-4365-4fbd-b6b8-255ead635d49', 4, '5556aa26-c310-4be5-ab1c-f866ab9375a4', 'Brinde', 60.0, '2026-05-19', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-19');

-- === VENDA 11241: IPHONE 13 128GB PRETO NOVO (19/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('f6bcd784-718f-4a98-8315-e39403337b77', 'Apple', 'IPHONE 13 128GB PRETO NOVO', '353306207461637', 2850.0, 2700.0, 19, 'novo', 'perfeito', 'vendido', '2026-05-19', '2026-05-19', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-19', '2026-05-19', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('c1986ea3-ca74-4cb1-80e7-b9ea684ea5cf', 11241, current_setting('importacao.cliente_id')::uuid, 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 2850.0, 2850.0, 0.0, '2026-05-19', '2026-05-19', '97f12885-87ad-426a-8bbb-656889d82e10');
UPDATE aparelhos SET venda_id = 'c1986ea3-ca74-4cb1-80e7-b9ea684ea5cf' WHERE id = 'f6bcd784-718f-4a98-8315-e39403337b77';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('f08553ff-d9dc-4a77-82f5-cf190a8ca38c', 'c1986ea3-ca74-4cb1-80e7-b9ea684ea5cf', 'pix', 2850.0, '2026-05-19', '97f12885-87ad-426a-8bbb-656889d82e10', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('efe2f3e4-6e44-43ff-95b3-ed118b9436e0', 19, 'c1986ea3-ca74-4cb1-80e7-b9ea684ea5cf', 'Brinde', 20.0, '2026-05-19', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-19');

-- === VENDA 11242: IPHONE 15 256GB PRETO SEMINOVO (19/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('0418502f-79cd-4a77-8aba-26711e65b35b', 'Apple', 'IPHONE 15 256GB PRETO SEMINOVO', '356942572731144', 3200.0, 2900.0, 19, 'seminovo', 'bom', 'vendido', '2026-05-19', '2026-05-19', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-19', '2026-05-19', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('de385660-aa8e-4ccf-80a7-fb77af2a18da', 11242, current_setting('importacao.cliente_id')::uuid, 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 3200.0, 3200.0, 0.0, '2026-05-19', '2026-05-19', '97f12885-87ad-426a-8bbb-656889d82e10');
UPDATE aparelhos SET venda_id = 'de385660-aa8e-4ccf-80a7-fb77af2a18da' WHERE id = '0418502f-79cd-4a77-8aba-26711e65b35b';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('b8e22ffa-2591-48b3-9de4-fcd28c3ffd5e', 'de385660-aa8e-4ccf-80a7-fb77af2a18da', 'pix', 1500.0, '2026-05-19', '97f12885-87ad-426a-8bbb-656889d82e10', 1);
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, observacao, parcelas)
VALUES ('921abbe7-6029-4cf6-810b-0659f531dc95', 'de385660-aa8e-4ccf-80a7-fb77af2a18da', 'troca_aparelho', 1700.0, '2026-05-19', '97f12885-87ad-426a-8bbb-656889d82e10', 'Troca: IPH 13 128GB PRETO', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('782025b8-5c1f-458a-ada1-a381a586acf9', 19, 'de385660-aa8e-4ccf-80a7-fb77af2a18da', 'Brinde', 25.0, '2026-05-19', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-19');

-- === VENDA 11243: IPHONE 17 PRO SILVER 256GB SEMINOVO (19/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('f8da5674-2c17-4b56-8bb7-edb5993d62d8', 'Apple', 'IPHONE 17 PRO SILVER 256GB SEMINOVO', '356697786132668', 6800.0, 6100.0, 19, 'seminovo', 'bom', 'vendido', '2026-05-19', '2026-05-19', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-19', '2026-05-19', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('312f5e3e-d940-4d0a-8f79-d9c2262a25f6', 11243, current_setting('importacao.cliente_id')::uuid, 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 6800.0, 6800.0, 0.0, '2026-05-19', '2026-05-19', '97f12885-87ad-426a-8bbb-656889d82e10');
UPDATE aparelhos SET venda_id = '312f5e3e-d940-4d0a-8f79-d9c2262a25f6' WHERE id = 'f8da5674-2c17-4b56-8bb7-edb5993d62d8';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('d8220137-d80c-4ef4-9876-381d49fb6c54', '312f5e3e-d940-4d0a-8f79-d9c2262a25f6', 'dinheiro', 3400.0, '2026-05-19', '97f12885-87ad-426a-8bbb-656889d82e10', 1);
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, observacao, parcelas)
VALUES ('999a4bc9-6734-40ed-aece-89ae7fcd8572', '312f5e3e-d940-4d0a-8f79-d9c2262a25f6', 'troca_aparelho', 3400.0, '2026-05-19', '97f12885-87ad-426a-8bbb-656889d82e10', 'Troca: IPH 15 PRO 256GB', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('8757922f-2c99-48af-ad4f-544223d12924', 19, '312f5e3e-d940-4d0a-8f79-d9c2262a25f6', 'Brinde', 25.0, '2026-05-19', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-19');

-- === VENDA 11244: IPHONE 13 PRO MAX 256GB DOURADO SEMINOVO (19/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('5189bdf0-9021-4473-9d11-f1a5ce6db693', 'Apple', 'IPHONE 13 PRO MAX 256GB DOURADO SEMINOVO', '351596240328544', 3250.0, 2900.0, 20, 'seminovo', 'bom', 'vendido', '2026-05-19', '2026-05-19', '25e2da5b-9e76-4388-9890-7e22efd6940d', '2026-05-19', '2026-05-19', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('b11ddd4e-430e-4517-a7b5-c431b6e897fe', 11244, current_setting('importacao.cliente_id')::uuid, 20, '25e2da5b-9e76-4388-9890-7e22efd6940d', 'concluida', 'normal', 3250.0, 3250.0, 0.0, '2026-05-19', '2026-05-19', '25e2da5b-9e76-4388-9890-7e22efd6940d');
UPDATE aparelhos SET venda_id = 'b11ddd4e-430e-4517-a7b5-c431b6e897fe' WHERE id = '5189bdf0-9021-4473-9d11-f1a5ce6db693';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('9213517d-ea1b-4f35-9834-43c85fbe18f1', 'b11ddd4e-430e-4517-a7b5-c431b6e897fe', 'dinheiro', 3250.0, '2026-05-19', '25e2da5b-9e76-4388-9890-7e22efd6940d', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('ce420848-94eb-42a2-b5fb-18ac5c915ba6', 20, 'b11ddd4e-430e-4517-a7b5-c431b6e897fe', 'Brinde', 50.0, '2026-05-19', '25e2da5b-9e76-4388-9890-7e22efd6940d', '2026-05-19');

-- === VENDA 11245: IPAD 11 128GB SILVER SEMINOVO (19/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('a499f84a-734b-42f1-bdde-d515b53e0dc1', 'Apple', 'IPAD 11 128GB SILVER SEMINOVO', 'DY02NX9J6V', 2490.0, 2160.0, 20, 'seminovo', 'bom', 'vendido', '2026-05-19', '2026-05-19', '25e2da5b-9e76-4388-9890-7e22efd6940d', '2026-05-19', '2026-05-19', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('a947480f-7272-4a06-b8e0-bb1fed137a1d', 11245, current_setting('importacao.cliente_id')::uuid, 20, '25e2da5b-9e76-4388-9890-7e22efd6940d', 'concluida', 'normal', 2490.0, 2490.0, 0.0, '2026-05-19', '2026-05-19', '25e2da5b-9e76-4388-9890-7e22efd6940d');
UPDATE aparelhos SET venda_id = 'a947480f-7272-4a06-b8e0-bb1fed137a1d' WHERE id = 'a499f84a-734b-42f1-bdde-d515b53e0dc1';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('49254a8a-5749-4726-b768-7978787b8d20', 'a947480f-7272-4a06-b8e0-bb1fed137a1d', 'dinheiro', 2490.0, '2026-05-19', '25e2da5b-9e76-4388-9890-7e22efd6940d', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('8f394335-f064-42c6-8e48-15e246a3097d', 20, 'a947480f-7272-4a06-b8e0-bb1fed137a1d', 'Brinde', 75.0, '2026-05-19', '25e2da5b-9e76-4388-9890-7e22efd6940d', '2026-05-19');

-- === VENDA 11246: APPLE PENCIL USB-C BRANCO SEMINOVO (19/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('d7aad28f-1378-4b81-bfc6-b59b743d0e3a', 'Apple', 'APPLE PENCIL USB-C BRANCO SEMINOVO', 'DV2GQYL2VR', 780.0, 630.0, 20, 'seminovo', 'bom', 'vendido', '2026-05-19', '2026-05-19', '25e2da5b-9e76-4388-9890-7e22efd6940d', '2026-05-19', '2026-05-19', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('b1ac5b8d-dc03-47da-8f15-c5eb52b68021', 11246, current_setting('importacao.cliente_id')::uuid, 20, '25e2da5b-9e76-4388-9890-7e22efd6940d', 'concluida', 'normal', 780.0, 780.0, 0.0, '2026-05-19', '2026-05-19', '25e2da5b-9e76-4388-9890-7e22efd6940d');
UPDATE aparelhos SET venda_id = 'b1ac5b8d-dc03-47da-8f15-c5eb52b68021' WHERE id = 'd7aad28f-1378-4b81-bfc6-b59b743d0e3a';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('ff690947-b58b-4473-8432-64537c54366b', 'b1ac5b8d-dc03-47da-8f15-c5eb52b68021', 'dinheiro', 780.0, '2026-05-19', '25e2da5b-9e76-4388-9890-7e22efd6940d', 1);

-- === VENDA 11247: IPHONE XS 256GB PRETO SEMINOVO (19/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('099d8a9b-1d38-490e-803c-3a05f0f57262', 'Apple', 'IPHONE XS 256GB PRETO SEMINOVO', '353048093488114', 775.0, 350.0, 20, 'seminovo', 'bom', 'vendido', '2026-05-19', '2026-05-19', '25e2da5b-9e76-4388-9890-7e22efd6940d', '2026-05-19', '2026-05-19', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('2fb48159-e00e-4219-96d0-2f92f470a018', 11247, current_setting('importacao.cliente_id')::uuid, 20, '25e2da5b-9e76-4388-9890-7e22efd6940d', 'concluida', 'normal', 775.0, 775.0, 0.0, '2026-05-19', '2026-05-19', '25e2da5b-9e76-4388-9890-7e22efd6940d');
UPDATE aparelhos SET venda_id = '2fb48159-e00e-4219-96d0-2f92f470a018' WHERE id = '099d8a9b-1d38-490e-803c-3a05f0f57262';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('2467ae4a-09d9-48ee-b0b1-2b9fc8518e28', '2fb48159-e00e-4219-96d0-2f92f470a018', 'pix', 775.0, '2026-05-19', '25e2da5b-9e76-4388-9890-7e22efd6940d', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('90e11a7b-baf0-495e-b29f-762f2d3dd443', 20, '2fb48159-e00e-4219-96d0-2f92f470a018', 'Brinde', 40.0, '2026-05-19', '25e2da5b-9e76-4388-9890-7e22efd6940d', '2026-05-19');

-- === VENDA 11248: IPHONE 17 PRO MAX LARANJA 2 TB NOVO (19/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('ab4a950d-527f-4ce6-9f3f-afff6cec38ce', 'Apple', 'IPHONE 17 PRO MAX LARANJA 2 TB NOVO', '350025974181243', 12719.0, 11800.0, 1, 'novo', 'perfeito', 'vendido', '2026-05-19', '2026-05-19', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-19', '2026-05-19', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('895618d8-2b9f-4ead-82e2-5442310014c2', 11248, current_setting('importacao.cliente_id')::uuid, 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 12719.0, 12719.0, 0.0, '2026-05-19', '2026-05-19', '85e3aa42-b9af-49b8-a72a-64e9c337aa53');
UPDATE aparelhos SET venda_id = '895618d8-2b9f-4ead-82e2-5442310014c2' WHERE id = 'ab4a950d-527f-4ce6-9f3f-afff6cec38ce';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('f41a2904-a8c1-429d-99b9-b5b0be938d95', '895618d8-2b9f-4ead-82e2-5442310014c2', 'pix', 12719.0, '2026-05-19', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('f697eba7-c38d-46f7-af2c-bc4b035760e4', 1, '895618d8-2b9f-4ead-82e2-5442310014c2', 'Brinde', 25.0, '2026-05-19', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-19');

-- === VENDA 11249: BOOMBOX 4 PRETA SEMINOVO (20/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('0060fc95-81f5-4df7-a41b-e1bae68e1493', 'Outros', 'BOOMBOX 4 PRETA SEMINOVO', 'TL1876-JP0086240', 2350.0, 2350.0, 4, 'seminovo', 'bom', 'vendido', '2026-05-20', '2026-05-20', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-20', '2026-05-20', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('9512d4e5-1977-431d-9245-ea8cc38d70a3', 11249, current_setting('importacao.cliente_id')::uuid, 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 2350.0, 2350.0, 0.0, '2026-05-20', '2026-05-20', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
UPDATE aparelhos SET venda_id = '9512d4e5-1977-431d-9245-ea8cc38d70a3' WHERE id = '0060fc95-81f5-4df7-a41b-e1bae68e1493';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('d783bcef-08e2-4227-b036-6f1f97a23ddf', '9512d4e5-1977-431d-9245-ea8cc38d70a3', 'dinheiro', 2350.0, '2026-05-20', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1);

-- === VENDA 11250: IPHONE 14 128GB PRETA SEMINOVO (20/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('1847c014-8104-4db5-b981-845031f7c6a5', 'Apple', 'IPHONE 14 128GB PRETA SEMINOVO', '359014536509969', 2350.0, 2000.0, 1, 'seminovo', 'bom', 'vendido', '2026-05-20', '2026-05-20', '9451cd9f-6770-4e32-aae8-c75fa675e818', '2026-05-20', '2026-05-20', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('f7f04576-c217-4880-ab1b-695e1ca3afa4', 11250, current_setting('importacao.cliente_id')::uuid, 1, '9451cd9f-6770-4e32-aae8-c75fa675e818', 'concluida', 'normal', 2350.0, 2350.0, 0.0, '2026-05-20', '2026-05-20', '9451cd9f-6770-4e32-aae8-c75fa675e818');
UPDATE aparelhos SET venda_id = 'f7f04576-c217-4880-ab1b-695e1ca3afa4' WHERE id = '1847c014-8104-4db5-b981-845031f7c6a5';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('2a821858-564a-4c74-aef5-844bb8ba82cc', 'f7f04576-c217-4880-ab1b-695e1ca3afa4', 'pix', 2350.0, '2026-05-20', '9451cd9f-6770-4e32-aae8-c75fa675e818', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('6e33e2f2-9df0-45a6-a5ab-462a0d2c38f5', 1, 'f7f04576-c217-4880-ab1b-695e1ca3afa4', 'Brinde', 25.0, '2026-05-20', '9451cd9f-6770-4e32-aae8-c75fa675e818', '2026-05-20');

-- === VENDA 11251: BOOMBOX 4 LARANJA NOVO (20/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('ee169aee-7aa7-46b3-a114-fe4b1faf9c3f', 'Outros', 'BOOMBOX 4 LARANJA NOVO', 'TL1973-BQ0009916', 2450.0, 2390.0, 19, 'novo', 'perfeito', 'vendido', '2026-05-20', '2026-05-20', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-20', '2026-05-20', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('3d8cedd3-56e2-48c3-a2fc-d6d00c678670', 11251, current_setting('importacao.cliente_id')::uuid, 19, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 2450.0, 2450.0, 0.0, '2026-05-20', '2026-05-20', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
UPDATE aparelhos SET venda_id = '3d8cedd3-56e2-48c3-a2fc-d6d00c678670' WHERE id = 'ee169aee-7aa7-46b3-a114-fe4b1faf9c3f';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('d95d2a8f-2a32-4f02-8797-fbd08b9574b0', '3d8cedd3-56e2-48c3-a2fc-d6d00c678670', 'pix', 2450.0, '2026-05-20', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1);

-- === VENDA 11252: REDMI PAD 2 256GB PRETO NOVO (20/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('79875e45-9ad4-44de-ac15-8147a89b1b09', 'Xiaomi', 'REDMI PAD 2 256GB PRETO NOVO', '65577/W6N400397', 1500.0, 1200.0, 20, 'novo', 'perfeito', 'vendido', '2026-05-20', '2026-05-20', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', '2026-05-20', '2026-05-20', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('876891ee-f097-4246-b081-e90675d80cf8', 11252, current_setting('importacao.cliente_id')::uuid, 20, 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 'concluida', 'normal', 1500.0, 1500.0, 0.0, '2026-05-20', '2026-05-20', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4');
UPDATE aparelhos SET venda_id = '876891ee-f097-4246-b081-e90675d80cf8' WHERE id = '79875e45-9ad4-44de-ac15-8147a89b1b09';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('18e5c9a4-d42a-4c91-bdd4-6967d6491c97', '876891ee-f097-4246-b081-e90675d80cf8', 'cartao_credito', 1500.0, '2026-05-20', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 1);

-- === VENDA 11253: IPHONE 17 PRO MAX 256GB AZUL NOVO (20/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('34fb0868-ab3e-44f1-936d-bd6c248e8361', 'Apple', 'IPHONE 17 PRO MAX 256GB AZUL NOVO', '357247257122859', 8400.0, 8000.0, 1, 'novo', 'perfeito', 'vendido', '2026-05-20', '2026-05-20', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-20', '2026-05-20', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('45e2e41e-1786-4a90-8511-b07379de4ca4', 11253, current_setting('importacao.cliente_id')::uuid, 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 8400.0, 8400.0, 0.0, '2026-05-20', '2026-05-20', '85e3aa42-b9af-49b8-a72a-64e9c337aa53');
UPDATE aparelhos SET venda_id = '45e2e41e-1786-4a90-8511-b07379de4ca4' WHERE id = '34fb0868-ab3e-44f1-936d-bd6c248e8361';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('920b2dff-e9cb-4b9e-9fe0-678847961b1a', '45e2e41e-1786-4a90-8511-b07379de4ca4', 'pix', 7900.0, '2026-05-20', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 1);
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, observacao, parcelas)
VALUES ('7c87b1bb-3248-428a-928f-5383a4899a0c', '45e2e41e-1786-4a90-8511-b07379de4ca4', 'troca_aparelho', 500.0, '2026-05-20', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'Troca: IPH 11 PRO MAX 512GB', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('e91c3725-6a5f-40b1-9913-892040c71d26', 1, '45e2e41e-1786-4a90-8511-b07379de4ca4', 'Brinde', 25.0, '2026-05-20', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-20');

-- === VENDA 11254: IPAD 11 128GB SILVER NOVO (20/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('e691a764-f333-416f-8f3a-3f7b7f01a5c7', 'Apple', 'IPAD 11 128GB SILVER NOVO', 'MPNH609W5X', 2850.0, 2160.0, 1, 'novo', 'perfeito', 'vendido', '2026-05-20', '2026-05-20', '1d12d555-68e9-45f8-bfc0-a35a1d8d7920', '2026-05-20', '2026-05-20', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('ddc6ddbd-6a63-4f9c-88e8-8099612430a8', 11254, current_setting('importacao.cliente_id')::uuid, 1, '1d12d555-68e9-45f8-bfc0-a35a1d8d7920', 'concluida', 'normal', 2850.0, 2850.0, 0.0, '2026-05-20', '2026-05-20', '1d12d555-68e9-45f8-bfc0-a35a1d8d7920');
UPDATE aparelhos SET venda_id = 'ddc6ddbd-6a63-4f9c-88e8-8099612430a8' WHERE id = 'e691a764-f333-416f-8f3a-3f7b7f01a5c7';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('36992843-899b-4a67-b2d4-5f300f2b0aa5', 'ddc6ddbd-6a63-4f9c-88e8-8099612430a8', 'dinheiro', 2850.0, '2026-05-20', '1d12d555-68e9-45f8-bfc0-a35a1d8d7920', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('4f82e7da-f1fc-4792-8fde-66101875ee95', 1, 'ddc6ddbd-6a63-4f9c-88e8-8099612430a8', 'Brinde', 150.0, '2026-05-20', '1d12d555-68e9-45f8-bfc0-a35a1d8d7920', '2026-05-20');

-- === VENDA 11255: IPHONE 11 128GB VERMELHO SEMINOVO (20/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('a6079ab6-96e6-4d63-a99d-c8673a01fe4d', 'Apple', 'IPHONE 11 128GB VERMELHO SEMINOVO', '352991115545133', 1050.0, 800.0, 20, 'seminovo', 'bom', 'vendido', '2026-05-20', '2026-05-20', '25e2da5b-9e76-4388-9890-7e22efd6940d', '2026-05-20', '2026-05-20', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('95e32d7f-df66-4650-8861-0383a1a1e07a', 11255, current_setting('importacao.cliente_id')::uuid, 20, '25e2da5b-9e76-4388-9890-7e22efd6940d', 'concluida', 'normal', 1050.0, 1050.0, 0.0, '2026-05-20', '2026-05-20', '25e2da5b-9e76-4388-9890-7e22efd6940d');
UPDATE aparelhos SET venda_id = '95e32d7f-df66-4650-8861-0383a1a1e07a' WHERE id = 'a6079ab6-96e6-4d63-a99d-c8673a01fe4d';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('b6a6f047-e333-4035-b9c9-c18bd0e2814d', '95e32d7f-df66-4650-8861-0383a1a1e07a', 'pix', 1050.0, '2026-05-20', '25e2da5b-9e76-4388-9890-7e22efd6940d', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('7296ce2d-8117-45dc-bcdb-091569f73721', 20, '95e32d7f-df66-4650-8861-0383a1a1e07a', 'Brinde', 25.0, '2026-05-20', '25e2da5b-9e76-4388-9890-7e22efd6940d', '2026-05-20');

-- === VENDA 11256: POCO X8 PRO MAX 512GB PRETO SEMINOVO (20/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('06efb4ab-c36a-48e1-9a84-04138fdfdfc2', 'Outros', 'POCO X8 PRO MAX 512GB PRETO SEMINOVO', '860534087542582', 3300.0, 3200.0, 19, 'seminovo', 'bom', 'vendido', '2026-05-20', '2026-05-20', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-20', '2026-05-20', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('0ce206ae-91ce-4d6b-9bbe-c42613f91090', 11256, current_setting('importacao.cliente_id')::uuid, 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 3300.0, 3300.0, 0.0, '2026-05-20', '2026-05-20', '97f12885-87ad-426a-8bbb-656889d82e10');
UPDATE aparelhos SET venda_id = '0ce206ae-91ce-4d6b-9bbe-c42613f91090' WHERE id = '06efb4ab-c36a-48e1-9a84-04138fdfdfc2';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('bb240b68-9456-482a-8ba7-e5873aeed569', '0ce206ae-91ce-4d6b-9bbe-c42613f91090', 'pix', 3300.0, '2026-05-20', '97f12885-87ad-426a-8bbb-656889d82e10', 1);

-- === VENDA 11257: MAC AIR M5 16 512GB SILVER NOVO (20/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('de2c70ff-f5d3-4eb9-9c77-6f5d41afbdfd', 'Apple', 'MAC AIR M5 16 512GB SILVER NOVO', 'JYW40659KX', 7550.0, 6800.0, 19, 'novo', 'perfeito', 'vendido', '2026-05-20', '2026-05-20', '85743f3e-1b32-49c0-9d9e-c16afd690f7d', '2026-05-20', '2026-05-20', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('2209cb4e-7c1f-463c-8b0b-f13a1004d0bd', 11257, current_setting('importacao.cliente_id')::uuid, 19, '85743f3e-1b32-49c0-9d9e-c16afd690f7d', 'concluida', 'normal', 7550.0, 7550.0, 0.0, '2026-05-20', '2026-05-20', '85743f3e-1b32-49c0-9d9e-c16afd690f7d');
UPDATE aparelhos SET venda_id = '2209cb4e-7c1f-463c-8b0b-f13a1004d0bd' WHERE id = 'de2c70ff-f5d3-4eb9-9c77-6f5d41afbdfd';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('23042d8c-f846-46f2-9ed9-4d7aac9fbf21', '2209cb4e-7c1f-463c-8b0b-f13a1004d0bd', 'pix', 7550.0, '2026-05-20', '85743f3e-1b32-49c0-9d9e-c16afd690f7d', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('6347dc79-ab22-454c-9384-4dea28161b9c', 19, '2209cb4e-7c1f-463c-8b0b-f13a1004d0bd', 'Brinde', 50.0, '2026-05-20', '85743f3e-1b32-49c0-9d9e-c16afd690f7d', '2026-05-20');

-- === VENDA 11258: REDMI PAD 2 256GB SPACE GRAY NOVO (21/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('afea0996-4664-400a-b167-bc110432f1b8', 'Xiaomi', 'REDMI PAD 2 256GB SPACE GRAY NOVO', '65577/W6PT05147', 1655.0, 1200.0, 19, 'novo', 'perfeito', 'vendido', '2026-05-21', '2026-05-21', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-21', '2026-05-21', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('b28f9636-534a-4c92-8f8f-5fbc3e21b455', 11258, current_setting('importacao.cliente_id')::uuid, 19, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 1655.0, 1655.0, 0.0, '2026-05-21', '2026-05-21', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
UPDATE aparelhos SET venda_id = 'b28f9636-534a-4c92-8f8f-5fbc3e21b455' WHERE id = 'afea0996-4664-400a-b167-bc110432f1b8';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('fc0113c9-a2fa-45f3-8499-2b099b107d4d', 'b28f9636-534a-4c92-8f8f-5fbc3e21b455', 'pix', 1655.0, '2026-05-21', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('b09a5134-e67d-4235-ba33-e663496f0ebd', 19, 'b28f9636-534a-4c92-8f8f-5fbc3e21b455', 'Brinde', 90.0, '2026-05-21', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-21');

-- === VENDA 11259: IPHONE 17 PRO 256GB AZUL NOVO (21/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('0d0dda5f-f03a-4ca4-ae89-521e16445238', 'Apple', 'IPHONE 17 PRO 256GB AZUL NOVO', '359477633542185', 7940.0, 7300.0, 1, 'novo', 'perfeito', 'vendido', '2026-05-21', '2026-05-21', '0dd2c938-c6dd-4f5d-aac5-ed045ee5d2fb', '2026-05-21', '2026-05-21', 'Pagto junto (Aparelho 1/2, total grupo R$ 15,880)');
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('b852bd22-2430-4e3f-a838-9b2249b9c867', 11259, current_setting('importacao.cliente_id')::uuid, 1, '0dd2c938-c6dd-4f5d-aac5-ed045ee5d2fb', 'concluida', 'normal', 7940.0, 7940.0, 0.0, '2026-05-21', '2026-05-21', '0dd2c938-c6dd-4f5d-aac5-ed045ee5d2fb');
UPDATE aparelhos SET venda_id = 'b852bd22-2430-4e3f-a838-9b2249b9c867' WHERE id = '0d0dda5f-f03a-4ca4-ae89-521e16445238';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('e2ccc90b-e219-4185-be86-c6a78720add0', 'b852bd22-2430-4e3f-a838-9b2249b9c867', 'cartao_credito', 6040.0, '2026-05-21', '0dd2c938-c6dd-4f5d-aac5-ed045ee5d2fb', 1);
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, observacao, parcelas)
VALUES ('4eba5f83-5fb2-417d-84d1-1100bd9e55da', 'b852bd22-2430-4e3f-a838-9b2249b9c867', 'troca_aparelho', 1900.0, '2026-05-21', '0dd2c938-c6dd-4f5d-aac5-ed045ee5d2fb', 'Troca: IPH 12 PRO MAX 128GB', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('071f619d-f373-4c91-889d-5c392e94ee5b', 1, 'b852bd22-2430-4e3f-a838-9b2249b9c867', 'Brinde', 10.0, '2026-05-21', '0dd2c938-c6dd-4f5d-aac5-ed045ee5d2fb', '2026-05-21');

-- === VENDA 11260: IPHONE 17 PRO 256GB SILVER NOVO (21/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('1a6c0478-eb8f-4021-954a-bfbb44d3d369', 'Apple', 'IPHONE 17 PRO 256GB SILVER NOVO', '352574671892816', 7940.0, 7400.0, 1, 'novo', 'perfeito', 'vendido', '2026-05-21', '2026-05-21', '0dd2c938-c6dd-4f5d-aac5-ed045ee5d2fb', '2026-05-21', '2026-05-21', 'Pagto junto (Aparelho 2/2, total grupo R$ 15,880)');
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('1ac9982a-9dfd-45c7-b510-76565ba3c016', 11260, current_setting('importacao.cliente_id')::uuid, 1, '0dd2c938-c6dd-4f5d-aac5-ed045ee5d2fb', 'concluida', 'normal', 7940.0, 7940.0, 0.0, '2026-05-21', '2026-05-21', '0dd2c938-c6dd-4f5d-aac5-ed045ee5d2fb');
UPDATE aparelhos SET venda_id = '1ac9982a-9dfd-45c7-b510-76565ba3c016' WHERE id = '1a6c0478-eb8f-4021-954a-bfbb44d3d369';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('4e3a02ac-157b-4dce-b954-3c7394967de8', '1ac9982a-9dfd-45c7-b510-76565ba3c016', 'cartao_credito', 7940.0, '2026-05-21', '0dd2c938-c6dd-4f5d-aac5-ed045ee5d2fb', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('6c0e6652-8a35-4e60-8617-08bf0e862b45', 1, '1ac9982a-9dfd-45c7-b510-76565ba3c016', 'Brinde', 10.0, '2026-05-21', '0dd2c938-c6dd-4f5d-aac5-ed045ee5d2fb', '2026-05-21');

-- === VENDA 11261: IPHONE 17 PRO 256GB SILVER SEMINOVO (21/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('a0791c76-b27b-42f5-8fc4-5aa319dacb9b', 'Apple', 'IPHONE 17 PRO 256GB SILVER SEMINOVO', '356661406078476', 6690.0, 6100.0, 19, 'seminovo', 'bom', 'vendido', '2026-05-21', '2026-05-21', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-21', '2026-05-21', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('ac3a3bb9-abd9-4a45-a271-023f1ad466fd', 11261, current_setting('importacao.cliente_id')::uuid, 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 6690.0, 6690.0, 0.0, '2026-05-21', '2026-05-21', '97f12885-87ad-426a-8bbb-656889d82e10');
UPDATE aparelhos SET venda_id = 'ac3a3bb9-abd9-4a45-a271-023f1ad466fd' WHERE id = 'a0791c76-b27b-42f5-8fc4-5aa319dacb9b';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('5e5755a2-72f9-430e-bfe1-608a00ba465d', 'ac3a3bb9-abd9-4a45-a271-023f1ad466fd', 'cartao_credito', 6690.0, '2026-05-21', '97f12885-87ad-426a-8bbb-656889d82e10', 1);

-- === VENDA 11262: POCO X8 PRO 512GB PRETO NOVO (21/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('65621ccf-b7f5-45fd-84f9-8ca52694d5b0', 'Outros', 'POCO X8 PRO 512GB PRETO NOVO', '866132083268783', 2476.0, 2300.0, 4, 'novo', 'perfeito', 'vendido', '2026-05-21', '2026-05-21', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-21', '2026-05-21', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('6fe44efe-0152-4099-a525-45b3f9082cfc', 11262, current_setting('importacao.cliente_id')::uuid, 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 2476.0, 2476.0, 0.0, '2026-05-21', '2026-05-21', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
UPDATE aparelhos SET venda_id = '6fe44efe-0152-4099-a525-45b3f9082cfc' WHERE id = '65621ccf-b7f5-45fd-84f9-8ca52694d5b0';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('417f5152-1f49-4d27-b196-fceca5e2bb8f', '6fe44efe-0152-4099-a525-45b3f9082cfc', 'pix', 1225.0, '2026-05-21', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1);
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('a493e8f3-a6b9-4a41-a529-1b75e74c7668', '6fe44efe-0152-4099-a525-45b3f9082cfc', 'cartao_credito', 1251.0, '2026-05-21', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1);

-- === VENDA 11263: IPHONE 15 PRO MAX 256GB PRETO SEMINOVO (21/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('1903161e-d784-4155-b218-1ba19c62727e', 'Apple', 'IPHONE 15 PRO MAX 256GB PRETO SEMINOVO', '357275796919659', 4250.0, 4000.0, 19, 'seminovo', 'bom', 'vendido', '2026-05-21', '2026-05-21', 'b4269e60-eea2-4eba-a34d-db9591e0ec83', '2026-05-21', '2026-05-21', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('e3132ebe-d108-4433-9856-10ac621a1975', 11263, current_setting('importacao.cliente_id')::uuid, 19, 'b4269e60-eea2-4eba-a34d-db9591e0ec83', 'concluida', 'normal', 4250.0, 4250.0, 0.0, '2026-05-21', '2026-05-21', 'b4269e60-eea2-4eba-a34d-db9591e0ec83');
UPDATE aparelhos SET venda_id = 'e3132ebe-d108-4433-9856-10ac621a1975' WHERE id = '1903161e-d784-4155-b218-1ba19c62727e';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('3018d8ec-83be-41a5-87d0-0fc5d17666fa', 'e3132ebe-d108-4433-9856-10ac621a1975', 'pix', 4250.0, '2026-05-21', 'b4269e60-eea2-4eba-a34d-db9591e0ec83', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('09aa8b80-c8ff-4511-9406-81745bdfdeba', 19, 'e3132ebe-d108-4433-9856-10ac621a1975', 'Brinde', 25.0, '2026-05-21', 'b4269e60-eea2-4eba-a34d-db9591e0ec83', '2026-05-21');

-- === VENDA 11264: NOTE 15 5G 256GB PRETO NOVO (21/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('dfa9b121-2479-4a79-bddd-dae3565d3427', 'Redmi', 'NOTE 15 5G 256GB PRETO NOVO', '867520084645802', 1420.0, 1360.0, 19, 'novo', 'perfeito', 'vendido', '2026-05-21', '2026-05-21', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-21', '2026-05-21', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('af8434eb-8324-47f1-82ea-e07b9d3636c4', 11264, current_setting('importacao.cliente_id')::uuid, 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 1420.0, 1420.0, 0.0, '2026-05-21', '2026-05-21', '97f12885-87ad-426a-8bbb-656889d82e10');
UPDATE aparelhos SET venda_id = 'af8434eb-8324-47f1-82ea-e07b9d3636c4' WHERE id = 'dfa9b121-2479-4a79-bddd-dae3565d3427';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('7e471a1a-0651-4e44-a0f1-68131c20234d', 'af8434eb-8324-47f1-82ea-e07b9d3636c4', 'pix', 1420.0, '2026-05-21', '97f12885-87ad-426a-8bbb-656889d82e10', 1);

-- === VENDA 11265: GALAXY S26 ULTRA 512GB BRANCO LACRADO (21/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('886144d3-f0a4-41c0-af52-9466a35b52ab', 'Outros', 'GALAXY S26 ULTRA 512GB BRANCO LACRADO', '355381840336221', 7285.0, 6899.0, 1, 'novo', 'perfeito', 'vendido', '2026-05-21', '2026-05-21', '9451cd9f-6770-4e32-aae8-c75fa675e818', '2026-05-21', '2026-05-21', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('f1117fb9-80fa-4e90-8bdb-9eb69d3f585a', 11265, current_setting('importacao.cliente_id')::uuid, 1, '9451cd9f-6770-4e32-aae8-c75fa675e818', 'concluida', 'normal', 7285.0, 7285.0, 0.0, '2026-05-21', '2026-05-21', '9451cd9f-6770-4e32-aae8-c75fa675e818');
UPDATE aparelhos SET venda_id = 'f1117fb9-80fa-4e90-8bdb-9eb69d3f585a' WHERE id = '886144d3-f0a4-41c0-af52-9466a35b52ab';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('1336aea1-b620-401e-9494-8f3ac20ed461', 'f1117fb9-80fa-4e90-8bdb-9eb69d3f585a', 'pix', 7285.0, '2026-05-21', '9451cd9f-6770-4e32-aae8-c75fa675e818', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('1c4f934d-656c-4c15-a563-560ab8992a64', 1, 'f1117fb9-80fa-4e90-8bdb-9eb69d3f585a', 'Brinde', 5.0, '2026-05-21', '9451cd9f-6770-4e32-aae8-c75fa675e818', '2026-05-21');

-- === VENDA 11266: IPHONE 15 128GB AZUL NOVO (21/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('cb5181f9-3ec9-4716-8326-0d1ae2c96d02', 'Apple', 'IPHONE 15 128GB AZUL NOVO', '354196713272654', 3850.0, 3700.0, 20, 'novo', 'perfeito', 'vendido', '2026-05-21', '2026-05-21', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', '2026-05-21', '2026-05-21', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('047d6f90-03f4-4dab-b90d-d035a9b27b91', 11266, current_setting('importacao.cliente_id')::uuid, 20, 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 'concluida', 'normal', 3850.0, 3850.0, 0.0, '2026-05-21', '2026-05-21', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4');
UPDATE aparelhos SET venda_id = '047d6f90-03f4-4dab-b90d-d035a9b27b91' WHERE id = 'cb5181f9-3ec9-4716-8326-0d1ae2c96d02';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('6a0af865-d481-43cb-9863-826b421be580', '047d6f90-03f4-4dab-b90d-d035a9b27b91', 'cartao_credito', 3850.0, '2026-05-21', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('e1559732-102d-47b9-822b-3a05a09a6082', 20, '047d6f90-03f4-4dab-b90d-d035a9b27b91', 'Brinde', 10.0, '2026-05-21', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', '2026-05-21');

-- === VENDA 11267: IPHONE 11 64GB VERDE SEMINOVO (21/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('f76ca5f3-3549-4256-8ad5-d0fff47a5fc1', 'Apple', 'IPHONE 11 64GB VERDE SEMINOVO', '354005106730246', 850.0, 650.0, 1, 'seminovo', 'bom', 'vendido', '2026-05-21', '2026-05-21', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-21', '2026-05-21', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('a8f2f3b0-7537-4dff-957a-2293cd42f984', 11267, current_setting('importacao.cliente_id')::uuid, 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 850.0, 850.0, 0.0, '2026-05-21', '2026-05-21', '85e3aa42-b9af-49b8-a72a-64e9c337aa53');
UPDATE aparelhos SET venda_id = 'a8f2f3b0-7537-4dff-957a-2293cd42f984' WHERE id = 'f76ca5f3-3549-4256-8ad5-d0fff47a5fc1';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('94d23e67-f623-4ee5-a12c-2c4f4195821f', 'a8f2f3b0-7537-4dff-957a-2293cd42f984', 'pix', 850.0, '2026-05-21', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('695b9447-1aeb-4e73-bb62-d37c25bca211', 1, 'a8f2f3b0-7537-4dff-957a-2293cd42f984', 'Brinde', 10.0, '2026-05-21', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-21');

-- === VENDA 11268: IPHONE 16 PRO MAX 256GB NATURAL SEMINOVO (21/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('5e19b86b-aa71-4b03-a080-b2c5fa92f173', 'Apple', 'IPHONE 16 PRO MAX 256GB NATURAL SEMINOVO', '355300185671927', 5250.0, 4850.0, 1, 'seminovo', 'bom', 'vendido', '2026-05-21', '2026-05-21', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-21', '2026-05-21', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('f3213b08-00b2-4afa-8ac5-1b11c42e12ec', 11268, current_setting('importacao.cliente_id')::uuid, 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 5250.0, 5250.0, 0.0, '2026-05-21', '2026-05-21', '85e3aa42-b9af-49b8-a72a-64e9c337aa53');
UPDATE aparelhos SET venda_id = 'f3213b08-00b2-4afa-8ac5-1b11c42e12ec' WHERE id = '5e19b86b-aa71-4b03-a080-b2c5fa92f173';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('dc787e9a-c61b-46f2-8cf4-90775e1002d0', 'f3213b08-00b2-4afa-8ac5-1b11c42e12ec', 'pix', 5250.0, '2026-05-21', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('003527b5-9913-47e9-a539-8e20f53dafdf', 1, 'f3213b08-00b2-4afa-8ac5-1b11c42e12ec', 'Brinde', 25.0, '2026-05-21', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-21');

-- === VENDA 11269: IPHONE 13 256GB SEMINOVO AZUL (21/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('9e4cedf2-ac1f-40a6-bbbd-ab2919bcefcc', 'Apple', 'IPHONE 13 256GB SEMINOVO AZUL', '356177152787459', 2300.0, 2000.0, 1, 'seminovo', 'bom', 'vendido', '2026-05-21', '2026-05-21', '1d12d555-68e9-45f8-bfc0-a35a1d8d7920', '2026-05-21', '2026-05-21', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('b801f197-8f89-424b-b2cb-212b9d5ebc41', 11269, current_setting('importacao.cliente_id')::uuid, 1, '1d12d555-68e9-45f8-bfc0-a35a1d8d7920', 'concluida', 'normal', 2300.0, 2300.0, 0.0, '2026-05-21', '2026-05-21', '1d12d555-68e9-45f8-bfc0-a35a1d8d7920');
UPDATE aparelhos SET venda_id = 'b801f197-8f89-424b-b2cb-212b9d5ebc41' WHERE id = '9e4cedf2-ac1f-40a6-bbbd-ab2919bcefcc';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('ca3309e2-f7ea-4f1f-8201-5bee12981cae', 'b801f197-8f89-424b-b2cb-212b9d5ebc41', 'pix', 2300.0, '2026-05-21', '1d12d555-68e9-45f8-bfc0-a35a1d8d7920', 1);

-- === VENDA 11270: IPHONE 13 128GB AZUL SEMINOVO (22/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('c1811581-426c-4284-9dd4-a3519ecf2a6b', 'Apple', 'IPHONE 13 128GB AZUL SEMINOVO', '355939491184461', 1980.0, 1800.0, 4, 'seminovo', 'bom', 'vendido', '2026-05-22', '2026-05-22', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-22', '2026-05-22', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('4a5caf52-dbaa-46b0-a572-c1bf7657e4f9', 11270, current_setting('importacao.cliente_id')::uuid, 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 1980.0, 1980.0, 0.0, '2026-05-22', '2026-05-22', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
UPDATE aparelhos SET venda_id = '4a5caf52-dbaa-46b0-a572-c1bf7657e4f9' WHERE id = 'c1811581-426c-4284-9dd4-a3519ecf2a6b';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('c882d075-671a-46af-af5d-8774081715bd', '4a5caf52-dbaa-46b0-a572-c1bf7657e4f9', 'cartao_credito', 1980.0, '2026-05-22', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('6f2be239-2f75-4141-ad7d-19c329b19a7a', 4, '4a5caf52-dbaa-46b0-a572-c1bf7657e4f9', 'Brinde', 25.0, '2026-05-22', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-22');

-- === VENDA 11271: IPHONE 12 PRO MAX 128GB GRAFITE SEMINOVO (22/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('f96090db-5a2b-4aae-abcf-df0e758aa584', 'Apple', 'IPHONE 12 PRO MAX 128GB GRAFITE SEMINOVO', '354440895786747', 2210.0, 2000.0, 4, 'seminovo', 'bom', 'vendido', '2026-05-22', '2026-05-22', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-22', '2026-05-22', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('06311001-48fb-4184-9c5f-4a4b3875790e', 11271, current_setting('importacao.cliente_id')::uuid, 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 2210.0, 2210.0, 0.0, '2026-05-22', '2026-05-22', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
UPDATE aparelhos SET venda_id = '06311001-48fb-4184-9c5f-4a4b3875790e' WHERE id = 'f96090db-5a2b-4aae-abcf-df0e758aa584';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('f973d2b5-0504-456e-acf6-cdc89a3b8837', '06311001-48fb-4184-9c5f-4a4b3875790e', 'pix', 2210.0, '2026-05-22', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('6c4f2274-508a-4339-87d4-fb2cfbef91a5', 4, '06311001-48fb-4184-9c5f-4a4b3875790e', 'Brinde', 25.0, '2026-05-22', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-22');

-- === VENDA 11272: IPHONE 17 PRO MAX 256GB BRANCO NOVO (22/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('76c85ba7-d463-4d6f-8f83-3a0ace733c75', 'Apple', 'IPHONE 17 PRO MAX 256GB BRANCO NOVO', '355101476809873', 8886.0, 7950.0, 1, 'novo', 'perfeito', 'vendido', '2026-05-22', '2026-05-22', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-22', '2026-05-22', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('0922e407-f27b-448d-8049-b1e5ecfe4ee1', 11272, current_setting('importacao.cliente_id')::uuid, 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 8886.0, 8886.0, 0.0, '2026-05-22', '2026-05-22', '85e3aa42-b9af-49b8-a72a-64e9c337aa53');
UPDATE aparelhos SET venda_id = '0922e407-f27b-448d-8049-b1e5ecfe4ee1' WHERE id = '76c85ba7-d463-4d6f-8f83-3a0ace733c75';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('9693bb6c-cf65-47a4-be70-119372ed4a88', '0922e407-f27b-448d-8049-b1e5ecfe4ee1', 'pix', 5936.0, '2026-05-22', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 1);
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, observacao, parcelas)
VALUES ('b8a52fec-3d5b-455d-96e5-9bf7bd9a1616', '0922e407-f27b-448d-8049-b1e5ecfe4ee1', 'troca_aparelho', 2950.0, '2026-05-22', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'Troca: IPH 16 128GB PRETO', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('bad773e6-d3d7-4889-93a9-9042841cd23e', 1, '0922e407-f27b-448d-8049-b1e5ecfe4ee1', 'Brinde', 255.0, '2026-05-22', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-22');

-- === VENDA 11273: REDMI NOTE 15 5G 256GB PRETO NOVO (22/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('a9e5e606-99e2-4d8d-afd8-940ea910f472', 'Xiaomi', 'REDMI NOTE 15 5G 256GB PRETO NOVO', '861950072519774', 1600.0, 1380.0, 4, 'novo', 'perfeito', 'vendido', '2026-05-22', '2026-05-22', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-22', '2026-05-22', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('dc3d3766-7eda-408b-b72e-27a56dff173b', 11273, current_setting('importacao.cliente_id')::uuid, 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 1600.0, 1600.0, 0.0, '2026-05-22', '2026-05-22', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
UPDATE aparelhos SET venda_id = 'dc3d3766-7eda-408b-b72e-27a56dff173b' WHERE id = 'a9e5e606-99e2-4d8d-afd8-940ea910f472';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('92ab850b-026d-4eb1-b707-f888b35c9391', 'dc3d3766-7eda-408b-b72e-27a56dff173b', 'cartao_credito', 1600.0, '2026-05-22', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('178c0d20-7657-4c97-8c89-965fc9012ef7', 4, 'dc3d3766-7eda-408b-b72e-27a56dff173b', 'Brinde', 50.0, '2026-05-22', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-22');

-- === VENDA 11274: REDMI NOTE 15 5G 256GB PRETO NOVO (22/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('c6bc9be3-012f-43e4-a21b-3b82f49b878b', 'Xiaomi', 'REDMI NOTE 15 5G 256GB PRETO NOVO', '861950072535226', 1500.0, 1380.0, 4, 'novo', 'perfeito', 'vendido', '2026-05-22', '2026-05-22', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-22', '2026-05-22', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('c839d7a1-20af-4650-8a78-7696f443c715', 11274, current_setting('importacao.cliente_id')::uuid, 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 1500.0, 1500.0, 0.0, '2026-05-22', '2026-05-22', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
UPDATE aparelhos SET venda_id = 'c839d7a1-20af-4650-8a78-7696f443c715' WHERE id = 'c6bc9be3-012f-43e4-a21b-3b82f49b878b';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('0e476531-a156-4991-8d8b-2e53cf5b865a', 'c839d7a1-20af-4650-8a78-7696f443c715', 'pix', 1500.0, '2026-05-22', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1);

-- === VENDA 11275: REDMI NOTE 15 5G 256GB PRETO NOVO (22/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('d9d49571-f328-433e-bdda-e1ff17b7e0e9', 'Xiaomi', 'REDMI NOTE 15 5G 256GB PRETO NOVO', '865292085328620', 1600.0, 1380.0, 4, 'novo', 'perfeito', 'vendido', '2026-05-22', '2026-05-22', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-22', '2026-05-22', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('7de3ce8c-8835-45a3-a47a-ac984c203405', 11275, current_setting('importacao.cliente_id')::uuid, 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 1600.0, 1600.0, 0.0, '2026-05-22', '2026-05-22', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
UPDATE aparelhos SET venda_id = '7de3ce8c-8835-45a3-a47a-ac984c203405' WHERE id = 'd9d49571-f328-433e-bdda-e1ff17b7e0e9';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('6e827d58-3ad9-495c-950a-a2be36f846f1', '7de3ce8c-8835-45a3-a47a-ac984c203405', 'cartao_credito', 1600.0, '2026-05-22', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('2cdb22a0-0bbf-4a1c-bbae-e5a6eb3f2c9b', 4, '7de3ce8c-8835-45a3-a47a-ac984c203405', 'Brinde', 70.0, '2026-05-22', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-22');

-- === VENDA 11276: IPHONE 16 128GB BRANCO NOVO (22/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('b655a25a-f954-4f01-9422-c3fce4ab2af4', 'Apple', 'IPHONE 16 128GB BRANCO NOVO', '356004167522577', 4360.0, 4050.0, 4, 'novo', 'perfeito', 'vendido', '2026-05-22', '2026-05-22', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-22', '2026-05-22', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('5b65968e-436d-4a6a-bc53-9cb96931d2dd', 11276, current_setting('importacao.cliente_id')::uuid, 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 4360.0, 4360.0, 0.0, '2026-05-22', '2026-05-22', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
UPDATE aparelhos SET venda_id = '5b65968e-436d-4a6a-bc53-9cb96931d2dd' WHERE id = 'b655a25a-f954-4f01-9422-c3fce4ab2af4';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('56bf8a84-2124-4951-ad67-2b399219e38b', '5b65968e-436d-4a6a-bc53-9cb96931d2dd', 'cartao_credito', 4360.0, '2026-05-22', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('7336386d-2f88-4252-8061-58297f7eb31b', 4, '5b65968e-436d-4a6a-bc53-9cb96931d2dd', 'Brinde', 75.0, '2026-05-22', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-22');

-- === VENDA 11277: IPHONE 11 PRO MAX 512GB BRANCO SEMINOVO (23/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('a0d3e558-4ee1-4ca3-afdd-b77dcfac95d3', 'Apple', 'IPHONE 11 PRO MAX 512GB BRANCO SEMINOVO', '353915106419593', 550.0, 500.0, 4, 'seminovo', 'bom', 'vendido', '2026-05-23', '2026-05-23', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-23', '2026-05-23', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('642def2d-8387-4381-aca1-2bc7ff9d822a', 11277, current_setting('importacao.cliente_id')::uuid, 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 550.0, 550.0, 0.0, '2026-05-23', '2026-05-23', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
UPDATE aparelhos SET venda_id = '642def2d-8387-4381-aca1-2bc7ff9d822a' WHERE id = 'a0d3e558-4ee1-4ca3-afdd-b77dcfac95d3';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('c5dba63a-e732-48e1-b518-5a005cde16f8', '642def2d-8387-4381-aca1-2bc7ff9d822a', 'pix', 550.0, '2026-05-23', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1);

-- === VENDA 11278: IPHONE 16 PRO MAX 512GB DESERT SEMINOVO (23/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('1d8dd9ac-4b59-4206-bc84-efa81691600b', 'Apple', 'IPHONE 16 PRO MAX 512GB DESERT SEMINOVO', '356760684778276', 5561.0, 5150.0, 4, 'seminovo', 'bom', 'vendido', '2026-05-23', '2026-05-23', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-23', '2026-05-23', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('5b07811b-930e-4732-87d1-1345c15c9c79', 11278, current_setting('importacao.cliente_id')::uuid, 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 5561.0, 5561.0, 0.0, '2026-05-23', '2026-05-23', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
UPDATE aparelhos SET venda_id = '5b07811b-930e-4732-87d1-1345c15c9c79' WHERE id = '1d8dd9ac-4b59-4206-bc84-efa81691600b';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('766e8af2-f7ba-4d5c-9b26-8d28df08670e', '5b07811b-930e-4732-87d1-1345c15c9c79', 'pix', 5561.0, '2026-05-23', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('55608c02-75ec-4346-80cb-745394350bea', 4, '5b07811b-930e-4732-87d1-1345c15c9c79', 'Brinde', 25.0, '2026-05-23', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-23');

-- === VENDA 11279: IPHONE 17 PRO MAX 256GB SILVER NOVO (23/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('bebc908d-b981-4234-97da-54fd5295d62e', 'Apple', 'IPHONE 17 PRO MAX 256GB SILVER NOVO', '358206135981398', 8400.0, 7900.0, 1, 'novo', 'perfeito', 'vendido', '2026-05-23', '2026-05-23', '0dd2c938-c6dd-4f5d-aac5-ed045ee5d2fb', '2026-05-23', '2026-05-23', 'Pagto junto (Aparelho 1/2, total grupo R$ 16,100)');
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('0143bf9d-0f33-4b3d-8f75-145fdd969ec0', 11279, current_setting('importacao.cliente_id')::uuid, 1, '0dd2c938-c6dd-4f5d-aac5-ed045ee5d2fb', 'concluida', 'normal', 8400.0, 8400.0, 0.0, '2026-05-23', '2026-05-23', '0dd2c938-c6dd-4f5d-aac5-ed045ee5d2fb');
UPDATE aparelhos SET venda_id = '0143bf9d-0f33-4b3d-8f75-145fdd969ec0' WHERE id = 'bebc908d-b981-4234-97da-54fd5295d62e';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('417cea90-d249-4fdd-b7b0-823c4e3fa4aa', '0143bf9d-0f33-4b3d-8f75-145fdd969ec0', 'pix', 3600.0, '2026-05-23', '0dd2c938-c6dd-4f5d-aac5-ed045ee5d2fb', 1);
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, observacao, parcelas)
VALUES ('14ded2cb-a740-4b60-b011-98ed85dfe425', '0143bf9d-0f33-4b3d-8f75-145fdd969ec0', 'troca_aparelho', 4800.0, '2026-05-23', '0dd2c938-c6dd-4f5d-aac5-ed045ee5d2fb', 'Troca: IPH 16 PRO MAX', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('836dca94-53fd-4415-bd18-13948f9caef7', 1, '0143bf9d-0f33-4b3d-8f75-145fdd969ec0', 'Brinde', 20.0, '2026-05-23', '0dd2c938-c6dd-4f5d-aac5-ed045ee5d2fb', '2026-05-23');

-- === VENDA 11280: IPHONE 17 PRO 256GB SILVER NOVO (23/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('784de809-71a0-485c-8894-5c36d4347d1a', 'Apple', 'IPHONE 17 PRO 256GB SILVER NOVO', '352574671693388', 7700.0, 7300.0, 1, 'novo', 'perfeito', 'vendido', '2026-05-23', '2026-05-23', '0dd2c938-c6dd-4f5d-aac5-ed045ee5d2fb', '2026-05-23', '2026-05-23', 'Pagto junto (Aparelho 2/2, total grupo R$ 16,100)');
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('2846f914-353d-4479-8ef1-3452230e191f', 11280, current_setting('importacao.cliente_id')::uuid, 1, '0dd2c938-c6dd-4f5d-aac5-ed045ee5d2fb', 'concluida', 'normal', 7700.0, 7700.0, 0.0, '2026-05-23', '2026-05-23', '0dd2c938-c6dd-4f5d-aac5-ed045ee5d2fb');
UPDATE aparelhos SET venda_id = '2846f914-353d-4479-8ef1-3452230e191f' WHERE id = '784de809-71a0-485c-8894-5c36d4347d1a';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('c4ee7f5b-8248-4e39-ab06-8dcbf76f3d86', '2846f914-353d-4479-8ef1-3452230e191f', 'pix', 3700.0, '2026-05-23', '0dd2c938-c6dd-4f5d-aac5-ed045ee5d2fb', 1);
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, observacao, parcelas)
VALUES ('e0fe9a2d-7339-4dbb-a8eb-10558ea2adb7', '2846f914-353d-4479-8ef1-3452230e191f', 'troca_aparelho', 4000.0, '2026-05-23', '0dd2c938-c6dd-4f5d-aac5-ed045ee5d2fb', 'Troca: IPH 16 PRO 128GB DESERT', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('8fb7feac-3f96-49d9-a387-747240a316e1', 1, '2846f914-353d-4479-8ef1-3452230e191f', 'Brinde', 20.0, '2026-05-23', '0dd2c938-c6dd-4f5d-aac5-ed045ee5d2fb', '2026-05-23');

-- === VENDA 11281: IPHONE 17 PRO MAX 256GB SILVER NOVO (23/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('c54b458f-1e33-4965-b98c-15ce8249d2fe', 'Apple', 'IPHONE 17 PRO MAX 256GB SILVER NOVO', '351205740141759', 8200.0, 7850.0, 1, 'novo', 'perfeito', 'vendido', '2026-05-23', '2026-05-23', '0dd2c938-c6dd-4f5d-aac5-ed045ee5d2fb', '2026-05-23', '2026-05-23', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('583329a2-519a-4b4e-8e4b-1e671c8eafb8', 11281, current_setting('importacao.cliente_id')::uuid, 1, '0dd2c938-c6dd-4f5d-aac5-ed045ee5d2fb', 'concluida', 'normal', 8200.0, 8200.0, 0.0, '2026-05-23', '2026-05-23', '0dd2c938-c6dd-4f5d-aac5-ed045ee5d2fb');
UPDATE aparelhos SET venda_id = '583329a2-519a-4b4e-8e4b-1e671c8eafb8' WHERE id = 'c54b458f-1e33-4965-b98c-15ce8249d2fe';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('a01eec90-170d-486c-a9c8-be08f8f72b6d', '583329a2-519a-4b4e-8e4b-1e671c8eafb8', 'pix', 8200.0, '2026-05-23', '0dd2c938-c6dd-4f5d-aac5-ed045ee5d2fb', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('0c344286-da3a-4f10-844e-519d62ca1406', 1, '583329a2-519a-4b4e-8e4b-1e671c8eafb8', 'Brinde', 15.0, '2026-05-23', '0dd2c938-c6dd-4f5d-aac5-ed045ee5d2fb', '2026-05-23');

-- === VENDA 11282: IPHONE 15 PRO 256GB BRANCO SEMINOVO (23/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('fdb036b3-d10c-4daa-8707-10596eecd263', 'Apple', 'IPHONE 15 PRO 256GB BRANCO SEMINOVO', '350839531594007', 3600.0, 3400.0, 20, 'seminovo', 'bom', 'vendido', '2026-05-23', '2026-05-23', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', '2026-05-23', '2026-05-23', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('52ab266e-3bf9-434b-b096-91746ca480ab', 11282, current_setting('importacao.cliente_id')::uuid, 20, 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 'concluida', 'normal', 3600.0, 3600.0, 0.0, '2026-05-23', '2026-05-23', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4');
UPDATE aparelhos SET venda_id = '52ab266e-3bf9-434b-b096-91746ca480ab' WHERE id = 'fdb036b3-d10c-4daa-8707-10596eecd263';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('03cbec5f-3f71-4679-abee-40ae14aaf27c', '52ab266e-3bf9-434b-b096-91746ca480ab', 'pix', 3600.0, '2026-05-23', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 1);

-- === VENDA 11283: IPAD 11 128GB AZUL LACRADO (23/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('80a26589-e00f-468e-88fe-b01f2665da8e', 'Apple', 'IPAD 11 128GB AZUL LACRADO', 'MD7P7G9W9D', 2950.0, 2090.0, 1, 'novo', 'perfeito', 'vendido', '2026-05-23', '2026-05-23', '1d12d555-68e9-45f8-bfc0-a35a1d8d7920', '2026-05-23', '2026-05-23', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('16de2f6e-ae6d-48c0-ad4a-fa4d7982c0fe', 11283, current_setting('importacao.cliente_id')::uuid, 1, '1d12d555-68e9-45f8-bfc0-a35a1d8d7920', 'concluida', 'normal', 2950.0, 2950.0, 0.0, '2026-05-23', '2026-05-23', '1d12d555-68e9-45f8-bfc0-a35a1d8d7920');
UPDATE aparelhos SET venda_id = '16de2f6e-ae6d-48c0-ad4a-fa4d7982c0fe' WHERE id = '80a26589-e00f-468e-88fe-b01f2665da8e';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('3bbc7ca9-9400-44a6-9689-08b710a887eb', '16de2f6e-ae6d-48c0-ad4a-fa4d7982c0fe', 'pix', 2950.0, '2026-05-23', '1d12d555-68e9-45f8-bfc0-a35a1d8d7920', 1);

-- === VENDA 11284: GALAXY A56 5G 256GB PRETO LACRADO (23/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('1270ecf0-ae79-4a52-ad2d-dad8dab8899b', 'Outros', 'GALAXY A56 5G 256GB PRETO LACRADO', '351814335898119', 2100.0, 1900.0, 1, 'novo', 'perfeito', 'vendido', '2026-05-23', '2026-05-23', '9451cd9f-6770-4e32-aae8-c75fa675e818', '2026-05-23', '2026-05-23', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('4dc68be2-64a8-4714-be90-fbc93b2e7d5f', 11284, current_setting('importacao.cliente_id')::uuid, 1, '9451cd9f-6770-4e32-aae8-c75fa675e818', 'concluida', 'normal', 2100.0, 2100.0, 0.0, '2026-05-23', '2026-05-23', '9451cd9f-6770-4e32-aae8-c75fa675e818');
UPDATE aparelhos SET venda_id = '4dc68be2-64a8-4714-be90-fbc93b2e7d5f' WHERE id = '1270ecf0-ae79-4a52-ad2d-dad8dab8899b';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('a5b0d7cd-a021-4003-b6ea-907baf283668', '4dc68be2-64a8-4714-be90-fbc93b2e7d5f', 'pix', 2100.0, '2026-05-23', '9451cd9f-6770-4e32-aae8-c75fa675e818', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('fbe65cff-3e1e-403c-bd0f-6f175d274316', 1, '4dc68be2-64a8-4714-be90-fbc93b2e7d5f', 'Brinde', 15.0, '2026-05-23', '9451cd9f-6770-4e32-aae8-c75fa675e818', '2026-05-23');

-- === VENDA 11285: IPHONE 13 128GB BRANCO SEMINOVO (23/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('de672c85-0798-469d-88e3-c20dc98e70cc', 'Apple', 'IPHONE 13 128GB BRANCO SEMINOVO', '359551273163864', 1900.0, 1780.0, 19, 'seminovo', 'bom', 'vendido', '2026-05-23', '2026-05-23', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-23', '2026-05-23', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('1bc8a099-6f12-42ae-936f-d25462a19f0c', 11285, current_setting('importacao.cliente_id')::uuid, 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 1900.0, 1900.0, 0.0, '2026-05-23', '2026-05-23', '97f12885-87ad-426a-8bbb-656889d82e10');
UPDATE aparelhos SET venda_id = '1bc8a099-6f12-42ae-936f-d25462a19f0c' WHERE id = 'de672c85-0798-469d-88e3-c20dc98e70cc';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('87c5aaa2-a25b-446e-b043-c85b2ff7f7be', '1bc8a099-6f12-42ae-936f-d25462a19f0c', 'pix', 1900.0, '2026-05-23', '97f12885-87ad-426a-8bbb-656889d82e10', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('3e485d7b-4658-4075-8fd1-61be41eb1c85', 19, '1bc8a099-6f12-42ae-936f-d25462a19f0c', 'Brinde', 25.0, '2026-05-23', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-23');

-- === VENDA 11286: IPHONE 17 PRO 256GB AZUL NOVO (23/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('1ef45449-1362-467d-a3f7-d55c051f5d1b', 'Apple', 'IPHONE 17 PRO 256GB AZUL NOVO', '352574671224184', 7530.0, 7300.0, 19, 'novo', 'perfeito', 'vendido', '2026-05-23', '2026-05-23', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-23', '2026-05-23', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('db1169f1-5b84-4d62-b8d2-3e12225b455c', 11286, current_setting('importacao.cliente_id')::uuid, 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 7530.0, 7530.0, 0.0, '2026-05-23', '2026-05-23', '97f12885-87ad-426a-8bbb-656889d82e10');
UPDATE aparelhos SET venda_id = 'db1169f1-5b84-4d62-b8d2-3e12225b455c' WHERE id = '1ef45449-1362-467d-a3f7-d55c051f5d1b';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('f7199d7c-ef70-4a00-9078-3456e0a14f06', 'db1169f1-5b84-4d62-b8d2-3e12225b455c', 'pix', 7530.0, '2026-05-23', '97f12885-87ad-426a-8bbb-656889d82e10', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('76628870-c208-4667-b8c3-f512a2346735', 19, 'db1169f1-5b84-4d62-b8d2-3e12225b455c', 'Brinde', 20.0, '2026-05-23', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-23');

-- === VENDA 11287: IPHONE 17 PRO MAX 256GB SILVER NOVO (23/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('7c0aadbe-7def-4f3b-8d6b-6bd1451912ff', 'Apple', 'IPHONE 17 PRO MAX 256GB SILVER NOVO', '351668145588454', 8150.0, 8000.0, 19, 'novo', 'perfeito', 'vendido', '2026-05-23', '2026-05-23', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-23', '2026-05-23', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('8f4c1800-f8e3-4a86-a836-bf75f6e229da', 11287, current_setting('importacao.cliente_id')::uuid, 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 8150.0, 8150.0, 0.0, '2026-05-23', '2026-05-23', '97f12885-87ad-426a-8bbb-656889d82e10');
UPDATE aparelhos SET venda_id = '8f4c1800-f8e3-4a86-a836-bf75f6e229da' WHERE id = '7c0aadbe-7def-4f3b-8d6b-6bd1451912ff';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('65b8b7fc-4046-40c2-87b6-49cb37ac0be8', '8f4c1800-f8e3-4a86-a836-bf75f6e229da', 'pix', 4600.0, '2026-05-23', '97f12885-87ad-426a-8bbb-656889d82e10', 1);
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('8ebd03a9-f49c-420a-8b1b-78fc61c1eae3', '8f4c1800-f8e3-4a86-a836-bf75f6e229da', 'cartao_credito', 3550.0, '2026-05-23', '97f12885-87ad-426a-8bbb-656889d82e10', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('93b7237a-c81c-423c-b6f0-2a0bead7adf0', 19, '8f4c1800-f8e3-4a86-a836-bf75f6e229da', 'Brinde', 20.0, '2026-05-23', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-23');

-- === VENDA 11288: IPHONE 14 PRO MAX 512GB SEMINOVO (23/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('dd5c892a-105b-4038-a614-f56369fbf0c1', 'Apple', 'IPHONE 14 PRO MAX 512GB SEMINOVO', '357938436579106', 3730.0, 2500.0, 19, 'seminovo', 'bom', 'vendido', '2026-05-23', '2026-05-23', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-23', '2026-05-23', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('4e36cdb2-f8cc-4ef5-8145-4384eef3d9f5', 11288, current_setting('importacao.cliente_id')::uuid, 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 3730.0, 3730.0, 0.0, '2026-05-23', '2026-05-23', '97f12885-87ad-426a-8bbb-656889d82e10');
UPDATE aparelhos SET venda_id = '4e36cdb2-f8cc-4ef5-8145-4384eef3d9f5' WHERE id = 'dd5c892a-105b-4038-a614-f56369fbf0c1';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('f21d5494-57f7-4830-b512-717a6b587dd3', '4e36cdb2-f8cc-4ef5-8145-4384eef3d9f5', 'pix', 2000.0, '2026-05-23', '97f12885-87ad-426a-8bbb-656889d82e10', 1);
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('eb08934f-da51-46dc-a391-fc83d1e057c7', '4e36cdb2-f8cc-4ef5-8145-4384eef3d9f5', 'cartao_credito', 1730.0, '2026-05-23', '97f12885-87ad-426a-8bbb-656889d82e10', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('4fc104ae-9bb8-457c-b086-9e268f4f22d8', 19, '4e36cdb2-f8cc-4ef5-8145-4384eef3d9f5', 'Brinde', 25.0, '2026-05-23', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-23');

-- === VENDA 11289: IPHONE XR 64GB PRETO SEMINOVO (23/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('dd499007-b6c5-44b9-b3a4-8314199294fd', 'Apple', 'IPHONE XR 64GB PRETO SEMINOVO', '356827112692377', 600.0, 500.0, 19, 'seminovo', 'bom', 'vendido', '2026-05-23', '2026-05-23', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-23', '2026-05-23', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('18f31b64-ef77-43e8-9787-9cd7ceb3142f', 11289, current_setting('importacao.cliente_id')::uuid, 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 600.0, 600.0, 0.0, '2026-05-23', '2026-05-23', '97f12885-87ad-426a-8bbb-656889d82e10');
UPDATE aparelhos SET venda_id = '18f31b64-ef77-43e8-9787-9cd7ceb3142f' WHERE id = 'dd499007-b6c5-44b9-b3a4-8314199294fd';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('9def33cf-f88c-4dfc-bf16-d4e358af913e', '18f31b64-ef77-43e8-9787-9cd7ceb3142f', 'pix', 600.0, '2026-05-23', '97f12885-87ad-426a-8bbb-656889d82e10', 1);

-- === VENDA 11290: IPHONE 16 PRO MAX 1T DESERT SEMINOVO (23/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('4f2e3e34-b34a-4864-b33b-86e238d16f74', 'Apple', 'IPHONE 16 PRO MAX 1T DESERT SEMINOVO', '355067542298807', 5850.0, 5300.0, 19, 'seminovo', 'bom', 'vendido', '2026-05-23', '2026-05-23', '85743f3e-1b32-49c0-9d9e-c16afd690f7d', '2026-05-23', '2026-05-23', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('765e520b-1d2a-4b4e-afcb-ad006ab9b085', 11290, current_setting('importacao.cliente_id')::uuid, 19, '85743f3e-1b32-49c0-9d9e-c16afd690f7d', 'concluida', 'normal', 5850.0, 5850.0, 0.0, '2026-05-23', '2026-05-23', '85743f3e-1b32-49c0-9d9e-c16afd690f7d');
UPDATE aparelhos SET venda_id = '765e520b-1d2a-4b4e-afcb-ad006ab9b085' WHERE id = '4f2e3e34-b34a-4864-b33b-86e238d16f74';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('21b38f6f-b159-4007-b211-35a3723d19f0', '765e520b-1d2a-4b4e-afcb-ad006ab9b085', 'pix', 5850.0, '2026-05-23', '85743f3e-1b32-49c0-9d9e-c16afd690f7d', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('3212336d-71db-4d1f-8b3d-6a20c1c07f0d', 19, '765e520b-1d2a-4b4e-afcb-ad006ab9b085', 'Brinde', 40.0, '2026-05-23', '85743f3e-1b32-49c0-9d9e-c16afd690f7d', '2026-05-23');

-- === VENDA 11291: IPHONE 16 PRO MAX 512GB PRETO SEMINOVO (23/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('4466bd5b-a7c2-424e-a23d-b91e36b5c3b6', 'Apple', 'IPHONE 16 PRO MAX 512GB PRETO SEMINOVO', '354276357875838', 5389.0, 5150.0, 1, 'seminovo', 'bom', 'vendido', '2026-05-23', '2026-05-23', 'e07d4d35-1381-4d4d-914d-8382a7456fdd', '2026-05-23', '2026-05-23', 'Pagto junto (Aparelho 1/2, total grupo R$ 10,889)');
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('93e8a219-3cac-4505-b4a9-3bc2bb4962b4', 11291, current_setting('importacao.cliente_id')::uuid, 1, 'e07d4d35-1381-4d4d-914d-8382a7456fdd', 'concluida', 'normal', 5389.0, 5389.0, 0.0, '2026-05-23', '2026-05-23', 'e07d4d35-1381-4d4d-914d-8382a7456fdd');
UPDATE aparelhos SET venda_id = '93e8a219-3cac-4505-b4a9-3bc2bb4962b4' WHERE id = '4466bd5b-a7c2-424e-a23d-b91e36b5c3b6';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('20bc191e-9481-4780-87d0-53fb3ce3b3fb', '93e8a219-3cac-4505-b4a9-3bc2bb4962b4', 'cartao_credito', 5389.0, '2026-05-23', 'e07d4d35-1381-4d4d-914d-8382a7456fdd', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('656c0eb4-0f07-4e3e-a1a5-6a7dbfcd9572', 1, '93e8a219-3cac-4505-b4a9-3bc2bb4962b4', 'Brinde', 25.0, '2026-05-23', 'e07d4d35-1381-4d4d-914d-8382a7456fdd', '2026-05-23');

-- === VENDA 11292: IPHONE 16 PRO MAX 1TB DESERT SEMINOVO (23/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('10d8e9df-a8e5-4774-a753-66d425da3e72', 'Apple', 'IPHONE 16 PRO MAX 1TB DESERT SEMINOVO', '355067542462973', 5500.0, 5300.0, 1, 'seminovo', 'bom', 'vendido', '2026-05-23', '2026-05-23', 'e07d4d35-1381-4d4d-914d-8382a7456fdd', '2026-05-23', '2026-05-23', 'Pagto junto (Aparelho 2/2, total grupo R$ 10,889)');
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('8bc07b6d-c4a2-45b1-83e0-cddaa7262270', 11292, current_setting('importacao.cliente_id')::uuid, 1, 'e07d4d35-1381-4d4d-914d-8382a7456fdd', 'concluida', 'normal', 5500.0, 5500.0, 0.0, '2026-05-23', '2026-05-23', 'e07d4d35-1381-4d4d-914d-8382a7456fdd');
UPDATE aparelhos SET venda_id = '8bc07b6d-c4a2-45b1-83e0-cddaa7262270' WHERE id = '10d8e9df-a8e5-4774-a753-66d425da3e72';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('03bb64a4-91fb-4c8f-a815-fef5009a7fd2', '8bc07b6d-c4a2-45b1-83e0-cddaa7262270', 'cartao_credito', 5500.0, '2026-05-23', 'e07d4d35-1381-4d4d-914d-8382a7456fdd', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('4f27b49b-779b-4c99-9b0c-22d159faaa83', 1, '8bc07b6d-c4a2-45b1-83e0-cddaa7262270', 'Brinde', 25.0, '2026-05-23', 'e07d4d35-1381-4d4d-914d-8382a7456fdd', '2026-05-23');

-- === VENDA 11293: IPHONE 16 PRO 128GB DESERT SEMINOVO (23/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('ae7b61ec-b25e-4755-baab-3a839b41879d', 'Apple', 'IPHONE 16 PRO 128GB DESERT SEMINOVO', '350059638923591', 4450.0, 4200.0, 20, 'seminovo', 'bom', 'vendido', '2026-05-23', '2026-05-23', '25e2da5b-9e76-4388-9890-7e22efd6940d', '2026-05-23', '2026-05-23', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('1edcd750-3638-487e-be13-896ffc1ae93c', 11293, current_setting('importacao.cliente_id')::uuid, 20, '25e2da5b-9e76-4388-9890-7e22efd6940d', 'concluida', 'normal', 4450.0, 4450.0, 0.0, '2026-05-23', '2026-05-23', '25e2da5b-9e76-4388-9890-7e22efd6940d');
UPDATE aparelhos SET venda_id = '1edcd750-3638-487e-be13-896ffc1ae93c' WHERE id = 'ae7b61ec-b25e-4755-baab-3a839b41879d';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('4415d24a-274d-407b-812a-a07dee700ac9', '1edcd750-3638-487e-be13-896ffc1ae93c', 'cartao_credito', 4450.0, '2026-05-23', '25e2da5b-9e76-4388-9890-7e22efd6940d', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('1fbda781-ca91-43fd-a9f5-a167240cfc42', 20, '1edcd750-3638-487e-be13-896ffc1ae93c', 'Brinde', 20.0, '2026-05-23', '25e2da5b-9e76-4388-9890-7e22efd6940d', '2026-05-23');

-- === VENDA 11294: IPHONE 12 64GB LILAS SEMINOVO (23/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('17646d6f-4018-4af8-a50f-926c67b5ee5f', 'Apple', 'IPHONE 12 64GB LILAS SEMINOVO', '353342880337604', 1350.0, 1150.0, 20, 'seminovo', 'bom', 'vendido', '2026-05-23', '2026-05-23', '25e2da5b-9e76-4388-9890-7e22efd6940d', '2026-05-23', '2026-05-23', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('d1805136-4e27-4ac6-94b0-2deddb6f0346', 11294, current_setting('importacao.cliente_id')::uuid, 20, '25e2da5b-9e76-4388-9890-7e22efd6940d', 'concluida', 'normal', 1350.0, 1350.0, 0.0, '2026-05-23', '2026-05-23', '25e2da5b-9e76-4388-9890-7e22efd6940d');
UPDATE aparelhos SET venda_id = 'd1805136-4e27-4ac6-94b0-2deddb6f0346' WHERE id = '17646d6f-4018-4af8-a50f-926c67b5ee5f';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('7c218c11-6d70-42d2-840d-26c139c8c1c7', 'd1805136-4e27-4ac6-94b0-2deddb6f0346', 'cartao_credito', 1350.0, '2026-05-23', '25e2da5b-9e76-4388-9890-7e22efd6940d', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('22a9deef-e024-45f0-a86a-de2adbc80661', 20, 'd1805136-4e27-4ac6-94b0-2deddb6f0346', 'Brinde', 25.0, '2026-05-23', '25e2da5b-9e76-4388-9890-7e22efd6940d', '2026-05-23');

-- === VENDA 11295: POCO C85 PRETO 256GB NOVO (23/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('002edddc-d46e-4d6b-89af-3420f2fcd929', 'Outros', 'POCO C85 PRETO 256GB NOVO', '864280086544668', 997.0, 880.0, 1, 'novo', 'perfeito', 'vendido', '2026-05-23', '2026-05-23', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-23', '2026-05-23', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('d6b718ca-b0ec-4e7b-a71a-8996cff4e66b', 11295, current_setting('importacao.cliente_id')::uuid, 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 997.0, 997.0, 0.0, '2026-05-23', '2026-05-23', '85e3aa42-b9af-49b8-a72a-64e9c337aa53');
UPDATE aparelhos SET venda_id = 'd6b718ca-b0ec-4e7b-a71a-8996cff4e66b' WHERE id = '002edddc-d46e-4d6b-89af-3420f2fcd929';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('1930d949-3f2d-490c-9641-df2c91c76689', 'd6b718ca-b0ec-4e7b-a71a-8996cff4e66b', 'pix', 997.0, '2026-05-23', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 1);

-- === VENDA 11296: TV Q LED TCL P7K (23/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('cad253fc-fac8-4ad4-87dd-80fd295bc159', 'Outros', 'TV Q LED TCL P7K', 'TVQLEDP7KTCL', 4600.0, 3850.0, 1, 'seminovo', 'bom', 'vendido', '2026-05-23', '2026-05-23', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-23', '2026-05-23', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('0534ce93-cd58-4f26-a94e-dd8f0a7be2fe', 11296, current_setting('importacao.cliente_id')::uuid, 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 4600.0, 4600.0, 0.0, '2026-05-23', '2026-05-23', '85e3aa42-b9af-49b8-a72a-64e9c337aa53');
UPDATE aparelhos SET venda_id = '0534ce93-cd58-4f26-a94e-dd8f0a7be2fe' WHERE id = 'cad253fc-fac8-4ad4-87dd-80fd295bc159';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('af21b162-5c3c-4e24-b4a4-6206681a31a7', '0534ce93-cd58-4f26-a94e-dd8f0a7be2fe', 'pix', 2800.0, '2026-05-23', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 1);
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, observacao, parcelas)
VALUES ('ce3178b6-eb64-4967-9745-be4002abce51', '0534ce93-cd58-4f26-a94e-dd8f0a7be2fe', 'troca_aparelho', 1800.0, '2026-05-23', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'Troca: IPH 13 128GB ROSA', 1);

-- === VENDA 11297: IPHONE 14 PLUS 128GB LILAS SEMINOVO (24/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('370f60d6-47c1-4932-9e84-371ab17afe6c', 'Apple', 'IPHONE 14 PLUS 128GB LILAS SEMINOVO', '358257930308303', 2400.0, 2150.0, 1, 'seminovo', 'bom', 'vendido', '2026-05-24', '2026-05-24', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-24', '2026-05-24', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('6ff1f2ec-2d7d-4e7c-bf8a-48395da32519', 11297, current_setting('importacao.cliente_id')::uuid, 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 2400.0, 2400.0, 0.0, '2026-05-24', '2026-05-24', '85e3aa42-b9af-49b8-a72a-64e9c337aa53');
UPDATE aparelhos SET venda_id = '6ff1f2ec-2d7d-4e7c-bf8a-48395da32519' WHERE id = '370f60d6-47c1-4932-9e84-371ab17afe6c';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('a1b00160-4756-4ff9-a93b-599f924bdee8', '6ff1f2ec-2d7d-4e7c-bf8a-48395da32519', 'pix', 2400.0, '2026-05-24', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('851303b6-eb48-4ef8-ad20-f8a922ceeae6', 1, '6ff1f2ec-2d7d-4e7c-bf8a-48395da32519', 'Brinde', 25.0, '2026-05-24', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-24');

-- === VENDA 11298: REDMI NOTE 15 PRO 5G 256GB PRETO NOVO (24/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('6a0a884a-f05a-426b-bdfb-4366508707b2', 'Xiaomi', 'REDMI NOTE 15 PRO 5G 256GB PRETO NOVO', '863573084082744', 1850.0, 1660.0, 4, 'novo', 'perfeito', 'vendido', '2026-05-24', '2026-05-24', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-24', '2026-05-24', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('e7aca69f-c70e-4667-9eef-c9885ab64c79', 11298, current_setting('importacao.cliente_id')::uuid, 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 1850.0, 1850.0, 0.0, '2026-05-24', '2026-05-24', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
UPDATE aparelhos SET venda_id = 'e7aca69f-c70e-4667-9eef-c9885ab64c79' WHERE id = '6a0a884a-f05a-426b-bdfb-4366508707b2';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('fffe52f5-aa97-4e9b-8750-961c91e4d94f', 'e7aca69f-c70e-4667-9eef-c9885ab64c79', 'pix', 1850.0, '2026-05-24', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1);

-- === VENDA 11299: IPHONE 15 PRO MAX 256GB AZUL SEMINOVO (24/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('a1780a85-75dd-4f76-aa12-17b42f9400e9', 'Apple', 'IPHONE 15 PRO MAX 256GB AZUL SEMINOVO', '354773167256449', 4093.0, 3700.0, 4, 'seminovo', 'bom', 'vendido', '2026-05-24', '2026-05-24', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-24', '2026-05-24', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('2db3ba29-98d5-4fe5-909d-1e17fbf59425', 11299, current_setting('importacao.cliente_id')::uuid, 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 4093.0, 4093.0, 0.0, '2026-05-24', '2026-05-24', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
UPDATE aparelhos SET venda_id = '2db3ba29-98d5-4fe5-909d-1e17fbf59425' WHERE id = 'a1780a85-75dd-4f76-aa12-17b42f9400e9';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('28f10063-c263-44e6-a580-6d419f92a9a3', '2db3ba29-98d5-4fe5-909d-1e17fbf59425', 'pix', 2500.0, '2026-05-24', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1);
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('029b5a6a-f48f-4d3e-b7a1-10aa2aa551e7', '2db3ba29-98d5-4fe5-909d-1e17fbf59425', 'cartao_credito', 1593.0, '2026-05-24', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('5a0e44c2-02bb-4dbf-a779-e12ae141b089', 4, '2db3ba29-98d5-4fe5-909d-1e17fbf59425', 'Brinde', 50.0, '2026-05-24', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-24');

-- === VENDA 11300: IPHONE 17 PRO MAX 256GB AZUL LACRADO (24/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('7fc70cc8-2894-4573-bd90-f17806643c00', 'Apple', 'IPHONE 17 PRO MAX 256GB AZUL LACRADO', '359652122041986', 7800.0, 7650.0, 1, 'novo', 'perfeito', 'vendido', '2026-05-24', '2026-05-24', '9451cd9f-6770-4e32-aae8-c75fa675e818', '2026-05-24', '2026-05-24', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('8ab5879f-e377-4497-82c6-9b1a10a3e8e1', 11300, current_setting('importacao.cliente_id')::uuid, 1, '9451cd9f-6770-4e32-aae8-c75fa675e818', 'concluida', 'normal', 7800.0, 7800.0, 0.0, '2026-05-24', '2026-05-24', '9451cd9f-6770-4e32-aae8-c75fa675e818');
UPDATE aparelhos SET venda_id = '8ab5879f-e377-4497-82c6-9b1a10a3e8e1' WHERE id = '7fc70cc8-2894-4573-bd90-f17806643c00';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('8125acea-4dba-402e-bfef-a0cb3c4156b1', '8ab5879f-e377-4497-82c6-9b1a10a3e8e1', 'pix', 7800.0, '2026-05-24', '9451cd9f-6770-4e32-aae8-c75fa675e818', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('96afef47-fcce-4952-a2b0-99397f960199', 1, '8ab5879f-e377-4497-82c6-9b1a10a3e8e1', 'Brinde', 5.0, '2026-05-24', '9451cd9f-6770-4e32-aae8-c75fa675e818', '2026-05-24');

-- === VENDA 11301: IPHONE 16 PRO MAX 512GB PRETO SEMINOVO (24/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('744eb9b4-ab4d-4ec7-b5da-13548fe1d399', 'Apple', 'IPHONE 16 PRO MAX 512GB PRETO SEMINOVO', '352641353019966', 5500.0, 5150.0, 4, 'seminovo', 'bom', 'vendido', '2026-05-24', '2026-05-24', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-24', '2026-05-24', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('1e852b00-fe1e-4514-9cd4-6ed668f5ca85', 11301, current_setting('importacao.cliente_id')::uuid, 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 5500.0, 5500.0, 0.0, '2026-05-24', '2026-05-24', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
UPDATE aparelhos SET venda_id = '1e852b00-fe1e-4514-9cd4-6ed668f5ca85' WHERE id = '744eb9b4-ab4d-4ec7-b5da-13548fe1d399';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('76e63a86-5350-4dbd-a30f-ff6e6302d5ca', '1e852b00-fe1e-4514-9cd4-6ed668f5ca85', 'cartao_credito', 2400.0, '2026-05-24', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1);
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, observacao, parcelas)
VALUES ('4243aeb2-ce15-492d-8e03-f39fc82cefdb', '1e852b00-fe1e-4514-9cd4-6ed668f5ca85', 'troca_aparelho', 3100.0, '2026-05-24', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'Troca: UM 16 128 SEMINOVO', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('b816eae0-3749-4a5d-8688-7c625c8a159d', 4, '1e852b00-fe1e-4514-9cd4-6ed668f5ca85', 'Brinde', 25.0, '2026-05-24', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-24');

-- === VENDA 11302: IPHONE 17 PRO MAX 256GB AZUL NOVO (24/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('92ac5a87-5ab6-43f2-8ee5-28ebefd00398', 'Apple', 'IPHONE 17 PRO MAX 256GB AZUL NOVO', '353314497716249', 7860.0, 7650.0, 4, 'novo', 'perfeito', 'vendido', '2026-05-24', '2026-05-24', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-24', '2026-05-24', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('059750b6-4761-49a8-a5f4-60a88316d0b2', 11302, current_setting('importacao.cliente_id')::uuid, 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 7860.0, 7860.0, 0.0, '2026-05-24', '2026-05-24', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
UPDATE aparelhos SET venda_id = '059750b6-4761-49a8-a5f4-60a88316d0b2' WHERE id = '92ac5a87-5ab6-43f2-8ee5-28ebefd00398';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('c8aec735-a3a6-4d85-ba0d-2dafb53ae91c', '059750b6-4761-49a8-a5f4-60a88316d0b2', 'pix', 7860.0, '2026-05-24', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('49acc87e-a560-4515-b730-599489f104f6', 4, '059750b6-4761-49a8-a5f4-60a88316d0b2', 'Brinde', 45.0, '2026-05-24', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-24');

-- === VENDA 11303: IPAD AIR M4 11° SPACE GRAY NOVO (24/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('1af83f81-680d-4860-b3a4-362f5e0e5526', 'Apple', 'IPAD AIR M4 11° SPACE GRAY NOVO', 'DGM6TN696L', 3900.0, 3650.0, 4, 'novo', 'perfeito', 'vendido', '2026-05-24', '2026-05-24', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-24', '2026-05-24', 'Pagto junto (Aparelho 1/1, total grupo R$ 3,900)');
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('0f8c700f-b755-4353-ab6e-51f7e3d342fc', 11303, current_setting('importacao.cliente_id')::uuid, 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 3900.0, 3900.0, 0.0, '2026-05-24', '2026-05-24', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
UPDATE aparelhos SET venda_id = '0f8c700f-b755-4353-ab6e-51f7e3d342fc' WHERE id = '1af83f81-680d-4860-b3a4-362f5e0e5526';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('9f136c00-437b-4cf8-8da3-8ad47ad014fd', '0f8c700f-b755-4353-ab6e-51f7e3d342fc', 'pix', 3900.0, '2026-05-24', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('b477a8f0-e193-4c69-ab72-682c9659bdef', 4, '0f8c700f-b755-4353-ab6e-51f7e3d342fc', 'Brinde', 30.0, '2026-05-24', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-24');

-- === VENDA 11304: AIPORDS PRO 3 BRANCO NOVO (24/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('afcd6bef-59d7-4fd6-8939-a35549c75577', 'Outros', 'AIPORDS PRO 3 BRANCO NOVO', 'DKQV09VNQJ', 1520.0, 1435.0, 4, 'novo', 'perfeito', 'vendido', '2026-05-24', '2026-05-24', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-24', '2026-05-24', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('c3ec78ea-a179-4dd5-86e8-74e3ef9258fc', 11304, current_setting('importacao.cliente_id')::uuid, 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 1520.0, 1520.0, 0.0, '2026-05-24', '2026-05-24', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
UPDATE aparelhos SET venda_id = 'c3ec78ea-a179-4dd5-86e8-74e3ef9258fc' WHERE id = 'afcd6bef-59d7-4fd6-8939-a35549c75577';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('0bd8d168-587d-42d8-8493-2a93d9abbf59', 'c3ec78ea-a179-4dd5-86e8-74e3ef9258fc', 'pix', 1520.0, '2026-05-24', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1);

-- === VENDA 11305: REDMI NOTE 15 PRO 4G 512GB TITANIO NOVO (24/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('d69c1e0f-e061-40b5-bbad-abad4239a599', 'Xiaomi', 'REDMI NOTE 15 PRO 4G 512GB TITANIO NOVO', '863911087323881', 1900.0, 1800.0, 4, 'novo', 'perfeito', 'vendido', '2026-05-24', '2026-05-24', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-24', '2026-05-24', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('87cbbfed-4449-40a8-a5d1-ad0b0e3a5821', 11305, current_setting('importacao.cliente_id')::uuid, 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 1900.0, 1900.0, 0.0, '2026-05-24', '2026-05-24', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
UPDATE aparelhos SET venda_id = '87cbbfed-4449-40a8-a5d1-ad0b0e3a5821' WHERE id = 'd69c1e0f-e061-40b5-bbad-abad4239a599';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('ccb0f0aa-4510-4b18-ab47-d3fb7e416f74', '87cbbfed-4449-40a8-a5d1-ad0b0e3a5821', 'pix', 900.0, '2026-05-24', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1);
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('851ef4c1-1a73-4968-ba93-418f36f60370', '87cbbfed-4449-40a8-a5d1-ad0b0e3a5821', 'dinheiro', 1000.0, '2026-05-24', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('88f565eb-251c-41db-9fe5-60233d077248', 4, '87cbbfed-4449-40a8-a5d1-ad0b0e3a5821', 'Brinde', 5.0, '2026-05-24', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-24');

-- === VENDA 11306: IPHONE 17 PRO 256GB SILVER SEMINOVO (24/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('45811954-7963-4cd3-9e33-34a829ee5bbd', 'Apple', 'IPHONE 17 PRO 256GB SILVER SEMINOVO', '350455778567174', 6750.0, 6100.0, 20, 'seminovo', 'bom', 'vendido', '2026-05-24', '2026-05-24', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', '2026-05-24', '2026-05-24', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('9838e0b6-a72c-40dd-bc6e-3178ccd8d0c1', 11306, current_setting('importacao.cliente_id')::uuid, 20, 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 'concluida', 'normal', 6750.0, 6750.0, 0.0, '2026-05-24', '2026-05-24', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4');
UPDATE aparelhos SET venda_id = '9838e0b6-a72c-40dd-bc6e-3178ccd8d0c1' WHERE id = '45811954-7963-4cd3-9e33-34a829ee5bbd';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('e892ef9b-38e5-4194-ae65-495737960280', '9838e0b6-a72c-40dd-bc6e-3178ccd8d0c1', 'cartao_credito', 3650.0, '2026-05-24', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 1);
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, observacao, parcelas)
VALUES ('00da4f97-82a1-47f0-a7f8-899e9ea53838', '9838e0b6-a72c-40dd-bc6e-3178ccd8d0c1', 'troca_aparelho', 3100.0, '2026-05-24', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 'Troca: 15 PRO 256 AZUL', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('531bc5d7-3f96-4997-ba91-8cb4944c1009', 20, '9838e0b6-a72c-40dd-bc6e-3178ccd8d0c1', 'Brinde', 10.0, '2026-05-24', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', '2026-05-24');

-- === VENDA 11307: IPHONE 13 PRO 128GB SEMINOVO (24/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('dc128241-aed9-4331-a684-aca070e0599c', 'Apple', 'IPHONE 13 PRO 128GB SEMINOVO', '354903621734992', 2400.0, 2300.0, 19, 'seminovo', 'bom', 'vendido', '2026-05-24', '2026-05-24', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-24', '2026-05-24', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('bfdf74cd-a131-464d-a4f0-b4bff97f4893', 11307, current_setting('importacao.cliente_id')::uuid, 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 2400.0, 2400.0, 0.0, '2026-05-24', '2026-05-24', '97f12885-87ad-426a-8bbb-656889d82e10');
UPDATE aparelhos SET venda_id = 'bfdf74cd-a131-464d-a4f0-b4bff97f4893' WHERE id = 'dc128241-aed9-4331-a684-aca070e0599c';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('69b7239f-da21-4ab5-abdf-addda87ba22c', 'bfdf74cd-a131-464d-a4f0-b4bff97f4893', 'dinheiro', 2400.0, '2026-05-24', '97f12885-87ad-426a-8bbb-656889d82e10', 1);

-- === VENDA 11308: IPHONE 13 128GB AZUL SEMINOVO (24/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('eeb0e944-57f4-4ea7-8406-922096b8f3bc', 'Apple', 'IPHONE 13 128GB AZUL SEMINOVO', '350196694023757', 2075.0, 1780.0, 19, 'seminovo', 'bom', 'vendido', '2026-05-24', '2026-05-24', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-24', '2026-05-24', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('adb66c35-f37e-4f31-af77-cc269f26d9e0', 11308, current_setting('importacao.cliente_id')::uuid, 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 2075.0, 2075.0, 0.0, '2026-05-24', '2026-05-24', '97f12885-87ad-426a-8bbb-656889d82e10');
UPDATE aparelhos SET venda_id = 'adb66c35-f37e-4f31-af77-cc269f26d9e0' WHERE id = 'eeb0e944-57f4-4ea7-8406-922096b8f3bc';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('351562a6-a066-409e-978f-3a43b44b7f0a', 'adb66c35-f37e-4f31-af77-cc269f26d9e0', 'cartao_credito', 2075.0, '2026-05-24', '97f12885-87ad-426a-8bbb-656889d82e10', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('e84f5992-d2f2-4711-8119-5d2a4456ffdc', 19, 'adb66c35-f37e-4f31-af77-cc269f26d9e0', 'Brinde', 25.0, '2026-05-24', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-24');

-- === VENDA 11309: IPHONE 17 PRO MAX 256GB NOVO (24/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('2752e328-5bbf-48ea-be7d-185480546af0', 'Apple', 'IPHONE 17 PRO MAX 256GB NOVO', '353763614060768', 7875.0, 7650.0, 19, 'novo', 'perfeito', 'vendido', '2026-05-24', '2026-05-24', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-24', '2026-05-24', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('78124c55-75ad-4f7e-8c64-6b64c2dd7b4b', 11309, current_setting('importacao.cliente_id')::uuid, 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 7875.0, 7875.0, 0.0, '2026-05-24', '2026-05-24', '97f12885-87ad-426a-8bbb-656889d82e10');
UPDATE aparelhos SET venda_id = '78124c55-75ad-4f7e-8c64-6b64c2dd7b4b' WHERE id = '2752e328-5bbf-48ea-be7d-185480546af0';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('49dfc805-d2da-4418-889b-807d375ac89b', '78124c55-75ad-4f7e-8c64-6b64c2dd7b4b', 'cartao_credito', 7875.0, '2026-05-24', '97f12885-87ad-426a-8bbb-656889d82e10', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('bdb16fb7-724a-40f1-b850-8bedc2858d47', 19, '78124c55-75ad-4f7e-8c64-6b64c2dd7b4b', 'Brinde', 25.0, '2026-05-24', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-24');

-- === VENDA 11310: IPHONE 17 PRO MAX 256GB SILVER NOVO (24/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('eb078b35-bf51-4909-9a85-8ae03ddc927d', 'Apple', 'IPHONE 17 PRO MAX 256GB SILVER NOVO', '357247256152923', 7950.0, 7850.0, 19, 'novo', 'perfeito', 'vendido', '2026-05-24', '2026-05-24', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-24', '2026-05-24', 'Pagto junto (Aparelho 1/4, total grupo R$ 12,500)');
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('b8dfb583-5d4b-43c8-ad53-e7fc4a57163b', 11310, current_setting('importacao.cliente_id')::uuid, 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 7950.0, 7950.0, 0.0, '2026-05-24', '2026-05-24', '97f12885-87ad-426a-8bbb-656889d82e10');
UPDATE aparelhos SET venda_id = 'b8dfb583-5d4b-43c8-ad53-e7fc4a57163b' WHERE id = 'eb078b35-bf51-4909-9a85-8ae03ddc927d';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('132fc2d6-e3f1-438e-90ce-60ee51b94ea8', 'b8dfb583-5d4b-43c8-ad53-e7fc4a57163b', 'pix', 7950.0, '2026-05-24', '97f12885-87ad-426a-8bbb-656889d82e10', 1);

-- === VENDA 11311: APPLE PENCIL USB C NOVO (24/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('e8caaa55-98cd-4a2e-8a76-e01c7812ba3b', 'Apple', 'APPLE PENCIL USB C NOVO', 'H4719R9MG2', 770.0, 630.0, 19, 'novo', 'perfeito', 'vendido', '2026-05-24', '2026-05-24', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-24', '2026-05-24', 'Pagto junto (Aparelho 2/4, total grupo R$ 12,500)');
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('2aab1d0a-a71b-42f5-805c-089e0fc1e6d9', 11311, current_setting('importacao.cliente_id')::uuid, 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 770.0, 770.0, 0.0, '2026-05-24', '2026-05-24', '97f12885-87ad-426a-8bbb-656889d82e10');
UPDATE aparelhos SET venda_id = '2aab1d0a-a71b-42f5-805c-089e0fc1e6d9' WHERE id = 'e8caaa55-98cd-4a2e-8a76-e01c7812ba3b';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('dd42ea28-7182-4711-905c-4dd3b8ff9796', '2aab1d0a-a71b-42f5-805c-089e0fc1e6d9', 'pix', 770.0, '2026-05-24', '97f12885-87ad-426a-8bbb-656889d82e10', 1);

-- === VENDA 11312: IPAD 11 128GB ROSA NOVO (24/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('dbf952ad-52b1-493e-8cc1-8d3adce4e93c', 'Apple', 'IPAD 11 128GB ROSA NOVO', 'FCYK60J9ML', 2190.0, 2090.0, 19, 'novo', 'perfeito', 'vendido', '2026-05-24', '2026-05-24', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-24', '2026-05-24', 'Pagto junto (Aparelho 3/4, total grupo R$ 12,500)');
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('05b23722-187e-407d-b070-edb12ee0454f', 11312, current_setting('importacao.cliente_id')::uuid, 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 2190.0, 2190.0, 0.0, '2026-05-24', '2026-05-24', '97f12885-87ad-426a-8bbb-656889d82e10');
UPDATE aparelhos SET venda_id = '05b23722-187e-407d-b070-edb12ee0454f' WHERE id = 'dbf952ad-52b1-493e-8cc1-8d3adce4e93c';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('c761a8d7-3757-4648-84f7-cb844de29461', '05b23722-187e-407d-b070-edb12ee0454f', 'pix', 2190.0, '2026-05-24', '97f12885-87ad-426a-8bbb-656889d82e10', 1);

-- === VENDA 11313: AIRPORDS PRO 3 NOVO (24/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('1f19d330-c3bd-4e39-b6ca-db245c9012ca', 'Outros', 'AIRPORDS PRO 3 NOVO', 'LLG9MVVVJ9', 1590.0, 1490.0, 19, 'novo', 'perfeito', 'vendido', '2026-05-24', '2026-05-24', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-24', '2026-05-24', 'Pagto junto (Aparelho 4/4, total grupo R$ 12,500)');
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('756ba3ff-7b5a-4583-859a-6fe9ca6609c5', 11313, current_setting('importacao.cliente_id')::uuid, 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 1590.0, 1590.0, 0.0, '2026-05-24', '2026-05-24', '97f12885-87ad-426a-8bbb-656889d82e10');
UPDATE aparelhos SET venda_id = '756ba3ff-7b5a-4583-859a-6fe9ca6609c5' WHERE id = '1f19d330-c3bd-4e39-b6ca-db245c9012ca';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('a328a7ec-2917-4b6c-b993-21cba39d7d02', '756ba3ff-7b5a-4583-859a-6fe9ca6609c5', 'pix', 1590.0, '2026-05-24', '97f12885-87ad-426a-8bbb-656889d82e10', 1);

-- === VENDA 11314: IPHONE 14 128GB BRANCO SEMINOVO (26/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('a9800255-5efc-477b-a69e-391917ffd960', 'Apple', 'IPHONE 14 128GB BRANCO SEMINOVO', '355794428661143', 2150.0, 1900.0, 20, 'seminovo', 'bom', 'vendido', '2026-05-26', '2026-05-26', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', '2026-05-26', '2026-05-26', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('7f768d51-a68f-4228-8896-cc725e054ea9', 11314, current_setting('importacao.cliente_id')::uuid, 20, 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 'concluida', 'normal', 2150.0, 2150.0, 0.0, '2026-05-26', '2026-05-26', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4');
UPDATE aparelhos SET venda_id = '7f768d51-a68f-4228-8896-cc725e054ea9' WHERE id = 'a9800255-5efc-477b-a69e-391917ffd960';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('6a22b1ed-d1ed-4131-bfaa-25b3cac0db8b', '7f768d51-a68f-4228-8896-cc725e054ea9', 'cartao_credito', 2150.0, '2026-05-26', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('949b1bf2-f90f-4913-93e7-742891026fa8', 20, '7f768d51-a68f-4228-8896-cc725e054ea9', 'Brinde', 25.0, '2026-05-26', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', '2026-05-26');

-- === VENDA 11315: IPHONE 15 PRO MAX 256GB PRETO SEMINOVO (26/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('c5469c4e-5785-49a6-8ce1-113131616086', 'Apple', 'IPHONE 15 PRO MAX 256GB PRETO SEMINOVO', '359897655192066', 4150.0, 3700.0, 4, 'seminovo', 'bom', 'vendido', '2026-05-26', '2026-05-26', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-26', '2026-05-26', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('f1c1ff13-278a-4554-8d51-837358736b08', 11315, current_setting('importacao.cliente_id')::uuid, 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 4150.0, 4150.0, 0.0, '2026-05-26', '2026-05-26', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
UPDATE aparelhos SET venda_id = 'f1c1ff13-278a-4554-8d51-837358736b08' WHERE id = 'c5469c4e-5785-49a6-8ce1-113131616086';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('e6dba981-5a74-433a-9960-835b7f807684', 'f1c1ff13-278a-4554-8d51-837358736b08', 'dinheiro', 1100.0, '2026-05-26', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1);
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('62f6e594-f74e-4d6f-8ab3-bcccd941569e', 'f1c1ff13-278a-4554-8d51-837358736b08', 'cartao_credito', 3050.0, '2026-05-26', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('9531e356-7851-478b-830d-c206795d8e06', 4, 'f1c1ff13-278a-4554-8d51-837358736b08', 'Brinde', 25.0, '2026-05-26', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-26');

-- === VENDA 11316: IPAD 11° (A16) 128GB SILVER (26/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('99cea155-0897-4e93-b399-2e7d5d34a4de', 'Apple', 'IPAD 11° (A16) 128GB SILVER', 'CKGH9XQDXG', 2500.0, 2180.0, 4, 'seminovo', 'bom', 'vendido', '2026-05-26', '2026-05-26', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-26', '2026-05-26', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('c007ad78-f274-4732-9c05-e422db69b625', 11316, current_setting('importacao.cliente_id')::uuid, 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 2500.0, 2500.0, 0.0, '2026-05-26', '2026-05-26', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
UPDATE aparelhos SET venda_id = 'c007ad78-f274-4732-9c05-e422db69b625' WHERE id = '99cea155-0897-4e93-b399-2e7d5d34a4de';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('72592911-1d2d-4726-9952-efb452198fe5', 'c007ad78-f274-4732-9c05-e422db69b625', 'pix', 2500.0, '2026-05-26', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('cf9c71fc-418a-4195-bfa6-864c264e9980', 4, 'c007ad78-f274-4732-9c05-e422db69b625', 'Brinde', 170.0, '2026-05-26', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-26');

-- === VENDA 11317: IPHONE 16 PRO MAX 256GB PRETO SEMINOVO (26/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('f61e6238-1a6d-4672-8cd2-f8b0f9aca053', 'Apple', 'IPHONE 16 PRO MAX 256GB PRETO SEMINOVO', '357003196809944', 5100.0, 4850.0, 4, 'seminovo', 'bom', 'vendido', '2026-05-26', '2026-05-26', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-26', '2026-05-26', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('61e327de-83e8-4335-86d2-950946588e22', 11317, current_setting('importacao.cliente_id')::uuid, 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 5100.0, 5100.0, 0.0, '2026-05-26', '2026-05-26', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
UPDATE aparelhos SET venda_id = '61e327de-83e8-4335-86d2-950946588e22' WHERE id = 'f61e6238-1a6d-4672-8cd2-f8b0f9aca053';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('a1e6d2dc-24ed-42d2-8d21-4a39c12fef5e', '61e327de-83e8-4335-86d2-950946588e22', 'pix', 4100.0, '2026-05-26', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1);
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, observacao, parcelas)
VALUES ('ebd4b932-5af4-4b0d-a14e-21c0f697ee57', '61e327de-83e8-4335-86d2-950946588e22', 'troca_aparelho', 1000.0, '2026-05-26', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'Troca: ENTROU UM 12 128GB SEMINOVO POR', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('153613c6-9d3a-444d-a1a0-a48bb7e07f51', 4, '61e327de-83e8-4335-86d2-950946588e22', 'Brinde', 25.0, '2026-05-26', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-26');

-- === VENDA 11318: IPHONE 16 PRO MAX 1TB PRETO NOVO (26/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('f583c02f-6c4d-412a-a533-0599b597a219', 'Apple', 'IPHONE 16 PRO MAX 1TB PRETO NOVO', '359222380985702', 5800.0, 5300.0, 20, 'novo', 'perfeito', 'vendido', '2026-05-26', '2026-05-26', '25e2da5b-9e76-4388-9890-7e22efd6940d', '2026-05-26', '2026-05-26', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('2154a391-6c7e-4f48-be2e-203b23a47766', 11318, current_setting('importacao.cliente_id')::uuid, 20, '25e2da5b-9e76-4388-9890-7e22efd6940d', 'concluida', 'normal', 5800.0, 5800.0, 0.0, '2026-05-26', '2026-05-26', '25e2da5b-9e76-4388-9890-7e22efd6940d');
UPDATE aparelhos SET venda_id = '2154a391-6c7e-4f48-be2e-203b23a47766' WHERE id = 'f583c02f-6c4d-412a-a533-0599b597a219';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('24c7d822-1453-458c-aba5-7005f48a83dc', '2154a391-6c7e-4f48-be2e-203b23a47766', 'pix', 2000.0, '2026-05-26', '25e2da5b-9e76-4388-9890-7e22efd6940d', 1);
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('b42f069d-15ad-42f9-80db-ad7cf360dd62', '2154a391-6c7e-4f48-be2e-203b23a47766', 'cartao_credito', 3800.0, '2026-05-26', '25e2da5b-9e76-4388-9890-7e22efd6940d', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('3213ce0a-a600-478d-af09-adf9164da8f3', 20, '2154a391-6c7e-4f48-be2e-203b23a47766', 'Brinde', 15.0, '2026-05-26', '25e2da5b-9e76-4388-9890-7e22efd6940d', '2026-05-26');

-- === VENDA 11319: IPHONE 17 PRO MAX SILVER 256GB NOVO (27/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('5833b56e-e869-48cb-ab3a-8bcff3dc47c6', 'Apple', 'IPHONE 17 PRO MAX SILVER 256GB NOVO', 'CYFWFHQWXC', 7999.99, 1800.0, 4, 'novo', 'perfeito', 'vendido', '2026-05-27', '2026-05-27', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-27', '2026-05-27', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('921798fb-184d-4899-b4de-b9ebeee62a02', 11319, current_setting('importacao.cliente_id')::uuid, 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 7999.99, 7999.99, 0.0, '2026-05-27', '2026-05-27', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
UPDATE aparelhos SET venda_id = '921798fb-184d-4899-b4de-b9ebeee62a02' WHERE id = '5833b56e-e869-48cb-ab3a-8bcff3dc47c6';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('3fe01a4a-6b4b-4b0b-bea0-933008d76258', '921798fb-184d-4899-b4de-b9ebeee62a02', 'pix', 7999.99, '2026-05-27', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('0a4578f4-3ad5-4cff-8170-142246e8b70a', 4, '921798fb-184d-4899-b4de-b9ebeee62a02', 'Brinde', 15.0, '2026-05-27', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-27');

-- === VENDA 11320: REDMI NOTE 15 PRO PLUS 5G PRETO NOVO (27/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('7135ea81-13cc-4c2e-adab-f8441b150b82', 'Xiaomi', 'REDMI NOTE 15 PRO PLUS 5G PRETO NOVO', '8638440867199603', 1990.0, 1880.0, 4, 'novo', 'perfeito', 'vendido', '2026-05-27', '2026-05-27', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-27', '2026-05-27', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('a36feb53-7f97-4851-a8d5-d50532763913', 11320, current_setting('importacao.cliente_id')::uuid, 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 1990.0, 1990.0, 0.0, '2026-05-27', '2026-05-27', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
UPDATE aparelhos SET venda_id = 'a36feb53-7f97-4851-a8d5-d50532763913' WHERE id = '7135ea81-13cc-4c2e-adab-f8441b150b82';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('6cecef87-8a6c-4f22-9385-001c1e78b262', 'a36feb53-7f97-4851-a8d5-d50532763913', 'pix', 1990.0, '2026-05-27', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1);

-- === VENDA 11321: IPHONE 13 128GB AZUL SEMINOVO (27/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('a876fedd-7bc4-4e45-8392-0f12aebbc7e2', 'Apple', 'IPHONE 13 128GB AZUL SEMINOVO', '352586507807406', 2093.0, 1780.0, 4, 'seminovo', 'bom', 'vendido', '2026-05-27', '2026-05-27', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-27', '2026-05-27', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('fa749d9f-3b6f-46dc-8ec3-a23fa797427e', 11321, current_setting('importacao.cliente_id')::uuid, 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 2093.0, 2093.0, 0.0, '2026-05-27', '2026-05-27', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
UPDATE aparelhos SET venda_id = 'fa749d9f-3b6f-46dc-8ec3-a23fa797427e' WHERE id = 'a876fedd-7bc4-4e45-8392-0f12aebbc7e2';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('d2ace771-251e-4a8b-873c-e12fc2d066d5', 'fa749d9f-3b6f-46dc-8ec3-a23fa797427e', 'cartao_credito', 2093.0, '2026-05-27', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('d2f72dbd-5e43-4f26-a7a6-50b19087e7f4', 4, 'fa749d9f-3b6f-46dc-8ec3-a23fa797427e', 'Brinde', 25.0, '2026-05-27', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-27');

-- === VENDA 11322: IPHONE 15 PRO MAX 256GB AZUL SEMINOVO (27/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('2bc698d7-cea6-4f53-94a4-80d5ec6e6187', 'Apple', 'IPHONE 15 PRO MAX 256GB AZUL SEMINOVO', '354679846995259', 3950.0, 3700.0, 20, 'seminovo', 'bom', 'vendido', '2026-05-27', '2026-05-27', '25e2da5b-9e76-4388-9890-7e22efd6940d', '2026-05-27', '2026-05-27', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('b0c0e10f-7f28-411b-822d-e8aec35e53af', 11322, current_setting('importacao.cliente_id')::uuid, 20, '25e2da5b-9e76-4388-9890-7e22efd6940d', 'concluida', 'normal', 3950.0, 3950.0, 0.0, '2026-05-27', '2026-05-27', '25e2da5b-9e76-4388-9890-7e22efd6940d');
UPDATE aparelhos SET venda_id = 'b0c0e10f-7f28-411b-822d-e8aec35e53af' WHERE id = '2bc698d7-cea6-4f53-94a4-80d5ec6e6187';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('93162e4e-8c71-49aa-a397-bebf68afeac7', 'b0c0e10f-7f28-411b-822d-e8aec35e53af', 'pix', 3950.0, '2026-05-27', '25e2da5b-9e76-4388-9890-7e22efd6940d', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('890bf700-144e-44f6-be40-49f5cee76c7c', 20, 'b0c0e10f-7f28-411b-822d-e8aec35e53af', 'Brinde', 25.0, '2026-05-27', '25e2da5b-9e76-4388-9890-7e22efd6940d', '2026-05-27');

-- === VENDA 11323: IPHONE 12 64GB BRANCO SEMINOVO (27/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('3b00eefa-3c26-49a9-830c-34e5320c2501', 'Apple', 'IPHONE 12 64GB BRANCO SEMINOVO', '359827481625484', 1395.0, 1150.0, 1, 'seminovo', 'bom', 'vendido', '2026-05-27', '2026-05-27', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-27', '2026-05-27', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('b7d896ff-db45-4d61-9453-8c578f4ed12e', 11323, current_setting('importacao.cliente_id')::uuid, 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 1395.0, 1395.0, 0.0, '2026-05-27', '2026-05-27', '85e3aa42-b9af-49b8-a72a-64e9c337aa53');
UPDATE aparelhos SET venda_id = 'b7d896ff-db45-4d61-9453-8c578f4ed12e' WHERE id = '3b00eefa-3c26-49a9-830c-34e5320c2501';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('4cc0799c-1eed-44d2-a466-96432aee8936', 'b7d896ff-db45-4d61-9453-8c578f4ed12e', 'pix', 1395.0, '2026-05-27', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('283e0f3d-c2a4-4bb8-96c5-b5f4b44b70cf', 1, 'b7d896ff-db45-4d61-9453-8c578f4ed12e', 'Brinde', 25.0, '2026-05-27', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-27');

-- === VENDA 11324: POCO C85 PRETO 256GB NOVO (27/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('5526e6d5-a469-4905-81c4-1379cb304eb7', 'Outros', 'POCO C85 PRETO 256GB NOVO', '864280089992609', 1445.0, 860.0, 1, 'novo', 'perfeito', 'vendido', '2026-05-27', '2026-05-27', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-27', '2026-05-27', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('24dac5cd-e394-4fdf-b69d-6da704377f16', 11324, current_setting('importacao.cliente_id')::uuid, 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 1445.0, 1445.0, 0.0, '2026-05-27', '2026-05-27', '85e3aa42-b9af-49b8-a72a-64e9c337aa53');
UPDATE aparelhos SET venda_id = '24dac5cd-e394-4fdf-b69d-6da704377f16' WHERE id = '5526e6d5-a469-4905-81c4-1379cb304eb7';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('3e4be630-64ea-4108-af1e-0e1889cd65e9', '24dac5cd-e394-4fdf-b69d-6da704377f16', 'pix', 1445.0, '2026-05-27', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 1);

-- === VENDA 11325: IPHONE 17 PRO 256GB AZUL SEMINOVO (27/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('31e8b6da-4739-487a-9eeb-dbfc54efd29c', 'Apple', 'IPHONE 17 PRO 256GB AZUL SEMINOVO', '354956977489959', 6500.0, 6230.0, 19, 'seminovo', 'bom', 'vendido', '2026-05-27', '2026-05-27', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-27', '2026-05-27', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('d2c742dc-9332-4029-bc21-13869c7477f6', 11325, current_setting('importacao.cliente_id')::uuid, 19, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 6500.0, 6500.0, 0.0, '2026-05-27', '2026-05-27', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
UPDATE aparelhos SET venda_id = 'd2c742dc-9332-4029-bc21-13869c7477f6' WHERE id = '31e8b6da-4739-487a-9eeb-dbfc54efd29c';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('85adf2e0-2631-433c-8620-d7ce4fb87129', 'd2c742dc-9332-4029-bc21-13869c7477f6', 'pix', 4500.0, '2026-05-27', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1);
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, observacao, parcelas)
VALUES ('74fb579f-363c-4bb4-8573-48a5ffba82bb', 'd2c742dc-9332-4029-bc21-13869c7477f6', 'troca_aparelho', 2000.0, '2026-05-27', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'Troca: IPH 14 256GB', 1);

-- === VENDA 11326: IPHONE 16 PRETO 128GB SEMINOVO (27/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('9d2d6f7c-09ab-4585-89c7-2650773da197', 'Apple', 'IPHONE 16 PRETO 128GB SEMINOVO', '358964582664046', 3400.0, 3050.0, 19, 'seminovo', 'bom', 'vendido', '2026-05-27', '2026-05-27', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-27', '2026-05-27', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('18ff72a8-821e-40bd-a1ef-a9a994a9dc1c', 11326, current_setting('importacao.cliente_id')::uuid, 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 3400.0, 3400.0, 0.0, '2026-05-27', '2026-05-27', '97f12885-87ad-426a-8bbb-656889d82e10');
UPDATE aparelhos SET venda_id = '18ff72a8-821e-40bd-a1ef-a9a994a9dc1c' WHERE id = '9d2d6f7c-09ab-4585-89c7-2650773da197';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('d2f48ba2-5664-4c00-9018-34ae13716eac', '18ff72a8-821e-40bd-a1ef-a9a994a9dc1c', 'pix', 3400.0, '2026-05-27', '97f12885-87ad-426a-8bbb-656889d82e10', 1);

-- === VENDA 11327: IPHONE 17 PRO 256GB BRANCO SEMINOVO (27/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('5611b48c-91f0-4846-bede-5c2c98a2ece1', 'Apple', 'IPHONE 17 PRO 256GB BRANCO SEMINOVO', '350455774133336', 6300.0, 6100.0, 1, 'seminovo', 'bom', 'vendido', '2026-05-27', '2026-05-27', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-27', '2026-05-27', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('e4048926-d933-4bd1-8fa0-4e161a137777', 11327, current_setting('importacao.cliente_id')::uuid, 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 6300.0, 6300.0, 0.0, '2026-05-27', '2026-05-27', '85e3aa42-b9af-49b8-a72a-64e9c337aa53');
UPDATE aparelhos SET venda_id = 'e4048926-d933-4bd1-8fa0-4e161a137777' WHERE id = '5611b48c-91f0-4846-bede-5c2c98a2ece1';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('a8b23064-762c-42f0-849c-d291e314d0c6', 'e4048926-d933-4bd1-8fa0-4e161a137777', 'pix', 6300.0, '2026-05-27', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('6844065c-1af5-4b54-b209-fffdd0e2e3ac', 1, 'e4048926-d933-4bd1-8fa0-4e161a137777', 'Brinde', 10.0, '2026-05-27', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-27');

-- === VENDA 11328: IPHONE 17 PRO 256GB BRANCO SEMINOVO (28/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('850d50e8-bca7-44f4-a27f-fc14d73b66b8', 'Apple', 'IPHONE 17 PRO 256GB BRANCO SEMINOVO', '354996269680378', 6600.0, 6100.0, 4, 'seminovo', 'bom', 'vendido', '2026-05-28', '2026-05-28', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-28', '2026-05-28', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('0b4c8d8d-1710-441a-a55d-35d28dcb041b', 11328, current_setting('importacao.cliente_id')::uuid, 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 6600.0, 6600.0, 0.0, '2026-05-28', '2026-05-28', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
UPDATE aparelhos SET venda_id = '0b4c8d8d-1710-441a-a55d-35d28dcb041b' WHERE id = '850d50e8-bca7-44f4-a27f-fc14d73b66b8';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('039ba214-850a-4dc3-a9f0-bad41649dc9a', '0b4c8d8d-1710-441a-a55d-35d28dcb041b', 'pix', 6600.0, '2026-05-28', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('c7899f41-6d14-42f5-a753-a01bf5ebf683', 4, '0b4c8d8d-1710-441a-a55d-35d28dcb041b', 'Brinde', 95.0, '2026-05-28', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-28');

-- === VENDA 11329: IPHONE 17 PRO 256GB BRANCO SEMINOVO (28/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('d61169d0-5e32-4be4-81c2-75871771b292', 'Apple', 'IPHONE 17 PRO 256GB BRANCO SEMINOVO', '352294449113888', 6650.0, 6100.0, 4, 'seminovo', 'bom', 'vendido', '2026-05-28', '2026-05-28', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-28', '2026-05-28', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('63c71eba-32db-45c9-9372-aa15ca76b791', 11329, current_setting('importacao.cliente_id')::uuid, 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 6650.0, 6650.0, 0.0, '2026-05-28', '2026-05-28', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
UPDATE aparelhos SET venda_id = '63c71eba-32db-45c9-9372-aa15ca76b791' WHERE id = 'd61169d0-5e32-4be4-81c2-75871771b292';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('df133698-b932-4b2f-97af-3bc5c61f74c8', '63c71eba-32db-45c9-9372-aa15ca76b791', 'pix', 2000.0, '2026-05-28', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1);
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('eca07b70-53c2-4fa4-864d-62d14fbf01bc', '63c71eba-32db-45c9-9372-aa15ca76b791', 'cartao_credito', 4650.0, '2026-05-28', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('29d16919-3710-4a45-84c8-4c42e16728fc', 4, '63c71eba-32db-45c9-9372-aa15ca76b791', 'Brinde', 40.0, '2026-05-28', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-28');

-- === VENDA 11330: IPHONE 12 PRO MAX 256GB GRAFITE SEMINOVO (28/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('a2766342-3642-4bab-9d51-761f42287ba9', 'Apple', 'IPHONE 12 PRO MAX 256GB GRAFITE SEMINOVO', '353167663221083', 2576.0, 2300.0, 4, 'seminovo', 'bom', 'vendido', '2026-05-28', '2026-05-28', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-28', '2026-05-28', 'Pagto junto (Aparelho 1/2, total grupo R$ 5,152)');
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('6b3873dc-f7ed-4f89-ba8e-8259206690ba', 11330, current_setting('importacao.cliente_id')::uuid, 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 2576.0, 2576.0, 0.0, '2026-05-28', '2026-05-28', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
UPDATE aparelhos SET venda_id = '6b3873dc-f7ed-4f89-ba8e-8259206690ba' WHERE id = 'a2766342-3642-4bab-9d51-761f42287ba9';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('b9305c3e-d3c3-4bcf-93af-39ccd6ee7f44', '6b3873dc-f7ed-4f89-ba8e-8259206690ba', 'pix', 2576.0, '2026-05-28', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('7b51c492-a2c0-46ff-bfb1-a60df88de8af', 4, '6b3873dc-f7ed-4f89-ba8e-8259206690ba', 'Brinde', 25.0, '2026-05-28', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-28');

-- === VENDA 11331: IPHONE 12 PRO MAX 256GB GRAFITE SEMINOVO (28/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('ac626506-8f83-4962-bd08-29820e71533a', 'Apple', 'IPHONE 12 PRO MAX 256GB GRAFITE SEMINOVO', '357061220988803', 2576.0, 2300.0, 4, 'seminovo', 'bom', 'vendido', '2026-05-28', '2026-05-28', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-28', '2026-05-28', 'Pagto junto (Aparelho 2/2, total grupo R$ 5,152)');
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('dbf11723-a801-4e8e-a8a7-00630e9fa842', 11331, current_setting('importacao.cliente_id')::uuid, 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 2576.0, 2576.0, 0.0, '2026-05-28', '2026-05-28', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
UPDATE aparelhos SET venda_id = 'dbf11723-a801-4e8e-a8a7-00630e9fa842' WHERE id = 'ac626506-8f83-4962-bd08-29820e71533a';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('be1826b0-e81c-4a0e-bad0-437e82fb805b', 'dbf11723-a801-4e8e-a8a7-00630e9fa842', 'pix', 2576.0, '2026-05-28', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('7557810e-a1f8-469e-a220-985ff5267fb7', 4, 'dbf11723-a801-4e8e-a8a7-00630e9fa842', 'Brinde', 65.0, '2026-05-28', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-28');

-- === VENDA 11332: IPHONE 16 PRO MAX 256GB DESERT SEMINOVO (28/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('da3394a4-76e1-43f3-abf8-1e1239dcd4ba', 'Apple', 'IPHONE 16 PRO MAX 256GB DESERT SEMINOVO', '353484626443138', 5446.0, 5000.0, 1, 'seminovo', 'bom', 'vendido', '2026-05-28', '2026-05-28', '1d12d555-68e9-45f8-bfc0-a35a1d8d7920', '2026-05-28', '2026-05-28', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('135e33f9-c47d-4a39-9fac-a67abac55e96', 11332, current_setting('importacao.cliente_id')::uuid, 1, '1d12d555-68e9-45f8-bfc0-a35a1d8d7920', 'concluida', 'normal', 5446.0, 5446.0, 0.0, '2026-05-28', '2026-05-28', '1d12d555-68e9-45f8-bfc0-a35a1d8d7920');
UPDATE aparelhos SET venda_id = '135e33f9-c47d-4a39-9fac-a67abac55e96' WHERE id = 'da3394a4-76e1-43f3-abf8-1e1239dcd4ba';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('50bd2225-6ac6-47ad-ad9d-8c82b5b68f2f', '135e33f9-c47d-4a39-9fac-a67abac55e96', 'pix', 5446.0, '2026-05-28', '1d12d555-68e9-45f8-bfc0-a35a1d8d7920', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('18380ccc-efe3-45b4-95fb-001017824fe5', 1, '135e33f9-c47d-4a39-9fac-a67abac55e96', 'Brinde', 25.0, '2026-05-28', '1d12d555-68e9-45f8-bfc0-a35a1d8d7920', '2026-05-28');

-- === VENDA 11333: IPHONE 11 128GB BRANCO SEMINOVO (28/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('10099b70-0a85-46f5-8f64-66a2a679a7de', 'Apple', 'IPHONE 11 128GB BRANCO SEMINOVO', '356581108114007', 1161.0, 700.0, 4, 'seminovo', 'bom', 'vendido', '2026-05-28', '2026-05-28', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-28', '2026-05-28', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('7b5d4ab6-81b7-4c33-b5d2-f7a6ac70ecd7', 11333, current_setting('importacao.cliente_id')::uuid, 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 1161.0, 1161.0, 0.0, '2026-05-28', '2026-05-28', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
UPDATE aparelhos SET venda_id = '7b5d4ab6-81b7-4c33-b5d2-f7a6ac70ecd7' WHERE id = '10099b70-0a85-46f5-8f64-66a2a679a7de';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('6ff6fbb1-b9c1-4400-bd30-55e1cd5a0bed', '7b5d4ab6-81b7-4c33-b5d2-f7a6ac70ecd7', 'cartao_credito', 1161.0, '2026-05-28', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('7fe4d849-fc24-40f4-b28a-567ad09b73ed', 4, '7b5d4ab6-81b7-4c33-b5d2-f7a6ac70ecd7', 'Brinde', 115.0, '2026-05-28', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-28');

-- === VENDA 11334: IPHONE 16 PRO MAX 256GB PRETO SEMINOVO (28/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('ef9cd5dd-ab3b-478b-8e9b-a721b6d829cf', 'Apple', 'IPHONE 16 PRO MAX 256GB PRETO SEMINOVO', '354276355714955', 5300.0, 4850.0, 20, 'seminovo', 'bom', 'vendido', '2026-05-28', '2026-05-28', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', '2026-05-28', '2026-05-28', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('8116a10b-824f-4f7f-a3cd-e13292dcfe8e', 11334, current_setting('importacao.cliente_id')::uuid, 20, 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 'concluida', 'normal', 5300.0, 5300.0, 0.0, '2026-05-28', '2026-05-28', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4');
UPDATE aparelhos SET venda_id = '8116a10b-824f-4f7f-a3cd-e13292dcfe8e' WHERE id = 'ef9cd5dd-ab3b-478b-8e9b-a721b6d829cf';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('3e8d173c-e671-4606-9889-75637c332b45', '8116a10b-824f-4f7f-a3cd-e13292dcfe8e', 'cartao_credito', 5300.0, '2026-05-28', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('c2e1dc85-7d77-43ec-9f38-f0cf75c472ef', 20, '8116a10b-824f-4f7f-a3cd-e13292dcfe8e', 'Brinde', 10.0, '2026-05-28', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', '2026-05-28');

-- === VENDA 11335: IPHONE 17 PRO 256GB BRANCO SEMINOVO (28/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('91e6babc-7ce1-4adc-b0ab-5597b4f8fcc6', 'Apple', 'IPHONE 17 PRO 256GB BRANCO SEMINOVO', '355500350320222', 6821.0, 6100.0, 20, 'seminovo', 'bom', 'vendido', '2026-05-28', '2026-05-28', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', '2026-05-28', '2026-05-28', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('c2c596ff-1726-43d3-9af4-4c22f91c67a8', 11335, current_setting('importacao.cliente_id')::uuid, 20, 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 'concluida', 'normal', 6821.0, 6821.0, 0.0, '2026-05-28', '2026-05-28', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4');
UPDATE aparelhos SET venda_id = 'c2c596ff-1726-43d3-9af4-4c22f91c67a8' WHERE id = '91e6babc-7ce1-4adc-b0ab-5597b4f8fcc6';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('d66a1777-c60c-4eac-9b3a-a5aeaddb7f7e', 'c2c596ff-1726-43d3-9af4-4c22f91c67a8', 'cartao_credito', 6821.0, '2026-05-28', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('bc4102ae-ab28-428f-affe-6d4dd95e5001', 20, 'c2c596ff-1726-43d3-9af4-4c22f91c67a8', 'Brinde', 5.0, '2026-05-28', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', '2026-05-28');

-- === VENDA 11336: IPHONE 17 PRO MAX BRANCO NOVO 256GB (28/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('9babee02-6247-40f0-b8d2-5a2f6df57e99', 'Apple', 'IPHONE 17 PRO MAX BRANCO NOVO 256GB', '359652121886894', 8300.0, 7750.0, 1, 'novo', 'perfeito', 'vendido', '2026-05-28', '2026-05-28', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-28', '2026-05-28', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('1d7ff203-b5c2-4ce4-84f7-cf2e5aa0a958', 11336, current_setting('importacao.cliente_id')::uuid, 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 8300.0, 8300.0, 0.0, '2026-05-28', '2026-05-28', '85e3aa42-b9af-49b8-a72a-64e9c337aa53');
UPDATE aparelhos SET venda_id = '1d7ff203-b5c2-4ce4-84f7-cf2e5aa0a958' WHERE id = '9babee02-6247-40f0-b8d2-5a2f6df57e99';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('f8113f28-d388-419b-a640-b6a161ca0636', '1d7ff203-b5c2-4ce4-84f7-cf2e5aa0a958', 'pix', 3450.0, '2026-05-28', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 1);
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, observacao, parcelas)
VALUES ('dd2a5c16-d68a-4317-abf7-c4c57b72788b', '1d7ff203-b5c2-4ce4-84f7-cf2e5aa0a958', 'troca_aparelho', 4850.0, '2026-05-28', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'Troca: IPH 16 PRO MAX', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('aff748df-5742-412f-94a2-654a24a7967f', 1, '1d7ff203-b5c2-4ce4-84f7-cf2e5aa0a958', 'Brinde', 10.0, '2026-05-28', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-28');

-- === VENDA 11337: IPHONE 16 PRO MAX 512GB PRETO SEMINOVO (28/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('6279bd6a-a1af-4585-8f93-01a0bb6828fc', 'Apple', 'IPHONE 16 PRO MAX 512GB PRETO SEMINOVO', '354331121466651', 5650.0, 5150.0, 20, 'seminovo', 'bom', 'vendido', '2026-05-28', '2026-05-28', '25e2da5b-9e76-4388-9890-7e22efd6940d', '2026-05-28', '2026-05-28', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('695ce452-8380-4878-8017-6c3820ea7b1c', 11337, current_setting('importacao.cliente_id')::uuid, 20, '25e2da5b-9e76-4388-9890-7e22efd6940d', 'concluida', 'normal', 5650.0, 5650.0, 0.0, '2026-05-28', '2026-05-28', '25e2da5b-9e76-4388-9890-7e22efd6940d');
UPDATE aparelhos SET venda_id = '695ce452-8380-4878-8017-6c3820ea7b1c' WHERE id = '6279bd6a-a1af-4585-8f93-01a0bb6828fc';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('17b2b47a-fc5b-44b7-b31e-481300cd95f8', '695ce452-8380-4878-8017-6c3820ea7b1c', 'cartao_credito', 3550.0, '2026-05-28', '25e2da5b-9e76-4388-9890-7e22efd6940d', 1);
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, observacao, parcelas)
VALUES ('96ed2230-edc8-47f7-93e2-813a291c4cff', '695ce452-8380-4878-8017-6c3820ea7b1c', 'troca_aparelho', 2100.0, '2026-05-28', '25e2da5b-9e76-4388-9890-7e22efd6940d', 'Troca: IPHONE 16E 128 GB BRANCO A', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('e29d17a2-1be3-4bd1-a725-80156862923b', 20, '695ce452-8380-4878-8017-6c3820ea7b1c', 'Brinde', 50.0, '2026-05-28', '25e2da5b-9e76-4388-9890-7e22efd6940d', '2026-05-28');

-- === VENDA 11338: IPHONE 14 128GB AZUL SEMINOVO (29/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('46e4ca3f-f82a-4e0c-87cc-ceaeec288e61', 'Apple', 'IPHONE 14 128GB AZUL SEMINOVO', '359388532621543', 2150.0, 1900.0, 4, 'seminovo', 'bom', 'vendido', '2026-05-29', '2026-05-29', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-29', '2026-05-29', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('20f2f0f3-4fef-4686-a8e7-5c1f49957d04', 11338, current_setting('importacao.cliente_id')::uuid, 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 2150.0, 2150.0, 0.0, '2026-05-29', '2026-05-29', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
UPDATE aparelhos SET venda_id = '20f2f0f3-4fef-4686-a8e7-5c1f49957d04' WHERE id = '46e4ca3f-f82a-4e0c-87cc-ceaeec288e61';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('1e4ac199-57f1-4502-9186-fc89997e3ee3', '20f2f0f3-4fef-4686-a8e7-5c1f49957d04', 'cartao_credito', 2150.0, '2026-05-29', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('f78ac092-0970-4316-95b6-f2ec5e11149e', 4, '20f2f0f3-4fef-4686-a8e7-5c1f49957d04', 'Brinde', 25.0, '2026-05-29', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-29');

-- === VENDA 11339: REDMI NOTE 15 PRO 4G 256GB PRETO NOVO (29/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('339d7a55-3efa-444f-abfa-67a515a1a545', 'Xiaomi', 'REDMI NOTE 15 PRO 4G 256GB PRETO NOVO', '863911086287848', 1627.0, 1430.0, 4, 'novo', 'perfeito', 'vendido', '2026-05-29', '2026-05-29', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-29', '2026-05-29', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('5b9a0c92-359b-4e23-8e39-8d4a101edaf4', 11339, current_setting('importacao.cliente_id')::uuid, 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 1627.0, 1627.0, 0.0, '2026-05-29', '2026-05-29', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
UPDATE aparelhos SET venda_id = '5b9a0c92-359b-4e23-8e39-8d4a101edaf4' WHERE id = '339d7a55-3efa-444f-abfa-67a515a1a545';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('a6bc3867-2ed5-407f-bd86-f1f6b274e017', '5b9a0c92-359b-4e23-8e39-8d4a101edaf4', 'pix', 530.0, '2026-05-29', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1);
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('cb33abaf-49dd-44e2-a855-db7f14a401c8', '5b9a0c92-359b-4e23-8e39-8d4a101edaf4', 'cartao_credito', 1097.0, '2026-05-29', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('477f9af1-66b6-41ef-b52f-8bf4d9e5c3b6', 4, '5b9a0c92-359b-4e23-8e39-8d4a101edaf4', 'Brinde', 50.0, '2026-05-29', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-29');

-- === VENDA 11340: REDMI NOTE 15 PRO 5G 256GB PRETO NOVO (29/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('303c45d0-df17-4df9-b8fe-af1de5b3ee03', 'Xiaomi', 'REDMI NOTE 15 PRO 5G 256GB PRETO NOVO', '865293081783289', 1852.0, 1680.0, 4, 'novo', 'perfeito', 'vendido', '2026-05-29', '2026-05-29', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-29', '2026-05-29', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('45932303-e615-4613-92cc-570ba5a8dc3c', 11340, current_setting('importacao.cliente_id')::uuid, 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 1852.0, 1852.0, 0.0, '2026-05-29', '2026-05-29', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
UPDATE aparelhos SET venda_id = '45932303-e615-4613-92cc-570ba5a8dc3c' WHERE id = '303c45d0-df17-4df9-b8fe-af1de5b3ee03';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('f47683c8-f95e-47d4-8ee7-d63cb2e426f4', '45932303-e615-4613-92cc-570ba5a8dc3c', 'pix', 900.0, '2026-05-29', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1);
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('be336021-7eb1-4e20-a626-8e9d4bb294bd', '45932303-e615-4613-92cc-570ba5a8dc3c', 'cartao_credito', 952.0, '2026-05-29', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('b52c2a4d-b8fb-4b43-8811-c9ea7f2e54e3', 4, '45932303-e615-4613-92cc-570ba5a8dc3c', 'Brinde', 50.0, '2026-05-29', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-29');

-- === VENDA 11341: IPHONE 13 128GB BRANCO SEMINOVO (29/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('173c6b37-40e3-42f4-bf00-906f51ffa15d', 'Apple', 'IPHONE 13 128GB BRANCO SEMINOVO', '350689751889144', 1850.0, 1750.0, 19, 'seminovo', 'bom', 'vendido', '2026-05-29', '2026-05-29', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-29', '2026-05-29', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('a6bc35ca-c1dd-4ec3-82c0-eb9cc5cf83a3', 11341, current_setting('importacao.cliente_id')::uuid, 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 1850.0, 1850.0, 0.0, '2026-05-29', '2026-05-29', '97f12885-87ad-426a-8bbb-656889d82e10');
UPDATE aparelhos SET venda_id = 'a6bc35ca-c1dd-4ec3-82c0-eb9cc5cf83a3' WHERE id = '173c6b37-40e3-42f4-bf00-906f51ffa15d';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('286e30c9-93b0-4ca2-984b-9d14014d45fb', 'a6bc35ca-c1dd-4ec3-82c0-eb9cc5cf83a3', 'pix', 1850.0, '2026-05-29', '97f12885-87ad-426a-8bbb-656889d82e10', 1);

-- === VENDA 11342: IPHONE 14 PRO MAX 512GB ROXO SEMINOVO (29/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('8c303330-8f64-4b0e-852b-b538b3499e28', 'Apple', 'IPHONE 14 PRO MAX 512GB ROXO SEMINOVO', '353360948256186', 3800.0, 2500.0, 19, 'seminovo', 'bom', 'vendido', '2026-05-29', '2026-05-29', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-29', '2026-05-29', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('12e1552c-5d53-4053-9720-e85cec5f5474', 11342, current_setting('importacao.cliente_id')::uuid, 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 3800.0, 3800.0, 0.0, '2026-05-29', '2026-05-29', '97f12885-87ad-426a-8bbb-656889d82e10');
UPDATE aparelhos SET venda_id = '12e1552c-5d53-4053-9720-e85cec5f5474' WHERE id = '8c303330-8f64-4b0e-852b-b538b3499e28';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('2f8f2c81-e76d-4e31-9b78-c1a5f65cb2c9', '12e1552c-5d53-4053-9720-e85cec5f5474', 'pix', 1700.0, '2026-05-29', '97f12885-87ad-426a-8bbb-656889d82e10', 1);
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, observacao, parcelas)
VALUES ('a2745cf1-f0e9-4d98-92e7-792b8cde3ee4', '12e1552c-5d53-4053-9720-e85cec5f5474', 'troca_aparelho', 2100.0, '2026-05-29', '97f12885-87ad-426a-8bbb-656889d82e10', 'Troca: IPH 12 PRO 256GB BRANCO', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('ba0c50fc-23da-4ae7-8165-8cecb832ac79', 19, '12e1552c-5d53-4053-9720-e85cec5f5474', 'Brinde', 25.0, '2026-05-29', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-29');

-- === VENDA 11343: IPHONE 17 PRO 512GB SILVER NOVO (29/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('11aa384d-6282-493f-9c68-e7a284aae620', 'Apple', 'IPHONE 17 PRO 512GB SILVER NOVO', '352001999333984', 8974.0, 8400.0, 19, 'novo', 'perfeito', 'vendido', '2026-05-29', '2026-05-29', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-29', '2026-05-29', 'Pagto junto (Aparelho 1/2, total grupo R$ 11,324)');
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('a887914f-b1f2-44dd-9737-ad4e518074f1', 11343, current_setting('importacao.cliente_id')::uuid, 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 8974.0, 8974.0, 0.0, '2026-05-29', '2026-05-29', '97f12885-87ad-426a-8bbb-656889d82e10');
UPDATE aparelhos SET venda_id = 'a887914f-b1f2-44dd-9737-ad4e518074f1' WHERE id = '11aa384d-6282-493f-9c68-e7a284aae620';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('7325bef8-8ee8-45ad-b882-013227a66335', 'a887914f-b1f2-44dd-9737-ad4e518074f1', 'pix', 6174.0, '2026-05-29', '97f12885-87ad-426a-8bbb-656889d82e10', 1);
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, observacao, parcelas)
VALUES ('7a452f60-c5d8-4cd9-96a0-6e1ddeeaf986', 'a887914f-b1f2-44dd-9737-ad4e518074f1', 'troca_aparelho', 2800.0, '2026-05-29', '97f12885-87ad-426a-8bbb-656889d82e10', 'Troca: IPH 15 PRO 256GB', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('63dc5918-22bc-46d3-8dfc-902e9626644d', 19, 'a887914f-b1f2-44dd-9737-ad4e518074f1', 'Brinde', 90.0, '2026-05-29', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-29');

-- === VENDA 11344: IPAD 11 128GB SILVER NOVO (29/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('6f440aed-880e-4bb8-9dd7-6e93b8da6f45', 'Apple', 'IPAD 11 128GB SILVER NOVO', 'J97T5Q77HRQ', 2350.0, 2150.0, 19, 'novo', 'perfeito', 'vendido', '2026-05-29', '2026-05-29', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-29', '2026-05-29', 'Pagto junto (Aparelho 2/2, total grupo R$ 11,324)');
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('68c286ae-e5a2-4acf-aa39-d95f7efa7422', 11344, current_setting('importacao.cliente_id')::uuid, 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 2350.0, 2350.0, 0.0, '2026-05-29', '2026-05-29', '97f12885-87ad-426a-8bbb-656889d82e10');
UPDATE aparelhos SET venda_id = '68c286ae-e5a2-4acf-aa39-d95f7efa7422' WHERE id = '6f440aed-880e-4bb8-9dd7-6e93b8da6f45';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('868b33dc-0565-4f1b-8041-b5d6a1bdd46e', '68c286ae-e5a2-4acf-aa39-d95f7efa7422', 'pix', 2350.0, '2026-05-29', '97f12885-87ad-426a-8bbb-656889d82e10', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('f0b5b670-94d4-48c3-a74f-7494b4fa6058', 19, '68c286ae-e5a2-4acf-aa39-d95f7efa7422', 'Brinde', 10.0, '2026-05-29', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-29');

-- === VENDA 11345: IPHONE 17 PRO 512GB SILVER NOVO (29/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('6f0a4b27-47b6-4c9e-92d4-27fc9abfafd2', 'Apple', 'IPHONE 17 PRO 512GB SILVER NOVO', '354289632214376', 8900.0, 8400.0, 19, 'novo', 'perfeito', 'vendido', '2026-05-29', '2026-05-29', 'b4269e60-eea2-4eba-a34d-db9591e0ec83', '2026-05-29', '2026-05-29', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('64074826-994e-4881-ad26-29fc62e1fa0d', 11345, current_setting('importacao.cliente_id')::uuid, 19, 'b4269e60-eea2-4eba-a34d-db9591e0ec83', 'concluida', 'normal', 8900.0, 8900.0, 0.0, '2026-05-29', '2026-05-29', 'b4269e60-eea2-4eba-a34d-db9591e0ec83');
UPDATE aparelhos SET venda_id = '64074826-994e-4881-ad26-29fc62e1fa0d' WHERE id = '6f0a4b27-47b6-4c9e-92d4-27fc9abfafd2';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, observacao, parcelas)
VALUES ('ce132cc9-4126-4da1-aeaf-b62643d2e34e', '64074826-994e-4881-ad26-29fc62e1fa0d', 'troca_aparelho', 8900.0, '2026-05-29', 'b4269e60-eea2-4eba-a34d-db9591e0ec83', 'Troca: 14 PRO 512GB PRETO; 17 PRO SILVER 256GB', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('bbb5cf86-d7c1-4412-b870-a4b541696141', 19, '64074826-994e-4881-ad26-29fc62e1fa0d', 'Brinde', 25.0, '2026-05-29', 'b4269e60-eea2-4eba-a34d-db9591e0ec83', '2026-05-29');

-- === VENDA 11346: IPHONE 17 PRO 256GB BRANCO SEMINOVO (30/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('fc9e618b-9993-4ea1-a462-28c348113e1b', 'Apple', 'IPHONE 17 PRO 256GB BRANCO SEMINOVO', '7679993104397', 6637.0, 6100.0, 1, 'seminovo', 'bom', 'vendido', '2026-05-30', '2026-05-30', 'e07d4d35-1381-4d4d-914d-8382a7456fdd', '2026-05-30', '2026-05-30', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('00bbb8d9-3566-4882-9816-a8c58b168a3c', 11346, current_setting('importacao.cliente_id')::uuid, 1, 'e07d4d35-1381-4d4d-914d-8382a7456fdd', 'concluida', 'normal', 6637.0, 6637.0, 0.0, '2026-05-30', '2026-05-30', 'e07d4d35-1381-4d4d-914d-8382a7456fdd');
UPDATE aparelhos SET venda_id = '00bbb8d9-3566-4882-9816-a8c58b168a3c' WHERE id = 'fc9e618b-9993-4ea1-a462-28c348113e1b';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('1d0863b2-2d23-4ffe-a18f-8e85c27d2558', '00bbb8d9-3566-4882-9816-a8c58b168a3c', 'pix', 1500.0, '2026-05-30', 'e07d4d35-1381-4d4d-914d-8382a7456fdd', 1);
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('854f8a60-349a-45e5-8d80-35d3106610b1', '00bbb8d9-3566-4882-9816-a8c58b168a3c', 'cartao_credito', 2237.0, '2026-05-30', 'e07d4d35-1381-4d4d-914d-8382a7456fdd', 1);
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, observacao, parcelas)
VALUES ('5d4e9fcd-694e-41bd-a1d5-196ded977326', '00bbb8d9-3566-4882-9816-a8c58b168a3c', 'troca_aparelho', 2900.0, '2026-05-30', 'e07d4d35-1381-4d4d-914d-8382a7456fdd', 'Troca: 15 PRO', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('557bfec4-74e3-4e8c-97ac-c6500a3dcba3', 1, '00bbb8d9-3566-4882-9816-a8c58b168a3c', 'Brinde', 210.0, '2026-05-30', 'e07d4d35-1381-4d4d-914d-8382a7456fdd', '2026-05-30');

-- === VENDA 11347: IPHONE 15 PRO MAX 256GB SEMINOVO (30/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('79e3da69-8bcc-4b30-8344-fcdccde83dd0', 'Apple', 'IPHONE 15 PRO MAX 256GB SEMINOVO', '356964465740436', 4000.0, 3700.0, 4, 'seminovo', 'bom', 'vendido', '2026-05-30', '2026-05-30', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-30', '2026-05-30', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('b8284a48-47e5-4a99-a744-26990118d84c', 11347, current_setting('importacao.cliente_id')::uuid, 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 4000.0, 4000.0, 0.0, '2026-05-30', '2026-05-30', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
UPDATE aparelhos SET venda_id = 'b8284a48-47e5-4a99-a744-26990118d84c' WHERE id = '79e3da69-8bcc-4b30-8344-fcdccde83dd0';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('6fdcb47c-5bcd-4aeb-8288-5254badfb6af', 'b8284a48-47e5-4a99-a744-26990118d84c', 'pix', 1300.0, '2026-05-30', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1);
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, observacao, parcelas)
VALUES ('bed9d2d7-1955-419d-8ca6-804d024e5d06', 'b8284a48-47e5-4a99-a744-26990118d84c', 'troca_aparelho', 2700.0, '2026-05-30', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'Troca: ENTROU UM 14 PRO MAX 128 POR', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('a40e9c3c-6f9e-4be6-aa40-14fa2e7d0009', 4, 'b8284a48-47e5-4a99-a744-26990118d84c', 'Brinde', 25.0, '2026-05-30', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-30');

-- === VENDA 11348: REDMI PAD 2 256GB PRETO NOVO (30/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('4c3db843-7686-4492-90df-88f957981d33', 'Xiaomi', 'REDMI PAD 2 256GB PRETO NOVO', '65577/W6PU00619', 1350.0, 1250.0, 20, 'novo', 'perfeito', 'vendido', '2026-05-30', '2026-05-30', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', '2026-05-30', '2026-05-30', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('dd30dd02-2968-4365-a49f-dedf7af67a17', 11348, current_setting('importacao.cliente_id')::uuid, 20, 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 'concluida', 'normal', 1350.0, 1350.0, 0.0, '2026-05-30', '2026-05-30', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4');
UPDATE aparelhos SET venda_id = 'dd30dd02-2968-4365-a49f-dedf7af67a17' WHERE id = '4c3db843-7686-4492-90df-88f957981d33';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('395ad82e-1b33-47d6-9ce7-33cdc891ce26', 'dd30dd02-2968-4365-a49f-dedf7af67a17', 'pix', 1350.0, '2026-05-30', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 1);

-- === VENDA 11349: IPHONE 15 128GB AZUL NOVO (30/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('a8711fbf-c375-421d-b02f-a75c539c726d', 'Apple', 'IPHONE 15 128GB AZUL NOVO', '355225779897630', 3900.0, 3750.0, 20, 'novo', 'perfeito', 'vendido', '2026-05-30', '2026-05-30', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', '2026-05-30', '2026-05-30', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('9e5a094a-850d-4268-83f2-24ae66cbcfef', 11349, current_setting('importacao.cliente_id')::uuid, 20, 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 'concluida', 'normal', 3900.0, 3900.0, 0.0, '2026-05-30', '2026-05-30', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4');
UPDATE aparelhos SET venda_id = '9e5a094a-850d-4268-83f2-24ae66cbcfef' WHERE id = 'a8711fbf-c375-421d-b02f-a75c539c726d';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('fb962c38-4805-418c-a3e6-32dea06f9e23', '9e5a094a-850d-4268-83f2-24ae66cbcfef', 'pix', 1000.0, '2026-05-30', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 1);
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('551aa730-7fbc-41d0-80be-46811541541b', '9e5a094a-850d-4268-83f2-24ae66cbcfef', 'cartao_credito', 2900.0, '2026-05-30', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('ad16fe4e-7076-4328-bb96-523637f41036', 20, '9e5a094a-850d-4268-83f2-24ae66cbcfef', 'Brinde', 10.0, '2026-05-30', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', '2026-05-30');

-- === VENDA 11350: IPHONE 16 PRO 256GB PRETO SEMINOVO (30/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('7f5a64c7-e0ef-423c-99db-86c4afaf6bb7', 'Apple', 'IPHONE 16 PRO 256GB PRETO SEMINOVO', '357463442372645', 4700.0, 4500.0, 4, 'seminovo', 'bom', 'vendido', '2026-05-30', '2026-05-30', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-30', '2026-05-30', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('ff59c54a-ef5c-46a0-aba2-39967a048f78', 11350, current_setting('importacao.cliente_id')::uuid, 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 4700.0, 4700.0, 0.0, '2026-05-30', '2026-05-30', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
UPDATE aparelhos SET venda_id = 'ff59c54a-ef5c-46a0-aba2-39967a048f78' WHERE id = '7f5a64c7-e0ef-423c-99db-86c4afaf6bb7';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('a3a8911d-43cc-4176-a114-33ea2b3ba403', 'ff59c54a-ef5c-46a0-aba2-39967a048f78', 'pix', 4400.0, '2026-05-30', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1);
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, observacao, parcelas)
VALUES ('ab627d4c-b656-45b2-bdc1-a65afd2a1692', 'ff59c54a-ef5c-46a0-aba2-39967a048f78', 'troca_aparelho', 300.0, '2026-05-30', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'Troca: XS MAX SEMINOVO', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('9974bdd3-8a13-44cd-96d2-473d8c193db3', 4, 'ff59c54a-ef5c-46a0-aba2-39967a048f78', 'Brinde', 25.0, '2026-05-30', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-30');

-- === VENDA 11351: IPHONE 17 PRO 256GB PRETO NOVO (30/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('beef1012-6e5c-4794-a0d8-c6c336fbe13e', 'Apple', 'IPHONE 17 PRO 256GB PRETO NOVO', '355820203650330', 7300.0, 6900.0, 4, 'novo', 'perfeito', 'vendido', '2026-05-30', '2026-05-30', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-30', '2026-05-30', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('54fc3f82-1c5d-4598-8910-b52d517dfd72', 11351, current_setting('importacao.cliente_id')::uuid, 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 7300.0, 7300.0, 0.0, '2026-05-30', '2026-05-30', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
UPDATE aparelhos SET venda_id = '54fc3f82-1c5d-4598-8910-b52d517dfd72' WHERE id = 'beef1012-6e5c-4794-a0d8-c6c336fbe13e';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('258fbe53-1c5f-477e-9107-1eb68d6a465f', '54fc3f82-1c5d-4598-8910-b52d517dfd72', 'cartao_credito', 4100.0, '2026-05-30', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1);
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, observacao, parcelas)
VALUES ('6198c589-86b7-49b0-9697-d98e545d88e8', '54fc3f82-1c5d-4598-8910-b52d517dfd72', 'troca_aparelho', 3200.0, '2026-05-30', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'Troca: 16 PRO 256 SEMINOVO', 1);

-- === VENDA 11352: IPHONE 13 256GB ROSA SEMINOVO (30/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('327f5976-5e31-42a5-8682-70d324cd8e80', 'Apple', 'IPHONE 13 256GB ROSA SEMINOVO', '352824489625845', 2300.0, 1900.0, 4, 'seminovo', 'bom', 'vendido', '2026-05-30', '2026-05-30', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-30', '2026-05-30', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('5b2b111b-0362-4022-838b-3b3d15c3a958', 11352, current_setting('importacao.cliente_id')::uuid, 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 2300.0, 2300.0, 0.0, '2026-05-30', '2026-05-30', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
UPDATE aparelhos SET venda_id = '5b2b111b-0362-4022-838b-3b3d15c3a958' WHERE id = '327f5976-5e31-42a5-8682-70d324cd8e80';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('ed8f9900-f319-4c1d-89e8-308be95cdd47', '5b2b111b-0362-4022-838b-3b3d15c3a958', 'cartao_credito', 2300.0, '2026-05-30', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('d08370cb-13fe-4cbd-9c9e-cbf4148e6fe3', 4, '5b2b111b-0362-4022-838b-3b3d15c3a958', 'Brinde', 25.0, '2026-05-30', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-30');

-- === VENDA 11353: IPHONE XS MAX 256GB DOURADO SEMINOVO (30/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('db7e0815-b79f-4fde-bac2-de659109185b', 'Apple', 'IPHONE XS MAX 256GB DOURADO SEMINOVO', '35112102108566', 350.0, 300.0, 4, 'seminovo', 'bom', 'vendido', '2026-05-30', '2026-05-30', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-30', '2026-05-30', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('a33ad7df-6c8a-49d4-a022-67dd2529d641', 11353, current_setting('importacao.cliente_id')::uuid, 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 350.0, 350.0, 0.0, '2026-05-30', '2026-05-30', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
UPDATE aparelhos SET venda_id = 'a33ad7df-6c8a-49d4-a022-67dd2529d641' WHERE id = 'db7e0815-b79f-4fde-bac2-de659109185b';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('99ed6b5a-3aa6-448e-91c0-2cc8d7c467f3', 'a33ad7df-6c8a-49d4-a022-67dd2529d641', 'pix', 350.0, '2026-05-30', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1);

-- === VENDA 11354: IPHONE 15 PRO  256GB AZUL SEMINOVO (30/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('e8442d45-a368-4fdf-b0c9-b8b3ee5bfe77', 'Apple', 'IPHONE 15 PRO  256GB AZUL SEMINOVO', '353864164761936', 3600.0, 3200.0, 19, 'seminovo', 'bom', 'vendido', '2026-05-30', '2026-05-30', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-30', '2026-05-30', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('05a90433-5f56-4512-a71d-ac3dbee409b7', 11354, current_setting('importacao.cliente_id')::uuid, 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 3600.0, 3600.0, 0.0, '2026-05-30', '2026-05-30', '97f12885-87ad-426a-8bbb-656889d82e10');
UPDATE aparelhos SET venda_id = '05a90433-5f56-4512-a71d-ac3dbee409b7' WHERE id = 'e8442d45-a368-4fdf-b0c9-b8b3ee5bfe77';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('23aa4a7d-7014-4118-9cec-05f7d5240df8', '05a90433-5f56-4512-a71d-ac3dbee409b7', 'pix', 2300.0, '2026-05-30', '97f12885-87ad-426a-8bbb-656889d82e10', 1);
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, observacao, parcelas)
VALUES ('459fc6dd-e62c-4e70-b741-996e01bc618c', '05a90433-5f56-4512-a71d-ac3dbee409b7', 'troca_aparelho', 1300.0, '2026-05-30', '97f12885-87ad-426a-8bbb-656889d82e10', 'Troca: IPH 12 PRO', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('7e4a104c-2115-4824-804b-46a634b83e2c', 19, '05a90433-5f56-4512-a71d-ac3dbee409b7', 'Brinde', 25.0, '2026-05-30', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-30');

-- === VENDA 11355: PARTY BOX 120 PRETA (30/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('c90070f7-0f59-4eaa-a2ba-7cfbc57998ef', 'Outros', 'PARTY BOX 120 PRETA', '58035038', 1800.0, 1700.0, 19, 'seminovo', 'bom', 'vendido', '2026-05-30', '2026-05-30', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-30', '2026-05-30', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('7542d2ce-cbdc-4511-8508-fcdfc25093f4', 11355, current_setting('importacao.cliente_id')::uuid, 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 1800.0, 1800.0, 0.0, '2026-05-30', '2026-05-30', '97f12885-87ad-426a-8bbb-656889d82e10');
UPDATE aparelhos SET venda_id = '7542d2ce-cbdc-4511-8508-fcdfc25093f4' WHERE id = 'c90070f7-0f59-4eaa-a2ba-7cfbc57998ef';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('b499df34-53ec-4fdd-915f-d1649248fb5f', '7542d2ce-cbdc-4511-8508-fcdfc25093f4', 'pix', 1800.0, '2026-05-30', '97f12885-87ad-426a-8bbb-656889d82e10', 1);

-- === VENDA 11356: IPHONE 17 PRO MAX 256GB AZUL NOVO (30/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('26118c48-2aad-4a75-bd21-d00f40df8ecc', 'Apple', 'IPHONE 17 PRO MAX 256GB AZUL NOVO', '350552893601530', 7950.0, 7550.0, 1, 'novo', 'perfeito', 'vendido', '2026-05-30', '2026-05-30', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-30', '2026-05-30', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('7c239db8-54ca-4929-b879-4be315e8a73e', 11356, current_setting('importacao.cliente_id')::uuid, 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 7950.0, 7950.0, 0.0, '2026-05-30', '2026-05-30', '85e3aa42-b9af-49b8-a72a-64e9c337aa53');
UPDATE aparelhos SET venda_id = '7c239db8-54ca-4929-b879-4be315e8a73e' WHERE id = '26118c48-2aad-4a75-bd21-d00f40df8ecc';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('f0b1c893-5a6f-47af-ac5c-6370b3973750', '7c239db8-54ca-4929-b879-4be315e8a73e', 'dinheiro', 3100.0, '2026-05-30', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 1);
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, observacao, parcelas)
VALUES ('7a469cf0-cd1e-41b4-90b2-a7f2c5c82bf8', '7c239db8-54ca-4929-b879-4be315e8a73e', 'troca_aparelho', 4850.0, '2026-05-30', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'Troca: IPH 16 PRO 256GB', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('7a5e9195-0644-4b09-a911-021d79e7a020', 1, '7c239db8-54ca-4929-b879-4be315e8a73e', 'Brinde', 25.0, '2026-05-30', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-30');

-- === VENDA 11357: MACBOOK NEO SILVER 256GB NOVO (30/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('d3f30f20-0520-41f4-aa94-f9895f3699f5', 'Apple', 'MACBOOK NEO SILVER 256GB NOVO', 'CR2N7W25Q1', 4422.0, 4300.0, 1, 'novo', 'perfeito', 'vendido', '2026-05-30', '2026-05-30', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-30', '2026-05-30', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('af231aa7-2c3f-4c1e-96df-a421da3d68bf', 11357, current_setting('importacao.cliente_id')::uuid, 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 4422.0, 4422.0, 0.0, '2026-05-30', '2026-05-30', '85e3aa42-b9af-49b8-a72a-64e9c337aa53');
UPDATE aparelhos SET venda_id = 'af231aa7-2c3f-4c1e-96df-a421da3d68bf' WHERE id = 'd3f30f20-0520-41f4-aa94-f9895f3699f5';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('379447e2-e585-4dc0-a7f0-ce92f4e41b30', 'af231aa7-2c3f-4c1e-96df-a421da3d68bf', 'pix', 4422.0, '2026-05-30', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 1);

-- === VENDA 11358: REDMI NOTE 15 256GB VERDE NOVO (30/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('d5f34c3f-9e67-4e21-8ee1-71a9be6d3007', 'Xiaomi', 'REDMI NOTE 15 256GB VERDE NOVO', '862795081570725', 1242.0, 1130.0, 1, 'novo', 'perfeito', 'vendido', '2026-05-30', '2026-05-30', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-30', '2026-05-30', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('a2cd80ea-74ec-467e-a60d-036732e6cd31', 11358, current_setting('importacao.cliente_id')::uuid, 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 1242.0, 1242.0, 0.0, '2026-05-30', '2026-05-30', '85e3aa42-b9af-49b8-a72a-64e9c337aa53');
UPDATE aparelhos SET venda_id = 'a2cd80ea-74ec-467e-a60d-036732e6cd31' WHERE id = 'd5f34c3f-9e67-4e21-8ee1-71a9be6d3007';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('8e10e548-2c1e-44b2-ab4e-c6c31d4863c7', 'a2cd80ea-74ec-467e-a60d-036732e6cd31', 'pix', 1242.0, '2026-05-30', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 1);

-- === VENDA 11359: IPHONE 14 PRO SEMINOVO 512GB PRETO (30/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('e857f813-b602-45e7-87fd-7ecfcd1c8c31', 'Apple', 'IPHONE 14 PRO SEMINOVO 512GB PRETO', '354256834755639', 3350.0, 2800.0, 1, 'seminovo', 'bom', 'vendido', '2026-05-30', '2026-05-30', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-30', '2026-05-30', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('937f5b08-090c-4010-a97c-b56fde78ea6c', 11359, current_setting('importacao.cliente_id')::uuid, 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 3350.0, 3350.0, 0.0, '2026-05-30', '2026-05-30', '85e3aa42-b9af-49b8-a72a-64e9c337aa53');
UPDATE aparelhos SET venda_id = '937f5b08-090c-4010-a97c-b56fde78ea6c' WHERE id = 'e857f813-b602-45e7-87fd-7ecfcd1c8c31';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('9d764f3d-8499-4d37-a48e-a47a24097ab4', '937f5b08-090c-4010-a97c-b56fde78ea6c', 'pix', 1800.0, '2026-05-30', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 1);
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, observacao, parcelas)
VALUES ('72c83c42-e5e4-4e59-b695-361b046ba740', '937f5b08-090c-4010-a97c-b56fde78ea6c', 'troca_aparelho', 1550.0, '2026-05-30', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'Troca: IPH 13', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('f7a683e9-9dc0-4250-bb14-b2521f87a8bb', 1, '937f5b08-090c-4010-a97c-b56fde78ea6c', 'Brinde', 10.0, '2026-05-30', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-30');

-- === VENDA 11360: IPHONE 16 PRO MAX 512GB PRETO SEMINOVO (30/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('5c7c65a4-b23b-460c-8af2-92dfc7d6846c', 'Apple', 'IPHONE 16 PRO MAX 512GB PRETO SEMINOVO', '357205981829942', 5714.0, 5150.0, 1, 'seminovo', 'bom', 'vendido', '2026-05-30', '2026-05-30', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-30', '2026-05-30', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('c117e814-91d0-4886-930b-48ce630eba1b', 11360, current_setting('importacao.cliente_id')::uuid, 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 5714.0, 5714.0, 0.0, '2026-05-30', '2026-05-30', '85e3aa42-b9af-49b8-a72a-64e9c337aa53');
UPDATE aparelhos SET venda_id = 'c117e814-91d0-4886-930b-48ce630eba1b' WHERE id = '5c7c65a4-b23b-460c-8af2-92dfc7d6846c';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('a06df0c5-ea27-4c91-a941-2d711d986ac9', 'c117e814-91d0-4886-930b-48ce630eba1b', 'pix', 4164.0, '2026-05-30', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 1);
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, observacao, parcelas)
VALUES ('924ebc2a-8335-41af-91e5-696318da40b6', 'c117e814-91d0-4886-930b-48ce630eba1b', 'troca_aparelho', 1550.0, '2026-05-30', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'Troca: IPH 13', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('bedd72fc-7b82-4b50-93f0-d3a6a47f387a', 1, 'c117e814-91d0-4886-930b-48ce630eba1b', 'Brinde', 25.0, '2026-05-30', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-30');

-- === VENDA 11361: IPHONE 13 PRO MAX 256GB AZUL SEMINOVO (30/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('eb836e36-0a07-4747-923b-f5d72b40eaf9', 'Apple', 'IPHONE 13 PRO MAX 256GB AZUL SEMINOVO', '351786564816337', 2900.0, 2800.0, 1, 'seminovo', 'bom', 'vendido', '2026-05-30', '2026-05-30', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-30', '2026-05-30', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('82dc85fc-00e7-4809-9c0a-ddaff9030710', 11361, current_setting('importacao.cliente_id')::uuid, 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 2900.0, 2900.0, 0.0, '2026-05-30', '2026-05-30', '85e3aa42-b9af-49b8-a72a-64e9c337aa53');
UPDATE aparelhos SET venda_id = '82dc85fc-00e7-4809-9c0a-ddaff9030710' WHERE id = 'eb836e36-0a07-4747-923b-f5d72b40eaf9';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('c1be6c37-7cc8-4804-a340-4bbf09a9f977', '82dc85fc-00e7-4809-9c0a-ddaff9030710', 'pix', 2900.0, '2026-05-30', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 1);

-- === VENDA 11362: POCO X7 PRO 512GB PRETO NOVO (30/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('e7430bfa-513c-4581-ba80-bd06a3f22a4c', 'Outros', 'POCO X7 PRO 512GB PRETO NOVO', '869471083013626', 2140.0, 1990.0, 20, 'novo', 'perfeito', 'vendido', '2026-05-30', '2026-05-30', '25e2da5b-9e76-4388-9890-7e22efd6940d', '2026-05-30', '2026-05-30', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('5d9097f3-d277-4fef-9e24-854c2d3d55bf', 11362, current_setting('importacao.cliente_id')::uuid, 20, '25e2da5b-9e76-4388-9890-7e22efd6940d', 'concluida', 'normal', 2140.0, 2140.0, 0.0, '2026-05-30', '2026-05-30', '25e2da5b-9e76-4388-9890-7e22efd6940d');
UPDATE aparelhos SET venda_id = '5d9097f3-d277-4fef-9e24-854c2d3d55bf' WHERE id = 'e7430bfa-513c-4581-ba80-bd06a3f22a4c';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('5d5447d9-5729-48eb-aa21-7b8f8d22b3eb', '5d9097f3-d277-4fef-9e24-854c2d3d55bf', 'cartao_credito', 2140.0, '2026-05-30', '25e2da5b-9e76-4388-9890-7e22efd6940d', 1);

-- === VENDA 11363: IPHONE 16 PRO 256GB DESERT SEMINOVO (31/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('4d57e24d-c7c2-444d-8102-fdc024b8dd6d', 'Apple', 'IPHONE 16 PRO 256GB DESERT SEMINOVO', '357592315867213', 4700.0, 4500.0, 4, 'seminovo', 'bom', 'vendido', '2026-05-31', '2026-05-31', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-31', '2026-05-31', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('af0ef3e4-421f-4cdd-8b82-215ac4eaca6f', 11363, current_setting('importacao.cliente_id')::uuid, 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 4700.0, 4700.0, 0.0, '2026-05-31', '2026-05-31', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
UPDATE aparelhos SET venda_id = 'af0ef3e4-421f-4cdd-8b82-215ac4eaca6f' WHERE id = '4d57e24d-c7c2-444d-8102-fdc024b8dd6d';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('71cc15ef-3ae9-47fc-80bf-d43a662bf6aa', 'af0ef3e4-421f-4cdd-8b82-215ac4eaca6f', 'pix', 4700.0, '2026-05-31', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('0195f3c4-8c28-485c-8bad-b24279895bf1', 4, 'af0ef3e4-421f-4cdd-8b82-215ac4eaca6f', 'Brinde', 25.0, '2026-05-31', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-31');

-- === VENDA 11364: IPAD 11° A16 128GB SILVER NOVO (31/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('58f6da2b-bc59-4cc6-a4d3-a95f0463043c', 'Apple', 'IPAD 11° A16 128GB SILVER NOVO', 'HGY4F5FC96', 2500.0, 2150.0, 4, 'novo', 'perfeito', 'vendido', '2026-05-31', '2026-05-31', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-31', '2026-05-31', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('64c06e5c-6d06-4d31-a0af-d50616b69dd2', 11364, current_setting('importacao.cliente_id')::uuid, 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 2500.0, 2500.0, 0.0, '2026-05-31', '2026-05-31', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
UPDATE aparelhos SET venda_id = '64c06e5c-6d06-4d31-a0af-d50616b69dd2' WHERE id = '58f6da2b-bc59-4cc6-a4d3-a95f0463043c';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('fff9198e-b826-40d5-bbcc-c508248a8351', '64c06e5c-6d06-4d31-a0af-d50616b69dd2', 'pix', 700.0, '2026-05-31', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1);
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('a163b2f8-35dd-426d-814a-9e89b5eb3c1c', '64c06e5c-6d06-4d31-a0af-d50616b69dd2', 'cartao_credito', 1800.0, '2026-05-31', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('2ef6de84-ffdb-4cff-823c-20ca9864fda6', 4, '64c06e5c-6d06-4d31-a0af-d50616b69dd2', 'Brinde', 150.0, '2026-05-31', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-31');

-- === VENDA 11365: POCO C85 PRETO 256GB NOVO (31/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('dbf8a286-10f1-4629-ab31-2e876bdbee29', 'Outros', 'POCO C85 PRETO 256GB NOVO', '69385/65ZH01514', 1000.0, 890.0, 20, 'novo', 'perfeito', 'vendido', '2026-05-31', '2026-05-31', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', '2026-05-31', '2026-05-31', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('df4800bc-e003-4ff2-8e68-6770882532b2', 11365, current_setting('importacao.cliente_id')::uuid, 20, 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 'concluida', 'normal', 1000.0, 1000.0, 0.0, '2026-05-31', '2026-05-31', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4');
UPDATE aparelhos SET venda_id = 'df4800bc-e003-4ff2-8e68-6770882532b2' WHERE id = 'dbf8a286-10f1-4629-ab31-2e876bdbee29';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('b33dcf8f-d131-40fa-9ab4-be06fea98090', 'df4800bc-e003-4ff2-8e68-6770882532b2', 'cartao_credito', 1000.0, '2026-05-31', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 1);

-- === VENDA 11366: IPHONE 16 128GB AZUL NOVO (31/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('d322fb94-db0f-4b4f-8ece-552e1a815218', 'Apple', 'IPHONE 16 128GB AZUL NOVO', '353317874110720', 4050.0, 3950.0, 20, 'novo', 'perfeito', 'vendido', '2026-05-31', '2026-05-31', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', '2026-05-31', '2026-05-31', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('b2142253-6957-4d5f-af76-d6d561c06f33', 11366, current_setting('importacao.cliente_id')::uuid, 20, 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 'concluida', 'normal', 4050.0, 4050.0, 0.0, '2026-05-31', '2026-05-31', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4');
UPDATE aparelhos SET venda_id = 'b2142253-6957-4d5f-af76-d6d561c06f33' WHERE id = 'd322fb94-db0f-4b4f-8ece-552e1a815218';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('c31e5796-8b1b-489b-ae78-0ed88c80d895', 'b2142253-6957-4d5f-af76-d6d561c06f33', 'pix', 4050.0, '2026-05-31', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 1);

-- === VENDA 11367: IPHONE 13 128GB AZUL SEMINOVO (31/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('6836a28a-2b13-41e3-a0b3-311c6b39dd7f', 'Apple', 'IPHONE 13 128GB AZUL SEMINOVO', '352873836693105', 1900.0, 1780.0, 20, 'seminovo', 'bom', 'vendido', '2026-05-31', '2026-05-31', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', '2026-05-31', '2026-05-31', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('6df3ad65-3fcb-4163-b10d-7daeb1cc7bac', 11367, current_setting('importacao.cliente_id')::uuid, 20, 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 'concluida', 'normal', 1900.0, 1900.0, 0.0, '2026-05-31', '2026-05-31', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4');
UPDATE aparelhos SET venda_id = '6df3ad65-3fcb-4163-b10d-7daeb1cc7bac' WHERE id = '6836a28a-2b13-41e3-a0b3-311c6b39dd7f';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('abb644b9-f87d-4152-bfea-91647a18ef13', '6df3ad65-3fcb-4163-b10d-7daeb1cc7bac', 'pix', 1900.0, '2026-05-31', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 1);

-- === VENDA 11368: POCO C85 PRETO 256GB NOVO (31/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('ca8d3acd-7353-4b07-a6b4-0c1001790c59', 'Outros', 'POCO C85 PRETO 256GB NOVO', '69374/65YT14295', 990.0, 890.0, 20, 'novo', 'perfeito', 'vendido', '2026-05-31', '2026-05-31', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', '2026-05-31', '2026-05-31', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('bfaa307b-9019-40cb-a36b-c0897a9858c0', 11368, current_setting('importacao.cliente_id')::uuid, 20, 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 'concluida', 'normal', 990.0, 990.0, 0.0, '2026-05-31', '2026-05-31', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4');
UPDATE aparelhos SET venda_id = 'bfaa307b-9019-40cb-a36b-c0897a9858c0' WHERE id = 'ca8d3acd-7353-4b07-a6b4-0c1001790c59';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('f6ca1254-69ce-4108-b92b-51407d099cfa', 'bfaa307b-9019-40cb-a36b-c0897a9858c0', 'pix', 500.0, '2026-05-31', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 1);
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('a8b78a2e-8e50-414f-9edf-18db31bfb9f7', 'bfaa307b-9019-40cb-a36b-c0897a9858c0', 'cartao_credito', 490.0, '2026-05-31', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 1);

-- === VENDA 11369: IPHONE 17 PRO 256GB AZUL NOVO (31/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('61e38503-3ba3-412b-82a5-295a9d306556', 'Apple', 'IPHONE 17 PRO 256GB AZUL NOVO', '359477633520876', 7300.0, 7000.0, 19, 'novo', 'perfeito', 'vendido', '2026-05-31', '2026-05-31', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-31', '2026-05-31', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('6910ab51-c53c-4e94-9d25-6d6816570558', 11369, current_setting('importacao.cliente_id')::uuid, 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 7300.0, 7300.0, 0.0, '2026-05-31', '2026-05-31', '97f12885-87ad-426a-8bbb-656889d82e10');
UPDATE aparelhos SET venda_id = '6910ab51-c53c-4e94-9d25-6d6816570558' WHERE id = '61e38503-3ba3-412b-82a5-295a9d306556';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('11c41e18-fb49-4c42-99e6-7649dbbae9ee', '6910ab51-c53c-4e94-9d25-6d6816570558', 'pix', 7300.0, '2026-05-31', '97f12885-87ad-426a-8bbb-656889d82e10', 1);

-- === VENDA 11370: JBL BOOMBOX 4 PRETO NOVO (31/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('938c7a6a-aa06-4d33-aeb1-21ebf0cf5318', 'Outros', 'JBL BOOMBOX 4 PRETO NOVO', 'TL1876-CQ0217088', 2434.0, 2190.0, 19, 'novo', 'perfeito', 'vendido', '2026-05-31', '2026-05-31', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-31', '2026-05-31', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('d2760f09-4427-4a98-a99c-943fecdd8056', 11370, current_setting('importacao.cliente_id')::uuid, 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 2434.0, 2434.0, 0.0, '2026-05-31', '2026-05-31', '97f12885-87ad-426a-8bbb-656889d82e10');
UPDATE aparelhos SET venda_id = 'd2760f09-4427-4a98-a99c-943fecdd8056' WHERE id = '938c7a6a-aa06-4d33-aeb1-21ebf0cf5318';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('0a4f2bc5-9f52-43ff-b4c1-a791204240b4', 'd2760f09-4427-4a98-a99c-943fecdd8056', 'pix', 2290.0, '2026-05-31', '97f12885-87ad-426a-8bbb-656889d82e10', 1);
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('e9d0d802-e17f-4cdb-9639-d98adfea17e9', 'd2760f09-4427-4a98-a99c-943fecdd8056', 'cartao_credito', 144.0, '2026-05-31', '97f12885-87ad-426a-8bbb-656889d82e10', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('6db3602c-6c58-4273-a8a7-27289d0feb23', 19, 'd2760f09-4427-4a98-a99c-943fecdd8056', 'Brinde', 95.0, '2026-05-31', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-31');

-- === VENDA 11371: JBL BOOMBOX 4 BRANCA NOVO (31/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('c3adb800-9f1a-42d5-aac1-5f6e73728e1c', 'Outros', 'JBL BOOMBOX 4 BRANCA NOVO', 'TL1878-LP0013380', 2276.0, 2190.0, 19, 'novo', 'perfeito', 'vendido', '2026-05-31', '2026-05-31', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-31', '2026-05-31', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('57506f0d-b563-40f4-b189-bf530688aa8c', 11371, current_setting('importacao.cliente_id')::uuid, 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 2276.0, 2276.0, 0.0, '2026-05-31', '2026-05-31', '97f12885-87ad-426a-8bbb-656889d82e10');
UPDATE aparelhos SET venda_id = '57506f0d-b563-40f4-b189-bf530688aa8c' WHERE id = 'c3adb800-9f1a-42d5-aac1-5f6e73728e1c';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('fbdc1d0d-d72d-45fb-b9ca-d228c702de3f', '57506f0d-b563-40f4-b189-bf530688aa8c', 'cartao_credito', 2276.0, '2026-05-31', '97f12885-87ad-426a-8bbb-656889d82e10', 1);

-- === VENDA 11372: PENCIL PRO NOVO (31/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('1f5d0410-978f-44c5-abde-2388e837d138', 'Outros', 'PENCIL PRO NOVO', 'CTV20GVQFL', 870.0, 710.0, 1, 'novo', 'perfeito', 'vendido', '2026-05-31', '2026-05-31', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-31', '2026-05-31', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('cbca5e0d-2647-4559-87b5-44d8a5751c3b', 11372, current_setting('importacao.cliente_id')::uuid, 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 870.0, 870.0, 0.0, '2026-05-31', '2026-05-31', '85e3aa42-b9af-49b8-a72a-64e9c337aa53');
UPDATE aparelhos SET venda_id = 'cbca5e0d-2647-4559-87b5-44d8a5751c3b' WHERE id = '1f5d0410-978f-44c5-abde-2388e837d138';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('4fde82e5-63b9-4399-b15c-e8b932b018d0', 'cbca5e0d-2647-4559-87b5-44d8a5751c3b', 'pix', 870.0, '2026-05-31', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 1);

-- === VENDA 11373: IPHONE 13 128GB ROSA SEMINOVO (31/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('45245f57-b122-4dd6-8ae3-6eb770fe4194', 'Apple', 'IPHONE 13 128GB ROSA SEMINOVO', '355958936427210', 2147.0, 1750.0, 1, 'seminovo', 'bom', 'vendido', '2026-05-31', '2026-05-31', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-31', '2026-05-31', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('490cecc9-c396-4a0f-bfa7-0bf7990f4cd7', 11373, current_setting('importacao.cliente_id')::uuid, 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 2147.0, 2147.0, 0.0, '2026-05-31', '2026-05-31', '85e3aa42-b9af-49b8-a72a-64e9c337aa53');
UPDATE aparelhos SET venda_id = '490cecc9-c396-4a0f-bfa7-0bf7990f4cd7' WHERE id = '45245f57-b122-4dd6-8ae3-6eb770fe4194';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('de2008b6-4926-4436-8d82-ba89d915fc11', '490cecc9-c396-4a0f-bfa7-0bf7990f4cd7', 'pix', 2147.0, '2026-05-31', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('2115f420-3a9e-471c-a8da-6ca279a0a883', 1, '490cecc9-c396-4a0f-bfa7-0bf7990f4cd7', 'Brinde', 25.0, '2026-05-31', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-31');

-- === VENDA 11374: IPHONE 17 PRO MAX 256GB AZUL NOVO (31/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('fc86e22f-4820-4805-87e7-89015709d363', 'Apple', 'IPHONE 17 PRO MAX 256GB AZUL NOVO', '355988219255368', 7618.0, 7230.0, 1, 'novo', 'perfeito', 'vendido', '2026-05-31', '2026-05-31', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-31', '2026-05-31', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('4b1fb5a0-408f-4414-88a6-5d25a2abfc96', 11374, current_setting('importacao.cliente_id')::uuid, 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 7618.0, 7618.0, 0.0, '2026-05-31', '2026-05-31', '85e3aa42-b9af-49b8-a72a-64e9c337aa53');
UPDATE aparelhos SET venda_id = '4b1fb5a0-408f-4414-88a6-5d25a2abfc96' WHERE id = 'fc86e22f-4820-4805-87e7-89015709d363';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('7095f032-4680-46c0-afd3-54ae892163fc', '4b1fb5a0-408f-4414-88a6-5d25a2abfc96', 'pix', 5168.0, '2026-05-31', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 1);
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, observacao, parcelas)
VALUES ('7cbe87fb-f214-47d8-a1b3-2b8f637988cd', '4b1fb5a0-408f-4414-88a6-5d25a2abfc96', 'troca_aparelho', 2450.0, '2026-05-31', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'Troca: IPH 13 PRO', 1);

-- === VENDA 11375: IPHONE 11 64GB PRETO SEMINOVO (31/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('5067d9a4-fd07-4c20-899d-9cd3f2665c0a', 'Apple', 'IPHONE 11 64GB PRETO SEMINOVO', '357879829564513', 850.0, 600.0, 1, 'seminovo', 'bom', 'vendido', '2026-05-31', '2026-05-31', 'e07d4d35-1381-4d4d-914d-8382a7456fdd', '2026-05-31', '2026-05-31', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('da3312ca-30e4-4339-bf0a-cd2f9376dec4', 11375, current_setting('importacao.cliente_id')::uuid, 1, 'e07d4d35-1381-4d4d-914d-8382a7456fdd', 'concluida', 'normal', 850.0, 850.0, 0.0, '2026-05-31', '2026-05-31', 'e07d4d35-1381-4d4d-914d-8382a7456fdd');
UPDATE aparelhos SET venda_id = 'da3312ca-30e4-4339-bf0a-cd2f9376dec4' WHERE id = '5067d9a4-fd07-4c20-899d-9cd3f2665c0a';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('840be1a0-dc33-4b07-a6e5-ab54f264d33f', 'da3312ca-30e4-4339-bf0a-cd2f9376dec4', 'pix', 850.0, '2026-05-31', 'e07d4d35-1381-4d4d-914d-8382a7456fdd', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('18f60c9b-9f67-437d-a30a-c1d42b93e043', 1, 'da3312ca-30e4-4339-bf0a-cd2f9376dec4', 'Brinde', 25.0, '2026-05-31', 'e07d4d35-1381-4d4d-914d-8382a7456fdd', '2026-05-31');

-- === VENDA 11376: IPHONE 14 PRO 128GB BRANCO SEMINOVO (31/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('f33803b3-4b33-4768-94e4-e55a14edd67c', 'Apple', 'IPHONE 14 PRO 128GB BRANCO SEMINOVO', '351284081590783', 2950.0, 2700.0, 20, 'seminovo', 'bom', 'vendido', '2026-05-31', '2026-05-31', '25e2da5b-9e76-4388-9890-7e22efd6940d', '2026-05-31', '2026-05-31', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('6c272f82-c728-40ab-83c3-d391a5dbc181', 11376, current_setting('importacao.cliente_id')::uuid, 20, '25e2da5b-9e76-4388-9890-7e22efd6940d', 'concluida', 'normal', 2950.0, 2950.0, 0.0, '2026-05-31', '2026-05-31', '25e2da5b-9e76-4388-9890-7e22efd6940d');
UPDATE aparelhos SET venda_id = '6c272f82-c728-40ab-83c3-d391a5dbc181' WHERE id = 'f33803b3-4b33-4768-94e4-e55a14edd67c';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('acc75a6b-938e-4b8e-a38c-78238b3f9494', '6c272f82-c728-40ab-83c3-d391a5dbc181', 'pix', 2950.0, '2026-05-31', '25e2da5b-9e76-4388-9890-7e22efd6940d', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('299e1af9-6e39-4c3b-b670-c2fd35248a74', 20, '6c272f82-c728-40ab-83c3-d391a5dbc181', 'Brinde', 25.0, '2026-05-31', '25e2da5b-9e76-4388-9890-7e22efd6940d', '2026-05-31');

-- === VENDA 11377: GALAXY A11+ 5G SPACE GRAY 128GB NOVO (02/06/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('92033100-10fc-4aa0-9220-5fce64aa07cf', 'Outros', 'GALAXY A11+ 5G SPACE GRAY 128GB NOVO', '356911420294546', 2180.0, 1700.0, 1, 'novo', 'perfeito', 'vendido', '2026-06-02', '2026-06-02', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-06-02', '2026-06-02', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('24e2e618-1526-4e09-b2ba-3e3d0173cfcc', 11377, current_setting('importacao.cliente_id')::uuid, 1, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 2180.0, 2180.0, 0.0, '2026-06-02', '2026-06-02', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
UPDATE aparelhos SET venda_id = '24e2e618-1526-4e09-b2ba-3e3d0173cfcc' WHERE id = '92033100-10fc-4aa0-9220-5fce64aa07cf';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('028eec23-c7c7-449e-a59e-0f218c7a0231', '24e2e618-1526-4e09-b2ba-3e3d0173cfcc', 'pix', 2180.0, '2026-06-02', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('40dc6161-d022-471f-8030-74a5eb25b3d6', 1, '24e2e618-1526-4e09-b2ba-3e3d0173cfcc', 'Brinde', 170.0, '2026-06-02', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-06-02');

-- === VENDA 11378: IPHONE 14 PRO 256GB PRETO SEMINOVO (02/06/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('a97a6bcb-edf6-4c36-ab3d-e6b97bf18e9d', 'Apple', 'IPHONE 14 PRO 256GB PRETO SEMINOVO', NULL, 3050.0, 2900.0, 20, 'seminovo', 'bom', 'vendido', '2026-06-02', '2026-06-02', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', '2026-06-02', '2026-06-02', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('c4710c55-1333-4afb-ad96-357da279f61e', 11378, current_setting('importacao.cliente_id')::uuid, 20, 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 'concluida', 'normal', 3050.0, 3050.0, 0.0, '2026-06-02', '2026-06-02', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4');
UPDATE aparelhos SET venda_id = 'c4710c55-1333-4afb-ad96-357da279f61e' WHERE id = 'a97a6bcb-edf6-4c36-ab3d-e6b97bf18e9d';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('5b33c223-7380-4351-8eb8-a3c4b717561f', 'c4710c55-1333-4afb-ad96-357da279f61e', 'pix', 1734.0, '2026-06-02', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 1);
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('954eeec4-4de2-429a-b73e-e9a995823006', 'c4710c55-1333-4afb-ad96-357da279f61e', 'cartao_credito', 1316.0, '2026-06-02', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('67bdcc4e-1d63-4a71-aeec-87204979d379', 20, 'c4710c55-1333-4afb-ad96-357da279f61e', 'Brinde', 10.0, '2026-06-02', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', '2026-06-02');

-- === VENDA 11379: MAGIC MOUSE 3 BRANCO NOVO (02/06/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('a0f1c02f-bb58-497d-81bb-68c7b6d3c3a4', 'Outros', 'MAGIC MOUSE 3 BRANCO NOVO', 'J84HN004QLB0000539', 760.0, 660.0, 19, 'novo', 'perfeito', 'vendido', '2026-06-02', '2026-06-02', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-06-02', '2026-06-02', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('fc970fba-26a0-4bae-b82f-21911f345628', 11379, current_setting('importacao.cliente_id')::uuid, 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 760.0, 760.0, 0.0, '2026-06-02', '2026-06-02', '97f12885-87ad-426a-8bbb-656889d82e10');
UPDATE aparelhos SET venda_id = 'fc970fba-26a0-4bae-b82f-21911f345628' WHERE id = 'a0f1c02f-bb58-497d-81bb-68c7b6d3c3a4';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('21f6b357-9182-48f0-aaab-d8ef50237e14', 'fc970fba-26a0-4bae-b82f-21911f345628', 'pix', 760.0, '2026-06-02', '97f12885-87ad-426a-8bbb-656889d82e10', 1);

-- === VENDA 11380: IPHONE 17 PRO MAX 256GB SILVER NOVO (02/06/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('505796b4-0eaa-43af-b299-ea2cf1ba7f09', 'Apple', 'IPHONE 17 PRO MAX 256GB SILVER NOVO', '357247257394938', 7750.0, 7500.0, 19, 'novo', 'perfeito', 'vendido', '2026-06-02', '2026-06-02', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-06-02', '2026-06-02', 'Pagto junto (Aparelho 1/2, total grupo R$ 15,500)');
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('c1ef8621-042d-46b3-9cd9-4113c67d3008', 11380, current_setting('importacao.cliente_id')::uuid, 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 7750.0, 7750.0, 0.0, '2026-06-02', '2026-06-02', '97f12885-87ad-426a-8bbb-656889d82e10');
UPDATE aparelhos SET venda_id = 'c1ef8621-042d-46b3-9cd9-4113c67d3008' WHERE id = '505796b4-0eaa-43af-b299-ea2cf1ba7f09';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('468fe67a-bc68-4a9c-a732-ef36ee9a1fd9', 'c1ef8621-042d-46b3-9cd9-4113c67d3008', 'dinheiro', 7750.0, '2026-06-02', '97f12885-87ad-426a-8bbb-656889d82e10', 1);

-- === VENDA 11381: IPHONE 17 PRO MAX 256GB SILVER NOVO (02/06/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('c22096e0-7ed7-4edd-b36f-fe56cb54e893', 'Apple', 'IPHONE 17 PRO MAX 256GB SILVER NOVO', '357247256875010', 7750.0, 7500.0, 19, 'novo', 'perfeito', 'vendido', '2026-06-02', '2026-06-02', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-06-02', '2026-06-02', 'Pagto junto (Aparelho 2/2, total grupo R$ 15,500)');
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('009b1a96-f8d1-47fd-8cce-cb3660a5f8ac', 11381, current_setting('importacao.cliente_id')::uuid, 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 7750.0, 7750.0, 0.0, '2026-06-02', '2026-06-02', '97f12885-87ad-426a-8bbb-656889d82e10');
UPDATE aparelhos SET venda_id = '009b1a96-f8d1-47fd-8cce-cb3660a5f8ac' WHERE id = 'c22096e0-7ed7-4edd-b36f-fe56cb54e893';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('9ecbb964-238b-4a7d-8867-50727dd31c38', '009b1a96-f8d1-47fd-8cce-cb3660a5f8ac', 'dinheiro', 1450.0, '2026-06-02', '97f12885-87ad-426a-8bbb-656889d82e10', 1);
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, observacao, parcelas)
VALUES ('c29910fb-ebe8-498b-ad42-d9da2cf250ee', '009b1a96-f8d1-47fd-8cce-cb3660a5f8ac', 'troca_aparelho', 6300.0, '2026-06-02', '97f12885-87ad-426a-8bbb-656889d82e10', 'Troca: IPH 17 PRO SILVER', 1);

-- === VENDA 11382: BOOMBOX 4 BRANCA NOVA (03/06/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('e1e79bd9-785c-4344-a1f9-4e477cd8fad5', 'Outros', 'BOOMBOX 4 BRANCA NOVA', 'TL1878-AQ0021235', 2405.0, 2250.0, 4, 'seminovo', 'bom', 'vendido', '2026-06-03', '2026-06-03', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-06-03', '2026-06-03', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('faf1b8a0-ec4e-4cc5-bc06-434bfe40c211', 11382, current_setting('importacao.cliente_id')::uuid, 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 2405.0, 2405.0, 0.0, '2026-06-03', '2026-06-03', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
UPDATE aparelhos SET venda_id = 'faf1b8a0-ec4e-4cc5-bc06-434bfe40c211' WHERE id = 'e1e79bd9-785c-4344-a1f9-4e477cd8fad5';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('f8a7a1ca-60c7-4bd0-b402-ddc51aa51a7f', 'faf1b8a0-ec4e-4cc5-bc06-434bfe40c211', 'cartao_credito', 2405.0, '2026-06-03', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('32424708-0146-46fc-8039-3b27db1c4039', 4, 'faf1b8a0-ec4e-4cc5-bc06-434bfe40c211', 'Brinde', 20.0, '2026-06-03', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-06-03');

-- === VENDA 11383: IPHONE 12 PRO MAX 128GB GRAFITE SEMINOVO (03/06/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('6e047780-ecac-47db-b0f4-52fdd31a10d5', 'Apple', 'IPHONE 12 PRO MAX 128GB GRAFITE SEMINOVO', '351330881416677', 2250.0, 2000.0, 1, 'seminovo', 'bom', 'vendido', '2026-06-03', '2026-06-03', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-06-03', '2026-06-03', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('637e8e97-251b-4556-92fa-5eb97553b713', 11383, current_setting('importacao.cliente_id')::uuid, 1, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 2250.0, 2250.0, 0.0, '2026-06-03', '2026-06-03', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
UPDATE aparelhos SET venda_id = '637e8e97-251b-4556-92fa-5eb97553b713' WHERE id = '6e047780-ecac-47db-b0f4-52fdd31a10d5';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('8438c8ba-e1a4-4da3-95f8-a501f532a75a', '637e8e97-251b-4556-92fa-5eb97553b713', 'pix', 2250.0, '2026-06-03', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('1d4c185b-af67-4cd1-a227-6b6868827ce6', 1, '637e8e97-251b-4556-92fa-5eb97553b713', 'Brinde', 25.0, '2026-06-03', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-06-03');

-- === VENDA 11384: IPHONE 16 PRO MAX 512GB PRETO SEMINOVO (03/06/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('ad305961-c76d-4b51-acb3-66acf11016ca', 'Apple', 'IPHONE 16 PRO MAX 512GB PRETO SEMINOVO', '355300181430419', 6049.0, 5150.0, 4, 'seminovo', 'bom', 'vendido', '2026-06-03', '2026-06-03', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-06-03', '2026-06-03', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('d98d4999-ff26-420f-b198-93e507dcf3ff', 11384, current_setting('importacao.cliente_id')::uuid, 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 6049.0, 6049.0, 0.0, '2026-06-03', '2026-06-03', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
UPDATE aparelhos SET venda_id = 'd98d4999-ff26-420f-b198-93e507dcf3ff' WHERE id = 'ad305961-c76d-4b51-acb3-66acf11016ca';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('d96029bd-13fa-4bb0-8b6c-ef0678784144', 'd98d4999-ff26-420f-b198-93e507dcf3ff', 'cartao_credito', 6049.0, '2026-06-03', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('1a0ed060-6d5b-40c3-8056-097f140b7389', 4, 'd98d4999-ff26-420f-b198-93e507dcf3ff', 'Brinde', 90.0, '2026-06-03', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-06-03');

-- === VENDA 11385: NOTE 15 PRO 5G 256GB PRETO NOVO (03/06/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('0804f674-6d86-4731-b628-c4be4e5fc1a8', 'Redmi', 'NOTE 15 PRO 5G 256GB PRETO NOVO', '863573083678542', 1857.0, 1680.0, 4, 'novo', 'perfeito', 'vendido', '2026-06-03', '2026-06-03', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-06-03', '2026-06-03', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('aacbee7c-161e-4ba6-be3f-463b727fa82e', 11385, current_setting('importacao.cliente_id')::uuid, 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 1857.0, 1857.0, 0.0, '2026-06-03', '2026-06-03', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
UPDATE aparelhos SET venda_id = 'aacbee7c-161e-4ba6-be3f-463b727fa82e' WHERE id = '0804f674-6d86-4731-b628-c4be4e5fc1a8';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('7ae62f5b-cca1-4d7f-a328-7858cee92591', 'aacbee7c-161e-4ba6-be3f-463b727fa82e', 'cartao_credito', 1857.0, '2026-06-03', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1);

-- === VENDA 11386: IPHONE 15 PRO MAX 256GB PRETO SEMINOVO (03/06/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('3261ea98-7b73-49fb-a0ff-30e15742a41b', 'Apple', 'IPHONE 15 PRO MAX 256GB PRETO SEMINOVO', '357275797266613', 4140.0, 3700.0, 19, 'seminovo', 'bom', 'vendido', '2026-06-03', '2026-06-03', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-06-03', '2026-06-03', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('0805bc61-c962-4357-8c23-de652f049acf', 11386, current_setting('importacao.cliente_id')::uuid, 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 4140.0, 4140.0, 0.0, '2026-06-03', '2026-06-03', '97f12885-87ad-426a-8bbb-656889d82e10');
UPDATE aparelhos SET venda_id = '0805bc61-c962-4357-8c23-de652f049acf' WHERE id = '3261ea98-7b73-49fb-a0ff-30e15742a41b';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('32488758-0ac2-4028-a30c-9f059d2078e5', '0805bc61-c962-4357-8c23-de652f049acf', 'cartao_credito', 4140.0, '2026-06-03', '97f12885-87ad-426a-8bbb-656889d82e10', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('48f58625-1208-42a1-8436-f39a8fa2cecd', 19, '0805bc61-c962-4357-8c23-de652f049acf', 'Brinde', 40.0, '2026-06-03', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-06-03');

-- === VENDA 11387: POCO PAD M1 256GB PRETO NOVO (03/06/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('87b67620-16c4-4911-a3b9-bc9c48cde5b5', 'Outros', 'POCO PAD M1 256GB PRETO NOVO', '71114/Y5XS01610', 1560.0, 1510.0, 19, 'novo', 'perfeito', 'vendido', '2026-06-03', '2026-06-03', 'b4269e60-eea2-4eba-a34d-db9591e0ec83', '2026-06-03', '2026-06-03', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('973b6bdf-526d-4719-9b31-f151203a468b', 11387, current_setting('importacao.cliente_id')::uuid, 19, 'b4269e60-eea2-4eba-a34d-db9591e0ec83', 'concluida', 'normal', 1560.0, 1560.0, 0.0, '2026-06-03', '2026-06-03', 'b4269e60-eea2-4eba-a34d-db9591e0ec83');
UPDATE aparelhos SET venda_id = '973b6bdf-526d-4719-9b31-f151203a468b' WHERE id = '87b67620-16c4-4911-a3b9-bc9c48cde5b5';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('e29c9e78-1d59-429b-82f8-c62d3ac22bbb', '973b6bdf-526d-4719-9b31-f151203a468b', 'pix', 1560.0, '2026-06-03', 'b4269e60-eea2-4eba-a34d-db9591e0ec83', 1);

-- === VENDA 11388: GALAXY A36 256GB PRETO NOVO (03/06/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('9cd5fafa-8cb1-4054-8d1d-a69edb2922c7', 'Outros', 'GALAXY A36 256GB PRETO NOVO', '352230462132793', 1514.0, 1420.0, 20, 'novo', 'perfeito', 'vendido', '2026-06-03', '2026-06-03', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', '2026-06-03', '2026-06-03', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('3b8e22b9-92d1-4f61-a3aa-bc0ab174f619', 11388, current_setting('importacao.cliente_id')::uuid, 20, 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 'concluida', 'normal', 1514.0, 1514.0, 0.0, '2026-06-03', '2026-06-03', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4');
UPDATE aparelhos SET venda_id = '3b8e22b9-92d1-4f61-a3aa-bc0ab174f619' WHERE id = '9cd5fafa-8cb1-4054-8d1d-a69edb2922c7';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('5e3b6a01-b24f-482b-ae1b-38aa2be9fe19', '3b8e22b9-92d1-4f61-a3aa-bc0ab174f619', 'cartao_credito', 1514.0, '2026-06-03', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 1);

-- === VENDA 11389: T-REX 3 PRO PRETO NOVO (03/06/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('57284878-ecf3-4373-8ab9-5cbae44e578d', 'Outros', 'T-REX 3 PRO PRETO NOVO', '24449537045774', 1899.0, 1800.0, 20, 'novo', 'perfeito', 'vendido', '2026-06-03', '2026-06-03', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', '2026-06-03', '2026-06-03', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('835e4f1d-310a-4192-b283-f3f8bb0c34fe', 11389, current_setting('importacao.cliente_id')::uuid, 20, 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 'concluida', 'normal', 1899.0, 1899.0, 0.0, '2026-06-03', '2026-06-03', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4');
UPDATE aparelhos SET venda_id = '835e4f1d-310a-4192-b283-f3f8bb0c34fe' WHERE id = '57284878-ecf3-4373-8ab9-5cbae44e578d';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('2efebf8b-488c-49f4-be41-6a5d6a7d0cc5', '835e4f1d-310a-4192-b283-f3f8bb0c34fe', 'pix', 1899.0, '2026-06-03', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 1);

-- === VENDA 11390: IPHONE 14 128GB AZUL SEMINOVO (03/06/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('7a0924c7-031d-4ffd-a664-36a7d8825cd1', 'Apple', 'IPHONE 14 128GB AZUL SEMINOVO', '355536442174276', 2240.0, 1900.0, 20, 'seminovo', 'bom', 'vendido', '2026-06-03', '2026-06-03', '25e2da5b-9e76-4388-9890-7e22efd6940d', '2026-06-03', '2026-06-03', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('8787d4e2-5e7e-4be9-8940-de538a1044c6', 11390, current_setting('importacao.cliente_id')::uuid, 20, '25e2da5b-9e76-4388-9890-7e22efd6940d', 'concluida', 'normal', 2240.0, 2240.0, 0.0, '2026-06-03', '2026-06-03', '25e2da5b-9e76-4388-9890-7e22efd6940d');
UPDATE aparelhos SET venda_id = '8787d4e2-5e7e-4be9-8940-de538a1044c6' WHERE id = '7a0924c7-031d-4ffd-a664-36a7d8825cd1';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('96478b23-fafa-4b8b-83b9-67482d315582', '8787d4e2-5e7e-4be9-8940-de538a1044c6', 'cartao_credito', 2240.0, '2026-06-03', '25e2da5b-9e76-4388-9890-7e22efd6940d', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('39a6d9d0-6488-4e75-b8e0-3dc6d4195776', 20, '8787d4e2-5e7e-4be9-8940-de538a1044c6', 'Brinde', 25.0, '2026-06-03', '25e2da5b-9e76-4388-9890-7e22efd6940d', '2026-06-03');

-- === VENDA 11391: IPHONE 15 128GB AZUL SEMINOVO (04/06/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('046d89ea-bde7-4918-9eae-d5fe4fbe7835', 'Apple', 'IPHONE 15 128GB AZUL SEMINOVO', '351698471567244', 2900.0, 2660.0, 4, 'seminovo', 'bom', 'vendido', '2026-06-04', '2026-06-04', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-06-04', '2026-06-04', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('b5dcd46c-ec95-48cf-a751-e4c6f7f23086', 11391, current_setting('importacao.cliente_id')::uuid, 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 2900.0, 2900.0, 0.0, '2026-06-04', '2026-06-04', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
UPDATE aparelhos SET venda_id = 'b5dcd46c-ec95-48cf-a751-e4c6f7f23086' WHERE id = '046d89ea-bde7-4918-9eae-d5fe4fbe7835';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('78b9ce3d-2144-4a4a-9f93-44e85d772832', 'b5dcd46c-ec95-48cf-a751-e4c6f7f23086', 'pix', 1450.0, '2026-06-04', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1);
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, observacao, parcelas)
VALUES ('380571d0-e6fa-4e0e-bd3e-21ac901f39d9', 'b5dcd46c-ec95-48cf-a751-e4c6f7f23086', 'troca_aparelho', 1450.0, '2026-06-04', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'Troca: ENTROU UM 13 SEMINOVO POR', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('00583e48-af38-4872-b3a9-372c088e527b', 4, 'b5dcd46c-ec95-48cf-a751-e4c6f7f23086', 'Brinde', 25.0, '2026-06-04', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-06-04');

-- === VENDA 11392: IPHONE 15 PRO MAX 256GB PRETO SEMINOVO (04/06/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('7b39f4ff-2506-4b07-92fe-bccc13528b9c', 'Apple', 'IPHONE 15 PRO MAX 256GB PRETO SEMINOVO', '351465644827966', 4400.0, 4100.0, 4, 'seminovo', 'bom', 'vendido', '2026-06-04', '2026-06-04', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-06-04', '2026-06-04', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('f8a06ec5-b5f8-4d35-8c5f-a06353d4f16d', 11392, current_setting('importacao.cliente_id')::uuid, 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 4400.0, 4400.0, 0.0, '2026-06-04', '2026-06-04', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
UPDATE aparelhos SET venda_id = 'f8a06ec5-b5f8-4d35-8c5f-a06353d4f16d' WHERE id = '7b39f4ff-2506-4b07-92fe-bccc13528b9c';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('95e3f6f0-8663-49db-9eec-9307c1efbe73', 'f8a06ec5-b5f8-4d35-8c5f-a06353d4f16d', 'pix', 2500.0, '2026-06-04', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1);
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, observacao, parcelas)
VALUES ('641ce63f-8e2c-441e-8118-e962d1f99f50', 'f8a06ec5-b5f8-4d35-8c5f-a06353d4f16d', 'troca_aparelho', 1900.0, '2026-06-04', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'Troca: ENTROU UM 14 SEMINOVO POR', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('c6e0d603-b277-4f21-a504-5336182be746', 4, 'f8a06ec5-b5f8-4d35-8c5f-a06353d4f16d', 'Brinde', 23.0, '2026-06-04', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-06-04');

-- === VENDA 11393: IPHONE 16 PRO MAX 256GB DESERT NOVO (04/06/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('842c20a3-d586-4223-9d93-09b3fb54cd1d', 'Apple', 'IPHONE 16 PRO MAX 256GB DESERT NOVO', '357590879692399', 5970.0, 5850.0, 20, 'novo', 'perfeito', 'vendido', '2026-06-04', '2026-06-04', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', '2026-06-04', '2026-06-04', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('8d19efa3-27ef-4f43-8605-7ecd7ee7697b', 11393, current_setting('importacao.cliente_id')::uuid, 20, 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 'concluida', 'normal', 5970.0, 5970.0, 0.0, '2026-06-04', '2026-06-04', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4');
UPDATE aparelhos SET venda_id = '8d19efa3-27ef-4f43-8605-7ecd7ee7697b' WHERE id = '842c20a3-d586-4223-9d93-09b3fb54cd1d';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('134a548d-aba3-4076-b0cb-a8d537280d07', '8d19efa3-27ef-4f43-8605-7ecd7ee7697b', 'pix', 1990.0, '2026-06-04', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 1);
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('4f6ae47e-f2b8-493b-b9b8-5a0f9ccd6056', '8d19efa3-27ef-4f43-8605-7ecd7ee7697b', 'cartao_credito', 3980.0, '2026-06-04', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 1);

-- === VENDA 11394: IPHONE 14 128GB BRANCO SEMINOVO (04/06/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('85c31913-fd04-4e60-a748-e96ca5e8d576', 'Apple', 'IPHONE 14 128GB BRANCO SEMINOVO', '353687476380990', 2100.0, 1900.0, 20, 'seminovo', 'bom', 'vendido', '2026-06-04', '2026-06-04', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', '2026-06-04', '2026-06-04', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('6e5ecd8d-be6e-486f-a2e9-4a0c0744b6f6', 11394, current_setting('importacao.cliente_id')::uuid, 20, 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 'concluida', 'normal', 2100.0, 2100.0, 0.0, '2026-06-04', '2026-06-04', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4');
UPDATE aparelhos SET venda_id = '6e5ecd8d-be6e-486f-a2e9-4a0c0744b6f6' WHERE id = '85c31913-fd04-4e60-a748-e96ca5e8d576';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('f902942d-35ff-41a1-ac9f-6f48e8293832', '6e5ecd8d-be6e-486f-a2e9-4a0c0744b6f6', 'cartao_credito', 450.0, '2026-06-04', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 1);
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, observacao, parcelas)
VALUES ('60b8c545-04f5-45d2-a025-62c3debd1b19', '6e5ecd8d-be6e-486f-a2e9-4a0c0744b6f6', 'troca_aparelho', 1650.0, '2026-06-04', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 'Troca: IPHONE 13 AZUL 128G', 1);

-- === VENDA 11395: IPHONE 15 128GB ROSA SEMINOVO (04/06/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('a9016634-a914-4699-8ed0-b7269cfd8edc', 'Apple', 'IPHONE 15 128GB ROSA SEMINOVO', '353850628182660', 2950.0, 2660.0, 4, 'seminovo', 'bom', 'vendido', '2026-06-04', '2026-06-04', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-06-04', '2026-06-04', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('15cf5152-2760-4135-951d-395920dd9b43', 11395, current_setting('importacao.cliente_id')::uuid, 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 2950.0, 2950.0, 0.0, '2026-06-04', '2026-06-04', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
UPDATE aparelhos SET venda_id = '15cf5152-2760-4135-951d-395920dd9b43' WHERE id = 'a9016634-a914-4699-8ed0-b7269cfd8edc';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('62d90387-2f2f-4bcf-8f3e-816063219b65', '15cf5152-2760-4135-951d-395920dd9b43', 'pix', 1000.0, '2026-06-04', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1);
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('ed4ab7dd-4fba-46a3-8320-2ead346cfa11', '15cf5152-2760-4135-951d-395920dd9b43', 'cartao_credito', 1950.0, '2026-06-04', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('a2779a28-14c3-47d1-b7ad-9562321b8b4f', 4, '15cf5152-2760-4135-951d-395920dd9b43', 'Brinde', 35.0, '2026-06-04', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-06-04');

-- === VENDA 11396: IPHONE 17 256GB BRANCO NOVO (04/06/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('86863588-1240-4802-ab2f-f15302457658', 'Apple', 'IPHONE 17 256GB BRANCO NOVO', '359973613643894', 4700.0, 4600.0, 4, 'novo', 'perfeito', 'vendido', '2026-06-04', '2026-06-04', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-06-04', '2026-06-04', 'Pagto junto (Aparelho 1/2, total grupo R$ 9,324)');
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('9e275284-7ae5-4cee-9846-631e19b82625', 11396, current_setting('importacao.cliente_id')::uuid, 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 4700.0, 4700.0, 0.0, '2026-06-04', '2026-06-04', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
UPDATE aparelhos SET venda_id = '9e275284-7ae5-4cee-9846-631e19b82625' WHERE id = '86863588-1240-4802-ab2f-f15302457658';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('80ef1d13-944e-4c39-9d95-a29104c467aa', '9e275284-7ae5-4cee-9846-631e19b82625', 'pix', 4700.0, '2026-06-04', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('b3499693-35c3-41e4-99bb-763504d7826c', 4, '9e275284-7ae5-4cee-9846-631e19b82625', 'Brinde', 25.0, '2026-06-04', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-06-04');

-- === VENDA 11397: IPHONE 17 256GB PRETO NOVO (04/06/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('da8b976f-23df-4560-a5bc-548a32deb11a', 'Apple', 'IPHONE 17 256GB PRETO NOVO', '351205581240124', 4624.0, 4500.0, 4, 'novo', 'perfeito', 'vendido', '2026-06-04', '2026-06-04', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-06-04', '2026-06-04', 'Pagto junto (Aparelho 2/2, total grupo R$ 9,324)');
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('5e734c1d-dbdb-4877-9eff-44c17ef7bace', 11397, current_setting('importacao.cliente_id')::uuid, 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 4624.0, 4624.0, 0.0, '2026-06-04', '2026-06-04', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
UPDATE aparelhos SET venda_id = '5e734c1d-dbdb-4877-9eff-44c17ef7bace' WHERE id = 'da8b976f-23df-4560-a5bc-548a32deb11a';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('2539af15-f9d6-4f18-979e-055c2a64fe51', '5e734c1d-dbdb-4877-9eff-44c17ef7bace', 'pix', 4624.0, '2026-06-04', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('d1f773d9-cd1d-4c12-adf5-af1df710c0fd', 4, '5e734c1d-dbdb-4877-9eff-44c17ef7bace', 'Brinde', 30.0, '2026-06-04', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-06-04');

-- === VENDA 11398: POCO X8 PRO MAX 512GB BRANCO NOVO (04/06/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('910f99c5-8478-4d49-ada8-f69561bc4209', 'Outros', 'POCO X8 PRO MAX 512GB BRANCO NOVO', '860534086640486', 3050.0, 2950.0, 19, 'novo', 'perfeito', 'vendido', '2026-06-04', '2026-06-04', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-06-04', '2026-06-04', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('932933a6-0736-42c5-be7d-0be5d89917b4', 11398, current_setting('importacao.cliente_id')::uuid, 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 3050.0, 3050.0, 0.0, '2026-06-04', '2026-06-04', '97f12885-87ad-426a-8bbb-656889d82e10');
UPDATE aparelhos SET venda_id = '932933a6-0736-42c5-be7d-0be5d89917b4' WHERE id = '910f99c5-8478-4d49-ada8-f69561bc4209';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('d42d98f8-0978-489c-aea8-4ac9d9438da0', '932933a6-0736-42c5-be7d-0be5d89917b4', 'pix', 3050.0, '2026-06-04', '97f12885-87ad-426a-8bbb-656889d82e10', 1);

-- === VENDA 11399: IPHONE 17 PRO MAX 256GB SILVER NOVO (04/06/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('c38e2c9f-4881-480f-aeb3-50711770ac2c', 'Apple', 'IPHONE 17 PRO MAX 256GB SILVER NOVO', '351205745375915', 7750.0, 7500.0, 19, 'novo', 'perfeito', 'vendido', '2026-06-04', '2026-06-04', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-06-04', '2026-06-04', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('c0248fc1-f48e-4329-b6c7-5df7f2b2671d', 11399, current_setting('importacao.cliente_id')::uuid, 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 7750.0, 7750.0, 0.0, '2026-06-04', '2026-06-04', '97f12885-87ad-426a-8bbb-656889d82e10');
UPDATE aparelhos SET venda_id = 'c0248fc1-f48e-4329-b6c7-5df7f2b2671d' WHERE id = 'c38e2c9f-4881-480f-aeb3-50711770ac2c';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('4e707e97-1b8a-4623-aa4d-0c5a133d8728', 'c0248fc1-f48e-4329-b6c7-5df7f2b2671d', 'dinheiro', 4050.0, '2026-06-04', '97f12885-87ad-426a-8bbb-656889d82e10', 1);
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, observacao, parcelas)
VALUES ('86c29491-f51b-4194-9217-8c2b4850bda0', 'c0248fc1-f48e-4329-b6c7-5df7f2b2671d', 'troca_aparelho', 3700.0, '2026-06-04', '97f12885-87ad-426a-8bbb-656889d82e10', 'Troca: IPH 15 PRO MAX 256GB', 1);

-- === VENDA 11400: POCO X8 PRO 512GB PRETO NOVO (04/06/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('04ce3634-a1cf-40de-bf45-2552d436b6ce', 'Outros', 'POCO X8 PRO 512GB PRETO NOVO', 'V865532083172607', 2500.0, 2300.0, 19, 'novo', 'perfeito', 'vendido', '2026-06-04', '2026-06-04', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-06-04', '2026-06-04', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('25902f6e-b3bc-470b-886f-b7060ef2eef2', 11400, current_setting('importacao.cliente_id')::uuid, 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 2500.0, 2500.0, 0.0, '2026-06-04', '2026-06-04', '97f12885-87ad-426a-8bbb-656889d82e10');
UPDATE aparelhos SET venda_id = '25902f6e-b3bc-470b-886f-b7060ef2eef2' WHERE id = '04ce3634-a1cf-40de-bf45-2552d436b6ce';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('2b314bc7-3977-4582-ba44-24a05f4a68a6', '25902f6e-b3bc-470b-886f-b7060ef2eef2', 'pix', 1000.0, '2026-06-04', '97f12885-87ad-426a-8bbb-656889d82e10', 1);
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('41afb3f0-93dd-4d5d-ad32-0d7250c0f1e4', '25902f6e-b3bc-470b-886f-b7060ef2eef2', 'cartao_credito', 1500.0, '2026-06-04', '97f12885-87ad-426a-8bbb-656889d82e10', 1);

-- === VENDA 11401: IPHONE 17 PRO MAX 256GB AZUL NOVO (04/06/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('130ba4dd-c678-4841-85d8-fb778e0ea367', 'Apple', 'IPHONE 17 PRO MAX 256GB AZUL NOVO', '359652120809905', 7467.0, 7230.0, 19, 'novo', 'perfeito', 'vendido', '2026-06-04', '2026-06-04', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-06-04', '2026-06-04', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('dbbb4b7b-55d5-48ed-be9a-400bb5c9ac1d', 11401, current_setting('importacao.cliente_id')::uuid, 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 7467.0, 7467.0, 0.0, '2026-06-04', '2026-06-04', '97f12885-87ad-426a-8bbb-656889d82e10');
UPDATE aparelhos SET venda_id = 'dbbb4b7b-55d5-48ed-be9a-400bb5c9ac1d' WHERE id = '130ba4dd-c678-4841-85d8-fb778e0ea367';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('a880c838-ae22-4a9b-9505-cca3771e9ef7', 'dbbb4b7b-55d5-48ed-be9a-400bb5c9ac1d', 'cartao_credito', 5367.0, '2026-06-04', '97f12885-87ad-426a-8bbb-656889d82e10', 1);
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, observacao, parcelas)
VALUES ('7ce22990-b031-4dff-82b3-40eb502f3d98', 'dbbb4b7b-55d5-48ed-be9a-400bb5c9ac1d', 'troca_aparelho', 2100.0, '2026-06-04', '97f12885-87ad-426a-8bbb-656889d82e10', 'Troca: IPH 13 PRO MAX', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('2c259799-8e8e-4737-8c27-70bacc0d111e', 19, 'dbbb4b7b-55d5-48ed-be9a-400bb5c9ac1d', 'Brinde', 30.0, '2026-06-04', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-06-04');

COMMIT;

-- ============================================
-- RESUMO
-- Aparelhos: 337
-- Vendas:    337
-- Pagamentos: 453
-- Brindes:   222
-- Trocas:    74
-- Sem IMEI:  0
-- IMEI dup:  2
-- Erros:     0
-- ============================================