#!/usr/bin/env node
// scan-publish: a pre-publication scanner. MIT licensed, Node >= 18, no dependencies.
//
// It is gate (a) of the open-findings method: an automated check for things that must never
// reach a public page. A clean scan is NOT a fitness review; the second-model review and the
// named author's own approval still follow.
//
// Usage: node scan-publish.mjs [--config scan-publish.json] [--json] <file-or-folder>...
// Config (all optional): { "privateNames": ["..."], "allowedEmails": ["..."], "allowMoney": false }
// Exit codes: 0 clean, 1 findings, 2 usage or config error.
//
// Rule names: private-name, private-infra, token, email, dialog, money, personal-data.
// HTML files are reduced to visible text + meta content + JSON-LD before scanning; line numbers
// still refer to the original HTML source.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { resolve, join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const BS = String.fromCharCode(92);
// Build regexes from sources written with "<BS>" so the file stays readable and escape-safe.
const re = (src, flags = 'iu') => new RegExp(src.split('<BS>').join(BS), flags);

const INFRA = [
  re('<BS>b<BS>d{1,3}(?:<BS>.<BS>d{1,3}){3}<BS>b'), // IPv4
  re('<BS>b[a-z][<BS>w-]*(?:<BS>.[<BS>w-]+)*:<BS>d{4,5}(?![<BS>d.])'), // host:port
  re('<BS>b[<BS>w-]+<BS>.(?:local|internal|lan)<BS>b'), // private host suffixes
  re('(?:^|[<BS>s"\'(`])/(?:srv|www|home|etc|var|opt|root)/'), // server paths
  re('<BS>b[A-Za-z]:<BS><BS>', 'u'), // Windows drive path
];
const TOKEN = [
  re('<BS>bsk-[A-Za-z0-9_-]{16,}', 'u'),
  re('<BS>bgh[pousr]_[A-Za-z0-9]{30,}', 'u'),
  re('<BS>bgithub_pat_[A-Za-z0-9_]{20,}', 'u'),
  re('<BS>bAKIA[0-9A-Z]{16}<BS>b', 'u'),
  re('<BS>bxox[baprs]-[A-Za-z0-9-]{10,}', 'u'),
  re('<BS>bAIza[0-9A-Za-z_-]{30,}', 'u'),
  re('<BS>bBearer<BS>s+[A-Za-z0-9._-]{16,}', 'iu'),
  re('<BS>b(?:api[_-]?key|secret|token|password|passwd)<BS>s*[:=]<BS>s*["\']?[A-Za-z0-9._-]{8,}', 'iu'),
  re('<BS>beyJ[<BS>w-]{5,}<BS>.eyJ[<BS>w-]{5,}<BS>.[<BS>w-]{5,}', 'u'),
];
const EMAIL = re('[<BS>w.+-]+@[<BS>w-]+(?:<BS>.[<BS>w-]+)+', 'u');
const DIALOG = [
  re('<BS>[(?:user|assistant|system|human|claude|ai|bot)<BS>b[^<BS>]]*<BS>]'), // [assistant] / [User 12:01]
  re('^<BS>s*(?:[>*_#-]+<BS>s*)?(?:<BS>*<BS>*)?(?:user|assistant|human|claude|system)(?:<BS>*<BS>*)?<BS>s*:', 'imu'),
];
const TRANSCRIPT = re('<BS>btranscripts?<BS>b');
const NEGATOR = re("<BS>b(?:no|not|never|without|nor|neither|exclude[sd]?|excluding|don't|do not|doesn't)<BS>b");
const MONEY = re('(?:US<BS>$|<BS>$|USD<BS>s?|EUR<BS>s?|Rp<BS>.?<BS>s?|[€£])<BS>s?<BS>d');
const PERSONAL = [
  // international or national phone numbers (leading + or 0, then digit groups)
  re('(?<![<BS>w.])(?:<BS>+<BS>d{1,3}[<BS>s-]?<BS>(?<BS>d{1,4}<BS>)?|0<BS>d{1,3})[<BS>s.-]?<BS>d{3,4}[<BS>s.-]?<BS>d{3,5}(?!<BS>d)', 'u'),
  re('(?<!<BS>d)<BS>d{16}(?!<BS>d)', 'u'), // 16-digit ids
  re('(?<!<BS>d)(?:<BS>d{4}[<BS>s-]){3}<BS>d{4}(?!<BS>d)', 'u'), // grouped 16-digit numbers
];

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function excerptOf(line, index, length, mask) {
  const start = Math.max(0, index - 25);
  let out;
  if (mask) out = line.slice(start, index) + line.slice(index, index + 4) + '***';
  else out = line.slice(start, index + Math.min(length, 30));
  out = out.replace(/\s+/g, ' ').trim();
  return out.length > 80 ? out.slice(0, 80) : out;
}

