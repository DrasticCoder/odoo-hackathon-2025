import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
const publicRoutes = [
  '/',
  '/auth',
  '/api/auth',
  '/unauthorized',
  '/auth/login',
  '/auth/signup',
  '/auth/verify',
  '/auth/otp',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    publicRoutes.some((route) => pathname.startsWith(route)) ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/auth') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api/auth|_next/static|_next/image|favicon.ico).*)'],
};
