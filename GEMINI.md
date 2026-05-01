# spurs-split-dash - Gemini CLI Context

This project is a high-performance, dual-view dashboard for Tottenham Hotspur, providing "Equal Billing" to the Men's and Women's teams. It's built with Next.js 14 (App Router) and utilizes a server-side caching layer with Supabase for cost-effective operation.

## Project Overview

- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS.
- **Backend/Infrastructure:** Supabase (Database & Cache), Vercel (Hosting).
- **Core Logic:**
    - **Match-State Governor:** A custom utility (`src/lib/governance.ts`) that manages API request frequencies based on match states (15m for live matches, 12h for idle periods) to stay within free tier limits.
    - **Data Aggregation:** Integrates API-Football, Brave Search API (News), and SportAPI7 (via RapidAPI) for deep analytics.
- **UI Architecture:** A 50/50 vertical split on desktop (Men Left in "Spurs Navy" / Women Right in "Lilywhite"). Icons are powered by `lucide-react`.

## Critical Findings & Data IDs

### Correct Team & League IDs
Initial plans often reference incorrect IDs. Use these verified values:

**API-Football (api-sports.io):**
- **Spurs Men:** Team ID `47`, League ID `39` (Premier League)
- **Spurs Women:** Team ID `4899`, League ID `38` (FA WSL)

**SportAPI7 (RapidAPI / SofaScore):**
- **Spurs Men:** Team ID `33`, Season ID `66441` (PL 25/26)
- **Spurs Women:** Team ID `2599`, Season ID `71101` (WSL 25/26)

### API Plan Restrictions (API-Football)
The Free plan has significant limitations that require manual workarounds:
1. **Blocked Parameters:** The `next` and `last` fixture parameters are often blocked.
2. **Season Access:** The current season (e.g., 2025) may be restricted, requiring fallbacks to 2024.
3. **Workaround:** Always fetch the full season fixtures and filter locally by date (`new Date()`) to find the next/last match. This logic is implemented directly in `src/app/page.tsx` due to library permission restrictions.

## Building and Running

### Prerequisites
- Node.js (v18+ recommended)
- Supabase Project with `api_cache` table initialized.

### Key Commands
- `npm run dev`: Starts the local development server.
- `npm run build`: Creates an optimized production build.
- `npm run start`: Starts the production server.
- `npm run lint`: Runs ESLint for code quality checks.

### Environment Variables
The following keys are required in both `.env.local` and Vercel:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `API_FOOTBALL_KEY`
- `BRAVE_API_KEY`
- `RAPID_API_KEY`

## Development Conventions

### Architecture & Patterns
- **Server Components:** Prefer React Server Components for data fetching (see `src/app/page.tsx`).
- **Caching Layer:** All external API calls MUST wrap around the `fetchWithGovernance` utility to ensure database-backed caching and usage limit protection.
- **Styling:** Use Tailwind CSS utility classes. Themes are strictly split between Men's (#132257) and Women's (#FFFFFF) views.

### Safety Guards
- **Hard Stop:** The system includes a hard stop at 95 daily API requests. When triggered, the app serves stale cache only and displays a "Data Saving Mode" banner.

### Database Schema
The Supabase `api_cache` table must follow this structure:
```sql
CREATE TABLE api_cache (
  key TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```
