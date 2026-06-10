---
name: "Advanced Visualization Techniques"
description: "UI mockups, dashboards, advanced interactivity, generative art, simulations, math visualizations, and design system rules for producing rich generateSandboxedUi output."
allowed-tools: []
---

# Agent Visualization Skills — Volume 2: Advanced Techniques

Prerequisite: Volume 1 (SVG diagrams, basic interactive widgets, Chart.js, Mermaid).
This volume covers: UI mockups, dashboards, advanced interactivity, generative art,
simulations, math visualizations, and the design system that ties everything together.

---

## Part 0: The Tool Contract — generateSandboxedUi

Everything in this volume ships through the `generateSandboxedUi` tool. The UI
streams as you generate it, so emit the parameters in this EXACT order:

1. `initialHeight` — estimated height of the finished UI in px.
2. `placeholderMessages` — 2-4 short, playful progress messages.
3. `css` — ALL styles, up front. The user sees a placeholder until css is complete,
   so keep it lean and put every style here for the css-first reveal.
4. `html` — clean body markup, streamed in live. No `<style>` blocks (the css
   parameter owns all styles), no monolithic inline `<script>` blocks.
5. `jsFunctions` — named function declarations: the reusable toolbox of behavior.
6. `jsExpressions` — small statements invoking those functions, applied one-by-one
   so the user watches each take effect.

Write parameterized generators in `jsFunctions` (`drawWing(color)`, not
`drawRedWing()`). A well-parameterized toolbox lets a later refinement turn —
"make the wings red" — append ONE new expression to `jsExpressions` instead of
regenerating the whole document.

The sandbox iframe has NO same-origin access: no localStorage, sessionStorage,
cookies, IndexedDB, or same-origin fetch. The host bridge is
`await Websandbox.connection.remote.sendPrompt({ text })` and
`await Websandbox.connection.remote.openLink({ url })` (https only). The design
system (Part 1) and an importmap for `three`, `gsap`, `d3`, and `chart.js`
(Part 7) are pre-injected.

---

## Part 1: The Design System

Every visual you produce should feel native to the host interface — not like
an embedded iframe from somewhere else. These rules apply to ALL output types.

### CSS Variables (Auto Light/Dark Mode)

```css
/* Backgrounds */
--color-background-primary    /* white in light, near-black in dark */
--color-background-secondary  /* surface cards */
--color-background-tertiary   /* page background */
--color-background-info       /* blue tint */
--color-background-danger     /* red tint */
--color-background-success    /* green tint */
--color-background-warning    /* amber tint */

/* Text */
--color-text-primary          /* main text */
--color-text-secondary        /* muted / labels */
--color-text-tertiary         /* hints / placeholders */
--color-text-info / -danger / -success / -warning

/* Borders */
--color-border-tertiary       /* default: 0.15 alpha */
--color-border-secondary      /* hover: 0.3 alpha */
--color-border-primary        /* active: 0.4 alpha */

/* Typography */
--font-sans                   /* default body font */
--font-serif                  /* editorial / blockquote only */
--font-mono                   /* code */

/* Layout */
--border-radius-md            /* 8px - most elements */
--border-radius-lg            /* 12px - cards */
--border-radius-xl            /* 16px - large containers */
```

**Critical rule**: Never hardcode colors like `#333` or `#fff` in HTML.
They break in the opposite mode. Always use CSS variables.

### Typography Rules
- h1 = 22px, h2 = 18px, h3 = 16px — all font-weight: 500
- Body = 16px, weight 400, line-height: 1.7
- Only two weights: 400 (regular) and 500 (medium). Never 600 or 700.
- Sentence case everywhere. Never Title Case or ALL CAPS.
- No mid-sentence bolding. Use `code style` for entity/class/function names.
- No font-size below 11px anywhere.

