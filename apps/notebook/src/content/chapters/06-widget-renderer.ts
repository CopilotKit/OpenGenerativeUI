import type { Chapter } from "@/lib/types";

export const widgetRenderer: Chapter = {
  id: "widget-renderer",
  title: "Widget Renderer",
  description:
    "The sandboxed iframe that renders agent-generated HTML, SVG, and 3D content.",
  icon: "🖼",
  cells: [
    {
      type: "markdown",
      id: "widget-concept",
      content: `# Widget Renderer

The Widget Renderer is the most flexible generative UI component. It takes **arbitrary HTML/CSS/JS** from the agent and renders it in a **sandboxed iframe**. This is what enables the agent to produce:

- 3D scenes (Three.js)
- Data visualizations (D3, Chart.js)
- Animated graphics (GSAP)
- Interactive SVG diagrams
- Custom form UIs
- Anything expressible in HTML

## Security Model

The iframe is sandboxed with \`allow-scripts allow-same-origin\`, meaning:
- Scripts can run inside the iframe
- The iframe cannot navigate the parent page
- The iframe cannot access parent cookies or storage
- Communication happens only through \`postMessage\``,
    },
    {
      type: "code",
      id: "widget-bridge",
      language: "typescript",
      filename: "Bridge API (injected into iframe)",
      content: `// The bridge script injected into every widget iframe:

// Send a new prompt to the agent from inside the widget
window.sendPrompt = (text: string) => {
  window.parent.postMessage(
    { type: "send-prompt", prompt: text },
    "*"
  );
};

// Open an external link (handled by parent)
window.openLink = (url: string) => {
  window.parent.postMessage(
    { type: "open-link", url },
    "*"
  );
};

// Auto-resize: report height changes to parent
const observer = new ResizeObserver(() => {
  window.parent.postMessage(
    { type: "resize", height: document.body.scrollHeight },
    "*"
  );
});
observer.observe(document.body);`,
    },
    {
      type: "markdown",
      id: "widget-streaming",
      content: `## Streaming Updates

When the agent streams HTML content, the widget renderer uses **Idiomorph** for efficient DOM diffing. Instead of replacing the entire iframe content on each chunk, Idiomorph morphs the existing DOM to match the new HTML — preserving interactive state, animations, and scroll position.

The flow works like this:

1. Agent starts streaming HTML → Empty iframe shell loaded
2. Each HTML chunk → Sent via \`postMessage\` to the iframe
3. Inside the iframe → Idiomorph morphs the DOM (minimal changes)
4. Agent finishes → Final HTML applied, export overlay appears

## Import Maps

The iframe includes import maps so widgets can use ES modules directly:`,
    },
    {
      type: "code",
      id: "widget-imports",
      language: "html",
      filename: "Import map (injected into iframe head)",
      content: `<script type="importmap">
{
  "imports": {
    "three": "https://esm.sh/three@0.170.0",
    "three/addons/": "https://esm.sh/three@0.170.0/examples/jsm/",
    "gsap": "https://esm.sh/gsap@3.12.7",
    "d3": "https://esm.sh/d3@7.9.0",
    "chart.js": "https://esm.sh/chart.js@4.4.7",
    "chart.js/auto": "https://esm.sh/chart.js@4.4.7/auto"
  }
}
</script>`,
    },
    {
      type: "playground",
      id: "widget-playground",
      title: "Try it: Mini Widget Renderer",
      files: {
        "/App.js": `import { useState, useRef, useEffect } from "react";

const defaultHTML = \`<div style="font-family: 'Plus Jakarta Sans', sans-serif; padding: 24px;">
  <h2 style="font-size: 20px; font-weight: 700;
    background: linear-gradient(135deg, #9599CC, #1B936F);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
    Hello from the Widget!
  </h2>
  <p style="color: #6b7280; font-size: 14px;">
    This HTML is rendered in an iframe, just like the real widget renderer.
  </p>
  <div style="display: flex; gap: 8px; margin-top: 16px;">
    <div style="width: 60px; height: 60px; border-radius: 12px;
      background: linear-gradient(135deg, #BEC2FF, #85E0CE);
      animation: pulse 2s ease-in-out infinite;" />
    <div style="width: 60px; height: 60px; border-radius: 12px;
      background: linear-gradient(135deg, #85E0CE, #BEC2FF);
      animation: pulse 2s ease-in-out infinite 0.3s;" />
    <div style="width: 60px; height: 60px; border-radius: 12px;
      background: linear-gradient(135deg, #9599CC, #A8E9DC);
      animation: pulse 2s ease-in-out infinite 0.6s;" />
  </div>
  <style>
    @keyframes pulse {
      0%, 100% { transform: scale(1); opacity: 1; }
      50% { transform: scale(0.9); opacity: 0.7; }
    }
  </style>
</div>\`;

export default function App() {
  const [html, setHtml] = useState(defaultHTML);
  const iframeRef = useRef(null);

  useEffect(() => {
    if (!iframeRef.current) return;
    const doc = iframeRef.current.contentDocument;
    if (!doc) return;
    doc.open();
    doc.write(\`<!DOCTYPE html>
<html>
<head>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
</head>
<body style="margin:0;background:transparent;">\${html}</body>
</html>\`);
    doc.close();
  }, [html]);

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
        <div style={{ flex: 1 }}>
          <div style={{
            padding: "8px 12px", fontSize: 12, fontWeight: 600,
            background: "#f9fafb", borderBottom: "1px solid #e5e7eb",
            color: "#6b7280",
          }}>
            Edit HTML
          </div>
          <textarea
            value={html}
            onChange={(e) => setHtml(e.target.value)}
            style={{
              width: "100%", height: 180, padding: 12, border: "none",
              fontFamily: "'SF Mono', 'Fira Code', monospace", fontSize: 12,
              lineHeight: 1.6, resize: "none", outline: "none",
              background: "#fff",
            }}
          />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{
            padding: "8px 12px", fontSize: 12, fontWeight: 600,
            background: "#f9fafb", borderBottom: "1px solid #e5e7eb",
            borderTop: "1px solid #e5e7eb",
            color: "#6b7280",
          }}>
            Preview (sandboxed iframe)
          </div>
          <iframe
            ref={iframeRef}
            sandbox="allow-scripts"
            style={{
              width: "100%", height: 200, border: "none",
              background: "#fff",
            }}
          />
        </div>
      </div>
    </div>
  );
}`,
      },
    },
    {
      type: "markdown",
      id: "widget-conclusion",
      content: `## What's Next?

You've now seen the core building blocks of OpenGenerativeUI:

1. **Agent State** — State lives in the agent, syncs bidirectionally
2. **Generative UI** — Agent renders React components, not just text
3. **CopilotKit Hooks** — \`useAgent\`, \`useComponent\`, \`useFrontendTool\`, and more
4. **Frontend Tools** — Agent calls JavaScript in the browser
5. **Widget Renderer** — Sandboxed iframe for arbitrary HTML/SVG/3D content

To get started with your own project, fork the repo and follow the setup instructions in the README. The todo list is a great starting point — extend it with categories, priorities, due dates, or replace it entirely with your own domain.

Happy building!`,
    },
  ],
};
