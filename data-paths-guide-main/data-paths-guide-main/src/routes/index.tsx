import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Boxes, ListOrdered, Layers, ArrowRightLeft, GitBranch, Network, Hash,
  BarChart3, Sparkles, Gauge, GraduationCap, Play, ArrowRight,
} from "lucide-react";
import { AppLayout } from "@/components/app-layout";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "DSALab — Interactive DSA Visualizer" },
      { name: "description", content: "Visualize arrays, linked lists, trees, graphs and sorting algorithms with real, animated, step-by-step operations." },
      { property: "og:title", content: "DSALab — Interactive DSA Visualizer" },
      { property: "og:description", content: "Run real algorithms on your own input. Watch every step animate." },
    ],
  }),
  component: Index,
});

const STRUCTURES = [
  { to: "/array", label: "Array", desc: "Insert, delete, search, sort, reverse", icon: Boxes },
  { to: "/linked-list", label: "Linked List", desc: "Singly, doubly, circular", icon: ListOrdered },
  { to: "/stack", label: "Stack", desc: "Push, pop, peek with overflow", icon: Layers },
  { to: "/queue", label: "Queue", desc: "Enqueue, dequeue, FIFO", icon: ArrowRightLeft },
  { to: "/bst", label: "Binary Search Tree", desc: "Insert, traverse, delete", icon: GitBranch },
  { to: "/graph", label: "Graph", desc: "BFS, DFS, dynamic edges", icon: Network },
  { to: "/hash-table", label: "Hash Table", desc: "Chaining, collision handling", icon: Hash },
  { to: "/sorting", label: "Sorting", desc: "Bubble, merge, quick, heap", icon: BarChart3 },
];

const FEATURES = [
  { icon: Play, title: "Real algorithms", desc: "Every button executes actual code on your input — not a canned animation." },
  { icon: Sparkles, title: "Step-by-step animation", desc: "Framer Motion drives every insertion, swap, and pointer change." },
  { icon: Gauge, title: "Complexity insights", desc: "Time and space complexity shown for every operation." },
  { icon: GraduationCap, title: "Quizzes & progress", desc: "Test your understanding and track your learning over time." },
];

function Index() {
  return (
    <AppLayout>
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-card via-card to-primary/5 p-8 lg:p-14 mb-10">
        <div className="absolute -top-24 -right-24 size-96 rounded-full bg-primary/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 size-96 rounded-full bg-accent/20 blur-3xl pointer-events-none" />
        <div className="relative max-w-3xl">
          <motion.span
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-5"
          >
            <Sparkles className="size-3.5" /> Learn DSA the visual way
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
            className="text-4xl lg:text-6xl font-bold tracking-tight leading-[1.05]"
          >
            Data Structures &<br />Algorithms,{" "}
            <span className="gradient-text">visualized.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="mt-5 text-lg text-muted-foreground max-w-2xl"
          >
            Interactive visualizations for arrays, linked lists, stacks, queues, trees, graphs,
            sorting, and searching — driven by real algorithms operating on your own input.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="mt-7 flex flex-wrap gap-3"
          >
            <Link to="/array" className="h-11 px-5 rounded-xl gradient-bg text-primary-foreground font-semibold inline-flex items-center gap-2 hover:opacity-90 shadow-lg shadow-primary/20">
              Start Visualizing <ArrowRight className="size-4" />
            </Link>
            <Link to="/sorting" className="h-11 px-5 rounded-xl border border-border bg-background/60 backdrop-blur font-semibold inline-flex items-center gap-2 hover:bg-muted">
              Try Sorting <BarChart3 className="size-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-12">
        {FEATURES.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
            className="rounded-2xl p-5 border border-border bg-card hover:border-primary/40 transition-colors"
          >
            <div className="size-10 rounded-lg bg-primary/10 text-primary grid place-items-center mb-3">
              <f.icon className="size-5" />
            </div>
            <h3 className="font-semibold mb-1">{f.title}</h3>
            <p className="text-sm text-muted-foreground">{f.desc}</p>
          </motion.div>
        ))}
      </section>

      {/* Structures grid */}
      <section className="mb-12">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">Explore data structures</h2>
            <p className="text-muted-foreground text-sm mt-1">Pick one to start. Every operation is fully implemented.</p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STRUCTURES.map((s, i) => (
            <motion.div
              key={s.to}
              initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ delay: i * 0.04 }}
            >
              <Link
                to={s.to}
                className="group block rounded-2xl border border-border bg-card p-5 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all h-full"
              >
                <div className="flex items-start gap-3">
                  <div className="size-11 rounded-xl bg-gradient-to-br from-primary/15 to-accent/15 grid place-items-center text-primary group-hover:scale-110 transition-transform">
                    <s.icon className="size-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold">{s.label}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{s.desc}</p>
                  </div>
                </div>
                <div className="mt-4 text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity inline-flex items-center gap-1">
                  Open visualizer <ArrowRight className="size-3" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      <footer className="border-t border-border pt-8 pb-4 text-sm text-muted-foreground grid sm:grid-cols-3 gap-6">
        <div>
          <div className="font-display font-bold text-foreground mb-2">DSALab</div>
          <p>Interactive DSA learning platform. Built for students and engineers.</p>
        </div>
        <div>
          <div className="font-semibold text-foreground mb-2">Explore</div>
          <ul className="space-y-1">
            <li><Link to="/sorting" className="hover:text-foreground">Sorting</Link></li>
            <li><Link to="/graph" className="hover:text-foreground">Graphs</Link></li>
            <li><Link to="/complexity" className="hover:text-foreground">Complexity</Link></li>
          </ul>
        </div>
        <div>
          <div className="font-semibold text-foreground mb-2">Learn</div>
          <ul className="space-y-1">
            <li><Link to="/quiz" className="hover:text-foreground">Quizzes</Link></li>
            <li><Link to="/bst" className="hover:text-foreground">Trees</Link></li>
          </ul>
        </div>
      </footer>
    </AppLayout>
  );
}
