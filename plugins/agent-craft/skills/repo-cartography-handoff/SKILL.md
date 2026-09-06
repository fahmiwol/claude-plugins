---
name: repo-cartography-handoff
description: >-
  Builds a maintainable documentation map for large repositories: canonical tier list
  (T0–T5), folder roles, runtime flow, doc conflicts, and an honest "coverage" section.
  Use when a user asks for deep repo understanding, handoff between AI agents, onboarding
  docs, or a PROJECT_CARTOGRAPHY-style artifact in any codebase (not only Mighan).
---

# Repository cartography & agent handoff (reusable pattern)

## When to use

- Multi-document monorepo where truth is spread across `README`, `docs/`, ADRs, and chat memory.
- Handoff between Claude / Cursor / other agents with weekly usage limits.
- Before a big refactor: establish **which document wins** on conflict.

## Steps

1. **Inventory** top-level dirs and entrypoints (`package.json`, main server file, app entry).
2. **Classify docs** into tiers:
   - **T0** — operational source of truth (team “memory” file, `AGENTS.md` equivalent).
   - **T1** — sprint / continuity / review boards.
   - **T2** — domain manuals (product, revenue, architecture).
   - **T3** — ADRs, PRDs (may be **historical** — flag if superseded by code).
3. **Runtime diagram** — 5–10 bullets: boot → config → API → UI (no need for full sequence diagrams unless asked).
4. **Conflicts** — explicit table: “File A says X, code/B says Y → follow B until A updated.”
5. **Honest coverage** — list what was read end-to-end vs skimmed vs not read (`node_modules`, generated JSON, etc.).
6. **Living log** — pair with a `AGENT_CONTINUITY.md`-style file: session ID, date, agent, diff summary, follow-ups.

## Output artifact

Prefer a single file named `PROJECT_CARTOGRAPHY.md` (or `REPO_MAP.md`) under `docs/` with the sections above. Link it from the primary agent instructions file so discovery is one hop.

## Security pass (always)

Scan docs for API keys, tokens, private URLs. Remove from repo; use env placeholders. Note rotation in the continuity log if keys may have been exposed.

## Optional: project skill

Copy a thin `SKILL.md` into `.cursor/skills/<name>/` pointing at the cartography file so future sessions auto-orient.
