import { useMemo } from "react";
import { useResourceContext, useStore } from "ra-core";
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface LayoutBuilderProps {
  /** All fields available for the resource. */
  availableFields: readonly string[];
  /** Layout mode. Only `list-columns` is implemented in v1. */
  mode?: "list-columns" | "show-layout" | "edit-form";
  /** Override the initial order. */
  defaultOrder?: readonly string[];
  /** Override the auto-derived store key. */
  storeKey?: string;
  /** Override resource. */
  resource?: string;
  className?: string;
}

/**
 * Drag-drop column reorder for a resource's list view. Persists the order
 * to `useStore` under a deterministic key so consumers can read it back into
 * `<DataTable storeKey>`.
 *
 * v1 ships `mode="list-columns"` only.
 *
 * @example
 * <LayoutBuilder
 *   availableFields={["id", "title", "author"]}
 *   mode="list-columns"
 * />
 */
const LayoutBuilder = ({
  availableFields,
  mode = "list-columns",
  defaultOrder,
  storeKey,
  resource: resourceProp,
  className,
}: LayoutBuilderProps) => {
  const resource = useResourceContext({ resource: resourceProp });
  const key = storeKey ?? `layout.${resource ?? "unknown"}.${mode}`;
  const [order, setOrder] = useStore<readonly string[]>(
    key,
    defaultOrder ?? availableFields,
  );
  const items = useMemo(
    () => (order ?? availableFields).slice(),
    [order, availableFields],
  );

  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = items.indexOf(String(active.id));
    const newIndex = items.indexOf(String(over.id));
    if (oldIndex < 0 || newIndex < 0) return;
    setOrder(arrayMove(items, oldIndex, newIndex));
  };

  return (
    <Card
      data-layout-builder
      data-store-key={key}
      className={cn("w-80", className)}
    >
      <CardHeader>
        <CardTitle className="text-sm">Layout — {mode}</CardTitle>
      </CardHeader>
      <CardContent>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={items} strategy={verticalListSortingStrategy}>
            <ul className="flex flex-col gap-1">
              {items.map((field) => (
                <Row key={field} id={field} />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      </CardContent>
    </Card>
  );
};

const Row = ({ id }: { id: string }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  return (
    <li
      ref={setNodeRef}
      style={style}
      data-layout-row
      data-field={id}
      className={cn(
        "flex items-center gap-2 rounded border bg-background p-2 text-sm",
        isDragging && "opacity-50",
      )}
      {...attributes}
      {...listeners}
    >
      <GripVertical className="h-4 w-4 text-muted-foreground" />
      <span className="font-mono">{id}</span>
    </li>
  );
};

export { type LayoutBuilderProps, LayoutBuilder };
