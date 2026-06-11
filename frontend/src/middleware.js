import { NextResponse } from 'next/server';

export function middleware(request) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  const isAuthRoute = pathname === '/signin' || pathname === '/signup';
  const isProtectedRoute = pathname === '/dashboard' || pathname === '/';

  if (!token && isProtectedRoute) {
    return NextResponse.redirect(new URL('/signin', request.url));
  }

  if (token && isAuthRoute) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  if (token && pathname === '/') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/dashboard', '/signin', '/signup'],
};
