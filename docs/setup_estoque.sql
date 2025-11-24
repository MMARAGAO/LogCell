-- ============================================
-- SETUP COMPLETO DO SISTEMA DE ESTOQUE
-- ============================================
-- Este script cria:
-- 1. Tabela de produtos
-- 2. Tabela de estoque por loja
-- 3. Tabela de histórico de movimentações
-- 4. Tabela de fotos de produtos
-- 5. Bucket de storage para fotos
-- 6. Políticas RLS
-- 7. Triggers e funções
-- ============================================

-- ============================================
-- 1. TABELA DE PRODUTOS
-- ============================================
CREATE TABLE IF NOT EXISTS public.produtos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    descricao TEXT NOT NULL,
    modelos VARCHAR(255),
    marca VARCHAR(255),
    preco_compra DECIMAL(10, 2),
    preco_venda DECIMAL(10, 2),
    quantidade_minima INTEGER DEFAULT 0,
    ativo BOOLEAN DEFAULT TRUE,
    criado_por UUID REFERENCES auth.users(id),
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    atualizado_por UUID REFERENCES auth.users(id),
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_produtos_descricao ON public.produtos(descricao);
CREATE INDEX IF NOT EXISTS idx_produtos_marca ON public.produtos(marca);
CREATE INDEX IF NOT EXISTS idx_produtos_ativo ON public.produtos(ativo);
CREATE INDEX IF NOT EXISTS idx_produtos_atualizado_por ON public.produtos(atualizado_por);

-- ============================================
-- 2. TABELA DE ESTOQUE POR LOJA (PRODUTOS X LOJAS)
-- ============================================
CREATE TABLE IF NOT EXISTS public.estoque_lojas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    id_produto UUID REFERENCES public.produtos(id) ON DELETE CASCADE NOT NULL,
    id_loja INTEGER REFERENCES public.lojas(id) ON DELETE CASCADE NOT NULL,
    quantidade INTEGER DEFAULT 0 NOT NULL,
    atualizado_por UUID REFERENCES auth.users(id),
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(id_produto, id_loja)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_estoque_lojas_produto ON public.estoque_lojas(id_produto);
CREATE INDEX IF NOT EXISTS idx_estoque_lojas_loja ON public.estoque_lojas(id_loja);

-- ============================================
-- 3. TABELA DE HISTÓRICO DE PRODUTOS
-- ============================================
CREATE TABLE IF NOT EXISTS public.historico_produtos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    produto_id UUID REFERENCES public.produtos(id) ON DELETE CASCADE NOT NULL,
    usuario_id UUID REFERENCES auth.users(id),
    operacao VARCHAR(20) NOT NULL, -- INSERT, UPDATE, DELETE
    campo_alterado VARCHAR(100), -- Nome do campo que foi alterado
    valor_anterior TEXT, -- Valor antes da alteração
    valor_novo TEXT, -- Valor após a alteração
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_historico_produtos_produto ON public.historico_produtos(produto_id);
CREATE INDEX IF NOT EXISTS idx_historico_produtos_usuario ON public.historico_produtos(usuario_id);
CREATE INDEX IF NOT EXISTS idx_historico_produtos_data ON public.historico_produtos(criado_em DESC);

