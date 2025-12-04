-- =====================================================
-- SCRIPT DE LIMPEZA - USUÁRIOS ESPECÍFICOS
-- =====================================================
-- Remove usuários específicos do sistema
-- ⚠️  ATENÇÃO: Esta operação é IRREVERSÍVEL!
-- =====================================================
-- EXECUTE OS BLOCOS UM DE CADA VEZ!
-- =====================================================

-- =====================================================
-- BLOCO 1: Verificar usuários
-- =====================================================

SELECT id, email 
FROM auth.users 
WHERE email IN (
    'julianacclemente@gmail.com',
    'mu.aragao2@gmail.com',
    'th-medeiros@gmail.com'
);

-- =====================================================
-- BLOCO 2: Remover constraint (EXECUTE APÓS BLOCO 1)
-- =====================================================

ALTER TABLE public.historico_usuarios 
DROP CONSTRAINT IF EXISTS historico_usuarios_usuario_id_fkey;

ALTER TABLE public.historico_usuarios 
DROP CONSTRAINT IF EXISTS historico_usuarios_usuario_alterou_id_fkey;

-- =====================================================
-- BLOCO 3: Deletar dados (EXECUTE APÓS BLOCO 2)
-- =====================================================

-- Deletar histórico
DELETE FROM public.historico_usuarios 
WHERE usuario_id IN (
    SELECT id FROM auth.users 
    WHERE email IN ('julianacclemente@gmail.com', 'mu.aragao2@gmail.com', 'th-medeiros@gmail.com')
);

-- Deletar permissões
DELETE FROM public.permissoes 
WHERE usuario_id IN (
    SELECT id FROM auth.users 
    WHERE email IN ('julianacclemente@gmail.com', 'mu.aragao2@gmail.com', 'th-medeiros@gmail.com')
);

-- Deletar configurações
DELETE FROM public.configuracoes_usuario 
WHERE usuario_id IN (
    SELECT id FROM auth.users 
    WHERE email IN ('julianacclemente@gmail.com', 'mu.aragao2@gmail.com', 'th-medeiros@gmail.com')
);

-- Deletar metas
DELETE FROM public.metas_usuarios 
WHERE usuario_id IN (
    SELECT id FROM auth.users 
    WHERE email IN ('julianacclemente@gmail.com', 'mu.aragao2@gmail.com', 'th-medeiros@gmail.com')
);

-- Deletar da tabela pública
DELETE FROM public.usuarios 
WHERE id IN (
    SELECT id FROM auth.users 
    WHERE email IN ('julianacclemente@gmail.com', 'mu.aragao2@gmail.com', 'th-medeiros@gmail.com')
);

-- Deletar da tabela de autenticação
DELETE FROM auth.users 
WHERE email IN ('julianacclemente@gmail.com', 'mu.aragao2@gmail.com', 'th-medeiros@gmail.com');

-- =====================================================
-- BLOCO 4: Recriar constraints (EXECUTE APÓS BLOCO 3)
-- =====================================================

ALTER TABLE public.historico_usuarios 
ADD CONSTRAINT historico_usuarios_usuario_id_fkey 
FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id);

ALTER TABLE public.historico_usuarios 
ADD CONSTRAINT historico_usuarios_usuario_alterou_id_fkey 
FOREIGN KEY (usuario_alterou_id) REFERENCES public.usuarios(id);

-- =====================================================
-- VERIFICAÇÃO FINAL
-- =====================================================

-- Verificar se foram removidos
SELECT COUNT(*) as usuarios_restantes
FROM auth.users 
WHERE email IN (
    'julianacclemente@gmail.com',
    'mu.aragao2@gmail.com',
    'th-medeiros@gmail.com'
);

-- Verificar total de usuários no sistema
SELECT COUNT(*) as total_usuarios FROM auth.users;

-- =====================================================
-- FIM DO SCRIPT
-- =====================================================
