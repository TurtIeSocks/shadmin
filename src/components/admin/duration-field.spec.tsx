import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import {
  Basic,
  DaysHours,
  Empty,
  Relative,
} from "@/stories/admin/duration-field.stories";

describe("<DurationField />", () => {
  it("renders '2h 30m' for PT2H30M", async () => {
    const screen = render(<Basic />);
    await expect.element(screen.getByText("2h 30m")).toBeInTheDocument();
  });

  it("renders '1d 4h' for P1DT4H", async () => {
    const screen = render(<DaysHours />);
    await expect.element(screen.getByText("1d 4h")).toBeInTheDocument();
  });

  it("renders a relative phrase when displayFormat='relative'", async () => {
    const screen = render(<Relative />);
    await expect.element(screen.getByText(/45 minutes/i)).toBeInTheDocument();
  });

  it("renders empty fallback for null", async () => {
    const screen = render(<Empty />);
    await expect.element(screen.getByText("—")).toBeInTheDocument();
  });
});
