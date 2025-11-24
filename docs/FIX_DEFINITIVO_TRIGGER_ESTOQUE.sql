-- =====================================================
-- FIX DEFINITIVO: FORÇAR RECRIAÇÃO DO TRIGGER
-- =====================================================

-- 1. REMOVER TODOS OS TRIGGERS RELACIONADOS
DROP TRIGGER IF EXISTS trigger_reserva_estoque_os ON ordem_servico_pecas CASCADE;
DROP TRIGGER IF EXISTS trigger_baixa_estoque_os ON ordem_servico_pecas CASCADE;
DROP TRIGGER IF EXISTS trigger_alerta_estoque ON estoque_lojas CASCADE;

-- 2. REMOVER FUNÇÕES ANTIGAS
DROP FUNCTION IF EXISTS processar_reserva_estoque_os() CASCADE;
DROP FUNCTION IF EXISTS processar_baixa_estoque_os() CASCADE;

-- 3. CRIAR NOVA FUNÇÃO QUE BAIXA O ESTOQUE
CREATE OR REPLACE FUNCTION processar_baixa_estoque_os()
RETURNS TRIGGER AS $$
DECLARE
  v_estoque_atual INTEGER;
  v_estoque_novo INTEGER;
  v_numero_os INTEGER;
  v_descricao_produto TEXT;
BEGIN
  -- Apenas processar se for produto do estoque (não avulso)
  IF NEW.tipo_produto = 'estoque' AND NEW.id_produto IS NOT NULL AND NEW.id_loja IS NOT NULL THEN
    
    RAISE NOTICE '=== TRIGGER BAIXA ESTOQUE INICIADO ===';
    RAISE NOTICE 'Produto: %, Loja: %, Quantidade: %', NEW.id_produto, NEW.id_loja, NEW.quantidade;
    
    -- Buscar número da OS e descrição do produto
    SELECT numero_os INTO v_numero_os
    FROM ordem_servico
    WHERE id = NEW.id_ordem_servico;

    SELECT descricao INTO v_descricao_produto
    FROM produtos
    WHERE id = NEW.id_produto;

    -- Verificar estoque disponível
    SELECT quantidade INTO v_estoque_atual
    FROM estoque_lojas
    WHERE id_produto = NEW.id_produto
      AND id_loja = NEW.id_loja;
    
    RAISE NOTICE 'Estoque atual: %', v_estoque_atual;

    IF v_estoque_atual IS NULL THEN
      RAISE EXCEPTION 'Produto não encontrado no estoque da loja';
    END IF;

    IF v_estoque_atual < NEW.quantidade THEN
      RAISE EXCEPTION 'Estoque insuficiente. Disponível: %, Solicitado: %', v_estoque_atual, NEW.quantidade;
    END IF;
    
    -- Calcular novo estoque
    v_estoque_novo := v_estoque_atual - NEW.quantidade;

    RAISE NOTICE 'Baixando estoque de % para %', v_estoque_atual, v_estoque_novo;

    -- BAIXAR DO ESTOQUE
    UPDATE estoque_lojas
    SET quantidade = v_estoque_novo,
        atualizado_em = NOW(),
        atualizado_por = NEW.criado_por
    WHERE id_produto = NEW.id_produto
      AND id_loja = NEW.id_loja;
    
    -- Marcar como estoque baixado
    NEW.estoque_baixado := TRUE;
    NEW.data_baixa_estoque := NOW();
    
    RAISE NOTICE 'Estoque baixado com sucesso!';

    -- Se estoque ficou baixo (≤ 5), criar notificação imediatamente
    IF v_estoque_novo <= 5 THEN
      DECLARE
        v_nome_loja TEXT;
        v_notificacao_id INTEGER;
      BEGIN
        SELECT nome INTO v_nome_loja FROM lojas WHERE id = NEW.id_loja;
        
        -- Criar notificação global
        INSERT INTO notificacoes (
          tipo,
          titulo,
          mensagem,
          produto_id,
          loja_id
        ) VALUES (
          'estoque_baixo',
          'Estoque Baixo',
          'Produto "' || COALESCE(v_descricao_produto, 'Desconhecido') || '" na loja "' || COALESCE(v_nome_loja, 'Desconhecida') || '" ficou com estoque baixo (' || v_estoque_novo || ' unidades)',
          NEW.id_produto,
          NEW.id_loja
        ) RETURNING id INTO v_notificacao_id;
        
        -- Criar registro para TODOS os usuários ativos
        INSERT INTO notificacoes_usuarios (notificacao_id, usuario_id, lida)
        SELECT v_notificacao_id, u.id, false
        FROM usuarios u
        WHERE u.ativo = true;
        
        RAISE NOTICE 'Notificação de estoque baixo criada! ID: %', v_notificacao_id;
      EXCEPTION
        WHEN OTHERS THEN
          RAISE NOTICE 'Erro ao criar notificação: %', SQLERRM;
      END;
    END IF;

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
    ) VALUES (
      NEW.id_produto,
      NEW.id_loja,
      'saida',
      NEW.quantidade,
      v_estoque_atual,
      v_estoque_novo,
      NEW.quantidade,
      'ordem_servico',
      'Saída para OS #' || COALESCE(v_numero_os::TEXT, 'N/A') || ' - ' || COALESCE(v_descricao_produto, 'Produto'),
      NEW.criado_por,
      NEW.id_ordem_servico
    );

    RAISE NOTICE '=== TRIGGER BAIXA ESTOQUE FINALIZADO ===';
  ELSE
    RAISE NOTICE 'Produto avulso ou dados incompletos - não processa estoque';
  END IF;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'ERRO NO TRIGGER: %', SQLERRM;
    RAISE;
