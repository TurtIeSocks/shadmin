import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import {
  Basic,
  Empty,
  ExprOnly,
  Invalid,
} from "@/stories/admin/cron-field.stories";

describe("<CronField />", () => {
  it("renders a human phrase for a valid expression", async () => {
    const screen = render(<Basic />);
    // 0 9 * * 1-5 → "At 09:00, Monday through Friday"
    await expect.element(screen.getByText(/09:00/i)).toBeInTheDocument();
  });

  it("shows the raw expression in monospace when showExpression", async () => {
    const screen = render(<ExprOnly />);
    await expect
      .element(screen.getByText("*/15 * * * *"))
      .toBeInTheDocument();
  });

  it("renders the raw value when the cron is unparseable", async () => {
    const screen = render(<Invalid />);
    await expect.element(screen.getByText("not-a-cron")).toBeInTheDocument();
  });

  it("renders empty fallback when value is null", async () => {
    const screen = render(<Empty />);
    await expect.element(screen.getByText("No schedule")).toBeInTheDocument();
  });
});
