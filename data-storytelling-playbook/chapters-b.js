/* Chapters 3–5 */
(function () {
  const { $, $$, esc, store, money, cmp, widget, section, seg, checklist, bindChecklists, bindSeg, setSeg } = DSP;
  const C = Charts;

  /* =====================================================================
     CHAPTER 3: Making your charts for slides
     ===================================================================== */
  const QS = ['Q1 ’24', 'Q2 ’24', 'Q3 ’24', 'Q4 ’24', 'Q1 ’25', 'Q2 ’25', 'Q3 ’25'];
  const SEGS = [
    { name: 'Enterprise', values: [4.1, 4.3, 4.6, 4.8, 4.7, 4.5, 3.9] },
    { name: 'SMB', values: [2.9, 3.0, 3.0, 3.1, 3.0, 3.1, 3.1] },
    { name: 'Mid-market', values: [2.2, 2.3, 2.3, 2.4, 2.4, 2.5, 2.5] },
    { name: 'Online', values: [1.8, 1.9, 1.7, 2.0, 1.9, 2.1, 2.0] },
    { name: 'Startups', values: [1.6, 1.5, 1.7, 1.6, 1.8, 1.7, 1.9] },
    { name: 'Partners', values: [1.2, 1.4, 1.3, 1.5, 1.6, 1.5, 1.7] },
    { name: 'Public sector', values: [0.9, 1.0, 1.1, 1.0, 1.2, 1.1, 1.2] },
    { name: 'Resellers', values: [0.6, 0.8, 0.7, 0.9, 0.8, 1.0, 0.9] },
  ];
  const LAB_WORST = { type: 'line', title: 'topic', color: 'rainbow', labels: 'legend', grid: 'heavy', series: '8' };
  const LAB_BEST = { type: 'line', title: 'insight', color: 'accent', labels: 'direct', grid: 'none', series: '3' };

  const MESSAGES = [
    { msg: 'X is bigger than Y', chart: 'Horizontal bar chart', why: 'Bars make size differences obvious; the horizontal layout fits long labels without rotating text.', title: 'Enterprise customers generate 3× more revenue than SMB' },
    { msg: 'X is growing over time', chart: 'Line chart', why: 'The brain is good at seeing slopes. Above 5 lines it turns into spaghetti, split it.', title: 'Customer acquisition cost has risen every year since 2020' },
    { msg: 'X accelerated after Y', chart: 'Line chart with annotation', why: 'The annotation explains the moment the trend changed. Keep it to 2–3 annotations max.', title: 'Trial conversion accelerated after the pricing change' },
    { msg: 'X makes up 60% of total', chart: 'Simple bar (not a pie)', why: 'Brains are terrible at comparing angles. Bars are almost always clearer.', title: 'Enterprise makes up 60% of revenue' },
    { msg: 'Revenue is up, driven by segment A', chart: 'Stacked bar', why: 'Shows both the total and its composition: one segment flat, one growing.', title: 'Revenue grew +37%, driven entirely by enterprise' },
    { msg: 'X and Y are correlated', chart: 'Scatter plot + trend line', why: 'Only when the relationship IS the insight. If you need to explain the axes, it’s the wrong chart for this audience.', title: 'Customers with higher NPS churn less' },
    { msg: 'Most values cluster around X', chart: 'Histogram (sparingly)', why: 'Most executives aren’t used to these, use one only when the distribution is the insight.', title: 'Most customers pay $50–100/month, but 5% pay over $500' },
    { msg: 'Our performance vs. plan', chart: 'Bars with a reference line', why: 'The dashed target line gives instant “compared to what?”.', title: 'We beat plan in 4 of the last 6 months' },
  ];

  function messageChart(i) {
    const acc = 'var(--accent)', ctx = 'var(--context)';
    switch (i) {
      case 0: return C.hbars({ labels: ['Enterprise customers', 'Mid-market customers', 'SMB customers'], values: [12.0, 6.1, 4.0], colors: (k) => (k === 0 ? acc : ctx), fmt: (v) => '$' + v.toFixed(1) + 'M', labelW: 170 });
      case 1: return C.line({ x: ['2020', '2021', '2022', '2023', '2024', '2025'], series: [{ name: 'CAC', values: [280, 310, 340, 385, 420, 450], color: acc, width: 2.5, dots: true }], yMin: 0, yMax: 500, fmt: (v) => '$' + v });
      case 2: return C.line({ x: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'], series: [{ name: 'Trial conversion', values: [11.2, 11.0, 11.5, 11.3, 13.4, 15.1, 16.2, 17.0, 17.6], color: acc, width: 2.5 }], yMin: 0, yMax: 20, fmt: (v) => v + '%', vlines: [{ at: 3.5, label: 'New pricing launched' }] });
      case 3: return C.hbars({ labels: ['Enterprise', 'SMB', 'Mid-market'], values: [60, 25, 15], colors: (k) => (k === 0 ? acc : ctx), fmt: (v) => v + '%', max: 100 });
      case 4: return C.stacked({ labels: ['2024', '2025'], stacks: [{ name: 'SMB', values: [5.0, 5.0], color: ctx }, { name: 'Enterprise', values: [3.0, 6.0], color: acc }], fmt: (v) => '$' + (+v).toFixed(0) + 'M', note: '+37%' });
      case 5: {
        const pts = [[12, 9.5], [18, 9.1], [22, 8.0], [28, 8.4], [31, 7.1], [35, 7.4], [40, 6.2], [44, 6.6], [48, 5.4], [52, 5.9], [57, 4.6], [60, 4.9], [64, 3.8], [70, 3.5], [74, 2.9], [78, 3.3]];
        return C.scatter({ points: pts, trend: true, xLabel: 'NPS', yLabel: 'Monthly churn', ySuffix: '%', yFmt: (v) => v + '%', xMin: 10, xMax: 80, yMax: 11, trendLabel: 'Higher NPS → lower churn' });
      }
      case 6: return C.bar({ labels: ['<$50', '$50–100', '$100–200', '$200–500', '>$500'], values: [18, 52, 17, 8, 5], colors: (k) => (k === 1 ? acc : ctx), fmt: (v) => v + '%', pad: 0.9, ticks: 3 });
      case 7: return C.bar({ labels: ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'], values: [0.92, 1.05, 1.08, 0.97, 1.12, 1.15], colors: (k, v) => (v >= 1 ? acc : ctx), fmt: (v) => '$' + v.toFixed(2) + 'M', refLine: { y: 1.0, label: 'Plan $1.00M' }, yMax: 1.3 });
    }
    return '';
  }

  const FRAMES = {
    yoy: { label: 'vs. last year', comp: 4.0, compLabel: 'Q3 last year', title: 'Revenue is $5M, up 25% vs. last year', story: ['Success story', 'good'] },
    plan: { label: 'vs. plan', comp: 5.88, compLabel: 'Plan', title: 'Revenue is $5M, 15% below plan', story: ['Problem story', 'bad'] },
    qoq: { label: 'vs. last quarter', comp: 4.96, compLabel: 'Last quarter', title: 'Revenue is $5M, flat vs. last quarter', story: ['Stagnation story', 'warn'] },
  };
  const AUDIENCES = {
    ceo: ['CEO', 'Strategic goals', '“Revenue is $5M, putting us on track for our $25M annual target.”', '“Revenue is $5M, which is a 2.5% increase vs. last quarter.”'],
    cfo: ['CFO', 'Financial metrics', '“CAC is $450, giving us an 18-month payback period.”', '“CAC increased from $400 to $450.”'],
    product: ['Product', 'User behavior', '“Feature adoption is 35%, down from 60% before the redesign.”', '“35% of users are using the new feature.”'],
    sales: ['Sales', 'Deal metrics', '“Win rate is 25%, below our 30% target, primarily due to pricing objections.”', '“We closed 20 deals out of 80 opportunities.”'],
  };

  const ch3 = {
    slug: 'ch3', n: 3, short: 'Making your charts for slides',
    title: 'Making your charts for slides',
    tagline: 'A chart is an argument, not a data dump. Make it impossible to miss your point.',
    sections: [['communicate', 'One chart, one message'], ['lab', 'Chart lab'], ['picking', 'Picking the chart'], ['mistakes', 'Common mistakes'], ['checklist', 'Checklist'], ['framing', 'Framing & anchors']],
    takeaways: [
      '<b>One chart = one message:</b> if it takes more than 5 seconds to understand, simplify it.',
      '<b>Match chart type to your message,</b> not to your data structure.',
      '<b>Avoid common mistakes:</b> misleading axes, too many series, rainbow colors, tiny fonts.',
      '<b>Always provide context:</b> absolute numbers are meaningless. Include a “compared to what?”.',
      '<b>Use framing strategically:</b> the same data tells different stories depending on your anchor.',
      '<b>Design for clarity, not complexity:</b> simple charts signal confidence.',
    ],
    html() {
      return `
      ${section('communicate', '01', 'Charts are for communication', `
        <p>Nobody cares about your data. They care about what your data means for them. If someone looks at your chart for 5 seconds, they should be able to tell you <b>the message</b>, not the data, not the methodology.</p>
        ${cmp('“This chart shows revenue by product, by region, by segment, over time, with trend lines and forecasts.”', '“This chart shows that Product A is declining in Europe while growing everywhere else.”')}
        <div class="callout"><b>The “chart without you” test.</b> Your slide gets forwarded to the CEO. You’re not there. In 10 seconds, can they tell what they’re looking at, what the message is, and why it matters? Pass it with a <b>title that states the insight</b>, a <b>visual that makes it obvious</b> (color, size, annotation) and <b>minimal supporting text</b>.</div>
        <p><b>Complexity signals insecurity.</b> Junior analysts make complex charts to show they did serious work; senior analysts make simple charts because they’re confident. Before adding another series, a second axis or a trend line, ask: “Does this help prove my point, or am I showing off?” The best charts are almost boring, so clear they feel obvious.</p>`)}

      ${section('lab', '02', 'Chart lab: from Excel default to one clear message', `
        <p>Same data, same numbers. Flip each switch and watch the message appear, or disappear.</p>
        ${widget('Fix this chart', `
          <div class="controls">
            <div><span class="ctl-label">Chart type</span>${seg('type', [['line', 'Line'], ['pie', 'Pie'], ['3d', '3D bars']], 'line')}</div>
            <div><span class="ctl-label">Title</span>${seg('title', [['topic', 'Topic label'], ['insight', 'States the insight']], 'topic')}</div>
            <div><span class="ctl-label">Series</span>${seg('series', [['8', 'All 8'], ['3', 'Top 3']], '8')}</div>
            <div><span class="ctl-label">Color</span>${seg('color', [['rainbow', 'Rainbow'], ['accent', 'One accent']], 'rainbow')}</div>
            <div><span class="ctl-label">Labels</span>${seg('labels', [['legend', 'Legend box'], ['direct', 'Direct labels']], 'legend')}</div>
            <div><span class="ctl-label">Gridlines</span>${seg('grid', [['heavy', 'Heavy'], ['light', 'Light'], ['none', 'None']], 'heavy')}</div>
          </div>
          <div class="btn-row" style="margin-bottom:16px"><button class="btn primary" id="labFix">Fix it all</button><button class="btn" id="labReset">Back to Excel default</button></div>
          <div class="lab-grid">
            <div><p class="chart-title" id="labTitle"></p><p class="chart-sub" id="labSub"></p><div id="labChart"></div></div>
            <div><div class="kpis" style="grid-template-columns:1fr"><div class="kpi accent"><div class="k-label">5-second score</div><div class="k-value" id="labScore"></div><div class="k-sub" id="labVerdict"></div></div></div><ul class="status-list" id="labChecks"></ul></div>
          </div>`)}`)}

      ${section('picking', '03', 'Picking the right chart', `
        <p>Most chart mistakes happen because analysts pick the type from their <b>data structure</b> (“I have time series, so: line chart”) instead of their <b>message</b> (“I want to show growth accelerated after the pricing change, what makes that most obvious?”).</p>
        ${widget('Message → chart', `
          <div class="controls"><div style="width:100%"><span class="ctl-label">Your message</span><div class="chip-row" id="msgChips">${MESSAGES.map((m, i) => `<button class="chip" data-msg="${i}" aria-pressed="${i === 0}">${m.msg}</button>`).join('')}</div></div></div>
          <div class="grid2" style="grid-template-columns:minmax(0,1.6fr) minmax(0,1fr)">
            <div><p class="chart-title" id="msgTitle"></p><div id="msgChart" style="margin-top:8px"></div></div>
            <div><span class="ctl-label">Best chart type</span><p style="font-size:1.2rem;font-weight:750;margin:0 0 8px" id="msgType"></p><p id="msgWhy" class="small"></p></div>
          </div>`)}
        <h3>Charts to avoid</h3>
        <div class="grid2">
          <div class="card"><h4>❌ Pie charts</h4><p class="small">Human brains can’t accurately compare angles or areas. Use a horizontal bar chart. Only exception: a 2-segment majority/minority split, and even then bars are usually clearer.</p></div>
          <div class="card"><h4>❌ 3D charts</h4><p class="small">Visual complexity without information; values get harder to read. Never the right choice. Ever.</p></div>
          <div class="card"><h4>❌ Dual-axis charts</h4><p class="small">Easy to manipulate scales to show false relationships. Use two stacked charts or a scatter plot instead.</p></div>
          <div class="card"><h4>❌ Too many categories</h4><p class="small">More than 7 gets cluttered. Show the top 5 + “Other”, or make a separate deep-dive chart.</p></div>
        </div>
        ${widget('The pie chart challenge', `
          <div class="grid2">
            <div id="pieChart"></div>
            <div><p style="font-weight:650">Which region brought in more revenue: <b>South</b> or <b>East</b>?</p>
              <div class="btn-row" id="pieBtns"><button class="btn" data-ans="south">South</button><button class="btn" data-ans="east">East</button><button class="btn" data-ans="same">They’re equal</button></div>
              <p id="pieFb" class="small" style="margin-top:12px"></p></div>
          </div>
          <div class="reveal" id="pieReveal"><p class="chart-title" style="margin-top:12px">Same data as bars: East edges out South by one point</p><div id="pieBars"></div></div>`)}`)}

      ${section('mistakes', '04', 'Common chart mistakes', `
        <h3>Misleading axes</h3>
        <p><b>Bar charts must start at zero</b>, bars represent magnitude. Line charts may start above zero (they show trend, not magnitude), as long as it’s labeled clearly.</p>
        ${widget('Truncate the axis', `
          <div class="range-row" style="grid-template-columns:150px 1fr 60px"><label for="axStart">Y-axis starts at</label><input type="range" id="axStart" min="0" max="98" step="1" value="0"><output id="axOut"></output></div>
          <div class="grid2" style="grid-template-columns:minmax(0,1.3fr) minmax(0,1fr);margin-top:10px">
            <div id="axChart"></div>
            <div><div class="kpis" style="grid-template-columns:1fr 1fr"><div class="kpi"><div class="k-label">Actual growth</div><div class="k-value">+5%</div></div><div class="kpi accent"><div class="k-label">What the eye sees</div><div class="k-value" id="axSeen"></div></div></div><p id="axMsg" class="small"></p></div>
          </div>`)}
        <div class="grid2">
          <div class="card"><h4>Too many data series</h4><p class="small">Max 3–4 lines. Highlight the important one, gray the rest, or split into multiple charts.</p></div>
          <div class="card"><h4>Rainbow colors</h4><p class="small">One accent color for what matters, gray for context, 3–4 colors max.</p></div>
          <div class="card"><h4>Cluttered legends</h4><p class="small">Label lines directly at their end points. If labels don’t fit, you have too many series.</p></div>
          <div class="card"><h4>Tiny fonts</h4><p class="small">10pt minimum; 12pt body, 14–16pt titles. If you can’t read it from 3 meters away, it’s too small.</p></div>
          <div class="card"><h4>Missing context</h4><p class="small">Always include units, time period and a comparison. Not “Revenue” but “Q3 Revenue: $5M, 20% above plan”.</p></div>
          <div class="card"><h4>Excel default colors</h4><p class="small">Signals “I didn’t think about this”. Use brand colors or muted blues and grays with one accent. Avoid red/green pairs, neon and gradients.</p></div>
        </div>`)}

      ${section('checklist', '05', 'The before/after checklist', `
        <div class="card">${checklist('chart-check', [
          'The title states the insight (not just describes the data)',
          'Someone can understand the message in 5 seconds',
          'Axes are labeled with units',
          'The Y-axis is appropriate for the chart type',
          'There are fewer than 5 data series',
          'Color highlights, it doesn’t decorate',
          'Labels are readable from 3 meters away',
          'There’s a comparison, benchmark or context',
          'It would work without me in the room to explain it',
        ])}<div style="margin-top:10px"><div class="meter"><i id="ckMeter"></i></div><p class="small muted" id="ckOut" style="margin-top:6px"></p></div></div>`)}

      ${section('framing', '06', 'Framing and anchors', `
        <p>The exact same data tells completely different stories depending on how you frame it. <b>Your choice of comparison creates the frame</b>, choose it deliberately, and stay honest with the data.</p>
        ${widget('One number, three stories', `
          <div class="controls"><div><span class="ctl-label">Compare $5M revenue…</span>${seg('frame', Object.entries(FRAMES).map(([k, f]) => [k, f.label]), 'yoy')}</div></div>
          <div class="grid2" style="grid-template-columns:minmax(0,1.4fr) minmax(0,1fr)">
            <div><p class="chart-title" id="frTitle"></p><div id="frChart"></div></div>
            <div><span class="ctl-label">The narrative</span><p id="frStory"></p><p class="small muted">The first number you show sets expectations for everything after it. CAC of $450 feels expensive after a $350 target, and efficient after a $600 competitor benchmark.</p></div>
          </div>`)}
        <h3>Always include a “compared to what?”</h3>
        <div class="grid2">
          <div class="card"><h4>Time</h4><p class="small">vs. last quarter, same period last year, rolling average, e.g. this year’s line with last year as a reference line.</p></div>
          <div class="card"><h4>Goal</h4><p class="small">vs. plan, target, budget, e.g. bars with a horizontal target line.</p></div>
          <div class="card"><h4>Peers</h4><p class="small">vs. industry benchmark, competitors, other segments, e.g. your NPS vs. industry average.</p></div>
          <div class="card"><h4>Baseline</h4><p class="small">Before/after an intervention, with/without a feature, treatment vs. control, annotate the change date.</p></div>
        </div>
        <p style="margin-top:16px">Visual techniques: <b>reference lines</b> for targets, <b>shaded regions</b> for ranges or periods, <b>annotations</b> for key events (2–3 max), and <b>comparison bars</b> for period-over-period.</p>
        ${widget('Frame it for your audience', `
          <div class="controls">${seg('aud', Object.entries(AUDIENCES).map(([k, a]) => [k, 'For the ' + a[0]]), 'ceo')}</div>
          <div id="audPanel"></div>`, 'In insurance, the same “more claims” reads as flat loss ratio (risk), strained review capacity (operations) or an 8-point satisfaction drop (customer). Pick the frame that matters most for the decision at hand.')}`)}
      `;
    },
    mount(root) {
      bindChecklists(root);
      // ---------- chart lab
      const lab = { ...LAB_WORST };
      const renderLab = () => {
        const n = +lab.series;
        const data = SEGS.slice(0, n);
        const rainbow = ['--c1', '--c2', '--c3', '--c4', '--c5', '--c6', '--c7', '--c8'].map((v) => `var(${v})`);
        const colorOf = (i) => (lab.color === 'rainbow' ? rainbow[i] : i === 0 ? 'var(--accent)' : 'var(--context)');
        $('#labTitle', root).textContent = lab.title === 'insight' ? 'Enterprise revenue fell 15% vs. last year while every other segment held steady' : 'Revenue by Segment';
        $('#labSub', root).textContent = lab.type === 'line' ? 'Quarterly revenue, $M' : 'Share of revenue, Q3 ’25';
        let svg;
        if (lab.type === 'line') {
          svg = C.line({
            x: QS, yMin: 0, yMax: 5, fmt: (v) => '$' + +(+v).toFixed(1) + 'M', grid: lab.grid === 'none' ? false : lab.grid,
            legend: lab.labels === 'legend', direct: lab.labels === 'direct', h: 320,
            series: data.map((s, i) => ({ ...s, color: colorOf(i), width: lab.color === 'accent' && i === 0 ? 3 : lab.color === 'accent' ? 1.5 : 2, top: i === 0, endDot: lab.color === 'accent' && i === 0 })),
            aria: 'Revenue by segment',
          });
        } else if (lab.type === 'pie') {
          svg = C.pie({ values: data.map((s) => s.values[6]), labels: data.map((s) => s.name), colors: data.map((_, i) => colorOf(i)), fmt: (v) => '$' + v + 'M', h: 320 });
        } else {
          const last = data.map((s) => s.values[6]);
          svg = `<div class="chart-3d">${C.bar({ labels: data.map((s) => (n > 4 ? s.name.slice(0, 6) + '.' : s.name)), values: last, colors: data.map((_, i) => colorOf(i)), fmt: (v) => '$' + v.toFixed(1), h: 320, valueLabels: false, grid: lab.grid !== 'none' })}</div>`;
        }
        $('#labChart', root).innerHTML = svg;
        const checks = [
          [lab.title === 'insight', 'Title states the insight', 'Title is a topic label'],
          [lab.type === 'line', 'Chart type fits “change over time”', lab.type === 'pie' ? 'Pie: the trend is invisible, angles are hard to compare' : '3D distorts values and hides the trend'],
          [n <= 4, '3 series, readable', '8 series, spaghetti'],
          [lab.color === 'accent', 'Color highlights what matters', 'Rainbow: everything competes'],
          [lab.labels === 'direct' || lab.type !== 'line', 'Direct labels, no eye-jumping', 'Legend box forces back-and-forth'],
          [lab.grid !== 'heavy', 'Recessive gridlines', 'Heavy gridlines add clutter'],
        ];
        const score = checks.filter((c) => c[0]).length;
        $('#labScore', root).textContent = `${score} / 6`;
        $('#labVerdict', root).textContent = score === 6 ? 'Message lands in 5 seconds' : score >= 4 ? 'Getting there' : 'The message is buried';
        $('#labChecks', root).innerHTML = checks.map(([ok, y, nn]) => `<li class="${ok ? 'ok' : 'no'}"><span class="st">${ok ? '✓' : '✕'}</span>${ok ? y : nn}</li>`).join('');
      };
      const applyLab = (preset) => { Object.assign(lab, preset); Object.entries(lab).forEach(([k, v]) => setSeg(root, k, v)); renderLab(); };
      $('#labFix', root).addEventListener('click', () => applyLab(LAB_BEST));
      $('#labReset', root).addEventListener('click', () => applyLab(LAB_WORST));

      // ---------- message → chart
      const renderMsg = (i) => {
        const m = MESSAGES[i];
        $$('#msgChips .chip', root).forEach((c) => c.setAttribute('aria-pressed', String(+c.dataset.msg === i)));
        $('#msgTitle', root).textContent = m.title;
        $('#msgType', root).textContent = m.chart;
        $('#msgWhy', root).textContent = m.why;
        $('#msgChart', root).innerHTML = messageChart(i);
      };
      $$('#msgChips .chip', root).forEach((c) => c.addEventListener('click', () => renderMsg(+c.dataset.msg)));

      // ---------- pie challenge
      const REG = ['North', 'South', 'East', 'West', 'Central'], RV = [22, 20, 21, 19, 18];
      $('#pieChart', root).innerHTML = C.pie({ values: RV, labels: REG, colors: ['var(--c1)', 'var(--c2)', 'var(--c3)', 'var(--c4)', 'var(--c7)'], hideValues: true, h: 280 });
      $$('#pieBtns .btn', root).forEach((b) => b.addEventListener('click', () => {
        const ok = b.dataset.ans === 'east';
        $('#pieFb', root).innerHTML = ok ? '<b>Correct</b>, but you probably weren’t sure. That hesitation is the problem with pies.' : '<b>Not quite.</b> East is 21%, South is 20%. Angles hide a difference that bars make obvious.';
        $('#pieReveal', root).classList.add('on');
        const order = RV.map((v, i) => i).sort((a, b) => RV[b] - RV[a]);
        $('#pieBars', root).innerHTML = C.hbars({ labels: order.map((i) => REG[i]), values: order.map((i) => RV[i]), colors: (k) => (['East', 'South'].includes(REG[order[k]]) ? (REG[order[k]] === 'East' ? 'var(--accent)' : 'var(--ink-2)') : 'var(--context)'), fmt: (v) => v + '%', labelW: 90, max: 25 });
      }));

      // ---------- truncated axis
      const renderAx = () => {
        const s = +$('#axStart', root).value;
        $('#axOut', root).textContent = s;
        const seen = ((105 - s) / (100 - s) - 1) * 100;
        $('#axSeen', root).textContent = '+' + (seen >= 100 ? seen.toFixed(0) : seen.toFixed(0)) + '%';
        $('#axMsg', root).innerHTML = s === 0 ? 'Honest: the bars’ heights are proportional to the values.' : `<b style="color:var(--bad)">Misleading.</b> Starting at ${s} makes a 5% gain look like ${seen.toFixed(0)}%. Bars represent magnitude, start them at zero.`;
        $('#axChart', root).innerHTML = C.bar({ labels: ['Last year', 'This year'], values: [100, 105], yMin: s, yMax: 110, colors: ['var(--context)', 'var(--accent)'], fmt: (v) => '$' + v + 'M', h: 260, maxBar: 90 });
      };
      $('#axStart', root).addEventListener('input', renderAx);

      // ---------- checklist meter
      const ck = () => {
        const n = $$('[data-check="chart-check"] input:checked', root).length;
        $('#ckMeter', root).style.width = (n / 9) * 100 + '%';
        $('#ckOut', root).textContent = n === 9 ? 'Ready to present.' : `${n} of 9, if any answer is “no”, fix it before presenting.`;
      };
      root.addEventListener('checkchange', ck);

      // ---------- framing
      const renderFrame = (k) => {
        const f = FRAMES[k];
        $('#frTitle', root).textContent = f.title;
        $('#frChart', root).innerHTML = C.bar({ labels: [f.compLabel, 'This quarter'], values: [f.comp, 5.0], colors: ['var(--context)', 'var(--accent)'], fmt: (v) => '$' + v.toFixed(1) + 'M', yMax: 7, h: 240, maxBar: 90 });
        $('#frStory', root).innerHTML = `<span class="tag ${f.story[1]}" style="font-size:.9rem">${f.story[0]}</span>`;
      };
      const renderAud = (k) => {
        const a = AUDIENCES[k];
        $('#audPanel', root).innerHTML = `<p>Frame against <b>${a[1].toLowerCase()}</b>.</p>${cmp(a[3], a[2])}`;
      };

      bindSeg(root, (name, v) => {
        if (['type', 'title', 'series', 'color', 'labels', 'grid'].includes(name)) { lab[name] = v; renderLab(); }
        if (name === 'frame') renderFrame(v);
        if (name === 'aud') renderAud(v);
      });
      renderLab(); renderMsg(0); renderAx(); ck(); renderFrame('yoy'); renderAud('ceo');
    },
  };

  /* =====================================================================
     CHAPTER 4: Slide design
     ===================================================================== */
  const DETOX = [
    ['deco', 'Decorative graphics', 'Stock photos & clip-art compete with your content'],
    ['logo', 'Logo on every slide', 'Everyone knows where they work'],
    ['border', 'Borders and boxes', 'Clutter without information'],
    ['grid', 'Gridlines', 'Label key values directly instead'],
    ['legend', 'Legend', 'Label series directly instead'],
    ['rainbow', 'Rainbow colors', 'One accent, everything else gray'],
    ['bullets', 'Bullets describing the chart', 'Bullets should say why, so what, now what'],
    ['title', 'Topic title', 'The title should state the insight'],
  ];
  const EXEC_EX = {
    trial: { label: 'Trial length', s: 'We set a goal to grow enterprise ARR by 30% in Q3.', c: 'Enterprise revenue declined 15% instead, driven by low trial conversion.', root: 'Enterprise sales cycle (90 days) exceeds the trial period (60 days).', rec: 'Extend enterprise trials from 60 to 90 days.', impact: 'Recover ~$2M ARR from stalled pipeline.', next: 'Can implement in 2 weeks.' },
    broker: { label: 'Broker channel', s: 'We aimed to grow premium volume by 20% in Q3 through our new broker partnership channel.', c: 'Premium volume grew only 8%, with 40% of broker-sourced leads failing to convert to policies.', root: 'Brokers lack real-time quote API access, leading to 3–5 day quote delays vs. competitors’ instant quotes.', rec: 'Fast-track broker API development (planned for Q1 2026) and launch a pilot with the top 3 brokers.', impact: 'Increase broker conversion from 60% to 85%, adding ~€2M in annual premium.', next: 'Engineering scoping this week, pilot launch in 6 weeks.' },
    churn: { label: 'Customer churn', s: 'Customer retention has been stable at 90% for the past year.', c: 'Retention dropped to 82% in Q3, concentrated in customers who joined in the past 6 months.', root: 'New customers who don’t complete onboarding in their first 30 days churn at 3× the rate (only 40% complete it).', rec: 'Implement automated onboarding nudges (email + in-app) and a CSM check-in at day 14.', impact: 'Increase onboarding completion to 70%, reducing early-stage churn by ~50%.', next: 'Product builds the nudge system (3 weeks); CS pilots with the October cohort.' },
    bad: { label: '❌ A weak one', s: 'This deck presents the results of our Q3 analysis, which used cohort analysis and regression modeling across three data sources to better understand trends in our customer base over the last several quarters.', c: 'There are a few things that might be worth looking at, see slide 12 for details.', root: '', rec: 'We could consider option A, B or C, or explore further.', impact: '', next: 'More research is needed.' },
  };

  const ch4 = {
    slug: 'ch4', n: 4, short: 'Slide design',
    title: 'Slide design',
    tagline: 'Great analysis on an ugly slide is like a Michelin-star meal served on a trash can lid.',
    sections: [['hierarchy', 'Visual hierarchy'], ['detox', 'Let’s detox'], ['exec', 'Exec summary'], ['appendix', 'Placement & appendix'], ['self4', 'Self-assessment']],
    takeaways: [
      '<b>Visual hierarchy guides the eye:</b> title (biggest) → chart (center) → bullets (supporting) → footer (smallest).',
      '<b>Size, color and position signal importance</b>, use them intentionally, not decoratively.',
      '<b>Detox your slides:</b> remove 50% of elements, decorations, redundant labels, gridlines, borders.',
      '<b>The exec summary is your most important slide:</b> Situation → Complication → Resolution, 60 seconds, no charts, stands alone.',
      '<b>White space is a feature,</b> not a bug.',
      '<b>The squint test reveals hierarchy:</b> if the wrong thing stands out, fix it.',
    ],
    html() {
      return `
      ${section('hierarchy', '01', 'Visual hierarchy', `
        <p>Your slide has 3 seconds to communicate. The eye goes first to the <b>biggest, boldest element</b>, then to <b>color contrast</b>, then reads <b>top-to-bottom, left-to-right</b>. Design the slide so this natural path leads through your argument.</p>
        <div class="grid2">
          <div class="card"><h4>Size = importance</h4><p class="small">Title 16–24pt · supporting text 9–14pt · footer 7–8pt. In charts: the series that matters is bold and saturated; context is thin and muted; targets are dashed gray.</p></div>
          <div class="card"><h4>Color = emphasis</h4><p class="small">One accent color for what matters. Everything else gray. Two to three colors per slide, max.</p></div>
          <div class="card"><h4>Position = reading order</h4><p class="small">Title on top, chart in the center, bullets below or beside, footer in the corner. Never scatter elements randomly.</p></div>
          <div class="card"><h4>White space = clarity</h4><p class="small">Juniors fear empty space; seniors embrace it. Space separates elements and reduces cognitive load.</p></div>
        </div>`)}

      ${section('detox', '02', 'Let’s detox!', `
        <p>Most slides are cluttered with elements that are there out of habit, not purpose. Try the <b>50% rule</b>: delete half the elements on your slide. It almost always gets clearer, not worse.</p>
        ${widget('Detox this slide', `
          <div class="slide-stage">
            <div>
              <div class="slide" id="slide"></div>
              <div class="btn-row" style="margin-top:14px"><button class="btn primary" id="dxAll">Detox everything</button><button class="btn" id="dxReset">Reset</button><button class="btn" id="dxSquint" aria-pressed="false">👀 Squint test</button></div>
              <p class="small muted" id="squintMsg" style="margin-top:8px"></p>
            </div>
            <div>
              <span class="ctl-label">Remove / fix</span>
              ${checklist('detox-ui', DETOX.map(([, t, sub]) => ({ t, sub })))}
              <div style="margin-top:10px"><span class="ctl-label">Clutter removed</span><div class="meter"><i id="dxMeter"></i></div><p class="small muted" id="dxOut" style="margin-top:4px"></p></div>
              <div id="layers"></div>
            </div>
          </div>`)}`)}

      ${section('exec', '03', 'The executive summary slide', `
        <p><b>If executives only see one slide from your deck, this is it.</b> It’s not a table of contents and not an agenda, it delivers your entire message in 60 seconds, using <b>Situation → Complication → Resolution</b>.</p>
        <div class="grid3">
          <div class="card"><h4>1 · Situation</h4><p class="small">One sentence. Sets the context, what “normal” was.</p></div>
          <div class="card"><h4>2 · Complication</h4><p class="small">One sentence. What went wrong, or the opportunity. Creates tension.</p></div>
          <div class="card"><h4>3 · Resolution</h4><p class="small">2–4 bullets: root cause, recommendation, expected impact, next steps.</p></div>
        </div>
        ${widget('Build your exec summary', `
          <div class="controls"><div><span class="ctl-label">Start from</span>${seg('exex', Object.entries(EXEC_EX).map(([k, v]) => [k, v.label]), 'trial')}</div></div>
          <div class="grid2">
            <div>
              <label class="field"><span>Situation</span><textarea rows="2" data-ex="s"></textarea></label>
              <label class="field"><span>Complication</span><textarea rows="2" data-ex="c"></textarea></label>
              <label class="field"><span>Root cause</span><input data-ex="root"></label>
              <label class="field"><span>Recommendation</span><input data-ex="rec"></label>
              <label class="field"><span>Expected impact</span><input data-ex="impact"></label>
              <label class="field"><span>Next steps</span><input data-ex="next"></label>
            </div>
            <div>
              <div class="exec-slide" id="exSlide"></div>
              <div style="margin-top:16px"><span class="ctl-label">Read-aloud time (150 words/min)</span><div id="exTime"></div></div>
              <ul class="status-list" id="exChecks" style="margin-top:12px"></ul>
            </div>
          </div>`)}
        <h3>What NOT to include</h3>
        <p>❌ Methodology (appendix) · ❌ Detailed data beyond key metrics · ❌ Multiple options, pick one · ❌ Open questions, do the research or recommend with caveats · ❌ Jargon.</p>`)}

      ${section('appendix', '04', 'Placement and the appendix trap', `
        <div class="grid2">
          <div class="card"><h4>Where does the exec summary go?</h4><p class="small"><b>Slide 1</b> for time-constrained senior execs. <b>Slide 2</b> (after a brief title/context slide) for audiences who want context first. <b>Slide 3</b>, after an agenda? Too slow, they lose patience.</p></div>
          <div class="card"><h4>The appendix trap</h4><p class="small">If it’s important, it belongs in the main deck. If it’s not, delete it. The appendix holds methodology, extra data cuts, sensitivity analyses and answers to anticipated questions, never your recommendation, key supporting data or critical caveats.</p></div>
        </div>`)}

      ${section('self4', '05', 'Self-assessment', `
        <div class="grid2">
          <div class="card"><h4>Audit your last deck</h4>${checklist('self4a', ['Every title is the biggest element and states an insight', 'Charts are centered with adequate white space', 'Bullets are brief and don’t describe the chart', 'No logos, borders or decorative graphics', 'Legends replaced by direct labels', 'I applied the 50% rule to my messiest slide'])}</div>
          <div class="card"><h4>Test your exec summary</h4>${checklist('self4b', ['Someone can read it in 60 seconds', 'It stands alone without the rest of the deck', 'The recommendation is clear and actionable', 'I’d be comfortable if it were the only slide the CEO saw'])}</div>
        </div>`)}
      `;
    },
    mount(root) {
      bindChecklists(root);
      // ---------- detox slide
      const ul = $('[data-check="detox-ui"]', root);
      const fixed = () => { const st = {}; $$('input', ul).forEach((cb, i) => (st[DETOX[i][0]] = cb.checked)); return st; };
      const renderSlide = () => {
        const f = fixed();
        const data = SEGS.slice(0, 3);
        const chart = C.line({
          x: QS, yMin: 0, yMax: 5, w: 560, h: 300, fmt: (v) => '$' + (+v).toFixed(0) + 'M',
          grid: f.grid ? false : 'heavy', legend: !f.legend, direct: f.legend,
          series: data.map((s, i) => ({ ...s, color: f.rainbow ? (i === 0 ? 'var(--accent)' : 'var(--context)') : `var(--c${i + 1})`, width: f.rainbow && i === 0 ? 3.5 : 2, top: i === 0 })),
          aria: 'Revenue by segment',
        });
        const bulletsBad = ['As shown in the chart, enterprise revenue changed', 'SMB revenue is shown in orange', 'Mid-market revenue is shown in green', 'The chart covers 7 quarters', 'Data is in $M'];
        const bulletsGood = ['Root cause: enterprise sales cycle (90 days) exceeds the trial (60 days)', '~$2M of pipeline stalled by expired trials', 'Recommendation: extend enterprise trials to 90 days'];
        $('#slide', root).innerHTML = `
          ${f.logo ? '' : '<div class="s-logo">ACME</div>'}
          ${f.deco ? '' : '<div class="s-deco d1" aria-hidden="true">🤝</div><div class="s-deco d2" aria-hidden="true">📈✨</div>'}
          <div class="s-title ${f.title ? '' : 'topic'}" data-layer="1">${f.title ? 'Enterprise revenue declined 15% while SMB and mid-market held steady' : 'Q3 Revenue Analysis'}</div>
          <div class="s-body">
            <div class="s-chart ${f.border ? '' : 'boxed'}" data-layer="2">${chart}</div>
            <ul class="s-bullets ${f.bullets ? '' : 'many'}" data-layer="3">${(f.bullets ? bulletsGood : bulletsBad).map((b) => `<li>${b}</li>`).join('')}</ul>
          </div>
          <div class="s-foot" data-layer="4">Source: Salesforce, Q3 2025 · Enterprise = ACV &gt; $50K</div>`;
        const n = Object.values(f).filter(Boolean).length;
        $('#dxMeter', root).style.width = (n / DETOX.length) * 100 + '%';
        $('#dxOut', root).textContent = n === DETOX.length ? 'Same information, half the clutter, 3× clearer.' : `${n} of ${DETOX.length} fixed`;
        $('#layers', root).innerHTML = n === DETOX.length ? `<span class="ctl-label" style="margin-top:16px">The four layers, hover to see them</span><ul class="layer-list">
          <li tabindex="0" data-l="1"><b>1 · The insight (title)</b>Largest font, top of the slide, a full sentence</li>
          <li tabindex="0" data-l="2"><b>2 · The proof (visual)</b>50–70% of the slide, color highlights what matters</li>
          <li tabindex="0" data-l="3"><b>3 · Supporting context</b>2–3 short bullets: cause, implication, action</li>
          <li tabindex="0" data-l="4"><b>4 · Metadata (footer)</b>Smallest, muted: source, definitions</li></ul>` : '';
        $$('#layers li', root).forEach((li) => {
          const on = (v) => $$(`#slide [data-layer="${li.dataset.l}"]`, root).forEach((el) => el.classList.toggle('lit', v));
          li.addEventListener('mouseenter', () => on(true)); li.addEventListener('mouseleave', () => on(false));
          li.addEventListener('focus', () => on(true)); li.addEventListener('blur', () => on(false));
        });
        updateSquint();
      };
      let squint = false;
      const updateSquint = () => {
        const f = fixed();
        $('#slide', root).classList.toggle('squint', squint);
        $('#dxSquint', root).setAttribute('aria-pressed', String(squint));
        $('#squintMsg', root).textContent = !squint ? '' : Object.values(f).every(Boolean) ? 'What stands out: the title and the blue enterprise line. Exactly right.' : 'What stands out: the logo, the clip-art, the box and the gridlines. The wrong things.';
      };
      ul.addEventListener('checkchange', renderSlide);
      const setAll = (v) => { $$('input', ul).forEach((cb) => (cb.checked = v)); store.set('check:detox-ui', Object.fromEntries(DETOX.map((_, i) => [i, v]))); renderSlide(); };
      $('#dxAll', root).addEventListener('click', () => setAll(true));
      $('#dxReset', root).addEventListener('click', () => setAll(false));
      $('#dxSquint', root).addEventListener('click', () => { squint = !squint; updateSquint(); });
      renderSlide();

      // ---------- exec summary
      const exVal = () => Object.fromEntries($$('[data-ex]', root).map((i) => [i.dataset.ex, i.value.trim()]));
      const renderEx = () => {
        const v = exVal();
        const ph = (t, p) => (t ? esc(t) : `<span class="empty">${p}</span>`);
        const res = [['Root cause', v.root], ['Recommendation', v.rec], ['Expected impact', v.impact], ['Next steps', v.next]].filter(([, t]) => t);
        $('#exSlide', root).innerHTML = `<div class="x-k">Executive summary</div>
          <div class="x-row"><b>Situation</b><div>${ph(v.s, 'What were we trying to achieve?')}</div></div>
          <div class="x-row"><b>Complication</b><div>${ph(v.c, 'What’s the problem or opportunity?')}</div></div>
          <div class="x-row"><b>Resolution</b><div>${res.length ? `<ul>${res.map(([k, t]) => `<li><b>${k}:</b> ${esc(t)}</li>`).join('')}</ul>` : '<span class="empty">Root cause, recommendation, impact, next steps</span>'}</div></div>`;
        const text = Object.values(v).join(' ');
        const words = text.split(/\s+/).filter(Boolean).length;
        const secs = Math.round((words / 150) * 60);
        const max = 120;
        $('#exTime', root).innerHTML = `<div style="display:flex;justify-content:space-between;font-size:.9rem"><b>${secs}s</b><span class="muted">${words} words · target ≤ 60s</span></div>
          <div class="meter" style="position:relative;margin-top:6px"><i style="width:${Math.min(100, (secs / max) * 100)}%;background:${secs > 60 ? 'var(--bad)' : 'var(--accent)'}"></i><span style="position:absolute;left:50%;top:-3px;bottom:-3px;width:2px;background:var(--ink)"></span></div>`;
        const sentences = (t) => t.split(/[.!?](\s|$)/).filter((x) => x && x.trim().length > 2).length;
        const checks = [
          [secs <= 60, 'Readable in 60 seconds', `Too long (${secs}s), cut it down`],
          [!/\b(see slide|slide \d+|later in|appendix|as discussed)\b/i.test(text), 'Stands alone, no references elsewhere', 'Refers to other slides, it must stand alone'],
          [v.s && sentences(v.s) <= 1 && v.c && sentences(v.c) <= 1, 'Situation & complication: one sentence each', 'Situation and complication should be one sentence each'],
          [!!v.rec && !/\b(could|consider|explore|option|or\b|maybe|might)\b/i.test(v.rec), 'One clear, action-oriented recommendation', 'Recommendation is missing, hedged, or offers multiple options'],
          [/\d/.test(v.impact), 'Quantified expected impact', 'Expected impact isn’t quantified'],
          [!!v.root, 'Root cause stated', 'Root cause missing'],
          [!/\b(regression|cohort analysis|methodology|modeling|p-value|confidence interval)\b/i.test(text), 'No methodology or jargon', 'Methodology/jargon, move it to the appendix'],
        ];
        $('#exChecks', root).innerHTML = checks.map(([ok, y, n]) => `<li class="${ok ? 'ok' : 'no'}"><span class="st">${ok ? '✓' : '✕'}</span>${ok ? y : n}</li>`).join('');
      };
      const loadEx = (k) => { const e = EXEC_EX[k]; $$('[data-ex]', root).forEach((i) => (i.value = e[i.dataset.ex])); renderEx(); };
      $$('[data-ex]', root).forEach((i) => i.addEventListener('input', renderEx));
      bindSeg(root, (name, v) => { if (name === 'exex') loadEx(v); });
      loadEx('trial');
    },
  };

  /* =====================================================================
     CHAPTER 5: Delivery
     ===================================================================== */
  const LEX = [
    ['undermine', /\b(i'?m not (an|a) [a-z ]*?expert|i could be wrong|i'?m just an analyst)\b/gi],
    ['apology', /\b(sorry( if this is basic)?|this (might|may) be obvious|this probably isn'?t important)\b/gi],
    ['over', /\b(definitely|guarantee[ds]?|there'?s no way|obviously|100% sure|absolutely certain)\b/gi],
    ['passive', /\b(it was (found|discovered|determined|decided)|an analysis was (conducted|performed|done))\b/gi],
    ['confident', /\b(i recommend|we should|the data shows|this will|based on|we found|i analyzed|i expect)\b/gi],
    ['hedge', /\b(sort of|kind of|potentially|possibly|maybe|perhaps|might|could|seems? like|it seems|i think|i believe|probably|somewhat|a bit|if that makes sense|i guess|i feel like)\b/gi],
  ];
  const HEDGE_PRESETS = {
    before: 'So, I kind of looked into the trial conversion issue, and it seems like maybe the trial period might be a bit too short for enterprise customers. We could potentially consider extending it, which might possibly help improve conversion rates, if that makes sense?',
    after: 'I analyzed trial conversion and found that enterprise sales cycles average 90 days, while trials are only 60 days. I recommend extending enterprise trials to 90 days, which will improve conversion by 15-20%.',
    sorry: 'Sorry, this might be obvious, but I noticed enterprise trials convert poorly. I\'m not a sales expert, but maybe we should extend trials. This will definitely solve all our conversion problems.',
  };
  const OBJECTIONS = [
    {
      key: 'exp', label: '“This doesn’t match my experience”', means: 'I’ve seen something different in the field, and I trust my experience more than your data.',
      steps: ['“That’s valuable context. Your experience matters.”', '“Can you tell me more about what you’ve seen? Is it specific to a segment or time period?”', '“Let’s look at the data for that segment specifically…” [show the cut]', '“So the pattern holds overall, with variation in [segment]. Does that change the recommendation?”'],
      dialog: [['them', 'I don’t think enterprise customers care about trial length. In my experience, they decide quickly.'], ['you', 'Interesting. When you say “decide quickly”, do you mean they know they want the product, or they complete the purchase quickly?'], ['them', 'They know they want it, but procurement takes forever.'], ['you', 'Exactly. That’s what the data shows, they want it, but trials expire during procurement. That’s why extending trials helps.']],
    },
    {
      key: 'sample', label: '“The sample size is too small”', means: 'I don’t trust this data. It might be noise.',
      steps: ['“You’re right to be cautious about sample size.”', '“What level of confidence would you need to move forward?”', '“Here’s the confidence interval: [X to Y]. Even at the low end, we’d see [outcome].”', '“Do we wait for more data or run a pilot? Given the potential $2M impact, I’d pilot now.”'],
      dialog: [['them', 'This is based on only 50 customers. That’s not enough.'], ['you', 'Fair point. With n=50, we have 80% confidence the true impact is a 10–25% improvement. Even at the low end, that’s $1.5M ARR. Do you want to wait 6 months for more data, or pilot this with our top 10 enterprise prospects?']],
    },
    {
      key: 'tried', label: '“We tried this before and it failed”', means: 'I’m skeptical because we’ve been burned before.',
      steps: ['“I didn’t know that. What happened?”', '“What was different then? Market, product, implementation?”', '“Here’s what’s changed: [X, Y, Z]. That’s why I expect a different outcome.”', '“Given those changes, does it make sense to revisit this?”'],
      dialog: [['them', 'We extended trials before and it didn’t help conversion.'], ['you', 'Tell me more. When was that, and what did you see?'], ['them', 'Two years ago. Conversion stayed flat.'], ['you', 'Got it. Two things are different now: our sales team is twice the size, so they can engage during longer trials, and we have automated nurture emails. With those in place, I expect a different outcome.']],
    },
    {
      key: 'cost', label: '“This will cost too much”', means: 'I’m not convinced the ROI is worth it.',
      steps: ['“Cost is definitely a factor.”', '“Are you comparing to the expected return, or is it a budget constraint?”', '“The investment is $X, the expected return is $Y, payback in Z months.”', '“If we validate the ROI with a pilot, would that change your view?”'],
      dialog: [['them', 'Adding support capacity for longer trials will cost $200K.'], ['you', 'True. The expected return is $2M in ARR, a 10× ROI. And we’d only add support capacity after validating the conversion lift in the pilot.']],
    },
    {
      key: 'time', label: '“We don’t have time for this right now”', means: 'This isn’t a priority given everything else.',
      steps: ['“I understand we have a lot going on.”', '“Is the concern bandwidth, or priority relative to other initiatives?”', '“It’s a 2-week implementation that directly impacts our Q4 $10M ARR target.”', '“If this helps us hit the Q4 target, does it become a priority?”'],
      dialog: [['them', 'We’re focused on the product launch right now. We can’t take this on.'], ['you', 'Understood, the launch is critical. This change takes 2 weeks and needs no engineering, just a config change. Can we do both?']],
    },
  ];
  const PIVOT_QUIZ = [
    ['Two directors independently raise the same concern about support capacity.', 'pivot', '2+ people raising the same concern means it’s a real issue. “Let me come back with a plan that phases this in.”'],
    ['An exec thinks you’re recommending a price change. You’re recommending a longer trial.', 'hold', 'It’s a misunderstanding, clarify, don’t pivot.'],
    ['Finance mentions a hiring freeze you didn’t know about, and your plan needs a new hire.', 'pivot', 'The objection reveals a constraint you didn’t know about. Adapt the plan.'],
    ['One VP’s gut says enterprise buyers decide fast. Your data across 200 deals says otherwise.', 'hold', 'One person’s opinion vs. the data: respectfully show the data.'],
    ['“The timing isn’t great.” Valid, but waiting costs $2M of ARR.', 'hold', 'Valid concern that doesn’t change the recommendation: acknowledge, then redirect. The cost of waiting is higher than the cost of acting.'],
  ];
  const PRESSURE = [
    ['“Present this in 5 minutes” (you prepared for 30)', ['Panic and rush through all 20 slides', 'Skip to slide 15 without context', 'Apologize: “Sorry, I prepared a lot more…”'], 'Go straight to the exec summary: Situation, Complication, Resolution in 60 seconds. Then stop and ask where they want to go deeper, with backup slides ready.'],
    ['A senior exec joins late and asks you to restart', ['Restart from slide 1 and bore everyone', 'Panic'], 'Give a 30-second version, recommendation, context, impact, where you are, then ask the room: “Did I miss anything important?”'],
    ['“I don’t know the answer”', ['Make something up', 'Say “I don’t know” and stop', 'Get defensive: “That wasn’t in scope…”'], '“I don’t have that data here, but I can get it by [time]. My hypothesis is [X], let me confirm.” Honest, action-oriented, still thinking.'],
    ['The meeting goes off the rails', ['Let it run until time is up', 'Interrupt rudely', 'Sit silently'], '“That’s an important topic. For today’s decision on [X], should we table [Y] and I’ll follow up separately?”, unless the debate is productive: your job is good decisions, not your agenda.'],
    ['Someone attacks your methodology', ['Get defensive: “If you look at slide 47…”', 'Argue', 'Fold: “You’re right, it’s probably all wrong.”'], '“Walk me through your concern.” Listen. Explain how you approached it. “Does that address it?” Then redirect to the decision.'],
    ['The audience is far more senior than expected', ['Panic', 'Apologize for not preparing more', 'Over-explain everything'], 'Be more concise. Lead with the one-sentence recommendation, then offer: “Happy to go deeper on any part of that.” Let them direct.'],
  ];

  function confTier(v) {
    if (v > 95) return { tier: 'Overconfident', tag: 'bad', lang: '“This will definitely…” / “I guarantee…”', ex: 'Executives smell BS. Unless you have proof, calibrate down: “This will improve conversion by 15–20%, based on similar changes we’ve tested.”' };
    if (v > 80) return { tier: 'High confidence', tag: 'good', lang: '“This will…” / “We should…” / “I recommend…”', ex: '“Extending trials to 90 days will improve conversion. We saw this exact pattern when we tested 75-day trials last year.”' };
    if (v >= 50) return { tier: 'Medium confidence', tag: 'accent', lang: '“This is likely to…” / “Based on the data, we should…” / “I expect…”', ex: '“Extending trials is likely to improve conversion by 15–20%. The main uncertainty is whether sales will engage earlier if they have more time.”' };
    return { tier: 'Low confidence', tag: 'warn', lang: '“This might…” / “Early data suggests…” / “We should test…”', ex: '“This might improve conversion, but we need to test it. Early data suggests 15%, but the sample is small.”, still a recommendation: test it.' };
  }

  const ch5 = {
    slug: 'ch5', n: 5, short: 'Delivery',
    title: 'Delivery',
    tagline: 'Perfect analysis delivered poorly is worthless. Good analysis delivered with confidence changes outcomes.',
    sections: [['language', 'Language of authority'], ['silence', 'When to shut up'], ['pushback', 'Handling pushback'], ['pressure', 'Under pressure'], ['drill', '1-minute drill']],
    takeaways: [
      '<b>Use confident language:</b> “I recommend…”, not “maybe we could consider…”.',
      '<b>Calibrate your confidence:</b> match your language to your certainty (high / medium / low).',
      '<b>Silence is a tool:</b> after making your point, stop. Let it land.',
      '<b>Pushback is engagement:</b> Acknowledge → Clarify → Address → Redirect.',
      '<b>Pressure reveals character:</b> stay calm, be honest when you don’t know, focus on helping them decide.',
      '<b>You’re not there to be perfect</b>, you’re there to reduce uncertainty and enable better decisions.',
    ],
    html() {
      return `
      ${section('language', '01', 'The language of authority', `
        <div class="grid3">
          <div class="card"><span class="tag good">Confident</span><p style="margin:8px 0 0">“Based on the data, I recommend we extend enterprise trials to 90 days.”</p></div>
          <div class="card"><span class="tag bad">Arrogant</span><p style="margin:8px 0 0">“Obviously, we need to extend trials. I don’t know why we haven’t already.”</p></div>
          <div class="card"><span class="tag warn">Weak</span><p style="margin:8px 0 0">“I think maybe we could potentially consider extending trials, if that makes sense?”</p></div>
        </div>
        ${widget('Hedge detector', `
          <div class="btn-row" style="margin-bottom:10px">${[['before', 'Load “before”'], ['after', 'Load “after”'], ['sorry', 'Load “apologetic”']].map(([k, l]) => `<button class="chip" data-hp="${k}">${l}</button>`).join('')}</div>
          <textarea class="big" id="hedgeIn" rows="4" aria-label="Paste what you plan to say"></textarea>
          <div class="legend-inline"><span class="l-hedge">Hedge</span><span class="l-bad">Apology / undermining / overconfidence</span><span class="l-pass">Passive voice</span><span class="l-good">Confident</span></div>
          <div class="annotated" id="hedgeOut"></div>
          <div class="grid2" style="margin-top:16px;grid-template-columns:minmax(0,1.3fr) minmax(0,1fr)">
            <div><p class="chart-title" id="hedgeTitle"></p><p class="chart-sub">Count by type · goal: 0 hedges, 0 apologies, 3+ confident statements</p><div id="hedgeChart"></div></div>
            <div><div class="kpis" style="grid-template-columns:1fr"><div class="kpi accent"><div class="k-label">Authority score</div><div class="k-value" id="hedgeScore"></div><div class="k-sub" id="hedgeSub"></div></div></div></div>
          </div>`, 'Paste a paragraph from your last presentation. Every hedge says “I don’t want to be wrong”.')}
        ${widget('Calibrate your confidence', `
          <div class="range-row" style="grid-template-columns:150px 1fr 54px"><label for="confR">How sure are you?</label><input type="range" id="confR" min="10" max="100" step="1" value="72"><output id="confOut"></output></div>
          <div id="confStrip" style="margin:12px 0"></div>
          <div id="confPanel"></div>`)}`)}

      ${section('silence', '02', 'When to shut up', `
        <p>Silence is one of the most powerful tools you have, and most analysts are terrified of it. After stating your recommendation, <b>stop</b>. It gives them time to process, shows confidence, invites engagement and keeps you from undermining yourself.</p>
        ${cmp('“I recommend extending trials to 90 days. I mean, that’s based on the data we have, and there might be other factors, and obviously we’d want to validate this, but…”', '“I recommend extending enterprise trials to 90 days.” [Pause. Wait for a response.]')}
        ${widget('Silence trainer', `
          <p>Say your recommendation out loud, then press start and stay silent. It feels like 30 seconds; it’s usually 3–5 before someone speaks.</p>
          <div class="grid2" style="grid-template-columns:auto 1fr;align-items:center;gap:24px">
            <div><div class="timer-face" id="silFace">0.0s</div><div class="btn-row" style="margin-top:10px"><button class="btn primary" id="silStart">Start silence</button><button class="btn" id="silStop">Stop</button></div></div>
            <div><p id="silMsg" style="font-weight:650;margin:0"></p></div>
          </div>
          <div class="zone-track" id="silTrack">
            <div style="flex:2;background:var(--surface-3)">Pause</div>
            <div style="flex:3;background:var(--accent-soft)">Let it land</div>
            <div style="flex:5;background:var(--good-soft)">Add one sentence, if needed</div>
            <div style="flex:2;background:var(--warn-soft)">Break it</div>
            <span class="cursor" id="silCursor" style="left:0"></span>
          </div>
          <div class="zone-scale"><span>0s</span><span>2s</span><span>5s</span><span>10s</span><span>12s</span></div>`)}
        <div class="grid2">
          <div class="card"><h4>Reading the room</h4><ul class="small">
            <li><b>Silence + nodding:</b> processing and agreeing. Don’t interrupt.</li>
            <li><b>Silence + frowning:</b> skeptical. Wait for the concern, then address it.</li>
            <li><b>Silence + looking at each other:</b> they’re communicating. Let them.</li>
            <li><b>Silence + looking at you:</b> they want more. Now elaborate.</li></ul></div>
          <div class="card"><h4>The rules</h4><ul class="small">
            <li><b>After a question:</b> pause 2 seconds, then answer.</li>
            <li><b>When they debate in the right direction:</b> don’t interrupt to agree, they trust their peers more than you.</li>
            <li><b>Nervous elaboration trap:</b> count to 5 before adding anything.</li>
            <li><b>Do speak</b> when asked directly, when they misread your data, or after 10+ seconds of expectant silence.</li></ul></div>
        </div>`)}

      ${section('pushback', '03', 'How to handle pushback', `
        <p><b>Pushback is not rejection, it’s engagement.</b> The worst response is no response: polite nods, then nothing happens.</p>
        ${widget('Pushback simulator', `
          <div class="chip-row" id="objChips" style="margin-bottom:14px">${OBJECTIONS.map((o, i) => `<button class="chip" data-obj="${i}" aria-pressed="${i === 0}">${o.label}</button>`).join('')}</div>
          <p class="small"><b>What they mean:</b> <span id="objMeans"></span></p>
          <div class="step-cards" id="objSteps"></div>
          <div class="btn-row"><button class="btn primary" id="objNext">Next step</button><button class="btn" id="objAll">Show all</button></div>
          <div id="objDialog" class="reveal" style="margin-top:16px"><span class="ctl-label">In real life</span><div class="dialogue" id="objDialogInner"></div></div>`)}
        ${widget('Pivot or hold your ground?', `<div id="pivotQuiz">${PIVOT_QUIZ.map(([q], i) => `<div class="quiz-q" data-q="${i}"><p style="margin:0 0 8px">${q}</p><div class="btn-row"><button class="btn" data-a="pivot">Pivot</button><button class="btn" data-a="hold">Hold your ground</button></div><div class="fb" hidden></div></div>`).join('')}</div>`, 'Never: get defensive, dismiss, argue, or fold immediately. Stay calm, acknowledge, clarify, address, redirect.')}`)}

      ${section('pressure', '04', 'Presenting under pressure', `
        <p>The real test is when things don’t go to plan. What senior people evaluate isn’t “is this analysis perfect?” but <b>“can I trust this person to handle ambiguity and pressure?”</b></p>
        ${PRESSURE.map(([t, donts, d]) => `<details class="acc"><summary>${t}</summary><div class="acc-body">${donts.map((x) => cmp(x, '')).join('')}${cmp('', d)}</div></details>`).join('')}
        <div class="callout" style="margin-top:16px"><b>The mental game.</b> Pressure means they care. Your job is to reduce uncertainty, not be perfect. Breathe, slower beats flustered. You know this better than anyone in the room.</div>`)}

      ${section('drill', '05', 'The 1-minute drill', `
        ${widget('Deliver your whole message in 60 seconds', `
          <p>Situation → Complication → Resolution. Start the timer and say it out loud. If you can’t finish, your message isn’t clear enough yet.</p>
          <div class="grid2" style="grid-template-columns:auto 1fr;align-items:center;gap:24px">
            <div><div class="timer-face" id="drFace">60</div><div class="btn-row" style="margin-top:10px"><button class="btn primary" id="drStart">Start</button><button class="btn" id="drReset">Reset</button></div></div>
            <div><ol class="steps small" style="margin:0"><li><div><b>Situation</b>, one sentence of context</div></li><li><div><b>Complication</b>, what changed, the tension</div></li><li><div><b>Resolution</b>, cause, recommendation, impact, next step</div></li></ol></div>
          </div>
          <div class="meter" style="margin-top:14px"><i id="drMeter" style="width:100%"></i></div>`)}
        <div class="card"><h3>Final thoughts</h3>
          <p>The difference between junior and senior analysts isn’t technical skill. It’s leading with recommendations, making charts that communicate, designing slides that guide the eye, speaking with confidence without arrogance, and treating pushback as a conversation.</p>
          <p style="margin:0"><b>You already have the analytical skills. This playbook gives you the communication skills to make your analysis matter. Now go use it.</b></p></div>`)}
      `;
    },
    mount(root) {
      // ---------- hedge detector
      const inp = $('#hedgeIn', root);
      const analyze = () => {
        const text = inp.value;
        const marks = [];
        LEX.forEach(([cls, re]) => {
          re.lastIndex = 0;
          let m;
          while ((m = re.exec(text))) {
            const s = m.index, e = s + m[0].length;
            if (!marks.some((k) => s < k.e && e > k.s)) marks.push({ s, e, cls });
          }
        });
        marks.sort((a, b) => a.s - b.s);
        let html = '', pos = 0;
        marks.forEach((k) => { html += esc(text.slice(pos, k.s)) + `<mark class="${k.cls}">${esc(text.slice(k.s, k.e))}</mark>`; pos = k.e; });
        html += esc(text.slice(pos));
        $('#hedgeOut', root).innerHTML = html || '<span class="muted">Type or paste something to analyze.</span>';
        const cnt = (c) => marks.filter((k) => k.cls === c).length;
        const rows = [['Hedges', cnt('hedge')], ['Apologies', cnt('apology')], ['Undermining', cnt('undermine')], ['Overconfidence', cnt('over')], ['Passive voice', cnt('passive')], ['Confident', cnt('confident')]];
        const bad = rows.slice(0, 5).reduce((a, r) => a + r[1], 0), good = rows[5][1];
        $('#hedgeChart', root).innerHTML = C.hbars({ labels: rows.map((r) => r[0]), values: rows.map((r) => r[1]), max: Math.max(4, ...rows.map((r) => r[1])), colors: (i) => (i === 5 ? 'var(--accent)' : 'var(--context)'), fmt: (v) => String(v), labelW: 120, rowH: 30, w: 460, strong: (i) => i === 5 });
        const score = Math.max(0, Math.min(100, Math.round(50 + good * 15 - bad * 12)));
        $('#hedgeScore', root).textContent = text.trim() ? score : '-';
        $('#hedgeSub', root).textContent = !text.trim() ? '' : bad === 0 && good >= 3 ? 'Trusted-advisor language' : bad === 0 ? 'Clean, add a clear “I recommend…”' : `${bad} credibility killer${bad > 1 ? 's' : ''} to remove`;
        $('#hedgeTitle', root).textContent = !text.trim() ? 'Nothing to analyze yet' : bad > good ? `${bad} credibility killers vs. ${good} confident statement${good === 1 ? '' : 's'}` : `${good} confident statement${good === 1 ? '' : 's'}, ${bad} credibility killer${bad === 1 ? '' : 's'}`;
      };
      inp.value = HEDGE_PRESETS.before;
      inp.addEventListener('input', analyze);
      $$('[data-hp]', root).forEach((b) => b.addEventListener('click', () => { inp.value = HEDGE_PRESETS[b.dataset.hp]; analyze(); }));
      analyze();

      // ---------- confidence calibrator
      const renderConf = () => {
        const v = +$('#confR', root).value;
        $('#confOut', root).textContent = v + '%';
        const t = confTier(v);
        const W = 640, H = 54, X = C.lin(10, 100, 0, W);
        const zones = [[10, 50, 'Low', 'var(--warn-soft)'], [50, 80, 'Medium', 'var(--accent-soft)'], [80, 95, 'High', 'var(--good-soft)'], [95, 100, 'Over', 'var(--bad-soft)']];
        let s = `<svg viewBox="0 0 ${W} ${H}" class="chart" role="img" aria-label="Confidence zones">`;
        zones.forEach(([a, b, l, c]) => (s += `<rect x="${X(a)}" y="4" width="${X(b) - X(a) - 2}" height="28" rx="5" fill="${c}"/><text x="${(X(a) + X(b)) / 2}" y="22" class="tick" text-anchor="middle" style="fill:var(--ink-2);font-weight:600">${l}</text>`));
        s += `<line x1="${X(v)}" x2="${X(v)}" y1="0" y2="36" stroke="var(--ink)" stroke-width="3" stroke-linecap="round"/>`;
        [10, 50, 80, 100].forEach((d) => (s += `<text x="${Math.min(W - 12, Math.max(12, X(d)))}" y="50" class="tick" text-anchor="middle">${d}%</text>`));
        $('#confStrip', root).innerHTML = s + '</svg>';
        $('#confPanel', root).innerHTML = `<p><span class="tag ${t.tag}">${t.tier}</span> &nbsp;<b>Use:</b> ${t.lang}</p><div class="sentence-out">${t.ex}</div>`;
      };
      $('#confR', root).addEventListener('input', renderConf);
      renderConf();

      // ---------- silence trainer
      let silT0 = 0, silRaf = 0;
      const silMsg = (s) => (s < 2 ? 'Pause. Let them process.' : s < 5 ? 'Let it land. Count to 5 in your head.' : s < 10 ? 'If they’re thinking, keep waiting. If they look at you expectantly, add one sentence.' : 'Past 10 seconds and they’re clearly waiting? Break the silence.');
      const silTick = () => {
        const s = (performance.now() - silT0) / 1000;
        $('#silFace', root).textContent = s.toFixed(1) + 's';
        $('#silCursor', root).style.left = `calc(${Math.min(100, (s / 12) * 100)}% - 1.5px)`;
        $('#silMsg', root).textContent = silMsg(s);
        if (s < 30) silRaf = requestAnimationFrame(silTick);
      };
      $('#silStart', root).addEventListener('click', () => { cancelAnimationFrame(silRaf); silT0 = performance.now(); silTick(); });
      $('#silStop', root).addEventListener('click', () => {
        cancelAnimationFrame(silRaf);
        const s = parseFloat($('#silFace', root).textContent);
        if (s > 0) $('#silMsg', root).textContent = s < 3 ? `You broke the silence after ${s.toFixed(1)}s. Next time, hold it a bit longer.` : `${s.toFixed(1)}s of silence. That’s what confidence sounds like.`;
      });
      $('#silMsg', root).textContent = 'Ready when you are.';

      // ---------- pushback simulator
      let obj = 0, stepN = 1;
      const STEP_NAMES = ['Acknowledge', 'Clarify', 'Address', 'Redirect'];
      const renderObj = () => {
        const o = OBJECTIONS[obj];
        $$('#objChips .chip', root).forEach((c) => c.setAttribute('aria-pressed', String(+c.dataset.obj === obj)));
        $('#objMeans', root).textContent = o.means;
        $('#objSteps', root).innerHTML = o.steps.map((s, i) => `<div class="step-card ${i < stepN ? '' : 'hidden'}"><div class="s-k">${i + 1} · ${STEP_NAMES[i]}</div>${i < stepN ? s : '…'}</div>`).join('');
        $('#objDialogInner', root).innerHTML = o.dialog.map(([w, t]) => `<p class="${w}"><b>${w === 'you' ? 'You' : 'Them'}</b>${t}</p>`).join('');
        $('#objDialog', root).classList.toggle('on', stepN >= 4);
        $('#objNext', root).disabled = stepN >= 4;
      };
      $$('#objChips .chip', root).forEach((c) => c.addEventListener('click', () => { obj = +c.dataset.obj; stepN = 1; renderObj(); }));
      $('#objNext', root).addEventListener('click', () => { stepN = Math.min(4, stepN + 1); renderObj(); });
      $('#objAll', root).addEventListener('click', () => { stepN = 4; renderObj(); });
      renderObj();

      // ---------- pivot quiz
      $$('#pivotQuiz .quiz-q', root).forEach((q) => {
        const [, ans, why] = PIVOT_QUIZ[+q.dataset.q];
        $$('[data-a]', q).forEach((b) => b.addEventListener('click', () => {
          const ok = b.dataset.a === ans;
          const fb = $('.fb', q);
          fb.hidden = false;
          fb.className = 'fb ' + (ok ? 'ok' : 'ko');
          fb.innerHTML = `<b>${ok ? 'Right' : 'Not quite'}, ${ans === 'pivot' ? 'pivot' : 'hold your ground'}.</b> ${why}`;
        }));
      });

      // ---------- 1-minute drill
      let drT0 = 0, drRaf = 0;
      const drTick = () => {
        const left = Math.max(0, 60 - (performance.now() - drT0) / 1000);
        $('#drFace', root).textContent = Math.ceil(left);
        const m = $('#drMeter', root);
        m.style.width = (left / 60) * 100 + '%';
        m.style.background = left < 10 ? 'var(--bad)' : 'var(--accent)';
        if (left > 0) drRaf = requestAnimationFrame(drTick); else $('#drFace', root).textContent = 'Time';
      };
      $('#drStart', root).addEventListener('click', () => { cancelAnimationFrame(drRaf); drT0 = performance.now(); drTick(); });
      $('#drReset', root).addEventListener('click', () => { cancelAnimationFrame(drRaf); $('#drFace', root).textContent = '60'; $('#drMeter', root).style.width = '100%'; $('#drMeter', root).style.background = 'var(--accent)'; });

      // cleanup timers when leaving the page
      root.addEventListener('dsp:unmount', () => { cancelAnimationFrame(silRaf); cancelAnimationFrame(drRaf); });
    },
  };

  DSP.chapters.push(ch3, ch4, ch5);
})();
