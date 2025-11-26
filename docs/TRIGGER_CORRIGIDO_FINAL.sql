-- =====================================================
-- TRIGGER CORRIGIDO: Baixar estoque SEM verificação prévia
-- =====================================================

CREATE OR REPLACE FUNCTION public.processar_baixa_estoque_os()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  v_estoque_atual INTEGER;
  v_estoque_novo INTEGER;
  v_numero_os INTEGER;
  v_descricao_produto TEXT;
  v_quantidade_minima INTEGER;
  v_linhas_afetadas INTEGER;
BEGIN
  -- Apenas processar se for produto do estoque (não avulso)
  IF NEW.tipo_produto = 'estoque' AND NEW.id_produto IS NOT NULL AND NEW.id_loja IS NOT NULL THEN
    
    -- Log: início
    INSERT INTO debug_logs (contexto, mensagem, dados)
    VALUES ('processar_baixa_estoque_os', 'Iniciando processamento', 
      jsonb_build_object('id_loja', NEW.id_loja, 'id_produto', NEW.id_produto, 'quantidade', NEW.quantidade));
    
    -- Buscar dados da OS e produto
    SELECT numero_os INTO v_numero_os
    FROM ordem_servico
    WHERE id = NEW.id_ordem_servico;

    SELECT descricao, COALESCE(quantidade_minima, 5) 
    INTO v_descricao_produto, v_quantidade_minima
    FROM produtos
    WHERE id = NEW.id_produto;
    
    -- MÉTODO ALTERNATIVO: Usar UPDATE com RETURNING para pegar estoque anterior
    -- Isso evita problemas com RLS e é mais seguro
    UPDATE estoque_lojas
    SET quantidade = quantidade - NEW.quantidade,
        atualizado_em = NOW(),
        atualizado_por = NEW.criado_por
    WHERE id_produto = NEW.id_produto
      AND id_loja = NEW.id_loja
      AND quantidade >= NEW.quantidade  -- Só atualiza se tiver estoque suficiente
    RETURNING quantidade + NEW.quantidade, quantidade 
    INTO v_estoque_atual, v_estoque_novo;
    
    -- Verificar se UPDATE afetou alguma linha
    GET DIAGNOSTICS v_linhas_afetadas = ROW_COUNT;
    
    INSERT INTO debug_logs (contexto, mensagem, dados)
    VALUES ('processar_baixa_estoque_os', 'Resultado do UPDATE', 
      jsonb_build_object(
        'linhas_afetadas', v_linhas_afetadas,
        'estoque_anterior', v_estoque_atual,
        'estoque_novo', v_estoque_novo
      ));
    
    IF v_linhas_afetadas = 0 THEN
      -- Não conseguiu atualizar - ou não existe ou não tem estoque
      -- Buscar estoque atual para dar mensagem correta
      SELECT COALESCE(quantidade, 0) INTO v_estoque_atual
      FROM estoque_lojas
      WHERE id_produto = NEW.id_produto
        AND id_loja = NEW.id_loja;
      
      INSERT INTO debug_logs (contexto, mensagem, dados)
      VALUES ('processar_baixa_estoque_os', 'ERRO: Estoque insuficiente', 
        jsonb_build_object('disponivel', v_estoque_atual, 'necessario', NEW.quantidade));
      
      IF v_estoque_atual IS NULL THEN
        RAISE EXCEPTION 'Produto não encontrado no estoque da loja';
      ELSE
        RAISE EXCEPTION 'Estoque insuficiente! Disponível: %, Necessário: %', 
          v_estoque_atual, NEW.quantidade;
      END IF;
    END IF;
    
    -- Marcar como estoque baixado
    NEW.estoque_baixado := TRUE;
    NEW.data_baixa_estoque := NOW();

    -- Criar notificação se necessário
    BEGIN
      PERFORM criar_notificacao_estoque(
        NEW.id_produto,
        NEW.id_loja,
        v_estoque_novo,
        v_quantidade_minima
      );
    EXCEPTION
      WHEN OTHERS THEN
        INSERT INTO debug_logs (contexto, mensagem, dados)
        VALUES ('processar_baixa_estoque_os', 'Erro ao criar notificação', 
          jsonb_build_object('erro', SQLERRM));
    END;

    -- Registrar no histórico
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
    
    INSERT INTO debug_logs (contexto, mensagem, dados)
    VALUES ('processar_baixa_estoque_os', 'SUCESSO: Estoque baixado', 
      jsonb_build_object('estoque_anterior', v_estoque_atual, 'estoque_novo', v_estoque_novo));
  END IF;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    INSERT INTO debug_logs (contexto, mensagem, dados)
    VALUES ('processar_baixa_estoque_os', 'ERRO FATAL', 
      jsonb_build_object('erro', SQLERRM, 'codigo', SQLSTATE));
    RAISE;
END;
$function$;

COMMENT ON FUNCTION processar_baixa_estoque_os() IS 
'Trigger BEFORE INSERT que baixa estoque usando UPDATE direto com verificação de quantidade.';

SELECT 'Trigger corrigido! Agora delete a peça da OS e tente adicionar novamente.' as resultado;
