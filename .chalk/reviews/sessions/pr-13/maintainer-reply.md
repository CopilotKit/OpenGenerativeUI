# Maintainer Review Reply — PR #13

> fix: resolve lint errors in widget-renderer.tsx and layout.tsx

---

Thanks for the PR! Great that you're tackling the lint errors — this is exactly the kind of housekeeping that keeps the codebase healthy.

I went through the changes and have a few things to address before we merge. Two of them are blockers because they still trip the lint gate we're trying to fix.

---

### Blocking

**`react-hooks/set-state-in-effect` — two violations remain in `widget-renderer.tsx`**

`eslint-plugin-react-hooks@7` introduced a new rule that disallows synchronous `setState` calls directly inside an effect body. The PR currently has two spots that trigger it:

1. **~line 417** — `setIndex(0)` inside `useEffect`. The intent (reset to 0 when `active` flips true) is right, but the reset needs to happen outside the synchronous effect body. One clean approach: track `active` in a ref and only call `setIndex` inside the `setInterval` callback — start the interval from index 0 and let it cycle from there.

2. **~lines 465–466** — `setLoaded(false)` and `setHeight(0)` inside `useLayoutEffect`. These could be combined into a single `useReducer` reset, or the reset state stored in refs and derived at render time.

These two cause CI to exit non-zero, so the PR goal isn't quite met yet.

---

### Minor (non-blocking, but worth cleaning up)

**~line 431** — `_description` in the destructuring still produces an unused-var warning. The simplest fix is to just omit it from destructuring (`{ title, html }`). The prop can stay in `WidgetRendererProps` for API compatibility — only the binding needs to go.

**`globals.css` font variable** — `layout.tsx` correctly injects `--font-plus-jakarta` onto `<body>`, but `globals.css` still references `'Plus Jakarta Sans'` as a hardcoded string instead of `var(--font-plus-jakarta)`. This means Next.js's self-hosted font optimization is wired up but never actually used. Easy one-liner fix:
```css
--font-family: var(--font-plus-jakarta), system-ui, sans-serif;
```

---

Once the two `set-state-in-effect` issues are sorted, this should be good to go. Happy to help think through the hook refactors if useful — the `useLayoutEffect` one in particular has a few valid approaches depending on how you want to handle the reset.

---

<details>
<summary><strong>Ask AI to Fix These Issues</strong></summary>

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

─── Bonus fix (globals.css) ────────────────────────────────────────────────

In `apps/app/src/app/globals.css`, the font-family custom property currently reads:
```css
--font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
```

Change it to consume the Next.js font CSS variable injected by layout.tsx:
```css
--font-family: var(--font-plus-jakarta), system-ui, sans-serif;
```

─── Constraints ───────────────────────────────────────────────────────────────

- Do NOT add eslint-disable comments as a workaround — fix the code properly.
- Keep all existing observable behaviour identical (loading phrase cycling, iframe reload guard,
  loaded/height reset on html change).
- After your changes, `pnpm lint` must pass with 0 errors and 0 warnings.
- Only edit `apps/app/src/components/generative-ui/widget-renderer.tsx` and
  `apps/app/src/app/globals.css`.
````

</details>
