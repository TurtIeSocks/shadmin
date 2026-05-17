import { List } from "@/components/admin";
import { ApprovalQueue } from "@/components/extras/approval-queue";

// ApprovalQueue reads from ListContext and renders one card per record, so we
// scope the surrounding List to pending items only. titleSource="reason" gives
// each card a meaningful header from the seed data.
export const ApprovalQueueList = () => (
  <List filter={{ status: "pending" }}>
    <ApprovalQueue titleSource="reason" requireReason />
  </List>
);
