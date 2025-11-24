-- =====================================================
-- CORRIGIR TRIGGERS DE QUEBRA (VERSÃO CORRIGIDA)
-- =====================================================

-- =====================================================
-- 1. TRIGGER PARA QUEBRA REGISTRADA
-- =====================================================
DROP TRIGGER IF EXISTS trigger_quebra_registrada ON quebra_pecas;

CREATE OR REPLACE FUNCTION registrar_quebra_registrada()
RETURNS TRIGGER AS $$
DECLARE
    v_usuario_nome text;
    v_produto_nome text;
BEGIN
    -- Buscar nome do técnico que criou (campo criado_por na quebra_pecas)
    IF NEW.criado_por IS NOT NULL THEN
        -- Primeiro tenta buscar na tabela usuarios
        SELECT nome INTO v_usuario_nome
        FROM usuarios
        WHERE id = NEW.criado_por;
        
        -- Se não encontrar em usuarios, busca em tecnicos
        IF v_usuario_nome IS NULL THEN
            SELECT nome INTO v_usuario_nome
            FROM tecnicos
            WHERE usuario_id = NEW.criado_por;
        END IF;
    END IF;
    
    -- Se ainda não encontrou, usa 'Sistema'
    IF v_usuario_nome IS NULL THEN
        v_usuario_nome := 'Sistema';
    END IF;
    
    -- Buscar nome do produto (se existir - pode ser peça externa)
    IF NEW.id_produto IS NOT NULL THEN
        SELECT descricao INTO v_produto_nome
        FROM produtos
        WHERE id = NEW.id_produto;
    ELSE
        -- Para peças externas, buscar da ordem_servico_pecas
        SELECT descricao_peca INTO v_produto_nome
        FROM ordem_servico_pecas
        WHERE id_ordem_servico = NEW.id_ordem_servico
        LIMIT 1;
        
        IF v_produto_nome IS NULL THEN
            v_produto_nome := 'Peça externa';
        END IF;
    END IF;
    
    -- Inserir no histórico
    INSERT INTO historico_ordem_servico (
        id_ordem_servico,
        tipo_evento,
        descricao,
        dados_novos,
        criado_por,
        criado_por_nome
    ) VALUES (
        NEW.id_ordem_servico,
        'quebra_registrada',
        'Quebra registrada: ' || v_produto_nome || ' (Qtd: ' || NEW.quantidade || ') - ' || NEW.tipo_ocorrencia,
        jsonb_build_object(
            'quebra_id', NEW.id,
            'produto_id', NEW.id_produto,
            'produto_nome', v_produto_nome,
            'quantidade', NEW.quantidade,
            'tipo_ocorrencia', NEW.tipo_ocorrencia,
            'motivo', NEW.motivo,
            'responsavel', NEW.responsavel,
            'descontar_tecnico', NEW.descontar_tecnico
        ),
        NEW.criado_por,
        v_usuario_nome
    );
    
    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Erro no trigger registrar_quebra_registrada: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_quebra_registrada
    AFTER INSERT ON quebra_pecas
    FOR EACH ROW
    EXECUTE FUNCTION registrar_quebra_registrada();

-- =====================================================
-- 2. TRIGGER PARA QUEBRA APROVADA/REPROVADA
-- =====================================================
DROP TRIGGER IF EXISTS trigger_quebra_aprovada ON quebra_pecas;

CREATE OR REPLACE FUNCTION registrar_quebra_aprovada()
RETURNS TRIGGER AS $$
DECLARE
    v_usuario_nome text;
    v_produto_nome text;
    status_texto text;
    evento text;
BEGIN
    -- Só registra se o status de aprovação mudou
    IF OLD.aprovado IS DISTINCT FROM NEW.aprovado THEN
        -- Buscar nome do usuário que aprovou
        IF NEW.aprovado_por IS NOT NULL THEN
            SELECT nome INTO v_usuario_nome
            FROM usuarios
            WHERE id = NEW.aprovado_por;
        END IF;
        
        IF v_usuario_nome IS NULL THEN
            v_usuario_nome := 'Sistema';
        END IF;
        
        -- Buscar nome do produto
        IF NEW.id_produto IS NOT NULL THEN
            SELECT descricao INTO v_produto_nome
            FROM produtos
            WHERE id = NEW.id_produto;
        ELSE
            -- Para peças externas
            SELECT descricao_peca INTO v_produto_nome
            FROM ordem_servico_pecas
            WHERE id_ordem_servico = NEW.id_ordem_servico
            LIMIT 1;
            
            IF v_produto_nome IS NULL THEN
                v_produto_nome := 'Peça externa';
            END IF;
        END IF;
        
        -- Definir status e evento
        IF NEW.aprovado THEN
            status_texto := 'aprovada';
            evento := 'quebra_aprovada';
        ELSE
            status_texto := 'reprovada';
            evento := 'quebra_reprovada';
        END IF;
        
        -- Inserir no histórico
        INSERT INTO historico_ordem_servico (
            id_ordem_servico,
            tipo_evento,
            descricao,
            dados_anteriores,
            dados_novos,
            criado_por,
            criado_por_nome
        ) VALUES (
            NEW.id_ordem_servico,
            evento,
            'Quebra ' || status_texto || ': ' || v_produto_nome || ' (Qtd: ' || NEW.quantidade || ')',
            jsonb_build_object(
                'quebra_id', OLD.id,
                'aprovado', OLD.aprovado,
                'aprovado_em', OLD.aprovado_em
            ),
            jsonb_build_object(
                'quebra_id', NEW.id,
                'produto_nome', v_produto_nome,
                'quantidade', NEW.quantidade,
                'aprovado', NEW.aprovado,
                'aprovado_em', NEW.aprovado_em,
                'aprovado_por', NEW.aprovado_por,
                'observacao_aprovacao', NEW.observacao_aprovacao
            ),
            NEW.aprovado_por,
            v_usuario_nome
        );
    END IF;
    
    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Erro no trigger registrar_quebra_aprovada: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_quebra_aprovada
    AFTER UPDATE ON quebra_pecas
    FOR EACH ROW
    WHEN (OLD.aprovado IS DISTINCT FROM NEW.aprovado)
    EXECUTE FUNCTION registrar_quebra_aprovada();

-- =====================================================
-- VERIFICAR SE FORAM CRIADOS
-- =====================================================
SELECT 
    t.tgname AS trigger_name,
    t.tgenabled AS is_enabled,
    p.proname AS function_name
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE c.relname = 'quebra_pecas'
    AND p.proname IN ('registrar_quebra_registrada', 'registrar_quebra_aprovada')
ORDER BY t.tgname;

-- AGORA TESTE: Registre e aprove uma quebra
