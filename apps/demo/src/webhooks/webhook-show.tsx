import {
  Labeled,
  NumberField,
  Show,
  SimpleShowLayout,
  TextField,
} from "shadmin/components/admin";
import { WebhookEndpointField } from "shadmin/components/extras/webhook-endpoint-field";

export const WebhookShow = () => (
  <Show>
    <SimpleShowLayout>
      <Labeled label="Endpoint">
        <WebhookEndpointField source="endpoint" />
      </Labeled>
      <TextField source="status" />
      <NumberField source="failure_count" />
    </SimpleShowLayout>
  </Show>
);
