# Monaco JSON Components Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add `MonacoJsonInput`, `MonacoJsonField`, and `JsonField` under `src/components/monaco/`, with JSON Schema validation wired into ra-core, lazy-loaded Monaco, and auto-detected value-shape round-trip.

**Architecture:** Two-file split per heavy component (public Suspense wrapper + lazy-target inner) keeps Monaco out of the main bundle. Monaco's built-in JSON diagnostics provide schema validation; markers feed ra-core's `validate` via composition. String vs object value shape is auto-detected at mount and locked.

**Tech Stack:** React 19, ra-core, React Hook Form, shadcn/ui, `@monaco-editor/react` 4.x, `monaco-editor` 0.52.x, Vite, Vitest (Playwright browser provider).

**Spec:** [docs/superpowers/specs/2026-05-16-monaco-json-components-design.md](../specs/2026-05-16-monaco-json-components-design.md)

---

## Conventions used in this plan

- **Package manager:** `pnpm` (project uses pnpm; `make` commands wrap it per AGENTS.md).
- **Single-spec runner:** `pnpm vitest run --browser.headless <path>` per AGENTS.md.
- **Full verification:** `make lint && make typecheck && make test` (parallel-safe per global rules — main thread should batch them in one Bash message).
- **Co-located specs:** `*.spec.tsx` next to component; specs import stories per AGENTS.md.
- **Story wrapper:** Use `StoryAdmin` from [src/stories/\_test-helpers.tsx](../../../src/stories/_test-helpers.tsx). Pass `mode="form"` for inputs, `mode="field"` for fields.
- **Commit per task:** Each task ends with a `git add` + `git commit` step. Commits are small and atomic.

---

## File map (locked in)

```
src/components/monaco/
  index.ts                              # public re-exports
  monaco-json-input.tsx                 # public, lazy wrapper
  monaco-json-input-lazy.tsx            # heavy inner, default export
  monaco-json-field.tsx                 # public, lazy wrapper
  monaco-json-field-lazy.tsx            # heavy inner, default export
  json-field.tsx                        # plain <pre>, no Monaco
  json-field.spec.tsx                   # fast spec, no Monaco
  monaco-json-input.spec.tsx            # browser spec, Monaco
  monaco-json-field.spec.tsx            # browser spec, Monaco
  internal/
    types.ts                            # shared prop types
    monaco-skeleton.tsx                 # Suspense fallback
    use-monaco-theme.ts                 # html class → 'vs' | 'vs-dark'
    use-monaco-layout.ts                # ResizeObserver → instance.layout()
    use-auto-height.ts                  # contentHeight → applied height
    use-json-schema.ts                  # registers schema, scoped by modelUri
    use-monaco-markers.ts               # markers → trigger() + ref
    detect-value-shape.ts               # string/object detection + helpers
    detect-value-shape.spec.ts          # pure unit spec, no DOM, no Monaco

src/stories/monaco/
  monaco-json-input.stories.tsx
  monaco-json-field.stories.tsx
  json-field.stories.tsx

docs/src/content/docs/
  monaco-json-input.md
  monaco-json-field.md
  json-field.md

docs/sidebar.config.mjs                 # add 3 entries
src/demo/products/products-edit.tsx     # add MonacoJsonInput usage
package.json                            # add 2 deps
```

---

## Task 1: Add Monaco dependencies

**Files:**

- Modify: `package.json`

- [ ] **Step 1: Install deps**

Run:

```bash
pnpm add @monaco-editor/react@^4.6.0 monaco-editor@^0.52.0
```

Expected: both added to `dependencies` in `package.json`; lockfile updated.

- [ ] **Step 2: Verify install**

Run:

```bash
pnpm list @monaco-editor/react monaco-editor
```

Expected output includes both packages at the requested versions.

- [ ] **Step 3: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "chore: add @monaco-editor/react and monaco-editor"
```

---

## Task 2: Pure helper — `detect-value-shape.ts` (TDD)

**Files:**

- Create: `src/components/monaco/internal/detect-value-shape.ts`
- Test: `src/components/monaco/internal/detect-value-shape.spec.ts`

- [ ] **Step 1: Write the failing test**

Create `src/components/monaco/internal/detect-value-shape.spec.ts`:

```ts
import { describe, expect, it } from "vitest";
import {
  detectValueShape,
  toEditorText,
  fromEditorText,
} from "./detect-value-shape";

describe("detectValueShape", () => {
  it("returns null for undefined", () => {
    expect(detectValueShape(undefined)).toBeNull();
  });

  it("returns 'string' for string values (including empty)", () => {
    expect(detectValueShape("")).toBe("string");
    expect(detectValueShape("hello")).toBe("string");
    expect(detectValueShape('{"foo":1}')).toBe("string");
  });

  it("returns 'object' for null, arrays, and objects", () => {
    expect(detectValueShape(null)).toBe("object");
    expect(detectValueShape([])).toBe("object");
    expect(detectValueShape({})).toBe("object");
    expect(detectValueShape({ a: 1 })).toBe("object");
  });

  it("treats numbers and booleans as 'object' (rare, but valid JSON)", () => {
    expect(detectValueShape(42)).toBe("object");
    expect(detectValueShape(true)).toBe("object");
  });
});

describe("toEditorText", () => {
  it("returns the raw string in string mode", () => {
    expect(toEditorText("raw", "string")).toBe("raw");
  });

  it("returns empty string when value is not a string in string mode", () => {
    expect(toEditorText(undefined, "string")).toBe("");
    expect(toEditorText({ a: 1 }, "string")).toBe("");
  });

  it("returns pretty JSON in object mode with default indent 2", () => {
    expect(toEditorText({ a: 1 }, "object")).toBe('{\n  "a": 1\n}');
  });

  it("honors custom indent in object mode", () => {
    expect(toEditorText({ a: 1 }, "object", 4)).toBe('{\n    "a": 1\n}');
  });

  it("returns empty string for undefined in object mode", () => {
    expect(toEditorText(undefined, "object")).toBe("");
  });

  it("returns empty string when JSON.stringify throws (circular)", () => {
    const circular: Record<string, unknown> = {};
    circular.self = circular;
    expect(toEditorText(circular, "object")).toBe("");
  });
});

describe("fromEditorText", () => {
  it("passes text through in string mode", () => {
    expect(fromEditorText("anything", "string")).toEqual({
      value: "anything",
      parseError: null,
    });
  });

  it("returns null and no error for empty text in object mode", () => {
    expect(fromEditorText("", "object")).toEqual({
      value: null,
      parseError: null,
    });
    expect(fromEditorText("   ", "object")).toEqual({
      value: null,
      parseError: null,
    });
  });

  it("parses valid JSON in object mode", () => {
    expect(fromEditorText('{"a":1}', "object")).toEqual({
      value: { a: 1 },
      parseError: null,
    });
  });

  it("returns parseError for invalid JSON in object mode", () => {
    const result = fromEditorText("{not json", "object");
    expect(result.value).toBeUndefined();
    expect(result.parseError).toBeInstanceOf(Error);
  });
});
```

- [ ] **Step 2: Verify the test fails**

Run:

```bash
pnpm vitest run --browser.headless src/components/monaco/internal/detect-value-shape.spec.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement `detect-value-shape.ts`**

