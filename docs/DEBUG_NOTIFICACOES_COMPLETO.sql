-- ==========================================
-- DEBUG COMPLETO DO SISTEMA DE NOTIFICAÇÕES
-- ==========================================

-- 1. Ver últimas notificações criadas (últimas 10)
SELECT 
  id,
  tipo,
  titulo,
  mensagem,
  criado_em,
  produto_id,
  loja_id,
  (SELECT COUNT(*) FROM notificacoes_usuarios WHERE notificacao_id = n.id) as usuarios_notificados
FROM notificacoes n
ORDER BY criado_em DESC
LIMIT 10;

-- 2. Ver estado atual da tabela alertas_estoque_controle
SELECT 
  p.descricao as produto,
  l.nome as loja,
  aec.estado,
  aec.quantidade_atual,
  aec.quantidade_minima,
  aec.ultimo_alerta_em,
  aec.atualizado_em
FROM alertas_estoque_controle aec
JOIN produtos p ON aec.produto_id = p.id
JOIN lojas l ON aec.loja_id = l.id
ORDER BY aec.atualizado_em DESC
LIMIT 10;

-- 3. Ver produtos com estoque baixo/zerado (para testar)
SELECT 
  p.descricao as produto,
  l.nome as loja,
  el.quantidade,
  p.quantidade_minima,
  CASE 
    WHEN el.quantidade = 0 THEN '🔴 ZERADO'
    WHEN el.quantidade <= p.quantidade_minima THEN '🟡 BAIXO'
    ELSE '🟢 OK'
  END as status
FROM estoque_lojas el
JOIN produtos p ON el.id_produto = p.id
JOIN lojas l ON el.id_loja = l.id
WHERE el.quantidade <= p.quantidade_minima
ORDER BY el.quantidade ASC
LIMIT 10;

-- 4. Testar manualmente a função criar_notificacao_estoque
-- (Escolha um produto com estoque baixo da query anterior)
-- SELECT criar_notificacao_estoque(
--   'UUID_DO_PRODUTO'::uuid,
--   ID_DA_LOJA,
--   QUANTIDADE_ATUAL,
--   QUANTIDADE_MINIMA
-- );
