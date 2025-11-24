-- Adicionar política para permitir que usuários com permissão de cancelar/editar vendas possam atualizar
-- A política atual só permite vendedores atualizarem suas próprias vendas

-- Criar política para usuários com permissão de editar/cancelar vendas
CREATE POLICY "Usuarios com permissao podem atualizar vendas"
ON vendas
FOR UPDATE
TO public
USING (
  -- Permite se o usuário tem permissão de editar OU cancelar vendas
  EXISTS (
    SELECT 1 FROM permissoes
    WHERE permissoes.usuario_id = auth.uid()
    AND (
      (permissoes.permissoes->>'vendas.editar')::boolean = true 
      OR (permissoes.permissoes->>'vendas.cancelar')::boolean = true
    )
  )
)
WITH CHECK (
  -- Mesma verificação para o WITH CHECK
  EXISTS (
    SELECT 1 FROM permissoes
    WHERE permissoes.usuario_id = auth.uid()
    AND (
      (permissoes.permissoes->>'vendas.editar')::boolean = true 
      OR (permissoes.permissoes->>'vendas.cancelar')::boolean = true
    )
  )
);

-- Verificar as políticas após criação
SELECT policyname, cmd, qual
FROM pg_policies 
WHERE tablename = 'vendas' AND cmd = 'UPDATE';
