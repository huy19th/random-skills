# Convention: how to write a note

## 1. Information levels

Each piece of knowledge has up to 4 levels, more detailed the deeper it goes:

| Level | Content | Where it is written | Compact | Detailed |
|---|---|---|---|---|
| L0 | TL;DR of the whole topic: 1–3 sentences | `<section class="tldr">` | Shown | Shown |
| L1 | Key point, short, contains keywords | `<summary>` or `<li>` | Shown | Shown |
| L2 | Detailed explanation, examples, consequences | `<div class="detail">` | Click to open | Open |
| L3 | Verbatim quote from the source | `<mark id="q-…">` in the saved copy of the source | Hover `[n]` | Hover `[n]` |

* A reader who only reads L0 + L1 must grasp the whole topic at the overview level.
* L2 only answers "why", "example", "consequence", "exception". Do not repeat L1 in a longer sentence.
* An L1 with nothing more to explain → write a plain `<li>`, not wrapped in `<details>`.

## 2. Style

* Write in English. Use the standard technical term as it is commonly written (`cache`, `request`, `freshness lifetime`).
* One point per bullet. An L1 is at most about 25 words.
* Each L1 makes sense on its own: no "it", "this" pointing back to the previous bullet.
* Write the knowledge directly; do not retell the source.
* Use numbers and concrete examples instead of vague words.
* Header names, directives, commands, code snippets → wrap in `<code>`.

| ❌ Wrong | ✅ Right |
|---|---|
| The article says that `no-cache` does not mean do not cache. | `no-cache` does **not** mean "do not cache": the response is still stored, but must be validated before every use. |
| It will expire after some time. | `max-age=N`: the response becomes stale after N seconds. |
| The cache can estimate the lifetime itself using some ratio. | When the server sets no lifetime, the cache may estimate one, typically 10% of the time since `Last-Modified`. |

## 3. Point groups and order

* Each `<section>` is a point group with an `<h2>`. Aim for 3–7 groups; 2–8 L1 bullets per group.
* Group order: foundational concepts → mechanisms → usage / configuration → caveats, common mistakes.
* Bullet order within a group: most important point first.

## 4. Keywords and terms

* Only mark as keyword a term the reader may not know, or one with a specific meaning in the topic. Do not mark common words.
* Link a keyword at its first occurrence in the TL;DR and its first occurrence in each `<section>`. Later occurrences are plain text, not linked.
* Where to define it:
  * Term used only in this topic → the topic's glossary: `href="#term-<id>"`.
  * Term used in 2 or more topics → the shared glossary: `href="../glossary/index.html#term-<id>"`.
  * Do not link to another topic's glossary.
  * Term is in topic A's glossary and topic B also needs it → move the definition to the shared glossary, fix the links in A.
  * Before defining a new term, check whether the shared glossary already has it.
* `<p class="short">`: exactly 1 sentence, does not start by repeating the term's name.
* Detailed explanation: what the short definition does not say, examples, how it differs from easily confused terms.

| ❌ Wrong | ✅ Right |
|---|---|
| `<p class="short">Fresh is the fresh state of a response.</p>` | `<p class="short">A response still within its lifetime: used right away without asking the origin server again.</p>` |

## 5. Sources and quotes

* Every L1 and every term must have at least 1 source link `<a class="src" …></a>`, or the label `<span class="inference">Inference</span>`. The build reports an error if missing.
* An L2 with a point taken from the source also gets a source link; a point you derived yourself gets the Inference label.
* Quotes (L3):
  * Verbatim, copied from the saved copy of the source. Do not translate, do not change words, do not join 2 separate passages.
  * Short: 1–2 sentences, enough to prove the point. Do not quote a whole long paragraph.
  * Within one paragraph, not spanning formatting (bold, links).
  * No quote can be found to prove the point → the point is an Inference, or drop it.
* Quote ids: `q-1`, `q-2`… increasing within each source file. Do not renumber existing ids, because other topics may link to them.
* The Inference label is used for: a point derived from several points in the source, general knowledge not in the source, an example you made up.
* Sources contradict each other → record both points with their sources, and add it to Open questions.

## 6. Open questions

* Record: points the source does not answer that the reader may wonder about; contradictions between sources; things outside the scope of the current sources.
* Do not record questions the source already answers.

## 7. Naming

| Item | Rule | Example |
|---|---|---|
| Topic folder | kebab-case, lowercase, ASCII only | `http-caching` |
| Source file | kebab-case, short, recognizable | `rfc9111.html`, `mdn-http-caching.html`, `youtube-dQw4w9WgXcQ.html` |
| Term id | `term-` + kebab-case of the term, ASCII only | `term-freshness-lifetime` |
| Quote id | `q-` + number | `q-12` |
