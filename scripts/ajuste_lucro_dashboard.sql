-- Ajuste: alinhar LUCRO entre composicao (cards) e ranking de vendedores.
-- Regra unica: lucro PROPORCIONAL ao pago no periodo + custo ciente de DESCONTO (usa valor_total).
--   (1) calcular_composicao_vendas: custo escalado por pago/valor_total (antes: pago/base_bruta) -> ciente de desconto.
--   (2) calcular_metricas_vendedores: lucro_aparelhos proporcional ao pago (antes: margem cheia).
-- Receitas NAO mudam. So o lucro.

-- ============================ (1) COMPOSICAO ============================
CREATE OR REPLACE FUNCTION public.calcular_composicao_vendas(p_data_inicio text, p_data_fim text, p_loja_id bigint DEFAULT NULL::bigint)
 RETURNS TABLE(total numeric, produtos numeric, acessorios numeric, aparelhos numeric, lucro_produtos numeric, lucro_acessorios numeric, lucro_aparelhos numeric, lucro_total numeric)
 LANGUAGE sql
 STABLE SECURITY DEFINER
AS $function$
  WITH
  pag AS (
    SELECT pv.venda_id,
           SUM(pv.valor)::NUMERIC AS pago,
           MAX(v.valor_total)::NUMERIC AS valor_total,
           SUM(CASE WHEN pv.tipo_pagamento IN ('cartao_credito','cartao_debito')
               THEN COALESCE(pv.valor - pv.liquido,0) ELSE 0 END)::NUMERIC AS taxas
    FROM pagamentos_venda pv
    JOIN vendas v ON v.id = pv.venda_id
    WHERE pv.data_pagamento >= p_data_inicio::TIMESTAMPTZ
      AND pv.data_pagamento <= p_data_fim::TIMESTAMPTZ
      AND pv.tipo_pagamento <> 'credito_cliente'
      AND (p_loja_id IS NULL OR v.loja_id = p_loja_id)
    GROUP BY pv.venda_id
  ),
  it AS (
    SELECT iv.venda_id,
           SUM(CASE WHEN COALESCE(pr.is_acessorio,FALSE) IS NOT TRUE THEN iv.subtotal ELSE 0 END)::NUMERIC AS base_prod,
           SUM(CASE WHEN COALESCE(pr.is_acessorio,FALSE) IS TRUE THEN iv.subtotal ELSE 0 END)::NUMERIC AS base_ace,
           SUM(CASE WHEN COALESCE(pr.is_acessorio,FALSE) IS NOT TRUE THEN COALESCE(pr.preco_compra,0) * iv.quantidade ELSE 0 END)::NUMERIC AS custo_prod,
           SUM(CASE WHEN COALESCE(pr.is_acessorio,FALSE) IS TRUE THEN COALESCE(pr.preco_compra,0) * iv.quantidade ELSE 0 END)::NUMERIC AS custo_ace
    FROM itens_venda iv
    JOIN produtos pr ON pr.id = iv.produto_id
    WHERE iv.venda_id IN (SELECT venda_id FROM pag)
    GROUP BY iv.venda_id
  ),
  ap AS (
    SELECT a.venda_id,
           SUM(COALESCE(a.valor_venda,0))::NUMERIC AS base_apa,
           SUM(COALESCE(a.valor_compra,0))::NUMERIC AS custo_apa
    FROM aparelhos a
    WHERE a.venda_id IN (SELECT venda_id FROM pag) AND a.status = 'vendido'
    GROUP BY a.venda_id
  ),
  br AS (
    SELECT ba.venda_id,
           SUM(COALESCE(ba.valor_custo,0))::NUMERIC AS custo_brindes
    FROM brindes_aparelhos ba
    WHERE ba.venda_id IN (SELECT venda_id FROM pag)
    GROUP BY ba.venda_id
  ),
  bases AS (
    SELECT p.venda_id, p.pago, p.taxas, p.valor_total,
           COALESCE(i.base_prod,0) AS base_prod,
           COALESCE(i.base_ace,0) AS base_ace,
           COALESCE(a.base_apa,0) AS base_apa,
           COALESCE(i.custo_prod,0) AS custo_prod,
           COALESCE(i.custo_ace,0) AS custo_ace,
           COALESCE(a.custo_apa,0) + COALESCE(b.custo_brindes,0) AS custo_apa
    FROM pag p
    LEFT JOIN it i ON i.venda_id = p.venda_id
    LEFT JOIN ap a ON a.venda_id = p.venda_id
    LEFT JOIN br b ON b.venda_id = p.venda_id
  ),
  calc AS (
    SELECT
      COALESCE(SUM(rp),0)::NUMERIC AS s_prod,
      COALESCE(SUM(ra),0)::NUMERIC AS s_ace,
      COALESCE(SUM(rap),0)::NUMERIC AS s_apa,
      COALESCE(SUM(lp),0)::NUMERIC AS sl_prod,
      COALESCE(SUM(la),0)::NUMERIC AS sl_ace,
      COALESCE(SUM(lap),0)::NUMERIC AS sl_apa
    FROM (
      SELECT
        CASE WHEN (b.base_prod + b.base_ace + b.base_apa) > 0
          THEN b.base_prod * b.pago / (b.base_prod + b.base_ace + b.base_apa) ELSE b.pago END AS rp,
        CASE WHEN (b.base_prod + b.base_ace + b.base_apa) > 0
          THEN b.base_ace * b.pago / (b.base_prod + b.base_ace + b.base_apa) ELSE 0 END AS ra,
        CASE WHEN (b.base_prod + b.base_ace + b.base_apa) > 0
          THEN b.base_apa * b.pago / (b.base_prod + b.base_ace + b.base_apa) ELSE 0 END AS rap,
        -- LUCRO: receita proporcional (base) menos custo proporcional ao PAGO/VALOR_TOTAL (ciente de desconto)
        CASE WHEN (b.base_prod + b.base_ace + b.base_apa) > 0
          THEN (b.base_prod * b.pago / (b.base_prod + b.base_ace + b.base_apa))
               - (b.custo_prod * b.pago / NULLIF(b.valor_total,0))
          ELSE b.pago END AS lp,
        CASE WHEN (b.base_prod + b.base_ace + b.base_apa) > 0
          THEN (b.base_ace * b.pago / (b.base_prod + b.base_ace + b.base_apa))
               - (b.custo_ace * b.pago / NULLIF(b.valor_total,0))
          ELSE 0 END AS la,
        CASE WHEN (b.base_prod + b.base_ace + b.base_apa) > 0
          THEN (b.base_apa * b.pago / (b.base_prod + b.base_ace + b.base_apa))
               - (b.custo_apa * b.pago / NULLIF(b.valor_total,0))
               - b.taxas
          ELSE 0 END AS lap
      FROM bases b
    ) sub
  )
  SELECT
    ROUND(c.s_prod + c.s_ace + c.s_apa, 2),
    ROUND(c.s_prod, 2),
    ROUND(c.s_ace, 2),
    ROUND(c.s_apa, 2),
    ROUND(c.sl_prod, 2),
    ROUND(c.sl_ace, 2),
    ROUND(c.sl_apa, 2),
    ROUND(c.sl_prod + c.sl_ace + c.sl_apa, 2)
  FROM calc c;
