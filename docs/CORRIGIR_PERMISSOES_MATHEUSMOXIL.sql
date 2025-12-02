-- CORRIGIR PERMISSÕES DO USUÁRIO matheusmoxil@gmail.com
-- Setar loja_id = 4 e todas_lojas = false

-- 1. Verificar estado atual
SELECT 
  u.email,
  p.loja_id,
  p.todas_lojas,
  p.permissoes
FROM permissoes p
JOIN auth.users u ON u.id = p.usuario_id
WHERE u.email = 'matheusmoxil@gmail.com';

-- 2. Corrigir permissões (executar este UPDATE)
UPDATE permissoes
SET 
  loja_id = 4,
  todas_lojas = false
WHERE usuario_id = (
  SELECT id 
  FROM auth.users 
  WHERE email = 'matheusmoxil@gmail.com'
);

-- 3. Verificar resultado
SELECT 
  u.email,
  p.loja_id,
  p.todas_lojas,
  l.nome AS nome_loja
FROM permissoes p
JOIN auth.users u ON u.id = p.usuario_id
LEFT JOIN lojas l ON l.id = p.loja_id
WHERE u.email = 'matheusmoxil@gmail.com';
