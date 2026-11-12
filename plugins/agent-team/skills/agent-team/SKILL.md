---
name: agent-team
description: "Run work through a full team of AI agent roles so it is fast, cheap and checked: researcher, designer (design + plan), owner approval, builder (code), then code review, security review, QC, validator and verifier in parallel, an evaluator who decides 'done' from real state, and a writer for the docs. Use when a lead session has a feature, a research-to-build task, a UI overhaul or a backlog to execute, or when the user says 'use the team', 'research, design, build, review'. Covers the roster, model per role, parallelism, the brief and report contract, frugality rules and the pitfalls that already happened."
metadata:
  type: methodology
---

# Agent team

> Origin: an internal multi-agent build for a company console, November 2026. The owner asked for a
> complete team "so it is fast and cheap": one role to research, one to design and plan, one to code, one
> to review, one to test, one to judge, one to write. Later the same week the owner added QC, validator
> and verifier. The pitfalls below are things that actually went wrong in that run.

The **lead** (your main session) decides, splits the work and checks it. The lead does not do work that a
cheaper role can do. The roles ship in this plugin as subagents (`agents/`).

## Roster

| Role | Subagent | Default model | Raise to opus when | Writes? |
|---|---|---|---|---|
| Researcher | `researcher` | sonnet | rarely; architecture research across products | only its result file |
| Designer | `designer` | sonnet | architecture, security, auth, money, data migration, cross-product decisions | design and plan documents |
| Builder | `builder` | sonnet | REQUIRED for auth, tokens, tenant isolation, permissions, money or quota, data migration, external senders | code, on its own branch |
| Code reviewer | `code-reviewer` | sonnet | - | no (read-only) |
| Security reviewer | `security-reviewer` | opus | - | no (read-only) |
| QC tester | `qc-tester` | sonnet | high-risk work | test files only |
| Validator | `validator` | sonnet | cross-product decisions | no (read-only) |
| Verifier | `verifier` | sonnet | legal or money claims made public | no (read-only) |
| Evaluator | `evaluator` | sonnet | high-risk work (checker at least the builder's tier) | no (read-only) |
| Writer | `writer` | sonnet; haiku for mechanical fills | - | documents only |
| Specialist | `specialist` | sonnet | cross-product architecture | no (read-only); the brief names 1-3 disciplines (UX researcher, designer, AI or agentic or fullstack engineer, physicist, mathematician, robotics, game dev, audio, data scientist) |

Always pass `model` (and effort if your setup has it) explicitly when you call a role, so the cost choice
is visible and deliberate: haiku for mechanical work, sonnet as the standard, opus only for decisions,
security, auth, money, data migration, and for the evaluator of such work.

## Flow

1. **Researcher** (two in parallel if the topics are separate) writes a result file plus decisions for the owner.
2. **Designer** turns it into a concept and a stepwise plan (acceptance checks as red tests) and at most 5
   decisions for the owner.
3. **Owner approves** (a choice card, recommendation first). Without approval, stop here for new UI,
   security, money, infrastructure and anything published. The **writer** records the decision.
4. **Builder**, one step at a time. One writer per set of files, each in its own git worktree. Steps that do
   not depend on each other may run in parallel; at most two heavy agents at once.
5. **Checks, in parallel** (all read-only except QC, which only writes tests):
   - **code-reviewer** (always) and **security-reviewer** (when security, money or agents acting for users
     are involved): is the code right?
   - **qc-tester**: try to break it: missing tests, negative cases, small mutations, a real browser at
     375 and 1280 px.
   - **validator**: is it what the owner actually asked for, and consistent with the project rules?
   - **verifier**: is every number, price, citation, source and "live/green" claim true at the primary source?
   Then the **evaluator** decides DONE per acceptance check from real state. A HOLD finding goes back to step 4.
   Division of labour: reviewer = code · QC = behaviour when attacked · validator = the right thing ·
   verifier = the true facts · evaluator = verdict on done.
6. Merge, deploy, reverse-proxy changes, pushes to production: only with the owner's permission for that
   exact step. After a deploy the evaluator checks the live system (a commit is not a deployment).
7. **Writer** updates the handoff, changelog and work map; the lead records what was learned.

## Brief contract (lead to role)

One-sentence goal · materials to read (paths) · files the role may touch · what is FORBIDDEN (other
writers' trees, production, secrets) · acceptance checks · where the result is written · report length
limit. The brief is the role's only context: complete, never "see the conversation".

## Frugality

- Start with the cheapest model that is enough; move up only for a high-risk trigger or after two failures
  with the same brief.
- Research and review are read-only and parallel; writing files is one writer per set of files.
- A step that waits more than five minutes on a build, full suite, mutation run or deploy goes to a
  long-wait worker (a longer prompt-cache lifetime if your platform offers one); everything else uses the
  default.
- Short reports with a line limit per role; long output goes to a file, not into the lead's context.
- Do not research twice: search your project's memory/knowledge store and the repo's research documents first.

## Pitfalls

- **Turn limits cut roles off mid-task.** In the origin run, a builder stopped at its limit exactly while
  applying a mutation, and a QC run stopped while writing a test file. Raise the limits for builder and QC,
  and make every role save incrementally: commit per green sub-step, append to the report per area, restore
  mutated files at once. When a role stops, the lead checks for leftover mutations (`git status`, `git diff`
  on product files) before telling it to continue.
- **A newly added agent can be "not found" for a moment.** The app loads a new agent definition a little
  after the file is written. Wait for the announcement, then test it with one cheap call (haiku) before
  real work.
- **A role's report is not proof.** The lead or evaluator checks git, tests and the live system before
  telling the owner anything.
- **Verify every premise you put in a decision card before asking.** A card claimed "the only always-on
  machine is X" without checking; another owned machine was online. The card had to be corrected. Check
  inventory with the live tool or the knowledge store first.
- **Maker is not checker.** The reviewer must not be the builder, and for high-risk work the checker is at
  least the builder's model tier.
- **Do not edit product files while a mutation gate runs**, and do not run a QC role that mutates product
  files while the lead edits the same files: a restore can overwrite the lead's edit. Schedule product
  edits after QC, or have QC mutate a throwaway copy through a script that restores in `finally`.
- **Check role claims against the original document.** A research role once concluded "the procedure is far
  below the benchmark" when the procedure already stated the number.
- **An impossible owner request** (a physical limit) is not written down as given. Make a card with the
  evidence and the possible options; the owner chooses.
- **Verify names before @-mentioning anyone** (check the account and the repository collaborators).
- **A long session's event list may show only tool-call lines.** With thousands of messages the list can
  be just "(called Bash)". Read the report text from the session notification, then check git log and the
  handoff of that repository.
- **Cross-repository work requested by a peer session** (another session asks yours to change a different
  repo) goes into a proposal card first, and is worked in a worktree of the target repo, not in the folder
  the peer is using.
- **If a more capable executor is unavailable** (quota gone), the lead may write the part itself, but marks
  it openly on the work board. Never silently.
