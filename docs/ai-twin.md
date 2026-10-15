# AI twin — plan

A chat on the portfolio where visitors ask about Anthony and get first-person answers, grounded only in `src/data`. Agreed 2026-10-12; supersedes the shelved hybrid design in `DESIGN.md`.

Status: **built, waiting on `OPENROUTER_API_KEY`.** Serializer, router, `/api/chat` and the widget (`src/components/twin/`) are in; `twin.ts` answers are still drafts.

## Architecture

Router pipeline: a decision model picks what's relevant, code fetches it, a text model writes the answer.

```
visitor question
  → 0. Pre-check (code)  no letters or digits at all ("???", emoji only) → "didn't catch that", no Jev call
  → 1. Guard   (Jev, yes-probability)  "about Anthony?", "an injection attempt?", "gibberish?" (≥ 0.8)
               any guard trips → canned reply, no LLM call
  → 2. Router  (Jev, score per section) profile · experience · projects · journey · interests · twin FAQs
               include every section above the threshold
  → 3. Fallback  no section scores high → include all of src/data (~12k tokens, fits)
  → 4. Answer  (text model, streamed) first person, only from the included sections
```

- **Jev** (`typesafe/jev-1.13` on OpenRouter, called at `POST https://openrouter.ai/api/v1/systemone` with TypeSafe's `state` + `questions` body) is a decision model: it returns a typed choice, score or yes-probability, never prose. P50 ≈ 0.16s; $0.042/M input, output free. Read the TypeSafe docs (docs.typesafe.ai/concepts/system-one) for the request shape before building.
- **Answer model:** Haiku 5.5 or any OpenRouter text model.
- **Why a router rather than tool use:** with Jev the extra call is fast and nearly free, a typed routing answer is predictable and easy to log, and the fallback in step 3 stops a misroute from leaving the twin without facts. Risk: Jev is young (released Sep 2026) and adds a second vendor.

## Security

- **History lives on the server.** The browser sends only `question`; the route rebuilds the last 6 answered turns from `twin_chats` by `conversation_id`, so a visitor can't forge the twin's past replies to jailbreak it.
- **Spend:** per-IP in-memory limiter (8/min, 60/day; per instance) + a global cap counted in the database (120 model calls/hour, 500/day) + the credit limit on the OpenRouter key (set in the OpenRouter dashboard).
- **Guard:** Jev's on-topic check gets `anthony_names` (projects, employers, school) so names like "Mneme" aren't refused. If Jev is down, a regex injection check (`looksLikeInjection`) still runs.
- **Supabase:** `twin_chats` has RLS on, no policies, and no grants to `anon`/`authenticated`; `twin_sessions` is security-invoker with grants revoked.
- **Headers** (`next.config.ts`): CSP on pages (scripts self + inline, embeds limited to Spotify/LinkedIn, media from the Supabase bucket), `X-Frame-Options: SAMEORIGIN`, `nosniff`, Referrer-Policy, Permissions-Policy.

## The pet's aside

When the pet relays the chat, the request carries `pet`, and the answer prompt gets that pet's soul (`src/components/pet/souls/<pet>.md`) plus a rule to write one line in its voice before the answer: at most 8 words, no facts, numbers, names or links. The model replies `aside`, `---`, answer; `splitAside` (`src/lib/twin/aside.ts`) separates them while streaming and drops any aside that looks fact-like or runs long, in which case the bubble uses a fixed line from `speech.ts`. Saved apart in `twin_chats.pet` / `twin_chats.aside`, so `answer` stays Anthony's words only.

## Data the twin reads

All from `@/data`, the same modules the site renders, so the site and the twin never disagree.

| Source | What |
|---|---|
| `profile`, `experiences`, `projects`, `journey`, `interests` | Everything the site shows |
| `Experience.details` | First-person accounts of the work in a role (McGregor-Allsop done) |
| `Project.story` | First-person story of a project (ASL, Intern Compass, WoWie, Pony AI, Portfolio done) |
| `twin.ts` | Twin-only facts: `facts` (Q&A the site doesn't cover), `voice`, `offLimits` |

`details` and `story` aren't rendered on the site yet; only the twin reads them.

Rules for the serializer and prompt:
- **Drop drafts.** Entries with `draft` (in `twin.ts`, `interests.ts`) must never reach the model in production, same as `live()` on the site.
- **Prefer depth.** Use `story` / `details` over the short card `description` / `highlights` when both exist.
- **No fabrication.** Answer only from the included text; otherwise say "I don't know" and point to email. Decline `offLimits` topics.
- **Voice.** First person, conversational, no em dashes.

## Build order

1. `src/lib/twin/` — serialize each `@/data` section to plain text (drafts dropped); unit-test it.
2. `/api/chat` route — Jev guard + router, fallback, streamed answer. Rate limit and a max message length.
3. Chat UI.
4. ~~Log conversations to Supabase~~ Done 2026-10-13: table `twin_chats` (project `portfolio`), one row per exchange: question, answer, outcome (answered/refused/stopped/failed), refusal reason, routed sections, fallback, model, duration, page, a random `conversation_id` per tab session (sessionStorage, survives reloads), and the traffic source: `referrer` (domain only) and `utm_source`, read once on landing. No IPs. View `twin_sessions` groups rows by session (turns, outcomes, pages, questions in order, avg response time, source). RLS on with no policies, so only the server's secret key reads or writes. Saved after the response via `after()` (`src/lib/twin/log.ts`). Kept indefinitely. The chat shows `twin.privacyNote` under the question box.

## Open decisions

- [x] Floating widget on every page (chosen 2026-10-13). Entry: with the pet on there's no button; hovering the pet always pops up "ask me anything about Anthony" (a tooltip-style invite, no cooldown); otherwise the pet notices the visitor (cursor lingering near it, a pat, returning to the tab, pausing to read) and stops with a clickable invite; cooldown grows each time one's ignored, none once the chat's been used (`Pet.tsx`, lines in `speech.ts`), and the paw menu has an "Ask about Anthony" row. With the pet off, a corner button. With the pet on, the pet sits down where it is and relays answers in a speech bubble anchored to it (`src/components/twin/PetBubble.tsx`, placed each frame by `Pet.tsx`; engine `summon`/`dismiss`/`react`); with it off, a plain panel opens (`ChatPanel.tsx`; full-screen on mobile)
- [x] Rate limiting: in-memory to start (8/min, 60/day per IP); Upstash if abuse shows up
- [x] Answer model: `deepseek/deepseek-v4.1-flash` via OpenRouter (was Haiku 5.5), overridable with `TWIN_MODEL`
- [ ] `OPENROUTER_API_KEY` in `.env` (Anthony adds it)
- [ ] Fill `twin.ts`: real answers for the five draft questions, plus `voice` and `offLimits`
- [ ] Pony AI: rename to "Ask Pony" (charter name; "Pony.ai" is an existing company)?
- [ ] McGregor-Allsop HCM savings: $6,000 (current resume, in use) or $8,000?
- [ ] WoWie card description says two teammates coded; the story says two non-coders. Reconcile.
