# AI twin — plan

A chat on the portfolio where visitors ask about Anthony and get first-person answers, grounded only in `src/data`. Agreed 2026-10-12; supersedes the shelved hybrid design in `DESIGN.md`.

Status: **data layer started, nothing else built.**

## Architecture

Router pipeline: a decision model picks what's relevant, code fetches it, a text model writes the answer.

```
visitor question
  → 1. Guard   (Jev, yes-probability)  "about Anthony and not an injection attempt?"
               below threshold → canned reply, no LLM call
  → 2. Router  (Jev, score per section) profile · experience · projects · journey · interests · twin FAQs
               include every section above the threshold
  → 3. Fallback  no section scores high → include all of src/data (~12k tokens, fits)
  → 4. Answer  (text model, streamed) first person, only from the included sections
```

- **Jev** (`typesafe/jev-1.13` on OpenRouter) is a decision model: it returns a typed choice, score or yes-probability, never prose. P50 ≈ 0.16s; $0.042/M input, output free. Read the TypeSafe docs (docs.typesafe.ai/concepts/system-one) for the request shape before building.
- **Answer model:** Haiku 5.5 or any OpenRouter text model.
- **Why a router rather than tool use:** with Jev the extra call is fast and nearly free, a typed routing answer is predictable and easy to log, and the fallback in step 3 stops a misroute from leaving the twin without facts. Risk: Jev is young (released Sep 2026) and adds a second vendor.

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
4. Optional: log conversations to a Supabase table to see what people ask (needs a privacy note on the chat).

## Open decisions

- [ ] Floating widget on every page, or a `/chat` route
- [ ] Rate limiting: in-memory to start, or Upstash
- [ ] Answer model
- [ ] `OPENROUTER_API_KEY` in `.env` (Anthony adds it)
- [ ] Fill `twin.ts`: real answers for the five draft questions, plus `voice` and `offLimits`
- [ ] Pony AI: rename to "Ask Pony" (charter name; "Pony.ai" is an existing company)?
- [ ] McGregor-Allsop HCM savings: $6,000 (current resume, in use) or $8,000?
- [ ] WoWie card description says two teammates coded; the story says two non-coders. Reconcile.