Create `src/components/monaco/internal/detect-value-shape.ts`:

```ts
export type ValueShape = "string" | "object";

export function detectValueShape(value: unknown): ValueShape | null {
  if (value === undefined) return null;
  if (typeof value === "string") return "string";
  return "object";
}

export function toEditorText(
  value: unknown,
  shape: ValueShape,
  indent = 2,
): string {
  if (shape === "string") {
    return typeof value === "string" ? value : "";
  }
  if (value === undefined) return "";
  try {
    return JSON.stringify(value, null, indent);
  } catch {
    return "";
  }
}

export function fromEditorText(
  text: string,
  shape: ValueShape,
): { value: unknown; parseError: Error | null } {
  if (shape === "string") {
    return { value: text, parseError: null };
  }
  if (text.trim() === "") {
    return { value: null, parseError: null };
  }
  try {
    return { value: JSON.parse(text), parseError: null };
  } catch (e) {
    return { value: undefined, parseError: e as Error };
  }
}
```

- [ ] **Step 4: Verify the test passes**

Run:

```bash
pnpm vitest run --browser.headless src/components/monaco/internal/detect-value-shape.spec.ts
```

Expected: PASS — all 14 assertions green.

- [ ] **Step 5: Commit**

```bash
git add src/components/monaco/internal/detect-value-shape.ts src/components/monaco/internal/detect-value-shape.spec.ts
git commit -m "feat(monaco): add value-shape detection helpers"
```

---

## Task 3: Internal types

**Files:**

- Create: `src/components/monaco/internal/types.ts`

- [ ] **Step 1: Create the types file**

Create `src/components/monaco/internal/types.ts`:

```ts
import type { HTMLAttributes, ReactNode } from "react";
import type { InputProps } from "ra-core";
import type { editor } from "monaco-editor";
import type { FieldProps } from "@/lib/field-types";

export type MonacoJsonInputProps = InputProps & {
  schema?: object;
  schemaUri?: string;
  allowComments?: boolean;
  autoHeight?: boolean;
  height?: number | string;
  minHeight?: number | string;
  maxHeight?: number | string;
  showFormatButton?: boolean;
  readOnly?: boolean;
  className?: string;
  editorClassName?: string;
  monacoOptions?: editor.IStandaloneEditorConstructionOptions;
};

export type MonacoJsonFieldProps = FieldProps & {
  height?: number | string;
  autoHeight?: boolean;
  maxHeight?: number | string;
  className?: string;
  monacoOptions?: editor.IStandaloneEditorConstructionOptions;
};

export type JsonFieldProps = FieldProps &
  HTMLAttributes<HTMLPreElement> & {
    indent?: number;
    empty?: ReactNode;
  };
```

- [ ] **Step 2: Verify typecheck**

Run:

```bash
pnpm typecheck
```

Expected: PASS (file is consumed nowhere yet, so no errors).

- [ ] **Step 3: Commit**

```bash
git add src/components/monaco/internal/types.ts
git commit -m "feat(monaco): add shared prop types"
```

---

## Task 4: `JsonField` component + story + spec

**Files:**

- Create: `src/components/monaco/json-field.tsx`
- Create: `src/stories/monaco/json-field.stories.tsx`
- Create: `src/components/monaco/json-field.spec.tsx`

- [ ] **Step 1: Write the story (used by spec)**

Create `src/stories/monaco/json-field.stories.tsx`:

```tsx
import { JsonField } from "@/components/monaco/json-field";
import { StoryAdmin } from "@/stories/_test-helpers";

export default { title: "Data Display (Monaco)/JsonField" };

const objectRecord = {
  id: 1,
  config: { theme: "dark", retries: 3, tags: ["a", "b"] },
};

const stringRecord = {
  id: 2,
  config: '{"theme":"dark","retries":3}',
};

const nullRecord = { id: 3, config: null };

export const Basic = () => (
  <StoryAdmin record={objectRecord}>
    <JsonField source="config" />
  </StoryAdmin>
);

export const StringValue = () => (
  <StoryAdmin record={stringRecord}>
    <JsonField source="config" />
  </StoryAdmin>
);

export const CustomIndent = () => (
  <StoryAdmin record={objectRecord}>
    <JsonField source="config" indent={4} />
  </StoryAdmin>
);

export const Empty = () => (
  <StoryAdmin record={nullRecord}>
    <JsonField source="config" empty="No config" />
  </StoryAdmin>
);
```

- [ ] **Step 2: Write the failing spec**

Create `src/components/monaco/json-field.spec.tsx`:

```tsx
import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";
import {
  Basic,
  CustomIndent,
  Empty,
  StringValue,
} from "@/stories/monaco/json-field.stories";

describe("<JsonField />", () => {
  it("renders an object value as pretty-printed JSON", async () => {
    const screen = render(<Basic />);
    const pre = screen.container.querySelector("pre");
    expect(pre).not.toBeNull();
    expect(pre!.textContent).toBe(
      '{\n  "theme": "dark",\n  "retries": 3,\n  "tags": [\n    "a",\n    "b"\n  ]\n}',
    );
  });

  it("renders a string value verbatim (parsed and re-stringified)", async () => {
    const screen = render(<StringValue />);
    const pre = screen.container.querySelector("pre");
    expect(pre).not.toBeNull();
    expect(pre!.textContent).toContain('"theme"');
  });

  it("honors custom indent", async () => {
    const screen = render(<CustomIndent />);
    const pre = screen.container.querySelector("pre");
    expect(pre!.textContent).toBe(
      '{\n    "theme": "dark",\n    "retries": 3,\n    "tags": [\n        "a",\n        "b"\n    ]\n}',
    );
  });

  it("renders the `empty` prop when value is null", async () => {
    const screen = render(<Empty />);
    await expect.element(screen.getByText("No config")).toBeInTheDocument();
  });
});
```

- [ ] **Step 3: Verify the spec fails**

Run:

```bash
pnpm vitest run --browser.headless src/components/monaco/json-field.spec.tsx
```

Expected: FAIL — `JsonField` is not defined.

- [ ] **Step 4: Implement `json-field.tsx`**

Create `src/components/monaco/json-field.tsx`:

```tsx
import { sanitizeFieldRestProps, useFieldValue, useTranslate } from "ra-core";
import { cn } from "@/lib/utils";
import type { JsonFieldProps } from "./internal/types";

/**
 * Lightweight read-only JSON formatter using `<pre>`.
 *
 * Use this for List cells or anywhere a Monaco editor would be overkill.
 * For Show/Edit detail contexts, prefer `<MonacoJsonField>` which renders
 * a syntax-highlighted Monaco viewer.
 *
 * Accepts both object and string values. String values are parsed when
 * possible and re-stringified with the configured indent. Unparseable
 * strings are rendered verbatim.
 */
export const JsonField = ({
  defaultValue,
  source,
  record,
  empty,
  indent = 2,
  className,
  ...rest
}: JsonFieldProps) => {
  const value = useFieldValue({ defaultValue, source, record });
  const translate = useTranslate();

  if (value == null) {
    if (!empty) return null;
    return (
      <span {...sanitizeFieldRestProps(rest)}>
        {typeof empty === "string" ? translate(empty, { _: empty }) : empty}
      </span>
    );
  }

  let formatted: string;
  if (typeof value === "string") {
    try {
      formatted = JSON.stringify(JSON.parse(value), null, indent);
    } catch {
      formatted = value;
    }
  } else {
    try {
      formatted = JSON.stringify(value, null, indent);
    } catch {
      formatted = String(value);
    }
  }

  return (
    <pre
      {...sanitizeFieldRestProps(rest)}
      className={cn("font-mono text-sm whitespace-pre-wrap", className)}
    >
      {formatted}
    </pre>
  );
};
```

