# my-portfolio

Personal portfolio of Anthony Lam, styled as a **VS Code-like editor** — a file-tree
sidebar opens real rendered markdown files in a tabbed pane.

**Next.js 15 (App Router) + TypeScript + Tailwind CSS v4 + shiki.**
Design rationale lives in [DESIGN.md](DESIGN.md).

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Structure

- `content/` — the portfolio content: real `.md` files (rendered at build time) plus
  `manifest.ts`, which declares the file tree (order, labels, slug → file mapping).
  **To add a page:** write the `.md`, add one node to the manifest.
- `src/app/` — root layout (editor shell) + catch-all route (`[[...slug]]`) that
  statically renders each manifest entry. `about.md` is the homepage.
- `src/components/` — `FileTree`, `TabBar`, `MarkdownPane`, `Shell`, `MobileDrawer`,
  `ThemeToggle`, `Providers` (theme + tab state).
- `src/lib/content.ts` — fs + gray-matter + unified/shiki pipeline (build time).
- `src/data/profile.ts` — identity/config (name, socials, email) used for metadata.
- `public/images/` — image assets.

## Scripts

- `npm run dev` — dev server
- `npm run build` — production build
- `npm run start` — serve production build
- `npm run lint` — lint
