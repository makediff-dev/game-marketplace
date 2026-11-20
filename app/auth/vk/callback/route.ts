import { NextResponse, type NextRequest } from "next/server";

// Sign-in runs in the VK popup; a redirect only brings an error back,
// and the login page shows it.
export function GET(request: NextRequest) {
  const target = new URL("/login", request.url);
  const error = request.nextUrl.searchParams.get("error");

  if (error) {
    target.searchParams.set("vk", error.slice(0, 64));
  }

  return NextResponse.redirect(target);
}
