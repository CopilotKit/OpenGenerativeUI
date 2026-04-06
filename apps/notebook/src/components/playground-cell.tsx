"use client";

import {
  SandpackProvider,
  SandpackCodeEditor,
  SandpackPreview,
  SandpackLayout,
  useSandpack,
} from "@codesandbox/sandpack-react";
import { useEffect, useState } from "react";

function ResetButton() {
  const { sandpack } = useSandpack();
  return (
    <button
      onClick={() => sandpack.resetAllFiles()}
      className="px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer"
      style={{
        background: "var(--color-glass-subtle)",
        border: "1px solid var(--color-border-glass)",
        color: "var(--text-secondary)",
      }}
    >
      Reset
    </button>
  );
}

export function PlaygroundCell({
  files,
  dependencies,
  title,
}: {
  files: Record<string, string>;
  dependencies?: Record<string, string>;
  title?: string;
}) {
  const [isDark, setIsDark] = useState(false);

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

  const sandpackTheme = {
    colors: {
      surface1: isDark ? "#1a1a2e" : "#ffffff",
      surface2: isDark ? "#0f0f1a" : "#f7f7f9",
      surface3: isDark ? "#2a2a4a" : "#ebebf0",
      clickable: isDark ? "#9ca3af" : "#6b7280",
      base: isDark ? "#e5e7eb" : "#374151",
      disabled: isDark ? "#4b5563" : "#d1d5db",
      hover: isDark ? "#d1d5db" : "#111827",
      accent: isDark ? "#BEC2FF" : "#9599CC",
      error: "#ef4444",
      errorSurface: isDark ? "#451a1a" : "#fef2f2",
    },
    font: {
      body: "'Plus Jakarta Sans', system-ui, sans-serif",
      mono: "'SF Mono', 'Fira Code', monospace",
      size: "13px",
      lineHeight: "1.6",
    },
  };

  return (
    <div className="notebook-cell overflow-hidden" style={{ borderColor: "var(--color-mint)" }}>
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
              background: "linear-gradient(135deg, var(--color-lilac), var(--color-mint))",
              color: "#fff",
            }}
          >
            &#9654;
          </span>
          <span style={{ color: "var(--text-primary)" }}>{title}</span>
        </div>
      )}

      <SandpackProvider
        template="react"
        theme={sandpackTheme}
        files={files}
        customSetup={{
          dependencies: {
            react: "^18.2.0",
            "react-dom": "^18.2.0",
            ...dependencies,
          },
        }}
        options={{
          externalResources: [
            "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap",
          ],
        }}
      >
        <SandpackLayout
          style={{
            border: "none",
            borderRadius: 0,
            background: "transparent",
          }}
        >
          <SandpackCodeEditor
            showLineNumbers
            showTabs
            style={{ minHeight: 280 }}
          />
          <SandpackPreview
            showOpenInCodeSandbox={false}
            showRefreshButton
            style={{ minHeight: 280 }}
          />
        </SandpackLayout>
        <div
          className="flex items-center gap-2 px-4 py-2 border-t"
          style={{ borderColor: "var(--color-border-glass)" }}
        >
          <ResetButton />
          <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>
            Edit the code and see changes live
          </span>
        </div>
      </SandpackProvider>
    </div>
  );
}
