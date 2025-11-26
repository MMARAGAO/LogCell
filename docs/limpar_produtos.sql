-- =====================================================
-- Script SQL para LIMPAR PRODUTOS do Banco Novo
-- =====================================================
-- ⚠️ ATENÇÃO: Este script APAGA todos os produtos!
-- Execute no SQL Editor do Supabase
-- =====================================================

-- Desabilitar triggers temporariamente (se necessário)
SET session_replication_role = 'replica';

-- 1. Deletar FOTOS de produtos (depende de produtos)
DELETE FROM fotos_produtos;

-- 2. Deletar ESTOQUE (depende de produtos)
DELETE FROM estoque_lojas;

-- 3. Deletar PRODUTOS
DELETE FROM produtos;

-- Reabilitar triggers
SET session_replication_role = 'origin';

-- Verificar se está vazio
SELECT 
    'fotos_produtos' as tabela,
    COUNT(*) as registros_restantes
FROM fotos_produtos
UNION ALL
SELECT 
    'estoque_lojas' as tabela,
    COUNT(*) as registros_restantes
FROM estoque_lojas
UNION ALL
SELECT 
    'produtos' as tabela,
    COUNT(*) as registros_restantes
FROM produtos;
