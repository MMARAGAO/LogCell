-- ============================================
-- TABELAS PARA TELA FINANCEIRA
-- ============================================

-- 1. TABELA FOLHAS SALARIAIS
CREATE TABLE IF NOT EXISTS public.folhas_salariais (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mes INTEGER NOT NULL,
  ano INTEGER NOT NULL,
  funcionario_id UUID NOT NULL,
  salario_base DECIMAL(12, 2) NOT NULL DEFAULT 0,
  comissoes DECIMAL(12, 2) NOT NULL DEFAULT 0,
  descontos DECIMAL(12, 2) NOT NULL DEFAULT 0,
  vales DECIMAL(12, 2) NOT NULL DEFAULT 0,
  bonificacoes DECIMAL(12, 2) NOT NULL DEFAULT 0,
  total_liquido DECIMAL(12, 2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'gerada' CHECK (status IN ('gerada', 'paga', 'cancelada')),
  data_pagamento DATE,
  observacoes TEXT,
  id_loja INTEGER,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_loja) REFERENCES public.lojas(id) ON DELETE SET NULL,
  FOREIGN KEY (funcionario_id) REFERENCES public.usuarios(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_folhas_salariais_mes_ano ON public.folhas_salariais(mes, ano);
CREATE INDEX IF NOT EXISTS idx_folhas_salariais_funcionario ON public.folhas_salariais(funcionario_id);
CREATE INDEX IF NOT EXISTS idx_folhas_salariais_loja ON public.folhas_salariais(id_loja);

-- 2. TABELA CONTAS DAS LOJAS
CREATE TABLE IF NOT EXISTS public.contas_lojas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loja_id INTEGER NOT NULL,
  descricao TEXT NOT NULL,
  tipo TEXT NOT NULL DEFAULT 'outro' CHECK (tipo IN ('aluguel', 'internet', 'energia', 'agua', 'compras', 'outro')),
  valor DECIMAL(12, 2) NOT NULL,
  desconto DECIMAL(12, 2) DEFAULT 0,
  data_vencimento DATE NOT NULL,
  data_pagamento DATE,
  status TEXT NOT NULL DEFAULT 'aberta' CHECK (status IN ('aberta', 'paga', 'vencida', 'cancelada')),
  comprovante_url TEXT,
  observacoes TEXT,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (loja_id) REFERENCES public.lojas(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_contas_lojas_loja ON public.contas_lojas(loja_id);
CREATE INDEX IF NOT EXISTS idx_contas_lojas_vencimento ON public.contas_lojas(data_vencimento);
CREATE INDEX IF NOT EXISTS idx_contas_lojas_status ON public.contas_lojas(status);

-- 3. TABELA IMPOSTOS E CONTAS TRIBUTÁRIAS
CREATE TABLE IF NOT EXISTS public.impostos_contas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo TEXT NOT NULL DEFAULT 'simples_nacional' CHECK (tipo IN ('simples_nacional', 'icms', 'iss', 'das', 'irpj', 'csll', 'outro')),
  descricao TEXT NOT NULL,
  valor DECIMAL(12, 2) NOT NULL,
  juros DECIMAL(12, 2) DEFAULT 0,
  multa DECIMAL(12, 2) DEFAULT 0,
  desconto DECIMAL(12, 2) DEFAULT 0,
  data_vencimento DATE NOT NULL,
  data_pagamento DATE,
  status TEXT NOT NULL DEFAULT 'aberta' CHECK (status IN ('aberta', 'paga', 'vencida', 'cancelada')),
  loja_id INTEGER,
  comprovante_url TEXT,
  observacoes TEXT,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (loja_id) REFERENCES public.lojas(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_impostos_contas_tipo ON public.impostos_contas(tipo);
CREATE INDEX IF NOT EXISTS idx_impostos_contas_loja ON public.impostos_contas(loja_id);
CREATE INDEX IF NOT EXISTS idx_impostos_contas_vencimento ON public.impostos_contas(data_vencimento);
CREATE INDEX IF NOT EXISTS idx_impostos_contas_status ON public.impostos_contas(status);

-- 4. TABELA VALES DE FUNCIONÁRIOS
CREATE TABLE IF NOT EXISTS public.vales_funcionarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  funcionario_id UUID NOT NULL,
  descricao TEXT NOT NULL,
  valor DECIMAL(12, 2) NOT NULL,
  data_solicitacao DATE NOT NULL,
  data_pagamento DATE,
  status TEXT NOT NULL DEFAULT 'solicitado' CHECK (status IN ('solicitado', 'aprovado', 'pago', 'cancelado')),
  observacoes TEXT,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (funcionario_id) REFERENCES public.usuarios(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_vales_funcionario ON public.vales_funcionarios(funcionario_id);
CREATE INDEX IF NOT EXISTS idx_vales_status ON public.vales_funcionarios(status);

-- 5. TABELA RETIRADAS PESSOAIS
CREATE TABLE IF NOT EXISTS public.retiradas_pessoais (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL,
  valor DECIMAL(12, 2) NOT NULL,
  motivo TEXT,
  data_retirada DATE NOT NULL,
  comprovante_url TEXT,
  observacoes TEXT,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_retiradas_usuario ON public.retiradas_pessoais(usuario_id);
CREATE INDEX IF NOT EXISTS idx_retiradas_data ON public.retiradas_pessoais(data_retirada);

-- 6. TABELA CONTAS FORNECEDORES
CREATE TABLE IF NOT EXISTS public.contas_fornecedores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fornecedor_id UUID,
  descricao TEXT NOT NULL,
  valor DECIMAL(12, 2) NOT NULL,
  juros DECIMAL(12, 2) DEFAULT 0,
  multa DECIMAL(12, 2) DEFAULT 0,
  desconto DECIMAL(12, 2) DEFAULT 0,
  data_vencimento DATE NOT NULL,
  data_pagamento DATE,
  status TEXT NOT NULL DEFAULT 'aberta' CHECK (status IN ('aberta', 'paga', 'vencida', 'cancelada')),
  numero_nf TEXT,
  comprovante_url TEXT,
  observacoes TEXT,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (fornecedor_id) REFERENCES public.fornecedores(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_contas_fornecedores_fornecedor ON public.contas_fornecedores(fornecedor_id);
CREATE INDEX IF NOT EXISTS idx_contas_fornecedores_vencimento ON public.contas_fornecedores(data_vencimento);
CREATE INDEX IF NOT EXISTS idx_contas_fornecedores_status ON public.contas_fornecedores(status);

-- 7. TABELA CENTRO DE CUSTOS
CREATE TABLE IF NOT EXISTS public.centro_custos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loja_id INTEGER NOT NULL,
  tipo TEXT NOT NULL DEFAULT 'outro' CHECK (tipo IN ('estoque', 'marketing', 'estrutura', 'pessoal', 'outro')),
  descricao TEXT NOT NULL,
  valor DECIMAL(12, 2) NOT NULL,
  data DATE NOT NULL,
  mes INTEGER NOT NULL,
  ano INTEGER NOT NULL,
  categoria TEXT,
  observacoes TEXT,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (loja_id) REFERENCES public.lojas(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_centro_custos_loja ON public.centro_custos(loja_id);
CREATE INDEX IF NOT EXISTS idx_centro_custos_tipo ON public.centro_custos(tipo);
CREATE INDEX IF NOT EXISTS idx_centro_custos_mes_ano ON public.centro_custos(mes, ano);

-- ============================================
-- DADOS DE EXEMPLO
-- ============================================

-- Inserir dados de exemplo para folhas salariais (mes atual)
INSERT INTO public.folhas_salariais (mes, ano, funcionario_id, salario_base, comissoes, bonificacoes, total_liquido, status, id_loja)
VALUES 
  ((SELECT EXTRACT(MONTH FROM CURRENT_DATE)::INTEGER), (SELECT EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER), 
   (SELECT id FROM public.usuarios LIMIT 1), 3500.00, 250.00, 100.00, 3850.00, 'gerada', (SELECT id FROM public.lojas LIMIT 1))
ON CONFLICT DO NOTHING;

-- Inserir dados de exemplo para contas de lojas
INSERT INTO public.contas_lojas (loja_id, descricao, tipo, valor, data_vencimento, status)
VALUES 
  ((SELECT id FROM public.lojas LIMIT 1), 'Aluguel - Janeiro', 'aluguel', 5000.00, '2026-02-28', 'paga'),
  ((SELECT id FROM public.lojas LIMIT 1), 'Internet - Janeiro', 'internet', 299.90, '2026-01-31', 'paga'),
  ((SELECT id FROM public.lojas LIMIT 1), 'Energia - Fevereiro', 'energia', 1200.00, '2026-02-28', 'aberta')
ON CONFLICT DO NOTHING;

-- Inserir dados de exemplo para impostos
INSERT INTO public.impostos_contas (tipo, descricao, valor, data_vencimento, status, loja_id)
VALUES 
  ('simples_nacional', 'DAS Simples - Janeiro', 450.00, '2026-02-20', 'paga', (SELECT id FROM public.lojas LIMIT 1)),
  ('icms', 'ICMS - Fevereiro', 1200.00, '2026-02-28', 'aberta', (SELECT id FROM public.lojas LIMIT 1))
ON CONFLICT DO NOTHING;

-- Inserir dados de exemplo para centro de custos
INSERT INTO public.centro_custos (loja_id, tipo, descricao, valor, data, mes, ano)
VALUES 
  ((SELECT id FROM public.lojas LIMIT 1), 'estoque', 'Reposição de estoque', 2500.00, CURRENT_DATE, (SELECT EXTRACT(MONTH FROM CURRENT_DATE)::INTEGER), (SELECT EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER)),
  ((SELECT id FROM public.lojas LIMIT 1), 'marketing', 'Publicidade online', 500.00, CURRENT_DATE, (SELECT EXTRACT(MONTH FROM CURRENT_DATE)::INTEGER), (SELECT EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER)),
  ((SELECT id FROM public.lojas LIMIT 1), 'estrutura', 'Manutenção do local', 800.00, CURRENT_DATE, (SELECT EXTRACT(MONTH FROM CURRENT_DATE)::INTEGER), (SELECT EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER))
ON CONFLICT DO NOTHING;

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Habilitar RLS nas tabelas
ALTER TABLE public.folhas_salariais ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contas_lojas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.impostos_contas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vales_funcionarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.retiradas_pessoais ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contas_fornecedores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.centro_custos ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS (apenas leitura para agora, pode ser ajustado depois)
CREATE POLICY "folhas_salariais_read" ON public.folhas_salariais
  FOR SELECT USING (true);

CREATE POLICY "contas_lojas_read" ON public.contas_lojas
  FOR SELECT USING (true);

CREATE POLICY "impostos_contas_read" ON public.impostos_contas
  FOR SELECT USING (true);

CREATE POLICY "centro_custos_read" ON public.centro_custos
  FOR SELECT USING (true);

-- ============================================
-- FIM DO SCRIPT
-- ============================================
