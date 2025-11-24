-- Script para adicionar CASCADE DELETE nas foreign keys de vendas
-- Isso permite deletar vendas sem precisar deletar manualmente todos os registros relacionados

-- 1. Remover constraint existente de itens_devolucao → itens_venda
ALTER TABLE itens_devolucao 
DROP CONSTRAINT IF EXISTS itens_devolucao_item_venda_id_fkey;

-- 2. Adicionar nova constraint com ON DELETE CASCADE
ALTER TABLE itens_devolucao
ADD CONSTRAINT itens_devolucao_item_venda_id_fkey 
FOREIGN KEY (item_venda_id) 
REFERENCES itens_venda(id) 
ON DELETE CASCADE;

-- 3. Fazer o mesmo para outras tabelas relacionadas a vendas

-- devolucoes_venda → vendas
ALTER TABLE devolucoes_venda 
DROP CONSTRAINT IF EXISTS devolucoes_venda_venda_id_fkey;

ALTER TABLE devolucoes_venda
ADD CONSTRAINT devolucoes_venda_venda_id_fkey 
FOREIGN KEY (venda_id) 
REFERENCES vendas(id) 
ON DELETE CASCADE;

-- itens_venda → vendas
ALTER TABLE itens_venda 
DROP CONSTRAINT IF EXISTS itens_venda_venda_id_fkey;

ALTER TABLE itens_venda
ADD CONSTRAINT itens_venda_venda_id_fkey 
FOREIGN KEY (venda_id) 
REFERENCES vendas(id) 
ON DELETE CASCADE;

-- pagamentos_venda → vendas
ALTER TABLE pagamentos_venda 
DROP CONSTRAINT IF EXISTS pagamentos_venda_venda_id_fkey;

ALTER TABLE pagamentos_venda
ADD CONSTRAINT pagamentos_venda_venda_id_fkey 
FOREIGN KEY (venda_id) 
REFERENCES vendas(id) 
ON DELETE CASCADE;

-- descontos_venda → vendas
ALTER TABLE descontos_venda 
DROP CONSTRAINT IF EXISTS descontos_venda_venda_id_fkey;

ALTER TABLE descontos_venda
ADD CONSTRAINT descontos_venda_venda_id_fkey 
FOREIGN KEY (venda_id) 
REFERENCES vendas(id) 
ON DELETE CASCADE;

-- historico_vendas → vendas
ALTER TABLE historico_vendas 
DROP CONSTRAINT IF EXISTS historico_vendas_venda_id_fkey;

ALTER TABLE historico_vendas
ADD CONSTRAINT historico_vendas_venda_id_fkey 
FOREIGN KEY (venda_id) 
REFERENCES vendas(id) 
ON DELETE CASCADE;

-- trocas_produtos → vendas
ALTER TABLE trocas_produtos 
DROP CONSTRAINT IF EXISTS trocas_produtos_venda_id_fkey;

ALTER TABLE trocas_produtos
ADD CONSTRAINT trocas_produtos_venda_id_fkey 
FOREIGN KEY (venda_id) 
REFERENCES vendas(id) 
ON DELETE CASCADE;

-- creditos_cliente → vendas (venda_origem_id)
ALTER TABLE creditos_cliente 
DROP CONSTRAINT IF EXISTS creditos_cliente_venda_origem_id_fkey;

ALTER TABLE creditos_cliente
ADD CONSTRAINT creditos_cliente_venda_origem_id_fkey 
FOREIGN KEY (venda_origem_id) 
REFERENCES vendas(id) 
ON DELETE CASCADE;

-- creditos_cliente → devolucoes_venda
ALTER TABLE creditos_cliente 
DROP CONSTRAINT IF EXISTS creditos_cliente_devolucao_id_fkey;

ALTER TABLE creditos_cliente
ADD CONSTRAINT creditos_cliente_devolucao_id_fkey 
FOREIGN KEY (devolucao_id) 
REFERENCES devolucoes_venda(id) 
ON DELETE CASCADE;

-- Comentário de conclusão
COMMENT ON TABLE vendas IS 'Tabela de vendas com CASCADE DELETE configurado para permitir exclusão completa';
