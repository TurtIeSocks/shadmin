import { StoryAdmin } from "@/test/_test-helpers";
import { DurationField } from "@/components/extras";

export default { title: "Data Display/DurationField" };

export const Basic = () => (
  <StoryAdmin record={{ duration: "PT2H30M" }}>
    <DurationField source="duration" />
  </StoryAdmin>
);

export const DaysHours = () => (
  <StoryAdmin record={{ duration: "P1DT4H" }}>
    <DurationField source="duration" />
  </StoryAdmin>
);

export const Relative = () => (
  <StoryAdmin record={{ duration: "PT45M" }}>
    <DurationField source="duration" displayFormat="relative" />
  </StoryAdmin>
);

export const Empty = () => (
  <StoryAdmin record={{ duration: null }}>
    <DurationField source="duration" empty="—" />
  </StoryAdmin>
);

export const Seconds = () => (
  <StoryAdmin record={{ duration: "PT12S" }}>
    <DurationField source="duration" />
  </StoryAdmin>
);
