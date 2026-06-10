"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { z } from "zod";
import {
  THEME_CSS,
  SVG_CLASSES_CSS,
  FORM_STYLES_WITH_STAGGER_CSS,
  IMPORTMAP_SCRIPT_TAG,
} from "@repo/design-system";
import { ExportOverlay } from "./export-overlay";
import { IDIOMORPH_JS } from "./idiomorph-inline";

// ─── Zod Schema (CopilotKit parameter contract) ─────────────────────
export const WidgetRendererProps = z.object({
  title: z
    .string()
    .describe("Short title for the visualization, e.g. 'Binary Search' or 'Load Balancer Architecture'"),
  description: z
    .string()
    .describe("One-sentence explanation of what this visualization demonstrates"),
  html: z
    .string()
    .describe(
      "Self-contained HTML fragment with inline <style> and <script>. " +
        "Use CSS variables (var(--color-text-primary), etc.) for theming. " +
        "No external dependencies unless from allowed CDNs (cdnjs, esm.sh, jsdelivr, unpkg). " +
        "Include interactive controls where appropriate."
    ),
});

type WidgetRendererProps = z.infer<typeof WidgetRendererProps>;

// ─── Injected CSS (Layers 3–5) — single-sourced from @repo/design-system ─
export { THEME_CSS, SVG_CLASSES_CSS };
export const FORM_STYLES_CSS = FORM_STYLES_WITH_STAGGER_CSS;

// ─── Injected JS: Bridge Functions + Auto-Resize (Layers 1 & 6) ─────
const BRIDGE_JS = `
// Bridge: sendPrompt
window.sendPrompt = function(text) {
  window.parent.postMessage({ type: 'send-prompt', text: text }, '*');
};

// Bridge: openLink
window.openLink = function(url) {
  window.parent.postMessage({ type: 'open-link', url: url }, '*');
};

// Intercept <a> clicks
document.addEventListener('click', function(e) {
  var a = e.target.closest('a[href]');
  if (a && a.href.startsWith('http')) {
    e.preventDefault();
    window.parent.postMessage({ type: 'open-link', url: a.href }, '*');
  }
});

// Listen for streaming content updates from parent
window.addEventListener('message', function(e) {
  if (e.source !== window.parent) return;
  if (e.data && e.data.type === 'update-content') {
    var content = document.getElementById('content');
    if (!content) return;

    // Strip script tags from HTML before inserting — scripts are handled separately below
    var rawHtml = e.data.html;
    var tmp = document.createElement('div');
    tmp.innerHTML = rawHtml;
    var incomingScripts = [];
    var scriptOpens = (rawHtml.match(/<script[\\s>]/gi) || []).length;
    var scriptCloses = (rawHtml.match(/<\\/script>/gi) || []).length;
    var allScriptsClosed = scriptOpens <= scriptCloses;
    tmp.querySelectorAll('script').forEach(function(s) {
      incomingScripts.push({ src: s.src, text: s.textContent, type: s.type || '' });
      s.remove();
    });

    // Reset tracking when content is cleared (new streaming session)
    if (!tmp.innerHTML.trim()) {
      content.removeAttribute('data-has-content');
      content.innerHTML = '';
      reportHeight();
      return;
    }

    // First render: add stagger class for initial entrance animation
    var isFirstRender = !content.hasAttribute('data-has-content');
    if (isFirstRender) {
      content.classList.add('initial-render');
      content.setAttribute('data-has-content', '1');
      setTimeout(function() { content.classList.remove('initial-render'); }, 800);
    }

    // Use idiomorph to diff/patch DOM (preserves existing nodes, no flicker)
    if (window.Idiomorph) {
      try {
        Idiomorph.morph(content, tmp, {
          morphStyle: 'innerHTML',
          callbacks: {
            beforeNodeAdded: function(node) {
              // Tag new element nodes for entrance animation
              if (node.nodeType === 1) {
                node.classList.add('morph-enter');
                node.addEventListener('animationend', function() {
                  node.classList.remove('morph-enter');
                }, { once: true });
              }
            }
          }
        });
      } catch (err) {
        // Fallback: full replacement on morph failure
        content.innerHTML = tmp.innerHTML;
      }
    } else {
      content.innerHTML = tmp.innerHTML;
    }

    // Execute only new scripts — skip entirely while a <script> tag is still streaming.
    // External scripts (src) are loaded sequentially and we wait for each to finish
    // before running subsequent scripts, so inline code can use libraries like Three.js.
    if (allScriptsClosed) {
      (function runScripts(scripts, idx) {
        if (idx >= scripts.length) return;
        var scriptInfo = scripts[idx];
        var key = scriptInfo.src || scriptInfo.text;
        if (!key || !key.trim()) { runScripts(scripts, idx + 1); return; }
        var hash = btoa(unescape(encodeURIComponent(key))).slice(0, 16).replace(/[^a-zA-Z0-9]/g, '');
        if (!hash || content.getAttribute('data-exec-' + hash)) { runScripts(scripts, idx + 1); return; }
        content.setAttribute('data-exec-' + hash, '1');
        try {
          var newScript = document.createElement('script');
          // Auto-detect ES module syntax: if the script contains import/export
          // statements but lacks type="module", promote it so the import map applies.
          var effectiveType = scriptInfo.type;
          if (!effectiveType && scriptInfo.text && /\\b(import\\s|export\\s|import\\()/.test(scriptInfo.text)) {
            effectiveType = 'module';
          }
          if (effectiveType) newScript.type = effectiveType;
          if (scriptInfo.src) {
            newScript.src = scriptInfo.src;
            newScript.onload = function() { runScripts(scripts, idx + 1); };
            newScript.onerror = function() { runScripts(scripts, idx + 1); };
            content.appendChild(newScript);
          } else {
            newScript.textContent = scriptInfo.text;
            content.appendChild(newScript);
            runScripts(scripts, idx + 1);
          }
        } catch(e) {
          console.warn('[widget] script exec failed:', e);
          runScripts(scripts, idx + 1);
        }
      })(incomingScripts, 0);
    }
    reportHeight();
  }
});

// Auto-resize: report content height to host.
// Clone the content off-screen so viewport-relative children (100vh, 100%)
// don't inflate the reading and we never mutate the visible DOM (which would
// re-trigger ResizeObserver and risk an infinite loop).
function reportHeight() {
  var content = document.getElementById('content');
  if (!content) return;
  var clone = content.cloneNode(true);
  clone.style.cssText = 'position:fixed;top:-9999px;left:-9999px;width:' + content.offsetWidth + 'px;height:auto;overflow:hidden;visibility:hidden;pointer-events:none;';
  document.body.appendChild(clone);
  var h = clone.scrollHeight;
  document.body.removeChild(clone);
  window.parent.postMessage({ type: 'widget-resize', height: h }, '*');
}
var ro = new ResizeObserver(reportHeight);
ro.observe(document.getElementById('content') || document.body);
window.addEventListener('load', reportHeight);
// Periodic reports during initial load
var _resizeInterval = setInterval(reportHeight, 200);
setTimeout(function() { clearInterval(_resizeInterval); }, 15000);
`;

