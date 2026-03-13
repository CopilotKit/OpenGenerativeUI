"use client";

import { useEffect } from "react";
import { ExampleLayout } from "@/components/example-layout";
import { useGenerativeUIExamples, useExampleSuggestions } from "@/hooks";
import { ExplainerCardsPortal } from "@/components/explainer-cards";

import { CopilotChat } from "@copilotkit/react-core/v2";

export default function HomePage() {
  useGenerativeUIExamples();
  useExampleSuggestions();

  // Widget bridge: handle openLink from widget iframes
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === "open-link" && typeof e.data.url === "string") {
        window.open(e.data.url, "_blank", "noopener,noreferrer");
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  return (
    <>
      {/* Animated background */}
      <div className="abstract-bg">
        <div className="blob-3" />
      </div>

      {/* App shell */}
      <div className="brand-shell" style={{ position: "relative", zIndex: 1 }}>
        <div className="brand-glass-container">
          {/* CTA Banner */}
          <div
            className="shrink-0 border-b border-white/30 dark:border-white/8"
            style={{
              background: "linear-gradient(135deg, rgba(190,194,255,0.08) 0%, rgba(133,224,206,0.06) 100%)",
            }}
          >
            <div className="flex items-center justify-between gap-4 px-5 py-3">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div
                  className="flex items-center justify-center shrink-0 w-9 h-9 rounded-lg text-white"
                  style={{
                    background: "linear-gradient(135deg, var(--color-lilac), var(--color-mint))",
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2L2 7l10 5 10-5-10-5z" />
                    <path d="M2 17l10 5 10-5" />
                    <path d="M2 12l10 5 10-5" />
                  </svg>
                </div>
                <p className="text-base font-semibold m-0 leading-snug" style={{ color: "var(--text-primary)" }}>
                  Open Generative UI
                  <span className="font-normal" style={{ color: "var(--text-secondary)" }}> — powered by CopilotKit</span>
                </p>
              </div>
              <a
                href="https://github.com/CopilotKit/OpenGenerativeUI.git"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-5 py-2 rounded-full text-sm font-semibold text-white no-underline whitespace-nowrap transition-all duration-150 hover:-translate-y-px"
                style={{
                  background: "linear-gradient(135deg, var(--color-lilac-dark), var(--color-mint-dark))",
                  boxShadow: "0 1px 4px rgba(149,153,204,0.3)",
                  fontFamily: "var(--font-family)",
                }}
              >
                Get started
              </a>
            </div>
          </div>

          <ExampleLayout chatContent={
            <CopilotChat
              labels={{
                welcomeMessageText: "What do you want to visualize today?",
              }}
            />
          } />
          <ExplainerCardsPortal />
        </div>
      </div>
    </>
  );
}
