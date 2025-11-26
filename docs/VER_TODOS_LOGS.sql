-- Ver todos os logs recentes
SELECT 
  criado_em,
  contexto,
  mensagem,
  dados
FROM debug_logs
ORDER BY criado_em DESC
LIMIT 50;
