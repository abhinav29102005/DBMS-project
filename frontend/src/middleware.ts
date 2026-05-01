import { NextRequest, NextResponse } from 'next/server';

const PUBLIC_PATHS = ['/login', '/reset-password', '/api/health'];

const ROLE_ROUTES: Record<string, string[]> = {
  student:   ['/student'],
  faculty:   ['/faculty'],
  admin:     ['/admin'],
  librarian: ['/admin/library'],
  warden:    ['/admin/hostel'],
};

/**
 * Edge Middleware for authentication and role-based access control.
 * Runs on Cloudflare Pages (Edge Runtime).
 */
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow public paths
  if (PUBLIC_PATHS.some(p => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const token = req.cookies.get('access_token')?.value;

  // Redirect to login if no token
  if (!token) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // Decode JWT payload (no verification here - the API handles that)
  const payload = decodeJwtPayload(token);
  
  if (!payload || (payload.exp && Date.now() / 1000 > payload.exp)) {
    // Token expired or invalid
    const response = NextResponse.redirect(new URL('/login', req.url));
    response.cookies.delete('access_token');
    return response;
  }

  const role = payload.role;

  // Root redirect based on role
  if (pathname === '/') {
    return NextResponse.redirect(new URL(`/${role}/dashboard`, req.url));
  }

  // Role-based route guard
  const allowedPrefixes = ROLE_ROUTES[role as keyof typeof ROLE_ROUTES] ?? [];
  const isAllowed = allowedPrefixes.some(prefix => pathname.startsWith(prefix));

  if (!isAllowed) {
    // Unauthorized access to a role-specific route
    return NextResponse.redirect(new URL(`/${role}/dashboard`, req.url));
  }

  return NextResponse.next();
}

/**
 * Decodes the JWT payload without verification.
 */
function decodeJwtPayload(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export const config = {
  // Match all routes except static files, _next, and favicon
  matcher: ['/((?!_next|favicon.ico|.*\\..*).*)'],
};
