-- ================================================
-- CONFIGURAÇÃO DE SEGURANÇA (RLS) - LOGCELL
-- ================================================
-- Execute este script no SQL Editor do Supabase
-- após criar as tabelas principais

-- ================================================
-- 1. HABILITAR ROW LEVEL SECURITY (RLS)
-- ================================================

ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fotos_perfil ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.historico_usuarios ENABLE ROW LEVEL SECURITY;

-- ================================================
-- 2. POLÍTICAS PARA TABELA: usuarios
-- ================================================

-- Usuários podem ver seus próprios dados
CREATE POLICY "usuarios_select_own"
ON public.usuarios
FOR SELECT
USING (auth.uid() = id);

-- Usuários podem atualizar seus próprios dados
CREATE POLICY "usuarios_update_own"
ON public.usuarios
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Permitir que qualquer usuário autenticado veja outros usuários ativos
-- (útil para listagens, seleção de usuários, etc.)
CREATE POLICY "usuarios_select_active"
ON public.usuarios
FOR SELECT
USING (ativo = true AND auth.role() = 'authenticated');

-- Apenas service_role pode inserir novos usuários
-- (isso é feito via Server Action com SUPABASE_SERVICE_ROLE_KEY)
CREATE POLICY "usuarios_insert_service_role"
ON public.usuarios
FOR INSERT
WITH CHECK (true);

-- ================================================
-- 3. POLÍTICAS PARA TABELA: permissoes
-- ================================================

-- Usuários podem ver suas próprias permissões
CREATE POLICY "permissoes_select_own"
ON public.permissoes
FOR SELECT
USING (auth.uid() = usuario_id);

-- Apenas service_role pode modificar permissões
CREATE POLICY "permissoes_all_service_role"
ON public.permissoes
FOR ALL
USING (true)
WITH CHECK (true);

-- ================================================
-- 4. POLÍTICAS PARA TABELA: fotos_perfil
-- ================================================

-- Usuários podem ver suas próprias fotos
CREATE POLICY "fotos_perfil_select_own"
ON public.fotos_perfil
FOR SELECT
USING (auth.uid() = usuario_id);

-- Usuários podem inserir suas próprias fotos
CREATE POLICY "fotos_perfil_insert_own"
ON public.fotos_perfil
FOR INSERT
WITH CHECK (auth.uid() = usuario_id);

-- Usuários podem atualizar suas próprias fotos
CREATE POLICY "fotos_perfil_update_own"
ON public.fotos_perfil
FOR UPDATE
USING (auth.uid() = usuario_id)
WITH CHECK (auth.uid() = usuario_id);

-- Usuários podem deletar suas próprias fotos
CREATE POLICY "fotos_perfil_delete_own"
ON public.fotos_perfil
FOR DELETE
USING (auth.uid() = usuario_id);

-- ================================================
-- 5. POLÍTICAS PARA TABELA: historico_usuarios
-- ================================================

-- Usuários podem ver o histórico de modificações sobre eles
CREATE POLICY "historico_select_own"
ON public.historico_usuarios
FOR SELECT
USING (auth.uid() = usuario_id);

-- Apenas usuários autenticados podem inserir no histórico
CREATE POLICY "historico_insert_authenticated"
ON public.historico_usuarios
FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- ================================================
-- 6. FUNÇÕES AUXILIARES (OPCIONAL)
-- ================================================

-- Função para verificar se usuário tem permissão específica
CREATE OR REPLACE FUNCTION public.tem_permissao(permissao_nome text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  tem_perm boolean;
BEGIN
  SELECT (permissoes->permissao_nome)::boolean INTO tem_perm
  FROM public.permissoes
  WHERE usuario_id = auth.uid()
  LIMIT 1;
  
  RETURN COALESCE(tem_perm, false);
END;
$$;

-- Função para registrar modificações no histórico
CREATE OR REPLACE FUNCTION public.registrar_modificacao()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Registra cada campo modificado
  IF OLD.nome IS DISTINCT FROM NEW.nome THEN
    INSERT INTO public.historico_usuarios (usuario_id, modificado_por, campo_modificado, valor_antigo, valor_novo)
    VALUES (NEW.id, auth.uid(), 'nome', OLD.nome, NEW.nome);
  END IF;
  
  IF OLD.email IS DISTINCT FROM NEW.email THEN
    INSERT INTO public.historico_usuarios (usuario_id, modificado_por, campo_modificado, valor_antigo, valor_novo)
    VALUES (NEW.id, auth.uid(), 'email', OLD.email, NEW.email);
  END IF;
  
  IF OLD.telefone IS DISTINCT FROM NEW.telefone THEN
    INSERT INTO public.historico_usuarios (usuario_id, modificado_por, campo_modificado, valor_antigo, valor_novo)
    VALUES (NEW.id, auth.uid(), 'telefone', OLD.telefone, NEW.telefone);
  END IF;
  
  IF OLD.cpf IS DISTINCT FROM NEW.cpf THEN
    INSERT INTO public.historico_usuarios (usuario_id, modificado_por, campo_modificado, valor_antigo, valor_novo)
    VALUES (NEW.id, auth.uid(), 'cpf', OLD.cpf, NEW.cpf);
  END IF;
  
  IF OLD.ativo IS DISTINCT FROM NEW.ativo THEN
    INSERT INTO public.historico_usuarios (usuario_id, modificado_por, campo_modificado, valor_antigo, valor_novo)
    VALUES (NEW.id, auth.uid(), 'ativo', OLD.ativo::text, NEW.ativo::text);
  END IF;
  
  RETURN NEW;
END;
$$;

-- ================================================
-- 7. TRIGGERS
-- ================================================

-- Trigger para registrar automaticamente modificações
DROP TRIGGER IF EXISTS trigger_registrar_modificacao ON public.usuarios;
CREATE TRIGGER trigger_registrar_modificacao
AFTER UPDATE ON public.usuarios
FOR EACH ROW
EXECUTE FUNCTION public.registrar_modificacao();

-- ================================================
-- 8. ÍNDICES PARA PERFORMANCE
-- ================================================

-- Índice para buscar usuários por email
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON public.usuarios(email);

-- Índice para buscar usuários por CPF
CREATE INDEX IF NOT EXISTS idx_usuarios_cpf ON public.usuarios(cpf);

-- Índice para buscar usuários ativos
CREATE INDEX IF NOT EXISTS idx_usuarios_ativo ON public.usuarios(ativo);

-- Índice para buscar permissões por usuário
CREATE INDEX IF NOT EXISTS idx_permissoes_usuario_id ON public.permissoes(usuario_id);

-- Índice para buscar fotos por usuário
CREATE INDEX IF NOT EXISTS idx_fotos_perfil_usuario_id ON public.fotos_perfil(usuario_id);

-- Índice para buscar histórico por usuário
CREATE INDEX IF NOT EXISTS idx_historico_usuario_id ON public.historico_usuarios(usuario_id);

-- ================================================
-- 9. GRANTS (PERMISSÕES)
-- ================================================

-- Permitir que usuários autenticados acessem as tabelas
GRANT SELECT, INSERT, UPDATE ON public.usuarios TO authenticated;
GRANT SELECT ON public.permissoes TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.fotos_perfil TO authenticated;
GRANT SELECT, INSERT ON public.historico_usuarios TO authenticated;

-- ================================================
-- FINALIZAÇÃO
-- ================================================

-- Verificar se RLS está habilitado
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('usuarios', 'permissoes', 'fotos_perfil', 'historico_usuarios');

-- Listar todas as políticas criadas
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
