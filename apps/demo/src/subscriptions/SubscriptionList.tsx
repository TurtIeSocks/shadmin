import { DataTable, List, ReferenceField } from "shadmin/components/admin";
import { SubscriptionPlanField } from "shadmin/components/extras/subscription-plan-field";
import { PLANS } from "./plans";

export const SubscriptionList = () => (
  <List>
    <DataTable>
      <DataTable.Col source="id" label="ID" />
      <DataTable.Col label="Customer" source="customer_id">
        <ReferenceField source="customer_id" reference="customers" />
      </DataTable.Col>
      <DataTable.Col label="Plan" source="plan">
        <SubscriptionPlanField source="plan" plans={PLANS} />
      </DataTable.Col>
      <DataTable.Col source="status" />
      <DataTable.Col source="start_date" label="Started" />
    </DataTable>
  </List>
);
