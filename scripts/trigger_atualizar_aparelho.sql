DROP TRIGGER IF EXISTS trigger_atualizar_aparelho_pagamento ON pagamentos_venda;
DROP TRIGGER IF EXISTS trigger_atualizar_aparelho_brinde ON brindes_aparelhos;

CREATE OR REPLACE FUNCTION atualizar_aparelho_por_venda()
RETURNS TRIGGER SECURITY DEFINER AS $$
BEGIN
  UPDATE aparelhos
  SET atualizado_em = NOW()
  WHERE venda_id = COALESCE(NEW.venda_id, OLD.venda_id);
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_atualizar_aparelho_pagamento
AFTER INSERT OR UPDATE OR DELETE ON pagamentos_venda
FOR EACH ROW EXECUTE FUNCTION atualizar_aparelho_por_venda();

CREATE TRIGGER trigger_atualizar_aparelho_brinde
AFTER INSERT OR UPDATE OR DELETE ON brindes_aparelhos
FOR EACH ROW EXECUTE FUNCTION atualizar_aparelho_por_venda();