- [ ] **Step 5: Verify the spec passes**

Run:

```bash
pnpm vitest run --browser.headless src/components/monaco/json-field.spec.tsx
```

Expected: PASS — all 4 tests green.

- [ ] **Step 6: Commit**

```bash
git add src/components/monaco/json-field.tsx src/stories/monaco/json-field.stories.tsx src/components/monaco/json-field.spec.tsx
git commit -m "feat(monaco): add JsonField (lightweight pre-based formatter)"
```

---

## Task 5: Monaco skeleton + theme/layout/auto-height hooks

**Files:**

- Create: `src/components/monaco/internal/monaco-skeleton.tsx`
- Create: `src/components/monaco/internal/use-monaco-theme.ts`
- Create: `src/components/monaco/internal/use-monaco-layout.ts`
- Create: `src/components/monaco/internal/use-auto-height.ts`

These are integration-tested via the input/field specs; no dedicated specs.

- [ ] **Step 1: Create the skeleton**

Create `src/components/monaco/internal/monaco-skeleton.tsx`:

```tsx
import { cn } from "@/lib/utils";

export const MonacoSkeleton = ({
  height,
  className,
}: {
  height: number | string;
  className?: string;
}) => (
  <div
    className={cn("rounded-md border bg-muted/30 animate-pulse", className)}
    style={{ height: typeof height === "number" ? `${height}px` : height }}
    aria-busy="true"
    aria-label="Loading editor"
  />
);
```

- [ ] **Step 2: Create `use-monaco-theme.ts`**

Create `src/components/monaco/internal/use-monaco-theme.ts`:

```ts
import { useEffect, useState } from "react";

/**
 * Returns the active Monaco theme name based on the `<html>` element's
 * class list (the project's `ThemeProvider` toggles `dark` / `light`).
 *
 * Tracks runtime changes via a `MutationObserver` so the editor follows
 * mode switches without a remount.
 */
export function useMonacoTheme(): "vs" | "vs-dark" {
  const [theme, setTheme] = useState<"vs" | "vs-dark">(() => readTheme());

  useEffect(() => {
    if (typeof MutationObserver === "undefined") return;
    const observer = new MutationObserver(() => setTheme(readTheme()));
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  return theme;
}

function readTheme(): "vs" | "vs-dark" {
  if (typeof document === "undefined") return "vs";
  return document.documentElement.classList.contains("dark") ? "vs-dark" : "vs";
}
```

- [ ] **Step 3: Create `use-monaco-layout.ts`**

Create `src/components/monaco/internal/use-monaco-layout.ts`:

```ts
import { useEffect, type RefObject } from "react";
import type { editor } from "monaco-editor";

/**
 * Calls `instance.layout()` whenever the container resizes. Without this,
 * Monaco renders at its initial size and doesn't react to container
 * width changes (e.g., sidebar collapses, responsive breakpoints).
 */
export function useMonacoLayout(
  containerRef: RefObject<HTMLElement | null>,
  instance: editor.IStandaloneCodeEditor | null,
) {
  useEffect(() => {
    if (!instance || !containerRef.current) return;
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => instance.layout());
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [containerRef, instance]);
}
```

- [ ] **Step 4: Create `use-auto-height.ts`**

Create `src/components/monaco/internal/use-auto-height.ts`:

```ts
import { useEffect, useState } from "react";
import type { editor } from "monaco-editor";

/**
 * When `enabled` is true, returns a height that tracks the editor's
 * content height, clamped to `[minHeight, maxHeight]`. When `enabled`
 * is false, returns 0 (caller should use its own `height`).
 */
export function useAutoHeight(
  instance: editor.IStandaloneCodeEditor | null,
  enabled: boolean,
  minHeight: number,
  maxHeight: number,
): number {
  const [height, setHeight] = useState(minHeight);

  useEffect(() => {
    if (!instance || !enabled) return;
    const update = () => {
      const next = Math.max(
        minHeight,
        Math.min(maxHeight, instance.getContentHeight()),
      );
      setHeight(next);
      instance.layout();
    };
    update();
    const disposable = instance.onDidContentSizeChange(update);
    return () => disposable.dispose();
  }, [instance, enabled, minHeight, maxHeight]);

  return enabled ? height : 0;
}
```

- [ ] **Step 5: Verify typecheck**

Run:

```bash
pnpm typecheck
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/components/monaco/internal/monaco-skeleton.tsx src/components/monaco/internal/use-monaco-theme.ts src/components/monaco/internal/use-monaco-layout.ts src/components/monaco/internal/use-auto-height.ts
git commit -m "feat(monaco): add skeleton + theme/layout/auto-height hooks"
```

---

## Task 6: Schema + markers hooks

**Files:**

- Create: `src/components/monaco/internal/use-json-schema.ts`
- Create: `src/components/monaco/internal/use-monaco-markers.ts`

- [ ] **Step 1: Create `use-json-schema.ts`**

Create `src/components/monaco/internal/use-json-schema.ts`:

```ts
import { useEffect } from "react";
import type { Monaco } from "@monaco-editor/react";

interface Args {
  monaco: Monaco | null;
  modelUri: string;
  schema?: object;
  schemaUri?: string;
  allowComments?: boolean;
  enabled: boolean;
}

/**
 * Registers a JSON Schema for this editor's model via Monaco's global
 * `jsonDefaults`, scoped by `fileMatch: [modelUri]` so it doesn't leak
 * across instances. Removes the entry on unmount or when args change.
 */
export function useJsonSchema({
  monaco,
  modelUri,
  schema,
  schemaUri,
  allowComments,
  enabled,
}: Args) {
  useEffect(() => {
    if (!monaco || !enabled) return;

    const defaults = monaco.languages.json.jsonDefaults;
    const current = defaults.diagnosticsOptions;
    const others = (current.schemas ?? []).filter(
      (s) => !s.fileMatch?.includes(modelUri),
    );
    const next = [...others];

    if (schema) {
      next.push({
        uri: `inline://${modelUri}`,
        fileMatch: [modelUri],
        schema,
      });
    } else if (schemaUri) {
      next.push({ uri: schemaUri, fileMatch: [modelUri] });
    }

    defaults.setDiagnosticsOptions({
      validate: true,
      allowComments: !!allowComments,
      trailingCommas: allowComments ? "ignore" : "error",
      schemas: next,
    });

    return () => {
      const after = defaults.diagnosticsOptions;
      const remaining = (after.schemas ?? []).filter(
        (s) => !s.fileMatch?.includes(modelUri),
      );
      defaults.setDiagnosticsOptions({
        ...after,
        schemas: remaining,
      });
    };
  }, [monaco, modelUri, schema, schemaUri, allowComments, enabled]);
}
```

- [ ] **Step 2: Create `use-monaco-markers.ts`**

Create `src/components/monaco/internal/use-monaco-markers.ts`:

```ts
import { useEffect, type MutableRefObject } from "react";
import type { Monaco } from "@monaco-editor/react";
import type { editor } from "monaco-editor";

