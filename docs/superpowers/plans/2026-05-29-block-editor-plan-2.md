# Block Editor — Plan 2: Catalog Completion (toggle / image / embed / record-list / chart)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fill the block-editor catalog with five more blocks — `toggle`, `image`, `embed` (content/media, no data dep, added to `defaultBlocks`) and `record-list`, `chart` (ra-core data blocks, exported via `dataBlocks`) — each mirroring the shipped Plan 1 exemplars (`callout`, `referenceRecord`).

**Architecture:** Each block is a `BlockDefinition` created with `defineBlock`. Content blocks (`toggle`) use `content:"block+"` + `<NodeViewContent/>` like `callout`. Atom/data blocks (`image`, `embed`, `record-list`, `chart`) render from `attrs`, data blocks resolving live via ra-core hooks (`useGetList`) and reusing the shared `BlockEmpty/BlockSkeleton/BlockError` states like `referenceRecord`. All blocks ship in the single `block-editor` registry item.

**Tech Stack:** React 19, TipTap v3, Zod v4, ra-core (`useGetList`), recharts (already a dep, provided via `@shadmin/admin`), shadcn ui primitives (`slider`, `table`, `collapsible`/native `details`), Vitest browser provider, `vitest-browser-react`.

**Spec:** `docs/superpowers/specs/2026-05-29-block-editor-design.md` (Plan 2 scope). **Builds on:** Plan 1 (`docs/superpowers/plans/2026-05-29-block-editor.md`, shipped).

---

## Assumptions / design calls (delegate-made)

