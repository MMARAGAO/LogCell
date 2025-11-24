-- ============================================
-- TRIGGER SIMPLIFICADA - SEMPRE NOTIFICA
-- Remove a condição de atualizado_por
-- ============================================

DROP TRIGGER IF EXISTS trigger_notificacao_estoque_simples ON estoque_lojas;

CREATE OR REPLACE FUNCTION notificar_estoque_simples()
RETURNS TRIGGER AS $$
DECLARE
  v_produto_nome TEXT;
  v_loja_nome TEXT;
  v_titulo TEXT;
  v_mensagem TEXT;
  v_tipo TEXT;
  v_estado_anterior TEXT;
  v_deve_notificar BOOLEAN := FALSE;
  v_novo_estado TEXT;
  v_quantidade_minima INTEGER;
BEGIN
  -- Buscar quantidade_minima do produto
  SELECT p.quantidade_minima INTO v_quantidade_minima
  FROM produtos p
  WHERE p.id = NEW.id_produto;
  
  -- Buscar nomes do produto e loja
  SELECT p.descricao INTO v_produto_nome
  FROM produtos p
  WHERE p.id = NEW.id_produto;
  
  SELECT l.nome INTO v_loja_nome
  FROM lojas l
  WHERE l.id = NEW.id_loja;
  
  -- Buscar estado anterior
  SELECT estado INTO v_estado_anterior
  FROM alertas_estoque_controle
  WHERE produto_id = NEW.id_produto 
    AND loja_id = NEW.id_loja;
  
  RAISE NOTICE '📊 Verificando: produto=%, loja=%, qtd=%, min=%, estado_ant=%', 
    v_produto_nome, v_loja_nome, NEW.quantidade, v_quantidade_minima, COALESCE(v_estado_anterior, 'nenhum');
  
  -- ============================================
  -- LÓGICA DE NOTIFICAÇÃO
  -- ============================================
  
  -- Caso 1: ESTOQUE ZERADO
  IF NEW.quantidade = 0 THEN
    IF v_estado_anterior IS NULL OR v_estado_anterior != 'zerado' THEN
      v_tipo := 'estoque_zerado';
      v_titulo := 'Estoque Zerado';
      v_mensagem := 'O produto ' || v_produto_nome || ' está com estoque zerado na loja ' || v_loja_nome || '.';
      v_deve_notificar := TRUE;
      RAISE NOTICE '🔴 ZERADO: vai notificar';
    ELSE
      RAISE NOTICE '⚪ ZERADO: já estava zerado';
    END IF;
  
  -- Caso 2: ESTOQUE BAIXO
  ELSIF NEW.quantidade > 0 AND NEW.quantidade <= v_quantidade_minima THEN
    IF v_estado_anterior IS NULL OR v_estado_anterior != 'baixo' THEN
      v_tipo := 'estoque_baixo';
      v_titulo := 'Estoque Baixo';
      v_mensagem := 'O produto ' || v_produto_nome || ' está com estoque baixo na loja ' || v_loja_nome || '. Quantidade atual: ' || NEW.quantidade || ' (Mínimo: ' || v_quantidade_minima || ')';
      v_deve_notificar := TRUE;
      RAISE NOTICE '🟡 BAIXO: vai notificar';
    ELSE
      RAISE NOTICE '⚪ BAIXO: já estava baixo';
    END IF;
  
  -- Caso 3: ESTOQUE REPOSTO
  ELSIF NEW.quantidade > v_quantidade_minima THEN
    IF v_estado_anterior = 'baixo' OR v_estado_anterior = 'zerado' THEN
      v_tipo := 'estoque_reposto';
      v_titulo := 'Estoque Reposto';
      v_mensagem := 'O produto ' || v_produto_nome || ' foi reposto na loja ' || v_loja_nome || '. Quantidade atual: ' || NEW.quantidade || ' (Mínimo: ' || v_quantidade_minima || ')';
      v_deve_notificar := TRUE;
      RAISE NOTICE '🟢 REPOSTO: vai notificar';
    ELSE
      RAISE NOTICE '⚪ NORMAL: continua normal';
    END IF;
  END IF;
  
  -- ============================================
  -- CRIAR NOTIFICAÇÃO SE NECESSÁRIO
  -- ============================================
  
  IF v_deve_notificar THEN
    RAISE NOTICE '✅ Criando notificação: tipo=%', v_tipo;
    
    INSERT INTO notificacoes (
      tipo,
      titulo,
      mensagem,
      produto_id,
      loja_id,
      criado_em
    ) VALUES (
      v_tipo,
      v_titulo,
      v_mensagem,
      NEW.id_produto,
      NEW.id_loja,
      NOW()
    );
    
    RAISE NOTICE '📬 Notificação criada!';
  END IF;
  
  -- ============================================
  -- ATUALIZAR CONTROLE DE ESTADO
  -- ============================================
  
  IF NEW.quantidade = 0 THEN
    v_novo_estado := 'zerado';
  ELSIF NEW.quantidade <= v_quantidade_minima THEN
    v_novo_estado := 'baixo';
  ELSE
    v_novo_estado := 'normal';
  END IF;
  
  INSERT INTO alertas_estoque_controle (
    produto_id,
    loja_id,
    estado,
    quantidade_atual,
    quantidade_minima,
    atualizado_em
  ) VALUES (
    NEW.id_produto,
    NEW.id_loja,
    v_novo_estado,
    NEW.quantidade,
    v_quantidade_minima,
    NOW()
  )
  ON CONFLICT (produto_id, loja_id) 
  DO UPDATE SET
    estado = v_novo_estado,
    quantidade_atual = NEW.quantidade,
    quantidade_minima = v_quantidade_minima,
    atualizado_em = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger que dispara em QUALQUER atualização de quantidade
CREATE TRIGGER trigger_notificacao_estoque_simples
  AFTER UPDATE OF quantidade ON estoque_lojas
  FOR EACH ROW
  WHEN (OLD.quantidade IS DISTINCT FROM NEW.quantidade)
  EXECUTE FUNCTION notificar_estoque_simples();

SELECT '✅ Trigger simplificada instalada! Agora notifica SEMPRE que o estado mudar.' as status;
