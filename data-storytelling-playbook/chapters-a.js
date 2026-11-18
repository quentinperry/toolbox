/* Chapters 0–2 */
(function () {
  const { $, $$, esc, store, money, cmp, widget, section, seg, checklist, bindChecklists, bindSeg } = DSP;
  const C = Charts;

  /* =====================================================================
     CHAPTER 0 — How to use this playbook
     ===================================================================== */
  const PATHS = [
    {
      key: 'tomorrow', label: 'I have a presentation tomorrow', best: 'You have a presentation coming up and need immediate help.', time: '2 hours',
      steps: [
        { t: 'Read Chapter 2 — Finding the “so what”', sub: 'Apply the Insight Ladder, write the “So what” formula, complete the stakeholder map.', min: 20, href: '#/ch2' },
        { t: 'Read 4.3 — Exec summary slide', sub: 'Rewrite your first slide as Situation → Complication → Resolution. Make sure it stands alone.', min: 15, href: '#/ch4/exec' },
        { t: 'Skim Chapter 3 — Making charts', sub: 'Audit your charts with the checklist. Fix the top 3 issues.', min: 15, href: '#/ch3/checklist' },
        { t: 'Read 5.1 & 5.3 — Language and pushback', sub: 'Remove hedging from key statements. Prepare responses to likely objections.', min: 20, href: '#/ch5' },
        { t: 'Practice your opening', sub: 'Rehearse the first 2 minutes without notes. Can you deliver the exec summary in 60 seconds?', min: 30, href: '#/ch5/drill' },
      ],
      result: 'Your presentation will be significantly stronger, even if you don’t have time to implement everything.',
    },
    {
      key: 'levelup', label: 'I want to level up', best: 'You want to systematically improve your communication skills.', time: '1 week · 1 hour a day',
      steps: [
        { t: 'Day 1 — Diagnosis', sub: 'Read “Why analysts get ignored”. Do the self-assessment. Name your biggest weakness: trust, hedging or visibility?', href: '#/ch1' },
        { t: 'Day 2 — Insight development', sub: 'Take your last 3 analyses through the Insight Ladder. Write the “So what” formula for each.', href: '#/ch2' },
        { t: 'Day 3 — Visualization', sub: 'Audit your last deck’s charts. Redo your worst chart using the principles.', href: '#/ch3' },
        { t: 'Day 4 — Design', sub: 'Apply the detox checklist to 5 slides. Run the squint test on each.', href: '#/ch4' },
        { t: 'Day 5 — Delivery', sub: 'Record yourself presenting. Count hedging words, confident statements and pauses.', href: '#/ch5' },
        { t: 'Day 6 — Integration', sub: 'Take one analysis from start to finish, apply every framework, present to a colleague.' },
        { t: 'Day 7 — Review', sub: 'Revisit where you struggled most. Create your personal pre-presentation checklist.' },
      ],
      result: 'You’ll have internalized the frameworks and built new habits.',
    },
    {
      key: 'jit', label: 'Just-in-time reference', best: 'You like to keep this playbook open while you work.', time: 'Ongoing',
      steps: [
        { t: 'Starting an analysis', sub: 'Business context and stakeholder mapping. Ask: “What decision will this inform?”', href: '#/ch2/context' },
        { t: 'Building charts', sub: 'Pick the right chart, avoid common mistakes, run the checklist before finalizing.', href: '#/ch3/picking' },
        { t: 'Designing slides', sub: 'Visual hierarchy, detox, squint test.', href: '#/ch4' },
        { t: 'Writing your exec summary', sub: 'Situation → Complication → Resolution template.', href: '#/ch4/exec' },
        { t: 'Before presenting', sub: 'Language of authority, pushback framework, prepared answers to likely objections.', href: '#/ch5' },
        { t: 'After presenting', sub: 'Reflect: what worked? What didn’t? Track your progress indicators.', href: '#/ch0/progress' },
      ],
      result: 'You’ll continuously improve with each presentation.',
    },
  ];

  const CONTEXTS = {
    startup: { label: 'Startup / fast-moving', emphasize: 'Speed over perfection (ship 80% solutions).', adjust: 'Shorter decks (5–10 slides max), more informal language.', focus: 'Action orientation — what can we ship this week?' },
    enterprise: { label: 'Large enterprise', emphasize: 'Stakeholder management and building credibility over time.', adjust: 'More formal language, more thorough documentation.', focus: 'Alignment across teams, managing up.' },
    technical: { label: 'Technical audience', emphasize: 'Methodology rigor — but still lead with the recommendation.', adjust: 'More technical detail is fine, in the appendix.', focus: 'Precision and reproducibility.' },
    exec: { label: 'Non-technical execs', emphasize: 'Simplicity (charts & slides) and business context.', adjust: 'Zero jargon, more analogies, simpler visuals.', focus: 'Business impact, not technical sophistication.' },
  };

  function pathChart(p) {
    if (p.key !== 'tomorrow') return '';
    const total = p.steps.reduce((a, s) => a + s.min, 0);
    const W = 640, H = 64, x0 = 0;
    let x = x0, svg = `<svg viewBox="0 0 ${W} ${H}" class="chart" role="img" aria-label="Time split of the 2-hour sprint">`;
    const maxI = p.steps.reduce((bi, s, i, a) => (s.min > a[bi].min ? i : bi), 0);
    p.steps.forEach((s, i) => {
      const w = (s.min / total) * W - 2;
      const fill = i === maxI ? 'var(--accent)' : 'var(--context)';
      svg += `<rect x="${C.f1(x)}" y="6" width="${C.f1(w)}" height="30" rx="4" fill="${fill}" class="mark" data-tip="${esc(`<div class="tip-h">${s.t}</div><b>${s.min} min</b>`)}"/>`;
      svg += `<text x="${C.f1(x + w / 2)}" y="54" class="tick" text-anchor="middle">${s.min}′</text>`;
      x += w + 2;
    });
    svg += `</svg>`;
    return `<p class="chart-title">Most of the sprint goes to rehearsing your opening</p><p class="chart-sub">Minutes per step · ${total} minutes of focused work</p>${svg}`;
  }

  const ch0 = {
    slug: 'ch0', n: 0, short: 'How to use this playbook',
    title: 'How to use this playbook',
    tagline: 'This isn’t a book to read once and forget. It’s a reference guide to come back to before every presentation.',
    sections: [['is', 'What it is'], ['path', 'Pick your path'], ['eighty', 'The 80/20'], ['progress', 'Measure progress'], ['context', 'Adapt it'], ['mistakes', 'Mistakes'], ['actions', 'First actions']],
    takeaways: [
      '<b>Pick a path</b> that matches your situation: a 2-hour sprint, a 1-week program, or a just-in-time reference.',
      '<b>The 80/20:</b> lead with the recommendation, a standalone exec summary, zero hedging, one chart = one message, prepare for pushback.',
      '<b>Measure progress</b> after each presentation, over 3 months, and over 6–12 months.',
      '<b>Adapt, don’t follow rigidly</b> — and never use communication to cover bad analysis.',
    ],
    html() {
      return `
      ${section('is', '01', 'What this playbook is (and isn’t)', `
        <div class="grid2">
          <div class="card"><h3>It is</h3><ul>
            <li>A <b>practical toolkit</b> for turning good analysis into compelling stories</li>
            <li>A <b>reference guide</b> to consult before presentations</li>
            <li><b>Focused on communication</b> skills that complement your analytical skills</li>
            <li>Built for <b>junior to mid-level analysts</b> who want more impact</li></ul></div>
          <div class="card"><h3>It isn’t</h3><ul>
            <li>A statistics or data-analysis tutorial — you already know how to analyze</li>
            <li>Theory or academic frameworks — everything here is battle-tested</li>
            <li>One-size-fits-all rules — adapt to your context</li>
            <li>A substitute for good analysis — communication can’t fix bad work</li></ul></div>
        </div>
        <p style="margin-top:16px"><b>Especially relevant if</b> your manager rewrites your slides, executives ask “so what should we do?” after you present, or less-skilled analysts get promoted because they “present well”.</p>`)}

      ${section('path', '02', 'Pick your path', `
        ${widget('Which situation are you in?', `
          <div class="controls">${seg('path', PATHS.map((p) => [p.key, p.label]), store.get('path', 'tomorrow'))}</div>
          <div id="pathPanel"></div>`)}`)}

      ${section('eighty', '03', 'The 80/20 of this playbook', `
        <p>If you only have time for a few things, these five give the biggest impact. Do them consistently and you’ll see immediate improvement.</p>
        <div class="eighty">
          ${[
            ['Lead with your recommendation', 'Stop starting with methodology. Use the “So what” formula on every analysis.', '#/ch2'],
            ['Make your exec summary stand alone', 'Situation → Complication → Resolution in 60 seconds. The most important slide in your deck.', '#/ch4/exec'],
            ['Remove hedging language', 'Replace “maybe we could consider” with “I recommend”. Count your hedges.', '#/ch5'],
            ['One chart = one message', 'If your chart needs a paragraph to explain, it’s wrong. Use the 5-second test.', '#/ch3'],
            ['Prepare for pushback', 'Acknowledge → Clarify → Address → Redirect. Pushback is engagement, not rejection.', '#/ch5/pushback'],
          ].map(([t, d, h], i) => `<a href="${h}"><span class="e-n">${i + 1}</span><span><span class="e-t">${t}</span><br><span class="e-d">${d}</span></span><span class="muted">→</span></a>`).join('')}
        </div>`)}

      ${section('progress', '04', 'How to measure your progress', `
        <div class="grid3">
          <div class="card"><h3>After each presentation</h3>${checklist('prog-now', [
            'I led with my recommendation, not methodology',
            'My exec summary slide could stand alone',
            'I used zero hedging language',
            'Nobody asked “so what should we do?”',
            'Questions were about my recommendation, not my methodology',
          ])}</div>
          <div class="card"><h3>Over 3 months</h3>${checklist('prog-3m', [
            'My manager stopped rewriting my slides',
            'Executives ask me directly for analysis',
            'My recommendations get implemented more often',
            'I get invited to more strategic meetings',
            'People reference “your analysis on X”',
          ])}</div>
          <div class="card"><h3>Over 6–12 months</h3>${checklist('prog-12m', [
            'I present to more senior audiences',
            'I’m asked to mentor junior analysts',
            'I’m invited to planning / strategy sessions',
            'I’m considered for promotion',
            'Other teams request my help',
          ])}</div>
        </div>
        <p class="small muted" style="margin-top:10px">Your ticks are saved in this browser only.</p>`)}

      ${section('context', '05', 'Adapt it to your context', `
        ${widget('Where do you present?', `
          <div class="controls">${seg('ctx', Object.entries(CONTEXTS).map(([k, v]) => [k, v.label]), 'startup')}</div>
          <div class="grid3" id="ctxPanel"></div>`)}`)}

      ${section('mistakes', '06', 'Mistakes when using this playbook', `
        ${[
          ['Trying to implement everything at once', 'You’ll overwhelm yourself and master nothing.', 'Pick 2–3 principles per presentation. Master those, then add more.'],
          ['Following the rules rigidly', 'Your audience cares about understanding you, not about rules.', 'These are principles, not laws. Adapt to your audience and context.'],
          ['Using this to fix bad analysis', 'No amount of great communication saves flawed work.', 'Do the work first.'],
          ['Reading once and never coming back', 'You’ll forget 80% within a week and slip back into old habits.', 'Consult it before every major presentation.'],
          ['Focusing only on slides, ignoring delivery', 'Perfect slides with shaky delivery still fail.', 'Practice both.'],
        ].map(([t, why, fix]) => `<details class="acc"><summary>${t}</summary><div class="acc-body"><p><b>Why:</b> ${why}</p><p style="margin:0"><b>Fix:</b> ${fix}</p></div></details>`).join('')}`)}

      ${section('actions', '07', 'Your first action items', `
        ${widget('Plan your next presentation', `
          <div class="grid2">
            <label class="field"><span>Date</span><input data-f="date" type="date"></label>
            <label class="field"><span>Audience</span><input data-f="audience" placeholder="e.g. CFO + Head of Sales"></label>
          </div>
          <label class="field"><span>Decision to be made</span><input data-f="decision" placeholder="e.g. Extend enterprise trials to 90 days?"></label>
          <label class="field"><span>Your goal</span><input data-f="goal" placeholder="e.g. Reduce hedging language to zero"></label>
          <div class="grid2">
            <label class="field"><span>Who will give you feedback?</span><input data-f="feedback"></label>
            <label class="field"><span>When will you review progress?</span><input data-f="review"></label>
          </div>`, 'Saved automatically in this browser. Then start with Chapter 1, or jump to what you need most.')}`)}
      `;
    },
    mount(root) {
      bindChecklists(root);
      const renderPath = (key) => {
        const p = PATHS.find((x) => x.key === key) || PATHS[0];
        $('#pathPanel', root).innerHTML = `
          <div class="kpis">
            <div class="kpi"><div class="k-label">Best if</div><div style="font-weight:600">${p.best}</div></div>
            <div class="kpi accent"><div class="k-label">Time</div><div class="k-value" style="font-size:1.3rem">${p.time}</div></div>
          </div>
          ${pathChart(p)}
          <div style="margin-top:12px">${checklist('path-' + p.key, p.steps.map((s) => ({ t: s.href ? `${s.t} <a href="${s.href}" class="small">open →</a>` : s.t, sub: s.sub })))}</div>
          <div class="callout" style="margin-top:12px"><b>Result:</b> ${p.result}</div>`;
        bindChecklists($('#pathPanel', root));
      };
      const renderCtx = (k) => {
        const c = CONTEXTS[k];
        $('#ctxPanel', root).innerHTML = [['Emphasize', c.emphasize], ['Adjust', c.adjust], ['Focus', c.focus]]
          .map(([h, t]) => `<div class="kpi"><div class="k-label">${h}</div><div>${t}</div></div>`).join('');
      };
      bindSeg(root, (name, v) => {
        if (name === 'path') { store.set('path', v); renderPath(v); }
        if (name === 'ctx') renderCtx(v);
      });
      renderPath(store.get('path', 'tomorrow'));
      renderCtx('startup');
      const form = store.get('actions', {});
      $$('[data-f]', root).forEach((inp) => {
        inp.value = form[inp.dataset.f] || '';
        inp.addEventListener('input', () => { form[inp.dataset.f] = inp.value; store.set('actions', form); });
      });
    },
  };

  /* =====================================================================
     CHAPTER 1 — Why analysts get ignored
     ===================================================================== */
  const TRUST_PRESETS = {
    brilliant: { label: 'The brilliant analyst', v: { C: 9, R: 7, I: 3, S: 7 } },
    advisor: { label: 'The trusted advisor', v: { C: 7, R: 8, I: 8, S: 3 } },
  };
  const LEVERS = [
    ['C', 'Credibility', 'Do you know what you’re talking about?'],
    ['R', 'Reliability', 'Do you deliver what you promise, when you promise it?'],
    ['I', 'Intimacy', 'Do you understand their world and speak their language?'],
    ['S', 'Self-orientation', 'Are you trying to help them, or prove how smart you are?'],
  ];
  const trustScore = (v) => (v.C * v.R * v.I) / v.S / 10;

  const CAVEATS = [
    'there are some data quality issues in the European dataset',
    'we don’t have full visibility into competitor pricing',
    'the sample size for enterprise customers is small',
  ];
  const HEARS = [
    ['A clear call. Let’s discuss how.', 100],
    ['Probably a yes… with some doubts.', 62],
    ['They wouldn’t stake their name on this.', 34],
    ['“I don’t actually recommend expanding to Germany.”', 10],
  ];

  const ch1 = {
    slug: 'ch1', n: 1, short: 'Why analysts get ignored',
    title: 'Why analysts get ignored',
    tagline: 'The uncomfortable truth: your analysis might be perfect, but if nobody listens, it doesn’t matter.',
    sections: [['smart', 'Smart ≠ trusted'], ['trust', 'Trust equation'], ['dilemma', 'The analyst’s dilemma'], ['frame', 'Reduce uncertainty'], ['promo', 'Promotions'], ['self1', 'Self-assessment']],
    takeaways: [
      '<b>Smart ≠ Trusted:</b> technical skills get you in the room. Business judgment keeps you there.',
      '<b>Reduce uncertainty, don’t eliminate it:</b> executives need recommendations, not research papers.',
      '<b>Impact without visibility doesn’t count:</b> your work needs to be seen by people who matter.',
      '<b>Promotions go to people who ship</b> — not people who perfect.',
      '<b>Make your stakeholders successful:</b> when they win, you win.',
    ],
    html() {
      return `
      ${section('smart', '01', 'Why smart ≠ trusted', `
        <p>Executives don’t hire analysts to be right. They hire them to <b>reduce uncertainty so they can make decisions</b>. Technical brilliance that doesn’t translate into business judgment makes you a tool they use, not an advisor they trust.</p>
        <h3>The curse of expertise</h3>
        <p>When you explain methodology, confidence intervals and limitations before getting to the point, you think you’re being thorough. They think you’re stalling.</p>
        ${cmp('“I ran a regression analysis with 95% confidence intervals, controlling for seasonality and…”', '“Customer acquisition costs are up 40% because paid social is getting more expensive. I recommend shifting budget to referral channels.”')}
        <p class="muted">The second analyst gets invited back.</p>`)}

      ${section('trust', '02', 'The trust equation', `
        <p style="font-size:1.15rem"><b>Trust = (Credibility × Reliability × Intimacy) ÷ Self-orientation</b></p>
        <p>Most analysts max out credibility but tank on intimacy and self-orientation. They optimize for “being right” instead of “being useful”.</p>
        ${widget('Tune your trust profile', `
          <div class="btn-row" style="margin-bottom:14px">${Object.entries(TRUST_PRESETS).map(([k, p]) => `<button class="chip" data-preset="${k}">${p.label}</button>`).join('')}</div>
          <div class="grid2">
            <div>
              ${LEVERS.map(([k, n, d]) => `<div class="range-row" title="${esc(d)}"><label for="tr${k}">${n}</label><input type="range" id="tr${k}" min="1" max="10" step="1" data-lever="${k}"><output id="out${k}"></output></div><div class="small muted" style="margin:-4px 0 8px">${d}</div>`).join('')}
            </div>
            <div>
              <div class="kpis"><div class="kpi accent"><div class="k-label">Trust index (0–100)</div><div class="k-value" id="trustVal"></div><div class="k-sub" id="trustSub"></div></div></div>
              <p class="chart-title" id="levTitle"></p>
              <p class="chart-sub">Gain in trust index from improving each lever by 2 points</p>
              <div id="levChart"></div>
            </div>
          </div>`, 'Because the equation multiplies, your <b>weakest</b> lever moves trust the most — which is usually intimacy or self-orientation, not more technical rigor.')}
        <h3>Pattern recognition beats statistical significance</h3>
        <p>When your analysis contradicts an executive’s gut, they trust their experience. Your job isn’t to prove them wrong. It’s to either <b>validate their intuition with data</b> (making them confident to act) or <b>show them a pattern they haven’t seen yet</b> (expanding their mental model). The analyst who predicted nine of the last three recessions might be rigorous — but executives remember the false alarms more than the methodology.</p>`)}

      ${section('dilemma', '03', 'The analyst’s dilemma', `
        <p>You’re stuck between the <b>world of data</b> (nuanced, uncertain, full of caveats) and the <b>world of decisions</b> (binary, time-constrained, demanding clarity). Every hedge — “potentially”, “might”, “could” — is technically correct, and every hedge signals <i>“I don’t want to be blamed if this goes wrong.”</i></p>
        ${widget('Stack the caveats, watch the conviction drain', `
          <p class="ctl-label">Add the caveats the analyst wants to mention</p>
          <div class="chip-row" id="cavChips">${CAVEATS.map((c, i) => `<button class="chip" data-cav="${i}" aria-pressed="false">+ ${c}</button>`).join('')}</div>
          <div class="say" id="cavSay" style="margin-top:16px"></div>
          <div class="grid2">
            <div><span class="ctl-label">Perceived conviction</span><div class="meter"><i id="cavMeter"></i></div><p class="small muted" id="cavPct" style="margin-top:4px"></p></div>
            <div><span class="ctl-label">What the exec hears</span><p id="cavHears" style="font-weight:650;margin:0"></p></div>
          </div>
          <div class="btn-row" style="margin-top:14px"><button class="btn primary" id="cavBetter">Show the better approach</button></div>
          <div class="reveal" id="cavBetterOut" style="margin-top:14px">${cmp('', '“I recommend we expand to Germany. The data shows strong demand signals and favorable unit economics. The main risk is competitor pricing — I don’t have full visibility there yet. I can have that analysis by Friday if it’s a blocker.”')}<p class="small muted">The limitation is acknowledged — once, with a plan — without undermining the recommendation.</p></div>
        `)}`)}

      ${section('frame', '04', 'Your job: reduce uncertainty, not eliminate it', `
        <p>Executives don’t expect perfection. They expect you to tell them what you know, what you don’t, what you recommend anyway — and to quantify the risk.</p>
        ${widget('Build your recommendation', `
          <div class="grid2">
            <label class="field"><span>Based on (what I know)</span><input data-rf="known" value="customer feedback and churn analysis"></label>
            <label class="field"><span>I recommend (action)</span><input data-rf="action" value="we drop the premium tier"></label>
            <label class="field"><span>Confidence: <b id="rfConfOut"></b></span><input type="range" data-rf="conf" min="50" max="95" step="5" value="80"></label>
            <label class="field"><span>Main risk</span><input data-rf="risk" value="losing the 5% of power users who use those features"></label>
          </div>
          <label class="field"><span>If we’re wrong, the downside is</span><input data-rf="down" value="about $200K annual revenue — vs. $400K a year spent supporting features 95% of customers don’t use"></label>
          <div class="sentence-out" id="rfOut"></div>`, 'Clear recommendation. Quantified confidence. Named risk. Showed you did the math.')}`)}

      ${section('promo', '05', 'Why promotions aren’t always merit-based', `
        <p>You built a model that saved $2M. You documented it beautifully. Nobody else knows about it. Six months later, someone gets promoted for a “good enough” analysis the CEO saw in a board deck. <b>Impact without visibility is just a hobby.</b></p>
        <div class="grid2">
          <div class="card"><h3>What gets analysts promoted</h3><ol>
            <li><b>They made stakeholders look good</b> — their manager could confidently present their work</li>
            <li><b>They shipped, not perfected</b> — 80% solutions quickly</li>
            <li><b>They solved urgent problems</b>, not just interesting ones</li>
            <li><b>They communicated up and across</b></li></ol></div>
          <div class="card"><h3>What’s not on the list</h3><ul>
            <li>Most technically sophisticated analysis</li><li>Cleanest code</li><li>Best documentation</li></ul>
            <p class="small muted" style="margin:0">They matter — but they’re table stakes, not differentiators.</p></div>
        </div>
        <div class="quote" style="margin-top:18px">“Would I trust this person to present to the CEO? To handle an ambiguous project? To represent our team in a room full of executives?”</div>
        <h3>Make your manager’s job easy</h3>
        <ol class="steps">
          <li><div><b>Before analysis</b><br>“Here’s what I’m working on and why it matters to [business goal].”</div></li>
          <li><div><b>During analysis</b><br>“Here’s what I’m finding — any concerns before I finalize?”</div></li>
          <li><div><b>After analysis</b><br>“Here’s the deck. Slide 3 is the key message. I anticipate pushback on X — here’s how I’d respond.”</div></li>
        </ol>`)}

      ${section('self1', '06', 'Self-assessment', `
        ${widget('Be honest', checklist('self1', [
          'In my last presentation, I led with my recommendation (not my methodology)',
          'I can name the top 3 priorities of my key stakeholder right now',
          'My manager could describe my work to the CEO in 30 seconds',
          'Last month I said “I recommend…” more often than “the data suggests…”',
        ]) + `<p class="small muted" id="self1Out" style="margin:10px 0 0"></p>`)}`)}
      `;
    },
    mount(root) {
      bindChecklists(root);
      // --- trust equation
      const v = store.get('trust', { ...TRUST_PRESETS.brilliant.v });
      const renderTrust = () => {
        LEVERS.forEach(([k]) => { $('#tr' + k, root).value = v[k]; $('#out' + k, root).textContent = v[k]; });
        const s = trustScore(v);
        $('#trustVal', root).textContent = s.toFixed(1);
        $('#trustSub', root).textContent = s >= 15 ? 'Trusted advisor territory' : s >= 6 ? 'Useful, not yet trusted' : 'A tool they use, not an advisor they trust';
        const gains = LEVERS.map(([k, n]) => {
          const nv = { ...v };
          if (k === 'S') nv.S = Math.max(1, v.S - 2); else nv[k] = Math.min(10, v[k] + 2);
          return { n: k === 'S' ? 'Self-orientation −2' : n + ' +2', g: trustScore(nv) - s };
        });
        const best = gains.reduce((bi, g, i, a) => (g.g > a[bi].g ? i : bi), 0);
        $('#levTitle', root).textContent = gains[best].g <= 0.05 ? 'You’re maxed out — keep it up' : `${gains[best].n.replace(/ [+−]2$/, '')} is your biggest lever`;
        $('#levChart', root).innerHTML = C.hbars({
          w: 420, labelW: 140, rowH: 36, labels: gains.map((g) => g.n), values: gains.map((g) => Math.max(0, +g.g.toFixed(1))),
          colors: (i) => (i === best ? 'var(--accent)' : 'var(--context)'), fmt: (x) => '+' + (+x).toFixed(1), strong: (i) => i === best,
        });
        store.set('trust', v);
      };
      $$('[data-lever]', root).forEach((r) => r.addEventListener('input', () => { v[r.dataset.lever] = +r.value; renderTrust(); }));
      $$('[data-preset]', root).forEach((b) => b.addEventListener('click', () => { Object.assign(v, TRUST_PRESETS[b.dataset.preset].v); renderTrust(); }));
      renderTrust();

      // --- caveat stacking
      const on = new Set();
      const renderCav = () => {
        const list = [...on].sort().map((i) => CAVEATS[i]);
        let text = '“Based on this analysis, I recommend we expand to Germany';
        if (list.length) text += ', <i>but</i> ' + list.join(', <i>and</i> ');
        if (list.length >= 2) text += ', <i>so</i> we should probably validate this with additional research before making a final decision';
        text += '.”';
        $('#cavSay', root).innerHTML = text;
        const [hears, conv] = HEARS[list.length];
        $('#cavHears', root).textContent = hears;
        const m = $('#cavMeter', root);
        m.style.width = conv + '%';
        m.style.background = conv < 40 ? 'var(--bad)' : 'var(--accent)';
        $('#cavPct', root).textContent = `${conv}% · ${list.length} caveat${list.length === 1 ? '' : 's'}`;
      };
      $$('[data-cav]', root).forEach((b) => b.addEventListener('click', () => {
        const i = +b.dataset.cav;
        on.has(i) ? on.delete(i) : on.add(i);
        b.setAttribute('aria-pressed', String(on.has(i)));
        renderCav();
      }));
      $('#cavBetter', root).addEventListener('click', () => $('#cavBetterOut', root).classList.toggle('on'));
      renderCav();

      // --- recommendation builder
      const rf = () => Object.fromEntries($$('[data-rf]', root).map((i) => [i.dataset.rf, i.value]));
      const renderRf = () => {
        const f = rf();
        $('#rfConfOut', root).textContent = f.conf + '%';
        $('#rfOut', root).innerHTML = `“Based on <em>${esc(f.known)}</em>, I recommend <em>${esc(f.action)}</em>. I’m <em>${f.conf}% confident</em>. The main risk is <em>${esc(f.risk)}</em>. If we’re wrong, the downside is <em>${esc(f.down)}</em>.”`;
      };
      $$('[data-rf]', root).forEach((i) => i.addEventListener('input', renderRf));
      renderRf();

      // --- self assessment
      const self = () => {
        const n = $$('[data-check="self1"] input:checked', root).length;
        $('#self1Out', root).textContent = n === 4 ? 'Strong start — you’re already thinking like an advisor.' : `${4 - n} to work on. You’re not alone — that’s exactly what the rest of this playbook fixes.`;
      };
      root.addEventListener('checkchange', self);
      self();
    },
  };

  /* =====================================================================
     CHAPTER 2 — Finding the "so what?"
     ===================================================================== */
  // Enterprise sales cycle distribution: % of deals per 10-day bin, starting at day 20
  const CYCLE = [5, 10, 20, 25, 14, 10, 6, 4, 3, 2, 1];
  const CYCLE_START = 20;
  const ARR_PER_PCT = 0.067; // $M of ARR per 1% of deals
  const pctBeyond = (T) =>
    CYCLE.reduce((a, p, i) => {
      const x0 = CYCLE_START + i * 10, x1 = x0 + 10;
      if (T <= x0) return a + p;
      if (T >= x1) return a;
      return a + (p * (x1 - T)) / 10;
    }, 0);

  function cycleHist(T, opts = {}) {
    const W = 640, H = 270, m = { t: 30, r: 16, b: 40, l: 44 };
    const xMin = 20, xMax = 130;
    const X = C.lin(xMin, xMax, m.l, W - m.r), Y = C.lin(0, 28, H - m.b, m.t);
    let s = `<svg viewBox="0 0 ${W} ${H}" class="chart" role="img" aria-label="Histogram of enterprise sales cycle length with trial cutoff">`;
    [0, 10, 20].forEach((t) => (s += `<line x1="${m.l}" x2="${W - m.r}" y1="${Y(t)}" y2="${Y(t)}" class="grid"/><text x="${m.l - 8}" y="${Y(t)}" class="tick" text-anchor="end" dominant-baseline="middle">${t}%</text>`));
    CYCLE.forEach((p, i) => {
      const x0 = CYCLE_START + i * 10, x1 = x0 + 10;
      const px0 = X(x0) + 1, px1 = X(x1) - 1, top = Y(p);
      const expired = Math.max(0, Math.min(1, (x1 - T) / 10)); // share of bin beyond cutoff
      const tip = `<div class="tip-h">${x0}–${x1} days to close</div><b>${p}% of deals</b>${expired > 0 ? `<br><span class="muted">${expired === 1 ? 'Trial expires first' : 'Partly beyond the trial'}</span>` : ''}`;
      // clip-based split coloring
      const splitX = X(Math.max(x0, Math.min(x1, T)));
      const cid = 'cp' + Math.random().toString(36).slice(2, 8);
      s += `<defs><clipPath id="${cid}"><rect x="${C.f1(splitX)}" y="0" width="${W}" height="${H}"/></clipPath></defs>`;
      s += `<path d="${C.vbar(px0, top, px1 - px0, H - m.b - top)}" fill="var(--context)"/>`;
      if (expired > 0) s += `<path d="${C.vbar(px0, top, px1 - px0, H - m.b - top)}" fill="var(--accent)" clip-path="url(#${cid})"/>`;
      s += `<rect x="${px0}" y="${m.t}" width="${px1 - px0}" height="${H - m.b - m.t}" fill="transparent" data-tip="${esc(tip)}"/>`;
    });
    s += `<line x1="${m.l}" x2="${W - m.r}" y1="${H - m.b}" y2="${H - m.b}" class="axis"/>`;
    for (let d = 20; d <= 130; d += 20) s += `<text x="${X(d)}" y="${H - m.b + 18}" class="tick" text-anchor="middle">${d}</text>`;
    s += `<text x="${(m.l + W - m.r) / 2}" y="${H - 4}" class="tick" text-anchor="middle">Days from first contact to signed deal (enterprise)</text>`;
    const cx = X(T);
    s += `<line x1="${cx}" x2="${cx}" y1="${m.t - 8}" y2="${H - m.b}" stroke="var(--ink)" stroke-width="2"/>`;
    s += `<text x="${cx + (T > 105 ? -8 : 8)}" y="${m.t - 12}" class="ann strong" text-anchor="${T > 105 ? 'end' : 'start'}">Trial ends · day ${T}</text>`;
    if (opts.label !== false) s += `<text x="${W - m.r}" y="${m.t + 24}" class="ann" text-anchor="end">${pctBeyond(T).toFixed(0)}% of deals still open when the trial expires</text>`;
    return s + `</svg>`;
  }

  const LADDER = [
    { name: 'Data', sub: 'Facts without context', say: '“Sales decreased 15% in Q3.”', note: 'A number. True, but not useful — anyone with the dashboard could see it.' },
    { name: 'Information', sub: 'Facts with context', say: '“Sales decreased 15% in Q3, driven entirely by the enterprise segment. SMB and mid-market were flat.”', note: 'Better: you narrowed the problem. But you still haven’t explained <i>why</i> — or what to do.' },
    { name: 'Insight', sub: 'The “why” that wasn’t obvious', say: '“Enterprise sales decreased because our trial (60 days) is shorter than the enterprise sales cycle. Prospects are interested, but trials expire before deals close.”', note: 'This is an insight: a mechanism nobody could see on the dashboard.' },
    { name: 'Recommendation', sub: 'Specific, actionable next step', say: '', note: 'This is what executives pay you for: observation → action, with a quantified outcome.' },
  ];
  const Q = ['Q3 ’24', 'Q4 ’24', 'Q1 ’25', 'Q2 ’25', 'Q3 ’25'];
  const ENT = [4.0, 4.2, 4.1, 4.3, 2.76], SMB = [3.0, 3.05, 3.0, 3.0, 3.0], MID = [3.0, 2.95, 3.0, 3.0, 3.0];

  const SOWHAT_EX = {
    cac: { label: 'Customer acquisition', obs: 'Customer acquisition cost increased 40% quarter-over-quarter.', because: 'Paid social CPMs doubled while conversion rates remained flat. We’re paying more for the same traffic quality.', means: 'Our blended CAC ($450) now exceeds our target ($350), putting us above our payback period threshold.', should: 'Shift 30% of paid social budget ($150K/month) to referral and content channels where CAC is still below $300.', outcome: 'Reduce blended CAC by 15–20% within 90 days, bringing us back to the 18-month payback target.' },
    product: { label: 'Product usage', obs: 'Feature adoption for our new dashboard dropped from 60% to 35% after the redesign.', because: 'We moved the dashboard link from the main navigation to a settings submenu. Users can’t find it.', means: 'We invested $200K in a feature users want but can’t access — and it hurts our differentiation in sales calls.', should: 'Move the dashboard back to primary navigation and add an in-app tooltip for first-time users.', outcome: 'Restore adoption to 55%+ within 30 days, based on previous navigation patterns.' },
    claims: { label: 'Claims processing', obs: 'Claims processing time increased from 48 to 72 hours in Q3.', because: 'New fraud-detection rules route 40% more claims to manual review, but we didn’t add review capacity.', means: 'We’re missing SLA commitments, and customer satisfaction dropped 8 points.', should: 'Auto-approve low-risk claims (under €500, existing customers with a clean history) — 30% of the manual queue.', outcome: 'Back to 48–52 hours processing while keeping fraud detection above 95%.' },
    weak: { label: '❌ A weak one', obs: 'Sales are down.', because: '', means: 'This could impact our business.', should: 'We should explore options to improve this.', outcome: '' },
  };
  const SW_FIELDS = [['obs', 'Observation', 'What changed or what you found'], ['because', 'Because', 'Root cause or mechanism'], ['means', 'Which means', 'Business implication'], ['should', 'So we should', 'Specific action'], ['outcome', 'Expected outcome', 'Quantified impact if possible']];

  const STAKE = [
    { who: 'VP Sales', goals: 'Hit $10M ARR', cons: 'Only 3 AEs', cares: 'Deal velocity, win rate', ignores: 'LTV/CAC ratio', bad: '“Our LTV/CAC ratio improved to 3.2.”', good: '“Extending enterprise trials will lift win rate by ~10 points — that’s 4 more deals this quarter.”' },
    { who: 'CFO', goals: 'Control burn rate', cons: 'Board pressure', cares: 'Unit economics, runway', ignores: 'Feature requests', bad: '“Users are asking for 12 new dashboard features.”', good: '“CAC is $450, giving us an 18-month payback. Shifting $150K/month to referrals brings it back to target.”' },
    { who: 'Product Lead', goals: 'Ship v2.0 by Q4', cons: 'Engineering capacity', cares: 'User adoption, retention', ignores: 'Revenue (for now)', bad: '“This feature could add $400K of revenue.”', good: '“Adoption fell from 60% to 35% after the redesign — moving the link back restores it with zero engineering.”' },
  ];

  const ch2 = {
    slug: 'ch2', n: 2, short: 'Finding the “so what?”',
    title: 'Finding the “so what?”',
    tagline: 'The hardest skill in analytics: turning observations into insights that make people act.',
    sections: [['slide1', 'Slide #1'], ['ladder', 'Insight ladder'], ['formula', '“So what” formula'], ['context', 'Business context'], ['self2', 'Self-assessment']],
    takeaways: [
      '<b>Lead with the punchline:</b> your first slide answers “what should we do?”, not “what did I do?”',
      '<b>Climb the insight ladder:</b> Data → Information → Insight → Recommendation. Don’t stop at information.',
      '<b>Use the “So what” formula:</b> Observation → Because → Which means → So we should → Expected outcome.',
      '<b>Know your stakeholder’s world:</b> their goals, constraints and priorities right now.',
      '<b>Align to business context:</b> timing, strategy and business rhythms matter as much as your analysis.',
    ],
    html() {
      return `
      ${section('slide1', '01', 'Why most slides fail before slide #2', `
        <p>You have 30 seconds — maybe less — before an executive decides whether your presentation is worth their attention or something to endure while checking email.</p>
        ${widget('Data vomit vs. punchline', `
          <div class="controls">${seg('open', [['vomit', 'Opening A'], ['punch', 'Opening B']], 'vomit')}</div>
          <div id="openPanel"></div>`)}
        <h3>The journey vs. the destination</h3>
        <p>You spent two weeks on this. You want them to appreciate the rigor. <b>Resist.</b> They don’t need the journey — they need the destination. Put methodology in the appendix.</p>
        ${cmp('“First, I pulled data from three sources and cleaned it…”', '“Enterprise customers churn 3× faster than SMB. Here’s why and what we should do.”')}`)}

      ${section('ladder', '02', 'The insight ladder', `
        <p>Most analysts confuse data with insights. They’re not the same thing. Not even close. Climb the ladder and watch the chart — and the message — change.</p>
        ${widget('Climb the ladder', `
          <div class="ladder" id="ladderBtns">${LADDER.map((l, i) => `<button data-lv="${i}" aria-pressed="${i === 0}"><b>${i + 1}. ${l.name}</b>${l.sub}</button>`).join('')}</div>
          <div class="say" id="ladderSay"></div>
          <div id="ladderExtra"></div>
          <p class="chart-title" id="ladderTitle"></p><p class="chart-sub" id="ladderSub"></p>
          <div id="ladderChart"></div>
          <p class="small" id="ladderNote" style="margin:10px 0 0"></p>`)}
        <div class="grid2">
          ${cmp('<b>Reporting analyst:</b> “Churn is up 5%.”', '')}
          ${cmp('', '<b>Strategic analyst:</b> “Churn is up 5% because onboarding completion dropped when we redesigned the UI. Reverting the flow should recover most of it. I’ve drafted the A/B test plan.”')}
        </div>
        <p class="muted">One describes the world. The other changes it. If you struggle with level 3, dig deeper into the “why”. If you struggle with level 4, get comfortable making recommendations.</p>`)}

      ${section('formula', '03', 'The “so what” formula', `
        <p>Every insight should follow this five-part structure. It forces you to be specific, explain causation, connect to business impact, recommend action and quantify outcomes.</p>
        ${widget('Write — and stress-test — a “so what”', `
          <div class="controls"><div><span class="ctl-label">Load an example</span>${seg('swex', Object.entries(SOWHAT_EX).map(([k, v]) => [k, v.label]), 'cac')}</div></div>
          <div class="grid2">
            <div>${SW_FIELDS.map(([k, n, h]) => `<label class="field"><span>${n}</span><textarea rows="2" data-sw="${k}" placeholder="${h}"></textarea></label>`).join('')}</div>
            <div><span class="ctl-label">Formula check</span><ul class="status-list" id="swChecks"></ul>
              <div class="kpis" style="margin-top:16px"><div class="kpi accent"><div class="k-label">Strength</div><div class="k-value" id="swScore"></div></div></div></div>
          </div>`)}`)}

      ${section('context', '04', 'Understanding business context', `
        <p>Before you start any analysis, answer: <b>“What decision will this inform, and who will make it?”</b> If you can’t, stop — go ask, propose a decision and confirm they care, or don’t do it (it’s a science project).</p>
        ${cmp('“I’m going to analyze customer behavior patterns to see what we find.”', '“I’m analyzing why enterprise trials convert 20% lower than SMB trials. This will inform whether we change trial length, onboarding flow, or sales engagement.”')}
        ${widget('Stakeholder mapping: same analysis, different pitch', `
          <div class="controls">${seg('stake', STAKE.map((s, i) => [i, s.who]), 0)}</div>
          <div id="stakePanel"></div>
          <div class="table-scroll" style="margin-top:16px"><table class="simple"><thead><tr><th>Stakeholder</th><th>Goals</th><th>Constraints</th><th>Cares about</th><th>Ignores</th></tr></thead><tbody>
            ${STAKE.map((s) => `<tr><td><b>${s.who}</b></td><td>${s.goals}</td><td>${s.cons}</td><td>${s.cares}</td><td class="muted">${s.ignores}</td></tr>`).join('')}
          </tbody></table></div>`)}
        <div class="grid2">
          <div class="card"><h3>Know your stakeholder</h3><ol><li>What are their top 3 KPIs?</li><li>What did they commit to their boss this quarter?</li><li>What’s the biggest risk to their goals?</li><li>What decision are they trying to make right now?</li></ol></div>
          <div class="card"><h3>Know the business</h3><ol><li>Growth mode or efficiency mode?</li><li>What’s coming up? Board, planning, renewals?</li><li>What did the CEO say at the last all-hands?</li><li>What are competitors doing that worries people?</li></ol></div>
        </div>
        <h3 style="margin-top:24px">Timing is everything</h3>
        <div class="grid2">
          <div>${cmp('A “let’s experiment” analysis the week before a board meeting', '')}${cmp('Long-term strategy during end-of-quarter fire drills', '')}${cmp('Recommending budget increases right after layoffs', '')}</div>
          <div>${cmp('', 'Quarterly trends two weeks before the planning cycle')}${cmp('', 'Pricing analysis when renewals are coming up')}${cmp('', 'Competitive intelligence right before a board meeting')}</div>
        </div>
        <p>Keep a calendar of business rhythms — board meetings, planning cycles, renewals, launches, industry events — and align your analysis to them. And make it ladder up to strategy: if the company is <i>tripling ARR by going upmarket</i>, optimizing SMB onboarding is a good analysis that will get polite nods and no action. In insurance, context also means loss and combined ratios, frequency vs. severity, the regulatory environment, partner dynamics and risk appetite.</p>`)}

      ${section('self2', '05', 'Self-assessment', `
        <div class="card">${checklist('self2', [
          { t: 'My latest analysis reached the Recommendation level', sub: 'Not just data or information' },
          { t: 'I can write all five parts of the “so what” formula for it' },
          { t: 'I know which decision it informs and who makes it' },
          { t: 'I know why they care about it right now' },
          { t: 'It aligns with company strategy' },
        ])}<p class="small muted" style="margin:8px 0 0">If you can’t complete this cleanly, the analysis needs more work before you present it.</p></div>`)}
      `;
    },
    mount(root) {
      bindChecklists(root);
      // opening comparison
      const OPEN = {
        vomit: { title: 'Q3 Customer Analysis', bullets: ['Analyzed 47,000 customer records', 'Segmented by industry, size and geography', 'Used cohort analysis to track retention', 'Data sources: Salesforce, Stripe, internal database'], thinks: '“Great. Wake me up when you get to the point.”', checks: [0, 0, 0, 0] },
        punch: { title: 'We’re losing enterprise customers because our trial period is too short', bullets: ['Enterprise sales cycle: 90 days on average', 'Current trial period: 60 days', '40% of enterprise trials expire before the deal closes', 'Recommendation: extend enterprise trials to 90 days', 'Expected impact: +$2M ARR'], thinks: '“Interesting. Tell me more.”', checks: [1, 1, 1, 1] },
      };
      const Q60 = ['What the problem / opportunity is', 'What’s causing it', 'What you recommend', 'What happens if they do it'];
      const renderOpen = (k) => {
        const o = OPEN[k];
        $('#openPanel', root).innerHTML = `<div class="grid2">
          <div class="exec-slide" style="aspect-ratio:auto;min-height:220px"><div class="x-k">Slide 1</div><div style="font-size:clamp(15px,3.2cqw,22px);font-weight:750;line-height:1.25;margin-bottom:2cqw">${o.title}</div><ul style="font-size:clamp(12px,2.2cqw,15px)">${o.bullets.map((b) => `<li>${b}</li>`).join('')}</ul></div>
          <div><span class="ctl-label">The 60-second test — would they know…</span><ul class="status-list">${Q60.map((q, i) => `<li class="${o.checks[i] ? 'ok' : 'no'}"><span class="st">${o.checks[i] ? '✓' : '✕'}</span>${q}</li>`).join('')}</ul>
          <p style="margin-top:14px"><span class="ctl-label">What the exec thinks</span><b>${o.thinks}</b></p></div></div>`;
      };

      // ladder
      let lv = 0;
      const renderLadder = () => {
        $$('#ladderBtns button', root).forEach((b, i) => { b.setAttribute('aria-pressed', String(i === lv)); b.classList.toggle('done', i < lv); });
        const L = LADDER[lv];
        $('#ladderNote', root).innerHTML = L.note;
        const chart = $('#ladderChart', root), extra = $('#ladderExtra', root);
        extra.innerHTML = '';
        if (lv === 0) {
          const tot = ENT.map((e, i) => +(e + SMB[i] + MID[i]).toFixed(2));
          $('#ladderSay', root).innerHTML = L.say;
          $('#ladderTitle', root).textContent = 'Sales decreased 15% in Q3';
          $('#ladderSub', root).textContent = 'Total sales, $M per quarter';
          chart.innerHTML = C.line({ x: Q, series: [{ name: 'Total sales', values: tot, color: 'var(--ink-2)', width: 2.5, dots: true }], yMin: 0, yMax: 12, fmt: (v) => '$' + +(+v).toFixed(1) + 'M', aria: 'Total sales by quarter' });
        } else if (lv === 1) {
          $('#ladderSay', root).innerHTML = L.say;
          $('#ladderTitle', root).textContent = 'The entire Q3 decline came from enterprise';
          $('#ladderSub', root).textContent = 'Sales by segment, $M per quarter';
          chart.innerHTML = C.line({
            x: Q, yMin: 0, yMax: 5, direct: true, directValues: true, fmt: (v) => '$' + +(+v).toFixed(1) + 'M', aria: 'Sales by segment',
            series: [
              { name: 'SMB', values: SMB, color: 'var(--context)', width: 1.5 },
              { name: 'Mid-market', values: MID, color: 'var(--context)', width: 1.5 },
              { name: 'Enterprise', values: ENT, color: 'var(--accent)', width: 3, top: true, endDot: true },
            ],
          });
        } else if (lv === 2) {
          $('#ladderSay', root).innerHTML = L.say;
          $('#ladderTitle', root).textContent = '40% of enterprise deals need more than 60 days to close';
          $('#ladderSub', root).textContent = 'Share of enterprise deals by sales-cycle length · blue = still open when the 60-day trial expires';
          chart.innerHTML = cycleHist(60);
        } else {
          const T = +(store.get('trialT', 90));
          extra.innerHTML = `<div class="range-row" style="grid-template-columns:150px 1fr 70px"><label for="trialT">Trial length</label><input type="range" id="trialT" min="30" max="120" step="5" value="${T}"><output id="trialOut"></output></div><div class="kpis" id="trialKpis"></div>`;
          const upd = () => {
            const t = +$('#trialT', root).value;
            store.set('trialT', t);
            const exp = pctBeyond(t), exp60 = pctBeyond(60);
            const rec = (exp60 - exp) * ARR_PER_PCT;
            $('#trialOut', root).textContent = t + ' days';
            $('#trialKpis', root).innerHTML = `
              <div class="kpi"><div class="k-label">Deals expiring mid-cycle</div><div class="k-value">${exp.toFixed(0)}%</div><div class="k-sub">vs. 40% today</div></div>
              <div class="kpi"><div class="k-label">ARR still at risk</div><div class="k-value">${money(exp * ARR_PER_PCT)}</div></div>
              <div class="kpi accent"><div class="k-label">ARR recovered vs. 60 days</div><div class="k-value">${rec >= 0 ? '+' : '−'}${money(Math.abs(rec))}</div></div>`;
            $('#ladderSay', root).innerHTML = t === 60 ? '“Keep trials at 60 days.” — that’s not a recommendation, that’s the status quo.' : `“${t > 60 ? 'Extend' : 'Shorten'} enterprise trials from 60 to ${t} days. Based on pipeline data, this will ${rec >= 0 ? 'recover' : 'lose'} approximately ${money(Math.abs(rec))} in ARR from deals that ${rec >= 0 ? 'currently stall because trials expire' : 'would now expire before closing'}.”`;
            $('#ladderTitle', root).textContent = `A ${t}-day trial leaves ${exp.toFixed(0)}% of deals open at expiry`;
            $('#ladderSub', root).textContent = 'Drag the slider: where does the recommendation stop paying off?';
            chart.innerHTML = cycleHist(t, { label: false });
          };
          $('#trialT', root).addEventListener('input', upd);
          upd();
        }
      };
      $$('#ladderBtns button', root).forEach((b) => b.addEventListener('click', () => { lv = +b.dataset.lv; renderLadder(); }));

      // so what formula
      const checkSW = () => {
        const f = Object.fromEntries($$('[data-sw]', root).map((t) => [t.dataset.sw, t.value.trim()]));
        const hasNum = (s) => /\d/.test(s);
        const vague = /\b(could|might|may)\s+(impact|affect|hurt|help)\b|\bimpact(s)? (our|the) business\b/i;
        const weak = /\b(explore|look into|consider|investigate|think about|options?)\b/i;
        const checks = [
          [f.obs.length > 10 && hasNum(f.obs), 'Observation is specific (has a number)', 'Observation is vague — what exactly changed, by how much?'],
          [f.because.length > 10, 'Explains the “because” (causation)', 'Skipping the “because” — if it’s a product problem, marketing won’t fix it'],
          [f.means.length > 10 && !vague.test(f.means), 'Business implication is concrete', 'Vague “which means” — how? By how much? Who cares?'],
          [f.should.length > 10 && !weak.test(f.should), 'Recommends one specific action', 'Weak “so we should” — not actionable. What specific option?'],
          [f.outcome.length > 5 && hasNum(f.outcome), 'Outcome is quantified', 'Missing expected outcome — to achieve what, and by how much?'],
        ];
        $('#swChecks', root).innerHTML = checks.map(([ok, y, n]) => `<li class="${ok ? 'ok' : 'no'}"><span class="st">${ok ? '✓' : '✕'}</span>${ok ? y : n}</li>`).join('');
        const sc = checks.filter((c) => c[0]).length;
        $('#swScore', root).textContent = `${sc} / 5`;
      };
      const loadSW = (k) => { const ex = SOWHAT_EX[k]; $$('[data-sw]', root).forEach((t) => (t.value = ex[t.dataset.sw])); checkSW(); };
      $$('[data-sw]', root).forEach((t) => t.addEventListener('input', checkSW));

      // stakeholders
      const renderStake = (i) => {
        const s = STAKE[i];
        $('#stakePanel', root).innerHTML = `<p style="margin-bottom:8px">Pitching to the <b>${s.who}</b> — they care about <b>${s.cares.toLowerCase()}</b>.</p>${cmp(`Gets a polite nod: ${s.bad}`, `Gets full attention: ${s.good}`)}`;
      };

      bindSeg(root, (name, v) => {
        if (name === 'open') renderOpen(v);
        if (name === 'swex') loadSW(v);
        if (name === 'stake') renderStake(+v);
      });
      renderOpen('vomit');
      renderLadder();
      loadSW('cac');
      renderStake(0);
    },
  };

  DSP.chapters.push(ch0, ch1, ch2);
})();
