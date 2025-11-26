    -- =====================================================
    -- CORREÇÃO DEFINITIVA DO ESTOQUE - SISTEMA EM TESTE
    -- Data: 25/11/2025
    -- =====================================================
    -- Problema: Sistema permitiu 548 saídas com apenas 450 entradas
    -- Solução: Adicionar entrada retroativa + proteções
    -- =====================================================

    BEGIN;

    -- =====================================================
    -- PASSO 1: ADICIONAR ENTRADA RETROATIVA DE 98 UNIDADES
    -- =====================================================
    -- Data retroativa: 11/11/2025 18:00 (antes das primeiras movimentações)

    INSERT INTO historico_estoque (
    id_produto,
    id_loja,
    tipo_movimentacao,
    quantidade,
    quantidade_alterada,
    quantidade_anterior,
    quantidade_nova,
    motivo,
    usuario_id,
    criado_em
    )
    VALUES (
    'e138eed1-e316-4d2a-990e-7f1ebdee06c7', -- Bateria iPhone 17
    (SELECT id FROM lojas WHERE nome = 'ATACADO'),
    'entrada',
    98, -- quantidade (novo sistema)
    98, -- quantidade_alterada (sistema antigo, para compatibilidade)
    0,  -- estoque antes
    98, -- estoque depois
    '🔧 CORREÇÃO RETROATIVA: Entrada inicial não registrada - reconciliação de estoque (teste)',
    (SELECT id FROM usuarios WHERE nome = 'Matheus Mendes Neves' LIMIT 1),
    '2025-11-11 18:00:00+00' -- Data retroativa
    );

    -- =====================================================
    -- PASSO 2: ATUALIZAR ESTOQUE CALCULADO CORRETO
    -- =====================================================

    UPDATE estoque_lojas
    SET 
    quantidade = (
        SELECT SUM(
        CASE 
            WHEN h.tipo_movimentacao = 'ajuste' THEN h.quantidade_alterada
            WHEN h.quantidade IS NOT NULL AND h.tipo_movimentacao IN ('entrada', 'devolucao_venda', 'transferencia_entrada') THEN h.quantidade
            WHEN h.quantidade IS NOT NULL AND h.tipo_movimentacao IN ('saida', 'quebra', 'venda', 'baixa_edicao_venda', 'transferencia_saida') THEN -h.quantidade
            WHEN h.quantidade IS NULL THEN h.quantidade_alterada
            ELSE 0
        END
        )
        FROM historico_estoque h
        WHERE h.id_produto = 'e138eed1-e316-4d2a-990e-7f1ebdee06c7'
        AND h.id_loja = estoque_lojas.id_loja
    ),
    atualizado_em = NOW()
    WHERE id_produto = 'e138eed1-e316-4d2a-990e-7f1ebdee06c7'
    AND id_loja = (SELECT id FROM lojas WHERE nome = 'ATACADO');

    -- =====================================================
    -- PASSO 3: ADICIONAR PROTEÇÃO CONTRA ESTOQUE NEGATIVO
    -- =====================================================

    -- Remover constraint antiga se existir
    ALTER TABLE estoque_lojas DROP CONSTRAINT IF EXISTS check_estoque_nao_negativo;

    -- Adicionar constraint para prevenir estoque negativo
    ALTER TABLE estoque_lojas 
    ADD CONSTRAINT check_estoque_nao_negativo 
    CHECK (quantidade >= 0);

    -- =====================================================
    -- PASSO 4: CRIAR FUNÇÃO DE VALIDAÇÃO ANTES DE VENDAS
    -- =====================================================

    CREATE OR REPLACE FUNCTION validar_estoque_antes_saida()
    RETURNS TRIGGER AS $$
    DECLARE
    estoque_atual INTEGER;
    quantidade_saida INTEGER;
    BEGIN
    -- Calcular quantidade de saída
    quantidade_saida := CASE
        WHEN NEW.quantidade IS NOT NULL THEN NEW.quantidade
        WHEN NEW.quantidade_alterada IS NOT NULL AND NEW.quantidade_alterada < 0 THEN ABS(NEW.quantidade_alterada)
        ELSE 0
    END;

    -- Verificar apenas para movimentações de saída
    IF NEW.tipo_movimentacao IN ('saida', 'venda', 'baixa_edicao_venda', 'quebra', 'transferencia_saida') 
        OR (NEW.tipo_movimentacao = 'ajuste' AND NEW.quantidade_alterada < 0) THEN
        
        -- Buscar estoque atual
        SELECT quantidade INTO estoque_atual
        FROM estoque_lojas
        WHERE id_produto = NEW.id_produto
        AND id_loja = NEW.id_loja;
        
        -- Validar se tem estoque suficiente
        IF estoque_atual IS NULL OR estoque_atual < quantidade_saida THEN
        RAISE EXCEPTION 'Estoque insuficiente! Disponível: %, Necessário: %', 
            COALESCE(estoque_atual, 0), quantidade_saida
            USING HINT = 'Verifique o estoque antes de realizar a operação';
        END IF;
    END IF;

    RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    -- Remover trigger antigo se existir
    DROP TRIGGER IF EXISTS trigger_validar_estoque_saida ON historico_estoque;

    -- Criar trigger de validação
    CREATE TRIGGER trigger_validar_estoque_saida
    BEFORE INSERT ON historico_estoque
    FOR EACH ROW
    EXECUTE FUNCTION validar_estoque_antes_saida();

    -- =====================================================
    -- PASSO 5: CORRIGIR PRODUTO "teste" TAMBÉM
    -- =====================================================

    -- Entrada retroativa de 9 unidades para "teste"
    INSERT INTO historico_estoque (
    id_produto,
    id_loja,
    tipo_movimentacao,
    quantidade,
    quantidade_alterada,
    quantidade_anterior,
    quantidade_nova,
    motivo,
    usuario_id,
    criado_em
    )
    VALUES (
    '3fec3d6e-37ca-4587-a608-94e1eeb42800', -- teste
    (SELECT id FROM lojas WHERE nome = 'ATACADO'),
    'entrada',
    9,
    9,
    0,
    9,
    '🔧 CORREÇÃO RETROATIVA: Entrada inicial não registrada - reconciliação de estoque (teste)',
    (SELECT id FROM usuarios WHERE nome = 'Matheus Mendes Neves' LIMIT 1),
    '2025-11-11 18:00:00+00'
    );

    -- Atualizar estoque do "teste"
    UPDATE estoque_lojas
    SET 
    quantidade = (
        SELECT SUM(
        CASE 
            WHEN h.tipo_movimentacao = 'ajuste' THEN h.quantidade_alterada
            WHEN h.quantidade IS NOT NULL AND h.tipo_movimentacao IN ('entrada', 'devolucao_venda', 'transferencia_entrada') THEN h.quantidade
            WHEN h.quantidade IS NOT NULL AND h.tipo_movimentacao IN ('saida', 'quebra', 'venda', 'baixa_edicao_venda', 'transferencia_saida') THEN -h.quantidade
            WHEN h.quantidade IS NULL THEN h.quantidade_alterada
            ELSE 0
        END
        )
        FROM historico_estoque h
        WHERE h.id_produto = '3fec3d6e-37ca-4587-a608-94e1eeb42800'
        AND h.id_loja = estoque_lojas.id_loja
    ),
    atualizado_em = NOW()
    WHERE id_produto = '3fec3d6e-37ca-4587-a608-94e1eeb42800'
    AND id_loja = (SELECT id FROM lojas WHERE nome = 'ATACADO');

    COMMIT;

    -- =====================================================
    -- VERIFICAÇÃO FINAL
    -- =====================================================

    SELECT 
    '🎯 VERIFICAÇÃO FINAL' as titulo,
    p.descricao,
    e.quantidade as estoque_atual,
    SUM(
        CASE 
        WHEN h.tipo_movimentacao = 'ajuste' THEN h.quantidade_alterada
        WHEN h.quantidade IS NOT NULL AND h.tipo_movimentacao IN ('entrada', 'devolucao_venda', 'transferencia_entrada') THEN h.quantidade
        WHEN h.quantidade IS NOT NULL AND h.tipo_movimentacao IN ('saida', 'quebra', 'venda', 'baixa_edicao_venda', 'transferencia_saida') THEN -h.quantidade
        WHEN h.quantidade IS NULL THEN h.quantidade_alterada
        ELSE 0
        END
    ) as estoque_calculado,
    CASE 
        WHEN e.quantidade = SUM(
        CASE 
            WHEN h.tipo_movimentacao = 'ajuste' THEN h.quantidade_alterada
            WHEN h.quantidade IS NOT NULL AND h.tipo_movimentacao IN ('entrada', 'devolucao_venda', 'transferencia_entrada') THEN h.quantidade
            WHEN h.quantidade IS NOT NULL AND h.tipo_movimentacao IN ('saida', 'quebra', 'venda', 'baixa_edicao_venda', 'transferencia_saida') THEN -h.quantidade
            WHEN h.quantidade IS NULL THEN h.quantidade_alterada
            ELSE 0
        END
        ) THEN '✅ CORRETO'
        ELSE '❌ DIVERGENTE'
    END as status
    FROM historico_estoque h
    JOIN produtos p ON p.id = h.id_produto
    LEFT JOIN estoque_lojas e ON e.id_produto = h.id_produto AND e.id_loja = h.id_loja
    WHERE h.id_produto IN (
    '3fec3d6e-37ca-4587-a608-94e1eeb42800',
    'e138eed1-e316-4d2a-990e-7f1ebdee06c7'
    )
    AND h.id_loja = (SELECT id FROM lojas WHERE nome = 'ATACADO')
    GROUP BY p.descricao, e.quantidade
    ORDER BY p.descricao;

    -- =====================================================
    -- RESUMO DAS ALTERAÇÕES
    -- =====================================================

    SELECT '📊 RESUMO' as titulo;

    SELECT 
    '1️⃣ Entrada retroativa' as acao,
    'Bateria iPhone 17: +98 unidades' as detalhes,
    'teste: +9 unidades' as detalhes2
    UNION ALL
    SELECT 
    '2️⃣ Estoque atualizado',
    'Recalculado baseado no histórico completo',
    'Agora está sincronizado'
    UNION ALL
    SELECT 
    '3️⃣ Proteção ativada',
    'CHECK constraint: quantidade >= 0',
    'Impede estoque negativo'
    UNION ALL
    SELECT 
    '4️⃣ Validação em tempo real',
    'Trigger: validar_estoque_antes_saida()',
    'Bloqueia vendas sem estoque';
