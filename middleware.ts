import { createHash, timingSafeEqual } from "node:crypto";
import { type NextRequest, NextResponse } from "next/server";

function sessionToken(secret: string): Buffer {
  return createHash("sha256").update(secret).digest();
}

export function middleware(request: NextRequest) {
  const secret = process.env.APP_PASSWORD ?? "";
  if (!secret) {
    return NextResponse.redirect(new URL("/setup", request.url));
  }

  const expected = sessionToken(secret);
  const sent = request.cookies.get("app_auth")?.value;
  const actual = sent ? Buffer.from(sent, "hex") : Buffer.alloc(0);

  const authed =
    actual.length === expected.length && timingSafeEqual(actual, expected);

  if (!authed && request.nextUrl.pathname !== "/login") {
    const url = new URL("/login", request.url);
    if (request.nextUrl.pathname === "/") url.searchParams.set("next", "/");
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|login|setup|api/login|api/logout).*)",
  ],
};

export const runtime = "nodejs";
