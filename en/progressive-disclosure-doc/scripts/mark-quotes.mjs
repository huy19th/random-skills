#!/usr/bin/env node
// Wraps <mark id="q-…"> around quotes in a saved copy of a source.
//
//   node mark-quotes.mjs <knowledge/sources/x.html> <quotes.json>
//
// quotes.json: { "q-1": "verbatim quote", "q-2": "..." }
// - Matches verbatim, only ignoring differences in whitespace and line breaks.
// - An id already in the file → skipped (safe to re-run).
// - A quote not found → error, exit 1. Never edit the saved copy to make it match.
import fs from 'node:fs';

const [, , srcFile, quotesFile] = process.argv;
if (!srcFile || !quotesFile) {
  console.error('Usage: node mark-quotes.mjs <source.html> <quotes.json>');
  process.exit(2);
}

let html = fs.readFileSync(srcFile, 'utf8');
const quotes = JSON.parse(fs.readFileSync(quotesFile, 'utf8'));

const escRe = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
// One character in the quote → the ways it can appear in the HTML.
const charRe = ch => ({
  '&': '&(?:amp;)?',
  '<': '&lt;',
  '>': '&gt;',
  '"': '(?:"|&quot;|&#34;|“|”)',
  "'": "(?:'|&#39;|&apos;|‘|’)",
  '“': '(?:"|&quot;|“)',
  '”': '(?:"|&quot;|”)',
  '‘': "(?:'|&#39;|‘)",
  '’': "(?:'|&#39;|’)",
}[ch] || escRe(ch));
const quoteRe = q => q.trim().split(/\s+/).map(w => [...w].map(charRe).join('')).join('\\s+');

// Only search the content, not the banner or <head>.
const mainStart = Math.max(0, html.indexOf('<main>'));
let added = 0;
let skipped = 0;
const missing = [];
for (const [id, q] of Object.entries(quotes)) {
  if (!/^q-\d+$/.test(id)) { missing.push(`${id}: id must have the form q-<number>`); continue; }
  if (html.includes(`id="${id}"`)) { skipped++; continue; }
  const re = new RegExp(quoteRe(q));
  const body = html.slice(mainStart);
  const m = body.match(re);
  if (!m) { missing.push(`${id}: "${q.slice(0, 70)}${q.length > 70 ? '…' : ''}"`); continue; }
  const at = mainStart + m.index;
  html = html.slice(0, at) + `<mark id="${id}">${m[0]}</mark>` + html.slice(at + m[0].length);
  added++;
}
fs.writeFileSync(srcFile, html);
console.log(`Marked ${added} quote(s), skipped ${skipped} already marked.`);
if (missing.length) {
  console.error(`\n${missing.length} quote(s) not found (a quote must be verbatim, within one paragraph, not spanning formatting such as bold or links):`);
  missing.forEach(m => console.error('  ' + m));
  process.exit(1);
}
