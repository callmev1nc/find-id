import { type NextRequest, NextResponse } from "next/server";

export function GET(request: NextRequest) {
  const url = new URL("/login", request.url);
  const response = NextResponse.redirect(url);
  response.cookies.set("app_auth", "", { path: "/", maxAge: 0 });
  return response;
}
