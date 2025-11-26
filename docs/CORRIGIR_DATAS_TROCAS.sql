-- Script para corrigir datas das trocas de produtos
-- Data: 25/11/2025
-- Motivo: Trocas antigas estão sem data (NULL) causando "Invalid Date"

-- 1. Verificar trocas sem data
SELECT id, venda_id, produto_antigo_nome, produto_novo_nome, criado_em
FROM trocas_produtos
WHERE criado_em IS NULL
ORDER BY venda_id;

-- 2. Atualizar trocas sem data usando a data de criação da venda como referência
UPDATE trocas_produtos t
SET criado_em = v.criado_em
FROM vendas v
WHERE t.venda_id = v.id
AND t.criado_em IS NULL;

-- 3. Se ainda houver trocas sem data (venda também sem data), usar data atual
UPDATE trocas_produtos
SET criado_em = NOW()
WHERE criado_em IS NULL;

-- 4. Verificar resultado
SELECT id, venda_id, produto_antigo_nome, produto_novo_nome, criado_em
FROM trocas_produtos
ORDER BY criado_em DESC
LIMIT 10;

-- Comentário
COMMENT ON COLUMN trocas_produtos.criado_em IS 'Data e hora da troca - não pode ser NULL';
