import { create } from "zustand";
import type { UIMessage } from "ai";

export type Thread = {
  id: string;
  title: string;
  messages: UIMessage[];
  updatedAt: number;
};

type State = {
  threads: Thread[];
  create: () => string;
  remove: (id: string) => void;
  rename: (id: string, title: string) => void;
  setMessages: (id: string, messages: UIMessage[]) => void;
  get: (id: string) => Thread | undefined;
};

export const useThreadsStore = create<State>((set, get) => ({
  threads: [],
  create: () => {
    const id = crypto.randomUUID();
    set((s) => ({
      threads: [
        { id, title: "New chat", messages: [], updatedAt: Date.now() },
        ...s.threads,
      ],
    }));
    return id;
  },
  remove: (id) => set((s) => ({ threads: s.threads.filter((t) => t.id !== id) })),
  rename: (id, title) =>
    set((s) => ({
      threads: s.threads.map((t) => (t.id === id ? { ...t, title } : t)),
    })),
  setMessages: (id, messages) =>
    set((s) => ({
      threads: s.threads.map((t) =>
        t.id === id ? { ...t, messages, updatedAt: Date.now() } : t,
      ),
    })),
  get: (id) => get().threads.find((t) => t.id === id),
}));
