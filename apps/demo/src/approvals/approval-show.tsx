import {
  DateField,
  NumberField,
  ReferenceField,
  Show,
  SimpleShowLayout,
  TextField,
} from "shadmin/components/admin";
import { DualApprovalButton } from "shadmin/components/extras/dual-approval-button";

// DualApprovalButton expects a single `approvers` array on the record (its
// default `approverSource`). The seed uses two scalar fields (`approved_by_1`,
// `approved_by_2`) for record metadata, so the button starts at 0/2 against an
// empty `approvers` array — clicks build it up via useUpdate.
export const ApprovalShow = () => (
  <Show>
    <SimpleShowLayout>
      <TextField source="resource_type" />
      <NumberField source="record_id" />
      <NumberField source="amount" />
      <TextField source="reason" />
      <ReferenceField source="requested_by" reference="customers" />
      <TextField source="status" />
      <DateField source="created_at" showTime />
      <DualApprovalButton required={2} />
    </SimpleShowLayout>
  </Show>
);
