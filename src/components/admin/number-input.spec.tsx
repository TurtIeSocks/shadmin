import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import {
  Basic,
  Disabled,
  Step,
} from "@/stories/admin/number-input.stories";

describe("<NumberInput />", () => {
  it("renders a number input with the humanized field label", async () => {
    const screen = render(<Basic />);
    const input = screen.getByLabelText(/^price$/i);
    await expect.element(input).toBeInTheDocument();
    await expect.element(input).toHaveAttribute("type", "number");
  });

  it("respects the disabled prop", async () => {
    const screen = render(<Disabled />);
    await expect.element(screen.getByLabelText(/^price$/i)).toBeDisabled();
  });

  it("forwards the step attribute to the underlying input", async () => {
    const screen = render(<Step />);
    await expect
      .element(screen.getByLabelText(/^price$/i))
      .toHaveAttribute("step", "0.01");
  });
});
