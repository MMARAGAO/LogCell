-- CRIAR TABELA PARA METAS DE USUÁRIOS

-- Tabela para armazenar metas individuais de cada usuário
CREATE TABLE IF NOT EXISTS public.metas_usuarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id uuid NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
  loja_id integer REFERENCES public.lojas(id),
  
  -- Metas mensais
  meta_mensal_vendas numeric DEFAULT 10000,
  meta_mensal_os integer DEFAULT 0, -- Para técnicos
  
  -- Configurações
  dias_uteis_mes integer DEFAULT 26,
  ativo boolean DEFAULT true,
  
  -- Auditoria
  criado_em timestamp with time zone DEFAULT now(),
  atualizado_em timestamp with time zone DEFAULT now(),
  criado_por uuid REFERENCES public.usuarios(id),
  atualizado_por uuid REFERENCES public.usuarios(id),
  
  -- Garantir que cada usuário tenha apenas uma meta ativa por loja
  CONSTRAINT metas_usuarios_unico UNIQUE(usuario_id, loja_id)
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_metas_usuarios_usuario ON public.metas_usuarios(usuario_id);
CREATE INDEX IF NOT EXISTS idx_metas_usuarios_loja ON public.metas_usuarios(loja_id);
CREATE INDEX IF NOT EXISTS idx_metas_usuarios_ativo ON public.metas_usuarios(ativo);

-- Comentários na tabela
COMMENT ON TABLE public.metas_usuarios IS 'Armazena metas individuais de vendas e OS para cada usuário';
COMMENT ON COLUMN public.metas_usuarios.meta_mensal_vendas IS 'Meta mensal de vendas em reais';
COMMENT ON COLUMN public.metas_usuarios.meta_mensal_os IS 'Meta mensal de ordens de serviço concluídas (para técnicos)';
COMMENT ON COLUMN public.metas_usuarios.dias_uteis_mes IS 'Quantidade de dias úteis no mês para cálculo da meta diária';

-- Trigger para atualizar atualizado_em
CREATE OR REPLACE FUNCTION atualizar_metas_usuarios_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_atualizar_metas_usuarios_timestamp
  BEFORE UPDATE ON public.metas_usuarios
  FOR EACH ROW
  EXECUTE FUNCTION atualizar_metas_usuarios_timestamp();

-- RLS (Row Level Security)
ALTER TABLE public.metas_usuarios ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança

-- Admins podem ver tudo
CREATE POLICY "Admins podem ver todas as metas"
  ON public.metas_usuarios
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.usuarios u
      WHERE u.id = auth.uid()
      AND u.ativo = true
      AND (
        u.email = 'admin@logcell.com'
        OR EXISTS (
          SELECT 1 FROM public.permissoes p
          WHERE p.usuario_id = u.id
          AND p.permissoes->>'usuarios.gerenciar' = 'true'
        )
      )
    )
  );

-- Usuários podem ver suas próprias metas
CREATE POLICY "Usuarios podem ver suas proprias metas"
  ON public.metas_usuarios
  FOR SELECT
  TO authenticated
  USING (usuario_id = auth.uid());

-- Admins podem inserir metas
CREATE POLICY "Admins podem inserir metas"
  ON public.metas_usuarios
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.usuarios u
      WHERE u.id = auth.uid()
      AND u.ativo = true
      AND (
        u.email = 'admin@logcell.com'
        OR EXISTS (
          SELECT 1 FROM public.permissoes p
          WHERE p.usuario_id = u.id
          AND p.permissoes->>'usuarios.gerenciar' = 'true'
        )
      )
    )
  );

-- Admins podem atualizar metas
CREATE POLICY "Admins podem atualizar metas"
  ON public.metas_usuarios
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.usuarios u
      WHERE u.id = auth.uid()
      AND u.ativo = true
      AND (
        u.email = 'admin@logcell.com'
        OR EXISTS (
          SELECT 1 FROM public.permissoes p
          WHERE p.usuario_id = u.id
          AND p.permissoes->>'usuarios.gerenciar' = 'true'
        )
      )
    )
  );

-- Admins podem deletar metas
CREATE POLICY "Admins podem deletar metas"
  ON public.metas_usuarios
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.usuarios u
      WHERE u.id = auth.uid()
      AND u.ativo = true
      AND (
        u.email = 'admin@logcell.com'
        OR EXISTS (
          SELECT 1 FROM public.permissoes p
          WHERE p.usuario_id = u.id
          AND p.permissoes->>'usuarios.gerenciar' = 'true'
        )
      )
    )
  );
