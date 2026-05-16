import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import {
  Basic,
  WithHelperText,
} from "@/stories/admin/loading-input.stories";

describe("<LoadingInput />", () => {
  it("renders a disabled, aria-busy placeholder input with the label", async () => {
    const screen = render(<Basic />);
    await expect.element(screen.getByText("Title")).toBeInTheDocument();
    const input = screen.getByRole("textbox");
    await expect.element(input).toBeDisabled();
    await expect.element(input).toHaveAttribute("aria-busy");
  });

  it("renders the helper text when provided", async () => {
    const screen = render(<WithHelperText />);
    await expect
      .element(screen.getByText(/fetching choices/i))
      .toBeInTheDocument();
  });
});
