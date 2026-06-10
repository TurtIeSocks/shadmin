import { useRef } from "react";
import type { JSONContent } from "@tiptap/react";
import { ThemeProvider } from "@/components/admin";
import { BlockEditor } from "@/components/block-editor/block-editor";
import { calloutBlock } from "@/components/block-editor/blocks/callout";

export default { title: "Block Editor/Playground" };

/** Doc containing a FOREIGN block type not registered here — must survive a round-trip. */
const docWithForeign: JSONContent = {
  type: "doc",
  content: [
    { type: "paragraph", content: [{ type: "text", text: "keep me" }] },
    {
      type: "futureWidget",
      attrs: { x: 1 },
      content: [{ type: "text", text: "alien" }],
    },
  ],
};

export const ForeignBlockRoundTrip = () => {
  const out = useRef<JSONContent | null>(null);
  return (
    <ThemeProvider>
      <BlockEditor
        blocks={[calloutBlock]}
        value={docWithForeign}
        onChange={(v) => {
          out.current = v;
        }}
      />
    </ThemeProvider>
  );
};
