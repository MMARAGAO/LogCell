-- DEBUG: Por que não notifica ao zerar estoque em venda real?

-- 1. Verificar estado atual do produto ATACADO
SELECT 
  'Estado ATACADO' as info,
  el.id_produto,
  el.id_loja,
  p.nome as produto,
  l.nome as loja,
  el.quantidade as qtd_atual,
  el.quantidade_minima,
  aec.estado_atual,
  aec.quantidade_registrada,
  aec.atualizado_em as controle_atualizado
FROM estoque_lojas el
JOIN produtos p ON p.id = el.id_produto
JOIN lojas l ON l.id = el.id_loja
LEFT JOIN alertas_estoque_controle aec ON aec.id_produto = el.id_produto AND aec.id_loja = el.id_loja
WHERE p.nome ILIKE '%atacado%'
ORDER BY el.atualizado_em DESC;

-- 2. Ver últimas notificações de ATACADO
SELECT 
  'Notificações ATACADO' as info,
  n.tipo,
  n.titulo,
  n.mensagem,
  n.criado_em,
  TO_CHAR(n.criado_em, 'DD/MM/YYYY HH24:MI:SS') as data_formatada
FROM notificacoes n
WHERE n.mensagem ILIKE '%atacado%'
ORDER BY n.criado_em DESC
LIMIT 5;

-- 3. Ver histórico recente de ATACADO
SELECT 
  'Histórico ATACADO' as info,
  he.tipo_movimentacao,
  he.quantidade_anterior,
  he.quantidade_nova,
  he.quantidade_alterada,
  he.observacao,
  u.nome as usuario,
  TO_CHAR(he.criado_em, 'DD/MM/YYYY HH24:MI:SS') as data
FROM historico_estoque he
JOIN produtos p ON p.id = he.id_produto
LEFT JOIN usuarios u ON u.id = he.usuario_id
WHERE p.nome ILIKE '%atacado%'
ORDER BY he.criado_em DESC
LIMIT 10;

-- 4. Verificar se a trigger de alerta existe e está ativa
SELECT 
  'Trigger alerta_estoque' as info,
  tgname as trigger_name,
  tgenabled as enabled,
  pg_get_triggerdef(oid) as definition
FROM pg_trigger
WHERE tgname = 'trigger_alerta_estoque';

-- 5. Verificar se a função criar_notificacao_estoque existe
SELECT 
  'Função criar_notificacao_estoque' as info,
  proname as function_name,
  pg_get_functiondef(oid) as definition
FROM pg_proc
WHERE proname = 'criar_notificacao_estoque';

-- 6. TESTE MANUAL: Simular venda que zera estoque
-- Primeiro, adicionar 1 unidade para testar
DO $$
DECLARE
  v_produto_id INTEGER;
  v_loja_id INTEGER;
  v_qtd_antes INTEGER;
BEGIN
  -- Buscar IDs
  SELECT p.id, l.id INTO v_produto_id, v_loja_id
  FROM produtos p, lojas l
  WHERE p.nome ILIKE '%atacado%' 
    AND l.nome ILIKE '%matriz%'
  LIMIT 1;
  
  -- Ver quantidade atual
  SELECT quantidade INTO v_qtd_antes
  FROM estoque_lojas
  WHERE id_produto = v_produto_id AND id_loja = v_loja_id;
  
  RAISE NOTICE '🔍 Produto ID: %, Loja ID: %, Quantidade antes: %', v_produto_id, v_loja_id, v_qtd_antes;
  
  -- Se está zerado, adicionar 1
  IF v_qtd_antes = 0 THEN
    RAISE NOTICE '➕ Adicionando 1 unidade para teste...';
    UPDATE estoque_lojas
    SET quantidade = 1,
        atualizado_em = NOW(),
        atualizado_por = (SELECT id FROM usuarios WHERE tipo_usuario = 'admin' LIMIT 1)
    WHERE id_produto = v_produto_id AND id_loja = v_loja_id;
  END IF;
  
  -- Aguardar 1 segundo
  PERFORM pg_sleep(1);
  
  -- Agora zerar como em uma venda
  RAISE NOTICE '🛒 Simulando venda que zera estoque...';
  UPDATE estoque_lojas
  SET quantidade = 0,
      atualizado_em = NOW(),
      atualizado_por = (SELECT id FROM usuarios WHERE tipo_usuario = 'admin' LIMIT 1)
  WHERE id_produto = v_produto_id AND id_loja = v_loja_id;
  
  RAISE NOTICE '✅ UPDATE executado! Verificar se notificação foi criada...';
END $$;

-- 7. Verificar resultado do teste
SELECT 
  'Resultado do teste' as info,
  el.quantidade as qtd_atual,
  aec.estado_atual,
  aec.quantidade_registrada,
  (SELECT COUNT(*) FROM notificacoes 
   WHERE tipo = 'estoque_zerado' 
   AND mensagem ILIKE '%atacado%'
   AND criado_em > NOW() - INTERVAL '1 minute') as notif_criadas_ultimo_minuto
FROM estoque_lojas el
JOIN produtos p ON p.id = el.id_produto
JOIN lojas l ON l.id = el.id_loja
LEFT JOIN alertas_estoque_controle aec ON aec.id_produto = el.id_produto AND aec.id_loja = el.id_loja
WHERE p.nome ILIKE '%atacado%' AND l.nome ILIKE '%matriz%';
