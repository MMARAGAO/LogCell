-- RESETAR estado do controle de alertas para testar notificações
-- Isso vai fazer o sistema pensar que o estoque estava normal e agora zerou

DELETE FROM alertas_estoque_controle
WHERE produto_id = 'e138eed1-e316-4d2a-990e-7f1ebdee06c7'; -- Bateria iphone 17

-- Agora, ao fazer qualquer alteração no estoque (adicionar 1 e remover 1), 
-- o sistema vai criar notificação porque detectará mudança de estado

SELECT 'Estado resetado! Próxima alteração de estoque vai disparar notificação.' as status;
