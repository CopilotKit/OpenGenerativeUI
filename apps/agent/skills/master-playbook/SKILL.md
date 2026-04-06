---
name: "Master Agent Playbook"
description: "Philosophy, decision-making framework, and technical skills for delivering visual, interactive, and educational AI responses."
allowed-tools: []
---

# Master Agent Playbook: Making AI Responses Extraordinary

This playbook teaches an AI coding agent how to go beyond plain text and deliver
responses that are visual, interactive, and deeply educational. It covers the
philosophy, decision-making, and technical skills needed.

---

## Part 1: The Core Philosophy

### Think Like a Teacher, Not a Search Engine

Bad: "A load path is the route that forces take through a structure to the ground."
Good: [draws an interactive building cross-section with loads flowing downward]

The principle: **Show, don't just tell.** Before writing any response, ask:
- Would a diagram make this click faster than a paragraph?
- Would an interactive widget let the user explore the concept themselves?
- Would a worked example teach better than a definition?

### The Response Decision Tree

```
User asks a question
  |
  +- Is it a quick factual answer? -> Answer in 1-2 sentences.
  |
  +- Is it conceptual / "how does X work"?
  |   +- Is it spatial or visual? -> SVG illustrative diagram
  |   +- Is it a process/flow? -> SVG flowchart or HTML stepper
  |   +- Is it data-driven? -> Interactive chart (Chart.js / Recharts)
  |   +- Is it abstract but explorable? -> Interactive HTML widget with controls
  |
  +- Is it "build me X"? -> Working code artifact, fully functional
  |
  +- Is it a comparison? -> Side-by-side table or comparative visual
  |
  +- Is it emotional/personal? -> Warm text response. No visuals needed.
```

### Editing Existing Visuals

When a user asks to tweak, adjust, or build on a previous visualization:
- Start from the previous HTML (from your last widgetRenderer call)
- Make surgical changes — don't rewrite CSS or structure that isn't changing
- Keep the same technology, libraries, and overall architecture
- The edit plan should be 1-2 bullet points, not a full spec
- Narration after an edit should be shorter (1-2 sentences)

### The 3-Layer Response Pattern

Great responses layer information:

1. **Hook** (1-2 sentences): Validate the question, set context.
2. **Visual** (diagram/widget): The core explanation, rendered visually.
3. **Narration** (2-4 paragraphs): Walk through the visual, add nuance,
   connect to what the user already knows. Offer to go deeper.

Never dump a visual without narration. Never narrate without visuals
when visuals would help.

---

## Part 2: Skill — Interactive HTML Widgets

For concepts that benefit from user exploration. More powerful than
static SVGs — users can manipulate parameters and see results.

### When to Use
- The concept has a variable the user could tweak (temperature, rate, count)
- The system has states the user could toggle (on/off, mode A/B)
- The explanation benefits from stepping through stages
- Data exploration or filtering is involved

### Template: Interactive Widget with Controls

```html
<style>
  .controls {
    display: flex;
    align-items: center;
    gap: 16px;
    margin: 12px 0;
    font-size: 13px;
    color: var(--color-text-secondary, #666);
  }
  .controls label {
    display: flex;
    align-items: center;
    gap: 6px;
  }
  input[type="range"] { flex: 1; }
</style>

<!-- Inline SVG drawing that responds to controls -->
<svg width="100%" viewBox="0 0 680 400" xmlns="http://www.w3.org/2000/svg">
  <!-- Dynamic elements with IDs for JS manipulation -->
  <rect id="dynamic-element" x="100" y="100" width="200" height="50"
        fill="#E6F1FB" stroke="#185FA5" stroke-width="0.5" rx="8"/>
</svg>

<!-- Controls below the visual -->
<div class="controls">
  <label>
    <span>Parameter</span>
    <input type="range" id="param-slider" min="0" max="100" value="50"
           oninput="updateParam(this.value)">
    <span id="param-label">50</span>
  </label>
</div>

<script>
function updateParam(value) {
  document.getElementById('param-label').textContent = value;
  // Modify SVG elements based on value
  const el = document.getElementById('dynamic-element');
  el.setAttribute('width', 100 + value * 2);
}
</script>
```

### Template: Step-Through Explainer

For cyclic or staged processes (event loops, biological cycles, pipelines).

