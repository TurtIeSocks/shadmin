# Monaco JSON Components — Design

**Date:** 2026-05-16
**Status:** Approved (pending user review of this spec)
**Umbrella package:** `src/components/monaco/`

## Goal

Add three components to shadcn-admin-kit for editing and displaying JSON-shaped record fields, built on top of the Monaco editor:

1. **`MonacoJsonInput`** — form input with JSON Schema validation, syntax highlighting, auto-completion, error markers; lazy-loaded.
2. **`MonacoJsonField`** — read-only Monaco viewer for Show/Edit detail contexts; lazy-loaded.
3. **`JsonField`** — lightweight `<pre>`-based JSON formatter for List cells; no Monaco dependency.

The `monaco` umbrella is a separate import path (`@/components/monaco`) so apps that don't use it never pay Monaco's bundle cost.

## Motivation

- ra-core resources commonly expose JSON-typed columns (Postgres `jsonb`, config blobs, dynamic field schemas).
- The existing `TextInput multiline` and rich-text/MDX editors are not suited to structured JSON — no syntax highlighting, no schema validation, no error markers.
- Monaco is the de-facto editor for JSON authoring (used in VS Code, GitHub web editor, etc.) and has first-class JSON Schema support built in.

## Non-goals

- YAML / TOML / other language editors. Folder structure permits adding `MonacoYamlInput` later without breaking this one. Out of scope for v1.
- Generic raw `MonacoEditor` primitive export. Public surface is JSON-specific only; can be promoted later if needed.
- Retrofitting TipTap / MDX editors to lazy-load. Separate concern.
- AST-driven smart completions / code actions beyond what Monaco's JSON mode provides out of the box.
- Custom diagnostics UI (panels showing error lists, "fix" buttons, etc.) — Monaco's gutter markers + form-level error are sufficient.

---

## Components

### Public surface

```
src/components/monaco/
  index.ts                              # public re-exports only
  monaco-json-input.tsx                 # public, lazy wrapper (~30 LOC)
  monaco-json-input-lazy.tsx            # heavy inner (default export), Monaco imports
  monaco-json-field.tsx                 # public, lazy wrapper
  monaco-json-field-lazy.tsx            # heavy inner (default export), Monaco imports
  json-field.tsx                        # plain <pre> formatter, NO Monaco
  internal/
    use-monaco-theme.ts                 # maps useTheme() → 'vs' | 'vs-dark'
    use-monaco-layout.ts                # ResizeObserver → instance.layout()
    use-auto-height.ts                  # contentHeight → applied height
    use-json-schema.ts                  # registers schema via jsonDefaults, scoped by modelUri
    use-monaco-markers.ts               # onDidChangeMarkers → trigger validate
    detect-value-shape.ts               # string vs object detection + round-trip helpers
    compose-validators.ts               # composes monaco validate with user validate
    monaco-skeleton.tsx                 # Suspense fallback (shadcn skeleton style)
    types.ts                            # shared prop types
```

Four public exports from `index.ts`:

1. `MonacoJsonInput`
2. `MonacoJsonField`
3. `JsonField`
4. Types: `MonacoJsonInputProps`, `MonacoJsonFieldProps`, `JsonFieldProps`

App-facing import path: `import { MonacoJsonInput } from "@/components/monaco"`.

---

## Props

### `MonacoJsonInput`

```ts
type MonacoJsonInputProps = InputProps & {
  // Schema validation (editor content is validated against the schema)
  schema?: object;                      // JSON Schema object, registered with Monaco
  schemaUri?: string;                   // remote schema URL, Monaco fetches
  allowComments?: boolean;              // default false (strict JSON)

  // Sizing
  autoHeight?: boolean;                 // default false
  height?: number | string;             // default 300, used when autoHeight=false
  minHeight?: number | string;          // default 120, autoHeight=true only
  maxHeight?: number | string;          // default 600, autoHeight=true only

  // UX
  showFormatButton?: boolean;           // default true
  readOnly?: boolean;                   // default false

  // Styling
  className?: string;                   // → FormField container
  editorClassName?: string;             // → editor wrapper div

  // Escape hatch
  monacoOptions?: editor.IStandaloneEditorConstructionOptions;  // merged last
};
```

Inherits from ra-core `InputProps`: `source`, `label`, `helperText`, `validate`, `defaultValue`, `disabled`, `readOnly`, etc.

### `MonacoJsonField`

```ts
type MonacoJsonFieldProps = FieldProps & {
  height?: number | string;             // default 200
  autoHeight?: boolean;                 // default true
  maxHeight?: number | string;          // default 400
  className?: string;
  monacoOptions?: editor.IStandaloneEditorConstructionOptions;
};
```

### `JsonField`

