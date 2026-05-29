import { useState } from "react";
import type { JSONContent } from "@tiptap/react";
import { BlockEditor } from "@/components/block-editor/block-editor";
import { ThemeProvider } from "@/components/admin";

export default { title: "Block Editor/BlockEditor" };

const doc: JSONContent = {
  type: "doc",
  content: [
    { type: "paragraph", content: [{ type: "text", text: "Hello blocks" }] },
  ],
};

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
