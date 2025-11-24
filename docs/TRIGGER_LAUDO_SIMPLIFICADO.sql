-- =====================================================
-- TRIGGER SIMPLIFICADO PARA TESTE
-- =====================================================
-- Este é um trigger mais simples para testar se o problema
-- é com a lógica complexa ou com o trigger em si

-- Remover trigger existente se houver
DROP TRIGGER IF EXISTS trigger_laudo_atualizado ON ordem_servico;

-- Criar função simplificada
CREATE OR REPLACE FUNCTION registrar_laudo_atualizado()
RETURNS TRIGGER AS $$
DECLARE
    v_usuario_nome text;
    v_descricao text;
BEGIN
    -- Buscar nome do usuário
    SELECT nome INTO v_usuario_nome
    FROM usuarios
    WHERE id = auth.uid();
    
    -- Se não encontrar, usar 'Sistema'
    IF v_usuario_nome IS NULL THEN
        v_usuario_nome := 'Sistema';
    END IF;
    
    -- Criar descrição simples
    v_descricao := 'Laudo técnico modificado';
    
    -- Inserir no histórico
    INSERT INTO historico_ordem_servico (
        id_ordem_servico,
        tipo_evento,
        descricao,
        criado_por,
        criado_por_nome
    ) VALUES (
        NEW.id,
        'laudo_atualizado',
        v_descricao,
        auth.uid(),
        v_usuario_nome
    );
    
    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    -- Log do erro (aparecerá nos logs do Supabase)
    RAISE WARNING 'Erro no trigger laudo: %', SQLERRM;
    RETURN NEW; -- Continua mesmo com erro
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar trigger
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

-- Verificar se foi criado
SELECT 
    t.tgname AS trigger_name,
    t.tgenabled AS is_enabled,
    p.proname AS function_name
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE c.relname = 'ordem_servico'
    AND p.proname = 'registrar_laudo_atualizado';

-- AGORA TESTE: Faça um UPDATE em qualquer campo do laudo e veja se registra
