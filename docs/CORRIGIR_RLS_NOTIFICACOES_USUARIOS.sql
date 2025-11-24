-- ========================================
-- CORRIGIR RLS PARA notificacoes_usuarios
-- ========================================
-- O trigger precisa de permissão para inserir em notificacoes_usuarios

-- 1. Verificar políticas atuais
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'notificacoes_usuarios';

-- 2. Criar política para permitir INSERT de triggers/sistema
-- OPÇÃO A: Permitir INSERT para service_role (usado por triggers)
DROP POLICY IF EXISTS "Sistema pode inserir notificacoes_usuarios" ON notificacoes_usuarios;

CREATE POLICY "Sistema pode inserir notificacoes_usuarios"
ON notificacoes_usuarios
FOR INSERT
TO authenticated, service_role
WITH CHECK (true);

-- 3. Garantir que usuários possam ver suas próprias notificações
DROP POLICY IF EXISTS "Usuarios podem ver suas notificacoes" ON notificacoes_usuarios;

CREATE POLICY "Usuarios podem ver suas notificacoes"
ON notificacoes_usuarios
FOR SELECT
TO authenticated
USING (usuario_id = auth.uid());

-- 4. Permitir usuários atualizarem suas próprias notificações (marcar como lida)
DROP POLICY IF EXISTS "Usuarios podem atualizar suas notificacoes" ON notificacoes_usuarios;

CREATE POLICY "Usuarios podem atualizar suas notificacoes"
ON notificacoes_usuarios
FOR UPDATE
TO authenticated
USING (usuario_id = auth.uid())
WITH CHECK (usuario_id = auth.uid());

-- 5. Verificar se RLS está habilitado
SELECT 
  tablename,
  rowsecurity as rls_habilitado
FROM pg_tables
WHERE tablename = 'notificacoes_usuarios';

-- Se não estiver habilitado, habilitar:
-- ALTER TABLE notificacoes_usuarios ENABLE ROW LEVEL SECURITY;

-- ========================================
-- TESTE
-- ========================================

-- 6. Testar criando uma notificação (deve criar registros em notificacoes_usuarios)
DO $$
DECLARE
  v_notif_id INTEGER;
BEGIN
  INSERT INTO notificacoes (tipo, titulo, mensagem, produto_id, loja_id, criado_em)
  VALUES (
    'estoque_baixo',
    'TESTE RLS - Estoque Baixo',
    'Testando após corrigir RLS',
    'e138eed1-e316-4d2a-990e-7f1ebdee06c7',
    18,
    NOW()
  )
  RETURNING id INTO v_notif_id;
  
  RAISE NOTICE 'Notificação criada: ID=%', v_notif_id;
END $$;

-- 7. Verificar se funcionou
SELECT 
  n.id,
  n.titulo,
  COUNT(nu.id) as usuarios_vinculados
FROM notificacoes n
LEFT JOIN notificacoes_usuarios nu ON nu.notificacao_id = n.id
WHERE n.titulo LIKE 'TESTE RLS%'
GROUP BY n.id, n.titulo;

-- 8. Ver políticas após criação
SELECT 
  policyname,
  cmd as operacao,
  roles
FROM pg_policies
WHERE tablename = 'notificacoes_usuarios'
ORDER BY cmd;
