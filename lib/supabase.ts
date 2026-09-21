import { createClient } from "@supabase/supabase-js";

export type Conversation = {
  psid: string;
  page_id: string;
  name: string | null;
  snippet: string | null;
  last_at: string | null;
};

export function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

export function getSupabase() {
  const url = requireEnv("SUPABASE_URL");
  const key = requireEnv("SUPABASE_SERVICE_KEY");
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function upsertConversations(
  rows: Conversation[],
  pageId: string,
): Promise<{ upserted: number; pruned: number }> {
  if (rows.length === 0) return { upserted: 0, pruned: 0 };

  const db = getSupabase();
  const syncStartedAt = new Date().toISOString();
  const { error } = await db.from("conversations").upsert(
    rows.map((row) => ({
      ...row,
      page_id: pageId,
      updated_at: syncStartedAt,
    })),
    { onConflict: "psid" },
  );
  if (error) throw error;

  // Prune by staleness (updated_at older than this run) rather than a
  // `not in (psids)` list: with thousands of PSIDs that filter is encoded
  // into the request URL and can blow past URL/header size limits.
  const { error: pruneError, count } = await db
    .from("conversations")
    .delete({ count: "exact" })
    .eq("page_id", pageId)
    .lt("updated_at", syncStartedAt);
  if (pruneError) throw pruneError;

  return { upserted: rows.length, pruned: count ?? 0 };
}

export async function searchConversations(
  query: string,
  limit = 100,
): Promise<Conversation[]> {
  const db = getSupabase();
  const trimmed = query.trim();
  let builder = db
    .from("conversations")
    .select("psid, page_id, name, snippet, last_at")
    .order("last_at", { ascending: false })
    .limit(limit);

  if (trimmed.length > 0) {
    builder = builder.ilike("name", `%${trimmed}%`);
  }

  const { data, error } = await builder;
  if (error) throw error;
  return (data ?? []) as Conversation[];
}
