-- Verificar a estrutura da tabela produtos
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'produtos' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Ver alguns produtos de exemplo
SELECT 
    id,
    descricao,
    codigo_fabricante,
    marca,
    categoria,
    grupo
FROM produtos
LIMIT 5;
