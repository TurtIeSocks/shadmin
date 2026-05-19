import { StoryAdmin } from "@/stories/_test-helpers";
import { ColorInput } from "@/components/extras";

export default { title: "Data Edition/ColorInput" };

export const Basic = () => (
  <StoryAdmin mode="form" record={{ color: "#3b82f6" }}>
    <ColorInput source="color" />
  </StoryAdmin>
);

export const WithSwatches = () => (
  <StoryAdmin mode="form" record={{ color: "#3b82f6" }}>
    <ColorInput
      source="color"
      swatches={[
        "#ef4444",
        "#f97316",
        "#eab308",
        "#10b981",
        "#3b82f6",
        "#8b5cf6",
      ]}
    />
  </StoryAdmin>
);

export const Disabled = () => (
  <StoryAdmin mode="form" record={{ color: "#3b82f6" }}>
    <ColorInput source="color" disabled />
  </StoryAdmin>
);