1. **No separate `block-editor-data` registry item.** Its only rationale was isolating recharts/ra-core deps, but both already ship via the `@shadmin/admin` registryDependency that `block-editor` requires. All five blocks live in the single `block-editor` item. Data blocks are exported as a `dataBlocks` array so consumers opt in explicitly via the `blocks` prop (`blocks={[...defaultBlocks, ...dataBlocks]}`); tree-shaking drops unused blocks.
2. **`image` uses config-driven width, not drag-resize, in v2.** A file picker (→ base64) / URL input + alt + a width slider in the config popover. Robust + testable + no new API surface (no app-level `uploadFn` channel needed). Pointer drag-resize (porting `rich-text-input`'s `use-drag-resize`) is a deferred polish follow-up.
3. **`embed` is allowlist-only and never injects user HTML.** It parses the URL, extracts a strictly-validated video id for YouTube/Vimeo, and builds a known-safe iframe `src` itself. Non-allowlisted URLs render a safe placeholder, not an iframe. (See Task 3 — security.)
4. **`record-list`/`chart` aggregate client-side** from a single `useGetList` page (default `perPage` 100 for chart, 5 for list). No server-side aggregation. Good enough for embedded summaries; documented as such.
5. `toggle`, `image`, `embed` join `defaultBlocks` (content/media, no data dep). `record-list`, `chart` join `dataBlocks` only.

## File Structure

| File | Responsibility |
|---|---|
| `src/components/block-editor/blocks/toggle.tsx` | Collapsible content block (`content:"block+"`) |
| `src/components/block-editor/blocks/embed.tsx` | Allowlisted video embed (atom, security-critical) |
| `src/components/block-editor/blocks/image.tsx` | Image block (atom, base64/URL + width slider) |
| `src/components/block-editor/blocks/record-list.tsx` | Live list from a resource (`useGetList`) |
| `src/components/block-editor/blocks/chart.tsx` | Live chart from a resource (`useGetList` + recharts) |
| `src/components/block-editor/blocks/data-blocks.ts` | `dataBlocks` array (referenceRecord + recordList + chart) |
| `src/components/block-editor/blocks/index.ts` | extend `defaultBlocks`, re-export new blocks (MODIFY) |
| `src/components/block-editor/index.ts` | export new blocks + `dataBlocks` (MODIFY) |
| `src/stories/block-editor/blocks-2.stories.tsx` | stories for the content/media blocks |
| `src/stories/block-editor/data-blocks.stories.tsx` | stories for record-list + chart (fakerest) |
| `src/components/block-editor/blocks/*.spec.tsx` | co-located tests |
| `scripts/registry.config.mjs` | add `recharts`/`ra-core` to `block-editor` deps (MODIFY) |
| `docs/src/content/docs/custom-blocks.md` | document the new built-ins (MODIFY) |
| `src/demo/orders/*` | wire `dataBlocks` into the demo (MODIFY) |

**Test command (single file):** `pnpm vitest run --browser.headless <path/to/file.spec.tsx>`

**Shipped patterns to mirror (read these for exact signatures):**
- Content block: `src/components/block-editor/blocks/callout.tsx`
- Data block: `src/components/block-editor/blocks/reference-record.tsx`
- States: `src/components/block-editor/blocks/block-states.tsx` (`BlockEmpty`/`BlockSkeleton`/`BlockError`)
- `NodeViewContent` re-export: `src/components/block-editor/extensions/block-node.tsx`
- API: `defineBlock<A>({ name, label, group, icon, keywords?, description?, schema, render, config?, content?, atom? })`; `BlockRenderProps<A> = { attrs, mode, selected?, updateAttrs? }`; `BlockConfigProps<A> = { attrs, onChange }`.
- Data-block story setup (fakerest + `QueryClient` with `retry:false`): `src/stories/block-editor/reference-record.stories.tsx`.

---

## Task 1: `toggle` content block

**Files:**
- Create: `src/components/block-editor/blocks/toggle.tsx`
- Create: `src/components/block-editor/blocks/toggle.spec.tsx`
- Modify: `src/components/block-editor/blocks/index.ts`
- Modify: `src/stories/block-editor/blocks-2.stories.tsx` (create)

- [ ] **Step 1: Write the failing test**

`src/components/block-editor/blocks/toggle.spec.tsx`:
```tsx
import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";
import { ToggleStory } from "@/stories/block-editor/blocks-2.stories";

describe("toggle block", () => {
  it("renders the summary and its inner prose", async () => {
    const screen = render(<ToggleStory />);
    await expect.element(screen.getByText("More details")).toBeInTheDocument();
    const toggle = screen.container.querySelector('[data-block="toggle"]') as HTMLElement;
    expect(toggle).not.toBeNull();
    await expect.element(screen.getByText("Hidden body")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Create the story**

`src/stories/block-editor/blocks-2.stories.tsx`:
```tsx
import { BlockEditor } from "@/components/block-editor/block-editor";
import { toggleBlock } from "@/components/block-editor/blocks/toggle";
import { ThemeProvider } from "@/components/admin";

export default { title: "Block Editor/Blocks 2" };

export const ToggleStory = () => (
  <ThemeProvider>
    <BlockEditor
      editable={false}
      blocks={[toggleBlock]}
      value={{
        type: "doc",
        content: [
          {
            type: "toggle",
            attrs: { summary: "More details", open: true },
            content: [{ type: "paragraph", content: [{ type: "text", text: "Hidden body" }] }],
          },
        ],
      }}
    />
  </ThemeProvider>
);
```

- [ ] **Step 3: Run test to verify it fails**

Run: `pnpm vitest run --browser.headless src/components/block-editor/blocks/toggle.spec.tsx`
Expected: FAIL ("Failed to resolve import .../toggle").

- [ ] **Step 4: Write the implementation**

`src/components/block-editor/blocks/toggle.tsx`:
```tsx
import { z } from "zod";
import { ChevronRight } from "lucide-react";
import { NodeViewContent } from "../extensions/block-node";
import { defineBlock, type BlockRenderProps } from "../define-block";
import { cn } from "@/lib/utils";

const schema = z.object({
  summary: z.string().default("Toggle"),
  open: z.boolean().default(false),
});
type ToggleAttrs = z.infer<typeof schema>;

function ToggleRender({ attrs, updateAttrs, mode }: BlockRenderProps<ToggleAttrs>) {
  const expanded = mode === "edit" ? true : attrs.open;
  return (
    <div className="rounded-md border p-2">
      <button
        type="button"
        className="flex w-full items-center gap-1 text-left text-sm font-medium"
        onClick={() => mode === "read" && updateAttrs?.({ open: !attrs.open })}
        aria-expanded={expanded}
      >
        <ChevronRight
          className={cn("size-4 transition-transform", expanded && "rotate-90")}
        />
        {attrs.summary}
      </button>
      {/* The content hole must always be in the DOM so ProseMirror can manage it;
          hide it visually when collapsed in read mode. */}
      <NodeViewContent className={cn("mt-2 pl-5", !expanded && "hidden")} />
    </div>
  );
}

export const toggleBlock = defineBlock<ToggleAttrs>({
  name: "toggle",
  label: "Toggle",
  group: "content",
  icon: ChevronRight,
  keywords: ["collapse", "accordion", "details", "disclosure"],
  description: "Collapsible section",
  schema,
  content: "block+",
  config: "auto",
  render: ToggleRender,
});
```

- [ ] **Step 5: Register in `defaultBlocks`**

Modify `src/components/block-editor/blocks/index.ts`:
```ts
import type { BlockDefinition } from "../define-block";
import { calloutBlock } from "./callout";
import { toggleBlock } from "./toggle";

/** Batteries-included content blocks (no ra-core data dependency). */
export const defaultBlocks: BlockDefinition[] = [calloutBlock, toggleBlock];

export { calloutBlock, toggleBlock };
```

- [ ] **Step 6: Run test to verify it passes**

Run: `pnpm vitest run --browser.headless src/components/block-editor/blocks/toggle.spec.tsx`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/components/block-editor/blocks/toggle.tsx src/components/block-editor/blocks/toggle.spec.tsx src/components/block-editor/blocks/index.ts src/stories/block-editor/blocks-2.stories.tsx
git commit -m "feat(block-editor): toggle content block"
```

---

## Task 2: `image` block (base64/URL + width)

**Files:**
- Create: `src/components/block-editor/blocks/image.tsx`
- Create: `src/components/block-editor/blocks/image.spec.tsx`
- Modify: `src/components/block-editor/blocks/index.ts`
- Modify: `src/stories/block-editor/blocks-2.stories.tsx`

- [ ] **Step 1: Write the failing test**

`src/components/block-editor/blocks/image.spec.tsx`:
```tsx
import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";
import { ImageStory, ImageEmptyStory } from "@/stories/block-editor/blocks-2.stories";

describe("image block", () => {
  it("renders an img with the src and alt at the configured width", async () => {
    const screen = render(<ImageStory />);
    const img = screen.container.querySelector('[data-block="image"] img') as HTMLImageElement;
    expect(img).not.toBeNull();
    expect(img.getAttribute("alt")).toBe("A red dot");
    expect(img.style.width).toBe("50%");
  });

  it("shows an empty state when no src is set", async () => {
    const screen = render(<ImageEmptyStory />);
    await expect
      .element(screen.container.querySelector('[data-block="image"]') as HTMLElement)
      .toHaveTextContent(/add an image/i);
  });
});
```

- [ ] **Step 2: Add stories**

Append to `src/stories/block-editor/blocks-2.stories.tsx`:
```tsx
import { imageBlock } from "@/components/block-editor/blocks/image";

// 1x1 red PNG data URI
const RED_DOT =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

export const ImageStory = () => (
  <ThemeProvider>
    <BlockEditor
      editable={false}
      blocks={[imageBlock]}
      value={{
        type: "doc",
        content: [{ type: "image", attrs: { src: RED_DOT, alt: "A red dot", widthPct: 50 } }],
      }}
    />
  </ThemeProvider>
);

export const ImageEmptyStory = () => (
  <ThemeProvider>
    <BlockEditor
      editable={false}
      blocks={[imageBlock]}
      value={{ type: "doc", content: [{ type: "image", attrs: { src: "", alt: "", widthPct: 100 } }] }}
    />
  </ThemeProvider>
);
```

- [ ] **Step 3: Run test to verify it fails**

Run: `pnpm vitest run --browser.headless src/components/block-editor/blocks/image.spec.tsx`
Expected: FAIL ("Failed to resolve import .../image").

- [ ] **Step 4: Write the implementation**

`src/components/block-editor/blocks/image.tsx`:
```tsx
import { z } from "zod";
import { Image as ImageIcon } from "lucide-react";
import { defineBlock, type BlockRenderProps, type BlockConfigProps } from "../define-block";
import { BlockEmpty } from "./block-states";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";

const schema = z.object({
  src: z.string().default(""),
  alt: z.string().default(""),
  widthPct: z.number().min(10).max(100).default(100),
});
type ImageAttrs = z.infer<typeof schema>;

function ImageRender({ attrs }: BlockRenderProps<ImageAttrs>) {
  if (!attrs.src) return <BlockEmpty label="Add an image (configure to upload or paste a URL)" />;
  return (
    <div className="flex justify-center">
      <img
        src={attrs.src}
        alt={attrs.alt}
        style={{ width: `${attrs.widthPct}%` }}
        className="h-auto rounded-md"
      />
    </div>
  );
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function ImageConfig({ attrs, onChange }: BlockConfigProps<ImageAttrs>) {
  return (
    <div className="flex w-56 flex-col gap-3 p-1">
      <div className="flex flex-col gap-1">
        <Label className="text-xs">Upload</Label>
        <Input
          type="file"
          accept="image/*"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (file) onChange({ src: await readFileAsDataUrl(file) });
          }}
        />
      </div>
      <div className="flex flex-col gap-1">
        <Label className="text-xs">Image URL</Label>
        <Input
          value={attrs.src.startsWith("data:") ? "" : attrs.src}
          placeholder="https://…"
          onChange={(e) => onChange({ src: e.target.value })}
        />
      </div>
      <div className="flex flex-col gap-1">
        <Label className="text-xs">Alt text</Label>
        <Input value={attrs.alt} onChange={(e) => onChange({ alt: e.target.value })} />
      </div>
      <div className="flex flex-col gap-1">
        <Label className="text-xs">Width: {attrs.widthPct}%</Label>
        <Slider
          min={10}
          max={100}
          step={5}
          value={[attrs.widthPct]}
          onValueChange={([v]) => onChange({ widthPct: v })}
        />
      </div>
    </div>
  );
}

export const imageBlock = defineBlock<ImageAttrs>({
  name: "image",
  label: "Image",
  group: "media",
  icon: ImageIcon,
  keywords: ["picture", "photo", "img"],
  description: "An image (upload or URL)",
  schema,
  config: ImageConfig,
  render: ImageRender,
});
```

- [ ] **Step 5: Register in `defaultBlocks`**

Modify `src/components/block-editor/blocks/index.ts` — add `imageBlock`:
```ts
import { imageBlock } from "./image";
// defaultBlocks = [calloutBlock, toggleBlock, imageBlock];  (+ export imageBlock)
```
(Full file is rewritten again in Task 3 to add `embed`; here just append `imageBlock` to the array and the re-export.)

- [ ] **Step 6: Run test to verify it passes**

Run: `pnpm vitest run --browser.headless src/components/block-editor/blocks/image.spec.tsx`
Expected: PASS (2 tests).

- [ ] **Step 7: Commit**

```bash
git add src/components/block-editor/blocks/image.tsx src/components/block-editor/blocks/image.spec.tsx src/components/block-editor/blocks/index.ts src/stories/block-editor/blocks-2.stories.tsx
git commit -m "feat(block-editor): image block (upload/url + width)"
```

---

## Task 3: `embed` block (allowlisted video — SECURITY)

**Security contract:** Never inject user-provided HTML or use a user URL directly as an iframe `src`. Parse the URL, extract a strictly-validated video id for an allowlisted provider (YouTube, Vimeo), and construct a known-safe embed `src`. Anything else renders a safe placeholder, not an iframe.

**Files:**
- Create: `src/components/block-editor/blocks/embed.tsx`
- Create: `src/components/block-editor/blocks/embed.spec.tsx`
- Modify: `src/components/block-editor/blocks/index.ts`
- Modify: `src/stories/block-editor/blocks-2.stories.tsx`

- [ ] **Step 1: Write the failing test**

`src/components/block-editor/blocks/embed.spec.tsx`:
```tsx
import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";
import { toEmbedSrc } from "@/components/block-editor/blocks/embed";
import { EmbedStory, EmbedUnsupportedStory } from "@/stories/block-editor/blocks-2.stories";

describe("toEmbedSrc (allowlist parser)", () => {
  it("maps YouTube watch + short URLs to the nocookie embed URL", () => {
    expect(toEmbedSrc("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toBe(
      "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ",
    );
    expect(toEmbedSrc("https://youtu.be/dQw4w9WgXcQ")).toBe(
      "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ",
    );
  });
  it("maps Vimeo to the player URL", () => {
    expect(toEmbedSrc("https://vimeo.com/123456789")).toBe(
      "https://player.vimeo.com/video/123456789",
    );
  });
  it("rejects non-allowlisted / injection-y URLs", () => {
    expect(toEmbedSrc("javascript:alert(1)")).toBeNull();
    expect(toEmbedSrc("https://evil.com/embed/x")).toBeNull();
    expect(toEmbedSrc("https://www.youtube.com/watch?v=../../x")).toBeNull();
  });
});

describe("embed block", () => {
  it("renders an iframe with the safe constructed src for YouTube", async () => {
    const screen = render(<EmbedStory />);
    const iframe = screen.container.querySelector('[data-block="embed"] iframe') as HTMLIFrameElement;
    expect(iframe).not.toBeNull();
    expect(iframe.getAttribute("src")).toBe("https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ");
  });
  it("renders a placeholder (no iframe) for unsupported URLs", async () => {
    const screen = render(<EmbedUnsupportedStory />);
    expect(screen.container.querySelector('[data-block="embed"] iframe')).toBeNull();
    await expect
      .element(screen.container.querySelector('[data-block="embed"]') as HTMLElement)
      .toHaveTextContent(/youtube or vimeo/i);
  });
});
```

- [ ] **Step 2: Add stories**

Append to `src/stories/block-editor/blocks-2.stories.tsx`:
```tsx
import { embedBlock } from "@/components/block-editor/blocks/embed";

export const EmbedStory = () => (
  <ThemeProvider>
    <BlockEditor
      editable={false}
      blocks={[embedBlock]}
      value={{
        type: "doc",
        content: [{ type: "embed", attrs: { url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" } }],
      }}
    />
  </ThemeProvider>
);

export const EmbedUnsupportedStory = () => (
  <ThemeProvider>
    <BlockEditor
      editable={false}
      blocks={[embedBlock]}
      value={{ type: "doc", content: [{ type: "embed", attrs: { url: "https://evil.com/x" } }] }}
    />
  </ThemeProvider>
);
```

- [ ] **Step 3: Run test to verify it fails**

Run: `pnpm vitest run --browser.headless src/components/block-editor/blocks/embed.spec.tsx`
Expected: FAIL ("Failed to resolve import .../embed").

- [ ] **Step 4: Write the implementation**

`src/components/block-editor/blocks/embed.tsx`:
```tsx
import { z } from "zod";
import { Video } from "lucide-react";
import { defineBlock, type BlockRenderProps } from "../define-block";
import { BlockEmpty } from "./block-states";

const schema = z.object({ url: z.string().default("") });
type EmbedAttrs = z.infer<typeof schema>;

const YT_ID = /^[\w-]{11}$/;
const VIMEO_ID = /^\d+$/;

/**
 * Map a user URL to a known-safe provider embed src, or null if not allowlisted.
 * Never returns a URL derived from raw user input — only constructed from a
 * strictly-validated video id, so the result can be trusted as an iframe src.
 */
export function toEmbedSrc(url: string): string | null {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }
  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return null;
  const host = parsed.hostname.replace(/^www\./, "");

  if (host === "youtube.com" || host === "m.youtube.com") {
    const id = parsed.searchParams.get("v") ?? "";
    return YT_ID.test(id) ? `https://www.youtube-nocookie.com/embed/${id}` : null;
  }
  if (host === "youtu.be") {
    const id = parsed.pathname.slice(1);
    return YT_ID.test(id) ? `https://www.youtube-nocookie.com/embed/${id}` : null;
  }
  if (host === "vimeo.com") {
    const id = parsed.pathname.split("/").filter(Boolean)[0] ?? "";
    return VIMEO_ID.test(id) ? `https://player.vimeo.com/video/${id}` : null;
  }
  return null;
}

