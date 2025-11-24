-- Ver código da função que registra histórico
SELECT 
    proname as function_name,
    prosrc as source_code
FROM pg_proc
WHERE proname = 'registrar_historico_estoque';
