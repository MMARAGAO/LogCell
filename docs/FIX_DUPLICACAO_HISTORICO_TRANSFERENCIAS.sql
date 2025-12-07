-- =========================================================================
-- FIX: Evitar duplicação de registros no historico_estoque 
-- ao confirmar transferências
-- =========================================================================
-- PROBLEMA:
-- A função confirmar_transferencia já registra manualmente no historico_estoque
-- com tipo_movimentacao = 'transferencia_saida' ou 'transferencia_entrada'.
-- 
-- Porém, a trigger trigger_registrar_ajuste_manual também dispara e cria
-- outro registro com tipo_movimentacao = 'ajuste'.
--
-- RESULTADO: Cada transferência cria 4 registros ao invés de 2!
-- =========================================================================

-- 1. ATUALIZAR A FUNÇÃO registrar_historico_ajuste_manual
-- Adicionar verificação para IGNORAR operações de transferência
CREATE OR REPLACE FUNCTION public.registrar_historico_ajuste_manual()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
    v_usuario_id UUID;
    v_tem_transferencia BOOLEAN;
BEGIN
    -- Capturar o usuário autenticado
    v_usuario_id := COALESCE(
        NEW.atualizado_por, 
        OLD.atualizado_por, 
        auth.uid()
    );

    -- Apenas para UPDATE de quantidade via modal de ajuste manual
    -- Detecta ajuste manual quando atualizado_por é preenchido
    -- e não existe registro recente no historico (código não registrou manualmente)
    IF TG_OP = 'UPDATE' 
       AND OLD.quantidade IS DISTINCT FROM NEW.quantidade 
       AND NEW.atualizado_por IS NOT NULL THEN
        
        -- ✅ NOVA VERIFICAÇÃO: Ignorar se já existe registro de transferência
        -- Verifica se já foi criado um registro de transferência nos últimos 5 segundos
        SELECT EXISTS(
            SELECT 1 
            FROM historico_estoque 
            WHERE id_produto = NEW.id_produto 
              AND id_loja = NEW.id_loja
              AND quantidade_nova = NEW.quantidade
              AND tipo_movimentacao IN ('transferencia_saida', 'transferencia_entrada', 'venda', 'devolucao')
              AND criado_em > NOW() - INTERVAL '5 seconds'
        ) INTO v_tem_transferencia;
        
        -- Se já existe registro de operação (transferência, venda, etc), NÃO criar ajuste manual
        IF v_tem_transferencia THEN
            RETURN NEW;
        END IF;
        
        -- Verificar se código já registrou manualmente (outra operação qualquer)
        IF NOT EXISTS(
            SELECT 1 
            FROM historico_estoque 
            WHERE id_produto = NEW.id_produto 
              AND id_loja = NEW.id_loja
              AND quantidade_nova = NEW.quantidade
              AND criado_em > NOW() - INTERVAL '1 second'
        ) THEN
            -- Registrar ajuste manual APENAS se não for transferência/venda/etc
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
$function$;

-- =========================================================================
-- VERIFICAR SE A CORREÇÃO FOI APLICADA
-- =========================================================================
-- Execute esta query para confirmar que a função foi atualizada:
SELECT 
    proname as funcao,
    pg_get_functiondef(oid) as codigo
FROM pg_proc
WHERE proname = 'registrar_historico_ajuste_manual';

-- =========================================================================
-- LIMPAR DUPLICATAS EXISTENTES (OPCIONAL)
-- =========================================================================
-- Se você quiser remover duplicatas já criadas no histórico:

-- 1. IDENTIFICAR DUPLICATAS
-- Esta query mostra transferências que geraram registros duplicados:
SELECT 
    he1.id as id_transferencia,
    he1.criado_em as dt_transferencia,
    he1.tipo_movimentacao as tipo_1,
    he2.id as id_ajuste,
    he2.criado_em as dt_ajuste,
    he2.tipo_movimentacao as tipo_2,
    he1.id_produto,
    he1.id_loja,
    he1.quantidade,
    p.descricao as produto,
    l.nome as loja
FROM historico_estoque he1
INNER JOIN historico_estoque he2 
    ON he1.id_produto = he2.id_produto 
    AND he1.id_loja = he2.id_loja
    AND ABS(EXTRACT(EPOCH FROM (he2.criado_em - he1.criado_em))) < 2
    AND he1.quantidade_nova = he2.quantidade_nova
    AND he1.id < he2.id
LEFT JOIN produtos p ON he1.id_produto = p.id
LEFT JOIN lojas l ON he1.id_loja = l.id
WHERE he1.tipo_movimentacao IN ('transferencia_saida', 'transferencia_entrada')
  AND he2.tipo_movimentacao = 'ajuste'
  AND he2.observacao = 'Ajuste manual de estoque'
ORDER BY he1.criado_em DESC;

-- 2. DELETAR DUPLICATAS (CUIDADO! Faça backup antes!)
-- ⚠️ ATENÇÃO: Execute apenas se tiver certeza!
/*
DELETE FROM historico_estoque
WHERE id IN (
    SELECT he2.id
    FROM historico_estoque he1
    INNER JOIN historico_estoque he2 
        ON he1.id_produto = he2.id_produto 
        AND he1.id_loja = he2.id_loja
        AND ABS(EXTRACT(EPOCH FROM (he2.criado_em - he1.criado_em))) < 2
        AND he1.quantidade_nova = he2.quantidade_nova
        AND he1.id < he2.id
    WHERE he1.tipo_movimentacao IN ('transferencia_saida', 'transferencia_entrada')
      AND he2.tipo_movimentacao = 'ajuste'
      AND he2.observacao = 'Ajuste manual de estoque'
);
*/

-- =========================================================================
-- TESTAR A CORREÇÃO
-- =========================================================================
-- Após aplicar a função, faça um teste:
-- 1. Crie uma transferência nova
-- 2. Confirme a transferência
-- 3. Execute esta query para verificar que NÃO há duplicatas:

/*
SELECT 
    he.*,
    p.descricao as produto,
    l.nome as loja
FROM historico_estoque he
LEFT JOIN produtos p ON he.id_produto = p.id
LEFT JOIN lojas l ON he.id_loja = l.id
WHERE he.criado_em > NOW() - INTERVAL '1 hour'
ORDER BY he.criado_em DESC;
*/

-- Você deve ver apenas 2 registros por produto transferido:
-- - 1 com tipo_movimentacao = 'transferencia_saida' (loja origem)
-- - 1 com tipo_movimentacao = 'transferencia_entrada' (loja destino)
-- ✅ SEM registros tipo = 'ajuste' para a mesma operação!
