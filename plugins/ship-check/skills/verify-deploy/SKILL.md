---
name: verify-deploy
description: Verify a deploy actually landed and the page actually renders, instead of trusting a green build or a 200 status. Use after any deploy, publish, release, or when someone says a site "looks broken", "is blank", "didn't update", or "still shows the old version".
tags: [deploy, release, verification, debugging, web]
---

# Verify a deploy

A green build means the code compiled. A 200 means a server answered. **Neither means a person
can see your page.** The three failures below all produce a healthy-looking 200:

- a JavaScript bundle that failed to load or threw, leaving an empty root element
- a deploy that published the wrong directory, so the server happily serves an empty index
- a CDN or proxy still serving the previous version, so the change never reached anyone

Verify with evidence, not with a status code.

## The order to check things

Use the `deploy-check` tools bundled with this plugin. Never claim a deploy worked without
having run at least step 1.

**1. Does the page render anything?**

Call `check_page` on the URL that a real visitor uses — the public URL, not localhost, not the
build preview.

Read `visibleTextLength` first. It is the number that matters:

- **Hundreds or thousands of characters** — the page is genuinely rendering.
- **Zero, and no scripts on the page** — reported as an error. Nothing can fill it later; this
  is broken as served. Suspect the published directory or an empty template.
- **Zero, with scripts present** — reported as a warning, and the tool says plainly that it
  cannot tell a healthy single-page app from a broken one, because it does not run JavaScript.
  **Do not resolve this from the tool alone.** Open the page in a browser and read the console,
  or check the built HTML on disk. If the site is meant to be server-rendered, treat it as broken.

Then read the findings. A stray `noindex` carried over from staging, a missing viewport, a
redirect that quietly changed host — these are real and each has a one-line explanation.

**2. Did the new version actually arrive?**

If the deploy was supposed to change something, prove it changed. Call `compare_pages` with
staging and production, or note the `visibleTextLength` before the deploy and compare after.

`identicalContent: true` when you expected a change means the deploy has not landed at that
URL. Look at the CDN cache, the proxy, the branch that was actually built, and the directory
that was actually published — in that order. Do not start rewriting application code.

**3. Did anything else break on the way?**

Call `check_links` on the changed pages. Renames and moved routes break links silently, and
nobody notices until a customer does.

## How to report the result

State what you measured, not how you feel about it. "Up, 200 in 412 ms, rendering 5,668
characters" is a verification. "Looks good" is not.

If something is wrong, say which of the three causes above the evidence points at, and what to
look at next. If the evidence cannot distinguish between them — which is exactly the case for a
blank single-page app — **say so rather than guessing.**

## What this cannot tell you

It does not run JavaScript, measure layout, take screenshots or audit accessibility. It sees
the page as a crawler, a link preview and a first paint see it. That is the point, and it is
also the limit. When the answer needs a real browser, use one and say that is why.
