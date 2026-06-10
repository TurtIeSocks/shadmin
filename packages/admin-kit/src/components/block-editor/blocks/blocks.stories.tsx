import { BlockEditor } from "@/components/block-editor/block-editor";
import { calloutBlock } from "@/components/block-editor/blocks/callout";
import { ThemeProvider } from "@/components/admin";

export default { title: "Block Editor/Blocks" };

export const CalloutStory = () => (
  <ThemeProvider>
    <BlockEditor
      editable={false}
      blocks={[calloutBlock]}
      value={{
        type: "doc",
        content: [
          {
            type: "callout",
            attrs: { variant: "warning" },
            content: [
              { type: "paragraph", content: [{ type: "text", text: "Note text" }] },
            ],
          },
        ],
      }}
    />
  </ThemeProvider>
);