### Component Tokens
- Borders: `0.5px solid var(--color-border-tertiary)`
- Cards: `background: var(--color-background-primary)`,
  `border: 0.5px solid var(--color-border-tertiary)`,
  `border-radius: var(--border-radius-lg)`, `padding: 1rem 1.25rem`
- No gradients, drop shadows, blur, glow, or neon effects
- No emoji — use CSS shapes or SVG paths for icons
- Background of outer container is always transparent

### Number Formatting
Always round displayed numbers. JavaScript float math leaks artifacts:
`0.1 + 0.2 = 0.30000000000000004`. Every number on screen must go through
`Math.round()`, `.toFixed(n)`, or `Intl.NumberFormat`.

---

## Part 2: UI Mockups

For when the user asks you to design or prototype a UI.

### When to Use
- "Design a settings page for..."
- "Mock up a dashboard"
- "What should this form look like?"
- "Show me a card layout for..."
- Prototyping before building

### Presentation Rules

**Contained mockups** (mobile screens, modals, chat threads, single cards):
Wrap in a background surface so they don't float naked:
```html
<div style="background: var(--color-background-secondary);
            border-radius: var(--border-radius-lg);
            padding: 2rem; display: flex; justify-content: center;">
  <!-- Your mockup inside -->
</div>
```

**Full-width mockups** (dashboards, settings pages, data tables):
No wrapper needed — they naturally fill the viewport.

**Where the styles go**: repeated patterns become classes in the css parameter;
the html parameter stays clean markup. The metric cards below model the
translation — the remaining patterns in this part are shown with inline style
attributes for compactness, and you should lift them into css-parameter classes
the same way.

### Metric Cards (for dashboards)

css parameter:
```css
.metric-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 12px;
  margin-bottom: 1.5rem;
}
.metric-card {
  background: var(--color-background-secondary);
  border-radius: var(--border-radius-md);
  padding: 1rem;
}
.metric-label {
  font-size: 13px;
  color: var(--color-text-secondary);
  margin-bottom: 4px;
}
.metric-value { font-size: 24px; font-weight: 500; }
```

html parameter:
```html
<div class="metric-grid">
  <div class="metric-card">
    <div class="metric-label">Total revenue</div>
    <div class="metric-value">$142,800</div>
  </div>
  <div class="metric-card">
    <div class="metric-label">Active users</div>
    <div class="metric-value">8,421</div>
  </div>
</div>
```

### Contact / Data Record Card
```html
<div style="background: var(--color-background-primary);
            border-radius: var(--border-radius-lg);
            border: 0.5px solid var(--color-border-tertiary);
            padding: 1rem 1.25rem;">

  <div style="display: flex; align-items: center; gap: 12px;
              margin-bottom: 16px;">
    <!-- Avatar circle with initials -->
    <div style="width: 44px; height: 44px; border-radius: 50%;
                background: var(--color-background-info);
                display: flex; align-items: center; justify-content: center;
                font-weight: 500; font-size: 14px;
                color: var(--color-text-info);">JD</div>
    <div>
      <p style="font-weight: 500; font-size: 15px; margin: 0;">Jane Doe</p>
      <p style="font-size: 13px; color: var(--color-text-secondary);
                margin: 0;">Lead Engineer</p>
    </div>
  </div>

  <div style="border-top: 0.5px solid var(--color-border-tertiary);
              padding-top: 12px;">
    <table style="width: 100%; font-size: 13px;">
      <tr>
        <td style="color: var(--color-text-secondary); padding: 4px 0;">
          Email</td>
        <td style="text-align: right; padding: 4px 0;
                   color: var(--color-text-info);">jane@company.com</td>
      </tr>
    </table>
  </div>
</div>
```

### Badges and Status Pills
```html
<!-- Status badge -->
<span style="display: inline-block; font-size: 12px; padding: 4px 12px;
             border-radius: var(--border-radius-md);
             background: var(--color-background-success);
             color: var(--color-text-success);">Active</span>

<!-- Featured accent (the ONLY case where 2px border is allowed) -->
<div style="border: 2px solid var(--color-border-info);
            border-radius: var(--border-radius-lg);
            padding: 1rem 1.25rem;">
  <span style="font-size: 12px; padding: 4px 12px;
               border-radius: var(--border-radius-md);
               background: var(--color-background-info);
               color: var(--color-text-info);">Most popular</span>
</div>
```

