-- =====================================================
-- TRIGGERS AUTOMÁTICOS PARA HISTÓRICO DE ORDEM DE SERVIÇO
-- =====================================================
-- Registra automaticamente no histórico quando:
-- - Fotos são adicionadas/removidas
-- - Peças são adicionadas/atualizadas
-- - Laudo técnico é preenchido/atualizado
-- - Quebras são registradas/aprovadas
-- =====================================================

-- =====================================================
-- 1. TRIGGER PARA FOTOS ADICIONADAS
-- =====================================================
CREATE OR REPLACE FUNCTION registrar_foto_adicionada()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO historico_ordem_servico (
        id_ordem_servico,
        tipo_evento,
        descricao,
        dados_novos,
        criado_por,
        criado_por_nome
    )
    SELECT 
        NEW.id_ordem_servico,
        'foto_adicionada',
        'Foto adicionada à ordem de serviço',
        jsonb_build_object(
            'foto_id', NEW.id,
            'url', NEW.url,
            'ordem', NEW.ordem,
            'is_principal', NEW.is_principal
        ),
        auth.uid(),
        u.nome
    FROM usuarios u
    WHERE u.id = auth.uid();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_foto_adicionada
    AFTER INSERT ON ordem_servico_fotos
    FOR EACH ROW
    EXECUTE FUNCTION registrar_foto_adicionada();

-- =====================================================
-- 2. TRIGGER PARA FOTOS REMOVIDAS
-- =====================================================
CREATE OR REPLACE FUNCTION registrar_foto_removida()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO historico_ordem_servico (
        id_ordem_servico,
        tipo_evento,
        descricao,
        dados_anteriores,
        criado_por,
        criado_por_nome
    )
    SELECT 
        OLD.id_ordem_servico,
        'foto_removida',
        'Foto removida da ordem de serviço',
        jsonb_build_object(
            'foto_id', OLD.id,
            'url', OLD.url,
            'ordem', OLD.ordem,
            'is_principal', OLD.is_principal
        ),
        auth.uid(),
        u.nome
    FROM usuarios u
    WHERE u.id = auth.uid();
    
    RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_foto_removida
    AFTER DELETE ON ordem_servico_fotos
    FOR EACH ROW
    EXECUTE FUNCTION registrar_foto_removida();

-- =====================================================
-- 3. TRIGGER PARA PEÇAS ADICIONADAS
-- =====================================================
CREATE OR REPLACE FUNCTION registrar_peca_adicionada()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO historico_ordem_servico (
        id_ordem_servico,
        tipo_evento,
        descricao,
        dados_novos,
        criado_por,
        criado_por_nome
    )
    SELECT 
        NEW.id_ordem_servico,
        'peca_adicionada',
        'Peça adicionada: ' || NEW.descricao_peca || ' (Qtd: ' || NEW.quantidade || ')',
        jsonb_build_object(
            'peca_id', NEW.id,
            'descricao', NEW.descricao_peca,
            'quantidade', NEW.quantidade,
            'tipo_produto', NEW.tipo_produto,
            'valor_venda', NEW.valor_venda,
            'valor_total', NEW.valor_total
        ),
        auth.uid(),
        u.nome
    FROM usuarios u
    WHERE u.id = auth.uid();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_peca_adicionada
    AFTER INSERT ON ordem_servico_pecas
    FOR EACH ROW
    EXECUTE FUNCTION registrar_peca_adicionada();

-- =====================================================
-- 4. TRIGGER PARA PEÇAS ATUALIZADAS
-- =====================================================
CREATE OR REPLACE FUNCTION registrar_peca_atualizada()
RETURNS TRIGGER AS $$
DECLARE
    mudancas text[];
