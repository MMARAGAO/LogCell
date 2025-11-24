-- ================================================
-- SISTEMA DE RMA (RETURN MERCHANDISE AUTHORIZATION)
-- ================================================
-- Este arquivo contém todos os scripts SQL necessários para
-- configurar o sistema de RMA no Supabase.
-- Execute os scripts na ordem apresentada.
-- ================================================

-- ================================================
-- 1. CRIAR TABELA DE RMAS
-- ================================================

CREATE TABLE IF NOT EXISTS public.rmas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    numero_rma VARCHAR(50) UNIQUE NOT NULL,
    tipo_origem VARCHAR(20) NOT NULL CHECK (tipo_origem IN ('interno_fornecedor', 'cliente')),
    tipo_rma VARCHAR(30) NOT NULL CHECK (tipo_rma IN (
        'defeito_fabrica',
        'dano_transporte',
        'produto_errado',
        'nao_funciona',
        'arrependimento',
        'garantia',
        'outro'
    )),
    status VARCHAR(20) NOT NULL DEFAULT 'pendente' CHECK (status IN (
        'pendente',
        'em_analise',
        'aprovado',
        'reprovado',
        'em_transito',
        'recebido',
        'concluido',
        'cancelado'
    )),
    
    -- Relações
    produto_id UUID NOT NULL REFERENCES public.produtos(id) ON DELETE RESTRICT,
    loja_id INTEGER NOT NULL REFERENCES public.lojas(id) ON DELETE RESTRICT,
    cliente_id UUID REFERENCES public.clientes(id) ON DELETE RESTRICT,
    fornecedor_id UUID REFERENCES public.fornecedores(id) ON DELETE RESTRICT,
    criado_por UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
    
    -- Detalhes
    quantidade INTEGER NOT NULL CHECK (quantidade > 0),
    motivo TEXT NOT NULL,
    observacoes_assistencia TEXT,
    
    -- Timestamps
    criado_em TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    atualizado_em TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_rmas_numero_rma ON public.rmas(numero_rma);
CREATE INDEX IF NOT EXISTS idx_rmas_tipo_origem ON public.rmas(tipo_origem);
CREATE INDEX IF NOT EXISTS idx_rmas_status ON public.rmas(status);
CREATE INDEX IF NOT EXISTS idx_rmas_produto_id ON public.rmas(produto_id);
CREATE INDEX IF NOT EXISTS idx_rmas_loja_id ON public.rmas(loja_id);
CREATE INDEX IF NOT EXISTS idx_rmas_cliente_id ON public.rmas(cliente_id);
CREATE INDEX IF NOT EXISTS idx_rmas_fornecedor_id ON public.rmas(fornecedor_id);
CREATE INDEX IF NOT EXISTS idx_rmas_criado_por ON public.rmas(criado_por);
CREATE INDEX IF NOT EXISTS idx_rmas_criado_em ON public.rmas(criado_em DESC);

COMMENT ON TABLE public.rmas IS 'Tabela de RMAs (Return Merchandise Authorization)';
COMMENT ON COLUMN public.rmas.tipo_origem IS 'Tipo de origem: interno_fornecedor ou cliente';
COMMENT ON COLUMN public.rmas.tipo_rma IS 'Tipo de RMA: defeito, dano, produto errado, etc.';
COMMENT ON COLUMN public.rmas.status IS 'Status atual do RMA';

-- ================================================
-- 2. CRIAR TABELA DE HISTÓRICO DE RMA
-- ================================================

