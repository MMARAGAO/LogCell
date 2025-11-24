-- =====================================================
-- TABELA DE TRANSFERÊNCIAS ENTRE LOJAS
-- =====================================================
-- Sistema de transferências com confirmação
-- Status: pendente -> confirmada -> cancelada

-- Criar tabela de transferências
CREATE TABLE IF NOT EXISTS public.transferencias (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  loja_origem_id integer NOT NULL,
  loja_destino_id integer NOT NULL,
  status character varying NOT NULL DEFAULT 'pendente'::character varying 
    CHECK (status::text = ANY (ARRAY['pendente'::character varying, 'confirmada'::character varying, 'cancelada'::character varying]::text[])),
  observacoes text,
  criado_por uuid NOT NULL,
  criado_em timestamp without time zone DEFAULT now(),
  confirmado_por uuid,
  confirmado_em timestamp without time zone,
  cancelado_por uuid,
  cancelado_em timestamp without time zone,
  motivo_cancelamento text,
  CONSTRAINT transferencias_pkey PRIMARY KEY (id),
  CONSTRAINT transferencias_loja_origem_fkey FOREIGN KEY (loja_origem_id) REFERENCES public.lojas(id),
  CONSTRAINT transferencias_loja_destino_fkey FOREIGN KEY (loja_destino_id) REFERENCES public.lojas(id),
  CONSTRAINT transferencias_criado_por_fkey FOREIGN KEY (criado_por) REFERENCES auth.users(id),
  CONSTRAINT transferencias_confirmado_por_fkey FOREIGN KEY (confirmado_por) REFERENCES auth.users(id),
  CONSTRAINT transferencias_cancelado_por_fkey FOREIGN KEY (cancelado_por) REFERENCES auth.users(id)
);

