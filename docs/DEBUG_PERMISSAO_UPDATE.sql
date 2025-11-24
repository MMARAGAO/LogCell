-- Verificar se o usuário atual tem as permissões necessárias
SELECT 
    auth.uid() as meu_usuario_id,
    permissoes.permissoes,
    permissoes.permissoes->>'vendas.cancelar' as tem_cancelar,
    permissoes.permissoes->>'vendas.editar' as tem_editar,
    (permissoes.permissoes->>'vendas.cancelar')::boolean as cancelar_bool,
    (permissoes.permissoes->>'vendas.editar')::boolean as editar_bool
FROM permissoes
WHERE permissoes.usuario_id = auth.uid();

-- Verificar se a venda existe e qual o vendedor
SELECT 
    id,
    numero_venda,
    vendedor_id,
    status,
    auth.uid() as meu_id,
    vendedor_id = auth.uid() as sou_vendedor
FROM vendas
WHERE numero_venda = 6;
