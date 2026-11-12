# open-findings

A method for turning experiments, research notes, repos and agent work into **open, citable knowledge** that search
engines and AI answer engines can cite, without leaking transcripts, private projects, infrastructure or secrets, and
with the human author approving every piece.

Methods derived from real publishing work, Nov 2026.

## Install

```
/plugin marketplace add fahmiwol/claude-plugins
/plugin install open-findings@fahmiwol
```

## What is inside

| Part | What it does |
|---|---|
| **`publish-findings`** (skill) | The full method: measure a baseline, inventory candidates (public-ready, needs permission, private-reject), write each finding with claim, method, numbers, date, limits and an openable source, add structured data, then pass three gates: automated scan, second-model review against primary sources, and the named author's own yes per piece. |
| **`request-indexing`** (skill) | After release, request indexing and resubmit the sitemap in Google Search Console through a browser agent, on the right Google account, only when the account owner asks. |
| **`scripts/scan-publish.mjs`** | A publication scanner: Node 18 or newer, no dependencies. |

## The scanner

```
node scripts/scan-publish.mjs --config scan-publish.json <file-or-folder>...
```

Options: `--config <file>` loads your settings, `--json` prints findings as JSON. Exit code is 0 when clean, 1 when
there are findings, 2 on a usage or config error.

The config is optional. Private names exist only in your config, never in the tool:

```json
{
  "privateNames": ["a-private-project", "a-client"],
  "allowedEmails": ["<your public contact address>"],
  "allowMoney": false
}
```

Rule groups: `private-name` (from config), `private-infra` (IPv4 addresses, host:port, internal host suffixes, server
paths, Windows drive paths), `token` (common API key formats, bearer values, key=value secrets, JWTs), `email`
(outside the allow-list), `dialog` (role-prefixed lines, bracketed roles, un-negated mentions of conversation logs),
`money` (unless `allowMoney`), `personal-data` (phone numbers, 16-digit ids).

HTML is reduced to visible text, meta content and JSON-LD before scanning; script, style, SVG and attributes are ignored,
and reported line numbers still match the HTML source. Findings show rule, file, line and a short excerpt, with tokens
and personal data masked.

A clean scan is not a fitness review. Read the piece, and get the author's yes.

Run the tests: `node --test scripts/scan-publish.test.mjs`

## Licence

MIT, see [LICENSE](LICENSE). Suggested licences for what you publish with it: CC BY 4.0 for text and data, MIT for code.
