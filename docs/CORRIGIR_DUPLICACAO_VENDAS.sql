-- =====================================================
-- CORRIGIR DUPLICAÇÃO DE HISTÓRICO EM VENDAS
-- Data: 25/11/2025
-- =====================================================
-- Problema: Vendas registram 2x no historico_estoque:
--   1. Via vendasService.ts com INSERT manual
--   2. Via trigger registrar_historico_estoque() no UPDATE
-- Solução: Desabilitar trigger para criar estoque_lojas
--          O código já registra manualmente no historico_estoque
-- =====================================================

-- SOLUÇÃO DEFINITIVA: Remover trigger que duplica
-- O código de vendas/RMA/OS já registra manualmente no historico_estoque
-- com observações detalhadas (Venda #X, RMA #Y, etc)

DROP TRIGGER IF EXISTS trigger_registrar_historico_estoque ON estoque_lojas;

-- Manter função para ajustes manuais via modal
CREATE OR REPLACE FUNCTION registrar_historico_ajuste_manual()
RETURNS TRIGGER AS $$
DECLARE
    v_usuario_id UUID;
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
        
        -- Verificar se código já registrou manualmente
        IF NOT EXISTS(
            SELECT 1 
            FROM historico_estoque 
            WHERE id_produto = NEW.id_produto 
              AND id_loja = NEW.id_loja
              AND quantidade_nova = NEW.quantidade
              AND criado_em > NOW() - INTERVAL '1 second'
        ) THEN
            -- Registrar ajuste manual
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public';

-- Criar novo trigger apenas para ajustes manuais
CREATE TRIGGER trigger_registrar_ajuste_manual
    AFTER UPDATE
    ON public.estoque_lojas
    FOR EACH ROW
    EXECUTE FUNCTION public.registrar_historico_ajuste_manual();

-- =====================================================
-- LIMPAR DUPLICATAS EXISTENTES
-- =====================================================

-- Identificar e remover duplicatas (manter registro com observação mais específica)
WITH duplicatas AS (
    SELECT 
        h1.id as id_generico,
        h2.id as id_especifico
    FROM historico_estoque h1
    INNER JOIN historico_estoque h2 
        ON h1.id_produto = h2.id_produto 
        AND h1.id_loja = h2.id_loja
        AND h1.quantidade_nova = h2.quantidade_nova
        AND h1.id < h2.id
        AND ABS(EXTRACT(EPOCH FROM (h2.criado_em - h1.criado_em))) < 3
    WHERE h1.observacao = 'Ajuste manual de estoque'
      AND (h2.observacao LIKE 'Venda #%' 
           OR h2.observacao LIKE 'RMA #%'
           OR h2.observacao LIKE '%ordem de servi%')
)
DELETE FROM historico_estoque
WHERE id IN (SELECT id_generico FROM duplicatas);

-- =====================================================
-- VERIFICAÇÃO
-- =====================================================

SELECT 
  '✅ Trigger removido e recriado apenas para ajustes manuais!' as status,
  'Vendas/RMA/OS registram manualmente sem duplicação' as descricao;

-- Contar duplicatas restantes
SELECT 
    COUNT(*) as duplicatas_encontradas,
    'Se > 0, execute novamente a limpeza' as acao
FROM (
    SELECT 
        h1.id_produto,
        h1.id_loja,
        h1.criado_em,
        COUNT(*) as total
    FROM historico_estoque h1
    INNER JOIN historico_estoque h2 
        ON h1.id_produto = h2.id_produto 
        AND h1.id_loja = h2.id_loja
        AND h1.quantidade_nova = h2.quantidade_nova
        AND h1.id != h2.id
        AND ABS(EXTRACT(EPOCH FROM (h2.criado_em - h1.criado_em))) < 3
    GROUP BY h1.id_produto, h1.id_loja, h1.criado_em
    HAVING COUNT(*) > 1
) sub;
