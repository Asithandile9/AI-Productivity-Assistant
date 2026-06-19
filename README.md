# AI Workplace Productivity Assistant

## Project Overview

The AI Workplace Productivity Assistant is a modern SaaS web application that helps professionals automate everyday workplace tasks using AI. It combines a clean, Notion/Linear-inspired dashboard with practical AI tools for writing emails, summarizing meetings, planning tasks, conducting research, and conversing with an AI assistant — all in one workspace.

## Features

- **Smart Email Composer** — draft professional emails by purpose, recipient, and tone
- **Meeting Notes Summarizer** — turn transcripts into executive summaries and action items
- **AI Task Planner** — generate schedules and an Eisenhower priority matrix
- **Research Assistant** — extract key insights and facts from any topic or text
- **AI Chatbot** — streaming conversational assistant with markdown support
- **Dashboard** — at-a-glance stats, quick actions, and recent activity feed
- **Light & dark mode** with a polished, accessible design system
- **Fully responsive** layout for desktop, tablet, and mobile
- **Responsible AI** — disclaimers, copy/regenerate controls, transparent outputs

## Tools Used

- **Language:** TypeScript
- **Framework:** React 19 + TanStack Start (SSR, file-based routing, server functions)
- **Styling:** Tailwind CSS v4 + shadcn/ui components
- **Build Tool:** Vite 7
- **AI:** Lovable AI Gateway (`google/gemini-3-flash-preview`) via the AI SDK
- **Backend:** Lovable Cloud (Supabase) — auth, database, storage
- **Validation:** Zod
- **Package Manager:** Bun
- **Version Control:** Git

## Setup Instructions

### Prerequisites

- [Bun](https://bun.sh) (or Node.js 20+ with npm)
- Git

### Installation

```bash
# 1. Clone the repository
git clone <repository-url>
cd <project-folder>

# 2. Install dependencies
bun install

# 3. Start the dev server
bun dev
```

Open [http://localhost:8080](http://localhost:8080) in your browser.

### Environment

The project uses Lovable Cloud, which auto-provisions the following variables in `.env`:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_SUPABASE_PROJECT_ID`
- `LOVABLE_API_KEY` (server-side, for the AI Gateway)

## Project Structure

```
src/
├── components/      # Reusable UI + layout (sidebar, theme, shadcn/ui)
├── routes/          # File-based routes (dashboard, email, meetings, ...)
│   └── api/         # HTTP endpoints (chat streaming)
├── lib/             # AI server functions, activity tracking, utils
├── integrations/    # Lovable Cloud client/server bindings
└── styles.css       # Design tokens & theme
```

## Future Improvements

- Persist activity & generated artifacts to the database (currently localStorage)
- Team workspaces and sharing
- Calendar and email provider integrations
- Voice input for the meeting summarizer
- Expanded test coverage and E2E tests
- Accessibility audit (WCAG 2.2 AA)

## License

Released under the MIT License.
