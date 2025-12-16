-- Adicionar permissão vendas.ver_resumo_pagamentos para usuários existentes

-- Atualizar administradores e gerentes com todas as lojas
UPDATE usuarios
SET permissoes = permissoes || jsonb_build_object('vendas.ver_resumo_pagamentos', true)
WHERE perfil IN ('administrador', 'gerente')
  AND todas_lojas = true;

-- Atualizar vendedores
UPDATE usuarios
SET permissoes = permissoes || jsonb_build_object('vendas.ver_resumo_pagamentos', true)
WHERE perfil = 'vendedor';

-- Verificar atualização
SELECT 
  nome, 
  perfil, 
  permissoes->'vendas.ver_resumo_pagamentos' as pode_ver_resumo
FROM usuarios
WHERE perfil IN ('administrador', 'gerente', 'vendedor')
ORDER BY perfil, nome;
