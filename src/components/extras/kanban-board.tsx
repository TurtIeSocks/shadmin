"use client";

import { useCallback, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  DndContext,
  DragOverlay,
  type DragEndEvent,
  useDraggable,
  useDroppable,
} from "@dnd-kit/core";
import { useNavigate } from "react-router";
import type { RaRecord } from "ra-core";
import {
  useGetRecordRepresentation,
  useListContext,
  useResourceContext,
  useUpdate,
} from "ra-core";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export interface KanbanColumnDef {
  /** Unique identifier that matches the value of `groupBy` field in records. */
  id: string;
  /** Human-readable column header. */
  label: string;
  /** Optional extra CSS classes applied to the column container. */
  className?: string;
}

export interface KanbanBoardProps<R extends RaRecord = RaRecord> {
  /**
   * Field name whose value buckets records into columns.
   * e.g. `"status"`, `"stage"`, `"priority"`.
   */
  groupBy: string;
  /**
   * Ordered list of column definitions. Records whose `groupBy` value matches
   * `column.id` appear in that column. Unmatched records are silently ignored.
   */
  columns: KanbanColumnDef[];
  /**
   * Field used as the card title. Falls back to `recordRepresentation` when
   * omitted.
   */
  titleSource?: string;
  /**
   * Optional field rendered as a secondary line on each card.
   */
  descriptionSource?: string;
  /**
   * Fully custom card renderer. Receives the raw record and must return a
   * ReactNode. When provided, `titleSource` and `descriptionSource` are
   * ignored.
   */
  cardRenderer?: (record: R) => ReactNode;
  /**
   * Called when a card is clicked. Defaults to navigating to the record's
   * show page (`/<resource>/<id>/show`).
   */
  onCardClick?: (record: R) => void;
}

// ---------------------------------------------------------------------------
// Internal: default card
// ---------------------------------------------------------------------------

interface DefaultCardProps<R extends RaRecord = RaRecord> {
  record: R;
  titleSource?: string;
  descriptionSource?: string;
  getTitle: (record: R) => string;
}

const DefaultCard = <R extends RaRecord = RaRecord>({
  record,
  titleSource,
  descriptionSource,
  getTitle,
}: DefaultCardProps<R>) => {
  const title = titleSource
    ? String(record[titleSource] ?? "")
    : getTitle(record);
  const description = descriptionSource
    ? String(record[descriptionSource] ?? "")
    : undefined;

  return (
    <div className="flex flex-col gap-1">
      <div className="text-sm font-medium leading-none">{title}</div>
      {description && (
        <div className="text-xs text-muted-foreground truncate">{description}</div>
      )}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Internal: draggable card wrapper
// ---------------------------------------------------------------------------

interface DraggableCardProps<R extends RaRecord = RaRecord> {
  record: R;
  onCardClick?: (record: R) => void;
  children: ReactNode;
}

const DraggableCard = <R extends RaRecord = RaRecord>({
  record,
  onCardClick,
  children,
}: DraggableCardProps<R>) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: String(record.id),
    data: { record },
  });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      role="button"
      tabIndex={0}
      aria-roledescription="draggable"
      data-record-id={record.id}
      onClick={() => onCardClick?.(record)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onCardClick?.(record);
        }
      }}
      className={cn(
        "rounded-md border bg-card p-3 shadow-sm cursor-grab select-none",
        "hover:border-primary/50 transition-colors",
        isDragging && "opacity-50 cursor-grabbing ring-2 ring-primary",
      )}
    >
      {children}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Internal: droppable column
// ---------------------------------------------------------------------------

interface DroppableColumnProps {
  columnId: string;
  label: string;
  count: number;
  className?: string;
  children: ReactNode;
}

