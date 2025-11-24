-- ============================================
-- LIMPEZA COMPLETA E RECRIAÇÃO FORÇADA
-- ============================================
-- Execute este script para garantir que TUDO seja recriado
-- ============================================

-- 1. DESABILITAR TRIGGER TEMPORARIAMENTE
-- ALTER TABLE public.produtos DISABLE TRIGGER ALL;  -- comentado para evitar erro de permissão em triggers do sistema

-- 2. DROPAR TUDO (FORÇADO)
DROP TRIGGER IF EXISTS trigger_historico_produto ON public.produtos CASCADE;
DROP FUNCTION IF EXISTS registrar_historico_produto() CASCADE;
DROP TABLE IF EXISTS public.historico_produtos CASCADE;

-- 3. AGUARDAR UM MOMENTO (apenas comentário para você saber que tudo foi dropado)
-- Agora vamos recriar tudo do zero

-- 4. CRIAR TABELA LIMPA
CREATE TABLE public.historico_produtos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    produto_id UUID NOT NULL REFERENCES public.produtos(id) ON DELETE CASCADE,
    campo VARCHAR(50) NOT NULL,
    valor_antigo TEXT,
    valor_novo TEXT,
    usuario_id UUID REFERENCES auth.users(id),
    data_alteracao TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. ÍNDICES
CREATE INDEX idx_historico_produtos_produto_id ON public.historico_produtos(produto_id);
CREATE INDEX idx_historico_produtos_campo ON public.historico_produtos(campo);
CREATE INDEX idx_historico_produtos_data ON public.historico_produtos(data_alteracao DESC);

-- 6. RLS
ALTER TABLE public.historico_produtos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuários autenticados podem visualizar histórico" ON public.historico_produtos;
CREATE POLICY "Usuários autenticados podem visualizar histórico"
    ON public.historico_produtos FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Sistema pode inserir no histórico" ON public.historico_produtos;
CREATE POLICY "Sistema pode inserir no histórico"
    ON public.historico_produtos FOR INSERT TO authenticated WITH CHECK (true);

-- 7. GARANTIR QUE OS CAMPOS EXISTEM NA TABELA PRODUTOS
DO $$ 
BEGIN
    -- Adicionar atualizado_por se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'produtos' 
        AND column_name = 'atualizado_por'
    ) THEN
        ALTER TABLE public.produtos ADD COLUMN atualizado_por UUID REFERENCES auth.users(id);
    END IF;
    
    -- Adicionar grupo se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'produtos' 
        AND column_name = 'grupo'
    ) THEN
        ALTER TABLE public.produtos ADD COLUMN grupo VARCHAR(100);
    END IF;
    
    -- Adicionar categoria se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'produtos' 
        AND column_name = 'categoria'
    ) THEN
        ALTER TABLE public.produtos ADD COLUMN categoria VARCHAR(100);
    END IF;
    
    -- Adicionar codigo_fabricante se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'produtos' 
        AND column_name = 'codigo_fabricante'
    ) THEN
        ALTER TABLE public.produtos ADD COLUMN codigo_fabricante VARCHAR(100);
    END IF;
END $$;

-- 8. CRIAR ÍNDICES NOS NOVOS CAMPOS
CREATE INDEX IF NOT EXISTS idx_produtos_grupo ON public.produtos(grupo);
CREATE INDEX IF NOT EXISTS idx_produtos_categoria ON public.produtos(categoria);
CREATE INDEX IF NOT EXISTS idx_produtos_codigo_fabricante ON public.produtos(codigo_fabricante);

-- 9. RECRIAR FUNÇÃO DO TRIGGER (VERSÃO LIMPA)
CREATE OR REPLACE FUNCTION registrar_historico_produto()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
    v_usuario_id UUID;
