import {
  Edit,
  Labeled,
  ReferenceInput,
  SelectInput,
  SimpleForm,
} from "@/components/admin";
import { SubscriptionPlanPicker } from "@/components/extras/subscription-plan-picker";
import { UsageMeterField } from "@/components/extras/usage-meter-field";
import { PLANS } from "./plans";

export const SubscriptionEdit = () => (
  <Edit>
    <SimpleForm>
      <ReferenceInput source="customer_id" reference="customers" />
      <SubscriptionPlanPicker
        source="plan"
        plans={PLANS}
        recommendedPlanId="pro"
      />
      <SelectInput
        source="status"
        choices={[
          { id: "active", name: "Active" },
          { id: "trialing", name: "Trialing" },
          { id: "past_due", name: "Past due" },
          { id: "canceled", name: "Canceled" },
        ]}
      />
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
    </SimpleForm>
  </Edit>
);
