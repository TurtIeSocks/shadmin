import { useState } from "react";
import type { ReactNode } from "react";
import {
  useGetIdentity,
  useListContext,
  useResourceContext,
  useUpdate,
} from "ra-core";
import type { RaRecord } from "ra-core";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Check, X } from "lucide-react";

/**
 * Pending-approval inbox view. Renders one card per record in the surrounding
 * `<ListContext>` (typically scoped to `status=pending` via `<List filter>`).
 * Each card has approve + reject buttons. When `requireReason` is set or the
 * user clicks reject, a textarea appears for the approver to capture context.
 *
 * On approve/reject, writes `{ [statusSource]: 'approved' | 'rejected',
 * approverId, approverNote, decidedAt }` via `useUpdate`.
 *
 * Must be used inside a `<ListBase>` / `<List>` parent.
 *
 * @example
 * <List resource="expenses" filter={{ status: "pending" }}>
 *   <ApprovalQueue titleSource="title" requireReason />
 * </List>
 */
export const ApprovalQueue = (props: ApprovalQueueProps) => {
  const {
    titleSource = "title",
    subtitleSource,
    statusSource = "status",
    approverSource = "approverId",
    noteSource = "approverNote",
    decidedAtSource = "decidedAt",
    requireReason = false,
    rowExtra,
  } = props;

  const resource = useResourceContext();
  const { data, isLoading } = useListContext<RaRecord>();
  const { identity } = useGetIdentity();
  const [update] = useUpdate();

  if (isLoading) return null;
  if (!data || data.length === 0) {
    return (
      <Card data-approval-empty>
        <CardContent className="p-6 text-center text-sm text-muted-foreground">
          No items waiting for approval.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {data.map((record) => (
        <ApprovalRow
          key={record.id}
          record={record}
          resource={resource}
          titleSource={titleSource}
          subtitleSource={subtitleSource}
          statusSource={statusSource}
          approverSource={approverSource}
          noteSource={noteSource}
          decidedAtSource={decidedAtSource}
          requireReason={requireReason}
          rowExtra={rowExtra}
          approverId={identity?.id}
          onUpdate={update}
        />
      ))}
    </div>
  );
};

interface ApprovalRowInternalProps {
  record: RaRecord;
  resource: string | undefined;
  titleSource: string;
  subtitleSource?: string;
  statusSource: string;
  approverSource: string;
  noteSource: string;
  decidedAtSource: string;
  requireReason: boolean;
  rowExtra?: (record: RaRecord) => ReactNode;
  approverId?: string | number;
  onUpdate: ReturnType<typeof useUpdate>[0];
}

const ApprovalRow = (props: ApprovalRowInternalProps) => {
  const {
    record,
    resource,
    titleSource,
    subtitleSource,
    statusSource,
    approverSource,
    noteSource,
    decidedAtSource,
    requireReason,
    rowExtra,
    approverId,
    onUpdate,
  } = props;
  const [reasonOpen, setReasonOpen] = useState(false);
  const [reason, setReason] = useState("");

  const submit = (decision: "approved" | "rejected") => {
    if (requireReason && !reason.trim()) {
      setReasonOpen(true);
      return;
    }
    onUpdate(resource, {
      id: record.id,
      data: {
        [statusSource]: decision,
        [approverSource]: approverId ?? null,
        [noteSource]: reason || null,
        [decidedAtSource]: new Date().toISOString(),
      },
      previousData: record,
    });
  };

  return (
    <Card>
      <CardContent className="flex flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col">
            <span className="font-medium">
              {String(record[titleSource] ?? "")}
            </span>
            {subtitleSource && (
              <span className="text-sm text-muted-foreground">
                {String(record[subtitleSource] ?? "")}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              data-approve-button
              onClick={() => submit("approved")}
            >
              <Check className="mr-1 h-4 w-4" /> Approve
            </Button>
            <Button
              type="button"
              variant="outline"
              data-reject-button
              onClick={() => {
                setReasonOpen(true);
                if (!requireReason) submit("rejected");
              }}
            >
              <X className="mr-1 h-4 w-4" /> Reject
            </Button>
          </div>
        </div>
        {rowExtra && <div>{rowExtra(record)}</div>}
        {reasonOpen && (
          <div className="flex flex-col gap-2">
            <label
              className="text-sm font-medium"
              htmlFor={`reason-${record.id}`}
            >
              Reason
            </label>
            <Textarea
              id={`reason-${record.id}`}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setReasonOpen(false);
                  setReason("");
                }}
              >
                Cancel
              </Button>
              <Button type="button" onClick={() => submit("rejected")}>
                Confirm reject
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export interface ApprovalQueueProps {
  /** Record field holding the human-readable title. Default `"title"`. */
  titleSource?: string;
  /** Optional subtitle / secondary text field. */
  subtitleSource?: string;
  /** Record field holding the approval status. Default `"status"`. */
  statusSource?: string;
  /** Record field receiving the current user's id on approve/reject. Default `"approverId"`. */
  approverSource?: string;
  /** Record field receiving the optional reason note. Default `"approverNote"`. */
  noteSource?: string;
  /** Record field receiving the decision timestamp. Default `"decidedAt"`. */
  decidedAtSource?: string;
  /** When true, reject (and approve, if you choose) require a reason note. */
  requireReason?: boolean;
  /** Optional custom slot rendered between header and action row. */
  rowExtra?: (record: RaRecord) => ReactNode;
}
