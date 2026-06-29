import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { motion, LayoutGroup } from "framer-motion";
import { BarChart3 } from "lucide-react";
import { AppLayout, PageHeader, Panel, Toolbar, Btn, Field, Input, ComplexityBadge, HistoryPanel, ExplanationPanel } from "@/components/app-layout";
import { useHistory } from "@/lib/history";
import { sleep } from "@/lib/utils";

export const Route = createFileRoute("/sorting")({
  head: () => ({ meta: [{ title: "Sorting Visualizer — DSALab" }, { name: "description", content: "Bubble, selection, insertion, merge, quick and heap sort animations." }] }),
  component: SortPage,
});

type Bar = { id: number; v: number; s?: "cmp" | "swap" | "sorted" };
let bid = 1;

const ALGOS = ["Bubble", "Selection", "Insertion", "Merge", "Quick", "Heap"] as const;

function SortPage() {
  const [bars, setBars] = useState<Bar[]>(() => randomBars(18));
  const [algo, setAlgo] = useState<typeof ALGOS[number]>("Bubble");
  const [speed, setSpeed] = useState(60);
  const [busy, setBusy] = useState(false);
  const [input, setInput] = useState("");
  const [steps, setSteps] = useState<string[]>([]);
  const add = useHistory((s) => s.add);
  const pause = useRef(false); const stop = useRef(false);
  const wait = async () => { while (pause.current && !stop.current) await sleep(50); await sleep(120 - speed); };

  const start = async () => {
    pause.current = false; stop.current = false; setBusy(true);
    const arr = [...bars];
    setSteps([`Sorting ${arr.length} items with ${algo} Sort`]);
    add("Sorting", `${algo} sort start (${arr.length})`);
    if (algo === "Bubble") await bubble(arr, setBars, wait, stop);
    else if (algo === "Selection") await selection(arr, setBars, wait, stop);
    else if (algo === "Insertion") await insertion(arr, setBars, wait, stop);
    else if (algo === "Merge") await merge(arr, 0, arr.length - 1, setBars, wait, stop);
    else if (algo === "Quick") await quick(arr, 0, arr.length - 1, setBars, wait, stop);
    else if (algo === "Heap") await heap(arr, setBars, wait, stop);
    if (!stop.current) setBars(arr.map((b) => ({ ...b, s: "sorted" })));
    setBusy(false); add("Sorting", `${algo} sort done`);
  };

  return (
    <AppLayout>
      <PageHeader icon={BarChart3} title="Sorting Visualizer" subtitle="Choose an algorithm and watch comparisons and swaps animate." />
      <div className="grid lg:grid-cols-[1fr_320px] gap-6">
        <div className="space-y-6">
          <Panel>
            <div className="grid sm:grid-cols-[1fr_auto] gap-3 mb-4">
              <Field label="Custom array (comma or space separated)">
                <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="10,5,8,2,20" />
              </Field>
              <div className="flex items-end gap-2">
                <Btn onClick={() => { const v = input.split(/[,\s]+/).map(Number).filter((x) => !isNaN(x)); if (v.length) setBars(v.map((n) => ({ id: bid++, v: n }))); else notify("Enter values"); }}>Use Input</Btn>
                <Btn onClick={() => setBars(randomBars(18))}>Random</Btn>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mb-4">
              {ALGOS.map((a) => (
                <Btn key={a} variant={algo === a ? "primary" : "default"} onClick={() => setAlgo(a)}>{a} Sort</Btn>
              ))}
            </div>
            <Toolbar>
              <Btn variant="primary" onClick={start} disabled={busy}>Start</Btn>
              <Btn onClick={() => (pause.current = true)} disabled={!busy}>Pause</Btn>
              <Btn onClick={() => (pause.current = false)} disabled={!busy}>Resume</Btn>
              <Btn variant="danger" onClick={() => { stop.current = true; setBusy(false); }}>Reset</Btn>
              <label className="flex items-center gap-2 text-xs text-muted-foreground ml-2">
                Speed
                <input type="range" min={10} max={110} value={speed} onChange={(e) => setSpeed(+e.target.value)} className="accent-primary" />
              </label>
            </Toolbar>
          </Panel>
          <Panel title="Bars">
            <div className="h-72 flex items-end justify-center gap-1 px-2">
              <LayoutGroup>
                {bars.map((b) => (
                  <motion.div key={b.id} layout
                    className={[
                      "w-6 rounded-t-md transition-colors",
                      b.s === "cmp" ? "bg-warning" :
                      b.s === "swap" ? "bg-destructive" :
                      b.s === "sorted" ? "bg-success" :
                      "bg-primary/70",
                    ].join(" ")}
                    style={{ height: `${(b.v / 100) * 100}%` }}
                    title={String(b.v)}
                  />
                ))}
              </LayoutGroup>
            </div>
            <div className="mt-4"><ComplexityBadge time={algoT(algo)} space={algoS(algo)} /></div>
          </Panel>
          <ExplanationPanel steps={steps} />
        </div>
        <div><HistoryPanel scope="Sorting" /></div>
      </div>
    </AppLayout>
  );
}

