-- DEBUG: Verificar se a trigger de alerta está sendo disparada

-- 1. Adicionar 2 unidades no ATACADO
UPDATE estoque_lojas
SET quantidade = 2,
    atualizado_em = NOW(),
    atualizado_por = NULL
WHERE id_produto = 'e138eed1-e316-4d2a-990e-7f1ebdee06c7'
  AND id_loja = 16; -- ATACADO

-- 2. Ver estado atual do controle
SELECT 
    aec.estado,
    aec.quantidade_atual,
    aec.quantidade_minima,
    l.nome as loja
FROM alertas_estoque_controle aec
JOIN lojas l ON l.id = aec.loja_id
WHERE aec.produto_id = 'e138eed1-e316-4d2a-990e-7f1ebdee06c7'
  AND aec.loja_id = 16;

-- 3. Simular venda manual (como a trigger faz)
UPDATE estoque_lojas
SET quantidade = 0,
    atualizado_em = NOW(),
    atualizado_por = '1c0d76a8-563c-47f4-8583-4a8fcb2a063f' -- Seu usuário
WHERE id_produto = 'e138eed1-e316-4d2a-990e-7f1ebdee06c7'
  AND id_loja = 16;

-- 4. Verificar se o controle foi atualizado
SELECT 
    aec.estado,
    aec.quantidade_atual,
    aec.quantidade_minima,
    l.nome as loja,
    TO_CHAR(aec.ultimo_alerta_em, 'DD/MM/YYYY HH24:MI:SS') as ultimo_alerta
FROM alertas_estoque_controle aec
JOIN lojas l ON l.id = aec.loja_id
WHERE aec.produto_id = 'e138eed1-e316-4d2a-990e-7f1ebdee06c7'
  AND aec.loja_id = 16;

-- 5. Ver se notificação foi criada
SELECT 
    n.tipo,
    n.titulo,
    n.mensagem,
    TO_CHAR(n.criado_em, 'DD/MM/YYYY HH24:MI:SS') as data
FROM notificacoes n
WHERE n.produto_id = 'e138eed1-e316-4d2a-990e-7f1ebdee06c7'
  AND n.loja_id = 16
ORDER BY n.criado_em DESC
LIMIT 3;
