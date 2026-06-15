import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import { Basic } from "./translatable-fields.stories";

describe("<TranslatableFields />", () => {
  it("renders the value for the default locale", async () => {
    const screen = render(<Basic theme="system" />);
    // Default locale is the first one (en) -> "Hello"
    await expect.element(screen.getByText("Hello")).toBeInTheDocument();
    await expect
      .element(screen.getByText("A friendly greeting"))
      .toBeInTheDocument();
  });

  it("renders a tab per supplied locale", async () => {
    const screen = render(<Basic theme="system" />);
    // Tabs render the locale code (en, fr, tlh)
    await expect
      .element(screen.getByRole("tab", { name: "en" }))
      .toBeInTheDocument();
    await expect
      .element(screen.getByRole("tab", { name: "fr" }))
      .toBeInTheDocument();
    await expect
      .element(screen.getByRole("tab", { name: "tlh" }))
      .toBeInTheDocument();
  });
});
