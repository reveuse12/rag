import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const SUPER_ADMIN_EMAILS = [
  'prayag129787@gmail.com',
  'prayagbagtharia@gmail.com',
];

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // 1. Static assets and Next.js internal routes
  if (
    path.startsWith('/_next') ||
    path.startsWith('/api/auth') ||
    path.startsWith('/api/trends') ||
    path.startsWith('/api/groups') ||
    path.startsWith('/api/meetups') ||
    path === '/favicon.ico' ||
    path === '/sitemap.xml' ||
    path === '/robots.txt' ||
    path === '/manifest.json' ||
    path === '/llms.txt' ||
    path === '/llms-full.txt'
  ) {
    return NextResponse.next();
  }

  // 2. Public web pages (no login required)
  const isPublicRoute =
    path === '/' ||
    path === '/grievance' ||
    path.startsWith('/auth/');

  // Auth tokens from cookies
  const authToken = request.cookies.get('auth_token')?.value;
  const userEmail = request.cookies.get('user_email')?.value?.toLowerCase();
  const userRole = request.cookies.get('user_role')?.value?.toLowerCase();

  // Supabase auth cookies check
  const hasSbSession = Array.from(request.cookies.getAll()).some(c => 
    c.name.startsWith('sb-') && c.name.endsWith('-auth-token')
  );

  const isAuthenticated = Boolean(authToken || userEmail || hasSbSession);

  // 3. Strict Admin Route Protection
  if (path.startsWith('/admin')) {
    if (!isAuthenticated) {
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('redirect', path);
      return NextResponse.redirect(loginUrl);
    }

    const isAdmin =
      (userEmail && SUPER_ADMIN_EMAILS.includes(userEmail)) ||
      userRole === 'admin';

    if (!isAdmin) {
      // Authenticated user but not admin: redirect to dashboard
      const dashboardUrl = new URL('/dashboard', request.url);
      return NextResponse.redirect(dashboardUrl);
    }

    return NextResponse.next();
  }

  // 4. If logged in and visiting login/signup, redirect to dashboard
  if (isAuthenticated && (path === '/auth/login' || path === '/auth/signup')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // 5. Public routes: allow access
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // 6. Protected Member Routes (/dashboard, /groups, /meetups, /map, /profile, etc.)
  if (!isAuthenticated) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('redirect', path);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};

