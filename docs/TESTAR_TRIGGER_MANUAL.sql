-- ==========================================
-- TESTE MANUAL DO TRIGGER
-- ==========================================

-- 1. Primeiro, vamos ver o estado ATUAL do produto na loja ATACADO
SELECT 
  el.quantidade as quantidade_atual,
  p.quantidade_minima,
  p.descricao
FROM estoque_lojas el
JOIN produtos p ON el.id_produto = p.id
JOIN lojas l ON el.id_loja = l.id
WHERE p.descricao ILIKE '%iphone 17%'
  AND l.nome = 'ATACADO';

-- 2. Fazer UPDATE manual para FORÇAR o trigger
-- (Ajuste o UUID e ID da loja conforme necessário)
UPDATE estoque_lojas
SET quantidade = 10
WHERE id_produto = 'e138eed1-e316-4d2a-990e-7f1ebdee06c7'
  AND id_loja = 16;

-- 3. Verificar se nova notificação foi criada
SELECT 
  id,
  tipo,
  titulo,
  mensagem,
  criado_em
FROM notificacoes
ORDER BY criado_em DESC
LIMIT 3;

-- 4. Ver estado do controle
SELECT 
  estado,
  quantidade_atual,
  quantidade_minima,
  ultimo_alerta_em
FROM alertas_estoque_controle
WHERE produto_id = 'e138eed1-e316-4d2a-990e-7f1ebdee06c7'
  AND loja_id = 16;
