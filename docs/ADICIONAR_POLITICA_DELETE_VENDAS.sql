-- Adicionar política para permitir DELETE de vendas
CREATE POLICY "Usuarios autenticados podem deletar vendas"
ON vendas
FOR DELETE
TO authenticated
USING (true);

-- Verificar políticas de DELETE
SELECT policyname, cmd, qual, roles
FROM pg_policies 
WHERE tablename = 'vendas' AND cmd = 'DELETE';
