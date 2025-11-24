-- Criar tabela de configurações do usuário
CREATE TABLE IF NOT EXISTS public.configuracoes_usuario (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Notificações
  notificacoes_email BOOLEAN DEFAULT true,
  notificacoes_push BOOLEAN DEFAULT true,
  notificacoes_estoque BOOLEAN DEFAULT true,
  
  -- Aparência
  modo_escuro BOOLEAN DEFAULT false,
  tema VARCHAR(50) DEFAULT 'default',
  
  -- Localização
  idioma VARCHAR(10) DEFAULT 'pt-BR',
  formato_data VARCHAR(20) DEFAULT 'DD/MM/YYYY',
  
  -- Segurança
  autenticacao_2fa BOOLEAN DEFAULT false,
  sessao_ativa BOOLEAN DEFAULT true,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  
  -- Constraint para garantir apenas uma configuração por usuário
  UNIQUE(usuario_id)
);

-- Criar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_configuracoes_usuario_id ON public.configuracoes_usuario(usuario_id);

-- Habilitar RLS
ALTER TABLE public.configuracoes_usuario ENABLE ROW LEVEL SECURITY;

-- Política: Usuários podem ver apenas suas próprias configurações
CREATE POLICY "Usuarios podem ver suas configuracoes"
  ON public.configuracoes_usuario
  FOR SELECT
  USING (auth.uid() = usuario_id);

-- Política: Usuários podem inserir suas próprias configurações
CREATE POLICY "Usuarios podem inserir suas configuracoes"
  ON public.configuracoes_usuario
  FOR INSERT
  WITH CHECK (auth.uid() = usuario_id);

-- Política: Usuários podem atualizar suas próprias configurações
CREATE POLICY "Usuarios podem atualizar suas configuracoes"
  ON public.configuracoes_usuario
  FOR UPDATE
  USING (auth.uid() = usuario_id)
  WITH CHECK (auth.uid() = usuario_id);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at
CREATE TRIGGER update_configuracoes_usuario_updated_at
  BEFORE UPDATE ON public.configuracoes_usuario
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comentários na tabela
COMMENT ON TABLE public.configuracoes_usuario IS 'Armazena as configurações personalizadas de cada usuário';
COMMENT ON COLUMN public.configuracoes_usuario.notificacoes_email IS 'Se o usuário deseja receber notificações por email';
COMMENT ON COLUMN public.configuracoes_usuario.modo_escuro IS 'Se o modo escuro está ativado';
COMMENT ON COLUMN public.configuracoes_usuario.tema IS 'Tema de cores escolhido pelo usuário';
COMMENT ON COLUMN public.configuracoes_usuario.idioma IS 'Idioma preferido do usuário';
