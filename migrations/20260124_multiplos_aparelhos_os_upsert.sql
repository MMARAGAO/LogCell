-- Funções utilitárias para upsert de aparelhos e serviços vinculados à OS
-- Não executa nada automaticamente, serve como referência SQL/PL pgsql se precisarmos mover lógica para o banco.
-- Mantém compatibilidade: novas entradas são inseridas; existentes (por id) são atualizadas; não remove registros não listados.

-- Exemplo de upsert em ordem_servico_aparelhos:
-- insert into ordem_servico_aparelhos (...)
-- on conflict (id) do update set ...;

-- Exemplo de upsert em ordem_servico_aparelhos_servicos:
-- insert into ordem_servico_aparelhos_servicos (...)
-- on conflict (id) do update set ...;
