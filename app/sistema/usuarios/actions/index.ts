"use server";

import { createServerSupabaseClient } from "@/lib/supabase/action";
import { createClient } from "@supabase/supabase-js";
import { CadastroUsuarioData } from "@/types";

// Cliente com permissões de admin para criar usuários
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // Chave de serviço para operações admin
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

/**
 * Cadastra um novo usuário no sistema
 */
export async function cadastrarUsuario(dados: CadastroUsuarioData) {
  try {
    const supabase = await createServerSupabaseClient();

    // 1. Validações básicas
    if (!dados.email || !dados.senha || !dados.nome) {
      return {
        success: false,
        error: "Email, senha e nome são obrigatórios",
      };
    }

    if (dados.senha.length < 6) {
      return {
        success: false,
        error: "A senha deve ter no mínimo 6 caracteres",
      };
    }

    // 2. Verifica se o email já existe
    const { data: usuarioExistente } = await supabase
      .from("usuarios")
      .select("id")
      .eq("email", dados.email)
      .single();

    if (usuarioExistente) {
      return {
        success: false,
        error: "Este email já está cadastrado",
      };
    }

    // 3. Verifica se o CPF já existe (se fornecido)
    if (dados.cpf) {
      const { data: cpfExistente } = await supabase
        .from("usuarios")
        .select("id")
        .eq("cpf", dados.cpf)
        .single();

      if (cpfExistente) {
        return {
          success: false,
          error: "Este CPF já está cadastrado",
        };
      }
    }

    // 4. Cria o usuário no Supabase Auth
    const { data: authData, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email: dados.email,
        password: dados.senha,
        email_confirm: true, // Auto-confirma o email
      });

    if (authError || !authData.user) {
      console.error("Erro ao criar usuário no auth:", authError);
      return {
        success: false,
        error: "Erro ao criar conta de autenticação",
      };
    }

    // 5. Cria o registro do usuário na tabela usuarios
    // IMPORTANTE: Usa supabaseAdmin para ignorar RLS (cadastro público)
    const { data: usuario, error: usuarioError } = await supabaseAdmin
      .from("usuarios")
      .insert({
        id: authData.user.id,
        nome: dados.nome,
        email: dados.email,
        telefone: dados.telefone || null,
        cpf: dados.cpf || null,
        ativo: false, // Usuário criado como inativo, precisa de aprovação do admin
      })
      .select()
      .single();

    if (usuarioError) {
      console.error("Erro ao criar usuário na tabela:", {
        error: usuarioError,
        message: usuarioError.message,
        details: usuarioError.details,
        hint: usuarioError.hint,
        code: usuarioError.code,
      });

      // Rollback: deleta o usuário do auth
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);

      return {
        success: false,
        error: `Erro ao criar perfil do usuário: ${usuarioError.message}`,
      };
    }

    // 6. Cria permissões padrão para o usuário
    // IMPORTANTE: Usa supabaseAdmin para ignorar RLS (cadastro público)
    const { error: permissoesError } = await supabaseAdmin
      .from("permissoes")
      .insert({
        usuario_id: authData.user.id,
        permissoes: {
          visualizar_estoque: true,
          visualizar_lojas: true,
        },
      });

    if (permissoesError) {
      console.error("Erro ao criar permissões:", permissoesError);
      // Não faz rollback aqui, pois as permissões podem ser criadas depois
    }

    return {
      success: true,
      usuario,
    };
  } catch (error) {
    console.error("Erro ao cadastrar usuário:", error);
    return {
      success: false,
      error: "Erro inesperado ao cadastrar usuário",
    };
  }
}

/**
 * Atualiza dados de um usuário existente
 */
export async function atualizarUsuario(
  id: string,
  dados: Partial<Omit<CadastroUsuarioData, "senha">> & { ativo?: boolean }
) {
  try {
    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase
      .from("usuarios")
      .update({
        ...dados,
        atualizado_em: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Erro detalhado ao atualizar usuário:", {
        error,
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
      });
      return {
        success: false,
        error: `Erro ao atualizar usuário: ${error.message}`,
      };
    }

    return {
      success: true,
      usuario: data,
    };
  } catch (error) {
    console.error("Erro ao atualizar usuário:", error);
    return {
      success: false,
      error: "Erro inesperado ao atualizar usuário",
    };
  }
}

/**
 * Deleta um usuário (desativa)
 */
export async function deletarUsuario(id: string) {
  try {
    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase
      .from("usuarios")
      .update({ ativo: false, atualizado_em: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return {
        success: false,
        error: "Erro ao desativar usuário",
      };
    }

    return {
      success: true,
      usuario: data,
    };
  } catch (error) {
    console.error("Erro ao deletar usuário:", error);
    return {
      success: false,
      error: "Erro inesperado ao desativar usuário",
    };
  }
}

/**
 * Alterna o status ativo/inativo de um usuário
 */
export async function alternarStatusUsuario(id: string, ativo: boolean) {
  try {
    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase
      .from("usuarios")
      .update({ ativo, atualizado_em: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return {
        success: false,
        error: "Erro ao alterar status do usuário",
      };
    }

    return {
      success: true,
      usuario: data,
    };
  } catch (error) {
    console.error("Erro ao alterar status:", error);
    return {
      success: false,
      error: "Erro inesperado ao alterar status do usuário",
    };
  }
}
