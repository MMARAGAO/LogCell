-- Corrigir trigger da tabela configuracoes_usuario
-- O erro ocorre porque algum trigger está tentando acessar "atualizado_em" 
-- mas o campo correto é "updated_at"

-- 1. Dropar o trigger problemático se existir
DROP TRIGGER IF EXISTS update_configuracoes_usuario_updated_at ON public.configuracoes_usuario;

-- 2. Verificar se existe algum outro trigger problemático
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN 
        SELECT tgname 
        FROM pg_trigger 
        WHERE tgrelid = 'public.configuracoes_usuario'::regclass
        AND tgname LIKE '%atualizado%'
    LOOP
        EXECUTE 'DROP TRIGGER IF EXISTS ' || r.tgname || ' ON public.configuracoes_usuario';
        RAISE NOTICE 'Trigger % removido', r.tgname;
    END LOOP;
END $$;

-- 3. Recriar a função correta (se não existir)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Recriar o trigger correto
CREATE TRIGGER update_configuracoes_usuario_updated_at
  BEFORE UPDATE ON public.configuracoes_usuario
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 5. Verificar triggers ativos
SELECT 
    tgname AS trigger_name,
    proname AS function_name,
    prosrc AS function_code
FROM pg_trigger t
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE t.tgrelid = 'public.configuracoes_usuario'::regclass;