function EmbedRender({ attrs }: BlockRenderProps<EmbedAttrs>) {
  if (!attrs.url) return <BlockEmpty label="Paste a YouTube or Vimeo URL (configure)" />;
  const src = toEmbedSrc(attrs.url);
  if (!src) {
    return <BlockEmpty label="Unsupported embed — only YouTube or Vimeo URLs are allowed" />;
  }
  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-md">
      <iframe
        src={src}
        title="Embedded video"
        className="absolute inset-0 h-full w-full"
        sandbox="allow-scripts allow-same-origin allow-presentation"
        referrerPolicy="strict-origin-when-cross-origin"
        allow="encrypted-media; picture-in-picture; fullscreen"
        allowFullScreen
      />
    </div>
  );
}

export const embedBlock = defineBlock<EmbedAttrs>({
  name: "embed",
  label: "Embed",
  group: "media",
  icon: Video,
  keywords: ["video", "youtube", "vimeo", "iframe"],
  description: "Embed a YouTube or Vimeo video",
  schema,
  config: "auto", // single `url` string → text input
  render: EmbedRender,
});
```

- [ ] **Step 5: Finalize `defaultBlocks`**

Rewrite `src/components/block-editor/blocks/index.ts`:
```ts
import type { BlockDefinition } from "../define-block";
import { calloutBlock } from "./callout";
import { toggleBlock } from "./toggle";
import { imageBlock } from "./image";
import { embedBlock } from "./embed";

