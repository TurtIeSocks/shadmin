import { StoryAdmin } from "@/stories/_test-helpers";
import { SubscriptionPlanPicker } from "@/components/admin";

export default {
  title: "Extras/SubscriptionPlanPicker",
  parameters: { docs: { codePanel: true } },
};

const PLANS = [
  {
    id: "free",
    name: "Free",
    price: 0,
    currency: "USD",
    interval: "month" as const,
    features: ["1 project", "Community support"],
  },
  {
    id: "pro",
    name: "Pro",
    price: 29,
    currency: "USD",
    interval: "month" as const,
    features: ["Unlimited projects", "Email support", "10 GB storage"],
  },
  {
    id: "team",
    name: "Team",
    price: 99,
    currency: "USD",
    interval: "month" as const,
    features: ["Everything in Pro", "SSO", "Priority support"],
  },
];

export const Basic = () => (
  <StoryAdmin mode="form" record={{ planId: "pro" }}>
    <SubscriptionPlanPicker source="planId" plans={PLANS} />
  </StoryAdmin>
);

export const RecommendedTier = () => (
  <StoryAdmin mode="form" record={{ planId: "free" }}>
    <SubscriptionPlanPicker
      source="planId"
      plans={PLANS}
      recommendedPlanId="pro"
    />
  </StoryAdmin>
);

export const Disabled = () => (
  <StoryAdmin mode="form" record={{ planId: "pro" }}>
    <SubscriptionPlanPicker source="planId" plans={PLANS} disabled />
  </StoryAdmin>
);