$function$;

-- ============================ (2) RANKING VENDEDORES ============================
CREATE OR REPLACE FUNCTION public.calcular_metricas_vendedores(p_data_inicio timestamp without time zone, p_data_fim timestamp without time zone, p_loja_id integer DEFAULT NULL::integer)
 RETURNS TABLE(vendedor_id text, vendedor_nome text, total_vendas bigint, total_os bigint, receita_vendas numeric, receita_aparelhos numeric, receita_os numeric, receita_total numeric, lucro_vendas numeric, lucro_aparelhos numeric, lucro_os numeric, lucro_total numeric)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    RETURN QUERY
    WITH vendas_periodo AS (
        SELECT v.id, v.valor_total, v.vendedor_id as vid FROM vendas v
        WHERE v.criado_em BETWEEN p_data_inicio::timestamptz AND p_data_fim::timestamptz
          AND v.status != 'cancelada' AND (p_loja_id IS NULL OR v.loja_id = p_loja_id)
          AND v.vendedor_id IS NOT NULL
    ),
    pagamentos_brutos AS (
        SELECT pv.venda_id, SUM(pv.valor) as total_pago
        FROM pagamentos_venda pv
        WHERE pv.criado_em BETWEEN p_data_inicio::timestamptz AND p_data_fim::timestamptz
          AND pv.tipo_pagamento != 'credito_cliente'
        GROUP BY pv.venda_id
    ),
    vendas_pagas AS (
        SELECT v.id, v.valor_total, v.vendedor_id as vid FROM vendas v
        WHERE (p_loja_id IS NULL OR v.loja_id = p_loja_id)
          AND v.status != 'cancelada' AND v.vendedor_id IS NOT NULL
          AND v.id IN (SELECT venda_id FROM pagamentos_brutos)
    ),
    vendas_todas AS (SELECT * FROM vendas_periodo UNION SELECT * FROM vendas_pagas),
    vendas_com_aparelho AS (SELECT DISTINCT venda_id FROM aparelhos WHERE venda_id IS NOT NULL AND status = 'vendido'),
    custos AS (
        SELECT iv.venda_id, COALESCE(SUM(iv.quantidade * COALESCE(p.preco_compra, 0)), 0) as custo_total
        FROM itens_venda iv LEFT JOIN produtos p ON p.id = iv.produto_id
        WHERE iv.venda_id IN (SELECT id FROM vendas_todas) GROUP BY iv.venda_id
    ),
    -- Escopo do aparelho POR VENDA (nao por data_venda) e AGREGADO por venda,
    -- para casar com a composicao (custo de TODOS os aparelhos da venda paga no periodo).
    aparelhos_dados AS (
        SELECT av.venda_id, SUM(av.valor_venda) as valor_venda, SUM(av.valor_compra) as custo_compra
        FROM aparelhos av
        WHERE av.status = 'vendido' AND av.venda_id IS NOT NULL
          AND av.venda_id IN (SELECT id FROM vendas_todas)
          AND (p_loja_id IS NULL OR av.loja_id = p_loja_id)
        GROUP BY av.venda_id
    ),
    brindes AS (SELECT ba.venda_id, COALESCE(SUM(ba.valor_custo), 0) as total_brindes
        FROM brindes_aparelhos ba WHERE ba.venda_id IN (SELECT venda_id FROM aparelhos_dados) GROUP BY ba.venda_id),
    taxas AS (SELECT pv.venda_id, COALESCE(SUM(pv.valor - COALESCE(pv.liquido, 0)), 0) as total_taxas
        FROM pagamentos_venda pv WHERE pv.venda_id IN (SELECT venda_id FROM aparelhos_dados)
          AND pv.criado_em BETWEEN p_data_inicio::timestamptz AND p_data_fim::timestamptz
          AND pv.tipo_pagamento IN ('cartao_credito','cartao_debito') AND COALESCE(pv.liquido, 0) > 0 GROUP BY pv.venda_id),
    vendas_split AS (
        SELECT vt.id, vt.vid, vt.valor_total,
               CASE WHEN va.venda_id IS NOT NULL THEN true ELSE false END as tem_aparelho,
               COALESCE(c.custo_total, 0) as custo,
               COALESCE(ad.valor_venda, 0) as valor_venda_apar, COALESCE(ad.custo_compra, 0) as custo_compra_apar,
               COALESCE(b.total_brindes, 0) as brindes, COALESCE(t.total_taxas, 0) as taxas
        FROM vendas_todas vt
        LEFT JOIN vendas_com_aparelho va ON va.venda_id = vt.id
        LEFT JOIN custos c ON c.venda_id = vt.id
        LEFT JOIN aparelhos_dados ad ON ad.venda_id = vt.id
        LEFT JOIN brindes b ON b.venda_id = vt.id LEFT JOIN taxas t ON t.venda_id = vt.id
    ),
    vendas_agregadas AS (
        SELECT vs.vid,
               COUNT(*) FILTER (WHERE vs.id IN (SELECT id FROM vendas_periodo))::bigint as qtd_vendas,
               SUM(CASE WHEN vs.tem_aparelho THEN COALESCE(pb.total_pago, 0) ELSE 0 END) as receita_aparelhos,
               SUM(CASE WHEN NOT vs.tem_aparelho THEN COALESCE(pb.total_pago, 0) ELSE 0 END) as receita_vendas,
               SUM(CASE WHEN vs.tem_aparelho THEN vs.custo_compra_apar + vs.brindes + vs.taxas ELSE 0 END) as custo_aparelhos,
               -- LUCRO APARELHOS proporcional ao pago (antes: margem cheia); custo ciente de desconto (/valor_total)
               SUM(CASE WHEN vs.tem_aparelho AND COALESCE(vs.valor_total,0) > 0
                        THEN COALESCE(pb.total_pago, 0)
                             - (vs.custo_compra_apar + vs.brindes) * COALESCE(pb.total_pago, 0) / vs.valor_total
                             - vs.taxas
                        ELSE 0 END) as lucro_aparelhos,
               SUM(CASE WHEN vs.tem_aparelho OR COALESCE(vs.valor_total,0) = 0 THEN 0 ELSE COALESCE(pb.total_pago, 0) * (vs.valor_total - vs.custo) / vs.valor_total END) as lucro_vendas
        FROM vendas_split vs LEFT JOIN pagamentos_brutos pb ON pb.venda_id = vs.id GROUP BY vs.vid
    ),
    os_periodo AS (
        SELECT os.id, os.criado_por as oid FROM ordem_servico os
        WHERE os.status NOT IN ('cancelado') AND (p_loja_id IS NULL OR os.id_loja = p_loja_id) AND os.criado_por IS NOT NULL
          AND os.id IN (SELECT osp.id_ordem_servico FROM ordem_servico_pagamentos osp WHERE osp.criado_em BETWEEN p_data_inicio::timestamptz AND p_data_fim::timestamptz)
    ),
    pagamentos_os AS (
        SELECT osp.id_ordem_servico, SUM(osp.valor) as total_pago
        FROM ordem_servico_pagamentos osp WHERE osp.id_ordem_servico IN (SELECT id FROM os_periodo)
          AND osp.criado_em BETWEEN p_data_inicio::timestamptz AND p_data_fim::timestamptz GROUP BY osp.id_ordem_servico
    ),
    custos_os AS (
        SELECT osp.id_ordem_servico, COALESCE(SUM(osp.quantidade * COALESCE(p.preco_compra, 0)), 0) as custo
        FROM ordem_servico_pecas osp LEFT JOIN produtos p ON p.id = osp.id_produto
        WHERE osp.id_ordem_servico IN (SELECT id FROM os_periodo) GROUP BY osp.id_ordem_servico
    ),
    os_agregadas AS (
        SELECT os.oid, COUNT(*) as qtd_os, COALESCE(SUM(pos.total_pago), 0) as receita_os, COALESCE(SUM(c.custo), 0) as custo_os
        FROM os_periodo os LEFT JOIN pagamentos_os pos ON pos.id_ordem_servico = os.id LEFT JOIN custos_os c ON c.id_ordem_servico = os.id GROUP BY os.oid
    ),
    vendedores_list AS (SELECT DISTINCT vid FROM vendas_agregadas UNION SELECT DISTINCT oid FROM os_agregadas)
    SELECT
        vl.vid::text, COALESCE(u.nome, 'Vendedor desconhecido')::text,
        COALESCE(va.qtd_vendas, 0)::bigint, COALESCE(oa.qtd_os, 0)::bigint,
        COALESCE(va.receita_vendas, 0)::numeric, COALESCE(va.receita_aparelhos, 0)::numeric,
        COALESCE(oa.receita_os, 0)::numeric,
        (COALESCE(va.receita_vendas, 0) + COALESCE(va.receita_aparelhos, 0) + COALESCE(oa.receita_os, 0))::numeric,
        COALESCE(va.lucro_vendas, 0)::numeric, COALESCE(va.lucro_aparelhos, 0)::numeric,
        (COALESCE(oa.receita_os, 0) - COALESCE(oa.custo_os, 0))::numeric,
        (COALESCE(va.lucro_vendas, 0) + COALESCE(va.lucro_aparelhos, 0) + (COALESCE(oa.receita_os, 0) - COALESCE(oa.custo_os, 0)))::numeric
    FROM vendedores_list vl
    LEFT JOIN vendas_agregadas va ON va.vid = vl.vid
    LEFT JOIN os_agregadas oa ON oa.oid = vl.vid
    LEFT JOIN usuarios u ON u.id = vl.vid::uuid ORDER BY 8 DESC;
END;
$function$;
