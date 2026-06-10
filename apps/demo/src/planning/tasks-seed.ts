// Fake seed data for the `tasks` demo resource.
// Spread due dates across the current month so the calendar/kanban
// views are populated without empty days.

const now = new Date();
const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

const dayInMonth = (day: number): string => {
  const d = new Date(monthStart);
  d.setDate(day);
  d.setHours(9, 0, 0, 0);
  return d.toISOString();
};

export type Task = {
  id: number;
  title: string;
  description: string;
  status: "todo" | "doing" | "done";
  dueDate: string;
  assignee: string;
  priority: "low" | "medium" | "high";
  /**
   * Stored as an ISO-8601 duration string (e.g. `PT2H30M`) so the
   * `<DurationField>` and `<DurationInput>` components can parse/render it.
   * Name keeps the `_minutes` suffix per the source-of-truth plan, even
   * though the on-the-wire value is an ISO string.
   */
  estimated_duration_minutes?: string;
};

/** Encode a minute count as an ISO-8601 duration string. */
const minutesToIso = (totalMinutes: number): string => {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  const hPart = h > 0 ? `${h}H` : "";
  const mPart = m > 0 ? `${m}M` : "";
  return hPart || mPart ? `PT${hPart}${mPart}` : "";
};

const rawSeed: Omit<Task, "estimated_duration_minutes">[] = [
  {
    id: 1,
    title: "Migrate auth provider to OIDC",
    description: "Swap the local JWT flow for the new identity service.",
    status: "doing",
    dueDate: dayInMonth(3),
    assignee: "Alex Chen",
    priority: "high",
  },
  {
    id: 2,
    title: "Audit color tokens for AA contrast",
    description: "Run axe-core across the demo and patch failing pairs.",
    status: "todo",
    dueDate: dayInMonth(5),
    assignee: "Priya Shah",
    priority: "medium",
  },
  {
    id: 3,
    title: "Design empty states for data tables",
    description: "Illustrations + copy for the 4 most common empty states.",
    status: "done",
    dueDate: dayInMonth(7),
    assignee: "Marco Rossi",
    priority: "low",
  },
  {
    id: 4,
    title: "Add server-side pagination to /orders",
    description: "Replace client-side slice with cursor-based fetch.",
    status: "doing",
    dueDate: dayInMonth(9),
    assignee: "Sam Patel",
    priority: "high",
  },
  {
    id: 5,
    title: "Write Storybook stories for KanbanBoard",
    description: "Cover drag/drop, custom card renderer, and empty column.",
    status: "todo",
    dueDate: dayInMonth(11),
    assignee: "Jules Martin",
    priority: "medium",
  },
  {
    id: 6,
    title: "Triage backlog of dependency PRs",
    description: "Close stale Renovate PRs and bump major versions.",
    status: "done",
    dueDate: dayInMonth(12),
    assignee: "Alex Chen",
    priority: "low",
  },
  {
    id: 7,
    title: "Spec the bulk-export CSV format",
    description: "Decide separator, quoting, and date encoding.",
    status: "todo",
    dueDate: dayInMonth(15),
    assignee: "Priya Shah",
    priority: "medium",
  },
  {
    id: 8,
    title: "Investigate flaky e2e on Firefox",
    description: "Two specs intermittently time out on the form submit.",
    status: "doing",
    dueDate: dayInMonth(17),
    assignee: "Marco Rossi",
    priority: "high",
  },
  {
    id: 9,
    title: "Refresh marketing screenshots",
    description: "Re-shoot the landing page hero with the new theme.",
    status: "todo",
    dueDate: dayInMonth(19),
    assignee: "Jules Martin",
    priority: "low",
  },
  {
    id: 10,
    title: "Document the auth callback flow",
    description: "Sequence diagram + sample provider implementation.",
    status: "done",
    dueDate: dayInMonth(21),
    assignee: "Sam Patel",
    priority: "medium",
  },
  {
    id: 11,
    title: "Profile the dashboard render",
    description: "First paint regressed by ~120ms after the chart rewrite.",
    status: "todo",
    dueDate: dayInMonth(23),
    assignee: "Alex Chen",
    priority: "high",
  },
  {
    id: 12,
    title: "Replace lodash.merge with native spread",
    description: "Drop one of the last legacy dependencies.",
    status: "done",
    dueDate: dayInMonth(25),
    assignee: "Priya Shah",
    priority: "low",
  },
  {
    id: 13,
    title: "Wire i18n into the planning resource",
    description: "Add resources.tasks.* keys and translate column headers.",
    status: "doing",
    dueDate: dayInMonth(27),
    assignee: "Marco Rossi",
    priority: "medium",
  },
];

export const tasksSeed: Task[] = rawSeed.map((task, i) => ({
  ...task,
  estimated_duration_minutes: minutesToIso(30 + ((i * 17) % 480)),
}));
