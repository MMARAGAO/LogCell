-- =====================================================
-- SCRIPT DE LIMPEZA - USUÁRIOS ESPECÍFICOS (VERSÃO SIMPLES)
-- =====================================================
-- Remove usuários específicos do sistema
-- ⚠️  ATENÇÃO: Esta operação é IRREVERSÍVEL!
-- =====================================================

-- =====================================================
-- SOLUÇÃO: Usar session_replication_role
-- =====================================================

-- PASSO 1: Guardar os IDs em uma tabela temporária
CREATE TEMP TABLE usuarios_para_deletar AS
SELECT id FROM auth.users 
WHERE email IN (
    'julianacclemente@gmail.com',
    'mu.aragao2@gmail.com',
    'th-medeiros@gmail.com'
);

-- PASSO 2: Configurar sessão para ignorar triggers
SET session_replication_role = 'replica';

-- PASSO 3: Deletar histórico existente desses usuários
DELETE FROM public.historico_usuarios 
WHERE usuario_id IN (SELECT id FROM usuarios_para_deletar)
   OR usuario_alterou_id IN (SELECT id FROM usuarios_para_deletar);

-- PASSO 4: Deletar de todas as outras tabelas
DELETE FROM public.permissoes WHERE usuario_id IN (SELECT id FROM usuarios_para_deletar);
DELETE FROM public.configuracoes_usuario WHERE usuario_id IN (SELECT id FROM usuarios_para_deletar);
DELETE FROM public.metas_usuarios WHERE usuario_id IN (SELECT id FROM usuarios_para_deletar);
DELETE FROM public.notificacoes_usuarios WHERE usuario_id IN (SELECT id FROM usuarios_para_deletar);
DELETE FROM public.fotos_perfil WHERE usuario_id IN (SELECT id FROM usuarios_para_deletar);

-- PASSO 5: Deletar usuários
DELETE FROM public.usuarios WHERE id IN (SELECT id FROM usuarios_para_deletar);
DELETE FROM auth.users WHERE id IN (SELECT id FROM usuarios_para_deletar);

-- PASSO 6: Restaurar configuração da sessão
SET session_replication_role = 'origin';

-- PASSO 7: Limpar tabela temporária
DROP TABLE usuarios_para_deletar;

-- =====================================================
-- VERIFICAÇÃO FINAL
-- =====================================================

SELECT COUNT(*) as usuarios_deletados_verificacao
FROM auth.users 
WHERE email IN (
    'julianacclemente@gmail.com',
    'mu.aragao2@gmail.com',
    'th-medeiros@gmail.com'
);

-- =====================================================
-- FIM DO SCRIPT
-- =====================================================
