import { StoryAdmin } from "@/stories/_test-helpers";
import { UsageMeterField } from "@/components/admin";

export default { title: "Data Display/UsageMeterField" };

export const Basic = () => (
  <StoryAdmin record={{ used: 45, limit: 100 }}>
    <UsageMeterField source="used" limitSource="limit" unit="GB" />
  </StoryAdmin>
);

export const Warning = () => (
  <StoryAdmin record={{ used: 85, limit: 100 }}>
    <UsageMeterField source="used" limitSource="limit" unit="GB" />
  </StoryAdmin>
);

export const Critical = () => (
  <StoryAdmin record={{ used: 110, limit: 100 }}>
    <UsageMeterField source="used" limitSource="limit" unit="GB" />
  </StoryAdmin>
);

export const CustomThresholds = () => (
  <StoryAdmin record={{ used: 60, limit: 100 }}>
    <UsageMeterField
      source="used"
      limitSource="limit"
      unit="GB"
      thresholds={{ warning: 0.5, critical: 0.75 }}
    />
  </StoryAdmin>
);

export const NoLimit = () => (
  <StoryAdmin record={{ used: 45 }}>
    <UsageMeterField source="used" unit="requests" />
  </StoryAdmin>
);
