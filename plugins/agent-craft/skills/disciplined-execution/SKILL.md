---
name: disciplined-execution
description: "Test-driven, modular execution discipline for ANY non-trivial build/change/feature/fix/optimization on any project. Use BEFORE starting and DURING execution. Decompose work into modular epics→episodes, and gate EVERY episode through 8 validation steps (design→offline-test-on-real-data→build→static-check→careful-deploy→live-verify→iterate-or-rollback→record). Purpose: never ship regressions, never let defaults/config silently drift, never rush hot-path changes, never claim done without live proof. Trigger for: production changes, hot paths, model/config/DB defaults, anything hard to reverse, or any task where 'it looked fine' is not proof."
metadata:
  type: methodology
---

# Disciplined Execution — the 8-gate loop

> Origin: MiganCore (Fahmi), 2026-07. Distilled from repeated real failures where a change "looked fine" but shipped a regression, a default silently reverted (F-125), a quick tweak backfired (F-143 DRY→hallucination), or a fix was claimed without reproducing the real failing input (F-108). This skill turns those lessons into an operating discipline any agent applies on any project.

## Core stance
**"It looked fine" is not proof. Reproduce the real failure, test before you ship, verify the live runtime (not a status badge), record durably, and never rush a hard-to-reverse change at the end of a long session.** Intelligence of the *system* comes from discipline, not from one clever edit.

## Decompose first: Epics → Episodes
- **Epic** = a coherent workstream (a theme). **Episode** = one independently shippable, independently verifiable, rollback-able unit inside it.
- Each Episode has ONE clear deliverable, an explicit success metric set *before* building, and a dependency list. No Episode blocks another unless the dependency is written down.
- Modular means: base/tech-agnostic where possible (so foundational work isn't thrown away on a later upgrade), flag/shadow-gated on hot paths, and reversible with one command.

## The 8 gates — EVERY episode passes all, in order
1. **Design** — write the hypothesis + the deciding metric (a number/observable) BEFORE code. Cite the finding/research/repro that motivates it. No post-hoc goalposts.
2. **Offline-validate on REAL data** — test the core logic against the actual failing input / real records FIRST, before touching prod. This is the gate that catches backfires (a "quick fix" that makes things worse). If you can't reproduce the problem, you can't claim a fix.
3. **Build** — modular, minimal, string-anchored edits; new file over sprawling patch when possible; match surrounding code style.
4. **Static check** — compile/parse + unit tests + any project invariant checker (e.g. a "defaults didn't drift" guard). Note dependency blockers honestly; never claim a full test pass you didn't run.
5. **Careful deploy** — shadow-first on hot paths (compute + log, don't act, until calibrated); deploy the minimal service; back up what you overwrite; never touch secrets/env you didn't intend; check that editing shared config won't silently recreate/revert *other* things.
6. **Live E2E verify** — exercise the REAL endpoint with the REAL repro; measure the metric before→after; verify the true runtime state, not a cosmetic indicator. Not happy-path.
7. **Iterate or rollback** — fail → fix and re-run gates 2–6; do NOT silently move on from a failed hypothesis. Regression → roll back immediately (keep the one-command revert ready).
8. **Record durably** — append a finding (what/why/metric/verdict), an experiment-ledger entry, and update the handoff/plan so nothing is lost if the session is cut. Keep source-of-truth == deployed == committed (no silent drift between laptop, repo, and server).

## Hard rules (violating any = stop)
- **Reproduce the exact failing input** before claiming a diagnosis or fix (F-108).
- **Verify the runtime, not the badge** — a health/status field can be right while the real thing is wrong (F-125).
- **Quick tweaks can backfire** — sampler/prompt/config nudges get tested offline first; if they regress, don't ship (F-143).
- **Don't rush a hot-path / hard-to-reverse change at the tail of a long, tired session** — do the safe non-prod parts (design, offline-validate, build, static-check) and defer the deploy to a fresh focused pass. Deferring after validation is discipline, not avoidance.
- **Respect project invariants** — don't silently change defaults, identity, model pointers, or anything the project treats as load-bearing; if a change touches them, gate it explicitly and verify.
- **One source of truth per fact** — link, don't duplicate; keep the durable record the single place progress lives.

## Anti-patterns (all seen in the wild, all cost real time)
- Passing a unit test on hand-picked clean inputs and calling the system fixed.
- Editing one line of shared config and silently recreating an unrelated service to a stale pin.
- Trusting "local is behind server" without fetching + diffing divergence first.
- Cranking an anti-repetition/penalty knob and shipping it without checking it didn't start hallucinating.
- Claiming "done" from a status badge instead of the real resolved runtime.
- Building throwaway work tied to today's tech that a planned upgrade will force you to redo (prefer base-agnostic foundations).

## How to use in a session
1. Restate the task as Epics→Episodes; pick the smallest valuable Episode.
2. Walk gates 1→8 for it. Stop at gate 8 or at a rollback.
3. If the Episode is a hot-path change and the session is long/tired, stop after gate 4 (offline-validated + built), record, and hand off the deploy.
4. Never batch multiple unverified hot-path changes into one "big ship."

**One-line lock:** *Decompose small, validate on real data before prod, verify the live runtime, iterate or roll back, and record everything — so progress compounds and regressions never ship.*
