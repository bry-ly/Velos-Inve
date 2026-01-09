import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";

/**
 * Security headers to add to all responses
 */
const securityHeaders = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
} as const;

/**
 * Add security headers to response
 */
function addSecurityHeaders(response: NextResponse): NextResponse {
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  return response;
}

export async function middleware(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    const url = new URL("/auth/sign-in", request.url);
    url.searchParams.set("callbackUrl", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  // Create response with security headers
  const response = NextResponse.next();
  return addSecurityHeaders(response);
}

export const config = {
  runtime: "nodejs",
  // Protect all routes except public ones
  // Using negative lookahead to exclude: api, _next, static assets, auth, demo, root
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - auth/* (authentication pages)
     * - demo (demo page)
     * - / (root/landing page - empty string after $)
     * - onboarding (onboarding page - needs to be accessible before company setup)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|auth|demo|onboarding|$).*)',
  ],
};
