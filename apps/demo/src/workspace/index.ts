import { FileText } from "lucide-react";
import type { ResourceProps } from "ra-core";
import { WorkspaceCreate } from "./workspace-create";
import { WorkspaceEdit } from "./workspace-edit";
import { WorkspaceList } from "./workspace-list";
import { WorkspaceShow } from "./workspace-show";

export { documentsSeed } from "./documents-seed";
export type {
  DocumentCollaborator,
  DocumentPermission,
  WorkspaceDocument,
} from "./documents-seed";

export const documents: ResourceProps = {
  name: "documents",
  list: WorkspaceList,
  show: WorkspaceShow,
  edit: WorkspaceEdit,
  create: WorkspaceCreate,
  recordRepresentation: "title",
  icon: FileText,
};
