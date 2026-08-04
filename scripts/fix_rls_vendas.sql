-- Corrige RLS de UPDATE/DELETE (e um INSERT solto) nas tabelas de vendas.
-- As policies de SELECT já filtram corretamente por loja (via permissoes.loja_ids/todas_lojas).
-- As policies de UPDATE/DELETE abaixo estavam com `USING (true)`, permitindo que qualquer
-- usuário autenticado altere/apague vendas de QUALQUER loja via API direta.
-- Este script reescreve essas policies para usar o mesmo padrão já validado nas policies de SELECT.

-- ============================================================
-- vendas
-- ============================================================
DROP POLICY IF EXISTS "Usuarios autenticados podem atualizar vendas" ON vendas;
CREATE POLICY "Usuários podem atualizar vendas de sua loja" ON vendas
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM permissoes
    WHERE permissoes.usuario_id = auth.uid()
      AND (permissoes.todas_lojas = true OR vendas.loja_id = ANY (COALESCE(permissoes.loja_ids, ARRAY[permissoes.loja_id])))
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM permissoes
    WHERE permissoes.usuario_id = auth.uid()
      AND (permissoes.todas_lojas = true OR vendas.loja_id = ANY (COALESCE(permissoes.loja_ids, ARRAY[permissoes.loja_id])))
  )
);

DROP POLICY IF EXISTS "Usuarios autenticados podem deletar vendas" ON vendas;
CREATE POLICY "Usuários podem deletar vendas de sua loja" ON vendas
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM permissoes
    WHERE permissoes.usuario_id = auth.uid()
      AND (permissoes.todas_lojas = true OR vendas.loja_id = ANY (COALESCE(permissoes.loja_ids, ARRAY[permissoes.loja_id])))
  )
);

-- ============================================================
-- itens_venda (tinha policies duplicadas + INSERT aberto anulando o correto)
-- ============================================================
DROP POLICY IF EXISTS "Permitir DELETE de itens_venda" ON itens_venda;
DROP POLICY IF EXISTS "Usuarios autenticados podem deletar itens venda" ON itens_venda;
CREATE POLICY "Usuários podem deletar itens de vendas de sua loja" ON itens_venda
FOR DELETE
USING (
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

DROP POLICY IF EXISTS "Permitir UPDATE de itens_venda" ON itens_venda;
DROP POLICY IF EXISTS "Usuarios autenticados podem atualizar itens venda" ON itens_venda;
CREATE POLICY "Usuários podem atualizar itens de vendas de sua loja" ON itens_venda
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM vendas
    WHERE vendas.id = itens_venda.venda_id
      AND EXISTS (
        SELECT 1 FROM permissoes
        WHERE permissoes.usuario_id = auth.uid()
          AND (permissoes.todas_lojas = true OR vendas.loja_id = ANY (COALESCE(permissoes.loja_ids, ARRAY[permissoes.loja_id])))
      )
  )
)
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

-- Removida por ser um duplicado aberto que anulava a policy correta
-- "Vendedores podem adicionar itens" (with_check = vendas.vendedor_id = auth.uid()).
DROP POLICY IF EXISTS "Permitir INSERT de itens_venda" ON itens_venda;

-- ============================================================
-- pagamentos_venda
-- ============================================================
DROP POLICY IF EXISTS "Usuarios autenticados podem atualizar pagamentos venda" ON pagamentos_venda;
CREATE POLICY "Usuários podem atualizar pagamentos de vendas de sua loja" ON pagamentos_venda
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM vendas
    WHERE vendas.id = pagamentos_venda.venda_id
      AND EXISTS (
        SELECT 1 FROM permissoes
        WHERE permissoes.usuario_id = auth.uid()
          AND (permissoes.todas_lojas = true OR vendas.loja_id = ANY (COALESCE(permissoes.loja_ids, ARRAY[permissoes.loja_id])))
      )
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM vendas
    WHERE vendas.id = pagamentos_venda.venda_id
      AND EXISTS (
        SELECT 1 FROM permissoes
        WHERE permissoes.usuario_id = auth.uid()
          AND (permissoes.todas_lojas = true OR vendas.loja_id = ANY (COALESCE(permissoes.loja_ids, ARRAY[permissoes.loja_id])))
      )
  )
);