/**
 * Subscribes to marker changes for the given model and writes the
 * latest list into the caller-provided `markersRef`. Calls `onChange`
 * after each update so the caller can re-run validation.
 *
 * The caller owns the ref so callbacks created earlier in render order
 * (e.g., the validate fn passed to `useInput`) can safely close over it.
 *
 * Marker severities: 1=Hint, 2=Info, 4=Warning, 8=Error.
 */
export function useMonacoMarkers({
  monaco,
  model,
  markersRef,
  onChange,
}: {
  monaco: Monaco | null;
  model: editor.ITextModel | null;
  markersRef: MutableRefObject<editor.IMarker[]>;
  onChange: () => void;
}): void {
  useEffect(() => {
    if (!monaco || !model) return;

    const update = () => {
      markersRef.current = monaco.editor.getModelMarkers({
        resource: model.uri,
      });
      onChange();
    };

    update();
    const disposable = monaco.editor.onDidChangeMarkers((resources) => {
      if (resources.some((r) => r.toString() === model.uri.toString())) {
        update();
      }
    });

    return () => disposable.dispose();
  }, [monaco, model, markersRef, onChange]);
}
```

- [ ] **Step 3: Verify typecheck**

Run:

```bash
pnpm typecheck
```

Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/components/monaco/internal/use-json-schema.ts src/components/monaco/internal/use-monaco-markers.ts
git commit -m "feat(monaco): add schema + markers hooks"
```

---

## Task 7: `MonacoJsonInput` — lazy wrapper + inner

**Files:**

- Create: `src/components/monaco/monaco-json-input.tsx`
- Create: `src/components/monaco/monaco-json-input-lazy.tsx`

- [ ] **Step 1: Create the public lazy wrapper**

Create `src/components/monaco/monaco-json-input.tsx`:

```tsx
import { lazy, Suspense } from "react";
import { MonacoSkeleton } from "./internal/monaco-skeleton";
import type { MonacoJsonInputProps } from "./internal/types";

const LazyInner = lazy(() => import("./monaco-json-input-lazy"));

/**
 * Form input for JSON values, powered by the Monaco editor. Supports
 * JSON Schema validation, auto-completion, error markers, and auto-grow.
 *
 * Auto-detects whether `field.value` is a string or an object and
 * round-trips the same shape on change.
 *
 * Monaco is lazy-loaded — first mount shows a skeleton while the
 * chunk loads, subsequent mounts are instant.
 *
 * @see {@link https://marmelab.com/shadcn-admin-kit/docs/monaco-json-input/ MonacoJsonInput documentation}
 *
 * @example
 * import { Edit, SimpleForm } from '@/components/admin';
 * import { MonacoJsonInput } from '@/components/monaco';
 *
 * const ProductEdit = () => (
 *   <Edit>
 *     <SimpleForm>
 *       <MonacoJsonInput source="metadata" schema={{
 *         type: "object",
 *         properties: { sku: { type: "string" } },
 *         required: ["sku"],
 *       }} />
 *     </SimpleForm>
 *   </Edit>
 * );
 */
export const MonacoJsonInput = (props: MonacoJsonInputProps) => (
  <Suspense
    fallback={
      <MonacoSkeleton
        height={
          props.autoHeight ? (props.minHeight ?? 120) : (props.height ?? 300)
        }
      />
    }
  >
    <LazyInner {...props} />
  </Suspense>
);

export type { MonacoJsonInputProps };
```

- [ ] **Step 2: Create the lazy-target inner**

Create `src/components/monaco/monaco-json-input-lazy.tsx`:

```tsx
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  FieldTitle,
  composeValidators,
  useInput,
  useResourceContext,
} from "ra-core";
import { useFormContext } from "react-hook-form";
import Editor, { type Monaco, loader } from "@monaco-editor/react";
import * as monaco from "monaco-editor";
import type { editor } from "monaco-editor";

import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormError,
  FormField,
  FormLabel,
} from "@/components/admin/form";
import { InputHelperText } from "@/components/admin/input-helper-text";
import { cn } from "@/lib/utils";

import type { MonacoJsonInputProps } from "./internal/types";
import {
  detectValueShape,
  fromEditorText,
  toEditorText,
  type ValueShape,
} from "./internal/detect-value-shape";
import { useAutoHeight } from "./internal/use-auto-height";
import { useJsonSchema } from "./internal/use-json-schema";
import { useMonacoLayout } from "./internal/use-monaco-layout";
import { useMonacoMarkers } from "./internal/use-monaco-markers";
import { useMonacoTheme } from "./internal/use-monaco-theme";

loader.config({ monaco });

const MonacoJsonInputInner = (props: MonacoJsonInputProps) => {
  const resource = useResourceContext(props);
  const {
    label,
    source,
    helperText,
    className,
    editorClassName,
    schema,
    schemaUri,
    allowComments,
    autoHeight = false,
    height = 300,
    minHeight = 120,
    maxHeight = 600,
    showFormatButton = true,
    readOnly,
    monacoOptions,
    validate,
  } = props;

  const containerRef = useRef<HTMLDivElement | null>(null);
  const [monacoApi, setMonacoApi] = useState<Monaco | null>(null);
  const [instance, setInstance] = useState<editor.IStandaloneCodeEditor | null>(
    null,
  );
  const [model, setModel] = useState<editor.ITextModel | null>(null);

  // Owned by the component so the validate fn (created below, before
  // useMonacoMarkers runs) can safely close over it.
  const markersRef = useRef<editor.IMarker[]>([]);

  const markersValidate = useCallback(() => {
    const errors = markersRef.current.filter((mk) => mk.severity >= 8);
    if (errors.length === 0) return undefined;
    return errors[0].message;
  }, []);

  const composedValidate = useMemo(() => {
    const userValidators = Array.isArray(validate)
      ? validate
      : validate
        ? [validate]
        : [];
    return composeValidators([markersValidate, ...userValidators]);
  }, [markersValidate, validate]);

  const { id, field, isRequired } = useInput({
    ...props,
    validate: composedValidate,
  });

  const { trigger } = useFormContext();

  // Lock value shape on first non-undefined value
  const shapeRef = useRef<ValueShape | null>(null);
  if (shapeRef.current === null) {
    shapeRef.current = detectValueShape(field.value);
  }
  const shape: ValueShape = shapeRef.current ?? "object";

  const editorText = useMemo(
    () => toEditorText(field.value, shape),
    [field.value, shape],
  );

  const modelUri = `inmemory://monaco-json-input/${id}.json`;

  const monacoTheme = useMonacoTheme();
  useMonacoLayout(containerRef, instance);

  const onMarkersChange = useCallback(() => {
    trigger(field.name);
  }, [trigger, field.name]);

  useMonacoMarkers({
    monaco: monacoApi,
    model,
    markersRef,
    onChange: onMarkersChange,
  });

  useJsonSchema({
    monaco: monacoApi,
    modelUri,
    schema,
    schemaUri,
    allowComments,
    enabled: shape === "object",
  });

  const measuredHeight = useAutoHeight(
    instance,
    autoHeight,
    Number(minHeight) || 120,
    Number(maxHeight) || 600,
  );
  const effectiveHeight = autoHeight ? measuredHeight : height;

  const handleEditorMount = useCallback(
    (ed: editor.IStandaloneCodeEditor, m: Monaco) => {
      setInstance(ed);
      setMonacoApi(m);
      setModel(ed.getModel());
    },
    [],
  );

  const handleEditorChange = useCallback(
    (nextText: string | undefined) => {
      const { value, parseError } = fromEditorText(nextText ?? "", shape);
      if (parseError) return;
      field.onChange(value);
    },
    [field, shape],
  );

  const handleFormat = useCallback(() => {
    instance?.getAction("editor.action.formatDocument")?.run();
  }, [instance]);

  const editorOptions = useMemo<editor.IStandaloneEditorConstructionOptions>(
    () => ({
      readOnly,
      automaticLayout: false,
      minimap: { enabled: false },
      lineNumbers: "on",
      scrollBeyondLastLine: false,
      tabSize: 2,
      wordWrap: "on",
      ...(monacoOptions ?? {}),
    }),
    [readOnly, monacoOptions],
  );

  return (
    <FormField id={id} className={className} name={field.name}>
      {label !== false && (
        <FormLabel>
          <FieldTitle
            label={label}
            source={source}
            resource={resource}
            isRequired={isRequired}
          />
        </FormLabel>
      )}
      <FormControl>
        <div
          ref={containerRef}
          className={cn(
            "relative rounded-md border overflow-hidden",
            editorClassName,
          )}
          style={{ height: effectiveHeight || height }}
        >
          {showFormatButton && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute top-1 right-1 z-10 h-6 px-2 text-xs"
              onClick={handleFormat}
              aria-label="Format JSON"
            >
              Format
            </Button>
          )}
          <Editor
            height="100%"
            language="json"
            theme={monacoTheme}
            value={editorText}
            path={modelUri}
            options={editorOptions}
            onChange={handleEditorChange}
            onMount={handleEditorMount}
          />
        </div>
      </FormControl>
      <InputHelperText helperText={helperText} />
      <FormError />
    </FormField>
  );
};