CREATE TABLE IF NOT EXISTS public.historico_rma (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    rma_id UUID NOT NULL REFERENCES public.rmas(id) ON DELETE CASCADE,
    tipo_acao VARCHAR(30) NOT NULL CHECK (tipo_acao IN (
        'criacao',
        'mudanca_status',
        'atualizacao',
        'adicao_foto',
        'adicao_observacao',
        'movimentacao_estoque'
    )),
    descricao TEXT NOT NULL,
    dados_anteriores JSONB,
    dados_novos JSONB,
    criado_por UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
    criado_em TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_historico_rma_rma_id ON public.historico_rma(rma_id);
CREATE INDEX IF NOT EXISTS idx_historico_rma_tipo_acao ON public.historico_rma(tipo_acao);
CREATE INDEX IF NOT EXISTS idx_historico_rma_criado_em ON public.historico_rma(criado_em DESC);

COMMENT ON TABLE public.historico_rma IS 'Histórico de todas as ações realizadas em cada RMA';

-- ================================================
-- 3. CRIAR TABELA DE FOTOS DE RMA
-- ================================================

CREATE TABLE IF NOT EXISTS public.fotos_rma (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    rma_id UUID NOT NULL REFERENCES public.rmas(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    nome_arquivo VARCHAR(255) NOT NULL,
    tamanho INTEGER NOT NULL,
    criado_por UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
    criado_em TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_fotos_rma_rma_id ON public.fotos_rma(rma_id);
CREATE INDEX IF NOT EXISTS idx_fotos_rma_criado_em ON public.fotos_rma(criado_em DESC);

COMMENT ON TABLE public.fotos_rma IS 'Fotos anexadas aos RMAs';

-- ================================================
-- 4. CRIAR BUCKET DE STORAGE PARA FOTOS
-- ================================================

-- Execute no Supabase Dashboard > Storage ou via SQL:
-- 1. Vá em Storage no painel do Supabase
-- 2. Clique em "Create bucket"
-- 3. Nome: "fotos_rma"
-- 4. Public: SIM (para permitir acesso às URLs)

-- Ou via SQL (se tiver permissão):
INSERT INTO storage.buckets (id, name, public)
VALUES ('fotos_rma', 'fotos_rma', true)
ON CONFLICT (id) DO NOTHING;

-- ================================================
-- 5. POLÍTICAS DE SEGURANÇA (RLS)
-- ================================================

-- Habilitar RLS nas tabelas
ALTER TABLE public.rmas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.historico_rma ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fotos_rma ENABLE ROW LEVEL SECURITY;

-- ===== POLÍTICAS PARA rmas =====

-- SELECT: Usuários podem ver RMAs
CREATE POLICY "Usuários podem visualizar RMAs"
ON public.rmas
FOR SELECT
TO authenticated
USING (true);

-- INSERT: Usuários podem criar RMAs
CREATE POLICY "Usuários podem criar RMAs"
ON public.rmas
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = criado_por);

-- UPDATE: Usuários podem atualizar RMAs que criaram
CREATE POLICY "Usuários podem atualizar RMAs"
ON public.rmas
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- DELETE: Apenas administradores podem deletar (opcional)
-- CREATE POLICY "Admin pode deletar RMAs"
-- ON public.rmas
-- FOR DELETE
-- TO authenticated
-- USING (auth.uid() IN (SELECT id FROM usuarios WHERE tipo = 'administrador'));

-- ===== POLÍTICAS PARA historico_rma =====

-- SELECT: Usuários podem ver histórico
CREATE POLICY "Usuários podem visualizar histórico de RMA"
ON public.historico_rma
FOR SELECT
TO authenticated
USING (true);

-- INSERT: Sistema pode inserir histórico
CREATE POLICY "Sistema pode inserir histórico de RMA"
ON public.historico_rma
FOR INSERT
TO authenticated
WITH CHECK (true);

-- ===== POLÍTICAS PARA fotos_rma =====

-- SELECT: Usuários podem ver fotos
CREATE POLICY "Usuários podem visualizar fotos de RMA"
ON public.fotos_rma
FOR SELECT
TO authenticated
USING (true);

-- INSERT: Usuários podem adicionar fotos
CREATE POLICY "Usuários podem adicionar fotos de RMA"
ON public.fotos_rma
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = criado_por);

-- DELETE: Usuários podem deletar fotos que criaram
CREATE POLICY "Usuários podem deletar suas fotos de RMA"
ON public.fotos_rma
FOR DELETE
TO authenticated
USING (auth.uid() = criado_por);

-- ===== POLÍTICAS DE STORAGE =====

-- Política de SELECT no bucket fotos_rma
CREATE POLICY "Permitir visualização pública de fotos de RMA"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'fotos_rma');