/** Batteries-included content/media blocks (no ra-core data dependency). */
export const defaultBlocks: BlockDefinition[] = [
  calloutBlock,
  toggleBlock,
  imageBlock,
  embedBlock,
];

export { calloutBlock, toggleBlock, imageBlock, embedBlock };
```

- [ ] **Step 6: Run test to verify it passes**

Run: `pnpm vitest run --browser.headless src/components/block-editor/blocks/embed.spec.tsx`
Expected: PASS (5 tests).

- [ ] **Step 7: Commit**

```bash
git add src/components/block-editor/blocks/embed.tsx src/components/block-editor/blocks/embed.spec.tsx src/components/block-editor/blocks/index.ts src/stories/block-editor/blocks-2.stories.tsx
git commit -m "feat(block-editor): embed block (allowlisted YouTube/Vimeo, no raw HTML)"
```

---

## Task 4: `record-list` data block

**Files:**
- Create: `src/components/block-editor/blocks/record-list.tsx`
- Create: `src/components/block-editor/blocks/record-list.spec.tsx`
- Create: `src/stories/block-editor/data-blocks.stories.tsx`

> **Verify the `useGetList` signature** against `node_modules/ra-core` before implementing: expected `useGetList(resource, { pagination, sort, filter }, options)` returning `{ data, total, isPending, error }`. The `enabled` option lives in the 3rd arg (react-query options), same as `useGetOne`. Adjust if the installed version differs.

- [ ] **Step 1: Write the failing test**

`src/components/block-editor/blocks/record-list.spec.tsx`:
```tsx
import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";
import { RecordListResolved, RecordListEmpty } from "@/stories/block-editor/data-blocks.stories";

