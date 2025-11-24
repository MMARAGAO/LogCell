-- =====================================================
-- TESTE MANUAL DE NOTIFICAÇÃO
-- =====================================================
-- Script para testar criação de notificação manualmente

-- 1. Primeiro, vamos ver um produto com estoque baixo
SELECT 
    p.id as produto_id,
    p.descricao as produto,
    p.quantidade_minima,
    l.id as loja_id,
    l.nome as loja,
    el.quantidade as qtd_atual
FROM estoque_lojas el
JOIN produtos p ON el.id_produto = p.id
JOIN lojas l ON el.id_loja = l.id
WHERE p.quantidade_minima > 0
AND el.quantidade <= p.quantidade_minima
LIMIT 1;

-- 2. Testar a função criar_notificacao_estoque manualmente
-- SUBSTITUA os valores abaixo pelos valores da query acima
DO $$
DECLARE
    v_produto_id UUID;
    v_loja_id INTEGER;
    v_quantidade INTEGER;
    v_quantidade_minima INTEGER;
BEGIN
    -- Buscar um produto com estoque baixo
    SELECT 
        el.id_produto,
        el.id_loja,
        el.quantidade,
        p.quantidade_minima
    INTO v_produto_id, v_loja_id, v_quantidade, v_quantidade_minima
    FROM estoque_lojas el
    JOIN produtos p ON el.id_produto = p.id
    WHERE p.quantidade_minima > 0
    AND el.quantidade <= p.quantidade_minima
    LIMIT 1;
    
    -- Se encontrou, tentar criar notificação
    IF v_produto_id IS NOT NULL THEN
        RAISE NOTICE '🔍 Produto ID: %', v_produto_id;
        RAISE NOTICE '🏪 Loja ID: %', v_loja_id;
        RAISE NOTICE '📦 Quantidade: %', v_quantidade;
        RAISE NOTICE '⚠️ Mínimo: %', v_quantidade_minima;
        RAISE NOTICE '';
        RAISE NOTICE '🚀 Tentando criar notificação...';
        
        -- Chamar função
        PERFORM criar_notificacao_estoque(
            v_produto_id,
            v_loja_id,
            v_quantidade,
            v_quantidade_minima
        );
        
        RAISE NOTICE '✅ Função executada!';
    ELSE
        RAISE NOTICE '❌ Nenhum produto com estoque baixo encontrado';
    END IF;
END $$;

-- 3. Verificar se a notificação foi criada
SELECT 
    n.*,
    COUNT(nu.id) as usuarios_notificados
FROM notificacoes n
LEFT JOIN notificacoes_usuarios nu ON n.id = nu.notificacao_id
GROUP BY n.id
ORDER BY n.criado_em DESC
LIMIT 5;

-- 4. Verificar o controle de alertas
SELECT * FROM alertas_estoque_controle
ORDER BY ultimo_alerta_em DESC
LIMIT 5;

-- 5. Verificar se há usuários ativos
SELECT 
    id,
    nome,
    email,
    ativo
FROM usuarios
WHERE ativo = true;