END;
$$ LANGUAGE plpgsql;

-- 4. CRIAR TRIGGER
CREATE TRIGGER trigger_baixa_estoque_os
  BEFORE INSERT ON ordem_servico_pecas
  FOR EACH ROW
  EXECUTE FUNCTION processar_baixa_estoque_os();

-- 5. RECRIAR TRIGGER DE ALERTA DE ESTOQUE (caso tenha sido removido)
-- Versão simplificada - apenas alerta quando estoque zera ou fica muito baixo
CREATE OR REPLACE FUNCTION trigger_verificar_estoque()
RETURNS TRIGGER AS $$
DECLARE
  v_descricao_produto TEXT;
  v_nome_loja TEXT;
  v_notificacao_id INTEGER;
BEGIN
  -- Se estoque ficou baixo (5 ou menos unidades), criar notificação
  IF NEW.quantidade <= 5 THEN
    SELECT descricao INTO v_descricao_produto
    FROM produtos
    WHERE id = NEW.id_produto;

    SELECT nome INTO v_nome_loja
    FROM lojas
    WHERE id = NEW.id_loja;

    -- Criar notificação global
    INSERT INTO notificacoes (
      tipo,
      titulo,
      mensagem,
      produto_id,
      loja_id
    ) VALUES (
      'estoque_baixo',
      'Estoque Baixo',
      'Produto "' || COALESCE(v_descricao_produto, 'Desconhecido') || '" na loja "' || COALESCE(v_nome_loja, 'Desconhecida') || '" está com estoque baixo (' || NEW.quantidade || ' unidades)',
      NEW.id_produto,
      NEW.id_loja
    ) RETURNING id INTO v_notificacao_id;
    
    -- Criar registro para TODOS os usuários ativos
    INSERT INTO notificacoes_usuarios (notificacao_id, usuario_id, lida)
    SELECT v_notificacao_id, u.id, false
    FROM usuarios u
    WHERE u.ativo = true;
  END IF;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Ignorar erros no trigger de notificação para não bloquear a operação principal
    RAISE NOTICE 'Erro ao criar notificação de estoque: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_alerta_estoque ON estoque_lojas;
CREATE TRIGGER trigger_alerta_estoque
  AFTER UPDATE OF quantidade ON estoque_lojas
  FOR EACH ROW
  WHEN (NEW.quantidade <= 5 AND NEW.quantidade < OLD.quantidade)
  EXECUTE FUNCTION trigger_verificar_estoque();

-- 6. VERIFICAR RESULTADOS
SELECT 
  'Triggers criados:' AS status,
  COUNT(*) AS total
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
WHERE c.relname IN ('ordem_servico_pecas', 'estoque_lojas')
  AND t.tgname NOT LIKE 'RI_%';

SELECT 
  t.tgname AS trigger_name,
  c.relname AS table_name,
  CASE 
    WHEN t.tgenabled = 'O' THEN 'ENABLED'
    ELSE 'DISABLED'
  END AS status
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
WHERE c.relname IN ('ordem_servico_pecas', 'estoque_lojas')
  AND t.tgname NOT LIKE 'RI_%'
ORDER BY c.relname, t.tgname;
