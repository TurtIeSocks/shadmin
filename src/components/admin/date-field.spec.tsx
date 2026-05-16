import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import { Basic, ShowTime } from "@/stories/admin/date-field.stories";

describe("<DateField />", () => {
  it("renders the formatted date for the record source", async () => {
    const screen = render(<Basic />);
    // Locale-dependent: assert on the year (2025) which is in every common format
    await expect.element(screen.getByText(/2025/)).toBeInTheDocument();
  });

  it("renders date and time when showTime is set", async () => {
    const screen = render(<ShowTime />);
    // Locale-dependent: assert on year plus a colon (time separator)
    await expect.element(screen.getByText(/2025.*:/)).toBeInTheDocument();
  });
});
