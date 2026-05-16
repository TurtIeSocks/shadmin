import { StoryAdmin } from "@/stories/_test-helpers";
import { BadgeField } from "@/components/admin";

export default { title: "Data Display/BadgeField" };

const record = {
  id: 1,
  title: "Article",
  status: "published",
  priority: "high",
};

export const Basic = () => (
  <StoryAdmin record={record}>
    <BadgeField source="status" />
  </StoryAdmin>
);

export const Outline = () => (
  <StoryAdmin record={record}>
    <BadgeField source="status" variant="outline" />
  </StoryAdmin>
);

export const Secondary = () => (
  <StoryAdmin record={record}>
    <BadgeField source="priority" variant="secondary" />
  </StoryAdmin>
);

export const Empty = () => (
  <StoryAdmin record={{ id: 1, title: "Article" }}>
    <BadgeField source="status" empty="—" />
  </StoryAdmin>
);
