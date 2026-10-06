# Design Spec — AI Chatbot Portfolio

Resolved decision record for the current build: a Next.js 15 + Tailwind v4 portfolio
with an embedded AI chatbot that answers visitor questions about Anthony. Supersedes
the previous IDE-style design doc (VS Code/IntelliJ file-tree concept) — that design
was retired before implementation and is preserved only in git history
(`git log -- DESIGN.md`) and the `ide-portfolio-backup` branch.

Status: **design locked, implementation in progress.**

---

## 1. Concept

A conventional single-page portfolio (hero → about → projects → contact) with one
addition: a floating chat widget styled as a **digital twin** — it answers in first
person, as if you're talking to Anthony directly, not a third-party assistant
describing him. The chatbot is additive, not the whole site's gimmick: if it were
removed, the portfolio still stands on its own as a normal static-feeling site.

UI is scaffolded via Fable (Next.js 15 App Router + TypeScript + Tailwind v4), then
wired to the existing typed content layer and a hybrid chat engine (§2.2).

**Prior art:** this exact concept — first-person digital twin, quick-question chips,
structured answer blocks pulling from `src/data` — was already prototyped once on
the `agent-portfolio-backup` branch (commit `0d8eff0`, built on the since-retired IDE
design). That prototype is being **adapted, not rebuilt from scratch**: `Chat.tsx`,
`AnswerBlocks.tsx`, and `data/agent.ts` are salvageable, restyled onto the current
scaffold's tokens instead of the retired IDE/JetBrains theme. The one thing that
changes is the engine underneath (§2.2) — the prototype was pregenerated only
("no live model behind me"); this build adds a live LLM fallback.

---

## 2. Decision record

### 2.1 Content & data

- **Source of truth stays `src/data/`** (`profile.ts`, `experiences.ts`,
  `projects.ts`, `skills.ts`, typed via `types.ts`). This is a deliberate
  **reversal** of the retired design's plan to move content into `.md` files —
  there's no file-tree/markdown-rendering metaphor this time, so a typed TS layer
  is simply the right fit: it's consumed by both the UI components *and* the
  chatbot's system prompt, so one edit updates both.
  - *Rationale:* single source of truth > content duplicated between page copy and
    a chatbot knowledge base. Editing `src/data/projects.ts` should be the only
    step needed to keep the site and the bot in sync.

### 2.2 Chatbot grounding — hybrid engine

