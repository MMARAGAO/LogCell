-- ============================================
-- VERIFICAR POR QUE NÃO NOTIFICOU AO REPOR
-- ============================================

-- 1. Ver produto que você acabou de repor
SELECT 
  'Produto recém atualizado' as info,
  el.id_produto,
  el.id_loja,
  p.descricao as produto,
  l.nome as loja,
  el.quantidade as qtd_atual,
  p.quantidade_minima,
  aec.estado as estado_controle,
  aec.quantidade_atual as qtd_no_controle,
  TO_CHAR(el.atualizado_em, 'DD/MM/YYYY HH24:MI:SS') as ultima_atualizacao
FROM estoque_lojas el
JOIN produtos p ON p.id = el.id_produto
JOIN lojas l ON l.id = el.id_loja
LEFT JOIN alertas_estoque_controle aec ON aec.produto_id = el.id_produto AND aec.loja_id = el.id_loja
ORDER BY el.atualizado_em DESC
LIMIT 5;

-- 2. Ver últimas notificações criadas
SELECT 
  'Últimas notificações' as info,
  tipo,
  titulo,
  SUBSTRING(mensagem, 1, 80) as mensagem_resumo,
  TO_CHAR(criado_em, 'DD/MM/YYYY HH24:MI:SS') as quando
FROM notificacoes
ORDER BY criado_em DESC
LIMIT 5;

-- 3. Ver estados na tabela de controle
SELECT 
  'Estados no controle' as info,
  aec.produto_id,
  aec.loja_id,
  p.descricao as produto,
  l.nome as loja,
  aec.estado,
  aec.quantidade_atual,
  aec.quantidade_minima,
  TO_CHAR(aec.atualizado_em, 'DD/MM/YYYY HH24:MI:SS') as atualizado
FROM alertas_estoque_controle aec
JOIN produtos p ON p.id = aec.produto_id
JOIN lojas l ON l.id = aec.loja_id
ORDER BY aec.atualizado_em DESC
LIMIT 10;

-- 4. IMPORTANTE: Explicação
SELECT '
🔍 Para notificar "Estoque Reposto", o produto precisa:
  1. Estar com estado "baixo" ou "zerado" na tabela alertas_estoque_controle
  2. A nova quantidade deve ser MAIOR que o quantidade_minima
  
Se não notificou, pode ser porque:
  ❌ O produto já estava com estado "normal" (não estava baixo/zerado)
  ❌ A quantidade ainda está abaixo do mínimo
  ❌ O campo atualizado_por foi preenchido (operação controlada)
  
Verifique os resultados acima para entender!
' as explicacao;
