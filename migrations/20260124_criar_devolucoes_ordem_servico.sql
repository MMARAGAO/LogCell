-- ============================================================
-- Criação da tabela de devoluções de ordem de serviço
-- Script de migração para sistema LogCell
-- ============================================================

-- Criar tabela de devoluções de OS
CREATE TABLE IF NOT EXISTS devolu_ordem_servico (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_ordem_servico UUID NOT NULL REFERENCES ordem_servico(id) ON DELETE CASCADE,
  tipo_devolucao TEXT NOT NULL CHECK (tipo_devolucao IN ('reembolso', 'credito')),
  valor_total DECIMAL(10, 2) NOT NULL,
  motivo TEXT,
  realizado_por UUID REFERENCES usuarios(id),
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_devolu_os_ordem_servico ON devolu_ordem_servico(id_ordem_servico);
CREATE INDEX IF NOT EXISTS idx_devolu_os_tipo ON devolu_ordem_servico(tipo_devolucao);
CREATE INDEX IF NOT EXISTS idx_devolu_os_criado_em ON devolu_ordem_servico(criado_em);

-- Adicionar coluna status_devolucao na tabela ordem_servico se não existir
ALTER TABLE ordem_servico 
ADD COLUMN IF NOT EXISTS status_devolucao TEXT 
  DEFAULT NULL 
  CHECK (status_devolucao IN ('devolvida', 'devolvida_com_credito', NULL));

-- Comentários na tabela
COMMENT ON TABLE devolu_ordem_servico IS 'Registra devoluções de ordem de serviço (quando o serviço é desfeito)';
COMMENT ON COLUMN devolu_ordem_servico.id IS 'ID único da devolução';
COMMENT ON COLUMN devolu_ordem_servico.id_ordem_servico IS 'Referência à ordem de serviço devolvida';
COMMENT ON COLUMN devolu_ordem_servico.tipo_devolucao IS 'Tipo de devolução: reembolso (dinheiro) ou crédito (cliente)';
COMMENT ON COLUMN devolu_ordem_servico.valor_total IS 'Valor total a ser reembolsado ou creditado';
COMMENT ON COLUMN devolu_ordem_servico.motivo IS 'Motivo da devolução';
COMMENT ON COLUMN devolu_ordem_servico.realizado_por IS 'Usuário que realizou a devolução';

-- Adicionar suporte a campos de devolução de OS na tabela creditos_cliente se não existirem
ALTER TABLE creditos_cliente
ADD COLUMN IF NOT EXISTS devolucao_os_id UUID REFERENCES devolu_ordem_servico(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS ordem_servico_id UUID REFERENCES ordem_servico(id) ON DELETE SET NULL;

-- Criar índice para performance de queries de crédito
CREATE INDEX IF NOT EXISTS idx_creditos_devolucao_os ON creditos_cliente(devolucao_os_id);
CREATE INDEX IF NOT EXISTS idx_creditos_ordem_servico ON creditos_cliente(ordem_servico_id);

-- ============================================================
-- Instruções de aplicação
-- ============================================================
-- 1. Executar este script no Supabase (SQL Editor)
-- 2. Verificar que as tabelas e índices foram criados com sucesso
-- 3. O sistema está pronto para registrar devoluções de OS
-- ============================================================
