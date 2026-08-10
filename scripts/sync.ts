import { fetchAllConversations } from "@/lib/meta";
import { requireEnv, upsertConversations } from "@/lib/supabase";

async function main() {
  const pageId = requireEnv("FB_PAGE_ID");
  const token = requireEnv("FB_PAGE_ACCESS_TOKEN");

  const startedAt = Date.now();
  console.log(`[sync] fetching conversations for page ${pageId} ...`);

  const rows = await fetchAllConversations(pageId, token);
  const result = await upsertConversations(rows, pageId);

  const elapsed = ((Date.now() - startedAt) / 1000).toFixed(1);
  console.log(
    `[sync] done in ${elapsed}s — ${result.upserted} upserted, ${result.pruned} pruned (total ${rows.length})`,
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(
      "[sync] FAILED:",
      error instanceof Error ? error.message : error,
    );
    process.exit(1);
  });