DROP POLICY IF EXISTS "Usuarios autenticados podem deletar pagamentos venda" ON pagamentos_venda;
CREATE POLICY "Usuários podem deletar pagamentos de vendas de sua loja" ON pagamentos_venda
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM vendas
    WHERE vendas.id = pagamentos_venda.venda_id
      AND EXISTS (
        SELECT 1 FROM permissoes
        WHERE permissoes.usuario_id = auth.uid()
          AND (permissoes.todas_lojas = true OR vendas.loja_id = ANY (COALESCE(permissoes.loja_ids, ARRAY[permissoes.loja_id])))
      )
  )
);

-- ============================================================
-- descontos_venda
-- ============================================================
DROP POLICY IF EXISTS "Usuarios autenticados podem atualizar descontos venda" ON descontos_venda;
CREATE POLICY "Usuários podem atualizar descontos de vendas de sua loja" ON descontos_venda
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM vendas
    WHERE vendas.id = descontos_venda.venda_id
      AND EXISTS (
        SELECT 1 FROM permissoes
        WHERE permissoes.usuario_id = auth.uid()
          AND (permissoes.todas_lojas = true OR vendas.loja_id = ANY (COALESCE(permissoes.loja_ids, ARRAY[permissoes.loja_id])))
      )
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM vendas
    WHERE vendas.id = descontos_venda.venda_id
      AND EXISTS (
        SELECT 1 FROM permissoes
        WHERE permissoes.usuario_id = auth.uid()
          AND (permissoes.todas_lojas = true OR vendas.loja_id = ANY (COALESCE(permissoes.loja_ids, ARRAY[permissoes.loja_id])))
      )
  )
);

DROP POLICY IF EXISTS "Usuarios autenticados podem deletar descontos venda" ON descontos_venda;
CREATE POLICY "Usuários podem deletar descontos de vendas de sua loja" ON descontos_venda
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM vendas
    WHERE vendas.id = descontos_venda.venda_id
      AND EXISTS (
        SELECT 1 FROM permissoes
        WHERE permissoes.usuario_id = auth.uid()
          AND (permissoes.todas_lojas = true OR vendas.loja_id = ANY (COALESCE(permissoes.loja_ids, ARRAY[permissoes.loja_id])))
      )
  )
);

-- ============================================================
-- devolucoes_venda
-- ============================================================
DROP POLICY IF EXISTS "Usuarios autenticados podem atualizar devolucoes venda" ON devolucoes_venda;
CREATE POLICY "Usuários podem atualizar devoluções de vendas de sua loja" ON devolucoes_venda
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM vendas
    WHERE vendas.id = devolucoes_venda.venda_id
      AND EXISTS (
        SELECT 1 FROM permissoes
        WHERE permissoes.usuario_id = auth.uid()
          AND (permissoes.todas_lojas = true OR vendas.loja_id = ANY (COALESCE(permissoes.loja_ids, ARRAY[permissoes.loja_id])))
      )
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM vendas
    WHERE vendas.id = devolucoes_venda.venda_id
      AND EXISTS (
        SELECT 1 FROM permissoes
        WHERE permissoes.usuario_id = auth.uid()
          AND (permissoes.todas_lojas = true OR vendas.loja_id = ANY (COALESCE(permissoes.loja_ids, ARRAY[permissoes.loja_id])))
      )
  )
);

DROP POLICY IF EXISTS "Usuarios autenticados podem deletar devolucoes venda" ON devolucoes_venda;
CREATE POLICY "Usuários podem deletar devoluções de vendas de sua loja" ON devolucoes_venda
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM vendas
    WHERE vendas.id = devolucoes_venda.venda_id
      AND EXISTS (
        SELECT 1 FROM permissoes
        WHERE permissoes.usuario_id = auth.uid()
          AND (permissoes.todas_lojas = true OR vendas.loja_id = ANY (COALESCE(permissoes.loja_ids, ARRAY[permissoes.loja_id])))
      )
  )
);

