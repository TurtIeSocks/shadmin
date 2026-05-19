"use client";

import { type ComponentType, useMemo, useState } from "react";
import { ChevronRightIcon } from "lucide-react";
import {
  type RaRecord,
  useGetRecordRepresentation,
  useListContext,
  useResourceContext,
  useTranslate,
} from "ra-core";
import { useNavigate } from "react-router";
import { cn } from "@/lib/utils";

interface TreeListProps<R extends RaRecord = RaRecord> {
  parentSource: string;
  titleSource?: string;
  iconSource?: string;
  iconMap?: Record<string, ComponentType<{ className?: string }>>;
  defaultExpanded?: boolean;
  onSelect?: (record: R) => void;
  emptyLabel?: string;
}

interface TreeNode<R extends RaRecord> {
  record: R;
  children: TreeNode<R>[];
}

const EMPTY_ICON_MAP: Record<
  string,
  ComponentType<{ className?: string }>
> = {};

const buildTree = <R extends RaRecord>(
  records: R[],
  parentSource: string,
): TreeNode<R>[] => {
  const byId = new Map<string | number, TreeNode<R>>();
  for (const r of records) byId.set(r.id, { record: r, children: [] });
  const roots: TreeNode<R>[] = [];
  for (const r of records) {
    const parent = r[parentSource] as string | number | null | undefined;
    const node = byId.get(r.id);
    if (!node) continue;
    if (parent != null && byId.has(parent)) {
      byId.get(parent)!.children.push(node);
    } else {
      roots.push(node);
    }
  }
  return roots;
};

const TreeRow = <R extends RaRecord>({
  node,
  depth,
  defaultExpanded,
  titleSource,
  iconSource,
  iconMap,
  getRepresentation,
  onSelect,
}: {
  node: TreeNode<R>;
  depth: number;
  defaultExpanded: boolean;
  titleSource?: string;
  iconSource?: string;
  iconMap: Record<string, ComponentType<{ className?: string }>>;
  getRepresentation: (r: R) => string;
  onSelect: (r: R) => void;
}) => {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const hasChildren = node.children.length > 0;
  const label = titleSource
    ? String(node.record[titleSource] ?? "")
    : getRepresentation(node.record);
  const Icon = iconSource
    ? iconMap[String(node.record[iconSource] ?? "")]
    : undefined;
  return (
    <div data-tree-row data-id={node.record.id}>
      <div
        className="flex cursor-pointer items-center gap-1 rounded-sm px-1 py-1 text-sm hover:bg-accent"
        style={{ paddingLeft: `${depth * 1.25 + 0.25}rem` }}
        onClick={() => onSelect(node.record)}
      >
        {hasChildren ? (
          <button
            type="button"
            aria-label={expanded ? "Collapse" : "Expand"}
            onClick={(ev) => {
              ev.stopPropagation();
              setExpanded((v) => !v);
            }}
            className="flex size-5 items-center justify-center rounded hover:bg-muted"
          >
            <ChevronRightIcon
              className={cn(
                "size-3 transition-transform",
                expanded && "rotate-90",
              )}
            />
          </button>
        ) : (
          <span className="inline-block size-5" />
        )}
        {Icon ? <Icon className="size-4 text-muted-foreground" /> : null}
        <span className="truncate">{label}</span>
      </div>
      {expanded && hasChildren ? (
        <div data-tree-children>
          {node.children.map((child) => (
            <TreeRow
              key={String(child.record.id)}
              node={child}
              depth={depth + 1}
              defaultExpanded={defaultExpanded}
              titleSource={titleSource}
              iconSource={iconSource}
              iconMap={iconMap}
              getRepresentation={getRepresentation}
              onSelect={onSelect}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
};

const TreeList = <R extends RaRecord = RaRecord>({
  parentSource,
  titleSource,
  iconSource,
  iconMap = EMPTY_ICON_MAP,
  defaultExpanded = false,
  onSelect,
  emptyLabel,
}: TreeListProps<R>) => {
  const { data = [] } = useListContext<R>();
  const resource = useResourceContext();
  const getRepresentation = useGetRecordRepresentation(resource ?? "");
  const navigate = useNavigate();
  const translate = useTranslate();

  const tree = useMemo(
    () => buildTree(data, parentSource),
    [data, parentSource],
  );

  const handleSelect = (record: R) => {
    if (onSelect) return onSelect(record);
    if (resource) navigate(`/${resource}/${record.id}/show`);
  };

  const empty =
    emptyLabel ?? translate("ra.tree_list.empty", { _: "No items" });

  if (tree.length === 0) {
    return (
      <div
        className="rounded-md border p-4 text-center text-sm text-muted-foreground"
        data-slot="tree-list"
      >
        {empty}
      </div>
    );
  }

  return (
    <div className="rounded-md border p-1" data-slot="tree-list" role="tree">
      {tree.map((root) => (
        <TreeRow
          key={String(root.record.id)}
          node={root}
          depth={0}
          defaultExpanded={defaultExpanded}
          titleSource={titleSource}
          iconSource={iconSource}
          iconMap={iconMap}
          getRepresentation={(r) => String(getRepresentation(r))}
          onSelect={handleSelect}
        />
      ))}
    </div>
  );
};

export { type TreeListProps, TreeList };
