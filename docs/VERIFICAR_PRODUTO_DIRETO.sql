-- =====================================================
-- SELECT DIRETO: Verificar produto e estoque
-- =====================================================

-- 1. Ver produto completo com estoque em todas as lojas
SELECT 
  p.id,
  p.descricao,
  p.codigo_fabricante,
  p.preco_venda,
  p.categoria,
  p.ativo,
  el.id_loja,
  l.nome as loja,
  el.quantidade as estoque_atual
FROM produtos p
LEFT JOIN estoque_lojas el ON el.id_produto = p.id
LEFT JOIN lojas l ON l.id = el.id_loja
WHERE p.id = 'cebb1ad4-765c-4882-857d-c7a225785e72'
ORDER BY el.id_loja;

-- 2. Verificar se o produto aparece na query do modal (simulação exata)
SELECT 
  el.id_produto,
  el.quantidade,
  p.id,
  p.descricao,
  p.codigo_fabricante,
  p.preco_venda,
  p.categoria,
  p.ativo
FROM estoque_lojas el
JOIN produtos p ON p.id = el.id_produto
WHERE el.id_loja = 3
  AND el.id_produto = 'cebb1ad4-765c-4882-857d-c7a225785e72';

-- 3. Ver TODOS os produtos da loja ATACADO (id=3) ordenados por descrição
SELECT 
  el.id_produto,
  el.quantidade,
  p.descricao,
  p.codigo_fabricante,
  p.preco_venda
FROM estoque_lojas el
JOIN produtos p ON p.id = el.id_produto
WHERE el.id_loja = 3
ORDER BY p.descricao
LIMIT 50;

-- 4. Contar total de produtos com estoque na loja 3
SELECT COUNT(*) as total_produtos
FROM estoque_lojas el
WHERE el.id_loja = 3;

-- 5. Ver se existe problema de RLS
SELECT 
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('produtos', 'estoque_lojas');