```ts
type JsonFieldProps = FieldProps & HTMLAttributes<HTMLPreElement> & {
  indent?: number;                      // default 2
  empty?: ReactNode;                    // mirrors TextField.empty
};
```

Renders `<pre className={cn("font-mono text-sm whitespace-pre-wrap", className)}>{JSON.stringify(value, null, indent)}</pre>`. No syntax highlighting in v1.

---

## Value-shape detection and round-trip

`field.value` for a JSON column may arrive as either a string (raw JSON text) or as a parsed object. The input must preserve the shape it received.

**Detection rule:** type of the first non-undefined `field.value` (or `defaultValue` if `field.value` is undefined at mount) locks the input's shape for the rest of its lifetime.

```ts
// internal/detect-value-shape.ts
type ValueShape = 'string' | 'object';

export function detectValueShape(value: unknown): ValueShape | null {
  if (value === undefined) return null;
  if (typeof value === 'string') return 'string';
  return 'object';                                // includes null, arrays, objects
}

export function toEditorText(value: unknown, shape: ValueShape, indent = 2): string {
  if (shape === 'string') return typeof value === 'string' ? value : '';
  if (value === undefined) return '';
  try { return JSON.stringify(value, null, indent); } catch { return ''; }
}

export function fromEditorText(text: string, shape: ValueShape): { value: unknown; parseError: Error | null } {
  if (shape === 'string') return { value: text, parseError: null };
  if (text.trim() === '') return { value: null, parseError: null };
  try { return { value: JSON.parse(text), parseError: null }; }
  catch (e) { return { value: undefined, parseError: e as Error }; }
}
```

**Component flow (inside `monaco-json-input-lazy.tsx`):**

```ts
const { id, field } = useInput({ ...props, validate: composedValidate });
const shapeRef = useRef<ValueShape | null>(null);

if (shapeRef.current === null) shapeRef.current = detectValueShape(field.value);
const shape = shapeRef.current ?? 'object';

const editorText = useMemo(() => toEditorText(field.value, shape), [field.value, shape]);

const onEditorChange = useCallback((nextText: string) => {
  const { value, parseError } = fromEditorText(nextText, shape);
  if (parseError) return;                        // don't commit invalid JSON in object mode
  field.onChange(value);
}, [field, shape]);
```

**Rationale for not-commit-on-parse-error in object mode:** committing `undefined` mid-typing would clobber the record before the user finishes editing. The Monaco marker shows the syntax error, and the validate integration (below) blocks form submit. Last known-good value stays in `field.value`.

In string mode every keystroke commits — string mode is "raw text" semantics, validation is non-blocking.

---

## Validation

### Schema registration (per-instance scoping)

Monaco's `jsonDefaults.setDiagnosticsOptions` is **global**. To support multiple `MonacoJsonInput` instances with different schemas, each input uses a unique model URI and registers its schema with `fileMatch: [modelUri]`.

```ts
// internal/use-json-schema.ts
export function useJsonSchema({ monaco, modelUri, schema, schemaUri, allowComments }: Args) {
  useEffect(() => {
    if (!monaco) return;
    const current = monaco.languages.json.jsonDefaults.diagnosticsOptions;
    const others = (current.schemas ?? []).filter(s => !s.fileMatch?.includes(modelUri));
    const next = [...others];
    if (schema) next.push({ uri: `inline://${modelUri}`, fileMatch: [modelUri], schema });
    else if (schemaUri) next.push({ uri: schemaUri, fileMatch: [modelUri] });

    monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
      validate: true,
      allowComments: !!allowComments,
      trailingCommas: allowComments ? 'ignore' : 'error',
      schemas: next,
    });

    return () => {
      const remaining = (monaco.languages.json.jsonDefaults.diagnosticsOptions.schemas ?? [])
        .filter(s => !s.fileMatch?.includes(modelUri));
      monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
        ...monaco.languages.json.jsonDefaults.diagnosticsOptions,
        schemas: remaining,
      });
    };
  }, [monaco, modelUri, schema, schemaUri, allowComments]);
}
```

Model URI pattern: `inmemory://monaco-json-input/${id}.json` (id from `useInput()`). Editor model created with:

```ts
const model = monaco.editor.getModel(monaco.Uri.parse(modelUri))
  ?? monaco.editor.createModel(initialText, 'json', monaco.Uri.parse(modelUri));
```

### Markers → ra-core `validate`

```ts
const markersRef = useRef<editor.IMarker[]>([]);

const monacoValidate = useCallback(() => {
  const errors = markersRef.current.filter(m => m.severity >= 8 /* Error */);
  if (errors.length === 0) return undefined;
  return errors[0].message;
}, []);

const composedValidate = useMemo(
  () => composeValidators(monacoValidate, ...arrayize(props.validate)),
  [props.validate]
);

const { id, field } = useInput({ ...props, validate: composedValidate });
const { trigger } = useFormContext();

const onMarkersChange = useCallback((markers: editor.IMarker[]) => {
  markersRef.current = markers;
  trigger(field.name);                            // re-run validate now markers updated
}, [field.name, trigger]);
```

