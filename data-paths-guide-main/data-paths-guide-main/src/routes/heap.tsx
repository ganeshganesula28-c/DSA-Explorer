import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Binary } from "lucide-react";
import { AppLayout, PageHeader, Panel, Toolbar, Btn, Field, Input, ComplexityBadge, HistoryPanel, ExplanationPanel } from "@/components/app-layout";
import { useHistory } from "@/lib/history";

export const Route = createFileRoute("/heap")({
  head: () => ({ meta: [{ title: "Heap Visualizer — DSALab" }, { name: "description", content: "Min and max heap with insert, delete-root and heapify, visualized as a tree." }] }),
  component: HeapPage,
});

type Kind = "min" | "max";

function heapifyUp(a: number[], i: number, cmp: (x: number, y: number) => boolean) {
  while (i > 0) { const p = (i - 1) >> 1; if (cmp(a[i], a[p])) { [a[i], a[p]] = [a[p], a[i]]; i = p; } else break; }
}
function heapifyDown(a: number[], i: number, cmp: (x: number, y: number) => boolean) {
  const n = a.length;
  while (true) {
    const l = 2 * i + 1, r = 2 * i + 2; let best = i;
    if (l < n && cmp(a[l], a[best])) best = l;
    if (r < n && cmp(a[r], a[best])) best = r;
    if (best !== i) { [a[i], a[best]] = [a[best], a[i]]; i = best; } else break;
  }
}

function HeapPage() {
  const [kind, setKind] = useState<Kind>("min");
  const [arr, setArr] = useState<number[]>([10, 20, 15, 30, 40]);
  const [val, setVal] = useState("");
  const [steps, setSteps] = useState<string[]>([]);
  const add = useHistory((s) => s.add);
  const cmp = (x: number, y: number) => (kind === "min" ? x < y : x > y);

  const insert = () => {
    const n = parseInt(val, 10); if (isNaN(n)) return notify("Enter a numeric value");
    const a = [...arr, n]; heapifyUp(a, a.length - 1, cmp); setArr(a);
    setSteps([`Insert ${n} at end`, "Sift up while heap property violated"]);
    add("Heap", `Insert ${n} (${kind})`);
  };
  const delRoot = () => {
    if (!arr.length) return notify("Heap is empty");
    const a = [...arr]; const root = a[0]; const last = a.pop()!;
    if (a.length) { a[0] = last; heapifyDown(a, 0, cmp); }
    setArr(a); setSteps([`Remove root (${root})`, "Move last to root", "Sift down"]);
    add("Heap", `Delete root ${root}`);
  };
  const build = () => {
    const raw = val.split(/[,\s]+/).map(Number).filter((x) => !isNaN(x));
    if (!raw.length) return notify("Enter comma-separated values");
    const a = [...raw]; for (let i = (a.length >> 1) - 1; i >= 0; i--) heapifyDown(a, i, cmp);
    setArr(a); setSteps([`Build ${kind}-heap from ${raw.length} values`, "Heapify from middle to root"]);
    add("Heap", `Build (${raw.length})`);
  };
  const clear = () => { setArr([]); setSteps(["Cleared"]); add("Heap", "Clear"); };

  // tree layout
  const positions = useMemo(() => {
    const out: { x: number; y: number; v: number; i: number }[] = [];
    arr.forEach((v, i) => {
      const depth = Math.floor(Math.log2(i + 1));
      const inLevel = i - (2 ** depth - 1);
      const total = 2 ** depth;
      const x = ((inLevel + 0.5) / total) * 760 + 20;
      const y = 50 + depth * 75;
      out.push({ x, y, v, i });
    });
    return out;
  }, [arr]);
  const edges = arr.map((_, i) => ({ p: (i - 1) >> 1, c: i })).filter((e) => e.c > 0);

  return (
    <AppLayout>
      <PageHeader icon={Binary} title="Heap" subtitle="Complete binary tree as array. Min or max heap property." />
      <div className="grid lg:grid-cols-[1fr_320px] gap-6">
        <div className="space-y-6">
          <Panel>
            <div className="flex gap-2 mb-4">
              <Btn variant={kind === "min" ? "primary" : "default"} onClick={() => setKind("min")}>Min Heap</Btn>
              <Btn variant={kind === "max" ? "primary" : "default"} onClick={() => setKind("max")}>Max Heap</Btn>
            </div>
            <Field label="Value (or comma list for Build)"><Input value={val} onChange={(e) => setVal(e.target.value)} placeholder="42 or 5,3,8,1" /></Field>
            <Toolbar>
              <Btn variant="primary" onClick={insert}>Insert</Btn>
              <Btn onClick={delRoot}>Delete Root</Btn>
              <Btn onClick={build}>Build Heap</Btn>
              <Btn disabled>{`Size: ${arr.length}`}</Btn>
              <Btn variant="danger" onClick={clear}>Clear</Btn>
            </Toolbar>
          </Panel>
          <Panel title={`${kind === "min" ? "Min" : "Max"} Heap`}>
            <div className="overflow-x-auto">
              <svg width={800} height={Math.max(180, 60 + Math.ceil(Math.log2(arr.length + 1)) * 75)}>
                {edges.map(({ p, c }) => {
                  const a = positions[p], b = positions[c];
                  return <line key={c} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="currentColor" className="text-border" strokeWidth={2} />;
                })}
                {positions.map((p) => (
                  <motion.g key={p.i} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                    <circle cx={p.x} cy={p.y} r={22} className={p.i === 0 ? "fill-primary stroke-primary" : "fill-card stroke-border"} strokeWidth={2} />
                    <text x={p.x} y={p.y + 5} textAnchor="middle" className={["font-mono font-bold", p.i === 0 ? "fill-primary-foreground" : "fill-foreground"].join(" ")} fontSize={14}>{p.v}</text>
                  </motion.g>
                ))}
                {!arr.length && <text x={400} y={90} textAnchor="middle" className="fill-muted-foreground italic">Empty</text>}
              </svg>
            </div>
            <div className="mt-3 font-mono text-xs text-muted-foreground">Array: [{arr.join(", ")}]</div>
            <div className="mt-4"><ComplexityBadge time="O(log n) insert/delete" space="O(n)" /></div>
          </Panel>
          <ExplanationPanel steps={steps} />
        </div>
        <div><HistoryPanel scope="Heap" /></div>
      </div>
    </AppLayout>
  );
}
function notify(m: string) { const e = document.createElement("div"); e.textContent = m; e.className = "fixed top-20 right-6 z-50 px-4 py-2 rounded-lg bg-destructive text-destructive-foreground text-sm shadow-lg"; document.body.appendChild(e); setTimeout(() => e.remove(), 2200); }
