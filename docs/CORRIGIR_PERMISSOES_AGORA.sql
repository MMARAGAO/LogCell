-- DIAGNÓSTICO E CORREÇÃO IMEDIATA

-- 1. Ver TODAS as permissões no banco (sem filtro)
SELECT 
  u.email,
  p.id,
  p.usuario_id,
  p.loja_id,
  p.todas_lojas,
  l.nome as loja_nome
FROM permissoes p
JOIN auth.users u ON u.id = p.usuario_id
LEFT JOIN lojas l ON l.id = p.loja_id
ORDER BY u.email;

-- 2. Verificar especificamente matheusmoxil@gmail.com (SEM RLS)
SELECT 
  u.email,
  p.id,
  p.usuario_id,
  p.loja_id,
  p.todas_lojas,
  p.permissoes
FROM permissoes p
JOIN auth.users u ON u.id = p.usuario_id
WHERE u.email = 'matheusmoxil@gmail.com';

-- 3. Se NÃO existir, inserir permissões
-- Se EXISTIR e estiver errado, executar o UPDATE abaixo

-- OPÇÃO A: Se não existir nenhuma permissão (execute este INSERT)
INSERT INTO permissoes (usuario_id, loja_id, todas_lojas, permissoes)
SELECT 
  id,
  4, -- Loja ESTOQUE
  false,
  '{
    "usuarios": {"visualizar": true, "criar": false, "editar": false, "excluir": false, "gerenciar_permissoes": false},
    "estoque": {"visualizar": true, "criar": true, "editar": true, "excluir": false, "ajustar": true, "transferir": true},
    "vendas": {"visualizar": true, "criar": true, "editar": true, "excluir": false, "aplicar_desconto": true, "desconto_maximo": 10, "ver_custo": false},
    "clientes": {"visualizar": true, "criar": true, "editar": true, "excluir": false},
    "fornecedores": {"visualizar": true, "criar": false, "editar": false, "excluir": false},
    "ordem_servico": {"visualizar": true, "criar": true, "editar": true, "excluir": false, "finalizar": true},
    "rma": {"visualizar": true, "criar": true, "editar": true, "excluir": false},
    "devolucoes": {"visualizar": true, "criar": true, "editar": true, "excluir": false},
    "relatorios": {"visualizar": true, "exportar": false},
    "configuracoes": {"visualizar": false, "editar": false},
    "lojas": {"visualizar": true, "criar": false, "editar": false, "excluir": false}
  }'::jsonb
FROM auth.users
WHERE email = 'matheusmoxil@gmail.com'
ON CONFLICT (usuario_id) DO NOTHING;

-- OPÇÃO B: Se já existir mas está errado (execute este UPDATE)
UPDATE permissoes
SET 
  loja_id = 4,
  todas_lojas = false,
  atualizado_em = NOW()
WHERE usuario_id = (
  SELECT id FROM auth.users WHERE email = 'matheusmoxil@gmail.com'
);

-- 4. Verificar resultado final
SELECT 
  u.email,
  p.loja_id,
  p.todas_lojas,
  l.nome as loja_nome,
  p.permissoes
FROM permissoes p
JOIN auth.users u ON u.id = p.usuario_id
LEFT JOIN lojas l ON l.id = p.loja_id
WHERE u.email = 'matheusmoxil@gmail.com';
