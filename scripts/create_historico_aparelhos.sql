-- Tabela de histórico/auditoria para aparelhos
CREATE TABLE IF NOT EXISTS historico_aparelhos (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  aparelho_id uuid NOT NULL REFERENCES aparelhos(id) ON DELETE CASCADE,
  tipo_acao text NOT NULL,
  descricao text NOT NULL,
  dados_antes jsonb,
  dados_depois jsonb,
  usuario_id uuid,
  criado_em timestamptz DEFAULT now()
);

-- Índice para consultas rápidas por aparelho
CREATE INDEX IF NOT EXISTS idx_historico_aparelhos_aparelho_id ON historico_aparelhos(aparelho_id);
CREATE INDEX IF NOT EXISTS idx_historico_aparelhos_criado_em ON historico_aparelhos(criado_em);
