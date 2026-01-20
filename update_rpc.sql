CREATE OR REPLACE FUNCTION public.calcular_metricas_adicionais(
    p_data_inicio TEXT,
    p_data_fim TEXT,
    p_loja_id INTEGER DEFAULT NULL
)
RETURNS JSON AS $$DECLARE
    v_result JSON;
    v_pagamentos_os NUMERIC := 0;
    v_transferencias INTEGER := 0;
    v_transferencias_pendentes INTEGER := 0;
    v_total_quebras NUMERIC := 0;
    v_qtd_quebras INTEGER := 0;
    v_creditos_cliente NUMERIC := 0;
    v_devolucoes_com_credito_qtd INTEGER := 0;
    v_devolucoes_com_credito_total NUMERIC := 0;
    v_devolucoes_sem_credito_qtd INTEGER := 0;
    v_devolucoes_sem_credito_total NUMERIC := 0;
BEGIN
    -- Pagamentos de OS
    SELECT COALESCE(SUM(osp.valor), 0) INTO v_pagamentos_os
    FROM ordem_servico_pagamentos osp
    LEFT JOIN ordem_servico os ON os.id = osp.id_ordem_servico
    WHERE osp.data_pagamento >= p_data_inicio::DATE
    AND osp.data_pagamento <= p_data_fim::DATE
    AND (p_loja_id IS NULL OR os.id_loja = p_loja_id);

    -- Transferências
    SELECT COUNT(*) INTO v_transferencias
    FROM transferencias t
    WHERE t.criado_em >= p_data_inicio::TIMESTAMP
    AND t.criado_em <= p_data_fim::TIMESTAMP
    AND (p_loja_id IS NULL OR t.loja_origem_id = p_loja_id OR t.loja_destino_id = p_loja_id);

    -- Transferências Pendentes
    SELECT COUNT(*) INTO v_transferencias_pendentes
    FROM transferencias t
    WHERE t.criado_em >= p_data_inicio::TIMESTAMP
    AND t.criado_em <= p_data_fim::TIMESTAMP
    AND t.status = 'pendente'
    AND (p_loja_id IS NULL OR t.loja_origem_id = p_loja_id OR t.loja_destino_id = p_loja_id);

    -- Quebra de Peças
    SELECT COUNT(*), COALESCE(SUM(qp.valor_total), 0) INTO v_qtd_quebras, v_total_quebras
    FROM quebra_pecas qp
    WHERE qp.criado_em >= p_data_inicio::TIMESTAMP
    AND qp.criado_em <= p_data_fim::TIMESTAMP
    AND (p_loja_id IS NULL OR qp.id_loja = p_loja_id);

    -- Créditos de Cliente
    SELECT COALESCE(SUM(cc.saldo), 0) INTO v_creditos_cliente
    FROM creditos_cliente cc
    LEFT JOIN clientes c ON c.id = cc.cliente_id
    WHERE cc.criado_em >= p_data_inicio::TIMESTAMP
    AND cc.criado_em <= p_data_fim::TIMESTAMP
    AND (p_loja_id IS NULL OR c.id_loja = p_loja_id);

    -- Devoluções com Crédito
    SELECT COUNT(*), COALESCE(SUM(dv.valor_total), 0) INTO v_devolucoes_com_credito_qtd, v_devolucoes_com_credito_total
    FROM devolucoes_venda dv
    LEFT JOIN vendas v ON v.id = dv.venda_id
    WHERE dv.criado_em >= p_data_inicio::TIMESTAMP
    AND dv.criado_em <= p_data_fim::TIMESTAMP
    AND dv.tipo = 'com_credito'
    AND (p_loja_id IS NULL OR v.loja_id = p_loja_id);

    -- Devoluções sem Crédito
    SELECT COUNT(*), COALESCE(SUM(dv.valor_total), 0) INTO v_devolucoes_sem_credito_qtd, v_devolucoes_sem_credito_total
    FROM devolucoes_venda dv
    LEFT JOIN vendas v ON v.id = dv.venda_id
    WHERE dv.criado_em >= p_data_inicio::TIMESTAMP
    AND dv.criado_em <= p_data_fim::TIMESTAMP
    AND dv.tipo = 'sem_credito'
    AND (p_loja_id IS NULL OR v.loja_id = p_loja_id);

    -- Montar resultado
    v_result := json_build_object(
        'pagamentos_os', v_pagamentos_os,
        'total_transferencias', v_transferencias,
        'transferencias_pendentes', v_transferencias_pendentes,
        'total_quebras', v_total_quebras,
        'quantidade_quebras', v_qtd_quebras,
        'total_creditos_cliente', v_creditos_cliente,
        'devolucoes_com_credito_quantidade', v_devolucoes_com_credito_qtd,
        'devolucoes_com_credito_total', v_devolucoes_com_credito_total,
        'devolucoes_sem_credito_quantidade', v_devolucoes_sem_credito_qtd,
        'devolucoes_sem_credito_total', v_devolucoes_sem_credito_total
    );
    
    RETURN v_result;
END;$$LANGUAGE plpgsql;
