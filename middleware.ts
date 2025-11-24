import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: "",
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value: "",
            ...options,
          });
        },
      },
    }
  );

  // Refresh session if expired - required for Server Components
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Rotas protegidas
  const protectedRoutes = ["/sistema"];
  const isProtectedRoute = protectedRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  );

  // Se não tem sessão e está tentando acessar rota protegida
  if (isProtectedRoute && !session) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/auth";
    return NextResponse.redirect(redirectUrl);
  }

  // Se tem sessão, verificar tipo de usuário e permissões
  if (session && isProtectedRoute) {
    try {
      // Verificar se é técnico usando query mais simples
      const { data: tecnicos, error } = await supabase
        .from("tecnicos")
        .select("id, ativo")
        .eq("usuario_id", session.user.id)
        .eq("ativo", true)
        .limit(1);

      // Se encontrou técnico ativo
      if (!error && tecnicos && tecnicos.length > 0) {
        // É um técnico - restringir acesso
        const rotasPermitidas = [
          "/sistema/ordem-servico",
          "/sistema/perfil",
          "/sistema/dashboard", // Pode ver dashboard básico
          "/sistema/configuracoes", // Pode alterar configurações próprias
        ];

        const temPermissao = rotasPermitidas.some((rota) =>
          request.nextUrl.pathname.startsWith(rota)
        );

        if (!temPermissao) {
          // Redirecionar para área permitida
          const redirectUrl = request.nextUrl.clone();
          redirectUrl.pathname = "/sistema/ordem-servico";
          return NextResponse.redirect(redirectUrl);
        }
      }
      // Se não é técnico ou não encontrou, é usuário administrativo - permite tudo
    } catch (error) {
      // Em caso de erro, permite acesso (fail-open para admin)
      console.error("Erro ao verificar tipo de usuário:", error);
    }
  }

  // Se tem sessão e está tentando acessar /auth
  if (request.nextUrl.pathname === "/auth" && session) {
    try {
      // Verificar se é técnico para redirecionar para área correta
      const { data: tecnicos, error } = await supabase
        .from("tecnicos")
        .select("id")
        .eq("usuario_id", session.user.id)
        .eq("ativo", true)
        .limit(1);

      const redirectUrl = request.nextUrl.clone();
      if (!error && tecnicos && tecnicos.length > 0) {
        redirectUrl.pathname = "/sistema/ordem-servico/tecnico";
      } else {
        redirectUrl.pathname = "/sistema/dashboard";
      }
      return NextResponse.redirect(redirectUrl);
    } catch (error) {
      // Em caso de erro, redireciona para dashboard
      console.error("Erro ao verificar técnico:", error);
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/sistema/dashboard";
      return NextResponse.redirect(redirectUrl);
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
