-- =====================================================
-- GERENCIAR PERMISSÕES DE USUÁRIO EM TEMPO REAL
-- =====================================================
-- Este script mostra como gerenciar permissões customizadas
-- para usuários específicos que serão aplicadas em tempo real
-- =====================================================

-- ========================================
-- 1. CONSULTAR PERMISSÕES DE UM USUÁRIO
-- ========================================

-- Ver permissões de um usuário específico
SELECT 
  u.nome,
  u.email,
  u.tipo_usuario,
  p.permissoes,
  p.criado_em,
  p.atualizado_em
FROM usuarios u
LEFT JOIN permissoes p ON p.usuario_id = u.id
WHERE u.id = 'SEU_USUARIO_ID_AQUI';

-- Ver todos os usuários e suas permissões
SELECT 
  u.id,
  u.nome,
  u.email,
  u.tipo_usuario,
  CASE 
    WHEN p.permissoes IS NULL THEN 'Permissões padrão do perfil'
    ELSE 'Permissões customizadas'
  END as tipo_permissoes,
  p.permissoes
FROM usuarios u
LEFT JOIN permissoes p ON p.usuario_id = u.id
ORDER BY u.nome;


-- ========================================
-- 2. DEFINIR PERMISSÕES CUSTOMIZADAS
-- ========================================

-- Exemplo 1: Dar todas as permissões de gerente para um usuário específico
INSERT INTO permissoes (usuario_id, permissoes, criado_em, atualizado_em)
VALUES (
  'ID_DO_USUARIO_AQUI',
  '["clientes.criar", "clientes.editar", "clientes.visualizar", "os.criar", "os.editar", "os.visualizar", "os.concluir", "os.cancelar", "os.pecas.adicionar", "os.pecas.visualizar", "os.fotos.adicionar", "os.fotos.visualizar", "os.fotos.deletar", "os.historico.visualizar", "os.laudo.editar", "os.pagamentos.adicionar", "os.pagamentos.visualizar", "estoque.visualizar", "estoque.editar", "estoque.transferir", "estoque.alertas.visualizar", "estoque.historico.visualizar", "vendas.criar", "vendas.editar", "vendas.visualizar", "vendas.descontos", "vendas.devolucoes", "vendas.pagamentos", "produtos.criar", "produtos.editar", "produtos.visualizar", "produtos.fotos.adicionar", "produtos.fotos.deletar", "fornecedores.criar", "fornecedores.editar", "fornecedores.visualizar", "tecnicos.criar", "tecnicos.editar", "tecnicos.visualizar", "caixa.visualizar", "caixa.abrir", "caixa.fechar", "caixa.sangrias", "dashboard.vendas", "dashboard.os", "dashboard.estoque", "rma.criar", "rma.editar", "rma.visualizar", "quebras.criar", "quebras.editar", "quebras.visualizar"]'::jsonb,
  NOW(),
  NOW()
)
ON CONFLICT (usuario_id) 
DO UPDATE SET 
  permissoes = EXCLUDED.permissoes,
  atualizado_em = NOW();

-- Exemplo 2: Dar permissões limitadas para um vendedor
INSERT INTO permissoes (usuario_id, permissoes, criado_em, atualizado_em)
VALUES (
  'ID_DO_USUARIO_AQUI',
  '["clientes.criar", "clientes.editar", "clientes.visualizar", "vendas.criar", "vendas.editar", "vendas.visualizar", "vendas.descontos", "vendas.pagamentos", "produtos.visualizar", "caixa.visualizar", "caixa.abrir", "caixa.fechar", "caixa.sangrias", "dashboard.vendas", "os.visualizar", "os.criar", "estoque.visualizar", "estoque.alertas.visualizar"]'::jsonb,
  NOW(),
  NOW()
)
ON CONFLICT (usuario_id) 
DO UPDATE SET 
  permissoes = EXCLUDED.permissoes,
  atualizado_em = NOW();

-- Exemplo 3: Dar permissões de técnico
INSERT INTO permissoes (usuario_id, permissoes, criado_em, atualizado_em)
VALUES (
  'ID_DO_USUARIO_AQUI',
  '["os.visualizar", "os.editar", "os.pecas.adicionar", "os.pecas.visualizar", "os.fotos.adicionar", "os.fotos.visualizar", "os.historico.visualizar", "os.laudo.editar", "estoque.visualizar", "estoque.alertas.visualizar", "quebras.criar"]'::jsonb,
  NOW(),
  NOW()
)
ON CONFLICT (usuario_id) 
DO UPDATE SET 
  permissoes = EXCLUDED.permissoes,
  atualizado_em = NOW();


-- ========================================
-- 3. ADICIONAR PERMISSÕES INDIVIDUAIS
-- ========================================

