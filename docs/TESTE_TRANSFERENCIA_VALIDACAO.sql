-- =====================================================
-- TESTE DE VALIDAÇÃO DE TRANSFERÊNCIAS
-- Data: 06/12/2025
-- =====================================================
-- Objetivo: Validar que as correções funcionam:
-- 1. Status atualizado corretamente (confirmada)
-- 2. Data e usuário de confirmação preenchidos
-- 3. Sem duplicação no histórico
-- =====================================================

-- CONFIGURAÇÃO DO TESTE
DO $$
DECLARE
    v_produto_id UUID := 'e809aed9-dc7b-49f7-9ede-06851319acb5'; -- BATERIA IPHONE FOXCONN BLACK X
    v_loja_origem_id INT := 3; -- ATACADO
    v_loja_destino_id INT := 1; -- Loja Feira
    v_quantidade INT := 2;
    v_usuario_id UUID;
    v_transferencia_id UUID;
    v_estoque_origem_antes INT;
    v_estoque_origem_depois INT;
    v_estoque_destino_antes INT;
    v_estoque_destino_depois INT;
    v_qtd_historico_antes INT;
    v_qtd_historico_depois INT;
    v_qtd_duplicacoes INT;
    v_status_final TEXT;
    v_confirmado_em TIMESTAMP;
    v_confirmado_por UUID;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'INICIANDO TESTE DE TRANSFERÊNCIA';
    RAISE NOTICE '========================================';
    
    -- Pegar primeiro usuário disponível
    SELECT id INTO v_usuario_id FROM usuarios LIMIT 1;
    RAISE NOTICE 'Usuário de teste: %', v_usuario_id;
    
    -- 1. REGISTRAR ESTADO INICIAL
    RAISE NOTICE '';
    RAISE NOTICE '--- 1. ESTADO INICIAL ---';
    
    SELECT COALESCE(quantidade, 0) INTO v_estoque_origem_antes
    FROM estoque_lojas
    WHERE id_produto = v_produto_id AND id_loja = v_loja_origem_id;
    
    SELECT COALESCE(quantidade, 0) INTO v_estoque_destino_antes
    FROM estoque_lojas
    WHERE id_produto = v_produto_id AND id_loja = v_loja_destino_id;
    
    SELECT COUNT(*) INTO v_qtd_historico_antes
    FROM historico_estoque
    WHERE id_produto = v_produto_id;
    
    RAISE NOTICE 'Estoque Origem (ATACADO): %', v_estoque_origem_antes;
    RAISE NOTICE 'Estoque Destino (Loja Feira): %', v_estoque_destino_antes;
    RAISE NOTICE 'Registros no histórico: %', v_qtd_historico_antes;
    
    -- 2. CRIAR TRANSFERÊNCIA
    RAISE NOTICE '';
    RAISE NOTICE '--- 2. CRIANDO TRANSFERÊNCIA ---';
    
    INSERT INTO transferencias (loja_origem_id, loja_destino_id, usuario_id, observacao)
    VALUES (v_loja_origem_id, v_loja_destino_id, v_usuario_id, 'TESTE DE VALIDAÇÃO - Pode excluir')
    RETURNING id INTO v_transferencia_id;
    
    INSERT INTO transferencias_itens (transferencia_id, produto_id, quantidade)
    VALUES (v_transferencia_id, v_produto_id, v_quantidade);
    
    RAISE NOTICE 'Transferência criada: %', v_transferencia_id;
    RAISE NOTICE 'Quantidade: % unidades', v_quantidade;
    
    -- 3. CONFIRMAR TRANSFERÊNCIA
    RAISE NOTICE '';
    RAISE NOTICE '--- 3. CONFIRMANDO TRANSFERÊNCIA ---';
    
    PERFORM confirmar_transferencia(v_transferencia_id, v_usuario_id);
    
    -- 4. VERIFICAR RESULTADOS
    RAISE NOTICE '';
    RAISE NOTICE '--- 4. VERIFICANDO RESULTADOS ---';
    
    -- Verificar status
    SELECT status, confirmado_em, confirmado_por 
    INTO v_status_final, v_confirmado_em, v_confirmado_por
    FROM transferencias
    WHERE id = v_transferencia_id;
    
    RAISE NOTICE 'Status final: %', v_status_final;
    RAISE NOTICE 'Confirmado em: %', v_confirmado_em;
    RAISE NOTICE 'Confirmado por: %', v_confirmado_por;
    
    -- Verificar estoques
    SELECT COALESCE(quantidade, 0) INTO v_estoque_origem_depois
    FROM estoque_lojas
    WHERE id_produto = v_produto_id AND id_loja = v_loja_origem_id;
    
    SELECT COALESCE(quantidade, 0) INTO v_estoque_destino_depois
    FROM estoque_lojas
    WHERE id_produto = v_produto_id AND id_loja = v_loja_destino_id;
    
    RAISE NOTICE 'Estoque Origem ANTES: % | DEPOIS: %', v_estoque_origem_antes, v_estoque_origem_depois;
    RAISE NOTICE 'Estoque Destino ANTES: % | DEPOIS: %', v_estoque_destino_antes, v_estoque_destino_depois;
    
    -- Verificar histórico
    SELECT COUNT(*) INTO v_qtd_historico_depois
    FROM historico_estoque
    WHERE id_produto = v_produto_id;
    
    RAISE NOTICE 'Registros histórico ANTES: % | DEPOIS: %', v_qtd_historico_antes, v_qtd_historico_depois;
    RAISE NOTICE 'Novos registros criados: %', v_qtd_historico_depois - v_qtd_historico_antes;
    
    -- Verificar duplicações
    SELECT COUNT(*) INTO v_qtd_duplicacoes
    FROM (
        SELECT tipo_movimentacao, criado_em
        FROM historico_estoque
        WHERE id_produto = v_produto_id
          AND observacao LIKE '%' || v_transferencia_id::text || '%'
        GROUP BY tipo_movimentacao, criado_em
        HAVING COUNT(*) > 1
    ) duplicados;
    
    RAISE NOTICE 'Duplicações encontradas: %', v_qtd_duplicacoes;
    
    -- 5. VALIDAÇÃO FINAL
    RAISE NOTICE '';
    RAISE NOTICE '--- 5. VALIDAÇÃO FINAL ---';
    
    IF v_status_final = 'confirmada' THEN
        RAISE NOTICE '✅ TESTE 1 PASSOU: Status atualizado para "confirmada"';
    ELSE
        RAISE NOTICE '❌ TESTE 1 FALHOU: Status é "%" ao invés de "confirmada"', v_status_final;
    END IF;
    
    IF v_confirmado_em IS NOT NULL THEN
        RAISE NOTICE '✅ TESTE 2 PASSOU: Data de confirmação preenchida';
    ELSE
        RAISE NOTICE '❌ TESTE 2 FALHOU: Data de confirmação está NULL';
    END IF;
    
    IF v_confirmado_por IS NOT NULL THEN
        RAISE NOTICE '✅ TESTE 3 PASSOU: Usuário confirmador preenchido';
    ELSE
        RAISE NOTICE '❌ TESTE 3 FALHOU: Usuário confirmador está NULL';
    END IF;
    
    IF v_estoque_origem_depois = v_estoque_origem_antes - v_quantidade THEN
        RAISE NOTICE '✅ TESTE 4 PASSOU: Estoque origem reduzido corretamente';
    ELSE
        RAISE NOTICE '❌ TESTE 4 FALHOU: Estoque origem incorreto';
    END IF;
    
    IF v_estoque_destino_depois = v_estoque_destino_antes + v_quantidade THEN
        RAISE NOTICE '✅ TESTE 5 PASSOU: Estoque destino aumentado corretamente';
    ELSE
        RAISE NOTICE '❌ TESTE 5 FALHOU: Estoque destino incorreto';
    END IF;
    
    IF v_qtd_historico_depois - v_qtd_historico_antes = 2 THEN
        RAISE NOTICE '✅ TESTE 6 PASSOU: Exatamente 2 registros criados (saída + entrada)';
    ELSE
        RAISE NOTICE '❌ TESTE 6 FALHOU: % registros criados ao invés de 2', v_qtd_historico_depois - v_qtd_historico_antes;
    END IF;
    
    IF v_qtd_duplicacoes = 0 THEN
        RAISE NOTICE '✅ TESTE 7 PASSOU: Nenhuma duplicação detectada';
    ELSE
        RAISE NOTICE '❌ TESTE 7 FALHOU: % duplicações encontradas', v_qtd_duplicacoes;
    END IF;
    
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'TESTE CONCLUÍDO';
    RAISE NOTICE 'Transferência ID: %', v_transferencia_id;
    RAISE NOTICE '========================================';
    
