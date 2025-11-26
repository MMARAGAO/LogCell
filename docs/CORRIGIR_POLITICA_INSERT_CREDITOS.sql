-- Script para corrigir política RLS de INSERT na tabela creditos_cliente
-- Data: 25/11/2025
-- Motivo: Permitir que usuários autenticados possam criar créditos ao fazer trocas de produtos

-- Remover política existente que está muito restritiva
DROP POLICY IF EXISTS "Usuários podem criar créditos" ON creditos_cliente;

-- Criar nova política que permite usuários autenticados inserirem créditos
CREATE POLICY "Usuários autenticados podem criar créditos"
  ON creditos_cliente FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Comentário
COMMENT ON POLICY "Usuários autenticados podem criar créditos" ON creditos_cliente 
IS 'Permite que qualquer usuário autenticado crie créditos para clientes (usado em trocas e devoluções)';
