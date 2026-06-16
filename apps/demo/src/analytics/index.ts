import { ResourceProps } from "ra-core";
import { BarChart3 } from "lucide-react";
import { AnalyticsList } from "./analytics-list";
import { AnalyticsShow } from "./analytics-show";
import { AnalyticsEdit } from "./analytics-edit";
import { AnalyticsCreate } from "./analytics-create";

export { reportsSeed } from "./reports-seed";
export type { Report } from "./reports-seed";

export const reports: ResourceProps = {
  name: "reports",
  list: AnalyticsList,
  show: AnalyticsShow,
  edit: AnalyticsEdit,
  create: AnalyticsCreate,
  recordRepresentation: "name",
  icon: BarChart3,
};
