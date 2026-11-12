// Tests for scan-publish.mjs. Secret-looking fixtures are assembled at runtime so this file
// never contains a literal token that other scanners would flag.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { scanText, htmlToText, scanHtml } from './scan-publish.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const CLI = join(HERE, 'scan-publish.mjs');
const rules = (text, cfg) => scanText(text, cfg).map((f) => f.rule);
const has = (text, rule, cfg) => rules(text, cfg).includes(rule);

test('private-infra: positive', () => {
  assert.ok(has('the box is 192.168.1.20 today', 'private-infra'));
  assert.ok(has('connect to db-main:5432 now', 'private-infra'));
  assert.ok(has('see wiki.internal for details', 'private-infra'));
  assert.ok(has('logs live in /var/log/app', 'private-infra'));
  assert.ok(has('config at "/srv/app/.env"', 'private-infra'));
  assert.ok(has('copied from C:\\Users\\someone\\notes', 'private-infra'));
});

test('private-infra: negative', () => {
  assert.deepEqual(rules('version 1.2.3 shipped at 10:30 with ratio 3:4'), []);
  assert.deepEqual(rules('see the /docs/guide page and https://example.com/var'), []);
});

test('tokens: positive for every family', () => {
  const t = {
    sk: 'sk-' + 'a1B2c3D4'.repeat(3),
    ghp: 'ghp_' + 'Ab1'.repeat(12),
    pat: 'github_pat_' + 'Zy9'.repeat(8),
    aws: 'AKIA' + 'IOSFODNN7EXAMPLE',
    slack: 'xoxb-' + '1234567890-abcdef',
    goog: 'AIza' + 'Sy'.repeat(18),
    bearer: 'Authorization: Bearer ' + 'abcd1234efgh5678.ijkl',
    kv: 'password = ' + 'hunter2hunter2',
    jwt: ['eyJhbGciOiJIUzI1NiJ9', 'eyJzdWIiOiJ0ZXN0In0', 'c2lnbmF0dXJl'].join('.'),
  };
  for (const [k, v] of Object.entries(t)) assert.ok(has(`value ${v} end`, 'token'), k);
});

test('tokens: negative', () => {
  assert.deepEqual(rules('the sk- prefix and the word tokens: none, secrets stay out'), []);
  assert.deepEqual(rules('ask-me-anything about task-based flows'), []);
});

test('tokens: excerpt is masked', () => {
  const secret = 'sk-' + 'a1B2c3D4'.repeat(3);
  const [f] = scanText(`key is ${secret} ok`).filter((x) => x.rule === 'token');
  assert.ok(f.excerpt.includes('sk-a'));
  assert.ok(f.excerpt.includes('***'));
  assert.ok(!f.excerpt.includes(secret));
  assert.ok(!f.excerpt.includes(secret.slice(8)));
});

test('email: outside allow-list flagged, allow-listed passes', () => {
  assert.ok(has('write to someone@example.org', 'email'));
  assert.deepEqual(rules('write to hello@example.com', { allowedEmails: ['Hello@Example.com'] }), []);
  assert.ok(has('write to other@example.com', 'email', { allowedEmails: ['hello@example.com'] }));
});

test('dialog: role prefixes, bracketed roles, transcript word', () => {
  assert.ok(has('User: how do I deploy?', 'dialog'));
  assert.ok(has('intro\n  Assistant: sure', 'dialog'));
  assert.ok(has('[assistant] sure thing', 'dialog'));
  assert.ok(has('[User 12:01] hello', 'dialog'));
  assert.ok(has('here is the full transcript of the call', 'dialog'));
  assert.ok(has('Transcripts are attached', 'dialog'));
});

test('dialog: negated transcript and ordinary prose pass', () => {
  assert.deepEqual(rules('this is not a transcript'), []);
  assert.deepEqual(rules('we never publish transcripts'), []);
  assert.deepEqual(rules('written without any transcript'), []);
  assert.deepEqual(rules('the user said nothing; the assistant professor left'), []);
});

test('money: flagged unless allowMoney', () => {
  assert.ok(has('it costs $45 per month', 'money'));
  assert.ok(has('harga Rp 5.000', 'money'));
  assert.ok(has('about USD 20', 'money'));
  assert.deepEqual(rules('it costs $45 per month', { allowMoney: true }), []);
  assert.deepEqual(rules('a dollar-less sentence with 45 items'), []);
});

