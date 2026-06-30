import { create } from "zustand";

type Theme = "light" | "dark";
type State = { theme: Theme; toggle: () => void; set: (t: Theme) => void };

export const useThemeStore = create<State>((set) => ({
  theme: "light",
  toggle: () =>
    set((s) => {
      const next = s.theme === "light" ? "dark" : "light";
      if (typeof document !== "undefined") {
        document.documentElement.classList.toggle("dark", next === "dark");
      }
      return { theme: next };
    }),
  set: (t) => {
    if (typeof document !== "undefined") {
      document.documentElement.classList.toggle("dark", t === "dark");
    }
    set({ theme: t });
  },
}));
