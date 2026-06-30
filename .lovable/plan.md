## AI Workplace Productivity Assistant

A modern SaaS productivity app with 5 AI tools, dashboard, and threaded chatbot. No auth, no persistence (single session, in-memory state).

### Visual direction
- Clean SaaS look: white/light-gray surfaces, blue primary accent (#2563EB), rounded cards, soft shadows, generous whitespace, Inter typography, Framer Motion micro-animations, light/dark toggle.

### Routes (TanStack Start)
```
/                          Dashboard
/email                     Smart Email Generator
/meetings                  Meeting Notes Summarizer
/tasks                     AI Task Planner
/research                  AI Research Assistant
/chat                      Chatbot (redirects to newest thread)
/chat/$threadId            Chatbot thread
/settings                  Settings (theme, about, AI notice)
```

### Layout shell (`__root.tsx`)
- Collapsible sidebar (shadcn `sidebar`) with the 7 nav items + icons.
- Top bar: search input (visual only), notifications icon (popover with sample items), avatar dropdown, theme toggle.
- Mobile: sidebar becomes offcanvas via `SidebarTrigger`.
- Responsible AI disclaimer banner pinned in footer of main area.

### Dashboard
- 5 stat cards (Emails / Meetings / Tasks / Research / Chats) — counters driven by in-memory activity store (Zustand or React context).
- Recent Activity feed listing last N generated outputs with type icon, snippet, timestamp; click to reopen.
- Quick-action tiles linking to each tool.

### Shared tool shell
Each tool page uses a 2-column responsive layout (form left, output right; stacks on mobile) with:
- Input form (react-hook-form + zod)
- Generate button + loading shimmer
- Output card: editable (textarea/contenteditable), Copy / Regenerate / Export (.txt/.md download) / Character count
- Responsible AI footnote

### Tool specifics
1. **Email Generator** — fields: purpose, recipient, tone (select), length (select), details. Output: Subject + Body (two editable fields).
2. **Meeting Summarizer** — textarea input. Output sections: Summary, Key Decisions, Action Items, Follow-ups (structured JSON from model, editable).
3. **Task Planner** — goals (textarea), deadline (date), working hours (number), priority. Output: editable table (Priority / Task / Time Estimate / Status) with checkbox status.
4. **Research Assistant** — topic, depth (select), industry. Output sections: Executive Summary, Key Insights, Statistics, References, Recommendations.
5. **Chatbot** — threaded:
   - In-memory thread store (Zustand) keyed by threadId.
   - Sidebar list of threads with New Chat button + delete; selecting navigates to `/chat/$threadId`.
   - `/chat` index creates a thread and navigates.
   - Built with AI Elements (`conversation`, `message`, `prompt-input`, `shimmer`).
   - Suggested-prompt chips on empty thread; Clear conversation button.

### AI backend
- Single streaming chat route `src/routes/api/chat.ts` for the chatbot (`useChat` + `DefaultChatTransport`).
- Server functions in `src/lib/ai.functions.ts` for one-shot generations:
  - `generateEmail`, `summarizeMeeting`, `planTasks`, `researchTopic` — each uses `generateText` with `Output.object` + Zod schema for structured output where needed.
- Model: `google/gemini-3-flash-preview` via Lovable AI Gateway helper in `src/lib/ai-gateway.server.ts`.
- Provision `LOVABLE_API_KEY` via `ai_gateway--create`.

### State (in-memory only, resets on reload)
- `useActivityStore` — array of activity entries (type, title, snippet, timestamp, payload) feeding dashboard counters + recent activity.
- `useThreadsStore` — threads + messages for chatbot.
- Theme persisted via `class="dark"` toggled on `<html>` (sessionStorage allowed for theme only since it's UX, not user data — or pure in-memory if strict).

### Tech / dependencies to add
- `ai`, `@ai-sdk/react`, `@ai-sdk/openai-compatible`, `zod` (likely present), `zustand`, `framer-motion`, AI Elements (`conversation message prompt-input shimmer tool`), `react-markdown`, `@fontsource/inter`.

### Out of scope (per answers)
- Auth, database, persistence beyond memory, PDF/Word export (use .txt/.md), voice input, file upload, multi-language.

### Closing
After build: dashboard, all 5 tools, threaded chatbot, theme toggle, responsive sidebar, Responsible AI notice, all wired to Lovable AI.