import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import {
  Basic,
  WithLabel,
  WithHelperText,
} from "@/components/admin/inputs/image-input.stories";

describe("<ImageInput />", () => {
  it("renders the image input with the humanized field label", async () => {
    const screen = render(<Basic />);
    await expect
      .element(screen.getByText(/picture/i).first())
      .toBeInTheDocument();
  });

  it("uses an explicit label when provided", async () => {
    const screen = render(<WithLabel />);
    await expect
      .element(screen.getByText(/product photos/i))
      .toBeInTheDocument();
  });

  it("renders helper text when provided", async () => {
    const screen = render(<WithHelperText />);
    await expect
      .element(screen.getByText(/jpg or png, up to 5mb each/i))
      .toBeInTheDocument();
  });
});
