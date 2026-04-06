"use client";

import { useState } from "react";

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="absolute top-2 right-2 px-2 py-1 text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
      style={{
        background: "var(--color-glass-subtle)",
        border: "1px solid var(--color-border-glass)",
        color: "var(--text-secondary)",
      }}
    >
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}
