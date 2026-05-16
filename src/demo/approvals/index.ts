import { CheckCircleIcon } from "lucide-react";
import type { ResourceProps } from "ra-core";

import { ApprovalQueueList } from "./ApprovalQueueList";
import { ApprovalShow } from "./ApprovalShow";

export const approvals: ResourceProps = {
  name: "approvals",
  list: ApprovalQueueList,
  show: ApprovalShow,
  icon: CheckCircleIcon,
};

export { approvalsSeed } from "./seed";
export { ApprovalQueueList, ApprovalShow };
