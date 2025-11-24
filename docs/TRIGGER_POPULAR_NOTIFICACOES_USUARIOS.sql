-- ========================================
-- TRIGGER PARA POPULAR notificacoes_usuarios
-- ========================================
-- Quando uma notificação de estoque é criada,
-- automaticamente cria registros para todos os usuários
-- (ou apenas admins/gerentes, se preferir)

-- 1. Criar a função que popula notificacoes_usuarios
CREATE OR REPLACE FUNCTION popular_notificacoes_usuarios()
RETURNS TRIGGER AS $$
DECLARE
  v_usuario RECORD;
  v_count INTEGER := 0;
BEGIN
  -- Log para debug
  RAISE NOTICE 'Trigger popular_notificacoes_usuarios disparado para notificacao ID=%', NEW.id;
  
  -- Inserir para todos os usuários ativos
  -- (ajuste o WHERE se quiser apenas admins ou gerentes)
  FOR v_usuario IN 
    SELECT id 
    FROM usuarios 
    WHERE ativo = true
  LOOP
    INSERT INTO notificacoes_usuarios (
      notificacao_id,
      usuario_id,
      lida,
      criado_em
    ) VALUES (
      NEW.id,
      v_usuario.id,
      false,
      NOW()
    );
    
    v_count := v_count + 1;
  END LOOP;
  
  RAISE NOTICE 'Criados % registros em notificacoes_usuarios para notificacao ID=%', v_count, NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Criar o trigger
DROP TRIGGER IF EXISTS trigger_popular_notificacoes_usuarios ON notificacoes;

CREATE TRIGGER trigger_popular_notificacoes_usuarios
  AFTER INSERT ON notificacoes
  FOR EACH ROW
  EXECUTE FUNCTION popular_notificacoes_usuarios();

-- ========================================
-- TESTE
-- ========================================

-- 3. Testar criando uma notificação manualmente
DO $$
DECLARE
  v_notif_id INTEGER;
BEGIN
  -- Criar notificação de teste
  INSERT INTO notificacoes (tipo, titulo, mensagem, produto_id, loja_id, criado_em)
  VALUES (
    'estoque_baixo',
    'TESTE - Estoque Baixo',
    'Notificação de teste para verificar se trigger está funcionando',
    'e138eed1-e316-4d2a-990e-7f1ebdee06c7',
    18,
    NOW()
  )
  RETURNING id INTO v_notif_id;
  
  RAISE NOTICE 'Notificação de teste criada com ID=%', v_notif_id;
  
  -- Aguardar um pouco para trigger executar
  PERFORM pg_sleep(0.5);
  
  -- Verificar se foram criados registros em notificacoes_usuarios
  RAISE NOTICE 'Verificando notificacoes_usuarios...';
END $$;

-- 4. Verificar resultado do teste
SELECT 
  'Registros criados para a notificação de teste' as info,
  COUNT(*) as quantidade_usuarios
FROM notificacoes_usuarios nu
WHERE nu.notificacao_id = (
  SELECT id FROM notificacoes 
  WHERE titulo = 'TESTE - Estoque Baixo' 
  ORDER BY criado_em DESC 
  LIMIT 1
);

-- 5. Ver detalhes dos registros criados
SELECT 
  nu.id,
  nu.notificacao_id,
  u.nome as usuario_nome,
  nu.lida,
  nu.criado_em,
  n.titulo as notificacao_titulo
FROM notificacoes_usuarios nu
JOIN usuarios u ON u.id = nu.usuario_id
JOIN notificacoes n ON n.id = nu.notificacao_id
WHERE nu.notificacao_id = (
  SELECT id FROM notificacoes 
  WHERE titulo = 'TESTE - Estoque Baixo' 
  ORDER BY criado_em DESC 
  LIMIT 1
)
ORDER BY u.nome;

-- ========================================
-- POPULAR NOTIFICAÇÕES ANTIGAS (OPCIONAL)
-- ========================================
-- Se quiser adicionar as notificações 146 e 147 que já existem
-- mas não têm registros em notificacoes_usuarios:

/*
DO $$
DECLARE
  v_notif_id INTEGER;
  v_usuario RECORD;
BEGIN
  -- Para cada notificação de estoque que não tem registros em notificacoes_usuarios
  FOR v_notif_id IN 
    SELECT n.id 
    FROM notificacoes n
    WHERE n.tipo IN ('estoque_zerado', 'estoque_baixo', 'estoque_reposto')
    AND n.id NOT IN (SELECT DISTINCT notificacao_id FROM notificacoes_usuarios)
    ORDER BY n.criado_em DESC
  LOOP
    -- Criar registros para todos os usuários ativos
    FOR v_usuario IN 
      SELECT id FROM usuarios WHERE ativo = true
    LOOP
      INSERT INTO notificacoes_usuarios (
        notificacao_id,
        usuario_id,
        lida,
        criado_em
      ) VALUES (
        v_notif_id,
        v_usuario.id,
        false,
        NOW()
      );
    END LOOP;
    
    RAISE NOTICE 'Populados registros para notificacao ID=%', v_notif_id;
  END LOOP;
END $$;

-- Verificar quantas foram populadas
SELECT 
  'Notificações antigas populadas' as info,
  COUNT(DISTINCT notificacao_id) as quantidade_notificacoes,
  COUNT(*) as total_registros
FROM notificacoes_usuarios
WHERE criado_em > NOW() - INTERVAL '1 minute';
*/

-- ========================================
-- VERIFICAÇÃO FINAL
-- ========================================

-- Ver últimas notificações e seus registros em notificacoes_usuarios
SELECT 
  n.id as notif_id,
  n.tipo,
  n.titulo,
  n.criado_em,
  COUNT(nu.id) as usuarios_vinculados
FROM notificacoes n
LEFT JOIN notificacoes_usuarios nu ON nu.notificacao_id = n.id
GROUP BY n.id, n.tipo, n.titulo, n.criado_em
ORDER BY n.criado_em DESC
LIMIT 10;
