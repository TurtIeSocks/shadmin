import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import { Basic } from "@/stories/wizard-form.stories";

describe("<WizardForm />", () => {
  it("should render the dialog when isOpen is true", async () => {
    const screen = render(<Basic theme="system" />);
    await expect
      .element(screen.getByRole("dialog"))
      .toBeInTheDocument();
  });

  it("should render the title in the dialog header", async () => {
    const screen = render(<Basic theme="system" />);
    await expect
      .element(screen.getByText("Create a product"))
      .toBeInTheDocument();
  });
});
