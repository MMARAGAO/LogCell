"use server";

import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Cria um cliente Supabase autenticado no servidor
 * Usa os cookies do usuário autenticado (com RLS ativo)
 * Use para operações que precisam do contexto do usuário
 */
export async function createServerSupabaseClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set(name, value, options);
          } catch (error) {
            // Server Actions não podem modificar cookies
            // Ignorar erro silenciosamente
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set(name, "", options);
          } catch (error) {
            // Server Actions não podem modificar cookies
            // Ignorar erro silenciosamente
          }
        },
      },
    }
  );
}
