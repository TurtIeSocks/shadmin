import { StoryAdmin } from "@/stories/_test-helpers";
import { CronInput } from "@/components/admin";

export default { title: "Data Edition/CronInput" };

export const Basic = () => (
  <StoryAdmin mode="form" record={{ schedule: "0 9 * * 1-5" }}>
    <CronInput source="schedule" />
  </StoryAdmin>
);

export const Disabled = () => (
  <StoryAdmin mode="form" record={{ schedule: "0 9 * * 1-5" }}>
    <CronInput source="schedule" disabled />
  </StoryAdmin>
);

export const Empty = () => (
  <StoryAdmin mode="form" record={{ schedule: "" }}>
    <CronInput source="schedule" />
  </StoryAdmin>
);
