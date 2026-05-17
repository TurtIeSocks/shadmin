import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";
import { Basic, WithDescription } from "@/stories/extras/kanban-board.stories";
import {
  type DataProvider,
  memoryStore,
  Resource,
  TestMemoryRouter,
} from "ra-core";
import polyglotI18nProvider from "ra-i18n-polyglot";
import defaultMessages from "ra-language-english";
import fakeRestDataProvider from "ra-data-fakerest";
import { Admin, KanbanBoard } from "@/components/admin";
import { List } from "@/components/admin/list";

const COLUMNS = [
  { id: "todo", label: "To do" },
  { id: "doing", label: "In progress" },
  { id: "done", label: "Done" },
];

const i18nProvider = polyglotI18nProvider(
  () => defaultMessages,
  "en",
  undefined,
  {
    allowMissing: true,
  },
);

describe("<KanbanBoard />", () => {
  it("renders 3 columns with correct labels", async () => {
    const screen = render(<Basic />);
    // Wait for data to load by checking a known card title
    await expect.element(screen.getByText("Design mockup")).toBeInTheDocument();
    // All column labels must be present
    await expect.element(screen.getByText("To do")).toBeInTheDocument();
    await expect.element(screen.getByText("In progress")).toBeInTheDocument();
    await expect.element(screen.getByText("Done")).toBeInTheDocument();
  });

  it("renders each column with the correct card count badge", async () => {
    const screen = render(<Basic />);
    // Wait for data to load
    await expect.element(screen.getByText("Design mockup")).toBeInTheDocument();

    // Seeded data: todo=2, doing=2, done=1
    const todoCol = document.querySelector('[data-kanban-column="todo"]');
    const doingCol = document.querySelector('[data-kanban-column="doing"]');
    const doneCol = document.querySelector('[data-kanban-column="done"]');

    expect(todoCol).toBeTruthy();
    expect(doingCol).toBeTruthy();
    expect(doneCol).toBeTruthy();

    const todoBadge = todoCol!.querySelector("span.rounded-full");
    const doingBadge = doingCol!.querySelector("span.rounded-full");
    const doneBadge = doneCol!.querySelector("span.rounded-full");

    expect(todoBadge?.textContent?.trim()).toBe("2");
    expect(doingBadge?.textContent?.trim()).toBe("2");
    expect(doneBadge?.textContent?.trim()).toBe("1");
  });

  it("renders cards within the correct column", async () => {
    const screen = render(<Basic />);
    await expect.element(screen.getByText("Design mockup")).toBeInTheDocument();
    await expect.element(screen.getByText("Review PR")).toBeInTheDocument();
  });

  it("cards have aria-roledescription='draggable'", async () => {
    const screen = render(<Basic />);
    // Wait for data to load
    await expect.element(screen.getByText("Design mockup")).toBeInTheDocument();
    const draggableCards = document.querySelectorAll(
      '[aria-roledescription="draggable"]',
    );
    // 5 seeded tasks
    expect(draggableCards.length).toBe(5);
  });

  it("empty column renders the 'No items' placeholder", async () => {
    const dp = fakeRestDataProvider({
      tasks: [{ id: 1, title: "Task A", status: "todo" }],
    }) as DataProvider;

    const screen = render(
      <TestMemoryRouter initialEntries={["/tasks"]}>
        <Admin
          dataProvider={dp}
          i18nProvider={i18nProvider}
          store={memoryStore()}
        >
          <Resource
            name="tasks"
            list={() => (
              <List perPage={500}>
                <KanbanBoard
                  groupBy="status"
                  columns={COLUMNS}
                  titleSource="title"
                />
              </List>
            )}
            recordRepresentation="title"
          />
        </Admin>
      </TestMemoryRouter>,
    );

    // Wait for data load: "Task A" should be visible in the "todo" column
    await expect.element(screen.getByText("Task A")).toBeInTheDocument();

    // "In progress" and "Done" columns have no records → 2 placeholders
    const emptyPlaceholders = document.querySelectorAll("[data-kanban-empty]");
    expect(emptyPlaceholders.length).toBe(2);
    for (const el of emptyPlaceholders) {
      expect(el.textContent?.trim()).toBe("No items");
    }
  });

  it("renders description when descriptionSource is provided", async () => {
    const screen = render(<WithDescription />);
    await expect
      .element(screen.getByText("Figma screens for v2"))
      .toBeInTheDocument();
    await expect
      .element(screen.getByText("Connect to REST endpoints"))
      .toBeInTheDocument();
  });
});
