import { supabase } from "@/lib/supabaseClient";

/**
 * Retorna o usuário logado atual.
 */
export async function getUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    console.error("Erro ao obter usuário:", error);
    return null;
  }

  return user;
}

/**
 * Faz login do usuário com email e senha
 */
export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data.user;
}

/**
 * Faz logout do usuário atual
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
  return true;
}
