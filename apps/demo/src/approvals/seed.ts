import type { Approval } from "../types";

const REASONS = [
  "Customer requested cancellation",
  "Order amount exceeds auto-approval threshold",
  "Refund for damaged item",
  "Plan upgrade requires admin sign-off",
  "Duplicate transaction needs review",
];

export const approvalsSeed: Approval[] = Array.from({ length: 15 }, (_, i) => ({
  id: i + 1,
  resource_type: (["order", "subscription_upgrade", "refund"] as const)[i % 3],
  record_id: (i % 10) + 1,
  amount: i % 2 === 0 ? 100 + i * 47 : undefined,
  reason: REASONS[i % REASONS.length],
  requested_by: (i % 5) + 1,
  approved_by_1: i % 4 === 0 ? (i % 5) + 1 : null,
  approved_by_2: i % 7 === 0 ? ((i + 1) % 5) + 1 : null,
  status: i % 5 === 0 ? "approved" : i % 8 === 0 ? "rejected" : "pending",
  created_at: new Date(Date.now() - i * 7200000).toISOString(),
}));
