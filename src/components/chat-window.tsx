import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Send, Sparkles, Trash2, Loader2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useThreadsStore } from "@/stores/threads";
import { useActivityStore } from "@/stores/activity";
import { toast } from "sonner";

const transport = new DefaultChatTransport({ api: "/api/chat" });

const suggestions = [
  "Draft an email asking for a project update",
  "Summarize this quarter's priorities",
  "Improve this paragraph: ",
  "Plan my workday around 3 meetings",
  "Explain OKRs in plain language",
];

function messageText(m: UIMessage) {
  return m.parts.map((p) => (p.type === "text" ? p.text : "")).join("");
}

export function ChatWindow({ threadId }: { threadId: string }) {
  const thread = useThreadsStore((s) => s.threads.find((t) => t.id === threadId));
  const setMessages = useThreadsStore((s) => s.setMessages);
  const rename = useThreadsStore((s) => s.rename);
  const addActivity = useActivityStore((s) => s.add);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const { messages, sendMessage, status, setMessages: setChatMessages } = useChat({
    id: threadId,
    messages: thread?.messages ?? [],
    transport,
    onError: (e) => toast.error(e.message || "Chat failed"),
  });

  // Persist messages back to the thread store
  useEffect(() => {
    setMessages(threadId, messages);
  }, [messages, threadId, setMessages]);

  // Update title from first user message; track activity on first assistant reply
  useEffect(() => {
    if (!thread) return;
    const firstUser = messages.find((m) => m.role === "user");
    if (firstUser && thread.title === "New chat") {
      rename(threadId, messageText(firstUser).slice(0, 40) || "New chat");
    }
    if (
      status === "ready" &&
      messages.length >= 2 &&
      messages[messages.length - 1].role === "assistant"
    ) {
      // record once per completion-ish
    }
  }, [messages, status, thread, threadId, rename]);

  // Auto-scroll
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, status]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [threadId, status]);

  const busy = status === "submitted" || status === "streaming";

  async function submit(text: string) {
    const t = text.trim();
    if (!t || busy) return;
    setInput("");
    await sendMessage({ text: t });
    addActivity({ type: "chat", title: "AI chat", snippet: t.slice(0, 120) });
  }

  function clearChat() {
    setChatMessages([]);
    setMessages(threadId, []);
    rename(threadId, "New chat");
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="min-w-0">
          <div className="truncate text-sm font-medium">{thread?.title ?? "Chat"}</div>
          <div className="text-xs text-muted-foreground">AI workplace assistant</div>
        </div>
        <Button variant="ghost" size="sm" onClick={clearChat} disabled={messages.length === 0}>
          <Trash2 className="mr-1 h-3.5 w-3.5" /> Clear
        </Button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4">
        {messages.length === 0 ? (
          <div className="mx-auto max-w-lg py-10 text-center">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary">
              <Sparkles className="h-6 w-6" />
            </div>
            <h2 className="mt-3 text-lg font-semibold">How can I help today?</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Ask anything about your work — emails, plans, summaries, ideas.
            </p>
            <div className="mt-5 grid gap-2">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => submit(s)}
                  className="rounded-lg border bg-background px-3 py-2 text-left text-sm hover:border-primary/40 hover:bg-muted"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="mx-auto max-w-3xl space-y-4">
            {messages.map((m) => (
              <MessageBubble key={m.id} message={m} />
            ))}
            {busy && messages[messages.length - 1]?.role === "user" ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Thinking…
              </div>
            ) : null}
          </div>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit(input);
        }}
        className="border-t p-3"
      >
        <div className="mx-auto flex max-w-3xl items-end gap-2">
          <Textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit(input);
              }
            }}
            placeholder="Message Workly AI…"
            rows={1}
            className="min-h-[44px] resize-none"
          />
          <Button type="submit" size="icon" disabled={busy || !input.trim()}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </form>
    </div>
  );
}

function MessageBubble({ message }: { message: UIMessage }) {
  const text = messageText(message);
  const isUser = message.role === "user";
  if (isUser) {
    return (
      <div className="flex justify-end gap-2">
        <div className="max-w-[80%] rounded-2xl rounded-br-sm bg-primary px-3.5 py-2 text-sm text-primary-foreground">
          {text}
        </div>
        <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-muted">
          <User className="h-3.5 w-3.5" />
        </div>
      </div>
    );
  }
  return (
    <div className="flex gap-2">
      <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
        <Sparkles className="h-3.5 w-3.5" />
      </div>
      <div className="prose prose-sm max-w-[80%] dark:prose-invert">
        <ReactMarkdown>{text}</ReactMarkdown>
      </div>
    </div>
  );
}
