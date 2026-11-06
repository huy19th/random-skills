#!/usr/bin/env node
// Dựng các file tóm tắt kiến thức.
//   node build.mjs <knowledge-dir>
// - Mỗi thư mục con có content.html → sinh index.html (tự chứa CSS/JS) cùng thư mục.
// - Sinh <knowledge-dir>/index.html: danh sách chủ đề, có ô tìm kiếm.
// - Kiểm tra: link nguồn, anchor #q-…, thuật ngữ, bullet thiếu nguồn, id trùng. Có lỗi → exit 1.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(process.argv[2] || path.join(here, 'knowledge'));
const tpl = name => fs.readFileSync(path.join(here, 'template', name), 'utf8');
const PAGE = tpl('page.html');
const CSS = tpl('style.css');
const JS = tpl('app.js');
const GLOSSARY_DIR = 'glossary';

const errors = [];
const err = (file, msg) => errors.push(`${path.relative(root, file)}: ${msg}`);

const escAttr = s => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const decode = s => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&');
const text = html => decode(html.replace(/<[^>]+>/g, '')).replace(/\s+/g, ' ').trim();
const stripComments = html => html.replace(/<!--[\s\S]*?-->/g, '');
const attr = (tag, name) => (tag.match(new RegExp(`\\b${name}="([^"]*)"`)) || [])[1];
const fill = (s, vars) => s.replace(/\{\{(\w+)\}\}/g, (m, k) => (k in vars ? vars[k] : m));

// Đọc file đích của một link. Link đến <dir>/index.html của một trang → đọc content.html.
const cache = new Map();
function readTarget(file) {
  if (path.basename(file) === 'index.html') {
    const content = path.join(path.dirname(file), 'content.html');
    if (fs.existsSync(content)) file = content;
  }
  if (!cache.has(file)) cache.set(file, fs.existsSync(file) ? stripComments(fs.readFileSync(file, 'utf8')) : null);
  return cache.get(file);
}

function findTerm(html, id) {
  const re = new RegExp(`<dt[^>]*\\bid="${id}"[^>]*>([\\s\\S]*?)</dt>\\s*<dd[^>]*>\\s*<p class="short">([\\s\\S]*?)</p>`);
  const m = html.match(re);
  return m && { term: text(m[1]), short: text(m[2]) };
}

// Trả về nội dung các <li> là con trực tiếp của <ul class="points">.
function topLevelPoints(html) {
  const VOID = new Set(['br', 'img', 'hr', 'input', 'meta', 'link', 'wbr', 'source']);
  const tagRe = /<(\/?)([a-zA-Z][a-zA-Z0-9]*)\b[^>]*>/g;
  const stack = [];
  const out = [];
  let m;
  while ((m = tagRe.exec(html))) {
    const [full, close, raw] = m;
    const name = raw.toLowerCase();
    if (VOID.has(name)) continue;
    if (!close) {
      const parent = stack[stack.length - 1];
      stack.push({
        name,
        isPoints: name === 'ul' && /\bclass="[^"]*\bpoints\b/.test(full),
        isPoint: name === 'li' && !!parent && parent.isPoints,
        start: m.index + full.length,
      });
    } else {
      while (stack.length) {
        const e = stack.pop();
        if (e.name === name) { if (e.isPoint) out.push(html.slice(e.start, m.index)); break; }
      }
    }
  }
  return out;
}

