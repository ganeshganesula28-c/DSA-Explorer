export type SearchEntry = {
  label: string;
  route: string;
  op?: string;
  keywords: string[];
};

export const searchIndex: SearchEntry[] = [
  { label: "Array", route: "/array", keywords: ["array", "list"] },
  { label: "Array · Insert", route: "/array", op: "insert-end", keywords: ["array", "insert", "add"] },
  { label: "Array · Delete", route: "/array", op: "delete-end", keywords: ["array", "delete", "remove"] },
  { label: "Array · Search", route: "/array", op: "search", keywords: ["array", "search", "linear search"] },
  { label: "Array · Sort", route: "/array", op: "sort", keywords: ["array", "sort"] },
  { label: "Array · Reverse", route: "/array", op: "reverse", keywords: ["array", "reverse"] },
  { label: "Singly Linked List", route: "/linked-list", keywords: ["linked list", "singly"] },
  { label: "Doubly Linked List", route: "/linked-list", op: "doubly", keywords: ["doubly linked list"] },
  { label: "Circular Linked List", route: "/linked-list", op: "circular", keywords: ["circular linked list"] },
  { label: "Stack", route: "/stack", keywords: ["stack"] },
  { label: "Stack · Push", route: "/stack", op: "push", keywords: ["stack", "push"] },
  { label: "Stack · Pop", route: "/stack", op: "pop", keywords: ["stack", "pop"] },
  { label: "Queue", route: "/queue", keywords: ["queue", "enqueue", "dequeue"] },
  { label: "Circular Queue", route: "/circular-queue", keywords: ["circular queue"] },
  { label: "Deque", route: "/deque", keywords: ["deque", "double ended queue"] },
  { label: "Binary Search Tree", route: "/bst", keywords: ["bst", "tree", "binary search tree"] },
  { label: "Heap", route: "/heap", keywords: ["heap", "min heap", "max heap"] },
  { label: "Graph", route: "/graph", keywords: ["graph", "bfs", "dfs"] },
  { label: "Graph · BFS", route: "/graph", op: "bfs", keywords: ["bfs", "breadth first search"] },
  { label: "Graph · DFS", route: "/graph", op: "dfs", keywords: ["dfs", "depth first search"] },
  { label: "Hash Table", route: "/hash-table", keywords: ["hash table", "hash map"] },
  { label: "Sorting", route: "/sorting", keywords: ["sort", "bubble", "merge", "quick", "heap sort"] },
  { label: "Searching", route: "/searching", keywords: ["search", "binary search", "linear search"] },
  { label: "Complexity", route: "/complexity", keywords: ["complexity", "big o"] },
  { label: "Quiz", route: "/quiz", keywords: ["quiz", "test"] },
];

export function searchEntries(q: string): SearchEntry[] {
  const s = q.toLowerCase().trim();
  if (!s) return [];
  return searchIndex
    .filter((e) => e.label.toLowerCase().includes(s) || e.keywords.some((k) => k.includes(s)))
    .slice(0, 8);
}
