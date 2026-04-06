"use client";

import { chapters } from "@/content";
import { SidebarNav } from "./sidebar-nav";
import { ChapterHeader } from "./chapter-header";
import { CellRenderer } from "./cell-renderer";
import { ThemeToggle } from "./theme-toggle";

export function NotebookShell() {
  return (
    <div className="min-h-screen">
      {/* Animated background */}
      <div className="abstract-bg" />

      <SidebarNav chapters={chapters} />

      {/* Main content */}
      <main className="relative z-10 md:ml-60">
        {/* Top bar */}
        <div
          className="sticky top-0 z-20 flex items-center justify-end px-6 py-3"
          style={{
            background: "var(--color-glass-dark)",
            borderBottom: "1px solid var(--color-border-glass)",
            backdropFilter: "blur(16px)",
          }}
        >
          <ThemeToggle />
        </div>

        {/* Chapters */}
        <div className="max-w-3xl mx-auto px-4 md:px-8 py-8 pb-32">
          {chapters.map((chapter) => (
            <section key={chapter.id} id={chapter.id} className="mb-16 scroll-mt-16">
              <ChapterHeader
                icon={chapter.icon}
                title={chapter.title}
                description={chapter.description}
              />
              <div className="flex flex-col gap-4">
                {chapter.cells.map((cell) => (
                  <CellRenderer key={cell.id} cell={cell} />
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}
