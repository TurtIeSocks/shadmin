import { ResourceProps } from "ra-core";
import { CalendarDays } from "lucide-react";
import { PlanningCreate } from "./PlanningCreate";
import { PlanningEdit } from "./PlanningEdit";
import { PlanningList } from "./PlanningList";
import { PlanningShow } from "./PlanningShow";

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
