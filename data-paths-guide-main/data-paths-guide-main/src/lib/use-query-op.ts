import { useEffect } from "react";

export function useQueryOp(): string | null {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  return params.get("op");
}

export function useOpHighlight(onOp: (op: string) => void) {
  useEffect(() => {
    const op = new URLSearchParams(window.location.search).get("op");
    if (op) onOp(op);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
