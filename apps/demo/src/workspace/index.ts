import { FileText } from "lucide-react";
import type { ResourceProps } from "ra-core";
import { WorkspaceCreate } from "./WorkspaceCreate";
import { WorkspaceEdit } from "./WorkspaceEdit";
import { WorkspaceList } from "./WorkspaceList";
import { WorkspaceShow } from "./WorkspaceShow";

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
