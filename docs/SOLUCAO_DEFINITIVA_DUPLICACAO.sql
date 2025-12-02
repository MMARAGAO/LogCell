-- =====================================================
-- SOLUÇÃO DEFINITIVA: Usar flag de sessão para evitar duplicação
-- Funciona para: Vendas, Devoluções, Transferências, OS, etc
-- =====================================================

-- 1. Modificar a função da trigger de venda para setar uma flag
CREATE OR REPLACE FUNCTION baixa_estoque_ao_adicionar_item()
RETURNS TRIGGER AS $$
DECLARE
  v_vendedor_id UUID;
  v_loja_id INT;
  v_quantidade_atual DECIMAL(10,2);
  v_venda_numero INT;
  v_cliente_nome TEXT;
BEGIN
  -- Setar flag para desabilitar trigger de ajuste manual temporariamente
  PERFORM set_config('app.skip_ajuste_manual', 'true', true);
  
  -- Buscar dados da venda
  SELECT vendedor_id, loja_id, numero_venda
  INTO v_vendedor_id, v_loja_id, v_venda_numero
  FROM vendas 
  WHERE id = NEW.venda_id;
  
  -- Buscar nome do cliente
  SELECT c.nome INTO v_cliente_nome
  FROM vendas v
  JOIN clientes c ON c.id = v.cliente_id
  WHERE v.id = NEW.venda_id;
  
  -- Buscar estoque atual
  SELECT quantidade INTO v_quantidade_atual
  FROM estoque_lojas 
  WHERE id_produto = NEW.produto_id 
    AND id_loja = v_loja_id;
  
  -- Deletar registro genérico se foi criado
  DELETE FROM historico_estoque
  WHERE id_produto = NEW.produto_id
    AND id_loja = v_loja_id
    AND observacao = 'Quantidade alterada'
    AND usuario_id = v_vendedor_id
    AND tipo_movimentacao IS NULL
    AND criado_em > NOW() - INTERVAL '1 second';
  
  -- Registrar no histórico ANTES do UPDATE
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
  
  -- Baixar do estoque
  UPDATE estoque_lojas
  SET quantidade = quantidade - NEW.quantidade,
      atualizado_por = v_vendedor_id,
      atualizado_em = NOW()
  WHERE id_produto = NEW.produto_id 
    AND id_loja = v_loja_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Modificar a função de ajuste manual para respeitar a flag
CREATE OR REPLACE FUNCTION public.registrar_historico_ajuste_manual()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    v_usuario_id UUID;
    v_skip_ajuste TEXT;
BEGIN
    -- Verificar se devemos pular (flag setada por outras triggers/operações)
    v_skip_ajuste := current_setting('app.skip_ajuste_manual', true);
    
    IF v_skip_ajuste = 'true' THEN
        -- Resetar a flag
        PERFORM set_config('app.skip_ajuste_manual', 'false', true);
        RETURN NEW;
    END IF;

    -- Capturar o usuário autenticado
    v_usuario_id := COALESCE(
        NEW.atualizado_por, 
        OLD.atualizado_por, 
        auth.uid()
    );

    -- Apenas para UPDATE de quantidade via ajuste manual
    IF TG_OP = 'UPDATE' 
       AND OLD.quantidade IS DISTINCT FROM NEW.quantidade 
       AND NEW.atualizado_por IS NOT NULL THEN
        
        -- Registrar ajuste manual
        INSERT INTO historico_estoque (
            id_produto,
            id_loja,
            quantidade,
            quantidade_anterior,
            quantidade_nova,
            usuario_id,
            tipo_movimentacao,
            observacao
        ) VALUES (
            NEW.id_produto,
            NEW.id_loja,
            ABS(NEW.quantidade - OLD.quantidade),
            OLD.quantidade,
            NEW.quantidade,
            v_usuario_id,
            'ajuste',
            'Ajuste manual de estoque'
        );
    END IF;

    RETURN NEW;
END;
$$;

-- Comentários
COMMENT ON FUNCTION baixa_estoque_ao_adicionar_item() IS 
'Baixa estoque ao adicionar item na venda. Seta flag para desabilitar trigger de ajuste manual.';

COMMENT ON FUNCTION public.registrar_historico_ajuste_manual() IS 
'Registra ajuste manual. Pula se flag app.skip_ajuste_manual estiver true (setada por outras triggers).';

-- =====================================================
-- 3. Criar função auxiliar para UPDATE de estoque com flag
-- =====================================================
-- Esta função pode ser usada no TypeScript para atualizar estoque
-- automaticamente setando a flag

CREATE OR REPLACE FUNCTION public.atualizar_estoque_sem_ajuste(
    p_id_produto UUID,
    p_id_loja INT,
    p_nova_quantidade DECIMAL(10,2),
    p_usuario_id UUID
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
    -- Setar flag para desabilitar trigger de ajuste manual
    PERFORM set_config('app.skip_ajuste_manual', 'true', true);
    
    -- Atualizar estoque
    UPDATE estoque_lojas
    SET quantidade = p_nova_quantidade,
        atualizado_por = p_usuario_id,
        atualizado_em = NOW()
    WHERE id_produto = p_id_produto
      AND id_loja = p_id_loja;
END;
$$;

COMMENT ON FUNCTION public.atualizar_estoque_sem_ajuste IS 
'Atualiza estoque sem registrar ajuste manual (para devoluções, transferências, etc)';

-- =====================================================
-- IMPORTANTE: Para Devoluções, Transferências e OS
-- =====================================================
-- OPÇÃO 1: Usar a função auxiliar no TypeScript:
--
-- await supabase.rpc('atualizar_estoque_sem_ajuste', {
--   p_id_produto: produtoId,
--   p_id_loja: lojaId,
--   p_nova_quantidade: novaQuantidade,
--   p_usuario_id: usuarioId
-- });
--
-- OPÇÃO 2: Setar a flag manualmente antes do UPDATE:
--
-- await supabase.rpc('set_config', { 
--   setting_name: 'app.skip_ajuste_manual', 
--   new_value: 'true', 
--   is_local: true 
-- });
-- // depois fazer o UPDATE normal
--
-- Locais para adicionar:
-- 1. services/vendasService.ts - devoluções e edições de venda
-- 2. services/ordemServicoService.ts - baixa de estoque para OS  
-- 3. services/transferenciasService.ts - transferências entre lojas
-- 4. components/vendas/TrocarProdutoModal.tsx - troca de produtos

-- =====================================================
-- VERIFICAR TRIGGERS
-- =====================================================
SELECT 
    tgname as nome_trigger,
    tgtype as tipo,
    tgenabled as ativo,
    tgrelid::regclass as tabela
FROM pg_trigger
WHERE tgname IN ('trigger_registrar_ajuste_manual', 'trigger_baixa_estoque_ao_adicionar_item');