### Form Elements
Inputs, selects, textareas, buttons, and range sliders are pre-styled
in the host environment. Write bare tags — they inherit correct styling:
- Text inputs: 36px height, hover/focus states built in
- Range sliders: 4px track + 18px thumb
- Buttons: transparent bg, 0.5px border, hover/active states

**Never use `<form>` tags.** Use `onClick` / `onChange` handlers directly.

### Comparison Cards
For "help me choose between X and Y":
```html
<div style="display: grid; grid-template-columns:
            repeat(auto-fit, minmax(160px, 1fr)); gap: 12px;">

  <div style="background: var(--color-background-primary);
              border: 0.5px solid var(--color-border-tertiary);
              border-radius: var(--border-radius-lg);
              padding: 1rem 1.25rem;">
    <h3 style="font-size: 16px; font-weight: 500; margin: 0 0 8px;">
      Option A</h3>
    <p style="font-size: 13px; color: var(--color-text-secondary);
              margin: 0;">Description here</p>
  </div>

  <!-- Repeat for Option B, C... -->
</div>
```

---

## Part 3: Advanced Interactive Widgets

### Simulations and Physics
For teaching physics, algorithms, or systems behavior with real-time updates.

**Pattern: Animation Loop with Controls**

css parameter:
```css
.sim-controls {
  display: flex; align-items: center; gap: 16px;
  margin: 12px 0; font-size: 13px;
  color: var(--color-text-secondary);
}
#sim {
  width: 100%; height: 300px;
  border-radius: var(--border-radius-md);
  background: var(--color-background-secondary);
}
```

html parameter:
```html
<canvas id="sim"></canvas>

<div class="sim-controls">
  <button onclick="toggleSim()">Play / Pause</button>
  <label>Speed
    <input type="range" min="1" max="10" value="5" id="speed"
           oninput="setSimSpeed(+this.value)">
  </label>
  <button onclick="resetSim()">Reset</button>
</div>
```

jsFunctions parameter:
```js
function initSim(count) {
  const canvas = document.getElementById('sim');
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
  window.sim = {
    canvas,
    ctx: canvas.getContext('2d'),
    running: true,
    speed: 5,
    particles: Array.from({ length: count }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2
    }))
  };
}

function stepSim() {
  const { canvas, ctx, particles, speed, running } = window.sim;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (const p of particles) {
    p.x += p.vx * speed * 0.2;
    p.y += p.vy * speed * 0.2;
    if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
    if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#534AB7';
    ctx.fill();
  }
  if (running) requestAnimationFrame(stepSim);
}

function setSimSpeed(value) { window.sim.speed = value; }

function toggleSim() {
  window.sim.running = !window.sim.running;
  if (window.sim.running) stepSim();
}

function resetSim() {
  const wasRunning = window.sim.running;
  initSim(window.sim.particles.length);
  if (!wasRunning) stepSim();
}
```

jsExpressions parameter:
```js
initSim(50);
stepSim();
```

### Math Visualizations
For plotting functions, showing geometric relationships, or exploring equations.

**Pattern: Function Plotter with SVG**

css parameter:
```css
.plot-controls {
  display: flex; gap: 16px; align-items: center;
  margin: 12px 0; font-size: 13px;
  color: var(--color-text-secondary);
}
.plot-controls input[type="number"] { width: 60px; }
.plot-controls input[type="range"] { flex: 1; }
```

