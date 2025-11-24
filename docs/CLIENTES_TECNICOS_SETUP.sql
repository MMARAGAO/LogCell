-- =====================================================
-- TABELA: CLIENTES
-- =====================================================
-- Cadastro de clientes para Ordem de Serviço

CREATE TABLE IF NOT EXISTS clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Dados Pessoais
  nome VARCHAR(255) NOT NULL,
  cpf VARCHAR(14) UNIQUE, -- Opcional, formato: 000.000.000-00
  rg VARCHAR(20),
  data_nascimento DATE,
  
  -- Contatos
  telefone VARCHAR(20) NOT NULL,
  telefone_secundario VARCHAR(20),
  email VARCHAR(255),
  
  -- Endereço
  cep VARCHAR(10),
  logradouro VARCHAR(255),
  numero VARCHAR(20),
  complemento VARCHAR(100),
  bairro VARCHAR(100),
  cidade VARCHAR(100),
  estado VARCHAR(2),
  
  -- Informações Adicionais
  observacoes TEXT,
  ativo BOOLEAN DEFAULT true,
  
  -- Loja (se for sistema multi-loja) - OPCIONAL
  id_loja INTEGER REFERENCES lojas(id) ON DELETE RESTRICT,
  
  -- Auditoria
  criado_em TIMESTAMP DEFAULT NOW(),
  atualizado_em TIMESTAMP DEFAULT NOW(),
  criado_por UUID,
  atualizado_por UUID
);

-- Índices para performance
CREATE INDEX idx_clientes_nome ON clientes(nome);
CREATE INDEX idx_clientes_telefone ON clientes(telefone);
CREATE INDEX idx_clientes_cpf ON clientes(cpf);
CREATE INDEX idx_clientes_email ON clientes(email);
CREATE INDEX idx_clientes_loja ON clientes(id_loja);
CREATE INDEX idx_clientes_ativo ON clientes(ativo);

-- =====================================================
-- TABELA: TECNICOS
-- =====================================================
-- Cadastro de técnicos responsáveis pelas OS

CREATE TABLE IF NOT EXISTS tecnicos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Dados Pessoais
  nome VARCHAR(255) NOT NULL,
  cpf VARCHAR(14) UNIQUE,
  rg VARCHAR(20),
  data_nascimento DATE,
  
  -- Contatos
  telefone VARCHAR(20) NOT NULL,
  email VARCHAR(255),
  
  -- Profissionais
  especialidades TEXT[], -- Array de especialidades: ['Smartphones', 'Notebooks', etc]
  registro_profissional VARCHAR(50), -- Número de registro profissional se houver
  data_admissao DATE,
  data_demissao DATE,
  
  -- Configurações
  cor_agenda VARCHAR(7) DEFAULT '#3b82f6', -- Cor hex para identificação visual
  ativo BOOLEAN DEFAULT true,
  
  -- Vinculação com usuário (opcional)
  usuario_id UUID UNIQUE, -- Pode ser vinculado a um usuário do sistema
  
  -- Loja - OPCIONAL
  id_loja INTEGER REFERENCES lojas(id) ON DELETE RESTRICT,
  
  -- Auditoria
  criado_em TIMESTAMP DEFAULT NOW(),
  atualizado_em TIMESTAMP DEFAULT NOW(),
  criado_por UUID,
  atualizado_por UUID
);

-- Índices para performance
CREATE INDEX idx_tecnicos_nome ON tecnicos(nome);
CREATE INDEX idx_tecnicos_ativo ON tecnicos(ativo);
CREATE INDEX idx_tecnicos_loja ON tecnicos(id_loja);
CREATE INDEX idx_tecnicos_usuario ON tecnicos(usuario_id);

-- =====================================================
-- TRIGGER: Atualizar timestamp de atualização
-- =====================================================

-- Clientes
CREATE OR REPLACE FUNCTION atualizar_timestamp_clientes()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_atualizar_clientes
  BEFORE UPDATE ON clientes
  FOR EACH ROW
  EXECUTE FUNCTION atualizar_timestamp_clientes();

-- Técnicos
CREATE OR REPLACE FUNCTION atualizar_timestamp_tecnicos()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_atualizar_tecnicos
  BEFORE UPDATE ON tecnicos
  FOR EACH ROW
  EXECUTE FUNCTION atualizar_timestamp_tecnicos();

-- =====================================================
-- RLS (Row Level Security)
-- =====================================================

-- Habilitar RLS
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE tecnicos ENABLE ROW LEVEL SECURITY;

-- Políticas para clientes
CREATE POLICY "Usuários autenticados podem ver clientes"
  ON clientes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuários autenticados podem criar clientes"
  ON clientes FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem atualizar clientes"
  ON clientes FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Usuários autenticados podem deletar clientes"
  ON clientes FOR DELETE
  TO authenticated
  USING (true);

-- Políticas para técnicos
CREATE POLICY "Usuários autenticados podem ver técnicos"
  ON tecnicos FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuários autenticados podem criar técnicos"
  ON tecnicos FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem atualizar técnicos"
  ON tecnicos FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Usuários autenticados podem deletar técnicos"
  ON tecnicos FOR DELETE
  TO authenticated
  USING (true);

-- =====================================================
-- REALTIME (Opcional - para atualizações em tempo real)
-- =====================================================

-- Habilitar realtime para as tabelas
ALTER PUBLICATION supabase_realtime ADD TABLE clientes;
ALTER PUBLICATION supabase_realtime ADD TABLE tecnicos;

-- =====================================================
-- DADOS INICIAIS (Opcional)
-- =====================================================

-- Você pode adicionar técnicos iniciais se desejar
-- INSERT INTO tecnicos (nome, telefone, especialidades, id_loja, ativo)
-- VALUES 
--   ('João Silva', '(11) 98765-4321', ARRAY['Smartphones', 'Tablets'], 1, true),
--   ('Maria Santos', '(11) 97654-3210', ARRAY['Notebooks', 'PCs'], 1, true);
