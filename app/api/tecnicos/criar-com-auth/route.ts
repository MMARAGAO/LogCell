import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Criar cliente Supabase com Service Role (apenas no servidor!)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    console.log("📥 Recebido na API:", {
      nome: body.nome,
      email: body.email,
      telefone: body.telefone,
      criado_por: body.criado_por,
      temSenha: !!body.senha,
    });

    const {
      nome,
      email,
      senha,
      telefone,
      cpf,
      rg,
      data_nascimento,
      especialidades,
      registro_profissional,
      data_admissao,
      cor_agenda,
      id_loja,
      criado_por,
    } = body;

    // Validações básicas com mensagens específicas
    if (!nome) {
      console.error("❌ Nome faltando");
      return NextResponse.json(
        { error: "Nome é obrigatório" },
        { status: 400 }
      );
    }

    if (!email) {
      console.error("❌ Email faltando");
      return NextResponse.json(
        { error: "Email é obrigatório" },
        { status: 400 }
      );
    }

    if (!senha) {
      console.error("❌ Senha faltando");
      return NextResponse.json(
        { error: "Senha é obrigatória" },
        { status: 400 }
      );
    }

    if (!telefone) {
      console.error("❌ Telefone faltando");
      return NextResponse.json(
        { error: "Telefone é obrigatório" },
        { status: 400 }
      );
    }

    if (!criado_por) {
      console.error("❌ criado_por faltando");
      return NextResponse.json(
        { error: "Usuário criador não identificado. Faça login novamente." },
        { status: 400 }
      );
    }

    if (senha.length < 6) {
      console.error("❌ Senha muito curta");
      return NextResponse.json(
        { error: "Senha deve ter no mínimo 6 caracteres" },
        { status: 400 }
      );
    }

    console.log("✅ Validações OK, criando usuário...");

    // 1. Verificar se email já existe
    const { data: emailExiste } = await supabaseAdmin
      .from("tecnicos")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (emailExiste) {
      console.error("❌ Email já cadastrado");
      return NextResponse.json(
        { error: "Este email já está cadastrado" },
        { status: 400 }
      );
    }

    // 2. Verificar se CPF já existe (se fornecido)
    if (cpf) {
      const { data: cpfExiste } = await supabaseAdmin
        .from("tecnicos")
        .select("id")
        .eq("cpf", cpf)
        .maybeSingle();

      if (cpfExiste) {
        console.error("❌ CPF já cadastrado");
        return NextResponse.json(
          { error: "Este CPF já está cadastrado" },
          { status: 400 }
        );
      }
    }

    console.log(
      "✅ Email e CPF disponíveis, criando usuário de autenticação..."
    );

    // 3. Criar usuário no Supabase Auth usando Admin API
    const { data: authUser, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email: email,
        password: senha,
        email_confirm: true, // Auto-confirmar email
        user_metadata: {
          nome: nome,
          tipo_usuario: "tecnico",
        },
      });

    if (authError) {
      console.error("Erro ao criar usuário de autenticação:", authError);
      return NextResponse.json(
        { error: `Erro ao criar autenticação: ${authError.message}` },
        { status: 400 }
      );
    }

    if (!authUser.user) {
      return NextResponse.json(
        { error: "Usuário de autenticação não foi criado" },
        { status: 500 }
      );
    }

    // 2. Criar registro na tabela tecnicos usando o ID do auth.users
    const tecnicoData = {
      id: authUser.user.id, // Usar o mesmo ID do auth.users
      nome: nome,
      email: email,
      telefone: telefone,
      cpf: cpf || null,
      rg: rg || null,
      data_nascimento: data_nascimento || null,
      especialidades: especialidades || null,
      registro_profissional: registro_profissional || null,
      data_admissao: data_admissao || new Date().toISOString(),
      cor_agenda: cor_agenda || "#3b82f6",
      id_loja: id_loja || null,
      usuario_id: authUser.user.id,
      ativo: true,
      criado_por: criado_por,
    };

    const { data: tecnico, error: tecnicoError } = await supabaseAdmin
      .from("tecnicos")
      .insert(tecnicoData)
      .select()
      .single();

    if (tecnicoError) {
      console.error("Erro ao criar técnico:", tecnicoError);

      // Se falhar ao criar técnico, tentar deletar o usuário de autenticação
      try {
        await supabaseAdmin.auth.admin.deleteUser(authUser.user.id);
        console.log("Usuário de autenticação revertido com sucesso");
      } catch (deleteError) {
        console.error("Erro ao reverter criação de usuário:", deleteError);
      }

      // Mensagens de erro mais amigáveis
      let errorMessage = tecnicoError.message;

      if (tecnicoError.code === "23505") {
        // Violação de constraint única
        if (errorMessage.includes("tecnicos_email_key")) {
          errorMessage = "Este email já está cadastrado";
        } else if (errorMessage.includes("tecnicos_cpf_key")) {
          errorMessage = "Este CPF já está cadastrado";
        } else {
          errorMessage = "Já existe um técnico com estes dados";
        }
      }

      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }

    return NextResponse.json(
      {
        success: true,
        tecnico: tecnico,
        message: "Técnico criado com sucesso!",
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Erro na API de criar técnico:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao criar técnico" },
      { status: 500 }
    );
  }
}
