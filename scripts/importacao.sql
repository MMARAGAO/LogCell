-- ============================================
-- Script de importacao gerado em 2026-06-07 13:22:25.204112
-- Fonte: venda_aparelhos.csv (398 linhas)
-- ============================================

BEGIN;

-- ============================================
-- 1. CRIAR CLIENTE PADRAO (se nao existir)
-- ============================================
DO $$
DECLARE
    cliente_id UUID;
BEGIN
    SELECT id INTO cliente_id FROM clientes WHERE nome = 'CLIENTE BALCAO' LIMIT 1;
    IF cliente_id IS NULL THEN
        INSERT INTO clientes (nome, tipo_pessoa, criado_em, atualizado_em)
        VALUES ('CLIENTE BALCAO', 'fisica', NOW(), NOW())
        RETURNING id INTO cliente_id;
    END IF;
    PERFORM set_config('importacao.cliente_id', cliente_id::text, true);
END;
$$;

-- ============================================
-- 2. IMPORTAR CADA VENDA
-- ============================================

-- VENDA 1: REDMI PAD 2 128GB GRAFIT NOVO (30/06/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('8c24afd6-3e66-477e-84ea-281b94ae2388', 'REDMI PAD 2 128GB GRAFIT', '65520/W5Z501219', 1200.0, 900.0, 1, 'vendido', 'novo', '2026-06-30', '2026-06-30', '2026-06-30', '2026-06-30');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('4de72d05-b854-4915-90a0-2ade633dc42d', 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 1200.0, 1200.0, 0, 0, '2026-06-30');
UPDATE aparelhos SET venda_id = '4de72d05-b854-4915-90a0-2ade633dc42d' WHERE id = '8c24afd6-3e66-477e-84ea-281b94ae2388';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('6d30317b-701f-4d75-a0f8-9509b213dd50', '4de72d05-b854-4915-90a0-2ade633dc42d', 'pix', 1200.0, '2026-06-30', '2026-06-30');

-- VENDA 2: MI 15T PRO 512GB PRETO NOVO (01/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('6e0008d5-ebdc-4dd8-9a04-984b73b0a19e', 'MI 15T PRO 512GB PRETO', '860786082136022', 5250.0, 5000.0, 4, 'vendido', 'novo', '2026-05-01', '2026-05-01', '2026-05-01', '2026-05-01');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('c8f2b186-8d21-4610-878d-bf8e35a953b3', 4, 'e07d4d35-1381-4d4d-914d-8382a7456fdd', 'concluida', 'normal', 5250.0, 5250.0, 0, 0, '2026-05-01');
UPDATE aparelhos SET venda_id = 'c8f2b186-8d21-4610-878d-bf8e35a953b3' WHERE id = '6e0008d5-ebdc-4dd8-9a04-984b73b0a19e';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('0886742b-69c1-48ea-a962-2d4d33f6900a', 'c8f2b186-8d21-4610-878d-bf8e35a953b3', 'pix', 5250.0, '2026-05-01', '2026-05-01');

-- VENDA 3: IPHONE 17 PRO MAX 256GB LARANJA NOVO (01/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('b2ca76cc-3d02-4cf2-9169-87bf7634b841', 'IPHONE 17 PRO MAX 256GB LARANJA', '352116262845892', 8424.0, 8200.0, 4, 'vendido', 'novo', '2026-05-01', '2026-05-01', '2026-05-01', '2026-05-01');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('0fdae0b1-d84f-4a52-863a-ea5e6c725679', 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 8424.0, 8424.0, 0, 0, '2026-05-01');
UPDATE aparelhos SET venda_id = '0fdae0b1-d84f-4a52-863a-ea5e6c725679' WHERE id = 'b2ca76cc-3d02-4cf2-9169-87bf7634b841';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('09181fed-2a8c-45a0-a374-2b8b5587558a', '0fdae0b1-d84f-4a52-863a-ea5e6c725679', 'cartao_credito', 8424.0, '2026-05-01', '2026-05-01');

-- Troca: 14 128 LILAS SEMINOVO (R$ 1800.00)
INSERT INTO aparelhos (id, modelo, valor_compra, loja_id, status, estado, observacoes, data_entrada, criado_em, atualizado_em)
VALUES ('747b33ee-c383-411a-b47e-eabce7e7602c', '14 128 LILAS SEMINOVO', 1800.0, 4, 'disponivel', 'novo', 'Entrada por troca - venda 0fdae0b1-d84f-4a52-863a-ea5e6c725679', '2026-05-01', '2026-05-01', '2026-05-01');

-- VENDA 4: IPHONE 16 PRO MAX 512GB BRANCO SEMINOVO (01/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('471f537f-4b23-4a0e-8db2-b57d9e037c04', 'IPHONE 16 PRO MAX 512GB BRANCO', '355300182456355', 5700.0, 5150.0, 1, 'vendido', 'seminovo', '2026-05-01', '2026-05-01', '2026-05-01', '2026-05-01');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('4a01ecfc-fb14-41bb-8f00-6326b6757746', 1, '9451cd9f-6770-4e32-aae8-c75fa675e818', 'concluida', 'normal', 5700.0, 5700.0, 0, 0, '2026-05-01');
UPDATE aparelhos SET venda_id = '4a01ecfc-fb14-41bb-8f00-6326b6757746' WHERE id = '471f537f-4b23-4a0e-8db2-b57d9e037c04';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('77724004-ff38-466b-b61c-9e81ea27e6a5', '4a01ecfc-fb14-41bb-8f00-6326b6757746', 'pix', 5700.0, '2026-05-01', '2026-05-01');

-- Troca: NO VALOR DE (R$ 2000.00)
INSERT INTO aparelhos (id, modelo, valor_compra, loja_id, status, estado, observacoes, data_entrada, criado_em, atualizado_em)
VALUES ('ca9a7f27-8f5a-49fa-8195-5ee635af5558', 'NO VALOR DE', 2000.0, 1, 'disponivel', 'usado', 'Entrada por troca - venda 4a01ecfc-fb14-41bb-8f00-6326b6757746', '2026-05-01', '2026-05-01', '2026-05-01');

-- VENDA 5: IPHONE 16 PRO MAX  1TB PRETO SEMINOVO (01/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('eedbb6cb-c37e-4c3a-8e26-9e5b48322563', 'IPHONE 16 PRO MAX  1TB PRETO', '355138329181332', 5800.0, 5350.0, 1, 'vendido', 'seminovo', '2026-05-01', '2026-05-01', '2026-05-01', '2026-05-01');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('dd3e3c8f-ee5e-4237-9597-b187bc171e5c', 1, '9451cd9f-6770-4e32-aae8-c75fa675e818', 'concluida', 'normal', 5800.0, 5800.0, 0, 0, '2026-05-01');
UPDATE aparelhos SET venda_id = 'dd3e3c8f-ee5e-4237-9597-b187bc171e5c' WHERE id = 'eedbb6cb-c37e-4c3a-8e26-9e5b48322563';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('3ed54ecf-602d-4972-ba9b-f4123f5135e9', 'dd3e3c8f-ee5e-4237-9597-b187bc171e5c', 'pix', 5800.0, '2026-05-01', '2026-05-01');

-- VENDA 6: IPHONE 15 PRO MAX 256GB PRETO SEMINOVO (01/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('c5a288c6-d1d7-4a6c-a86c-f58f2c582f50', 'IPHONE 15 PRO MAX 256GB PRETO', '356964467452295', 4340.0, 3950.0, 1, 'vendido', 'seminovo', '2026-05-01', '2026-05-01', '2026-05-01', '2026-05-01');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('7ebdc07c-6eab-4100-8eac-e9765d753fed', 1, '9451cd9f-6770-4e32-aae8-c75fa675e818', 'concluida', 'normal', 4340.0, 4340.0, 0, 0, '2026-05-01');
UPDATE aparelhos SET venda_id = '7ebdc07c-6eab-4100-8eac-e9765d753fed' WHERE id = 'c5a288c6-d1d7-4a6c-a86c-f58f2c582f50';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('38024304-8869-4435-a8c7-1167845a31cd', '7ebdc07c-6eab-4100-8eac-e9765d753fed', 'pix', 4340.0, '2026-05-01', '2026-05-01');

-- VENDA 7: IPHONE 16 PRO MAX 256GB PRETO SEMINOVO (01/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('48fd6614-7daa-4057-a11f-b6901b576faf', 'IPHONE 16 PRO MAX 256GB PRETO', '356541623888990', 5550.0, 5000.0, 1, 'vendido', 'seminovo', '2026-05-01', '2026-05-01', '2026-05-01', '2026-05-01');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('cb54c92c-44cf-4aa0-a22f-cec3517fbc25', 1, '9451cd9f-6770-4e32-aae8-c75fa675e818', 'concluida', 'normal', 5550.0, 5550.0, 0, 0, '2026-05-01');
UPDATE aparelhos SET venda_id = 'cb54c92c-44cf-4aa0-a22f-cec3517fbc25' WHERE id = '48fd6614-7daa-4057-a11f-b6901b576faf';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('c13df9f2-3479-4012-86fb-1a19f5e163f4', 'cb54c92c-44cf-4aa0-a22f-cec3517fbc25', 'pix', 5550.0, '2026-05-01', '2026-05-01');

-- Troca: NO VALOR DE (R$ 3000.00)
INSERT INTO aparelhos (id, modelo, valor_compra, loja_id, status, estado, observacoes, data_entrada, criado_em, atualizado_em)
VALUES ('60804aa1-3482-4aa9-98ea-e98f9eef9d2e', 'NO VALOR DE', 3000.0, 1, 'disponivel', 'usado', 'Entrada por troca - venda cb54c92c-44cf-4aa0-a22f-cec3517fbc25', '2026-05-01', '2026-05-01', '2026-05-01');

-- VENDA 8: IPHONE 17 PRO SILVER 256GB NOVO (01/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('032586d5-fc0c-4e38-b681-c7caa17af755', 'IPHONE 17 PRO SILVER 256GB', '352001997459930', 7900.0, 7600.0, 19, 'vendido', 'novo', '2026-05-01', '2026-05-01', '2026-05-01', '2026-05-01');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('ec46a71d-a7a9-43b5-829d-922535872760', 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 7900.0, 7900.0, 0, 0, '2026-05-01');
UPDATE aparelhos SET venda_id = 'ec46a71d-a7a9-43b5-829d-922535872760' WHERE id = '032586d5-fc0c-4e38-b681-c7caa17af755';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('4a389e8e-4748-4fd0-acc7-3f4b2339dc5b', 'ec46a71d-a7a9-43b5-829d-922535872760', 'pix', 7900.0, '2026-05-01', '2026-05-01');

-- Troca: IPHONE 16 PRO (R$ 4400.00)
INSERT INTO aparelhos (id, modelo, valor_compra, loja_id, status, estado, observacoes, data_entrada, criado_em, atualizado_em)
VALUES ('67ce77d1-cc28-42e1-bae7-335fb08f01d6', 'IPHONE 16 PRO', 4400.0, 19, 'disponivel', 'usado', 'Entrada por troca - venda ec46a71d-a7a9-43b5-829d-922535872760', '2026-05-01', '2026-05-01', '2026-05-01');

-- VENDA 9: IPHONE 14 PRO MAX 128GB ROXO SEMINOVO (01/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('a78c9945-34f2-4b1a-9d67-6b486d2fac7a', 'IPHONE 14 PRO MAX 128GB ROXO', '357650618525795', 3500.0, 3250.0, 20, 'vendido', 'seminovo', '2026-05-01', '2026-05-01', '2026-05-01', '2026-05-01');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('401e3ab6-cbc5-4077-8fe4-00e2d1511427', 20, '25e2da5b-9e76-4388-9890-7e22efd6940d', 'concluida', 'normal', 3500.0, 3500.0, 0, 0, '2026-05-01');
UPDATE aparelhos SET venda_id = '401e3ab6-cbc5-4077-8fe4-00e2d1511427' WHERE id = 'a78c9945-34f2-4b1a-9d67-6b486d2fac7a';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('0662b1f4-8e15-4940-9ec1-6e549dec6c06', '401e3ab6-cbc5-4077-8fe4-00e2d1511427', 'pix', 3500.0, '2026-05-01', '2026-05-01');

-- VENDA 10: IPHONE 12 PRO MAX 256GB GOLD SEMINOVO (01/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('7dd02ad2-5cdb-49a2-9301-e8db5ac77fd6', 'IPHONE 12 PRO MAX 256GB GOLD', '350408484865846', 2600.0, 2350.0, 1, 'vendido', 'seminovo', '2026-05-01', '2026-05-01', '2026-05-01', '2026-05-01');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('ede499d7-2d6e-4379-a241-bc1cdb45726d', 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 2600.0, 2600.0, 0, 0, '2026-05-01');
UPDATE aparelhos SET venda_id = 'ede499d7-2d6e-4379-a241-bc1cdb45726d' WHERE id = '7dd02ad2-5cdb-49a2-9301-e8db5ac77fd6';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('cd5920ca-ba2e-43d7-9632-0e8482243097', 'ede499d7-2d6e-4379-a241-bc1cdb45726d', 'pix', 2600.0, '2026-05-01', '2026-05-01');

-- VENDA 11: IPHONE 14 PRO MAX 256GB ROXO SEMINOVO (01/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('a4182313-0d3f-4f96-ad7f-82e60c03dcf0', 'IPHONE 14 PRO MAX 256GB ROXO', '353665909220967', 3460.0, 3300.0, 1, 'vendido', 'seminovo', '2026-05-01', '2026-05-01', '2026-05-01', '2026-05-01');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('a7f49b2d-128c-4977-8e3b-bd683ec42bcf', 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 3460.0, 3460.0, 0, 0, '2026-05-01');
UPDATE aparelhos SET venda_id = 'a7f49b2d-128c-4977-8e3b-bd683ec42bcf' WHERE id = 'a4182313-0d3f-4f96-ad7f-82e60c03dcf0';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('691057cd-d167-4601-9aa3-ac8024c53e76', 'a7f49b2d-128c-4977-8e3b-bd683ec42bcf', 'pix', 3460.0, '2026-05-01', '2026-05-01');

-- VENDA 12: IPHONE 16 PRO 256GB BRANCO SEMINOVO (01/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('97c3924c-58d3-4d40-b567-0363913e4bf2', 'IPHONE 16 PRO 256GB BRANCO', '355515605909702', 5915.0, 4500.0, 1, 'vendido', 'seminovo', '2026-05-01', '2026-05-01', '2026-05-01', '2026-05-01');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('ab481303-948b-4e84-947d-96cb8b3126a0', 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 5915.0, 5915.0, 0, 0, '2026-05-01');
UPDATE aparelhos SET venda_id = 'ab481303-948b-4e84-947d-96cb8b3126a0' WHERE id = '97c3924c-58d3-4d40-b567-0363913e4bf2';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('000a87ea-3fbe-4675-91b7-e072f79ba74a', 'ab481303-948b-4e84-947d-96cb8b3126a0', 'pix', 5915.0, '2026-05-01', '2026-05-01');

-- Troca: IPH 15 PRO MAX 256GB NATURAL (R$ 3200.00)
INSERT INTO aparelhos (id, modelo, valor_compra, loja_id, status, estado, observacoes, data_entrada, criado_em, atualizado_em)
VALUES ('3ee73966-4e0c-4701-b395-97faae70c2f8', 'IPH 15 PRO MAX 256GB NATURAL', 3200.0, 1, 'disponivel', 'usado', 'Entrada por troca - venda ab481303-948b-4e84-947d-96cb8b3126a0', '2026-05-01', '2026-05-01', '2026-05-01');

-- VENDA 13: IPHONE 16 PRO MAX 512GB NATURAL SEMINOVO (01/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('c3ab0678-1a65-4c4d-85e7-23059cf82bf4', 'IPHONE 16 PRO MAX 512GB NATURAL', '355138329035488', 5525.0, 5150.0, 1, 'vendido', 'seminovo', '2026-05-01', '2026-05-01', '2026-05-01', '2026-05-01');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('44fed83a-46b9-4a3a-b30b-a8cb6e203502', 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 5525.0, 5525.0, 0, 0, '2026-05-01');
UPDATE aparelhos SET venda_id = '44fed83a-46b9-4a3a-b30b-a8cb6e203502' WHERE id = 'c3ab0678-1a65-4c4d-85e7-23059cf82bf4';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('295b0ccb-6002-41a5-96d5-ed96f04eb219', '44fed83a-46b9-4a3a-b30b-a8cb6e203502', 'pix', 5525.0, '2026-05-01', '2026-05-01');

-- VENDA 14: IPHONE 16 PRO MAX 256GB NATURAL SEMINOVO (01/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('82937534-9aed-45ae-a33d-15e3ab512132', 'IPHONE 16 PRO MAX 256GB NATURAL', '353484624594932', 5525.0, 5000.0, 1, 'vendido', 'seminovo', '2026-05-01', '2026-05-01', '2026-05-01', '2026-05-01');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('e918675b-558c-485f-af3f-46f96f840510', 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 5525.0, 5525.0, 0, 0, '2026-05-01');
UPDATE aparelhos SET venda_id = 'e918675b-558c-485f-af3f-46f96f840510' WHERE id = '82937534-9aed-45ae-a33d-15e3ab512132';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('d3afa4ae-7433-4848-862f-f553d8162aaa', 'e918675b-558c-485f-af3f-46f96f840510', 'pix', 5525.0, '2026-05-01', '2026-05-01');

-- Troca: IPH 15 128GB (R$ 2750.00)
INSERT INTO aparelhos (id, modelo, valor_compra, loja_id, status, estado, observacoes, data_entrada, criado_em, atualizado_em)
VALUES ('fa3ae039-78d8-4d93-80e9-32017270ab1a', 'IPH 15 128GB', 2750.0, 1, 'disponivel', 'usado', 'Entrada por troca - venda e918675b-558c-485f-af3f-46f96f840510', '2026-05-01', '2026-05-01', '2026-05-01');

-- VENDA 15: MACBOOK M1 SPACE 8/256 SEMINOVO (01/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('18a7d307-a74e-4379-9586-312d93c13cc1', 'MACBOOK M1 SPACE 8/256', 'C02G79MTQ6L7', 4100.0, 3900.0, 1, 'vendido', 'seminovo', '2026-05-01', '2026-05-01', '2026-05-01', '2026-05-01');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('1b05a699-63ee-43fb-a4f1-b36bde7bff03', 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 4100.0, 4100.0, 0, 0, '2026-05-01');
UPDATE aparelhos SET venda_id = '1b05a699-63ee-43fb-a4f1-b36bde7bff03' WHERE id = '18a7d307-a74e-4379-9586-312d93c13cc1';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('f623e444-820d-45ab-b46c-0b3f3bf73443', '1b05a699-63ee-43fb-a4f1-b36bde7bff03', 'pix', 4100.0, '2026-05-01', '2026-05-01');

-- VENDA 16: IPHONE 16 PRO MAX BRANCO 1TB SEMINOVO (01/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('4f30c324-73a4-420d-9482-7c50eb0c4a79', 'IPHONE 16 PRO MAX BRANCO 1TB', '357177506679088', 6260.0, 5350.0, 1, 'vendido', 'seminovo', '2026-05-01', '2026-05-01', '2026-05-01', '2026-05-01');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('32b39304-9afc-44ba-8f7f-067372e58f49', 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 6260.0, 6260.0, 0, 0, '2026-05-01');
UPDATE aparelhos SET venda_id = '32b39304-9afc-44ba-8f7f-067372e58f49' WHERE id = '4f30c324-73a4-420d-9482-7c50eb0c4a79';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('a4cd63e0-0be1-43b0-a968-2be4ff5e9731', '32b39304-9afc-44ba-8f7f-067372e58f49', 'pix', 6260.0, '2026-05-01', '2026-05-01');

-- Troca: IPH 15 PRO MAX 256GB AZUL (R$ 3950.00)
INSERT INTO aparelhos (id, modelo, valor_compra, loja_id, status, estado, observacoes, data_entrada, criado_em, atualizado_em)
VALUES ('7b5a91ba-70a9-472e-a8dd-6cee7b157991', 'IPH 15 PRO MAX 256GB AZUL', 3950.0, 1, 'disponivel', 'usado', 'Entrada por troca - venda 32b39304-9afc-44ba-8f7f-067372e58f49', '2026-05-01', '2026-05-01', '2026-05-01');

-- VENDA 17: APPLE WATCH SERIE 11 46MM SPACE GRAY NOVO (02/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('7d5114c2-67a3-411e-93fa-469a802bc850', 'APPLE WATCH SERIE 11 46MM SPACE GRAY', 'KXJL4WFK4P', 2450.0, 2350.0, 4, 'vendido', 'novo', '2026-05-02', '2026-05-02', '2026-05-02', '2026-05-02');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('082e9747-6681-4678-a146-e3e345f40210', 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 2450.0, 2450.0, 0, 0, '2026-05-02');
UPDATE aparelhos SET venda_id = '082e9747-6681-4678-a146-e3e345f40210' WHERE id = '7d5114c2-67a3-411e-93fa-469a802bc850';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('dcaa9fe4-5231-4edf-8b1d-3a67922147aa', '082e9747-6681-4678-a146-e3e345f40210', 'cartao_credito', 2450.0, '2026-05-02', '2026-05-02');

-- VENDA 18: IPHONE 14 128GB BRANCO SEMINOVO (02/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('1e9d55d9-7f69-4105-ac9e-a204b7ac4bc3', 'IPHONE 14 128GB BRANCO', '350671525377135', 2199.0, 2050.0, 19, 'vendido', 'seminovo', '2026-05-02', '2026-05-02', '2026-05-02', '2026-05-02');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('926c5a53-d69d-4c50-a291-96ec5b29ff10', 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 2199.0, 2199.0, 0, 0, '2026-05-02');
UPDATE aparelhos SET venda_id = '926c5a53-d69d-4c50-a291-96ec5b29ff10' WHERE id = '1e9d55d9-7f69-4105-ac9e-a204b7ac4bc3';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('5f96dd7d-9e88-4f9a-b799-2d85b894fc79', '926c5a53-d69d-4c50-a291-96ec5b29ff10', 'cartao_debito', 2199.0, '2026-05-02', '2026-05-02');

-- VENDA 19: IPHONE 17 256GB LAVANDA NOVO (02/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('bdbd1162-7693-4a9b-8d3b-ebc3e44bcb4a', 'IPHONE 17 256GB LAVANDA', '359973613029086', 5300.0, 5050.0, 19, 'vendido', 'novo', '2026-05-02', '2026-05-02', '2026-05-02', '2026-05-02');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('0de2ef8f-ab15-4ae3-b768-17066cfd7ba0', 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 5300.0, 5300.0, 0, 0, '2026-05-02');
UPDATE aparelhos SET venda_id = '0de2ef8f-ab15-4ae3-b768-17066cfd7ba0' WHERE id = 'bdbd1162-7693-4a9b-8d3b-ebc3e44bcb4a';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('2d269c01-5719-457e-b90e-7a1fba8700c0', '0de2ef8f-ab15-4ae3-b768-17066cfd7ba0', 'cartao_credito', 5300.0, '2026-05-02', '2026-05-02');

-- Troca: IPH 11 128GB BRANCO (R$ 700.00)
INSERT INTO aparelhos (id, modelo, valor_compra, loja_id, status, estado, observacoes, data_entrada, criado_em, atualizado_em)
VALUES ('be5b4618-a899-4be4-ba13-e4c3071e3c66', 'IPH 11 128GB BRANCO', 700.0, 19, 'disponivel', 'usado', 'Entrada por troca - venda 0de2ef8f-ab15-4ae3-b768-17066cfd7ba0', '2026-05-02', '2026-05-02', '2026-05-02');

-- VENDA 20: APPLE WATCH ULTRA 3 PRETO NOVO (02/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('26cdbb99-5d9e-4470-a606-0b92e85153cd', 'APPLE WATCH ULTRA 3 PRETO', '368135794662306', 4750.0, 4400.0, 19, 'vendido', 'novo', '2026-05-02', '2026-05-02', '2026-05-02', '2026-05-02');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('37937719-4178-4c19-98ba-339ccb35e1e9', 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 4750.0, 4750.0, 0, 0, '2026-05-02');
UPDATE aparelhos SET venda_id = '37937719-4178-4c19-98ba-339ccb35e1e9' WHERE id = '26cdbb99-5d9e-4470-a606-0b92e85153cd';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('407ef17e-73b7-49ae-84ee-1217535ebfa3', '37937719-4178-4c19-98ba-339ccb35e1e9', 'pix', 4750.0, '2026-05-02', '2026-05-02');

-- VENDA 21: IPHONE 16 PRO MAX 512GB PRETO SEMINOVO (02/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('4a0d6512-8c25-4d12-85ef-81211b5daec2', 'IPHONE 16 PRO MAX 512GB PRETO', '356744605708190', 5600.0, 5150.0, 20, 'vendido', 'seminovo', '2026-05-02', '2026-05-02', '2026-05-02', '2026-05-02');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('a707a4ff-e9b5-4071-86f5-ac376086cdb2', 20, 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 'concluida', 'normal', 5600.0, 5600.0, 0, 0, '2026-05-02');
UPDATE aparelhos SET venda_id = 'a707a4ff-e9b5-4071-86f5-ac376086cdb2' WHERE id = '4a0d6512-8c25-4d12-85ef-81211b5daec2';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('646299f3-4909-4d3a-b09e-aad63755a92f', 'a707a4ff-e9b5-4071-86f5-ac376086cdb2', 'pix', 5600.0, '2026-05-02', '2026-05-02');

-- Troca: IPH 11 128GB PRETO / PIX (R$ 5150.00)
INSERT INTO aparelhos (id, modelo, valor_compra, loja_id, status, estado, observacoes, data_entrada, criado_em, atualizado_em)
VALUES ('aa554e15-c492-4b82-8829-b278a74ad765', 'IPH 11 128GB PRETO / PIX', 5150.0, 20, 'disponivel', 'usado', 'Entrada por troca - venda a707a4ff-e9b5-4071-86f5-ac376086cdb2', '2026-05-02', '2026-05-02', '2026-05-02');

-- VENDA 22: IPHONE 15 PRO MAX 256GB NATURAL SEMINOVO (02/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('f870f80b-a01f-4b6a-a8f8-46e0dfe0d5ce', 'IPHONE 15 PRO MAX 256GB NATURAL', '351465642570501', 4200.0, 3950.0, 1, 'vendido', 'seminovo', '2026-05-02', '2026-05-02', '2026-05-02', '2026-05-02');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('ce3892bc-606d-40d3-8521-acd0efd67338', 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 4200.0, 4200.0, 0, 0, '2026-05-02');
UPDATE aparelhos SET venda_id = 'ce3892bc-606d-40d3-8521-acd0efd67338' WHERE id = 'f870f80b-a01f-4b6a-a8f8-46e0dfe0d5ce';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('df04752c-567c-4f25-aa03-4445cece8d8c', 'ce3892bc-606d-40d3-8521-acd0efd67338', 'pix', 4200.0, '2026-05-02', '2026-05-02');

-- Troca: IPH XR 64GB PRETO (R$ 500.00)
INSERT INTO aparelhos (id, modelo, valor_compra, loja_id, status, estado, observacoes, data_entrada, criado_em, atualizado_em)
VALUES ('c512823a-3285-48b9-96c5-87ff110fbc2e', 'IPH XR 64GB PRETO', 500.0, 1, 'disponivel', 'usado', 'Entrada por troca - venda ce3892bc-606d-40d3-8521-acd0efd67338', '2026-05-02', '2026-05-02', '2026-05-02');

-- VENDA 23: IPHONE 17 PRO MAX 256GB BRANCO NOVO (02/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('e47f6bc2-539e-4028-9f40-0655ee5a96ad', 'IPHONE 17 PRO MAX 256GB BRANCO', '350552896576341', 8899.0, 8300.0, 1, 'vendido', 'novo', '2026-05-02', '2026-05-02', '2026-05-02', '2026-05-02');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('f3114d9b-3be7-49ae-9ebc-2c3301e9d2ad', 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 8899.0, 8899.0, 0, 0, '2026-05-02');
UPDATE aparelhos SET venda_id = 'f3114d9b-3be7-49ae-9ebc-2c3301e9d2ad' WHERE id = 'e47f6bc2-539e-4028-9f40-0655ee5a96ad';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('9fcbac22-e2c5-4589-aeed-0ab838794064', 'f3114d9b-3be7-49ae-9ebc-2c3301e9d2ad', 'pix', 8899.0, '2026-05-02', '2026-05-02');

-- Troca: IPH 13 PRO MAX 128GB PRETO (R$ 2250.00)
INSERT INTO aparelhos (id, modelo, valor_compra, loja_id, status, estado, observacoes, data_entrada, criado_em, atualizado_em)
VALUES ('ca579049-17b9-4924-b427-8d80ff2ec48f', 'IPH 13 PRO MAX 128GB PRETO', 2250.0, 1, 'disponivel', 'usado', 'Entrada por troca - venda f3114d9b-3be7-49ae-9ebc-2c3301e9d2ad', '2026-05-02', '2026-05-02', '2026-05-02');

-- VENDA 24: IPHONE 11 64GB PRETO SEMINOVO (03/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('21c43a95-807c-46a2-8ec9-5e4202554793', 'IPHONE 11 64GB PRETO', '352923110862460', 800.0, 650.0, 19, 'vendido', 'seminovo', '2026-05-03', '2026-05-03', '2026-05-03', '2026-05-03');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('9e6f6a08-74b4-444d-ac9c-353d93817d74', 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 800.0, 800.0, 0, 0, '2026-05-03');
UPDATE aparelhos SET venda_id = '9e6f6a08-74b4-444d-ac9c-353d93817d74' WHERE id = '21c43a95-807c-46a2-8ec9-5e4202554793';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('ce1b7c4d-8a78-4059-84c4-3ed025cb73c9', '9e6f6a08-74b4-444d-ac9c-353d93817d74', 'pix', 800.0, '2026-05-03', '2026-05-03');

-- VENDA 25: IPHONE 16 PRO 256GB PRETO SEMINOVO (03/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('e82e9900-bafc-4457-aabd-33005182b827', 'IPHONE 16 PRO 256GB PRETO', '355515607895768', 4700.0, 4450.0, 4, 'vendido', 'seminovo', '2026-05-03', '2026-05-03', '2026-05-03', '2026-05-03');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('649173b0-9bb3-4554-bb8e-1974875ca3a7', 4, 'e07d4d35-1381-4d4d-914d-8382a7456fdd', 'concluida', 'normal', 4700.0, 4700.0, 0, 0, '2026-05-03');
UPDATE aparelhos SET venda_id = '649173b0-9bb3-4554-bb8e-1974875ca3a7' WHERE id = 'e82e9900-bafc-4457-aabd-33005182b827';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('aefbe44c-b098-4503-a694-8b3b48da66b9', '649173b0-9bb3-4554-bb8e-1974875ca3a7', 'pix', 4700.0, '2026-05-03', '2026-05-03');

-- VENDA 26: IPHONE 11 PRO 256GB BRANCO SEMINOVO (03/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('886c4277-cfd9-486d-be4a-7b9a3b0c3f8f', 'IPHONE 11 PRO 256GB BRANCO', '352834111876179', 1200.0, 700.0, 4, 'vendido', 'seminovo', '2026-05-03', '2026-05-03', '2026-05-03', '2026-05-03');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('48407402-93f3-4d98-96ab-2bfb4adf8835', 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 1200.0, 1200.0, 0, 0, '2026-05-03');
UPDATE aparelhos SET venda_id = '48407402-93f3-4d98-96ab-2bfb4adf8835' WHERE id = '886c4277-cfd9-486d-be4a-7b9a3b0c3f8f';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('0528259d-3964-4e7c-8422-8abef8afc892', '48407402-93f3-4d98-96ab-2bfb4adf8835', 'pix', 1200.0, '2026-05-03', '2026-05-03');

-- Troca: IPH XR 64GB (R$ 250.00)
INSERT INTO aparelhos (id, modelo, valor_compra, loja_id, status, estado, observacoes, data_entrada, criado_em, atualizado_em)
VALUES ('d0c46ae1-777b-44d0-9ae1-1934929866ed', 'IPH XR 64GB', 250.0, 4, 'disponivel', 'usado', 'Entrada por troca - venda 48407402-93f3-4d98-96ab-2bfb4adf8835', '2026-05-03', '2026-05-03', '2026-05-03');

-- VENDA 27: BOMBOX 4 PRETA NOVO (03/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('75280d6b-702d-4d96-80dd-49293c9c9f54', 'BOMBOX 4 PRETA', 'TL1876-JP0086246', 2350.0, 2350.0, 4, 'vendido', 'novo', '2026-05-03', '2026-05-03', '2026-05-03', '2026-05-03');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('7c6c1e51-d561-47f6-b4cd-fe8b7e9fcbe3', 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 2350.0, 2350.0, 0, 0, '2026-05-03');
UPDATE aparelhos SET venda_id = '7c6c1e51-d561-47f6-b4cd-fe8b7e9fcbe3' WHERE id = '75280d6b-702d-4d96-80dd-49293c9c9f54';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('1b8c7f55-645b-4d21-a26b-8fef6f9738b6', '7c6c1e51-d561-47f6-b4cd-fe8b7e9fcbe3', 'pix', 2350.0, '2026-05-03', '2026-05-03');

-- VENDA 28: IPHONE 14 PRO 256GB SEMINOVO (03/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('3c26111b-4223-4fd3-9d9a-3414a25c7371', 'IPHONE 14 PRO 256GB', '354542503453857', 3200.0, 2950.0, 4, 'vendido', 'seminovo', '2026-05-03', '2026-05-03', '2026-05-03', '2026-05-03');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('20ab8df1-bec8-4fdc-927b-74ea3042299f', 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 3200.0, 3200.0, 0, 0, '2026-05-03');
UPDATE aparelhos SET venda_id = '20ab8df1-bec8-4fdc-927b-74ea3042299f' WHERE id = '3c26111b-4223-4fd3-9d9a-3414a25c7371';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('bc6bb8cc-9863-4f75-b922-42b222c44ed4', '20ab8df1-bec8-4fdc-927b-74ea3042299f', 'cartao_credito', 3200.0, '2026-05-03', '2026-05-03');

-- VENDA 29: IPHONE 15 PRO MAX 256Gb SEMINOVO (03/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('02349e1b-4f5b-43e6-be7a-6cdee6b32dcd', 'IPHONE 15 PRO MAX 256Gb', '351306992348280', 4300.0, 3950.0, 4, 'vendido', 'seminovo', '2026-05-03', '2026-05-03', '2026-05-03', '2026-05-03');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('e999200a-f863-4610-9922-821f971c7dc1', 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 4300.0, 4300.0, 0, 0, '2026-05-03');
UPDATE aparelhos SET venda_id = 'e999200a-f863-4610-9922-821f971c7dc1' WHERE id = '02349e1b-4f5b-43e6-be7a-6cdee6b32dcd';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('2126deb6-692a-4c72-b31f-257a7e3eb157', 'e999200a-f863-4610-9922-821f971c7dc1', 'pix', 4300.0, '2026-05-03', '2026-05-03');

-- VENDA 30: IPAD 11 128GB AMARELO NOVO (03/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('42e92b68-324a-4853-8fb0-2448b83c96b1', 'IPAD 11 128GB AMARELO', 'D26WC4VMQP', 2715.0, 2140.0, 4, 'vendido', 'novo', '2026-05-03', '2026-05-03', '2026-05-03', '2026-05-03');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('0c717966-8741-415b-997f-304b0c248afb', 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 2715.0, 2715.0, 0, 0, '2026-05-03');
UPDATE aparelhos SET venda_id = '0c717966-8741-415b-997f-304b0c248afb' WHERE id = '42e92b68-324a-4853-8fb0-2448b83c96b1';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('08950c55-1af1-4b18-a557-c4dff9060c3a', '0c717966-8741-415b-997f-304b0c248afb', 'dinheiro', 2715.0, '2026-05-03', '2026-05-03');

-- VENDA 31: IPHONE 14 PRO 128GB ROXO SEMINOVO (03/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('30d144c8-f838-4672-adb2-89eca4e65c1e', 'IPHONE 14 PRO 128GB ROXO', '357712761232320', 3000.0, 2700.0, 19, 'vendido', 'seminovo', '2026-05-03', '2026-05-03', '2026-05-03', '2026-05-03');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('fb316b64-538e-48e9-bdb9-ee3eafe4c9db', 19, 'b4269e60-eea2-4eba-a34d-db9591e0ec83', 'concluida', 'normal', 3000.0, 3000.0, 0, 0, '2026-05-03');
UPDATE aparelhos SET venda_id = 'fb316b64-538e-48e9-bdb9-ee3eafe4c9db' WHERE id = '30d144c8-f838-4672-adb2-89eca4e65c1e';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('e9ecb68f-a600-4d54-b541-cbb581f7fe97', 'fb316b64-538e-48e9-bdb9-ee3eafe4c9db', 'cartao_credito', 3000.0, '2026-05-03', '2026-05-03');

-- VENDA 32: IPHONE 17 PRO MAX 512GB AZUL LACRADO (03/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('ffa19454-9097-4af9-94ba-0107e45b441d', 'IPHONE 17 PRO MAX 512GB AZUL', '350552898007873', 9280.0, 9050.0, 1, 'vendido', 'novo', '2026-05-03', '2026-05-03', '2026-05-03', '2026-05-03');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('ecae4ca7-89d8-47fa-a3ee-7f0c7e213541', 1, '9451cd9f-6770-4e32-aae8-c75fa675e818', 'concluida', 'normal', 9280.0, 9280.0, 0, 0, '2026-05-03');
UPDATE aparelhos SET venda_id = 'ecae4ca7-89d8-47fa-a3ee-7f0c7e213541' WHERE id = 'ffa19454-9097-4af9-94ba-0107e45b441d';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('e7fd8c40-1a99-4b8e-8bbd-468dad4d85d6', 'ecae4ca7-89d8-47fa-a3ee-7f0c7e213541', 'pix', 9280.0, '2026-05-03', '2026-05-03');

-- VENDA 33: IPHONE 14 PRO MAX 256GB ROXO SEMINOVO (03/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('93dcca66-f1e1-4f58-9b57-9984108a11d9', 'IPHONE 14 PRO MAX 256GB ROXO', '356684163986301', 3521.0, 3200.0, 20, 'vendido', 'seminovo', '2026-05-03', '2026-05-03', '2026-05-03', '2026-05-03');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('aa6ca6e2-cda2-40ff-bf1b-2f5f7d403274', 20, '25e2da5b-9e76-4388-9890-7e22efd6940d', 'concluida', 'normal', 3521.0, 3521.0, 0, 0, '2026-05-03');
UPDATE aparelhos SET venda_id = 'aa6ca6e2-cda2-40ff-bf1b-2f5f7d403274' WHERE id = '93dcca66-f1e1-4f58-9b57-9984108a11d9';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('8bbf7d8b-0154-461a-9432-189cf69833e6', 'aa6ca6e2-cda2-40ff-bf1b-2f5f7d403274', 'dinheiro', 3521.0, '2026-05-03', '2026-05-03');

-- VENDA 34: IPHONE 14 128GB AZUL SEMINOVO (03/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('a2b84105-822b-4fee-8eb7-a3dff78a3185', 'IPHONE 14 128GB AZUL', '358264144532215', 2200.0, 2050.0, 20, 'vendido', 'seminovo', '2026-05-03', '2026-05-03', '2026-05-03', '2026-05-03');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('87903b67-b4e7-4480-bbdb-3ac4db3bfe4a', 20, '25e2da5b-9e76-4388-9890-7e22efd6940d', 'concluida', 'normal', 2200.0, 2200.0, 0, 0, '2026-05-03');
UPDATE aparelhos SET venda_id = '87903b67-b4e7-4480-bbdb-3ac4db3bfe4a' WHERE id = 'a2b84105-822b-4fee-8eb7-a3dff78a3185';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('231bb2e0-c80b-4634-9258-51114087f3c3', '87903b67-b4e7-4480-bbdb-3ac4db3bfe4a', 'pix', 2200.0, '2026-05-03', '2026-05-03');

-- VENDA 35: IPHONE 14 PRO MAX 256GB ROXO SEMINOVO (03/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('d5dd44da-42e9-424d-bbc4-d5092c99a18e', 'IPHONE 14 PRO MAX 256GB ROXO', '353742532615895', 3550.0, 3200.0, 19, 'vendido', 'seminovo', '2026-05-03', '2026-05-03', '2026-05-03', '2026-05-03');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('6efaf595-eaf1-4234-848a-d98c924fc99d', 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 3550.0, 3550.0, 0, 0, '2026-05-03');
UPDATE aparelhos SET venda_id = '6efaf595-eaf1-4234-848a-d98c924fc99d' WHERE id = 'd5dd44da-42e9-424d-bbc4-d5092c99a18e';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('9025c1dc-2110-4dbd-8f77-80ab963b308d', '6efaf595-eaf1-4234-848a-d98c924fc99d', 'pix', 3550.0, '2026-05-03', '2026-05-03');

-- VENDA 36: SAMSUNG TAB S10 FE 128GB CINZA NOVO (03/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('b949f392-fea5-4ef6-9a1d-46e6a4e2030c', 'SAMSUNG TAB S10 FE 128GB CINZA', 'R5GL343H0BP', 2582.0, 2350.0, 19, 'vendido', 'novo', '2026-05-03', '2026-05-03', '2026-05-03', '2026-05-03');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('9809be19-5cf8-4762-928b-3dbf2c179aa4', 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 2582.0, 2582.0, 0, 0, '2026-05-03');
UPDATE aparelhos SET venda_id = '9809be19-5cf8-4762-928b-3dbf2c179aa4' WHERE id = 'b949f392-fea5-4ef6-9a1d-46e6a4e2030c';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('99794482-7064-4511-b583-850a71854e42', '9809be19-5cf8-4762-928b-3dbf2c179aa4', 'cartao_credito', 2582.0, '2026-05-03', '2026-05-03');

-- VENDA 37: IPHONE 14 128GB LILAS SEMINOVO (03/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('a27eb604-cb13-4fec-9abf-d392a5a7f9d7', 'IPHONE 14 128GB LILAS', '354807376249710', 2190.0, 2050.0, 1, 'vendido', 'seminovo', '2026-05-03', '2026-05-03', '2026-05-03', '2026-05-03');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('90f39d04-d13e-47f4-b385-98c4332894bf', 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 2190.0, 2190.0, 0, 0, '2026-05-03');
UPDATE aparelhos SET venda_id = '90f39d04-d13e-47f4-b385-98c4332894bf' WHERE id = 'a27eb604-cb13-4fec-9abf-d392a5a7f9d7';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('24907c43-5533-40b6-ba0a-ad6c918bab0f', '90f39d04-d13e-47f4-b385-98c4332894bf', 'dinheiro', 2190.0, '2026-05-03', '2026-05-03');

-- VENDA 38: IPHONE 13 PRO MAX 256G BRANCO SEMINOVO (03/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('fe194732-aa44-4704-9d8c-b1c7bfc1bb85', 'IPHONE 13 PRO MAX 256G BRANCO', '351596247157557', 3287.0, 2950.0, 1, 'vendido', 'seminovo', '2026-05-03', '2026-05-03', '2026-05-03', '2026-05-03');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('c2cb4ad4-a1d7-48c6-8f65-3f0d9668fc44', 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 3287.0, 3287.0, 0, 0, '2026-05-03');
UPDATE aparelhos SET venda_id = 'c2cb4ad4-a1d7-48c6-8f65-3f0d9668fc44' WHERE id = 'fe194732-aa44-4704-9d8c-b1c7bfc1bb85';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('aa33d5d2-478f-4f95-88f4-c5b40ebb63b6', 'c2cb4ad4-a1d7-48c6-8f65-3f0d9668fc44', 'pix', 3287.0, '2026-05-03', '2026-05-03');

-- Troca: IPHONE 11 64GB VERDE (R$ 600.00)
INSERT INTO aparelhos (id, modelo, valor_compra, loja_id, status, estado, observacoes, data_entrada, criado_em, atualizado_em)
VALUES ('f9c47e4e-4419-4656-a69f-893d363e302e', 'IPHONE 11 64GB VERDE', 600.0, 1, 'disponivel', 'usado', 'Entrada por troca - venda c2cb4ad4-a1d7-48c6-8f65-3f0d9668fc44', '2026-05-03', '2026-05-03', '2026-05-03');

-- VENDA 39: IPHONE 17 256GB PRETO LACRADO (05/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('75182034-4786-4616-a2ef-70294dbe1e5b', 'IPHONE 17 256GB PRETO', '351807178569383', 5530.0, 4950.0, 1, 'vendido', 'novo', '2026-05-05', '2026-05-05', '2026-05-05', '2026-05-05');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('cea0a27c-8267-4a5c-aa57-69656b80de33', 1, '9451cd9f-6770-4e32-aae8-c75fa675e818', 'concluida', 'normal', 5530.0, 5530.0, 0, 0, '2026-05-05');
UPDATE aparelhos SET venda_id = 'cea0a27c-8267-4a5c-aa57-69656b80de33' WHERE id = '75182034-4786-4616-a2ef-70294dbe1e5b';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('0cd106b4-0d04-4116-95b4-81f0ac5050a3', 'cea0a27c-8267-4a5c-aa57-69656b80de33', 'pix', 5530.0, '2026-05-05', '2026-05-05');

-- VENDA 40: IPHONE 14 256GB PRETO SEMINOVO (05/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('964e8c45-7188-4b5d-8b4d-226ef99c69cf', 'IPHONE 14 256GB PRETO', '353267568818502', 2450.0, 2150.0, 1, 'vendido', 'seminovo', '2026-05-05', '2026-05-05', '2026-05-05', '2026-05-05');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('9ea669c1-3ebb-4f57-a8de-8c7351fd68b4', 1, '9451cd9f-6770-4e32-aae8-c75fa675e818', 'concluida', 'normal', 2450.0, 2450.0, 0, 0, '2026-05-05');
UPDATE aparelhos SET venda_id = '9ea669c1-3ebb-4f57-a8de-8c7351fd68b4' WHERE id = '964e8c45-7188-4b5d-8b4d-226ef99c69cf';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('db9d506d-0eca-4a17-b1c5-70c9b52533d9', '9ea669c1-3ebb-4f57-a8de-8c7351fd68b4', 'pix', 2450.0, '2026-05-05', '2026-05-05');

-- VENDA 41: IPHONE 17 PRO MAX 256GB SILVER NOVO (05/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('85e6cc62-864d-4c25-93d6-cc90464fb81c', 'IPHONE 17 PRO MAX 256GB SILVER', '357247252989922', 8500.0, 8300.0, 19, 'vendido', 'novo', '2026-05-05', '2026-05-05', '2026-05-05', '2026-05-05');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('a3da1a06-1838-40a9-aa0d-f0af8008ff81', 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 8500.0, 8500.0, 0, 0, '2026-05-05');
UPDATE aparelhos SET venda_id = 'a3da1a06-1838-40a9-aa0d-f0af8008ff81' WHERE id = '85e6cc62-864d-4c25-93d6-cc90464fb81c';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('be6643bc-8665-49a9-b8ac-2cbbdcf73a06', 'a3da1a06-1838-40a9-aa0d-f0af8008ff81', 'pix', 8500.0, '2026-05-05', '2026-05-05');

-- Troca: IPHONE 15 PRO MAX 256GB PRETO (R$ 4000.00)
INSERT INTO aparelhos (id, modelo, valor_compra, loja_id, status, estado, observacoes, data_entrada, criado_em, atualizado_em)
VALUES ('18cedeeb-140f-4166-989e-27d57d28cb17', 'IPHONE 15 PRO MAX 256GB PRETO', 4000.0, 19, 'disponivel', 'usado', 'Entrada por troca - venda a3da1a06-1838-40a9-aa0d-f0af8008ff81', '2026-05-05', '2026-05-05', '2026-05-05');

-- VENDA 42: IPHONE 17 PRO MAX 256GB AZUL NOVO (05/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('3632c03b-5f99-4925-9d37-1c1c29578a3f', 'IPHONE 17 PRO MAX 256GB AZUL', '357205981616604', 8300.0, 8100.0, 19, 'vendido', 'novo', '2026-05-05', '2026-05-05', '2026-05-05', '2026-05-05');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('91ace3ae-a9dc-4bd0-ba57-d5d72331283f', 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 8300.0, 8300.0, 0, 0, '2026-05-05');
UPDATE aparelhos SET venda_id = '91ace3ae-a9dc-4bd0-ba57-d5d72331283f' WHERE id = '3632c03b-5f99-4925-9d37-1c1c29578a3f';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('6ded34b8-289f-4b62-b21f-208c9940d81b', '91ace3ae-a9dc-4bd0-ba57-d5d72331283f', 'pix', 8300.0, '2026-05-05', '2026-05-05');

-- VENDA 43: NOTE 15 PRO 5G 256GB AZUL NOVO (05/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('9d85ee69-ce24-4212-bfc1-a2960ea3a59b', 'NOTE 15 PRO 5G 256GB AZUL', '860548074484947', 1950.0, 1690.0, 19, 'vendido', 'novo', '2026-05-05', '2026-05-05', '2026-05-05', '2026-05-05');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('a9ba8280-7ec8-463b-aac8-e78a81b8dc6c', 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 1950.0, 1950.0, 0, 0, '2026-05-05');
UPDATE aparelhos SET venda_id = 'a9ba8280-7ec8-463b-aac8-e78a81b8dc6c' WHERE id = '9d85ee69-ce24-4212-bfc1-a2960ea3a59b';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('35bac2de-9911-4eb6-8d5e-7195bce9ac18', 'a9ba8280-7ec8-463b-aac8-e78a81b8dc6c', 'pix', 1950.0, '2026-05-05', '2026-05-05');

-- VENDA 44: REALME C75 5G PRETO 256GB NOVO (05/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('77fc1284-57df-4069-96b3-28705f791397', 'REALME C75 5G PRETO 256GB', '862813070179174', 1340.0, 1240.0, 19, 'vendido', 'novo', '2026-05-05', '2026-05-05', '2026-05-05', '2026-05-05');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('196f85e0-c49d-4179-9d7c-35b331cd77bd', 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 1340.0, 1340.0, 0, 0, '2026-05-05');
UPDATE aparelhos SET venda_id = '196f85e0-c49d-4179-9d7c-35b331cd77bd' WHERE id = '77fc1284-57df-4069-96b3-28705f791397';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('3fa0c35b-034c-419d-8ca0-f613598a49e1', '196f85e0-c49d-4179-9d7c-35b331cd77bd', 'cartao_credito', 1340.0, '2026-05-05', '2026-05-05');

-- VENDA 45: IPHONE 13 128GB PRETO SEMINOVO (05/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('4804e4f3-61eb-4da5-b48a-1c6319025c22', 'IPHONE 13 128GB PRETO', '351264787086047', 2025.0, 1800.0, 19, 'vendido', 'seminovo', '2026-05-05', '2026-05-05', '2026-05-05', '2026-05-05');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('22de7cd9-88f5-4d0e-8349-2a55e3f7fdf2', 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 2025.0, 2025.0, 0, 0, '2026-05-05');
UPDATE aparelhos SET venda_id = '22de7cd9-88f5-4d0e-8349-2a55e3f7fdf2' WHERE id = '4804e4f3-61eb-4da5-b48a-1c6319025c22';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('1e4a9ccb-564e-4c70-9e01-19f41dead6ff', '22de7cd9-88f5-4d0e-8349-2a55e3f7fdf2', 'cartao_credito', 2025.0, '2026-05-05', '2026-05-05');

-- VENDA 46: IPHONE 13 128GB BRANCO SEMINOVO (05/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('595a6d98-a416-4205-b7ef-614618e7ebf0', 'IPHONE 13 128GB BRANCO', '351520705483289', 2025.0, 1800.0, 19, 'vendido', 'seminovo', '2026-05-05', '2026-05-05', '2026-05-05', '2026-05-05');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('681f1b83-5d64-4d9a-bb03-f9a533f0d688', 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 2025.0, 2025.0, 0, 0, '2026-05-05');
UPDATE aparelhos SET venda_id = '681f1b83-5d64-4d9a-bb03-f9a533f0d688' WHERE id = '595a6d98-a416-4205-b7ef-614618e7ebf0';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('e9888dfb-3620-4786-a01b-4444b55ef47f', '681f1b83-5d64-4d9a-bb03-f9a533f0d688', 'pix', 2025.0, '2026-05-05', '2026-05-05');

-- VENDA 47: IPHONE 14 PLUS 128GB PRETO SEMINOVO (05/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('e36493fa-4555-4559-9114-4d47681bf029', 'IPHONE 14 PLUS 128GB PRETO', '359069332647611', 2593.0, 2300.0, 1, 'vendido', 'seminovo', '2026-05-05', '2026-05-05', '2026-05-05', '2026-05-05');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('38d23284-28ca-4848-9bc2-81b67da4f44d', 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 2593.0, 2593.0, 0, 0, '2026-05-05');
UPDATE aparelhos SET venda_id = '38d23284-28ca-4848-9bc2-81b67da4f44d' WHERE id = 'e36493fa-4555-4559-9114-4d47681bf029';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('6ed88890-b0d5-40ad-a889-10ae6d25d130', '38d23284-28ca-4848-9bc2-81b67da4f44d', 'pix', 2593.0, '2026-05-05', '2026-05-05');

-- VENDA 48: IPHONE 13 PRO 256GB GRAFIT SEMINOVO (05/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('a8002f3a-ccf8-4ce4-922d-4ad18e178ca6', 'IPHONE 13 PRO 256GB GRAFIT', '350367272380303', 2750.0, 2500.0, 1, 'vendido', 'seminovo', '2026-05-05', '2026-05-05', '2026-05-05', '2026-05-05');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('551f8eef-046a-43f6-b3f2-344871da8094', 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 2750.0, 2750.0, 0, 0, '2026-05-05');
UPDATE aparelhos SET venda_id = '551f8eef-046a-43f6-b3f2-344871da8094' WHERE id = 'a8002f3a-ccf8-4ce4-922d-4ad18e178ca6';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('963e39d5-6c32-4f75-b66c-fddb27f2cb71', '551f8eef-046a-43f6-b3f2-344871da8094', 'pix', 2750.0, '2026-05-05', '2026-05-05');

-- VENDA 49: IPHONE 15 128GB ROSA SEMINOVO (05/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('1c706025-07a1-41b1-8b53-7c6702fce971', 'IPHONE 15 128GB ROSA', '357395865324357', 2900.0, 2750.0, 4, 'vendido', 'seminovo', '2026-05-05', '2026-05-05', '2026-05-05', '2026-05-05');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('8f0b9899-5c19-421d-b306-a1c3d2361383', 4, 'e07d4d35-1381-4d4d-914d-8382a7456fdd', 'concluida', 'normal', 2900.0, 2900.0, 0, 0, '2026-05-05');
UPDATE aparelhos SET venda_id = '8f0b9899-5c19-421d-b306-a1c3d2361383' WHERE id = '1c706025-07a1-41b1-8b53-7c6702fce971';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('3bd7016d-1b6d-4319-a391-d4166d1ae90a', '8f0b9899-5c19-421d-b306-a1c3d2361383', 'cartao_debito', 2900.0, '2026-05-05', '2026-05-05');

-- Troca: IPHONE 13 128GB ROSA (R$ 1700.00)
INSERT INTO aparelhos (id, modelo, valor_compra, loja_id, status, estado, observacoes, data_entrada, criado_em, atualizado_em)
VALUES ('55de2a71-ff6b-4ce3-9977-8d3d35a98eb5', 'IPHONE 13 128GB ROSA', 1700.0, 4, 'disponivel', 'usado', 'Entrada por troca - venda 8f0b9899-5c19-421d-b306-a1c3d2361383', '2026-05-05', '2026-05-05', '2026-05-05');

-- VENDA 50: REDMI NOTE 15 5G 256GB PRETO NOVO (05/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('05826b36-3af1-427b-8b61-9b9060990c6a', 'REDMI NOTE 15 5G 256GB PRETO', '865292088798209', 1500.0, 1370.0, 4, 'vendido', 'novo', '2026-05-05', '2026-05-05', '2026-05-05', '2026-05-05');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('e452ce06-3a13-4d6f-badd-3209cbdd6f4e', 4, 'e07d4d35-1381-4d4d-914d-8382a7456fdd', 'concluida', 'normal', 1500.0, 1500.0, 0, 0, '2026-05-05');
UPDATE aparelhos SET venda_id = 'e452ce06-3a13-4d6f-badd-3209cbdd6f4e' WHERE id = '05826b36-3af1-427b-8b61-9b9060990c6a';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('2dd9f9b6-74c1-4632-858a-9a5116b25234', 'e452ce06-3a13-4d6f-badd-3209cbdd6f4e', 'cartao_credito', 1500.0, '2026-05-05', '2026-05-05');

-- VENDA 51: IPHONE 17 PRO 256GB BRANCO SEMINOVO (05/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('0d3d615b-f730-4efc-95bd-1c7a50c706ac', 'IPHONE 17 PRO 256GB BRANCO', NULL, 6880.0, 6350.0, 1, 'vendido', 'seminovo', '2026-05-05', '2026-05-05', '2026-05-05', '2026-05-05');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('ecc5f0fe-297b-46ba-8d7b-4a2ad5a8b784', 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 6880.0, 6880.0, 0, 0, '2026-05-05');
UPDATE aparelhos SET venda_id = 'ecc5f0fe-297b-46ba-8d7b-4a2ad5a8b784' WHERE id = '0d3d615b-f730-4efc-95bd-1c7a50c706ac';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('16d5cb38-984c-45e4-b8f7-321ba5642ccd', 'ecc5f0fe-297b-46ba-8d7b-4a2ad5a8b784', 'pix', 6880.0, '2026-05-05', '2026-05-05');

-- Troca: IPH 14 128GB PRETO (R$ 2000.00)
INSERT INTO aparelhos (id, modelo, valor_compra, loja_id, status, estado, observacoes, data_entrada, criado_em, atualizado_em)
VALUES ('1988ed53-66fb-49c2-bedb-978989ae9b84', 'IPH 14 128GB PRETO', 2000.0, 1, 'disponivel', 'usado', 'Entrada por troca - venda ecc5f0fe-297b-46ba-8d7b-4a2ad5a8b784', '2026-05-05', '2026-05-05', '2026-05-05');

-- VENDA 52: IPAD 11 128GB 128GB SILVER NOVO (06/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('d78b4547-95d4-408b-9e8f-5fb31e768527', 'IPAD 11 128GB 128GB SILVER', 'G79XRVF52R', 2320.0, 2180.0, 4, 'vendido', 'novo', '2026-05-06', '2026-05-06', '2026-05-06', '2026-05-06');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('0438b4a6-bbd4-4db9-9489-79476964e4f6', 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 2320.0, 2320.0, 0, 0, '2026-05-06');
UPDATE aparelhos SET venda_id = '0438b4a6-bbd4-4db9-9489-79476964e4f6' WHERE id = 'd78b4547-95d4-408b-9e8f-5fb31e768527';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('fe3b44b9-26a7-4553-9473-a1bf856fd7da', '0438b4a6-bbd4-4db9-9489-79476964e4f6', 'cartao_credito', 2320.0, '2026-05-06', '2026-05-06');

-- VENDA 53: IPHONE 15 128GB ROSA SEMINOVO (06/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('a86bdecc-8df0-4a68-91ae-38e053ec606b', 'IPHONE 15 128GB ROSA', '356054491176662', 2960.0, 2750.0, 4, 'vendido', 'seminovo', '2026-05-06', '2026-05-06', '2026-05-06', '2026-05-06');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('4084762f-6313-4cc9-bc6b-c6f398dee543', 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 2960.0, 2960.0, 0, 0, '2026-05-06');
UPDATE aparelhos SET venda_id = '4084762f-6313-4cc9-bc6b-c6f398dee543' WHERE id = 'a86bdecc-8df0-4a68-91ae-38e053ec606b';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('f1fd10ab-73ee-4762-b4e2-368d2ab5d321', '4084762f-6313-4cc9-bc6b-c6f398dee543', 'pix', 2960.0, '2026-05-06', '2026-05-06');

-- VENDA 54: IPHONE 14 PRO MAX 256GB PRETO SEMINOVO (06/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('674eeb06-9343-4238-b534-ab8205b7767b', 'IPHONE 14 PRO MAX 256GB PRETO', NULL, 3590.0, 3200.0, 19, 'vendido', 'seminovo', '2026-05-06', '2026-05-06', '2026-05-06', '2026-05-06');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('94ef601d-c2af-4d8c-875a-a09504636053', 19, 'b4269e60-eea2-4eba-a34d-db9591e0ec83', 'concluida', 'normal', 3590.0, 3590.0, 0, 0, '2026-05-06');
UPDATE aparelhos SET venda_id = '94ef601d-c2af-4d8c-875a-a09504636053' WHERE id = '674eeb06-9343-4238-b534-ab8205b7767b';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('206245e4-58f6-46a7-a319-71d94cfce179', '94ef601d-c2af-4d8c-875a-a09504636053', 'pix', 3590.0, '2026-05-06', '2026-05-06');

-- Troca: 13 PRO MAX 512GB (R$ 400.00)
INSERT INTO aparelhos (id, modelo, valor_compra, loja_id, status, estado, observacoes, data_entrada, criado_em, atualizado_em)
VALUES ('dd4bdabb-e727-493f-8652-dcb83f527468', '13 PRO MAX 512GB', 400.0, 19, 'disponivel', 'usado', 'Entrada por troca - venda 94ef601d-c2af-4d8c-875a-a09504636053', '2026-05-06', '2026-05-06', '2026-05-06');

-- VENDA 55: IPHONE 15 PRO MAX 256GB PRETO SEMINOVO (06/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('6a848676-f99e-4eaf-bbc4-7816959b7db9', 'IPHONE 15 PRO MAX 256GB PRETO', '355364280424731', 4150.0, 3950.0, 19, 'vendido', 'seminovo', '2026-05-06', '2026-05-06', '2026-05-06', '2026-05-06');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('37d1f820-d204-4872-9fa7-f8998122b06f', 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 4150.0, 4150.0, 0, 0, '2026-05-06');
UPDATE aparelhos SET venda_id = '37d1f820-d204-4872-9fa7-f8998122b06f' WHERE id = '6a848676-f99e-4eaf-bbc4-7816959b7db9';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('6286183a-b496-448f-beb1-41b506387df8', '37d1f820-d204-4872-9fa7-f8998122b06f', 'pix', 4150.0, '2026-05-06', '2026-05-06');

-- VENDA 56: IPHONE 16 PRO MAX 256GB PRETO SEMINOVO (06/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('055d6a8a-ebb7-4636-b37a-41a2d5abc598', 'IPHONE 16 PRO MAX 256GB PRETO', '358637628310721', 5600.0, 5250.0, 20, 'vendido', 'seminovo', '2026-05-06', '2026-05-06', '2026-05-06', '2026-05-06');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('16149055-fe44-4e86-99d8-70a738a56dc6', 20, '0dd2c938-c6dd-4f5d-aac5-ed045ee5d2fb', 'concluida', 'normal', 5600.0, 5600.0, 0, 0, '2026-05-06');
UPDATE aparelhos SET venda_id = '16149055-fe44-4e86-99d8-70a738a56dc6' WHERE id = '055d6a8a-ebb7-4636-b37a-41a2d5abc598';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('11b899c5-18a4-4837-a6af-a3f9ac58375f', '16149055-fe44-4e86-99d8-70a738a56dc6', 'pix', 5600.0, '2026-05-06', '2026-05-06');

-- Troca: IPH 15 PRO 128GB NATURAL (R$ 3000.00)
INSERT INTO aparelhos (id, modelo, valor_compra, loja_id, status, estado, observacoes, data_entrada, criado_em, atualizado_em)
VALUES ('0997fdfa-fa73-4c01-8174-b67a52f73010', 'IPH 15 PRO 128GB NATURAL', 3000.0, 20, 'disponivel', 'usado', 'Entrada por troca - venda 16149055-fe44-4e86-99d8-70a738a56dc6', '2026-05-06', '2026-05-06', '2026-05-06');

-- VENDA 57: IPHONE 16 PRO MAX 256GB PRETO SEMINOVO (06/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('621dfa33-a984-457f-9b33-38b9335ead6a', 'IPHONE 16 PRO MAX 256GB PRETO', '354276355652528', 5400.0, 5000.0, 20, 'vendido', 'seminovo', '2026-05-06', '2026-05-06', '2026-05-06', '2026-05-06');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('498349f8-d80f-47aa-9ef6-e0122a337768', 20, '0dd2c938-c6dd-4f5d-aac5-ed045ee5d2fb', 'concluida', 'normal', 5400.0, 5400.0, 0, 0, '2026-05-06');
UPDATE aparelhos SET venda_id = '498349f8-d80f-47aa-9ef6-e0122a337768' WHERE id = '621dfa33-a984-457f-9b33-38b9335ead6a';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('5c1f2bc0-e951-4f18-b07d-db806b2cbc6f', '498349f8-d80f-47aa-9ef6-e0122a337768', 'pix', 5400.0, '2026-05-06', '2026-05-06');

-- VENDA 58: IPHONR 17E 256GB PRETO NOVO (06/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('69d34b4d-2372-422c-aab8-b4fa187b7a70', 'IPHONR 17E 256GB PRETO', '351961171443417', 3800.0, 3550.0, 20, 'vendido', 'novo', '2026-05-06', '2026-05-06', '2026-05-06', '2026-05-06');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('5750f0f0-d535-4858-8a89-94de44c857fb', 20, '25e2da5b-9e76-4388-9890-7e22efd6940d', 'concluida', 'normal', 3800.0, 3800.0, 0, 0, '2026-05-06');
UPDATE aparelhos SET venda_id = '5750f0f0-d535-4858-8a89-94de44c857fb' WHERE id = '69d34b4d-2372-422c-aab8-b4fa187b7a70';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('9c799e3c-6a00-46e7-a204-8682258d9f7c', '5750f0f0-d535-4858-8a89-94de44c857fb', 'pix', 3800.0, '2026-05-06', '2026-05-06');

-- VENDA 59: IPHONE 17 PRO MAX 256GB AZUL NOVO (06/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('80379717-77ba-4eaa-a88e-1901e47cff2b', 'IPHONE 17 PRO MAX 256GB AZUL', '358434702268268', 8400.0, 8150.0, 20, 'vendido', 'novo', '2026-05-06', '2026-05-06', '2026-05-06', '2026-05-06');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('f50fcc74-30da-4d4d-8641-239bea9e4978', 20, '25e2da5b-9e76-4388-9890-7e22efd6940d', 'concluida', 'normal', 8400.0, 8400.0, 0, 0, '2026-05-06');
UPDATE aparelhos SET venda_id = 'f50fcc74-30da-4d4d-8641-239bea9e4978' WHERE id = '80379717-77ba-4eaa-a88e-1901e47cff2b';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('dd50f682-7e6a-4141-8965-7ad623f89b37', 'f50fcc74-30da-4d4d-8641-239bea9e4978', 'pix', 8400.0, '2026-05-06', '2026-05-06');

-- VENDA 60: IPHONE 17 PRO MAX 256GB AZUL NOVO (06/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('a638166b-5308-4731-b914-2a63f90247eb', 'IPHONE 17 PRO MAX 256GB AZUL', '358434708144554', 8400.0, 8100.0, 20, 'vendido', 'novo', '2026-05-06', '2026-05-06', '2026-05-06', '2026-05-06');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('fd105785-af92-4435-9c74-e2139d602a8e', 20, 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 'concluida', 'normal', 8400.0, 8400.0, 0, 0, '2026-05-06');
UPDATE aparelhos SET venda_id = 'fd105785-af92-4435-9c74-e2139d602a8e' WHERE id = 'a638166b-5308-4731-b914-2a63f90247eb';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('d89ca908-8999-4663-bc0c-1f74a6fb513e', 'fd105785-af92-4435-9c74-e2139d602a8e', 'dinheiro', 8400.0, '2026-05-06', '2026-05-06');

-- Troca: IPH 15 PRO MAX 256GB AZUL (R$ 3950.00)
INSERT INTO aparelhos (id, modelo, valor_compra, loja_id, status, estado, observacoes, data_entrada, criado_em, atualizado_em)
VALUES ('f32452ec-56b7-4a0e-9dae-a5da8308ec25', 'IPH 15 PRO MAX 256GB AZUL', 3950.0, 20, 'disponivel', 'usado', 'Entrada por troca - venda fd105785-af92-4435-9c74-e2139d602a8e', '2026-05-06', '2026-05-06', '2026-05-06');

-- VENDA 61: IPHONE 15 128GB PRETO SEMINOVO (06/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('c28f8f2e-d837-408a-a01e-7ba0fe78c0a5', 'IPHONE 15 128GB PRETO', '359757420449029', 3000.0, 2750.0, 20, 'vendido', 'seminovo', '2026-05-06', '2026-05-06', '2026-05-06', '2026-05-06');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('8ca20c74-033e-468d-b190-e9bdcead08d9', 20, 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 'concluida', 'normal', 3000.0, 3000.0, 0, 0, '2026-05-06');
UPDATE aparelhos SET venda_id = '8ca20c74-033e-468d-b190-e9bdcead08d9' WHERE id = 'c28f8f2e-d837-408a-a01e-7ba0fe78c0a5';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('fe636575-c3fc-41b6-a6d5-1632ec5b607f', '8ca20c74-033e-468d-b190-e9bdcead08d9', 'pix', 3000.0, '2026-05-06', '2026-05-06');

-- Troca: IPH 12 128GB PRETO (R$ 1000.00)
INSERT INTO aparelhos (id, modelo, valor_compra, loja_id, status, estado, observacoes, data_entrada, criado_em, atualizado_em)
VALUES ('78d48826-3ae8-49bb-9a47-55dba24d0724', 'IPH 12 128GB PRETO', 1000.0, 20, 'disponivel', 'usado', 'Entrada por troca - venda 8ca20c74-033e-468d-b190-e9bdcead08d9', '2026-05-06', '2026-05-06', '2026-05-06');

-- VENDA 62: IPHONE 17 PRO MAX 256GB AZUL NOVO (07/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('50283b9d-52d9-4c69-9a09-8cc2ad81261d', 'IPHONE 17 PRO MAX 256GB AZUL', '351771405550451', 8390.0, 8150.0, 19, 'vendido', 'novo', '2026-05-07', '2026-05-07', '2026-05-07', '2026-05-07');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('04bb9005-4292-4ff9-9bde-945b6b265911', 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 8390.0, 8390.0, 0, 0, '2026-05-07');
UPDATE aparelhos SET venda_id = '04bb9005-4292-4ff9-9bde-945b6b265911' WHERE id = '50283b9d-52d9-4c69-9a09-8cc2ad81261d';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('fe324196-793f-42ac-90f4-a4e79f5c247c', '04bb9005-4292-4ff9-9bde-945b6b265911', 'pix', 8390.0, '2026-05-07', '2026-05-07');

-- IGNORADO (valor nao monetario): IPHONE 15 128GB ROSA SEMINOVO

-- VENDA 64: IPHONE 13 PRO MAX 128GB DOURADO SEMINOVO (07/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('f1ab2658-6fd5-4875-ae5f-878fa57d2d30', 'IPHONE 13 PRO MAX 128GB DOURADO', '354347187764201', 2890.0, 2650.0, 4, 'vendido', 'seminovo', '2026-05-07', '2026-05-07', '2026-05-07', '2026-05-07');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('01e27e2f-d44f-4761-ab09-80b93d44d0a2', 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 2890.0, 2890.0, 0, 0, '2026-05-07');
UPDATE aparelhos SET venda_id = '01e27e2f-d44f-4761-ab09-80b93d44d0a2' WHERE id = 'f1ab2658-6fd5-4875-ae5f-878fa57d2d30';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('7ce12d02-5ff7-406e-ada9-68f39cdcfb50', '01e27e2f-d44f-4761-ab09-80b93d44d0a2', 'pix', 2890.0, '2026-05-07', '2026-05-07');

-- VENDA 65: REDMI NOTE 15 5G 256GB ROXO NOVO (07/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('742ad227-aea5-4a7b-8f95-13a79d8a7809', 'REDMI NOTE 15 5G 256GB ROXO', '86195070529825', 1420.0, 1360.0, 19, 'vendido', 'novo', '2026-05-07', '2026-05-07', '2026-05-07', '2026-05-07');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('79f7c38d-9ef2-48b0-a56e-e987da87c9b4', 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 1420.0, 1420.0, 0, 0, '2026-05-07');
UPDATE aparelhos SET venda_id = '79f7c38d-9ef2-48b0-a56e-e987da87c9b4' WHERE id = '742ad227-aea5-4a7b-8f95-13a79d8a7809';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('6eac9a56-35dc-449e-a6f3-34cd5ec3d920', '79f7c38d-9ef2-48b0-a56e-e987da87c9b4', 'pix', 1420.0, '2026-05-07', '2026-05-07');

-- VENDA 66: POCO F7 512GB PRATA NOVO (07/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('8c170707-0809-4fbd-b7a2-dc461e1f2d88', 'POCO F7 512GB PRATA', '862136074435040', 341.0, 2800.0, 4, 'vendido', 'novo', '2026-05-07', '2026-05-07', '2026-05-07', '2026-05-07');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('4f00b649-97b7-44d8-b3f1-1da8ccfe5276', 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 341.0, 341.0, 0, 0, '2026-05-07');
UPDATE aparelhos SET venda_id = '4f00b649-97b7-44d8-b3f1-1da8ccfe5276' WHERE id = '8c170707-0809-4fbd-b7a2-dc461e1f2d88';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('d708f2e5-35b0-47d0-9bea-aa181e3c3e00', '4f00b649-97b7-44d8-b3f1-1da8ccfe5276', 'cartao_credito', 341.0, '2026-05-07', '2026-05-07');

-- VENDA 67: IPHONE 17 PRO MAX 256GB BRANCO NOVO (07/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('b3b1c831-95af-4bd7-a9de-b2734baa91d9', 'IPHONE 17 PRO MAX 256GB BRANCO', '357247253990986', 8780.0, 8300.0, 1, 'vendido', 'novo', '2026-05-07', '2026-05-07', '2026-05-07', '2026-05-07');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('ff70a6da-63ba-4c06-b2fa-ab67d1578cd1', 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 8780.0, 8780.0, 0, 0, '2026-05-07');
UPDATE aparelhos SET venda_id = 'ff70a6da-63ba-4c06-b2fa-ab67d1578cd1' WHERE id = 'b3b1c831-95af-4bd7-a9de-b2734baa91d9';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('114633fe-6b44-42d2-b93e-3c16b7a0276e', 'ff70a6da-63ba-4c06-b2fa-ab67d1578cd1', 'pix', 8780.0, '2026-05-07', '2026-05-07');

-- Troca: IPH 14 PRO MAX ROXO 256GB (R$ 3000.00)
INSERT INTO aparelhos (id, modelo, valor_compra, loja_id, status, estado, observacoes, data_entrada, criado_em, atualizado_em)
VALUES ('44bdfaa7-66b9-4e33-beff-947089e44378', 'IPH 14 PRO MAX ROXO 256GB', 3000.0, 1, 'disponivel', 'usado', 'Entrada por troca - venda ff70a6da-63ba-4c06-b2fa-ab67d1578cd1', '2026-05-07', '2026-05-07', '2026-05-07');

-- Troca: IPH 15 PRO 256GB NATURAL (R$ 3180.00)
INSERT INTO aparelhos (id, modelo, valor_compra, loja_id, status, estado, observacoes, data_entrada, criado_em, atualizado_em)
VALUES ('da258913-f79c-47cb-a00e-4d90271ccb6f', 'IPH 15 PRO 256GB NATURAL', 3180.0, 1, 'disponivel', 'usado', 'Entrada por troca - venda ff70a6da-63ba-4c06-b2fa-ab67d1578cd1', '2026-05-07', '2026-05-07', '2026-05-07');

-- VENDA 68: IPHONE 13 PRO MAX 128GB AZUL SEMINOVO (07/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('9043de6f-eb8d-4e3b-a61d-763d94b1f274', 'IPHONE 13 PRO MAX 128GB AZUL', '35717750667908', 3230.0, 2650.0, 1, 'vendido', 'seminovo', '2026-05-07', '2026-05-07', '2026-05-07', '2026-05-07');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('12797772-97eb-4092-90c2-f0cc573b44e1', 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 3230.0, 3230.0, 0, 0, '2026-05-07');
UPDATE aparelhos SET venda_id = '12797772-97eb-4092-90c2-f0cc573b44e1' WHERE id = '9043de6f-eb8d-4e3b-a61d-763d94b1f274';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('359877fd-6801-4107-81f9-f3017170f978', '12797772-97eb-4092-90c2-f0cc573b44e1', 'pix', 3230.0, '2026-05-07', '2026-05-07');

-- Troca: IPH 12 PRO MAX AZUL (R$ 1900.00)
INSERT INTO aparelhos (id, modelo, valor_compra, loja_id, status, estado, observacoes, data_entrada, criado_em, atualizado_em)
VALUES ('cd09da33-ef5c-4596-92a4-49a2ed73c4cc', 'IPH 12 PRO MAX AZUL', 1900.0, 1, 'disponivel', 'usado', 'Entrada por troca - venda 12797772-97eb-4092-90c2-f0cc573b44e1', '2026-05-07', '2026-05-07', '2026-05-07');

-- VENDA 69: IPHONE 17 PRO MAX 512GB AZUL NOVO (07/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('350620e6-3b98-457d-b9fb-e2e20a9f4eff', 'IPHONE 17 PRO MAX 512GB AZUL', '351668144729893', 9950.0, 8850.0, 1, 'vendido', 'novo', '2026-05-07', '2026-05-07', '2026-05-07', '2026-05-07');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('d8c05099-b0f2-48c7-a42a-39747aef244d', 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 9950.0, 9950.0, 0, 0, '2026-05-07');
UPDATE aparelhos SET venda_id = 'd8c05099-b0f2-48c7-a42a-39747aef244d' WHERE id = '350620e6-3b98-457d-b9fb-e2e20a9f4eff';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('10043d0d-b02f-4c2c-8b57-bb207d036448', 'd8c05099-b0f2-48c7-a42a-39747aef244d', 'pix', 9950.0, '2026-05-07', '2026-05-07');

-- Troca: IPH 16 PRO MAX 256GB DESERT (R$ 4700.00)
INSERT INTO aparelhos (id, modelo, valor_compra, loja_id, status, estado, observacoes, data_entrada, criado_em, atualizado_em)
VALUES ('7267da8b-6bec-41a9-bff5-85cb608be599', 'IPH 16 PRO MAX 256GB DESERT', 4700.0, 1, 'disponivel', 'usado', 'Entrada por troca - venda d8c05099-b0f2-48c7-a42a-39747aef244d', '2026-05-07', '2026-05-07', '2026-05-07');

-- VENDA 70: IPHONE 17 PRO 256GB SILVER NOVO (07/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('ee0cc21f-e349-4f87-9f3e-a5491e3c6ad5', 'IPHONE 17 PRO 256GB SILVER', '354289639953000', 7850.0, 7580.0, 1, 'vendido', 'novo', '2026-05-07', '2026-05-07', '2026-05-07', '2026-05-07');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('2a1f3ac3-093c-4b71-9f41-f9adbc1d2439', 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 7850.0, 7850.0, 0, 0, '2026-05-07');
UPDATE aparelhos SET venda_id = '2a1f3ac3-093c-4b71-9f41-f9adbc1d2439' WHERE id = 'ee0cc21f-e349-4f87-9f3e-a5491e3c6ad5';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('0bf7d977-22b4-4067-a550-c40debe2ecfc', '2a1f3ac3-093c-4b71-9f41-f9adbc1d2439', 'pix', 7850.0, '2026-05-07', '2026-05-07');

-- Troca: IPH 15 PRO (R$ 2600.00)
INSERT INTO aparelhos (id, modelo, valor_compra, loja_id, status, estado, observacoes, data_entrada, criado_em, atualizado_em)
VALUES ('c32cf5ee-d3a1-48b2-8958-4a76febeda16', 'IPH 15 PRO', 2600.0, 1, 'disponivel', 'usado', 'Entrada por troca - venda 2a1f3ac3-093c-4b71-9f41-f9adbc1d2439', '2026-05-07', '2026-05-07', '2026-05-07');

-- VENDA 71: IPHONE 14 128GB LILAS SEMINOVO (08/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('ec241d47-dd90-4f7c-a972-846b982cce8e', 'IPHONE 14 128GB LILAS', '350577192598574', 2400.0, 2050.0, 19, 'vendido', 'seminovo', '2026-05-08', '2026-05-08', '2026-05-08', '2026-05-08');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('72fa58ba-5a99-4929-b01d-ff95d3fa53ea', 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 2400.0, 2400.0, 0, 0, '2026-05-08');
UPDATE aparelhos SET venda_id = '72fa58ba-5a99-4929-b01d-ff95d3fa53ea' WHERE id = 'ec241d47-dd90-4f7c-a972-846b982cce8e';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('1b0353dd-5f53-4b5e-ad4d-c49afdfc3513', '72fa58ba-5a99-4929-b01d-ff95d3fa53ea', 'pix', 2400.0, '2026-05-08', '2026-05-08');

-- Troca: IPHONE 12 128GB AZUL (R$ 1300.00)
INSERT INTO aparelhos (id, modelo, valor_compra, loja_id, status, estado, observacoes, data_entrada, criado_em, atualizado_em)
VALUES ('0628953b-5670-4f0e-814f-3769131fb993', 'IPHONE 12 128GB AZUL', 1300.0, 19, 'disponivel', 'usado', 'Entrada por troca - venda 72fa58ba-5a99-4929-b01d-ff95d3fa53ea', '2026-05-08', '2026-05-08', '2026-05-08');

-- VENDA 72: IPHONE 17 PRO MAX 256GB PRATA NOVO (08/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('591fbe1f-24a1-464c-9d7d-70be30e76731', 'IPHONE 17 PRO MAX 256GB PRATA', '351771409088771', 8480.0, 8300.0, 4, 'vendido', 'novo', '2026-05-08', '2026-05-08', '2026-05-08', '2026-05-08');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('f0b18772-19f5-46fb-ad45-6873057fd83c', 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 8480.0, 8480.0, 0, 0, '2026-05-08');
UPDATE aparelhos SET venda_id = 'f0b18772-19f5-46fb-ad45-6873057fd83c' WHERE id = '591fbe1f-24a1-464c-9d7d-70be30e76731';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('4a71926f-2ac2-4228-a58e-f9b7bbf694de', 'f0b18772-19f5-46fb-ad45-6873057fd83c', 'dinheiro', 8480.0, '2026-05-08', '2026-05-08');

-- Troca: 14 PRO MAX (R$ 128.00)
INSERT INTO aparelhos (id, modelo, valor_compra, loja_id, status, estado, observacoes, data_entrada, criado_em, atualizado_em)
VALUES ('5334d1a4-9a53-449c-a8e9-6127d4a0ccf1', '14 PRO MAX', 128.0, 4, 'disponivel', 'usado', 'Entrada por troca - venda f0b18772-19f5-46fb-ad45-6873057fd83c', '2026-05-08', '2026-05-08', '2026-05-08');

-- VENDA 73: IPHONE 13 128GB PRETO SEMINOVO (08/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('da86f76f-4719-4c7a-b4cd-3a8ea6e428f7', 'IPHONE 13 128GB PRETO', '350038441784457', 1924.0, 1800.0, 4, 'vendido', 'seminovo', '2026-05-08', '2026-05-08', '2026-05-08', '2026-05-08');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('2d0dceb6-069b-4485-83ec-fbaa43a1f9aa', 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 1924.0, 1924.0, 0, 0, '2026-05-08');
UPDATE aparelhos SET venda_id = '2d0dceb6-069b-4485-83ec-fbaa43a1f9aa' WHERE id = 'da86f76f-4719-4c7a-b4cd-3a8ea6e428f7';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('991d58ff-31a2-4181-9da1-5c3761d6bfa5', '2d0dceb6-069b-4485-83ec-fbaa43a1f9aa', 'cartao_credito', 1924.0, '2026-05-08', '2026-05-08');

-- VENDA 74: IPHONE 13 PRO MAX 128GB PRETO SEMINOVO (08/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('afc0f413-2498-4eba-b3ce-de17af816348', 'IPHONE 13 PRO MAX 128GB PRETO', '352114954343441', 2850.0, 2650.0, 4, 'vendido', 'seminovo', '2026-05-08', '2026-05-08', '2026-05-08', '2026-05-08');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('69643500-6fd0-4457-ace2-78f650b902d4', 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 2850.0, 2850.0, 0, 0, '2026-05-08');
UPDATE aparelhos SET venda_id = '69643500-6fd0-4457-ace2-78f650b902d4' WHERE id = 'afc0f413-2498-4eba-b3ce-de17af816348';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('12277e40-346f-4c14-8686-0c86de7307c0', '69643500-6fd0-4457-ace2-78f650b902d4', 'pix', 2850.0, '2026-05-08', '2026-05-08');

-- VENDA 75: AIRPODS PRO 3 NOVO (08/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('b67aa6a1-9bdf-40d1-ac03-e9073966bd20', 'AIRPODS PRO 3', 'H2P49XQY13', 1700.0, 1500.0, 19, 'vendido', 'novo', '2026-05-08', '2026-05-08', '2026-05-08', '2026-05-08');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('2cbc24a3-576c-442b-b04e-3082bcb5b7ad', 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 1700.0, 1700.0, 0, 0, '2026-05-08');
UPDATE aparelhos SET venda_id = '2cbc24a3-576c-442b-b04e-3082bcb5b7ad' WHERE id = 'b67aa6a1-9bdf-40d1-ac03-e9073966bd20';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('cc7a5120-0137-4370-9e5a-daa055ff72ca', '2cbc24a3-576c-442b-b04e-3082bcb5b7ad', 'cartao_credito', 1700.0, '2026-05-08', '2026-05-08');

-- VENDA 76: IPHONE 14 PRO MAX BRANCO SEMINOVO (08/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('83057088-8dc2-42b6-8d60-77fc58416ac8', 'IPHONE 14 PRO MAX BRANCO', '350636590567381', 3250.0, 3150.0, 19, 'vendido', 'seminovo', '2026-05-08', '2026-05-08', '2026-05-08', '2026-05-08');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('d536d470-27be-454a-9f9e-a6e9a2ed50c9', 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 3250.0, 3250.0, 0, 0, '2026-05-08');
UPDATE aparelhos SET venda_id = 'd536d470-27be-454a-9f9e-a6e9a2ed50c9' WHERE id = '83057088-8dc2-42b6-8d60-77fc58416ac8';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('fa40e64a-b8eb-4a01-87c1-e41fd965c7d3', 'd536d470-27be-454a-9f9e-a6e9a2ed50c9', 'pix', 3250.0, '2026-05-08', '2026-05-08');

-- VENDA 77: POCO PAD M1 CINZA NOVO (08/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('3f8d4d19-00b4-400d-8e14-2732b186eee7', 'POCO PAD M1 CINZA', '7111Y5YJ02338', 1750.0, 1600.0, 20, 'vendido', 'novo', '2026-05-08', '2026-05-08', '2026-05-08', '2026-05-08');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('a42a3967-5246-45d5-a90c-a38874dd5854', 20, '25e2da5b-9e76-4388-9890-7e22efd6940d', 'concluida', 'normal', 1750.0, 1750.0, 0, 0, '2026-05-08');
UPDATE aparelhos SET venda_id = 'a42a3967-5246-45d5-a90c-a38874dd5854' WHERE id = '3f8d4d19-00b4-400d-8e14-2732b186eee7';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('b5b7600f-8ef2-453c-b5aa-bea386c6d396', 'a42a3967-5246-45d5-a90c-a38874dd5854', 'pix', 1750.0, '2026-05-08', '2026-05-08');

-- VENDA 78: IPHONE 14 PRO MAX ROXO SEMINOVO (08/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('46d23c67-3127-4d34-9b70-72b3a386456a', 'IPHONE 14 PRO MAX ROXO', '357650612874918', 3425.0, 3150.0, 20, 'vendido', 'seminovo', '2026-05-08', '2026-05-08', '2026-05-08', '2026-05-08');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('65d064ea-6614-4f24-86e0-d2d534d5e37f', 20, '25e2da5b-9e76-4388-9890-7e22efd6940d', 'concluida', 'normal', 3425.0, 3425.0, 0, 0, '2026-05-08');
UPDATE aparelhos SET venda_id = '65d064ea-6614-4f24-86e0-d2d534d5e37f' WHERE id = '46d23c67-3127-4d34-9b70-72b3a386456a';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('e26d35d1-e43a-4882-bc0c-114b12baa27d', '65d064ea-6614-4f24-86e0-d2d534d5e37f', 'pix', 3425.0, '2026-05-08', '2026-05-08');

-- VENDA 79: IPHONE 17 PRO MAX 512GB SILVER NOVO (08/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('c782322d-3e85-4e33-b92f-e822ee7b1395', 'IPHONE 17 PRO MAX 512GB SILVER', '357329447631468', 9900.0, 9500.0, 20, 'vendido', 'novo', '2026-05-08', '2026-05-08', '2026-05-08', '2026-05-08');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('9089a9d8-77c7-4f9f-b5c8-e091adb2694f', 20, '0dd2c938-c6dd-4f5d-aac5-ed045ee5d2fb', 'concluida', 'normal', 9900.0, 9900.0, 0, 0, '2026-05-08');
UPDATE aparelhos SET venda_id = '9089a9d8-77c7-4f9f-b5c8-e091adb2694f' WHERE id = 'c782322d-3e85-4e33-b92f-e822ee7b1395';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('62484e50-ebf5-470f-b167-e583b002a189', '9089a9d8-77c7-4f9f-b5c8-e091adb2694f', 'pix', 9900.0, '2026-05-08', '2026-05-08');

-- Troca: 16 PRO DE 256 GB NA COR DESERT (R$ 4500.00)
INSERT INTO aparelhos (id, modelo, valor_compra, loja_id, status, estado, observacoes, data_entrada, criado_em, atualizado_em)
VALUES ('ae4d31ad-acf3-4172-b97b-e64a40be3581', '16 PRO DE 256 GB NA COR DESERT', 4500.0, 20, 'disponivel', 'usado', 'Entrada por troca - venda 9089a9d8-77c7-4f9f-b5c8-e091adb2694f', '2026-05-08', '2026-05-08', '2026-05-08');

-- VENDA 80: IPHONE XR 64GB PRETO SEMINOVO (08/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('9e5308b7-a89c-4fd3-95e2-3b3575254e3e', 'IPHONE XR 64GB PRETO', '35308210166173', 750.0, 500.0, 20, 'vendido', 'seminovo', '2026-05-08', '2026-05-08', '2026-05-08', '2026-05-08');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('9d121f23-d479-4255-85a3-77fff6ec94b0', 20, '0dd2c938-c6dd-4f5d-aac5-ed045ee5d2fb', 'concluida', 'normal', 750.0, 750.0, 0, 0, '2026-05-08');
UPDATE aparelhos SET venda_id = '9d121f23-d479-4255-85a3-77fff6ec94b0' WHERE id = '9e5308b7-a89c-4fd3-95e2-3b3575254e3e';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('d0fc3462-3ebf-4ab3-b8bf-d316b6b7a61e', '9d121f23-d479-4255-85a3-77fff6ec94b0', 'pix', 750.0, '2026-05-08', '2026-05-08');

-- VENDA 81: GALAXY TAB S10 FE NOVO (09/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('c32bbe6d-4b8a-467c-a75b-d98750fa5447', 'GALAXY TAB S10 FE', 'R5GL34HOBP', 2680.0, 2350.0, 4, 'vendido', 'novo', '2026-05-09', '2026-05-09', '2026-05-09', '2026-05-09');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('2764c427-0103-42c6-ba30-d7dfa740447a', 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 2680.0, 2680.0, 0, 0, '2026-05-09');
UPDATE aparelhos SET venda_id = '2764c427-0103-42c6-ba30-d7dfa740447a' WHERE id = 'c32bbe6d-4b8a-467c-a75b-d98750fa5447';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('3dd8d4d4-a9c7-41f6-ae6b-445488c9efe8', '2764c427-0103-42c6-ba30-d7dfa740447a', 'cartao_credito', 2680.0, '2026-05-09', '2026-05-09');

-- VENDA 82: IPHONE 12 128GB AZUL SEMINOVO (09/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('4d94d928-36d8-4a6c-9a1c-a24e1aa9ab3d', 'IPHONE 12 128GB AZUL', '353361731078373', 1600.0, 1300.0, 4, 'vendido', 'seminovo', '2026-05-09', '2026-05-09', '2026-05-09', '2026-05-09');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('35e8c8fa-1628-4406-81c5-4ba57f3982bd', 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 1600.0, 1600.0, 0, 0, '2026-05-09');
UPDATE aparelhos SET venda_id = '35e8c8fa-1628-4406-81c5-4ba57f3982bd' WHERE id = '4d94d928-36d8-4a6c-9a1c-a24e1aa9ab3d';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('18fa17d9-7edf-4bc2-b4b7-5c41d1652b86', '35e8c8fa-1628-4406-81c5-4ba57f3982bd', 'cartao_credito', 1600.0, '2026-05-09', '2026-05-09');

-- VENDA 83: IPHONE 13 PRO MAX 128GB DOURADO SEMINOVO (09/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('334d4a59-fe62-41f6-8d35-6e139803301b', 'IPHONE 13 PRO MAX 128GB DOURADO', '353869220959541', 2940.0, 2650.0, 4, 'vendido', 'seminovo', '2026-05-09', '2026-05-09', '2026-05-09', '2026-05-09');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('c98ccef3-dda1-4be5-833d-899c2373e1ef', 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 2940.0, 2940.0, 0, 0, '2026-05-09');
UPDATE aparelhos SET venda_id = 'c98ccef3-dda1-4be5-833d-899c2373e1ef' WHERE id = '334d4a59-fe62-41f6-8d35-6e139803301b';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('de92ecb4-eae2-40c8-bd95-8ce1d14aa220', 'c98ccef3-dda1-4be5-833d-899c2373e1ef', 'cartao_credito', 2940.0, '2026-05-09', '2026-05-09');

-- VENDA 84: IPHONE 13 PRO MAX 128GB DOURADO SEMINOVO (09/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('12519a2a-4925-49c5-8535-10344777dc9b', 'IPHONE 13 PRO MAX 128GB DOURADO', '353967811367765', 2900.0, 2650.0, 20, 'vendido', 'seminovo', '2026-05-09', '2026-05-09', '2026-05-09', '2026-05-09');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('5072849f-2b8a-4bcf-b215-c802156f11dd', 20, 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 'concluida', 'normal', 2900.0, 2900.0, 0, 0, '2026-05-09');
UPDATE aparelhos SET venda_id = '5072849f-2b8a-4bcf-b215-c802156f11dd' WHERE id = '12519a2a-4925-49c5-8535-10344777dc9b';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('123390ef-c07c-4dbb-b7fa-38ef9f37d898', '5072849f-2b8a-4bcf-b215-c802156f11dd', 'pix', 2900.0, '2026-05-09', '2026-05-09');

-- Troca: IPH 12 64GB (R$ 1100.00)
INSERT INTO aparelhos (id, modelo, valor_compra, loja_id, status, estado, observacoes, data_entrada, criado_em, atualizado_em)
VALUES ('a934e4e3-ab3e-4654-b797-ff9a3c8e4b63', 'IPH 12 64GB', 1100.0, 20, 'disponivel', 'usado', 'Entrada por troca - venda 5072849f-2b8a-4bcf-b215-c802156f11dd', '2026-05-09', '2026-05-09', '2026-05-09');

-- VENDA 85: IPHONE 17 PRO BRANCO NOVO (09/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('b6e23f31-7255-4fc1-9285-0e2bc5022824', 'IPHONE 17 PRO BRANCO', '354289633906715', 7600.0, 7500.0, 19, 'vendido', 'novo', '2026-05-09', '2026-05-09', '2026-05-09', '2026-05-09');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('b859d68c-5c07-4f8a-bea7-d5193142c161', 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 7600.0, 7600.0, 0, 0, '2026-05-09');
UPDATE aparelhos SET venda_id = 'b859d68c-5c07-4f8a-bea7-d5193142c161' WHERE id = 'b6e23f31-7255-4fc1-9285-0e2bc5022824';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('2bbc2d4a-4687-44a4-9344-710d84d330cf', 'b859d68c-5c07-4f8a-bea7-d5193142c161', 'pix', 7600.0, '2026-05-09', '2026-05-09');

-- VENDA 86: IPHONE 17E PRETO NOVO (09/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('a1e5ffbe-5233-48f3-b827-af57c2e8cb0c', 'IPHONE 17E PRETO', '351101750253834', 4150.0, 3700.0, 19, 'vendido', 'novo', '2026-05-09', '2026-05-09', '2026-05-09', '2026-05-09');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('12373f88-9182-4094-8ffc-689afab832c3', 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 4150.0, 4150.0, 0, 0, '2026-05-09');
UPDATE aparelhos SET venda_id = '12373f88-9182-4094-8ffc-689afab832c3' WHERE id = 'a1e5ffbe-5233-48f3-b827-af57c2e8cb0c';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('06b3ac5e-dac9-4ec8-b612-e3b4b15e7e60', '12373f88-9182-4094-8ffc-689afab832c3', 'pix', 4150.0, '2026-05-09', '2026-05-09');

-- VENDA 87: IPHONE 16 PRO 256GB DOURADO SEMINOVO (09/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('1df7cbd0-fe3a-4ff9-a69a-03f556608524', 'IPHONE 16 PRO 256GB DOURADO', '358876629642191', 5000.0, 4500.0, 1, 'vendido', 'seminovo', '2026-05-09', '2026-05-09', '2026-05-09', '2026-05-09');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('6a26cc03-1a30-4aa2-9a4d-2edfae5165bb', 1, '9451cd9f-6770-4e32-aae8-c75fa675e818', 'concluida', 'normal', 5000.0, 5000.0, 0, 0, '2026-05-09');
UPDATE aparelhos SET venda_id = '6a26cc03-1a30-4aa2-9a4d-2edfae5165bb' WHERE id = '1df7cbd0-fe3a-4ff9-a69a-03f556608524';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('9b3090ec-7d23-4fc5-8e74-be6322b132db', '6a26cc03-1a30-4aa2-9a4d-2edfae5165bb', 'pix', 5000.0, '2026-05-09', '2026-05-09');

-- VENDA 88: IPHONE 14 PRO MAX 128GB PRETO SEMINOVO (09/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('f40fd271-2a60-4c88-bed6-b4904ef85d41', 'IPHONE 14 PRO MAX 128GB PRETO', '356703857557028', 3650.0, 3150.0, 1, 'vendido', 'seminovo', '2026-05-09', '2026-05-09', '2026-05-09', '2026-05-09');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('402b5de5-1c92-412b-86f0-7bdf4255296e', 1, '9451cd9f-6770-4e32-aae8-c75fa675e818', 'concluida', 'normal', 3650.0, 3650.0, 0, 0, '2026-05-09');
UPDATE aparelhos SET venda_id = '402b5de5-1c92-412b-86f0-7bdf4255296e' WHERE id = 'f40fd271-2a60-4c88-bed6-b4904ef85d41';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('902d12ad-e401-43bc-aabc-ccae11733797', '402b5de5-1c92-412b-86f0-7bdf4255296e', 'pix', 3650.0, '2026-05-09', '2026-05-09');

-- VENDA 89: IPHONE 14 PRO ROXO SEMINOVO (09/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('ee2766d2-4b64-43f9-97f8-adc729d7b3c1', 'IPHONE 14 PRO ROXO', '350923388804337', 2953.0, 2700.0, 1, 'vendido', 'seminovo', '2026-05-09', '2026-05-09', '2026-05-09', '2026-05-09');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('1c408dd0-d62f-479a-89da-784f437a2549', 1, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 2953.0, 2953.0, 0, 0, '2026-05-09');
UPDATE aparelhos SET venda_id = '1c408dd0-d62f-479a-89da-784f437a2549' WHERE id = 'ee2766d2-4b64-43f9-97f8-adc729d7b3c1';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('ce2cbc52-579e-44b3-a3bc-2b0a74c84602', '1c408dd0-d62f-479a-89da-784f437a2549', 'cartao_credito', 2953.0, '2026-05-09', '2026-05-09');

-- VENDA 90: IPHONE 14 LILAS 128GB  SEMINOVO (09/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('5be16d03-1f5c-4f6e-a2cd-f5f465eaef26', 'IPHONE 14 LILAS 128GB', '35142179914814', 2350.0, 2050.0, 20, 'vendido', 'seminovo', '2026-05-09', '2026-05-09', '2026-05-09', '2026-05-09');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('e02101c7-dd03-4f5b-b61f-eeddc97696d3', 20, 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 'concluida', 'normal', 2350.0, 2350.0, 0, 0, '2026-05-09');
UPDATE aparelhos SET venda_id = 'e02101c7-dd03-4f5b-b61f-eeddc97696d3' WHERE id = '5be16d03-1f5c-4f6e-a2cd-f5f465eaef26';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('0d20f758-642c-4ba0-91ed-66fc704670d8', 'e02101c7-dd03-4f5b-b61f-eeddc97696d3', 'pix', 2350.0, '2026-05-09', '2026-05-09');

-- Troca: IPHONE 11 64G (R$ 500.00)
INSERT INTO aparelhos (id, modelo, valor_compra, loja_id, status, estado, observacoes, data_entrada, criado_em, atualizado_em)
VALUES ('43d4c6ec-0974-427b-b821-732104ff9601', 'IPHONE 11 64G', 500.0, 20, 'disponivel', 'usado', 'Entrada por troca - venda e02101c7-dd03-4f5b-b61f-eeddc97696d3', '2026-05-09', '2026-05-09', '2026-05-09');

-- VENDA 91: IPAD 11 (A16) 128GB BRANCO NOVO (09/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('21db84da-ab4a-41a6-a94b-9180b6d732f9', 'IPAD 11 (A16) 128GB BRANCO', 'MTGXKDV9QX', 2650.0, 2199.99, 1, 'vendido', 'novo', '2026-05-09', '2026-05-09', '2026-05-09', '2026-05-09');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('40aa36bd-d104-478b-b99b-2bc8be83299c', 1, '9451cd9f-6770-4e32-aae8-c75fa675e818', 'concluida', 'normal', 2650.0, 2650.0, 0, 0, '2026-05-09');
UPDATE aparelhos SET venda_id = '40aa36bd-d104-478b-b99b-2bc8be83299c' WHERE id = '21db84da-ab4a-41a6-a94b-9180b6d732f9';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('d46e5784-97a3-4abb-a6c2-285bc2b0dd28', '40aa36bd-d104-478b-b99b-2bc8be83299c', 'pix', 2650.0, '2026-05-09', '2026-05-09');

-- VENDA 92: IPHONE 15 AZUL NOVO (09/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('3c09cc3c-c35f-4b58-846d-63511b940487', 'IPHONE 15 AZUL', '355225774481521', 4000.0, 3600.0, 19, 'vendido', 'novo', '2026-05-09', '2026-05-09', '2026-05-09', '2026-05-09');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('9d0afd37-9f46-4d8f-aaf0-f00dc82e2097', 19, '85743f3e-1b32-49c0-9d9e-c16afd690f7d', 'concluida', 'normal', 4000.0, 4000.0, 0, 0, '2026-05-09');
UPDATE aparelhos SET venda_id = '9d0afd37-9f46-4d8f-aaf0-f00dc82e2097' WHERE id = '3c09cc3c-c35f-4b58-846d-63511b940487';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('ba70f76f-f3ae-4c86-8c3e-400011a746fb', '9d0afd37-9f46-4d8f-aaf0-f00dc82e2097', 'pix', 4000.0, '2026-05-09', '2026-05-09');

-- Troca: IPHONE 13 (R$ 1600.00)
INSERT INTO aparelhos (id, modelo, valor_compra, loja_id, status, estado, observacoes, data_entrada, criado_em, atualizado_em)
VALUES ('1b82bea3-cf08-42a3-80f9-f040e5f67ba3', 'IPHONE 13', 1600.0, 19, 'disponivel', 'usado', 'Entrada por troca - venda 9d0afd37-9f46-4d8f-aaf0-f00dc82e2097', '2026-05-09', '2026-05-09', '2026-05-09');

-- VENDA 93: IPHONE 17E ROSA 256GB NOVO (09/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('ac0bb81b-201c-42cc-8e4b-6518673c4754', 'IPHONE 17E ROSA 256GB', '357457921078326', 3950.0, 3650.0, 20, 'vendido', 'novo', '2026-05-09', '2026-05-09', '2026-05-09', '2026-05-09');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('80ab34f9-e675-49c8-b3e5-ecb50186a860', 20, 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 'concluida', 'normal', 3950.0, 3950.0, 0, 0, '2026-05-09');
UPDATE aparelhos SET venda_id = '80ab34f9-e675-49c8-b3e5-ecb50186a860' WHERE id = 'ac0bb81b-201c-42cc-8e4b-6518673c4754';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('3033d0d6-9b66-4fc6-b738-d1fd93695a6f', '80ab34f9-e675-49c8-b3e5-ecb50186a860', 'pix', 3950.0, '2026-05-09', '2026-05-09');

-- Troca: IPHONE 13 PRETO, 128G (R$ 1650.00)
INSERT INTO aparelhos (id, modelo, valor_compra, loja_id, status, estado, observacoes, data_entrada, criado_em, atualizado_em)
VALUES ('75dd7ae0-bad5-4687-8d58-d9b7b54df80b', 'IPHONE 13 PRETO, 128G', 1650.0, 20, 'disponivel', 'usado', 'Entrada por troca - venda 80ab34f9-e675-49c8-b3e5-ecb50186a860', '2026-05-09', '2026-05-09', '2026-05-09');

-- VENDA 94: X8 PRO 256GB PRETO NOVO (09/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('4208f3ba-b188-47a1-ad01-f26dc4b9404a', 'X8 PRO 256GB PRETO', '866132085655102', 2100.0, 1900.0, 20, 'vendido', 'novo', '2026-05-09', '2026-05-09', '2026-05-09', '2026-05-09');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('35cb2858-6854-47d6-acca-e0963439d808', 20, '0dd2c938-c6dd-4f5d-aac5-ed045ee5d2fb', 'concluida', 'normal', 2100.0, 2100.0, 0, 0, '2026-05-09');
UPDATE aparelhos SET venda_id = '35cb2858-6854-47d6-acca-e0963439d808' WHERE id = '4208f3ba-b188-47a1-ad01-f26dc4b9404a';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('ccd9805e-8bf2-472a-b18d-978c0d36c5c4', '35cb2858-6854-47d6-acca-e0963439d808', 'pix', 2100.0, '2026-05-09', '2026-05-09');

-- VENDA 95: IPHONE 15 PRO MAX 256GB NATURAL SEMINOVO (09/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('becaceb1-2d2c-41f8-ac27-dad12a004ee6', 'IPHONE 15 PRO MAX 256GB NATURAL', '356511211655440', 4150.0, 3950.0, 1, 'vendido', 'seminovo', '2026-05-09', '2026-05-09', '2026-05-09', '2026-05-09');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('2c79643c-2eb1-42ff-801d-0d0712db7e7b', 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 4150.0, 4150.0, 0, 0, '2026-05-09');
UPDATE aparelhos SET venda_id = '2c79643c-2eb1-42ff-801d-0d0712db7e7b' WHERE id = 'becaceb1-2d2c-41f8-ac27-dad12a004ee6';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('57e7a349-187c-4e24-8e5a-1daee3170a7f', '2c79643c-2eb1-42ff-801d-0d0712db7e7b', 'pix', 4150.0, '2026-05-09', '2026-05-09');

-- VENDA 96: IPHONE 17 PRO MAX 256GB SILVER NOVO (09/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('6c26896e-5a33-41a0-849f-9dd972e9b6f0', 'IPHONE 17 PRO MAX 256GB SILVER', '351668140692723', 8618.0, 8350.0, 1, 'vendido', 'novo', '2026-05-09', '2026-05-09', '2026-05-09', '2026-05-09');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('627a48cd-d3e2-4ef7-bdb7-81245deaaf51', 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 8618.0, 8618.0, 0, 0, '2026-05-09');
UPDATE aparelhos SET venda_id = '627a48cd-d3e2-4ef7-bdb7-81245deaaf51' WHERE id = '6c26896e-5a33-41a0-849f-9dd972e9b6f0';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('a2efe8f0-ae4b-47a7-b210-fec98c2ff659', '627a48cd-d3e2-4ef7-bdb7-81245deaaf51', 'pix', 8618.0, '2026-05-09', '2026-05-09');

-- Troca: IPH 13 PRO 256GB VERDE (R$ 2000.00)
INSERT INTO aparelhos (id, modelo, valor_compra, loja_id, status, estado, observacoes, data_entrada, criado_em, atualizado_em)
VALUES ('40e2af32-09c4-41f7-81a2-a6c530c1fe07', 'IPH 13 PRO 256GB VERDE', 2000.0, 1, 'disponivel', 'usado', 'Entrada por troca - venda 627a48cd-d3e2-4ef7-bdb7-81245deaaf51', '2026-05-09', '2026-05-09', '2026-05-09');

-- VENDA 97: IPHONE 15 PRO MAX 256GB AZUL SEMINOVO (09/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('9e3a43bc-283c-46a0-bcc2-5af8e482c5e1', 'IPHONE 15 PRO MAX 256GB AZUL', '350278026556389', 4300.0, 3950.0, 20, 'vendido', 'seminovo', '2026-05-09', '2026-05-09', '2026-05-09', '2026-05-09');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('ea6c4034-600e-49d9-92d9-d2eb10d79c6b', 20, '0dd2c938-c6dd-4f5d-aac5-ed045ee5d2fb', 'concluida', 'normal', 4300.0, 4300.0, 0, 0, '2026-05-09');
UPDATE aparelhos SET venda_id = 'ea6c4034-600e-49d9-92d9-d2eb10d79c6b' WHERE id = '9e3a43bc-283c-46a0-bcc2-5af8e482c5e1';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('c4fbaef1-b76f-4c7b-a77a-9213095e46bd', 'ea6c4034-600e-49d9-92d9-d2eb10d79c6b', 'pix', 4300.0, '2026-05-09', '2026-05-09');

-- Troca: IPHONE 12 NA COR LILAS DE 64 GB (R$ 950.00)
INSERT INTO aparelhos (id, modelo, valor_compra, loja_id, status, estado, observacoes, data_entrada, criado_em, atualizado_em)
VALUES ('9c88d346-9e82-4e49-a68d-a695ba939b9f', 'IPHONE 12 NA COR LILAS DE 64 GB', 950.0, 20, 'disponivel', 'usado', 'Entrada por troca - venda ea6c4034-600e-49d9-92d9-d2eb10d79c6b', '2026-05-09', '2026-05-09', '2026-05-09');

-- VENDA 98: IPHONE 15 PRO MAX 512GB AZUL SEMINOVO (09/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('005aa80c-7b02-49bc-943b-6ad756c92b42', 'IPHONE 15 PRO MAX 512GB AZUL', '356371481303415', 4550.0, 4300.0, 20, 'vendido', 'seminovo', '2026-05-09', '2026-05-09', '2026-05-09', '2026-05-09');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('644f5b60-5414-4b9f-8959-3ea8dac3f410', 20, '25e2da5b-9e76-4388-9890-7e22efd6940d', 'concluida', 'normal', 4550.0, 4550.0, 0, 0, '2026-05-09');
UPDATE aparelhos SET venda_id = '644f5b60-5414-4b9f-8959-3ea8dac3f410' WHERE id = '005aa80c-7b02-49bc-943b-6ad756c92b42';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('8024c33d-a9fe-4eeb-b295-f1ae673ba8c6', '644f5b60-5414-4b9f-8959-3ea8dac3f410', 'pix', 4550.0, '2026-05-09', '2026-05-09');

-- Troca: IPH 13 128GB AZUL (R$ 1500.00)
INSERT INTO aparelhos (id, modelo, valor_compra, loja_id, status, estado, observacoes, data_entrada, criado_em, atualizado_em)
VALUES ('5c0df9fb-89bc-498e-8aaf-19a1b9046287', 'IPH 13 128GB AZUL', 1500.0, 20, 'disponivel', 'usado', 'Entrada por troca - venda 644f5b60-5414-4b9f-8959-3ea8dac3f410', '2026-05-09', '2026-05-09', '2026-05-09');

-- VENDA 99: IPHONE 17 PRO MAX 256GB AZUL NOVO (09/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('10e02e17-6485-486a-9f5c-9c3a610f51d6', 'IPHONE 17 PRO MAX 256GB AZUL', '351205742681323', 8650.0, 8250.0, 1, 'vendido', 'novo', '2026-05-09', '2026-05-09', '2026-05-09', '2026-05-09');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('78162b20-bf7f-417a-bfee-89856fc3cbf9', 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 8650.0, 8650.0, 0, 0, '2026-05-09');
UPDATE aparelhos SET venda_id = '78162b20-bf7f-417a-bfee-89856fc3cbf9' WHERE id = '10e02e17-6485-486a-9f5c-9c3a610f51d6';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('cce1169a-d1c5-4c4c-a0dd-240339c213d1', '78162b20-bf7f-417a-bfee-89856fc3cbf9', 'pix', 8650.0, '2026-05-09', '2026-05-09');

-- Troca: IPH 16 PRO MAX 256GB DESERT (R$ 5000.00)
INSERT INTO aparelhos (id, modelo, valor_compra, loja_id, status, estado, observacoes, data_entrada, criado_em, atualizado_em)
VALUES ('f0726e52-0d1d-4de4-9a7e-d406549d4bb7', 'IPH 16 PRO MAX 256GB DESERT', 5000.0, 1, 'disponivel', 'usado', 'Entrada por troca - venda 78162b20-bf7f-417a-bfee-89856fc3cbf9', '2026-05-09', '2026-05-09', '2026-05-09');

-- VENDA 100: IPHONE 17 PRO MAX 256GB BRANCO NOVO (09/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('a8a0a087-8884-4e12-8f7e-b6d3735f46c9', 'IPHONE 17 PRO MAX 256GB BRANCO', '351205740164702', 8650.0, 8350.0, 1, 'vendido', 'novo', '2026-05-09', '2026-05-09', '2026-05-09', '2026-05-09');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('e6ee7cef-b043-47f9-ba25-0fb6492b2120', 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 8650.0, 8650.0, 0, 0, '2026-05-09');
UPDATE aparelhos SET venda_id = 'e6ee7cef-b043-47f9-ba25-0fb6492b2120' WHERE id = 'a8a0a087-8884-4e12-8f7e-b6d3735f46c9';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('312c5804-c71f-46e1-b8bb-665546bdd072', 'e6ee7cef-b043-47f9-ba25-0fb6492b2120', 'pix', 8650.0, '2026-05-09', '2026-05-09');

-- Troca: IPH 16 PRO MAX 256GB PRETO (R$ 5000.00)
INSERT INTO aparelhos (id, modelo, valor_compra, loja_id, status, estado, observacoes, data_entrada, criado_em, atualizado_em)
VALUES ('39338e8b-5e72-43c4-bea3-26f6bbf9916d', 'IPH 16 PRO MAX 256GB PRETO', 5000.0, 1, 'disponivel', 'usado', 'Entrada por troca - venda e6ee7cef-b043-47f9-ba25-0fb6492b2120', '2026-05-09', '2026-05-09', '2026-05-09');

-- VENDA 101: REDMI NOTE 15 256GB PRETO NOVO (09/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('52db40f4-8473-4cd3-bb29-7804b911c26a', 'REDMI NOTE 15 256GB PRETO', '862315087076260', 1302.0, 1070.0, 4, 'vendido', 'novo', '2026-05-09', '2026-05-09', '2026-05-09', '2026-05-09');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('789230c4-0fa1-4c17-a158-8e24f260c78c', 4, 'e07d4d35-1381-4d4d-914d-8382a7456fdd', 'concluida', 'normal', 1302.0, 1302.0, 0, 0, '2026-05-09');
UPDATE aparelhos SET venda_id = '789230c4-0fa1-4c17-a158-8e24f260c78c' WHERE id = '52db40f4-8473-4cd3-bb29-7804b911c26a';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('e8d2c789-0c98-43fd-8ba8-74415d7760a8', '789230c4-0fa1-4c17-a158-8e24f260c78c', 'cartao_credito', 1302.0, '2026-05-09', '2026-05-09');

-- VENDA 102: IPHONE 16 PRO 256GB PRETO SEMINOVO (09/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('b773cdf7-7de7-43ba-9802-c0515eaa183a', 'IPHONE 16 PRO 256GB PRETO', '357234294533959', 4990.0, 4500.0, 20, 'vendido', 'seminovo', '2026-05-09', '2026-05-09', '2026-05-09', '2026-05-09');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('5795a18c-ba24-4b33-beb1-3d9cb7080a62', 20, '25e2da5b-9e76-4388-9890-7e22efd6940d', 'concluida', 'normal', 4990.0, 4990.0, 0, 0, '2026-05-09');
UPDATE aparelhos SET venda_id = '5795a18c-ba24-4b33-beb1-3d9cb7080a62' WHERE id = 'b773cdf7-7de7-43ba-9802-c0515eaa183a';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('be2e3b2f-b5af-48ca-803e-65fda9baee9a', '5795a18c-ba24-4b33-beb1-3d9cb7080a62', 'cartao_credito', 4990.0, '2026-05-09', '2026-05-09');

-- VENDA 103: IPHONE 17 256GB AZUL LACRADO (10/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('38bc760d-5095-423b-a64f-16a0567c0d7d', 'IPHONE 17 256GB AZUL', '356484794319885', 4900.0, 4800.0, 1, 'vendido', 'novo', '2026-05-10', '2026-05-10', '2026-05-10', '2026-05-10');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('7a4f365d-d8dd-4845-8835-2f1e335f8fe9', 1, '9451cd9f-6770-4e32-aae8-c75fa675e818', 'concluida', 'normal', 4900.0, 4900.0, 0, 0, '2026-05-10');
UPDATE aparelhos SET venda_id = '7a4f365d-d8dd-4845-8835-2f1e335f8fe9' WHERE id = '38bc760d-5095-423b-a64f-16a0567c0d7d';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('d1bdb9fe-1171-4fc7-b47d-03290611a26a', '7a4f365d-d8dd-4845-8835-2f1e335f8fe9', 'pix', 4900.0, '2026-05-10', '2026-05-10');

-- VENDA 104: IPHONE 16 PRO MAX DESERT 256GB SEMINOVO (10/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('cb3d78b8-2c7e-4299-b193-c52cd5324251', 'IPHONE 16 PRO MAX DESERT 256GB', '358245525252036', 5248.0, 5000.0, 4, 'vendido', 'seminovo', '2026-05-10', '2026-05-10', '2026-05-10', '2026-05-10');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('f1b905b6-336e-4680-88ba-bcc3942064f8', 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 5248.0, 5248.0, 0, 0, '2026-05-10');
UPDATE aparelhos SET venda_id = 'f1b905b6-336e-4680-88ba-bcc3942064f8' WHERE id = 'cb3d78b8-2c7e-4299-b193-c52cd5324251';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('28ef7cb7-4d9d-42b1-8a40-5a81975d12ba', 'f1b905b6-336e-4680-88ba-bcc3942064f8', 'cartao_credito', 5248.0, '2026-05-10', '2026-05-10');

-- VENDA 105: IPHONE 17 PRO MAX 256GB LARANJA LACRADO (10/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('097c6494-839b-4aa2-84b4-f2e153fa94db', 'IPHONE 17 PRO MAX 256GB LARANJA', '353497859462096', 8700.0, 8250.0, 1, 'vendido', 'novo', '2026-05-10', '2026-05-10', '2026-05-10', '2026-05-10');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('c770155b-0c62-4fa5-8788-6204ead7c73e', 1, '9451cd9f-6770-4e32-aae8-c75fa675e818', 'concluida', 'normal', 8700.0, 8700.0, 0, 0, '2026-05-10');
UPDATE aparelhos SET venda_id = 'c770155b-0c62-4fa5-8788-6204ead7c73e' WHERE id = '097c6494-839b-4aa2-84b4-f2e153fa94db';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('d8fd1352-4125-493c-a267-e905c378246a', 'c770155b-0c62-4fa5-8788-6204ead7c73e', 'pix', 8700.0, '2026-05-10', '2026-05-10');

-- VENDA 106: IPHONE 15 256GB PRETO SEMINOVO - GARANTIA (10/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('92857666-8898-4ea0-aebb-1e1a800d507d', 'IPHONE 15 256GB PRETO SEMINOVO', '358388750991421', 3400.0, 2900.0, 4, 'vendido', 'seminovo', '2026-05-10', '2026-05-10', '2026-05-10', '2026-05-10');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('33986e44-8d34-416b-829c-18713f6cc571', 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 3400.0, 3400.0, 0, 0, '2026-05-10');
UPDATE aparelhos SET venda_id = '33986e44-8d34-416b-829c-18713f6cc571' WHERE id = '92857666-8898-4ea0-aebb-1e1a800d507d';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('a56f25cd-b3de-4dd0-8bd2-57d0a6067760', '33986e44-8d34-416b-829c-18713f6cc571', 'pix', 3400.0, '2026-05-10', '2026-05-10');

-- Troca: 14 PRO (RETORNO) (R$ 200.00)
INSERT INTO aparelhos (id, modelo, valor_compra, loja_id, status, estado, observacoes, data_entrada, criado_em, atualizado_em)
VALUES ('cc952cbe-e9b7-482c-abf0-166718ab4600', '14 PRO (RETORNO)', 200.0, 4, 'disponivel', 'usado', 'Entrada por troca - venda 33986e44-8d34-416b-829c-18713f6cc571', '2026-05-10', '2026-05-10', '2026-05-10');

-- VENDA 107: IPHONE 16 PRO MAX 256GB PRETO SEMINOVO (10/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('b45c3094-64e0-4e90-afff-caaac30be5d4', 'IPHONE 16 PRO MAX 256GB PRETO', '358594363316795', 5500.0, 5000.0, 20, 'vendido', 'seminovo', '2026-05-10', '2026-05-10', '2026-05-10', '2026-05-10');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('6f3e61de-4f01-4fe6-b494-e2d9bc9b5200', 20, 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 'concluida', 'normal', 5500.0, 5500.0, 0, 0, '2026-05-10');
UPDATE aparelhos SET venda_id = '6f3e61de-4f01-4fe6-b494-e2d9bc9b5200' WHERE id = 'b45c3094-64e0-4e90-afff-caaac30be5d4';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('7c82092d-2ff5-43a5-93b3-fe01bdbd2552', '6f3e61de-4f01-4fe6-b494-e2d9bc9b5200', 'pix', 5500.0, '2026-05-10', '2026-05-10');

-- Troca: IPH 14 128GB AZUL (R$ 2000.00)
INSERT INTO aparelhos (id, modelo, valor_compra, loja_id, status, estado, observacoes, data_entrada, criado_em, atualizado_em)
VALUES ('6d9949c0-f523-49d3-95d3-ade0b10f2010', 'IPH 14 128GB AZUL', 2000.0, 20, 'disponivel', 'usado', 'Entrada por troca - venda 6f3e61de-4f01-4fe6-b494-e2d9bc9b5200', '2026-05-10', '2026-05-10', '2026-05-10');

-- VENDA 108: IPHONE 17 PRO MAX 256GB BRANCO NOVO (10/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('93b81724-3a3c-4e40-876e-4bcfe303bfcc', 'IPHONE 17 PRO MAX 256GB BRANCO', '355988219563654', 8600.0, 8350.0, 20, 'vendido', 'novo', '2026-05-10', '2026-05-10', '2026-05-10', '2026-05-10');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('6971a59b-7600-428f-a507-602b009c1986', 20, 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 'concluida', 'normal', 8600.0, 8600.0, 0, 0, '2026-05-10');
UPDATE aparelhos SET venda_id = '6971a59b-7600-428f-a507-602b009c1986' WHERE id = '93b81724-3a3c-4e40-876e-4bcfe303bfcc';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('f5c06632-5f4b-4109-bb18-551acf0096de', '6971a59b-7600-428f-a507-602b009c1986', 'cartao_credito', 8600.0, '2026-05-10', '2026-05-10');

-- Troca: IPH 15 PRO MAX 256GB BRANCO (R$ 3950.00)
INSERT INTO aparelhos (id, modelo, valor_compra, loja_id, status, estado, observacoes, data_entrada, criado_em, atualizado_em)
VALUES ('23165db2-3523-4ae2-8d0b-dc1dd55d6b6d', 'IPH 15 PRO MAX 256GB BRANCO', 3950.0, 20, 'disponivel', 'usado', 'Entrada por troca - venda 6971a59b-7600-428f-a507-602b009c1986', '2026-05-10', '2026-05-10', '2026-05-10');

-- VENDA 109: IPHONE 17 PRO MAX 256GB AZUL NOVO (10/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('76689b8c-8574-4786-87f6-d17f4adb32f8', 'IPHONE 17 PRO MAX 256GB AZUL', '358434704613065', 8500.0, 8250.0, 20, 'vendido', 'novo', '2026-05-10', '2026-05-10', '2026-05-10', '2026-05-10');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('c4c311a0-6e18-4802-a23b-7081484ecad6', 20, 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 'concluida', 'normal', 8500.0, 8500.0, 0, 0, '2026-05-10');
UPDATE aparelhos SET venda_id = 'c4c311a0-6e18-4802-a23b-7081484ecad6' WHERE id = '76689b8c-8574-4786-87f6-d17f4adb32f8';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('49c4e7fa-16e3-4710-85b4-753e0a167080', 'c4c311a0-6e18-4802-a23b-7081484ecad6', 'pix', 8500.0, '2026-05-10', '2026-05-10');

-- Troca: IPH 13 PRO MAX 128GB (R$ 1650.00)
INSERT INTO aparelhos (id, modelo, valor_compra, loja_id, status, estado, observacoes, data_entrada, criado_em, atualizado_em)
VALUES ('c620f510-1d7c-48c5-bd9a-e574f85e0eee', 'IPH 13 PRO MAX 128GB', 1650.0, 20, 'disponivel', 'usado', 'Entrada por troca - venda c4c311a0-6e18-4802-a23b-7081484ecad6', '2026-05-10', '2026-05-10', '2026-05-10');

-- VENDA 110: IPHONE 15 PRO MAX 256GB AZUL SEMINOVO (10/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('f6f6d62f-de6a-445f-872e-bd6302c48635', 'IPHONE 15 PRO MAX 256GB AZUL', '356371484863977', 4150.0, 4050.0, 20, 'vendido', 'seminovo', '2026-05-10', '2026-05-10', '2026-05-10', '2026-05-10');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('fbd15601-ed8b-47d3-a852-525760ec42ea', 20, 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 'concluida', 'normal', 4150.0, 4150.0, 0, 0, '2026-05-10');
UPDATE aparelhos SET venda_id = 'fbd15601-ed8b-47d3-a852-525760ec42ea' WHERE id = 'f6f6d62f-de6a-445f-872e-bd6302c48635';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('cdec60ec-93bf-4af4-add9-5eb38577706b', 'fbd15601-ed8b-47d3-a852-525760ec42ea', 'pix', 4150.0, '2026-05-10', '2026-05-10');

-- VENDA 111: IPHONE 16 PRO 256GB DESERT SEMINOVO (10/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('ef0b00ef-cf32-4040-9f54-363b325d612e', 'IPHONE 16 PRO 256GB DESERT', '356295601102623', 4750.0, 4500.0, 1, 'vendido', 'seminovo', '2026-05-10', '2026-05-10', '2026-05-10', '2026-05-10');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('8f7510d4-8b5b-4908-ac3f-cfdc0c7de9b6', 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 4750.0, 4750.0, 0, 0, '2026-05-10');
UPDATE aparelhos SET venda_id = '8f7510d4-8b5b-4908-ac3f-cfdc0c7de9b6' WHERE id = 'ef0b00ef-cf32-4040-9f54-363b325d612e';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('4a2ec577-9866-4134-b90f-b6d89206f908', '8f7510d4-8b5b-4908-ac3f-cfdc0c7de9b6', 'pix', 4750.0, '2026-05-10', '2026-05-10');

-- VENDA 112: IPHONE 17 256GB PRETO NOVO (10/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('6ac3e512-61d5-41ac-a4e3-2c9ca8a35df6', 'IPHONE 17 256GB PRETO', '355559516499759', 5000.0, 4850.0, 1, 'vendido', 'novo', '2026-05-10', '2026-05-10', '2026-05-10', '2026-05-10');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('b9d75c79-c2e8-4bbc-acfc-53bd89df1da8', 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 5000.0, 5000.0, 0, 0, '2026-05-10');
UPDATE aparelhos SET venda_id = 'b9d75c79-c2e8-4bbc-acfc-53bd89df1da8' WHERE id = '6ac3e512-61d5-41ac-a4e3-2c9ca8a35df6';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('241b2502-f4f5-4ade-bccd-54366813a429', 'b9d75c79-c2e8-4bbc-acfc-53bd89df1da8', 'dinheiro', 5000.0, '2026-05-10', '2026-05-10');

-- VENDA 113: NOTE 15 PRO 5G 256GB PRETO NOVO (10/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('0ee09a27-047d-4007-a654-ece8a4a129c4', 'NOTE 15 PRO 5G 256GB PRETO', '863573082363500', 2077.0, 1750.0, 1, 'vendido', 'novo', '2026-05-10', '2026-05-10', '2026-05-10', '2026-05-10');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('0f1030a7-9c62-4212-8252-5c321aba93a3', 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 2077.0, 2077.0, 0, 0, '2026-05-10');
UPDATE aparelhos SET venda_id = '0f1030a7-9c62-4212-8252-5c321aba93a3' WHERE id = '0ee09a27-047d-4007-a654-ece8a4a129c4';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('8f89e65c-c5a7-4537-bb24-572d1bb007c1', '0f1030a7-9c62-4212-8252-5c321aba93a3', 'pix', 2077.0, '2026-05-10', '2026-05-10');

-- VENDA 114: IPHONE 14 PRO MAX 128GB ROXO SEMINOVO (10/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('a810bea6-970b-4e73-af6b-785726a4be95', 'IPHONE 14 PRO MAX 128GB ROXO', '357773240801309', 3350.0, 3150.0, 1, 'vendido', 'seminovo', '2026-05-10', '2026-05-10', '2026-05-10', '2026-05-10');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('7b7e8fa1-fe1c-48b8-a0c2-1bbf8eacbebe', 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 3350.0, 3350.0, 0, 0, '2026-05-10');
UPDATE aparelhos SET venda_id = '7b7e8fa1-fe1c-48b8-a0c2-1bbf8eacbebe' WHERE id = 'a810bea6-970b-4e73-af6b-785726a4be95';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('22feaff7-d945-4778-b04c-80a56fa20421', '7b7e8fa1-fe1c-48b8-a0c2-1bbf8eacbebe', 'pix', 3350.0, '2026-05-10', '2026-05-10');

-- VENDA 115: IPHONE 15 128GB AZUL NOVO (10/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('d019b82f-c2d1-46bc-a0df-5c2428c0ea0d', 'IPHONE 15 128GB AZUL', '355225773551647', 4612.0, 3700.0, 1, 'vendido', 'novo', '2026-05-10', '2026-05-10', '2026-05-10', '2026-05-10');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('a20774f5-b565-4b54-b418-0d5f449d8e27', 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 4612.0, 4612.0, 0, 0, '2026-05-10');
UPDATE aparelhos SET venda_id = 'a20774f5-b565-4b54-b418-0d5f449d8e27' WHERE id = 'd019b82f-c2d1-46bc-a0df-5c2428c0ea0d';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('bf7b473c-3736-4177-9109-727d71ee0349', 'a20774f5-b565-4b54-b418-0d5f449d8e27', 'pix', 4612.0, '2026-05-10', '2026-05-10');

-- VENDA 116: IPHONE 17 PRO MAX 256GB AZUL NOVO (10/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('a603e18f-2585-4064-8795-6eb0f9e297c8', 'IPHONE 17 PRO MAX 256GB AZUL', '358434708446124', 8550.0, 8250.0, 1, 'vendido', 'novo', '2026-05-10', '2026-05-10', '2026-05-10', '2026-05-10');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('596e6fc5-eddb-41d7-b861-f5992e7c007f', 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 8550.0, 8550.0, 0, 0, '2026-05-10');
UPDATE aparelhos SET venda_id = '596e6fc5-eddb-41d7-b861-f5992e7c007f' WHERE id = 'a603e18f-2585-4064-8795-6eb0f9e297c8';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('8d5903ac-ea45-457d-ad95-73ff2bfdb5ca', '596e6fc5-eddb-41d7-b861-f5992e7c007f', 'pix', 8550.0, '2026-05-10', '2026-05-10');

-- Troca: IPH 12 PRO MAX 128GB AZUL (R$ 1850.00)
INSERT INTO aparelhos (id, modelo, valor_compra, loja_id, status, estado, observacoes, data_entrada, criado_em, atualizado_em)
VALUES ('10b06e97-924d-4a4e-97dd-96f1d2c08f29', 'IPH 12 PRO MAX 128GB AZUL', 1850.0, 1, 'disponivel', 'usado', 'Entrada por troca - venda 596e6fc5-eddb-41d7-b861-f5992e7c007f', '2026-05-10', '2026-05-10', '2026-05-10');

-- VENDA 117: IPHONE 15 PRO 256GB NATURAL SEMINOVO (10/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('cc6bedbc-38f1-4f49-b181-7e4ac2678d26', 'IPHONE 15 PRO 256GB NATURAL', '354078643177411', 3697.0, 3180.0, 20, 'vendido', 'seminovo', '2026-05-10', '2026-05-10', '2026-05-10', '2026-05-10');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('dc2ffc31-d210-4c8d-83ac-71fd70e4dadb', 20, '25e2da5b-9e76-4388-9890-7e22efd6940d', 'concluida', 'normal', 3697.0, 3697.0, 0, 0, '2026-05-10');
UPDATE aparelhos SET venda_id = 'dc2ffc31-d210-4c8d-83ac-71fd70e4dadb' WHERE id = 'cc6bedbc-38f1-4f49-b181-7e4ac2678d26';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('0d38bd7f-c768-4eaa-b8b2-2a534a6c7936', 'dc2ffc31-d210-4c8d-83ac-71fd70e4dadb', 'cartao_credito', 3697.0, '2026-05-10', '2026-05-10');

-- VENDA 118: IPHONE 17 256GB BRANCO NOVO (10/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('71f7a1b2-ccb1-4738-b0ca-2a097dc9d363', 'IPHONE 17 256GB BRANCO', '350418055419998', 5430.0, 4900.0, 19, 'vendido', 'novo', '2026-05-10', '2026-05-10', '2026-05-10', '2026-05-10');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('c32c4ff4-3914-45cd-970a-914f314edbed', 19, 'b4269e60-eea2-4eba-a34d-db9591e0ec83', 'concluida', 'normal', 5430.0, 5430.0, 0, 0, '2026-05-10');
UPDATE aparelhos SET venda_id = 'c32c4ff4-3914-45cd-970a-914f314edbed' WHERE id = '71f7a1b2-ccb1-4738-b0ca-2a097dc9d363';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('c46db1cd-7e87-47ea-aa88-e872af146666', 'c32c4ff4-3914-45cd-970a-914f314edbed', 'pix', 5430.0, '2026-05-10', '2026-05-10');

-- VENDA 119: POCO C85 256GB LILAS NOVO (12/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('2f24b8a9-8e31-4fb9-a268-d2245a447933', 'POCO C85 256GB LILAS', '864280087011840', 1200.0, 850.0, 1, 'vendido', 'novo', '2026-05-12', '2026-05-12', '2026-05-12', '2026-05-12');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('716b75f9-d80d-4932-8d65-687a1df59e03', 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 1200.0, 1200.0, 0, 0, '2026-05-12');
UPDATE aparelhos SET venda_id = '716b75f9-d80d-4932-8d65-687a1df59e03' WHERE id = '2f24b8a9-8e31-4fb9-a268-d2245a447933';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('24ad6c6d-060d-410f-bb0a-efd38781c7f2', '716b75f9-d80d-4932-8d65-687a1df59e03', 'pix', 1200.0, '2026-05-12', '2026-05-12');

-- VENDA 120: REALME NOTE 60X 128GB PRETO NOVO (12/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('db155d13-936a-4b00-ad4f-c938a263f9c8', 'REALME NOTE 60X 128GB PRETO', '862505072816619', 720.0, 615.0, 19, 'vendido', 'novo', '2026-05-12', '2026-05-12', '2026-05-12', '2026-05-12');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('15cf0f40-be80-4a4b-9f16-aadfb6a3fc01', 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 720.0, 720.0, 0, 0, '2026-05-12');
UPDATE aparelhos SET venda_id = '15cf0f40-be80-4a4b-9f16-aadfb6a3fc01' WHERE id = 'db155d13-936a-4b00-ad4f-c938a263f9c8';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('ff2b7c93-f82b-4b5b-9f32-1a2620d52cbf', '15cf0f40-be80-4a4b-9f16-aadfb6a3fc01', 'cartao_credito', 720.0, '2026-05-12', '2026-05-12');

-- VENDA 121: IPHONE 17 PRO SILVER SEMINOVO (13/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('4af98d61-4e5a-425b-86d2-767c3b1583c0', 'IPHONE 17 PRO SILVER', '355500351194584', 6900.0, 6350.0, 19, 'vendido', 'seminovo', '2026-05-13', '2026-05-13', '2026-05-13', '2026-05-13');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('8854b89a-7648-4b7b-a1f1-3e7b1279c5cc', 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 6900.0, 6900.0, 0, 0, '2026-05-13');
UPDATE aparelhos SET venda_id = '8854b89a-7648-4b7b-a1f1-3e7b1279c5cc' WHERE id = '4af98d61-4e5a-425b-86d2-767c3b1583c0';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('a5a1eb4c-da66-4ada-a050-9ef4ffc0a25e', '8854b89a-7648-4b7b-a1f1-3e7b1279c5cc', 'pix', 6900.0, '2026-05-13', '2026-05-13');

-- VENDA 122: APPLE WATCH SE 3 STARLIGHT NOVO (13/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('f59227c2-0e8e-444e-859f-345292369cc1', 'APPLE WATCH SE 3 STARLIGHT', 'D23PC63DYY', 1950.0, 1750.0, 19, 'vendido', 'novo', '2026-05-13', '2026-05-13', '2026-05-13', '2026-05-13');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('2df2be1b-555b-40e3-8a8b-e7eedf78e2fe', 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 1950.0, 1950.0, 0, 0, '2026-05-13');
UPDATE aparelhos SET venda_id = '2df2be1b-555b-40e3-8a8b-e7eedf78e2fe' WHERE id = 'f59227c2-0e8e-444e-859f-345292369cc1';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('35754b9e-5aca-496f-8cf2-1d1b70cbe46e', '2df2be1b-555b-40e3-8a8b-e7eedf78e2fe', 'pix', 1950.0, '2026-05-13', '2026-05-13');

-- VENDA 123: POCO C85 256GB PRETO LACRADO (13/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('a42183d3-f6cc-4410-a120-442782b49018', 'POCO C85 256GB PRETO', '861260081088468', 1000.0, 870.0, 1, 'vendido', 'novo', '2026-05-13', '2026-05-13', '2026-05-13', '2026-05-13');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('a9cb9d49-c7e4-42d7-9a59-b4c6599cba75', 1, '9451cd9f-6770-4e32-aae8-c75fa675e818', 'concluida', 'normal', 1000.0, 1000.0, 0, 0, '2026-05-13');
UPDATE aparelhos SET venda_id = 'a9cb9d49-c7e4-42d7-9a59-b4c6599cba75' WHERE id = 'a42183d3-f6cc-4410-a120-442782b49018';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('61862f34-0003-4bba-98f3-dfd3f430f57c', 'a9cb9d49-c7e4-42d7-9a59-b4c6599cba75', 'pix', 1000.0, '2026-05-13', '2026-05-13');

-- VENDA 124: IPHONE 16 PRO MAX 256GB PRETO SEMINOVO (13/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('485b6ddd-2739-4470-b4ff-6d91232595d5', 'IPHONE 16 PRO MAX 256GB PRETO', '357205984783526', 5270.0, 5000.0, 4, 'vendido', 'seminovo', '2026-05-13', '2026-05-13', '2026-05-13', '2026-05-13');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('636a643b-55f0-42cf-b8af-13bed62c1d87', 4, 'e07d4d35-1381-4d4d-914d-8382a7456fdd', 'concluida', 'normal', 5270.0, 5270.0, 0, 0, '2026-05-13');
UPDATE aparelhos SET venda_id = '636a643b-55f0-42cf-b8af-13bed62c1d87' WHERE id = '485b6ddd-2739-4470-b4ff-6d91232595d5';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('53faa79e-e069-4caf-884e-4a7081368ce5', '636a643b-55f0-42cf-b8af-13bed62c1d87', 'pix', 5270.0, '2026-05-13', '2026-05-13');

-- VENDA 125: IPHONE 15 PRO SEMINOVO NATURAL 128GB (13/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('9188e025-a8e7-4ed8-9915-4cfd4f20825e', 'IPHONE 15 PRO SEMINOVO NATURAL 128GB', '355262962390305', 3706.0, 3100.0, 4, 'vendido', 'seminovo', '2026-05-13', '2026-05-13', '2026-05-13', '2026-05-13');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('67482369-023d-41d1-86f0-168c00345949', 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 3706.0, 3706.0, 0, 0, '2026-05-13');
UPDATE aparelhos SET venda_id = '67482369-023d-41d1-86f0-168c00345949' WHERE id = '9188e025-a8e7-4ed8-9915-4cfd4f20825e';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('035cafd1-70e8-483f-be40-838d79e246f0', '67482369-023d-41d1-86f0-168c00345949', 'cartao_credito', 3706.0, '2026-05-13', '2026-05-13');

-- VENDA 126: IPHONE 14 128GB BRANCO SEMINOVO (13/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('f2fe1c02-0fc2-43ea-9232-f1dc9c656750', 'IPHONE 14 128GB BRANCO', '357950903092463', 2250.0, 2050.0, 20, 'vendido', 'seminovo', '2026-05-13', '2026-05-13', '2026-05-13', '2026-05-13');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('ae127d20-6b8e-4fc0-ad0b-215125958599', 20, 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 'concluida', 'normal', 2250.0, 2250.0, 0, 0, '2026-05-13');
UPDATE aparelhos SET venda_id = 'ae127d20-6b8e-4fc0-ad0b-215125958599' WHERE id = 'f2fe1c02-0fc2-43ea-9232-f1dc9c656750';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('c60cebc1-c3d7-4afc-93e8-60bc0f233209', 'ae127d20-6b8e-4fc0-ad0b-215125958599', 'dinheiro', 2250.0, '2026-05-13', '2026-05-13');

-- VENDA 127: IPHONE 14 128GB BRANCO SEMINOVO (13/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('81794294-cba4-4eed-9250-6485ede45bba', 'IPHONE 14 128GB BRANCO', '354807372557538', 2409.0, 2050.0, 20, 'vendido', 'seminovo', '2026-05-13', '2026-05-13', '2026-05-13', '2026-05-13');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('ac6ef8d3-4f41-4bb3-86e6-b09d6c7a529b', 20, '25e2da5b-9e76-4388-9890-7e22efd6940d', 'concluida', 'normal', 2409.0, 2409.0, 0, 0, '2026-05-13');
UPDATE aparelhos SET venda_id = 'ac6ef8d3-4f41-4bb3-86e6-b09d6c7a529b' WHERE id = '81794294-cba4-4eed-9250-6485ede45bba';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('6727575a-a43c-473d-bee0-8341a1fc4fc4', 'ac6ef8d3-4f41-4bb3-86e6-b09d6c7a529b', 'pix', 2409.0, '2026-05-13', '2026-05-13');

-- VENDA 128: REDMI 15C 256GB PRETO  NOVO (13/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('b757a1d8-9fe1-4713-bb64-8a03f0ada4aa', 'REDMI 15C 256GB PRETO', '867754088428267', 1000.0, 840.0, 19, 'vendido', 'novo', '2026-05-13', '2026-05-13', '2026-05-13', '2026-05-13');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('abbb3184-471f-4f65-8215-6ce55b3552fa', 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 1000.0, 1000.0, 0, 0, '2026-05-13');
UPDATE aparelhos SET venda_id = 'abbb3184-471f-4f65-8215-6ce55b3552fa' WHERE id = 'b757a1d8-9fe1-4713-bb64-8a03f0ada4aa';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('fe56b8a7-645f-4967-8077-5fa04fb9f3f2', 'abbb3184-471f-4f65-8215-6ce55b3552fa', 'pix', 1000.0, '2026-05-13', '2026-05-13');

-- Troca: FELIPE VOLTOU (R$ 5900.00)
INSERT INTO aparelhos (id, modelo, valor_compra, loja_id, status, estado, observacoes, data_entrada, criado_em, atualizado_em)
VALUES ('00aca0ab-cc2f-4c10-92f1-9b95c1e2186f', 'FELIPE VOLTOU', 5900.0, 19, 'disponivel', 'usado', 'Entrada por troca - venda abbb3184-471f-4f65-8215-6ce55b3552fa', '2026-05-13', '2026-05-13', '2026-05-13');

-- VENDA 129: IPHONE 17 PRO MAX 512GB AZUL NOVO (13/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('6a36307f-310f-439b-aac3-c2b4da8ed060', 'IPHONE 17 PRO MAX 512GB AZUL', '357247250248784', 10242.0, 9050.0, 1, 'vendido', 'novo', '2026-05-13', '2026-05-13', '2026-05-13', '2026-05-13');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('6b4ffc77-b0de-4573-bcd1-64f7269db69a', 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 10242.0, 10242.0, 0, 0, '2026-05-13');
UPDATE aparelhos SET venda_id = '6b4ffc77-b0de-4573-bcd1-64f7269db69a' WHERE id = '6a36307f-310f-439b-aac3-c2b4da8ed060';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('efa3023f-837a-4241-aadc-910ef039624c', '6b4ffc77-b0de-4573-bcd1-64f7269db69a', 'pix', 10242.0, '2026-05-13', '2026-05-13');

-- Troca: IPH 16 PRO MAX 512GB PRETO (R$ 5000.00)
INSERT INTO aparelhos (id, modelo, valor_compra, loja_id, status, estado, observacoes, data_entrada, criado_em, atualizado_em)
VALUES ('01bf2973-b660-4722-9893-40a91671e804', 'IPH 16 PRO MAX 512GB PRETO', 5000.0, 1, 'disponivel', 'usado', 'Entrada por troca - venda 6b4ffc77-b0de-4573-bcd1-64f7269db69a', '2026-05-13', '2026-05-13', '2026-05-13');

-- VENDA 130: BOOMBOX 4 LARANJA NOVO (14/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('caf39fc2-1e57-43e0-8db8-530781c48248', 'BOOMBOX 4 LARANJA', 'TL1937-BQ0009616', 2500.0, 2390.0, 4, 'vendido', 'novo', '2026-05-14', '2026-05-14', '2026-05-14', '2026-05-14');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('e9d16f13-1d4d-4196-afe1-9dd683f200e5', 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 2500.0, 2500.0, 0, 0, '2026-05-14');
UPDATE aparelhos SET venda_id = 'e9d16f13-1d4d-4196-afe1-9dd683f200e5' WHERE id = 'caf39fc2-1e57-43e0-8db8-530781c48248';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('03e26711-ab2b-4922-93f1-21687573ca2c', 'e9d16f13-1d4d-4196-afe1-9dd683f200e5', 'pix', 2500.0, '2026-05-14', '2026-05-14');

-- VENDA 131: IPHONE 14 PRO MAX 256GB ROXO SEMINOVO (14/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('1bc08217-ed67-4d09-b79e-3b93d7f4468d', 'IPHONE 14 PRO MAX 256GB ROXO', '357173348275037', 3600.0, 3200.0, 4, 'vendido', 'seminovo', '2026-05-14', '2026-05-14', '2026-05-14', '2026-05-14');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('fda0b101-5c6a-41fe-84a5-a664d8242bfc', 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 3600.0, 3600.0, 0, 0, '2026-05-14');
UPDATE aparelhos SET venda_id = 'fda0b101-5c6a-41fe-84a5-a664d8242bfc' WHERE id = '1bc08217-ed67-4d09-b79e-3b93d7f4468d';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('8d5e6439-6731-4e7b-95ba-5c3daf1593ae', 'fda0b101-5c6a-41fe-84a5-a664d8242bfc', 'cartao_credito', 3600.0, '2026-05-14', '2026-05-14');

-- VENDA 132: NOTE 13 5G 256GB PRETO NOVO (14/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('e9ac95a6-1c2c-40e2-9355-eff3e8b3e3e0', 'NOTE 13 5G 256GB PRETO', '860698079480943', 1050.0, 950.0, 19, 'vendido', 'novo', '2026-05-14', '2026-05-14', '2026-05-14', '2026-05-14');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('824f7142-9dab-41f9-86a0-cfd9057b0a16', 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 1050.0, 1050.0, 0, 0, '2026-05-14');
UPDATE aparelhos SET venda_id = '824f7142-9dab-41f9-86a0-cfd9057b0a16' WHERE id = 'e9ac95a6-1c2c-40e2-9355-eff3e8b3e3e0';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('fffbcab1-4b3c-4765-944e-6b44f3ea1547', '824f7142-9dab-41f9-86a0-cfd9057b0a16', 'pix', 1050.0, '2026-05-14', '2026-05-14');

-- VENDA 133: TAB S6 LITE 128GB SEMINOVO PRETO (14/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('7cbd2317-4b18-44e7-8810-6fef0ad4b3aa', 'TAB S6 LITE 128GB SEMINOVO PRETO', '355835400444618', 1350.0, 900.0, 19, 'vendido', 'seminovo', '2026-05-14', '2026-05-14', '2026-05-14', '2026-05-14');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('d639f1cb-0c95-4270-84c4-894aee87a9e1', 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 1350.0, 1350.0, 0, 0, '2026-05-14');
UPDATE aparelhos SET venda_id = 'd639f1cb-0c95-4270-84c4-894aee87a9e1' WHERE id = '7cbd2317-4b18-44e7-8810-6fef0ad4b3aa';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('ffefdcb8-137d-40a5-86a5-12cf2b257e9d', 'd639f1cb-0c95-4270-84c4-894aee87a9e1', 'cartao_credito', 1350.0, '2026-05-14', '2026-05-14');

-- VENDA 134: IPHONE 16 PRO MAX 256GB PRETO SEMINOVO (14/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('46cc38fe-de96-47cb-b268-58a697534f5a', 'IPHONE 16 PRO MAX 256GB PRETO', '355706423711715', 5300.0, 5000.0, 20, 'vendido', 'seminovo', '2026-05-14', '2026-05-14', '2026-05-14', '2026-05-14');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('ee8d6ea1-0091-4344-8bc0-744199fdeb71', 20, 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 'concluida', 'normal', 5300.0, 5300.0, 0, 0, '2026-05-14');
UPDATE aparelhos SET venda_id = 'ee8d6ea1-0091-4344-8bc0-744199fdeb71' WHERE id = '46cc38fe-de96-47cb-b268-58a697534f5a';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('7f6e0ff4-86f9-4cee-8519-c25018d04d73', 'ee8d6ea1-0091-4344-8bc0-744199fdeb71', 'pix', 5300.0, '2026-05-14', '2026-05-14');

-- Troca: IPH 13 128GB BRANCO (R$ 1500.00)
INSERT INTO aparelhos (id, modelo, valor_compra, loja_id, status, estado, observacoes, data_entrada, criado_em, atualizado_em)
VALUES ('578ec0d0-a1b4-4358-a98b-17ff662528c6', 'IPH 13 128GB BRANCO', 1500.0, 20, 'disponivel', 'usado', 'Entrada por troca - venda ee8d6ea1-0091-4344-8bc0-744199fdeb71', '2026-05-14', '2026-05-14', '2026-05-14');

-- VENDA 135: IPHONE 14 PRO 128GB PRETO SEMINOVO (14/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('52eb529c-fe64-4487-81fe-7d9026947b5f', 'IPHONE 14 PRO 128GB PRETO', '357442883839907', 2910.0, 2700.0, 20, 'vendido', 'seminovo', '2026-05-14', '2026-05-14', '2026-05-14', '2026-05-14');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('9bbd2733-ae2d-4e23-af6d-d86ee2f73106', 20, 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 'concluida', 'normal', 2910.0, 2910.0, 0, 0, '2026-05-14');
UPDATE aparelhos SET venda_id = '9bbd2733-ae2d-4e23-af6d-d86ee2f73106' WHERE id = '52eb529c-fe64-4487-81fe-7d9026947b5f';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('141614d7-6c49-493b-a9ff-12fc67e5c43d', '9bbd2733-ae2d-4e23-af6d-d86ee2f73106', 'dinheiro', 2910.0, '2026-05-14', '2026-05-14');

-- VENDA 136: IPHONE 14 PRO MAX 128GB ROXO SEMINOVO (14/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('b77e18ca-40e3-4bc1-ae4e-4d4c8ee07eaa', 'IPHONE 14 PRO MAX 128GB ROXO', '357397703170232', 3250.0, 3150.0, 1, 'vendido', 'seminovo', '2026-05-14', '2026-05-14', '2026-05-14', '2026-05-14');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('a59a079d-de68-43f7-92dc-d29607e19f53', 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 3250.0, 3250.0, 0, 0, '2026-05-14');
UPDATE aparelhos SET venda_id = 'a59a079d-de68-43f7-92dc-d29607e19f53' WHERE id = 'b77e18ca-40e3-4bc1-ae4e-4d4c8ee07eaa';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('580de6a7-f75e-4359-8ee4-8699d1960537', 'a59a079d-de68-43f7-92dc-d29607e19f53', 'pix', 3250.0, '2026-05-14', '2026-05-14');

-- VENDA 137: IPHONE 16 PLUS 128GB PRETO SEMINOVO (14/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('6bc40bda-2849-48fb-880a-88983bfdcaa6', 'IPHONE 16 PLUS 128GB PRETO', '352726622496929', 4225.0, 3750.0, 1, 'vendido', 'seminovo', '2026-05-14', '2026-05-14', '2026-05-14', '2026-05-14');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('2774e0ef-1848-4a2d-90c1-bc6b6187c079', 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 4225.0, 4225.0, 0, 0, '2026-05-14');
UPDATE aparelhos SET venda_id = '2774e0ef-1848-4a2d-90c1-bc6b6187c079' WHERE id = '6bc40bda-2849-48fb-880a-88983bfdcaa6';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('924d56a3-dbbf-4b3a-8758-fe77966bc55d', '2774e0ef-1848-4a2d-90c1-bc6b6187c079', 'pix', 4225.0, '2026-05-14', '2026-05-14');

-- VENDA 138: IPHONE 13 128GB ROSA SEMINOVO (14/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('030234b5-83c4-44ba-a4a9-6e88d64dd19e', 'IPHONE 13 128GB ROSA', NULL, 1911.0, 1800.0, 1, 'vendido', 'seminovo', '2026-05-14', '2026-05-14', '2026-05-14', '2026-05-14');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('c6d05ac7-f7c4-48aa-ba2d-e53732aea26f', 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 1911.0, 1911.0, 0, 0, '2026-05-14');
UPDATE aparelhos SET venda_id = 'c6d05ac7-f7c4-48aa-ba2d-e53732aea26f' WHERE id = '030234b5-83c4-44ba-a4a9-6e88d64dd19e';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('0ce0a909-3d2e-48b3-be90-8fcded54eaea', 'c6d05ac7-f7c4-48aa-ba2d-e53732aea26f', 'pix', 1911.0, '2026-05-14', '2026-05-14');

-- VENDA 139: IPHONE 17 PRO MAX 256GB AZUL NOVO (15/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('70b1c5c8-7795-42b6-8820-252264483838', 'IPHONE 17 PRO MAX 256GB AZUL', '351205741900807', 8650.0, 8050.0, 4, 'vendido', 'novo', '2026-05-15', '2026-05-15', '2026-05-15', '2026-05-15');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('156da79d-8efd-4cf2-a33e-a12ec374a503', 4, 'e07d4d35-1381-4d4d-914d-8382a7456fdd', 'concluida', 'normal', 8650.0, 8650.0, 0, 0, '2026-05-15');
UPDATE aparelhos SET venda_id = '156da79d-8efd-4cf2-a33e-a12ec374a503' WHERE id = '70b1c5c8-7795-42b6-8820-252264483838';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('c4b493d9-b373-491d-a873-79e4112cba98', '156da79d-8efd-4cf2-a33e-a12ec374a503', 'pix', 8650.0, '2026-05-15', '2026-05-15');

-- VENDA 140: IPHONE 11 128GB PRETO SEMINOVO (15/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('89182e0e-f94b-4b77-8fe3-a5c07da28d38', 'IPHONE 11 128GB PRETO', '356460904622673', 899.99, 800.0, 4, 'vendido', 'seminovo', '2026-05-15', '2026-05-15', '2026-05-15', '2026-05-15');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('2cf885d2-8e80-45fc-be9d-abcfd61def9a', 4, 'e07d4d35-1381-4d4d-914d-8382a7456fdd', 'concluida', 'normal', 899.99, 899.99, 0, 0, '2026-05-15');
UPDATE aparelhos SET venda_id = '2cf885d2-8e80-45fc-be9d-abcfd61def9a' WHERE id = '89182e0e-f94b-4b77-8fe3-a5c07da28d38';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('2f07c565-60f5-4a87-9fac-f2d36262fb6d', '2cf885d2-8e80-45fc-be9d-abcfd61def9a', 'pix', 899.99, '2026-05-15', '2026-05-15');

-- VENDA 141: IPHONE 17 PRO LARANJA 256GB NOVO (15/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('f83aaac5-bc13-4d35-86b6-e193a6d3ef1d', 'IPHONE 17 PRO LARANJA 256GB', '354289632484698', 8500.0, 8250.0, 20, 'vendido', 'novo', '2026-05-15', '2026-05-15', '2026-05-15', '2026-05-15');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('057e6ae7-142c-4a2d-a657-544f0b8631a1', 20, 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 'concluida', 'normal', 8500.0, 8500.0, 0, 0, '2026-05-15');
UPDATE aparelhos SET venda_id = '057e6ae7-142c-4a2d-a657-544f0b8631a1' WHERE id = 'f83aaac5-bc13-4d35-86b6-e193a6d3ef1d';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('941ac2a8-85d9-4060-8797-840a9b80a057', '057e6ae7-142c-4a2d-a657-544f0b8631a1', 'pix', 8500.0, '2026-05-15', '2026-05-15');

-- VENDA 142: IPHONE 17 PRO 256GB LARANJA NOVO (15/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('846d54e4-8f08-45b0-b371-c1b184b3dcf4', 'IPHONE 17 PRO 256GB LARANJA', '352001998377479', 8500.0, 8250.0, 20, 'vendido', 'novo', '2026-05-15', '2026-05-15', '2026-05-15', '2026-05-15');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('54b14849-6c59-4bcf-857b-f2934a5ae07c', 20, 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 'concluida', 'normal', 8500.0, 8500.0, 0, 0, '2026-05-15');
UPDATE aparelhos SET venda_id = '54b14849-6c59-4bcf-857b-f2934a5ae07c' WHERE id = '846d54e4-8f08-45b0-b371-c1b184b3dcf4';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('999f93a8-85a9-4875-a8c0-7a9096a9dac2', '54b14849-6c59-4bcf-857b-f2934a5ae07c', 'pix', 8500.0, '2026-05-15', '2026-05-15');

-- VENDA 143: MACBOOK AIR M4 256GB SILVER NOVO (15/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('153eee47-d7ef-4877-9036-3f2cb7711250', 'MACBOOK AIR M4 256GB SILVER', 'L1FL9LNFH1', 6750.0, 6500.0, 20, 'vendido', 'novo', '2026-05-15', '2026-05-15', '2026-05-15', '2026-05-15');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('9ed60ebb-d043-4b6f-9bdf-271cfd20dc5a', 20, 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 'concluida', 'normal', 6750.0, 6750.0, 0, 0, '2026-05-15');
UPDATE aparelhos SET venda_id = '9ed60ebb-d043-4b6f-9bdf-271cfd20dc5a' WHERE id = '153eee47-d7ef-4877-9036-3f2cb7711250';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('5330f0fb-1f2d-429e-9ca7-723e12566dfa', '9ed60ebb-d043-4b6f-9bdf-271cfd20dc5a', 'pix', 6750.0, '2026-05-15', '2026-05-15');

-- VENDA 144: MACBOOK AIR M4 SILVER 256GB NOVO (15/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('09644ce3-d5dd-4172-82f7-bae027775909', 'MACBOOK AIR M4 SILVER 256GB', 'D9XGF2JP9X', 6750.0, 6500.0, 20, 'vendido', 'novo', '2026-05-15', '2026-05-15', '2026-05-15', '2026-05-15');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('48ba5b15-cbd2-4b49-a6d1-808de7b7e317', 20, 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 'concluida', 'normal', 6750.0, 6750.0, 0, 0, '2026-05-15');
UPDATE aparelhos SET venda_id = '48ba5b15-cbd2-4b49-a6d1-808de7b7e317' WHERE id = '09644ce3-d5dd-4172-82f7-bae027775909';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('e13d024d-f6c8-4949-8a87-beb53d6405ba', '48ba5b15-cbd2-4b49-a6d1-808de7b7e317', 'pix', 6750.0, '2026-05-15', '2026-05-15');

-- VENDA 145: IPHONE 17 PRO MAX 256GB LARANJA SEMINOVO (15/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('eae4a248-098b-4953-99e7-152a8ac43b2a', 'IPHONE 17 PRO MAX 256GB LARANJA', '359912580728338', 7700.0, 6900.0, 4, 'vendido', 'seminovo', '2026-05-15', '2026-05-15', '2026-05-15', '2026-05-15');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('99dea43d-9490-4900-ba3b-45157e1d9bfd', 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 7700.0, 7700.0, 0, 0, '2026-05-15');
UPDATE aparelhos SET venda_id = '99dea43d-9490-4900-ba3b-45157e1d9bfd' WHERE id = 'eae4a248-098b-4953-99e7-152a8ac43b2a';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('8c0d7329-5491-41fb-8997-a84735d55fe1', '99dea43d-9490-4900-ba3b-45157e1d9bfd', 'cartao_credito', 7700.0, '2026-05-15', '2026-05-15');

-- Troca: 16 PRO MAX SEMINOVO (R$ 5000.00)
INSERT INTO aparelhos (id, modelo, valor_compra, loja_id, status, estado, observacoes, data_entrada, criado_em, atualizado_em)
VALUES ('d184ffc0-4652-48d7-bd3c-f4ba0a9c5eaa', '16 PRO MAX SEMINOVO', 5000.0, 4, 'disponivel', 'novo', 'Entrada por troca - venda 99dea43d-9490-4900-ba3b-45157e1d9bfd', '2026-05-15', '2026-05-15', '2026-05-15');

-- VENDA 146: IPAD 11° A16 128GB AZUL NOVO (15/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('e7bff532-313d-4c33-b3c5-a8b2133b0910', 'IPAD 11° A16 128GB AZUL', 'H64RQG50Y0', 2500.0, 2090.0, 4, 'vendido', 'novo', '2026-05-15', '2026-05-15', '2026-05-15', '2026-05-15');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('d3fea1f8-6d74-4d35-ba0b-9e25b1476fb8', 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 2500.0, 2500.0, 0, 0, '2026-05-15');
UPDATE aparelhos SET venda_id = 'd3fea1f8-6d74-4d35-ba0b-9e25b1476fb8' WHERE id = 'e7bff532-313d-4c33-b3c5-a8b2133b0910';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('40038ac7-750a-4db2-b103-f1c045714e61', 'd3fea1f8-6d74-4d35-ba0b-9e25b1476fb8', 'pix', 2500.0, '2026-05-15', '2026-05-15');

-- VENDA 147: IPAD 11° A16 128GB AZUL NOVO (15/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('45947452-a889-4137-9ebb-cfef89bdae4d', 'IPAD 11° A16 128GB AZUL', 'G23024PVDT', 2200.0, 2090.0, 4, 'vendido', 'novo', '2026-05-15', '2026-05-15', '2026-05-15', '2026-05-15');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('0633785f-36a2-4ab6-a80e-0d6cc1e1e7f5', 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 2200.0, 2200.0, 0, 0, '2026-05-15');
UPDATE aparelhos SET venda_id = '0633785f-36a2-4ab6-a80e-0d6cc1e1e7f5' WHERE id = '45947452-a889-4137-9ebb-cfef89bdae4d';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('b5e43a0b-bba6-42a8-872e-4b5a14cdd381', '0633785f-36a2-4ab6-a80e-0d6cc1e1e7f5', 'pix', 2200.0, '2026-05-15', '2026-05-15');

-- VENDA 148: IPHONE 15 128GB PRETO SEMINOVO (15/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('7718af17-d0d3-4c47-b3d2-ca2fe429905e', 'IPHONE 15 128GB PRETO', '356054492870941', 2930.0, 2750.0, 4, 'vendido', 'seminovo', '2026-05-15', '2026-05-15', '2026-05-15', '2026-05-15');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('edf17a32-f182-489b-99db-57ea3700d69e', 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 2930.0, 2930.0, 0, 0, '2026-05-15');
UPDATE aparelhos SET venda_id = 'edf17a32-f182-489b-99db-57ea3700d69e' WHERE id = '7718af17-d0d3-4c47-b3d2-ca2fe429905e';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('2ed22124-23f9-4e57-89e6-7fcef70ca932', 'edf17a32-f182-489b-99db-57ea3700d69e', 'pix', 2930.0, '2026-05-15', '2026-05-15');

-- VENDA 149: IPHONE 13 PRO 128GB GRAFITE SEMINOVO (15/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('d4a40e25-fa04-4b27-bbf1-8e96ebc54816', 'IPHONE 13 PRO 128GB GRAFITE', NULL, 2500.0, 2350.0, 4, 'vendido', 'seminovo', '2026-05-15', '2026-05-15', '2026-05-15', '2026-05-15');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('97268ff3-d864-40ea-bfb8-9a3defe3ebc1', 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 2500.0, 2500.0, 0, 0, '2026-05-15');
UPDATE aparelhos SET venda_id = '97268ff3-d864-40ea-bfb8-9a3defe3ebc1' WHERE id = 'd4a40e25-fa04-4b27-bbf1-8e96ebc54816';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('292a8d60-0acc-41ea-8456-0e3c981a47c9', '97268ff3-d864-40ea-bfb8-9a3defe3ebc1', 'pix', 2500.0, '2026-05-15', '2026-05-15');

-- Troca: (FILIPE PAGOU (R$ 950.00)
INSERT INTO aparelhos (id, modelo, valor_compra, loja_id, status, estado, observacoes, data_entrada, criado_em, atualizado_em)
VALUES ('a20db879-dafc-4c4f-adf1-edb422d9d17d', '(FILIPE PAGOU', 950.0, 4, 'disponivel', 'usado', 'Entrada por troca - venda 97268ff3-d864-40ea-bfb8-9a3defe3ebc1', '2026-05-15', '2026-05-15', '2026-05-15');

-- VENDA 150: IPHONE 17 256GB VERDE NOVO (15/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('b2474c5b-7499-4d99-9d92-6fd352d3a167', 'IPHONE 17 256GB VERDE', '355989441325235', 5085.0, 4850.0, 19, 'vendido', 'novo', '2026-05-15', '2026-05-15', '2026-05-15', '2026-05-15');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('e41b7dd6-d602-4215-8a7d-929628e7d43b', 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 5085.0, 5085.0, 0, 0, '2026-05-15');
UPDATE aparelhos SET venda_id = 'e41b7dd6-d602-4215-8a7d-929628e7d43b' WHERE id = 'b2474c5b-7499-4d99-9d92-6fd352d3a167';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('ba70eb27-932e-422c-ae25-9853263a227d', 'e41b7dd6-d602-4215-8a7d-929628e7d43b', 'cartao_credito', 5085.0, '2026-05-15', '2026-05-15');

-- VENDA 151: IPHONE 15 PRO MAX 256GB NATURAL SEMINOVO (15/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('f44b7dcc-02eb-4eb6-a25d-bdc420107713', 'IPHONE 15 PRO MAX 256GB NATURAL', '350278024027409', 4100.0, 4000.0, 19, 'vendido', 'seminovo', '2026-05-15', '2026-05-15', '2026-05-15', '2026-05-15');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('ab90c351-dc35-4633-b2bf-c73a13eb8b94', 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 4100.0, 4100.0, 0, 0, '2026-05-15');
UPDATE aparelhos SET venda_id = 'ab90c351-dc35-4633-b2bf-c73a13eb8b94' WHERE id = 'f44b7dcc-02eb-4eb6-a25d-bdc420107713';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('eeb50887-b515-4eff-b42e-ea12d3ffd774', 'ab90c351-dc35-4633-b2bf-c73a13eb8b94', 'pix', 4100.0, '2026-05-15', '2026-05-15');

-- VENDA 152: POCO X7 PRO 256GB PRETO NOVO (15/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('7f29d78a-056e-4ab2-ada9-22cc4b36e40f', 'POCO X7 PRO 256GB PRETO', '869471081130380', 2075.0, 1750.0, 1, 'vendido', 'novo', '2026-05-15', '2026-05-15', '2026-05-15', '2026-05-15');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('337fa879-7e30-4772-b000-6b737b56cb94', 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 2075.0, 2075.0, 0, 0, '2026-05-15');
UPDATE aparelhos SET venda_id = '337fa879-7e30-4772-b000-6b737b56cb94' WHERE id = '7f29d78a-056e-4ab2-ada9-22cc4b36e40f';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('a0d0a5ce-eb02-4564-adf5-167d56f22b2f', '337fa879-7e30-4772-b000-6b737b56cb94', 'pix', 2075.0, '2026-05-15', '2026-05-15');

-- VENDA 153: POCO X7 PRO 256GB PRETO NOVO (15/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('5b712df7-9900-4fa7-b711-4859bd4c50ef', 'POCO X7 PRO 256GB PRETO', '869471081096821', 2075.0, 1750.0, 1, 'vendido', 'novo', '2026-05-15', '2026-05-15', '2026-05-15', '2026-05-15');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('a60a57ce-035f-4311-a7f2-a812f0d0dd3a', 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 2075.0, 2075.0, 0, 0, '2026-05-15');
UPDATE aparelhos SET venda_id = 'a60a57ce-035f-4311-a7f2-a812f0d0dd3a' WHERE id = '5b712df7-9900-4fa7-b711-4859bd4c50ef';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('1ec24dde-d7f3-4072-abd9-60c7dad84a42', 'a60a57ce-035f-4311-a7f2-a812f0d0dd3a', 'pix', 2075.0, '2026-05-15', '2026-05-15');

-- VENDA 154: IPHONE 13 PRO MAX 128GB AZUL SEMINOVO (15/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('798e3b3a-4bf1-432a-bc2b-58a58b5e0e58', 'IPHONE 13 PRO MAX 128GB AZUL', '359481988717053', 3070.0, 2600.0, 4, 'vendido', 'seminovo', '2026-05-15', '2026-05-15', '2026-05-15', '2026-05-15');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('efda1d2a-b508-4c72-aa4e-39ffe42f7a21', 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 3070.0, 3070.0, 0, 0, '2026-05-15');
UPDATE aparelhos SET venda_id = 'efda1d2a-b508-4c72-aa4e-39ffe42f7a21' WHERE id = '798e3b3a-4bf1-432a-bc2b-58a58b5e0e58';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('c70bbe45-d4d9-420d-9d73-086f6e3ac511', 'efda1d2a-b508-4c72-aa4e-39ffe42f7a21', 'pix', 3070.0, '2026-05-15', '2026-05-15');

-- VENDA 155: IPHONE 13 128GB PRETO SEMINOVO (16/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('7817f95b-22dc-4363-8356-4fb41e2bc32d', 'IPHONE 13 128GB PRETO', '352094671123856', 2000.0, 1800.0, 4, 'vendido', 'seminovo', '2026-05-16', '2026-05-16', '2026-05-16', '2026-05-16');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('4a2d0e6f-00ff-43da-a11e-64c52696d8b6', 4, 'e07d4d35-1381-4d4d-914d-8382a7456fdd', 'concluida', 'normal', 2000.0, 2000.0, 0, 0, '2026-05-16');
UPDATE aparelhos SET venda_id = '4a2d0e6f-00ff-43da-a11e-64c52696d8b6' WHERE id = '7817f95b-22dc-4363-8356-4fb41e2bc32d';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('8c33e75a-fe19-4383-be51-9c5153c223ff', '4a2d0e6f-00ff-43da-a11e-64c52696d8b6', 'cartao_credito', 2000.0, '2026-05-16', '2026-05-16');

-- VENDA 156: IPHONE 17 PRO MAX 256GB LARANJA NOVO (16/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('511b54f8-6e74-4d5b-acbf-8016cdf227d0', 'IPHONE 17 PRO MAX 256GB LARANJA', '355224258492153', 8300.0, 8170.0, 4, 'vendido', 'novo', '2026-05-16', '2026-05-16', '2026-05-16', '2026-05-16');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('5c86e194-36f5-4430-8b52-fb4282887bc0', 4, 'e07d4d35-1381-4d4d-914d-8382a7456fdd', 'concluida', 'normal', 8300.0, 8300.0, 0, 0, '2026-05-16');
UPDATE aparelhos SET venda_id = '5c86e194-36f5-4430-8b52-fb4282887bc0' WHERE id = '511b54f8-6e74-4d5b-acbf-8016cdf227d0';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('e0f00e2d-9a85-4d74-9fea-bd8d763827aa', '5c86e194-36f5-4430-8b52-fb4282887bc0', 'cartao_credito', 8300.0, '2026-05-16', '2026-05-16');

-- VENDA 157: IPHONE 16 PRO MAX 256GB  PRETO SEMINOVO (16/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('170d352f-5101-408e-934e-f2e1cc71e04d', 'IPHONE 16 PRO MAX 256GB  PRETO', '357590872352405', 5300.0, 5000.0, 19, 'vendido', 'seminovo', '2026-05-16', '2026-05-16', '2026-05-16', '2026-05-16');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('271f28e4-0763-464e-ba47-caf1413c2a5c', 19, 'b4269e60-eea2-4eba-a34d-db9591e0ec83', 'concluida', 'normal', 5300.0, 5300.0, 0, 0, '2026-05-16');
UPDATE aparelhos SET venda_id = '271f28e4-0763-464e-ba47-caf1413c2a5c' WHERE id = '170d352f-5101-408e-934e-f2e1cc71e04d';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('efb0c0cc-23ef-48a8-81f2-a39a6b62589e', '271f28e4-0763-464e-ba47-caf1413c2a5c', 'pix', 5300.0, '2026-05-16', '2026-05-16');

-- Troca: IPHONE 16 (R$ 128.00)
INSERT INTO aparelhos (id, modelo, valor_compra, loja_id, status, estado, observacoes, data_entrada, criado_em, atualizado_em)
VALUES ('f9626322-7215-4d7a-8454-62fa6edf3663', 'IPHONE 16', 128.0, 19, 'disponivel', 'usado', 'Entrada por troca - venda 271f28e4-0763-464e-ba47-caf1413c2a5c', '2026-05-16', '2026-05-16', '2026-05-16');

-- VENDA 158: IPHONE 17 PRO 256GB SILVER NOVO (16/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('df019613-a82f-4986-9d89-47b9735ebd59', 'IPHONE 17 PRO 256GB SILVER', '352001996607349', 7650.0, 7450.0, 19, 'vendido', 'novo', '2026-05-16', '2026-05-16', '2026-05-16', '2026-05-16');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('c186b6bc-101f-4315-990f-12d88628cf04', 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 7650.0, 7650.0, 0, 0, '2026-05-16');
UPDATE aparelhos SET venda_id = 'c186b6bc-101f-4315-990f-12d88628cf04' WHERE id = 'df019613-a82f-4986-9d89-47b9735ebd59';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('5a4821ff-36ff-46b4-b7c5-f44ffbbd6847', 'c186b6bc-101f-4315-990f-12d88628cf04', 'pix', 7650.0, '2026-05-16', '2026-05-16');

-- VENDA 159: IPHONE 15 PRO 256GB PRETO SEMINOVO (16/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('68172f89-2fda-4c5e-ad81-21431511cf5b', 'IPHONE 15 PRO 256GB PRETO', '359370793687157', 3721.0, 3400.0, 19, 'vendido', 'seminovo', '2026-05-16', '2026-05-16', '2026-05-16', '2026-05-16');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('88cb974a-43e9-45a5-bd28-2a95bf9b8728', 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 3721.0, 3721.0, 0, 0, '2026-05-16');
UPDATE aparelhos SET venda_id = '88cb974a-43e9-45a5-bd28-2a95bf9b8728' WHERE id = '68172f89-2fda-4c5e-ad81-21431511cf5b';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('3ae29fa6-43a1-4a20-812d-3f2439caaa7a', '88cb974a-43e9-45a5-bd28-2a95bf9b8728', 'pix', 3721.0, '2026-05-16', '2026-05-16');

-- VENDA 160: IPHONE 14 PRO MAX 128GB GOLD SEMINOVO (16/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('e2add627-d5e1-4f07-b7fa-1b07551f2929', 'IPHONE 14 PRO MAX 128GB GOLD', '360236730466835', 3350.0, 3150.0, 19, 'vendido', 'seminovo', '2026-05-16', '2026-05-16', '2026-05-16', '2026-05-16');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('c4b7e2a5-754a-404c-92ee-244bf7589742', 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 3350.0, 3350.0, 0, 0, '2026-05-16');
UPDATE aparelhos SET venda_id = 'c4b7e2a5-754a-404c-92ee-244bf7589742' WHERE id = 'e2add627-d5e1-4f07-b7fa-1b07551f2929';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('5f36b993-23aa-401d-aa6a-7aed99ea3247', 'c4b7e2a5-754a-404c-92ee-244bf7589742', 'pix', 3350.0, '2026-05-16', '2026-05-16');

-- Troca: IPH 13 PRO (R$ 2100.00)
INSERT INTO aparelhos (id, modelo, valor_compra, loja_id, status, estado, observacoes, data_entrada, criado_em, atualizado_em)
VALUES ('b4141c67-64dc-453e-a599-d046949bb54b', 'IPH 13 PRO', 2100.0, 19, 'disponivel', 'usado', 'Entrada por troca - venda c4b7e2a5-754a-404c-92ee-244bf7589742', '2026-05-16', '2026-05-16', '2026-05-16');

-- VENDA 161: IPHONE 16 PRO MAX 512GB DESERT SEMINOVO (16/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('02899ad0-de17-4b94-9024-2e84d2587e98', 'IPHONE 16 PRO MAX 512GB DESERT', '357626319666955', 5700.0, 5700.0, 20, 'vendido', 'seminovo', '2026-05-16', '2026-05-16', '2026-05-16', '2026-05-16');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('fb07fc42-25a6-4839-b72f-302c2c3c329b', 20, 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 'concluida', 'normal', 5700.0, 5700.0, 0, 0, '2026-05-16');
UPDATE aparelhos SET venda_id = 'fb07fc42-25a6-4839-b72f-302c2c3c329b' WHERE id = '02899ad0-de17-4b94-9024-2e84d2587e98';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('ca5a1734-82af-447d-85f6-7a876cd64df2', 'fb07fc42-25a6-4839-b72f-302c2c3c329b', 'pix', 5700.0, '2026-05-16', '2026-05-16');

-- VENDA 162: IPHONE 12 PRO 256GB PRETO SEMINOVO (16/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('7757bbf8-b538-4db3-aea1-dac67b8e3078', 'IPHONE 12 PRO 256GB PRETO', '356682116877353', 1900.0, 1900.0, 20, 'vendido', 'seminovo', '2026-05-16', '2026-05-16', '2026-05-16', '2026-05-16');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('8ba91f66-335e-4fb5-be2f-1eca94dda61b', 20, 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 'concluida', 'normal', 1900.0, 1900.0, 0, 0, '2026-05-16');
UPDATE aparelhos SET venda_id = '8ba91f66-335e-4fb5-be2f-1eca94dda61b' WHERE id = '7757bbf8-b538-4db3-aea1-dac67b8e3078';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('ca3d37cc-2269-45dd-b026-345aca221e3e', '8ba91f66-335e-4fb5-be2f-1eca94dda61b', 'pix', 1900.0, '2026-05-16', '2026-05-16');

-- VENDA 163: APPLE WATCH SE GEN 2 44MM MIDNIGHT NOVO (16/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('17e5364e-b01d-46d4-9452-ee4a4825e3a0', 'APPLE WATCH SE GEN 2 44MM MIDNIGHT', 'J4JVW5XVJV', 2050.0, 1800.0, 20, 'vendido', 'novo', '2026-05-16', '2026-05-16', '2026-05-16', '2026-05-16');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('b0f05de0-3d08-4885-a77e-c003af121441', 20, 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 'concluida', 'normal', 2050.0, 2050.0, 0, 0, '2026-05-16');
UPDATE aparelhos SET venda_id = 'b0f05de0-3d08-4885-a77e-c003af121441' WHERE id = '17e5364e-b01d-46d4-9452-ee4a4825e3a0';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('00e55fba-d0b3-47e5-9f2b-93f267e322a6', 'b0f05de0-3d08-4885-a77e-c003af121441', 'pix', 2050.0, '2026-05-16', '2026-05-16');

-- VENDA 164: IPHONE 11 PRO MAX 256GB VERDE SEMINOVO (16/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('3d1b6dde-6acc-4c1e-b920-52623a44d413', 'IPHONE 11 PRO MAX 256GB VERDE', '353906102560167', 1250.0, 900.0, 20, 'vendido', 'seminovo', '2026-05-16', '2026-05-16', '2026-05-16', '2026-05-16');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('058bb39c-59ba-4749-a371-03520591b16b', 20, '25e2da5b-9e76-4388-9890-7e22efd6940d', 'concluida', 'normal', 1250.0, 1250.0, 0, 0, '2026-05-16');
UPDATE aparelhos SET venda_id = '058bb39c-59ba-4749-a371-03520591b16b' WHERE id = '3d1b6dde-6acc-4c1e-b920-52623a44d413';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('68c1ed6f-2eb9-4317-9ba1-9e443048c586', '058bb39c-59ba-4749-a371-03520591b16b', 'pix', 1250.0, '2026-05-16', '2026-05-16');

-- VENDA 165: IPHONE 16 128GB VERDE SEMINOVO (16/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('b9f588cb-924f-4a2b-a4b8-77c47e9f7b65', 'IPHONE 16 128GB VERDE', '357884596142865', 3750.0, 3450.0, 20, 'vendido', 'seminovo', '2026-05-16', '2026-05-16', '2026-05-16', '2026-05-16');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('f10ccdad-655b-4c07-b2c6-13b172044746', 20, '25e2da5b-9e76-4388-9890-7e22efd6940d', 'concluida', 'normal', 3750.0, 3750.0, 0, 0, '2026-05-16');
UPDATE aparelhos SET venda_id = 'f10ccdad-655b-4c07-b2c6-13b172044746' WHERE id = 'b9f588cb-924f-4a2b-a4b8-77c47e9f7b65';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('7d1a2b30-d1bd-479e-98f5-ed373a2258af', 'f10ccdad-655b-4c07-b2c6-13b172044746', 'cartao_credito', 3750.0, '2026-05-16', '2026-05-16');

-- VENDA 166: IPHONE 15 128GB AZUL SEMINOVO (16/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('517033c8-5ad3-4295-942b-36c32b1f34a2', 'IPHONE 15 128GB AZUL', '350169642018823', 3000.0, 2750.0, 1, 'vendido', 'seminovo', '2026-05-16', '2026-05-16', '2026-05-16', '2026-05-16');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('8ba98c43-5d60-4919-a2eb-f21cdce24f72', 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 3000.0, 3000.0, 0, 0, '2026-05-16');
UPDATE aparelhos SET venda_id = '8ba98c43-5d60-4919-a2eb-f21cdce24f72' WHERE id = '517033c8-5ad3-4295-942b-36c32b1f34a2';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('7c6613cd-71c1-473f-9f7e-9fa40ed78c44', '8ba98c43-5d60-4919-a2eb-f21cdce24f72', 'pix', 3000.0, '2026-05-16', '2026-05-16');

-- VENDA 167: IPHONE 17 256GB PRETO LACRADO (16/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('0525303a-9b5d-4359-b42d-577af77f6b9c', 'IPHONE 17 256GB PRETO', '358748638760753', 5180.0, 4800.0, 1, 'vendido', 'novo', '2026-05-16', '2026-05-16', '2026-05-16', '2026-05-16');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('4f81b00d-797d-4b2b-8538-ccdcad9e11f0', 1, '9451cd9f-6770-4e32-aae8-c75fa675e818', 'concluida', 'normal', 5180.0, 5180.0, 0, 0, '2026-05-16');
UPDATE aparelhos SET venda_id = '4f81b00d-797d-4b2b-8538-ccdcad9e11f0' WHERE id = '0525303a-9b5d-4359-b42d-577af77f6b9c';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('0b856c03-84e6-4de2-a37f-0e5aecc7bc81', '4f81b00d-797d-4b2b-8538-ccdcad9e11f0', 'pix', 5180.0, '2026-05-16', '2026-05-16');

-- Troca: NO VALOR DE (R$ 1600.00)
INSERT INTO aparelhos (id, modelo, valor_compra, loja_id, status, estado, observacoes, data_entrada, criado_em, atualizado_em)
VALUES ('6be096d9-3b69-45e1-a324-23d859fe528b', 'NO VALOR DE', 1600.0, 1, 'disponivel', 'usado', 'Entrada por troca - venda 4f81b00d-797d-4b2b-8538-ccdcad9e11f0', '2026-05-16', '2026-05-16', '2026-05-16');

-- VENDA 168: IPHONE 17 256GB VERDE NOVO (17/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('b4a64ddd-3a27-4eb2-a6d9-8d147b47cd66', 'IPHONE 17 256GB VERDE', '358619228350786', 4950.0, 4800.0, 19, 'vendido', 'novo', '2026-05-17', '2026-05-17', '2026-05-17', '2026-05-17');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('63792f4b-1302-4565-a975-1795d3ef03b7', 19, 'b4269e60-eea2-4eba-a34d-db9591e0ec83', 'concluida', 'normal', 4950.0, 4950.0, 0, 0, '2026-05-17');
UPDATE aparelhos SET venda_id = '63792f4b-1302-4565-a975-1795d3ef03b7' WHERE id = 'b4a64ddd-3a27-4eb2-a6d9-8d147b47cd66';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('6e524183-f1ad-4eac-b3a3-0c6678243375', '63792f4b-1302-4565-a975-1795d3ef03b7', 'pix', 4950.0, '2026-05-17', '2026-05-17');

-- VENDA 169: IPAD 11° A16 128GB SILVER NOVO (17/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('c5c2622f-11e9-4964-af51-fd1b9c15214a', 'IPAD 11° A16 128GB SILVER', 'LC7KGJGWKT', 2300.0, 2160.0, 4, 'vendido', 'novo', '2026-05-17', '2026-05-17', '2026-05-17', '2026-05-17');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('f4187ee5-8c4f-4076-894e-1ec61d98ce49', 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 2300.0, 2300.0, 0, 0, '2026-05-17');
UPDATE aparelhos SET venda_id = 'f4187ee5-8c4f-4076-894e-1ec61d98ce49' WHERE id = 'c5c2622f-11e9-4964-af51-fd1b9c15214a';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('9d21d532-2f05-4956-a719-1a575b3d7f81', 'f4187ee5-8c4f-4076-894e-1ec61d98ce49', 'pix', 2300.0, '2026-05-17', '2026-05-17');

-- VENDA 170: IPHONE 17 256GB BRANCO NOVO (17/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('8a1f75d0-b4ba-4eb7-884e-538251b7ce92', 'IPHONE 17 256GB BRANCO', '358736463822764', 5240.0, 302.0, 4, 'vendido', 'novo', '2026-05-17', '2026-05-17', '2026-05-17', '2026-05-17');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('f0171c4a-9ae9-47e4-b1ab-84de62688a54', 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 5240.0, 5240.0, 0, 0, '2026-05-17');
UPDATE aparelhos SET venda_id = 'f0171c4a-9ae9-47e4-b1ab-84de62688a54' WHERE id = '8a1f75d0-b4ba-4eb7-884e-538251b7ce92';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('3a336748-7c4f-4587-9565-37e0843dab19', 'f0171c4a-9ae9-47e4-b1ab-84de62688a54', 'pix', 5240.0, '2026-05-17', '2026-05-17');

-- VENDA 171: IPHONE 13 PRO MAX VERDE 256GB SEMINOVO (17/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('8c67f7f2-bf2c-4e7e-9dd4-935e894f97d8', 'IPHONE 13 PRO MAX VERDE 256GB', '350249441757480', 3250.0, 2900.0, 19, 'vendido', 'seminovo', '2026-05-17', '2026-05-17', '2026-05-17', '2026-05-17');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('734ebdd4-ac31-423e-a1bb-c7882bb6280d', 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 3250.0, 3250.0, 0, 0, '2026-05-17');
UPDATE aparelhos SET venda_id = '734ebdd4-ac31-423e-a1bb-c7882bb6280d' WHERE id = '8c67f7f2-bf2c-4e7e-9dd4-935e894f97d8';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('51fcb40f-bab3-4fcf-a417-3699afba8e2a', '734ebdd4-ac31-423e-a1bb-c7882bb6280d', 'pix', 3250.0, '2026-05-17', '2026-05-17');

-- VENDA 172: IPHONE 17 256GB BRANCO NOVO (17/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('1e1a5acf-b816-4ffa-b4cd-e79038ddc8ca', 'IPHONE 17 256GB BRANCO', '352824562111135', 4950.0, 4750.0, 19, 'vendido', 'novo', '2026-05-17', '2026-05-17', '2026-05-17', '2026-05-17');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('e6244aba-f475-48c8-badc-cfc06372ef21', 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 4950.0, 4950.0, 0, 0, '2026-05-17');
UPDATE aparelhos SET venda_id = 'e6244aba-f475-48c8-badc-cfc06372ef21' WHERE id = '1e1a5acf-b816-4ffa-b4cd-e79038ddc8ca';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('27b15e7f-8fb3-426e-98c9-7b92f0fd765f', 'e6244aba-f475-48c8-badc-cfc06372ef21', 'cartao_credito', 4950.0, '2026-05-17', '2026-05-17');

-- VENDA 173: IPHONE 15 PRO MAX 256GB AZUL SEMINOVO (17/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('a3c6eda7-1508-429a-8804-7c987b13560d', 'IPHONE 15 PRO MAX 256GB AZUL', '355319547611678', 4200.0, 4000.0, 19, 'vendido', 'seminovo', '2026-05-17', '2026-05-17', '2026-05-17', '2026-05-17');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('eefdc90c-88f8-4399-909e-0aa674e86351', 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 4200.0, 4200.0, 0, 0, '2026-05-17');
UPDATE aparelhos SET venda_id = 'eefdc90c-88f8-4399-909e-0aa674e86351' WHERE id = 'a3c6eda7-1508-429a-8804-7c987b13560d';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('ce581e57-12cf-4350-8d92-21ab14acac43', 'eefdc90c-88f8-4399-909e-0aa674e86351', 'dinheiro', 4200.0, '2026-05-17', '2026-05-17');

-- VENDA 174: IPHONE 17 PRO 256GB SILVER NOVO (17/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('95d91771-0fbc-4f6e-a1fb-bec3de66eb5a', 'IPHONE 17 PRO 256GB SILVER', '354289638327115', 8000.0, 7450.0, 20, 'vendido', 'novo', '2026-05-17', '2026-05-17', '2026-05-17', '2026-05-17');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('45027664-d665-46be-8972-078697cf6ac2', 20, 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 'concluida', 'normal', 8000.0, 8000.0, 0, 0, '2026-05-17');
UPDATE aparelhos SET venda_id = '45027664-d665-46be-8972-078697cf6ac2' WHERE id = '95d91771-0fbc-4f6e-a1fb-bec3de66eb5a';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('700c0372-a91c-468e-8fcf-a7dd990d3138', '45027664-d665-46be-8972-078697cf6ac2', 'cartao_credito', 8000.0, '2026-05-17', '2026-05-17');

-- VENDA 175: POCO X7 PRO 512GB VERDE NOVO (17/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('ca679529-791e-48f8-9c4e-3e41d34e5cfb', 'POCO X7 PRO 512GB VERDE', '868311089900940', 2150.0, 1990.0, 19, 'vendido', 'novo', '2026-05-17', '2026-05-17', '2026-05-17', '2026-05-17');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('c8efb560-e7ec-4f00-a392-5f3d7bec944e', 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 2150.0, 2150.0, 0, 0, '2026-05-17');
UPDATE aparelhos SET venda_id = 'c8efb560-e7ec-4f00-a392-5f3d7bec944e' WHERE id = 'ca679529-791e-48f8-9c4e-3e41d34e5cfb';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('216d15a3-3fa3-48c0-87fc-ec538bfd6af3', 'c8efb560-e7ec-4f00-a392-5f3d7bec944e', 'cartao_credito', 2150.0, '2026-05-17', '2026-05-17');

-- VENDA 176: IPHONE 17 PRO 256GB BRANCO NOVO (17/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('5e60b448-9d96-42fa-8f6b-5f012488df5d', 'IPHONE 17 PRO 256GB BRANCO', '353739723292955', 7600.0, 7450.0, 19, 'vendido', 'novo', '2026-05-17', '2026-05-17', '2026-05-17', '2026-05-17');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('8595c079-4784-4460-8c7c-8f738fb4159c', 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 7600.0, 7600.0, 0, 0, '2026-05-17');
UPDATE aparelhos SET venda_id = '8595c079-4784-4460-8c7c-8f738fb4159c' WHERE id = '5e60b448-9d96-42fa-8f6b-5f012488df5d';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('8a0e0532-b730-4640-a3d4-f6f9675a24d0', '8595c079-4784-4460-8c7c-8f738fb4159c', 'pix', 7600.0, '2026-05-17', '2026-05-17');

-- VENDA 177: IPHONE 17 256GB NOVO BRANCO (17/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('074f5808-328a-43c6-a8fe-dbde8e7e11e8', 'IPHONE 17 256GB NOVO BRANCO', '352824563558946', 5130.0, 4750.0, 19, 'vendido', 'novo', '2026-05-17', '2026-05-17', '2026-05-17', '2026-05-17');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('d365ff14-02e7-4aff-8420-ba663bda7b5e', 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 5130.0, 5130.0, 0, 0, '2026-05-17');
UPDATE aparelhos SET venda_id = 'd365ff14-02e7-4aff-8420-ba663bda7b5e' WHERE id = '074f5808-328a-43c6-a8fe-dbde8e7e11e8';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('59a9d8df-d564-4111-ae00-d4454b52190c', 'd365ff14-02e7-4aff-8420-ba663bda7b5e', 'cartao_credito', 5130.0, '2026-05-17', '2026-05-17');

-- VENDA 178: IPHONE 17 PRO 256GB AZUL SEMINOVO (17/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('f64ede59-cabc-4bef-b79b-aec1b2b45407', 'IPHONE 17 PRO 256GB AZUL', '356839674078168', 6800.0, 6400.0, 19, 'vendido', 'seminovo', '2026-05-17', '2026-05-17', '2026-05-17', '2026-05-17');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('e3d60c60-d529-46a5-9511-5ae7ec6353dc', 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 6800.0, 6800.0, 0, 0, '2026-05-17');
UPDATE aparelhos SET venda_id = 'e3d60c60-d529-46a5-9511-5ae7ec6353dc' WHERE id = 'f64ede59-cabc-4bef-b79b-aec1b2b45407';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('de4bbba0-d482-4d28-9580-75efad7ea0a3', 'e3d60c60-d529-46a5-9511-5ae7ec6353dc', 'dinheiro', 6800.0, '2026-05-17', '2026-05-17');

-- Troca: IPH 15 (R$ 2900.00)
INSERT INTO aparelhos (id, modelo, valor_compra, loja_id, status, estado, observacoes, data_entrada, criado_em, atualizado_em)
VALUES ('8423c7fe-053c-43c6-8c72-3fa27c88e421', 'IPH 15', 2900.0, 19, 'disponivel', 'usado', 'Entrada por troca - venda e3d60c60-d529-46a5-9511-5ae7ec6353dc', '2026-05-17', '2026-05-17', '2026-05-17');

-- VENDA 179: IPHONE 13 PRO 256GB VERDE SEMINOVO (17/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('e015be41-13b7-4c74-a5eb-4ecef1b81366', 'IPHONE 13 PRO 256GB VERDE', '356649150793663', 2800.0, 2450.0, 20, 'vendido', 'seminovo', '2026-05-17', '2026-05-17', '2026-05-17', '2026-05-17');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('8b0696b5-a542-41da-b5f6-53c3681e6a8c', 20, '25e2da5b-9e76-4388-9890-7e22efd6940d', 'concluida', 'normal', 2800.0, 2800.0, 0, 0, '2026-05-17');
UPDATE aparelhos SET venda_id = '8b0696b5-a542-41da-b5f6-53c3681e6a8c' WHERE id = 'e015be41-13b7-4c74-a5eb-4ecef1b81366';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('1abeebba-f119-4aec-b11e-f9c05991a0b4', '8b0696b5-a542-41da-b5f6-53c3681e6a8c', 'pix', 2800.0, '2026-05-17', '2026-05-17');

-- VENDA 180: APPLE WATCH SERIE 11 ROSE GOLD NOVO (17/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('de32530a-3958-424d-a2df-11a2464dd5a2', 'APPLE WATCH SERIE 11 ROSE GOLD', 'KF97P7XLWD', 2500.0, 2250.0, 1, 'vendido', 'novo', '2026-05-17', '2026-05-17', '2026-05-17', '2026-05-17');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('33e199eb-4f0d-41ed-9578-a35e2ed2c4c5', 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 2500.0, 2500.0, 0, 0, '2026-05-17');
UPDATE aparelhos SET venda_id = '33e199eb-4f0d-41ed-9578-a35e2ed2c4c5' WHERE id = 'de32530a-3958-424d-a2df-11a2464dd5a2';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('36c75de7-503c-40dd-9ab1-a7c460fe51d2', '33e199eb-4f0d-41ed-9578-a35e2ed2c4c5', 'pix', 2500.0, '2026-05-17', '2026-05-17');

-- VENDA 181: IPAD 11 128GB AZUL NOVO (17/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('aa347bb7-5f72-4565-afb4-e8f7cacee81a', 'IPAD 11 128GB AZUL', 'H7DR2GQ4ND', 2210.0, 2090.0, 1, 'vendido', 'novo', '2026-05-17', '2026-05-17', '2026-05-17', '2026-05-17');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('25ff6122-3f44-43df-8c22-01e033421cab', 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 2210.0, 2210.0, 0, 0, '2026-05-17');
UPDATE aparelhos SET venda_id = '25ff6122-3f44-43df-8c22-01e033421cab' WHERE id = 'aa347bb7-5f72-4565-afb4-e8f7cacee81a';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('3122c544-e3d0-4446-8459-13eb8a2eb190', '25ff6122-3f44-43df-8c22-01e033421cab', 'pix', 2210.0, '2026-05-17', '2026-05-17');

-- VENDA 182: IPAD 11 128GB AMARELO NOVO (17/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('ce6335f1-21bf-43dc-8287-abf0492b951b', 'IPAD 11 128GB AMARELO', 'H9K6QY9X17', 2650.0, 2090.0, 1, 'vendido', 'novo', '2026-05-17', '2026-05-17', '2026-05-17', '2026-05-17');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('da3e3f28-91d3-4d25-a356-7db57890990f', 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 2650.0, 2650.0, 0, 0, '2026-05-17');
UPDATE aparelhos SET venda_id = 'da3e3f28-91d3-4d25-a356-7db57890990f' WHERE id = 'ce6335f1-21bf-43dc-8287-abf0492b951b';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('139e9b64-5102-4d12-a3fd-b5af58593062', 'da3e3f28-91d3-4d25-a356-7db57890990f', 'pix', 2650.0, '2026-05-17', '2026-05-17');

-- VENDA 183: IPHONE 12 128GB PRETO SEMINOVO (17/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('1bb59a01-0a56-49d7-8843-b097bc177829', 'IPHONE 12 128GB PRETO', '356427673422437', 1702.0, 1250.0, 1, 'vendido', 'seminovo', '2026-05-17', '2026-05-17', '2026-05-17', '2026-05-17');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('cb4ba1ea-aeac-454a-b86d-a8d87626fc19', 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 1702.0, 1702.0, 0, 0, '2026-05-17');
UPDATE aparelhos SET venda_id = 'cb4ba1ea-aeac-454a-b86d-a8d87626fc19' WHERE id = '1bb59a01-0a56-49d7-8843-b097bc177829';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('a59fa368-fc1e-42c0-9f75-5bcead38aebb', 'cb4ba1ea-aeac-454a-b86d-a8d87626fc19', 'pix', 1702.0, '2026-05-17', '2026-05-17');

-- VENDA 184: IPHONE 15 128GB ROSA SEMINOVO (17/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('af975b1c-d0e9-4fb3-ae67-3847a3bd7308', 'IPHONE 15 128GB ROSA', '356054491176662', 2896.0, 2750.0, 1, 'vendido', 'seminovo', '2026-05-17', '2026-05-17', '2026-05-17', '2026-05-17');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('d92554b1-c1ba-47dd-b836-81a7d28d9a96', 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 2896.0, 2896.0, 0, 0, '2026-05-17');
UPDATE aparelhos SET venda_id = 'd92554b1-c1ba-47dd-b836-81a7d28d9a96' WHERE id = 'af975b1c-d0e9-4fb3-ae67-3847a3bd7308';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('577f22a4-f962-4624-a382-55cb831282f7', 'd92554b1-c1ba-47dd-b836-81a7d28d9a96', 'pix', 2896.0, '2026-05-17', '2026-05-17');

-- VENDA 185: IPHONE 12 128GB AZUL SEMINOVO (17/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('6c2d227a-e816-478a-bb85-20ca7128478b', 'IPHONE 12 128GB AZUL', '357158819908414', 1450.0, 1250.0, 19, 'vendido', 'seminovo', '2026-05-17', '2026-05-17', '2026-05-17', '2026-05-17');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('a9cf8079-b1f7-401a-9153-5a5cb1277e24', 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 1450.0, 1450.0, 0, 0, '2026-05-17');
UPDATE aparelhos SET venda_id = 'a9cf8079-b1f7-401a-9153-5a5cb1277e24' WHERE id = '6c2d227a-e816-478a-bb85-20ca7128478b';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('c5f75317-2cc2-42fd-8ff7-00296906ea9e', 'a9cf8079-b1f7-401a-9153-5a5cb1277e24', 'pix', 1450.0, '2026-05-17', '2026-05-17');

-- VENDA 186: IPHONE 16 PRO 256GB NATURAL SEMINOVO (17/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('c61163d9-1bee-4d97-9ec8-33292c56f381', 'IPHONE 16 PRO 256GB NATURAL', '358282722955921', 4800.0, 4500.0, 1, 'vendido', 'seminovo', '2026-05-17', '2026-05-17', '2026-05-17', '2026-05-17');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('e22e5362-8f75-4644-992f-6e8b28565997', 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 4800.0, 4800.0, 0, 0, '2026-05-17');
UPDATE aparelhos SET venda_id = 'e22e5362-8f75-4644-992f-6e8b28565997' WHERE id = 'c61163d9-1bee-4d97-9ec8-33292c56f381';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('9d5a1964-4cc9-4452-bb1d-cc91567d4af1', 'e22e5362-8f75-4644-992f-6e8b28565997', 'pix', 4800.0, '2026-05-17', '2026-05-17');

-- VENDA 187: REDMI NOTE 15 5G 256GB PRETO NOVO (19/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('b4366ce0-58bc-42a2-95eb-4707912245ed', 'REDMI NOTE 15 5G 256GB PRETO', '865292085370085', 1565.0, 1320.0, 1, 'vendido', 'novo', '2026-05-19', '2026-05-19', '2026-05-19', '2026-05-19');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('912ddb7e-e907-4f7f-8d9f-afb22dc29ebf', 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 1565.0, 1565.0, 0, 0, '2026-05-19');
UPDATE aparelhos SET venda_id = '912ddb7e-e907-4f7f-8d9f-afb22dc29ebf' WHERE id = 'b4366ce0-58bc-42a2-95eb-4707912245ed';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('ec6512ef-48b7-4913-ac1b-221b6e88d5aa', '912ddb7e-e907-4f7f-8d9f-afb22dc29ebf', 'pix', 1565.0, '2026-05-19', '2026-05-19');

-- VENDA 188: NOTE 14 256GB PRETO LACRADO (19/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('ec04d561-9630-407c-bc14-fe2b355d2d20', 'NOTE 14 256GB PRETO', '864093078872249', 1200.0, 1050.0, 1, 'vendido', 'novo', '2026-05-19', '2026-05-19', '2026-05-19', '2026-05-19');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('5bb276e8-3253-41fb-9aeb-2bee8b8f86e8', 1, '9451cd9f-6770-4e32-aae8-c75fa675e818', 'concluida', 'normal', 1200.0, 1200.0, 0, 0, '2026-05-19');
UPDATE aparelhos SET venda_id = '5bb276e8-3253-41fb-9aeb-2bee8b8f86e8' WHERE id = 'ec04d561-9630-407c-bc14-fe2b355d2d20';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('e9975a60-ac9f-4c12-8e4f-439ee897544c', '5bb276e8-3253-41fb-9aeb-2bee8b8f86e8', 'pix', 1200.0, '2026-05-19', '2026-05-19');

-- VENDA 189: IPHONE 13 PRO MAX 128GB VERDE SEMINOVO (19/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('777fd9d7-3351-4904-8fa6-93324de9865d', 'IPHONE 13 PRO MAX 128GB VERDE', '350019049630201', 2939.0, 2600.0, 4, 'vendido', 'seminovo', '2026-05-19', '2026-05-19', '2026-05-19', '2026-05-19');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('c0258d56-4dff-4ef3-891f-6989cf10ae80', 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 2939.0, 2939.0, 0, 0, '2026-05-19');
UPDATE aparelhos SET venda_id = 'c0258d56-4dff-4ef3-891f-6989cf10ae80' WHERE id = '777fd9d7-3351-4904-8fa6-93324de9865d';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('87cfcc81-abd9-402d-aa08-4cd114289fef', 'c0258d56-4dff-4ef3-891f-6989cf10ae80', 'pix', 2939.0, '2026-05-19', '2026-05-19');

-- VENDA 190: BOOMBOX 4 LARANJA NOVO (19/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('c90f8e9d-2d7c-411f-bb5d-cb2500b2b395', 'BOOMBOX 4 LARANJA', 'TL1973-BQ0009594', 2500.0, 2390.0, 4, 'vendido', 'novo', '2026-05-19', '2026-05-19', '2026-05-19', '2026-05-19');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('7897b476-ca1d-4d82-a0ec-9f1a1d0449ac', 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 2500.0, 2500.0, 0, 0, '2026-05-19');
UPDATE aparelhos SET venda_id = '7897b476-ca1d-4d82-a0ec-9f1a1d0449ac' WHERE id = 'c90f8e9d-2d7c-411f-bb5d-cb2500b2b395';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('94d56d7e-cc58-4db5-801a-7269ecff8e32', '7897b476-ca1d-4d82-a0ec-9f1a1d0449ac', 'pix', 2500.0, '2026-05-19', '2026-05-19');

-- VENDA 191: IPAD AIR M3 11 256GB AZUL NOVO (19/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('514cd95a-e74d-43d5-9467-0cfc4c5ca236', 'IPAD AIR M3 11 256GB AZUL', 'M4C404M6R6', 5200.0, 5050.0, 4, 'vendido', 'novo', '2026-05-19', '2026-05-19', '2026-05-19', '2026-05-19');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('6b6a93be-7347-40a1-b3c6-bc68e225ed6f', 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 5200.0, 5200.0, 0, 0, '2026-05-19');
UPDATE aparelhos SET venda_id = '6b6a93be-7347-40a1-b3c6-bc68e225ed6f' WHERE id = '514cd95a-e74d-43d5-9467-0cfc4c5ca236';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('62e199ad-7cab-45cc-bd37-a73a320888db', '6b6a93be-7347-40a1-b3c6-bc68e225ed6f', 'cartao_credito', 5200.0, '2026-05-19', '2026-05-19');

-- VENDA 192: IPHONE 17 PRO MAX AZUL NOVO (19/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('7b2ffc19-c759-4344-9ff6-3b49627da034', 'IPHONE 17 PRO MAX AZUL', 'CQHPQG449Y', 8300.0, 8140.0, 4, 'vendido', 'novo', '2026-05-19', '2026-05-19', '2026-05-19', '2026-05-19');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('e351c928-95dc-4f32-9152-6ef79bbe80c6', 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 8300.0, 8300.0, 0, 0, '2026-05-19');
UPDATE aparelhos SET venda_id = 'e351c928-95dc-4f32-9152-6ef79bbe80c6' WHERE id = '7b2ffc19-c759-4344-9ff6-3b49627da034';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('23f27011-625b-4919-b069-befe11d13f13', 'e351c928-95dc-4f32-9152-6ef79bbe80c6', 'cartao_credito', 8300.0, '2026-05-19', '2026-05-19');

-- VENDA 193: IPAD 11° (A16) 128GB AMARELO NOVO (19/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('353619f3-c131-409f-9697-2060e7e9d168', 'IPAD 11° (A16) 128GB AMARELO', NULL, 2297.0, 2090.0, 4, 'vendido', 'novo', '2026-05-19', '2026-05-19', '2026-05-19', '2026-05-19');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('b526e861-6f6a-4563-92cc-7276079aee3a', 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 2297.0, 2297.0, 0, 0, '2026-05-19');
UPDATE aparelhos SET venda_id = 'b526e861-6f6a-4563-92cc-7276079aee3a' WHERE id = '353619f3-c131-409f-9697-2060e7e9d168';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('13acf39a-8f1f-4cd1-8b97-3d9676523e74', 'b526e861-6f6a-4563-92cc-7276079aee3a', 'cartao_credito', 2297.0, '2026-05-19', '2026-05-19');

-- VENDA 194: IPHONE 17 PRO MAX 512GB AZUL NOVO (19/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('77853c0a-7ba3-476e-a608-4d90b9b61996', 'IPHONE 17 PRO MAX 512GB AZUL', '357329447819436', 9801.0, 9050.0, 1, 'vendido', 'novo', '2026-05-19', '2026-05-19', '2026-05-19', '2026-05-19');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('16bc7691-321f-4394-9723-739165b9d36a', 1, '0dd2c938-c6dd-4f5d-aac5-ed045ee5d2fb', 'concluida', 'normal', 9801.0, 9801.0, 0, 0, '2026-05-19');
UPDATE aparelhos SET venda_id = '16bc7691-321f-4394-9723-739165b9d36a' WHERE id = '77853c0a-7ba3-476e-a608-4d90b9b61996';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('fa43a93c-2d51-4864-bf6d-4038c177ddd7', '16bc7691-321f-4394-9723-739165b9d36a', 'cartao_credito', 9801.0, '2026-05-19', '2026-05-19');

-- VENDA 195: IPHONE 16 PRO MAX 256GB PRETO SEMINOVO (19/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('39c51f76-c2a8-49bd-bf6f-403846a17bba', 'IPHONE 16 PRO MAX 256GB PRETO', '355138326274957', 5400.0, 5150.0, 1, 'vendido', 'seminovo', '2026-05-19', '2026-05-19', '2026-05-19', '2026-05-19');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('31a3fca6-9d6b-48c1-b2f6-15b71bd79432', 1, '0dd2c938-c6dd-4f5d-aac5-ed045ee5d2fb', 'concluida', 'normal', 5400.0, 5400.0, 0, 0, '2026-05-19');
UPDATE aparelhos SET venda_id = '31a3fca6-9d6b-48c1-b2f6-15b71bd79432' WHERE id = '39c51f76-c2a8-49bd-bf6f-403846a17bba';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('b9a1fbb1-bfda-4b5e-85f9-879344f4a52f', '31a3fca6-9d6b-48c1-b2f6-15b71bd79432', 'dinheiro', 5400.0, '2026-05-19', '2026-05-19');

-- VENDA 196: IPHONE 16 128GB PRETO NOVO (19/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('eee4bfe6-6366-47ac-8fbf-1d318e1819ec', 'IPHONE 16 128GB PRETO', '3594', 4395.0, 4050.0, 4, 'vendido', 'novo', '2026-05-19', '2026-05-19', '2026-05-19', '2026-05-19');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('63c1adcf-1fda-4107-a8fa-b86664730b04', 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 4395.0, 4395.0, 0, 0, '2026-05-19');
UPDATE aparelhos SET venda_id = '63c1adcf-1fda-4107-a8fa-b86664730b04' WHERE id = 'eee4bfe6-6366-47ac-8fbf-1d318e1819ec';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('3ddec4eb-12bd-4f27-8435-53b367abe38b', '63c1adcf-1fda-4107-a8fa-b86664730b04', 'cartao_credito', 4395.0, '2026-05-19', '2026-05-19');

-- Troca: 13 SEMINOVO (R$ 1600.00)
INSERT INTO aparelhos (id, modelo, valor_compra, loja_id, status, estado, observacoes, data_entrada, criado_em, atualizado_em)
VALUES ('e2ba7a8b-6d3e-49d5-9329-f992c671b685', '13 SEMINOVO', 1600.0, 4, 'disponivel', 'novo', 'Entrada por troca - venda 63c1adcf-1fda-4107-a8fa-b86664730b04', '2026-05-19', '2026-05-19', '2026-05-19');

-- VENDA 197: IPAD 11 (A16) 128GB ROSA NOVO (19/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('09ab43c9-aa86-4f6b-b9c3-48aa34c27d60', 'IPAD 11 (A16) 128GB ROSA', 'JOK9N9RQM5', 2375.0, 2090.0, 4, 'vendido', 'novo', '2026-05-19', '2026-05-19', '2026-05-19', '2026-05-19');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('3252037c-f7e0-4c2f-8a45-854b46e2e2a6', 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 2375.0, 2375.0, 0, 0, '2026-05-19');
UPDATE aparelhos SET venda_id = '3252037c-f7e0-4c2f-8a45-854b46e2e2a6' WHERE id = '09ab43c9-aa86-4f6b-b9c3-48aa34c27d60';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('166e0466-efa8-400f-bded-9a559d3d0310', '3252037c-f7e0-4c2f-8a45-854b46e2e2a6', 'cartao_credito', 2375.0, '2026-05-19', '2026-05-19');

-- VENDA 198: IPHONE 13 128GB PRETO NOVO (19/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('3eabb64a-1d50-45d5-8455-d4a6d650ad1b', 'IPHONE 13 128GB PRETO', '353306207461637', 2850.0, 2700.0, 19, 'vendido', 'novo', '2026-05-19', '2026-05-19', '2026-05-19', '2026-05-19');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('0ff45110-bce6-493a-a726-8e9b1e4d4db7', 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 2850.0, 2850.0, 0, 0, '2026-05-19');
UPDATE aparelhos SET venda_id = '0ff45110-bce6-493a-a726-8e9b1e4d4db7' WHERE id = '3eabb64a-1d50-45d5-8455-d4a6d650ad1b';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('62e4d89b-4ed1-44e9-8b32-7def3ecebabf', '0ff45110-bce6-493a-a726-8e9b1e4d4db7', 'pix', 2850.0, '2026-05-19', '2026-05-19');

-- VENDA 199: IPHONE 15 256GB PRETO SEMINOVO (19/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('7c036875-dd09-452a-877d-dfc6eddc8aa7', 'IPHONE 15 256GB PRETO', '356942572731144', 3200.0, 2900.0, 19, 'vendido', 'seminovo', '2026-05-19', '2026-05-19', '2026-05-19', '2026-05-19');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('35b693c5-5cc7-4cfd-897c-6d5b7eb1b80a', 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 3200.0, 3200.0, 0, 0, '2026-05-19');
UPDATE aparelhos SET venda_id = '35b693c5-5cc7-4cfd-897c-6d5b7eb1b80a' WHERE id = '7c036875-dd09-452a-877d-dfc6eddc8aa7';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('6f8c9fc6-3f1c-41d3-b61f-52fd64277f9a', '35b693c5-5cc7-4cfd-897c-6d5b7eb1b80a', 'pix', 3200.0, '2026-05-19', '2026-05-19');

-- Troca: IPH 13 128GB PRETO (R$ 1700.00)
INSERT INTO aparelhos (id, modelo, valor_compra, loja_id, status, estado, observacoes, data_entrada, criado_em, atualizado_em)
VALUES ('0089a810-d1ba-4379-8524-6f0b6c1e6a74', 'IPH 13 128GB PRETO', 1700.0, 19, 'disponivel', 'usado', 'Entrada por troca - venda 35b693c5-5cc7-4cfd-897c-6d5b7eb1b80a', '2026-05-19', '2026-05-19', '2026-05-19');

-- VENDA 200: IPHONE 17 PRO SILVER 256GB SEMINOVO (19/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('b8cbea02-1445-4895-a9f2-57eff229449f', 'IPHONE 17 PRO SILVER 256GB', '356697786132668', 6800.0, 6100.0, 19, 'vendido', 'seminovo', '2026-05-19', '2026-05-19', '2026-05-19', '2026-05-19');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('a5126435-beb3-4c58-9f53-d28aad8ce0c9', 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 6800.0, 6800.0, 0, 0, '2026-05-19');
UPDATE aparelhos SET venda_id = 'a5126435-beb3-4c58-9f53-d28aad8ce0c9' WHERE id = 'b8cbea02-1445-4895-a9f2-57eff229449f';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('5b75c802-aec1-4395-bafe-2b857cd79fda', 'a5126435-beb3-4c58-9f53-d28aad8ce0c9', 'dinheiro', 6800.0, '2026-05-19', '2026-05-19');

-- Troca: IPH 15 PRO 256GB (R$ 3400.00)
INSERT INTO aparelhos (id, modelo, valor_compra, loja_id, status, estado, observacoes, data_entrada, criado_em, atualizado_em)
VALUES ('a0daf23f-6d52-4ad8-a06a-d5fbf4393ef3', 'IPH 15 PRO 256GB', 3400.0, 19, 'disponivel', 'usado', 'Entrada por troca - venda a5126435-beb3-4c58-9f53-d28aad8ce0c9', '2026-05-19', '2026-05-19', '2026-05-19');

-- VENDA 201: IPHONE 13 PRO MAX 256GB DOURADO SEMINOVO (19/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('c3ed69e5-9c71-4d1d-ad50-0f0542713f54', 'IPHONE 13 PRO MAX 256GB DOURADO', '351596240328544', 3250.0, 2900.0, 20, 'vendido', 'seminovo', '2026-05-19', '2026-05-19', '2026-05-19', '2026-05-19');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('54e9f308-6c7b-4c88-bd1c-7969b455881a', 20, '25e2da5b-9e76-4388-9890-7e22efd6940d', 'concluida', 'normal', 3250.0, 3250.0, 0, 0, '2026-05-19');
UPDATE aparelhos SET venda_id = '54e9f308-6c7b-4c88-bd1c-7969b455881a' WHERE id = 'c3ed69e5-9c71-4d1d-ad50-0f0542713f54';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('252f16e4-a0cf-467e-9ef4-991e99bccaa9', '54e9f308-6c7b-4c88-bd1c-7969b455881a', 'dinheiro', 3250.0, '2026-05-19', '2026-05-19');

-- VENDA 202: IPAD 11 128GB SILVER SEMINOVO (19/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('0a0845fb-1cb5-4c12-80df-a333ab68e0d1', 'IPAD 11 128GB SILVER', 'DY02NX9J6V', 2490.0, 2160.0, 20, 'vendido', 'seminovo', '2026-05-19', '2026-05-19', '2026-05-19', '2026-05-19');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('10b1ed40-4b3a-418c-985e-130c648e5587', 20, '25e2da5b-9e76-4388-9890-7e22efd6940d', 'concluida', 'normal', 2490.0, 2490.0, 0, 0, '2026-05-19');
UPDATE aparelhos SET venda_id = '10b1ed40-4b3a-418c-985e-130c648e5587' WHERE id = '0a0845fb-1cb5-4c12-80df-a333ab68e0d1';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('a461b540-0c2b-427e-b98e-ca029e2a9f63', '10b1ed40-4b3a-418c-985e-130c648e5587', 'dinheiro', 2490.0, '2026-05-19', '2026-05-19');

-- VENDA 203: APPLE PENCIL USB-C BRANCO SEMINOVO (19/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('3848de5b-f11e-4c1d-a632-97156ab7827e', 'APPLE PENCIL USB-C BRANCO', 'DV2GQYL2VR', 780.0, 630.0, 20, 'vendido', 'seminovo', '2026-05-19', '2026-05-19', '2026-05-19', '2026-05-19');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('d7ec5f6a-ff0f-4983-8b30-bbc31762ede8', 20, '25e2da5b-9e76-4388-9890-7e22efd6940d', 'concluida', 'normal', 780.0, 780.0, 0, 0, '2026-05-19');
UPDATE aparelhos SET venda_id = 'd7ec5f6a-ff0f-4983-8b30-bbc31762ede8' WHERE id = '3848de5b-f11e-4c1d-a632-97156ab7827e';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('b2b94355-05fd-4f7f-a8d5-6bba82502b54', 'd7ec5f6a-ff0f-4983-8b30-bbc31762ede8', 'dinheiro', 780.0, '2026-05-19', '2026-05-19');

-- VENDA 204: IPHONE XS 256GB PRETO SEMINOVO (19/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('2411422b-8c09-4905-8ad3-663d88f2fbcd', 'IPHONE XS 256GB PRETO', '353048093488114', 775.0, 350.0, 20, 'vendido', 'seminovo', '2026-05-19', '2026-05-19', '2026-05-19', '2026-05-19');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('0857799c-8d52-4ce7-895a-55ee4a855289', 20, '25e2da5b-9e76-4388-9890-7e22efd6940d', 'concluida', 'normal', 775.0, 775.0, 0, 0, '2026-05-19');
UPDATE aparelhos SET venda_id = '0857799c-8d52-4ce7-895a-55ee4a855289' WHERE id = '2411422b-8c09-4905-8ad3-663d88f2fbcd';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('aadc6146-10d6-47ee-bd5c-a1f8b80e49e3', '0857799c-8d52-4ce7-895a-55ee4a855289', 'pix', 775.0, '2026-05-19', '2026-05-19');

-- VENDA 205: IPHONE 12 PRO 256GB BRANCO SEMINOVO (19/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('cb62287e-b962-4ac9-b8a4-e81e825b326d', 'IPHONE 12 PRO 256GB BRANCO', '353074114042706', 2200.0, 1900.0, 19, 'vendido', 'seminovo', '2026-05-19', '2026-05-19', '2026-05-19', '2026-05-19');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('38eea20e-7096-448a-abc1-2a1db9ee52cf', 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 2200.0, 2200.0, 0, 0, '2026-05-19');
UPDATE aparelhos SET venda_id = '38eea20e-7096-448a-abc1-2a1db9ee52cf' WHERE id = 'cb62287e-b962-4ac9-b8a4-e81e825b326d';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('95bb3219-ed4d-42b9-9649-6fd06accc600', '38eea20e-7096-448a-abc1-2a1db9ee52cf', 'pix', 2200.0, '2026-05-19', '2026-05-19');

-- VENDA 206: IPHONE 17 PRO MAX LARANJA 2 TB NOVO (19/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('4b3bc05f-0c66-4f6c-bc20-700c4d181069', 'IPHONE 17 PRO MAX LARANJA 2 TB', '350025974181243', 12719.0, 11800.0, 1, 'vendido', 'novo', '2026-05-19', '2026-05-19', '2026-05-19', '2026-05-19');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('3ecc8c48-9176-430c-824e-ee79e67984cd', 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 12719.0, 12719.0, 0, 0, '2026-05-19');
UPDATE aparelhos SET venda_id = '3ecc8c48-9176-430c-824e-ee79e67984cd' WHERE id = '4b3bc05f-0c66-4f6c-bc20-700c4d181069';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('8dd4231c-8390-4ae0-adb5-732e8c99d15f', '3ecc8c48-9176-430c-824e-ee79e67984cd', 'pix', 12719.0, '2026-05-19', '2026-05-19');

-- VENDA 207: BOOMBOX 4 PRETA SEMINOVO (20/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('56d70893-ecec-4e6f-a21f-2284dd19f167', 'BOOMBOX 4 PRETA', 'TL1876-JP0086240', 2350.0, 2350.0, 4, 'vendido', 'seminovo', '2026-05-20', '2026-05-20', '2026-05-20', '2026-05-20');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('58a6bd02-aef9-4c69-ac5e-05c299540031', 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 2350.0, 2350.0, 0, 0, '2026-05-20');
UPDATE aparelhos SET venda_id = '58a6bd02-aef9-4c69-ac5e-05c299540031' WHERE id = '56d70893-ecec-4e6f-a21f-2284dd19f167';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('cad4848f-b072-4d18-a1e9-55d96e95778d', '58a6bd02-aef9-4c69-ac5e-05c299540031', 'dinheiro', 2350.0, '2026-05-20', '2026-05-20');

-- VENDA 208: IPHONE 14 128GB PRETA SEMINOVO (20/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('6db0cc3f-06f4-4d8f-8409-490a1a5de036', 'IPHONE 14 128GB PRETA', '359014536509969', 2350.0, 2000.0, 1, 'vendido', 'seminovo', '2026-05-20', '2026-05-20', '2026-05-20', '2026-05-20');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('b0dbd490-9d64-4b7e-92e1-2327b9a75ea8', 1, '9451cd9f-6770-4e32-aae8-c75fa675e818', 'concluida', 'normal', 2350.0, 2350.0, 0, 0, '2026-05-20');
UPDATE aparelhos SET venda_id = 'b0dbd490-9d64-4b7e-92e1-2327b9a75ea8' WHERE id = '6db0cc3f-06f4-4d8f-8409-490a1a5de036';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('b990162c-745f-4843-ae68-16721b57e966', 'b0dbd490-9d64-4b7e-92e1-2327b9a75ea8', 'pix', 2350.0, '2026-05-20', '2026-05-20');

-- VENDA 209: BOOMBOX 4 LARANJA NOVO (20/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('cde9d18f-6e6f-424a-9d07-e95291fb253e', 'BOOMBOX 4 LARANJA', 'TL1973-BQ0009916', 2450.0, 2390.0, 19, 'vendido', 'novo', '2026-05-20', '2026-05-20', '2026-05-20', '2026-05-20');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('914831a5-a4a3-4659-b476-8be50c0fbcba', 19, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 2450.0, 2450.0, 0, 0, '2026-05-20');
UPDATE aparelhos SET venda_id = '914831a5-a4a3-4659-b476-8be50c0fbcba' WHERE id = 'cde9d18f-6e6f-424a-9d07-e95291fb253e';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('adc89b2f-5e60-4076-83bb-7cfe16abc691', '914831a5-a4a3-4659-b476-8be50c0fbcba', 'pix', 2450.0, '2026-05-20', '2026-05-20');

-- VENDA 210: REDMI PAD 2 256GB PRETO NOVO (20/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('fd0f9fbb-ce2b-4c14-95ad-e631511f4221', 'REDMI PAD 2 256GB PRETO', '65577/W6N400397', 1500.0, 1200.0, 20, 'vendido', 'novo', '2026-05-20', '2026-05-20', '2026-05-20', '2026-05-20');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('bb81e70d-f89b-4723-ab05-16f03ce931c6', 20, 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 'concluida', 'normal', 1500.0, 1500.0, 0, 0, '2026-05-20');
UPDATE aparelhos SET venda_id = 'bb81e70d-f89b-4723-ab05-16f03ce931c6' WHERE id = 'fd0f9fbb-ce2b-4c14-95ad-e631511f4221';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('d09e48ef-1e33-4a02-aff5-e5e45238dbe3', 'bb81e70d-f89b-4723-ab05-16f03ce931c6', 'cartao_credito', 1500.0, '2026-05-20', '2026-05-20');

-- VENDA 211: IPHONE 17 PRO MAX 256GB AZUL NOVO (20/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('4c35a504-cba6-4966-8cca-8dcb1a831a48', 'IPHONE 17 PRO MAX 256GB AZUL', '357247257122859', 8400.0, 8000.0, 1, 'vendido', 'novo', '2026-05-20', '2026-05-20', '2026-05-20', '2026-05-20');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('1bcb1fd5-4ade-47e7-aa98-27f045d4df8d', 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 8400.0, 8400.0, 0, 0, '2026-05-20');
UPDATE aparelhos SET venda_id = '1bcb1fd5-4ade-47e7-aa98-27f045d4df8d' WHERE id = '4c35a504-cba6-4966-8cca-8dcb1a831a48';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('6e778ba5-0fd4-4008-be80-e886fad9460a', '1bcb1fd5-4ade-47e7-aa98-27f045d4df8d', 'pix', 8400.0, '2026-05-20', '2026-05-20');

-- Troca: IPH 11 PRO MAX 512GB (R$ 500.00)
INSERT INTO aparelhos (id, modelo, valor_compra, loja_id, status, estado, observacoes, data_entrada, criado_em, atualizado_em)
VALUES ('5a40c124-7719-42b9-b6ca-6ca64108db1c', 'IPH 11 PRO MAX 512GB', 500.0, 1, 'disponivel', 'usado', 'Entrada por troca - venda 1bcb1fd5-4ade-47e7-aa98-27f045d4df8d', '2026-05-20', '2026-05-20', '2026-05-20');

-- VENDA 212: IPAD 11 128GB SILVER NOVO (20/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('51a24036-d43e-40c1-b8cf-5696fad64078', 'IPAD 11 128GB SILVER', 'MPNH609W5X', 2850.0, 2160.0, 1, 'vendido', 'novo', '2026-05-20', '2026-05-20', '2026-05-20', '2026-05-20');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('3efe4bdd-67c5-41a7-a0ff-22fb353b04bf', 1, '1d12d555-68e9-45f8-bfc0-a35a1d8d7920', 'concluida', 'normal', 2850.0, 2850.0, 0, 0, '2026-05-20');
UPDATE aparelhos SET venda_id = '3efe4bdd-67c5-41a7-a0ff-22fb353b04bf' WHERE id = '51a24036-d43e-40c1-b8cf-5696fad64078';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('b05a99d0-91e6-485c-8e03-d6647bbbf5e4', '3efe4bdd-67c5-41a7-a0ff-22fb353b04bf', 'dinheiro', 2850.0, '2026-05-20', '2026-05-20');

-- VENDA 213: IPHONE 11 128GB VERMELHO SEMINOVO (20/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('473aa249-6012-49d4-8c59-5c30f753d7c5', 'IPHONE 11 128GB VERMELHO', '352991115545133', 1050.0, 800.0, 20, 'vendido', 'seminovo', '2026-05-20', '2026-05-20', '2026-05-20', '2026-05-20');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('73efcd85-edb8-43be-b537-9cb79960aa6d', 20, '25e2da5b-9e76-4388-9890-7e22efd6940d', 'concluida', 'normal', 1050.0, 1050.0, 0, 0, '2026-05-20');
UPDATE aparelhos SET venda_id = '73efcd85-edb8-43be-b537-9cb79960aa6d' WHERE id = '473aa249-6012-49d4-8c59-5c30f753d7c5';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('e641f984-045e-439a-9213-b52152e144b7', '73efcd85-edb8-43be-b537-9cb79960aa6d', 'pix', 1050.0, '2026-05-20', '2026-05-20');

-- VENDA 214: POCO X8 PRO MAX 512GB PRETO SEMINOVO (20/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('f1ba4e1f-c7ea-465d-bc21-a9d6f798cd92', 'POCO X8 PRO MAX 512GB PRETO', '860534087542582', 3300.0, 3200.0, 19, 'vendido', 'seminovo', '2026-05-20', '2026-05-20', '2026-05-20', '2026-05-20');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('6b27ecca-8ef8-4cdc-ae22-8ed7f309bb8f', 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 3300.0, 3300.0, 0, 0, '2026-05-20');
UPDATE aparelhos SET venda_id = '6b27ecca-8ef8-4cdc-ae22-8ed7f309bb8f' WHERE id = 'f1ba4e1f-c7ea-465d-bc21-a9d6f798cd92';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('48becb04-40f2-434a-ad77-ca881f55d708', '6b27ecca-8ef8-4cdc-ae22-8ed7f309bb8f', 'pix', 3300.0, '2026-05-20', '2026-05-20');

-- VENDA 215: MAC AIR M5 16 512GB SILVER NOVO (20/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('f1acdd7d-6afe-4206-9fd8-b0648bf0afc9', 'MAC AIR M5 16 512GB SILVER', 'JYW40659KX', 7550.0, 6800.0, 19, 'vendido', 'novo', '2026-05-20', '2026-05-20', '2026-05-20', '2026-05-20');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('a2d86cd9-536d-4d21-a19f-595f960f2b9a', 19, '85743f3e-1b32-49c0-9d9e-c16afd690f7d', 'concluida', 'normal', 7550.0, 7550.0, 0, 0, '2026-05-20');
UPDATE aparelhos SET venda_id = 'a2d86cd9-536d-4d21-a19f-595f960f2b9a' WHERE id = 'f1acdd7d-6afe-4206-9fd8-b0648bf0afc9';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('7144df64-8344-4709-b013-a1fd62d67760', 'a2d86cd9-536d-4d21-a19f-595f960f2b9a', 'pix', 7550.0, '2026-05-20', '2026-05-20');

-- VENDA 216: REDMI PAD 2 256GB SPACE GRAY NOVO (21/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('07d9fc4c-9512-43e1-9135-1e40e89ce063', 'REDMI PAD 2 256GB SPACE GRAY', '65577/W6PT05147', 1655.0, 1200.0, 19, 'vendido', 'novo', '2026-05-21', '2026-05-21', '2026-05-21', '2026-05-21');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('91f5d57f-2b55-4d9d-8401-d447e308d8b6', 19, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 1655.0, 1655.0, 0, 0, '2026-05-21');
UPDATE aparelhos SET venda_id = '91f5d57f-2b55-4d9d-8401-d447e308d8b6' WHERE id = '07d9fc4c-9512-43e1-9135-1e40e89ce063';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('28b89f0c-a39a-4c98-9a89-b97067aa1f56', '91f5d57f-2b55-4d9d-8401-d447e308d8b6', 'pix', 1655.0, '2026-05-21', '2026-05-21');

-- VENDA 217: IPHONE 17 PRO 256GB AZUL NOVO (21/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('a3ad87d3-a23f-4d05-bf06-bfa62ec4391b', 'IPHONE 17 PRO 256GB AZUL', '359477633542185', 7940.0, 7300.0, 1, 'vendido', 'novo', '2026-05-21', '2026-05-21', '2026-05-21', '2026-05-21');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('b3fb80b0-218d-4285-bd17-e12c6545371f', 1, '0dd2c938-c6dd-4f5d-aac5-ed045ee5d2fb', 'concluida', 'normal', 7940.0, 7940.0, 0, 0, '2026-05-21');
UPDATE aparelhos SET venda_id = 'b3fb80b0-218d-4285-bd17-e12c6545371f' WHERE id = 'a3ad87d3-a23f-4d05-bf06-bfa62ec4391b';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('aaaf8a48-7fda-40b4-8fcc-44917ef3f1fc', 'b3fb80b0-218d-4285-bd17-e12c6545371f', 'cartao_credito', 7940.0, '2026-05-21', '2026-05-21');

-- Troca: IPH 12 PRO MAX 128GB (R$ 1900.00)
INSERT INTO aparelhos (id, modelo, valor_compra, loja_id, status, estado, observacoes, data_entrada, criado_em, atualizado_em)
VALUES ('c607e9f9-05e0-4874-bb98-efe17963b076', 'IPH 12 PRO MAX 128GB', 1900.0, 1, 'disponivel', 'usado', 'Entrada por troca - venda b3fb80b0-218d-4285-bd17-e12c6545371f', '2026-05-21', '2026-05-21', '2026-05-21');

-- VENDA 218: IPHONE 17 PRO 256GB SILVER NOVO (21/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('301932f0-9036-471b-b779-ee3357530c7c', 'IPHONE 17 PRO 256GB SILVER', '352574671892816', 7940.0, 7400.0, 1, 'vendido', 'novo', '2026-05-21', '2026-05-21', '2026-05-21', '2026-05-21');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('34662dce-21c2-4be6-a833-e4b75b61086a', 1, '0dd2c938-c6dd-4f5d-aac5-ed045ee5d2fb', 'concluida', 'normal', 7940.0, 7940.0, 0, 0, '2026-05-21');
UPDATE aparelhos SET venda_id = '34662dce-21c2-4be6-a833-e4b75b61086a' WHERE id = '301932f0-9036-471b-b779-ee3357530c7c';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('00d0afd8-6685-461b-8209-1b321c01978e', '34662dce-21c2-4be6-a833-e4b75b61086a', 'pix', 7940.0, '2026-05-21', '2026-05-21');

-- VENDA 219: IPHONE 17 PRO 256GB SILVER SEMINOVO (21/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('8a256f86-95c1-4206-8477-0101a886c60f', 'IPHONE 17 PRO 256GB SILVER', '356661406078476', 6690.0, 6100.0, 19, 'vendido', 'seminovo', '2026-05-21', '2026-05-21', '2026-05-21', '2026-05-21');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('def63372-4f9d-4bf8-978b-1c2230846759', 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 6690.0, 6690.0, 0, 0, '2026-05-21');
UPDATE aparelhos SET venda_id = 'def63372-4f9d-4bf8-978b-1c2230846759' WHERE id = '8a256f86-95c1-4206-8477-0101a886c60f';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('730c8639-877e-4632-a6c8-b5984c67fba3', 'def63372-4f9d-4bf8-978b-1c2230846759', 'cartao_credito', 6690.0, '2026-05-21', '2026-05-21');

-- VENDA 220: POCO X8 PRO 512GB PRETO NOVO (21/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('fc1188c4-b7d3-464b-a364-b7b447875780', 'POCO X8 PRO 512GB PRETO', '866132083268783', 2476.0, 2300.0, 4, 'vendido', 'novo', '2026-05-21', '2026-05-21', '2026-05-21', '2026-05-21');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('35ba8738-d620-42f8-bb13-1db71182836b', 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 2476.0, 2476.0, 0, 0, '2026-05-21');
UPDATE aparelhos SET venda_id = '35ba8738-d620-42f8-bb13-1db71182836b' WHERE id = 'fc1188c4-b7d3-464b-a364-b7b447875780';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('8bfe8944-8771-4aa4-89b5-94538a160366', '35ba8738-d620-42f8-bb13-1db71182836b', 'pix', 2476.0, '2026-05-21', '2026-05-21');

-- VENDA 221: IPHONE 15 PRO MAX 256GB PRETO SEMINOVO (21/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('91b3314a-6813-41e7-baa6-5bf0776ed860', 'IPHONE 15 PRO MAX 256GB PRETO', '357275796919659', 4250.0, 4000.0, 19, 'vendido', 'seminovo', '2026-05-21', '2026-05-21', '2026-05-21', '2026-05-21');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('643f76a8-fbd4-445e-8550-955cbb63bccb', 19, 'b4269e60-eea2-4eba-a34d-db9591e0ec83', 'concluida', 'normal', 4250.0, 4250.0, 0, 0, '2026-05-21');
UPDATE aparelhos SET venda_id = '643f76a8-fbd4-445e-8550-955cbb63bccb' WHERE id = '91b3314a-6813-41e7-baa6-5bf0776ed860';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('3ee2b10b-3326-4329-9d1c-b713f25e52c8', '643f76a8-fbd4-445e-8550-955cbb63bccb', 'pix', 4250.0, '2026-05-21', '2026-05-21');

-- VENDA 222: NOTE 15 5G 256GB PRETO NOVO (21/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('82edb3be-ae3f-417b-aad3-d4742ac91d6e', 'NOTE 15 5G 256GB PRETO', '867520084645802', 1420.0, 1360.0, 19, 'vendido', 'novo', '2026-05-21', '2026-05-21', '2026-05-21', '2026-05-21');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('9374ae7a-cab5-49ef-bfba-16b101e3abcf', 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 1420.0, 1420.0, 0, 0, '2026-05-21');
UPDATE aparelhos SET venda_id = '9374ae7a-cab5-49ef-bfba-16b101e3abcf' WHERE id = '82edb3be-ae3f-417b-aad3-d4742ac91d6e';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('2ad1b3df-2605-466e-9d5d-b0a39124f262', '9374ae7a-cab5-49ef-bfba-16b101e3abcf', 'pix', 1420.0, '2026-05-21', '2026-05-21');

-- VENDA 223: NOTE 15 4F 256GB PRETO NOVO (21/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('b8b9844b-6523-46ab-b3e5-5137a8b03913', 'NOTE 15 4F 256GB PRETO', '869009086978906', 1300.0, 1130.0, 19, 'vendido', 'novo', '2026-05-21', '2026-05-21', '2026-05-21', '2026-05-21');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('63921a3e-6c4b-4c2b-9170-df834de51c49', 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 1300.0, 1300.0, 0, 0, '2026-05-21');
UPDATE aparelhos SET venda_id = '63921a3e-6c4b-4c2b-9170-df834de51c49' WHERE id = 'b8b9844b-6523-46ab-b3e5-5137a8b03913';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('352c56c3-eba0-4dee-8364-a3d39f6f0fe2', '63921a3e-6c4b-4c2b-9170-df834de51c49', 'pix', 1300.0, '2026-05-21', '2026-05-21');

-- Troca: IPH (R$ 17.00)
INSERT INTO aparelhos (id, modelo, valor_compra, loja_id, status, estado, observacoes, data_entrada, criado_em, atualizado_em)
VALUES ('e68bd68c-09d7-41e8-bc58-dc9fea7e2a7a', 'IPH', 17.0, 19, 'disponivel', 'usado', 'Entrada por troca - venda 63921a3e-6c4b-4c2b-9170-df834de51c49', '2026-05-21', '2026-05-21', '2026-05-21');

-- VENDA 224: GALAXY S26 ULTRA 512GB BRANCO LACRADO (21/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('b4181c89-915b-4a74-b379-9fe1f4375842', 'GALAXY S26 ULTRA 512GB BRANCO', '355381840336221', 7285.0, 6899.0, 1, 'vendido', 'novo', '2026-05-21', '2026-05-21', '2026-05-21', '2026-05-21');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('062ecbb5-e488-4e75-8379-e588fdfa0bae', 1, '9451cd9f-6770-4e32-aae8-c75fa675e818', 'concluida', 'normal', 7285.0, 7285.0, 0, 0, '2026-05-21');
UPDATE aparelhos SET venda_id = '062ecbb5-e488-4e75-8379-e588fdfa0bae' WHERE id = 'b4181c89-915b-4a74-b379-9fe1f4375842';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('41f768b7-3d15-4ba5-bc66-1a8309384330', '062ecbb5-e488-4e75-8379-e588fdfa0bae', 'pix', 7285.0, '2026-05-21', '2026-05-21');

-- VENDA 225: IPHONE 15 128GB AZUL NOVO (21/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('651bc882-58ff-4058-88d5-b1424997652b', 'IPHONE 15 128GB AZUL', '354196713272654', 3850.0, 3700.0, 20, 'vendido', 'novo', '2026-05-21', '2026-05-21', '2026-05-21', '2026-05-21');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('421fd1b7-e6dd-41f9-b3bb-5a388d004555', 20, 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 'concluida', 'normal', 3850.0, 3850.0, 0, 0, '2026-05-21');
UPDATE aparelhos SET venda_id = '421fd1b7-e6dd-41f9-b3bb-5a388d004555' WHERE id = '651bc882-58ff-4058-88d5-b1424997652b';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('09b0e7eb-25ce-4abb-a28d-c9fb239efae7', '421fd1b7-e6dd-41f9-b3bb-5a388d004555', 'cartao_credito', 3850.0, '2026-05-21', '2026-05-21');

-- VENDA 226: IPHONE 17 PRO MAX 256GB LARANJA LACRADO (21/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('c16226a3-ca00-466c-a310-ddb377650b30', 'IPHONE 17 PRO MAX 256GB LARANJA', '350230973236911', 8200.0, 8000.0, 1, 'vendido', 'novo', '2026-05-21', '2026-05-21', '2026-05-21', '2026-05-21');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('03b0433d-472c-4d15-b8af-cce509a51fdb', 1, 'e07d4d35-1381-4d4d-914d-8382a7456fdd', 'concluida', 'normal', 8200.0, 8200.0, 0, 0, '2026-05-21');
UPDATE aparelhos SET venda_id = '03b0433d-472c-4d15-b8af-cce509a51fdb' WHERE id = 'c16226a3-ca00-466c-a310-ddb377650b30';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('375d7191-1866-4ff0-963d-8cfcf521f2ad', '03b0433d-472c-4d15-b8af-cce509a51fdb', 'pix', 8200.0, '2026-05-21', '2026-05-21');

-- Troca: 15 PRO MAX (R$ 2700.00)
INSERT INTO aparelhos (id, modelo, valor_compra, loja_id, status, estado, observacoes, data_entrada, criado_em, atualizado_em)
VALUES ('4b4f97ca-0097-4e98-94dd-5c1fd18d4bf1', '15 PRO MAX', 2700.0, 1, 'disponivel', 'usado', 'Entrada por troca - venda 03b0433d-472c-4d15-b8af-cce509a51fdb', '2026-05-21', '2026-05-21', '2026-05-21');

-- VENDA 227: IPHONE 11 64GB VERDE SEMINOVO (21/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('8bbd4cee-9b4b-446d-b241-e6b87e65dab3', 'IPHONE 11 64GB VERDE', '354005106730246', 850.0, 650.0, 1, 'vendido', 'seminovo', '2026-05-21', '2026-05-21', '2026-05-21', '2026-05-21');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('156c61e7-1e15-423a-a4c0-dfdabc1dde99', 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 850.0, 850.0, 0, 0, '2026-05-21');
UPDATE aparelhos SET venda_id = '156c61e7-1e15-423a-a4c0-dfdabc1dde99' WHERE id = '8bbd4cee-9b4b-446d-b241-e6b87e65dab3';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('ffe77a3a-54f2-48de-993e-3479e76bca49', '156c61e7-1e15-423a-a4c0-dfdabc1dde99', 'pix', 850.0, '2026-05-21', '2026-05-21');

-- VENDA 228: IPHONE 16 PRO MAX 256GB NATURAL SEMINOVO (21/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('1b547f2d-9396-4fd5-8bf9-767a836b3288', 'IPHONE 16 PRO MAX 256GB NATURAL', '355300185671927', 5250.0, 4850.0, 1, 'vendido', 'seminovo', '2026-05-21', '2026-05-21', '2026-05-21', '2026-05-21');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('ce6079b8-f7e6-412e-a6bc-0e5e2c7665e8', 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 5250.0, 5250.0, 0, 0, '2026-05-21');
UPDATE aparelhos SET venda_id = 'ce6079b8-f7e6-412e-a6bc-0e5e2c7665e8' WHERE id = '1b547f2d-9396-4fd5-8bf9-767a836b3288';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('08e5eb68-fb3a-4f45-ad0a-dfd43bac462f', 'ce6079b8-f7e6-412e-a6bc-0e5e2c7665e8', 'pix', 5250.0, '2026-05-21', '2026-05-21');

-- VENDA 229: IPHONE 13 256GB SEMINOVO AZUL (21/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('918a0c8b-7ee8-4050-8ddf-351665a2e81b', 'IPHONE 13 256GB SEMINOVO AZUL', '356177152787459', 2300.0, 2000.0, 1, 'vendido', 'seminovo', '2026-05-21', '2026-05-21', '2026-05-21', '2026-05-21');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('4ec48fbd-cf02-47d9-acde-1f8decc7bfdf', 1, '1d12d555-68e9-45f8-bfc0-a35a1d8d7920', 'concluida', 'normal', 2300.0, 2300.0, 0, 0, '2026-05-21');
UPDATE aparelhos SET venda_id = '4ec48fbd-cf02-47d9-acde-1f8decc7bfdf' WHERE id = '918a0c8b-7ee8-4050-8ddf-351665a2e81b';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('8c32ce07-3b05-4a20-a3f5-77de46855978', '4ec48fbd-cf02-47d9-acde-1f8decc7bfdf', 'pix', 2300.0, '2026-05-21', '2026-05-21');

-- VENDA 230: IPHONE 17 256GB BRANCO NOVO (21/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('f7137300-8b93-475d-82d5-8bb873f066f1', 'IPHONE 17 256GB BRANCO', '352824562544798', 4900.0, 4600.0, 20, 'vendido', 'novo', '2026-05-21', '2026-05-21', '2026-05-21', '2026-05-21');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('1b99e2af-6bdf-438c-9bc3-c3005ffe9c3f', 20, '25e2da5b-9e76-4388-9890-7e22efd6940d', 'concluida', 'normal', 4900.0, 4900.0, 0, 0, '2026-05-21');
UPDATE aparelhos SET venda_id = '1b99e2af-6bdf-438c-9bc3-c3005ffe9c3f' WHERE id = 'f7137300-8b93-475d-82d5-8bb873f066f1';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('4c725be0-94cb-460d-8e22-937cc90cdb41', '1b99e2af-6bdf-438c-9bc3-c3005ffe9c3f', 'pix', 4900.0, '2026-05-21', '2026-05-21');

-- VENDA 231: IPHONE 13 128GB AZUL SEMINOVO (22/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('ca25102a-ec73-4bd5-aa65-a0ae4f982a8c', 'IPHONE 13 128GB AZUL', '355939491184461', 1980.0, 1800.0, 4, 'vendido', 'seminovo', '2026-05-22', '2026-05-22', '2026-05-22', '2026-05-22');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('5b7a74b9-1c50-4c71-884d-bb7849317ea2', 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 1980.0, 1980.0, 0, 0, '2026-05-22');
UPDATE aparelhos SET venda_id = '5b7a74b9-1c50-4c71-884d-bb7849317ea2' WHERE id = 'ca25102a-ec73-4bd5-aa65-a0ae4f982a8c';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('071a335e-93ce-46a3-9930-87a0c5996f58', '5b7a74b9-1c50-4c71-884d-bb7849317ea2', 'cartao_credito', 1980.0, '2026-05-22', '2026-05-22');

-- VENDA 232: IPHONE 11 BRANCO 128GB SEMINOVO (22/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('c2ad267c-5dcd-4819-89ff-0add5a991cf2', 'IPHONE 11 BRANCO 128GB', NULL, 1030.0, 800.0, 1, 'vendido', 'seminovo', '2026-05-22', '2026-05-22', '2026-05-22', '2026-05-22');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('1d2fc9d4-60e2-4d40-b1a9-85081220245c', 1, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 1030.0, 1030.0, 0, 0, '2026-05-22');
UPDATE aparelhos SET venda_id = '1d2fc9d4-60e2-4d40-b1a9-85081220245c' WHERE id = 'c2ad267c-5dcd-4819-89ff-0add5a991cf2';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('3d38395f-66a8-4d19-8797-794172a4cc27', '1d2fc9d4-60e2-4d40-b1a9-85081220245c', 'pix', 1030.0, '2026-05-22', '2026-05-22');

-- VENDA 233: IPHONE 12 PRO MAX 128GB GRAFITE SEMINOVO (22/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('eac38d50-9b58-451e-9a6a-a08d19554881', 'IPHONE 12 PRO MAX 128GB GRAFITE', '354440895786747', 2210.0, 2000.0, 4, 'vendido', 'seminovo', '2026-05-22', '2026-05-22', '2026-05-22', '2026-05-22');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('243a5222-e34f-414d-9552-5cb59a4cf8f4', 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 2210.0, 2210.0, 0, 0, '2026-05-22');
UPDATE aparelhos SET venda_id = '243a5222-e34f-414d-9552-5cb59a4cf8f4' WHERE id = 'eac38d50-9b58-451e-9a6a-a08d19554881';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('548cef0f-3487-423f-9e3f-e9c14cf6a488', '243a5222-e34f-414d-9552-5cb59a4cf8f4', 'pix', 2210.0, '2026-05-22', '2026-05-22');

-- VENDA 234: IPHONE 17 PRO MAX 256GB BRANCO NOVO (22/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('0941fb58-2aec-4bdf-9daa-90afe7e82ce7', 'IPHONE 17 PRO MAX 256GB BRANCO', '355101476809873', 8886.0, 7950.0, 1, 'vendido', 'novo', '2026-05-22', '2026-05-22', '2026-05-22', '2026-05-22');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('29e85d39-ce31-4d80-84ef-080a41d003f7', 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 8886.0, 8886.0, 0, 0, '2026-05-22');
UPDATE aparelhos SET venda_id = '29e85d39-ce31-4d80-84ef-080a41d003f7' WHERE id = '0941fb58-2aec-4bdf-9daa-90afe7e82ce7';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('c24dc0c2-2a5e-4dff-811e-f147051c2bc8', '29e85d39-ce31-4d80-84ef-080a41d003f7', 'pix', 8886.0, '2026-05-22', '2026-05-22');

-- Troca: IPH 16 128GB PRETO (R$ 2950.00)
INSERT INTO aparelhos (id, modelo, valor_compra, loja_id, status, estado, observacoes, data_entrada, criado_em, atualizado_em)
VALUES ('3a4fd3fc-5211-441f-afee-afaf94a08fce', 'IPH 16 128GB PRETO', 2950.0, 1, 'disponivel', 'usado', 'Entrada por troca - venda 29e85d39-ce31-4d80-84ef-080a41d003f7', '2026-05-22', '2026-05-22', '2026-05-22');

-- VENDA 235: IPHONE 16 PRO DESERT 128GB NOVO (22/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('3aae48e3-37f9-4cd3-855f-92edb61d7400', 'IPHONE 16 PRO DESERT 128GB', '351895497858892', 6000.0, 5400.0, 20, 'vendido', 'novo', '2026-05-22', '2026-05-22', '2026-05-22', '2026-05-22');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('65eec271-d842-4376-b855-61704f34ab95', 20, 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 'concluida', 'normal', 6000.0, 6000.0, 0, 0, '2026-05-22');
UPDATE aparelhos SET venda_id = '65eec271-d842-4376-b855-61704f34ab95' WHERE id = '3aae48e3-37f9-4cd3-855f-92edb61d7400';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('621eb75b-2f6e-47b9-bd64-c315bf4d662c', '65eec271-d842-4376-b855-61704f34ab95', 'cartao_credito', 6000.0, '2026-05-22', '2026-05-22');

-- VENDA 236: REDMI NOTE 15 5G 256GB PRETO NOVO (22/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('64854988-9809-4b1c-8c32-eb1943e43de6', 'REDMI NOTE 15 5G 256GB PRETO', '861950072519774', 1600.0, 1380.0, 4, 'vendido', 'novo', '2026-05-22', '2026-05-22', '2026-05-22', '2026-05-22');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('9128099a-e6f8-4d33-aed3-4c35110950c7', 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 1600.0, 1600.0, 0, 0, '2026-05-22');
UPDATE aparelhos SET venda_id = '9128099a-e6f8-4d33-aed3-4c35110950c7' WHERE id = '64854988-9809-4b1c-8c32-eb1943e43de6';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('638ecb44-349c-4bff-ba4a-0a65548f67e1', '9128099a-e6f8-4d33-aed3-4c35110950c7', 'cartao_credito', 1600.0, '2026-05-22', '2026-05-22');

-- VENDA 237: REDMI NOTE 15 5G 256GB PRETO NOVO (22/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('0897aa35-fde1-43cd-a72c-bf42abd58b5b', 'REDMI NOTE 15 5G 256GB PRETO', '861950072535226', 1500.0, 1380.0, 4, 'vendido', 'novo', '2026-05-22', '2026-05-22', '2026-05-22', '2026-05-22');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('ccf13278-8459-41be-9b06-369c97af1781', 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 1500.0, 1500.0, 0, 0, '2026-05-22');
UPDATE aparelhos SET venda_id = 'ccf13278-8459-41be-9b06-369c97af1781' WHERE id = '0897aa35-fde1-43cd-a72c-bf42abd58b5b';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('cb345099-e1f2-4df2-a1da-63216a334282', 'ccf13278-8459-41be-9b06-369c97af1781', 'pix', 1500.0, '2026-05-22', '2026-05-22');

-- VENDA 238: REDMI NOTE 15 5G 256GB PRETO NOVO (22/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('5fb73b3b-1d60-414d-9434-7e925420f47b', 'REDMI NOTE 15 5G 256GB PRETO', '865292085328620', 1600.0, 1380.0, 4, 'vendido', 'novo', '2026-05-22', '2026-05-22', '2026-05-22', '2026-05-22');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('edaf9bc5-31c4-49d8-bfb0-8f2064b73663', 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 1600.0, 1600.0, 0, 0, '2026-05-22');
UPDATE aparelhos SET venda_id = 'edaf9bc5-31c4-49d8-bfb0-8f2064b73663' WHERE id = '5fb73b3b-1d60-414d-9434-7e925420f47b';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('5b0ee587-e406-4add-aade-53133ee0fedd', 'edaf9bc5-31c4-49d8-bfb0-8f2064b73663', 'cartao_credito', 1600.0, '2026-05-22', '2026-05-22');

-- VENDA 239: IPHONE 17 PRO 256GB BRANCO SEMINOVO (22/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('f545801f-2337-4782-b48b-87f732b610e1', 'IPHONE 17 PRO 256GB BRANCO', '355500351356910', 6900.0, 6100.0, 20, 'vendido', 'seminovo', '2026-05-22', '2026-05-22', '2026-05-22', '2026-05-22');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('4dc1f522-d056-4577-af7b-e8c74cbabff0', 20, '25e2da5b-9e76-4388-9890-7e22efd6940d', 'concluida', 'normal', 6900.0, 6900.0, 0, 0, '2026-05-22');
UPDATE aparelhos SET venda_id = '4dc1f522-d056-4577-af7b-e8c74cbabff0' WHERE id = 'f545801f-2337-4782-b48b-87f732b610e1';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('ec337a0f-af2f-41b5-be69-bfdfd82c783b', '4dc1f522-d056-4577-af7b-e8c74cbabff0', 'pix', 6900.0, '2026-05-22', '2026-05-22');

-- Troca: : IPHONE 15 128 GB PRETO = (R$ 2650.00)
INSERT INTO aparelhos (id, modelo, valor_compra, loja_id, status, estado, observacoes, data_entrada, criado_em, atualizado_em)
VALUES ('eb20a60c-b4d6-4c81-9795-920f1a32bdad', ': IPHONE 15 128 GB PRETO =', 2650.0, 20, 'disponivel', 'usado', 'Entrada por troca - venda 4dc1f522-d056-4577-af7b-e8c74cbabff0', '2026-05-22', '2026-05-22', '2026-05-22');

-- VENDA 240: IPHONE 16 PRO 256GB PRETO SEMINOVO (22/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('c28cfce8-3a7e-4bed-a57d-5ca484a01c0d', 'IPHONE 16 PRO 256GB PRETO', '355983889574156', 4800.0, 4500.0, 20, 'vendido', 'seminovo', '2026-05-22', '2026-05-22', '2026-05-22', '2026-05-22');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('41a5f60c-2703-4c5d-9363-e7b784a0742e', 20, '25e2da5b-9e76-4388-9890-7e22efd6940d', 'concluida', 'normal', 4800.0, 4800.0, 0, 0, '2026-05-22');
UPDATE aparelhos SET venda_id = '41a5f60c-2703-4c5d-9363-e7b784a0742e' WHERE id = 'c28cfce8-3a7e-4bed-a57d-5ca484a01c0d';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('74e06afd-58fa-4ad2-a74b-b9a80962f982', '41a5f60c-2703-4c5d-9363-e7b784a0742e', 'cartao_credito', 4800.0, '2026-05-22', '2026-05-22');

-- VENDA 241: IPHONE 16 128GB BRANCO NOVO (22/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('f79a9fb4-6b0c-4b21-ae10-218f26ea24ee', 'IPHONE 16 128GB BRANCO', '356004167522577', 4360.0, 4050.0, 4, 'vendido', 'novo', '2026-05-22', '2026-05-22', '2026-05-22', '2026-05-22');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('acb724e4-16c5-43a7-a20e-e580c0a9328d', 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 4360.0, 4360.0, 0, 0, '2026-05-22');
UPDATE aparelhos SET venda_id = 'acb724e4-16c5-43a7-a20e-e580c0a9328d' WHERE id = 'f79a9fb4-6b0c-4b21-ae10-218f26ea24ee';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('3add2bd6-7475-4658-bdbd-9ea85dbbafb3', 'acb724e4-16c5-43a7-a20e-e580c0a9328d', 'pix', 4360.0, '2026-05-22', '2026-05-22');

-- VENDA 242: IPHONE 11 PRO MAX 512GB BRANCO SEMINOVO (23/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('6feed2cf-a861-4903-a332-f511f0f72243', 'IPHONE 11 PRO MAX 512GB BRANCO', '353915106419593', 550.0, 500.0, 4, 'vendido', 'seminovo', '2026-05-23', '2026-05-23', '2026-05-23', '2026-05-23');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('44903901-34d7-417c-a5cc-2c9fc6ff8391', 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 550.0, 550.0, 0, 0, '2026-05-23');
UPDATE aparelhos SET venda_id = '44903901-34d7-417c-a5cc-2c9fc6ff8391' WHERE id = '6feed2cf-a861-4903-a332-f511f0f72243';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('20a4eafa-70b6-4841-ad86-28035a245d49', '44903901-34d7-417c-a5cc-2c9fc6ff8391', 'pix', 550.0, '2026-05-23', '2026-05-23');

-- VENDA 243: IPHONE 16 PRO MAX 512GB DESERT SEMINOVO (23/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('a2e88271-ac4c-470a-9d21-2882c019c328', 'IPHONE 16 PRO MAX 512GB DESERT', '356760684778276', 5561.0, 5150.0, 4, 'vendido', 'seminovo', '2026-05-23', '2026-05-23', '2026-05-23', '2026-05-23');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('2e6e26a5-7258-416b-9ede-d7a57df5cc3a', 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 5561.0, 5561.0, 0, 0, '2026-05-23');
UPDATE aparelhos SET venda_id = '2e6e26a5-7258-416b-9ede-d7a57df5cc3a' WHERE id = 'a2e88271-ac4c-470a-9d21-2882c019c328';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('2e43ad1e-d03c-40c7-baef-3fbaf37095c8', '2e6e26a5-7258-416b-9ede-d7a57df5cc3a', 'pix', 5561.0, '2026-05-23', '2026-05-23');

-- VENDA 244: IPHONE 17 PRO MAX 256GB SILVER NOVO (23/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('c8595c7f-b0de-4ba4-8151-8657f36651f7', 'IPHONE 17 PRO MAX 256GB SILVER', '358206135981398', 8400.0, 7900.0, 1, 'vendido', 'novo', '2026-05-23', '2026-05-23', '2026-05-23', '2026-05-23');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('c62401fa-a678-401f-a986-a1506a9f085b', 1, '0dd2c938-c6dd-4f5d-aac5-ed045ee5d2fb', 'concluida', 'normal', 8400.0, 8400.0, 0, 0, '2026-05-23');
UPDATE aparelhos SET venda_id = 'c62401fa-a678-401f-a986-a1506a9f085b' WHERE id = 'c8595c7f-b0de-4ba4-8151-8657f36651f7';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('3d935fc5-9163-417e-ae81-d65324b497ac', 'c62401fa-a678-401f-a986-a1506a9f085b', 'pix', 8400.0, '2026-05-23', '2026-05-23');

-- Troca: IPH 16 PRO MAX (R$ 4800.00)
INSERT INTO aparelhos (id, modelo, valor_compra, loja_id, status, estado, observacoes, data_entrada, criado_em, atualizado_em)
VALUES ('a39cbe7b-ab9e-4876-ad70-afe3db5686e9', 'IPH 16 PRO MAX', 4800.0, 1, 'disponivel', 'usado', 'Entrada por troca - venda c62401fa-a678-401f-a986-a1506a9f085b', '2026-05-23', '2026-05-23', '2026-05-23');

-- VENDA 245: IPHONE 17 PRO 256GB SILVER NOVO (23/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('43098a98-a45f-49ba-8ea1-a7b001612b56', 'IPHONE 17 PRO 256GB SILVER', '352574671693388', 7700.0, 7300.0, 1, 'vendido', 'novo', '2026-05-23', '2026-05-23', '2026-05-23', '2026-05-23');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('91d48961-231b-4176-b1b0-3c56b908d5aa', 1, '0dd2c938-c6dd-4f5d-aac5-ed045ee5d2fb', 'concluida', 'normal', 7700.0, 7700.0, 0, 0, '2026-05-23');
UPDATE aparelhos SET venda_id = '91d48961-231b-4176-b1b0-3c56b908d5aa' WHERE id = '43098a98-a45f-49ba-8ea1-a7b001612b56';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('8ef78cd2-6cff-4e99-8a74-45f2d08525ab', '91d48961-231b-4176-b1b0-3c56b908d5aa', 'pix', 7700.0, '2026-05-23', '2026-05-23');

-- Troca: IPH 16 PRO 128GB DESERT (R$ 4000.00)
INSERT INTO aparelhos (id, modelo, valor_compra, loja_id, status, estado, observacoes, data_entrada, criado_em, atualizado_em)
VALUES ('23b28a96-0e54-4bd4-999b-ae9beea67914', 'IPH 16 PRO 128GB DESERT', 4000.0, 1, 'disponivel', 'usado', 'Entrada por troca - venda 91d48961-231b-4176-b1b0-3c56b908d5aa', '2026-05-23', '2026-05-23', '2026-05-23');

-- VENDA 246: IPHONE 17 PRO MAX 256GB SILVER NOVO (23/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('aabbc903-b103-4e39-b857-1d15c54b502f', 'IPHONE 17 PRO MAX 256GB SILVER', '351205740141759', 8200.0, 7850.0, 1, 'vendido', 'novo', '2026-05-23', '2026-05-23', '2026-05-23', '2026-05-23');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('8e8e6ab7-00f1-4ea5-bb84-6451c78b8236', 1, '0dd2c938-c6dd-4f5d-aac5-ed045ee5d2fb', 'concluida', 'normal', 8200.0, 8200.0, 0, 0, '2026-05-23');
UPDATE aparelhos SET venda_id = '8e8e6ab7-00f1-4ea5-bb84-6451c78b8236' WHERE id = 'aabbc903-b103-4e39-b857-1d15c54b502f';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('190303e2-8389-47e9-8ef5-eb25564e3027', '8e8e6ab7-00f1-4ea5-bb84-6451c78b8236', 'pix', 8200.0, '2026-05-23', '2026-05-23');

-- VENDA 247: IPHONE 15 PRO 256GB BRANCO SEMINOVO (23/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('0e4e55ed-50a0-4667-bb99-0d518a1020b2', 'IPHONE 15 PRO 256GB BRANCO', '350839531594007', 3600.0, 3400.0, 20, 'vendido', 'seminovo', '2026-05-23', '2026-05-23', '2026-05-23', '2026-05-23');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('da5588ae-3557-4af6-8959-3437907438bf', 20, 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 'concluida', 'normal', 3600.0, 3600.0, 0, 0, '2026-05-23');
UPDATE aparelhos SET venda_id = 'da5588ae-3557-4af6-8959-3437907438bf' WHERE id = '0e4e55ed-50a0-4667-bb99-0d518a1020b2';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('52b2ff36-69ed-42cd-90d4-e76b54eb4b4c', 'da5588ae-3557-4af6-8959-3437907438bf', 'pix', 3600.0, '2026-05-23', '2026-05-23');

-- VENDA 248: IPAD 11 128GB AZUL LACRADO (23/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('07b7fa52-8021-4494-892e-56431897cf7c', 'IPAD 11 128GB AZUL', 'MD7P7G9W9D', 2950.0, 2090.0, 1, 'vendido', 'novo', '2026-05-23', '2026-05-23', '2026-05-23', '2026-05-23');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('3d2ef37c-3b92-4390-ab94-c47b90eb73bc', 1, '1d12d555-68e9-45f8-bfc0-a35a1d8d7920', 'concluida', 'normal', 2950.0, 2950.0, 0, 0, '2026-05-23');
UPDATE aparelhos SET venda_id = '3d2ef37c-3b92-4390-ab94-c47b90eb73bc' WHERE id = '07b7fa52-8021-4494-892e-56431897cf7c';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('04c40ea7-3a69-4909-85cf-d7a414e5a2db', '3d2ef37c-3b92-4390-ab94-c47b90eb73bc', 'pix', 2950.0, '2026-05-23', '2026-05-23');

-- VENDA 249: GALAXY A56 5G 256GB PRETO LACRADO (23/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('047ef2f4-8879-4f12-8a1b-77af29f91de0', 'GALAXY A56 5G 256GB PRETO', '351814335898119', 2100.0, 1900.0, 1, 'vendido', 'novo', '2026-05-23', '2026-05-23', '2026-05-23', '2026-05-23');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('75ef17df-031e-41d5-923a-a5d53f2fc89b', 1, '9451cd9f-6770-4e32-aae8-c75fa675e818', 'concluida', 'normal', 2100.0, 2100.0, 0, 0, '2026-05-23');
UPDATE aparelhos SET venda_id = '75ef17df-031e-41d5-923a-a5d53f2fc89b' WHERE id = '047ef2f4-8879-4f12-8a1b-77af29f91de0';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('40f9ac8f-114c-4caf-82c6-2c67529a2ad5', '75ef17df-031e-41d5-923a-a5d53f2fc89b', 'pix', 2100.0, '2026-05-23', '2026-05-23');

-- VENDA 250: IPHONE 15 PRO MAX 256GB PRETO SEMINOVO (23/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('3162af11-2c05-420e-88c1-a443530b4152', 'IPHONE 15 PRO MAX 256GB PRETO', '354570357307499', 3950.0, 3700.0, 1, 'vendido', 'seminovo', '2026-05-23', '2026-05-23', '2026-05-23', '2026-05-23');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('72e312ae-107f-4c27-a82e-c88a65f2083a', 1, 'e07d4d35-1381-4d4d-914d-8382a7456fdd', 'concluida', 'normal', 3950.0, 3950.0, 0, 0, '2026-05-23');
UPDATE aparelhos SET venda_id = '72e312ae-107f-4c27-a82e-c88a65f2083a' WHERE id = '3162af11-2c05-420e-88c1-a443530b4152';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('126311b9-1c17-4204-850b-43e739a80105', '72e312ae-107f-4c27-a82e-c88a65f2083a', 'cartao_credito', 3950.0, '2026-05-23', '2026-05-23');

-- Troca: IPHONE (R$ 13.00)
INSERT INTO aparelhos (id, modelo, valor_compra, loja_id, status, estado, observacoes, data_entrada, criado_em, atualizado_em)
VALUES ('2801bc67-79b7-46a5-8e43-7f655964e2e9', 'IPHONE', 13.0, 1, 'disponivel', 'usado', 'Entrada por troca - venda 72e312ae-107f-4c27-a82e-c88a65f2083a', '2026-05-23', '2026-05-23', '2026-05-23');

-- VENDA 251: IPHONE 13 128GB BRANCO SEMINOVO (23/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('a6f2111c-416e-4c2f-90ea-deafafdf7189', 'IPHONE 13 128GB BRANCO', '359551273163864', 1900.0, 1780.0, 19, 'vendido', 'seminovo', '2026-05-23', '2026-05-23', '2026-05-23', '2026-05-23');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('05f4139f-e0a5-4a67-8053-71f515375110', 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 1900.0, 1900.0, 0, 0, '2026-05-23');
UPDATE aparelhos SET venda_id = '05f4139f-e0a5-4a67-8053-71f515375110' WHERE id = 'a6f2111c-416e-4c2f-90ea-deafafdf7189';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('4ff7d329-6d61-4fe4-bb9d-a7c97a06bd17', '05f4139f-e0a5-4a67-8053-71f515375110', 'pix', 1900.0, '2026-05-23', '2026-05-23');

-- VENDA 252: IPHONE 17 PRO 256GB AZUL NOVO (23/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('a33a0eeb-6ac9-4b84-adac-0f445c1fa835', 'IPHONE 17 PRO 256GB AZUL', '352574671224184', 7530.0, 7300.0, 19, 'vendido', 'novo', '2026-05-23', '2026-05-23', '2026-05-23', '2026-05-23');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('8de2c26e-32b8-44d4-9afa-eea753f6b816', 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 7530.0, 7530.0, 0, 0, '2026-05-23');
UPDATE aparelhos SET venda_id = '8de2c26e-32b8-44d4-9afa-eea753f6b816' WHERE id = 'a33a0eeb-6ac9-4b84-adac-0f445c1fa835';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('a1d62933-b360-428f-a33b-19fbad5abc4b', '8de2c26e-32b8-44d4-9afa-eea753f6b816', 'pix', 7530.0, '2026-05-23', '2026-05-23');

-- VENDA 253: IPHONE 17 PRO MAX 256GB SILVER NOVO (23/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('00bc3e16-86f4-444c-bb28-7b3289211382', 'IPHONE 17 PRO MAX 256GB SILVER', '351668145588454', 8150.0, 8000.0, 19, 'vendido', 'novo', '2026-05-23', '2026-05-23', '2026-05-23', '2026-05-23');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('24ae6eac-5460-4f6c-8dbc-b49dd3a18ae0', 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 8150.0, 8150.0, 0, 0, '2026-05-23');
UPDATE aparelhos SET venda_id = '24ae6eac-5460-4f6c-8dbc-b49dd3a18ae0' WHERE id = '00bc3e16-86f4-444c-bb28-7b3289211382';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('cb467348-8ce6-43b4-b4d7-6d04c01258ed', '24ae6eac-5460-4f6c-8dbc-b49dd3a18ae0', 'cartao_credito', 8150.0, '2026-05-23', '2026-05-23');

-- VENDA 254: IPHONE 14 PRO MAX 512GB SEMINOVO (23/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('2a124f36-9fd2-4cc4-a773-aee76791dc62', 'IPHONE 14 PRO MAX 512GB', '357938436579106', 3730.0, 2500.0, 19, 'vendido', 'seminovo', '2026-05-23', '2026-05-23', '2026-05-23', '2026-05-23');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('fc1044cf-f888-4b18-ac09-1ad56894f340', 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 3730.0, 3730.0, 0, 0, '2026-05-23');
UPDATE aparelhos SET venda_id = 'fc1044cf-f888-4b18-ac09-1ad56894f340' WHERE id = '2a124f36-9fd2-4cc4-a773-aee76791dc62';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('669d364c-3565-45f9-93b7-f97d78e0d6bd', 'fc1044cf-f888-4b18-ac09-1ad56894f340', 'cartao_credito', 3730.0, '2026-05-23', '2026-05-23');

-- VENDA 255: IPHONE XR 64GB PRETO SEMINOVO (23/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('9af3850f-3905-4e39-9c44-8c874ee0686c', 'IPHONE XR 64GB PRETO', '356827112692377', 600.0, 500.0, 19, 'vendido', 'seminovo', '2026-05-23', '2026-05-23', '2026-05-23', '2026-05-23');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('3c13a0af-a20e-4f64-bf58-5614db0d43b0', 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 600.0, 600.0, 0, 0, '2026-05-23');
UPDATE aparelhos SET venda_id = '3c13a0af-a20e-4f64-bf58-5614db0d43b0' WHERE id = '9af3850f-3905-4e39-9c44-8c874ee0686c';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('d6518670-cf1e-4a71-9616-6eff728d2272', '3c13a0af-a20e-4f64-bf58-5614db0d43b0', 'pix', 600.0, '2026-05-23', '2026-05-23');

-- VENDA 256: IPHONE 16 PRO MAX 1T DESERT SEMINOVO (23/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('47fa64bb-c941-4fa6-baaa-8fab119d2a91', 'IPHONE 16 PRO MAX 1T DESERT', '355067542298807', 5850.0, 5300.0, 19, 'vendido', 'seminovo', '2026-05-23', '2026-05-23', '2026-05-23', '2026-05-23');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('4dceb7b1-2257-49c4-8eba-6c4d6b8f1178', 19, '85743f3e-1b32-49c0-9d9e-c16afd690f7d', 'concluida', 'normal', 5850.0, 5850.0, 0, 0, '2026-05-23');
UPDATE aparelhos SET venda_id = '4dceb7b1-2257-49c4-8eba-6c4d6b8f1178' WHERE id = '47fa64bb-c941-4fa6-baaa-8fab119d2a91';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('0cefab6c-94aa-4f13-90ab-75f6218f5e17', '4dceb7b1-2257-49c4-8eba-6c4d6b8f1178', 'pix', 5850.0, '2026-05-23', '2026-05-23');

-- VENDA 257: IPHONE 15 128GB PRETO SEMINOVO (23/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('c262ff20-9ef2-45a4-9c04-891777e1992f', 'IPHONE 15 128GB PRETO', '351750724879288', 3076.0, 2730.0, 19, 'vendido', 'seminovo', '2026-05-23', '2026-05-23', '2026-05-23', '2026-05-23');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('4c55dc91-dbfe-43b9-b93a-e0b2df42d4ed', 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 3076.0, 3076.0, 0, 0, '2026-05-23');
UPDATE aparelhos SET venda_id = '4c55dc91-dbfe-43b9-b93a-e0b2df42d4ed' WHERE id = 'c262ff20-9ef2-45a4-9c04-891777e1992f';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('de24bbb6-4fc4-4037-b20f-9975411cc87e', '4c55dc91-dbfe-43b9-b93a-e0b2df42d4ed', 'cartao_credito', 3076.0, '2026-05-23', '2026-05-23');

-- VENDA 258: IPHONE 16 PRO MAX 512GB PRETO SEMINOVO (23/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('465256c3-b14e-40e6-af7d-839aa4107c37', 'IPHONE 16 PRO MAX 512GB PRETO', '354276357875838', 5389.0, 5150.0, 1, 'vendido', 'seminovo', '2026-05-23', '2026-05-23', '2026-05-23', '2026-05-23');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('b1ce170c-4c66-4bc9-9110-26d6a2882e74', 1, 'e07d4d35-1381-4d4d-914d-8382a7456fdd', 'concluida', 'normal', 5389.0, 5389.0, 0, 0, '2026-05-23');
UPDATE aparelhos SET venda_id = 'b1ce170c-4c66-4bc9-9110-26d6a2882e74' WHERE id = '465256c3-b14e-40e6-af7d-839aa4107c37';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('fb6754ef-d078-4abf-9842-0bcd0c7ad09d', 'b1ce170c-4c66-4bc9-9110-26d6a2882e74', 'cartao_credito', 5389.0, '2026-05-23', '2026-05-23');

-- VENDA 259: IPHONE 16 PRO MAX 1TB DESERT SEMINOVO (23/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('0a40d5d9-364d-44fb-9b79-78868c09e74a', 'IPHONE 16 PRO MAX 1TB DESERT', '355067542462973', 5500.0, 5300.0, 1, 'vendido', 'seminovo', '2026-05-23', '2026-05-23', '2026-05-23', '2026-05-23');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('111013d2-76a0-4154-bb29-42c7a5a207fa', 1, 'e07d4d35-1381-4d4d-914d-8382a7456fdd', 'concluida', 'normal', 5500.0, 5500.0, 0, 0, '2026-05-23');
UPDATE aparelhos SET venda_id = '111013d2-76a0-4154-bb29-42c7a5a207fa' WHERE id = '0a40d5d9-364d-44fb-9b79-78868c09e74a';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('c732396e-4813-4750-82db-fa1947b0a840', '111013d2-76a0-4154-bb29-42c7a5a207fa', 'pix', 5500.0, '2026-05-23', '2026-05-23');

-- VENDA 260: IPHONE 17 PRO 256GB BRANCO SEMINOVO (23/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('cae2b2b3-63ce-458c-8bea-07ff755ee1c3', 'IPHONE 17 PRO 256GB BRANCO', '356839676778476', 6700.0, 6100.0, 20, 'vendido', 'seminovo', '2026-05-23', '2026-05-23', '2026-05-23', '2026-05-23');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('0ab20377-8e48-4105-9665-f7ddc5dab794', 20, '25e2da5b-9e76-4388-9890-7e22efd6940d', 'concluida', 'normal', 6700.0, 6700.0, 0, 0, '2026-05-23');
UPDATE aparelhos SET venda_id = '0ab20377-8e48-4105-9665-f7ddc5dab794' WHERE id = 'cae2b2b3-63ce-458c-8bea-07ff755ee1c3';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('c34de98b-e4c5-4da7-9578-cbc97d2cef7f', '0ab20377-8e48-4105-9665-f7ddc5dab794', 'pix', 6700.0, '2026-05-23', '2026-05-23');

-- VENDA 261: IPHONE 16 PRO 128GB DESERT SEMINOVO (23/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('9a3e1264-9ef3-4f5a-94e9-f3ea2a4d49f6', 'IPHONE 16 PRO 128GB DESERT', '350059638923591', 4450.0, 4200.0, 20, 'vendido', 'seminovo', '2026-05-23', '2026-05-23', '2026-05-23', '2026-05-23');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('b8b91154-c5cf-4ea7-b93d-cd2571cbd365', 20, '25e2da5b-9e76-4388-9890-7e22efd6940d', 'concluida', 'normal', 4450.0, 4450.0, 0, 0, '2026-05-23');
UPDATE aparelhos SET venda_id = 'b8b91154-c5cf-4ea7-b93d-cd2571cbd365' WHERE id = '9a3e1264-9ef3-4f5a-94e9-f3ea2a4d49f6';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('98a5c987-22c8-4297-8155-30005119aa1a', 'b8b91154-c5cf-4ea7-b93d-cd2571cbd365', 'pix', 4450.0, '2026-05-23', '2026-05-23');

-- VENDA 262: IPHONE 12 64GB LILAS SEMINOVO (23/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('3d8ace38-d6a6-4502-a507-c04e3627a62d', 'IPHONE 12 64GB LILAS', '353342880337604', 1350.0, 1150.0, 20, 'vendido', 'seminovo', '2026-05-23', '2026-05-23', '2026-05-23', '2026-05-23');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('bbb21fda-8fe9-4926-9a7f-4bb4198f8476', 20, '25e2da5b-9e76-4388-9890-7e22efd6940d', 'concluida', 'normal', 1350.0, 1350.0, 0, 0, '2026-05-23');
UPDATE aparelhos SET venda_id = 'bbb21fda-8fe9-4926-9a7f-4bb4198f8476' WHERE id = '3d8ace38-d6a6-4502-a507-c04e3627a62d';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('9f9e5ed8-53a1-4e96-8ec7-8b0a3f526053', 'bbb21fda-8fe9-4926-9a7f-4bb4198f8476', 'pix', 1350.0, '2026-05-23', '2026-05-23');

-- VENDA 263: POCO C85 PRETO 256GB NOVO (23/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('bb56f076-7f4d-4ef2-abff-c383c1efb012', 'POCO C85 PRETO 256GB', '864280086544668', 997.0, 880.0, 1, 'vendido', 'novo', '2026-05-23', '2026-05-23', '2026-05-23', '2026-05-23');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('e57e1edf-c831-4627-8b39-25a458e2cd14', 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 997.0, 997.0, 0, 0, '2026-05-23');
UPDATE aparelhos SET venda_id = 'e57e1edf-c831-4627-8b39-25a458e2cd14' WHERE id = 'bb56f076-7f4d-4ef2-abff-c383c1efb012';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('580a60ad-4782-4fb5-87ef-129cc712c5e8', 'e57e1edf-c831-4627-8b39-25a458e2cd14', 'pix', 997.0, '2026-05-23', '2026-05-23');

-- VENDA 264: IPHONE 17 PRO MAX 1TB BRANCO NOVO (23/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('48d9fa75-6524-407e-ae77-b67336c32824', 'IPHONE 17 PRO MAX 1TB BRANCO', '350230970121553', 10678.0, 10300.0, 1, 'vendido', 'novo', '2026-05-23', '2026-05-23', '2026-05-23', '2026-05-23');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('46fde2b0-d947-4ba1-b124-5577a3731d84', 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 10678.0, 10678.0, 0, 0, '2026-05-23');
UPDATE aparelhos SET venda_id = '46fde2b0-d947-4ba1-b124-5577a3731d84' WHERE id = '48d9fa75-6524-407e-ae77-b67336c32824';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('74a9430c-e645-491d-be41-53957829a057', '46fde2b0-d947-4ba1-b124-5577a3731d84', 'pix', 10678.0, '2026-05-23', '2026-05-23');

-- Troca: IPH 16 PRO MAX BRANCO 256GB (R$ 4850.00)
INSERT INTO aparelhos (id, modelo, valor_compra, loja_id, status, estado, observacoes, data_entrada, criado_em, atualizado_em)
VALUES ('58178a9d-b5ed-4962-ad7b-37ecf61acafd', 'IPH 16 PRO MAX BRANCO 256GB', 4850.0, 1, 'disponivel', 'usado', 'Entrada por troca - venda 46fde2b0-d947-4ba1-b124-5577a3731d84', '2026-05-23', '2026-05-23', '2026-05-23');

-- VENDA 265: IPHONE 16 PRO MAX 256GB NATURAL SEMINOVO (23/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('ba336724-15d2-410e-b29f-d0d9e951fdca', 'IPHONE 16 PRO MAX 256GB NATURAL', '358245524573077', 5200.0, 4850.0, 1, 'vendido', 'seminovo', '2026-05-23', '2026-05-23', '2026-05-23', '2026-05-23');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('c3d65f34-baa0-4eae-8c22-062c9e372433', 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 5200.0, 5200.0, 0, 0, '2026-05-23');
UPDATE aparelhos SET venda_id = 'c3d65f34-baa0-4eae-8c22-062c9e372433' WHERE id = 'ba336724-15d2-410e-b29f-d0d9e951fdca';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('6f856b11-a855-4ebb-95e3-bded39d18155', 'c3d65f34-baa0-4eae-8c22-062c9e372433', 'pix', 5200.0, '2026-05-23', '2026-05-23');

-- Troca: IPH 14 PRO MAX (R$ 3100.00)
INSERT INTO aparelhos (id, modelo, valor_compra, loja_id, status, estado, observacoes, data_entrada, criado_em, atualizado_em)
VALUES ('07c2aa8a-e92e-45ea-969f-586963c391f9', 'IPH 14 PRO MAX', 3100.0, 1, 'disponivel', 'usado', 'Entrada por troca - venda c3d65f34-baa0-4eae-8c22-062c9e372433', '2026-05-23', '2026-05-23', '2026-05-23');

-- VENDA 266: IPHONE 17 PRO LARANJA 256GB NOVO (23/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('ac8ae310-b855-48e0-bc93-cfd5113a68af', 'IPHONE 17 PRO LARANJA 256GB', '352001995775691', 7450.0, 7300.0, 1, 'vendido', 'novo', '2026-05-23', '2026-05-23', '2026-05-23', '2026-05-23');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('2faaeab2-fee6-455a-bf24-3b1fbbdf532b', 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 7450.0, 7450.0, 0, 0, '2026-05-23');
UPDATE aparelhos SET venda_id = '2faaeab2-fee6-455a-bf24-3b1fbbdf532b' WHERE id = 'ac8ae310-b855-48e0-bc93-cfd5113a68af';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('5dc059a7-54ef-4539-998d-87a00e50be08', '2faaeab2-fee6-455a-bf24-3b1fbbdf532b', 'dinheiro', 7450.0, '2026-05-23', '2026-05-23');

-- Troca: IPH 16 PRO (R$ 4500.00)
INSERT INTO aparelhos (id, modelo, valor_compra, loja_id, status, estado, observacoes, data_entrada, criado_em, atualizado_em)
VALUES ('c07439b7-d077-4cdf-8e7b-8c30270e5f57', 'IPH 16 PRO', 4500.0, 1, 'disponivel', 'usado', 'Entrada por troca - venda 2faaeab2-fee6-455a-bf24-3b1fbbdf532b', '2026-05-23', '2026-05-23', '2026-05-23');

-- VENDA 267: ULTRA 3 NOVO PRETO (23/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('15875623-df70-4c12-b89d-68bf62044d28', 'ULTRA 3 NOVO PRETO', 'HV4QK4YL20', 4650.0, 4580.0, 1, 'vendido', 'novo', '2026-05-23', '2026-05-23', '2026-05-23', '2026-05-23');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('e7948627-157f-4f58-a15f-0201fcb36a4d', 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 4650.0, 4650.0, 0, 0, '2026-05-23');
UPDATE aparelhos SET venda_id = 'e7948627-157f-4f58-a15f-0201fcb36a4d' WHERE id = '15875623-df70-4c12-b89d-68bf62044d28';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('10472d38-54c6-4dd2-8a42-ffe7e34ef812', 'e7948627-157f-4f58-a15f-0201fcb36a4d', 'pix', 4650.0, '2026-05-23', '2026-05-23');

-- Troca: APPLE WATCH S8 (R$ 1000.00)
INSERT INTO aparelhos (id, modelo, valor_compra, loja_id, status, estado, observacoes, data_entrada, criado_em, atualizado_em)
VALUES ('d98d1c24-137f-4ffc-89a7-be80a942989f', 'APPLE WATCH S8', 1000.0, 1, 'disponivel', 'usado', 'Entrada por troca - venda e7948627-157f-4f58-a15f-0201fcb36a4d', '2026-05-23', '2026-05-23', '2026-05-23');

-- VENDA 268: TV Q LED TCL P7K (23/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('07e6e651-36a1-44eb-a512-72a60d692243', 'TV Q LED TCL P7K', 'TVQLEDP7KTCL', 4600.0, 3850.0, 1, 'vendido', 'seminovo', '2026-05-23', '2026-05-23', '2026-05-23', '2026-05-23');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('00c06dfa-86b8-42ea-92b8-958cbf4ba466', 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 4600.0, 4600.0, 0, 0, '2026-05-23');
UPDATE aparelhos SET venda_id = '00c06dfa-86b8-42ea-92b8-958cbf4ba466' WHERE id = '07e6e651-36a1-44eb-a512-72a60d692243';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('53d36b32-560e-494f-a0f5-293b068f9460', '00c06dfa-86b8-42ea-92b8-958cbf4ba466', 'pix', 4600.0, '2026-05-23', '2026-05-23');

-- Troca: IPH 13 128GB ROSA (R$ 1800.00)
INSERT INTO aparelhos (id, modelo, valor_compra, loja_id, status, estado, observacoes, data_entrada, criado_em, atualizado_em)
VALUES ('9d6d069e-f114-4c0c-bdff-a5ef7f49276a', 'IPH 13 128GB ROSA', 1800.0, 1, 'disponivel', 'usado', 'Entrada por troca - venda 00c06dfa-86b8-42ea-92b8-958cbf4ba466', '2026-05-23', '2026-05-23', '2026-05-23');

-- VENDA 269: IPHONE 15 PRO MAX 256GB PRETO SEMINOVO (23/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('5fd314df-a64f-4ab6-bab3-b847362d992c', 'IPHONE 15 PRO MAX 256GB PRETO', '352310725732009', 4000.0, 3700.0, 20, 'vendido', 'seminovo', '2026-05-23', '2026-05-23', '2026-05-23', '2026-05-23');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('47b9d1d9-7d65-44fb-94a2-efeed5d2d46e', 20, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 4000.0, 4000.0, 0, 0, '2026-05-23');
UPDATE aparelhos SET venda_id = '47b9d1d9-7d65-44fb-94a2-efeed5d2d46e' WHERE id = '5fd314df-a64f-4ab6-bab3-b847362d992c';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('02289682-7127-4919-bc6b-ea331338342f', '47b9d1d9-7d65-44fb-94a2-efeed5d2d46e', 'pix', 4000.0, '2026-05-23', '2026-05-23');

-- VENDA 270: IPHONE 17 PRO MAX 256GB  BRANCO NOVO (24/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('bfdef1de-0175-4591-9e28-817ddf9c32f1', 'IPHONE 17 PRO MAX 256GB  BRANCO', '350230976530443', 8296.0, 7850.0, 1, 'vendido', 'novo', '2026-05-24', '2026-05-24', '2026-05-24', '2026-05-24');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('df10057a-40f5-4835-b9cb-bd341da1d54c', 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 8296.0, 8296.0, 0, 0, '2026-05-24');
UPDATE aparelhos SET venda_id = 'df10057a-40f5-4835-b9cb-bd341da1d54c' WHERE id = 'bfdef1de-0175-4591-9e28-817ddf9c32f1';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('87803dc6-3c74-43c0-b81f-e89f7ac856d5', 'df10057a-40f5-4835-b9cb-bd341da1d54c', 'pix', 8296.0, '2026-05-24', '2026-05-24');

-- Troca: IPHONE 17 PRO MAX 256GB AZUL (R$ 3250.00)
INSERT INTO aparelhos (id, modelo, valor_compra, loja_id, status, estado, observacoes, data_entrada, criado_em, atualizado_em)
VALUES ('e97ff1a3-dd17-47b8-bad0-c6a75bbfa6da', 'IPHONE 17 PRO MAX 256GB AZUL', 3250.0, 1, 'disponivel', 'usado', 'Entrada por troca - venda df10057a-40f5-4835-b9cb-bd341da1d54c', '2026-05-24', '2026-05-24', '2026-05-24');

-- VENDA 271: IPHONE 14 PLUS 128GB LILAS SEMINOVO (24/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('2dc7dc32-7810-4672-a378-f146ad873809', 'IPHONE 14 PLUS 128GB LILAS', '358257930308303', 2400.0, 2150.0, 1, 'vendido', 'seminovo', '2026-05-24', '2026-05-24', '2026-05-24', '2026-05-24');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('8b87ec65-7a55-4fd5-99d0-64b299c98322', 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 2400.0, 2400.0, 0, 0, '2026-05-24');
UPDATE aparelhos SET venda_id = '8b87ec65-7a55-4fd5-99d0-64b299c98322' WHERE id = '2dc7dc32-7810-4672-a378-f146ad873809';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('921b8be3-ac5f-43fe-ab02-8ce55dcc5eda', '8b87ec65-7a55-4fd5-99d0-64b299c98322', 'pix', 2400.0, '2026-05-24', '2026-05-24');

-- VENDA 272: IPHONE 17 PRO MAX 256GB SILVER NOVO (24/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('7f46a3e2-5466-4859-b9ef-c23fe78aaf2d', 'IPHONE 17 PRO MAX 256GB SILVER', '351771409636900', 8250.0, 7900.0, 20, 'vendido', 'novo', '2026-05-24', '2026-05-24', '2026-05-24', '2026-05-24');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('dcea34e0-c4fc-4848-9f26-e098fb806f09', 20, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 8250.0, 8250.0, 0, 0, '2026-05-24');
UPDATE aparelhos SET venda_id = 'dcea34e0-c4fc-4848-9f26-e098fb806f09' WHERE id = '7f46a3e2-5466-4859-b9ef-c23fe78aaf2d';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('e8f5b048-9f46-4564-8373-b734c70467e1', 'dcea34e0-c4fc-4848-9f26-e098fb806f09', 'pix', 8250.0, '2026-05-24', '2026-05-24');

-- VENDA 273: REDMI NOTE 15 PRO 5G 256GB PRETO NOVO (24/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('53945f17-67d4-451e-91eb-0ce124d4592f', 'REDMI NOTE 15 PRO 5G 256GB PRETO', '863573084082744', 1850.0, 1660.0, 4, 'vendido', 'novo', '2026-05-24', '2026-05-24', '2026-05-24', '2026-05-24');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('397ad074-b4a8-4a19-88ac-cc04d1aed769', 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 1850.0, 1850.0, 0, 0, '2026-05-24');
UPDATE aparelhos SET venda_id = '397ad074-b4a8-4a19-88ac-cc04d1aed769' WHERE id = '53945f17-67d4-451e-91eb-0ce124d4592f';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('4682d9d0-af88-4359-9d5b-afa8b05b91ee', '397ad074-b4a8-4a19-88ac-cc04d1aed769', 'pix', 1850.0, '2026-05-24', '2026-05-24');

-- VENDA 274: IPHONE 15 PRO MAX 256GB AZUL SEMINOVO (24/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('3ca005cd-ce33-46fd-b871-1ad052ce6eac', 'IPHONE 15 PRO MAX 256GB AZUL', '354773167256449', 4093.0, 3700.0, 4, 'vendido', 'seminovo', '2026-05-24', '2026-05-24', '2026-05-24', '2026-05-24');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('b6689799-f4a9-499c-ab4e-58c9d4ae9d69', 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 4093.0, 4093.0, 0, 0, '2026-05-24');
UPDATE aparelhos SET venda_id = 'b6689799-f4a9-499c-ab4e-58c9d4ae9d69' WHERE id = '3ca005cd-ce33-46fd-b871-1ad052ce6eac';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('cc427a32-88df-4b49-81d6-045b04cf6c7d', 'b6689799-f4a9-499c-ab4e-58c9d4ae9d69', 'pix', 4093.0, '2026-05-24', '2026-05-24');

-- VENDA 275: IPHONE 17 PRO MAX 256GB AZUL LACRADO (24/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('2dc8524f-a651-4a23-9ccb-86cfeda4a209', 'IPHONE 17 PRO MAX 256GB AZUL', '359652122041986', 7800.0, 7650.0, 1, 'vendido', 'novo', '2026-05-24', '2026-05-24', '2026-05-24', '2026-05-24');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('d7a61f7c-b318-4324-9c53-ed36a7c07de9', 1, '9451cd9f-6770-4e32-aae8-c75fa675e818', 'concluida', 'normal', 7800.0, 7800.0, 0, 0, '2026-05-24');
UPDATE aparelhos SET venda_id = 'd7a61f7c-b318-4324-9c53-ed36a7c07de9' WHERE id = '2dc8524f-a651-4a23-9ccb-86cfeda4a209';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('eb83171e-4b3e-4fac-ba53-3628c25b5315', 'd7a61f7c-b318-4324-9c53-ed36a7c07de9', 'pix', 7800.0, '2026-05-24', '2026-05-24');

-- VENDA 276: IPHONE 16 PRO MAX 512GB PRETO SEMINOVO (24/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('3343ab19-9c8c-422b-a528-e0123b9f47f8', 'IPHONE 16 PRO MAX 512GB PRETO', '352641353019966', 5500.0, 5150.0, 4, 'vendido', 'seminovo', '2026-05-24', '2026-05-24', '2026-05-24', '2026-05-24');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('e476709e-965e-47b3-903c-027514ae68fc', 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 5500.0, 5500.0, 0, 0, '2026-05-24');
UPDATE aparelhos SET venda_id = 'e476709e-965e-47b3-903c-027514ae68fc' WHERE id = '3343ab19-9c8c-422b-a528-e0123b9f47f8';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('6c4cfa77-a0d9-4265-8a68-1bcdbb6b7a16', 'e476709e-965e-47b3-903c-027514ae68fc', 'pix', 5500.0, '2026-05-24', '2026-05-24');

-- Troca: UM 16 128 SEMINOVO (R$ 3100.00)
INSERT INTO aparelhos (id, modelo, valor_compra, loja_id, status, estado, observacoes, data_entrada, criado_em, atualizado_em)
VALUES ('dc9a8ba1-fdb3-436e-843e-799ef5c7e286', 'UM 16 128 SEMINOVO', 3100.0, 4, 'disponivel', 'novo', 'Entrada por troca - venda e476709e-965e-47b3-903c-027514ae68fc', '2026-05-24', '2026-05-24', '2026-05-24');

-- VENDA 277: IPHONE 17 PRO MAX 256GB AZUL NOVO (24/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('36f63b6c-dc5d-4754-b728-850ca162c053', 'IPHONE 17 PRO MAX 256GB AZUL', '353314497716249', 7860.0, 7650.0, 4, 'vendido', 'novo', '2026-05-24', '2026-05-24', '2026-05-24', '2026-05-24');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('fe5b9fa0-2e0d-43f3-9526-5945e42455d8', 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 7860.0, 7860.0, 0, 0, '2026-05-24');
UPDATE aparelhos SET venda_id = 'fe5b9fa0-2e0d-43f3-9526-5945e42455d8' WHERE id = '36f63b6c-dc5d-4754-b728-850ca162c053';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('98f1d6d4-de18-40fb-8f37-cc538a0a2e4f', 'fe5b9fa0-2e0d-43f3-9526-5945e42455d8', 'pix', 7860.0, '2026-05-24', '2026-05-24');

-- VENDA 278: IPAD AIR M4 11° SPACE GRAY NOVO (24/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('d1c18bea-3fd2-4f08-9cc3-0e9c938aef3a', 'IPAD AIR M4 11° SPACE GRAY', 'DGM6TN696L', 3900.0, 3650.0, 4, 'vendido', 'novo', '2026-05-24', '2026-05-24', '2026-05-24', '2026-05-24');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('6b9bd1fa-6f37-4c54-b9bc-8b61d46596c1', 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 3900.0, 3900.0, 0, 0, '2026-05-24');
UPDATE aparelhos SET venda_id = '6b9bd1fa-6f37-4c54-b9bc-8b61d46596c1' WHERE id = 'd1c18bea-3fd2-4f08-9cc3-0e9c938aef3a';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('dd89bc3c-2b6a-416a-aa4e-6fcba1bf677a', '6b9bd1fa-6f37-4c54-b9bc-8b61d46596c1', 'pix', 3900.0, '2026-05-24', '2026-05-24');

-- VENDA 279: AIPORDS PRO 3 BRANCO NOVO (24/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('3aeaeba3-5ff7-4ff9-8f38-e226c6930dcf', 'AIPORDS PRO 3 BRANCO', 'DKQV09VNQJ', 1520.0, 1435.0, 4, 'vendido', 'novo', '2026-05-24', '2026-05-24', '2026-05-24', '2026-05-24');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('e7356079-9159-4132-b7a6-2a0c76c029ca', 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 1520.0, 1520.0, 0, 0, '2026-05-24');
UPDATE aparelhos SET venda_id = 'e7356079-9159-4132-b7a6-2a0c76c029ca' WHERE id = '3aeaeba3-5ff7-4ff9-8f38-e226c6930dcf';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('526fe7b6-1299-4c45-b626-ed9f3cfa4932', 'e7356079-9159-4132-b7a6-2a0c76c029ca', 'pix', 1520.0, '2026-05-24', '2026-05-24');

-- VENDA 280: REDMI NOTE 15 PRO 4G 512GB TITANIO NOVO (24/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('b4bfd62c-6da6-4d1c-a8b3-d33c387d4b71', 'REDMI NOTE 15 PRO 4G 512GB TITANIO', '863911087323881', 1900.0, 1800.0, 4, 'vendido', 'novo', '2026-05-24', '2026-05-24', '2026-05-24', '2026-05-24');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('2c6ada29-53ed-48d2-87eb-39388473bb1c', 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 1900.0, 1900.0, 0, 0, '2026-05-24');
UPDATE aparelhos SET venda_id = '2c6ada29-53ed-48d2-87eb-39388473bb1c' WHERE id = 'b4bfd62c-6da6-4d1c-a8b3-d33c387d4b71';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('c5c8c434-4106-4312-8042-8aec85417b08', '2c6ada29-53ed-48d2-87eb-39388473bb1c', 'dinheiro', 1900.0, '2026-05-24', '2026-05-24');

-- VENDA 281: IPHONE 17 PRO 256GB SILVER SEMINOVO (24/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('e7cafcd1-557d-47e8-b7a6-9298a91cffa4', 'IPHONE 17 PRO 256GB SILVER', '350455778567174', 6750.0, 6100.0, 20, 'vendido', 'seminovo', '2026-05-24', '2026-05-24', '2026-05-24', '2026-05-24');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('fb38b7cc-e4b2-42b4-a21e-271f9319c32a', 20, 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 'concluida', 'normal', 6750.0, 6750.0, 0, 0, '2026-05-24');
UPDATE aparelhos SET venda_id = 'fb38b7cc-e4b2-42b4-a21e-271f9319c32a' WHERE id = 'e7cafcd1-557d-47e8-b7a6-9298a91cffa4';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('650759b6-a76f-4a03-9c3b-059157af99a2', 'fb38b7cc-e4b2-42b4-a21e-271f9319c32a', 'cartao_credito', 6750.0, '2026-05-24', '2026-05-24');

-- Troca: 15 PRO 256 AZUL (R$ 3100.00)
INSERT INTO aparelhos (id, modelo, valor_compra, loja_id, status, estado, observacoes, data_entrada, criado_em, atualizado_em)
VALUES ('03ed2459-d156-4f21-a922-136f70a35fee', '15 PRO 256 AZUL', 3100.0, 20, 'disponivel', 'usado', 'Entrada por troca - venda fb38b7cc-e4b2-42b4-a21e-271f9319c32a', '2026-05-24', '2026-05-24', '2026-05-24');

-- VENDA 282: IPHONE 13 PRO 128GB SEMINOVO (24/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('77518c33-b62d-42f0-88d8-dda4aff7848c', 'IPHONE 13 PRO 128GB', '354903621734992', 2400.0, 2300.0, 19, 'vendido', 'seminovo', '2026-05-24', '2026-05-24', '2026-05-24', '2026-05-24');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('6626f7ad-0967-4762-b171-0c441c78a1d9', 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 2400.0, 2400.0, 0, 0, '2026-05-24');
UPDATE aparelhos SET venda_id = '6626f7ad-0967-4762-b171-0c441c78a1d9' WHERE id = '77518c33-b62d-42f0-88d8-dda4aff7848c';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('6f6037e2-be1b-433e-8352-2dbcc21c0b8a', '6626f7ad-0967-4762-b171-0c441c78a1d9', 'dinheiro', 2400.0, '2026-05-24', '2026-05-24');

-- VENDA 283: IPHONE 16 PRO MAX 1TB BRANCO SEMINOVO (24/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('08d8a287-995d-4b52-b83b-79eb7c89464b', 'IPHONE 16 PRO MAX 1TB BRANCO', '356864569095853', 5800.0, 5300.0, 19, 'vendido', 'seminovo', '2026-05-24', '2026-05-24', '2026-05-24', '2026-05-24');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('63228351-6ee3-44c4-a3bc-da547f9112f2', 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 5800.0, 5800.0, 0, 0, '2026-05-24');
UPDATE aparelhos SET venda_id = '63228351-6ee3-44c4-a3bc-da547f9112f2' WHERE id = '08d8a287-995d-4b52-b83b-79eb7c89464b';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('f374a254-8c7f-45c4-b812-8d94fa7445a5', '63228351-6ee3-44c4-a3bc-da547f9112f2', 'cartao_credito', 5800.0, '2026-05-24', '2026-05-24');

-- VENDA 284: IPHONE 13 128GB AZUL SEMINOVO (24/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('773385c9-6eae-48ca-9e3b-b73dde16f4ac', 'IPHONE 13 128GB AZUL', '350196694023757', 2075.0, 1780.0, 19, 'vendido', 'seminovo', '2026-05-24', '2026-05-24', '2026-05-24', '2026-05-24');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('2b4b5643-f8b8-40a3-b742-2f281ff5736f', 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 2075.0, 2075.0, 0, 0, '2026-05-24');
UPDATE aparelhos SET venda_id = '2b4b5643-f8b8-40a3-b742-2f281ff5736f' WHERE id = '773385c9-6eae-48ca-9e3b-b73dde16f4ac';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('4369616c-7c1d-45cd-8dfc-557d98208a75', '2b4b5643-f8b8-40a3-b742-2f281ff5736f', 'cartao_credito', 2075.0, '2026-05-24', '2026-05-24');

-- VENDA 285: IPHONE 17 PRO MAX 256GB NOVO (24/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('bbf60ce9-4c12-47bb-b1d2-b78ea78faee2', 'IPHONE 17 PRO MAX 256GB', '353763614060768', 7875.0, 7650.0, 19, 'vendido', 'novo', '2026-05-24', '2026-05-24', '2026-05-24', '2026-05-24');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('179adefc-5345-43ff-bfdc-ef6e3aced669', 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 7875.0, 7875.0, 0, 0, '2026-05-24');
UPDATE aparelhos SET venda_id = '179adefc-5345-43ff-bfdc-ef6e3aced669' WHERE id = 'bbf60ce9-4c12-47bb-b1d2-b78ea78faee2';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('14f16f30-6100-49e7-a083-42c7cc13d89d', '179adefc-5345-43ff-bfdc-ef6e3aced669', 'cartao_credito', 7875.0, '2026-05-24', '2026-05-24');

-- VENDA 286: IPHONE 17 PRO MAX 256GB SILVER NOVO (24/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('87516f7b-5599-4322-8928-f98ea9828f21', 'IPHONE 17 PRO MAX 256GB SILVER', '357247256152923', 7950.0, 7850.0, 19, 'vendido', 'novo', '2026-05-24', '2026-05-24', '2026-05-24', '2026-05-24');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('0af41928-44d2-40d7-8821-dd9604d87588', 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 7950.0, 7950.0, 0, 0, '2026-05-24');
UPDATE aparelhos SET venda_id = '0af41928-44d2-40d7-8821-dd9604d87588' WHERE id = '87516f7b-5599-4322-8928-f98ea9828f21';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('203bbd75-af45-4cd1-9210-39bdef8bdd01', '0af41928-44d2-40d7-8821-dd9604d87588', 'pix', 7950.0, '2026-05-24', '2026-05-24');

-- VENDA 287: APPLE PENCIL USB C NOVO (24/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('f8d0ed5f-83da-4f8f-b806-483c8931e305', 'APPLE PENCIL USB C', 'H4719R9MG2', 770.0, 630.0, 19, 'vendido', 'novo', '2026-05-24', '2026-05-24', '2026-05-24', '2026-05-24');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('67deb2e8-e0c0-484e-bfea-33aff07945a1', 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 770.0, 770.0, 0, 0, '2026-05-24');
UPDATE aparelhos SET venda_id = '67deb2e8-e0c0-484e-bfea-33aff07945a1' WHERE id = 'f8d0ed5f-83da-4f8f-b806-483c8931e305';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('c3e7e141-b2ad-4a11-b262-2b381ef83254', '67deb2e8-e0c0-484e-bfea-33aff07945a1', 'pix', 770.0, '2026-05-24', '2026-05-24');

-- VENDA 288: IPAD 11 128GB ROSA NOVO (24/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('9a520865-cb11-4427-97f7-4142da0310cd', 'IPAD 11 128GB ROSA', 'FCYK60J9ML', 2190.0, 2090.0, 19, 'vendido', 'novo', '2026-05-24', '2026-05-24', '2026-05-24', '2026-05-24');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('b64aa8ef-997c-47c4-81a5-70e7abadfe13', 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 2190.0, 2190.0, 0, 0, '2026-05-24');
UPDATE aparelhos SET venda_id = 'b64aa8ef-997c-47c4-81a5-70e7abadfe13' WHERE id = '9a520865-cb11-4427-97f7-4142da0310cd';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('f9febaf0-2195-46e6-b0cd-d1e5c9e9464e', 'b64aa8ef-997c-47c4-81a5-70e7abadfe13', 'pix', 2190.0, '2026-05-24', '2026-05-24');

-- VENDA 289: AIRPORDS PRO 3 NOVO (24/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('cf89a0a9-d1c0-4c41-aea9-b84155c813f9', 'AIRPORDS PRO 3', 'LLG9MVVVJ9', 1590.0, 1490.0, 19, 'vendido', 'novo', '2026-05-24', '2026-05-24', '2026-05-24', '2026-05-24');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('5762dae5-178e-458c-9271-f09d263a4f57', 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 1590.0, 1590.0, 0, 0, '2026-05-24');
UPDATE aparelhos SET venda_id = '5762dae5-178e-458c-9271-f09d263a4f57' WHERE id = 'cf89a0a9-d1c0-4c41-aea9-b84155c813f9';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('a92ce7a4-fcbe-4fa7-8a55-5f0bfc4c78e0', '5762dae5-178e-458c-9271-f09d263a4f57', 'pix', 1590.0, '2026-05-24', '2026-05-24');

-- VENDA 290: IPHONE 14 128GB BRANCO SEMINOVO (26/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('e97fbedd-4bcb-4a09-b728-a1ad77ebc041', 'IPHONE 14 128GB BRANCO', '355794428661143', 2150.0, 1900.0, 20, 'vendido', 'seminovo', '2026-05-26', '2026-05-26', '2026-05-26', '2026-05-26');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('8165bbd4-08b8-49ac-9b8f-cc116395a16a', 20, 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 'concluida', 'normal', 2150.0, 2150.0, 0, 0, '2026-05-26');
UPDATE aparelhos SET venda_id = '8165bbd4-08b8-49ac-9b8f-cc116395a16a' WHERE id = 'e97fbedd-4bcb-4a09-b728-a1ad77ebc041';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('2ef9f696-55a1-49b2-9433-45635733d7d4', '8165bbd4-08b8-49ac-9b8f-cc116395a16a', 'cartao_credito', 2150.0, '2026-05-26', '2026-05-26');

-- VENDA 291: IPHONE 15 PRO MAX 256GB PRETO SEMINOVO (26/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('1afb2297-b406-4abf-9906-282e13ef4eb1', 'IPHONE 15 PRO MAX 256GB PRETO', '359897655192066', 4150.0, 3700.0, 4, 'vendido', 'seminovo', '2026-05-26', '2026-05-26', '2026-05-26', '2026-05-26');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('974f8b5c-480b-4f28-b332-c8f611e684b8', 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 4150.0, 4150.0, 0, 0, '2026-05-26');
UPDATE aparelhos SET venda_id = '974f8b5c-480b-4f28-b332-c8f611e684b8' WHERE id = '1afb2297-b406-4abf-9906-282e13ef4eb1';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('84a25c9c-b450-4b88-8b54-a263413ad18f', '974f8b5c-480b-4f28-b332-c8f611e684b8', 'cartao_credito', 4150.0, '2026-05-26', '2026-05-26');

-- VENDA 292: IPAD 11° (A16) 128GB SILVER (26/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('064823ea-e7de-4fa1-954d-0c38f0f26576', 'IPAD 11° (A16) 128GB SILVER', 'CKGH9XQDXG', 2500.0, 2180.0, 4, 'vendido', 'seminovo', '2026-05-26', '2026-05-26', '2026-05-26', '2026-05-26');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('7a7cf1fc-f428-497d-8adc-c3b870b159c4', 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 2500.0, 2500.0, 0, 0, '2026-05-26');
UPDATE aparelhos SET venda_id = '7a7cf1fc-f428-497d-8adc-c3b870b159c4' WHERE id = '064823ea-e7de-4fa1-954d-0c38f0f26576';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('501c978a-bc01-43f6-8df0-8fb6bce5a89d', '7a7cf1fc-f428-497d-8adc-c3b870b159c4', 'pix', 2500.0, '2026-05-26', '2026-05-26');

-- VENDA 293: BOOMBOX 4 LARANJA NOVO (26/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('9406313c-dc3d-40e6-bb2b-47b4e89141f4', 'BOOMBOX 4 LARANJA', 'TL1973-BQ0009136', 2640.0, 2390.0, 4, 'vendido', 'novo', '2026-05-26', '2026-05-26', '2026-05-26', '2026-05-26');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('d59a3484-1a71-402c-802d-ebbc4bce4d64', 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 2640.0, 2640.0, 0, 0, '2026-05-26');
UPDATE aparelhos SET venda_id = 'd59a3484-1a71-402c-802d-ebbc4bce4d64' WHERE id = '9406313c-dc3d-40e6-bb2b-47b4e89141f4';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('3b4dcfd0-fba1-4856-a244-cf1d2e7e1b6f', 'd59a3484-1a71-402c-802d-ebbc4bce4d64', 'pix', 2640.0, '2026-05-26', '2026-05-26');

-- VENDA 294: IPHONE 16 PRO MAX 256GB PRETO SEMINOVO (26/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('d3a1862e-062f-4e9a-b68f-ad0a6a4cff5b', 'IPHONE 16 PRO MAX 256GB PRETO', '357003196809944', 5100.0, 4850.0, 4, 'vendido', 'seminovo', '2026-05-26', '2026-05-26', '2026-05-26', '2026-05-26');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('e3911de2-4def-42ce-a376-94e2212cacb7', 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 5100.0, 5100.0, 0, 0, '2026-05-26');
UPDATE aparelhos SET venda_id = 'e3911de2-4def-42ce-a376-94e2212cacb7' WHERE id = 'd3a1862e-062f-4e9a-b68f-ad0a6a4cff5b';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('d4d63a34-e8f5-4c5b-a9d2-4daf5413e3ca', 'e3911de2-4def-42ce-a376-94e2212cacb7', 'pix', 5100.0, '2026-05-26', '2026-05-26');

-- VENDA 295: IPHONE 17 256GB  BRANCO NOVO (26/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('4525d9c9-b363-481e-8268-e706a8961476', 'IPHONE 17 256GB  BRANCO', '352824562423886', 4850.0, 4600.0, 20, 'vendido', 'novo', '2026-05-26', '2026-05-26', '2026-05-26', '2026-05-26');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('793404f6-44c6-4166-b8c4-d0d0b06af2f1', 20, '25e2da5b-9e76-4388-9890-7e22efd6940d', 'concluida', 'normal', 4850.0, 4850.0, 0, 0, '2026-05-26');
UPDATE aparelhos SET venda_id = '793404f6-44c6-4166-b8c4-d0d0b06af2f1' WHERE id = '4525d9c9-b363-481e-8268-e706a8961476';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('5b7ccc58-da85-4c67-847b-4a973472b7f3', '793404f6-44c6-4166-b8c4-d0d0b06af2f1', 'dinheiro', 4850.0, '2026-05-26', '2026-05-26');

-- Troca: DE 13 128 GB BRANCO - : (R$ 1600.00)
INSERT INTO aparelhos (id, modelo, valor_compra, loja_id, status, estado, observacoes, data_entrada, criado_em, atualizado_em)
VALUES ('cf67c933-e215-4ed2-a4ce-d029e19268af', 'DE 13 128 GB BRANCO - :', 1600.0, 20, 'disponivel', 'usado', 'Entrada por troca - venda 793404f6-44c6-4166-b8c4-d0d0b06af2f1', '2026-05-26', '2026-05-26', '2026-05-26');

-- VENDA 296: IPHONE 16 PRO MAX 1TB PRETO NOVO (26/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('d7c6fe8a-079a-4840-80c5-425514a4d3ca', 'IPHONE 16 PRO MAX 1TB PRETO', '359222380985702', 5800.0, 5300.0, 20, 'vendido', 'novo', '2026-05-26', '2026-05-26', '2026-05-26', '2026-05-26');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('51fb88b1-1d8e-4872-a6ed-3ee2af2b69c7', 20, '25e2da5b-9e76-4388-9890-7e22efd6940d', 'concluida', 'normal', 5800.0, 5800.0, 0, 0, '2026-05-26');
UPDATE aparelhos SET venda_id = '51fb88b1-1d8e-4872-a6ed-3ee2af2b69c7' WHERE id = 'd7c6fe8a-079a-4840-80c5-425514a4d3ca';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('c90267f1-2a84-4202-a3e4-9d2ba36762e0', '51fb88b1-1d8e-4872-a6ed-3ee2af2b69c7', 'pix', 5800.0, '2026-05-26', '2026-05-26');

-- VENDA 297: IPHONE 16 PRO MAX 256GB PRETO SEMINOVO (26/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('447ebd45-31f9-4087-9671-ebd14af7a7e0', 'IPHONE 16 PRO MAX 256GB PRETO', '359222385905622', 5150.0, 4850.0, 19, 'vendido', 'seminovo', '2026-05-26', '2026-05-26', '2026-05-26', '2026-05-26');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('8b5e76fa-ca01-4a68-85d7-3c4d3d496069', 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 5150.0, 5150.0, 0, 0, '2026-05-26');
UPDATE aparelhos SET venda_id = '8b5e76fa-ca01-4a68-85d7-3c4d3d496069' WHERE id = '447ebd45-31f9-4087-9671-ebd14af7a7e0';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('74ee6548-78e6-4b09-8c98-e6dfd35ac450', '8b5e76fa-ca01-4a68-85d7-3c4d3d496069', 'dinheiro', 5150.0, '2026-05-26', '2026-05-26');

-- VENDA 298: IPHONE 17 PRO MAX SILVER 256GB NOVO (27/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('ad686a7f-a902-4839-93a1-ed1ad6990def', 'IPHONE 17 PRO MAX SILVER 256GB', 'CYFWFHQWXC', 7999.99, 1800.0, 4, 'vendido', 'novo', '2026-05-27', '2026-05-27', '2026-05-27', '2026-05-27');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('fa2aca8c-010d-4225-bb1f-0ffebab768b1', 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 7999.99, 7999.99, 0, 0, '2026-05-27');
UPDATE aparelhos SET venda_id = 'fa2aca8c-010d-4225-bb1f-0ffebab768b1' WHERE id = 'ad686a7f-a902-4839-93a1-ed1ad6990def';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('78337f3f-59cf-4925-9601-a54eaf912334', 'fa2aca8c-010d-4225-bb1f-0ffebab768b1', 'pix', 7999.99, '2026-05-27', '2026-05-27');

-- VENDA 299: REDMI NOTE 15 PRO PLUS 5G PRETO NOVO (27/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('463b03b0-233c-42a3-b91d-b285f2e1a716', 'REDMI NOTE 15 PRO PLUS 5G PRETO', '8638440867199603', 1990.0, 1880.0, 4, 'vendido', 'novo', '2026-05-27', '2026-05-27', '2026-05-27', '2026-05-27');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('8ed05437-daeb-45c5-996d-aa22e04aeaf5', 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 1990.0, 1990.0, 0, 0, '2026-05-27');
UPDATE aparelhos SET venda_id = '8ed05437-daeb-45c5-996d-aa22e04aeaf5' WHERE id = '463b03b0-233c-42a3-b91d-b285f2e1a716';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('eb4b8390-12f5-4791-a275-d5a9a597aabe', '8ed05437-daeb-45c5-996d-aa22e04aeaf5', 'pix', 1990.0, '2026-05-27', '2026-05-27');

-- VENDA 300: IPHONE 13 128GB AZUL SEMINOVO (27/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('19f09f22-6bb2-41a5-9772-d2385f4e2615', 'IPHONE 13 128GB AZUL', '352586507807406', 2093.0, 1780.0, 4, 'vendido', 'seminovo', '2026-05-27', '2026-05-27', '2026-05-27', '2026-05-27');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('9a733272-94b6-4e91-9e06-9a7862acb8e5', 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 2093.0, 2093.0, 0, 0, '2026-05-27');
UPDATE aparelhos SET venda_id = '9a733272-94b6-4e91-9e06-9a7862acb8e5' WHERE id = '19f09f22-6bb2-41a5-9772-d2385f4e2615';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('08f1ea8f-029d-49c9-98b6-67b3d8150a17', '9a733272-94b6-4e91-9e06-9a7862acb8e5', 'cartao_credito', 2093.0, '2026-05-27', '2026-05-27');

-- VENDA 301: IPHONE 15 PRO MAX 256GB AZUL SEMINOVO (27/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('c46baa0a-77d0-408f-aa87-9e3b0c24bed0', 'IPHONE 15 PRO MAX 256GB AZUL', '354679846995259', 3950.0, 3700.0, 20, 'vendido', 'seminovo', '2026-05-27', '2026-05-27', '2026-05-27', '2026-05-27');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('f3fe25ff-a364-40f6-80d0-c75c330b0c48', 20, '25e2da5b-9e76-4388-9890-7e22efd6940d', 'concluida', 'normal', 3950.0, 3950.0, 0, 0, '2026-05-27');
UPDATE aparelhos SET venda_id = 'f3fe25ff-a364-40f6-80d0-c75c330b0c48' WHERE id = 'c46baa0a-77d0-408f-aa87-9e3b0c24bed0';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('d1e0619e-22b6-4eb4-9fbd-928b053fca54', 'f3fe25ff-a364-40f6-80d0-c75c330b0c48', 'pix', 3950.0, '2026-05-27', '2026-05-27');

-- VENDA 302: IPHONE 12 64GB BRANCO SEMINOVO (27/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('1df24751-0042-4606-8f9d-0354bf459ab2', 'IPHONE 12 64GB BRANCO', '359827481625484', 1395.0, 1150.0, 1, 'vendido', 'seminovo', '2026-05-27', '2026-05-27', '2026-05-27', '2026-05-27');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('657d85ad-1fa7-484b-bf5e-bd62d7daee18', 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 1395.0, 1395.0, 0, 0, '2026-05-27');
UPDATE aparelhos SET venda_id = '657d85ad-1fa7-484b-bf5e-bd62d7daee18' WHERE id = '1df24751-0042-4606-8f9d-0354bf459ab2';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('0f364e04-d8bf-4e5a-bed9-da8cfd0ef78c', '657d85ad-1fa7-484b-bf5e-bd62d7daee18', 'pix', 1395.0, '2026-05-27', '2026-05-27');

-- VENDA 303: POCO C85 PRETO 256GB NOVO (27/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('f2329c23-c9c7-4ca7-b9c0-827fc5de82ac', 'POCO C85 PRETO 256GB', '864280089992609', 1445.0, 860.0, 1, 'vendido', 'novo', '2026-05-27', '2026-05-27', '2026-05-27', '2026-05-27');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('dffd2f13-934d-44cd-82e9-9cbf109b1231', 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 1445.0, 1445.0, 0, 0, '2026-05-27');
UPDATE aparelhos SET venda_id = 'dffd2f13-934d-44cd-82e9-9cbf109b1231' WHERE id = 'f2329c23-c9c7-4ca7-b9c0-827fc5de82ac';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('11a3d56d-16d4-4741-9109-52eae374b1db', 'dffd2f13-934d-44cd-82e9-9cbf109b1231', 'pix', 1445.0, '2026-05-27', '2026-05-27');

-- VENDA 304: IPHONE 17 PRO 256GB AZUL SEMINOVO (27/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('32f5ff65-6e11-4d11-a03a-60755b780d19', 'IPHONE 17 PRO 256GB AZUL', '354956977489959', 6500.0, 6230.0, 19, 'vendido', 'seminovo', '2026-05-27', '2026-05-27', '2026-05-27', '2026-05-27');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('ede8ff75-9810-4c71-811f-b46396b8502f', 19, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 6500.0, 6500.0, 0, 0, '2026-05-27');
UPDATE aparelhos SET venda_id = 'ede8ff75-9810-4c71-811f-b46396b8502f' WHERE id = '32f5ff65-6e11-4d11-a03a-60755b780d19';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('861086b9-cae7-4e4b-835b-9ad04a9a75c7', 'ede8ff75-9810-4c71-811f-b46396b8502f', 'pix', 6500.0, '2026-05-27', '2026-05-27');

-- Troca: IPH 14 256GB (R$ 2000.00)
INSERT INTO aparelhos (id, modelo, valor_compra, loja_id, status, estado, observacoes, data_entrada, criado_em, atualizado_em)
VALUES ('11132845-332d-404c-80b7-8cce81be2fbc', 'IPH 14 256GB', 2000.0, 19, 'disponivel', 'usado', 'Entrada por troca - venda ede8ff75-9810-4c71-811f-b46396b8502f', '2026-05-27', '2026-05-27', '2026-05-27');

-- VENDA 305: IPHONE 16 PRO MAX 256GB DOURADO SEMINOVO (27/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('c2eebb6a-5057-407c-87f0-2c36f990814c', 'IPHONE 16 PRO MAX 256GB DOURADO', '357205989970540', 5250.0, 4850.0, 1, 'vendido', 'seminovo', '2026-05-27', '2026-05-27', '2026-05-27', '2026-05-27');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('fd6664f9-cd66-4506-b12b-4ffcb63edefc', 1, '9451cd9f-6770-4e32-aae8-c75fa675e818', 'concluida', 'normal', 5250.0, 5250.0, 0, 0, '2026-05-27');
UPDATE aparelhos SET venda_id = 'fd6664f9-cd66-4506-b12b-4ffcb63edefc' WHERE id = 'c2eebb6a-5057-407c-87f0-2c36f990814c';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('c5926d68-75a8-4e4e-90ac-6107539481a8', 'fd6664f9-cd66-4506-b12b-4ffcb63edefc', 'pix', 5250.0, '2026-05-27', '2026-05-27');

-- VENDA 306: IPHONE 16 PRETO 128GB SEMINOVO (27/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('aad3d948-8b49-4b67-b2ab-69dd2e8b6c19', 'IPHONE 16 PRETO 128GB', '358964582664046', 3400.0, 3050.0, 19, 'vendido', 'seminovo', '2026-05-27', '2026-05-27', '2026-05-27', '2026-05-27');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('e8f3956d-3dbb-44de-bded-6e229934f37d', 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 3400.0, 3400.0, 0, 0, '2026-05-27');
UPDATE aparelhos SET venda_id = 'e8f3956d-3dbb-44de-bded-6e229934f37d' WHERE id = 'aad3d948-8b49-4b67-b2ab-69dd2e8b6c19';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('48e8759d-0ccc-47b4-a374-23003f34c983', 'e8f3956d-3dbb-44de-bded-6e229934f37d', 'pix', 3400.0, '2026-05-27', '2026-05-27');

-- VENDA 307: IPHONE 17 PRO 256GB BRANCO SEMINOVO (27/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('433bacac-0442-4482-ba73-3f0a9079b701', 'IPHONE 17 PRO 256GB BRANCO', '350455774133336', 6300.0, 6100.0, 1, 'vendido', 'seminovo', '2026-05-27', '2026-05-27', '2026-05-27', '2026-05-27');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('003a76cd-3e07-44b6-9477-48e4c00fb85b', 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 6300.0, 6300.0, 0, 0, '2026-05-27');
UPDATE aparelhos SET venda_id = '003a76cd-3e07-44b6-9477-48e4c00fb85b' WHERE id = '433bacac-0442-4482-ba73-3f0a9079b701';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('5f8bd6ec-e272-4207-a158-7fa9733632aa', '003a76cd-3e07-44b6-9477-48e4c00fb85b', 'pix', 6300.0, '2026-05-27', '2026-05-27');

-- VENDA 308: IPHONE 14 128GB PRETO SEMINOVO (28/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('d128e5dc-b518-49a1-834d-399d03b4493b', 'IPHONE 14 128GB PRETO', '352051682197220', 2200.0, 1900.0, 4, 'vendido', 'seminovo', '2026-05-28', '2026-05-28', '2026-05-28', '2026-05-28');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('a93993f0-910d-49be-8818-6c71b3eb9bd6', 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 2200.0, 2200.0, 0, 0, '2026-05-28');
UPDATE aparelhos SET venda_id = 'a93993f0-910d-49be-8818-6c71b3eb9bd6' WHERE id = 'd128e5dc-b518-49a1-834d-399d03b4493b';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('1080bfdd-9cca-41f5-828b-c5de4f2b9159', 'a93993f0-910d-49be-8818-6c71b3eb9bd6', 'pix', 2200.0, '2026-05-28', '2026-05-28');

-- VENDA 309: IPHONE 17 PRO 256GB BRANCO SEMINOVO (28/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('c83c33d2-386c-4623-b413-fb3a107d7546', 'IPHONE 17 PRO 256GB BRANCO', '354996269680378', 6600.0, 6100.0, 4, 'vendido', 'seminovo', '2026-05-28', '2026-05-28', '2026-05-28', '2026-05-28');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('f6a779a7-3474-4ba5-9395-bd7b55a9dec7', 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 6600.0, 6600.0, 0, 0, '2026-05-28');
UPDATE aparelhos SET venda_id = 'f6a779a7-3474-4ba5-9395-bd7b55a9dec7' WHERE id = 'c83c33d2-386c-4623-b413-fb3a107d7546';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('3c5b8461-670d-4344-916d-fe68e4fab728', 'f6a779a7-3474-4ba5-9395-bd7b55a9dec7', 'pix', 6600.0, '2026-05-28', '2026-05-28');

-- VENDA 310: IPHONE 17 PRO 256GB BRANCO SEMINOVO (28/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('c1e80274-2d64-4961-b63a-41d629404040', 'IPHONE 17 PRO 256GB BRANCO', '352294449113888', 6650.0, 6100.0, 4, 'vendido', 'seminovo', '2026-05-28', '2026-05-28', '2026-05-28', '2026-05-28');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('854ff649-e5b4-42b5-bf8a-f8850229fcea', 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 6650.0, 6650.0, 0, 0, '2026-05-28');
UPDATE aparelhos SET venda_id = '854ff649-e5b4-42b5-bf8a-f8850229fcea' WHERE id = 'c1e80274-2d64-4961-b63a-41d629404040';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('4d44e4dc-acfc-41e9-b517-a9635960eeb6', '854ff649-e5b4-42b5-bf8a-f8850229fcea', 'cartao_credito', 6650.0, '2026-05-28', '2026-05-28');

-- VENDA 311: IPHONE 12 PRO MAX 256GB GRAFITE SEMINOVO (28/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('775ad7cd-8e84-4d56-a244-25dfcc3e9594', 'IPHONE 12 PRO MAX 256GB GRAFITE', '353167663221083', 2576.0, 2300.0, 4, 'vendido', 'seminovo', '2026-05-28', '2026-05-28', '2026-05-28', '2026-05-28');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('d2d1d63b-37bb-4089-9f0f-e77779012c41', 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 2576.0, 2576.0, 0, 0, '2026-05-28');
UPDATE aparelhos SET venda_id = 'd2d1d63b-37bb-4089-9f0f-e77779012c41' WHERE id = '775ad7cd-8e84-4d56-a244-25dfcc3e9594';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('1694c1d6-0fd2-4ded-9b0d-92d0962f4902', 'd2d1d63b-37bb-4089-9f0f-e77779012c41', 'pix', 2576.0, '2026-05-28', '2026-05-28');

-- VENDA 312: IPHONE 12 PRO MAX 256GB GRAFITE SEMINOVO (28/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('623d4a71-60bb-4506-9e66-6082a99b2438', 'IPHONE 12 PRO MAX 256GB GRAFITE', '357061220988803', 2576.0, 2300.0, 4, 'vendido', 'seminovo', '2026-05-28', '2026-05-28', '2026-05-28', '2026-05-28');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('56e854ab-5084-4e8f-b15c-58500512a4ae', 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 2576.0, 2576.0, 0, 0, '2026-05-28');
UPDATE aparelhos SET venda_id = '56e854ab-5084-4e8f-b15c-58500512a4ae' WHERE id = '623d4a71-60bb-4506-9e66-6082a99b2438';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('67791f51-251d-4f7b-8bc2-702e75b20cb9', '56e854ab-5084-4e8f-b15c-58500512a4ae', 'pix', 2576.0, '2026-05-28', '2026-05-28');

-- VENDA 313: IPHONE 16 PRO MAX 256GB DESERT SEMINOVO (28/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('dbf1203b-a887-4f44-a7a1-882b8281df79', 'IPHONE 16 PRO MAX 256GB DESERT', '353484626443138', 5446.0, 5000.0, 1, 'vendido', 'seminovo', '2026-05-28', '2026-05-28', '2026-05-28', '2026-05-28');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('c7ac418a-5f36-46e2-b3df-693b8770fd38', 1, '1d12d555-68e9-45f8-bfc0-a35a1d8d7920', 'concluida', 'normal', 5446.0, 5446.0, 0, 0, '2026-05-28');
UPDATE aparelhos SET venda_id = 'c7ac418a-5f36-46e2-b3df-693b8770fd38' WHERE id = 'dbf1203b-a887-4f44-a7a1-882b8281df79';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('103f5560-1b7f-4d60-82fb-0a007152a1db', 'c7ac418a-5f36-46e2-b3df-693b8770fd38', 'pix', 5446.0, '2026-05-28', '2026-05-28');

-- VENDA 314: IPHONE 11 128GB BRANCO SEMINOVO (28/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('1ea88714-531d-4356-ae58-4776a9422d47', 'IPHONE 11 128GB BRANCO', '356581108114007', 1161.0, 700.0, 4, 'vendido', 'seminovo', '2026-05-28', '2026-05-28', '2026-05-28', '2026-05-28');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('e2b2025b-af9f-4537-8f07-17506fa4dbe0', 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 1161.0, 1161.0, 0, 0, '2026-05-28');
UPDATE aparelhos SET venda_id = 'e2b2025b-af9f-4537-8f07-17506fa4dbe0' WHERE id = '1ea88714-531d-4356-ae58-4776a9422d47';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('34fbf6e4-2346-4288-b46a-c4e109608b1c', 'e2b2025b-af9f-4537-8f07-17506fa4dbe0', 'pix', 1161.0, '2026-05-28', '2026-05-28');

-- VENDA 315: IPHONE 16 PRO MAX 1TB PRETO SEMINOVO (28/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('75f7366a-792b-4e7d-b54a-ad476da837d1', 'IPHONE 16 PRO MAX 1TB PRETO', '355067542337324', 5930.0, 5300.0, 19, 'vendido', 'seminovo', '2026-05-28', '2026-05-28', '2026-05-28', '2026-05-28');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('e4da5367-fa03-4a7f-9c24-1dcf3252b40d', 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 5930.0, 5930.0, 0, 0, '2026-05-28');
UPDATE aparelhos SET venda_id = 'e4da5367-fa03-4a7f-9c24-1dcf3252b40d' WHERE id = '75f7366a-792b-4e7d-b54a-ad476da837d1';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('85b3947c-8af6-4454-bcda-2e6ffb5cd1b1', 'e4da5367-fa03-4a7f-9c24-1dcf3252b40d', 'cartao_credito', 5930.0, '2026-05-28', '2026-05-28');

-- VENDA 316: IPHONE 16 PRO MAX 256GB PRETO SEMINOVO (28/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('0bf9d3d1-a68d-4fec-b931-f99b4e589dbc', 'IPHONE 16 PRO MAX 256GB PRETO', '354276355714955', 5300.0, 4850.0, 20, 'vendido', 'seminovo', '2026-05-28', '2026-05-28', '2026-05-28', '2026-05-28');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('6abcc010-037c-4def-b637-c6d798c1f36d', 20, 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 'concluida', 'normal', 5300.0, 5300.0, 0, 0, '2026-05-28');
UPDATE aparelhos SET venda_id = '6abcc010-037c-4def-b637-c6d798c1f36d' WHERE id = '0bf9d3d1-a68d-4fec-b931-f99b4e589dbc';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('eb455ca1-4992-4fb0-b980-346612c70abe', '6abcc010-037c-4def-b637-c6d798c1f36d', 'cartao_credito', 5300.0, '2026-05-28', '2026-05-28');

-- VENDA 317: IPHONE 17 PRO 256GB BRANCO SEMINOVO (28/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('0de25d3c-37f5-4d9d-9a26-4f4689c390a0', 'IPHONE 17 PRO 256GB BRANCO', '355500350320222', 6821.0, 6100.0, 20, 'vendido', 'seminovo', '2026-05-28', '2026-05-28', '2026-05-28', '2026-05-28');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('631622b5-118c-45a3-8e1a-5c10a7d1afef', 20, 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 'concluida', 'normal', 6821.0, 6821.0, 0, 0, '2026-05-28');
UPDATE aparelhos SET venda_id = '631622b5-118c-45a3-8e1a-5c10a7d1afef' WHERE id = '0de25d3c-37f5-4d9d-9a26-4f4689c390a0';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('1a6108d2-304d-46e2-a212-e8c19ce8ca3a', '631622b5-118c-45a3-8e1a-5c10a7d1afef', 'cartao_credito', 6821.0, '2026-05-28', '2026-05-28');

-- VENDA 318: IPHONE 17 PRO MAX BRANCO NOVO 256GB (28/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('0dcb7a0d-8f77-4d56-aa35-215f1c22750b', 'IPHONE 17 PRO MAX BRANCO NOVO 256GB', '359652121886894', 8300.0, 7750.0, 1, 'vendido', 'novo', '2026-05-28', '2026-05-28', '2026-05-28', '2026-05-28');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('7401dd60-8e2f-4a44-8d08-56b7c05eece2', 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 8300.0, 8300.0, 0, 0, '2026-05-28');
UPDATE aparelhos SET venda_id = '7401dd60-8e2f-4a44-8d08-56b7c05eece2' WHERE id = '0dcb7a0d-8f77-4d56-aa35-215f1c22750b';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('087f0de5-2736-4fa4-ac3a-adfb0aff388e', '7401dd60-8e2f-4a44-8d08-56b7c05eece2', 'pix', 8300.0, '2026-05-28', '2026-05-28');

-- Troca: IPH 16 PRO MAX (R$ 4850.00)
INSERT INTO aparelhos (id, modelo, valor_compra, loja_id, status, estado, observacoes, data_entrada, criado_em, atualizado_em)
VALUES ('dd7d0595-aa80-44dc-8588-c4789f0507df', 'IPH 16 PRO MAX', 4850.0, 1, 'disponivel', 'usado', 'Entrada por troca - venda 7401dd60-8e2f-4a44-8d08-56b7c05eece2', '2026-05-28', '2026-05-28', '2026-05-28');

-- VENDA 319: IPHONE 16 PRO MAX 512GB PRETO SEMINOVO (28/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('69595ff8-d38b-4e4c-8c21-adc11918d853', 'IPHONE 16 PRO MAX 512GB PRETO', '354331121466651', 5650.0, 5150.0, 20, 'vendido', 'seminovo', '2026-05-28', '2026-05-28', '2026-05-28', '2026-05-28');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('6e661454-791a-4b3e-9a95-ed905c4ef28f', 20, '25e2da5b-9e76-4388-9890-7e22efd6940d', 'concluida', 'normal', 5650.0, 5650.0, 0, 0, '2026-05-28');
UPDATE aparelhos SET venda_id = '6e661454-791a-4b3e-9a95-ed905c4ef28f' WHERE id = '69595ff8-d38b-4e4c-8c21-adc11918d853';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('9026f8dc-10f4-4d2a-b3fd-246396dbbf37', '6e661454-791a-4b3e-9a95-ed905c4ef28f', 'pix', 5650.0, '2026-05-28', '2026-05-28');

-- Troca: IPHONE 16E 128 GB BRANCO A (R$ 2100.00)
INSERT INTO aparelhos (id, modelo, valor_compra, loja_id, status, estado, observacoes, data_entrada, criado_em, atualizado_em)
VALUES ('4dbae417-81d4-44ce-a190-257e30f88679', 'IPHONE 16E 128 GB BRANCO A', 2100.0, 20, 'disponivel', 'usado', 'Entrada por troca - venda 6e661454-791a-4b3e-9a95-ed905c4ef28f', '2026-05-28', '2026-05-28', '2026-05-28');

-- VENDA 320: IPHONE 14 128GB AZUL SEMINOVO (29/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('b8834f1b-5555-4fed-99d1-1d9c814bc57e', 'IPHONE 14 128GB AZUL', '359388532621543', 2150.0, 1900.0, 4, 'vendido', 'seminovo', '2026-05-29', '2026-05-29', '2026-05-29', '2026-05-29');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('e5616ea9-711b-47e8-959c-56b256ffa10f', 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 2150.0, 2150.0, 0, 0, '2026-05-29');
UPDATE aparelhos SET venda_id = 'e5616ea9-711b-47e8-959c-56b256ffa10f' WHERE id = 'b8834f1b-5555-4fed-99d1-1d9c814bc57e';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('73edde88-6b48-4474-a49f-2bcde08176ec', 'e5616ea9-711b-47e8-959c-56b256ffa10f', 'pix', 2150.0, '2026-05-29', '2026-05-29');

-- VENDA 321: REDMI NOTE 15 PRO 4G 256GB PRETO NOVO (29/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('6e1f408a-ff4b-4739-8f21-0936b6b84773', 'REDMI NOTE 15 PRO 4G 256GB PRETO', '863911086287848', 1627.0, 1430.0, 4, 'vendido', 'novo', '2026-05-29', '2026-05-29', '2026-05-29', '2026-05-29');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('3485cbea-84ef-4de7-a60d-247816787cbc', 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 1627.0, 1627.0, 0, 0, '2026-05-29');
UPDATE aparelhos SET venda_id = '3485cbea-84ef-4de7-a60d-247816787cbc' WHERE id = '6e1f408a-ff4b-4739-8f21-0936b6b84773';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('5e092304-df7a-4e76-8384-5b6d8b84f456', '3485cbea-84ef-4de7-a60d-247816787cbc', 'pix', 1627.0, '2026-05-29', '2026-05-29');

-- VENDA 322: REDMI NOTE 15 PRO 5G 256GB PRETO NOVO (29/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('59bcf663-74e1-464b-a2d1-c073f43d33d5', 'REDMI NOTE 15 PRO 5G 256GB PRETO', '865293081783289', 1852.0, 1680.0, 4, 'vendido', 'novo', '2026-05-29', '2026-05-29', '2026-05-29', '2026-05-29');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('8710496e-1229-44ca-9012-b9b3308a24fd', 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 1852.0, 1852.0, 0, 0, '2026-05-29');
UPDATE aparelhos SET venda_id = '8710496e-1229-44ca-9012-b9b3308a24fd' WHERE id = '59bcf663-74e1-464b-a2d1-c073f43d33d5';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('745ff7f0-f432-4c72-be7c-2b6fe3e75267', '8710496e-1229-44ca-9012-b9b3308a24fd', 'pix', 1852.0, '2026-05-29', '2026-05-29');

-- VENDA 323: IPHONE 13 128GB BRANCO SEMINOVO (29/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('381714b6-c6d6-4cea-9a78-bd1277e54e6d', 'IPHONE 13 128GB BRANCO', '350689751889144', 1850.0, 1750.0, 19, 'vendido', 'seminovo', '2026-05-29', '2026-05-29', '2026-05-29', '2026-05-29');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('b68696cf-5fc5-4ea3-a842-8f3df5032d34', 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 1850.0, 1850.0, 0, 0, '2026-05-29');
UPDATE aparelhos SET venda_id = 'b68696cf-5fc5-4ea3-a842-8f3df5032d34' WHERE id = '381714b6-c6d6-4cea-9a78-bd1277e54e6d';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('1644d48e-cc0e-4335-8b1e-8cd31f4fe46b', 'b68696cf-5fc5-4ea3-a842-8f3df5032d34', 'pix', 1850.0, '2026-05-29', '2026-05-29');

-- VENDA 324: IPHONE 14 PRO MAX 512GB ROXO SEMINOVO (29/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('71663e8e-fb64-4ab5-8956-1a01b5c5e482', 'IPHONE 14 PRO MAX 512GB ROXO', '353360948256186', 3800.0, 2500.0, 19, 'vendido', 'seminovo', '2026-05-29', '2026-05-29', '2026-05-29', '2026-05-29');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('fe9f2828-0a46-4709-9293-d06f8509fdfe', 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 3800.0, 3800.0, 0, 0, '2026-05-29');
UPDATE aparelhos SET venda_id = 'fe9f2828-0a46-4709-9293-d06f8509fdfe' WHERE id = '71663e8e-fb64-4ab5-8956-1a01b5c5e482';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('ded716a9-c037-4694-8e1a-0966b62298c7', 'fe9f2828-0a46-4709-9293-d06f8509fdfe', 'pix', 3800.0, '2026-05-29', '2026-05-29');

-- Troca: IPH 12 PRO 256GB BRANCO (R$ 2100.00)
INSERT INTO aparelhos (id, modelo, valor_compra, loja_id, status, estado, observacoes, data_entrada, criado_em, atualizado_em)
VALUES ('e001cda9-4a33-4171-9b20-a6c7f421a9d4', 'IPH 12 PRO 256GB BRANCO', 2100.0, 19, 'disponivel', 'usado', 'Entrada por troca - venda fe9f2828-0a46-4709-9293-d06f8509fdfe', '2026-05-29', '2026-05-29', '2026-05-29');

-- VENDA 325: IPHONE 17 PRO 512GB SILVER NOVO (29/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('82ec010b-3818-40c8-929e-6c9bacc245aa', 'IPHONE 17 PRO 512GB SILVER', '352001999333984', 8974.0, 8400.0, 19, 'vendido', 'novo', '2026-05-29', '2026-05-29', '2026-05-29', '2026-05-29');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('2ef66a94-345f-45ba-9152-94c165b508de', 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 8974.0, 8974.0, 0, 0, '2026-05-29');
UPDATE aparelhos SET venda_id = '2ef66a94-345f-45ba-9152-94c165b508de' WHERE id = '82ec010b-3818-40c8-929e-6c9bacc245aa';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('e7a7ae67-1dae-4060-a2fc-e8316d1310b4', '2ef66a94-345f-45ba-9152-94c165b508de', 'pix', 8974.0, '2026-05-29', '2026-05-29');

-- Troca: IPH 15 PRO 256GB (R$ 2800.00)
INSERT INTO aparelhos (id, modelo, valor_compra, loja_id, status, estado, observacoes, data_entrada, criado_em, atualizado_em)
VALUES ('2fd06997-652a-4ea3-a3be-75c526377ae8', 'IPH 15 PRO 256GB', 2800.0, 19, 'disponivel', 'usado', 'Entrada por troca - venda 2ef66a94-345f-45ba-9152-94c165b508de', '2026-05-29', '2026-05-29', '2026-05-29');

-- VENDA 326: IPAD 11 128GB SILVER NOVO (29/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('ed868a36-cf3f-43fe-9a3e-4c549b3264b2', 'IPAD 11 128GB SILVER', 'J97T5Q77HRQ', 2350.0, 2150.0, 19, 'vendido', 'novo', '2026-05-29', '2026-05-29', '2026-05-29', '2026-05-29');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('a6f1fdf5-ccfa-49aa-805c-0de378b615ef', 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 2350.0, 2350.0, 0, 0, '2026-05-29');
UPDATE aparelhos SET venda_id = 'a6f1fdf5-ccfa-49aa-805c-0de378b615ef' WHERE id = 'ed868a36-cf3f-43fe-9a3e-4c549b3264b2';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('0ae3965b-ac77-4a69-8ca6-c743878b0c2a', 'a6f1fdf5-ccfa-49aa-805c-0de378b615ef', 'pix', 2350.0, '2026-05-29', '2026-05-29');

-- VENDA 327: IPHONE 17 PRO 512GB SILVER NOVO (29/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('461c45d4-0039-4106-9865-f30ac5d7355f', 'IPHONE 17 PRO 512GB SILVER', '354289632214376', 8900.0, 8400.0, 19, 'vendido', 'novo', '2026-05-29', '2026-05-29', '2026-05-29', '2026-05-29');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('11e2430d-5a46-4de2-9823-5ecaf422ac47', 19, 'b4269e60-eea2-4eba-a34d-db9591e0ec83', 'concluida', 'normal', 8900.0, 8900.0, 0, 0, '2026-05-29');
UPDATE aparelhos SET venda_id = '11e2430d-5a46-4de2-9823-5ecaf422ac47' WHERE id = '461c45d4-0039-4106-9865-f30ac5d7355f';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('89a9b299-0760-44aa-9e7e-30834d79ad80', '11e2430d-5a46-4de2-9823-5ecaf422ac47', 'pix', 8900.0, '2026-05-29', '2026-05-29');

-- Troca: 14 PRO 512GB PRETO (R$ 2800.00)
INSERT INTO aparelhos (id, modelo, valor_compra, loja_id, status, estado, observacoes, data_entrada, criado_em, atualizado_em)
VALUES ('a3636b00-7b29-4bda-bfa3-4b09e999486d', '14 PRO 512GB PRETO', 2800.0, 19, 'disponivel', 'usado', 'Entrada por troca - venda 11e2430d-5a46-4de2-9823-5ecaf422ac47', '2026-05-29', '2026-05-29', '2026-05-29');

-- VENDA 328: IPHONE 16 128GB AZUL SEMINOVO (29/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('0d8294bf-0bbc-4933-8882-7c21e9142c13', 'IPHONE 16 128GB AZUL', '351006199740582', 3830.0, 3100.0, 1, 'vendido', 'seminovo', '2026-05-29', '2026-05-29', '2026-05-29', '2026-05-29');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('2022ebeb-6b6f-4b84-8543-edbe8cd16ee4', 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 3830.0, 3830.0, 0, 0, '2026-05-29');
UPDATE aparelhos SET venda_id = '2022ebeb-6b6f-4b84-8543-edbe8cd16ee4' WHERE id = '0d8294bf-0bbc-4933-8882-7c21e9142c13';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('c275a70f-9778-4629-8c56-c58e7bbf2457', '2022ebeb-6b6f-4b84-8543-edbe8cd16ee4', 'pix', 3830.0, '2026-05-29', '2026-05-29');

-- Troca: IPH 14 LILAS (R$ 1850.00)
INSERT INTO aparelhos (id, modelo, valor_compra, loja_id, status, estado, observacoes, data_entrada, criado_em, atualizado_em)
VALUES ('559327e4-13e8-4319-b673-41177452d8bd', 'IPH 14 LILAS', 1850.0, 1, 'disponivel', 'usado', 'Entrada por troca - venda 2022ebeb-6b6f-4b84-8543-edbe8cd16ee4', '2026-05-29', '2026-05-29', '2026-05-29');

-- VENDA 329: IPHONE 17 PRO 256GB BRANCO SEMINOVO (30/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('c13226fa-b985-43ea-9d02-1eb831d5affd', 'IPHONE 17 PRO 256GB BRANCO', '7679993104397', 6637.0, 6100.0, 1, 'vendido', 'seminovo', '2026-05-30', '2026-05-30', '2026-05-30', '2026-05-30');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('99b76b4c-f6bf-42a7-864c-6ba357a919a8', 1, 'e07d4d35-1381-4d4d-914d-8382a7456fdd', 'concluida', 'normal', 6637.0, 6637.0, 0, 0, '2026-05-30');
UPDATE aparelhos SET venda_id = '99b76b4c-f6bf-42a7-864c-6ba357a919a8' WHERE id = 'c13226fa-b985-43ea-9d02-1eb831d5affd';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('7e107eb0-56c7-4407-8a94-76b9c6b921f7', '99b76b4c-f6bf-42a7-864c-6ba357a919a8', 'cartao_credito', 6637.0, '2026-05-30', '2026-05-30');

-- Troca: 15 PRO (R$ 2900.00)
INSERT INTO aparelhos (id, modelo, valor_compra, loja_id, status, estado, observacoes, data_entrada, criado_em, atualizado_em)
VALUES ('3888362c-0f05-4dd7-b7c8-80e3c407c15b', '15 PRO', 2900.0, 1, 'disponivel', 'usado', 'Entrada por troca - venda 99b76b4c-f6bf-42a7-864c-6ba357a919a8', '2026-05-30', '2026-05-30', '2026-05-30');

-- VENDA 330: IPHONE 15 PRO MAX 256GB SEMINOVO (30/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('4f275c96-6279-4ffb-b1a2-a951147d4f9b', 'IPHONE 15 PRO MAX 256GB', '356964465740436', 4000.0, 3700.0, 4, 'vendido', 'seminovo', '2026-05-30', '2026-05-30', '2026-05-30', '2026-05-30');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('2295be86-5969-484e-af30-cfb3757b78b2', 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 4000.0, 4000.0, 0, 0, '2026-05-30');
UPDATE aparelhos SET venda_id = '2295be86-5969-484e-af30-cfb3757b78b2' WHERE id = '4f275c96-6279-4ffb-b1a2-a951147d4f9b';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('a419bd50-da51-4ca3-ac48-eb85cf065bcb', '2295be86-5969-484e-af30-cfb3757b78b2', 'pix', 4000.0, '2026-05-30', '2026-05-30');

-- VENDA 331: IPHONE 16 PRO MAX 256GB DESERT SEMINOVO (30/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('2852141c-7d54-4cca-8e54-a44d4ce93afa', 'IPHONE 16 PRO MAX 256GB DESERT', '354661674485405', 5200.0, 4850.0, 20, 'vendido', 'seminovo', '2026-05-30', '2026-05-30', '2026-05-30', '2026-05-30');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('2d574c33-5c18-4319-aeab-dbbfa3644772', 20, 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 'concluida', 'normal', 5200.0, 5200.0, 0, 0, '2026-05-30');
UPDATE aparelhos SET venda_id = '2d574c33-5c18-4319-aeab-dbbfa3644772' WHERE id = '2852141c-7d54-4cca-8e54-a44d4ce93afa';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('d5af95c7-9367-48f3-b73b-8bafea9a662c', '2d574c33-5c18-4319-aeab-dbbfa3644772', 'dinheiro', 5200.0, '2026-05-30', '2026-05-30');

-- VENDA 332: REDMI PAD 2 256GB PRETO NOVO (30/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('259da13b-bba3-4aa3-aa6f-9864bbc53dcc', 'REDMI PAD 2 256GB PRETO', '65577/W6PU00619', 1350.0, 1250.0, 20, 'vendido', 'novo', '2026-05-30', '2026-05-30', '2026-05-30', '2026-05-30');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('9431577d-4ca5-425c-aa8c-d55448a9afff', 20, 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 'concluida', 'normal', 1350.0, 1350.0, 0, 0, '2026-05-30');
UPDATE aparelhos SET venda_id = '9431577d-4ca5-425c-aa8c-d55448a9afff' WHERE id = '259da13b-bba3-4aa3-aa6f-9864bbc53dcc';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('82f4a886-4d87-4852-bc01-8572750cdf1e', '9431577d-4ca5-425c-aa8c-d55448a9afff', 'pix', 1350.0, '2026-05-30', '2026-05-30');

-- VENDA 333: IPHONE 15 128GB AZUL NOVO (30/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('c7df05bd-0771-4fbb-8db9-f488dc4580fc', 'IPHONE 15 128GB AZUL', '355225779897630', 3900.0, 3750.0, 20, 'vendido', 'novo', '2026-05-30', '2026-05-30', '2026-05-30', '2026-05-30');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('5ef3ee97-bf43-4e44-8e1e-acbf65c69581', 20, 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 'concluida', 'normal', 3900.0, 3900.0, 0, 0, '2026-05-30');
UPDATE aparelhos SET venda_id = '5ef3ee97-bf43-4e44-8e1e-acbf65c69581' WHERE id = 'c7df05bd-0771-4fbb-8db9-f488dc4580fc';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('bc9ca561-ff1d-4c79-b9c8-a3790c31bf10', '5ef3ee97-bf43-4e44-8e1e-acbf65c69581', 'cartao_credito', 3900.0, '2026-05-30', '2026-05-30');

-- VENDA 334: IPHONE 16 PRO 256GB PRETO SEMINOVO (30/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('e001ef26-eeea-46fd-90e0-78d0cd5a09d2', 'IPHONE 16 PRO 256GB PRETO', '357463442372645', 4700.0, 4500.0, 4, 'vendido', 'seminovo', '2026-05-30', '2026-05-30', '2026-05-30', '2026-05-30');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('84fbafcb-2311-4f03-b880-87f285ba2fc4', 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 4700.0, 4700.0, 0, 0, '2026-05-30');
UPDATE aparelhos SET venda_id = '84fbafcb-2311-4f03-b880-87f285ba2fc4' WHERE id = 'e001ef26-eeea-46fd-90e0-78d0cd5a09d2';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('d2ddbed6-0f6c-4ae7-ad76-d571c4e1017c', '84fbafcb-2311-4f03-b880-87f285ba2fc4', 'pix', 4700.0, '2026-05-30', '2026-05-30');

-- Troca: XS MAX SEMINOVO (R$ 300.00)
INSERT INTO aparelhos (id, modelo, valor_compra, loja_id, status, estado, observacoes, data_entrada, criado_em, atualizado_em)
VALUES ('3f3de918-96ed-40e7-a7f9-e579062dc9b3', 'XS MAX SEMINOVO', 300.0, 4, 'disponivel', 'novo', 'Entrada por troca - venda 84fbafcb-2311-4f03-b880-87f285ba2fc4', '2026-05-30', '2026-05-30', '2026-05-30');

-- VENDA 335: IPHONE 17 PRO 256GB PRETO NOVO (30/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('1658868b-0a4c-4a7b-b029-057aed2d80fc', 'IPHONE 17 PRO 256GB PRETO', '355820203650330', 7300.0, 6900.0, 4, 'vendido', 'novo', '2026-05-30', '2026-05-30', '2026-05-30', '2026-05-30');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('e2a3a504-abdf-4f72-a895-958db12bd599', 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 7300.0, 7300.0, 0, 0, '2026-05-30');
UPDATE aparelhos SET venda_id = 'e2a3a504-abdf-4f72-a895-958db12bd599' WHERE id = '1658868b-0a4c-4a7b-b029-057aed2d80fc';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('a0fc87cc-e0c1-42fe-a9cc-7fe7fceaef1d', 'e2a3a504-abdf-4f72-a895-958db12bd599', 'cartao_credito', 7300.0, '2026-05-30', '2026-05-30');

-- Troca: 16 PRO (R$ 256.00)
INSERT INTO aparelhos (id, modelo, valor_compra, loja_id, status, estado, observacoes, data_entrada, criado_em, atualizado_em)
VALUES ('01819ad7-f16e-4ed7-b24a-4045896b87db', '16 PRO', 256.0, 4, 'disponivel', 'usado', 'Entrada por troca - venda e2a3a504-abdf-4f72-a895-958db12bd599', '2026-05-30', '2026-05-30', '2026-05-30');

-- VENDA 336: IPHONE 17 PRO 512GB AZUL NOVO (30/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('d86feaeb-b3f3-481f-9478-6f234f2c5be5', 'IPHONE 17 PRO 512GB AZUL', '354289633583902', 8250.0, 8000.0, 4, 'vendido', 'novo', '2026-05-30', '2026-05-30', '2026-05-30', '2026-05-30');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('020988ec-ed92-4d00-8638-15786483b32d', 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 8250.0, 8250.0, 0, 0, '2026-05-30');
UPDATE aparelhos SET venda_id = '020988ec-ed92-4d00-8638-15786483b32d' WHERE id = 'd86feaeb-b3f3-481f-9478-6f234f2c5be5';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('585580d6-d3dc-40e1-9ae3-4991779f85e7', '020988ec-ed92-4d00-8638-15786483b32d', 'pix', 8250.0, '2026-05-30', '2026-05-30');

-- VENDA 337: IPHONE 13 256GB ROSA SEMINOVO (30/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('81268fca-372d-418d-a172-1ea8747237a8', 'IPHONE 13 256GB ROSA', '352824489625845', 2300.0, 1900.0, 4, 'vendido', 'seminovo', '2026-05-30', '2026-05-30', '2026-05-30', '2026-05-30');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('c674fbab-7068-4fc7-ad47-9a12677b7113', 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 2300.0, 2300.0, 0, 0, '2026-05-30');
UPDATE aparelhos SET venda_id = 'c674fbab-7068-4fc7-ad47-9a12677b7113' WHERE id = '81268fca-372d-418d-a172-1ea8747237a8';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('8e6c9251-0fe3-4dee-a095-8c75c7f105a3', 'c674fbab-7068-4fc7-ad47-9a12677b7113', 'cartao_credito', 2300.0, '2026-05-30', '2026-05-30');

-- VENDA 338: IPHONE XS MAX 256GB DOURADO SEMINOVO (30/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('a9ecd765-49c2-40f0-9704-82044c361972', 'IPHONE XS MAX 256GB DOURADO', '35112102108566', 350.0, 300.0, 4, 'vendido', 'seminovo', '2026-05-30', '2026-05-30', '2026-05-30', '2026-05-30');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('832712bd-e374-454f-a054-ba910bc48e9f', 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 350.0, 350.0, 0, 0, '2026-05-30');
UPDATE aparelhos SET venda_id = '832712bd-e374-454f-a054-ba910bc48e9f' WHERE id = 'a9ecd765-49c2-40f0-9704-82044c361972';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('c7ed1146-4e09-46d0-be0d-ccf2232c6644', '832712bd-e374-454f-a054-ba910bc48e9f', 'pix', 350.0, '2026-05-30', '2026-05-30');

-- VENDA 339: IPHONE 15 PRO  256GB AZUL SEMINOVO (30/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('2edf326f-f17c-42ef-8d2e-f6715713e663', 'IPHONE 15 PRO  256GB AZUL', '353864164761936', 3600.0, 3200.0, 19, 'vendido', 'seminovo', '2026-05-30', '2026-05-30', '2026-05-30', '2026-05-30');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('e1dabe14-d781-4876-a0bd-0dd4e7543880', 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 3600.0, 3600.0, 0, 0, '2026-05-30');
UPDATE aparelhos SET venda_id = 'e1dabe14-d781-4876-a0bd-0dd4e7543880' WHERE id = '2edf326f-f17c-42ef-8d2e-f6715713e663';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('1ec35900-d2c4-4ee2-80ef-6cd922b1c142', 'e1dabe14-d781-4876-a0bd-0dd4e7543880', 'pix', 3600.0, '2026-05-30', '2026-05-30');

-- Troca: IPH 12 PRO (R$ 1300.00)
INSERT INTO aparelhos (id, modelo, valor_compra, loja_id, status, estado, observacoes, data_entrada, criado_em, atualizado_em)
VALUES ('e7cf7459-2167-4c94-809a-0b0b2b9d5fa2', 'IPH 12 PRO', 1300.0, 19, 'disponivel', 'usado', 'Entrada por troca - venda e1dabe14-d781-4876-a0bd-0dd4e7543880', '2026-05-30', '2026-05-30', '2026-05-30');

-- VENDA 340: PARTY BOX 120 PRETA (30/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('bb141b12-97c3-4f61-8c0c-9a9edc6ae374', 'PARTY BOX 120 PRETA', '58035038', 1800.0, 1700.0, 19, 'vendido', 'seminovo', '2026-05-30', '2026-05-30', '2026-05-30', '2026-05-30');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('2bce0831-d8e6-4953-9e27-0dbc52805c44', 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 1800.0, 1800.0, 0, 0, '2026-05-30');
UPDATE aparelhos SET venda_id = '2bce0831-d8e6-4953-9e27-0dbc52805c44' WHERE id = 'bb141b12-97c3-4f61-8c0c-9a9edc6ae374';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('c0eca85a-0230-472a-acc8-89a6cd2776a5', '2bce0831-d8e6-4953-9e27-0dbc52805c44', 'pix', 1800.0, '2026-05-30', '2026-05-30');

-- VENDA 341: IPHONE 16 PRO 256GB  PRETO SEMINOVO (30/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('5033ca5f-66d8-4ee5-b0b9-1cbce1e21aea', 'IPHONE 16 PRO 256GB  PRETO', '359896928035433', 4830.0, 4500.0, 1, 'vendido', 'seminovo', '2026-05-30', '2026-05-30', '2026-05-30', '2026-05-30');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('3c905c93-77dd-4e6f-b77d-5f879dc8904d', 1, '1d12d555-68e9-45f8-bfc0-a35a1d8d7920', 'concluida', 'normal', 4830.0, 4830.0, 0, 0, '2026-05-30');
UPDATE aparelhos SET venda_id = '3c905c93-77dd-4e6f-b77d-5f879dc8904d' WHERE id = '5033ca5f-66d8-4ee5-b0b9-1cbce1e21aea';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('b26526ee-2224-4f27-922c-60c14d8857de', '3c905c93-77dd-4e6f-b77d-5f879dc8904d', 'pix', 4830.0, '2026-05-30', '2026-05-30');

-- Troca: IPH 12 (R$ 1200.00)
INSERT INTO aparelhos (id, modelo, valor_compra, loja_id, status, estado, observacoes, data_entrada, criado_em, atualizado_em)
VALUES ('c2592651-8fe0-4d1a-ad65-c4b05bbed4f9', 'IPH 12', 1200.0, 1, 'disponivel', 'usado', 'Entrada por troca - venda 3c905c93-77dd-4e6f-b77d-5f879dc8904d', '2026-05-30', '2026-05-30', '2026-05-30');

-- VENDA 342: MACBOOK AIR M5 13  512GB NOVO (30/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('95e1b904-d448-4eaf-ab59-9d9fb9d96625', 'MACBOOK AIR M5 13  512GB', 'K42L7RHF4J', 7350.0, 6750.0, 19, 'vendido', 'novo', '2026-05-30', '2026-05-30', '2026-05-30', '2026-05-30');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('0c860d2f-18da-4a84-b7de-350b98131050', 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 7350.0, 7350.0, 0, 0, '2026-05-30');
UPDATE aparelhos SET venda_id = '0c860d2f-18da-4a84-b7de-350b98131050' WHERE id = '95e1b904-d448-4eaf-ab59-9d9fb9d96625';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('8d63517b-3873-45e3-a12d-8664d10e50f6', '0c860d2f-18da-4a84-b7de-350b98131050', 'cartao_credito', 7350.0, '2026-05-30', '2026-05-30');

-- VENDA 343: IPHONE 17 PRO MAX 256GB AZUL NOVO (30/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('07c5c3a3-3d69-42bf-9b50-691aa54ef042', 'IPHONE 17 PRO MAX 256GB AZUL', '350552893601530', 7950.0, 7550.0, 1, 'vendido', 'novo', '2026-05-30', '2026-05-30', '2026-05-30', '2026-05-30');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('d6ac61da-c69d-4486-88be-9ad3574045c3', 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 7950.0, 7950.0, 0, 0, '2026-05-30');
UPDATE aparelhos SET venda_id = 'd6ac61da-c69d-4486-88be-9ad3574045c3' WHERE id = '07c5c3a3-3d69-42bf-9b50-691aa54ef042';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('e831b744-e595-45e3-940f-91013b43de2d', 'd6ac61da-c69d-4486-88be-9ad3574045c3', 'dinheiro', 7950.0, '2026-05-30', '2026-05-30');

-- Troca: IPH 16 PRO 256GB (R$ 4850.00)
INSERT INTO aparelhos (id, modelo, valor_compra, loja_id, status, estado, observacoes, data_entrada, criado_em, atualizado_em)
VALUES ('83ad6609-90b2-48ce-bf00-d597aabd74d0', 'IPH 16 PRO 256GB', 4850.0, 1, 'disponivel', 'usado', 'Entrada por troca - venda d6ac61da-c69d-4486-88be-9ad3574045c3', '2026-05-30', '2026-05-30', '2026-05-30');

-- VENDA 344: MACBOOK NEO SILVER 256GB NOVO (30/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('8871d9f4-f84b-4dd1-8ca0-e543100aae82', 'MACBOOK NEO SILVER 256GB', 'CR2N7W25Q1', 4422.0, 4300.0, 1, 'vendido', 'novo', '2026-05-30', '2026-05-30', '2026-05-30', '2026-05-30');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('242e1d71-7730-48f0-acfd-5e42e1bb47be', 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 4422.0, 4422.0, 0, 0, '2026-05-30');
UPDATE aparelhos SET venda_id = '242e1d71-7730-48f0-acfd-5e42e1bb47be' WHERE id = '8871d9f4-f84b-4dd1-8ca0-e543100aae82';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('9f4319bf-6ce3-4a0d-9a8a-fe9139735a6c', '242e1d71-7730-48f0-acfd-5e42e1bb47be', 'pix', 4422.0, '2026-05-30', '2026-05-30');

-- VENDA 345: REDMI NOTE 15 256GB VERDE NOVO (30/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('e0ca59a5-15ff-4349-9a17-6bf5c49db3ed', 'REDMI NOTE 15 256GB VERDE', '862795081570725', 1242.0, 1130.0, 1, 'vendido', 'novo', '2026-05-30', '2026-05-30', '2026-05-30', '2026-05-30');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('214404dd-3d5f-4277-b115-d57422a17f2a', 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 1242.0, 1242.0, 0, 0, '2026-05-30');
UPDATE aparelhos SET venda_id = '214404dd-3d5f-4277-b115-d57422a17f2a' WHERE id = 'e0ca59a5-15ff-4349-9a17-6bf5c49db3ed';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('e9c56c72-1ec5-43c7-bf22-542abe6bd912', '214404dd-3d5f-4277-b115-d57422a17f2a', 'pix', 1242.0, '2026-05-30', '2026-05-30');

-- VENDA 346: IPHONE 14 PRO SEMINOVO 512GB PRETO (30/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('b45dd2c8-9683-4cf3-b3f5-2279e8afd7a6', 'IPHONE 14 PRO SEMINOVO 512GB PRETO', '354256834755639', 3350.0, 2800.0, 1, 'vendido', 'seminovo', '2026-05-30', '2026-05-30', '2026-05-30', '2026-05-30');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('142de749-1d55-4ac7-be64-6c5a7000a545', 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 3350.0, 3350.0, 0, 0, '2026-05-30');
UPDATE aparelhos SET venda_id = '142de749-1d55-4ac7-be64-6c5a7000a545' WHERE id = 'b45dd2c8-9683-4cf3-b3f5-2279e8afd7a6';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('6565a943-9819-4877-afc7-811b2ce91dbc', '142de749-1d55-4ac7-be64-6c5a7000a545', 'pix', 3350.0, '2026-05-30', '2026-05-30');

-- Troca: IPH 13 (R$ 1550.00)
INSERT INTO aparelhos (id, modelo, valor_compra, loja_id, status, estado, observacoes, data_entrada, criado_em, atualizado_em)
VALUES ('59f37c99-4c2f-4fa7-b103-b12013f3336d', 'IPH 13', 1550.0, 1, 'disponivel', 'usado', 'Entrada por troca - venda 142de749-1d55-4ac7-be64-6c5a7000a545', '2026-05-30', '2026-05-30', '2026-05-30');

-- VENDA 347: IPHONE 16 PRO MAX 512GB PRETO SEMINOVO (30/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('85f1e346-b4e0-4847-9b0c-8ed87b3a2298', 'IPHONE 16 PRO MAX 512GB PRETO', '357205981829942', 5714.0, 5150.0, 1, 'vendido', 'seminovo', '2026-05-30', '2026-05-30', '2026-05-30', '2026-05-30');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('e9965be6-332b-41b3-8bae-f997e3d703b6', 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 5714.0, 5714.0, 0, 0, '2026-05-30');
UPDATE aparelhos SET venda_id = 'e9965be6-332b-41b3-8bae-f997e3d703b6' WHERE id = '85f1e346-b4e0-4847-9b0c-8ed87b3a2298';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('9af14d3a-1eca-4ab3-905a-89a766534d86', 'e9965be6-332b-41b3-8bae-f997e3d703b6', 'pix', 5714.0, '2026-05-30', '2026-05-30');

-- Troca: IPH 13 (R$ 1550.00)
INSERT INTO aparelhos (id, modelo, valor_compra, loja_id, status, estado, observacoes, data_entrada, criado_em, atualizado_em)
VALUES ('9628cf6f-22db-4299-bc67-8624f280d36d', 'IPH 13', 1550.0, 1, 'disponivel', 'usado', 'Entrada por troca - venda e9965be6-332b-41b3-8bae-f997e3d703b6', '2026-05-30', '2026-05-30', '2026-05-30');

-- VENDA 348: IPHONE 13 PRO MAX 256GB AZUL SEMINOVO (30/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('b4a38cff-8724-427b-8b02-c7482f272b16', 'IPHONE 13 PRO MAX 256GB AZUL', '351786564816337', 2900.0, 2800.0, 1, 'vendido', 'seminovo', '2026-05-30', '2026-05-30', '2026-05-30', '2026-05-30');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('e6785ce0-8c7a-4e1a-89d3-9e1768337291', 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 2900.0, 2900.0, 0, 0, '2026-05-30');
UPDATE aparelhos SET venda_id = 'e6785ce0-8c7a-4e1a-89d3-9e1768337291' WHERE id = 'b4a38cff-8724-427b-8b02-c7482f272b16';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('efc224ef-5ad1-4f2e-b60d-659a420c979c', 'e6785ce0-8c7a-4e1a-89d3-9e1768337291', 'pix', 2900.0, '2026-05-30', '2026-05-30');

-- VENDA 349: IPHONE 11 128GB PRETO USADO (30/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('26f5b8c1-96bc-4d0e-b078-9591ee7815da', 'IPHONE 11 128GB PRETO', NULL, 1062.0, 700.0, 19, 'vendido', 'usado', '2026-05-30', '2026-05-30', '2026-05-30', '2026-05-30');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('606c2c7e-b320-4d4e-bef9-5fe717d7e36f', 19, '85743f3e-1b32-49c0-9d9e-c16afd690f7d', 'concluida', 'normal', 1062.0, 1062.0, 0, 0, '2026-05-30');
UPDATE aparelhos SET venda_id = '606c2c7e-b320-4d4e-bef9-5fe717d7e36f' WHERE id = '26f5b8c1-96bc-4d0e-b078-9591ee7815da';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('84e94ed7-3ac2-4e74-a35a-c52463bf988c', '606c2c7e-b320-4d4e-bef9-5fe717d7e36f', 'pix', 1062.0, '2026-05-30', '2026-05-30');

-- VENDA 350: POCO X7 PRO 512GB PRETO NOVO (30/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('e8754c10-7323-42ee-98aa-aa03fb4e6ed7', 'POCO X7 PRO 512GB PRETO', '869471083013626', 2140.0, 1990.0, 20, 'vendido', 'novo', '2026-05-30', '2026-05-30', '2026-05-30', '2026-05-30');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('a8074d75-9f05-4180-922a-aa7fb722e5c2', 20, '25e2da5b-9e76-4388-9890-7e22efd6940d', 'concluida', 'normal', 2140.0, 2140.0, 0, 0, '2026-05-30');
UPDATE aparelhos SET venda_id = 'a8074d75-9f05-4180-922a-aa7fb722e5c2' WHERE id = 'e8754c10-7323-42ee-98aa-aa03fb4e6ed7';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('b0649d1a-9c63-44db-867e-5370b9490ab6', 'a8074d75-9f05-4180-922a-aa7fb722e5c2', 'pix', 2140.0, '2026-05-30', '2026-05-30');

-- VENDA 351: IPHONE 16 PRO 256GB DESERT SEMINOVO (31/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('5390847f-a917-471c-b272-0e20d2678a6a', 'IPHONE 16 PRO 256GB DESERT', '357592315867213', 4700.0, 4500.0, 4, 'vendido', 'seminovo', '2026-05-31', '2026-05-31', '2026-05-31', '2026-05-31');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('08dad315-9f87-44d6-817d-e3d665c32548', 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 4700.0, 4700.0, 0, 0, '2026-05-31');
UPDATE aparelhos SET venda_id = '08dad315-9f87-44d6-817d-e3d665c32548' WHERE id = '5390847f-a917-471c-b272-0e20d2678a6a';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('3444e622-25fb-4222-a8bd-5a1db4eb79b6', '08dad315-9f87-44d6-817d-e3d665c32548', 'pix', 4700.0, '2026-05-31', '2026-05-31');

-- VENDA 352: IPHONE 16 PRO MAX 256GB DESERT SEMINOVO (31/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('b1222377-d887-40ab-9ba1-744d45162d83', 'IPHONE 16 PRO MAX 256GB DESERT', '54210973599126', 5300.0, 5000.0, 4, 'vendido', 'seminovo', '2026-05-31', '2026-05-31', '2026-05-31', '2026-05-31');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('1617b97d-aa3e-478e-b798-23204139ba53', 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 5300.0, 5300.0, 0, 0, '2026-05-31');
UPDATE aparelhos SET venda_id = '1617b97d-aa3e-478e-b798-23204139ba53' WHERE id = 'b1222377-d887-40ab-9ba1-744d45162d83';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('de4d53c6-bcdc-4051-abce-ffd262632847', '1617b97d-aa3e-478e-b798-23204139ba53', 'pix', 5300.0, '2026-05-31', '2026-05-31');

-- VENDA 353: IPAD 11° A16 128GB SILVER NOVO (31/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('c824c80e-b424-41fd-b116-19c9553aa067', 'IPAD 11° A16 128GB SILVER', 'HGY4F5FC96', 2500.0, 2150.0, 4, 'vendido', 'novo', '2026-05-31', '2026-05-31', '2026-05-31', '2026-05-31');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('c38711af-1dc5-4c4f-a057-a15b6b57b166', 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 2500.0, 2500.0, 0, 0, '2026-05-31');
UPDATE aparelhos SET venda_id = 'c38711af-1dc5-4c4f-a057-a15b6b57b166' WHERE id = 'c824c80e-b424-41fd-b116-19c9553aa067';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('01fe936f-4ac0-45e4-be39-516d1fb50498', 'c38711af-1dc5-4c4f-a057-a15b6b57b166', 'pix', 2500.0, '2026-05-31', '2026-05-31');

-- VENDA 354: POCO C85 PRETO 256GB NOVO (31/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('7285657f-8910-42dd-a3c1-89fd5273c489', 'POCO C85 PRETO 256GB', '69385/65ZH01514', 1000.0, 890.0, 20, 'vendido', 'novo', '2026-05-31', '2026-05-31', '2026-05-31', '2026-05-31');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('c04cebef-8f10-42a8-aeb9-5c3b914ca472', 20, 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 'concluida', 'normal', 1000.0, 1000.0, 0, 0, '2026-05-31');
UPDATE aparelhos SET venda_id = 'c04cebef-8f10-42a8-aeb9-5c3b914ca472' WHERE id = '7285657f-8910-42dd-a3c1-89fd5273c489';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('76b7db8f-c127-4b28-a1b3-8b938e7453ca', 'c04cebef-8f10-42a8-aeb9-5c3b914ca472', 'cartao_credito', 1000.0, '2026-05-31', '2026-05-31');

-- VENDA 355: IPHONE 16 128GB AZUL NOVO (31/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('a71dab9c-5bb8-4db2-987b-79fec28b3bab', 'IPHONE 16 128GB AZUL', '353317874110720', 4050.0, 3950.0, 20, 'vendido', 'novo', '2026-05-31', '2026-05-31', '2026-05-31', '2026-05-31');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('859169de-6f9e-4153-9193-8e2aca820e9b', 20, 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 'concluida', 'normal', 4050.0, 4050.0, 0, 0, '2026-05-31');
UPDATE aparelhos SET venda_id = '859169de-6f9e-4153-9193-8e2aca820e9b' WHERE id = 'a71dab9c-5bb8-4db2-987b-79fec28b3bab';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('425aaba8-f113-4554-a1f5-efd46cfa911f', '859169de-6f9e-4153-9193-8e2aca820e9b', 'pix', 4050.0, '2026-05-31', '2026-05-31');

-- VENDA 356: IPHONE 13 128GB AZUL SEMINOVO (31/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('130bb0cc-078d-43c6-b1c1-292c5d269909', 'IPHONE 13 128GB AZUL', '352873836693105', 1900.0, 1780.0, 20, 'vendido', 'seminovo', '2026-05-31', '2026-05-31', '2026-05-31', '2026-05-31');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('a6ebfb55-60ef-49c4-ac30-b2051ada9cb9', 20, 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 'concluida', 'normal', 1900.0, 1900.0, 0, 0, '2026-05-31');
UPDATE aparelhos SET venda_id = 'a6ebfb55-60ef-49c4-ac30-b2051ada9cb9' WHERE id = '130bb0cc-078d-43c6-b1c1-292c5d269909';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('17458657-6ccd-4dde-a085-498198e38b05', 'a6ebfb55-60ef-49c4-ac30-b2051ada9cb9', 'pix', 1900.0, '2026-05-31', '2026-05-31');

-- VENDA 357: POCO C85 PRETO 256GB NOVO (31/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('47d9ce5f-9ef8-4ea5-9643-9c558c62d027', 'POCO C85 PRETO 256GB', '69374/65YT14295', 990.0, 890.0, 20, 'vendido', 'novo', '2026-05-31', '2026-05-31', '2026-05-31', '2026-05-31');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('1457cad0-9596-4337-8bff-f8e0a20812b1', 20, 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 'concluida', 'normal', 990.0, 990.0, 0, 0, '2026-05-31');
UPDATE aparelhos SET venda_id = '1457cad0-9596-4337-8bff-f8e0a20812b1' WHERE id = '47d9ce5f-9ef8-4ea5-9643-9c558c62d027';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('5664c6cd-ebff-4216-81b9-11536bd09932', '1457cad0-9596-4337-8bff-f8e0a20812b1', 'cartao_credito', 990.0, '2026-05-31', '2026-05-31');

-- VENDA 358: IPHONE 15 128GB PRETO SEMINOVO (31/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('08a387c6-d6c9-46d7-963d-24b8313bfee5', 'IPHONE 15 128GB PRETO', '356942573789859', 2813.0, 2660.0, 19, 'vendido', 'seminovo', '2026-05-31', '2026-05-31', '2026-05-31', '2026-05-31');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('a38eb591-cc9d-499b-83b5-a3477dd3cef2', 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 2813.0, 2813.0, 0, 0, '2026-05-31');
UPDATE aparelhos SET venda_id = 'a38eb591-cc9d-499b-83b5-a3477dd3cef2' WHERE id = '08a387c6-d6c9-46d7-963d-24b8313bfee5';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('3e676457-cf78-4c5b-9b9d-1b9c47abd764', 'a38eb591-cc9d-499b-83b5-a3477dd3cef2', 'cartao_debito', 2813.0, '2026-05-31', '2026-05-31');

-- VENDA 359: IPHONE 17 PRO 256GB AZUL NOVO (31/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('9b978f5d-9166-4fbd-bbd7-67db75737555', 'IPHONE 17 PRO 256GB AZUL', '359477633520876', 7300.0, 7000.0, 19, 'vendido', 'novo', '2026-05-31', '2026-05-31', '2026-05-31', '2026-05-31');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('7cc09834-c902-429b-a9dd-7f1f7d78f9eb', 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 7300.0, 7300.0, 0, 0, '2026-05-31');
UPDATE aparelhos SET venda_id = '7cc09834-c902-429b-a9dd-7f1f7d78f9eb' WHERE id = '9b978f5d-9166-4fbd-bbd7-67db75737555';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('ec091d41-819e-400c-9784-aad222e13d07', '7cc09834-c902-429b-a9dd-7f1f7d78f9eb', 'pix', 7300.0, '2026-05-31', '2026-05-31');

-- VENDA 360: JBL BOOMBOX 4 PRETO NOVO (31/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('f1d28295-e6b0-472f-b1ff-74719f8f8722', 'JBL BOOMBOX 4 PRETO', 'TL1876-CQ0217088', 2434.0, 2190.0, 19, 'vendido', 'novo', '2026-05-31', '2026-05-31', '2026-05-31', '2026-05-31');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('3dc2ff64-d889-473a-b195-420bbe438870', 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 2434.0, 2434.0, 0, 0, '2026-05-31');
UPDATE aparelhos SET venda_id = '3dc2ff64-d889-473a-b195-420bbe438870' WHERE id = 'f1d28295-e6b0-472f-b1ff-74719f8f8722';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('486af85d-d6b5-4b9f-8757-57ece640c7b7', '3dc2ff64-d889-473a-b195-420bbe438870', 'cartao_credito', 2434.0, '2026-05-31', '2026-05-31');

-- VENDA 361: JBL BOOMBOX 4 BRANCA NOVO (31/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('23baf972-a116-41a2-8833-7e63fc50ead2', 'JBL BOOMBOX 4 BRANCA', 'TL1878-LP0013380', 2276.0, 2190.0, 19, 'vendido', 'novo', '2026-05-31', '2026-05-31', '2026-05-31', '2026-05-31');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('8705db5f-557d-4b19-90f6-732dc7ca6c90', 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 2276.0, 2276.0, 0, 0, '2026-05-31');
UPDATE aparelhos SET venda_id = '8705db5f-557d-4b19-90f6-732dc7ca6c90' WHERE id = '23baf972-a116-41a2-8833-7e63fc50ead2';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('d95be290-060a-4fda-b150-c76b091bb63c', '8705db5f-557d-4b19-90f6-732dc7ca6c90', 'cartao_credito', 2276.0, '2026-05-31', '2026-05-31');

-- VENDA 362: PENCIL PRO NOVO (31/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('04d71c2f-b8fb-42ef-99fe-05adcbc6a68d', 'PENCIL PRO', 'CTV20GVQFL', 870.0, 710.0, 1, 'vendido', 'novo', '2026-05-31', '2026-05-31', '2026-05-31', '2026-05-31');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('e230b6bc-3de6-40bf-aec8-33de18dcacad', 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 870.0, 870.0, 0, 0, '2026-05-31');
UPDATE aparelhos SET venda_id = 'e230b6bc-3de6-40bf-aec8-33de18dcacad' WHERE id = '04d71c2f-b8fb-42ef-99fe-05adcbc6a68d';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('2b1149c4-3c1a-4a4e-8dc5-b277960fd0a7', 'e230b6bc-3de6-40bf-aec8-33de18dcacad', 'pix', 870.0, '2026-05-31', '2026-05-31');

-- VENDA 363: IPHONE 13 128GB ROSA SEMINOVO (31/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('c910f19e-38d1-49c5-a535-f7f4afd78b1a', 'IPHONE 13 128GB ROSA', '355958936427210', 2147.0, 1750.0, 1, 'vendido', 'seminovo', '2026-05-31', '2026-05-31', '2026-05-31', '2026-05-31');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('3df2b592-d59b-42cb-bd18-bce242d7052e', 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 2147.0, 2147.0, 0, 0, '2026-05-31');
UPDATE aparelhos SET venda_id = '3df2b592-d59b-42cb-bd18-bce242d7052e' WHERE id = 'c910f19e-38d1-49c5-a535-f7f4afd78b1a';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('03a98dcd-e87b-447f-9695-92cadfc92414', '3df2b592-d59b-42cb-bd18-bce242d7052e', 'pix', 2147.0, '2026-05-31', '2026-05-31');

-- VENDA 364: IPHONE 17 PRO MAX 256GB AZUL NOVO (31/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('6879588b-bbd1-4e2b-aca1-5e4caba6bc4f', 'IPHONE 17 PRO MAX 256GB AZUL', '355988219255368', 7618.0, 7230.0, 1, 'vendido', 'novo', '2026-05-31', '2026-05-31', '2026-05-31', '2026-05-31');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('eb4a9b19-d5b4-4b19-8456-a01bcfae39f2', 1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'concluida', 'normal', 7618.0, 7618.0, 0, 0, '2026-05-31');
UPDATE aparelhos SET venda_id = 'eb4a9b19-d5b4-4b19-8456-a01bcfae39f2' WHERE id = '6879588b-bbd1-4e2b-aca1-5e4caba6bc4f';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('d8dbafa0-d84b-4208-ad87-013dfb72033e', 'eb4a9b19-d5b4-4b19-8456-a01bcfae39f2', 'pix', 7618.0, '2026-05-31', '2026-05-31');

-- Troca: IPH 13 PRO (R$ 2450.00)
INSERT INTO aparelhos (id, modelo, valor_compra, loja_id, status, estado, observacoes, data_entrada, criado_em, atualizado_em)
VALUES ('99c8dd88-ee3b-4f41-bf0a-067cfe164b96', 'IPH 13 PRO', 2450.0, 1, 'disponivel', 'usado', 'Entrada por troca - venda eb4a9b19-d5b4-4b19-8456-a01bcfae39f2', '2026-05-31', '2026-05-31', '2026-05-31');

-- VENDA 365: IPHONE 14 PRO 128GB BRANCO SEMINOVO (31/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('e77c71b7-ae21-42ea-a911-69b90a4823db', 'IPHONE 14 PRO 128GB BRANCO', '352130217510063', 2900.0, 2700.0, 20, 'vendido', 'seminovo', '2026-05-31', '2026-05-31', '2026-05-31', '2026-05-31');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('57eaf6be-33e1-4a07-8bf6-361188f05e85', 20, 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 'concluida', 'normal', 2900.0, 2900.0, 0, 0, '2026-05-31');
UPDATE aparelhos SET venda_id = '57eaf6be-33e1-4a07-8bf6-361188f05e85' WHERE id = 'e77c71b7-ae21-42ea-a911-69b90a4823db';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('4c13339c-941a-4a93-a5f0-5797cc333361', '57eaf6be-33e1-4a07-8bf6-361188f05e85', 'cartao_credito', 2900.0, '2026-05-31', '2026-05-31');

-- Troca: IPHONE 12 AZUL, 128G (R$ 1000.00)
INSERT INTO aparelhos (id, modelo, valor_compra, loja_id, status, estado, observacoes, data_entrada, criado_em, atualizado_em)
VALUES ('3af73f99-26b0-43b6-93b0-068a038764e4', 'IPHONE 12 AZUL, 128G', 1000.0, 20, 'disponivel', 'usado', 'Entrada por troca - venda 57eaf6be-33e1-4a07-8bf6-361188f05e85', '2026-05-31', '2026-05-31', '2026-05-31');

-- VENDA 366: IPHONE 11 64GB PRETO SEMINOVO (31/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('ebcc2be5-aa27-4697-9482-b21f6edd8760', 'IPHONE 11 64GB PRETO', '357879829564513', 850.0, 600.0, 1, 'vendido', 'seminovo', '2026-05-31', '2026-05-31', '2026-05-31', '2026-05-31');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('6233aa84-5868-465d-8750-2fdb13d75a7b', 1, 'e07d4d35-1381-4d4d-914d-8382a7456fdd', 'concluida', 'normal', 850.0, 850.0, 0, 0, '2026-05-31');
UPDATE aparelhos SET venda_id = '6233aa84-5868-465d-8750-2fdb13d75a7b' WHERE id = 'ebcc2be5-aa27-4697-9482-b21f6edd8760';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('ea435755-a3d0-41e3-ad94-26fdc2e5e62f', '6233aa84-5868-465d-8750-2fdb13d75a7b', 'pix', 850.0, '2026-05-31', '2026-05-31');

-- VENDA 367: IPHONE 14 PRO 128GB BRANCO SEMINOVO (31/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('3b9b19bf-0303-45e6-8fc2-e9d77228f27f', 'IPHONE 14 PRO 128GB BRANCO', '351284081590783', 2950.0, 2700.0, 20, 'vendido', 'seminovo', '2026-05-31', '2026-05-31', '2026-05-31', '2026-05-31');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('9155e88f-5f76-44d9-90e1-6a5f613e0a54', 20, '25e2da5b-9e76-4388-9890-7e22efd6940d', 'concluida', 'normal', 2950.0, 2950.0, 0, 0, '2026-05-31');
UPDATE aparelhos SET venda_id = '9155e88f-5f76-44d9-90e1-6a5f613e0a54' WHERE id = '3b9b19bf-0303-45e6-8fc2-e9d77228f27f';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('635356c2-e095-46e7-a0de-db7144b33a7f', '9155e88f-5f76-44d9-90e1-6a5f613e0a54', 'pix', 2950.0, '2026-05-31', '2026-05-31');

-- VENDA 368: POCO X7 PRO 512GB PRETO NOVO (31/05/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('97f38546-c95b-4418-93ce-1be7b3cd2048', 'POCO X7 PRO 512GB PRETO', '869471083132525', 2190.0, 1990.0, 20, 'vendido', 'novo', '2026-05-31', '2026-05-31', '2026-05-31', '2026-05-31');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('5f0c7464-30a2-48b3-b58a-7cca8ed3f0f8', 20, '25e2da5b-9e76-4388-9890-7e22efd6940d', 'concluida', 'normal', 2190.0, 2190.0, 0, 0, '2026-05-31');
UPDATE aparelhos SET venda_id = '5f0c7464-30a2-48b3-b58a-7cca8ed3f0f8' WHERE id = '97f38546-c95b-4418-93ce-1be7b3cd2048';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('367a3c1f-578a-4623-ae5d-848ed7cffb31', '5f0c7464-30a2-48b3-b58a-7cca8ed3f0f8', 'dinheiro', 2190.0, '2026-05-31', '2026-05-31');

-- VENDA 369: GALAXY A11+ 5G SPACE GRAY 128GB NOVO (02/06/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('441ebdba-f011-41b6-9cde-cfc50a085459', 'GALAXY A11+ 5G SPACE GRAY 128GB', '356911420294546', 2180.0, 1700.0, 1, 'vendido', 'novo', '2026-06-02', '2026-06-02', '2026-06-02', '2026-06-02');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('ec865a15-554c-4517-aa30-a192367b04a1', 1, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 2180.0, 2180.0, 0, 0, '2026-06-02');
UPDATE aparelhos SET venda_id = 'ec865a15-554c-4517-aa30-a192367b04a1' WHERE id = '441ebdba-f011-41b6-9cde-cfc50a085459';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('12985cf2-d960-4e3a-bc0a-21d0ab1404a1', 'ec865a15-554c-4517-aa30-a192367b04a1', 'pix', 2180.0, '2026-06-02', '2026-06-02');

-- VENDA 370: IPHONE 17 PRO MAX 256GB AZUL NOVO (02/06/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('320bfb1b-a08f-4a15-9c88-a947b5a635c8', 'IPHONE 17 PRO MAX 256GB AZUL', '355101476201071', 7464.0, 7250.0, 4, 'vendido', 'novo', '2026-06-02', '2026-06-02', '2026-06-02', '2026-06-02');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('b6d062c8-5d7d-4f97-8f16-dbde861d8be0', 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 7464.0, 7464.0, 0, 0, '2026-06-02');
UPDATE aparelhos SET venda_id = 'b6d062c8-5d7d-4f97-8f16-dbde861d8be0' WHERE id = '320bfb1b-a08f-4a15-9c88-a947b5a635c8';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('03c5e923-972a-4f8f-9353-57d09a06f396', 'b6d062c8-5d7d-4f97-8f16-dbde861d8be0', 'pix', 7464.0, '2026-06-02', '2026-06-02');

-- Troca: IPH 14 PRO MAX ROXO (R$ 2700.00)
INSERT INTO aparelhos (id, modelo, valor_compra, loja_id, status, estado, observacoes, data_entrada, criado_em, atualizado_em)
VALUES ('b29235c0-5fb2-4498-aad3-031eba792849', 'IPH 14 PRO MAX ROXO', 2700.0, 4, 'disponivel', 'usado', 'Entrada por troca - venda b6d062c8-5d7d-4f97-8f16-dbde861d8be0', '2026-06-02', '2026-06-02', '2026-06-02');

-- VENDA 371: IPHONE 14 PRO 256GB PRETO SEMINOVO (02/06/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('5d4f96c2-1046-4c8a-a229-4c6fcf271814', 'IPHONE 14 PRO 256GB PRETO', '354542503453857', 3050.0, 2900.0, 20, 'vendido', 'seminovo', '2026-06-02', '2026-06-02', '2026-06-02', '2026-06-02');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('52aa84d1-0f25-4113-8286-14e7279211ad', 20, 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 'concluida', 'normal', 3050.0, 3050.0, 0, 0, '2026-06-02');
UPDATE aparelhos SET venda_id = '52aa84d1-0f25-4113-8286-14e7279211ad' WHERE id = '5d4f96c2-1046-4c8a-a229-4c6fcf271814';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('4b0294bf-c36a-44a6-af4c-9dbfae36c149', '52aa84d1-0f25-4113-8286-14e7279211ad', 'cartao_credito', 3050.0, '2026-06-02', '2026-06-02');

-- VENDA 372: IPHONE 13 PRO 256GB DOURADO SEMIINOVO (02/06/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('ba818d1f-c50b-4077-8f5b-511fceb374e1', 'IPHONE 13 PRO 256GB DOURADO SEMIINOVO', '352725357604046', 2700.0, 2400.0, 19, 'vendido', 'novo', '2026-06-02', '2026-06-02', '2026-06-02', '2026-06-02');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('c13e52d6-e98b-4fd5-b0e7-333f040b203b', 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 2700.0, 2700.0, 0, 0, '2026-06-02');
UPDATE aparelhos SET venda_id = 'c13e52d6-e98b-4fd5-b0e7-333f040b203b' WHERE id = 'ba818d1f-c50b-4077-8f5b-511fceb374e1';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('6cfeb004-2cb4-4b43-8a62-44d716471605', 'c13e52d6-e98b-4fd5-b0e7-333f040b203b', 'cartao_credito', 2700.0, '2026-06-02', '2026-06-02');

-- Troca: IPH (R$ 11.00)
INSERT INTO aparelhos (id, modelo, valor_compra, loja_id, status, estado, observacoes, data_entrada, criado_em, atualizado_em)
VALUES ('0941dc5e-0619-4a1e-879f-ed87b988e47c', 'IPH', 11.0, 19, 'disponivel', 'usado', 'Entrada por troca - venda c13e52d6-e98b-4fd5-b0e7-333f040b203b', '2026-06-02', '2026-06-02', '2026-06-02');

-- VENDA 373: MAGIC MOUSE 3 BRANCO NOVO (02/06/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('856cc52d-e35c-4af1-a84b-18cc4ea60c87', 'MAGIC MOUSE 3 BRANCO', 'J84HN004QLB0000539', 760.0, 660.0, 19, 'vendido', 'novo', '2026-06-02', '2026-06-02', '2026-06-02', '2026-06-02');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('d79170d6-f8b3-4530-a45f-99cf9eb3dab4', 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 760.0, 760.0, 0, 0, '2026-06-02');
UPDATE aparelhos SET venda_id = 'd79170d6-f8b3-4530-a45f-99cf9eb3dab4' WHERE id = '856cc52d-e35c-4af1-a84b-18cc4ea60c87';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('6b8af0a9-fd50-4013-8309-b87447f48004', 'd79170d6-f8b3-4530-a45f-99cf9eb3dab4', 'pix', 760.0, '2026-06-02', '2026-06-02');

-- VENDA 374: IPHONE 17 PRO MAX 256GB SILVER NOVO (02/06/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('155b30b9-f687-47be-80ce-c4498ea9bf0b', 'IPHONE 17 PRO MAX 256GB SILVER', '357247257394938', 7750.0, 7500.0, 19, 'vendido', 'novo', '2026-06-02', '2026-06-02', '2026-06-02', '2026-06-02');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('0306ac6d-fbac-4d26-bcf8-2ab253490ac2', 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 7750.0, 7750.0, 0, 0, '2026-06-02');
UPDATE aparelhos SET venda_id = '0306ac6d-fbac-4d26-bcf8-2ab253490ac2' WHERE id = '155b30b9-f687-47be-80ce-c4498ea9bf0b';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('feb3ca6f-03cc-468e-8c96-026ead42a4bc', '0306ac6d-fbac-4d26-bcf8-2ab253490ac2', 'dinheiro', 7750.0, '2026-06-02', '2026-06-02');

-- VENDA 375: IPHONE 17 PRO MAX 256GB SILVER NOVO (02/06/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('e8498ecc-9cd9-4edc-8214-05b083000e60', 'IPHONE 17 PRO MAX 256GB SILVER', '357247256875010', 7750.0, 7500.0, 19, 'vendido', 'novo', '2026-06-02', '2026-06-02', '2026-06-02', '2026-06-02');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('63679c79-4057-4187-ad84-608128f1f48d', 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 7750.0, 7750.0, 0, 0, '2026-06-02');
UPDATE aparelhos SET venda_id = '63679c79-4057-4187-ad84-608128f1f48d' WHERE id = 'e8498ecc-9cd9-4edc-8214-05b083000e60';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('c96a2a44-86fd-413d-807b-94138ce522cc', '63679c79-4057-4187-ad84-608128f1f48d', 'pix', 7750.0, '2026-06-02', '2026-06-02');

-- Troca: IPH 17 PRO SILVER (R$ 6300.00)
INSERT INTO aparelhos (id, modelo, valor_compra, loja_id, status, estado, observacoes, data_entrada, criado_em, atualizado_em)
VALUES ('508c455d-97d2-4e04-b77c-eea4bafab8b1', 'IPH 17 PRO SILVER', 6300.0, 19, 'disponivel', 'usado', 'Entrada por troca - venda 63679c79-4057-4187-ad84-608128f1f48d', '2026-06-02', '2026-06-02', '2026-06-02');

-- VENDA 376: BOOMBOX 4 BRANCA NOVA (03/06/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('6c5255c1-57de-4905-a5fc-f9be51506061', 'BOOMBOX 4 BRANCA NOVA', 'TL1878-AQ0021235', 2405.0, 2250.0, 4, 'vendido', 'seminovo', '2026-06-03', '2026-06-03', '2026-06-03', '2026-06-03');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('d5fb3c68-71b0-4e30-af29-cbadb435751b', 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 2405.0, 2405.0, 0, 0, '2026-06-03');
UPDATE aparelhos SET venda_id = 'd5fb3c68-71b0-4e30-af29-cbadb435751b' WHERE id = '6c5255c1-57de-4905-a5fc-f9be51506061';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('3993fa22-3926-4221-80b3-2324cf715fd7', 'd5fb3c68-71b0-4e30-af29-cbadb435751b', 'pix', 2405.0, '2026-06-03', '2026-06-03');

-- VENDA 377: IPHONE 12 PRO MAX 128GB GRAFITE SEMINOVO (03/06/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('67b9bd6b-d835-4cff-8a1b-0571c1fd654d', 'IPHONE 12 PRO MAX 128GB GRAFITE', '351330881416677', 2250.0, 2000.0, 1, 'vendido', 'seminovo', '2026-06-03', '2026-06-03', '2026-06-03', '2026-06-03');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('e4439537-931c-42a5-95c6-38185d2280ca', 1, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 2250.0, 2250.0, 0, 0, '2026-06-03');
UPDATE aparelhos SET venda_id = 'e4439537-931c-42a5-95c6-38185d2280ca' WHERE id = '67b9bd6b-d835-4cff-8a1b-0571c1fd654d';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('424a956c-5a63-46fc-96d4-3d47127afecb', 'e4439537-931c-42a5-95c6-38185d2280ca', 'pix', 2250.0, '2026-06-03', '2026-06-03');

-- VENDA 378: IPHONE 16 PRO MAX 512GB PRETO SEMINOVO (03/06/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('0a786ddb-abe4-4a1c-9027-f580268ac936', 'IPHONE 16 PRO MAX 512GB PRETO', '355300181430419', 6049.0, 5150.0, 4, 'vendido', 'seminovo', '2026-06-03', '2026-06-03', '2026-06-03', '2026-06-03');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('bd925f99-70ee-49e8-af6b-a2710ad5b733', 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 6049.0, 6049.0, 0, 0, '2026-06-03');
UPDATE aparelhos SET venda_id = 'bd925f99-70ee-49e8-af6b-a2710ad5b733' WHERE id = '0a786ddb-abe4-4a1c-9027-f580268ac936';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('f4db00d5-4acf-4845-b96d-736dab65c104', 'bd925f99-70ee-49e8-af6b-a2710ad5b733', 'pix', 6049.0, '2026-06-03', '2026-06-03');

-- VENDA 379: IPHONE 15 PRO MAX 256GB SEMINOVO (03/06/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('021b4112-3865-4897-821d-2c6979105234', 'IPHONE 15 PRO MAX 256GB', '356371488105219', 4010.0, 3700.0, 4, 'vendido', 'seminovo', '2026-06-03', '2026-06-03', '2026-06-03', '2026-06-03');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('93e57c9a-e92c-4411-9b79-c6d56525df0a', 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 4010.0, 4010.0, 0, 0, '2026-06-03');
UPDATE aparelhos SET venda_id = '93e57c9a-e92c-4411-9b79-c6d56525df0a' WHERE id = '021b4112-3865-4897-821d-2c6979105234';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('6b70b4ad-a8c5-423b-803d-0474055e805b', '93e57c9a-e92c-4411-9b79-c6d56525df0a', 'pix', 4010.0, '2026-06-03', '2026-06-03');

-- VENDA 380: NOTE 15 PRO 5G 256GB PRETO NOVO (03/06/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('4965998b-ac37-49fd-ad04-256eced645d0', 'NOTE 15 PRO 5G 256GB PRETO', '863573083678542', 1857.0, 1680.0, 4, 'vendido', 'novo', '2026-06-03', '2026-06-03', '2026-06-03', '2026-06-03');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('d8ef7803-cb70-496f-b5d1-5522f8e7c6c2', 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 1857.0, 1857.0, 0, 0, '2026-06-03');
UPDATE aparelhos SET venda_id = 'd8ef7803-cb70-496f-b5d1-5522f8e7c6c2' WHERE id = '4965998b-ac37-49fd-ad04-256eced645d0';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('7d5eb558-2c9f-405a-aeb6-6d44a7bd4f23', 'd8ef7803-cb70-496f-b5d1-5522f8e7c6c2', 'pix', 1857.0, '2026-06-03', '2026-06-03');

-- VENDA 381: IPHONE 15 PRO MAX 256GB PRETO SEMINOVO (03/06/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('c9d052b4-c203-40b8-abcd-0384289cb0da', 'IPHONE 15 PRO MAX 256GB PRETO', '357275797266613', 4140.0, 3700.0, 19, 'vendido', 'seminovo', '2026-06-03', '2026-06-03', '2026-06-03', '2026-06-03');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('0753548e-71be-407a-bf99-367ff449c680', 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 4140.0, 4140.0, 0, 0, '2026-06-03');
UPDATE aparelhos SET venda_id = '0753548e-71be-407a-bf99-367ff449c680' WHERE id = 'c9d052b4-c203-40b8-abcd-0384289cb0da';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('380206bd-d0c4-4720-a55b-213dd7ba2bf8', '0753548e-71be-407a-bf99-367ff449c680', 'cartao_credito', 4140.0, '2026-06-03', '2026-06-03');

-- VENDA 382: IPHONE 17 PRO MAX 256GB SILVER NOVO (03/06/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('2ff6bb0f-86b4-430b-ab12-41b0140970b5', 'IPHONE 17 PRO MAX 256GB SILVER', '351668140730168', 7750.0, 7550.0, 19, 'vendido', 'novo', '2026-06-03', '2026-06-03', '2026-06-03', '2026-06-03');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('0225982c-a474-4e1f-9a74-0186d33236aa', 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 7750.0, 7750.0, 0, 0, '2026-06-03');
UPDATE aparelhos SET venda_id = '0225982c-a474-4e1f-9a74-0186d33236aa' WHERE id = '2ff6bb0f-86b4-430b-ab12-41b0140970b5';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('9f27ffba-335f-430d-9472-998620a6c46a', '0225982c-a474-4e1f-9a74-0186d33236aa', 'cartao_credito', 7750.0, '2026-06-03', '2026-06-03');

-- VENDA 383: POCO PAD M1 256GB PRETO NOVO (03/06/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('04582679-b7b2-4df7-a72d-3fe76b098081', 'POCO PAD M1 256GB PRETO', '71114/Y5XS01610', 1560.0, 1510.0, 19, 'vendido', 'novo', '2026-06-03', '2026-06-03', '2026-06-03', '2026-06-03');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('59055ada-2181-423d-8526-e44f1d150e94', 19, 'b4269e60-eea2-4eba-a34d-db9591e0ec83', 'concluida', 'normal', 1560.0, 1560.0, 0, 0, '2026-06-03');
UPDATE aparelhos SET venda_id = '59055ada-2181-423d-8526-e44f1d150e94' WHERE id = '04582679-b7b2-4df7-a72d-3fe76b098081';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('030bfe6a-e52f-4bef-a41e-223a5477aaee', '59055ada-2181-423d-8526-e44f1d150e94', 'pix', 1560.0, '2026-06-03', '2026-06-03');

-- VENDA 384: GALAXY A36 256GB PRETO NOVO (03/06/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('7e739a48-be8b-4a5d-94ee-6842f6c7f381', 'GALAXY A36 256GB PRETO', '352230462132793', 1514.0, 1420.0, 20, 'vendido', 'novo', '2026-06-03', '2026-06-03', '2026-06-03', '2026-06-03');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('0a8629b4-91cf-468c-84f7-44f3933e8ae8', 20, 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 'concluida', 'normal', 1514.0, 1514.0, 0, 0, '2026-06-03');
UPDATE aparelhos SET venda_id = '0a8629b4-91cf-468c-84f7-44f3933e8ae8' WHERE id = '7e739a48-be8b-4a5d-94ee-6842f6c7f381';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('e108bde1-ef19-4ba8-bcc3-e3343c6d1445', '0a8629b4-91cf-468c-84f7-44f3933e8ae8', 'cartao_credito', 1514.0, '2026-06-03', '2026-06-03');

-- VENDA 385: T-REX 3 PRO PRETO NOVO (03/06/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('e9afc1ce-d3cd-4db3-874d-d03222839ba6', 'T-REX 3 PRO PRETO', '24449537045774', 1899.0, 1800.0, 20, 'vendido', 'novo', '2026-06-03', '2026-06-03', '2026-06-03', '2026-06-03');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('504c2422-d3a3-484b-8555-d56e310f85c1', 20, 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 'concluida', 'normal', 1899.0, 1899.0, 0, 0, '2026-06-03');
UPDATE aparelhos SET venda_id = '504c2422-d3a3-484b-8555-d56e310f85c1' WHERE id = 'e9afc1ce-d3cd-4db3-874d-d03222839ba6';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('5156eb7d-0235-4050-9a5b-a00a50fe9017', '504c2422-d3a3-484b-8555-d56e310f85c1', 'pix', 1899.0, '2026-06-03', '2026-06-03');

-- VENDA 386: IPHONE 14 128GB AZUL SEMINOVO (03/06/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('f2df0337-c91f-4a27-91f3-4b71076fd955', 'IPHONE 14 128GB AZUL', '355536442174276', 2240.0, 1900.0, 20, 'vendido', 'seminovo', '2026-06-03', '2026-06-03', '2026-06-03', '2026-06-03');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('aa48d20c-b148-463b-9829-0527a0523a04', 20, '25e2da5b-9e76-4388-9890-7e22efd6940d', 'concluida', 'normal', 2240.0, 2240.0, 0, 0, '2026-06-03');
UPDATE aparelhos SET venda_id = 'aa48d20c-b148-463b-9829-0527a0523a04' WHERE id = 'f2df0337-c91f-4a27-91f3-4b71076fd955';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('5a50de18-162e-414b-93d6-8484c35e4732', 'aa48d20c-b148-463b-9829-0527a0523a04', 'pix', 2240.0, '2026-06-03', '2026-06-03');

-- VENDA 387: IPHONE 17 PRO 256GB SILVER NOVO (04/06/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('a8f45bfe-c57b-4ae3-a3c5-5d4ef5faac88', 'IPHONE 17 PRO 256GB SILVER', '357679992297861', 7370.0, 6950.0, 4, 'vendido', 'novo', '2026-06-04', '2026-06-04', '2026-06-04', '2026-06-04');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('9030658c-1f52-4dff-9efa-2f3192b5611a', 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 7370.0, 7370.0, 0, 0, '2026-06-04');
UPDATE aparelhos SET venda_id = '9030658c-1f52-4dff-9efa-2f3192b5611a' WHERE id = 'a8f45bfe-c57b-4ae3-a3c5-5d4ef5faac88';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('c3b3d3e2-4500-46a8-81b7-733f1b345af5', '9030658c-1f52-4dff-9efa-2f3192b5611a', 'pix', 7370.0, '2026-06-04', '2026-06-04');

-- VENDA 388: IPHONE 15 128GB AZUL SEMINOVO (04/06/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('4c3e2fa9-382d-43bb-a571-78f9614f105d', 'IPHONE 15 128GB AZUL', '351698471567244', 2900.0, 2660.0, 4, 'vendido', 'seminovo', '2026-06-04', '2026-06-04', '2026-06-04', '2026-06-04');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('ee113b21-d38b-45a5-85e4-f37f215a08f2', 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 2900.0, 2900.0, 0, 0, '2026-06-04');
UPDATE aparelhos SET venda_id = 'ee113b21-d38b-45a5-85e4-f37f215a08f2' WHERE id = '4c3e2fa9-382d-43bb-a571-78f9614f105d';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('e7673634-21a3-44cc-ba75-e9cb9404f1d5', 'ee113b21-d38b-45a5-85e4-f37f215a08f2', 'pix', 2900.0, '2026-06-04', '2026-06-04');

-- VENDA 389: IPHONE 15 PRO MAX 256GB PRETO SEMINOVO (04/06/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('be98819b-23eb-4f0c-95c8-af438c5c275f', 'IPHONE 15 PRO MAX 256GB PRETO', '351465644827966', 4400.0, 4100.0, 4, 'vendido', 'seminovo', '2026-06-04', '2026-06-04', '2026-06-04', '2026-06-04');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('2fabf2b4-7158-45dc-97da-f54256cd38f3', 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 4400.0, 4400.0, 0, 0, '2026-06-04');
UPDATE aparelhos SET venda_id = '2fabf2b4-7158-45dc-97da-f54256cd38f3' WHERE id = 'be98819b-23eb-4f0c-95c8-af438c5c275f';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('c1791fe2-c871-4e7e-9631-e27bd1714bc8', '2fabf2b4-7158-45dc-97da-f54256cd38f3', 'pix', 4400.0, '2026-06-04', '2026-06-04');

-- VENDA 390: IPHONE 16 PRO MAX 256GB DESERT NOVO (04/06/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('90ef5c82-2125-44f7-be57-1d805daa252f', 'IPHONE 16 PRO MAX 256GB DESERT', '357590879692399', 5970.0, 5850.0, 20, 'vendido', 'novo', '2026-06-04', '2026-06-04', '2026-06-04', '2026-06-04');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('bf5b6369-f5a8-4cb4-8e4b-fd19ca452395', 20, 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 'concluida', 'normal', 5970.0, 5970.0, 0, 0, '2026-06-04');
UPDATE aparelhos SET venda_id = 'bf5b6369-f5a8-4cb4-8e4b-fd19ca452395' WHERE id = '90ef5c82-2125-44f7-be57-1d805daa252f';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('9854a6d4-82c8-4ab5-804a-19274bd34e20', 'bf5b6369-f5a8-4cb4-8e4b-fd19ca452395', 'cartao_credito', 5970.0, '2026-06-04', '2026-06-04');

-- VENDA 391: IPHONE 14 128GB BRANCO SEMINOVO (04/06/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('573fd290-708b-428f-9a40-201f7c3a8566', 'IPHONE 14 128GB BRANCO', '353687476380990', 2100.0, 1900.0, 20, 'vendido', 'seminovo', '2026-06-04', '2026-06-04', '2026-06-04', '2026-06-04');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('9c4fa369-882d-4e2a-8496-0b7dc8246f8f', 20, 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 'concluida', 'normal', 2100.0, 2100.0, 0, 0, '2026-06-04');
UPDATE aparelhos SET venda_id = '9c4fa369-882d-4e2a-8496-0b7dc8246f8f' WHERE id = '573fd290-708b-428f-9a40-201f7c3a8566';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('c61ad485-17cf-4706-a5e0-d6a801c9111b', '9c4fa369-882d-4e2a-8496-0b7dc8246f8f', 'cartao_credito', 2100.0, '2026-06-04', '2026-06-04');

-- Troca: IPHONE 13 AZUL 128G (R$ 1650.00)
INSERT INTO aparelhos (id, modelo, valor_compra, loja_id, status, estado, observacoes, data_entrada, criado_em, atualizado_em)
VALUES ('304ce24a-6438-4d5d-9f32-eef8010b30df', 'IPHONE 13 AZUL 128G', 1650.0, 20, 'disponivel', 'usado', 'Entrada por troca - venda 9c4fa369-882d-4e2a-8496-0b7dc8246f8f', '2026-06-04', '2026-06-04', '2026-06-04');

-- VENDA 392: IPHONE 15 128GB ROSA SEMINOVO (04/06/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('6e4b9a1e-eec5-4d4d-829d-1c957650cb69', 'IPHONE 15 128GB ROSA', '353850628182660', 2950.0, 2660.0, 4, 'vendido', 'seminovo', '2026-06-04', '2026-06-04', '2026-06-04', '2026-06-04');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('c4de912c-36c7-4bd9-95a4-124e9ee43f5c', 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 2950.0, 2950.0, 0, 0, '2026-06-04');
UPDATE aparelhos SET venda_id = 'c4de912c-36c7-4bd9-95a4-124e9ee43f5c' WHERE id = '6e4b9a1e-eec5-4d4d-829d-1c957650cb69';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('8ae13890-cb23-4eb0-9bdf-fb8bddb9e967', 'c4de912c-36c7-4bd9-95a4-124e9ee43f5c', 'pix', 2950.0, '2026-06-04', '2026-06-04');

-- VENDA 393: IPHONE 17 256GB BRANCO NOVO (04/06/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('ffed3246-1d48-48d7-b779-4ec6b2fc9113', 'IPHONE 17 256GB BRANCO', '359973613643894', 4700.0, 4600.0, 4, 'vendido', 'novo', '2026-06-04', '2026-06-04', '2026-06-04', '2026-06-04');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('a11d8c5a-2cc3-4627-90ce-f4ada5ac1f5a', 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 4700.0, 4700.0, 0, 0, '2026-06-04');
UPDATE aparelhos SET venda_id = 'a11d8c5a-2cc3-4627-90ce-f4ada5ac1f5a' WHERE id = 'ffed3246-1d48-48d7-b779-4ec6b2fc9113';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('3bd41d25-23e3-4955-b51c-651a3c04aea0', 'a11d8c5a-2cc3-4627-90ce-f4ada5ac1f5a', 'pix', 4700.0, '2026-06-04', '2026-06-04');

-- VENDA 394: IPHONE 17 256GB PRETO NOVO (04/06/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('f772549c-0651-4568-b229-540372ea8faa', 'IPHONE 17 256GB PRETO', '351205581240124', 4624.0, 4500.0, 4, 'vendido', 'novo', '2026-06-04', '2026-06-04', '2026-06-04', '2026-06-04');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('1b40653f-d2e2-4361-92ef-79bb908c79ce', 4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'concluida', 'normal', 4624.0, 4624.0, 0, 0, '2026-06-04');
UPDATE aparelhos SET venda_id = '1b40653f-d2e2-4361-92ef-79bb908c79ce' WHERE id = 'f772549c-0651-4568-b229-540372ea8faa';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('64306fba-97d0-479b-a5f9-ca65d95f85c6', '1b40653f-d2e2-4361-92ef-79bb908c79ce', 'pix', 4624.0, '2026-06-04', '2026-06-04');

-- VENDA 395: POCO X8 PRO MAX 512GB BRANCO NOVO (04/06/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('11c60bcb-8402-404a-9175-050cf3594299', 'POCO X8 PRO MAX 512GB BRANCO', '860534086640486', 3050.0, 2950.0, 19, 'vendido', 'novo', '2026-06-04', '2026-06-04', '2026-06-04', '2026-06-04');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('63ff3448-5226-4995-af42-887c37cb86b0', 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 3050.0, 3050.0, 0, 0, '2026-06-04');
UPDATE aparelhos SET venda_id = '63ff3448-5226-4995-af42-887c37cb86b0' WHERE id = '11c60bcb-8402-404a-9175-050cf3594299';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('5a7e7490-4ddf-4dff-9a90-66686f5166d9', '63ff3448-5226-4995-af42-887c37cb86b0', 'pix', 3050.0, '2026-06-04', '2026-06-04');

-- VENDA 396: IPHONE 17 PRO MAX 256GB SILVER NOVO (04/06/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('f8dcad2c-fa0a-473d-9195-21d57b704015', 'IPHONE 17 PRO MAX 256GB SILVER', '351205745375915', 7750.0, 7500.0, 19, 'vendido', 'novo', '2026-06-04', '2026-06-04', '2026-06-04', '2026-06-04');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('f30d627e-eba0-45a7-a590-ded8d8835b14', 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 7750.0, 7750.0, 0, 0, '2026-06-04');
UPDATE aparelhos SET venda_id = 'f30d627e-eba0-45a7-a590-ded8d8835b14' WHERE id = 'f8dcad2c-fa0a-473d-9195-21d57b704015';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('62883178-35db-4002-8de1-0209e6ef872d', 'f30d627e-eba0-45a7-a590-ded8d8835b14', 'dinheiro', 7750.0, '2026-06-04', '2026-06-04');

-- Troca: IPH 15 PRO MAX 256GB (R$ 3700.00)
INSERT INTO aparelhos (id, modelo, valor_compra, loja_id, status, estado, observacoes, data_entrada, criado_em, atualizado_em)
VALUES ('fed02049-0e7d-43dd-b2db-4a0cd6fb0851', 'IPH 15 PRO MAX 256GB', 3700.0, 19, 'disponivel', 'usado', 'Entrada por troca - venda f30d627e-eba0-45a7-a590-ded8d8835b14', '2026-06-04', '2026-06-04', '2026-06-04');

-- VENDA 397: POCO X8 PRO 512GB PRETO NOVO (04/06/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('2a70b916-3d53-4189-bc76-75046b898284', 'POCO X8 PRO 512GB PRETO', 'V865532083172607', 2500.0, 2300.0, 19, 'vendido', 'novo', '2026-06-04', '2026-06-04', '2026-06-04', '2026-06-04');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('13ecb876-c7e5-457f-9774-a0a3d0204a29', 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 2500.0, 2500.0, 0, 0, '2026-06-04');
UPDATE aparelhos SET venda_id = '13ecb876-c7e5-457f-9774-a0a3d0204a29' WHERE id = '2a70b916-3d53-4189-bc76-75046b898284';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('a6016f6e-e6ce-46b0-8ff7-148e1b65cf56', '13ecb876-c7e5-457f-9774-a0a3d0204a29', 'cartao_credito', 2500.0, '2026-06-04', '2026-06-04');

-- VENDA 398: IPHONE 17 PRO MAX 256GB AZUL NOVO (04/06/2026)
INSERT INTO aparelhos (id, modelo, imei, valor_venda, valor_compra, loja_id, status, estado, data_entrada, data_venda, criado_em, atualizado_em)
VALUES ('d2fed7c0-abfa-4a25-b1bc-464611dca86a', 'IPHONE 17 PRO MAX 256GB AZUL', '359652120809905', 7467.0, 7230.0, 19, 'vendido', 'novo', '2026-06-04', '2026-06-04', '2026-06-04', '2026-06-04');
INSERT INTO vendas (id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
VALUES ('5f45a7be-fb1a-4023-b1bd-48ca75c73760', 19, '97f12885-87ad-426a-8bbb-656889d82e10', 'concluida', 'normal', 7467.0, 7467.0, 0, 0, '2026-06-04');
UPDATE aparelhos SET venda_id = '5f45a7be-fb1a-4023-b1bd-48ca75c73760' WHERE id = 'd2fed7c0-abfa-4a25-b1bc-464611dca86a';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_em)
VALUES ('4b4d8e15-a68f-4283-89f4-2c4f99369d77', '5f45a7be-fb1a-4023-b1bd-48ca75c73760', 'cartao_credito', 7467.0, '2026-06-04', '2026-06-04');

-- Troca: IPH 13 PRO MAX (R$ 2100.00)
INSERT INTO aparelhos (id, modelo, valor_compra, loja_id, status, estado, observacoes, data_entrada, criado_em, atualizado_em)
VALUES ('62a04bba-bb36-4743-8d68-f0a8df867eb9', 'IPH 13 PRO MAX', 2100.0, 19, 'disponivel', 'usado', 'Entrada por troca - venda 5f45a7be-fb1a-4023-b1bd-48ca75c73760', '2026-06-04', '2026-06-04', '2026-06-04');

COMMIT;

-- ============================================
-- RESUMO
-- Vendas criadas: 397
-- Trocas registradas: 95
-- Vendedores sem ID: 4
-- Aparelhos sem IMEI: 7
-- ============================================