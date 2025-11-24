-- =====================================================
-- ADICIONAR POLÍTICAS DE DELETE PARA VENDAS
-- =====================================================

-- Política de DELETE para vendas (apenas o vendedor ou admins)
DROP POLICY IF EXISTS "Vendedores podem deletar suas vendas" ON vendas;
CREATE POLICY "Vendedores podem deletar suas vendas"
  ON vendas FOR DELETE
  USING (
    vendedor_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE id = auth.uid() 
      AND tipo IN ('admin', 'gerente')
    )
  );

-- Política de DELETE para itens_venda
DROP POLICY IF EXISTS "Vendedores podem deletar itens de suas vendas" ON itens_venda;
CREATE POLICY "Vendedores podem deletar itens de suas vendas"
  ON itens_venda FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM vendas 
      WHERE vendas.id = itens_venda.venda_id 
      AND (
        vendas.vendedor_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM usuarios 
          WHERE id = auth.uid() 
          AND tipo IN ('admin', 'gerente')
        )
      )
    )
  );

-- Política de DELETE para pagamentos_venda
DROP POLICY IF EXISTS "Usuários podem deletar pagamentos de suas vendas" ON pagamentos_venda;
CREATE POLICY "Usuários podem deletar pagamentos de suas vendas"
  ON pagamentos_venda FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM vendas 
      WHERE vendas.id = pagamentos_venda.venda_id 
      AND (
        vendas.vendedor_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM usuarios 
          WHERE id = auth.uid() 
          AND tipo IN ('admin', 'gerente')
        )
      )
    )
  );

-- Política de DELETE para descontos_venda
DROP POLICY IF EXISTS "Usuários podem deletar descontos de suas vendas" ON descontos_venda;
CREATE POLICY "Usuários podem deletar descontos de suas vendas"
  ON descontos_venda FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM vendas 
      WHERE vendas.id = descontos_venda.venda_id 
      AND (
        vendas.vendedor_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM usuarios 
          WHERE id = auth.uid() 
          AND tipo IN ('admin', 'gerente')
        )
      )
    )
  );