-- Adicionar uma permissão específica a um usuário que já tem permissões customizadas
UPDATE permissoes
SET 
  permissoes = permissoes || '["os.deletar"]'::jsonb,
  atualizado_em = NOW()
WHERE usuario_id = 'ID_DO_USUARIO_AQUI'
  AND NOT permissoes ? 'os.deletar';

-- Adicionar múltiplas permissões de uma vez
UPDATE permissoes
SET 
  permissoes = permissoes || '["usuarios.criar", "usuarios.editar", "usuarios.visualizar"]'::jsonb,
  atualizado_em = NOW()
WHERE usuario_id = 'ID_DO_USUARIO_AQUI';


-- ========================================
-- 4. REMOVER PERMISSÕES INDIVIDUAIS
-- ========================================

-- Remover uma permissão específica
UPDATE permissoes
SET 
  permissoes = permissoes - 'os.deletar',
  atualizado_em = NOW()
WHERE usuario_id = 'ID_DO_USUARIO_AQUI';

-- Remover múltiplas permissões
UPDATE permissoes
SET 
  permissoes = permissoes - 'usuarios.criar' - 'usuarios.editar' - 'usuarios.deletar',
  atualizado_em = NOW()
WHERE usuario_id = 'ID_DO_USUARIO_AQUI';


-- ========================================
-- 5. RESETAR PARA PERMISSÕES PADRÃO
-- ========================================

-- Remover permissões customizadas (volta para permissões do perfil)
DELETE FROM permissoes
WHERE usuario_id = 'ID_DO_USUARIO_AQUI';


-- ========================================
-- 6. TEMPLATES DE PERMISSÕES POR PERFIL
-- ========================================

-- TEMPLATE: Administrador (Todas as permissões)
/*
["clientes.criar", "clientes.editar", "clientes.visualizar", "clientes.deletar", 
"os.criar", "os.editar", "os.visualizar", "os.deletar", "os.concluir", "os.cancelar", 
"os.pecas.adicionar", "os.pecas.visualizar", "os.pecas.remover", 
"os.fotos.adicionar", "os.fotos.visualizar", "os.fotos.deletar", 
"os.historico.visualizar", "os.laudo.editar", 
"os.pagamentos.adicionar", "os.pagamentos.visualizar", "os.pagamentos.editar", 
"estoque.visualizar", "estoque.editar", "estoque.transferir", "estoque.ajustar", 
"estoque.alertas.visualizar", "estoque.alertas.editar", "estoque.historico.visualizar", 
"vendas.criar", "vendas.editar", "vendas.visualizar", "vendas.deletar", 
"vendas.descontos", "vendas.devolucoes", "vendas.pagamentos", 
"produtos.criar", "produtos.editar", "produtos.visualizar", "produtos.deletar", 
"produtos.fotos.adicionar", "produtos.fotos.deletar", 
"fornecedores.criar", "fornecedores.editar", "fornecedores.visualizar", "fornecedores.deletar", 
"usuarios.criar", "usuarios.editar", "usuarios.visualizar", "usuarios.deletar", 
"tecnicos.criar", "tecnicos.editar", "tecnicos.visualizar", "tecnicos.deletar", 
"lojas.criar", "lojas.editar", "lojas.visualizar", "lojas.deletar", 
"caixa.visualizar", "caixa.abrir", "caixa.fechar", "caixa.sangrias", 
"dashboard.vendas", "dashboard.os", "dashboard.estoque", "dashboard.financeiro", 
"rma.criar", "rma.editar", "rma.visualizar", "rma.deletar", 
"quebras.criar", "quebras.editar", "quebras.visualizar", "quebras.aprovar"]
*/

-- TEMPLATE: Gerente
/*
["clientes.criar", "clientes.editar", "clientes.visualizar", 
"os.criar", "os.editar", "os.visualizar", "os.concluir", "os.cancelar", 
"os.pecas.adicionar", "os.pecas.visualizar", 
"os.fotos.adicionar", "os.fotos.visualizar", "os.fotos.deletar", 
"os.historico.visualizar", "os.laudo.editar", 
"os.pagamentos.adicionar", "os.pagamentos.visualizar", 
"estoque.visualizar", "estoque.editar", "estoque.transferir", 
"estoque.alertas.visualizar", "estoque.historico.visualizar", 
"vendas.criar", "vendas.editar", "vendas.visualizar", 
"vendas.descontos", "vendas.devolucoes", "vendas.pagamentos", 
"produtos.criar", "produtos.editar", "produtos.visualizar", 
"produtos.fotos.adicionar", "produtos.fotos.deletar", 
"fornecedores.criar", "fornecedores.editar", "fornecedores.visualizar", 
"tecnicos.criar", "tecnicos.editar", "tecnicos.visualizar", 
"caixa.visualizar", "caixa.abrir", "caixa.fechar", "caixa.sangrias", 
"dashboard.vendas", "dashboard.os", "dashboard.estoque", 
"rma.criar", "rma.editar", "rma.visualizar", 
"quebras.criar", "quebras.editar", "quebras.visualizar"]
*/

