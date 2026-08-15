-- Relatório de divergências de inventário.
--
-- Mantém separadas quatro métricas:
--   1. redução bruta: todos os ajustes manuais para baixo;
--   2. compensação: aumentos do mesmo produto no período/filtro;
--   3. divergência líquida: redução bruta menos compensações;
--   4. perda confirmada: somente ajustes classificados como quebra_perda.

BEGIN;

-- Classifica novos ajustes a partir do motivo selecionado na tela de
-- inventário. Movimentações automáticas continuam sendo ignoradas por meio da
-- flag app.skip_ajuste_manual, criada na migração de não duplicação.
CREATE OR REPLACE FUNCTION public.registrar_historico_ajuste_manual()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
    v_usuario_id UUID;
    v_observacao TEXT;
    v_motivo TEXT;
BEGIN
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
        v_motivo := CASE
            WHEN v_observacao ILIKE 'Contagem física%' THEN 'contagem_fisica'
            WHEN v_observacao ILIKE 'Correção de erro%' THEN 'correcao_erro'
            WHEN v_observacao ILIKE 'Quebra ou perda%' THEN 'quebra_perda'
            WHEN v_observacao ILIKE 'Devolução%' THEN 'devolucao'
            WHEN v_observacao ILIKE 'Outro%' THEN 'outro'
            ELSE 'nao_classificado'
        END;

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
            v_motivo,
            COALESCE(v_observacao, 'Ajuste manual de estoque')
        );
    END IF;

    RETURN NEW;
END;
$function$;

-- Recupera a classificação dos registros que já possuíam um motivo legível.
UPDATE public.historico_estoque
SET motivo = CASE
    WHEN observacao ILIKE 'Contagem física%' THEN 'contagem_fisica'
    WHEN observacao ILIKE 'Correção de erro%' THEN 'correcao_erro'
    WHEN observacao ILIKE 'Quebra ou perda%' THEN 'quebra_perda'
    WHEN observacao ILIKE 'Devolução%' THEN 'devolucao'
    WHEN observacao ILIKE 'Outro%' THEN 'outro'
    ELSE 'nao_classificado'
END
WHERE tipo_movimentacao = 'ajuste'
  AND motivo IS NULL;

DROP FUNCTION IF EXISTS public.relatorio_perdas_estoque(timestamptz, timestamptz, integer[]);

