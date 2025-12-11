import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";

export async function middleware(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    const url = new URL("/auth/sign-in", request.url);
    url.searchParams.set("callbackUrl", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  runtime: "nodejs",
  matcher: [
    "/dashboard/:path*",
    "/add-product/:path*",
    "/activity-log/:path*",
    "/inventory/:path*",
    "/sales/:path*",
    "/reports/:path*",
    "/stocks/:path*",
    "/settings/:path*",
    "/categories/:path*",
    "/tags/:path*",
    "/users/:path*",
    "/products/:path*",
    "/suppliers/:path*",
  ],
};
