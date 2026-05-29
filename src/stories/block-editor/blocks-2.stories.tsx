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
