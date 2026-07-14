-- Move vendas de aparelho da Marcela que estao erradas na CELL (loja 1)
-- Regra: Marcela so pode ter vendas em ONLINE (21) ou CASES (19)
--   ONLINE (21): 11297(sem loja, decisao user), 11552,11553,11557,11558,11639 (eram ONLINE na planilha)
--   CASES  (19): 11434,11442,11613 (eram BALCAO na planilha)
-- Atualiza vendas + aparelhos + brindes_aparelhos. Filtro por vendedor+loja=1+numero p/ nao pegar colisao.
BEGIN;

\set marcela '''a3626643-4749-4e56-83bc-b4a8ffd53659'''

-- ===== GRUPO ONLINE (21) =====
UPDATE aparelhos a SET loja_id=21 FROM vendas v
  WHERE a.venda_id=v.id AND v.vendedor_id=:marcela::uuid AND v.loja_id=1
    AND v.numero_venda IN (11297,11552,11553,11557,11558,11639);
UPDATE brindes_aparelhos b SET loja_id=21 FROM vendas v
  WHERE b.venda_id=v.id AND v.vendedor_id=:marcela::uuid AND v.loja_id=1
    AND v.numero_venda IN (11297,11552,11553,11557,11558,11639);
UPDATE vendas SET loja_id=21
  WHERE vendedor_id=:marcela::uuid AND loja_id=1
    AND numero_venda IN (11297,11552,11553,11557,11558,11639);

-- ===== GRUPO CASES (19) =====
UPDATE aparelhos a SET loja_id=19 FROM vendas v
  WHERE a.venda_id=v.id AND v.vendedor_id=:marcela::uuid AND v.loja_id=1
    AND v.numero_venda IN (11434,11442,11613);
UPDATE brindes_aparelhos b SET loja_id=19 FROM vendas v
  WHERE b.venda_id=v.id AND v.vendedor_id=:marcela::uuid AND v.loja_id=1
    AND v.numero_venda IN (11434,11442,11613);
UPDATE vendas SET loja_id=19
  WHERE vendedor_id=:marcela::uuid AND loja_id=1
    AND numero_venda IN (11434,11442,11613);

-- ===== VERIFICACAO (deve sobrar 0 na CELL) =====
SELECT 'Marcela ainda na CELL' AS check, count(*) AS qtd
FROM vendas WHERE vendedor_id=:marcela::uuid AND loja_id=1;
SELECT v.loja_id, l.nome, count(*) AS vendas
FROM vendas v JOIN lojas l ON l.id=v.loja_id
WHERE v.vendedor_id=:marcela::uuid AND v.numero_venda IN (11297,11552,11553,11557,11558,11639,11434,11442,11613)
GROUP BY 1,2 ORDER BY 1;

COMMIT;
