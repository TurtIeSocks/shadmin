import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import { Basic, CustomTitle, NoActions } from "./edit.stories";

describe("<Edit />", () => {
  it("loads the record into the form fields", async () => {
    const screen = render(<Basic />);
    await expect
      .element(screen.getByLabelText(/^title$/i))
      .toHaveValue("Hello world");
    await expect
      .element(screen.getByLabelText(/^body$/i))
      .toHaveValue("Lorem ipsum");
  });

  it("renders the explicit title when provided", async () => {
    const screen = render(<CustomTitle />);
    await expect.element(screen.getByText("Editing post")).toBeInTheDocument();
  });

  it("does not render the default action buttons when actions={false}", async () => {
    const screen = render(<NoActions />);
    await expect.element(screen.getByLabelText(/^title$/i)).toBeInTheDocument();
    // Default actions include a Show link — it should not appear when
    // actions={false}.
    await expect
      .element(screen.getByRole("link", { name: /show/i }))
      .not.toBeInTheDocument();
  });
});
