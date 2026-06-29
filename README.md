# DSA Visualizer

An interactive, animated data-structures-and-algorithms visualizer built with TanStack Start, React 19, TypeScript, Tailwind CSS v4, and Framer Motion.

## Features

- **Array** – insert, delete, update, search, traverse, reverse, bubble sort
- **Linked List** – singly, doubly, and circular variants
- **Stack / Queue / Circular Queue / Deque** – LIFO and FIFO operations
- **Binary Search Tree** – insert, delete, search, in-order/pre-order/post-order/level-order traversals
- **Heap** – min/max heap with insert, extract, build-heap
- **Graph** – draggable nodes, BFS and DFS traversal animations
- **Hash Table** – chaining-based insertion, deletion, lookup, hash calculation
- **Sorting** – bubble, selection, insertion, merge, quick, heap sorts
- **Searching** – linear and binary search comparison
- **Complexity** – Big-O reference tables
- **Quiz** – topic-based multiple-choice questions with score persistence
- **Global Search** – `⌘K` (or `Ctrl+K`) search across every operation
- **History** – tracks recent actions so you can re-run them
- **Dark/Light Theme** – toggle in the top-right of the navbar

## Prerequisites

- **Node.js 20+** (recommended)
- **Bun 1.0+** (recommended, fastest installs)

Both package managers work. The examples below use **Bun**; swap in `npm` or `pnpm` commands if you prefer.

## VS Code Setup (Step-by-Step)

### 1. Download the project

Open the project in Lovable and click **Code → Download codebase** in the left sidebar, or clone it if you have connected a GitHub repo.

### 2. Open the folder in VS Code

```bash
cd dsa-visualizer
# or wherever you extracted the ZIP
code .
```

If the `code` command is not available, open VS Code manually, choose **File → Open Folder…**, and select the project folder.

### 3. Install dependencies

In VS Code, open the integrated terminal with `` Ctrl + ` `` (or **Terminal → New Terminal**), then run:

```bash
bun install
```

If you are using npm instead:

```bash
npm install
```

### 4. Start the dev server

```bash
bun dev
```

With npm:

```bash
npm run dev
```

The terminal will show the local URL, usually:

```
http://localhost:8080
```

### 5. Open the app in a browser

Click the link in the terminal, or press `Ctrl` and click it, or type `http://localhost:8080` in your browser.

## Available Scripts

| Command | What it does |
| --- | --- |
| `bun dev` | Starts the Vite dev server with hot reload |
| `bun run build` | Creates an optimized production build |
| `bun run build:dev` | Creates a development build |
| `bun run preview` | Previews the production build locally |
| `bun run lint` | Runs ESLint across the project |
| `bun run format` | Formats all files with Prettier |

## VS Code Extensions (Recommended)

- **ESLint** – official Microsoft extension
- **Prettier** – official Prettier extension
- **Tailwind CSS IntelliSense** – class name autocomplete and linting
- **TypeScript Importer** – auto-import helpers

Install them from the Extensions view (`Ctrl+Shift+X`) for the best editing experience.

## Project Structure

```text
src/
  components/      Reusable UI components (AppLayout, controls, panels)
  hooks/           Custom React hooks
  lib/             Core utilities, algorithms, history, search, theme, storage
  routes/          TanStack file-based routes
  styles.css       Tailwind v4 theme and global design tokens
router.tsx         TanStack Router configuration
vite.config.ts     Vite build configuration
```

## Tech Stack

- [TanStack Start](https://tanstack.com/start)
- [React 19](https://react.dev)
- [TypeScript](https://www.typescriptlang.org)
- [Tailwind CSS v4](https://tailwindcss.com)
- [Framer Motion](https://www.framer.com/motion)
- [Vite](https://vitejs.dev)
- [Bun](https://bun.sh)

## Troubleshooting

### Port 8080 is already in use

```bash
bun dev --port 3000
```

Or with npm:

```bash
npm run dev -- --port 3000
```

### `bun` is not found

Install Bun from <https://bun.sh> or use `npm install` and `npm run dev` instead.

### Build fails with a missing route

Make sure all route files are in `src/routes/` and that you have not moved or deleted `src/routes/__root.tsx`, `src/routes/index.tsx`, or `src/router.tsx`. The TanStack Router plugin regenerates the route tree automatically during `bun dev`.

## License

MIT
