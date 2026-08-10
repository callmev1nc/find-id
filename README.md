# Find ID — Facebook chat opener

Search a customer by name and jump **straight into their Meta Business Inbox chat**.

## How it works

1. A scheduled job (GitHub Actions, hourly) pulls the page's Messenger conversations from the
   Meta Graph API using a **Page Access Token**.
2. It stores each conversation in Supabase: `name`, `selected_item_id` (PSID), last message, time.
3. The team opens the web app, types a name, and clicks **Open chat** — the button builds a
   `business.facebook.com/latest/inbox/all?...&selected_item_id=<psid>...` URL that opens the
   exact conversation.

> Limitation: Facebook's API returns the participant **name** only — lookups by phone/email are
> not possible. Every person who has ever messaged the page will appear.

## Stack

- Next.js 16 (App Router) + TypeScript
- Supabase (Postgres) — one table `conversations`
- Meta Graph API — read conversations
- GitHub Actions — hourly sync

## Setup

### 1. Supabase

1. Create a project at https://supabase.com.
2. Open the **SQL editor** and run `supabase/schema.sql` (creates the `conversations` table).
3. Grab `Project Settings → API` → **Project URL** and **service_role key**.

### 2. Meta Page Access Token (coworker — the one with the Facebook app)

1. Go to https://developers.facebook.com/apps and open the app (or create one: type **Business**,
   add the **Messenger** product).
2. In the app, `App settings → Roles → Team members`, make sure the page admin is an **Admin**.
3. Open the **Graph API Explorer**: https://developers.facebook.com/tools/explorer
   - Top right, pick your app.
   - `Get token → Get User Access Token` and for permissions select:
     - `pages_read_engagement`
     - `pages_messaging`
   - Click **Generate Access Token** and allow the popup.
4. Call `GET /me/accounts` to list your pages, and copy the **access_token** of your page
   (`956008030922040`).
5. That token is **short-lived**. Exchange it for a long-lived one in your browser:
   ```
   https://graph.facebook.com/v21.0/oauth/access_token?grant_type=fb_exchange_token&client_id=<APP_ID>&client_secret=<APP_SECRET>&fb_exchange_token=<SHORT_LIVED_PAGE_TOKEN>
   ```
   The returned long-lived page token effectively never expires.
6. Send the long-lived token to whoever deploys this app. Keep it secret — it can read all page
   messages.

### 3. Environment variables

Copy `.env.example` to `.env` and fill in:

| Variable | Meaning |
|---|---|
| `FB_PAGE_ACCESS_TOKEN` | Long-lived page token from step 2 |
| `FB_PAGE_ID` | `956008030922040` |
| `FB_BUSINESS_ID` | `709872714288560` |
| `FB_API_VERSION` | `v21.0` (optional, default) |
| `SUPABASE_URL` | From Supabase project settings |
| `SUPABASE_SERVICE_KEY` | service_role key (server-side only — never exposed) |
| `APP_PASSWORD` | Shared password team members use to log in |

### 4. Run the sync

```bash
npm install
npm run sync        # pulls all conversations into Supabase
npm run check       # Biome lint + tsc
npm run dev         # local web app
```

## Deploy

### Vercel (web app)

Deploy the repo to Vercel and add **all env vars above** in `Settings → Environment Variables`.
`APP_PASSWORD` shows the `/setup` page until it is set.

### GitHub Actions (hourly sync)

Push to GitHub, then in the repo settings add:

- **Secrets**: `FB_PAGE_ACCESS_TOKEN`, `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`
- **Variables**: `FB_PAGE_ID`, `FB_BUSINESS_ID`, `FB_API_VERSION`

The workflow `.github/workflows/sync.yml` runs `npm run sync` at minute 17 of every hour. You can
also trigger it manually via the **Actions → sync-fb-conversations → Run workflow** button.

## Project layout

```
app/
  page.tsx            search UI + Open chat buttons
  login/              shared-password login
  setup/              shown when APP_PASSWORD missing
  api/login|logout|search/
middleware.ts         password gate (Node runtime)
lib/
  supabase.ts         DB client + search/upsert
  meta.ts             Graph API conversation fetch (paginated)
  link.ts             builds the inbox deep-link URL
scripts/sync.ts       sync entry point (hourly cron)
supabase/schema.sql   table DDL
.github/workflows/sync.yml
```