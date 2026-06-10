import type { OrderComment } from "../types";

const SAMPLES = [
  "Customer requested faster shipping",
  "Verified payment with finance",
  "Address looks suspicious, double-check",
  "Discount applied per customer service ticket #4421",
  "Backorder for SKU-A12 expected next week",
];

const AUTHORS = [
  { id: "user-1", name: "Ava Martinez" },
  { id: "user-2", name: "Liam Johnson" },
  { id: "user-3", name: "Noah Williams" },
  { id: "user-4", name: "Olivia Brown" },
  { id: "user-5", name: "Emma Davis" },
];

// 30 deterministic comments distributed across the first 15 order ids.
// Field names match the CommentsThread Comment interface (createdAt,
// authorId, authorName, resolvedAt) so sort and "Mark resolved" both work.
export const orderCommentsSeed: OrderComment[] = Array.from(
  { length: 30 },
  (_, i) => {
    const author = AUTHORS[i % AUTHORS.length];
    const resolved = i % 6 === 0;
    return {
      id: i + 1,
      order_id: (i % 15) + 1,
      authorId: author.id,
      authorName: author.name,
      body: SAMPLES[i % SAMPLES.length],
      createdAt: new Date(Date.now() - i * 3600000).toISOString(),
      resolvedAt: resolved
        ? new Date(Date.now() - i * 3600000 + 1800000).toISOString()
        : null,
    };
  },
);
