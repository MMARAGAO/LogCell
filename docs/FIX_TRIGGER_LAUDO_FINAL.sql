-- =====================================================
-- CORRIGIR FUNÇÃO DO TRIGGER LAUDO (VERSÃO FINAL)
-- =====================================================

CREATE OR REPLACE FUNCTION public.registrar_laudo_atualizado()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
    mudancas text[];
    evento text;
    descr text;
    v_usuario_nome text;
BEGIN
    mudancas := ARRAY[]::text[];
    
    -- Buscar nome do usuário (ANTES do IF/ELSE)
    SELECT nome INTO v_usuario_nome
    FROM usuarios
    WHERE id = auth.uid();
    
    -- Se não encontrar, usar 'Sistema'
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
        
        IF OLD.laudo_garantia_dias IS DISTINCT FROM NEW.laudo_garantia_dias THEN
            mudancas := array_append(mudancas, 'Garantia: ' || COALESCE(OLD.laudo_garantia_dias::text, 'NULL') || ' → ' || COALESCE(NEW.laudo_garantia_dias::text, 'NULL') || ' dias');
        END IF;
        
        descr := 'Laudo técnico atualizado: ' || array_to_string(mudancas, ', ');
    END IF;
    
    -- Se houve mudanças relevantes, registra (AGORA USA VALUES AO INVÉS DE SELECT)
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
EXCEPTION WHEN OTHERS THEN
    -- Log de erro (aparece nos logs do Supabase)
    RAISE WARNING 'Erro no trigger registrar_laudo_atualizado: %', SQLERRM;
    RETURN NEW; -- Continua mesmo com erro para não bloquear o UPDATE
END;
$function$;

-- Verificar se foi atualizado
SELECT 
    p.proname,
    pg_get_functiondef(p.oid) AS function_definition
FROM pg_proc p
WHERE p.proname = 'registrar_laudo_atualizado';

-- AGORA TESTE: Vá no sistema e modifique o laudo de uma OS
