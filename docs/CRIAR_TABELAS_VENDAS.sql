-- =====================================================
-- SISTEMA DE VENDAS - SCHEMA COMPLETO
-- =====================================================

-- Tabela principal de vendas
CREATE TABLE IF NOT EXISTS vendas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero_venda VARCHAR(20) UNIQUE NOT NULL,
  cliente_id UUID NOT NULL REFERENCES clientes(id),
  loja_id INTEGER NOT NULL REFERENCES lojas(id),
  vendedor_id UUID NOT NULL REFERENCES usuarios(id),
  status VARCHAR(20) NOT NULL CHECK (status IN ('em_andamento', 'concluida', 'cancelada')),
  tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('normal', 'fiada')),
  data_prevista_pagamento DATE,
  valor_total DECIMAL(10,2) NOT NULL DEFAULT 0,
  valor_pago DECIMAL(10,2) NOT NULL DEFAULT 0,
  valor_desconto DECIMAL(10,2) NOT NULL DEFAULT 0,
  saldo_devedor DECIMAL(10,2) NOT NULL DEFAULT 0,
  criado_em TIMESTAMP DEFAULT NOW(),
  finalizado_em TIMESTAMP,
  finalizado_por UUID REFERENCES usuarios(id),
  cancelado_em TIMESTAMP,
  cancelado_por UUID REFERENCES usuarios(id),
  motivo_cancelamento TEXT
);

-- Índices para vendas
CREATE INDEX IF NOT EXISTS idx_vendas_cliente ON vendas(cliente_id);
CREATE INDEX IF NOT EXISTS idx_vendas_loja ON vendas(loja_id);
CREATE INDEX IF NOT EXISTS idx_vendas_vendedor ON vendas(vendedor_id);
CREATE INDEX IF NOT EXISTS idx_vendas_status ON vendas(status);
CREATE INDEX IF NOT EXISTS idx_vendas_criado_em ON vendas(criado_em);

