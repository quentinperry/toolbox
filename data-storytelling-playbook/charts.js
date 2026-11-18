/* Tiny SVG chart kit: no dependencies.
   Every chart returns an SVG string; marks carry data-tip for the shared tooltip. */
(function () {
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const lin = (d0, d1, r0, r1) => (v) => r0 + ((v - d0) * (r1 - r0)) / (d1 - d0 || 1);
  const f1 = (n) => (+n).toFixed(1);

  function niceTicks(min, max, count = 4) {
    const span = max - min || 1;
    const raw = span / count;
    const mag = Math.pow(10, Math.floor(Math.log10(raw)));
    const norm = raw / mag;
    const step = (norm < 1.5 ? 1 : norm < 3 ? 2 : norm < 7 ? 5 : 10) * mag;
    const out = [];
    for (let v = Math.ceil(min / step - 1e-9) * step; v <= max + 1e-9; v += step) out.push(+v.toFixed(10));
    return out;
  }

  // Bar path with rounded "data end" (top for vertical, right for horizontal)
  function vbar(x, y, w, h, r = 4) {
    if (h <= 0) return '';
    r = Math.min(r, w / 2, h);
    return `M${f1(x)},${f1(y + h)}V${f1(y + r)}Q${f1(x)},${f1(y)} ${f1(x + r)},${f1(y)}H${f1(x + w - r)}Q${f1(x + w)},${f1(y)} ${f1(x + w)},${f1(y + r)}V${f1(y + h)}Z`;
  }
  function hbar(x, y, w, h, r = 4) {
    if (w <= 0) return '';
    r = Math.min(r, h / 2, w);
    return `M${f1(x)},${f1(y)}H${f1(x + w - r)}Q${f1(x + w)},${f1(y)} ${f1(x + w)},${f1(y + r)}V${f1(y + h - r)}Q${f1(x + w)},${f1(y + h)} ${f1(x + w - r)},${f1(y + h)}H${f1(x)}Z`;
  }

  // Push labels apart vertically so they never overlap
  function spread(items, gap = 14, min = -Infinity, max = Infinity) {
    const s = items.slice().sort((a, b) => a.y - b.y);
    for (let i = 1; i < s.length; i++) if (s[i].y - s[i - 1].y < gap) s[i].y = s[i - 1].y + gap;
    const over = s.length ? s[s.length - 1].y - max : 0;
    if (over > 0) s.forEach((it) => (it.y -= over));
    for (let i = 0; i < s.length; i++) if (s[i].y < min) s[i].y = min;
    return items;
  }

  /* ---------- Line chart ---------- */
  function line(o) {
    const W = o.w || 640, H = o.h || 300;
    const m = Object.assign({ t: 18, r: o.direct ? 118 : 20, b: 34, l: 50 }, o.margin || {});
    const n = o.x.length;
    const all = o.series.flatMap((s) => s.values).concat((o.refLines || []).map((r) => r.y));
    const yMin = o.yMin ?? Math.min(...all), yMax = o.yMax ?? Math.max(...all);
    const X = (i) => m.l + (n === 1 ? 0 : (i * (W - m.l - m.r)) / (n - 1));
    const Y = lin(yMin, yMax, H - m.b, m.t);
    const fmt = o.fmt || ((v) => v);
    let s = `<svg viewBox="0 0 ${W} ${H}" class="chart" role="img" aria-label="${esc(o.aria || 'Line chart')}">`;
    (o.bands || []).forEach((b) => {
      s += `<rect x="${f1(X(b.from))}" y="${m.t}" width="${f1(X(b.to) - X(b.from))}" height="${H - m.b - m.t}" class="band"/>`;
      if (b.label) s += `<text x="${f1((X(b.from) + X(b.to)) / 2)}" y="${m.t + 12}" class="ann" text-anchor="middle">${esc(b.label)}</text>`;
    });
    niceTicks(yMin, yMax, o.ticks || 4).forEach((t) => {
      if (o.grid !== false) s += `<line x1="${m.l}" x2="${W - m.r}" y1="${f1(Y(t))}" y2="${f1(Y(t))}" class="${o.grid === 'heavy' ? 'grid-heavy' : 'grid'}"/>`;
      s += `<text x="${m.l - 8}" y="${f1(Y(t))}" class="tick" text-anchor="end" dominant-baseline="middle">${esc(fmt(t))}</text>`;
    });
    s += `<line x1="${m.l}" x2="${W - m.r}" y1="${H - m.b}" y2="${H - m.b}" class="axis"/>`;
    o.x.forEach((l, i) => {
      if (o.xEvery && i % o.xEvery && i !== n - 1) return;
      s += `<text x="${f1(X(i))}" y="${H - m.b + 20}" class="tick" text-anchor="middle">${esc(l)}</text>`;
    });
    (o.refLines || []).forEach((r) => {
      s += `<line x1="${m.l}" x2="${W - m.r}" y1="${f1(Y(r.y))}" y2="${f1(Y(r.y))}" class="ref"/>`;
      if (r.label) s += `<text x="${W - m.r - 4}" y="${f1(Y(r.y) - 6)}" class="ann" text-anchor="end">${esc(r.label)}</text>`;
    });
    (o.vlines || []).forEach((v) => {
      s += `<line x1="${f1(X(v.at))}" x2="${f1(X(v.at))}" y1="${m.t}" y2="${H - m.b}" class="ref"/>`;
      if (v.label) s += `<text x="${f1(X(v.at) + 6)}" y="${m.t + 12}" class="ann">${esc(v.label)}</text>`;
    });
    const order = o.series.map((se, i) => i).sort((a, b) => (o.series[a].top ? 1 : 0) - (o.series[b].top ? 1 : 0));
    order.forEach((i) => {
      const se = o.series[i];
      const d = se.values.map((v, k) => `${k ? 'L' : 'M'}${f1(X(k))},${f1(Y(v))}`).join('');
      s += `<path d="${d}" fill="none" stroke="${se.color}" stroke-width="${se.width || 2}" stroke-linejoin="round" stroke-linecap="round"${se.dash ? ` stroke-dasharray="${se.dash}"` : ''}/>`;
      if (se.dots) se.values.forEach((v, k) => (s += `<circle cx="${f1(X(k))}" cy="${f1(Y(v))}" r="4" fill="${se.color}" stroke="var(--surface)" stroke-width="2"/>`));
      if (se.endDot) s += `<circle cx="${f1(X(n - 1))}" cy="${f1(Y(se.values[n - 1]))}" r="4.5" fill="${se.color}" stroke="var(--surface)" stroke-width="2"/>`;
    });
    if (o.direct) {
      const labs = spread(o.series.map((se) => ({ se, y: Y(se.values[n - 1]) })), 14, m.t, H - m.b);
      labs.forEach(({ se, y }) => {
        s += `<text x="${f1(X(n - 1) + 9)}" y="${f1(y)}" class="dlabel${se.top ? ' strong' : ''}" dominant-baseline="middle">${esc(se.name)}${o.directValues ? ` <tspan class="dval">${esc(fmt(se.values[n - 1]))}</tspan>` : ''}</text>`;
      });
    }
    (o.annotations || []).forEach((a) => {
      const ax = X(a.i), ay = Y(a.v);
      const tx = ax + (a.dx ?? -10), ty = ay + (a.dy ?? -28);
      s += `<line x1="${f1(ax)}" y1="${f1(ay - 6)}" x2="${f1(tx)}" y2="${f1(ty + 4)}" class="ann-line"/>`;
      s += `<text x="${f1(tx)}" y="${f1(ty)}" class="ann strong" text-anchor="${a.anchor || 'end'}">${esc(a.text)}</text>`;
    });
    if (o.legend) {
      const lw = 132, lh = 10 + o.series.length * 16;
      const lx = W - m.r - lw - 4, ly = m.t + 2;
      s += `<g class="legend-box"><rect x="${lx}" y="${ly}" width="${lw}" height="${lh}" rx="2"/>`;
      o.series.forEach((se, i) => {
        s += `<line x1="${lx + 8}" x2="${lx + 24}" y1="${ly + 13 + i * 16}" y2="${ly + 13 + i * 16}" stroke="${se.color}" stroke-width="3"/>`;
        s += `<text x="${lx + 30}" y="${ly + 13 + i * 16}" class="tick legend-t" dominant-baseline="middle">${esc(se.name)}</text>`;
      });
      s += `</g>`;
    }
    // hover columns (crosshair + tooltip)
    const cw = n > 1 ? (W - m.l - m.r) / (n - 1) : 40;
    for (let k = 0; k < n; k++) {
      const rows = o.series
        .map((se) => ({ se, v: se.values[k] }))
        .sort((a, b) => b.v - a.v)
        .map(({ se, v }) => `<div class="tip-row"><i style="background:${se.color}"></i>${esc(se.name)}<b>${esc(fmt(v))}</b></div>`)
        .join('');
      const tip = `<div class="tip-h">${esc(o.x[k])}</div>${rows}`;
      s += `<g class="hcol"><line class="guide" x1="${f1(X(k))}" x2="${f1(X(k))}" y1="${m.t}" y2="${H - m.b}"/><rect x="${f1(X(k) - cw / 2)}" y="${m.t}" width="${f1(cw)}" height="${H - m.b - m.t}" fill="transparent" data-tip="${esc(tip)}"/></g>`;
    }
    return s + `</svg>`;
  }

  /* ---------- Vertical bar chart ---------- */
  function bar(o) {
    const W = o.w || 640, H = o.h || 300;
    const m = Object.assign({ t: 22, r: o.refLine ? 92 : 20, b: 34, l: 50 }, o.margin || {});
    const n = o.labels.length;
    const yMin = o.yMin ?? 0;
    const yMax = o.yMax ?? Math.max(...o.values, ...(o.refLine ? [o.refLine.y] : [])) * 1.1;
    const Y = lin(yMin, yMax, H - m.b, m.t);
    const band = (W - m.l - m.r) / n, bw = Math.min(band * (o.pad ?? 0.62), o.maxBar || 120);
    const fmt = o.fmt || ((v) => v);
    let s = `<svg viewBox="0 0 ${W} ${H}" class="chart" role="img" aria-label="${esc(o.aria || 'Bar chart')}">`;
    if (o.axis !== false)
      niceTicks(yMin, yMax, o.ticks || 4).forEach((t) => {
        if (o.grid !== false) s += `<line x1="${m.l}" x2="${W - m.r}" y1="${f1(Y(t))}" y2="${f1(Y(t))}" class="grid"/>`;
        s += `<text x="${m.l - 8}" y="${f1(Y(t))}" class="tick" text-anchor="end" dominant-baseline="middle">${esc(fmt(t))}</text>`;
      });
    o.values.forEach((v, i) => {
      const x = m.l + i * band + (band - bw) / 2;
      const top = Y(Math.max(v, yMin));
      const color = typeof o.colors === 'function' ? o.colors(i, v) : (o.colors || [])[i] || 'var(--accent)';
      const tip = o.tips ? o.tips[i] : `<div class="tip-h">${esc(o.labels[i])}</div><b>${esc(fmt(v))}</b>`;
      s += `<path d="${vbar(x, top, bw, H - m.b - top)}" fill="${color}" data-tip="${esc(tip)}" class="mark"/>`;
      if (o.valueLabels !== false) s += `<text x="${f1(x + bw / 2)}" y="${f1(top - 7)}" class="vlabel" text-anchor="middle">${esc(fmt(v))}</text>`;
      s += `<text x="${f1(x + bw / 2)}" y="${H - m.b + 20}" class="tick" text-anchor="middle">${esc(o.labels[i])}</text>`;
    });
    s += `<line x1="${m.l}" x2="${W - m.r}" y1="${H - m.b}" y2="${H - m.b}" class="axis"/>`;
    if (o.refLine) {
      s += `<line x1="${m.l}" x2="${W - m.r}" y1="${f1(Y(o.refLine.y))}" y2="${f1(Y(o.refLine.y))}" class="ref"/>`;
      s += `<text x="${W - m.r + 8}" y="${f1(Y(o.refLine.y))}" class="ann strong" dominant-baseline="middle">${esc(o.refLine.label || '')}</text>`;
    }
    return s + `</svg>`;
  }

  /* ---------- Horizontal bar chart ---------- */
  function hbars(o) {
    const W = o.w || 640;
    const rowH = o.rowH || 34;
    const m = Object.assign({ t: 8, r: 64, b: 8, l: o.labelW || 150 }, o.margin || {});
    const H = o.h || m.t + m.b + o.labels.length * rowH;
    const max = o.max ?? Math.max(...o.values) * 1.02;
    const X = lin(0, max, m.l, W - m.r);
    const fmt = o.fmt || ((v) => v);
    let s = `<svg viewBox="0 0 ${W} ${H}" class="chart" role="img" aria-label="${esc(o.aria || 'Bar chart')}">`;
    o.values.forEach((v, i) => {
      const y = m.t + i * rowH, bh = rowH * 0.58, by = y + (rowH - bh) / 2;
      const color = typeof o.colors === 'function' ? o.colors(i, v) : (o.colors || [])[i] || 'var(--accent)';
      const tip = o.tips ? o.tips[i] : `<div class="tip-h">${esc(o.labels[i])}</div><b>${esc(fmt(v))}</b>`;
      s += `<text x="${m.l - 10}" y="${f1(y + rowH / 2)}" class="tick ${o.strong && o.strong(i) ? 'strong-t' : ''}" text-anchor="end" dominant-baseline="middle">${esc(o.labels[i])}</text>`;
      s += `<path d="${hbar(m.l, by, X(Math.max(v, 0)) - m.l, bh)}" fill="${color}" class="mark" data-tip="${esc(tip)}"/>`;
      s += `<text x="${f1(X(Math.max(v, 0)) + 7)}" y="${f1(y + rowH / 2)}" class="vlabel" dominant-baseline="middle">${esc(fmt(v))}</text>`;
    });
    s += `<line x1="${m.l}" x2="${m.l}" y1="${m.t}" y2="${H - m.b}" class="axis"/>`;
    return s + `</svg>`;
  }

  /* ---------- Stacked bars ---------- */
  function stacked(o) {
    const W = o.w || 640, H = o.h || 300;
    const m = Object.assign({ t: 26, r: 120, b: 34, l: 50 }, o.margin || {});
    const n = o.labels.length;
    const totals = o.labels.map((_, i) => o.stacks.reduce((a, st) => a + st.values[i], 0));
    const yMax = o.yMax ?? Math.max(...totals) * 1.12;
    const Y = lin(0, yMax, H - m.b, m.t);
    const band = (W - m.l - m.r) / n, bw = Math.min(band * 0.5, 110);
    const fmt = o.fmt || ((v) => v);
    let s = `<svg viewBox="0 0 ${W} ${H}" class="chart" role="img" aria-label="${esc(o.aria || 'Stacked bar chart')}">`;
    niceTicks(0, yMax, 4).forEach((t) => {
      s += `<line x1="${m.l}" x2="${W - m.r}" y1="${f1(Y(t))}" y2="${f1(Y(t))}" class="grid"/><text x="${m.l - 8}" y="${f1(Y(t))}" class="tick" text-anchor="end" dominant-baseline="middle">${esc(fmt(t))}</text>`;
    });
    o.labels.forEach((l, i) => {
      const x = m.l + i * band + (band - bw) / 2;
      let acc = 0;
      o.stacks.forEach((st, k) => {
        const v = st.values[i];
        const y0 = Y(acc), y1 = Y(acc + v);
        const isTop = k === o.stacks.length - 1;
        const h = y0 - y1 - (k ? 2 : 0);
        const tip = `<div class="tip-h">${esc(l)} · ${esc(st.name)}</div><b>${esc(fmt(v))}</b>`;
        s += isTop
          ? `<path d="${vbar(x, y1, bw, h)}" fill="${st.color}" class="mark" data-tip="${esc(tip)}"/>`
          : `<rect x="${f1(x)}" y="${f1(y1)}" width="${f1(bw)}" height="${f1(Math.max(h, 0))}" fill="${st.color}" class="mark" data-tip="${esc(tip)}"/>`;
        if (i === n - 1) s += `<text x="${f1(x + bw + 10)}" y="${f1((y0 + y1) / 2)}" class="dlabel" dominant-baseline="middle">${esc(st.name)}</text>`;
        acc += v;
      });
      s += `<text x="${f1(x + bw / 2)}" y="${f1(Y(totals[i]) - 8)}" class="vlabel" text-anchor="middle">${esc(fmt(totals[i]))}</text>`;
      s += `<text x="${f1(x + bw / 2)}" y="${H - m.b + 20}" class="tick" text-anchor="middle">${esc(l)}</text>`;
    });
    s += `<line x1="${m.l}" x2="${W - m.r}" y1="${H - m.b}" y2="${H - m.b}" class="axis"/>`;
    if (o.note) s += `<text x="${W - m.r}" y="${m.t - 8}" class="ann strong" text-anchor="end">${esc(o.note)}</text>`;
    return s + `</svg>`;
  }

  /* ---------- Scatter with trend ---------- */
  function scatter(o) {
    const W = o.w || 640, H = o.h || 300;
    const m = Object.assign({ t: 18, r: 24, b: 44, l: 54 }, o.margin || {});
    const xs = o.points.map((p) => p[0]), ys = o.points.map((p) => p[1]);
    const xMin = o.xMin ?? Math.min(...xs), xMax = o.xMax ?? Math.max(...xs);
    const yMin = o.yMin ?? 0, yMax = o.yMax ?? Math.max(...ys) * 1.1;
    const X = lin(xMin, xMax, m.l, W - m.r), Y = lin(yMin, yMax, H - m.b, m.t);
    let s = `<svg viewBox="0 0 ${W} ${H}" class="chart" role="img" aria-label="${esc(o.aria || 'Scatter plot')}">`;
    niceTicks(yMin, yMax, 4).forEach((t) => (s += `<line x1="${m.l}" x2="${W - m.r}" y1="${f1(Y(t))}" y2="${f1(Y(t))}" class="grid"/><text x="${m.l - 8}" y="${f1(Y(t))}" class="tick" text-anchor="end" dominant-baseline="middle">${esc((o.yFmt || String)(t))}</text>`));
    niceTicks(xMin, xMax, 5).forEach((t) => (s += `<text x="${f1(X(t))}" y="${H - m.b + 18}" class="tick" text-anchor="middle">${esc(t)}</text>`));
    s += `<line x1="${m.l}" x2="${W - m.r}" y1="${H - m.b}" y2="${H - m.b}" class="axis"/>`;
    s += `<text x="${(m.l + W - m.r) / 2}" y="${H - 6}" class="tick" text-anchor="middle">${esc(o.xLabel || '')}</text>`;
    s += `<text x="14" y="${(m.t + H - m.b) / 2}" class="tick" text-anchor="middle" transform="rotate(-90 14 ${(m.t + H - m.b) / 2})">${esc(o.yLabel || '')}</text>`;
    o.points.forEach((p) => (s += `<circle cx="${f1(X(p[0]))}" cy="${f1(Y(p[1]))}" r="5" fill="var(--context)" stroke="var(--surface)" stroke-width="2" class="mark" data-tip="${esc(`${o.xLabel}: <b>${p[0]}</b><br>${o.yLabel}: <b>${p[1]}${o.ySuffix || ''}</b>`)}"/>`));
    if (o.trend) {
      const n = xs.length, mx = xs.reduce((a, b) => a + b) / n, my = ys.reduce((a, b) => a + b) / n;
      const k = xs.reduce((a, x, i) => a + (x - mx) * (ys[i] - my), 0) / xs.reduce((a, x) => a + (x - mx) ** 2, 0);
      const b = my - k * mx;
      s += `<line x1="${f1(X(xMin))}" y1="${f1(Y(k * xMin + b))}" x2="${f1(X(xMax))}" y2="${f1(Y(k * xMax + b))}" stroke="var(--accent)" stroke-width="2.5" stroke-linecap="round"/>`;
      if (o.trendLabel) {
        const up = k > 0; // put the label in the empty corner
        s += `<text x="${up ? m.l + 8 : W - m.r - 4}" y="${m.t + 12}" class="ann strong" text-anchor="${up ? 'start' : 'end'}">${esc(o.trendLabel)}</text>`;
      }
    }
    return s + `</svg>`;
  }

  /* ---------- Pie (for the anti-pattern demo only) ---------- */
  function pie(o) {
    const W = o.w || 640, H = o.h || 300, cx = o.cx || W / 2, cy = H / 2, r = Math.min(H / 2 - 16, 130);
    const tot = o.values.reduce((a, b) => a + b, 0);
    let a0 = -Math.PI / 2;
    let s = `<svg viewBox="0 0 ${W} ${H}" class="chart" role="img" aria-label="${esc(o.aria || 'Pie chart')}">`;
    o.values.forEach((v, i) => {
      const a1 = a0 + (v / tot) * Math.PI * 2;
      const large = a1 - a0 > Math.PI ? 1 : 0;
      const p = `M${cx},${cy}L${f1(cx + r * Math.cos(a0))},${f1(cy + r * Math.sin(a0))}A${r},${r} 0 ${large} 1 ${f1(cx + r * Math.cos(a1))},${f1(cy + r * Math.sin(a1))}Z`;
      const tip = o.hideValues ? `<div class="tip-h">${esc(o.labels[i])}</div><span class="muted">Hard to tell, right?</span>` : `<div class="tip-h">${esc(o.labels[i])}</div><b>${esc((o.fmt || String)(v))}</b>`;
      s += `<path d="${p}" fill="${o.colors[i]}" stroke="var(--surface)" stroke-width="2" class="mark" data-tip="${esc(tip)}"/>`;
      const am = (a0 + a1) / 2;
      if (o.labels) s += `<text x="${f1(cx + (r + 14) * Math.cos(am))}" y="${f1(cy + (r + 14) * Math.sin(am))}" class="tick" text-anchor="${Math.cos(am) > 0.1 ? 'start' : Math.cos(am) < -0.1 ? 'end' : 'middle'}" dominant-baseline="middle">${esc(o.labels[i])}</text>`;
      a0 = a1;
    });
    return s + `</svg>`;
  }

  window.Charts = { line, bar, hbars, stacked, scatter, pie, niceTicks, esc, vbar, hbar, lin, f1 };
})();
