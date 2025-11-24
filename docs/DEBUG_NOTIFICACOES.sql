-- Ver estrutura da tabela notificacoes
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'notificacoes'
ORDER BY ordinal_position;

-- Ver código da função obter_notificacoes_usuario
SELECT 
  p.proname AS function_name,
  pg_get_functiondef(p.oid) AS function_code
FROM pg_proc p
WHERE p.proname = 'obter_notificacoes_usuario';

-- Ver notificações recentes (qualquer tipo)
SELECT 
  id,
  tipo,
  titulo,
  mensagem,
  usuario_id,
  criado_em
FROM notificacoes
ORDER BY criado_em DESC
LIMIT 20;
