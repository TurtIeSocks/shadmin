import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import {
  Basic,
  Standalone,
  WithDescription,
  WithError,
} from "@/stories/admin/form.stories";

describe("<Form />", () => {
  it("renders a label wired to the control via htmlFor", async () => {
    const screen = render(<Basic />);
    const input = screen.getByLabelText(/title/i);
    await expect.element(input).toBeInTheDocument();
    await expect.element(input).toHaveAttribute("id", "title");
  });

  it("renders the description with the matching aria-describedby", async () => {
    const screen = render(<WithDescription />);
    const input = screen.getByLabelText(/slug/i);
    await expect.element(input).toHaveAttribute("aria-describedby");
    await expect
      .element(screen.getByText(/unique URL fragment/i))
      .toBeInTheDocument();
  });

  it("marks the FormField with role=group", async () => {
    const screen = render(<Basic />);
    await expect.element(screen.getByRole("group")).toBeInTheDocument();
  });

  it("exposes the error message and sets aria-invalid when invalid", async () => {
    const screen = render(<WithError />);
    const input = screen.getByLabelText(/email/i);
    await expect.element(screen.getByText(/email is required/i)).toBeVisible();
    await expect.element(input).toHaveAttribute("aria-invalid", "true");
  });

  it("works standalone with react-hook-form (no ra-core context)", async () => {
    const screen = render(<Standalone />);
    await expect
      .element(screen.getByLabelText(/first name/i))
      .toHaveValue("Ada");
    await expect
      .element(screen.getByLabelText(/last name/i))
      .toHaveValue("Lovelace");
  });
});
