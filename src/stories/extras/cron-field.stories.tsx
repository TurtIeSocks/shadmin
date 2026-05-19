import { StoryAdmin } from "@/stories/_test-helpers";
import { CronField } from "@/components/extras";

export default { title: "Data Display/CronField" };

export const Basic = () => (
  <StoryAdmin record={{ schedule: "0 9 * * 1-5" }}>
    <CronField source="schedule" />
  </StoryAdmin>
);

export const ExprOnly = () => (
  <StoryAdmin record={{ schedule: "*/15 * * * *" }}>
    <CronField source="schedule" showExpression />
  </StoryAdmin>
);

export const Invalid = () => (
  <StoryAdmin record={{ schedule: "not-a-cron" }}>
    <CronField source="schedule" />
  </StoryAdmin>
);

export const Empty = () => (
  <StoryAdmin record={{ schedule: null }}>
    <CronField source="schedule" empty="No schedule" />
  </StoryAdmin>
);

export const EveryHour = () => (
  <StoryAdmin record={{ schedule: "0 * * * *" }}>
    <CronField source="schedule" />
  </StoryAdmin>
);
