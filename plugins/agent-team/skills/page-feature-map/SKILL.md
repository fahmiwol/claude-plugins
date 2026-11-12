---
name: page-feature-map
description: "Map every feature of every page of an EXISTING web app (what the user sees, actions, API route, REAL/STUB/PLANNED with file:line, spec source, empty/error/loading states) BEFORE redesigning its UI. A researcher reads code, navigation data, specs and earlier research and curls the public pages; the lead only looks at logged-in pages in the owner's browser; a designer starts after the map exists; the owner approves before code. Use when asked to redesign or modernise a console or dashboard, audit what a UI really has versus its spec, or find UX problems and navigation drift."
metadata:
  type: methodology
---

# Page feature map

> Origin: an internal multi-agent build for a company console, November 2026. The owner asked for the
> console to be redesigned (modern, pleasant, interactive, easy to understand). The map was made first so
> that the designer would not draw screens that do not exist.

## Who does what

- **Researcher** (read-only): reads the code, the navigation data, the specs and any earlier visual
  research, and checks the public live site with `curl` (status codes, headers, static files compared to
  the repo). Does not log in.
- **Lead**: views the logged-in pages in the owner's browser. Look only: press nothing except navigation,
  copy no data rows (emails, log contents). The result is written as an impression per page.
- **Designer**: starts only after the map is finished.
- **Owner**: approves before any code is written.

## Output format (one file, sections 0 to 8)

0. One-screen summary plus the evidence base (repo, commit, time of the live check).
1. Page list: URL, which roles may enter, a one-sentence purpose, status.
2. One table per page. Columns:

   | feature | what the user sees | actions | API route | REAL / STUB / PLANNED with `file:line` | spec source | empty / error / loading states |
   |---|---|---|---|---|---|---|

3. Gap table: **spec says | code has | live | conflict**.
4. UX problems by category: technical wording (propose replacements), dead ends, button feedback, hard to
   find, technical detail up front, accessibility, behaviour on a phone.
5. Navigation counted by status and by owner, plus a proposed grouping (a proposal only; do not change
   the data).
6. Repeated components and design tokens, compared with the sibling app.
7. Open questions for the owner (at most 5, each with a recommendation).
8. What was not reached or not verified.

## Rules

- **Count from the data, not from the brief.** If the brief says 45 navigation items and the data holds
  42, write the correction at the top.
- Every claim carries a `file:line` or a URL. What you did not see is marked **UNVERIFIED** (logged-in
  screen contents, production flag values, a real phone render, accessibility tool results).
- Never copy customer or user data into the map; the file holds no secrets.
- Compare static files on the live site line by line with the repo. Line-ending differences (CRLF) make raw
  hashes differ; that is not a content difference.

## Pitfalls (all seen in the origin case)

- **Navigation data copied between two apps silently goes stale.** Seven items were still "planned" in the
  copy while already live at the source. Fix: one source file; generate the copy with source and version
  fields; fingerprint-check it in CI.
- **One console in "three skins".** Two light shells with different headers, plus API documentation in a
  dark theme. The same item even had different labels per shell. Users feel they changed application.
- **Menus promising unbuilt pages.** 26 of 42 items led nowhere. Use an honest "Not built yet" group in the
  sidebar instead of live-looking links to empty pages.
- **The reverse proxy answers a path before the app's own redirect**, so the redirect code is dead. Check
  the live status code; do not trust the route in the code.
- **The most useful section hides under "More" on phones**, though it was the only fully live part.
- **Raw JSON and raw action codes in audit tables.** Put a plain-language summary first and the technical
  detail behind a click.
