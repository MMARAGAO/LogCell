-- =====================================================
-- FIX: Políticas RLS para Tabela LOJAS
-- =====================================================
-- Execute este SQL no Supabase para garantir acesso às lojas

-- 1. Verificar se RLS está habilitado
-- Se não estiver, habilitar
ALTER TABLE lojas ENABLE ROW LEVEL SECURITY;

-- 2. Remover políticas antigas se existirem
DROP POLICY IF EXISTS "Usuários autenticados podem ver lojas" ON lojas;
DROP POLICY IF EXISTS "Usuários autenticados podem criar lojas" ON lojas;
DROP POLICY IF EXISTS "Usuários autenticados podem atualizar lojas" ON lojas;
DROP POLICY IF EXISTS "Usuários autenticados podem deletar lojas" ON lojas;
DROP POLICY IF EXISTS "Permitir leitura de lojas para usuários autenticados" ON lojas;
DROP POLICY IF EXISTS "Permitir inserção de lojas para usuários autenticados" ON lojas;
DROP POLICY IF EXISTS "Permitir atualização de lojas para usuários autenticados" ON lojas;
DROP POLICY IF EXISTS "Permitir exclusão de lojas para usuários autenticados" ON lojas;

-- 3. Criar políticas permissivas
CREATE POLICY "Usuários autenticados podem ver lojas"
  ON lojas FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuários autenticados podem criar lojas"
  ON lojas FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem atualizar lojas"
  ON lojas FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem deletar lojas"
  ON lojas FOR DELETE
  TO authenticated
  USING (true);

-- =====================================================
-- INSERIR LOJA INICIAL (se não existir nenhuma)
-- =====================================================

-- Verificar quantas lojas existem e inserir uma se necessário
INSERT INTO lojas (nome, telefone, email, endereco, cidade, estado, cep, ativo)
SELECT 
  'Matriz',
  '(11) 98765-4321',
  'contato@suaempresa.com.br',
  'Rua Principal, 123',
  'São Paulo',
  'SP',
  '01234-567',
  true
WHERE NOT EXISTS (SELECT 1 FROM lojas LIMIT 1);

-- =====================================================
-- VERIFICAR LOJAS CADASTRADAS
-- =====================================================

-- Execute esta query para ver todas as lojas
SELECT 
  id,
  nome,
  cnpj,
  cidade,
  estado,
  ativo,
  criado_em
FROM lojas
ORDER BY nome;
