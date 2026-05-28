import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    !pathname.startsWith("/_next/static") &&
    !pathname.startsWith("/favicon") &&
    !pathname.startsWith("/apple-touch-icon") &&
    !pathname.startsWith("/icon-") &&
    !pathname.startsWith("/manifest")
  ) {
    const response = NextResponse.next();

    response.headers.set("Cache-Control", "no-store, must-revalidate");

    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/((?!_next/static|favicon|apple-touch-icon|icon-|manifest).*)",
};