html parameter:
```html
<svg id="plot" width="100%" viewBox="0 0 680 400">
  <!-- Grid -->
  <line x1="60" y1="200" x2="640" y2="200"
        stroke="var(--color-border-tertiary)" stroke-width="0.5"/>
  <line x1="340" y1="20" x2="340" y2="380"
        stroke="var(--color-border-tertiary)" stroke-width="0.5"/>
  <!-- Axes labels -->
  <text x="645" y="196" font-size="12"
        fill="var(--color-text-tertiary)">x</text>
  <text x="345" y="16" font-size="12"
        fill="var(--color-text-tertiary)">y</text>
  <!-- Function path drawn by JS -->
  <path id="fn-path" fill="none" stroke="#534AB7" stroke-width="2"/>
</svg>

<div class="plot-controls">
  <label>f(x) = sin(
    <input type="number" id="freq" value="1" min="0.1" max="10" step="0.1"
           oninput="plotFn()">x)
  </label>
  <label>Amplitude
    <input type="range" id="amp" min="0.1" max="3" value="1" step="0.1"
           oninput="plotFn()">
  </label>
</div>
```

jsFunctions parameter:
```js
function plotFn() {
  const freq = +document.getElementById('freq').value;
  const amp = +document.getElementById('amp').value;
  const xMin = -5, xMax = 5, yMin = -3, yMax = 3;
  const toSvgX = x => 60 + (x - xMin) / (xMax - xMin) * 580;
  const toSvgY = y => 20 + (yMax - y) / (yMax - yMin) * 360;
  let d = '';
  for (let px = 0; px <= 580; px++) {
    const x = xMin + px / 580 * (xMax - xMin);
    const y = amp * Math.sin(freq * x);
    d += (px === 0 ? 'M' : 'L') + toSvgX(x).toFixed(1)
       + ' ' + toSvgY(y).toFixed(1);
  }
  document.getElementById('fn-path').setAttribute('d', d);
}
```

jsExpressions parameter:
```js
plotFn();
```

### Sortable / Filterable Data Tables

css parameter:
```css
.data-table { width: 100%; border-collapse: collapse; font-size: 14px; }
.data-table th {
  text-align: left; padding: 8px 12px; font-weight: 500;
  border-bottom: 0.5px solid var(--color-border-secondary);
  color: var(--color-text-secondary); cursor: pointer;
  user-select: none; font-size: 12px;
}
.data-table th:hover { color: var(--color-text-primary); }
.data-table td {
  padding: 8px 12px;
  border-bottom: 0.5px solid var(--color-border-tertiary);
}
.table-filter { width: 100%; margin-bottom: 12px; }
.status-pill {
  font-size: 12px; padding: 2px 10px;
  border-radius: var(--border-radius-md);
}
.status-pill.active {
  background: var(--color-background-success);
  color: var(--color-text-success);
}
.status-pill.paused {
  background: var(--color-background-warning);
  color: var(--color-text-warning);
}
```

html parameter:
```html
<input type="text" class="table-filter" placeholder="Filter..."
       oninput="filterTable(this.value)">

<table class="data-table" id="table">
  <thead>
    <tr>
      <th onclick="sortTable(0)">Name</th>
      <th onclick="sortTable(1)">Value</th>
      <th onclick="sortTable(2)">Status</th>
    </tr>
  </thead>
  <tbody id="tbody">
    <!-- Rows populated by JS -->
  </tbody>
</table>
```

jsFunctions parameter:
```js
function initTable(rows) {
  window.tableData = rows;
  window.sortCol = -1;
  window.sortAsc = true;
  renderRows(rows);
}

function renderRows(rows) {
  document.getElementById('tbody').innerHTML = rows.map(r =>
    `<tr><td>${r[0]}</td><td>${r[1]}</td>
     <td><span class="status-pill ${r[2] === 'Active' ? 'active' : 'paused'}">${r[2]}</span>
     </td></tr>`
  ).join('');
}

function sortTable(col) {
  window.sortAsc = window.sortCol === col ? !window.sortAsc : true;
  window.sortCol = col;
  const asc = window.sortAsc;
  window.tableData.sort((a, b) => {
    if (a[col] < b[col]) return asc ? -1 : 1;
    if (a[col] > b[col]) return asc ? 1 : -1;
    return 0;
  });
  renderRows(window.tableData);
}

function filterTable(q) {
  const low = q.toLowerCase();
  renderRows(window.tableData.filter(r =>
    r.some(c => String(c).toLowerCase().includes(low))));
}
```

