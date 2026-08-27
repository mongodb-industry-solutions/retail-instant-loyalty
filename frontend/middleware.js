// middleware.js (project root)
import { NextResponse } from 'next/server'

export function middleware(request) {
  const selectedUser = request.cookies.get('selected_user')
  const isLoginPage = request.nextUrl.pathname.startsWith('/login')

  if (!selectedUser && !isLoginPage) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  if (selectedUser && isLoginPage) {
    return NextResponse.redirect(new URL('/', request.url))
  }
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next|api|favicon.ico|rsc|.*\\.(?:png|jpg|jpeg|svg|webp|ico|gif)$).*)',
  ],
}