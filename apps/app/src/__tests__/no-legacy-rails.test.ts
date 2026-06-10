import { readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { describe, it, expect } from "vitest";

// Matched case-insensitively (file contents are lowercased first), so the
// camel needle also catches PascalCase WidgetRenderer / WidgetRendererProps.
const CAMEL_NEEDLE = ["widget", "renderer"].join("");
const KEBAB_NEEDLE = ["widget", "-", "renderer"].join("");
const SRC_ROOT = resolve(__dirname, "..");
const SELF = resolve(__dirname, "no-legacy-rails.test.ts");
const EXCLUDED_DIRS = new Set(["node_modules", ".next"]);

function collectFiles(dir: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!EXCLUDED_DIRS.has(entry.name)) files.push(...collectFiles(fullPath));
    } else if (entry.isFile()) {
      files.push(fullPath);
    }
  }
  return files;
}

describe("no legacy widget rails", () => {
  it("contains zero files referencing the retired legacy renderer", () => {
    const offenders = collectFiles(SRC_ROOT)
      .filter((file) => resolve(file) !== SELF)
      .filter((file) => {
        const source = readFileSync(file, "utf8").toLowerCase();
        return source.includes(CAMEL_NEEDLE) || source.includes(KEBAB_NEEDLE);
      });
    expect(offenders).toEqual([]);
  });
});
