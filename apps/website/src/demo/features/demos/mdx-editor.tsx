import { RecordContextProvider, ResourceContextProvider } from "shadmin-core";
import { SimpleForm } from "shadmin/components/admin";
import { MdxField, MdxInput } from "shadmin/components/mdx-editor";
import "@mdxeditor/editor/style.css";

// A product description authored in Markdown/MDX. MdxInput stores the field as
// a plain markdown string; MdxField renders that same string read-only.
const record = {
  id: 1,
  description: `# Aurora Wireless Headphones

A pair of **over-ear** headphones tuned for long listening sessions.

## Highlights

- 40-hour battery life
- Active noise cancellation
- Plush memory-foam earcups

> "The best sound I've had at this price." — *Editor's pick*

Pair them with the [charging dock](#) for an all-day setup.
`,
};

/**
 * MDX Editor feature — the WYSIWYG markdown editor (MdxInput) bound to a form
 * field, alongside MdxField rendering the same content read-only.
 *
 * MdxInput needs a form + record + resource context (SimpleForm seeds its
 * defaultValues from the record); MdxField only needs the record to read its
 * source off. Editing the left panel writes markdown into the form state; the
 * right panel shows how that stored markdown renders in a Show view.
 */
export default function MdxEditorDemo() {
  return (
    <ResourceContextProvider value="products">
      <RecordContextProvider value={record}>
        <div className="grid gap-6 p-2 lg:grid-cols-2">
          <section className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">
              Editor (MdxInput)
            </h3>
            <SimpleForm toolbar={false}>
              <MdxInput
                source="description"
                label="Product description"
                helperText="Write in Markdown — formatting, lists, quotes and links are supported."
              />
            </SimpleForm>
          </section>

          <section className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">
              Read-only render (MdxField)
            </h3>
            <div className="rounded-md border bg-card p-2">
              <MdxField source="description" />
            </div>
          </section>
        </div>
      </RecordContextProvider>
    </ResourceContextProvider>
  );
}
