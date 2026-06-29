import { useSyncExternalStore } from "react";

type Listener = () => void;

export function create<T extends object>(
  init: (set: (p: Partial<T> | ((s: T) => Partial<T>)) => void, get: () => T) => T,
) {
  let state: T;
  const listeners = new Set<Listener>();
  const set = (p: Partial<T> | ((s: T) => Partial<T>)) => {
    const patch = typeof p === "function" ? p(state) : p;
    state = { ...state, ...patch };
    listeners.forEach((l) => l());
  };
  const get = () => state;
  state = init(set, get);

  function useStore(): T;
  function useStore<U>(selector: (s: T) => U): U;
  function useStore<U>(selector?: (s: T) => U) {
    return useSyncExternalStore(
      (l) => {
        listeners.add(l);
        return () => listeners.delete(l);
      },
      () => (selector ? selector(state) : (state as unknown as U)),
      () => (selector ? selector(state) : (state as unknown as U)),
    );
  }
  return useStore;
}