jsExpressions parameter:
```js
initTable([
  ['Alpha', 42, 'Active'],
  ['Beta', 18, 'Paused'],
  ['Gamma', 91, 'Active'],
]);
```

---

## Part 4: Chart.js — Advanced Patterns

### Dark Mode Awareness
```javascript
const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
const textColor = isDark ? '#c2c0b6' : '#3d3d3a';
const gridColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';
const tooltipBg = isDark ? '#2C2C2A' : '#fff';
```

Canvas cannot read CSS variables — always detect dark mode and use
hardcoded hex values.

### Wrapper Pattern (Critical for Sizing)
```html
<div style="position: relative; width: 100%; height: 300px;">
  <canvas id="chart"></canvas>
</div>
```
- Height goes on the wrapper div ONLY, never on canvas.
- Always set `responsive: true, maintainAspectRatio: false`.
- For horizontal bar charts: height = (bars x 40) + 80 pixels.

### Custom Legend (Always Use This)
Disable Chart.js default legend and build HTML:
```javascript
plugins: { legend: { display: false } }
```
```html
<div style="display: flex; flex-wrap: wrap; gap: 16px;
            margin-bottom: 8px; font-size: 12px;
            color: var(--color-text-secondary);">
  <span style="display: flex; align-items: center; gap: 4px;">
    <span style="width: 10px; height: 10px; border-radius: 2px;
                 background: #534AB7;"></span>Series A — 65%
  </span>
  <span style="display: flex; align-items: center; gap: 4px;">
    <span style="width: 10px; height: 10px; border-radius: 2px;
                 background: #0F6E56;"></span>Series B — 35%
  </span>
</div>
```

### Dashboard Layout
Metric cards on top -> chart below -> drill-down buttons wired to the
sendPrompt bridge (Part 6):
```html
<!-- Metric cards grid -->
<div style="display: grid;
            grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
            gap: 12px; margin-bottom: 1.5rem;">
  <!-- cards here -->
</div>

<!-- Chart (no card wrapper) -->
<div style="position: relative; width: 100%; height: 300px;">
  <canvas id="chart"></canvas>
</div>
```

### Chart Type Selection Guide
| Data pattern               | Chart type          |
|----------------------------|---------------------|
| Trend over time            | Line                |
| Category comparison        | Vertical bar        |
| Ranking (few items)        | Horizontal bar      |
| Part of whole              | Doughnut            |
| Distribution               | Histogram (bar)     |
| Correlation (2 variables)  | Scatter             |
| Multi-variable comparison  | Radar               |
| Range / uncertainty        | Line with fill area |

---

## Part 5: Generative Art and Illustration

For when the user asks for something creative, decorative, or aesthetic.

### When to Use
- "Draw me a sunset" / "Create a pattern"
- Decorative headers or visual breaks
- Mood illustrations for creative writing
- Abstract visualizations of data or music

### Rules (Different from Diagrams)
- Fill the canvas — art should feel rich, not sparse
- Bold colors are encouraged. You can use custom hex freely.
- Layered overlapping shapes create depth
- Organic forms with `<path>` curves, `<ellipse>`, `<circle>`
- Texture via repetition (hatching, dots, parallel lines)
- Geometric patterns with `<g transform="rotate()">`
- NO gradients, shadows, blur, or glow (still flat aesthetic)

