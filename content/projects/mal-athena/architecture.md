---
title: "MAL-Athena — Architecture"
description: "Inside the MAL-Athena agent: tool allowlisting, recursion limits, checkpointing, and a RAGAS evaluation pipeline."
---

# Architecture

The interesting parts of MAL-Athena aren't the happy path — they're the guardrails
that make an agent safe to hand to non-technical colleagues.

## Tool allowlisting (`ACTIVE_TOOL_NAMES`)

The agent can only call tools present in an explicit allowlist, resolved at startup.
Deploying a scoped-down variant (e.g. retrieval-only) is a config change, not a code
change.

<!-- TODO(Anthony): replace this illustrative snippet with the real pattern from the
     codebase (sanitized). Illustrative only — not production code. -->

```python
ACTIVE_TOOL_NAMES = {"search_docs", "get_project_summary"}

tools = [t for t in ALL_TOOLS if t.name in ACTIVE_TOOL_NAMES]
agent = create_react_agent(model, tools=tools, checkpointer=checkpointer)
```

## Recursion limits

ReAct loops can spiral — a bounded recursion limit caps the reason/act cycle so a
confused agent fails fast with a clear error instead of burning GPU time.

<!-- TODO(Anthony): the actual limit value and what happens on hitting it (fallback
     message? human handoff?). -->

## Checkpointing

Conversation state is checkpointed so multi-turn threads in Teams survive restarts
and can be resumed/inspected.

<!-- TODO(Anthony): which checkpointer (memory/SQLite/Postgres?) and why. -->

## Evaluation: RAGAS pipeline

Retrieval and answer quality are measured with a **RAGAS** eval pipeline rather than
vibes — changes to chunking, prompts, or models get scored before they ship.

<!-- TODO(Anthony): which metrics (faithfulness, answer relevancy, context precision…),
     the eval set size, and one real number you're comfortable publishing. -->
