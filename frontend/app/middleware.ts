import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Public routes that don't require authentication
  const publicRoutes = ['/login', '/'];

  // Check if the current route is public
  const isPublicRoute = publicRoutes.includes(request.nextUrl.pathname);

  // Check for auth token in cookies
  const token = request.cookies.get('auth_token');
  const isAuthenticated = !!token;

  // If user is not authenticated and trying to access a protected route
  if (!isAuthenticated && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If user is authenticated but trying to access login page
  if (isAuthenticated && request.nextUrl.pathname === '/login') {
    // Redirect to appropriate dashboard based on role
    // This will be handled by the client-side auth store
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
