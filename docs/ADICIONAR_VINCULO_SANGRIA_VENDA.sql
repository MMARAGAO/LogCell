-- Script para vincular sangrias de reembolso às vendas e excluir automaticamente
-- Data: 25/11/2025
-- Motivo: Quando uma venda for excluída, as sangrias de reembolso relacionadas devem ser excluídas automaticamente

-- 1. Adicionar coluna venda_id na tabela sangrias_caixa
ALTER TABLE sangrias_caixa 
ADD COLUMN IF NOT EXISTS venda_id uuid REFERENCES vendas(id) ON DELETE CASCADE;

-- 2. Criar índice para melhorar performance
CREATE INDEX IF NOT EXISTS idx_sangrias_caixa_venda_id ON sangrias_caixa(venda_id);

-- 3. Comentário
COMMENT ON COLUMN sangrias_caixa.venda_id IS 
'ID da venda relacionada ao reembolso (quando aplicável). Sangria será excluída automaticamente se a venda for excluída.';

-- Nota: Com ON DELETE CASCADE, quando uma venda for excluída, 
-- todas as sangrias vinculadas a ela serão automaticamente excluídas
