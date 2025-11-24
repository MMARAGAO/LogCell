-- =====================================================
-- SISTEMA DE NOTIFICAÇÕES E ALERTAS
-- =====================================================
-- Cria sistema completo de notificações por usuário
-- com controle de leitura e tipos de alertas

-- 1. Criar tabela de notificações
CREATE TABLE IF NOT EXISTS public.notificacoes (
    id SERIAL PRIMARY KEY,
    tipo VARCHAR(50) NOT NULL, -- 'estoque_baixo', 'estoque_zerado', 'estoque_reposto', 'sistema', 'produto_inativo'
    titulo VARCHAR(255) NOT NULL,
    mensagem TEXT NOT NULL,
    
    -- Referências (opcional - para vincular a produtos/lojas)
    produto_id UUID REFERENCES public.produtos(id) ON DELETE CASCADE,
    loja_id INTEGER REFERENCES public.lojas(id) ON DELETE CASCADE,
    
    -- Metadados
    dados_extras JSONB, -- Para armazenar informações adicionais (quantidade, etc)
    
    -- Controle
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expira_em TIMESTAMP WITH TIME ZONE, -- Para notificações que expiram
    
    -- Índices para melhor performance
    CONSTRAINT tipo_valido CHECK (tipo IN ('estoque_baixo', 'estoque_zerado', 'estoque_reposto', 'sistema', 'produto_inativo'))
);

-- 2. Criar tabela de leitura de notificações (quem viu o quê)
CREATE TABLE IF NOT EXISTS public.notificacoes_usuarios (
    id SERIAL PRIMARY KEY,
    notificacao_id INTEGER NOT NULL REFERENCES public.notificacoes(id) ON DELETE CASCADE,
    usuario_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
    
    -- Controle de leitura
    lida BOOLEAN DEFAULT FALSE,
    lida_em TIMESTAMP WITH TIME ZONE,
    
    -- Controle
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Garantir que cada usuário tem apenas um registro por notificação
    UNIQUE(notificacao_id, usuario_id)
);

-- 3. Criar tabela de controle de alertas de estoque (evitar duplicatas)
CREATE TABLE IF NOT EXISTS public.alertas_estoque_controle (
    id SERIAL PRIMARY KEY,
    produto_id UUID NOT NULL REFERENCES public.produtos(id) ON DELETE CASCADE,
    loja_id INTEGER NOT NULL REFERENCES public.lojas(id) ON DELETE CASCADE,
    
    -- Estado do alerta
    estado VARCHAR(50) NOT NULL, -- 'baixo', 'zerado', 'normal'
    quantidade_atual INTEGER NOT NULL,
    quantidade_minima INTEGER NOT NULL,
    
    -- Controle
    ultimo_alerta_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Garantir um controle por produto/loja
    UNIQUE(produto_id, loja_id),
    
    CONSTRAINT estado_valido CHECK (estado IN ('baixo', 'zerado', 'normal'))
);

-- 4. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_notificacoes_tipo ON public.notificacoes(tipo);
CREATE INDEX IF NOT EXISTS idx_notificacoes_criado_em ON public.notificacoes(criado_em DESC);
CREATE INDEX IF NOT EXISTS idx_notificacoes_produto_id ON public.notificacoes(produto_id);
CREATE INDEX IF NOT EXISTS idx_notificacoes_loja_id ON public.notificacoes(loja_id);

CREATE INDEX IF NOT EXISTS idx_notificacoes_usuarios_usuario_id ON public.notificacoes_usuarios(usuario_id);
CREATE INDEX IF NOT EXISTS idx_notificacoes_usuarios_lida ON public.notificacoes_usuarios(lida);
CREATE INDEX IF NOT EXISTS idx_notificacoes_usuarios_notificacao_id ON public.notificacoes_usuarios(notificacao_id);