-- TEMPLATE: Vendedor
/*
["clientes.criar", "clientes.editar", "clientes.visualizar", 
"vendas.criar", "vendas.editar", "vendas.visualizar", 
"vendas.descontos", "vendas.pagamentos", 
"produtos.visualizar", 
"caixa.visualizar", "caixa.abrir", "caixa.fechar", "caixa.sangrias", 
"dashboard.vendas", 
"os.visualizar", "os.criar", 
"estoque.visualizar", "estoque.alertas.visualizar"]
*/

-- TEMPLATE: Técnico
/*
["os.visualizar", "os.editar", 
"os.pecas.adicionar", "os.pecas.visualizar", 
"os.fotos.adicionar", "os.fotos.visualizar", 
"os.historico.visualizar", "os.laudo.editar", 
"estoque.visualizar", "estoque.alertas.visualizar", 
"quebras.criar"]
*/


-- ========================================
-- 7. EXEMPLOS PRÁTICOS
-- ========================================

-- Dar permissão de criar OS para um vendedor específico
UPDATE permissoes
SET 
  permissoes = permissoes || '["os.criar"]'::jsonb,
  atualizado_em = NOW()
WHERE usuario_id = (SELECT id FROM usuarios WHERE email = 'vendedor@logcell.com');

-- Remover permissão de deletar clientes de um gerente
UPDATE permissoes
SET 
  permissoes = permissoes - 'clientes.deletar',
  atualizado_em = NOW()
WHERE usuario_id = (SELECT id FROM usuarios WHERE email = 'gerente@logcell.com');

-- Verificar se um usuário tem uma permissão específica
SELECT 
  u.nome,
  CASE 
    WHEN p.permissoes @> '["os.deletar"]'::jsonb THEN 'Sim'
    ELSE 'Não'
  END as pode_deletar_os
FROM usuarios u
LEFT JOIN permissoes p ON p.usuario_id = u.id
WHERE u.email = 'vendedor@logcell.com';


-- ========================================
-- 8. AUDITORIA E MONITORAMENTO
-- ========================================

-- Ver quando as permissões foram alteradas pela última vez
SELECT 
  u.nome,
  u.email,
  p.atualizado_em,
  EXTRACT(EPOCH FROM (NOW() - p.atualizado_em))/3600 as horas_desde_ultima_alteracao
FROM usuarios u
INNER JOIN permissoes p ON p.usuario_id = u.id
ORDER BY p.atualizado_em DESC;

-- Contar quantos usuários têm permissões customizadas
SELECT 
  COUNT(*) as usuarios_com_permissoes_customizadas,
  (SELECT COUNT(*) FROM usuarios) as total_usuarios
FROM permissoes;


-- ========================================
-- 9. FUNÇÕES AUXILIARES
-- ========================================

-- Função para adicionar permissão a um usuário
CREATE OR REPLACE FUNCTION adicionar_permissao(
  p_usuario_id UUID,
  p_permissao TEXT
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO permissoes (usuario_id, permissoes, criado_em, atualizado_em)
  VALUES (p_usuario_id, jsonb_build_array(p_permissao), NOW(), NOW())
  ON CONFLICT (usuario_id) 
  DO UPDATE SET 
    permissoes = permissoes.permissoes || jsonb_build_array(p_permissao),
    atualizado_em = NOW()
  WHERE NOT permissoes.permissoes @> jsonb_build_array(p_permissao);
END;
$$ LANGUAGE plpgsql;

-- Uso: SELECT adicionar_permissao('USUARIO_ID', 'os.deletar');


-- Função para remover permissão de um usuário
CREATE OR REPLACE FUNCTION remover_permissao(
  p_usuario_id UUID,
  p_permissao TEXT
)
RETURNS VOID AS $$
BEGIN
  UPDATE permissoes
  SET 
    permissoes = permissoes - p_permissao,
    atualizado_em = NOW()
  WHERE usuario_id = p_usuario_id;
END;
$$ LANGUAGE plpgsql;

-- Uso: SELECT remover_permissao('USUARIO_ID', 'os.deletar');


-- Função para verificar se usuário tem permissão
CREATE OR REPLACE FUNCTION tem_permissao(
  p_usuario_id UUID,
  p_permissao TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  v_tem_permissao BOOLEAN;
BEGIN
  SELECT 
    COALESCE(permissoes @> jsonb_build_array(p_permissao), FALSE)
  INTO v_tem_permissao
  FROM permissoes
  WHERE usuario_id = p_usuario_id;
  
  RETURN COALESCE(v_tem_permissao, FALSE);
END;
$$ LANGUAGE plpgsql;

-- Uso: SELECT tem_permissao('USUARIO_ID', 'os.deletar');
