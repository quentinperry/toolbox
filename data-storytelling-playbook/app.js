/* Router, navigation, home page, theme */
(function () {
  const { $, $$, store } = DSP;
  const CH = DSP.chapters.sort((a, b) => a.n - b.n);

  const DESCS = {
    ch0: 'Start here — especially if you have a presentation tomorrow.',
    ch1: 'Why smart analysts get ignored — and how to become trusted instead.',
    ch2: 'Turning data into insights people care about.',
    ch3: 'Making charts that communicate, not just display data.',
    ch4: 'Designing slides that guide the eye to what matters.',
    ch5: 'Delivering with authority and handling pushback like a pro.',
  };

  const visited = new Set(store.get('visited', []));

  function renderNav(active) {
    $('#nav').innerHTML = `
      <a href="#/" class="${active === 'home' ? 'active' : ''}"><span class="num">★</span><span>Overview</span></a>
      <div class="side-label">Chapters</div>
      ${CH.map((c) => `<a href="#/${c.slug}" class="${active === c.slug ? 'active' : ''} ${visited.has(c.slug) ? 'visited' : ''}"><span class="num">${c.n}</span><span>${c.short}</span></a>`).join('')}
      <div class="credit">An interactive companion to the Data Storytelling Playbook — a deep-dive largely based on the <a href="https://www.chartosaur.com/playbook" target="_blank" rel="noopener">Present With Data Playbook</a> by Chartosaur.</div>`;
    const n = CH.filter((c) => visited.has(c.slug)).length;
    $('#progressPill').textContent = `${n} / ${CH.length} chapters explored`;
  }

  function home() {
    return `<div class="page">
      <div class="hero">
        <div class="eyebrow">Data storytelling playbook</div>
        <h1>You’re smart. You know how to analyze data. But your insights keep getting ignored.</h1>
        <p class="lede">This playbook isn’t about making you a better analyst — you already know how to analyze. It’s about making you a better communicator, so your analysis actually matters. Every chapter has charts and tools you can play with.</p>
        <div class="btn-row"><a class="btn primary" href="#/ch0" style="text-decoration:none">Start here →</a><a class="btn" href="#/ch3/lab" style="text-decoration:none">Jump to the chart lab</a></div>
      </div>
      <div class="chapter-cards">
        ${CH.map((c) => `<a class="ch-card" href="#/${c.slug}"><span class="ch-n">Chapter ${c.n}</span><h3>${c.title}</h3><p>${DESCS[c.slug]}</p><span class="ch-foot"><span>${c.sections.length} sections</span><span>${visited.has(c.slug) ? '✓ Explored' : 'Open →'}</span></span></a>`).join('')}
      </div>
      <section class="block">
        <span class="sec-num">THE 80/20</span>
        <h2>If you only do five things</h2>
        <div class="eighty">
          ${[
            ['Lead with your recommendation', 'Not your methodology.', '#/ch2'],
            ['Make your exec summary stand alone', 'Situation → Complication → Resolution in 60 seconds.', '#/ch4/exec'],
            ['Remove hedging language', '“I recommend”, not “maybe we could consider”.', '#/ch5'],
            ['One chart = one message', 'If it needs a paragraph to explain, it’s wrong.', '#/ch3/lab'],
            ['Prepare for pushback', 'Acknowledge → Clarify → Address → Redirect.', '#/ch5/pushback'],
          ].map(([t, d, h], i) => `<a href="${h}"><span class="e-n">${i + 1}</span><span><span class="e-t">${t}</span><br><span class="e-d">${d}</span></span><span class="muted">→</span></a>`).join('')}
        </div>
      </section>
      <p class="small muted">Further reading: <a href="https://www.chartosaur.com/" target="_blank" rel="noopener">Chartosaur — Data storytelling made simple</a>.</p>
    </div>`;
  }

  function chapterPage(c) {
    const i = CH.indexOf(c), prev = CH[i - 1], next = CH[i + 1];
    return `<article class="page">
      <header class="chapter-head">
        <div class="eyebrow">Chapter ${c.n}</div>
        <h1>${c.title}</h1>
        <p class="lede" style="margin-bottom:0">${c.tagline}</p>
        <nav class="toc" aria-label="Sections">${c.sections.map(([id, l]) => `<a href="#/${c.slug}/${id}">${l}</a>`).join('')}</nav>
      </header>
      ${c.html()}
      <aside class="takeaways"><h2>Key takeaways</h2><ol>${c.takeaways.map((t) => `<li>${t}</li>`).join('')}</ol></aside>
      <nav class="pager" aria-label="Chapter navigation">
        ${prev ? `<a href="#/${prev.slug}"><span class="dir">← Previous</span>${prev.short}</a>` : `<a href="#/"><span class="dir">← Back</span>Overview</a>`}
        ${next ? `<a class="next" href="#/${next.slug}"><span class="dir">Next →</span>${next.short}</a>` : ''}
      </nav>
    </article>`;
  }

  let current = null;
  function route() {
    const parts = (location.hash.replace(/^#\/?/, '') || '').split('/');
    const slug = parts[0] || 'home';
    const anchor = parts[1];
    const c = CH.find((x) => x.slug === slug);
    const key = c ? c.slug : 'home';
    document.body.classList.remove('nav-open');
    $('#menuBtn').setAttribute('aria-expanded', 'false');

    if (current !== key) {
      const old = $('#main');
      old.dispatchEvent(new CustomEvent('dsp:unmount'));
      const fresh = old.cloneNode(false); // drop old listeners
      old.replaceWith(fresh);
      DSP.main = fresh;
      if (c) {
        fresh.innerHTML = chapterPage(c);
        c.mount(fresh);
        visited.add(c.slug);
        store.set('visited', [...visited]);
        document.title = `${c.short} · Data Storytelling Playbook`;
      } else {
        fresh.innerHTML = home();
        document.title = 'Data Storytelling Playbook';
      }
      current = key;
      renderNav(key);
      if (!anchor) window.scrollTo(0, 0);
    }
    if (anchor) {
      const el = document.getElementById(anchor);
      if (el) requestAnimationFrame(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }));
    }
  }

  // Theme
  const applyTheme = (t) => { if (t) document.documentElement.setAttribute('data-theme', t); else document.documentElement.removeAttribute('data-theme'); };
  applyTheme(store.get('theme', null));
  $('#themeBtn').addEventListener('click', () => {
    const dark = document.documentElement.getAttribute('data-theme') === 'dark' || (!document.documentElement.getAttribute('data-theme') && matchMedia('(prefers-color-scheme: dark)').matches);
    const t = dark ? 'light' : 'dark';
    applyTheme(t);
    store.set('theme', t);
  });
  $('#menuBtn').addEventListener('click', () => {
    const open = document.body.classList.toggle('nav-open');
    $('#menuBtn').setAttribute('aria-expanded', String(open));
  });

  window.addEventListener('hashchange', route);
  route();
})();
