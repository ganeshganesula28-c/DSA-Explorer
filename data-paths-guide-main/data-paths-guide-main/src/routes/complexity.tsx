import { createFileRoute } from "@tanstack/react-router";
import { Gauge } from "lucide-react";
import { AppLayout, PageHeader, Panel } from "@/components/app-layout";

export const Route = createFileRoute("/complexity")({
  head: () => ({ meta: [{ title: "Complexity Reference — DSALab" }, { name: "description", content: "Big-O time and space complexity reference for common data structures and algorithms." }] }),
  component: CxPage,
});

type Row = { name: string; access: string; search: string; insert: string; del: string; space: string };
const DS: Row[] = [
  { name: "Array", access: "O(1)", search: "O(n)", insert: "O(n)", del: "O(n)", space: "O(n)" },
  { name: "Singly Linked List", access: "O(n)", search: "O(n)", insert: "O(1)", del: "O(1)", space: "O(n)" },
  { name: "Doubly Linked List", access: "O(n)", search: "O(n)", insert: "O(1)", del: "O(1)", space: "O(n)" },
  { name: "Stack", access: "O(n)", search: "O(n)", insert: "O(1)", del: "O(1)", space: "O(n)" },
  { name: "Queue", access: "O(n)", search: "O(n)", insert: "O(1)", del: "O(1)", space: "O(n)" },
  { name: "Hash Table", access: "—", search: "O(1) avg / O(n)", insert: "O(1) avg / O(n)", del: "O(1) avg / O(n)", space: "O(n)" },
  { name: "BST (balanced)", access: "O(log n)", search: "O(log n)", insert: "O(log n)", del: "O(log n)", space: "O(n)" },
  { name: "Binary Heap", access: "O(1) top", search: "O(n)", insert: "O(log n)", del: "O(log n)", space: "O(n)" },
];

type Algo = { name: string; best: string; avg: string; worst: string; space: string };
const SORTS: Algo[] = [
  { name: "Bubble", best: "O(n)", avg: "O(n²)", worst: "O(n²)", space: "O(1)" },
  { name: "Selection", best: "O(n²)", avg: "O(n²)", worst: "O(n²)", space: "O(1)" },
  { name: "Insertion", best: "O(n)", avg: "O(n²)", worst: "O(n²)", space: "O(1)" },
  { name: "Merge", best: "O(n log n)", avg: "O(n log n)", worst: "O(n log n)", space: "O(n)" },
  { name: "Quick", best: "O(n log n)", avg: "O(n log n)", worst: "O(n²)", space: "O(log n)" },
  { name: "Heap", best: "O(n log n)", avg: "O(n log n)", worst: "O(n log n)", space: "O(1)" },
];
const SEARCHES: Algo[] = [
  { name: "Linear Search", best: "O(1)", avg: "O(n)", worst: "O(n)", space: "O(1)" },
  { name: "Binary Search", best: "O(1)", avg: "O(log n)", worst: "O(log n)", space: "O(1)" },
  { name: "BFS / DFS", best: "O(V+E)", avg: "O(V+E)", worst: "O(V+E)", space: "O(V)" },
];

function CxPage() {
  return (
    <AppLayout>
      <PageHeader icon={Gauge} title="Complexity Reference" subtitle="Big-O for the operations you'll see in this app." />
      <div className="space-y-6">
        <Panel title="Data Structures">
          <Table headers={["Structure", "Access", "Search", "Insert", "Delete", "Space"]}>
            {DS.map((r) => (
              <tr key={r.name} className="border-t border-border">
                <td className="py-2 font-medium">{r.name}</td>
                <Td>{r.access}</Td><Td>{r.search}</Td><Td>{r.insert}</Td><Td>{r.del}</Td><Td>{r.space}</Td>
              </tr>
            ))}
          </Table>
        </Panel>
        <Panel title="Sorting Algorithms">
          <Table headers={["Algorithm", "Best", "Average", "Worst", "Space"]}>
            {SORTS.map((r) => (
              <tr key={r.name} className="border-t border-border">
                <td className="py-2 font-medium">{r.name}</td>
                <Td>{r.best}</Td><Td>{r.avg}</Td><Td>{r.worst}</Td><Td>{r.space}</Td>
              </tr>
            ))}
          </Table>
        </Panel>
        <Panel title="Searching & Graph">
          <Table headers={["Algorithm", "Best", "Average", "Worst", "Space"]}>
            {SEARCHES.map((r) => (
              <tr key={r.name} className="border-t border-border">
                <td className="py-2 font-medium">{r.name}</td>
                <Td>{r.best}</Td><Td>{r.avg}</Td><Td>{r.worst}</Td><Td>{r.space}</Td>
              </tr>
            ))}
          </Table>
        </Panel>
      </div>
    </AppLayout>
  );
}
function Table({ headers, children }: { headers: string[]; children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead><tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
          {headers.map((h) => <th key={h} className="pb-3 font-semibold">{h}</th>)}
        </tr></thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}
function Td({ children }: { children: React.ReactNode }) {
  return <td className="py-2 font-mono text-xs"><span className="inline-block px-2 py-0.5 rounded bg-muted">{children}</span></td>;
}
