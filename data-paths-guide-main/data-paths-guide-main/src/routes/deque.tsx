import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { MoveHorizontal } from "lucide-react";
import { AppLayout, PageHeader, Panel, Toolbar, Btn, Field, Input, ComplexityBadge, HistoryPanel, ExplanationPanel } from "@/components/app-layout";
import { useHistory } from "@/lib/history";

export const Route = createFileRoute("/deque")({
  head: () => ({ meta: [{ title: "Deque Visualizer — DSALab" }, { name: "description", content: "Double-ended queue with insert and delete from both ends." }] }),
  component: DequePage,
});

type Item = { id: number; val: number };
let nid = 1;

function DequePage() {
  const [arr, setArr] = useState<Item[]>([]);
  const [val, setVal] = useState("");
  const [steps, setSteps] = useState<string[]>([]);
  const add = useHistory((s) => s.add);
  const num = () => { const n = parseInt(val, 10); if (isNaN(n)) { notify("Enter a numeric value"); return null; } return n; };

  const insF = () => { const n = num(); if (n === null) return; setArr((a) => [{ id: nid++, val: n }, ...a]); setSteps([`Insert ${n} at front`]); add("Deque", `Insert front ${n}`); };
  const insR = () => { const n = num(); if (n === null) return; setArr((a) => [...a, { id: nid++, val: n }]); setSteps([`Insert ${n} at rear`]); add("Deque", `Insert rear ${n}`); };
  const delF = () => { if (!arr.length) return notify("Deque is empty"); const v = arr[0].val; setArr((a) => a.slice(1)); setSteps([`Delete front (${v})`]); add("Deque", `Delete front (${v})`); };
  const delR = () => { if (!arr.length) return notify("Deque is empty"); const v = arr[arr.length - 1].val; setArr((a) => a.slice(0, -1)); setSteps([`Delete rear (${v})`]); add("Deque", `Delete rear (${v})`); };
  const clear = () => { setArr([]); setSteps(["Cleared"]); add("Deque", "Clear"); };

  return (
    <AppLayout>
      <PageHeader icon={MoveHorizontal} title="Deque" subtitle="Double-ended queue — insert and delete from both ends." />
      <div className="grid lg:grid-cols-[1fr_320px] gap-6">
        <div className="space-y-6">
          <Panel>
            <Field label="Value"><Input value={val} onChange={(e) => setVal(e.target.value)} placeholder="e.g. 9" /></Field>
            <Toolbar>
              <Btn variant="primary" onClick={insF}>Insert Front</Btn>
              <Btn variant="primary" onClick={insR}>Insert Rear</Btn>
              <Btn onClick={delF}>Delete Front</Btn>
              <Btn onClick={delR}>Delete Rear</Btn>
              <Btn disabled>{`Front: ${arr[0]?.val ?? "—"}`}</Btn>
              <Btn disabled>{`Rear: ${arr[arr.length - 1]?.val ?? "—"}`}</Btn>
              <Btn variant="danger" onClick={clear}>Clear</Btn>
            </Toolbar>
          </Panel>
          <Panel title="Deque">
            <div className="min-h-[160px] flex items-center justify-center gap-3">
              <span className="text-xs font-mono text-primary">FRONT →</span>
              <LayoutGroup>
                <div className="flex gap-2">
                  <AnimatePresence>
                    {arr.map((c) => (
                      <motion.div key={c.id} layout
                        initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.6 }}
                        className="size-14 rounded-lg border-2 border-border bg-card grid place-items-center font-mono font-bold">
                        {c.val}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  {!arr.length && <div className="text-muted-foreground italic">Empty</div>}
                </div>
              </LayoutGroup>
              <span className="text-xs font-mono text-accent">← REAR</span>
            </div>
            <div className="mt-4"><ComplexityBadge time="O(1)" space="O(n)" /></div>
          </Panel>
          <ExplanationPanel steps={steps} />
        </div>
        <div><HistoryPanel scope="Deque" /></div>
      </div>
    </AppLayout>
  );
}
function notify(m: string) { const e = document.createElement("div"); e.textContent = m; e.className = "fixed top-20 right-6 z-50 px-4 py-2 rounded-lg bg-destructive text-destructive-foreground text-sm shadow-lg"; document.body.appendChild(e); setTimeout(() => e.remove(), 2200); }
