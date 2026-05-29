import { BlockEditor } from "@/components/block-editor/block-editor";
import { toggleBlock } from "@/components/block-editor/blocks/toggle";
import { imageBlock } from "@/components/block-editor/blocks/image";
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
