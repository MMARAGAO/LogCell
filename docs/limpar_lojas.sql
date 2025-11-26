-- =====================================================
-- Script SQL para LIMPAR LOJAS do Banco Novo
-- =====================================================
-- ⚠️ ATENÇÃO: Este script APAGA todas as lojas!
-- Execute no SQL Editor do Supabase
-- =====================================================

-- Desabilitar triggers temporariamente (se necessário)
SET session_replication_role = 'replica';

-- 1. Deletar FOTOS de lojas (depende de lojas)
DELETE FROM lojas_fotos;

-- 2. Deletar LOJAS
DELETE FROM lojas;

-- Reabilitar triggers
SET session_replication_role = 'origin';

-- Verificar se está vazio
SELECT 
    'lojas_fotos' as tabela,
    COUNT(*) as registros_restantes
FROM lojas_fotos
UNION ALL
SELECT 
    'lojas' as tabela,
    COUNT(*) as registros_restantes
FROM lojas;
