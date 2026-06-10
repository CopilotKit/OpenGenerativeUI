"use client";

import { useState, useCallback, useMemo, useRef, useEffect, type ReactNode } from "react";
import {
  chartToStandaloneHtml,
  triggerDownload,
  slugify,
} from "./export-utils";

interface ExportOverlayProps {
  title: string;
  html?: string;
  componentData?: Record<string, unknown>;
  componentType: "openGenUI" | "barChart" | "pieChart";
  ready?: boolean;
  children: ReactNode;
}

export function ExportOverlay({
  title,
  html,
  componentData,
  componentType,
  ready = true,
  children,
}: ExportOverlayProps) {
  const [copyState, setCopyState] = useState<"idle" | "copied">("idle");
  const [menuOpen, setMenuOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  const exportHtml = useMemo(() => {
    if (componentType === "openGenUI" && html) {
      return html;
    }
    if ((componentType === "barChart" || componentType === "pieChart") && componentData) {
      const chartType = componentType === "barChart" ? "bar" : "pie";
      return chartToStandaloneHtml(
        chartType,
        componentData as { title: string; description: string; data: Array<{ label: string; value: number }> }
      );
    }
    return null;
  }, [componentType, html, componentData]);

  const handleDownload = useCallback(() => {
    if (!exportHtml) return;
    const filename = `${slugify(title) || "visualization"}.html`;
    triggerDownload(exportHtml, filename);
    setMenuOpen(false);
  }, [exportHtml, title]);

  const handleCopy = useCallback(() => {
    const textToCopy = exportHtml;
    if (!textToCopy) return;
    navigator.clipboard.writeText(textToCopy).then(
      () => {
        setCopyState("copied");
        setMenuOpen(false);
        setTimeout(() => setCopyState("idle"), 1800);
      },
      () => {
        // Clipboard write failed (e.g. permission denied, iframe context)
        setMenuOpen(false);
      }
    );
  }, [exportHtml]);

  const exportable = ready && !!exportHtml;
  const showTrigger = exportable && (hovered || menuOpen);

  return (
    <div
      className="relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {exportable && (
      <div
        className="absolute top-2 right-2 z-10 transition-opacity duration-200"
        style={{
          opacity: showTrigger ? 1 : 0,
          pointerEvents: showTrigger ? "auto" : "none",
        }}
      >
        <div ref={menuRef} className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center justify-center rounded-lg p-1.5 shadow-md transition-all duration-150 hover:scale-105"
            style={{
              background: "var(--surface-primary, #fff)",
              border: "1px solid var(--color-border-glass, rgba(0,0,0,0.1))",
              color: "var(--text-secondary, #666)",
            }}
            title="Options"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="5" cy="12" r="1.5" />
              <circle cx="12" cy="12" r="1.5" />
              <circle cx="19" cy="12" r="1.5" />
            </svg>
          </button>

          {menuOpen && (
            <div
              className="absolute top-full right-0 mt-1 rounded-lg py-1 shadow-lg min-w-[180px]"
              style={{
                background: "var(--surface-primary, #fff)",
                border: "1px solid var(--color-border-glass, rgba(0,0,0,0.1))",
                animation: "tmpl-slideIn 0.15s ease-out",
              }}
            >
              <button
                onClick={handleCopy}
                className="flex items-center gap-2.5 w-full px-3 py-2 text-xs text-left transition-colors duration-100"
                style={{ color: copyState === "copied" ? "var(--color-text-success, #3B6D11)" : "var(--text-primary, #1a1a1a)" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--color-background-secondary, #f5f5f5)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                {copyState === "copied" ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                )}
                {copyState === "copied" ? "Copied!" : "Copy to clipboard"}
              </button>
              <button
                onClick={handleDownload}
                className="flex items-center gap-2.5 w-full px-3 py-2 text-xs text-left transition-colors duration-100"
                style={{ color: "var(--text-primary, #1a1a1a)" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--color-background-secondary, #f5f5f5)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Download file
              </button>
            </div>
          )}
        </div>
      </div>
      )}

      {children}
    </div>
  );
}
