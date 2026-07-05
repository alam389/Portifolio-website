---
title: "Ask Kiyoko — RAG Scoping"
description: "Why live inventory was excluded from Ask Kiyoko's knowledge base — the trade-offs of scoping RAG to decision logic and education."
---

# RAG scoping: why no live inventory

The obvious build for a shopping concierge is to point RAG at the product catalog.
We deliberately didn't. Kiyoko's knowledge base covers **decision logic and
education** — how to choose — and leaves live inventory out.

## The case against inventory-in-the-KB

<!-- TODO(Anthony): your real reasoning — likely candidates you mentioned: staleness
     (inventory changes faster than embeddings refresh), hallucinated availability/
     pricing being worse than no answer, and the retrieval-quality cost of flooding
     the vector space with thousands of near-duplicate SKUs. Confirm/correct and add
     specifics. -->

## What lives where instead

<!-- TODO(Anthony): the actual division — e.g. KB answers "how do I choose", a
     structured API/platform layer answers "what's in stock" — and how the two
     compose in a single conversation. -->

## Trade-offs accepted

<!-- TODO(Anthony): what this costs you (Kiyoko can't answer "do you have X in
     blue?" from the KB) and why that's the right price. -->
