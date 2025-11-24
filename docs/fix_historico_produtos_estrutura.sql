-- ============================================
-- CORREÇÃO: Estrutura da tabela historico_produtos
-- ============================================
-- Este script corrige a estrutura da tabela historico_produtos
-- e recria o trigger de histórico corretamente
-- ============================================
-- ATENÇÃO: Este script IRÁ APAGAR os dados antigos do histórico!
-- ============================================

-- Primeiro, vamos verificar a estrutura atual
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'historico_produtos'
ORDER BY ordinal_position;

-- Dropar o trigger antigo
DROP TRIGGER IF EXISTS trigger_historico_produto ON public.produtos;

-- Dropar a função antiga se existir
DROP FUNCTION IF EXISTS registrar_historico_produto() CASCADE;

-- Dropar a tabela historico_produtos (isso apaga os dados!)
DROP TABLE IF EXISTS public.historico_produtos CASCADE;

-- Recriar a tabela historico_produtos com a estrutura correta
CREATE TABLE IF NOT EXISTS public.historico_produtos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    produto_id UUID NOT NULL REFERENCES public.produtos(id) ON DELETE CASCADE,
    campo VARCHAR(50) NOT NULL,
    valor_antigo TEXT,
    valor_novo TEXT,
    usuario_id UUID REFERENCES auth.users(id),
    data_alteracao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_historico_produtos_produto_id ON public.historico_produtos(produto_id);
CREATE INDEX IF NOT EXISTS idx_historico_produtos_campo ON public.historico_produtos(campo);
CREATE INDEX IF NOT EXISTS idx_historico_produtos_data ON public.historico_produtos(data_alteracao DESC);
CREATE INDEX IF NOT EXISTS idx_historico_produtos_usuario ON public.historico_produtos(usuario_id);

-- Habilitar RLS
ALTER TABLE public.historico_produtos ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para historico_produtos
DROP POLICY IF EXISTS "Usuários autenticados podem visualizar histórico" ON public.historico_produtos;
CREATE POLICY "Usuários autenticados podem visualizar histórico"
    ON public.historico_produtos
    FOR SELECT
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS "Sistema pode inserir no histórico" ON public.historico_produtos;
CREATE POLICY "Sistema pode inserir no histórico"
    ON public.historico_produtos
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Recriar a função do trigger
CREATE OR REPLACE FUNCTION registrar_historico_produto()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
    v_usuario_id UUID;
BEGIN
    -- Determinar o usuário que fez a alteração
    v_usuario_id := COALESCE(NEW.atualizado_por, auth.uid());

    -- Verificar alteração em descrição
    IF OLD.descricao IS DISTINCT FROM NEW.descricao THEN
        INSERT INTO historico_produtos (produto_id, campo, valor_antigo, valor_novo, usuario_id)
        VALUES (NEW.id, 'descricao', OLD.descricao, NEW.descricao, v_usuario_id);
    END IF;

    -- Verificar alteração em grupo
    IF OLD.grupo IS DISTINCT FROM NEW.grupo THEN
        INSERT INTO historico_produtos (produto_id, campo, valor_antigo, valor_novo, usuario_id)
        VALUES (NEW.id, 'grupo', OLD.grupo, NEW.grupo, v_usuario_id);
    END IF;

    -- Verificar alteração em categoria
    IF OLD.categoria IS DISTINCT FROM NEW.categoria THEN
        INSERT INTO historico_produtos (produto_id, campo, valor_antigo, valor_novo, usuario_id)
        VALUES (NEW.id, 'categoria', OLD.categoria, NEW.categoria, v_usuario_id);
    END IF;

    -- Verificar alteração em código do fabricante
    IF OLD.codigo_fabricante IS DISTINCT FROM NEW.codigo_fabricante THEN
        INSERT INTO historico_produtos (produto_id, campo, valor_antigo, valor_novo, usuario_id)
        VALUES (NEW.id, 'codigo_fabricante', OLD.codigo_fabricante, NEW.codigo_fabricante, v_usuario_id);
    END IF;

    -- Verificar alteração em modelos
    IF OLD.modelos IS DISTINCT FROM NEW.modelos THEN
        INSERT INTO historico_produtos (produto_id, campo, valor_antigo, valor_novo, usuario_id)
        VALUES (NEW.id, 'modelos', OLD.modelos, NEW.modelos, v_usuario_id);
    END IF;

    -- Verificar alteração em marca
    IF OLD.marca IS DISTINCT FROM NEW.marca THEN
        INSERT INTO historico_produtos (produto_id, campo, valor_antigo, valor_novo, usuario_id)
        VALUES (NEW.id, 'marca', OLD.marca, NEW.marca, v_usuario_id);
    END IF;

    -- Verificar alteração em preço de compra
    IF OLD.preco_compra IS DISTINCT FROM NEW.preco_compra THEN
        INSERT INTO historico_produtos (produto_id, campo, valor_antigo, valor_novo, usuario_id)
        VALUES (NEW.id, 'preco_compra', OLD.preco_compra::TEXT, NEW.preco_compra::TEXT, v_usuario_id);
    END IF;

    -- Verificar alteração em preço de venda
    IF OLD.preco_venda IS DISTINCT FROM NEW.preco_venda THEN
        INSERT INTO historico_produtos (produto_id, campo, valor_antigo, valor_novo, usuario_id)
        VALUES (NEW.id, 'preco_venda', OLD.preco_venda::TEXT, NEW.preco_venda::TEXT, v_usuario_id);
    END IF;

    -- Verificar alteração em quantidade mínima
    IF OLD.quantidade_minima IS DISTINCT FROM NEW.quantidade_minima THEN
        INSERT INTO historico_produtos (produto_id, campo, valor_antigo, valor_novo, usuario_id)
        VALUES (NEW.id, 'quantidade_minima', OLD.quantidade_minima::TEXT, NEW.quantidade_minima::TEXT, v_usuario_id);
    END IF;

    -- Verificar alteração em ativo
    IF OLD.ativo IS DISTINCT FROM NEW.ativo THEN
        INSERT INTO historico_produtos (produto_id, campo, valor_antigo, valor_novo, usuario_id)
        VALUES (NEW.id, 'ativo', OLD.ativo::TEXT, NEW.ativo::TEXT, v_usuario_id);
    END IF;

    RETURN NEW;
END;
$$;

-- Recriar o trigger
CREATE TRIGGER trigger_historico_produto
    AFTER UPDATE ON public.produtos
    FOR EACH ROW
    EXECUTE FUNCTION registrar_historico_produto();

-- Verificar estrutura final da tabela historico_produtos
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'historico_produtos'
ORDER BY ordinal_position;

-- Verificar se o trigger foi criado
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE trigger_name = 'trigger_historico_produto';
