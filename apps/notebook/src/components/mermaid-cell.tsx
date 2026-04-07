"use client";

import { useEffect, useState, useId } from "react";
import mermaid from "mermaid";

let initialized = false;

function initMermaid(isDark: boolean) {
  mermaid.initialize({
    startOnLoad: false,
    theme: isDark ? "dark" : "default",
    fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
    fontSize: 14,
  });
  initialized = true;
}

export function MermaidCell({
  content,
  title,
}: {
  content: string;
  title?: string;
}) {
  const [svg, setSvg] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isDark, setIsDark] = useState(false);
  const reactId = useId();
  const safeId = "mermaid-" + reactId.replace(/:/g, "-");

  // Dark mode detection
  useEffect(() => {
    const check = () =>
      setIsDark(document.documentElement.classList.contains("dark"));
    check();
    const observer = new MutationObserver(check);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  // Render diagram
  useEffect(() => {
    let cancelled = false;

    async function render() {
      try {
        // Re-initialize to pick up theme change
        initMermaid(isDark);

        const { svg: rendered } = await mermaid.render(safeId, content.trim());
        if (!cancelled) {
          setSvg(rendered);
          setError("");
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to render diagram");
          setSvg("");
        }
        // Clean up orphaned element mermaid may have left
        const orphan = document.getElementById("d" + safeId);
        orphan?.remove();
      }
    }

    render();
    return () => {
      cancelled = true;
    };
  }, [content, isDark, safeId]);

  return (
    <div
      className="notebook-cell overflow-hidden"
      style={{ borderLeft: "3px solid var(--color-mint)" }}
    >
      {title && (
        <div
          className="px-4 py-2.5 text-sm font-semibold flex items-center gap-2 border-b"
          style={{
            borderColor: "var(--color-border-glass)",
            background: "var(--color-glass-subtle)",
          }}
        >
          <span
            className="inline-flex items-center justify-center w-5 h-5 rounded text-xs"
            style={{
              background:
                "linear-gradient(135deg, var(--color-lilac), var(--color-mint))",
              color: "#fff",
            }}
          >
            &#9670;
          </span>
          <span style={{ color: "var(--text-primary)" }}>{title}</span>
        </div>
      )}

      <div className="p-4 flex justify-center">
        {error ? (
          <div
            className="text-sm p-3 rounded-md w-full"
            style={{
              background: "var(--color-glass-subtle)",
              color: "var(--text-secondary)",
              fontFamily: "monospace",
            }}
          >
            Diagram error: {error}
          </div>
        ) : svg ? (
          <div
            dangerouslySetInnerHTML={{ __html: svg }}
            className="[&>svg]:max-w-full [&>svg]:h-auto"
          />
        ) : (
          <div
            className="shimmer-loading rounded-md"
            style={{ width: "100%", height: 200 }}
          />
        )}
      </div>
    </div>
  );
}
