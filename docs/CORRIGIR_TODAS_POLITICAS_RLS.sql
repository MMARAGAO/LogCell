-- ============================================================================
-- SCRIPT COMPLETO: CORRIGIR TODAS AS POLÍTICAS RLS PROBLEMÁTICAS
-- ============================================================================
-- Este script corrige políticas que usam auth.uid() (que retorna NULL)
-- e adiciona políticas permissivas para tabelas sem UPDATE/DELETE
-- ============================================================================

-- ============================================================================
-- PARTE 1: REMOVER POLÍTICAS RESTRITIVAS QUE USAM auth.uid()
-- ============================================================================

-- Manter apenas as políticas permissivas e remover as restritivas duplicadas
DROP POLICY IF EXISTS "Vendedores podem atualizar suas vendas" ON vendas;
DROP POLICY IF EXISTS "Vendedores podem deletar suas vendas" ON vendas;
DROP POLICY IF EXISTS "usuarios_update_own" ON usuarios;
DROP POLICY IF EXISTS "Usuarios podem atualizar apenas seus dados" ON usuarios;

-- Configurações de usuário - não funcionam porque auth.uid() retorna null
DROP POLICY IF EXISTS "configuracoes_usuario_update_v2" ON configuracoes_usuario;
DROP POLICY IF EXISTS "configuracoes_usuario_delete_v2" ON configuracoes_usuario;

-- Fotos de perfil
DROP POLICY IF EXISTS "fotos_perfil_update_v2" ON fotos_perfil;
DROP POLICY IF EXISTS "fotos_perfil_delete_v2" ON fotos_perfil;

-- Notificações - tem 2 políticas duplicadas
DROP POLICY IF EXISTS "Usuários podem atualizar suas próprias notificações" ON notificacoes_usuarios;
DROP POLICY IF EXISTS "Usuarios podem atualizar suas notificacoes" ON notificacoes_usuarios;
DROP POLICY IF EXISTS "Usuarios podem deletar suas notificacoes" ON notificacoes_usuarios;

-- Permissões
DROP POLICY IF EXISTS "permissoes_update_simple" ON permissoes;
DROP POLICY IF EXISTS "permissoes_delete_simple" ON permissoes;
DROP POLICY IF EXISTS "allow_update_permissoes_admin" ON permissoes;

-- Itens e pagamentos de venda
DROP POLICY IF EXISTS "Vendedores podem atualizar itens de suas vendas" ON itens_venda;
DROP POLICY IF EXISTS "Vendedores podem deletar itens de suas vendas" ON itens_venda;
DROP POLICY IF EXISTS "Usuários podem deletar pagamentos de suas vendas" ON pagamentos_venda;
DROP POLICY IF EXISTS "Usuários podem deletar descontos de suas vendas" ON descontos_venda;

-- Ordem de serviço
DROP POLICY IF EXISTS "ordem_servico_update_tecnico" ON ordem_servico;
DROP POLICY IF EXISTS "ordem_servico_delete_policy" ON ordem_servico;

-- Técnicos
DROP POLICY IF EXISTS "tecnicos_update_policy" ON tecnicos;
DROP POLICY IF EXISTS "tecnicos_delete_policy" ON tecnicos;

-- Fotos RMA e histórico
DROP POLICY IF EXISTS "Usuários podem deletar suas fotos de RMA" ON fotos_rma;
DROP POLICY IF EXISTS "Usuários podem deletar seus próprios registros" ON historico_estoque;

-- Quebra de peças
DROP POLICY IF EXISTS "Admins podem aprovar quebra" ON quebra_pecas;
DROP POLICY IF EXISTS "Admins podem deletar quebra" ON quebra_pecas;

-- Transferências (remover política restritiva)
DROP POLICY IF EXISTS "Usuários podem atualizar transferências" ON transferencias;
DROP POLICY IF EXISTS "Usuarios autenticados podem atualizar transferencias" ON transferencias;
DROP POLICY IF EXISTS "Usuarios autenticados podem deletar transferencias" ON transferencias;

-- ============================================================================
-- PARTE 2: CRIAR POLÍTICAS PERMISSIVAS PARA authenticated
-- ============================================================================

-- Configurações de usuário
CREATE POLICY "Usuarios autenticados podem atualizar configuracoes"
ON configuracoes_usuario FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Usuarios autenticados podem deletar configuracoes"
ON configuracoes_usuario FOR DELETE TO authenticated USING (true);

-- Fotos de perfil
CREATE POLICY "Usuarios autenticados podem atualizar fotos perfil"
ON fotos_perfil FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Usuarios autenticados podem deletar fotos perfil"
ON fotos_perfil FOR DELETE TO authenticated USING (true);