const block = (c: HTMLElement) => c.querySelector('[data-block="recordList"]') as HTMLElement;

describe("record-list block", () => {
  it("renders rows for the resolved records", async () => {
    const screen = render(<RecordListResolved />);
    await expect.element(block(screen.container)).toHaveTextContent("Widget");
    await expect.element(block(screen.container)).toHaveTextContent("Gadget");
  });
  it("shows the empty state when no resource is configured", async () => {
    const screen = render(<RecordListEmpty />);
    await expect.element(block(screen.container)).toHaveTextContent(/pick a resource/i);
  });
});
```

- [ ] **Step 2: Add the data-blocks story file**

`src/stories/block-editor/data-blocks.stories.tsx`:
```tsx
import {
  CoreAdminContext,
  RecordContextProvider,
  TestMemoryRouter,
  memoryStore,
} from "ra-core";
import { QueryClient } from "@tanstack/react-query";
import polyglotI18nProvider from "ra-i18n-polyglot";
import englishMessages from "ra-language-english";
import fakeRestProvider from "ra-data-fakerest";
import { ThemeProvider } from "@/components/admin";
import { BlockEditor } from "@/components/block-editor/block-editor";
import { recordListBlock } from "@/components/block-editor/blocks/record-list";
import { chartBlock } from "@/components/block-editor/blocks/chart";

export default { title: "Block Editor/Data Blocks" };

const i18nProvider = polyglotI18nProvider(() => englishMessages);
const data = {
  products: [
    { id: 1, name: "Widget", category: "tools", price: 10 },
    { id: 2, name: "Gadget", category: "tools", price: 20 },
    { id: 3, name: "Doohickey", category: "toys", price: 5 },
  ],
};
const dataProvider = fakeRestProvider(data, false);
// Disable react-query retries so error states surface immediately in tests.
const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

function Frame({ doc }: { doc: unknown }) {
  return (
    <ThemeProvider>
      <TestMemoryRouter>
        <CoreAdminContext
          dataProvider={dataProvider}
          i18nProvider={i18nProvider}
          queryClient={queryClient}
          store={memoryStore()}
        >
          <RecordContextProvider value={{ id: 99 }}>
            <BlockEditor editable={false} blocks={[recordListBlock, chartBlock]} value={doc as never} />
          </RecordContextProvider>
        </CoreAdminContext>
      </TestMemoryRouter>
    </ThemeProvider>
  );
}

export const RecordListResolved = () => (
  <Frame
    doc={{
      type: "doc",
      content: [
        { type: "recordList", attrs: { resource: "products", perPage: 5, fields: ["name", "price"] } },
      ],
    }}
  />
);
export const RecordListEmpty = () => (
  <Frame doc={{ type: "doc", content: [{ type: "recordList", attrs: { resource: "", perPage: 5 } }] }} />
);

export const ChartResolved = () => (
  <Frame
    doc={{
      type: "doc",
      content: [
        {
          type: "chart",
          attrs: { resource: "products", type: "bar", category: "category", value: "price", aggregate: "sum", perPage: 100 },
        },
      ],
    }}
  />
);
export const ChartEmpty = () => (
  <Frame doc={{ type: "doc", content: [{ type: "chart", attrs: { resource: "", type: "bar", category: "", value: "", aggregate: "count", perPage: 100 } }] }} />
);
```

- [ ] **Step 3: Run test to verify it fails**

Run: `pnpm vitest run --browser.headless src/components/block-editor/blocks/record-list.spec.tsx`
Expected: FAIL ("Failed to resolve import .../record-list" or .../chart).

- [ ] **Step 4: Write the implementation**

`src/components/block-editor/blocks/record-list.tsx`:
```tsx
import { z } from "zod";
import { List as ListIcon } from "lucide-react";
import { useGetList } from "ra-core";
import { defineBlock, type BlockRenderProps, type BlockConfigProps } from "../define-block";
import { BlockEmpty, BlockSkeleton, BlockError } from "./block-states";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const schema = z.object({
  resource: z.string().default(""),
  perPage: z.number().default(5),
  fields: z.array(z.string()).optional(),
});
type ListAttrs = z.infer<typeof schema>;

