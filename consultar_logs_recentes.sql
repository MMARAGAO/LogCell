-- Query para visualizar logs de deleção com formatação legível
SELECT 
  TO_CHAR(criado_em, 'DD/MM/YYYY, HH24:MI:SS') as data_delecao,
  tabela_nome,
  numero_venda,
  cliente_nome,
  usuario_nome,
  valor_total
FROM public.audit_logs_deletions 
WHERE criado_em > NOW() - INTERVAL '2 hours'
ORDER BY criado_em DESC;
