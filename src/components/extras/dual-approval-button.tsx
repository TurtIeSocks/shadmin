import {
  useGetIdentity,
  useRecordContext,
  useResourceContext,
  useUpdate,
} from "ra-core";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DualApprovalButtonProps {
  /** Total approvers required. Default `2`. */
  required?: number;
  /** Record field with the approver id array. Default `"approvers"`. */
  approverSource?: string;
  /** Record field updated to `"approved"` when threshold reached. Default `"status"`. */
  statusSource?: string;
  /** Override resource. */
  resource?: string;
}

/**
 * Four-eyes / segregation-of-duties approval button. Records each approver's
 * id in the `approverSource` array on the record; once the count reaches
 * `required`, the record's status field flips to `approved`.
 *
 * Blocks self-approval: a user already in the array sees a disabled button.
 *
 * @example
 * <DualApprovalButton required={2} />
 */
function DualApprovalButton(props: DualApprovalButtonProps) {
  const {
    required = 2,
    approverSource = "approvers",
    statusSource = "status",
    resource: resourceProp,
  } = props;
  const record = useRecordContext<{
    id: string | number;
    approvers?: readonly string[];
    [key: string]: unknown;
  }>();
  const resource = useResourceContext({ resource: resourceProp });
  const { identity } = useGetIdentity();
  const [update] = useUpdate();

  if (!record) return null;

  const approvers = (record[approverSource] as string[] | undefined) ?? [];
  const count = approvers.length;
  const currentUserId = identity?.id != null ? String(identity.id) : undefined;
  const alreadyApproved = currentUserId
    ? approvers.includes(currentUserId)
    : false;
  const reached = count >= required;

  const handleApprove = () => {
    if (!currentUserId || alreadyApproved || reached) return;
    const nextApprovers = [...approvers, currentUserId];
    const nextStatus =
      nextApprovers.length >= required ? "approved" : "pending";
    update(resource, {
      id: record.id,
      data: {
        [approverSource]: nextApprovers,
        [statusSource]: nextStatus,
      },
      previousData: record,
    });
  };

  if (reached) {
    return (
      <span className="inline-flex items-center gap-2 text-sm font-medium text-green-700">
        <Check className="h-4 w-4" /> Fully approved ({count} of {required})
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-2">
      <Button
        type="button"
        data-dual-approve
        onClick={handleApprove}
        disabled={alreadyApproved || !currentUserId}
        title={alreadyApproved ? "You already approved" : undefined}
      >
        <Check /> Approve
      </Button>
      <span className="text-sm text-muted-foreground">
        {count} of {required}
      </span>
      {alreadyApproved && (
        <span className="text-xs text-muted-foreground">
          You already approved
        </span>
      )}
    </span>
  );
}

export { DualApprovalButton, type DualApprovalButtonProps };
