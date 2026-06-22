import { StoryAdmin } from "@/test/_test-helpers";
import { WebhookEndpointField } from "@/components/admin";

export default { title: "Extras/WebhookEndpointField" };

const recordOk = {
  endpoint: {
    url: "https://example.com/webhook",
    secret: "whsec_abc",
    eventTypes: ["order.created", "order.updated"],
    lastDelivery: { status: "ok", at: new Date().toISOString() },
  },
};

const recordFailed = {
  endpoint: {
    url: "https://example.com/webhook",
    secret: "whsec_abc",
    eventTypes: ["order.created"],
    lastDelivery: { status: "failed", at: new Date().toISOString() },
  },
};

const recordPending = {
  endpoint: {
    url: "https://example.com/webhook",
    secret: "whsec_abc",
    eventTypes: ["order.created"],
  },
};

export const Basic = () => (
  <StoryAdmin record={recordOk}>
    <WebhookEndpointField source="endpoint" />
  </StoryAdmin>
);

export const Failed = () => (
  <StoryAdmin record={recordFailed}>
    <WebhookEndpointField source="endpoint" />
  </StoryAdmin>
);

export const Pending = () => (
  <StoryAdmin record={recordPending}>
    <WebhookEndpointField source="endpoint" />
  </StoryAdmin>
);
