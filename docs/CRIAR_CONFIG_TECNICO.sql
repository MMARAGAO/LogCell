-- =====================================================
-- CRIAR CONFIGURAÇÕES PADRÃO PARA TÉCNICO
-- =====================================================

-- Inserir configuração padrão para o técnico
-- Substitua o UUID pelo auth.uid do seu técnico
INSERT INTO configuracoes_usuario (
  usuario_id,
  notificacoes_email,
  notificacoes_push,
  notificacoes_estoque,
  modo_escuro,
  tema,
  idioma,
  formato_data,
  autenticacao_2fa,
  sessao_ativa
)
VALUES (
  '59e37174-339c-4abe-9280-c4fb6a9d3962',  -- auth.uid do técnico
  true,   -- notificacoes_email
  true,   -- notificacoes_push
  true,   -- notificacoes_estoque
  false,  -- modo_escuro
  'default',  -- tema
  'pt-BR',    -- idioma
  'DD/MM/YYYY',  -- formato_data
  false,  -- autenticacao_2fa
  true    -- sessao_ativa
)
ON CONFLICT (usuario_id) DO NOTHING;

-- Verificar se foi criado
SELECT * FROM configuracoes_usuario 
WHERE usuario_id = '59e37174-339c-4abe-9280-c4fb6a9d3962';
