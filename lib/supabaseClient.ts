import { createBrowserClient } from "@supabase/ssr";

// 🚨 Variáveis de ambiente vêm do arquivo .env.local
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// 🔗 Cliente único reutilizável em toda a aplicação (Client Components)
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);
