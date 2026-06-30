import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Mail,
  FileText,
  ListTodo,
  Search,
  MessageSquare,
  ArrowRight,
  Clock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import { useActivityStore, useActivityCounts } from "@/stores/activity";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Workly AI" },
      { name: "description", content: "Your AI productivity overview." },
    ],
  }),
  component: Dashboard,
});

const tools = [
  { to: "/email", title: "Smart Email", desc: "Draft professional emails", icon: Mail, key: "email" as const },
  { to: "/meetings", title: "Meeting Summarizer", desc: "Condense long notes", icon: FileText, key: "meeting" as const },
  { to: "/tasks", title: "Task Planner", desc: "Prioritized daily plan", icon: ListTodo, key: "task" as const },
  { to: "/research", title: "Research", desc: "Structured topic briefs", icon: Search, key: "research" as const },
  { to: "/chat", title: "AI Chatbot", desc: "General assistant", icon: MessageSquare, key: "chat" as const },
];

const labels: Record<string, string> = {
  email: "Emails Generated",
  meeting: "Meetings Summarized",
  task: "Task Plans",
  research: "Research Sessions",
  chat: "AI Chats",
};

function Dashboard() {
  const counts = useActivityCounts();
  const activities = useActivityStore((s) => s.activities);

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Welcome back"
        description="Your AI workspace at a glance."
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-5">
        {(Object.keys(labels) as Array<keyof typeof counts>).map((k) => (
          <Card key={k} className="transition-shadow hover:shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">
                {labels[k]}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold tracking-tight">{counts[k]}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">Quick actions</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {tools.map((t) => (
              <Link key={t.to} to={t.to} className="group">
                <Card className="h-full transition-all hover:border-primary/40 hover:shadow-md">
                  <CardContent className="flex items-start gap-3 p-4">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                      <t.icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <div className="truncate font-medium">{t.title}</div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                      </div>
                      <div className="mt-0.5 text-sm text-muted-foreground">{t.desc}</div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">Recent activity</h2>
          <Card>
            <CardContent className="p-2">
              {activities.length === 0 ? (
                <div className="px-3 py-8 text-center text-sm text-muted-foreground">
                  No activity yet. Try a tool to get started.
                </div>
              ) : (
                <ul className="divide-y">
                  {activities.slice(0, 8).map((a) => (
                    <li key={a.id} className="flex items-start gap-3 px-3 py-3">
                      <Clock className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium">{a.title}</div>
                        <div className="line-clamp-2 text-xs text-muted-foreground">
                          {a.snippet}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
          {activities.length > 0 ? (
            <Button
              variant="ghost"
              size="sm"
              className="mt-2 w-full"
              onClick={() => useActivityStore.getState().clear()}
            >
              Clear activity
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
