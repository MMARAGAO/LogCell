-- ========================================
-- TRIGGER: Atualizar valor_pago na OS ao inserir/atualizar pagamento
-- ========================================

CREATE OR REPLACE FUNCTION atualizar_valor_pago_os()
RETURNS TRIGGER AS $$
BEGIN
  -- Atualiza o valor_pago da OS com a soma dos pagamentos
  UPDATE ordem_servico
  SET valor_pago = (
    SELECT COALESCE(SUM(valor), 0)
    FROM ordem_servico_pagamentos
    WHERE id_ordem_servico = NEW.id_ordem_servico
  )
  WHERE id = NEW.id_ordem_servico;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para INSERT
DROP TRIGGER IF EXISTS trigger_atualizar_valor_pago_insert ON ordem_servico_pagamentos;
CREATE TRIGGER trigger_atualizar_valor_pago_insert
  AFTER INSERT ON ordem_servico_pagamentos
  FOR EACH ROW
  EXECUTE FUNCTION atualizar_valor_pago_os();

-- Trigger para UPDATE
DROP TRIGGER IF EXISTS trigger_atualizar_valor_pago_update ON ordem_servico_pagamentos;
CREATE TRIGGER trigger_atualizar_valor_pago_update
  AFTER UPDATE ON ordem_servico_pagamentos
  FOR EACH ROW
  EXECUTE FUNCTION atualizar_valor_pago_os();

-- Trigger para DELETE
DROP TRIGGER IF EXISTS trigger_atualizar_valor_pago_delete ON ordem_servico_pagamentos;
CREATE TRIGGER trigger_atualizar_valor_pago_delete
  AFTER DELETE ON ordem_servico_pagamentos
  FOR EACH ROW
  EXECUTE FUNCTION atualizar_valor_pago_os();

-- ========================================
-- TESTE
-- ========================================
-- Após registrar um pagamento, o campo valor_pago da OS será atualizado automaticamente!
-- Basta registrar o pagamento normalmente.