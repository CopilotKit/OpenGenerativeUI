import type { Chapter } from "@/lib/types";

export const widgetRenderer: Chapter = {
  id: "widget-renderer",
  title: "Widget Renderer",
  description:
    "The sandboxed iframe engine that renders agent-generated HTML, SVG, and 3D.",
  icon: "🖼",
  cells: [
    {
      type: "markdown",
      id: "wr-overview",
      content: `# Widget Renderer

The Widget Renderer is the core rendering engine. It takes arbitrary HTML from the agent and renders it in a **sandboxed iframe** with a full design system, streaming support, and a communication bridge.

## What gets injected into the iframe

The iframe isn't just raw HTML. Before any agent content is inserted, the iframe shell is assembled with 6 layers:

1. **Theme CSS** — Light/dark mode variables (\`--color-text-primary\`, \`--color-background-secondary\`, etc.)
2. **SVG Classes** — Pre-built CSS classes for colored SVG elements (\`.c-purple\`, \`.c-teal\`, \`.c-blue\`)
3. **Form Styles** — Native-looking buttons, inputs, sliders, checkboxes with animations
4. **Bridge JS** — \`window.sendPrompt()\`, \`window.openLink()\`, auto-resize reporting
5. **Import Map** — ES module aliases for Three.js, GSAP, D3, Chart.js from esm.sh
6. **CSP Policy** — Restricts scripts to approved CDNs (cdnjs, esm.sh, jsdelivr, unpkg)`,
    },
    {
      type: "code",
      id: "wr-bridge",
      language: "typescript",
      filename: "Bridge JS (injected into every iframe)",
      content: `// The bridge gives widgets 3 capabilities:

// 1. Send a new prompt to the agent
window.sendPrompt = (text: string) => {
  window.parent.postMessage(
    { type: "send-prompt", prompt: text },
    "*"
  );
};

// 2. Open external links (parent handles navigation)
window.openLink = (url: string) => {
  window.parent.postMessage(
    { type: "open-link", url },
    "*"
  );
};

// 3. Auto-resize: report content height to parent
// Content is cloned off-screen to prevent viewport inflation
function reportHeight() {
  const clone = document.body.cloneNode(true);
  clone.style.cssText = "position:absolute;left:-9999px;width:" +
    document.body.clientWidth + "px;visibility:hidden;";
  document.documentElement.appendChild(clone);
  const h = clone.scrollHeight;
  clone.remove();
  window.parent.postMessage({ type: "widget-resize", height: h }, "*");
}

new ResizeObserver(reportHeight).observe(document.body);`,
    },
    {
      type: "code",
      id: "wr-importmap",
      language: "html",
      filename: "Import Map (enables ES module imports in widgets)",
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
</script>

<!-- Widgets use these with <script type="module">:
  import * as THREE from "three";
  import { OrbitControls } from "three/addons/controls/OrbitControls.js";
  import gsap from "gsap";
  import * as d3 from "d3";
-->`,
    },
    {
      type: "markdown",
      id: "wr-streaming",
      content: `## Streaming with Idiomorph

When the agent streams HTML, the widget renderer uses **Idiomorph** for efficient DOM diffing. Instead of replacing the entire iframe on each chunk:

1. Each HTML chunk arrives via \`postMessage({ type: 'update-content', html })\`
2. \`<script>\` tags are **stripped before insertion** (prevents partial script execution)
3. Idiomorph morphs the existing DOM to match new HTML (preserves state, animations, scroll)
4. Scripts execute **sequentially** only when all tags are closed
5. Module detection: if a script uses \`import\`/\`export\` but lacks \`type="module"\`, it's auto-promoted
6. Scripts are deduped via base64 hash to prevent re-execution on morph cycles

The iframe auto-resizes by reporting content height changes. Height is clamped between 50px and 4000px with an 800ms settling period before the streaming indicator disappears.`,
    },
    {
      type: "code",
      id: "wr-react-component",
      language: "tsx",
      filename: "widget-renderer.tsx — React component (simplified)",
      content: `export function WidgetRenderer({ title, description, html }: WidgetProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState(200);
  const [htmlSettled, setHtmlSettled] = useState(false);

  // Initialize empty iframe shell (prevents broken partial HTML)
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    iframe.srcdoc = assembleShell(); // Theme CSS + Bridge JS + Import Map
  }, []);

  // Stream HTML updates via postMessage
  useEffect(() => {
    if (!html || !loaded) return;
    iframe.contentWindow.postMessage(
      { type: "update-content", html },
      "*"
    );
  }, [html, loaded]);

  // Listen for resize messages from iframe bridge
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === "widget-resize") {
        setHeight(Math.max(50, Math.min(4000, e.data.height)));
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  return (
    <div>
      <header>{title}</header>
      <p>{description}</p>
      {isStreaming && <StreamingIndicator />}
      <iframe
        ref={iframeRef}
        sandbox="allow-scripts allow-same-origin"
        style={{ height }}
      />
      {htmlSettled && <ExportOverlay />}
    </div>
  );
}`,
    },
    {
      type: "playground",
      id: "wr-playground",
      title: "Try it: Mini Widget Renderer",
      files: {
        "/App.js": `import { useState, useRef, useEffect } from "react";

const defaultHTML = \`<div style="font-family: system-ui, sans-serif; padding: 24px;">
  <h2 style="font-size: 20px; font-weight: 500;
    color: var(--color-text-primary, #1a1a1a);">
    Interactive Widget
  </h2>
  <p style="color: var(--color-text-secondary, #73726c); font-size: 14px;">
    Edit this HTML — it renders in a sandboxed iframe, just like the real widget renderer.
  </p>

  <div id="boxes" style="display: flex; gap: 8px; margin-top: 16px;"></div>

  <script>
    const colors = ["#BEC2FF", "#85E0CE", "#9599CC", "#A8E9DC", "#D4D7FF"];
    const container = document.getElementById("boxes");
    colors.forEach((c, i) => {
      const box = document.createElement("div");
      box.style.cssText = \\\`
        width: 50px; height: 50px; border-radius: 10px;
        background: \\\${c}; cursor: pointer;
        transition: transform 0.2s ease;
      \\\`;
      box.onmouseenter = () => box.style.transform = "scale(1.2) rotate(5deg)";
      box.onmouseleave = () => box.style.transform = "scale(1)";
      box.onclick = () => {
        box.style.borderRadius = box.style.borderRadius === "50%" ? "10px" : "50%";
      };
      container.appendChild(box);
    });
  </script>
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
<html><head>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
</head><body style="margin:0;background:transparent;">\${html}</body></html>\`);
    doc.close();
  }, [html]);

  return (
    <div style={{ fontFamily: "system-ui, sans-serif" }}>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div>
          <div style={{
            padding: "8px 12px", fontSize: 12, fontWeight: 600,
            background: "#f9fafb", borderBottom: "1px solid #e5e7eb",
            color: "#6b7280",
          }}>
            HTML (edit me)
          </div>
          <textarea
            value={html}
            onChange={(e) => setHtml(e.target.value)}
            spellCheck={false}
            style={{
              width: "100%", height: 200, padding: 12, border: "none",
              fontFamily: "'SF Mono', 'Fira Code', monospace", fontSize: 12,
              lineHeight: 1.5, resize: "none", outline: "none", background: "#fff",
            }}
          />
        </div>
        <div>
          <div style={{
            padding: "8px 12px", fontSize: 12, fontWeight: 600,
            background: "#f9fafb", borderTop: "1px solid #e5e7eb",
            borderBottom: "1px solid #e5e7eb", color: "#6b7280",
          }}>
            Sandboxed iframe preview
          </div>
          <iframe
            ref={iframeRef}
            sandbox="allow-scripts"
            style={{ width: "100%", height: 200, border: "none", background: "#fff" }}
          />
        </div>
      </div>
    </div>
  );
}`,
      },
    },
  ],
};
