import { NextRequest, NextResponse } from 'next/server';

// Public routes — no auth required
const PUBLIC_ROUTES = ['/', '/login', '/register', '/products', '/categories', '/about', '/contact'];

// Admin-only routes
const ADMIN_ROUTES = ['/admin'];

// User-auth routes (logged in, but not necessarily admin)
const PRIVATE_ROUTES = ['/cart', '/checkout', '/orders', '/payment-upload', '/dashboard'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('token')?.value;
  const role = request.cookies.get('role')?.value;

  // Allow public routes always
  const isPublic = PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith('/products') || pathname.startsWith('/categories')
  );
  if (isPublic) {
    const response = NextResponse.next();
    response.headers.set('x-middleware-cache', 'no-cache');
    return response;
  }

  // Admin routes — must be ADMIN
  const isAdminRoute = ADMIN_ROUTES.some((route) => pathname.startsWith(route));
  if (isAdminRoute) {
    if (!token) {
      const response = NextResponse.redirect(new URL('/login?redirect=' + pathname, request.url));
      response.headers.set('x-middleware-cache', 'no-cache');
      response.headers.set('Cache-Control', 'no-store, max-age=0, must-revalidate');
      return response;
    }
    if (role !== 'ADMIN') {
      const response = NextResponse.redirect(new URL('/?error=unauthorized', request.url));
      response.headers.set('x-middleware-cache', 'no-cache');
      response.headers.set('Cache-Control', 'no-store, max-age=0, must-revalidate');
      return response;
    }
    const response = NextResponse.next();
    response.headers.set('x-middleware-cache', 'no-cache');
    return response;
  }

  // Private user routes — must be logged in
  const isPrivate = PRIVATE_ROUTES.some((route) => pathname.startsWith(route));
  if (isPrivate) {
    if (!token) {
      const response = NextResponse.redirect(new URL('/login?redirect=' + pathname, request.url));
      response.headers.set('x-middleware-cache', 'no-cache');
      response.headers.set('Cache-Control', 'no-store, max-age=0, must-revalidate');
      return response;
    }
    const response = NextResponse.next();
    response.headers.set('x-middleware-cache', 'no-cache');
    return response;
  }

  const response = NextResponse.next();
  response.headers.set('x-middleware-cache', 'no-cache');
  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
