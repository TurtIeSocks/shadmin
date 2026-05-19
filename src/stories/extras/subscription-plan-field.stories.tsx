import { StoryAdmin } from "@/stories/_test-helpers";
import { SubscriptionPlanField } from "@/components/extras";

export default {
  title: "Extras/SubscriptionPlanField",
  parameters: { docs: { codePanel: true } },
};

const PLANS = [
  {
    id: "free",
    name: "Free",
    price: 0,
    currency: "USD",
    interval: "month" as const,
  },
  {
    id: "pro",
    name: "Pro",
    price: 29,
    currency: "USD",
    interval: "month" as const,
  },
  {
    id: "team",
    name: "Team",
    price: 99,
    currency: "USD",
    interval: "month" as const,
  },
];

export const Basic = () => (
  <StoryAdmin record={{ planId: "pro" }}>
    <SubscriptionPlanField source="planId" plans={PLANS} />
  </StoryAdmin>
);

export const Free = () => (
  <StoryAdmin record={{ planId: "free" }}>
    <SubscriptionPlanField source="planId" plans={PLANS} />
  </StoryAdmin>
);

export const Unknown = () => (
  <StoryAdmin record={{ planId: "mystery" }}>
    <SubscriptionPlanField source="planId" plans={PLANS} empty="—" />
  </StoryAdmin>
);
