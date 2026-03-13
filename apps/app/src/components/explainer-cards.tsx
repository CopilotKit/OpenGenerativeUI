"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

const cards = [
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
        <path d="M22 12A10 10 0 0 0 12 2v10z" />
      </svg>
    ),
    title: "Generative UI",
    description:
      "AI generates interactive charts, visualizations, and rich components directly in the conversation.",
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    ),
    title: "Interactive Widgets",
    description:
      "Complex HTML/JS visualizations run in sandboxed iframes — try asking for an animation or diagram.",
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 2 7 12 12 22 7 12 2" />
        <polyline points="2 17 12 22 22 17" />
        <polyline points="2 12 12 17 22 12" />
      </svg>
    ),
    title: "Visualize Anything",
    description:
      "Ask for algorithm visualizations, 3D animations, diagrams, or any interactive visual explanation.",
  },
];

function ExplainerCards() {
  return (
    <div className="explainer-cards">
      {cards.map((card) => (
        <div key={card.title} className="explainer-card">
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div className="explainer-card-icon">
              {card.icon}
            </div>
            <span
              style={{
                fontSize: "13px",
                fontWeight: 600,
                color: "var(--text-primary)",
              }}
            >
              {card.title}
            </span>
          </div>
          <p
            style={{
              fontSize: "12px",
              lineHeight: 1.5,
              color: "var(--text-secondary)",
              margin: 0,
            }}
          >
            {card.description}
          </p>
        </div>
      ))}
    </div>
  );
}

/**
 * Portal that injects ExplainerCards into the CopilotKit welcome screen.
 * Inserts a wrapper div inside the welcome screen's main content area,
 * positioned before the suggestion pills. Auto-removes when the welcome
 * screen disappears (user sends a message).
 */
export function ExplainerCardsPortal() {
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const WELCOME_SELECTOR = '[data-testid="copilot-welcome-screen"]';
    const PORTAL_ID = "explainer-cards-portal";

    const tryAttach = () => {
      const welcomeScreen = document.querySelector<HTMLElement>(WELCOME_SELECTOR);
      if (!welcomeScreen) {
        setPortalTarget(null);
        return;
      }

      // Reuse existing portal container if present
      let portal = document.getElementById(PORTAL_ID);
      if (portal) {
        setPortalTarget(portal);
        return;
      }

      // Insert portal container inside the welcome screen's main content div,
      // before the suggestions row
      const mainContent = welcomeScreen.children[0] as HTMLElement | undefined;
      if (!mainContent) return;

      portal = document.createElement("div");
      portal.id = PORTAL_ID;
      portal.style.width = "100%";

      // Insert before the last child (suggestions row)
      const suggestionsRow = mainContent.lastElementChild;
      if (suggestionsRow) {
        mainContent.insertBefore(portal, suggestionsRow);
      } else {
        mainContent.appendChild(portal);
      }

      setPortalTarget(portal);
    };

    tryAttach();

    const observer = new MutationObserver(() => {
      const welcomeScreen = document.querySelector<HTMLElement>(WELCOME_SELECTOR);
      if (!welcomeScreen) {
        // Welcome screen removed (chat started) — clean up
        const stale = document.getElementById(PORTAL_ID);
        if (stale) stale.remove();
        setPortalTarget(null);
      } else if (!document.getElementById(PORTAL_ID)) {
        // Welcome screen appeared but no portal yet
        tryAttach();
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  if (!portalTarget) return null;

  return createPortal(<ExplainerCards />, portalTarget);
}
