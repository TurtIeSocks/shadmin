import { BlockDocField } from "@/components/block-editor/block-doc-field";
import { StoryAdmin } from "@/stories/_test-helpers";

export default { title: "Block Editor/BlockDocField" };

const record = {
  id: 1,
  body: {
    type: "doc",
    content: [
      { type: "paragraph", content: [{ type: "text", text: "Stored content" }] },
    ],
  },
};

export const Basic = () => (
  <StoryAdmin record={record}>
    <BlockDocField source="body" />
  </StoryAdmin>
);

export const Empty = () => (
  <StoryAdmin record={{ id: 1, body: null }}>
    <BlockDocField source="body" />
  </StoryAdmin>
);
