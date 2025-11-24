-- SOLUÇÃO TEMPORÁRIA: Desabilitar a trigger problemática
-- Isso permitirá que as vendas funcionem, mas o estoque não será atualizado automaticamente

ALTER TABLE itens_venda DISABLE TRIGGER trigger_atualizar_estoque_venda;

-- Para reabilitar depois (NÃO EXECUTAR AGORA):
-- ALTER TABLE itens_venda ENABLE TRIGGER trigger_atualizar_estoque_venda;
