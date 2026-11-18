# Data Storytelling Playbook — interactive web app

An interactive companion to the *Data storytelling playbook* (a deep-dive largely based on Chartosaur's *Present With Data Playbook*).

Open `index.html` in a browser — no build step, no dependencies, works offline.

## What's inside

| Chapter | Interactive pieces |
| --- | --- |
| 0 · How to use this playbook | Path picker (2-hour sprint / 1-week program / just-in-time) with time-split chart and saved checklists, context adapter, progress trackers, action-item planner |
| 1 · Why analysts get ignored | Trust-equation calculator with "biggest lever" chart, caveat-stacking conviction meter, recommendation sentence builder |
| 2 · Finding the "so what?" | Insight ladder whose chart evolves level by level, ending in a trial-length slider that computes ARR recovered; "so what" formula linter; stakeholder pitch switcher |
| 3 · Making your charts for slides | Chart lab (fix an "Excel default" chart, live 5-second score), message → chart picker, pie-chart challenge, truncated-axis demo, framing & audience switchers |
| 4 · Slide design | Slide detox simulator with squint test and four-layer hierarchy highlight; exec-summary builder with 60-second read-time check |
| 5 · Delivery | Hedge detector, confidence calibrator, silence trainer, pushback simulator (Acknowledge → Clarify → Address → Redirect), pivot-or-hold quiz, 1-minute drill |

Checklists, form inputs and visited chapters are saved in the browser's `localStorage` only.

## Files

- `index.html` — shell
- `styles.css` — design tokens (light + dark), layout, components
- `charts.js` — tiny SVG chart kit (line, bar, horizontal bar, stacked, scatter, pie) with tooltips
- `core.js` — shared helpers (storage, checklists, segmented controls, tooltip)
- `chapters-a.js`, `chapters-b.js` — chapter content and interactions
- `app.js` — hash router, navigation, home page, theme toggle