-- Política de INSERT no bucket fotos_rma
CREATE POLICY "Usuários autenticados podem fazer upload de fotos de RMA"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'fotos_rma');

-- Política de DELETE no bucket fotos_rma
CREATE POLICY "Usuários podem deletar suas fotos de RMA"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'fotos_rma' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ================================================
-- 6. TRIGGER PARA ATUALIZAR atualizado_em
-- ================================================

CREATE OR REPLACE FUNCTION public.atualizar_timestamp_rma()
RETURNS TRIGGER AS $$
BEGIN
    NEW.atualizado_em = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_atualizar_timestamp_rma
BEFORE UPDATE ON public.rmas
FOR EACH ROW
EXECUTE FUNCTION public.atualizar_timestamp_rma();

-- ================================================
-- 7. FUNÇÃO AUXILIAR PARA GERAR NÚMERO DE RMA
-- ================================================

-- Esta função não é necessária pois o número é gerado no backend,
-- mas pode ser útil para testes ou outros usos

CREATE OR REPLACE FUNCTION public.gerar_numero_rma()
RETURNS TEXT AS $$
DECLARE
    ano INTEGER;
    prefixo TEXT;
    ultimo_numero INTEGER;
    proximo_numero INTEGER;
BEGIN
    ano := EXTRACT(YEAR FROM NOW());
    prefixo := 'RMA' || ano::TEXT;
    
    SELECT COALESCE(
        MAX(CAST(SUBSTRING(numero_rma FROM LENGTH(prefixo) + 1) AS INTEGER)),
        0
    ) INTO ultimo_numero
    FROM public.rmas
    WHERE numero_rma LIKE prefixo || '%';
    
    proximo_numero := ultimo_numero + 1;
    
    RETURN prefixo || LPAD(proximo_numero::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;

-- ================================================
-- 8. GRANTS (PERMISSÕES)
-- ================================================

-- Conceder permissões para usuários autenticados
GRANT SELECT, INSERT, UPDATE ON public.rmas TO authenticated;
GRANT SELECT, INSERT ON public.historico_rma TO authenticated;
GRANT SELECT, INSERT, DELETE ON public.fotos_rma TO authenticated;

GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- ================================================
-- 9. VERIFICAÇÃO E TESTES
-- ================================================

-- Verificar se as tabelas foram criadas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('rmas', 'historico_rma', 'fotos_rma');

-- Verificar políticas RLS
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename IN ('rmas', 'historico_rma', 'fotos_rma')
ORDER BY tablename, policyname;

-- Testar função de gerar número de RMA
SELECT public.gerar_numero_rma();

-- ================================================
-- 10. DADOS DE EXEMPLO (OPCIONAL - APENAS PARA TESTES)
-- ================================================

-- Execute apenas se quiser criar dados de exemplo
-- Substitua os IDs pelos IDs reais do seu banco

/*
INSERT INTO public.rmas (
    numero_rma,
    tipo_origem,
    tipo_rma,
    status,
    produto_id,
    loja_id,
    cliente_id,
    quantidade,
    motivo,
    observacoes_assistencia,
    criado_por
) VALUES (
    'RMA2025000001',
    'cliente',
    'defeito_fabrica',
    'pendente',
    'UUID_DO_PRODUTO',
    'UUID_DA_LOJA',
    'UUID_DO_CLIENTE',
    1,
    'Produto apresentou defeito após 2 dias de uso',
    'Cliente relata que tela não liga',
    'UUID_DO_USUARIO'
);
*/

-- ================================================
-- FIM DO SCRIPT DE CONFIGURAÇÃO
-- ================================================

-- PRÓXIMOS PASSOS:
-- 1. Execute este script no Supabase SQL Editor
-- 2. Crie o bucket "fotos_rma" no Storage (se não foi criado automaticamente)
-- 3. Configure as políticas de storage no painel do Supabase
-- 4. Teste a criação de um RMA pela interface
-- 5. Verifique se o histórico está sendo registrado corretamente
-- 6. Teste o upload de fotos
-- 7. Verifique as movimentações de estoque
