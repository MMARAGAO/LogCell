-- =====================================================
-- SISTEMA DE CONTROLE DE CAIXA
-- =====================================================

-- Tabela principal de caixa
CREATE TABLE IF NOT EXISTS public.caixas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loja_id INTEGER NOT NULL REFERENCES public.lojas(id),
  usuario_abertura UUID NOT NULL REFERENCES public.usuarios(id),
  usuario_fechamento UUID REFERENCES public.usuarios(id),
  data_abertura TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
  data_fechamento TIMESTAMP WITHOUT TIME ZONE,
  saldo_inicial NUMERIC NOT NULL DEFAULT 0,
  saldo_final NUMERIC,
  status VARCHAR NOT NULL DEFAULT 'aberto' CHECK (status IN ('aberto', 'fechado')),
  observacoes_abertura TEXT,
  observacoes_fechamento TEXT,
  criado_em TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
  atualizado_em TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

-- Comentários
COMMENT ON TABLE public.caixas IS 'Controle de abertura e fechamento de caixa por loja';
COMMENT ON COLUMN public.caixas.saldo_inicial IS 'Valor em dinheiro no caixa na abertura';
COMMENT ON COLUMN public.caixas.saldo_final IS 'Valor em dinheiro no caixa no fechamento';

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_caixas_loja_id ON public.caixas(loja_id);
CREATE INDEX IF NOT EXISTS idx_caixas_status ON public.caixas(status);
CREATE INDEX IF NOT EXISTS idx_caixas_data_abertura ON public.caixas(data_abertura);

-- Função para garantir apenas um caixa aberto por loja
CREATE OR REPLACE FUNCTION verificar_caixa_aberto()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'aberto' THEN
    IF EXISTS (
      SELECT 1 FROM caixas 
      WHERE loja_id = NEW.loja_id 
      AND status = 'aberto' 
      AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::UUID)
    ) THEN
      RAISE EXCEPTION 'Já existe um caixa aberto para esta loja';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para verificar caixa aberto
DROP TRIGGER IF EXISTS trigger_verificar_caixa_aberto ON public.caixas;
CREATE TRIGGER trigger_verificar_caixa_aberto
  BEFORE INSERT OR UPDATE ON public.caixas
  FOR EACH ROW
  EXECUTE FUNCTION verificar_caixa_aberto();

-- Política RLS (Row Level Security) - ajuste conforme suas necessidades
ALTER TABLE public.caixas ENABLE ROW LEVEL SECURITY;

-- Permitir leitura para usuários autenticados
CREATE POLICY "Usuários podem ver caixas" ON public.caixas
  FOR SELECT
  TO authenticated
  USING (true);

-- Permitir inserção para usuários autenticados
CREATE POLICY "Usuários podem criar caixas" ON public.caixas
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Permitir atualização para usuários autenticados
CREATE POLICY "Usuários podem atualizar caixas" ON public.caixas
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);
