-- =====================================================
-- SISTEMA DE ORDEM DE SERVIÇO (OS)
-- =====================================================
-- Este script cria as tabelas necessárias para gerenciar
-- ordens de serviço com integração ao estoque
-- =====================================================

-- =====================================================
-- 1. TABELA: ordem_servico
-- =====================================================
CREATE TABLE IF NOT EXISTS ordem_servico (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  numero_os SERIAL UNIQUE NOT NULL, -- Número sequencial da OS
  
  -- Dados do Cliente
  cliente_nome VARCHAR(255) NOT NULL,
  cliente_telefone VARCHAR(20),
  cliente_email VARCHAR(255),
  cliente_cpf_cnpj VARCHAR(20),
  cliente_endereco TEXT,
  
  -- Dados do Equipamento
  equipamento_tipo VARCHAR(100) NOT NULL, -- Ex: Celular, Notebook, Tablet
  equipamento_marca VARCHAR(100),
  equipamento_modelo VARCHAR(100),
  equipamento_numero_serie VARCHAR(100),
  equipamento_senha VARCHAR(100), -- Senha/PIN do aparelho
  
  -- Problema/Defeito
  defeito_reclamado TEXT NOT NULL,
  estado_equipamento TEXT, -- Observações sobre estado físico
  acessorios_entregues TEXT, -- Ex: Carregador, capa, etc
  
  -- Serviço
  diagnostico TEXT,
  servico_realizado TEXT,
  observacoes_tecnicas TEXT,
  
  -- Valores
  valor_orcamento DECIMAL(10, 2),
  valor_desconto DECIMAL(10, 2) DEFAULT 0,
  valor_total DECIMAL(10, 2),
  valor_pago DECIMAL(10, 2) DEFAULT 0,
  
  -- Prazos e Datas
  data_entrada TIMESTAMP NOT NULL DEFAULT NOW(),
  previsao_entrega TIMESTAMP,
  data_inicio_servico TIMESTAMP,
  data_conclusao TIMESTAMP,
  data_entrega_cliente TIMESTAMP,
  
  -- Status da OS
  status VARCHAR(50) NOT NULL DEFAULT 'aguardando',
  -- Possíveis status:
  -- 'aguardando' - Aguardando aprovação/diagnóstico
  -- 'aprovado' - Orçamento aprovado, aguardando início
  -- 'em_andamento' - Serviço em execução
  -- 'aguardando_peca' - Aguardando chegada de peça
  -- 'concluido' - Serviço concluído, aguardando retirada
  -- 'entregue' - Equipamento entregue ao cliente
  -- 'cancelado' - OS cancelada
  -- 'garantia' - Equipamento retornou em garantia
  
  prioridade VARCHAR(20) DEFAULT 'normal', -- baixa, normal, alta, urgente
  
  -- Loja e Responsáveis
  id_loja INTEGER NOT NULL REFERENCES lojas(id) ON DELETE RESTRICT,
  tecnico_responsavel UUID, -- ID do técnico responsável (sem FK para simplificar)
  
  -- Auditoria
  criado_em TIMESTAMP DEFAULT NOW(),
  atualizado_em TIMESTAMP DEFAULT NOW(),
  criado_por UUID,
  atualizado_por UUID
);

-- Índices para performance
CREATE INDEX idx_os_numero ON ordem_servico(numero_os);
CREATE INDEX idx_os_cliente_nome ON ordem_servico(cliente_nome);
CREATE INDEX idx_os_cliente_telefone ON ordem_servico(cliente_telefone);
CREATE INDEX idx_os_status ON ordem_servico(status);
CREATE INDEX idx_os_data_entrada ON ordem_servico(data_entrada);
CREATE INDEX idx_os_loja ON ordem_servico(id_loja);
CREATE INDEX idx_os_tecnico ON ordem_servico(tecnico_responsavel);

