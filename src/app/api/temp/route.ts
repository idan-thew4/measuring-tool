import { NextResponse } from "next/server"; 
import structure  from "../../../../public/data/content-placeholder.json";

export async function GET() {
  // You can edit this response body as needed
  return NextResponse.json( structure );
}

export async function POST(request: Request) {
  const body = await request.json();
  // You can edit this logic and response
  return NextResponse.json({ received: body });
}