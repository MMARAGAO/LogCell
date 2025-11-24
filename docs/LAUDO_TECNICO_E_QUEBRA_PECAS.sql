-- =====================================================
-- LAUDO TÉCNICO ESTRUTURADO + QUEBRA DE PEÇAS
-- =====================================================

-- 1. ADICIONAR CAMPOS DE LAUDO TÉCNICO NA TABELA ordem_servico
-- =====================================================

-- Adicionar campos estruturados para o laudo
DO $$
BEGIN
  -- Defeito apresentado pelo cliente (já existe como defeito_reclamado)
  
  -- Diagnóstico detalhado do técnico
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'ordem_servico' AND column_name = 'laudo_diagnostico'
  ) THEN
    ALTER TABLE ordem_servico ADD COLUMN laudo_diagnostico TEXT;
    COMMENT ON COLUMN ordem_servico.laudo_diagnostico IS 'Diagnóstico técnico detalhado';
  END IF;
  
  -- Causa do problema
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'ordem_servico' AND column_name = 'laudo_causa'
  ) THEN
    ALTER TABLE ordem_servico ADD COLUMN laudo_causa TEXT;
    COMMENT ON COLUMN ordem_servico.laudo_causa IS 'Causa identificada do problema';
  END IF;
  
  -- Procedimentos realizados
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'ordem_servico' AND column_name = 'laudo_procedimentos'
  ) THEN
    ALTER TABLE ordem_servico ADD COLUMN laudo_procedimentos TEXT;
    COMMENT ON COLUMN ordem_servico.laudo_procedimentos IS 'Procedimentos técnicos executados';
  END IF;
  
  -- Recomendações ao cliente
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'ordem_servico' AND column_name = 'laudo_recomendacoes'
  ) THEN
    ALTER TABLE ordem_servico ADD COLUMN laudo_recomendacoes TEXT;
    COMMENT ON COLUMN ordem_servico.laudo_recomendacoes IS 'Recomendações de uso e manutenção';
  END IF;
  
  -- Garantia do serviço (em dias)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'ordem_servico' AND column_name = 'laudo_garantia_dias'
  ) THEN
    ALTER TABLE ordem_servico ADD COLUMN laudo_garantia_dias INTEGER DEFAULT 90;
    COMMENT ON COLUMN ordem_servico.laudo_garantia_dias IS 'Prazo de garantia do serviço em dias';
  END IF;
  
  -- Condição final do equipamento
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'ordem_servico' AND column_name = 'laudo_condicao_final'
  ) THEN
    ALTER TABLE ordem_servico ADD COLUMN laudo_condicao_final TEXT;
    COMMENT ON COLUMN ordem_servico.laudo_condicao_final IS 'Condição do equipamento após reparo';
  END IF;

  RAISE NOTICE 'Campos de laudo técnico adicionados/verificados';
END $$;

-- =====================================================
-- 2. CRIAR TABELA DE QUEBRA/PERDA DE PEÇAS
-- =====================================================

CREATE TABLE IF NOT EXISTS quebra_pecas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Relacionamentos
  id_ordem_servico UUID REFERENCES ordem_servico(id) ON DELETE SET NULL,
  id_produto UUID REFERENCES produtos(id) ON DELETE RESTRICT,
  id_loja INTEGER REFERENCES lojas(id) ON DELETE RESTRICT,
  
  -- Dados da quebra
  quantidade INTEGER NOT NULL CHECK (quantidade > 0),
  tipo_ocorrencia VARCHAR(50) NOT NULL DEFAULT 'quebra',
  -- Tipos: 'quebra' (quebrou durante reparo), 'defeito' (peça veio com defeito), 
  --        'perda' (extraviada), 'vencimento' (prazo vencido)
  
  motivo TEXT NOT NULL, -- Descrição do que aconteceu
  responsavel VARCHAR(50), -- 'tecnico', 'fornecedor', 'cliente', 'transporte'
  
  -- Valores
  valor_unitario DECIMAL(10,2),
  valor_total DECIMAL(10,2) GENERATED ALWAYS AS (quantidade * valor_unitario) STORED,
  
  -- Compensação
  descontar_tecnico BOOLEAN DEFAULT FALSE,
  valor_descontado DECIMAL(10,2) DEFAULT 0,
  observacao_compensacao TEXT,
  
  -- Auditoria
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  criado_por UUID REFERENCES auth.users(id),
  
  -- Aprovação admin
  aprovado BOOLEAN DEFAULT FALSE,
  aprovado_em TIMESTAMP WITH TIME ZONE,
  aprovado_por UUID REFERENCES auth.users(id),
  observacao_aprovacao TEXT
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_quebra_pecas_os ON quebra_pecas(id_ordem_servico);
CREATE INDEX IF NOT EXISTS idx_quebra_pecas_produto ON quebra_pecas(id_produto);
CREATE INDEX IF NOT EXISTS idx_quebra_pecas_loja ON quebra_pecas(id_loja);
CREATE INDEX IF NOT EXISTS idx_quebra_pecas_criado_por ON quebra_pecas(criado_por);
CREATE INDEX IF NOT EXISTS idx_quebra_pecas_aprovado ON quebra_pecas(aprovado);

