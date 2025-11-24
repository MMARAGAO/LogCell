-- SOLUÇÃO DEFINITIVA: Recriar a função para funcionar com a estrutura atual
-- Esta função dá baixa no estoque ASSIM QUE O ITEM É ADICIONADO

-- 1. Dropar triggers antigas
DROP TRIGGER IF EXISTS trigger_atualizar_estoque_venda ON itens_venda;
DROP TRIGGER IF EXISTS trigger_baixa_estoque_venda_concluida ON vendas;
DROP TRIGGER IF EXISTS trigger_baixa_estoque_ao_adicionar_item ON itens_venda;

-- 2. Criar função para dar baixa quando item é adicionado
CREATE OR REPLACE FUNCTION baixa_estoque_ao_adicionar_item()
RETURNS TRIGGER AS $$
DECLARE
  v_loja_id INTEGER;
  v_quantidade_atual INTEGER;
  v_cliente_nome TEXT;
  v_vendedor_nome TEXT;
  v_vendedor_id UUID;
  v_venda_numero INTEGER;
BEGIN
  -- Buscar informações da venda
  SELECT v.loja_id, v.numero_venda, v.vendedor_id, c.nome, u.nome
  INTO v_loja_id, v_venda_numero, v_vendedor_id, v_cliente_nome, v_vendedor_nome
  FROM vendas v
  LEFT JOIN clientes c ON c.id = v.cliente_id
  LEFT JOIN usuarios u ON u.id = v.vendedor_id
  WHERE v.id = NEW.venda_id;
  
  -- Buscar quantidade atual no estoque
  SELECT quantidade INTO v_quantidade_atual
  FROM estoque_lojas
  WHERE id_produto = NEW.produto_id 
    AND id_loja = v_loja_id;
  
  -- Se não encontrou o estoque, retorna sem fazer nada
  IF v_quantidade_atual IS NULL THEN
    RAISE WARNING 'Produto % não tem estoque na loja %', NEW.produto_id, v_loja_id;
    RETURN NEW;
  END IF;
  
  RAISE NOTICE '🔵 Iniciando baixa de estoque: produto=%, loja=%, qtd_atual=%, qtd_venda=%', 
    NEW.produto_id, v_loja_id, v_quantidade_atual, NEW.quantidade;
  
  -- Atualizar o estoque (REDUZ a quantidade)
  -- IMPORTANTE: preencher atualizado_por faz a trigger genérica ignorar
  UPDATE estoque_lojas
  SET 
    quantidade = quantidade - NEW.quantidade,
    atualizado_em = NOW(),
    atualizado_por = v_vendedor_id
  WHERE id_produto = NEW.produto_id 
    AND id_loja = v_loja_id;
  
  RAISE NOTICE '✅ Estoque atualizado! Nova quantidade=%', (v_quantidade_atual - NEW.quantidade);
  
  -- Deletar registro genérico se foi criado (após o UPDATE)
  DELETE FROM historico_estoque
  WHERE id_produto = NEW.produto_id
    AND id_loja = v_loja_id
    AND observacao = 'Quantidade alterada'
    AND usuario_id = v_vendedor_id
    AND tipo_movimentacao IS NULL
    AND criado_em > NOW() - INTERVAL '1 second';
  
  -- Registrar no histórico com informações completas da venda
  -- Este é o ÚNICO registro que deve ser criado
  INSERT INTO historico_estoque (
    id_produto,
    id_loja,
    usuario_id,
    quantidade_anterior,
    quantidade_nova,
    quantidade_alterada,
    tipo_movimentacao,
    observacao
  ) VALUES (
    NEW.produto_id,
    v_loja_id,
    v_vendedor_id,
    v_quantidade_atual,
    v_quantidade_atual - NEW.quantidade,
    -NEW.quantidade,
    'venda',
    CASE 
      WHEN v_cliente_nome IS NOT NULL THEN
        'Venda #' || COALESCE(v_venda_numero::TEXT, SUBSTRING(NEW.venda_id::TEXT, 1, 8)) || ' - Cliente: ' || v_cliente_nome
      ELSE
        'Venda #' || COALESCE(v_venda_numero::TEXT, SUBSTRING(NEW.venda_id::TEXT, 1, 8))
    END
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Criar trigger que dispara ao adicionar item
CREATE TRIGGER trigger_baixa_estoque_ao_adicionar_item
  AFTER INSERT ON itens_venda
  FOR EACH ROW
  EXECUTE FUNCTION baixa_estoque_ao_adicionar_item();

-- NOTA: Agora a baixa do estoque acontece assim que o item é adicionado à venda
-- E o histórico registra o vendedor, não "Sistema"
-- DELETE remove registro genérico sem bloquear outras triggers
