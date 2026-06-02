# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> **Important:** This version of Next.js may have breaking changes from training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any Next.js-specific code, and heed deprecation notices.

## Commands

```bash
npm run dev      # Development server (Turbopack)
npm run build    # Production build
npm run start    # Production server
npm run lint     # ESLint
```

There is no test suite.

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=       # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=  # Supabase anon key (public)
GROQ_API_KEY=                    # Groq LLM API key (server-side only)
```

## Architecture

**Meeting Summarizer** is a Next.js 16 App Router app for AI-powered meeting note summarization.

### Routing & Auth Flow

- `/(auth)` — public routes: login, signup, forgot-password, reset-password
- `/(dashboard)/meetings` — protected routes; guarded by `/proxy.ts` (the middleware file — named `proxy.ts` instead of `middleware.ts`)
- Middleware redirects unauthenticated requests to `/login` by checking Supabase session cookies

### Data Layer

**Supabase (PostgreSQL + Auth + RLS)** — full schema in [`schema.sql`](schema.sql)

Two tables, both with Row Level Security scoped to `auth.uid()`:

- `meetings` — `id`, `user_id`, `title`, `meeting_date`, `raw_notes`, `ai_summary`, `ai_decisions` (pipe-delimited string), `created_at`, `updated_at`
- `action_items` — `id`, `meeting_id`, `task`, `owner`, `due_date`, `is_done`, `created_at`

Supabase client helpers live in `lib/supabase.ts`. All API routes create a per-request Supabase client with the user's cookie-based session for RLS enforcement.

### API Routes

| Method | Path | Purpose |
|--------|------|---------|
| GET/POST | `/api/meetings` | List or create meetings |
| GET/PATCH/DELETE | `/api/meetings/[id]` | Fetch, rename, or delete |
| PATCH | `/api/action-items/[id]` | Toggle `is_done` |
| POST | `/api/ai/summarize` | Run Groq summarization |

The AI endpoint (`/api/ai/summarize`) calls Groq with LLaMA 3.3 70B and returns structured JSON: `{ summary, decisions[], action_items[] }`. It is not behind auth middleware (called client-side during note submission).

### State & Cross-Component Communication

No global state library. Components use `useState` locally. The sidebar refreshes its meeting list by listening for a `window.dispatchEvent(new Event('meeting-saved'))` fired after a meeting is created or updated — this is the intentional cross-component communication pattern used here.

### UI

- Tailwind CSS 4 + shadcn/ui (Base Nova style, configured in `components.json`)
- Dark theme with purple/lavender accent (`#6c63ff`) defined as CSS variables in `app/globals.css`
- Fonts: Syne (headings) + DM Sans (body) via Google Fonts in `app/layout.tsx`
- Path alias `@/*` maps to the repo root