```html
<style>
  .step-nav {
    display: flex;
    align-items: center;
    gap: 12px;
    margin: 12px 0;
    font-size: 13px;
  }
  .step-nav button {
    padding: 6px 16px;
    border: 1px solid var(--color-border-tertiary, #ddd);
    border-radius: 8px;
    background: var(--color-background-secondary, #f5f5f5);
    color: var(--color-text-primary, #333);
    cursor: pointer;
    font-size: 13px;
  }
  .step-nav button:hover {
    background: var(--color-background-tertiary, #eee);
  }
  .dot { width: 8px; height: 8px; border-radius: 50%;
         background: var(--color-border-tertiary, #ccc);
         transition: background 0.2s; }
  .dot.active { background: var(--color-text-info, #185FA5); }
  .step-content { min-height: 300px; }
</style>

<div class="step-content" id="step-display">
  <!-- SVG or HTML content per step, swapped by JS -->
</div>

<div class="step-nav">
  <button onclick="prevStep()">Previous</button>
  <div id="dots" style="display:flex;gap:6px"></div>
  <button onclick="nextStep()">Next</button>
  <span id="step-label" style="margin-left:auto;
        color:var(--color-text-secondary,#888)">Step 1 of 4</span>
</div>

<script>
const steps = [
  { title: "Step 1", svg: `<svg>...</svg>`, desc: "What happens first" },
  { title: "Step 2", svg: `<svg>...</svg>`, desc: "Then this" },
  // ...
];
let current = 0;

function render() {
  document.getElementById('step-display').innerHTML = steps[current].svg;
  document.getElementById('step-label').textContent =
    `Step ${current + 1} of ${steps.length}`;
  document.querySelectorAll('.dot').forEach((d, i) =>
    d.classList.toggle('active', i === current));
}

function nextStep() { current = (current + 1) % steps.length; render(); }
function prevStep() { current = (current - 1 + steps.length) % steps.length; render(); }

// Build dots
const dotsEl = document.getElementById('dots');
steps.forEach(() => {
  const d = document.createElement('div');
  d.className = 'dot';
  dotsEl.appendChild(d);
});
render();
</script>
```

### CSS Animation Patterns (for live diagrams)

```css
/* Flowing particles along a path */
@keyframes flow {
  to { stroke-dashoffset: -20; }
}
.flowing {
  stroke-dasharray: 5 5;
  animation: flow 1.6s linear infinite;
}

/* Pulsing glow for active elements */
@keyframes pulse {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.7; }
}
.pulsing { animation: pulse 2s ease-in-out infinite; }

/* Flickering (for flames, sparks) */
@keyframes flicker {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.8; }
}

/* Always respect reduced motion preferences */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
  }
}
```

---

## Part 3: Skill — Data Visualization

### When to Use
- Comparing quantities
- Showing trends over time
- Displaying distributions or proportions
- Making data explorable

### Approach: Inline SVG Charts (No Dependencies)

For simple charts, hand-draw in SVG. No library needed.

```svg
<!-- Simple bar chart -->
<svg width="100%" viewBox="0 0 680 300">
  <!-- Y axis -->
  <line x1="80" y1="40" x2="80" y2="250" stroke="currentColor"
        stroke-width="0.5" opacity="0.3"/>
  <!-- X axis -->
  <line x1="80" y1="250" x2="620" y2="250" stroke="currentColor"
        stroke-width="0.5" opacity="0.3"/>

  <!-- Bars -->
  <rect x="120" y="100" width="60" height="150" rx="4"
        fill="#EEEDFE" stroke="#534AB7" stroke-width="0.5"/>
  <text x="150" y="270" text-anchor="middle" font-size="12"
        fill="currentColor" opacity="0.7">Q1</text>
  <text x="150" y="92" text-anchor="middle" font-size="12"
        fill="#3C3489">$42k</text>
  <!-- ... more bars -->
</svg>
```

### Approach: Chart.js (For Complex/Interactive Charts)

When you need tooltips, responsive legends, animations:

```html
<canvas id="myChart" style="width:100%;max-height:400px"></canvas>
<script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js"></script>
<script>
const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
const textColor = isDark ? '#c2c0b6' : '#3d3d3a';
const gridColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';

new Chart(document.getElementById('myChart'), {
  type: 'line',
  data: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr'],
    datasets: [{
      label: 'Revenue',
      data: [30, 45, 28, 62],
      borderColor: '#534AB7',
      backgroundColor: 'rgba(83,74,183,0.1)',
      fill: true,
      tension: 0.3
    }]
  },
  options: {
    responsive: true,
    plugins: {
      legend: { labels: { color: textColor } }
    },
    scales: {
      x: { ticks: { color: textColor }, grid: { color: gridColor } },
      y: { ticks: { color: textColor }, grid: { color: gridColor } }
    }
  }
});
</script>
```

