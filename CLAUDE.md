# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — start the dev server (http://localhost:3000)
- `npm run build` — production build
- `npm run start` — serve the production build
- `npm run lint` — ESLint (`next/core-web-vitals` + `next/typescript`)

There is no test runner configured.

## Architecture

Personal portfolio (Anthony Lam) on **Next.js 15 App Router + React 19 + TypeScript (strict) + Tailwind CSS v4**. The shipped design on **`main`** is a **chat-first "digital twin"** with a pixel/Minecraft aesthetic: the whole site is a conversation that answers questions about Anthony from his real data. No routes beyond `/` matter to the product (leftover IDE-era routes under `src/app/[...slug]` still build; ignore them unless removing).

**How the twin works:**

- `src/data/agent.ts` — the pregenerated knowledge base: `AgentEntry` objects (question, trigger keywords, answer text, optional structured block), all composed from the typed data modules. `matchEntry()` keyword-matches free-text input; unmatched input gets an honest "I'm pregenerated" fallback. **The live-LLM upgrade path is one seam**: replace `matchEntry` in `Twin.tsx` with a fetch to `POST /api/chat` (see DESIGN.md — Anthropic + streaming + Upstash rate limiting; not yet built).
- `src/components/Twin.tsx` — the chat UI. Empty state = centered composition (pixelated headshot, H1, composer, suggestion chips); started state = real chat anatomy (scrolling messages, bottom composer + command row). Typing effect is instant under reduced-motion.
- `src/components/AnswerCards.tsx` — structured answer blocks (skills / projects / experience / contact / resume) rendered after an answer's text finishes typing.
- `src/components/PixelSky.tsx` — canvas backdrop: 8-bit night sky (twinkling square stars, blocky clouds, rare shooting stars) drawn at 1/5 resolution and upscaled with `image-rendering: pixelated`. Static frame under reduced-motion; pauses on hidden tabs.
- `src/components/Grainient.tsx` — WebGL (ogl) animated gradient, currently **unplugged** but kept for reuse.

**Content layer (unchanged principle):** all portfolio content lives in typed modules under `src/data/` (`profile.ts`, `experiences.ts`, `projects.ts`, `skills.ts`, typed via `types.ts`), consumed via the `@/data` barrel. The twin's answers and any UI both read from here — one edit updates everything. Never hardcode content in components.

### Conventions worth knowing

- **Tailwind v4, CSS-first config.** No `tailwind.config.js`. Tokens via CSS variables + `@theme inline` in `src/app/globals.css`. The twin uses the `--twin-*` tokens (`bg-bg`, `text-fg`, `bg-surface`, `bg-ok`); older IntelliJ-era tokens coexist for the leftover routes.
- **Pixel theme:** `Geist Pixel Square` is self-hosted at `src/app/fonts/` (from vercel/geist-font releases), loaded via `next/font/local` as `--font-pixel`. The `.pixel-ui` scope class applies pixel type + kills all border-radius; `.mc-btn` (block buttons), `.px-shadow` (hard offset shadows), `.pixelated` (image-rendering) complete the look. Blocky avatars = tiny `next/image` width upscaled with `.pixelated`.
- **No fabricated content.** Twin answers only say what `src/data` contains. Resume is a stub until a real `resume.pdf` exists.
- Content edits: extend the interface in `types.ts` first, then the data module.
- **`DESIGN.md` on disk is the decision record** for the chatbot backend (static system prompt from `src/data`, Vercel API route, Anthropic streaming, Upstash rate limiting — all still to build).
- **Git history:** earlier full explorations live on branches — `ide-portfolio-backup` (IntelliJ-style IDE portfolio), `redo` (IDE build), and `agent-portfolio-backup` (tracks main). Don't resurrect without asking. Note: local `main` has diverged from `origin/main` (old public site) — pushing requires reconciliation, Anthony's call.
