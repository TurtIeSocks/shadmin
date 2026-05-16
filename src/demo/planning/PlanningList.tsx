import { useState } from "react";
import {
  CalendarList,
  KanbanBoard,
  List,
  type KanbanColumnDef,
} from "@/components/admin";
import { Button } from "@/components/ui/button";

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
        />
      ) : (
        <CalendarList startSource="dueDate" titleSource="title" />
      )}
    </List>
  );
};
