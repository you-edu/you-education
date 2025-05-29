// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

// const PUBLIC_PATHS = ['/login', '/signup', '/api'];
const PUBLIC_PATHS = [
  '/login',
  '/signup',
  '/api/auth',
//   '/api/public', // Example public API endpoint
];
export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  const isLoggedIn = Boolean(token);
  const { pathname } = request.nextUrl;

  const isPublicPath = PUBLIC_PATHS.some(path => pathname.startsWith(path));

  if (!isLoggedIn && !isPublicPath) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (isLoggedIn && (pathname === '/login' || pathname === '/signup')) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
