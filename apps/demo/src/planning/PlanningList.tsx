import { useState } from "react";
import { RecordContextProvider, type RaRecord } from "ra-core";
import { List } from "shadcn-admin-kit/components/admin";
import { CalendarList, KanbanBoard, type KanbanColumnDef } from "shadcn-admin-kit/components/extras";
import { DurationField } from "shadcn-admin-kit/components/extras/duration-field";
import { Button } from "shadcn-admin-kit/components/ui/button";

const COLUMNS: KanbanColumnDef[] = [
  { id: "todo", label: "To do" },
  { id: "doing", label: "In progress" },
  { id: "done", label: "Done" },
];

export const PlanningList = () => {
  const [view, setView] = useState<"kanban" | "calendar">("kanban");
  return (
    <List resource="tasks" perPage={100} pagination={false}>
      <div className="mb-4 flex gap-2">
        <Button
          onClick={() => setView("kanban")}
          variant={view === "kanban" ? "default" : "outline"}
        >
          Kanban
        </Button>
        <Button
          onClick={() => setView("calendar")}
          variant={view === "calendar" ? "default" : "outline"}
        >
          Calendar
        </Button>
      </div>
      {view === "kanban" ? (
        <KanbanBoard
          groupBy="status"
          columns={COLUMNS}
          titleSource="title"
          descriptionSource="description"
          cardRenderer={(record: RaRecord) => (
            <RecordContextProvider value={record}>
              <div className="flex flex-col gap-1">
                <div className="text-sm font-medium leading-none">
                  {String(record.title ?? "")}
                </div>
                {record.description && (
                  <div className="text-xs text-muted-foreground truncate">
                    {String(record.description)}
                  </div>
                )}
                {record.estimated_duration_minutes && (
                  <div className="text-xs text-muted-foreground">
                    <DurationField source="estimated_duration_minutes" />
                  </div>
                )}
              </div>
            </RecordContextProvider>
          )}
        />
      ) : (
        <CalendarList startSource="dueDate" titleSource="title" />
      )}
    </List>
  );
};
