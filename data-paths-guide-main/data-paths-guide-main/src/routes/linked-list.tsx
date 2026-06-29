import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { ListOrdered, ArrowRight, ArrowLeft } from "lucide-react";
import { AppLayout, PageHeader, Panel, Toolbar, Btn, Field, Input, ComplexityBadge, HistoryPanel, ExplanationPanel } from "@/components/app-layout";
import { useHistory } from "@/lib/history";
import { sleep } from "@/lib/utils";

export const Route = createFileRoute("/linked-list")({
  head: () => ({ meta: [{ title: "Linked List Visualizer — DSALab" }, { name: "description", content: "Singly, doubly, and circular linked lists with insert, delete, reverse and traverse." }] }),
  component: LLPage,
});

type Node = { id: number; val: number; state?: "active" | "match" | "new" };
let nid = 1;
type Kind = "singly" | "doubly" | "circular";

function LLPage() {
  const [kind, setKind] = useState<Kind>("singly");
  const [list, setList] = useState<Node[]>([{ id: nid++, val: 10 }, { id: nid++, val: 20 }, { id: nid++, val: 30 }]);
  const [val, setVal] = useState("");
  const [pos, setPos] = useState("");
  const [busy, setBusy] = useState(false);
  const [steps, setSteps] = useState<string[]>([]);
  const add = useHistory((s) => s.add);
  const N = () => { const n = parseInt(val, 10); if (isNaN(n)) { notify("Enter a numeric value"); return null; } return n; };
  const P = (max: number) => { const p = parseInt(pos, 10); if (isNaN(p) || p < 0 || p > max) { notify(`Position 0..${max}`); return null; } return p; };

  const insBeg = () => { const n = N(); if (n === null) return; setList((l) => [{ id: nid++, val: n, state: "new" }, ...l]); setSteps([`new->next = head`, `head = new`]); add("LinkedList", `Insert ${n} at beginning`); clearStates(); };
  const insEnd = () => { const n = N(); if (n === null) return; setList((l) => [...l, { id: nid++, val: n, state: "new" }]); setSteps([`Traverse to last node`, `last->next = new`]); add("LinkedList", `Insert ${n} at end`); clearStates(); };
  const insPos = () => { const n = N(); if (n === null) return; const p = P(list.length); if (p === null) return; const c = [...list]; c.splice(p, 0, { id: nid++, val: n, state: "new" }); setList(c); setSteps([`Walk to index ${p - 1}`, `new->next = curr->next`, `curr->next = new`]); add("LinkedList", `Insert ${n} at ${p}`); clearStates(); };
  const delBeg = () => { if (!list.length) return notify("List is empty"); const v = list[0].val; setList((l) => l.slice(1)); setSteps([`head = head->next`, `free old head (${v})`]); add("LinkedList", `Delete first (${v})`); };
  const delEnd = () => { if (!list.length) return notify("List is empty"); const v = list[list.length - 1].val; setList((l) => l.slice(0, -1)); setSteps([`Walk to second-last`, `prev->next = NULL`, `free last (${v})`]); add("LinkedList", `Delete last (${v})`); };
  const delPos = () => { const p = P(list.length - 1); if (p === null) return; const v = list[p].val; setList((l) => l.filter((_, i) => i !== p)); setSteps([`Walk to ${p - 1}`, `prev->next = curr->next`, `free (${v})`]); add("LinkedList", `Delete at ${p} (${v})`); };
  const search = async () => {
    const n = N(); if (n === null) return; setBusy(true);
    const log: string[] = [];
    for (let i = 0; i < list.length; i++) {
      log.push(`Compare node[${i}]=${list[i].val} with ${n}`);
      setList((l) => l.map((nd, idx) => ({ ...nd, state: idx === i ? "active" : undefined })));
      await sleep(350);
      if (list[i].val === n) {
        log.push(`Found at index ${i}`);
        setList((l) => l.map((nd, idx) => ({ ...nd, state: idx === i ? "match" : undefined })));
        setSteps(log); add("LinkedList", `Search ${n} → @${i}`); await sleep(600); setBusy(false); clearStates(); return;
      }
    }
    log.push(`Not found`); setSteps(log); add("LinkedList", `Search ${n} → not found`); setBusy(false); clearStates();
  };
  const reverse = async () => {
    setBusy(true); setSteps(["prev=NULL, curr=head", "while curr: next=curr.next; curr.next=prev; prev=curr; curr=next", "head=prev"]);
    const arr = [...list].reverse();
    setList(arr); add("LinkedList", "Reverse"); await sleep(300); setBusy(false);
  };
  const traverse = async () => {
    setBusy(true); const log: string[] = [];
    for (let i = 0; i < list.length; i++) {
      log.push(`Visit ${list[i].val}`);
      setList((l) => l.map((nd, idx) => ({ ...nd, state: idx === i ? "active" : undefined })));
      await sleep(250);
    }
    setSteps(log); add("LinkedList", "Traverse"); clearStates(); setBusy(false);
  };
  const clear = () => { setList([]); add("LinkedList", "Clear"); setSteps(["Cleared"]); };
  const clearStates = () => setTimeout(() => setList((l) => l.map((n) => ({ ...n, state: undefined }))), 500);

  return (
    <AppLayout>
      <PageHeader icon={ListOrdered} title="Linked List" subtitle="Nodes connected by pointers. Switch type below." />
      <div className="grid lg:grid-cols-[1fr_320px] gap-6">
        <div className="space-y-6">
          <Panel>
            <div className="flex gap-2 mb-4">
              {(["singly", "doubly", "circular"] as Kind[]).map((k) => (
                <Btn key={k} variant={kind === k ? "primary" : "default"} onClick={() => setKind(k)}>
                  {k[0].toUpperCase() + k.slice(1)}
                </Btn>
              ))}
            </div>
            <div className="grid sm:grid-cols-2 gap-3 mb-4">
              <Field label="Value"><Input value={val} onChange={(e) => setVal(e.target.value)} placeholder="e.g. 42" /></Field>
              <Field label="Position"><Input value={pos} onChange={(e) => setPos(e.target.value)} placeholder={`0..${list.length}`} /></Field>
            </div>
            <Toolbar>
              <Btn variant="primary" onClick={insBeg} disabled={busy}>Insert Front</Btn>
              <Btn variant="primary" onClick={insEnd} disabled={busy}>Insert End</Btn>
              <Btn variant="primary" onClick={insPos} disabled={busy}>Insert at Position</Btn>
              <Btn onClick={delBeg} disabled={busy}>Delete Front</Btn>
              <Btn onClick={delEnd} disabled={busy}>Delete End</Btn>
              <Btn onClick={delPos} disabled={busy}>Delete at Position</Btn>
              <Btn onClick={search} disabled={busy}>Search</Btn>
              <Btn onClick={traverse} disabled={busy}>Traverse</Btn>
              <Btn onClick={reverse} disabled={busy}>Reverse</Btn>
              <Btn disabled>{`Count: ${list.length}`}</Btn>
              <Btn variant="danger" onClick={clear} disabled={busy}>Clear</Btn>
            </Toolbar>
          </Panel>

          <Panel title={`${kind[0].toUpperCase() + kind.slice(1)} Linked List`}>
            <div className="min-h-[160px] flex flex-wrap items-center gap-2 overflow-x-auto">
              <span className="text-xs font-mono text-muted-foreground">HEAD →</span>
              <LayoutGroup>
                <AnimatePresence>
                  {list.map((n, i) => (
                    <motion.div key={n.id} layout
                      initial={{ opacity: 0, scale: 0.6, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.6, y: 10 }}
                      className="flex items-center gap-1"
                    >
                      <div className={[
                        "px-4 h-12 rounded-lg border-2 grid place-items-center font-mono font-bold",
                        n.state === "active" ? "border-warning bg-warning/20" :
                        n.state === "match" ? "border-success bg-success/20" :
                        n.state === "new" ? "border-primary bg-primary/20" :
                        "border-border bg-card",
                      ].join(" ")}>{n.val}</div>
                      {i < list.length - 1 && (
                        kind === "doubly" ? (
                          <div className="flex flex-col text-muted-foreground"><ArrowRight className="size-3" /><ArrowLeft className="size-3" /></div>
                        ) : <ArrowRight className="size-4 text-muted-foreground" />
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </LayoutGroup>
              {kind === "circular" && list.length > 0 ? (
                <span className="text-xs font-mono text-accent">↻ HEAD</span>
              ) : (
                <span className="text-xs font-mono text-muted-foreground">→ NULL</span>
              )}
            </div>
            <div className="mt-4"><ComplexityBadge time="O(n)" space="O(1)" /></div>
          </Panel>

          <ExplanationPanel steps={steps} />
        </div>
        <div><HistoryPanel scope="LinkedList" /></div>
      </div>
    </AppLayout>
  );
}
function notify(m: string) { const e = document.createElement("div"); e.textContent = m; e.className = "fixed top-20 right-6 z-50 px-4 py-2 rounded-lg bg-destructive text-destructive-foreground text-sm shadow-lg"; document.body.appendChild(e); setTimeout(() => e.remove(), 2200); }
