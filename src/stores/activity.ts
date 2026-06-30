import { create } from "zustand";

export type ActivityType = "email" | "meeting" | "task" | "research" | "chat";

export type Activity = {
  id: string;
  type: ActivityType;
  title: string;
  snippet: string;
  timestamp: number;
};

type State = {
  activities: Activity[];
  add: (a: Omit<Activity, "id" | "timestamp">) => void;
  clear: () => void;
};

export const useActivityStore = create<State>((set) => ({
  activities: [],
  add: (a) =>
    set((s) => ({
      activities: [
        { ...a, id: crypto.randomUUID(), timestamp: Date.now() },
        ...s.activities,
      ].slice(0, 50),
    })),
  clear: () => set({ activities: [] }),
}));

export function useActivityCounts() {
  const activities = useActivityStore((s) => s.activities);
  return activities.reduce(
    (acc, a) => {
      acc[a.type] = (acc[a.type] ?? 0) + 1;
      return acc;
    },
    { email: 0, meeting: 0, task: 0, research: 0, chat: 0 } as Record<ActivityType, number>,
  );
}