/** Scan plain text. Returns [{ rule, file, line, excerpt }]. */
export function scanText(text, config = {}, file = '<input>') {
  const privateNames = (config.privateNames || []).filter(Boolean);
  const allowedEmails = (config.allowedEmails || []).map((e) => e.toLowerCase());
  const nameRes = privateNames.map((n) => new RegExp(`(?<![\\p{L}\\p{N}])${escapeRe(n)}(?![\\p{L}\\p{N}])`, 'giu'));
  const out = [];
  String(text).split(/\r?\n/).forEach((line, k) => {
    const add = (rule, m, mask = false) =>
      out.push({ rule, file, line: k + 1, excerpt: excerptOf(line, m.index ?? 0, (m[0] || '').length, mask) });
    const each = (rx, fn) => {
      const g = new RegExp(rx.source, rx.flags.includes('g') ? rx.flags : rx.flags + 'g');
      for (const m of line.matchAll(g)) fn(m);
    };
    for (const rx of nameRes) each(rx, (m) => add('private-name', m));
    for (const rx of INFRA) each(rx, (m) => add('private-infra', m));
    for (const rx of TOKEN) each(rx, (m) => add('token', m, true));
    each(EMAIL, (m) => { if (!allowedEmails.includes(m[0].toLowerCase())) add('email', m); });
    for (const rx of DIALOG) each(rx, (m) => add('dialog', m));
    each(TRANSCRIPT, (m) => {
      const before = line.slice(Math.max(0, m.index - 30), m.index);
      if (!NEGATOR.test(before)) add('dialog', m);
    });
    if (!config.allowMoney) each(MONEY, (m) => add('money', m));
    for (const rx of PERSONAL) each(rx, (m) => add('personal-data', m, true));
  });
  return out;
}

/** Reduce HTML to visible text + meta content + JSON-LD, keeping the source's line count. */
export function htmlToText(html) {
  const blank = (s) => s.replace(/[^\n]/g, ' ');
  let t = String(html);
  t = t.replace(/<!--[\s\S]*?-->/g, blank);
  t = t.replace(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi, (m, attrs, body) => {
    if (/type\s*=\s*["']?application\/ld\+json/i.test(attrs)) return ` ${body} `;
    return blank(m);
  });
  t = t.replace(/<style\b[\s\S]*?<\/style>/gi, blank);
  t = t.replace(/<svg\b[\s\S]*?<\/svg>/gi, blank);
  t = t.replace(/<meta\b[^>]*?\bcontent\s*=\s*(?:"([^"]*)"|'([^']*)')[^>]*>/gi, (m, a, b) => ` ${a ?? b} `);
  t = t.replace(/<[^>]+>/g, ' ');
  return t.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
}

export function scanHtml(html, config = {}, file = '<input>') {
  return scanText(htmlToText(html), config, file);
}

const EXTENSIONS = new Set(['.html', '.htm', '.md', '.markdown', '.txt', '.json', '.xml']);
const SKIP_DIRS = new Set(['node_modules', '.git']);

function collect(p, acc = []) {
  const st = statSync(p);
  if (st.isDirectory()) {
    for (const n of readdirSync(p)) if (!SKIP_DIRS.has(n)) collect(join(p, n), acc);
  } else if (EXTENSIONS.has(extname(p).toLowerCase())) acc.push(p);
  return acc;
}

export function scanFile(path, config = {}) {
  const raw = readFileSync(path, 'utf8');
  return /\.html?$/i.test(path) ? scanHtml(raw, config, path) : scanText(raw, config, path);
}

function main(argv) {
  let configPath = null;
  let asJson = false;
  const paths = [];
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--config') configPath = argv[++i];
    else if (argv[i] === '--json') asJson = true;
    else paths.push(argv[i]);
  }
  if (!paths.length) {
    console.error('usage: node scan-publish.mjs [--config scan-publish.json] [--json] <file-or-folder>...');
    return 2;
  }
  let config = {};
  if (configPath) {
    try {
      config = JSON.parse(readFileSync(configPath, 'utf8'));
    } catch (e) {
      console.error(`cannot read config ${configPath}: ${e.message}`);
      return 2;
    }
  }
  const findings = [];
  try {
    for (const p of paths) for (const f of collect(resolve(p))) findings.push(...scanFile(f, config));
  } catch (e) {
    console.error(`scan error: ${e.message}`);
    return 2;
  }
  if (asJson) console.log(JSON.stringify(findings, null, 2));
  else {
    for (const f of findings) console.log(`${f.file}:${f.line} [${f.rule}] ${f.excerpt}`);
    console.log(findings.length ? `scan-publish: ${findings.length} finding(s)` : 'scan-publish: clean');
  }
  return findings.length ? 1 : 0;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exit(main(process.argv.slice(2)));
}
