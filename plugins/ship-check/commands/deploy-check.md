---
name: deploy-check
description: Check a URL is up and actually rendering, and report what is wrong if not
argument-hint: <url> [second-url-to-compare]
---

Verify the page at $1 the way a visitor would receive it, not the way a status check sees it.

1. Call `check_page` on `$1`.
2. Lead the answer with `visibleTextLength`, because a 200 with zero visible text is the
   failure a status check misses. If it is zero and the page loads scripts, say plainly that
   this cannot be resolved without a browser rather than guessing.
3. List every finding at `error` and `warn` level with its explanation. Mention `info` findings
   only if they matter for this page.
4. If a second URL was given in `$2`, call `compare_pages` on `$1` and `$2` and say whether the
   deploy actually landed.
5. If anything is broken, name the most likely cause and the next thing to look at. Do not
   suggest code changes until the evidence points at code.

Report measurements, not reassurance.