-- ============================================
-- 4. TABELA DE HISTÓRICO DE ESTOQUE (MOVIMENTAÇÕES)
-- ============================================
CREATE TABLE IF NOT EXISTS public.historico_estoque (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    id_produto UUID REFERENCES public.produtos(id) ON DELETE CASCADE NOT NULL,
    id_loja INTEGER REFERENCES public.lojas(id) ON DELETE SET NULL,
    usuario_id UUID REFERENCES auth.users(id),
    quantidade_anterior INTEGER,
    quantidade_nova INTEGER,
    quantidade_alterada INTEGER, -- Diferença (pode ser + ou -)
    observacao TEXT,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_historico_estoque_produto ON public.historico_estoque(id_produto);
CREATE INDEX IF NOT EXISTS idx_historico_estoque_loja ON public.historico_estoque(id_loja);
CREATE INDEX IF NOT EXISTS idx_historico_estoque_usuario ON public.historico_estoque(usuario_id);
CREATE INDEX IF NOT EXISTS idx_historico_estoque_data ON public.historico_estoque(criado_em DESC);

-- ============================================
-- 5. TABELA DE FOTOS DE PRODUTOS
-- ============================================
CREATE TABLE IF NOT EXISTS public.fotos_produtos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    produto_id UUID REFERENCES public.produtos(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    nome_arquivo VARCHAR(255) NOT NULL,
    tamanho INTEGER, -- em bytes
    ordem INTEGER DEFAULT 0,
    is_principal BOOLEAN DEFAULT FALSE,
    criado_por UUID REFERENCES auth.users(id),
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_fotos_produtos_produto ON public.fotos_produtos(produto_id);
CREATE INDEX IF NOT EXISTS idx_fotos_produtos_ordem ON public.fotos_produtos(ordem);

-- ============================================
-- 6. FUNÇÕES E TRIGGERS
-- ============================================

-- Função para atualizar timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.atualizado_em = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para produtos
DROP TRIGGER IF EXISTS update_produtos_updated_at ON public.produtos;
CREATE TRIGGER update_produtos_updated_at
    BEFORE UPDATE ON public.produtos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para estoque_lojas
DROP TRIGGER IF EXISTS update_estoque_lojas_updated_at ON public.estoque_lojas;
CREATE TRIGGER update_estoque_lojas_updated_at
    BEFORE UPDATE ON public.estoque_lojas
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- TRIGGER: REGISTRAR HISTÓRICO DE PRODUTOS
-- ============================================
CREATE OR REPLACE FUNCTION registrar_historico_produtos()
RETURNS TRIGGER AS $$
DECLARE
    campo_nome VARCHAR(100);
    valor_antigo TEXT;
    valor_novo TEXT;
    v_usuario_id UUID;
BEGIN
    -- Capturar o usuário: priorizar atualizado_por, depois auth.uid()
    v_usuario_id := COALESCE(
        (CASE WHEN TG_OP = 'UPDATE' THEN NEW.atualizado_por ELSE NULL END),
        auth.uid()
    );
    
    IF (TG_OP = 'INSERT') THEN
        -- Registrar criação do produto
        INSERT INTO public.historico_produtos (
            produto_id, usuario_id, operacao, campo_alterado, valor_anterior, valor_novo
        ) VALUES (
            NEW.id, COALESCE(v_usuario_id, NEW.criado_por), 'INSERT', 'produto_criado', NULL, 
            json_build_object(
                'descricao', NEW.descricao,
                'modelos', NEW.modelos,
                'marca', NEW.marca,
                'preco_compra', NEW.preco_compra,
                'preco_venda', NEW.preco_venda,
                'quantidade_minima', NEW.quantidade_minima
            )::TEXT
        );
        RETURN NEW;
    ELSIF (TG_OP = 'UPDATE') THEN
        -- Registrar cada campo que foi alterado
        IF OLD.descricao IS DISTINCT FROM NEW.descricao THEN
            INSERT INTO public.historico_produtos (produto_id, usuario_id, operacao, campo_alterado, valor_anterior, valor_novo)
            VALUES (NEW.id, COALESCE(v_usuario_id, NEW.criado_por), 'UPDATE', 'descricao', OLD.descricao, NEW.descricao);
        END IF;
        
        IF OLD.modelos IS DISTINCT FROM NEW.modelos THEN
            INSERT INTO public.historico_produtos (produto_id, usuario_id, operacao, campo_alterado, valor_anterior, valor_novo)
            VALUES (NEW.id, COALESCE(v_usuario_id, NEW.criado_por), 'UPDATE', 'modelos', OLD.modelos, NEW.modelos);
        END IF;
        
        IF OLD.marca IS DISTINCT FROM NEW.marca THEN
            INSERT INTO public.historico_produtos (produto_id, usuario_id, operacao, campo_alterado, valor_anterior, valor_novo)
            VALUES (NEW.id, COALESCE(v_usuario_id, NEW.criado_por), 'UPDATE', 'marca', OLD.marca, NEW.marca);
        END IF;
        
        IF OLD.preco_compra IS DISTINCT FROM NEW.preco_compra THEN
            INSERT INTO public.historico_produtos (produto_id, usuario_id, operacao, campo_alterado, valor_anterior, valor_novo)
            VALUES (NEW.id, COALESCE(v_usuario_id, NEW.criado_por), 'UPDATE', 'preco_compra', OLD.preco_compra::TEXT, NEW.preco_compra::TEXT);
        END IF;
        
        IF OLD.preco_venda IS DISTINCT FROM NEW.preco_venda THEN
            INSERT INTO public.historico_produtos (produto_id, usuario_id, operacao, campo_alterado, valor_anterior, valor_novo)
            VALUES (NEW.id, COALESCE(v_usuario_id, NEW.criado_por), 'UPDATE', 'preco_venda', OLD.preco_venda::TEXT, NEW.preco_venda::TEXT);
        END IF;
        
        IF OLD.quantidade_minima IS DISTINCT FROM NEW.quantidade_minima THEN
            INSERT INTO public.historico_produtos (produto_id, usuario_id, operacao, campo_alterado, valor_anterior, valor_novo)
            VALUES (NEW.id, COALESCE(v_usuario_id, NEW.criado_por), 'UPDATE', 'quantidade_minima', OLD.quantidade_minima::TEXT, NEW.quantidade_minima::TEXT);
        END IF;
        
        IF OLD.ativo IS DISTINCT FROM NEW.ativo THEN
            INSERT INTO public.historico_produtos (produto_id, usuario_id, operacao, campo_alterado, valor_anterior, valor_novo)
            VALUES (NEW.id, COALESCE(v_usuario_id, NEW.criado_por), 'UPDATE', 'ativo', OLD.ativo::TEXT, NEW.ativo::TEXT);
        END IF;
        
        RETURN NEW;
    ELSIF (TG_OP = 'DELETE') THEN
        -- Registrar exclusão
        INSERT INTO public.historico_produtos (
            produto_id, usuario_id, operacao, campo_alterado, valor_anterior, valor_novo
        ) VALUES (
            OLD.id, COALESCE(v_usuario_id, OLD.criado_por), 'DELETE', 'produto_deletado', 
            json_build_object(
                'descricao', OLD.descricao,
                'modelos', OLD.modelos,
                'marca', OLD.marca,
                'preco_compra', OLD.preco_compra,
                'preco_venda', OLD.preco_venda,
                'quantidade_minima', OLD.quantidade_minima
            )::TEXT,
            NULL
        );
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Aplicar trigger de histórico de produtos
DROP TRIGGER IF EXISTS trigger_historico_produtos ON public.produtos;
CREATE TRIGGER trigger_historico_produtos
    AFTER INSERT OR UPDATE OR DELETE ON public.produtos
    FOR EACH ROW
    EXECUTE FUNCTION registrar_historico_produtos();

-- ============================================
-- TRIGGER: REGISTRAR HISTÓRICO DE ESTOQUE
-- ============================================
CREATE OR REPLACE FUNCTION registrar_historico_estoque()
RETURNS TRIGGER AS $$
DECLARE
    v_usuario_id UUID;
BEGIN
    -- Capturar o usuário autenticado da sessão
    v_usuario_id := auth.uid();
    
    IF (TG_OP = 'INSERT') THEN
        -- Registrar criação de estoque
        INSERT INTO public.historico_estoque (
            id_produto, id_loja, usuario_id, 
            quantidade_anterior, quantidade_nova, quantidade_alterada, observacao
        ) VALUES (
            NEW.id_produto, NEW.id_loja, COALESCE(v_usuario_id, NEW.atualizado_por),
            0, NEW.quantidade, NEW.quantidade, 
            'Estoque inicial cadastrado'
        );
        RETURN NEW;
    ELSIF (TG_OP = 'UPDATE' AND OLD.quantidade != NEW.quantidade) THEN
        -- Registrar alteração de quantidade
        INSERT INTO public.historico_estoque (
            id_produto, id_loja, usuario_id,
            quantidade_anterior, quantidade_nova, quantidade_alterada, observacao
        ) VALUES (
            NEW.id_produto, NEW.id_loja, COALESCE(v_usuario_id, NEW.atualizado_por),
            OLD.quantidade, NEW.quantidade, (NEW.quantidade - OLD.quantidade),
            'Quantidade atualizada'
        );
        RETURN NEW;
    ELSIF (TG_OP = 'DELETE') THEN
        -- Registrar remoção de estoque
        INSERT INTO public.historico_estoque (
            id_produto, id_loja, usuario_id,
            quantidade_anterior, quantidade_nova, quantidade_alterada, observacao
        ) VALUES (
            OLD.id_produto, OLD.id_loja, COALESCE(v_usuario_id, OLD.atualizado_por),
            OLD.quantidade, 0, -OLD.quantidade,
            'Estoque removido/zerado'
        );
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Aplicar trigger de histórico de estoque
DROP TRIGGER IF EXISTS trigger_historico_estoque ON public.estoque_lojas;
CREATE TRIGGER trigger_historico_estoque
    AFTER INSERT OR UPDATE OR DELETE ON public.estoque_lojas
    FOR EACH ROW
    EXECUTE FUNCTION registrar_historico_estoque();

-- ============================================
-- 7. ROW LEVEL SECURITY (RLS)
-- ============================================

-- Habilitar RLS
ALTER TABLE public.produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.estoque_lojas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.historico_produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.historico_estoque ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fotos_produtos ENABLE ROW LEVEL SECURITY;

-- Políticas para PRODUTOS
DROP POLICY IF EXISTS "Usuários autenticados podem ver produtos" ON public.produtos;
CREATE POLICY "Usuários autenticados podem ver produtos"
    ON public.produtos FOR SELECT
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS "Usuários autenticados podem criar produtos" ON public.produtos;
CREATE POLICY "Usuários autenticados podem criar produtos"
    ON public.produtos FOR INSERT
    TO authenticated
    WITH CHECK (true);

DROP POLICY IF EXISTS "Usuários autenticados podem atualizar produtos" ON public.produtos;
CREATE POLICY "Usuários autenticados podem atualizar produtos"
    ON public.produtos FOR UPDATE
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS "Usuários autenticados podem deletar produtos" ON public.produtos;
CREATE POLICY "Usuários autenticados podem deletar produtos"
    ON public.produtos FOR DELETE
    TO authenticated
    USING (true);

-- Políticas para ESTOQUE_LOJAS
DROP POLICY IF EXISTS "Usuários autenticados podem ver estoque" ON public.estoque_lojas;
CREATE POLICY "Usuários autenticados podem ver estoque"
    ON public.estoque_lojas FOR SELECT
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS "Usuários autenticados podem criar estoque" ON public.estoque_lojas;
CREATE POLICY "Usuários autenticados podem criar estoque"
    ON public.estoque_lojas FOR INSERT
    TO authenticated
    WITH CHECK (true);

DROP POLICY IF EXISTS "Usuários autenticados podem atualizar estoque" ON public.estoque_lojas;
CREATE POLICY "Usuários autenticados podem atualizar estoque"
    ON public.estoque_lojas FOR UPDATE
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS "Usuários autenticados podem deletar estoque" ON public.estoque_lojas;
CREATE POLICY "Usuários autenticados podem deletar estoque"
    ON public.estoque_lojas FOR DELETE
    TO authenticated
    USING (true);

-- Políticas para HISTORICO_ESTOQUE
DROP POLICY IF EXISTS "Usuários autenticados podem ver histórico" ON public.historico_estoque;
CREATE POLICY "Usuários autenticados podem ver histórico"
    ON public.historico_estoque FOR SELECT
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS "Usuários autenticados podem criar histórico" ON public.historico_estoque;
CREATE POLICY "Usuários autenticados podem criar histórico"
    ON public.historico_estoque FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Políticas para FOTOS_PRODUTOS
DROP POLICY IF EXISTS "Usuários autenticados podem ver fotos" ON public.fotos_produtos;
CREATE POLICY "Usuários autenticados podem ver fotos"
    ON public.fotos_produtos FOR SELECT
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS "Usuários autenticados podem criar fotos" ON public.fotos_produtos;
CREATE POLICY "Usuários autenticados podem criar fotos"
    ON public.fotos_produtos FOR INSERT
    TO authenticated
    WITH CHECK (true);

DROP POLICY IF EXISTS "Usuários autenticados podem deletar fotos" ON public.fotos_produtos;
CREATE POLICY "Usuários autenticados podem deletar fotos"
    ON public.fotos_produtos FOR DELETE
    TO authenticated
    USING (true);

-- Políticas para HISTORICO_PRODUTOS
DROP POLICY IF EXISTS "Usuários autenticados podem ver histórico de produtos" ON public.historico_produtos;
CREATE POLICY "Usuários autenticados podem ver histórico de produtos"
    ON public.historico_produtos FOR SELECT
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS "Usuários autenticados podem criar histórico de produtos" ON public.historico_produtos;
CREATE POLICY "Usuários autenticados podem criar histórico de produtos"
    ON public.historico_produtos FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Políticas para HISTORICO_ESTOQUE
DROP POLICY IF EXISTS "Usuários autenticados podem ver histórico de estoque" ON public.historico_estoque;
CREATE POLICY "Usuários autenticados podem ver histórico de estoque"
    ON public.historico_estoque FOR SELECT
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS "Usuários autenticados podem criar histórico de estoque" ON public.historico_estoque;
CREATE POLICY "Usuários autenticados podem criar histórico de estoque"
    ON public.historico_estoque FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- ============================================
-- 8. STORAGE BUCKET PARA FOTOS
-- ============================================
-- Criar bucket (executar no Dashboard do Supabase ou via SDK)
-- Nome: fotos-produtos
-- Público: Sim (para leitura)

-- Política de storage (ajustar no Dashboard)
-- Permitir upload: authenticated users
-- Permitir leitura: public
-- Permitir delete: authenticated users (apenas suas próprias fotos)

-- ============================================
-- 9. DADOS INICIAIS E COMENTÁRIOS
-- ============================================

-- Comentários explicativos
COMMENT ON TABLE public.produtos IS 'Tabela principal de produtos';
COMMENT ON TABLE public.estoque_lojas IS 'Relação produto x loja com quantidade';
COMMENT ON TABLE public.historico_produtos IS 'Histórico de alterações em produtos (quem, quando, o quê)';
COMMENT ON TABLE public.historico_estoque IS 'Histórico de movimentações de estoque (quem, quando, quantidade)';

COMMENT ON COLUMN public.produtos.descricao IS 'Descrição do produto';
COMMENT ON COLUMN public.produtos.modelos IS 'Modelos disponíveis do produto';
COMMENT ON COLUMN public.produtos.marca IS 'Marca do produto';
COMMENT ON COLUMN public.produtos.preco_compra IS 'Preço de compra/custo';
COMMENT ON COLUMN public.produtos.preco_venda IS 'Preço de venda';
COMMENT ON COLUMN public.produtos.quantidade_minima IS 'Quantidade mínima em estoque (alerta)';

COMMENT ON COLUMN public.estoque_lojas.id_produto IS 'Referência ao produto';
COMMENT ON COLUMN public.estoque_lojas.id_loja IS 'Referência à loja';
COMMENT ON COLUMN public.estoque_lojas.quantidade IS 'Quantidade disponível nesta loja';

COMMENT ON COLUMN public.historico_produtos.campo_alterado IS 'Nome do campo que foi modificado';
COMMENT ON COLUMN public.historico_produtos.valor_anterior IS 'Valor antes da alteração';
COMMENT ON COLUMN public.historico_produtos.valor_novo IS 'Valor após a alteração';

COMMENT ON COLUMN public.historico_estoque.quantidade_alterada IS 'Diferença de quantidade (+ entrada, - saída)';
COMMENT ON COLUMN public.historico_estoque.quantidade_anterior IS 'Quantidade antes da movimentação';
COMMENT ON COLUMN public.historico_estoque.quantidade_nova IS 'Quantidade após a movimentação';

-- ============================================
-- FIM DO SCRIPT
-- ============================================

-- Para verificar se tudo foi criado corretamente:
-- SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND (tablename LIKE '%produto%' OR tablename LIKE '%estoque%' OR tablename LIKE '%historico%');
