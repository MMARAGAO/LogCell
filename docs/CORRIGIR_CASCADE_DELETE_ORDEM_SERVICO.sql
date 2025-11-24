-- ============================================================================
-- SCRIPT: ADICIONAR CASCADE DELETE PARA ORDEM DE SERVIÇO
-- ============================================================================

-- Ordem de serviço fotos → ordem_servico
ALTER TABLE ordem_servico_fotos 
DROP CONSTRAINT IF EXISTS ordem_servico_fotos_id_ordem_servico_fkey;

ALTER TABLE ordem_servico_fotos
ADD CONSTRAINT ordem_servico_fotos_id_ordem_servico_fkey 
FOREIGN KEY (id_ordem_servico) 
REFERENCES ordem_servico(id) 
ON DELETE CASCADE;

-- Ordem de serviço peças → ordem_servico
ALTER TABLE ordem_servico_pecas 
DROP CONSTRAINT IF EXISTS ordem_servico_pecas_id_ordem_servico_fkey;

ALTER TABLE ordem_servico_pecas
ADD CONSTRAINT ordem_servico_pecas_id_ordem_servico_fkey 
FOREIGN KEY (id_ordem_servico) 
REFERENCES ordem_servico(id) 
ON DELETE CASCADE;

-- Ordem de serviço pagamentos → ordem_servico
ALTER TABLE ordem_servico_pagamentos 
DROP CONSTRAINT IF EXISTS ordem_servico_pagamentos_id_ordem_servico_fkey;

ALTER TABLE ordem_servico_pagamentos
ADD CONSTRAINT ordem_servico_pagamentos_id_ordem_servico_fkey 
FOREIGN KEY (id_ordem_servico) 
REFERENCES ordem_servico(id) 
ON DELETE CASCADE;

-- Ordem de serviço anexos → ordem_servico
ALTER TABLE ordem_servico_anexos 
DROP CONSTRAINT IF EXISTS ordem_servico_anexos_id_ordem_servico_fkey;

ALTER TABLE ordem_servico_anexos
ADD CONSTRAINT ordem_servico_anexos_id_ordem_servico_fkey 
FOREIGN KEY (id_ordem_servico) 
REFERENCES ordem_servico(id) 
ON DELETE CASCADE;

-- Ordem de serviço caixa → ordem_servico
ALTER TABLE ordem_servico_caixa 
DROP CONSTRAINT IF EXISTS ordem_servico_caixa_id_ordem_servico_fkey;

ALTER TABLE ordem_servico_caixa
ADD CONSTRAINT ordem_servico_caixa_id_ordem_servico_fkey 
FOREIGN KEY (id_ordem_servico) 
REFERENCES ordem_servico(id) 
ON DELETE CASCADE;

-- Histórico ordem servico → ordem_servico
ALTER TABLE historico_ordem_servico 
DROP CONSTRAINT IF EXISTS historico_ordem_servico_id_ordem_servico_fkey;

ALTER TABLE historico_ordem_servico
ADD CONSTRAINT historico_ordem_servico_id_ordem_servico_fkey 
FOREIGN KEY (id_ordem_servico) 
REFERENCES ordem_servico(id) 
ON DELETE CASCADE;

-- Quebra peças → ordem_servico
ALTER TABLE quebra_pecas 
DROP CONSTRAINT IF EXISTS quebra_pecas_id_ordem_servico_fkey;

ALTER TABLE quebra_pecas
ADD CONSTRAINT quebra_pecas_id_ordem_servico_fkey 
FOREIGN KEY (id_ordem_servico) 
REFERENCES ordem_servico(id) 
ON DELETE CASCADE;

-- Verificar as constraints após alteração
SELECT 
    tc.table_name,
    tc.constraint_name,
    rc.update_rule,
    rc.delete_rule
FROM information_schema.table_constraints tc
JOIN information_schema.referential_constraints rc 
    ON tc.constraint_name = rc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND rc.delete_rule = 'CASCADE'
  AND (
    tc.table_name LIKE 'ordem_servico%' 
    OR tc.table_name = 'quebra_pecas'
    OR tc.table_name = 'historico_ordem_servico'
  )
ORDER BY tc.table_name;

COMMENT ON TABLE ordem_servico IS 'Tabela com CASCADE DELETE configurado para permitir exclusão completa';
