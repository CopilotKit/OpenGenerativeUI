"use client";

import { useEffect, useState } from "react";
import { getHighlighter } from "@/lib/highlight";
import { CopyButton } from "./copy-button";

export function CodeCell({
  content,
  language,
  filename,
}: {
  content: string;
  language: string;
  filename?: string;
}) {
  const [html, setHtml] = useState<string>("");
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

  useEffect(() => {
    let cancelled = false;
    getHighlighter().then((highlighter) => {
      if (cancelled) return;
      const theme = isDark ? "github-dark" : "github-light";
      const highlighted = highlighter.codeToHtml(content.trim(), {
        lang: language,
        theme,
      });
      setHtml(highlighted);
    });
    return () => {
      cancelled = true;
    };
  }, [content, language, isDark]);

  return (
    <div className="notebook-cell group relative code-block overflow-hidden">
      {filename && (
        <div
          className="px-4 py-2 text-xs font-medium border-b"
          style={{
            color: "var(--text-secondary)",
            borderColor: "var(--color-border-glass)",
            background: "var(--color-glass-subtle)",
          }}
        >
          {filename}
        </div>
      )}
      <CopyButton text={content.trim()} />
      {html ? (
        <div
          dangerouslySetInnerHTML={{ __html: html }}
          className="[&_pre]:!bg-transparent [&_pre]:p-4 [&_pre]:text-[13px] [&_pre]:leading-relaxed [&_code]:font-mono"
        />
      ) : (
        <div className="p-4">
          <pre className="text-[13px] leading-relaxed font-mono" style={{ color: "var(--text-primary)" }}>
            <code>{content.trim()}</code>
          </pre>
        </div>
      )}
    </div>
  );
}
