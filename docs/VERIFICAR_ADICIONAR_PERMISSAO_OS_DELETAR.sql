-- Verificar suas permissões atuais relacionadas a OS
SELECT 
    u.nome,
    u.email,
    p.permissoes->'os' as permissoes_os,
    p.permissoes
FROM usuarios u
JOIN permissoes p ON p.usuario_id = u.id
WHERE u.email = 'SEU_EMAIL_AQUI';  -- Troque pelo seu email

-- Ver TODAS as permissões de OS disponíveis no sistema
SELECT DISTINCT
    jsonb_object_keys(permissoes->'os') as permissao_os
FROM permissoes
WHERE permissoes->'os' IS NOT NULL;

-- Adicionar permissão os.deletar para um usuário específico
-- DESCOMENTE e execute após verificar o email acima:
/*
UPDATE permissoes
SET permissoes = jsonb_set(
    permissoes,
    '{os,deletar}',
    'true'::jsonb
)
WHERE usuario_id = (
    SELECT id FROM usuarios WHERE email = 'SEU_EMAIL_AQUI'
);
*/
