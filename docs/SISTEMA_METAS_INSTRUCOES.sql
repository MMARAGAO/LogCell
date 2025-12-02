-- ============================================
-- SISTEMA DE METAS PARA DASHBOARD PESSOAL
-- ============================================
-- Execute este SQL no Supabase para habilitar o sistema de metas

-- 1. CRIAR TABELA metas_usuarios
-- Execute o arquivo: docs/ADD_METAS_USUARIOS.sql

-- 2. VERIFICAR SE A TABELA FOI CRIADA
SELECT * FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'metas_usuarios';

-- 3. INSERIR METAS PADRÃO PARA USUÁRIOS EXISTENTES (OPCIONAL)
-- Exemplo: Criar meta padrão de R$ 10.000,00 para todos os vendedores

INSERT INTO public.metas_usuarios (usuario_id, meta_mensal_vendas, meta_mensal_os, dias_uteis_mes)
SELECT 
  u.id,
  10000 as meta_mensal_vendas,
  0 as meta_mensal_os,
  26 as dias_uteis_mes
FROM public.usuarios u
WHERE u.ativo = true
AND NOT EXISTS (
  SELECT 1 FROM public.metas_usuarios m 
  WHERE m.usuario_id = u.id
);

-- 4. CONSULTAR METAS CADASTRADAS
SELECT 
  m.id,
  u.nome,
  u.email,
  m.meta_mensal_vendas,
  m.meta_mensal_os,
  m.dias_uteis_mes,
  m.criado_em,
  m.atualizado_em
FROM public.metas_usuarios m
JOIN public.usuarios u ON u.id = m.usuario_id
WHERE m.ativo = true
ORDER BY u.nome;

-- 5. ATUALIZAR META DE UM USUÁRIO ESPECÍFICO
-- Exemplo: Definir meta de R$ 15.000,00 para um usuário

-- UPDATE public.metas_usuarios
-- SET 
--   meta_mensal_vendas = 15000,
--   dias_uteis_mes = 26,
--   atualizado_em = now()
-- WHERE usuario_id = 'ID_DO_USUARIO';

-- 6. VERIFICAR POLÍTICAS RLS
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE tablename = 'metas_usuarios'
ORDER BY policyname;

-- ============================================
-- COMO USAR NO SISTEMA
-- ============================================

-- 1. Acesse: /sistema/permissoes
-- 2. Clique em "Editar" em um usuário
-- 3. No modal, role até a seção "Metas de Desempenho"
-- 4. Configure:
--    - Meta Mensal de Vendas (R$)
--    - Meta Mensal de OS (para técnicos)
--    - Dias Úteis do Mês (padrão: 26)
-- 5. Salve as alterações

-- O usuário verá suas metas personalizadas no Dashboard Pessoal
-- Acesse: /sistema/dashboard-pessoal

-- ============================================
-- PERMISSÕES ADICIONADAS
-- ============================================

-- As seguintes permissões foram adicionadas ao sistema:
-- - dashboard_pessoal.visualizar
-- - dashboard_pessoal.definir_metas
-- - dashboard_pessoal.visualizar_metas_outros

-- Perfis que possuem essas permissões por padrão:
-- - Admin: Todas as permissões
-- - Gerente: Todas as permissões de dashboard pessoal
-- - Vendedor: dashboard_pessoal.visualizar
-- - Técnico: dashboard_pessoal.visualizar
