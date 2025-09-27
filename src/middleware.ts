// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("jwt_token")?.value;
  if (!token && request.nextUrl.pathname.startsWith("/tool/self-assessment")) {
    // You can change this to your login or public page
return NextResponse.redirect(
  new URL("/tool/preparation-and-pre-planning/1/1", request.nextUrl.origin)
);  }
  // Authenticated users can access everything
  return NextResponse.next();
}

export const config = {
  matcher: ["/(.*)"], // Run middleware on all routes
};