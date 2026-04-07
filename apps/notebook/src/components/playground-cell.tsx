"use client";

import {
  SandpackProvider,
  SandpackCodeEditor,
  SandpackPreview,
  SandpackLayout,
  useSandpack,
} from "@codesandbox/sandpack-react";
import { useEffect, useState, useCallback } from "react";

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
  const [isFullscreen, setIsFullscreen] = useState(false);

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

  // Close fullscreen on Escape
  useEffect(() => {
    if (!isFullscreen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsFullscreen(false);
    };
    document.addEventListener("keydown", handler);
    // Prevent body scroll while fullscreen
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [isFullscreen]);

  const toggleFullscreen = useCallback(() => setIsFullscreen((v) => !v), []);

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

  const wrapperClass = isFullscreen
    ? "fixed inset-0 z-50 flex flex-col"
    : "notebook-cell overflow-hidden";

  const wrapperStyle = isFullscreen
    ? {
        background: isDark ? "#0a0a0a" : "#ffffff",
        borderColor: "var(--color-mint)",
      }
    : { borderColor: "var(--color-mint)" };

  return (
    <div className={wrapperClass} style={wrapperStyle}>
      {/* Header bar */}
      {title && (
        <div
          className="px-4 py-2.5 text-sm font-semibold flex items-center gap-2 border-b shrink-0"
          style={{
            borderColor: "var(--color-border-glass)",
            background: isFullscreen
              ? isDark
                ? "#1a1a2e"
                : "#f7f7f9"
              : "var(--color-glass-subtle)",
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
            &#9654;
          </span>
          <span className="flex-1" style={{ color: "var(--text-primary)" }}>
            {title}
          </span>
          <button
            onClick={toggleFullscreen}
            className="flex items-center justify-center w-7 h-7 rounded-md transition-colors cursor-pointer"
            style={{
              background: "var(--color-glass-subtle)",
              border: "1px solid var(--color-border-glass)",
              color: "var(--text-secondary)",
            }}
            title={isFullscreen ? "Exit fullscreen (Esc)" : "Fullscreen"}
          >
            {isFullscreen ? (
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="4 14 10 14 10 20" />
                <polyline points="20 10 14 10 14 4" />
                <line x1="14" y1="10" x2="21" y2="3" />
                <line x1="3" y1="21" x2="10" y2="14" />
              </svg>
            ) : (
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="15 3 21 3 21 9" />
                <polyline points="9 21 3 21 3 15" />
                <line x1="21" y1="3" x2="14" y2="10" />
                <line x1="3" y1="21" x2="10" y2="14" />
              </svg>
            )}
          </button>
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
          className={isFullscreen ? "flex-1" : ""}
          style={{
            border: "none",
            borderRadius: 0,
            background: "transparent",
            ...(isFullscreen ? { height: "100%" } : {}),
          }}
        >
          <SandpackCodeEditor
            showLineNumbers
            showTabs
            style={{ minHeight: isFullscreen ? undefined : 280 }}
          />
          <SandpackPreview
            showOpenInCodeSandbox={false}
            showRefreshButton
            style={{ minHeight: isFullscreen ? undefined : 280 }}
          />
        </SandpackLayout>
        <div
          className="flex items-center gap-2 px-4 py-2 border-t shrink-0"
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
