import { NextRequest, NextResponse } from "next/server";

import { supabaseAdmin } from "@/lib/supabaseAdmin";

const EMAILS_ADMIN = ["admin@logcell.com", "matheusmoxil@gmail.com"];

export async function POST(request: NextRequest) {
  try {
    // 1) Identificar o chamador pelo token da sessão
    const authHeader = request.headers.get("authorization") || "";
    const token = authHeader.replace("Bearer ", "").trim();

    if (!token) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const { data: callerData, error: callerErr } =
      await supabaseAdmin.auth.getUser(token);

    if (callerErr || !callerData?.user) {
      return NextResponse.json({ error: "Sessão inválida" }, { status: 401 });
    }

    const caller = callerData.user;

    // 2) Verificar se o chamador pode gerenciar usuários
    let autorizado = EMAILS_ADMIN.includes((caller.email || "").toLowerCase());

    if (!autorizado) {
      const { data: perm } = await supabaseAdmin
        .from("permissoes")
        .select("permissoes")
        .eq("usuario_id", caller.id)
        .single();

      const p = (perm?.permissoes as any)?.usuarios;

      autorizado = p?.editar === true || p?.gerenciar_permissoes === true;
    }

    if (!autorizado) {
      return NextResponse.json(
        { error: "Sem permissão para resetar senhas" },
        { status: 403 },
      );
    }

    // 3) Validar os dados
    const { usuarioId, novaSenha } = await request.json();

    if (!usuarioId || typeof novaSenha !== "string" || novaSenha.length < 6) {
      return NextResponse.json(
        {
          error: "Dados inválidos (a senha precisa ter ao menos 6 caracteres)",
        },
        { status: 400 },
      );
    }

    // 4) Resetar a senha via Admin API
    const { error } = await supabaseAdmin.auth.admin.updateUserById(usuarioId, {
      password: novaSenha,
    });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Erro ao resetar senha:", error);

    return NextResponse.json(
      { error: error.message || "Erro ao resetar senha" },
      { status: 500 },
    );
  }
}
