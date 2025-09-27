import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("your-cookie-name")?.value;


//   if (!token) {
//     // Redirect to your desired page if token is missing
//     return NextResponse.redirect(new URL("/tool/preparation-and-pre-planning/1/1", request.url));
//   }

  // Optionally, validate the token with an external API here

//   return NextResponse.next();
}

export const config = {
  matcher: ["/tool/:path*"], // Only run on /tool routes
};