### Pattern: Geometric Art
```svg
<svg width="100%" viewBox="0 0 680 400">
  <!-- Background shapes -->
  <circle cx="200" cy="200" r="150" fill="#EEEDFE" opacity="0.8"/>
  <circle cx="480" cy="180" r="120" fill="#E1F5EE" opacity="0.8"/>

  <!-- Overlapping geometric forms -->
  <rect x="150" y="100" width="200" height="200" rx="8"
        fill="#CECBF6" opacity="0.6"
        transform="rotate(15 250 200)"/>
  <rect x="320" y="80" width="180" height="180" rx="8"
        fill="#9FE1CB" opacity="0.6"
        transform="rotate(-10 410 170)"/>

  <!-- Detail lines -->
  <line x1="100" y1="300" x2="580" y2="300"
        stroke="#534AB7" stroke-width="0.5" opacity="0.3"/>
  <line x1="100" y1="310" x2="580" y2="310"
        stroke="#534AB7" stroke-width="0.5" opacity="0.2"/>
</svg>
```

### Pattern: Radial Symmetry
```svg
<svg width="100%" viewBox="0 0 680 680">
  <g transform="translate(340 340)">
    <!-- Repeat a shape at angular intervals -->
    <g transform="rotate(0)">
      <ellipse cx="0" cy="-120" rx="30" ry="80"
               fill="#FAECE7" stroke="#993C1D" stroke-width="0.5"/>
    </g>
    <g transform="rotate(45)">
      <ellipse cx="0" cy="-120" rx="30" ry="80"
               fill="#FBEAF0" stroke="#993556" stroke-width="0.5"/>
    </g>
    <!-- ... repeat for 90, 135, 180, 225, 270, 315 -->
  </g>
</svg>
```

### Pattern: Landscape with Layered Shapes
For physical scenes, use ALL hardcoded hex (no theme classes):
```svg
<svg width="100%" viewBox="0 0 680 400">
  <!-- Sky -->
  <rect x="0" y="0" width="680" height="250" fill="#E6F1FB"/>
  <!-- Mountains -->
  <polygon points="0,250 150,100 300,250" fill="#B4B2A9"/>
  <polygon points="200,250 400,60 600,250" fill="#888780"/>
  <!-- Ground -->
  <rect x="0" y="250" width="680" height="150" fill="#C0DD97"/>
  <!-- Sun -->
  <circle cx="550" cy="80" r="40" fill="#FAC775"/>
</svg>
```

---

## Part 6: Advanced Patterns

### Tabbed / Multi-View Interfaces
Since html streams top-down, don't use `display: none` during streaming.
Instead, render all content stacked, then let a jsExpression create the tabs
once the document is complete:

css parameter:
```css
#tabs { display: flex; gap: 4px; margin-bottom: 16px; }
```

html parameter:
```html
<div id="tabs">
  <button onclick="showTab(0)">Overview</button>
  <button onclick="showTab(1)">Details</button>
  <button onclick="showTab(2)">Code</button>
</div>

<div id="panel-0"><!-- Overview content --></div>
<div id="panel-1"><!-- Details content --></div>
<div id="panel-2"><!-- Code content --></div>
```

jsFunctions parameter:
```js
function showTab(n) {
  for (let i = 0; i < 3; i++) {
    document.getElementById('panel-' + i).style.display =
      i === n ? 'block' : 'none';
  }
  document.querySelectorAll('#tabs button').forEach((b, i) => {
    b.style.fontWeight = i === n ? '500' : '400';
    b.style.color = i === n
      ? 'var(--color-text-primary)' : 'var(--color-text-tertiary)';
  });
}
```

jsExpressions parameter:
```js
showTab(0);
```

### sendPrompt — Chat-Driven Interactivity
The host bridge exposes `await Websandbox.connection.remote.sendPrompt({ text })`,
which sends a message as if the user typed it. Use it when the user's next
action benefits from AI thinking. Wire it through a named jsFunction:

jsFunctions parameter:
```js
function drillDown(text) {
  Websandbox.connection.remote.sendPrompt({ text });
}
```

