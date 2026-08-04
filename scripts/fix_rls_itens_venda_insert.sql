-- Corrige regressão: policy de INSERT em itens_venda exigia vendas.vendedor_id = auth.uid(),
-- o que quebrou a edição de vendas por outro usuário (admin, outro atendente, venda com
-- vendedor trocado) depois que a policy aberta duplicada foi removida.
-- Troca para o mesmo padrão de escopo por loja usado em pagamentos_venda.

DROP POLICY IF EXISTS "Vendedores podem adicionar itens" ON itens_venda;

CREATE POLICY "Usuários podem adicionar itens a vendas de sua loja" ON itens_venda
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM vendas
    WHERE vendas.id = itens_venda.venda_id
      AND EXISTS (
        SELECT 1 FROM permissoes
        WHERE permissoes.usuario_id = auth.uid()
          AND (permissoes.todas_lojas = true OR vendas.loja_id = ANY (COALESCE(permissoes.loja_ids, ARRAY[permissoes.loja_id])))
      )
  )
);
