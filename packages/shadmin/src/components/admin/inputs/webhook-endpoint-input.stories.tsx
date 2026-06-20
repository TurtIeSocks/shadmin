import { StoryAdmin } from "@/test/_test-helpers";
import { WebhookEndpointInput } from "@/components/admin";

export default { title: "Extras/WebhookEndpointInput" };

const EVENT_TYPES = [
  "order.created",
  "order.updated",
  "order.cancelled",
  "user.created",
  "user.deleted",
];

const record = {
  endpoint: {
    url: "https://example.com/webhook",
    secret: "whsec_abc123",
    eventTypes: ["order.created"],
  },
};

export const Basic = () => (
  <StoryAdmin mode="form" record={record}>
    <WebhookEndpointInput source="endpoint" eventTypes={EVENT_TYPES} />
  </StoryAdmin>
);

export const WithTestPing = () => (
  <StoryAdmin mode="form" record={record}>
    <WebhookEndpointInput
      source="endpoint"
      eventTypes={EVENT_TYPES}
      onTestPing={async (url: string) => alert(`POST ${url}`)}
    />
  </StoryAdmin>
);

export const Disabled = () => (
  <StoryAdmin mode="form" record={record}>
    <WebhookEndpointInput source="endpoint" eventTypes={EVENT_TYPES} disabled />
  </StoryAdmin>
);
