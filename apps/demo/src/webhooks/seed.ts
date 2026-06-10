import type { Webhook } from "../types";
import { EVENT_TYPES } from "./event-types";

export const webhooksSeed: Webhook[] = Array.from({ length: 8 }, (_, i) => {
  const status: Webhook["status"] =
    i % 5 === 0 ? "failing" : i % 7 === 0 ? "paused" : "active";
  const lastTriggered =
    i % 3 === 0 ? null : new Date(Date.now() - i * 3600000).toISOString();
  const deliveryStatus: "ok" | "failed" | "pending" =
    status === "failing" ? "failed" : lastTriggered ? "ok" : "pending";
  return {
    id: i + 1,
    endpoint: {
      url: `https://api.example${i + 1}.com/webhooks/inbound`,
      secret: `whsec_${(i + 1).toString().padStart(4, "0")}`,
      eventTypes: EVENT_TYPES.slice(0, (i % 4) + 1),
      lastDelivery: lastTriggered
        ? { status: deliveryStatus, at: lastTriggered }
        : undefined,
    },
    status,
    failure_count: status === "failing" ? 12 : 0,
  };
});