function randomBars(n: number): Bar[] { return Array.from({ length: n }, () => ({ id: bid++, v: Math.floor(Math.random() * 90) + 10 })); }
function algoT(a: string) { return ({ Bubble: "O(n²)", Selection: "O(n²)", Insertion: "O(n²)", Merge: "O(n log n)", Quick: "O(n log n) avg", Heap: "O(n log n)" } as Record<string, string>)[a]; }
function algoS(a: string) { return ({ Bubble: "O(1)", Selection: "O(1)", Insertion: "O(1)", Merge: "O(n)", Quick: "O(log n)", Heap: "O(1)" } as Record<string, string>)[a]; }

type SetBars = React.Dispatch<React.SetStateAction<Bar[]>>;
type Wait = () => Promise<void>;
type Stop = React.MutableRefObject<boolean>;
const mark = (a: Bar[], setBars: SetBars, idxs: number[], s: Bar["s"]) => setBars(a.map((b, i) => ({ ...b, s: idxs.includes(i) ? s : undefined })));

async function bubble(a: Bar[], setBars: SetBars, wait: Wait, stop: Stop) {
  for (let i = 0; i < a.length; i++) for (let j = 0; j < a.length - i - 1; j++) {
    if (stop.current) return;
    mark(a, setBars, [j, j + 1], "cmp"); await wait();
    if (a[j].v > a[j + 1].v) { [a[j], a[j + 1]] = [a[j + 1], a[j]]; mark(a, setBars, [j, j + 1], "swap"); await wait(); }
  }
}
async function selection(a: Bar[], setBars: SetBars, wait: Wait, stop: Stop) {
  for (let i = 0; i < a.length; i++) {
    let m = i;
    for (let j = i + 1; j < a.length; j++) { if (stop.current) return; mark(a, setBars, [m, j], "cmp"); await wait(); if (a[j].v < a[m].v) m = j; }
    if (m !== i) { [a[i], a[m]] = [a[m], a[i]]; mark(a, setBars, [i, m], "swap"); await wait(); }
  }
}
async function insertion(a: Bar[], setBars: SetBars, wait: Wait, stop: Stop) {
  for (let i = 1; i < a.length; i++) {
    let j = i;
    while (j > 0 && a[j - 1].v > a[j].v) { if (stop.current) return; [a[j], a[j - 1]] = [a[j - 1], a[j]]; mark(a, setBars, [j, j - 1], "swap"); await wait(); j--; }
  }
}
async function merge(a: Bar[], l: number, r: number, setBars: SetBars, wait: Wait, stop: Stop) {
  if (l >= r || stop.current) return;
  const m = (l + r) >> 1;
  await merge(a, l, m, setBars, wait, stop); await merge(a, m + 1, r, setBars, wait, stop);
  const tmp: Bar[] = []; let i = l, j = m + 1;
  while (i <= m && j <= r) { if (stop.current) return; mark(a, setBars, [i, j], "cmp"); await wait(); if (a[i].v <= a[j].v) tmp.push(a[i++]); else tmp.push(a[j++]); }
  while (i <= m) tmp.push(a[i++]); while (j <= r) tmp.push(a[j++]);
  for (let k = 0; k < tmp.length; k++) a[l + k] = tmp[k];
  setBars([...a]); await wait();
}
async function quick(a: Bar[], l: number, r: number, setBars: SetBars, wait: Wait, stop: Stop) {
  if (l >= r || stop.current) return;
  const piv = a[r].v; let i = l - 1;
  for (let j = l; j < r; j++) { if (stop.current) return; mark(a, setBars, [j, r], "cmp"); await wait(); if (a[j].v < piv) { i++; [a[i], a[j]] = [a[j], a[i]]; mark(a, setBars, [i, j], "swap"); await wait(); } }
  [a[i + 1], a[r]] = [a[r], a[i + 1]]; mark(a, setBars, [i + 1, r], "swap"); await wait();
  await quick(a, l, i, setBars, wait, stop); await quick(a, i + 2, r, setBars, wait, stop);
}
async function heap(a: Bar[], setBars: SetBars, wait: Wait, stop: Stop) {
  const n = a.length;
  const sift = async (size: number, root: number) => {
    let i = root;
    while (true) {
      if (stop.current) return;
      const l = 2 * i + 1, r = 2 * i + 2; let b = i;
      if (l < size && a[l].v > a[b].v) b = l;
      if (r < size && a[r].v > a[b].v) b = r;
      if (b !== i) { [a[i], a[b]] = [a[b], a[i]]; mark(a, setBars, [i, b], "swap"); await wait(); i = b; } else break;
    }
  };
  for (let i = (n >> 1) - 1; i >= 0; i--) await sift(n, i);
  for (let end = n - 1; end > 0; end--) { [a[0], a[end]] = [a[end], a[0]]; mark(a, setBars, [0, end], "swap"); await wait(); await sift(end, 0); }
}

function notify(m: string) { const e = document.createElement("div"); e.textContent = m; e.className = "fixed top-20 right-6 z-50 px-4 py-2 rounded-lg bg-destructive text-destructive-foreground text-sm shadow-lg"; document.body.appendChild(e); setTimeout(() => e.remove(), 2200); }
