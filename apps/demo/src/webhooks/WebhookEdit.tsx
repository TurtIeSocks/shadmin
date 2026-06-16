import { Edit, SelectInput, SimpleForm } from "shadmin/components/admin";
import { WebhookEndpointInput } from "shadmin/components/extras/webhook-endpoint-input";
import { EVENT_TYPES } from "./event-types";

export const WebhookEdit = () => (
  <Edit>
    <SimpleForm>
      <WebhookEndpointInput source="endpoint" eventTypes={EVENT_TYPES} />
      <SelectInput
        source="status"
        choices={[
          { id: "active", name: "Active" },
          { id: "paused", name: "Paused" },
          { id: "failing", name: "Failing" },
        ]}
      />
    </SimpleForm>
  </Edit>
);
