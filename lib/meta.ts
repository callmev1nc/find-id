import { type Conversation, requireEnv } from "@/lib/supabase";

type GraphEdge<T> = {
  data: T[];
  paging?: { next?: string };
};

type Participant = { id: string; name?: string };

type ApiConversation = {
  participants: { data: Participant[] };
  snippet?: string;
  updated_time?: string;
  id: string;
};

function apiBase(): string {
  const version = process.env.FB_API_VERSION ?? "v21.0";
  return `https://graph.facebook.com/${version}`;
}

async function fetchWithRetry(url: string, attempts = 3): Promise<Response> {
  let lastError: unknown;
  for (let i = 0; i < attempts; i += 1) {
    try {
      const res = await fetch(url);
      if (res.status === 429 || res.status >= 500) {
        lastError = new Error(`FB returned ${res.status}`);
        await new Promise((resolve) => setTimeout(resolve, 1000 * 2 ** i));
        continue;
      }
      return res;
    } catch (error) {
      lastError = error;
      await new Promise((resolve) => setTimeout(resolve, 1000 * 2 ** i));
    }
  }
  throw lastError;
}

async function getConversationsPage(
  url: string,
  pageId: string,
): Promise<GraphEdge<ApiConversation>> {
  const res = await fetchWithRetry(url);
  const body = (await res.json()) as {
    error?: { message: string };
  } & GraphEdge<ApiConversation>;

  if (!res.ok || body.error) {
    throw new Error(
      body.error?.message ?? `FB request failed with ${res.status}`,
    );
  }
  return body;
}

function otherParticipant(
  thread: ApiConversation,
  pageId: string,
): Participant | undefined {
  return thread.participants?.data?.find((p) => p.id !== pageId);
}

export async function fetchAllConversations(
  pageId: string,
  token: string,
): Promise<Conversation[]> {
  const fields = "participants,snippet,updated_time";
  const url = `${apiBase()}/${pageId}/conversations?platform=messenger&fields=${fields}&access_token=${token}&limit=1000`;

  const out: Conversation[] = [];
  let nextUrl: string | undefined = url;

  while (nextUrl) {
    const page = await getConversationsPage(nextUrl, pageId);
    for (const thread of page.data) {
      const person = otherParticipant(thread, pageId);
      if (!person) continue;
      out.push({
        psid: person.id,
        page_id: pageId,
        name: person.name ?? null,
        snippet: thread.snippet ?? null,
        last_at: thread.updated_time ?? null,
      });
    }
    nextUrl = page.paging?.next;
  }

  return out;
}
