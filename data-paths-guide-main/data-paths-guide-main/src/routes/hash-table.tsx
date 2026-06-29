import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Hash } from "lucide-react";
import { AppLayout, PageHeader, Panel, Toolbar, Btn, Field, Input, ComplexityBadge, HistoryPanel, ExplanationPanel } from "@/components/app-layout";
import { useHistory } from "@/lib/history";

export const Route = createFileRoute("/hash-table")({
  head: () => ({ meta: [{ title: "Hash Table Visualizer — DSALab" }, { name: "description", content: "Hash table with chaining for collisions, insert/search/delete visualizations." }] }),
  component: HashPage,
});

const BUCKETS = 7;
function hash(key: string): number {
  let h = 0; for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) | 0;
  return Math.abs(h) % BUCKETS;
}

type Entry = { k: string; v: string };

function HashPage() {
  const [table, setTable] = useState<Entry[][]>(() => Array.from({ length: BUCKETS }, () => []));
  const [k, setK] = useState(""); const [v, setV] = useState("");
  const [steps, setSteps] = useState<string[]>([]);
  const [active, setActive] = useState<number | null>(null);
  const add = useHistory((s) => s.add);

  const insert = () => {
    const key = k.trim(); if (!key) return notify("Enter a key");
    const i = hash(key); setActive(i);
    setTable((t) => {
      const c = t.map((b) => [...b]);
      const exist = c[i].findIndex((e) => e.k === key);
      if (exist >= 0) c[i][exist] = { k: key, v };
      else c[i].push({ k: key, v });
      return c;
    });
    setSteps([`Compute hash("${key}") = ${i}`, `Insert into bucket ${i}`, "Collisions handled by chaining"]);
    add("HashTable", `Insert ${key}=${v} → b${i}`);
  };
  const search = () => {
    const key = k.trim(); if (!key) return notify("Enter a key");
    const i = hash(key); setActive(i);
    const e = table[i].find((x) => x.k === key);
    setSteps([`Compute hash("${key}") = ${i}`, `Scan chain in bucket ${i}`, e ? `Found "${key}" → "${e.v}"` : `"${key}" not found`]);
    add("HashTable", `Search ${key} → ${e ? "found" : "not found"}`);
  };
  const remove = () => {
    const key = k.trim(); if (!key) return notify("Enter a key");
    const i = hash(key); setActive(i);
    setTable((t) => { const c = t.map((b) => b.filter((e) => e.k !== key)); return c; });
    setSteps([`hash("${key}") = ${i}`, `Remove from bucket ${i} chain`]);
    add("HashTable", `Delete ${key}`);
  };

  return (
    <AppLayout>
      <PageHeader icon={Hash} title="Hash Table" subtitle="Open hashing (chaining) — visualizes hash computation and collisions." />
      <div className="grid lg:grid-cols-[1fr_320px] gap-6">
        <div className="space-y-6">
          <Panel>
            <div className="grid sm:grid-cols-2 gap-3 mb-4">
              <Field label="Key"><Input value={k} onChange={(e) => setK(e.target.value)} placeholder="e.g. name" /></Field>
              <Field label="Value"><Input value={v} onChange={(e) => setV(e.target.value)} placeholder="e.g. alice" /></Field>
            </div>
            <Toolbar>
              <Btn variant="primary" onClick={insert}>Insert</Btn>
              <Btn onClick={search}>Search</Btn>
              <Btn onClick={remove}>Delete</Btn>
              <Btn variant="danger" onClick={() => { setTable(Array.from({ length: BUCKETS }, () => [])); add("HashTable", "Clear"); }}>Clear</Btn>
            </Toolbar>
          </Panel>
          <Panel title={`Buckets (size ${BUCKETS})`}>
            <div className="space-y-2">
              {table.map((bucket, i) => (
                <div key={i} className={["flex items-center gap-3 p-2 rounded-lg border-2 transition-colors",
                  active === i ? "border-primary bg-primary/10" : "border-border bg-card"].join(" ")}>
                  <div className="size-10 rounded-md gradient-bg text-primary-foreground grid place-items-center font-mono font-bold text-sm">{i}</div>
                  <div className="text-muted-foreground">→</div>
                  <div className="flex gap-2 flex-wrap flex-1">
                    <AnimatePresence>
                      {bucket.map((e) => (
                        <motion.div key={e.k} layout
                          initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.7 }}
                          className="px-3 py-1.5 rounded-md bg-muted border border-border text-xs font-mono">
                          <span className="text-primary">{e.k}</span>:<span className="text-foreground">{e.v}</span>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    {!bucket.length && <span className="text-xs text-muted-foreground italic">empty</span>}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4"><ComplexityBadge time="O(1) avg, O(n) worst" space="O(n)" /></div>
          </Panel>
          <ExplanationPanel steps={steps} />
        </div>
        <div><HistoryPanel scope="HashTable" /></div>
      </div>
    </AppLayout>
  );
}
function notify(m: string) { const e = document.createElement("div"); e.textContent = m; e.className = "fixed top-20 right-6 z-50 px-4 py-2 rounded-lg bg-destructive text-destructive-foreground text-sm shadow-lg"; document.body.appendChild(e); setTimeout(() => e.remove(), 2200); }
