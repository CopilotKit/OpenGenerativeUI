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
      type: "markdown",
      id: "wr-streaming",
      content: `## Streaming with Idiomorph

When the agent streams HTML, the widget renderer uses **Idiomorph** for efficient DOM diffing. Instead of replacing the entire iframe on each chunk, Idiomorph morphs the existing DOM — preserving interactive state, animations, and scroll position.

The playground below demonstrates this: watch the HTML stream in character-by-character (like an LLM producing tokens), while the iframe updates progressively without flickering.`,
    },
    {
      type: "playground",
      id: "wr-streaming-playground",
      title: "Live: Streaming HTML into an iframe",
      files: {
        "/App.js": `import { useState, useRef, useEffect, useCallback } from "react";

// This is a real demo of how the widget renderer streams HTML.
// The HTML arrives token-by-token (like an LLM), and the iframe
// updates progressively — just like the real widget-renderer.tsx.

const FULL_HTML = \`<style>
  body { font-family: system-ui, sans-serif; padding: 20px; margin: 0; }
  .card { background: #f7f6f3; border: 0.5px solid rgba(0,0,0,0.15);
    border-radius: 12px; padding: 16px; margin-bottom: 12px; }
  .metric { display: flex; justify-content: space-between; align-items: baseline;
    padding: 8px 0; border-bottom: 0.5px solid rgba(0,0,0,0.08); }
  .metric:last-child { border: none; }
  .label { font-size: 14px; color: #73726c; }
  .value { font-size: 20px; font-weight: 500; color: #1a1a1a; }
  .bar-row { display: flex; align-items: center; gap: 10px; margin: 6px 0; }
  .bar-label { width: 80px; font-size: 12px; color: #73726c; text-align: right; }
  .bar-track { flex: 1; height: 20px; background: #efeee9; border-radius: 6px; overflow: hidden; }
  .bar-fill { height: 100%; border-radius: 6px; transition: width 0.8s ease; }
  h2 { font-size: 18px; font-weight: 500; color: #1a1a1a; margin: 0 0 12px; }
  h3 { font-size: 16px; font-weight: 500; color: #1a1a1a; margin: 0 0 8px; }
</style>
<h2>Agent Performance Dashboard</h2>
<div class="card">
  <h3>Key Metrics</h3>
  <div class="metric"><span class="label">Tool calls</span><span class="value">1,247</span></div>
  <div class="metric"><span class="label">Avg latency</span><span class="value">340ms</span></div>
  <div class="metric"><span class="label">Success rate</span><span class="value">99.2%</span></div>
  <div class="metric"><span class="label">Active threads</span><span class="value">42</span></div>
</div>
<div class="card">
  <h3>Tool Usage</h3>
  <div class="bar-row"><span class="bar-label">widgets</span><div class="bar-track"><div class="bar-fill" style="width:78%;background:#5B3FA0"></div></div><span style="font-size:12px;color:#73726c">78%</span></div>
  <div class="bar-row"><span class="bar-label">charts</span><div class="bar-track"><div class="bar-fill" style="width:52%;background:#0F6E56"></div></div><span style="font-size:12px;color:#73726c">52%</span></div>
  <div class="bar-row"><span class="bar-label">todos</span><div class="bar-track"><div class="bar-fill" style="width:35%;background:#2663B3"></div></div><span style="font-size:12px;color:#73726c">35%</span></div>
  <div class="bar-row"><span class="bar-label">queries</span><div class="bar-track"><div class="bar-fill" style="width:20%;background:#C44D4D"></div></div><span style="font-size:12px;color:#73726c">20%</span></div>
</div>\`;

export default function App() {
  const [streamedHtml, setStreamedHtml] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [charIndex, setCharIndex] = useState(0);
  const [iframeHeight, setIframeHeight] = useState(60);
  const iframeRef = useRef(null);
  const intervalRef = useRef(null);

  // Listen for resize messages from iframe (just like the real bridge)
  useEffect(() => {
    const handler = (e) => {
      if (e.data?.type === "widget-resize") {
        setIframeHeight(Math.max(60, Math.min(800, e.data.height + 10)));
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  // Update iframe content as HTML streams in
  useEffect(() => {
    if (!iframeRef.current || !streamedHtml) return;
    const doc = iframeRef.current.contentDocument;
    if (!doc) return;
    doc.open();
    doc.write(\`<!DOCTYPE html><html><head></head><body style="margin:0">\${streamedHtml}
      <script>
        function reportHeight() {
          window.parent.postMessage({ type: "widget-resize", height: document.body.scrollHeight }, "*");
        }
        new ResizeObserver(reportHeight).observe(document.body);
        reportHeight();
      </script>
    </body></html>\`);
    doc.close();
  }, [streamedHtml]);

  const startStream = useCallback(() => {
    setStreamedHtml("");
    setCharIndex(0);
    setIsStreaming(true);
    setIframeHeight(60);
    let idx = 0;
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      // Stream ~8 chars at a time (simulating token chunks)
      idx = Math.min(idx + 8, FULL_HTML.length);
      setStreamedHtml(FULL_HTML.slice(0, idx));
      setCharIndex(idx);
      if (idx >= FULL_HTML.length) {
        clearInterval(intervalRef.current);
        setIsStreaming(false);
      }
    }, 16);
  }, []);

  useEffect(() => () => clearInterval(intervalRef.current), []);

  const pct = FULL_HTML.length > 0 ? Math.round((charIndex / FULL_HTML.length) * 100) : 0;

  return (
    <div style={{ fontFamily: "system-ui, sans-serif" }}>
      {/* Streaming progress bar */}
      <div style={{ padding: "12px 16px", borderBottom: "1px solid #e5e7eb", display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={startStream} disabled={isStreaming} style={{
          padding: "6px 14px", borderRadius: 8, border: "none",
          background: isStreaming ? "#e5e7eb" : "#5B3FA0", color: isStreaming ? "#9ca3af" : "#fff",
          cursor: isStreaming ? "default" : "pointer", fontWeight: 600, fontSize: 13, whiteSpace: "nowrap",
        }}>
          {isStreaming ? "Streaming..." : "Stream HTML"}
        </button>
        <div style={{ flex: 1, height: 6, background: "#efeee9", borderRadius: 3, overflow: "hidden" }}>
          <div style={{ width: pct + "%", height: "100%", background: "linear-gradient(90deg, #5B3FA0, #0F6E56)", borderRadius: 3, transition: "width 0.05s linear" }} />
        </div>
        <span style={{ fontSize: 11, color: "#73726c", fontFamily: "monospace", minWidth: 60, textAlign: "right" }}>
          {charIndex}/{FULL_HTML.length}
        </span>
      </div>

      {/* Live iframe preview — auto-resizes via bridge postMessage */}
      <div style={{ background: "#fff" }}>
        {!streamedHtml && !isStreaming ? (
          <div style={{ padding: 40, textAlign: "center", color: "#9ca3af", fontSize: 14 }}>
            Click "Stream HTML" to watch the widget render progressively
          </div>
        ) : (
          <iframe
            ref={iframeRef}
            sandbox="allow-scripts allow-same-origin"
            style={{ width: "100%", height: iframeHeight, border: "none", display: "block", transition: "height 0.3s ease" }}
          />
        )}
      </div>
    </div>
  );
}`,
      },
    },
    {
      type: "playground",
      id: "wr-bridge-playground",
      title: "Live: Bridge communication (sendPrompt + auto-resize)",
      files: {
        "/App.js": `import { useState, useRef, useEffect } from "react";

// This demonstrates the real bridge: the iframe sends messages
// to the parent via postMessage, and the parent listens.

const WIDGET_HTML = \`
<style>
  body { font-family: system-ui, sans-serif; padding: 16px; margin: 0; }
  .prompt-btn { padding: 8px 16px; border-radius: 8px; border: none;
    background: #5B3FA0; color: #fff; font-weight: 500; cursor: pointer;
    font-size: 13px; margin: 4px; transition: transform 0.15s; }
  .prompt-btn:hover { transform: scale(1.03); }
  .expander { margin-top: 12px; }
  .toggle-btn { padding: 6px 12px; border-radius: 6px; border: 0.5px solid rgba(0,0,0,0.15);
    background: #f7f6f3; cursor: pointer; font-size: 12px; color: #73726c; }
  .extra { margin-top: 8px; padding: 12px; background: #f7f6f3; border-radius: 8px;
    font-size: 13px; color: #73726c; display: none; }
  .extra.open { display: block; }
</style>
<h3 style="font-size:16px;font-weight:500;margin:0 0 8px">Bridge Demo Widget</h3>
<p style="font-size:13px;color:#73726c;margin:0 0 12px">
  These buttons call <code>window.sendPrompt()</code> — the parent catches the message.
</p>
<div>
  <button class="prompt-btn" onclick="window.parent.postMessage({type:'send-prompt',prompt:'Show me a bar chart of quarterly revenue'},'*')">
    Ask for a chart
  </button>
  <button class="prompt-btn" onclick="window.parent.postMessage({type:'send-prompt',prompt:'Add 3 todos for a product launch'},'*')">
    Ask for todos
  </button>
  <button class="prompt-btn" onclick="window.parent.postMessage({type:'send-prompt',prompt:'Explain the widget renderer architecture'},'*')">
    Ask to explain
  </button>
</div>
<div class="expander">
  <button class="toggle-btn" onclick="
    var el = document.getElementById('extra');
    el.classList.toggle('open');
    window.parent.postMessage({type:'widget-resize', height: document.body.scrollHeight}, '*');
  ">Toggle more content (triggers auto-resize)</button>
  <div id="extra" class="extra">
    This extra content changes the iframe height. The bridge reports the new height
    to the parent via <code>postMessage({type:'widget-resize'})</code>, and the
    parent adjusts the iframe size — no fixed heights needed.
  </div>
</div>
\`;

export default function App() {
  const iframeRef = useRef(null);
  const [height, setHeight] = useState(180);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const handler = (e) => {
      if (e.data?.type === "widget-resize") {
        setHeight(Math.max(80, e.data.height + 10));
      }
      if (e.data?.type === "send-prompt") {
        setMessages(prev => [...prev, { text: e.data.prompt, time: new Date().toLocaleTimeString() }]);
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  useEffect(() => {
    if (!iframeRef.current) return;
    const doc = iframeRef.current.contentDocument;
    if (!doc) return;
    doc.open();
    doc.write(\`<!DOCTYPE html><html><body style="margin:0">\${WIDGET_HTML}
      <script>
        new ResizeObserver(() => {
          window.parent.postMessage({type:'widget-resize', height: document.body.scrollHeight}, '*');
        }).observe(document.body);
      </script>
    </body></html>\`);
    doc.close();
  }, []);

  return (
    <div style={{ fontFamily: "system-ui, sans-serif" }}>
      {/* The widget iframe */}
      <iframe
        ref={iframeRef}
        sandbox="allow-scripts allow-same-origin"
        style={{ width: "100%", height, border: "none", display: "block",
          transition: "height 0.3s ease", borderBottom: "1px solid #e5e7eb" }}
      />

      {/* Parent message log — shows what the bridge sent */}
      <div style={{ padding: 12, background: "#f9fafb", minHeight: 60 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>
          Parent received via postMessage:
        </div>
        {messages.length === 0 ? (
          <div style={{ fontSize: 12, color: "#9ca3af", fontStyle: "italic" }}>
            Click a button inside the widget above...
          </div>
        ) : (
          messages.map((m, i) => (
            <div key={i} style={{
              padding: "6px 10px", marginBottom: 4, borderRadius: 6,
              background: "#fff", border: "1px solid #e5e7eb", fontSize: 12,
              display: "flex", justifyContent: "space-between",
            }}>
              <span><strong style={{color:"#5B3FA0"}}>sendPrompt:</strong> {m.text}</span>
              <span style={{ color: "#9ca3af", fontSize: 10 }}>{m.time}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}`,
      },
    },
  ],
};
