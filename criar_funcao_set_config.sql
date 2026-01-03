-- Dropar função antiga se existir
DROP FUNCTION IF EXISTS public.set_config(text, text, boolean);

-- Criar função para configurar variáveis de sessão
CREATE OR REPLACE FUNCTION public.set_config(
  setting_name text,
  new_value text,
  is_local boolean DEFAULT false
)
RETURNS void AS $$
BEGIN
  PERFORM set_config(setting_name, new_value, is_local);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Garantir que a função seja executável
GRANT EXECUTE ON FUNCTION public.set_config(text, text, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION public.set_config(text, text, boolean) TO service_role;
