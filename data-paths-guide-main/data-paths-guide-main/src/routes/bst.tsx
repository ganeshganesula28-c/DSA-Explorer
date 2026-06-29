import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { GitBranch } from "lucide-react";
import { AppLayout, PageHeader, Panel, Toolbar, Btn, Field, Input, ComplexityBadge, HistoryPanel, ExplanationPanel } from "@/components/app-layout";
import { useHistory } from "@/lib/history";
import { sleep } from "@/lib/utils";

export const Route = createFileRoute("/bst")({
  head: () => ({ meta: [{ title: "BST Visualizer — DSALab" }, { name: "description", content: "Binary search tree with insert, delete, search, traversals, and SVG visualization." }] }),
  component: BSTPage,
});

type TNode = { v: number; l: TNode | null; r: TNode | null };

function insertNode(root: TNode | null, v: number): TNode {
  if (!root) return { v, l: null, r: null };
  if (v < root.v) root.l = insertNode(root.l, v);
  else if (v > root.v) root.r = insertNode(root.r, v);
  return root;
}
function deleteNode(root: TNode | null, v: number): TNode | null {
  if (!root) return null;
  if (v < root.v) root.l = deleteNode(root.l, v);
  else if (v > root.v) root.r = deleteNode(root.r, v);
  else {
    if (!root.l) return root.r;
    if (!root.r) return root.l;
    let s = root.r; while (s.l) s = s.l;
    root.v = s.v; root.r = deleteNode(root.r, s.v);
  }
  return root;
}
function countNodes(n: TNode | null): number { return n ? 1 + countNodes(n.l) + countNodes(n.r) : 0; }
function height(n: TNode | null): number { return n ? 1 + Math.max(height(n.l), height(n.r)) : 0; }
function findMin(n: TNode | null): number | null { if (!n) return null; while (n.l) n = n.l; return n.v; }
function findMax(n: TNode | null): number | null { if (!n) return null; while (n.r) n = n.r; return n.v; }
function inorder(n: TNode | null, out: number[] = []): number[] { if (n) { inorder(n.l, out); out.push(n.v); inorder(n.r, out); } return out; }
function preorder(n: TNode | null, out: number[] = []): number[] { if (n) { out.push(n.v); preorder(n.l, out); preorder(n.r, out); } return out; }
function postorder(n: TNode | null, out: number[] = []): number[] { if (n) { postorder(n.l, out); postorder(n.r, out); out.push(n.v); } return out; }
function levelorder(n: TNode | null): number[] { if (!n) return []; const q: TNode[] = [n], out: number[] = []; while (q.length) { const x = q.shift()!; out.push(x.v); if (x.l) q.push(x.l); if (x.r) q.push(x.r); } return out; }

type Pos = { x: number; y: number; v: number };
function layout(n: TNode | null, depth = 0, x = 400, w = 200, pos: Pos[] = [], edges: [Pos, Pos][] = [], parent?: Pos): { pos: Pos[]; edges: [Pos, Pos][] } {
  if (!n) return { pos, edges };
  const me: Pos = { x, y: 60 + depth * 80, v: n.v };
  pos.push(me);
  if (parent) edges.push([parent, me]);
  layout(n.l, depth + 1, x - w, w / 2, pos, edges, me);
  layout(n.r, depth + 1, x + w, w / 2, pos, edges, me);
  return { pos, edges };
}