BEGIN
    -- Usar atualizado_por se existir, senão auth.uid()
    v_usuario_id := COALESCE(NEW.atualizado_por, auth.uid());

    -- Descrição
    IF OLD.descricao IS DISTINCT FROM NEW.descricao THEN
        INSERT INTO historico_produtos (produto_id, campo, valor_antigo, valor_novo, usuario_id)
        VALUES (NEW.id, 'descricao', OLD.descricao, NEW.descricao, v_usuario_id);
    END IF;

    -- Grupo
    IF OLD.grupo IS DISTINCT FROM NEW.grupo THEN
        INSERT INTO historico_produtos (produto_id, campo, valor_antigo, valor_novo, usuario_id)
        VALUES (NEW.id, 'grupo', OLD.grupo, NEW.grupo, v_usuario_id);
    END IF;

    -- Categoria
    IF OLD.categoria IS DISTINCT FROM NEW.categoria THEN
        INSERT INTO historico_produtos (produto_id, campo, valor_antigo, valor_novo, usuario_id)
        VALUES (NEW.id, 'categoria', OLD.categoria, NEW.categoria, v_usuario_id);
    END IF;

    -- Código do Fabricante
    IF OLD.codigo_fabricante IS DISTINCT FROM NEW.codigo_fabricante THEN
        INSERT INTO historico_produtos (produto_id, campo, valor_antigo, valor_novo, usuario_id)
        VALUES (NEW.id, 'codigo_fabricante', OLD.codigo_fabricante, NEW.codigo_fabricante, v_usuario_id);
    END IF;

    -- Modelos
    IF OLD.modelos IS DISTINCT FROM NEW.modelos THEN
        INSERT INTO historico_produtos (produto_id, campo, valor_antigo, valor_novo, usuario_id)
        VALUES (NEW.id, 'modelos', OLD.modelos, NEW.modelos, v_usuario_id);
    END IF;

    -- Marca
    IF OLD.marca IS DISTINCT FROM NEW.marca THEN
        INSERT INTO historico_produtos (produto_id, campo, valor_antigo, valor_novo, usuario_id)
        VALUES (NEW.id, 'marca', OLD.marca, NEW.marca, v_usuario_id);
    END IF;

    -- Preço de Compra
    IF OLD.preco_compra IS DISTINCT FROM NEW.preco_compra THEN
        INSERT INTO historico_produtos (produto_id, campo, valor_antigo, valor_novo, usuario_id)
        VALUES (NEW.id, 'preco_compra', OLD.preco_compra::TEXT, NEW.preco_compra::TEXT, v_usuario_id);
    END IF;

    -- Preço de Venda
    IF OLD.preco_venda IS DISTINCT FROM NEW.preco_venda THEN
        INSERT INTO historico_produtos (produto_id, campo, valor_antigo, valor_novo, usuario_id)
        VALUES (NEW.id, 'preco_venda', OLD.preco_venda::TEXT, NEW.preco_venda::TEXT, v_usuario_id);
    END IF;

    -- Quantidade Mínima
    IF OLD.quantidade_minima IS DISTINCT FROM NEW.quantidade_minima THEN
        INSERT INTO historico_produtos (produto_id, campo, valor_antigo, valor_novo, usuario_id)
        VALUES (NEW.id, 'quantidade_minima', OLD.quantidade_minima::TEXT, NEW.quantidade_minima::TEXT, v_usuario_id);
    END IF;

    -- Status Ativo
    IF OLD.ativo IS DISTINCT FROM NEW.ativo THEN
        INSERT INTO historico_produtos (produto_id, campo, valor_antigo, valor_novo, usuario_id)
        VALUES (NEW.id, 'ativo', OLD.ativo::TEXT, NEW.ativo::TEXT, v_usuario_id);
    END IF;

    RETURN NEW;
END;
$$;

-- 10. RECRIAR TRIGGER
CREATE TRIGGER trigger_historico_produto
    AFTER UPDATE ON public.produtos
    FOR EACH ROW
    EXECUTE FUNCTION registrar_historico_produto();

-- 11. REABILITAR TODOS OS TRIGGERS
-- ALTER TABLE public.produtos ENABLE TRIGGER ALL;  -- comentado para evitar erro de permissão em triggers do sistema

-- 12. VERIFICAÇÕES FINAIS
SELECT 'Script executado com sucesso!' as resultado;

-- Verificar estrutura da tabela historico_produtos
SELECT '=== ESTRUTURA historico_produtos ===' as info;
SELECT column_name, data_type
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'historico_produtos'
ORDER BY ordinal_position;

-- Verificar se trigger foi criado
SELECT '=== TRIGGER CRIADO ===' as info;
SELECT trigger_name, event_manipulation, action_timing
FROM information_schema.triggers
WHERE trigger_name = 'trigger_historico_produto';

-- Verificar campos na tabela produtos
SELECT '=== CAMPOS PRODUTOS ===' as info;
SELECT column_name, data_type
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'produtos'
AND column_name IN ('grupo', 'categoria', 'codigo_fabricante', 'atualizado_por')
ORDER BY column_name;
