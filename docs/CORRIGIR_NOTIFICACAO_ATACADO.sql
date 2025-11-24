-- Verificar status da trigger de alertas
SELECT 
    t.tgname as trigger_name,
    t.tgenabled as enabled,
    CASE t.tgenabled
        WHEN 'O' THEN 'Enabled'
        WHEN 'D' THEN 'Disabled'
        WHEN 'R' THEN 'Replica'
        WHEN 'A' THEN 'Always'
    END as status_description,
    pg_get_triggerdef(t.oid) as definition
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
WHERE c.relname = 'estoque_lojas'
  AND t.tgname = 'trigger_alerta_estoque';

-- Forçar atualização manual do controle do ATACADO
UPDATE alertas_estoque_controle
SET estado = 'zerado',
    quantidade_atual = 0,
    ultimo_alerta_em = NOW(),
    atualizado_em = NOW()
WHERE produto_id = 'e138eed1-e316-4d2a-990e-7f1ebdee06c7'
  AND loja_id = 16; -- ATACADO

-- Criar notificação manualmente para ATACADO
INSERT INTO notificacoes (
    tipo,
    titulo,
    mensagem,
    produto_id,
    loja_id,
    dados_extras
) VALUES (
    'estoque_zerado',
    'Estoque Zerado',
    'O produto "Bateria iphone 17" esta sem estoque na loja "ATACADO"!',
    'e138eed1-e316-4d2a-990e-7f1ebdee06c7',
    16,
    jsonb_build_object(
        'quantidade', 0,
        'quantidade_minima', 5,
        'estado', 'zerado'
    )
);

-- Criar registros para todos os usuários ativos
INSERT INTO notificacoes_usuarios (notificacao_id, usuario_id)
SELECT CURRVAL('notificacoes_id_seq'), id
FROM usuarios
WHERE ativo = true;

SELECT 'Notificação criada manualmente para ATACADO!' as resultado;
