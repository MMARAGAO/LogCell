-- ============================================
-- Script de importacao gerado em 2026-06-10 18:10:47.567800
-- Fonte: vendas_final.csv (60 linhas SIM)
-- Todos os pagamentos como Pix (valor_venda integral)
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

-- === VENDA 11402: IPHONE 16 PRO MAX 512GB PRETO SEMINOVO (02/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('ed6ad699-dc2f-436a-af2d-a05442daff49', 'Apple', 'IPHONE 16 PRO MAX 512GB PRETO SEMINOVO', '356744605708190', 5600.0, 5150.0, 20, 'seminovo', 'bom', 'vendido', '2026-05-02', '2026-05-02', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', '2026-05-02', '2026-05-02', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('46b3e472-a2e8-4570-af97-a8f5342e656e', 11402, current_setting('importacao.cliente_id')::uuid, 20, 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 'concluida', 'normal', 5600.0, 5600.0, 0.0, '2026-05-02', '2026-05-02', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4');
UPDATE aparelhos SET venda_id = '46b3e472-a2e8-4570-af97-a8f5342e656e' WHERE id = 'ed6ad699-dc2f-436a-af2d-a05442daff49';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('0c841602-24af-40df-8dae-309da31ade9a', '46b3e472-a2e8-4570-af97-a8f5342e656e', 'pix', 5600.0, '2026-05-02', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('e43a85c5-426d-494c-afa9-58afe9d2b748', 20, '46b3e472-a2e8-4570-af97-a8f5342e656e', 'Brinde', 25.0, '2026-05-02', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', '2026-05-02');

-- === VENDA 11403: IPHONE 14 PRO MAX 256GB ROXO SEMINOVO (03/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('0e1d364c-4097-4864-a0a3-cb75c39582a3', 'Apple', 'IPHONE 14 PRO MAX 256GB ROXO SEMINOVO', '356684163986301', 3521.0, 3200.0, 20, 'seminovo', 'bom', 'vendido', '2026-05-03', '2026-05-03', '25e2da5b-9e76-4388-9890-7e22efd6940d', '2026-05-03', '2026-05-03', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('b34ff022-732f-469d-85dd-9cc0c777e286', 11403, current_setting('importacao.cliente_id')::uuid, 20, '25e2da5b-9e76-4388-9890-7e22efd6940d', 'concluida', 'normal', 3521.0, 3521.0, 0.0, '2026-05-03', '2026-05-03', '25e2da5b-9e76-4388-9890-7e22efd6940d');
UPDATE aparelhos SET venda_id = 'b34ff022-732f-469d-85dd-9cc0c777e286' WHERE id = '0e1d364c-4097-4864-a0a3-cb75c39582a3';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('f35ebddd-cd72-4a84-8323-246ff207d533', 'b34ff022-732f-469d-85dd-9cc0c777e286', 'pix', 3521.0, '2026-05-03', '25e2da5b-9e76-4388-9890-7e22efd6940d', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('d0e49cf0-5105-4ee8-801c-51b360f76555', 20, 'b34ff022-732f-469d-85dd-9cc0c777e286', 'Brinde', 25.0, '2026-05-03', '25e2da5b-9e76-4388-9890-7e22efd6940d', '2026-05-03');

-- === VENDA 11404: IPHONE 17 PRO 256GB BRANCO SEMINOVO (05/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('da057730-ec74-4d6f-8c61-0465c4a495c5', 'Apple', 'IPHONE 17 PRO 256GB BRANCO SEMINOVO', NULL, 6880.0, 6350.0, 1, 'seminovo', 'bom', 'vendido', '2026-05-05', '2026-05-05', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-05', '2026-05-05', 'Sem IMEI');
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('004a8d9f-92b8-4d85-ada8-75c6e6affd22', 11404, current_setting('importacao.cliente_id')::uuid, 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 6880.0, 6880.0, 0.0, '2026-05-05', '2026-05-05', '85e3aa42-b9af-49b8-a72a-64e9c337aa53');
UPDATE aparelhos SET venda_id = '004a8d9f-92b8-4d85-ada8-75c6e6affd22' WHERE id = 'da057730-ec74-4d6f-8c61-0465c4a495c5';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('c9e60e26-db99-4950-a9bc-3acd0174c0f4', '004a8d9f-92b8-4d85-ada8-75c6e6affd22', 'pix', 6880.0, '2026-05-05', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('2c2eb73e-5ca0-462e-887e-e88336d67ec8', 1, '004a8d9f-92b8-4d85-ada8-75c6e6affd22', 'Brinde', 25.0, '2026-05-05', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-05');

-- === VENDA 11405: IPHONE 14 PRO MAX 256GB PRETO SEMINOVO (06/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('1ae4fea4-68d1-4a9b-b5f6-fd72ff4dfbec', 'Apple', 'IPHONE 14 PRO MAX 256GB PRETO SEMINOVO', NULL, 3590.0, 3200.0, 19, 'seminovo', 'bom', 'vendido', '2026-05-06', '2026-05-06', 'b4269e60-eea2-4eba-a34d-db9591e0ec83', '2026-05-06', '2026-05-06', 'Sem IMEI');
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('b913a3dc-f407-42ac-9c4b-0fe43dfb38e8', 11405, current_setting('importacao.cliente_id')::uuid, 19, 'b4269e60-eea2-4eba-a34d-db9591e0ec83', 'concluida', 'normal', 3590.0, 3590.0, 0.0, '2026-05-06', '2026-05-06', 'b4269e60-eea2-4eba-a34d-db9591e0ec83');
UPDATE aparelhos SET venda_id = 'b913a3dc-f407-42ac-9c4b-0fe43dfb38e8' WHERE id = '1ae4fea4-68d1-4a9b-b5f6-fd72ff4dfbec';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('efec0ac6-a12d-45f3-b1c4-b706c3ec89bc', 'b913a3dc-f407-42ac-9c4b-0fe43dfb38e8', 'pix', 3590.0, '2026-05-06', 'b4269e60-eea2-4eba-a34d-db9591e0ec83', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('f30bd5df-a265-453f-9c56-5da68a5482c9', 19, 'b913a3dc-f407-42ac-9c4b-0fe43dfb38e8', 'Brinde', 15.0, '2026-05-06', 'b4269e60-eea2-4eba-a34d-db9591e0ec83', '2026-05-06');

-- === VENDA 11406: POCO F7 512GB PRATA NOVO (07/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('93b9b47e-dda3-4220-bd30-1d1fc1242b90', 'Outros', 'POCO F7 512GB PRATA NOVO', '862136074435040', 341.0, 2800.0, 4, 'novo', 'perfeito', 'vendido', '2026-05-07', '2026-05-07', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-07', '2026-05-07', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('ebfa3bfd-7d39-4245-a633-08c796a865c0', 11406, current_setting('importacao.cliente_id')::uuid, 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 341.0, 341.0, 0.0, '2026-05-07', '2026-05-07', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
UPDATE aparelhos SET venda_id = 'ebfa3bfd-7d39-4245-a633-08c796a865c0' WHERE id = '93b9b47e-dda3-4220-bd30-1d1fc1242b90';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('6348743b-47d0-42d7-9352-cebcde097212', 'ebfa3bfd-7d39-4245-a633-08c796a865c0', 'pix', 341.0, '2026-05-07', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('ecabd3c4-afa0-4618-8872-0fb23d08ac0d', 4, 'ebfa3bfd-7d39-4245-a633-08c796a865c0', 'Brinde', 120.0, '2026-05-07', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-07');

-- === VENDA 11407: IPHONE 14 PRO ROXO SEMINOVO (09/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('b26aa1b6-d250-4353-b9fb-94e97664ba63', 'Apple', 'IPHONE 14 PRO ROXO SEMINOVO', '350923388804337', 2953.0, 2700.0, 1, 'seminovo', 'bom', 'vendido', '2026-05-09', '2026-05-09', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-09', '2026-05-09', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('14a6c94b-d956-4c5c-8d7c-bbcb87ec420d', 11407, current_setting('importacao.cliente_id')::uuid, 1, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 2953.0, 2953.0, 0.0, '2026-05-09', '2026-05-09', '97f12885-87ad-426a-8bbb-656889d82e10');
UPDATE aparelhos SET venda_id = '14a6c94b-d956-4c5c-8d7c-bbcb87ec420d' WHERE id = 'b26aa1b6-d250-4353-b9fb-94e97664ba63';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('d5e801dc-be2b-4e12-a6ed-5f28ad8dad4e', '14a6c94b-d956-4c5c-8d7c-bbcb87ec420d', 'pix', 2953.0, '2026-05-09', '97f12885-87ad-426a-8bbb-656889d82e10', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('6af10901-deac-484b-b9c2-541acd7bdffd', 1, '14a6c94b-d956-4c5c-8d7c-bbcb87ec420d', 'Brinde', 25.0, '2026-05-09', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-09');

-- === VENDA 11408: IPHONE 14 LILAS 128GB  SEMINOVO (09/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('962aaba6-72c6-4a83-a309-e92450704957', 'Apple', 'IPHONE 14 LILAS 128GB  SEMINOVO', '35142179914814', 2350.0, 2050.0, 20, 'seminovo', 'bom', 'vendido', '2026-05-09', '2026-05-09', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', '2026-05-09', '2026-05-09', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('c4bf87d6-ca7f-448c-befd-26c3df0a7b29', 11408, current_setting('importacao.cliente_id')::uuid, 20, 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 'concluida', 'normal', 2350.0, 2350.0, 0.0, '2026-05-09', '2026-05-09', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4');
UPDATE aparelhos SET venda_id = 'c4bf87d6-ca7f-448c-befd-26c3df0a7b29' WHERE id = '962aaba6-72c6-4a83-a309-e92450704957';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('8a975400-a83c-4b63-ac69-d068a94f2903', 'c4bf87d6-ca7f-448c-befd-26c3df0a7b29', 'pix', 2350.0, '2026-05-09', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('4d857c10-541e-481e-ae42-da465cbb3a3c', 20, 'c4bf87d6-ca7f-448c-befd-26c3df0a7b29', 'Brinde', 15.0, '2026-05-09', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', '2026-05-09');

-- === VENDA 11409: IPHONE 17E ROSA 256GB NOVO (09/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('71f0bc41-95ca-483d-9d53-dfbaac2069d3', 'Apple', 'IPHONE 17E ROSA 256GB NOVO', '357457921078326', 3950.0, 3650.0, 20, 'novo', 'perfeito', 'vendido', '2026-05-09', '2026-05-09', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', '2026-05-09', '2026-05-09', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('bc09d38f-3c84-4334-9085-a374ba4b4df0', 11409, current_setting('importacao.cliente_id')::uuid, 20, 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 'concluida', 'normal', 3950.0, 3950.0, 0.0, '2026-05-09', '2026-05-09', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4');
UPDATE aparelhos SET venda_id = 'bc09d38f-3c84-4334-9085-a374ba4b4df0' WHERE id = '71f0bc41-95ca-483d-9d53-dfbaac2069d3';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('6b2e70d9-a6f7-4ac6-87bb-93a940a7f275', 'bc09d38f-3c84-4334-9085-a374ba4b4df0', 'pix', 3950.0, '2026-05-09', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('7244be42-0b8e-44fa-84e4-79ad079c9a37', 20, 'bc09d38f-3c84-4334-9085-a374ba4b4df0', 'Brinde', 15.0, '2026-05-09', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', '2026-05-09');

-- === VENDA 11410: IPHONE 17 PRO MAX 256GB AZUL NOVO (09/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('2c2403cc-53d4-4e6c-b440-f648a648a55b', 'Apple', 'IPHONE 17 PRO MAX 256GB AZUL NOVO', '351205742681323', 8650.0, 8250.0, 1, 'novo', 'perfeito', 'vendido', '2026-05-09', '2026-05-09', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-09', '2026-05-09', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('cd3f2a24-f6d4-4bce-9b90-a31cac15bd9f', 11410, current_setting('importacao.cliente_id')::uuid, 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 8650.0, 8650.0, 0.0, '2026-05-09', '2026-05-09', '85e3aa42-b9af-49b8-a72a-64e9c337aa53');
UPDATE aparelhos SET venda_id = 'cd3f2a24-f6d4-4bce-9b90-a31cac15bd9f' WHERE id = '2c2403cc-53d4-4e6c-b440-f648a648a55b';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('ccde1803-59b7-45ad-bfc6-2876c0b5ec03', 'cd3f2a24-f6d4-4bce-9b90-a31cac15bd9f', 'pix', 8650.0, '2026-05-09', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 1);

-- === VENDA 11411: IPHONE 16 PRO 256GB PRETO SEMINOVO (09/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('b5d2d30a-653c-4137-9180-2ff7df883084', 'Apple', 'IPHONE 16 PRO 256GB PRETO SEMINOVO', '357234294533959', 4990.0, 4500.0, 20, 'seminovo', 'bom', 'vendido', '2026-05-09', '2026-05-09', '25e2da5b-9e76-4388-9890-7e22efd6940d', '2026-05-09', '2026-05-09', 'Troca R$ 0');
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('75f478c7-c71d-470e-9920-d0f5d53769b6', 11411, current_setting('importacao.cliente_id')::uuid, 20, '25e2da5b-9e76-4388-9890-7e22efd6940d', 'concluida', 'normal', 4990.0, 4990.0, 0.0, '2026-05-09', '2026-05-09', '25e2da5b-9e76-4388-9890-7e22efd6940d');
UPDATE aparelhos SET venda_id = '75f478c7-c71d-470e-9920-d0f5d53769b6' WHERE id = 'b5d2d30a-653c-4137-9180-2ff7df883084';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('29b48386-9a8d-4ed9-8733-fae21708376f', '75f478c7-c71d-470e-9920-d0f5d53769b6', 'pix', 4990.0, '2026-05-09', '25e2da5b-9e76-4388-9890-7e22efd6940d', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('51a3b332-e012-4b57-8258-e45c3a34eb05', 20, '75f478c7-c71d-470e-9920-d0f5d53769b6', 'Brinde', 35.0, '2026-05-09', '25e2da5b-9e76-4388-9890-7e22efd6940d', '2026-05-09');

-- === VENDA 11412: IPHONE 15 256GB PRETO SEMINOVO - GARANTIA (10/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('ce3646b5-d309-4698-b2bf-897f84821d42', 'Apple', 'IPHONE 15 256GB PRETO SEMINOVO - GARANTIA', '358388750991421', 3400.0, 2900.0, 4, 'seminovo', 'bom', 'vendido', '2026-05-10', '2026-05-10', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-10', '2026-05-10', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('2f766cf3-b560-4bfd-9934-036328c304e2', 11412, current_setting('importacao.cliente_id')::uuid, 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 3400.0, 3400.0, 0.0, '2026-05-10', '2026-05-10', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
UPDATE aparelhos SET venda_id = '2f766cf3-b560-4bfd-9934-036328c304e2' WHERE id = 'ce3646b5-d309-4698-b2bf-897f84821d42';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('e54224c4-0724-48e8-9469-529e65ce4c01', '2f766cf3-b560-4bfd-9934-036328c304e2', 'pix', 3400.0, '2026-05-10', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('74b90432-fdac-403f-97f5-2916edb59537', 4, '2f766cf3-b560-4bfd-9934-036328c304e2', 'Brinde', 30.0, '2026-05-10', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-10');

-- === VENDA 11413: REDMI 15C 256GB PRETO  NOVO (13/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('229aaabb-1d70-41b8-b013-441a7979480f', 'Xiaomi', 'REDMI 15C 256GB PRETO  NOVO', '867754088428267', 1000.0, 840.0, 19, 'novo', 'perfeito', 'vendido', '2026-05-13', '2026-05-13', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-13', '2026-05-13', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('e80dfe3a-9e7a-4372-98a2-5637834fb3e5', 11413, current_setting('importacao.cliente_id')::uuid, 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 1000.0, 1000.0, 0.0, '2026-05-13', '2026-05-13', '97f12885-87ad-426a-8bbb-656889d82e10');
UPDATE aparelhos SET venda_id = 'e80dfe3a-9e7a-4372-98a2-5637834fb3e5' WHERE id = '229aaabb-1d70-41b8-b013-441a7979480f';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('533acb18-91ee-4d92-8deb-9597cee9b453', 'e80dfe3a-9e7a-4372-98a2-5637834fb3e5', 'pix', 1000.0, '2026-05-13', '97f12885-87ad-426a-8bbb-656889d82e10', 1);

-- === VENDA 11414: IPHONE 13 128GB ROSA SEMINOVO (14/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('637a775a-7247-43c5-89e8-2608ac3de9d5', 'Apple', 'IPHONE 13 128GB ROSA SEMINOVO', NULL, 1911.0, 1800.0, 1, 'seminovo', 'bom', 'vendido', '2026-05-14', '2026-05-14', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-14', '2026-05-14', 'Sem IMEI');
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('6eddf926-a093-4879-b2d1-710865e34dcd', 11414, current_setting('importacao.cliente_id')::uuid, 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 1911.0, 1911.0, 0.0, '2026-05-14', '2026-05-14', '85e3aa42-b9af-49b8-a72a-64e9c337aa53');
UPDATE aparelhos SET venda_id = '6eddf926-a093-4879-b2d1-710865e34dcd' WHERE id = '637a775a-7247-43c5-89e8-2608ac3de9d5';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('583aadbd-acd1-4f0e-9569-4a72691346ec', '6eddf926-a093-4879-b2d1-710865e34dcd', 'pix', 1911.0, '2026-05-14', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('200bcd04-9412-4886-b0d6-37bacc034062', 1, '6eddf926-a093-4879-b2d1-710865e34dcd', 'Brinde', 25.0, '2026-05-14', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-14');

-- === VENDA 11415: IPHONE 13 PRO 128GB GRAFITE SEMINOVO (15/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('501495a4-44c6-4e58-8af5-9f26582194bf', 'Apple', 'IPHONE 13 PRO 128GB GRAFITE SEMINOVO', NULL, 2500.0, 2350.0, 4, 'seminovo', 'bom', 'vendido', '2026-05-15', '2026-05-15', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-15', '2026-05-15', 'Sem IMEI');
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('5445acde-f530-4c83-ae16-b52eacde7d79', 11415, current_setting('importacao.cliente_id')::uuid, 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 2500.0, 2500.0, 0.0, '2026-05-15', '2026-05-15', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
UPDATE aparelhos SET venda_id = '5445acde-f530-4c83-ae16-b52eacde7d79' WHERE id = '501495a4-44c6-4e58-8af5-9f26582194bf';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('7dc14e17-b784-44be-b1c4-11f751dbaf02', '5445acde-f530-4c83-ae16-b52eacde7d79', 'pix', 2500.0, '2026-05-15', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('d12eef47-805f-459e-9953-ec5c827371be', 4, '5445acde-f530-4c83-ae16-b52eacde7d79', 'Brinde', 15.0, '2026-05-15', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-15');

-- === VENDA 11416: IPHONE 17 256GB VERDE NOVO (15/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('fb5b939c-8dfd-4ac8-930f-df50dea29bc4', 'Apple', 'IPHONE 17 256GB VERDE NOVO', '355989441325235', 5085.0, 4850.0, 19, 'novo', 'perfeito', 'vendido', '2026-05-15', '2026-05-15', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-15', '2026-05-15', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('23b2f0d7-b592-4436-b659-e4489d0d1b6f', 11416, current_setting('importacao.cliente_id')::uuid, 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 5085.0, 5085.0, 0.0, '2026-05-15', '2026-05-15', '97f12885-87ad-426a-8bbb-656889d82e10');
UPDATE aparelhos SET venda_id = '23b2f0d7-b592-4436-b659-e4489d0d1b6f' WHERE id = 'fb5b939c-8dfd-4ac8-930f-df50dea29bc4';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('7633de1a-fdc5-401f-a8c8-e2122ca08b4e', '23b2f0d7-b592-4436-b659-e4489d0d1b6f', 'pix', 5085.0, '2026-05-15', '97f12885-87ad-426a-8bbb-656889d82e10', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('d00748b9-55eb-477f-ad3a-b6b52ca862aa', 19, '23b2f0d7-b592-4436-b659-e4489d0d1b6f', 'Brinde', 25.0, '2026-05-15', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-15');

-- === VENDA 11417: IPHONE 16 PRO MAX 256GB  PRETO SEMINOVO (16/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('8082930e-55b6-49fa-825a-3f80299bf18b', 'Apple', 'IPHONE 16 PRO MAX 256GB  PRETO SEMINOVO', '357590872352405', 5300.0, 5000.0, 19, 'seminovo', 'bom', 'vendido', '2026-05-16', '2026-05-16', 'b4269e60-eea2-4eba-a34d-db9591e0ec83', '2026-05-16', '2026-05-16', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('c463f062-cc38-499f-bc71-e6be9c8dabbe', 11417, current_setting('importacao.cliente_id')::uuid, 19, 'b4269e60-eea2-4eba-a34d-db9591e0ec83', 'concluida', 'normal', 5300.0, 5300.0, 0.0, '2026-05-16', '2026-05-16', 'b4269e60-eea2-4eba-a34d-db9591e0ec83');
UPDATE aparelhos SET venda_id = 'c463f062-cc38-499f-bc71-e6be9c8dabbe' WHERE id = '8082930e-55b6-49fa-825a-3f80299bf18b';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('12417d0f-0b2d-4a14-a04e-9e32e8578b86', 'c463f062-cc38-499f-bc71-e6be9c8dabbe', 'pix', 5300.0, '2026-05-16', 'b4269e60-eea2-4eba-a34d-db9591e0ec83', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('3e77dc87-150c-4e47-9233-22339563d7e2', 19, 'c463f062-cc38-499f-bc71-e6be9c8dabbe', 'Brinde', 15.0, '2026-05-16', 'b4269e60-eea2-4eba-a34d-db9591e0ec83', '2026-05-16');

-- === VENDA 11418: IPHONE 17 256GB BRANCO NOVO (17/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('b11f1d00-f70a-4331-b5fc-6be766f06d2e', 'Apple', 'IPHONE 17 256GB BRANCO NOVO', '352824562111135', 4950.0, 4750.0, 19, 'novo', 'perfeito', 'vendido', '2026-05-17', '2026-05-17', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-17', '2026-05-17', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('d3cea868-0070-46cb-8ae8-e9731058f507', 11418, current_setting('importacao.cliente_id')::uuid, 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 4950.0, 4950.0, 0.0, '2026-05-17', '2026-05-17', '97f12885-87ad-426a-8bbb-656889d82e10');
UPDATE aparelhos SET venda_id = 'd3cea868-0070-46cb-8ae8-e9731058f507' WHERE id = 'b11f1d00-f70a-4331-b5fc-6be766f06d2e';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('5a573a53-5a2e-404e-acd7-58c928780ea9', 'd3cea868-0070-46cb-8ae8-e9731058f507', 'pix', 4950.0, '2026-05-17', '97f12885-87ad-426a-8bbb-656889d82e10', 1);

-- === VENDA 11419: IPHONE 15 PRO MAX 256GB AZUL SEMINOVO (17/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('b65ab379-df73-49a0-b147-cc404dbfc62f', 'Apple', 'IPHONE 15 PRO MAX 256GB AZUL SEMINOVO', '355319547611678', 4200.0, 4000.0, 19, 'seminovo', 'bom', 'vendido', '2026-05-17', '2026-05-17', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-17', '2026-05-17', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('e91dc9b5-bd31-4cb8-8431-98e2a9c25e29', 11419, current_setting('importacao.cliente_id')::uuid, 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 4200.0, 4200.0, 0.0, '2026-05-17', '2026-05-17', '97f12885-87ad-426a-8bbb-656889d82e10');
UPDATE aparelhos SET venda_id = 'e91dc9b5-bd31-4cb8-8431-98e2a9c25e29' WHERE id = 'b65ab379-df73-49a0-b147-cc404dbfc62f';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('0b7f9745-9691-48f3-84f0-6925dc010aa9', 'e91dc9b5-bd31-4cb8-8431-98e2a9c25e29', 'pix', 4200.0, '2026-05-17', '97f12885-87ad-426a-8bbb-656889d82e10', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('02ee1522-09d2-4e99-a2d1-7432dfd161d0', 19, 'e91dc9b5-bd31-4cb8-8431-98e2a9c25e29', 'Brinde', 20.0, '2026-05-17', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-17');

-- === VENDA 11420: IPHONE 12 128GB AZUL SEMINOVO (17/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('995698e7-caf2-440f-a2d3-de9c414b0290', 'Apple', 'IPHONE 12 128GB AZUL SEMINOVO', '357158819908414', 1450.0, 1250.0, 19, 'seminovo', 'bom', 'vendido', '2026-05-17', '2026-05-17', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-17', '2026-05-17', 'Vendedor Angel - pendente ID real');
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('dea12d9e-7226-4a83-bb8b-b88b9f3fb8ea', 11420, current_setting('importacao.cliente_id')::uuid, 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 1450.0, 1450.0, 0.0, '2026-05-17', '2026-05-17', '97f12885-87ad-426a-8bbb-656889d82e10');
UPDATE aparelhos SET venda_id = 'dea12d9e-7226-4a83-bb8b-b88b9f3fb8ea' WHERE id = '995698e7-caf2-440f-a2d3-de9c414b0290';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('9693388a-4dd0-46c0-871f-f5f5cec96fff', 'dea12d9e-7226-4a83-bb8b-b88b9f3fb8ea', 'pix', 1450.0, '2026-05-17', '97f12885-87ad-426a-8bbb-656889d82e10', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('7e9766c5-1573-45d8-b8ee-e6f82b3bc6b6', 19, 'dea12d9e-7226-4a83-bb8b-b88b9f3fb8ea', 'Brinde', 25.0, '2026-05-17', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-17');

-- === VENDA 11421: IPAD 11° (A16) 128GB AMARELO NOVO (19/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('37d76fdf-4773-4c8c-a5e2-ec044e037a2c', 'Apple', 'IPAD 11° (A16) 128GB AMARELO NOVO', NULL, 2297.0, 2090.0, 4, 'novo', 'perfeito', 'vendido', '2026-05-19', '2026-05-19', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-19', '2026-05-19', 'Sem IMEI');
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('38cb1f9a-d8c4-430b-b03f-f5edc9dc0ec2', 11421, current_setting('importacao.cliente_id')::uuid, 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 2297.0, 2297.0, 0.0, '2026-05-19', '2026-05-19', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
UPDATE aparelhos SET venda_id = '38cb1f9a-d8c4-430b-b03f-f5edc9dc0ec2' WHERE id = '37d76fdf-4773-4c8c-a5e2-ec044e037a2c';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('ce542927-7904-46b2-bd16-287bab0f3779', '38cb1f9a-d8c4-430b-b03f-f5edc9dc0ec2', 'pix', 2297.0, '2026-05-19', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('d97f1c08-cd6e-47f4-906e-a2beb3742c34', 4, '38cb1f9a-d8c4-430b-b03f-f5edc9dc0ec2', 'Brinde', 30.0, '2026-05-19', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-19');

-- === VENDA 11422: IPHONE 12 PRO 256GB BRANCO SEMINOVO (19/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('33d8262a-5bac-4a00-92ec-080b4d178581', 'Apple', 'IPHONE 12 PRO 256GB BRANCO SEMINOVO', '353074114042706', 2200.0, 1900.0, 19, 'seminovo', 'bom', 'vendido', '2026-05-19', '2026-05-19', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-19', '2026-05-19', 'Vendedor Angel - pendente ID real');
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('6ec68c1a-8337-46b5-98fb-1942c9c819a1', 11422, current_setting('importacao.cliente_id')::uuid, 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 2200.0, 2200.0, 0.0, '2026-05-19', '2026-05-19', '97f12885-87ad-426a-8bbb-656889d82e10');
UPDATE aparelhos SET venda_id = '6ec68c1a-8337-46b5-98fb-1942c9c819a1' WHERE id = '33d8262a-5bac-4a00-92ec-080b4d178581';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('640f6328-84f3-4ccf-a995-134a5b7663d7', '6ec68c1a-8337-46b5-98fb-1942c9c819a1', 'pix', 2200.0, '2026-05-19', '97f12885-87ad-426a-8bbb-656889d82e10', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('b4794fbe-f57b-499a-a38a-2f0de075b725', 19, '6ec68c1a-8337-46b5-98fb-1942c9c819a1', 'Brinde', 8.0, '2026-05-19', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-19');

-- === VENDA 11423: NOTE 15 4F 256GB PRETO NOVO (21/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('20bbfbb5-bb1b-4c4e-b6be-263c6f76ba14', 'Redmi', 'NOTE 15 4F 256GB PRETO NOVO', '869009086978906', 1300.0, 1130.0, 19, 'novo', 'perfeito', 'vendido', '2026-05-21', '2026-05-21', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-21', '2026-05-21', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('5ae36de1-68e7-4256-8219-af8d9b2e91f7', 11423, current_setting('importacao.cliente_id')::uuid, 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 1300.0, 1300.0, 0.0, '2026-05-21', '2026-05-21', '97f12885-87ad-426a-8bbb-656889d82e10');
UPDATE aparelhos SET venda_id = '5ae36de1-68e7-4256-8219-af8d9b2e91f7' WHERE id = '20bbfbb5-bb1b-4c4e-b6be-263c6f76ba14';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('d14cbc15-dd77-4709-9f0a-b9eada219483', '5ae36de1-68e7-4256-8219-af8d9b2e91f7', 'pix', 1300.0, '2026-05-21', '97f12885-87ad-426a-8bbb-656889d82e10', 1);

-- === VENDA 11424: IPHONE 17 PRO MAX 256GB LARANJA LACRADO (21/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('dd283636-5620-4f14-9554-d2cfe70c4069', 'Apple', 'IPHONE 17 PRO MAX 256GB LARANJA LACRADO', '350230973236911', 8200.0, 8000.0, 1, 'novo', 'perfeito', 'vendido', '2026-05-21', '2026-05-21', 'e07d4d35-1381-4d4d-914d-8382a7456fdd', '2026-05-21', '2026-05-21', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('de4b5245-cfc3-4054-98d7-611db460f976', 11424, current_setting('importacao.cliente_id')::uuid, 1, 'e07d4d35-1381-4d4d-914d-8382a7456fdd', 'concluida', 'normal', 8200.0, 8200.0, 0.0, '2026-05-21', '2026-05-21', 'e07d4d35-1381-4d4d-914d-8382a7456fdd');
UPDATE aparelhos SET venda_id = 'de4b5245-cfc3-4054-98d7-611db460f976' WHERE id = 'dd283636-5620-4f14-9554-d2cfe70c4069';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('d62d499c-eea6-4e87-a925-0ed5c5a3da4c', 'de4b5245-cfc3-4054-98d7-611db460f976', 'pix', 8200.0, '2026-05-21', 'e07d4d35-1381-4d4d-914d-8382a7456fdd', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('bca638b7-1442-4964-a388-db26237f18dd', 1, 'de4b5245-cfc3-4054-98d7-611db460f976', 'Brinde', 15.0, '2026-05-21', 'e07d4d35-1381-4d4d-914d-8382a7456fdd', '2026-05-21');

-- === VENDA 11425: IPHONE 17 256GB BRANCO NOVO (21/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('46a3cb34-d5ac-4979-bc27-a87be96b5833', 'Apple', 'IPHONE 17 256GB BRANCO NOVO', '352824562544798', 4900.0, 4600.0, 20, 'novo', 'perfeito', 'vendido', '2026-05-21', '2026-05-21', '25e2da5b-9e76-4388-9890-7e22efd6940d', '2026-05-21', '2026-05-21', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('1bd8bc05-ff4c-4728-a570-b653e647aee6', 11425, current_setting('importacao.cliente_id')::uuid, 20, '25e2da5b-9e76-4388-9890-7e22efd6940d', 'concluida', 'normal', 4900.0, 4900.0, 0.0, '2026-05-21', '2026-05-21', '25e2da5b-9e76-4388-9890-7e22efd6940d');
UPDATE aparelhos SET venda_id = '1bd8bc05-ff4c-4728-a570-b653e647aee6' WHERE id = '46a3cb34-d5ac-4979-bc27-a87be96b5833';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('1de5606a-804b-44f6-ba47-03e454ed108f', '1bd8bc05-ff4c-4728-a570-b653e647aee6', 'pix', 4900.0, '2026-05-21', '25e2da5b-9e76-4388-9890-7e22efd6940d', 1);

-- === VENDA 11426: IPHONE 11 BRANCO 128GB SEMINOVO (22/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('fa646dd7-ff34-403b-848c-c893cbb401cd', 'Apple', 'IPHONE 11 BRANCO 128GB SEMINOVO', NULL, 1030.0, 800.0, 1, 'seminovo', 'bom', 'vendido', '2026-05-22', '2026-05-22', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-22', '2026-05-22', 'Sem IMEI');
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('f087b08d-ca04-4c2f-9459-49e0ab3b96bf', 11426, current_setting('importacao.cliente_id')::uuid, 1, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 1030.0, 1030.0, 0.0, '2026-05-22', '2026-05-22', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
UPDATE aparelhos SET venda_id = 'f087b08d-ca04-4c2f-9459-49e0ab3b96bf' WHERE id = 'fa646dd7-ff34-403b-848c-c893cbb401cd';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('d438902d-7c31-417f-8031-ad0c2d0d0780', 'f087b08d-ca04-4c2f-9459-49e0ab3b96bf', 'pix', 1030.0, '2026-05-22', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('2cd77541-e214-4a5c-950f-78f86a84c3a2', 1, 'f087b08d-ca04-4c2f-9459-49e0ab3b96bf', 'Brinde', 25.0, '2026-05-22', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-22');

-- === VENDA 11427: IPHONE 16 PRO DESERT 128GB NOVO (22/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('904339de-b796-4c71-9d6c-f529e594773e', 'Apple', 'IPHONE 16 PRO DESERT 128GB NOVO', '351895497858892', 6000.0, 5400.0, 20, 'novo', 'perfeito', 'vendido', '2026-05-22', '2026-05-22', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', '2026-05-22', '2026-05-22', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('16377f90-b998-40d0-a680-1298b92c79de', 11427, current_setting('importacao.cliente_id')::uuid, 20, 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 'concluida', 'normal', 6000.0, 6000.0, 0.0, '2026-05-22', '2026-05-22', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4');
UPDATE aparelhos SET venda_id = '16377f90-b998-40d0-a680-1298b92c79de' WHERE id = '904339de-b796-4c71-9d6c-f529e594773e';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('5b82d880-32ba-4d87-bac0-a0f517424ea7', '16377f90-b998-40d0-a680-1298b92c79de', 'pix', 6000.0, '2026-05-22', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('2cfda7d4-5084-4e5d-b4f8-33248a6dc29a', 20, '16377f90-b998-40d0-a680-1298b92c79de', 'Brinde', 5.0, '2026-05-22', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', '2026-05-22');

-- === VENDA 11428: IPHONE 17 PRO 256GB BRANCO SEMINOVO (22/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('8c7ec232-281c-4f9a-9482-fe1b1950a67a', 'Apple', 'IPHONE 17 PRO 256GB BRANCO SEMINOVO', '355500351356910', 6900.0, 6100.0, 20, 'seminovo', 'bom', 'vendido', '2026-05-22', '2026-05-22', '25e2da5b-9e76-4388-9890-7e22efd6940d', '2026-05-22', '2026-05-22', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('a3f6ea31-c5de-4553-b269-870b872de0eb', 11428, current_setting('importacao.cliente_id')::uuid, 20, '25e2da5b-9e76-4388-9890-7e22efd6940d', 'concluida', 'normal', 6900.0, 6900.0, 0.0, '2026-05-22', '2026-05-22', '25e2da5b-9e76-4388-9890-7e22efd6940d');
UPDATE aparelhos SET venda_id = 'a3f6ea31-c5de-4553-b269-870b872de0eb' WHERE id = '8c7ec232-281c-4f9a-9482-fe1b1950a67a';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('9b5d2cd4-154b-4b0a-bff9-a99fa310369f', 'a3f6ea31-c5de-4553-b269-870b872de0eb', 'pix', 6900.0, '2026-05-22', '25e2da5b-9e76-4388-9890-7e22efd6940d', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('f2ef5a4d-fcbb-47b5-9834-02dfd947ca35', 20, 'a3f6ea31-c5de-4553-b269-870b872de0eb', 'Brinde', 50.0, '2026-05-22', '25e2da5b-9e76-4388-9890-7e22efd6940d', '2026-05-22');

-- === VENDA 11429: IPHONE 16 PRO 256GB PRETO SEMINOVO (22/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('fa5132ac-54ff-4487-8d28-377ada954250', 'Apple', 'IPHONE 16 PRO 256GB PRETO SEMINOVO', '355983889574156', 4800.0, 4500.0, 20, 'seminovo', 'bom', 'vendido', '2026-05-22', '2026-05-22', '25e2da5b-9e76-4388-9890-7e22efd6940d', '2026-05-22', '2026-05-22', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('4352114e-a20d-4e71-b6f8-a846314f9216', 11429, current_setting('importacao.cliente_id')::uuid, 20, '25e2da5b-9e76-4388-9890-7e22efd6940d', 'concluida', 'normal', 4800.0, 4800.0, 0.0, '2026-05-22', '2026-05-22', '25e2da5b-9e76-4388-9890-7e22efd6940d');
UPDATE aparelhos SET venda_id = '4352114e-a20d-4e71-b6f8-a846314f9216' WHERE id = 'fa5132ac-54ff-4487-8d28-377ada954250';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('5b877cd8-ccd9-4bb0-925b-6f5cc36f948a', '4352114e-a20d-4e71-b6f8-a846314f9216', 'pix', 4800.0, '2026-05-22', '25e2da5b-9e76-4388-9890-7e22efd6940d', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('21f61165-06b6-47e3-a663-4dfc9e99ebef', 20, '4352114e-a20d-4e71-b6f8-a846314f9216', 'Brinde', 25.0, '2026-05-22', '25e2da5b-9e76-4388-9890-7e22efd6940d', '2026-05-22');

-- === VENDA 11430: IPHONE 15 PRO MAX 256GB PRETO SEMINOVO (23/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('01c140e9-463e-4924-9dfb-e338b188df73', 'Apple', 'IPHONE 15 PRO MAX 256GB PRETO SEMINOVO', '354570357307499', 3950.0, 3700.0, 1, 'seminovo', 'bom', 'vendido', '2026-05-23', '2026-05-23', 'e07d4d35-1381-4d4d-914d-8382a7456fdd', '2026-05-23', '2026-05-23', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('4b9fe34f-835a-471e-81a2-ee73c16e4a7e', 11430, current_setting('importacao.cliente_id')::uuid, 1, 'e07d4d35-1381-4d4d-914d-8382a7456fdd', 'concluida', 'normal', 3950.0, 3950.0, 0.0, '2026-05-23', '2026-05-23', 'e07d4d35-1381-4d4d-914d-8382a7456fdd');
UPDATE aparelhos SET venda_id = '4b9fe34f-835a-471e-81a2-ee73c16e4a7e' WHERE id = '01c140e9-463e-4924-9dfb-e338b188df73';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('a8e047fe-8c3c-4072-8444-173127742eb6', '4b9fe34f-835a-471e-81a2-ee73c16e4a7e', 'pix', 3950.0, '2026-05-23', 'e07d4d35-1381-4d4d-914d-8382a7456fdd', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('4f1534b6-626e-44ad-8fc5-c4a9ec868a31', 1, '4b9fe34f-835a-471e-81a2-ee73c16e4a7e', 'Brinde', 25.0, '2026-05-23', 'e07d4d35-1381-4d4d-914d-8382a7456fdd', '2026-05-23');

-- === VENDA 11431: IPHONE 15 128GB PRETO SEMINOVO (23/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('f031a500-ad79-45bd-ba64-3d6cf961ea9f', 'Apple', 'IPHONE 15 128GB PRETO SEMINOVO', '351750724879288', 3076.0, 2730.0, 19, 'seminovo', 'bom', 'vendido', '2026-05-23', '2026-05-23', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-23', '2026-05-23', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('981fce81-8dd3-4f08-9dfc-405337a3e1cf', 11431, current_setting('importacao.cliente_id')::uuid, 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 3076.0, 3076.0, 0.0, '2026-05-23', '2026-05-23', '97f12885-87ad-426a-8bbb-656889d82e10');
UPDATE aparelhos SET venda_id = '981fce81-8dd3-4f08-9dfc-405337a3e1cf' WHERE id = 'f031a500-ad79-45bd-ba64-3d6cf961ea9f';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('7a1a7b07-cff6-483d-b190-a72b0592bfa9', '981fce81-8dd3-4f08-9dfc-405337a3e1cf', 'pix', 3076.0, '2026-05-23', '97f12885-87ad-426a-8bbb-656889d82e10', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('65e95d0b-f8ed-4d86-b42f-c6f1dbc280c9', 19, '981fce81-8dd3-4f08-9dfc-405337a3e1cf', 'Brinde', 25.0, '2026-05-23', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-23');

-- === VENDA 11432: IPHONE 17 PRO 256GB BRANCO SEMINOVO (23/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('54af9ab6-5500-4821-8c51-06f8d937b744', 'Apple', 'IPHONE 17 PRO 256GB BRANCO SEMINOVO', '356839676778476', 6700.0, 6100.0, 20, 'seminovo', 'bom', 'vendido', '2026-05-23', '2026-05-23', '25e2da5b-9e76-4388-9890-7e22efd6940d', '2026-05-23', '2026-05-23', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('bb1bf34b-ba8b-4ee7-92a5-ad3284bc0574', 11432, current_setting('importacao.cliente_id')::uuid, 20, '25e2da5b-9e76-4388-9890-7e22efd6940d', 'concluida', 'normal', 6700.0, 6700.0, 0.0, '2026-05-23', '2026-05-23', '25e2da5b-9e76-4388-9890-7e22efd6940d');
UPDATE aparelhos SET venda_id = 'bb1bf34b-ba8b-4ee7-92a5-ad3284bc0574' WHERE id = '54af9ab6-5500-4821-8c51-06f8d937b744';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('b23b5ea0-3644-472b-a721-e89f6fa6fc52', 'bb1bf34b-ba8b-4ee7-92a5-ad3284bc0574', 'pix', 6700.0, '2026-05-23', '25e2da5b-9e76-4388-9890-7e22efd6940d', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('f0d0acb7-87ff-4496-8402-8ed5500ce609', 20, 'bb1bf34b-ba8b-4ee7-92a5-ad3284bc0574', 'Brinde', 50.0, '2026-05-23', '25e2da5b-9e76-4388-9890-7e22efd6940d', '2026-05-23');

-- === VENDA 11433: IPHONE 17 PRO MAX 1TB BRANCO NOVO (23/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('f45d0c34-0264-4a21-a5c0-3d6a76ff7548', 'Apple', 'IPHONE 17 PRO MAX 1TB BRANCO NOVO', '350230970121553', 10678.0, 10300.0, 1, 'novo', 'perfeito', 'vendido', '2026-05-23', '2026-05-23', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-23', '2026-05-23', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('7984811b-7d24-421e-88e8-d6152264798d', 11433, current_setting('importacao.cliente_id')::uuid, 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 10678.0, 10678.0, 0.0, '2026-05-23', '2026-05-23', '85e3aa42-b9af-49b8-a72a-64e9c337aa53');
UPDATE aparelhos SET venda_id = '7984811b-7d24-421e-88e8-d6152264798d' WHERE id = 'f45d0c34-0264-4a21-a5c0-3d6a76ff7548';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('6f4cd373-b6cd-4997-8d91-745aa97f1421', '7984811b-7d24-421e-88e8-d6152264798d', 'pix', 10678.0, '2026-05-23', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('f108c666-cfa4-459f-902f-3f4da47b5ef9', 1, '7984811b-7d24-421e-88e8-d6152264798d', 'Brinde', 10.0, '2026-05-23', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-23');

-- === VENDA 11434: IPHONE 16 PRO MAX 256GB NATURAL SEMINOVO (23/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('00413af7-cfba-4858-9428-0d5a30365a31', 'Apple', 'IPHONE 16 PRO MAX 256GB NATURAL SEMINOVO', '358245524573077', 5200.0, 4850.0, 1, 'seminovo', 'bom', 'vendido', '2026-05-23', '2026-05-23', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-23', '2026-05-23', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('cf2c34a4-eb9e-4152-be86-dbc5f2deb4be', 11434, current_setting('importacao.cliente_id')::uuid, 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 5200.0, 5200.0, 0.0, '2026-05-23', '2026-05-23', '85e3aa42-b9af-49b8-a72a-64e9c337aa53');
UPDATE aparelhos SET venda_id = 'cf2c34a4-eb9e-4152-be86-dbc5f2deb4be' WHERE id = '00413af7-cfba-4858-9428-0d5a30365a31';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('0000130e-13e7-4950-b36f-8593afbf29b0', 'cf2c34a4-eb9e-4152-be86-dbc5f2deb4be', 'pix', 5200.0, '2026-05-23', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('3bdf145a-5722-4f3e-bfd8-e43a7fe5f591', 1, 'cf2c34a4-eb9e-4152-be86-dbc5f2deb4be', 'Brinde', 25.0, '2026-05-23', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-23');

-- === VENDA 11435: IPHONE 17 PRO LARANJA 256GB NOVO (23/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('7f6a1f02-640e-47fb-9b7a-040017c2661b', 'Apple', 'IPHONE 17 PRO LARANJA 256GB NOVO', '352001995775691', 7450.0, 7300.0, 1, 'novo', 'perfeito', 'vendido', '2026-05-23', '2026-05-23', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-23', '2026-05-23', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('1d74c3b7-4d38-4eba-9dca-ed2bb80ebab2', 11435, current_setting('importacao.cliente_id')::uuid, 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 7450.0, 7450.0, 0.0, '2026-05-23', '2026-05-23', '85e3aa42-b9af-49b8-a72a-64e9c337aa53');
UPDATE aparelhos SET venda_id = '1d74c3b7-4d38-4eba-9dca-ed2bb80ebab2' WHERE id = '7f6a1f02-640e-47fb-9b7a-040017c2661b';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('69002d9a-11f2-4d90-b870-46eda0f9da8e', '1d74c3b7-4d38-4eba-9dca-ed2bb80ebab2', 'pix', 7450.0, '2026-05-23', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('a914f468-d2bd-492e-b36e-79756b3d7ee4', 1, '1d74c3b7-4d38-4eba-9dca-ed2bb80ebab2', 'Brinde', 10.0, '2026-05-23', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-23');

-- === VENDA 11436: ULTRA 3 NOVO PRETO (23/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('f26e5f32-e5f0-4597-90fe-bda7ebce00f9', 'Outros', 'ULTRA 3 NOVO PRETO', 'HV4QK4YL20', 4650.0, 4580.0, 1, 'novo', 'perfeito', 'vendido', '2026-05-23', '2026-05-23', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-23', '2026-05-23', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('af9ab695-0eaf-4312-b1d1-61efe204a69f', 11436, current_setting('importacao.cliente_id')::uuid, 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 4650.0, 4650.0, 0.0, '2026-05-23', '2026-05-23', '85e3aa42-b9af-49b8-a72a-64e9c337aa53');
UPDATE aparelhos SET venda_id = 'af9ab695-0eaf-4312-b1d1-61efe204a69f' WHERE id = 'f26e5f32-e5f0-4597-90fe-bda7ebce00f9';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('0edbb19f-81d3-4673-88aa-fc7da2c10462', 'af9ab695-0eaf-4312-b1d1-61efe204a69f', 'pix', 4650.0, '2026-05-23', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 1);

-- === VENDA 11437: IPHONE 15 PRO MAX 256GB PRETO SEMINOVO (23/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('d2702688-d615-4b38-a655-9facc890b1d0', 'Apple', 'IPHONE 15 PRO MAX 256GB PRETO SEMINOVO', '352310725732009', 4000.0, 3700.0, 20, 'seminovo', 'bom', 'vendido', '2026-05-23', '2026-05-23', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-23', '2026-05-23', 'Vendedor Angel - pendente ID real');
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('9fc4f753-9836-466b-9e15-f77af648a56f', 11437, current_setting('importacao.cliente_id')::uuid, 20, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 4000.0, 4000.0, 0.0, '2026-05-23', '2026-05-23', '97f12885-87ad-426a-8bbb-656889d82e10');
UPDATE aparelhos SET venda_id = '9fc4f753-9836-466b-9e15-f77af648a56f' WHERE id = 'd2702688-d615-4b38-a655-9facc890b1d0';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('f2065345-acc9-4771-b616-4c821378e002', '9fc4f753-9836-466b-9e15-f77af648a56f', 'pix', 4000.0, '2026-05-23', '97f12885-87ad-426a-8bbb-656889d82e10', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('5a4c8b4b-31aa-4f8b-8611-acc05ea6692c', 20, '9fc4f753-9836-466b-9e15-f77af648a56f', 'Brinde', 28.0, '2026-05-23', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-23');

-- === VENDA 11438: IPHONE 17 PRO MAX 256GB  BRANCO NOVO (24/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('828033cc-293e-44d7-a688-92c26880b2aa', 'Apple', 'IPHONE 17 PRO MAX 256GB  BRANCO NOVO', '350230976530443', 8296.0, 7850.0, 1, 'novo', 'perfeito', 'vendido', '2026-05-24', '2026-05-24', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-24', '2026-05-24', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('5d657d20-9be9-4a72-9aa3-cc22801a23df', 11438, current_setting('importacao.cliente_id')::uuid, 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 8296.0, 8296.0, 0.0, '2026-05-24', '2026-05-24', '85e3aa42-b9af-49b8-a72a-64e9c337aa53');
UPDATE aparelhos SET venda_id = '5d657d20-9be9-4a72-9aa3-cc22801a23df' WHERE id = '828033cc-293e-44d7-a688-92c26880b2aa';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('1070eabc-2a2c-4c49-ad24-ba514b988fce', '5d657d20-9be9-4a72-9aa3-cc22801a23df', 'pix', 8296.0, '2026-05-24', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('638a1f76-e9a3-431e-a050-65858609557f', 1, '5d657d20-9be9-4a72-9aa3-cc22801a23df', 'Brinde', 25.0, '2026-05-24', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-24');

-- === VENDA 11439: IPHONE 17 PRO MAX 256GB SILVER NOVO (24/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('ff4600df-c378-41b5-a07f-d1db83537510', 'Apple', 'IPHONE 17 PRO MAX 256GB SILVER NOVO', '351771409636900', 8250.0, 7900.0, 20, 'novo', 'perfeito', 'vendido', '2026-05-24', '2026-05-24', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-24', '2026-05-24', 'Vendedor Angel - pendente ID real');
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('24225184-a246-4aaf-a0c0-c245f17475da', 11439, current_setting('importacao.cliente_id')::uuid, 20, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 8250.0, 8250.0, 0.0, '2026-05-24', '2026-05-24', '97f12885-87ad-426a-8bbb-656889d82e10');
UPDATE aparelhos SET venda_id = '24225184-a246-4aaf-a0c0-c245f17475da' WHERE id = 'ff4600df-c378-41b5-a07f-d1db83537510';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('0967a456-53f1-4d7c-8abd-6d7f7d2b6932', '24225184-a246-4aaf-a0c0-c245f17475da', 'pix', 8250.0, '2026-05-24', '97f12885-87ad-426a-8bbb-656889d82e10', 1);

-- === VENDA 11440: IPHONE 16 PRO MAX 1TB BRANCO SEMINOVO (24/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('6b37a70e-6676-4616-9229-1ced96f47f92', 'Apple', 'IPHONE 16 PRO MAX 1TB BRANCO SEMINOVO', '356864569095853', 5800.0, 5300.0, 19, 'seminovo', 'bom', 'vendido', '2026-05-24', '2026-05-24', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-24', '2026-05-24', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('fff2d89b-c158-4c56-ae51-f5aa58bb0a32', 11440, current_setting('importacao.cliente_id')::uuid, 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 5800.0, 5800.0, 0.0, '2026-05-24', '2026-05-24', '97f12885-87ad-426a-8bbb-656889d82e10');
UPDATE aparelhos SET venda_id = 'fff2d89b-c158-4c56-ae51-f5aa58bb0a32' WHERE id = '6b37a70e-6676-4616-9229-1ced96f47f92';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('cb45c5f2-6994-405c-900d-fed545ae1b45', 'fff2d89b-c158-4c56-ae51-f5aa58bb0a32', 'pix', 5800.0, '2026-05-24', '97f12885-87ad-426a-8bbb-656889d82e10', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('998c89d5-8636-4793-bf53-4729e57124cd', 19, 'fff2d89b-c158-4c56-ae51-f5aa58bb0a32', 'Brinde', 25.0, '2026-05-24', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-24');

-- === VENDA 11441: BOOMBOX 4 LARANJA NOVO (26/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('48ccce40-223f-4305-99b3-9bec960cddaa', 'Outros', 'BOOMBOX 4 LARANJA NOVO', 'TL1973-BQ0009136', 2640.0, 2390.0, 4, 'novo', 'perfeito', 'vendido', '2026-05-26', '2026-05-26', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-26', '2026-05-26', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('c74f26be-88fc-4176-980f-c0dc39e1ce73', 11441, current_setting('importacao.cliente_id')::uuid, 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 2640.0, 2640.0, 0.0, '2026-05-26', '2026-05-26', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
UPDATE aparelhos SET venda_id = 'c74f26be-88fc-4176-980f-c0dc39e1ce73' WHERE id = '48ccce40-223f-4305-99b3-9bec960cddaa';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('97b0d454-9ab1-48d3-a902-1c5b68152316', 'c74f26be-88fc-4176-980f-c0dc39e1ce73', 'pix', 2640.0, '2026-05-26', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('3f95adad-dd6d-42e1-b810-53daa7803673', 4, 'c74f26be-88fc-4176-980f-c0dc39e1ce73', 'Brinde', 85.0, '2026-05-26', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-26');

-- === VENDA 11442: IPHONE 17 256GB  BRANCO NOVO (26/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('372ebb11-7290-4972-bbbf-9f4c565daada', 'Apple', 'IPHONE 17 256GB  BRANCO NOVO', '352824562423886', 4850.0, 4600.0, 20, 'novo', 'perfeito', 'vendido', '2026-05-26', '2026-05-26', '25e2da5b-9e76-4388-9890-7e22efd6940d', '2026-05-26', '2026-05-26', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('22dbb149-fd0e-4b83-8160-0ac0dfacef0d', 11442, current_setting('importacao.cliente_id')::uuid, 20, '25e2da5b-9e76-4388-9890-7e22efd6940d', 'concluida', 'normal', 4850.0, 4850.0, 0.0, '2026-05-26', '2026-05-26', '25e2da5b-9e76-4388-9890-7e22efd6940d');
UPDATE aparelhos SET venda_id = '22dbb149-fd0e-4b83-8160-0ac0dfacef0d' WHERE id = '372ebb11-7290-4972-bbbf-9f4c565daada';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('ed501a00-60e3-4b50-a249-5c934d7dd068', '22dbb149-fd0e-4b83-8160-0ac0dfacef0d', 'pix', 4850.0, '2026-05-26', '25e2da5b-9e76-4388-9890-7e22efd6940d', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('58e13bca-45b6-470b-a94a-da018ad4be89', 20, '22dbb149-fd0e-4b83-8160-0ac0dfacef0d', 'Brinde', 15.0, '2026-05-26', '25e2da5b-9e76-4388-9890-7e22efd6940d', '2026-05-26');

-- === VENDA 11443: IPHONE 16 PRO MAX 256GB PRETO SEMINOVO (26/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('a4c8370a-0db4-41c0-9cf8-7c1cbf8a10ea', 'Apple', 'IPHONE 16 PRO MAX 256GB PRETO SEMINOVO', '359222385905622', 5150.0, 4850.0, 19, 'seminovo', 'bom', 'vendido', '2026-05-26', '2026-05-26', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-26', '2026-05-26', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('a0a2aa00-a214-4d2b-a583-d61deed25ef0', 11443, current_setting('importacao.cliente_id')::uuid, 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 5150.0, 5150.0, 0.0, '2026-05-26', '2026-05-26', '97f12885-87ad-426a-8bbb-656889d82e10');
UPDATE aparelhos SET venda_id = 'a0a2aa00-a214-4d2b-a583-d61deed25ef0' WHERE id = 'a4c8370a-0db4-41c0-9cf8-7c1cbf8a10ea';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('826011b6-d7d5-422c-b632-04142f08dce2', 'a0a2aa00-a214-4d2b-a583-d61deed25ef0', 'pix', 5150.0, '2026-05-26', '97f12885-87ad-426a-8bbb-656889d82e10', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('b32e1127-8409-4e30-a2a3-22bf9c2c21e9', 19, 'a0a2aa00-a214-4d2b-a583-d61deed25ef0', 'Brinde', 25.0, '2026-05-26', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-26');

-- === VENDA 11444: IPHONE 16 PRO MAX 256GB DOURADO SEMINOVO (27/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('aa39827f-7cec-46b1-a6ca-047eff54a07c', 'Apple', 'IPHONE 16 PRO MAX 256GB DOURADO SEMINOVO', '357205989970540', 5250.0, 4850.0, 1, 'seminovo', 'bom', 'vendido', '2026-05-27', '2026-05-27', '9451cd9f-6770-4e32-aae8-c75fa675e818', '2026-05-27', '2026-05-27', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('0fc38ae3-c0e6-48c5-8c76-8443d1bc27e3', 11444, current_setting('importacao.cliente_id')::uuid, 1, '9451cd9f-6770-4e32-aae8-c75fa675e818', 'concluida', 'normal', 5250.0, 5250.0, 0.0, '2026-05-27', '2026-05-27', '9451cd9f-6770-4e32-aae8-c75fa675e818');
UPDATE aparelhos SET venda_id = '0fc38ae3-c0e6-48c5-8c76-8443d1bc27e3' WHERE id = 'aa39827f-7cec-46b1-a6ca-047eff54a07c';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('fd581840-f2e4-4e7b-8143-7a4f1d9ac4a6', '0fc38ae3-c0e6-48c5-8c76-8443d1bc27e3', 'pix', 5250.0, '2026-05-27', '9451cd9f-6770-4e32-aae8-c75fa675e818', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('6c9a4cd9-b71e-4118-86d6-1415125fc48b', 1, '0fc38ae3-c0e6-48c5-8c76-8443d1bc27e3', 'Brinde', 25.0, '2026-05-27', '9451cd9f-6770-4e32-aae8-c75fa675e818', '2026-05-27');

-- === VENDA 11445: IPHONE 14 128GB PRETO SEMINOVO (28/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('6c8e137c-8f8d-4a1a-9146-906ef45f3593', 'Apple', 'IPHONE 14 128GB PRETO SEMINOVO', '352051682197220', 2200.0, 1900.0, 4, 'seminovo', 'bom', 'vendido', '2026-05-28', '2026-05-28', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-28', '2026-05-28', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('9fe02a4a-5ba1-4b3e-9e98-50f0210bec6d', 11445, current_setting('importacao.cliente_id')::uuid, 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 2200.0, 2200.0, 0.0, '2026-05-28', '2026-05-28', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
UPDATE aparelhos SET venda_id = '9fe02a4a-5ba1-4b3e-9e98-50f0210bec6d' WHERE id = '6c8e137c-8f8d-4a1a-9146-906ef45f3593';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('70a4c1ce-be0a-4ef2-b1c5-30d61cfbe1e7', '9fe02a4a-5ba1-4b3e-9e98-50f0210bec6d', 'pix', 2200.0, '2026-05-28', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1);

-- === VENDA 11446: IPHONE 16 PRO MAX 1TB PRETO SEMINOVO (28/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('d5aaa1dc-b3e6-4c9d-9353-14c78f838747', 'Apple', 'IPHONE 16 PRO MAX 1TB PRETO SEMINOVO', '355067542337324', 5930.0, 5300.0, 19, 'seminovo', 'bom', 'vendido', '2026-05-28', '2026-05-28', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-28', '2026-05-28', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('c8fa3d3e-c3b8-4785-86fc-b1ec69c7053b', 11446, current_setting('importacao.cliente_id')::uuid, 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 5930.0, 5930.0, 0.0, '2026-05-28', '2026-05-28', '97f12885-87ad-426a-8bbb-656889d82e10');
UPDATE aparelhos SET venda_id = 'c8fa3d3e-c3b8-4785-86fc-b1ec69c7053b' WHERE id = 'd5aaa1dc-b3e6-4c9d-9353-14c78f838747';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('bd4d6d0e-fc0c-4900-83b9-848b0ac26977', 'c8fa3d3e-c3b8-4785-86fc-b1ec69c7053b', 'pix', 5930.0, '2026-05-28', '97f12885-87ad-426a-8bbb-656889d82e10', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('699e52c0-faaa-4344-b983-366c7d809c4b', 19, 'c8fa3d3e-c3b8-4785-86fc-b1ec69c7053b', 'Brinde', 25.0, '2026-05-28', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-28');

-- === VENDA 11447: IPHONE 16 128GB AZUL SEMINOVO (29/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('32f80517-ffaf-4645-af00-394c9220d939', 'Apple', 'IPHONE 16 128GB AZUL SEMINOVO', '351006199740582', 3830.0, 3100.0, 1, 'seminovo', 'bom', 'vendido', '2026-05-29', '2026-05-29', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-29', '2026-05-29', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('35ff243c-a43a-4491-a663-7458e718a693', 11447, current_setting('importacao.cliente_id')::uuid, 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 3830.0, 3830.0, 0.0, '2026-05-29', '2026-05-29', '85e3aa42-b9af-49b8-a72a-64e9c337aa53');
UPDATE aparelhos SET venda_id = '35ff243c-a43a-4491-a663-7458e718a693' WHERE id = '32f80517-ffaf-4645-af00-394c9220d939';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('d486358e-5724-4e82-8600-1dd0512c17b0', '35ff243c-a43a-4491-a663-7458e718a693', 'pix', 3830.0, '2026-05-29', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('831f0d85-e866-4a1f-b02c-6dfe002d3766', 1, '35ff243c-a43a-4491-a663-7458e718a693', 'Brinde', 10.0, '2026-05-29', '85e3aa42-b9af-49b8-a72a-64e9c337aa53', '2026-05-29');

-- === VENDA 11448: IPHONE 16 PRO MAX 256GB DESERT SEMINOVO (30/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('1a19dcaa-825e-4ca1-bf4d-723d562cea96', 'Apple', 'IPHONE 16 PRO MAX 256GB DESERT SEMINOVO', '354661674485405', 5200.0, 4850.0, 20, 'seminovo', 'bom', 'vendido', '2026-05-30', '2026-05-30', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', '2026-05-30', '2026-05-30', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('b06d015c-118c-43be-9675-e35e15c406df', 11448, current_setting('importacao.cliente_id')::uuid, 20, 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 'concluida', 'normal', 5200.0, 5200.0, 0.0, '2026-05-30', '2026-05-30', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4');
UPDATE aparelhos SET venda_id = 'b06d015c-118c-43be-9675-e35e15c406df' WHERE id = '1a19dcaa-825e-4ca1-bf4d-723d562cea96';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('048342b0-7988-495a-86c4-67ffe5e86e25', 'b06d015c-118c-43be-9675-e35e15c406df', 'pix', 5200.0, '2026-05-30', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 1);

-- === VENDA 11449: IPHONE 17 PRO 512GB AZUL NOVO (30/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('3ebb353f-ebcf-43dd-a9af-b0e4fb57c3b2', 'Apple', 'IPHONE 17 PRO 512GB AZUL NOVO', '354289633583902', 8250.0, 8000.0, 4, 'novo', 'perfeito', 'vendido', '2026-05-30', '2026-05-30', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-30', '2026-05-30', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('f21fd272-fa3c-4fe8-9514-0376b3af5be7', 11449, current_setting('importacao.cliente_id')::uuid, 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 8250.0, 8250.0, 0.0, '2026-05-30', '2026-05-30', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
UPDATE aparelhos SET venda_id = 'f21fd272-fa3c-4fe8-9514-0376b3af5be7' WHERE id = '3ebb353f-ebcf-43dd-a9af-b0e4fb57c3b2';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('b42b8ed9-7e92-4faf-a59b-f95956425f33', 'f21fd272-fa3c-4fe8-9514-0376b3af5be7', 'pix', 8250.0, '2026-05-30', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('de997927-69e6-4f02-bc6b-c08691a286e8', 4, 'f21fd272-fa3c-4fe8-9514-0376b3af5be7', 'Brinde', 15.0, '2026-05-30', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-30');

-- === VENDA 11450: IPHONE 16 PRO 256GB  PRETO SEMINOVO (30/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('34cb63f3-ca43-4324-8747-b9798465287f', 'Apple', 'IPHONE 16 PRO 256GB  PRETO SEMINOVO', '359896928035433', 4830.0, 4500.0, 1, 'seminovo', 'bom', 'vendido', '2026-05-30', '2026-05-30', '1d12d555-68e9-45f8-bfc0-a35a1d8d7920', '2026-05-30', '2026-05-30', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('54fcdf01-1f19-46ac-9c1d-baee8a6aba90', 11450, current_setting('importacao.cliente_id')::uuid, 1, '1d12d555-68e9-45f8-bfc0-a35a1d8d7920', 'concluida', 'normal', 4830.0, 4830.0, 0.0, '2026-05-30', '2026-05-30', '1d12d555-68e9-45f8-bfc0-a35a1d8d7920');
UPDATE aparelhos SET venda_id = '54fcdf01-1f19-46ac-9c1d-baee8a6aba90' WHERE id = '34cb63f3-ca43-4324-8747-b9798465287f';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('af24a214-86a0-48ed-bc71-e4729ca78dd9', '54fcdf01-1f19-46ac-9c1d-baee8a6aba90', 'pix', 4830.0, '2026-05-30', '1d12d555-68e9-45f8-bfc0-a35a1d8d7920', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('5ad51d01-6bb9-4738-8ac8-63f991f021db', 1, '54fcdf01-1f19-46ac-9c1d-baee8a6aba90', 'Brinde', 25.0, '2026-05-30', '1d12d555-68e9-45f8-bfc0-a35a1d8d7920', '2026-05-30');

-- === VENDA 11451: MACBOOK AIR M5 13  512GB NOVO (30/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('17858117-fd1d-4399-9564-0d23eaab38d7', 'Apple', 'MACBOOK AIR M5 13  512GB NOVO', 'K42L7RHF4J', 7350.0, 6750.0, 19, 'novo', 'perfeito', 'vendido', '2026-05-30', '2026-05-30', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-30', '2026-05-30', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('d47b244a-361d-4e66-8d1a-8fbf9ed5f8d4', 11451, current_setting('importacao.cliente_id')::uuid, 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 7350.0, 7350.0, 0.0, '2026-05-30', '2026-05-30', '97f12885-87ad-426a-8bbb-656889d82e10');
UPDATE aparelhos SET venda_id = 'd47b244a-361d-4e66-8d1a-8fbf9ed5f8d4' WHERE id = '17858117-fd1d-4399-9564-0d23eaab38d7';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('cd73d3e3-b7ea-4a54-907c-5009c6694a50', 'd47b244a-361d-4e66-8d1a-8fbf9ed5f8d4', 'pix', 7350.0, '2026-05-30', '97f12885-87ad-426a-8bbb-656889d82e10', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('d4c7a0af-1ad2-4dcf-a818-7895e1e62000', 19, 'd47b244a-361d-4e66-8d1a-8fbf9ed5f8d4', 'Brinde', 50.0, '2026-05-30', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-30');

-- === VENDA 11452: IPHONE 11 128GB PRETO USADO (30/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('23407f1d-91b2-4923-a6a5-a1fee683bc9a', 'Apple', 'IPHONE 11 128GB PRETO USADO', NULL, 1062.0, 700.0, 19, 'usado', 'regular', 'vendido', '2026-05-30', '2026-05-30', '85743f3e-1b32-49c0-9d9e-c16afd690f7d', '2026-05-30', '2026-05-30', 'Sem IMEI');
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('f3a74b24-2331-4b43-a276-7b25144c8d68', 11452, current_setting('importacao.cliente_id')::uuid, 19, '85743f3e-1b32-49c0-9d9e-c16afd690f7d', 'concluida', 'normal', 1062.0, 1062.0, 0.0, '2026-05-30', '2026-05-30', '85743f3e-1b32-49c0-9d9e-c16afd690f7d');
UPDATE aparelhos SET venda_id = 'f3a74b24-2331-4b43-a276-7b25144c8d68' WHERE id = '23407f1d-91b2-4923-a6a5-a1fee683bc9a';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('a8fe2461-cb75-4060-b661-128cb6527dd0', 'f3a74b24-2331-4b43-a276-7b25144c8d68', 'pix', 1062.0, '2026-05-30', '85743f3e-1b32-49c0-9d9e-c16afd690f7d', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('61fe0408-abc2-40e5-bcbc-10612dbc08a0', 19, 'f3a74b24-2331-4b43-a276-7b25144c8d68', 'Brinde', 25.0, '2026-05-30', '85743f3e-1b32-49c0-9d9e-c16afd690f7d', '2026-05-30');

-- === VENDA 11453: IPHONE 16 PRO MAX 256GB DESERT SEMINOVO (31/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('47d9e522-7233-4772-94da-016657c73ee4', 'Apple', 'IPHONE 16 PRO MAX 256GB DESERT SEMINOVO', '54210973599126', 5300.0, 5000.0, 4, 'seminovo', 'bom', 'vendido', '2026-05-31', '2026-05-31', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-31', '2026-05-31', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('ea5f41f9-4592-4b99-98db-33c915a9a4b7', 11453, current_setting('importacao.cliente_id')::uuid, 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 5300.0, 5300.0, 0.0, '2026-05-31', '2026-05-31', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
UPDATE aparelhos SET venda_id = 'ea5f41f9-4592-4b99-98db-33c915a9a4b7' WHERE id = '47d9e522-7233-4772-94da-016657c73ee4';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('8cbbec1c-954c-4960-b5e2-f899f8fab196', 'ea5f41f9-4592-4b99-98db-33c915a9a4b7', 'pix', 5300.0, '2026-05-31', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('c955fcc7-5552-463e-a87f-53566e640737', 4, 'ea5f41f9-4592-4b99-98db-33c915a9a4b7', 'Brinde', 15.0, '2026-05-31', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-05-31');

-- === VENDA 11454: IPHONE 15 128GB PRETO SEMINOVO (31/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('c99fe1b1-4d53-4df3-a0a6-ec9b3fa1c142', 'Apple', 'IPHONE 15 128GB PRETO SEMINOVO', '356942573789859', 2813.0, 2660.0, 19, 'seminovo', 'bom', 'vendido', '2026-05-31', '2026-05-31', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-31', '2026-05-31', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('e5cb8939-bf95-4542-a67f-6f7e8df765e0', 11454, current_setting('importacao.cliente_id')::uuid, 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 2813.0, 2813.0, 0.0, '2026-05-31', '2026-05-31', '97f12885-87ad-426a-8bbb-656889d82e10');
UPDATE aparelhos SET venda_id = 'e5cb8939-bf95-4542-a67f-6f7e8df765e0' WHERE id = 'c99fe1b1-4d53-4df3-a0a6-ec9b3fa1c142';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('12c1a9c9-c9f8-45f5-9f5a-a749616dd169', 'e5cb8939-bf95-4542-a67f-6f7e8df765e0', 'pix', 2813.0, '2026-05-31', '97f12885-87ad-426a-8bbb-656889d82e10', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('2fdc91b1-6ed4-4909-b980-6f3509a0119c', 19, 'e5cb8939-bf95-4542-a67f-6f7e8df765e0', 'Brinde', 25.0, '2026-05-31', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-05-31');

-- === VENDA 11455: IPHONE 14 PRO 128GB BRANCO SEMINOVO (31/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('4126f526-93f9-42d3-af49-0307a33d55e1', 'Apple', 'IPHONE 14 PRO 128GB BRANCO SEMINOVO', '352130217510063', 2900.0, 2700.0, 20, 'seminovo', 'bom', 'vendido', '2026-05-31', '2026-05-31', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', '2026-05-31', '2026-05-31', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('f5437247-0d95-473c-959f-406613859d21', 11455, current_setting('importacao.cliente_id')::uuid, 20, 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 'concluida', 'normal', 2900.0, 2900.0, 0.0, '2026-05-31', '2026-05-31', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4');
UPDATE aparelhos SET venda_id = 'f5437247-0d95-473c-959f-406613859d21' WHERE id = '4126f526-93f9-42d3-af49-0307a33d55e1';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('bcac7255-5071-4793-87ad-de5f597cad3b', 'f5437247-0d95-473c-959f-406613859d21', 'pix', 2900.0, '2026-05-31', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('758a33e9-892c-4a7a-9b78-5bdcddbde246', 20, 'f5437247-0d95-473c-959f-406613859d21', 'Brinde', 5.0, '2026-05-31', 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', '2026-05-31');

-- === VENDA 11456: POCO X7 PRO 512GB PRETO NOVO (31/05/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('d022b449-78fb-4d7b-9834-10031ded7fef', 'Outros', 'POCO X7 PRO 512GB PRETO NOVO', '869471083132525', 2190.0, 1990.0, 20, 'novo', 'perfeito', 'vendido', '2026-05-31', '2026-05-31', '25e2da5b-9e76-4388-9890-7e22efd6940d', '2026-05-31', '2026-05-31', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('21af1732-15ca-43d5-a2b2-5978ce46c90a', 11456, current_setting('importacao.cliente_id')::uuid, 20, '25e2da5b-9e76-4388-9890-7e22efd6940d', 'concluida', 'normal', 2190.0, 2190.0, 0.0, '2026-05-31', '2026-05-31', '25e2da5b-9e76-4388-9890-7e22efd6940d');
UPDATE aparelhos SET venda_id = '21af1732-15ca-43d5-a2b2-5978ce46c90a' WHERE id = 'd022b449-78fb-4d7b-9834-10031ded7fef';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('9633712f-b20a-4092-8464-d61c27dab3a6', '21af1732-15ca-43d5-a2b2-5978ce46c90a', 'pix', 2190.0, '2026-05-31', '25e2da5b-9e76-4388-9890-7e22efd6940d', 1);

-- === VENDA 11457: IPHONE 17 PRO MAX 256GB AZUL NOVO (02/06/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('52b8eb10-eaf9-41cc-8470-dbd22de2bf94', 'Apple', 'IPHONE 17 PRO MAX 256GB AZUL NOVO', '355101476201071', 7464.0, 7250.0, 4, 'novo', 'perfeito', 'vendido', '2026-06-02', '2026-06-02', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-06-02', '2026-06-02', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('fcdf715d-5404-4bad-b801-dd7e87fd042f', 11457, current_setting('importacao.cliente_id')::uuid, 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 7464.0, 7464.0, 0.0, '2026-06-02', '2026-06-02', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
UPDATE aparelhos SET venda_id = 'fcdf715d-5404-4bad-b801-dd7e87fd042f' WHERE id = '52b8eb10-eaf9-41cc-8470-dbd22de2bf94';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('c2344de0-d749-4a8e-b0be-70562f032c31', 'fcdf715d-5404-4bad-b801-dd7e87fd042f', 'pix', 7464.0, '2026-06-02', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('db6c3728-d57b-4590-8ad3-8b12b19feb69', 4, 'fcdf715d-5404-4bad-b801-dd7e87fd042f', 'Brinde', 30.0, '2026-06-02', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-06-02');

-- === VENDA 11458: IPHONE 13 PRO 256GB DOURADO SEMIINOVO (02/06/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('6c29d312-1542-4071-9408-93c2e9c1a9c1', 'Apple', 'IPHONE 13 PRO 256GB DOURADO SEMIINOVO', '352725357604046', 2700.0, 2400.0, 19, 'novo', 'perfeito', 'vendido', '2026-06-02', '2026-06-02', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-06-02', '2026-06-02', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('e8cb709f-5cde-40c2-af55-37e1c0baf88b', 11458, current_setting('importacao.cliente_id')::uuid, 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 2700.0, 2700.0, 0.0, '2026-06-02', '2026-06-02', '97f12885-87ad-426a-8bbb-656889d82e10');
UPDATE aparelhos SET venda_id = 'e8cb709f-5cde-40c2-af55-37e1c0baf88b' WHERE id = '6c29d312-1542-4071-9408-93c2e9c1a9c1';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('73992d1b-b159-4bd9-8846-253428a123c0', 'e8cb709f-5cde-40c2-af55-37e1c0baf88b', 'pix', 2700.0, '2026-06-02', '97f12885-87ad-426a-8bbb-656889d82e10', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('987b4674-77c0-44ce-95a7-a7453fad2a52', 19, 'e8cb709f-5cde-40c2-af55-37e1c0baf88b', 'Brinde', 25.0, '2026-06-02', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-06-02');

-- === VENDA 11459: IPHONE 15 PRO MAX 256GB SEMINOVO (03/06/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('ec65e6fc-7766-40bf-9cae-ae48e1f0ed46', 'Apple', 'IPHONE 15 PRO MAX 256GB SEMINOVO', '356371488105219', 4010.0, 3700.0, 4, 'seminovo', 'bom', 'vendido', '2026-06-03', '2026-06-03', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-06-03', '2026-06-03', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('c8b1149f-d3c9-43c1-9986-1fcfad8b0da2', 11459, current_setting('importacao.cliente_id')::uuid, 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 4010.0, 4010.0, 0.0, '2026-06-03', '2026-06-03', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
UPDATE aparelhos SET venda_id = 'c8b1149f-d3c9-43c1-9986-1fcfad8b0da2' WHERE id = 'ec65e6fc-7766-40bf-9cae-ae48e1f0ed46';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('05ab160a-8e4a-42c2-9325-10b0ae67c953', 'c8b1149f-d3c9-43c1-9986-1fcfad8b0da2', 'pix', 4010.0, '2026-06-03', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('63de146f-8083-4745-b677-c7302d09daa3', 4, 'c8b1149f-d3c9-43c1-9986-1fcfad8b0da2', 'Brinde', 33.0, '2026-06-03', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-06-03');

-- === VENDA 11460: IPHONE 17 PRO MAX 256GB SILVER NOVO (03/06/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('0817f2ca-75d0-4402-b08b-a0af8a8f1e6b', 'Apple', 'IPHONE 17 PRO MAX 256GB SILVER NOVO', '351668140730168', 7750.0, 7550.0, 19, 'novo', 'perfeito', 'vendido', '2026-06-03', '2026-06-03', '97f12885-87ad-426a-8bbb-656889d82e10', '2026-06-03', '2026-06-03', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('0a2f998e-dffd-4396-863c-42559d87b132', 11460, current_setting('importacao.cliente_id')::uuid, 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 7750.0, 7750.0, 0.0, '2026-06-03', '2026-06-03', '97f12885-87ad-426a-8bbb-656889d82e10');
UPDATE aparelhos SET venda_id = '0a2f998e-dffd-4396-863c-42559d87b132' WHERE id = '0817f2ca-75d0-4402-b08b-a0af8a8f1e6b';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('d5b29658-0e73-4522-815a-75fd307b9bef', '0a2f998e-dffd-4396-863c-42559d87b132', 'pix', 7750.0, '2026-06-03', '97f12885-87ad-426a-8bbb-656889d82e10', 1);

-- === VENDA 11461: IPHONE 17 PRO 256GB SILVER NOVO (04/06/2026) ===
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes)
VALUES ('bd8695dc-9a62-407c-b0f8-d7c6dc434729', 'Apple', 'IPHONE 17 PRO 256GB SILVER NOVO', '357679992297861', 7370.0, 6950.0, 4, 'novo', 'perfeito', 'vendido', '2026-06-04', '2026-06-04', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-06-04', '2026-06-04', NULL);
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por)
VALUES ('21734bdd-cd5e-4e8c-bbf2-7b05fee042d4', 11461, current_setting('importacao.cliente_id')::uuid, 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 7370.0, 7370.0, 0.0, '2026-06-04', '2026-06-04', 'a3626643-4749-4e56-83bc-b4a8ffd53659');
UPDATE aparelhos SET venda_id = '21734bdd-cd5e-4e8c-bbf2-7b05fee042d4' WHERE id = 'bd8695dc-9a62-407c-b0f8-d7c6dc434729';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas)
VALUES ('a47f1f1a-8c91-4800-a27c-0f046d7b1d80', '21734bdd-cd5e-4e8c-bbf2-7b05fee042d4', 'pix', 7370.0, '2026-06-04', 'a3626643-4749-4e56-83bc-b4a8ffd53659', 1);
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em)
VALUES ('7436d6f7-21cf-4694-8385-81fb375da9ab', 4, '21734bdd-cd5e-4e8c-bbf2-7b05fee042d4', 'Brinde', 30.0, '2026-06-04', 'a3626643-4749-4e56-83bc-b4a8ffd53659', '2026-06-04');

COMMIT;

-- ============================================
-- RESUMO
-- Aparelhos: 60
-- Vendas:    60
-- Pagamentos: 60
-- Brindes:   49
-- Trocas:    0
-- Sem IMEI:  7
-- IMEI dup:  0
-- Erros:     0
-- ============================================