// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {

    if (request.nextUrl.pathname === "/tool/preparation-and-pre-planning/1/1") {
    return NextResponse.next();
  }

  const token = request.cookies.get("jwt_token")?.value;

  console.log("Middleware token:", token);

  if (!token) {
    // Redirect to login or registration if jwt_token is missing
    return NextResponse.redirect(new URL("/tool/preparation-and-pre-planning/1/1", request.url));
  }

  // Allow the request to continue if jwt_token exists
  return NextResponse.next();
}

export const config = {
  matcher: ["/tool/:path*"], // Adjust to match your protected routes
};