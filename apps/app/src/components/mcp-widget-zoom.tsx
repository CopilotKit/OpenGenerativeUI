"use client";

import { useEffect, useRef } from "react";

/**
 * Observes the DOM for MCP Apps widget containers (rendered by CopilotKit's
 * MCPAppsActivityRenderer) and injects zoom / expand controls around them.
 *
 * Identification heuristic: a <div> with inline style `min-height: 100px`
 * that contains an <iframe> created by the renderer.
 */
export function McpWidgetZoom() {
  const processed = useRef(new WeakSet<Element>());

  useEffect(() => {
    function injectControls(container: HTMLElement) {
      if (processed.current.has(container)) return;
      processed.current.add(container);

      let zoom = 1;
      const iframe = container.querySelector("iframe") as HTMLIFrameElement | null;
      if (!iframe) return;

      // Wrap iframe in a zoom-clip div
      const clipDiv = document.createElement("div");
      clipDiv.style.overflow = "hidden";
      clipDiv.style.position = "relative";
      clipDiv.style.width = "100%";
      clipDiv.style.flex = "1";
      iframe.parentNode?.insertBefore(clipDiv, iframe);
      clipDiv.appendChild(iframe);

      // Toolbar
      const toolbar = document.createElement("div");
      toolbar.style.cssText =
        "display:flex;justify-content:flex-end;align-items:center;gap:4px;padding:4px 8px;";

      const btnStyle =
        "background:transparent;border:none;cursor:pointer;padding:2px 6px;" +
        "color:#6b7280;font-size:13px;font-family:inherit;border-radius:4px;";

      const zoomOut = document.createElement("button");
      zoomOut.textContent = "−";
      zoomOut.title = "Zoom out";
      zoomOut.style.cssText = btnStyle;

      const zoomLabel = document.createElement("span");
      zoomLabel.textContent = "100%";
      zoomLabel.style.cssText = "font-size:12px;color:#6b7280;min-width:36px;text-align:center;";

      const zoomIn = document.createElement("button");
      zoomIn.textContent = "+";
      zoomIn.title = "Zoom in";
      zoomIn.style.cssText = btnStyle;

      const fitBtn = document.createElement("button");
      fitBtn.textContent = "Fit";
      fitBtn.title = "Reset zoom";
      fitBtn.style.cssText = btnStyle + "font-size:11px;";

      const sep = document.createElement("div");
      sep.style.cssText = "width:1px;height:16px;background:#e5e7eb;margin:0 4px;";

      const expandBtn = document.createElement("button");
      expandBtn.textContent = "⤢ Expand";
      expandBtn.style.cssText = btnStyle;

      toolbar.append(zoomOut, zoomLabel, zoomIn, fitBtn, sep, expandBtn);
      container.insertBefore(toolbar, container.firstChild);

      function applyZoom() {
        iframe.style.transform = `scale(${zoom})`;
        iframe.style.transformOrigin = "top left";
        iframe.style.width = `${100 / zoom}%`;
        iframe.style.height = `${100 / zoom}%`;
        clipDiv.style.height = container.style.height || "auto";
        zoomLabel.textContent = `${Math.round(zoom * 100)}%`;
      }

      zoomOut.addEventListener("click", () => {
        zoom = Math.max(0.25, zoom - 0.25);
        applyZoom();
      });
      zoomIn.addEventListener("click", () => {
        zoom = Math.min(3, zoom + 0.25);
        applyZoom();
      });
      fitBtn.addEventListener("click", () => {
        zoom = 1;
        applyZoom();
      });

      // Fullscreen modal
      let isFullscreen = false;
      expandBtn.addEventListener("click", () => {
        isFullscreen = !isFullscreen;
        if (isFullscreen) {
          container.style.cssText =
            "position:fixed;top:10%;left:12.5%;width:75%;height:80%;z-index:9999;" +
            "background:var(--background,#fff);border-radius:16px;" +
            "box-shadow:0 25px 50px -12px rgba(0,0,0,0.25);display:flex;flex-direction:column;overflow:hidden;";
          clipDiv.style.flex = "1";
          clipDiv.style.height = "auto";
          expandBtn.textContent = "✕ Close";
          // Backdrop
          const backdrop = document.createElement("div");
          backdrop.id = "mcp-zoom-backdrop";
          backdrop.style.cssText =
            "position:fixed;inset:0;z-index:9998;background:rgba(0,0,0,0.5);";
          backdrop.addEventListener("click", () => expandBtn.click());
          document.body.appendChild(backdrop);
        } else {
          container.style.cssText =
            "width:100%;min-height:100px;overflow:hidden;position:relative;";
          clipDiv.style.flex = "";
          clipDiv.style.height = container.dataset.originalHeight || "auto";
          expandBtn.textContent = "⤢ Expand";
          document.getElementById("mcp-zoom-backdrop")?.remove();
        }
      });

      // Escape key
      const handleEsc = (e: KeyboardEvent) => {
        if (e.key === "Escape" && isFullscreen) expandBtn.click();
      };
      window.addEventListener("keydown", handleEsc);
    }

    function scanForMcpWidgets() {
      // MCPAppsActivityRenderer containers have min-height: 100px and overflow: hidden
      document.querySelectorAll<HTMLElement>("div[style]").forEach((div) => {
        const style = div.style;
        if (
          style.minHeight === "100px" &&
          style.overflow === "hidden" &&
          style.position === "relative" &&
          div.querySelector("iframe") &&
          !processed.current.has(div)
        ) {
          // Save original height for restore
          div.dataset.originalHeight = style.height;
          injectControls(div);
        }
      });
    }

    // Observe for new MCP widgets appearing
    const observer = new MutationObserver(() => scanForMcpWidgets());
    observer.observe(document.body, { childList: true, subtree: true });
    scanForMcpWidgets();

    return () => observer.disconnect();
  }, []);

  return null;
}
