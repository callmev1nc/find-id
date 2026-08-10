"use client";

import {
  type FormEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

type Result = {
  psid: string;
  name: string | null;
  snippet: string | null;
  last_at: string | null;
  inboxUrl: string;
};

function formatTime(iso: string | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const now = Date.now();
  const diff = now - date.getTime();
  if (diff < 60_000) return "just now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

const EMOJI = "👉";

export default function SearchPage() {
  const [results, setResults] = useState<Result[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const runSearch = useCallback(async (q: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const body = (await res.json()) as { results?: Result[]; error?: string };
      if (!res.ok || !body.results) {
        throw new Error(body.error ?? "Search failed");
      }
      setResults(body.results);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed");
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      void runSearch(query);
    }, 250);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, runSearch]);

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (debounceRef.current) clearTimeout(debounceRef.current);
    void runSearch(query);
  }

  return (
    <main style={{ maxWidth: 820, margin: "0 auto", padding: "24px 16px" }}>
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 20,
        }}
      >
        <div>
          <h1 style={{ fontSize: 22 }}>Find ID</h1>
          <p style={{ color: "#6b7280", fontSize: 13, marginTop: 2 }}>
            Search a customer name — click to jump straight to the chat.
          </p>
        </div>
        <a
          href="/api/logout"
          style={{
            fontSize: 13,
            color: "#6b7280",
            textDecoration: "underline",
          }}
        >
          Log out
        </a>
      </header>

      <form
        onSubmit={onSubmit}
        style={{ marginBottom: 20, display: "flex", gap: 8 }}
      >
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Type a customer name…"
          style={{
            flex: 1,
            padding: "12px 14px",
            borderRadius: 10,
            border: "1px solid #d1d5db",
            background: "#fff",
            fontSize: 15,
          }}
        />
      </form>

      {loading && <p style={{ color: "#6b7280", fontSize: 14 }}>Searching…</p>}
      {!loading && error && (
        <p style={{ color: "#dc2626", fontSize: 14 }}>{error}</p>
      )}
      {!loading && !error && results.length === 0 && (
        <p style={{ color: "#6b7280", fontSize: 14 }}>
          {query.trim()
            ? "No matching conversations."
            : "Type a name above to find conversations."}
        </p>
      )}

      {!loading &&
        results.map((row) => (
          <div
            key={row.psid}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              background: "#fff",
              border: "1px solid #e3e5e8",
              borderRadius: 10,
              padding: "12px 16px",
              marginBottom: 8,
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>
                {row.name ?? "Unnamed"}
              </div>
              <div
                style={{
                  color: "#6b7280",
                  fontSize: 13,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {row.snippet || "No messages yet"}
              </div>
            </div>
            <div
              style={{
                fontSize: 12,
                color: "#9ca3af",
                whiteSpace: "nowrap",
                alignSelf: "flex-start",
                paddingTop: 2,
              }}
            >
              {formatTime(row.last_at)}
            </div>
            <a
              href={row.inboxUrl}
              target="_blank"
              title={`Open chat with ${row.name ?? "customer"}`}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                whiteSpace: "nowrap",
                padding: "8px 16px",
                borderRadius: 8,
                background: "#e7f3ff",
                color: "#0866ff",
                fontWeight: 600,
                fontSize: 14,
              }}
              rel="noreferrer"
            >
              {EMOJI} Open chat
            </a>
          </div>
        ))}
    </main>
  );
}
