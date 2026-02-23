import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { message, type, data } = await request.json();

    const timestamp = new Date().toLocaleString("pt-BR");
    const prefix = `[${timestamp}] [Scanner]`;

    switch (type) {
      case "error":
        console.error(`${prefix} ❌`, message, data || "");
        break;
      case "success":
        console.log(`${prefix} ✅`, message, data || "");
        break;
      case "info":
        console.log(`${prefix} ℹ️`, message, data || "");
        break;
      default:
        console.log(`${prefix}`, message, data || "");
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[API Log] Erro:", error);

    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
