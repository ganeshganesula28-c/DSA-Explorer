import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { ArrowRightLeft } from "lucide-react";
import { AppLayout, PageHeader, Panel, Toolbar, Btn, Field, Input, ComplexityBadge, HistoryPanel, ExplanationPanel } from "@/components/app-layout";
import { useHistory } from "@/lib/history";
import { sleep } from "@/lib/utils";

export const Route = createFileRoute("/queue")({
  head: () => ({ meta: [{ title: "Queue Visualizer — DSALab" }, { name: "description", content: "Enqueue, dequeue and inspect a FIFO queue with animations." }] }),
  component: QueuePage,
});

type Item = { id: number; val: number; state?: "in" | "out" };
let nid = 1;

function QueuePage() {
  const [q, setQ] = useState<Item[]>([]);
  const [val, setVal] = useState("");
  const [busy, setBusy] = useState(false);
  const [steps, setSteps] = useState<string[]>([]);
  const add = useHistory((s) => s.add);

  const enqueue = async () => {
    const n = parseInt(val, 10);
    if (isNaN(n)) return notify("Enter a numeric value");
    setBusy(true);
    setSteps([`Insert ${n} at rear`, `Rear pointer → index ${q.length}`]);
    setQ((arr) => [...arr, { id: nid++, val: n, state: "in" }]);
    add("Queue", `Enqueue ${n}`);
    await sleep(400);
    setQ((arr) => arr.map((i) => ({ ...i, state: undefined })));
    setBusy(false);
  };
  const dequeue = async () => {
    if (!q.length) return notify("Queue Underflow");
    setBusy(true);
    const front = q[0];
    setSteps([`Remove front (${front.val})`, "Shift front pointer forward"]);
    add("Queue", `Dequeue (${front.val})`);
    setQ((arr) => arr.map((i, idx) => (idx === 0 ? { ...i, state: "out" } : i)));
    await sleep(350);
    setQ((arr) => arr.slice(1));
    setBusy(false);
  };
  const clear = () => { setQ([]); add("Queue", "Clear"); setSteps(["Queue cleared"]); };

  return (
    <AppLayout>
      <PageHeader icon={ArrowRightLeft} title="Queue" subtitle="FIFO — first in, first out. Enqueue at rear, dequeue from front." />
      <div className="grid lg:grid-cols-[1fr_320px] gap-6">
        <div className="space-y-6">
          <Panel>
            <Field label="Value"><Input value={val} onChange={(e) => setVal(e.target.value)} placeholder="e.g. 7" /></Field>
            <div className="mt-4">
              <Toolbar>
                <Btn variant="primary" onClick={enqueue} disabled={busy}>Enqueue</Btn>
                <Btn onClick={dequeue} disabled={busy}>Dequeue</Btn>
                <Btn disabled>{`Front: ${q[0]?.val ?? "—"}`}</Btn>
                <Btn disabled>{`Rear: ${q[q.length - 1]?.val ?? "—"}`}</Btn>
                <Btn disabled>{`Size: ${q.length}`}</Btn>
                <Btn variant="danger" onClick={clear} disabled={busy}>Clear</Btn>
              </Toolbar>
            </div>
          </Panel>

          <Panel title="Queue">
            <div className="min-h-[180px] flex items-center justify-center gap-6">
              <div className="text-xs font-mono text-primary">FRONT →</div>
              <LayoutGroup>
                <div className="flex gap-2 min-h-16 items-center">
                  <AnimatePresence>
                    {q.map((it) => (
                      <motion.div
                        key={it.id} layout
                        initial={{ opacity: 0, scale: 0.6, x: 30 }} animate={{ opacity: 1, scale: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.6, x: -30 }}
                        transition={{ type: "spring", stiffness: 320, damping: 28 }}
                        className={[
                          "size-14 rounded-lg border-2 grid place-items-center font-mono font-bold",
                          it.state === "in" ? "border-primary bg-primary/20" :
                          it.state === "out" ? "border-destructive bg-destructive/20" :
                          "border-border bg-card",
                        ].join(" ")}
                      >{it.val}</motion.div>
                    ))}
                  </AnimatePresence>
                  {!q.length && <div className="text-muted-foreground italic">Empty</div>}
                </div>
              </LayoutGroup>
              <div className="text-xs font-mono text-accent">← REAR</div>
            </div>
            <div className="mt-4"><ComplexityBadge time="O(1)" space="O(1)" /></div>
          </Panel>

          <ExplanationPanel steps={steps} />
        </div>
        <div><HistoryPanel scope="Queue" /></div>
      </div>
    </AppLayout>
  );
}
function notify(m: string) { if (typeof window === "undefined") return; const e = document.createElement("div"); e.textContent = m; e.className = "fixed top-20 right-6 z-50 px-4 py-2 rounded-lg bg-destructive text-destructive-foreground text-sm shadow-lg"; document.body.appendChild(e); setTimeout(() => e.remove(), 2200); }
