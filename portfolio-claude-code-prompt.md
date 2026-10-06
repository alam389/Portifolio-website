# Build Prompt: IDE-Style Portfolio Website

Paste everything below into Claude Code as your initial prompt.

---

## Project Brief

Build a personal software engineering portfolio site styled as a **VS Code-like editor**, centered on a **file tree sidebar** that opens **real rendered markdown files** as content. No terminal, no fake typing animation — the file tree IS the navigation and the metaphor.

## Tech Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS for styling
- `react-markdown` + `remark-gfm` for real markdown rendering (not styled-to-look-like-markdown — actually parse .md files)
- `shiki` or `rehype-pretty-code` for real syntax highlighting on embedded code snippets
- Content stored as actual `.md` files in a `/content` directory, read at build time via Node `fs` (or `contentlayer` if you think it's warranted — your call, explain trade-off if you deviate)
- Deploy target: Vercel

## Layout & Structure

**Overall shape:** VS Code clone — left sidebar (file tree), top tab bar (open files), main pane (rendered markdown).

**File tree (left sidebar):**
- Nested folder structure, not flat:
  ```
  about.md
  projects/
    mal-athena/
      README.md
      architecture.md
      hardware-selection.md
    ask-kiyoko/
      README.md
      rag-scoping.md
    dispatch-ui/
      README.md. 
  contact.md
  ```
- Real VS Code-style file icons (green `.md` icon, colored folder icons) — use an existing icon set (e.g. `vscode-icons` or similar), don't hand-roll unless necessary
- Folders collapse/expand on click, matching VS Code interaction (chevron rotate, indent guides)
- Default state: sidebar visible, `about.md` **pre-opened** in the main pane on load (don't make visitors click to see anything — this matters for the 8-second recruiter scan)

**Tab bar (top):**
- Shows currently open file(s) as tabs, VS Code style (filename + close "x")
- Clicking a file in the tree opens a new tab; clicking an already-open file's tab switches to it
- Keep this functional but simple — don't over-engineer multi-tab state if it adds significant complexity for little payoff; single-tab-at-a-time with tree-click-to-switch is an acceptable simpler alternative. Tell me the trade-off if you pick that.

**Main pane:**
- Renders the actual markdown file content
- Full syntax highlighting on any embedded code blocks (this content will include real architecture/code snippets, so this isn't decorative — it needs to be genuinely readable)
- Styled to resemble a code editor's markdown preview, but prioritize readability over cosplay accuracy

## Mobile Behavior

- Sidebar collapses into a slide-out drawer (hamburger icon triggers it), not a horizontal chip list — preserves the file-tree metaphor better than converting it into a different UI pattern
- Tab bar can simplify to just a breadcrumb/current-file label on small screens

## Theming

- Dark theme as default (matches the IDE aesthetic and is easier on contrast for code blocks)
- Optional light theme toggle — build if time allows, not a blocker for v1
- Monospace font (JetBrains Mono or Fira Code) for the tree, tabs, and code blocks; a clean sans (Inter or similar) for markdown body prose — don't set the entire body in monospace, it hurts long-form readability

## Content Plan

Populate these files with real content (ask me for specifics on any file, don't fabricate metrics or details):

- `about.md` — short bio: 4th-year Software Engineering student at Western University, focus on system design, AI applications, full-stack development. Currently building internal AI tooling (agentic RAG, local LLM infra, automation) at a small engineering consulting firm.
- `projects/mal-athena/README.md` — overview of the MAL-Athena/Dispatch AI stack (FastAPI + LangGraph ReAct + Qdrant + vLLM/Ollama, served via Teams/Azure Bot Service)
- `projects/mal-athena/architecture.md` — deeper write-up: ACTIVE_TOOL_NAMES allowlist, recursion limits, checkpointing, RAGAS eval pipeline
- `projects/mal-athena/hardware-selection.md` — GPU/model selection trade-off writeup (RTX PRO 6000 Blackwell vs. DGX Spark, Qwen3-14B vs. Granite 4.1)
- `projects/ask-kiyoko/README.md` — Ask Kiyoko AI shopping concierge overview (GECX platform, RAG scoped to decision logic/education)
- `projects/ask-kiyoko/rag-scoping.md` — why live inventory was excluded from the knowledge base, the trade-offs there
- `projects/dispatch-ui/README.md` — the Dispatch Electron UI / "Precision Instrument" design system work
- `contact.md` — contact links (email, GitHub, LinkedIn)

## Explicit Non-Goals (avoid scope creep / gimmick risk)

- No fake terminal or typing animation
- No 3D/WebGL flourishes
- Don't let the IDE chrome slow down or obscure the actual content — chrome is decorative, information architecture underneath should stay simple and fast
- Every project entry needs to surface stack + a concrete outcome, not just a list of technologies used

## Deliverable Expectations

- Fully responsive, fast-loading (optimize markdown parsing to build-time, not client-side re-parsing on every nav)
- Clean component structure: `<FileTree>`, `<TabBar>`, `<MarkdownPane>` as distinct, reusable components
- Before you start building, give me a brief plan covering: final call on tab-bar complexity (multi-tab vs. simplified), and content-loading approach (fs-based vs. contentlayer), with the pros/cons for each so I can confirm before you proceed
