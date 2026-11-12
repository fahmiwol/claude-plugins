---
name: publish-findings
description: Turn experiments, research notes, repos and agent work into open, citable knowledge that search engines and AI answer engines (SEO/AEO/GEO) can cite, without leaking transcripts, private projects, infrastructure or secrets, and with the human author approving every piece. Use when asked to write up findings, publish research, build a findings dataset, "turn my work into articles", share an experiment publicly, or before anything goes out under a person's name.
---

# Publish findings as open knowledge

A method for publishing real work so that people, search engines and AI answer engines can find and cite it, while
the author stays in control. Nothing goes out without the named author's own approval of that exact piece.

The order below matters. Do not skip steps.

## 1. Measure the baseline first
Before writing, record where you stand: clicks, impressions and indexed pages from the search console, plus any
citation checks you already do. Without a "before" number you cannot say later whether publishing helped. If a number
is not measured, write "not measured". Do not guess it.

## 2. Inventory the candidates
List everything that could be published (sessions, repos, git history, notes, experiment logs, other agents' output).
Tag each row with exactly one label:

- **PUBLIC-READY**: the author owns it, it contains no private material, and the source can be opened by a reader.
- **NEEDS-PERMISSION**: publishable only with someone's yes (a client, a collaborator, a platform owner). Write down whose.
- **PRIVATE-REJECT**: private projects, infrastructure, secrets, personal data, raw working notes. Never published.

An agent's report is not evidence. Match each claim to a file, log or commit before it enters the inventory.

## 3. Write each finding as a synthesis
Every finding contains:

1. **Claim**: one sentence that can be right or wrong.
2. **Method**: what was done, specifically enough to repeat.
3. **Numbers**: the measured values, with units.
4. **Date**: when it was measured.
5. **Limits**: what the result does not show; sample, device and setup caveats.
6. **Source**: something the reader can open (public repo, dataset file, commit, paper).

Rules for the numbers:

- Small evaluations must state **n** and a **Wilson interval** for proportions. A tiny n (for example 5) is never used for a hard conclusion.
- Negative and null results are written as they are. They are often the most citable part.
- Label the strength of the evidence on each finding: **recomputed** (you reran it from raw data), **partly recomputed**,
  or **quoted from notes** (you trust the notes but did not rerun).
- Check the device context of every speed number (which machine, CPU or GPU, cold or warm). A claim about hardware that
  the author's own machine contradicts is a correction waiting to happen.

Voice: first person, plain, specific, carrying the number. Write as the author ("I measured"), not as a team or a
brand ("we are excited"). Do this voice pass **before** asking for approval (see pitfalls).

## 4. Structured data
- A **dataset** file (JSON) holding every finding, plus a schema for it.
- **JSON-LD `Dataset`** on the index page and **`ScholarlyArticle`** on each finding page.
- The author as a **`Person`** entity with a stable URL.
- One **canonical** URL per piece, **hreflang** for each language plus x-default, a **sitemap**, and an **`llms.txt`**
  that points to the dataset and the index.
- Licence suggestion: **CC BY 4.0** for text and data, **MIT** for code. The author decides.

## 5. Gate (a): automated scanner
Run the bundled scanner over every page and file before review:

```
node scripts/scan-publish.mjs --config scan-publish.json <folder-or-files>
```

It looks for private names (from your config only), private infrastructure, tokens, emails outside the allow-list,
dialog and conversation-log patterns, money amounts and personal data. Exit code 1 means stop and fix. A clean scan is not a
fitness review; it only proves the mechanical leaks are gone.

## 6. Gate (b): second-model review against primary sources
A different model (or a human reviewer) opens the primary sources and checks every number, date and citation in each
piece, and judges privacy risk. Repeat until a pass finds nothing new. The reviewer reads the source itself, not the
author-model's summary of it.

## 7. Gate (c): the named author's own yes, per piece
Only the named author approves, in the session that wrote the piece. Approval from another session or agent does not count.
Present one batch: a one-line summary per piece, and flag the piece with the weakest evidence. Offer "approve all" and
"choose per piece". Text about the author themself (bio, about page) needs a yes too.

## 8. Release, live check, request indexing
- Release through the site's normal deploy path.
- Check on the live URL: HTTP 200, sitemap lists the new pages, canonical and hreflang correct, JSON-LD parses.
  Write down the rollback command before you need it.
- Then request indexing (skill `request-indexing`) and resubmit the sitemap **after** the release.

## 9. One canonical home per piece
Each piece lives in exactly one place. Other platforms get a short summary plus a `rel=canonical` link back. Copies of
the full text on several sites compete with each other and dilute citations.

## Never publish
Never publish transcripts, dialog quotes, founder or working journals, agent onboarding notes, private repository names (evidence
from a private repo is written as experience with numbers, no link), client names without written permission,
infrastructure details (hosts, addresses, paths, ports), secrets of any kind, provider quota or cost details you were
told to keep private, and personal data of other people. "It was public once" is not permission to republish it.

## Pitfalls (each of these happened)
- **Voice pass after approval.** Text submitted in a team voice was approved, then rewritten in first person, which
  needed a second approval. Run the voice pass before the batch goes to the author.
- **Wrong chapter.** An agent cited a public source by the wrong chapter number; the real passage was in a different
  file. Open the source yourself.
- **Hardware claim contradicted.** "No GPU needed" was false: the author's laptop had one and only a second machine was CPU-only.
  Check device context for every speed number.
- **Stale sitemap.** A sitemap submitted before the release was read as 38 pages instead of 54. Resubmit it after release.
- **Clean scan taken as approval.** The scanner cannot judge whether a document is fit to publish. A human still reads it.