html parameter:
```html
<button onclick="drillDown('Break down Q4 revenue by region')">
  Drill into Q4 ↗
</button>
<button onclick="drillDown('Explain what shear force is')">
  Learn about shear ↗
</button>
```

**Use for**: drill-downs, follow-up questions, "explain this part".
**Don't use for**: filtering, sorting, toggling — handle those in JS.
Append ` ↗` to button text when it triggers the bridge.
For external links use `await Websandbox.connection.remote.openLink({ url })`
(https only — anything else is rejected).

### Responsive Grid Pattern
```css
display: grid;
grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
gap: 12px;
```
Use `minmax(0, 1fr)` if children have large min-content that could overflow.

### CSS Animations (Subtle and Purposeful)
```css
/* Only animate transform and opacity for performance */
@keyframes fadeSlideIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Always respect user preferences */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
  }
}

/* Flowing particles / convection currents */
@keyframes flow { to { stroke-dashoffset: -20; } }
.flowing {
  stroke-dasharray: 5 5;
  animation: flow 1.6s linear infinite;
}

/* Pulsing for active elements */
@keyframes pulse {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.7; }
}
```

---

## Part 7: External Libraries

### Importmap Libraries (Pre-Injected)

An importmap for `three`, `gsap`, `d3`, and `chart.js` (served via esm.sh) is
pre-injected into every sandbox. jsFunctions and jsExpressions execute as classic
scripts, where top-level await is a SyntaxError that fails silently — so PREFER
loading libraries with dynamic imports INSIDE an async function declared in
jsFunctions, and keep jsExpressions synchronous invocations of those functions:

```js
async function setupScene() {
  const THREE = await import('three');
  const { OrbitControls } =
    await import('three/examples/jsm/controls/OrbitControls.js');
  // ... build the scene with real geometry and PBR materials.
  // NEVER fake 3D with CSS transforms or Canvas 2D projection.
}
```

```js
async function setupLibraries() {
  const { default: gsap } = await import('gsap');
  const d3 = await import('d3');
  const { default: Chart } = await import('chart.js/auto');
  // ... use the libraries here.
}
```

Where a module script genuinely belongs in the html parameter,
`<script type="module">` with bare specifiers also resolves through the importmap:

```html
<script type="module">
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
// ... your Three.js code here
</script>
```

**Critical**: Regular `<script>` tags cannot use `import` statements — use
`<script type="module">` in html. In jsFunctions/jsExpressions (classic-script
semantics) dynamic `await import(...)` works only inside an async function body,
never at top level.

### CDN Allowlist (For Everything Else)

Only these CDN origins work (CSP-enforced):
- `cdnjs.cloudflare.com`
- `esm.sh`
- `cdn.jsdelivr.net`
- `unpkg.com`

`<script src>` / `<link>` CDN tags still work in the html head for libraries
outside the importmap:

**Mermaid** (ERDs, sequence diagrams, class diagrams):
```html
<script type="module">
import mermaid from 'https://esm.sh/mermaid@11/dist/mermaid.esm.min.mjs';
</script>
```

**Tone.js** (audio synthesis):
```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/tone/14.8.49/Tone.min.js"></script>
```

### Three.js Coordinate Conventions

Three.js uses a **right-handed Y-up** coordinate system:
- **X** = right (positive) / left (negative)
- **Y** = up (positive) / down (negative)
- **Z** = toward the viewer (positive) / away from the viewer (negative)

**Critical for vehicles and aircraft:** The fuselage/body extends along **Z** (nose at -Z, tail at +Z). Wings extend along **X** (left/right). The vertical stabilizer extends along **Y**.

When building an aircraft from primitives:
- **Fuselage** = cylinder or box, long axis along **Z** (use `geometry` default or rotate 90° around X)
- **Wings** = flat box, wide along **X**, thin along **Y**, short along **Z**
- **Tail fin** = flat box, tall along **Y**, thin along **X**, short along **Z**

