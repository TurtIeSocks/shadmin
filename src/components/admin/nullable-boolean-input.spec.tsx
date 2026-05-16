import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import {
  Basic,
  Disabled,
  Label,
} from "@/stories/admin/nullable-boolean-input.stories";

describe("<NullableBooleanInput />", () => {
  it("renders the select trigger with the humanized field label", async () => {
    const screen = render(<Basic />);
    await expect
      .element(screen.getByText(/is published/i))
      .toBeInTheDocument();
    await expect.element(screen.getByRole("combobox")).toBeInTheDocument();
  });

  it("respects the disabled prop", async () => {
    const screen = render(<Disabled />);
    await expect.element(screen.getByRole("combobox")).toBeDisabled();
  });

  it("renders the explicit label when provided", async () => {
    const screen = render(<Label />);
    await expect
      .element(screen.getByText(/published\?/i))
      .toBeInTheDocument();
  });
});
