
-- ============================================
-- Script gerado automaticamente
-- Total aparelhos órfãos: 210
-- Encontrados na planilha: 420
-- Sem match na planilha: 0
-- Vendedores não mapeados: 0
-- ============================================

BEGIN;

WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (1, '9451cd9f-6770-4e32-aae8-c75fa675e818', 'em_andamento', 'normal', 2450, 0, 0, 2450, '2026-05-11T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = 'e2c8b9af-4616-4244-82b2-6e58fe25804b';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (4, 'e07d4d35-1381-4d4d-914d-8382a7456fdd', 'em_andamento', 'normal', 4700, 0, 0, 4700, '2026-05-03T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = '556e514a-6904-4098-b31f-d5318c32573e';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (4, 'e07d4d35-1381-4d4d-914d-8382a7456fdd', 'em_andamento', 'normal', 2900, 0, 0, 2900, '2026-05-05T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = '36ae0eb5-6c53-4827-bdb9-79fe93b38598';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'em_andamento', 'normal', 2850, 0, 0, 2850, '2026-05-08T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = 'eab28df5-eba1-478f-ad9e-0d4619dc7d19';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'em_andamento', 'normal', 2077, 0, 0, 2077, '2026-05-10T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = '214a6265-5c04-4155-a7a7-87aba86001f5';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (19, '97f12885-87ad-426a-8bbb-656889d82e10', 'em_andamento', 'normal', 7650, 0, 0, 7650, '2026-05-16T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = '07736bf6-b4e6-4c12-9a87-1304ea1580b3';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (19, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'em_andamento', 'normal', 2450, 0, 0, 2450, '2026-05-20T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = '09a9b31e-e3a7-4670-b07f-264bc84a5cb9';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (4, 'e07d4d35-1381-4d4d-914d-8382a7456fdd', 'em_andamento', 'normal', 881, 0, 0, 881, '2025-05-01T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = 'db3d46b1-dfc3-4630-9fa8-e4bcdc54b88f';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'em_andamento', 'normal', 1200, 0, 0, 1200, '2026-05-03T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = '6f580b7c-d703-4769-bcdc-1933c9a6c396';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (4, 'e07d4d35-1381-4d4d-914d-8382a7456fdd', 'em_andamento', 'normal', 1500, 0, 0, 1500, '2026-05-05T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = '917f865a-cd8a-44d1-b9af-5672fec6de2f';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (19, '97f12885-87ad-426a-8bbb-656889d82e10', 'em_andamento', 'normal', 1700, 0, 0, 1700, '2026-05-08T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = '4e946e4d-1aff-462e-8339-a2ed14863d73';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'em_andamento', 'normal', 1600, 0, 0, 1600, '2026-05-09T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = 'c2af1ea2-9b84-4540-8353-3a9aea786ede';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (20, 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 'em_andamento', 'normal', 3950, 0, 0, 3950, '2026-05-09T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = '35132057-9e44-4a7b-836a-71642ad29049';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (20, '25e2da5b-9e76-4388-9890-7e22efd6940d', 'em_andamento', 'normal', 3697, 0, 0, 3697, '2026-05-10T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = '56d7b7b2-bb60-4bfc-9da8-3500768ec931';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (20, 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 'em_andamento', 'normal', 1900, 0, 0, 1900, '2026-05-16T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = '0fbe38c8-eead-443a-8000-e00e9a4ee045';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (1, '9451cd9f-6770-4e32-aae8-c75fa675e818', 'em_andamento', 'normal', 1200, 0, 0, 1200, '2026-05-19T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = '932fa83b-73a4-4259-b491-defdbc3cbf98';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (4, 'e07d4d35-1381-4d4d-914d-8382a7456fdd', 'em_andamento', 'normal', 5250, 0, 0, 5250, '2026-05-01T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = 'fcaed0a5-ef6c-483b-b5a0-dfcbc5fe7d22';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'em_andamento', 'normal', 2350, 0, 0, 2350, '2026-05-03T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = '1b78180e-e316-4008-a186-9d56e35417f5';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'em_andamento', 'normal', 6880, 0, 0, 6880, '2026-05-05T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = 'e41dc2af-b336-4a50-ad1b-bc8d83c966c2';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (19, '97f12885-87ad-426a-8bbb-656889d82e10', 'em_andamento', 'normal', 3250, 0, 0, 3250, '2026-05-08T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = 'b4e77085-ca90-4d83-ba48-620a31dd9c0c';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'em_andamento', 'normal', 2940, 0, 0, 2940, '2026-05-09T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = '251f0cd4-debc-4b84-9f01-abef3bd8ab3e';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (19, '97f12885-87ad-426a-8bbb-656889d82e10', 'em_andamento', 'normal', 1000, 0, 0, 1000, '2026-05-13T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = 'c9e92fe2-c6ed-4719-9abb-d09067b5ae8f';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'em_andamento', 'normal', 2930, 0, 0, 2930, '2026-05-15T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = '34e44882-15ed-485b-97c8-0147a35623f2';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (20, 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 'em_andamento', 'normal', 8000, 0, 0, 8000, '2026-05-17T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = '8e760e27-5d56-44ee-9f1f-7b1c1abd1ea0';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (19, '97f12885-87ad-426a-8bbb-656889d82e10', 'em_andamento', 'normal', 6800, 0, 0, 6800, '2026-05-19T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = '28d6248c-8493-4437-af3e-94159cd78c31';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'em_andamento', 'normal', 8424, 0, 0, 8424, '2026-05-01T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = 'bb1019f3-7e0f-46b0-bd5a-54e06017e754';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'em_andamento', 'normal', 3200, 0, 0, 3200, '2026-05-03T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = '1fbbb643-d5ae-4766-abf6-08c06a9f8af7';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'em_andamento', 'normal', 2320, 0, 0, 2320, '2026-05-06T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = 'e9720dc5-7a48-453b-84e4-e20299a0efb0';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (20, '0dd2c938-c6dd-4f5d-aac5-ed045ee5d2fb', 'em_andamento', 'normal', 2100, 0, 0, 2100, '2026-05-09T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = 'c3a8793d-8d27-4783-99f2-48702a11e30b';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (19, 'b4269e60-eea2-4eba-a34d-db9591e0ec83', 'em_andamento', 'normal', 5430, 0, 0, 5430, '2026-05-10T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = 'b000e410-c72b-449b-a84d-d4db375044c8';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'em_andamento', 'normal', 1911, 0, 0, 1911, '2026-05-14T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = '750efc04-7dba-433b-af63-b92ec88d6a20';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (20, 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 'em_andamento', 'normal', 2050, 0, 0, 2050, '2026-05-16T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = '854b393f-60d7-492e-a3cd-963dc78052b4';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'em_andamento', 'normal', 2939, 0, 0, 2939, '2026-05-19T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = 'f24efb0b-3da1-4858-b889-62cc1863b152';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (1, '9451cd9f-6770-4e32-aae8-c75fa675e818', 'em_andamento', 'normal', 5700, 0, 0, 5700, '2026-05-01T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = 'c4ff4d25-0c6a-4c00-8bc0-feb11794ae75';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'em_andamento', 'normal', 4300, 0, 0, 4300, '2026-05-03T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = '95a4fed7-a1ff-499f-8d5b-01c0b0e2841d';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'em_andamento', 'normal', 2960, 0, 0, 2960, '2026-05-06T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = '34227eba-8e21-44ca-a8a6-e177bc619328';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (20, '25e2da5b-9e76-4388-9890-7e22efd6940d', 'em_andamento', 'normal', 1750, 0, 0, 1750, '2026-05-08T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = 'c9cce3e1-da8b-4527-a955-20062bb06923';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'em_andamento', 'normal', 4150, 0, 0, 4150, '2026-05-09T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = '81b92549-e726-4aad-96dd-10457c57cdf8';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'em_andamento', 'normal', 1200, 0, 0, 1200, '2026-05-12T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = '26d31fb7-bef6-42d3-9028-0c0fa9024c5d';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (4, 'e07d4d35-1381-4d4d-914d-8382a7456fdd', 'em_andamento', 'normal', 8650, 0, 0, 8650, '2026-05-15T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = '1c0a12c2-9200-406c-887c-19569e2a575b';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (20, '25e2da5b-9e76-4388-9890-7e22efd6940d', 'em_andamento', 'normal', 1250, 0, 0, 1250, '2026-05-16T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = '2a72ad34-f91f-46bd-95af-0fdaa52ac972';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'em_andamento', 'normal', 5200, 0, 0, 5200, '2026-05-19T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = 'd6b52368-12f3-4bb1-8afe-d591e8a15e80';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (1, '9451cd9f-6770-4e32-aae8-c75fa675e818', 'em_andamento', 'normal', 5800, 0, 0, 5800, '2026-05-01T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = '036caca3-b6fc-4118-8a1f-480b9e23f4e0';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'em_andamento', 'normal', 2715, 0, 0, 2715, '2026-05-03T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = '9ace1131-15e9-434b-a863-48a75417f048';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (19, 'b4269e60-eea2-4eba-a34d-db9591e0ec83', 'em_andamento', 'normal', 3590, 0, 0, 3590, '2026-05-06T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = '20d0139f-c8b7-4f06-bce0-8684711d3a38';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'em_andamento', 'normal', 8550, 0, 0, 8550, '2026-05-10T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = '33747168-423b-4165-83ae-2f44b8790978';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'em_andamento', 'normal', 4225, 0, 0, 4225, '2026-05-14T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = 'd62b8dd2-6512-4d5d-a43b-f02b1736e13f';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (20, 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 'em_andamento', 'normal', 5700, 0, 0, 5700, '2026-05-16T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = '7b7c1b42-29f4-4a17-8e89-fb0758f262d0';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'em_andamento', 'normal', 1565, 0, 0, 1565, '2026-05-19T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = 'c0ea1465-bcca-411e-aa5b-3ae518236a6a';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (1, '1d12d555-68e9-45f8-bfc0-a35a1d8d7920', 'em_andamento', 'normal', 2850, 0, 0, 2850, '2026-05-20T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = 'fafc250b-49ea-4465-89bb-5d15548806e1';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (1, '9451cd9f-6770-4e32-aae8-c75fa675e818', 'em_andamento', 'normal', 4340, 0, 0, 4340, '2026-05-01T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = '4274e998-9232-43cc-a2f6-7341538dd26a';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (19, 'b4269e60-eea2-4eba-a34d-db9591e0ec83', 'em_andamento', 'normal', 3000, 0, 0, 3000, '2026-05-03T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = 'f2d913ee-40b8-4d81-aa9e-4737dfd7812d';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (19, '97f12885-87ad-426a-8bbb-656889d82e10', 'em_andamento', 'normal', 4150, 0, 0, 4150, '2026-05-06T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = 'e95511ea-a8f6-4659-96c4-c00374fe8e3e';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (20, '25e2da5b-9e76-4388-9890-7e22efd6940d', 'em_andamento', 'normal', 3425, 0, 0, 3425, '2026-05-08T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = 'b8f64507-67e6-4ac5-98b1-0d2b8f79944c';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (20, 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 'em_andamento', 'normal', 2900, 0, 0, 2900, '2026-05-09T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = 'e9494d3f-2a89-433b-90b3-e7c6011c2bee';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'em_andamento', 'normal', 8618, 0, 0, 8618, '2026-05-09T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = 'fe76aa92-6c92-4b41-a68f-e654062c5c62';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (19, '97f12885-87ad-426a-8bbb-656889d82e10', 'em_andamento', 'normal', 720, 0, 0, 720, '2026-05-12T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = '50dd59ac-ed94-4430-b0a9-a2c965ae12da';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (4, 'e07d4d35-1381-4d4d-914d-8382a7456fdd', 'em_andamento', 'normal', 899.99, 0, 0, 899.99, '2026-05-15T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = '3e14a458-b544-4b33-9eec-607eee8442ad';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (20, '25e2da5b-9e76-4388-9890-7e22efd6940d', 'em_andamento', 'normal', 3750, 0, 0, 3750, '2026-05-16T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = 'd44c4d7a-af69-49cb-9b5b-c2e9cc957e1a';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'em_andamento', 'normal', 8300, 0, 0, 8300, '2026-05-19T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = 'f20458c5-b4f9-4d12-98af-5dc8c46b8183';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (1, '9451cd9f-6770-4e32-aae8-c75fa675e818', 'em_andamento', 'normal', 5550, 0, 0, 5550, '2026-05-01T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = 'e88d46de-c37f-40dc-9417-fde21d5f3c7e';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (1, '9451cd9f-6770-4e32-aae8-c75fa675e818', 'em_andamento', 'normal', 9280, 0, 0, 9280, '2026-05-03T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = '7d420c36-9c33-4a2e-858b-131f83fb53b8';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (20, '0dd2c938-c6dd-4f5d-aac5-ed045ee5d2fb', 'em_andamento', 'normal', 5600, 0, 0, 5600, '2026-05-06T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = 'd5a94ef2-7668-408e-8167-ee512813619e';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'em_andamento', 'normal', 8650, 0, 0, 8650, '2026-05-09T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = '3cc0ed24-2c1d-4d29-9a20-efdfc0bb50fb';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (1, '9451cd9f-6770-4e32-aae8-c75fa675e818', 'em_andamento', 'normal', 1000, 0, 0, 1000, '2026-05-13T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = '917b8b80-4409-4e8d-b755-f9ac9008fa87';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (20, 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 'em_andamento', 'normal', 6750, 0, 0, 6750, '2026-05-15T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = '2d5a4e02-79ae-4730-8baa-dbc237a7fc85';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'em_andamento', 'normal', 2300, 0, 0, 2300, '2026-05-17T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = 'e3e56768-90c0-4c1c-b997-553302d6cc76';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (1, '0dd2c938-c6dd-4f5d-aac5-ed045ee5d2fb', 'em_andamento', 'normal', 5400, 0, 0, 5400, '2026-05-19T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = '9b5bf9e1-ef6d-4b64-a5e1-74ac835d1659';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (19, '97f12885-87ad-426a-8bbb-656889d82e10', 'em_andamento', 'normal', 7900, 0, 0, 7900, '2026-05-01T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = '2f5a23b5-8cb2-4d5e-953f-493e0e88cdc3';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (20, '25e2da5b-9e76-4388-9890-7e22efd6940d', 'em_andamento', 'normal', 3521, 0, 0, 3521, '2026-05-03T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = 'db626183-41c7-4dce-99d0-72fd63c1c882';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (20, '0dd2c938-c6dd-4f5d-aac5-ed045ee5d2fb', 'em_andamento', 'normal', 5400, 0, 0, 5400, '2026-05-06T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = '939da5f9-e15f-4f6b-9e80-f0524aabf9a8';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (20, '0dd2c938-c6dd-4f5d-aac5-ed045ee5d2fb', 'em_andamento', 'normal', 4300, 0, 0, 4300, '2026-05-09T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = '84bcddd2-1cc7-470e-9036-e2805aad2bbc';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (19, '97f12885-87ad-426a-8bbb-656889d82e10', 'em_andamento', 'normal', 6900, 0, 0, 6900, '2026-05-13T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = '104c5fe5-cf2f-464a-8c02-a7a8f065e2e3';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (20, 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 'em_andamento', 'normal', 8500, 0, 0, 8500, '2026-05-15T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = '5e6aef23-e932-43a4-b546-ca382fd10c3c';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'em_andamento', 'normal', 3000, 0, 0, 3000, '2026-05-16T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = 'e8b7ee2c-7221-4d7f-b505-060790ce888d';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'em_andamento', 'normal', 2297, 0, 0, 2297, '2026-05-19T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = 'c67534a0-c70c-45da-beec-1d81aa411cae';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (20, '25e2da5b-9e76-4388-9890-7e22efd6940d', 'em_andamento', 'normal', 3500, 0, 0, 3500, '2026-05-01T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = '14d57256-7bf1-4ae8-91a7-1fc30299a58e';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (20, '25e2da5b-9e76-4388-9890-7e22efd6940d', 'em_andamento', 'normal', 2200, 0, 0, 2200, '2026-05-03T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = 'e430f169-7400-49e2-8b2f-74b946c162f3';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (20, '25e2da5b-9e76-4388-9890-7e22efd6940d', 'em_andamento', 'normal', 3800, 0, 0, 3800, '2026-05-06T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = '0ae46425-2658-4295-9401-6336a126f64a';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (4, 'e07d4d35-1381-4d4d-914d-8382a7456fdd', 'em_andamento', 'normal', 1302, 0, 0, 1302, '2026-05-09T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = 'e13e8530-0457-4cb3-91e1-e8c17df0f035';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'em_andamento', 'normal', 3706, 0, 0, 3706, '2026-05-13T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = '2dfffb45-1ab3-4a01-aef8-549941092470';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'em_andamento', 'normal', 7700, 0, 0, 7700, '2026-05-15T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = '95c7797c-dddb-40ad-96ba-505db2c0bf0c';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (19, '97f12885-87ad-426a-8bbb-656889d82e10', 'em_andamento', 'normal', 3250, 0, 0, 3250, '2026-05-17T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = '4b409984-9e6f-4fb4-b5c4-569db55832ef';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'em_andamento', 'normal', 2375, 0, 0, 2375, '2026-05-19T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = '0fea8c55-6c92-4993-90e8-2e162ff76c1d';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'em_andamento', 'normal', 2600, 0, 0, 2600, '2026-05-01T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = '4b2b5222-adcb-422b-b257-c2f58dd26649';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (19, '97f12885-87ad-426a-8bbb-656889d82e10', 'em_andamento', 'normal', 3550, 0, 0, 3550, '2026-05-03T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = 'fad8c277-1f26-4dfb-b921-dd7c092afc3b';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (20, '25e2da5b-9e76-4388-9890-7e22efd6940d', 'em_andamento', 'normal', 8400, 0, 0, 8400, '2026-05-06T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = 'e2e4f041-4b6c-46f3-9a92-1b249c28cc7b';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (20, '25e2da5b-9e76-4388-9890-7e22efd6940d', 'em_andamento', 'normal', 4550, 0, 0, 4550, '2026-05-09T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = '1eee4c2f-1460-4590-b73b-3787df8f8734';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (19, '97f12885-87ad-426a-8bbb-656889d82e10', 'em_andamento', 'normal', 1950, 0, 0, 1950, '2026-05-13T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = 'f81f9f5e-4d57-48c7-98d7-6a583faaa702';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (20, 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 'em_andamento', 'normal', 8500, 0, 0, 8500, '2026-05-15T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = 'b6469e03-82f1-443a-bd6e-deb1543c859e';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (19, 'b4269e60-eea2-4eba-a34d-db9591e0ec83', 'em_andamento', 'normal', 4950, 0, 0, 4950, '2026-05-17T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = '392af009-3915-434d-b964-4482c22aaa83';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (1, '0dd2c938-c6dd-4f5d-aac5-ed045ee5d2fb', 'em_andamento', 'normal', 11000, 0, 0, 11000, '2026-05-19T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = '29fd7e9a-bd8e-4892-aada-87bdce847f23';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'em_andamento', 'normal', 3460, 0, 0, 3460, '2026-05-01T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = 'd99e8b02-15ef-40fe-8e67-77b75be3060e';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (19, '97f12885-87ad-426a-8bbb-656889d82e10', 'em_andamento', 'normal', 2582, 0, 0, 2582, '2026-05-03T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = '52a20469-840e-4673-9428-fd3da2a31f06';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (20, 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 'em_andamento', 'normal', 8400, 0, 0, 8400, '2026-05-06T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = '66850360-1d7a-454f-b45a-f540e1044836';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (19, '97f12885-87ad-426a-8bbb-656889d82e10', 'em_andamento', 'normal', 7600, 0, 0, 7600, '2026-05-09T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = 'a61a4008-1a83-4962-893b-a99316c7c473';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'em_andamento', 'normal', 8650, 0, 0, 8650, '2026-05-09T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = '300252c8-fe7f-44c9-9429-c0b6dc405f5b';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (4, 'e07d4d35-1381-4d4d-914d-8382a7456fdd', 'em_andamento', 'normal', 5270, 0, 0, 5270, '2026-05-13T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = 'd7c041a1-f749-4c9e-afbe-d7a31dfdfab8';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (20, 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 'em_andamento', 'normal', 6750, 0, 0, 6750, '2026-05-15T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = '11cdb861-e689-4bfa-bf3d-540b39d6fcdf';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'em_andamento', 'normal', 5240, 0, 0, 5240, '2026-05-17T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = 'f98a5d87-67b6-4a94-b8e9-215bf2f85c6e';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'em_andamento', 'normal', 4395, 0, 0, 4395, '2026-05-19T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = 'a2834448-4ea5-44a6-b156-ea46e55b56e6';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'em_andamento', 'normal', 5915, 0, 0, 5915, '2026-05-01T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = '7698c3cc-d191-4ed3-94c3-2933bc5c518a';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'em_andamento', 'normal', 2190, 0, 0, 2190, '2026-05-03T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = 'd3562ca8-cb01-47c6-82c5-730588613a43';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (20, 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 'em_andamento', 'normal', 3000, 0, 0, 3000, '2026-05-06T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = 'e783cb7c-f71b-44ed-9181-4d186ba048d9';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (19, '85743f3e-1b32-49c0-9d9e-c16afd690f7d', 'em_andamento', 'normal', 4000, 0, 0, 4000, '2026-05-09T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = 'aa7b8cf5-9f4a-407b-b5c9-7885d50cf031';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'em_andamento', 'normal', 4612, 0, 0, 4612, '2026-05-10T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = 'acbe89cd-9ce9-4112-83a5-b0303aa3e3e3';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (19, '97f12885-87ad-426a-8bbb-656889d82e10', 'em_andamento', 'normal', 3350, 0, 0, 3350, '2026-05-16T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = 'bedc72b1-4828-4dbd-8ba4-c1caca289fb1';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'em_andamento', 'normal', 4800, 0, 0, 4800, '2026-05-17T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = '4e64f674-ef84-439e-8e8f-a31454e0a366';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'em_andamento', 'normal', 8400, 0, 0, 8400, '2026-05-20T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = 'e133f24a-a9f2-4f10-9646-3515baebb0d9';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'em_andamento', 'normal', 5525, 0, 0, 5525, '2026-05-01T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = '77575961-6de8-44ee-ae8c-c3570fc4fa14';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'em_andamento', 'normal', 3287, 0, 0, 3287, '2026-05-03T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = 'f5c06b30-a509-44f0-ac66-222665ec70a0';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (19, '97f12885-87ad-426a-8bbb-656889d82e10', 'em_andamento', 'normal', 8390, 0, 0, 8390, '2026-05-07T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = 'd0b5909c-c8b0-467e-afdf-709c950c7ddf';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (20, '25e2da5b-9e76-4388-9890-7e22efd6940d', 'em_andamento', 'normal', 4990, 0, 0, 4990, '2026-05-09T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = '5a1dd0a1-c94e-455b-b7cb-1c6ef6fd855d';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (20, 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 'em_andamento', 'normal', 2250, 0, 0, 2250, '2026-05-13T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = 'a7f710d4-9ddb-414f-a030-b6572ee0f999';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'em_andamento', 'normal', 2500, 0, 0, 2500, '2026-05-15T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = '4eadabb3-a749-4b16-b2ed-c84c5a8d4ed0';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (19, '97f12885-87ad-426a-8bbb-656889d82e10', 'em_andamento', 'normal', 4950, 0, 0, 4950, '2026-05-17T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = '3681ea28-566f-43a2-aa53-3f868919adca';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (19, '97f12885-87ad-426a-8bbb-656889d82e10', 'em_andamento', 'normal', 2850, 0, 0, 2850, '2026-05-19T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = '639c339a-a50b-4801-8c53-46bf82e20445';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'em_andamento', 'normal', 5525, 0, 0, 5525, '2026-05-01T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = '4fc892dd-02b8-47a3-bc46-e1666ebc36cb';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (1, '9451cd9f-6770-4e32-aae8-c75fa675e818', 'em_andamento', 'normal', 5530, 0, 0, 5530, '2026-05-05T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = 'f7188c0a-a15e-4b67-8955-b668938f73ee';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'em_andamento', 'normal', 0, 0, 0, 0, '2026-05-07T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = 'dd0857b8-b5b3-41ff-98de-22b937b811e4';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (19, '97f12885-87ad-426a-8bbb-656889d82e10', 'em_andamento', 'normal', 4150, 0, 0, 4150, '2026-05-09T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = '1c15436f-7210-4c8a-8bc6-ebc6528a383a';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (1, '9451cd9f-6770-4e32-aae8-c75fa675e818', 'em_andamento', 'normal', 4900, 0, 0, 4900, '2026-05-10T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = 'fba694e3-403d-407b-9300-a70cd4673134';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (20, '25e2da5b-9e76-4388-9890-7e22efd6940d', 'em_andamento', 'normal', 2409, 0, 0, 2409, '2026-05-13T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = 'c7e7b235-2ae9-4f9b-ad32-a3915fe48af3';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'em_andamento', 'normal', 2200, 0, 0, 2200, '2026-05-15T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = '5d293a46-7d82-441e-a274-4c686bc0fd9d';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (19, '97f12885-87ad-426a-8bbb-656889d82e10', 'em_andamento', 'normal', 4200, 0, 0, 4200, '2026-05-17T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = '57609188-1348-483a-b997-ae8ea1e0496c';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (19, '97f12885-87ad-426a-8bbb-656889d82e10', 'em_andamento', 'normal', 3200, 0, 0, 3200, '2026-05-19T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = '8ff4d2a4-5f5b-4044-9151-7bb0e1e15984';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'em_andamento', 'normal', 4100, 0, 0, 4100, '2026-05-01T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = '48f29a6f-3c26-4b2c-8c61-7998c6506b10';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (1, '9451cd9f-6770-4e32-aae8-c75fa675e818', 'em_andamento', 'normal', 2450, 0, 0, 2450, '2026-05-05T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = '0e54fce3-c644-4bec-b40e-eb04369b75d0';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'em_andamento', 'normal', 2890, 0, 0, 2890, '2026-05-07T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = '56070c84-b4fe-4268-a507-2cfccd94df6c';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (20, '0dd2c938-c6dd-4f5d-aac5-ed045ee5d2fb', 'em_andamento', 'normal', 9900, 0, 0, 9900, '2026-05-08T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = '0d1c841f-6377-42d4-b96e-751a301079b5';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'em_andamento', 'normal', 5248, 0, 0, 5248, '2026-05-10T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = '8b488e61-2e66-4b96-9820-50c14342bc44';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'em_andamento', 'normal', 10242, 0, 0, 10242, '2026-05-13T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = '7d9d7b02-008d-4525-b708-c80d398bdfb1';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'em_andamento', 'normal', 2500, 0, 0, 2500, '2026-05-15T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = '1928dc11-eb09-4d64-81d8-afac90344286';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (19, '97f12885-87ad-426a-8bbb-656889d82e10', 'em_andamento', 'normal', 2150, 0, 0, 2150, '2026-05-17T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = 'acbc945d-e82b-4b29-8a17-e330e0563e61';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (20, '25e2da5b-9e76-4388-9890-7e22efd6940d', 'em_andamento', 'normal', 3250, 0, 0, 3250, '2026-05-19T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = 'e8917524-44dd-4d3c-a3fb-95f990f89a68';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'em_andamento', 'normal', 6260, 0, 0, 6260, '2026-05-01T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = '3122086f-1e33-4e5e-9c37-d9fcf4c33ad4';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (19, '97f12885-87ad-426a-8bbb-656889d82e10', 'em_andamento', 'normal', 5200, 0, 0, 5200, '2026-05-05T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = '2da39262-854b-437c-a76e-9d566dee9ba0';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (19, '97f12885-87ad-426a-8bbb-656889d82e10', 'em_andamento', 'normal', 1420, 0, 0, 1420, '2026-05-07T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = '85a3e9fe-98ff-4763-8709-135e4993c836';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (20, '0dd2c938-c6dd-4f5d-aac5-ed045ee5d2fb', 'em_andamento', 'normal', 750, 0, 0, 750, '2026-05-08T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = '4bfed137-0ae9-4757-8d6d-f405aac3bd68';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (1, '9451cd9f-6770-4e32-aae8-c75fa675e818', 'em_andamento', 'normal', 5000, 0, 0, 5000, '2026-05-09T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = '2b586f14-2fa4-4b10-b480-10e4c493256a';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (1, '9451cd9f-6770-4e32-aae8-c75fa675e818', 'em_andamento', 'normal', 8700, 0, 0, 8700, '2026-05-10T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = '2cea11ad-8fe0-4773-8e9c-559aae13e0e9';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'em_andamento', 'normal', 2500, 0, 0, 2500, '2026-05-14T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = '4d1ad1d2-a353-4783-8977-02e0bf163dd4';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (19, '97f12885-87ad-426a-8bbb-656889d82e10', 'em_andamento', 'normal', 5085, 0, 0, 5085, '2026-05-15T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = '94f35456-2a99-448d-92a2-74e6e11635e0';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (19, '97f12885-87ad-426a-8bbb-656889d82e10', 'em_andamento', 'normal', 7600, 0, 0, 7600, '2026-05-17T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = '6581bd3e-3de8-4f04-a8d2-73dc686f8075';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (20, '25e2da5b-9e76-4388-9890-7e22efd6940d', 'em_andamento', 'normal', 2490, 0, 0, 2490, '2026-05-19T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = 'a4dd9882-3113-4ae3-a249-231509ef3c91';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'em_andamento', 'normal', 2450, 0, 0, 2450, '2026-05-02T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = '020628ba-a558-45ed-8e7c-41759c96ca02';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (19, '97f12885-87ad-426a-8bbb-656889d82e10', 'em_andamento', 'normal', 8500, 0, 0, 8500, '2026-05-05T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = '43296d23-2f27-4bc6-9b9f-25e75b042576';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'em_andamento', 'normal', 341, 0, 0, 341, '2026-05-07T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = '6b92e12c-a113-4418-87a0-11d2fb951ea2';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (20, 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 'em_andamento', 'normal', 5500, 0, 0, 5500, '2026-05-10T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = '10c585f4-7aa7-4531-b7a9-9094afc975ac';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (19, '97f12885-87ad-426a-8bbb-656889d82e10', 'em_andamento', 'normal', 1050, 0, 0, 1050, '2026-05-14T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = '891ff3ff-9bf9-482e-ac65-a7e63a624360';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'em_andamento', 'normal', 2075, 0, 0, 2075, '2026-05-15T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = '21d4a5cd-3635-4349-8a95-ff39ae177eb8';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (19, '97f12885-87ad-426a-8bbb-656889d82e10', 'em_andamento', 'normal', 6800, 0, 0, 6800, '2026-05-17T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = '9eff276a-9b4e-4463-bf5b-e9855f2833b4';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (20, '25e2da5b-9e76-4388-9890-7e22efd6940d', 'em_andamento', 'normal', 780, 0, 0, 780, '2026-05-19T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = 'def48230-0699-4667-80a0-19a3ff8055bf';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (19, '97f12885-87ad-426a-8bbb-656889d82e10', 'em_andamento', 'normal', 2199, 0, 0, 2199, '2026-05-02T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = '0bd36530-5ed0-4401-b5b5-7c202c366c46';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'em_andamento', 'normal', 8780, 0, 0, 8780, '2026-05-07T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = '71e22ef0-c34d-4d31-bcba-af0ad41ea10f';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (1, '9451cd9f-6770-4e32-aae8-c75fa675e818', 'em_andamento', 'normal', 3650, 0, 0, 3650, '2026-05-09T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = 'fad6a8c2-d7d5-4528-af01-40c95ff34dc4';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'em_andamento', 'normal', 3400, 0, 0, 3400, '2026-05-10T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = '37608f41-f3d8-4bb9-905d-086dfe3cf221';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'em_andamento', 'normal', 3600, 0, 0, 3600, '2026-05-14T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = '312c500f-933b-4155-a886-32d60cf12a15';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (19, '97f12885-87ad-426a-8bbb-656889d82e10', 'em_andamento', 'normal', 4100, 0, 0, 4100, '2026-05-15T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = '2cf7c9f6-9051-4610-9009-6281b6af0d44';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (19, '97f12885-87ad-426a-8bbb-656889d82e10', 'em_andamento', 'normal', 5130, 0, 0, 5130, '2026-05-17T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = '7e3e787e-8334-40d4-90ed-cc1c19cc96c2';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (19, '97f12885-87ad-426a-8bbb-656889d82e10', 'em_andamento', 'normal', 5300, 0, 0, 5300, '2026-05-02T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = '3038e9ce-7dbb-4908-a1b5-37b05c6d8376';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (19, '97f12885-87ad-426a-8bbb-656889d82e10', 'em_andamento', 'normal', 1950, 0, 0, 1950, '2026-05-05T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = 'a477e383-0c82-42f6-a491-17a49f125fa5';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'em_andamento', 'normal', 3230, 0, 0, 3230, '2026-05-07T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = '5c8711c1-95f2-4d4c-8e6b-a73d7dc757f4';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (20, 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 'em_andamento', 'normal', 8600, 0, 0, 8600, '2026-05-10T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = '3da967ae-ef99-4423-ba0d-b58e435f3f61';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (19, '97f12885-87ad-426a-8bbb-656889d82e10', 'em_andamento', 'normal', 1350, 0, 0, 1350, '2026-05-14T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = 'afc3cc56-ea15-4198-8088-e7dd60884218';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'em_andamento', 'normal', 2075, 0, 0, 2075, '2026-05-15T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = '9285c402-766b-4642-95b9-6523d56b1c20';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (20, '25e2da5b-9e76-4388-9890-7e22efd6940d', 'em_andamento', 'normal', 2800, 0, 0, 2800, '2026-05-17T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = '587aba78-dde8-43cf-81ff-fda69b9424e4';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (20, '25e2da5b-9e76-4388-9890-7e22efd6940d', 'em_andamento', 'normal', 775, 0, 0, 775, '2026-05-19T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = 'c8e402ef-3ad6-4f8e-85a7-baaaa8c5e773';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (19, '97f12885-87ad-426a-8bbb-656889d82e10', 'em_andamento', 'normal', 4750, 0, 0, 4750, '2026-05-02T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = '7edc6347-79e2-4db6-9975-7d62e312f54a';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (19, '97f12885-87ad-426a-8bbb-656889d82e10', 'em_andamento', 'normal', 1340, 0, 0, 1340, '2026-05-05T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = '8d7bd943-7d3f-4cf9-9913-2af27a27f9b2';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'em_andamento', 'normal', 9950, 0, 0, 9950, '2026-05-07T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = '3966f8ef-cea8-4e73-aa5a-7ef022e26389';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (20, 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 'em_andamento', 'normal', 4150, 0, 0, 4150, '2026-05-10T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = 'ebe60dfd-fc75-4177-b6e1-5baf7c8cd6a0';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (20, 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 'em_andamento', 'normal', 5300, 0, 0, 5300, '2026-05-14T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = '8e404c13-fbe7-4525-a027-4bd2abbd6eb9';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (4, 'e07d4d35-1381-4d4d-914d-8382a7456fdd', 'em_andamento', 'normal', 2000, 0, 0, 2000, '2026-05-16T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = 'ffe953a2-998c-4d7b-b1ff-c59192e2a3d8';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'em_andamento', 'normal', 2210, 0, 0, 2210, '2026-05-17T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = '07a11de1-f7e8-46a5-b29d-ca7b0814d912';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'em_andamento', 'normal', 12719, 0, 0, 12719, '2026-05-19T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = 'dbc54e8b-c9f0-4567-836f-79561e4278a0';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (20, 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 'em_andamento', 'normal', 5600, 0, 0, 5600, '2026-05-02T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = '89a7cc4d-1eac-4b76-bf2c-3deace99c74f';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (19, '97f12885-87ad-426a-8bbb-656889d82e10', 'em_andamento', 'normal', 2025, 0, 0, 2025, '2026-05-05T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = '8f38f69b-cb8c-4de8-a96e-b42c857b96fb';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'em_andamento', 'normal', 7850, 0, 0, 7850, '2026-05-07T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = '67253e4e-19fb-4ea2-9791-ac5aa077a2dd';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'em_andamento', 'normal', 2680, 0, 0, 2680, '2026-05-09T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = '1ca65f14-0f00-4852-b505-9dd78db5bd7d';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (1, '9451cd9f-6770-4e32-aae8-c75fa675e818', 'em_andamento', 'normal', 2953, 0, 0, 2953, '2026-05-09T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = '3388a292-caea-4a52-bdee-5924fe0422ae';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (20, 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 'em_andamento', 'normal', 8500, 0, 0, 8500, '2026-05-10T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = '5017189f-d6bd-449f-b914-22ebe3d31740';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'em_andamento', 'normal', 3070, 0, 0, 3070, '2026-05-15T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = 'b20516ef-004c-4b58-8b93-008484a1c829';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'em_andamento', 'normal', 2500, 0, 0, 2500, '2026-05-17T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = '5cfa1a42-acaf-4943-b118-ec3e6e393e6e';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (19, '85743f3e-1b32-49c0-9d9e-c16afd690f7d', 'em_andamento', 'normal', 2200, 0, 0, 2200, '2026-05-19T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = '97ee94cd-45b4-49cf-9dde-3bc16307cda1';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'em_andamento', 'normal', 4200, 0, 0, 4200, '2026-05-02T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = '778bf885-349a-43b9-9aae-f07a2e610a77';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (19, '97f12885-87ad-426a-8bbb-656889d82e10', 'em_andamento', 'normal', 2025, 0, 0, 2025, '2026-05-05T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = '2c8caab1-7e6a-4191-8edf-e62311afff07';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (19, '97f12885-87ad-426a-8bbb-656889d82e10', 'em_andamento', 'normal', 2400, 0, 0, 2400, '2026-05-08T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = '613465b0-dfaa-4736-8053-174a35151fd2';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (20, 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 'em_andamento', 'normal', 2350, 0, 0, 2350, '2026-05-09T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = 'c37de0c6-96ff-4c79-9b1c-63d6396b0af3';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'em_andamento', 'normal', 4750, 0, 0, 4750, '2026-05-10T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = 'f8a68a52-698e-4579-902a-bc2f422560f5';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (4, 'e07d4d35-1381-4d4d-914d-8382a7456fdd', 'em_andamento', 'normal', 8300, 0, 0, 8300, '2026-05-16T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = '23912245-c21c-4d63-b218-37a9254b8b94';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'em_andamento', 'normal', 2650, 0, 0, 2650, '2026-05-17T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = '757637ab-fb2a-4f9b-9222-7dad9d41d9bc';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'em_andamento', 'normal', 2350, 0, 0, 2350, '2026-05-20T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = 'e1f2befd-c61e-471c-8478-71a151048238';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'em_andamento', 'normal', 8899, 0, 0, 8899, '2026-05-02T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = '4bb4c5e0-1b7e-4d5d-9fa2-3d3fedcec4c9';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'em_andamento', 'normal', 2593, 0, 0, 2593, '2026-05-05T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = '56fc1288-5212-43da-8e85-34f516d0cbe7';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'em_andamento', 'normal', 8480, 0, 0, 8480, '2026-05-08T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = 'f3da37c7-6317-4d65-9ded-48f6f5cc3f98';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'em_andamento', 'normal', 5000, 0, 0, 5000, '2026-05-10T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = '9756680c-b0b9-424c-a558-ec7a88330389';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (20, 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 'em_andamento', 'normal', 2910, 0, 0, 2910, '2026-05-14T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = '24bce24d-3c3b-4bdf-a4f0-e13e3f945b50';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (19, 'b4269e60-eea2-4eba-a34d-db9591e0ec83', 'em_andamento', 'normal', 5300, 0, 0, 5300, '2026-05-16T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = 'bbff921c-da28-4a8d-9b0f-79f615b344b4';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'em_andamento', 'normal', 1702, 0, 0, 1702, '2026-05-17T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = '408c3329-4976-44f5-98e5-95189e93143c';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (1, '9451cd9f-6770-4e32-aae8-c75fa675e818', 'em_andamento', 'normal', 2350, 0, 0, 2350, '2026-05-20T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = '3bedeb6e-5545-48a1-bac5-d8e41ec921ee';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (19, '97f12885-87ad-426a-8bbb-656889d82e10', 'em_andamento', 'normal', 800, 0, 0, 800, '2026-05-03T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = '66da87c9-ab12-477b-8851-28fbd4b2c78f';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'em_andamento', 'normal', 2750, 0, 0, 2750, '2026-05-05T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = 'aa0c051f-6153-43cc-a0fb-a3a2655e77ae';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (4, 'a3626643-4749-4e56-83bc-b4a8ffd53659', 'em_andamento', 'normal', 1924, 0, 0, 1924, '2026-05-08T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = '3599cbdd-3449-4236-91d0-b6356f020eda';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (1, '9451cd9f-6770-4e32-aae8-c75fa675e818', 'em_andamento', 'normal', 2650, 0, 0, 2650, '2026-05-09T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = '1dee2311-fad0-4e30-a42b-4a42d8e12ab1';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'em_andamento', 'normal', 3350, 0, 0, 3350, '2026-05-10T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = '3b33e763-8d51-4c0c-8acf-13582f810853';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (1, '85e3aa42-b9af-49b8-a72a-64e9c337aa53', 'em_andamento', 'normal', 3250, 0, 0, 3250, '2026-05-14T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = 'ec89c7d5-3ee9-4629-b737-a17e8d9254e5';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (19, '97f12885-87ad-426a-8bbb-656889d82e10', 'em_andamento', 'normal', 3721, 0, 0, 3721, '2026-05-16T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = 'bb2cdcc0-2da1-490a-bee0-ee7e250ee853';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (19, '85743f3e-1b32-49c0-9d9e-c16afd690f7d', 'em_andamento', 'normal', 1450, 0, 0, 1450, '2026-05-17T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = '63e43b11-aa14-4492-adac-d5626cfdf153';
WITH v AS (
  INSERT INTO vendas (loja_id, vendedor_id, status, tipo, valor_total, valor_pago, valor_desconto, saldo_devedor, criado_em)
  VALUES (20, 'a50f1e24-aabb-41c1-b817-b4a4950bb1e4', 'em_andamento', 'normal', 1500, 0, 0, 1500, '2026-05-20T00:00:00+00:00')
  RETURNING id
)
UPDATE aparelhos SET venda_id = (SELECT id FROM v), status = 'vendido' WHERE id = '9138b793-01bb-4aa7-9783-ca907657856f';


COMMIT;