function RecordListRender({ attrs }: BlockRenderProps<ListAttrs>) {
  const enabled = Boolean(attrs.resource);
  const { data, isPending, error } = useGetList(
    attrs.resource,
    { pagination: { page: 1, perPage: attrs.perPage ?? 5 } },
    { enabled },
  );

  if (!enabled) return <BlockEmpty label="Pick a resource to list" />;
  if (isPending) return <BlockSkeleton />;
  if (error) return <BlockError label="List unavailable" />;

  const records = data ?? [];
  if (records.length === 0) return <BlockEmpty label="No records" />;

  const fields =
    attrs.fields?.length
      ? attrs.fields
      : Object.keys(records[0]).filter((k) => k !== "id").slice(0, 3);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          {fields.map((f) => (
            <TableHead key={f} className="capitalize">{f}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {records.map((r) => (
          <TableRow key={String(r.id)}>
            {fields.map((f) => (
              <TableCell key={f}>{String(r[f] ?? "—")}</TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function RecordListConfig({ attrs, onChange }: BlockConfigProps<ListAttrs>) {
  return (
    <div className="flex w-56 flex-col gap-2 p-1">
      <Label className="text-xs">Resource</Label>
      <Input value={attrs.resource} onChange={(e) => onChange({ resource: e.target.value })} />
      <Label className="text-xs">Rows</Label>
      <Input
        type="number"
        value={attrs.perPage}
        onChange={(e) => onChange({ perPage: Number(e.target.value) || 5 })}
      />
    </div>
  );
}

export const recordListBlock = defineBlock<ListAttrs>({
  name: "recordList",
  label: "Record list",
  group: "data",
  icon: ListIcon,
  keywords: ["list", "table", "records", "collection"],
  description: "Embed a live list from a resource",
  schema,
  config: RecordListConfig,
  render: RecordListRender,
});
```

- [ ] **Step 5: Run test to verify it passes**

Run: `pnpm vitest run --browser.headless src/components/block-editor/blocks/record-list.spec.tsx`
Expected: PASS (2 tests). (The chart import in the story resolves in Task 5; if running this task before Task 5, temporarily stub the chart import — but implement Task 5 next so the shared story file resolves.)

- [ ] **Step 6: Commit**

```bash
git add src/components/block-editor/blocks/record-list.tsx src/components/block-editor/blocks/record-list.spec.tsx src/stories/block-editor/data-blocks.stories.tsx
git commit -m "feat(block-editor): record-list data block (live useGetList)"
```

---

## Task 5: `chart` data block

**Files:**
- Create: `src/components/block-editor/blocks/chart.tsx`
- Create: `src/components/block-editor/blocks/chart.spec.tsx`

- [ ] **Step 1: Write the failing test**

`src/components/block-editor/blocks/chart.spec.tsx`:
```tsx
import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";
import { aggregate } from "@/components/block-editor/blocks/chart";
import { ChartResolved, ChartEmpty } from "@/stories/block-editor/data-blocks.stories";

describe("aggregate (client-side group-by)", () => {
  const rows = [
    { id: 1, category: "tools", price: 10 },
    { id: 2, category: "tools", price: 20 },
    { id: 3, category: "toys", price: 5 },
  ];
  it("sums values per category", () => {
    expect(aggregate(rows, "category", "price", "sum")).toEqual([
      { name: "tools", value: 30 },
      { name: "toys", value: 5 },
    ]);
  });
  it("counts rows per category", () => {
    expect(aggregate(rows, "category", "price", "count")).toEqual([
      { name: "tools", value: 2 },
      { name: "toys", value: 1 },
    ]);
  });
  it("averages values per category", () => {
    expect(aggregate(rows, "category", "price", "avg")).toEqual([
      { name: "tools", value: 15 },
      { name: "toys", value: 5 },
    ]);
  });
});

describe("chart block", () => {
  it("renders a chart container for resolved data", async () => {
    const screen = render(<ChartResolved />);
    const block = screen.container.querySelector('[data-block="chart"]') as HTMLElement;
    expect(block).not.toBeNull();
    // recharts renders an SVG (ResponsiveContainer needs a sized parent; the block sets a height).
    await expect
      .poll(() => block.querySelector("svg, .recharts-responsive-container") != null)
      .toBe(true);
  });
  it("shows the empty state when unconfigured", async () => {
    const screen = render(<ChartEmpty />);
    await expect
      .element(screen.container.querySelector('[data-block="chart"]') as HTMLElement)
      .toHaveTextContent(/pick a resource/i);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run --browser.headless src/components/block-editor/blocks/chart.spec.tsx`
Expected: FAIL ("Failed to resolve import .../chart").

- [ ] **Step 3: Write the implementation**

`src/components/block-editor/blocks/chart.tsx`:
```tsx
import { z } from "zod";
import { BarChart3 } from "lucide-react";
import { useGetList } from "ra-core";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { defineBlock, type BlockRenderProps, type BlockConfigProps } from "../define-block";
import { BlockEmpty, BlockSkeleton, BlockError } from "./block-states";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const schema = z.object({
  resource: z.string().default(""),
  type: z.enum(["bar", "line", "pie"]).default("bar"),
  category: z.string().default(""),
  value: z.string().default(""),
  aggregate: z.enum(["count", "sum", "avg"]).default("count"),
  perPage: z.number().default(100),
});
type ChartAttrs = z.infer<typeof schema>;

interface Datum {
  name: string;
  value: number;
}

/** Group rows by `category` and reduce `value` by the aggregate. Stable key order. */
export function aggregate(
  rows: Array<Record<string, unknown>>,
  category: string,
  value: string,
  agg: ChartAttrs["aggregate"],
): Datum[] {
  const order: string[] = [];
  const sums = new Map<string, number>();
  const counts = new Map<string, number>();
  for (const row of rows) {
    const key = String(row[category] ?? "—");
    if (!counts.has(key)) {
      order.push(key);
      counts.set(key, 0);
      sums.set(key, 0);
    }
    counts.set(key, counts.get(key)! + 1);
    sums.set(key, sums.get(key)! + (Number(row[value]) || 0));
  }
  return order.map((name) => {
    const count = counts.get(name)!;
    const sum = sums.get(name)!;
    const v = agg === "count" ? count : agg === "sum" ? sum : count ? sum / count : 0;
    return { name, value: v };
  });
}

function ChartRender({ attrs }: BlockRenderProps<ChartAttrs>) {
  const enabled = Boolean(attrs.resource && attrs.category);
  const { data, isPending, error } = useGetList(
    attrs.resource,
    { pagination: { page: 1, perPage: attrs.perPage ?? 100 } },
    { enabled },
  );

  if (!enabled) return <BlockEmpty label="Pick a resource and category to chart" />;
  if (isPending) return <BlockSkeleton />;
  if (error) return <BlockError label="Chart data unavailable" />;

  const points = aggregate(data ?? [], attrs.category, attrs.value, attrs.aggregate);

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        {attrs.type === "line" ? (
          <LineChart data={points}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="value" stroke="var(--primary)" />
          </LineChart>
        ) : attrs.type === "pie" ? (
          <PieChart>
            <Tooltip />
            <Pie data={points} dataKey="value" nameKey="name" fill="var(--primary)" label />
          </PieChart>
        ) : (
          <BarChart data={points}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="var(--primary)" />
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}

function ChartConfig({ attrs, onChange }: BlockConfigProps<ChartAttrs>) {
  return (
    <div className="flex w-56 flex-col gap-2 p-1">
      <Label className="text-xs">Resource</Label>
      <Input value={attrs.resource} onChange={(e) => onChange({ resource: e.target.value })} />
      <Label className="text-xs">Type</Label>
      <Select value={attrs.type} onValueChange={(v) => onChange({ type: v as ChartAttrs["type"] })}>
        <SelectTrigger><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="bar">Bar</SelectItem>
          <SelectItem value="line">Line</SelectItem>
          <SelectItem value="pie">Pie</SelectItem>
        </SelectContent>
      </Select>
      <Label className="text-xs">Category field (x)</Label>
      <Input value={attrs.category} onChange={(e) => onChange({ category: e.target.value })} />
      <Label className="text-xs">Value field (y)</Label>
      <Input value={attrs.value} onChange={(e) => onChange({ value: e.target.value })} />
      <Label className="text-xs">Aggregate</Label>
      <Select
        value={attrs.aggregate}
        onValueChange={(v) => onChange({ aggregate: v as ChartAttrs["aggregate"] })}
      >
        <SelectTrigger><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="count">Count</SelectItem>
          <SelectItem value="sum">Sum</SelectItem>
          <SelectItem value="avg">Average</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

export const chartBlock = defineBlock<ChartAttrs>({
  name: "chart",
  label: "Chart",
  group: "data",
  icon: BarChart3,
  keywords: ["chart", "graph", "bar", "line", "pie", "analytics"],
  description: "Aggregate a resource into a chart",
  schema,
  config: ChartConfig,
  render: ChartRender,
});
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm vitest run --browser.headless src/components/block-editor/blocks/chart.spec.tsx src/components/block-editor/blocks/record-list.spec.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/block-editor/blocks/chart.tsx src/components/block-editor/blocks/chart.spec.tsx
git commit -m "feat(block-editor): chart data block (useGetList + client aggregate + recharts)"
```

---

## Task 6: `dataBlocks` export, registry, docs, demo

**Files:**
- Create: `src/components/block-editor/blocks/data-blocks.ts`
- Modify: `src/components/block-editor/index.ts`
- Modify: `scripts/registry.config.mjs`
- Modify: `docs/src/content/docs/custom-blocks.md`
- Modify: `src/demo/orders/OrderEdit.tsx` + `src/demo/orders/OrderShow.tsx` (whichever host the editor)
- Create: `src/components/block-editor/blocks/data-blocks.spec.ts`

- [ ] **Step 1: Write the failing test**

`src/components/block-editor/blocks/data-blocks.spec.ts`:
```ts
import { describe, expect, it } from "vitest";
import { dataBlocks } from "./data-blocks";
import { defaultBlocks } from "./index";

describe("dataBlocks", () => {
  it("contains the three data blocks and none overlap defaultBlocks", () => {
    expect(dataBlocks.map((b) => b.name).sort()).toEqual(["chart", "recordList", "referenceRecord"]);
    const defaultNames = new Set(defaultBlocks.map((b) => b.name));
    expect(dataBlocks.some((b) => defaultNames.has(b.name))).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run --browser.headless src/components/block-editor/blocks/data-blocks.spec.ts`
Expected: FAIL ("Failed to resolve import ./data-blocks").

- [ ] **Step 3: Create the data-blocks array**

`src/components/block-editor/blocks/data-blocks.ts`:
```ts
import type { BlockDefinition } from "../define-block";
import { referenceRecordBlock } from "./reference-record";
import { recordListBlock } from "./record-list";
import { chartBlock } from "./chart";

/**
 * ra-core data blocks. Opt in explicitly via the editor's `blocks` prop, e.g.
 * `blocks={[...defaultBlocks, ...dataBlocks]}`.
 */
export const dataBlocks: BlockDefinition[] = [
  referenceRecordBlock,
  recordListBlock,
  chartBlock,
];

export { referenceRecordBlock, recordListBlock, chartBlock };
```

- [ ] **Step 4: Update the public barrel**

Rewrite `src/components/block-editor/index.ts`:
```ts
export * from "./constants";
export * from "./define-block";
export * from "./block-registry";
export * from "./block-editor";
export * from "./block-editor-input";
export * from "./block-doc-field";
export {
  defaultBlocks,
  calloutBlock,
  toggleBlock,
  imageBlock,
  embedBlock,
} from "./blocks";
export {
  dataBlocks,
  referenceRecordBlock,
  recordListBlock,
  chartBlock,
} from "./blocks/data-blocks";
```

- [ ] **Step 5: Run test to verify it passes**

Run: `pnpm vitest run --browser.headless src/components/block-editor/blocks/data-blocks.spec.ts`
Expected: PASS.

- [ ] **Step 6: Update the registry deps + regenerate**

In `scripts/registry.config.mjs`, the `block-editor` entry: add `ra-core` and `recharts` to `dependencies` (chart + data blocks import them directly; they also arrive via the `@shadmin/admin` registryDependency, but listing them is explicit and safe). Keep the array alphabetically sorted to match the file's convention.

Then:
```bash
pnpm registry:generate && pnpm registry:build
```
Expected: regenerates `registry.json`; the new block files are auto-collected by the recursive `block-editor` sourceDir. Grep to confirm: `grep -c '"block-editor' registry.json` (still one block entry). Commit `registry.json` + `registry.config.mjs`.

- [ ] **Step 7: Document the built-in blocks**

In `docs/src/content/docs/custom-blocks.md`, add a "Built-in blocks" section listing: content/media (`callout`, `toggle`, `image`, `embed` — in `defaultBlocks`) and data (`referenceRecord`, `recordList`, `chart` — in `dataBlocks`), with the opt-in usage `blocks={[...defaultBlocks, ...dataBlocks]}` and a one-line note on the embed allowlist + client-side chart/list aggregation. Follow the page's existing prose style.

- [ ] **Step 8: Wire data blocks into the demo**

In the demo order views that host the editor (from Plan 1 — `OrderEdit`/`OrderShow`), pass `blocks={[...defaultBlocks, ...dataBlocks]}` to `<BlockEditorInput>` and `<BlockDocField>` so the demo exercises the full catalog. Import `defaultBlocks`, `dataBlocks` from `@/components/block-editor`.

- [ ] **Step 9: Final gate — full folder suite + lint + typecheck + docs build**

Run:
```bash
pnpm vitest run --browser.headless src/components/block-editor/
pnpm typecheck
pnpm exec eslint src/components/block-editor/ src/demo/orders/
pnpm doc:build
```
Expected: all PASS; block-editor lint 0 errors/0 warnings.

- [ ] **Step 10: Commit**

```bash
git add src/components/block-editor/blocks/data-blocks.ts src/components/block-editor/blocks/data-blocks.spec.ts src/components/block-editor/index.ts scripts/registry.config.mjs registry.json docs/src/content/docs/custom-blocks.md src/demo/orders/
git commit -m "feat(block-editor): dataBlocks export, registry deps, docs + demo wiring"
```

---

## Self-Review (against the spec, Plan 2 scope)

**1. Spec coverage:**

| Spec Plan-2 item | Task |
|---|---|
| `toggle` (content, collapsible) | 1 |
| `image` (media; spec said drag-resize) | 2 (config-width; drag-resize deferred — see Assumptions) |
| `embed` (media, sanitized) | 3 (allowlist-construct, never raw HTML) |
| `record-list` (data, `useGetList`) | 4 |
| `chart` (data, recharts) | 5 |
| `block-editor-data` opt-in item | 6 (realized as `dataBlocks` array, NOT a separate registry item — see Assumptions; rationale: recharts/ra-core already ship via the required `@shadmin/admin` registry dep) |
| Embed sanitization (security) | 3 |
| Docs + demo | 6 |

**2. Placeholder scan:** No TBD/TODO. One explicit "verify `useGetList` signature against node_modules" (Task 4) — a real verification step naming the exact path, not hand-waving.

**3. Type consistency:** Block names used consistently: `toggle`, `image`, `embed`, `recordList`, `chart` (camelCase node names; `[data-block="..."]` selectors match). `aggregate(rows, category, value, agg)` and `toEmbedSrc(url)` signatures match their tests. `defaultBlocks` ends as `[callout, toggle, image, embed]`; `dataBlocks` as `[referenceRecord, recordList, chart]`. `BlockRenderProps`/`BlockConfigProps`/`defineBlock` match the shipped API.

**Known follow-ups (verify during execution):**
- `useGetList` query-options arg shape in ra-core v5 (Task 4/5).
- recharts in the browser test provider: `ResponsiveContainer` needs a sized parent — the block sets `h-64`; the chart test uses `expect.poll` for the SVG. If recharts renders 0-size under headless layout, assert on the aggregated-data path (the pure `aggregate` tests already cover the math) and relax the SVG assertion to "container present."
- `CoreAdminContext` `queryClient` prop (used in the data-blocks story to disable retries) — confirmed available in Plan 1's reference-record story.