CREATE INDEX IF NOT EXISTS idx_alertas_controle_produto_loja ON public.alertas_estoque_controle(produto_id, loja_id);
CREATE INDEX IF NOT EXISTS idx_alertas_controle_estado ON public.alertas_estoque_controle(estado);

-- 5. Função para criar notificação de estoque baixo/zerado
CREATE OR REPLACE FUNCTION public.criar_notificacao_estoque(
    p_produto_id UUID,
    p_loja_id INTEGER,
    p_quantidade INTEGER,
    p_quantidade_minima INTEGER
)
RETURNS void AS $$
DECLARE
    v_produto_nome TEXT;
    v_loja_nome TEXT;
    v_estado_atual TEXT;
    v_estado_anterior TEXT;
    v_notificacao_id INTEGER;
    v_tipo TEXT;
    v_titulo TEXT;
    v_mensagem TEXT;
BEGIN
    -- Buscar informações do produto e loja (com tratamento de NULL)
    SELECT descricao INTO v_produto_nome FROM public.produtos WHERE id = p_produto_id;
    SELECT nome INTO v_loja_nome FROM public.lojas WHERE id = p_loja_id;
    
    -- Se não encontrou produto ou loja, sair
    IF v_produto_nome IS NULL OR v_loja_nome IS NULL THEN
        RETURN;
    END IF;
    
    -- Determinar estado atual
    IF p_quantidade = 0 THEN
        v_estado_atual := 'zerado';
    ELSIF p_quantidade <= p_quantidade_minima THEN
        v_estado_atual := 'baixo';
    ELSE
        v_estado_atual := 'normal';
    END IF;
    
    -- Verificar estado anterior
    SELECT estado INTO v_estado_anterior 
    FROM public.alertas_estoque_controle
    WHERE produto_id = p_produto_id AND loja_id = p_loja_id;
    
    -- Se não mudou de estado, não fazer nada
    IF v_estado_anterior = v_estado_atual THEN
        RETURN;
    END IF;
    
    -- Se voltou ao normal (estoque reposto), criar notificação de reposição
    IF v_estado_anterior IN ('baixo', 'zerado') AND v_estado_atual = 'normal' THEN
        v_tipo := 'estoque_reposto';
        v_titulo := 'Estoque Reposto';
        v_mensagem := format('O estoque de "%s" foi reposto na loja "%s". Quantidade atual: %s unidades.',
            v_produto_nome, v_loja_nome, p_quantidade);
    
    -- Se ficou baixo ou zerado, criar notificação de alerta
    ELSIF v_estado_atual = 'zerado' THEN
        v_tipo := 'estoque_zerado';
        v_titulo := 'Estoque Zerado';
        v_mensagem := format('O produto "%s" está sem estoque na loja "%s"!',
            v_produto_nome, v_loja_nome);
    
    ELSIF v_estado_atual = 'baixo' THEN
        v_tipo := 'estoque_baixo';
        v_titulo := 'Estoque Baixo';
        v_mensagem := format('O estoque de "%s" está baixo na loja "%s". Quantidade atual: %s (mínimo: %s).',
            v_produto_nome, v_loja_nome, p_quantidade, p_quantidade_minima);
    ELSE
        -- Nenhuma notificação necessária
        RETURN;
    END IF;
    
    -- Criar notificação (com tratamento de erro)
    BEGIN
        INSERT INTO public.notificacoes (
            tipo, titulo, mensagem, produto_id, loja_id,
            dados_extras
        )
        VALUES (
            v_tipo, v_titulo, v_mensagem, p_produto_id, p_loja_id,
            jsonb_build_object(
                'quantidade', p_quantidade,
                'quantidade_minima', p_quantidade_minima,
                'estado', v_estado_atual
            )
        )
        RETURNING id INTO v_notificacao_id;
        
        -- Criar registros para todos os usuários ativos
        INSERT INTO public.notificacoes_usuarios (notificacao_id, usuario_id)
        SELECT v_notificacao_id, id
        FROM public.usuarios
        WHERE ativo = true;
        
    EXCEPTION
        WHEN OTHERS THEN
            RAISE WARNING 'Erro ao criar notificação: %', SQLERRM;
            RETURN;
    END;
    
    -- Atualizar ou inserir controle de alerta
    INSERT INTO public.alertas_estoque_controle (
        produto_id, loja_id, estado, quantidade_atual, quantidade_minima
    )
    VALUES (
        p_produto_id, p_loja_id, v_estado_atual, p_quantidade, p_quantidade_minima
    )
    ON CONFLICT (produto_id, loja_id)
    DO UPDATE SET
        estado = v_estado_atual,
        quantidade_atual = p_quantidade,
        quantidade_minima = p_quantidade_minima,
        ultimo_alerta_em = NOW(),
        atualizado_em = NOW();
        
