import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { AppLayout, PageHeader, Panel, Toolbar, Btn, Field, Input, ComplexityBadge, HistoryPanel, ExplanationPanel } from "@/components/app-layout";
import { useHistory } from "@/lib/history";
import { sleep } from "@/lib/utils";

export const Route = createFileRoute("/searching")({
  head: () => ({ meta: [{ title: "Searching Visualizer — DSALab" }, { name: "description", content: "Linear and binary search animations with step-by-step visualization." }] }),
  component: SearchPage,
});

function SearchPage() {
  const [arr, setArr] = useState<number[]>([3, 8, 12, 17, 25, 31, 42, 55, 63, 78, 91]);
  const [target, setTarget] = useState("");
  const [input, setInput] = useState("");
  const [active, setActive] = useState<number | null>(null);
  const [found, setFound] = useState<number | null>(null);
  const [range, setRange] = useState<[number, number] | null>(null);
  const [steps, setSteps] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const add = useHistory((s) => s.add);

  const linear = async () => {
    const t = parseInt(target, 10); if (isNaN(t)) return notify("Enter target");
    setBusy(true); setFound(null); setRange(null);
    const log: string[] = [];
    for (let i = 0; i < arr.length; i++) {
      setActive(i); log.push(`Check arr[${i}]=${arr[i]} vs ${t}`); await sleep(350);
      if (arr[i] === t) { setFound(i); setSteps([...log, `Found at index ${i}`]); add("Searching", `Linear ${t} → @${i}`); setBusy(false); return; }
    }
    setActive(null); setSteps([...log, `${t} not found`]); add("Searching", `Linear ${t} → not found`); setBusy(false);
  };
  const binary = async () => {
    const t = parseInt(target, 10); if (isNaN(t)) return notify("Enter target");
    setBusy(true); setFound(null);
    const a = [...arr].sort((x, y) => x - y); setArr(a);
    let lo = 0, hi = a.length - 1; const log: string[] = ["Array sorted"];
    while (lo <= hi) {
      const m = (lo + hi) >> 1; setRange([lo, hi]); setActive(m);
      log.push(`lo=${lo} hi=${hi} mid=${m} (${a[m]})`); await sleep(500);
      if (a[m] === t) { setFound(m); setSteps([...log, `Found at index ${m}`]); add("Searching", `Binary ${t} → @${m}`); setBusy(false); return; }
      if (a[m] < t) lo = m + 1; else hi = m - 1;
    }
    setActive(null); setRange(null); setSteps([...log, `${t} not found`]); add("Searching", `Binary ${t} → not found`); setBusy(false);
  };

  return (
    <AppLayout>
      <PageHeader icon={Search} title="Searching" subtitle="Linear scan vs. binary search — see every comparison." />
      <div className="grid lg:grid-cols-[1fr_320px] gap-6">
        <div className="space-y-6">
          <Panel>
            <div className="grid sm:grid-cols-2 gap-3 mb-4">
              <Field label="Target"><Input value={target} onChange={(e) => setTarget(e.target.value)} placeholder="e.g. 42" /></Field>
              <Field label="Custom array (comma-separated)">
                <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="3,8,12,17,25" />
              </Field>
            </div>
            <Toolbar>
              <Btn onClick={() => { const v = input.split(/[,\s]+/).map(Number).filter((x) => !isNaN(x)); if (v.length) setArr(v); else notify("Enter values"); }}>Use Input</Btn>
              <Btn variant="primary" onClick={linear} disabled={busy}>Linear Search</Btn>
              <Btn variant="primary" onClick={binary} disabled={busy}>Binary Search</Btn>
            </Toolbar>
          </Panel>
          <Panel title="Array">
            <div className="flex flex-wrap gap-2">
              {arr.map((v, i) => {
                const inR = range && i >= range[0] && i <= range[1];
                return (
                  <motion.div key={i} layout className="flex flex-col items-center">
                    <div className={[
                      "size-14 rounded-lg grid place-items-center font-mono font-bold border-2",
                      found === i ? "border-success bg-success/20" :
                      active === i ? "border-warning bg-warning/30" :
                      inR ? "border-primary bg-primary/10" :
                      "border-border bg-card",
                    ].join(" ")}>{v}</div>
                    <span className="text-[10px] text-muted-foreground mt-1 font-mono">[{i}]</span>
                  </motion.div>
                );
              })}
            </div>
            <div className="mt-4"><ComplexityBadge time="Linear O(n) · Binary O(log n)" space="O(1)" /></div>
          </Panel>
          <ExplanationPanel steps={steps} />
        </div>
        <div><HistoryPanel scope="Searching" /></div>
      </div>
    </AppLayout>
  );
}
function notify(m: string) { const e = document.createElement("div"); e.textContent = m; e.className = "fixed top-20 right-6 z-50 px-4 py-2 rounded-lg bg-destructive text-destructive-foreground text-sm shadow-lg"; document.body.appendChild(e); setTimeout(() => e.remove(), 2200); }