```javascript
// Correct aircraft orientation example:
// Fuselage along Z
const fuselage = new THREE.Mesh(
  new THREE.CylinderGeometry(0.15, 0.08, 2.0, 12),
  material
);
fuselage.rotation.x = Math.PI / 2; // CylinderGeometry default is Y-up, rotate to Z-forward

// Wings along X
const wing = new THREE.Mesh(
  new THREE.BoxGeometry(2.5, 0.03, 0.4), // wide X, thin Y, short Z
  material
);

// Vertical stabilizer along Y
const tailFin = new THREE.Mesh(
  new THREE.BoxGeometry(0.03, 0.4, 0.3), // thin X, tall Y, short Z
  material
);
tailFin.position.set(0, 0.2, 0.9); // above and behind
```

**Rotation axes for flight dynamics:**
- **Pitch** = rotation around **X** (nose up/down)
- **Roll** = rotation around **Z** (wings tilt)
- **Yaw** = rotation around **Y** (nose left/right)

**Common mistake:** Using the wing box as the fuselage (wide along X instead of Z). Always verify: the longest dimension of the fuselage should be along Z.

---

## Part 8: Quality Checklist

Before producing any visual, run through this:

### Functional
- [ ] Does it work without JavaScript during streaming? (Content visible)
- [ ] All styles live in the css parameter (no `<style>` blocks in html)
- [ ] Behavior is split into jsFunctions (parameterized toolbox) +
      jsExpressions (one invocation per statement)
- [ ] Do all interactive controls have event handlers?
- [ ] Are all displayed numbers rounded properly?
- [ ] Does the canvas/SVG fit within the container width?

### Visual
- [ ] Dark mode test: would every element be readable on near-black?
- [ ] No hardcoded text colors in HTML (use CSS variables)
- [ ] No gradients, shadows, blur, or glow
- [ ] Borders are 0.5px (except 2px for featured item accent)
- [ ] Font weights are only 400 or 500
- [ ] All text is sentence case

### Content
- [ ] Explanatory text is in the response, not inside the widget
- [ ] No titles or headings embedded in the HTML output
- [ ] Visual is self-explanatory without reading the narration
- [ ] Narration adds value beyond what the visual shows
- [ ] Offered a clear "go deeper" path

### Accessibility
- [ ] `@media (prefers-reduced-motion: reduce)` for all animations
- [ ] Text contrast is sufficient (dark text on light fills, vice versa)
- [ ] Interactive elements are large enough to click (min 44px touch target)
- [ ] No information conveyed by color alone

---

## Part 9: Decision Matrix — Picking the Right Visual

| User asks about...          | Output type              | Technology          |
|-----------------------------|--------------------------|---------------------|
| How X works (physical)      | Illustrative diagram     | SVG                 |
| How X works (abstract)      | Interactive explainer    | HTML + inline SVG   |
| Process / steps             | Flowchart                | SVG                 |
| Architecture / containment  | Structural diagram       | SVG                 |
| Database schema / ERD       | Relationship diagram     | Mermaid             |
| Trends over time            | Line chart               | Chart.js            |
| Category comparison         | Bar chart                | Chart.js            |
| Part of whole               | Doughnut chart           | Chart.js            |
| KPIs / metrics              | Dashboard                | HTML metric cards   |
| Design a UI                 | Mockup                   | HTML                |
| Choose between options      | Comparison cards         | HTML grid           |
| Cyclic process              | Step-through             | HTML stepper        |
| Physics / math              | Simulation               | Canvas + JS         |
| Function / equation         | Plotter                  | SVG + JS            |
| Data exploration            | Sortable table           | HTML + JS           |
| Creative / decorative       | Art / illustration       | SVG                 |
| 3D visualization            | 3D scene                 | Three.js            |
| Music / audio               | Synthesizer              | Tone.js             |
| Network / graph             | Force layout             | D3.js               |
| Quick factual answer        | Plain text               | None                |
| Code solution               | Code block               | None                |
| Emotional support           | Warm text                | None                |