EXCEPTION
    WHEN OTHERS THEN
        -- Se houver qualquer erro, apenas logar mas não interromper a operação
        RAISE WARNING 'Erro geral em criar_notificacao_estoque: %', SQLERRM;
        RETURN;
END;
$$ LANGUAGE plpgsql;

-- 6. Trigger para monitorar mudanças no estoque
CREATE OR REPLACE FUNCTION public.trigger_verificar_estoque()
RETURNS TRIGGER AS $$
DECLARE
    v_quantidade_minima INTEGER;
BEGIN
    -- Buscar quantidade mínima do produto (com tratamento de erro)
    BEGIN
        SELECT quantidade_minima INTO v_quantidade_minima 
        FROM public.produtos 
        WHERE id = NEW.id_produto;
        
        -- Se não encontrou o produto ou quantidade_minima é NULL/0, não fazer nada
        IF v_quantidade_minima IS NULL OR v_quantidade_minima = 0 THEN
            RETURN NEW;
        END IF;
        
        -- Chamar função de notificação
        PERFORM public.criar_notificacao_estoque(
            NEW.id_produto,
            NEW.id_loja,
            NEW.quantidade,
            v_quantidade_minima
        );
        
    EXCEPTION
        WHEN OTHERS THEN
            -- Log do erro mas não interrompe a operação
            RAISE WARNING 'Erro ao verificar estoque para notificação: %', SQLERRM;
    END;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. Criar trigger na tabela de estoque
DROP TRIGGER IF EXISTS trigger_alerta_estoque ON public.estoque_lojas;
CREATE TRIGGER trigger_alerta_estoque
    AFTER INSERT OR UPDATE OF quantidade
    ON public.estoque_lojas
    FOR EACH ROW
    EXECUTE FUNCTION public.trigger_verificar_estoque();

-- 8. Função para marcar notificação como lida
CREATE OR REPLACE FUNCTION public.marcar_notificacao_lida(
    p_notificacao_id INTEGER,
    p_usuario_id UUID
)
RETURNS void AS $$
BEGIN
    UPDATE public.notificacoes_usuarios
    SET lida = true,
        lida_em = NOW()
    WHERE notificacao_id = p_notificacao_id
    AND usuario_id = p_usuario_id;
END;
$$ LANGUAGE plpgsql;

-- 9. Função para marcar todas notificações como lidas
CREATE OR REPLACE FUNCTION public.marcar_todas_notificacoes_lidas(
    p_usuario_id UUID
)
RETURNS void AS $$
BEGIN
    UPDATE public.notificacoes_usuarios
    SET lida = true,
        lida_em = NOW()
    WHERE usuario_id = p_usuario_id
    AND lida = false;
END;
$$ LANGUAGE plpgsql;

