-- CONVERTER numero_venda de VARCHAR para INTEGER

-- Passo 1: Dropar views que dependem da coluna
DROP VIEW IF EXISTS vw_vendas_resumo CASCADE;

-- Passo 2: Criar uma coluna temporária
ALTER TABLE vendas ADD COLUMN numero_venda_temp INTEGER;

-- Passo 3: Copiar valores convertidos (remove "V" e converte para integer)
UPDATE vendas 
SET numero_venda_temp = CASE 
  WHEN numero_venda ~ '^V\d+$' THEN 
    CAST(SUBSTRING(numero_venda FROM 2) AS INTEGER)
  WHEN numero_venda ~ '^\d+$' THEN 
    CAST(numero_venda AS INTEGER)
  ELSE 
    NULL
END;

-- Passo 4: Remover coluna antiga
ALTER TABLE vendas DROP COLUMN numero_venda;

-- Passo 5: Renomear coluna temporária
ALTER TABLE vendas RENAME COLUMN numero_venda_temp TO numero_venda;

-- Passo 6: Recriar a view (se necessário, ajuste conforme sua estrutura)
CREATE OR REPLACE VIEW vw_vendas_resumo AS
SELECT 
  v.id,
  v.numero_venda,
  v.cliente_id,
  c.nome as cliente_nome,
  v.loja_id,
  l.nome as loja_nome,
  v.vendedor_id,
  v.status,
  v.tipo,
  v.valor_total,
  v.valor_pago,
  v.valor_desconto,
  v.saldo_devedor,
  v.criado_em,
  v.finalizado_em
FROM vendas v
LEFT JOIN clientes c ON c.id = v.cliente_id
LEFT JOIN lojas l ON l.id = v.loja_id;

-- Passo 5: Adicionar NOT NULL se desejar (após garantir que todos têm valor)
-- ALTER TABLE vendas ALTER COLUMN numero_venda SET NOT NULL;

-- Verificar resultado
SELECT id, numero_venda, status, criado_em 
FROM vendas 
ORDER BY numero_venda DESC 
LIMIT 10;
