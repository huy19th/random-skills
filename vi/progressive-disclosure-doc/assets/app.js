(() => {
  // ---------- View mode: compact / detailed ----------
  const KEY = 'kn:' + location.pathname;
  let state = {};
  try { state = JSON.parse(localStorage.getItem(KEY) || '{}'); } catch (e) {}
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {} };

  const details = [...document.querySelectorAll('main ul.points details')];
  details.forEach((d, i) => { d.dataset.k = d.id || 'd' + i; });
  const buttons = [...document.querySelectorAll('.mode-switch button')];

  function setMode(mode) {
    state.mode = mode;
    document.body.dataset.mode = mode;
    buttons.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.mode === mode)));
    if (mode === 'detailed') {
      details.forEach(d => { d.open = true; });
    } else {
      const open = new Set(state.open || []);
      details.forEach(d => { d.open = open.has(d.dataset.k); });
    }
    save();
  }

  // Compact mode remembers which bullets the user expanded.
  details.forEach(d => d.addEventListener('toggle', () => {
    if (state.mode === 'detailed') return;
    state.open = details.filter(x => x.open).map(x => x.dataset.k);
    save();
  }));
  buttons.forEach(b => b.addEventListener('click', () => setMode(b.dataset.mode)));
  document.addEventListener('keydown', e => {
    if (e.target.closest('input, textarea') || e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key === 'm') setMode(state.mode === 'detailed' ? 'compact' : 'detailed');
    if (e.key === 'Escape') hide();
  });
  if (!details.length) document.querySelectorAll('.mode-switch').forEach(s => { s.hidden = true; });
  else if (buttons.length) setMode(state.mode || 'compact');

  // ---------- Tooltip for keywords and sources ----------
  const tip = document.createElement('div');
  tip.id = 'tip';
  tip.hidden = true;
  tip.setAttribute('role', 'tooltip');
  document.body.append(tip);

  let current = null;
  let showTimer = 0;
  let hideTimer = 0;
  let lastPointer = 'mouse';

  const el = (tag, cls, text) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text) n.textContent = text;
    return n;
  };

  function fill(a) {
    tip.replaceChildren();
    if (a.classList.contains('term')) {
      const title = el('div', 'tip-title', a.dataset.term || a.textContent);
      if (a.classList.contains('shared')) title.append(el('span', 'tip-scope', 'Thuật ngữ chung'));
      tip.append(title, el('p', '', a.dataset.short));
      const link = el('a', 'tip-link', 'Xem chi tiết →');
      link.href = a.href;
      tip.append(link);
    } else {
      tip.append(el('div', 'tip-title', a.dataset.title));
      tip.append(el('blockquote', '', a.dataset.quote));
      const link = el('a', 'tip-link', 'Mở đoạn này trong nguồn →');
      link.href = a.href;
      tip.append(link);
    }
  }

  function place(a) {
    const r = a.getBoundingClientRect();
    tip.style.left = '0px';
    tip.style.top = '0px';
    const w = tip.offsetWidth;
    const h = tip.offsetHeight;
    let left = r.left + window.scrollX;
    left = Math.min(left, window.scrollX + document.documentElement.clientWidth - w - 8);
    left = Math.max(left, window.scrollX + 8);
    let top = r.bottom + window.scrollY + 6;
    if (r.bottom + h + 12 > window.innerHeight && r.top > h + 12) top = r.top + window.scrollY - h - 6;
    tip.style.left = left + 'px';
    tip.style.top = top + 'px';
  }

  function show(a) {
    clearTimeout(hideTimer);
    current = a;
    fill(a);
    tip.hidden = false;
    place(a);
  }
  function hide() {
    clearTimeout(showTimer);
    tip.hidden = true;
    current = null;
  }
  const scheduleHide = () => { clearTimeout(hideTimer); hideTimer = setTimeout(hide, 200); };

  const target = e => e.target.closest && e.target.closest('a.term, a.src');

  document.addEventListener('pointerdown', e => { lastPointer = e.pointerType; }, true);

  document.addEventListener('mouseover', e => {
    if (lastPointer === 'touch') return;
    const a = target(e);
    if (a) {
      clearTimeout(hideTimer);
      clearTimeout(showTimer);
      showTimer = setTimeout(() => show(a), 120);
    } else if (tip.contains(e.target)) {
      clearTimeout(hideTimer);
    }
  });
  document.addEventListener('mouseout', e => {
    if (target(e) || tip.contains(e.target)) {
      clearTimeout(showTimer);
      scheduleHide();
    }
  });
  document.addEventListener('focusin', e => { const a = target(e); if (a) show(a); });
  document.addEventListener('focusout', e => { if (target(e)) scheduleHide(); });

  // Touch: first tap shows the tooltip, the link inside it navigates.
  document.addEventListener('click', e => {
    const a = target(e);
    if (a && lastPointer === 'touch' && current !== a) {
      e.preventDefault();
      show(a);
      return;
    }
    if (!a && !tip.contains(e.target)) hide();
  });
  window.addEventListener('resize', () => { if (current) place(current); });

  // ---------- Search on the index page ----------
  const search = document.querySelector('.search');
  if (search) {
    const items = [...document.querySelectorAll('.topics li')];
    search.addEventListener('input', () => {
      const q = search.value.trim().toLowerCase();
      items.forEach(li => { li.hidden = q && !li.dataset.text.includes(q); });
    });
  }
})();
