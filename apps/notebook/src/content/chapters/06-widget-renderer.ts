import type { Chapter } from "@/lib/types";

export const fullFlow: Chapter = {
  id: "full-flow",
  title: "Putting It Together",
  description:
    "The complete end-to-end flow from user message to rendered visualization.",
  icon: "🔗",
  cells: [
    {
      type: "markdown",
      id: "flow-overview",
      content: `# Putting It Together

Now let's trace the **complete flow** in one working demo. Type a message, and watch it flow through all four layers — ending with a real rendered widget in an iframe.`,
    },
    {
      type: "playground",
      id: "flow-full-demo",
      title: "Live: Complete end-to-end pipeline — type a message, get a widget",
      files: {
        "/App.js": `import { useState, useRef, useEffect } from "react";

// Prompt → tool library: maps keywords to full widget HTML output
const widgetLibrary = {
  dashboard: {
    plan: { approach: "Metrics dashboard with KPI cards and bar chart", technology: "HTML + CSS", keyElements: ["KPI metric cards", "Horizontal bar chart", "Animated entrances"] },
    title: "Agent Dashboard",
    html: \`<style>
      body{font-family:system-ui,sans-serif;padding:20px;margin:0}
      .g{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:16px}
      .c{padding:12px;border-radius:12px;border:0.5px solid rgba(0,0,0,.12);animation:fadeUp .5s ease forwards;opacity:0}
      .cl{font-size:11px;margin-bottom:2px}.cv{font-size:22px;font-weight:500}
      .br{display:flex;align-items:center;gap:8px;margin:5px 0}.bl{width:80px;font-size:12px;color:#73726c;text-align:right}
      .bt{flex:1;height:20px;background:#f7f6f3;border-radius:6px;overflow:hidden}
      .bf{height:100%;border-radius:6px;animation:grow .8s ease forwards;transform-origin:left}
      @keyframes grow{from{transform:scaleX(0)}to{transform:scaleX(1)}}
      @keyframes fadeUp{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
    </style>
    <div class="g">
      <div class="c" style="background:#EDE9F5;animation-delay:.1s"><div class="cl" style="color:#5B3FA0">Requests</div><div class="cv" style="color:#5B3FA0">2.4k</div></div>
      <div class="c" style="background:#E1F5EE;animation-delay:.2s"><div class="cl" style="color:#0F6E56">Uptime</div><div class="cv" style="color:#0F6E56">99.9%</div></div>
      <div class="c" style="background:#E3EFFC;animation-delay:.3s"><div class="cl" style="color:#2663B3">P95</div><div class="cv" style="color:#2663B3">180ms</div></div>
    </div>
    <div style="font-size:14px;font-weight:500;margin-bottom:8px">Endpoint traffic</div>
    <div class="br"><span class="bl">/api/chat</span><div class="bt"><div class="bf" style="width:82%;background:#5B3FA0"></div></div><span style="font-size:11px;color:#73726c">82%</span></div>
    <div class="br"><span class="bl">/api/tools</span><div class="bt"><div class="bf" style="width:56%;background:#0F6E56;animation-delay:.1s"></div></div><span style="font-size:11px;color:#73726c">56%</span></div>
    <div class="br"><span class="bl">/api/state</span><div class="bt"><div class="bf" style="width:34%;background:#2663B3;animation-delay:.2s"></div></div><span style="font-size:11px;color:#73726c">34%</span></div>\`,
  },
  chart: {
    plan: { approach: "Animated donut chart showing language distribution", technology: "SVG + CSS animations", keyElements: ["SVG donut ring segments", "Animated arc drawing", "Legend with percentages"] },
    title: "Language Distribution",
    html: \`<style>
      body{font-family:system-ui,sans-serif;padding:20px;margin:0}
      .legend{display:flex;gap:16px;justify-content:center;margin-top:12px;flex-wrap:wrap}
      .li{display:flex;align-items:center;gap:5px;font-size:12px;color:#73726c}
      .dot{width:8px;height:8px;border-radius:2px}
      circle{transition:stroke-dashoffset 1s ease}
    </style>
    <div style="text-align:center">
      <svg width="180" height="180" viewBox="0 0 200 200">
        <circle cx="100" cy="100" r="80" fill="none" stroke="#EDE9F5" stroke-width="24"/>
        <circle cx="100" cy="100" r="80" fill="none" stroke="#5B3FA0" stroke-width="24"
          stroke-dasharray="226 502" stroke-dashoffset="0" transform="rotate(-90 100 100)">
          <animate attributeName="stroke-dashoffset" from="502" to="0" dur="1s" fill="freeze"/>
        </circle>
        <circle cx="100" cy="100" r="80" fill="none" stroke="#0F6E56" stroke-width="24"
          stroke-dasharray="151 502" stroke-dashoffset="-226" transform="rotate(-90 100 100)">
          <animate attributeName="stroke-dashoffset" from="-226" to="-226" dur="0.5s" fill="freeze"/>
        </circle>
        <circle cx="100" cy="100" r="80" fill="none" stroke="#2663B3" stroke-width="24"
          stroke-dasharray="75 502" stroke-dashoffset="-377" transform="rotate(-90 100 100)"/>
        <circle cx="100" cy="100" r="80" fill="none" stroke="#C44D4D" stroke-width="24"
          stroke-dasharray="50 502" stroke-dashoffset="-452" transform="rotate(-90 100 100)"/>
      </svg>
      <div class="legend">
        <span class="li"><span class="dot" style="background:#5B3FA0"></span>TypeScript 45%</span>
        <span class="li"><span class="dot" style="background:#0F6E56"></span>Python 30%</span>
        <span class="li"><span class="dot" style="background:#2663B3"></span>CSS 15%</span>
        <span class="li"><span class="dot" style="background:#C44D4D"></span>Other 10%</span>
      </div>
    </div>\`,
  },
  diagram: {
    plan: { approach: "Architecture flow diagram showing data path", technology: "Inline SVG (skill-guided)", keyElements: ["4 layered nodes with color ramps", "Directional arrows", "680px viewBox, responsive"] },
    title: "Architecture Flow",
    html: \`<svg width="100%" viewBox="0 0 680 370" xmlns="http://www.w3.org/2000/svg" style="display:block">
      <defs><marker id="a" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M2 1L8 5L2 9" fill="none" stroke="context-stroke" stroke-width="1.5" stroke-linecap="round"/></marker></defs>
      <line x1="340" y1="82" x2="340" y2="110" stroke="#9c9a92" stroke-width="1.5" marker-end="url(#a)"/>
      <line x1="340" y1="166" x2="340" y2="200" stroke="#9c9a92" stroke-width="1.5" marker-end="url(#a)"/>
      <line x1="340" y1="256" x2="340" y2="290" stroke="#9c9a92" stroke-width="1.5" marker-end="url(#a)"/>
      <g><rect x="245" y="30" width="190" height="52" rx="8" fill="#E1F5EE" stroke="#0F6E56"/><text x="340" y="50" text-anchor="middle" dominant-baseline="central" style="font:500 14px system-ui;fill:#085041">User message</text><text x="340" y="68" text-anchor="middle" dominant-baseline="central" style="font:400 12px system-ui;fill:#085041;opacity:.7">Chat input</text></g>
      <g><rect x="215" y="112" width="250" height="52" rx="8" fill="#EDE9F5" stroke="#5B3FA0"/><text x="340" y="132" text-anchor="middle" dominant-baseline="central" style="font:500 14px system-ui;fill:#3E2B6F">CopilotKit runtime</text><text x="340" y="150" text-anchor="middle" dominant-baseline="central" style="font:400 12px system-ui;fill:#3E2B6F;opacity:.7">LangGraphHttpAgent bridge</text></g>
      <g><rect x="220" y="202" width="240" height="52" rx="8" fill="#E3EFFC" stroke="#2663B3"/><text x="340" y="222" text-anchor="middle" dominant-baseline="central" style="font:500 14px system-ui;fill:#1A4680">LangGraph deep agent</text><text x="340" y="240" text-anchor="middle" dominant-baseline="central" style="font:400 12px system-ui;fill:#1A4680;opacity:.7">Tools + skills + state</text></g>
      <g><rect x="230" y="292" width="220" height="52" rx="8" fill="#FCE8E8" stroke="#C44D4D"/><text x="340" y="312" text-anchor="middle" dominant-baseline="central" style="font:500 14px system-ui;fill:#8A2E2E">Widget renderer</text><text x="340" y="330" text-anchor="middle" dominant-baseline="central" style="font:400 12px system-ui;fill:#8A2E2E;opacity:.7">Sandboxed iframe output</text></g>
    </svg>\`,
  },
};

const prompts = [
  { text: "Show me a dashboard", key: "dashboard" },
  { text: "Create a language chart", key: "chart" },
  { text: "Draw the architecture", key: "diagram" },
];

export default function App() {
  const [input, setInput] = useState("");
  const [log, setLog] = useState([]);
  const [phase, setPhase] = useState("idle");
  const [widgetHtml, setWidgetHtml] = useState("");
  const iframeRef = useRef(null);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [log, widgetHtml]);

  useEffect(() => {
    if (!iframeRef.current || !widgetHtml) return;
    const doc = iframeRef.current.contentDocument;
    if (!doc) return;
    doc.open();
    doc.write(\`<!DOCTYPE html><html><body style="margin:0">\${widgetHtml}</body></html>\`);
    doc.close();
  }, [widgetHtml]);

  const send = async (promptKey) => {
    const widget = widgetLibrary[promptKey];
    if (!widget) return;
    setLog([]);
    setWidgetHtml("");
    setInput("");

    // 1. User message
    setLog([{ type: "user", text: prompts.find(p => p.key === promptKey)?.text || input }]);
    setPhase("ack");
    await new Promise(r => setTimeout(r, 500));

    // 2. Acknowledge
    setLog(prev => [...prev, { type: "agent", text: "I'll create that for you." }]);
    setPhase("plan");
    await new Promise(r => setTimeout(r, 700));

    // 3. Plan
    setLog(prev => [...prev, { type: "plan", data: widget.plan }]);
    setPhase("build");
    await new Promise(r => setTimeout(r, 800));

    // 4. Build — render actual widget
    setLog(prev => [...prev, { type: "widget", title: widget.title }]);
    setWidgetHtml(widget.html);
    setPhase("narrate");
    await new Promise(r => setTimeout(r, 1200));

    // 5. Narrate
    setLog(prev => [...prev, { type: "agent", text: "Here's the visualization. The data is rendered using the design system's CSS variables, so it supports dark mode automatically. Want me to modify anything?" }]);
    setPhase("done");
  };

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", display: "flex", flexDirection: "column", height: 520 }}>
      {/* Chat area */}
      <div style={{ flex: 1, overflow: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 8 }}>
        {log.length === 0 && (
          <div style={{ textAlign: "center", marginTop: 30 }}>
            <div style={{ color: "#374151", fontSize: 15, fontWeight: 600, marginBottom: 12 }}>Try a prompt:</div>
            <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
              {prompts.map(p => (
                <button key={p.key} onClick={() => send(p.key)} style={{
                  padding: "8px 16px", borderRadius: 20, border: "1px solid #e5e7eb",
                  background: "#fff", cursor: "pointer", fontSize: 13, color: "#374151",
                  transition: "all 0.15s",
                }}>
                  {p.text}
                </button>
              ))}
            </div>
          </div>
        )}

        {log.map((msg, i) => {
          if (msg.type === "user") return (
            <div key={i} style={{ alignSelf: "flex-end", padding: "8px 14px", borderRadius: "12px 12px 4px 12px", background: "#5B3FA0", color: "#fff", fontSize: 13, maxWidth: "80%" }}>
              {msg.text}
            </div>
          );
          if (msg.type === "agent") return (
            <div key={i} style={{ padding: "8px 14px", borderRadius: "12px 12px 12px 4px", background: "#f9fafb", border: "1px solid #e5e7eb", fontSize: 13, color: "#374151", maxWidth: "85%", lineHeight: 1.5 }}>
              {msg.text}
            </div>
          );
          if (msg.type === "plan") return (
            <div key={i} style={{ padding: 12, borderRadius: 10, background: "#EDE9F5", border: "1px solid #c4b5fd", maxWidth: "85%", fontSize: 12 }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: "#5B3FA0", textTransform: "uppercase", marginBottom: 4 }}>plan_visualization</div>
              <div style={{ fontWeight: 600, color: "#3E2B6F" }}>{msg.data.approach}</div>
              <div style={{ color: "#5B3FA0", fontSize: 11, marginTop: 2 }}>Tech: {msg.data.technology}</div>
            </div>
          );
          if (msg.type === "widget") return (
            <div key={i} style={{ borderRadius: 10, overflow: "hidden", border: "1px solid #e5e7eb", maxWidth: "95%" }}>
              <div style={{ padding: "6px 12px", background: "#f9fafb", borderBottom: "1px solid #e5e7eb", fontSize: 11, fontWeight: 600, color: "#5B3FA0" }}>
                widgetRenderer: {msg.title}
              </div>
              <iframe ref={iframeRef} sandbox="allow-scripts"
                style={{ width: "100%", height: 230, border: "none", display: "block" }} />
            </div>
          );
          return null;
        })}

        {phase !== "idle" && phase !== "done" && (
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#5B3FA0" }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#5B3FA0", animation: "pulse 1s infinite" }} />
            {phase === "ack" ? "Agent thinking..." : phase === "plan" ? "Planning visualization..." : phase === "build" ? "Rendering widget..." : "Writing narration..."}
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <style>{"@keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}"}</style>

      {/* Input bar + quick prompts */}
      <div style={{ padding: 12, borderTop: "1px solid #e5e7eb", display: "flex", gap: 8 }}>
        {phase === "done" && (
          <div style={{ display: "flex", gap: 6, flex: 1 }}>
            {prompts.map(p => (
              <button key={p.key} onClick={() => send(p.key)} style={{
                flex: 1, padding: "10px", borderRadius: 8, border: "1px solid #e5e7eb",
                background: "#fff", cursor: "pointer", fontSize: 12, fontWeight: 600, color: "#374151",
              }}>
                {p.text}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}`,
      },
    },
    {
      type: "markdown",
      id: "flow-extend",
      content: `## Extending the Template

To add your own domain:

1. **Define state** — Add fields to \`AgentState\` in Python
2. **Create tools** — Return \`Command(update={...})\` to modify state
3. **Register components** — Use \`useComponent()\` for agent-renderable UI
4. **Write skills** — Add \`.txt\` playbooks for visual quality
5. **Configure the system prompt** — Define your mandatory workflow

The todo list is the starting point — replace it with your domain while keeping the same CopilotKit v2 state pattern.`,
    },
  ],
};