test('personal-data: phone and 16-digit ids', () => {
  assert.ok(has('call +62 812 3456 7890 today', 'personal-data'));
  assert.ok(has('call 0812-3456-7890 today', 'personal-data'));
  assert.ok(has('id 3201234567890001 on file', 'personal-data'));
  assert.ok(has('card 1234 5678 9012 3456 on file', 'personal-data'));
  assert.deepEqual(rules('dated 2026-11-12, n=120, build 20261112'), []);
});

test('private names come only from config', () => {
  assert.deepEqual(rules('project Zebrafinch shipped'), []);
  assert.deepEqual(rules('project Zebrafinch shipped', { privateNames: [] }), []);
  const cfg = { privateNames: ['zebrafinch', 'Acme Labs'] };
  assert.ok(has('project Zebrafinch shipped', 'private-name', cfg));
  assert.ok(has('built for ACME LABS last year', 'private-name', cfg));
  assert.deepEqual(rules('the zebrafinches sing', cfg), []); // whole-word match only
});

test('HTML: only visible text, meta content and JSON-LD are scanned', () => {
  const html = [
    '<html><head><title>T</title>',
    '<meta name="description" content="reach us at leak@example.org">',
    '<style>.a{background:url(/srv/x/y.png)}</style>',
    '<script>var u="/srv/app/bundle.js"; var ip="10.1.2.3"</script>',
    '<script type="application/ld+json">{"@type":"Dataset","contact":"ld@example.org"}</script>',
    '</head><body>',
    '<svg viewBox="0 0 10 10"><path d="M 192.168.1.1 L 10.0.0.1"/><text>/srv/in/svg</text></svg>',
    '<a href="/srv/attr/path" title="/var/attr">visible words</a>',
    '</body></html>',
  ].join('\n');
  const found = scanHtml(html);
  const emails = found.filter((f) => f.rule === 'email').map((f) => f.line);
  assert.equal(found.length, 2, JSON.stringify(found));
  assert.deepEqual(emails.sort(), [2, 5]); // line numbers refer to the source HTML
  const text = htmlToText(html);
  assert.ok(text.includes('visible words'));
  assert.ok(!text.includes('/srv/attr/path'));
  assert.ok(!text.includes('192.168.1.1'));
  assert.equal(text.split('\n').length, html.split('\n').length);
});

test('findings carry rule, file, line and a short excerpt', () => {
  const [f] = scanText('a\nb\nserver at 10.0.0.5 here', {}, 'notes.md');
  assert.equal(f.rule, 'private-infra');
  assert.equal(f.file, 'notes.md');
  assert.equal(f.line, 3);
  assert.ok(f.excerpt.length <= 80 && f.excerpt.includes('10.0.0.5'));
});

test('CLI: exit 1 with findings, 0 when clean, config honoured', () => {
  const dir = mkdtempSync(join(tmpdir(), 'scanpub-'));
  const clean = join(dir, 'clean.md');
  const dirty = join(dir, 'dirty.html');
  const cfg = join(dir, 'scan-publish.json');
  writeFileSync(clean, 'A plain finding with n=40 and a 95% interval.\n');
  writeFileSync(dirty, '<p>Built for Zebrafinch.</p>\n');
  writeFileSync(cfg, JSON.stringify({ privateNames: ['Zebrafinch'], allowedEmails: [], allowMoney: false }));
  const run = (...a) => spawnSync(process.execPath, [CLI, ...a], { encoding: 'utf8' });
  const ok = run('--config', cfg, clean);
  assert.equal(ok.status, 0, ok.stdout + ok.stderr);
  const bad = run('--config', cfg, dir);
  assert.equal(bad.status, 1, bad.stdout + bad.stderr);
  assert.match(bad.stdout, /dirty\.html:1 \[private-name\]/);
  const noCfg = run(dirty);
  assert.equal(noCfg.status, 0, noCfg.stdout + noCfg.stderr);
  assert.equal(run('--config', join(dir, 'missing.json'), clean).status, 2);
});
