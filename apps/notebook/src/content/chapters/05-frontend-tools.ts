import type { Chapter } from "@/lib/types";

export const mcpSkills: Chapter = {
  id: "mcp-skills",
  title: "MCP Skills",
  description:
    "Composable skill documents that guide the agent's visual output quality.",
  icon: "📜",
  cells: [
    {
      type: "markdown",
      id: "skills-overview",
      content: `# MCP Skills

The agent's visual quality comes from **skill documents** — composable \`.txt\` playbooks that define design rules, component patterns, and rendering techniques.

Skills are served through an **MCP (Model Context Protocol) server**, making them accessible to both the LangGraph agent and external AI tools like Claude Desktop.`,
    },
    {
      type: "code",
      id: "skills-server-code",
      language: "typescript",
      filename: "apps/mcp/src/server.ts (simplified)",
      content: `export function createMcpServer(): McpServer {
  const server = new McpServer({ name: "open-generative-ui", version: "0.1.0" });

  // Resources: list and read skill documents
  server.registerResource("skills-list", "skills://list", { ... });
  server.registerResource("skill", new ResourceTemplate("skills://{name}"), { ... });

  // Prompts: pre-composed skill instructions
  server.registerPrompt("create_widget", { ... });       // master-agent-playbook
  server.registerPrompt("create_svg_diagram", { ... });   // svg-diagram-skill
  server.registerPrompt("create_visualization", { ... }); // agent-skills-vol2

  // Tool: wrap HTML with the full design system
  server.registerTool("assemble_document", {
    inputSchema: { title, description, html },
  }, async ({ html }) => ({
    content: [{ type: "text", text: assembleDocument(html) }],
  }));
}`,
    },
    {
      type: "markdown",
      id: "skills-design-system",
      content: `## Design System Tokens

The skill documents define a full token set that gets injected into every widget iframe. The playground below is a **live token explorer** — it renders real HTML using the same CSS variables the agent uses:`,
    },
    {
      type: "playground",
      id: "skills-tokens-playground",
      title: "Live: Design system token explorer with real rendering",
      files: {
        "/App.js": `import { useState, useRef, useEffect } from "react";

// These are the actual CSS variables from renderer.ts
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
  --border-radius-md: 8px;
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

// Templates the user can switch between
const templates = {
  "Status cards": \`<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px">
  <div style="padding:14px;border-radius:var(--border-radius-lg);background:var(--color-background-success);border:0.5px solid var(--color-border-tertiary)">
    <div style="font-size:11px;color:var(--color-text-success)">Healthy</div>
    <div style="font-size:22px;font-weight:500;color:var(--color-text-success)">12 services</div>
  </div>
  <div style="padding:14px;border-radius:var(--border-radius-lg);background:var(--color-background-warning);border:0.5px solid var(--color-border-tertiary)">
    <div style="font-size:11px;color:var(--color-text-warning)">Degraded</div>
    <div style="font-size:22px;font-weight:500;color:var(--color-text-warning)">2 services</div>
  </div>
  <div style="padding:14px;border-radius:var(--border-radius-lg);background:var(--color-background-danger);border:0.5px solid var(--color-border-tertiary)">
    <div style="font-size:11px;color:var(--color-text-danger)">Down</div>
    <div style="font-size:22px;font-weight:500;color:var(--color-text-danger)">0 services</div>
  </div>
</div>\`,
  "Info panel": \`<div style="padding:16px;border-radius:var(--border-radius-lg);background:var(--color-background-info);border:0.5px solid var(--color-border-tertiary)">
  <div style="font-size:14px;font-weight:500;color:var(--color-text-info);margin-bottom:6px">How the design system works</div>
  <div style="font-size:13px;color:var(--color-text-info);line-height:1.6">
    Every widget gets these CSS variables injected automatically. Use <code style="background:rgba(0,0,0,0.06);padding:1px 4px;border-radius:3px">var(--color-text-primary)</code> instead of hardcoded colors and your widgets will support dark mode for free.
  </div>
</div>\`,
  "Data table": \`<table style="width:100%;border-collapse:collapse;font-size:13px">
  <thead>
    <tr style="border-bottom:0.5px solid var(--color-border-tertiary)">
      <th style="text-align:left;padding:8px;color:var(--color-text-tertiary);font-weight:500">Tool</th>
      <th style="text-align:right;padding:8px;color:var(--color-text-tertiary);font-weight:500">Calls</th>
      <th style="text-align:right;padding:8px;color:var(--color-text-tertiary);font-weight:500">Avg ms</th>
    </tr>
  </thead>
  <tbody>
    <tr style="border-bottom:0.5px solid var(--color-border-tertiary)">
      <td style="padding:8px;color:var(--color-text-primary)">widgetRenderer</td>
      <td style="text-align:right;padding:8px;color:var(--color-text-primary);font-weight:500">847</td>
      <td style="text-align:right;padding:8px;color:var(--color-text-success)">280</td>
    </tr>
    <tr style="border-bottom:0.5px solid var(--color-border-tertiary)">
      <td style="padding:8px;color:var(--color-text-primary)">manage_todos</td>
      <td style="text-align:right;padding:8px;color:var(--color-text-primary);font-weight:500">312</td>
      <td style="text-align:right;padding:8px;color:var(--color-text-success)">45</td>
    </tr>
    <tr>
      <td style="padding:8px;color:var(--color-text-primary)">plan_visualization</td>
      <td style="text-align:right;padding:8px;color:var(--color-text-primary);font-weight:500">823</td>
      <td style="text-align:right;padding:8px;color:var(--color-text-warning)">520</td>
    </tr>
  </tbody>
</table>\`,
};

export default function App() {
  const [selected, setSelected] = useState("Status cards");
  const iframeRef = useRef(null);

  useEffect(() => {
    if (!iframeRef.current) return;
    const doc = iframeRef.current.contentDocument;
    if (!doc) return;
    doc.open();
    doc.write(\`<!DOCTYPE html><html><head><style>\${THEME_CSS}</style></head><body>\${templates[selected]}</body></html>\`);
    doc.close();
  }, [selected]);

  return (
    <div style={{ fontFamily: "system-ui, sans-serif" }}>
      {/* Template selector */}
      <div style={{ padding: "10px 16px", borderBottom: "1px solid #e5e7eb", display: "flex", gap: 6 }}>
        {Object.keys(templates).map(name => (
          <button key={name} onClick={() => setSelected(name)} style={{
            padding: "5px 12px", borderRadius: 6, border: "none", fontSize: 12, fontWeight: 600, cursor: "pointer",
            background: selected === name ? "#5B3FA0" : "#f0f0f0",
            color: selected === name ? "#fff" : "#6b7280",
          }}>
            {name}
          </button>
        ))}
      </div>

      {/* Live rendered preview using the REAL design system CSS */}
      <iframe
        ref={iframeRef}
        sandbox="allow-scripts"
        style={{ width: "100%", height: 160, border: "none", display: "block" }}
      />

      {/* Show the HTML source */}
      <div style={{ borderTop: "1px solid #e5e7eb", padding: 12, background: "#f9fafb" }}>
        <div style={{ fontSize: 10, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", marginBottom: 4 }}>HTML using design system tokens:</div>
        <pre style={{ margin: 0, fontSize: 11, fontFamily: "monospace", color: "#374151", whiteSpace: "pre-wrap", maxHeight: 120, overflow: "auto", lineHeight: 1.5 }}>
          {templates[selected].trim()}
        </pre>
      </div>
    </div>
  );
}`,
      },
    },
    {
      type: "markdown",
      id: "skills-svg-rules",
      content: `## SVG Diagram Skill

The SVG skill defines precise rules for hand-drawn diagrams. The playground below implements these rules as a live diagram builder — add nodes, pick colors from the 9-ramp palette, and watch the SVG follow the viewBox/spacing rules:`,
    },
    {
      type: "playground",
      id: "skills-svg-playground",
      title: "Live: SVG diagram builder following skill rules",
      files: {
        "/App.js": `import { useState } from "react";

// Implements the actual SVG diagram skill rules:
// - ViewBox 680px wide, responsive via width="100%"
// - 14px titles (8px/char), 12px subtitles (7px/char), +48px padding
// - Two-line nodes: 56px tall, single-line: 44px tall
// - Arrow markers, stroke-width 1.5px
// - 9 color ramps from the skill document

const ramps = {
  teal:   { fill: "#E1F5EE", stroke: "#0F6E56", text: "#085041" },
  purple: { fill: "#EDE9F5", stroke: "#5B3FA0", text: "#3E2B6F" },
  coral:  { fill: "#FCE8E8", stroke: "#C44D4D", text: "#8A2E2E" },
  pink:   { fill: "#FAEAF3", stroke: "#B54A8C", text: "#7E3362" },
  gray:   { fill: "#F1F1F0", stroke: "#73726C", text: "#474745" },
  blue:   { fill: "#E3EFFC", stroke: "#2663B3", text: "#1A4680" },
  green:  { fill: "#E1F5EE", stroke: "#2D8B5F", text: "#1D5C3F" },
  amber:  { fill: "#FEF3DC", stroke: "#B8860B", text: "#7A5A07" },
  red:    { fill: "#FCEBEB", stroke: "#C44D4D", text: "#8A2E2E" },
};

export default function App() {
  const [nodes, setNodes] = useState([
    { id: 1, label: "User message", sub: "Chat input", color: "teal" },
    { id: 2, label: "CopilotKit runtime", sub: "API route → LangGraph", color: "purple" },
    { id: 3, label: "Deep agent", sub: "Tools + middleware", color: "blue" },
    { id: 4, label: "Widget renderer", sub: "Sandboxed iframe", color: "coral" },
  ]);
  const [selectedRamp, setSelectedRamp] = useState("teal");
  const [newLabel, setNewLabel] = useState("");
  const [newSub, setNewSub] = useState("");

  const addNode = () => {
    if (!newLabel) return;
    setNodes(prev => [...prev, {
      id: Date.now(), label: newLabel || "Node", sub: newSub || "", color: selectedRamp,
    }]);
    setNewLabel("");
    setNewSub("");
  };

  const removeNode = (id) => setNodes(prev => prev.filter(n => n.id !== id));

  // Calculate layout following skill rules
  const padding = 40;
  const gap = 34;
  const nodePositions = nodes.map((node, i) => {
    const hasSub = !!node.sub;
    const h = hasSub ? 56 : 44;
    const titleW = node.label.length * 8;   // 14px = 8px/char
    const subW = node.sub ? node.sub.length * 7 : 0;  // 12px = 7px/char
    const w = Math.max(titleW, subW) + 48;  // +48px padding
    const y = i === 0 ? padding : null; // computed below
    return { ...node, h, w, titleW, subW };
  });

  // Compute y positions
  let currentY = padding;
  nodePositions.forEach((n, i) => {
    n.y = currentY;
    n.x = 340 - n.w / 2; // center in 680px
    currentY += n.h + gap;
  });

  const svgH = nodePositions.length > 0
    ? nodePositions[nodePositions.length - 1].y + nodePositions[nodePositions.length - 1].h + padding
    : 120;

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", padding: 16 }}>
      {/* Live SVG output */}
      <svg width="100%" viewBox={\`0 0 680 \${svgH}\`} xmlns="http://www.w3.org/2000/svg"
        style={{ background: "#fff", borderRadius: 8, border: "1px solid #e5e7eb" }}>
        <defs>
          <marker id="arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M2 1L8 5L2 9" fill="none" stroke="context-stroke" strokeWidth="1.5" strokeLinecap="round" />
          </marker>
        </defs>
        {/* Arrows */}
        {nodePositions.slice(1).map((n, i) => {
          const prev = nodePositions[i];
          return <line key={"a"+i} x1={prev.x + prev.w/2} y1={prev.y + prev.h}
            x2={n.x + n.w/2} y2={n.y} stroke="#9c9a92" strokeWidth="1.5" markerEnd="url(#arr)" />;
        })}
        {/* Nodes */}
        {nodePositions.map(n => {
          const c = ramps[n.color];
          return (
            <g key={n.id}>
              <rect x={n.x} y={n.y} width={n.w} height={n.h} rx="8" fill={c.fill} stroke={c.stroke} strokeWidth="1" />
              <text x={n.x + n.w/2} y={n.y + (n.sub ? 22 : n.h/2)} textAnchor="middle" dominantBaseline="central"
                style={{ fontSize: 14, fontWeight: 500, fill: c.text }}>{n.label}</text>
              {n.sub && <text x={n.x + n.w/2} y={n.y + 40} textAnchor="middle" dominantBaseline="central"
                style={{ fontSize: 12, fill: c.text, opacity: 0.7 }}>{n.sub}</text>}
            </g>
          );
        })}
      </svg>

      <div style={{ fontSize: 10, color: "#9c9a92", marginTop: 4, fontFamily: "monospace" }}>
        viewBox="0 0 680 {svgH}" | {nodes.length} nodes | Height = lastY({nodePositions.length > 0 ? nodePositions[nodePositions.length-1].y : 0}) + nodeH({nodePositions.length > 0 ? nodePositions[nodePositions.length-1].h : 0}) + pad(40)
      </div>

      {/* Controls */}
      <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap", alignItems: "end" }}>
        <div>
          <div style={{ fontSize: 10, color: "#6b7280", marginBottom: 2 }}>Label</div>
          <input value={newLabel} onChange={e => setNewLabel(e.target.value)} placeholder="Node title"
            style={{ padding: "5px 8px", borderRadius: 6, border: "1px solid #d1d5db", fontSize: 12, width: 120 }} />
        </div>
        <div>
          <div style={{ fontSize: 10, color: "#6b7280", marginBottom: 2 }}>Subtitle</div>
          <input value={newSub} onChange={e => setNewSub(e.target.value)} placeholder="Optional"
            style={{ padding: "5px 8px", borderRadius: 6, border: "1px solid #d1d5db", fontSize: 12, width: 100 }} />
        </div>
        <div>
          <div style={{ fontSize: 10, color: "#6b7280", marginBottom: 2 }}>Color ramp</div>
          <div style={{ display: "flex", gap: 3 }}>
            {Object.keys(ramps).map(r => (
              <button key={r} onClick={() => setSelectedRamp(r)} title={r} style={{
                width: 18, height: 18, borderRadius: 4, border: selectedRamp === r ? \`2px solid \${ramps[r].stroke}\` : "1px solid #d1d5db",
                background: ramps[r].fill, cursor: "pointer", padding: 0,
              }} />
            ))}
          </div>
        </div>
        <button onClick={addNode} style={{
          padding: "5px 12px", borderRadius: 6, border: "none", background: "#5B3FA0",
          color: "#fff", cursor: "pointer", fontWeight: 600, fontSize: 12, alignSelf: "end",
        }}>+ Add</button>
      </div>

      {/* Node list with remove */}
      {nodes.length > 0 && (
        <div style={{ marginTop: 8, display: "flex", gap: 4, flexWrap: "wrap" }}>
          {nodes.map(n => (
            <span key={n.id} style={{
              padding: "2px 8px", borderRadius: 4, fontSize: 11,
              background: ramps[n.color].fill, color: ramps[n.color].text,
              border: \`1px solid \${ramps[n.color].stroke}\`, display: "flex", alignItems: "center", gap: 4,
            }}>
              {n.label}
              <button onClick={() => removeNode(n.id)} style={{
                background: "none", border: "none", cursor: "pointer", padding: 0,
                fontSize: 12, color: ramps[n.color].text, opacity: 0.6, lineHeight: 1,
              }}>x</button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}`,
      },
    },
  ],
};
