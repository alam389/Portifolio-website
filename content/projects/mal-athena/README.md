---
title: "MAL-Athena"
description: "Agentic RAG assistant for an engineering consulting firm — FastAPI, LangGraph ReAct, Qdrant, vLLM/Ollama, served through Microsoft Teams via Azure Bot Service."
---

# MAL-Athena

An internal AI assistant (the Dispatch AI stack) built for a small engineering
consulting firm — answers engineering and operations questions over the firm's
internal knowledge, entirely on local infrastructure.

**Stack:** FastAPI · LangGraph (ReAct agent) · Qdrant · vLLM / Ollama · Microsoft
Teams via Azure Bot Service

## What it does

<!-- TODO(Anthony): 2–4 sentences — what users ask it, what corpus it answers from,
     what the before/after looks like for the team. -->

## How it's built

- **FastAPI** backend orchestrating a **LangGraph ReAct** agent
- **Qdrant** as the vector store for retrieval
- Local model serving via **vLLM / Ollama** — no data leaves the firm's hardware
- Delivered where people already work: **Microsoft Teams**, through Azure Bot Service

Deeper write-ups:

- [architecture.md](/projects/mal-athena/architecture) — tool allowlisting, recursion
  limits, checkpointing, and the RAGAS eval pipeline
- [hardware-selection.md](/projects/mal-athena/hardware-selection) — the GPU and
  model selection trade-off study

## Outcome

<!-- TODO(Anthony): one concrete outcome — adoption, queries handled, time saved,
     eval scores. DESIGN.md rule: every project surfaces stack + a concrete outcome.
     Do not ship this page without filling this in. -->