-- ============================================================
-- historico_vendas
-- ============================================================
DROP POLICY IF EXISTS "Usuarios autenticados podem atualizar historico vendas" ON historico_vendas;
CREATE POLICY "Usuários podem atualizar histórico de vendas de sua loja" ON historico_vendas
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM vendas
    WHERE vendas.id = historico_vendas.venda_id
      AND EXISTS (
        SELECT 1 FROM permissoes
        WHERE permissoes.usuario_id = auth.uid()
          AND (permissoes.todas_lojas = true OR vendas.loja_id = ANY (COALESCE(permissoes.loja_ids, ARRAY[permissoes.loja_id])))
      )
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM vendas
    WHERE vendas.id = historico_vendas.venda_id
      AND EXISTS (
        SELECT 1 FROM permissoes
        WHERE permissoes.usuario_id = auth.uid()
          AND (permissoes.todas_lojas = true OR vendas.loja_id = ANY (COALESCE(permissoes.loja_ids, ARRAY[permissoes.loja_id])))
      )
  )
);

DROP POLICY IF EXISTS "Usuarios autenticados podem deletar historico vendas" ON historico_vendas;
CREATE POLICY "Usuários podem deletar histórico de vendas de sua loja" ON historico_vendas
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM vendas
    WHERE vendas.id = historico_vendas.venda_id
      AND EXISTS (
        SELECT 1 FROM permissoes
        WHERE permissoes.usuario_id = auth.uid()
          AND (permissoes.todas_lojas = true OR vendas.loja_id = ANY (COALESCE(permissoes.loja_ids, ARRAY[permissoes.loja_id])))
      )
  )
);

-- Nota: a policy de INSERT "Sistema pode criar histórico" (with_check = true) foi
-- mantida aberta de propósito — é o log de auditoria gravado automaticamente pela
-- aplicação a cada ação, não uma edição de dado de negócio.

-- ============================================================
-- itens_devolucao (join duplo: devolucao_id -> devolucoes_venda -> venda_id -> vendas.loja_id)
-- ============================================================
DROP POLICY IF EXISTS "Usuarios autenticados podem atualizar itens devolucao" ON itens_devolucao;
CREATE POLICY "Usuários podem atualizar itens de devolução de sua loja" ON itens_devolucao
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM devolucoes_venda dv
    JOIN vendas v ON v.id = dv.venda_id
    WHERE dv.id = itens_devolucao.devolucao_id
      AND EXISTS (
        SELECT 1 FROM permissoes
        WHERE permissoes.usuario_id = auth.uid()
          AND (permissoes.todas_lojas = true OR v.loja_id = ANY (COALESCE(permissoes.loja_ids, ARRAY[permissoes.loja_id])))
      )
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM devolucoes_venda dv
    JOIN vendas v ON v.id = dv.venda_id
    WHERE dv.id = itens_devolucao.devolucao_id
      AND EXISTS (
        SELECT 1 FROM permissoes
        WHERE permissoes.usuario_id = auth.uid()
          AND (permissoes.todas_lojas = true OR v.loja_id = ANY (COALESCE(permissoes.loja_ids, ARRAY[permissoes.loja_id])))
      )
  )
);

DROP POLICY IF EXISTS "Usuarios autenticados podem deletar itens devolucao" ON itens_devolucao;
CREATE POLICY "Usuários podem deletar itens de devolução de sua loja" ON itens_devolucao
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM devolucoes_venda dv
    JOIN vendas v ON v.id = dv.venda_id
    WHERE dv.id = itens_devolucao.devolucao_id
      AND EXISTS (
        SELECT 1 FROM permissoes
        WHERE permissoes.usuario_id = auth.uid()
          AND (permissoes.todas_lojas = true OR v.loja_id = ANY (COALESCE(permissoes.loja_ids, ARRAY[permissoes.loja_id])))
      )
  )
);