END $$;

-- QUERY PARA VISUALIZAR OS DETALHES DA TRANSFERÊNCIA DE TESTE
SELECT 
    '=== ÚLTIMA TRANSFERÊNCIA CRIADA ===' as info;

SELECT 
    t.id,
    t.status,
    TO_CHAR(t.criado_em, 'DD/MM/YYYY HH24:MI:SS') as criado_em,
    TO_CHAR(t.confirmado_em, 'DD/MM/YYYY HH24:MI:SS') as confirmado_em,
    t.observacao,
    lo.nome as loja_origem,
    ld.nome as loja_destino
FROM transferencias t
INNER JOIN lojas lo ON t.loja_origem_id = lo.id
INNER JOIN lojas ld ON t.loja_destino_id = ld.id
WHERE t.observacao LIKE '%TESTE DE VALIDAÇÃO%'
ORDER BY t.criado_em DESC
LIMIT 1;

-- QUERY PARA VER O HISTÓRICO CRIADO
SELECT 
    '=== HISTÓRICO CRIADO PARA O TESTE ===' as info;

SELECT 
    TO_CHAR(he.criado_em, 'DD/MM/YYYY HH24:MI:SS') as data_hora,
    l.nome as loja,
    he.tipo_movimentacao,
    he.quantidade_anterior,
    he.quantidade_nova,
    he.observacao
FROM historico_estoque he
INNER JOIN lojas l ON he.id_loja = l.id
WHERE he.observacao LIKE '%TESTE DE VALIDAÇÃO%'
ORDER BY he.criado_em;
