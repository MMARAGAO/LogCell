-- TESTE SIMPLES DE TRANSFERENCIA
-- Criar transferencia e confirmar para validar correcoes

-- Buscar dados necessarios
DO $$
DECLARE
    v_produto_id UUID := 'e809aed9-dc7b-49f7-9ede-06851319acb5';
    v_loja_origem_id INT := 3;
    v_loja_destino_id INT := 1;
    v_quantidade INT := 2;
    v_usuario_id UUID;
    v_transferencia_id UUID;
    v_resultado JSONB;
BEGIN
    -- Pegar usuario
    SELECT id INTO v_usuario_id FROM usuarios LIMIT 1;
    
    -- Criar transferencia
    INSERT INTO transferencias (loja_origem_id, loja_destino_id, usuario_id, observacao)
    VALUES (v_loja_origem_id, v_loja_destino_id, v_usuario_id, 'TESTE VALIDACAO')
    RETURNING id INTO v_transferencia_id;
    
    INSERT INTO transferencias_itens (transferencia_id, produto_id, quantidade)
    VALUES (v_transferencia_id, v_produto_id, v_quantidade);
    
    RAISE NOTICE 'Transferencia criada: %', v_transferencia_id;
    
    -- Confirmar
    v_resultado := confirmar_transferencia(v_transferencia_id, v_usuario_id);
    
    RAISE NOTICE 'Resultado: %', v_resultado;
    RAISE NOTICE 'Transferencia ID para consultar: %', v_transferencia_id;
END $$;
