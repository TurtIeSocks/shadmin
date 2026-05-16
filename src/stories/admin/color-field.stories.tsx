import { StoryAdmin } from "@/stories/_test-helpers";
import { ColorField } from "@/components/admin";

export default { title: "Data Display/ColorField" };

export const Basic = () => (
  <StoryAdmin record={{ color: "#3b82f6" }}>
    <ColorField source="color" />
  </StoryAdmin>
);

export const Oklch = () => (
  <StoryAdmin record={{ color: "oklch(0.7 0.2 250)" }}>
    <ColorField source="color" />
  </StoryAdmin>
);

export const Empty = () => (
  <StoryAdmin record={{ color: null }}>
    <ColorField source="color" empty="No color" />
  </StoryAdmin>
);
