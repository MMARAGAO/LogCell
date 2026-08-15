-- Remove apenas o lançamento genérico de ajuste quando existe uma movimentação
-- específica equivalente, do mesmo produto/loja, com o mesmo delta e até dois
-- segundos de distância. Os registros removidos ficam preservados em backups.

BEGIN;

CREATE SCHEMA IF NOT EXISTS backups;
REVOKE ALL ON SCHEMA backups FROM PUBLIC;

DROP TABLE IF EXISTS backups.historico_estoque_ajustes_duplicados_20260815;

CREATE TABLE backups.historico_estoque_ajustes_duplicados_20260815 AS
WITH operacoes AS (
    SELECT h.*
    FROM public.historico_estoque h
    WHERE h.tipo_movimentacao IN (
        'saida',
        'entrada',
        'venda',
        'devolucao_venda',
        'baixa_edicao_venda',
        'devolucao_edicao_venda',
        'transferencia_saida',
        'transferencia_entrada',
        'quebra',
        'brinde_aparelho'
    )
),
pares AS (
    SELECT
        ajuste.*,
        operacao.id AS operacao_id_relacionada,
        operacao.tipo_movimentacao AS operacao_tipo_relacionada,
        operacao.motivo AS operacao_motivo_relacionada,
        operacao.criado_em AS operacao_criada_em,
        ABS(EXTRACT(EPOCH FROM (operacao.criado_em - ajuste.criado_em))) AS intervalo_segundos
    FROM operacoes operacao
    JOIN LATERAL (
        SELECT a.*
        FROM public.historico_estoque a
        WHERE a.tipo_movimentacao = 'ajuste'
          AND a.id_produto = operacao.id_produto
          AND a.id_loja = operacao.id_loja
          AND ABS(a.quantidade_nova - a.quantidade_anterior) = COALESCE(
              NULLIF(ABS(operacao.quantidade_nova - operacao.quantidade_anterior), 0),
              ABS(operacao.quantidade)
          )
          AND (
              (operacao.tipo_movimentacao IN (
                  'saida', 'venda', 'baixa_edicao_venda',
                  'transferencia_saida', 'quebra', 'brinde_aparelho'
               ) AND a.quantidade_nova < a.quantidade_anterior)
              OR
              (operacao.tipo_movimentacao IN (
                  'entrada', 'devolucao_venda', 'devolucao_edicao_venda',
                  'transferencia_entrada'
               ) AND a.quantidade_nova > a.quantidade_anterior)
          )
          AND a.criado_em BETWEEN operacao.criado_em - INTERVAL '2 seconds'
                              AND operacao.criado_em + INTERVAL '2 seconds'
        ORDER BY ABS(EXTRACT(EPOCH FROM (operacao.criado_em - a.criado_em)))
        LIMIT 1
    ) ajuste ON TRUE
)
SELECT DISTINCT ON (id) *
FROM pares
ORDER BY id, intervalo_segundos;

REVOKE ALL ON TABLE backups.historico_estoque_ajustes_duplicados_20260815 FROM PUBLIC;

-- Auditoria que aparece no psql antes da remoção.
SELECT
    operacao_tipo_relacionada AS processo,
    CASE
        WHEN quantidade_nova < quantidade_anterior THEN 'reducao'
        ELSE 'aumento'
    END AS direcao,
    COUNT(*) AS ajustes_duplicados,
    SUM(ABS(quantidade_nova - quantidade_anterior)) AS unidades,
    MIN(criado_em) AS primeiro,
    MAX(criado_em) AS ultimo
FROM backups.historico_estoque_ajustes_duplicados_20260815
GROUP BY 1, 2
ORDER BY 1, 2;

DELETE FROM public.historico_estoque historico
USING backups.historico_estoque_ajustes_duplicados_20260815 backup
WHERE historico.id = backup.id
  AND historico.tipo_movimentacao = 'ajuste';

-- Deve retornar zero: nenhum par identificado pode permanecer no histórico.
SELECT COUNT(*) AS duplicados_restantes
FROM public.historico_estoque historico
JOIN backups.historico_estoque_ajustes_duplicados_20260815 backup
  ON backup.id = historico.id;

COMMIT;

-- Restauração, se algum dia for necessária:
-- INSERT INTO public.historico_estoque
-- SELECT id, id_produto, id_loja, usuario_id, quantidade_anterior,
--        quantidade_nova, quantidade_alterada, observacao, criado_em,
--        id_ordem_servico, tipo_movimentacao, motivo, observacoes, quantidade
-- FROM backups.historico_estoque_ajustes_duplicados_20260815
-- ON CONFLICT (id) DO NOTHING;
