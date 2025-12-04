-- =====================================================
-- SCRIPT - TORNAR CAMPOS OPCIONAIS
-- =====================================================
-- Remove a restrição NOT NULL dos campos telefone e cpf
-- da tabela clientes
-- =====================================================

-- Tornar o campo TELEFONE opcional (permitir NULL)
ALTER TABLE public.clientes 
ALTER COLUMN telefone DROP NOT NULL;

-- Tornar o campo CPF opcional (já é opcional, mas garantindo)
-- O CPF já permite NULL, então não precisa alterar

-- =====================================================
-- VERIFICAÇÃO
-- =====================================================

-- Verificar a estrutura da tabela após as alterações
SELECT 
    column_name,
    data_type,
    character_maximum_length,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'clientes'
  AND column_name IN ('telefone', 'cpf')
ORDER BY column_name;

-- =====================================================
-- FIM DO SCRIPT
-- =====================================================
