#!/usr/bin/env node
// Builds the knowledge notes.
//   node build.mjs <knowledge-dir>
// - Each subfolder with a content.html → generates a self-contained index.html (CSS/JS inlined) in the same folder.
// - Generates <knowledge-dir>/index.html: list of topics, with a search box.
// - Checks: source links, #q-… anchors, terms, bullets without a source, duplicate ids. Any error → exit 1.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
if (!process.argv[2]) {
  console.error('Usage: node build.mjs <knowledge-dir>');
  process.exit(2);
}
const root = path.resolve(process.argv[2]);
const tpl = name => fs.readFileSync(path.join(here, '..', 'assets', name), 'utf8');
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

// Reads the target file of a link. A link to a page's <dir>/index.html → reads content.html.
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

// Returns the content of the <li> elements that are direct children of <ul class="points">.
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
  if (!art) { err(contentFile, 'missing <article> tag'); return null; }
  const meta = {
    title: attr(art[1], 'data-title') || path.basename(dir),
    created: attr(art[1], 'data-created') || '',
    updated: attr(art[1], 'data-updated') || '',
  };
  let body = art[2];
  const isGlossary = path.basename(dir) === GLOSSARY_DIR;

  // duplicate ids
  const seen = new Set();
  for (const m of body.matchAll(/\bid="([^"]+)"/g)) {
    if (seen.has(m[1])) err(contentFile, `duplicate id: ${m[1]}`);
    seen.add(m[1]);
  }

  // Source list: the order in <section class="sources"> decides the [n] numbers.
  const sources = new Map();
  const srcSection = body.match(/<section class="sources"[\s\S]*?<\/section>/);
  if (srcSection) {
    for (const li of srcSection[0].matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/g)) {
      const a = li[1].match(/<a\b[^>]*href="([^"#]+)"[^>]*>([\s\S]*?)<\/a>/);
      if (a) sources.set(path.resolve(dir, a[1]), { n: sources.size + 1, title: text(a[2]) });
    }
  }

  // Attach data to keywords and source links, so tooltips work on file:// without fetching.
  body = body.replace(/<a\b([^>]*)>([\s\S]*?)<\/a>/g, (full, attrs, inner) => {
    const cls = attr(attrs, 'class') || '';
    const href = attr(attrs, 'href') || '';
    const [filePart, hash] = href.split('#');
    const file = filePart ? path.resolve(dir, filePart) : contentFile;

    if (/\bterm\b/.test(cls)) {
      const html = filePart ? readTarget(file) : raw;
      if (html == null) { err(contentFile, `term points to a missing file: ${href}`); return full; }
      const t = hash && findTerm(html, hash);
      if (!t) { err(contentFile, `term not defined: ${href}`); return full; }
      const shared = filePart && path.basename(path.dirname(file)) === GLOSSARY_DIR && !isGlossary;
      return `<a class="term${shared ? ' shared' : ''}" href="${escAttr(href)}" data-term="${escAttr(t.term)}" data-short="${escAttr(t.short)}">${inner}</a>`;
    }

    if (/\bsrc\b/.test(cls)) {
      const html = readTarget(file);
      if (html == null) { err(contentFile, `source does not exist: ${href}`); return full; }
      const q = hash && html.match(new RegExp(`<mark id="${hash}">([\\s\\S]*?)</mark>`));
      if (!q) { err(contentFile, `quote #${hash} not found in ${filePart}`); return full; }
      const s = sources.get(file);
      if (!s) { err(contentFile, `source not listed in the Sources section: ${filePart}`); return full; }
      return `<a class="src" href="${escAttr(href)}" data-title="${escAttr(s.title)}" data-quote="${escAttr(text(q[1]))}">[${s.n}]</a>`;
    }
    return full;
  });

  // Every L1 bullet must have a source or the [Inference] label.
  const hasSource = s => /class="src"/.test(s) || /class="inference"/.test(s);
  for (const li of topLevelPoints(body)) {
    const summary = li.match(/<summary>([\s\S]*?)<\/summary>/);
    const head = summary ? summary[1] : li;
    if (!hasSource(head)) err(contentFile, `bullet without a source: "${text(head).slice(0, 60)}…"`);
  }
  // Every term must have a source or the [Inference] label.
  for (const m of body.matchAll(/<dt[^>]*>([\s\S]*?)<\/dt>\s*<dd[^>]*>([\s\S]*?)<\/dd>/g)) {
    if (!hasSource(m[2])) err(contentFile, `term without a source: "${text(m[1])}"`);
  }

  const dates = [meta.created && `Created ${meta.created}`, meta.updated && `Updated ${meta.updated}`, sources.size && `${sources.size} source${sources.size > 1 ? 's' : ''}`].filter(Boolean).join(' · ');
  const header = `<span class="meta">${dates}</span>
    <span class="nav"><a href="../index.html">← All topics</a></span>
    <span class="mode-switch" title="Shortcut: m"><button data-mode="compact">Compact</button><button data-mode="detailed">Detailed</button></span>`;
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
    <div class="meta">Updated ${p.updated}</div>
    <p class="summary">${escAttr(p.tldr)}</p>
  </li>`).join('\n');
const indexBody = `<input class="search" type="search" placeholder="Search topics…" autofocus>
<ul class="topics">
${list}
</ul>`;
const indexHeader = glossary ? `<span class="nav"><a href="${GLOSSARY_DIR}/index.html">Shared glossary</a></span>` : '';
fs.writeFileSync(path.join(root, 'index.html'), fill(PAGE, { TITLE: 'Knowledge', HEADER: indexHeader, BODY: indexBody, CSS, JS }));

console.log(`Built ${pages.length} page(s) in ${root}`);
if (errors.length) {
  console.error(`\n${errors.length} error(s):`);
  errors.forEach(e => console.error('  ' + e));
  process.exit(1);
}
