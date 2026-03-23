# Chalk Agent Self-Review Findings

- Branch: fix/lint-errors-2026-03-18
- Commit: b834bc2
- Base: 6df7350 (merge-base with main)
- Session: pr-13
- PR: #13 — fix: resolve lint errors in widget-renderer.tsx and layout.tsx
- Date: 2026-03-19 UTC

---

## Verdict
- Block merge: **yes**
- Blocking findings: P0=2, P1=1

---

## Findings

| ID | Severity | Category | File:Line | Issue | Failure mode | Suggested fix | Confidence |
|---|---|---|---|---|---|---|---|
| F-01 | P0 | Lint / Correctness | [widget-renderer.tsx:417](apps/app/src/components/generative-ui/widget-renderer.tsx#L417) | `setIndex(0)` called synchronously inside `useEffect` body — violates `react-hooks/set-state-in-effect`; lint exits non-zero | CI lint gate fails; PR goal unmet | Move reset out of effect: use a derived index or call `setIndex` only inside the `setInterval` callback (start at 0, interval handles cycling). Or split into two `useEffect`s — one that watches `active` going true and one that runs the interval. | High |
| F-02 | P0 | Lint / Correctness | [widget-renderer.tsx:465-466](apps/app/src/components/generative-ui/widget-renderer.tsx#L465) | `setLoaded(false)` and `setHeight(0)` called synchronously inside `useLayoutEffect` body — same rule violation | CI lint gate fails | Store `loaded`/`height` as refs for the reset path, or batch by computing a single state object. Since these resets only happen when `html` changes, a combined reducer state (`{ loaded: bool, height: number }`) reset in a single `setState` call may satisfy the linter. Alternatively, `startTransition` wrapping won't help here — the real fix is avoiding direct setState in the effect body. | High |
| F-03 | P1 | Lint / Style | [widget-renderer.tsx:431](apps/app/src/components/generative-ui/widget-renderer.tsx#L431) | `_description` renamed with underscore prefix to suppress unused-var, but ESLint still warns — the project's `@typescript-eslint/no-unused-vars` config doesn't honor the `_` prefix convention here | Warning remains in lint output | Simply omit `description` from the destructuring: `{ title, html }`. If the prop must remain in the TypeScript type for API compatibility, add `// eslint-disable-next-line @typescript-eslint/no-unused-vars` or configure `argsIgnorePattern: "^_"` in the ESLint config. | High |
| F-04 | P2 | Correctness / DX | [layout.tsx:13](apps/app/src/app/layout.tsx#L13) & [globals.css:63](apps/app/src/app/globals.css#L63) | Next.js font variable `--font-plus-jakarta` is injected onto `<body>` but `globals.css` references the font via hardcoded string `'Plus Jakarta Sans'` in `--font-family`, not `var(--font-plus-jakarta)`. Next.js font optimization (self-hosting, preloading, CLS prevention) is wired up but the CSS never consumes it. | Font still loads (hardcoded name falls back to Google CDN or cached), but Next.js's optimized self-hosted font is unused — the whole point of migrating away from the `<link>` tag is lost. | In `globals.css` change `--font-family: 'Plus Jakarta Sans', ...` to `--font-family: var(--font-plus-jakarta), system-ui, sans-serif` | High |
| ~~F-05~~ | ~~P2~~ | ~~Docs~~ | ~~CONTRIBUTING.md~~ | ~~RETRACTED~~ — `CopilotKit/OpenGenerativeUI` is the correct official repo slug. Links are accurate. | — | — | — |

---

## Testing Gaps
- No tests added or modified; the two changed source files have no automated test coverage
- No TypeScript build (`pnpm build`) was run to confirm type safety after prop rename

## Open Questions
- Should `react-hooks/set-state-in-effect` be disabled for specific lines as a short-term fix, or is there appetite to restructure the hooks? The `useLoadingPhrase` and `useLayoutEffect` cases have different ideal solutions.
- Is `WidgetRendererProps` exported or used externally? If `description` is part of a public API contract (e.g. CopilotKit tool parameter schema), removing it from destructuring is safe but the prop type should remain for consumers.

---

<details>
<summary><strong>Ask AI to Resolve These Issues</strong></summary>

Copy and paste the prompt below into Claude, ChatGPT, Cursor, or any AI assistant. It includes full context so the AI can fix all remaining lint failures without additional back-and-forth.

---

````
I need help fixing 3 remaining ESLint failures in a Next.js / React project.
The branch is `fix/lint-errors-2026-03-18` on https://github.com/CopilotKit/OpenGenerativeUI.
Running `pnpm lint` currently exits with 2 errors and 1 warning — all in one file:
  apps/app/src/components/generative-ui/widget-renderer.tsx

The ESLint config extends `eslint-config-next/core-web-vitals` and `eslint-config-next/typescript`,
which pulls in `eslint-plugin-react-hooks@7.0.1`. That version introduced a new rule —
`react-hooks/set-state-in-effect` — that flags any synchronous setState call made directly inside
an effect body (useEffect or useLayoutEffect).

─── FAILURE 1 (Error) — widget-renderer.tsx ~line 414 ───────────────────────

The `useLoadingPhrase` hook manages a cycling loading message. When `active` flips from false → true
it should reset to phrase index 0, then start an interval to cycle phrases every 1800ms.

Current (broken) code:
```tsx
function useLoadingPhrase(active: boolean) {
  const [index, setIndex] = useState(0);
  const prevActiveRef = useRef<boolean | null>(null);

  useEffect(() => {
    if (active && !prevActiveRef.current) {
      setIndex(0);   // ← lint error: setState inside effect body
    }
    prevActiveRef.current = active;

    if (!active) return;
    const interval = setInterval(() => {
      setIndex((i) => (i + 1) % LOADING_PHRASES.length);
    }, 1800);
    return () => clearInterval(interval);
  }, [active]);

  return LOADING_PHRASES[index];
}
```

Fix goal: eliminate the synchronous `setIndex(0)` call from inside the effect body while keeping
the same observable behaviour (index resets to 0 when active starts, then cycles).

─── FAILURE 2 (Error) — widget-renderer.tsx ~line 460 ───────────────────────

The `WidgetRenderer` component writes HTML into a sandboxed iframe imperatively (to preserve iframe
JS state across React re-renders). When `html` changes it resets `loaded` and `height` back to
false/0 so the loading overlay re-appears.

Current (broken) code:
```tsx
useLayoutEffect(() => {
  if (!html || !iframeRef.current) return;
  if (html === committedHtmlRef.current) return;
  committedHtmlRef.current = html;
  iframeRef.current.srcdoc = assembleDocument(html);
  setLoaded(false);   // ← lint error: setState inside effect body
  setHeight(0);       // ← lint error: setState inside effect body
}, [html]);
```

State declarations (for context):
```tsx
const [height, setHeight] = useState(0);
const [loaded, setLoaded] = useState(false);
```

Fix goal: eliminate synchronous setState calls from inside the useLayoutEffect body while keeping
the reset-on-html-change behaviour. The iframe srcdoc write must stay synchronous (that's why
useLayoutEffect is correct here). Consider combining loaded+height into a single reducer, or
storing reset state in refs and deriving render values from them.

─── FAILURE 3 (Warning) — widget-renderer.tsx ~line 431 ───────────────────────

The `description` prop is accepted in the function signature but never used. A previous attempt
renamed it to `_description` but the project's ESLint config does not have `argsIgnorePattern: "^_"`
configured so the warning still fires.

Current (broken) code:
```tsx
export function WidgetRenderer({ title, _description, html }: WidgetRendererProps) {
```

Fix goal: silence the unused-var warning. The simplest fix is to remove `description` / `_description`
from the destructuring entirely (just use `{ title, html }`). The prop can remain in the
`WidgetRendererProps` type for API compatibility — only the destructuring binding needs to change.

─── Constraints ───────────────────────────────────────────────────────────────

- Do NOT add eslint-disable comments as a workaround — fix the code properly.
- Keep all existing observable behaviour identical (loading phrase cycling, iframe reload guard,
  loaded/height reset on html change).
- After your changes, `pnpm lint` must pass with 0 errors and 0 warnings.
- Only edit `apps/app/src/components/generative-ui/widget-renderer.tsx`.
````

</details>