BEGIN
    -- Verifica quais campos mudaram
    mudancas := ARRAY[]::text[];
    
    IF OLD.quantidade != NEW.quantidade THEN
        mudancas := array_append(mudancas, 'Quantidade: ' || OLD.quantidade || ' → ' || NEW.quantidade);
    END IF;
    
    IF OLD.valor_venda != NEW.valor_venda THEN
        mudancas := array_append(mudancas, 'Valor: R$ ' || OLD.valor_venda || ' → R$ ' || NEW.valor_venda);
    END IF;
    
    IF OLD.estoque_baixado != NEW.estoque_baixado THEN
        mudancas := array_append(mudancas, 
            CASE 
                WHEN NEW.estoque_baixado THEN 'Estoque baixado'
                ELSE 'Baixa de estoque cancelada'
            END
        );
    END IF;
    
    -- Se houve mudanças, registra no histórico
    IF array_length(mudancas, 1) > 0 THEN
        INSERT INTO historico_ordem_servico (
            id_ordem_servico,
            tipo_evento,
            descricao,
            dados_anteriores,
            dados_novos,
            criado_por,
            criado_por_nome
        )
        SELECT 
            NEW.id_ordem_servico,
            'peca_atualizada',
            'Peça atualizada: ' || NEW.descricao_peca || ' - ' || array_to_string(mudancas, ', '),
            jsonb_build_object(
                'peca_id', OLD.id,
                'quantidade', OLD.quantidade,
                'valor_venda', OLD.valor_venda,
                'estoque_baixado', OLD.estoque_baixado
            ),
            jsonb_build_object(
                'peca_id', NEW.id,
                'quantidade', NEW.quantidade,
                'valor_venda', NEW.valor_venda,
                'estoque_baixado', NEW.estoque_baixado
            ),
            auth.uid(),
            u.nome
        FROM usuarios u
        WHERE u.id = auth.uid();
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_peca_atualizada
    AFTER UPDATE ON ordem_servico_pecas
    FOR EACH ROW
    EXECUTE FUNCTION registrar_peca_atualizada();

-- =====================================================
-- 5. TRIGGER PARA PEÇAS REMOVIDAS
-- =====================================================
CREATE OR REPLACE FUNCTION registrar_peca_removida()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO historico_ordem_servico (
        id_ordem_servico,
        tipo_evento,
        descricao,
        dados_anteriores,
        criado_por,
        criado_por_nome
    )
    SELECT 
        OLD.id_ordem_servico,
        'peca_removida',
        'Peça removida: ' || OLD.descricao_peca || ' (Qtd: ' || OLD.quantidade || ')',
        jsonb_build_object(
            'peca_id', OLD.id,
            'descricao', OLD.descricao_peca,
            'quantidade', OLD.quantidade,
            'valor_total', OLD.valor_total
        ),
        auth.uid(),
        u.nome
    FROM usuarios u
    WHERE u.id = auth.uid();
    
    RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_peca_removida
    AFTER DELETE ON ordem_servico_pecas
    FOR EACH ROW
    EXECUTE FUNCTION registrar_peca_removida();

-- =====================================================
-- 6. TRIGGER PARA LAUDO TÉCNICO PREENCHIDO/ATUALIZADO
-- =====================================================
CREATE OR REPLACE FUNCTION registrar_laudo_atualizado()
RETURNS TRIGGER AS $$
DECLARE
    mudancas text[];
    evento text;
    descr text;
    v_usuario_nome text;
