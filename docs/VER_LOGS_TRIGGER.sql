-- Query para executar DEPOIS de tentar adicionar a peça
-- Isso vai mostrar todos os logs do trigger

SELECT 
  criado_em,
  mensagem,
  dados
FROM debug_logs
ORDER BY criado_em DESC
LIMIT 20;