-- =====================================================
-- 2. TABELA: ordem_servico_pecas
-- =====================================================
-- Relaciona peças do estoque utilizadas na OS
CREATE TABLE IF NOT EXISTS ordem_servico_pecas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_ordem_servico UUID NOT NULL REFERENCES ordem_servico(id) ON DELETE CASCADE,
  id_produto UUID REFERENCES produtos(id) ON DELETE RESTRICT, -- Nullable para produtos avulsos
  id_loja INTEGER NOT NULL REFERENCES lojas(id) ON DELETE RESTRICT,
  
  -- Tipo de produto
  tipo_produto VARCHAR(20) NOT NULL DEFAULT 'estoque', -- 'estoque' ou 'avulso'
  
  -- Dados da peça (quando é do estoque, vem do produto)
  descricao_peca VARCHAR(255) NOT NULL, -- Descrição manual para avulso
  
  quantidade INTEGER NOT NULL CHECK (quantidade > 0),
  valor_custo DECIMAL(10, 2) NOT NULL, -- Custo da peça (preço de compra)
  valor_venda DECIMAL(10, 2) NOT NULL, -- Valor cobrado do cliente
  valor_total DECIMAL(10, 2) NOT NULL, -- valor_venda * quantidade
  
  -- Controle de estoque (apenas para produtos do estoque)
  estoque_reservado BOOLEAN DEFAULT FALSE, -- Reservado ao adicionar na OS
  estoque_baixado BOOLEAN DEFAULT FALSE, -- Baixa real ao entregar OS
  data_reserva_estoque TIMESTAMP,
  data_baixa_estoque TIMESTAMP,
  
  observacao TEXT,
  
  criado_em TIMESTAMP DEFAULT NOW(),
  criado_por UUID REFERENCES auth.users(id)
);

CREATE INDEX idx_os_pecas_ordem ON ordem_servico_pecas(id_ordem_servico);
CREATE INDEX idx_os_pecas_produto ON ordem_servico_pecas(id_produto);
CREATE INDEX idx_os_pecas_tipo ON ordem_servico_pecas(tipo_produto);
CREATE INDEX idx_os_pecas_estoque_reservado ON ordem_servico_pecas(estoque_reservado);
CREATE INDEX idx_os_pecas_estoque_baixado ON ordem_servico_pecas(estoque_baixado);

-- =====================================================
-- 3. TABELA: historico_ordem_servico
-- =====================================================
-- Registra todas as mudanças de status e eventos da OS
CREATE TABLE IF NOT EXISTS historico_ordem_servico (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_ordem_servico UUID NOT NULL REFERENCES ordem_servico(id) ON DELETE CASCADE,
  
  tipo_evento VARCHAR(50) NOT NULL,
  -- Tipos: 'criacao', 'mudanca_status', 'adicao_peca', 'remocao_peca',
  --        'atualizacao_valores', 'observacao', 'conclusao', 'cancelamento'
  
  status_anterior VARCHAR(50),
  status_novo VARCHAR(50),
  
  descricao TEXT NOT NULL,
  dados_anteriores JSONB, -- Snapshot dos dados antes da mudança
  dados_novos JSONB, -- Snapshot dos dados após a mudança
  
  criado_em TIMESTAMP DEFAULT NOW(),
  criado_por UUID REFERENCES auth.users(id),
  criado_por_nome VARCHAR(255) -- Nome do usuário para histórico
);

CREATE INDEX idx_historico_os_ordem ON historico_ordem_servico(id_ordem_servico);
CREATE INDEX idx_historico_os_tipo ON historico_ordem_servico(tipo_evento);
CREATE INDEX idx_historico_os_data ON historico_ordem_servico(criado_em);

-- =====================================================
-- 4. TABELA: ordem_servico_anexos
-- =====================================================
-- Fotos e documentos da OS (antes/depois, comprovantes, etc)
CREATE TABLE IF NOT EXISTS ordem_servico_anexos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_ordem_servico UUID NOT NULL REFERENCES ordem_servico(id) ON DELETE CASCADE,
  
  tipo VARCHAR(50) NOT NULL, -- 'foto_entrada', 'foto_servico', 'foto_entrega', 'documento'
  descricao TEXT,
  url_arquivo TEXT NOT NULL,
  nome_arquivo VARCHAR(255),
  tamanho_arquivo INTEGER, -- em bytes
  
  criado_em TIMESTAMP DEFAULT NOW(),
  criado_por UUID REFERENCES auth.users(id)
);

CREATE INDEX idx_os_anexos_ordem ON ordem_servico_anexos(id_ordem_servico);
CREATE INDEX idx_os_anexos_tipo ON ordem_servico_anexos(tipo);

