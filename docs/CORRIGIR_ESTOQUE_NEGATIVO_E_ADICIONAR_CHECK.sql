-- ============================================
-- CORREÇÃO DE ESTOQUE NEGATIVO
-- Execute este script para corrigir estoques negativos
-- e adicionar proteção contra isso no futuro
-- ============================================

-- Passo 1: Verificar quantos registros têm estoque negativo
SELECT 
    el.id,
    p.descricao as produto,
    l.nome as loja,
    el.quantidade as quantidade_negativa
FROM estoque_lojas el
JOIN produtos p ON p.id = el.id_produto
JOIN lojas l ON l.id = el.id_loja
WHERE el.quantidade < 0
ORDER BY el.quantidade;

-- Passo 2: Corrigir os estoques negativos (zerando-os)
-- ATENÇÃO: Revise os dados acima antes de executar esta atualização!

BEGIN;

-- Registrar no histórico antes de corrigir
INSERT INTO historico_estoque (
    id_produto,
    id_loja,
    quantidade_anterior,
    quantidade_nova,
    quantidade_alterada,
    tipo_movimentacao,
    motivo,
    observacao,
    criado_em
)
SELECT 
    id_produto,
    id_loja,
    quantidade,
    0,
    -quantidade,
    'ajuste',
    'Correção automática de estoque negativo',
    'Estoque estava negativo (' || quantidade || '), foi zerado para manter integridade',
    now()
FROM estoque_lojas
WHERE quantidade < 0;

-- Corrigir os estoques
UPDATE estoque_lojas
SET quantidade = 0,
    atualizado_em = now()
WHERE quantidade < 0;

COMMIT;

-- Passo 3: Adicionar a constraint para prevenir futuros estoques negativos
-- (Se já existir, será ignorado)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conrelid = 'estoque_lojas'::regclass 
        AND conname = 'estoque_lojas_quantidade_check'
    ) THEN
        ALTER TABLE public.estoque_lojas 
        ADD CONSTRAINT estoque_lojas_quantidade_check CHECK (quantidade >= 0);
        RAISE NOTICE 'Constraint estoque_lojas_quantidade_check criada com sucesso!';
    ELSE
        RAISE NOTICE 'Constraint estoque_lojas_quantidade_check já existe. Nenhuma ação necessária.';
    END IF;
END $$;

-- Passo 4: Verificar se a constraint foi aplicada
SELECT 
    conname as nome_constraint, 
    pg_get_constraintdef(oid) as definicao
FROM pg_constraint 
WHERE conrelid = 'estoque_lojas'::regclass 
AND conname = 'estoque_lojas_quantidade_check';

-- ============================================
-- ALTERAÇÕES NA APLICAÇÃO
-- ============================================
-- As seguintes alterações foram feitas no código para tratar o erro graciosamente:
--
-- 1. services/vendasService.ts
--    - Adicionado tratamento de erro de constraint ao adicionar item novo
--    - Adicionado tratamento de erro de constraint ao alterar quantidade
--    - Adicionado tratamento genérico no catch para erros de estoque negativo
--
-- 2. components/estoque/TransferenciaModal.tsx
--    - Adicionado tratamento de erro de constraint na transferência entre lojas
--
-- 3. components/ordem-servico/OrdemServicoFormModal.tsx
--    - Adicionado tratamento de erro de constraint ao adicionar peças
--
-- 4. services/rmaService.ts
--    - Adicionado tratamento de erro de constraint nas movimentações de RMA
--
-- Todos os tratamentos verificam:
-- - Código de erro PostgreSQL: 23514 (CHECK constraint violation)
-- - Nome da constraint: estoque_lojas_quantidade_check
-- E retornam mensagens amigáveis ao usuário

-- Pronto! Agora o estoque nunca poderá ficar negativo.
