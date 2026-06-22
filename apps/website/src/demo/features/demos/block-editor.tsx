import { useWatch } from "react-hook-form";
import { RecordContextProvider, ResourceContextProvider } from "shadmin-core";
import { SimpleForm } from "shadmin/components/admin";
import {
  BlockDocField,
  BlockEditorInput,
} from "shadmin/components/block-editor";

// A sample TipTap "doc" — the shape BlockEditorInput reads/writes. It mixes a
// heading, prose, and two of the batteries-included custom blocks (callout +
// toggle) so the Notion-style editing surface is visible on first paint.
const record = {
  id: 1,
  title: "Launch announcement",
  body: {
    type: "doc",
    content: [
      {
        type: "heading",
        attrs: { level: 2 },
        content: [{ type: "text", text: "Spring release notes" }],
      },
      {
        type: "paragraph",
        content: [
          { type: "text", text: "Drag, type, and use the " },
          { type: "text", marks: [{ type: "bold" }], text: "/ slash menu" },
          {
            type: "text",
            text: " to insert blocks. Everything is stored as TipTap JSON on the record.",
          },
        ],
      },
      {
        type: "callout",
        attrs: { variant: "info" },
        content: [
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "Callouts, toggles, images and embeds ship out of the box.",
              },
            ],
          },
        ],
      },
      {
        type: "toggle",
        attrs: { summary: "What changed under the hood?" },
        content: [
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "The editor re-syncs whenever the form value changes externally.",
              },
            ],
          },
        ],
      },
    ],
  },
};

// Read-only mirror: watches the live form value at `body` and renders it with
// BlockDocField (non-editable BlockEditor) so edits reflect instantly.
function LivePreview() {
  const body = useWatch({ name: "body" }) as
    | Record<string, unknown>
    | undefined;
  return (
    <div className="rounded-lg border bg-muted/30 p-4">
      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Read-only render
      </p>
      <RecordContextProvider value={{ id: 1, body }}>
        <BlockDocField source="body" />
      </RecordContextProvider>
    </div>
  );
}

/**
 * Block Editor feature — a Notion-style WYSIWYG input (BlockEditorInput) inside
 * a SimpleForm, editing a sample block document stored as TipTap JSON. A second
 * pane mirrors the live value through the read-only BlockDocField.
 */
export default function BlockEditorDemo() {
  return (
    <ResourceContextProvider value="products">
      <RecordContextProvider value={record}>
        <SimpleForm toolbar={false}>
          <div className="grid gap-6 lg:grid-cols-2">
            <BlockEditorInput
              source="body"
              label="Content"
              helperText="Press / for the block menu, or just start typing."
            />
            <LivePreview />
          </div>
        </SimpleForm>
      </RecordContextProvider>
    </ResourceContextProvider>
  );
}