Wired via:

```ts
monaco.editor.onDidChangeMarkers(resources => {
  if (resources.some(r => r.toString() === model.uri.toString())) {
    onMarkersChange(monaco.editor.getModelMarkers({ resource: model.uri }));
  }
});
```

`composeValidators` runs monacoValidate first; if it returns an error, that's the form error. Otherwise the user-supplied validate runs. This means schema-level errors win over user-level rules — correct, because user rules typically assume the JSON is valid.

### Error rendering

Standard project pattern: `<FormError />` after `<FormControl>` reads `fieldState.error` from form context and renders the first marker's message via `<ValidationError>` (which handles i18n keys).

### String-mode behavior

In string mode, no schema validation runs (text is opaque). `validate` only invokes user-supplied rules. `useJsonSchema` is skipped when `shape === 'string'`.

---

## Lazy loading and Suspense

### Two-file split per heavy component

```tsx
// monaco-json-input.tsx (public, no Monaco import)
import { lazy, Suspense } from 'react';
import { MonacoSkeleton } from './internal/monaco-skeleton';
import type { MonacoJsonInputProps } from './internal/types';

const LazyInner = lazy(() => import('./monaco-json-input-lazy'));

export const MonacoJsonInput = (props: MonacoJsonInputProps) => (
  <Suspense fallback={<MonacoSkeleton height={props.height ?? 300} />}>
    <LazyInner {...props} />
  </Suspense>
);

export type { MonacoJsonInputProps };
```

```tsx
// monaco-json-input-lazy.tsx
const MonacoJsonInputInner = (props: MonacoJsonInputProps) => { /* real component */ };
export default MonacoJsonInputInner;
```

Same split for `MonacoJsonField`. `JsonField` is not lazy.

### Skeleton

```tsx
// internal/monaco-skeleton.tsx
export const MonacoSkeleton = ({ height }: { height: number | string }) => (
  <div
    className="rounded-md border bg-muted/30 animate-pulse"
    style={{ height: typeof height === 'number' ? `${height}px` : height }}
    aria-busy="true"
    aria-label="Loading editor"
  />
);
```

### Chunk dedup

Both `*-lazy` files import from `@monaco-editor/react`. Vite emits a shared chunk; first mount of either component loads Monaco, second mount is instant.

### Nested Suspense

App pages wrapped in their own `lazy()` boundaries (e.g. `lazy(() => import('./products-edit'))`) will nest Suspense around `MonacoJsonInput`'s. React handles nested boundaries cleanly — documented in the component doc page.

---

## Theme integration

```ts
// internal/use-monaco-theme.ts
export function useMonacoTheme(): 'vs' | 'vs-dark' {
  const [mode] = useTheme();                      // project hook
  return mode === 'dark' ? 'vs-dark' : 'vs';
}
```

Passed to `<Editor theme={...} />`. System mode (auto light/dark) is resolved by the project's `ThemeProvider` before `useTheme()` returns; this hook only sees concrete `light` / `dark`.

---

## Layout / sizing

### Manual layout on container resize

```ts
// internal/use-monaco-layout.ts
export function useMonacoLayout(
  containerRef: RefObject<HTMLElement | null>,
  instance: editor.IStandaloneCodeEditor | null,
) {
  useEffect(() => {
    if (!instance || !containerRef.current || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(() => instance.layout());
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [containerRef, instance]);
}
```

### Auto-height

```ts
// internal/use-auto-height.ts
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
      const next = Math.max(minHeight, Math.min(maxHeight, instance.getContentHeight()));
      setHeight(next);
      instance.layout();
    };
    update();
    const disp = instance.onDidContentSizeChange(update);
    return () => disp.dispose();
  }, [instance, enabled, minHeight, maxHeight]);
  return enabled ? height : 0;
}
```

When `autoHeight=true`, the wrapper div's height is driven by this hook. When `false`, height is the `height` prop.

---

## Format button

When `showFormatButton: true`, render a small ghost button in the editor wrapper's top-right corner. Click triggers `instance.getAction('editor.action.formatDocument')?.run()`. Cmd+Shift+I still works regardless.

---

## Testing strategy

### Specs

```
src/components/monaco/
  monaco-json-input.spec.tsx
  monaco-json-field.spec.tsx
  json-field.spec.tsx
  internal/
    detect-value-shape.spec.ts
    compose-validators.spec.ts          # if helper is added
```

Spec content:

