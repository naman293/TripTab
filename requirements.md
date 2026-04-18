# TripTab Requirements (Services + MCP Access)

## 1) Authentication (Required)
- Service: **Clerk**
- Needed from you:
  - Clerk Frontend API / Publishable key
  - Clerk Secret key
  - Clerk instance configured with allowed redirect URLs (`http://localhost:5173`, production domain)
- MCP / integration need:
  - Clerk connector / docs MCP (only needed when wiring production callbacks + webhooks)

Notes:
- The “Secured by Clerk” + “Development mode” banner is expected on dev instances/free plans.
- To remove “Development mode”, switch the Clerk instance to production mode.
- To remove Clerk branding (“Secured by Clerk”), you typically need a paid plan/branding settings in Clerk.

## 2) Database (Required for real multi-user data)
Choose one:
- **Supabase Postgres** (recommended for fast setup)
- **Neon + Prisma**
- **PlanetScale + Prisma**

Needed from you:
- DB connection string
- Environment strategy (`.env.local`, deployment secrets)
- Approved schema ownership (who can run migrations)

MCP / integration need:
- **Supabase MCP connector**: run SQL, manage tables/RLS, inspect rows
- **Neon MCP connector** (if Neon chosen): create DBs/branches, run SQL, inspect tables
- **Prisma** (if using Prisma): migration workflow and schema review

## 3) Realtime Sync (Optional)
Options:
- Supabase Realtime
- Pusher
- Ably

Use cases:
- Live expense updates
- Live settlement activity feed
- Member presence in trip rooms
- **Delete-with-consensus approvals across users** (required if you want approval votes to work across different devices)

MCP / integration need:
- Supabase Realtime connector/docs MCP OR Pusher/Ably connector/docs MCP

## 4) File/Media Storage (Optional)
If trip receipts or avatars are uploaded:
- Supabase Storage / S3 / Cloudflare R2

Needed:
- Bucket/container access keys
- Public/private URL policy

MCP / integration need:
- Supabase Storage connector OR S3/R2 connector

## 5) Background Jobs / Notifications (Optional)
For reminders and digest emails:
- Resend / SendGrid (email)
- Upstash QStash / Trigger.dev / Inngest (jobs)

## 6) Analytics + Error Monitoring (Recommended)
- PostHog or Plausible (product analytics)
- Sentry (frontend/backend error monitoring)

## 7) AI + Agent Features
- Not required for TripTab (per current scope).

## 8) Web Scraping / External Data (Only if explicitly needed)
Examples:
- Currency conversion rates
- Public travel cost benchmarks

Needs:
- Legal-approved source list
- Rate-limit policy
- Caching strategy

MCP / integration need:
- Browser/search MCP with approved domains only

## 9) Design/PM Collaboration MCP (Helpful)
- Figma MCP access (for direct design-to-code fidelity)
- Product docs MCP / Notion MCP (requirements syncing)

## 10) Deployment (When Going Live)
Options:
- Vercel
- Netlify
- Cloudflare Pages

MCP / integration need:
- Vercel/Netlify/Cloudflare deployment connector (to set env vars, view logs, manage domains)

## 10) Immediate Build Prerequisites To Continue From Here
1. Clerk keys + approval to integrate Clerk now
2. Database provider choice (Supabase recommended) if you want multi-user sync
3. Decision: keep local mock state vs move to DB now (`yes/no`)
4. Deployment target (Vercel/Netlify/Cloudflare)

## Notes
- Current app uses local mock state for MVP UI validation.
- `npm run dev` is now configured for single-port local development at `http://localhost:5173`.
- Production-style single-server run remains available via:
  - `npm run start:local` -> `http://localhost:8787`
