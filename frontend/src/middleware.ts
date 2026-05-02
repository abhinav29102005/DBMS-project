import { NextRequest, NextResponse } from 'next/server';

const PUBLIC_PATHS = ['/auth/login', '/auth/register', '/reset-password', '/api/health'];

const ROLE_ROUTES: Record<string, string[]> = {
  student:   ['/student', '/profile/setup'],
  faculty:   ['/faculty', '/profile/setup'],
  admin:     ['/admin'],
  staff:     ['/staff'],
  librarian: ['/admin/library'],
  warden:    ['/admin/hostel'],
};

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (PUBLIC_PATHS.some(p => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const token = req.cookies.get('access_token')?.value;

  if (!token) {
    return NextResponse.redirect(new URL('/auth/login', req.url));
  }

  const payload = decodeJwtPayload(token);

  if (!payload || (payload.exp && Date.now() / 1000 > payload.exp)) {

    const response = NextResponse.redirect(new URL('/auth/login', req.url));
    response.cookies.delete('access_token');
    return response;
  }

  const role = payload.role;

  if (pathname === '/') {
    return NextResponse.redirect(new URL(`/${role}/dashboard`, req.url));
  }

  const allowedPrefixes = ROLE_ROUTES[role as keyof typeof ROLE_ROUTES] ?? [];
  const isAllowed = allowedPrefixes.some(prefix => pathname.startsWith(prefix));

  if (!isAllowed) {

    return NextResponse.redirect(new URL(`/${role}/dashboard`, req.url));
  }

  return NextResponse.next();
}

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

  matcher: ['/((?!_next|favicon.ico|.*\\..*).*)'],
};