- **Two-tier engine, not LLM-for-everything.**
  1. **Fast path (pregenerated):** free-text input is matched against a fixed
     `ENTRIES` list (`data/agent.ts`, ported from the backup branch) covering the
     five canonical topics — who are you, skills, projects, experience, contact/
     resume. A match renders instantly from `src/data` via the existing
     `AnswerBlocks` components (`SkillChips`, `ProjectCards`, `ExperienceList`,
     `ContactLinks`) — **zero LLM call, zero latency, zero hallucination risk.**
     Quick-question chips in the widget's empty state exist specifically to funnel
     visitors toward this path.
  2. **Fallback path (live LLM):** input that doesn't match any trigger falls
     through to `POST /api/chat`. The route composes a **first-person** system
     prompt from `profile`/`experiences`/`projects`/`skills` — "you are Anthony
     Lam, answer as yourself, in first person" — plus the same boundary
     instruction (decline anything not about Anthony's background/work) — and
     streams a response.
  - *Rationale:* the five canonical topics cover the large majority of what a
    recruiter actually asks, and answering them from real components is strictly
    better than an LLM paraphrasing the same data (faster, free, can't drift from
    the facts). The LLM is reserved for genuinely novel phrasing/follow-ups, which
    is exactly where a fixed keyword matcher used to hit the pregenerated
    prototype's honesty disclaimer ("I'm a pregenerated twin — there's no live
    model behind me"). That disclaimer is dropped for matched answers (they *are*
    Anthony's real words, no need to caveat) but a light, non-disruptive
    AI-disclosure stays visible in the widget chrome for the fallback path (§2.6).
- **Not RAG.** Even the fallback path uses a static system prompt, not
  retrieval — same reasoning as before: the knowledge base is small enough to fit
  a prompt outright. Revisit only if `src/data/` grows enough that the prompt
  gets unwieldy (rough trigger: consistently pushing into the low thousands of
  tokens).

### 2.3 Chatbot backend

- **Next.js Route Handler** (`src/app/api/chat/route.ts`) as the only backend
  surface, hit **only on the fallback path** (§2.2) — matched canonical topics
  never leave the client. Holds the LLM API key as a Vercel environment variable
  (never sent to the client), builds the first-person system prompt from
  `src/data`, forwards the conversation, and **streams** the response back (SSE)
  so the widget can render tokens incrementally.
  - *Rationale:* Route Handlers give serverless functions without leaving the
    Next.js project or adding a separate service — the static pages and the one
    dynamic endpoint deploy together on Vercel from a single repo.
- **Provider: Anthropic API** (Claude), using a small/cheap model tier (Haiku)
  given the task is short, grounded Q&A, not open-ended reasoning.
  - *Open item:* confirm Haiku is sufficient quality before shipping; escalate to
    Sonnet only if answers feel thin.

### 2.4 Abuse / cost control

- **Per-IP rate limiting via Upstash Redis** (sliding-window), checked at the top
  of the route handler before calling the LLM.
  - *Rationale:* an in-memory counter resets on every cold start and isn't shared
    across concurrent serverless instances — it's not real protection on Vercel.
    Upstash's free tier is more than sufficient at portfolio traffic levels and
    the added code is a handful of lines.
- **Hard cap on `max_tokens`** per response, and the system prompt's
  answer-only-about-Anthony boundary doubles as a scope limiter against prompt
  injection/off-topic abuse.
- **No conversation persistence server-side.** Chat history lives in the widget's
  React state for the duration of the page session only — nothing written to a
  database. Simpler, and there's no product reason yet to retain transcripts.

### 2.5 Frontend / UI

- **Next.js 15 App Router + TypeScript + Tailwind v4**, CSS-first config via
  `@theme` in `globals.css` (no `tailwind.config.js`) — continuation of the
  existing scaffold's convention.
- **No component library.** Hand-rolled components styled with Tailwind
  utilities, consistent with the scaffold's "no icon library, no unnecessary
  dependency" stance.
- **Sections (single-page scroll):** Hero, About, Projects, Contact, plus the
  floating ChatWidget. Deliberately 4-5 sections, not a sprawling multi-page site
  — optimized for a fast scan, same instinct as the retired design's "8-second
  recruiter scan" goal, achieved here by scope instead of an IDE metaphor.
- **Components:** `components/Hero.tsx`, `components/About.tsx`,
  `components/Projects.tsx`, `components/Contact.tsx`, `components/ChatWidget.tsx`
  — each consumes typed content from `@/data`.

### 2.6 Chat widget UX

- Floating action button, bottom-right, expands into a chat panel (doesn't
  navigate away from the page). Adapted from the backup branch's `Chat.tsx`:
  headshot + "I'm Anthony's digital twin" framing in the panel header, collapsing
  to a small avatar once the conversation starts.
- **Empty state:** headshot, short framing line, and quick-question chips for the
  five canonical topics (from `data/agent.ts`) — clicking one answers instantly
  via the fast path (§2.2). The widget should never open to a blank box.
- Message list: user messages right-aligned; twin messages left-aligned.
  Fast-path answers render `AnswerBlocks` with the existing typed/streamed-text
  animation (respects `prefers-reduced-motion`); fallback (LLM) answers stream
  real tokens from `/api/chat` with a loading indicator before the first token.
- **AI disclosure:** small, persistent, non-disruptive label in the panel chrome
  (e.g. "AI, trained on Anthony's info" under the header) rather than an
  in-conversation caveat — keeps the first-person illusion intact per-message
  while staying honest about what visitors are talking to.
- Panel gets the design's one glassmorphism accent (translucent + backdrop-blur),
  matched on project cards for visual consistency; not used elsewhere so it stays
  an accent, not the whole aesthetic.

### 2.7 Theming

- **Dark mode default, no toggle in v1.** Simpler than the retired design's
  dual-theme (`next-themes` + dual shiki themes) — there's no code-block
  rendering requirement driving a light/dark syntax-theme pair here, so a toggle
  is pure added scope for a portfolio-scale site with no evidence anyone wants it.
  - *Non-goal, not a rejection:* revisit if requested; not blocking v1.
- Update `globals.css` to make dark the actual default (currently light-by-default
  with a `prefers-color-scheme` dark override) — flip the base tokens rather than
  relying on the media query, so first impression is consistently dark regardless
  of OS setting.

### 2.8 Hosting

- **Vercel**, static pages + the one `/api/chat` Route Handler deployed together
  from this repo. Env vars (Anthropic API key, Upstash REST URL/token) set in the
  Vercel dashboard, not committed.
  - *Rationale:* Vercel is Next.js-native — Route Handlers work with zero extra
    config, versus Netlify/Cloudflare which would need an adapter or a
    differently-shaped function. No reason to fight the framework's home platform.

### 2.9 Accessibility

- Chat widget: toggle button and panel are keyboard-operable (`button`, focus
  trap while open, `Escape` to close), visible `focus-visible` rings, `aria-live`
  region on the message list so streamed responses are announced to screen
  readers without spamming them token-by-token (announce on stream completion,
  not per chunk).
- Standard semantic HTML elsewhere (`nav`/`main`/`section`, real `<a>` for links,
  `alt` on the headshot) — no need for the retired design's tree/tab a11y
  scoping since there's no file-tree UI here.

---

## 3. Architecture

```
src/
  app/
    layout.tsx            # Geist fonts, metadata from profile — unchanged
    page.tsx               # composes Hero/About/Projects/Contact/ChatWidget
    globals.css             # Tailwind v4 @theme, dark-default tokens
    api/
      chat/
        route.ts            # fallback-path POST handler: rate-limit -> build
                             # first-person system prompt from src/data ->
                             # call Anthropic API -> stream response
  components/
    Hero.tsx
    About.tsx
    Projects.tsx
    Contact.tsx
    ChatWidget.tsx           # floating button + panel; wraps Chat
    Chat.tsx                 # ported from agent-portfolio-backup; fast-path
                             # matching + falls through to /api/chat, streams
    AnswerBlocks.tsx          # ported; SkillChips/ProjectCards/ExperienceList/
                             # ContactLinks, typed-text animation
  data/
    profile.ts / experiences.ts / projects.ts / skills.ts / types.ts   # unchanged
    agent.ts                 # ported; ENTRIES + matchEntry for the fast path
  lib/
    system-prompt.ts         # builds the fallback-path system prompt from src/data
    rate-limit.ts             # Upstash Redis sliding-window helper
```

**Data flow:** visitor sends a message in `Chat` → `matchEntry()` checked
client-side first. Match → render `AnswerBlocks` from `src/data` instantly
(no network call). No match → `POST /api/chat` → route handler checks Upstash
rate limit → builds first-person system prompt from `src/data` via
`lib/system-prompt.ts` → calls Anthropic API with streaming → tokens relayed
back to the client → `Chat` appends them to the twin's message.

---

## 4. Build order

1. Fable-scaffold the static UI (Hero/About/Projects/Contact/ChatWidget shells,
   dark theme, Tailwind v4) against placeholder content.
2. Wire components to real `src/data` content.
3. Port `data/agent.ts`, `components/Chat.tsx`, `components/AnswerBlocks.tsx`
   from `agent-portfolio-backup` (`git show 0d8eff0:<path>`); restyle off the
   retired IDE/JetBrains tokens (`bg-sidebar`, `text-muted`, `border-border`,
   `bg-selection`, `text-accent`, `bg-syn-green`) onto this scaffold's Tailwind
   v4 `@theme` tokens. Drop the "no live model" disclaimer copy (§2.6 replaces
   it with the persistent chrome label).
4. Embed `Chat` inside `ChatWidget` (floating button + panel wrapper); confirm
   the fast path (matched chips → `AnswerBlocks`) works with zero network calls.
5. `lib/system-prompt.ts` — compose the first-person fallback-path system prompt
   from `src/data`.
6. `lib/rate-limit.ts` — Upstash Redis sliding-window limiter.
7. `api/chat/route.ts` — rate-limit check, system prompt injection, Anthropic
   call, streaming response.
8. Wire `Chat`'s fallback branch (no `matchEntry` hit) to `/api/chat`; handle
   streaming, loading, and error states.
9. Deploy to Vercel; set env vars; verify rate limiting and streaming in
   production (not just `next dev`, since cold-start/instance behavior differs).

---

## 5. Non-goals (guard against scope creep)

- No RAG / vector store / embeddings in v1 — static system prompt on the fallback
  path only (§2.2).
- No LLM call for the five canonical topics — those stay on the deterministic
  fast path by design, not a temporary shortcut.
- No conversation persistence or chat history database (§2.4).
- No light/dark toggle in v1 (§2.7).
- No IDE/file-tree/markdown-file content model — that's the retired design; this
  build's content stays in typed `src/data/`.
- No component library, no auth, no analytics beyond what Vercel provides by
  default.

---

## 6. Open items to finalize before / during build

- [ ] Confirm Claude Haiku is sufficient answer quality vs. needing Sonnet, for
      the fallback path specifically.
- [ ] Finalize Upstash rate-limit thresholds (requests per IP per window) — only
      matters for fallback-path traffic, so likely a lower ceiling than
      originally assumed.
- [ ] Decide `max_tokens` cap per response.
- [ ] Real Fable output review — confirm it matches the section/component list in
      §2.5 before wiring content.
- [ ] Write the actual first-person system prompt copy and get Anthony's sign-off
      that it "sounds like him" before shipping the fallback path.
- [ ] Finalize the AI-disclosure chrome label wording (§2.6) — needs to be honest
      without undercutting the digital-twin framing.
