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

  // Redirect disabled user routes to homepage
  const isDisabledUserRoute = ['/cart', '/checkout', '/orders', '/payment-upload'].some((route) => pathname.startsWith(route));
  if (isDisabledUserRoute) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Redirect disabled admin routes to admin dashboard
  const isDisabledAdminRoute = ['/admin/orders', '/admin/payments', '/admin/users'].some((route) => pathname.startsWith(route));
  if (isDisabledAdminRoute) {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  // Allow public routes always
  const isPublic = PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith('/products') || pathname.startsWith('/categories')
  );
  if (isPublic) return NextResponse.next();

  // Admin routes — must be ADMIN
  const isAdminRoute = ADMIN_ROUTES.some((route) => pathname.startsWith(route));
  if (isAdminRoute) {
    if (!token) {
      return NextResponse.redirect(new URL('/login?redirect=' + pathname, request.url));
    }
    if (role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/?error=unauthorized', request.url));
    }
    return NextResponse.next();
  }

  // Private user routes — must be logged in
  const isPrivate = PRIVATE_ROUTES.some((route) => pathname.startsWith(route));
  if (isPrivate) {
    if (!token) {
      return NextResponse.redirect(new URL('/login?redirect=' + pathname, request.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
