import { create } from "./tiny-store";

export type HistoryEntry = {
  id: string;
  time: number;
  scope: string;
  text: string;
};

type State = {
  entries: HistoryEntry[];
  add: (scope: string, text: string) => void;
  clear: () => void;
};

const STORAGE_KEY = "dsa-history";

function load(): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
  } catch {
    return [];
  }
}
function save(entries: HistoryEntry[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(-200)));
  } catch {
    /* ignore */
  }
}

export const useHistory = create<State>((set, get) => ({
  entries: load(),
  add: (scope, text) => {
    const entry: HistoryEntry = {
      id: Math.random().toString(36).slice(2),
      time: Date.now(),
      scope,
      text,
    };
    const next = [...get().entries, entry].slice(-200);
    save(next);
    set({ entries: next });
  },
  clear: () => {
    save([]);
    set({ entries: [] });
  },
}));
