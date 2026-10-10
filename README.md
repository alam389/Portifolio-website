# Anthony Lam: portfolio

Personal portfolio built with Next.js 16 (App Router), React 19, TypeScript and Tailwind CSS v4. A quiet editorial design with a sidebar rail, a Fraunces and Geist type pairing, a dark theme by default (with a light toggle), a three.js particle-terrain globe for the Journey page, and a small pixel pet that wanders the site.

## Getting started

```bash
npm install
npm run dev      # http://localhost:3000
```

Other commands: `npm run build`, `npm run start`, `npm run lint`, `npm run typecheck`, `npm test`.

## Pages

About (`/`), Experience, Projects, Journey, Interests (with AI, Food and Active subpages) and Resume. `/pet-lab` is a development-only review page for the pet's art.

## Content

Everything on the site comes from typed modules in `src/data/`, so one edit updates every page. Components never hardcode content.

## Environment

The resume is a private file in Supabase Storage, and photos are served from a public `media` bucket (its URL is a constant in `src/data/media.ts`). Put these in `.env`:

| Variable | Used for |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | The resume route and the upload script |
| `SUPABASE_SECRET_KEY` | Server only: signs the resume download, and the upload script |

Without them the site still builds; `/api/resume` answers 503 and the resume page has nothing to show.

Scripts:

- `node --env-file=.env scripts/upload-media.mjs <dir>` converts a folder of photos to WebP and uploads it to the `media` bucket.
- `node scripts/generate-globe-data.mjs` rebuilds the globe data in `public/globe/`.
- `node --no-warnings scripts/pet-sheet.mjs <cat|dog|bunny>` renders a pet's sprite contact sheet.

## More

- [`CLAUDE.md`](CLAUDE.md): architecture and conventions.
- [`.impeccable.md`](.impeccable.md): design context.
- [`src/components/pet/README.md`](src/components/pet/README.md): how the pet works.