BEGIN
    mudancas := ARRAY[]::text[];
    
    -- Buscar nome do usuário (ou usar 'Sistema' se não encontrar)
    SELECT nome INTO v_usuario_nome
    FROM usuarios
    WHERE id = auth.uid();
    
    IF v_usuario_nome IS NULL THEN
        v_usuario_nome := 'Sistema';
    END IF;
    
    -- Verifica se é preenchimento inicial ou atualização
    IF OLD.laudo_diagnostico IS NULL AND NEW.laudo_diagnostico IS NOT NULL THEN
        evento := 'laudo_preenchido';
        descr := 'Laudo técnico preenchido';
    ELSE
        evento := 'laudo_atualizado';
        
        -- Identifica campos que mudaram
        IF COALESCE(OLD.laudo_diagnostico, '') != COALESCE(NEW.laudo_diagnostico, '') THEN
            mudancas := array_append(mudancas, 'Diagnóstico');
        END IF;
        
        IF COALESCE(OLD.laudo_causa, '') != COALESCE(NEW.laudo_causa, '') THEN
            mudancas := array_append(mudancas, 'Causa');
        END IF;
        
        IF COALESCE(OLD.laudo_procedimentos, '') != COALESCE(NEW.laudo_procedimentos, '') THEN
            mudancas := array_append(mudancas, 'Procedimentos');
        END IF;
        
        IF COALESCE(OLD.laudo_recomendacoes, '') != COALESCE(NEW.laudo_recomendacoes, '') THEN
            mudancas := array_append(mudancas, 'Recomendações');
        END IF;
        
        IF COALESCE(OLD.laudo_condicao_final, '') != COALESCE(NEW.laudo_condicao_final, '') THEN
            mudancas := array_append(mudancas, 'Condição Final');
        END IF;
        
        IF OLD.laudo_garantia_dias != NEW.laudo_garantia_dias THEN
            mudancas := array_append(mudancas, 'Garantia: ' || OLD.laudo_garantia_dias || ' → ' || NEW.laudo_garantia_dias || ' dias');
        END IF;
        
        descr := 'Laudo técnico atualizado: ' || array_to_string(mudancas, ', ');
    END IF;
    
    -- Se houve mudanças relevantes, registra
    IF array_length(mudancas, 1) > 0 OR evento = 'laudo_preenchido' THEN
        INSERT INTO historico_ordem_servico (
            id_ordem_servico,
            tipo_evento,
            descricao,
            dados_anteriores,
            dados_novos,
            criado_por,
            criado_por_nome
        ) VALUES (
            NEW.id,
            evento,
            descr,
            CASE 
                WHEN evento = 'laudo_atualizado' THEN
                    jsonb_build_object(
                        'diagnostico', OLD.laudo_diagnostico,
                        'causa', OLD.laudo_causa,
                        'procedimentos', OLD.laudo_procedimentos,
                        'recomendacoes', OLD.laudo_recomendacoes,
                        'garantia_dias', OLD.laudo_garantia_dias,
                        'condicao_final', OLD.laudo_condicao_final
                    )
                ELSE NULL
            END,
            jsonb_build_object(
                'diagnostico', NEW.laudo_diagnostico,
                'causa', NEW.laudo_causa,
                'procedimentos', NEW.laudo_procedimentos,
                'recomendacoes', NEW.laudo_recomendacoes,
                'garantia_dias', NEW.laudo_garantia_dias,
                'condicao_final', NEW.laudo_condicao_final
            ),
            auth.uid(),
            v_usuario_nome
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_laudo_atualizado
    AFTER UPDATE ON ordem_servico
    FOR EACH ROW
    WHEN (
        NEW.laudo_diagnostico IS DISTINCT FROM OLD.laudo_diagnostico OR
        NEW.laudo_causa IS DISTINCT FROM OLD.laudo_causa OR
        NEW.laudo_procedimentos IS DISTINCT FROM OLD.laudo_procedimentos OR
        NEW.laudo_recomendacoes IS DISTINCT FROM OLD.laudo_recomendacoes OR
        NEW.laudo_garantia_dias IS DISTINCT FROM OLD.laudo_garantia_dias OR
        NEW.laudo_condicao_final IS DISTINCT FROM OLD.laudo_condicao_final
    )
    EXECUTE FUNCTION registrar_laudo_atualizado();

-- =====================================================
-- 7. TRIGGER PARA QUEBRA REGISTRADA
-- =====================================================
CREATE OR REPLACE FUNCTION registrar_quebra_registrada()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO historico_ordem_servico (
        id_ordem_servico,
        tipo_evento,
        descricao,
        dados_novos,
        criado_por,
        criado_por_nome
    )
    SELECT 
        NEW.id_ordem_servico,
        'quebra_registrada',
        'Quebra registrada: ' || p.descricao || ' (Qtd: ' || NEW.quantidade || ') - ' || NEW.tipo_ocorrencia,
        jsonb_build_object(
            'quebra_id', NEW.id,
            'produto_id', NEW.id_produto,
            'produto_nome', p.descricao,
            'quantidade', NEW.quantidade,
            'tipo_ocorrencia', NEW.tipo_ocorrencia,
            'motivo', NEW.motivo,
            'responsavel', NEW.responsavel,
            'descontar_tecnico', NEW.descontar_tecnico
        ),
        auth.uid(),
        u.nome
    FROM produtos p
    LEFT JOIN usuarios u ON u.id = auth.uid()
    WHERE p.id = NEW.id_produto;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_quebra_registrada
    AFTER INSERT ON quebra_pecas
    FOR EACH ROW
    EXECUTE FUNCTION registrar_quebra_registrada();

-- =====================================================
-- 8. TRIGGER PARA QUEBRA APROVADA/REPROVADA
-- =====================================================
CREATE OR REPLACE FUNCTION registrar_quebra_aprovada()
RETURNS TRIGGER AS $$
DECLARE
    status_texto text;
    evento text;
BEGIN
    -- Só registra se o status de aprovação mudou
    IF OLD.aprovado IS DISTINCT FROM NEW.aprovado THEN
        IF NEW.aprovado THEN
            status_texto := 'aprovada';
            evento := 'quebra_aprovada';
        ELSE
            status_texto := 'reprovada';
            evento := 'quebra_reprovada';
        END IF;
        
        INSERT INTO historico_ordem_servico (
            id_ordem_servico,
            tipo_evento,
            descricao,
            dados_anteriores,
            dados_novos,
            criado_por,
            criado_por_nome
        )
        SELECT 
            NEW.id_ordem_servico,
            evento,
            'Quebra ' || status_texto || ': ' || p.descricao || ' (Qtd: ' || NEW.quantidade || ')',
            jsonb_build_object(
                'quebra_id', OLD.id,
                'aprovado', OLD.aprovado,
                'aprovado_em', OLD.aprovado_em
            ),
            jsonb_build_object(
                'quebra_id', NEW.id,
                'produto_nome', p.descricao,
                'quantidade', NEW.quantidade,
                'aprovado', NEW.aprovado,
                'aprovado_em', NEW.aprovado_em,
                'aprovado_por', NEW.aprovado_por,
                'observacao_aprovacao', NEW.observacao_aprovacao
            ),
            NEW.aprovado_por,
            u.nome
        FROM produtos p
        LEFT JOIN usuarios u ON u.id = NEW.aprovado_por
        WHERE p.id = NEW.id_produto;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_quebra_aprovada
    AFTER UPDATE ON quebra_pecas
    FOR EACH ROW
    WHEN (OLD.aprovado IS DISTINCT FROM NEW.aprovado)
    EXECUTE FUNCTION registrar_quebra_aprovada();

-- =====================================================
-- VERIFICAR TRIGGERS CRIADOS
-- =====================================================
SELECT 
    t.tgname AS trigger_name,
    c.relname AS table_name,
    p.proname AS function_name,
    CASE 
        WHEN t.tgtype & 2 = 2 THEN 'BEFORE'
        WHEN t.tgtype & 64 = 64 THEN 'INSTEAD OF'
        ELSE 'AFTER'
    END AS trigger_timing,
    CASE 
        WHEN t.tgtype & 4 = 4 THEN 'INSERT'
        WHEN t.tgtype & 8 = 8 THEN 'DELETE'
        WHEN t.tgtype & 16 = 16 THEN 'UPDATE'
        ELSE 'UNKNOWN'
    END AS trigger_event,
    t.tgenabled AS is_enabled
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE c.relname IN (
    'ordem_servico',
    'ordem_servico_pecas',
    'ordem_servico_fotos',
    'quebra_pecas'
)
AND NOT t.tgisinternal
AND p.proname LIKE 'registrar_%'
ORDER BY c.relname, t.tgname;
