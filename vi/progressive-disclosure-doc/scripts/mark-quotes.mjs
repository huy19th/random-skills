#!/usr/bin/env node
// Gắn <mark id="q-…"> quanh các đoạn trích trong một bản lưu nguồn.
//
//   node mark-quotes.mjs <knowledge/sources/x.html> <quotes.json>
//
// quotes.json: { "q-1": "đoạn trích nguyên văn", "q-2": "..." }
// - So khớp nguyên văn, chỉ bỏ qua khác biệt về khoảng trắng và xuống dòng.
// - id đã có trong file → bỏ qua (chạy lại nhiều lần không sao).
// - Đoạn trích không tìm thấy → báo lỗi, exit 1. Không được sửa bản lưu nguồn cho khớp.
import fs from 'node:fs';

const [, , srcFile, quotesFile] = process.argv;
if (!srcFile || !quotesFile) {
  console.error('Cách dùng: node mark-quotes.mjs <source.html> <quotes.json>');
  process.exit(2);
}

let html = fs.readFileSync(srcFile, 'utf8');
const quotes = JSON.parse(fs.readFileSync(quotesFile, 'utf8'));

const escRe = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
// Một ký tự trong đoạn trích → các cách nó có thể xuất hiện trong HTML.
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

// Chỉ tìm trong phần nội dung, không tìm trong banner hay <head>.
const mainStart = Math.max(0, html.indexOf('<main>'));
let added = 0;
let skipped = 0;
const missing = [];
for (const [id, q] of Object.entries(quotes)) {
  if (!/^q-\d+$/.test(id)) { missing.push(`${id}: id phải có dạng q-<số>`); continue; }
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
console.log(`Đã gắn ${added} đoạn trích, bỏ qua ${skipped} đoạn đã có.`);
if (missing.length) {
  console.error(`\nKhông tìm thấy ${missing.length} đoạn trích (đoạn trích phải là nguyên văn, nằm trong một đoạn văn, không vắt qua định dạng như in đậm hay link):`);
  missing.forEach(m => console.error('  ' + m));
  process.exit(1);
}
