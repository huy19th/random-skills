#!/usr/bin/env node
// Lưu một nguồn thành file HTML trong knowledge/sources/.
//
//   node make-source.mjs --out <file.html> --title <tiêu đề> --url <URL gốc> [--lang en] [--saved YYYY-MM-DD] <đầu vào>
//
// Đầu vào (chọn 1):
//   --page <file.html>   Trang web đã tải về. Lấy nội dung chính, bỏ script, menu, header, footer...
//   --html <file.html>   Đoạn HTML đã sạch, dùng nguyên văn làm nội dung.
//   --text <file.txt>    Văn bản thuần, ví dụ output của `pdftotext -layout`.
//                        Ký tự form feed (\f) được coi là ngắt trang → sinh anchor #page-<số>.
//   --vtt <file.vtt>     Phụ đề video. Mỗi đoạn ~30 giây có mốc thời gian link về video gốc.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const args = {};
for (let i = 2; i < process.argv.length; i++) {
  const a = process.argv[i];
  if (a.startsWith('--')) args[a.slice(2)] = process.argv[++i];
}
const inputs = ['page', 'html', 'text', 'vtt'].filter(k => args[k]);
if (!args.out || !args.title || !args.url || inputs.length !== 1) {
  console.error('Cách dùng: node make-source.mjs --out <file.html> --title <tiêu đề> --url <URL gốc> [--lang en] [--saved YYYY-MM-DD] (--page|--html|--text|--vtt) <file>');
  process.exit(2);
}

const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const escAttr = s => esc(s).replace(/"/g, '&quot;');
const read = f => fs.readFileSync(f, 'utf8').replace(/^﻿/, '').replace(/\r\n?/g, '\n');

function fromPage(raw, baseUrl) {
  let h = raw.replace(/<!--[\s\S]*?-->/g, '');
  const pick = h.match(/<article\b[\s\S]*<\/article>/i) || h.match(/<main\b[\s\S]*<\/main>/i) || h.match(/<body\b[^>]*>([\s\S]*)<\/body>/i);
  if (pick) h = pick[1] ?? pick[0];
  const drop = 'script|style|noscript|nav|header|footer|aside|form|iframe|svg|button|template|select|dialog';
  h = h.replace(new RegExp(`<(${drop})\\b[\\s\\S]*?<\\/\\1>`, 'gi'), '');
  h = h.replace(/<(img|input|link|meta|source|picture)\b[^>]*>/gi, '');
  // Chỉ giữ href và id; đổi link tương đối thành tuyệt đối.
  h = h.replace(/<([a-zA-Z][\w-]*)(\s[^>]*)?>/g, (m, tag, attrs = '') => {
    const keep = [];
    const href = attrs.match(/\shref\s*=\s*"([^"]*)"/i) || attrs.match(/\shref\s*=\s*'([^']*)'/i);
    const id = attrs.match(/\sid\s*=\s*"([^"]*)"/i);
    if (href && tag.toLowerCase() === 'a') {
      let url = href[1];
      try { url = new URL(url, baseUrl).href; } catch (e) {}
      keep.push(`href="${escAttr(url)}"`);
    }
    if (id && !/^(q-\d+|page-\d+|t-\d+)$/.test(id[1])) keep.push(`id="${escAttr(id[1])}"`);
    return `<${tag}${keep.length ? ' ' + keep.join(' ') : ''}>`;
  });
  h = h.replace(/<(div|span|section)>\s*<\/\1>/gi, '').replace(/\n\s*\n+/g, '\n');
  return h.trim();
}

function fromText(raw) {
  const pages = raw.split('\f');
  if (pages.length > 1 && !pages[pages.length - 1].trim()) pages.pop();
  if (pages.length === 1) return `<pre>${esc(raw)}</pre>`;
  return pages.map((p, i) => `<span class="page" id="page-${i + 1}">Trang ${i + 1}</span>\n<pre>${esc(p)}</pre>`).join('\n');
}

function timeLink(url, sec) {
  if (/youtube\.com|youtu\.be/.test(url)) {
    const u = new URL(url);
    u.searchParams.set('t', String(sec));
    return u.href;
  }
  return `${url.split('#')[0]}#t=${sec}`;
}

function fromVtt(raw, url) {
  const toSec = t => {
    const p = t.trim().split(':').map(Number);
    return Math.floor(p.length === 3 ? p[0] * 3600 + p[1] * 60 + p[2] : p[0] * 60 + p[1]);
  };
  const fmt = s => {
    const h = Math.floor(s / 3600);
    const m = String(Math.floor((s % 3600) / 60)).padStart(2, '0');
    const ss = String(s % 60).padStart(2, '0');
    return h ? `${h}:${m}:${ss}` : `${m}:${ss}`;
  };
  const cues = [];
  for (const block of raw.split(/\n\s*\n/)) {
    const lines = block.split('\n');
    const i = lines.findIndex(l => l.includes('-->'));
    if (i < 0) continue;
    const start = toSec(lines[i].split('-->')[0]);
    for (const l of lines.slice(i + 1)) {
      const t = l.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim();
      if (t) cues.push({ start, text: t });
    }
  }
  // Phụ đề tự động lặp lại vài dòng ngay trước → bỏ dòng trùng với 3 dòng gần nhất.
  const lines = [];
  for (const c of cues) {
    if (!lines.slice(-3).some(l => l.text === c.text)) lines.push(c);
  }
  const paras = [];
  for (const c of lines) {
    const last = paras[paras.length - 1];
    if (last && c.start - last.start < 30) last.text.push(c.text);
    else paras.push({ start: c.start, text: [c.text] });
  }
  return paras.map(p => `<p><a class="ts" id="t-${p.start}" href="${escAttr(timeLink(url, p.start))}">[${fmt(p.start)}]</a>${esc(p.text.join(' '))}</p>`).join('\n');
}

const file = args[inputs[0]];
const raw = read(file);
const body = {
  page: () => fromPage(raw, args.url),
  html: () => raw.trim(),
  text: () => fromText(raw),
  vtt: () => fromVtt(raw, args.url),
}[inputs[0]]();

const saved = args.saved || new Date().toISOString().slice(0, 10);
const tpl = fs.readFileSync(path.join(here, '..', 'assets', 'source.html'), 'utf8');
const vars = { LANG: escAttr(args.lang || 'en'), TITLE: esc(args.title), URL: escAttr(args.url), SAVED: saved, BODY: body };
const out = tpl.replace(/\{\{(\w+)\}\}/g, (m, k) => (k in vars ? vars[k] : m));
fs.mkdirSync(path.dirname(path.resolve(args.out)), { recursive: true });
fs.writeFileSync(args.out, out);
console.log(`Đã lưu ${args.out} (${body.length} ký tự nội dung)`);
