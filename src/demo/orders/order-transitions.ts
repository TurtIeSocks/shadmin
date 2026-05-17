export const ORDER_TRANSITIONS: Record<string, readonly string[]> = {
  ordered: ["delivered", "cancelled"],
  delivered: ["cancelled"],
  cancelled: [],
};
