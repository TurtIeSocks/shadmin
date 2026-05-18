"use client";

import { useMemo } from "react";
import { useTranslate } from "ra-core";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

export type PermissionsState = Record<
  string,
  Record<string, Record<string, boolean>>
>;

interface Identified {
  id: string;
  label: string;
}

export interface PermissionMatrixProps {
  roles: Array<string | Identified>;
  resources: Array<string | Identified>;
  actions?: string[];
  value?: PermissionsState;
  onChange: (next: PermissionsState) => void;
  readOnly?: boolean;
}

const DEFAULT_ACTIONS = ["list", "show", "create", "edit", "delete"];
const EMPTY_PERMISSIONS: PermissionsState = {};

const normalize = (item: string | Identified): Identified =>
  typeof item === "string" ? { id: item, label: item } : item;

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export const PermissionMatrix = ({
  roles,
  resources,
  actions = DEFAULT_ACTIONS,
  value = EMPTY_PERMISSIONS,
  onChange,
  readOnly = false,
}: PermissionMatrixProps) => {
  const translate = useTranslate();
  const roleList = useMemo(() => roles.map(normalize), [roles]);
  const resourceList = useMemo(() => resources.map(normalize), [resources]);

  const isChecked = (role: string, resource: string, action: string) =>
    !!value?.[role]?.[resource]?.[action];

  const toggle = (role: string, resource: string, action: string) => {
    if (readOnly) return;
    const next = structuredClone(value ?? {});
    next[role] ??= {};
    next[role][resource] ??= {};
    next[role][resource][action] = !next[role][resource][action];
    onChange(next);
  };

  const toggleAll = (role: string, resource: string, allOn: boolean) => {
    if (readOnly) return;
    const next = structuredClone(value ?? {});
    next[role] ??= {};
    next[role][resource] ??= {};
    for (const a of actions) {
      next[role][resource][a] = !allOn;
    }
    onChange(next);
  };

  if (roleList.length === 0) {
    return (
      <div className="rounded-md border p-4 text-center text-sm text-muted-foreground">
        {translate("ra.permission_matrix.no_roles", { _: "No roles defined" })}
      </div>
    );
  }

  return (
    <Tabs
      defaultValue={roleList[0].id}
      className="w-full"
      data-slot="permission-matrix"
    >
      <TabsList>
        {roleList.map((role) => (
          <TabsTrigger key={role.id} value={role.id} data-role={role.id}>
            {role.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {roleList.map((role) => (
        <TabsContent key={role.id} value={role.id} className="mt-2">
          <div className="overflow-auto rounded-md border">
            <table className="w-full text-sm">
              <thead className="bg-muted/40">
                <tr>
                  <th className="p-2 text-left font-medium">
                    {translate("ra.permission_matrix.resource", {
                      _: "Resource",
                    })}
                  </th>
                  {actions.map((a) => (
                    <th key={a} className="p-2 text-center font-medium">
                      {cap(a)}
                    </th>
                  ))}
                  <th className="p-2 text-center font-medium">
                    {translate("ra.permission_matrix.all", { _: "All" })}
                  </th>
                </tr>
              </thead>
              <tbody>
                {resourceList.map((resource) => {
                  const allOn = actions.every((a) =>
                    isChecked(role.id, resource.id, a),
                  );
                  return (
                    <tr
                      key={resource.id}
                      className="border-t"
                      data-resource={resource.id}
                    >
                      <td className="p-2 font-medium">{resource.label}</td>
                      {actions.map((a) => (
                        <td key={a} className="p-2 text-center">
                          <Checkbox
                            className="rounded-sm"
                            checked={isChecked(role.id, resource.id, a)}
                            disabled={readOnly}
                            onCheckedChange={() =>
                              toggle(role.id, resource.id, a)
                            }
                            aria-label={`${role.id} ${a} ${resource.id}`}
                            data-cell={`${role.id}.${resource.id}.${a}`}
                          />
                        </td>
                      ))}
                      <td className="p-2 text-center">
                        <Checkbox
                          checked={allOn}
                          disabled={readOnly}
                          onCheckedChange={() =>
                            toggleAll(role.id, resource.id, allOn)
                          }
                          aria-label={`${role.id} all ${resource.id}`}
                          className={cn(
                            "rounded-sm",
                            allOn && "border-primary",
                          )}
                          data-all={`${role.id}.${resource.id}`}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </TabsContent>
      ))}
    </Tabs>
  );
};
