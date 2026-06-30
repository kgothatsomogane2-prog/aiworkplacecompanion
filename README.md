# AI Workplace Productivity Assistant

## Problem Statement

Professionals across various industries spend a significant amount of time performing repetitive workplace tasks such as drafting emails, summarizing meeting notes, planning schedules, and conducting research. These manual activities reduce productivity, consume valuable time, and limit employees' ability to focus on more strategic and high-value responsibilities. This project aims to address these challenges by developing an **AI Workplace Productivity Assistant** that automates common workplace tasks through Artificial Intelligence, improving efficiency, accuracy, and overall productivity.

## Functional Requirements

The AI Workplace Productivity Assistant will provide the following features:

### 1. Smart Email Generator
- Generate context-based professional emails.
- Support multiple tones (formal, informal, persuasive).
- Adapt email content based on the intended audience (client, manager, or team).

### 2. Meeting Notes Summarizer
- Convert lengthy meeting notes into concise summaries.
- Extract key discussion points, decisions, and action items.
- Highlight deadlines and assigned responsibilities.

### 3. AI Task Planner / Scheduler
- Generate structured daily or weekly task plans.
- Prioritize tasks based on urgency and importance.
- Suggest time optimization strategies to improve productivity.

### 4. AI Research Assistant
- Summarize articles, reports, and research topics.
- Provide key insights and recommendations.
- Simplify complex information for quick understanding.

### 5. AI Chatbot Interface
- Provide an interactive conversational interface for users.
- Handle multiple prompts and AI-generated responses.
- Simulate a real workplace assistant experience.

## Expected Project Structure

The application includes:

- Modern dashboard layout
- Sidebar navigation
- Responsive design for desktop and mobile devices
- Dedicated input and output sections for each AI tool
- Editable AI-generated responses
- Clean and professional SaaS-inspired user interface
- Responsible AI disclaimer informing users that AI-generated content should be reviewed before use

## Tech Stack

- **Framework:** TanStack Start (React 19, Vite 7, SSR)
- **Styling:** Tailwind CSS v4, shadcn/ui components
- **State:** Zustand (in-memory stores for activity and chat threads)
- **AI:** Vercel AI SDK with Lovable AI Gateway (Google Gemini 3 Flash)
- **Routing:** File-based routing via TanStack Router

## Getting Started

```bash
bun install
bun run dev
```

The app runs at `http://localhost:8080`.
