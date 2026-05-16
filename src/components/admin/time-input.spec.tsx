import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import {
  Basic,
  DefaultValue,
  Label,
  Disabled,
  ReadOnly,
} from "@/stories/admin/time-input.stories";

describe("<TimeInput />", () => {
  it("renders a native time input with the source-derived label", async () => {
    const screen = render(<Basic />);
    const input = await screen.getByLabelText(/opens at/i);
    await expect.element(input).toHaveAttribute("type", "time");
  });

  it("renders the provided defaultValue", async () => {
    const screen = render(<DefaultValue />);
    const input = await screen.getByLabelText(/opens at/i);
    await expect.element(input).toHaveValue("09:30");
  });

  it("accepts a custom label", async () => {
    const screen = render(<Label />);
    const input = await screen.getByLabelText("Opening time");
    await expect.element(input).toBeInTheDocument();
  });

  it("renders as disabled", async () => {
    const screen = render(<Disabled />);
    const input = await screen.getByLabelText(/opens at/i);
    await expect.element(input).toBeDisabled();
  });

  it("renders as readOnly", async () => {
    const screen = render(<ReadOnly />);
    const input = await screen.getByLabelText(/opens at/i);
    await expect.element(input).toHaveAttribute("readonly");
  });
});
