# my-portfolio

Personal portfolio of Anthony Lam. Fresh scaffold on **Next.js 15 (App Router) + TypeScript + Tailwind CSS v4**.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Structure

- `src/app/` — App Router entry (`layout.tsx`, `page.tsx`, `globals.css`).
- `src/data/` — Preserved portfolio content, typed:
  - `experiences.ts`, `projects.ts`, `skills.ts`, `profile.ts`
  - Import from `@/data` (e.g. `import { experiences, projects, profile } from "@/data";`).
- `public/images/` — Original image assets (headshot, project screenshots, logos).

The previous Vite/React design was cleared; the content above was carried over so the
UI can be rebuilt on Next.js. Recover the old design any time via git (`git log`).

## Scripts

- `npm run dev` — dev server
- `npm run build` — production build
- `npm run start` — serve production build
- `npm run lint` — lint
