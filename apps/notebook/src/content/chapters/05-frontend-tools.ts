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

Skills are served through an **MCP (Model Context Protocol) server**, making them accessible to both the LangGraph agent and external AI tools like Claude Desktop.

## Skill Architecture

\`\`\`
apps/mcp/
├── skills/
│   ├── master-agent-playbook.txt    # Core philosophy, response patterns
│   ├── svg-diagram-skill.txt        # SVG setup, typography, color ramps
│   └── agent-skills-vol2.txt        # Advanced design system, UI mockups
└── src/
    ├── server.ts    # MCP server (resources, prompts, tools)
    ├── skills.ts    # Skill file loader
    └── renderer.ts  # HTML document assembly with design system
\`\`\`

The agent also has a local \`skills/\` directory loaded via \`create_deep_agent(skills=[...])\` — these are loaded at agent startup and available as contextual instructions.`,
    },
    {
      type: "markdown",
      id: "skills-mcp-server",
      content: `## MCP Server

The MCP server exposes skills in three ways:

| MCP concept | Name | What it provides |
|-------------|------|-----------------|
| **Resource** | \`skills://list\` | JSON array of available skill names |
| **Resource** | \`skills://{name}\` | Full text of a specific skill |
| **Prompt** | \`create_widget\` | master-agent-playbook.txt as a pre-composed prompt |
| **Prompt** | \`create_svg_diagram\` | svg-diagram-skill.txt |
| **Prompt** | \`create_visualization\` | agent-skills-vol2.txt |
| **Tool** | \`assemble_document\` | Wraps raw HTML with the full design system CSS/JS |`,
    },
    {
      type: "code",
      id: "skills-server-code",
      language: "typescript",
      filename: "apps/mcp/src/server.ts",
      content: `import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { listSkills, loadSkill } from "./skills.js";
import { assembleDocument } from "./renderer.js";

export function createMcpServer(): McpServer {
  const server = new McpServer({
    name: "open-generative-ui",
    version: "0.1.0",
  });

  // Resources: list and read skill documents
  server.registerResource("skills-list", "skills://list", {
    description: "JSON array of available skill names",
    mimeType: "application/json",
  }, async () => ({
    contents: [{ uri: "skills://list", text: JSON.stringify(listSkills()) }],
  }));

  server.registerResource("skill",
    new ResourceTemplate("skills://{name}", { /* ... */ }),
    { description: "Full text of a skill document" },
    async (uri, { name }) => ({
      contents: [{ uri: uri.href, text: loadSkill(name as string) }],
    })
  );

  // Prompts: pre-composed skill instructions
  server.registerPrompt("create_widget", {
    description: "Instructions for creating interactive HTML widgets",
  }, async () => ({
    messages: [{ role: "user", content: {
      type: "text", text: loadSkill("master-agent-playbook")
    }}],
  }));

  // Tool: wrap HTML with the full design system
  server.registerTool("assemble_document", {
    description: "Wraps HTML with theme CSS, SVG classes, form styles, and bridge JS",
    inputSchema: {
      title: z.string(),
      description: z.string(),
      html: z.string().describe("Self-contained HTML fragment"),
    },
  }, async ({ html }) => ({
    content: [{ type: "text", text: assembleDocument(html) }],
  }));

  return server;
}`,
    },
    {
      type: "markdown",
      id: "skills-playbook",
      content: `## Master Agent Playbook

The core skill document defines the agent's **response philosophy** and **decision tree**:

**"Show, don't tell"** — the agent prioritizes visuals over text.

### Response Decision Tree

| User asks about... | Agent produces... |
|---------------------|-------------------|
| Quick fact | 1-2 sentences of text |
| Concept / visual | SVG diagram |
| Process / flow | Flowchart or stepper |
| Data-driven question | Interactive chart |
| Abstract / explorable | Interactive widget |
| Working code | Running artifact |
| Comparison | Side-by-side visual |

### 3-Layer Response Pattern

Every visual response uses:
1. **Hook** (1-2 sentences) — Validate the question, set context
2. **Visual** — The core explanation as a rendered component
3. **Narration** (2-4 paragraphs) — Walk through the visual, offer to go deeper`,
    },
    {
      type: "markdown",
      id: "skills-svg",
      content: `## SVG Diagram Skill

Defines precise rules for hand-drawn SVG diagrams:

- **ViewBox**: Always 680px wide, height = bottom element y + height + 40px
- **Typography**: 14px titles, 12px subtitles, weights 400/500 only, sentence case
- **Text width estimation**: 14px = 8px/char, 12px = 7px/char, +48px padding
- **9 color ramps**: Teal, Purple, Coral, Pink, Gray, Blue, Green, Amber, Red — each with light/dark variants
- **Node heights**: Single-line = 44px, two-line = 56px
- **Arrows**: stroke-width 1.5px, marker-end, never cross boxes
- **Critical checks**: ViewBox height correct, text fits rectangles, all paths have fill="none"`,
    },
    {
      type: "markdown",
      id: "skills-vol2",
      content: `## Advanced Skills (Vol. 2)

The advanced skill document adds a **full design system** with CSS variables:

\`\`\`
--color-background-primary/secondary/tertiary/info/danger/success/warning
--color-text-primary/secondary/tertiary/info/danger/success/warning
--color-border-primary/secondary/tertiary/info/danger/success/warning
--font-sans/serif/mono
--border-radius-md(8px)/lg(12px)/xl(16px)
\`\`\`

**Key rules**:
- Typography: h1=22px, h2=18px, h3=16px, body=16px, all weight 500 max
- Borders: 0.5px solid with tertiary border color
- Cards: primary background, tertiary border, lg radius, 1rem padding
- **Explicitly banned**: Gradients, shadows, blur, glow, neon, emoji
- Min font-size: 11px`,
    },
    {
      type: "code",
      id: "skills-renderer",
      language: "typescript",
      filename: "apps/mcp/src/renderer.ts — assembleDocument (simplified)",
      content: `// The assemble_document tool wraps agent HTML with:
// 1. Theme CSS — light/dark mode variables
// 2. SVG Classes — .c-purple, .c-teal, .c-blue, etc.
// 3. Form Styles — native-looking buttons, inputs, sliders
// 4. Bridge JS — sendPrompt(), openLink(), auto-resize

export function assembleDocument(html: string): string {
  return \`<!DOCTYPE html>
<html>
<head>
  <style>\${THEME_CSS}</style>
  <style>\${SVG_CLASSES_CSS}</style>
  <style>\${FORM_STYLES_CSS}</style>
</head>
<body>
  \${html}
  <script>\${BRIDGE_JS}</script>
</body>
</html>\`;
}

// WARNING: Keep in sync with widget-renderer.tsx
// when the design system changes.`,
    },
    {
      type: "playground",
      id: "skills-playground",
      title: "Try it: Skill-Guided SVG Diagram",
      files: {
        "/App.js": `import { useState } from "react";

// This demonstrates the SVG diagram skill rules:
// - ViewBox 680px wide, responsive
// - 14px titles, 12px subtitles
// - 9 color ramps with light/dark variants
// - Proper text width estimation

const colors = {
  teal:   { fill: "#E1F5EE", stroke: "#0F6E56", text: "#085041" },
  purple: { fill: "#EDE9F5", stroke: "#5B3FA0", text: "#3E2B6F" },
  coral:  { fill: "#FCE8E8", stroke: "#C44D4D", text: "#8A2E2E" },
  blue:   { fill: "#E3EFFC", stroke: "#2663B3", text: "#1A4680" },
  amber:  { fill: "#FEF3DC", stroke: "#B8860B", text: "#7A5A07" },
};

function DiagramBuilder() {
  const [nodes, setNodes] = useState([
    { id: 1, label: "User Input", sub: "Chat message", color: "teal", x: 250, y: 40 },
    { id: 2, label: "CopilotKit Runtime", sub: "API route", color: "purple", x: 250, y: 130 },
    { id: 3, label: "LangGraph Agent", sub: "Tools + state", color: "blue", x: 250, y: 220 },
    { id: 4, label: "Widget Renderer", sub: "Sandboxed iframe", color: "coral", x: 250, y: 310 },
  ]);

  const [selectedColor, setSelectedColor] = useState("teal");

  const addNode = () => {
    const lastY = nodes.length > 0 ? nodes[nodes.length - 1].y : -50;
    setNodes([...nodes, {
      id: Date.now(),
      label: "New Node",
      sub: "Description",
      color: selectedColor,
      x: 250,
      y: lastY + 90,
    }]);
  };

  const svgHeight = nodes.length > 0
    ? nodes[nodes.length - 1].y + 56 + 40  // last y + node height + padding
    : 100;

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", padding: 20 }}>
      <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>
        SVG Diagram Skill Rules
      </h2>

      <svg width="100%" viewBox={\`0 0 680 \${svgHeight}\`} xmlns="http://www.w3.org/2000/svg">
        {/* Arrow marker */}
        <defs>
          <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5"
            markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M2 1L8 5L2 9" fill="none" stroke="context-stroke"
              strokeWidth="1.5" strokeLinecap="round" />
          </marker>
        </defs>

        {/* Connectors */}
        {nodes.slice(1).map((node, i) => {
          const prev = nodes[i];
          return (
            <line key={\`arrow-\${i}\`}
              x1={prev.x + 90} y1={prev.y + 56}
              x2={node.x + 90} y2={node.y}
              stroke="#9ca3af" strokeWidth="1.5"
              markerEnd="url(#arrow)"
            />
          );
        })}

        {/* Nodes */}
        {nodes.map(node => {
          const c = colors[node.color];
          // Text width: 14px = 8px/char, 12px = 7px/char, +48px padding
          const titleW = node.label.length * 8;
          const subW = node.sub.length * 7;
          const w = Math.max(titleW, subW) + 48;
          return (
            <g key={node.id}>
              <rect x={node.x} y={node.y} width={w} height={56}
                rx="8" fill={c.fill} stroke={c.stroke} strokeWidth="1" />
              <text x={node.x + w/2} y={node.y + 22}
                textAnchor="middle" dominantBaseline="central"
                style={{ fontSize: 14, fontWeight: 500, fill: c.text }}>
                {node.label}
              </text>
              <text x={node.x + w/2} y={node.y + 40}
                textAnchor="middle" dominantBaseline="central"
                style={{ fontSize: 12, fill: c.text, opacity: 0.7 }}>
                {node.sub}
              </text>
            </g>
          );
        })}
      </svg>

      <div style={{ display: "flex", gap: 8, marginTop: 12, alignItems: "center" }}>
        {Object.keys(colors).map(c => (
          <button key={c} onClick={() => setSelectedColor(c)} style={{
            width: 28, height: 28, borderRadius: 6,
            background: colors[c].fill, border: \`2px solid \${selectedColor === c ? colors[c].stroke : "transparent"}\`,
            cursor: "pointer",
          }} title={c} />
        ))}
        <button onClick={addNode} style={{
          padding: "6px 14px", borderRadius: 8, border: "none",
          background: "#9599CC", color: "#fff", cursor: "pointer",
          fontWeight: 600, fontSize: 12,
        }}>
          + Add Node
        </button>
      </div>

      <p style={{ fontSize: 11, color: "#9ca3af", marginTop: 8 }}>
        ViewBox: 680 x {svgHeight} | Nodes: 56px tall | Text: 14px/12px | Width = max(chars x 8, chars x 7) + 48
      </p>
    </div>
  );
}

export default DiagramBuilder;`,
      },
    },
  ],
};