CREATE FUNCTION public.relatorio_perdas_estoque(
  p_data_inicio timestamptz DEFAULT NULL,
  p_data_fim timestamptz DEFAULT NULL,
  p_loja_ids integer[] DEFAULT NULL
)
RETURNS TABLE (
  id_produto uuid,
  produto_descricao text,
  produto_marca text,
  id_loja integer,
  loja_nome text,
  unidades_perdidas bigint,
  valor_perdido numeric,
  qtd_ajustes bigint,
  ultima_ocorrencia timestamptz,
  unidades_reducao_bruta bigint,
  valor_reducao_bruta numeric,
  unidades_compensadas bigint,
  valor_compensado numeric,
  unidades_divergencia_liquida bigint,
  valor_divergencia_liquida numeric,
  unidades_perda_confirmada bigint,
  valor_perda_confirmada numeric,
  qtd_ajustes_reducao bigint,
  qtd_ajustes_aumento bigint,
  classificacao_pendente boolean
)
LANGUAGE sql
STABLE
SECURITY INVOKER
AS $function$
  WITH ajustes AS (
    SELECT
      h.id_produto,
      p.descricao AS produto_descricao,
      p.marca AS produto_marca,
      h.id_loja,
      l.nome AS loja_nome,
      COALESCE(p.preco_compra, 0) AS preco_compra,
      h.quantidade_anterior,
      h.quantidade_nova,
      h.motivo,
      h.criado_em
    FROM historico_estoque h
    JOIN produtos p ON p.id = h.id_produto
    LEFT JOIN lojas l ON l.id = h.id_loja
    WHERE h.tipo_movimentacao = 'ajuste'
      AND h.quantidade_anterior IS NOT NULL
      AND h.quantidade_nova IS NOT NULL
      AND h.quantidade_nova IS DISTINCT FROM h.quantidade_anterior
      AND (p_data_inicio IS NULL OR h.criado_em >= p_data_inicio)
      AND (p_data_fim IS NULL OR h.criado_em <= p_data_fim)
      AND (p_loja_ids IS NULL OR h.id_loja = ANY(p_loja_ids))
  ),
  agregados AS (
    SELECT
      a.id_produto,
      a.produto_descricao,
      a.produto_marca,
      CASE WHEN COUNT(DISTINCT a.id_loja) = 1 THEN MIN(a.id_loja) END AS id_loja,
      STRING_AGG(DISTINCT COALESCE(a.loja_nome, 'Sem loja'), ', ' ORDER BY COALESCE(a.loja_nome, 'Sem loja')) AS loja_nome,
      MAX(a.preco_compra) AS preco_compra,
      SUM(GREATEST(a.quantidade_anterior - a.quantidade_nova, 0))::bigint AS unidades_reducao,
      SUM(GREATEST(a.quantidade_nova - a.quantidade_anterior, 0))::bigint AS unidades_aumento,
      SUM(
        CASE
          WHEN a.quantidade_nova < a.quantidade_anterior
           AND a.motivo = 'quebra_perda'
          THEN a.quantidade_anterior - a.quantidade_nova
          ELSE 0
        END
      )::bigint AS unidades_confirmadas,
      COUNT(*) FILTER (WHERE a.quantidade_nova < a.quantidade_anterior)::bigint AS qtd_reducoes,
      COUNT(*) FILTER (WHERE a.quantidade_nova > a.quantidade_anterior)::bigint AS qtd_aumentos,
      BOOL_OR(
        a.quantidade_nova < a.quantidade_anterior
        AND COALESCE(a.motivo, 'nao_classificado') = 'nao_classificado'
      ) AS classificacao_pendente,
      MAX(a.criado_em) AS ultima_ocorrencia
    FROM ajustes a
    GROUP BY a.id_produto, a.produto_descricao, a.produto_marca
  ),
  calculados AS (
    SELECT
      ag.*,
      LEAST(ag.unidades_reducao, ag.unidades_aumento)::bigint AS unidades_compensadas,
      GREATEST(ag.unidades_reducao - ag.unidades_aumento, 0)::bigint AS unidades_liquidas
    FROM agregados ag
    WHERE ag.unidades_reducao > 0
  )
  SELECT
    c.id_produto,
    c.produto_descricao,
    c.produto_marca,
    c.id_loja,
    c.loja_nome,
    c.unidades_reducao AS unidades_perdidas,
    (c.unidades_reducao * c.preco_compra)::numeric AS valor_perdido,
    c.qtd_reducoes AS qtd_ajustes,
    c.ultima_ocorrencia,
    c.unidades_reducao AS unidades_reducao_bruta,
    (c.unidades_reducao * c.preco_compra)::numeric AS valor_reducao_bruta,
    c.unidades_compensadas,
    (c.unidades_compensadas * c.preco_compra)::numeric AS valor_compensado,
    c.unidades_liquidas AS unidades_divergencia_liquida,
    (c.unidades_liquidas * c.preco_compra)::numeric AS valor_divergencia_liquida,
    c.unidades_confirmadas AS unidades_perda_confirmada,
    (c.unidades_confirmadas * c.preco_compra)::numeric AS valor_perda_confirmada,
    c.qtd_reducoes AS qtd_ajustes_reducao,
    c.qtd_aumentos AS qtd_ajustes_aumento,
    c.classificacao_pendente
  FROM calculados c
  ORDER BY valor_divergencia_liquida DESC, valor_reducao_bruta DESC;
$function$;

GRANT EXECUTE ON FUNCTION public.relatorio_perdas_estoque(timestamptz, timestamptz, integer[]) TO authenticated;

COMMIT;

NOTIFY pgrst, 'reload schema';
