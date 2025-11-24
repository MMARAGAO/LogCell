-- ============================================
-- CRIAÇÃO DA TABELA DE LOJAS
-- ============================================

-- 1. Criar tabela lojas
CREATE TABLE IF NOT EXISTS public.lojas (
  id SERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  cnpj VARCHAR(18),
  telefone TEXT,
  email TEXT,
  endereco TEXT,
  cidade TEXT,
  estado VARCHAR(2),
  cep VARCHAR(9),
  ativo BOOLEAN DEFAULT TRUE,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_lojas_nome ON lojas(nome);
CREATE INDEX IF NOT EXISTS idx_lojas_cnpj ON lojas(cnpj);
CREATE INDEX IF NOT EXISTS idx_lojas_ativo ON lojas(ativo);
CREATE INDEX IF NOT EXISTS idx_lojas_cidade ON lojas(cidade);

-- 3. Adicionar constraint de CNPJ único
ALTER TABLE lojas
ADD CONSTRAINT lojas_cnpj_unique UNIQUE (cnpj);

-- 4. Habilitar RLS (Row Level Security)
ALTER TABLE lojas ENABLE ROW LEVEL SECURITY;

-- 5. Remover políticas antigas se existirem
DROP POLICY IF EXISTS "Usuários autenticados podem visualizar lojas" ON lojas;
DROP POLICY IF EXISTS "Usuários autenticados podem inserir lojas" ON lojas;
DROP POLICY IF EXISTS "Usuários autenticados podem atualizar lojas" ON lojas;
DROP POLICY IF EXISTS "Usuários autenticados podem deletar lojas" ON lojas;

-- 6. Criar políticas RLS

-- Política para visualizar lojas (todos os usuários autenticados)
CREATE POLICY "Usuários autenticados podem visualizar lojas"
ON lojas
FOR SELECT
TO authenticated
USING (true);

-- Política para inserir lojas (todos os usuários autenticados)
CREATE POLICY "Usuários autenticados podem inserir lojas"
ON lojas
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Política para atualizar lojas (todos os usuários autenticados)
CREATE POLICY "Usuários autenticados podem atualizar lojas"
ON lojas
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Política para deletar lojas (todos os usuários autenticados)
CREATE POLICY "Usuários autenticados podem deletar lojas"
ON lojas
FOR DELETE
TO authenticated
USING (true);

-- ============================================
-- INSERIR DADOS DE EXEMPLO (OPCIONAL)
-- ============================================

-- Descomente para inserir lojas de exemplo
/*
INSERT INTO lojas (nome, cnpj, telefone, email, endereco, cidade, estado, cep, ativo) VALUES
  ('Filial Centro', '12.345.678/0001-90', '(11) 98765-4321', 'centro@exemplo.com', 'Rua Principal, 123', 'São Paulo', 'SP', '01234-567', true),
  ('Filial Zona Sul', '12.345.678/0002-71', '(11) 97654-3210', 'zonasul@exemplo.com', 'Av. Paulista, 456', 'São Paulo', 'SP', '01311-000', true),
  ('Filial Rio de Janeiro', '12.345.678/0003-52', '(21) 98888-7777', 'rio@exemplo.com', 'Av. Atlântica, 789', 'Rio de Janeiro', 'RJ', '22010-000', true);
*/

-- ============================================
-- VERIFICAÇÃO
-- ============================================

-- Verificar estrutura da tabela
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns
WHERE table_name = 'lojas'
ORDER BY ordinal_position;

-- Verificar políticas RLS
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE tablename = 'lojas'
ORDER BY policyname;

-- Verificar índices
SELECT
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'lojas';

-- Contar lojas
SELECT COUNT(*) as total_lojas FROM lojas;
