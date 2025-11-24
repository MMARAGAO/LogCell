-- =====================================================
-- FIX: Políticas RLS para ordem_servico_pecas
-- =====================================================

-- Habilitar RLS se ainda não estiver
ALTER TABLE ordem_servico_pecas ENABLE ROW LEVEL SECURITY;

-- Remover políticas antigas
DROP POLICY IF EXISTS "Usuários autenticados podem ver peças" ON ordem_servico_pecas;
DROP POLICY IF EXISTS "Usuários autenticados podem inserir peças" ON ordem_servico_pecas;
DROP POLICY IF EXISTS "Usuários autenticados podem atualizar peças" ON ordem_servico_pecas;
DROP POLICY IF EXISTS "Usuários autenticados podem deletar peças" ON ordem_servico_pecas;

-- Criar políticas permissivas
CREATE POLICY "Usuários autenticados podem ver peças"
  ON ordem_servico_pecas FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuários autenticados podem inserir peças"
  ON ordem_servico_pecas FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem atualizar peças"
  ON ordem_servico_pecas FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem deletar peças"
  ON ordem_servico_pecas FOR DELETE
  TO authenticated
  USING (true);

-- =====================================================
-- VERIFICAR PEÇAS CADASTRADAS
-- =====================================================

SELECT 
  osp.id,
  osp.id_ordem_servico,
  os.numero_os,
  osp.tipo_produto,
  osp.descricao_peca,
  osp.quantidade,
  osp.valor_venda,
  p.descricao as produto_nome,
  osp.criado_em
FROM ordem_servico_pecas osp
LEFT JOIN ordem_servico os ON os.id = osp.id_ordem_servico
LEFT JOIN produtos p ON p.id = osp.id_produto
ORDER BY osp.criado_em DESC
LIMIT 20;