-- Notificações
CREATE POLICY "Usuarios autenticados podem atualizar notificacoes"
ON notificacoes_usuarios FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Usuarios autenticados podem deletar notificacoes"
ON notificacoes_usuarios FOR DELETE TO authenticated USING (true);

-- Permissões
CREATE POLICY "Usuarios autenticados podem atualizar permissoes"
ON permissoes FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Usuarios autenticados podem deletar permissoes"
ON permissoes FOR DELETE TO authenticated USING (true);

-- Itens de venda
CREATE POLICY "Usuarios autenticados podem atualizar itens venda"
ON itens_venda FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Usuarios autenticados podem deletar itens venda"
ON itens_venda FOR DELETE TO authenticated USING (true);

-- Descontos de venda
CREATE POLICY "Usuarios autenticados podem atualizar descontos venda"
ON descontos_venda FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Usuarios autenticados podem deletar descontos venda"
ON descontos_venda FOR DELETE TO authenticated USING (true);

-- Pagamentos de venda
CREATE POLICY "Usuarios autenticados podem atualizar pagamentos venda"
ON pagamentos_venda FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Usuarios autenticados podem deletar pagamentos venda"
ON pagamentos_venda FOR DELETE TO authenticated USING (true);

-- Ordem de serviço
CREATE POLICY "Usuarios autenticados podem atualizar ordem servico"
ON ordem_servico FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Usuarios autenticados podem deletar ordem servico"
ON ordem_servico FOR DELETE TO authenticated USING (true);

-- Técnicos
CREATE POLICY "Usuarios autenticados podem atualizar tecnicos"
ON tecnicos FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Usuarios autenticados podem deletar tecnicos"
ON tecnicos FOR DELETE TO authenticated USING (true);

-- Fotos RMA
CREATE POLICY "Usuarios autenticados podem atualizar fotos rma"
ON fotos_rma FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Usuarios autenticados podem deletar fotos rma"
ON fotos_rma FOR DELETE TO authenticated USING (true);

-- Histórico de estoque
CREATE POLICY "Usuarios autenticados podem atualizar historico estoque"
ON historico_estoque FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Usuarios autenticados podem deletar historico estoque"
ON historico_estoque FOR DELETE TO authenticated USING (true);

-- Quebra de peças
CREATE POLICY "Usuarios autenticados podem atualizar quebra pecas"
ON quebra_pecas FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Usuarios autenticados podem deletar quebra pecas"
ON quebra_pecas FOR DELETE TO authenticated USING (true);

-- Transferências
CREATE POLICY "Usuarios autenticados podem atualizar transferencias"
ON transferencias FOR UPDATE TO authenticated USING (true);

-- ============================================================================
-- PARTE 3: ADICIONAR POLÍTICAS PARA TABELAS SEM UPDATE/DELETE
-- ============================================================================

-- Alertas de estoque
CREATE POLICY "Usuarios autenticados podem atualizar alertas estoque"
ON alertas_estoque_controle FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Usuarios autenticados podem deletar alertas estoque"
ON alertas_estoque_controle FOR DELETE TO authenticated USING (true);

-- Caixas (faltava DELETE)
CREATE POLICY "Usuarios autenticados podem deletar caixas"
ON caixas FOR DELETE TO authenticated USING (true);

-- Créditos cliente (faltava DELETE)
CREATE POLICY "Usuarios autenticados podem deletar creditos cliente"
ON creditos_cliente FOR DELETE TO authenticated USING (true);

-- Devoluções de venda
CREATE POLICY "Usuarios autenticados podem atualizar devolucoes venda"
ON devolucoes_venda FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Usuarios autenticados podem deletar devolucoes venda"
ON devolucoes_venda FOR DELETE TO authenticated USING (true);

-- Fotos produtos (faltava UPDATE)
CREATE POLICY "Usuarios autenticados podem atualizar fotos produtos"
ON fotos_produtos FOR UPDATE TO authenticated USING (true);

-- Históricos diversos
CREATE POLICY "Usuarios autenticados podem atualizar historico fornecedores"
ON historico_fornecedores FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Usuarios autenticados podem deletar historico fornecedores"
ON historico_fornecedores FOR DELETE TO authenticated USING (true);

CREATE POLICY "Usuarios autenticados podem atualizar historico lojas"
ON historico_lojas FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Usuarios autenticados podem deletar historico lojas"
ON historico_lojas FOR DELETE TO authenticated USING (true);

CREATE POLICY "Usuarios autenticados podem atualizar historico ordem servico"
ON historico_ordem_servico FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Usuarios autenticados podem deletar historico ordem servico"
ON historico_ordem_servico FOR DELETE TO authenticated USING (true);

