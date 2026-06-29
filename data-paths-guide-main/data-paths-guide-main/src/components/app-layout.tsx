import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Sun, Moon, Menu, X, Boxes, ListOrdered, Layers, ArrowRightLeft,
  RotateCw, MoveHorizontal, Network, GitBranch, Hash, BarChart3, Binary,
  Gauge, GraduationCap, History as HistoryIcon, Trash2, Download, ChevronRight, Sparkles,
} from "lucide-react";
import { useTheme } from "@/lib/theme";
import { searchEntries } from "@/lib/search-index";
import { useHistory } from "@/lib/history";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Home", icon: Sparkles },
  { to: "/array", label: "Array", icon: Boxes },
  { to: "/linked-list", label: "Linked List", icon: ListOrdered },
  { to: "/stack", label: "Stack", icon: Layers },
  { to: "/queue", label: "Queue", icon: ArrowRightLeft },
  { to: "/circular-queue", label: "Circular Queue", icon: RotateCw },
  { to: "/deque", label: "Deque", icon: MoveHorizontal },
  { to: "/bst", label: "BST", icon: GitBranch },
  { to: "/heap", label: "Heap", icon: Binary },
  { to: "/graph", label: "Graph", icon: Network },
  { to: "/hash-table", label: "Hash Table", icon: Hash },
  { to: "/sorting", label: "Sorting", icon: BarChart3 },
  { to: "/searching", label: "Searching", icon: Search },
  { to: "/complexity", label: "Complexity", icon: Gauge },
  { to: "/quiz", label: "Quiz", icon: GraduationCap },
] as const;

export function AppLayout({ children }: { children: ReactNode }) {
  const { theme, toggle } = useTheme();
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => { setOpen(false); }, [pathname]);

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:sticky top-0 left-0 z-40 h-screen w-64 shrink-0 border-r border-sidebar-border bg-sidebar transition-transform",
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className="h-16 flex items-center gap-2 px-5 border-b border-sidebar-border">
          <div className="size-8 rounded-lg gradient-bg grid place-items-center text-primary-foreground font-bold">D</div>
          <Link to="/" className="font-display text-lg font-bold tracking-tight">DSA<span className="gradient-text">Lab</span></Link>
        </div>
        <nav className="p-3 space-y-0.5 overflow-y-auto h-[calc(100vh-4rem)]">
          {NAV.map((n) => {
            const Icon = n.icon;
            const active = n.to === "/" ? pathname === "/" : pathname.startsWith(n.to);
            return (
              <Link
                key={n.to}
                to={n.to}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors group",
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
                )}
              >
                <Icon className="size-4 shrink-0" />
                <span className="flex-1">{n.label}</span>
                {active && <ChevronRight className="size-4" />}
              </Link>
            );
          })}
        </nav>
      </aside>

      {open && (
        <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setOpen(false)} />
      )}

      <div className="flex-1 min-w-0 flex flex-col">
        {/* Topbar */}
        <header className="sticky top-0 z-20 h-16 border-b border-border bg-background/80 backdrop-blur-md flex items-center gap-3 px-4 lg:px-6">
          <button className="lg:hidden p-2 -ml-2" onClick={() => setOpen(true)} aria-label="Menu">
            <Menu className="size-5" />
          </button>
          <GlobalSearch />
          <button
            onClick={toggle}
            className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun className="size-5" /> : <Moon className="size-5" />}
          </button>
        </header>

        <main className="flex-1 p-4 lg:p-8 max-w-[1600px] w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}

