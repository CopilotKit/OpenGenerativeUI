export type MarkdownCell = {
  type: "markdown";
  id: string;
  content: string;
};

export type CodeCell = {
  type: "code";
  id: string;
  language: string;
  content: string;
  filename?: string;
};

export type PlaygroundCell = {
  type: "playground";
  id: string;
  files: Record<string, string>;
  dependencies?: Record<string, string>;
  activeFile?: string;
  title?: string;
};

export type Cell = MarkdownCell | CodeCell | PlaygroundCell;

export type Chapter = {
  id: string;
  title: string;
  description: string;
  icon: string;
  cells: Cell[];
};
