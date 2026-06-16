import { ClockIcon } from "lucide-react";
import type { ResourceProps } from "ra-core";

import { ScheduledJobCreate } from "./scheduled-job-create";
import { ScheduledJobEdit } from "./scheduled-job-edit";
import { ScheduledJobList } from "./scheduled-job-list";
import { ScheduledJobShow } from "./scheduled-job-show";

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
