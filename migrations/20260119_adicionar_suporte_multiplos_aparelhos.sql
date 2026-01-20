-- =====================================================
-- MIGRATION: Adicionar suporte a múltiplos aparelhos por OS
-- Data: 19/01/2026
-- =====================================================

-- Criar tabela de aparelhos da OS
CREATE TABLE IF NOT EXISTS public.ordem_servico_aparelhos (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL PRIMARY KEY,
    id_ordem_servico uuid NOT NULL REFERENCES ordem_servico(id) ON DELETE CASCADE,
    id_loja integer NOT NULL,
    
    -- Identificação do aparelho
    sequencia integer NOT NULL, -- 1, 2, 3... para manter ordem
    equipamento_tipo character varying(100) NOT NULL,
    equipamento_marca character varying(100),
    equipamento_modelo character varying(100),
    equipamento_numero_serie character varying(100),
    equipamento_imei character varying(100),
    equipamento_senha character varying(100),
    
    -- Problemas/Defeito
    defeito_reclamado text NOT NULL,
    estado_equipamento text,
    acessorios_entregues text,
    
    -- Diagnóstico
    diagnostico text,
    
    -- Valores do serviço neste aparelho
    valor_orcamento numeric(10,2),
    valor_desconto numeric(10,2) DEFAULT 0,
    valor_total numeric(10,2),
    valor_pago numeric(10,2) DEFAULT 0,
    
    -- Laudo técnico
    servico_realizado text,
    laudo_diagnostico text,
    laudo_causa text,
    laudo_procedimentos text,
    laudo_recomendacoes text,
    laudo_garantia_dias integer DEFAULT 90,
    laudo_condicao_final text,
    observacoes_tecnicas text,
    
    -- Status e controle
    status character varying(20) DEFAULT 'ativo'::character varying NOT NULL,
    
    criado_em timestamp with time zone DEFAULT now() NOT NULL,
    atualizado_em timestamp with time zone DEFAULT now() NOT NULL,
    criado_por uuid,
    atualizado_por uuid,
    
    CONSTRAINT ordem_servico_aparelhos_sequencia_check CHECK (sequencia > 0),
    CONSTRAINT ordem_servico_aparelhos_status_check CHECK (status::text = ANY (ARRAY['ativo'::character varying, 'removido'::character varying]::text[]))
);

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_ordem_servico_aparelhos_os_id ON ordem_servico_aparelhos(id_ordem_servico);
CREATE INDEX IF NOT EXISTS idx_ordem_servico_aparelhos_loja_id ON ordem_servico_aparelhos(id_loja);
CREATE UNIQUE INDEX IF NOT EXISTS idx_ordem_servico_aparelhos_sequencia ON ordem_servico_aparelhos(id_ordem_servico, sequencia) WHERE status = 'ativo'::character varying;

-- Atualizar tabela ordem_servico para adicionar suporte a múltiplos aparelhos
-- Adicionar campo para indicar se usa múltiplos aparelhos
ALTER TABLE public.ordem_servico 
ADD COLUMN IF NOT EXISTS permite_multiplos_aparelhos boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS total_geral_multiplos numeric(10,2);

-- COMENTAR: Os campos antigos (equipamento_tipo, equipamento_marca, etc) permanecerão
-- para compatibilidade com dados legados. Quando usar múltiplos aparelhos,
-- os dados ficarão em ordem_servico_aparelhos.

-- Trigger para atualizar atualizado_em
CREATE OR REPLACE FUNCTION atualizar_timestamp_aparelhos()
RETURNS TRIGGER AS $$
BEGIN
    NEW.atualizado_em = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF NOT EXISTS tr_atualizar_timestamp_aparelhos ON ordem_servico_aparelhos;

CREATE TRIGGER tr_atualizar_timestamp_aparelhos
BEFORE UPDATE ON ordem_servico_aparelhos
FOR EACH ROW
EXECUTE FUNCTION atualizar_timestamp_aparelhos();

-- RLS (Row Level Security)
ALTER TABLE public.ordem_servico_aparelhos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF NOT EXISTS "Usuários autenticados podem ler aparelhos" ON ordem_servico_aparelhos;
CREATE POLICY "Usuários autenticados podem ler aparelhos"
    ON ordem_servico_aparelhos FOR SELECT
    USING (true);

DROP POLICY IF NOT EXISTS "Usuários autenticados podem inserir aparelhos" ON ordem_servico_aparelhos;
CREATE POLICY "Usuários autenticados podem inserir aparelhos"
    ON ordem_servico_aparelhos FOR INSERT
    WITH CHECK (true);

DROP POLICY IF NOT EXISTS "Usuários autenticados podem atualizar aparelhos" ON ordem_servico_aparelhos;
CREATE POLICY "Usuários autenticados podem atualizar aparelhos"
    ON ordem_servico_aparelhos FOR UPDATE
    USING (true)
    WITH CHECK (true);

DROP POLICY IF NOT EXISTS "Usuários autenticados podem deletar aparelhos" ON ordem_servico_aparelhos;
CREATE POLICY "Usuários autenticados podem deletar aparelhos"
    ON ordem_servico_aparelhos FOR DELETE
    USING (true);
