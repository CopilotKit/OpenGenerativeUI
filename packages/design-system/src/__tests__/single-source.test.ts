import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

// Built via join so this test file itself never matches the needle.
const TOKEN_DEFINITION = ["--color-background-primary", ":"].join("");

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../../../..");
const SCAN_ROOTS = [join(REPO_ROOT, "apps"), join(REPO_ROOT, "packages")];
const SKIP_DIRS = new Set(["node_modules", "dist", ".next"]);
const EXTENSIONS = [".ts", ".tsx"];

function collectSourceFiles(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) collectSourceFiles(path, out);
    } else if (EXTENSIONS.some((ext) => entry.name.endsWith(ext))) {
      out.push(path);
    }
  }
  return out;
}

describe("design-system single source", () => {
  it("defines the theme tokens in exactly one source file", () => {
    const matches = SCAN_ROOTS.flatMap((root) => collectSourceFiles(root)).filter(
      (file) => readFileSync(file, "utf8").includes(TOKEN_DEFINITION)
    );
    expect(matches).toEqual([
      join(REPO_ROOT, "packages/design-system/src/index.ts"),
    ]);
  });
});