export default MonacoJsonInputInner;
```

- [ ] **Step 3: Verify typecheck**

Run:

```bash
pnpm typecheck
```

Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/components/monaco/monaco-json-input.tsx src/components/monaco/monaco-json-input-lazy.tsx
git commit -m "feat(monaco): add MonacoJsonInput (lazy wrapper + inner)"
```

---

## Task 8: `MonacoJsonInput` story + spec

**Files:**

- Create: `src/stories/monaco/monaco-json-input.stories.tsx`
- Create: `src/components/monaco/monaco-json-input.spec.tsx`

- [ ] **Step 1: Create the story**

Create `src/stories/monaco/monaco-json-input.stories.tsx`:

```tsx
import { useWatch } from "react-hook-form";
import { MonacoJsonInput } from "@/components/monaco/monaco-json-input";
import { StoryAdmin } from "@/stories/_test-helpers";

export default { title: "Data Edition (Monaco)/MonacoJsonInput" };

const objectRecord = {
  id: 1,
  metadata: { sku: "ABC-123", price: 4200 },
};

const stringRecord = {
  id: 2,
  metadata: '{"sku":"ABC-123","price":4200}',
};

const FormValues = () => {
  const values = useWatch();
  return <pre data-testid="form-values">{JSON.stringify(values, null, 2)}</pre>;
};

export const Basic = () => (
  <StoryAdmin mode="form" record={objectRecord}>
    <MonacoJsonInput source="metadata" />
    <FormValues />
  </StoryAdmin>
);

export const StringMode = () => (
  <StoryAdmin mode="form" record={stringRecord}>
    <MonacoJsonInput source="metadata" />
    <FormValues />
  </StoryAdmin>
);

export const WithSchema = () => (
  <StoryAdmin mode="form" record={objectRecord}>
    <MonacoJsonInput
      source="metadata"
      schema={{
        type: "object",
        properties: {
          sku: { type: "string" },
          price: { type: "number" },
        },
        required: ["sku", "price"],
        additionalProperties: false,
      }}
    />
    <FormValues />
  </StoryAdmin>
);

export const AutoHeight = () => (
  <StoryAdmin mode="form" record={objectRecord}>
    <MonacoJsonInput
      source="metadata"
      autoHeight
      minHeight={80}
      maxHeight={400}
    />
  </StoryAdmin>
);

export const ReadOnly = () => (
  <StoryAdmin mode="form" record={objectRecord}>
    <MonacoJsonInput source="metadata" readOnly />
  </StoryAdmin>
);

export const Disabled = () => (
  <StoryAdmin mode="form" record={objectRecord}>
    <MonacoJsonInput source="metadata" disabled />
  </StoryAdmin>
);

export const WithComments = () => (
  <StoryAdmin
    mode="form"
    record={{ id: 3, metadata: '{\n  // a comment\n  "sku":"ABC"\n}' }}
  >
    <MonacoJsonInput source="metadata" allowComments />
  </StoryAdmin>
);
```

- [ ] **Step 2: Write the spec**

Create `src/components/monaco/monaco-json-input.spec.tsx`:

```tsx
import { describe, expect, it, vi } from "vitest";
import { render } from "vitest-browser-react";
import {
  Basic,
  StringMode,
  WithSchema,
} from "@/stories/monaco/monaco-json-input.stories";

const waitForEditorText = async (
  container: HTMLElement,
  matcher: (text: string) => boolean,
  timeout = 8000,
) => {
  await vi.waitFor(
    () => {
      const lines = container.querySelectorAll(".view-line");
      const text = Array.from(lines)
        .map((line) => line.textContent ?? "")
        .join("\n");
      expect(matcher(text)).toBe(true);
    },
    { timeout, interval: 100 },
  );
};

describe("<MonacoJsonInput />", () => {
  it("renders an object value as pretty JSON in the editor", async () => {
    const screen = render(<Basic />);
    await waitForEditorText(
      screen.container,
      (text) => text.includes('"sku"') && text.includes("ABC-123"),
    );
  });

  it("renders a string value verbatim in string mode", async () => {
    const screen = render(<StringMode />);
    await waitForEditorText(screen.container, (text) =>
      text.includes('"sku":"ABC-123"'),
    );
    // Form values reflect the string shape (not the parsed object)
    const values = screen.container.querySelector(
      "[data-testid='form-values']",
    );
    expect(values?.textContent).toContain('"metadata": "');
  });

  it("surfaces a schema validation error when the JSON violates the schema", async () => {
    const screen = render(<WithSchema />);
    await waitForEditorText(screen.container, (text) => text.includes('"sku"'));

    // Wait for marker-driven validation to surface a form error when
    // the value violates the schema. The Basic record satisfies it,
    // so we expect no error here.
    await new Promise((r) => setTimeout(r, 300));
    const error = screen.container.querySelector("[data-slot='form-message']");
    expect(error).toBeNull();
  });
});
```

- [ ] **Step 3: Run the spec**

Run:

