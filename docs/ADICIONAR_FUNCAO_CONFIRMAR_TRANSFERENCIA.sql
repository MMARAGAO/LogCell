-- =====================================================
-- ADICIONAR FUNÇÃO E POLÍTICAS PARA TRANSFERÊNCIAS
-- =====================================================
-- Execute este script no Supabase SQL Editor
-- Suas tabelas 'transferencias' e 'transferencias_itens' já existem
-- =====================================================

-- 1. CRIAR ÍNDICES (melhora performance)
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_transferencias_status ON public.transferencias(status);
CREATE INDEX IF NOT EXISTS idx_transferencias_loja_origem ON public.transferencias(loja_origem_id);
CREATE INDEX IF NOT EXISTS idx_transferencias_loja_destino ON public.transferencias(loja_destino_id);
CREATE INDEX IF NOT EXISTS idx_transferencias_criado_em ON public.transferencias(criado_em);
CREATE INDEX IF NOT EXISTS idx_transferencias_itens_transferencia ON public.transferencias_itens(transferencia_id);
CREATE INDEX IF NOT EXISTS idx_transferencias_itens_produto ON public.transferencias_itens(produto_id);

-- 2. FUNÇÃO PARA CONFIRMAR TRANSFERÊNCIA
-- =====================================================

CREATE OR REPLACE FUNCTION public.confirmar_transferencia(
  p_transferencia_id uuid,
  p_usuario_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_transferencia RECORD;
  v_item RECORD;
  v_estoque_origem RECORD;
  v_estoque_destino RECORD;
  v_produto RECORD;
BEGIN
  -- 1. Buscar dados da transferência
  SELECT * INTO v_transferencia
  FROM public.transferencias
  WHERE id = p_transferencia_id;

  -- Verificar se a transferência existe
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Transferência não encontrada'
    );
  END IF;

  -- Verificar se já foi confirmada ou cancelada
  IF v_transferencia.status != 'pendente' THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Esta transferência já foi ' || v_transferencia.status
    );
  END IF;

  -- 2. Processar cada item da transferência
  FOR v_item IN 
    SELECT ti.*, p.descricao as produto_nome
    FROM public.transferencias_itens ti
    JOIN public.produtos p ON p.id = ti.produto_id
    WHERE ti.transferencia_id = p_transferencia_id
  LOOP
    -- 2.1 Verificar estoque na loja de origem
    SELECT * INTO v_estoque_origem
    FROM public.estoque_lojas
    WHERE id_produto = v_item.produto_id
      AND id_loja = v_transferencia.loja_origem_id;

    IF NOT FOUND THEN
      RETURN jsonb_build_object(
        'success', false,
        'error', 'Produto "' || v_item.produto_nome || '" não encontrado no estoque da loja de origem'
      );
    END IF;

    -- Verificar se há quantidade suficiente
    IF v_estoque_origem.quantidade < v_item.quantidade THEN
      RETURN jsonb_build_object(
        'success', false,
        'error', 'Estoque insuficiente para "' || v_item.produto_nome || '". Disponível: ' || 
                 v_estoque_origem.quantidade || ', Necessário: ' || v_item.quantidade
      );
    END IF;

    -- 2.2 Reduzir estoque na loja de origem
    UPDATE public.estoque_lojas
    SET 
      quantidade = quantidade - v_item.quantidade,
      atualizado_por = p_usuario_id,
      atualizado_em = now()
    WHERE id = v_estoque_origem.id;

    -- Registrar histórico de saída
    INSERT INTO public.historico_estoque (
      id_produto,
      id_loja,
      usuario_id,
      quantidade_anterior,
      quantidade_nova,
      quantidade_alterada,
      tipo_movimentacao,
      motivo,
      observacao
    ) VALUES (
      v_item.produto_id,
      v_transferencia.loja_origem_id,
      p_usuario_id,
      v_estoque_origem.quantidade,
      v_estoque_origem.quantidade - v_item.quantidade,
      -v_item.quantidade,
      'transferencia_saida',
      'Transferência confirmada #' || p_transferencia_id::text,
      'Enviado para loja ID: ' || v_transferencia.loja_destino_id
    );

    -- 2.3 Adicionar estoque na loja de destino
    SELECT * INTO v_estoque_destino
    FROM public.estoque_lojas
    WHERE id_produto = v_item.produto_id
      AND id_loja = v_transferencia.loja_destino_id;

    IF FOUND THEN
      -- Atualizar estoque existente
      UPDATE public.estoque_lojas
      SET 
        quantidade = quantidade + v_item.quantidade,
        atualizado_por = p_usuario_id,
        atualizado_em = now()
      WHERE id = v_estoque_destino.id;

      -- Registrar histórico de entrada
      INSERT INTO public.historico_estoque (
        id_produto,
        id_loja,
        usuario_id,
        quantidade_anterior,
        quantidade_nova,
        quantidade_alterada,
        tipo_movimentacao,
        motivo,
        observacao
      ) VALUES (
        v_item.produto_id,
        v_transferencia.loja_destino_id,
        p_usuario_id,
        v_estoque_destino.quantidade,
        v_estoque_destino.quantidade + v_item.quantidade,
        v_item.quantidade,
        'transferencia_entrada',
        'Transferência confirmada #' || p_transferencia_id::text,
        'Recebido da loja ID: ' || v_transferencia.loja_origem_id
      );
    ELSE
      -- Criar novo registro de estoque
      INSERT INTO public.estoque_lojas (
        id_produto,
        id_loja,
        quantidade,
        atualizado_por,
        atualizado_em
      ) VALUES (
        v_item.produto_id,
        v_transferencia.loja_destino_id,
        v_item.quantidade,
        p_usuario_id,
        now()
      );

      -- Registrar histórico de entrada
      INSERT INTO public.historico_estoque (
        id_produto,
        id_loja,
        usuario_id,
        quantidade_anterior,
        quantidade_nova,
        quantidade_alterada,
        tipo_movimentacao,
        motivo,
        observacao
      ) VALUES (
        v_item.produto_id,
        v_transferencia.loja_destino_id,
        p_usuario_id,
        0,
        v_item.quantidade,
        v_item.quantidade,
        'transferencia_entrada',
        'Transferência confirmada #' || p_transferencia_id::text,
        'Recebido da loja ID: ' || v_transferencia.loja_origem_id
      );
    END IF;
  END LOOP;

  -- 3. Atualizar status da transferência
  UPDATE public.transferencias
  SET 
    status = 'confirmada',
    confirmado_em = now(),
    confirmado_por = p_usuario_id
  WHERE id = p_transferencia_id;

  -- 4. Retornar sucesso
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Transferência confirmada com sucesso'
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Erro ao confirmar transferência: ' || SQLERRM
    );