-- Criar tabela de itens da transferência
CREATE TABLE IF NOT EXISTS public.transferencias_itens (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  transferencia_id uuid NOT NULL,
  produto_id uuid NOT NULL,
  quantidade integer NOT NULL CHECK (quantidade > 0),
  criado_em timestamp without time zone DEFAULT now(),
  CONSTRAINT transferencias_itens_pkey PRIMARY KEY (id),
  CONSTRAINT transferencias_itens_transferencia_fkey FOREIGN KEY (transferencia_id) REFERENCES public.transferencias(id) ON DELETE CASCADE,
  CONSTRAINT transferencias_itens_produto_fkey FOREIGN KEY (produto_id) REFERENCES public.produtos(id)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_transferencias_loja_origem ON public.transferencias(loja_origem_id);
CREATE INDEX IF NOT EXISTS idx_transferencias_loja_destino ON public.transferencias(loja_destino_id);
CREATE INDEX IF NOT EXISTS idx_transferencias_status ON public.transferencias(status);
CREATE INDEX IF NOT EXISTS idx_transferencias_criado_em ON public.transferencias(criado_em DESC);
CREATE INDEX IF NOT EXISTS idx_transferencias_itens_transferencia ON public.transferencias_itens(transferencia_id);
CREATE INDEX IF NOT EXISTS idx_transferencias_itens_produto ON public.transferencias_itens(produto_id);

-- Comentários
COMMENT ON TABLE public.transferencias IS 'Transferências de produtos entre lojas - requer confirmação para efetivar';
COMMENT ON TABLE public.transferencias_itens IS 'Itens incluídos em cada transferência';
COMMENT ON COLUMN public.transferencias.status IS 'pendente: aguardando confirmação | confirmada: efetivada no estoque | cancelada: cancelada';

-- =====================================================
-- POLÍTICAS RLS
-- =====================================================

ALTER TABLE public.transferencias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transferencias_itens ENABLE ROW LEVEL SECURITY;

-- Política: Visualizar transferências
DROP POLICY IF EXISTS "Usuários autenticados podem ver transferências" ON public.transferencias;
CREATE POLICY "Usuários autenticados podem ver transferências"
  ON public.transferencias FOR SELECT
  TO authenticated
  USING (true);

-- Política: Criar transferências
DROP POLICY IF EXISTS "Usuários autenticados podem criar transferências" ON public.transferencias;
CREATE POLICY "Usuários autenticados podem criar transferências"
  ON public.transferencias FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Política: Atualizar transferências (confirmar/cancelar)
DROP POLICY IF EXISTS "Usuários autenticados podem atualizar transferências" ON public.transferencias;
CREATE POLICY "Usuários autenticados podem atualizar transferências"
  ON public.transferencias FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Política: Visualizar itens
DROP POLICY IF EXISTS "Usuários autenticados podem ver itens" ON public.transferencias_itens;
CREATE POLICY "Usuários autenticados podem ver itens"
  ON public.transferencias_itens FOR SELECT
  TO authenticated
  USING (true);

-- Política: Criar itens
DROP POLICY IF EXISTS "Usuários autenticados podem criar itens" ON public.transferencias_itens;
CREATE POLICY "Usuários autenticados podem criar itens"
  ON public.transferencias_itens FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- =====================================================
-- FUNCTION: Confirmar Transferência
-- =====================================================
CREATE OR REPLACE FUNCTION confirmar_transferencia(
  p_transferencia_id uuid,
  p_usuario_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_loja_origem integer;
  v_loja_destino integer;
  v_item record;
  v_estoque_origem integer;
  v_estoque_destino integer;
BEGIN
  -- Buscar dados da transferência
  SELECT loja_origem_id, loja_destino_id
  INTO v_loja_origem, v_loja_destino
  FROM transferencias
  WHERE id = p_transferencia_id AND status = 'pendente';

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Transferência não encontrada ou já processada');
  END IF;

  -- Processar cada item
  FOR v_item IN 
    SELECT produto_id, quantidade 
    FROM transferencias_itens 
    WHERE transferencia_id = p_transferencia_id
  LOOP
    -- Verificar estoque origem
    SELECT quantidade INTO v_estoque_origem
    FROM estoque_lojas
    WHERE id_produto = v_item.produto_id AND id_loja = v_loja_origem;

    IF v_estoque_origem IS NULL OR v_estoque_origem < v_item.quantidade THEN
      RETURN jsonb_build_object('success', false, 'error', 'Estoque insuficiente na loja de origem');
    END IF;

    -- Reduzir estoque origem
    UPDATE estoque_lojas
    SET quantidade = quantidade - v_item.quantidade,
        atualizado_por = p_usuario_id,
        atualizado_em = now()
    WHERE id_produto = v_item.produto_id AND id_loja = v_loja_origem;

    -- Registrar histórico saída
    INSERT INTO historico_estoque (
      id_produto, id_loja, tipo_movimentacao,
      quantidade_alterada, quantidade_anterior, quantidade_nova,
      usuario_id, observacao
    ) VALUES (
      v_item.produto_id, v_loja_origem, 'transferencia_saida',
      -v_item.quantidade, v_estoque_origem, v_estoque_origem - v_item.quantidade,
      p_usuario_id, 'Transferência confirmada ID: ' || p_transferencia_id
    );

    -- Verificar se existe estoque no destino
    SELECT quantidade INTO v_estoque_destino
    FROM estoque_lojas
    WHERE id_produto = v_item.produto_id AND id_loja = v_loja_destino;

    IF v_estoque_destino IS NULL THEN
      -- Criar registro no destino
      INSERT INTO estoque_lojas (id_produto, id_loja, quantidade, atualizado_por)
      VALUES (v_item.produto_id, v_loja_destino, v_item.quantidade, p_usuario_id);
      
      v_estoque_destino := 0;
    ELSE
      -- Aumentar estoque destino
      UPDATE estoque_lojas
      SET quantidade = quantidade + v_item.quantidade,
          atualizado_por = p_usuario_id,
          atualizado_em = now()
      WHERE id_produto = v_item.produto_id AND id_loja = v_loja_destino;
    END IF;

    -- Registrar histórico entrada
    INSERT INTO historico_estoque (
      id_produto, id_loja, tipo_movimentacao,
      quantidade_alterada, quantidade_anterior, quantidade_nova,
      usuario_id, observacao
    ) VALUES (
      v_item.produto_id, v_loja_destino, 'transferencia_entrada',
      v_item.quantidade, v_estoque_destino, v_estoque_destino + v_item.quantidade,
      p_usuario_id, 'Transferência confirmada ID: ' || p_transferencia_id
    );
  END LOOP;

  -- Atualizar status da transferência
  UPDATE transferencias
  SET status = 'confirmada',
      confirmado_por = p_usuario_id,
      confirmado_em = now()
  WHERE id = p_transferencia_id;

  RETURN jsonb_build_object('success', true);
END;
$$;

-- =====================================================
-- HABILITAR REALTIME (OPCIONAL)
-- =====================================================
-- ALTER PUBLICATION supabase_realtime ADD TABLE transferencias;
-- ALTER PUBLICATION supabase_realtime ADD TABLE transferencias_itens;
