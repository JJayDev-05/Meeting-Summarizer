# Meeting Summarizer — AI Meeting Notes Summarizer

> Paste messy meeting notes. Get a clean summary, key decisions, and action items with owners — in seconds.

**[Live Demo →](https://meeting-summarizer-phi-sepia.vercel.app/)**

![Meeting Summarizer](public/logo.png)

---

## Overview

Meeting Summarizer solves the most painful part of meetings: the aftermath. Instead of manually writing up notes, assigning tasks, and chasing people for what was decided, you paste your raw notes and the AI does it instantly.

Built as a full-stack portfolio project demonstrating end-to-end product thinking — from auth and database design to AI integration and production-ready UI.

---

## Features

- **AI Summarization** — Paste raw notes, get a 3–5 sentence summary via Groq (LLaMA 3.3 70B)
- **Decision extraction** — Key decisions pulled out and displayed as chips
- **Action items + owners** — Tasks parsed with assigned owners, ready to track
- **Check off action items** — Mark tasks done with optimistic UI updates
- **Meeting history** — All meetings saved, searchable, accessible from sidebar
- **Rename & delete meetings** — Inline rename with keyboard support
- **Inline editing** — Edit meeting title, date, and notes directly on the detail page
- **Re-summarize** — Re-run AI on edited notes with one click
- **Delete confirmation** — Modal confirmation before deleting meetings
- **Empty state** — Helpful onboarding for first-time users
- **Auth** — Email/password signup, login, forgot password, reset password (PKCE flow)
- **Row Level Security** — Every user only sees their own data via Supabase RLS
- **Mobile responsive** — Collapsible sidebar with hamburger menu on small screens
- **Error boundary** — Graceful recovery screen on unexpected crashes

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| AI | Groq API (LLaMA 3.3 70B) |
| Styling | Tailwind CSS + custom CSS design system |
| Fonts | Syne + DM Sans (Google Fonts via Next.js) |
| Deployment | Vercel |

---

## Database Schema

```sql
-- Users managed by Supabase Auth

-- Meetings
meetings (
  id uuid PK,
  user_id uuid FK → auth.users,
  title text,
  meeting_date date,
  raw_notes text,
  ai_summary text,
  ai_decisions text,
  created_at timestamptz,
  updated_at timestamptz
)

-- Action items
action_items (
  id uuid PK,
  meeting_id uuid FK → meetings,
  task text,
  owner text,
  due_date date,
  is_done boolean,
  created_at timestamptz
)
```

Row Level Security enabled on both tables — users only access their own data.

---

## Getting Started

### Prerequisites
- Node.js 18+
- A Supabase project
- A Groq API key (free at console.groq.com)

### Installation

```bash
git clone https://github.com/JJayDev-05/Meeting-Summarizer.git
cd Meeting-Summarizer
npm install
```

### Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GROQ_API_KEY=your_groq_api_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Database Setup

Run this SQL in your Supabase SQL editor:

```sql
CREATE TABLE meetings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  meeting_date date,
  raw_notes text,
  ai_summary text,
  ai_decisions text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE action_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id uuid REFERENCES meetings(id) ON DELETE CASCADE NOT NULL,
  task text NOT NULL,
  owner text,
  due_date date,
  is_done boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE action_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users own their meetings"
  ON meetings FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users own their action items"
  ON action_items FOR ALL
  USING (meeting_id IN (
    SELECT id FROM meetings WHERE user_id = auth.uid()
  ));
```

### Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Project Structure

app/
(auth)/          # Login, signup, forgot/reset password
(dashboard)/
    meetings/
        layout.tsx   # Persistent sidebar layout
        new/         # New meeting + AI summarize
        [id]/        # Meeting detail page
api/
    meetings/      # CRUD endpoints
    action-items/  # Toggle done/undone
    ai/summarize/  # Groq AI endpoint
components/
    Sidebar.tsx      # Collapsible sidebar with search + recents
    SearchModal.tsx  # Full search modal
    Toast.tsx        # Toast notifications
    PageLoader.tsx   # Loading states
hooks/
    useToast.ts      # Toast hook
---

## Why I Built This

Every company has meetings. Every meeting has follow-up chaos unclear notes, forgotten decisions, action items that fall through the cracks. Meeting Summarizer automates the most painful 30 minutes after every meeting.

This project demonstrates:
- Full-stack Next.js with App Router and Server Components
- Real AI integration (not just a wrapper — structured JSON output parsing)
- Production auth with JWT, RLS, and password reset flow
- Clean UI/UX decisions built from scratch without a component library

---

## Author

**Joebert Jay Jimena**
Full-stack developer

[GitHub](https://github.com/JJayDev-05)