"use client";

import dynamic from "next/dynamic";
import type { Cell } from "@/lib/types";
import { MarkdownCell } from "./markdown-cell";
import { CodeCell } from "./code-cell";

const PlaygroundCell = dynamic(
  () => import("./playground-cell").then((m) => m.PlaygroundCell),
  {
    ssr: false,
    loading: () => (
      <div className="notebook-cell overflow-hidden" style={{ minHeight: 300 }}>
        <div className="shimmer-loading w-full h-full" style={{ minHeight: 300 }} />
      </div>
    ),
  }
);

export function CellRenderer({ cell }: { cell: Cell }) {
  switch (cell.type) {
    case "markdown":
      return <MarkdownCell content={cell.content} />;
    case "code":
      return (
        <CodeCell
          content={cell.content}
          language={cell.language}
          filename={cell.filename}
        />
      );
    case "playground":
      return (
        <PlaygroundCell
          files={cell.files}
          dependencies={cell.dependencies}
          title={cell.title}
        />
      );
  }
}
