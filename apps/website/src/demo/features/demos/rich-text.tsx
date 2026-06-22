import { useWatch } from "react-hook-form";
import { RecordContextProvider, ResourceContextProvider } from "shadmin-core";

import { SimpleForm } from "shadmin/components/admin";
import { RichTextInput } from "shadmin/components/rich-text-input";

// A product-ish record with some initial HTML in `body`. RichTextInput reads
// this off the record context and seeds the TipTap editor with it.
const record = {
  id: 1,
  body: [
    "<h2>Aurora Wireless Headphones</h2>",
    "<p>Studio-grade sound with <strong>active noise cancellation</strong> ",
    "and a <em>40-hour</em> battery. Built for the commute and the couch alike.</p>",
    "<ul><li>Bluetooth 5.3 multipoint</li><li>USB-C fast charge</li>",
    "<li>Foldable, travel-ready frame</li></ul>",
    "<p>Try the toolbar above — bold, italics, headings, lists and links all ",
    "round-trip to the stored HTML you see below.</p>",
  ].join(""),
};

/**
 * Live mirror of the raw HTML that RichTextInput persists for `body`.
 * Edit above and watch the stored markup update in real time.
 */
function BodyMirror() {
  const html = (useWatch({ name: "body" }) as string) || "";

  return (
    <div className="mt-6 rounded-lg border border-border bg-muted/40 p-4">
      <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Stored HTML
      </div>
      <pre className="overflow-x-auto whitespace-pre-wrap break-words font-mono text-xs text-muted-foreground">
        {html}
      </pre>
    </div>
  );
}

/**
 * Rich Text Input feature — a TipTap-powered HTML editor wired into a SimpleForm.
 *
 * Inputs need a form + resource + record context, so the editor is wrapped in
 * ResourceContextProvider / RecordContextProvider / SimpleForm. The default
 * toolbar (headings, bold/italic, lists, links, …) ships with the component.
 */
export default function RichTextDemo() {
  return (
    <ResourceContextProvider value="products">
      <RecordContextProvider value={record}>
        <SimpleForm toolbar={false}>
          <RichTextInput
            source="body"
            label="Product description"
            helperText="Formatting is stored as HTML."
          />
          <BodyMirror />
        </SimpleForm>
      </RecordContextProvider>
    </ResourceContextProvider>
  );
}
