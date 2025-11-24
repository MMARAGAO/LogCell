-- ============================================
-- CORRIGIR TRIGGER DE NOTIFICAÇÃO V2
-- Problema: Conflito entre triggers quando atualizado_por está preenchido
-- ============================================

-- 1. Dropar trigger antiga
DROP TRIGGER IF EXISTS trigger_notificacao_estoque_simples ON estoque_lojas;

-- 2. Recriar função corrigida
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
  -- ============================================
  -- IMPORTANTE: Evitar conflito com outras triggers
  -- Se atualizado_por está preenchido, significa que é uma operação
  -- controlada (venda, ajuste manual, etc) e outra trigger já está
  -- cuidando da lógica. Apenas atualizamos o controle de estado.
  -- ============================================
  
  -- Buscar quantidade_minima do produto (está na tabela produtos)
  SELECT p.quantidade_minima INTO v_quantidade_minima
  FROM produtos p
  WHERE p.id = NEW.id_produto;
  
  IF NEW.atualizado_por IS NOT NULL THEN
    RAISE NOTICE '⏭️ Operação controlada (atualizado_por preenchido), apenas atualizando estado';
    
    -- Definir estado baseado na quantidade
    IF NEW.quantidade = 0 THEN
      v_novo_estado := 'zerado';
    ELSIF NEW.quantidade <= v_quantidade_minima THEN
      v_novo_estado := 'baixo';
    ELSE
      v_novo_estado := 'normal';
    END IF;
    
    -- Atualizar apenas o controle de estado
    INSERT INTO alertas_estoque_controle (
      id_produto,
      id_loja,
      estado_atual,
      quantidade_registrada,
      atualizado_em
    ) VALUES (
      NEW.id_produto,
      NEW.id_loja,
      v_novo_estado,
      NEW.quantidade,
      NOW()
    )
    ON CONFLICT (id_produto, id_loja) 
    DO UPDATE SET
      estado_atual = v_novo_estado,
      quantidade_registrada = NEW.quantidade,
      atualizado_em = NOW();
    
    RETURN NEW;
  END IF;
  
  -- ============================================
  -- LÓGICA NORMAL DE NOTIFICAÇÃO
  -- (quando atualizado_por é NULL = ajuste automático do sistema)
  -- ============================================
  
  -- Buscar nomes do produto e loja
  SELECT p.descricao INTO v_produto_nome
  FROM produtos p
  WHERE p.id = NEW.id_produto;
  
  SELECT l.nome INTO v_loja_nome
  FROM lojas l
  WHERE l.id = NEW.id_loja;
  
  -- Buscar estado anterior (se existir)
  SELECT estado_atual INTO v_estado_anterior
  FROM alertas_estoque_controle
  WHERE id_produto = NEW.id_produto 
    AND id_loja = NEW.id_loja;
  
  RAISE NOTICE '📊 Verificando estoque: produto=%, loja=%, qtd_nova=%, qtd_min=%, estado_anterior=%', 
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
      RAISE NOTICE '🔴 ZERADO: vai notificar (era: %)', COALESCE(v_estado_anterior, 'novo');
    ELSE
      RAISE NOTICE '⚪ ZERADO: já estava zerado, não notifica';
    END IF;
  
  -- Caso 2: ESTOQUE BAIXO (> 0 e <= mínimo)
  ELSIF NEW.quantidade > 0 AND NEW.quantidade <= v_quantidade_minima THEN
    IF v_estado_anterior IS NULL OR v_estado_anterior != 'baixo' THEN
      v_tipo := 'estoque_baixo';
      v_titulo := 'Estoque Baixo';
      v_mensagem := 'O produto ' || v_produto_nome || ' está com estoque baixo na loja ' || v_loja_nome || '. Quantidade atual: ' || NEW.quantidade || ' (Mínimo: ' || v_quantidade_minima || ')';
      v_deve_notificar := TRUE;
      RAISE NOTICE '🟡 BAIXO: vai notificar (era: %)', COALESCE(v_estado_anterior, 'novo');
    ELSE
      RAISE NOTICE '⚪ BAIXO: já estava baixo, não notifica';
    END IF;
  
  -- Caso 3: ESTOQUE REPOSTO (> mínimo, vindo de baixo ou zerado)
  ELSIF NEW.quantidade > v_quantidade_minima THEN
    IF v_estado_anterior = 'baixo' OR v_estado_anterior = 'zerado' THEN
      v_tipo := 'estoque_reposto';
      v_titulo := 'Estoque Reposto';
      v_mensagem := 'O produto ' || v_produto_nome || ' foi reposto na loja ' || v_loja_nome || '. Quantidade atual: ' || NEW.quantidade || ' (Mínimo: ' || v_quantidade_minima || ')';
      v_deve_notificar := TRUE;
      RAISE NOTICE '🟢 REPOSTO: vai notificar (era: %)', v_estado_anterior;
    ELSE
      RAISE NOTICE '⚪ NORMAL: continua normal, não notifica';
    END IF;
  END IF;
  
  -- ============================================
  -- CRIAR NOTIFICAÇÃO SE NECESSÁRIO
  -- ============================================
  
  IF v_deve_notificar THEN
    RAISE NOTICE '✅ Criando notificação: tipo=%, titulo=%', v_tipo, v_titulo;
    
    INSERT INTO notificacoes (
      tipo,
      titulo,
      mensagem,
      lida,
      criado_em
    ) VALUES (
      v_tipo,
      v_titulo,
      v_mensagem,
      FALSE,
      NOW()
    );
    
    RAISE NOTICE '📬 Notificação criada com sucesso!';
  ELSE
    RAISE NOTICE '⏭️ Não precisa notificar';
  END IF;
  
  -- ============================================
  -- ATUALIZAR TABELA DE CONTROLE
  -- ============================================
  
  -- Definir novo estado
  IF NEW.quantidade = 0 THEN
    v_novo_estado := 'zerado';
  ELSIF NEW.quantidade <= v_quantidade_minima THEN
    v_novo_estado := 'baixo';
  ELSE
    v_novo_estado := 'normal';
  END IF;
  
  RAISE NOTICE '💾 Atualizando controle: estado=%', v_novo_estado;
  
  -- Inserir ou atualizar estado
  INSERT INTO alertas_estoque_controle (
    id_produto,
    id_loja,
    estado_atual,
    quantidade_registrada,
    atualizado_em
  ) VALUES (
    NEW.id_produto,
    NEW.id_loja,
    v_novo_estado,
    NEW.quantidade,
    NOW()
  )
  ON CONFLICT (id_produto, id_loja) 
  DO UPDATE SET
    estado_atual = v_novo_estado,
    quantidade_registrada = NEW.quantidade,
    atualizado_em = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Recriar trigger
CREATE TRIGGER trigger_notificacao_estoque_simples
  AFTER UPDATE OF quantidade ON estoque_lojas
  FOR EACH ROW
  WHEN (OLD.quantidade IS DISTINCT FROM NEW.quantidade)
  EXECUTE FUNCTION notificar_estoque_simples();

-- ============================================
-- VALIDAÇÃO
-- ============================================

SELECT 'Trigger corrigida e instalada!' as status;

-- Verificar se foi criado
SELECT 
  tgname as trigger_name,
  tgenabled as enabled
FROM pg_trigger
WHERE tgname = 'trigger_notificacao_estoque_simples';
