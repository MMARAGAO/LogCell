-- =====================================================
-- SETUP COMPLETO: FORNECEDORES E ASSOCIAÇÃO COM PRODUTOS
-- =====================================================

-- 1. CRIAR TABELA DE FORNECEDORES
-- =====================================================
CREATE TABLE IF NOT EXISTS public.fornecedores (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    cnpj VARCHAR(18) UNIQUE,
    telefone VARCHAR(20),
    email VARCHAR(255),
    endereco TEXT,
    cidade VARCHAR(100),
    estado VARCHAR(2),
    cep VARCHAR(9),
    contato_nome VARCHAR(255),
    contato_telefone VARCHAR(20),
    observacoes TEXT,
    ativo BOOLEAN DEFAULT true,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    criado_por UUID REFERENCES auth.users(id),
    atualizado_por UUID REFERENCES auth.users(id)
);

-- 2. CRIAR TABELA DE RELACIONAMENTO PRODUTOS-FORNECEDORES
-- =====================================================
CREATE TABLE IF NOT EXISTS public.produtos_fornecedores (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    produto_id UUID NOT NULL REFERENCES public.produtos(id) ON DELETE CASCADE,
    fornecedor_id UUID NOT NULL REFERENCES public.fornecedores(id) ON DELETE CASCADE,
    preco_custo DECIMAL(10, 2),
    prazo_entrega_dias INTEGER,
    observacoes TEXT,
    ativo BOOLEAN DEFAULT true,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    criado_por UUID REFERENCES auth.users(id),
    atualizado_por UUID REFERENCES auth.users(id),
    UNIQUE(produto_id, fornecedor_id)
);

-- 3. CRIAR ÍNDICES PARA PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_fornecedores_nome ON public.fornecedores(nome);
CREATE INDEX IF NOT EXISTS idx_fornecedores_cnpj ON public.fornecedores(cnpj);
CREATE INDEX IF NOT EXISTS idx_fornecedores_ativo ON public.fornecedores(ativo);
CREATE INDEX IF NOT EXISTS idx_produtos_fornecedores_produto ON public.produtos_fornecedores(produto_id);
CREATE INDEX IF NOT EXISTS idx_produtos_fornecedores_fornecedor ON public.produtos_fornecedores(fornecedor_id);
CREATE INDEX IF NOT EXISTS idx_produtos_fornecedores_ativo ON public.produtos_fornecedores(ativo);

-- 4. HABILITAR RLS (ROW LEVEL SECURITY)
-- =====================================================
ALTER TABLE public.fornecedores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.produtos_fornecedores ENABLE ROW LEVEL SECURITY;

-- 5. CRIAR POLÍTICAS RLS PARA FORNECEDORES
-- =====================================================

-- Política de SELECT para fornecedores
DROP POLICY IF EXISTS "Usuários autenticados podem ver fornecedores" ON public.fornecedores;
CREATE POLICY "Usuários autenticados podem ver fornecedores"
    ON public.fornecedores
    FOR SELECT
    TO authenticated
    USING (true);

-- Política de INSERT para fornecedores
DROP POLICY IF EXISTS "Usuários autenticados podem criar fornecedores" ON public.fornecedores;
CREATE POLICY "Usuários autenticados podem criar fornecedores"
    ON public.fornecedores
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Política de UPDATE para fornecedores
DROP POLICY IF EXISTS "Usuários autenticados podem atualizar fornecedores" ON public.fornecedores;
CREATE POLICY "Usuários autenticados podem atualizar fornecedores"
    ON public.fornecedores
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Política de DELETE para fornecedores
DROP POLICY IF EXISTS "Usuários autenticados podem deletar fornecedores" ON public.fornecedores;
CREATE POLICY "Usuários autenticados podem deletar fornecedores"
    ON public.fornecedores
    FOR DELETE
    TO authenticated
    USING (true);

-- 6. CRIAR POLÍTICAS RLS PARA PRODUTOS_FORNECEDORES
-- =====================================================

-- Política de SELECT para produtos_fornecedores
DROP POLICY IF EXISTS "Usuários autenticados podem ver produtos_fornecedores" ON public.produtos_fornecedores;
CREATE POLICY "Usuários autenticados podem ver produtos_fornecedores"
    ON public.produtos_fornecedores
    FOR SELECT
    TO authenticated
    USING (true);

-- Política de INSERT para produtos_fornecedores
DROP POLICY IF EXISTS "Usuários autenticados podem criar produtos_fornecedores" ON public.produtos_fornecedores;
CREATE POLICY "Usuários autenticados podem criar produtos_fornecedores"
    ON public.produtos_fornecedores
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Política de UPDATE para produtos_fornecedores
DROP POLICY IF EXISTS "Usuários autenticados podem atualizar produtos_fornecedores" ON public.produtos_fornecedores;
CREATE POLICY "Usuários autenticados podem atualizar produtos_fornecedores"
    ON public.produtos_fornecedores
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Política de DELETE para produtos_fornecedores
DROP POLICY IF EXISTS "Usuários autenticados podem deletar produtos_fornecedores" ON public.produtos_fornecedores;
CREATE POLICY "Usuários autenticados podem deletar produtos_fornecedores"
    ON public.produtos_fornecedores
    FOR DELETE
    TO authenticated
    USING (true);