// ─── Document Assembly ───────────────────────────────────────────────
/** Empty shell or shell with initial content — iframe loads once, content streamed via postMessage */
function assembleShell(initialHtml: string = ""): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  ${IMPORTMAP_SCRIPT_TAG}
  <meta http-equiv="Content-Security-Policy" content="
    default-src 'self';
    script-src 'unsafe-inline' 'unsafe-eval'
      https://cdnjs.cloudflare.com
      https://esm.sh
      https://cdn.jsdelivr.net
      https://unpkg.com;
    style-src 'unsafe-inline';
    img-src 'self' data: blob:;
    font-src 'self' data:;
    connect-src 'self'
      https://cdnjs.cloudflare.com
      https://esm.sh
      https://cdn.jsdelivr.net
      https://unpkg.com;
  ">
  <style>
    ${THEME_CSS}
    ${SVG_CLASSES_CSS}
    ${FORM_STYLES_CSS}
  </style>
</head>
<body>
  <div id="content">
    ${initialHtml}
  </div>
  <script>${IDIOMORPH_JS}</script>
  <script>
    ${BRIDGE_JS}
  </script>
</body>
</html>`;
}

// ─── Loading Phrases ─────────────────────────────────────────────────
const LOADING_PHRASES = [
  "Sketching pixels",
  "Wiring up nodes",
  "Painting gradients",
  "Compiling visuals",
  "Arranging atoms",
  "Rendering magic",
  "Polishing edges",
];

function useLoadingPhrase(active: boolean) {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (!active) return;
    const interval = setInterval(() => {
      setIndex((i) => (i + 1) % LOADING_PHRASES.length);
    }, 1800);
    return () => clearInterval(interval);
  }, [active]);
  return LOADING_PHRASES[index];
}

// ─── React Component ─────────────────────────────────────────────────

export function WidgetRenderer({ title, html }: WidgetRendererProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState(0);
  const [loaded, setLoaded] = useState(false);
  // Whether the iframe shell has been initialized
  const shellReadyRef = useRef(false);
  // Track the last html sent to the iframe to avoid redundant updates
  const committedHtmlRef = useRef("");
  // Tracks whether html content has settled (stopped changing)
  const [htmlSettled, setHtmlSettled] = useState(false);
  const [prevHtml, setPrevHtml] = useState(html);
  const settledTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fadeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [fadingOut, setFadingOut] = useState(false);

  const handleMessage = useCallback((e: MessageEvent) => {
    // Only handle messages from our own iframe
    if (
      iframeRef.current &&
      e.source === iframeRef.current.contentWindow &&
      e.data?.type === "widget-resize" &&
      typeof e.data.height === "number"
    ) {
      setHeight(Math.max(50, Math.min(e.data.height, 4000)));
    }
  }, []);

  useEffect(() => {
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [handleMessage]);

  // Reset settled/fade state when html changes (adjust state during render)
  if (html !== prevHtml) {
    setPrevHtml(html);
    setHtmlSettled(false);
    setFadingOut(false);
  }

  // Initialize the iframe shell once when html first appears.
  // Shell loads EMPTY so partial streaming fragments (e.g. unclosed <style>)
  // can't break the bridge script. All content is streamed via postMessage.
  useEffect(() => {
    if (!html || !iframeRef.current) return;

    if (!shellReadyRef.current) {
      shellReadyRef.current = true;
      iframeRef.current.srcdoc = assembleShell();
      return;
    }

    // Wait for iframe to load before sending postMessage
    if (!loaded) return;

    // Stream content into existing iframe via postMessage
    if (html === committedHtmlRef.current) return;
    committedHtmlRef.current = html;

    const iframe = iframeRef.current;
    if (iframe.contentWindow) {
      // targetOrigin "*" is required: sandboxed iframes may have a null origin
      // depending on browser, so no specific origin can be used.
      iframe.contentWindow.postMessage(
        { type: "update-content", html },
        "*"
      );
    }
  }, [html, loaded]);

  // Detect when html has stopped changing (streaming complete).
  // Resets a debounce timer on every html update — settles after 800ms of no changes.
  useEffect(() => {
    if (!html) return;
    if (settledTimerRef.current) clearTimeout(settledTimerRef.current);
    if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);
    settledTimerRef.current = setTimeout(() => {
      setHtmlSettled(true);
      setFadingOut(true);
      fadeTimerRef.current = setTimeout(() => {
        setFadingOut(false);
      }, 600);
    }, 800);
    return () => {
      if (settledTimerRef.current) clearTimeout(settledTimerRef.current);
      if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);
    };
  }, [html]);

  // Fallback: if iframe has html but hasn't reported a height after 4s, force-show
  useEffect(() => {
    if (!html || (loaded && height > 0)) return;
    const timeout = setTimeout(() => {
      setLoaded(true);
      setHeight((h) => (h > 0 ? h : 500));
    }, 4000);
    return () => clearTimeout(timeout);
  }, [html, loaded, height]);

  // Show the iframe as soon as we have html (shell initializes on first html)
  const showIframe = !!html;
  // Streaming is active until html has stopped changing
  const isStreaming = !!html && !htmlSettled;
  const loadingPhrase = useLoadingPhrase(isStreaming);
  const showStreamingIndicator = isStreaming || fadingOut;

  return (
    <div className="w-full my-3">
      {/* Loading phrases — sits above the widget, fades out when ready */}
      {showStreamingIndicator && (
        <div
          className="mb-2 transition-all duration-500 ease-out"
          style={{
            opacity: isStreaming ? 1 : 0,
            maxHeight: isStreaming ? 32 : 0,
            overflow: "hidden",
          }}
        >
          <div className="flex items-center gap-2">
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                border: "2px solid var(--color-border-light, rgba(0,0,0,0.1))",
                borderTopColor: "var(--color-lilac-dark, #6366f1)",
                animation: "spin 0.8s linear infinite",
                flexShrink: 0,
              }}
            />
            <span
              className="text-[12px] font-medium"
              style={{ color: "var(--text-secondary, #666)" }}
            >
              {loadingPhrase}...
            </span>
          </div>
        </div>
      )}

      <ExportOverlay
        title={title}
        html={html}
        componentType="widgetRenderer"
        ready={!!html && htmlSettled}
      >
        {/* Iframe: always mounted so ref is stable; srcdoc set once,
            content streamed via postMessage for progressive rendering. */}
        <iframe
          ref={iframeRef}
          // allow-same-origin is required for import maps to work in srcdoc iframes.
          // Safe here because no auth/session data is exposed client-side.
          // See: https://github.com/CopilotKit/OpenGenerativeUI/issues/3
          sandbox="allow-scripts allow-same-origin"
          className="w-full border-0"
          onLoad={() => setLoaded(true)}
          style={{
            height: showIframe ? (height > 0 ? height : 300) : 0,
            overflow: "hidden",
            background: "transparent",
            opacity: showIframe ? 1 : 0,
            transition: "height 200ms ease-out",
            display: html ? undefined : "none",
          }}
          title={title}
        />
      </ExportOverlay>
    </div>
  );
}
