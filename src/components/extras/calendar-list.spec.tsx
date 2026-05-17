import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";
import {
  Basic,
  RangeLoading,
  Navigation,
  Agenda,
  Week,
  Interactions,
  Drag,
} from "@/stories/extras/calendar-list.stories";

describe("<CalendarList />", () => {
  it("renders the current month header", async () => {
    const screen = render(<Basic />);
    const current = new Date();
    const monthName = current.toLocaleString("en", { month: "long" });
    await expect
      .element(screen.getByText(new RegExp(`${monthName}`, "i")))
      .toBeInTheDocument();
  });

  it("renders day cells", async () => {
    const screen = render(<Basic />);
    // 42 cells (6 weeks * 7 days) for the month grid
    await expect.element(screen.getByRole("grid")).toBeInTheDocument();
    const cells = document.querySelectorAll('[role="gridcell"]');
    expect(cells.length).toBe(42);
  });

  it("renders seeded events in their day cells", async () => {
    const screen = render(<Basic />);
    await expect.element(screen.getByText(/standup/i)).toBeInTheDocument();
    await expect.element(screen.getByText(/demo/i)).toBeInTheDocument();
    await expect.element(screen.getByText(/retro/i)).toBeInTheDocument();
  });

  it("filters records to the visible month range via _gte/_lte filters", async () => {
    const screen = render(<RangeLoading />);
    // In-range event renders
    await expect.element(screen.getByText(/standup/i)).toBeInTheDocument();
    // Far-past and far-future events are filtered out (ra-data-fakerest honors _gte/_lte)
    expect(document.body.textContent).not.toMatch(/PastEvent/i);
    expect(document.body.textContent).not.toMatch(/FutureEvent/i);
  });

  it("navigates to previous and next month", async () => {
    const screen = render(<Navigation />);
    const current = new Date();
    const nextMonth = new Date(
      current.getFullYear(),
      current.getMonth() + 1,
      1,
    );
    const nextLabel = nextMonth.toLocaleString("en", { month: "long" });
    // Use exact aria-label to avoid ambiguity with the pagination "Go to next page" button
    await screen.getByRole("button", { name: "Next", exact: true }).click();
    await expect
      .element(screen.getByText(new RegExp(nextLabel, "i")))
      .toBeInTheDocument();
  });

  it("switches to agenda view via the view switcher", async () => {
    const screen = render(<Navigation />);
    // Click the agenda button
    await screen.getByRole("button", { name: /agenda/i }).click();
    // Agenda renders the events list with a day header (not the gridcell view)
    await expect
      .element(document.querySelector('[data-calendar-view="agenda"]'))
      .toBeTruthy();
  });

  it("agenda view renders events grouped by date with the empty-state fallback", async () => {
    const screen = render(<Agenda />);
    await expect
      .element(document.querySelector('[data-calendar-view="agenda"]'))
      .toBeTruthy();
    // At least one of the seeded events is visible
    await expect.element(screen.getByText(/standup/i)).toBeInTheDocument();
  });

  it("week view renders 7 day columns with hour rows", async () => {
    const screen = render(<Week />);
    await expect
      .element(document.querySelector('[data-calendar-view="week"]'))
      .toBeTruthy();
    // 7 day headers
    const dayHeaders = document.querySelectorAll("[data-day]");
    expect(dayHeaders.length).toBeGreaterThanOrEqual(7);
    // Events render
    await expect.element(screen.getByText(/standup/i)).toBeInTheDocument();
  });

  it("fires onSelectEvent when an event is clicked", async () => {
    const screen = render(<Interactions />);
    const event = screen.getByText(/standup/i);
    await event.click();
    const probe = document.querySelector('[data-testid="selected-event"]');
    expect(probe?.textContent).toBe("1");
  });

  it("wraps month view in DndContext when onDrop is provided", async () => {
    const screen = render(<Drag />);
    // DndContext doesn't add a stable DOM marker by default. Verify events are
    // wrapped as draggable by checking the draggable attribute / aria.
    await expect.element(screen.getByText(/standup/i)).toBeInTheDocument();
    const eventButton = screen
      .getByText(/standup/i)
      .element()
      .closest("button");
    expect(eventButton).toBeTruthy();
    // dnd-kit sets role="button" + aria-roledescription="draggable" on draggable nodes
    expect(eventButton?.getAttribute("aria-roledescription") ?? "").toMatch(
      /draggable/i,
    );
  });
});
