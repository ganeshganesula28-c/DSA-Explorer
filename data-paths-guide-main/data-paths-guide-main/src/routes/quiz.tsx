import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { GraduationCap, Check, X, RotateCw } from "lucide-react";
import { AppLayout, PageHeader, Panel, Btn } from "@/components/app-layout";
import { useLocalStorage } from "@/lib/storage";

export const Route = createFileRoute("/quiz")({
  head: () => ({ meta: [{ title: "Quiz — DSALab" }, { name: "description", content: "Test your understanding of data structures and algorithms." }] }),
  component: QuizPage,
});

type Q = { q: string; opts: string[]; ans: number; topic: string };
const BANK: Q[] = [
  { topic: "Array", q: "Time complexity to insert at the beginning of an array?", opts: ["O(1)", "O(log n)", "O(n)", "O(n²)"], ans: 2 },
  { topic: "Array", q: "Accessing array[i] is:", opts: ["O(1)", "O(log n)", "O(n)", "O(n log n)"], ans: 0 },
  { topic: "Linked List", q: "Insert at head of a singly linked list:", opts: ["O(n)", "O(1)", "O(log n)", "O(n²)"], ans: 1 },
  { topic: "Stack", q: "Stack follows which order?", opts: ["FIFO", "LIFO", "Random", "Priority"], ans: 1 },
  { topic: "Queue", q: "Queue follows which order?", opts: ["FIFO", "LIFO", "LRU", "Priority"], ans: 0 },
  { topic: "Tree", q: "Best-case search in a BST is:", opts: ["O(1)", "O(log n)", "O(n)", "O(n log n)"], ans: 1 },
  { topic: "Graph", q: "BFS uses which data structure?", opts: ["Stack", "Queue", "Heap", "Hash"], ans: 1 },
  { topic: "Graph", q: "DFS is naturally implemented with:", opts: ["Queue", "Stack/Recursion", "Heap", "Array"], ans: 1 },
  { topic: "Sorting", q: "Worst case of Quick Sort:", opts: ["O(n)", "O(n log n)", "O(n²)", "O(log n)"], ans: 2 },
  { topic: "Sorting", q: "Merge Sort space complexity:", opts: ["O(1)", "O(log n)", "O(n)", "O(n²)"], ans: 2 },
  { topic: "Searching", q: "Binary search requires the array to be:", opts: ["Unsorted", "Sorted", "Hashed", "Linked"], ans: 1 },
  { topic: "Hash", q: "Average insert in hash table:", opts: ["O(1)", "O(log n)", "O(n)", "O(n²)"], ans: 0 },
];

function QuizPage() {
  const [topic, setTopic] = useState<string>("All");
  const topics = ["All", ...Array.from(new Set(BANK.map((b) => b.topic)))];
  const set = useMemo(() => topic === "All" ? BANK : BANK.filter((q) => q.topic === topic), [topic]);
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [best, setBest] = useLocalStorage<number>("dsa-quiz-best", 0);

  const q = set[i];
  const choose = (idx: number) => {
    if (picked !== null) return;
    setPicked(idx);
    if (idx === q.ans) setScore((s) => s + 1);
    setTimeout(() => {
      if (i + 1 >= set.length) { setDone(true); setBest((b) => Math.max(b, score + (idx === q.ans ? 1 : 0))); }
      else { setI((x) => x + 1); setPicked(null); }
    }, 900);
  };
  const reset = () => { setI(0); setPicked(null); setScore(0); setDone(false); };

  return (
    <AppLayout>
      <PageHeader icon={GraduationCap} title="Quiz" subtitle="Quick multiple-choice questions across topics." />
      <div className="grid lg:grid-cols-[1fr_320px] gap-6">
        <div className="space-y-6">
          <Panel>
            <div className="flex flex-wrap gap-2">
              {topics.map((t) => (
                <Btn key={t} variant={topic === t ? "primary" : "default"} onClick={() => { setTopic(t); reset(); }}>{t}</Btn>
              ))}
            </div>
          </Panel>
          {!done ? (
            <Panel>
              <div className="flex justify-between text-xs text-muted-foreground mb-3">
                <span>Question {i + 1} / {set.length}</span>
                <span>Score: {score}</span>
              </div>
              <div className="h-1.5 bg-muted rounded-full mb-6 overflow-hidden">
                <motion.div className="h-full gradient-bg" initial={{ width: 0 }} animate={{ width: `${((i) / set.length) * 100}%` }} />
              </div>
              <h2 className="text-xl font-semibold mb-5">{q.q}</h2>
              <div className="grid gap-2">
                {q.opts.map((o, idx) => {
                  const correct = picked !== null && idx === q.ans;
                  const wrong = picked === idx && idx !== q.ans;
                  return (
                    <button key={idx} onClick={() => choose(idx)}
                      className={[
                        "text-left p-3 rounded-lg border-2 font-medium transition-colors flex items-center justify-between",
                        correct ? "border-success bg-success/15 text-success-foreground" :
                        wrong ? "border-destructive bg-destructive/15" :
                        "border-border bg-card hover:border-primary/50",
                      ].join(" ")}>
                      <span>{o}</span>
                      {correct && <Check className="size-4 text-success" />}
                      {wrong && <X className="size-4 text-destructive" />}
                    </button>
                  );
                })}
              </div>
            </Panel>
          ) : (
            <Panel>
              <div className="text-center py-8">
                <div className="text-6xl font-bold gradient-text mb-2">{score}/{set.length}</div>
                <p className="text-muted-foreground mb-1">{score === set.length ? "Perfect!" : score >= set.length / 2 ? "Nice work." : "Keep practicing!"}</p>
                <p className="text-xs text-muted-foreground mb-6">Best: {best}/{BANK.length}</p>
                <Btn variant="primary" onClick={reset}><RotateCw className="size-4" /> Try Again</Btn>
              </div>
            </Panel>
          )}
        </div>
        <div>
          <Panel title="Progress">
            <p className="text-sm text-muted-foreground mb-3">Your scores are saved locally and persist across sessions.</p>
            <div className="text-xs space-y-1.5 font-mono">
              <div>Topic: <span className="text-foreground">{topic}</span></div>
              <div>Questions: <span className="text-foreground">{set.length}</span></div>
              <div>Best score: <span className="text-foreground">{best}</span></div>
            </div>
          </Panel>
        </div>
      </div>
    </AppLayout>
  );
}
