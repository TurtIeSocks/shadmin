import { Create, SimpleForm } from "@/components/admin";
import { WebhookEndpointInput } from "@/components/extras/webhook-endpoint-input";
import { EVENT_TYPES } from "./event-types";

export const WebhookCreate = () => (
  <Create>
    <SimpleForm>
      <WebhookEndpointInput source="endpoint" eventTypes={EVENT_TYPES} />
    </SimpleForm>
  </Create>
);
