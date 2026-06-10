import type { Subscription } from "../types";
import { PLANS } from "./plans";

const PLAN_IDS = PLANS.map((p) => p.id) as Subscription["plan"][];

/**
 * Subscription seed records.
 *
 * NOTE: each record carries both the nested `usage.{api_calls,storage_mb}.{used,limit}`
 * shape (matching the `Subscription` type contract) AND flat
 * `api_calls_used` / `api_calls_limit` / `storage_mb_used` / `storage_mb_limit`
 * fields. The flat fields exist because `UsageMeterField`'s `limitSource` prop
 * looks up the limit via `record[limitSource]` (direct key, not a lodash path),
 * so nested paths like `"usage.api_calls.limit"` don't resolve for the limit
 * argument. Keeping the nested shape preserves the typed contract for any
 * downstream code that reads `subscription.usage.*`.
 */
export const subscriptionsSeed: (Subscription & {
  api_calls_used: number;
  api_calls_limit: number;
  storage_mb_used: number;
  storage_mb_limit: number;
})[] = Array.from({ length: 30 }, (_, i) => {
  const plan = PLAN_IDS[i % PLAN_IDS.length];
  const apiLimit =
    plan === "free"
      ? 100
      : plan === "starter"
        ? 10000
        : plan === "pro"
          ? 1_000_000
          : 10_000_000;
  const storageLimit =
    plan === "free"
      ? 100
      : plan === "starter"
        ? 10240
        : plan === "pro"
          ? 102400
          : 1024000;
  const apiUsed = Math.floor(apiLimit * (0.1 + (i % 9) / 10));
  const storageUsed = Math.floor(storageLimit * (0.05 + (i % 7) / 12));
  return {
    id: i + 1,
    customer_id: (i % 10) + 1,
    plan,
    status:
      i % 7 === 0
        ? ("trialing" as const)
        : i % 13 === 0
          ? ("past_due" as const)
          : ("active" as const),
    start_date: new Date(Date.now() - i * 86400000).toISOString(),
    usage: {
      api_calls: { used: apiUsed, limit: apiLimit },
      storage_mb: { used: storageUsed, limit: storageLimit },
    },
    api_calls_used: apiUsed,
    api_calls_limit: apiLimit,
    storage_mb_used: storageUsed,
    storage_mb_limit: storageLimit,
  };
});