-- 10. Função para buscar notificações do usuário
CREATE OR REPLACE FUNCTION public.obter_notificacoes_usuario(
    p_usuario_id UUID,
    p_apenas_nao_lidas BOOLEAN DEFAULT false,
    p_limite INTEGER DEFAULT 50
)
RETURNS TABLE (
    id INTEGER,
    tipo VARCHAR(50),
    titulo VARCHAR(255),
    mensagem TEXT,
    produto_id UUID,
    loja_id INTEGER,
    dados_extras JSONB,
    criado_em TIMESTAMP WITH TIME ZONE,
    lida BOOLEAN,
    lida_em TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        n.id,
        n.tipo,
        n.titulo,
        n.mensagem,
        n.produto_id,
        n.loja_id,
        n.dados_extras,
        n.criado_em,
        nu.lida,
        nu.lida_em
    FROM public.notificacoes n
    INNER JOIN public.notificacoes_usuarios nu ON nu.notificacao_id = n.id
    WHERE nu.usuario_id = p_usuario_id
    AND (p_apenas_nao_lidas = false OR nu.lida = false)
    AND (n.expira_em IS NULL OR n.expira_em > NOW())
    ORDER BY n.criado_em DESC
    LIMIT p_limite;
END;
$$ LANGUAGE plpgsql;

-- 11. Função para contar notificações não lidas
CREATE OR REPLACE FUNCTION public.contar_notificacoes_nao_lidas(
    p_usuario_id UUID
)
RETURNS INTEGER AS $$
DECLARE
    v_count INTEGER;
BEGIN
    SELECT COUNT(*)
    INTO v_count
    FROM public.notificacoes n
    INNER JOIN public.notificacoes_usuarios nu ON nu.notificacao_id = n.id
    WHERE nu.usuario_id = p_usuario_id
    AND nu.lida = false
    AND (n.expira_em IS NULL OR n.expira_em > NOW());
    
    RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- 12. Habilitar RLS
ALTER TABLE public.notificacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notificacoes_usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alertas_estoque_controle ENABLE ROW LEVEL SECURITY;

-- 13. Políticas RLS para notificações
-- Remover políticas existentes se houver
DROP POLICY IF EXISTS "Usuários podem ver suas próprias notificações" ON public.notificacoes_usuarios;
DROP POLICY IF EXISTS "Usuários podem atualizar suas próprias notificações" ON public.notificacoes_usuarios;
DROP POLICY IF EXISTS "Todos podem ver notificações" ON public.notificacoes;
DROP POLICY IF EXISTS "Sistema pode criar notificações" ON public.notificacoes;

-- Criar políticas
CREATE POLICY "Usuários podem ver suas próprias notificações"
    ON public.notificacoes_usuarios
    FOR SELECT
    USING (usuario_id = auth.uid());

CREATE POLICY "Usuários podem atualizar suas próprias notificações"
    ON public.notificacoes_usuarios
    FOR UPDATE
    USING (usuario_id = auth.uid());

CREATE POLICY "Todos podem ver notificações"
    ON public.notificacoes
    FOR SELECT
    USING (true);

CREATE POLICY "Sistema pode criar notificações"
    ON public.notificacoes
    FOR INSERT
    WITH CHECK (true);

-- 14. Política para controle de alertas
DROP POLICY IF EXISTS "Todos podem ver controle de alertas" ON public.alertas_estoque_controle;
DROP POLICY IF EXISTS "Sistema pode gerenciar controle de alertas" ON public.alertas_estoque_controle;

CREATE POLICY "Todos podem ver controle de alertas"
    ON public.alertas_estoque_controle
    FOR SELECT
    USING (true);

CREATE POLICY "Sistema pode gerenciar controle de alertas"
    ON public.alertas_estoque_controle
    FOR ALL
    USING (true);

-- =====================================================
-- FINALIZAÇÃO
-- =====================================================

-- Verificar instalação
DO $$ 
BEGIN 
    RAISE NOTICE '✅ Sistema de notificações instalado com sucesso!'; 
    RAISE NOTICE '📊 Tabelas criadas: notificacoes, notificacoes_usuarios, alertas_estoque_controle';
    RAISE NOTICE '🔔 Trigger de monitoramento de estoque ativo';
    RAISE NOTICE '🔒 RLS habilitado para segurança';
END $$;
