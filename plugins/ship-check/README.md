# Ship Check

**A green build means the code compiled. A 200 means a server answered. Neither means a person
can see your page.**

This plugin makes Claude verify releases with evidence instead of optimism. It bundles a
read-only MCP server, two skills that teach the discipline, and a slash command.

## Install

```
/plugin marketplace add fahmiwol/claude-plugins
/plugin install ship-check@fahmiwol
```

## What is in it

**MCP server — `deploy-check`.** Three read-only tools:

| Tool | Answers |
|---|---|
| `check_page` | Is it up, and does it render anything a human can read? Status, redirects, timing, visible text length, title, description, viewport, canonical, og:image, stray `noindex`. |
| `check_links` | Do the links on this page resolve? HEAD first, GET fallback, so a server that refuses HEAD is never called a dead link. |
| `compare_pages` | Staging against production, or before against after. Identical text means the deploy has not landed. |

Nothing is written, posted or changed. No account, no API key, no telemetry — the server runs
on your machine and contacts only the URLs you ask about. Its source is
[deploy-check-mcp](https://github.com/fahmiwol/deploy-check-mcp), MIT licensed.

**Skill — `verify-deploy`.** The order to check things after a deploy, and how to tell the
three lookalike failures apart: a bundle that threw, the wrong directory published, and a cache
still serving yesterday.

**Skill — `verify-like-a-buyer`.** The clean-state checklist for anything someone else installs.
Extract to an empty directory, follow your own README literally, never publish a command you
have not run, check the defaults — paginated listings under-report and produce audits that
confidently say "no problems found" while reading a fraction of the data.

**Command — `/deploy-check <url> [url-to-compare]`.**

## The honest limit

It does not run JavaScript. It sees the page as a crawler and a link preview see it — which is
the point, and also the boundary. A healthy single-page app and a broken one look identical in
raw HTML, so blank HTML is only a hard failure when the page loads no scripts at all. With
scripts present you get a warning that says so outright and tells you to open a browser.

A tool that called every React app broken would be worth ignoring within a day.

## Licence

MIT.
