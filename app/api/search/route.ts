import { buildInboxUrl } from "@/lib/link";
import { requireEnv, searchConversations } from "@/lib/supabase";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q") ?? "";
  try {
    const pageId = requireEnv("FB_PAGE_ID");
    const businessId = requireEnv("FB_BUSINESS_ID");
    const rows = await searchConversations(query, 200);
    const results = rows.map((row) => ({
      ...row,
      inboxUrl: buildInboxUrl({ pageId, businessId, psid: row.psid }),
    }));
    return NextResponse.json({ results });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Search failed" },
      { status: 500 },
    );
  }
}
