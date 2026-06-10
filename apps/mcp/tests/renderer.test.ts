import { describe, it, expect } from "vitest";
import { assembleDocument } from "../src/renderer";

describe("assembleDocument", () => {
  const doc = assembleDocument("<div>x</div>");

  it("embeds the single-sourced design-system css before the injected html", () => {
    // Theme tokens, SVG classes, and form styles from @repo/design-system.
    const themeIdx = doc.indexOf("--color-background-primary");
    const svgIdx = doc.indexOf(".c-purple");
    const formIdx = doc.indexOf("button:hover");
    const htmlIdx = doc.indexOf("<div>x</div>");
    expect(themeIdx).toBeGreaterThanOrEqual(0);
    expect(svgIdx).toBeGreaterThanOrEqual(0);
    expect(formIdx).toBeGreaterThanOrEqual(0);
    expect(htmlIdx).toBeGreaterThan(themeIdx);
    expect(htmlIdx).toBeGreaterThan(svgIdx);
  });

  it("injects the CSP meta tag with the CDN allowlist", () => {
    expect(doc).toContain('http-equiv="Content-Security-Policy"');
    for (const origin of [
      "https://cdnjs.cloudflare.com",
      "https://esm.sh",
      "https://cdn.jsdelivr.net",
      "https://unpkg.com",
    ]) {
      expect(doc).toContain(origin);
    }
  });

  it("wraps the html in #content and includes the bridge + resize script", () => {
    expect(doc).toContain('<div id="content">');
    expect(doc).toContain("window.sendPrompt = function");
    expect(doc).toContain("window.openLink = function");
    expect(doc).toContain("widget-resize");
    expect(doc).toContain("ResizeObserver");
  });
});
