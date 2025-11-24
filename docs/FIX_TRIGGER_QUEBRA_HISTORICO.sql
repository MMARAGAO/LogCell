-- =====================================================
-- CORRIGIR TRIGGER DE QUEBRA - REMOVER criado_por
-- =====================================================
-- O trigger processar_quebra_peca estava tentando inserir
-- na coluna criado_por do historico_estoque, mas ela não existe

-- 1. VERIFICAR COLUNAS DO HISTORICO_ESTOQUE
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'historico_estoque'
ORDER BY ordinal_position;

-- 2. RECRIAR A TRIGGER SEM CAMPOS QUE NÃO EXISTEM
CREATE OR REPLACE FUNCTION processar_quebra_peca()
RETURNS TRIGGER AS $$
DECLARE
  v_produto RECORD;
BEGIN
  -- Só processar quando aprovado for alterado para TRUE
  IF NEW.aprovado = TRUE AND (OLD.aprovado IS NULL OR OLD.aprovado = FALSE) THEN
    
    -- Buscar informações do produto
    SELECT * INTO v_produto
    FROM produtos
    WHERE id = NEW.id_produto;
    
    -- Deduzir do estoque da loja
    UPDATE estoque_lojas
    SET quantidade = quantidade - NEW.quantidade
    WHERE id_produto = NEW.id_produto
      AND id_loja = NEW.id_loja;
    
    -- Registrar no histórico de estoque
    INSERT INTO historico_estoque (
      id_produto,
      id_loja,
      tipo_movimentacao,
      quantidade,
      quantidade_anterior,
      quantidade_nova,
      quantidade_alterada,
      motivo,
      observacao,
      usuario_id,
      id_ordem_servico
    )
    SELECT 
      NEW.id_produto,
      NEW.id_loja,
      'quebra',
      NEW.quantidade,
      el.quantidade + NEW.quantidade, -- quantidade antes da dedução
      el.quantidade, -- quantidade após dedução
      -NEW.quantidade, -- quantidade alterada (negativo para saída)
      CONCAT('Quebra aprovada - ', NEW.tipo_ocorrencia),
      NEW.motivo,
      NEW.aprovado_por,
      NEW.id_ordem_servico
    FROM estoque_lojas el
    WHERE el.id_produto = NEW.id_produto
      AND el.id_loja = NEW.id_loja;
      
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. VERIFICAR SE A TRIGGER ESTÁ ATIVA
SELECT 
  tgname as trigger_name,
  tgenabled as enabled,
  pg_get_triggerdef(oid) as definition
FROM pg_trigger
WHERE tgname = 'trigger_processar_quebra_peca';

-- 4. TESTE: Aprovar uma quebra pendente (substitua o ID)
-- UPDATE quebra_pecas 
-- SET aprovado = TRUE,
--     aprovado_em = NOW(),
--     aprovado_por = 'SEU_USER_ID_AQUI'
-- WHERE id = 'ID_DA_QUEBRA_AQUI'
--   AND aprovado = FALSE;

-- 5. VERIFICAR HISTÓRICO APÓS APROVAR
-- SELECT * FROM historico_estoque 
-- WHERE tipo_movimentacao = 'quebra'
-- ORDER BY criado_em DESC 
-- LIMIT 5;
