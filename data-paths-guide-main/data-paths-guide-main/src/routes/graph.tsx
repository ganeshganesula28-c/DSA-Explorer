import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Network } from "lucide-react";
import { AppLayout, PageHeader, Panel, Toolbar, Btn, Field, Input, ComplexityBadge, HistoryPanel, ExplanationPanel } from "@/components/app-layout";
import { useHistory } from "@/lib/history";
import { sleep } from "@/lib/utils";

export const Route = createFileRoute("/graph")({
  head: () => ({ meta: [{ title: "Graph Visualizer — DSALab" }, { name: "description", content: "Build a graph with draggable nodes, animate BFS and DFS traversals." }] }),
  component: GraphPage,
});

type V = { id: string; x: number; y: number };

function GraphPage() {
  const [verts, setVerts] = useState<V[]>([
    { id: "A", x: 200, y: 100 }, { id: "B", x: 400, y: 100 }, { id: "C", x: 300, y: 230 },
    { id: "D", x: 150, y: 320 }, { id: "E", x: 450, y: 320 },
  ]);
  const [edges, setEdges] = useState<[string, string][]>([["A", "B"], ["A", "C"], ["B", "C"], ["C", "D"], ["C", "E"]]);
  const [vName, setVName] = useState("");
  const [src, setSrc] = useState("A");
  const [dst, setDst] = useState("B");
  const [visited, setVisited] = useState<Set<string>>(new Set());
  const [current, setCurrent] = useState<string | null>(null);
  const [steps, setSteps] = useState<string[]>([]);
  const add = useHistory((s) => s.add);
  const svgRef = useRef<SVGSVGElement>(null);
  const drag = useRef<{ id: string } | null>(null);

  const adj = (id: string) => edges.filter((e) => e[0] === id || e[1] === id).map((e) => (e[0] === id ? e[1] : e[0]));

  const addVertex = () => {
    const id = vName.trim().toUpperCase();
    if (!id) return notify("Enter vertex label");
    if (verts.find((v) => v.id === id)) return notify("Duplicate Vertex");
    setVerts((vs) => [...vs, { id, x: 100 + Math.random() * 500, y: 80 + Math.random() * 280 }]);
    add("Graph", `Add vertex ${id}`); setVName("");
  };
  const removeVertex = () => {
    const id = vName.trim().toUpperCase();
    if (!verts.find((v) => v.id === id)) return notify("Vertex not found");
    setVerts((vs) => vs.filter((v) => v.id !== id));
    setEdges((es) => es.filter(([a, b]) => a !== id && b !== id));
    add("Graph", `Remove vertex ${id}`);
  };
  const addEdge = () => {
    const a = src.toUpperCase(), b = dst.toUpperCase();
    if (!verts.find((v) => v.id === a) || !verts.find((v) => v.id === b)) return notify("Vertex not found");
    if (a === b) return notify("Self-loops disabled");
    if (edges.find(([x, y]) => (x === a && y === b) || (x === b && y === a))) return notify("Edge exists");
    setEdges((e) => [...e, [a, b]]); add("Graph", `Add edge ${a}-${b}`);
  };
  const removeEdge = () => {
    const a = src.toUpperCase(), b = dst.toUpperCase();
    setEdges((e) => e.filter(([x, y]) => !((x === a && y === b) || (x === b && y === a))));
    add("Graph", `Remove edge ${a}-${b}`);
  };

  const bfs = async () => {
    const start = src.toUpperCase();
    if (!verts.find((v) => v.id === start)) return notify("Source not found");
    setVisited(new Set()); const v = new Set<string>(); const q = [start]; v.add(start);
    const log: string[] = [`Start BFS from ${start}`];
    while (q.length) {
      const cur = q.shift()!; setCurrent(cur); log.push(`Visit ${cur}`);
      v.add(cur); setVisited(new Set(v)); await sleep(450);
      for (const n of adj(cur)) if (!v.has(n)) { v.add(n); q.push(n); }
    }
    setCurrent(null); setSteps(log); add("Graph", `BFS from ${start}`);
  };
  const dfs = async () => {
    const start = src.toUpperCase();
    if (!verts.find((v) => v.id === start)) return notify("Source not found");
    const v = new Set<string>(); const log: string[] = [`Start DFS from ${start}`];
    setVisited(new Set());
    const go = async (id: string) => {
      v.add(id); setCurrent(id); setVisited(new Set(v)); log.push(`Visit ${id}`); await sleep(450);
      for (const n of adj(id)) if (!v.has(n)) await go(n);
    };
    await go(start); setCurrent(null); setSteps(log); add("Graph", `DFS from ${start}`);
  };

  const onDown = (id: string) => () => { drag.current = { id }; };
  const onMove = (e: React.MouseEvent) => {
    if (!drag.current || !svgRef.current) return;
    const r = svgRef.current.getBoundingClientRect();
    const x = e.clientX - r.left, y = e.clientY - r.top;
    setVerts((vs) => vs.map((v) => (v.id === drag.current!.id ? { ...v, x, y } : v)));
  };
  const onUp = () => { drag.current = null; };

  return (
    <AppLayout>
      <PageHeader icon={Network} title="Graph" subtitle="Drag nodes. Run BFS / DFS animations." />
      <div className="grid lg:grid-cols-[1fr_320px] gap-6">
        <div className="space-y-6">
          <Panel>
            <div className="grid sm:grid-cols-3 gap-3 mb-4">
              <Field label="Vertex"><Input value={vName} onChange={(e) => setVName(e.target.value)} placeholder="e.g. F" /></Field>
              <Field label="Source"><Input value={src} onChange={(e) => setSrc(e.target.value)} placeholder="A" /></Field>
              <Field label="Destination"><Input value={dst} onChange={(e) => setDst(e.target.value)} placeholder="B" /></Field>
            </div>
            <Toolbar>
              <Btn variant="primary" onClick={addVertex}>Add Vertex</Btn>
              <Btn onClick={removeVertex}>Remove Vertex</Btn>
              <Btn variant="primary" onClick={addEdge}>Add Edge</Btn>
              <Btn onClick={removeEdge}>Remove Edge</Btn>
              <Btn onClick={bfs}>BFS</Btn>
              <Btn onClick={dfs}>DFS</Btn>
              <Btn variant="danger" onClick={() => { setVerts([]); setEdges([]); setVisited(new Set()); add("Graph", "Clear"); }}>Clear</Btn>
            </Toolbar>
          </Panel>
          <Panel title="Graph (drag nodes)">
            <svg ref={svgRef} width="100%" height="420" onMouseMove={onMove} onMouseUp={onUp} onMouseLeave={onUp} className="bg-muted/30 rounded-lg cursor-grab">
              {edges.map(([a, b], i) => {
                const va = verts.find((v) => v.id === a), vb = verts.find((v) => v.id === b);
                if (!va || !vb) return null;
                return <line key={i} x1={va.x} y1={va.y} x2={vb.x} y2={vb.y} stroke="currentColor" className="text-border" strokeWidth={2} />;
              })}
              {verts.map((v) => {
                const on = visited.has(v.id), cur = current === v.id;
                return (
                  <motion.g key={v.id} onMouseDown={onDown(v.id)} style={{ cursor: "grab" }} initial={{ scale: 0 }} animate={{ scale: 1 }}>
                    <circle cx={v.x} cy={v.y} r={24} className={cur ? "fill-warning stroke-warning" : on ? "fill-success stroke-success" : "fill-primary stroke-primary"} strokeWidth={2} />
                    <text x={v.x} y={v.y + 5} textAnchor="middle" className="fill-primary-foreground font-mono font-bold pointer-events-none" fontSize={14}>{v.id}</text>
                  </motion.g>
                );
              })}
            </svg>
            <div className="mt-4"><ComplexityBadge time="O(V + E)" space="O(V)" /></div>
          </Panel>
          <ExplanationPanel steps={steps} />
        </div>
        <div><HistoryPanel scope="Graph" /></div>
      </div>
    </AppLayout>
  );
}
function notify(m: string) { const e = document.createElement("div"); e.textContent = m; e.className = "fixed top-20 right-6 z-50 px-4 py-2 rounded-lg bg-destructive text-destructive-foreground text-sm shadow-lg"; document.body.appendChild(e); setTimeout(() => e.remove(), 2200); }