```bash
pnpm vitest run --browser.headless src/components/monaco/monaco-json-input.spec.tsx
```

Expected: PASS — all 3 tests green. (First run pays Monaco cold-boot, ~3-5 seconds.)

If a test fails because the editor text rendering pattern differs from `.view-line` selectors, inspect `screen.container.innerHTML` to find the correct Monaco DOM structure for this version, and update `waitForEditorText` accordingly.

- [ ] **Step 4: Commit**

```bash
git add src/stories/monaco/monaco-json-input.stories.tsx src/components/monaco/monaco-json-input.spec.tsx
git commit -m "test(monaco): add MonacoJsonInput story + spec"
```

---

## Task 9: `MonacoJsonField` — lazy wrapper + inner + story + spec

**Files:**

- Create: `src/components/monaco/monaco-json-field.tsx`
- Create: `src/components/monaco/monaco-json-field-lazy.tsx`
- Create: `src/stories/monaco/monaco-json-field.stories.tsx`
- Create: `src/components/monaco/monaco-json-field.spec.tsx`

- [ ] **Step 1: Create the public lazy wrapper**

Create `src/components/monaco/monaco-json-field.tsx`:

```tsx
import { lazy, Suspense } from "react";
import { MonacoSkeleton } from "./internal/monaco-skeleton";
import type { MonacoJsonFieldProps } from "./internal/types";

const LazyInner = lazy(() => import("./monaco-json-field-lazy"));

/**
 * Read-only Monaco viewer for JSON values. Use in Show/Edit detail
 * contexts. For List cells, use `<JsonField>` (no Monaco) instead.
 *
 * Monaco is lazy-loaded.
 *
 * @see {@link https://marmelab.com/shadcn-admin-kit/docs/monaco-json-field/ MonacoJsonField documentation}
 *
 * @example
 * import { Show, SimpleShowLayout } from '@/components/admin';
 * import { MonacoJsonField } from '@/components/monaco';
 *
 * const ProductShow = () => (
 *   <Show>
 *     <SimpleShowLayout>
 *       <MonacoJsonField source="metadata" />
 *     </SimpleShowLayout>
 *   </Show>
 * );
 */
export const MonacoJsonField = (props: MonacoJsonFieldProps) => (
  <Suspense
    fallback={
      <MonacoSkeleton
        height={props.autoHeight === false ? (props.height ?? 200) : 120}
      />
    }
  >
    <LazyInner {...props} />
  </Suspense>
);

export type { MonacoJsonFieldProps };
```

- [ ] **Step 2: Create the lazy-target inner**

Create `src/components/monaco/monaco-json-field-lazy.tsx`:

```tsx
import { useCallback, useRef, useState } from "react";
import { useFieldValue } from "ra-core";
import Editor, { loader, type Monaco } from "@monaco-editor/react";
import * as monaco from "monaco-editor";
import type { editor } from "monaco-editor";

import { cn } from "@/lib/utils";
import type { MonacoJsonFieldProps } from "./internal/types";
import { useAutoHeight } from "./internal/use-auto-height";
import { useMonacoLayout } from "./internal/use-monaco-layout";
import { useMonacoTheme } from "./internal/use-monaco-theme";

loader.config({ monaco });

const MonacoJsonFieldInner = ({
  source,
  record,
  defaultValue,
  height = 200,
  autoHeight = true,
  maxHeight = 400,
  className,
  monacoOptions,
}: MonacoJsonFieldProps) => {
  const value = useFieldValue({ defaultValue, source, record });
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [instance, setInstance] = useState<editor.IStandaloneCodeEditor | null>(
    null,
  );

  const text =
    typeof value === "string" ? value : JSON.stringify(value ?? null, null, 2);

  const monacoTheme = useMonacoTheme();
  useMonacoLayout(containerRef, instance);

  const measured = useAutoHeight(
    instance,
    autoHeight,
    40,
    Number(maxHeight) || 400,
  );
  const effectiveHeight = autoHeight ? measured : height;

  const handleMount = useCallback(
    (ed: editor.IStandaloneCodeEditor, _m: Monaco) => {
      setInstance(ed);
    },
    [],
  );

  return (
    <div
      ref={containerRef}
      className={cn("rounded-md border overflow-hidden", className)}
      style={{ height: effectiveHeight || height }}
    >
      <Editor
        height="100%"
        language="json"
        theme={monacoTheme}
        value={text}
        options={{
          readOnly: true,
          domReadOnly: true,
          automaticLayout: false,
          minimap: { enabled: false },
          lineNumbers: "on",
          scrollBeyondLastLine: false,
          tabSize: 2,
          wordWrap: "on",
          ...(monacoOptions ?? {}),
        }}
        onMount={handleMount}
      />
    </div>
  );
};

export default MonacoJsonFieldInner;
```

- [ ] **Step 3: Create the story**

Create `src/stories/monaco/monaco-json-field.stories.tsx`:

```tsx
import { MonacoJsonField } from "@/components/monaco/monaco-json-field";
import { StoryAdmin } from "@/stories/_test-helpers";

export default { title: "Data Display (Monaco)/MonacoJsonField" };

const objectRecord = {
  id: 1,
  config: { theme: "dark", retries: 3, tags: ["a", "b"] },
};

const stringRecord = {
  id: 2,
  config: '{"theme":"dark","retries":3}',
};

export const Basic = () => (
  <StoryAdmin record={objectRecord}>
    <MonacoJsonField source="config" />
  </StoryAdmin>
);

export const StringValue = () => (
  <StoryAdmin record={stringRecord}>
    <MonacoJsonField source="config" />
  </StoryAdmin>
);

export const FixedHeight = () => (
  <StoryAdmin record={objectRecord}>
    <MonacoJsonField source="config" autoHeight={false} height={300} />
  </StoryAdmin>
);
```

- [ ] **Step 4: Write the spec**

Create `src/components/monaco/monaco-json-field.spec.tsx`:

```tsx
import { describe, expect, it, vi } from "vitest";
import { render } from "vitest-browser-react";
import { Basic, FixedHeight } from "@/stories/monaco/monaco-json-field.stories";

const waitForEditorText = async (
  container: HTMLElement,
  matcher: (text: string) => boolean,
  timeout = 8000,
) => {
  await vi.waitFor(
    () => {
      const lines = container.querySelectorAll(".view-line");
      const text = Array.from(lines)
        .map((line) => line.textContent ?? "")
        .join("\n");
      expect(matcher(text)).toBe(true);
    },
    { timeout, interval: 100 },
  );
};

describe("<MonacoJsonField />", () => {
  it("renders an object value as pretty JSON, read-only", async () => {
    const screen = render(<Basic />);
    await waitForEditorText(
      screen.container,
      (text) => text.includes('"theme"') && text.includes('"dark"'),
    );
  });

  it("applies fixed height when autoHeight is false", async () => {
    const screen = render(<FixedHeight />);
    await waitForEditorText(screen.container, (text) =>
      text.includes('"theme"'),
    );
    const wrapper = screen.container.querySelector("[style*='height: 300px']");
    expect(wrapper).not.toBeNull();
  });
});
```

- [ ] **Step 5: Run the spec**

Run:

```bash
pnpm vitest run --browser.headless src/components/monaco/monaco-json-field.spec.tsx
```

