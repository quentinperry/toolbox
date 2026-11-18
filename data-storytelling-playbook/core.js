/* Shared helpers for all chapters */
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = Charts.esc;

  const store = {
    get(k, d) {
      try { const v = localStorage.getItem('dsp:' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; }
    },
    set(k, v) {
      try { localStorage.setItem('dsp:' + k, JSON.stringify(v)); } catch (e) { /* storage unavailable */ }
    },
  };

  const money = (v, d = 1) => '$' + (+v).toFixed(d) + 'M';
  const pct = (v, d = 0) => (+v).toFixed(d) + '%';

  // ---------- HTML building blocks ----------
  const cmp = (bad, good) =>
    `<div class="compare">${bad ? `<div class="cmp bad"><span class="ic">✕</span><div>${bad}</div></div>` : ''}${good ? `<div class="cmp good"><span class="ic">✓</span><div>${good}</div></div>` : ''}</div>`;

  const widget = (title, body, foot = '') =>
    `<div class="widget"><div class="widget-head"><span class="try">Try it</span><h3>${title}</h3></div><div class="widget-body">${body}</div>${foot ? `<div class="widget-foot">${foot}</div>` : ''}</div>`;

  const section = (id, num, title, body) =>
    `<section class="block" id="${id}"><span class="sec-num">${num}</span><h2>${title}</h2>${body}</section>`;

  const seg = (name, options, value) =>
    `<div class="seg" role="group" data-seg="${name}">${options
      .map(([v, l]) => `<button type="button" data-v="${esc(v)}" aria-pressed="${String(v) === String(value)}">${l}</button>`)
      .join('')}</div>`;

  // Persisted checklist. items: [text | {t, sub}]
  const checklist = (key, items) =>
    `<ul class="checklist" data-check="${key}">${items
      .map((it, i) => {
        const t = typeof it === 'string' ? it : it.t;
        const sub = typeof it === 'string' ? '' : `<span class="sub">${it.sub}</span>`;
        return `<li><label><input type="checkbox" data-i="${i}"><span>${t}${sub}</span></label></li>`;
      })
      .join('')}</ul>`;

  function bindChecklists(root) {
    $$('[data-check]', root).forEach((ul) => {
      const key = 'check:' + ul.dataset.check;
      const state = store.get(key, {});
      $$('input', ul).forEach((cb) => {
        cb.checked = !!state[cb.dataset.i];
        cb.addEventListener('change', () => {
          const fresh = {};
          $$('input', ul).forEach((x) => (fresh[x.dataset.i] = x.checked));
          store.set(key, fresh);
          ul.dispatchEvent(new CustomEvent('checkchange', { bubbles: true }));
        });
      });
    });
  }

  // Segmented control binder: calls onChange(name, value)
  function bindSeg(root, onChange) {
    $$('[data-seg]', root).forEach((g) => {
      g.addEventListener('click', (e) => {
        const b = e.target.closest('button');
        if (!b) return;
        $$('button', g).forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
        onChange(g.dataset.seg, b.dataset.v);
      });
    });
  }
  function setSeg(root, name, value) {
    const g = $(`[data-seg="${name}"]`, root);
    if (g) $$('button', g).forEach((x) => x.setAttribute('aria-pressed', String(x.dataset.v === String(value))));
  }

  // ---------- Tooltip ----------
  const tip = () => $('#tip');
  let tipTarget = null;
  function place(e) {
    const t = tip();
    const pad = 14, w = t.offsetWidth, h = t.offsetHeight;
    let x = e.clientX + pad, y = e.clientY + pad;
    if (x + w > innerWidth - 8) x = e.clientX - w - pad;
    if (y + h > innerHeight - 8) y = e.clientY - h - pad;
    t.style.left = Math.max(8, x) + 'px';
    t.style.top = Math.max(8, y) + 'px';
  }
  document.addEventListener('pointerover', (e) => {
    const el = e.target.closest && e.target.closest('[data-tip]');
    if (!el) return;
    tipTarget = el;
    tip().innerHTML = el.getAttribute('data-tip');
    tip().classList.add('on');
    place(e);
  });
  document.addEventListener('pointermove', (e) => { if (tipTarget) place(e); });
  document.addEventListener('pointerout', (e) => {
    const el = e.target.closest && e.target.closest('[data-tip]');
    if (el && el === tipTarget && !el.contains(e.relatedTarget)) {
      tipTarget = null;
      tip().classList.remove('on');
    }
  });
  document.addEventListener('scroll', () => { tipTarget = null; tip().classList.remove('on'); }, { passive: true });

  window.DSP = { $, $$, esc, store, money, pct, cmp, widget, section, seg, checklist, bindChecklists, bindSeg, setSeg, chapters: [] };
})();
