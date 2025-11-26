-- =====================================================
-- CORREÇÃO DO TRIGGER DE VALIDAÇÃO
-- Data: 25/11/2025
-- =====================================================
-- Problema: Trigger está bloqueando ENTRADAS também
-- Solução: Validar APENAS movimentações de SAÍDA
-- =====================================================

-- Remover função antiga
DROP FUNCTION IF EXISTS validar_estoque_antes_saida() CASCADE;

-- Criar função corrigida
CREATE OR REPLACE FUNCTION validar_estoque_antes_saida()
RETURNS TRIGGER AS $$
DECLARE
  estoque_atual INTEGER;
  quantidade_saida INTEGER;
BEGIN
  -- ✅ VALIDAR APENAS SAÍDAS (não validar entradas, transferências ou ajustes!)
  IF NEW.tipo_movimentacao IN ('saida', 'venda', 'baixa_edicao_venda', 'quebra') THEN
    
    -- Calcular quantidade de saída (usar campo quantidade)
    quantidade_saida := COALESCE(NEW.quantidade, 0);
    
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

  -- ✅ PERMITIR SEM VALIDAÇÃO:
  -- - Entradas (entrada, devolucao_venda, transferencia_entrada)
  -- - Saída de transferência (transferencia_saida - já validada na função)
  -- - Ajustes manuais (ajuste)
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recriar trigger
DROP TRIGGER IF EXISTS trigger_validar_estoque_saida ON historico_estoque;

CREATE TRIGGER trigger_validar_estoque_saida
  BEFORE INSERT ON historico_estoque
  FOR EACH ROW
  EXECUTE FUNCTION validar_estoque_antes_saida();

-- =====================================================
-- VERIFICAÇÃO
-- =====================================================

SELECT 
  '✅ Trigger atualizado!' as status,
  'Agora permite ENTRADAS e valida apenas SAÍDAS' as descricao;

-- Testar listar triggers
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'trigger_validar_estoque_saida'
  AND event_object_table = 'historico_estoque';
