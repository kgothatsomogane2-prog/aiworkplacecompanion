import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { MessageSquare } from "lucide-react";
import { useThreadsStore } from "@/stores/threads";

export const Route = createFileRoute("/chat/")({
  component: ChatIndex,
});

function ChatIndex() {
  const navigate = useNavigate();
  useEffect(() => {
    const { threads, create } = useThreadsStore.getState();
    const id = threads[0]?.id ?? create();
    navigate({ to: "/chat/$threadId", params: { threadId: id }, replace: true });
  }, [navigate]);

  return (
    <div className="grid h-full place-items-center text-muted-foreground">
      <div className="flex flex-col items-center gap-2">
        <MessageSquare className="h-8 w-8" />
        <span className="text-sm">Opening chat…</span>
      </div>
    </div>
  );
}
