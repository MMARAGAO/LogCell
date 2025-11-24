-- ============================================
-- MIGRAÇÃO: Adicionar campos grupo, categoria e codigo_fabricante
-- ============================================
-- Este script adiciona os novos campos necessários para produtos
-- ============================================

-- Adicionar novos campos à tabela produtos
ALTER TABLE public.produtos 
ADD COLUMN IF NOT EXISTS grupo VARCHAR(100),
ADD COLUMN IF NOT EXISTS categoria VARCHAR(100),
ADD COLUMN IF NOT EXISTS codigo_fabricante VARCHAR(100);

-- Criar índices para melhorar performance em buscas
CREATE INDEX IF NOT EXISTS idx_produtos_grupo ON public.produtos(grupo);
CREATE INDEX IF NOT EXISTS idx_produtos_categoria ON public.produtos(categoria);
CREATE INDEX IF NOT EXISTS idx_produtos_codigo_fabricante ON public.produtos(codigo_fabricante);

-- Atualizar o trigger para incluir novos campos no histórico
CREATE OR REPLACE FUNCTION registrar_historico_produto()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
    v_usuario_id UUID;
    v_campo TEXT;
    v_valor_antigo TEXT;
    v_valor_novo TEXT;
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
DROP TRIGGER IF EXISTS trigger_historico_produto ON public.produtos;
CREATE TRIGGER trigger_historico_produto
    AFTER UPDATE ON public.produtos
    FOR EACH ROW
    EXECUTE FUNCTION registrar_historico_produto();

-- Verificar estrutura final da tabela
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'produtos'
ORDER BY ordinal_position;
