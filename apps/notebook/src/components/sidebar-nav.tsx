"use client";

import { useEffect, useState } from "react";
import type { Chapter } from "@/lib/types";

export function SidebarNav({ chapters }: { chapters: Chapter[] }) {
  const [activeId, setActiveId] = useState<string>(chapters[0]?.id ?? "");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((e) => e.isIntersecting);
        if (visible) setActiveId(visible.target.id);
      },
      { rootMargin: "-80px 0px -60% 0px", threshold: 0.1 }
    );

    chapters.forEach((ch) => {
      const el = document.getElementById(ch.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [chapters]);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 md:hidden flex items-center justify-center w-10 h-10 rounded-lg cursor-pointer"
        style={{
          background: "var(--color-glass-dark)",
          border: "1px solid var(--color-border-glass)",
          backdropFilter: "blur(12px)",
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          {isOpen ? (
            <>
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </>
          ) : (
            <>
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </>
          )}
        </svg>
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 md:hidden"
          style={{ background: "rgba(0,0,0,0.3)" }}
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-full w-60 flex flex-col pt-6 pb-4 transition-transform md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{
          background: "var(--color-glass-dark)",
          borderRight: "1px solid var(--color-border-glass)",
          backdropFilter: "blur(16px)",
        }}
      >
        <div className="px-5 mb-6">
          <h1 className="text-sm font-bold text-gradient">OpenGenerativeUI</h1>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-tertiary)" }}>
            Interactive Notebook
          </p>
        </div>

        <nav className="flex-1 overflow-y-auto px-3">
          {chapters.map((ch, i) => (
            <button
              key={ch.id}
              onClick={() => scrollTo(ch.id)}
              className={`sidebar-link w-full text-left px-3 py-2 rounded-md text-sm mb-0.5 cursor-pointer ${
                activeId === ch.id ? "sidebar-link--active" : ""
              }`}
              style={{
                color: activeId === ch.id ? "var(--color-text-primary)" : "var(--text-secondary)",
              }}
            >
              <span className="mr-2">{ch.icon}</span>
              <span className="text-xs font-medium" style={{ color: "var(--text-tertiary)" }}>
                {String(i + 1).padStart(2, "0")}
              </span>{" "}
              {ch.title}
            </button>
          ))}
        </nav>
      </aside>
    </>
  );
}
