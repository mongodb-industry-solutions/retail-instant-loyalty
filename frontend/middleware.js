import { NextResponse } from "next/server";

export function middleware(request) {
  const activePersona = request.cookies.get("active_persona")?.value;
  const isLoginPage = request.nextUrl.pathname.startsWith("/login");

  if (!activePersona && !isLoginPage) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  if (activePersona && isLoginPage) {
    return NextResponse.redirect(new URL("/", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next|api|favicon.ico|rsc|.*\\.(?:png|jpg|jpeg|svg|webp|ico|gif)$).*)",
  ],
};