function buildPage(dir) {
  const contentFile = path.join(dir, 'content.html');
  const raw = stripComments(fs.readFileSync(contentFile, 'utf8'));
  const art = raw.match(/<article\b([^>]*)>([\s\S]*)<\/article>/);
  if (!art) { err(contentFile, 'thiếu thẻ <article>'); return null; }
  const meta = {
    title: attr(art[1], 'data-title') || path.basename(dir),
    created: attr(art[1], 'data-created') || '',
    updated: attr(art[1], 'data-updated') || '',
  };
  let body = art[2];
  const isGlossary = path.basename(dir) === GLOSSARY_DIR;

  // id trùng
  const seen = new Set();
  for (const m of body.matchAll(/\bid="([^"]+)"/g)) {
    if (seen.has(m[1])) err(contentFile, `id trùng: ${m[1]}`);
    seen.add(m[1]);
  }

  // Danh sách nguồn: thứ tự trong <section class="sources"> quyết định số [n].
  const sources = new Map();
  const srcSection = body.match(/<section class="sources"[\s\S]*?<\/section>/);
  if (srcSection) {
    for (const li of srcSection[0].matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/g)) {
      const a = li[1].match(/<a\b[^>]*href="([^"#]+)"[^>]*>([\s\S]*?)<\/a>/);
      if (a) sources.set(path.resolve(dir, a[1]), { n: sources.size + 1, title: text(a[2]) });
    }
  }

  // Gắn dữ liệu cho keyword và link nguồn, để tooltip chạy được trên file:// mà không cần fetch.
  body = body.replace(/<a\b([^>]*)>([\s\S]*?)<\/a>/g, (full, attrs, inner) => {
    const cls = attr(attrs, 'class') || '';
    const href = attr(attrs, 'href') || '';
    const [filePart, hash] = href.split('#');
    const file = filePart ? path.resolve(dir, filePart) : contentFile;

    if (/\bterm\b/.test(cls)) {
      const html = filePart ? readTarget(file) : raw;
      if (html == null) { err(contentFile, `thuật ngữ trỏ đến file không tồn tại: ${href}`); return full; }
      const t = hash && findTerm(html, hash);
      if (!t) { err(contentFile, `thuật ngữ chưa được định nghĩa: ${href}`); return full; }
      const shared = filePart && path.basename(path.dirname(file)) === GLOSSARY_DIR && !isGlossary;
      return `<a class="term${shared ? ' shared' : ''}" href="${escAttr(href)}" data-term="${escAttr(t.term)}" data-short="${escAttr(t.short)}">${inner}</a>`;
    }

    if (/\bsrc\b/.test(cls)) {
      const html = readTarget(file);
      if (html == null) { err(contentFile, `nguồn không tồn tại: ${href}`); return full; }
      const q = hash && html.match(new RegExp(`<mark id="${hash}">([\\s\\S]*?)</mark>`));
      if (!q) { err(contentFile, `không tìm thấy đoạn trích #${hash} trong ${filePart}`); return full; }
      const s = sources.get(file);
      if (!s) { err(contentFile, `nguồn chưa có trong mục Nguồn: ${filePart}`); return full; }
      return `<a class="src" href="${escAttr(href)}" data-title="${escAttr(s.title)}" data-quote="${escAttr(text(q[1]))}">[${s.n}]</a>`;
    }
    return full;
  });

  // Mỗi bullet L1 phải có nguồn hoặc đánh dấu [Suy luận].
  const hasSource = s => /class="src"/.test(s) || /class="inference"/.test(s);
  for (const li of topLevelPoints(body)) {
    const summary = li.match(/<summary>([\s\S]*?)<\/summary>/);
    const head = summary ? summary[1] : li;
    if (!hasSource(head)) err(contentFile, `bullet thiếu nguồn: "${text(head).slice(0, 60)}…"`);
  }
  // Mỗi thuật ngữ phải có nguồn hoặc đánh dấu [Suy luận].
  for (const m of body.matchAll(/<dt[^>]*>([\s\S]*?)<\/dt>\s*<dd[^>]*>([\s\S]*?)<\/dd>/g)) {
    if (!hasSource(m[2])) err(contentFile, `thuật ngữ thiếu nguồn: "${text(m[1])}"`);
  }

  const dates = [meta.created && `Tạo ${meta.created}`, meta.updated && `Cập nhật ${meta.updated}`, sources.size && `${sources.size} nguồn`].filter(Boolean).join(' · ');
  const header = `<span class="meta">${dates}</span>
    <span class="nav"><a href="../index.html">← Tất cả chủ đề</a></span>
    <span class="mode-switch" title="Phím tắt: m"><button data-mode="compact">Compact</button><button data-mode="detailed">Detailed</button></span>`;
  fs.writeFileSync(path.join(dir, 'index.html'), fill(PAGE, { TITLE: escAttr(meta.title), HEADER: header, BODY: body, CSS, JS }));

  const tldr = body.match(/<section class="tldr"[^>]*>([\s\S]*?)<\/section>/);
  return { slug: path.basename(dir), ...meta, tldr: tldr ? text(tldr[1]) : '', isGlossary };
}

const pages = fs.readdirSync(root, { withFileTypes: true })
  .filter(d => d.isDirectory() && fs.existsSync(path.join(root, d.name, 'content.html')))
  .map(d => buildPage(path.join(root, d.name)))
  .filter(Boolean);

const topics = pages.filter(p => !p.isGlossary).sort((a, b) => b.updated.localeCompare(a.updated));
const glossary = pages.find(p => p.isGlossary);
const list = topics.map(p => `  <li data-text="${escAttr((p.title + ' ' + p.tldr).toLowerCase())}">
    <a class="title" href="${p.slug}/index.html">${escAttr(p.title)}</a>
    <div class="meta">Cập nhật ${p.updated}</div>
    <p class="summary">${escAttr(p.tldr)}</p>
  </li>`).join('\n');
const indexBody = `<input class="search" type="search" placeholder="Tìm chủ đề…" autofocus>
<ul class="topics">
${list}
</ul>`;
const indexHeader = glossary ? `<span class="nav"><a href="${GLOSSARY_DIR}/index.html">Thuật ngữ chung</a></span>` : '';
fs.writeFileSync(path.join(root, 'index.html'), fill(PAGE, { TITLE: 'Kiến thức', HEADER: indexHeader, BODY: indexBody, CSS, JS }));

console.log(`Đã dựng ${pages.length} trang trong ${root}`);
if (errors.length) {
  console.error(`\n${errors.length} lỗi:`);
  errors.forEach(e => console.error('  ' + e));
  process.exit(1);
}
