-- Script para desabilitar a trigger de baixa automática de estoque em vendas
-- Motivo: Agora o controle de estoque é feito em tempo real no modal (UX melhorada)
-- O estoque é baixado à medida que o usuário adiciona itens ao carrinho

-- Desabilitar a trigger que baixa estoque automaticamente ao inserir item na venda
DROP TRIGGER IF EXISTS trigger_baixa_estoque_ao_adicionar_item ON itens_venda;

-- Desabilitar a função (opcional, mantém como backup)
-- DROP FUNCTION IF EXISTS baixa_estoque_ao_adicionar_item();

-- IMPORTANTE: Com essa mudança, o estoque é controlado pelo frontend:
-- 1. Ao adicionar item ao carrinho → baixa estoque imediatamente
-- 2. Ao remover item do carrinho → devolve estoque imediatamente  
-- 3. Ao alterar quantidade → ajusta estoque pela diferença
-- 4. Ao fechar modal sem salvar → reverte todas as alterações
-- 5. Ao confirmar venda → mantém as alterações (já foram aplicadas)

COMMENT ON TABLE itens_venda IS 'Itens das vendas. ATENÇÃO: Estoque controlado manualmente pelo frontend, não há trigger automática.';