-- =====================================================
-- 5. TABELA: ordem_servico_caixa
-- =====================================================
-- Lançamento automático no caixa quando OS é entregue
CREATE TABLE IF NOT EXISTS ordem_servico_caixa (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_ordem_servico UUID NOT NULL REFERENCES ordem_servico(id) ON DELETE CASCADE,
  id_loja INTEGER NOT NULL REFERENCES lojas(id) ON DELETE RESTRICT,
  
  -- Valores
  valor_total DECIMAL(10, 2) NOT NULL,
  valor_pecas DECIMAL(10, 2) DEFAULT 0, -- Total das peças
  valor_servico DECIMAL(10, 2) DEFAULT 0, -- Valor do serviço (mão de obra)
  valor_desconto DECIMAL(10, 2) DEFAULT 0,
  
  -- Forma de pagamento (pode ser editável no caixa)
  forma_pagamento VARCHAR(50), -- dinheiro, cartao_debito, cartao_credito, pix, etc
  parcelas INTEGER DEFAULT 1,
  
  -- Status no caixa
  status_caixa VARCHAR(20) DEFAULT 'pendente', -- pendente, confirmado, cancelado
  data_confirmacao TIMESTAMP,
  
  observacoes TEXT,
  
  criado_em TIMESTAMP DEFAULT NOW(),
  criado_por UUID REFERENCES auth.users(id),
  confirmado_por UUID REFERENCES auth.users(id)
);

CREATE INDEX idx_os_caixa_ordem ON ordem_servico_caixa(id_ordem_servico);
CREATE INDEX idx_os_caixa_loja ON ordem_servico_caixa(id_loja);
CREATE INDEX idx_os_caixa_status ON ordem_servico_caixa(status_caixa);

-- =====================================================
-- 6. RLS (Row Level Security)
-- =====================================================

-- Habilitar RLS
ALTER TABLE ordem_servico ENABLE ROW LEVEL SECURITY;
ALTER TABLE ordem_servico_pecas ENABLE ROW LEVEL SECURITY;
ALTER TABLE historico_ordem_servico ENABLE ROW LEVEL SECURITY;
ALTER TABLE ordem_servico_anexos ENABLE ROW LEVEL SECURITY;
ALTER TABLE ordem_servico_caixa ENABLE ROW LEVEL SECURITY;

-- Políticas para ordem_servico
CREATE POLICY "Usuários autenticados podem visualizar OS"
  ON ordem_servico FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuários autenticados podem criar OS"
  ON ordem_servico FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem atualizar OS"
  ON ordem_servico FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Usuários autenticados podem deletar OS"
  ON ordem_servico FOR DELETE
  TO authenticated
  USING (true);

-- Políticas para ordem_servico_pecas
CREATE POLICY "Usuários autenticados podem visualizar peças da OS"
  ON ordem_servico_pecas FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuários autenticados podem adicionar peças à OS"
  ON ordem_servico_pecas FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem atualizar peças da OS"
  ON ordem_servico_pecas FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Usuários autenticados podem remover peças da OS"
  ON ordem_servico_pecas FOR DELETE
  TO authenticated
  USING (true);

-- Políticas para historico_ordem_servico
CREATE POLICY "Usuários autenticados podem visualizar histórico"
  ON historico_ordem_servico FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Sistema pode inserir no histórico"
  ON historico_ordem_servico FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Políticas para ordem_servico_anexos
CREATE POLICY "Usuários autenticados podem visualizar anexos"
  ON ordem_servico_anexos FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuários autenticados podem adicionar anexos"
  ON ordem_servico_anexos FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem deletar anexos"
  ON ordem_servico_anexos FOR DELETE
  TO authenticated
  USING (true);

-- Políticas para ordem_servico_caixa
CREATE POLICY "Usuários autenticados podem visualizar caixa OS"
  ON ordem_servico_caixa FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Sistema pode inserir no caixa OS"
  ON ordem_servico_caixa FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem atualizar caixa OS"
  ON ordem_servico_caixa FOR UPDATE
  TO authenticated
  USING (true);

-- =====================================================
-- 6. TRIGGERS
-- =====================================================

-- Trigger para atualizar atualizado_em
CREATE OR REPLACE FUNCTION atualizar_timestamp_os()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_atualizar_os
  BEFORE UPDATE ON ordem_servico
  FOR EACH ROW
  EXECUTE FUNCTION atualizar_timestamp_os();

-- Trigger para registrar mudanças no histórico
CREATE OR REPLACE FUNCTION registrar_historico_os()
RETURNS TRIGGER AS $$
DECLARE
  v_tipo_evento VARCHAR(50);
  v_descricao TEXT;
  v_usuario_nome VARCHAR(255);
