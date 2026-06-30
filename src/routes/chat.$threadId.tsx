import { createFileRoute } from "@tanstack/react-router";
import { ChatWindow } from "@/components/chat-window";

export const Route = createFileRoute("/chat/$threadId")({
  component: ChatThread,
});

function ChatThread() {
  const { threadId } = Route.useParams();
  return <ChatWindow key={threadId} threadId={threadId} />;
}