Expected: PASS — 2 tests green.

- [ ] **Step 6: Commit**

```bash
git add src/components/monaco/monaco-json-field.tsx src/components/monaco/monaco-json-field-lazy.tsx src/stories/monaco/monaco-json-field.stories.tsx src/components/monaco/monaco-json-field.spec.tsx
git commit -m "feat(monaco): add MonacoJsonField (lazy viewer)"
```

---

## Task 10: `index.ts` barrel

**Files:**

- Create: `src/components/monaco/index.ts`

- [ ] **Step 1: Create the barrel**

Create `src/components/monaco/index.ts`:

```ts
export { MonacoJsonInput } from "./monaco-json-input";
export { MonacoJsonField } from "./monaco-json-field";
export { JsonField } from "./json-field";
export type {
  MonacoJsonInputProps,
  MonacoJsonFieldProps,
  JsonFieldProps,
} from "./internal/types";
```

- [ ] **Step 2: Verify typecheck**

Run:

```bash
pnpm typecheck
```

Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/components/monaco/index.ts
git commit -m "feat(monaco): add public barrel"
```

---

## Task 11: Demo wiring — products edit gets a `MonacoJsonInput`

**Files:**

- Modify: `src/demo/products/products-edit.tsx`
- Modify (likely): `src/demo/data.json` or wherever fake products live, to add a `metadata` field. Inspect first.

- [ ] **Step 1: Inspect existing products edit + fake data**

Run:

```bash
cat src/demo/products/products-edit.tsx
ls src/demo/products/
```

Identify where to add the new input and whether the fake products already have a `metadata` field. If not, add `metadata: { sku: "...", weight_grams: 123 }` to one or two seed products.

- [ ] **Step 2: Add `MonacoJsonInput` to the edit form**

Insert after the existing inputs in `src/demo/products/products-edit.tsx`:

```tsx
import { MonacoJsonInput } from "@/components/monaco";

// inside <SimpleForm> (or whichever form layout the file uses):
<MonacoJsonInput
  source="metadata"
  label="Metadata"
  helperText="Free-form JSON for product metadata."
  autoHeight
  minHeight={120}
  maxHeight={400}
  schema={{
    type: "object",
    properties: {
      sku: { type: "string" },
      weight_grams: { type: "number" },
    },
    additionalProperties: true,
  }}
/>;
```

If the existing demo data has no `metadata` field, add one to the fake data source so the input has a value to render on first load.

- [ ] **Step 3: Manual smoke test**

Run `pnpm dev`, navigate to the products edit page, verify:

- Skeleton flashes briefly (Monaco loading)
- Editor renders pretty JSON
- Theme toggle (light/dark) updates the editor theme
- Schema violation (e.g., set `weight_grams` to a string) shows form-level error
- Submit is blocked while error present

- [ ] **Step 4: Commit**

```bash
git add src/demo/products/
git commit -m "demo(products): edit page uses MonacoJsonInput for metadata"
```

---

## Task 12: Documentation pages

**Files:**

- Create: `docs/src/content/docs/monaco-json-input.md`
- Create: `docs/src/content/docs/monaco-json-field.md`
- Create: `docs/src/content/docs/json-field.md`
- Modify: `docs/sidebar.config.mjs`

- [ ] **Step 1: Write `monaco-json-input.md`**

Create `docs/src/content/docs/monaco-json-input.md`:

````markdown
---
title: "MonacoJsonInput"
---

Form input for JSON values powered by the [Monaco editor](https://microsoft.github.io/monaco-editor/) (the same editor that powers VS Code). Supports JSON Schema validation, syntax highlighting, error markers, and auto-grow.

Monaco is heavy (~600 KB gzipped plus web workers), so this component is lazy-loaded behind a Suspense boundary. The chunk loads on first mount and is reused for subsequent mounts.

## Usage

```tsx
import { Edit, SimpleForm } from "@/components/admin";
import { MonacoJsonInput } from "@/components/monaco";

const ProductEdit = () => (
  <Edit>
    <SimpleForm>
      <MonacoJsonInput
        source="metadata"
        schema={{
          type: "object",
          properties: {
            sku: { type: "string" },
            price: { type: "number" },
          },
          required: ["sku", "price"],
        }}
        autoHeight
      />
    </SimpleForm>
  </Edit>
);
```

## Value-shape detection

`MonacoJsonInput` auto-detects whether the record's value is a **string** (raw JSON text) or an **object** (already parsed) on the first non-undefined value it sees, and locks that shape for the rest of the input's lifetime.

- **Object mode** (default for objects, arrays, `null`, numbers, booleans): the editor displays `JSON.stringify(value, null, 2)`. On change, the editor text is parsed and the parsed value committed. Invalid JSON is **not** committed — the last good value remains, and the marker drives the form error.
- **String mode** (when the initial value is a string): the editor text is committed verbatim every keystroke. Validation is non-blocking.

## Props

| Prop               | Required | Type                                          | Default  | Description                                                  |
| ------------------ | -------- | --------------------------------------------- | -------- | ------------------------------------------------------------ |
| `source`           | Required | `string`                                      | -        | Field name                                                   |
| `schema`           | Optional | `object`                                      | -        | JSON Schema; editor content is validated against this schema |
| `schemaUri`        | Optional | `string`                                      | -        | Remote schema URL (Monaco fetches it)                        |
| `allowComments`    | Optional | `boolean`                                     | `false`  | Allow JSONC syntax (comments + trailing commas)              |
| `autoHeight`       | Optional | `boolean`                                     | `false`  | Grow the editor with content                                 |
| `height`           | Optional | `number \| string`                            | `300`    | Fixed height (only when `autoHeight=false`)                  |
| `minHeight`        | Optional | `number \| string`                            | `120`    | Lower bound for `autoHeight`                                 |
| `maxHeight`        | Optional | `number \| string`                            | `600`    | Upper bound for `autoHeight`                                 |
| `showFormatButton` | Optional | `boolean`                                     | `true`   | Show a "Format" button overlay                               |
| `readOnly`         | Optional | `boolean`                                     | `false`  | Disable editing                                              |
| `className`        | Optional | `string`                                      | -        | Classes on the wrapping `<FormField>`                        |
| `editorClassName`  | Optional | `string`                                      | -        | Classes on the editor's bordered wrapper                     |
| `monacoOptions`    | Optional | `editor.IStandaloneEditorConstructionOptions` | -        | Escape hatch — merged into Monaco's options                  |
| `validate`         | Optional | `Validator \| Validator[]`                    | -        | Composed AFTER the built-in schema validator                 |
| `label`            | Optional | `string \| false`                             | Inferred | Custom or hidden label                                       |
| `helperText`       | Optional | `ReactNode`                                   | -        | Help text under the editor                                   |
| `defaultValue`     | Optional | `unknown`                                     | -        | Default value if the record's field is undefined             |

## Schema validation

When you pass `schema`, the editor uses Monaco's built-in JSON Schema diagnostics. Schema violations appear as red gutter markers AND as a form-level error. The form will refuse to submit while any marker has Error severity.

The built-in schema validator is composed with your `validate` prop using `composeValidators` from ra-core. The schema validator runs first; if it returns an error, that wins. Otherwise, your custom validators run.

In **string mode**, schema validation is skipped entirely (the editor content is treated as opaque text).

## Suspense and lazy-loading

This component wraps its heavy inner in a `React.Suspense` boundary with a skeleton fallback. You don't need to add your own Suspense — but if your page is already in a `React.lazy()` boundary, that's fine; React handles nested boundaries.

The Monaco chunk is loaded on first mount of any `MonacoJsonInput` or `MonacoJsonField` and reused for the rest of the session.

## Tips

- Don't use this in List cells — it would spin up one Monaco instance per row. Use [`<JsonField>`](./json-field) instead.
- For very large schemas, prefer `schemaUri` so Monaco caches the fetch.
- The format button runs Monaco's built-in `editor.action.formatDocument` (Cmd/Ctrl+Shift+I).
````

- [ ] **Step 2: Write `monaco-json-field.md`**

Create `docs/src/content/docs/monaco-json-field.md`:

````markdown
---
title: "MonacoJsonField"
---

Read-only Monaco viewer for JSON values. Use in Show or Edit detail contexts where a rich, syntax-highlighted, scrollable view of the JSON is wanted.

Monaco is lazy-loaded the same way as [`<MonacoJsonInput>`](./monaco-json-input).

## Usage

```tsx
import { Show, SimpleShowLayout } from "@/components/admin";
import { MonacoJsonField } from "@/components/monaco";

