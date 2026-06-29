import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { Boxes } from "lucide-react";
import { AppLayout, PageHeader, Panel, Toolbar, Btn, Field, Input, ComplexityBadge, HistoryPanel, ExplanationPanel } from "@/components/app-layout";
import { useHistory } from "@/lib/history";
import { sleep } from "@/lib/utils";

export const Route = createFileRoute("/array")({
  head: () => ({ meta: [{ title: "Array Visualizer — DSALab" }, { name: "description", content: "Insert, delete, search, sort and reverse arrays with animated step-by-step visualization." }] }),
  component: ArrayPage,
});

type Cell = { id: number; val: number; state?: "active" | "match" | "moved" | "sorted" };
let nextId = 1;

function ArrayPage() {
  const [arr, setArr] = useState<Cell[]>(
    [10, 25, 7, 42, 18].map((v) => ({ id: nextId++, val: v })),
  );
  const [val, setVal] = useState("");
  const [pos, setPos] = useState("");
  const [busy, setBusy] = useState(false);
  const [steps, setSteps] = useState<string[]>([]);
  const [complexity, setComplexity] = useState({ t: "O(1)", s: "O(1)" });
  const add = useHistory((s) => s.add);

  const intVal = () => {
    const n = parseInt(val, 10);
    if (isNaN(n)) { toast("Enter a numeric value"); return null; }
    return n;
  };
  const intPos = (max: number) => {
    const p = parseInt(pos, 10);
    if (isNaN(p) || p < 0 || p > max) { toast(`Position must be 0..${max}`); return null; }
    return p;
  };

  const insertBeg = async () => {
    const n = intVal(); if (n === null) return;
    setBusy(true);
    setComplexity({ t: "O(n)", s: "O(1)" });
    setSteps(["Shift all elements right by 1", `Place ${n} at index 0`]);
    setArr((a) => [{ id: nextId++, val: n, state: "moved" }, ...a]);
    add("Array", `Insert ${n} at beginning`);
    await sleep(500);
    setArr((a) => a.map((c) => ({ ...c, state: undefined })));
    setBusy(false);
  };
  const insertEnd = async () => {
    const n = intVal(); if (n === null) return;
    setBusy(true);
    setComplexity({ t: "O(1)", s: "O(1)" });
    setSteps([`Append ${n} at index ${arr.length}`]);
    setArr((a) => [...a, { id: nextId++, val: n, state: "moved" }]);
    add("Array", `Insert ${n} at end`);
    await sleep(500);
    setArr((a) => a.map((c) => ({ ...c, state: undefined })));
    setBusy(false);
  };
  const insertPos = async () => {
    const n = intVal(); if (n === null) return;
    const p = intPos(arr.length); if (p === null) return;
    setBusy(true);
    setComplexity({ t: "O(n)", s: "O(1)" });
    setSteps([`Shift elements from index ${p} right`, `Insert ${n} at index ${p}`]);
    const copy = [...arr];
    copy.splice(p, 0, { id: nextId++, val: n, state: "moved" });
    setArr(copy);
    add("Array", `Insert ${n} at position ${p}`);
    await sleep(500);
    setArr((a) => a.map((c) => ({ ...c, state: undefined })));
    setBusy(false);
  };
  const delBeg = async () => {
    if (!arr.length) return toast("Array is empty");
    setBusy(true); setComplexity({ t: "O(n)", s: "O(1)" });
    setSteps([`Remove element at index 0 (${arr[0].val})`, "Shift remaining elements left"]);
    add("Array", `Delete from beginning (${arr[0].val})`);
    setArr((a) => a.slice(1));
    await sleep(300); setBusy(false);
  };
  const delEnd = async () => {
    if (!arr.length) return toast("Array is empty");
    setBusy(true); setComplexity({ t: "O(1)", s: "O(1)" });
    setSteps([`Remove last element (${arr[arr.length - 1].val})`]);
    add("Array", `Delete from end (${arr[arr.length - 1].val})`);
    setArr((a) => a.slice(0, -1));
    await sleep(300); setBusy(false);
  };
  const delPos = async () => {
    const p = intPos(arr.length - 1); if (p === null) return;
    setBusy(true); setComplexity({ t: "O(n)", s: "O(1)" });
    setSteps([`Remove element at index ${p} (${arr[p].val})`, "Shift elements left"]);
    add("Array", `Delete at position ${p}`);
    setArr((a) => a.filter((_, i) => i !== p));
    await sleep(300); setBusy(false);
  };
  const update = async () => {
    const n = intVal(); if (n === null) return;
    const p = intPos(arr.length - 1); if (p === null) return;
    setBusy(true); setComplexity({ t: "O(1)", s: "O(1)" });
    setSteps([`Replace value at index ${p}: ${arr[p].val} → ${n}`]);
    add("Array", `Update index ${p} to ${n}`);
    setArr((a) => a.map((c, i) => (i === p ? { ...c, val: n, state: "match" } : c)));
    await sleep(600);
    setArr((a) => a.map((c) => ({ ...c, state: undefined })));
    setBusy(false);
  };
  const search = async () => {
    const n = intVal(); if (n === null) return;
    setBusy(true); setComplexity({ t: "O(n)", s: "O(1)" });
    const stepLog: string[] = [];
    let found = -1;
    for (let i = 0; i < arr.length; i++) {
      stepLog.push(`Compare arr[${i}]=${arr[i].val} with ${n}`);
      setArr((a) => a.map((c, idx) => ({ ...c, state: idx === i ? "active" : undefined })));
      await sleep(350);
      if (arr[i].val === n) { found = i; break; }
    }
    if (found >= 0) {
      stepLog.push(`Found ${n} at index ${found}`);
      setArr((a) => a.map((c, idx) => ({ ...c, state: idx === found ? "match" : undefined })));
    } else {
      stepLog.push(`${n} not found`);
      setArr((a) => a.map((c) => ({ ...c, state: undefined })));
    }
    setSteps(stepLog);
    add("Array", `Search ${n} → ${found >= 0 ? `found @${found}` : "not found"}`);
    await sleep(700);
    setArr((a) => a.map((c) => ({ ...c, state: undefined })));
    setBusy(false);
  };
  const traverse = async () => {
    setBusy(true); setComplexity({ t: "O(n)", s: "O(1)" });
    const stepLog: string[] = [];
    for (let i = 0; i < arr.length; i++) {
      stepLog.push(`Visit arr[${i}] = ${arr[i].val}`);
      setArr((a) => a.map((c, idx) => ({ ...c, state: idx === i ? "active" : undefined })));
      await sleep(250);
    }
    setSteps(stepLog);
    add("Array", "Traverse");
    setArr((a) => a.map((c) => ({ ...c, state: undefined })));
    setBusy(false);
  };
  const sortAsc = async () => {
    setBusy(true); setComplexity({ t: "O(n²)", s: "O(1)" });
    const a = [...arr];
    for (let i = 0; i < a.length; i++) {
      for (let j = 0; j < a.length - i - 1; j++) {
        setArr(a.map((c, idx) => ({ ...c, state: idx === j || idx === j + 1 ? "active" : undefined })));
        await sleep(120);
        if (a[j].val > a[j + 1].val) {
          [a[j], a[j + 1]] = [a[j + 1], a[j]];
          setArr([...a]);
        }
      }
      a[a.length - i - 1] = { ...a[a.length - i - 1], state: "sorted" };
    }
    setArr(a.map((c) => ({ ...c, state: "sorted" })));
    setSteps(["Bubble sort: compare adjacent pairs", "Swap when out of order", "Largest bubbles to end each pass"]);
    add("Array", "Sort (bubble)");
    await sleep(500);
    setArr((x) => x.map((c) => ({ ...c, state: undefined })));
    setBusy(false);
  };
  const reverse = async () => {
    setBusy(true); setComplexity({ t: "O(n)", s: "O(1)" });
    setSteps(["Swap arr[i] with arr[n-1-i]", "Stop at the middle"]);
    add("Array", "Reverse");
    const a = [...arr];
    let i = 0, j = a.length - 1;
    while (i < j) {
      [a[i], a[j]] = [a[j], a[i]];
      setArr([...a].map((c, idx) => ({ ...c, state: idx === i || idx === j ? "active" : undefined })));
      await sleep(200);
      i++; j--;
    }
    setArr(a.map((c) => ({ ...c, state: undefined })));
    setBusy(false);
  };
  const clear = () => { setArr([]); add("Array", "Clear"); setSteps(["Array cleared"]); };

  return (
    <AppLayout>
      <PageHeader icon={Boxes} title="Array Visualizer" subtitle="Insert, delete, search, sort, traverse — real algorithms on your data." />
      <div className="grid lg:grid-cols-[1fr_320px] gap-6">
        <div className="space-y-6">
          <Panel>
            <div className="grid sm:grid-cols-2 gap-3 mb-4">
              <Field label="Value"><Input value={val} onChange={(e) => setVal(e.target.value)} placeholder="e.g. 42" /></Field>
              <Field label="Position (0-indexed)"><Input value={pos} onChange={(e) => setPos(e.target.value)} placeholder={`0..${arr.length}`} /></Field>
            </div>
            <Toolbar>
              <Btn variant="primary" onClick={insertBeg} disabled={busy}>Insert Beginning</Btn>
              <Btn variant="primary" onClick={insertEnd} disabled={busy}>Insert End</Btn>
              <Btn variant="primary" onClick={insertPos} disabled={busy}>Insert at Position</Btn>
              <Btn onClick={delBeg} disabled={busy}>Delete Beginning</Btn>
              <Btn onClick={delEnd} disabled={busy}>Delete End</Btn>
              <Btn onClick={delPos} disabled={busy}>Delete at Position</Btn>
              <Btn onClick={update} disabled={busy}>Update</Btn>
              <Btn onClick={search} disabled={busy}>Search</Btn>
              <Btn onClick={traverse} disabled={busy}>Traverse</Btn>
              <Btn onClick={sortAsc} disabled={busy}>Sort</Btn>
              <Btn onClick={reverse} disabled={busy}>Reverse</Btn>
              <Btn variant="danger" onClick={clear} disabled={busy}>Clear</Btn>
            </Toolbar>
          </Panel>

          <Panel title={`Current Array · size ${arr.length}`}>
            <div className="min-h-[140px] flex items-center">
              <LayoutGroup>
                <div className="flex flex-wrap gap-2">
                  <AnimatePresence>
                    {arr.map((c, i) => (
                      <motion.div
                        key={c.id} layout
                        initial={{ opacity: 0, scale: 0.7, y: -16 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.7, y: 16 }}
                        transition={{ type: "spring", stiffness: 320, damping: 28 }}
                        className="flex flex-col items-center"
                      >
                        <div className={[
                          "size-16 rounded-lg grid place-items-center font-mono font-bold text-lg border-2 transition-colors",
                          c.state === "active" ? "border-warning bg-warning/20 text-warning-foreground" :
                          c.state === "match" ? "border-success bg-success/20" :
                          c.state === "sorted" ? "border-success bg-success/10" :
                          c.state === "moved" ? "border-primary bg-primary/15" :
                          "border-border bg-muted",
                        ].join(" ")}>{c.val}</div>
                        <span className="text-xs text-muted-foreground mt-1 font-mono">[{i}]</span>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </LayoutGroup>
              {!arr.length && <div className="text-muted-foreground italic">Empty array. Insert a value to begin.</div>}
            </div>
            <div className="mt-4"><ComplexityBadge time={complexity.t} space={complexity.s} /></div>
          </Panel>

          <ExplanationPanel steps={steps} />
        </div>

        <div className="space-y-6"><HistoryPanel scope="Array" /></div>
      </div>
    </AppLayout>
  );
}

function toast(msg: string) {
  if (typeof window !== "undefined") {
    const el = document.createElement("div");
    el.textContent = msg;
    el.className = "fixed top-20 right-6 z-50 px-4 py-2 rounded-lg bg-destructive text-destructive-foreground text-sm shadow-lg";
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2200);
  }
}
