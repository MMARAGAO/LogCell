-- =====================================================
-- INSTRUÇÕES PARA EXECUTAR ESTE SCRIPT
-- =====================================================
-- 
-- OPÇÃO 1 - Via Supabase Dashboard (Recomendado):
-- 1. Acesse: https://supabase.com/dashboard
-- 2. Selecione seu projeto
-- 3. No menu lateral, clique em "SQL Editor"
-- 4. Clique em "+ New Query"
-- 5. Copie e cole TODO o conteúdo deste arquivo
-- 6. Clique em "Run" ou pressione Ctrl+Enter
-- 
-- OPÇÃO 2 - Via psql (Terminal):
-- psql -h db.qyzjvkthuuclsyjeweek.supabase.co -U postgres -d postgres -f ADD_CAMPOS_CATALOGO.sql
-- 
-- ⚠️ IMPORTANTE: Execute este script apenas UMA VEZ
-- =====================================================

-- Iniciar transação
BEGIN;

-- Adicionar campos na tabela produtos
ALTER TABLE produtos
ADD COLUMN IF NOT EXISTS exibir_catalogo BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS destaque BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS promocao BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS novidade BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS ordem_catalogo INTEGER DEFAULT 0;

-- Adicionar comentários nos campos
COMMENT ON COLUMN produtos.exibir_catalogo IS 'Define se o produto aparece no catálogo público';
COMMENT ON COLUMN produtos.destaque IS 'Marca o produto como destaque no catálogo';
COMMENT ON COLUMN produtos.promocao IS 'Marca o produto como promoção no catálogo';
COMMENT ON COLUMN produtos.novidade IS 'Marca o produto como novidade no catálogo';
COMMENT ON COLUMN produtos.ordem_catalogo IS 'Ordem de exibição no catálogo (menor = primeiro)';

-- Adicionar campos na tabela aparelhos
ALTER TABLE aparelhos
ADD COLUMN IF NOT EXISTS exibir_catalogo BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS destaque BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS promocao BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS novidade BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS ordem_catalogo INTEGER DEFAULT 0;

-- Adicionar comentários nos campos
COMMENT ON COLUMN aparelhos.exibir_catalogo IS 'Define se o aparelho aparece no catálogo público';
COMMENT ON COLUMN aparelhos.destaque IS 'Marca o aparelho como destaque no catálogo';
COMMENT ON COLUMN aparelhos.promocao IS 'Marca o aparelho como promoção no catálogo';
COMMENT ON COLUMN aparelhos.novidade IS 'Marca o aparelho como novidade no catálogo';
COMMENT ON COLUMN aparelhos.ordem_catalogo IS 'Ordem de exibição no catálogo (menor = primeiro)';

-- Criar índices para melhorar performance de consultas do catálogo
CREATE INDEX IF NOT EXISTS idx_produtos_catalogo 
ON produtos(exibir_catalogo, destaque, promocao, ordem_catalogo) 
WHERE exibir_catalogo = true;

CREATE INDEX IF NOT EXISTS idx_aparelhos_catalogo 
ON aparelhos(exibir_catalogo, destaque, promocao, ordem_catalogo) 
WHERE exibir_catalogo = true;

-- Habilitar RLS para acesso público aos itens do catálogo
-- Produtos
DROP POLICY IF EXISTS "Produtos do catálogo são públicos" ON produtos;
CREATE POLICY "Produtos do catálogo são públicos"
ON produtos FOR SELECT
USING (exibir_catalogo = true);

-- Aparelhos
DROP POLICY IF EXISTS "Aparelhos do catálogo são públicos" ON aparelhos;
CREATE POLICY "Aparelhos do catálogo são públicos"
ON aparelhos FOR SELECT
USING (exibir_catalogo = true);

-- Garantir que fotos de produtos são públicas quando o produto está no catálogo
DROP POLICY IF EXISTS "Fotos de produtos no catálogo são públicas" ON fotos_produtos;
CREATE POLICY "Fotos de produtos no catálogo são públicas"
ON fotos_produtos FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM produtos 
    WHERE produtos.id = fotos_produtos.produto_id 
    AND produtos.exibir_catalogo = true
  )
);

-- Garantir que fotos de aparelhos são públicas quando o aparelho está no catálogo
DROP POLICY IF EXISTS "Fotos de aparelhos no catálogo são públicas" ON fotos_aparelhos;
CREATE POLICY "Fotos de aparelhos no catálogo são públicas"
ON fotos_aparelhos FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM aparelhos 
    WHERE aparelhos.id = fotos_aparelhos.aparelho_id 
    AND aparelhos.exibir_catalogo = true
  )
);

-- Confirmar transação
COMMIT;

-- Verificar se funcionou
SELECT 
    'produtos' as tabela,
    COUNT(*) FILTER (WHERE exibir_catalogo = true) as itens_no_catalogo,
    COUNT(*) as total_itens
FROM produtos
UNION ALL
SELECT 
    'aparelhos' as tabela,
    COUNT(*) FILTER (WHERE exibir_catalogo = true) as itens_no_catalogo,
    COUNT(*) as total_itens
FROM aparelhos;

-- Mensagem de sucesso
DO $$
BEGIN
    RAISE NOTICE '✅ Script executado com sucesso!';
    RAISE NOTICE '📝 Campos adicionados: exibir_catalogo, destaque, promocao, novidade, ordem_catalogo';
    RAISE NOTICE '🚀 Catálogo público pronto para uso em /catalogo';
END $$;