function BSTPage() {
  const [root, setRoot] = useState<TNode | null>(() => [50, 30, 70, 20, 40, 60, 80].reduce<TNode | null>((r, v) => insertNode(r, v), null));
  const [val, setVal] = useState("");
  const [steps, setSteps] = useState<string[]>([]);
  const [highlight, setHighlight] = useState<Set<number>>(new Set());
  const add = useHistory((s) => s.add);
  const N = () => { const n = parseInt(val, 10); if (isNaN(n)) { notify("Enter a numeric value"); return null; } return n; };

  const { pos, edges } = useMemo(() => layout(root), [root]);

  const insert = () => { const n = N(); if (n === null) return; setRoot((r) => insertNode(r ? { ...r } : null, n)); setSteps([`Compare ${n} with root`, "Go left if smaller, right if greater", `Insert as leaf`]); add("BST", `Insert ${n}`); };
  const remove = () => { const n = N(); if (n === null) return; setRoot((r) => deleteNode(r, n)); setSteps([`Locate ${n}`, "If two children, replace with inorder successor"]); add("BST", `Delete ${n}`); };
  const search = async () => {
    const n = N(); if (n === null) return;
    const path: number[] = []; let cur = root;
    while (cur) { path.push(cur.v); if (n === cur.v) break; cur = n < cur.v ? cur.l : cur.r; }
    setSteps(path.map((v, i) => `Step ${i + 1}: visit ${v}`).concat(cur ? [`Found ${n}`] : [`${n} not found`]));
    add("BST", `Search ${n} → ${cur ? "found" : "not found"}`);
    for (const v of path) { setHighlight(new Set([v])); await sleep(350); }
    setHighlight(new Set(path)); await sleep(700); setHighlight(new Set());
  };
  const traverse = async (mode: "in" | "pre" | "post" | "level") => {
    const arr = mode === "in" ? inorder(root) : mode === "pre" ? preorder(root) : mode === "post" ? postorder(root) : levelorder(root);
    setSteps([`${mode}-order traversal:`, arr.join(" → ")]);
    add("BST", `${mode}-order: ${arr.join(",")}`);
    for (const v of arr) { setHighlight(new Set([v])); await sleep(300); }
    setHighlight(new Set()); 
  };

  const w = 820, h = Math.max(220, 80 + height(root) * 80 + 40);

  return (
    <AppLayout>
      <PageHeader icon={GitBranch} title="Binary Search Tree" subtitle="Insert, delete, search, traverse — with live SVG layout." />
      <div className="grid lg:grid-cols-[1fr_320px] gap-6">
        <div className="space-y-6">
          <Panel>
            <Field label="Value"><Input value={val} onChange={(e) => setVal(e.target.value)} placeholder="e.g. 45" /></Field>
            <Toolbar>
              <Btn variant="primary" onClick={insert}>Insert</Btn>
              <Btn onClick={remove}>Delete</Btn>
              <Btn onClick={search}>Search</Btn>
              <Btn onClick={() => traverse("in")}>Inorder</Btn>
              <Btn onClick={() => traverse("pre")}>Preorder</Btn>
              <Btn onClick={() => traverse("post")}>Postorder</Btn>
              <Btn onClick={() => traverse("level")}>Level Order</Btn>
              <Btn disabled>{`Min: ${findMin(root) ?? "—"}`}</Btn>
              <Btn disabled>{`Max: ${findMax(root) ?? "—"}`}</Btn>
              <Btn disabled>{`Height: ${height(root)}`}</Btn>
              <Btn disabled>{`Nodes: ${countNodes(root)}`}</Btn>
              <Btn variant="danger" onClick={() => { setRoot(null); add("BST", "Clear"); }}>Clear</Btn>
            </Toolbar>
          </Panel>
          <Panel title="Tree">
            <div className="overflow-x-auto">
              <svg width={w} height={h} className="mx-auto">
                {edges.map(([a, b], i) => (
                  <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="currentColor" className="text-border" strokeWidth={2} />
                ))}
                {pos.map((p) => {
                  const on = highlight.has(p.v);
                  return (
                    <motion.g key={p.v} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                      <circle cx={p.x} cy={p.y} r={22} className={on ? "fill-primary stroke-primary" : "fill-card stroke-border"} strokeWidth={2} />
                      <text x={p.x} y={p.y + 5} textAnchor="middle" className={["font-mono font-bold", on ? "fill-primary-foreground" : "fill-foreground"].join(" ")} fontSize={14}>{p.v}</text>
                    </motion.g>
                  );
                })}
                {!root && <text x={w / 2} y={h / 2} textAnchor="middle" className="fill-muted-foreground italic">Empty — insert a value</text>}
              </svg>
            </div>
            <div className="mt-4"><ComplexityBadge time="O(log n) avg, O(n) worst" space="O(n)" /></div>
          </Panel>
          <ExplanationPanel steps={steps} />
        </div>
        <div><HistoryPanel scope="BST" /></div>
      </div>
    </AppLayout>
  );
}
function notify(m: string) { const e = document.createElement("div"); e.textContent = m; e.className = "fixed top-20 right-6 z-50 px-4 py-2 rounded-lg bg-destructive text-destructive-foreground text-sm shadow-lg"; document.body.appendChild(e); setTimeout(() => e.remove(), 2200); }
