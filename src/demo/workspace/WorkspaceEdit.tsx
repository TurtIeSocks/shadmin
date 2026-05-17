import { useCallback, useMemo } from "react";
import { useInput, useRecordContext, required } from "ra-core";
import {
  Edit,
  PermissionMatrix,
  type PermissionsState,
  SimpleForm,
  TextInput,
} from "@/components/admin";
import { MdxInput } from "@/components/mdx-editor";
import "@mdxeditor/editor/style.css";
import type { DocumentPermission, WorkspaceDocument } from "./documents-seed";

const DOCUMENT_RESOURCE_KEY = "document";
const ACTIONS = ["read", "write", "share"] as const;
type Action = (typeof ACTIONS)[number];

/**
 * Convert the record's flat permission array into the nested shape the
 * PermissionMatrix expects: roles → resources → actions → boolean.
 *
 * We treat each collaborator as a "role" and use a single synthetic
 * resource ("document") so the matrix collapses to one row per user.
 */
const arrayToMatrix = (
  perms: DocumentPermission[] | undefined,
): PermissionsState => {
  const out: PermissionsState = {};
  for (const p of perms ?? []) {
    out[p.userId] = {
      [DOCUMENT_RESOURCE_KEY]: {
        read: !!p.read,
        write: !!p.write,
        share: !!p.share,
      },
    };
  }
  return out;
};

const matrixToArray = (
  matrix: PermissionsState,
  collaboratorIds: string[],
): DocumentPermission[] =>
  collaboratorIds.map((userId) => {
    const cell = matrix[userId]?.[DOCUMENT_RESOURCE_KEY] ?? {};
    return {
      userId,
      read: !!cell.read,
      write: !!cell.write,
      share: !!cell.share,
    };
  });

/**
 * Form-bound wrapper around PermissionMatrix. Binds the `permissions` field
 * via useInput, converting between the record's array shape and the matrix's
 * nested object shape.
 */
const PermissionMatrixInput = ({ source }: { source: string }) => {
  const record = useRecordContext<WorkspaceDocument>();
  const { field } = useInput({ source, defaultValue: [] });

  const collaborators = useMemo(
    () => record?.collaborators ?? [],
    [record?.collaborators],
  );
  const collaboratorIds = useMemo(
    () => collaborators.map((c) => c.id),
    [collaborators],
  );

  const roles = useMemo(
    () => collaborators.map((c) => ({ id: c.id, label: c.name })),
    [collaborators],
  );

  const matrixValue = useMemo<PermissionsState>(
    () => arrayToMatrix(field.value as DocumentPermission[]),
    [field.value],
  );

  const handleChange = useCallback(
    (next: PermissionsState) => {
      field.onChange(matrixToArray(next, collaboratorIds));
    },
    [field, collaboratorIds],
  );

  if (collaborators.length === 0) {
    return (
      <div className="rounded-md border p-4 text-sm text-muted-foreground">
        Add collaborators before assigning permissions.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="text-sm font-medium">Permissions</div>
      <PermissionMatrix
        roles={roles}
        resources={[{ id: DOCUMENT_RESOURCE_KEY, label: "This document" }]}
        actions={[...ACTIONS] as Action[]}
        value={matrixValue}
        onChange={handleChange}
      />
    </div>
  );
};

export const WorkspaceEdit = () => (
  <Edit>
    <SimpleForm>
      <TextInput source="title" validate={required()} />
      <MdxInput source="body" />
      <PermissionMatrixInput source="permissions" />
    </SimpleForm>
  </Edit>
);