-- 7. CRIAR TRIGGER PARA ATUALIZAR atualizado_em EM FORNECEDORES
-- =====================================================
CREATE OR REPLACE FUNCTION atualizar_timestamp_fornecedores()
RETURNS TRIGGER AS $$
BEGIN
    NEW.atualizado_em = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_atualizar_timestamp_fornecedores ON public.fornecedores;
CREATE TRIGGER trigger_atualizar_timestamp_fornecedores
    BEFORE UPDATE ON public.fornecedores
    FOR EACH ROW
    EXECUTE FUNCTION atualizar_timestamp_fornecedores();

-- 8. CRIAR TRIGGER PARA ATUALIZAR atualizado_em EM PRODUTOS_FORNECEDORES
-- =====================================================
CREATE OR REPLACE FUNCTION atualizar_timestamp_produtos_fornecedores()
RETURNS TRIGGER AS $$
BEGIN
    NEW.atualizado_em = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_atualizar_timestamp_produtos_fornecedores ON public.produtos_fornecedores;
CREATE TRIGGER trigger_atualizar_timestamp_produtos_fornecedores
    BEFORE UPDATE ON public.produtos_fornecedores
    FOR EACH ROW
    EXECUTE FUNCTION atualizar_timestamp_produtos_fornecedores();

-- 9. CRIAR TABELA DE HISTÓRICO PARA FORNECEDORES
-- =====================================================
CREATE TABLE IF NOT EXISTS public.historico_fornecedores (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    fornecedor_id UUID REFERENCES public.fornecedores(id) ON DELETE CASCADE,
    operacao VARCHAR(10) NOT NULL CHECK (operacao IN ('INSERT', 'UPDATE', 'DELETE')),
    dados_anteriores JSONB,
    dados_novos JSONB,
    usuario_id UUID REFERENCES auth.users(id),
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_historico_fornecedores_fornecedor ON public.historico_fornecedores(fornecedor_id);
CREATE INDEX IF NOT EXISTS idx_historico_fornecedores_criado_em ON public.historico_fornecedores(criado_em);

-- Habilitar RLS para histórico
ALTER TABLE public.historico_fornecedores ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuários autenticados podem ver histórico de fornecedores" ON public.historico_fornecedores;
CREATE POLICY "Usuários autenticados podem ver histórico de fornecedores"
    ON public.historico_fornecedores
    FOR SELECT
    TO authenticated
    USING (true);

-- Política de INSERT para histórico (necessária para os triggers)
DROP POLICY IF EXISTS "Sistema pode inserir no histórico de fornecedores" ON public.historico_fornecedores;
CREATE POLICY "Sistema pode inserir no histórico de fornecedores"
    ON public.historico_fornecedores
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- 10. CRIAR TRIGGER PARA REGISTRAR HISTÓRICO DE FORNECEDORES
-- =====================================================
CREATE OR REPLACE FUNCTION registrar_historico_fornecedores()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'DELETE') THEN
        INSERT INTO public.historico_fornecedores (fornecedor_id, operacao, dados_anteriores, usuario_id)
        VALUES (OLD.id, TG_OP, row_to_json(OLD), OLD.atualizado_por);
        RETURN OLD;
    ELSIF (TG_OP = 'UPDATE') THEN
        INSERT INTO public.historico_fornecedores (fornecedor_id, operacao, dados_anteriores, dados_novos, usuario_id)
        VALUES (NEW.id, TG_OP, row_to_json(OLD), row_to_json(NEW), NEW.atualizado_por);
        RETURN NEW;
    ELSIF (TG_OP = 'INSERT') THEN
        INSERT INTO public.historico_fornecedores (fornecedor_id, operacao, dados_novos, usuario_id)
        VALUES (NEW.id, TG_OP, row_to_json(NEW), NEW.criado_por);
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_historico_fornecedores ON public.fornecedores;
CREATE TRIGGER trigger_historico_fornecedores
    AFTER INSERT OR UPDATE OR DELETE ON public.fornecedores
    FOR EACH ROW
    EXECUTE FUNCTION registrar_historico_fornecedores();

-- 11. HABILITAR REALTIME PARA FORNECEDORES
-- =====================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.fornecedores;
ALTER PUBLICATION supabase_realtime ADD TABLE public.produtos_fornecedores;

-- =====================================================
-- FIM DO SETUP
-- =====================================================
