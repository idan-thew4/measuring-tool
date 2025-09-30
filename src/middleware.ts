// src/middleware.ts
import { NextResponse, NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const token = request.cookies.get("jwt_token")?.value;
  const publicPage = "/tool/0/0/preparation-and-pre-planning/1/1";
  // console.log(token)
  // if (!token && url.pathname !== publicPage) {
  //   return NextResponse.redirect(new URL(publicPage, url.origin));
  // }

  return NextResponse.next();

}

  // Authenticated user logic


