-- Corrige a geração duplicada de histórico nas movimentações automáticas.
-- A quantidade e o histórico passam a ser gravados na mesma transação.

BEGIN;

CREATE OR REPLACE FUNCTION public.registrar_historico_ajuste_manual()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
    v_usuario_id UUID;
    v_observacao TEXT;
BEGIN
    -- Funções transacionais de negócio sinalizam que criarão o histórico
    -- específico (OS, RMA, venda etc.). Nesse caso não gerar ajuste manual.
    IF COALESCE(current_setting('app.skip_ajuste_manual', true), 'false') = 'true' THEN
        RETURN NEW;
    END IF;

    v_usuario_id := COALESCE(
        NEW.atualizado_por,
        OLD.atualizado_por,
        auth.uid()
    );

    IF TG_OP = 'UPDATE'
       AND OLD.quantidade IS DISTINCT FROM NEW.quantidade
       AND NEW.atualizado_por IS NOT NULL THEN

        -- Compatibilidade com operações antigas que registram o histórico
        -- antes de atualizar o estoque (vendas e transferências).
        IF EXISTS (
            SELECT 1
            FROM historico_estoque
            WHERE id_produto = NEW.id_produto
              AND id_loja = NEW.id_loja
              AND quantidade_anterior = OLD.quantidade
              AND quantidade_nova = NEW.quantidade
              AND tipo_movimentacao IS DISTINCT FROM 'ajuste'
              AND criado_em >= transaction_timestamp()
        ) THEN
            RETURN NEW;
        END IF;

        v_observacao := NULLIF(TRIM(NEW.observacao), '');

        INSERT INTO historico_estoque (
            id_produto,
            id_loja,
            quantidade,
            quantidade_anterior,
            quantidade_nova,
            quantidade_alterada,
            usuario_id,
            tipo_movimentacao,
            observacao
        ) VALUES (
            NEW.id_produto,
            NEW.id_loja,
            ABS(NEW.quantidade - OLD.quantidade),
            OLD.quantidade,
            NEW.quantidade,
            NEW.quantidade - OLD.quantidade,
            v_usuario_id,
            'ajuste',
            COALESCE(v_observacao, 'Ajuste manual de estoque')
        );
    END IF;

    RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.movimentar_estoque_com_historico(
    p_produto_id uuid,
    p_loja_id integer,
    p_quantidade_delta integer,
    p_tipo_movimentacao text,
    p_usuario_id uuid,
    p_motivo text DEFAULT NULL,
    p_observacao text DEFAULT NULL,
    p_id_ordem_servico uuid DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path TO 'public'
AS $function$
DECLARE
    v_quantidade_anterior integer;
    v_quantidade_nova integer;
    v_historico_id uuid;
BEGIN
    IF p_quantidade_delta = 0 THEN
        RAISE EXCEPTION 'A quantidade da movimentação não pode ser zero';
    END IF;

    IF NULLIF(TRIM(p_tipo_movimentacao), '') IS NULL THEN
        RAISE EXCEPTION 'O tipo da movimentação é obrigatório';
    END IF;

    -- O gatilho de ajuste manual executa na mesma transação, mas deve deixar
    -- esta função criar o lançamento específico da operação.
    PERFORM set_config('app.skip_ajuste_manual', 'true', true);

    SELECT quantidade
      INTO v_quantidade_anterior
      FROM estoque_lojas
     WHERE id_produto = p_produto_id
       AND id_loja = p_loja_id
     FOR UPDATE;

    IF NOT FOUND THEN
        IF p_quantidade_delta < 0 THEN
            RAISE EXCEPTION 'Produto não encontrado no estoque desta loja';
        END IF;

        v_quantidade_anterior := 0;
        v_quantidade_nova := p_quantidade_delta;

        INSERT INTO estoque_lojas (
            id_produto,
            id_loja,
            quantidade,
            atualizado_por,
            atualizado_em
        ) VALUES (
            p_produto_id,
            p_loja_id,
            v_quantidade_nova,
            p_usuario_id,
            NOW()
        );
    ELSE
        v_quantidade_nova := v_quantidade_anterior + p_quantidade_delta;

        IF v_quantidade_nova < 0 THEN
            RAISE EXCEPTION 'Estoque insuficiente. Disponível: %, Solicitado: %',
                v_quantidade_anterior, ABS(p_quantidade_delta);
        END IF;

        UPDATE estoque_lojas
           SET quantidade = v_quantidade_nova,
               atualizado_por = p_usuario_id,
               atualizado_em = NOW()
         WHERE id_produto = p_produto_id
           AND id_loja = p_loja_id;
    END IF;

    INSERT INTO historico_estoque (
        id_produto,
        id_loja,
        quantidade,
        quantidade_anterior,
        quantidade_nova,
        quantidade_alterada,
        usuario_id,
        tipo_movimentacao,
        motivo,
        observacao,
        id_ordem_servico
    ) VALUES (
        p_produto_id,
        p_loja_id,
        ABS(p_quantidade_delta),
        v_quantidade_anterior,
        v_quantidade_nova,
        p_quantidade_delta,
        p_usuario_id,
        p_tipo_movimentacao,
        p_motivo,
        p_observacao,
        p_id_ordem_servico
    )
    RETURNING id INTO v_historico_id;

    RETURN jsonb_build_object(
        'historico_id', v_historico_id,
        'quantidade_anterior', v_quantidade_anterior,
        'quantidade_nova', v_quantidade_nova
    );
END;
$function$;

REVOKE ALL ON FUNCTION public.movimentar_estoque_com_historico(uuid, integer, integer, text, uuid, text, text, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.movimentar_estoque_com_historico(uuid, integer, integer, text, uuid, text, text, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.movimentar_estoque_com_historico(uuid, integer, integer, text, uuid, text, text, uuid) TO service_role;

-- As rotinas abaixo atualizam o estoque e gravam um histórico específico na
-- mesma transação. A sinalização impede que o gatilho gere um ajuste extra.

CREATE OR REPLACE FUNCTION public.registrar_devolucao_estoque()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
DECLARE
  v_produto_id UUID;
  v_loja_id INTEGER;
  v_usuario_id UUID;
  v_numero_venda VARCHAR;
  v_quantidade_anterior INTEGER;
BEGIN
  PERFORM set_config('app.skip_ajuste_manual', 'true', true);

  SELECT iv.produto_id INTO v_produto_id
  FROM itens_venda iv WHERE iv.id = NEW.item_venda_id;

  IF v_produto_id IS NULL THEN
    RAISE EXCEPTION 'Produto não encontrado para item_venda_id: %', NEW.item_venda_id;
  END IF;

  SELECT v.loja_id, v.numero_venda INTO v_loja_id, v_numero_venda
  FROM vendas v JOIN itens_venda iv ON iv.venda_id = v.id
  WHERE iv.id = NEW.item_venda_id;

  IF v_loja_id IS NULL THEN
    RAISE EXCEPTION 'Venda não encontrada para item_venda_id: %', NEW.item_venda_id;
  END IF;

  SELECT dv.realizado_por INTO v_usuario_id
  FROM devolucoes_venda dv WHERE dv.id = NEW.devolucao_id;

  SELECT COALESCE(el.quantidade, 0) INTO v_quantidade_anterior
  FROM estoque_lojas el
  WHERE el.id_produto = v_produto_id AND el.id_loja = v_loja_id
  FOR UPDATE;

  IF v_quantidade_anterior IS NULL THEN
    v_quantidade_anterior := 0;
  END IF;

  INSERT INTO estoque_lojas (id_produto, id_loja, quantidade, atualizado_em, atualizado_por)
  VALUES (v_produto_id, v_loja_id, NEW.quantidade, NOW(), v_usuario_id)
  ON CONFLICT (id_produto, id_loja)
  DO UPDATE SET
    quantidade = estoque_lojas.quantidade + NEW.quantidade,
    atualizado_em = NOW(),
    atualizado_por = v_usuario_id;

  INSERT INTO historico_estoque (
    id_produto, id_loja, tipo_movimentacao, quantidade,
    quantidade_anterior, quantidade_nova, quantidade_alterada,
    motivo, usuario_id, criado_em
  ) VALUES (
    v_produto_id, v_loja_id, 'devolucao_venda', NEW.quantidade,
    v_quantidade_anterior, v_quantidade_anterior + NEW.quantidade, NEW.quantidade,
    'Devolucao da venda #' || COALESCE(v_numero_venda, 'N/A') || ' - ' || COALESCE(NEW.motivo, 'Sem motivo'),
    v_usuario_id, NOW()
  );

  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.devolver_pecas_ao_cancelar_os()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
DECLARE
  v_peca RECORD;
  v_quantidade_anterior INTEGER;
  v_quantidade_nova INTEGER;
BEGIN
  IF NEW.status = 'cancelado' AND (OLD.status IS NULL OR OLD.status != 'cancelado') THEN
    PERFORM set_config('app.skip_ajuste_manual', 'true', true);

    FOR v_peca IN
      SELECT osp.id, osp.id_produto, osp.id_loja, osp.descricao_peca,
             osp.quantidade, osp.estoque_baixado, p.descricao AS produto_descricao
      FROM ordem_servico_pecas osp
      LEFT JOIN produtos p ON p.id = osp.id_produto
      WHERE osp.id_ordem_servico = NEW.id
        AND osp.tipo_produto = 'estoque'
        AND osp.id_produto IS NOT NULL
        AND osp.id_loja IS NOT NULL
    LOOP
      IF COALESCE(v_peca.estoque_baixado, TRUE) = TRUE THEN
        SELECT quantidade INTO v_quantidade_anterior
        FROM estoque_lojas
        WHERE id_produto = v_peca.id_produto AND id_loja = v_peca.id_loja
        FOR UPDATE;

        IF v_quantidade_anterior IS NULL THEN
          CONTINUE;
        END IF;

        v_quantidade_nova := v_quantidade_anterior + v_peca.quantidade;

        UPDATE estoque_lojas
        SET quantidade = v_quantidade_nova,
            atualizado_por = NEW.atualizado_por,
            atualizado_em = NOW()
        WHERE id_produto = v_peca.id_produto AND id_loja = v_peca.id_loja;

        INSERT INTO historico_estoque (
          id_produto, id_loja, id_ordem_servico, tipo_movimentacao,
          quantidade, quantidade_alterada, quantidade_anterior, quantidade_nova,
          motivo, observacao, usuario_id
        ) VALUES (
          v_peca.id_produto, v_peca.id_loja, NEW.id, 'entrada',
          v_peca.quantidade, v_peca.quantidade, v_quantidade_anterior, v_quantidade_nova,
          'Devolução por cancelamento de OS #' || NEW.numero_os,
          COALESCE(v_peca.produto_descricao, v_peca.descricao_peca), NEW.atualizado_por
        );

        UPDATE ordem_servico_pecas SET estoque_baixado = FALSE WHERE id = v_peca.id;
      END IF;
    END LOOP;
  END IF;

  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.processar_quebra_peca()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
DECLARE
  v_quantidade_anterior integer;
  v_quantidade_nova integer;
BEGIN
  IF NEW.aprovado = TRUE AND (OLD.aprovado IS NULL OR OLD.aprovado = FALSE) THEN
    PERFORM set_config('app.skip_ajuste_manual', 'true', true);

    SELECT quantidade INTO v_quantidade_anterior
    FROM estoque_lojas
    WHERE id_produto = NEW.id_produto AND id_loja = NEW.id_loja
    FOR UPDATE;

    IF v_quantidade_anterior IS NULL THEN
      RAISE EXCEPTION 'Produto não encontrado no estoque da loja';
    END IF;

    v_quantidade_nova := v_quantidade_anterior - NEW.quantidade;
    IF v_quantidade_nova < 0 THEN
      RAISE EXCEPTION 'Estoque insuficiente. Disponível: %, Solicitado: %',
        v_quantidade_anterior, NEW.quantidade;
    END IF;

    UPDATE estoque_lojas
    SET quantidade = v_quantidade_nova,
        atualizado_por = NEW.aprovado_por,
        atualizado_em = NOW()
    WHERE id_produto = NEW.id_produto AND id_loja = NEW.id_loja;

    INSERT INTO historico_estoque (
      id_produto, id_loja, tipo_movimentacao, quantidade,
      quantidade_anterior, quantidade_nova, quantidade_alterada,
      motivo, observacao, usuario_id, id_ordem_servico
    ) VALUES (
      NEW.id_produto, NEW.id_loja, 'quebra', NEW.quantidade,
      v_quantidade_anterior, v_quantidade_nova, -NEW.quantidade,
      CONCAT('Quebra aprovada - ', NEW.tipo_ocorrencia), NEW.motivo,
      NEW.aprovado_por, NEW.id_ordem_servico
    );
  END IF;

  RETURN NEW;
END;
$function$;

COMMIT;

NOTIFY pgrst, 'reload schema';
