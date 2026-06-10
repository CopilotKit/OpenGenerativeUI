import { describe, it, expect } from "vitest";
import {
  THEME_CSS,
  SVG_CLASSES_CSS,
  FORM_STYLES_CSS,
  INITIAL_RENDER_STAGGER_CSS,
  FORM_STYLES_WITH_STAGGER_CSS,
  IMPORTMAP,
  IMPORTMAP_SCRIPT_TAG,
} from "../index.js";

// Built via join so the single-source guard test only matches real CSS definitions.
const TOKEN_DEFINITION = ["--color-background-primary", ":"].join("");

describe("THEME_CSS", () => {
  it("defines the design-system color tokens", () => {
    expect(THEME_CSS).toContain(TOKEN_DEFINITION);
  });

  it("includes dark-mode overrides", () => {
    expect(THEME_CSS).toContain("@media (prefers-color-scheme: dark)");
  });
});

describe("SVG_CLASSES_CSS", () => {
  it("includes the pre-built SVG color classes", () => {
    expect(SVG_CLASSES_CSS).toContain(".c-purple");
  });
});

describe("FORM_STYLES_CSS", () => {
  it("styles form elements", () => {
    expect(FORM_STYLES_CSS).toContain('input[type="text"],');
    expect(FORM_STYLES_CSS).toContain("button {");
  });

  it("does not include the initial-render stagger block", () => {
    expect(FORM_STYLES_CSS).not.toContain(".initial-render");
  });
});

describe("INITIAL_RENDER_STAGGER_CSS", () => {
  it("contains the initial-render stagger rules", () => {
    expect(INITIAL_RENDER_STAGGER_CSS).toContain(".initial-render");
  });
});

describe("FORM_STYLES_WITH_STAGGER_CSS", () => {
  it("contains the initial-render stagger rules", () => {
    expect(FORM_STYLES_WITH_STAGGER_CSS).toContain(".initial-render");
    expect(FORM_STYLES_WITH_STAGGER_CSS).toContain(INITIAL_RENDER_STAGGER_CSS);
  });
});

describe("IMPORTMAP", () => {
  it("maps three/gsap/d3/chart.js to esm.sh", () => {
    for (const pkg of ["three", "gsap", "d3", "chart.js"]) {
      expect(IMPORTMAP.imports[pkg]).toBe(`https://esm.sh/${pkg}`);
      expect(IMPORTMAP.imports[`${pkg}/`]).toBe(`https://esm.sh/${pkg}/`);
    }
  });
});

describe("IMPORTMAP_SCRIPT_TAG", () => {
  it("is a script tag containing the import map", () => {
    expect(IMPORTMAP_SCRIPT_TAG.startsWith('<script type="importmap">')).toBe(true);
    expect(IMPORTMAP_SCRIPT_TAG.trimEnd().endsWith("</script>")).toBe(true);
    expect(IMPORTMAP_SCRIPT_TAG).toContain('"three": "https://esm.sh/three"');
  });
});
