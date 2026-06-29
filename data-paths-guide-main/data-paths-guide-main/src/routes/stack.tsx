import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { Layers } from "lucide-react";
import { AppLayout, PageHeader, Panel, Toolbar, Btn, Field, Input, ComplexityBadge, HistoryPanel, ExplanationPanel } from "@/components/app-layout";
import { useHistory } from "@/lib/history";
import { sleep } from "@/lib/utils";

export const Route = createFileRoute("/stack")({
  head: () => ({ meta: [{ title: "Stack Visualizer — DSALab" }, { name: "description", content: "Push, pop and peek operations on a stack with animated visualization." }] }),
  component: StackPage,
});

type Item = { id: number; val: number; state?: "in" | "out" | "peek" };
let nid = 1;
const MAX = 8;

function StackPage() {
  const [stack, setStack] = useState<Item[]>([]);
  const [val, setVal] = useState("");
  const [busy, setBusy] = useState(false);
  const [steps, setSteps] = useState<string[]>([]);
  const [cx, setCx] = useState({ t: "O(1)", s: "O(1)" });
  const add = useHistory((s) => s.add);

  const push = async () => {
    const n = parseInt(val, 10);
    if (isNaN(n)) return notify("Enter a numeric value");
    if (stack.length >= MAX) return notify("Stack Overflow");
    setBusy(true); setCx({ t: "O(1)", s: "O(1)" });
    setSteps([`Push ${n} onto top`, `Top pointer → index ${stack.length}`]);
    setStack((s) => [...s, { id: nid++, val: n, state: "in" }]);
    add("Stack", `Push ${n}`);
    await sleep(400);
    setStack((s) => s.map((i) => ({ ...i, state: undefined })));
    setBusy(false);
  };
  const pop = async () => {
    if (!stack.length) return notify("Stack Underflow");
    setBusy(true); setCx({ t: "O(1)", s: "O(1)" });
    const top = stack[stack.length - 1];
    setSteps([`Pop top element (${top.val})`, `Top pointer → index ${stack.length - 2}`]);
    add("Stack", `Pop (${top.val})`);
    setStack((s) => s.map((i, idx) => (idx === s.length - 1 ? { ...i, state: "out" } : i)));
    await sleep(350);
    setStack((s) => s.slice(0, -1));
    setBusy(false);
  };
  const peek = async () => {
    if (!stack.length) return notify("Stack is empty");
    setBusy(true); setCx({ t: "O(1)", s: "O(1)" });
    const top = stack[stack.length - 1];
    setSteps([`Peek top element = ${top.val}`]);
    add("Stack", `Peek = ${top.val}`);
    setStack((s) => s.map((i, idx) => (idx === s.length - 1 ? { ...i, state: "peek" } : i)));
    await sleep(700);
    setStack((s) => s.map((i) => ({ ...i, state: undefined })));
    setBusy(false);
  };
  const clear = () => { setStack([]); add("Stack", "Clear"); setSteps(["Stack cleared"]); };

  return (
    <AppLayout>
      <PageHeader icon={Layers} title="Stack" subtitle="LIFO — last in, first out. Push and pop happen at the top." />
      <div className="grid lg:grid-cols-[1fr_320px] gap-6">
        <div className="space-y-6">
          <Panel>
            <Field label="Value"><Input value={val} onChange={(e) => setVal(e.target.value)} placeholder="e.g. 42" /></Field>
            <div className="mt-4">
              <Toolbar>
                <Btn variant="primary" onClick={push} disabled={busy}>Push</Btn>
                <Btn onClick={pop} disabled={busy}>Pop</Btn>
                <Btn onClick={peek} disabled={busy}>Peek</Btn>
                <Btn disabled>{`Size: ${stack.length}`}</Btn>
                <Btn disabled>{`isEmpty: ${stack.length === 0}`}</Btn>
                <Btn variant="danger" onClick={clear} disabled={busy}>Clear</Btn>
              </Toolbar>
            </div>
          </Panel>

          <Panel title="Stack">
            <div className="min-h-[380px] flex items-end justify-center gap-12">
              <div className="flex flex-col-reverse gap-2 relative">
                <LayoutGroup>
                  <AnimatePresence>
                    {stack.map((it, i) => (
                      <motion.div
                        key={it.id} layout
                        initial={{ opacity: 0, x: 80 }} animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 80, transition: { duration: 0.25 } }}
                        transition={{ type: "spring", stiffness: 320, damping: 28 }}
                        className={[
                          "w-32 h-14 rounded-md border-2 grid place-items-center font-mono font-bold text-lg",
                          it.state === "in" ? "border-primary bg-primary/20" :
                          it.state === "out" ? "border-destructive bg-destructive/20" :
                          it.state === "peek" ? "border-warning bg-warning/20" :
                          i === stack.length - 1 ? "border-primary/60 bg-card" : "border-border bg-card",
                        ].join(" ")}
                      >{it.val}</motion.div>
                    ))}
                  </AnimatePresence>
                </LayoutGroup>
                <div className="w-32 h-1 rounded bg-foreground/40" />
                <div className="text-center text-xs text-muted-foreground mt-1">Base</div>
              </div>
              {stack.length > 0 && (
                <div className="flex flex-col items-start justify-end pb-12">
                  <motion.div layout className="text-xs px-2 py-1 rounded bg-primary text-primary-foreground font-mono">← TOP (index {stack.length - 1})</motion.div>
                </div>
              )}
            </div>
            <div className="mt-4"><ComplexityBadge time={cx.t} space={cx.s} /></div>
          </Panel>

          <ExplanationPanel steps={steps} />
        </div>
        <div><HistoryPanel scope="Stack" /></div>
      </div>
    </AppLayout>
  );
}

function notify(msg: string) {
  if (typeof window === "undefined") return;
  const el = document.createElement("div");
  el.textContent = msg;
  el.className = "fixed top-20 right-6 z-50 px-4 py-2 rounded-lg bg-destructive text-destructive-foreground text-sm shadow-lg";
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2200);
}
