-- Adicionar colunas de loja na tabela permissoes
-- Executa no SQL Editor do Supabase

-- Adicionar coluna loja_id (referência para a loja específica)
ALTER TABLE public.permissoes
ADD COLUMN IF NOT EXISTS loja_id INTEGER REFERENCES public.lojas(id) ON DELETE SET NULL;

-- Adicionar coluna todas_lojas (flag para indicar acesso a todas as lojas)
ALTER TABLE public.permissoes
ADD COLUMN IF NOT EXISTS todas_lojas BOOLEAN DEFAULT false;

-- Criar índice para melhorar performance nas consultas por loja
CREATE INDEX IF NOT EXISTS idx_permissoes_loja_id ON public.permissoes(loja_id);
CREATE INDEX IF NOT EXISTS idx_permissoes_todas_lojas ON public.permissoes(todas_lojas);

-- Comentários para documentação
COMMENT ON COLUMN public.permissoes.loja_id IS 'ID da loja específica que o usuário tem acesso. NULL se todas_lojas = true ou se não configurado';
COMMENT ON COLUMN public.permissoes.todas_lojas IS 'Se true, o usuário tem acesso a todas as lojas do sistema';

-- Atualizar usuários existentes para terem acesso a todas as lojas por padrão
UPDATE public.permissoes
SET todas_lojas = true
WHERE loja_id IS NULL AND todas_lojas = false;

-- Adicionar constraint para garantir que não tenha loja_id E todas_lojas ao mesmo tempo
-- Permite: (loja_id, todas_lojas=false), (NULL, todas_lojas=true), (NULL, todas_lojas=false)
ALTER TABLE public.permissoes
ADD CONSTRAINT check_loja_ou_todas CHECK (
  NOT (loja_id IS NOT NULL AND todas_lojas = true)
);
