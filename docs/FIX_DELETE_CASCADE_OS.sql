-- =====================================================
-- CORRIGIR DELETE CASCADE PARA ORDEM DE SERVIÇO
-- =====================================================
-- Este script ajusta as foreign keys para permitir deletar
-- ordens de serviço sem causar erros de violação de chave
-- E corrige os triggers para NÃO executarem em DELETE

-- =====================================================
-- 1. HISTORICO_ORDEM_SERVICO
-- =====================================================
-- Remover constraint antiga
ALTER TABLE historico_ordem_servico
DROP CONSTRAINT IF EXISTS historico_ordem_servico_id_ordem_servico_fkey;

-- Adicionar com CASCADE
ALTER TABLE historico_ordem_servico
ADD CONSTRAINT historico_ordem_servico_id_ordem_servico_fkey
FOREIGN KEY (id_ordem_servico) 
REFERENCES ordem_servico(id) 
ON DELETE CASCADE;

-- =====================================================
-- 2. QUEBRA_PECAS
-- =====================================================
-- Remover constraint antiga
ALTER TABLE quebra_pecas
DROP CONSTRAINT IF EXISTS quebra_pecas_id_ordem_servico_fkey;

-- Adicionar com CASCADE
ALTER TABLE quebra_pecas
ADD CONSTRAINT quebra_pecas_id_ordem_servico_fkey
FOREIGN KEY (id_ordem_servico) 
REFERENCES ordem_servico(id) 
ON DELETE CASCADE;

-- =====================================================
-- 3. ORDEM_SERVICO_PECAS
-- =====================================================
-- Remover constraint antiga
ALTER TABLE ordem_servico_pecas
DROP CONSTRAINT IF EXISTS ordem_servico_pecas_id_ordem_servico_fkey;

-- Adicionar com CASCADE
ALTER TABLE ordem_servico_pecas
ADD CONSTRAINT ordem_servico_pecas_id_ordem_servico_fkey
FOREIGN KEY (id_ordem_servico) 
REFERENCES ordem_servico(id) 
ON DELETE CASCADE;

-- =====================================================
-- 4. ORDEM_SERVICO_FOTOS
-- =====================================================
-- Remover constraint antiga
ALTER TABLE ordem_servico_fotos
DROP CONSTRAINT IF EXISTS ordem_servico_fotos_id_ordem_servico_fkey;

-- Adicionar com CASCADE
ALTER TABLE ordem_servico_fotos
ADD CONSTRAINT ordem_servico_fotos_id_ordem_servico_fkey
FOREIGN KEY (id_ordem_servico) 
REFERENCES ordem_servico(id) 
ON DELETE CASCADE;

-- =====================================================
-- 5. DESABILITAR TRIGGERS EM DELETE (QUEBRA_PECAS)
-- =====================================================
-- Os triggers de quebra não devem executar quando a OS é deletada

DROP TRIGGER IF EXISTS trigger_quebra_registrada ON quebra_pecas;
DROP TRIGGER IF EXISTS trigger_quebra_aprovada ON quebra_pecas;

-- Recriar trigger de quebra registrada (APENAS PARA INSERT)
CREATE TRIGGER trigger_quebra_registrada
    AFTER INSERT ON quebra_pecas
    FOR EACH ROW
    EXECUTE FUNCTION registrar_quebra_registrada();

-- Recriar trigger de quebra aprovada (APENAS PARA UPDATE)
CREATE TRIGGER trigger_quebra_aprovada
    AFTER UPDATE ON quebra_pecas
    FOR EACH ROW
    WHEN (OLD.aprovado IS DISTINCT FROM NEW.aprovado)
    EXECUTE FUNCTION registrar_quebra_aprovada();

-- =====================================================
-- 6. DESABILITAR TRIGGERS EM DELETE (ORDEM_SERVICO_PECAS)
-- =====================================================
DROP TRIGGER IF EXISTS trigger_peca_adicionada ON ordem_servico_pecas;
DROP TRIGGER IF EXISTS trigger_peca_atualizada ON ordem_servico_pecas;
DROP TRIGGER IF EXISTS trigger_peca_removida ON ordem_servico_pecas;

-- Recriar apenas INSERT e UPDATE (não DELETE)
CREATE TRIGGER trigger_peca_adicionada
    AFTER INSERT ON ordem_servico_pecas
    FOR EACH ROW
    EXECUTE FUNCTION registrar_peca_adicionada();

CREATE TRIGGER trigger_peca_atualizada
    AFTER UPDATE ON ordem_servico_pecas
    FOR EACH ROW
    WHEN (
        OLD.quantidade IS DISTINCT FROM NEW.quantidade OR
        OLD.valor_venda IS DISTINCT FROM NEW.valor_venda OR
        OLD.estoque_baixado IS DISTINCT FROM NEW.estoque_baixado
    )
    EXECUTE FUNCTION registrar_peca_atualizada();

-- NÃO recriar trigger_peca_removida para evitar conflito com CASCADE

-- =====================================================
-- 7. DESABILITAR TRIGGERS EM DELETE (ORDEM_SERVICO_FOTOS)
-- =====================================================
DROP TRIGGER IF EXISTS trigger_foto_adicionada ON ordem_servico_fotos;
DROP TRIGGER IF EXISTS trigger_foto_removida ON ordem_servico_fotos;

-- Recriar apenas INSERT (não DELETE)
CREATE TRIGGER trigger_foto_adicionada
    AFTER INSERT ON ordem_servico_fotos
    FOR EACH ROW
    EXECUTE FUNCTION registrar_foto_adicionada();

-- NÃO recriar trigger_foto_removida para evitar conflito com CASCADE

-- =====================================================
-- VERIFICAR CONSTRAINTS ATUALIZADAS
-- =====================================================
SELECT
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name,
  rc.delete_rule
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
JOIN information_schema.referential_constraints AS rc
  ON rc.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND ccu.table_name = 'ordem_servico'
ORDER BY tc.table_name;

-- =====================================================
-- RESULTADO ESPERADO
-- =====================================================
-- Todas as tabelas relacionadas devem ter delete_rule = 'CASCADE'
-- Triggers de DELETE foram removidos para evitar conflitos
-- Apenas triggers de INSERT e UPDATE permanecem ativos

