import { StoryAdmin } from "@/stories/_test-helpers";
import { DurationInput } from "@/components/admin";

export default { title: "Data Edition/DurationInput" };

export const Basic = () => (
  <StoryAdmin mode="form" record={{ duration: "PT2H30M" }}>
    <DurationInput source="duration" />
  </StoryAdmin>
);

export const HoursMinutesOnly = () => (
  <StoryAdmin mode="form" record={{ duration: "PT45M" }}>
    <DurationInput source="duration" units={["h", "m"]} />
  </StoryAdmin>
);

export const Disabled = () => (
  <StoryAdmin mode="form" record={{ duration: "PT2H30M" }}>
    <DurationInput source="duration" disabled />
  </StoryAdmin>
);
