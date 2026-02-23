import { createClient } from "@supabase/supabase-js";

export const supabaseServer = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!, // chave com permissões totais (NUNCA expor no frontend)
    {
      auth: {
        persistSession: false,
      },
    },
  );
};
