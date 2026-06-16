import { ResourceProps } from "ra-core";
import { CalendarDays } from "lucide-react";
import { PlanningCreate } from "./planning-create";
import { PlanningEdit } from "./planning-edit";
import { PlanningList } from "./planning-list";
import { PlanningShow } from "./planning-show";

export const planning: ResourceProps = {
  name: "tasks",
  list: PlanningList,
  show: PlanningShow,
  edit: PlanningEdit,
  create: PlanningCreate,
  recordRepresentation: "title",
  icon: CalendarDays,
};

export { tasksSeed } from "./tasks-seed";
