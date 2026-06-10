import type { ApiKey } from "../types";

const SCOPES = [
  "read:orders",
  "write:orders",
  "read:customers",
  "write:customers",
  "admin",
];

export const apiKeysSeed: ApiKey[] = Array.from({ length: 12 }, (_, i) => {
  const fullKey = `sk_test_${Math.random().toString(36).slice(2)}${Math.random()
    .toString(36)
    .slice(2)}`;
  return {
    id: i + 1,
    name: `Key #${i + 1}`,
    key: fullKey,
    key_truncated: `${fullKey.slice(0, 10)}...${fullKey.slice(-4)}`,
    scopes: SCOPES.slice(0, (i % 3) + 1),
    created_at: new Date(Date.now() - i * 86400000 * 7).toISOString(),
    last_used:
      i % 4 === 0 ? null : new Date(Date.now() - i * 86400000).toISOString(),
  };
});
