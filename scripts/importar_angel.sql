BEGIN;
DO $body$
DECLARE v_cliente_id UUID;
BEGIN
    SELECT id INTO v_cliente_id FROM clientes WHERE nome = 'Cliente Balcao' LIMIT 1;
    IF v_cliente_id IS NULL THEN
        INSERT INTO clientes (id, nome, id_loja, criado_em, atualizado_em)
        VALUES (gen_random_uuid(), 'Cliente Balcao', 1, NOW(), NOW())
        RETURNING id INTO v_cliente_id;
    END IF;
    PERFORM set_config('importacao.cliente_id', v_cliente_id::text, true);
END;
$body$;

-- Linha 50: IPHONE 14 PRO MAX 512GB ROXO SEMINOVO
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes) VALUES ('e4d4acb7-0699-4a5e-85d3-427543cbea4f', 'Apple', 'IPHONE 14 PRO MAX 512GB ROXO SEMINOVO', '356041402342004', 3800.0, 3500.0, 20, 'seminovo', 'bom', 'vendido', '2026-06-07T14:00:00+00', '2026-06-07T14:00:00+00', '4549c96e-5c53-4cd6-b738-9d798f82a740', '2026-06-07T14:00:00+00', '2026-06-07T14:00:00+00', 'Vendedor Angel - pendente ID real');
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por) VALUES ('f9ff1c96-1406-4b0d-ba3b-a0e334a86521', 11689, current_setting('importacao.cliente_id')::uuid, 20, '4549c96e-5c53-4cd6-b738-9d798f82a740', 'concluida', 'normal', 3800.0, 3800.0, 0, '2026-06-07T14:00:00+00', '2026-06-07T14:00:00+00', '4549c96e-5c53-4cd6-b738-9d798f82a740');
UPDATE aparelhos SET venda_id = 'f9ff1c96-1406-4b0d-ba3b-a0e334a86521' WHERE id = 'e4d4acb7-0699-4a5e-85d3-427543cbea4f';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em) VALUES ('1fefd2c9-e44d-4ace-8c3f-56ca50a52ecd', 'f9ff1c96-1406-4b0d-ba3b-a0e334a86521', 'pix', 3800.0, '2026-06-07', '4549c96e-5c53-4cd6-b738-9d798f82a740', 1, '2026-06-07T14:00:00+00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em) VALUES ('a05015bc-ac87-40ec-9f4c-75d7fbdac744', 20, 'f9ff1c96-1406-4b0d-ba3b-a0e334a86521', 'Brinde', 15.0, '2026-06-07', '4549c96e-5c53-4cd6-b738-9d798f82a740', '2026-06-07T14:00:00+00');

-- Linha 51: IPHONE 13 256GB ROSA SEMINOVO
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes) VALUES ('f8629bb2-e8cf-484c-b6bc-cc6ed6771b36', 'Apple', 'IPHONE 13 256GB ROSA SEMINOVO', '352615457839263', 2100.0, 1900.0, 20, 'seminovo', 'bom', 'vendido', '2026-06-07T14:00:00+00', '2026-06-07T14:00:00+00', '4549c96e-5c53-4cd6-b738-9d798f82a740', '2026-06-07T14:00:00+00', '2026-06-07T14:00:00+00', 'Vendedor Angel - pendente ID real');
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por) VALUES ('6db95091-a62e-4718-86e4-5dfb1b6662a8', 11690, current_setting('importacao.cliente_id')::uuid, 20, '4549c96e-5c53-4cd6-b738-9d798f82a740', 'concluida', 'normal', 2100.0, 2100.0, 0, '2026-06-07T14:00:00+00', '2026-06-07T14:00:00+00', '4549c96e-5c53-4cd6-b738-9d798f82a740');
UPDATE aparelhos SET venda_id = '6db95091-a62e-4718-86e4-5dfb1b6662a8' WHERE id = 'f8629bb2-e8cf-484c-b6bc-cc6ed6771b36';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em) VALUES ('6319bb3b-2ff6-49b5-8c78-fc3eb2608b2c', '6db95091-a62e-4718-86e4-5dfb1b6662a8', 'pix', 2100.0, '2026-06-07', '4549c96e-5c53-4cd6-b738-9d798f82a740', 1, '2026-06-07T14:00:00+00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em) VALUES ('d94b0515-9769-4de0-bec7-3a5707d8cb7a', 20, '6db95091-a62e-4718-86e4-5dfb1b6662a8', 'Brinde', 15.0, '2026-06-07', '4549c96e-5c53-4cd6-b738-9d798f82a740', '2026-06-07T14:00:00+00');

-- Linha 106: IPHONE 16 PRO MAX 256GB PRETO SEMINOVO
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes) VALUES ('8d89530c-de32-43e1-bafb-7f14a8ed7f20', 'Apple', 'IPHONE 16 PRO MAX 256GB PRETO SEMINOVO', '356744602694336', 5400.0, 4950.0, 20, 'seminovo', 'bom', 'vendido', '2026-06-13T14:00:00+00', '2026-06-13T14:00:00+00', '4549c96e-5c53-4cd6-b738-9d798f82a740', '2026-06-13T14:00:00+00', '2026-06-13T14:00:00+00', 'Vendedor Angel - pendente ID real; pgto forcado pix');
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por) VALUES ('2815fe8d-f410-4223-bced-280f8c9e8ac5', 11691, current_setting('importacao.cliente_id')::uuid, 20, '4549c96e-5c53-4cd6-b738-9d798f82a740', 'concluida', 'normal', 5400.0, 5400.0, 0, '2026-06-13T14:00:00+00', '2026-06-13T14:00:00+00', '4549c96e-5c53-4cd6-b738-9d798f82a740');
UPDATE aparelhos SET venda_id = '2815fe8d-f410-4223-bced-280f8c9e8ac5' WHERE id = '8d89530c-de32-43e1-bafb-7f14a8ed7f20';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em) VALUES ('d4fc85ec-ef8f-4e26-ba16-5e7a2741f254', '2815fe8d-f410-4223-bced-280f8c9e8ac5', 'pix', 5400.0, '2026-06-13', '4549c96e-5c53-4cd6-b738-9d798f82a740', 1, '2026-06-13T14:00:00+00');