---

## Part 4: Skill — Mermaid Diagrams

For relationship diagrams (ERDs, class diagrams, sequence diagrams) where
precise layout math isn't worth doing by hand.

```html
<div id="diagram"></div>
<script type="module">
import mermaid from 'https://esm.sh/mermaid@11/dist/mermaid.esm.min.mjs';
const dark = matchMedia('(prefers-color-scheme: dark)').matches;
mermaid.initialize({
  startOnLoad: false,
  theme: 'base',
  themeVariables: {
    darkMode: dark,
    fontSize: '13px',
    lineColor: dark ? '#9c9a92' : '#73726c',
    textColor: dark ? '#c2c0b6' : '#3d3d3a',
  },
});
const { svg } = await mermaid.render('d', `
  erDiagram
    USERS ||--o{ POSTS : writes
    POSTS ||--o{ COMMENTS : has
`);
document.getElementById('diagram').innerHTML = svg;
</script>
```

Use Mermaid for: ERDs, class diagrams, sequence diagrams, Gantt charts.
Use hand-drawn SVG for: everything else (flowcharts, architecture,
illustrative diagrams) — you get much better control.

---

## Part 5: Skill — Explanatory Writing Between Visuals

### Narration Patterns

**The Walk-Through**: Point at parts of the visual and explain them.
> "Starting at the top, the roof deck collects distributed loads across
> its surface. These get channeled into the rafters below, which act
> like one-way bridges..."

**The "Why It Matters"**: Connect the visual to real consequences.
> "This is why lower columns are always larger — they're carrying the
> accumulated weight of every floor above."

**The "Common Mistake"**: Anticipate misconceptions.
> "One thing that trips people up: removing a single column doesn't just
> lose that member — it breaks the entire load chain."

**The "Go Deeper" Offer**: End with expansion paths.
> "Want me to show how lateral loads (wind, seismic) take a completely
> different path?"

### Tone Rules
- Warm and direct. Not academic, not dumbed-down.
- Use "you" and "we" freely.
- Analogies and metaphors are powerful. Use them.
- Short paragraphs (2-4 sentences). No walls of text.
- Bold key terms on first introduction, then don't re-bold.
- Never use bullet points for explanations. Prose only.
- Ask at most one question per response.

---

## Part 6: Skill — Knowing What NOT to Visualize

Not everything needs a diagram. Skip visuals when:

- The answer is a single fact or number
- The user is venting or emotional (empathy, not charts)
- The topic is purely textual (writing, editing, drafting)
- A code snippet is the answer (just show the code)
- The user explicitly asked for brief/concise

### The "Would They Screenshot This?" Test

If the user would likely screenshot or save the visual to reference
later, it was worth making. If not, just use text.

---

## Part 7: Putting It All Together

### Example Response Structure (Complex Technical Question)

```
[1-2 sentence hook validating the question]

[Visual: SVG diagram or interactive widget]

[Walk-through narration: 3-4 paragraphs explaining the visual,
 pointing at specific parts, noting key insights]

[One "go deeper" offer with 2-3 specific directions]
```

### Example Response Structure (Simple Question with Visual Aid)

```
[Direct answer in 1-2 sentences]

[Small supporting visual if it adds value]

[One additional insight or context sentence]
```

### Quality Checklist Before Responding

- [ ] Did I pick the right format? (text vs SVG vs interactive vs chart)
- [ ] Is the visual self-explanatory even without the narration?
- [ ] Does the narration add value beyond what the visual shows?
- [ ] Are colors meaningful, not decorative?
- [ ] Does it work in dark mode?
- [ ] Is the response concise? (Cut anything that doesn't teach)
- [ ] Did I offer a clear next step?

---

## Appendix: Quick Reference

| Concept Type            | Best Format                  |
|-------------------------|------------------------------|
| How X works (physical)  | Illustrative SVG diagram     |
| How X works (abstract)  | Interactive HTML + SVG       |
| Process / workflow      | SVG flowchart                |
| Architecture            | SVG structural diagram       |
| Data relationships      | Mermaid ERD                  |
| Trends / comparisons    | Chart.js or SVG bar chart    |
| Cyclic process          | HTML step-through widget     |
| System states           | Interactive widget + toggles |
| Quick answer            | Plain text                   |
| Code solution           | Code block / artifact        |
| Emotional support       | Warm text only               |
