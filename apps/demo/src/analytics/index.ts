import { ResourceProps } from "ra-core";
import { BarChart3 } from "lucide-react";
import { AnalyticsList } from "./AnalyticsList";
import { AnalyticsShow } from "./AnalyticsShow";
import { AnalyticsEdit } from "./AnalyticsEdit";
import { AnalyticsCreate } from "./AnalyticsCreate";

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
