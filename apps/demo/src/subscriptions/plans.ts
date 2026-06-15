import type { SubscriptionPlan } from "shadmin/components/extras/subscription-plan-field";

export const PLANS: readonly SubscriptionPlan[] = [
  {
    id: "free",
    name: "Free",
    price: 0,
    currency: "USD",
    interval: "month",
    features: ["1 user", "100 API calls/month", "100 MB storage"],
  },
  {
    id: "starter",
    name: "Starter",
    price: 29,
    currency: "USD",
    interval: "month",
    features: ["5 users", "10k API calls/month", "10 GB storage"],
  },
  {
    id: "pro",
    name: "Pro",
    price: 99,
    currency: "USD",
    interval: "month",
    features: ["unlimited users", "1M API calls/month", "100 GB storage"],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 999,
    currency: "USD",
    interval: "month",
    features: ["custom"],
  },
];