BEGIN
  -- Buscar nome do usuário
  SELECT nome INTO v_usuario_nome
  FROM usuarios
  WHERE id = NEW.atualizado_por
  LIMIT 1;

  IF TG_OP = 'INSERT' THEN
    v_tipo_evento := 'criacao';
    v_descricao := 'Ordem de Serviço criada - OS #' || NEW.numero_os;
    
    INSERT INTO historico_ordem_servico (
      id_ordem_servico,
      tipo_evento,
      status_novo,
      descricao,
      dados_novos,
      criado_por,
      criado_por_nome
    ) VALUES (
      NEW.id,
      v_tipo_evento,
      NEW.status,
      v_descricao,
      to_jsonb(NEW),
      NEW.criado_por,
      v_usuario_nome
    );
    
  ELSIF TG_OP = 'UPDATE' THEN
    -- Detectar tipo de mudança
    IF OLD.status != NEW.status THEN
      v_tipo_evento := 'mudanca_status';
      v_descricao := 'Status alterado de "' || OLD.status || '" para "' || NEW.status || '"';
      
      INSERT INTO historico_ordem_servico (
        id_ordem_servico,
        tipo_evento,
        status_anterior,
        status_novo,
        descricao,
        dados_anteriores,
        dados_novos,
        criado_por,
        criado_por_nome
      ) VALUES (
        NEW.id,
        v_tipo_evento,
        OLD.status,
        NEW.status,
        v_descricao,
        to_jsonb(OLD),
        to_jsonb(NEW),
        NEW.atualizado_por,
        v_usuario_nome
      );
    END IF;
    
    -- Registrar outras mudanças importantes
    IF OLD.valor_total != NEW.valor_total OR 
       OLD.valor_orcamento != NEW.valor_orcamento THEN
      INSERT INTO historico_ordem_servico (
        id_ordem_servico,
        tipo_evento,
        descricao,
        dados_anteriores,
        dados_novos,
        criado_por,
        criado_por_nome
      ) VALUES (
        NEW.id,
        'atualizacao_valores',
        'Valores atualizados',
        jsonb_build_object(
          'valor_orcamento', OLD.valor_orcamento,
          'valor_total', OLD.valor_total,
          'valor_pago', OLD.valor_pago
        ),
        jsonb_build_object(
          'valor_orcamento', NEW.valor_orcamento,
          'valor_total', NEW.valor_total,
          'valor_pago', NEW.valor_pago
        ),
        NEW.atualizado_por,
        v_usuario_nome
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_historico_os
  AFTER INSERT OR UPDATE ON ordem_servico
  FOR EACH ROW
  EXECUTE FUNCTION registrar_historico_os();

-- Trigger para dar baixa no estoque quando peça é adicionada
CREATE OR REPLACE FUNCTION processar_reserva_estoque_os()
RETURNS TRIGGER AS $$
DECLARE
  v_estoque_atual INTEGER;
BEGIN
  -- Apenas processar se for produto do estoque (não avulso)
  IF NEW.tipo_produto = 'estoque' AND NEW.id_produto IS NOT NULL THEN
    
    IF TG_OP = 'INSERT' THEN
      -- Verificar se há estoque disponível
      SELECT quantidade INTO v_estoque_atual
      FROM estoque_lojas
      WHERE id_produto = NEW.id_produto
        AND id_loja = NEW.id_loja;
      
      IF v_estoque_atual IS NULL OR v_estoque_atual < NEW.quantidade THEN
        RAISE EXCEPTION 'Estoque insuficiente para o produto';
      END IF;
      
      -- Apenas reservar (não dar baixa ainda)
      NEW.estoque_reservado := TRUE;
      NEW.data_reserva_estoque := NOW();
      
      -- Registrar reserva no histórico
      INSERT INTO historico_estoque (
        id_produto,
        id_loja,
        tipo_movimentacao,
        quantidade,
        quantidade_anterior,
        quantidade_nova,
        observacao,
        criado_por
      ) VALUES (
        NEW.id_produto,
        NEW.id_loja,
        'reserva',
        NEW.quantidade,
        v_estoque_atual,
        v_estoque_atual,
        'Reservado para OS #' || (SELECT numero_os FROM ordem_servico WHERE id = NEW.id_ordem_servico),
        NEW.criado_por
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_reserva_estoque_os
  BEFORE INSERT ON ordem_servico_pecas
  FOR EACH ROW
  EXECUTE FUNCTION processar_reserva_estoque_os();

-- Trigger para devolver peças ao estoque quando OS é cancelada
CREATE OR REPLACE FUNCTION devolver_pecas_estoque_os()
RETURNS TRIGGER AS $$
DECLARE
  v_peca RECORD;
BEGIN
  IF NEW.status = 'cancelado' AND OLD.status != 'cancelado' THEN
    -- Devolver todas as peças reservadas mas não baixadas
    FOR v_peca IN 
      SELECT * FROM ordem_servico_pecas 
      WHERE id_ordem_servico = NEW.id 
        AND tipo_produto = 'estoque'
        AND estoque_reservado = TRUE
        AND estoque_baixado = FALSE
    LOOP
      -- Registrar liberação da reserva no histórico
      INSERT INTO historico_estoque (
        id_produto,
        id_loja,
        tipo_movimentacao,
        quantidade,
        observacao,
        criado_por
      ) VALUES (
        v_peca.id_produto,
        v_peca.id_loja,
        'liberacao_reserva',
        v_peca.quantidade,
        'Liberação por cancelamento de OS #' || NEW.numero_os,
        NEW.atualizado_por
      );
      
      -- Atualizar flag
      UPDATE ordem_servico_pecas
      SET estoque_reservado = FALSE
      WHERE id = v_peca.id;
    END LOOP;
    
    -- Se já foi dado baixa, devolver ao estoque
    FOR v_peca IN 
      SELECT * FROM ordem_servico_pecas 
      WHERE id_ordem_servico = NEW.id 
        AND tipo_produto = 'estoque'
        AND estoque_baixado = TRUE
    LOOP
      -- Devolver ao estoque
      UPDATE estoque_lojas
      SET quantidade = quantidade + v_peca.quantidade
      WHERE id_produto = v_peca.id_produto
        AND id_loja = v_peca.id_loja;
      
      -- Registrar no histórico
      INSERT INTO historico_estoque (
        id_produto,
        id_loja,
        tipo_movimentacao,
        quantidade,
        observacao,
        criado_por
      ) VALUES (
        v_peca.id_produto,
        v_peca.id_loja,
        'entrada',
        v_peca.quantidade,
        'Devolução por cancelamento de OS #' || NEW.numero_os,
        NEW.atualizado_por
      );
      
      -- Atualizar flag
      UPDATE ordem_servico_pecas
      SET estoque_baixado = FALSE
      WHERE id = v_peca.id;
    END LOOP;
    
    -- Registrar no histórico
    INSERT INTO historico_ordem_servico (
      id_ordem_servico,
      tipo_evento,
      status_anterior,
      status_novo,
      descricao,
      criado_por
    ) VALUES (
      NEW.id,
      'cancelamento',
      OLD.status,
      'cancelado',
      'OS cancelada - Peças devolvidas/liberadas',
      NEW.atualizado_por
    );
  END IF;
  
  -- Dar baixa no estoque quando status muda para 'entregue'
  IF NEW.status = 'entregue' AND OLD.status != 'entregue' THEN
    FOR v_peca IN 
      SELECT * FROM ordem_servico_pecas 
      WHERE id_ordem_servico = NEW.id 
        AND tipo_produto = 'estoque'
        AND estoque_reservado = TRUE
        AND estoque_baixado = FALSE
    LOOP
      -- Dar baixa no estoque
      UPDATE estoque_lojas
      SET quantidade = quantidade - v_peca.quantidade
      WHERE id_produto = v_peca.id_produto
        AND id_loja = v_peca.id_loja;
      
      -- Registrar no histórico de estoque
      INSERT INTO historico_estoque (
        id_produto,
        id_loja,
        tipo_movimentacao,
        quantidade,
        observacao,
        criado_por
      ) VALUES (
        v_peca.id_produto,
        v_peca.id_loja,
        'saida',
        v_peca.quantidade,
        'Baixa por entrega de OS #' || NEW.numero_os,
        NEW.atualizado_por
      );
      
      -- Atualizar flags
      UPDATE ordem_servico_pecas
      SET estoque_baixado = TRUE,
          data_baixa_estoque = NOW()
      WHERE id = v_peca.id;
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_devolver_estoque_os
  AFTER UPDATE ON ordem_servico
  FOR EACH ROW
  EXECUTE FUNCTION devolver_pecas_estoque_os();

-- Trigger para criar lançamento no caixa quando OS é entregue
CREATE OR REPLACE FUNCTION criar_lancamento_caixa_os()
RETURNS TRIGGER AS $$
DECLARE
  v_total_pecas DECIMAL(10, 2);
  v_valor_servico DECIMAL(10, 2);
BEGIN
  -- Apenas criar lançamento se status mudou para 'entregue'
  IF NEW.status = 'entregue' AND OLD.status != 'entregue' THEN
    
    -- Calcular total das peças
    SELECT COALESCE(SUM(valor_total), 0) INTO v_total_pecas
    FROM ordem_servico_pecas
    WHERE id_ordem_servico = NEW.id;
    
    -- Calcular valor do serviço (total - peças)
    v_valor_servico := COALESCE(NEW.valor_total, 0) - v_total_pecas;
    
    -- Criar lançamento no caixa (se não existir)
    INSERT INTO ordem_servico_caixa (
      id_ordem_servico,
      id_loja,
      valor_total,
      valor_pecas,
      valor_servico,
      valor_desconto,
      status_caixa,
      criado_por
    )
    SELECT
      NEW.id,
      NEW.id_loja,
      COALESCE(NEW.valor_total, 0),
      v_total_pecas,
      v_valor_servico,
      COALESCE(NEW.valor_desconto, 0),
      'pendente',
      NEW.atualizado_por
    WHERE NOT EXISTS (
      SELECT 1 FROM ordem_servico_caixa 
      WHERE id_ordem_servico = NEW.id
    );
    
    -- Registrar no histórico
    INSERT INTO historico_ordem_servico (
      id_ordem_servico,
      tipo_evento,
      descricao,
      criado_por
    ) VALUES (
      NEW.id,
      'lancamento_caixa',
      'Lançamento criado no caixa - Valor: R$ ' || COALESCE(NEW.valor_total, 0),
      NEW.atualizado_por
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_lancamento_caixa_os
  AFTER UPDATE ON ordem_servico
  FOR EACH ROW
  EXECUTE FUNCTION criar_lancamento_caixa_os();

-- =====================================================
-- 7. FUNÇÕES AUXILIARES
-- =====================================================

-- Função para obter estatísticas de OS
CREATE OR REPLACE FUNCTION obter_estatisticas_os(p_id_loja INTEGER DEFAULT NULL)
RETURNS TABLE (
  total_os INTEGER,
  aguardando INTEGER,
  em_andamento INTEGER,
  concluido INTEGER,
  entregue INTEGER,
  cancelado INTEGER,
  valor_total_mes DECIMAL,
  valor_recebido_mes DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::INTEGER AS total_os,
    COUNT(*) FILTER (WHERE status = 'aguardando')::INTEGER AS aguardando,
    COUNT(*) FILTER (WHERE status = 'em_andamento')::INTEGER AS em_andamento,
    COUNT(*) FILTER (WHERE status = 'concluido')::INTEGER AS concluido,
    COUNT(*) FILTER (WHERE status = 'entregue')::INTEGER AS entregue,
    COUNT(*) FILTER (WHERE status = 'cancelado')::INTEGER AS cancelado,
    COALESCE(SUM(valor_total) FILTER (WHERE 
      data_entrada >= date_trunc('month', CURRENT_DATE)
    ), 0) AS valor_total_mes,
    COALESCE(SUM(valor_pago) FILTER (WHERE 
      data_entrada >= date_trunc('month', CURRENT_DATE)
    ), 0) AS valor_recebido_mes
  FROM ordem_servico
  WHERE (p_id_loja IS NULL OR id_loja = p_id_loja);
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 8. HABILITAR REALTIME (OPCIONAL)
-- =====================================================

-- Habilitar realtime para atualizações em tempo real
ALTER PUBLICATION supabase_realtime ADD TABLE ordem_servico;
ALTER PUBLICATION supabase_realtime ADD TABLE ordem_servico_pecas;
ALTER PUBLICATION supabase_realtime ADD TABLE historico_ordem_servico;
ALTER PUBLICATION supabase_realtime ADD TABLE ordem_servico_caixa;

-- =====================================================
-- FIM DO SCRIPT
-- =====================================================
