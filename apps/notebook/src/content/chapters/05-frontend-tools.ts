import type { Chapter } from "@/lib/types";

export const agentSkills: Chapter = {
  id: "agent-skills",
  title: "Agent Skills",
  description:
    "How skill documents teach the agent to write high-quality visual code.",
  icon: "📜",
  cells: [
    {
      type: "markdown",
      id: "skills-overview",
      content: `# Agent Skills

The agent doesn't just have tools — it has **skills**. Skills are markdown documents loaded at startup via \`create_deep_agent(skills=[...])\` that teach the agent *how* to write HTML, SVG, and interactive code.

Without skills, the agent produces generic output. With skills, it follows a consistent design system, uses proper typography, picks from a curated color palette, and structures responses with the 3-layer pattern (hook → visual → narration).

## Three Skill Documents

| Skill | What it teaches |
|-------|----------------|
| **Master Playbook** | Response philosophy, decision tree, interactive widget templates, Chart.js patterns |
| **SVG Diagrams** | Precise SVG rules: 680px viewBox, 9 color ramps, text sizing, arrow markers |
| **Advanced Visualization** | Design system tokens, UI mockup patterns, dashboard layouts, dark mode |`,
    },
    {
      type: "code",
      id: "skills-loading",
      language: "python",
      filename: "apps/agent/main.py — skills loaded at startup",
      content: `agent = create_deep_agent(
    model=ChatOpenAI(model="gpt-5.4-2026-03-05"),
    tools=[query_data, plan_visualization, *todo_tools, generate_form],
    middleware=[CopilotKitMiddleware()],
    context_schema=AgentState,
    # Skills are loaded from this directory at startup
    # Each subfolder contains a SKILL.md with frontmatter
    skills=[str(Path(__file__).parent / "skills")],
    checkpointer=BoundedMemorySaver(max_threads=200),
    system_prompt="...",
)

# apps/agent/skills/
# ├── master-playbook/SKILL.md      → Response philosophy + widget templates
# ├── svg-diagrams/SKILL.md         → SVG generation rules
# └── advanced-visualization/SKILL.md → Design system + advanced patterns`,
    },
    {
      type: "code",
      id: "skills-frontmatter",
      language: "markdown",
      filename: "apps/agent/skills/master-playbook/SKILL.md (excerpt)",
      content: `---
name: "Master Agent Playbook"
description: "Philosophy, decision-making framework, and technical skills
  for delivering visual, interactive, and educational AI responses."
allowed-tools: []
---

# Master Agent Playbook: Making AI Responses Extraordinary

## The Core Philosophy

### Think Like a Teacher, Not a Search Engine

Bad: "A load path is the route that forces take through a structure."
Good: [draws an interactive building cross-section with loads flowing]

The principle: **Show, don't just tell.** Before writing any response:
- Would a diagram make this click faster than a paragraph?
- Would an interactive widget let the user explore themselves?
- Would a worked example teach better than a definition?`,
    },
    {
      type: "markdown",
      id: "skills-decision-tree",
      content: `## The Response Decision Tree

The master playbook teaches the agent to choose the right output format based on what the user is asking:`,
    },
    {
      type: "mermaid",
      id: "skills-decision-diagram",
      title: "Skill Decision Tree",
      content: `flowchart TD
    Q[User asks a question] --> F{Question type?}
    F -->|Quick factual| T[1-2 sentences of text]
    F -->|Conceptual| C{Sub-type?}
    F -->|Build me X| A[Working code artifact]
    F -->|Comparison| S[Side-by-side visual]
    F -->|Emotional| W[Warm text only]

    C -->|Spatial / visual| SVG[SVG diagram]
    C -->|Process / flow| FL[Flowchart or stepper]
    C -->|Data-driven| CH[Interactive chart]
    C -->|Abstract| WI[Widget with controls]

    style Q fill:#EDE9F5,stroke:#5B3FA0,color:#3E2B6F
    style F fill:#FAEEDA,stroke:#B8860B,color:#854F0B
    style C fill:#FAEEDA,stroke:#B8860B,color:#854F0B
    style T fill:#f7f6f3,stroke:#9c9a92,color:#1a1a1a
    style A fill:#E1F5EE,stroke:#0F6E56,color:#085041
    style S fill:#E3EFFC,stroke:#2663B3,color:#1A4680
    style W fill:#f7f6f3,stroke:#9c9a92,color:#1a1a1a
    style SVG fill:#E1F5EE,stroke:#0F6E56,color:#085041
    style FL fill:#E1F5EE,stroke:#0F6E56,color:#085041
    style CH fill:#E3EFFC,stroke:#2663B3,color:#1A4680
    style WI fill:#E3EFFC,stroke:#2663B3,color:#1A4680`,
    },
    {
      type: "markdown",
      id: "skills-decision-tree-cta",
      content: `The playground below shows this in action — pick different question types and see the skill guide the agent to produce different output formats:`,
    },
    {
      type: "playground",
      id: "skills-decision-playground",
      title: "Live: Skill-guided response format selection",
      files: {
        "/App.js": `import { useState, useRef, useEffect } from "react";

// The skill decision tree in action: different questions → different output formats

const questions = [
  {
    text: "How does a load balancer distribute traffic?",
    type: "Process / flow",
    format: "SVG flowchart",
    output: \`<svg width="100%" viewBox="0 0 680 310" xmlns="http://www.w3.org/2000/svg" style="display:block">
      <defs><marker id="a" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M2 1L8 5L2 9" fill="none" stroke="context-stroke" stroke-width="1.5" stroke-linecap="round"/></marker></defs>
      <rect x="255" y="20" width="170" height="44" rx="8" fill="#E3EFFC" stroke="#2663B3"/>
      <text x="340" y="42" text-anchor="middle" dominant-baseline="central" style="font:500 14px system-ui;fill:#1A4680">Incoming request</text>
      <line x1="340" y1="64" x2="340" y2="100" stroke="#9c9a92" stroke-width="1.5" marker-end="url(#a)"/>
      <rect x="240" y="102" width="200" height="52" rx="8" fill="#EDE9F5" stroke="#5B3FA0"/>
      <text x="340" y="122" text-anchor="middle" dominant-baseline="central" style="font:500 14px system-ui;fill:#3E2B6F">Load balancer</text>
      <text x="340" y="140" text-anchor="middle" dominant-baseline="central" style="font:400 12px system-ui;fill:#3E2B6F;opacity:.7">Round-robin algorithm</text>
      <line x1="280" y1="154" x2="140" y2="200" stroke="#9c9a92" stroke-width="1.5" marker-end="url(#a)"/>
      <line x1="340" y1="154" x2="340" y2="200" stroke="#9c9a92" stroke-width="1.5" marker-end="url(#a)"/>
      <line x1="400" y1="154" x2="540" y2="200" stroke="#9c9a92" stroke-width="1.5" marker-end="url(#a)"/>
      <rect x="70" y="202" width="140" height="52" rx="8" fill="#E1F5EE" stroke="#0F6E56"/>
      <text x="140" y="222" text-anchor="middle" dominant-baseline="central" style="font:500 14px system-ui;fill:#085041">Server A</text>
      <text x="140" y="240" text-anchor="middle" dominant-baseline="central" style="font:400 12px system-ui;fill:#085041;opacity:.7">cpu: 45%</text>
      <rect x="270" y="202" width="140" height="52" rx="8" fill="#E1F5EE" stroke="#0F6E56"/>
      <text x="340" y="222" text-anchor="middle" dominant-baseline="central" style="font:500 14px system-ui;fill:#085041">Server B</text>
      <text x="340" y="240" text-anchor="middle" dominant-baseline="central" style="font:400 12px system-ui;fill:#085041;opacity:.7">cpu: 62%</text>
      <rect x="470" y="202" width="140" height="52" rx="8" fill="#E1F5EE" stroke="#0F6E56"/>
      <text x="540" y="222" text-anchor="middle" dominant-baseline="central" style="font:500 14px system-ui;fill:#085041">Server C</text>
      <text x="540" y="240" text-anchor="middle" dominant-baseline="central" style="font:400 12px system-ui;fill:#085041;opacity:.7">cpu: 28%</text>
    </svg>\`,
  },
  {
    text: "Compare React vs Vue vs Svelte bundle sizes",
    type: "Data-driven comparison",
    format: "Interactive chart",
    output: \`<style>
      body{font-family:system-ui,sans-serif;padding:16px;margin:0}
      .row{display:flex;align-items:center;gap:10px;margin:8px 0}
      .lbl{width:70px;font-size:13px;color:#73726c;text-align:right}
      .track{flex:1;height:28px;background:#f7f6f3;border-radius:6px;overflow:hidden;position:relative}
      .fill{height:100%;border-radius:6px;display:flex;align-items:center;padding-left:10px;
        font-size:12px;color:#fff;font-weight:500;animation:grow .8s ease forwards;transform-origin:left}
      .val{width:50px;font-size:12px;color:#73726c}
      h3{font-size:16px;font-weight:500;margin:0 0 12px;color:#1a1a1a}
      @keyframes grow{from{transform:scaleX(0)}to{transform:scaleX(1)}}
    </style>
    <h3>Framework bundle size (production, gzipped)</h3>
    <div class="row"><span class="lbl">React</span><div class="track"><div class="fill" style="width:72%;background:#5B3FA0">42.2 KB</div></div></div>
    <div class="row"><span class="lbl">Vue</span><div class="track"><div class="fill" style="width:55%;background:#0F6E56;animation-delay:.15s">33.0 KB</div></div></div>
    <div class="row"><span class="lbl">Svelte</span><div class="track"><div class="fill" style="width:12%;background:#C44D4D;animation-delay:.3s">1.6 KB</div></div></div>
    <p style="font-size:12px;color:#9c9a92;margin-top:12px">Svelte compiles away the framework — the output is vanilla JS with no runtime.</p>\`,
  },
  {
    text: "Build me a Pomodoro timer",
    type: "Build request",
    format: "Working interactive widget",
    output: \`<style>
      body{font-family:system-ui,sans-serif;padding:20px;margin:0;text-align:center}
      .timer{font-size:48px;font-weight:500;color:#1a1a1a;margin:16px 0 8px;font-variant-numeric:tabular-nums}
      .label{font-size:13px;color:#73726c;margin-bottom:16px}
      .btn{padding:10px 24px;border-radius:8px;border:none;font-size:14px;font-weight:500;cursor:pointer;margin:0 4px}
      .start{background:#0F6E56;color:#fff} .pause{background:#B8860B;color:#fff}
      .reset{background:#f7f6f3;color:#73726c;border:0.5px solid rgba(0,0,0,.15)}
      .progress{width:200px;height:6px;background:#f7f6f3;border-radius:3px;margin:0 auto 16px;overflow:hidden}
      .bar{height:100%;background:#0F6E56;border-radius:3px;transition:width .5s linear}
    </style>
    <h3 style="font-size:18px;font-weight:500;margin:0">Pomodoro Timer</h3>
    <div class="timer" id="display">25:00</div>
    <div class="label" id="mode">Focus time</div>
    <div class="progress"><div class="bar" id="bar" style="width:100%"></div></div>
    <button class="btn start" id="startBtn" onclick="toggle()">Start</button>
    <button class="btn reset" onclick="reset()">Reset</button>
    <script>
      let total=1500,remaining=1500,running=false,interval=null;
      const d=document.getElementById('display'),b=document.getElementById('bar'),s=document.getElementById('startBtn');
      function fmt(s){return Math.floor(s/60).toString().padStart(2,'0')+':'+String(s%60).padStart(2,'0')}
      function toggle(){
        running=!running;s.textContent=running?'Pause':'Start';
        s.className='btn '+(running?'pause':'start');
        if(running)interval=setInterval(()=>{if(remaining>0){remaining--;d.textContent=fmt(remaining);b.style.width=(remaining/total*100)+'%'}else{clearInterval(interval);running=false;s.textContent='Start';s.className='btn start'}},1000);
        else clearInterval(interval);
      }
      function reset(){clearInterval(interval);running=false;remaining=total;d.textContent=fmt(remaining);b.style.width='100%';s.textContent='Start';s.className='btn start'}
    </script>\`,
  },
];

export default function App() {
  const [selected, setSelected] = useState(null);
  const iframeRef = useRef(null);

  useEffect(() => {
    if (!iframeRef.current || selected === null) return;
    const doc = iframeRef.current.contentDocument;
    if (!doc) return;
    doc.open();
    doc.write(\`<!DOCTYPE html><html><body style="margin:0">\${questions[selected].output}</body></html>\`);
    doc.close();
  }, [selected]);

  return (
    <div style={{ fontFamily: "system-ui, sans-serif" }}>
      {/* Question selector */}
      <div style={{ padding: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#6b7280", marginBottom: 8 }}>
          Pick a question — the skill guides the agent to the right output format:
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {questions.map((q, i) => (
            <button key={i} onClick={() => setSelected(i)} style={{
              padding: "10px 14px", borderRadius: 10, border: selected === i ? "2px solid #5B3FA0" : "1px solid #e5e7eb",
              background: selected === i ? "#f5f3ff" : "#fff", cursor: "pointer", textAlign: "left",
              display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
              <span style={{ fontSize: 13, color: "#374151" }}>{q.text}</span>
              <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 4,
                background: selected === i ? "#EDE9F5" : "#f0f0f0",
                color: selected === i ? "#5B3FA0" : "#9ca3af", fontWeight: 600, whiteSpace: "nowrap" }}>
                {q.type} → {q.format}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Rendered output */}
      {selected !== null && (
        <div style={{ borderTop: "1px solid #e5e7eb" }}>
          <div style={{ padding: "6px 16px", fontSize: 11, fontWeight: 600, color: "#5B3FA0",
            background: "#f9fafb", borderBottom: "1px solid #e5e7eb", display: "flex", justifyContent: "space-between" }}>
            <span>Agent output ({questions[selected].format})</span>
            <span style={{ color: "#9ca3af", fontWeight: 400 }}>Rendered in sandboxed iframe</span>
          </div>
          <iframe ref={iframeRef} sandbox="allow-scripts"
            style={{ width: "100%", height: selected === 2 ? 240 : 300, border: "none", display: "block" }} />
        </div>
      )}
    </div>
  );
}`,
      },
    },
    {
      type: "markdown",
      id: "skills-design-system",
      content: `## Design System Tokens

The advanced visualization skill defines CSS variables that get injected into every widget. This means the agent writes code like \`color: var(--color-text-primary)\` instead of hardcoded hex values — and dark mode works automatically.

The playground below renders actual HTML using these tokens, exactly as the widget renderer does:`,
    },
    {
      type: "playground",
      id: "skills-tokens-playground",
      title: "Live: Design system tokens in action",
      files: {
        "/App.js": `import { useState, useRef, useEffect } from "react";

// The REAL CSS variables from the skill document
const THEME_CSS = \`
:root {
  --color-background-primary: #ffffff;
  --color-background-secondary: #f7f6f3;
  --color-background-tertiary: #efeee9;
  --color-background-info: #E6F1FB;
  --color-background-danger: #FCEBEB;
  --color-background-success: #EAF3DE;
  --color-background-warning: #FAEEDA;
  --color-text-primary: #1a1a1a;
  --color-text-secondary: #73726c;
  --color-text-tertiary: #9c9a92;
  --color-text-info: #185FA5;
  --color-text-danger: #A32D2D;
  --color-text-success: #3B6D11;
  --color-text-warning: #854F0B;
  --color-border-tertiary: rgba(0, 0, 0, 0.15);
  --font-sans: system-ui, -apple-system, sans-serif;
  --border-radius-lg: 12px;
}
@media (prefers-color-scheme: dark) {
  :root {
    --color-background-primary: #1a1a18;
    --color-background-secondary: #2c2c2a;
    --color-text-primary: #e8e6de;
    --color-text-secondary: #9c9a92;
    --color-border-tertiary: rgba(255, 255, 255, 0.15);
  }
}
body { font-family: var(--font-sans); margin: 0; padding: 16px;
  background: var(--color-background-primary); color: var(--color-text-primary); }
\`;

const templates = {
  "Status cards": \`<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px">
  <div style="padding:14px;border-radius:var(--border-radius-lg);background:var(--color-background-success);border:0.5px solid var(--color-border-tertiary)">
    <div style="font-size:11px;color:var(--color-text-success)">Healthy</div>
    <div style="font-size:22px;font-weight:500;color:var(--color-text-success)">12</div>
  </div>
  <div style="padding:14px;border-radius:var(--border-radius-lg);background:var(--color-background-warning);border:0.5px solid var(--color-border-tertiary)">
    <div style="font-size:11px;color:var(--color-text-warning)">Degraded</div>
    <div style="font-size:22px;font-weight:500;color:var(--color-text-warning)">2</div>
  </div>
  <div style="padding:14px;border-radius:var(--border-radius-lg);background:var(--color-background-danger);border:0.5px solid var(--color-border-tertiary)">
    <div style="font-size:11px;color:var(--color-text-danger)">Down</div>
    <div style="font-size:22px;font-weight:500;color:var(--color-text-danger)">0</div>
  </div>
</div>\`,
  "Data table": \`<table style="width:100%;border-collapse:collapse;font-size:13px">
  <thead><tr style="border-bottom:0.5px solid var(--color-border-tertiary)">
    <th style="text-align:left;padding:8px;color:var(--color-text-tertiary);font-weight:500">Tool</th>
    <th style="text-align:right;padding:8px;color:var(--color-text-tertiary);font-weight:500">Calls</th>
    <th style="text-align:right;padding:8px;color:var(--color-text-tertiary);font-weight:500">Avg ms</th>
  </tr></thead>
  <tbody>
    <tr style="border-bottom:0.5px solid var(--color-border-tertiary)"><td style="padding:8px">widgetRenderer</td><td style="text-align:right;padding:8px;font-weight:500">847</td><td style="text-align:right;padding:8px;color:var(--color-text-success)">280</td></tr>
    <tr style="border-bottom:0.5px solid var(--color-border-tertiary)"><td style="padding:8px">manage_todos</td><td style="text-align:right;padding:8px;font-weight:500">312</td><td style="text-align:right;padding:8px;color:var(--color-text-success)">45</td></tr>
    <tr><td style="padding:8px">plan_visualization</td><td style="text-align:right;padding:8px;font-weight:500">823</td><td style="text-align:right;padding:8px;color:var(--color-text-warning)">520</td></tr>
  </tbody>
</table>\`,
  "Info panel": \`<div style="padding:16px;border-radius:var(--border-radius-lg);background:var(--color-background-info);border:0.5px solid var(--color-border-tertiary)">
  <div style="font-size:14px;font-weight:500;color:var(--color-text-info);margin-bottom:6px">How skills guide code generation</div>
  <div style="font-size:13px;color:var(--color-text-info);line-height:1.6">
    The agent writes <code style="background:rgba(0,0,0,.06);padding:1px 4px;border-radius:3px">var(--color-text-primary)</code> instead of hardcoded colors. This means every widget automatically supports dark mode — no extra code needed.
  </div>
</div>\`,
};

export default function App() {
  const [selected, setSelected] = useState("Status cards");
  const iframeRef = useRef(null);

  useEffect(() => {
    if (!iframeRef.current) return;
    const doc = iframeRef.current.contentDocument;
    doc.open();
    doc.write(\`<!DOCTYPE html><html><head><style>\${THEME_CSS}</style></head><body>\${templates[selected]}</body></html>\`);
    doc.close();
  }, [selected]);

  return (
    <div style={{ fontFamily: "system-ui, sans-serif" }}>
      <div style={{ padding: "10px 16px", borderBottom: "1px solid #e5e7eb", display: "flex", gap: 6 }}>
        {Object.keys(templates).map(name => (
          <button key={name} onClick={() => setSelected(name)} style={{
            padding: "5px 12px", borderRadius: 6, border: "none", fontSize: 12, fontWeight: 600, cursor: "pointer",
            background: selected === name ? "#5B3FA0" : "#f0f0f0",
            color: selected === name ? "#fff" : "#6b7280",
          }}>{name}</button>
        ))}
      </div>
      <iframe ref={iframeRef} sandbox="allow-scripts"
        style={{ width: "100%", height: 130, border: "none", display: "block" }} />
      <div style={{ borderTop: "1px solid #e5e7eb", padding: 12, background: "#f9fafb" }}>
        <div style={{ fontSize: 10, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", marginBottom: 4 }}>
          HTML using design tokens (not hardcoded colors):
        </div>
        <pre style={{ margin: 0, fontSize: 11, fontFamily: "monospace", color: "#374151",
          whiteSpace: "pre-wrap", maxHeight: 100, overflow: "auto", lineHeight: 1.5 }}>
          {templates[selected].trim()}
        </pre>
      </div>
    </div>
  );
}`,
      },
    },
  ],
};
