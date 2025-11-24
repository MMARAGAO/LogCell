-- Remover a política que criamos (não funciona porque auth.uid() retorna null)
DROP POLICY IF EXISTS "Usuarios com permissao podem atualizar vendas" ON vendas;

-- Criar nova política mais permissiva para usuários autenticados
-- Como o sistema usa tabela usuarios separada de auth.users, vamos permitir UPDATE para todos os authenticated
CREATE POLICY "Usuarios autenticados podem atualizar vendas"
ON vendas
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Verificar políticas
SELECT policyname, cmd, qual, roles
FROM pg_policies 
WHERE tablename = 'vendas' AND cmd = 'UPDATE';