CREATE POLICY "Usuarios autenticados podem atualizar historico produtos"
ON historico_produtos FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Usuarios autenticados podem deletar historico produtos"
ON historico_produtos FOR DELETE TO authenticated USING (true);

CREATE POLICY "Usuarios autenticados podem atualizar historico rma"
ON historico_rma FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Usuarios autenticados podem deletar historico rma"
ON historico_rma FOR DELETE TO authenticated USING (true);

CREATE POLICY "Usuarios autenticados podem atualizar historico vendas"
ON historico_vendas FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Usuarios autenticados podem deletar historico vendas"
ON historico_vendas FOR DELETE TO authenticated USING (true);

-- Itens de devolução
CREATE POLICY "Usuarios autenticados podem atualizar itens devolucao"
ON itens_devolucao FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Usuarios autenticados podem deletar itens devolucao"
ON itens_devolucao FOR DELETE TO authenticated USING (true);

-- Notificações (tabela principal)
CREATE POLICY "Usuarios autenticados podem atualizar notificacoes"
ON notificacoes FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Usuarios autenticados podem deletar notificacoes"
ON notificacoes FOR DELETE TO authenticated USING (true);

-- Ordem de serviço anexos (faltava UPDATE)
CREATE POLICY "Usuarios autenticados podem atualizar ordem servico anexos"
ON ordem_servico_anexos FOR UPDATE TO authenticated USING (true);

-- Ordem de serviço caixa (faltava DELETE)
CREATE POLICY "Usuarios autenticados podem deletar ordem servico caixa"
ON ordem_servico_caixa FOR DELETE TO authenticated USING (true);

-- Ordem de serviço pagamentos (faltava UPDATE)
CREATE POLICY "Usuarios autenticados podem atualizar ordem servico pagamentos"
ON ordem_servico_pagamentos FOR UPDATE TO authenticated USING (true);

-- RMAs (faltava DELETE)
CREATE POLICY "Usuarios autenticados podem deletar rmas"
ON rmas FOR DELETE TO authenticated USING (true);

-- Sangrias caixa (faltava DELETE)
CREATE POLICY "Usuarios autenticados podem deletar sangrias caixa"
ON sangrias_caixa FOR DELETE TO authenticated USING (true);

-- Transferências DELETE (criada aqui pela primeira vez)
CREATE POLICY "Usuarios autenticados podem deletar transferencias"
ON transferencias FOR DELETE TO authenticated USING (true);

-- Transferências itens
CREATE POLICY "Usuarios autenticados podem atualizar transferencias itens"
ON transferencias_itens FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Usuarios autenticados podem deletar transferencias itens"
ON transferencias_itens FOR DELETE TO authenticated USING (true);

-- Trocas de produtos
CREATE POLICY "Usuarios autenticados podem atualizar trocas produtos"
ON trocas_produtos FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Usuarios autenticados podem deletar trocas produtos"
ON trocas_produtos FOR DELETE TO authenticated USING (true);

-- ============================================================================
-- PARTE 4: VERIFICAÇÃO FINAL
-- ============================================================================

-- Contar políticas por tabela
SELECT 
    tablename,
    COUNT(CASE WHEN cmd = 'SELECT' THEN 1 END) as select_policies,
    COUNT(CASE WHEN cmd = 'INSERT' THEN 1 END) as insert_policies,
    COUNT(CASE WHEN cmd = 'UPDATE' THEN 1 END) as update_policies,
    COUNT(CASE WHEN cmd = 'DELETE' THEN 1 END) as delete_policies,
    CASE 
        WHEN COUNT(CASE WHEN cmd = 'UPDATE' THEN 1 END) = 0 
          OR COUNT(CASE WHEN cmd = 'DELETE' THEN 1 END) = 0 
        THEN '⚠️ INCOMPLETO'
        ELSE '✅ COMPLETO'
    END as status
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY tablename
HAVING COUNT(CASE WHEN cmd = 'UPDATE' THEN 1 END) > 0 
    OR COUNT(CASE WHEN cmd = 'DELETE' THEN 1 END) > 0
ORDER BY tablename;

-- Verificar se ainda há políticas usando auth.uid()
SELECT 
    tablename,
    policyname,
    cmd,
    '⚠️ AINDA USA auth.uid()' as alerta
FROM pg_policies
WHERE schemaname = 'public'
  AND qual LIKE '%auth.uid()%'
  AND cmd IN ('UPDATE', 'DELETE')
ORDER BY tablename;

COMMENT ON DATABASE postgres IS '✅ Todas as políticas RLS foram atualizadas para permitir operações de usuários autenticados';
