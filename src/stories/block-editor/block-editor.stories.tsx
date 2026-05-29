import { useRef, useState } from "react";
import type { Editor } from "@tiptap/core";
// Import for the `@tiptap/core` Storage augmentation that types
// `editor.storage.slashCommand`.
import "@/components/block-editor/extensions/slash-command";
import type { JSONContent } from "@tiptap/react";
import { z } from "zod";
import { Lightbulb } from "lucide-react";
import { BlockEditor } from "@/components/block-editor/block-editor";
import { defineBlock } from "@/components/block-editor/define-block";
import { NodeViewContent } from "@/components/block-editor/extensions/block-node";
import { ThemeProvider } from "@/components/admin";

export default { title: "Block Editor/BlockEditor" };

const doc: JSONContent = {
  type: "doc",
  content: [
    { type: "paragraph", content: [{ type: "text", text: "Hello blocks" }] },
  ],
};

/**
 * Minimal inline callout block for the insertion story. Stands in for the real
 * `callout` block (Task 14); an atom keeps insertion trivial (default attrs, no
 * inner content). The node-view wrapper renders `data-block="callout"`.
 */
const calloutBlock = defineBlock({
  name: "callout",
  label: "Callout",
  group: "content",
  icon: Lightbulb,
  schema: z.object({ text: z.string().default("Callout") }),
  render: ({ attrs }) => (
    <div className="rounded bg-muted px-2 py-1">{String(attrs.text)}</div>
  ),
});

export const Basic = () => {
  const [value, setValue] = useState<JSONContent>(doc);
  return (
    <ThemeProvider>
      <BlockEditor value={value} blocks={[]} onChange={setValue} />
    </ThemeProvider>
  );
};

export const ReadOnly = () => (
  <ThemeProvider>
    <BlockEditor value={doc} blocks={[]} editable={false} />
  </ThemeProvider>
);

/**
 * Content callout with a `variant` enum + `config:"auto"`, used by the selection
 * toolbar (Task 12) and config-popover (Task 13) stories. Renders inner prose via
 * `<NodeViewContent />` and exposes the variant as `data-variant`.
 */
const configurableCallout = defineBlock({
  name: "callout",
  label: "Callout",
  group: "content",
  icon: Lightbulb,
  schema: z.object({
    variant: z.enum(["info", "warning", "success"]).default("info"),
    dense: z.boolean().default(false),
  }),
  content: "block+",
  config: "auto",
  render: ({ attrs }) => (
    <div
      data-variant={String(attrs.variant)}
      data-dense={attrs.dense ? "" : undefined}
      className="rounded border bg-muted px-2 py-1"
    >
      <NodeViewContent />
    </div>
  ),
});

const calloutDoc: JSONContent = {
  type: "doc",
  content: [
    {
      type: "callout",
      attrs: { variant: "info", dense: false },
      content: [{ type: "paragraph", content: [{ type: "text", text: "Note" }] }],
    },
  ],
};

/**
 * A doc containing a single callout that is programmatically node-selected on
 * create (`setNodeSelection(0)` — the callout is the first top-level node). This
 * deterministically activates the selection toolbar without simulating a click,
 * which is unreliable under the browser provider.
 */
export const SelectedCallout = () => {
  const [value, setValue] = useState<JSONContent>(calloutDoc);
  return (
    <ThemeProvider>
      <BlockEditor
        value={value}
        blocks={[configurableCallout]}
        onChange={setValue}
        onCreate={(editor) => {
          // Defer so the toolbar's selection subscription is mounted first.
          queueMicrotask(() => {
            editor.commands.setNodeSelection(0);
          });
        }}
      />
    </ThemeProvider>
  );
};

/**
 * Editor with the inline callout block + a button that opens the catalog picker
 * via the editor's programmatic `open` channel (the same channel the ⊕ gutter
 * button uses in Task 11). Exercises the picker → insert wiring reliably without
 * simulating a raw "/" keystroke, which is flaky under the browser provider.
 */
export const WithCallout = () => {
  const [value, setValue] = useState<JSONContent>(doc);
  const editorRef = useRef<Editor | null>(null);
  return (
    <ThemeProvider>
      <button
        type="button"
        onClick={() => {
          editorRef.current?.storage.slashCommand.open?.();
        }}
      >
        Open picker
      </button>
      <BlockEditor
        value={value}
        blocks={[calloutBlock]}
        onChange={setValue}
        onCreate={(editor) => {
          editorRef.current = editor;
        }}
      />
    </ThemeProvider>
  );
};
