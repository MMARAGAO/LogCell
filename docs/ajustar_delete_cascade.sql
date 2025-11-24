-- ============================================
-- AJUSTAR FOREIGN KEYS PARA PERMITIR DELETE CASCADE
-- ============================================
-- Este script ajusta as constraints para que ao deletar
-- um produto, todos os registros relacionados sejam
-- deletados automaticamente (CASCADE)
-- ============================================

-- 1. Ver todas as constraints que referenciam produtos
SELECT
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    rc.delete_rule
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
JOIN information_schema.referential_constraints AS rc
    ON rc.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
AND ccu.table_name = 'produtos'
ORDER BY tc.table_name;

-- 2. RECRIAR as constraints com DELETE CASCADE

-- estoque_lojas
ALTER TABLE public.estoque_lojas
DROP CONSTRAINT IF EXISTS estoque_lojas_id_produto_fkey;

ALTER TABLE public.estoque_lojas
ADD CONSTRAINT estoque_lojas_id_produto_fkey
FOREIGN KEY (id_produto) REFERENCES public.produtos(id)
ON DELETE CASCADE;

-- fotos_produtos
ALTER TABLE public.fotos_produtos
DROP CONSTRAINT IF EXISTS fotos_produtos_produto_id_fkey;

ALTER TABLE public.fotos_produtos
ADD CONSTRAINT fotos_produtos_produto_id_fkey
FOREIGN KEY (produto_id) REFERENCES public.produtos(id)
ON DELETE CASCADE;

-- historico_produtos
ALTER TABLE public.historico_produtos
DROP CONSTRAINT IF EXISTS historico_produtos_produto_id_fkey;

ALTER TABLE public.historico_produtos
ADD CONSTRAINT historico_produtos_produto_id_fkey
FOREIGN KEY (produto_id) REFERENCES public.produtos(id)
ON DELETE CASCADE;

-- historico_estoque
ALTER TABLE public.historico_estoque
DROP CONSTRAINT IF EXISTS historico_estoque_id_produto_fkey;

ALTER TABLE public.historico_estoque
ADD CONSTRAINT historico_estoque_id_produto_fkey
FOREIGN KEY (id_produto) REFERENCES public.produtos(id)
ON DELETE CASCADE;

-- 3. Verificar se ficou correto
SELECT
    tc.table_name,
    tc.constraint_name,
    rc.delete_rule
FROM information_schema.table_constraints AS tc
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
JOIN information_schema.referential_constraints AS rc
    ON rc.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
AND ccu.table_name = 'produtos'
ORDER BY tc.table_name;
