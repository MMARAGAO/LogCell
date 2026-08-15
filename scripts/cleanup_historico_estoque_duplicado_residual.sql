-- Segunda passagem para casos antigos em que mais de uma operação específica
-- coincidia com o mesmo ajuste. Preserva e remove somente ajustes cuja direção
-- é compatível com a operação relacionada.

BEGIN;

DROP TABLE IF EXISTS backups.historico_estoque_ajustes_duplicados_residuais_20260815;

CREATE TABLE backups.historico_estoque_ajustes_duplicados_residuais_20260815 AS
WITH operacoes AS (
    SELECT h.*
    FROM public.historico_estoque h
    WHERE h.tipo_movimentacao IN (
        'saida', 'entrada', 'venda', 'devolucao_venda',
        'baixa_edicao_venda', 'devolucao_edicao_venda',
        'transferencia_saida', 'transferencia_entrada',
        'quebra', 'brinde_aparelho'
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

REVOKE ALL ON TABLE backups.historico_estoque_ajustes_duplicados_residuais_20260815 FROM PUBLIC;

DELETE FROM public.historico_estoque historico
USING backups.historico_estoque_ajustes_duplicados_residuais_20260815 backup
WHERE historico.id = backup.id
  AND historico.tipo_movimentacao = 'ajuste';

SELECT COUNT(*) AS registros_preservados
FROM backups.historico_estoque_ajustes_duplicados_residuais_20260815;

COMMIT;
