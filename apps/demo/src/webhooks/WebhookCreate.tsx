import { Create, SimpleForm } from "shadmin/components/admin";
import { WebhookEndpointInput } from "shadmin/components/extras/webhook-endpoint-input";
import { EVENT_TYPES } from "./event-types";

export const WebhookCreate = () => (
  <Create>
    <SimpleForm>
      <WebhookEndpointInput source="endpoint" eventTypes={EVENT_TYPES} />
    </SimpleForm>
  </Create>
);
