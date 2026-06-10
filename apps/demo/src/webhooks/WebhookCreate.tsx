import { Create, SimpleForm } from "shadcn-admin-kit/components/admin";
import { WebhookEndpointInput } from "shadcn-admin-kit/components/extras/webhook-endpoint-input";
import { EVENT_TYPES } from "./event-types";

export const WebhookCreate = () => (
  <Create>
    <SimpleForm>
      <WebhookEndpointInput source="endpoint" eventTypes={EVENT_TYPES} />
    </SimpleForm>
  </Create>
);
