import { createFileRoute, Outlet, Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { MessageSquare, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useThreadsStore } from "@/stores/threads";

export const Route = createFileRoute("/chat")({
  head: () => ({ meta: [{ title: "AI Chatbot — Workly AI" }] }),
  component: ChatLayout,
});

function ChatLayout() {
  const threads = useThreadsStore((s) => s.threads);
  const create = useThreadsStore((s) => s.create);
  const remove = useThreadsStore((s) => s.remove);
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  function onNew() {
    const id = create();
    navigate({ to: "/chat/$threadId", params: { threadId: id } });
  }

  function onDelete(id: string) {
    remove(id);
    if (pathname.includes(id)) {
      const next = useThreadsStore.getState().threads[0];
      if (next) navigate({ to: "/chat/$threadId", params: { threadId: next.id } });
      else navigate({ to: "/chat" });
    }
  }

  return (
    <div className="mx-auto grid h-[calc(100vh-9rem)] max-w-7xl gap-4 lg:grid-cols-[260px_1fr]">
      <aside className="flex min-h-0 flex-col rounded-xl border bg-card">
        <div className="flex items-center justify-between border-b p-3">
          <div className="flex items-center gap-2 text-sm font-medium">
            <MessageSquare className="h-4 w-4" /> Chats
          </div>
          <Button size="sm" onClick={onNew}>
            <Plus className="mr-1 h-3.5 w-3.5" /> New
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {threads.length === 0 ? (
            <div className="p-3 text-xs text-muted-foreground">
              No conversations yet. Start a new chat.
            </div>
          ) : (
            <ul className="space-y-1">
              {threads.map((t) => {
                const active = pathname.endsWith(t.id);
                return (
                  <li
                    key={t.id}
                    className={`group flex items-center rounded-lg ${
                      active ? "bg-primary/10 text-primary" : "hover:bg-muted"
                    }`}
                  >
                    <Link
                      to="/chat/$threadId"
                      params={{ threadId: t.id }}
                      className="min-w-0 flex-1 truncate px-3 py-2 text-sm"
                    >
                      {t.title}
                    </Link>
                    <button
                      onClick={() => onDelete(t.id)}
                      className="mr-1 rounded p-1 opacity-0 transition-opacity hover:bg-background group-hover:opacity-100"
                      aria-label="Delete thread"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </aside>

      <section className="min-h-0 overflow-hidden rounded-xl border bg-card">
        <Outlet />
      </section>
    </div>
  );
}
