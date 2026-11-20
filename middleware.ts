import { NextResponse, type NextRequest } from "next/server";

import { COOKIE_ACCESS_TOKEN } from "@/constants/cookie";

const PRIVATE_ROUTES = [
  "/profile",
  "/favorites",
  "/sell/create",
  "/sell/edit",
  "/orders",
  "/chat",
  "/notifications",
];
const GUEST_ROUTES = ["/login", "/register"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAuthorized = Boolean(request.cookies.get(COOKIE_ACCESS_TOKEN));

  const isPrivate = PRIVATE_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

  if (isPrivate && !isAuthorized) {
    const url = new URL("/login", request.url);

    url.searchParams.set("from", pathname);

    return NextResponse.redirect(url);
  }

  if (isAuthorized && GUEST_ROUTES.includes(pathname)) {
    const returnUrl =
      request.nextUrl.searchParams.get("returnUrl") ??
      request.nextUrl.searchParams.get("from");
    const target =
      returnUrl && returnUrl.startsWith("/") && !returnUrl.startsWith("//")
        ? returnUrl
        : "/profile";

    return NextResponse.redirect(new URL(target, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/profile/:path*",
    "/favorites",
    "/sell/create",
    "/sell/edit/:path*",
    "/orders/:path*",
    "/chat",
    "/chat/:path*",
    "/notifications",
    "/login",
    "/register",
  ],
};