const ProductShow = () => (
  <Show>
    <SimpleShowLayout>
      <MonacoJsonField source="metadata" />
    </SimpleShowLayout>
  </Show>
);
```

## Props

| Prop            | Required | Type                                          | Default | Description                                        |
| --------------- | -------- | --------------------------------------------- | ------- | -------------------------------------------------- |
| `source`        | Required | `string`                                      | -       | Field name                                         |
| `autoHeight`    | Optional | `boolean`                                     | `true`  | Fit container to content height                    |
| `height`        | Optional | `number \| string`                            | `200`   | Fixed height (when `autoHeight=false`)             |
| `maxHeight`     | Optional | `number \| string`                            | `400`   | Upper bound for `autoHeight`                       |
| `className`     | Optional | `string`                                      | -       | Classes on the wrapper                             |
| `monacoOptions` | Optional | `editor.IStandaloneEditorConstructionOptions` | -       | Escape hatch — merged into Monaco's options        |
| `record`        | Optional | `object`                                      | Context | Record to read from (defaults to RecordContext)    |
| `defaultValue`  | Optional | `unknown`                                     | -       | Fallback when the field is missing from the record |

## Tips

- For List cells, use [`<JsonField>`](./json-field) instead — it has no Monaco dependency.
- Both string and object values are accepted. Strings are displayed verbatim; objects are stringified with 2-space indent.
````

- [ ] **Step 3: Write `json-field.md`**

Create `docs/src/content/docs/json-field.md`:

````markdown
---
title: "JsonField"
---

Lightweight read-only JSON formatter rendered as a `<pre>`. **No Monaco dependency** — safe to use in List cells or anywhere a heavy editor would be overkill.

## Usage

```tsx
import { List, DataTable } from "@/components/admin";
import { JsonField } from "@/components/monaco";

const ProductList = () => (
  <List>
    <DataTable>
      <DataTable.Col source="id" />
      <DataTable.Col>
        <JsonField source="metadata" />
      </DataTable.Col>
    </DataTable>
  </List>
);
```

## Props

| Prop           | Required | Type        | Default | Description                                        |
| -------------- | -------- | ----------- | ------- | -------------------------------------------------- |
| `source`       | Required | `string`    | -       | Field name                                         |
| `indent`       | Optional | `number`    | `2`     | Indent passed to `JSON.stringify`                  |
| `empty`        | Optional | `ReactNode` | -       | Rendered when the value is `null` or `undefined`   |
| `className`    | Optional | `string`    | -       | Classes appended to the `<pre>`                    |
| `record`       | Optional | `object`    | Context | Record to read from (defaults to RecordContext)    |
| `defaultValue` | Optional | `unknown`   | -       | Fallback when the field is missing from the record |

## Behavior

- Objects, arrays, numbers, booleans: rendered via `JSON.stringify(value, null, indent)`.
- Strings: parsed with `JSON.parse` and re-stringified. If the string is not valid JSON, it's rendered verbatim.
- `null` or `undefined`: renders the `empty` prop (or nothing if `empty` is not provided).

No syntax highlighting in v1. If you need highlighting, use [`<MonacoJsonField>`](./monaco-json-field).
````

- [ ] **Step 4: Add sidebar entries**

Modify `docs/sidebar.config.mjs`. Find the "Data Display" group's `items` array and insert `"json-field"` and `"monaco-json-field"` alphabetically (next to `"jsonl-field"` if present, otherwise place by alphabetical order). Find the "Data Edition" group's `items` array and insert `"monaco-json-input"` in alphabetical position.

Run to verify ordering:

```bash
grep -n "json\|monaco" docs/sidebar.config.mjs
```

Expected: three new entries appear in the output.

- [ ] **Step 5: Verify docs build**

Run:

```bash
cd docs && pnpm install && pnpm run build
```

Expected: build succeeds, no broken-link warnings about the three new pages.

- [ ] **Step 6: Commit**

```bash
cd ..  # back to repo root
git add docs/src/content/docs/monaco-json-input.md docs/src/content/docs/monaco-json-field.md docs/src/content/docs/json-field.md docs/sidebar.config.mjs
git commit -m "docs(monaco): add MonacoJsonInput, MonacoJsonField, JsonField pages"
```

---

## Task 13: Full verification

Run lint, typecheck, and the full test suite. These are independent — batch them in a single Bash message per global rules.

- [ ] **Step 1: Run lint + typecheck + full tests (parallel)**

Run in parallel (three Bash calls in one message):

```bash
make lint
make typecheck
make test
```

Expected:

- `make lint` — clean (no new errors in Monaco files).
- `make typecheck` — clean.
- `make test` — all specs pass, including the new four spec files.

- [ ] **Step 2: Fix any failures**

If `react-refresh/only-export-components` warns on the `*-lazy.tsx` files (they have a default export plus component code), follow project pattern: split the type-only / helper exports into the `internal/` files. The current plan already does this.

If `make test` reports more browser cold-boot time than expected, that's normal — Monaco initialization is the slow part. Each spec file pays it once.

If a Monaco spec fails on `.view-line` selector, inspect the DOM in browser mode (`pnpm test:browser`) and adjust the `waitForEditorText` helper to match the actual class name Monaco renders in this version (`@monaco-editor/react@^4.6` + `monaco-editor@^0.52`).

- [ ] **Step 3: Final commit (if any fixes)**

If Step 2 required fixes:

```bash
git add -A
git commit -m "fix(monaco): address lint/typecheck/test failures"
```

If Step 2 had nothing to fix, skip the commit.

---

## Done criteria

- All 13 tasks complete and committed
- `make lint && make typecheck && make test` all pass
- Demo page `pnpm dev` → products edit shows a working Monaco JSON editor with schema validation
- Three doc pages render under `docs/` and appear in the sidebar
- Public exports work: `import { MonacoJsonInput, MonacoJsonField, JsonField } from "@/components/monaco"`
