-- ========================================
-- POPULAR NOTIFICAÇÕES ANTIGAS (149 e 150)
-- ========================================
-- Adiciona registros em notificacoes_usuarios para as
-- notificações de estoque que foram criadas antes do trigger

DO $$
DECLARE
  v_notif_id INTEGER;
  v_usuario RECORD;
  v_count INTEGER := 0;
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
      
      v_count := v_count + 1;
    END LOOP;
    
    RAISE NOTICE 'Populados registros para notificacao ID=%', v_notif_id;
  END LOOP;
  
  RAISE NOTICE 'Total: % registros criados', v_count;
END $$;

-- Verificar resultado
SELECT 
  'Notificações populadas' as info,
  COUNT(DISTINCT notificacao_id) as quantidade_notificacoes,
  COUNT(*) as total_registros_criados
FROM notificacoes_usuarios
WHERE criado_em > NOW() - INTERVAL '1 minute';

-- Ver últimas notificações novamente
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
