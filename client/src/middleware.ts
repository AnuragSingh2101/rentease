import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';


const protectedRoutes = ['/dashboard', '/vendor/dashboard', '/admin/dashboard', '/profile', '/bookings', '/cart', '/checkout'];


const authOnlyRoutes = ['/login', '/register', '/forgot-password'];

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;


  const isProtected = protectedRoutes.some((route) => pathname.startsWith(route));
  if (isProtected && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }


  const isAuthOnly = authOnlyRoutes.some((route) => pathname.startsWith(route));
  if (isAuthOnly && token) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/vendor/:path*',
    '/admin/:path*',
    '/profile/:path*',
    '/bookings/:path*',
    '/cart/:path*',
    '/checkout/:path*',
    '/login',
    '/register',
    '/forgot-password',
  ],
};
