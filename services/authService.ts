import { supabase } from "@/lib/supabaseClient";
import { Usuario, Tecnico, LoginData, TipoUsuario } from "@/types";

/**
 * Serviço de autenticação - gerencia login, logout e dados do usuário/técnico
 */
export class AuthService {
  /**
   * Faz login do usuário ou técnico
   */
  static async login({ email, senha }: LoginData) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    });

    if (error) throw error;

    // Busca dados completos do usuário ou técnico
    if (data.user) {
      const usuario = await this.getUsuarioAtual();

      // Verifica se o usuário/técnico está ativo
      if (usuario && !usuario.ativo) {
        // Faz logout automático
        await this.logout();
        throw new Error(
          "Usuário inativo. Entre em contato com o administrador."
        );
      }

      return { user: data.user, usuario };
    }

    return { user: data.user, usuario: null };
  }

  /**
   * Faz logout do usuário
   */
  static async logout() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return true;
  }

  /**
   * Obtém o usuário autenticado atual (pode ser usuário administrativo ou técnico)
   */
  static async getUsuarioAtual(): Promise<Usuario | null> {
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        return null;
      }

      // Primeiro verifica se é técnico
      const tecnico = await this.getTecnicoById(user.id);
      if (tecnico) {
        // Retorna técnico como usuário com tipo_usuario = 'tecnico'
        // IMPORTANTE: usar usuario_id (auth.uid) em vez de tecnico.id
        return {
          id: tecnico.usuario_id || user.id, // usa auth.uid para RLS
          nome: tecnico.nome,
          email: tecnico.email,
          telefone: tecnico.telefone,
          cpf: tecnico.cpf,
          ativo: tecnico.ativo,
          criado_em: tecnico.criado_em,
          atualizado_em: tecnico.atualizado_em,
          tipo_usuario: "tecnico" as TipoUsuario,
        };
      }

      // Se não é técnico, busca como usuário administrativo
      const usuario = await this.getUsuarioById(user.id);
      if (usuario) {
        return {
          ...usuario,
          tipo_usuario: "usuario" as TipoUsuario,
        };
      }

      return null;
    } catch (err) {
      console.error("Erro em getUsuarioAtual:", err);
      return null;
    }
  }

  /**
   * Busca dados do técnico pelo ID
   */
  static async getTecnicoById(id: string): Promise<Tecnico | null> {
    try {
      // Buscar por usuario_id (mais comum) ou por id (fallback)
      const { data, error } = await supabase
        .from("tecnicos")
        .select("*")
        .eq("usuario_id", id)
        .eq("ativo", true)
        .maybeSingle(); // Usar maybeSingle() ao invés de single() para evitar erro quando não encontrar

      if (error) {
        console.error("Erro ao buscar técnico:", error);
        return null;
      }

      // Se não encontrou por usuario_id, tentar por id
      if (!data) {
        const { data: dataById, error: errorById } = await supabase
          .from("tecnicos")
          .select("*")
          .eq("id", id)
          .eq("ativo", true)
          .maybeSingle();

        if (errorById) {
          return null;
        }

        return dataById as Tecnico;
      }

      return data as Tecnico;
    } catch (err) {
      // Ignora erro silenciosamente - não é técnico
      return null;
    }
  }

  /**
   * Busca dados do usuário pelo ID
   */
  static async getUsuarioById(id: string): Promise<Usuario | null> {
    try {
      const { data, error } = await supabase
        .from("usuarios")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Erro ao buscar usuário:", error.message);
        return null;
      }

      return data as Usuario;
    } catch (err) {
      console.error("Erro em getUsuarioById:", err);
      return null;
    }
  }

  /**
   * Busca todos os usuários ativos
   */
  static async getUsuariosAtivos(): Promise<Usuario[]> {
    const { data, error } = await supabase
      .from("usuarios")
      .select("*")
      .eq("ativo", true)
      .order("nome");

    if (error) {
      console.error("Erro ao buscar usuários:", error);
      return [];
    }

    return data as Usuario[];
  }

  /**
   * Busca todos os usuários (ativos e inativos)
   */
  static async getTodosUsuarios(): Promise<Usuario[]> {
    try {
      // Verifica sessão do Supabase primeiro
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        console.warn(
          "⚠️ [AuthService] Sem sessão ativa! Query pode falhar por RLS."
        );
      }

      // Busca usuários (sem JOIN com fotos_perfil por enquanto)
      const { data: usuarios, error } = await supabase
        .from("usuarios")
        .select("*")
        .order("nome");

      if (error) {
        console.error("❌ [AuthService] Erro ao buscar usuários:", error);
        return [];
      }

      // Retorna usuários sem foto_url (componente pode buscar separadamente se necessário)
      return (usuarios as Usuario[]) || [];
    } catch (err) {
      console.error("❌ [AuthService] Exceção capturada:", err);
      return [];
    }
  }

  /**
   * Atualiza dados do usuário
   */
  static async atualizarUsuario(id: string, dados: Partial<Usuario>) {
    const { data, error } = await supabase
      .from("usuarios")
      .update({
        ...dados,
        atualizado_em: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data as Usuario;
  }

  /**
   * Desativa um usuário (soft delete)
   */
  static async desativarUsuario(id: string) {
    return this.atualizarUsuario(id, { ativo: false });
  }

  /**
   * Verifica se o email já está cadastrado
   */
  static async emailJaCadastrado(email: string): Promise<boolean> {
    const { data, error } = await supabase
      .from("usuarios")
      .select("id")
      .eq("email", email)
      .single();

    return !error && data !== null;
  }

  /**
   * Verifica se o CPF já está cadastrado
   */
  static async cpfJaCadastrado(cpf: string): Promise<boolean> {
    const { data, error } = await supabase
      .from("usuarios")
      .select("id")
      .eq("cpf", cpf)
      .single();

    return !error && data !== null;
  }
}
