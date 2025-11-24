-- ==========================================
-- CORRIGIR TRIGGER trigger_alerta_estoque
-- ==========================================
-- Remove a condição WHEN problemática e deixa a lógica
-- toda na função trigger_verificar_estoque() que chama
-- criar_notificacao_estoque() com controle inteligente

-- 1. Dropar o trigger antigo
DROP TRIGGER IF EXISTS trigger_alerta_estoque ON public.estoque_lojas;

-- 2. Recriar trigger SEM condição WHEN (deixar lógica na função)
CREATE TRIGGER trigger_alerta_estoque
  AFTER UPDATE OF quantidade ON public.estoque_lojas
  FOR EACH ROW
  EXECUTE FUNCTION trigger_verificar_estoque();

-- 3. Verificar se foi criado corretamente
SELECT 
  t.tgname,
  CASE 
    WHEN t.tgenabled = 'O' THEN 'ENABLED ✅'
    WHEN t.tgenabled = 'D' THEN 'DISABLED ❌'
    ELSE 'OTHER'
  END AS status,
  pg_get_triggerdef(t.oid) as definition
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
WHERE c.relname = 'estoque_lojas'
  AND t.tgname = 'trigger_alerta_estoque';

-- 4. Testar: atualizar quantidade para disparar notificação
UPDATE estoque_lojas
SET quantidade = 10
WHERE id_produto = 'e138eed1-e316-4d2a-990e-7f1ebdee06c7'
  AND id_loja = 16;

-- 5. Verificar se notificação "Estoque Reposto" foi criada
SELECT 
  id,
  tipo,
  titulo,
  mensagem,
  criado_em
FROM notificacoes
ORDER BY criado_em DESC
LIMIT 3;

-- 6. Verificar controle de alertas (deve mostrar estado = 'normal')
SELECT 
  p.descricao as produto,
  l.nome as loja,
  aec.estado,
  aec.quantidade_atual,
  aec.quantidade_minima,
  aec.ultimo_alerta_em
FROM alertas_estoque_controle aec
JOIN produtos p ON aec.produto_id = p.id
JOIN lojas l ON aec.loja_id = l.id
WHERE aec.produto_id = 'e138eed1-e316-4d2a-990e-7f1ebdee06c7'
  AND aec.loja_id = 16;
