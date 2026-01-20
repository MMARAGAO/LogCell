-- Função para atualizar automaticamente o status da venda quando pagamentos são adicionados ou atualizados
CREATE OR REPLACE FUNCTION atualizar_status_venda_apos_pagamento()
RETURNS TRIGGER AS $$
DECLARE
    v_valor_total NUMERIC;
    v_valor_pago NUMERIC;
    v_valor_desconto NUMERIC;
    v_saldo_devedor NUMERIC;
    v_status_atual VARCHAR(20);
BEGIN
    -- Buscar dados atuais da venda
    SELECT 
        COALESCE(v.valor_total, 0),
        COALESCE(v.valor_pago, 0),
        COALESCE(v.valor_desconto, 0),
        COALESCE(v.saldo_devedor, 0),
        v.status
    INTO 
        v_valor_total,
        v_valor_pago,
        v_valor_desconto,
        v_saldo_devedor,
        v_status_atual
    FROM vendas v
    WHERE v.id = COALESCE(NEW.venda_id, OLD.venda_id);

    -- Se não encontrou a venda, retornar
    IF v_status_atual IS NULL THEN
        RETURN COALESCE(NEW, OLD);
    END IF;

    -- Ignorar vendas canceladas ou devolvidas
    IF v_status_atual IN ('cancelada', 'devolvida') THEN
        RETURN COALESCE(NEW, OLD);
    END IF;

    -- Atualizar status baseado no saldo devedor
    IF v_saldo_devedor <= 0 AND v_valor_pago > 0 THEN
        -- Venda totalmente paga -> concluída
        UPDATE vendas
        SET status = 'concluida'
        WHERE id = COALESCE(NEW.venda_id, OLD.venda_id)
          AND status != 'concluida';
        
        RAISE NOTICE 'Status da venda atualizado para concluída (saldo: %, pago: %)', v_saldo_devedor, v_valor_pago;
    ELSIF v_valor_pago > 0 AND v_saldo_devedor > 0 THEN
        -- Pagamento parcial -> em andamento
        UPDATE vendas
        SET status = 'em_andamento'
        WHERE id = COALESCE(NEW.venda_id, OLD.venda_id)
          AND status != 'em_andamento';
        
        RAISE NOTICE 'Status da venda atualizado para em_andamento (saldo: %, pago: %)', v_saldo_devedor, v_valor_pago;
    END IF;

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Drop triggers antigos se existirem
DROP TRIGGER IF EXISTS trigger_atualizar_status_venda_insert ON pagamentos_venda;
DROP TRIGGER IF EXISTS trigger_atualizar_status_venda_update ON pagamentos_venda;
DROP TRIGGER IF EXISTS trigger_atualizar_status_venda_delete ON pagamentos_venda;

-- Criar triggers para INSERT, UPDATE e DELETE em pagamentos_venda
CREATE TRIGGER trigger_atualizar_status_venda_insert
AFTER INSERT ON pagamentos_venda
FOR EACH ROW
EXECUTE FUNCTION atualizar_status_venda_apos_pagamento();

CREATE TRIGGER trigger_atualizar_status_venda_update
AFTER UPDATE ON pagamentos_venda
FOR EACH ROW
EXECUTE FUNCTION atualizar_status_venda_apos_pagamento();

CREATE TRIGGER trigger_atualizar_status_venda_delete
AFTER DELETE ON pagamentos_venda
FOR EACH ROW
EXECUTE FUNCTION atualizar_status_venda_apos_pagamento();
