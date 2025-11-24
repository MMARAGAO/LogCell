-- ============================================
-- ATUALIZAÇÃO DOS TRIGGERS - REGISTRAR USUÁRIO CORRETAMENTE
-- ============================================
-- Este script atualiza os triggers para capturar corretamente
-- o usuário que fez a alteração usando auth.uid()
-- ============================================

-- ============================================
-- TRIGGER: REGISTRAR HISTÓRICO DE PRODUTOS (ATUALIZADO)
-- ============================================
CREATE OR REPLACE FUNCTION registrar_historico_produtos()
RETURNS TRIGGER AS $$
DECLARE
    campo_nome VARCHAR(100);
    valor_antigo TEXT;
    valor_novo TEXT;
    v_usuario_id UUID;
BEGIN
    -- Capturar o usuário: priorizar criado_por/atualizado_por, depois auth.uid()
    IF TG_OP = 'INSERT' THEN
        v_usuario_id := COALESCE(NEW.criado_por, auth.uid());
    ELSIF TG_OP = 'UPDATE' THEN
        v_usuario_id := COALESCE(NEW.atualizado_por, NEW.criado_por, auth.uid());
    ELSIF TG_OP = 'DELETE' THEN
        v_usuario_id := COALESCE(OLD.atualizado_por, OLD.criado_por, auth.uid());
    END IF;
    
    IF (TG_OP = 'INSERT') THEN
        -- Registrar criação do produto
        INSERT INTO public.historico_produtos (
            produto_id, usuario_id, operacao, campo_alterado, valor_anterior, valor_novo
        ) VALUES (
            NEW.id, v_usuario_id, 'INSERT', 'produto_criado', NULL, 
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
            VALUES (NEW.id, v_usuario_id, 'UPDATE', 'descricao', OLD.descricao, NEW.descricao);
        END IF;
        
        IF OLD.modelos IS DISTINCT FROM NEW.modelos THEN
            INSERT INTO public.historico_produtos (produto_id, usuario_id, operacao, campo_alterado, valor_anterior, valor_novo)
            VALUES (NEW.id, v_usuario_id, 'UPDATE', 'modelos', OLD.modelos, NEW.modelos);
        END IF;
        
        IF OLD.marca IS DISTINCT FROM NEW.marca THEN
            INSERT INTO public.historico_produtos (produto_id, usuario_id, operacao, campo_alterado, valor_anterior, valor_novo)
            VALUES (NEW.id, v_usuario_id, 'UPDATE', 'marca', OLD.marca, NEW.marca);
        END IF;
        
        IF OLD.preco_compra IS DISTINCT FROM NEW.preco_compra THEN
            INSERT INTO public.historico_produtos (produto_id, usuario_id, operacao, campo_alterado, valor_anterior, valor_novo)
            VALUES (NEW.id, v_usuario_id, 'UPDATE', 'preco_compra', OLD.preco_compra::TEXT, NEW.preco_compra::TEXT);
        END IF;
        
        IF OLD.preco_venda IS DISTINCT FROM NEW.preco_venda THEN
            INSERT INTO public.historico_produtos (produto_id, usuario_id, operacao, campo_alterado, valor_anterior, valor_novo)
            VALUES (NEW.id, v_usuario_id, 'UPDATE', 'preco_venda', OLD.preco_venda::TEXT, NEW.preco_venda::TEXT);
        END IF;
        
        IF OLD.quantidade_minima IS DISTINCT FROM NEW.quantidade_minima THEN
            INSERT INTO public.historico_produtos (produto_id, usuario_id, operacao, campo_alterado, valor_anterior, valor_novo)
            VALUES (NEW.id, v_usuario_id, 'UPDATE', 'quantidade_minima', OLD.quantidade_minima::TEXT, NEW.quantidade_minima::TEXT);
        END IF;
        
        IF OLD.ativo IS DISTINCT FROM NEW.ativo THEN
            INSERT INTO public.historico_produtos (produto_id, usuario_id, operacao, campo_alterado, valor_anterior, valor_novo)
            VALUES (NEW.id, v_usuario_id, 'UPDATE', 'ativo', OLD.ativo::TEXT, NEW.ativo::TEXT);
        END IF;
        
        RETURN NEW;
    ELSIF (TG_OP = 'DELETE') THEN
        -- Registrar exclusão
        INSERT INTO public.historico_produtos (
            produto_id, usuario_id, operacao, campo_alterado, valor_anterior, valor_novo
        ) VALUES (
            OLD.id, v_usuario_id, 'DELETE', 'produto_deletado', 
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

-- ============================================
-- TRIGGER: REGISTRAR HISTÓRICO DE ESTOQUE (ATUALIZADO)
-- ============================================
CREATE OR REPLACE FUNCTION registrar_historico_estoque()
RETURNS TRIGGER AS $$
DECLARE
    v_usuario_id UUID;
BEGIN
    -- Capturar o usuário: priorizar atualizado_por, depois auth.uid()
    IF TG_OP = 'INSERT' THEN
        v_usuario_id := COALESCE(NEW.atualizado_por, auth.uid());
    ELSIF TG_OP = 'UPDATE' THEN
        v_usuario_id := COALESCE(NEW.atualizado_por, auth.uid());
    ELSIF TG_OP = 'DELETE' THEN
        v_usuario_id := COALESCE(OLD.atualizado_por, auth.uid());
    END IF;
    
    IF (TG_OP = 'INSERT') THEN
        -- Registrar criação de estoque
        INSERT INTO public.historico_estoque (
            id_produto, id_loja, usuario_id, 
            quantidade_anterior, quantidade_nova, quantidade_alterada, observacao
        ) VALUES (
            NEW.id_produto, NEW.id_loja, v_usuario_id,
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
            NEW.id_produto, NEW.id_loja, v_usuario_id,
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
            OLD.id_produto, OLD.id_loja, v_usuario_id,
            OLD.quantidade, 0, -OLD.quantidade,
            'Estoque removido/zerado'
        );
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- VERIFICAÇÃO
-- ============================================
-- Verificar se as funções foram criadas corretamente:
SELECT 
    proname as "Função",
    prosecdef as "Security Definer"
FROM pg_proc 
WHERE proname IN ('registrar_historico_produtos', 'registrar_historico_estoque');

-- ============================================
-- FIM DO SCRIPT
-- ============================================
-- Após executar este script:
-- 1. Os triggers vão capturar o usuário corretamente:
--    - PRIORIDADE 1: Campo atualizado_por/criado_por (passado pelo código)
--    - PRIORIDADE 2: auth.uid() (sessão autenticada)
-- 2. O nome do usuário aparecerá corretamente no histórico
-- 3. Teste fazendo uma nova alteração em um produto ou estoque
