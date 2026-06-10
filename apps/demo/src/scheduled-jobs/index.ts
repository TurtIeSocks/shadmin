import { ClockIcon } from "lucide-react";
import type { ResourceProps } from "ra-core";

import { ScheduledJobCreate } from "./ScheduledJobCreate";
import { ScheduledJobEdit } from "./ScheduledJobEdit";
import { ScheduledJobList } from "./ScheduledJobList";
import { ScheduledJobShow } from "./ScheduledJobShow";

export const scheduledJobs: ResourceProps = {
  name: "scheduled_jobs",
  list: ScheduledJobList,
  create: ScheduledJobCreate,
  edit: ScheduledJobEdit,
  show: ScheduledJobShow,
  icon: ClockIcon,
};

export { scheduledJobsSeed } from "./seed";
export {
  ScheduledJobCreate,
  ScheduledJobEdit,
  ScheduledJobList,
  ScheduledJobShow,
};
