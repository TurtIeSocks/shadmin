import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import {
  Default,
  CustomLabel,
  ResourceSpecificLabel,
} from "@/stories/admin/list-button.stories";

describe("<ListButton />", () => {
  it("renders the default list-button label", async () => {
    const screen = render(<Default />);
    await expect
      .element(screen.getByRole("link", { name: "List" }))
      .toBeInTheDocument();
  });

  it("renders a custom label when provided", async () => {
    const screen = render(<CustomLabel />);
    await expect
      .element(screen.getByRole("link", { name: "All Posts" }))
      .toBeInTheDocument();
  });

  it("renders a resource-specific label from the i18n provider", async () => {
    const screen = render(<ResourceSpecificLabel />);
    await expect
      .element(screen.getByRole("link", { name: "Back to posts" }))
      .toBeInTheDocument();
  });
});