-- Tabela de itens da venda
CREATE TABLE IF NOT EXISTS itens_venda (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venda_id UUID NOT NULL REFERENCES vendas(id) ON DELETE CASCADE,
  produto_id UUID NOT NULL REFERENCES produtos(id),
  produto_nome VARCHAR(255) NOT NULL,
  produto_codigo VARCHAR(100) NOT NULL,
  quantidade INTEGER NOT NULL CHECK (quantidade > 0),
  preco_unitario DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  devolvido INTEGER NOT NULL DEFAULT 0 CHECK (devolvido >= 0),
  criado_em TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_itens_venda_venda ON itens_venda(venda_id);
CREATE INDEX IF NOT EXISTS idx_itens_venda_produto ON itens_venda(produto_id);

-- Tabela de pagamentos da venda
CREATE TABLE IF NOT EXISTS pagamentos_venda (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venda_id UUID NOT NULL REFERENCES vendas(id) ON DELETE CASCADE,
  tipo_pagamento VARCHAR(50) NOT NULL CHECK (tipo_pagamento IN (
    'dinheiro', 'pix', 'cartao_credito', 'cartao_debito', 
    'transferencia', 'boleto', 'credito_cliente'
  )),
  valor DECIMAL(10,2) NOT NULL CHECK (valor > 0),
  data_pagamento DATE NOT NULL,
  editado BOOLEAN DEFAULT FALSE,
  editado_em TIMESTAMP,
  editado_por UUID REFERENCES usuarios(id),
  criado_em TIMESTAMP DEFAULT NOW(),
  criado_por UUID REFERENCES usuarios(id)
);

CREATE INDEX IF NOT EXISTS idx_pagamentos_venda ON pagamentos_venda(venda_id);
CREATE INDEX IF NOT EXISTS idx_pagamentos_tipo ON pagamentos_venda(tipo_pagamento);
CREATE INDEX IF NOT EXISTS idx_pagamentos_data ON pagamentos_venda(data_pagamento);

-- Tabela de descontos aplicados
CREATE TABLE IF NOT EXISTS descontos_venda (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venda_id UUID NOT NULL REFERENCES vendas(id) ON DELETE CASCADE,
  tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('valor', 'porcentagem')),
  valor DECIMAL(10,2) NOT NULL CHECK (valor > 0),
  motivo TEXT NOT NULL,
  aplicado_por UUID NOT NULL REFERENCES usuarios(id),
  criado_em TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_descontos_venda ON descontos_venda(venda_id);

-- Tabela de devoluções
CREATE TABLE IF NOT EXISTS devolucoes_venda (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venda_id UUID NOT NULL REFERENCES vendas(id),
  tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('com_credito', 'sem_credito')),
  motivo TEXT NOT NULL,
  valor_total DECIMAL(10,2) NOT NULL,
  realizado_por UUID NOT NULL REFERENCES usuarios(id),
  criado_em TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_devolucoes_venda ON devolucoes_venda(venda_id);

-- Tabela de itens devolvidos
CREATE TABLE IF NOT EXISTS itens_devolucao (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  devolucao_id UUID NOT NULL REFERENCES devolucoes_venda(id) ON DELETE CASCADE,
  item_venda_id UUID NOT NULL REFERENCES itens_venda(id),
  quantidade INTEGER NOT NULL CHECK (quantidade > 0),
  motivo TEXT,
  criado_em TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_itens_devolucao ON itens_devolucao(devolucao_id);

-- Tabela de créditos do cliente
CREATE TABLE IF NOT EXISTS creditos_cliente (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID NOT NULL REFERENCES clientes(id),
  venda_origem_id UUID REFERENCES vendas(id),
  devolucao_id UUID REFERENCES devolucoes_venda(id),
  valor_total DECIMAL(10,2) NOT NULL CHECK (valor_total > 0),
  valor_utilizado DECIMAL(10,2) DEFAULT 0 CHECK (valor_utilizado >= 0),
  saldo DECIMAL(10,2) NOT NULL CHECK (saldo >= 0),
  motivo TEXT,
  gerado_por UUID NOT NULL REFERENCES usuarios(id),
  criado_em TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_creditos_cliente ON creditos_cliente(cliente_id);
CREATE INDEX IF NOT EXISTS idx_creditos_saldo ON creditos_cliente(saldo) WHERE saldo > 0;

-- Tabela de histórico/auditoria de vendas
CREATE TABLE IF NOT EXISTS historico_vendas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venda_id UUID NOT NULL REFERENCES vendas(id) ON DELETE CASCADE,
  tipo_acao VARCHAR(50) NOT NULL CHECK (tipo_acao IN (
    'criacao', 'adicao_item', 'remocao_item', 'pagamento', 
    'edicao_pagamento', 'desconto', 'devolucao', 'finalizacao'
  )),
  descricao TEXT NOT NULL,
  usuario_id UUID REFERENCES usuarios(id),
  criado_em TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_historico_venda ON historico_vendas(venda_id);
CREATE INDEX IF NOT EXISTS idx_historico_criado_em ON historico_vendas(criado_em);

-- =====================================================
-- POLÍTICAS RLS (Row Level Security)
-- =====================================================

-- Habilita RLS em todas as tabelas
ALTER TABLE vendas ENABLE ROW LEVEL SECURITY;
ALTER TABLE itens_venda ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagamentos_venda ENABLE ROW LEVEL SECURITY;
ALTER TABLE descontos_venda ENABLE ROW LEVEL SECURITY;
ALTER TABLE devolucoes_venda ENABLE ROW LEVEL SECURITY;
ALTER TABLE itens_devolucao ENABLE ROW LEVEL SECURITY;
ALTER TABLE creditos_cliente ENABLE ROW LEVEL SECURITY;
ALTER TABLE historico_vendas ENABLE ROW LEVEL SECURITY;

-- Remove políticas antigas se existirem
DROP POLICY IF EXISTS "Usuários podem ver vendas de sua loja" ON vendas;
DROP POLICY IF EXISTS "Vendedores podem criar vendas" ON vendas;
DROP POLICY IF EXISTS "Vendedores podem atualizar suas vendas" ON vendas;
DROP POLICY IF EXISTS "Usuários podem ver itens de vendas de sua loja" ON itens_venda;
DROP POLICY IF EXISTS "Vendedores podem adicionar itens" ON itens_venda;
DROP POLICY IF EXISTS "Usuários podem ver pagamentos de sua loja" ON pagamentos_venda;
DROP POLICY IF EXISTS "Usuários podem adicionar pagamentos" ON pagamentos_venda;
DROP POLICY IF EXISTS "Usuários podem ver descontos" ON descontos_venda;
DROP POLICY IF EXISTS "Usuários podem aplicar descontos" ON descontos_venda;
DROP POLICY IF EXISTS "Usuários podem ver devoluções" ON devolucoes_venda;
DROP POLICY IF EXISTS "Usuários podem registrar devoluções" ON devolucoes_venda;
DROP POLICY IF EXISTS "Usuários podem ver itens de devolução" ON itens_devolucao;
DROP POLICY IF EXISTS "Usuários podem adicionar itens de devolução" ON itens_devolucao;
DROP POLICY IF EXISTS "Usuários podem ver créditos" ON creditos_cliente;
DROP POLICY IF EXISTS "Usuários podem criar créditos" ON creditos_cliente;
DROP POLICY IF EXISTS "Sistema pode atualizar créditos" ON creditos_cliente;
DROP POLICY IF EXISTS "Usuários podem ver histórico de suas vendas" ON historico_vendas;
DROP POLICY IF EXISTS "Sistema pode criar histórico" ON historico_vendas;

-- Políticas para vendas
CREATE POLICY "Usuários podem ver vendas de sua loja"
  ON vendas FOR SELECT
  USING (
    loja_id IN (
      SELECT loja_id FROM usuarios WHERE id = auth.uid()
    )
  );

CREATE POLICY "Vendedores podem criar vendas"
  ON vendas FOR INSERT
  WITH CHECK (
    vendedor_id = auth.uid() AND
    loja_id IN (
      SELECT loja_id FROM usuarios WHERE id = auth.uid()
    )
  );

CREATE POLICY "Vendedores podem atualizar suas vendas"
  ON vendas FOR UPDATE
  USING (
    vendedor_id = auth.uid()
  );

-- Políticas para itens_venda
CREATE POLICY "Usuários podem ver itens de vendas de sua loja"
  ON itens_venda FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM vendas 
      WHERE vendas.id = itens_venda.venda_id 
      AND vendas.loja_id IN (
        SELECT loja_id FROM usuarios WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Vendedores podem adicionar itens"
  ON itens_venda FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM vendas 
      WHERE vendas.id = venda_id 
      AND vendas.vendedor_id = auth.uid()
    )
  );

-- Políticas para pagamentos
CREATE POLICY "Usuários podem ver pagamentos de sua loja"
  ON pagamentos_venda FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM vendas 
      WHERE vendas.id = pagamentos_venda.venda_id 
      AND vendas.loja_id IN (
        SELECT loja_id FROM usuarios WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Usuários podem adicionar pagamentos"
  ON pagamentos_venda FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM vendas 
      WHERE vendas.id = venda_id 
      AND vendas.loja_id IN (
        SELECT loja_id FROM usuarios WHERE id = auth.uid()
      )
    )
  );

-- Políticas para descontos
CREATE POLICY "Usuários podem ver descontos"
  ON descontos_venda FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM vendas 
      WHERE vendas.id = descontos_venda.venda_id 
      AND vendas.loja_id IN (
        SELECT loja_id FROM usuarios WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Usuários podem aplicar descontos"
  ON descontos_venda FOR INSERT
  WITH CHECK (aplicado_por = auth.uid());

-- Políticas para devoluções
CREATE POLICY "Usuários podem ver devoluções"
  ON devolucoes_venda FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM vendas 
      WHERE vendas.id = devolucoes_venda.venda_id 
      AND vendas.loja_id IN (
        SELECT loja_id FROM usuarios WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Usuários podem registrar devoluções"
  ON devolucoes_venda FOR INSERT
  WITH CHECK (realizado_por = auth.uid());

-- Políticas para itens_devolucao
CREATE POLICY "Usuários podem ver itens de devolução"
  ON itens_devolucao FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM devolucoes_venda dv
      JOIN vendas v ON v.id = dv.venda_id
      WHERE dv.id = itens_devolucao.devolucao_id 
      AND v.loja_id IN (
        SELECT loja_id FROM usuarios WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Usuários podem adicionar itens de devolução"
  ON itens_devolucao FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM devolucoes_venda dv
      JOIN vendas v ON v.id = dv.venda_id
      WHERE dv.id = devolucao_id 
      AND v.loja_id IN (
        SELECT loja_id FROM usuarios WHERE id = auth.uid()
      )
    )
  );

-- Políticas para créditos
CREATE POLICY "Usuários podem ver créditos"
  ON creditos_cliente FOR SELECT
  USING (true);

CREATE POLICY "Usuários podem criar créditos"
  ON creditos_cliente FOR INSERT
  WITH CHECK (gerado_por = auth.uid());

CREATE POLICY "Sistema pode atualizar créditos"
  ON creditos_cliente FOR UPDATE
  USING (true);

-- Políticas para histórico
CREATE POLICY "Usuários podem ver histórico de suas vendas"
  ON historico_vendas FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM vendas 
      WHERE vendas.id = historico_vendas.venda_id 
      AND vendas.loja_id IN (
        SELECT loja_id FROM usuarios WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Sistema pode criar histórico"
  ON historico_vendas FOR INSERT
  WITH CHECK (true);

-- =====================================================
-- TRIGGERS E FUNÇÕES
-- =====================================================

-- Remove triggers antigos se existirem
DROP TRIGGER IF EXISTS trigger_atualizar_estoque_venda ON itens_venda;
DROP TRIGGER IF EXISTS trigger_retornar_estoque_devolucao ON itens_devolucao;

-- Função para atualizar estoque após venda
CREATE OR REPLACE FUNCTION atualizar_estoque_venda()
RETURNS TRIGGER AS $$
BEGIN
  -- Reduz o estoque quando item é adicionado à venda
  UPDATE historico_estoque
  SET quantidade = quantidade - NEW.quantidade
  WHERE produto_id = NEW.produto_id 
  AND loja_id = (
    SELECT loja_id FROM vendas WHERE id = NEW.venda_id
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_atualizar_estoque_venda
AFTER INSERT ON itens_venda
FOR EACH ROW
EXECUTE FUNCTION atualizar_estoque_venda();

-- Função para retornar estoque em devolução
CREATE OR REPLACE FUNCTION retornar_estoque_devolucao()
RETURNS TRIGGER AS $$
BEGIN
  -- Retorna ao estoque quando item é devolvido
  UPDATE historico_estoque he
  SET quantidade = quantidade + NEW.quantidade
  FROM itens_venda iv
  JOIN vendas v ON v.id = iv.venda_id
  WHERE iv.id = NEW.item_venda_id
  AND he.produto_id = iv.produto_id
  AND he.loja_id = v.loja_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_retornar_estoque_devolucao
AFTER INSERT ON itens_devolucao
FOR EACH ROW
EXECUTE FUNCTION retornar_estoque_devolucao();

-- =====================================================
-- VIEWS ÚTEIS
-- =====================================================

-- View de vendas com resumo
CREATE OR REPLACE VIEW vw_vendas_resumo AS
SELECT 
  v.id,
  v.numero_venda,
  v.status,
  v.tipo,
  c.nome AS cliente_nome,
  l.nome AS loja_nome,
  u.nome AS vendedor_nome,
  v.valor_total,
  v.valor_pago,
  v.saldo_devedor,
  v.criado_em,
  COUNT(DISTINCT iv.id) AS total_itens,
  COUNT(DISTINCT pv.id) AS total_pagamentos
FROM vendas v
JOIN clientes c ON c.id = v.cliente_id
JOIN lojas l ON l.id = v.loja_id
JOIN usuarios u ON u.id = v.vendedor_id
LEFT JOIN itens_venda iv ON iv.venda_id = v.id
LEFT JOIN pagamentos_venda pv ON pv.venda_id = v.id
GROUP BY v.id, c.nome, l.nome, u.nome;

COMMENT ON TABLE vendas IS 'Tabela principal de vendas do sistema';
COMMENT ON TABLE itens_venda IS 'Itens (produtos) de cada venda';
COMMENT ON TABLE pagamentos_venda IS 'Pagamentos realizados para cada venda';
COMMENT ON TABLE devolucoes_venda IS 'Devoluções de produtos vendidos';
COMMENT ON TABLE creditos_cliente IS 'Créditos gerados por devoluções para uso futuro';
COMMENT ON TABLE historico_vendas IS 'Auditoria completa de todas ações em vendas';
