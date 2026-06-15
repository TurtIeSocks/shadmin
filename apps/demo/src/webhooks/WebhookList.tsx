import { DataTable, List } from "shadmin/components/admin";
import { WebhookEndpointField } from "shadmin/components/extras/webhook-endpoint-field";

export const WebhookList = () => (
  <List>
    <DataTable>
      <DataTable.Col label="Endpoint" source="endpoint.url">
        <WebhookEndpointField source="endpoint" />
      </DataTable.Col>
      <DataTable.Col source="status" />
      <DataTable.Col source="failure_count" />
    </DataTable>
  </List>
);
