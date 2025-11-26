-- =====================================================
-- CRIAR TABELA DE LOGS E TRIGGER COM LOGGING
-- =====================================================

-- 1. Criar tabela de logs (se não existir)
CREATE TABLE IF NOT EXISTS public.debug_logs (
  id BIGSERIAL PRIMARY KEY,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  contexto TEXT,
  mensagem TEXT,
  dados JSONB
);

-- Habilitar RLS
ALTER TABLE public.debug_logs ENABLE ROW LEVEL SECURITY;

-- Política para permitir INSERT de qualquer usuário autenticado
DROP POLICY IF EXISTS "Permitir insert de logs" ON public.debug_logs;
CREATE POLICY "Permitir insert de logs" ON public.debug_logs
  FOR INSERT WITH CHECK (true);

-- Política para permitir SELECT de qualquer usuário autenticado
DROP POLICY IF EXISTS "Permitir select de logs" ON public.debug_logs;
CREATE POLICY "Permitir select de logs" ON public.debug_logs
  FOR SELECT USING (true);

-- 2. Atualizar função do trigger COM LOGGING
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
  v_debug_id BIGINT;
BEGIN
  -- LOG 1: Início
  INSERT INTO debug_logs (contexto, mensagem, dados)
  VALUES (
    'processar_baixa_estoque_os',
    'INÍCIO DO TRIGGER',
    jsonb_build_object(
      'id_loja', NEW.id_loja,
      'id_produto', NEW.id_produto,
      'quantidade', NEW.quantidade,
      'tipo_produto', NEW.tipo_produto,
      'id_ordem_servico', NEW.id_ordem_servico
    )
  ) RETURNING id INTO v_debug_id;
  
  -- Apenas processar se for produto do estoque (não avulso)
  IF NEW.tipo_produto = 'estoque' AND NEW.id_produto IS NOT NULL AND NEW.id_loja IS NOT NULL THEN
    
    -- Buscar número da OS
    SELECT numero_os INTO v_numero_os
    FROM ordem_servico
    WHERE id = NEW.id_ordem_servico;

    -- Buscar descrição do produto e quantidade mínima
    SELECT descricao, COALESCE(quantidade_minima, 5) 
    INTO v_descricao_produto, v_quantidade_minima
    FROM produtos
    WHERE id = NEW.id_produto;
    
    -- LOG 2: Dados carregados
    INSERT INTO debug_logs (contexto, mensagem, dados)
    VALUES (
      'processar_baixa_estoque_os',
      'Dados carregados',
      jsonb_build_object(
        'numero_os', v_numero_os,
        'descricao_produto', v_descricao_produto,
        'quantidade_minima', v_quantidade_minima
      )
    );

    -- CONSULTAR ESTOQUE
    SELECT quantidade INTO v_estoque_atual
    FROM estoque_lojas
    WHERE id_produto = NEW.id_produto
      AND id_loja = NEW.id_loja;
    
    -- LOG 3: Resultado da consulta de estoque
    INSERT INTO debug_logs (contexto, mensagem, dados)
    VALUES (
      'processar_baixa_estoque_os',
      'Consulta de estoque',
      jsonb_build_object(
        'query', 'WHERE id_produto = ' || NEW.id_produto || ' AND id_loja = ' || NEW.id_loja,
        'estoque_encontrado', v_estoque_atual,
        'estoque_is_null', (v_estoque_atual IS NULL)
      )
    );
    
    -- Se não encontrou, logar o que existe
    IF v_estoque_atual IS NULL THEN
      INSERT INTO debug_logs (contexto, mensagem, dados)
      VALUES (
        'processar_baixa_estoque_os',
        'ESTOQUE NÃO ENCONTRADO - Listando o que existe',
        (
          SELECT jsonb_agg(
            jsonb_build_object(
              'id_loja', el.id_loja,
              'nome_loja', l.nome,
              'quantidade', el.quantidade,
              'id_estoque', el.id
            )
          )
          FROM estoque_lojas el
          JOIN lojas l ON l.id = el.id_loja
          WHERE el.id_produto = NEW.id_produto
        )
      );
      
      RAISE EXCEPTION 'Produto não encontrado no estoque da loja';
    END IF;

    -- Verificar estoque insuficiente
    IF v_estoque_atual < NEW.quantidade THEN
      INSERT INTO debug_logs (contexto, mensagem, dados)
      VALUES (
        'processar_baixa_estoque_os',
        'ESTOQUE INSUFICIENTE',
        jsonb_build_object(
          'disponivel', v_estoque_atual,
          'necessario', NEW.quantidade,
          'faltando', NEW.quantidade - v_estoque_atual
        )
      );
      
      RAISE EXCEPTION 'Estoque insuficiente! Disponível: %, Necessário: %', 
        v_estoque_atual, NEW.quantidade;
    END IF;
    
    -- Calcular novo estoque
    v_estoque_novo := v_estoque_atual - NEW.quantidade;
    
    -- LOG 4: Sucesso - vai atualizar
    INSERT INTO debug_logs (contexto, mensagem, dados)
    VALUES (
      'processar_baixa_estoque_os',
      'SUCESSO - Atualizando estoque',
      jsonb_build_object(
        'estoque_anterior', v_estoque_atual,
        'estoque_novo', v_estoque_novo,
        'quantidade_baixada', NEW.quantidade
      )
    );

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
        VALUES (
          'processar_baixa_estoque_os',
          'Erro ao criar notificação',
          jsonb_build_object('erro', SQLERRM)
        );
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
    
  ELSE
    INSERT INTO debug_logs (contexto, mensagem, dados)
    VALUES (
      'processar_baixa_estoque_os',
      'Produto avulso ou dados incompletos - NÃO processa estoque',
      jsonb_build_object(
        'tipo_produto', NEW.tipo_produto,
        'id_produto_is_null', (NEW.id_produto IS NULL),
        'id_loja_is_null', (NEW.id_loja IS NULL)
      )
    );
  END IF;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    INSERT INTO debug_logs (contexto, mensagem, dados)
    VALUES (
      'processar_baixa_estoque_os',
      'ERRO FATAL',
      jsonb_build_object('erro', SQLERRM, 'detalhe', SQLSTATE)
    );
    RAISE;
END;
$function$;

-- Comentário
COMMENT ON FUNCTION processar_baixa_estoque_os() IS 
'Trigger BEFORE INSERT que baixa estoque e cria notificações quando peça é adicionada à OS. Versão com logging em tabela.';

-- 3. Limpar logs antigos (opcional)
TRUNCATE TABLE debug_logs;

SELECT 'Script executado com sucesso! Tabela debug_logs criada e trigger atualizado.' as resultado;
