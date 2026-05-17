import {
  DateField,
  Labeled,
  ReferenceField,
  Show,
  SimpleShowLayout,
  TextField,
} from "@/components/admin";
import { SubscriptionPlanField } from "@/components/extras/subscription-plan-field";
import { UsageMeterField } from "@/components/extras/usage-meter-field";
import { PLANS } from "./plans";

export const SubscriptionShow = () => (
  <Show>
    <SimpleShowLayout>
      <ReferenceField source="customer_id" reference="customers" />
      <SubscriptionPlanField source="plan" plans={PLANS} />
      <TextField source="status" />
      <DateField source="start_date" />
      <Labeled label="API calls">
        <UsageMeterField
          source="api_calls_used"
          limitSource="api_calls_limit"
        />
      </Labeled>
      <Labeled label="Storage">
        <UsageMeterField
          source="storage_mb_used"
          limitSource="storage_mb_limit"
          unit="MB"
        />
      </Labeled>
    </SimpleShowLayout>
  </Show>
);
