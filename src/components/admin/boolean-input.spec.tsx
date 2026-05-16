import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import {
  Basic,
  Disabled,
  Label,
  ReadOnly,
} from "@/stories/admin/boolean-input.stories";

describe("<BooleanInput />", () => {
  it("renders the switch with the humanized field label", async () => {
    const screen = render(<Basic />);
    await expect
      .element(screen.getByLabelText(/is published/i))
      .toBeInTheDocument();
  });

  it("respects the disabled prop", async () => {
    const screen = render(<Disabled />);
    await expect
      .element(screen.getByLabelText(/is published/i))
      .toBeDisabled();
  });

  it("disables the switch in readOnly mode", async () => {
    const screen = render(<ReadOnly />);
    await expect
      .element(screen.getByLabelText(/is published/i))
      .toBeDisabled();
  });

  it("renders the explicit label when provided", async () => {
    const screen = render(<Label />);
    await expect
      .element(screen.getByLabelText(/published\?/i))
      .toBeInTheDocument();
  });
});
