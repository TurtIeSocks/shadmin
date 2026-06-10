import {
  Labeled,
  NumberField,
  Show,
  SimpleShowLayout,
  TextField,
} from "shadcn-admin-kit/components/admin";
import { WebhookEndpointField } from "shadcn-admin-kit/components/extras/webhook-endpoint-field";

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
