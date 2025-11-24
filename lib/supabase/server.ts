import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Cria um cliente Supabase para Server Components
 * Usa cookies para armazenar a sessão
 */
export async function createClient() {
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
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // O método `set` foi chamado de um Server Component.
            // Isso pode ser ignorado se você tiver middleware atualizando
            // valores de cookies.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: "", ...options });
          } catch (error) {
            // O método `delete` foi chamado de um Server Component.
            // Isso pode ser ignorado se você tiver middleware atualizando
            // valores de cookies.
          }
        },
      },
    }
  );
}
