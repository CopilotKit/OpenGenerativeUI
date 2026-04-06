"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function MarkdownCell({ content }: { content: string }) {
  return (
    <div className="notebook-cell p-5 md:p-6">
      <div className="markdown-prose">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({ children }) => (
              <h1 className="text-gradient">{children}</h1>
            ),
            h2: ({ children }) => (
              <h2 className="text-gradient">{children}</h2>
            ),
            a: ({ href, children }) => (
              <a href={href} target="_blank" rel="noopener noreferrer">
                {children}
              </a>
            ),
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
}