const DroppableColumn = ({
  columnId,
  label,
  count,
  className,
  children,
}: DroppableColumnProps) => {
  const { setNodeRef, isOver } = useDroppable({ id: columnId });

  return (
    <div
      className={cn(
        "flex flex-col gap-2 min-w-64 flex-1",
        className,
      )}
      data-kanban-column={columnId}
    >
      {/* Column header */}
      <div className="flex items-center justify-between px-1">
        <span className="text-sm font-semibold">{label}</span>
        <span className="inline-flex items-center justify-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
          {count}
        </span>
      </div>

      {/* Card list */}
      <div
        ref={setNodeRef}
        data-droppable-id={columnId}
        className={cn(
          "flex flex-col gap-2 rounded-md border-2 border-dashed p-2 min-h-32 transition-colors",
          isOver
            ? "border-primary bg-primary/5"
            : "border-transparent bg-muted/30",
        )}
      >
        {children}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Internal: empty column placeholder
// ---------------------------------------------------------------------------

const EmptyColumnPlaceholder = () => (
  <div
    className="flex items-center justify-center py-6 text-xs text-muted-foreground"
    data-kanban-empty
  >
    No items
  </div>
);

// ---------------------------------------------------------------------------
// Public: KanbanBoard
// ---------------------------------------------------------------------------

/**
 * Renders the records from the parent `<List>` as a Kanban board.
 *
 * Records are grouped by the `groupBy` field into columns defined by the
 * `columns` prop. Dragging a card to another column calls `useUpdate` with
 * `mutationMode: "optimistic"` so the UI updates immediately and rolls back
 * on server error.
 *
 * @example
 * ```tsx
 * <List perPage={500}>
 *   <KanbanBoard
 *     groupBy="status"
 *     columns={[
 *       { id: "todo", label: "To do" },
 *       { id: "doing", label: "In progress" },
 *       { id: "done", label: "Done" },
 *     ]}
 *     titleSource="title"
 *     descriptionSource="description"
 *   />
 * </List>
 * ```
 */
export const KanbanBoard = <R extends RaRecord = RaRecord>(
  props: KanbanBoardProps<R>,
) => {
  const {
    groupBy,
    columns,
    titleSource,
    descriptionSource,
    cardRenderer,
    onCardClick,
  } = props;

  const { data = [] } = useListContext<R>();
  const resource = useResourceContext() ?? "";
  const navigate = useNavigate();
  const [update] = useUpdate<R>();
  const getRepresentation = useGetRecordRepresentation(resource);

  const [activeId, setActiveId] = useState<string | null>(null);
  const activeRecord = useMemo(
    () => (activeId ? data.find((r) => String(r.id) === activeId) ?? null : null),
    [activeId, data],
  );

  // Stable title resolver used by DefaultCard
  const getTitle = useCallback(
    (record: R): string => String(getRepresentation(record)),
    [getRepresentation],
  );

  // Default click handler: navigate to show page
  const handleCardClick = useCallback(
    (record: R) => {
      if (onCardClick) {
        onCardClick(record);
        return;
      }
      if (resource) {
        navigate(`/${resource}/${record.id}/show`);
      }
    },
    [onCardClick, navigate, resource],
  );

  // Group records into columns; ignore records with unrecognized groupBy values
  const columnIds = useMemo(
    () => new Set(columns.map((c) => c.id)),
    [columns],
  );

  const buckets = useMemo(() => {
    const map = new Map<string, R[]>(columns.map((c) => [c.id, []]));
    for (const record of data) {
      const key = String(record[groupBy] ?? "");
      if (columnIds.has(key)) {
        map.get(key)!.push(record);
      }
    }
    return map;
  }, [data, groupBy, columns, columnIds]);

  // Drag-end: identify target column and call useUpdate optimistically
  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over) return;

      const targetColumnId = String(over.id);
      if (!columnIds.has(targetColumnId)) return;

      const record = active.data.current?.record as R | undefined;
      if (!record) return;

      const currentColumnId = String(record[groupBy] ?? "");
      if (currentColumnId === targetColumnId) return;

      update(
        resource,
        {
          id: record.id,
          data: { [groupBy]: targetColumnId } as Partial<R>,
          previousData: record,
        },
        { mutationMode: "optimistic" },
      );
    },
    [columnIds, groupBy, resource, update],
  );

  return (
    <DndContext
      onDragStart={(ev) => setActiveId(String(ev.active.id))}
      onDragEnd={(ev) => {
        setActiveId(null);
        handleDragEnd(ev);
      }}
      onDragCancel={() => setActiveId(null)}
    >
      <div
        className="flex gap-4 overflow-x-auto p-4"
        data-slot="kanban-board"
      >
        {columns.map((col) => {
          const records = buckets.get(col.id) ?? [];
          return (
            <DroppableColumn
              key={col.id}
              columnId={col.id}
              label={col.label}
              count={records.length}
              className={col.className}
            >
              {records.length === 0 ? (
                <EmptyColumnPlaceholder />
              ) : (
                records.map((record) => (
                  <DraggableCard
                    key={String(record.id)}
                    record={record}
                    onCardClick={handleCardClick}
                  >
                    {cardRenderer ? (
                      cardRenderer(record)
                    ) : (
                      <DefaultCard
                        record={record}
                        titleSource={titleSource}
                        descriptionSource={descriptionSource}
                        getTitle={getTitle}
                      />
                    )}
                  </DraggableCard>
                ))
              )}
            </DroppableColumn>
          );
        })}
      </div>
      <DragOverlay dropAnimation={null}>
        {activeRecord ? (
          <div className="rounded-md border bg-background p-3 shadow-lg opacity-90 ring-2 ring-primary">
            <div className="text-sm font-medium">
              {titleSource
                ? String(activeRecord[titleSource] ?? "")
                : String(getRepresentation(activeRecord))}
            </div>
            {descriptionSource ? (
              <div className="text-xs text-muted-foreground">
                {String(activeRecord[descriptionSource] ?? "")}
              </div>
            ) : null}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};
