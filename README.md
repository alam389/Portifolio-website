# Anthony Lam — portfolio

Personal site built with Next.js 16 (App Router), React 19, TypeScript and Tailwind CSS v4. Quiet editorial design: sidebar nav, dark default with a light toggle, a three.js globe on the Journey page, and a small pixel pet that wanders the page.

## Develop

```bash
npm install
npm run dev        # http://localhost:3000
npm run lint
npm run typecheck
npm test
npm run build
```

Copy nothing secret into the repo. The resume route needs these in `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=...
SUPABASE_SECRET_KEY=...
```

Without them `/api/resume` returns 503 and everything else works.

## Where things live

- `src/data/` — all content, typed. Edit here, not in components.
- `src/components/` — UI. `pet/` is the pixel pet; `interests/` the Interests cards.
- `scripts/` — `generate-globe-data.mjs`, `upload-media.mjs`, `pet-sheet.mjs`.

See `CLAUDE.md` for architecture and conventions.
