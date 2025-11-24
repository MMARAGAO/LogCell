import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ usuarioId: string }> }
) {
  try {
    const params = await context.params;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: permissoes, error } = await supabase
      .from("permissoes_usuarios")
      .select("*")
      .eq("usuario_id", params.usuarioId);

    if (error) throw error;

    return NextResponse.json({ permissoes });
  } catch (error) {
    console.error("Erro ao buscar permissões:", error);
    return NextResponse.json(
      { error: "Erro ao buscar permissões" },
      { status: 500 }
    );
  }
}
