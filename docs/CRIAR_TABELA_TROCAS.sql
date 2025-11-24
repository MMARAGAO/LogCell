-- Tabela para registrar trocas de produtos em vendas
CREATE TABLE IF NOT EXISTS trocas_produtos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venda_id UUID NOT NULL REFERENCES vendas(id) ON DELETE CASCADE,
  item_venda_id UUID NOT NULL REFERENCES itens_venda(id) ON DELETE CASCADE,
  
  -- Produto antigo (que foi trocado)
  produto_antigo_id UUID NOT NULL REFERENCES produtos(id),
  produto_antigo_nome TEXT NOT NULL,
  produto_antigo_preco DECIMAL(10,2) NOT NULL,
  quantidade_trocada INTEGER NOT NULL,
  
  -- Produto novo (que substituiu)
  produto_novo_id UUID NOT NULL REFERENCES produtos(id),
  produto_novo_nome TEXT NOT NULL,
  produto_novo_preco DECIMAL(10,2) NOT NULL,
  
  -- Diferença de valores
  diferenca_valor DECIMAL(10,2) NOT NULL, -- Positivo: cliente paga, Negativo: cliente recebe
  
  -- Controle
  loja_id INTEGER NOT NULL REFERENCES lojas(id),
  usuario_id UUID REFERENCES usuarios(id),
  observacao TEXT,
  criado_em TIMESTAMPTZ DEFAULT now(),
  
  -- Índices
  CONSTRAINT quantidade_trocada_positiva CHECK (quantidade_trocada > 0)
);

-- Índices para melhor performance
CREATE INDEX idx_trocas_venda_id ON trocas_produtos(venda_id);
CREATE INDEX idx_trocas_item_venda_id ON trocas_produtos(item_venda_id);
CREATE INDEX idx_trocas_loja_id ON trocas_produtos(loja_id);
CREATE INDEX idx_trocas_criado_em ON trocas_produtos(criado_em);
CREATE INDEX idx_trocas_usuario_id ON trocas_produtos(usuario_id);

-- Habilitar RLS
ALTER TABLE trocas_produtos ENABLE ROW LEVEL SECURITY;

-- Política: Ver trocas da própria loja
CREATE POLICY "Usuarios podem ver trocas da própria loja"
  ON trocas_produtos
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM permissoes
      WHERE permissoes.usuario_id = auth.uid()
      AND (
        permissoes.loja_id = trocas_produtos.loja_id
        OR permissoes.todas_lojas = true
      )
    )
  );

-- Política: Inserir trocas na própria loja
CREATE POLICY "Usuarios podem registrar trocas na própria loja"
  ON trocas_produtos
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM permissoes
      WHERE permissoes.usuario_id = auth.uid()
      AND (
        permissoes.loja_id = trocas_produtos.loja_id
        OR permissoes.todas_lojas = true
      )
    )
  );

-- Comentários
COMMENT ON TABLE trocas_produtos IS 'Registra todas as trocas de produtos realizadas em vendas';
COMMENT ON COLUMN trocas_produtos.diferenca_valor IS 'Diferença de valor entre produtos (positivo = cliente paga, negativo = cliente recebe)';
COMMENT ON COLUMN trocas_produtos.quantidade_trocada IS 'Quantidade de itens que foram trocados';
