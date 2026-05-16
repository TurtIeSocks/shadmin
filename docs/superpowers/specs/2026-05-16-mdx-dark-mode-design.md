# MDX editor dark mode fix

**Date:** 2026-05-16
**Status:** Draft
**Related todos:** Fix mdx-editor dark mode (dark text on dark background).

---

## Goal

Make the MDX editor (`@mdxeditor/editor@^3.46`) readable in dark mode. Current state: editor body uses hardcoded light-mode CSS colors regardless of app theme, producing dark text on dark backgrounds. Desired: editor text + background switch with app theme.

---

## Diagnosis

| File:Line | Issue |
|---|---|
| `src/components/mdx-editor/mdx-input.tsx:141` | `<MDXEditor>` receives no className that activates dark theme |
| `src/components/mdx-editor/mdx-field.tsx:78` | Same |
| `src/components/admin/theme-provider.tsx:92` | App theme adds `.dark` to `<html>` — not inherited by MDXEditor's internal CSS |

`@mdxeditor/editor` activates dark theme via `.mdxeditor-dark` class on the editor root container.

---

## Fix

### 1. Detect theme

Import `useTheme` from `@/components/admin/theme-provider` in both `mdx-input.tsx` and `mdx-field.tsx`. Add inside the component:

```tsx
const { theme } = useTheme();
const isDark =
  theme === "dark" ||
  (theme === "system" &&
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches);
```

### 2. Apply class to editor root

```tsx
<MDXEditor
  {...mdxProps}
  className={cn(mdxProps?.className, isDark && "mdxeditor-dark", "...")}
/>
```

### 3. Verify library CSS coverage

After install, verify `node_modules/@mdxeditor/editor/dist/style.css` contains `.mdxeditor-dark` selectors. If absent or incomplete:
- Write `src/components/mdx-editor/mdx-editor-dark.css` mapping the editor's CSS variables (`--mdxeditor-bg-color`, `--mdxeditor-text-color`, etc.) to project tokens (`var(--background)`, `var(--foreground)`).
- Import that CSS at the top of `mdx-input.tsx` after the library CSS.

### 4. Story + spec coverage

- `src/stories/mdx-editor/mdx-input.stories.tsx` — add a `Dark` story variant wrapped in `<div className="dark bg-background">`.
- `src/stories/mdx-editor/mdx-field.stories.tsx` — same.
- `mdx-input.spec.tsx` / `mdx-field.spec.tsx` — assert that when theme is `dark`, editor root has class `mdxeditor-dark`.

---

## Files

- `src/components/mdx-editor/mdx-input.tsx`
- `src/components/mdx-editor/mdx-field.tsx`
- `src/components/mdx-editor/mdx-editor-dark.css` (only if library CSS insufficient)
- `src/stories/mdx-editor/mdx-input.stories.tsx`
- `src/stories/mdx-editor/mdx-field.stories.tsx`
- `src/components/mdx-editor/mdx-input.spec.tsx`
- `src/components/mdx-editor/mdx-field.spec.tsx`

---

## Acceptance criteria

- [ ] Toggling app theme to dark switches MDX editor body color + background.
- [ ] Toolbar respects dark theme.
- [ ] `Dark` story variant renders readable text.
- [ ] Spec asserts `mdxeditor-dark` class is applied when `theme="dark"`.
- [ ] Light mode unchanged.

---

## Assumptions

- `@/components/admin/theme-provider` exports `useTheme()` returning `{ theme: "light" | "dark" | "system" }`. To verify; if shape differs, adapt accordingly.
- `@mdxeditor/editor@^3.46` provides `.mdxeditor-dark` styles. To verify; if missing, write CSS-var override file (~30 lines).
- `system` theme + `prefers-color-scheme: dark` should activate dark editor (mirrors how the rest of the app handles `system`).
- Toolbar shares the same theming hook (no separate toolbar dark class needed once root has `mdxeditor-dark`).