-- Linha 167: IPHONE 17 PRO MAX 256GB NOVO AZUL
INSERT INTO aparelhos (id, marca, modelo, imei, valor_venda, valor_compra, loja_id, estado, condicao, status, data_venda, data_entrada, criado_por, criado_em, atualizado_em, observacoes) VALUES ('19927cfa-19f7-4f61-a193-22d37f62ee46', 'Apple', 'IPHONE 17 PRO MAX 256GB NOVO AZUL', '357247257649059', 7350.0, 7000.0, 20, 'novo', 'perfeito', 'vendido', '2026-06-21T14:00:00+00', '2026-06-21T14:00:00+00', '4549c96e-5c53-4cd6-b738-9d798f82a740', '2026-06-21T14:00:00+00', '2026-06-21T14:00:00+00', 'Vendedor Angel - pendente ID real; pgto forcado pix');
INSERT INTO vendas (id, numero_venda, cliente_id, loja_id, vendedor_id, status, tipo, valor_total, valor_pago, saldo_devedor, criado_em, finalizado_em, finalizado_por) VALUES ('5eb91b66-becd-49c8-8de2-75e34ce2b6c9', 11692, current_setting('importacao.cliente_id')::uuid, 20, '4549c96e-5c53-4cd6-b738-9d798f82a740', 'concluida', 'normal', 7350.0, 7350.0, 0, '2026-06-21T14:00:00+00', '2026-06-21T14:00:00+00', '4549c96e-5c53-4cd6-b738-9d798f82a740');
UPDATE aparelhos SET venda_id = '5eb91b66-becd-49c8-8de2-75e34ce2b6c9' WHERE id = '19927cfa-19f7-4f61-a193-22d37f62ee46';
INSERT INTO pagamentos_venda (id, venda_id, tipo_pagamento, valor, data_pagamento, criado_por, parcelas, criado_em) VALUES ('00d3c9fb-5d3a-4110-ab56-338d1ce2bf57', '5eb91b66-becd-49c8-8de2-75e34ce2b6c9', 'pix', 7350.0, '2026-06-21', '4549c96e-5c53-4cd6-b738-9d798f82a740', 1, '2026-06-21T14:00:00+00');
INSERT INTO brindes_aparelhos (id, loja_id, venda_id, descricao, valor_custo, data_ocorrencia, criado_por, criado_em) VALUES ('f244a636-dd66-4da7-801f-d9894f2c058d', 20, '5eb91b66-becd-49c8-8de2-75e34ce2b6c9', 'Brinde', 5.0, '2026-06-21', '4549c96e-5c53-4cd6-b738-9d798f82a740', '2026-06-21T14:00:00+00');

COMMIT;