- **`monaco-json-input.spec.tsx`**: render with object value → editor displays stringified text; render with string value → editor displays raw text; type invalid JSON → marker appears + `field.onChange` NOT called + form submit blocked; type valid JSON → `field.onChange` receives parsed object; provide schema → schema violation surfaces as form error.
- **`monaco-json-field.spec.tsx`**: render record with JSON value → editor mounts read-only → text matches `JSON.stringify(record[source], null, 2)`.
- **`json-field.spec.tsx`**: render value → `<pre>` text matches; missing value → renders `empty` prop.
- **`detect-value-shape.spec.ts`**: every branch of `detectValueShape` / `toEditorText` / `fromEditorText`, including null, empty string, undefined, parse error.

Specs import stories. Few files to minimize Monaco cold-boot tax (each browser spec file pays ~1-2s for Monaco init).

### Stories

```
src/stories/monaco/
  monaco-json-input.stories.tsx     # Basic, WithSchema, AutoHeight, StringMode, ReadOnly, Disabled, WithComments, RemoteSchema
  monaco-json-field.stories.tsx     # Basic, AutoHeight, FixedHeight
  json-field.stories.tsx            # Basic, CustomIndent, Empty
```

Stories use `<StoryAdmin>` from `src/stories/_test-helpers.tsx`. Real Monaco — Storybook handles Suspense.

### Wait pattern

Monaco markers fire async. Use `await vi.waitFor(() => expect(...))` or `await expect.element(...).toHaveText(...)` for marker-driven assertions.

### Out of scope for tests

- Monaco's own JSON parsing (it's the library)
- Theme switching at runtime (covered manually in Storybook)
- Auto-height precise pixel math (assert "grows when content added", not exact pixels)

---

## Dependencies

New entries in `package.json`:

```json
{
  "dependencies": {
    "@monaco-editor/react": "^4.6.0",
    "monaco-editor": "^0.52.0"
  }
}
```

`@monaco-editor/react` wraps `monaco-editor` and handles worker loading. Configure bundle-local loading (not CDN) via `loader.config({ monaco })` inside the lazy file:

```ts
// monaco-json-input-lazy.tsx (top of file)
import * as monaco from 'monaco-editor';
import { loader } from '@monaco-editor/react';
loader.config({ monaco });
```

This guarantees the editor works offline / in airgapped environments and pins the version.

### Vite

No `vite.config.ts` changes required. Vite handles dynamic-import code-splitting and `@monaco-editor/react` v4 manages worker URLs internally.

---

## Demo wiring

One demo route uses `MonacoJsonInput` so the demo gallery surfaces it. Candidate: extend the existing `products` resource with a `metadata: object` field edited via Monaco with a small JSON Schema (`{ type: "object", additionalProperties: true }` or a more interesting schema for promo metadata). Concrete choice deferred to plan.

---

## Documentation

Three new doc pages under `docs/src/content/docs/`:

- `monaco-json-input.md`
- `monaco-json-field.md`
- `json-field.md`

Structure follows project convention: frontmatter → description → Usage → Props table → per-prop sections → Tips.

Tips section calls out:

- Suspense behavior + nested Suspense
- Schema validation flow (inline schema, remote schemaUri, allowComments)
- Value-shape detection (string vs object round-trip)
- Bundle weight (lazy boundary, when chunk loads)
- JSONC support (allowComments + trailingCommas)
- Not for use in List cells (recommend `JsonField` instead)

### Sidebar wiring

Add the three pages to `docs/astro.config.mjs` sidebar under existing "Inputs" and "Fields" groups.

---

## Open implementation questions (resolve during plan)

1. Exact promo/demo schema for the `products.metadata` field (or whichever resource is chosen).
2. Whether to expose `composeValidators` as a public utility (`src/lib/`) or keep it internal to the monaco package. Inclined to keep internal — single-consumer utility.
3. i18n keys for the format button tooltip and the default schema-error message — add to `src/lib/i18n-defaults.ts`? Yes if existing keys live there.
4. Whether `MonacoJsonField` should also expose a "copy to clipboard" button. Inclined to defer — easy follow-up if requested.

---

## File-count summary

- 3 public components: `MonacoJsonInput`, `MonacoJsonField`, `JsonField`
- 3 public types: `MonacoJsonInputProps`, `MonacoJsonFieldProps`, `JsonFieldProps`
- 5 component files (2 public wrappers + 2 lazy-target inners + 1 plain field)
- 1 `index.ts` re-export barrel
- 9 internal helpers (theme/layout/auto-height/schema/markers hooks + detect-value-shape + compose-validators + skeleton + types)
- 3 spec files for components + 1-2 spec files for pure helpers
- 3 story files
- 3 doc pages
- 1 sidebar entry update
- 2 new dependencies in `package.json`

Total new code: ~1500–2000 LOC including tests, stories, and docs.
