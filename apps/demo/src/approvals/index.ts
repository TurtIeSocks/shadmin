import { CheckCircleIcon } from "lucide-react";
import type { ResourceProps } from "ra-core";

import { ApprovalQueueList } from "./approval-queue-list";
import { ApprovalShow } from "./approval-show";

export const approvals: ResourceProps = {
  name: "approvals",
  list: ApprovalQueueList,
  show: ApprovalShow,
  icon: CheckCircleIcon,
};

export { approvalsSeed } from "./seed";
export { ApprovalQueueList, ApprovalShow };