function GlobalSearch() {
  const [q, setQ] = useState("");
  const [focused, setFocused] = useState(false);
  const [idx, setIdx] = useState(0);
  const wrap = useRef<HTMLDivElement>(null);
  const results = useMemo(() => searchEntries(q), [q]);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (wrap.current && !wrap.current.contains(e.target as Node)) setFocused(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        (document.getElementById("global-search") as HTMLInputElement | null)?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const go = (r: { route: string; op?: string }) => {
    setFocused(false);
    setQ("");
    const url = r.op ? `${r.route}?op=${r.op}` : r.route;
    window.location.assign(url);
  };

  return (
    <div ref={wrap} className="relative flex-1 max-w-xl">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
      <input
        id="global-search"
        value={q}
        onChange={(e) => { setQ(e.target.value); setIdx(0); }}
        onFocus={() => setFocused(true)}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") { e.preventDefault(); setIdx((i) => Math.min(i + 1, results.length - 1)); }
          if (e.key === "ArrowUp") { e.preventDefault(); setIdx((i) => Math.max(0, i - 1)); }
          if (e.key === "Enter" && results[idx]) go(results[idx]);
          if (e.key === "Escape") setFocused(false);
        }}
        placeholder="Search push, pop, bfs, sort…  (⌘K)"
        className="w-full h-10 pl-10 pr-16 rounded-lg bg-muted/60 border border-border focus:border-primary focus:bg-background outline-none text-sm transition-colors"
      />
      <kbd className="hidden sm:inline-block absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono px-1.5 py-0.5 rounded bg-background border border-border text-muted-foreground">⌘K</kbd>
      <AnimatePresence>
        {focused && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="absolute top-full mt-2 left-0 right-0 glass rounded-xl overflow-hidden shadow-2xl"
          >
            {results.map((r, i) => (
              <button
                key={`${r.route}-${r.op ?? ""}-${i}`}
                onMouseEnter={() => setIdx(i)}
                onClick={() => go(r)}
                className={cn(
                  "w-full text-left px-4 py-2.5 text-sm flex items-center justify-between",
                  i === idx ? "bg-sidebar-accent text-sidebar-accent-foreground" : "hover:bg-muted",
                )}
              >
                <span>{r.label}</span>
                <span className="text-xs text-muted-foreground font-mono">{r.route}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function PageHeader({ title, subtitle, icon: Icon }: { title: string; subtitle?: string; icon?: typeof Search }) {
  return (
    <div className="mb-6 flex items-start gap-4">
      {Icon && (
        <div className="size-12 rounded-xl gradient-bg grid place-items-center text-primary-foreground shrink-0">
          <Icon className="size-6" />
        </div>
      )}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        {subtitle && <p className="text-muted-foreground mt-1">{subtitle}</p>}
      </div>
    </div>
  );
}

export function Panel({ title, children, className }: { title?: string; children: ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-xl border border-border bg-card p-5 shadow-sm", className)}>
      {title && <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">{title}</h3>}
      {children}
    </div>
  );
}

export function ComplexityBadge({ time, space }: { time: string; space: string }) {
  return (
    <div className="flex gap-2 flex-wrap">
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-primary/10 text-primary text-xs font-mono font-semibold">
        Time {time}
      </span>
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-accent/15 text-accent-foreground text-xs font-mono font-semibold">
        Space {space}
      </span>
    </div>
  );
}

export function HistoryPanel({ scope }: { scope?: string }) {
  const entries = useHistory((s) => s.entries);
  const clear = useHistory((s) => s.clear);
  const filtered = scope ? entries.filter((e) => e.scope === scope) : entries;

  const exportFile = () => {
    const text = filtered.map((e) => `[${new Date(e.time).toLocaleTimeString()}] ${e.scope}: ${e.text}`).join("\n");
    const blob = new Blob([text], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "dsa-history.txt";
    a.click();
  };

  return (
    <Panel title="Operation History">
      <div className="flex gap-2 mb-3">
        <button onClick={exportFile} className="text-xs inline-flex items-center gap-1.5 px-2 py-1 rounded-md border border-border hover:bg-muted">
          <Download className="size-3" /> Export
        </button>
        <button onClick={clear} className="text-xs inline-flex items-center gap-1.5 px-2 py-1 rounded-md border border-border hover:bg-destructive hover:text-destructive-foreground">
          <Trash2 className="size-3" /> Clear
        </button>
      </div>
      <div className="max-h-72 overflow-y-auto space-y-1 font-mono text-xs">
        {filtered.length === 0 && (
          <div className="text-muted-foreground py-6 text-center flex flex-col items-center gap-2">
            <HistoryIcon className="size-5 opacity-50" />
            <span>No operations yet</span>
          </div>
        )}
        {filtered.slice().reverse().map((e) => (
          <div key={e.id} className="px-2 py-1 rounded bg-muted/50 flex items-baseline gap-2">
            <span className="text-muted-foreground shrink-0">{new Date(e.time).toLocaleTimeString().slice(0,8)}</span>
            <span className="text-foreground truncate">{e.text}</span>
          </div>
        ))}
      </div>
    </Panel>
  );
}

export function ExplanationPanel({ steps }: { steps: string[] }) {
  if (!steps.length) return null;
  return (
    <Panel title="Explanation">
      <ol className="space-y-2 text-sm">
        {steps.map((s, i) => (
          <li key={i} className="flex gap-3">
            <span className="size-5 rounded-full bg-primary/10 text-primary text-xs font-semibold grid place-items-center shrink-0">{i + 1}</span>
            <span className="text-foreground/90 whitespace-pre-wrap">{s}</span>
          </li>
        ))}
      </ol>
    </Panel>
  );
}

export function Toolbar({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap gap-2 mb-4">{children}</div>;
}

export function Btn({
  children, onClick, variant = "default", disabled, type = "button", className,
}: {
  children: ReactNode; onClick?: () => void; variant?: "default" | "primary" | "danger" | "ghost";
  disabled?: boolean; type?: "button" | "submit"; className?: string;
}) {
  const styles: Record<string, string> = {
    default: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    primary: "gradient-bg text-primary-foreground hover:opacity-90 shadow-sm",
    danger: "bg-destructive text-destructive-foreground hover:opacity-90",
    ghost: "hover:bg-muted text-foreground",
  };
  return (
    <button
      type={type} onClick={onClick} disabled={disabled}
      className={cn(
        "h-9 px-3.5 rounded-lg text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-1.5",
        styles[variant], className,
      )}
    >{children}</button>
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5 text-xs font-medium text-muted-foreground">
      <span>{label}</span>
      {children}
    </label>
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "h-9 px-3 rounded-lg bg-background border border-input focus:border-primary outline-none text-sm font-mono text-foreground",
        props.className,
      )}
    />
  );
}