COMMENT ON TABLE quebra_pecas IS 'Registro de peças quebradas, perdidas ou com defeito durante assistência técnica';

-- =====================================================
-- 3. RLS PARA QUEBRA DE PEÇAS
-- =====================================================

ALTER TABLE quebra_pecas ENABLE ROW LEVEL SECURITY;

-- Técnicos e admins podem ver
CREATE POLICY "Autenticados podem ver quebras"
  ON quebra_pecas FOR SELECT
  TO authenticated
  USING (true);

-- Apenas técnicos podem registrar quebra (INSERT)
CREATE POLICY "Técnicos podem registrar quebra"
  ON quebra_pecas FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM tecnicos WHERE usuario_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid())
  );

-- Apenas admins podem aprovar (UPDATE)
CREATE POLICY "Admins podem aprovar quebra"
  ON quebra_pecas FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid()));

-- Admins podem deletar
CREATE POLICY "Admins podem deletar quebra"
  ON quebra_pecas FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid()));

-- =====================================================
-- 4. TRIGGER: Dar baixa no estoque ao aprovar quebra
-- =====================================================

CREATE OR REPLACE FUNCTION processar_quebra_peca()
RETURNS TRIGGER AS $$
BEGIN
  -- Quando quebra é aprovada, dar baixa no estoque
  IF NEW.aprovado = TRUE AND (OLD.aprovado = FALSE OR OLD.aprovado IS NULL) THEN
    
    -- Baixar do estoque
    UPDATE estoque_lojas
    SET quantidade = quantidade - NEW.quantidade
    WHERE id_produto = NEW.id_produto
      AND id_loja = NEW.id_loja;
    
    -- Registrar no histórico de estoque
    INSERT INTO historico_estoque (
      id_produto,
      id_loja,
      tipo_movimentacao,
      quantidade,
      observacao,
      criado_por,
      id_ordem_servico
    ) VALUES (
      NEW.id_produto,
      NEW.id_loja,
      'quebra',
      NEW.quantidade,
      'Quebra/Perda: ' || NEW.motivo || ' (Tipo: ' || NEW.tipo_ocorrencia || ')',
      NEW.aprovado_por,
      NEW.id_ordem_servico
    );
    
    NEW.aprovado_em := CURRENT_TIMESTAMP;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_processar_quebra
  BEFORE UPDATE ON quebra_pecas
  FOR EACH ROW
  EXECUTE FUNCTION processar_quebra_peca();

-- =====================================================
-- 5. VERIFICAÇÕES
-- =====================================================

-- Verificar novos campos em ordem_servico
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'ordem_servico'
  AND column_name LIKE 'laudo_%'
ORDER BY column_name;

-- Verificar tabela quebra_pecas
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'quebra_pecas'
ORDER BY ordinal_position;

-- Verificar políticas RLS
SELECT policyname, cmd
FROM pg_policies
WHERE tablename = 'quebra_pecas';

-- =====================================================
-- RESULTADO ESPERADO:
-- =====================================================
-- ✅ 6 novos campos em ordem_servico (laudo_*)
-- ✅ Tabela quebra_pecas criada com 18 campos
-- ✅ 4 políticas RLS ativas
-- ✅ Trigger para dar baixa no estoque ao aprovar
-- ✅ Histórico de estoque registra quebras
