import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import {
  Basic,
  WithAside,
  WithoutHeading,
} from "@/components/admin/auth/auth-layout.stories";

describe("<AuthLayout />", () => {
  it("renders the title and child content", async () => {
    const screen = render(<Basic />);
    await expect
      .element(screen.getByRole("heading", { name: "Sign in" }))
      .toBeInTheDocument();
    await expect
      .element(screen.getByText(/your custom form would go here/i))
      .toBeInTheDocument();
  });

  it("renders the aside pane when provided", async () => {
    const screen = render(<WithAside />);
    await expect.element(screen.getByText("Acme Inc")).toBeInTheDocument();
  });

  it("renders without a heading when title and subtitle are omitted", async () => {
    const screen = render(<WithoutHeading />);
    await expect
      .element(screen.getByText(/custom heading inside content/i))
      .toBeInTheDocument();
  });
});
