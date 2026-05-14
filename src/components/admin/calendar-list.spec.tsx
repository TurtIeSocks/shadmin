import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";
import { Basic } from "@/stories/calendar-list.stories";

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
    await expect
      .element(screen.getByText(/standup/i))
      .toBeInTheDocument();
    await expect
      .element(screen.getByText(/demo/i))
      .toBeInTheDocument();
    await expect
      .element(screen.getByText(/retro/i))
      .toBeInTheDocument();
  });
});
