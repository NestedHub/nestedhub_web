import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Public routes that don't require authentication
  const publicRoutes = ['/login', '/admin/login', '/', '/favicon.ico'];
  
  // Assets and API routes should be ignored
  const ignoredRoutes = ['/api', '/_next', '/static', '/images'];
  
  // Check if the current route should be ignored
  const shouldIgnore = ignoredRoutes.some(route => request.nextUrl.pathname.startsWith(route));
  if (shouldIgnore) {
    return NextResponse.next();
  }

  // Check if the current route is public
  const isPublicRoute = publicRoutes.some(route => request.nextUrl.pathname === route);

  // Get authentication data
  const authToken = request.cookies.get('auth_token');
  const user = request.cookies.get('user');
  let isAuthenticated = false;
  let userRole = null;

  if (authToken && user) {
    try {
      const userData = JSON.parse(user.value);
      isAuthenticated = true;
      userRole = userData.role;
    } catch (error) {
      console.error('Error parsing user data:', error);
    }
  }

  // If user is not authenticated and trying to access a protected route
  if (!isAuthenticated && !isPublicRoute) {
    // Redirect admin routes to admin login, others to main login
    if (request.nextUrl.pathname.startsWith('/admin')) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If user is authenticated but trying to access login pages
  if (isAuthenticated) {
    if (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/admin/login') {
      // Redirect based on user role
      let redirectUrl = '/';
      
      switch (userRole) {
        case 'admin':
          redirectUrl = '/admin/dashboard';
          break;
        case 'property_owner':
          redirectUrl = '/propertyowner/dashboard';
          break;
        case 'customer':
          redirectUrl = '/user';
          break;
      }
      return NextResponse.redirect(new URL(redirectUrl, request.url));
    }
  }

  // Protect admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!isAuthenticated || userRole !== 'admin') {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  // Protect property owner routes
  if (request.nextUrl.pathname.startsWith('/propertyowner')) {
    if (!isAuthenticated || userRole !== 'property_owner') {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Allow the request to proceed
  return NextResponse.next();
}

// Configure the middleware to run on specific paths
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
