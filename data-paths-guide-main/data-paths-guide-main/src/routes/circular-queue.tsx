import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { RotateCw } from "lucide-react";
import { AppLayout, PageHeader, Panel, Toolbar, Btn, Field, Input, ComplexityBadge, HistoryPanel, ExplanationPanel } from "@/components/app-layout";
import { useHistory } from "@/lib/history";

export const Route = createFileRoute("/circular-queue")({
  head: () => ({ meta: [{ title: "Circular Queue Visualizer — DSALab" }, { name: "description", content: "Circular queue with front and rear pointers wrapping around." }] }),
  component: CQPage,
});

const SIZE = 8;

function CQPage() {
  const [buf, setBuf] = useState<(number | null)[]>(Array(SIZE).fill(null));
  const [front, setFront] = useState(-1);
  const [rear, setRear] = useState(-1);
  const [val, setVal] = useState("");
  const [steps, setSteps] = useState<string[]>([]);
  const add = useHistory((s) => s.add);

  const isEmpty = front === -1;
  const isFull = (rear + 1) % SIZE === front;

  const enq = () => {
    const n = parseInt(val, 10);
    if (isNaN(n)) return notify("Enter a numeric value");
    if (isFull) return notify("Queue Overflow");
    let f = front, r = rear;
    if (isEmpty) f = 0;
    r = (r + 1) % SIZE;
    const next = [...buf]; next[r] = n;
    setBuf(next); setFront(f); setRear(r);
    setSteps([`Increment rear: ${rear} → ${r}`, `Place ${n} at index ${r}`]);
    add("CircularQueue", `Enqueue ${n} @${r}`);
  };
  const deq = () => {
    if (isEmpty) return notify("Queue Underflow");
    const v = buf[front];
    const next = [...buf]; next[front] = null;
    let f = front, r = rear;
    if (front === rear) { f = -1; r = -1; } else f = (front + 1) % SIZE;
    setBuf(next); setFront(f); setRear(r);
    setSteps([`Remove value at front (${v})`, `Front advances: ${front} → ${f}`]);
    add("CircularQueue", `Dequeue ${v}`);
  };
  const clear = () => { setBuf(Array(SIZE).fill(null)); setFront(-1); setRear(-1); setSteps(["Cleared"]); add("CircularQueue", "Clear"); };

  return (
    <AppLayout>
      <PageHeader icon={RotateCw} title="Circular Queue" subtitle="Front and rear pointers wrap around using modulo arithmetic." />
      <div className="grid lg:grid-cols-[1fr_320px] gap-6">
        <div className="space-y-6">
          <Panel>
            <Field label="Value"><Input value={val} onChange={(e) => setVal(e.target.value)} placeholder="e.g. 5" /></Field>
            <Toolbar>
              <Btn variant="primary" onClick={enq}>Enqueue</Btn>
              <Btn onClick={deq}>Dequeue</Btn>
              <Btn disabled>{`Front: ${front === -1 ? "—" : front} (${front === -1 ? "—" : buf[front]})`}</Btn>
              <Btn disabled>{`Rear: ${rear === -1 ? "—" : rear} (${rear === -1 ? "—" : buf[rear]})`}</Btn>
              <Btn disabled>{`isFull: ${isFull}`}</Btn>
              <Btn disabled>{`isEmpty: ${isEmpty}`}</Btn>
              <Btn variant="danger" onClick={clear}>Clear</Btn>
            </Toolbar>
          </Panel>

          <Panel title="Circular Buffer">
            <div className="relative mx-auto" style={{ width: 360, height: 360 }}>
              {buf.map((v, i) => {
                const angle = (i / SIZE) * Math.PI * 2 - Math.PI / 2;
                const x = 180 + Math.cos(angle) * 130 - 28;
                const y = 180 + Math.sin(angle) * 130 - 28;
                const isF = i === front, isR = i === rear;
                return (
                  <motion.div
                    key={i} layout
                    className={[
                      "absolute size-14 rounded-lg border-2 grid place-items-center font-mono font-bold transition-colors",
                      v === null ? "border-dashed border-border bg-transparent text-muted-foreground" : "border-border bg-card",
                      isF && isR ? "border-primary bg-primary/30" : isF ? "border-success bg-success/20" : isR ? "border-warning bg-warning/20" : "",
                    ].join(" ")}
                    style={{ left: x, top: y }}
                  >
                    <span>{v ?? ""}</span>
                    <span className="absolute -bottom-5 text-[10px] text-muted-foreground">{i}</span>
                    {isF && <span className="absolute -top-5 text-[10px] text-success font-bold">F</span>}
                    {isR && <span className="absolute -top-5 right-0 text-[10px] text-warning font-bold">R</span>}
                  </motion.div>
                );
              })}
              <div className="absolute inset-0 grid place-items-center pointer-events-none">
                <div className="text-xs text-muted-foreground font-mono text-center">
                  size {SIZE}<br />
                  count {buf.filter((x) => x !== null).length}
                </div>
              </div>
            </div>
            <div className="mt-4"><ComplexityBadge time="O(1)" space="O(n)" /></div>
          </Panel>

          <ExplanationPanel steps={steps} />
        </div>
        <div><HistoryPanel scope="CircularQueue" /></div>
      </div>
    </AppLayout>
  );
}
function notify(m: string) { const e = document.createElement("div"); e.textContent = m; e.className = "fixed top-20 right-6 z-50 px-4 py-2 rounded-lg bg-destructive text-destructive-foreground text-sm shadow-lg"; document.body.appendChild(e); setTimeout(() => e.remove(), 2200); }
