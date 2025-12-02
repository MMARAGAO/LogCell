-- =====================================================
-- CORRIGIR TRIGGER: Evitar duplicação de histórico
-- Problema: Quando faz venda, registra "ajuste" + "venda"
-- Solução: Não registrar ajuste se já existe registro recente
-- =====================================================

CREATE OR REPLACE FUNCTION public.registrar_historico_ajuste_manual()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    v_usuario_id UUID;
    v_tem_registro_recente BOOLEAN;
BEGIN
    -- Capturar o usuário autenticado
    v_usuario_id := COALESCE(
        NEW.atualizado_por, 
        OLD.atualizado_por, 
        auth.uid()
    );

    -- Apenas para UPDATE de quantidade via ajuste manual
    IF TG_OP = 'UPDATE' 
       AND OLD.quantidade IS DISTINCT FROM NEW.quantidade 
       AND NEW.atualizado_por IS NOT NULL THEN
        
        -- Verificar se JÁ EXISTE qualquer registro de histórico recente
        -- (venda, devolução, baixa, transferência, etc) para evitar duplicação
        -- A trigger de venda/devolução/transferência cria o registro com tipo específico
        SELECT EXISTS(
            SELECT 1 
            FROM historico_estoque 
            WHERE id_produto = NEW.id_produto 
              AND id_loja = NEW.id_loja
              AND quantidade_nova = NEW.quantidade
              AND quantidade_anterior = OLD.quantidade
              AND tipo_movimentacao IN ('venda', 'devolucao_venda', 'baixa_edicao_venda', 'devolucao_edicao_venda', 'transferencia_saida', 'transferencia_entrada')
              AND criado_em > NOW() - INTERVAL '5 seconds'
        ) INTO v_tem_registro_recente;
        
        -- Se NÃO existe registro recente, então é ajuste manual
        IF NOT v_tem_registro_recente THEN
            INSERT INTO historico_estoque (
                id_produto,
                id_loja,
                quantidade,
                quantidade_anterior,
                quantidade_nova,
                usuario_id,
                tipo_movimentacao,
                observacao
            ) VALUES (
                NEW.id_produto,
                NEW.id_loja,
                ABS(NEW.quantidade - OLD.quantidade),
                OLD.quantidade,
                NEW.quantidade,
                v_usuario_id,
                'ajuste',
                'Ajuste manual de estoque'
            );
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

-- Comentário da função
COMMENT ON FUNCTION public.registrar_historico_ajuste_manual() IS 
'Registra ajuste manual APENAS se não houver registro recente (3 segundos) do mesmo produto/loja/quantidade.
Evita duplicação quando vendas/devoluções já registram no histórico.';

-- =====================================================
-- VERIFICAR SE A TRIGGER ESTÁ ATIVA
-- =====================================================
SELECT 
    tgname as nome_trigger,
    tgtype as tipo,
    tgenabled as ativo,
    tgrelid::regclass as tabela
FROM pg_trigger
WHERE tgname = 'trigger_registrar_ajuste_manual';
