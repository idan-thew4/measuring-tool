// src/middleware.ts
import { NextResponse, NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  return NextResponse.next();

}

  // Authenticated user logic


export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api|icons|svg).*)"
  ],
};