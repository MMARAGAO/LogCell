-- ============================================
-- VERIFICAR POR QUE NÃO NOTIFICOU AO ZERAR
-- ============================================

-- 1. Ver produtos que foram zerados recentemente
SELECT 
  'Produtos zerados recentemente' as info,
  p.descricao as produto,
  l.nome as loja,
  el.quantidade,
  el.atualizado_por,
  aec.estado,
  TO_CHAR(el.atualizado_em, 'DD/MM/YYYY HH24:MI:SS') as quando_zerou
FROM estoque_lojas el
JOIN produtos p ON p.id = el.id_produto
JOIN lojas l ON l.id = el.id_loja
LEFT JOIN alertas_estoque_controle aec ON aec.produto_id = el.id_produto AND aec.loja_id = el.id_loja
WHERE el.quantidade = 0
  AND el.atualizado_em > NOW() - INTERVAL '5 minutes'
ORDER BY el.atualizado_em DESC;

-- 2. Ver últimas notificações de estoque zerado
SELECT 
  'Notificações de estoque zerado' as info,
  tipo,
  titulo,
  mensagem,
  TO_CHAR(criado_em, 'DD/MM/YYYY HH24:MI:SS') as quando
FROM notificacoes
WHERE tipo = 'estoque_zerado'
  AND criado_em > NOW() - INTERVAL '5 minutes'
ORDER BY criado_em DESC;

-- 3. Ver histórico recente de movimentações
SELECT 
  'Histórico de movimentações' as info,
  p.descricao as produto,
  l.nome as loja,
  he.tipo_movimentacao,
  he.quantidade_anterior,
  he.quantidade_nova,
  he.observacao,
  TO_CHAR(he.criado_em, 'DD/MM/YYYY HH24:MI:SS') as quando
FROM historico_estoque he
JOIN produtos p ON p.id = he.id_produto
JOIN lojas l ON l.id = he.id_loja
WHERE he.criado_em > NOW() - INTERVAL '5 minutes'
ORDER BY he.criado_em DESC;

-- 4. IMPORTANTE: Como você zerou o estoque?
SELECT '
🔍 DIAGNÓSTICO:

Você zerou o estoque de qual forma?

1️⃣ Por uma VENDA no sistema?
   → atualizado_por será preenchido com o vendedor
   → Trigger apenas atualiza estado, NÃO notifica
   → Este é o comportamento correto para evitar spam

2️⃣ Por um AJUSTE MANUAL na tela de Estoque?
   → atualizado_por será preenchido com seu usuário
   → Trigger apenas atualiza estado, NÃO notifica
   → Também correto (você já sabe que zerou)

3️⃣ Por um UPDATE direto no banco?
   → Se atualizado_por = NULL → DEVE notificar ✅
   → Se atualizado_por preenchido → NÃO notifica ⏭️

SOLUÇÃO: 
A trigger só notifica quando atualizado_por é NULL.
Isso previne spam (você não quer notificação de cada venda/ajuste).

Para testar, veja os resultados acima!
' as explicacao;
