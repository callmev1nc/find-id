import { createHash, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";

export function POST(request: Request) {
  return request
    .json()
    .then(async ({ password }: { password?: string }) => {
      const secret = process.env.APP_PASSWORD ?? "";
      const expected = createHash("sha256").update(secret).digest();
      const actual = createHash("sha256")
        .update(password ?? "")
        .digest();

      const ok =
        expected.length === actual.length && timingSafeEqual(expected, actual);

      if (!ok) {
        return NextResponse.json({ error: "Wrong password" }, { status: 401 });
      }

      const response = NextResponse.json({ ok: true });
      response.cookies.set("app_auth", expected.toString("hex"), {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 24 * 14,
      });
      return response;
    })
    .catch(() => NextResponse.json({ error: "Bad request" }, { status: 400 }));
}