END;
$$;

-- 3. POLÍTICAS RLS (Row Level Security)
-- =====================================================

-- Habilitar RLS nas tabelas
ALTER TABLE public.transferencias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transferencias_itens ENABLE ROW LEVEL SECURITY;

-- Política para SELECT em transferencias
DROP POLICY IF EXISTS "Usuários podem ver transferências de suas lojas" ON public.transferencias;
CREATE POLICY "Usuários podem ver transferências de suas lojas"
ON public.transferencias
FOR SELECT
TO authenticated
USING (
  -- Usuários podem ver transferências onde sua loja é origem ou destino
  EXISTS (
    SELECT 1 FROM public.permissoes p
    WHERE p.usuario_id = auth.uid()
      AND (
        p.todas_lojas = true
        OR p.loja_id = loja_origem_id
        OR p.loja_id = loja_destino_id
      )
  )
);

-- Política para INSERT em transferencias
DROP POLICY IF EXISTS "Usuários podem criar transferências" ON public.transferencias;
CREATE POLICY "Usuários podem criar transferências"
ON public.transferencias
FOR INSERT
TO authenticated
WITH CHECK (
  -- Usuário deve ter permissão de estoque.transferir
  EXISTS (
    SELECT 1 FROM public.permissoes p
    WHERE p.usuario_id = auth.uid()
      AND p.permissoes->'estoque'->>'transferir' = 'true'
  )
  AND
  -- Usuário deve ter acesso à loja de origem
  EXISTS (
    SELECT 1 FROM public.permissoes p
    WHERE p.usuario_id = auth.uid()
      AND (p.todas_lojas = true OR p.loja_id = loja_origem_id)
  )
);

-- Política para UPDATE em transferencias
DROP POLICY IF EXISTS "Usuários podem atualizar transferências" ON public.transferencias;
CREATE POLICY "Usuários podem atualizar transferências"
ON public.transferencias
FOR UPDATE
TO authenticated
USING (
  -- Pode atualizar se tiver permissão e acesso às lojas
  EXISTS (
    SELECT 1 FROM public.permissoes p
    WHERE p.usuario_id = auth.uid()
      AND p.permissoes->'estoque'->>'transferir' = 'true'
      AND (
        p.todas_lojas = true
        OR p.loja_id = loja_origem_id
        OR p.loja_id = loja_destino_id
      )
  )
);

-- Política para SELECT em transferencias_itens
DROP POLICY IF EXISTS "Usuários podem ver itens de transferências" ON public.transferencias_itens;
CREATE POLICY "Usuários podem ver itens de transferências"
ON public.transferencias_itens
FOR SELECT
TO authenticated
USING (
  -- Pode ver itens se pode ver a transferência
  EXISTS (
    SELECT 1 FROM public.transferencias t
    JOIN public.permissoes p ON p.usuario_id = auth.uid()
    WHERE t.id = transferencia_id
      AND (
        p.todas_lojas = true
        OR p.loja_id = t.loja_origem_id
        OR p.loja_id = t.loja_destino_id
      )
  )
);

-- Política para INSERT em transferencias_itens
DROP POLICY IF EXISTS "Usuários podem adicionar itens" ON public.transferencias_itens;
CREATE POLICY "Usuários podem adicionar itens"
ON public.transferencias_itens
FOR INSERT
TO authenticated
WITH CHECK (
  -- Pode adicionar itens se pode criar transferências
  EXISTS (
    SELECT 1 FROM public.permissoes p
    WHERE p.usuario_id = auth.uid()
      AND p.permissoes->'estoque'->>'transferir' = 'true'
  )
);

-- 4. COMENTÁRIOS (documentação)
-- =====================================================

COMMENT ON FUNCTION public.confirmar_transferencia IS 'Confirma uma transferência pendente e movimenta o estoque entre lojas';

-- =====================================================
-- FIM DO SCRIPT
-- =====================================================

-- Como executar:
-- 1. Copie todo este script
-- 2. Abra o Supabase Dashboard → SQL Editor
-- 3. Cole e execute
-- 4. Recarregue a página de transferências no LogCell
